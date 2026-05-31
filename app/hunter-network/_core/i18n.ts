// ---------------------------------------------------------------------------
// Hunter Network (HN) — bilingual dictionary (EN/ES)
//
// House rule 6: every user-facing string lives twice, translated for meaning
// not lexically. HN is an internal operating console, so the register is
// operational and terse — but still native on both sides.
//
// Enum *values* (status/level/risk) keep their canonical English keys in the
// data; this maps each key to a human label per language. UI never renders a
// raw enum key.
// ---------------------------------------------------------------------------

import type {
  BrandRiskLevel,
  CampaignRiskLevel,
  CampaignStatus,
  EvaluationStatus,
  HunterLevel,
  HunterStatus,
  LeadStatus,
  PaymentStatus,
} from "./types";

export type Lang = "en" | "es";

type Dict = {
  // chrome
  brand: string;
  tagline: string;
  back: string;
  mode_shadow: string;
  mode_live: string;
  // nav sections
  nav: {
    overview: string;
    hunters: string;
    evaluations: string;
    testCalls: string;
    campaigns: string;
    leads: string;
    ranking: string;
    settings: string;
  };
  // overview
  ov: {
    title: string;
    subtitle: string;
    liveFeed: string;
    liveFeedNote: string;
    runTick: string;
    running: string;
    recentCandidates: string;
    needReview: string;
    topHunters: string;
    riskyHunters: string;
    activeCampaigns: string;
    empty: string;
    stats: {
      total_hunters: string;
      pending_candidates: string;
      pending_access_evaluations: string;
      active_evaluations: string;
      approved_hunters: string;
      rejected_candidates: string;
      average_score: string;
      active_campaigns: string;
      assigned_leads: string;
      meetings_booked: string;
      brand_risk_alerts: string;
    };
  };
  labels: {
    score: string;
    level: string;
    status: string;
    brandRisk: string;
    reliability: string;
    country: string;
    campaign: string;
    minLevel: string;
    risk: string;
  };
};

export const HN_COPY: Record<Lang, Dict> = {
  en: {
    brand: "Hunter Network",
    tagline: "Private performance network · operator console",
    back: "← Connect",
    mode_shadow: "Shadow",
    mode_live: "Live",
    nav: {
      overview: "Overview",
      hunters: "Hunters",
      evaluations: "Evaluations",
      testCalls: "Test calls",
      campaigns: "Campaigns",
      leads: "Leads",
      ranking: "Ranking",
      settings: "Settings",
    },
    ov: {
      title: "Command center",
      subtitle: "The state of the network, right now. Performance buys campaigns — not payment.",
      liveFeed: "Live operations",
      liveFeedNote: "Autonomous engine. Every action the network takes appears here as it happens.",
      runTick: "Run a tick",
      running: "Running…",
      recentCandidates: "Recent candidates",
      needReview: "Evaluations needing review",
      topHunters: "Top hunters",
      riskyHunters: "Brand-risk hunters",
      activeCampaigns: "Active campaigns",
      empty: "Nothing yet.",
      stats: {
        total_hunters: "Total hunters",
        pending_candidates: "Pending candidates",
        pending_access_evaluations: "Pending access evals",
        active_evaluations: "Active evaluations",
        approved_hunters: "Approved hunters",
        rejected_candidates: "Rejected candidates",
        average_score: "Average score",
        active_campaigns: "Active campaigns",
        assigned_leads: "Assigned leads",
        meetings_booked: "Meetings booked",
        brand_risk_alerts: "Brand-risk alerts",
      },
    },
    labels: {
      score: "Score",
      level: "Level",
      status: "Status",
      brandRisk: "Brand risk",
      reliability: "Reliability",
      country: "Country",
      campaign: "Campaign",
      minLevel: "Min. level",
      risk: "Risk",
    },
  },
  es: {
    brand: "Hunter Network",
    tagline: "Red privada de rendimiento · consola de operador",
    back: "← Connect",
    mode_shadow: "Sombra",
    mode_live: "Real",
    nav: {
      overview: "Resumen",
      hunters: "Hunters",
      evaluations: "Evaluaciones",
      testCalls: "Llamadas",
      campaigns: "Campañas",
      leads: "Leads",
      ranking: "Ranking",
      settings: "Ajustes",
    },
    ov: {
      title: "Centro de mando",
      subtitle: "El estado de la red, ahora mismo. El rendimiento da campañas — no el pago.",
      liveFeed: "Operaciones en directo",
      liveFeedNote: "Motor autónomo. Cada acción de la red aparece aquí según ocurre.",
      runTick: "Avanzar un tick",
      running: "Corriendo…",
      recentCandidates: "Candidatos recientes",
      needReview: "Evaluaciones por revisar",
      topHunters: "Mejores hunters",
      riskyHunters: "Hunters en riesgo de marca",
      activeCampaigns: "Campañas activas",
      empty: "Nada todavía.",
      stats: {
        total_hunters: "Hunters totales",
        pending_candidates: "Candidatos pendientes",
        pending_access_evaluations: "Evals de acceso pendientes",
        active_evaluations: "Evaluaciones activas",
        approved_hunters: "Hunters aprobados",
        rejected_candidates: "Candidatos rechazados",
        average_score: "Score medio",
        active_campaigns: "Campañas activas",
        assigned_leads: "Leads asignados",
        meetings_booked: "Citas reservadas",
        brand_risk_alerts: "Alertas de riesgo de marca",
      },
    },
    labels: {
      score: "Score",
      level: "Nivel",
      status: "Estado",
      brandRisk: "Riesgo de marca",
      reliability: "Fiabilidad",
      country: "País",
      campaign: "Campaña",
      minLevel: "Nivel mín.",
      risk: "Riesgo",
    },
  },
};

// --- Enum label maps --------------------------------------------------------

export const HUNTER_STATUS_LABEL: Record<Lang, Record<HunterStatus, string>> = {
  en: {
    aspirant: "Aspirant",
    pending_access_payment: "Pending access payment",
    pending_audio: "Pending audio",
    pending_operator_review: "Pending operator review",
    ready_for_evaluation: "Ready for evaluation",
    in_evaluation: "In evaluation",
    under_review: "Under review",
    not_qualified: "Not qualified",
    trainee: "Trainee",
    junior: "Junior",
    active: "Active",
    hunter: "Hunter",
    partner: "Partner",
    suspended: "Suspended",
    banned: "Banned",
  },
  es: {
    aspirant: "Aspirante",
    pending_access_payment: "Pago de acceso pendiente",
    pending_audio: "Audio pendiente",
    pending_operator_review: "Revisión de operador pendiente",
    ready_for_evaluation: "Listo para evaluación",
    in_evaluation: "En evaluación",
    under_review: "En revisión",
    not_qualified: "No cualifica",
    trainee: "Trainee",
    junior: "Junior",
    active: "Activo",
    hunter: "Hunter",
    partner: "Partner",
    suspended: "Suspendido",
    banned: "Vetado",
  },
};

export const LEVEL_LABEL: Record<Lang, Record<HunterLevel, string>> = {
  en: { none: "—", trainee: "Trainee", junior: "Junior", active: "Active", hunter: "Hunter", partner: "Partner" },
  es: { none: "—", trainee: "Trainee", junior: "Junior", active: "Activo", hunter: "Hunter", partner: "Partner" },
};

export const BRAND_RISK_LABEL: Record<Lang, Record<BrandRiskLevel, string>> = {
  en: { low: "Low", medium: "Medium", high: "High", critical: "Critical" },
  es: { low: "Bajo", medium: "Medio", high: "Alto", critical: "Crítico" },
};

export const PAYMENT_LABEL: Record<Lang, Record<PaymentStatus, string>> = {
  en: { not_required: "Not required", pending: "Pending", paid: "Paid", failed: "Failed", refunded: "Refunded", waived: "Waived" },
  es: { not_required: "No requerido", pending: "Pendiente", paid: "Pagado", failed: "Fallido", refunded: "Reembolsado", waived: "Exento" },
};

export const EVAL_STATUS_LABEL: Record<Lang, Record<EvaluationStatus, string>> = {
  en: { pending: "Pending", ready: "Ready", in_progress: "In progress", completed: "Completed", under_review: "Under review", failed: "Failed", cancelled: "Cancelled" },
  es: { pending: "Pendiente", ready: "Lista", in_progress: "En curso", completed: "Completada", under_review: "En revisión", failed: "Fallida", cancelled: "Cancelada" },
};

export const CAMPAIGN_STATUS_LABEL: Record<Lang, Record<CampaignStatus, string>> = {
  en: { draft: "Draft", active: "Active", paused: "Paused", completed: "Completed", archived: "Archived" },
  es: { draft: "Borrador", active: "Activa", paused: "Pausada", completed: "Completada", archived: "Archivada" },
};

export const CAMPAIGN_RISK_LABEL: Record<Lang, Record<CampaignRiskLevel, string>> = {
  en: { low: "Low", medium: "Medium", high: "High", premium: "Premium" },
  es: { low: "Bajo", medium: "Medio", high: "Alto", premium: "Premium" },
};

export const LEAD_STATUS_LABEL: Record<Lang, Record<LeadStatus, string>> = {
  en: {
    new: "New", assigned: "Assigned", called: "Called", no_answer: "No answer", interested: "Interested",
    meeting_booked: "Meeting booked", not_interested: "Not interested", do_not_contact: "Do not contact",
    closed_won: "Closed won", closed_lost: "Closed lost", invalid: "Invalid",
  },
  es: {
    new: "Nuevo", assigned: "Asignado", called: "Llamado", no_answer: "Sin respuesta", interested: "Interesado",
    meeting_booked: "Cita reservada", not_interested: "No interesado", do_not_contact: "No contactar",
    closed_won: "Cerrado ganado", closed_lost: "Cerrado perdido", invalid: "Inválido",
  },
};
