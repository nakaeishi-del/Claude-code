import { useState } from 'react';

interface Props {
  text: string;
  label?: string;
  onCopy?: () => void;
  className?: string;
}

export default function CopyButton({ text, label = 'コピー', onCopy, className = '' }: Props) {
  const [copied, setCopied] = useState(false);

  const handle = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    onCopy?.();
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handle}
      className={`inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${
        copied
          ? 'bg-emerald-500 text-white'
          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
      } ${className}`}
    >
      {copied ? '✓ コピー完了' : label}
    </button>
  );
}
