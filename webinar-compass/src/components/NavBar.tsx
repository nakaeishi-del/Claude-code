import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const NAV_LINKS = [
  { to: '/', label: 'ホーム' },
  { to: '/webinars', label: 'ウェビナー' },
  { to: '/templates', label: 'テンプレ' },
  { to: '/history', label: '履歴' },
];

export default function NavBar() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  const isActive = (to: string) =>
    to === '/' ? pathname === '/' : pathname.startsWith(to);

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-3xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <Link to="/" className="flex items-center gap-2 font-bold text-slate-800">
            <span className="text-xl">🧭</span>
            <span className="hidden sm:inline text-sm font-bold">ウェビナーコンパス</span>
          </Link>

          {/* Desktop */}
          <div className="hidden sm:flex items-center gap-1">
            {NAV_LINKS.map(l => (
              <Link
                key={l.to}
                to={l.to}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive(l.to)
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {l.label}
              </Link>
            ))}
            <Link
              to="/webinars/new"
              className="ml-2 px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              ＋ 新規作成
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="sm:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            onClick={() => setOpen(o => !o)}
          >
            <span className="text-xl">{open ? '✕' : '☰'}</span>
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="sm:hidden pb-3 flex flex-col gap-1">
            {NAV_LINKS.map(l => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className={`px-3 py-2 rounded-lg text-sm font-medium ${
                  isActive(l.to) ? 'bg-blue-50 text-blue-700' : 'text-slate-600'
                }`}
              >
                {l.label}
              </Link>
            ))}
            <Link
              to="/webinars/new"
              onClick={() => setOpen(false)}
              className="mt-1 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg text-center"
            >
              ＋ 新規ウェビナー作成
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
