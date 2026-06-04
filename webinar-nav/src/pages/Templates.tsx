import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MessageTemplate, Webinar } from '../types';
import { MESSAGE_TEMPLATES } from '../data/messageTemplates';
import { getWebinars, addHistory } from '../utils/storage';
import CopyButton from '../components/CopyButton';

function applyVars(template: string, webinar: Webinar | null) {
  if (!webinar) return template;
  const d = new Date(webinar.date);
  const dateStr = `${d.getFullYear()}年${d.getMonth()+1}月${d.getDate()}日（${['日','月','火','水','木','金','土'][d.getDay()]}）`;
  return template
    .replace(/\{\{title\}\}/g, webinar.title)
    .replace(/\{\{date\}\}/g, dateStr)
    .replace(/\{\{time\}\}/g, `${webinar.startTime}〜${webinar.endTime}`)
    .replace(/\{\{zoom_url\}\}/g, webinar.zoomUrl || '【Zoom URL】')
    .replace(/\{\{meeting_id\}\}/g, webinar.meetingId || '【ミーティングID】')
    .replace(/\{\{passcode\}\}/g, webinar.passcode || '【パスコード】')
    .replace(/\{\{form_url\}\}/g, webinar.formUrl || '【申込フォームURL】')
    .replace(/\{\{event_page_url\}\}/g, webinar.eventPageUrl || '【イベントページURL】')
    .replace(/\{\{archive_url\}\}/g, webinar.archiveUrl || '【アーカイブURL】');
}

const CATS = [
  { id: 'all', label: 'すべて' },
  { id: 'email', label: 'メール' },
  { id: 'x', label: 'X（Twitter）' },
  { id: 'line', label: 'LINE' },
  { id: 'slack', label: 'Slack' },
];

const CAT_BADGE: Record<string, string> = {
  email: 'bg-blue-100 text-blue-700',
  x: 'bg-gray-100 text-gray-700',
  line: 'bg-green-100 text-green-700',
  slack: 'bg-purple-100 text-purple-700',
};
const CAT_LABEL: Record<string, string> = { email: 'メール', x: 'X', line: 'LINE', slack: 'Slack' };

export default function Templates() {
  const [searchParams] = useSearchParams();
  const [webinars, setWebinars] = useState<Webinar[]>([]);
  const [selectedWebinarId, setSelectedWebinarId] = useState<string>('');
  const [cat, setCat] = useState('all');
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    const ws = getWebinars();
    setWebinars(ws);
    const qId = searchParams.get('webinarId');
    if (qId && ws.find(w => w.id === qId)) setSelectedWebinarId(qId);
    else if (ws.length > 0) setSelectedWebinarId(ws[0].id);
  }, [searchParams]);

  const selectedWebinar = webinars.find(w => w.id === selectedWebinarId) ?? null;
  const filtered = MESSAGE_TEMPLATES.filter(t => cat === 'all' || t.category === cat);

  const handleCopy = (tpl: MessageTemplate) => {
    addHistory({ type: 'template_copied', templateId: tpl.id, label: `「${tpl.title}」テンプレをコピー` });
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-800">文面テンプレ</h1>
        <p className="text-sm text-gray-500 mt-0.5">ウェビナーを選択すると情報が自動で入ります</p>
      </div>

      {/* Webinar selector */}
      {webinars.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <label className="block text-xs font-semibold text-gray-600 mb-2">対象ウェビナー</label>
          <select value={selectedWebinarId} onChange={e => setSelectedWebinarId(e.target.value)}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400">
            {webinars.map(w => (
              <option key={w.id} value={w.id}>{w.title}（{w.date}）</option>
            ))}
          </select>
          {selectedWebinar && (
            <p className="text-xs text-emerald-600 mt-2">✓ 「{selectedWebinar.title}」の情報を自動で差し込みます</p>
          )}
        </div>
      )}

      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {CATS.map(c => (
          <button key={c.id} onClick={() => setCat(c.id)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              cat === c.id ? 'bg-emerald-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}>
            {c.label}
          </button>
        ))}
      </div>

      {/* Templates */}
      <div className="space-y-3">
        {filtered.map(tpl => {
          const filledBody = applyVars(tpl.body, selectedWebinar);
          const filledSubject = tpl.subject ? applyVars(tpl.subject, selectedWebinar) : undefined;
          const isOpen = expanded === tpl.id;
          return (
            <div key={tpl.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <button className="w-full text-left px-5 py-4 flex items-center justify-between gap-3"
                onClick={() => setExpanded(isOpen ? null : tpl.id)}>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CAT_BADGE[tpl.category]}`}>
                    {CAT_LABEL[tpl.category]}
                  </span>
                  <span className="font-semibold text-gray-800 text-sm">{tpl.title}</span>
                </div>
                <span className="text-gray-400 text-sm">{isOpen ? '▲' : '▼'}</span>
              </button>
              {isOpen && (
                <div className="px-5 pb-5 space-y-4 border-t border-gray-50">
                  {filledSubject && (
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs font-semibold text-gray-500">件名</p>
                        <CopyButton text={filledSubject} label="件名をコピー" />
                      </div>
                      <p className="text-sm text-gray-800 bg-gray-50 rounded-lg p-3">{filledSubject}</p>
                    </div>
                  )}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-semibold text-gray-500">本文</p>
                      <CopyButton text={filledBody} label="本文をコピー" onCopy={() => handleCopy(tpl)} />
                    </div>
                    <pre className="text-sm text-gray-700 bg-gray-50 rounded-lg p-4 whitespace-pre-wrap leading-relaxed overflow-x-auto">{filledBody}</pre>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
