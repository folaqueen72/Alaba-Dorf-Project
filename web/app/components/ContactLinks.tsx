"use client";

function PhoneIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
    </svg>
  );
}

function WhatsAppIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-9.1 13.5c-2.5 0-4.6-2-4.6-4.6 0-2.5 2-4.6 4.6-4.6 2.5 0 4.6 2 4.6 4.6 0 2.5-2.1 4.6-4.6 4.6zm5.4-1.1-1.2-1.2c-.2-.2-.5-.2-.7 0l-.7.7c-.4-.2-.9-.5-1.2-.9-.3-.3-.7-.8-.9-1.2l.7-.7c.2-.2.2-.5 0-.7L11.1 9c-.2-.2-.5-.2-.7 0l-.4.4c-.2.3-.3.7-.2 1.1.3 1.2 1.7 3 3 3.5.4.1.8 0 1.1-.2l.4-.4c.2-.2.5-.2.7 0l1.2 1.2c.2.2.2.5 0 .7l-.3.3c-.2.2-.4.2-.6 0z" />
    </svg>
  );
}

export const CONTACT_NUMBERS = [
  { display: "0703 929 6035", tel: "tel:+2347039296035", wa: "https://wa.me/2347039296035" },
  { display: "0816 985 4071", tel: "tel:+2348169854071", wa: "https://wa.me/2348169854071" },
];

export function ContactLinks({ dark = false }: { dark?: boolean }) {
  return (
    <div className="space-y-1.5">
      {CONTACT_NUMBERS.map((n) => (
        <p key={n.display} className="flex items-center gap-2 text-[15px]">
          <span className="font-bold">{n.display}</span>
          <a
            href={n.tel}
            aria-label={`Call ${n.display}`}
            className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg border ${
              dark
                ? "border-ash-600 hover:bg-ash-800"
                : "border-ash-400 bg-white hover:border-lemon-600"
            }`}
          >
            <PhoneIcon /> Call
          </a>
          <a
            href={n.wa}
            target="_blank"
            rel="noreferrer"
            aria-label={`WhatsApp ${n.display}`}
            className="inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg bg-lemon-600 text-white hover:bg-lemon-700"
          >
            <WhatsAppIcon /> WhatsApp
          </a>
        </p>
      ))}
    </div>
  );
}
