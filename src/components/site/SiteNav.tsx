import Link from "next/link";

type NavPage = "home" | "experts" | "partners";

/**
 * The shared top nav, ported verbatim from the Dev_Handoff static pages.
 * `active` drives both the .active/aria-current link and the gold CTA, which
 * differs per page in the source markup (partners.html points at its own
 * #signup section, every other page points at the home waitlist).
 */
export default function SiteNav({ active }: { active: NavPage }) {
  return (
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
          <Link
            href="/"
            className={active === "home" ? "active" : undefined}
            aria-current={active === "home" ? "page" : undefined}
          >
            Home
          </Link>
          <Link
            href="/experts"
            className={active === "experts" ? "active" : undefined}
            aria-current={active === "experts" ? "page" : undefined}
          >
            Our Experts
          </Link>
          <Link
            href="/partners"
            className={active === "partners" ? "active" : undefined}
            aria-current={active === "partners" ? "page" : undefined}
          >
            Partners
          </Link>
          {active === "partners" ? (
            <a className="btn btn-gold" href="#signup" data-magnetic>
              Become a partner
            </a>
          ) : (
            <Link className="btn btn-gold" href="/#waitlist" data-magnetic>
              Join the waitlist
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
