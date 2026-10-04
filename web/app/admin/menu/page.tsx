import { requireAdmin } from "@/lib/requireAdmin";
import { MenuManager } from "./MenuManager";

export const dynamic = "force-dynamic";

export default async function AdminMenuPage() {
  await requireAdmin(["EATERY"]);
  return (
    <>
      <h1 className="font-display text-3xl font-semibold mb-1">
        Eatery Menu
      </h1>
      <p className="text-ash-600 mb-4">
        Add dishes, hide sold-out items, attach photos. Changes show on the
        customer menu immediately.
      </p>
      <MenuManager />
    </>
  );
}
