# Al-Madinah Hospital — public website

The public, anonymous, cacheable front door for **Al-Madinah Hospital / مستشفى المدينة**.

Deliberately a **separate project** from the hospital information system (`~/Downloads/pulse master file`).
This site holds no session and no patient data; the only link between the two is `signInUrl()` in
`src/lib/brand.ts`, which hands a visitor to the HIS to authenticate.

```bash
npm install
npm run dev          # http://localhost:5190
npm run build        # typecheck + production build
```

## Stack

React 19 · Vite 7 · TypeScript · Tailwind 4 · wouter · Framer Motion · Remotion

Chosen to mirror the HIS, so the two codebases read the same way and the brand tokens can be kept in
step by eye.

## Pages

| Route | What it is |
|---|---|
| `/` | Landing — hero, departments, numbers, journey, consultants, voices |
| `/about` | History, values, timeline, accreditation |
| `/doctors` | Searchable consultant directory, filterable by department |
| `/staff` | Leadership, team sizes, open posts |
| `/contact` | Emergency numbers, direct lines, hours, getting here, message form |
| `/book` | Four-step appointment booking |
| `/login` | Sign-in, tabbed by Patient / Doctor / Staff |

## The hero video

The hero plays `public/media/hero.mp4`, **rendered from React** by Remotion rather than shot or
licensed. It is a composition (`src/remotion/HeroLoop.tsx`), so the hospital can change it in code.

```bash
npm run video:studio     # open the composition in Remotion Studio
npm run video:render     # write public/media/hero.mp4
npm run video:poster     # write public/media/hero-poster.jpg
```

Remotion is a **build-time** dependency only — it is not in the shipped bundle. If `hero.mp4` is
missing the hero falls back to the CSS gradient underneath and still looks finished.

The composition carries no type. An earlier cut animated department names through the centre; they
landed directly behind the `<h1>` and both became hard to read. A background video carries mood, the
page carries words.

## Motion

`src/lib/motion.ts` holds the whole vocabulary — one easing family, springs only for things the user
directly caused. `src/components/vitals.tsx` holds the hospital-specific pieces: an ECG trace built
from a real PQRST complex, pulse rings at a resting 72 bpm, a cross that breathes at ~4.5s, and a
count-up that springs so the last digits settle.

Three rules the code enforces, each after finding the failure the hard way:

1. **Motion never gates content.** Every reveal animates from `opacity: 0` but is laid out from the
   start. There is no `AnimatePresence mode="wait"` anywhere that content depends on — `mode="wait"`
   holds the next thing until the previous one's exit finishes, and when that tween was interrupted
   (a throttled background tab) the booking form stuck on a step the user had already completed.
2. **Nothing important arrives by animation.** The header has no entry animation. It used to slide
   down from `y:-70`; an interrupted tween stranded it off-screen and the site had no navigation.
3. **Reduced motion is honoured at the source.** `useReducedMotion()` feeds the shared variants, and
   `index.css` also neutralises CSS animation, so one setting covers both.

## Booking

`src/pages/Book.tsx`. State is one object at the top; steps only read and write it, so going back to
change a department keeps the name and phone already typed. Validation is per-step and on submit,
never on keystroke, and errors clear the moment a field changes.

Deep links work: `/book?department=cardiology` opens on step 2, `/book?doctor=d-hana` on step 3.

Slots are generated deterministically from the date and consultant, so the same day always offers the
same grid — a grid that reshuffles on re-render makes a form feel broken. Replace `bookedSlots()`
with the HIS scheduling read when the two are wired together; the shape is unchanged.

Two bugs worth not reintroducing:

- **Phone validation.** Egyptian mobiles are written `01012345678`. The regex must accept the trunk
  `0` as well as `+20` / `20`; an earlier version required the number to start with `1` and so
  rejected every number typed the way the placeholder asks for.
- **Dates.** Day keys are built by `localISO()` from local parts. `toISOString().slice(0,10)`
  converts to UTC first, so local midnight in Cairo becomes 21:00 the previous day — the chip said
  "Tue 1 Sep" and the confirmation said "Monday 31 August".

## Content

All of it is in `src/data/hospital.ts` — departments, consultants, leadership, stats, testimonials.
Nothing is inline in JSX, so the booking form's department list and the homepage grid cannot
disagree. These become API reads when the site is wired to the HIS; the types are already the shape
we would want back.

The numbers are placeholders and should be replaced with real published figures before launch. The
consultant list is ten people; the copy says so rather than claiming the full 42.

## What this site does not do

- **It does not authenticate.** `/login` collects an identifier and hands off to the HIS.
- **It has no patient portal or clinician workspace.** The HIS declares `/portal` and `/clinic` in
  its `PERSONA_HOME`, but neither route exists there yet — worth knowing before promising either
  from a button here.
- **The contact form is not a medical channel**, and says so. A form that quietly accepts "my chest
  hurts" is a safety problem, so it routes clinical questions to the phone.

## Configuration

`VITE_HIS_URL` points at the hospital information system (default `http://localhost:5173`).
Everything else — names, phone numbers, address, hours — is in `src/lib/brand.ts`.

The name has changed three times (Pulse → Al-Obour → Al-Madinah). Change it in `brand.ts` here and in
the HIS's own `platform/lib/brand.ts` together, never in a component.
