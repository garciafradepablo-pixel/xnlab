import { useEffect, useState } from "react";
import CosmosCanvas from "./engine/CosmosCanvas";
import HUD from "./ui/HUD";
import Sidebar from "./ui/Sidebar";
import BottomDock from "./ui/BottomDock";
import Inspector from "./ui/Inspector";
import Legend from "./ui/Legend";
import AddEntity from "./ui/AddEntity";
import NodesPanel from "./ui/NodesPanel";
import DocsPanel from "./ui/DocsPanel";
import HistoryPanel from "./ui/HistoryPanel";
import SettingsPanel from "./ui/SettingsPanel";
import AtlasConsole from "./ui/AtlasConsole";
import Compass from "./ui/Compass";
import { useUniverse } from "./store/universe";
import { t } from "./ui/strings";
import type { Panel } from "./ui/panels";
import "./ui/ui.css";

export default function App() {
  const status = useUniverse((s) => s.status);
  const error = useUniverse((s) => s.error);
  const lang = useUniverse((s) => s.lang);
  const loadRoot = useUniverse((s) => s.loadRoot);

  const [panel, setPanel] = useState<Panel>("none");
  const close = () => setPanel("none");

  useEffect(() => {
    loadRoot();
  }, [loadRoot]);

  return (
    <>
      {status !== "error" && <CosmosCanvas />}
      {status === "ready" && <div className="vignette" aria-hidden />}

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
          <Sidebar panel={panel} openPanel={setPanel} />
          <HUD openPanel={setPanel} />
          <Compass />
          <BottomDock openPanel={setPanel} />

          <Inspector />
          <AtlasConsole />
          <Legend open={panel === "legend"} onClose={close} />
          <AddEntity open={panel === "add"} onClose={close} />
          <NodesPanel open={panel === "nodes"} onClose={close} />
          <DocsPanel open={panel === "docs"} onClose={close} />
          <HistoryPanel open={panel === "history"} onClose={close} />
          <SettingsPanel open={panel === "settings"} onClose={close} />
        </>
      )}
    </>
  );
}
