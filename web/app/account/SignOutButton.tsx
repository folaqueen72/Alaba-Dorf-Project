"use client";

import { Button } from "../components/ui/Button";
import { authClient } from "@/lib/auth-client";

export function SignOutButton() {
  return (
    <Button
      variant="outline"
      className="w-full mt-2"
      onClick={async () => {
        await authClient.signOut();
        window.location.href = "/";
      }}
    >
      Sign out
    </Button>
  );
}
