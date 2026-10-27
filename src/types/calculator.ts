// Seuls les propriétaires peuvent aller chercher de l'équité sur leur
// propriété. Un non-propriétaire est filtré dès la question 1 (écran
// d'arrêt) et n'atteint jamais le calcul.
export type PropertyType = "maison_condo" | "plex" | "immeuble_locatif" | "chalet" | "not_owner";

export type OwnershipDuration = "moins_2_ans" | "deux_a_cinq_ans" | "cinq_a_dix_ans" | "dix_ans_plus";

export type RefinanceHistory =
  | "jamais"
  | "plus_3_ans"
  | "moins_3_ans"
  | "marge_ou_2e_hypotheque";

// Fourchettes avec point milieu représentatif (voir lib/config.ts) utilisé
// pour le calcul.
export type DebtAmountRange = "moins_20k" | "20k_50k" | "50k_100k" | "plus_100k";
export type DebtPaymentRange = "moins_500" | "500_1000" | "1000_2000" | "plus_2000";

export type CreditQuality = "bon" | "quelques_retards" | "refuse_banque" | "faillite";

export type EmploymentStatus = "salarie" | "autonome" | "retraite" | "autre";

export type QualificationTier = "A" | "B" | "C" | "D";

export interface CalculatorInput {
  firstName: string;
  phone: string;
  email: string;
  postalCode: string;

  propertyType: Exclude<PropertyType, "not_owner">;
  ownershipDuration: OwnershipDuration;
  propertyValue: number;

  // Solde hypothécaire — undefined si la personne a répondu « Je ne sais pas »
  // (le solde est alors estimé à partir de `ownershipDuration`, voir
  // calculations.ts, et le lead est marqué `solde-a-valider`).
  mortgageBalance?: number;
  mortgageBalanceIsEstimated: boolean;

  refinanceHistory: RefinanceHistory;
  // Montant utilisé sur la marge / 2e hypothèque — pertinent seulement si
  // refinanceHistory === "marge_ou_2e_hypotheque".
  secondaryLienAmount?: number;

  debtAmountRange: DebtAmountRange;
  debtPaymentRange: DebtPaymentRange;

  creditQuality: CreditQuality;
  employmentStatus: EmploymentStatus;

  consentContact: boolean;
}

export interface CalculatorResult {
  // Entrées financières reconstruites (point milieu des fourchettes).
  totalDebtAmount: number;
  currentDebtMonthlyPayment: number;
  mortgageBalance: number;

  // Moteur de calcul d'équité (voir lib/calculations.ts).
  maxRefinanceAmount: number;
  securedLoans: number;
  availableEquity: number;
  currentLTV: number;
  coverageRatio: number | null;

  // Estimation d'économie si les dettes sont roulées dans l'hypothèque.
  consolidatableAmount: number;
  estimatedNewMortgagePayment: number;
  estimatedMonthlySavings: number;

  // Fourchette affichée au lead (équité, pas l'économie — voir ResultView).
  equityRangeLow: number;
  equityRangeHigh: number;

  tier: QualificationTier;
}

export interface SubmitLeadResponse {
  success: boolean;
  leadId: string;
  resultUrl: string;
  result: CalculatorResult;
}
