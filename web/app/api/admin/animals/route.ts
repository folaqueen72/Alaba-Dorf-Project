import { prisma } from "@/lib/prisma";
import { adminGuard } from "@/lib/adminGuard";
import { logActivity } from "@/lib/activity";

export async function GET(req: Request) {
  const gate = await adminGuard(req, ["FARM"]);
  if ("error" in gate) return gate.error;
  const animals = await prisma.animal.findMany({
    include: {
      _count: { select: { reservations: true } },
    },
    orderBy: { tag: "asc" },
  });
  return Response.json({
    animals: animals.map((a) => ({
      ...a,
      totalKg: Number(a.totalKg),
      availableKg: Number(a.availableKg),
    })),
  });
}

export async function POST(req: Request) {
  const gate = await adminGuard(req, ["FARM"]);
  if ("error" in gate) return gate.error;
  const body = await req.json().catch(() => null);
  const { type, tag, totalKg, pricePerKg, description, imageKey, livePrice, liveStock } =
    body ?? {};
  try {
    if (type !== "COW" && type !== "PIG" && type !== "TURKEY" && type !== "BROILER")
      throw new Error("Pick cow, pig, turkey or broiler.");
    if (!tag?.trim()) throw new Error("Tag is required (e.g. Cow #025).");
    if (!(Number(totalKg) > 0)) throw new Error("Total weight is required.");
    const animal = await prisma.animal.create({
      data: {
        type,
        tag: tag.trim(),
        totalKg: Number(totalKg),
        availableKg: Number(totalKg),
        pricePerKg: Math.round(Number(pricePerKg) || 0),
        livePrice:
          livePrice === undefined || livePrice === ""
            ? undefined
            : Math.round(Number(livePrice)),
        liveStock:
          liveStock === undefined || liveStock === ""
            ? undefined
            : Math.round(Number(liveStock)),
        description,
        imageKey,
      },
    });
    await logActivity(prisma, {
      actorId: gate.user.id,
      action: "animal listed",
      entity: "animal",
      entityId: animal.tag,
      after: { totalKg: Number(totalKg) } as never,
    });
    return Response.json({ animal });
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : "Create failed." },
      { status: 400 }
    );
  }
}

export async function PATCH(req: Request) {
  const gate = await adminGuard(req, ["FARM"]);
  if ("error" in gate) return gate.error;
  const body = await req.json().catch(() => null);
  const { id, pricePerKg, status, finalKg, description, imageKey, livePrice, liveStock } =
    body ?? {};
  try {
    const before = await prisma.animal.findUnique({ where: { id } });
    if (!before) throw new Error("Animal not found.");
    let totalKg: number = Number(before.totalKg);
    let availableKg: number = Number(before.availableKg);
    if (finalKg !== undefined) {
      if (!(Number(finalKg) > 0)) throw new Error("Final weight is required.");
      const reserved = Number(before.totalKg) - Number(before.availableKg);
      if (Number(finalKg) < reserved)
        throw new Error(
          `Final weight cannot go below reserved ${reserved} kg.`
        );
      totalKg = Number(finalKg);
      availableKg = Number((Number(finalKg) - reserved).toFixed(2));
    }
    const after = await prisma.animal.update({
      where: { id },
      data: {
        totalKg,
        availableKg,
        ...(pricePerKg !== undefined
          ? { pricePerKg: Math.round(Number(pricePerKg)) }
          : {}),
        ...(livePrice !== undefined && livePrice !== ""
          ? { livePrice: Math.round(Number(livePrice)) }
          : {}),
        ...(liveStock !== undefined && liveStock !== ""
          ? { liveStock: Math.round(Number(liveStock)) }
          : {}),
        ...(status ? { status } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(imageKey !== undefined ? { imageKey } : {}),
      },
    });
    await logActivity(prisma, {
      actorId: gate.user.id,
      action: "animal updated",
      entity: "animal",
      entityId: before.tag,
      before: {
        totalKg: Number(before.totalKg),
        pricePerKg: before.pricePerKg,
      } as never,
      after: {
        totalKg: Number(after.totalKg),
        pricePerKg: after.pricePerKg,
      } as never,
    });
    return Response.json({ animal: after });
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : "Update failed." },
      { status: 400 }
    );
  }
}
