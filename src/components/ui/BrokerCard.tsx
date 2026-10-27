"use client";

import { useEffect, useRef, useState } from "react";
import { calculatorConfig } from "@/lib/config";

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length < 2) return (parts[0] ?? "").slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export default function BrokerCard() {
  const [imgError, setImgError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const initials = getInitials(calculatorConfig.brokerName);

  // Si l'image a échoué à charger avant l'hydratation (l'événement "error"
  // natif de <img> ne remonte pas jusqu'au listener React posé après coup),
  // on détecte l'échec déjà survenu au montage.
  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth === 0) {
      setImgError(true);
    }
  }, []);

  return (
    <div className="rounded-3xl border border-white/15 bg-white/[0.03] p-5 backdrop-blur">
      <div className="flex items-center gap-4">
        {/* Avatar + pastille en ligne */}
        <div className="relative shrink-0">
          {imgError ? (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neon/15 text-lg font-extrabold text-neon">
              {initials}
            </div>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              ref={imgRef}
              src={calculatorConfig.brokerPhotoSrc}
              alt={calculatorConfig.brokerName}
              onError={() => setImgError(true)}
              className="h-16 w-16 rounded-full object-cover ring-2 ring-neon/60"
            />
          )}
          <span className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full border-2 border-black bg-neon shadow-neon" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-md bg-neon/15 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-neon">
              <span className="h-1.5 w-1.5 animate-pulseSoft rounded-full bg-neon" />
              En ligne
            </span>
          </div>
          <p className="mt-1.5 truncate text-base font-extrabold text-white">{calculatorConfig.brokerName}</p>
          <p className="truncate text-xs text-white/60">{calculatorConfig.brokerTitle}</p>
        </div>
      </div>

      <a
        href={calculatorConfig.calendarLink}
        target="_blank"
        rel="noreferrer"
        className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand to-ai text-sm font-extrabold text-white shadow-glow transition hover:brightness-110"
      >
        <span aria-hidden>📅</span> Prendre rendez-vous
      </a>

      <a
        href={`tel:${calculatorConfig.brokerPhoneTel}`}
        className="mt-2.5 flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-white/15 text-sm font-semibold text-slate-200 transition hover:bg-white/5"
      >
        <span aria-hidden>📞</span> Appeler {calculatorConfig.brokerPhone}
      </a>

      <a
        href={`mailto:${calculatorConfig.brokerEmail}`}
        className="mt-2.5 flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-white/15 text-sm font-semibold text-slate-200 transition hover:bg-white/5"
      >
        <span aria-hidden>✉️</span> {calculatorConfig.brokerEmail}
      </a>
    </div>
  );
}
