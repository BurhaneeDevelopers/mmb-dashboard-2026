interface StatCardProps {
  icon: string;
  label: string;
  value: number;
  color: string;
  sub?: string;
}

export function StatCard({ icon, label, value, color, sub }: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm flex items-center gap-3">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
        style={{ background: `${color}18` }}
      >
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-800 leading-none">
          {value}
          {sub && <span className="text-sm font-normal text-slate-400 ml-1">{sub}</span>}
        </p>
        <p className="text-xs text-slate-500 mt-0.5">{label}</p>
      </div>
    </div>
  );
}
