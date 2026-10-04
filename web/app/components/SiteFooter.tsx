import Link from "next/link";
import Image from "next/image";

export function SiteFooter() {
  return (
    <footer className="bg-ink text-white mt-10">
      <div className="max-w-5xl mx-auto px-4 py-8 grid gap-6 sm:grid-cols-3 text-sm">
        <div>
          <div className="flex items-center gap-2.5 mb-2">
            <Image
              src="/logo.png"
              alt="Alaba Dorf Outlet logo"
              width={36}
              height={36}
              className="rounded-full bg-white"
            />
            <p className="font-display text-lg font-semibold">
              Alaba Dorf Outlet
            </p>
          </div>
          <p className="text-ash-200">
            Farm · Cow &amp; Pig Sharing · Photo Studio · Eatery.
            <br />
            Order online, pay online, collect your goods.
          </p>
        </div>
        <div>
          <p className="font-bold mb-2">Order</p>
          <ul className="space-y-1 text-ash-200">
            <li>
              <Link href="/farm" className="hover:text-white">
                Eggs &amp; Meat
              </Link>
            </li>
            <li>
              <Link href="/eatery" className="hover:text-white">
                Eatery Menu
              </Link>
            </li>
            <li>
              <Link href="/studio" className="hover:text-white">
                Photo Studio
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="font-bold mb-2">Visit Us</p>
          <p className="text-ash-200">
            Come pick up daily, or choose delivery for farm and food orders.
          </p>
          <Link
            href="/track"
            className="inline-block mt-2 underline underline-offset-4"
          >
            Track your order
          </Link>
        </div>
      </div>
    </footer>
  );
}
