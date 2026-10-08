import { prisma } from "@/lib/prisma";
import { verifyWebhookSignature } from "@/lib/paystack";
import { fulfillPayment } from "@/lib/payments";

// Paystack webhook: charge.success → fulfill (idempotent).
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

  await fulfillPayment(event.data.reference);
  return Response.json({ ok: true });
}

export async function GET(req: Request) {
  // Find which order/booking a Paystack reference belongs to (for the
  // return-URL flow, without exposing details).
  const reference = new URL(req.url).searchParams.get("reference") ?? "";
  if (!reference) return Response.json({ found: false });
  const payment = await prisma.payment.findUnique({
    where: { reference },
    include: {
      order: {
        select: { orderNo: true, customer: { select: { phone: true } } },
      },
      booking: {
        select: { id: true, customer: { select: { phone: true } } },
      },
    },
  });
  if (!payment) return Response.json({ found: false });
  if (payment.order)
    return Response.json({
      found: true,
      type: "order",
      orderNo: payment.order.orderNo,
      phone: payment.order.customer.phone,
      paid: payment.status === "PAID",
    });
  if (payment.booking)
    return Response.json({
      found: true,
      type: "booking",
      orderNo: payment.booking.id,
      phone: payment.booking.customer.phone,
      paid: payment.status === "PAID",
    });
  return Response.json({ found: false });
}
