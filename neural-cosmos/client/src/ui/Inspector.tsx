/**
 * Entity inspector — the right-hand panel from the design. Bottom-sheet on
 * mobile, docked panel on desktop. Shows the archetype image, colour / animal /
 * symbol controls, and tabs: Información (description, function, tags, the
 * status / priority / potential / risk grid, lifecycle, decisions), Conexiones,
 * Documentos, Historial. Dispatches only store actions.
 */
import { useState, type ChangeEvent } from "react";
import {
  ENTITY_STATUSES,
  GRADE_LABELS,
  KIND_LABELS,
  STAGES,
  STATE_LABELS,
  STATUS_META,
  THREAD_COLORS,
  THREAD_LABELS,
  type AnimalArchetype,
  type EntityKind,
  type EntityMeta,
  type EntityStatus,
  type Grade,
  stageIndex,
} from "../types/domain";
import { useUniverse } from "../store/universe";
import BottomSheet from "./BottomSheet";
import { t } from "./strings";

const ANIMALS: AnimalArchetype[] = ["none", "bull", "lion", "wolf", "eagle"];
const PALETTE = ["#b06cff", "#4ea6ff", "#3ddc84", "#ffcf5c", "#ff5470", "#f2f2ff"];
const GRADES_3: Grade[] = ["low", "medium", "high"];
const GRADES_4: Grade[] = ["low", "medium", "high", "very-high"];
type Tab = "info" | "connections" | "docs" | "history";

export default function Inspector() {
  const lang = useUniverse((s) => s.lang);
  const open = useUniverse((s) => s.inspectorOpen);
  const selectedId = useUniverse((s) => s.selectedId);
  const entity = useUniverse((s) =>
    s.entities.find((e) => e.id === s.selectedId),
  );
  const entities = useUniverse((s) => s.entities);
  const threads = useUniverse((s) => s.threads);
  const setInspectorOpen = useUniverse((s) => s.setInspectorOpen);
  const patchEntity = useUniverse((s) => s.patchEntity);
  const advance = useUniverse((s) => s.advanceState);
  const retreat = useUniverse((s) => s.retreatState);
  const enterChild = useUniverse((s) => s.enterChildUniverse);
  const blackhole = useUniverse((s) => s.sendToBlackHole);
  const rebirth = useUniverse((s) => s.rebirth);
  const addDoc = useUniverse((s) => s.addDoc);
  const addDecision = useUniverse((s) => s.addDecision);
  const removeThread = useUniverse((s) => s.removeThread);
  const openAtlas = useUniverse((s) => s.openAtlas);
  const select = useUniverse((s) => s.select);

  const [tab, setTab] = useState<Tab>("info");
  const [docTitle, setDocTitle] = useState("");
  const [docBody, setDocBody] = useState("");
  const [decTitle, setDecTitle] = useState("");
  const [decWhy, setDecWhy] = useState("");
  const [tagInput, setTagInput] = useState("");

  const close = () => setInspectorOpen(false);

  if (!entity || !selectedId) {
    return <BottomSheet open={false} onClose={close} title="" children={null} />;
  }

  const meta = entity.meta;
  const idx = stageIndex(entity.state);
  const isSpecial = entity.state === "blackhole" || entity.state === "absorbed";
  const isAtlas = entity.kind === "intelligence";
  const statusInfo = STATUS_META[meta.status];

  const patchMeta = (m: Partial<EntityMeta>) =>
    patchEntity(entity.id, { meta: { ...meta, ...m } });

  // upload a local image file → downscaled, compressed data URL (no hosting,
  // and small enough to persist in localStorage alongside the rest of the world)
  const onImageFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const max = 768;
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const w = Math.max(1, Math.round(img.width * scale));
        const h = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        canvas.getContext("2d")?.drawImage(img, 0, 0, w, h);
        let url = canvas.toDataURL("image/webp", 0.85);
        if (!url.startsWith("data:image/webp")) url = canvas.toDataURL("image/png");
        patchMeta({ imageUrl: url });
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  const connections = threads.filter(
    (t) => t.fromId === entity.id || t.toId === entity.id,
  );
  const nameOf = (id: string) =>
    entities.find((e) => e.id === id)?.name ?? "—";

  return (
    <BottomSheet open={open} onClose={close} title={entity.name}>
      {/* status + classification */}
      <div className="row" style={{ justifyContent: "space-between" }}>
        <div className="chips">
          <span className="chip">{KIND_LABELS[entity.kind][lang]}</span>
          {meta.role && <span className="chip">{meta.role}</span>}
        </div>
        <span
          className="status-badge"
          style={{ color: statusInfo.color, borderColor: statusInfo.color }}
        >
          <span className="dot" style={{ background: statusInfo.color }} />
          {statusInfo[lang]}
        </span>
      </div>

      {/* archetype image — "Cambiar imagen": click to upload, or paste a URL */}
      <label
        className="inspector-image"
        title={t("uploadImage", lang)}
        style={{
          cursor: "pointer",
          background: meta.imageUrl
            ? `center/cover no-repeat url("${meta.imageUrl}")`
            : `radial-gradient(120% 120% at 50% 35%, ${entity.archetype.color}33, transparent 70%)`,
        }}
      >
        {!meta.imageUrl && (
          <span className="inspector-image-empty display">
            {entity.archetype.animal === "none"
              ? "—"
              : entity.archetype.animal.toUpperCase()}
          </span>
        )}
        <span className="inspector-image-cta">{t("changeImage", lang)}</span>
        <input type="file" accept="image/*" hidden onChange={onImageFile} />
      </label>
      <label className="field">
        <span className="label">{t("imageUrl", lang)}</span>
        <input
          placeholder="https://…"
          value={meta.imageUrl?.startsWith("data:") ? "" : meta.imageUrl ?? ""}
          onChange={(e) => patchMeta({ imageUrl: e.target.value || undefined })}
        />
      </label>
      {meta.imageUrl && (
        <button className="btn ghost sm" onClick={() => patchMeta({ imageUrl: undefined })}>
          {t("removeImage", lang)}
        </button>
      )}

      {/* colour · animal · symbol */}
      <div className="trio">
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
            <label className="chip color-pick" style={{ color: entity.archetype.color }}>
              <span className="swatch" style={{ color: entity.archetype.color }} />
              <input
                type="color"
                value={entity.archetype.color}
                onChange={(e) =>
                  patchEntity(entity.id, {
                    archetype: { ...entity.archetype, color: e.target.value },
                  })
                }
              />
            </label>
          </div>
        </div>
        <div className="field">
          <span className="label">{t("animal", lang)}</span>
          <select
            value={entity.archetype.animal}
            onChange={(e) =>
              patchEntity(entity.id, {
                archetype: {
                  ...entity.archetype,
                  animal: e.target.value as AnimalArchetype,
                },
              })
            }
          >
            {ANIMALS.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <span className="label">{t("symbol", lang)}</span>
          <input
            value={meta.symbol ?? ""}
            maxLength={3}
            onChange={(e) => patchMeta({ symbol: e.target.value || undefined })}
          />
        </div>
      </div>

      <div className="tabbar">
        {(
          [
            ["info", t("information", lang)],
            ["connections", t("connections", lang)],
            ["docs", t("docs", lang)],
            ["history", t("history", lang)],
          ] as [Tab, string][]
        ).map(([tb, label]) => (
          <button
            key={tb}
            className={`tab ${tab === tb ? "active" : ""}`}
            onClick={() => setTab(tb)}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "info" && (
        <>
          <div className="field">
            <span className="label">{t("descriptionLabel", lang)}</span>
            <textarea
              value={meta.description}
              onChange={(e) => patchMeta({ description: e.target.value })}
            />
          </div>
          <div className="field">
            <span className="label">{t("functionLabel", lang)}</span>
            <textarea
              value={meta.purpose}
              onChange={(e) => patchMeta({ purpose: e.target.value })}
            />
          </div>

          {/* tags */}
          <div className="field">
            <span className="label">{t("tags", lang)}</span>
            <div className="chips">
              {meta.tags.map((tag) => (
                <button
                  key={tag}
                  className="chip active"
                  onClick={() =>
                    patchMeta({ tags: meta.tags.filter((x) => x !== tag) })
                  }
                  title="✕"
                >
                  {tag} ✕
                </button>
              ))}
              <input
                className="tag-input"
                placeholder={t("addTag", lang)}
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && tagInput.trim()) {
                    patchMeta({ tags: [...meta.tags, tagInput.trim()] });
                    setTagInput("");
                  }
                }}
              />
            </div>
          </div>

          {/* status / priority / potential / risk grid */}
          <div className="meta-grid">
            <label className="field">
              <span className="label">{t("status", lang)}</span>
              <select
                value={meta.status}
                onChange={(e) =>
                  patchMeta({ status: e.target.value as EntityStatus })
                }
              >
                {ENTITY_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_META[s][lang]}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span className="label">{t("priority", lang)}</span>
              <select
                value={meta.priority}
                onChange={(e) => patchMeta({ priority: e.target.value as Grade })}
              >
                {GRADES_3.map((g) => (
                  <option key={g} value={g}>
                    {GRADE_LABELS[g][lang]}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span className="label">{t("potential", lang)}</span>
              <select
                value={meta.potential}
                onChange={(e) => patchMeta({ potential: e.target.value as Grade })}
              >
                {GRADES_4.map((g) => (
                  <option key={g} value={g}>
                    {GRADE_LABELS[g][lang]}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span className="label">{t("risk", lang)}</span>
              <select
                value={meta.risk}
                onChange={(e) => patchMeta({ risk: e.target.value as Grade })}
              >
                {GRADES_3.map((g) => (
                  <option key={g} value={g}>
                    {GRADE_LABELS[g][lang]}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span className="label">{t("createdBy", lang)}</span>
              <input
                value={meta.createdBy}
                onChange={(e) => patchMeta({ createdBy: e.target.value })}
              />
            </label>
            <label className="field">
              <span className="label">{t("role", lang)}</span>
              <input
                value={meta.role}
                onChange={(e) => patchMeta({ role: e.target.value })}
              />
            </label>
          </div>

          {/* kind + cosmic lifecycle (drives the 3D form) */}
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
          <div className="field">
            <span className="label">
              {t("stage", lang)} · {STATE_LABELS[entity.state][lang]}
            </span>
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
            {isAtlas && (
              <button
                className="btn"
                onClick={() => {
                  const uid = useUniverse.getState().universe?.id;
                  if (uid) openAtlas(uid);
                }}
              >
                ◎ {t("atlasConsole", lang)}
              </button>
            )}
          </div>

          {/* decisions — strategic memory */}
          <div className="field">
            <span className="label">{t("decisions", lang)}</span>
            <div className="list">
              {entity.decisions.map((d) => (
                <div key={d.id} className="card">
                  <h4>{d.title}</h4>
                  {d.rationale && <p>{d.rationale}</p>}
                </div>
              ))}
            </div>
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
              className="btn"
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
              {t("addDecision", lang)}
            </button>
          </div>
        </>
      )}

      {tab === "connections" && (
        <div className="list">
          {connections.length === 0 && (
            <p className="meta">{t("noConnections", lang)}</p>
          )}
          {connections.map((c) => {
            const otherId = c.fromId === entity.id ? c.toId : c.fromId;
            const outbound = c.fromId === entity.id;
            return (
              <div key={c.id} className="card">
                <div className="row" style={{ justifyContent: "space-between" }}>
                  <span>
                    <span className="swatch" style={{ color: THREAD_COLORS[c.type] }} />
                    {outbound ? "→ " : "← "}
                    <button
                      className="link"
                      onClick={() => select(otherId)}
                    >
                      {nameOf(otherId)}
                    </button>
                  </span>
                  <button
                    className="chip"
                    onClick={() => removeThread(c.id)}
                    title="✕"
                  >
                    ✕
                  </button>
                </div>
                <span className="meta">{THREAD_LABELS[c.type][lang]}</span>
              </div>
            );
          })}
        </div>
      )}

      {tab === "docs" && (
        <>
          <div className="list">
            {entity.docs.length === 0 && <p className="meta">{t("empty", lang)}</p>}
            {entity.docs.map((d) => (
              <div key={d.id} className="card">
                <h4>{d.title}</h4>
                {d.body && <p>{d.body}</p>}
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

      {tab === "history" && (
        <div className="list">
          {entity.history.length === 0 && <p className="meta">{t("empty", lang)}</p>}
          {[...entity.history].reverse().map((hh) => (
            <div key={hh.id} className="card">
              <p>
                <span className="meta">{hh.kind}</span> — {hh.message}
              </p>
              <span className="meta">
                {new Date(hh.createdAt).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </BottomSheet>
  );
}
