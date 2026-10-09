import { prisma } from "@/lib/prisma";
import { adminGuard } from "@/lib/adminGuard";
import { logActivity } from "@/lib/activity";
import { notifyCustomer } from "@/lib/notify";
import { ORDER_NEXT } from "@/lib/workflow";
import type { OrderStatus } from "@prisma/client";

const ROLE_DEPT = { FARM: "FARM", EATERY: "EATERY" } as const;

export async function GET(req: Request) {
  const gate = await adminGuard(req);
  if ("error" in gate) return gate.error;
  const url = new URL(req.url);
  const status = url.searchParams.get("status") as OrderStatus | null;
  const q = (url.searchParams.get("q") ?? "").trim();
  const take = Math.min(Number(url.searchParams.get("take") ?? 50), 200);

  const roleDept =
    gate.profile.role === "TOP"
      ? undefined
      : (ROLE_DEPT as Record<string, string>)[gate.profile.role];
  if (gate.profile.role !== "TOP" && !roleDept)
    return Response.json({ orders: [] });

  const orders = await prisma.order.findMany({
    where: {
      ...(roleDept ? { dept: roleDept as "FARM" | "EATERY" } : {}),
      ...(status ? { orderStatus: status } : {}),
      ...(q
        ? {
            OR: [
              { orderNo: { contains: q, mode: "insensitive" } },
              { customer: { name: { contains: q, mode: "insensitive" } } },
              { customer: { phone: { contains: q } } },
            ],
          }
        : {}),
    },
    include: { customer: true },
    orderBy: { createdAt: "desc" },
    take,
  });
  return Response.json({ orders });
}

type Item = {
  kind: string;
  qty: number;
  reservationId?: string;
  name?: string;
};

export async function PATCH(req: Request) {
  const gate = await adminGuard(req);
  if ("error" in gate) return gate.error;
  const body = await req.json().catch(() => null);
  const { id, status, markPaid } = body ?? {};
  if (!id || !status || !ORDER_NEXT[status as OrderStatus])
    return Response.json({ error: "Invalid request." }, { status: 400 });

  try {
    const result = await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id },
        include: { payment: true },
      });
      if (!order) throw new Error("Order not found.");
      if (
        gate.profile.role !== "TOP" &&
        (ROLE_DEPT as Record<string, string>)[gate.profile.role] !== order.dept
      )
        throw new Error("Forbidden for your department.");
      if (!ORDER_NEXT[order.orderStatus].includes(status as OrderStatus))
        throw new Error(
          `Cannot move ${order.orderStatus} to ${status}.`
        );

      let paymentStatus = order.paymentStatus;
      if (markPaid && order.paymentStatus === "UNPAID") {
        if (order.payment) {
          await tx.payment.update({
            where: { id: order.payment.id },
            data: { status: "PAID" },
          });
        } else {
          const payment = await tx.payment.create({
            data: {
              provider: "manual",
              reference: `MAN-${order.orderNo}`,
              amount: order.total,
              status: "PAID",
            },
          });
          await tx.order.update({
            where: { id },
            data: { paymentId: payment.id },
          });
        }
        paymentStatus = "PAID";
      }

      if (status === "CANCELLED") {
        const items = (order.items as unknown as Item[]) ?? [];
        for (const it of items) {
          if (it.kind === "eggs") {
            await tx.eggInventory.update({
              where: { id: "eggs" },
              data: { reservedCrates: { decrement: Math.floor(it.qty) } },
            });
          } else if (it.kind === "meat" && it.reservationId) {
            const r = await tx.animalReservation.findUnique({
              where: { id: it.reservationId },
            });
            if (r) {
              await tx.animal.update({
                where: { id: r.animalId },
                data: {
                  availableKg: { increment: r.kg },
                  status: "AVAILABLE",
                },
              });
            }
          } else if (it.kind === "poultry") {
            if (it.reservationId) {
              const r = await tx.animalReservation.findUnique({
                where: { id: it.reservationId },
              });
              if (r) {
                await tx.animal.update({
                  where: { id: r.animalId },
                  data: {
                    availableKg: { increment: r.kg },
                    status: "AVAILABLE",
                  },
                });
              }
            } else {
              // Live birds: find the batch from the item name tag.
              const tag = (it.name ?? "").split(" — ")[0];
              const batch = await tx.animal.findUnique({ where: { tag } });
              if (batch && batch.liveStock != null) {
                await tx.animal.update({
                  where: { id: batch.id },
                  data: {
                    liveStock: { increment: Math.floor(it.qty) },
                    status: "AVAILABLE",
                  },
                });
              }
            }
          }
        }
        if (order.payment && paymentStatus === "PAID") {
          await tx.payment.update({
            where: { id: order.payment.id },
            data: { status: "REFUNDED" },
          });
          paymentStatus = "REFUNDED";
        }
      }

      const updated = await tx.order.update({
        where: { id },
        data: { orderStatus: status as OrderStatus, paymentStatus },
      });
      await logActivity(tx, {
        actorId: gate.user.id,
        action: `order ${status.toLowerCase()}${markPaid ? " + paid" : ""}`,
        entity: "order",
        entityId: order.orderNo,
        before: { orderStatus: order.orderStatus } as never,
        after: { orderStatus: status } as never,
      });
      const newStatus = status as OrderStatus;
      const message: Record<string, string> = {
        CONFIRMED: `Order #${order.orderNo} confirmed — we are working on it.`,
        PREPARING: `Order #${order.orderNo} is being prepared.`,
        READY: `Order #${order.orderNo} is ready for ${order.fulfillment === "DELIVERY" ? "delivery" : "pickup"}.`,
        OUT_FOR_DELIVERY: `Order #${order.orderNo} is on its way to you.`,
        COMPLETED: `Order #${order.orderNo} completed. Thank you!`,
        CANCELLED: `Order #${order.orderNo} was cancelled. Contact us if this is wrong.`,
      };
      await notifyCustomer(order.customerId, {
        title: `Order #${order.orderNo} — ${newStatus.replace(/_/g, " ")}`,
        body: message[newStatus] ?? `Order #${order.orderNo} updated.`,
        url: `/track?orderNo=${order.orderNo}`,
      });
      return updated;
    });
    return Response.json({ order: result });
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : "Update failed." },
      { status: 400 }
    );
  }
}
