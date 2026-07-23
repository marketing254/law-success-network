import Link from "next/link";

/**
 * The shared footer, ported verbatim from the Dev_Handoff static pages.
 * Pricing / FAQ point at the home page sections (index.html#pricing and
 * index.html#faq in the source).
 */
export default function SiteFooter() {
  return (
    <footer>
      <div className="wrap">
        <div className="fcols">
          <div>
            <Link className="brand" href="/">
              <span className="mark" aria-hidden="true">
                <img src="/assets/lmn-icon.png" alt="" width="40" height="40" />
              </span>
              <span>
                <strong>Law Member Network</strong>
                <small>Powered by Dominate Law</small>
              </span>
            </Link>
            <p className="fabout">
              Connecting law firm owners with the experts and companies that help them grow. A
              Dominate Law initiative by Ekwa Marketing, curated by people, not an algorithm.
            </p>
          </div>
          <div>
            <h5>Network</h5>
            <div className="fl">
              <Link href="/">Home</Link>
              <Link href="/experts">Our Experts</Link>
              <Link href="/partners">Partners</Link>
              <Link href="/#pricing">Pricing</Link>
              <Link href="/#faq">FAQ</Link>
            </div>
          </div>
          <div>
            <h5>Get in touch</h5>
            <div className="fl">
              <Link href="/#waitlist">Join the waitlist</Link>
              <a href="mailto:hello@lawmembernetwork.com">hello@lawmembernetwork.com</a>
              <a href="https://dominatelaw.com" rel="noopener">
                dominatelaw.com
              </a>
            </div>
          </div>
        </div>
        <p className="notlegal">
          The Law Member Network provides education and business resources for law firm owners.
          Nothing on this site, in the membership, or from the Expert Hotline constitutes legal
          advice, and no attorney–client relationship is created. LMN does not claim CLE
          accreditation or bar association affiliation.
        </p>
        <div className="fbot">
          <span>
            © 2026 Law Member Network · Powered by Dominate Law · a Dominate Law initiative by Ekwa
            Marketing
          </span>
          <span>Built for owners running real firms.</span>
        </div>
      </div>
    </footer>
  );
}
