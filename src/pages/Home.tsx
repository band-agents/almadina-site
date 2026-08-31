/**
 * Homepage.
 *
 * Structure, in the order a stranger needs it:
 *   hero → what we do (departments) → proof (numbers) → how a visit works
 *   → who you'll see (doctors) → voices → the two doors (book / sign in)
 *
 * The hero plays the Remotion-rendered loop. If the file is missing — which
 * it is until `npm run video:render` has been run — the gradient underneath
 * carries the section on its own, so a fresh clone still looks finished.
 */

import { useRef, useState } from "react";
import { Link } from "wouter";
import {
  motion, useReducedMotion, useScroll, useTransform,
} from "framer-motion";
import {
  ArrowRight, CalendarPlus, ChevronRight, HeartPulse, Quote,
  ShieldCheck, Stethoscope,
} from "lucide-react";

import { BRAND } from "@/lib/brand";
import { DOCTORS, JOURNEY, STATS, TESTIMONIALS } from "@/data/hospital";
import { soft, springy, stagger, wordUp } from "@/lib/motion";
import {
  Avatar, ButtonLink, Pill, Reveal, RevealGroup, RevealItem, SectionHead, cx,
} from "@/components/ui";
import { CountUp, ECGLine, PulseRing } from "@/components/vitals";
import { DepartmentExplorer } from "@/components/DepartmentExplorer";

/* ── Hero ────────────────────────────────────────────────── */

const HEADLINE = ["Care,", "close", "to", "home."];

/**
 * Resolve a file in public/ against the deployment base.
 *
 * A literal "/media/hero.mp4" points at the domain root, which is wrong
 * anywhere the site is not served from "/" — on GitHub Pages it resolved to
 * band-agents.github.io/media/hero.mp4 and 404'd, so the hero quietly showed
 * its gradient fallback instead of the video.
 */
const asset = (path: string) => `${import.meta.env.BASE_URL}${path}`.replace(/\/{2,}/g, "/");

function Hero() {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const [videoReady, setVideoReady] = useState(false);

  // Gentle parallax: the video drifts slower than the page, the copy faster.
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const videoY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const copyY = useTransform(scrollYProgress, [0, 1], ["0%", "-14%"]);
  const copyFade = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section
      ref={ref}
      className="relative flex min-h-[92svh] items-center overflow-hidden bg-brand-deep"
    >
      {/* Base gradient — this is what shows before/without the video. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(150deg, #0a3560 0%, #06284a 55%, #0a3560 100%)",
        }}
      />

      <motion.div className="absolute inset-0" style={{ y: reduced ? 0 : videoY }}>
        <video
          className={cx(
            "h-full w-full object-cover transition-opacity duration-1000",
            videoReady ? "opacity-100" : "opacity-0",
          )}
          autoPlay
          muted
          loop
          playsInline
          poster={asset("media/hero-poster.jpg")}
          onCanPlay={() => setVideoReady(true)}
          aria-hidden
        >
          <source src={asset("media/hero.mp4")} type="video/mp4" />
        </video>
      </motion.div>

      {/* Legibility scrim. The video is already vignetted, but the headline
          has to survive whatever frame is showing when someone lands. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(4,20,38,0.55) 0%, rgba(4,20,38,0.28) 38%, rgba(4,20,38,0.82) 100%)",
        }}
      />

      <motion.div
        className="u-wrap relative z-10 pt-28 pb-24"
        style={{ y: reduced ? 0 : copyY, opacity: reduced ? 1 : copyFade }}
      >
        <motion.div initial="hidden" animate="show" variants={stagger(0.09, 0.15)}>
          <motion.div variants={{ hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } }}
            transition={soft(0.7)}>
            <Pill tone="light">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-mint opacity-70" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-mint" />
              </span>
              Emergency open now · {BRAND.hours.emergency}
            </Pill>
          </motion.div>

          {/* Each word rides up from behind its own mask. */}
          <h1 className="mt-6 max-w-4xl text-[clamp(44px,9vw,104px)] text-white">
            {HEADLINE.map((word, i) => (
              <span key={i} className="inline-block overflow-hidden pb-[0.08em] pr-[0.24em] align-bottom">
                <motion.span
                  className="inline-block"
                  variants={reduced ? { hidden: { opacity: 0 }, show: { opacity: 1 } } : wordUp}
                >
                  {word}
                </motion.span>
              </span>
            ))}
          </h1>

          <motion.p
            className="mt-6 max-w-xl text-[17.5px] leading-[1.75] text-white/78"
            variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
            transition={soft(0.8)}
          >
            A general hospital in Nasr City with twelve departments, forty-two
            consultants and an emergency room that has never closed. Book a slot
            in about a minute — no phone queue, no callback.
          </motion.p>

          <motion.div
            className="mt-9 flex flex-wrap items-center gap-3"
            variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
            transition={soft(0.8)}
          >
            <ButtonLink href="/book" tone="primary" size="lg">
              <CalendarPlus size={18} /> Book an appointment
            </ButtonLink>
            <ButtonLink href="/doctors" tone="light" size="lg">
              Find a doctor <ArrowRight size={17} />
            </ButtonLink>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* The heartbeat sits just below the header rather than on the hero's
          bottom edge. Down there it was half-covered by the quick-access cards
          that overlap the hero, so the thing most worth seeing was the thing
          least visible. Up here it runs across open video with nothing in
          front of it. Fewer cycles so each beat is wider and legible. */}
      <ECGLine
        className="pointer-events-none absolute inset-x-0 top-[68px] z-10 h-20 w-full text-mint/85"
        height={80}
        cycles={9}
        duration={5}
      />
    </section>
  );
}

/* ── Quick access strip ──────────────────────────────────── */

const QUICK = [
  { icon: CalendarPlus, title: "Book a clinic", text: "Twelve departments, real slots.", href: "/book" },
  { icon: HeartPulse, title: "Emergency", text: `Call ${BRAND.emergencyPhone} or walk in.`, href: "/contact" },
  { icon: Stethoscope, title: "Find a consultant", text: "By name, department or day.", href: "/doctors" },
  { icon: ShieldCheck, title: "Patient portal", text: "Results, letters, prescriptions.", href: "/login" },
];

function QuickAccess() {
  return (
    <section className="relative z-20 -mt-16">
      <div className="u-wrap">
        <RevealGroup className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" each={0.06}>
          {QUICK.map(({ icon: Icon, title, text, href }) => (
            <RevealItem key={title}>
              <Link href={href} asChild>
                <motion.a
                  className="group flex h-full items-start gap-4 rounded-3xl border border-white/70 bg-white/92
                             p-5 shadow-[0_20px_50px_-30px_rgba(11,63,117,0.7)] backdrop-blur-xl"
                  whileHover={{ y: -4 }}
                  transition={springy}
                >
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-brand-wash text-brand
                                   transition-colors duration-300 group-hover:bg-brand group-hover:text-white">
                    <Icon size={19} />
                  </span>
                  <span>
                    <span className="block text-[15px] font-semibold text-ink">{title}</span>
                    <span className="mt-0.5 block text-[13.5px] leading-snug text-ink-soft">{text}</span>
                  </span>
                  <ChevronRight
                    size={16}
                    className="ml-auto mt-3 shrink-0 text-ink-faint transition-transform duration-300 group-hover:translate-x-1 group-hover:text-brand"
                  />
                </motion.a>
              </Link>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}

/* ── Numbers ─────────────────────────────────────────────── */

function Numbers() {
  return (
    <section className="relative overflow-hidden bg-brand-deep py-24 text-white">
      <PulseRing size={620} color="rgba(255,255,255,0.16)" className="left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
      <div className="u-wrap relative z-10">
        <Reveal className="max-w-xl">
          <p className="text-[11.5px] font-semibold uppercase tracking-[0.16em] text-mint">By the numbers</p>
          <h2 className="mt-3 text-[clamp(26px,3.6vw,38px)] text-white">
            Measured, published, and checked every month
          </h2>
        </Reveal>

        <RevealGroup className="mt-14 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4" each={0.08}>
          {STATS.map((s) => (
            <RevealItem key={s.label}>
              <div className="border-t border-white/18 pt-5">
                <div className="font-display text-[clamp(38px,5vw,58px)] leading-none text-white">
                  <CountUp value={s.value} suffix={s.suffix} />
                </div>
                <div className="mt-3 text-[14.5px] font-medium text-white/85">{s.label}</div>
                <div className="mt-1 text-[13px] text-white/50">{s.hint}</div>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}

/* ── Journey ─────────────────────────────────────────────── */

function Journey() {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.8", "end 0.6"] });

  return (
    <section className="py-28">
      <div className="u-wrap">
        <SectionHead
          eyebrow="What to expect"
          title="A visit, start to finish"
          lead="Four steps. We publish them because knowing what happens next is most of what makes a hospital less frightening."
        />

        <div ref={ref} className="relative mt-14">
          {/* The rail fills as you scroll — progress you can see. */}
          <div className="absolute inset-y-0 left-[26px] hidden w-px bg-line md:block" aria-hidden>
            <motion.div
              className="h-full w-full origin-top bg-brand"
              style={{ scaleY: reduced ? 1 : scrollYProgress }}
            />
          </div>

          <RevealGroup className="space-y-3" each={0.1}>
            {JOURNEY.map((j) => (
              <RevealItem key={j.step}>
                <div className="relative flex gap-6 rounded-3xl border border-line bg-white p-6 md:pl-[74px]">
                  <span className="grid h-[53px] w-[53px] shrink-0 place-items-center rounded-2xl bg-brand
                                   font-display text-[17px] text-white md:absolute md:left-0 md:top-6">
                    {j.step}
                  </span>
                  <div>
                    <h3 className="font-display text-[21px] text-ink">{j.title}</h3>
                    <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-ink-soft">{j.text}</p>
                  </div>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </div>
    </section>
  );
}

/* ── Doctors preview ─────────────────────────────────────── */

function DoctorsPreview() {
  const featured = DOCTORS.slice(0, 4);
  return (
    <section className="bg-white py-28">
      <div className="u-wrap">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHead
            eyebrow="Your consultant"
            title="You'll know who you're seeing"
            lead="Follow-ups stay with the doctor who saw you first, unless you ask for someone else."
            className="max-w-xl"
          />
          <Reveal delay={0.1}>
            <ButtonLink href="/doctors" tone="outline" size="md">
              See all consultants <ArrowRight size={16} />
            </ButtonLink>
          </Reveal>
        </div>

        <RevealGroup className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4" each={0.07}>
          {featured.map((d) => (
            <RevealItem key={d.id}>
              <Link href={`/book?doctor=${d.id}`} asChild>
                <motion.a
                  className="group flex h-full flex-col rounded-3xl border border-line bg-surface p-6
                             transition-colors hover:border-brand/35"
                  whileHover={{ y: -5 }}
                  transition={springy}
                >
                  <Avatar initials={d.initials} accent={d.accent} size={58} />
                  <h3 className="mt-4 font-display text-[18.5px] leading-snug text-ink">{d.name}</h3>
                  <p className="mt-1 text-[13px] font-medium text-brand">{d.title}</p>
                  <p className="mt-3 text-[13.5px] leading-relaxed text-ink-soft">{d.focus}</p>
                  <div className="mt-auto flex flex-wrap gap-1.5 pt-5">
                    {d.days.map((day) => (
                      <span key={day} className="rounded-full bg-white px-2.5 py-1 text-[11.5px] font-medium text-ink-soft">
                        {day}
                      </span>
                    ))}
                  </div>
                </motion.a>
              </Link>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}

/* ── Voices ──────────────────────────────────────────────── */

function Voices() {
  return (
    <section className="u-aurora relative py-28">
      <div className="u-wrap relative z-10">
        <SectionHead eyebrow="In their words" title="What people tell us afterwards" align="center" />
        <RevealGroup className="mt-12 grid gap-4 md:grid-cols-3" each={0.08}>
          {TESTIMONIALS.map((t) => (
            <RevealItem key={t.name}>
              <figure className="flex h-full flex-col rounded-3xl border border-line bg-white p-7">
                <Quote size={26} className="text-brand/25" />
                <blockquote className="mt-4 flex-1 text-[15.5px] leading-[1.75] text-ink">
                  {t.quote}
                </blockquote>
                <figcaption className="mt-6 border-t border-line pt-4">
                  <span className="block text-[14px] font-semibold text-ink">{t.name}</span>
                  <span className="block text-[13px] text-ink-faint">{t.context}</span>
                </figcaption>
              </figure>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}

/* ── Two doors ───────────────────────────────────────────── */

function TwoDoors() {
  return (
    <section className="pb-8">
      <div className="u-wrap">
        <RevealGroup className="grid gap-4 lg:grid-cols-2" each={0.1}>
          <RevealItem>
            <div className="relative flex h-full flex-col overflow-hidden rounded-[32px] bg-brand p-9 text-white">
              <PulseRing size={340} color="rgba(255,255,255,0.2)" className="-right-16 -top-16" />
              <div className="relative z-10">
                <Pill tone="light">New patient</Pill>
                <h3 className="mt-5 font-display text-[clamp(26px,3.2vw,34px)] text-white">
                  Book without picking up the phone
                </h3>
                <p className="mt-3 max-w-sm text-[15px] leading-relaxed text-white/78">
                  Pick a department, a consultant and a time. You'll get a
                  confirmation immediately and a reminder the day before.
                </p>
                <ButtonLink href="/book" tone="light" size="lg" className="mt-8">
                  <CalendarPlus size={18} /> Start booking
                </ButtonLink>
              </div>
            </div>
          </RevealItem>

          <RevealItem>
            <div className="relative flex h-full flex-col overflow-hidden rounded-[32px] border border-line bg-white p-9">
              <div className="relative z-10">
                <Pill tone="mint">Returning</Pill>
                <h3 className="mt-5 font-display text-[clamp(26px,3.2vw,34px)] text-ink">
                  Everything from your last visit, waiting
                </h3>
                <p className="mt-3 max-w-sm text-[15px] leading-relaxed text-ink-soft">
                  Results, prescriptions, letters and your next appointment —
                  in one place, on any device.
                </p>
                <ButtonLink href="/login" tone="primary" size="lg" className="mt-8">
                  Sign in to the portal <ArrowRight size={17} />
                </ButtonLink>
              </div>
              <ECGLine
                className="pointer-events-none absolute inset-x-0 bottom-0 h-20 w-full text-brand/25"
                height={80} cycles={9} duration={5}
              />
            </div>
          </RevealItem>
        </RevealGroup>
      </div>
    </section>
  );
}

/* ── Page ────────────────────────────────────────────────── */

export default function Home() {
  return (
    <>
      <Hero />
      <QuickAccess />
      <DepartmentExplorer />
      <Numbers />
      <Journey />
      <DoctorsPreview />
      <Voices />
      <TwoDoors />
    </>
  );
}
