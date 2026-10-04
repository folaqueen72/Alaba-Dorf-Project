import type { Prisma, PrismaClient } from "@prisma/client";

type Db = PrismaClient | Prisma.TransactionClient;

export async function logActivity(
  db: Db,
  entry: {
    actorId?: string | null;
    action: string;
    entity: string;
    entityId?: string | null;
    before?: Prisma.InputJsonValue | null;
    after?: Prisma.InputJsonValue | null;
  }
) {
  await db.activityLog.create({
    data: {
      actorId: entry.actorId ?? null,
      action: entry.action,
      entity: entry.entity,
      entityId: entry.entityId ?? null,
      before: entry.before ?? undefined,
      after: entry.after ?? undefined,
    },
  });
}
