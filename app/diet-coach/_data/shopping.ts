import type { ShopCategory, ShopDuration } from "../_lib/types";

export const SHOP_DURATIONS: ShopDuration[] = [3, 4, 7, 14, 30];

// Catalog of hotel staples. Quantities are a base for `perDays` days and
// are scaled to the chosen duration in the UI (see scaleQty).
export const SHOP: ShopCategory[] = [
  {
    id: "proteina",
    name: "Proteína",
    items: [
      { id: "huevos", name: "Huevos", qtyBase: 14, unit: "uds", perDays: 7, priority: "imprescindible", alt: "Claras de huevo" },
      { id: "leche", name: "Leche entera", qtyBase: 3.5, unit: "L", perDays: 7, priority: "imprescindible", alt: "Leche sin lactosa / bebida de soja" },
      { id: "atun", name: "Atún en lata", qtyBase: 7, unit: "latas", perDays: 7, priority: "imprescindible", alt: "Sardinas / caballa" },
      { id: "yogur", name: "Yogur griego", qtyBase: 7, unit: "uds", perDays: 7, priority: "recomendable", alt: "Skyr / yogur natural" },
      { id: "jamon", name: "Jamón cocido / serrano", qtyBase: 0.4, unit: "kg", perDays: 7, priority: "recomendable", alt: "Pavo / pollo fiambre" },
      { id: "queso", name: "Queso semicurado", qtyBase: 0.28, unit: "kg", perDays: 7, priority: "recomendable", alt: "Queso fresco batido" },
      { id: "wpi", name: "Proteína en polvo", qtyBase: 1, unit: "bote", perDays: 30, priority: "recomendable", alt: "Más comida sólida" },
    ],
  },
  {
    id: "carbohidratos",
    name: "Carbohidratos",
    items: [
      { id: "avena", name: "Avena", qtyBase: 0.7, unit: "kg", perDays: 7, priority: "imprescindible", alt: "Muesli sin azúcar" },
      { id: "arroz", name: "Arroz", qtyBase: 1, unit: "kg", perDays: 7, priority: "imprescindible", alt: "Fideos de arroz / patata" },
      { id: "miel", name: "Miel", qtyBase: 1, unit: "bote", perDays: 30, priority: "recomendable", alt: "Sirope / dátiles" },
      { id: "pan", name: "Pan integral", qtyBase: 1, unit: "barra", perDays: 7, priority: "opcional", alt: "Tortitas de arroz" },
    ],
  },
  {
    id: "frutas",
    name: "Frutas",
    items: [
      { id: "platanos", name: "Plátanos", qtyBase: 14, unit: "uds", perDays: 7, priority: "imprescindible", alt: "Mango / dátiles" },
      { id: "manzanas", name: "Manzanas", qtyBase: 7, unit: "uds", perDays: 7, priority: "recomendable", alt: "Pera / naranja" },
    ],
  },
  {
    id: "verduras",
    name: "Verduras",
    items: [
      { id: "pepino", name: "Pepino", qtyBase: 3, unit: "uds", perDays: 7, priority: "recomendable", alt: "Tomate" },
      { id: "zanahoria", name: "Zanahoria", qtyBase: 7, unit: "uds", perDays: 7, priority: "recomendable", alt: "Pimiento" },
      { id: "verdura-mix", name: "Verdura variada / congelada", qtyBase: 1, unit: "kg", perDays: 7, priority: "recomendable", alt: "Ensalada preparada" },
    ],
  },
  {
    id: "grasas",
    name: "Grasas saludables",
    items: [
      { id: "frutos-secos", name: "Frutos secos", qtyBase: 0.4, unit: "kg", perDays: 7, priority: "imprescindible", alt: "Mantequilla de cacahuete" },
      { id: "aceite", name: "Aceite de oliva", qtyBase: 1, unit: "botella", perDays: 30, priority: "recomendable", alt: "Aguacate" },
      { id: "aguacate", name: "Aguacate", qtyBase: 3, unit: "uds", perDays: 7, priority: "opcional", alt: "Aceitunas" },
    ],
  },
  {
    id: "bebidas",
    name: "Bebidas",
    items: [
      { id: "agua", name: "Agua embotellada", qtyBase: 21, unit: "L", perDays: 7, priority: "imprescindible", alt: "Agua filtrada" },
      { id: "remolacha", name: "Zumo de remolacha", qtyBase: 2, unit: "L", perDays: 7, priority: "recomendable", alt: "Remolacha cocida + batidora" },
      { id: "cafe", name: "Café / té", qtyBase: 1, unit: "paquete", perDays: 30, priority: "opcional", alt: "—" },
    ],
  },
  {
    id: "snacks",
    name: "Snacks",
    items: [
      { id: "tortitas", name: "Tortitas de arroz", qtyBase: 1, unit: "paquete", perDays: 7, priority: "opcional", alt: "Pan integral" },
      { id: "choco", name: "Chocolate negro 85%", qtyBase: 1, unit: "tableta", perDays: 7, priority: "opcional", alt: "Dátiles" },
      { id: "barritas", name: "Barritas de proteína", qtyBase: 4, unit: "uds", perDays: 7, priority: "opcional", alt: "Frutos secos" },
    ],
  },
  {
    id: "emergencias",
    name: "Emergencias",
    items: [
      { id: "atun-extra", name: "Atún extra (reserva)", qtyBase: 4, unit: "latas", perDays: 7, priority: "recomendable", alt: "Pollo en lata" },
      { id: "batido", name: "Batido proteico listo", qtyBase: 4, unit: "uds", perDays: 7, priority: "recomendable", alt: "Leche + proteína" },
      { id: "galletas-avena", name: "Galletas de avena", qtyBase: 1, unit: "paquete", perDays: 7, priority: "opcional", alt: "Plátano" },
    ],
  },
  {
    id: "suplementos",
    name: "Suplementos",
    items: [
      { id: "creatina", name: "Creatina monohidrato", qtyBase: 1, unit: "bote", perDays: 30, priority: "imprescindible", alt: "—" },
      { id: "d3k2", name: "Vitamina D3 + K2", qtyBase: 1, unit: "bote", perDays: 30, priority: "recomendable", alt: "Sol 20 min/día" },
      { id: "omega3", name: "Omega-3", qtyBase: 1, unit: "bote", perDays: 30, priority: "recomendable", alt: "Pescado azul 3×/sem" },
      { id: "magnesio", name: "Magnesio", qtyBase: 1, unit: "bote", perDays: 30, priority: "recomendable", alt: "Frutos secos + verdura" },
      { id: "multi", name: "Multivitamínico", qtyBase: 1, unit: "bote", perDays: 30, priority: "opcional", alt: "Dieta variada" },
    ],
  },
];

const DISCRETE = new Set(["uds", "latas"]);
const CONTAINER = new Set(["bote", "botella", "paquete", "tableta", "barra"]);

// Scale a base quantity to the chosen number of days and format it.
export function scaleQty(qtyBase: number, perDays: number, unit: string, days: number): string {
  const raw = (qtyBase * days) / perDays;
  if (DISCRETE.has(unit) || CONTAINER.has(unit)) {
    return `${Math.max(1, Math.round(raw))} ${unit}`;
  }
  // weight / volume — one decimal, never below a small minimum
  const rounded = Math.max(0.1, Math.round(raw * 10) / 10);
  return `${rounded} ${unit}`;
}
