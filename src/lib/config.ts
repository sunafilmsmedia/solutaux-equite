import type { DebtAmountRange, DebtPaymentRange, OwnershipDuration } from "@/types/calculator";

/**
 * Configuration métier du calculateur d'équité.
 *
 * ⚠️ Les seuils du niveau C (ratio alternatif) et les taux/amortissement
 * sont des valeurs de départ — À CONFIRMER AVEC MICHAEL (jusqu'où ses
 * prêteurs alternatifs acceptent d'aller). Tout est centralisé ici pour
 * être ajusté facilement sans toucher au moteur de calcul.
 */
export const calculatorConfig = {
  // Refinancement standard : max 80 % de la valeur de la propriété.
  maxRefinanceLTV: 0.8,

  // Au-delà de ce ratio (solde + marge/2e hypo ÷ valeur), le dossier passe
  // en prêteur alternatif (niveau C). Au-delà de altLenderMaxLTV, non
  // qualifié (niveau D).
  altLenderMinLTV: 0.8,
  altLenderMaxLTV: 0.85,

  // Taux et amortissement utilisés pour estimer le nouveau paiement
  // hypothécaire si les dettes sont roulées dans l'hypothèque.
  estimatedMortgageRate: 0.045,
  amortizationYears: 25,

  // Points milieux des fourchettes (Q6 — dettes à régler).
  debtAmountMidpoints: {
    moins_20k: 10000,
    "20k_50k": 35000,
    "50k_100k": 75000,
    plus_100k: 130000,
  } as Record<DebtAmountRange, number>,

  // Points milieux des fourchettes (Q7 — paiement mensuel actuel).
  debtPaymentMidpoints: {
    moins_500: 250,
    "500_1000": 750,
    "1000_2000": 1500,
    plus_2000: 2500,
  } as Record<DebtPaymentRange, number>,

  // Quand Q4 (solde hypothécaire) = « Je ne sais pas », on estime le solde
  // à partir de l'ancienneté (Q2) — approximation grossière d'un
  // amortissement typique, affinée par Michael au moment de l'appel.
  estimatedLtvByOwnershipDuration: {
    moins_2_ans: 0.9,
    deux_a_cinq_ans: 0.78,
    cinq_a_dix_ans: 0.6,
    dix_ans_plus: 0.42,
  } as Record<OwnershipDuration, number>,

  // Plage affichée au lead pour le montant d'équité (± autour de l'estimé),
  // arrondie au multiple de 5 000 $ le plus proche.
  equityRangeSpread: 0.15,
  equityRangeRounding: 5000,

  // Curseurs.
  propertyValueMin: 150000,
  propertyValueMax: 1500000,
  propertyValueStep: 5000,
  mortgageBalanceStep: 5000,
  secondaryLienMax: 250000,
  secondaryLienStep: 2500,

  // Coordonnées du courtier.
  brokerName: "SoluTaux",
  brokerTitle: "Solutions hypothécaires sur mesure",
  brokerPhone: "(581) 309-3322",
  brokerPhoneTel: "+15813093322",
  brokerEmail: "michael@solutaux.ca",
  brokerAddress: "1020 rue Bouvier, Québec, QC G2K 0K9",
  brokerPhotoSrc: "/broker.jpg",
  // Nom du partenaire prêteurs alternatifs (niveau C) — affiché dans le
  // message de résultat seulement pour ce niveau.
  altLenderPartnerName: "Dufresne",
  // À COMPLÉTER : lien de prise de rendez-vous (Zoho Bookings, Calendly, etc.)
  calendarLink: "#",
};

export type CalculatorConfig = typeof calculatorConfig;
