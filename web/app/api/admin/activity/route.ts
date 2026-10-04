import { prisma } from "@/lib/prisma";
import { adminGuard } from "@/lib/adminGuard";

export async function GET(req: Request) {
  const gate = await adminGuard(req);
  if ("error" in gate) return gate.error;
  const take = Math.min(
    Number(new URL(req.url).searchParams.get("take") ?? 100),
    500
  );
  const logs = await prisma.activityLog.findMany({
    include: { actor: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" },
    take,
  });
  return Response.json({ logs });
}
