"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import type { Project } from "./data";
import { ts, tsS, serif, W, R, useLang } from "../_lib/atoms";
import { LuxButton } from "../_lib/lux-button";
import { WordmarkLink } from "../_lib/wordmark";
import { OtherCorners } from "../_lib/other-corners";
import { SiteFooter } from "../_lib/site-footer";

const en = {
  eyebrow: "Applied Studies",
  heading1: "Applied",
  heading2: "studies.",
  intro:
    "The five-beat framework — Problem, Direction, System, Surfaces, Result — that every paid engagement passes through. Published openly while the work directed for clients remains under confidentiality.",
  closingEyebrow: "By appointment only · studio@xnlab.io",
  cta: "Write to the studio",
  back: "← Home",
  count: (n: number) => `${String(n).padStart(3, "0")} — Studies`,
};
const es = {
  eyebrow: "Estudios aplicados",
  heading1: "Estudios",
  heading2: "aplicados.",
  intro:
    "El marco de cinco compases — Problema, Dirección, Sistema, Superficies, Resultado — por el que pasa cada encargo. Publicados abiertamente mientras el trabajo dirigido para clientes permanece bajo confidencialidad.",
  closingEyebrow: "Solo con cita previa · studio@xnlab.io",
  cta: "Escribir al estudio",
  back: "← Inicio",
  count: (n: number) => `${String(n).padStart(3, "0")} — Estudios`,
};

function Row({ project, index, lang }: { project: Project; index: number; lang: "en" | "es" }) {
  const height = ["80vh", "70vh", "74vh"][index % 3];
  return (
    <Link href={`/studies/${project.slug}`} style={{ display: "block", color: "inherit", textDecoration: "none" }}>
      <R style={{ position: "relative", width: "100%", overflow: "hidden" }} delay={0}>
        <div style={{ position: "relative", height, minHeight: 420, width: "100%", overflow: "hidden" }}>
          <motion.div
            style={{ position: "absolute", inset: 0 }}
            initial={{ scale: 1.04 }}
            whileHover={{ scale: 1.04 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 2.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <Image
              src={project.hero}
              alt={project.title}
              fill
              sizes="100vw"
              style={{ objectFit: "cover", objectPosition: project.heroPosition ?? "center" }}
            />
          </motion.div>
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to bottom, rgba(4,3,2,0.5) 0%, rgba(4,3,2,0.08) 30%, rgba(4,3,2,0.75) 100%)",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "50%",
              transform: "translateY(-50%)",
              left: 0,
              right: 0,
              padding: "0 clamp(24px,4vw,56px)",
              textAlign: "center",
              zIndex: 10,
            }}
          >
            <p
              style={{
                fontSize: 10,
                fontWeight: 500,
                letterSpacing: "0.38em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.55)",
                textShadow: ts,
                marginBottom: 18,
              }}
            >
              {project.number} · {project.discipline} · {project.year}
            </p>
            <h3
              style={{
                fontSize: "clamp(1.8rem,3.6vw,4.4rem)",
                fontWeight: 400,
                lineHeight: 1.04,
                letterSpacing: "-0.04em",
                color: "white",
                textShadow: tsS,
                wordBreak: "break-word",
              }}
            >
              <W text={project.title} delay={0.12} />
            </h3>
            <motion.p
              style={{
                marginTop: 14,
                fontSize: "clamp(0.9rem,1.1vw,1.05rem)",
                lineHeight: 1.72,
                color: "rgba(255,255,255,0.66)",
                fontWeight: 300,
                letterSpacing: "0.02em",
                textShadow: ts,
                maxWidth: 640,
                marginInline: "auto",
              }}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, delay: 0.45 }}
            >
              {project.excerpt[lang]}
            </motion.p>
            <motion.p
              style={{
                marginTop: 22,
                fontSize: 10,
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.45)",
                textShadow: ts,
              }}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.4, delay: 0.7 }}
            >
              {lang === "en" ? "View world" : "Ver mundo"}
            </motion.p>
          </div>
        </div>
      </R>
    </Link>
  );
}

export default function WorkIndex({ projects }: { projects: Project[] }) {
  const [lang, setLang] = useLang();
  const t = lang === "en" ? en : es;
  return (
    <main
      style={{
        minHeight: "100vh",
        overflowX: "hidden",
        background: "transparent",
        color: "white",
        fontFamily: "var(--font-sans,'Inter','Helvetica Neue',sans-serif)",
      }}
    >
      <header
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 200,
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          background: "rgba(4,3,2,0.94)",
          backdropFilter: "blur(28px)",
          WebkitBackdropFilter: "blur(28px)",
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
          <Link
            href="/"
            style={{
              fontSize: 11,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.55)",
              textDecoration: "none",
            }}
          >
            {t.back}
          </Link>
          <button
            onClick={() => setLang(lang === "en" ? "es" : "en")}
            aria-label={lang === "en" ? "Switch to Spanish" : "Cambiar a inglés"}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 11,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              background: "none",
              border: "none",
              padding: 0,
              cursor: "pointer",
            }}
          >
            <span style={{ color: lang === "en" ? "white" : "rgba(255,255,255,0.35)" }}>EN</span>
            <span style={{ color: "rgba(255,255,255,0.25)" }}>·</span>
            <span style={{ color: lang === "es" ? "white" : "rgba(255,255,255,0.35)" }}>ES</span>
          </button>
        </nav>
      </header>

      <section
        style={{
          padding: "clamp(120px,16vh,180px) clamp(20px,5vw,64px) clamp(40px,6vw,72px)",
          textAlign: "center",
          position: "relative",
        }}
      >
        <div style={{ maxWidth: 880, margin: "0 auto" }}>
          <p
            style={{
              fontSize: 10,
              fontWeight: 500,
              letterSpacing: "0.38em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.5)",
              marginBottom: 24,
            }}
          >
            {t.count(projects.length)}
          </p>
          <h1
            style={{
              fontSize: "clamp(2.6rem,7.5vw,7.4rem)",
              fontWeight: 400,
              lineHeight: 0.92,
              letterSpacing: "-0.06em",
              textShadow: tsS,
              display: "flex",
              flexWrap: "wrap",
              alignItems: "baseline",
              justifyContent: "center",
              gap: "0.18em",
            }}
          >
            <W text={t.heading1} delay={0} />
            <span style={{ fontFamily: serif, fontStyle: "italic", color: "rgba(255,255,255,0.65)", fontSize: "1.18em" }}>
              <W text={t.heading2} delay={0.1} />
            </span>
          </h1>
          <R delay={0.2}>
            <p
              style={{
                marginTop: "clamp(24px,3vw,36px)",
                fontSize: "clamp(0.92rem,1.22vw,1.05rem)",
                lineHeight: 1.78,
                color: "rgba(255,255,255,0.55)",
                fontWeight: 300,
                textShadow: ts,
                maxWidth: 640,
                marginInline: "auto",
              }}
            >
              {t.intro}
            </p>
          </R>
        </div>
      </section>

      <section style={{ display: "flex", flexDirection: "column", gap: 1 }}>
        {projects.map((p, i) => (
          <Row key={p.slug} project={p} index={i} lang={lang} />
        ))}
      </section>

      <section
        style={{
          padding: "clamp(64px,9vw,120px) clamp(20px,5vw,64px)",
          textAlign: "center",
          borderTop: "1px solid rgba(255,255,255,0.04)",
        }}
      >
        <p
          style={{
            fontSize: 10,
            fontWeight: 500,
            letterSpacing: "0.32em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.42)",
            marginBottom: "clamp(20px,2.5vw,32px)",
          }}
        >
          {t.closingEyebrow}
        </p>
        <LuxButton href="/contact" variant="solid" arrow={false}>{t.cta}</LuxButton>
      </section>
      <OtherCorners lang={lang} exclude="studies" />
        <SiteFooter lang={lang} />
    </main>
  );
}
