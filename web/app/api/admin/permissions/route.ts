import { prisma } from "@/lib/prisma";
import { adminGuard } from "@/lib/adminGuard";
import { logActivity } from "@/lib/activity";

const RESOURCES = [
  "orders",
  "bookings",
  "payments",
  "stock",
  "prices",
  "products",
  "customers",
  "reports",
];
const ACTIONS = ["view", "create", "edit", "status", "manage"];

// GET /api/admin/permissions?userId= → {grants: ["orders:view", ...]}
export async function GET(req: Request) {
  const gate = await adminGuard(req);
  if ("error" in gate) return gate.error;
  if (gate.profile.role !== "TOP")
    return Response.json({ error: "Only Top Admins." }, { status: 403 });
  const userId = new URL(req.url).searchParams.get("userId");
  if (!userId) return Response.json({ error: "Missing user." }, { status: 400 });
  const rows = await prisma.permission.findMany({ where: { userId } });
  return Response.json({
    resources: RESOURCES,
    actions: ACTIONS,
    grants: rows.map((r) => `${r.resource}:${r.action}`),
  });
}

// PUT {userId, grants: ["orders:view", ...]} — replaces the matrix.
export async function PUT(req: Request) {
  const gate = await adminGuard(req);
  if ("error" in gate) return gate.error;
  if (gate.profile.role !== "TOP")
    return Response.json({ error: "Only Top Admins." }, { status: 403 });
  const body = await req.json().catch(() => null);
  try {
    const { userId, grants } = body ?? {};
    if (!userId || !Array.isArray(grants)) throw new Error("Invalid matrix.");
    const clean = grants.filter(
      (g: string) =>
        typeof g === "string" &&
        RESOURCES.includes(g.split(":")[0]) &&
        ACTIONS.includes(g.split(":")[1])
    );
    await prisma.$transaction(async (tx) => {
      await tx.permission.deleteMany({ where: { userId } });
      if (clean.length > 0) {
        await tx.permission.createMany({
          data: clean.map((g: string) => {
            const [resource, action] = g.split(":");
            return { userId, resource, action };
          }),
        });
      }
      await logActivity(tx, {
        actorId: gate.user.id,
        action: "permissions updated",
        entity: "admin",
        entityId: userId,
        after: { grants: clean } as never,
      });
    });
    return Response.json({ ok: true });
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : "Save failed." },
      { status: 400 }
    );
  }
}
