/** Settings — language and render quality (bloom / particle budget). */
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
    </BottomSheet>
  );
}
