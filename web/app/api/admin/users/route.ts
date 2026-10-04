import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { adminGuard } from "@/lib/adminGuard";
import { logActivity } from "@/lib/activity";
import type { AdminRole } from "@prisma/client";

// Default permission presets per department role (PRD §4).
const PRESETS: Record<Exclude<AdminRole, "TOP">, Array<[string, string]>> = {
  FARM: [
    ["orders", "view"],
    ["orders", "status"],
    ["payments", "view"],
    ["stock", "manage"],
    ["prices", "edit"],
    ["products", "edit"],
    ["customers", "view"],
    ["reports", "view"],
  ],
  EATERY: [
    ["orders", "view"],
    ["orders", "create"],
    ["orders", "status"],
    ["payments", "view"],
    ["products", "manage"],
    ["prices", "edit"],
    ["customers", "view"],
    ["reports", "view"],
  ],
  STUDIO: [
    ["bookings", "manage"],
    ["payments", "view"],
    ["products", "edit"],
    ["prices", "edit"],
    ["customers", "view"],
    ["reports", "view"],
  ],
};

export async function GET(req: Request) {
  const gate = await adminGuard(req);
  if ("error" in gate) return gate.error;
  if (gate.profile.role !== "TOP")
    return Response.json(
      { error: "Only Top Admins manage accounts." },
      { status: 403 }
    );
  const users = await prisma.user.findMany({
    where: { adminProfile: { isNot: null } },
    include: { adminProfile: true },
    orderBy: { createdAt: "asc" },
  });
  return Response.json({
    users: users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.adminProfile!.role,
      active: u.adminProfile!.active,
    })),
  });
}

// POST {name, email, password, role} — exactly two TOP slots enforced.
export async function POST(req: Request) {
  const gate = await adminGuard(req);
  if ("error" in gate) return gate.error;
  if (gate.profile.role !== "TOP")
    return Response.json(
      { error: "Only Top Admins manage accounts." },
      { status: 403 }
    );
  const body = await req.json().catch(() => null);
  const { name, email, password, role } = (body ?? {}) as {
    name?: string;
    email?: string;
    password?: string;
    role?: AdminRole;
  };
  try {
    if (!name?.trim() || !email?.trim() || !password || password.length < 8)
      throw new Error("Name, email and an 8+ character password are required.");
    if (role !== "TOP" && role !== "FARM" && role !== "EATERY" && role !== "STUDIO")
      throw new Error("Pick a valid role.");
    if (role === "TOP") {
      const tops = await prisma.adminProfile.count({
        where: { role: "TOP", active: true },
      });
      if (tops >= 2) throw new Error("Both Top Admin slots are taken.");
    }
    const signup = await auth.api.signUpEmail({
      body: { name: name.trim(), email: email.trim(), password },
    });
    const userId = (signup as { user?: { id?: string } })?.user?.id;
    if (!userId) throw new Error("Account creation failed.");
    await prisma.adminProfile.create({
      data: { userId, role, active: true },
    });
    if (role !== "TOP") {
      await prisma.permission.createMany({
        data: PRESETS[role].map(
          ([resource, action]: [string, string]) => ({
            userId,
            resource,
            action,
          })
        ),
        skipDuplicates: true,
      });
    }
    await logActivity(prisma, {
      actorId: gate.user.id,
      action: "admin created",
      entity: "admin",
      entityId: email,
      after: { role } as never,
    });
    return Response.json({ ok: true, email });
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : "Create failed." },
      { status: 400 }
    );
  }
}

// PATCH {userId, active?, role?}
export async function PATCH(req: Request) {
  const gate = await adminGuard(req);
  if ("error" in gate) return gate.error;
  if (gate.profile.role !== "TOP")
    return Response.json(
      { error: "Only Top Admins manage accounts." },
      { status: 403 }
    );
  const body = await req.json().catch(() => null);
  try {
    const profile = await prisma.adminProfile.findUnique({
      where: { userId: body.userId },
    });
    if (!profile) throw new Error("Admin not found.");
    if (body.userId === gate.user.id && body.active === false)
      throw new Error("You cannot deactivate yourself.");
    if (body.role === "TOP" && profile.role !== "TOP") {
      const tops = await prisma.adminProfile.count({
        where: { role: "TOP", active: true },
      });
      if (tops >= 2) throw new Error("Both Top Admin slots are taken.");
    }
    const updated = await prisma.adminProfile.update({
      where: { userId: body.userId },
      data: {
        ...(body.active !== undefined ? { active: !!body.active } : {}),
        ...(body.role ? { role: body.role } : {}),
      },
    });
    if (body.active === false) {
      await prisma.session.deleteMany({ where: { userId: body.userId } });
    }
    await logActivity(prisma, {
      actorId: gate.user.id,
      action: "admin updated",
      entity: "admin",
      entityId: body.userId,
      after: { active: updated.active, role: updated.role } as never,
    });
    return Response.json({ ok: true });
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : "Update failed." },
      { status: 400 }
    );
  }
}
