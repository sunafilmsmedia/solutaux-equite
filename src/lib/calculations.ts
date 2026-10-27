import type { CalculatorInput } from "@/types/calculator";
import { calculatorConfig } from "./config";

/** Paiement mensuel d'un prêt amorti (formule standard). */
export function calculateMonthlyPayment(
  principal: number,
  annualRate: number,
  years: number
): number {
  if (principal <= 0) return 0;
  const monthlyRate = annualRate / 12;
  const numberOfPayments = years * 12;

  if (numberOfPayments <= 0) return 0;
  if (monthlyRate === 0) return principal / numberOfPayments;

  const factor = Math.pow(1 + monthlyRate, numberOfPayments);
  return (principal * (monthlyRate * factor)) / (factor - 1);
}

/**
 * Solde hypothécaire à utiliser dans le calcul. Si la personne a répondu
 * « Je ne sais pas » (Q4), on l'estime à partir de l'ancienneté (Q2).
 */
export function resolveMortgageBalance(input: CalculatorInput): number {
  if (!input.mortgageBalanceIsEstimated && typeof input.mortgageBalance === "number") {
    return input.mortgageBalance;
  }
  const ltv = calculatorConfig.estimatedLtvByOwnershipDuration[input.ownershipDuration];
  return Math.round(input.propertyValue * ltv);
}

export interface CoreCalculations {
  totalDebtAmount: number;
  currentDebtMonthlyPayment: number;
  mortgageBalance: number;

  maxRefinanceAmount: number;
  securedLoans: number;
  availableEquity: number;
  currentLTV: number;
  // null quand il n'y a aucune dette déclarée (division impossible) — traité
  // comme une couverture totale par le moteur de score.
  coverageRatio: number | null;

  consolidatableAmount: number;
  estimatedNewMortgagePayment: number;
  estimatedMonthlySavings: number;

  equityRangeLow: number;
  equityRangeHigh: number;
}

function roundToNearest(value: number, step: number): number {
  return Math.round(value / step) * step;
}

/**
 * Calcule l'ensemble des valeurs financières à partir des 9 réponses.
 * Formules (voir brief Michael) :
 *   Max refinançable = Valeur × 0,80
 *   Prêts garantis    = Solde hypo + Marge/2e hypo
 *   Équité disponible = Max refinançable − Prêts garantis
 *   Ratio actuel (LTV) = Prêts garantis ÷ Valeur
 *   Couverture        = Équité disponible ÷ Dettes
 */
export function runCalculations(input: CalculatorInput): CoreCalculations {
  const { propertyValue } = input;

  const totalDebtAmount = calculatorConfig.debtAmountMidpoints[input.debtAmountRange];
  const currentDebtMonthlyPayment = calculatorConfig.debtPaymentMidpoints[input.debtPaymentRange];
  const mortgageBalance = resolveMortgageBalance(input);
  const secondaryLien =
    input.refinanceHistory === "marge_ou_2e_hypotheque" ? input.secondaryLienAmount ?? 0 : 0;

  const maxRefinanceAmount = propertyValue * calculatorConfig.maxRefinanceLTV;
  const securedLoans = mortgageBalance + secondaryLien;
  const availableEquity = Math.max(maxRefinanceAmount - securedLoans, 0);
  const currentLTV = propertyValue > 0 ? securedLoans / propertyValue : 1;
  const coverageRatio = totalDebtAmount > 0 ? availableEquity / totalDebtAmount : null;

  // Montant qu'on peut réellement rouler dans l'hypothèque : plafonné par
  // l'équité disponible ET par les dettes déclarées.
  const consolidatableAmount = Math.max(Math.min(totalDebtAmount, availableEquity), 0);

  const estimatedNewMortgagePayment = calculateMonthlyPayment(
    consolidatableAmount,
    calculatorConfig.estimatedMortgageRate,
    calculatorConfig.amortizationYears
  );

  // Économie = paiement actuel sur les dettes consolidées moins le nouveau
  // paiement hypothécaire additionnel. Jamais négative.
  const portionFactor = totalDebtAmount > 0 ? consolidatableAmount / totalDebtAmount : 0;
  const currentPaymentOnConsolidated = currentDebtMonthlyPayment * portionFactor;
  const estimatedMonthlySavings = Math.max(
    Math.round(currentPaymentOnConsolidated - estimatedNewMortgagePayment),
    0
  );

  const spread = calculatorConfig.equityRangeSpread;
  const rounding = calculatorConfig.equityRangeRounding;
  const equityRangeLow = Math.max(roundToNearest(availableEquity * (1 - spread), rounding), 0);
  const equityRangeHigh = Math.max(roundToNearest(availableEquity * (1 + spread), rounding), 0);

  return {
    totalDebtAmount,
    currentDebtMonthlyPayment,
    mortgageBalance,
    maxRefinanceAmount: Math.round(maxRefinanceAmount),
    securedLoans: Math.round(securedLoans),
    availableEquity: Math.round(availableEquity),
    currentLTV,
    coverageRatio,
    consolidatableAmount: Math.round(consolidatableAmount),
    estimatedNewMortgagePayment: Math.round(estimatedNewMortgagePayment),
    estimatedMonthlySavings,
    equityRangeLow,
    equityRangeHigh,
  };
}
