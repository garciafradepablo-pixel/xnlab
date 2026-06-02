import {
  ENTITY_STATUSES,
  STAGES,
  STATE_LABELS,
  STATUS_META,
  THREAD_COLORS,
  THREAD_LABELS,
  THREAD_TYPES,
} from "../types/domain";
import { useUniverse } from "../store/universe";
import BottomSheet from "./BottomSheet";
import { t } from "./strings";

export default function Legend({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const lang = useUniverse((s) => s.lang);
  return (
    <BottomSheet open={open} onClose={onClose} title={t("legend", lang)}>
      <div className="field">
        <span className="label">{t("connectionTypes", lang)}</span>
        <div className="list">
          {THREAD_TYPES.map((type) => (
            <div key={type} className="row">
              <span className="swatch" style={{ color: THREAD_COLORS[type] }} />
              <span>{THREAD_LABELS[type][lang]}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="field">
        <span className="label">{t("statesLegend", lang)}</span>
        <div className="chips">
          {ENTITY_STATUSES.map((s) => (
            <span key={s} className="chip">
              <span className="swatch" style={{ color: STATUS_META[s].color }} />
              {STATUS_META[s][lang]}
            </span>
          ))}
        </div>
      </div>

      <div className="field">
        <span className="label">{t("lifecycle", lang)}</span>
        <div className="chips">
          {STAGES.map((s) => (
            <span key={s} className="chip">
              {STATE_LABELS[s][lang]}
            </span>
          ))}
          <span className="chip">{STATE_LABELS.blackhole[lang]}</span>
        </div>
      </div>
    </BottomSheet>
  );
}
