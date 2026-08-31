/**
 * The hero video, as a Remotion composition.
 *
 * This renders to `public/media/hero.mp4` and plays muted and looping behind
 * the homepage headline. It is a composition rather than a stock clip for
 * three reasons: it is exactly the brand blue, it loops seamlessly because
 * the last frame is built to equal the first, and it stays editable in code
 * rather than needing a video editor.
 *
 * Everything here is a pure function of `frame`. No randomness, no Date.now,
 * nothing that would make two renders differ or a frame fail to reproduce.
 *
 * Design constraints, deliberately:
 *   - Nothing moves fast. It sits behind text that people are trying to read.
 *   - No type in the video. An earlier cut animated department names through
 *     the centre; they landed directly behind the H1 and both became hard to
 *     read. A background video carries mood, the page carries words.
 *   - Contrast stays low. The headline over it is white; the video must not
 *     compete for that range.
 */

import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";

export const HERO_FPS = 30;
export const HERO_DURATION = 300; // 10s
export const HERO_WIDTH = 1920;
export const HERO_HEIGHT = 1080;

const BRAND_DEEP = "#0a3560";
const BRAND = "#0d4d8c";
const MINT = "#27a08a";

/* ── Background ──────────────────────────────────────────── */

/** Slow-drifting aurora. Two blobs on different periods so the combination
    never visibly repeats inside the loop. */
function Aurora() {
  const frame = useCurrentFrame();
  const t = (frame / HERO_DURATION) * Math.PI * 2;

  const blob = (phase: number, radius: number, color: string, opacity: number) => ({
    position: "absolute" as const,
    width: radius,
    height: radius,
    borderRadius: "50%",
    background: `radial-gradient(circle, ${color} 0%, transparent 68%)`,
    filter: "blur(90px)",
    opacity,
    left: `${50 + Math.cos(t + phase) * 22}%`,
    top: `${50 + Math.sin(t * 0.8 + phase) * 26}%`,
    transform: "translate(-50%, -50%)",
  });

  return (
    <AbsoluteFill style={{ background: `linear-gradient(150deg, ${BRAND_DEEP} 0%, #06284a 55%, ${BRAND_DEEP} 100%)` }}>
      <AbsoluteFill style={blob(0, 1100, BRAND, 0.55)} />
      <AbsoluteFill style={blob(2.1, 900, MINT, 0.3)} />
      <AbsoluteFill style={blob(4.2, 800, "#1d6fb8", 0.35)} />
    </AbsoluteFill>
  );
}

/** A faint grid, drifting one cell over the loop so it reads as depth. */
function Grid() {
  const frame = useCurrentFrame();
  const shift = (frame / HERO_DURATION) * 80;
  return (
    <AbsoluteFill
      style={{
        backgroundImage:
          "linear-gradient(to right, rgba(255,255,255,0.055) 1px, transparent 1px)," +
          "linear-gradient(to bottom, rgba(255,255,255,0.055) 1px, transparent 1px)",
        backgroundSize: "80px 80px",
        backgroundPosition: `${shift}px ${shift}px`,
        maskImage: "radial-gradient(ellipse 75% 65% at 50% 45%, black 30%, transparent 100%)",
        WebkitMaskImage: "radial-gradient(ellipse 75% 65% at 50% 45%, black 30%, transparent 100%)",
      }}
    />
  );
}

/* ── ECG sweep ───────────────────────────────────────────── */

const CYCLE = "l 26 0 l 4 -5 l 5 10 l 4 -5 l 14 0 l 5 0 l 4 -34 l 6 62 l 5 -28 l 9 0 l 7 -11 l 6 11 l 22 0";

function ecgPath(cycles: number, width: number, y: number) {
  let d = `M 0 ${y}`;
  for (let i = 0; i < cycles; i++) d += ` ${CYCLE}`;
  return `${d} L ${width} ${y}`;
}

/**
 * The trace sweeps exactly twice across the composition, so frame 0 and the
 * final frame land on the same dash offset and the loop has no seam.
 */
function ECG() {
  const frame = useCurrentFrame();
  const d = ecgPath(16, HERO_WIDTH, 90);
  const offset = interpolate(frame, [0, HERO_DURATION], [1, -1]);

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <svg
        width={HERO_WIDTH}
        height={180}
        viewBox={`0 0 ${HERO_WIDTH} 180`}
        style={{ position: "absolute", bottom: 120, opacity: 0.5 }}
      >
        <path d={d} stroke="rgba(255,255,255,0.16)" strokeWidth={3} fill="none"
          strokeLinecap="round" strokeLinejoin="round" />
        <path
          d={d}
          stroke="rgba(160,229,214,0.95)"
          strokeWidth={3.5}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength={1}
          strokeDasharray="0.1 0.9"
          strokeDashoffset={offset}
        />
      </svg>
    </AbsoluteFill>
  );
}

/* ── Pulse rings ─────────────────────────────────────────── */

function Rings() {
  const frame = useCurrentFrame();
  const beat = HERO_FPS * (60 / 72); // 72 bpm

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      {[0, 1, 2].map((i) => {
        const local = (frame + i * beat) % (beat * 3);
        const p = local / (beat * 3);
        const size = interpolate(p, [0, 1], [300, 1150]);
        const opacity = interpolate(p, [0, 0.15, 1], [0, 0.34, 0]);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              width: size,
              height: size,
              borderRadius: "50%",
              border: "2px solid rgba(255,255,255,0.5)",
              opacity,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
}

/* ── Vignette ────────────────────────────────────────────── */

/** Darkens the edges so white headline text sits cleanly on top of the video
    wherever the aurora happens to be at that moment. */
function Vignette() {
  return (
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(ellipse 90% 80% at 50% 45%, transparent 30%, rgba(4,20,38,0.55) 100%)," +
          "linear-gradient(to bottom, rgba(4,20,38,0.35) 0%, transparent 30%, rgba(4,20,38,0.6) 100%)",
      }}
    />
  );
}

/* ── Composition ─────────────────────────────────────────── */

export function HeroLoop() {
  return (
    <AbsoluteFill>
      <Aurora />
      <Grid />
      <Rings />
      <ECG />
      <Vignette />
    </AbsoluteFill>
  );
}
