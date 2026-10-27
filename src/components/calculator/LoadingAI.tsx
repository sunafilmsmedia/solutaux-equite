"use client";

import { useEffect, useState } from "react";

const STEPS = [
  "Analyse de tes réponses…",
  "Estimation de ton potentiel d'économie…",
  "Vérification des options possibles…",
  "Préparation de ton résultat personnalisé…",
];

export default function LoadingAI() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i < STEPS.length - 1 ? i + 1 : i));
    }, 400);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <div className="relative mb-8 h-20 w-20">
        <div className="absolute inset-0 animate-spin rounded-full border-4 border-white/10 border-t-ai" />
        <div className="absolute inset-0 flex items-center justify-center text-2xl">⚡</div>
      </div>
      <h2 className="ai-gradient-text text-2xl font-extrabold">{STEPS[index]}</h2>
      <div className="mt-6 flex gap-1.5">
        {STEPS.map((_, i) => (
          <span
            key={i}
            className={`h-2 w-2 rounded-full transition ${
              i <= index ? "bg-ai" : "bg-white/15"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
