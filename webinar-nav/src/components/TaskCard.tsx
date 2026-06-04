import { Task } from '../types';

const STATUS_STYLE: Record<string, string> = {
  pending: 'bg-gray-100 text-gray-600',
  in_progress: 'bg-blue-100 text-blue-700',
  completed: 'bg-emerald-100 text-emerald-700',
  skipped: 'bg-gray-100 text-gray-400',
};
const STATUS_LABEL: Record<string, string> = {
  pending: '未着手', in_progress: '進行中', completed: '完了', skipped: 'スキップ',
};

function urgencyBadge(task: Task) {
  if (task.status === 'completed') return null;
  const today = new Date(); today.setHours(0,0,0,0);
  const due = new Date(task.dueDate); due.setHours(0,0,0,0);
  const diff = Math.floor((due.getTime() - today.getTime()) / 86400000);
  if (diff < 0) return <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">期限超過</span>;
  if (diff === 0) return <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">今日</span>;
  if (diff <= 3) return <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-medium">あと{diff}日</span>;
  return null;
}

interface Props { task: Task; onClick: () => void }
export default function TaskCard({ task, onClick }: Props) {
  const done = task.checklist.filter(c => c.checked).length;
  const total = task.checklist.length;
  const pct = total > 0 ? (done / total) * 100 : 0;
  return (
    <button
      onClick={onClick}
      className={`w-full text-left bg-white border rounded-xl p-4 shadow-sm hover:shadow-md transition-all ${
        task.status === 'completed' ? 'border-emerald-100 opacity-75' : 'border-gray-100 hover:border-emerald-200'
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLE[task.status]}`}>
            {STATUS_LABEL[task.status]}
          </span>
          {urgencyBadge(task)}
        </div>
        <span className="text-xs text-gray-400 flex-shrink-0">{task.dueDate}</span>
      </div>
      <p className={`font-medium text-sm mb-2 ${task.status === 'completed' ? 'line-through text-gray-400' : 'text-gray-800'}`}>
        {task.title}
      </p>
      {total > 0 && (
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${pct}%` }} />
          </div>
          <span className="text-xs text-gray-400">{done}/{total}</span>
        </div>
      )}
    </button>
  );
}
