"use client";

export type PayMethod = "CASH" | "TRANSFER" | "CARD";

const OPTIONS: Array<{ value: PayMethod; title: string; desc: string }> = [
  {
    value: "CASH",
    title: "Cash on delivery",
    desc: "Pay cash when you collect or receive your order.",
  },
  {
    value: "TRANSFER",
    title: "Bank transfer",
    desc: "Pay now online through Paystack.",
  },
  {
    value: "CARD",
    title: "Card payment",
    desc: "Pay now online through Paystack.",
  },
];

export function PaymentMethodPicker({
  value,
  onChange,
  allowCash = true,
}: {
  value: PayMethod;
  onChange: (next: PayMethod) => void;
  allowCash?: boolean;
}) {
  const options = allowCash
    ? OPTIONS
    : OPTIONS.filter((o) => o.value !== "CASH");
  return (
    <div>
      <p className="text-sm font-semibold mb-2">How do you want to pay?</p>
      <div className="grid gap-2">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={`text-left border rounded-[10px] p-3 ${
              value === o.value
                ? "bg-lemon-50 border-lemon-600"
                : "bg-white border-ash-400"
            }`}
          >
            <p className="font-bold text-[15px]">{o.title}</p>
            <p className="text-sm text-ash-600">{o.desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
