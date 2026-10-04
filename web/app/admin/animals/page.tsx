import { requireAdmin } from "@/lib/requireAdmin";
import { AnimalsManager } from "./AnimalsManager";

export const dynamic = "force-dynamic";

export default async function AdminAnimalsPage() {
  await requireAdmin(["FARM"]);
  return (
    <>
      <h1 className="font-display text-3xl font-semibold mb-1">
        Cow &amp; Pig Sharing
      </h1>
      <p className="text-ash-600 mb-4">
        List animals, set prices, and correct the final weight after
        slaughter — reserved kilos are protected.
      </p>
      <AnimalsManager />
    </>
  );
}
