"use client";

import { useState } from "react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { PasswordInput } from "../components/PasswordInput";
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
        <PasswordInput
          label="Current password"
          value={current}
          onChange={setCurrent}
          required
        />
        <PasswordInput
          label="New password (8+ characters)"
          value={next}
          onChange={setNext}
          required
          minLength={8}
        />
        <PasswordInput
          label="Confirm new password"
          value={confirm}
          onChange={setConfirm}
          required
        />
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
