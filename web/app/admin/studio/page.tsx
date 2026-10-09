import { requireAdmin } from "@/lib/requireAdmin";
import { StudioManager } from "./StudioManager";
import { GalleryManager } from "./GalleryManager";

export const dynamic = "force-dynamic";

export default async function AdminStudioPage() {
  await requireAdmin(["STUDIO"]);
  return (
    <>
      <h1 className="font-display text-3xl font-semibold mb-1">
        Studio Calendar
      </h1>
      <p className="text-ash-600 mb-4">
        Open days, block time off, and move bookings through confirmation to
        completion.
      </p>
      <StudioManager />
      <GalleryManager />
    </>
  );
}
