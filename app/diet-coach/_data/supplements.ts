import type { Supplement } from "../_lib/types";

export const SUPPLEMENTS: Supplement[] = [
  {
    id: "creatina",
    name: "Creatina",
    dose: "5 g",
    timing: "Cualquier hora · a diario",
  },
  {
    id: "d3k2",
    name: "Vitamina D3 + K2",
    dose: "según envase",
    timing: "Con comida con grasa · si disponible",
    conditional: true,
  },
  {
    id: "omega3",
    name: "Omega-3",
    dose: "1–2 g",
    timing: "Con comida · si no comes pescado",
    conditional: true,
  },
  {
    id: "magnesio",
    name: "Magnesio",
    dose: "300–400 mg",
    timing: "Antes de dormir",
  },
  {
    id: "proteina",
    name: "Proteína en polvo",
    dose: "1 scoop",
    timing: "Solo si no llegas a 150 g",
    conditional: true,
  },
  {
    id: "preentreno",
    name: "Pre-entreno",
    dose: "1 dosis",
    timing: "Solo si hace falta",
    conditional: true,
  },
];
