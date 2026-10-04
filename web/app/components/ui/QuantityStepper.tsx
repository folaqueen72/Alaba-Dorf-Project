"use client";

export function QuantityStepper({
  value,
  min = 1,
  max = 99,
  onChange,
}: {
  value: number;
  min?: number;
  max?: number;
  onChange: (next: number) => void;
}) {
  return (
    <div className="inline-flex items-center border border-ash-400 rounded-[10px] bg-white overflow-hidden">
      <button
        type="button"
        aria-label="Decrease quantity"
        disabled={value <= min}
        onClick={() => onChange(value - 1)}
        className="w-11 h-11 text-xl font-bold disabled:text-ash-400 hover:bg-ash-100"
      >
        −
      </button>
      <span className="w-12 text-center font-bold tabular-nums">{value}</span>
      <button
        type="button"
        aria-label="Increase quantity"
        disabled={value >= max}
        onClick={() => onChange(value + 1)}
        className="w-11 h-11 text-xl font-bold disabled:text-ash-400 hover:bg-ash-100"
      >
        +
      </button>
    </div>
  );
}
