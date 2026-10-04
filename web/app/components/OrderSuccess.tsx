import Link from "next/link";
import { Button } from "./ui/Button";
import { koboToNaira } from "@/lib/format";

export function OrderSuccess({
  ref,
  total,
  note,
}: {
  ref: string;
  total?: number;
  note: string;
}) {
  return (
    <div className="bg-lemon-100 border border-lemon-600 rounded-xl p-6 text-center">
      <p className="font-display text-3xl font-semibold">Order received!</p>
      <p className="mt-2 font-bold text-xl">#{ref}</p>
      {typeof total === "number" ? (
        <p className="text-ash-600 mt-1">Total: {koboToNaira(total)}</p>
      ) : null}
      <p className="text-sm text-ash-600 mt-2 max-w-md mx-auto">{note}</p>
      <div className="mt-4 flex flex-wrap gap-2 justify-center">
        <Link href={`/track?orderNo=${encodeURIComponent(ref)}`}>
          <Button>Track This Order</Button>
        </Link>
        <Link href="/">
          <Button variant="outline" className="bg-white">
            Back Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
