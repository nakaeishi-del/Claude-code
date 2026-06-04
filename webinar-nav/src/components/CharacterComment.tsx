interface Props { message: string; mood?: 'happy' | 'normal' | 'cheer' }
const EMOJIS = { happy: '🎉', normal: '📚', cheer: '✨' };
export default function CharacterComment({ message, mood = 'normal' }: Props) {
  return (
    <div className="flex items-start gap-3 bg-emerald-50 border border-emerald-100 rounded-2xl p-4">
      <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-xl flex-shrink-0">
        {EMOJIS[mood]}
      </div>
      <div>
        <p className="text-xs text-emerald-600 font-semibold mb-0.5">ヨンデミー先生</p>
        <p className="text-sm text-gray-700">{message}</p>
      </div>
    </div>
  );
}
