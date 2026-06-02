/**
 * Desktop bottom dock (the design's "Nodos principales" + "Accesos rápidos").
 * Hidden on mobile, where the floating toolbar already covers core actions.
 */
import { useRef } from "react";
import { ENTITY_STATUSES, STATUS_META } from "../types/domain";
import { useUniverse } from "../store/universe";
import { t } from "./strings";
import NebulaThumb from "./NebulaThumb";
import type { Panel } from "./panels";

export default function BottomDock({
  openPanel,
}: {
  openPanel: (p: Panel) => void;
}) {
  const lang = useUniverse((s) => s.lang);
  const entities = useUniverse((s) => s.entities);
  const select = useUniverse((s) => s.select);
  const setMode = useUniverse((s) => s.setMode);
  const setFocus = useUniverse((s) => s.setFocus);
  const setView = useUniverse((s) => s.setView);
  const openAtlas = useUniverse((s) => s.openAtlas);
  const exportSnapshot = useUniverse((s) => s.exportSnapshot);
  const importIntoCurrent = useUniverse((s) => s.importIntoCurrent);

  const fileRef = useRef<HTMLInputElement>(null);

  // major bodies first; fall back to the first few entities
  const galaxies = entities.filter((e) => e.state === "galaxy");
  const main = (galaxies.length ? galaxies : entities).slice(0, 6);

  const onExport = () => {
    const snap = exportSnapshot();
    if (!snap) return;
    const blob = new Blob([JSON.stringify(snap, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${snap.universe.name.replace(/\s+/g, "-").toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const onImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    try {
      const parsed = JSON.parse(await f.text());
      await importIntoCurrent({
        entities: parsed.entities ?? [],
        threads: parsed.threads ?? [],
      });
    } catch {
      /* invalid file — ignored */
    }
  };

  const aiSuggest = () => {
    const uid = useUniverse.getState().universe?.id;
    if (uid) openAtlas(uid);
  };

  return (
    <div className="dock">
      <div className="dock-nodes">
        <span className="label">{t("mainNodes", lang)}</span>
        <div className="dock-cards">
          {main.map((e) => {
            const st = STATUS_META[e.meta.status];
            return (
              <button
                key={e.id}
                className="dock-card"
                style={{ borderColor: `${e.archetype.color}66` }}
                onClick={() => select(e.id)}
              >
                <span
                  className="dock-card-accent"
                  style={{ background: e.archetype.color }}
                />
                <span
                  className="dock-card-art"
                  style={{
                    background: `radial-gradient(120% 120% at 50% 30%, ${e.archetype.color}26, transparent 70%)`,
                  }}
                >
                  <NebulaThumb
                    className="dock-card-img"
                    animal={e.archetype.animal}
                    color={e.archetype.color}
                    src={e.meta.imageUrl}
                  />
                </span>
                <span className="dock-card-name">{e.name}</span>
                {e.meta.role && <span className="meta">{e.meta.role}</span>}
                <span className="status-badge small" style={{ color: st.color, borderColor: st.color }}>
                  {st[lang]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="dock-actions">
        <span className="label">{t("quickActions", lang)}</span>
        <button className="dock-action" onClick={() => openPanel("add")}>
          ＋ {t("newNode", lang)}
        </button>
        <button className="dock-action" onClick={() => setMode("weave")}>
          ⟿ {t("newConnection", lang)}
        </button>
        <button className="dock-action" onClick={() => fileRef.current?.click()}>
          ⭳ {t("importJson", lang)}
        </button>
        <button className="dock-action" onClick={onExport}>
          ⭱ {t("exportJson", lang)}
        </button>
        <button className="dock-action" onClick={aiSuggest}>
          ◎ {t("aiSuggestions", lang)}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          hidden
          onChange={onImportFile}
        />
      </div>

      <div className="dock-legend">
        <span className="label">{t("statesLegend", lang)}</span>
        <div className="dock-legend-grid">
          {ENTITY_STATUSES.map((s) => (
            <span key={s} className="dock-legend-item">
              <span className="status-dot" style={{ background: STATUS_META[s].color }} />
              {STATUS_META[s][lang]}
            </span>
          ))}
        </div>
      </div>

      <button
        className="dock-view"
        onClick={() => {
          const core = entities.find((e) => e.state === "galaxy") ?? entities[0];
          if (core) {
            select(core.id);
            setFocus(core.id);
          }
          setView("galaxy");
        }}
      >
        <span className="label">{t("view3d", lang)}</span>
        <span className="dock-view-stage" aria-hidden>
          <span className="dock-view-orbit" />
          <span className="dock-view-core" />
        </span>
        <span className="dock-view-cta">{t("enter", lang)}</span>
      </button>
    </div>
  );
}
