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
