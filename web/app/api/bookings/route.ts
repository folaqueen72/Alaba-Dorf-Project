import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { assertCustomer, findOrCreateCustomer } from "@/lib/orders";

type Body = {
  sessionTypeId: string;
  slotId: string;
  customer: { name: string; phone: string; email?: string };
};

export async function POST(req: Request) {
  let body: Body;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  try {
    const session = await auth.api
      .getSession({ headers: req.headers })
      .catch(() => null);
    const rawUser = session?.user as
      | { id: string; name?: string; isAnonymous?: boolean }
      | undefined;
    const sessionUserId =
      rawUser && !rawUser.isAnonymous ? rawUser.id : null;
    const customerInput = {
      ...body.customer,
      name: body.customer.name?.trim() || rawUser?.name || "",
    };
    assertCustomer(customerInput);
    if (!body.sessionTypeId || !body.slotId)
      throw new Error("Pick a session and a time slot.");

    const result = await prisma.$transaction(async (tx) => {
      const customer = await findOrCreateCustomer(
        tx,
        customerInput,
        sessionUserId
      );
      // Lock the slot row: concurrent bookings serialize here, so a slot
      // can never be double-booked (PRD §8.3).
      const locked = await tx.$queryRaw<Array<{ id: string; status: string }>>`
        SELECT id, status FROM studio_slot WHERE id = ${body.slotId} FOR UPDATE
      `;
      const slot = locked[0];
      if (!slot || slot.status !== "AVAILABLE")
        throw new Error("That slot was just taken — pick another time.");
      const sessionType = await tx.sessionType.findUnique({
        where: { id: body.sessionTypeId },
      });
      if (!sessionType || !sessionType.active)
        throw new Error("That session is no longer offered.");

      const payment = await tx.payment.create({
        data: {
          provider: "paystack",
          reference: `STU-${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
          amount: sessionType.price,
          status: "UNPAID",
        },
      });
      const booking = await tx.booking.create({
        data: {
          customerId: customer.id,
          sessionTypeId: sessionType.id,
          slotId: slot.id,
          paymentId: payment.id,
        },
      });
      await tx.studioSlot.update({
        where: { id: slot.id },
        data: { status: "BOOKED" },
      });
      return { bookingId: booking.id, amount: sessionType.price };
    });

    return Response.json(result);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Booking failed.";
    const conflict = /just taken/i.test(message);
    return Response.json(
      { error: message },
      { status: conflict ? 409 : 400 }
    );
  }
}
