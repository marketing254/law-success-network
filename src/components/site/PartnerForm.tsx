"use client";

import { useState, type FormEvent } from "react";

/**
 * The /partners application form.
 *
 * Ported from Dev_Handoff/partners.html with the LMN_Signup_Forms_Spec fixes
 * applied: Fix 2 (the member offer is required), Fix 3 (the also-an-expert
 * cross-role checkbox) and Fix 4 (the agreement link points at the new
 * partner agreement). Posts JSON to /api/partner/signup.
 */

const SMS_CONSENT_TEXT =
  "I agree to receive text messages from the Law Member Network about my application and the network launch. Message and data rates may apply. Reply STOP to opt out.";

const CATEGORIES = [
  "Practice management software",
  "Legal tech",
  "Marketing & growth",
  "Finance & accounting",
  "Staffing & recruiting",
  "Insurance & risk",
  "Case management",
  "Client intake",
  "Billing & payments",
  "Consulting & coaching",
  "Other",
];

type Status = "idle" | "submitting" | "success" | "error";

export default function PartnerForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    company_name: "",
    contact_name: "",
    email: "",
    phone: "",
    website: "",
    category: "",
    description: "",
    member_offer: "",
    secondary_email: "",
    secondary_phone: "",
    signature_name: "",
    signature_title: "",
    agreed_to_terms: false,
    confirmed_authority: false,
    also_expert: false,
    sms_consent: false,
  });

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const el = e.currentTarget;
    if (!el.checkValidity()) {
      el.reportValidity();
      return;
    }

    setStatus("submitting");
    setError("");

    try {
      const res = await fetch("/api/partner/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_name: form.company_name,
          contact_name: form.contact_name,
          email: form.email,
          phone: form.phone,
          website: form.website,
          category: form.category,
          description: form.description,
          member_offer: form.member_offer,
          secondary_email: form.secondary_email,
          secondary_phone: form.secondary_phone,
          signature_name: form.signature_name,
          signature_title: form.signature_title,
          agreed_to_terms: form.agreed_to_terms,
          confirmed_authority: form.confirmed_authority,
          also_expert: form.also_expert,
          sms_consent: form.sms_consent,
          sms_consent_text: form.sms_consent ? SMS_CONSENT_TEXT : "",
        }),
      });
      const json = await res.json().catch(() => ({}));

      // A duplicate email comes back {ok:true, status:"already_applied"} - the
      // normal success panel is the right answer there too.
      if (res.ok && json?.ok) {
        setStatus("success");
        return;
      }

      setError(json?.error || "Something went wrong. Please try again.");
      setStatus("error");
    } catch {
      setError("We couldn't reach the network. Please try again.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="form-success show" id="psuccess" role="status" aria-live="polite">
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
        <h3>Application received.</h3>
        <p>
          Thanks. We review every partner application by hand and will come back to you by email.
          If it&rsquo;s a fit, your first six months are on us.
        </p>
      </div>
    );
  }

  const submitting = status === "submitting";

  return (
    <form className="lform" id="pform" onSubmit={onSubmit} noValidate>
      <div className="fld">
        <label htmlFor="company">Company</label>
        <input
          id="company"
          name="company_name"
          type="text"
          autoComplete="organization"
          required
          value={form.company_name}
          onChange={(e) => set("company_name", e.target.value)}
        />
      </div>
      <div className="fld">
        <label htmlFor="contact">Contact name</label>
        <input
          id="contact"
          name="contact_name"
          type="text"
          autoComplete="name"
          required
          value={form.contact_name}
          onChange={(e) => set("contact_name", e.target.value)}
        />
      </div>
      <div className="fld">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={form.email}
          onChange={(e) => set("email", e.target.value)}
        />
      </div>
      <div className="fld">
        <label htmlFor="phone">Phone</label>
        <input
          id="phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          required
          value={form.phone}
          onChange={(e) => set("phone", e.target.value)}
        />
      </div>
      <div className="fld full">
        <label htmlFor="website">Website</label>
        <input
          id="website"
          name="website"
          type="url"
          autoComplete="url"
          placeholder="https://"
          required
          value={form.website}
          onChange={(e) => set("website", e.target.value)}
        />
      </div>
      <div className="fld full">
        <label htmlFor="pcategory">Category</label>
        <select
          id="pcategory"
          name="category"
          required
          value={form.category}
          onChange={(e) => set("category", e.target.value)}
        >
          <option value="" disabled>
            Select…
          </option>
          {CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </div>
      <div className="fld full">
        <label htmlFor="pdescription">One-sentence description of what your company does</label>
        <input
          id="pdescription"
          name="description"
          type="text"
          required
          placeholder="One line a law firm owner would understand straight away."
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
        />
      </div>
      <div className="fld full">
        <label htmlFor="member-offer">What would you offer members?</label>
        <textarea
          id="member-offer"
          name="member_offer"
          placeholder="The exclusive member deal you have in mind, and a line on how your company helps law firms."
          required
          value={form.member_offer}
          onChange={(e) => set("member_offer", e.target.value)}
        />
      </div>
      <div className="fld">
        <label htmlFor="psecondaryemail">Secondary email</label>
        <input
          id="psecondaryemail"
          name="secondary_email"
          type="email"
          value={form.secondary_email}
          onChange={(e) => set("secondary_email", e.target.value)}
        />
      </div>
      <div className="fld">
        <label htmlFor="psecondaryphone">Secondary phone</label>
        <input
          id="psecondaryphone"
          name="secondary_phone"
          type="tel"
          value={form.secondary_phone}
          onChange={(e) => set("secondary_phone", e.target.value)}
        />
      </div>
      <div className="fld">
        <label htmlFor="psignername">Signer full name</label>
        <input
          id="psignername"
          name="signature_name"
          type="text"
          value={form.signature_name}
          onChange={(e) => set("signature_name", e.target.value)}
        />
      </div>
      <div className="fld">
        <label htmlFor="psignertitle">Signer title</label>
        <input
          id="psignertitle"
          name="signature_title"
          type="text"
          value={form.signature_title}
          onChange={(e) => set("signature_title", e.target.value)}
        />
      </div>

      <label className="chk">
        <input
          id="pagree"
          name="agreed_to_terms"
          type="checkbox"
          required
          checked={form.agreed_to_terms}
          onChange={(e) => set("agreed_to_terms", e.target.checked)}
        />
        <span>
          I have read and agree to the{" "}
          <a href="/agreements/partner" target="_blank" rel="noopener">
            Partner Agreement
          </a>
          .
        </span>
      </label>

      <label className="chk">
        <input
          id="pauthority"
          name="confirmed_authority"
          type="checkbox"
          required
          checked={form.confirmed_authority}
          onChange={(e) => set("confirmed_authority", e.target.checked)}
        />
        <span>
          I am authorised to commit my company to this agreement and to the member discount terms
          above.
        </span>
      </label>

      <label className="chk">
        <input
          id="palsoexpert"
          name="also_expert"
          type="checkbox"
          checked={form.also_expert}
          onChange={(e) => set("also_expert", e.target.checked)}
        />
        <span>I&rsquo;m also an individual expert who&rsquo;d like to contribute content.</span>
      </label>

      <label className="chk">
        <input
          id="psms"
          name="sms_consent"
          type="checkbox"
          checked={form.sms_consent}
          onChange={(e) => set("sms_consent", e.target.checked)}
        />
        <span>{SMS_CONSENT_TEXT}</span>
      </label>

      {error && (
        <div className="form-error" role="alert">
          {error}
        </div>
      )}

      <button className="btn btn-navy" type="submit" data-magnetic disabled={submitting}>
        {submitting ? "Sending…" : "Apply to partner →"}
      </button>
      <small className="fine">
        We&rsquo;ll only contact you about your partner application and the Law Member Network
        launch. Unsubscribe anytime.
      </small>
    </form>
  );
}
