"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import type { AdminUser } from "@/components/admin/types";
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
  SuccessNote,
} from "@/components/admin/ui";

const ROLES = ["owner", "admin", "reviewer", "support"] as const;

type NewAdmin = { email: string; full_name: string; role: string };

const BLANK: NewAdmin = { email: "", full_name: "", role: "admin" };

export default function AdminTeamPage() {
  const [rows, setRows] = useState<AdminUser[]>([]);
  const [currentAdminId, setCurrentAdminId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState<NewAdmin>(BLANK);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const json = await apiJson<{ admins: AdminUser[]; currentAdminId: string }>(
        "/api/admin/admins"
      );
      setRows(json.admins ?? []);
      setCurrentAdminId(json.currentAdminId ?? null);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const addAdmin = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await apiJson("/api/admin/admins", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setSuccess(
        `${form.email} is on the admin team. They sign in by requesting a code at the login screen — no invite email is sent.`
      );
      setForm(BLANK);
      setShowAdd(false);
      await load();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const patchAdmin = async (row: AdminUser, patch: { active?: boolean; role?: string }) => {
    setBusyId(row.id);
    setError(null);
    setSuccess(null);
    try {
      await apiJson("/api/admin/admins", {
        method: "PATCH",
        body: JSON.stringify({ id: row.id, ...patch }),
      });
      await load();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  const toggleActive = (row: AdminUser) => {
    const verb = row.active ? "Deactivate" : "Reactivate";
    if (!window.confirm(`${verb} ${row.email}?`)) return;
    void patchAdmin(row, { active: !row.active });
  };

  return (
    <>
      <PageHeader
        title="Admin team"
        subtitle="Who can open this console. Adding, deactivating and role changes are owner-only; the API refuses anyone else and the reason appears here."
      >
        <button type="button" className="btn btn--sm" onClick={() => void load()}>
          Refresh
        </button>
        <button
          type="button"
          className="btn btn--sm btn--gold"
          onClick={() => setShowAdd((v) => !v)}
        >
          {showAdd ? "Cancel" : "Add admin"}
        </button>
      </PageHeader>

      <ErrorNote message={error} onDismiss={() => setError(null)} />
      <SuccessNote message={success} />

      {showAdd ? (
        <Panel
          title="Add an admin"
          note="This only adds the allow-list row. No email is sent — the new admin requests a sign-in code at /admin/login."
          onClose={() => setShowAdd(false)}
        >
          <form onSubmit={addAdmin}>
            <div className="form-grid">
              <Field label="Email (required)">
                <input
                  className="input"
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </Field>
              <Field label="Full name">
                <input
                  className="input"
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                />
              </Field>
              <Field label="Role">
                <select
                  className="input"
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn--gold" disabled={saving}>
                {saving ? "Adding…" : "Add admin"}
              </button>
            </div>
          </form>
        </Panel>
      ) : null}

      {loading ? (
        <Loading label="Loading the admin team…" />
      ) : rows.length === 0 ? (
        <Empty label="No admin rows found." />
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Role</th>
                <th>Active</th>
                <th>Last active</th>
                <th>Added</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const isSelf = row.id === currentAdminId;
                const busy = busyId === row.id;
                return (
                  <tr key={row.id}>
                    <td>
                      <span className="cell-strong">
                        {row.full_name || "—"}
                        {isSelf ? " (you)" : ""}
                      </span>
                      <span className="cell-sub">{row.email}</span>
                    </td>
                    <td>
                      <span
                        className={`pill ${
                          row.role === "owner" ? "pill--amber" : "pill--grey"
                        }`}
                      >
                        {row.role}
                      </span>
                    </td>
                    <td>
                      {row.active ? (
                        <span className="pill pill--green">active</span>
                      ) : (
                        <span className="pill pill--red">inactive</span>
                      )}
                    </td>
                    <td className="cell-nowrap muted">{formatDate(row.last_active_at)}</td>
                    <td className="cell-nowrap muted">{formatDate(row.created_at)}</td>
                    <td>
                      {isSelf ? (
                        <span className="muted">
                          You cannot change your own role or deactivate yourself.
                        </span>
                      ) : (
                        <div className="btn-row">
                          <select
                            className="input input--select"
                            value={row.role}
                            disabled={busy}
                            onChange={(e) =>
                              void patchAdmin(row, { role: e.target.value })
                            }
                            aria-label={`Role for ${row.email}`}
                          >
                            {ROLES.map((r) => (
                              <option key={r} value={r}>
                                {r}
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            className={`btn btn--sm${row.active ? " btn--danger" : ""}`}
                            disabled={busy}
                            onClick={() => toggleActive(row)}
                          >
                            {row.active ? "Deactivate" : "Reactivate"}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
