import { Outlet, Navigate } from 'react-router-dom';
import { useAppSelector } from '../app/hooks';
import Header from '../components/Header/Header';

export default function StorefrontLayout() {
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const role = useAppSelector((s) => s.auth.user?.role);

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (role !== 'USER') return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Header />
      <main className="pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

