import './App.css';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAppSelector } from './app/hooks';

// Layout
import AppLayout from './layouts/AppLayout';
import StorefrontLayout from './layouts/StorefrontLayout';
import AccountLayout from './layouts/AccountLayout';

// Public pages
import LandingPage           from './pages/LandingPage';
import ProductsPage          from './pages/ProductsPage';
import ProductDetailPage     from './pages/ProductDetailPage';

// Auth pages
import LoginPage             from './pages/auth/LoginPage';
import RegisterPage          from './pages/auth/RegisterPage';
import SSOCallbackPage       from './pages/auth/SSOCallbackPage';

// User pages (inside AppLayout)
import ProfilePage           from './pages/ProfilePage';
import AddressesPage         from './pages/AddressesPage';
import UserHomePage          from './pages/user/UserHomePage';
import OrdersPage            from './pages/user/OrdersPage';
import WishlistPage          from './pages/user/WishlistPage';
import WalletPage            from './pages/user/WalletPage';
import SettingsPage          from './pages/user/SettingsPage';

// Seller pages (inside AppLayout)
import SellerProductsPage    from './pages/seller/SellerProductsPage';
import SellerProductFormPage from './pages/seller/SellerProductFormPage';
import SellerDashboardPage   from './pages/seller/SellerDashboardPage';
import SellerOrdersPage      from './pages/seller/SellerOrdersPage';
import SellerAnalyticsPage   from './pages/seller/SellerAnalyticsPage';
import SellerProfilePage     from './pages/seller/SellerProfilePage';
import SellerSettingsPage    from './pages/seller/SellerSettingsPage';

// Admin pages (inside AppLayout)
import AdminUsersPage        from './pages/admin/AdminUsersPage';
import AdminUserDetailPage   from './pages/admin/AdminUserDetailPage';
import AdminSellersPage      from './pages/admin/AdminSellersPage';
import AdminDashboardPage    from './pages/admin/AdminDashboardPage';
import AdminProductsPage     from './pages/admin/AdminProductsPage';
import AdminOrdersPage       from './pages/admin/AdminOrdersPage';
import AdminCategoriesPage   from './pages/admin/AdminCategoriesPage';
import AdminAnalyticsPage    from './pages/admin/AdminAnalyticsPage';
import AdminAuditLogsPage    from './pages/admin/AdminAuditLogsPage';
import AdminSettingsPage     from './pages/admin/AdminSettingsPage';

// ── Route guards ──────────────────────────────────────────────────────────────

function GuestRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  return isAuthenticated ? <Navigate to="/" replace /> : <>{children}</>;
}

function RoleRedirect() {
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const user = useAppSelector((s) => s.auth.user);
  if (!isAuthenticated) return <Navigate to="/" replace />;
  if (user?.role === 'ADMIN') return <Navigate to="/admin/users" replace />;
  if (user?.role === 'SELLER') return <Navigate to="/seller" replace />;
  return <Navigate to="/home" replace />;
}

function RootRoute() {
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  return isAuthenticated ? <RoleRedirect /> : <LandingPage />;
}

function SellerAdminRoute({ children }: { children: React.ReactNode }) {
  const user = useAppSelector((s) => s.auth.user);
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== 'SELLER' && user?.role !== 'ADMIN') return <Navigate to="/" replace />;
  return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const user = useAppSelector((s) => s.auth.user);
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== 'ADMIN') return <Navigate to="/" replace />;
  return <>{children}</>;
}

// ── App ───────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <Routes>
      {/* ── Public ────────────────────────────────────────────────────────── */}
      <Route path="/"             element={<RootRoute />} />
      <Route path="/products"     element={<ProductsPage />} />
      <Route path="/products/:id" element={<ProductDetailPage />} />

      {/* ── Auth (guest only) ─────────────────────────────────────────────── */}
      <Route path="/login"        element={<GuestRoute><LoginPage /></GuestRoute>} />
      <Route path="/register"     element={<GuestRoute><RegisterPage /></GuestRoute>} />
      <Route path="/sso-callback" element={<SSOCallbackPage />} />

      {/* ── USER Storefront (no sidebar) ──────────────────────────────────── */}
      <Route element={<StorefrontLayout />}>
        <Route path="/home" element={<UserHomePage />} />
      </Route>

      {/* ── USER Account area (sidebar only) ──────────────────────────────── */}
      <Route element={<AccountLayout />}>
        <Route path="/account/profile"   element={<ProfilePage />} />
        <Route path="/account/addresses" element={<AddressesPage />} />
        <Route path="/account/orders"    element={<OrdersPage />} />
        <Route path="/account/wishlist"  element={<WishlistPage />} />
        <Route path="/account/wallet"    element={<WalletPage />} />
        <Route path="/account/settings"  element={<SettingsPage />} />
      </Route>

      {/* ── Seller/Admin panel shell (sidebar) ────────────────────────────── */}
      <Route element={<AppLayout />}>

        {/* SELLER routes */}
        <Route path="/seller"                   element={<SellerAdminRoute><SellerDashboardPage /></SellerAdminRoute>} />
        <Route path="/seller/products"          element={<SellerAdminRoute><SellerProductsPage /></SellerAdminRoute>} />
        <Route path="/seller/products/new"      element={<SellerAdminRoute><SellerProductFormPage /></SellerAdminRoute>} />
        <Route path="/seller/products/:id/edit" element={<SellerAdminRoute><SellerProductFormPage /></SellerAdminRoute>} />
        <Route path="/seller/orders"            element={<SellerAdminRoute><SellerOrdersPage /></SellerAdminRoute>} />
        <Route path="/seller/analytics"         element={<SellerAdminRoute><SellerAnalyticsPage /></SellerAdminRoute>} />
        <Route path="/seller/profile"           element={<SellerAdminRoute><SellerProfilePage /></SellerAdminRoute>} />
        <Route path="/seller/settings"          element={<SellerAdminRoute><SellerSettingsPage /></SellerAdminRoute>} />

        {/* ADMIN routes */}
        <Route path="/admin"           element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />
        <Route path="/admin/users"     element={<AdminRoute><AdminUsersPage /></AdminRoute>} />
        <Route path="/admin/users/:id" element={<AdminRoute><AdminUserDetailPage /></AdminRoute>} />
        <Route path="/admin/sellers"   element={<AdminRoute><AdminSellersPage /></AdminRoute>} />
        <Route path="/admin/products"  element={<AdminRoute><AdminProductsPage /></AdminRoute>} />
        <Route path="/admin/orders"    element={<AdminRoute><AdminOrdersPage /></AdminRoute>} />
        <Route path="/admin/categories"element={<AdminRoute><AdminCategoriesPage /></AdminRoute>} />
        <Route path="/admin/analytics" element={<AdminRoute><AdminAnalyticsPage /></AdminRoute>} />
        <Route path="/admin/audit"     element={<AdminRoute><AdminAuditLogsPage /></AdminRoute>} />
        <Route path="/admin/settings"  element={<AdminRoute><AdminSettingsPage /></AdminRoute>} />

      </Route>

      {/* ── Catch-all ─────────────────────────────────────────────────────── */}
      <Route path="*" element={<RoleRedirect />} />
    </Routes>
  );
}

// Keep PrivateRoute exported so any page that still imports it doesn't break
export function PrivateRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}
