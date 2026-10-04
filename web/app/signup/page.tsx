"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SiteHeader } from "../components/SiteHeader";
import { SiteFooter } from "../components/SiteFooter";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { authClient } from "@/lib/auth-client";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await authClient.signUp.email({ name, email, password });
    setBusy(false);
    if (res.error) {
      setError("Could not create the account. Try a different email.");
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <>
      <SiteHeader />
      <main className="max-w-md mx-auto px-4 w-full mt-8">
        <Card title="Create an account">
          <p className="text-sm text-ash-600 mt-1">
            One account for faster checkout and your full order history.
          </p>
          <form onSubmit={submit} className="space-y-3 mt-3">
            <label className="block">
              <span className="block text-sm font-semibold mb-1">
                Full name
              </span>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Adeola Balogun"
                autoComplete="name"
                className="w-full rounded-[10px] border border-ash-400 bg-white px-4 py-3 text-[15px] outline-none focus:border-lemon-600"
              />
            </label>
            <label className="block">
              <span className="block text-sm font-semibold mb-1">Email</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                className="w-full rounded-[10px] border border-ash-400 bg-white px-4 py-3 text-[15px] outline-none focus:border-lemon-600"
              />
            </label>
            <label className="block">
              <span className="block text-sm font-semibold mb-1">
                Password
              </span>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                className="w-full rounded-[10px] border border-ash-400 bg-white px-4 py-3 text-[15px] outline-none focus:border-lemon-600"
              />
            </label>
            {error ? <p className="text-sm font-semibold">{error}</p> : null}
            <Button className="w-full" disabled={busy}>
              {busy ? "Creating account…" : "Create account"}
            </Button>
          </form>
          <p className="text-sm text-ash-600 mt-3">
            Already have one?{" "}
            <Link href="/login" className="font-bold text-lemon-800 underline underline-offset-4">
              Sign in
            </Link>
          </p>
        </Card>
      </main>
      <SiteFooter />
    </>
  );
}
