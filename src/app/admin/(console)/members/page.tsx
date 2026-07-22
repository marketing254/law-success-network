"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import type { Member } from "@/components/admin/types";
import {
  apiJson,
  displayName,
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

const STATUSES = ["all", "active", "paused", "cancelled"] as const;

type NewMember = {
  email: string;
  first_name: string;
  last_name: string;
  firm_name: string;
  practice_role: string;
  phone: string;
};

const BLANK: NewMember = {
  email: "",
  first_name: "",
  last_name: "",
  firm_name: "",
  practice_role: "",
  phone: "",
};

export default function MembersPage() {
  const [rows, setRows] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("all");
  const [query, setQuery] = useState("");

  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState<NewMember>(BLANK);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const json = await apiJson<{ members: Member[] }>("/api/admin/members");
      setRows(json.members ?? []);
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
      return [r.first_name, r.last_name, r.email, r.firm_name]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    });
  }, [rows, status, query]);

  const setMemberState = async (row: Member, action: "deactivate" | "reactivate") => {
    const verb = action === "deactivate" ? "Pause" : "Reactivate";
    if (!window.confirm(`${verb} ${row.email}?`)) return;

    setBusyId(row.id);
    setError(null);
    setSuccess(null);
    try {
      await apiJson(`/api/admin/members/${row.id}`, {
        method: "PATCH",
        body: JSON.stringify({ action }),
      });
      await load();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (row: Member) => {
    const ok = window.confirm(
      `Permanently DELETE ${row.email}?\n\nThis erases the member record for good — it cannot be undone, and the audit trail is the only thing that survives it. Pausing the member is almost always the right action instead.\n\nOwner accounts only.`
    );
    if (!ok) return;

    setBusyId(row.id);
    setError(null);
    setSuccess(null);
    try {
      await apiJson(`/api/admin/members/${row.id}`, { method: "DELETE" });
      setSuccess(`${row.email} was deleted.`);
      await load();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  const addMember = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await apiJson("/api/admin/members/activate", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setSuccess(`${form.email} is active. The welcome email has gone out.`);
      setForm(BLANK);
      setShowAdd(false);
      await load();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const set = (key: keyof NewMember) => (value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <>
      <PageHeader
        title="Members"
        subtitle="Activated members of the network. Activation is the only step that sends the welcome email."
      >
        <button type="button" className="btn btn--sm" onClick={() => void load()}>
          Refresh
        </button>
        <button
          type="button"
          className="btn btn--sm btn--gold"
          onClick={() => setShowAdd((v) => !v)}
        >
          {showAdd ? "Cancel" : "Add member"}
        </button>
      </PageHeader>

      <ErrorNote message={error} onDismiss={() => setError(null)} />
      <SuccessNote message={success} />

      {showAdd ? (
        <Panel
          title="Add a member"
          note="Saving activates the member immediately and sends the welcome email. There is no draft step here."
          onClose={() => setShowAdd(false)}
        >
          <form onSubmit={addMember}>
            <div className="form-grid">
              <Field label="Email (required)">
                <input
                  className="input"
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => set("email")(e.target.value)}
                />
              </Field>
              <Field label="First name">
                <input
                  className="input"
                  value={form.first_name}
                  onChange={(e) => set("first_name")(e.target.value)}
                />
              </Field>
              <Field label="Last name">
                <input
                  className="input"
                  value={form.last_name}
                  onChange={(e) => set("last_name")(e.target.value)}
                />
              </Field>
              <Field label="Firm name">
                <input
                  className="input"
                  value={form.firm_name}
                  onChange={(e) => set("firm_name")(e.target.value)}
                />
              </Field>
              <Field label="Practice role">
                <input
                  className="input"
                  value={form.practice_role}
                  onChange={(e) => set("practice_role")(e.target.value)}
                />
              </Field>
              <Field label="Phone">
                <input
                  className="input"
                  value={form.phone}
                  onChange={(e) => set("phone")(e.target.value)}
                />
              </Field>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn--gold" disabled={saving}>
                {saving ? "Activating…" : "Activate and send welcome email"}
              </button>
              <span className="field-hint">
                An existing member with the same email is updated rather than duplicated.
              </span>
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
        placeholder="Search name, email or firm"
      >
        <span className="toolbar-count">
          {filtered.length} of {rows.length}
        </span>
      </Toolbar>

      {loading ? (
        <Loading label="Loading members…" />
      ) : filtered.length === 0 ? (
        <Empty
          label={
            rows.length === 0
              ? "No members yet. Activate a waitlist signup to create the first one."
              : "No members match this filter."
          }
        />
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Firm</th>
                <th>Status</th>
                <th>Tier</th>
                <th>Activated</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => {
                const busy = busyId === row.id;
                return (
                  <tr key={row.id}>
                    <td>
                      <span className="cell-strong">
                        {displayName(row.first_name, row.last_name)}
                      </span>
                      <span className="cell-sub">{row.email}</span>
                    </td>
                    <td>{row.firm_name || <span className="muted">—</span>}</td>
                    <td>
                      <StatusPill status={row.status} />
                    </td>
                    <td>{row.tier}</td>
                    <td className="cell-nowrap muted">{formatDate(row.activated_at)}</td>
                    <td className="cell-nowrap muted">{formatDate(row.created_at)}</td>
                    <td>
                      <div className="btn-row">
                        {row.status === "active" ? (
                          <button
                            type="button"
                            className="btn btn--sm"
                            disabled={busy}
                            onClick={() => void setMemberState(row, "deactivate")}
                          >
                            Deactivate
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="btn btn--sm"
                            disabled={busy}
                            onClick={() => void setMemberState(row, "reactivate")}
                          >
                            Reactivate
                          </button>
                        )}
                        <button
                          type="button"
                          className="btn btn--sm btn--danger"
                          disabled={busy}
                          onClick={() => void remove(row)}
                          title="Owner only. Permanent."
                        >
                          Delete
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
        Delete is restricted to owner accounts and is permanent. If a non-owner tries it,
        the API refuses and the reason appears at the top of this page.
      </p>
    </>
  );
}
