import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { getWebinars, getHistory } from '../utils/storage';
import { Webinar, AppHistory } from '../types';

export default function History() {
  const [webinars, setWebinars] = useState<Webinar[]>([]);
  const [history, setHistory] = useState<AppHistory[]>([]);

  useEffect(() => {
    setWebinars(getWebinars());
    setHistory(getHistory());
  }, []);

  const completedWebinars = webinars.filter(w => w.status === 'completed');
  const activeWebinars = webinars.filter(w => w.status === 'upcoming' || w.status === 'ongoing');

  const getCompletionRate = (webinar: Webinar) => {
    if (webinar.tasks.length === 0) return 0;
    const done = webinar.tasks.filter(t => t.status === 'completed').length;
    return Math.round((done / webinar.tasks.length) * 100);
  };

  const recentHistory = [...history]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 20);

  const typeLabels: Record<string, string> = {
    webinar_created: 'ウェビナーを作成',
    task_completed: 'タスクを完了',
    template_copied: 'テンプレートをコピー',
    memo_added: 'メモを追加',
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">📊 履歴・実績</h1>
          <p className="text-gray-500 mt-1 text-sm">これまでの活動記録と達成状況です</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-sm text-center">
            <div className="text-3xl font-bold text-indigo-600">{webinars.length}</div>
            <div className="text-xs text-gray-500 mt-1">総ウェビナー数</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm text-center">
            <div className="text-3xl font-bold text-green-600">{completedWebinars.length}</div>
            <div className="text-xs text-gray-500 mt-1">完了済み</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm text-center">
            <div className="text-3xl font-bold text-orange-500">{activeWebinars.length}</div>
            <div className="text-xs text-gray-500 mt-1">進行中</div>
          </div>
        </div>

        {/* Webinar Progress List */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h2 className="font-bold text-gray-700 mb-4">ウェビナー別 進捗状況</h2>
          {webinars.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-4">ウェビナーがまだありません</p>
          ) : (
            <div className="space-y-4">
              {webinars
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map(w => {
                  const rate = getCompletionRate(w);
                  const done = w.tasks.filter(t => t.status === 'completed').length;
                  return (
                    <div key={w.id} className="border border-gray-100 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <div className="font-medium text-gray-800 text-sm">{w.title}</div>
                          <div className="text-xs text-gray-400">{w.date}</div>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          w.status === 'completed' ? 'bg-green-100 text-green-700' :
                          w.status === 'ongoing' ? 'bg-blue-100 text-blue-700' :
                          w.status === 'upcoming' ? 'bg-indigo-100 text-indigo-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {w.status === 'completed' ? '完了' : w.status === 'ongoing' ? '開催中' : w.status === 'upcoming' ? '開催予定' : 'キャンセル'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-100 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all ${rate === 100 ? 'bg-green-500' : 'bg-indigo-500'}`}
                            style={{ width: `${rate}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500 whitespace-nowrap">
                          {done}/{w.tasks.length} ({rate}%)
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h2 className="font-bold text-gray-700 mb-4">最近のアクティビティ</h2>
          {recentHistory.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-4">まだ操作履歴がありません</p>
          ) : (
            <div className="space-y-2">
              {recentHistory.map(h => (
                <div key={h.id} className="flex items-start gap-3 py-2 border-b border-gray-50 last:border-0">
                  <span className="text-lg mt-0.5">
                    {h.type === 'task_completed' ? '✅' :
                     h.type === 'webinar_created' ? '🎉' :
                     h.type === 'template_copied' ? '📋' : '📝'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-gray-700">{typeLabels[h.type] || h.type}</div>
                    {h.label && <div className="text-xs text-gray-400 truncate">{h.label}</div>}
                  </div>
                  <div className="text-xs text-gray-400 whitespace-nowrap">{formatDate(h.createdAt)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
