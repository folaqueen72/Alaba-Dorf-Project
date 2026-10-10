"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { PasswordInput } from "../../components/PasswordInput";
import { authClient } from "@/lib/auth-client";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(
    params.get("error") === "no-access"
      ? "This account has no admin access."
      : params.get("error") === "forbidden"
        ? "Your department cannot open that page."
        : null
  );

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
    router.push("/admin");
    router.refresh();
  }

  return (
    <main className="max-w-md mx-auto px-4 w-full mt-10">
      <Card title="Admin sign in">
        <form onSubmit={submit} className="space-y-3 mt-2">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-semibold mb-1"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-[10px] border border-ash-400 bg-white px-4 py-3 text-[15px] outline-none focus:border-lemon-600"
            />
          </div>
          <div>
            <PasswordInput
              label="Password"
              value={password}
              onChange={setPassword}
              required
            />
          </div>
          {error ? <p className="text-sm font-semibold">{error}</p> : null}
          <Button className="w-full" disabled={busy}>
            {busy ? "Signing in…" : "Sign in"}
          </Button>
        </form>
      </Card>
    </main>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
