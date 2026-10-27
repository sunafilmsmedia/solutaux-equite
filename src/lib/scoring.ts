import type { CalculatorInput, QualificationTier } from "@/types/calculator";
import type { CoreCalculations } from "./calculations";
import { calculatorConfig } from "./config";

/**
 * Classification du dossier en 4 niveaux (voir brief Michael) :
 *   🔥 A Chaud      — couverture ≥ 100 %, crédit bon/quelques retards, pas
 *                     de refinancement récent → appel 5 minutes.
 *   ✅ B Partiel    — équité > 0 mais couverture < 100 % → appel 1 heure.
 *   ⚠️ C Alternatif — ratio actuel entre 80 et 85 %, OU crédit refusé/
 *                     faillite, OU refinancement < 3 ans → Michael/Dufresne
 *                     évalue (prêteurs alternatifs, 2e rang).
 *   ❌ D Non qualifié — pas propriétaire (filtré en amont) OU ratio > 85 %
 *                     → séquence de nurture, pas d'appel.
 *
 * ⚠️ Les seuils du niveau C (altLenderMinLTV/MaxLTV) sont À CONFIRMER AVEC
 * MICHAEL — jusqu'où ses prêteurs alternatifs acceptent d'aller.
 */
export function classifyLead(input: CalculatorInput, calc: CoreCalculations): QualificationTier {
  const creditGood = input.creditQuality === "bon" || input.creditQuality === "quelques_retards";
  const creditBad = input.creditQuality === "refuse_banque" || input.creditQuality === "faillite";
  const recentRefinance = input.refinanceHistory === "moins_3_ans";

  if (calc.currentLTV > calculatorConfig.altLenderMaxLTV) return "D";

  if (calc.currentLTV >= calculatorConfig.altLenderMinLTV || creditBad || recentRefinance) {
    return "C";
  }

  const fullCoverage = calc.coverageRatio === null || calc.coverageRatio >= 1;
  if (fullCoverage && creditGood) return "A";

  return "B";
}

export const TIER_LABELS: Record<QualificationTier, string> = {
  A: "🔥 Chaud",
  B: "✅ Partiel",
  C: "⚠️ Alternatif",
  D: "❌ Non qualifié",
};

export const TIER_ACTIONS: Record<QualificationTier, string> = {
  A: "Appel dans les 5 minutes",
  B: "Appel dans l'heure",
  C: `${calculatorConfig.brokerName} ou ${calculatorConfig.altLenderPartnerName} évalue (prêteurs alternatifs, 2e rang)`,
  D: "Séquence de nurture, pas d'appel",
};
