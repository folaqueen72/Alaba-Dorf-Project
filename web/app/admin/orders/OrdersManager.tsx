"use client";

import { useCallback, useEffect, useState } from "react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { koboToNaira } from "@/lib/format";

type Order = {
  id: string;
  orderNo: string;
  dept: string;
  orderStatus: string;
  paymentStatus: string;
  paymentMethod: string;
  total: number;
  fulfillment: string;
  createdAt: string;
  customer: { name: string; phone: string };
};

const STATUSES = [
  "PENDING_PAYMENT",
  "CONFIRMED",
  "PREPARING",
  "READY",
  "OUT_FOR_DELIVERY",
  "COMPLETED",
  "CANCELLED",
];

const NEXT_ACTIONS: Record<string, string[]> = {
  PENDING_PAYMENT: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PREPARING", "CANCELLED"],
  PREPARING: ["READY", "CANCELLED"],
  READY: ["OUT_FOR_DELIVERY", "COMPLETED"],
  OUT_FOR_DELIVERY: ["COMPLETED"],
  COMPLETED: [],
  CANCELLED: [],
};

export function OrdersManager() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [status, setStatus] = useState("");
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (q.trim()) params.set("q", q.trim());
    const res = await fetch(`/api/admin/orders?${params}`);
    const data = await res.json();
    if (res.ok) setOrders(data.orders);
    else setError(data.error ?? "Could not load orders.");
  }, [status, q]);

  useEffect(() => {
    load();
  }, [load]);

  async function transition(id: string, next: string, markPaid = false) {
    setBusy(id + next);
    setError(null);
    const res = await fetch("/api/admin/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: next, markPaid }),
    });
    const data = await res.json();
    setBusy(null);
    if (!res.ok) {
      setError(data.error ?? "Update failed.");
      return;
    }
    load();
  }

  return (
    <Card>
      <div className="flex flex-wrap gap-2 mb-3">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border border-ash-400 rounded-[10px] px-3 py-2 text-sm bg-white"
        >
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.replace(/_/g, " ")}
            </option>
          ))}
        </select>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search no, name, phone…"
          className="border border-ash-400 rounded-[10px] px-3 py-2 text-sm flex-1 min-w-[180px] outline-none focus:border-lemon-600"
        />
      </div>
      {error ? <p className="text-sm font-semibold mb-2">{error}</p> : null}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-ash-600 border-b border-ash-200">
              <th className="py-2 pr-3">Order</th>
              <th className="py-2 pr-3">Customer</th>
              <th className="py-2 pr-3">Total</th>
              <th className="py-2 pr-3">Status</th>
              <th className="py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-b border-ash-100 align-top">
                <td className="py-2 pr-3 font-bold whitespace-nowrap">
                  #{o.orderNo}
                  <span className="block font-normal text-ash-600">
                    {o.dept} · {o.fulfillment}
                  </span>
                </td>
                <td className="py-2 pr-3">
                  {o.customer.name}
                  <span className="block text-ash-600">{o.customer.phone}</span>
                </td>
                <td className="py-2 pr-3 whitespace-nowrap">
                  {koboToNaira(o.total)}
                  <span className="block text-ash-600">{o.paymentStatus}</span>
                  <span className="block text-ash-600">
                    {o.paymentMethod === "CASH"
                      ? "Cash"
                      : o.paymentMethod === "TRANSFER"
                        ? "Transfer"
                        : "Card"}
                  </span>
                </td>
                <td className="py-2 pr-3">
                  <Badge
                    status={
                      o.orderStatus === "COMPLETED"
                        ? "completed"
                        : o.orderStatus === "CANCELLED"
                          ? "failed"
                          : o.orderStatus === "PENDING_PAYMENT"
                            ? "pending"
                            : "preparing"
                    }
                  >
                    {o.orderStatus.replace(/_/g, " ")}
                  </Badge>
                </td>
                <td className="py-2">
                  <div className="flex flex-wrap gap-1">
                    {o.orderStatus === "PENDING_PAYMENT" &&
                    o.paymentStatus === "UNPAID" ? (
                      <Button
                        size="sm"
                        disabled={busy === o.id + "CONFIRMED"}
                        onClick={() => transition(o.id, "CONFIRMED", true)}
                      >
                        Confirm + Paid
                      </Button>
                    ) : null}
                    {(NEXT_ACTIONS[o.orderStatus] ?? [])
                      .filter(
                        (n) =>
                          !(
                            o.orderStatus === "PENDING_PAYMENT" &&
                            n === "CONFIRMED"
                          )
                      )
                      .map((n) => (
                        <Button
                          key={n}
                          size="sm"
                          variant="outline"
                          disabled={busy === o.id + n}
                          onClick={() => transition(o.id, n)}
                        >
                          {n === "CANCELLED"
                            ? "Cancel"
                            : n.replace(/_/g, " ")}
                        </Button>
                      ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 ? (
          <p className="text-ash-600 text-sm py-4">No orders found.</p>
        ) : null}
      </div>
    </Card>
  );
}
