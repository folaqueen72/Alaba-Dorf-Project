import { prisma } from "@/lib/prisma";
import { fulfillPayment, verifyWithPaystack } from "@/lib/payments";

// Called when the customer returns from Paystack (or presses "I've paid").
// Verifies directly with Paystack, then fulfills — so confirmation no longer
// depends solely on the webhook arriving.
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  let reference = ((body?.reference ?? "") as string).trim();
  if (!reference && body?.orderNo) {
    const order = await prisma.order.findFirst({
      where: {
        orderNo: {
          equals: String(body.orderNo).replace(/^#/, ""),
          mode: "insensitive",
        },
      },
      include: { payment: true },
    });
    reference = order?.payment?.reference ?? "";
  }
  if (!reference)
    return Response.json({ error: "Missing reference." }, { status: 400 });
  try {
    const { paid } = await verifyWithPaystack(reference);
    if (!paid)
      return Response.json(
        { paid: false, message: "Paystack has not confirmed this payment yet. If you just paid, wait a minute and try again." },
        { status: 202 }
      );
    const result = await fulfillPayment(reference);
    return Response.json({ paid: true, ...result });
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : "Verification failed." },
      { status: 400 }
    );
  }
}
