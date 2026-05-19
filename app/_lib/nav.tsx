"use client";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useMounted } from "./atoms";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { WordmarkLink } from "./wordmark";
import { worlds, type World } from "./worlds";
import { Orb } from "./orb";

const serif = "var(--font-serif,'Cormorant Garamond',Georgia,serif)";

type NavLang = "en" | "es";

type NavCopy = {
  nw: string;
  nse: string;
  na: string;
};

type MenuKey = "worlds";

export function Nav({ lang, set, t }: { lang: NavLang; set: (l: NavLang) => void; t: NavCopy }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState<MenuKey | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const mounted = useMounted();

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  // Lock body scroll while the mobile drawer is open
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const items: Array<{ key: MenuKey | "apply" | "systems"; label: string; href: string; menu: boolean }> = [
    { key: "worlds", label: t.nw, href: "/worlds", menu: true },
    // Systems → anchor to the home-page services section. On any page
    // it routes to /#services and the browser scrolls to the section.
    { key: "systems", label: t.nse, href: "/#services", menu: false },
    { key: "apply", label: t.na, href: "/contact", menu: false },
  ];

  const isMenuOpen = open !== null;

  return (
    <>
    <header
      onMouseLeave={() => setOpen(null)}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 200,
        borderBottom: scrolled || isMenuOpen || mobileOpen ? "1px solid rgba(255,255,255,0.06)" : "1px solid transparent",
        background: scrolled || isMenuOpen || mobileOpen ? "rgba(4,3,2,0.94)" : "transparent",
        backdropFilter: scrolled || isMenuOpen || mobileOpen ? "blur(28px)" : "none",
        WebkitBackdropFilter: scrolled || isMenuOpen || mobileOpen ? "blur(28px)" : "none",
        transition: "background 0.6s cubic-bezier(0.22,1,0.36,1), border-color 0.6s",
      }}
    >
      <nav
        style={{
          maxWidth: 1600,
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 64,
          padding: "0 clamp(20px,5vw,56px)",
          gap: 16,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* Studio pulse — small breathing amber dot to the left of
              the wordmark. A persistent signal that the lab is on
              right now: not a decorative LED, more like the indicator
              light on professional studio gear. 3.6s loop, subtle
              opacity + scale. Hover reveals a small status caption. */}
          <div
            aria-label={lang === "en" ? "Studio observing" : "Estudio activo"}
            title={lang === "en" ? "Studio observing · First cycle of MMXXVI · Open" : "Estudio activo · Primer ciclo de MMXXVI · Abierto"}
            style={{ position: "relative", width: 10, height: 10, display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <motion.span
              aria-hidden
              animate={{ opacity: [0.45, 1, 0.45], scale: [1, 1.22, 1] }}
              transition={{ duration: 3.6, ease: "easeInOut", repeat: Infinity }}
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: "#e8b783",
                boxShadow: "0 0 12px 1px rgba(232,183,131,0.65)",
                display: "inline-block",
              }}
            />
          </div>
          <WordmarkLink />
        </div>

        {/* Desktop nav items — hidden below md */}
        <div
          className="hidden md:flex"
          style={{
            // 4 items at md (768px) need a tighter floor so they don't
            // collide with the wordmark + lang toggle + audio control
            // and force an early wrap. Tracking holds the editorial feel.
            gap: "clamp(12px,2.6vw,56px)",
            fontSize: "clamp(10.5px,1.08vw,12.5px)",
            fontWeight: 400,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.6)",
          }}
        >
          {items.map((it) => {
            const active = open === it.key;
            const onRoute =
              pathname === it.href ||
              (it.href !== "/" && pathname.startsWith(it.href));
            return (
              <div
                key={it.key}
                onMouseEnter={(e) => {
                  if (it.menu) setOpen(it.key as MenuKey);
                  else setOpen(null);
                  const line = e.currentTarget.querySelector("[data-nav-line]") as HTMLElement | null;
                  if (line) line.style.transform = "translateX(-50%) scaleX(1)";
                }}
                onMouseLeave={(e) => {
                  const line = e.currentTarget.querySelector("[data-nav-line]") as HTMLElement | null;
                  if (line) line.style.transform = "translateX(-50%) scaleX(0)";
                }}
                // Keyboard parity — onFocus/onBlur bubble from the
                // child Link via React's focusin/focusout, so Tab-ing
                // through the nav draws the same amber underline that
                // mouse hover does.
                onFocus={(e) => {
                  const line = e.currentTarget.querySelector("[data-nav-line]") as HTMLElement | null;
                  if (line) line.style.transform = "translateX(-50%) scaleX(1)";
                }}
                onBlur={(e) => {
                  const line = e.currentTarget.querySelector("[data-nav-line]") as HTMLElement | null;
                  if (line) line.style.transform = "translateX(-50%) scaleX(0)";
                }}
                style={{ position: "relative", padding: "22px 0" }}
              >
                <Link
                  href={it.href}
                  aria-current={onRoute ? "page" : undefined}
                  style={{
                    textDecoration: "none",
                    color: active || onRoute ? "white" : "rgba(255,255,255,0.55)",
                    letterSpacing: active ? "0.28em" : "0.22em",
                    transition: "color 0.3s, letter-spacing 0.3s",
                  }}
                >
                  {it.label}
                </Link>
                {/* Hover underline — a thin amber line that draws from
                    the centre out on mouse enter and retracts on leave.
                    Sits BELOW the active-route dot so both can coexist
                    on the current route without colliding. */}
                <span
                  data-nav-line
                  aria-hidden
                  style={{
                    position: "absolute",
                    left: "50%",
                    bottom: 8,
                    width: "70%",
                    height: 1,
                    background:
                      "linear-gradient(to right, transparent 0%, rgba(232,183,131,0.85) 50%, transparent 100%)",
                    transform: "translateX(-50%) scaleX(0)",
                    transformOrigin: "center",
                    transition: "transform 0.55s cubic-bezier(0.22,1,0.36,1)",
                    pointerEvents: "none",
                  }}
                />
                {/* Active indicator — small amber dot below the label
                    on the current route. Premium, restrained. */}
                {onRoute && (
                  <motion.span
                    aria-hidden
                    layoutId="nav-active"
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    style={{
                      position: "absolute",
                      left: "50%",
                      bottom: 14,
                      transform: "translateX(-50%)",
                      width: 3,
                      height: 3,
                      borderRadius: "50%",
                      background: "rgba(232,183,131,0.85)",
                      boxShadow: "0 0 8px rgba(232,183,131,0.6)",
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "clamp(12px,2vw,22px)" }}>
<button
            onClick={() => set(lang === "en" ? "es" : "en")}
            aria-label={lang === "en" ? "Switch to Spanish" : "Cambiar a inglés"}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 11,
              fontWeight: 400,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
              color: "inherit",
            }}
          >
            <span style={{ color: lang === "en" ? "white" : "rgba(255,255,255,0.25)", transition: "color 0.3s" }}>EN</span>
            <span
              aria-hidden
              style={{
                display: "inline-block",
                width: 12,
                height: 1,
                background: "rgba(232,183,131,0.32)",
              }}
            />
            <span style={{ color: lang === "es" ? "white" : "rgba(255,255,255,0.25)", transition: "color 0.3s" }}>ES</span>
          </button>

          {/* Mobile hamburger — visible below md only */}
          <button
            type="button"
            aria-label={mobileOpen ? (lang === "en" ? "Close menu" : "Cerrar menú") : (lang === "en" ? "Open menu" : "Abrir menú")}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
            className="md:hidden"
            style={{
              alignItems: "center",
              justifyContent: "center",
              width: 44,
              height: 44,
              background: "none",
              border: "none",
              padding: 0,
              cursor: "pointer",
              color: "rgba(255,255,255,0.85)",
              marginRight: -10,
            }}
          >
            <span style={{ position: "relative", display: "block", width: 22, height: 14 }}>
              <span
                aria-hidden
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top: mobileOpen ? 6 : 0,
                  height: 1,
                  background: "currentColor",
                  transform: mobileOpen ? "rotate(45deg)" : "none",
                  transition: "transform 0.3s, top 0.3s",
                }}
              />
              <span
                aria-hidden
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top: 6,
                  height: 1,
                  background: "currentColor",
                  opacity: mobileOpen ? 0 : 1,
                  transition: "opacity 0.2s",
                }}
              />
              <span
                aria-hidden
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  bottom: mobileOpen ? 7 : 0,
                  height: 1,
                  background: "currentColor",
                  transform: mobileOpen ? "rotate(-45deg)" : "none",
                  transition: "transform 0.3s, bottom 0.3s",
                }}
              />
            </span>
          </button>
        </div>
      </nav>

      {/* Desktop hover dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            key={open}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="hidden md:block"
            style={{
              position: "absolute",
              top: 64,
              left: 0,
              right: 0,
              borderTop: "1px solid rgba(255,255,255,0.05)",
              background: "rgba(4,3,2,0.96)",
              backdropFilter: "blur(32px)",
              WebkitBackdropFilter: "blur(32px)",
            }}
          >
            <div
              style={{
                maxWidth: 980,
                margin: "0 auto",
                padding: "clamp(18px,2vw,26px) clamp(20px,2.8vw,36px) clamp(20px,2.4vw,32px)",
              }}
            >
              {open === "worlds" && <WorldsMenu lang={lang} onSelect={() => setOpen(null)} />}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </header>

    {/* Mobile drawer — portalled to body so it escapes the header's
        backdrop-filter containing block. Without the portal, iOS Safari
        confined the fixed drawer to the 64px header rectangle and the
        menu appeared empty. */}
    {mounted && createPortal(
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="md:hidden"
            style={{
              position: "fixed",
              top: 64,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 199,
              background: "rgba(4,3,2,0.98)",
              backdropFilter: "blur(32px)",
              WebkitBackdropFilter: "blur(32px)",
              overflowY: "auto",
              WebkitOverflowScrolling: "touch",
            }}
          >
            <div style={{ padding: "clamp(32px,10vw,56px) clamp(22px,5.5vw,40px) 96px" }}>
              <MobileSection title={t.nw} href="/worlds" onClose={() => setMobileOpen(false)}>
                <WorldsMenu lang={lang} onSelect={() => setMobileOpen(false)} compact />
              </MobileSection>
              <Link
                href="/contact"
                onClick={() => setMobileOpen(false)}
                style={{
                  display: "block",
                  marginTop: 36,
                  padding: "20px 28px",
                  background: "white",
                  color: "#060606",
                  textDecoration: "none",
                  textAlign: "center",
                  fontSize: 12,
                  fontWeight: 500,
                  letterSpacing: "0.32em",
                  textTransform: "uppercase",
                  borderRadius: 999,
                  boxShadow:
                    "0 16px 60px -16px rgba(232,183,131,0.4), 0 0 0 1px rgba(255,255,255,0.04) inset",
                }}
              >
                {t.na}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>,
      document.body
    )}
    </>
  );
}

function MobileSection({
  title,
  href,
  onClose,
  children,
}: {
  title: string;
  href: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <section style={{ marginBottom: 56 }}>
      <Link
        href={href}
        onClick={onClose}
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          fontSize: 15,
          letterSpacing: "0.42em",
          textTransform: "uppercase",
          color: "white",
          textDecoration: "none",
          fontWeight: 500,
          marginBottom: 24,
          padding: "0 4px",
        }}
      >
        <span>{title}</span>
        <span
          aria-hidden
          style={{
            fontSize: 11,
            letterSpacing: "0.32em",
            color: "rgba(232,183,131,0.9)",
            fontWeight: 500,
          }}
        >
          →
        </span>
      </Link>
      <div>{children}</div>
    </section>
  );
}

// Shared footer strip that closes a menu with a poetic note and a
// commercial CTA into the section's own index page. Same layout for
// worlds, services and process so the dropdowns feel like one family.
function MenuFooter({
  href,
  cta,
  note,
  onSelect,
}: {
  href: string;
  cta: string;
  note: string;
  onSelect?: () => void;
}) {
  return (
    <div
      style={{
        marginTop: 14,
        paddingTop: 14,
        borderTop: "1px solid rgba(255,255,255,0.06)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
        padding: "14px 14px 0",
      }}
    >
      <p
        style={{
          margin: 0,
          fontFamily: serif,
          fontStyle: "italic",
          fontSize: 12,
          color: "rgba(255,255,255,0.5)",
          letterSpacing: "-0.005em",
        }}
      >
        {note}
      </p>
      <Link
        href={href}
        onClick={onSelect}
        style={{
          fontSize: 10,
          fontWeight: 500,
          letterSpacing: "0.32em",
          textTransform: "uppercase",
          color: "rgba(232,183,131,0.9)",
          textDecoration: "none",
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          transition: "color 0.3s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = "white";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = "rgba(232,183,131,0.9)";
        }}
      >
        {cta} <span aria-hidden>→</span>
      </Link>
    </div>
  );
}

function WorldRow({
  href,
  world,
  lang,
  onSelect,
  compact,
  index = 0,
}: {
  href: string;
  world: World;
  lang: NavLang;
  onSelect?: () => void;
  compact?: boolean;
  index?: number;
}) {
  const c = world.color;
  // Background tint hex with ~8% alpha. Hex8 (#RRGGBBAA) is supported
  // everywhere we ship, and uses the world's own colour so the hover
  // beat is signed by the world, not by a generic grey.
  const tint = `${c.hex}14`;
  // Compact (mobile drawer): no horizontal dividers, larger title and
  // orb, pitch always visible, vertical left accent stripe in the
  // world's colour. Rounded card-like rows. Non-compact (desktop
  // dropdown): subtle top hairline kept for grid rhythm, smaller type,
  // rounded hover background.
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1],
        delay: 0.08 + index * 0.045,
      }}
      style={{ willChange: "transform, filter, opacity" }}
    >
    <Link
      href={href}
      onClick={onSelect}
      style={{
        display: "flex",
        alignItems: compact ? "center" : "flex-start",
        gap: compact ? 20 : 18,
        padding: compact ? "22px 18px" : "16px 14px",
        textDecoration: "none",
        color: "inherit",
        position: "relative",
        borderTop: compact ? "none" : "1px solid rgba(255,255,255,0.05)",
        borderRadius: compact ? 16 : 10,
        marginBottom: compact ? 4 : 0,
        transition: "background 0.45s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = tint;
        const accent = e.currentTarget.querySelector("[data-accent]") as HTMLElement | null;
        if (accent) accent.style.transform = compact ? "scaleY(1)" : "scaleX(1)";
        const arrow = e.currentTarget.querySelector("[data-arrow]") as HTMLElement | null;
        if (arrow) {
          arrow.style.opacity = "1";
          arrow.style.transform = "translateX(0)";
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
        const accent = e.currentTarget.querySelector("[data-accent]") as HTMLElement | null;
        if (accent) accent.style.transform = compact ? "scaleY(0)" : "scaleX(0)";
        const arrow = e.currentTarget.querySelector("[data-arrow]") as HTMLElement | null;
        if (arrow) {
          arrow.style.opacity = "0";
          arrow.style.transform = "translateX(-6px)";
        }
      }}
      onFocus={(e) => {
        e.currentTarget.style.background = tint;
        const accent = e.currentTarget.querySelector("[data-accent]") as HTMLElement | null;
        if (accent) accent.style.transform = compact ? "scaleY(1)" : "scaleX(1)";
        const arrow = e.currentTarget.querySelector("[data-arrow]") as HTMLElement | null;
        if (arrow) {
          arrow.style.opacity = "1";
          arrow.style.transform = "translateX(0)";
        }
      }}
      onBlur={(e) => {
        e.currentTarget.style.background = "transparent";
        const accent = e.currentTarget.querySelector("[data-accent]") as HTMLElement | null;
        if (accent) accent.style.transform = compact ? "scaleY(0)" : "scaleX(0)";
        const arrow = e.currentTarget.querySelector("[data-arrow]") as HTMLElement | null;
        if (arrow) {
          arrow.style.opacity = "0";
          arrow.style.transform = "translateX(-6px)";
        }
      }}
    >
      {/* Colour accent. Vertical left stripe in compact (mobile
          drawer), bottom hairline in non-compact (desktop dropdown).
          Both scale in from one end on hover. */}
      {compact ? (
        <span
          data-accent
          aria-hidden
          style={{
            position: "absolute",
            left: 0,
            top: 14,
            bottom: 14,
            width: 2,
            borderRadius: 2,
            background: c.hex,
            opacity: 0.85,
            transform: "scaleY(0)",
            transformOrigin: "center top",
            transition: "transform 0.5s cubic-bezier(0.22,1,0.36,1)",
            pointerEvents: "none",
          }}
        />
      ) : (
        <span
          data-accent
          aria-hidden
          style={{
            position: "absolute",
            left: 14,
            right: 14,
            bottom: -1,
            height: 1,
            background: c.hex,
            opacity: 0.7,
            transform: "scaleX(0)",
            transformOrigin: "left center",
            transition: "transform 0.5s cubic-bezier(0.22,1,0.36,1)",
            pointerEvents: "none",
          }}
        />
      )}
      <div
        style={{
          width: compact ? 64 : 52,
          height: compact ? 64 : 52,
          flexShrink: 0,
          position: "relative",
          marginTop: compact ? 0 : 1,
        }}
      >
        <Orb world={world} size={compact ? 64 : 52} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: compact ? 14 : 10,
            flexWrap: "wrap",
            marginBottom: compact ? 8 : 5,
          }}
        >
          <span
            style={{
              fontSize: compact ? 12 : 9,
              fontWeight: 500,
              letterSpacing: "0.32em",
              color: c.hex,
              opacity: 0.92,
              flexShrink: 0,
            }}
          >
            {world.number}
          </span>
          <span
            style={{
              fontSize: compact ? 22 : 14.5,
              color: "white",
              letterSpacing: "-0.012em",
              fontWeight: 400,
              lineHeight: 1.18,
            }}
          >
            {world.title[lang]}
          </span>
        </div>
        <p
          style={{
            margin: 0,
            fontSize: compact ? 14 : 11.5,
            lineHeight: compact ? 1.55 : 1.5,
            color: compact ? "rgba(255,255,255,0.66)" : "rgba(255,255,255,0.58)",
            fontWeight: 300,
            letterSpacing: "0.005em",
            textWrap: "balance",
          }}
        >
          {world.pitch[lang]}
        </p>
      </div>
      {!compact && (
        <span
          data-arrow
          aria-hidden
          style={{
            color: c.hex,
            fontSize: 14,
            lineHeight: 1,
            opacity: 0,
            transform: "translateX(-6px)",
            transition: "opacity 0.4s, transform 0.4s",
            flexShrink: 0,
            alignSelf: "center",
            paddingLeft: 6,
          }}
        >
          →
        </span>
      )}
    </Link>
    </motion.div>
  );
}

function WorldsMenu({ lang, onSelect, compact }: { lang: NavLang; onSelect?: () => void; compact?: boolean }) {
  return (
    <div>
      {!compact && (
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            gap: 16,
            padding: "0 14px 14px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <p
            style={{
              fontSize: 9,
              fontWeight: 500,
              letterSpacing: "0.4em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.42)",
              margin: 0,
            }}
          >
            {lang === "en" ? "The Universe" : "El Universo"}
          </p>
          <p
            style={{
              fontFamily: serif,
              fontStyle: "italic",
              fontSize: 12.5,
              color: "rgba(232,183,131,0.82)",
              margin: 0,
              letterSpacing: "-0.005em",
            }}
          >
            {lang === "en"
              ? "Six emotional systems."
              : "Seis sistemas emocionales."}
          </p>
        </div>
      )}
      <div
        style={{
          display: "grid",
          gap: 0,
          gridTemplateColumns: compact ? "1fr" : "repeat(2, 1fr)",
          columnGap: compact ? 0 : 28,
        }}
      >
        {worlds.map((w, i) => (
          <WorldRow
            key={w.slug}
            href={`/worlds/${w.slug}`}
            world={w}
            lang={lang}
            onSelect={onSelect}
            compact={compact}
            index={i}
          />
        ))}
      </div>
      <MoreLinks lang={lang} compact={compact} onSelect={onSelect} />
      {!compact && (
        <MenuFooter
          href="/worlds"
          cta={lang === "en" ? "Enter the universe" : "Entrar al universo"}
          note={lang === "en" ? "Selected projects only." : "Solo proyectos seleccionados."}
          onSelect={onSelect}
        />
      )}
    </div>
  );
}

// Secondary content links — Studies, Lab Records, Manifesto, Imprint.
// Lives at the foot of the Worlds dropdown so the nav itself stays at
// two items. Small caps, dot-separated, low emphasis: discoverability
// without competing with the worlds grid.
function MoreLinks({
  lang,
  compact,
  onSelect,
}: {
  lang: NavLang;
  compact?: boolean;
  onSelect?: () => void;
}) {
  const items = [
    { href: "/studies", label: lang === "en" ? "Studies" : "Estudios" },
    { href: "/lab-records", label: lang === "en" ? "Lab Records" : "Registros" },
    { href: "/manifesto", label: lang === "en" ? "Manifesto" : "Manifiesto" },
    { href: "/imprint", label: lang === "en" ? "Imprint" : "Aviso legal" },
  ];
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: compact ? "flex-start" : "center",
        gap: compact ? "10px 14px" : "10px 18px",
        padding: compact ? "20px 4px 4px" : "16px 14px 6px",
        marginTop: compact ? 8 : 6,
        borderTop: compact ? "1px solid rgba(255,255,255,0.05)" : "none",
      }}
    >
      {items.map((it, i) => (
        <span key={it.href} style={{ display: "inline-flex", alignItems: "center", gap: compact ? 10 : 14 }}>
          <Link
            href={it.href}
            onClick={onSelect}
            style={{
              fontSize: compact ? 11 : 10.5,
              fontWeight: 500,
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.55)",
              textDecoration: "none",
              transition: "color 0.35s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "white";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "rgba(255,255,255,0.55)";
            }}
            onFocus={(e) => {
              e.currentTarget.style.color = "white";
            }}
            onBlur={(e) => {
              e.currentTarget.style.color = "rgba(255,255,255,0.55)";
            }}
          >
            {it.label}
          </Link>
          {i < items.length - 1 && (
            <span aria-hidden style={{ color: "rgba(255,255,255,0.2)", fontSize: 10 }}>·</span>
          )}
        </span>
      ))}
    </div>
  );
}
