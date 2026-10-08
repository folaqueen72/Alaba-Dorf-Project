import { prisma } from "./prisma";
import { logActivity } from "./activity";
import { sendEmail, paidEmail } from "./email";
import { koboToNaira } from "./format";

// Fulfill a Paystack payment by reference. Idempotent: safe to call from the
// webhook, from return-URL verification, or from staff retry.
export async function fulfillPayment(
  reference: string
): Promise<{ fulfilled: boolean; kind?: "order" | "booking" }> {
  return prisma.$transaction(async (tx) => {
    const payment = await tx.payment.findUnique({ where: { reference } });
    if (!payment || payment.status === "PAID")
      return { fulfilled: payment?.status === "PAID" };

    await tx.payment.update({
      where: { id: payment.id },
      data: { status: "PAID" },
    });

    const order = await tx.order.findFirst({
      where: { paymentId: payment.id },
      include: { customer: true },
    });
    if (order) {
      if (order.orderStatus === "PENDING_PAYMENT") {
        await tx.order.update({
          where: { id: order.id },
          data: { orderStatus: "CONFIRMED", paymentStatus: "PAID" },
        });
      } else {
        await tx.order.update({
          where: { id: order.id },
          data: { paymentStatus: "PAID" },
        });
      }
      const items =
        (order.items as unknown as Array<{ kind: string; qty: number }>) ?? [];
      for (const it of items) {
        if (it.kind === "eggs") {
          const inv = await tx.eggInventory.findUnique({
            where: { id: "eggs" },
          });
          const move = Math.min(Math.floor(it.qty), inv?.reservedCrates ?? 0);
          if (move > 0) {
            await tx.eggInventory.update({
              where: { id: "eggs" },
              data: {
                reservedCrates: { decrement: move },
                soldCrates: { increment: move },
              },
            });
          }
        }
      }
      await logActivity(tx, {
        action: "payment confirmed (paystack)",
        entity: "order",
        entityId: order.orderNo,
      });
      if (order.customer.email) {
        await sendEmail({
          to: order.customer.email,
          subject: `Payment confirmed — #${order.orderNo}`,
          html: paidEmail(
            order.customer.name,
            order.orderNo,
            koboToNaira(order.total)
          ),
        });
      }
      return { fulfilled: true, kind: "order" as const };
    }

    const booking = await tx.booking.findFirst({
      where: { paymentId: payment.id },
      include: { customer: true },
    });
    if (booking) {
      if (booking.status === "PENDING_PAYMENT") {
        await tx.booking.update({
          where: { id: booking.id },
          data: { status: "CONFIRMED" },
        });
      }
      await logActivity(tx, {
        action: "payment confirmed (paystack)",
        entity: "booking",
        entityId: booking.id,
      });
      return { fulfilled: true, kind: "booking" as const };
    }

    return { fulfilled: false };
  });
}

export async function verifyWithPaystack(
  reference: string
): Promise<{ paid: boolean }> {
  if (!process.env.PAYSTACK_SECRET_KEY) return { paid: false };
  try {
    const res = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );
    const data = await res.json();
    return { paid: data?.status === true && data?.data?.status === "success" };
  } catch {
    return { paid: false };
  }
}
