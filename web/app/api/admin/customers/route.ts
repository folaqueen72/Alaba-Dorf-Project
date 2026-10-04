import { prisma } from "@/lib/prisma";
import { adminGuard } from "@/lib/adminGuard";

// GET /api/admin/customers?q=&take=  → list with order/booking counts
// GET /api/admin/customers?phone=... → one customer with full history
export async function GET(req: Request) {
  const gate = await adminGuard(req);
  if ("error" in gate) return gate.error;
  const url = new URL(req.url);
  const phone = (url.searchParams.get("phone") ?? "").trim();
  if (phone) {
    const customer = await prisma.customer.findUnique({
      where: { phone },
      include: {
        orders: { orderBy: { createdAt: "desc" }, take: 50 },
        bookings: {
          include: { sessionType: true, slot: true },
          orderBy: { createdAt: "desc" },
          take: 50,
        },
        reservations: {
          include: { animal: true },
          orderBy: { createdAt: "desc" },
          take: 50,
        },
      },
    });
    if (!customer)
      return Response.json({ error: "Not found." }, { status: 404 });
    return Response.json({ customer });
  }
  const q = (url.searchParams.get("q") ?? "").trim();
  const take = Math.min(Number(url.searchParams.get("take") ?? 50), 200);
  const customers = await prisma.customer.findMany({
    where: q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { phone: { contains: q } },
          ],
        }
      : {},
    include: {
      _count: { select: { orders: true, bookings: true } },
    },
    orderBy: { createdAt: "desc" },
    take,
  });
  return Response.json({ customers });
}
