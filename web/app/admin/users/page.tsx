import { requireAdmin } from "@/lib/requireAdmin";
import { UsersManager } from "./UsersManager";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  await requireAdmin(["TOP"]);
  return (
    <>
      <h1 className="font-display text-3xl font-semibold mb-1">
        Admin Accounts
      </h1>
      <p className="text-ash-600 mb-4">
        Top Admins only. Two Top Admin slots maximum — create department
        admins and control exactly what each one can touch.
      </p>
      <UsersManager />
    </>
  );
}
