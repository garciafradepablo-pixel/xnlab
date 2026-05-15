"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
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
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState<MenuKey | null>(null);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

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
        borderBottom: scrolled || isMenuOpen ? "1px solid rgba(255,255,255,0.06)" : "1px solid transparent",
        background: scrolled || isMenuOpen ? "rgba(4,3,2,0.94)" : "transparent",
        backdropFilter: scrolled || isMenuOpen ? "blur(28px)" : "none",
        WebkitBackdropFilter: scrolled || isMenuOpen ? "blur(28px)" : "none",
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
        }}
      >
        <WordmarkLink />
        <div
          style={{
            display: "flex",
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
                  style={{
                    textDecoration: "none",
                    color: active ? "white" : "rgba(255,255,255,0.55)",
                    letterSpacing: active ? "0.28em" : "0.22em",
                    transition: "color 0.3s, letter-spacing 0.3s",
                  }}
                >
                  {it.label}
                </Link>
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "clamp(14px,2vw,22px)" }}>
          <AmbientAudio
            label={{
              on: lang === "en" ? "Atmosphere on" : "Atmósfera activa",
              off: lang === "en" ? "Atmosphere off" : "Atmósfera silenciosa",
            }}
          />
          <button
            onClick={() => set(lang === "en" ? "es" : "en")}
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
            }}
          >
            <span style={{ color: lang === "en" ? "white" : "rgba(255,255,255,0.25)", transition: "color 0.3s" }}>EN</span>
            <span style={{ color: "rgba(255,255,255,0.18)" }}>·</span>
            <span style={{ color: lang === "es" ? "white" : "rgba(255,255,255,0.25)", transition: "color 0.3s" }}>ES</span>
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            key={open}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
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
              {open === "worlds" && <WorldsMenu lang={lang} />}
              {open === "services" && <ServicesMenu lang={lang} />}
              {open === "process" && <ProcessMenu lang={lang} />}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function MenuCard({
  href,
  number,
  numberColor,
  title,
  meta,
  sub,
}: {
  href: string;
  number: string;
  numberColor?: string;
  title: string;
  meta?: string;
  sub: string;
}) {
  return (
    <Link
      href={href}
      style={{
        display: "block",
        padding: "clamp(16px,1.8vw,24px) clamp(16px,1.8vw,24px)",
        background: "rgba(255,255,255,0.025)",
        border: "1px solid rgba(255,255,255,0.05)",
        borderRadius: 4,
        textDecoration: "none",
        color: "inherit",
        transition: "background 0.3s, border-color 0.3s, transform 0.4s cubic-bezier(0.22,1,0.36,1)",
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
          marginBottom: 10,
        }}
      >
        {number}
      </p>
      <p
        style={{
          fontSize: 14.5,
          letterSpacing: "-0.005em",
          color: "white",
          fontWeight: 400,
          margin: 0,
          marginBottom: meta ? 6 : 4,
        }}
      >
        {title}
      </p>
      {meta && (
        <p
          style={{
            fontFamily: "var(--font-serif, Georgia)",
            fontStyle: "italic",
            fontSize: 13.5,
            color: "rgba(230,205,165,0.9)",
            margin: 0,
            marginBottom: 6,
          }}
        >
          {meta}
        </p>
      )}
      <p
        style={{
          fontSize: 11.5,
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

function WorldsMenu({ lang }: { lang: NavLang }) {
  return (
    <div
      style={{
        display: "grid",
        gap: "clamp(10px,1.2vw,16px)",
        gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))",
      }}
    >
      <MenuCard
        href="/worlds"
        number="00"
        title={lang === "en" ? "The Universe" : "El Universo"}
        sub={lang === "en" ? "Mythology and Cores" : "Mitología y Núcleos"}
      />
      {worlds.map((w) => (
        <MenuCard
          key={w.slug}
          href={`/worlds/${w.slug}`}
          number={w.number}
          numberColor={w.color.hex}
          title={w.title[lang]}
          sub={w.color.name}
        />
      ))}
    </div>
  );
}

function ServicesMenu({ lang }: { lang: NavLang }) {
  const items = SERVICES(lang);
  return (
    <div
      style={{
        display: "grid",
        gap: "clamp(10px,1.2vw,16px)",
        gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
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
        />
      ))}
    </div>
  );
}

function ProcessMenu({ lang }: { lang: NavLang }) {
  const items = MOVEMENTS(lang);
  return (
    <div
      style={{
        display: "grid",
        gap: "clamp(10px,1.2vw,16px)",
        gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
      }}
    >
      {items.map(([n, title, sub]) => (
        <MenuCard key={n} href="/process" number={n} title={title} sub={sub} />
      ))}
    </div>
  );
}
