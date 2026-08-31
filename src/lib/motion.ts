/**
 * Shared motion vocabulary.
 *
 * Three rules the whole site obeys:
 *
 *  1. One easing family. `soft` is the site's signature curve — a fast start
 *     that settles rather than bounces. Springs are reserved for things the
 *     user directly caused (a step advancing, a card lifting under a cursor),
 *     because a spring on ambient motion reads as nervous.
 *
 *  2. Motion never gates content. Every reveal variant animates from
 *     `opacity: 0` but the element is in the DOM and laid out from the start,
 *     so a failed animation leaves readable text, not a blank page.
 *
 *  3. Reduced motion is honoured at the source. `useReducedMotion()` from
 *     Framer feeds `revealProps`, so a single hook call disables travel
 *     everywhere instead of each component remembering to check.
 */

import type { Transition, Variants } from "framer-motion";

export const EASE_SOFT = [0.16, 1, 0.3, 1] as const;
export const EASE_IN_OUT = [0.65, 0, 0.35, 1] as const;

export const soft = (duration = 0.7, delay = 0): Transition => ({
  duration,
  delay,
  ease: EASE_SOFT,
});

/** For anything the user just did: a step change, a toggle, a lift. */
export const springy: Transition = { type: "spring", stiffness: 380, damping: 32, mass: 0.9 };
export const springySlow: Transition = { type: "spring", stiffness: 180, damping: 26 };

/* ── Reveals ─────────────────────────────────────────────── */

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: soft() },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: soft(0.9) },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  show: { opacity: 1, scale: 1, transition: soft(0.8) },
};

/** Parent that walks its children in. Pair with `fadeUp` on each child. */
export const stagger = (each = 0.08, delayChildren = 0.05): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: each, delayChildren } },
});

/** Headline words, revealed one at a time from behind a mask. */
export const wordUp: Variants = {
  hidden: { y: "115%" },
  show: { y: "0%", transition: { duration: 0.85, ease: EASE_SOFT } },
};

/* ── Reduced motion ──────────────────────────────────────── */

/**
 * Collapses a reveal to a plain fade when the visitor asks for less motion.
 * Content still appears; it simply stops travelling.
 */
export function reveal(reduced: boolean | null): Variants {
  return reduced ? fadeIn : fadeUp;
}

/**
 * Standard `whileInView` props. `amount: 0.25` fires when a quarter of the
 * element is on screen, which for tall cards means the reveal has finished by
 * the time the reader's eye arrives. `once` keeps a long page from
 * re-animating on every scroll back up, which is the single most common way
 * scroll motion turns irritating.
 */
export const inView = {
  initial: "hidden",
  whileInView: "show",
  viewport: { once: true, amount: 0.25 },
} as const;
