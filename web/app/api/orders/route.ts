import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import {
  assertCustomer,
  cleanPhone,
  findOrCreateCustomer,
  nextOrderNo,
} from "@/lib/orders";

// V1: delivery fee is flat and zero until the business configures it (Phase 4 settings).
const DELIVERY_FEE_KOBO = 0;

type Line =
  | { kind: "eggs"; crates: number }
  | { kind: "meat"; animalId: string; kg: number }
  | { kind: "food"; menuItemId: string; qty: number };

type Body = {
  dept: "FARM" | "EATERY";
  lines: Line[];
  customer: { name: string; phone: string; email?: string; address?: string };
  fulfillment: "PICKUP" | "DELIVERY";
};

export async function POST(req: Request) {
  let body: Body;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  try {
    if (body.dept !== "FARM" && body.dept !== "EATERY")
      throw new Error("Unknown department.");
    if (!Array.isArray(body.lines) || body.lines.length === 0)
      throw new Error("Your cart is empty.");
    assertCustomer(body.customer);
    if (body.fulfillment !== "PICKUP" && body.fulfillment !== "DELIVERY")
      throw new Error("Choose pickup or delivery.");
    if (body.fulfillment === "DELIVERY" && !body.customer.address?.trim())
      throw new Error("Delivery needs an address.");

    const result = await prisma.$transaction(async (tx) => {
      const customer = await findOrCreateCustomer(tx, body.customer);
      const items: Prisma.InputJsonValue[] = [];
      let subtotal = 0;

      for (const line of body.lines) {
        if (line.kind === "eggs") {
          const crates = Math.floor(line.crates);
          if (crates < 1) throw new Error("Crates must be at least 1.");
          const locked = await tx.$queryRaw<
            Array<{ pricePerCrate: number; available: number }>
          >`
            SELECT "pricePerCrate",
              ("totalCrates" - "reservedCrates" - "soldCrates") AS available
            FROM egg_inventory WHERE id = 'eggs' FOR UPDATE
          `;
          const inv = locked[0];
          if (!inv || inv.available < crates)
            throw new Error(
              `Only ${inv?.available ?? 0} crates left — reduce your quantity.`
            );
          await tx.eggInventory.update({
            where: { id: "eggs" },
            data: {
              reservedCrates: { increment: crates },
              status: inv.available - crates === 0 ? "SOLD_OUT" : undefined,
            },
          });
          const amount = crates * inv.pricePerCrate;
          subtotal += amount;
          items.push({
            kind: "eggs",
            name: "Table Eggs (crate)",
            qty: crates,
            unitPrice: inv.pricePerCrate,
          });
        } else if (line.kind === "meat") {
          const kg = Number(line.kg);
          if (!(kg > 0)) throw new Error("Kilos must be more than 0.");
          const locked = await tx.$queryRaw<
            Array<{ id: string; tag: string; availableKg: string; pricePerKg: number; status: string }>
          >`
            SELECT id, tag, "availableKg", "pricePerKg", status
            FROM animal WHERE id = ${line.animalId} FOR UPDATE
          `;
          const animal = locked[0];
          if (!animal || animal.status !== "AVAILABLE")
            throw new Error("That animal is no longer available.");
          if (Number(animal.availableKg) < kg)
            throw new Error(
              `Only ${animal.availableKg} kg left on ${animal.tag}.`
            );
          const remaining = Number(animal.availableKg) - kg;
          await tx.animal.update({
            where: { id: animal.id },
            data: {
              availableKg: remaining,
              status: remaining <= 0 ? "SOLD_OUT" : undefined,
            },
          });
          const amount = Math.round(kg * animal.pricePerKg);
          subtotal += amount;
          const reservation = await tx.animalReservation.create({
            data: {
              animalId: animal.id,
              customerId: customer.id,
              kg,
              amount,
            },
          });
          items.push({
            kind: "meat",
            name: `${animal.tag} (${kg} kg)`,
            qty: kg,
            unitPrice: animal.pricePerKg,
            reservationId: reservation.id,
          });
        } else if (line.kind === "food") {
          const qty = Math.floor(line.qty);
          if (qty < 1) throw new Error("Quantity must be at least 1.");
          const item = await tx.menuItem.findUnique({
            where: { id: line.menuItemId },
          });
          if (!item || !item.available)
            throw new Error("A menu item just sold out — refresh and retry.");
          subtotal += qty * item.price;
          items.push({
            kind: "food",
            name: item.name,
            qty,
            unitPrice: item.price,
          });
        } else {
          throw new Error("Unknown item in cart.");
        }
      }

      const { orderNo } = await nextOrderNo(tx);
      const deliveryFee =
        body.fulfillment === "DELIVERY" ? DELIVERY_FEE_KOBO : 0;
      const order = await tx.order.create({
        data: {
          orderNo,
          dept: body.dept,
          customerId: customer.id,
          items,
          subtotal,
          deliveryFee,
          total: subtotal + deliveryFee,
          fulfillment: body.fulfillment,
          deliveryName: body.customer.name,
          deliveryPhone: cleanPhone(body.customer.phone),
          deliveryAddr: body.customer.address,
        },
      });
      return { orderNo: order.orderNo, total: order.total };
    });

    return Response.json(result);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Order failed.";
    const conflict = /left|sold out|available/i.test(message);
    return Response.json(
      { error: message },
      { status: conflict ? 409 : 400 }
    );
  }
}
