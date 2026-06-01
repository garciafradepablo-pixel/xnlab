/**
 * The floating HUD: top bar (wordmark, zoom breadcrumbs, language), a contextual
 * weave-type picker (only while threading), and a bottom toolbar (navigate /
 * move / weave / recenter + new body + legend). Minimal, plegable, never covers
 * the canvas. Dispatches only store actions.
 */
import {
  THREAD_COLORS,
  THREAD_LABELS,
  THREAD_TYPES,
} from "../types/domain";
import { useUniverse } from "../store/universe";
import { t } from "./strings";
import SearchBox from "./SearchBox";
import type { Panel } from "./panels";

export default function HUD({ openPanel }: { openPanel: (p: Panel) => void }) {
  const lang = useUniverse((s) => s.lang);
  const setLang = useUniverse((s) => s.setLang);
  const mode = useUniverse((s) => s.mode);
  const setMode = useUniverse((s) => s.setMode);
  const crumbs = useUniverse((s) => s.breadcrumbs);
  const goToCrumb = useUniverse((s) => s.goToCrumb);
  const weaveType = useUniverse((s) => s.weaveType);
  const setWeaveType = useUniverse((s) => s.setWeaveType);
  const setFocus = useUniverse((s) => s.setFocus);

  const hint =
    mode === "weave"
      ? t("weaveHint", lang)
      : mode === "move"
        ? t("moveHint", lang)
        : t("navHint", lang);

  const recenter = () => {
    const es = useUniverse.getState().entities;
    const core =
      es.find((e) => e.state === "galaxy") ?? es[0];
    setFocus(core ? core.id : null);
  };

  return (
    <>
      <div className="hud-top">
        <span className="wordmark">
          NEURAL<span className="dot">·</span>COSMOS
        </span>
        <SearchBox />
        <button
          className="lang-toggle"
          onClick={() => setLang(lang === "es" ? "en" : "es")}
          aria-label="language"
        >
          {lang === "es" ? "EN" : "ES"}
        </button>
      </div>

      <nav className="hud-crumbs" aria-label="zoom trail">
        {crumbs.map((c, i) => (
          <span key={c.universeId} style={{ display: "contents" }}>
            {i > 0 && <span className="crumb-sep">›</span>}
            <button
              className={`crumb ${i === crumbs.length - 1 ? "current" : ""}`}
              onClick={() => goToCrumb(i)}
              disabled={i === crumbs.length - 1}
            >
              {c.name}
            </button>
          </span>
        ))}
      </nav>

      {/* contextual: pick the meaning of the thread you're about to weave */}
      {mode === "weave" && (
        <div className="weave-picker" role="listbox" aria-label="thread meaning">
          {THREAD_TYPES.map((type) => (
            <button
              key={type}
              className={`weave-chip ${weaveType === type ? "active" : ""}`}
              onClick={() => setWeaveType(type)}
              aria-selected={weaveType === type}
              title={THREAD_LABELS[type][lang]}
            >
              <span className="swatch" style={{ color: THREAD_COLORS[type] }} />
              {THREAD_LABELS[type][lang]}
            </button>
          ))}
        </div>
      )}

      <div className="hint">{hint}</div>

      <div className="hud-bottom">
        <div className="toolbar" role="toolbar">
          <button
            className={`tool ${mode === "navigate" ? "active" : ""}`}
            onClick={() => setMode("navigate")}
          >
            <span className="ico">✧</span>
            {t("navigate", lang)}
          </button>
          <button
            className={`tool ${mode === "move" ? "active" : ""}`}
            onClick={() => setMode("move")}
          >
            <span className="ico">✥</span>
            {t("move", lang)}
          </button>
          <button
            className={`tool ${mode === "weave" ? "active" : ""}`}
            onClick={() => setMode("weave")}
          >
            <span className="ico">⟿</span>
            {t("weave", lang)}
          </button>
          <button className="tool" onClick={recenter} title={t("recenter", lang)}>
            <span className="ico">◎</span>
            {t("recenter", lang)}
          </button>
          <button className="tool primary" onClick={() => openPanel("add")}>
            <span className="ico">＋</span>
            {t("add", lang)}
          </button>
          <button className="tool" onClick={() => openPanel("legend")}>
            <span className="ico">☰</span>
            {t("legend", lang)}
          </button>
        </div>
      </div>
    </>
  );
}
