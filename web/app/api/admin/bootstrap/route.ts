import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { logActivity } from "@/lib/activity";

// First-run only: creates the FIRST Top Admin. Returns 403 once any admin
// exists, so it cannot be reused afterwards.
export async function POST(req: Request) {
  const existing = await prisma.adminProfile.count();
  if (existing > 0)
    return Response.json(
      { error: "Setup is already complete." },
      { status: 403 }
    );
  const body = await req.json().catch(() => null);
  const { name, email, password } = body ?? {};
  try {
    if (!name?.trim() || !email?.trim() || !password || password.length < 8)
      throw new Error("Name, email and an 8+ character password are required.");
    const signup = await auth.api.signUpEmail({
      body: { name: name.trim(), email: email.trim(), password },
    });
    const userId = (signup as { user?: { id?: string } })?.user?.id;
    if (!userId) throw new Error("Account creation failed.");
    await prisma.adminProfile.create({
      data: { userId, role: "TOP", active: true },
    });
    await logActivity(prisma, {
      actorId: userId,
      action: "first admin created",
      entity: "admin",
      entityId: email,
    });
    return Response.json({ ok: true, email });
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : "Setup failed." },
      { status: 400 }
    );
  }
}
