"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import type {
  Partner,
  PartnerAction,
  PartnerOption,
} from "@/components/admin/types";
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

const STATUSES = ["all", "pending_review", "approved", "rejected", "suspended"] as const;

type NewPartner = {
  company_name: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  secondary_email: string;
  secondary_phone: string;
  signature_name: string;
  signature_title: string;
  category: string;
  website: string;
  description: string;
  member_offer: string;
  calendar_link: string;
  notes: string;
  billing_parent_id: string;
};

const BLANK: NewPartner = {
  company_name: "",
  contact_name: "",
  contact_email: "",
  contact_phone: "",
  secondary_email: "",
  secondary_phone: "",
  signature_name: "",
  signature_title: "",
  category: "",
  website: "",
  description: "",
  member_offer: "",
  calendar_link: "",
  notes: "",
  billing_parent_id: "",
};

export default function PartnersPage() {
  const [rows, setRows] = useState<Partner[]>([]);
  const [parents, setParents] = useState<PartnerOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("all");
  const [query, setQuery] = useState("");

  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState<NewPartner>(BLANK);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const json = await apiJson<{ partners: Partner[] }>("/api/admin/partners");
      setRows(json.partners ?? []);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const loadParents = useCallback(async () => {
    try {
      const json = await apiJson<{ partners: PartnerOption[] }>(
        "/api/admin/partners?simple=1"
      );
      setParents(json.partners ?? []);
    } catch (err) {
      setError(errorMessage(err));
    }
  }, []);

  useEffect(() => {
    void load();
    void loadParents();
  }, [load, loadParents]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (status !== "all" && r.status !== status) return false;
      if (!q) return true;
      return [r.company_name, r.contact_name, r.contact_email, r.category]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    });
  }, [rows, status, query]);

  const act = async (row: Partner, action: PartnerAction) => {
    let note: string | null = null;

    if (action === "approve") {
      const ok = window.confirm(
        `Approve ${row.company_name}?\n\nApproving marks them verified and sends the approval email to ${row.contact_email}. The email only goes out on the first approval.`
      );
      if (!ok) return;
    }
    if (action === "reject") {
      note = window.prompt(
        `Reject ${row.company_name}? Add an internal note (optional — it is not emailed to them).`,
        ""
      );
      if (note === null) return;
    }
    if (action === "suspend" && !window.confirm(`Suspend ${row.company_name}?`)) return;
    if (action === "unsuspend" && !window.confirm(`Lift the suspension on ${row.company_name}?`))
      return;

    setBusyId(row.id);
    setError(null);
    setSuccess(null);
    try {
      const body: Record<string, unknown> = { id: row.id, action };
      if (note) body.note = note;
      await apiJson("/api/admin/partners", {
        method: "PATCH",
        body: JSON.stringify(body),
      });
      if (action === "approve") {
        setSuccess(
          `${row.company_name} approved and verified. If this was the first approval, the approval email has gone out.`
        );
      }
      await load();
      await loadParents();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  const addPartner = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const json = await apiJson<{ covered?: boolean }>("/api/admin/partners", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setSuccess(
        json.covered
          ? `${form.company_name} was added as a covered company, pending review. No email was sent.`
          : `${form.company_name} was added, approved and verified. No email was sent.`
      );
      setForm(BLANK);
      setShowAdd(false);
      await load();
      await loadParents();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const setText =
    (key: keyof NewPartner) => (e: { target: { value: string } }) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));

  return (
    <>
      <PageHeader
        title="Partners"
        subtitle="Partner companies and their review status. Approve is the action that verifies them and sends the approval email."
      >
        <button type="button" className="btn btn--sm" onClick={() => void load()}>
          Refresh
        </button>
        <button
          type="button"
          className="btn btn--sm btn--gold"
          onClick={() => setShowAdd((v) => !v)}
        >
          {showAdd ? "Cancel" : "Add partner"}
        </button>
      </PageHeader>

      <ErrorNote message={error} onDismiss={() => setError(null)} />
      <SuccessNote message={success} />

      {showAdd ? (
        <Panel
          title="Add a partner"
          note="No email is sent from this form. A standalone partner is created approved and verified; choosing a billing parent instead creates a covered company, pending review."
          onClose={() => setShowAdd(false)}
        >
          <form onSubmit={addPartner}>
            <div className="form-grid">
              <Field label="Company name (required)">
                <input
                  className="input"
                  required
                  value={form.company_name}
                  onChange={setText("company_name")}
                />
              </Field>
              <Field label="Contact name (required)">
                <input
                  className="input"
                  required
                  value={form.contact_name}
                  onChange={setText("contact_name")}
                />
              </Field>
              <Field label="Contact email (required)">
                <input
                  className="input"
                  type="email"
                  required
                  value={form.contact_email}
                  onChange={setText("contact_email")}
                />
              </Field>
              <Field label="Contact phone">
                <input
                  className="input"
                  value={form.contact_phone}
                  onChange={setText("contact_phone")}
                />
              </Field>
              <Field label="Secondary email">
                <input
                  className="input"
                  type="email"
                  value={form.secondary_email}
                  onChange={setText("secondary_email")}
                />
              </Field>
              <Field label="Secondary phone">
                <input
                  className="input"
                  value={form.secondary_phone}
                  onChange={setText("secondary_phone")}
                />
              </Field>
              <Field label="Signature name">
                <input
                  className="input"
                  value={form.signature_name}
                  onChange={setText("signature_name")}
                />
              </Field>
              <Field label="Signature title">
                <input
                  className="input"
                  value={form.signature_title}
                  onChange={setText("signature_title")}
                />
              </Field>
              <Field label="Category">
                <input
                  className="input"
                  value={form.category}
                  onChange={setText("category")}
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
              <Field label="Calendar link">
                <input
                  className="input"
                  value={form.calendar_link}
                  onChange={setText("calendar_link")}
                  placeholder="https://"
                />
              </Field>
              <Field
                label="Billing parent"
                hint="Choosing a parent makes this a covered company: it inherits the parent's billing and is created pending review."
              >
                <select
                  className="input"
                  value={form.billing_parent_id}
                  onChange={setText("billing_parent_id")}
                >
                  <option value="">None (standalone partner)</option>
                  {parents.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.company_name}
                    </option>
                  ))}
                </select>
              </Field>
              <div className="field field--wide">
                <span className="field-label">Description</span>
                <textarea
                  className="input"
                  value={form.description}
                  onChange={setText("description")}
                />
              </div>
              <div className="field field--wide">
                <span className="field-label">Member offer</span>
                <textarea
                  className="input"
                  value={form.member_offer}
                  onChange={setText("member_offer")}
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
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn--gold" disabled={saving}>
                {saving ? "Saving…" : "Add partner"}
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
        placeholder="Search company, contact or category"
      >
        <span className="toolbar-count">
          {filtered.length} of {rows.length}
        </span>
      </Toolbar>

      {loading ? (
        <Loading label="Loading partners…" />
      ) : filtered.length === 0 ? (
        <Empty
          label={
            rows.length === 0 ? "No partners yet." : "No partners match this filter."
          }
        />
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Company</th>
                <th>Contact</th>
                <th>Category</th>
                <th>Website</th>
                <th>Member offer</th>
                <th>Status</th>
                <th>Verified</th>
                <th>Plan</th>
                <th>Added</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => {
                const busy = busyId === row.id;
                return (
                  <tr key={row.id}>
                    <td>
                      <span className="cell-strong">{row.company_name}</span>
                      {row.billing_parent_id ? (
                        <span className="cell-sub">Covered company</span>
                      ) : null}
                    </td>
                    <td>
                      <span>{row.contact_name || "—"}</span>
                      <span className="cell-sub">{row.contact_email}</span>
                    </td>
                    <td>{row.category || <span className="muted">—</span>}</td>
                    <td>
                      <ExtLink href={row.website} />
                    </td>
                    <td className="cell-wide">
                      {row.member_offer ? (
                        <span title={row.member_offer}>
                          {truncate(row.member_offer, 70)}
                        </span>
                      ) : (
                        <span className="muted">—</span>
                      )}
                    </td>
                    <td>
                      <StatusPill status={row.status} />
                    </td>
                    <td>
                      {row.verified ? (
                        <span className="pill pill--green">verified</span>
                      ) : (
                        <span className="muted">—</span>
                      )}
                    </td>
                    <td>{row.plan_id || <span className="muted">—</span>}</td>
                    <td className="cell-nowrap muted">{formatDate(row.created_at)}</td>
                    <td>
                      <div className="btn-row">
                        <button
                          type="button"
                          className="btn btn--sm btn--gold"
                          disabled={busy}
                          onClick={() => void act(row, "approve")}
                          title="Verifies the partner and sends the approval email (first approval only)"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          className="btn btn--sm btn--danger"
                          disabled={busy}
                          onClick={() => void act(row, "reject")}
                        >
                          Reject
                        </button>
                        {row.status === "suspended" ? (
                          <button
                            type="button"
                            className="btn btn--sm"
                            disabled={busy}
                            onClick={() => void act(row, "unsuspend")}
                          >
                            Unsuspend
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="btn btn--sm"
                            disabled={busy}
                            onClick={() => void act(row, "suspend")}
                          >
                            Suspend
                          </button>
                        )}
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
        Approve sets the verified badge and sends the approval email, on the first approval
        only. Suspending and unsuspending email no one, and unsuspending leaves an earlier
        verified badge intact.
      </p>
    </>
  );
}
