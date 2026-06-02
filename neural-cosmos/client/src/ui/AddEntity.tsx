import { useState } from "react";
import {
  KIND_LABELS,
  type AnimalArchetype,
  type EntityKind,
} from "../types/domain";
import { useUniverse } from "../store/universe";
import BottomSheet from "./BottomSheet";
import ArchetypePicker from "./ArchetypePicker";
import { t } from "./strings";

export default function AddEntity({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const lang = useUniverse((s) => s.lang);
  const addEntity = useUniverse((s) => s.addEntity);

  const [name, setName] = useState("");
  const [kind, setKind] = useState<EntityKind>("company");
  const [animal, setAnimal] = useState<AnimalArchetype>("none");
  const [color, setColor] = useState("#b06cff");

  const submit = () => {
    if (!name.trim()) return;
    const a = Math.random() * Math.PI * 2;
    const r = 8 + Math.random() * 8;
    addEntity({
      name: name.trim(),
      kind,
      state: "nebula",
      archetype: { animal, color, energy: "forming" },
      position: {
        x: Math.cos(a) * r,
        y: (Math.random() - 0.5) * 6,
        z: Math.sin(a) * r,
      },
    });
    setName("");
    setAnimal("none");
    onClose();
  };

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title={t("add", lang)}
      footer={
        <>
          <button className="btn ghost" onClick={onClose}>
            {t("close", lang)}
          </button>
          <button
            className="btn primary"
            onClick={submit}
            disabled={!name.trim()}
            style={{ marginLeft: "auto" }}
          >
            {t("create", lang)}
          </button>
        </>
      }
    >
      <div className="field">
        <span className="label">{t("name", lang)}</span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="…"
          autoFocus
        />
      </div>
      <div className="field">
        <span className="label">{t("kind", lang)}</span>
        <div className="chips">
          {(Object.keys(KIND_LABELS) as EntityKind[]).map((k) => (
            <button
              key={k}
              className={`chip ${kind === k ? "active" : ""}`}
              onClick={() => setKind(k)}
            >
              {KIND_LABELS[k][lang]}
            </button>
          ))}
        </div>
      </div>
      <ArchetypePicker
        animal={animal}
        color={color}
        onAnimal={setAnimal}
        onColor={setColor}
      />
    </BottomSheet>
  );
}
