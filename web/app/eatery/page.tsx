import { SiteHeader } from "../components/SiteHeader";
import { SiteFooter } from "../components/SiteFooter";
import { Card } from "../components/ui/Card";
import { EateryOrder, type MenuLine } from "./EateryOrder";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function EateryPage() {
  const items = await prisma.menuItem.findMany({ orderBy: { name: "asc" } });
  const menu: MenuLine[] = items
    .filter((m) => m.available)
    .map((m) => ({
      id: m.id,
      name: m.name,
      desc: m.description ?? "",
      price: m.price,
      soldOut: false,
    }))
    .concat(
      items
        .filter((m) => !m.available)
        .map((m) => ({
          id: m.id,
          name: m.name,
          desc: m.description ?? "",
          price: m.price,
          soldOut: true,
        }))
    );

  return (
    <>
      <SiteHeader />
      <main className="max-w-5xl mx-auto px-4 w-full">
        <h1 className="font-display text-3xl sm:text-4xl font-semibold mt-6 mb-1">
          Eatery — Hot Food
        </h1>
        <p className="text-ash-600 mb-4">
          Wetin dey kitchen na wetin you see. Add to cart, drop your details,
          done.
        </p>
        <Card>
          <EateryOrder menu={menu} />
        </Card>
      </main>
      <SiteFooter />
    </>
  );
}
