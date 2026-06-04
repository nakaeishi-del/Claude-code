import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Webinar, Task } from '../types';
import { getWebinars, saveWebinar } from '../utils/storage';
import { createSampleWebinar } from '../data/sampleWebinars';
import ProgressBar from '../components/ProgressBar';
import CharacterComment from '../components/CharacterComment';
import TaskCard from '../components/TaskCard';
import WebinarCard from '../components/WebinarCard';

const MENU_CARDS = [
  { to: '/webinars', icon: '📋', label: 'ウェビナー一覧', desc: '開催予定・過去のウェビナー' },
  { to: '/templates', icon: '✉️', label: '文面テンプレ', desc: 'メール・SNS・LINE文面' },
  { to: '/history', icon: '📊', label: '履歴・データ', desc: '運用データの確認' },
  { to: '/webinars/new', icon: '＋', label: '新規作成', desc: 'ウェビナーを登録する', primary: true },
];

function getTodayStr() {
  return new Date().toISOString().split('T')[0];
}

export default function Dashboard() {
  const [webinars, setWebinars] = useState<Webinar[]>([]);

  useEffect(() => {
    let ws = getWebinars();
    if (ws.length === 0) {
      const sample = createSampleWebinar();
      saveWebinar(sample);
      ws = [sample];
    }
    setWebinars(ws);
  }, []);

  const today = getTodayStr();
  const allTasks: (Task & { webinarTitle: string })[] = webinars.flatMap(w =>
    w.tasks.map(t => ({ ...t, webinarTitle: w.title }))
  );
  const todayTasks = allTasks.filter(t => t.dueDate === today && t.status !== 'completed');
  const upcomingTasks = allTasks.filter(t => {
    if (t.status === 'completed') return false;
    const diff = (new Date(t.dueDate).getTime() - new Date(today).getTime()) / 86400000;
    return diff > 0 && diff <= 3;
  });
  const completedTasks = allTasks.filter(t => t.status === 'completed');
  const totalTasks = allTasks.length;
  const overallPct = totalTasks > 0 ? (completedTasks.length / totalTasks) * 100 : 0;
  const activeWebinars = webinars.filter(w => w.status === 'upcoming' || w.status === 'ongoing');

  const getComment = () => {
    if (todayTasks.length === 0 && upcomingTasks.length === 0) return { msg: 'お疲れさまです！今日のタスクはありません 🎉', mood: 'happy' as const };
    if (todayTasks.length > 0) return { msg: `今日やるべきタスクが${todayTasks.length}件あります。一つひとつ確認しながら進めましょう！`, mood: 'cheer' as const };
    return { msg: `直近3日以内に${upcomingTasks.length}件のタスクがあります。早めに確認しておきましょう！`, mood: 'normal' as const };
  };
  const { msg, mood } = getComment();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-800 mb-1">ダッシュボード</h1>
        <p className="text-sm text-gray-500">ウェビナー運用の状況を確認しましょう</p>
      </div>

      <CharacterComment message={msg} mood={mood} />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: '今日のタスク', value: todayTasks.length, color: todayTasks.length > 0 ? 'text-amber-600' : 'text-gray-600', bg: todayTasks.length > 0 ? 'bg-amber-50' : 'bg-gray-50' },
          { label: '完了タスク', value: completedTasks.length, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: '進行中ウェビナー', value: activeWebinars.length, color: 'text-blue-600', bg: 'bg-blue-50' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-xl p-3 text-center`}>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {totalTasks > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <ProgressBar value={overallPct} label={`全体進捗 （${completedTasks.length}/${totalTasks}タスク完了）`} />
        </div>
      )}

      {/* Today's tasks */}
      {todayTasks.length > 0 && (
        <section>
          <h2 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
            <span className="text-amber-500">⚡</span> 今日やること
          </h2>
          <div className="space-y-2">
            {todayTasks.slice(0, 5).map(task => {
              const webinar = webinars.find(w => w.id === task.webinarId);
              return (
                <Link key={task.id} to={`/webinars/${task.webinarId}/tasks/${task.id}`}>
                  <TaskCard task={task} onClick={() => {}} />
                </Link>
              );
              void webinar;
            })}
          </div>
        </section>
      )}

      {/* Active webinars */}
      {activeWebinars.length > 0 && (
        <section>
          <h2 className="font-bold text-gray-700 mb-3">進行中のウェビナー</h2>
          <div className="space-y-3">
            {activeWebinars.slice(0, 3).map(w => (
              <Link key={w.id} to={`/webinars/${w.id}`}>
                <WebinarCard webinar={w} onClick={() => {}} />
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Menu cards */}
      <section>
        <h2 className="font-bold text-gray-700 mb-3">メニュー</h2>
        <div className="grid grid-cols-2 gap-3">
          {MENU_CARDS.map(card => (
            <Link
              key={card.to}
              to={card.to}
              className={`rounded-xl p-4 flex flex-col gap-1.5 transition-all hover:shadow-md ${
                card.primary
                  ? 'bg-emerald-500 text-white'
                  : 'bg-white border border-gray-100 shadow-sm hover:border-emerald-200'
              }`}
            >
              <span className="text-2xl">{card.icon}</span>
              <p className={`font-bold text-sm ${card.primary ? 'text-white' : 'text-gray-800'}`}>{card.label}</p>
              <p className={`text-xs ${card.primary ? 'text-emerald-100' : 'text-gray-400'}`}>{card.desc}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
