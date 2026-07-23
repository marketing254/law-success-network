"use client";

import { useState } from "react";

const SMS_CONSENT_TEXT =
  "I agree to receive text messages from the Law Member Network about my place on the waitlist and the network launch. Message and data rates may apply. Reply STOP to opt out.";

type Status = "idle" | "submitting" | "success" | "error";

export default function WaitlistForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [sms, setSms] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    setStatus("submitting");
    setError("");

    const data = new FormData(form);
    const payload = {
      first_name: data.get("first_name"),
      last_name: data.get("last_name"),
      email: data.get("email"),
      mobile: data.get("mobile"),
      firm_name: data.get("firm_name"),
      role: data.get("role"),
      biggest_challenge: data.get("biggest_challenge"),
      agreement_accepted: agreed,
      sms_consent: sms,
      sms_consent_text: sms ? SMS_CONSENT_TEXT : null,
    };

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => ({}));

      if (!res.ok || !json.ok) {
        setError(json.error || "Something went wrong. Please try again.");
        setStatus("error");
        return;
      }
      // A duplicate email comes back ok with status "already_registered".
      // Either way their place is held, so show the same confirmation.
      setStatus("success");
    } catch {
      setError("We could not reach the server. Please check your connection and try again.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="form-success show" id="wsuccess" role="status" aria-live="polite">
        <span className="big">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </span>
        <h3>You&rsquo;re on the list.</h3>
        <p>
          Welcome. Your place in line is held. Watch your inbox for launch news and your
          founding-member invitation.
        </p>
      </div>
    );
  }

  const submitting = status === "submitting";

  return (
    <form className="lform" id="wform" onSubmit={onSubmit} noValidate>
      <div className="fld">
        <label htmlFor="fname">First name</label>
        <input id="fname" name="first_name" type="text" autoComplete="given-name" required />
      </div>
      <div className="fld">
        <label htmlFor="lname">Last name</label>
        <input id="lname" name="last_name" type="text" autoComplete="family-name" required />
      </div>
      <div className="fld">
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" autoComplete="email" required />
      </div>
      <div className="fld">
        <label htmlFor="mobile">Mobile</label>
        <input id="mobile" name="mobile" type="tel" autoComplete="tel" required />
      </div>
      <div className="fld">
        <label htmlFor="firm">Firm name</label>
        <input id="firm" name="firm_name" type="text" autoComplete="organization" required />
      </div>
      <div className="fld">
        <label htmlFor="role">Your role</label>
        <select id="role" name="role" defaultValue="" required>
          <option value="" disabled>
            Select&hellip;
          </option>
          <option>Owner / Managing Partner</option>
          <option>Partner</option>
          <option>Solo Practitioner</option>
          <option>Firm Administrator / COO</option>
          <option>Attorney</option>
          <option>Other</option>
        </select>
      </div>
      <div className="fld full">
        <label htmlFor="challenge">Your biggest challenge right now</label>
        <textarea
          id="challenge"
          name="biggest_challenge"
          placeholder="Hiring? Fees? Intake? Growth? Tell us in a sentence or two. It shapes the first resource kits."
        />
      </div>

      <div className="fld full chkwrap">
        <label className="chk">
          <input
            type="checkbox"
            name="agreement_accepted"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            required
          />
          <span>
            I have read and agree to the{" "}
            <a href="/agreements/member">
              Member Agreement
            </a>
            , and I&rsquo;d like to receive launch updates.
          </span>
        </label>
        <label className="chk">
          <input
            type="checkbox"
            name="sms_consent"
            checked={sms}
            onChange={(e) => setSms(e.target.checked)}
          />
          <span>{SMS_CONSENT_TEXT}</span>
        </label>
      </div>

      {error ? (
        <div className="form-error full" role="alert">
          {error}
        </div>
      ) : null}

      <button className="btn btn-navy" type="submit" data-magnetic disabled={submitting}>
        {submitting ? "Sending…" : "Join the waitlist →"}
      </button>
      <small className="fine">
        We&rsquo;ll only contact you about the Law Member Network launch. Unsubscribe anytime.
      </small>
    </form>
  );
}
