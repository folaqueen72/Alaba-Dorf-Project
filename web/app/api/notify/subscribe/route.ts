import { prisma } from "@/lib/prisma";
import { cleanPhone } from "@/lib/orders";

// POST /api/notify/subscribe {endpoint, keys:{p256dh,auth}, phone?}
// Links a browser push subscription to a customer (by phone, if given).
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const { endpoint, keys, phone } = body ?? {};
  try {
    if (!endpoint || !keys?.p256dh || !keys?.auth)
      throw new Error("Invalid subscription.");
    let customerId: string | undefined;
    if (phone) {
      const customer = await prisma.customer.findUnique({
        where: { phone: cleanPhone(phone) },
      });
      if (customer) customerId = customer.id;
    }
    await prisma.pushSubscription.upsert({
      where: { endpoint },
      update: {
        p256dh: keys.p256dh,
        auth: keys.auth,
        ...(customerId ? { customerId } : {}),
      },
      create: {
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
        ...(customerId ? { customerId } : {}),
      },
    });
    return Response.json({ ok: true });
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : "Subscribe failed." },
      { status: 400 }
    );
  }
}

// DELETE /api/notify/subscribe {endpoint}
export async function DELETE(req: Request) {
  const body = await req.json().catch(() => null);
  if (body?.endpoint) {
    await prisma.pushSubscription
      .delete({ where: { endpoint: body.endpoint } })
      .catch(() => null);
  }
  return Response.json({ ok: true });
}
