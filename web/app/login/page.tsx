"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { SiteHeader } from "../components/SiteHeader";
import { SiteFooter } from "../components/SiteFooter";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { PasswordInput } from "../components/PasswordInput";
import { authClient } from "@/lib/auth-client";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await authClient.signIn.email({ email, password });
    setBusy(false);
    if (res.error) {
      setError("Invalid email or password.");
      return;
    }
    router.push(params.get("next") ?? "/");
    router.refresh();
  }

  return (
    <main className="max-w-md mx-auto px-4 w-full mt-8">
      <Card title="Sign in">
        <p className="text-sm text-ash-600 mt-1">
          Signed-in customers skip retyping their details at checkout, and
          their orders stay linked to one place.
        </p>
        <form onSubmit={submit} className="space-y-3 mt-3">
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
          <PasswordInput
            label="Password"
            value={password}
            onChange={setPassword}
            required
          />
          {error ? <p className="text-sm font-semibold">{error}</p> : null}
          <Button className="w-full" disabled={busy}>
            {busy ? "Signing in…" : "Sign in"}
          </Button>
        </form>
        <p className="text-sm text-ash-600 mt-3">
          New here?{" "}
          <Link href="/signup" className="font-bold text-lemon-800 underline underline-offset-4">
            Create an account
          </Link>{" "}
          — or just continue as a guest, no problem.
        </p>
      </Card>
    </main>
  );
}

export default function LoginPage() {
  return (
    <>
      <SiteHeader />
      <Suspense>
        <LoginForm />
      </Suspense>
      <SiteFooter />
    </>
  );
}
