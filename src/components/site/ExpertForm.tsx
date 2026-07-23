"use client";

import { useState, type FormEvent } from "react";

/**
 * The /experts application form.
 *
 * Ported from Dev_Handoff/experts.html with the LMN_Signup_Forms_Spec fixes
 * applied: Fix 1 (Expert Agreement acceptance, a hard submit gate) and Fix 3
 * (the ambiguous "Company" field replaced by the also-a-partner checkbox and
 * its revealed fields). Posts JSON to /api/expert/signup.
 */

const SMS_CONSENT_TEXT =
  "I agree to receive text messages from the Law Member Network about my application and the network launch. Message and data rates may apply. Reply STOP to opt out.";

type Status = "idle" | "submitting" | "success" | "error";

export default function ExpertForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    specialty: "",
    website_linkedin: "",
    booking_link: "",
    what_you_would_teach: "",
    topics: "",
    agreement_accepted: false,
    also_partner: false,
    company_name: "",
    company_offer: "",
    considered_founding: false,
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
      const res = await fetch("/api/expert/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          specialty: form.specialty,
          website_linkedin: form.website_linkedin,
          booking_link: form.booking_link,
          what_you_would_teach: form.what_you_would_teach,
          topics: form.topics,
          agreement_accepted: form.agreement_accepted,
          also_partner: form.also_partner,
          company_name: form.also_partner ? form.company_name : "",
          company_offer: form.also_partner ? form.company_offer : "",
          considered_founding: form.considered_founding,
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
      <div className="form-success show" id="esuccess" role="status" aria-live="polite">
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
          Thank you. The Dominate Law team reviews every application personally. If your expertise
          fits the bench, we&rsquo;ll reach out to talk topics and next steps.
        </p>
      </div>
    );
  }

  const submitting = status === "submitting";

  return (
    <form className="lform" id="eform" onSubmit={onSubmit} noValidate>
      <div className="fld">
        <label htmlFor="ename">Name</label>
        <input
          id="ename"
          name="name"
          type="text"
          autoComplete="name"
          required
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
        />
      </div>
      <div className="fld">
        <label htmlFor="eemail">Email</label>
        <input
          id="eemail"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={form.email}
          onChange={(e) => set("email", e.target.value)}
        />
      </div>
      <div className="fld">
        <label htmlFor="ephone">Phone</label>
        <input
          id="ephone"
          name="phone"
          type="tel"
          autoComplete="tel"
          required
          value={form.phone}
          onChange={(e) => set("phone", e.target.value)}
        />
      </div>
      <div className="fld">
        <label htmlFor="especialty">Specialty</label>
        <select
          id="especialty"
          name="specialty"
          required
          value={form.specialty}
          onChange={(e) => set("specialty", e.target.value)}
        >
          <option value="" disabled>
            Select…
          </option>
          <option>Practice management</option>
          <option>Marketing &amp; growth</option>
          <option>Finance &amp; pricing</option>
          <option>Hiring &amp; team building</option>
          <option>Legal tech &amp; operations</option>
          <option>Transitions &amp; succession</option>
          <option>Other</option>
        </select>
      </div>
      <div className="fld">
        <label htmlFor="eweb">Website / LinkedIn</label>
        <input
          id="eweb"
          name="website_linkedin"
          type="text"
          placeholder="https://"
          required
          value={form.website_linkedin}
          onChange={(e) => set("website_linkedin", e.target.value)}
        />
      </div>
      <div className="fld">
        <label htmlFor="ebooking">Booking link</label>
        <input
          id="ebooking"
          name="booking_link"
          type="text"
          placeholder="https://"
          value={form.booking_link}
          onChange={(e) => set("booking_link", e.target.value)}
        />
      </div>
      <div className="fld full">
        <label htmlFor="eteach">What would you teach law firm owners?</label>
        <textarea
          id="eteach"
          name="what_you_would_teach"
          placeholder="The topic you'd record first, who it helps, and the result an owner walks away with. A few sentences is plenty."
          required
          value={form.what_you_would_teach}
          onChange={(e) => set("what_you_would_teach", e.target.value)}
        />
      </div>
      <div className="fld full">
        <label htmlFor="etopics">Topics you&rsquo;d record</label>
        <textarea
          id="etopics"
          name="topics"
          placeholder="Other sessions you could teach, if the first one lands."
          value={form.topics}
          onChange={(e) => set("topics", e.target.value)}
        />
      </div>

      <label className="chk">
        <input
          id="eagree"
          name="agreement_accepted"
          type="checkbox"
          required
          checked={form.agreement_accepted}
          onChange={(e) => set("agreement_accepted", e.target.checked)}
        />
        <span>
          I have read and agree to the{" "}
          <a href="/agreements/expert">
            Expert Agreement
          </a>
          .
        </span>
      </label>

      <label className="chk">
        <input
          id="ealsopartner"
          name="also_partner"
          type="checkbox"
          checked={form.also_partner}
          onChange={(e) => set("also_partner", e.target.checked)}
        />
        <span>I&rsquo;d also like to list my company as a partner.</span>
      </label>

      {form.also_partner && (
        <div className="cond-reveal">
          <div className="fld">
            <label htmlFor="ecompanyname">Company name</label>
            <input
              id="ecompanyname"
              name="company_name"
              type="text"
              autoComplete="organization"
              required
              value={form.company_name}
              onChange={(e) => set("company_name", e.target.value)}
            />
          </div>
          <div className="fld full">
            <label htmlFor="ecompanyoffer">What does it offer law firms?</label>
            <input
              id="ecompanyoffer"
              name="company_offer"
              type="text"
              placeholder="e.g. 15% off your first year, or a free consultation. You can refine this with us later."
              value={form.company_offer}
              onChange={(e) => set("company_offer", e.target.value)}
            />
          </div>
        </div>
      )}

      <label className="chk">
        <input
          id="efounding"
          name="considered_founding"
          type="checkbox"
          checked={form.considered_founding}
          onChange={(e) => set("considered_founding", e.target.checked)}
        />
        <span>Consider me as a Founding Expert.</span>
      </label>

      <label className="chk">
        <input
          id="esms"
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
        {submitting ? "Sending…" : "Submit application →"}
      </button>
      <small className="fine">
        We review every application personally. We&rsquo;ll only contact you about your application
        and the network.
      </small>
    </form>
  );
}
