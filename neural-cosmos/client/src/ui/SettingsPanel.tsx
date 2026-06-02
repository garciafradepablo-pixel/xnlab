/** Settings — language, render quality (bloom / particle budget) and data
 *  portability (import / export the current universe as JSON). */
import { useRef } from "react";
import { useUniverse } from "../store/universe";
import BottomSheet from "./BottomSheet";
import { t } from "./strings";

export default function SettingsPanel({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const lang = useUniverse((s) => s.lang);
  const setLang = useUniverse((s) => s.setLang);
  const lowPower = useUniverse((s) => s.lowPower);
  const setLowPower = useUniverse((s) => s.setLowPower);
  const bloom = useUniverse((s) => s.bloom);
  const setBloom = useUniverse((s) => s.setBloom);
  const exportSnapshot = useUniverse((s) => s.exportSnapshot);
  const importIntoCurrent = useUniverse((s) => s.importIntoCurrent);

  const fileRef = useRef<HTMLInputElement>(null);

  const onExport = () => {
    const snap = exportSnapshot();
    if (!snap) return;
    const blob = new Blob([JSON.stringify(snap, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${snap.universe.name.replace(/\s+/g, "-").toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const onImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    try {
      const parsed = JSON.parse(await f.text());
      await importIntoCurrent({
        entities: parsed.entities ?? [],
        threads: parsed.threads ?? [],
      });
    } catch {
      /* invalid file — ignored */
    }
  };

  return (
    <BottomSheet open={open} onClose={onClose} title={t("navSettings", lang)}>
      <div className="field">
        <span className="label">{t("language", lang)}</span>
        <div className="chips">
          <button
            className={`chip ${lang === "es" ? "active" : ""}`}
            onClick={() => setLang("es")}
          >
            Español
          </button>
          <button
            className={`chip ${lang === "en" ? "active" : ""}`}
            onClick={() => setLang("en")}
          >
            English
          </button>
        </div>
      </div>
      <div className="field">
        <span className="label">{t("quality", lang)}</span>
        <div className="chips">
          <button
            className={`chip ${!lowPower ? "active" : ""}`}
            onClick={() => setLowPower(false)}
          >
            {t("high", lang)}
          </button>
          <button
            className={`chip ${lowPower ? "active" : ""}`}
            onClick={() => setLowPower(true)}
          >
            {t("performance", lang)}
          </button>
        </div>
      </div>
      <div className="field">
        <span className="label">{t("bloom", lang)}</span>
        <div className="chips">
          <button
            className={`chip ${bloom ? "active" : ""}`}
            onClick={() => setBloom(true)}
            disabled={lowPower}
          >
            On
          </button>
          <button
            className={`chip ${!bloom ? "active" : ""}`}
            onClick={() => setBloom(false)}
          >
            Off
          </button>
        </div>
      </div>
      <div className="field">
        <span className="label">{t("data", lang)}</span>
        <div className="chips">
          <button className="chip" onClick={onExport}>
            ⭱ {t("exportJson", lang)}
          </button>
          <button className="chip" onClick={() => fileRef.current?.click()}>
            ⭳ {t("importJson", lang)}
          </button>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          hidden
          onChange={onImportFile}
        />
      </div>
    </BottomSheet>
  );
}
