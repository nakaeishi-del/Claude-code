interface Props { value: number; label?: string; color?: string; size?: 'sm' | 'md' }
export default function ProgressBar({ value, label, color = 'bg-emerald-500', size = 'md' }: Props) {
  const h = size === 'sm' ? 'h-1.5' : 'h-3';
  return (
    <div>
      {label && (
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>{label}</span>
          <span className="font-semibold text-gray-700">{Math.round(value)}%</span>
        </div>
      )}
      <div className={`w-full ${h} bg-gray-100 rounded-full overflow-hidden`}>
        <div className={`${h} ${color} rounded-full transition-all duration-500`} style={{ width: `${Math.min(100, value)}%` }} />
      </div>
    </div>
  );
}
