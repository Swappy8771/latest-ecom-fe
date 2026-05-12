import './App.css';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAppSelector } from './app/hooks';

// Pages
import LandingPage     from './pages/LandingPage';
import LoginPage       from './pages/auth/LoginPage';
import RegisterPage    from './pages/auth/RegisterPage';
import SSOCallbackPage from './pages/auth/SSOCallbackPage';

// ── Guards ────────────────────────────────────────────────────────────────────

export function PrivateRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function GuestRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  return isAuthenticated ? <Navigate to="/" replace /> : <>{children}</>;
}

// ── App ───────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/"            element={<LandingPage />} />

      {/* Auth (guest only) */}
      <Route path="/login"       element={<GuestRoute><LoginPage /></GuestRoute>} />
      <Route path="/register"    element={<GuestRoute><RegisterPage /></GuestRoute>} />
      <Route path="/sso-callback" element={<SSOCallbackPage />} />

      {/* ── Protected routes go here ──
          Example:
          <Route path="/profile"  element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
          <Route path="/orders"   element={<PrivateRoute><OrdersPage  /></PrivateRoute>} />
          <Route path="/seller"   element={<PrivateRoute><SellerDash  /></PrivateRoute>} />
          <Route path="/admin"    element={<PrivateRoute><AdminDash   /></PrivateRoute>} />
      ── */}

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
