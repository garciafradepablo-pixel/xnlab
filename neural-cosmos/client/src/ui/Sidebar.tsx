/**
 * Desktop navigation rail (the left sidebar in the design). Hidden on mobile —
 * phones keep the bottom toolbar. Each item opens a real surface; nothing is a
 * dead button.
 */
import { useUniverse } from "../store/universe";
import { t } from "./strings";
import type { Panel } from "./panels";

export default function Sidebar({
  panel,
  openPanel,
}: {
  panel: Panel;
  openPanel: (p: Panel) => void;
}) {
  const lang = useUniverse((s) => s.lang);
  const setFocus = useUniverse((s) => s.setFocus);
  const openAtlas = useUniverse((s) => s.openAtlas);

  const recenter = () => {
    const es = useUniverse.getState().entities;
    const core = es.find((e) => e.state === "galaxy") ?? es[0];
    setFocus(core ? core.id : null);
    openPanel("none");
  };

  const intelligence = () => {
    const uid = useUniverse.getState().universe?.id;
    if (uid) openAtlas(uid);
  };

  const items: {
    key: string;
    label: string;
    icon: string;
    onClick: () => void;
    active?: boolean;
  }[] = [
    { key: "galaxy", label: t("navGalaxy", lang), icon: "✦", onClick: recenter, active: panel === "none" },
    { key: "flows", label: t("navFlows", lang), icon: "⟿", onClick: () => openPanel("legend"), active: panel === "legend" },
    { key: "nodes", label: t("navNodes", lang), icon: "◉", onClick: () => openPanel("nodes"), active: panel === "nodes" },
    { key: "docs", label: t("navDocuments", lang), icon: "▤", onClick: () => openPanel("docs"), active: panel === "docs" },
    { key: "intel", label: t("navIntelligence", lang), icon: "◎", onClick: intelligence },
    { key: "history", label: t("navHistory", lang), icon: "◷", onClick: () => openPanel("history"), active: panel === "history" },
    { key: "settings", label: t("navSettings", lang), icon: "⚙", onClick: () => openPanel("settings"), active: panel === "settings" },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">01</div>
      <nav className="sidebar-nav">
        {items.map((it) => (
          <button
            key={it.key}
            className={`side-item ${it.active ? "active" : ""}`}
            onClick={it.onClick}
          >
            <span className="side-ico">{it.icon}</span>
            <span className="side-label">{it.label}</span>
          </button>
        ))}
      </nav>
      <div className="sidebar-team">
        <span className="avatar" title="Pablo">P</span>
        <span className="avatar" title="Javi">J</span>
      </div>
    </aside>
  );
}
