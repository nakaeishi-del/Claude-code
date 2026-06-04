interface Props {
  value: number; // 0-100
  label?: string;
  showPercent?: boolean;
  color?: 'blue' | 'green' | 'amber';
  size?: 'sm' | 'md';
}

const colorMap = {
  blue: 'bg-blue-500',
  green: 'bg-emerald-500',
  amber: 'bg-amber-400',
};

export default function ProgressBar({ value, label, showPercent = true, color = 'blue', size = 'md' }: Props) {
  const pct = Math.min(100, Math.max(0, Math.round(value)));
  const h = size === 'sm' ? 'h-1.5' : 'h-2.5';
  return (
    <div>
      {(label || showPercent) && (
        <div className="flex justify-between items-center mb-1">
          {label && <span className="text-xs text-slate-500">{label}</span>}
          {showPercent && <span className="text-xs font-semibold text-slate-600">{pct}%</span>}
        </div>
      )}
      <div className={`w-full bg-slate-100 rounded-full overflow-hidden ${h}`}>
        <div
          className={`${h} rounded-full transition-all duration-500 ${colorMap[color]}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
