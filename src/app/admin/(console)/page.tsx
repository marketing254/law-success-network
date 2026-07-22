"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { Overview } from "@/components/admin/types";
import {
  apiJson,
  errorMessage,
  formatDate,
  Empty,
  ErrorNote,
  Loading,
  PageHeader,
  StatusPill,
} from "@/components/admin/ui";

function Kpi({
  title,
  value,
  caption,
  rows,
}: {
  title: string;
  value: number;
  caption?: string;
  rows: Array<[string, number | string]>;
}) {
  return (
    <section className="kpi">
      <h3>{title}</h3>
      <p className="kpi-main">
        {value}
        {caption ? <small>{caption}</small> : null}
      </p>
      <dl className="kpi-rows">
        {rows.map(([label, v]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{v}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const json = await apiJson<Overview>("/api/admin/overview");
      setData(json);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const seatsRemaining = data ? data.foundingCap - data.members.active : 0;

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="Law Member Network is pre-launch and in waitlist mode. Every number below is a live count from the database."
      >
        <button type="button" className="btn btn--sm" onClick={() => void load()}>
          Refresh
        </button>
      </PageHeader>

      <ErrorNote message={error} onDismiss={() => setError(null)} />

      {loading && !data ? <Loading label="Loading the overview…" /> : null}

      {data ? (
        <>
          <div className="grid grid--kpi">
            <Kpi
              title="Waitlist"
              value={data.waitlist.total}
              caption="total signups"
              rows={[
                ["New / untriaged", data.waitlist.new],
                ["Last 24 hours", data.waitlist.last24h],
              ]}
            />
            <Kpi
              title="Members"
              value={data.members.total}
              caption="records"
              rows={[
                ["Active", data.members.active],
                ["Added this week", data.members.thisWeek],
              ]}
            />
            <Kpi
              title="Experts"
              value={data.experts.total}
              caption="applications"
              rows={[
                ["Pending review", data.experts.pending],
                ["Approved", data.experts.approved],
                ["Onboarded", data.experts.onboarded],
              ]}
            />
            <Kpi
              title="Partners"
              value={data.partners.total}
              caption="records"
              rows={[
                ["Pending review", data.partners.pending],
                ["Approved", data.partners.approved],
                ["Verified", data.partners.verified],
              ]}
            />
            <Kpi
              title="Founding invites"
              value={data.founding.draft + data.founding.sent + data.founding.accepted}
              caption="total"
              rows={[
                ["Draft (nothing sent)", data.founding.draft],
                ["Sent", data.founding.sent],
                ["Accepted", data.founding.accepted],
              ]}
            />
            <Kpi
              title="Founding seats"
              value={data.foundingCap}
              caption="seats planned"
              rows={[
                ["Filled (active members)", data.members.active],
                ["Remaining", seatsRemaining],
              ]}
            />
          </div>

          <p className="page-sub" style={{ marginTop: 10 }}>
            Founding seats are a planned cap of {data.foundingCap}. &ldquo;Remaining&rdquo;
            is that cap minus real activated members — not a marketing figure.
          </p>

          <div className="grid grid--2" style={{ marginTop: 22 }}>
            <section className="card">
              <h2 className="card-title">Recent waitlist signups</h2>
              {data.recentWaitlist.length === 0 ? (
                <p className="muted">No signups yet.</p>
              ) : (
                <table className="table">
                  <tbody>
                    {data.recentWaitlist.map((row) => (
                      <tr key={row.id}>
                        <td>
                          <Link href="/admin/waitlist" className="cell-strong">
                            {row.full_name || row.email}
                          </Link>
                          <span className="cell-sub">
                            {row.firm_name || "No firm given"}
                          </span>
                        </td>
                        <td className="cell-nowrap">
                          <StatusPill status={row.status} />
                        </td>
                        <td className="cell-nowrap muted">{formatDate(row.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </section>

            <section className="card">
              <h2 className="card-title">Recent expert applications</h2>
              {data.recentApplications.length === 0 ? (
                <p className="muted">No applications yet.</p>
              ) : (
                <table className="table">
                  <tbody>
                    {data.recentApplications.map((row) => (
                      <tr key={row.id}>
                        <td>
                          <Link href="/admin/experts" className="cell-strong">
                            {row.full_name || row.email}
                          </Link>
                          <span className="cell-sub">
                            {row.specialty || "No specialty given"}
                          </span>
                        </td>
                        <td className="cell-nowrap">
                          <StatusPill status={row.status} />
                        </td>
                        <td className="cell-nowrap muted">{formatDate(row.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </section>
          </div>
        </>
      ) : null}

      {!loading && !data && !error ? <Empty label="No overview data." /> : null}
    </>
  );
}
