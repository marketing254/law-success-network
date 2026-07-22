"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { Overview } from "./types";

const COLLAPSE_KEY = "lmn-admin-sidebar-collapsed-groups";

type BadgeKey = "waitlistNew" | "expertsPending" | "partnersPending" | "foundingDraft";

type NavItem = { href: string; label: string; badge?: BadgeKey };
type NavGroup = { id: string; label: string; items: NavItem[] };

const NAV: NavGroup[] = [
  {
    id: "people",
    label: "People",
    items: [
      { href: "/admin", label: "Dashboard" },
      { href: "/admin/waitlist", label: "Waitlist", badge: "waitlistNew" },
      { href: "/admin/members", label: "Members" },
      { href: "/admin/experts", label: "Experts", badge: "expertsPending" },
      { href: "/admin/partners", label: "Partners", badge: "partnersPending" },
      { href: "/admin/founding", label: "Founding invites", badge: "foundingDraft" },
      { href: "/admin/admins", label: "Admin team" },
    ],
  },
  {
    id: "system",
    label: "System",
    items: [{ href: "/admin/audit-log", label: "Audit log" }],
  },
];

type Counts = Record<BadgeKey, number>;

const ZERO: Counts = {
  waitlistNew: 0,
  expertsPending: 0,
  partnersPending: 0,
  foundingDraft: 0,
};

function isActive(pathname: string, href: string): boolean {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function AdminAppShell({
  role,
  email,
  children,
}: {
  role: string;
  email: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname() ?? "/admin";
  const router = useRouter();

  const [counts, setCounts] = useState<Counts>(ZERO);
  const [collapsed, setCollapsed] = useState<string[]>([]);
  const [navOpen, setNavOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  /* Which group holds the current route — it is never rendered collapsed. */
  const activeGroupId = useMemo(() => {
    const group = NAV.find((g) => g.items.some((i) => isActive(pathname, i.href)));
    return group?.id ?? null;
  }, [pathname]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(COLLAPSE_KEY);
      if (!raw) return;
      const parsed: unknown = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        setCollapsed(parsed.filter((v): v is string => typeof v === "string"));
      }
    } catch {
      /* a corrupt preference is not worth breaking the console over */
    }
  }, []);

  const toggleGroup = useCallback((id: string) => {
    setCollapsed((prev) => {
      const next = prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id];
      try {
        window.localStorage.setItem(COLLAPSE_KEY, JSON.stringify(next));
      } catch {
        /* private mode — the console still works, the preference just won't stick */
      }
      return next;
    });
  }, []);

  /* Badge counts: on mount, then every 90 seconds. */
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const res = await fetch("/api/admin/overview", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as Overview;
        if (cancelled) return;
        setCounts({
          waitlistNew: data.waitlist?.new ?? 0,
          expertsPending: data.experts?.pending ?? 0,
          partnersPending: data.partners?.pending ?? 0,
          foundingDraft: data.founding?.draft ?? 0,
        });
      } catch {
        /* badges are decoration; a blip must not surface as an error */
      }
    };

    void load();
    const timer = window.setInterval(() => void load(), 90_000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    setNavOpen(false);
  }, [pathname]);

  const signOut = useCallback(async () => {
    setSigningOut(true);
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } catch {
      /* the redirect below still gets them off the console */
    }
    router.push("/admin/login");
    router.refresh();
  }, [router]);

  return (
    <div className="admin-shell">
      <aside className={`admin-side${navOpen ? " is-open" : ""}`}>
        <div className="side-brand">
          <span className="side-mark">LMN</span>
          <span className="side-brand-text">
            <strong>Law Member Network</strong>
            <em>Admin console</em>
          </span>
        </div>

        <nav className="side-nav" aria-label="Admin sections">
          {NAV.map((group) => {
            const isCollapsed =
              collapsed.includes(group.id) && group.id !== activeGroupId;
            return (
              <div className="nav-group" key={group.id}>
                <button
                  type="button"
                  className="nav-group-head"
                  onClick={() => toggleGroup(group.id)}
                  aria-expanded={!isCollapsed}
                >
                  <span>{group.label}</span>
                  <span className="nav-caret">{isCollapsed ? "+" : "–"}</span>
                </button>
                {isCollapsed ? null : (
                  <ul className="nav-list">
                    {group.items.map((item) => {
                      const count = item.badge ? counts[item.badge] : 0;
                      return (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            className={`nav-link${
                              isActive(pathname, item.href) ? " is-active" : ""
                            }`}
                          >
                            <span>{item.label}</span>
                            {count > 0 ? <span className="nav-badge">{count}</span> : null}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          })}
        </nav>

        <div className="side-foot">
          <div className="queue-card">
            <h3>Queues open</h3>
            <dl>
              <div>
                <dt>New waitlist</dt>
                <dd>{counts.waitlistNew}</dd>
              </div>
              <div>
                <dt>Experts pending</dt>
                <dd>{counts.expertsPending}</dd>
              </div>
              <div>
                <dt>Partners pending</dt>
                <dd>{counts.partnersPending}</dd>
              </div>
              <div>
                <dt>Invite drafts</dt>
                <dd>{counts.foundingDraft}</dd>
              </div>
            </dl>
          </div>
          <p className="side-powered">Powered by Dominate Law</p>
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-top">
          <button
            type="button"
            className="nav-toggle"
            onClick={() => setNavOpen((v) => !v)}
            aria-expanded={navOpen}
          >
            Menu
          </button>
          <span className="admin-chip">Admin mode</span>
          <div className="admin-top-spacer" />
          <span className="admin-who">
            <strong>{email}</strong>
            <em>{role}</em>
          </span>
          <button
            type="button"
            className="btn btn--ghost btn--sm"
            onClick={() => void signOut()}
            disabled={signingOut}
          >
            {signingOut ? "Signing out…" : "Sign out"}
          </button>
        </header>

        <main className="admin-content">{children}</main>
      </div>
    </div>
  );
}
