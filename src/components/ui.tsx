/**
 * The site's small parts: buttons, fields, pills, section headers, and the
 * scroll-reveal wrapper everything else is built from.
 *
 * Deliberately hand-rolled rather than pulled from a component library — the
 * site has one visual voice and about eight primitives, and a dependency
 * would cost more than it saves at that size.
 */

import {
  createContext, forwardRef, useContext, useId, useMemo, useState,
  type InputHTMLAttributes, type ReactNode,
  type SelectHTMLAttributes, type TextareaHTMLAttributes,
} from "react";
import { motion, useReducedMotion, type HTMLMotionProps } from "framer-motion";
import { Link } from "wouter";
import { AlertCircle, Check, ChevronDown, Eye, EyeOff } from "lucide-react";

import { inView, reveal, soft, springy, stagger } from "@/lib/motion";

/* ── cx ──────────────────────────────────────────────────── */

export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

/* ── Reveal ──────────────────────────────────────────────── */

/**
 * Fades a block up as it enters the viewport, or plainly fades it if the
 * visitor prefers reduced motion. Content is always in the DOM.
 */
export function Reveal({
  children, delay = 0, className, as = "div",
}: {
  children: ReactNode; delay?: number; className?: string; as?: "div" | "section" | "li" | "article";
}) {
  const reduced = useReducedMotion();
  const Tag = motion[as] as typeof motion.div;
  return (
    <Tag
      className={className}
      variants={reveal(reduced)}
      {...inView}
      transition={soft(0.7, delay)}
    >
      {children}
    </Tag>
  );
}

/** Parent for a list whose children should walk in one after another. */
export function RevealGroup({
  children, className, each = 0.07, as = "div",
}: {
  children: ReactNode; className?: string; each?: number; as?: "div" | "ul" | "section";
}) {
  const Tag = motion[as] as typeof motion.div;
  return (
    <Tag className={className} variants={stagger(each)} {...inView}>
      {children}
    </Tag>
  );
}

/** A child of RevealGroup. Inherits the parent's stagger timing. */
export function RevealItem({
  children, className, as = "div",
}: {
  children: ReactNode; className?: string; as?: "div" | "li" | "article";
}) {
  const reduced = useReducedMotion();
  const Tag = motion[as] as typeof motion.div;
  return (
    <Tag className={className} variants={reveal(reduced)}>
      {children}
    </Tag>
  );
}

/* ── Buttons ─────────────────────────────────────────────── */

type ButtonTone = "primary" | "ghost" | "outline" | "light" | "coral";
type ButtonSize = "sm" | "md" | "lg";

const TONE: Record<ButtonTone, string> = {
  primary: "bg-brand text-white hover:bg-brand-deep shadow-[0_10px_28px_-14px] shadow-brand/70",
  coral: "bg-coral text-white hover:brightness-95 shadow-[0_10px_28px_-14px] shadow-coral/70",
  outline: "border border-brand/25 text-brand hover:bg-brand-wash",
  ghost: "text-ink-soft hover:text-brand hover:bg-brand-wash/60",
  light: "bg-white/12 text-white border border-white/25 hover:bg-white/20 backdrop-blur-sm",
};

const SIZE: Record<ButtonSize, string> = {
  sm: "h-9 px-4 text-[13px]",
  md: "h-11 px-6 text-[14px]",
  lg: "h-[52px] px-8 text-[15px]",
};

const BUTTON_BASE =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold " +
  "transition-colors duration-200 disabled:opacity-50 disabled:pointer-events-none " +
  "whitespace-nowrap select-none";

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  tone?: ButtonTone;
  size?: ButtonSize;
  children?: ReactNode;
}

/**
 * The lift on hover is a spring because the user caused it. It is small on
 * purpose — 2px reads as responsive, 6px reads as a toy.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { tone = "primary", size = "md", className, children, ...rest }, ref,
) {
  const reduced = useReducedMotion();
  return (
    <motion.button
      ref={ref}
      className={cx(BUTTON_BASE, TONE[tone], SIZE[size], className)}
      whileHover={reduced ? undefined : { y: -2 }}
      whileTap={reduced ? undefined : { y: 0, scale: 0.98 }}
      transition={springy}
      {...rest}
    >
      {children}
    </motion.button>
  );
});

/** Same skin as Button, but renders a router link. */
export function ButtonLink({
  href, tone = "primary", size = "md", className, children, external,
}: {
  href: string; tone?: ButtonTone; size?: ButtonSize;
  className?: string; children: ReactNode; external?: boolean;
}) {
  const reduced = useReducedMotion();
  const cls = cx(BUTTON_BASE, TONE[tone], SIZE[size], className);
  const motionProps = {
    whileHover: reduced ? undefined : { y: -2 },
    whileTap: reduced ? undefined : { y: 0, scale: 0.98 },
    transition: springy,
  };

  if (external) {
    return (
      <motion.a href={href} className={cls} {...motionProps}>
        {children}
      </motion.a>
    );
  }
  return (
    <Link href={href} asChild>
      <motion.a className={cls} {...motionProps}>{children}</motion.a>
    </Link>
  );
}

/* ── Pill ────────────────────────────────────────────────── */

export function Pill({
  children, tone = "brand", className,
}: {
  children: ReactNode; tone?: "brand" | "mint" | "coral" | "muted" | "light"; className?: string;
}) {
  const tones = {
    brand: "bg-brand-wash text-brand",
    mint: "bg-mint-wash text-mint",
    coral: "bg-coral-wash text-coral",
    muted: "bg-black/5 text-ink-soft",
    light: "bg-white/12 text-white border border-white/20",
  } as const;
  return (
    <span className={cx(
      "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11.5px] font-semibold",
      "tracking-wide", tones[tone], className,
    )}>
      {children}
    </span>
  );
}

/* ── Section header ──────────────────────────────────────── */

export function SectionHead({
  eyebrow, title, lead, align = "start", className,
}: {
  eyebrow?: string; title: ReactNode; lead?: string;
  align?: "start" | "center"; className?: string;
}) {
  return (
    <Reveal className={cx(
      "max-w-2xl", align === "center" && "mx-auto text-center", className,
    )}>
      {eyebrow && <p className="u-eyebrow mb-3">{eyebrow}</p>}
      <h2 className="text-[clamp(28px,4.2vw,44px)]">{title}</h2>
      {lead && <p className="mt-4 text-[16.5px] leading-[1.75] text-ink-soft">{lead}</p>}
    </Reveal>
  );
}

/* ── Form fields ─────────────────────────────────────────── */

/**
 * Fields share an error/label context so the booking form can mark a whole
 * step invalid without every input re-implementing the wiring.
 */
const FieldCtx = createContext<{ id: string; invalid: boolean } | null>(null);

const CONTROL_BASE =
  "w-full rounded-2xl border bg-white px-4 text-[15px] text-ink " +
  "placeholder:text-ink-faint transition-shadow duration-200 " +
  "focus:outline-none focus:ring-4 focus:ring-brand/12 focus:border-brand/50";

export function Field({
  label, hint, error, required, children, className,
}: {
  label: string; hint?: string; error?: string; required?: boolean;
  children: ReactNode; className?: string;
}) {
  const id = useId();
  const ctx = useMemo(() => ({ id, invalid: Boolean(error) }), [id, error]);

  return (
    <FieldCtx.Provider value={ctx}>
      <div className={cx("flex flex-col gap-1.5", className)}>
        <label htmlFor={id} className="text-[13px] font-semibold text-ink">
          {label}
          {required && <span className="text-coral" aria-hidden> *</span>}
          {!required && <span className="ml-1.5 text-[12px] font-normal text-ink-faint">optional</span>}
        </label>
        {children}
        {/* Reserve nothing: the message appears and pushes, rather than
            sitting in permanently-empty space under every field. */}
        {error ? (
          <motion.p
            initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
            transition={soft(0.25)}
            className="flex items-center gap-1.5 text-[12.5px] font-medium text-coral"
            role="alert"
          >
            <AlertCircle size={13} /> {error}
          </motion.p>
        ) : hint ? (
          <p className="text-[12.5px] text-ink-faint">{hint}</p>
        ) : null}
      </div>
    </FieldCtx.Provider>
  );
}

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...rest }, ref) {
    const ctx = useContext(FieldCtx);
    return (
      <input
        ref={ref}
        id={ctx?.id}
        aria-invalid={ctx?.invalid || undefined}
        className={cx(CONTROL_BASE, "h-12",
          ctx?.invalid ? "border-coral/60 ring-4 ring-coral/10" : "border-line", className)}
        {...rest}
      />
    );
  },
);

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function Textarea({ className, ...rest }, ref) {
    const ctx = useContext(FieldCtx);
    return (
      <textarea
        ref={ref}
        id={ctx?.id}
        aria-invalid={ctx?.invalid || undefined}
        className={cx(CONTROL_BASE, "py-3 min-h-28 resize-y leading-relaxed",
          ctx?.invalid ? "border-coral/60 ring-4 ring-coral/10" : "border-line", className)}
        {...rest}
      />
    );
  },
);

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  function Select({ className, children, ...rest }, ref) {
    const ctx = useContext(FieldCtx);
    return (
      <div className="relative">
        <select
          ref={ref}
          id={ctx?.id}
          aria-invalid={ctx?.invalid || undefined}
          className={cx(CONTROL_BASE, "h-12 appearance-none pr-10 cursor-pointer",
            ctx?.invalid ? "border-coral/60 ring-4 ring-coral/10" : "border-line", className)}
          {...rest}
        >
          {children}
        </select>
        <ChevronDown
          size={16}
          className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-ink-faint"
        />
      </div>
    );
  },
);

/** Password field with a reveal toggle — typing a password blind on a phone
    is the most common reason a sign-in gets abandoned. */
export function PasswordInput(props: InputHTMLAttributes<HTMLInputElement>) {
  const [shown, setShown] = useState(false);
  const ctx = useContext(FieldCtx);
  return (
    <div className="relative">
      <input
        {...props}
        id={ctx?.id}
        type={shown ? "text" : "password"}
        aria-invalid={ctx?.invalid || undefined}
        className={cx(CONTROL_BASE, "h-12 pr-12",
          ctx?.invalid ? "border-coral/60 ring-4 ring-coral/10" : "border-line", props.className)}
      />
      <button
        type="button"
        onClick={() => setShown((s) => !s)}
        aria-label={shown ? "Hide password" : "Show password"}
        className="absolute right-3 top-1/2 -translate-y-1/2 grid h-8 w-8 place-items-center
                   rounded-full text-ink-faint transition-colors hover:text-brand hover:bg-brand-wash"
      >
        {shown ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
}

/** Radio rendered as a selectable card. Used for departments and time slots. */
export function ChoiceCard({
  selected, onSelect, disabled, children, className,
}: {
  selected: boolean; onSelect: () => void; disabled?: boolean;
  children: ReactNode; className?: string;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.button
      type="button"
      role="radio"
      aria-checked={selected}
      disabled={disabled}
      onClick={onSelect}
      whileHover={reduced || disabled ? undefined : { y: -3 }}
      whileTap={reduced || disabled ? undefined : { scale: 0.985 }}
      transition={springy}
      className={cx(
        "relative w-full rounded-2xl border p-4 text-left transition-colors duration-200",
        "disabled:opacity-40 disabled:cursor-not-allowed",
        selected
          ? "border-brand bg-brand-wash/70 ring-4 ring-brand/10"
          : "border-line bg-white hover:border-brand/40",
        className,
      )}
    >
      {children}
      {selected && (
        <motion.span
          layoutId="choice-tick"
          className="absolute right-3 top-3 grid h-5 w-5 place-items-center rounded-full bg-brand text-white"
          transition={springy}
        >
          <Check size={12} strokeWidth={3} />
        </motion.span>
      )}
    </motion.button>
  );
}

/* ── Avatar ──────────────────────────────────────────────── */

const ACCENT_BG = {
  brand: "bg-brand text-white",
  mint: "bg-mint text-white",
  coral: "bg-coral text-white",
} as const;

export function Avatar({
  initials, accent = "brand", size = 56, className,
}: {
  initials: string; accent?: "brand" | "mint" | "coral"; size?: number; className?: string;
}) {
  return (
    <span
      className={cx(
        "grid shrink-0 place-items-center rounded-2xl font-semibold tracking-wide",
        ACCENT_BG[accent], className,
      )}
      style={{ width: size, height: size, fontSize: size * 0.34 }}
      aria-hidden
    >
      {initials}
    </span>
  );
}

export const buttonBase = BUTTON_BASE;
