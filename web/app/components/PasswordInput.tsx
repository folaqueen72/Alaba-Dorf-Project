"use client";

import { useState } from "react";

export function PasswordInput({
  label,
  value,
  onChange,
  required = false,
  minLength,
  autoComplete,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  minLength?: number;
  autoComplete?: string;
  placeholder?: string;
}) {
  const [show, setShow] = useState(false);
  const id = `pw-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  return (
    <label className="block">
      <span className="block text-sm font-semibold mb-1">{label}</span>
      <span className="relative block">
        <input
          id={id}
          type={show ? "text" : "password"}
          required={required}
          minLength={minLength}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          placeholder={placeholder}
          className="w-full rounded-[10px] border border-ash-400 bg-white px-4 py-3 pr-16 text-[15px] outline-none focus:border-lemon-600"
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          aria-label={show ? "Hide password" : "Show password"}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold px-2 py-1 rounded-lg text-lemon-800 hover:bg-lemon-50"
        >
          {show ? "Hide" : "Show"}
        </button>
      </span>
    </label>
  );
}
