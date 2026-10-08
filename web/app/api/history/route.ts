import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { cleanPhone } from "@/lib/orders";

// GET /api/history?phone=0803... → recent orders + bookings.
// Signed-in customers also get everything linked to their account,
// even if it was ordered under a different phone number.
export async function GET(req: Request) {
  const phone = cleanPhone(
    new URL(req.url).searchParams.get("phone") ?? ""
  );
  const session = await auth.api
    .getSession({ headers: req.headers })
    .catch(() => null);
  const rawUser = session?.user as
    | { id: string; isAnonymous?: boolean }
    | undefined;
  const userId = rawUser && !rawUser.isAnonymous ? rawUser.id : null;
  if (phone.length < 7 && !userId)
    return Response.json(
      { error: "Enter the phone number you ordered with." },
      { status: 400 }
    );

  const customers = await prisma.customer.findMany({
    where: {
      OR: [
        ...(phone.length >= 7 ? [{ phone }] : []),
        ...(userId ? [{ userId }] : []),
      ],
    },
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
  if (customers.length === 0)
    return Response.json({ orders: [], bookings: [] });

  const seenOrders = new Set<string>();
  const seenBookings = new Set<string>();
  const orders: unknown[] = [];
  const bookings: unknown[] = [];
  for (const c of customers) {
    for (const o of c.orders) {
      if (seenOrders.has(o.orderNo)) continue;
      seenOrders.add(o.orderNo);
      orders.push(o);
    }
    for (const b of c.bookings) {
      if (seenBookings.has(b.id)) continue;
      seenBookings.add(b.id);
      bookings.push({
        ref: b.id.slice(0, 8).toUpperCase(),
        fullId: b.id,
        status: b.status,
        session: b.sessionType.name,
        createdAt: b.createdAt,
      });
    }
  }
  orders.sort(
    (a, b) =>
      new Date((b as { createdAt: string }).createdAt).getTime() -
      new Date((a as { createdAt: string }).createdAt).getTime()
  );
  return Response.json({ orders, bookings });
}
