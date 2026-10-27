"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { CalculatorResult } from "@/types/calculator";
import { formatCurrency } from "@/lib/format";
import { calculatorConfig } from "@/lib/config";
import { buildRecommendation } from "@/lib/recommendation";
import { trackPixel } from "@/lib/pixel";
import BrokerCard from "@/components/ui/BrokerCard";

interface StoredResult {
  result: CalculatorResult;
  firstName: string;
}

export default function ResultView({ leadId }: { leadId: string }) {
  const [data, setData] = useState<StoredResult | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem(`result:${leadId}`);
    if (raw) {
      setData(JSON.parse(raw) as StoredResult);
      // La personne a complété le questionnaire → événement Lead.
      const firedKey = `lead-fired:${leadId}`;
      if (!sessionStorage.getItem(firedKey)) {
        trackPixel("Lead");
        sessionStorage.setItem(firedKey, "1");
      }
    }
    setLoaded(true);
  }, [leadId]);

  if (loaded && !data) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-ink px-6 text-center text-white">
        <div>
          <h1 className="text-2xl font-bold">Résultat introuvable</h1>
          <p className="mt-3 text-slate-400">
            Ton résultat n&apos;est plus disponible. Tu peux refaire l&apos;estimation en
            quelques minutes.
          </p>
          <Link
            href="/calculator"
            className="mt-6 inline-flex h-12 items-center rounded-2xl bg-gradient-to-r from-brand to-ai px-6 font-extrabold text-white"
          >
            Recommencer
          </Link>
        </div>
      </main>
    );
  }

  if (!data) {
    return <main className="min-h-screen bg-ink" />;
  }

  const { result, firstName } = data;
  const reco = buildRecommendation(firstName || "Toi", result, result.tier);

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-[#0a1530] to-black text-white">
      <div className="mx-auto max-w-3xl px-6 py-14">
        <div className="animate-fadeUp">
          <span className="ai-gradient-text text-sm font-bold uppercase tracking-wide">
            Ton estimation
          </span>
          <h1 className="mt-3 text-2xl font-extrabold leading-tight sm:text-3xl">
            {reco.headline}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-slate-300">{reco.bodyMessage}</p>
        </div>

        {/* Montants */}
        {reco.showFigures && (
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <ResultCard
              label="Argent potentiellement accessible"
              value={`${formatCurrency(result.equityRangeLow)} – ${formatCurrency(result.equityRangeHigh)}`}
              accent="ai"
            />
            <ResultCard
              label="Réduction de paiement estimée"
              value={
                result.estimatedMonthlySavings > 0
                  ? `${formatCurrency(result.estimatedMonthlySavings)} / mois`
                  : "À valider avec ton courtier"
              }
              accent="savings"
            />
          </div>
        )}

        {/* Disclaimer */}
        <p className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-xs leading-relaxed text-slate-400">
          Cette estimation est fournie à titre informatif seulement. Elle ne constitue pas une
          approbation hypothécaire, une offre de financement ou un conseil financier personnalisé.
          Les résultats réels peuvent varier selon votre dossier, votre crédit, vos revenus, la
          valeur de votre propriété, les taux disponibles et les critères des prêteurs.
        </p>

        {/* Carte courtier */}
        <div className="mt-8">
          <BrokerCard />
        </div>

        {/* CTA */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <a
            href={calculatorConfig.calendarLink}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-14 flex-1 items-center justify-center rounded-2xl bg-gradient-to-r from-brand to-ai px-6 text-base font-extrabold text-white shadow-glow transition hover:brightness-110"
          >
            {reco.cta}
          </a>
          <Link
            href="/thank-you"
            className="inline-flex h-14 flex-1 items-center justify-center rounded-2xl border border-white/15 px-6 text-base font-semibold text-slate-200 transition hover:bg-white/5"
          >
            Recevoir mon estimation par courriel
          </Link>
        </div>
      </div>
    </main>
  );
}

function ResultCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: "savings" | "ai";
}) {
  const accentClass = accent === "savings" ? "text-savings" : "text-ai";
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</div>
      <div className={`mt-2 text-2xl font-extrabold ${accentClass}`}>{value}</div>
    </div>
  );
}
