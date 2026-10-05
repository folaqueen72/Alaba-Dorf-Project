import { prisma } from "@/lib/prisma";
import { adminGuard } from "@/lib/adminGuard";
import { logActivity } from "@/lib/activity";

export async function GET(req: Request) {
  const gate = await adminGuard(req, ["STUDIO"]);
  if ("error" in gate) return gate.error;
  const sessions = await prisma.sessionType.findMany({
    orderBy: { durationMin: "asc" },
  });
  return Response.json({ sessions });
}

export async function POST(req: Request) {
  const gate = await adminGuard(req, ["STUDIO"]);
  if ("error" in gate) return gate.error;
  const body = await req.json().catch(() => null);
  const { name, durationMin, price, description } = body ?? {};
  try {
    if (!name?.trim()) throw new Error("Name is required.");
    if (!(Number(durationMin) > 0)) throw new Error("Duration is required.");
    if (!(Number(price) >= 0)) throw new Error("Price is required (kobo).");
    const session = await prisma.sessionType.create({
      data: {
        name: name.trim(),
        durationMin: Math.round(Number(durationMin)),
        price: Math.round(Number(price)),
        description,
      },
    });
    await logActivity(prisma, {
      actorId: gate.user.id,
      action: "session created",
      entity: "session_type",
      entityId: session.name,
    });
    return Response.json({ session });
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : "Create failed." },
      { status: 400 }
    );
  }
}

export async function PATCH(req: Request) {
  const gate = await adminGuard(req, ["STUDIO"]);
  if ("error" in gate) return gate.error;
  const body = await req.json().catch(() => null);
  const { id, name, durationMin, price, description, active } = body ?? {};
  try {
    const before = await prisma.sessionType.findUnique({ where: { id } });
    if (!before) throw new Error("Session not found.");
    const after = await prisma.sessionType.update({
      where: { id },
      data: {
        ...(name !== undefined ? { name: name.trim() } : {}),
        ...(durationMin !== undefined
          ? { durationMin: Math.round(Number(durationMin)) }
          : {}),
        ...(price !== undefined
          ? { price: Math.round(Number(price)) }
          : {}),
        ...(description !== undefined ? { description } : {}),
        ...(active !== undefined ? { active: !!active } : {}),
      },
    });
    await logActivity(prisma, {
      actorId: gate.user.id,
      action: "session updated",
      entity: "session_type",
      entityId: after.name,
      before: { price: before.price } as never,
      after: { price: after.price } as never,
    });
    return Response.json({ session: after });
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : "Update failed." },
      { status: 400 }
    );
  }
}
