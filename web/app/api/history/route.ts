import { prisma } from "@/lib/prisma";
import { cleanPhone } from "@/lib/orders";

// GET /api/history?phone=0803... → recent orders + bookings for that phone
export async function GET(req: Request) {
  const phone = cleanPhone(
    new URL(req.url).searchParams.get("phone") ?? ""
  );
  if (phone.length < 7)
    return Response.json(
      { error: "Enter the phone number you ordered with." },
      { status: 400 }
    );

  const customer = await prisma.customer.findUnique({
    where: { phone },
    include: {
      orders: {
        orderBy: { createdAt: "desc" },
        take: 20,
        select: {
          orderNo: true,
          dept: true,
          total: true,
          orderStatus: true,
          paymentStatus: true,
          createdAt: true,
        },
      },
      bookings: {
        orderBy: { createdAt: "desc" },
        take: 20,
        select: {
          id: true,
          status: true,
          createdAt: true,
          sessionType: { select: { name: true } },
        },
      },
    },
  });
  if (!customer) return Response.json({ orders: [], bookings: [] });
  return Response.json({
    orders: customer.orders,
    bookings: customer.bookings.map((b) => ({
      ref: b.id.slice(0, 8).toUpperCase(),
      fullId: b.id,
      status: b.status,
      session: b.sessionType.name,
      createdAt: b.createdAt,
    })),
  });
}
