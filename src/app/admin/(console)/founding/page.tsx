"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import type { FoundingInvite } from "@/components/admin/types";
import {
  apiJson,
  Empty,
  ErrorNote,
  errorMessage,
  Field,
  formatDate,
  Loading,
  PageHeader,
  Panel,
  StatusPill,
  SuccessNote,
  Toolbar,
} from "@/components/admin/ui";

const STATUSES = ["all", "draft", "sent", "viewed", "accepted", "revoked"] as const;
const ROLES = ["expert", "partner", "both"] as const;

type InviteForm = {
  role: string;
  full_name: string;
  email: string;
  company_name: string;
  member_offer: string;
  phone: string;
  notes: string;
};

const BLANK: InviteForm = {
  role: "expert",
  full_name: "",
  email: "",
  company_name: "",
  member_offer: "",
  phone: "",
  notes: "",
};

export default function FoundingInvitesPage() {
  const [rows, setRows] = useState<FoundingInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState<InviteForm>(BLANK);
  const [saving, setSaving] = useState(false);

  const [editing, setEditing] = useState<FoundingInvite | null>(null);
  const [editForm, setEditForm] = useState<InviteForm>(BLANK);

  /** The typed-confirmation modal. Send is the only action that emails anyone. */
  const [sendTarget, setSendTarget] = useState<FoundingInvite | null>(null);
  const [sendPhrase, setSendPhrase] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const json = await apiJson<{ invites: FoundingInvite[] }>(
        "/api/admin/founding-invite"
      );
      setRows(json.invites ?? []);
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
      return [r.full_name, r.email, r.company_name]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    });
  }, [rows, status, query]);

  const createDraft = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await apiJson("/api/admin/founding-invite", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setSuccess(
        `Draft saved for ${form.full_name}. Nothing has been emailed. Use Send when the details are right.`
      );
      setForm(BLANK);
      setShowNew(false);
      await load();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (row: FoundingInvite) => {
    setEditing(row);
    setEditForm({
      role: row.role,
      full_name: row.full_name,
      email: row.email,
      company_name: row.company_name ?? "",
      member_offer: row.member_offer ?? "",
      phone: row.phone ?? "",
      notes: row.notes ?? "",
    });
  };

  const saveEdit = async (e: FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await apiJson(`/api/admin/founding-invite/${editing.id}`, {
        method: "PATCH",
        body: JSON.stringify(editForm),
      });
      setSuccess(`Draft updated for ${editForm.full_name}. Still nothing emailed.`);
      setEditing(null);
      await load();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const confirmSend = async () => {
    if (!sendTarget || sendPhrase.trim().toUpperCase() !== "SEND") return;
    const target = sendTarget;

    setBusyId(target.id);
    setError(null);
    setSuccess(null);
    try {
      await apiJson(`/api/admin/founding-invite/${target.id}`, {
        method: "POST",
        body: JSON.stringify({ action: "send" }),
      });
      setSuccess(`The founding invite has been emailed to ${target.email}.`);
      setSendTarget(null);
      setSendPhrase("");
      await load();
    } catch (err) {
      // A 502 here means nothing went out and nothing was marked sent. It must
      // never read as a success.
      setError(errorMessage(err));
      setSendTarget(null);
      setSendPhrase("");
    } finally {
      setBusyId(null);
    }
  };

  const revoke = async (row: FoundingInvite) => {
    const ok = window.confirm(
      `Revoke the invite for ${row.email}?\n\nThe invite link stops working. An invite that has already been accepted cannot be revoked.`
    );
    if (!ok) return;

    setBusyId(row.id);
    setError(null);
    setSuccess(null);
    try {
      await apiJson(`/api/admin/founding-invite/${row.id}`, {
        method: "POST",
        body: JSON.stringify({ action: "revoke" }),
      });
      setSuccess(`The invite for ${row.email} was revoked.`);
      await load();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  const notifyTeam = async (row: FoundingInvite) => {
    setBusyId(row.id);
    setError(null);
    setSuccess(null);
    try {
      await apiJson(`/api/admin/founding-invite/${row.id}`, {
        method: "POST",
        body: JSON.stringify({ action: "notify_team" }),
      });
      setSuccess("The team has been notified internally. Nothing went to the recipient.");
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  const copyLink = async (row: FoundingInvite) => {
    try {
      await navigator.clipboard.writeText(row.invite_url);
      setCopiedId(row.id);
      window.setTimeout(() => setCopiedId(null), 2000);
    } catch {
      setError("Could not copy the link. Select it manually instead.");
    }
  };

  const setText =
    (key: keyof InviteForm) => (e: { target: { value: string } }) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const setEditText =
    (key: keyof InviteForm) => (e: { target: { value: string } }) =>
      setEditForm((prev) => ({ ...prev, [key]: e.target.value }));

  return (
    <>
      <PageHeader
        title="Founding invites"
        subtitle="Private, hand-picked invitations. These carry internal founding terms that the public site never shows — treat every send as an offer."
      >
        <button type="button" className="btn btn--sm" onClick={() => void load()}>
          Refresh
        </button>
        <button
          type="button"
          className="btn btn--sm btn--gold"
          onClick={() => setShowNew((v) => !v)}
        >
          {showNew ? "Cancel" : "New invite"}
        </button>
      </PageHeader>

      <ErrorNote message={error} onDismiss={() => setError(null)} />
      <SuccessNote message={success} />

      {showNew ? (
        <Panel
          title="New founding invite"
          note="Creating an invite saves a draft only. It does not email anyone. Use Send when you are ready."
          onClose={() => setShowNew(false)}
        >
          <form onSubmit={createDraft}>
            <div className="form-grid">
              <Field label="Role (required)">
                <select className="input" value={form.role} onChange={setText("role")}>
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </Field>
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
              <Field
                label="Company name"
                hint="Required before a partner or both invite can be sent."
              >
                <input
                  className="input"
                  value={form.company_name}
                  onChange={setText("company_name")}
                />
              </Field>
              <Field label="Phone">
                <input className="input" value={form.phone} onChange={setText("phone")} />
              </Field>
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
                {saving ? "Saving draft…" : "Save draft"}
              </button>
              <strong className="note note--warn" style={{ margin: 0 }}>
                Creating an invite saves a draft only. It does not email anyone. Use Send
                when you are ready.
              </strong>
            </div>
          </form>
        </Panel>
      ) : null}

      {editing ? (
        <Panel
          title={`Edit draft — ${editing.full_name}`}
          note="Drafts only. Once an invite is accepted or revoked the API refuses further edits."
          onClose={() => setEditing(null)}
        >
          <form onSubmit={saveEdit}>
            <div className="form-grid">
              <Field label="Role">
                <select
                  className="input"
                  value={editForm.role}
                  onChange={setEditText("role")}
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Full name">
                <input
                  className="input"
                  value={editForm.full_name}
                  onChange={setEditText("full_name")}
                />
              </Field>
              <Field label="Email">
                <input
                  className="input"
                  type="email"
                  value={editForm.email}
                  onChange={setEditText("email")}
                />
              </Field>
              <Field label="Company name">
                <input
                  className="input"
                  value={editForm.company_name}
                  onChange={setEditText("company_name")}
                />
              </Field>
              <Field label="Phone">
                <input
                  className="input"
                  value={editForm.phone}
                  onChange={setEditText("phone")}
                />
              </Field>
              <div className="field field--wide">
                <span className="field-label">Member offer</span>
                <textarea
                  className="input"
                  value={editForm.member_offer}
                  onChange={setEditText("member_offer")}
                />
              </div>
              <div className="field field--wide">
                <span className="field-label">Internal notes</span>
                <textarea
                  className="input"
                  value={editForm.notes}
                  onChange={setEditText("notes")}
                />
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn--gold" disabled={saving}>
                {saving ? "Saving…" : "Save draft"}
              </button>
              <button
                type="button"
                className="btn btn--ghost"
                onClick={() => setEditing(null)}
              >
                Cancel
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
        placeholder="Search name, email or company"
      >
        <span className="toolbar-count">
          {filtered.length} of {rows.length}
        </span>
      </Toolbar>

      {loading ? (
        <Loading label="Loading invites…" />
      ) : filtered.length === 0 ? (
        <Empty
          label={
            rows.length === 0
              ? "No founding invites yet."
              : "No invites match this filter."
          }
        />
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Role</th>
                <th>Company</th>
                <th>Status</th>
                <th>Agreement</th>
                <th>Sent</th>
                <th>Accepted</th>
                <th>Invite link</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => {
                const busy = busyId === row.id;
                return (
                  <tr key={row.id}>
                    <td>
                      <span className="cell-strong">{row.full_name}</span>
                      <span className="cell-sub">{row.email}</span>
                    </td>
                    <td>{row.role}</td>
                    <td>{row.company_name || <span className="muted">—</span>}</td>
                    <td>
                      <StatusPill status={row.status} />
                    </td>
                    <td className="cell-nowrap">{row.agreement_version}</td>
                    <td className="cell-nowrap muted">{formatDate(row.sent_at)}</td>
                    <td className="cell-nowrap muted">{formatDate(row.accepted_at)}</td>
                    <td>
                      <button
                        type="button"
                        className="btn btn--sm"
                        onClick={() => void copyLink(row)}
                      >
                        {copiedId === row.id ? "Copied" : "Copy link"}
                      </button>
                    </td>
                    <td>
                      <div className="btn-row">
                        {row.status === "draft" ? (
                          <button
                            type="button"
                            className="btn btn--sm"
                            disabled={busy}
                            onClick={() => startEdit(row)}
                          >
                            Edit
                          </button>
                        ) : null}
                        {row.status !== "accepted" && row.status !== "revoked" ? (
                          <button
                            type="button"
                            className="btn btn--sm btn--gold"
                            disabled={busy}
                            onClick={() => {
                              setSendPhrase("");
                              setSendTarget(row);
                            }}
                          >
                            Send
                          </button>
                        ) : null}
                        {row.status !== "accepted" && row.status !== "revoked" ? (
                          <button
                            type="button"
                            className="btn btn--sm btn--danger"
                            disabled={busy}
                            onClick={() => void revoke(row)}
                          >
                            Revoke
                          </button>
                        ) : null}
                        {row.status === "sent" ||
                        row.status === "viewed" ||
                        row.status === "accepted" ? (
                          <button
                            type="button"
                            className="btn btn--sm btn--ghost"
                            disabled={busy}
                            onClick={() => void notifyTeam(row)}
                          >
                            Notify team
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {sendTarget ? (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal">
            <div className="modal-head">
              <h2>Send this founding invite?</h2>
            </div>
            <div className="modal-body">
              <p>
                This is the only action here that emails anyone, and the invite carries
                founding terms that are never shown publicly. Once it is in their inbox it
                cannot be recalled.
              </p>
              <span className="modal-recipient">
                It will be emailed to
                <strong>{sendTarget.email}</strong>
                {sendTarget.full_name}
                {sendTarget.company_name ? ` · ${sendTarget.company_name}` : ""} ·{" "}
                {sendTarget.role} · agreement {sendTarget.agreement_version}
              </span>
              <label className="field">
                <span className="field-label">Type SEND to confirm</span>
                <input
                  className="input"
                  value={sendPhrase}
                  onChange={(e) => setSendPhrase(e.target.value)}
                  placeholder="SEND"
                  autoComplete="off"
                />
              </label>
            </div>
            <div className="modal-foot">
              <button
                type="button"
                className="btn btn--ghost"
                onClick={() => {
                  setSendTarget(null);
                  setSendPhrase("");
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn--gold"
                disabled={
                  sendPhrase.trim().toUpperCase() !== "SEND" || busyId === sendTarget.id
                }
                onClick={() => void confirmSend()}
              >
                {busyId === sendTarget.id ? "Sending…" : "Send the invite"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
