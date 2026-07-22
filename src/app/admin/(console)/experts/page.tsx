"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import type { ExpertAction, ExpertApplication } from "@/components/admin/types";
import {
  apiJson,
  Empty,
  ErrorNote,
  errorMessage,
  ExtLink,
  Field,
  formatDate,
  Loading,
  PageHeader,
  Panel,
  StatusPill,
  SuccessNote,
  Toolbar,
  truncate,
} from "@/components/admin/ui";

const STATUSES = ["all", "new", "reviewing", "approved", "declined", "onboarded"] as const;

type NewExpert = {
  full_name: string;
  email: string;
  specialty: string;
  phone: string;
  company_name: string;
  topics: string;
  website: string;
  booking_link: string;
  what_you_teach: string;
  notes: string;
  company_offer: string;
  also_partner: boolean;
  considered_founding: boolean;
  is_founding: boolean;
};

type FlagKey = "also_partner" | "considered_founding" | "is_founding";
type TextKey = Exclude<keyof NewExpert, FlagKey>;

const BLANK: NewExpert = {
  full_name: "",
  email: "",
  specialty: "",
  phone: "",
  company_name: "",
  topics: "",
  website: "",
  booking_link: "",
  what_you_teach: "",
  notes: "",
  company_offer: "",
  also_partner: false,
  considered_founding: false,
  is_founding: false,
};

export default function ExpertsPage() {
  const [rows, setRows] = useState<ExpertApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState<NewExpert>(BLANK);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const json = await apiJson<{ applications: ExpertApplication[] }>(
        "/api/admin/experts"
      );
      setRows(json.applications ?? []);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (status !== "all" && r.status !== status) return false;
      if (!q) return true;
      return [r.full_name, r.email, r.specialty, r.company_name]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    });
  }, [rows, status, query]);

  const act = async (row: ExpertApplication, action: ExpertAction) => {
    let note: string | null = null;

    if (action === "approve") {
      const ok = window.confirm(
        `Approve ${row.full_name}?\n\nApproving provisions the expert record and sends the approval email to ${row.email}. The email only goes out on the first approval.`
      );
      if (!ok) return;
    }
    if (action === "decline") {
      note = window.prompt(
        `Decline ${row.full_name}? Add an internal note (optional — it is not emailed to them).`,
        ""
      );
      if (note === null) return;
    }
    if (action === "reset") {
      if (!window.confirm(`Reset ${row.full_name} back to new?`)) return;
    }

    setBusyId(row.id);
    setError(null);
    setSuccess(null);
    try {
      const body: Record<string, unknown> = { id: row.id, action };
      if (note) body.note = note;
      await apiJson("/api/admin/experts", {
        method: "PATCH",
        body: JSON.stringify(body),
      });
      if (action === "approve") {
        setSuccess(
          `${row.full_name} approved. If this was the first approval, the approval email has gone out.`
        );
      }
      await load();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  const addExpert = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await apiJson("/api/admin/experts", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setSuccess(`${form.full_name} was added. No email was sent.`);
      setForm(BLANK);
      setShowAdd(false);
      await load();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const setText =
    (key: TextKey) => (e: { target: { value: string } }) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const setFlag = (key: FlagKey) => (checked: boolean) =>
    setForm((prev) => ({ ...prev, [key]: checked }));

  return (
    <>
      <PageHeader
        title="Experts"
        subtitle="Expert applications and their review status. Approve is the action that provisions the expert record and emails them."
      >
        <button type="button" className="btn btn--sm" onClick={() => void load()}>
          Refresh
        </button>
        <button
          type="button"
          className="btn btn--sm btn--gold"
          onClick={() => setShowAdd((v) => !v)}
        >
          {showAdd ? "Cancel" : "Add expert"}
        </button>
      </PageHeader>

      <ErrorNote message={error} onDismiss={() => setError(null)} />
      <SuccessNote message={success} />

      {showAdd ? (
        <Panel
          title="Add an expert"
          note="Adds an approved application and provisions the expert record. No email is sent from this form — use a founding invite when someone should be mailed."
          onClose={() => setShowAdd(false)}
        >
          <form onSubmit={addExpert}>
            <div className="form-grid">
              <Field label="Full name (required)">
                <input
                  className="input"
                  required
                  value={form.full_name}
                  onChange={setText("full_name")}
                />
              </Field>
              <Field label="Email (required)">
                <input
                  className="input"
                  type="email"
                  required
                  value={form.email}
                  onChange={setText("email")}
                />
              </Field>
              <Field label="Specialty (required)">
                <input
                  className="input"
                  required
                  value={form.specialty}
                  onChange={setText("specialty")}
                />
              </Field>
              <Field label="Phone">
                <input className="input" value={form.phone} onChange={setText("phone")} />
              </Field>
              <Field label="Company name">
                <input
                  className="input"
                  value={form.company_name}
                  onChange={setText("company_name")}
                />
              </Field>
              <Field label="Website">
                <input
                  className="input"
                  value={form.website}
                  onChange={setText("website")}
                  placeholder="https://"
                />
              </Field>
              <Field label="Booking link">
                <input
                  className="input"
                  value={form.booking_link}
                  onChange={setText("booking_link")}
                  placeholder="https://"
                />
              </Field>
              <Field label="Topics" hint="Comma-separated is fine.">
                <input
                  className="input"
                  value={form.topics}
                  onChange={setText("topics")}
                />
              </Field>
              <div className="field field--wide">
                <span className="field-label">What they teach</span>
                <textarea
                  className="input"
                  value={form.what_you_teach}
                  onChange={setText("what_you_teach")}
                />
              </div>
              <div className="field field--wide">
                <span className="field-label">Company offer for members</span>
                <textarea
                  className="input"
                  value={form.company_offer}
                  onChange={setText("company_offer")}
                />
              </div>
              <div className="field field--wide">
                <span className="field-label">Internal notes</span>
                <textarea
                  className="input"
                  value={form.notes}
                  onChange={setText("notes")}
                />
              </div>
              <div className="field field--wide">
                <label className="checkline">
                  <input
                    type="checkbox"
                    checked={form.also_partner}
                    onChange={(e) => setFlag("also_partner")(e.target.checked)}
                  />
                  <span>Also wants to be a partner company</span>
                </label>
                <label className="checkline">
                  <input
                    type="checkbox"
                    checked={form.considered_founding}
                    onChange={(e) => setFlag("considered_founding")(e.target.checked)}
                  />
                  <span>Asked to be considered for the founding cohort</span>
                </label>
                <label className="checkline">
                  <input
                    type="checkbox"
                    checked={form.is_founding}
                    onChange={(e) => setFlag("is_founding")(e.target.checked)}
                  />
                  <span>
                    Founding cohort (free for life)
                    <span className="field-hint"> Internal only. Never shown publicly.</span>
                  </span>
                </label>
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn--gold" disabled={saving}>
                {saving ? "Saving…" : "Add expert"}
              </button>
            </div>
          </form>
        </Panel>
      ) : null}

      <Toolbar
        statuses={STATUSES}
        status={status}
        onStatus={setStatus}
        query={query}
        onQuery={setQuery}
        placeholder="Search name, email or specialty"
      >
        <span className="toolbar-count">
          {filtered.length} of {rows.length}
        </span>
      </Toolbar>

      {loading ? (
        <Loading label="Loading applications…" />
      ) : filtered.length === 0 ? (
        <Empty
          label={
            rows.length === 0
              ? "No expert applications yet."
              : "No applications match this filter."
          }
        />
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Specialty</th>
                <th>Phone</th>
                <th>Website</th>
                <th>What they teach</th>
                <th>Flags</th>
                <th>Status</th>
                <th>Applied</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => {
                const busy = busyId === row.id;
                const open = expanded === row.id;
                return (
                  <tr key={row.id}>
                    <td>
                      <span className="cell-strong">{row.full_name}</span>
                      <span className="cell-sub">{row.email}</span>
                    </td>
                    <td>{row.specialty || <span className="muted">—</span>}</td>
                    <td className="cell-nowrap">
                      {row.phone || <span className="muted">—</span>}
                    </td>
                    <td>
                      <ExtLink href={row.website} />
                    </td>
                    <td className="cell-wide">
                      {row.what_you_teach ? (
                        <>
                          <span>
                            {open ? row.what_you_teach : truncate(row.what_you_teach, 80)}
                          </span>
                          {row.what_you_teach.length > 80 ? (
                            <button
                              type="button"
                              className="btn btn--ghost btn--sm"
                              onClick={() => setExpanded(open ? null : row.id)}
                            >
                              {open ? "Less" : "More"}
                            </button>
                          ) : null}
                        </>
                      ) : (
                        <span className="muted">—</span>
                      )}
                    </td>
                    <td>
                      <div className="btn-row">
                        {row.also_partner ? (
                          <span className="flag">
                            Partner{row.company_name ? `: ${row.company_name}` : ""}
                          </span>
                        ) : null}
                        {row.considered_founding ? (
                          <span className="flag">Founding interest</span>
                        ) : null}
                        {!row.also_partner && !row.considered_founding ? (
                          <span className="muted">—</span>
                        ) : null}
                      </div>
                    </td>
                    <td>
                      <StatusPill status={row.status} />
                    </td>
                    <td className="cell-nowrap muted">{formatDate(row.created_at)}</td>
                    <td>
                      <div className="btn-row">
                        <button
                          type="button"
                          className="btn btn--sm"
                          disabled={busy}
                          onClick={() => void act(row, "start_review")}
                        >
                          Start review
                        </button>
                        <button
                          type="button"
                          className="btn btn--sm btn--gold"
                          disabled={busy}
                          onClick={() => void act(row, "approve")}
                          title="Provisions the expert record and sends the approval email (first approval only)"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          className="btn btn--sm btn--danger"
                          disabled={busy}
                          onClick={() => void act(row, "decline")}
                        >
                          Decline
                        </button>
                        <button
                          type="button"
                          className="btn btn--sm"
                          disabled={busy}
                          onClick={() => void act(row, "mark_onboarded")}
                        >
                          Onboarded
                        </button>
                        <button
                          type="button"
                          className="btn btn--sm btn--ghost"
                          disabled={busy}
                          onClick={() => void act(row, "reset")}
                        >
                          Reset
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <p className="page-sub" style={{ marginTop: 12 }}>
        Approve provisions the expert record and sends the approval email. It only sends on
        the first approval, so re-approving never mails twice. Start review, onboarded and
        reset email no one.
      </p>
    </>
  );
}
