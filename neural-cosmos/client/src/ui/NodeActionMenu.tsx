/**
 * Radial action menu — summoned at a selected node (navigate mode). It replaces
 * the auto-opening inspector: the quick gestures (details · enter · weave ·
 * evolve · black hole) fan out around the body, and the hub deselects.
 *
 * Pure DOM — rendered inside a drei <Html> anchored to the body in 3D.
 */
import { useUniverse } from "../store/universe";
import type { Lang } from "../store/universe";
import type { Entity } from "../types/domain";

type ActionKey =
  | "details"
  | "enter"
  | "weave"
  | "evolve"
  | "blackhole"
  | "rebirth";

const COPY: Record<ActionKey, { en: string; es: string; icon: string }> = {
  details: { en: "Details", es: "Detalles", icon: "☰" },
  enter: { en: "Enter", es: "Entrar", icon: "⤢" },
  weave: { en: "Weave", es: "Tejer", icon: "∿" },
  evolve: { en: "Evolve", es: "Evolucionar", icon: "↑" },
  blackhole: { en: "Black hole", es: "Agujero", icon: "◍" },
  rebirth: { en: "Rebirth", es: "Renacer", icon: "✦" },
};

export default function NodeActionMenu({ entity }: { entity: Entity }) {
  const lang = useUniverse((s) => s.lang) as Lang;
  const setInspectorOpen = useUniverse((s) => s.setInspectorOpen);
  const enterChild = useUniverse((s) => s.enterChildUniverse);
  const setMode = useUniverse((s) => s.setMode);
  const tapForWeave = useUniverse((s) => s.tapForWeave);
  const advanceState = useUniverse((s) => s.advanceState);
  const sendToBlackHole = useUniverse((s) => s.sendToBlackHole);
  const rebirth = useUniverse((s) => s.rebirth);
  const select = useUniverse((s) => s.select);

  const isBlackHole = entity.state === "blackhole";

  const actions: { key: ActionKey; run: () => void }[] = [
    { key: "details", run: () => setInspectorOpen(true) },
    { key: "enter", run: () => enterChild(entity.id) },
    {
      key: "weave",
      run: () => {
        setMode("weave");
        tapForWeave(entity.id);
      },
    },
    isBlackHole
      ? { key: "rebirth", run: () => rebirth(entity.id) }
      : { key: "evolve", run: () => advanceState(entity.id) },
    ...(isBlackHole
      ? []
      : [{ key: "blackhole" as const, run: () => sendToBlackHole(entity.id) }]),
  ];

  const n = actions.length;
  const R = 66;
  const start = 12; // degrees; +90° points down (screen y grows downward)
  const span = 156; // fan across the lower arc, leaving the label clear above

  return (
    <div className="radial-menu" onPointerDown={(e) => e.stopPropagation()}>
      <button
        type="button"
        className="radial-hub"
        title={lang === "es" ? "Cerrar" : "Close"}
        onClick={(e) => {
          e.stopPropagation();
          select(null);
        }}
      >
        ✕
      </button>
      {actions.map((a, i) => {
        const ang = ((start + (span * i) / (n - 1)) * Math.PI) / 180;
        const x = Math.cos(ang) * R;
        const y = Math.sin(ang) * R;
        const label = COPY[a.key][lang];
        return (
          <button
            type="button"
            key={a.key}
            className="radial-act"
            style={{ left: `${x}px`, top: `${y}px`, animationDelay: `${i * 35}ms` }}
            title={label}
            onClick={(e) => {
              e.stopPropagation();
              a.run();
            }}
          >
            <span className="radial-ico">{COPY[a.key].icon}</span>
            <span className="radial-lbl">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
