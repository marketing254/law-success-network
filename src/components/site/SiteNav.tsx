"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type NavPage = "home" | "experts" | "partners" | "agreements";

/**
 * The shared top nav.
 *
 * Quick links cover every destination a visitor actually needs: the three
 * pages plus direct anchors into the home page's pricing and FAQ sections and
 * the agreements index. The gold CTA differs per page (partners page points at
 * its own signup section; everywhere else, the home waitlist).
 *
 * Under 1020px the inline links collapse into a hamburger-driven full-screen
 * menu; previously they simply disappeared, leaving mobile users with no
 * navigation at all.
 */
const LINKS: Array<{ href: string; label: string; page?: NavPage; hint?: string }> = [
  { href: "/", label: "Home", page: "home" },
  { href: "/experts", label: "Our Experts", page: "experts", hint: "Apply to teach" },
  { href: "/partners", label: "Partners", page: "partners", hint: "Offer members a deal" },
  { href: "/#pricing", label: "Pricing", hint: "$49/mo founding rate" },
  { href: "/#faq", label: "FAQ", hint: "Asked and answered" },
];

export default function SiteNav({ active }: { active: NavPage }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close the menu whenever navigation happens (covers back/forward too).
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // A full-screen menu under a scrolling page is disorienting; lock the page
  // while it is open.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const cta =
    active === "partners"
      ? { href: "#signup", label: "Become a partner" }
      : { href: "/#waitlist", label: "Join the waitlist" };

  return (
    <>
      <nav className="lmn-nav">
        <div className="nbar">
          <Link className="brand" href="/" aria-label="Law Member Network home">
            <span className="mark" aria-hidden="true">
              <img src="/assets/lmn-icon.png" alt="" width="40" height="40" />
            </span>
            <span>
              <strong>Law Member Network</strong>
              <small>Powered by Dominate Law</small>
            </span>
          </Link>

          <div className="nlinks">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={link.page && link.page === active ? "active" : undefined}
                aria-current={link.page && link.page === active ? "page" : undefined}
              >
                {link.label}
              </Link>
            ))}
            {active === "partners" ? (
              <a className="btn btn-gold" href={cta.href} data-magnetic>
                {cta.label}
              </a>
            ) : (
              <Link className="btn btn-gold" href={cta.href} data-magnetic>
                {cta.label}
              </Link>
            )}
            <button
              type="button"
              className="navburger"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              aria-controls="mobile-menu"
              onClick={() => setOpen((v) => !v)}
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
      </nav>

      <div className={open ? "mmenu open" : "mmenu"} id="mobile-menu">
        <nav aria-label="Site menu">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={link.page && link.page === active ? "active" : undefined}
              onClick={() => setOpen(false)}
            >
              {link.label}
              {link.hint ? <small>{link.hint}</small> : null}
            </Link>
          ))}
          {active === "partners" ? (
            <a className="btn btn-gold" href={cta.href} onClick={() => setOpen(false)}>
              {cta.label}
            </a>
          ) : (
            <Link className="btn btn-gold" href={cta.href} onClick={() => setOpen(false)}>
              {cta.label}
            </Link>
          )}
        </nav>
      </div>
    </>
  );
}
