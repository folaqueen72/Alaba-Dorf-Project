import { prisma } from "@/lib/prisma";
import { verifyWebhookSignature } from "@/lib/paystack";
import { logActivity } from "@/lib/activity";
import { sendEmail, paidEmail } from "@/lib/email";
import { koboToNaira } from "@/lib/format";

// Paystack webhook: charge.success → mark PAID, confirm order/booking,
// move egg reservations to sold, notify the customer.
export async function POST(req: Request) {
  const raw = await req.text();
  const signature = req.headers.get("x-paystack-signature");
  if (!verifyWebhookSignature(raw, signature))
    return Response.json({ error: "Bad signature." }, { status: 401 });

  let event: { event?: string; data?: { reference?: string; status?: string } };
  try {
    event = JSON.parse(raw);
  } catch {
    return Response.json({ ok: true });
  }
  if (event.event !== "charge.success" || !event.data?.reference)
    return Response.json({ ok: true });

  const reference = event.data.reference;
  await prisma.$transaction(async (tx) => {
    const payment = await tx.payment.findUnique({
      where: { reference },
    });
    if (!payment || payment.status === "PAID") return;
    await tx.payment.update({
      where: { id: payment.id },
      data: { status: "PAID", rawPayload: event as never },
    });

    const order = await tx.order.findFirst({
      where: { paymentId: payment.id },
      include: { customer: true },
    });
    if (order && order.orderStatus === "PENDING_PAYMENT") {
      await tx.order.update({
        where: { id: order.id },
        data: { orderStatus: "CONFIRMED", paymentStatus: "PAID" },
      });
      const items = (order.items as unknown as Array<{ kind: string; qty: number }>) ?? [];
      for (const it of items) {
        if (it.kind === "eggs") {
          await tx.eggInventory.update({
            where: { id: "eggs" },
            data: {
              reservedCrates: { decrement: Math.floor(it.qty) },
              soldCrates: { increment: Math.floor(it.qty) },
            },
          });
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
      return;
    }

    const booking = await tx.booking.findFirst({
      where: { paymentId: payment.id },
      include: { customer: true },
    });
    if (booking && booking.status === "PENDING_PAYMENT") {
      await tx.booking.update({
        where: { id: booking.id },
        data: { status: "CONFIRMED" },
      });
      await logActivity(tx, {
        action: "payment confirmed (paystack)",
        entity: "booking",
        entityId: booking.id,
      });
    }
  });

  return Response.json({ ok: true });
}
