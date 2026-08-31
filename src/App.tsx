/**
 * Al-Madinah Hospital — public website.
 *
 * Separate deployment from the hospital information system: this site is
 * anonymous, cacheable and public, the HIS is authenticated and private.
 * The only link between them is `signInUrl()` in lib/brand.
 *
 * Pages are lazy-loaded so the homepage — the one most visitors will ever
 * see — does not carry the booking form's weight.
 */

import { lazy, Suspense, useEffect } from "react";
import { Route, Switch, useLocation } from "wouter";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { BreathingCross } from "@/components/vitals";
import { soft } from "@/lib/motion";

import Home from "@/pages/Home";

const About = lazy(() => import("@/pages/About"));
const Doctors = lazy(() => import("@/pages/Doctors"));
const Staff = lazy(() => import("@/pages/Staff"));
const Contact = lazy(() => import("@/pages/Contact"));
const Book = lazy(() => import("@/pages/Book"));
const Login = lazy(() => import("@/pages/Login"));

/** Every navigation starts at the top. Without this, moving from the bottom
    of the homepage to /contact lands you mid-page. */
function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => { window.scrollTo({ top: 0, behavior: "auto" }); }, [location]);
  return null;
}

function PageLoader() {
  return (
    <div className="grid min-h-[70svh] place-items-center">
      <span className="text-brand/45"><BreathingCross size={34} /></span>
    </div>
  );
}

function NotFound() {
  return (
    <main className="grid min-h-[80svh] place-items-center px-6 pt-24 text-center">
      <div>
        <p className="u-eyebrow">404</p>
        <h1 className="mt-3 text-[clamp(30px,5vw,46px)]">We can't find that page</h1>
        <p className="mx-auto mt-3 max-w-md text-[16px] text-ink-soft">
          It may have moved. The departments, doctors and booking form are all
          still where you left them.
        </p>
        <a
          href="/"
          className="mt-8 inline-flex h-12 items-center rounded-full bg-brand px-7 text-[15px] font-semibold text-white"
        >
          Back to the homepage
        </a>
      </div>
    </main>
  );
}

export default function App() {
  const [location] = useLocation();
  const reduced = useReducedMotion();

  return (
    <div className="flex min-h-svh flex-col">
      <ScrollToTop />
      <Nav />

      <div className="flex-1">
        <Suspense fallback={<PageLoader />}>
          {/* Cross-fade between routes. Short and opacity-only: a sliding page
              transition fights the scroll-to-top and reads as lag. */}
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={location}
              initial={reduced ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reduced ? undefined : { opacity: 0 }}
              transition={soft(0.28)}
            >
              <Switch>
                <Route path="/" component={Home} />
                <Route path="/about" component={About} />
                <Route path="/doctors" component={Doctors} />
                <Route path="/staff" component={Staff} />
                <Route path="/contact" component={Contact} />
                <Route path="/book" component={Book} />
                <Route path="/login" component={Login} />
                <Route component={NotFound} />
              </Switch>
            </motion.div>
          </AnimatePresence>
        </Suspense>
      </div>

      {/* The sign-in page is a focused task; a full footer under it is noise. */}
      {location !== "/login" && <Footer />}
    </div>
  );
}
