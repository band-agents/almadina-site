/**
 * Find a doctor.
 *
 * A filter list, not a directory dump. Search and department filter are both
 * client-side because the whole consultant body fits in one payload — a
 * network round trip per keystroke would be slower and worse.
 *
 * The result count is announced politely to screen readers so filtering is
 * not a silent change.
 */

import { useMemo, useState } from "react";
import { Link } from "wouter";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { CalendarPlus, Globe, Search, SlidersHorizontal, X } from "lucide-react";

import { DEPARTMENTS, DOCTORS, departmentById } from "@/data/hospital";
import { soft, springy } from "@/lib/motion";
import { Avatar, ButtonLink, Pill, Reveal, cx } from "@/components/ui";
import { FloatingField } from "@/components/vitals";
import { HeartPulse, Stethoscope } from "lucide-react";

export default function Doctors() {
  const reduced = useReducedMotion();
  const [query, setQuery] = useState("");
  const [dept, setDept] = useState<string>("all");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return DOCTORS.filter((d) => {
      if (dept !== "all" && d.departmentId !== dept) return false;
      if (!q) return true;
      const dep = departmentById(d.departmentId);
      return [d.name, d.title, d.focus, dep?.name ?? "", d.languages.join(" ")]
        .join(" ").toLowerCase().includes(q);
    });
  }, [query, dept]);

  // Only offer departments that actually have a consultant listed.
  const usedDepartments = useMemo(
    () => DEPARTMENTS.filter((d) => DOCTORS.some((doc) => doc.departmentId === d.id)),
    [],
  );

  return (
    <main className="relative overflow-hidden pt-28 pb-24">
      <FloatingField
        items={[
          { Icon: Stethoscope, x: "4%", y: "12%", size: 24 },
          { Icon: HeartPulse, x: "92%", y: "18%", size: 22, delay: 1.4 },
        ]}
      />

      <div className="u-wrap relative z-10">
        <header className="max-w-2xl">
          {/* The real length of the list, not the 42-strong consultant body:
              a pill claiming 42 directly above ten cards reads as broken. */}
          <Pill tone="brand">{DOCTORS.length} bookable online</Pill>
          <h1 className="mt-4 text-[clamp(34px,5.2vw,52px)]">Find a doctor</h1>
          <p className="mt-4 text-[16.5px] leading-relaxed text-ink-soft">
            Search by name, specialty or the condition you're worried about.
            These consultants take online bookings; for the rest of our 42-strong
            consultant body, call the appointments line.
          </p>
        </header>

        {/* ── Controls ── */}
        <div className="sticky top-[68px] z-30 -mx-2 mt-10 rounded-3xl bg-surface/85 px-2 py-3 backdrop-blur-xl">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-faint" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Try “heart”, “knee”, or a doctor's name"
                aria-label="Search consultants"
                className="h-13 w-full rounded-2xl border border-line bg-white pl-11 pr-11 py-3.5 text-[15px]
                           placeholder:text-ink-faint focus:border-brand/50 focus:outline-none focus:ring-4 focus:ring-brand/12"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center
                             rounded-full text-ink-faint hover:bg-black/5 hover:text-ink"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <SlidersHorizontal size={15} className="shrink-0 text-ink-faint" />
              {[{ id: "all", name: "All" }, ...usedDepartments].map((d) => {
                const on = dept === d.id;
                return (
                  <button
                    key={d.id}
                    onClick={() => setDept(d.id)}
                    aria-pressed={on}
                    className={cx(
                      "relative shrink-0 rounded-full px-4 py-2 text-[13.5px] font-medium transition-colors",
                      on ? "text-white" : "text-ink-soft hover:text-ink",
                    )}
                  >
                    {on && (
                      <motion.span layoutId="dept-pill" className="absolute inset-0 rounded-full bg-brand"
                        transition={springy} />
                    )}
                    <span className="relative z-10">{d.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <p className="mt-5 text-[13.5px] text-ink-faint" role="status" aria-live="polite">
          {results.length} consultant{results.length === 1 ? "" : "s"}
          {dept !== "all" && ` in ${departmentById(dept)?.name}`}
          {query && ` matching “${query}”`}
        </p>

        {/* ── Results ── */}
        <motion.ul layout className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {results.map((d) => {
              const dep = departmentById(d.departmentId);
              return (
                <motion.li
                  key={d.id}
                  layout={!reduced}
                  initial={reduced ? false : { opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
                  transition={soft(0.35)}
                >
                  <motion.div
                    className="group flex h-full flex-col rounded-3xl border border-line bg-white p-6
                               transition-colors hover:border-brand/35"
                    whileHover={reduced ? undefined : { y: -4 }}
                    transition={springy}
                  >
                    <div className="flex items-start gap-4">
                      <Avatar initials={d.initials} accent={d.accent} size={60} />
                      <div className="min-w-0">
                        <h2 className="font-display text-[19px] leading-snug text-ink">{d.name}</h2>
                        <p className="text-[13px] text-ink-faint" dir="rtl">{d.nameAr}</p>
                        <p className="mt-1.5 text-[13px] font-medium text-brand">{d.title}</p>
                      </div>
                    </div>

                    <p className="mt-4 text-[14px] leading-relaxed text-ink-soft">{d.focus}</p>

                    <dl className="mt-5 space-y-2 text-[13px]">
                      <div className="flex gap-2">
                        <dt className="w-20 shrink-0 text-ink-faint">Department</dt>
                        <dd className="font-medium text-ink">{dep?.name}</dd>
                      </div>
                      <div className="flex gap-2">
                        <dt className="w-20 shrink-0 text-ink-faint">Clinics</dt>
                        <dd className="font-medium text-ink">{d.days.join(" · ")}</dd>
                      </div>
                      <div className="flex gap-2">
                        <dt className="w-20 shrink-0 text-ink-faint">Practising</dt>
                        <dd className="u-tnum font-medium text-ink">since {d.since}</dd>
                      </div>
                    </dl>

                    <div className="mt-4 flex flex-wrap items-center gap-1.5">
                      <Globe size={13} className="text-ink-faint" />
                      {d.languages.map((l) => (
                        <span key={l} className="rounded-full bg-surface px-2.5 py-0.5 text-[11.5px] font-medium text-ink-soft">
                          {l}
                        </span>
                      ))}
                    </div>

                    <div className="mt-auto pt-6">
                      <Link href={`/book?doctor=${d.id}`} asChild>
                        <motion.a
                          className="flex w-full items-center justify-center gap-2 rounded-full border border-brand/25
                                     py-3 text-[14px] font-semibold text-brand transition-colors
                                     group-hover:bg-brand group-hover:text-white group-hover:border-brand"
                          whileTap={reduced ? undefined : { scale: 0.98 }}
                        >
                          <CalendarPlus size={16} /> Book with {d.name.split(" ")[1]}
                        </motion.a>
                      </Link>
                    </div>
                  </motion.div>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </motion.ul>

        {results.length === 0 && (
          <Reveal className="mt-10 rounded-3xl border border-dashed border-line bg-white p-12 text-center">
            <h2 className="font-display text-[22px]">No one matches that yet</h2>
            <p className="mx-auto mt-2 max-w-md text-[15px] text-ink-soft">
              Try a broader term, or clear the filters. If you're not sure which
              specialty you need, book General Surgery and we'll redirect you at
              no charge.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button
                onClick={() => { setQuery(""); setDept("all"); }}
                className="rounded-full border border-brand/25 px-5 py-2.5 text-[14px] font-semibold text-brand hover:bg-brand-wash"
              >
                Clear filters
              </button>
              <ButtonLink href="/book" tone="primary" size="md">Book anyway</ButtonLink>
            </div>
          </Reveal>
        )}
      </div>
    </main>
  );
}
