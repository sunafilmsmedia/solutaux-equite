import type { CalculatorInput, CalculatorResult } from "@/types/calculator";
import { TIER_ACTIONS, TIER_LABELS } from "./scoring";
import {
  CREDIT_QUALITY_LABELS,
  EMPLOYMENT_LABELS,
  OWNERSHIP_DURATION_LABELS,
  PROPERTY_TYPE_LABELS,
  REFINANCE_HISTORY_LABELS,
} from "./format";

/**
 * Payload CRM (format GoHighLevel) construit à partir du lead.
 * C'est l'objet que le courtier veut récupérer.
 */
export interface CrmPayload {
  firstName: string;
  email: string;
  phone: string;
  postalCode: string;
  // Segmentation jour/nuit remontée au premier niveau pour être visible
  // directement dans le webhook GHL.
  periode: "jour" | "nuit";
  lead_type: "lead_jour" | "lead_nuit";
  tags: string[];
  customFields: Record<string, string | number>;
}

/**
 * Segmentation jour/nuit selon l'heure du Québec (America/Toronto — gère
 * automatiquement l'heure d'été/hiver). Jour = 8h à 20h, Nuit = 20h à 8h.
 */
export function getLeadPeriod(): { periode: "jour" | "nuit"; lead_type: "lead_jour" | "lead_nuit" } {
  const hourStr = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Toronto",
    hour: "2-digit",
    hourCycle: "h23",
  }).format(new Date());
  const hour = Number(hourStr) % 24;
  const isDay = hour >= 8 && hour < 20;
  return isDay
    ? { periode: "jour", lead_type: "lead_jour" }
    : { periode: "nuit", lead_type: "lead_nuit" };
}

export function buildCrmPayload(input: CalculatorInput, result: CalculatorResult): CrmPayload {
  const { periode, lead_type } = getLeadPeriod();

  const tags = [
    "Lead - Combien puis-je chercher",
    `Qualification - ${TIER_LABELS[result.tier]} (${result.tier})`,
    `Action - ${TIER_ACTIONS[result.tier]}`,
    "Propriétaire",
    PROPERTY_TYPE_LABELS[input.propertyType],
    `Crédit - ${CREDIT_QUALITY_LABELS[input.creditQuality]}`,
    `Emploi - ${EMPLOYMENT_LABELS[input.employmentStatus]}`,
    lead_type, // "lead_jour" ou "lead_nuit" — pour router le lead dans GHL
  ];

  if (input.mortgageBalanceIsEstimated) tags.push("solde-a-valider");
  if (input.refinanceHistory === "marge_ou_2e_hypotheque") tags.push("Marge ou 2e hypothèque");
  if (input.refinanceHistory === "moins_3_ans") tags.push("Refinancement récent (<3 ans)");

  return {
    firstName: input.firstName,
    email: input.email,
    phone: input.phone,
    postalCode: input.postalCode,
    periode,
    lead_type,
    tags,
    customFields: {
      propertyType: PROPERTY_TYPE_LABELS[input.propertyType],
      ownershipDuration: OWNERSHIP_DURATION_LABELS[input.ownershipDuration],
      refinanceHistory: REFINANCE_HISTORY_LABELS[input.refinanceHistory],
      creditQuality: CREDIT_QUALITY_LABELS[input.creditQuality],
      employmentStatus: EMPLOYMENT_LABELS[input.employmentStatus],

      propertyValue: input.propertyValue,
      mortgageBalance: result.mortgageBalance,
      mortgageBalanceIsEstimated: input.mortgageBalanceIsEstimated ? "Oui" : "Non",
      secondaryLienAmount: input.secondaryLienAmount ?? 0,

      maxRefinanceAmount: result.maxRefinanceAmount,
      securedLoans: result.securedLoans,
      availableEquity: result.availableEquity,
      currentLTV: Math.round(result.currentLTV * 1000) / 10, // en %
      coverageRatio: result.coverageRatio !== null ? Math.round(result.coverageRatio * 100) : "",

      totalDebtAmount: result.totalDebtAmount,
      currentDebtMonthlyPayment: result.currentDebtMonthlyPayment,
      estimatedMonthlySavings: result.estimatedMonthlySavings,

      equityRangeLow: result.equityRangeLow,
      equityRangeHigh: result.equityRangeHigh,

      qualificationTier: result.tier,
      qualificationLabel: TIER_LABELS[result.tier],
      qualificationAction: TIER_ACTIONS[result.tier],

      periode,
      lead_type,
    },
  };
}

export interface CrmSyncResult {
  ok: boolean;
  error?: string;
}

// Webhook GoHighLevel / LeadConnector (ou autre CRM) qui reçoit les leads —
// propre à ce déploiement, fourni via CRM_WEBHOOK_URL. Tant qu'il n'est pas
// branché, le lead est seulement logué côté serveur.
const CRM_WEBHOOK_URL = process.env.CRM_WEBHOOK_URL;

/**
 * Envoi du lead au CRM (POST JSON vers le webhook GoHighLevel/LeadConnector).
 * Un échec CRM ne doit jamais bloquer l'utilisateur (le lead est quand même
 * retourné à la personne). Tous les niveaux (A à D) sont envoyés — même D,
 * routé vers une séquence de nurture plutôt qu'un appel.
 */
export async function sendToCrm(payload: CrmPayload): Promise<CrmSyncResult> {
  if (!CRM_WEBHOOK_URL) {
    console.log("CRM_WEBHOOK_URL non défini — lead non envoyé, payload:", payload);
    return { ok: false, error: "CRM_WEBHOOK_URL_MISSING" };
  }
  try {
    const res = await fetch(CRM_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      return { ok: false, error: `CRM_SYNC_FAILED: HTTP ${res.status}` };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: `CRM_SYNC_FAILED: ${(e as Error).message}` };
  }
}
