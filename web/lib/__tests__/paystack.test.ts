import { describe, expect, it } from "vitest";
import { createHmac } from "crypto";
import { verifyWebhookSignature } from "../paystack";

describe("paystack webhook verification", () => {
  const secret = "test-secret";
  const body = JSON.stringify({ event: "charge.success" });

  it("accepts a valid signature", () => {
    process.env.PAYSTACK_SECRET_KEY = secret;
    const sig = createHmac("sha512", secret).update(body).digest("hex");
    expect(verifyWebhookSignature(body, sig)).toBe(true);
  });

  it("rejects tampered bodies and missing signatures", () => {
    process.env.PAYSTACK_SECRET_KEY = secret;
    const sig = createHmac("sha512", secret).update(body).digest("hex");
    expect(verifyWebhookSignature(body + "x", sig)).toBe(false);
    expect(verifyWebhookSignature(body, null)).toBe(false);
    expect(verifyWebhookSignature(body, "deadbeef")).toBe(false);
  });
});
