interface Props {
  message: string;
  mood?: 'normal' | 'happy' | 'cheer' | 'warn';
}

const moodStyle = {
  normal: 'bg-blue-50 border-blue-100 text-blue-800',
  happy: 'bg-emerald-50 border-emerald-100 text-emerald-800',
  cheer: 'bg-amber-50 border-amber-100 text-amber-800',
  warn: 'bg-red-50 border-red-100 text-red-800',
};

const moodEmoji = {
  normal: '🧭',
  happy: '🎉',
  cheer: '✨',
  warn: '⚠️',
};

export default function CharacterComment({ message, mood = 'normal' }: Props) {
  return (
    <div className={`flex items-start gap-3 rounded-xl border p-4 ${moodStyle[mood]}`}>
      <span className="text-2xl shrink-0 mt-0.5">{moodEmoji[mood]}</span>
      <p className="text-sm leading-relaxed">{message}</p>
    </div>
  );
}
