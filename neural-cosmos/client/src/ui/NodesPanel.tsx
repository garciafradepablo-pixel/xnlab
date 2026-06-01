/**
 * "Nodos" — every body in the current universe as a list, with its status dot.
 * Tap to select + fly the camera to it.
 */
import { STATUS_META } from "../types/domain";
import { useUniverse } from "../store/universe";
import BottomSheet from "./BottomSheet";
import { t } from "./strings";

export default function NodesPanel({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const lang = useUniverse((s) => s.lang);
  const entities = useUniverse((s) => s.entities);
  const select = useUniverse((s) => s.select);

  return (
    <BottomSheet open={open} onClose={onClose} title={t("navNodes", lang)}>
      <div className="list">
        {entities.length === 0 && <p className="meta">{t("empty", lang)}</p>}
        {entities.map((e) => {
          const st = STATUS_META[e.meta.status];
          return (
            <button
              key={e.id}
              className="node-row"
              onClick={() => {
                select(e.id);
                onClose();
              }}
            >
              <span
                className="swatch"
                style={{ color: e.archetype.color }}
              />
              <span className="node-row-name">{e.name}</span>
              {e.meta.role && <span className="meta">{e.meta.role}</span>}
              <span className="status-dot" style={{ background: st.color }} title={st[lang]} />
            </button>
          );
        })}
      </div>
    </BottomSheet>
  );
}
