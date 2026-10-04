import { requireAdmin } from "@/lib/requireAdmin";
import { InventoryManager } from "./InventoryManager";

export const dynamic = "force-dynamic";

export default async function AdminInventoryPage() {
  await requireAdmin(["FARM"]);
  return (
    <>
      <h1 className="font-display text-3xl font-semibold mb-1">Inventory</h1>
      <p className="text-ash-600 mb-4">
        Egg stock and price. Every change is recorded with your name on it.
      </p>
      <InventoryManager />
    </>
  );
}
