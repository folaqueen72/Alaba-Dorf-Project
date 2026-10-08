// Transactional email via Resend (direct API, no SDK). Skips silently until
// RESEND_API_KEY + EMAIL_FROM are set — V1 also works without email.
export function emailConfigured(): boolean {
  return !!(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);
}

function esc(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    c === "&"
      ? "&amp;"
      : c === "<"
        ? "&lt;"
        : c === ">"
          ? "&gt;"
          : c === '"'
            ? "&quot;"
            : "&#39;"
  );
}

export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
}): Promise<{ sent: boolean }> {
  if (!emailConfigured() || !opts.to) return { sent: false };
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM,
        to: opts.to,
        subject: opts.subject,
        html: opts.html,
      }),
    });
    return { sent: res.ok };
  } catch {
    return { sent: false };
  }
}

export function orderEmail(name: string, ref: string, total: string): string {
  return `<p>Hello ${esc(name)},</p><p>We received your order <b>#${esc(ref)}</b> (${esc(total)}). Track it anytime with your order number and phone number.</p><p>Thank you for choosing Alaba Dorf Outlet.</p>`;
}

export function bookingEmail(name: string, ref: string, when: string): string {
  return `<p>Hello ${esc(name)},</p><p>Your photo session is booked: <b>${esc(ref)}</b> — ${esc(when)}. We will confirm payment and session details with you.</p><p>Thank you for choosing Alaba Dorf Outlet.</p>`;
}

export function paidEmail(name: string, ref: string, total: string): string {
  return `<p>Hello ${esc(name)},</p><p>Payment of ${esc(total)} confirmed for <b>#${esc(ref)}</b>. We are on it — track your order for live updates.</p><p>Thank you for choosing Alaba Dorf Outlet.</p>`;
}
