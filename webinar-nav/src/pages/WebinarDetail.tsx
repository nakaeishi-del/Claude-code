import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Webinar } from '../types';
import { getWebinar, saveWebinar } from '../utils/storage';
import ProgressBar from '../components/ProgressBar';
import TaskCard from '../components/TaskCard';
import CharacterComment from '../components/CharacterComment';

export default function WebinarDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [webinar, setWebinar] = useState<Webinar | null>(null);

  useEffect(() => {
    if (!id) return;
    const w = getWebinar(id);
    if (!w) { navigate('/webinars'); return; }
    setWebinar(w);
  }, [id, navigate]);

  if (!webinar) return <div className="text-center py-20 text-gray-400">読み込み中…</div>;

  const done = webinar.tasks.filter(t => t.status === 'completed').length;
  const total = webinar.tasks.length;
  const pct = total > 0 ? (done / total) * 100 : 0;
  const nextTask = webinar.tasks.find(t => t.status !== 'completed' && t.status !== 'skipped');
  const d = new Date(webinar.date);
  const dateStr = `${d.getFullYear()}年${d.getMonth()+1}月${d.getDate()}日（${['日','月','火','水','木','金','土'][d.getDay()]}）`;

  const grouped = {
    before: webinar.tasks.filter(t => ['event-page','form-check','zoom-check','reminder-3days','reminder-1day','line-request'].includes(t.templateId)),
    day: webinar.tasks.filter(t => ['day-check','after-email','x-post'].includes(t.templateId)),
    after: webinar.tasks.filter(t => ['archive-work','archive-email','numbers-check','retrospective'].includes(t.templateId)),
  };

  const handleDelete = () => {
    if (!confirm('このウェビナーを削除しますか？')) return;
    const webinars = JSON.parse(localStorage.getItem('webinar-nav-webinars') || '[]');
    localStorage.setItem('webinar-nav-webinars', JSON.stringify(webinars.filter((w: Webinar) => w.id !== id)));
    navigate('/webinars');
  };

  const handleStatusChange = (status: Webinar['status']) => {
    const updated = { ...webinar, status, updatedAt: new Date().toISOString() };
    saveWebinar(updated);
    setWebinar(updated);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <Link to="/webinars" className="text-gray-400 hover:text-gray-600 text-sm">← 一覧</Link>
      </div>

      {/* Info card */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h1 className="text-lg font-bold text-gray-800 mb-1">{webinar.title}</h1>
        <p className="text-sm text-gray-500 mb-4">{dateStr} {webinar.startTime}〜{webinar.endTime}</p>

        <ProgressBar value={pct} label={`進捗 ${done}/${total} タスク完了`} />

        <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
          {webinar.zoomUrl && (
            <a href={webinar.zoomUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100">
              🎥 Zoom参加URL
            </a>
          )}
          {webinar.formUrl && (
            <a href={webinar.formUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100">
              📝 申込フォーム
            </a>
          )}
          {webinar.eventPageUrl && (
            <a href={webinar.eventPageUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100">
              🌐 イベントページ
            </a>
          )}
          {webinar.archiveUrl && (
            <a href={webinar.archiveUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100">
              ▶ アーカイブ
            </a>
          )}
        </div>

        <div className="mt-4 flex gap-2">
          <select value={webinar.status} onChange={e => handleStatusChange(e.target.value as Webinar['status'])}
            className="text-xs border border-gray-200 rounded-lg px-2 py-1 text-gray-600 bg-white">
            <option value="upcoming">開催予定</option>
            <option value="ongoing">進行中</option>
            <option value="completed">完了</option>
            <option value="cancelled">キャンセル</option>
          </select>
          <Link to={`/templates?webinarId=${id}`}
            className="text-xs px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100">
            ✉️ 文面テンプレを開く
          </Link>
          <button onClick={handleDelete} className="text-xs px-3 py-1 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 ml-auto">
            削除
          </button>
        </div>
      </div>

      {/* Next task highlight */}
      {nextTask && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-xs font-semibold text-amber-600 mb-2">▶ 次にやること</p>
          <Link to={`/webinars/${id}/tasks/${nextTask.id}`}>
            <div className="bg-white rounded-lg p-3 hover:shadow-sm transition-all">
              <p className="font-bold text-gray-800">{nextTask.title}</p>
              <p className="text-xs text-gray-500 mt-1">期限: {nextTask.dueDate}</p>
            </div>
          </Link>
        </div>
      )}

      {pct === 100 && (
        <CharacterComment message="すべてのタスクが完了しました！お疲れさまでした 🎉" mood="happy" />
      )}

      {/* Task groups */}
      {[
        { label: '📅 開催前', tasks: grouped.before },
        { label: '🎤 当日', tasks: grouped.day },
        { label: '📬 開催後', tasks: grouped.after },
      ].map(group => group.tasks.length > 0 && (
        <section key={group.label}>
          <h2 className="font-bold text-gray-600 text-sm mb-3">{group.label}</h2>
          <div className="space-y-2">
            {group.tasks.map(task => (
              <Link key={task.id} to={`/webinars/${id}/tasks/${task.id}`}>
                <TaskCard task={task} onClick={() => {}} />
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
