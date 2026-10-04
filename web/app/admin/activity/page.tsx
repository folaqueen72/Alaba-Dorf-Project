import { requireAdmin } from "@/lib/requireAdmin";
import { prisma } from "@/lib/prisma";
import { Card } from "../../components/ui/Card";

export const dynamic = "force-dynamic";

export default async function AdminActivityPage() {
  await requireAdmin();
  const logs = await prisma.activityLog.findMany({
    include: { actor: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return (
    <>
      <h1 className="font-display text-3xl font-semibold mb-1">
        Activity Record
      </h1>
      <p className="text-ash-600 mb-4">
        Who did what, and when. Newest first.
      </p>
      <Card>
        <ul className="text-sm space-y-2 mt-1">
          {logs.map((l) => (
            <li key={l.id} className="border-b border-ash-100 pb-2">
              <b>{l.action}</b> — {l.entity}
              {l.entityId ? ` ${l.entityId}` : ""}
              <span className="block text-ash-600">
                {l.actor ? `${l.actor.name} (${l.actor.email})` : "System"} ·{" "}
                {l.createdAt.toLocaleString("en-NG")}
              </span>
            </li>
          ))}
          {logs.length === 0 ? (
            <li className="text-ash-600">Nothing recorded yet.</li>
          ) : null}
        </ul>
      </Card>
    </>
  );
}
