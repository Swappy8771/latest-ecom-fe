import { NavLink } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { logout } from '../../features/auth/authSlice';
import { useLogoutMutation } from '../../services/authApi';
import { toast } from '../ui/Toast';
import { SIDEBAR_NAV, type NavItem, type NavGroup } from './sidebarConfig';

interface SidebarProps {
  collapsed:        boolean;
  onToggleCollapse: () => void;
  mobileOpen:       boolean;
  onMobileClose:    () => void;
}

// ── Nav icon renderer ─────────────────────────────────────────────────────────

function NavIcon({ d }: { d: string }) {
  return (
    <svg
      width="18" height="18" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round"
      className="shrink-0"
    >
      {d.split(' M ').map((segment, i) => (
        <path key={i} d={i === 0 ? segment : `M ${segment}`} />
      ))}
    </svg>
  );
}

// ── Single nav link ───────────────────────────────────────────────────────────

function SidebarLink({ item, collapsed, onClick }: { item: NavItem; collapsed: boolean; onClick?: () => void }) {
  return (
    <NavLink
      to={item.to}
      end={item.end}
      onClick={onClick}
      title={collapsed ? item.label : undefined}
      className={({ isActive }) =>
        [
          'group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 relative',
          isActive
            ? 'bg-gradient-to-r from-violet-600/20 to-blue-600/10 text-violet-300 border border-violet-500/20'
            : 'text-slate-400 hover:text-white hover:bg-white/6 border border-transparent',
          collapsed ? 'justify-center' : '',
        ].join(' ')
      }
    >
      {({ isActive }) => (
        <>
          <span className={isActive ? 'text-violet-400' : 'text-slate-500 group-hover:text-slate-300 transition-colors'}>
            <NavIcon d={item.icon} />
          </span>
          {!collapsed && <span className="truncate">{item.label}</span>}
          {!collapsed && item.badge && (
            <span className="ml-auto text-[10px] font-bold bg-violet-600 text-white px-1.5 py-0.5 rounded-full leading-none">
              {item.badge}
            </span>
          )}
          {/* Tooltip for collapsed mode */}
          {collapsed && (
            <span className="absolute left-full ml-3 px-2.5 py-1.5 bg-slate-800 border border-slate-700 text-white text-xs font-medium rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-xl">
              {item.label}
            </span>
          )}
        </>
      )}
    </NavLink>
  );
}

// ── Nav group ─────────────────────────────────────────────────────────────────

function SidebarGroup({ group, collapsed, onLinkClick }: { group: NavGroup; collapsed: boolean; onLinkClick?: () => void }) {
  return (
    <div className="space-y-0.5">
      {!collapsed && group.heading && (
        <p className="px-3 py-1.5 text-[10px] font-bold text-slate-600 uppercase tracking-widest">
          {group.heading}
        </p>
      )}
      {group.items.map((item) => (
        <SidebarLink key={item.to} item={item} collapsed={collapsed} onClick={onLinkClick} />
      ))}
    </div>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────────────────

export default function Sidebar({ collapsed, onToggleCollapse, mobileOpen, onMobileClose }: SidebarProps) {
  const dispatch     = useAppDispatch();
  const user         = useAppSelector((s) => s.auth.user);
  const refreshToken = useAppSelector((s) => s.auth.refreshToken);
  const [logoutApi]  = useLogoutMutation();

  const role   = user?.role ?? 'USER';
  const groups: NavGroup[] = SIDEBAR_NAV[role] ?? SIDEBAR_NAV.USER;

  const handleLogout = async () => {
    if (refreshToken) {
      try { await logoutApi({ refreshToken }).unwrap(); } catch { /* ignore — still clear local state */ }
    }
    dispatch(logout());
    toast.success('Signed out successfully');
    onMobileClose();
  };

  const sidebarContent = (
    <aside
      className={[
        'flex flex-col h-full bg-slate-950 border-r border-slate-800/60 transition-all duration-300',
        collapsed ? 'w-[68px]' : 'w-64',
      ].join(' ')}
    >
      {/* ── Brand + Collapse toggle ── */}
      <div className={`flex items-center h-16 px-3 border-b border-slate-800/60 shrink-0 ${collapsed ? 'justify-center' : 'justify-between'}`}>
        {!collapsed && (
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center font-extrabold text-white text-xs shadow-md shadow-violet-500/30">
              K
            </div>
            <span className="font-extrabold text-base tracking-tight text-white">
              Kly<span className="text-violet-400">ro</span>
            </span>
          </div>
        )}
        <button
          onClick={onToggleCollapse}
          className="p-1.5 text-slate-500 hover:text-white hover:bg-white/8 rounded-lg transition-all"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            {collapsed
              ? <><polyline points="9 18 15 12 9 6"/><line x1="3" y1="12" x2="3" y2="12"/></>
              : <><polyline points="15 18 9 12 15 6"/><line x1="21" y1="12" x2="21" y2="12"/></>
            }
          </svg>
        </button>
      </div>

      {/* ── User card ── */}
      {user && (
        <div className={`px-3 py-4 border-b border-slate-800/60 shrink-0 ${collapsed ? 'flex justify-center' : ''}`}>
          {collapsed ? (
            <div
              className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center text-sm font-bold text-white shadow-md shadow-violet-500/20"
              title={user.name}
            >
              {user.name.charAt(0).toUpperCase()}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center text-sm font-bold text-white shrink-0 shadow-md shadow-violet-500/20">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
              </div>
              <span className="ml-auto shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-violet-500/15 text-violet-400 border border-violet-500/20 uppercase tracking-wide">
                {user.role}
              </span>
            </div>
          )}
        </div>
      )}

      {/* ── Nav groups ── */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-4 space-y-5 scrollbar-thin">
        {groups.map((group, i) => (
          <SidebarGroup key={i} group={group} collapsed={collapsed} onLinkClick={onMobileClose} />
        ))}
      </nav>

      {/* ── Logout ── */}
      <div className="px-3 py-4 border-t border-slate-800/60 shrink-0">
        <button
          onClick={handleLogout}
          title={collapsed ? 'Sign out' : undefined}
          className={[
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/8 border border-transparent transition-all duration-150',
            collapsed ? 'justify-center' : '',
          ].join(' ')}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4 M16 17l5-5-5-5 M21 12H9"/>
          </svg>
          {!collapsed && <span>Sign out</span>}
          {collapsed && (
            <span className="absolute left-full ml-3 px-2.5 py-1.5 bg-slate-800 border border-slate-700 text-white text-xs font-medium rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-xl">
              Sign out
            </span>
          )}
        </button>
      </div>
    </aside>
  );

  return (
    <>
      {/* ── Desktop ── */}
      <div className="hidden md:flex h-screen sticky top-0 shrink-0">
        {sidebarContent}
      </div>

      {/* ── Mobile overlay ── */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-[150] flex">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onMobileClose}
          />
          <div className="relative z-10 animate-fade-slide-up" style={{ animationDuration: '0.2s' }}>
            {/* Force full width for mobile */}
            <aside className="flex flex-col h-full w-72 bg-slate-950 border-r border-slate-800/60">
              {/* Mobile close button in header */}
              <div className="flex items-center justify-between h-16 px-4 border-b border-slate-800/60 shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center font-extrabold text-white text-xs">K</div>
                  <span className="font-extrabold text-base tracking-tight text-white">Kly<span className="text-violet-400">ro</span></span>
                </div>
                <button onClick={onMobileClose} className="p-1.5 text-slate-500 hover:text-white hover:bg-white/8 rounded-lg transition-all">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
              {user && (
                <div className="px-4 py-4 border-b border-slate-800/60 shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center text-sm font-bold text-white shrink-0">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                    </div>
                  </div>
                </div>
              )}
              <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
                {groups.map((group, i) => (
                  <SidebarGroup key={i} group={group} collapsed={false} onLinkClick={onMobileClose} />
                ))}
              </nav>
              <div className="px-3 py-4 border-t border-slate-800/60 shrink-0">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/8 transition-all"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4 M16 17l5-5-5-5 M21 12H9"/>
                  </svg>
                  Sign out
                </button>
              </div>
            </aside>
          </div>
        </div>
      )}
    </>
  );
}
