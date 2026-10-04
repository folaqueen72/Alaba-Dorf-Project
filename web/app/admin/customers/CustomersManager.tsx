"use client";

import { useEffect, useState } from "react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { koboToNaira } from "@/lib/format";

type Customer = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  _count: { orders: number; bookings: number };
};

type Detail = Customer & {
  orders: Array<{
    orderNo: string;
    dept: string;
    total: number;
    orderStatus: string;
    createdAt: string;
  }>;
  bookings: Array<{
    id: string;
    status: string;
    sessionType: { name: string };
  }>;
  reservations: Array<{
    kg: string;
    animal: { tag: string };
  }>;
};

export function CustomersManager() {
  const [q, setQ] = useState("");
  const [list, setList] = useState<Customer[]>([]);
  const [detail, setDetail] = useState<Detail | null>(null);

  async function search() {
    const res = await fetch(
      `/api/admin/customers?q=${encodeURIComponent(q)}`
    );
    const data = await res.json();
    if (res.ok) setList(data.customers);
  }

  useEffect(() => {
    search();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function open(phone: string) {
    const res = await fetch(
      `/api/admin/customers?phone=${encodeURIComponent(phone)}`
    );
    const data = await res.json();
    if (res.ok) setDetail(data.customer);
  }

  return (
    <>
      <Card>
        <div className="flex gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && search()}
            placeholder="Search name or phone…"
            className="border border-ash-400 rounded-[10px] px-3 py-2 text-sm flex-1 outline-none focus:border-lemon-600"
          />
          <Button size="sm" onClick={search}>
            Search
          </Button>
        </div>
        <div className="mt-3 space-y-1">
          {list.map((c) => (
            <button
              key={c.id}
              onClick={() => open(c.phone)}
              className="w-full text-left border border-ash-200 rounded-[10px] p-2 text-sm hover:border-lemon-600"
            >
              <b>{c.name}</b> · {c.phone}
              <span className="text-ash-600">
                {" "}
                — {c._count.orders} order(s), {c._count.bookings} booking(s)
              </span>
            </button>
          ))}
        </div>
      </Card>
      {detail ? (
        <Card title={`${detail.name} — history`} className="mt-4">
          <p className="text-sm text-ash-600">
            {detail.phone}
            {detail.email ? ` · ${detail.email}` : ""}
          </p>
          <p className="font-bold mt-3 mb-1">Orders</p>
          {detail.orders.length === 0 ? (
            <p className="text-sm text-ash-600">None yet.</p>
          ) : (
            <ul className="text-sm space-y-1">
              {detail.orders.map((o) => (
                <li key={o.orderNo}>
                  #{o.orderNo} · {o.dept} · {koboToNaira(o.total)} ·{" "}
                  {o.orderStatus.replace(/_/g, " ")}
                </li>
              ))}
            </ul>
          )}
          <p className="font-bold mt-3 mb-1">Bookings</p>
          {detail.bookings.length === 0 ? (
            <p className="text-sm text-ash-600">None yet.</p>
          ) : (
            <ul className="text-sm space-y-1">
              {detail.bookings.map((b) => (
                <li key={b.id}>
                  {b.sessionType.name} · {b.status.replace(/_/g, " ")}
                </li>
              ))}
            </ul>
          )}
          <p className="font-bold mt-3 mb-1">Meat reservations</p>
          {detail.reservations.length === 0 ? (
            <p className="text-sm text-ash-600">None yet.</p>
          ) : (
            <ul className="text-sm space-y-1">
              {detail.reservations.map((r, i) => (
                <li key={i}>
                  {r.kg} kg · {r.animal.tag}
                </li>
              ))}
            </ul>
          )}
        </Card>
      ) : null}
    </>
  );
}
