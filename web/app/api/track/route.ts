import { prisma } from "@/lib/prisma";
import { cleanPhone } from "@/lib/orders";
import { rateLimit, READ_LIMIT } from "@/lib/rateLimit";

// GET /api/track?orderNo=ADO1042&phone=0803...  → order or booking timeline
export async function GET(req: Request) {
  const limited = rateLimit(req, { key: "track", ...READ_LIMIT });
  if (limited) return limited;
  const url = new URL(req.url);
  const orderNo = (url.searchParams.get("orderNo") ?? "").trim();
  const phone = cleanPhone(url.searchParams.get("phone") ?? "");
  if (!orderNo || phone.length < 7)
    return Response.json(
      { error: "Enter your order number and phone number." },
      { status: 400 }
    );

  const order = await prisma.order.findFirst({
    where: {
      orderNo: { equals: orderNo.replace(/^#/, ""), mode: "insensitive" },
      customer: { phone },
    },
    include: { customer: true },
  });
  if (order) {
    return Response.json({
      type: "order",
      ref: `#${order.orderNo}`,
      status: order.orderStatus,
      payment: order.paymentStatus,
      method: order.paymentMethod,
      items: order.items,
      total: order.total,
      fulfillment: order.fulfillment,
      updatedAt: order.updatedAt,
    });
  }

  const booking = await prisma.booking.findFirst({
    where: { id: orderNo, customer: { phone } },
    include: { sessionType: true, slot: true },
  });
  if (booking) {
    return Response.json({
      type: "booking",
      ref: booking.id.slice(0, 8).toUpperCase(),
      status: booking.status,
      method: booking.paymentMethod,
      session: booking.sessionType.name,
      date: booking.slot.date,
      slot: `${booking.slot.startTime} – ${booking.slot.endTime}`,
      updatedAt: booking.updatedAt,
    });
  }

  return Response.json(
    { error: "Nothing found. Check the number and phone used to order." },
    { status: 404 }
  );
}
