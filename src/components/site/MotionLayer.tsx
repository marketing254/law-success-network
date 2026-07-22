"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Port of the static build's assets/lmn.js.
 *
 * Nav elevate · hero entrance · reveals with stagger · parallax · count-ups ·
 * line-draw · pointer tilt · magnetic buttons · pricing toggle · seats bar ·
 * FAQ accordion · marquee.
 *
 * All motion respects prefers-reduced-motion and is transform/opacity only.
 * Re-runs on navigation (pathname dependency) because App Router swaps the DOM
 * without a full reload, so observers bound to the previous page's nodes are
 * dead. Every listener and observer is torn down in the cleanup.
 *
 * Form submission is NOT handled here; the form components own that now.
 */
export default function MotionLayer() {
  const pathname = usePathname();

  useEffect(() => {
    const doc = document;
    const win = window;
    const cleanups: Array<() => void> = [];

    const reduce = win.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finePointer = win.matchMedia("(hover: hover) and (pointer: fine)").matches;

    const scrollTop = () =>
      win.scrollY || doc.documentElement.scrollTop || doc.body.scrollTop || 0;

    // ---------------- nav elevate on scroll ----------------
    const nav = doc.querySelector<HTMLElement>(".lmn-nav");
    const elevate = () => {
      if (nav) nav.classList.toggle("elevated", scrollTop() > 24);
    };
    // capture:true also catches scrolls of any inner container.
    doc.addEventListener("scroll", elevate, { passive: true, capture: true });
    cleanups.push(() =>
      doc.removeEventListener("scroll", elevate, { capture: true } as EventListenerOptions)
    );
    elevate();

    // ---------------- hero entrance ----------------
    const hero = doc.querySelector<HTMLElement>("[data-hero]");
    if (hero) {
      if (reduce) {
        hero.classList.add("is-in");
      } else {
        // double rAF so the initial hidden states paint first
        requestAnimationFrame(() =>
          requestAnimationFrame(() => hero.classList.add("is-in"))
        );
      }
    }

    // ---------------- reveals with stagger ----------------
    const revealSel = ".reveal,.reveal-left,.reveal-right,.reveal-scale";
    doc.querySelectorAll<HTMLElement>("[data-stagger]").forEach((group) => {
      const step = parseFloat(group.getAttribute("data-stagger") || "") || 90;
      group.querySelectorAll<HTMLElement>(revealSel).forEach((el, i) => {
        el.style.transitionDelay = `${i * step}ms`;
      });
    });

    const reveals = doc.querySelectorAll<HTMLElement>(revealSel);
    if (reduce || !("IntersectionObserver" in win)) {
      reveals.forEach((el) => el.classList.add("in"));
    } else {
      const rio = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              e.target.classList.add("in");
              rio.unobserve(e.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
      );
      reveals.forEach((el) => rio.observe(el));
      cleanups.push(() => rio.disconnect());
    }

    // ---------------- scroll parallax ----------------
    const plxEls = Array.from(doc.querySelectorAll<HTMLElement>("[data-plx]")).map(
      (el) => ({
        el,
        speed: parseFloat(el.getAttribute("data-plx") || "") || 0.15,
        base: 0,
      })
    );

    if (plxEls.length && !reduce) {
      let ticking = false;

      const measure = () => {
        const y = scrollTop();
        plxEls.forEach((p) => {
          p.el.style.transform = "";
          const r = p.el.getBoundingClientRect();
          p.base = r.top + y + r.height / 2;
        });
      };
      const apply = () => {
        ticking = false;
        const mid = scrollTop() + win.innerHeight / 2;
        plxEls.forEach((p) => {
          const ty = (mid - p.base) * p.speed;
          p.el.style.transform = `translate3d(0,${ty.toFixed(1)}px,0)`;
        });
      };
      const onScroll = () => {
        if (!ticking) {
          ticking = true;
          requestAnimationFrame(apply);
        }
      };
      const onResize = () => {
        measure();
        apply();
      };

      measure();
      apply();
      doc.addEventListener("scroll", onScroll, { passive: true, capture: true });
      win.addEventListener("resize", onResize, { passive: true });
      cleanups.push(() => {
        doc.removeEventListener("scroll", onScroll, {
          capture: true,
        } as EventListenerOptions);
        win.removeEventListener("resize", onResize);
      });
    }

    // ---------------- count-ups ----------------
    const runCount = (el: HTMLElement) => {
      const target = parseFloat(el.getAttribute("data-count") || "");
      if (Number.isNaN(target)) return;
      const dur = parseInt(el.getAttribute("data-count-dur") || "", 10) || 1400;
      let t0: number | null = null;

      const frame = (t: number) => {
        if (t0 === null) t0 = t;
        const k = Math.min((t - t0) / dur, 1);
        const eased = 1 - Math.pow(1 - k, 3); // easeOutCubic
        el.textContent = Math.round(target * eased).toLocaleString("en-US");
        if (k < 1) requestAnimationFrame(frame);
        else el.textContent = target.toLocaleString("en-US");
      };
      requestAnimationFrame(frame);
    };

    const counters = doc.querySelectorAll<HTMLElement>("[data-count]");
    if (counters.length) {
      if (reduce || !("IntersectionObserver" in win)) {
        counters.forEach((el) => {
          const t = parseFloat(el.getAttribute("data-count") || "");
          if (!Number.isNaN(t)) el.textContent = t.toLocaleString("en-US");
        });
      } else {
        const cio = new IntersectionObserver(
          (entries) => {
            entries.forEach((e) => {
              if (e.isIntersecting) {
                runCount(e.target as HTMLElement);
                cio.unobserve(e.target);
              }
            });
          },
          { threshold: 0.5 }
        );
        counters.forEach((el) => {
          el.textContent = "0";
          cio.observe(el);
        });
        cleanups.push(() => cio.disconnect());
      }
    }

    // ---------------- line-draw SVGs ----------------
    const drawSvgs = doc.querySelectorAll<SVGSVGElement>("svg.draw");
    if (drawSvgs.length && !reduce) {
      drawSvgs.forEach((svg) => {
        svg
          .querySelectorAll<SVGGeometryElement>("path,line,polyline,circle,ellipse")
          .forEach((s, i) => {
            let len: number;
            try {
              len = s.getTotalLength();
            } catch {
              return;
            }
            if (!len) return;
            s.style.strokeDasharray = String(len);
            s.style.strokeDashoffset = String(len);
            s.style.transition = `stroke-dashoffset 1.2s cubic-bezier(.4,0,.2,1) ${i * 160}ms`;
          });
      });

      if ("IntersectionObserver" in win) {
        const dio = new IntersectionObserver(
          (entries) => {
            entries.forEach((e) => {
              if (e.isIntersecting) {
                e.target
                  .querySelectorAll<SVGGeometryElement>(
                    "path,line,polyline,circle,ellipse"
                  )
                  .forEach((s) => {
                    s.style.strokeDashoffset = "0";
                  });
                e.target.classList.add("drawn");
                dio.unobserve(e.target);
              }
            });
          },
          { threshold: 0.45 }
        );
        drawSvgs.forEach((svg) => dio.observe(svg));
        cleanups.push(() => dio.disconnect());
      }
    }

    // ---------------- pointer tilt (desktop only) ----------------
    if (finePointer && !reduce) {
      doc.querySelectorAll<HTMLElement>("[data-tilt]").forEach((el) => {
        const max = parseFloat(el.getAttribute("data-tilt") || "") || 4;
        let raf: number | null = null;
        let rx = 0;
        let ry = 0;

        const apply = () => {
          raf = null;
          el.style.transform = `perspective(950px) rotateX(${rx.toFixed(
            2
          )}deg) rotateY(${ry.toFixed(2)}deg)`;
        };
        const onMove = (ev: PointerEvent) => {
          const r = el.getBoundingClientRect();
          ry = ((ev.clientX - r.left) / r.width - 0.5) * max * 2;
          rx = -((ev.clientY - r.top) / r.height - 0.5) * max * 2;
          if (!raf) raf = requestAnimationFrame(apply);
        };
        const onLeave = () => {
          rx = 0;
          ry = 0;
          if (!raf) raf = requestAnimationFrame(apply);
        };

        el.addEventListener("pointermove", onMove);
        el.addEventListener("pointerleave", onLeave);
        cleanups.push(() => {
          el.removeEventListener("pointermove", onMove);
          el.removeEventListener("pointerleave", onLeave);
          if (raf) cancelAnimationFrame(raf);
        });
      });
    }

    // ---------------- magnetic buttons ----------------
    if (finePointer && !reduce) {
      doc.querySelectorAll<HTMLElement>("[data-magnetic]").forEach((btn) => {
        const strength = 0.22;
        let raf: number | null = null;
        let tx = 0;
        let ty = 0;

        const apply = () => {
          raf = null;
          btn.style.transform = `translate(${tx.toFixed(1)}px,${ty.toFixed(1)}px)`;
        };
        const onMove = (ev: PointerEvent) => {
          const r = btn.getBoundingClientRect();
          tx = (ev.clientX - r.left - r.width / 2) * strength;
          ty = (ev.clientY - r.top - r.height / 2) * strength;
          if (!raf) raf = requestAnimationFrame(apply);
        };
        const onLeave = () => {
          tx = 0;
          ty = 0;
          if (!raf) raf = requestAnimationFrame(apply);
        };

        btn.addEventListener("pointermove", onMove);
        btn.addEventListener("pointerleave", onLeave);
        cleanups.push(() => {
          btn.removeEventListener("pointermove", onMove);
          btn.removeEventListener("pointerleave", onLeave);
          if (raf) cancelAnimationFrame(raf);
        });
      });
    }

    // ---------------- monthly / annual pricing toggle ----------------
    doc.querySelectorAll<HTMLElement>("[data-pricing-toggle]").forEach((tg) => {
      const scope: ParentNode = tg.closest("section") || doc;

      const onClick = (ev: Event) => {
        const b = (ev.target as HTMLElement).closest("button");
        if (!b || b.classList.contains("on")) return;

        tg.querySelectorAll("button").forEach((x) => {
          x.classList.remove("on");
          x.setAttribute("aria-pressed", "false");
        });
        b.classList.add("on");
        b.setAttribute("aria-pressed", "true");

        const m = b.getAttribute("data-mode"); // "mo" | "yr"
        scope.querySelectorAll<HTMLElement>(".amt[data-mo]").forEach((a) => {
          const val = a.querySelector(".val");
          const unit = a.querySelector(".unit");
          if (val) val.textContent = a.getAttribute(`data-${m}`);
          if (unit) unit.textContent = m === "mo" ? "/mo" : "/yr";
        });
        scope.querySelectorAll<HTMLElement>(".per[data-mo]").forEach((p) => {
          p.textContent = p.getAttribute(`data-${m}`);
        });
      };

      tg.addEventListener("click", onClick);
      cleanups.push(() => tg.removeEventListener("click", onClick));
    });

    // ---------------- seats bar fill ----------------
    const fills = doc.querySelectorAll<HTMLElement>("[data-fill]");
    if (fills.length) {
      if (reduce || !("IntersectionObserver" in win)) {
        fills.forEach((el) => {
          el.style.width = el.getAttribute("data-fill") || "";
        });
      } else {
        const fio = new IntersectionObserver(
          (entries) => {
            entries.forEach((e) => {
              if (e.isIntersecting) {
                const t = e.target as HTMLElement;
                t.style.width = t.getAttribute("data-fill") || "";
                fio.unobserve(e.target);
              }
            });
          },
          { threshold: 0.6 }
        );
        fills.forEach((el) => fio.observe(el));
        cleanups.push(() => fio.disconnect());
      }
    }

    // ---------------- FAQ accordion ----------------
    doc.querySelectorAll<HTMLElement>("[data-faq]").forEach((list) => {
      const qas = Array.from(list.querySelectorAll<HTMLElement>(".qa"));

      qas.forEach((qa) => {
        const q = qa.querySelector<HTMLElement>(".q");
        const a = qa.querySelector<HTMLElement>(".a");
        if (!q || !a) return;

        if (qa.classList.contains("open")) a.style.maxHeight = `${a.scrollHeight}px`;

        const onClick = () => {
          const isOpen = qa.classList.contains("open");
          qas.forEach((x) => {
            x.classList.remove("open");
            x.querySelector(".q")?.setAttribute("aria-expanded", "false");
            const xa = x.querySelector<HTMLElement>(".a");
            if (xa) xa.style.maxHeight = "";
          });
          if (!isOpen) {
            qa.classList.add("open");
            q.setAttribute("aria-expanded", "true");
            a.style.maxHeight = `${a.scrollHeight}px`;
          }
        };

        q.addEventListener("click", onClick);
        cleanups.push(() => q.removeEventListener("click", onClick));
      });
    });

    const onFaqResize = () => {
      doc
        .querySelectorAll<HTMLElement>("[data-faq] .qa.open .a")
        .forEach((a) => {
          a.style.maxHeight = `${a.scrollHeight}px`;
        });
    };
    win.addEventListener("resize", onFaqResize, { passive: true });
    cleanups.push(() => win.removeEventListener("resize", onFaqResize));

    // ---------------- marquee (seamless loop) ----------------
    doc.querySelectorAll<HTMLElement>(".marquee").forEach((mq) => {
      const track = mq.querySelector<HTMLElement>(".marquee-track");
      const group = mq.querySelector<HTMLElement>(".mq-group");
      if (!track || !group || reduce) return;

      const build = () => {
        track.querySelectorAll(".mq-group[data-clone]").forEach((c) => c.remove());
        const gw = group.getBoundingClientRect().width;
        if (!gw) return;

        const need = Math.max(1, Math.ceil(mq.offsetWidth / gw)); // groups per half
        const total = need * 2; // even count keeps translateX(-50%) seamless
        for (let i = 1; i < total; i++) {
          const clone = group.cloneNode(true) as HTMLElement;
          clone.setAttribute("data-clone", "");
          clone.setAttribute("aria-hidden", "true");
          track.appendChild(clone);
        }
        // constant ~70px/s regardless of content width
        track.style.setProperty("--mq-speed", `${Math.round((gw * need) / 70)}s`);
      };

      build();

      let rt: ReturnType<typeof setTimeout>;
      const onResize = () => {
        clearTimeout(rt);
        rt = setTimeout(build, 200);
      };
      win.addEventListener("resize", onResize, { passive: true });
      cleanups.push(() => {
        clearTimeout(rt);
        win.removeEventListener("resize", onResize);
        track.querySelectorAll(".mq-group[data-clone]").forEach((c) => c.remove());
      });
    });

    return () => cleanups.forEach((fn) => fn());
  }, [pathname]);

  return null;
}
