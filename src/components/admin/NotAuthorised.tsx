"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Shown when someone is signed in but is not on the admin allow-list. It says
 * nothing about who is on the team.
 */
export default function NotAuthorised() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const signOut = async () => {
    setBusy(true);
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } catch {
      /* fall through to the redirect either way */
    }
    router.push("/admin/login?error=not-authorised");
    router.refresh();
  };

  return (
    <div className="gate">
      <div className="gate-card">
        <p className="gate-eyebrow">Law Member Network</p>
        <h1 className="gate-title">You do not have console access</h1>
        <p className="gate-copy">
          This account is signed in but is not on the admin team. If that is not right,
          ask an owner to add you, then sign in again.
        </p>
        <button
          type="button"
          className="btn btn--gold"
          onClick={() => void signOut()}
          disabled={busy}
        >
          {busy ? "Signing out…" : "Sign out"}
        </button>
      </div>
    </div>
  );
}
