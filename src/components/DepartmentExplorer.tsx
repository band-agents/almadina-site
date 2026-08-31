/**
 * Departments, as a two-pane explorer rather than a grid of twelve cards.
 *
 * The grid version was honest but expensive: twelve equal-weight tiles took
 * four rows and most of a screen to say "we have twelve departments", and
 * every one of them shouted at the same volume, so the eye had nowhere to
 * land. This trades that for a dense list you can scan in one glance and a
 * single detail panel that answers the question the list raises.
 *
 * Interaction notes:
 *   - It is a **listbox**, not a set of links. Selecting a department previews
 *     it; the panel's button is what navigates. That keeps an accidental
 *     arrow-key press from yanking you to another page.
 *   - Hover previews on a pointer, because on desktop the cheapest way to
 *     browse twelve things is to sweep a mouse down them. Hover never steals
 *     the selection from a keyboard user: it only updates on real pointer
 *     movement, and focus always wins.
 *   - Up/Down/Home/End move the selection, following the listbox pattern, so
 *     the whole section is usable without a mouse.
 *   - On mobile the two panes stack and the list becomes a horizontal chip
 *     rail — twelve rows of list above a panel would push the panel off
 *     screen, which defeats the point.
 */

import { useRef, useState, type KeyboardEvent } from "react";
import { Link } from "wouter";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Clock } from "lucide-react";

import { DEPARTMENTS } from "@/data/hospital";
import { soft, springy } from "@/lib/motion";
import { Pill, Reveal, cx } from "./ui";

export function DepartmentExplorer() {
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);
  const active = DEPARTMENTS[index];
  const ActiveIcon = active.icon;

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const last = DEPARTMENTS.length - 1;
    let next: number | null = null;
    if (e.key === "ArrowDown" || e.key === "ArrowRight") next = index === last ? 0 : index + 1;
    if (e.key === "ArrowUp" || e.key === "ArrowLeft") next = index === 0 ? last : index - 1;
    if (e.key === "Home") next = 0;
    if (e.key === "End") next = last;
    if (next === null) return;
    e.preventDefault();
    setIndex(next);
    // Keep the newly selected row in view on the mobile rail.
    listRef.current
      ?.querySelectorAll<HTMLElement>('[role="option"]')[next]
      ?.scrollIntoView({ block: "nearest", inline: "nearest", behavior: reduced ? "auto" : "smooth" });
  }

  return (
    <section className="u-aurora relative py-24">
      <div className="u-wrap relative z-10">
        <Reveal className="max-w-2xl">
          <p className="u-eyebrow mb-3">Departments</p>
          <h2 className="text-[clamp(28px,4.2vw,44px)]">Twelve specialties, one building</h2>
          <p className="mt-4 text-[16.5px] leading-[1.75] text-ink-soft">
            No shuttling between sites for a scan and then a consultation.
            Imaging, laboratory and theatres share a campus with the clinics.
          </p>
        </Reveal>

        <Reveal delay={0.08} className="mt-10">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,340px)_1fr] lg:gap-5">
            {/* ── The list ── */}
            <div
              ref={listRef}
              role="listbox"
              aria-label="Departments"
              aria-activedescendant={`dept-${active.id}`}
              tabIndex={0}
              onKeyDown={onKeyDown}
              className={cx(
                "rounded-3xl border border-line bg-white p-1.5",
                "focus:outline-none focus-visible:ring-4 focus-visible:ring-brand/15",
                // Mobile: a horizontal rail. Desktop: a vertical list.
                "flex gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
                "lg:block lg:overflow-visible",
              )}
            >
              {DEPARTMENTS.map((d, i) => {
                const selected = i === index;
                const Icon = d.icon;
                return (
                  <button
                    key={d.id}
                    id={`dept-${d.id}`}
                    role="option"
                    aria-selected={selected}
                    tabIndex={-1}
                    onClick={() => setIndex(i)}
                    onPointerEnter={(e) => { if (e.pointerType === "mouse") setIndex(i); }}
                    className={cx(
                      "relative flex shrink-0 items-center gap-2.5 rounded-2xl px-3 py-2.5 text-left transition-colors",
                      "lg:w-full lg:gap-3 lg:px-3.5",
                      selected ? "text-white" : "text-ink-soft hover:text-ink",
                    )}
                  >
                    {selected && (
                      <motion.span
                        layoutId="dept-marker"
                        className="absolute inset-0 rounded-2xl bg-brand"
                        transition={reduced ? { duration: 0 } : springy}
                      />
                    )}
                    <span className="relative z-10 flex items-center gap-2.5 lg:gap-3">
                      <Icon size={17} className={selected ? "text-white" : "text-brand"} />
                      <span className="whitespace-nowrap text-[14px] font-medium lg:whitespace-normal">
                        {d.name}
                      </span>
                      {d.alwaysOpen && (
                        <span
                          className={cx(
                            "hidden h-1.5 w-1.5 shrink-0 rounded-full lg:block",
                            selected ? "bg-white/70" : "bg-mint",
                          )}
                          title="Open 24 hours"
                        />
                      )}
                    </span>
                    <span className="relative z-10 ml-auto hidden lg:block">
                      <ArrowRight
                        size={14}
                        className={cx("transition-opacity", selected ? "opacity-70" : "opacity-0")}
                      />
                    </span>
                  </button>
                );
              })}
            </div>

            {/* ── The panel ── */}
            <div className="relative overflow-hidden rounded-3xl border border-line bg-white">
              {/* Keyed, so the content swaps synchronously and animates in.
                  Nothing here is gated on an exit animation finishing. */}
              <motion.div
                key={active.id}
                initial={reduced ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={soft(0.4)}
                className="flex h-full flex-col p-7 sm:p-9"
              >
                <div className="flex items-start justify-between gap-4">
                  <span className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-wash text-brand">
                    <ActiveIcon size={24} />
                  </span>
                  {active.alwaysOpen ? (
                    <Pill tone="mint"><Clock size={11} /> Open 24 hours</Pill>
                  ) : (
                    <Pill tone="muted">Sat–Thu, 9:00–21:00</Pill>
                  )}
                </div>

                <h3 className="mt-6 font-display text-[clamp(24px,3vw,32px)] leading-tight">
                  {active.name}
                </h3>
                <p className="mt-1 text-[15px] text-ink-faint" dir="rtl">{active.nameAr}</p>

                <p className="mt-4 max-w-xl text-[16px] leading-[1.8] text-ink-soft">
                  {active.blurb}
                </p>

                <div className="mt-auto flex flex-wrap items-center gap-3 pt-8">
                  <Link href={`/book?department=${active.id}`} asChild>
                    <motion.a
                      className="inline-flex h-12 items-center gap-2 rounded-full bg-brand px-6 text-[14.5px]
                                 font-semibold text-white transition-colors hover:bg-brand-deep"
                      whileHover={reduced ? undefined : { y: -2 }}
                      whileTap={reduced ? undefined : { scale: 0.98 }}
                      transition={springy}
                    >
                      Book {active.name} <ArrowRight size={16} />
                    </motion.a>
                  </Link>

                  <span className="u-tnum text-[13px] text-ink-faint">
                    {String(index + 1).padStart(2, "0")} / {DEPARTMENTS.length}
                  </span>
                </div>
              </motion.div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
