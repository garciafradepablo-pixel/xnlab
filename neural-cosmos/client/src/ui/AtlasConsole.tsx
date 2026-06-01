/**
 * Atlas console (Phase 9). Lists the intelligence-force output grouped by region
 * — Success / Parity / Failure / Black hole — and lets you generate more via the
 * pluggable provider (a heuristic stub today; a model later) and triage status.
 * The UI is fully wired; only the generator behind it is a placeholder.
 */
import {
  ATLAS_KIND_LABELS,
  ATLAS_REGION_LABELS,
  ATLAS_TIER_LABELS,
  type AtlasAnalysis,
  type AtlasRegion,
} from "../types/domain";
import { useUniverse } from "../store/universe";
import BottomSheet from "./BottomSheet";
import { t } from "./strings";

const REGIONS: AtlasRegion[] = ["success", "parity", "failure", "blackhole"];

function Card({ a }: { a: AtlasAnalysis }) {
  const lang = useUniverse((s) => s.lang);
  const setStatus = useUniverse((s) => s.setAnalysisStatus);
  const dimmed = a.status === "dismissed";
  return (
    <div className="card" style={{ opacity: dimmed ? 0.5 : 1 }}>
      <div className="row" style={{ justifyContent: "space-between" }}>
        <span className="meta">
          {ATLAS_KIND_LABELS[a.kind][lang]} · {ATLAS_TIER_LABELS[a.tier][lang]}
          {a.subject ? ` · ${a.subject}` : ""}
        </span>
        {a.status === "acted" && <span className="meta">✓</span>}
      </div>
      <h4>{a.title}</h4>
      {a.body && <p>{a.body}</p>}
      <div className="row" style={{ marginTop: 8, gap: 6 }}>
        {a.status !== "acted" && (
          <button
            className="chip"
            onClick={() => setStatus(a.id, "acted")}
          >
            {t("acted", lang)}
          </button>
        )}
        {a.status !== "dismissed" ? (
          <button className="chip" onClick={() => setStatus(a.id, "dismissed")}>
            {t("dismiss", lang)}
          </button>
        ) : (
          <button className="chip" onClick={() => setStatus(a.id, "open")}>
            {t("reopen", lang)}
          </button>
        )}
      </div>
    </div>
  );
}

export default function AtlasConsole() {
  const lang = useUniverse((s) => s.lang);
  const open = useUniverse((s) => s.atlasOpen);
  const busy = useUniverse((s) => s.atlasBusy);
  const atlas = useUniverse((s) => s.atlas);
  const close = useUniverse((s) => s.closeAtlas);
  const generate = useUniverse((s) => s.generateAtlas);

  return (
    <BottomSheet
      open={open}
      onClose={close}
      title={t("atlasConsole", lang)}
      footer={
        <>
          <span className="meta" style={{ alignSelf: "center" }}>
            {t("scaffoldNote", lang)}
          </span>
          <button
            className="btn primary"
            onClick={() => generate()}
            disabled={busy}
            style={{ marginLeft: "auto" }}
          >
            {busy ? t("generating", lang) : t("generate", lang)}
          </button>
        </>
      }
    >
      {atlas.length === 0 && !busy && (
        <p className="meta">{t("noAnalyses", lang)}</p>
      )}
      {REGIONS.map((region) => {
        const items = atlas.filter((a) => a.region === region);
        if (items.length === 0) return null;
        const r = ATLAS_REGION_LABELS[region];
        return (
          <div key={region} className="field">
            <span className="label" style={{ color: r.color }}>
              <span className="swatch" style={{ color: r.color }} />
              {r[lang]} · {items.length}
            </span>
            <div className="list">
              {items.map((a) => (
                <Card key={a.id} a={a} />
              ))}
            </div>
          </div>
        );
      })}
    </BottomSheet>
  );
}
