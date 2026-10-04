import { requireAdmin } from "@/lib/requireAdmin";
import { ReportsManager } from "./ReportsManager";

export const dynamic = "force-dynamic";

export default async function AdminReportsPage() {
  await requireAdmin();
  return (
    <>
      <h1 className="font-display text-3xl font-semibold mb-1">Reports</h1>
      <p className="text-ash-600 mb-4">
        Sales and orders by date and department, downloadable as CSV.
      </p>
      <ReportsManager />
    </>
  );
}
