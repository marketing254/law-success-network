import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Link from "next/link";
import SiteNav from "@/components/site/SiteNav";
import SiteFooter from "@/components/site/SiteFooter";
import ExpertForm from "@/components/site/ExpertForm";

export const metadata: Metadata = {
  title: "Our Experts: Teach the lawyers who run firms | Law Member Network",
  description:
    "Coaches, consultants and educators serving law firms: give one recording (an hour or less) and the Law Member Network produces your 7-piece resource kit, features you to a membership of firm owners, and routes Expert Hotline referrals to you by fit, never pay-to-play. $0 for your first 6 months.",
  openGraph: {
    type: "website",
    siteName: "Law Member Network",
    title: "Our Experts: Teach the lawyers who run firms",
    description:
      "Give one recording; we produce your 7-piece resource kit and feature you to a membership of law firm owners. Referrals routed by fit, never pay-to-play.",
    url: "https://lawmembernetwork.com/experts",
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

export default function ExpertsPage() {
  return (
    <>
      <SiteNav active="experts" />

      {/* ================= HERO ================= */}
      <header className="hero" id="top" data-hero>
        <div
          className="orb orb-gold"
          style={{ width: "340px", height: "340px", top: "-70px", right: "8%" }}
          data-plx="0.12"
          aria-hidden="true"
        ></div>
        <div
          className="orb orb-green"
          style={{ width: "360px", height: "360px", bottom: "-150px", left: "-7%" }}
          data-plx="0.18"
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
                  Teach the lawyers
                </span>
              </span>
              <span className="hline">
                <span className="hx hx-rise" style={{ "--d": ".3s" } as CSSProperties}>
                  who <em>run the firm</em>,
                </span>
              </span>
              <span className="hline">
                <span className="hx hx-rise" style={{ "--d": ".42s" } as CSSProperties}>
                  we&rsquo;ll handle the rest.
                </span>
              </span>
            </h1>
            <p className="sub hx hx-fade" style={{ "--d": ".6s" } as CSSProperties}>
              The Law Member Network features coaches, consultants and educators with real law-firm
              business expertise. Give us one recording, an hour or less, and we produce your
              complete 7-piece resource kit, feature you to a membership of firm owners, and route
              Expert Hotline referrals to you by fit. Never pay-to-play.
            </p>
            <div className="cta-row hx hx-fade" style={{ "--d": ".72s" } as CSSProperties}>
              <a className="btn btn-gold" href="#apply" data-magnetic>
                Apply to become an expert →
              </a>
              <a className="btn btn-line" href="#how">
                See how it works
              </a>
            </div>
            <div className="trustline hx hx-fade" style={{ "--d": ".84s" } as CSSProperties}>
              <span>
                <span className="tick">✓</span> <b>One recording, an hour or less</b>
              </span>
              <span>
                <span className="tick">✓</span> <b>You approve everything before launch</b>
              </span>
              <span>
                <span className="tick">✓</span> <b>$0 for your first 6 months</b>
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
              <span className="gdot"></span> Featured experts · vetted, never pay-to-play
            </div>
          </div>
        </div>
      </header>

      {/* ================= HOW IT WORKS ================= */}
      <section className="sec" id="how">
        <div className="wrap">
          <div className="reveal">
            <div className="kicker">How it works</div>
            <div className="h2">One hour of teaching. We produce everything else.</div>
            <p className="lead">
              You&rsquo;re an educator, not a media company. So the network carries the production:
              you bring the expertise, we build the assets, and nothing launches until you&rsquo;ve
              approved it.
            </p>
          </div>

          <div className="steps3" data-stagger="110">
            <div className="stepcard reveal">
              <div className="n">1</div>
              <h3>Record one session</h3>
              <p>
                Teach what you know best for an hour or less: one recording on a topic law firm
                owners wrestle with. Send it over with a headshot, a short bio and your booking link.
                That&rsquo;s your entire lift.
              </p>
            </div>
            <div className="stepcard reveal">
              <div className="n">2</div>
              <h3>We build your 7-piece kit</h3>
              <p>Our team turns that one session into a complete resource kit:</p>
              <ul className="wperks" style={{ marginTop: "14px", fontSize: "13.5px" }}>
                <li>
                  <span className="tk">✓</span>
                  <span>Training video</span>
                </li>
                <li>
                  <span className="tk">✓</span>
                  <span>Action guide</span>
                </li>
                <li>
                  <span className="tk">✓</span>
                  <span>Checklist</span>
                </li>
                <li>
                  <span className="tk">✓</span>
                  <span>Key takeaways</span>
                </li>
                <li>
                  <span className="tk">✓</span>
                  <span>Worksheet</span>
                </li>
                <li>
                  <span className="tk">✓</span>
                  <span>Slide deck</span>
                </li>
                <li>
                  <span className="tk">✓</span>
                  <span>Wall poster</span>
                </li>
              </ul>
              <p style={{ marginTop: "14px" }}>
                <b style={{ color: "var(--navy)" }}>You approve every piece</b> before anything goes
                live.
              </p>
            </div>
            <div className="stepcard reveal">
              <div className="n">3</div>
              <h3>You&rsquo;re featured to the membership</h3>
              <p>
                Your kit joins the resource library, your expert profile and booking link go live,
                and the Expert Hotline routes member questions to you whenever your expertise is the
                right fit for their problem.
              </p>
            </div>
          </div>

          {/* honest numbers only - count-ups */}
          <div className="statband" data-stagger="110">
            <div className="stat reveal">
              <div className="big">
                <span data-count="1">1</span>
              </div>
              <div className="lbl">recording, an hour or less of your time</div>
            </div>
            <div className="stat reveal">
              <div className="big">
                <span data-count="7">7</span>
              </div>
              <div className="lbl">pieces in the kit we produce for you</div>
            </div>
            <div className="stat reveal">
              <div className="big">
                <span data-count="70">70</span>
                <span className="aff">%</span>
              </div>
              <div className="lbl">of course revenue you keep</div>
            </div>
            <div className="stat reveal">
              <div className="big">
                <span data-count="6">6</span>
              </div>
              <div className="lbl">months at $0 when you join as an expert</div>
            </div>
          </div>
        </div>
      </section>

      {/* gold line-draw scales divider */}
      <ScalesDivider />

      {/* ================= WHAT YOU GET ================= */}
      <section className="sec" id="benefits">
        <div className="wrap">
          <div className="reveal">
            <div className="kicker">What you get</div>
            <div className="h2">A bench seat in front of the owners who buy.</div>
            <p className="lead">
              Members are law firm owners: the people who set fees, hire, and sign engagement
              letters with experts like you. Here&rsquo;s what being on the bench means.
            </p>
          </div>

          <div className="pillars">
            <div className="pillar wide reveal">
              <span className="tag">The flagship channel</span>
              <div className="pico" aria-hidden="true">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 5a2 2 0 0 1 2-2h3l2 4-2 1a12 12 0 0 0 6 6l1-2 4 2v3a2 2 0 0 1-2 2A16 16 0 0 1 3 5z" />
                </svg>
              </div>
              <h3>Expert Hotline referrals, routed by fit</h3>
              <p>
                When a member leaves a hotline voicemail about a problem in your lane, the reply they
                receive names 3–4 vetted experts to contact, and if you&rsquo;re the right fit,
                you&rsquo;re one of them. These are owners who just described their exact problem,
                asking to be pointed at someone like you.
              </p>
              <div className="honest">
                <b>Never pay-to-play:</b> hotline recommendations are matched to the member&rsquo;s
                problem by fit. No expert can buy placement, not at any price, not at any tier.
              </div>
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
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 21c0-4 4-7 8-7s8 3 8 7" />
                </svg>
              </div>
              <h3>Featured expert profile + booking link</h3>
              <p>
                Your profile, bio and resource kit live in the member library, with your booking
                link one click away, so interested owners go straight onto your calendar.
              </p>
            </div>

            <div className="pillar reveal d1">
              <div className="pico" aria-hidden="true">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M13 3L4 14h6l-1 7 9-11h-6z" />
                </svg>
              </div>
              <h3>Warm leads, not cold lists</h3>
              <p>
                Members find you through your kit, your AMAs and hotline referrals, so the owners
                who reach out already know your thinking and want more of it.
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
                  <rect x="2" y="6" width="13" height="12" rx="2" />
                  <path d="M15 10l7-4v12l-7-4z" />
                </svg>
              </div>
              <h3>AMA &amp; webinar features</h3>
              <p>
                Get featured in live AMAs and training sessions with the membership: answer real
                owners&rsquo; questions in real time, with replays that keep working for you
                afterwards.
              </p>
            </div>

            <div className="pillar reveal d1">
              <div className="pico" aria-hidden="true">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 7v5l3 3" />
                </svg>
              </div>
              <h3>Sell your courses, keep 70%</h3>
              <p>
                Offer your full courses to the membership through the network. You keep 70% of course
                revenue; the network&rsquo;s 30% covers the platform, promotion and audience.
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
            <div className="kicker">Expert pricing</div>
            <div className="h2">Start at $0. Pay only once the network is working for you.</div>
            <p className="lead">
              Expert access ramps as the network grows. You get six months on the bench before the
              first dollar is due.
            </p>
          </div>

          <div className="tiers" data-stagger="110">
            <div className="tier feat reveal">
              <span className="ribbon">Where every expert starts</span>
              <div className="who">Months 1–6</div>
              <h3>Free start</h3>
              <div className="amt">
                <span className="val">$0</span>
                <span className="unit">/mo</span>
              </div>
              <div className="per">Six months on the bench at no cost.</div>
              <ul>
                <li>
                  <span className="tk">✓</span> We produce your 7-piece resource kit
                </li>
                <li>
                  <span className="tk">✓</span> Featured profile + booking link go live
                </li>
                <li>
                  <span className="tk">✓</span> Hotline referrals routed to you by fit
                </li>
                <li>
                  <span className="tk">✓</span> AMA &amp; webinar features
                </li>
                <li>
                  <span className="tk">✓</span> Sell courses, keep 70%
                </li>
              </ul>
              <a className="btn btn-gold" href="#apply" data-magnetic>
                Apply now →
              </a>
            </div>

            <div className="tier reveal">
              <div className="who">After your first 6 months</div>
              <h3>Expert</h3>
              <div className="amt">
                <span className="val">$49</span>
                <span className="unit">/mo</span>
              </div>
              <div className="per">The early rate while the network grows.</div>
              <ul>
                <li>
                  <span className="tk">✓</span> Everything in the expert seat
                </li>
                <li>
                  <span className="tk">✓</span> Same library placement &amp; referrals
                </li>
                <li>
                  <span className="tk">✓</span> Same 70% course split
                </li>
              </ul>
              <a className="btn btn-line" href="#apply">
                Apply now
              </a>
            </div>

            <div className="tier reveal">
              <div className="who">As the network scales</div>
              <h3>Standard</h3>
              <div className="amt">
                <span className="val">$199</span>
                <span className="unit">/mo</span>
              </div>
              <div className="per">The standard expert rate at full scale.</div>
              <ul>
                <li>
                  <span className="tk">✓</span> Everything in the expert seat
                </li>
                <li>
                  <span className="tk">✓</span> Same library placement &amp; referrals
                </li>
                <li>
                  <span className="tk">✓</span> Same 70% course split
                </li>
              </ul>
              <a className="btn btn-line" href="#apply">
                Apply now
              </a>
            </div>
          </div>

          <div className="gline reveal">
            <b>The fee never buys placement.</b> Hotline referrals are routed by fit to the
            member&rsquo;s problem. At $0, $49 or $199, the quality bar and the routing are exactly
            the same.
          </div>
        </div>
      </section>

      {/* ================= FIT CHECK ================= */}
      <section className="sec" id="fit">
        <div className="wrap">
          <div className="reveal">
            <div className="kicker">The fit check</div>
            <div className="h2">One bar for everyone: teach something real.</div>
            <p className="lead">
              The bench is curated by people, not an algorithm. Every expert is vetted for genuine
              law-firm business expertise before anything is produced, and the same bar applies to
              partners who contribute content.
            </p>
          </div>

          <div className="fit" data-stagger="110">
            <div className="fitcol yes reveal-left">
              <h3>A strong fit</h3>
              <ul>
                <li>
                  <span className="tk">✓</span>
                  <span>
                    <b>Practice management</b>: operations, intake, workflow, client experience in
                    real firms
                  </span>
                </li>
                <li>
                  <span className="tk">✓</span>
                  <span>
                    <b>Marketing &amp; growth</b>: positioning, referrals, digital presence for law
                    firms specifically
                  </span>
                </li>
                <li>
                  <span className="tk">✓</span>
                  <span>
                    <b>Finance &amp; pricing</b>: fees, billing, profitability, cash flow for firm
                    owners
                  </span>
                </li>
                <li>
                  <span className="tk">✓</span>
                  <span>
                    <b>Hiring &amp; team building</b>: recruiting, retaining and leading legal teams
                  </span>
                </li>
                <li>
                  <span className="tk">✓</span>
                  <span>
                    <b>Legal tech &amp; operations</b>: tools and systems that actually change how
                    firms run
                  </span>
                </li>
                <li>
                  <span className="tk">✓</span>
                  <span>
                    <b>Transitions</b>: succession, mergers, buying and selling practices
                  </span>
                </li>
              </ul>
            </div>
            <div className="fitcol no reveal-right">
              <h3>Not a fit</h3>
              <ul>
                <li>
                  <span className="tk">✗</span>
                  <span>
                    <b>Promotional content</b>: sessions built to pitch rather than teach; every kit
                    must stand alone as education
                  </span>
                </li>
                <li>
                  <span className="tk">✗</span>
                  <span>
                    <b>No law-firm track record</b>: generic business content with &ldquo;for
                    lawyers&rdquo; pasted on top
                  </span>
                </li>
                <li>
                  <span className="tk">✗</span>
                  <span>
                    <b>Buying visibility</b>: there is no fee, tier or relationship that gets an
                    expert recommended over a better fit
                  </span>
                </li>
                <li>
                  <span className="tk">✗</span>
                  <span>
                    <b>Legal advice</b>: the network is business education for running a firm, not a
                    channel for legal opinions
                  </span>
                </li>
              </ul>
            </div>
          </div>

          <p className="lead reveal" style={{ marginTop: "34px", fontSize: "15px" }}>
            Run a company that serves law firms rather than teach them? You may be a better fit as a{" "}
            <Link
              href="/partners"
              style={{
                color: "var(--wine)",
                fontWeight: 600,
                textDecoration: "underline",
                textUnderlineOffset: "3px",
              }}
            >
              partner
            </Link>
            , and partners who want to teach can add the expert capability too, held to this same
            bar.
          </p>
        </div>
      </section>

      {/* gold line-draw scales divider */}
      <ScalesDivider />

      {/* ================= APPLICATION ================= */}
      <section className="sec" id="apply">
        <div className="wrap">
          <div className="formcard formgrid reveal">
            <div>
              <div className="kicker">Expert application</div>
              <h2 className="h2" style={{ fontSize: "clamp(26px,3.4vw,36px)" }}>
                Apply to join the founding bench.
              </h2>
              <p className="lead" style={{ fontSize: "15.5px" }}>
                Tell us what you&rsquo;d teach law firm owners. Every application is reviewed by the
                Dominate Law team. The bench is vetted, and the quality bar is the same for
                everyone.
              </p>
              <ul className="wperks">
                <li>
                  <span className="tk">✓</span>
                  <span>
                    <b>One hour of your time</b>: we produce the entire 7-piece kit
                  </span>
                </li>
                <li>
                  <span className="tk">✓</span>
                  <span>
                    <b>You approve everything</b> before your name goes anywhere
                  </span>
                </li>
                <li>
                  <span className="tk">✓</span>
                  <span>
                    <b>$0 for your first 6 months</b>, then $49/mo, stepping to $199/mo as the
                    network scales
                  </span>
                </li>
              </ul>
            </div>
            <div>
              <ExpertForm />
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
