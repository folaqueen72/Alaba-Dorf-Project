"use client";

import { useEffect, useState } from "react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { koboToNaira } from "@/lib/format";

export function ReportsManager() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [dept, setDept] = useState("");
  const [data, setData] = useState<{
    totals: { orders: number; sales: number; bookings: number };
    byDept: Record<string, { orders: number; sales: number }>;
  } | null>(null);

  async function load() {
    const params = new URLSearchParams();
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    if (dept) params.set("dept", dept);
    const res = await fetch(`/api/admin/reports?${params}`);
    const json = await res.json();
    if (res.ok) setData(json);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const csvHref = `/api/admin/reports?format=csv${from ? `&from=${from}` : ""}${to ? `&to=${to}` : ""}${dept ? `&dept=${dept}` : ""}`;

  return (
    <>
      <Card>
        <div className="flex flex-wrap gap-2 items-end">
          <label className="block">
            <span className="block text-sm font-semibold mb-1">From</span>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="border border-ash-400 rounded-[10px] px-3 py-2 bg-white"
            />
          </label>
          <label className="block">
            <span className="block text-sm font-semibold mb-1">To</span>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="border border-ash-400 rounded-[10px] px-3 py-2 bg-white"
            />
          </label>
          <label className="block">
            <span className="block text-sm font-semibold mb-1">
              Department
            </span>
            <select
              value={dept}
              onChange={(e) => setDept(e.target.value)}
              className="border border-ash-400 rounded-[10px] px-3 py-2 bg-white"
            >
              <option value="">All</option>
              <option value="FARM">Farm</option>
              <option value="EATERY">Eatery</option>
            </select>
          </label>
          <Button size="sm" onClick={load}>
            Apply
          </Button>
          <a href={csvHref} className="inline-block">
            <Button size="sm" variant="outline">
              Download CSV
            </Button>
          </a>
        </div>
      </Card>
      {data ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
          <div className="border border-ash-200 rounded-[10px] p-3 bg-cream">
            <p className="font-display text-2xl font-semibold">
              {koboToNaira(data.totals.sales)}
            </p>
            <p className="text-xs text-ash-600 uppercase tracking-wide">
              Sales
            </p>
          </div>
          <div className="border border-ash-200 rounded-[10px] p-3 bg-cream">
            <p className="font-display text-2xl font-semibold">
              {data.totals.orders}
            </p>
            <p className="text-xs text-ash-600 uppercase tracking-wide">
              Orders
            </p>
          </div>
          <div className="border border-ash-200 rounded-[10px] p-3 bg-cream">
            <p className="font-display text-2xl font-semibold">
              {data.totals.bookings}
            </p>
            <p className="text-xs text-ash-600 uppercase tracking-wide">
              Bookings
            </p>
          </div>
          {Object.entries(data.byDept).map(([d, v]) => (
            <div
              key={d}
              className="border border-ash-200 rounded-[10px] p-3 bg-white"
            >
              <p className="font-display text-2xl font-semibold">
                {koboToNaira(v.sales)}
              </p>
              <p className="text-xs text-ash-600 uppercase tracking-wide">
                {d} · {v.orders} orders
              </p>
            </div>
          ))}
        </div>
      ) : null}
    </>
  );
}
