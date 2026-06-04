import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Webinar } from '../types';
import { saveWebinar, addHistory } from '../utils/storage';
import { generateTasks } from '../utils/taskGenerator';

const FIELDS = [
  { key: 'title', label: 'タイトル', type: 'text', required: true, placeholder: '例：読む力が受験を変える！保護者向けウェビナー' },
  { key: 'date', label: '開催日', type: 'date', required: true, placeholder: '' },
  { key: 'startTime', label: '開始時間', type: 'time', required: true, placeholder: '' },
  { key: 'endTime', label: '終了時間', type: 'time', required: false, placeholder: '' },
  { key: 'target', label: 'ターゲット', type: 'text', required: false, placeholder: '例：中学受験を検討している保護者の方' },
  { key: 'zoomUrl', label: 'Zoom URL', type: 'url', required: false, placeholder: 'https://zoom.us/j/...' },
  { key: 'meetingId', label: 'ミーティングID', type: 'text', required: false, placeholder: '123 4567 8901' },
  { key: 'passcode', label: 'パスコード', type: 'text', required: false, placeholder: 'passcode' },
  { key: 'formUrl', label: '申込フォームURL', type: 'url', required: false, placeholder: 'https://forms.gle/...' },
  { key: 'eventPageUrl', label: 'イベントページURL', type: 'url', required: false, placeholder: 'https://...' },
  { key: 'archiveUrl', label: 'アーカイブURL', type: 'url', required: false, placeholder: '後から追加できます' },
  { key: 'memo', label: 'メモ', type: 'textarea', required: false, placeholder: '自由メモ' },
];

export default function NewWebinar() {
  const navigate = useNavigate();
  const [form, setForm] = useState<Record<string, string>>({
    title: '', date: '', startTime: '11:00', endTime: '12:00',
    target: '', zoomUrl: '', meetingId: '', passcode: '',
    formUrl: '', eventPageUrl: '', archiveUrl: '', memo: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = 'タイトルを入力してください';
    if (!form.date) e.date = '開催日を入力してください';
    if (!form.startTime) e.startTime = '開始時間を入力してください';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const id = `webinar-${Date.now()}`;
    const webinar: Webinar = {
      id, ...form as Omit<Webinar, 'id'|'status'|'tasks'|'createdAt'|'updatedAt'>,
      status: 'upcoming', tasks: [],
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    } as Webinar;
    webinar.tasks = generateTasks(webinar);
    saveWebinar(webinar);
    addHistory({ type: 'webinar_created', webinarId: id, label: `ウェビナー「${webinar.title}」を作成` });
    navigate(`/webinars/${id}`);
  };

  const cls = (key: string) =>
    `w-full px-3 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-colors ${
      errors[key] ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'
    }`;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-800">ウェビナーを作成</h1>
        <p className="text-sm text-gray-500 mt-0.5">入力後、タスクが自動生成されます（13件）</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
          {FIELDS.map(f => (
            <div key={f.key}>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                {f.label} {f.required && <span className="text-red-400">*</span>}
              </label>
              {f.type === 'textarea' ? (
                <textarea
                  value={form[f.key]}
                  onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                  className={cls(f.key)}
                  placeholder={f.placeholder}
                  rows={3}
                />
              ) : (
                <input
                  type={f.type}
                  value={form[f.key]}
                  onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                  className={cls(f.key)}
                  placeholder={f.placeholder}
                />
              )}
              {errors[f.key] && <p className="text-xs text-red-500 mt-1">{errors[f.key]}</p>}
            </div>
          ))}
        </div>

        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 text-sm text-emerald-700">
          <p className="font-semibold mb-1">📋 作成後に自動生成されるタスク（13件）</p>
          <p className="text-xs text-emerald-600">イベントページ作成・フォーム確認・Zoom確認・リマインド・当日チェック・終了後メール・アーカイブ・X告知・LINE依頼・数値確認・振り返りメモ</p>
        </div>

        <div className="flex gap-3">
          <button type="button" onClick={() => navigate(-1)}
            className="flex-1 py-3 border border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-50 transition-colors">
            キャンセル
          </button>
          <button type="submit"
            className="flex-1 py-3 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition-colors">
            作成する →
          </button>
        </div>
      </form>
    </div>
  );
}
