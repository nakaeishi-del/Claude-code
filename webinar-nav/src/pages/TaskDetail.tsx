import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Webinar, Task } from '../types';
import { getWebinar, saveWebinar, addHistory } from '../utils/storage';
import { MESSAGE_TEMPLATES } from '../data/messageTemplates';
import CharacterComment from '../components/CharacterComment';
import CopyButton from '../components/CopyButton';

function applyVars(template: string, webinar: Webinar) {
  const d = new Date(webinar.date);
  const dateStr = `${d.getFullYear()}年${d.getMonth()+1}月${d.getDate()}日（${['日','月','火','水','木','金','土'][d.getDay()]}）`;
  return template
    .replace(/\{\{title\}\}/g, webinar.title)
    .replace(/\{\{date\}\}/g, dateStr)
    .replace(/\{\{time\}\}/g, `${webinar.startTime}〜${webinar.endTime}`)
    .replace(/\{\{zoom_url\}\}/g, webinar.zoomUrl || '（Zoom URLを設定してください）')
    .replace(/\{\{meeting_id\}\}/g, webinar.meetingId || '（IDを設定してください）')
    .replace(/\{\{passcode\}\}/g, webinar.passcode || '（パスコードを設定してください）')
    .replace(/\{\{form_url\}\}/g, webinar.formUrl || '（フォームURLを設定してください）')
    .replace(/\{\{event_page_url\}\}/g, webinar.eventPageUrl || '（イベントページURLを設定してください）')
    .replace(/\{\{archive_url\}\}/g, webinar.archiveUrl || '（アーカイブURLを設定してください）');
}

function getEncouragement(task: Task): { msg: string; mood: 'happy'|'normal'|'cheer' } {
  if (task.status === 'completed') return { msg: 'このタスクは完了済みです！よくできました 🎉', mood: 'happy' };
  const done = task.checklist.filter(c => c.checked).length;
  const total = task.checklist.length;
  if (total > 0 && done === total) return { msg: 'チェックリストが全部完了しました！「完了にする」ボタンを押しましょう 🎉', mood: 'cheer' };
  if (done > 0) return { msg: `${done}/${total} チェック完了！あと少しです、がんばりましょう！`, mood: 'cheer' };
  return { msg: '手順に従って、ひとつずつ確認しながら進めましょう。', mood: 'normal' };
}

export default function TaskDetail() {
  const { id, taskId } = useParams<{ id: string; taskId: string }>();
  const navigate = useNavigate();
  const [webinar, setWebinar] = useState<Webinar | null>(null);
  const [task, setTask] = useState<Task | null>(null);
  const [memo, setMemo] = useState('');
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (!id || !taskId) return;
    const w = getWebinar(id);
    if (!w) { navigate('/webinars'); return; }
    const t = w.tasks.find(t => t.id === taskId);
    if (!t) { navigate(`/webinars/${id}`); return; }
    setWebinar(w);
    setTask(t);
    setMemo(t.memo);
    setCompleted(t.status === 'completed');
  }, [id, taskId, navigate]);

  if (!webinar || !task) return <div className="text-center py-20 text-gray-400">読み込み中…</div>;

  const updateTask = (updated: Task) => {
    const newWebinar = { ...webinar, tasks: webinar.tasks.map(t => t.id === updated.id ? updated : t), updatedAt: new Date().toISOString() };
    saveWebinar(newWebinar);
    setWebinar(newWebinar);
    setTask(updated);
  };

  const toggleCheck = (checkId: string) => {
    const updated = { ...task, checklist: task.checklist.map(c => c.id === checkId ? { ...c, checked: !c.checked } : c) };
    updateTask(updated);
  };

  const handleMemoBlur = () => {
    const updated = { ...task, memo };
    updateTask(updated);
    if (memo.trim()) addHistory({ type: 'memo_added', webinarId: id!, taskId: task.id, label: `「${task.title}」にメモを追加` });
  };

  const handleComplete = () => {
    const updated = { ...task, status: 'completed' as const, completedAt: new Date().toISOString() };
    updateTask(updated);
    setCompleted(true);
    addHistory({ type: 'task_completed', webinarId: id!, taskId: task.id, label: `「${task.title}」を完了` });
  };

  const allRequiredDone = task.checklist.filter(c => c.required).every(c => c.checked);
  const relatedTemplates = MESSAGE_TEMPLATES.filter(t => task.relatedTemplateIds.includes(t.id));
  const { msg, mood } = getEncouragement(task);

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <Link to={`/webinars/${id}`} className="text-gray-400 hover:text-gray-600 text-sm">← {webinar.title.length > 20 ? webinar.title.slice(0,20)+'…' : webinar.title}</Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-start justify-between gap-3 mb-1">
          <h1 className="text-lg font-bold text-gray-800">{task.title}</h1>
          {completed && <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-medium flex-shrink-0">✓ 完了</span>}
        </div>
        <p className="text-xs text-gray-400">期限: {task.dueDate}</p>
        <p className="text-sm text-gray-600 mt-3 leading-relaxed">{task.purpose}</p>
      </div>

      <CharacterComment message={msg} mood={mood} />

      {/* Steps */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h2 className="font-bold text-gray-700 mb-4">📝 作業手順</h2>
        <ol className="space-y-3">
          {task.steps.map((step, i) => (
            <li key={i} className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center">{i+1}</span>
              <p className="text-sm text-gray-700 pt-0.5">{step}</p>
            </li>
          ))}
        </ol>
      </div>

      {/* Checklist */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h2 className="font-bold text-gray-700 mb-4">✅ チェックリスト</h2>
        <div className="space-y-3">
          {task.checklist.map(item => (
            <label key={item.id} className={`flex items-start gap-3 cursor-pointer p-2 rounded-lg hover:bg-gray-50 ${completed ? 'opacity-60' : ''}`}>
              <div className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                item.checked ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300'
              }`} onClick={() => !completed && toggleCheck(item.id)}>
                {item.checked && <svg className="w-3 h-3 text-white" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>}
              </div>
              <div>
                <span className="text-sm text-gray-700">{item.label}</span>
                {item.required && <span className="ml-1 text-xs text-red-400">必須</span>}
              </div>
            </label>
          ))}
        </div>
        {task.checklist.filter(c=>c.required).length > 0 && (
          <p className="text-xs text-gray-400 mt-3">※ 「必須」のチェックが全て完了するとタスク完了ボタンが押せます</p>
        )}
      </div>

      {/* Common mistakes */}
      {task.commonMistakes.length > 0 && (
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
          <h2 className="font-bold text-amber-700 mb-2 text-sm">⚠️ よくあるミス</h2>
          <ul className="space-y-1">
            {task.commonMistakes.map((m, i) => (
              <li key={i} className="text-sm text-amber-700 flex gap-2"><span>•</span><span>{m}</span></li>
            ))}
          </ul>
        </div>
      )}

      {/* Completion criteria */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
        <h2 className="font-bold text-blue-700 mb-1 text-sm">🎯 完了条件</h2>
        <p className="text-sm text-blue-700">{task.completionCriteria}</p>
      </div>

      {/* Related templates */}
      {relatedTemplates.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-bold text-gray-700 mb-4">✉️ 関連文面テンプレ</h2>
          {relatedTemplates.map(tpl => (
            <div key={tpl.id} className="border border-gray-100 rounded-xl p-4 mb-3">
              <div className="flex items-center justify-between mb-3">
                <p className="font-medium text-sm text-gray-800">{tpl.title}</p>
                <CopyButton text={applyVars(tpl.body, webinar)} label="文面をコピー" />
              </div>
              {tpl.subject && (
                <div className="mb-2">
                  <p className="text-xs text-gray-400 mb-1">件名</p>
                  <p className="text-sm text-gray-700 bg-gray-50 rounded p-2">{applyVars(tpl.subject, webinar)}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-gray-400 mb-1">本文</p>
                <pre className="text-xs text-gray-700 bg-gray-50 rounded p-3 whitespace-pre-wrap leading-relaxed overflow-x-auto">{applyVars(tpl.body, webinar)}</pre>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Webinar reference info */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h2 className="font-bold text-gray-700 mb-3 text-sm">📌 ウェビナー情報（参照用）</h2>
        <div className="space-y-2 text-sm">
          {[
            { label: 'Zoom URL', value: webinar.zoomUrl },
            { label: 'ミーティングID', value: webinar.meetingId },
            { label: 'パスコード', value: webinar.passcode },
            { label: '申込フォーム', value: webinar.formUrl },
            { label: 'イベントページ', value: webinar.eventPageUrl },
            { label: 'アーカイブ', value: webinar.archiveUrl },
          ].filter(f => f.value).map(f => (
            <div key={f.label} className="flex items-center gap-2">
              <span className="text-xs text-gray-400 w-24 flex-shrink-0">{f.label}</span>
              <span className="text-gray-700 flex-1 truncate text-xs">{f.value}</span>
              <CopyButton text={f.value} label="コピー" className="text-xs flex-shrink-0" />
            </div>
          ))}
        </div>
      </div>

      {/* Memo */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h2 className="font-bold text-gray-700 mb-3 text-sm">📝 メモ</h2>
        <textarea
          value={memo}
          onChange={e => setMemo(e.target.value)}
          onBlur={handleMemoBlur}
          disabled={completed}
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 resize-none disabled:bg-gray-50"
          rows={3}
          placeholder="気づいたことや確認事項をメモできます"
        />
        <p className="text-xs text-gray-400 mt-1">フォーカスを外すと自動保存されます</p>
      </div>

      {/* Complete button */}
      {!completed && (
        <button
          onClick={handleComplete}
          disabled={!allRequiredDone}
          className={`w-full py-4 rounded-xl font-bold text-base transition-all ${
            allRequiredDone
              ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-100'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          {allRequiredDone ? '✓ タスクを完了にする' : '必須チェックをすべて完了してください'}
        </button>
      )}

      {completed && (
        <div className="text-center py-4 bg-emerald-50 rounded-xl border border-emerald-100">
          <p className="text-2xl mb-1">🎉</p>
          <p className="font-bold text-emerald-700">完了しました！</p>
          <Link to={`/webinars/${id}`} className="text-sm text-emerald-600 underline mt-1 block">ウェビナー詳細に戻る</Link>
        </div>
      )}
    </div>
  );
}
