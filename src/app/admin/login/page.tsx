"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import "../(console)/admin.css";

type Step = "email" | "code";

export default function AdminLoginPage() {
  const router = useRouter();

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [next, setNext] = useState("/admin");

  /**
   * Read ?next and ?error from the URL directly rather than through
   * useSearchParams, so this page needs no Suspense boundary.
   */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const nextParam = params.get("next");
    // Only ever follow an in-app path — never an absolute URL from the query.
    if (nextParam && nextParam.startsWith("/") && !nextParam.startsWith("//")) {
      setNext(nextParam);
    }
    if (params.get("error") === "not-authorised") {
      setError(
        "That account does not have console access. Ask an owner to add you, then try again."
      );
    }
  }, []);

  async function readError(res: Response): Promise<string | null> {
    try {
      const json = (await res.json()) as { error?: unknown };
      return typeof json.error === "string" ? json.error : null;
    } catch {
      return null;
    }
  }

  const requestCode = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      if (!res.ok) {
        setError((await readError(res)) ?? "Could not send the code. Please try again.");
        return;
      }
      // The route deliberately does not reveal whether an address is on the
      // admin team. Neither does this message.
      setNotice("If that address is on the admin team, a 6-digit code is on its way.");
      setStep("code");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const verifyCode = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), code: code.trim() }),
      });
      if (!res.ok) {
        setError((await readError(res)) ?? "That code is not valid or has expired.");
        return;
      }
      router.push(next || "/admin");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const reset = () => {
    setStep("email");
    setCode("");
    setError(null);
    setNotice(null);
  };

  return (
    <div className="gate">
      <div className="gate-card">
        <p className="gate-eyebrow">Law Member Network</p>
        <h1 className="gate-title">Admin console</h1>
        <p className="gate-sub">Powered by Dominate Law</p>

        {error ? (
          <div className="note note--error" role="alert">
            {error}
          </div>
        ) : null}
        {notice ? (
          <div className="note note--ok" role="status">
            {notice}
          </div>
        ) : null}

        {step === "email" ? (
          <form className="gate-form" onSubmit={requestCode}>
            <label className="field">
              <span className="field-label">Work email</span>
              <input
                className="input"
                type="email"
                name="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@lawmembernetwork.com"
              />
            </label>
            <button type="submit" className="btn btn--gold btn--wide" disabled={busy}>
              {busy ? "Sending…" : "Send sign-in code"}
            </button>
          </form>
        ) : (
          <form className="gate-form" onSubmit={verifyCode}>
            <label className="field">
              <span className="field-label">6-digit code</span>
              <input
                className="input input--code"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]*"
                maxLength={6}
                required
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                placeholder="000000"
              />
              <span className="field-hint">Sent to {email}. It expires shortly.</span>
            </label>
            <button type="submit" className="btn btn--gold btn--wide" disabled={busy}>
              {busy ? "Verifying…" : "Verify and continue"}
            </button>
            <button type="button" className="gate-link" onClick={reset}>
              Use a different email
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
