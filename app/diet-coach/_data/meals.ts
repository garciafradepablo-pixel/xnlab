import type { Meal } from "../_lib/types";

// Base bulking plan. Calories / protein are deliberate approximations —
// this is a coaching tool, not a lab scale. Values are per the listed
// quantity. The dashboard sums only the meals you actually check off.

export const MEALS: Meal[] = [
  {
    id: "desayuno-hotel",
    name: "Desayuno hotel",
    when: "Al despertar",
    foods: [
      { name: "Sándwich de huevo y verduras", qty: "1 ud", kcal: 350, protein: 18 },
      { name: "Leche entera", qty: "500 ml", kcal: 320, protein: 16 },
      { name: "Avena", qty: "80–100 g", kcal: 350, protein: 12 },
      { name: "Plátano", qty: "1 ud", kcal: 105, protein: 1 },
      { name: "Miel", qty: "1 cda", kcal: 64, protein: 0 },
    ],
  },
  {
    id: "media-manana",
    name: "Media mañana",
    when: "+2–3 h",
    foods: [
      { name: "Yogur", qty: "1 ud", kcal: 120, protein: 8 },
      { name: "Frutos secos", qty: "30–40 g", kcal: 230, protein: 6 },
      { name: "Manzana", qty: "1 ud", kcal: 95, protein: 1 },
    ],
  },
  {
    id: "comida-fuera",
    name: "Comida fuera",
    when: "Mediodía",
    foods: [
      { name: "Arroz", qty: "ración grande", kcal: 320, protein: 6 },
      { name: "Doble pollo / ternera / cerdo magro", qty: "~250 g", kcal: 400, protein: 70 },
      { name: "Huevos", qty: "1–2 ud", kcal: 140, protein: 12 },
      { name: "Verduras", qty: "guarnición", kcal: 80, protein: 4 },
    ],
  },
  {
    id: "merienda-hotel",
    name: "Merienda hotel",
    when: "Tarde",
    foods: [
      { name: "Atún en lata", qty: "1 lata", kcal: 90, protein: 20 },
      { name: "Jamón", qty: "3–4 lonchas", kcal: 120, protein: 18 },
      { name: "Queso", qty: "30–40 g", kcal: 140, protein: 9 },
      { name: "Pepino y zanahoria", qty: "al gusto", kcal: 50, protein: 2 },
    ],
  },
  {
    id: "pre-entreno",
    name: "Pre-entreno",
    when: "2–3 h antes",
    foods: [
      { name: "Zumo de remolacha", qty: "250 ml", kcal: 110, protein: 2 },
      { name: "Plátano (si hace falta)", qty: "1 ud", kcal: 105, protein: 1 },
    ],
  },
  {
    id: "post-entreno",
    name: "Post-entreno",
    when: "Tras entrenar",
    foods: [
      { name: "Leche entera", qty: "500 ml", kcal: 320, protein: 16 },
      { name: "Avena", qty: "80–100 g", kcal: 350, protein: 12 },
      { name: "Miel", qty: "1 cda", kcal: 64, protein: 0 },
    ],
  },
  {
    id: "cena-fuera",
    name: "Cena fuera",
    when: "Noche",
    foods: [
      { name: "Arroz", qty: "ración grande", kcal: 320, protein: 6 },
      { name: "Carne o pollo", qty: "~200 g", kcal: 330, protein: 55 },
      { name: "Huevo", qty: "1 ud", kcal: 70, protein: 6 },
      { name: "Verduras", qty: "guarnición", kcal: 80, protein: 4 },
    ],
  },
  {
    id: "antes-de-dormir",
    name: "Antes de dormir",
    when: "Pre-sueño",
    foods: [
      { name: "Yogur", qty: "1 ud", kcal: 120, protein: 8 },
      { name: "Leche", qty: "250 ml", kcal: 160, protein: 8 },
      { name: "Frutos secos", qty: "30 g", kcal: 190, protein: 5 },
    ],
  },
];

// Daily nutrition targets (band).
export const TARGETS = {
  kcalMin: 3400,
  kcalMax: 3800,
  proteinMin: 150,
  proteinMax: 170,
  waterMl: 4000,
};
