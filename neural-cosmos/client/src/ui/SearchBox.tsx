/** Node search (the "Buscar nodo…" field). Type to match, tap a result to fly. */
import { useMemo, useState } from "react";
import { useUniverse } from "../store/universe";
import { t } from "./strings";

export default function SearchBox() {
  const lang = useUniverse((s) => s.lang);
  const entities = useUniverse((s) => s.entities);
  const inspect = useUniverse((s) => s.inspect);
  const [q, setQ] = useState("");
  const [focused, setFocused] = useState(false);

  const matches = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return [];
    return entities
      .filter(
        (e) =>
          e.name.toLowerCase().includes(term) ||
          e.meta.role.toLowerCase().includes(term),
      )
      .slice(0, 8);
  }, [q, entities]);

  return (
    <div className="search">
      <span className="search-ico">⌕</span>
      <input
        className="search-input"
        placeholder={t("searchNode", lang)}
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => setFocused(false), 150)}
      />
      {focused && matches.length > 0 && (
        <div className="search-results">
          {matches.map((e) => (
            <button
              key={e.id}
              className="search-result"
              onMouseDown={() => {
                inspect(e.id);
                setQ("");
              }}
            >
              <span className="swatch" style={{ color: e.archetype.color }} />
              {e.name}
              {e.meta.role && <span className="meta"> · {e.meta.role}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
