"use client";

import Link from "next/link";
import { authClient } from "@/lib/auth-client";

export function AuthStatus() {
  const { data: session, isPending } = authClient.useSession();
  const user =
    session?.user && !(session.user as { isAnonymous?: boolean }).isAnonymous
      ? session.user
      : null;

  if (isPending) {
    return (
      <span className="px-2 sm:px-3 py-2 text-sm font-semibold text-ash-200">
        …
      </span>
    );
  }

  if (!user) {
    return (
      <Link
        href="/login"
        className="px-2 sm:px-3 py-2 rounded-lg text-sm font-semibold bg-lemon-600 text-white hover:bg-lemon-700"
      >
        Sign in
      </Link>
    );
  }

  return (
    <span className="flex items-center gap-1 text-sm">
      <span className="hidden sm:inline px-2 py-2 text-ash-200">
        Hi, {user.name.split(" ")[0]}
      </span>
      <button
        type="button"
        onClick={async () => {
          await authClient.signOut();
          window.location.href = "/";
        }}
        className="px-2 sm:px-3 py-2 rounded-lg font-semibold hover:bg-ash-800"
      >
        Sign out
      </button>
    </span>
  );
}
