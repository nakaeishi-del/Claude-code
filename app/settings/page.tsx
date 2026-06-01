'use client';
import { useEffect, useState } from 'react';
import { Settings } from '@/lib/types';
import { getSettings, saveSettings } from '@/lib/storage';

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({});
  const [saved, setSaved] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setSettings(getSettings());
  }, []);

  if (!mounted) {
    return <div className="flex items-center justify-center min-h-[50vh]"><div className="text-gray-400">読み込み中...</div></div>;
  }

  const handleChange = (key: keyof Settings, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    saveSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const inputClass = 'w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500';

  const fields: { key: keyof Settings; label: string; type: string; placeholder: string; description?: string }[] = [
    {
      key: 'zoomAdminUrl',
      label: 'Zoom管理画面URL',
      type: 'url',
      placeholder: 'https://zoom.us/...',
      description: '新しいウェビナー作成時に自動入力されます',
    },
    {
      key: 'googleFormUrl',
      label: 'Googleフォーム一覧URL',
      type: 'url',
      placeholder: 'https://docs.google.com/forms/...',
    },
    {
      key: 'figmaTemplateUrl',
      label: 'FigmaテンプレートURL',
      type: 'url',
      placeholder: 'https://figma.com/...',
    },
    {
      key: 'youtubeStudioUrl',
      label: 'YouTube Studio URL',
      type: 'url',
      placeholder: 'https://studio.youtube.com/...',
    },
    {
      key: 'mailToolUrl',
      label: 'メール配信ツールURL',
      type: 'url',
      placeholder: 'https://...',
    },
    {
      key: 'eventListUrl',
      label: 'イベント一覧URL',
      type: 'url',
      placeholder: 'https://...',
    },
    {
      key: 'yondemyLpUrl',
      label: 'ヨンデミーLP URL',
      type: 'url',
      placeholder: 'https://lp.yondemy.com/',
      description: 'メール文面で使用されます',
    },
    {
      key: 'hamaruUrl',
      label: 'はまるURL',
      type: 'url',
      placeholder: 'https://...',
    },
    {
      key: 'faqUrl',
      label: 'よくある質問URL',
      type: 'url',
      placeholder: 'https://...',
    },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-800">設定</h1>
        <p className="text-sm text-gray-500 mt-1">よく使うURLやデフォルト値を設定しておくと便利です</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-5">
        <h2 className="font-semibold text-gray-700 text-sm border-b border-gray-100 pb-2">デフォルトURL設定</h2>

        {fields.map(({ key, label, type, placeholder, description }) => (
          <div key={key}>
            <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
            <input
              type={type}
              value={(settings[key] as string) || ''}
              onChange={e => handleChange(key, e.target.value)}
              className={inputClass}
              placeholder={placeholder}
            />
            {description && <p className="text-xs text-gray-400 mt-1">{description}</p>}
          </div>
        ))}
      </div>

      {/* Signature */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h2 className="font-semibold text-gray-700 text-sm border-b border-gray-100 pb-2 mb-4">メール署名</h2>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">署名</label>
          <textarea
            value={settings.signature || ''}
            onChange={e => handleChange('signature', e.target.value)}
            className={inputClass}
            rows={5}
            placeholder={`ーーーーーーーーーーーーー\n株式会社 Yondemy\nーーーーーーーーーーーーー`}
          />
        </div>
      </div>

      {/* Save */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          className={`px-6 py-2.5 rounded-xl font-medium text-sm transition-all ${
            saved
              ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
              : 'bg-emerald-500 text-white hover:bg-emerald-600'
          }`}
        >
          {saved ? '✓ 保存しました' : '設定を保存'}
        </button>
        {saved && <p className="text-sm text-emerald-600">設定がLocalStorageに保存されました</p>}
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
        <h3 className="text-sm font-medium text-blue-700 mb-1.5">データについて</h3>
        <ul className="text-xs text-blue-600 space-y-1">
          <li>• すべてのデータはブラウザのLocalStorageに保存されています</li>
          <li>• ブラウザのデータを削除するとすべての情報が消えます</li>
          <li>• このツールは認証なし・サーバーなしのスタンドアロンアプリです</li>
          <li>• 複数のブラウザ・デバイス間でのデータ共有はできません</li>
        </ul>
      </div>

      {/* Danger zone */}
      <div className="bg-white rounded-xl border border-red-100 shadow-sm p-5">
        <h2 className="font-semibold text-red-600 text-sm mb-3">危険ゾーン</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-700">すべてのデータを削除</p>
            <p className="text-xs text-gray-400 mt-0.5">ウェビナー・設定など全データが削除されます</p>
          </div>
          <button
            onClick={() => {
              if (confirm('本当にすべてのデータを削除しますか？この操作は取り消せません。')) {
                localStorage.removeItem('wfm_webinars');
                localStorage.removeItem('wfm_settings');
                window.location.href = '/';
              }
            }}
            className="px-4 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors"
          >
            全データ削除
          </button>
        </div>
      </div>
    </div>
  );
}
