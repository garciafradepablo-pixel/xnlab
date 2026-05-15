"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { AmbientAudio } from "./audio";
import { WordmarkLink } from "./wordmark";
import { worlds } from "./worlds";

type NavLang = "en" | "es";

type NavCopy = {
  nw: string;
  nse: string;
  np: string;
  na: string;
};

type MenuKey = "worlds" | "services" | "process";

const SERVICES = (lang: NavLang): Array<[string, string, string]> =>
  lang === "en"
    ? [
        ["Campaign System", "From €5,000", "A focused launch across digital surfaces."],
        ["Digital Atmosphere", "From €10,000", "Cinematic single-page world."],
        ["Brand World", "From €25,000", "Full multi-page system."],
        ["Visual Engine", "From €4,000 / mo", "Continuous creative direction."],
        ["Technical / Growth", "From €1,500", "SEO, structure, analytics, conversion."],
        ["Upgrade Sprint", "From €2.5K – €4K", "Two-to-four-week intensive."],
      ]
    : [
        ["Campaign System", "Desde €5.000", "Lanzamiento puntual en superficies digitales."],
        ["Atmósfera Digital", "Desde €10.000", "Mundo cinematográfico de una sola página."],
        ["Mundo de Marca", "Desde €25.000", "Sistema multipágina completo."],
        ["Motor Visual", "Desde €4.000 / mes", "Dirección creativa continua."],
        ["Técnico / Crecimiento", "Desde €1.500", "SEO, estructura, analítica, conversión."],
        ["Sprint de Mejora", "Desde €2,5K – €4K", "Intensivo de dos a cuatro semanas."],
      ];

const MOVEMENTS = (lang: NavLang): Array<[string, string, string]> =>
  lang === "en"
    ? [
        ["01", "Diagnose", "Name the perception gap."],
        ["02", "Direct", "Set one single direction."],
        ["03", "Build", "Identity, copy, motion, code."],
        ["04", "Activate", "Launch, tune, stay through the first month."],
      ]
    : [
        ["01", "Diagnosticar", "Nombrar el gap de percepción."],
        ["02", "Dirigir", "Fijar una sola dirección."],
        ["03", "Construir", "Identidad, copy, motion, código."],
        ["04", "Activar", "Lanzar, afinar, quedarse durante el primer mes."],
      ];

export function Nav({ lang, set, t }: { lang: NavLang; set: (l: NavLang) => void; t: NavCopy }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState<MenuKey | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

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

  const items: Array<{ key: MenuKey | "apply"; label: string; href: string; menu: boolean }> = [
    { key: "worlds", label: t.nw, href: "/worlds", menu: true },
    { key: "services", label: t.nse, href: "/services", menu: true },
    { key: "process", label: t.np, href: "/process", menu: true },
    { key: "apply", label: t.na, href: "/contact", menu: false },
  ];

  const isMenuOpen = open !== null;

  return (
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
        <WordmarkLink />

        {/* Desktop nav items — hidden below md */}
        <div
          className="hidden md:flex"
          style={{
            gap: "clamp(12px,3vw,56px)",
            fontSize: "clamp(9px,1vw,11px)",
            fontWeight: 400,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.55)",
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
                onMouseEnter={() => {
                  if (it.menu) setOpen(it.key as MenuKey);
                  else setOpen(null);
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
          {/* Desktop-only ambient audio control */}
          <span className="hidden md:flex" style={{ alignItems: "center" }}>
            <AmbientAudio
              label={{
                on: lang === "en" ? "Atmosphere on" : "Atmósfera activa",
                off: lang === "en" ? "Atmosphere off" : "Atmósfera silenciosa",
              }}
            />
          </span>
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
            <span style={{ color: "rgba(255,255,255,0.18)" }}>·</span>
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
            <div style={{ maxWidth: 1600, margin: "0 auto", padding: "clamp(28px,3.4vw,48px) clamp(20px,5vw,56px)" }}>
              {open === "worlds" && <WorldsMenu lang={lang} onSelect={() => setOpen(null)} />}
              {open === "services" && <ServicesMenu lang={lang} onSelect={() => setOpen(null)} />}
              {open === "process" && <ProcessMenu lang={lang} onSelect={() => setOpen(null)} />}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile drawer — full screen, stacked */}
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
              background: "rgba(4,3,2,0.98)",
              backdropFilter: "blur(32px)",
              WebkitBackdropFilter: "blur(32px)",
              overflowY: "auto",
              WebkitOverflowScrolling: "touch",
            }}
          >
            <div style={{ padding: "clamp(24px,8vw,40px) clamp(20px,5vw,32px) 80px" }}>
              <MobileSection title={t.nw} href="/worlds" onClose={() => setMobileOpen(false)}>
                <WorldsMenu lang={lang} onSelect={() => setMobileOpen(false)} compact />
              </MobileSection>
              <MobileSection title={t.nse} href="/services" onClose={() => setMobileOpen(false)}>
                <ServicesMenu lang={lang} onSelect={() => setMobileOpen(false)} compact />
              </MobileSection>
              <MobileSection title={t.np} href="/process" onClose={() => setMobileOpen(false)}>
                <ProcessMenu lang={lang} onSelect={() => setMobileOpen(false)} compact />
              </MobileSection>
              <Link
                href="/contact"
                onClick={() => setMobileOpen(false)}
                style={{
                  display: "block",
                  marginTop: 28,
                  padding: "16px 20px",
                  background: "white",
                  color: "#060606",
                  textDecoration: "none",
                  textAlign: "center",
                  fontSize: 12,
                  fontWeight: 500,
                  letterSpacing: "0.28em",
                  textTransform: "uppercase",
                }}
              >
                {t.na}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
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
    <div style={{ marginBottom: 28, borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 22 }}>
      <Link
        href={href}
        onClick={onClose}
        style={{
          display: "block",
          fontSize: 13,
          letterSpacing: "0.28em",
          textTransform: "uppercase",
          color: "white",
          textDecoration: "none",
          fontWeight: 500,
          marginBottom: 16,
        }}
      >
        {title}
      </Link>
      <div>{children}</div>
    </div>
  );
}

function MenuCard({
  href,
  number,
  numberColor,
  title,
  meta,
  sub,
  compact,
  onSelect,
}: {
  href: string;
  number: string;
  numberColor?: string;
  title: string;
  meta?: string;
  sub: string;
  compact?: boolean;
  onSelect?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onSelect}
      style={{
        display: "block",
        padding: compact ? "12px 14px" : "clamp(16px,1.8vw,24px) clamp(16px,1.8vw,24px)",
        background: "rgba(255,255,255,0.025)",
        border: "1px solid rgba(255,255,255,0.05)",
        borderRadius: 4,
        textDecoration: "none",
        color: "inherit",
        transition: "background 0.3s, border-color 0.3s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "rgba(255,255,255,0.055)";
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.18)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "rgba(255,255,255,0.025)";
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.05)";
      }}
    >
      <p
        style={{
          fontSize: 10,
          letterSpacing: "0.34em",
          textTransform: "uppercase",
          color: numberColor ?? "rgba(255,255,255,0.55)",
          fontWeight: 500,
          margin: 0,
          marginBottom: 8,
        }}
      >
        {number}
      </p>
      <p
        style={{
          fontSize: compact ? 13.5 : 14.5,
          letterSpacing: "-0.005em",
          color: "white",
          fontWeight: 400,
          margin: 0,
          marginBottom: meta ? 4 : 3,
        }}
      >
        {title}
      </p>
      {meta && (
        <p
          style={{
            fontFamily: "var(--font-serif, Georgia)",
            fontStyle: "italic",
            fontSize: compact ? 12.5 : 13.5,
            color: "rgba(230,205,165,0.9)",
            margin: 0,
            marginBottom: 4,
          }}
        >
          {meta}
        </p>
      )}
      <p
        style={{
          fontSize: compact ? 11 : 11.5,
          lineHeight: 1.45,
          color: "rgba(255,255,255,0.55)",
          fontWeight: 300,
          margin: 0,
        }}
      >
        {sub}
      </p>
    </Link>
  );
}

function WorldsMenu({ lang, onSelect, compact }: { lang: NavLang; onSelect?: () => void; compact?: boolean }) {
  return (
    <div
      style={{
        display: "grid",
        gap: compact ? 8 : "clamp(10px,1.2vw,16px)",
        gridTemplateColumns: compact ? "1fr 1fr" : "repeat(auto-fit,minmax(200px,1fr))",
      }}
    >
      <MenuCard
        href="/worlds"
        number="00"
        title={lang === "en" ? "The Universe" : "El Universo"}
        sub={lang === "en" ? "Mythology and Cores" : "Mitología y Núcleos"}
        compact={compact}
        onSelect={onSelect}
      />
      {worlds.map((w) => (
        <MenuCard
          key={w.slug}
          href={`/worlds/${w.slug}`}
          number={w.number}
          numberColor={w.color.hex}
          title={w.title[lang]}
          sub={w.color.name}
          compact={compact}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}

function ServicesMenu({ lang, onSelect, compact }: { lang: NavLang; onSelect?: () => void; compact?: boolean }) {
  const items = SERVICES(lang);
  return (
    <div
      style={{
        display: "grid",
        gap: compact ? 8 : "clamp(10px,1.2vw,16px)",
        gridTemplateColumns: compact ? "1fr" : "repeat(auto-fit,minmax(220px,1fr))",
      }}
    >
      {items.map(([title, price, sub], i) => (
        <MenuCard
          key={title}
          href="/services"
          number={`0${i + 1}`}
          title={title}
          meta={price}
          sub={sub}
          compact={compact}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}

function ProcessMenu({ lang, onSelect, compact }: { lang: NavLang; onSelect?: () => void; compact?: boolean }) {
  const items = MOVEMENTS(lang);
  return (
    <div
      style={{
        display: "grid",
        gap: compact ? 8 : "clamp(10px,1.2vw,16px)",
        gridTemplateColumns: compact ? "1fr 1fr" : "repeat(auto-fit,minmax(220px,1fr))",
      }}
    >
      {items.map(([n, title, sub]) => (
        <MenuCard key={n} href="/process" number={n} title={title} sub={sub} compact={compact} onSelect={onSelect} />
      ))}
    </div>
  );
}
