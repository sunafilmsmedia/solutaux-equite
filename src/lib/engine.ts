import type { CalculatorInput, CalculatorResult } from "@/types/calculator";
import { runCalculations } from "./calculations";
import { classifyLead } from "./scoring";

/**
 * Pipeline complet : calculs d'équité -> classification A/B/C/D.
 * Utilisé côté serveur dans /api/submit-lead.
 */
export function processLead(input: CalculatorInput): CalculatorResult {
  const calc = runCalculations(input);
  const tier = classifyLead(input, calc);

  return {
    totalDebtAmount: calc.totalDebtAmount,
    currentDebtMonthlyPayment: calc.currentDebtMonthlyPayment,
    mortgageBalance: calc.mortgageBalance,
    maxRefinanceAmount: calc.maxRefinanceAmount,
    securedLoans: calc.securedLoans,
    availableEquity: calc.availableEquity,
    currentLTV: calc.currentLTV,
    coverageRatio: calc.coverageRatio,
    consolidatableAmount: calc.consolidatableAmount,
    estimatedNewMortgagePayment: calc.estimatedNewMortgagePayment,
    estimatedMonthlySavings: calc.estimatedMonthlySavings,
    equityRangeLow: calc.equityRangeLow,
    equityRangeHigh: calc.equityRangeHigh,
    tier,
  };
}
