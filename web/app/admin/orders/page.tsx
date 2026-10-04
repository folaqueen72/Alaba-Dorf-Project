import { requireAdmin } from "@/lib/requireAdmin";
import { OrdersManager } from "./OrdersManager";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  await requireAdmin();
  return (
    <>
      <h1 className="font-display text-3xl font-semibold mb-1">Orders</h1>
      <p className="text-ash-600 mb-4">
        Search, filter and move every order through preparation to completion.
      </p>
      <OrdersManager />
    </>
  );
}
