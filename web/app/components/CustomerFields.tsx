"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";

export type CustomerInput = {
  name: string;
  phone: string;
  address: string;
  email: string;
};

export function CustomerFields({
  value,
  onChange,
  needAddress,
}: {
  value: CustomerInput;
  onChange: (next: CustomerInput) => void;
  needAddress: boolean;
}) {
  const { data: session } = authClient.useSession();
  const raw = session?.user as { name?: string; isAnonymous?: boolean } | undefined;
  const authed = raw && !raw.isAnonymous ? raw : null;
  const filled = useRef(false);
  useEffect(() => {
    if (authed?.name && !filled.current && !value.name) {
      filled.current = true;
      onChange({ ...value, name: authed.name });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authed]);
  const set = (k: keyof CustomerInput) => (v: string) =>
    onChange({ ...value, [k]: v });
  return (
    <div>
      {authed ? (
        <p className="text-sm text-ash-600 mb-3">
          Signed in as <b>{authed.name}</b> — details prefilled.
        </p>
      ) : (
        <p className="text-sm text-ash-600 mb-3">
          <Link href="/login" className="font-bold text-lemon-800 underline underline-offset-4">
            Sign in
          </Link>{" "}
          to skip typing your details next time — or continue as a guest.
        </p>
      )}
    <div className="grid gap-3 sm:grid-cols-2">
      <label className="block">
        <span className="block text-sm font-semibold mb-1">Full name</span>
        <input
          required
          value={value.name}
          onChange={(e) => set("name")(e.target.value)}
          placeholder="Adeola Balogun"
          autoComplete="name"
          className="w-full rounded-[10px] border border-ash-400 bg-white px-4 py-3 text-[15px] outline-none focus:border-lemon-600"
        />
      </label>
      <label className="block">
        <span className="block text-sm font-semibold mb-1">Phone number</span>
        <input
          required
          value={value.phone}
          onChange={(e) => set("phone")(e.target.value)}
          placeholder="0803 000 0000"
          inputMode="tel"
          autoComplete="tel"
          className="w-full rounded-[10px] border border-ash-400 bg-white px-4 py-3 text-[15px] outline-none focus:border-lemon-600"
        />
      </label>
      {needAddress ? (
        <label className="block sm:col-span-2">
          <span className="block text-sm font-semibold mb-1">
            Delivery address
          </span>
          <input
            required
            value={value.address}
            onChange={(e) => set("address")(e.target.value)}
            placeholder="House, street, area, landmark"
            autoComplete="street-address"
            className="w-full rounded-[10px] border border-ash-400 bg-white px-4 py-3 text-[15px] outline-none focus:border-lemon-600"
          />
        </label>
      ) : null}
      <label className="block sm:col-span-2">
        <span className="block text-sm font-semibold mb-1">
          Email <span className="font-normal text-ash-600">(optional, for receipts)</span>
        </span>
        <input
          type="email"
          value={value.email}
          onChange={(e) => set("email")(e.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
          className="w-full rounded-[10px] border border-ash-400 bg-white px-4 py-3 text-[15px] outline-none focus:border-lemon-600"
        />
      </label>
      </div>
    </div>
  );
}
