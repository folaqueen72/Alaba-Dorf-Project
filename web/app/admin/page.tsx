import Link from "next/link";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Alert } from "../components/ui/Alert";
import { requireAdmin } from "@/lib/requireAdmin";
import { prisma } from "@/lib/prisma";
import { koboToNaira } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const { profile } = await requireAdmin();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    todaysOrders,
    paidSales,
    eggInv,
    animals,
    upcomingBookings,
    pendingOrders,
    readyOrders,
    failedCount,
  ] = await Promise.all([
    prisma.order.count({ where: { createdAt: { gte: today } } }),
    prisma.order.aggregate({
      where: { createdAt: { gte: today }, paymentStatus: "PAID" },
      _sum: { total: true },
    }),
    prisma.eggInventory.findUnique({ where: { id: "eggs" } }),
    prisma.animal.findMany(),
    prisma.booking.count({
      where: {
        status: { in: ["CONFIRMED", "UPCOMING"] },
        slot: { date: { gte: today } },
      },
    }),
    prisma.order.count({ where: { orderStatus: "CONFIRMED" } }),
    prisma.order.count({
      where: { orderStatus: { in: ["READY", "OUT_FOR_DELIVERY"] } },
    }),
    prisma.order.count({ where: { paymentStatus: "FAILED" } }),
  ]);

  const eggAvail = eggInv
    ? eggInv.totalCrates - eggInv.reservedCrates - eggInv.soldCrates
    : 0;
  const meatAvail = animals.reduce(
    (s, a) => s + Number(a.availableKg),
    0
  );

  const attention: string[] = [];
  if (pendingOrders > 0)
    attention.push(`${pendingOrders} paid order(s) not yet in preparation`);
  if (readyOrders > 0)
    attention.push(`${readyOrders} order(s) ready or out for delivery`);
  if (failedCount > 0) attention.push(`${failedCount} failed payment(s)`);
  if (eggAvail < 20 && eggAvail >= 0)
    attention.push(`Egg stock low (${eggAvail} crates)`);
  for (const a of animals) {
    const total = Number(a.totalKg);
    if (total > 0 && Number(a.availableKg) / total < 0.1)
      attention.push(`${a.tag} almost fully reserved`);
  }

  const stats = [
    { label: "Orders today", value: String(todaysOrders) },
    {
      label: "Sales today",
      value: koboToNaira(paidSales._sum.total ?? 0),
    },
    { label: "Egg stock", value: `${eggAvail} crates` },
    { label: "Meat available", value: `${Math.round(meatAvail)} kg` },
    { label: "Upcoming bookings", value: String(upcomingBookings) },
  ];

  return (
    <>
      <div className="flex items-center justify-between mb-1">
        <h1 className="font-display text-3xl font-semibold">
          Today&apos;s Overview
        </h1>
        <Badge status="info">{profile.role}</Badge>
      </div>
      <p className="text-ash-600 mb-4">
        Everything needing attention, at a glance.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {stats.map((s) => (
          <div
            key={s.label}
            className="border border-ash-200 rounded-[10px] p-3 bg-cream"
          >
            <p className="font-display text-2xl font-semibold">{s.value}</p>
            <p className="text-xs text-ash-600 uppercase tracking-wide">
              {s.label}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-4">
        {attention.length > 0 ? (
          <Alert title={`${attention.length} item(s) require attention`}>
            <ul className="list-disc ml-5">
              {attention.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
            <Link
              href="/admin/orders"
              className="inline-block mt-2 font-bold text-lemon-800 underline underline-offset-4"
            >
              Open orders
            </Link>
          </Alert>
        ) : (
          <Card>
            <p className="font-semibold">
              All clear. Nothing needs attention right now.
            </p>
          </Card>
        )}
      </div>
    </>
  );
}
