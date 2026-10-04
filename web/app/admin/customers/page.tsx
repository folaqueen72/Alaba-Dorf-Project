import { requireAdmin } from "@/lib/requireAdmin";
import { CustomersManager } from "./CustomersManager";

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage() {
  await requireAdmin();
  return (
    <>
      <h1 className="font-display text-3xl font-semibold mb-1">Customers</h1>
      <p className="text-ash-600 mb-4">
        Search by name or phone, then open the full order and booking history.
      </p>
      <CustomersManager />
    </>
  );
}
