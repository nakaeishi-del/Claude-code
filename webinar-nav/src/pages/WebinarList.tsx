import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Webinar } from '../types';
import { getWebinars } from '../utils/storage';
import WebinarCard from '../components/WebinarCard';

export default function WebinarList() {
  const [webinars, setWebinars] = useState<Webinar[]>([]);
  useEffect(() => { setWebinars(getWebinars()); }, []);

  const sorted = [...webinars].sort((a, b) => a.date < b.date ? -1 : 1);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800">ウェビナー一覧</h1>
          <p className="text-sm text-gray-500 mt-0.5">{webinars.length}件のウェビナー</p>
        </div>
        <Link to="/webinars/new" className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-sm font-bold hover:bg-emerald-600 transition-colors">
          ＋ 新規作成
        </Link>
      </div>

      {sorted.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <p className="text-4xl mb-3">📭</p>
          <p className="text-gray-500 mb-4">まだウェビナーが登録されていません</p>
          <Link to="/webinars/new" className="px-5 py-2.5 bg-emerald-500 text-white rounded-xl text-sm font-bold hover:bg-emerald-600 transition-colors">
            最初のウェビナーを作成する
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map(w => (
            <Link key={w.id} to={`/webinars/${w.id}`}>
              <WebinarCard webinar={w} onClick={() => {}} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
