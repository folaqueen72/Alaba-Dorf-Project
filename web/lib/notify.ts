import webpush from "web-push";
import { prisma } from "./prisma";

// Web Push for order updates. Works once VAPID_* keys are set; every send
// is best-effort and never breaks the order flow.
export function pushConfigured(): boolean {
  return !!(
    process.env.VAPID_PUBLIC_KEY &&
    process.env.VAPID_PRIVATE_KEY &&
    process.env.VAPID_SUBJECT
  );
}

function vapid() {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT!,
    process.env.VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  );
}

export async function notifyCustomer(
  customerId: string,
  payload: { title: string; body: string; url?: string }
): Promise<void> {
  if (!pushConfigured()) return;
  const subs = await prisma.pushSubscription.findMany({
    where: { customerId },
  });
  if (subs.length === 0) return;
  vapid();
  await Promise.all(
    subs.map(async (s) => {
      try {
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          JSON.stringify(payload)
        );
      } catch {
        // Expired/revoked (410/404): drop the dead subscription.
        await prisma.pushSubscription
          .delete({ where: { id: s.id } })
          .catch(() => null);
      }
    })
  );
}
