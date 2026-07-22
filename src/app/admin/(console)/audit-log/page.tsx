"use client";

import { useCallback, useEffect, useState } from "react";
import type { AuthEvent, ReviewAction } from "@/components/admin/types";
import {
  apiJson,
  Empty,
  ErrorNote,
  errorMessage,
  formatDate,
  Loading,
  PageHeader,
} from "@/components/admin/ui";

const TARGETS = [
  "all",
  "expert_application",
  "expert",
  "partner",
  "member",
  "waitlist_signup",
  "founding_invite",
] as const;

type Tab = "review" | "auth";

export default function AuditLogPage() {
  const [tab, setTab] = useState<Tab>("review");
  const [target, setTarget] = useState<string>("all");
  const [reviewActions, setReviewActions] = useState<ReviewAction[]>([]);
  const [authEvents, setAuthEvents] = useState<AuthEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set("type", tab);
      if (tab === "review" && target !== "all") params.set("target", target);

      const json = await apiJson<{
        reviewActions: ReviewAction[];
        authEvents: AuthEvent[];
      }>(`/api/admin/audit?${params.toString()}`);

      setReviewActions(json.reviewActions ?? []);
      setAuthEvents(json.authEvents ?? []);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [tab, target]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <>
      <PageHeader
        title="Audit log"
        subtitle="Every admin mutation and every sign-in attempt, newest first."
      >
        <button type="button" className="btn btn--sm" onClick={() => void load()}>
          Refresh
        </button>
      </PageHeader>

      <ErrorNote message={error} onDismiss={() => setError(null)} />

      <div className="tabs">
        <button
          type="button"
          className={`tab${tab === "review" ? " is-active" : ""}`}
          onClick={() => setTab("review")}
        >
          Admin actions
        </button>
        <button
          type="button"
          className={`tab${tab === "auth" ? " is-active" : ""}`}
          onClick={() => setTab("auth")}
        >
          Sign-in events
        </button>
      </div>

      {tab === "review" ? (
        <>
          <div className="toolbar">
            <select
              className="input input--select"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              aria-label="Filter by target type"
            >
              {TARGETS.map((t) => (
                <option key={t} value={t}>
                  {t === "all" ? "All target types" : t.replace(/_/g, " ")}
                </option>
              ))}
            </select>
            <span className="toolbar-count">{reviewActions.length} entries</span>
          </div>

          {loading ? (
            <Loading label="Loading the audit trail…" />
          ) : reviewActions.length === 0 ? (
            <Empty label="No admin actions recorded for this filter." />
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>When</th>
                    <th>Admin</th>
                    <th>Action</th>
                    <th>Target type</th>
                    <th>Target id</th>
                    <th>Note</th>
                  </tr>
                </thead>
                <tbody>
                  {reviewActions.map((row) => (
                    <tr key={row.id}>
                      <td className="cell-nowrap muted">{formatDate(row.created_at)}</td>
                      <td className="cell-strong">{row.admin_name}</td>
                      <td>{row.action}</td>
                      <td>{row.target_type.replace(/_/g, " ")}</td>
                      <td className="mono muted">{row.target_id ?? "—"}</td>
                      <td className="cell-wide">
                        {row.note || <span className="muted">—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      ) : (
        <>
          <div className="toolbar">
            <span className="toolbar-count">{authEvents.length} entries</span>
          </div>

          {loading ? (
            <Loading label="Loading sign-in events…" />
          ) : authEvents.length === 0 ? (
            <Empty label="No sign-in events recorded." />
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>When</th>
                    <th>Email</th>
                    <th>Event</th>
                    <th>Audience</th>
                  </tr>
                </thead>
                <tbody>
                  {authEvents.map((row) => (
                    <tr key={row.id}>
                      <td className="cell-nowrap muted">{formatDate(row.created_at)}</td>
                      <td className="cell-strong">{row.email ?? "—"}</td>
                      <td>{row.event.replace(/_/g, " ")}</td>
                      <td>{row.audience ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </>
  );
}
