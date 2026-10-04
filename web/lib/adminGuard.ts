import { auth } from "./auth";
import { prisma } from "./prisma";
import type { AdminRole } from "@prisma/client";

// Gate for /api/admin/* routes. TOP passes every department gate (PRD §3B).
export async function adminGuard(req: Request, roles?: AdminRole[]) {
  const session = await auth.api
    .getSession({ headers: req.headers })
    .catch(() => null);
  const userId = session?.user?.id;
  if (!userId)
    return {
      error: Response.json({ error: "Sign in required." }, { status: 401 }),
    };
  const profile = await prisma.adminProfile.findUnique({
    where: { userId },
  });
  if (!profile || !profile.active)
    return {
      error: Response.json({ error: "No admin access." }, { status: 403 }),
    };
  if (roles && profile.role !== "TOP" && !roles.includes(profile.role))
    return {
      error: Response.json(
        { error: "Forbidden for your department." },
        { status: 403 }
      ),
    };
  return { user: session!.user, profile };
}
