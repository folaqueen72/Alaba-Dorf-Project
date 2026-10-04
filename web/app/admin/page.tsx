import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Alert } from "../components/ui/Alert";

const STATS = [
  { label: "Orders", value: "24" },
  { label: "Sales", value: "₦385,000" },
  { label: "Egg Stock", value: "63 crates" },
  { label: "Meat Available", value: "87 kg" },
  { label: "Studio Bookings", value: "6" },
  { label: "Pending Deliveries", value: "8" },
];

const RECENT = [
  { no: "#ADO1042", customer: "Adeola", dept: "Eatery", status: "preparing" as const, label: "Preparing" },
  { no: "#ADO1041", customer: "Musa", dept: "Farm", status: "confirmed" as const, label: "Confirmed" },
  { no: "#ADO1040", customer: "Grace", dept: "Studio", status: "pending" as const, label: "Pending Payment" },
  { no: "#ADO1039", customer: "Tunde", dept: "Eatery", status: "failed" as const, label: "Failed Payment" },
];

export default function AdminDashboard() {
  return (
    <>
      <h1 className="font-display text-3xl font-semibold mb-1">
        Today&apos;s Overview
      </h1>
      <p className="text-ash-600 mb-4">
        Everything needing attention, at a glance.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {STATS.map((s) => (
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
        <Alert title="3 orders require attention">
          2 paid but not processed · 1 failed payment · egg stock low.
        </Alert>
      </div>

      <Card title="Recent orders" className="mt-4">
        <div className="overflow-x-auto">
          <table className="w-full text-sm mt-2">
            <thead>
              <tr className="text-left text-ash-600 border-b border-ash-200">
                <th className="py-2 pr-3">Order</th>
                <th className="py-2 pr-3">Customer</th>
                <th className="py-2 pr-3">Dept</th>
                <th className="py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {RECENT.map((o) => (
                <tr key={o.no} className="border-b border-ash-100">
                  <td className="py-2 pr-3 font-bold">{o.no}</td>
                  <td className="py-2 pr-3">{o.customer}</td>
                  <td className="py-2 pr-3">{o.dept}</td>
                  <td className="py-2">
                    <Badge status={o.status}>{o.label}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
