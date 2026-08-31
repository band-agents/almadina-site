/**
 * The hospital-specific motion: an ECG trace, a pulse ring, a breathing
 * cross, and a count-up.
 *
 * These are the pieces that make the site read as a hospital rather than a
 * generic corporate template, so they are built rather than borrowed — an
 * ECG that draws at a plausible rate says more than a stock illustration.
 *
 * All four are decorative: each is `aria-hidden` and each collapses to a
 * still state under `prefers-reduced-motion`. A vestibular-sensitive visitor
 * gets the same information with none of the movement.
 */

import { useEffect, useRef, useState } from "react";
import {
  motion, useInView, useMotionValue, useReducedMotion, useSpring, useTransform,
} from "framer-motion";

import { cx } from "./ui";

/* ── ECG trace ───────────────────────────────────────────── */

/**
 * A single cardiac cycle, drawn as an SVG path and swept by a travelling
 * dash. The shape is a real PQRST complex — flat baseline, small P bump,
 * the sharp QRS spike, then the rounded T wave — because a symmetric zigzag
 * reads as a mountain range, not a heartbeat.
 */
const ECG_CYCLE =
  "l 26 0 l 4 -5 l 5 10 l 4 -5 l 14 0 l 5 0 l 4 -34 l 6 62 l 5 -28 l 9 0 " +
  "l 7 -11 l 6 11 l 22 0";

/** Horizontal units one PQRST cycle advances. Sum of the l-command dx values. */
const CYCLE_WIDTH = 26 + 4 + 5 + 4 + 14 + 5 + 4 + 6 + 5 + 9 + 7 + 6 + 22;

function ecgPath(cycles: number, y: number): string {
  let d = `M 0 ${y}`;
  for (let i = 0; i < cycles; i++) d += ` ${ECG_CYCLE}`;
  return d;
}

export function ECGLine({
  className, stroke = "currentColor", height = 90,
  cycles = 9, strokeWidth = 2, duration = 4.2,
}: {
  className?: string; stroke?: string; height?: number;
  cycles?: number; strokeWidth?: number; duration?: number;
}) {
  const reduced = useReducedMotion();
  // The viewBox is derived from the path, not fixed: an earlier version used a
  // constant 1200-unit box and then drew however many cycles were asked for,
  // so anything above ~10 ran off the end and the trace was silently clipped.
  const width = cycles * CYCLE_WIDTH;
  const d = ecgPath(cycles, height / 2);

  return (
    <svg
      className={className}
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      preserveAspectRatio="none"
      aria-hidden
    >
      {/* The full trace, faint — so the line reads as continuous even
          between sweeps. */}
      <path d={d} stroke={stroke} strokeWidth={strokeWidth} opacity={0.22}
        strokeLinecap="round" strokeLinejoin="round" />

      {/* The sweep. pathLength normalises the dash maths so the same numbers
          work whatever the viewBox is. */}
      {!reduced && (
        <motion.path
          d={d}
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength={1}
          strokeDasharray="0.14 0.86"
          initial={{ strokeDashoffset: 1 }}
          animate={{ strokeDashoffset: -1 }}
          transition={{ duration, repeat: Infinity, ease: "linear" }}
        />
      )}
    </svg>
  );
}

/* ── Pulse ring ──────────────────────────────────────────── */

/** Concentric rings that expand and fade, at roughly a resting 72 bpm. */
export function PulseRing({
  size = 200, color = "var(--color-brand)", className, rings = 3,
}: {
  size?: number; color?: string; className?: string; rings?: number;
}) {
  const reduced = useReducedMotion();
  const beat = 60 / 72; // seconds per beat

  return (
    <span
      className={cx("pointer-events-none absolute grid place-items-center", className)}
      style={{ width: size, height: size }}
      aria-hidden
    >
      {Array.from({ length: rings }).map((_, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full border"
          style={{ width: size, height: size, borderColor: color }}
          initial={{ scale: 0.55, opacity: 0 }}
          animate={reduced
            ? { scale: 0.8, opacity: 0.18 }
            : { scale: [0.55, 1], opacity: [0.5, 0] }}
          transition={reduced ? undefined : {
            duration: beat * rings,
            repeat: Infinity,
            ease: "easeOut",
            delay: i * beat,
          }}
        />
      ))}
    </span>
  );
}

/* ── Breathing cross ─────────────────────────────────────── */

/**
 * The medical cross, scaled on a slow sine — the timing is a calm adult
 * breath (about 4.5s in and out), not a heartbeat, so it sits under fast
 * content without competing with it.
 */
export function BreathingCross({
  size = 28, className, color = "currentColor",
}: {
  size?: number; className?: string; color?: string;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.svg
      width={size} height={size} viewBox="0 0 24 24" fill="none"
      className={className} aria-hidden
      animate={reduced ? undefined : { scale: [1, 1.09, 1], opacity: [0.85, 1, 0.85] }}
      transition={reduced ? undefined : { duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
    >
      <path
        d="M9.5 3h5v6.5H21v5h-6.5V21h-5v-6.5H3v-5h6.5V3Z"
        fill={color}
      />
    </motion.svg>
  );
}

/* ── Count up ────────────────────────────────────────────── */

/**
 * Counts to `value` once the number scrolls into view.
 *
 * Uses a spring rather than a linear tween so the last few digits slow down,
 * which is what makes a counter feel like it is arriving somewhere rather
 * than just spinning. Under reduced motion it renders the final value
 * immediately — a spinning number is exactly the kind of motion that setting
 * is asking to be spared.
 */
export function CountUp({
  value, suffix = "", className, duration = 1.4,
}: {
  value: number; suffix?: string; className?: string; duration?: number;
}) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const seen = useInView(ref, { once: true, amount: 0.5 });
  const [display, setDisplay] = useState(reduced ? value : 0);

  const raw = useMotionValue(0);
  const spring = useSpring(raw, { stiffness: 70, damping: 20, mass: 0.8 });
  const rounded = useTransform(spring, (v) => Math.round(v));

  useEffect(() => {
    if (reduced) { setDisplay(value); return; }
    if (seen) raw.set(value);
  }, [seen, value, raw, reduced, duration]);

  useEffect(() => {
    if (reduced) return;
    return rounded.on("change", (v) => setDisplay(v as number));
  }, [rounded, reduced]);

  return (
    <span ref={ref} className={cx("u-tnum", className)}>
      {display}
      {suffix}
    </span>
  );
}

/* ── Floating icon field ─────────────────────────────────── */

/**
 * Small icons drifting behind a section. Positions are fixed (not random) so
 * the composition is the same on every load and can be judged once.
 */
export function FloatingField({
  items, className,
}: {
  items: Array<{ Icon: React.ComponentType<{ size?: number; className?: string }>; x: string; y: string; size?: number; delay?: number }>;
  className?: string;
}) {
  const reduced = useReducedMotion();
  return (
    <div className={cx("pointer-events-none absolute inset-0 overflow-hidden", className)} aria-hidden>
      {items.map(({ Icon, x, y, size = 22, delay = 0 }, i) => (
        <motion.span
          key={i}
          className="absolute text-brand/22"
          style={{ left: x, top: y }}
          animate={reduced ? undefined : { y: [0, -14, 0], rotate: [0, 4, 0] }}
          transition={reduced ? undefined : {
            duration: 7 + (i % 3) * 1.6, repeat: Infinity, ease: "easeInOut", delay,
          }}
        >
          <Icon size={size} />
        </motion.span>
      ))}
    </div>
  );
}
