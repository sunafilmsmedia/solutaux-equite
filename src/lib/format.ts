import type {
  CreditQuality,
  EmploymentStatus,
  OwnershipDuration,
  PropertyType,
  RefinanceHistory,
} from "@/types/calculator";

export function formatCurrency(value: number | undefined | null): string {
  if (value === undefined || value === null || Number.isNaN(value)) return "—";
  return new Intl.NumberFormat("fr-CA", {
    style: "currency",
    currency: "CAD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatPercent(rate: number): string {
  return `${(rate * 100).toLocaleString("fr-CA", { maximumFractionDigits: 1 })} %`;
}

export const PROPERTY_TYPE_LABELS: Record<Exclude<PropertyType, "not_owner">, string> = {
  maison_condo: "Maison ou condo où j'habite",
  plex: "Plex où j'habite",
  immeuble_locatif: "Immeuble locatif",
  chalet: "Chalet",
};

export const OWNERSHIP_DURATION_LABELS: Record<OwnershipDuration, string> = {
  moins_2_ans: "Moins de 2 ans",
  deux_a_cinq_ans: "2 à 5 ans",
  cinq_a_dix_ans: "5 à 10 ans",
  dix_ans_plus: "10 ans et plus",
};

export const REFINANCE_HISTORY_LABELS: Record<RefinanceHistory, string> = {
  jamais: "Jamais refinancé",
  plus_3_ans: "Refinancé il y a plus de 3 ans",
  moins_3_ans: "Refinancé dans les 3 dernières années",
  marge_ou_2e_hypotheque: "Marge hypothécaire ou 2e hypothèque",
};

export const CREDIT_QUALITY_LABELS: Record<CreditQuality, string> = {
  bon: "Bon",
  quelques_retards: "Quelques retards",
  refuse_banque: "Refusé par sa banque",
  faillite: "Faillite ou proposition de consommateur",
};

export const EMPLOYMENT_LABELS: Record<EmploymentStatus, string> = {
  salarie: "Salarié",
  autonome: "Travailleur autonome",
  retraite: "Retraité",
  autre: "Autre",
};
