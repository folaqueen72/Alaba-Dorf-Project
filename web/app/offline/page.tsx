import Link from "next/link";
import { SiteHeader } from "../components/SiteHeader";
import { Button } from "../components/ui/Button";

export default function OfflinePage() {
  return (
    <>
      <SiteHeader />
      <main className="max-w-md mx-auto px-4 w-full mt-10 text-center">
        <p className="font-display text-3xl font-semibold">You are offline</p>
        <p className="text-ash-600 mt-2">
          Check your connection and try again. Pages you already visited will
          still open; ordering needs the internet.
        </p>
        <Link href="/" className="inline-block mt-4">
          <Button>Back Home</Button>
        </Link>
      </main>
    </>
  );
}
