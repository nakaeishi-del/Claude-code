'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Webinar } from '@/lib/types';
import { getWebinar, saveWebinar, deleteWebinar } from '@/lib/storage';

const DAYS = ['日', '月', '火', '水', '木', '金', '土'];

function calcDayOfWeek(dateStr: string): string {
  if (!dateStr) return '';
  return DAYS[new Date(dateStr).getDay()] || '';
}

function formatJapaneseDate(dateStr: string, dayOfWeek: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日（${dayOfWeek}）`;
}

type Tab = 'info' | 'links';

export default function WebinarDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [webinar, setWebinar] = useState<Webinar | null>(null);
  const [tab, setTab] = useState<Tab>('info');
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Partial<Webinar>>({});
  const [takeaways, setTakeaways] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const w = getWebinar(id);
    if (!w) { router.push('/'); return; }
    setWebinar(w);
    setForm(w);
    setTakeaways(w.takeaways || []);
  }, [id, router]);

  if (!mounted || !webinar) {
    return <div className="flex items-center justify-center min-h-[50vh]"><div className="text-gray-400">読み込み中...</div></div>;
  }

  const progress = webinar.tasks.length > 0
    ? Math.round(webinar.tasks.filter(t => t.completed).length / webinar.tasks.length * 100)
    : 0;
  const completedCount = webinar.tasks.filter(t => t.completed).length;

  const missingUrls: string[] = [];
  if (!webinar.zoomUrl) missingUrls.push('Zoom URL');
  if (!webinar.formUrl) missingUrls.push('申込フォームURL');
  if (!webinar.lpUrl) missingUrls.push('イベントページURL');

  const handleSave = () => {
    setSaving(true);
    const updated: Webinar = {
      ...webinar,
      ...form,
      takeaways: takeaways.filter(t => t.trim()),
      dayOfWeek: (form.date && form.date !== webinar.date) ? calcDayOfWeek(form.date as string) : (form.dayOfWeek || webinar.dayOfWeek),
      updatedAt: new Date().toISOString(),
    };
    saveWebinar(updated);
    setWebinar(updated);
    setSaving(false);
    setSaved(true);
    setEditing(false);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleDelete = () => {
    deleteWebinar(id);
    router.push('/');
  };

  const handleLinkSave = () => {
    const updated: Webinar = { ...webinar, ...form, updatedAt: new Date().toISOString() };
    saveWebinar(updated);
    setWebinar(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const inputClass = 'w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500';
  const readClass = 'text-sm text-gray-700';

  const tabs: { id: Tab; label: string }[] = [
    { id: 'info', label: '基本情報' },
    { id: 'links', label: 'リンク管理' },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {/* Back + header */}
      <div className="flex items-center gap-3">
        <Link href="/" className="text-gray-400 hover:text-gray-600 transition-colors text-sm flex items-center gap-1">
          ← ダッシュボード
        </Link>
      </div>

      {/* Title card */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-gray-800">{webinar.title}</h1>
            <p className="text-sm text-gray-500 mt-1">
              {formatJapaneseDate(webinar.date, webinar.dayOfWeek)} {webinar.startTime}〜{webinar.endTime}
              {webinar.speaker && <span className="ml-2 text-gray-400">/ {webinar.speaker}</span>}
            </p>
          </div>
        </div>

        {/* Progress */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-gray-400">全体進捗</span>
            <span className="text-sm font-semibold text-emerald-600">{completedCount}/{webinar.tasks.length} 完了 ({progress}%)</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-400 rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Warnings */}
        {missingUrls.length > 0 && (
          <div className="mt-3 p-2.5 bg-amber-50 rounded-lg flex items-start gap-2">
            <span className="text-amber-500 text-sm">⚠️</span>
            <p className="text-xs text-amber-700">{missingUrls.join('、')}が未設定です</p>
          </div>
        )}

        {/* Quick actions */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
          <Link href={`/webinars/${id}/tasks`} className="flex flex-col items-center gap-1.5 p-3 bg-gray-50 rounded-xl hover:bg-emerald-50 hover:border-emerald-200 border border-transparent transition-all group">
            <span className="text-xl">📋</span>
            <span className="text-xs font-medium text-gray-600 group-hover:text-emerald-700">作業ナビ</span>
          </Link>
          <Link href={`/webinars/${id}/templates`} className="flex flex-col items-center gap-1.5 p-3 bg-gray-50 rounded-xl hover:bg-emerald-50 hover:border-emerald-200 border border-transparent transition-all group">
            <span className="text-xl">✉️</span>
            <span className="text-xs font-medium text-gray-600 group-hover:text-emerald-700">文面生成</span>
          </Link>
          <Link href={`/webinars/${id}/check`} className="flex flex-col items-center gap-1.5 p-3 bg-gray-50 rounded-xl hover:bg-emerald-50 hover:border-emerald-200 border border-transparent transition-all group">
            <span className="text-xl">✅</span>
            <span className="text-xs font-medium text-gray-600 group-hover:text-emerald-700">チェック</span>
          </Link>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex flex-col items-center gap-1.5 p-3 bg-gray-50 rounded-xl hover:bg-red-50 hover:border-red-200 border border-transparent transition-all group"
          >
            <span className="text-xl">🗑️</span>
            <span className="text-xs font-medium text-gray-400 group-hover:text-red-500">削除</span>
          </button>
        </div>
      </div>

      {/* Delete confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="font-semibold text-gray-800 mb-2">ウェビナーを削除しますか？</h3>
            <p className="text-sm text-gray-500 mb-4">この操作は取り消せません。</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                キャンセル
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600"
              >
                削除する
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex border-b border-gray-100">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                tab === t.id
                  ? 'text-emerald-600 border-b-2 border-emerald-500 bg-emerald-50/30'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="p-5">
          {/* 基本情報 tab */}
          {tab === 'info' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-700">基本情報</h2>
                {!editing ? (
                  <button
                    onClick={() => { setEditing(true); setForm(webinar); setTakeaways(webinar.takeaways); }}
                    className="text-sm px-3 py-1.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    編集
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setEditing(false); setForm(webinar); setTakeaways(webinar.takeaways); }}
                      className="text-sm px-3 py-1.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"
                    >
                      キャンセル
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="text-sm px-3 py-1.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50"
                    >
                      {saving ? '保存中...' : saved ? '✓ 保存済み' : '保存'}
                    </button>
                  </div>
                )}
              </div>

              {[
                { key: 'title', label: 'タイトル', type: 'text' },
                { key: 'date', label: '開催日', type: 'date' },
                { key: 'dayOfWeek', label: '曜日', type: 'text' },
                { key: 'startTime', label: '開始時間', type: 'time' },
                { key: 'endTime', label: '終了時間', type: 'time' },
                { key: 'targetAudience', label: '対象者', type: 'text' },
                { key: 'theme', label: 'テーマ', type: 'text' },
                { key: 'speaker', label: '登壇者', type: 'text' },
              ].map(({ key, label, type }) => (
                <div key={key}>
                  <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
                  {editing ? (
                    <input
                      type={type}
                      value={(form[key as keyof Webinar] as string) || ''}
                      onChange={e => setForm(prev => ({ ...prev, [key]: e.target.value }))}
                      className={inputClass}
                    />
                  ) : (
                    <p className={readClass}>{(webinar[key as keyof Webinar] as string) || '—'}</p>
                  )}
                </div>
              ))}

              {/* mainProblem */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">メインの悩み</label>
                {editing ? (
                  <textarea
                    value={(form.mainProblem || '')}
                    onChange={e => setForm(prev => ({ ...prev, mainProblem: e.target.value }))}
                    className={inputClass}
                    rows={2}
                  />
                ) : (
                  <p className={readClass}>{webinar.mainProblem || '—'}</p>
                )}
              </div>

              {/* empathyText */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">保護者への共感文</label>
                {editing ? (
                  <textarea
                    value={(form.empathyText || '')}
                    onChange={e => setForm(prev => ({ ...prev, empathyText: e.target.value }))}
                    className={inputClass}
                    rows={2}
                  />
                ) : (
                  <p className={readClass}>{webinar.empathyText || '—'}</p>
                )}
              </div>

              {/* Takeaways */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">当日わかること</label>
                {editing ? (
                  <div className="space-y-2">
                    {takeaways.map((t, i) => (
                      <div key={i} className="flex gap-2">
                        <input
                          type="text"
                          value={t}
                          onChange={e => setTakeaways(prev => prev.map((x, j) => j === i ? e.target.value : x))}
                          className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-500"
                        />
                        <button type="button" onClick={() => setTakeaways(prev => prev.filter((_, j) => j !== i))} className="text-gray-400 hover:text-red-400">✕</button>
                      </div>
                    ))}
                    <button type="button" onClick={() => setTakeaways(prev => [...prev, ''])} className="text-sm text-emerald-600 hover:text-emerald-700">+ 追加</button>
                  </div>
                ) : (
                  <ul className="space-y-1">
                    {webinar.takeaways.length > 0
                      ? webinar.takeaways.map((t, i) => <li key={i} className="text-sm text-gray-700 flex items-start gap-2"><span className="text-emerald-500">•</span>{t}</li>)
                      : <li className="text-sm text-gray-400">—</li>
                    }
                  </ul>
                )}
              </div>

              {/* Related archives */}
              {webinar.relatedArchives.length > 0 && (
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">関連する過去回</label>
                  <div className="space-y-2">
                    {webinar.relatedArchives.map((a, i) => (
                      <div key={i} className="text-sm">
                        <a href={a.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{a.title}</a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* リンク管理 tab */}
          {tab === 'links' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-semibold text-gray-700">リンク管理</h2>
                <button
                  onClick={handleLinkSave}
                  className={`text-sm px-3 py-1.5 rounded-lg transition-colors ${saved ? 'bg-emerald-100 text-emerald-700' : 'bg-emerald-500 text-white hover:bg-emerald-600'}`}
                >
                  {saved ? '✓ 保存済み' : '保存'}
                </button>
              </div>

              {[
                { section: 'Zoom', fields: [
                  { key: 'zoomUrl', label: 'Zoom参加URL', type: 'url' },
                  { key: 'zoomMeetingId', label: 'ミーティングID', type: 'text' },
                  { key: 'zoomPasscode', label: 'パスコード', type: 'text' },
                  { key: 'zoomAdminUrl', label: 'Zoom管理画面URL', type: 'url' },
                ]},
                { section: 'フォーム', fields: [
                  { key: 'formUrl', label: '申込フォームURL', type: 'url' },
                  { key: 'formEditUrl', label: 'フォーム編集URL', type: 'url' },
                  { key: 'responseSheetUrl', label: '回答スプレッドシートURL', type: 'url' },
                ]},
                { section: 'イベントページ', fields: [
                  { key: 'lpUrl', label: 'イベントページURL（公開）', type: 'url' },
                  { key: 'lpEditUrl', label: 'イベントページ編集URL', type: 'url' },
                  { key: 'eventListUrl', label: 'イベント一覧URL', type: 'url' },
                ]},
                { section: 'メディア', fields: [
                  { key: 'youtubeUrl', label: 'YouTube動画URL', type: 'url' },
                  { key: 'youtubeStudioUrl', label: 'YouTube Studio URL', type: 'url' },
                  { key: 'thumbnailUrl', label: 'サムネイル画像URL', type: 'url' },
                  { key: 'figmaUrl', label: 'Figma URL', type: 'url' },
                ]},
                { section: '配信ツール', fields: [
                  { key: 'mailToolUrl', label: 'メール配信ツールURL', type: 'url' },
                  { key: 'lineRequestUrl', label: 'LINE配信依頼URL', type: 'url' },
                  { key: 'slackUrl', label: 'Slack URL', type: 'url' },
                ]},
                { section: 'その他', fields: [
                  { key: 'yondemyLpUrl', label: 'ヨンデミーLP URL', type: 'url' },
                  { key: 'hamaruUrl', label: 'はまるURL', type: 'url' },
                ]},
              ].map(({ section, fields }) => (
                <div key={section}>
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">{section}</h3>
                  <div className="space-y-3">
                    {fields.map(({ key, label, type }) => {
                      const value = (form[key as keyof Webinar] as string) || '';
                      const isRequired = ['zoomUrl', 'formUrl', 'lpUrl'].includes(key);
                      const isEmpty = !value;
                      return (
                        <div key={key}>
                          <label className="block text-xs font-medium text-gray-500 mb-1">
                            {label}
                            {isRequired && <span className="text-red-400 ml-1">*</span>}
                            {isRequired && isEmpty && <span className="ml-2 text-amber-500 text-xs">⚠️ 未設定</span>}
                          </label>
                          <div className="flex gap-2">
                            <input
                              type={type}
                              value={value}
                              onChange={e => setForm(prev => ({ ...prev, [key]: e.target.value }))}
                              className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                              placeholder={type === 'url' ? 'https://...' : '入力してください'}
                            />
                            {value && type === 'url' && (
                              <a
                                href={value}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-2 text-sm text-blue-500 border border-blue-100 rounded-lg hover:bg-blue-50 flex-shrink-0"
                              >
                                開く
                              </a>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
