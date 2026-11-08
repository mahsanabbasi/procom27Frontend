import { Link } from "wouter";
import { BIT } from "./pixelSprites.js";
import { useEffect, useRef, useState } from "react";
import data from "./referenceData.js";
import { Icon, Mark, Sprite } from "./Visuals.jsx";
import { useWhy } from "./useWhy.js";
import { QUESTS, STEPS } from "./questData.js";
import BitRunner from "./BitRunner.jsx";
const NAV = [
  ["/", "Home"],
  ["/#competitions", "Competitions"],
  ["/teams", "Teams"],
  ["/#schedule", "Schedule"],
  ["/about", "About"],
];
export function ReferenceLink({ href, children, onClick, ...props }) {
  const { notice } = useWhy();
  const valid =
    /^(?:\/#|#|https?:|mailto:|tel:)/.test(href) ||
    ["/", "/teams", "/about", "/why-attend"].includes(href);
  const Tag = valid && href.startsWith("/") ? Link : "a";
  return (
    <Tag
      {...props}
      href={href}
      onClick={(e) => {
        if (!valid) {
          e.preventDefault();
          notice(`This page is not available yet. Planned route: ${href}`);
        }
        onClick?.(e);
      }}
    >
      {children}
    </Tag>
  );
}
function Countdown() {
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(id);
  }, []);
  const ms = new Date(data.registration.deadline).getTime() - now,
    closed = data.registration.closed || ms <= 0,
    d = Math.floor(ms / 864e5),
    h = Math.floor(ms / 36e5) % 24;
  return (
    <a
      className={`navcd${closed ? " is-closed" : ""}`}
      href="#next-level"
      data-navcd
      title="Registration deadline: 15 February 2027, 11:59 pm PKT"
      aria-label={
        closed
          ? "Registration closed"
          : `Registration closes in ${d} days and ${h} hours`
      }
    >
      <Icon name="clock" />
      <span className="navcd__txt">
        <span className="navcd__lbl">
          {closed ? "Registration" : "Reg closes in"}
        </span>
        <span className="navcd__v" data-navcd-v>
          {closed ? (
            "Closed"
          ) : (
            <>
              <b>{d}</b>D<i>:</i>
              <b>{String(h).padStart(2, "0")}</b>H
            </>
          )}
        </span>
      </span>
    </a>
  );
}
function Munch() {
  const { award, quest } = useWhy(),
    [scroll, setScroll] = useState({ p: 0, left: false, moving: false }),
    [items, setItems] = useState([]),
    [width, setWidth] = useState(0),
    last = useRef(0);
  useEffect(() => {
    let frame = 0,
      timer;
    const root = document.querySelector(".why-attend-page");
    const layout = () => {
      const H = Math.max(
        1,
        document.documentElement.scrollHeight - innerHeight,
      );
      setWidth(root.querySelector(".munch__track")?.clientWidth || 0);
      setItems(
        Array.from(root.querySelectorAll("[data-munch]"), (s) => ({
          id: s.id,
          p: Math.max(
            0,
            Math.min(1, (s.getBoundingClientRect().top + scrollY - 80) / H),
          ),
          icon: s.dataset.munch,
        })),
      );
    };
    const tick = () => {
      frame = 0;
      const p = Math.max(
        0,
        Math.min(
          1,
          scrollY /
            Math.max(1, document.documentElement.scrollHeight - innerHeight),
        ),
      );
      setScroll({ p, left: scrollY < last.current, moving: true });
      last.current = scrollY;
      clearTimeout(timer);
      timer = setTimeout(
        () => setScroll((s) => ({ ...s, moving: false })),
        200,
      );
    };
    const change = () => {
      if (!frame) frame = requestAnimationFrame(tick);
    };
    layout();
    tick();
    const ro = new ResizeObserver(layout);
    ro.observe(root);
    window.addEventListener("scroll", change, { passive: true });
    window.addEventListener("resize", layout);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timer);
      ro.disconnect();
      window.removeEventListener("scroll", change);
      window.removeEventListener("resize", layout);
    };
  }, []);
  useEffect(() => {
    items.forEach((i) => {
      if (i.p <= scroll.p) award(`sec:${i.id}`, 20);
    });
    if (items.length && items.every((i) => i.p <= scroll.p)) quest("explore");
  }, [items, scroll.p, award, quest]);
  return (
    <div className="munch" aria-hidden="true">
      <div className="munch__track">
        <span className="munch__line" style={{ width: `${scroll.p * 100}%` }} />
        <div className="munch__dots">
          {Array.from(
            { length: Math.max(4, Math.floor(width / 24)) },
            (_, i) => {
              const x = i * 24 + 12;
              return items.some(
                (it) => Math.abs(it.p * width - x) < 12,
              ) ? null : (
                <i
                  key={i}
                  className={`munch__seg${x < scroll.p * width + 3 ? " is-eaten" : ""}`}
                  style={{ left: x }}
                />
              );
            },
          )}
          {items.map((i) => (
            <span
              className={`munch__item${i.p <= scroll.p ? " is-eaten" : ""}`}
              style={{ left: `${i.p * 100}%` }}
              key={i.id}
            />
          ))}
        </div>
        <span
          className={`munch__bot${scroll.left ? " is-left" : ""}${scroll.moving ? " is-moving" : ""}`}
          style={{ left: `${scroll.p * 100}%` }}
        >
          <Sprite rows={BIT.shut} className="m-c" />
          <Sprite rows={BIT.open} className="m-o" />
        </span>
      </div>
    </div>
  );
}
export function ReferenceHeader() {
  const [open, setOpen] = useState(false),
    burger = useRef(null),
    menu = useRef(null);
  useEffect(() => {
    const root = document.querySelector(".why-attend-page");
    root?.classList.toggle("menu-open", open);
    if (open) {
      menu.current?.querySelector("a")?.focus();
      document.body.style.overflow = "hidden";
    }
    const key = (e) => {
      if (e.key === "Escape") {
        setOpen(false);
        burger.current?.focus();
      }
      if (e.key === "Tab" && open) {
        const all = [...menu.current.querySelectorAll("a"), burger.current],
          i = all.indexOf(document.activeElement);
        if (e.shiftKey && i <= 0) {
          e.preventDefault();
          all.at(-1).focus();
        } else if (!e.shiftKey && i === all.length - 1) {
          e.preventDefault();
          all[0].focus();
        }
      }
    };
    const resize = () => {
      if (innerWidth > 1100) setOpen(false);
    };
    document.addEventListener("keydown", key);
    window.addEventListener("resize", resize);
    return () => {
      root?.classList.remove("menu-open");
      document.body.style.overflow = "";
      document.removeEventListener("keydown", key);
      window.removeEventListener("resize", resize);
    };
  }, [open]);
  return (
    <>
      <header className="nav" id="site-nav">
        <div className="container nav__in">
          <ReferenceLink className="brand" href="/" aria-label="PROCOMâ€™27 home">
            <Mark />
            <span className="brand__word">PROCOMâ€™27</span>
          </ReferenceLink>
          <nav aria-label="Primary">
            <ul className="nav__links">
              {NAV.map(([h, l]) => (
                <li key={h}>
                  <ReferenceLink className="nav__link" href={h}>
                    {l}
                  </ReferenceLink>
                </li>
              ))}
            </ul>
          </nav>
          <div className="nav__actions">
            <Countdown />
            <ReferenceLink
              className="btn btn--register btn--sm"
              href="/register"
            >
              <Icon name="square" />
              Register
              <Icon name="arrow" />
            </ReferenceLink>
            <button
              ref={burger}
              className="icon-btn nav__burger"
              type="button"
              aria-expanded={open}
              aria-controls="site-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen(!open)}
            >
              <Icon name={open ? "close" : "menu"} />
            </button>
          </div>
        </div>
        <Munch />
      </header>
      <div className="crumbs">
        <div className="container crumbs__in">
          <span className="t-label">You are here</span>
          <nav aria-label="Breadcrumb">
            <ol>
              <li>
                <ReferenceLink href="/">Home</ReferenceLink>
              </li>
              <li>
                <ReferenceLink href="/about">About</ReferenceLink>
              </li>
              <li aria-current="page">Why Attend PROCOMâ€™27</li>
            </ol>
          </nav>
        </div>
      </div>
      <div
        ref={menu}
        className="mmenu"
        id="site-menu"
        role="dialog"
        aria-modal={open || undefined}
        aria-label="Site menu"
        inert={!open}
      >
        {
          <ul>
            {[...NAV, ["/contact", "Contact"]].map(([h, l], i) => (
              <li key={h}>
                <ReferenceLink
                  className="mmenu__link"
                  href={h}
                  onClick={() => setOpen(false)}
                >
                  <span>0{i + 1}</span>
                  {l}
                </ReferenceLink>
              </li>
            ))}
          </ul>
        }
        <ReferenceLink
          className="btn btn--register"
          href="/register"
          onClick={() => setOpen(false)}
        >
          <Icon name="square" />
          Register for PROCOMâ€™27
          <Icon name="arrow" />
        </ReferenceLink>
      </div>
    </>
  );
}
export function ReferenceFooter() {
  const { sound, quest, notice, burst } = useWhy();
  const [credits, setCredits] = useState(() => {
    try {
      return +sessionStorage.getItem("procom27-credits") || 0;
    } catch {
      return 0;
    }
  });
  const quick = [
    ...NAV,
    ["/sponsors", "Sponsors"],
    ["/job-orbit", "Job Orbit"],
    ["/workshops", "Workshops"],
    ["/contact", "Contact"],
  ];
  return (
    <footer className="footer">
      <div className="container">
        <BitRunner />
        <div className="footer__grid footer__grid--4">
          <div>
            <ReferenceLink
              className="brand"
              href="/"
              aria-label="PROCOMâ€™27 home"
            >
              <Mark />
              <span className="brand__word">PROCOMâ€™27</span>
            </ReferenceLink>
            <p
              className="footer__tag t-label"
              style={{ marginTop: "var(--s-3)" }}
            >
              Where skill meets scale
            </p>
            <p className="footer__about">
              Bringing students together to compete, connect, and explore new
              opportunities.
            </p>
          </div>
          <nav aria-label="Quick links">
            <h2>Quick links</h2>
            <ul>
              {quick.map(([h, l]) => (
                <li key={h}>
                  <ReferenceLink href={h}>
                    {l === "About" ? "About Us" : l}
                  </ReferenceLink>
                </li>
              ))}
            </ul>
          </nav>
          <nav aria-label="Competitions">
            <h2>Competitions</h2>
            <ul>
              {data.categories.map((c) => (
                <li key={c.id}>
                  <ReferenceLink href="/#competitions">{c.label}</ReferenceLink>
                </li>
              ))}
            </ul>
          </nav>
          <div>
            <h2>Contact</h2>
            <ul>
              <li>
                <span>[Official email]</span>
              </li>
              <li>
                <span>[Official phone number]</span>
              </li>
              <li>
                <span>[Campus address]</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="footer__bottom">
          <span>Â© PROCOM â€™27. All rights reserved.</span>
          <button
            type="button"
            className="coin"
            aria-label="Insert coin"
            onClick={(e) => {
              const n = credits + 1;
              setCredits(n);
              try {
                sessionStorage.setItem("procom27-credits", n);
              } catch {
                /* Optional storage. */
              }
              quest("coin", e.currentTarget);
              sound("coin");
              burst(e.currentTarget, { n: 10, spread: 40 });
              if (n === 27)
                notice("27 credits. Thatâ€™s the PROCOM â€™27 high score.");
            }}
          >
            <i aria-hidden="true" />
            <span>Insert coin</span>
            <b>Credits {String(credits).padStart(2, "0")}</b>
          </button>
          <ul className="footer__legal">
            {[
              ["/privacy-policy", "Privacy Policy"],
              ["/terms", "Terms & Conditions"],
              ["/refund-policy", "Return & Refund Policy"],
              ["/shipping-policy", "Shipping Policy"],
            ].map(([h, l]) => (
              <li key={h}>
                <ReferenceLink href={h}>{l}</ReferenceLink>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
function QuestLog() {
  const { progress, resetProgress, soundOn, setSoundOn } = useWhy(),
    [open, setOpen] = useState(false),
    ref = useRef(null),
    trigger = useRef(null);
  const level = STEPS.filter((n) => progress.xp >= n).length,
    base = STEPS[level - 1],
    next = STEPS[level],
    done = QUESTS.filter((q) => progress.got[q.id]).length;
  useEffect(() => {
    if (open) ref.current?.querySelector(".xp__x")?.focus();
    const key = (e) => {
      if (e.key === "Escape" && open) {
        setOpen(false);
        trigger.current?.focus();
      }
    };
    const outside = (e) => {
      if (open && !ref.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("keydown", key);
    document.addEventListener("pointerdown", outside);
    return () => {
      document.removeEventListener("keydown", key);
      document.removeEventListener("pointerdown", outside);
    };
  }, [open]);
  return (
    <div className="xp" ref={ref}>
      <button
        ref={trigger}
        className="xp__btn"
        type="button"
        aria-expanded={open}
        aria-controls="xpPanel"
        aria-label={`Level ${level}, ${progress.xp} XP. Open quest log`}
        onClick={() => setOpen(!open)}
      >
        <span className="xp__lv">LV {String(level).padStart(2, "0")}</span>
        <span
          className="xp__bar"
          aria-hidden="true"
          style={{
            "--p": next ? Math.min(1, (progress.xp - base) / (next - base)) : 1,
          }}
        >
          <i />
        </span>
        <span className="xp__pts">{progress.xp} XP</span>
      </button>
      <div
        className="xp__panel"
        id="xpPanel"
        role="dialog"
        aria-label="Quest log"
        hidden={!open}
      >
        <div className="xp__head">
          <span className="t-label">Quest log</span>
          <button
            className="xp__x icon-btn"
            type="button"
            aria-label="Close quest log"
            onClick={() => {
              setOpen(false);
              trigger.current?.focus();
            }}
          >
            <Icon name="close" />
          </button>
        </div>
        <p className="xp__sum">
          <b>LV {String(level).padStart(2, "0")}</b> Â· {progress.xp} XP Â·{" "}
          {next ? `next level at ${next}` : "max level"}
          <br />
          <span>
            {done} of {QUESTS.length} quests complete
          </span>
        </p>
        <ul className="xp__list">
          {QUESTS.map((q) => (
            <li key={q.id} className={progress.got[q.id] ? "is-done" : ""}>
              <span className="xp__chk">
                {progress.got[q.id] && <Icon name="check" />}
              </span>
              <span>
                {q.secret && !progress.got[q.id] ? "??? Secret quest" : q.label}
              </span>
              <b>+{q.pts}</b>
            </li>
          ))}
          <li className="xp__li-note">
            <span className="xp__chk">
              <Icon name="plus" />
            </span>
            <span>Each power-up the muncher eats</span>
            <b>+20</b>
          </li>
        </ul>
        <div className="xp__foot">
          <button
            className="xp__sfx btn btn--card"
            type="button"
            aria-pressed={soundOn}
            onClick={() => setSoundOn(!soundOn)}
          >
            <Icon name={soundOn ? "signal" : "minus"} />
            Sound {soundOn ? "on" : "off"}
          </button>
          <button
            className="xp__reset link-action"
            type="button"
            onClick={resetProgress}
          >
            Reset progress
          </button>
        </div>
      </div>
    </div>
  );
}
export function ReferenceEffects() {
  const { motion, quest, notice, burst } = useWhy(),
    [percent, setPercent] = useState(0),
    [oneup, setOneup] = useState(false);
  useEffect(() => {
    const root = document.querySelector(".why-attend-page");
    // Keep an initial painted state so the reference's character/tunnel entrance
    // transitions run after React mounts, rather than appearing already settled.
    let readyFrame = requestAnimationFrame(() => {
      readyFrame = requestAnimationFrame(() => root.classList.add("is-ready"));
    });
    const timers = new Set();
    const later = (fn, ms) => {
      const id = setTimeout(() => {
        timers.delete(id);
        fn();
      }, ms);
      timers.add(id);
    };
    root
      .querySelectorAll("[data-stagger]")
      .forEach((g) =>
        Array.from(g.children, (c, i) => c.style.setProperty("--i", i)),
      );
    const reveal = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            reveal.unobserve(e.target);
          }
        }),
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
    );
    root.querySelectorAll("[data-reveal]").forEach((el) => {
      if (motion) reveal.observe(el);
      else el.classList.add("is-in");
    });
    later(() => root.classList.add("settled"), 1700);
    let hashFrame = 0,
      active = true;
    const restoreHash = () => {
      if (!active) return;
      hashFrame = requestAnimationFrame(() => {
        try {
          const target = root.querySelector(
            `[id="${CSS.escape(decodeURIComponent(location.hash.slice(1)))}"]`,
          );
          target?.scrollIntoView({ behavior: "instant", block: "start" });
        } catch {
          /* Invalid fragments are ignored. */
        }
      });
    };
    Promise.all(
      ['400 16px "Inter"', '400 16px "Pixelify Sans"'].map((font) =>
        document.fonts.load(font),
      ),
    )
      .then(restoreHash)
      .catch(restoreHash);
    const labels = [];
    const typeObserver = new IntersectionObserver(
      (entries) =>
        entries.forEach((en) => {
          if (!en.isIntersecting) return;
          typeObserver.unobserve(en.target);
          const item = labels.find((x) => x.el === en.target);
          let k = 0;
          item.el.classList.add("typing");
          const type = () => {
            let left = k;
            item.nodes.forEach((x) => {
              const take = Math.max(0, Math.min(x.text.length, left));
              x.node.nodeValue = x.text.slice(0, take);
              left -= x.text.length;
            });
            if (k++ < item.length) later(type, 28);
            else item.el.classList.remove("typing");
          };
          type();
        }),
      { threshold: 0.6 },
    );
    if (motion)
      root.querySelectorAll(".sh__label").forEach((el) => {
        const nodes = Array.from(el.childNodes)
          .filter((n) => n.nodeType === 3 && n.nodeValue.trim())
          .map((node) => ({ node, text: node.nodeValue }));
        if (!nodes.length) return;
        labels.push({
          el,
          nodes,
          length: nodes.map((n) => n.text).join("").length,
        });
        nodes.forEach((n) => (n.node.nodeValue = ""));
        typeObserver.observe(el);
      });
    let reached = false;
    const scroll = () => {
      const p = Math.max(
        0,
        Math.min(
          100,
          Math.round(
            (scrollY /
              Math.max(
                1,
                document.documentElement.scrollHeight - innerHeight,
              )) *
              100,
          ),
        ),
      );
      setPercent(p);
      setOneup(scrollY > innerHeight * 0.8);
      if (p >= 99 && !reached) {
        reached = true;
        notice("Level complete â€” you reached the end of the page.");
      }
    };
    window.addEventListener("scroll", scroll, { passive: true });
    scroll();
    let kp = 0;
    const konami = [
      "ArrowUp",
      "ArrowUp",
      "ArrowDown",
      "ArrowDown",
      "ArrowLeft",
      "ArrowRight",
      "ArrowLeft",
      "ArrowRight",
      "b",
      "a",
    ];
    const key = (e) => {
      const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      kp = k === konami[kp] ? kp + 1 : k === konami[0] ? 1 : 0;
      if (kp === konami.length) {
        kp = 0;
        root.classList.toggle("cheat");
        quest("konami");
        notice(
          root.classList.contains("cheat")
            ? "Cheat code activated: CRT MODE"
            : "Cheat code off",
        );
        for (let i = 0; i < 5; i++)
          later(
            () =>
              burst(
                Math.random() * innerWidth,
                Math.random() * innerHeight * 0.6,
                { n: 20, spread: 120 },
              ),
            i * 140,
          );
      }
    };
    document.addEventListener("keydown", key);
    root.querySelectorAll(".tbc").forEach((el) => {
      el.title = "Waiting for official details";
    });
    return () => {
      active = false;
      cancelAnimationFrame(hashFrame);
      typeObserver.disconnect();
      labels.forEach((x) =>
        x.nodes.forEach((n) => (n.node.nodeValue = n.text)),
      );
      cancelAnimationFrame(readyFrame);
      reveal.disconnect();
      timers.forEach(clearTimeout);
      window.removeEventListener("scroll", scroll);
      document.removeEventListener("keydown", key);
    };
  }, [motion, quest, notice, burst]);
  return (
    <>
      <QuestLog />
      <button
        type="button"
        className={`oneup${oneup ? " is-on" : ""}`}
        aria-label="Back to top"
        onClick={(e) => {
          window.scrollTo({ top: 0, behavior: motion ? "smooth" : "instant" });
          burst(e.currentTarget, { n: 12 });
        }}
      >
        <span className="oneup__t">1UP</span>
        <span className="oneup__p">{percent}%</span>
      </button>
    </>
  );
}
