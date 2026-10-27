import type { QualificationTier } from "@/types/calculator";
import type { CoreCalculations } from "./calculations";
import { formatCurrency } from "./format";
import { calculatorConfig } from "./config";

export interface RecommendationContent {
  tier: QualificationTier;
  /** Phrase principale (façon « Robert, d'après tes réponses… »). */
  headline: string;
  /** Message de soutien, propre à chaque niveau. */
  bodyMessage: string;
  /** Vrai si on affiche les chiffres (équité / économie). Faux pour D. */
  showFigures: boolean;
  cta: string;
}

/**
 * Construit le message de résultat affiché au lead, dans le format validé
 * par Michael : prénom, fourchette d'équité, économie estimée, disclaimer,
 * puis CTA de réservation d'appel.
 */
export function buildRecommendation(
  firstName: string,
  calc: CoreCalculations,
  tier: QualificationTier
): RecommendationContent {
  const low = formatCurrency(calc.equityRangeLow);
  const high = formatCurrency(calc.equityRangeHigh);
  const savings = formatCurrency(calc.estimatedMonthlySavings);
  const hasSavings = calc.estimatedMonthlySavings > 0;
  const savingsPhrase = hasSavings
    ? `, et réduire tes paiements d'environ ${savings}/mois`
    : "";

  if (tier === "A" || tier === "B") {
    return {
      tier,
      headline: `${firstName}, d'après tes réponses, tu pourrais avoir accès à environ ${low} à ${high} sur ta maison${savingsPhrase}.`,
      bodyMessage:
        tier === "A"
          ? `C'est une estimation, pas une approbation. ${calculatorConfig.brokerName} va valider ton dossier avec toi.`
          : `Ton équité ne couvre pas la totalité de tes dettes, mais une consolidation partielle des dettes les plus chères pourrait déjà réduire tes paiements. ${calculatorConfig.brokerName} va regarder ça avec toi.`,
      showFigures: true,
      cta: "Réserve ton appel de 15 minutes",
    };
  }

  if (tier === "C") {
    return {
      tier,
      headline: `${firstName}, selon tes réponses, un refinancement standard ne semble pas s'appliquer directement à ta situation — mais ça ne veut pas dire que tes options s'arrêtent là.`,
      bodyMessage: `${calculatorConfig.brokerName} ou ${calculatorConfig.altLenderPartnerName} va analyser ton dossier pour voir si un prêteur alternatif (2e rang) pourrait débloquer environ ${low} à ${high}${savingsPhrase ? " et réduire tes paiements" : ""}. C'est une estimation, pas une approbation.`,
      showFigures: true,
      cta: "Réserve ton appel de 15 minutes",
    };
  }

  // D — non qualifié.
  return {
    tier,
    headline: `${firstName}, selon les informations fournies, il ne semble pas y avoir assez d'équité disponible sur ta propriété pour l'instant.`,
    bodyMessage:
      "Ça peut changer avec le temps (valeur de la propriété, solde qui diminue). On garde ton dossier et on revient vers toi si ta situation évolue.",
    showFigures: false,
    cta: "Laisser mes coordonnées pour être recontacté",
  };
}
