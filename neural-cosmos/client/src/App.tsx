import { useEffect, useState } from "react";
import CosmosCanvas from "./engine/CosmosCanvas";
import HUD from "./ui/HUD";
import Inspector from "./ui/Inspector";
import Legend from "./ui/Legend";
import AddEntity from "./ui/AddEntity";
import { useUniverse } from "./store/universe";
import { t } from "./ui/strings";
import "./ui/ui.css";

export default function App() {
  const status = useUniverse((s) => s.status);
  const error = useUniverse((s) => s.error);
  const lang = useUniverse((s) => s.lang);
  const loadRoot = useUniverse((s) => s.loadRoot);

  const [sheet, setSheet] = useState<"none" | "legend" | "add">("none");

  useEffect(() => {
    loadRoot();
  }, [loadRoot]);

  return (
    <>
      {/* Canvas mounts once the first load succeeds (entities are present). */}
      {status !== "error" && <CosmosCanvas />}

      {(status === "loading" || status === "idle") && (
        <div className="centered">
          <span className="display">{t("loading", lang)}</span>
        </div>
      )}

      {status === "error" && (
        <div className="centered">
          <h1 className="display">{t("errorTitle", lang)}</h1>
          <p className="meta">{error}</p>
          <button className="btn primary" onClick={() => loadRoot()}>
            {t("retry", lang)}
          </button>
        </div>
      )}

      {status === "ready" && (
        <>
          <HUD
            openLegend={() => setSheet("legend")}
            openAdd={() => setSheet("add")}
          />
          <Inspector />
          <Legend open={sheet === "legend"} onClose={() => setSheet("none")} />
          <AddEntity open={sheet === "add"} onClose={() => setSheet("none")} />
        </>
      )}
    </>
  );
}
