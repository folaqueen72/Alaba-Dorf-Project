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
      imageKey: m.imageKey,
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
          imageKey: m.imageKey,
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
          Only what is in the kitchen is listed here. Add to cart, enter your
          details, done.
        </p>
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            ["/gallery/grilled-turkey.jpg", "Seasoned grilled turkey"],
            ["/gallery/plate-2.jpg", "Rice and chicken, served hot"],
            ["/gallery/burgers.jpg", "Loaded burgers with drinks"],
          ].map(([src, alt]) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={src}
              src={src}
              alt={alt}
              className="w-full aspect-square rounded-[10px] object-cover border border-ash-200"
              loading="lazy"
            />
          ))}
        </div>
        <Card>
          <EateryOrder menu={menu} />
        </Card>
      </main>
      <SiteFooter />
    </>
  );
}
