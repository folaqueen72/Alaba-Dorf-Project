import { prisma } from "./prisma";

// Top Admins bypass all checks (same full access each, PRD §3B).
// Department admins need an explicit permission row (PRD §4).
export async function hasPermission(
  userId: string,
  resource: string,
  action: string
): Promise<boolean> {
  const profile = await prisma.adminProfile.findUnique({
    where: { userId },
  });
  if (!profile || !profile.active) return false;
  if (profile.role === "TOP") return true;
  const grant = await prisma.permission.findUnique({
    where: { userId_resource_action: { userId, resource, action } },
  });
  return grant !== null;
}
