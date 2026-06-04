/** Aggregate documents across every entity in the current universe (read-only). */
import { useUniverse } from "../store/universe";
import BottomSheet from "./BottomSheet";
import { t } from "./strings";

export default function DocsPanel({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const lang = useUniverse((s) => s.lang);
  const entities = useUniverse((s) => s.entities);
  const inspect = useUniverse((s) => s.inspect);

  const docs = entities.flatMap((e) =>
    e.docs.map((d) => ({ entity: e, doc: d })),
  );

  return (
    <BottomSheet open={open} onClose={onClose} title={t("allDocuments", lang)}>
      <div className="list">
        {docs.length === 0 && <p className="meta">{t("empty", lang)}</p>}
        {docs.map(({ entity, doc }) => (
          <div key={doc.id} className="card">
            <button className="link" onClick={() => { inspect(entity.id); onClose(); }}>
              {entity.name}
            </button>
            <h4>{doc.title}</h4>
            {doc.body && <p>{doc.body}</p>}
          </div>
        ))}
      </div>
    </BottomSheet>
  );
}
