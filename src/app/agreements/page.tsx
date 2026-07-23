import type { Metadata } from "next";
import Link from "next/link";
import SiteNav from "@/components/site/SiteNav";
import SiteFooter from "@/components/site/SiteFooter";
import { AGREEMENT_INDEX } from "@/lib/agreements";

export const metadata: Metadata = {
  title: "Agreements | Law Member Network",
  description:
    "The Law Member Network agreements for members, experts and partners, readable in full.",
  openGraph: { title: "Law Member Network agreements", url: "/agreements" },
};

export default function AgreementsIndexPage() {
  return (
    <>
      <SiteNav active="agreements" />

      <main className="ag-page">
        <div className="wrap ag-wrap">
          <div className="kicker">The paperwork</div>
          <h1 className="ag-title">Agreements</h1>
          <p className="ag-sub">
            Everything you would be agreeing to, readable in full before you sign anything.
          </p>

          <div className="ag-cards">
            {AGREEMENT_INDEX.map((a) => (
              <div className="ag-card" key={a.slug}>
                <h2>
                  <Link href={`/agreements/${a.slug}`}>{a.label}</Link>
                </h2>
                <p>{a.who}</p>
                <div className="ag-cardlinks">
                  <Link className="btn btn-navy" href={`/agreements/${a.slug}`}>
                    Read it
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <p className="ag-note">
            These are the agreements used on the public site. Members of the hand-picked founding
            cohort are sent a separate, personalised agreement directly by our team.
          </p>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
