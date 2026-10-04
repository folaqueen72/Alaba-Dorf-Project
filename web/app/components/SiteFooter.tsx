import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="bg-ink text-white mt-10">
      <div className="max-w-5xl mx-auto px-4 py-8 grid gap-6 sm:grid-cols-3 text-sm">
        <div>
          <p className="font-display text-lg font-semibold mb-2">
            Alaba Dorf Outlet
          </p>
          <p className="text-ash-200">
            Farm · Cow &amp; Pig Sharing · Photo Studio · Eatery
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
            Pickup available daily.
            <br />
            Delivery at checkout.
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
