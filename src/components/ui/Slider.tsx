"use client";

import { formatCurrency } from "@/lib/format";

interface SliderProps {
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

export default function Slider({ min, max, step, value, onChange, disabled }: SliderProps) {
  const pct = Math.round(((value - min) / (max - min)) * 100);

  return (
    <div>
      <div className="mb-3 text-center">
        <span className="text-3xl font-extrabold text-white">{formatCurrency(value)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        className="brand-range w-full disabled:opacity-30"
        style={{ "--range-progress": `${pct}%` } as React.CSSProperties}
      />
      <div className="mt-2 flex justify-between text-xs text-slate-500">
        <span>{formatCurrency(min)}</span>
        <span>{formatCurrency(max)}</span>
      </div>
    </div>
  );
}
