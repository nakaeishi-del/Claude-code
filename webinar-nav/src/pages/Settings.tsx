import { useState } from 'react';
import Layout from '../components/Layout';
import { getWebinars, getHistory } from '../utils/storage';

export default function Settings() {
  const [cleared, setCleared] = useState(false);
  const [exported, setExported] = useState(false);

  const handleClearData = () => {
    if (!window.confirm('すべてのデータを削除しますか？この操作は元に戻せません。')) return;
    localStorage.removeItem('webinar-nav-webinars');
    localStorage.removeItem('webinar-nav-history');
    setCleared(true);
    setTimeout(() => setCleared(false), 3000);
  };

  const handleExport = () => {
    const data = {
      webinars: getWebinars(),
      history: getHistory(),
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `webinar-nav-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setExported(true);
    setTimeout(() => setExported(false), 3000);
  };

  const webinarCount = getWebinars().length;
  const historyCount = getHistory().length;

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">⚙️ 設定</h1>
          <p className="text-gray-500 mt-1 text-sm">アプリの情報とデータ管理</p>
        </div>

        {/* App Info */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h2 className="font-bold text-gray-700 mb-4">アプリ情報</h2>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500">アプリ名</dt>
              <dd className="font-medium text-gray-800">📚 ウェビナーナビ</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">バージョン</dt>
              <dd className="font-medium text-gray-800">1.0.0</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">データ保存先</dt>
              <dd className="font-medium text-gray-800">ブラウザのローカルストレージ</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">ウェビナー数</dt>
              <dd className="font-medium text-gray-800">{webinarCount} 件</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">操作履歴数</dt>
              <dd className="font-medium text-gray-800">{historyCount} 件</dd>
            </div>
          </dl>
        </div>

        {/* Data Management */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h2 className="font-bold text-gray-700 mb-4">データ管理</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <div className="font-medium text-gray-800 text-sm">データをエクスポート</div>
                <div className="text-xs text-gray-500 mt-0.5">全データをJSONファイルで保存します</div>
              </div>
              <button
                onClick={handleExport}
                className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors"
              >
                {exported ? '✓ 完了！' : 'エクスポート'}
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-100">
              <div>
                <div className="font-medium text-red-700 text-sm">データをすべて削除</div>
                <div className="text-xs text-red-400 mt-0.5">この操作は元に戻せません</div>
              </div>
              <button
                onClick={handleClearData}
                className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
              >
                {cleared ? '✓ 削除しました' : '削除する'}
              </button>
            </div>
          </div>
        </div>

        {/* Usage Tips */}
        <div className="bg-indigo-50 rounded-xl p-5 border border-indigo-100">
          <h2 className="font-bold text-indigo-700 mb-3">💡 使い方のヒント</h2>
          <ul className="space-y-2 text-sm text-indigo-800">
            <li>• データはこのブラウザにのみ保存されます。別のブラウザやデバイスとは共有されません。</li>
            <li>• 定期的にエクスポートしてバックアップを取っておくことをお勧めします。</li>
            <li>• 新規ウェビナー作成時に「スマートペースト」を使うと、テキストから自動入力できます。</li>
            <li>• タスクの詳細ページでメモを残すと、次回の参考になります。</li>
          </ul>
        </div>
      </div>
    </Layout>
  );
}
