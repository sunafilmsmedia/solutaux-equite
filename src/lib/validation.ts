import { z } from "zod";

const phoneRegex = /^[+]?[\d\s().-]{10,20}$/;
const postalCodeRegex = /^[ABCEGHJ-NPRSTVXY]\d[ABCEGHJ-NPRSTV-Z][ -]?\d[ABCEGHJ-NPRSTV-Z]\d$/i;

export const calculatorInputSchema = z.object({
  firstName: z.string().trim().min(1, "Le prénom est requis"),
  phone: z.string().trim().regex(phoneRegex, "Numéro de téléphone invalide"),
  email: z.string().trim().email("Courriel invalide"),
  postalCode: z.string().trim().regex(postalCodeRegex, "Code postal invalide"),

  propertyType: z.enum(["maison_condo", "plex", "immeuble_locatif", "chalet"]),
  ownershipDuration: z.enum(["moins_2_ans", "deux_a_cinq_ans", "cinq_a_dix_ans", "dix_ans_plus"]),
  propertyValue: z.number().min(150000).max(1500000),

  mortgageBalance: z.number().nonnegative().optional(),
  mortgageBalanceIsEstimated: z.boolean(),

  refinanceHistory: z.enum(["jamais", "plus_3_ans", "moins_3_ans", "marge_ou_2e_hypotheque"]),
  secondaryLienAmount: z.number().nonnegative().optional(),

  debtAmountRange: z.enum(["moins_20k", "20k_50k", "50k_100k", "plus_100k"]),
  debtPaymentRange: z.enum(["moins_500", "500_1000", "1000_2000", "plus_2000"]),

  creditQuality: z.enum(["bon", "quelques_retards", "refuse_banque", "faillite"]),
  employmentStatus: z.enum(["salarie", "autonome", "retraite", "autre"]),

  consentContact: z.literal(true, {
    errorMap: () => ({ message: "Le consentement est requis" }),
  }),
});

export type ValidatedCalculatorInput = z.infer<typeof calculatorInputSchema>;
