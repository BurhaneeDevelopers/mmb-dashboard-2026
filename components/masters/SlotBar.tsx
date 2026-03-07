interface SlotBarProps {
  used: number;
  total: number;
  colors: string[];
}

export function SlotBar({ used, total, colors }: SlotBarProps) {
  const remaining = total - used;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
      <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
        <span className="font-medium text-slate-700">Master Slots Used</span>
        <span className="font-semibold text-indigo-600">{used} / {total}</span>
      </div>
      <div className="flex gap-1.5">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className="flex-1 h-3 rounded-full transition-all duration-500"
            style={{
              background: i < used ? colors[i] || "#6366f1" : "#e2e8f0",
            }}
          />
        ))}
      </div>
      <p className="mt-2 text-[11px] text-slate-400">
        {remaining} slot{remaining !== 1 ? "s" : ""} remaining
      </p>
    </div>
  );
}
