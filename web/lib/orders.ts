import type { Prisma } from "@prisma/client";
import { prisma } from "./prisma";

// Server-side order helpers. All prices and totals are computed here —
// never trust client-supplied amounts. Money in kobo.

export type Tx = Prisma.TransactionClient;

export async function nextOrderNo(
  tx: Tx
): Promise<{ orderNo: string }> {
  const rows = await tx.$queryRaw<Array<{ next: number }>>`
    SELECT next FROM counter WHERE id = 'order' FOR UPDATE
  `;
  if (rows.length === 0) throw new Error("order counter missing — run seed");
  const orderNo = `ADO${rows[0].next}`;
  await tx.$executeRaw`
    UPDATE counter SET next = next + 1 WHERE id = 'order'
  `;
  return { orderNo };
}

export async function findOrCreateCustomer(
  tx: Tx,
  input: { name: string; phone: string; email?: string; address?: string },
  authUserId?: string | null
) {
  const phone = input.phone.replace(/[\s-]/g, "");
  const existing = await tx.customer.findUnique({ where: { phone } });
  if (existing) {
    // Backfill the login link when a guest later registers (PRD §18).
    if (authUserId && !existing.userId) {
      return tx.customer.update({
        where: { id: existing.id },
        data: {
          userId: authUserId,
          name: input.name,
          email: input.email ?? existing.email,
          address: input.address ?? existing.address,
        },
      });
    }
    return existing;
  }
  return tx.customer.create({
    data: {
      name: input.name,
      phone,
      email: input.email,
      address: input.address,
      userId: authUserId ?? undefined,
    },
  });
}

export function cleanPhone(phone: string): string {
  return phone.replace(/[\s-]/g, "");
}

export function assertCustomer(input: {
  name?: string;
  phone?: string;
}): asserts input is { name: string; phone: string } {
  if (!input.name || input.name.trim().length < 2)
    throw new Error("Please enter your full name.");
  if (!input.phone || cleanPhone(input.phone).length < 7)
    throw new Error("Please enter a valid phone number.");
}
