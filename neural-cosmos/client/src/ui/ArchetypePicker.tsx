/**
 * Archetype picker — Magic: The Gathering flavoured. A row of mana-colour
 * swatches (W/U/B/R/G + Gold + Colorless, plus a free custom colour) and a
 * character-select grid of creatures, each shown as its constellation tinted to
 * the chosen colour. Controlled: the parent owns {animal, color} so the same
 * picker drives both "create" (local state) and the inspector (live patch,
 * changeable any time).
 */
import type { CSSProperties } from "react";
import {
  ANIMALS,
  ANIMAL_LABELS,
  MANA,
  type AnimalArchetype,
} from "../types/domain";
import { useUniverse } from "../store/universe";
import { t } from "./strings";
import ConstellationGlyph from "./ConstellationGlyph";

export default function ArchetypePicker({
  animal,
  color,
  onAnimal,
  onColor,
}: {
  animal: AnimalArchetype;
  color: string;
  onAnimal: (a: AnimalArchetype) => void;
  onColor: (c: string) => void;
}) {
  const lang = useUniverse((s) => s.lang);

  return (
    <div className="archetype-picker">
      <div className="field">
        <span className="label">{t("color", lang)}</span>
        <div className="mana-row">
          {MANA.map((m) => (
            <button
              key={m.key}
              type="button"
              title={m.name[lang]}
              className={`mana-swatch ${
                color.toLowerCase() === m.hex.toLowerCase() ? "active" : ""
              }`}
              style={{ "--mana": m.hex } as CSSProperties}
              onClick={() => onColor(m.hex)}
            >
              <span className="mana-letter">{m.key}</span>
            </button>
          ))}
          <label
            className="mana-swatch custom"
            title={t("color", lang)}
            style={{ "--mana": color } as CSSProperties}
          >
            <span className="mana-letter">+</span>
            <input
              type="color"
              value={color}
              onChange={(e) => onColor(e.target.value)}
            />
          </label>
        </div>
      </div>

      <div className="field">
        <span className="label">{t("animal", lang)}</span>
        <div className="archetype-grid">
          {ANIMALS.map((a) => (
            <button
              key={a}
              type="button"
              className={`arch-card ${animal === a ? "active" : ""}`}
              style={{ "--mana": color } as CSSProperties}
              onClick={() => onAnimal(a)}
            >
              <ConstellationGlyph animal={a} color={color} />
              <span className="arch-name">{ANIMAL_LABELS[a][lang]}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
