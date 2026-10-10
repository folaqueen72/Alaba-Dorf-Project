import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { SiteHeader } from "../components/SiteHeader";
import { SiteFooter } from "../components/SiteFooter";
import { Card } from "../components/ui/Card";
import { ChangePasswordForm } from "./ChangePasswordForm";
import { SignOutButton } from "./SignOutButton";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const session = await auth.api
    .getSession({ headers: await headers() })
    .catch(() => null);
  const user = session?.user as
    | { name?: string; email?: string; isAnonymous?: boolean }
    | undefined;
  if (!user || user.isAnonymous) redirect("/login?next=/account");

  return (
    <>
      <SiteHeader />
      <main className="max-w-md mx-auto px-4 w-full mt-8">
        <h1 className="font-display text-3xl font-semibold mb-1">My Account</h1>
        <p className="text-ash-600 mb-4">Signed in as {user.email}</p>
        <ChangePasswordForm />
        <Card title="Sign out" className="mt-4">
          <p className="text-sm text-ash-600 mt-1">
            Signs you out on this device.
          </p>
          <SignOutButton />
        </Card>
      </main>
      <SiteFooter />
    </>
  );
}
