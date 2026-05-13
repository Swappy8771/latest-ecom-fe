import { useState, useEffect, useRef } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { logout } from '../../features/auth/authSlice';
import { useLogoutMutation } from '../../services/authApi';
import { toggleCart } from '../../features/cart/cartSlice';
import { toggleSearch } from '../../features/ui/uiSlice';
import { selectCartCount } from '../../features/cart/cartSlice';
import { toast } from '../ui/Toast';

const NAV_LINKS = [
  { label: 'Home',       to: '/',          end: true },
  { label: 'Shop',       to: '/products' },
  { label: 'Categories', to: '/categories' },
  { label: 'Deals',      to: '/deals' },
];

// ── Icons ─────────────────────────────────────────────────────────────────────

function SearchIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  );
}

function CartIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
      <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/>
    </svg>
  );
}

function HamburgerIcon({ open }: { open: boolean }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {open
        ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
        : <><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></>
      }
    </svg>
  );
}

// ── Role badge colours ────────────────────────────────────────────────────────

const roleBadge: Record<string, string> = {
  ADMIN:  'bg-red-500/15 text-red-400 border-red-500/25',
  SELLER: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
  USER:   'bg-violet-500/15 text-violet-400 border-violet-500/25',
};

// ── User dropdown ─────────────────────────────────────────────────────────────

function UserDropdown({ onClose }: { onClose: () => void }) {
  const dispatch     = useAppDispatch();
  const user         = useAppSelector((s) => s.auth.user)!;
  const refreshToken = useAppSelector((s) => s.auth.refreshToken);
  const [logoutApi]  = useLogoutMutation();

  const profileLink =
    user.role === 'ADMIN'  ? '/admin'          :
    user.role === 'SELLER' ? '/seller'         :
                             '/account/profile';

  const handleLogout = async () => {
    if (refreshToken) {
      try { await logoutApi({ refreshToken }).unwrap(); } catch { /* ignore — still clear local state */ }
    }
    dispatch(logout());
    toast.success('Signed out successfully');
    onClose();
  };

  return (
    <div className="absolute right-0 top-full mt-2 w-56 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden z-50 animate-fade-slide-up" style={{ animationDuration: '0.15s' }}>
      {/* User info */}
      <div className="px-4 py-3.5 border-b border-slate-800">
        <p className="text-sm font-semibold text-white truncate">{user.name}</p>
        <p className="text-xs text-slate-500 truncate mt-0.5">{user.email}</p>
        <span className={`inline-flex mt-2 text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wide ${roleBadge[user.role] ?? roleBadge.USER}`}>
          {user.role}
        </span>
      </div>

      {/* Links */}
      <div className="py-1.5">
        {user.role === 'ADMIN' && (
          <Link to="/admin" onClick={onClose} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/6 transition-colors">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
            Admin Panel
          </Link>
        )}
        {user.role === 'SELLER' && (
          <Link to="/seller" onClick={onClose} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/6 transition-colors">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
            Seller Dashboard
          </Link>
        )}
        <Link to={profileLink} onClick={onClose} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/6 transition-colors">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          My Profile
        </Link>
        <Link to="/account/orders" onClick={onClose} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/6 transition-colors">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
          My Orders
        </Link>
        <Link to="/account/addresses" onClick={onClose} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/6 transition-colors">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
          Addresses
        </Link>
        <Link to="/account/wishlist" onClick={onClose} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/6 transition-colors">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
          Wishlist
        </Link>
      </div>

      {/* Logout */}
      <div className="py-1.5 border-t border-slate-800">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/8 transition-colors"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>
          Sign out
        </button>
      </div>
    </div>
  );
}

// ── Header ────────────────────────────────────────────────────────────────────

export default function Header() {
  const dispatch     = useAppDispatch();
  const [logoutApi]  = useLogoutMutation();

  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const user            = useAppSelector((s) => s.auth.user);
  const refreshToken    = useAppSelector((s) => s.auth.refreshToken);
  const cartCount       = useAppSelector(selectCartCount);

  const [scrolled,    setScrolled]    = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 768) setMobileOpen(false); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-slate-950/90 backdrop-blur-xl border-b border-slate-800/60 shadow-xl shadow-black/30'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* ── Logo ── */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center font-extrabold text-white text-sm shadow-lg shadow-violet-500/30">
              K
            </div>
            <span className="font-extrabold text-lg tracking-tight text-white">
              Kly<span className="text-violet-400">ro</span>
            </span>
          </Link>

          {/* ── Desktop Nav ── */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ label, to, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `px-4 py-2 text-sm font-medium rounded-lg transition-all duration-150 ${
                    isActive
                      ? 'text-white bg-white/8'
                      : 'text-slate-300 hover:text-white hover:bg-white/8'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>

          {/* ── Actions ── */}
          <div className="flex items-center gap-1.5">
            {/* Search */}
            <button
              aria-label="Search"
              onClick={() => dispatch(toggleSearch())}
              className="p-2.5 text-slate-400 hover:text-white hover:bg-white/8 rounded-lg transition-all"
            >
              <SearchIcon />
            </button>

            {/* Cart */}
            <button
              aria-label="Cart"
              onClick={() => dispatch(toggleCart())}
              className="relative p-2.5 text-slate-400 hover:text-white hover:bg-white/8 rounded-lg transition-all"
            >
              <CartIcon />
              {cartCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-violet-500 rounded-full text-[10px] font-bold flex items-center justify-center text-white leading-none">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </button>

            {/* ── Auth — desktop ── */}
            <div className="hidden md:flex items-center gap-2 ml-1">
              {isAuthenticated && user ? (
                <div ref={dropdownRef} className="relative">
                  <button
                    onClick={() => setDropdownOpen((o) => !o)}
                    className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl hover:bg-white/6 border border-transparent hover:border-slate-700 transition-all"
                  >
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center text-xs font-bold text-white shadow-md shadow-violet-500/20">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-slate-300 max-w-[100px] truncate">{user.name.split(' ')[0]}</span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={`text-slate-500 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}>
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  </button>
                  {dropdownOpen && <UserDropdown onClose={() => setDropdownOpen(false)} />}
                </div>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors rounded-lg hover:bg-white/8"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2.5 text-sm font-semibold bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 rounded-xl text-white transition-all shadow-md shadow-violet-500/20 hover:shadow-violet-500/40 hover:-translate-y-px active:translate-y-0"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>

            {/* Hamburger — mobile */}
            <button
              onClick={() => setMobileOpen((o) => !o)}
              aria-label="Toggle menu"
              className="md:hidden p-2 text-slate-400 hover:text-white hover:bg-white/8 rounded-lg transition-all ml-1"
            >
              <HamburgerIcon open={mobileOpen} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile Menu ── */}
      <div
        className={`md:hidden transition-all duration-300 overflow-hidden ${
          mobileOpen ? 'max-h-[480px] opacity-100' : 'max-h-0 opacity-0'
        } bg-slate-950/95 backdrop-blur-xl border-t border-slate-800/60`}
      >
        <div className="px-4 py-4 space-y-1">
          {NAV_LINKS.map(({ label, to }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setMobileOpen(false)}
              className="block px-4 py-3 text-sm font-medium text-slate-300 hover:text-white hover:bg-white/8 rounded-xl transition-all"
            >
              {label}
            </Link>
          ))}

          <div className="pt-3 mt-3 border-t border-slate-800 flex flex-col gap-2">
            {isAuthenticated && user ? (
              <>
                <div className="flex items-center gap-3 px-4 py-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center text-sm font-bold text-white shrink-0">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{user.name}</p>
                    <p className="text-xs text-slate-500">{user.email}</p>
                  </div>
                </div>
                <Link to="/account/orders"    onClick={() => setMobileOpen(false)} className="block px-4 py-3 text-sm font-medium text-slate-300 hover:text-white hover:bg-white/8 rounded-xl transition-all">My Orders</Link>
                <Link to="/account/addresses" onClick={() => setMobileOpen(false)} className="block px-4 py-3 text-sm font-medium text-slate-300 hover:text-white hover:bg-white/8 rounded-xl transition-all">Addresses</Link>
                <Link to="/account/profile"   onClick={() => setMobileOpen(false)} className="block px-4 py-3 text-sm font-medium text-slate-300 hover:text-white hover:bg-white/8 rounded-xl transition-all">Profile</Link>
                <button
                  onClick={async () => {
                    if (refreshToken) {
                      try { await logoutApi({ refreshToken }).unwrap(); } catch { /* ignore */ }
                    }
                    dispatch(logout());
                    setMobileOpen(false);
                    toast.success('Signed out');
                  }}
                  className="block w-full text-left px-4 py-3 text-sm font-medium text-red-400 hover:bg-red-500/8 rounded-xl transition-all"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link to="/login"    onClick={() => setMobileOpen(false)} className="block px-4 py-3 text-sm font-medium text-slate-300 hover:text-white hover:bg-white/8 rounded-xl transition-all text-center">Sign In</Link>
                <Link to="/register" onClick={() => setMobileOpen(false)} className="block px-4 py-3 text-sm font-semibold bg-gradient-to-r from-violet-600 to-blue-600 rounded-xl text-white text-center">Get Started</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
