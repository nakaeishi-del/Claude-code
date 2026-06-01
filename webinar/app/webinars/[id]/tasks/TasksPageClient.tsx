'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Webinar, WebinarTask, WebinarPhase } from '@/lib/types';
import { getWebinar, saveWebinar } from '@/lib/storage';
import TaskCard from '@/components/TaskCard';

type PhaseInfo = {
  phase: WebinarPhase;
  label: string;
  description: string;
};

const PHASES: PhaseInfo[] = [
  { phase: 'setup', label: '開催準備（7日前まで）', description: 'Zoom・フォーム・LP・サムネイル・告知' },
  { phase: 'threeDaysBefore', label: '開催3日前', description: 'リマインドメール送信' },
  { phase: 'oneDayBefore', label: '開催前日', description: '前日リマインドメール送信' },
  { phase: 'dayOf', label: '当日', description: '事前チェック・開催・終了直後メール' },
  { phase: 'after', label: '開催後', description: '録画編集・YouTube・アーカイブメール・振り返り' },
];

const phaseHeaderColors: Record<WebinarPhase, string> = {
  setup: 'border-l-blue-400 bg-blue-50',
  threeDaysBefore: 'border-l-amber-400 bg-amber-50',
  oneDayBefore: 'border-l-orange-400 bg-orange-50',
  dayOf: 'border-l-red-400 bg-red-50',
  after: 'border-l-purple-400 bg-purple-50',
};

const phaseTextColors: Record<WebinarPhase, string> = {
  setup: 'text-blue-700',
  threeDaysBefore: 'text-amber-700',
  oneDayBefore: 'text-orange-700',
  dayOf: 'text-red-700',
  after: 'text-purple-700',
};

export default function TasksPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [webinar, setWebinar] = useState<Webinar | null>(null);
  const [mounted, setMounted] = useState(false);
  const [filterPhase, setFilterPhase] = useState<WebinarPhase | 'all'>('all');

  useEffect(() => {
    setMounted(true);
    const w = getWebinar(id);
    if (!w) { router.push('/'); return; }
    setWebinar(w);
  }, [id, router]);

  if (!mounted || !webinar) {
    return <div className="flex items-center justify-center min-h-[50vh]"><div className="text-gray-400">読み込み中...</div></div>;
  }

  const handleTaskUpdate = (updatedTask: WebinarTask) => {
    const updatedWebinar = {
      ...webinar,
      tasks: webinar.tasks.map(t => t.id === updatedTask.id ? updatedTask : t),
    };
    saveWebinar(updatedWebinar);
    setWebinar(getWebinar(id) || updatedWebinar);
  };

  const completedCount = webinar.tasks.filter(t => t.completed).length;
  const totalCount = webinar.tasks.length;
  const progress = totalCount > 0 ? Math.round(completedCount / totalCount * 100) : 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayTasks = webinar.tasks.filter(t => {
    if (t.completed) return false;
    const due = new Date(t.dueDate);
    due.setHours(0, 0, 0, 0);
    return due <= today;
  });

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href={`/webinars/${id}`} className="text-gray-400 hover:text-gray-600 text-sm flex items-center gap-1">
          ← {webinar.title.length > 20 ? webinar.title.substring(0, 20) + '...' : webinar.title}
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <h1 className="font-bold text-gray-800">作業ナビ</h1>
          <span className="text-sm font-semibold text-emerald-600">{completedCount}/{totalCount} 完了</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-emerald-400 rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>

        {todayTasks.length > 0 && (
          <div className="mt-3 p-2.5 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-xs font-medium text-amber-700">
              ⚡ 本日期限のタスク: {todayTasks.length}件
            </p>
          </div>
        )}
      </div>

      {/* Phase filter */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setFilterPhase('all')}
          className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            filterPhase === 'all' ? 'bg-gray-800 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
        >
          すべて
        </button>
        {PHASES.map(p => {
          const phaseCount = webinar.tasks.filter(t => t.phase === p.phase && !t.completed).length;
          return (
            <button
              key={p.phase}
              onClick={() => setFilterPhase(p.phase)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                filterPhase === p.phase ? 'bg-gray-800 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {p.label.split('（')[0]}
              {phaseCount > 0 && <span className="ml-1.5 bg-red-400 text-white rounded-full px-1.5 py-0.5 text-xs">{phaseCount}</span>}
            </button>
          );
        })}
      </div>

      {/* Tasks by phase */}
      {PHASES.filter(p => filterPhase === 'all' || filterPhase === p.phase).map(phaseInfo => {
        const tasks = webinar.tasks.filter(t => t.phase === phaseInfo.phase);
        if (tasks.length === 0) return null;

        const completedInPhase = tasks.filter(t => t.completed).length;

        return (
          <div key={phaseInfo.phase}>
            <div className={`rounded-xl border-l-4 p-3 mb-3 ${phaseHeaderColors[phaseInfo.phase]}`}>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className={`font-semibold text-sm ${phaseTextColors[phaseInfo.phase]}`}>{phaseInfo.label}</h2>
                  <p className="text-xs text-gray-500 mt-0.5">{phaseInfo.description}</p>
                </div>
                <span className="text-xs font-medium text-gray-500">{completedInPhase}/{tasks.length}</span>
              </div>
            </div>

            <div className="space-y-3">
              {tasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  webinarId={id}
                  onUpdate={handleTaskUpdate}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
