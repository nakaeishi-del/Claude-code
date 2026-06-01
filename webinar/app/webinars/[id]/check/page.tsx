'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Webinar } from '@/lib/types';
import { getWebinar } from '@/lib/storage';

type CheckItem = {
  id: string;
  label: string;
  required?: boolean;
};

type CheckSection = {
  id: string;
  title: string;
  items: CheckItem[];
};

const EMAIL_CHECKS: CheckSection = {
  id: 'email',
  title: 'メール送信前チェック',
  items: [
    { id: 'email-1', label: '件名に誤字・脱字がない', required: true },
    { id: 'email-2', label: '宛先リストが正しい（最新の申込者）', required: true },
    { id: 'email-3', label: 'Zoom URLが正しく入っている', required: true },
    { id: 'email-4', label: '開催日時が正確である', required: true },
    { id: 'email-5', label: 'テストメールで表示を確認した', required: true },
    { id: 'email-6', label: 'ヨンデミーLPのURLが正しい' },
    { id: 'email-7', label: '署名・送信元アドレスが正しい' },
    { id: 'email-8', label: 'モバイル表示を確認した' },
    { id: 'email-9', label: '配信スケジュール（日時）が正しい' },
    { id: 'email-10', label: '送信前に上長・担当者確認が完了している' },
  ],
};

const LINE_CHECKS: CheckSection = {
  id: 'line',
  title: 'LINE配信前チェック',
  items: [
    { id: 'line-1', label: 'LINEカードタイトルが20文字以内', required: true },
    { id: 'line-2', label: 'LINEカード本文が60文字以内（改行除く）', required: true },
    { id: 'line-3', label: 'リンク先URLが正しい（イベントページ）', required: true },
    { id: 'line-4', label: '配信依頼文が担当者に送られている', required: true },
    { id: 'line-5', label: '配信日時が告知開始の7日前以上前' },
    { id: 'line-6', label: '配信ターゲット設定が正しい' },
  ],
};

const LP_CHECKS: CheckSection = {
  id: 'lp',
  title: 'イベントページ公開前チェック',
  items: [
    { id: 'lp-1', label: 'タイトルが正確か確認した', required: true },
    { id: 'lp-2', label: '開催日時が正確か確認した', required: true },
    { id: 'lp-3', label: '申込フォームURLが正しく設定されている', required: true },
    { id: 'lp-4', label: 'サムネイル画像が表示されている', required: true },
    { id: 'lp-5', label: 'モバイル表示を確認した' },
    { id: 'lp-6', label: '申込ボタンのリンクをテストした' },
    { id: 'lp-7', label: '公開設定（公開/限定公開）が正しい' },
  ],
};

const ZOOM_CHECKS: CheckSection = {
  id: 'zoom',
  title: 'Zoom確認',
  items: [
    { id: 'zoom-1', label: '開始30分前にZoomに入室した', required: true },
    { id: 'zoom-2', label: 'マイクの動作確認をした', required: true },
    { id: 'zoom-3', label: 'カメラの動作確認をした', required: true },
    { id: 'zoom-4', label: 'スライドの画面共有テストをした', required: true },
    { id: 'zoom-5', label: '録画設定を確認した', required: true },
    { id: 'zoom-6', label: 'スタッフ・登壇者と最終確認した' },
  ],
};

const YOUTUBE_CHECKS: CheckSection = {
  id: 'youtube',
  title: 'YouTube確認',
  items: [
    { id: 'yt-1', label: '動画タイトルが正確か確認した', required: true },
    { id: 'yt-2', label: '概要欄のURLリンクが全て正常か確認した', required: true },
    { id: 'yt-3', label: 'サムネイルが設定されている', required: true },
    { id: 'yt-4', label: '公開設定（限定公開/公開）が正しい', required: true },
    { id: 'yt-5', label: '動画の再生テストをした' },
  ],
};

const MANUAL_CHECKS = [EMAIL_CHECKS, LINE_CHECKS, LP_CHECKS, ZOOM_CHECKS, YOUTUBE_CHECKS];

export default function CheckPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [webinar, setWebinar] = useState<Webinar | null>(null);
  const [mounted, setMounted] = useState(false);
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setMounted(true);
    const w = getWebinar(id);
    if (!w) { router.push('/'); return; }
    setWebinar(w);
  }, [id, router]);

  if (!mounted || !webinar) {
    return <div className="flex items-center justify-center min-h-[50vh]"><div className="text-gray-400">読み込み中...</div></div>;
  }

  const toggleCheck = (itemId: string) => {
    setChecked(prev => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  const resetSection = (sectionId: string) => {
    const section = MANUAL_CHECKS.find(s => s.id === sectionId);
    if (!section) return;
    setChecked(prev => {
      const next = { ...prev };
      section.items.forEach(item => { delete next[item.id]; });
      return next;
    });
  };

  // URL check data
  const urlChecks = [
    { label: 'Zoom参加URL', value: webinar.zoomUrl, required: true },
    { label: 'ミーティングID', value: webinar.zoomMeetingId, required: true },
    { label: '申込フォームURL', value: webinar.formUrl, required: true },
    { label: 'イベントページURL', value: webinar.lpUrl, required: true },
    { label: 'ヨンデミーLP URL', value: webinar.yondemyLpUrl, required: true },
    { label: 'Zoom管理画面URL', value: webinar.zoomAdminUrl, required: false },
    { label: 'フォーム編集URL', value: webinar.formEditUrl, required: false },
    { label: 'イベントページ編集URL', value: webinar.lpEditUrl, required: false },
    { label: 'Figma URL', value: webinar.figmaUrl, required: false },
    { label: 'YouTube動画URL', value: webinar.youtubeUrl, required: false },
    { label: 'YouTube Studio URL', value: webinar.youtubeStudioUrl, required: false },
    { label: 'メール配信ツールURL', value: webinar.mailToolUrl, required: false },
    { label: 'LINE配信依頼URL', value: webinar.lineRequestUrl, required: false },
  ];

  const requiredMissing = urlChecks.filter(u => u.required && !u.value);
  const optionalMissing = urlChecks.filter(u => !u.required && !u.value);

  const CheckSectionComponent = ({ section }: { section: CheckSection }) => {
    const completedCount = section.items.filter(item => checked[item.id]).length;
    const requiredCount = section.items.filter(item => item.required).length;
    const completedRequired = section.items.filter(item => item.required && checked[item.id]).length;

    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-800 text-sm">{section.title}</h3>
              <p className="text-xs text-gray-400 mt-0.5">
                {completedCount}/{section.items.length} チェック済み
                {requiredCount > 0 && ` （必須: ${completedRequired}/${requiredCount}）`}
              </p>
            </div>
            <button
              onClick={() => resetSection(section.id)}
              className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1 rounded border border-gray-200 hover:bg-gray-50"
            >
              リセット
            </button>
          </div>
          <div className="mt-2 h-1 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-400 rounded-full transition-all"
              style={{ width: `${section.items.length > 0 ? (completedCount / section.items.length) * 100 : 0}%` }}
            />
          </div>
          <p className="text-xs text-amber-600 mt-1.5">※ このチェックリストはページ再読み込みでリセットされます</p>
        </div>
        <div className="divide-y divide-gray-50">
          {section.items.map(item => (
            <label
              key={item.id}
              className="flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <div className={`mt-0.5 flex-shrink-0 w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                checked[item.id] ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300'
              }`}>
                {checked[item.id] && (
                  <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <input
                type="checkbox"
                checked={!!checked[item.id]}
                onChange={() => toggleCheck(item.id)}
                className="sr-only"
              />
              <span className={`text-sm ${checked[item.id] ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                {item.label}
                {item.required && <span className="ml-1 text-red-400 text-xs">*</span>}
              </span>
            </label>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="flex items-center gap-3">
        <Link href={`/webinars/${id}`} className="text-gray-400 hover:text-gray-600 text-sm flex items-center gap-1">
          ← {webinar.title.length > 20 ? webinar.title.substring(0, 20) + '...' : webinar.title}
        </Link>
      </div>

      <div>
        <h1 className="text-xl font-bold text-gray-800">チェックリスト</h1>
        <p className="text-sm text-gray-500 mt-1">各工程の送信・公開前に確認してください</p>
      </div>

      {/* URL Check */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-50">
          <h3 className="font-semibold text-gray-800 text-sm">URL抜け漏れチェック（自動）</h3>
          <p className="text-xs text-gray-400 mt-0.5">ウェビナー情報に入力されたURLの状態</p>
        </div>

        {requiredMissing.length > 0 && (
          <div className="px-4 py-3 bg-red-50 border-b border-red-100">
            <p className="text-xs font-semibold text-red-600 mb-2">⚠️ 必須URL未設定 ({requiredMissing.length}件)</p>
            <div className="space-y-1">
              {requiredMissing.map(u => (
                <div key={u.label} className="flex items-center gap-2">
                  <span className="text-red-400 text-xs">✕</span>
                  <span className="text-xs text-red-600">{u.label}</span>
                </div>
              ))}
            </div>
            <Link href={`/webinars/${id}`} className="text-xs text-blue-600 underline mt-2 inline-block">
              リンク管理で設定する →
            </Link>
          </div>
        )}

        <div className="divide-y divide-gray-50">
          {urlChecks.map(u => (
            <div key={u.label} className="flex items-center justify-between px-4 py-2.5">
              <div className="flex items-center gap-2">
                <span className={`text-sm ${u.value ? 'text-emerald-500' : 'text-red-400'}`}>
                  {u.value ? '✓' : '✕'}
                </span>
                <span className="text-sm text-gray-600">{u.label}</span>
                {u.required && <span className="text-xs text-red-400">*</span>}
              </div>
              {u.value ? (
                <a
                  href={u.value}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-500 hover:underline truncate max-w-[200px]"
                >
                  リンクを確認
                </a>
              ) : (
                <span className="text-xs text-gray-300">未設定</span>
              )}
            </div>
          ))}
        </div>

        {optionalMissing.length > 0 && (
          <div className="px-4 py-2.5 bg-gray-50 border-t border-gray-100">
            <p className="text-xs text-gray-400">任意URL未設定: {optionalMissing.map(u => u.label).join('、')}</p>
          </div>
        )}
      </div>

      {/* Manual checks */}
      {MANUAL_CHECKS.map(section => (
        <CheckSectionComponent key={section.id} section={section} />
      ))}
    </div>
  );
}
