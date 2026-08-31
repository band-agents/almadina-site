/**
 * Site header.
 *
 * Transparent over the hero, then solidifies on scroll — the hero is dark and
 * the rest of the site is light, so a fixed-colour bar would be unreadable on
 * one of them. The switch is driven by scroll position, not by which route is
 * open, so it stays correct on pages that have no hero.
 */

import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { AnimatePresence, motion, useReducedMotion, useScroll, useMotionValueEvent } from "framer-motion";
import { CalendarPlus, Menu, Phone, X } from "lucide-react";

import { BRAND } from "@/lib/brand";
import { springy, soft } from "@/lib/motion";
import { ButtonLink, cx } from "./ui";
import { BreathingCross } from "./vitals";

const LINKS = [
  { href: "/about", label: "About" },
  { href: "/doctors", label: "Doctors" },
  { href: "/staff", label: "Leadership" },
  { href: "/contact", label: "Contact" },
];

export function Logo({ onDark }: { onDark: boolean }) {
  return (
    <Link href="/" asChild>
      <a className="group flex items-center gap-2.5" aria-label={`${BRAND.name} — home`}>
        <span className={cx(
          "grid h-9 w-9 place-items-center rounded-xl transition-colors duration-300",
          onDark ? "bg-white/15 text-white" : "bg-brand text-white",
        )}>
          <BreathingCross size={17} />
        </span>
        <span className="leading-tight">
          <span className={cx(
            "block font-display text-[16.5px] font-600 tracking-tight transition-colors duration-300",
            onDark ? "text-white" : "text-ink",
          )}>
            {BRAND.shortName}
          </span>
          <span className={cx(
            "block text-[10.5px] font-medium tracking-[0.14em] uppercase transition-colors duration-300",
            onDark ? "text-white/60" : "text-ink-faint",
          )}>
            Hospital
          </span>
        </span>
      </a>
    </Link>
  );
}

export function Nav() {
  const [location] = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const reduced = useReducedMotion();
  const { scrollY } = useScroll();

  // The homepage is the only route with a dark hero behind the bar.
  const overHero = location === "/" && !scrolled;

  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 40));

  // Close the drawer on navigation, and stop the page scrolling behind it.
  useEffect(() => { setOpen(false); }, [location]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      {/* Deliberately NOT animated in. An earlier version slid the bar down
          from y:-70 on mount; when that tween was interrupted — a background
          tab throttling rAF, a slow first paint — it stranded the header
          off-screen and the site simply had no navigation. The header is the
          one element that must be present unconditionally, so its resting
          position is plain CSS and nothing can leave it elsewhere. */}
      <header
        className={cx(
          "fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow,backdrop-filter] duration-300",
          scrolled
            ? "bg-white/85 backdrop-blur-xl shadow-[0_1px_0_rgba(0,0,0,0.06),0_8px_30px_-18px_rgba(11,63,117,0.4)]"
            : "bg-transparent",
        )}
      >
        <div className="u-wrap flex h-[68px] items-center justify-between gap-6">
          <Logo onDark={overHero} />

          <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
            {LINKS.map((l) => {
              const active = location === l.href;
              return (
                <Link key={l.href} href={l.href} asChild>
                  <a className={cx(
                    "relative rounded-full px-4 py-2 text-[14px] font-medium transition-colors duration-200",
                    overHero
                      ? "text-white/80 hover:text-white"
                      : active ? "text-brand" : "text-ink-soft hover:text-brand",
                  )}>
                    {l.label}
                    {active && (
                      <motion.span
                        layoutId="nav-active"
                        className={cx(
                          "absolute inset-x-3 -bottom-0.5 h-[2px] rounded-full",
                          overHero ? "bg-white" : "bg-brand",
                        )}
                        transition={springy}
                      />
                    )}
                  </a>
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <a
              href={`tel:${BRAND.emergencyPhone}`}
              className={cx(
                "hidden items-center gap-2 rounded-full px-3 py-2 text-[13px] font-semibold",
                "transition-colors duration-200 lg:inline-flex",
                overHero ? "text-white/80 hover:text-white" : "text-coral hover:bg-coral-wash",
              )}
            >
              <Phone size={14} /> Emergency {BRAND.emergencyPhone}
            </a>

            {/* Wrapped rather than given `hidden sm:inline-flex` directly:
                ButtonLink's base class already sets `inline-flex`, and two
                display utilities on one element is a cascade-order coin toss.
                It landed on inline-flex, so Sign in never hid and the header
                row overflowed a 375px viewport by 31px. */}
            <span className="hidden sm:block">
              <ButtonLink href="/login" tone={overHero ? "light" : "outline"} size="sm">
                Sign in
              </ButtonLink>
            </span>

            <ButtonLink href="/book" tone="primary" size="sm">
              <CalendarPlus size={15} />
              {/* `xs` is not a Tailwind breakpoint, so the previous
                  `hidden xs:inline` hid this label at every width. */}
              <span className="hidden sm:inline">Book</span>
            </ButtonLink>

            <button
              onClick={() => setOpen(true)}
              aria-label="Open menu"
              className={cx(
                "grid h-10 w-10 place-items-center rounded-full transition-colors md:hidden",
                overHero ? "text-white hover:bg-white/12" : "text-ink hover:bg-black/5",
              )}
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile drawer ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[60] md:hidden"
            initial="hidden" animate="shown" exit="hidden"
          >
            <motion.button
              aria-label="Close menu"
              onClick={() => setOpen(false)}
              className="absolute inset-0 bg-ink/45 backdrop-blur-sm"
              variants={{ hidden: { opacity: 0 }, shown: { opacity: 1 } }}
              transition={soft(0.3)}
            />
            <motion.div
              className="absolute inset-y-0 right-0 flex w-[86%] max-w-sm flex-col bg-white p-6 shadow-2xl"
              variants={{ hidden: { x: "100%" }, shown: { x: 0 } }}
              transition={reduced ? { duration: 0.001 } : { type: "spring", stiffness: 320, damping: 36 }}
            >
              <div className="flex items-center justify-between">
                <Logo onDark={false} />
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Close menu"
                  className="grid h-10 w-10 place-items-center rounded-full text-ink-soft hover:bg-black/5"
                >
                  <X size={20} />
                </button>
              </div>

              <nav className="mt-8 flex flex-col gap-1" aria-label="Mobile">
                {[{ href: "/", label: "Home" }, ...LINKS].map((l, i) => (
                  <motion.div
                    key={l.href}
                    initial={reduced ? false : { opacity: 0, x: 18 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={soft(0.45, 0.06 + i * 0.05)}
                  >
                    <Link href={l.href} asChild>
                      <a className={cx(
                        "block rounded-2xl px-4 py-3.5 text-[17px] font-medium transition-colors",
                        location === l.href ? "bg-brand-wash text-brand" : "text-ink hover:bg-black/[0.04]",
                      )}>
                        {l.label}
                      </a>
                    </Link>
                  </motion.div>
                ))}
              </nav>

              <div className="mt-auto flex flex-col gap-2.5 pt-6">
                <ButtonLink href="/book" tone="primary" size="lg" className="w-full">
                  <CalendarPlus size={17} /> Book an appointment
                </ButtonLink>
                <ButtonLink href="/login" tone="outline" size="lg" className="w-full">
                  Sign in
                </ButtonLink>
                <a
                  href={`tel:${BRAND.emergencyPhone}`}
                  className="mt-2 flex items-center justify-center gap-2 rounded-full bg-coral-wash
                             py-3 text-[14px] font-semibold text-coral"
                >
                  <Phone size={15} /> Emergency — {BRAND.emergencyPhone}
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
