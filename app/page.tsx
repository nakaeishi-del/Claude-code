'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Webinar, WebinarTask } from '@/lib/types';
import { getWebinars, saveWebinar } from '@/lib/storage';
import { createSampleWebinar } from '@/lib/sampleData';

function formatJapaneseDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

function getDaysUntil(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function getProgress(webinar: Webinar): number {
  if (!webinar.tasks || webinar.tasks.length === 0) return 0;
  const completed = webinar.tasks.filter(t => t.completed).length;
  return Math.round((completed / webinar.tasks.length) * 100);
}

function getMissingUrls(webinar: Webinar): string[] {
  const missing: string[] = [];
  if (!webinar.zoomUrl) missing.push('Zoom URL');
  if (!webinar.formUrl) missing.push('申込フォームURL');
  if (!webinar.lpUrl) missing.push('イベントページURL');
  return missing;
}

type TodayTask = {
  task: WebinarTask;
  webinar: Webinar;
};

export default function DashboardPage() {
  const [webinars, setWebinars] = useState<Webinar[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setWebinars(getWebinars());
  }, []);

  const handleAddSample = () => {
    const sample = createSampleWebinar();
    saveWebinar(sample);
    setWebinars(getWebinars());
  };

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-gray-400">読み込み中...</div>
      </div>
    );
  }

  // Gather today's and overdue tasks from all webinars
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split('T')[0];

  const todayTasks: TodayTask[] = [];
  const overdueTasks: TodayTask[] = [];

  webinars.forEach(webinar => {
    (webinar.tasks || []).forEach(task => {
      if (task.completed) return;
      const dueDate = new Date(task.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      const dueStr = dueDate.toISOString().split('T')[0];
      if (dueStr === todayStr) {
        todayTasks.push({ task, webinar });
      } else if (dueStr < todayStr) {
        overdueTasks.push({ task, webinar });
      }
    });
  });

  const upcomingWebinars = webinars
    .filter(w => getDaysUntil(w.date) >= 0)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const pastWebinars = webinars
    .filter(w => getDaysUntil(w.date) < 0)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const warningWebinars = webinars.filter(w => {
    if (getDaysUntil(w.date) < 0) return false;
    return getMissingUrls(w).length > 0;
  });

  if (webinars.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="text-6xl mb-4">📚</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">ウェビナー運用ナビへようこそ</h1>
        <p className="text-gray-500 mb-8 max-w-md">
          ヨンデミーのウェビナー運用をスムーズに進めるためのツールです。
          まず最初のウェビナーを作成しましょう。
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/webinars/new"
            className="px-6 py-3 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600 transition-colors"
          >
            + 新しいウェビナーを作成
          </Link>
          <button
            onClick={handleAddSample}
            className="px-6 py-3 bg-white text-gray-600 border border-gray-200 rounded-xl font-medium hover:bg-gray-50 transition-colors"
          >
            サンプルを追加して試す
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800">ダッシュボード</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
          </p>
        </div>
        <Link
          href="/webinars/new"
          className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors"
        >
          + 新しいウェビナーを作成
        </Link>
      </div>

      {/* Overdue Tasks */}
      {overdueTasks.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <h2 className="text-sm font-semibold text-red-700 mb-3 flex items-center gap-2">
            <span>⚠️</span> 期限切れのタスク ({overdueTasks.length}件)
          </h2>
          <div className="space-y-2">
            {overdueTasks.slice(0, 5).map(({ task, webinar }) => (
              <Link
                key={task.id}
                href={`/webinars/${webinar.id}/tasks`}
                className="flex items-center gap-3 p-2.5 bg-white rounded-lg hover:bg-red-50 transition-colors group"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{task.title}</p>
                  <p className="text-xs text-gray-400 truncate">{webinar.title}</p>
                </div>
                <span className="text-xs text-red-500 font-medium flex-shrink-0">
                  {new Date(task.dueDate).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })}まで
                </span>
              </Link>
            ))}
            {overdueTasks.length > 5 && (
              <p className="text-xs text-red-500 text-center">他 {overdueTasks.length - 5} 件</p>
            )}
          </div>
        </div>
      )}

      {/* Today's Tasks */}
      {todayTasks.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <span className="text-lg">📋</span> 今日やること ({todayTasks.length}件)
          </h2>
          <div className="space-y-2">
            {todayTasks.map(({ task, webinar }) => (
              <Link
                key={task.id}
                href={`/webinars/${webinar.id}/tasks`}
                className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="w-4 h-4 rounded border-2 border-gray-300 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{task.title}</p>
                  <p className="text-xs text-gray-400 truncate">{webinar.title}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Warnings */}
      {warningWebinars.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <h2 className="text-sm font-semibold text-amber-700 mb-2 flex items-center gap-2">
            <span>⚠️</span> URL未設定の警告
          </h2>
          <div className="space-y-2">
            {warningWebinars.map(webinar => {
              const missing = getMissingUrls(webinar);
              return (
                <Link
                  key={webinar.id}
                  href={`/webinars/${webinar.id}`}
                  className="flex items-start gap-2 p-2.5 bg-white rounded-lg hover:bg-amber-50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{webinar.title}</p>
                    <p className="text-xs text-amber-600 mt-0.5">{missing.join('、')}が未設定</p>
                  </div>
                  <span className="text-xs text-gray-400 flex-shrink-0">
                    {formatJapaneseDate(webinar.date)}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Upcoming Webinars */}
      {upcomingWebinars.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-700 mb-3">今後のウェビナー</h2>
          <div className="space-y-3">
            {upcomingWebinars.map(webinar => {
              const daysUntil = getDaysUntil(webinar.date);
              const progress = getProgress(webinar);
              const completed = webinar.tasks?.filter(t => t.completed).length || 0;
              const total = webinar.tasks?.length || 0;

              return (
                <Link
                  key={webinar.id}
                  href={`/webinars/${webinar.id}`}
                  className="block bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-800 truncate">{webinar.title}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-sm text-gray-500">{formatJapaneseDate(webinar.date)}</span>
                        <span className="text-sm text-gray-400">{webinar.startTime}~{webinar.endTime}</span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      {daysUntil === 0 ? (
                        <span className="text-xs font-semibold text-red-500 bg-red-50 px-2 py-1 rounded-full">今日</span>
                      ) : daysUntil <= 3 ? (
                        <span className="text-xs font-semibold text-orange-500 bg-orange-50 px-2 py-1 rounded-full">あと{daysUntil}日</span>
                      ) : (
                        <span className="text-xs text-gray-400">あと{daysUntil}日</span>
                      )}
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-400">進捗</span>
                      <span className="text-xs font-medium text-gray-600">{completed}/{total} タスク完了</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-400 rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Past Webinars */}
      {pastWebinars.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-400 mb-3">過去のウェビナー</h2>
          <div className="space-y-2">
            {pastWebinars.map(webinar => {
              const progress = getProgress(webinar);
              const completed = webinar.tasks?.filter(t => t.completed).length || 0;
              const total = webinar.tasks?.length || 0;
              return (
                <Link
                  key={webinar.id}
                  href={`/webinars/${webinar.id}`}
                  className="flex items-center gap-3 bg-white border border-gray-100 rounded-xl p-3 shadow-sm hover:border-gray-200 transition-all opacity-75"
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-600 truncate">{webinar.title}</h3>
                    <span className="text-xs text-gray-400">{formatJapaneseDate(webinar.date)}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs text-gray-400">{completed}/{total}</span>
                    <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gray-300 rounded-full"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty state actions */}
      {webinars.length > 0 && webinars.length < 2 && (
        <div className="text-center pt-2">
          <button
            onClick={handleAddSample}
            className="text-sm text-gray-400 hover:text-gray-600 underline"
          >
            サンプルを追加
          </button>
        </div>
      )}
    </div>
  );
}
