import { Webinar } from '../types';

const STATUS_STYLE: Record<string, string> = {
  upcoming: 'bg-blue-100 text-blue-700',
  ongoing: 'bg-amber-100 text-amber-700',
  completed: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-gray-100 text-gray-500',
};
const STATUS_LABEL: Record<string, string> = {
  upcoming: '開催予定', ongoing: '進行中', completed: '完了', cancelled: 'キャンセル',
};

interface Props { webinar: Webinar; onClick: () => void }
export default function WebinarCard({ webinar, onClick }: Props) {
  const done = webinar.tasks.filter(t => t.status === 'completed').length;
  const total = webinar.tasks.length;
  const pct = total > 0 ? (done / total) * 100 : 0;
  const next = webinar.tasks.find(t => t.status !== 'completed' && t.status !== 'skipped');
  const d = new Date(webinar.date);
  const dateStr = `${d.getMonth()+1}月${d.getDate()}日（${['日','月','火','水','木','金','土'][d.getDay()]}）`;
  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white border border-gray-100 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="font-bold text-gray-800 text-base leading-snug">{webinar.title}</h3>
        <span className={`text-xs px-2 py-1 rounded-full font-medium flex-shrink-0 ${STATUS_STYLE[webinar.status]}`}>
          {STATUS_LABEL[webinar.status]}
        </span>
      </div>
      <p className="text-sm text-gray-500 mb-3">{dateStr} {webinar.startTime}〜{webinar.endTime}</p>
      <div className="mb-2">
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>進捗</span><span>{done}/{total} タスク完了</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-emerald-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>
      {next && (
        <div className="mt-3 flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 rounded-lg px-3 py-2">
          <span>▶</span>
          <span className="font-medium">次のタスク：{next.title}</span>
        </div>
      )}
    </button>
  );
}
