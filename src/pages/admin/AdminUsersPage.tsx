import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useListAdminUsersQuery,
  useUpdateAdminUserStatusMutation,
  useUpdateAdminUserRoleMutation,
  type AdminUser,
  type UserRole,
  type UserStatus,
} from '../../services/adminApi';
import { toast } from '../../components/ui/Toast';
import Badge, { statusCls, roleCls } from '../../components/ui/Badge';
import Avatar from '../../components/ui/Avatar';

// ── Quick-action dropdown ─────────────────────────────────────────────────────

function StatusDropdown({ user }: { user: AdminUser }) {
  const [update, { isLoading }] = useUpdateAdminUserStatusMutation();
  const options: UserStatus[] = ['ACTIVE', 'PENDING', 'SUSPENDED'];

  const change = async (status: UserStatus) => {
    if (status === user.status) return;
    try {
      await update({ id: user.id, status }).unwrap();
      toast.success('Status updated', `${user.name} → ${status}`);
    } catch {
      toast.error('Failed', 'Could not update status');
    }
  };

  return (
    <select
      disabled={isLoading}
      value={user.status}
      onChange={(e) => change(e.target.value as UserStatus)}
      className="bg-slate-800 border border-slate-700 text-slate-300 text-xs rounded-lg px-2 py-1 focus:outline-none focus:border-violet-500 disabled:opacity-50 cursor-pointer"
    >
      {options.map((s) => <option key={s} value={s} className="bg-slate-900">{s}</option>)}
    </select>
  );
}

function RoleDropdown({ user }: { user: AdminUser }) {
  const [update, { isLoading }] = useUpdateAdminUserRoleMutation();
  const options: UserRole[] = ['USER', 'SELLER'];

  const change = async (role: UserRole) => {
    if (role === user.role) return;
    if (!window.confirm(`Change ${user.name}'s role to ${role}?`)) return;
    try {
      await update({ id: user.id, role }).unwrap();
      toast.success('Role updated', `${user.name} → ${role}`);
    } catch (err: unknown) {
      const msg = (err as { data?: { message?: string } })?.data?.message ?? 'Could not update role';
      toast.error('Failed', msg);
    }
  };

  return (
    <select
      disabled={isLoading || user.role === 'ADMIN'}
      value={user.role}
      onChange={(e) => change(e.target.value as UserRole)}
      className="bg-slate-800 border border-slate-700 text-slate-300 text-xs rounded-lg px-2 py-1 focus:outline-none focus:border-violet-500 disabled:opacity-50 cursor-pointer"
    >
      {options.map((r) => <option key={r} value={r} className="bg-slate-900">{r}</option>)}
      {user.role === 'ADMIN' && <option value="ADMIN" className="bg-slate-900">ADMIN</option>}
    </select>
  );
}

// ── Pagination ────────────────────────────────────────────────────────────────

function Pagination({ page, pages, onPage }: { page: number; pages: number; onPage: (p: number) => void }) {
  if (pages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-1.5 py-4">
      <button
        disabled={page <= 1}
        onClick={() => onPage(page - 1)}
        className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 border border-slate-700 text-slate-400 hover:text-white disabled:opacity-40 disabled:pointer-events-none transition-all"
      >
        ← Prev
      </button>
      {Array.from({ length: Math.min(pages, 7) }, (_, i) => {
        const p = pages <= 7 ? i + 1 : page <= 4 ? i + 1 : page + i - 3;
        if (p < 1 || p > pages) return null;
        return (
          <button
            key={p}
            onClick={() => onPage(p)}
            className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all ${
              p === page
                ? 'bg-violet-600 text-white border border-violet-500'
                : 'bg-slate-800 border border-slate-700 text-slate-400 hover:text-white'
            }`}
          >
            {p}
          </button>
        );
      })}
      <button
        disabled={page >= pages}
        onClick={() => onPage(page + 1)}
        className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 border border-slate-700 text-slate-400 hover:text-white disabled:opacity-40 disabled:pointer-events-none transition-all"
      >
        Next →
      </button>
    </div>
  );
}

// ── Skeleton row ──────────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <tr className="border-b border-slate-800/50 animate-pulse">
      {[120, 80, 60, 60, 90, 100].map((w, i) => (
        <td key={i} className="px-4 py-3.5">
          <div className={`h-4 bg-slate-800 rounded`} style={{ width: w }} />
        </td>
      ))}
    </tr>
  );
}

// ── Users Page ────────────────────────────────────────────────────────────────

export default function AdminUsersPage() {
  const navigate = useNavigate();
  const [page,   setPage]   = useState(1);
  const [search, setSearch] = useState('');
  const [role,   setRole]   = useState<UserRole | ''>('');
  const [status, setStatus] = useState<UserStatus | ''>('');

  const { data, isLoading, isFetching } = useListAdminUsersQuery({
    page,
    limit: 20,
    search: search || undefined,
    role:   role   || undefined,
    status: status || undefined,
  });

  const handleSearch = useCallback((val: string) => {
    setSearch(val);
    setPage(1);
  }, []);

  const loading = isLoading || isFetching;

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">Users</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {data ? `${data.total.toLocaleString()} total` : 'Loading…'}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            placeholder="Search name, email, phone…"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-800/70 border border-slate-700 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20 transition-all"
          />
        </div>

        <select
          value={role}
          onChange={(e) => { setRole(e.target.value as UserRole | ''); setPage(1); }}
          className="bg-slate-800/70 border border-slate-700 rounded-xl text-sm text-slate-300 px-3 py-2 focus:outline-none focus:border-violet-500 transition-all"
        >
          <option value="">All roles</option>
          <option value="USER">USER</option>
          <option value="SELLER">SELLER</option>
          <option value="ADMIN">ADMIN</option>
        </select>

        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value as UserStatus | ''); setPage(1); }}
          className="bg-slate-800/70 border border-slate-700 rounded-xl text-sm text-slate-300 px-3 py-2 focus:outline-none focus:border-violet-500 transition-all"
        >
          <option value="">All statuses</option>
          <option value="ACTIVE">ACTIVE</option>
          <option value="PENDING">PENDING</option>
          <option value="SUSPENDED">SUSPENDED</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wide">User</th>
                <th className="px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Role</th>
                <th className="px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                <th className="px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Verified</th>
                <th className="px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Last login</th>
                <th className="px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className={loading ? 'opacity-60' : ''}>
              {isLoading
                ? Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)
                : data?.users.map((u) => (
                  <tr
                    key={u.id}
                    className="border-b border-slate-800/50 hover:bg-white/3 transition-colors group"
                  >
                    {/* User */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar name={u.name} avatar={u.avatar} />
                        <div className="min-w-0">
                          <button
                            onClick={() => navigate(`/admin/users/${u.id}`)}
                            className="text-sm font-medium text-white hover:text-violet-300 transition-colors text-left truncate max-w-[160px]"
                          >
                            {u.name}
                          </button>
                          <p className="text-xs text-slate-500 truncate max-w-[160px]">{u.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="px-4 py-3.5">
                      <Badge label={u.role} cls={roleCls[u.role]} />
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3.5">
                      <Badge label={u.status} cls={statusCls[u.status]} />
                    </td>

                    {/* Verified */}
                    <td className="px-4 py-3.5">
                      {u.isVerified
                        ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-emerald-400"><path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-slate-600"><line x1="18" y1="6" x2="6" y2="18" strokeLinecap="round"/><line x1="6" y1="6" x2="18" y2="18" strokeLinecap="round"/></svg>
                      }
                    </td>

                    {/* Last login */}
                    <td className="px-4 py-3.5 text-xs text-slate-500 whitespace-nowrap">
                      {u.lastLogin
                        ? new Date(u.lastLogin).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                        : '—'
                      }
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <StatusDropdown user={u} />
                        <RoleDropdown   user={u} />
                        <button
                          onClick={() => navigate(`/admin/users/${u.id}`)}
                          className="text-[11px] font-medium text-slate-500 hover:text-violet-300 transition-colors px-2 py-1 rounded-lg hover:bg-violet-500/10 border border-transparent hover:border-violet-500/20"
                        >
                          View →
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              }

              {!isLoading && data?.users.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center text-slate-500 text-sm">
                    No users found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Pagination page={page} pages={data?.pages ?? 1} onPage={setPage} />
      </div>
    </div>
  );
}
