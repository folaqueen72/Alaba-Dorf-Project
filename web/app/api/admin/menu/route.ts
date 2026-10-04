import { prisma } from "@/lib/prisma";
import { adminGuard } from "@/lib/adminGuard";
import { logActivity } from "@/lib/activity";

export async function GET(req: Request) {
  const gate = await adminGuard(req, ["EATERY"]);
  if ("error" in gate) return gate.error;
  const items = await prisma.menuItem.findMany({
    orderBy: { name: "asc" },
  });
  return Response.json({ items });
}

export async function POST(req: Request) {
  const gate = await adminGuard(req, ["EATERY"]);
  if ("error" in gate) return gate.error;
  const body = await req.json().catch(() => null);
  const { name, price, description, imageKey } = body ?? {};
  try {
    if (!name?.trim()) throw new Error("Name is required.");
    if (!(Number(price) > 0)) throw new Error("Price is required (kobo).");
    const item = await prisma.menuItem.create({
      data: {
        name: name.trim(),
        price: Math.round(Number(price)),
        description,
        imageKey,
      },
    });
    await logActivity(prisma, {
      actorId: gate.user.id,
      action: "menu item added",
      entity: "menu_item",
      entityId: item.name,
      after: { price: item.price } as never,
    });
    return Response.json({ item });
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : "Create failed." },
      { status: 400 }
    );
  }
}

export async function PATCH(req: Request) {
  const gate = await adminGuard(req, ["EATERY"]);
  if ("error" in gate) return gate.error;
  const body = await req.json().catch(() => null);
  const { id, name, price, description, imageKey, available } = body ?? {};
  try {
    const before = await prisma.menuItem.findUnique({ where: { id } });
    if (!before) throw new Error("Menu item not found.");
    const after = await prisma.menuItem.update({
      where: { id },
      data: {
        ...(name !== undefined ? { name: name.trim() } : {}),
        ...(price !== undefined
          ? { price: Math.round(Number(price)) }
          : {}),
        ...(description !== undefined ? { description } : {}),
        ...(imageKey !== undefined ? { imageKey } : {}),
        ...(available !== undefined ? { available: !!available } : {}),
      },
    });
    await logActivity(prisma, {
      actorId: gate.user.id,
      action: "menu item updated",
      entity: "menu_item",
      entityId: after.name,
      before: { price: before.price, available: before.available } as never,
      after: { price: after.price, available: after.available } as never,
    });
    return Response.json({ item: after });
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : "Update failed." },
      { status: 400 }
    );
  }
}
