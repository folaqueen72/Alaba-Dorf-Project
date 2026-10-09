import { SiteHeader } from "../components/SiteHeader";
import { SiteFooter } from "../components/SiteFooter";
import { Card } from "../components/ui/Card";
import { EggOrderCard } from "./EggOrderCard";
import { MeatOrderCard } from "./MeatOrderCard";
import { PoultryOrder, type PoultryLine } from "./PoultryOrder";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const BIRD_NAMES: Record<string, string> = {
  TURKEY: "Turkey",
  BROILER: "Chicken",
};

export default async function FarmPage() {
  const inv = await prisma.eggInventory.findUnique({
    where: { id: "eggs" },
  });
  const animals = await prisma.animal.findMany({ orderBy: { tag: "asc" } });

  const available = inv
    ? inv.totalCrates - inv.reservedCrates - inv.soldCrates
    : 0;

  const redMeat = animals.filter(
    (a) => a.type === "COW" || a.type === "PIG"
  );
  const poultry: PoultryLine[] = animals
    .filter((a) => a.type === "TURKEY" || a.type === "BROILER")
    .map((a) => ({
      id: a.id,
      tag: a.tag,
      bird: BIRD_NAMES[a.type] ?? a.type,
      availableKg: Number(a.availableKg),
      pricePerKg: a.pricePerKg,
      livePrice: a.livePrice,
      liveStock: a.liveStock,
      active: a.status === "AVAILABLE",
      imageKey: a.imageKey,
    }));

  return (
    <>
      <SiteHeader />
      <main className="max-w-5xl mx-auto px-4 w-full">
        <h1 className="font-display text-3xl sm:text-4xl font-semibold mt-6 mb-1">
          Farm — Eggs, Meat &amp; Poultry
        </h1>
        <p className="text-ash-600 mb-4">
          Fresh crates, shared animals and poultry. Stock is live — what you
          see is what is available.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <EggOrderCard
            available={available}
            pricePerCrate={inv?.pricePerCrate ?? 0}
            soldOut={available <= 0}
          />

          <Card title="Cow & Pig Sharing">
            <p className="text-sm text-ash-600 mt-1 mb-3">
              Reserve kilos in your name. Final weight and payment are sorted
              out after the animal is ready.
            </p>
            <div className="space-y-2">
              {redMeat.map((a) => (
                <MeatOrderCard
                  key={a.id}
                  animalId={a.id}
                  tag={a.tag}
                  availableKg={Number(a.availableKg)}
                  pricePerKg={a.pricePerKg}
                  active={a.status === "AVAILABLE"}
                />
              ))}
            </div>
          </Card>
        </div>

        <Card title="Poultry — Turkey & Chicken" className="mt-4">
          <p className="text-sm text-ash-600 mt-1 mb-3">
            Choose your bird, then live birds or per-kilo portions.
          </p>
          <PoultryOrder batches={poultry} />
        </Card>
      </main>
      <SiteFooter />
    </>
  );
}
