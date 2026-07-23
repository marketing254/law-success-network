import SiteNav from "@/components/site/SiteNav";
import SiteFooter from "@/components/site/SiteFooter";
import WaitlistForm from "@/components/site/WaitlistForm";
import Countdown from "@/components/site/Countdown";

/** The gold line-draw scales divider, used twice on the page. */
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

function ExpertSlot() {
  return (
    <div className="slot reveal">
      <span className="ph" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21c0-4 4-7 8-7s8 3 8 7" />
        </svg>
      </span>
      <b>Founding expert</b>
      <small>Announced soon</small>
    </div>
  );
}

export default function HomePage() {
  return (
    <>
      <SiteNav active="home" />

      {/* ================= HERO ================= */}
      <header className="hero" id="top" data-hero>
        <div
          className="orb orb-gold"
          style={{ width: "340px", height: "340px", top: "-80px", right: "6%" }}
          data-plx="0.12"
          aria-hidden="true"
        />
        <div
          className="orb orb-wine"
          style={{ width: "380px", height: "380px", bottom: "-140px", left: "-6%" }}
          data-plx="0.2"
          aria-hidden="true"
        />
        <div
          className="orb orb-green"
          style={{ width: "220px", height: "220px", top: "40%", left: "38%", opacity: 0.5 }}
          data-plx="0.08"
          aria-hidden="true"
        />
        <div className="wrap">
          {/* launch countdown strip: full hero width, above the fold */}
          <Countdown />
          <div>
            <span className="badge hx hx-fade" style={{ "--d": ".05s" } as React.CSSProperties}>
              <span className="bdot" aria-hidden="true" /> Powered by Dominate Law
            </span>
            <h1>
              <span className="hline">
                <span className="hx hx-rise" style={{ "--d": ".18s" } as React.CSSProperties}>
                  The membership network
                </span>
              </span>
              <span className="hline">
                <span className="hx hx-rise" style={{ "--d": ".3s" } as React.CSSProperties}>
                  for lawyers who <em>own the firm</em>,
                </span>
              </span>
              <span className="hline">
                <span className="hx hx-rise" style={{ "--d": ".42s" } as React.CSSProperties}>
                  not just the caseload.
                </span>
              </span>
            </h1>
            <p className="sub hx hx-fade" style={{ "--d": ".6s" } as React.CSSProperties}>
              Leave your toughest business question on the Expert Hotline and get a reply by text
              and email within 2&ndash;3 business days: a recommended solution plus 3&ndash;4
              vetted experts to contact. Plus a growing resource library, member-only partner deals,
              live AMAs, and a community of fellow firm owners.
            </p>
            <div className="cta-row hx hx-fade" style={{ "--d": ".72s" } as React.CSSProperties}>
              <a className="btn btn-gold" href="#waitlist" data-magnetic>
                Join the founding waitlist &rarr;
              </a>
              <a className="btn btn-line" href="#inside">
                See what&rsquo;s inside
              </a>
            </div>
            <div className="trustline hx hx-fade" style={{ "--d": ".84s" } as React.CSSProperties}>
              <span>
                <span className="tick">&#10003;</span> <b>First 100 lock $49/mo for life</b>
              </span>
              <span>
                <span className="tick">&#10003;</span> <b>Money-back guarantee</b>
              </span>
              <span>
                <span className="tick">&#10003;</span> <b>Cancel anytime</b>
              </span>
            </div>
          </div>
          <div
            className="cardstage hx hx-visual"
            style={{ "--d": ".55s" } as React.CSSProperties}
            aria-hidden="true"
          >
            <div className="mshadowcard" />
            <div className="tilt3d" data-tilt="4">
              <div className="floaty">
                <div className="mcard sheen">
                  <div className="top">
                    <div className="nm">
                      Law Member Network<small>Founding Member</small>
                    </div>
                    <span className="seal">
                      {/* Scales of justice, gold line-art (same motif as the
                          section dividers) in place of the logo mark. */}
                      <svg
                        viewBox="0 0 100 100"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        aria-hidden="true"
                      >
                        <path d="M50 14v62" />
                        <path d="M24 26h52" />
                        <path d="M24 26L14 46M24 26l10 20" />
                        <path d="M14 46a10 10 0 0 0 20 0" />
                        <path d="M76 26L66 46M76 26l10 20" />
                        <path d="M66 46a10 10 0 0 0 20 0" />
                        <path d="M38 80h24" />
                      </svg>
                    </span>
                  </div>
                  <div className="mid">Members &middot; Experts &middot; Partners</div>
                  <div className="bot">
                    <span className="fm">Powered by Dominate Law</span>
                    <span className="no">No. 001 / 100</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="cardnote hx hx-fade" style={{ "--d": "1s" } as React.CSSProperties}>
              <span className="gdot" /> Founding rate locked for life
            </div>
          </div>
        </div>
      </header>

      {/* ================= CREDIBILITY MARQUEE ================= */}
      <div className="marquee" aria-label="The team behind the network">
        <div className="marquee-track">
          <div className="mq-group">
            <span className="mq-item">
              <svg
                className="glyph"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M12 3v18" />
                <path d="M5 7h14" />
                <path d="M5 7l-3 6a3.5 3.5 0 0 0 6 0zM19 7l-3 6a3.5 3.5 0 0 0 6 0z" />
              </svg>
              Powered by Dominate Law{" "}
              <small>&middot; growth platform for ambitious attorneys</small>
            </span>
            <span className="mq-sep" aria-hidden="true" />
            <span className="mq-item">
              <svg
                className="glyph"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <rect x="9" y="3" width="6" height="11" rx="3" />
                <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
              </svg>
              The Dominate Law Podcast <small>&middot; hosted by Naren Arulrajah</small>
            </span>
            <span className="mq-sep" aria-hidden="true" />
            <span className="mq-item">
              <svg
                className="glyph"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M3 11l9-8 9 8" />
                <path d="M5 10v10h14V10" />
                <path d="M9 20v-6h6v6" />
              </svg>
              Ekwa Marketing <small>&middot; 18+ years helping law firms grow</small>
            </span>
            <span className="mq-sep" aria-hidden="true" />
            <span className="mq-item">
              <svg
                className="glyph"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v10M8.5 9.5h7" />
              </svg>
              Law Member Network <small>&middot; built for firm owners</small>
            </span>
            <span className="mq-sep" aria-hidden="true" />
          </div>
        </div>
      </div>

      {/* ================= WHAT'S INSIDE ================= */}
      <section className="sec" id="inside">
        <div className="wrap">
          <div className="reveal">
            <div className="kicker">What&rsquo;s inside</div>
            <div className="h2">Five things your membership actually does.</div>
            <p className="lead">
              No funnels, no upsell ladder. The membership is the product, built around the
              questions firm owners actually wrestle with.
            </p>
          </div>

          <div className="pillars">
            {/* Pillar 1: Expert Hotline (featured) */}
            <div className="pillar wide reveal">
              <div className="hotgrid">
                <div>
                  <span className="tag">Pillar 01 &middot; The flagship</span>
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
                  <h3>The Expert Hotline</h3>
                  <p>
                    Your toughest firm-business question, answered properly, without booking
                    a consultant.
                  </p>
                  <div className="hsteps">
                    <div className="hstep">
                      <span className="n">1</span>
                      <p>
                        <b>Call the members&rsquo; toll-free number</b> and leave a voicemail
                        describing your challenge: hiring, fees, intake, marketing,
                        operations, anything.
                      </p>
                    </div>
                    <div className="hstep">
                      <span className="n">2</span>
                      <p>
                        <b>We work it, AI-assisted,</b> matching your question against the resource
                        library and our bench of vetted law-business experts.
                      </p>
                    </div>
                    <div className="hstep">
                      <span className="n">3</span>
                      <p>
                        <b>Within 2&ndash;3 business days</b> you get a reply by text and email: a
                        recommended solution plus 3&ndash;4 vetted experts to contact.
                      </p>
                    </div>
                  </div>
                  <div className="honest">
                    <b>Honestly framed:</b> the hotline is AI-assisted. It is not a live human
                    answering the phone, and it is not 24/7. It&rsquo;s a considered, written reply
                    routed by fit, never pay-to-play.
                  </div>
                </div>
                <div className="vm" data-stagger="420" aria-hidden="true">
                  <div className="vt">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    >
                      <rect x="9" y="3" width="6" height="11" rx="3" />
                      <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
                    </svg>{" "}
                    Expert Hotline &middot; how a reply looks
                  </div>
                  <div className="vbub me reveal">
                    &ldquo;I&rsquo;m drowning in intake calls we never convert. Something&rsquo;s
                    broken between the first call and the signed engagement letter&hellip;&rdquo;
                    <br />
                    <small style={{ opacity: 0.55 }}>&ndash; your voicemail, Tuesday 4:12 pm</small>
                  </div>
                  <div className="vbub us reveal">
                    <b>Your reply, by text + email:</b> a recommended fix for your
                    intake-to-engagement handoff, the intake resource kit from the library,
                    and <b>3&ndash;4 vetted experts</b> in legal intake and client conversion to
                    contact directly.
                  </div>
                  <div className="vfoot reveal">
                    Illustrative example. Replies arrive within 2&ndash;3 business days. AI-assisted,
                    not a live call line, not 24/7.
                  </div>
                </div>
              </div>
            </div>

            {/* Pillar 2 */}
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
                  <path d="M4 19V5a2 2 0 0 1 2-2h14v16H6a2 2 0 0 0-2 2zm0 0a2 2 0 0 0 2 2h14" />
                  <path d="M9 7h8M9 11h6" />
                </svg>
              </div>
              <h3>Resource library</h3>
              <p>
                Practical kits from vetted law-business experts. Every kit: a training video, action
                guide, checklist, key takeaways, worksheet, slide deck and wall poster. New
                resources added regularly.
              </p>
            </div>

            {/* Pillar 3 */}
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
                  <path d="M16 9l-5.5 6L8 12.5" />
                </svg>
              </div>
              <h3>Exclusive partner deals</h3>
              <p>
                Member-only offers from companies serving law firms: vetted partners with
                deals better than their standard pricing, negotiated for the network.
              </p>
            </div>

            {/* Pillar 4 */}
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
              <h3>Live AMAs &amp; training sessions</h3>
              <p>
                Recurring live sessions with law-business experts: bring your questions, hear
                how other owners are solving the same problems, and watch the replays anytime.
              </p>
            </div>

            {/* Pillar 5 */}
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
                  <circle cx="9" cy="8" r="3.2" />
                  <path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6" />
                  <circle cx="17" cy="9" r="2.6" />
                  <path d="M16 14.5c3 .2 5.5 2.3 5.5 5.5" />
                </svg>
              </div>
              <h3>A community of firm owners</h3>
              <p>
                Fellow owners who carry the same weight you do: payroll, partners, growth,
                reputation, plus the experts and partners who serve them. Curated by people,
                not an algorithm.
              </p>
            </div>
          </div>

          {/* honest numbers only - count-ups */}
          <div className="statband" data-stagger="110">
            <div className="stat reveal">
              <div className="big">
                <span data-count="100">100</span>
              </div>
              <div className="lbl">founding seats at the locked rate</div>
            </div>
            <div className="stat reveal">
              <div className="big">
                <span className="aff">$</span>
                <span data-count="49">49</span>
                <span className="aff">/mo</span>
              </div>
              <div className="lbl">founding rate, locked for life</div>
            </div>
            <div className="stat reveal">
              <div className="big">
                <span data-count="7">7</span>
              </div>
              <div className="lbl">pieces in every expert resource kit</div>
            </div>
            <div className="stat reveal">
              <div className="big">2&ndash;3</div>
              <div className="lbl">business days to a hotline reply</div>
            </div>
          </div>
        </div>
      </section>

      <ScalesDivider />

      {/* ================= PRICING ================= */}
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
            <div className="kicker">Founding pricing</div>
            <div className="h2">Lock the founding rate before the first 100 seats fill.</div>
            <p className="lead">
              One membership, everything included. Pricing steps up as the network grows.
              Founding members keep $49/mo for life.
            </p>
            <div className="toggle" data-pricing-toggle role="group" aria-label="Billing period">
              <button type="button" className="on" data-mode="mo" aria-pressed="true">
                Monthly
              </button>
              <button type="button" data-mode="yr" aria-pressed="false">
                Annual &middot; 2 months free
              </button>
            </div>
          </div>

          <div className="tiers" data-stagger="110">
            <div className="tier feat reveal">
              <span className="ribbon">First 100 members</span>
              <div className="who">Founding member</div>
              <h3>The Founding 100</h3>
              <div className="amt" data-mo="$49" data-yr="$490">
                <span className="val">$49</span>
                <span className="unit">/mo</span>
              </div>
              <div
                className="per"
                data-mo="Locked for life. Your rate never rises."
                data-yr="$490/yr, two months free, locked for life."
              >
                Locked for life. Your rate never rises.
              </div>
              <ul>
                <li>
                  <span className="tk">&#10003;</span> Expert Hotline: reply in 2&ndash;3
                  business days
                </li>
                <li>
                  <span className="tk">&#10003;</span> Full resource library, new kits regularly
                </li>
                <li>
                  <span className="tk">&#10003;</span> Member-only partner deals
                </li>
                <li>
                  <span className="tk">&#10003;</span> Live AMAs &amp; training sessions
                </li>
                <li>
                  <span className="tk">&#10003;</span> Community of fellow firm owners
                </li>
                <li>
                  <span className="tk">&#10003;</span> Founding badge in the member directory
                </li>
              </ul>
              <a className="btn btn-gold" href="#waitlist" data-magnetic>
                Join the waitlist &rarr;
              </a>
            </div>

            <div className="tier reveal">
              <div className="who">Members 101&ndash;500</div>
              <h3>Early member</h3>
              <div className="amt" data-mo="$99" data-yr="$990">
                <span className="val">$99</span>
                <span className="unit">/mo</span>
              </div>
              <div
                className="per"
                data-mo="Early rate while the network grows."
                data-yr="$990/yr, two months free."
              >
                Early rate while the network grows.
              </div>
              <ul>
                <li>
                  <span className="tk">&#10003;</span> Everything in the membership
                </li>
                <li>
                  <span className="tk">&#10003;</span> Same hotline, library, deals &amp; AMAs
                </li>
                <li>
                  <span className="tk">&#10003;</span> Early-member rate
                </li>
              </ul>
              <a className="btn btn-line" href="#waitlist">
                Join the waitlist
              </a>
            </div>

            <div className="tier reveal">
              <div className="who">Member 501 onward</div>
              <h3>Standard</h3>
              <div className="amt" data-mo="$199" data-yr="$1,990">
                <span className="val">$199</span>
                <span className="unit">/mo</span>
              </div>
              <div
                className="per"
                data-mo="Full access to the whole network."
                data-yr="$1,990/yr, two months free."
              >
                Full access to the whole network.
              </div>
              <ul>
                <li>
                  <span className="tk">&#10003;</span> Everything in the membership
                </li>
                <li>
                  <span className="tk">&#10003;</span> Same hotline, library, deals &amp; AMAs
                </li>
                <li>
                  <span className="tk">&#10003;</span> Standard network rate
                </li>
              </ul>
              <a className="btn btn-line" href="#waitlist">
                Join the waitlist
              </a>
            </div>
          </div>

          <div className="pbar reveal">
            <div className="lab">
              Founding seats &middot; <span data-count="100">100</span> of 100 remaining
            </div>
            <div className="bar">
              <i data-fill="100%" />
            </div>
            <small>
              We&rsquo;re pre-launch. Founding pricing ends the day the 100th member joins.
            </small>
          </div>

          <div className="gline reveal">
            <b>Money-back guarantee</b> &middot; cancel anytime &middot; annual prepay $490 = two
            months free. No checkout yet. Join the waitlist and founding members get first
            invitation.
          </div>
        </div>
      </section>

      {/* ================= HONEST CREDIBILITY ================= */}
      <section className="sec" id="credibility">
        <div className="wrap">
          <div className="reveal">
            <div className="kicker">Why trust us</div>
            <div className="h2">No invented numbers. Here&rsquo;s what&rsquo;s actually behind it.</div>
            <div className="disclaimer">
              The Law Member Network is pre-launch. You won&rsquo;t find member counts, testimonials
              or revenue claims on this page, because none exist yet, and we won&rsquo;t
              fabricate them. What you will find is the track record of the team building it.
            </div>
          </div>

          <div className="credgrid" data-stagger="110">
            <div className="ccard reveal">
              <div className="src">
                <span className="av logo">
                  <img src="/assets/dominate-law-logo.png" alt="" />
                </span>
                <span>
                  <b>Dominate Law</b>
                  <small>The parent brand</small>
                </span>
              </div>
              <p>
                LMN is a Dominate Law initiative: the growth platform for ambitious attorneys,
                with a podcast hosted by Naren Arulrajah, webinars, a peer community and free
                legal-business tools. The network carries Dominate Law&rsquo;s standards: strategy
                over grind.
              </p>
            </div>
            <div className="ccard reveal">
              <div className="src">
                <span className="av logo">
                  <img src="/assets/ekwa-logo.png" alt="" />
                </span>
                <span>
                  <b>Ekwa Marketing</b>
                  <small>The team behind Dominate Law</small>
                </span>
              </div>
              <p>
                Ekwa Marketing has spent 18+ years helping law firms and professional practices grow.
                That operating history, not an algorithm, is what shapes who gets on
                the expert bench and which partners make the cut.
              </p>
            </div>
            <div className="ccard reveal">
              <div className="src">
                <span className="av w">&#10003;</span>
                <span>
                  <b>Curated, never pay-to-play</b>
                  <small>How the network stays honest</small>
                </span>
              </div>
              <p>
                Every expert is vetted for real experience with law firms before they&rsquo;re
                featured. Hotline recommendations are routed by fit to your problem. Experts
                and partners can never buy placement.
              </p>
            </div>
          </div>

          <div className="reveal" style={{ marginTop: "48px" }}>
            <div className="kicker">The expert bench</div>
            <div className="h2" style={{ fontSize: "clamp(23px,3vw,30px)" }}>
              Founding experts: announced soon.
            </div>
            <p className="lead" style={{ fontSize: "15.5px" }}>
              We&rsquo;re hand-picking the founding bench of law-business experts now. Names go up
              here when they&rsquo;re real, not before.
            </p>
          </div>
          <div className="expslots" data-stagger="90">
            <ExpertSlot />
            <ExpertSlot />
            <ExpertSlot />
            <ExpertSlot />
          </div>
        </div>
      </section>

      {/* ================= FAQ ================= */}
      <section className="sec faqsec" id="faq">
        <div className="wrap">
          <div className="reveal">
            <div className="kicker">Questions</div>
            <div className="h2">Asked and answered.</div>
          </div>
          <div className="faq" data-faq>
            <div className="qa open">
              <button className="q" type="button" aria-expanded={true}>
                What exactly is the Expert Hotline, and what isn&rsquo;t it?
                <span className="pl" aria-hidden="true">
                  +
                </span>
              </button>
              <div className="a">
                <div>
                  You call the members&rsquo; toll-free number and leave a voicemail describing your
                  challenge. Within 2&ndash;3 business days you get a reply by text and email: a
                  recommended solution plus 3&ndash;4 vetted experts to contact. It&rsquo;s
                  AI-assisted and routed by fit. What it isn&rsquo;t: a live human answering the
                  phone, a 24/7 line, or legal advice. It&rsquo;s business guidance for
                  running your firm.
                </div>
              </div>
            </div>
            <div className="qa">
              <button className="q" type="button" aria-expanded={false}>
                Who is the Law Member Network for?
                <span className="pl" aria-hidden="true">
                  +
                </span>
              </button>
              <div className="a">
                <div>
                  Law firm owners and the attorneys who make the business decisions, solo and
                  small-firm owners especially. If you set fees, hire, market and carry payroll, this
                  network is built around your questions. It&rsquo;s not for lawyers looking for CLE
                  credit, legal research tools, or free generic content.
                </div>
              </div>
            </div>
            <div className="qa">
              <button className="q" type="button" aria-expanded={false}>
                How does the founding pricing lock work?
                <span className="pl" aria-hidden="true">
                  +
                </span>
              </button>
              <div className="a">
                <div>
                  The first 100 members join at $49/mo (or $490/yr, two months free), locked
                  for life: your rate never increases while you remain a member. After the first 100,
                  pricing steps to $99/mo for members 101&ndash;500, then $199/mo standard. Joining
                  the waitlist doesn&rsquo;t commit you to anything. Founding members simply
                  get the first invitation.
                </div>
              </div>
            </div>
            <div className="qa">
              <button className="q" type="button" aria-expanded={false}>
                Is there a guarantee? Can I cancel?
                <span className="pl" aria-hidden="true">
                  +
                </span>
              </button>
              <div className="a">
                <div>
                  Yes and yes. There&rsquo;s a money-back guarantee if the membership isn&rsquo;t
                  right for you, and you can cancel anytime: no long-term contract, no exit
                  call.
                </div>
              </div>
            </div>
            <div className="qa">
              <button className="q" type="button" aria-expanded={false}>
                Who are the experts and partners?
                <span className="pl" aria-hidden="true">
                  +
                </span>
              </button>
              <div className="a">
                <div>
                  Experts are coaches, consultants and specialists with real experience serving law
                  firms, hand-picked and vetted by the Dominate Law team. Partners are
                  companies serving law firms that commit to exclusive member-only deals. The
                  founding bench is being recruited now, and names will be published here when
                  they&rsquo;re real. Hotline routing is always by fit. No one pays for
                  placement.
                </div>
              </div>
            </div>
            <div className="qa">
              <button className="q" type="button" aria-expanded={false}>
                Is any of this legal advice or CLE?
                <span className="pl" aria-hidden="true">
                  +
                </span>
              </button>
              <div className="a">
                <div>
                  No. The Law Member Network provides education and business resources for running a
                  law firm. It is not legal advice, and we don&rsquo;t claim CLE accreditation or bar
                  association affiliation.
                </div>
              </div>
            </div>
            <div className="qa">
              <button className="q" type="button" aria-expanded={false}>
                When does the network launch?
                <span className="pl" aria-hidden="true">
                  +
                </span>
              </button>
              <div className="a">
                <div>
                  We&rsquo;re in waitlist mode while the founding expert bench and first resource
                  kits are assembled. Waitlist members hear first, and the first 100 to join lock the
                  founding rate for life.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <ScalesDivider />

      {/* ================= WAITLIST ================= */}
      <section className="sec" id="waitlist">
        <div className="wrap">
          <div className="formcard formgrid reveal">
            <div>
              <div className="kicker">The founding waitlist</div>
              <h2 className="h2" style={{ fontSize: "clamp(26px,3.4vw,36px)" }}>
                Reserve your place among the first 100.
              </h2>
              <p className="lead" style={{ fontSize: "15.5px" }}>
                No payment, no commitment. The waitlist simply holds your place in line. When
                doors open, founding invitations go out in waitlist order.
              </p>
              <ul className="wperks">
                <li>
                  <span className="tk">&#10003;</span>
                  <span>
                    <b>First invitation</b> when founding membership opens
                  </span>
                </li>
                <li>
                  <span className="tk">&#10003;</span>
                  <span>
                    <b>$49/mo founding rate</b>, locked for life if you join in the first 100
                  </span>
                </li>
                <li>
                  <span className="tk">&#10003;</span>
                  <span>
                    <b>No spam</b>: launch news and founding-member details only
                  </span>
                </li>
              </ul>
            </div>
            <div>
              <WaitlistForm />
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
