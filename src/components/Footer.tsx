/**
 * Site footer. Carries the two things a hospital footer must always carry —
 * the emergency number and the address — above everything else.
 */

import { Link } from "wouter";
import { Clock, Mail, MapPin, Phone } from "lucide-react";

import { BRAND } from "@/lib/brand";
import { DEPARTMENTS } from "@/data/hospital";
import { Reveal } from "./ui";
import { BreathingCross, ECGLine } from "./vitals";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-24 overflow-hidden bg-brand-deep text-white/75">
      {/* A last heartbeat across the seam between page and footer. */}
      <ECGLine
        className="absolute inset-x-0 top-0 h-14 w-full text-white/25"
        height={60}
        cycles={12}
        duration={6}
      />

      <div className="u-wrap relative z-10 pt-24 pb-10">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          {/* Identity */}
          <Reveal>
            <div className="flex items-center gap-2.5">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/15 text-white">
                <BreathingCross size={19} />
              </span>
              <span className="leading-tight">
                <span className="block font-display text-[18px] text-white">{BRAND.name}</span>
                <span className="block text-[13px] text-white/55" dir="rtl">{BRAND.nameAr}</span>
              </span>
            </div>
            <p className="mt-5 max-w-xs text-[14px] leading-relaxed text-white/60">
              {BRAND.tagline}. A general hospital in Nasr City, open to everyone,
              every hour of the year.
            </p>
          </Reveal>

          {/* Departments — first six, the rest live on the homepage */}
          <Reveal delay={0.05}>
            <h3 className="text-[12px] font-semibold uppercase tracking-[0.14em] text-white/45">
              Departments
            </h3>
            <ul className="mt-4 space-y-2.5">
              {DEPARTMENTS.slice(0, 6).map((d) => (
                <li key={d.id}>
                  <Link href={`/book?department=${d.id}`} asChild>
                    <a className="text-[14px] text-white/70 transition-colors hover:text-white">
                      {d.name}
                    </a>
                  </Link>
                </li>
              ))}
            </ul>
          </Reveal>

          {/* Site */}
          <Reveal delay={0.1}>
            <h3 className="text-[12px] font-semibold uppercase tracking-[0.14em] text-white/45">
              Hospital
            </h3>
            <ul className="mt-4 space-y-2.5">
              {[
                { href: "/about", label: "About us" },
                { href: "/doctors", label: "Find a doctor" },
                { href: "/staff", label: "Leadership" },
                { href: "/contact", label: "Contact & directions" },
                { href: "/book", label: "Book an appointment" },
                { href: "/login", label: "Patient portal" },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} asChild>
                    <a className="text-[14px] text-white/70 transition-colors hover:text-white">
                      {l.label}
                    </a>
                  </Link>
                </li>
              ))}
            </ul>
          </Reveal>

          {/* Contact */}
          <Reveal delay={0.15}>
            <h3 className="text-[12px] font-semibold uppercase tracking-[0.14em] text-white/45">
              Reach us
            </h3>
            <ul className="mt-4 space-y-4 text-[14px]">
              <li className="flex items-start gap-3">
                <Phone size={15} className="mt-1 shrink-0 text-coral" />
                <span>
                  <a href={`tel:${BRAND.emergencyPhone}`} className="font-semibold text-white hover:underline">
                    Emergency {BRAND.emergencyPhone}
                  </a>
                  <span className="block text-white/55 u-tnum">
                    Switchboard {BRAND.phone}
                  </span>
                </span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin size={15} className="mt-1 shrink-0 text-white/45" />
                <span className="text-white/70">{BRAND.address}</span>
              </li>
              <li className="flex items-start gap-3">
                <Mail size={15} className="mt-1 shrink-0 text-white/45" />
                <a href={`mailto:${BRAND.email}`} className="text-white/70 hover:text-white">
                  {BRAND.email}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Clock size={15} className="mt-1 shrink-0 text-white/45" />
                <span className="text-white/70">
                  {BRAND.hours.clinics}
                  <span className="block text-white/45">Emergency never closes</span>
                </span>
              </li>
            </ul>
          </Reveal>
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-white/12 pt-7 sm:flex-row">
          <p className="text-[12.5px] text-white/45">
            © {year} {BRAND.name}. All rights reserved.
          </p>
          <p className="text-[12.5px] text-white/45">
            In an emergency, call{" "}
            <a href={`tel:${BRAND.emergencyPhone}`} className="font-semibold text-white/75 hover:text-white">
              {BRAND.emergencyPhone}
            </a>{" "}
            or come straight to the department.
          </p>
        </div>
      </div>
    </footer>
  );
}
