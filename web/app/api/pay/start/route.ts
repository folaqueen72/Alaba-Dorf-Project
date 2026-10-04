import { prisma } from "@/lib/prisma";
import { startTransaction, paystackConfigured } from "@/lib/paystack";

// POST /api/pay/start {ref: "ADO1042" | bookingId}
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const ref = (body?.ref ?? "").trim();
  if (!ref) return Response.json({ error: "Missing reference." }, { status: 400 });
  if (!paystackConfigured())
    return Response.json(
      { error: "Online payment is not set up yet. Your order is recorded — we will confirm payment with you." },
      { status: 503 }
    );
  try {
    const orderNo = ref.replace(/^#/, "");
    const order = await prisma.order.findFirst({
      where: { orderNo: { equals: orderNo, mode: "insensitive" } },
      include: { customer: true, payment: true },
    });
    if (order) {
      if (order.paymentStatus === "PAID")
        throw new Error("This order is already paid.");
      const payment = order.paymentId
        ? await prisma.payment.update({
            // Fresh reference per attempt — Paystack rejects repeats.
            where: { id: order.paymentId },
            data: {
              reference: `ADO-${order.orderNo}-${Date.now()}`,
              status: "UNPAID",
            },
          })
        : await prisma.payment.create({
            data: {
              provider: "paystack",
              reference: `ADO-${order.orderNo}-${Date.now()}`,
              amount: order.total,
              status: "UNPAID",
            },
          });
      if (!order.paymentId) {
        await prisma.order.update({
          where: { id: order.id },
          data: { paymentId: payment.id, paymentStatus: "PROCESSING" },
        });
      }
      const email =
        order.customer.email?.trim() ||
        `order-${order.orderNo.toLowerCase()}@alabadorf.ng`;
      const { authorizationUrl } = await startTransaction({
        email,
        amountKobo: order.total,
        reference: payment.reference,
        callbackUrl: `${process.env.BETTER_AUTH_URL ?? "http://localhost:3000"}/track?orderNo=${order.orderNo}`,
      });
      return Response.json({ url: authorizationUrl });
    }

    const booking = await prisma.booking.findFirst({
      where: { id: ref },
      include: { customer: true, payment: true },
    });
    if (booking) {
      if (!booking.payment) throw new Error("Booking payment missing.");
      if (booking.payment.status === "PAID")
        throw new Error("This booking is already paid.");
      const email =
        booking.customer.email?.trim() ||
        `booking-${booking.id.slice(0, 8)}@alabadorf.ng`;
      const { authorizationUrl } = await startTransaction({
        email,
        amountKobo: booking.payment.amount,
        reference: booking.payment.reference,
        callbackUrl: `${process.env.BETTER_AUTH_URL ?? "http://localhost:3000"}/track?orderNo=${booking.id}`,
      });
      await prisma.payment.update({
        where: { id: booking.payment.id },
        data: { status: "PROCESSING" },
      });
      return Response.json({ url: authorizationUrl });
    }
    return Response.json({ error: "Order not found." }, { status: 404 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Payment failed to start.";
    const notConfigured = /not set up yet/i.test(message);
    return Response.json(
      { error: message },
      { status: notConfigured ? 503 : message === "Order not found." ? 404 : 400 }
    );
  }
}
