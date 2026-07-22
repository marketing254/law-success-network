"use client";

import React from "react";

/* ------------------------------------------------------------------ fetching */

/**
 * Every console fetch goes through here so no failure is ever silent: a non-2xx
 * response throws with the API's own `error` string, which the pages render
 * inline.
 */
export async function apiJson<T>(url: string, init?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {
    ...((init?.headers as Record<string, string> | undefined) ?? {}),
  };
  if (init?.body) headers["Content-Type"] = "application/json";

  const res = await fetch(url, { ...init, headers, cache: "no-store" });

  let parsed: unknown = null;
  try {
    parsed = await res.json();
  } catch {
    parsed = null;
  }
  const json = (parsed ?? {}) as Record<string, unknown>;

  if (!res.ok) {
    const message =
      typeof json.error === "string" && json.error
        ? json.error
        : `Request failed (${res.status}).`;
    throw new Error(message);
  }
  return json as T;
}

export function errorMessage(err: unknown): string {
  if (err instanceof Error && err.message) return err.message;
  return "Something went wrong. Please try again.";
}

/* --------------------------------------------------------------------- dates */

export function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/* --------------------------------------------------------------------- text */

export function truncate(value: string | null | undefined, max = 60): string {
  if (!value) return "";
  return value.length > max ? `${value.slice(0, max - 1)}…` : value;
}

export function displayName(
  first: string | null | undefined,
  last: string | null | undefined,
  fallback = "—"
): string {
  const name = `${first ?? ""} ${last ?? ""}`.trim();
  return name || fallback;
}

/* ------------------------------------------------------------- status pills */

const PILL_GROUPS: Record<string, string> = {
  new: "grey",
  draft: "grey",
  archived: "grey",
  reviewing: "amber",
  pending_review: "amber",
  pending: "amber",
  sent: "amber",
  viewed: "amber",
  invited: "amber",
  approved: "green",
  active: "green",
  converted: "green",
  onboarded: "green",
  accepted: "green",
  verified: "green",
  declined: "red",
  rejected: "red",
  revoked: "red",
  cancelled: "red",
  suspended: "wine",
  paused: "wine",
  contacted: "blue",
};

export function StatusPill({ status }: { status: string | null | undefined }) {
  const key = (status ?? "").toLowerCase();
  const group = PILL_GROUPS[key] ?? "grey";
  const label = key ? key.replace(/_/g, " ") : "unknown";
  return <span className={`pill pill--${group}`}>{label}</span>;
}

/* ------------------------------------------------------------------ layout */

export function PageHeader({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}) {
  return (
    <header className="page-head">
      <div>
        <h1 className="page-title">{title}</h1>
        {subtitle ? <p className="page-sub">{subtitle}</p> : null}
      </div>
      {children ? <div className="page-head-actions">{children}</div> : null}
    </header>
  );
}

export function Panel({
  title,
  note,
  children,
  onClose,
}: {
  title: string;
  note?: string;
  children: React.ReactNode;
  onClose?: () => void;
}) {
  return (
    <section className="panel">
      <div className="panel-head">
        <div>
          <h2 className="panel-title">{title}</h2>
          {note ? <p className="panel-note">{note}</p> : null}
        </div>
        {onClose ? (
          <button type="button" className="btn btn--ghost btn--sm" onClick={onClose}>
            Close
          </button>
        ) : null}
      </div>
      <div className="panel-body">{children}</div>
    </section>
  );
}

export function ErrorNote({
  message,
  onDismiss,
}: {
  message: string | null;
  onDismiss?: () => void;
}) {
  if (!message) return null;
  return (
    <div className="note note--error" role="alert">
      <span>{message}</span>
      {onDismiss ? (
        <button type="button" className="note-x" onClick={onDismiss} aria-label="Dismiss">
          ×
        </button>
      ) : null}
    </div>
  );
}

export function SuccessNote({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div className="note note--ok" role="status">
      {message}
    </div>
  );
}

export function Loading({ label = "Loading…" }: { label?: string }) {
  return <div className="state state--loading">{label}</div>;
}

export function Empty({ label }: { label: string }) {
  return <div className="state state--empty">{label}</div>;
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      {children}
      {hint ? <span className="field-hint">{hint}</span> : null}
    </label>
  );
}

/** A filter <select> plus a search box — every list page uses the same pair. */
export function Toolbar({
  statuses,
  status,
  onStatus,
  query,
  onQuery,
  placeholder,
  children,
}: {
  statuses: readonly string[];
  status: string;
  onStatus: (value: string) => void;
  query: string;
  onQuery: (value: string) => void;
  placeholder: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="toolbar">
      <select
        className="input input--select"
        value={status}
        onChange={(e) => onStatus(e.target.value)}
        aria-label="Filter by status"
      >
        {statuses.map((s) => (
          <option key={s} value={s}>
            {s === "all" ? "All statuses" : s.replace(/_/g, " ")}
          </option>
        ))}
      </select>
      <input
        className="input input--search"
        type="search"
        value={query}
        placeholder={placeholder}
        onChange={(e) => onQuery(e.target.value)}
        aria-label="Search"
      />
      {children}
    </div>
  );
}

/** External link that never opens a tabnabbing hole. */
export function ExtLink({ href, label }: { href: string | null; label?: string }) {
  if (!href) return <span className="muted">—</span>;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="link">
      {label ?? truncate(href.replace(/^https?:\/\//, ""), 32)}
    </a>
  );
}

/* ----------------------------------------------------------------------- csv */

/**
 * Spreadsheet formula injection guard: a cell starting with = + - or @ is
 * prefixed with an apostrophe so Excel/Sheets treats it as text.
 */
export function csvCell(value: unknown): string {
  if (value === null || value === undefined) return '""';
  let s = String(value);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}

export function buildCsv(headers: string[], rows: unknown[][]): string {
  const lines = [headers.map(csvCell).join(",")];
  for (const row of rows) lines.push(row.map(csvCell).join(","));
  return lines.join("\r\n");
}

export function downloadCsv(filename: string, csv: string): void {
  // Leading BOM so Excel reads the file as UTF-8.
  const blob = new Blob(["﻿", csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
