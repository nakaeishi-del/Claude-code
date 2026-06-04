import { ReactNode } from 'react';
import NavBar from './NavBar';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <main className="max-w-3xl mx-auto px-4 py-6 pb-20">
        {children}
      </main>
    </div>
  );
}
