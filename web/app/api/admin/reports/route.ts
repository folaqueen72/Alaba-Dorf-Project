import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { adminGuard } from "@/lib/adminGuard";

// GET /api/admin/reports?from=&to=&dept=&format=json|csv
export async function GET(req: Request) {
  const gate = await adminGuard(req);
  if ("error" in gate) return gate.error;
  const url = new URL(req.url);
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");
  const deptParam = url.searchParams.get("dept");
  const dept =
    deptParam === "FARM" || deptParam === "EATERY" ? deptParam : undefined;
  const format = url.searchParams.get("format") ?? "json";

  const where: Prisma.OrderWhereInput = {
    ...(from || to
      ? {
          createdAt: {
            ...(from ? { gte: new Date(from) } : {}),
            ...(to ? { lte: new Date(to + "T23:59:59") } : {}),
          },
        }
      : {}),
    ...(dept ? { dept } : {}),
    orderStatus: { not: "CANCELLED" as const },
  };

  const [orders, bookings] = await Promise.all([
    prisma.order.findMany({
      where,
      include: { customer: true },
      orderBy: { createdAt: "desc" },
      take: 2000,
    }),
    prisma.booking.findMany({
      where: {
        ...(from || to
          ? {
              createdAt: {
                ...(from ? { gte: new Date(from) } : {}),
                ...(to ? { lte: new Date(to + "T23:59:59") } : {}),
              },
            }
          : {}),
        status: { not: "CANCELLED" },
      },
      include: { customer: true, sessionType: true },
      take: 2000,
    }),
  ]);

  const sales = orders.reduce((s, o) => s + o.total, 0);
  const byDept: Record<string, { orders: number; sales: number }> = {};
  for (const o of orders) {
    byDept[o.dept] ??= { orders: 0, sales: 0 };
    byDept[o.dept].orders += 1;
    byDept[o.dept].sales += o.total;
  }

  if (format === "csv") {
    const rows = [
      "order_no,date,customer,phone,dept,total_kobo,status,payment",
      ...orders.map((o) =>
        [
          o.orderNo,
          o.createdAt.toISOString().slice(0, 10),
          `"${o.customer.name}"`,
          o.customer.phone,
          o.dept,
          o.total,
          o.orderStatus,
          o.paymentStatus,
        ].join(",")
      ),
    ];
    return new Response(rows.join("\n"), {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": "attachment; filename=alaba-report.csv",
      },
    });
  }

  return Response.json({
    totals: {
      orders: orders.length,
      sales,
      bookings: bookings.length,
      bookingSales: bookings.reduce((s, b) => s + (b.paymentId ? 0 : 0), 0),
    },
    byDept,
    orders: orders.slice(0, 200),
  });
}
