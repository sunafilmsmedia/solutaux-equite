import type {
  CreditQuality,
  DebtAmountRange,
  DebtPaymentRange,
  EmploymentStatus,
  OwnershipDuration,
  PropertyType,
  RefinanceHistory,
} from "@/types/calculator";

export interface ChoiceOption<T = string> {
  label: string;
  value: T;
}

// Q1 — type de propriété. "not_owner" arrête le parcours (écran de fin).
export const PROPERTY_TYPE_OPTIONS: ChoiceOption<PropertyType>[] = [
  { label: "Maison ou condo où j'habite", value: "maison_condo" },
  { label: "Plex où j'habite", value: "plex" },
  { label: "Immeuble locatif", value: "immeuble_locatif" },
  { label: "Chalet", value: "chalet" },
  { label: "Je ne suis pas propriétaire", value: "not_owner" },
];

// Q2 — depuis combien de temps propriétaire.
export const OWNERSHIP_DURATION_OPTIONS: ChoiceOption<OwnershipDuration>[] = [
  { label: "Moins de 2 ans", value: "moins_2_ans" },
  { label: "2 à 5 ans", value: "deux_a_cinq_ans" },
  { label: "5 à 10 ans", value: "cinq_a_dix_ans" },
  { label: "10 ans et plus", value: "dix_ans_plus" },
];

// Q5 — historique de refinancement.
export const REFINANCE_HISTORY_OPTIONS: ChoiceOption<RefinanceHistory>[] = [
  { label: "Jamais", value: "jamais" },
  { label: "Refinancé il y a plus de 3 ans", value: "plus_3_ans" },
  { label: "Refinancé dans les 3 dernières années", value: "moins_3_ans" },
  { label: "J'ai une marge hypothécaire ou une 2e hypothèque", value: "marge_ou_2e_hypotheque" },
];

// Q6 — combien de dettes à régler.
export const DEBT_AMOUNT_OPTIONS: ChoiceOption<DebtAmountRange>[] = [
  { label: "Moins de 20 000 $", value: "moins_20k" },
  { label: "20 000 $ à 50 000 $", value: "20k_50k" },
  { label: "50 000 $ à 100 000 $", value: "50k_100k" },
  { label: "Plus de 100 000 $", value: "plus_100k" },
];

// Q7 — paiement mensuel actuel sur ces dettes.
export const DEBT_PAYMENT_OPTIONS: ChoiceOption<DebtPaymentRange>[] = [
  { label: "Moins de 500 $", value: "moins_500" },
  { label: "500 $ à 1 000 $", value: "500_1000" },
  { label: "1 000 $ à 2 000 $", value: "1000_2000" },
  { label: "Plus de 2 000 $", value: "plus_2000" },
];

// Q8 — crédit.
export const CREDIT_QUALITY_OPTIONS: ChoiceOption<CreditQuality>[] = [
  { label: "Bon", value: "bon" },
  { label: "Quelques retards", value: "quelques_retards" },
  { label: "Ma banque m'a refusé", value: "refuse_banque" },
  { label: "Faillite ou proposition de consommateur", value: "faillite" },
];

// Q9 — situation d'emploi.
export const EMPLOYMENT_OPTIONS: ChoiceOption<EmploymentStatus>[] = [
  { label: "Salarié", value: "salarie" },
  { label: "Travailleur autonome", value: "autonome" },
  { label: "Retraité", value: "retraite" },
  { label: "Autre", value: "autre" },
];
