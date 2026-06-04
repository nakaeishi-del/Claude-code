import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const NAV_ITEMS = [
  { to: '/', label: 'ホーム', icon: '🏠' },
  { to: '/webinars', label: '一覧', icon: '📋' },
  { to: '/templates', label: 'テンプレ', icon: '✉️' },
  { to: '/history', label: '履歴', icon: '📊' },
];

export default function NavBar() {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  return (
    <nav className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-50">
      <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl">📚</span>
          <span className="font-bold text-emerald-600 text-base">ウェビナーナビ</span>
        </Link>
        {/* Desktop nav */}
        <div className="hidden sm:flex items-center gap-1">
          {NAV_ITEMS.map(item => (
            <Link
              key={item.to}
              to={item.to}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === item.to
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              {item.icon} {item.label}
            </Link>
          ))}
          <Link to="/webinars/new" className="ml-2 px-3 py-1.5 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors">
            ＋ 新規
          </Link>
        </div>
        {/* Mobile menu button */}
        <button className="sm:hidden text-gray-500 p-2" onClick={() => setOpen(!open)}>
          {open ? '✕' : '☰'}
        </button>
      </div>
      {/* Mobile menu */}
      {open && (
        <div className="sm:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-1">
          {NAV_ITEMS.map(item => (
            <Link key={item.to} to={item.to} onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
              <span>{item.icon}</span>{item.label}
            </Link>
          ))}
          <Link to="/webinars/new" onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium bg-emerald-500 text-white mt-2">
            <span>＋</span>新規ウェビナー作成
          </Link>
        </div>
      )}
    </nav>
  );
}
