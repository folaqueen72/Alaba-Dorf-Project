import { prisma } from "@/lib/prisma";
import { adminGuard } from "@/lib/adminGuard";
import { logActivity } from "@/lib/activity";

export async function GET(req: Request) {
  const gate = await adminGuard(req, ["FARM"]);
  if ("error" in gate) return gate.error;
  const inv = await prisma.eggInventory.findUnique({
    where: { id: "eggs" },
  });
  return Response.json({ inventory: inv });
}

export async function PATCH(req: Request) {
  const gate = await adminGuard(req, ["FARM"]);
  if ("error" in gate) return gate.error;
  const body = await req.json().catch(() => null);
  const { totalCrates, pricePerCrate, status } = body ?? {};
  try {
    const before = await prisma.eggInventory.findUnique({
      where: { id: "eggs" },
    });
    if (!before) throw new Error("Egg inventory missing — run seed.");
    if (
      totalCrates !== undefined &&
      (!Number.isInteger(totalCrates) || totalCrates < 0)
    )
      throw new Error("Total crates must be a whole number.");
    if (
      pricePerCrate !== undefined &&
      (!Number.isInteger(pricePerCrate) || pricePerCrate < 0)
    )
      throw new Error("Price must be in kobo.");
    const after = await prisma.eggInventory.update({
      where: { id: "eggs" },
      data: {
        ...(totalCrates !== undefined ? { totalCrates } : {}),
        ...(pricePerCrate !== undefined ? { pricePerCrate } : {}),
        ...(status ? { status } : {}),
      },
    });
    await logActivity(prisma, {
      actorId: gate.user.id,
      action: "egg stock updated",
      entity: "egg_inventory",
      entityId: "eggs",
      before: {
        totalCrates: before.totalCrates,
        pricePerCrate: before.pricePerCrate,
      } as never,
      after: {
        totalCrates: after.totalCrates,
        pricePerCrate: after.pricePerCrate,
      } as never,
    });
    return Response.json({ inventory: after });
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : "Update failed." },
      { status: 400 }
    );
  }
}
