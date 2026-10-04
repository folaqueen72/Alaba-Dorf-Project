import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "./auth";
import { prisma } from "./prisma";
import type { AdminRole } from "@prisma/client";

// Department pages pass their own role (e.g. ["FARM"]); TOP always passes.
export async function requireAdmin(allowed?: AdminRole[]) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/admin/login");
  const profile = await prisma.adminProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!profile || !profile.active) redirect("/admin/login?error=no-access");
  if (
    allowed &&
    profile.role !== "TOP" &&
    !allowed.includes(profile.role)
  ) {
    redirect("/admin/login?error=forbidden");
  }
  return { user: session.user, profile };
}
