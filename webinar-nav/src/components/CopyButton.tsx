import { useState } from 'react';
interface Props { text: string; label?: string; className?: string; onCopy?: () => void }
export default function CopyButton({ text, label = 'コピー', className = '', onCopy }: Props) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    onCopy?.();
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${
        copied ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      } ${className}`}
    >
      {copied ? '✓ コピー完了！' : label}
    </button>
  );
}
