import BrokerCard from "@/components/ui/BrokerCard";
import TrackedLink from "@/components/ui/TrackedLink";
import { calculatorConfig } from "@/lib/config";

export default function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-black via-[#0a1530] to-black text-white">
      {/* En-tête avec logo */}
      <header className="mx-auto flex max-w-[1280px] justify-center px-6 pt-8 lg:justify-start">
        <span className="inline-flex">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="SoluTaux" className="h-12 w-auto" />
        </span>
      </header>

      <div className="mx-auto flex max-w-[1280px] flex-col gap-12 px-6 py-10 lg:flex-row lg:items-center lg:py-16">
        {/* Colonne gauche */}
        <div className="flex-1 animate-fadeUp text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-semibold text-slate-200">
            <span className="h-2 w-2 rounded-full bg-savings" />
            Gratuit • Sans engagement • Aucun impact sur ton crédit
          </span>

          <h1 className="mt-6 text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
            Combien d&apos;argent puis-je{" "}
            <span className="neon-word inline-block pr-1 align-baseline text-[1.15em] leading-none">
              aller chercher
            </span>{" "}
            sur ma maison pour payer mes dettes?
          </h1>

          <p className="mt-6 text-lg font-semibold text-slate-300">
            9 questions, 2 minutes — une estimation de ton équité disponible et de combien tu
            pourrais réduire tes paiements.
          </p>

          <div className="mt-8 flex justify-center">
            <TrackedLink
              href="/calculator"
              event="ViewContent"
              className="inline-flex h-14 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-brand to-ai px-8 text-base font-extrabold text-white shadow-glow transition hover:brightness-110 sm:w-auto"
            >
              Calculer mon montant disponible
            </TrackedLink>
          </div>

          <p className="mt-4 text-sm text-slate-400">
            Gratuit. Sans engagement. Aucun impact sur ton crédit.
          </p>
        </div>

        {/* Colonne droite */}
        <div className="flex w-full flex-col gap-4 lg:w-[40%]">
          <BrokerCard />
        </div>
      </div>

      <footer className="relative z-10 mx-auto max-w-[1280px] px-6 pb-8 pt-4 text-center text-xs text-white/40 lg:text-left">
        {calculatorConfig.brokerName} — {calculatorConfig.brokerAddress}
      </footer>

      {/* Décoration : lignes rouges courbées en bas de l'écran */}
      <svg
        aria-hidden
        viewBox="0 0 1440 200"
        preserveAspectRatio="none"
        className="pointer-events-none absolute bottom-0 left-0 z-0 h-40 w-full"
      >
        <path
          d="M0 140 C 280 40, 520 180, 820 90 S 1260 10, 1440 70"
          fill="none"
          stroke="#B91C1C"
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.55"
        />
        <path
          d="M0 180 C 320 110, 600 210, 900 140 S 1300 60, 1440 120"
          fill="none"
          stroke="#B91C1C"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.3"
        />
        <path
          d="M0 110 C 240 170, 560 60, 860 150 S 1220 190, 1440 150"
          fill="none"
          stroke="#B91C1C"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.2"
        />
      </svg>
    </main>
  );
}
