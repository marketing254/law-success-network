import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Link from "next/link";
import SiteNav from "@/components/site/SiteNav";
import SiteFooter from "@/components/site/SiteFooter";
import PartnerForm from "@/components/site/PartnerForm";

export const metadata: Metadata = {
  title: "Partners: Reach law firm owners | Law Member Network · Powered by Dominate Law",
  description:
    "Partner with the Law Member Network: put your company in front of law firm owners through a verified partner directory, member-only deals and co-marketing. Founding partners pay $0 for their first six months. Routed by fit, never pay-to-play.",
  openGraph: {
    type: "website",
    siteName: "Law Member Network",
    title: "Partners: Reach law firm owners",
    description:
      "A verified partner directory, member-only deals and co-marketing in front of law firm owners. Founding partners pay $0 for six months. Never pay-to-play.",
    url: "https://lawmembernetwork.com/partners",
  },
  twitter: { card: "summary" },
};

function ScalesDivider() {
  return (
    <div className="divider" aria-hidden="true">
      <svg className="draw" viewBox="0 0 260 70" strokeWidth="2">
        <path d="M6 36H74" />
        <path d="M186 36H254" />
        <path d="M130 12v46" />
        <path d="M100 22h60" />
        <path d="M100 22l-12 20m12-20l12 20" />
        <path d="M86 42a14 14 0 0 0 28 0" />
        <path d="M160 22l-12 20m12-20l12 20" />
        <path d="M146 42a14 14 0 0 0 28 0" />
        <path d="M118 58h24" />
        <circle cx="130" cy="9" r="2.5" />
      </svg>
    </div>
  );
}

function FoundingSlot() {
  return (
    <div className="slot reveal">
      <span className="ph" aria-hidden="true">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 21h18" />
          <path d="M5 21V7l7-4 7 4v14" />
          <path d="M9 21v-4h6v4" />
          <path d="M9 10h.01M15 10h.01M9 14h.01M15 14h.01" />
        </svg>
      </span>
      <b>Founding partner</b>
      <small>Announced soon</small>
    </div>
  );
}

export default function PartnersPage() {
  return (
    <>
      <SiteNav active="partners" />

      {/* ================= HERO ================= */}
      <header className="hero" id="top" data-hero>
        <div
          className="orb orb-gold"
          style={{ width: "340px", height: "340px", top: "-90px", right: "8%" }}
          data-plx="0.12"
          aria-hidden="true"
        ></div>
        <div
          className="orb orb-green"
          style={{ width: "360px", height: "360px", bottom: "-150px", left: "-7%" }}
          data-plx="0.2"
          aria-hidden="true"
        ></div>
        <div
          className="orb orb-wine"
          style={{ width: "220px", height: "220px", top: "44%", left: "40%", opacity: ".5" }}
          data-plx="0.08"
          aria-hidden="true"
        ></div>
        <div className="wrap">
          <div>
            <span className="badge hx hx-fade" style={{ "--d": ".05s" } as CSSProperties}>
              <span className="bdot" aria-hidden="true"></span> Powered by Dominate Law
            </span>
            <h1>
              <span className="hline">
                <span className="hx hx-rise" style={{ "--d": ".18s" } as CSSProperties}>
                  Partner with the network
                </span>
              </span>
              <span className="hline">
                <span className="hx hx-rise" style={{ "--d": ".3s" } as CSSProperties}>
                  where law firm owners <em>go to buy</em>,
                </span>
              </span>
              <span className="hline">
                <span className="hx hx-rise" style={{ "--d": ".42s" } as CSSProperties}>
                  not to be pitched.
                </span>
              </span>
            </h1>
            <p className="sub hx hx-fade" style={{ "--d": ".6s" } as CSSProperties}>
              If your company serves law firms, the Law Member Network puts you in front of the
              owners who make the buying decisions, through a verified partner directory,
              member-only deals and co-marketing. You earn your place by being genuinely useful, and
              founding partners pay $0 for their first six months.
            </p>
            <div className="cta-row hx hx-fade" style={{ "--d": ".72s" } as CSSProperties}>
              <a className="btn btn-gold" href="#signup" data-magnetic>
                Become a founding partner →
              </a>
              <a className="btn btn-line" href="#commitments">
                See the five commitments
              </a>
            </div>
            <div className="trustline hx hx-fade" style={{ "--d": ".84s" } as CSSProperties}>
              <span>
                <span className="tick">✓</span> <b>$0 for your first 6 months</b>
              </span>
              <span>
                <span className="tick">✓</span> <b>Routed by fit, never pay-to-play</b>
              </span>
              <span>
                <span className="tick">✓</span> <b>No long-term contract</b>
              </span>
            </div>
          </div>
          <div
            className="cardstage hx hx-visual"
            style={{ "--d": ".55s" } as CSSProperties}
            aria-hidden="true"
          >
            <div className="tilt3d" data-tilt="4">
              <div className="floaty">
                <div className="emblem sheen">
                  <img
                    src="/assets/lmn-icon.png"
                    alt=""
                    style={{ width: "76%", height: "76%", objectFit: "contain" }}
                  />
                </div>
              </div>
            </div>
            <div className="cardnote hx hx-fade" style={{ "--d": "1s" } as CSSProperties}>
              <span className="gdot"></span> Verified Partner · fee waived first 6 months
            </div>
          </div>
        </div>
      </header>

      {/* ================= THE FIVE COMMITMENTS ================= */}
      <section className="sec" id="commitments">
        <div className="wrap">
          <div className="reveal">
            <div className="kicker">How it works</div>
            <div className="h2">Five commitments. That&rsquo;s the whole deal.</div>
            <p className="lead">
              We keep the partner side deliberately simple. Make these five commitments and the
              network works hard for you: no hidden tiers, no fine print.
            </p>
          </div>

          <div className="pillars" data-stagger="100">
            <div className="stepcard reveal">
              <div className="n">1</div>
              <h3>Give members an exclusive discount</h3>
              <p>
                Offer a genuine member-only deal, meaningfully better than your standard public
                pricing or terms. It&rsquo;s the heart of the partnership and the reason members open
                the directory.
              </p>
            </div>
            <div className="stepcard reveal">
              <div className="n">2</div>
              <h3>Stay reachable</h3>
              <p>
                When a member reaches out, respond promptly. No dead-end contact forms, no weeks of
                silence. The network&rsquo;s reputation rides on partners who actually pick up.
              </p>
            </div>
            <div className="stepcard reveal">
              <div className="n">3</div>
              <h3>Provide a booking link</h3>
              <p>
                Members book time with you directly from your partner profile: no gatekeeping, no
                &ldquo;request a callback&rdquo; loops. One click from interest to conversation.
              </p>
            </div>
            <div className="stepcard reveal">
              <div className="n">4</div>
              <h3>Evolve offers with 30-day notice</h3>
              <p>
                Your member deal isn&rsquo;t frozen forever. Improve it, reshape it, retire it. Just
                give members 30 days&rsquo; notice so nobody is surprised mid-purchase.
              </p>
            </div>
            <div className="stepcard reveal">
              <div className="n">5</div>
              <h3>Pay the fee</h3>
              <p>
                A simple flat fee keeps the directory curated and pay-to-play out of the equation,
                and it&rsquo;s <b>waived for your first six months as a founding partner</b>.
              </p>
            </div>
          </div>

          {/* honest numbers only - count-ups */}
          <div className="statband" data-stagger="110">
            <div className="stat reveal">
              <div className="big">
                <span data-count="5">5</span>
              </div>
              <div className="lbl">commitments, the entire partner agreement</div>
            </div>
            <div className="stat reveal">
              <div className="big">
                <span data-count="6">6</span>
              </div>
              <div className="lbl">months at $0 for founding partners</div>
            </div>
            <div className="stat reveal">
              <div className="big">
                <span data-count="30">30</span>
              </div>
              <div className="lbl">days&rsquo; notice to evolve your member offer</div>
            </div>
            <div className="stat reveal">
              <div className="big">
                <span data-count="2">2</span>
              </div>
              <div className="lbl">months free when you prepay annually</div>
            </div>
          </div>
        </div>
      </section>

      {/* gold line-draw scales divider */}
      <ScalesDivider />

      {/* ================= WHAT YOU OFFER MEMBERS ================= */}
      <section className="sec" id="offer">
        <div className="wrap">
          <div className="pillar wide reveal">
            <div className="hotgrid">
              <div>
                <span className="tag">What you offer members</span>
                <div className="pico" aria-hidden="true">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path
                      d="M20.6 13.4L12 22l-8.6-8.6a2 2 0 0 1-.6-1.4V4a2 2 0 0 1 2-2h8a2 2 0 0 1 1.4.6l8.6 8.6a2 2 0 0 1 0 2.8z"
                      transform="scale(.92) translate(1,1)"
                    />
                    <circle cx="8" cy="8" r="1.6" />
                  </svg>
                </div>
                <h3>Your exclusive member deal goes front and center.</h3>
                <p>
                  Everything else on your profile supports one thing: the offer members can&rsquo;t
                  get anywhere else. It headlines your directory listing, it&rsquo;s what members
                  compare, and it&rsquo;s what turns a listing into a pipeline.
                </p>
                <div className="hsteps">
                  <div className="hstep">
                    <span className="n">✓</span>
                    <p>
                      <b>Better than your public pricing</b>: a real discount, extended terms, or
                      bundled value. Token gestures don&rsquo;t clear the bar.
                    </p>
                  </div>
                  <div className="hstep">
                    <span className="n">✓</span>
                    <p>
                      <b>Simple to claim</b>: members shouldn&rsquo;t need a promo-code scavenger
                      hunt. Your booking link sits right beside the deal.
                    </p>
                  </div>
                  <div className="hstep">
                    <span className="n">✓</span>
                    <p>
                      <b>Yours to evolve</b>: sharpen or reshape the offer whenever you like, with
                      30 days&rsquo; notice to members.
                    </p>
                  </div>
                </div>
                <div className="honest">
                  <b>Honestly curated:</b> partners are vetted for fit with law firms before
                  they&rsquo;re listed. Placement in hotline replies is routed by fit to the
                  member&rsquo;s problem. It can never be bought.
                </div>
              </div>
              <div className="vm" aria-hidden="true">
                <div className="vt">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="4" width="18" height="16" rx="2" />
                    <path d="M3 9h18M8 4v3M16 4v3" />
                  </svg>{" "}
                  Partner directory · how your listing looks
                </div>
                <div className="vbub me reveal">
                  <b>Your company</b> · Verified Partner
                  <br />
                  <small style={{ opacity: ".65" }}>
                    What you do for law firms, in your own words, plus your headshot, logo and
                    booking link.
                  </small>
                </div>
                <div className="vbub us reveal">
                  <b>Member-only deal:</b> the exclusive offer you set, front and center, one click
                  from a booked call.
                </div>
                <div className="vfoot reveal">
                  Illustrative layout. No founding partners have been announced yet. Names go up
                  only when they&rsquo;re real.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= WHAT YOU GET ================= */}
      <section className="sec" id="benefits" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="reveal">
            <div className="kicker">What you get</div>
            <div className="h2">A seat in front of the buyers, and the tools to work it.</div>
            <p className="lead">
              Law firm owners join the network to solve business problems and spend smarter. Partners
              are how they do the second part.
            </p>
          </div>

          <div className="pillars" data-stagger="100">
            <div className="pillar reveal">
              <div className="pico" aria-hidden="true">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="9" cy="10" r="2.4" />
                  <path d="M5.5 17c.7-2 2-3 3.5-3s2.8 1 3.5 3" />
                  <path d="M15 9h4M15 13h4" />
                </svg>
              </div>
              <h3>Partner profile &amp; directory listing</h3>
              <p>
                A full profile in the members&rsquo; partner directory: who you are, what you do for
                law firms, your exclusive member deal and your booking link, all in one place.
              </p>
            </div>
            <div className="pillar reveal">
              <div className="pico" aria-hidden="true">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 3v18h18" />
                  <path d="M7 15l4-4 3 3 6-6" />
                  <path d="M16 8h4v4" />
                </svg>
              </div>
              <h3>Lead flow &amp; dashboard</h3>
              <p>
                Members reach you directly through your profile and booking link, and your partner
                dashboard shows the interest your listing is generating, so you always know what the
                network is doing for you.
              </p>
            </div>
            <div className="pillar reveal">
              <div className="pico" aria-hidden="true">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 2l7 3v6c0 5-3 8.5-7 11-4-2.5-7-6-7-11V5z" />
                  <path d="M8.5 12l2.5 2.5 4.5-5" />
                </svg>
              </div>
              <h3>Verified Partner badge</h3>
              <p>
                The badge tells members you&rsquo;ve been vetted for real fit with law firms and
                you&rsquo;ve made the five commitments. It&rsquo;s earned by the standard you keep,
                never bought.
              </p>
            </div>
            <div className="pillar reveal">
              <div className="pico" aria-hidden="true">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="9" y="3" width="6" height="11" rx="3" />
                  <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
                </svg>
              </div>
              <h3>Podcast &amp; webinar features</h3>
              <p>
                Opportunities to appear on Dominate Law podcast episodes and network webinars where
                it genuinely serves members: useful stories and real expertise, not ad reads.
              </p>
            </div>
            <div className="pillar reveal">
              <div className="pico" aria-hidden="true">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 11l18-7-7 18-2.5-7.5z" />
                  <path d="M11.5 14.5L21 4" />
                </svg>
              </div>
              <h3>Co-marketing</h3>
              <p>
                Joint campaigns, member announcements when your deal launches or improves, and
                cross-promotion through network channels. We succeed when your partnership visibly
                works.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= PRICING RAMP ================= */}
      <section className="sec dark-band" id="pricing">
        <div
          className="bg-motif"
          style={{ width: "560px", right: "-140px", top: "30px" }}
          data-plx="0.07"
          aria-hidden="true"
        >
          <svg
            viewBox="0 0 100 100"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
          >
            <path d="M50 14v62" />
            <path d="M24 26h52" />
            <path d="M24 26L14 46M24 26l10 20" />
            <path d="M14 46a10 10 0 0 0 20 0" />
            <path d="M76 26L66 46M76 26l10 20" />
            <path d="M66 46a10 10 0 0 0 20 0" />
            <path d="M38 80h24" />
          </svg>
        </div>
        <div className="wrap">
          <div className="center reveal">
            <div className="kicker">Partner pricing</div>
            <div className="h2">Start at $0. Stay because it works.</div>
            <p className="lead">
              Founding partners pay nothing for six months, long enough to see real member interest
              before the first invoice. Pricing steps up as the network grows.
            </p>
            <div className="toggle" data-pricing-toggle role="group" aria-label="Billing period">
              <button type="button" className="on" data-mode="mo" aria-pressed={true}>
                Monthly
              </button>
              <button type="button" data-mode="yr" aria-pressed={false}>
                Annual · 2 months free
              </button>
            </div>
          </div>

          <div className="tiers" data-stagger="110">
            <div className="tier feat reveal">
              <span className="ribbon">Founding partners</span>
              <div className="who">Your first 6 months</div>
              <h3>Founding Partner</h3>
              <div className="amt">
                <span className="val">$0</span>
                <span className="unit">/mo</span>
              </div>
              <div className="per">
                Fee waived for six months, full partner benefits from day one.
              </div>
              <ul>
                <li>
                  <span className="tk">✓</span> Partner profile &amp; directory listing
                </li>
                <li>
                  <span className="tk">✓</span> Your exclusive member deal, front and center
                </li>
                <li>
                  <span className="tk">✓</span> Lead flow &amp; partner dashboard
                </li>
                <li>
                  <span className="tk">✓</span> Verified Partner badge
                </li>
                <li>
                  <span className="tk">✓</span> Priority placement as a founding partner
                </li>
              </ul>
              <a className="btn btn-gold" href="#signup" data-magnetic>
                Apply as a founding partner →
              </a>
            </div>

            <div className="tier reveal">
              <div className="who">After the founding window</div>
              <h3>Partner</h3>
              <div className="amt" data-mo="$49" data-yr="$490">
                <span className="val">$49</span>
                <span className="unit">/mo</span>
              </div>
              <div
                className="per"
                data-mo="The standard partner rate as the network grows."
                data-yr="$490/yr, two months free."
              >
                The standard partner rate as the network grows.
              </div>
              <ul>
                <li>
                  <span className="tk">✓</span> Everything in Founding Partner
                </li>
                <li>
                  <span className="tk">✓</span> Same directory, deal, dashboard &amp; badge
                </li>
                <li>
                  <span className="tk">✓</span> Founding partners move here after month 6
                </li>
              </ul>
              <a className="btn btn-line" href="#signup">
                Apply to partner
              </a>
            </div>

            <div className="tier reveal">
              <div className="who">Maximum visibility</div>
              <h3>Featured Partner</h3>
              <div className="amt" data-mo="$199" data-yr="$1,990">
                <span className="val">$199</span>
                <span className="unit">/mo</span>
              </div>
              <div
                className="per"
                data-mo="The top of the ramp as the network matures."
                data-yr="$1,990/yr, two months free."
              >
                The top of the ramp as the network matures.
              </div>
              <ul>
                <li>
                  <span className="tk">✓</span> Everything in Partner
                </li>
                <li>
                  <span className="tk">✓</span> Featured placement in the directory
                </li>
                <li>
                  <span className="tk">✓</span> Priority for podcast, webinar &amp; co-marketing
                  features
                </li>
              </ul>
              <a className="btn btn-line" href="#signup">
                Apply to partner
              </a>
            </div>
          </div>

          <div className="gline reveal">
            <b>Annual prepay = two months free</b> · no long-term contract · evolve your member offer
            with 30 days&rsquo; notice. One thing money never buys: hotline recommendations and
            vetting are routed by fit, never pay-to-play.
          </div>
        </div>
      </section>

      {/* ================= FOUNDING PARTNERS PLACEHOLDER ================= */}
      <section className="sec" id="founding">
        <div className="wrap">
          <div className="reveal">
            <div className="kicker">The founding cohort</div>
            <div className="h2" style={{ fontSize: "clamp(23px,3vw,30px)" }}>
              Founding partners: announced soon.
            </div>
            <p className="lead" style={{ fontSize: "15.5px" }}>
              We&rsquo;re reviewing founding partner applications now. Company names go up here when
              agreements are real, not before. No logos are borrowed, no counts invented.
            </p>
          </div>
          <div className="expslots" data-stagger="90">
            <FoundingSlot />
            <FoundingSlot />
            <FoundingSlot />
            <FoundingSlot />
          </div>
        </div>
      </section>

      {/* ================= PARTNERS CAN CONTRIBUTE CONTENT ================= */}
      <section className="sec" id="contribute" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="pillar wide reveal">
            <div className="hotgrid">
              <div>
                <span className="tag">Partners × Experts</span>
                <div className="pico" aria-hidden="true">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M4 19V5a2 2 0 0 1 2-2h14v16H6a2 2 0 0 0-2 2zm0 0a2 2 0 0 0 2 2h14" />
                    <path d="M9 7h8M9 11h6" />
                  </svg>
                </div>
                <h3>Partners can contribute content too.</h3>
                <p>
                  Know something law firm owners genuinely need to learn, not just buy? Turn on the{" "}
                  <b>Expert capability</b> on the same account and contribute teaching content
                  alongside your partnership: resource kits, AMAs, training sessions.
                </p>
                <div className="hsteps">
                  <div className="hstep">
                    <span className="n">1</span>
                    <p>
                      <b>One account, two capabilities.</b> Partner and Expert are roles on the same
                      provider account: no second membership, no separate fee structure.
                    </p>
                  </div>
                  <div className="hstep">
                    <span className="n">2</span>
                    <p>
                      <b>The same quality bar as every expert.</b> Content must educate, not pitch.
                      Contributions are reviewed to the identical standard the founding expert bench
                      is held to.
                    </p>
                  </div>
                  <div className="hstep">
                    <span className="n">3</span>
                    <p>
                      <b>Teaching earns trust, not routing.</b> Great content raises your standing
                      with members directly. It never buys placement in hotline replies.
                    </p>
                  </div>
                </div>
                <div className="honest">
                  <b>The hard line:</b> Expert Hotline recommendations are routed by fit to the
                  member&rsquo;s problem, never pay-to-play. Not by partnership tier, not by content
                  volume, not by fee.
                </div>
                <div className="cta-row" style={{ marginTop: "24px" }}>
                  <Link className="btn btn-line-navy" href="/experts">
                    See how experts work →
                  </Link>
                </div>
              </div>
              <div className="vm" aria-hidden="true">
                <div className="vt">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="9" />
                    <path d="M16 9l-5.5 6L8 12.5" />
                  </svg>{" "}
                  One account · two ways to show up
                </div>
                <div className="vbub me reveal">
                  <b>As a Partner:</b> your exclusive member deal, directory listing, booking link and
                  dashboard, the commercial relationship.
                </div>
                <div className="vbub us reveal">
                  <b>+ Expert capability:</b> educational resource kits and live sessions, held to the
                  network&rsquo;s teaching standard, the trust relationship.
                </div>
                <div className="vfoot reveal">
                  Same account, same access pricing. Hotline routing is by fit to the member&rsquo;s
                  problem. It cannot be bought at any tier.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FAQ ================= */}
      <section className="sec faqsec" id="faq">
        <div className="wrap">
          <div className="reveal">
            <div className="kicker">Partner questions</div>
            <div className="h2">Asked and answered.</div>
          </div>
          <div className="faq" data-faq>
            <div className="qa open">
              <button className="q" type="button" aria-expanded={true}>
                What does &ldquo;founding partner&rdquo; actually mean?
                <span className="pl" aria-hidden="true">
                  +
                </span>
              </button>
              <div className="a">
                <div>
                  Founding partners join before launch, pay $0 for their first six months, and keep
                  priority placement in the partner directory. After the founding window, the
                  standard partner rate is $49/mo, stepping to $199/mo for Featured Partner as the
                  network matures. No founding partners have been announced yet. Names are published
                  only when agreements are real.
                </div>
              </div>
            </div>
            <div className="qa">
              <button className="q" type="button" aria-expanded={false}>
                What counts as an &ldquo;exclusive member deal&rdquo;?
                <span className="pl" aria-hidden="true">
                  +
                </span>
              </button>
              <div className="a">
                <div>
                  Something genuinely better than what the public gets from you: a real discount,
                  better terms, or meaningful bundled value. It&rsquo;s the first of the five
                  commitments and the centerpiece of your listing. A token gesture won&rsquo;t clear
                  the vetting bar. You can evolve the deal whenever you like with 30 days&rsquo;
                  notice to members.
                </div>
              </div>
            </div>
            <div className="qa">
              <button className="q" type="button" aria-expanded={false}>
                Can we pay to be recommended by the Expert Hotline or ranked higher?
                <span className="pl" aria-hidden="true">
                  +
                </span>
              </button>
              <div className="a">
                <div>
                  No, and this is the network&rsquo;s hardest rule. Hotline recommendations are
                  routed by fit to the member&rsquo;s problem, never by who pays what. The Featured
                  Partner tier buys visibility (featured directory placement and priority for
                  co-marketing), but it never buys a recommendation, a routing preference, or the
                  Verified Partner badge. Those are earned.
                </div>
              </div>
            </div>
            <div className="qa">
              <button className="q" type="button" aria-expanded={false}>
                Can partners publish content or teach members?
                <span className="pl" aria-hidden="true">
                  +
                </span>
              </button>
              <div className="a">
                <div>
                  Yes. Partner and Expert are capabilities on the same provider account, so you can
                  turn on the Expert capability and contribute resource kits, AMAs and training
                  sessions. The catch: your content is held to the same educational quality bar as
                  every expert on the bench. It has to teach, not pitch.
                </div>
              </div>
            </div>
            <div className="qa">
              <button className="q" type="button" aria-expanded={false}>
                How do leads actually reach us?
                <span className="pl" aria-hidden="true">
                  +
                </span>
              </button>
              <div className="a">
                <div>
                  Directly. Members find you in the partner directory, see your exclusive deal, and
                  use your booking link to get time with you: no middleman, no lead auction. Your
                  partner dashboard shows the interest your listing generates so you can judge the
                  partnership on real numbers, not ours.
                </div>
              </div>
            </div>
            <div className="qa">
              <button className="q" type="button" aria-expanded={false}>
                When does this start?
                <span className="pl" aria-hidden="true">
                  +
                </span>
              </button>
              <div className="a">
                <div>
                  The network is pre-launch and in waitlist mode for members. We&rsquo;re reviewing
                  founding partner applications now so the directory opens with real deals in it from
                  day one. Apply below and we&rsquo;ll come back to you by email, honestly, and
                  without invented urgency.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* gold line-draw scales divider */}
      <ScalesDivider />

      {/* ================= PARTNER SIGN-UP ================= */}
      <section className="sec" id="signup">
        <div className="wrap">
          <div className="formcard formgrid reveal">
            <div>
              <div className="kicker">Founding partners</div>
              <h2 className="h2" style={{ fontSize: "clamp(26px,3.4vw,36px)" }}>
                Apply to become a founding partner.
              </h2>
              <p className="lead" style={{ fontSize: "15.5px" }}>
                Tell us what you do for law firms and what you&rsquo;d offer members. Every
                application is reviewed by hand. Fit with firm owners is the only thing that gets
                you in.
              </p>
              <ul className="wperks">
                <li>
                  <span className="tk">✓</span>
                  <span>
                    <b>$0 for your first six months</b>, full partner benefits from day one
                  </span>
                </li>
                <li>
                  <span className="tk">✓</span>
                  <span>
                    <b>Priority directory placement</b> for founding partners, kept as the network
                    grows
                  </span>
                </li>
                <li>
                  <span className="tk">✓</span>
                  <span>
                    <b>No obligation</b>: applying starts a conversation, not a contract
                  </span>
                </li>
              </ul>
            </div>
            <div>
              <PartnerForm />
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
