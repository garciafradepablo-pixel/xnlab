/** Aggregate history across the universe, newest first (read-only). */
import { useUniverse } from "../store/universe";
import BottomSheet from "./BottomSheet";
import { t } from "./strings";

export default function HistoryPanel({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const lang = useUniverse((s) => s.lang);
  const entities = useUniverse((s) => s.entities);
  const inspect = useUniverse((s) => s.inspect);

  const events = entities
    .flatMap((e) => e.history.map((h) => ({ entity: e, h })))
    .sort((a, b) => b.h.createdAt.localeCompare(a.h.createdAt));

  return (
    <BottomSheet open={open} onClose={onClose} title={t("allHistory", lang)}>
      <div className="list">
        {events.length === 0 && <p className="meta">{t("empty", lang)}</p>}
        {events.map(({ entity, h }) => (
          <div key={h.id} className="card">
            <p>
              <button className="link" onClick={() => { inspect(entity.id); onClose(); }}>
                {entity.name}
              </button>{" "}
              <span className="meta">· {h.kind}</span> — {h.message}
            </p>
            <span className="meta">{new Date(h.createdAt).toLocaleString()}</span>
          </div>
        ))}
      </div>
    </BottomSheet>
  );
}
