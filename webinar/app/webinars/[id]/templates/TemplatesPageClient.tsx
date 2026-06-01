'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Webinar } from '@/lib/types';
import { getWebinar } from '@/lib/storage';
import CopyButton from '@/components/CopyButton';
import {
  generateThanksEmail,
  generate3DayEmail,
  generate1DayEmail,
  generateAfterEmail,
  generateArchiveEmail,
  generateXPost,
  generateLineTitle,
  generateLineBody,
  countLineChars,
  generateLineRequest,
  generateEventPage,
  generateYoutubeDescription,
} from '@/lib/templates';

type TemplateTab = 'emails' | 'sns' | 'other';

export default function TemplatesPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [webinar, setWebinar] = useState<Webinar | null>(null);
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<TemplateTab>('emails');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['thanks']));

  useEffect(() => {
    setMounted(true);
    const w = getWebinar(id);
    if (!w) { router.push('/'); return; }
    setWebinar(w);
  }, [id, router]);

  if (!mounted || !webinar) {
    return <div className="flex items-center justify-center min-h-[50vh]"><div className="text-gray-400">読み込み中...</div></div>;
  }

  const toggleSection = (key: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(key)) { next.delete(key); } else { next.add(key); }
      return next;
    });
  };

  const missingUrls: string[] = [];
  if (!webinar.zoomUrl) missingUrls.push('Zoom URL');
  if (!webinar.yondemyLpUrl) missingUrls.push('ヨンデミーLP URL');
  if (!webinar.youtubeUrl) missingUrls.push('YouTube URL（見逃し配信メール用）');

  const xPost = generateXPost(webinar);
  const lineTitle = generateLineTitle(webinar);
  const lineBody = generateLineBody(webinar);
  const lineTitleCount = lineTitle.replace(/\n/g, '').length;
  const lineBodyCount = countLineChars(lineBody);

  const TemplateSection = ({
    id: sectionId,
    title,
    content,
    warnings = [],
    charCount,
    maxChars,
  }: {
    id: string;
    title: string;
    content: string;
    warnings?: string[];
    charCount?: number;
    maxChars?: number;
  }) => {
    const isExpanded = expandedSections.has(sectionId);

    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <button
          onClick={() => toggleSection(sectionId)}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <h3 className="font-medium text-gray-800 text-sm">{title}</h3>
            {charCount !== undefined && maxChars !== undefined && (
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                charCount > maxChars ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'
              }`}>
                {charCount}/{maxChars}文字
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <CopyButton text={content} />
            <svg className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>

        {isExpanded && (
          <div className="px-4 pb-4 border-t border-gray-50">
            {warnings.length > 0 && (
              <div className="mt-3 mb-3 p-2.5 bg-amber-50 rounded-lg">
                {warnings.map((w, i) => (
                  <p key={i} className="text-xs text-amber-700">⚠️ {w}</p>
                ))}
              </div>
            )}
            <pre className="mt-3 whitespace-pre-wrap text-sm text-gray-700 font-sans bg-gray-50 rounded-lg p-4 leading-relaxed">
              {content}
            </pre>
          </div>
        )}
      </div>
    );
  };

  const tabs: { id: TemplateTab; label: string }[] = [
    { id: 'emails', label: 'メール文面' },
    { id: 'sns', label: 'SNS・LINE' },
    { id: 'other', label: 'その他' },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="flex items-center gap-3">
        <Link href={`/webinars/${id}`} className="text-gray-400 hover:text-gray-600 text-sm flex items-center gap-1">
          ← {webinar.title.length > 20 ? webinar.title.substring(0, 20) + '...' : webinar.title}
        </Link>
      </div>

      <div>
        <h1 className="text-xl font-bold text-gray-800">文面生成</h1>
        <p className="text-sm text-gray-500 mt-1">
          ウェビナー情報から各種テンプレートを自動生成します
        </p>
      </div>

      {missingUrls.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
          <p className="text-xs font-medium text-amber-700 mb-1">⚠️ 以下のURLが未設定のため、文面に「【...を入力してください】」が含まれます</p>
          <ul className="text-xs text-amber-600 space-y-0.5">
            {missingUrls.map(u => <li key={u}>• {u}</li>)}
          </ul>
          <Link href={`/webinars/${id}`} className="text-xs text-blue-600 underline mt-1 inline-block">
            リンク管理で設定する →
          </Link>
        </div>
      )}

      {/* Tab navigation */}
      <div className="flex border-b border-gray-200">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
              activeTab === t.id
                ? 'text-emerald-600 border-emerald-500'
                : 'text-gray-500 border-transparent hover:text-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Email templates */}
      {activeTab === 'emails' && (
        <div className="space-y-3">
          <TemplateSection
            id="thanks"
            title="① 申込ありがとうメール"
            content={generateThanksEmail(webinar)}
            warnings={!webinar.zoomUrl ? ['Zoom URLが未設定です'] : []}
          />
          <TemplateSection
            id="3day"
            title="② 3日前リマインドメール"
            content={generate3DayEmail(webinar)}
            warnings={!webinar.zoomUrl ? ['Zoom URLが未設定です'] : []}
          />
          <TemplateSection
            id="1day"
            title="③ 1日前リマインドメール"
            content={generate1DayEmail(webinar)}
            warnings={!webinar.zoomUrl ? ['Zoom URLが未設定です'] : []}
          />
          <TemplateSection
            id="after"
            title="④ 終了直後メール"
            content={generateAfterEmail(webinar)}
            warnings={!webinar.yondemyLpUrl ? ['ヨンデミーLP URLが未設定です'] : []}
          />
          <TemplateSection
            id="archive"
            title="⑤ 見逃し配信メール"
            content={generateArchiveEmail(webinar)}
            warnings={[
              ...(!webinar.youtubeUrl ? ['YouTube URLが未設定です'] : []),
              ...(!webinar.yondemyLpUrl ? ['ヨンデミーLP URLが未設定です'] : []),
            ]}
          />
        </div>
      )}

      {/* SNS / LINE templates */}
      {activeTab === 'sns' && (
        <div className="space-y-3">
          {/* X post */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <button
              onClick={() => toggleSection('xpost')}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <h3 className="font-medium text-gray-800 text-sm">⑥ X（Twitter）投稿</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  xPost.length > 280 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'
                }`}>
                  {xPost.length}文字
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CopyButton text={xPost} />
                <svg className={`w-4 h-4 text-gray-400 transition-transform ${expandedSections.has('xpost') ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>
            {expandedSections.has('xpost') && (
              <div className="px-4 pb-4 border-t border-gray-50">
                <pre className="mt-3 whitespace-pre-wrap text-sm text-gray-700 font-sans bg-gray-50 rounded-lg p-4 leading-relaxed">{xPost}</pre>
              </div>
            )}
          </div>

          {/* LINE card title */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-gray-800 text-sm">⑦ LINEカードタイトル</h3>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                lineTitleCount > 20 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'
              }`}>
                {lineTitleCount}/20文字
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-700">
                {lineTitle}
              </div>
              <CopyButton text={lineTitle} />
            </div>
            {lineTitleCount > 20 && (
              <p className="text-xs text-red-500 mt-2">⚠️ 20文字を超えています。文字数を減らしてください。</p>
            )}
          </div>

          {/* LINE card body */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-gray-800 text-sm">⑧ LINEカード本文</h3>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                lineBodyCount > 60 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'
              }`}>
                {lineBodyCount}/60文字（改行除く）
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-700">
                {lineBody}
              </div>
              <CopyButton text={lineBody} />
            </div>
            {lineBodyCount > 60 && (
              <p className="text-xs text-red-500 mt-2">⚠️ 60文字を超えています（改行除く）。</p>
            )}
          </div>

          {/* LINE request */}
          <TemplateSection
            id="linereq"
            title="⑨ LINE配信依頼文"
            content={generateLineRequest(webinar)}
            warnings={!webinar.lpUrl && !webinar.formUrl ? ['イベントページURLが未設定です'] : []}
          />
        </div>
      )}

      {/* Other templates */}
      {activeTab === 'other' && (
        <div className="space-y-3">
          <TemplateSection
            id="eventpage"
            title="⑩ イベントページ本文"
            content={generateEventPage(webinar)}
            warnings={!webinar.formUrl ? ['申込フォームURLが未設定です'] : []}
          />
          <TemplateSection
            id="youtube"
            title="⑪ YouTube概要欄"
            content={generateYoutubeDescription(webinar)}
            warnings={[
              ...(!webinar.yondemyLpUrl ? ['ヨンデミーLP URLが未設定です'] : []),
              ...(!webinar.lpUrl && !webinar.formUrl ? ['イベントページURLが未設定です'] : []),
            ]}
          />
        </div>
      )}
    </div>
  );
}
