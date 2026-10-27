"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { CalculatorInput, PropertyType, RefinanceHistory } from "@/types/calculator";
import ProgressBar from "@/components/ui/ProgressBar";
import Slider from "@/components/ui/Slider";
import LoadingAI from "./LoadingAI";
import {
  CREDIT_QUALITY_OPTIONS,
  DEBT_AMOUNT_OPTIONS,
  DEBT_PAYMENT_OPTIONS,
  EMPLOYMENT_OPTIONS,
  OWNERSHIP_DURATION_OPTIONS,
  PROPERTY_TYPE_OPTIONS,
  REFINANCE_HISTORY_OPTIONS,
  type ChoiceOption,
} from "./questions";
import { calculatorConfig } from "@/lib/config";

type StepKey =
  | "propertyType"
  | "ownershipDuration"
  | "propertyValue"
  | "mortgageBalance"
  | "refinanceHistory"
  | "secondaryLienAmount"
  | "debtAmount"
  | "debtPayment"
  | "creditQuality"
  | "employment"
  | "contact";

interface Answers extends Omit<Partial<CalculatorInput>, "propertyType"> {
  propertyType?: PropertyType;
  dontKnowMortgageBalance?: boolean;
}

// Étapes à choix unique : un clic sélectionne ET avance instantanément.
const AUTO_ADVANCE_STEPS = new Set<StepKey>([
  "propertyType",
  "ownershipDuration",
  "refinanceHistory",
  "debtAmount",
  "debtPayment",
  "creditQuality",
  "employment",
]);

export default function CalculatorForm() {
  const router = useRouter();
  const [answers, setAnswers] = useState<Answers>({});
  const [stepIndex, setStepIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const notOwner = answers.propertyType === "not_owner";
  const hasSecondaryLien = answers.refinanceHistory === "marge_ou_2e_hypotheque";

  const steps = useMemo<StepKey[]>(() => {
    const base: StepKey[] = [
      "propertyType",
      "ownershipDuration",
      "propertyValue",
      "mortgageBalance",
      "refinanceHistory",
    ];
    if (hasSecondaryLien) base.push("secondaryLienAmount");
    base.push("debtAmount", "debtPayment", "creditQuality", "employment", "contact");
    return base;
  }, [hasSecondaryLien]);

  const clampedIndex = Math.min(stepIndex, steps.length - 1);
  const currentStep = steps[clampedIndex];
  const isAutoAdvance = AUTO_ADVANCE_STEPS.has(currentStep);

  function update(patch: Answers) {
    setAnswers((prev) => ({ ...prev, ...patch }));
    setError(null);
  }

  function goNext() {
    if (clampedIndex < steps.length - 1) setStepIndex(clampedIndex + 1);
  }

  function goBack() {
    if (clampedIndex > 0) setStepIndex(clampedIndex - 1);
  }

  const canContinue = useMemo(() => validateStep(currentStep, answers), [currentStep, answers]);

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);

    const payload = buildPayload(answers);
    const startedAt = Date.now();

    try {
      const res = await fetch("/api/submit-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error ?? "Il manque quelques informations avant de générer ton résultat.");
        setSubmitting(false);
        return;
      }

      const elapsed = Date.now() - startedAt;
      const wait = Math.max(1200 - elapsed, 0);
      sessionStorage.setItem(
        `result:${data.leadId}`,
        JSON.stringify({ result: data.result, firstName: payload.firstName })
      );
      setTimeout(() => router.push(data.resultUrl), wait);
    } catch {
      setError("Une erreur est survenue. Réessaie dans un instant.");
      setSubmitting(false);
    }
  }

  if (submitting) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-black via-[#0a1530] to-black text-white">
        <LoadingAI />
      </main>
    );
  }

  // Filtre d'entrée : sans propriété, impossible d'aller chercher de l'argent
  // sur une maison. On arrête le parcours ici, sans générer de lead.
  if (notOwner) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-black via-[#0a1530] to-black px-6 text-white">
        <div className="max-w-lg animate-fadeUp text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-white/15 bg-white/5 text-2xl">
            🔑
          </span>
          <h1 className="mt-6 text-2xl font-extrabold leading-tight sm:text-3xl">
            Cet outil est conçu pour les propriétaires
          </h1>
          <p className="mt-4 text-base leading-relaxed text-slate-300">
            Aller chercher de l&apos;argent sur sa maison repose sur l&apos;équité d&apos;une
            propriété. Sans propriété, cette avenue ne s&apos;applique malheureusement pas pour
            l&apos;instant.
          </p>
          <p className="mt-3 text-sm text-slate-400">
            Si tu deviens propriétaire un jour, reviens nous voir —{" "}
            {calculatorConfig.brokerName} pourra analyser tes options.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              onClick={() => {
                update({ propertyType: undefined });
                setStepIndex(0);
              }}
              className="inline-flex h-12 items-center justify-center rounded-2xl border border-white/15 px-6 text-sm font-semibold text-slate-200 transition hover:bg-white/5"
            >
              Revenir en arrière
            </button>
            <Link
              href="/"
              className="inline-flex h-12 items-center justify-center rounded-2xl bg-gradient-to-r from-brand to-ai px-6 text-sm font-extrabold text-white shadow-glow transition hover:brightness-110"
            >
              Retour à l&apos;accueil
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-[#0a1530] to-black text-white">
      <div className="mx-auto max-w-2xl px-6 py-10 lg:py-16">
        <ProgressBar current={clampedIndex + 1} total={steps.length} />

        <div key={currentStep} className="mt-8 animate-fadeUp">
          <StepContent step={currentStep} answers={answers} update={update} advance={goNext} />
        </div>

        {error && (
          <p className="mt-4 rounded-xl border border-alert/40 bg-alert/10 px-4 py-3 text-sm text-orange-200">
            {error}
          </p>
        )}

        <div className="mt-8 flex items-center gap-3">
          {clampedIndex > 0 && (
            <button
              onClick={goBack}
              className="h-14 rounded-2xl border border-white/15 px-6 text-sm font-semibold text-slate-200 transition hover:bg-white/5"
            >
              Retour
            </button>
          )}
          {currentStep === "contact" ? (
            <button
              onClick={handleSubmit}
              disabled={!canContinue}
              className="h-14 flex-1 rounded-2xl bg-gradient-to-r from-brand to-ai px-8 text-base font-extrabold text-white shadow-glow transition enabled:hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Voir mon résultat
            </button>
          ) : isAutoAdvance ? (
            <p className="text-sm text-white/40">Touche une réponse pour continuer →</p>
          ) : (
            <button
              onClick={goNext}
              disabled={!canContinue}
              className="h-14 flex-1 rounded-2xl bg-gradient-to-r from-brand to-ai px-8 text-base font-extrabold text-white shadow-glow transition enabled:hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Continuer
            </button>
          )}
        </div>
      </div>
    </main>
  );
}

/* --------------------------- Validation par étape --------------------------- */

function validateStep(step: StepKey, a: Answers): boolean {
  switch (step) {
    case "propertyType":
      return !!a.propertyType;
    case "ownershipDuration":
      return !!a.ownershipDuration;
    case "propertyValue":
      return typeof a.propertyValue === "number";
    case "mortgageBalance":
      return a.dontKnowMortgageBalance === true || typeof a.mortgageBalance === "number";
    case "refinanceHistory":
      return !!a.refinanceHistory;
    case "secondaryLienAmount":
      return typeof a.secondaryLienAmount === "number";
    case "debtAmount":
      return !!a.debtAmountRange;
    case "debtPayment":
      return !!a.debtPaymentRange;
    case "creditQuality":
      return !!a.creditQuality;
    case "employment":
      return !!a.employmentStatus;
    case "contact":
      return (
        !!a.firstName?.trim() &&
        !!a.email?.trim() &&
        /.+@.+\..+/.test(a.email ?? "") &&
        !!a.phone?.trim() &&
        !!a.postalCode?.trim() &&
        a.consentContact === true
      );
    default:
      return false;
  }
}

/* ------------------------------- Payload final ------------------------------ */

function buildPayload(a: Answers): CalculatorInput {
  return {
    firstName: a.firstName?.trim() ?? "",
    phone: a.phone?.trim() ?? "",
    email: a.email?.trim() ?? "",
    postalCode: a.postalCode?.trim().toUpperCase() ?? "",

    propertyType: (a.propertyType as CalculatorInput["propertyType"]) ?? "maison_condo",
    ownershipDuration: a.ownershipDuration ?? "moins_2_ans",
    propertyValue: a.propertyValue ?? calculatorConfig.propertyValueMin,

    mortgageBalance: a.dontKnowMortgageBalance ? undefined : a.mortgageBalance,
    mortgageBalanceIsEstimated: a.dontKnowMortgageBalance === true,

    refinanceHistory: a.refinanceHistory ?? "jamais",
    secondaryLienAmount:
      a.refinanceHistory === "marge_ou_2e_hypotheque" ? a.secondaryLienAmount : undefined,

    debtAmountRange: a.debtAmountRange ?? "moins_20k",
    debtPaymentRange: a.debtPaymentRange ?? "moins_500",

    creditQuality: a.creditQuality ?? "bon",
    employmentStatus: a.employmentStatus ?? "salarie",

    consentContact: a.consentContact === true,
  };
}

/* ------------------------------- Rendu étapes ------------------------------- */

interface StepContentProps {
  step: StepKey;
  answers: Answers;
  update: (patch: Answers) => void;
  advance: () => void;
}

function StepContent({ step, answers, update, advance }: StepContentProps) {
  const pick = (patch: Answers) => {
    update(patch);
    advance();
  };

  switch (step) {
    case "propertyType":
      return (
        <SingleChoice
          title="Quel type de propriété as-tu?"
          options={PROPERTY_TYPE_OPTIONS}
          value={answers.propertyType}
          onSelect={(v) => pick({ propertyType: v })}
        />
      );
    case "ownershipDuration":
      return (
        <SingleChoice
          title="Depuis combien de temps es-tu propriétaire?"
          options={OWNERSHIP_DURATION_OPTIONS}
          value={answers.ownershipDuration}
          onSelect={(v) => pick({ ownershipDuration: v })}
        />
      );
    case "propertyValue":
      return (
        <div>
          <StepTitle
            title="Selon toi, combien vaut ta maison aujourd'hui?"
            subtitle="Une estimation suffit, on la valide après."
          />
          <Slider
            min={calculatorConfig.propertyValueMin}
            max={calculatorConfig.propertyValueMax}
            step={calculatorConfig.propertyValueStep}
            value={answers.propertyValue ?? 350000}
            onChange={(v) => update({ propertyValue: v })}
          />
        </div>
      );
    case "mortgageBalance": {
      const max = Math.max(answers.propertyValue ?? calculatorConfig.propertyValueMax, 150000);
      const unknown = answers.dontKnowMortgageBalance === true;
      return (
        <div>
          <StepTitle title="Combien il te reste à payer sur ton hypothèque?" />
          <Slider
            min={0}
            max={max}
            step={calculatorConfig.mortgageBalanceStep}
            value={answers.mortgageBalance ?? Math.round(max * 0.6)}
            onChange={(v) => update({ mortgageBalance: v, dontKnowMortgageBalance: false })}
            disabled={unknown}
          />
          <button
            onClick={() =>
              update({ dontKnowMortgageBalance: !unknown, mortgageBalance: undefined })
            }
            className={`mt-5 rounded-xl border px-4 py-2 text-sm font-medium transition ${
              unknown
                ? "border-ai bg-ai/15 text-white"
                : "border-white/15 text-slate-300 hover:bg-white/5"
            }`}
          >
            Je ne sais pas
          </button>
          {unknown && (
            <p className="mt-3 text-xs text-slate-500">
              On estimera ton solde à partir de ton ancienneté comme propriétaire.
            </p>
          )}
        </div>
      );
    }
    case "refinanceHistory":
      return (
        <SingleChoice
          title="As-tu déjà refinancé ou emprunté sur ta maison?"
          options={REFINANCE_HISTORY_OPTIONS}
          value={answers.refinanceHistory}
          onSelect={(v: RefinanceHistory) => pick({ refinanceHistory: v })}
        />
      );
    case "secondaryLienAmount":
      return (
        <div>
          <StepTitle title="Combien est utilisé sur ta marge ou ta 2e hypothèque?" />
          <Slider
            min={0}
            max={calculatorConfig.secondaryLienMax}
            step={calculatorConfig.secondaryLienStep}
            value={answers.secondaryLienAmount ?? 20000}
            onChange={(v) => update({ secondaryLienAmount: v })}
          />
        </div>
      );
    case "debtAmount":
      return (
        <SingleChoice
          title="Combien de dettes voudrais-tu régler?"
          options={DEBT_AMOUNT_OPTIONS}
          value={answers.debtAmountRange}
          onSelect={(v) => pick({ debtAmountRange: v })}
        />
      );
    case "debtPayment":
      return (
        <SingleChoice
          title="Combien tu paies par mois sur ces dettes?"
          options={DEBT_PAYMENT_OPTIONS}
          value={answers.debtPaymentRange}
          onSelect={(v) => pick({ debtPaymentRange: v })}
        />
      );
    case "creditQuality":
      return (
        <SingleChoice
          title="Comment décrirais-tu ton crédit?"
          options={CREDIT_QUALITY_OPTIONS}
          value={answers.creditQuality}
          onSelect={(v) => pick({ creditQuality: v })}
        />
      );
    case "employment":
      return (
        <SingleChoice
          title="C'est quoi ta situation d'emploi?"
          options={EMPLOYMENT_OPTIONS}
          value={answers.employmentStatus}
          onSelect={(v) => pick({ employmentStatus: v })}
        />
      );
    case "contact":
      return <ContactStep answers={answers} update={update} />;
    default:
      return null;
  }
}

/* ------------------------------ Sous-composants ----------------------------- */

function StepTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-6">
      <h2 className="text-2xl font-extrabold leading-tight sm:text-3xl">{title}</h2>
      {subtitle && <p className="mt-2 text-sm text-slate-400">{subtitle}</p>}
    </div>
  );
}

function SingleChoice<T extends string>({
  title,
  options,
  value,
  onSelect,
}: {
  title: string;
  options: ChoiceOption<T>[];
  value?: T;
  onSelect: (v: T) => void;
}) {
  return (
    <div>
      <StepTitle title={title} />
      <div className="grid gap-3">
        {options.map((opt) => (
          <OptionButton
            key={opt.value}
            label={opt.label}
            selected={value === opt.value}
            onClick={() => onSelect(opt.value)}
          />
        ))}
      </div>
    </div>
  );
}

function OptionButton({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 rounded-2xl border px-5 py-4 text-left text-sm font-semibold transition ${
        selected
          ? "border-ai bg-ai/15 text-white shadow-glow"
          : "border-white/12 bg-white/5 text-slate-200 hover:border-white/30 hover:bg-white/10"
      }`}
    >
      <span
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] ${
          selected ? "border-ai bg-ai text-white" : "border-white/30"
        }`}
      >
        {selected ? "✓" : ""}
      </span>
      {label}
    </button>
  );
}

function ContactStep({
  answers,
  update,
}: {
  answers: Answers;
  update: (patch: Answers) => void;
}) {
  return (
    <div>
      <StepTitle
        title="Dernière étape"
        subtitle={`Laisse tes coordonnées : ${calculatorConfig.brokerName} analyse ton dossier et te confirme tes vraies options. Gratuit, sans engagement.`}
      />

      <div className="space-y-2.5">
        <Field
          label="Prénom"
          value={answers.firstName ?? ""}
          onChange={(v) => update({ firstName: v })}
        />
        <Field
          label="Téléphone"
          type="tel"
          value={answers.phone ?? ""}
          onChange={(v) => update({ phone: v })}
        />
        <Field
          label="Courriel"
          type="email"
          value={answers.email ?? ""}
          onChange={(v) => update({ email: v })}
        />
        <Field
          label="Code postal"
          value={answers.postalCode ?? ""}
          onChange={(v) => update({ postalCode: v })}
        />
      </div>

      <label className="mt-3 flex cursor-pointer items-start gap-2 text-xs text-slate-300">
        <input
          type="checkbox"
          checked={answers.consentContact === true}
          onChange={(e) => update({ consentContact: e.target.checked })}
          className="mt-0.5 h-4 w-4 rounded border-white/30 accent-ai"
        />
        J&apos;accepte d&apos;être contacté au sujet de mon estimation et de mes options.
      </label>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-ai focus:outline-none"
      />
    </label>
  );
}
