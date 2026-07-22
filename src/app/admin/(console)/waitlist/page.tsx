"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { WaitlistSignup, WaitlistStatus } from "@/components/admin/types";
import {
  apiJson,
  buildCsv,
  downloadCsv,
  Empty,
  ErrorNote,
  errorMessage,
  formatDate,
  Loading,
  PageHeader,
  StatusPill,
  SuccessNote,
  Toolbar,
  truncate,
} from "@/components/admin/ui";

const STATUSES = ["all", "new", "contacted", "converted", "declined"] as const;
const SET_TO: WaitlistStatus[] = ["new", "contacted", "converted", "declined"];

export default function WaitlistPage() {
  const [rows, setRows] = useState<WaitlistSignup[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("all");
  const [query, setQuery] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const json = await apiJson<{ signups: WaitlistSignup[] }>("/api/admin/waitlist");
      setRows(json.signups ?? []);
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
      return [r.full_name, r.first_name, r.last_name, r.email, r.firm_name]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    });
  }, [rows, status, query]);

  const setSignupStatus = async (id: string, next: WaitlistStatus) => {
    setBusyId(id);
    setError(null);
    setSuccess(null);
    try {
      await apiJson("/api/admin/waitlist", {
        method: "PATCH",
        body: JSON.stringify({ id, status: next }),
      });
      await load();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  const activate = async (row: WaitlistSignup) => {
    const ok = window.confirm(
      `Activate ${row.email} as a member?\n\nThis creates the member record, sends the welcome email, and flips this signup to converted. The welcome email cannot be unsent.`
    );
    if (!ok) return;

    setBusyId(row.id);
    setError(null);
    setSuccess(null);
    try {
      await apiJson("/api/admin/members/activate", {
        method: "POST",
        body: JSON.stringify({ waitlist_signup_id: row.id }),
      });
      setSuccess(`${row.email} is now an active member. The welcome email has gone out.`);
      await load();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  const exportCsv = () => {
    const csv = buildCsv(
      [
        "Name",
        "Email",
        "Firm",
        "Role",
        "Phone",
        "City / state",
        "Message",
        "Source",
        "Status",
        "Contacted at",
        "Created at",
      ],
      filtered.map((r) => [
        r.full_name ?? `${r.first_name ?? ""} ${r.last_name ?? ""}`.trim(),
        r.email,
        r.firm_name ?? "",
        r.practice_role ?? "",
        r.phone ?? "",
        r.city_state ?? "",
        r.message ?? "",
        r.source ?? "",
        r.status,
        r.contacted_at ?? "",
        r.created_at,
      ])
    );
    downloadCsv(`lmn-waitlist-${new Date().toISOString().slice(0, 10)}.csv`, csv);
  };

  return (
    <>
      <PageHeader
        title="Waitlist"
        subtitle="Everyone who has asked to join. Triage here, then activate the ones who are in."
      >
        <button type="button" className="btn btn--sm" onClick={() => void load()}>
          Refresh
        </button>
        <button
          type="button"
          className="btn btn--sm btn--navy"
          onClick={exportCsv}
          disabled={filtered.length === 0}
        >
          Export CSV
        </button>
      </PageHeader>

      <ErrorNote message={error} onDismiss={() => setError(null)} />
      <SuccessNote message={success} />

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
        <Loading label="Loading the waitlist…" />
      ) : filtered.length === 0 ? (
        <Empty
          label={
            rows.length === 0
              ? "No one has joined the waitlist yet."
              : "No signups match this filter."
          }
        />
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Firm</th>
                <th>Role</th>
                <th>Phone</th>
                <th>Message</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => {
                const name =
                  row.full_name ||
                  `${row.first_name ?? ""} ${row.last_name ?? ""}`.trim() ||
                  "—";
                const busy = busyId === row.id;
                return (
                  <tr key={row.id}>
                    <td>
                      <span className="cell-strong">{name}</span>
                      <span className="cell-sub">{row.email}</span>
                    </td>
                    <td>{row.firm_name || <span className="muted">—</span>}</td>
                    <td>{row.practice_role || <span className="muted">—</span>}</td>
                    <td className="cell-nowrap">
                      {row.phone || <span className="muted">—</span>}
                    </td>
                    <td className="cell-wide">
                      {row.message ? (
                        <span title={row.message}>{truncate(row.message, 70)}</span>
                      ) : (
                        <span className="muted">—</span>
                      )}
                    </td>
                    <td>
                      <StatusPill status={row.status} />
                    </td>
                    <td className="cell-nowrap muted">{formatDate(row.created_at)}</td>
                    <td>
                      <div className="btn-row">
                        {SET_TO.filter((s) => s !== row.status).map((s) => (
                          <button
                            key={s}
                            type="button"
                            className="btn btn--sm"
                            disabled={busy}
                            onClick={() => void setSignupStatus(row.id, s)}
                          >
                            {s}
                          </button>
                        ))}
                        <button
                          type="button"
                          className="btn btn--sm btn--gold"
                          disabled={busy}
                          onClick={() => void activate(row)}
                          title="Creates the member record and sends the welcome email"
                        >
                          Activate as member
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
        &ldquo;Activate as member&rdquo; sends the welcome email and marks the signup
        converted. Status changes on their own do not email anyone.
      </p>
    </>
  );
}
