import type { EatOption } from "../_lib/types";

// Quick, high-protein orders for eating out in Thailand. Thai keywords
// included so they can be pointed at / said out loud.

export const EAT_OUT: EatOption[] = [
  {
    id: "pad-krapow",
    name: "Pad Krapow doble carne + huevo",
    order:
      "Pad krapow con doble de carne (gai=pollo, moo=cerdo, nua=ternera) y arroz blanco.",
    add: "2 huevos fritos (kai dao). Pide “nam man noi” = poco aceite.",
    avoid: "Refrescos azucarados y exceso de salsa dulce.",
    protein: 55,
    kcal: 850,
  },
  {
    id: "khao-man-gai",
    name: "Khao Man Gai + pollo extra",
    order: "Khao man gai (arroz con pollo) con doble de pollo.",
    add: "Pide pechuga, caldo aparte y 1–2 huevos cocidos.",
    avoid: "Piel y grasa visible, salsa muy aceitosa.",
    protein: 50,
    kcal: 750,
  },
  {
    id: "arroz-pollo-huevo",
    name: "Arroz + pollo + huevo",
    order: "Arroz blanco grande, pollo a la plancha doble ración y huevo.",
    add: "Verduras al vapor o salteadas.",
    avoid: "Frituras y rebozados.",
    protein: 60,
    kcal: 800,
  },
  {
    id: "khao-pad-gai",
    name: "Arroz frito con pollo + huevo",
    order: "Khao pad gai con doble pollo y huevo extra.",
    add: "Pepino, lima y salsa de pescado aparte.",
    avoid: "Demasiado aceite — pide “nam man noi”.",
    protein: 50,
    kcal: 900,
  },
  {
    id: "noodles-carne-huevo",
    name: "Noodles con carne + huevo",
    order: "Pad see ew o guay teow con doble de carne y huevo.",
    add: "Verdura extra y proteína doble.",
    avoid: "Caldos muy grasos y exceso de salsa dulce.",
    protein: 45,
    kcal: 850,
  },
];
