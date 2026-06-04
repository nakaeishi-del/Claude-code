import NavBar from './NavBar';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <NavBar />
      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {children}
      </main>
    </div>
  );
}
