"use client";

export type CustomerInput = {
  name: string;
  phone: string;
  address: string;
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
  const set = (k: keyof CustomerInput) => (v: string) =>
    onChange({ ...value, [k]: v });
  return (
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
    </div>
  );
}
