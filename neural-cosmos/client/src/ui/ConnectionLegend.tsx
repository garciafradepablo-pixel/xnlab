/**
 * "Tipos de conexión" — the persistent, glassy connection-type legend that
 * floats over the canvas (top-left) on desktop, exactly as in the design. On
 * mobile this lives inside the Legend bottom-sheet instead, so this is hidden.
 */
import { THREAD_COLORS, THREAD_LABELS, THREAD_TYPES } from "../types/domain";
import { useUniverse } from "../store/universe";
import { t } from "./strings";

export default function ConnectionLegend() {
  const lang = useUniverse((s) => s.lang);
  return (
    <aside className="conn-legend" aria-label={t("connectionTypes", lang)}>
      <span className="conn-legend-title">{t("connectionTypes", lang)}</span>
      <div className="conn-legend-list">
        {THREAD_TYPES.map((type) => (
          <span key={type} className="conn-legend-row">
            <span className="conn-legend-line" style={{ background: THREAD_COLORS[type] }} />
            <span className="conn-legend-label">{THREAD_LABELS[type][lang]}</span>
          </span>
        ))}
      </div>
    </aside>
  );
}
