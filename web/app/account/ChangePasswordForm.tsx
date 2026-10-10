"use client";

import { useState } from "react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { authClient } from "@/lib/auth-client";

export function ChangePasswordForm() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setDone(false);
    if (next.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }
    if (next !== confirm) {
      setError("New passwords do not match.");
      return;
    }
    setBusy(true);
    const res = await authClient.changePassword({
      currentPassword: current,
      newPassword: next,
      revokeOtherSessions: true,
    });
    setBusy(false);
    if (res.error) {
      setError(
        "Could not change password. Check your current password and try again."
      );
      return;
    }
    setCurrent("");
    setNext("");
    setConfirm("");
    setDone(true);
  }

  return (
    <Card title="Change password">
      <p className="text-sm text-ash-600 mt-1">
        You must enter your current password — no email code needed. Other
        signed-in devices are signed out automatically.
      </p>
      <form onSubmit={submit} className="space-y-3 mt-3">
        <label className="block">
          <span className="block text-sm font-semibold mb-1">
            Current password
          </span>
          <input
            type="password"
            required
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            autoComplete="current-password"
            className="w-full rounded-[10px] border border-ash-400 bg-white px-4 py-3 text-[15px] outline-none focus:border-lemon-600"
          />
        </label>
        <label className="block">
          <span className="block text-sm font-semibold mb-1">
            New password (8+ characters)
          </span>
          <input
            type="password"
            required
            minLength={8}
            value={next}
            onChange={(e) => setNext(e.target.value)}
            autoComplete="new-password"
            className="w-full rounded-[10px] border border-ash-400 bg-white px-4 py-3 text-[15px] outline-none focus:border-lemon-600"
          />
        </label>
        <label className="block">
          <span className="block text-sm font-semibold mb-1">
            Confirm new password
          </span>
          <input
            type="password"
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
            className="w-full rounded-[10px] border border-ash-400 bg-white px-4 py-3 text-[15px] outline-none focus:border-lemon-600"
          />
        </label>
        {error ? <p className="text-sm font-semibold">{error}</p> : null}
        {done ? (
          <p className="text-sm font-semibold text-lemon-800">
            Password changed. Use the new one next time you sign in.
          </p>
        ) : null}
        <Button className="w-full" disabled={busy}>
          {busy ? "Changing…" : "Change password"}
        </Button>
      </form>
    </Card>
  );
}
