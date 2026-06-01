'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Webinar } from '@/lib/types';
import { saveWebinar } from '@/lib/storage';
import { generateTasks } from '@/lib/tasks';

const DAYS = ['日', '月', '火', '水', '木', '金', '土'];

function calcDayOfWeek(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return DAYS[d.getDay()] || '';
}

function parseWebinarText(text: string) {
  const result: Partial<{
    title: string; date: string; dayOfWeek: string;
    startTime: string; endTime: string; speaker: string;
    targetAudience: string; theme: string; mainProblem: string;
    empathyText: string; takeaways: string[];
  }> = {};

  // Date: 2024年7月15日 or 7月15日
  const dateMatch = text.match(/(\d{4})年(\d{1,2})月(\d{1,2})日/) ||
                    text.match(/(\d{1,2})月(\d{1,2})日/);
  if (dateMatch) {
    const year = dateMatch.length === 4 ? parseInt(dateMatch[1]) : new Date().getFullYear();
    const month = dateMatch.length === 4 ? parseInt(dateMatch[2]) : parseInt(dateMatch[1]);
    const day = dateMatch.length === 4 ? parseInt(dateMatch[3]) : parseInt(dateMatch[2]);
    result.date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    result.dayOfWeek = calcDayOfWeek(result.date);
  }

  // Day of week: （月） or (月)
  const dowMatch = text.match(/[（(]([月火水木金土日])[）)]/);
  if (dowMatch) result.dayOfWeek = dowMatch[1];

  // Time: 11:00〜12:00 or 11:00-12:00 or 11時〜12時
  const timeMatch = text.match(/(\d{1,2})[：:](\d{2})\s*[〜~-]\s*(\d{1,2})[：:](\d{2})/);
  if (timeMatch) {
    result.startTime = `${String(parseInt(timeMatch[1])).padStart(2, '0')}:${timeMatch[2]}`;
    result.endTime = `${String(parseInt(timeMatch[3])).padStart(2, '0')}:${timeMatch[4]}`;
  } else {
    const times = text.match(/\d{1,2}[：:]\d{2}/g);
    if (times && times[0]) result.startTime = times[0].replace('：', ':');
    if (times && times[1]) result.endTime = times[1].replace('：', ':');
  }

  // Speaker: 登壇者：xxx or 講師：xxx or スピーカー：xxx
  const speakerMatch = text.match(/(?:登壇者|講師|スピーカー)[：:]\s*(.+)/);
  if (speakerMatch) result.speaker = speakerMatch[1].trim();

  // Target audience: 対象：xxx or 対象者：xxx
  const targetMatch = text.match(/対象者?[：:]\s*(.+)/);
  if (targetMatch) result.targetAudience = targetMatch[1].trim();

  // Theme: テーマ：xxx
  const themeMatch = text.match(/テーマ[：:]\s*(.+)/);
  if (themeMatch) result.theme = themeMatch[1].trim();

  // Main problem: 悩み：xxx or お悩み：xxx
  const problemMatch = text.match(/(?:お?悩み|課題)[：:]\s*(.+)/);
  if (problemMatch) result.mainProblem = problemMatch[1].trim();

  // Takeaways: bullet points with ・, •, ★, ▶, ■, →
  const bulletLines = text.split('\n')
    .filter(l => /^[・•★▶■→□◆◇✓✔]/.test(l.trim()))
    .map(l => l.replace(/^[・•★▶■→□◆◇✓✔]\s*/, '').trim())
    .filter(l => l.length > 0 && l.length < 100);
  if (bulletLines.length > 0) result.takeaways = bulletLines.slice(0, 6);

  // Title: look for line with 「」quotes or first substantial line without keywords
  const titleMatch = text.match(/「([^」]+)」/);
  if (titleMatch) {
    result.title = titleMatch[1];
  } else {
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 5 && l.length < 80);
    const skipPatterns = /^(?:\d|[月火水木金土日]|http|登壇|対象|テーマ|講師|スピーカー|悩み|お申込|申込|参加費|無料)/;
    const titleLine = lines.find(l => !skipPatterns.test(l) && !/\d{1,2}[：:]\d{2}/.test(l));
    if (titleLine) result.title = titleLine;
  }

  return result;
}

export default function NewWebinarPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: '',
    date: '',
    dayOfWeek: '',
    startTime: '11:00',
    endTime: '12:00',
    targetAudience: '',
    theme: '',
    speaker: '',
    mainProblem: '',
    empathyText: '',
    zoomAdminUrl: '',
    formEditUrl: '',
    lpEditUrl: '',
    figmaUrl: '',
    youtubeStudioUrl: '',
    mailToolUrl: '',
    lineRequestUrl: '',
    slackUrl: '',
    yondemyLpUrl: '',
  });
  const [takeaways, setTakeaways] = useState<string[]>(['', '', '']);
  const [relatedArchives, setRelatedArchives] = useState<{ title: string; url: string }[]>([{ title: '', url: '' }]);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pasteText, setPasteText] = useState('');
  const [parseResult, setParseResult] = useState<string[]>([]);

  const handleSmartFill = () => {
    if (!pasteText.trim()) return;
    const parsed = parseWebinarText(pasteText);
    const applied: string[] = [];

    setForm(prev => {
      const next = { ...prev };
      if (parsed.title) { next.title = parsed.title; applied.push('タイトル'); }
      if (parsed.date) { next.date = parsed.date; applied.push('開催日'); }
      if (parsed.dayOfWeek) { next.dayOfWeek = parsed.dayOfWeek; applied.push('曜日'); }
      if (parsed.startTime) { next.startTime = parsed.startTime; applied.push('開始時間'); }
      if (parsed.endTime) { next.endTime = parsed.endTime; applied.push('終了時間'); }
      if (parsed.speaker) { next.speaker = parsed.speaker; applied.push('登壇者'); }
      if (parsed.targetAudience) { next.targetAudience = parsed.targetAudience; applied.push('対象者'); }
      if (parsed.theme) { next.theme = parsed.theme; applied.push('テーマ'); }
      if (parsed.mainProblem) { next.mainProblem = parsed.mainProblem; applied.push('メインの悩み'); }
      if (parsed.empathyText) { next.empathyText = parsed.empathyText; applied.push('共感文'); }
      return next;
    });
    if (parsed.takeaways && parsed.takeaways.length > 0) {
      setTakeaways(parsed.takeaways);
      applied.push('当日わかること');
    }
    setParseResult(applied);
  };

  const handleChange = (key: string, value: string) => {
    setForm(prev => {
      const updated = { ...prev, [key]: value };
      if (key === 'date') {
        updated.dayOfWeek = calcDayOfWeek(value);
      }
      return updated;
    });
    if (errors[key]) {
      setErrors(prev => { const e = { ...prev }; delete e[key]; return e; });
    }
  };

  const handleTakeawayChange = (index: number, value: string) => {
    setTakeaways(prev => prev.map((t, i) => i === index ? value : t));
  };

  const addTakeaway = () => setTakeaways(prev => [...prev, '']);
  const removeTakeaway = (index: number) => {
    if (takeaways.length <= 1) return;
    setTakeaways(prev => prev.filter((_, i) => i !== index));
  };

  const handleArchiveChange = (index: number, key: 'title' | 'url', value: string) => {
    setRelatedArchives(prev => prev.map((a, i) => i === index ? { ...a, [key]: value } : a));
  };

  const addArchive = () => setRelatedArchives(prev => [...prev, { title: '', url: '' }]);
  const removeArchive = (index: number) => {
    setRelatedArchives(prev => prev.filter((_, i) => i !== index));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.title.trim()) newErrors.title = 'タイトルは必須です';
    if (!form.date) newErrors.date = '開催日は必須です';
    if (!form.startTime) newErrors.startTime = '開始時間は必須です';
    if (!form.endTime) newErrors.endTime = '終了時間は必須です';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);

    const id = `webinar-${Date.now()}`;
    const filteredTakeaways = takeaways.filter(t => t.trim());
    const filteredArchives = relatedArchives.filter(a => a.title.trim() || a.url.trim());

    const webinar: Webinar = {
      id,
      title: form.title,
      date: form.date,
      dayOfWeek: form.dayOfWeek || calcDayOfWeek(form.date),
      startTime: form.startTime,
      endTime: form.endTime,
      targetAudience: form.targetAudience,
      theme: form.theme,
      speaker: form.speaker,
      mainProblem: form.mainProblem,
      empathyText: form.empathyText,
      takeaways: filteredTakeaways,
      zoomUrl: '',
      zoomMeetingId: '',
      zoomPasscode: '',
      zoomAdminUrl: form.zoomAdminUrl,
      formUrl: '',
      formEditUrl: form.formEditUrl,
      responseSheetUrl: '',
      surveyUrl: '',
      lpUrl: '',
      lpEditUrl: form.lpEditUrl,
      eventListUrl: '',
      youtubeUrl: '',
      youtubeStudioUrl: form.youtubeStudioUrl,
      thumbnailUrl: '',
      figmaUrl: form.figmaUrl,
      mailToolUrl: form.mailToolUrl,
      lineRequestUrl: form.lineRequestUrl,
      slackUrl: form.slackUrl,
      yondemyLpUrl: form.yondemyLpUrl,
      hamaruUrl: '',
      relatedArchives: filteredArchives,
      relatedNotes: [],
      tasks: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    webinar.tasks = generateTasks(webinar);
    saveWebinar(webinar);
    router.push(`/webinars/${id}`);
  };

  const inputClass = (field: string) =>
    `w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-1 transition-colors ${
      errors[field]
        ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
        : 'border-gray-200 focus:border-emerald-500 focus:ring-emerald-500'
    }`;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-800">新しいウェビナーを作成</h1>
        <p className="text-sm text-gray-500 mt-1">情報を入力すると、16個のタスクが自動生成されます</p>
      </div>

      {/* Smart paste area */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">✨</span>
          <div>
            <p className="text-sm font-semibold text-emerald-800">テキストから自動入力</p>
            <p className="text-xs text-emerald-600">NotionやSlackのテキストを貼り付けると自動でフォームを埋めます</p>
          </div>
        </div>
        <textarea
          value={pasteText}
          onChange={e => { setPasteText(e.target.value); setParseResult([]); }}
          className="w-full px-3 py-2.5 text-sm border border-emerald-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-white resize-none"
          rows={4}
          placeholder={`例：\n読む力が受験を変える！「自分で学べる子」になるための方法\n2024年7月15日（月）11:00〜12:00\n登壇者：笹沼颯太\n対象者：中学受験を検討している保護者`}
        />
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleSmartFill}
            disabled={!pasteText.trim()}
            className="px-4 py-2 bg-emerald-500 text-white text-sm font-medium rounded-lg hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            自動入力する
          </button>
          {parseResult.length > 0 && (
            <p className="text-xs text-emerald-700">
              {parseResult.join('・')} を入力しました
            </p>
          )}
          {pasteText.trim() && parseResult.length === 0 && (
            <p className="text-xs text-gray-400">「自動入力する」を押すと反映されます</p>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 基本情報 */}
        <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
          <h2 className="font-semibold text-gray-700 text-sm border-b border-gray-100 pb-2">基本情報</h2>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              タイトル <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={e => handleChange('title', e.target.value)}
              className={inputClass('title')}
              placeholder="例：読む力が受験を変える！「自分で学べる子」になるための方法"
            />
            {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                開催日 <span className="text-red-400">*</span>
              </label>
              <input
                type="date"
                value={form.date}
                onChange={e => handleChange('date', e.target.value)}
                className={inputClass('date')}
              />
              {errors.date && <p className="text-xs text-red-500 mt-1">{errors.date}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">曜日</label>
              <input
                type="text"
                value={form.dayOfWeek}
                onChange={e => handleChange('dayOfWeek', e.target.value)}
                className={inputClass('dayOfWeek')}
                placeholder="自動計算"
                maxLength={1}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                開始時間 <span className="text-red-400">*</span>
              </label>
              <input
                type="time"
                value={form.startTime}
                onChange={e => handleChange('startTime', e.target.value)}
                className={inputClass('startTime')}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                終了時間 <span className="text-red-400">*</span>
              </label>
              <input
                type="time"
                value={form.endTime}
                onChange={e => handleChange('endTime', e.target.value)}
                className={inputClass('endTime')}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">対象者</label>
            <input
              type="text"
              value={form.targetAudience}
              onChange={e => handleChange('targetAudience', e.target.value)}
              className={inputClass('targetAudience')}
              placeholder="例：中学受験を検討している保護者"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">テーマ</label>
            <input
              type="text"
              value={form.theme}
              onChange={e => handleChange('theme', e.target.value)}
              className={inputClass('theme')}
              placeholder="例：受験につながる読む力"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">登壇者</label>
            <input
              type="text"
              value={form.speaker}
              onChange={e => handleChange('speaker', e.target.value)}
              className={inputClass('speaker')}
              placeholder="例：笹沼颯太"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">メインの悩み</label>
            <textarea
              value={form.mainProblem}
              onChange={e => handleChange('mainProblem', e.target.value)}
              className={inputClass('mainProblem')}
              rows={2}
              placeholder="例：塾で習ったことはわかるのに、家で一人だとなかなか勉強が進まない……"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">保護者への共感文</label>
            <textarea
              value={form.empathyText}
              onChange={e => handleChange('empathyText', e.target.value)}
              className={inputClass('empathyText')}
              rows={2}
              placeholder="例：そんなお悩みの背景には、「読む力」が関係しているかもしれません。"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">当日わかること</label>
            <div className="space-y-2">
              {takeaways.map((t, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    type="text"
                    value={t}
                    onChange={e => handleTakeawayChange(i, e.target.value)}
                    className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    placeholder={`ポイント ${i + 1}`}
                  />
                  {takeaways.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTakeaway(i)}
                      className="px-2 py-1 text-gray-400 hover:text-red-400 transition-colors"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addTakeaway}
                className="text-sm text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
              >
                + 追加
              </button>
            </div>
          </div>
        </section>

        {/* 外部ツールURL */}
        <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
          <h2 className="font-semibold text-gray-700 text-sm border-b border-gray-100 pb-2">
            外部ツールURL
            <span className="text-xs font-normal text-gray-400 ml-2">（後から追加・変更できます）</span>
          </h2>

          {[
            { key: 'zoomAdminUrl', label: 'Zoom管理画面URL', placeholder: 'https://zoom.us/...' },
            { key: 'formEditUrl', label: 'Googleフォーム編集URL', placeholder: 'https://docs.google.com/forms/...' },
            { key: 'lpEditUrl', label: 'イベントページ編集URL', placeholder: 'https://...' },
            { key: 'figmaUrl', label: 'Figma URL', placeholder: 'https://figma.com/...' },
            { key: 'youtubeStudioUrl', label: 'YouTube Studio URL', placeholder: 'https://studio.youtube.com/...' },
            { key: 'mailToolUrl', label: 'メール配信ツールURL', placeholder: 'https://...' },
            { key: 'lineRequestUrl', label: 'LINE配信依頼先URL', placeholder: 'https://...' },
            { key: 'slackUrl', label: 'Slack URL', placeholder: 'https://app.slack.com/...' },
            { key: 'yondemyLpUrl', label: 'ヨンデミーLP URL', placeholder: 'https://lp.yondemy.com/...' },
          ].map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
              <input
                type="url"
                value={form[key as keyof typeof form] as string}
                onChange={e => handleChange(key, e.target.value)}
                className={inputClass(key)}
                placeholder={placeholder}
              />
            </div>
          ))}
        </section>

        {/* 関連コンテンツ */}
        <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
          <h2 className="font-semibold text-gray-700 text-sm border-b border-gray-100 pb-2">関連コンテンツ</h2>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">関連する過去回</label>
            <div className="space-y-3">
              {relatedArchives.map((archive, i) => (
                <div key={i} className="space-y-2 p-3 bg-gray-50 rounded-lg">
                  <input
                    type="text"
                    value={archive.title}
                    onChange={e => handleArchiveChange(i, 'title', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-500 bg-white"
                    placeholder="タイトル"
                  />
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={archive.url}
                      onChange={e => handleArchiveChange(i, 'url', e.target.value)}
                      className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-500 bg-white"
                      placeholder="URL"
                    />
                    <button
                      type="button"
                      onClick={() => removeArchive(i)}
                      className="px-2 py-1 text-gray-400 hover:text-red-400 transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={addArchive}
                className="text-sm text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
              >
                + 関連コンテンツを追加
              </button>
            </div>
          </div>
        </section>

        {/* Submit */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-50 transition-colors"
          >
            キャンセル
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 py-2.5 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? '作成中...' : 'ウェビナーを作成 →'}
          </button>
        </div>
      </form>
    </div>
  );
}
