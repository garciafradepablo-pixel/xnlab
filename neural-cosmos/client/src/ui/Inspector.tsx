/**
 * The contextual surface for a selected entity. On mobile it's the bottom-sheet
 * that doubles as the "long-press menu"; on desktop it docks right. Holds the
 * life-cycle controls, the archetype/colour editor, zoom-in, black-hole /
 * rebirth, and the documents / decisions / history that persist to the backend.
 */
import { useMemo, useState } from "react";
import {
  KIND_LABELS,
  STAGES,
  STATE_LABELS,
  type AnimalArchetype,
  type EntityKind,
  stageIndex,
} from "../types/domain";
import { useUniverse } from "../store/universe";
import BottomSheet from "./BottomSheet";
import { t } from "./strings";

const ANIMALS: AnimalArchetype[] = ["none", "bull", "lion", "wolf", "eagle"];
const PALETTE = ["#b06cff", "#4ea6ff", "#3ddc84", "#ffcf5c", "#ff5470", "#f2f2ff"];
type Tab = "details" | "docs" | "decisions" | "history";

export default function Inspector() {
  const lang = useUniverse((s) => s.lang);
  const open = useUniverse((s) => s.inspectorOpen);
  const selectedId = useUniverse((s) => s.selectedId);
  const entity = useUniverse((s) =>
    s.entities.find((e) => e.id === s.selectedId),
  );
  const setInspectorOpen = useUniverse((s) => s.setInspectorOpen);
  const patchEntity = useUniverse((s) => s.patchEntity);
  const advance = useUniverse((s) => s.advanceState);
  const retreat = useUniverse((s) => s.retreatState);
  const enterChild = useUniverse((s) => s.enterChildUniverse);
  const blackhole = useUniverse((s) => s.sendToBlackHole);
  const rebirth = useUniverse((s) => s.rebirth);
  const addDoc = useUniverse((s) => s.addDoc);
  const addDecision = useUniverse((s) => s.addDecision);
  const openAtlas = useUniverse((s) => s.openAtlas);

  const [tab, setTab] = useState<Tab>("details");
  const [docTitle, setDocTitle] = useState("");
  const [docBody, setDocBody] = useState("");
  const [decTitle, setDecTitle] = useState("");
  const [decWhy, setDecWhy] = useState("");

  const idx = entity ? stageIndex(entity.state) : -1;
  const isSpecial = entity?.state === "blackhole" || entity?.state === "absorbed";
  const isAtlas = entity?.kind === "intelligence";

  const close = () => setInspectorOpen(false);

  // stable title even as the sheet animates closed
  const title = useMemo(
    () => entity?.name ?? t("inspector", lang),
    [entity?.name, lang],
  );

  if (!entity || !selectedId) {
    return <BottomSheet open={false} onClose={close} title={title} children={null} />;
  }

  return (
    <BottomSheet open={open} onClose={close} title={title}>
      <div className="tabbar">
        {(["details", "docs", "decisions", "history"] as Tab[]).map((tb) => (
          <button
            key={tb}
            className={`tab ${tab === tb ? "active" : ""}`}
            onClick={() => setTab(tb)}
          >
            {t(tb === "details" ? "details" : tb, lang)}
          </button>
        ))}
      </div>

      {tab === "details" && (
        <>
          <div className="row">
            <span className="meta">
              {STATE_LABELS[entity.state][lang]} · {KIND_LABELS[entity.kind][lang]}
            </span>
          </div>

          {isAtlas && (
            <>
              <p className="meta">{t("atlasHint", lang)}</p>
              <button
                className="btn primary"
                onClick={() => {
                  const uid = useUniverse.getState().universe?.id;
                  if (uid) openAtlas(uid);
                }}
              >
                ◎ {t("openAtlas", lang)}
              </button>
            </>
          )}

          {/* life-cycle */}
          <div className="field">
            <span className="label">{t("stage", lang)}</span>
            <div className="row">
              <button
                className="btn"
                onClick={() => retreat(entity.id)}
                disabled={isSpecial || idx <= 0}
              >
                ← {t("retreat", lang)}
              </button>
              <button
                className="btn"
                onClick={() => advance(entity.id)}
                disabled={isSpecial || idx < 0 || idx >= STAGES.length - 1}
              >
                {t("advance", lang)} →
              </button>
            </div>
          </div>

          {/* kind */}
          <div className="field">
            <span className="label">{t("kind", lang)}</span>
            <div className="chips">
              {(Object.keys(KIND_LABELS) as EntityKind[]).map((k) => (
                <button
                  key={k}
                  className={`chip ${entity.kind === k ? "active" : ""}`}
                  onClick={() => patchEntity(entity.id, { kind: k })}
                >
                  {KIND_LABELS[k][lang]}
                </button>
              ))}
            </div>
          </div>

          {/* archetype */}
          <div className="field">
            <span className="label">{t("archetype", lang)}</span>
            <div className="chips">
              {ANIMALS.map((a) => (
                <button
                  key={a}
                  className={`chip ${entity.archetype.animal === a ? "active" : ""}`}
                  onClick={() =>
                    patchEntity(entity.id, {
                      archetype: { ...entity.archetype, animal: a },
                    })
                  }
                >
                  {a}
                </button>
              ))}
            </div>
          </div>

          {/* colour / energy */}
          <div className="field">
            <span className="label">{t("color", lang)}</span>
            <div className="chips">
              {PALETTE.map((c) => (
                <button
                  key={c}
                  className={`chip ${entity.archetype.color === c ? "active" : ""}`}
                  onClick={() =>
                    patchEntity(entity.id, {
                      archetype: { ...entity.archetype, color: c },
                    })
                  }
                >
                  <span className="swatch" style={{ color: c }} />
                </button>
              ))}
            </div>
          </div>
          <div className="field">
            <span className="label">{t("energy", lang)}</span>
            <input
              value={entity.archetype.energy}
              onChange={(e) =>
                patchEntity(entity.id, {
                  archetype: { ...entity.archetype, energy: e.target.value },
                })
              }
            />
          </div>

          {/* actions */}
          <div className="row">
            <button className="btn primary" onClick={() => enterChild(entity.id)}>
              ⮣ {t("enter", lang)}
            </button>
            {entity.state === "blackhole" ? (
              <button className="btn" onClick={() => rebirth(entity.id)}>
                ✦ {t("rebirth", lang)}
              </button>
            ) : (
              <button className="btn danger" onClick={() => blackhole(entity.id)}>
                ◍ {t("blackhole", lang)}
              </button>
            )}
          </div>
        </>
      )}

      {tab === "docs" && (
        <>
          <div className="list">
            {entity.docs.length === 0 && (
              <p className="meta">{t("empty", lang)}</p>
            )}
            {entity.docs.map((d) => (
              <div key={d.id} className="card">
                <h4>{d.title}</h4>
                <p>{d.body}</p>
              </div>
            ))}
          </div>
          <div className="field">
            <span className="label">{t("addDoc", lang)}</span>
            <input
              placeholder={t("title", lang)}
              value={docTitle}
              onChange={(e) => setDocTitle(e.target.value)}
            />
            <textarea
              placeholder={t("body", lang)}
              value={docBody}
              onChange={(e) => setDocBody(e.target.value)}
            />
            <button
              className="btn primary"
              disabled={!docTitle.trim()}
              onClick={() => {
                addDoc(entity.id, { title: docTitle.trim(), body: docBody.trim() });
                setDocTitle("");
                setDocBody("");
              }}
            >
              {t("save", lang)}
            </button>
          </div>
        </>
      )}

      {tab === "decisions" && (
        <>
          <div className="list">
            {entity.decisions.length === 0 && (
              <p className="meta">{t("empty", lang)}</p>
            )}
            {entity.decisions.map((d) => (
              <div key={d.id} className="card">
                <h4>{d.title}</h4>
                <p>{d.rationale}</p>
              </div>
            ))}
          </div>
          <div className="field">
            <span className="label">{t("addDecision", lang)}</span>
            <input
              placeholder={t("title", lang)}
              value={decTitle}
              onChange={(e) => setDecTitle(e.target.value)}
            />
            <textarea
              placeholder={t("rationale", lang)}
              value={decWhy}
              onChange={(e) => setDecWhy(e.target.value)}
            />
            <button
              className="btn primary"
              disabled={!decTitle.trim()}
              onClick={() => {
                addDecision(entity.id, {
                  title: decTitle.trim(),
                  rationale: decWhy.trim(),
                });
                setDecTitle("");
                setDecWhy("");
              }}
            >
              {t("save", lang)}
            </button>
          </div>
        </>
      )}

      {tab === "history" && (
        <div className="list">
          {entity.history.length === 0 && (
            <p className="meta">{t("empty", lang)}</p>
          )}
          {[...entity.history].reverse().map((h) => (
            <div key={h.id} className="card">
              <p>
                <span className="meta">{h.kind}</span> — {h.message}
              </p>
              <span className="meta">
                {new Date(h.createdAt).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </BottomSheet>
  );
}
