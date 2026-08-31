/**
 * Al-Madinah Hospital — identity for the public site.
 *
 * Mirrors the shape of the HIS's own `platform/lib/brand.ts` on purpose. The
 * two codebases are separate deployments, so this is a deliberate copy rather
 * than a shared import — but the values must not drift, and the name has
 * already changed three times (Pulse → Al-Obour → Al-Madinah). Change it here
 * and in the HIS together, never in a component.
 */

export const BRAND = {
  name: "Al-Madinah Hospital",
  nameAr: "مستشفى المدينة",
  shortName: "Al-Madinah",
  shortNameAr: "المدينة",

  tagline: "Care, close to home",
  taglineAr: "رعاية قريبة منك",

  /** Where the hospital information system lives. Every sign-in leaves here. */
  hisUrl: import.meta.env.VITE_HIS_URL ?? "http://localhost:5173",

  phone: "+20 2 2405 9000",
  emergencyPhone: "123",
  email: "hello@almadinah-hospital.com",
  address: "Al-Nasr Road, Nasr City, Cairo, Egypt",
  addressAr: "طريق النصر، مدينة نصر، القاهرة",

  hours: {
    emergency: "Open 24 hours, every day",
    clinics: "Saturday – Thursday, 9:00 – 21:00",
    pharmacy: "Open 24 hours",
  },
} as const;

/**
 * Deep links into the HIS. The website never authenticates anyone itself: it
 * hands off to the system, which owns sessions, roles and the audit trail.
 * `persona` is passed through so the HIS can land the user in the right
 * workspace once it supports /portal and /clinic.
 */
export function signInUrl(persona: "patient" | "clinician" | "staff"): string {
  const base = BRAND.hisUrl.replace(/\/$/, "");
  return `${base}/auth?persona=${persona}`;
}
