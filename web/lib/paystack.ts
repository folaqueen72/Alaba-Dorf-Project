import { createHmac } from "crypto";

// Paystack: intitialize collections + verify webhooks. Until the business
// adds PAYSTACK_* keys, the shop runs in record-mode (orders tracked, payment
// confirmed by staff) and every pay action explains what is missing.
export function paystackConfigured(): boolean {
  return !!(process.env.PAYSTACK_PUBLIC_KEY && process.env.PAYSTACK_SECRET_KEY);
}

export async function startTransaction(opts: {
  email: string;
  amountKobo: number;
  reference: string;
  callbackUrl: string;
}): Promise<{ authorizationUrl: string }> {
  if (!paystackConfigured()) throw new Error("Online payment is not set up yet.");
  const res = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: opts.email,
      amount: opts.amountKobo,
      reference: opts.reference,
      callback_url: opts.callbackUrl,
    }),
  });
  const data = await res.json();
  if (!data?.status || !data?.data?.authorization_url)
    throw new Error(data?.message ?? "Could not start payment.");
  return { authorizationUrl: data.data.authorization_url };
}

export function verifyWebhookSignature(
  rawBody: string,
  signature: string | null
): boolean {
  if (!signature || !process.env.PAYSTACK_SECRET_KEY) return false;
  const hash = createHmac("sha512", process.env.PAYSTACK_SECRET_KEY)
    .update(rawBody)
    .digest("hex");
  return hash === signature;
}
