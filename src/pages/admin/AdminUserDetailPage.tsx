import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  useGetAdminUserQuery,
  useUpdateAdminUserStatusMutation,
  useUpdateAdminUserRoleMutation,
  type UserStatus,
  type UserRole,
} from '../../services/adminApi';
import { toast } from '../../components/ui/Toast';
import Button from '../../components/ui/Button';
import Badge, { statusCls, roleCls, verifyCls } from '../../components/ui/Badge';

// ── Info row ──────────────────────────────────────────────────────────────────

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between py-3.5 border-b border-slate-800/70 last:border-0">
      <span className="text-sm text-slate-500 shrink-0 w-40">{label}</span>
      <span className="text-sm text-slate-200 text-right">{value ?? <span className="text-slate-600 italic">—</span>}</span>
    </div>
  );
}

// ── Action section ────────────────────────────────────────────────────────────

function ActionCard({
  title,
  description,
  children,
}: { title: string; description: string; children: React.ReactNode }) {
  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        <p className="text-xs text-slate-500 mt-0.5">{description}</p>
      </div>
      {children}
    </div>
  );
}

// ── User Detail Page ──────────────────────────────────────────────────────────

export default function AdminUserDetailPage() {
  const { id }   = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data, isLoading, isError } = useGetAdminUserQuery(id!);
  const [updateStatus, { isLoading: statusLoading }] = useUpdateAdminUserStatusMutation();
  const [updateRole,   { isLoading: roleLoading   }] = useUpdateAdminUserRoleMutation();

  const [selectedStatus, setSelectedStatus] = useState<UserStatus | ''>('');
  const [selectedRole,   setSelectedRole]   = useState<UserRole   | ''>('');

  const user = data?.user;

  const applyStatus = async () => {
    if (!selectedStatus || !user) return;
    try {
      await updateStatus({ id: user.id, status: selectedStatus }).unwrap();
      toast.success('Status updated', `${user.name} is now ${selectedStatus}`);
      setSelectedStatus('');
    } catch {
      toast.error('Failed', 'Could not update status');
    }
  };

  const applyRole = async () => {
    if (!selectedRole || !user) return;
    if (!window.confirm(`Change ${user.name}'s role to ${selectedRole}?`)) return;
    try {
      await updateRole({ id: user.id, role: selectedRole }).unwrap();
      toast.success('Role updated', `${user.name} is now ${selectedRole}`);
      setSelectedRole('');
    } catch (err: unknown) {
      const msg = (err as { data?: { message?: string } })?.data?.message ?? 'Could not update role';
      toast.error('Failed', msg);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-48 bg-slate-800 rounded-lg" />
          <div className="h-4 w-72 bg-slate-800 rounded-lg" />
          <div className="h-64 bg-slate-800 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="p-6 text-center space-y-3 py-24">
        <p className="text-slate-400">User not found or could not be loaded.</p>
        <Button variant="outline" size="sm" onClick={() => navigate('/admin/users')}>← Back to Users</Button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      {/* Back */}
      <button
        onClick={() => navigate('/admin/users')}
        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-white transition-colors"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
        Back to Users
      </button>

      {/* Hero */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center text-xl font-bold text-white shrink-0">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-white truncate">{user.name}</h1>
            <p className="text-slate-400 text-sm truncate">{user.email}</p>
            <div className="flex flex-wrap gap-2 mt-2.5">
              <Badge label={user.role}   cls={roleCls[user.role]}   size="sm" />
              <Badge label={user.status} cls={statusCls[user.status]} size="sm" />
              {user.isVerified && (
                <Badge label="Email Verified" cls="bg-emerald-500/15 text-emerald-400 border-emerald-500/25" />
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Account info */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-white mb-4">Account Details</h2>
          <InfoRow label="ID"           value={<code className="text-xs text-slate-400 font-mono">{user.id}</code>} />
          <InfoRow label="Name"         value={user.name} />
          <InfoRow label="Email"        value={user.email} />
          <InfoRow label="Phone"        value={user.phone || null} />
          <InfoRow label="Joined"       value={new Date(user.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} />
          <InfoRow label="Last login"   value={user.lastLogin ? new Date(user.lastLogin).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : null} />
        </div>

        {/* Seller info — only relevant for SELLER role */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-white mb-4">Seller Details</h2>
          <InfoRow label="Business name"       value={user.businessName || null} />
          <InfoRow label="GST number"          value={user.gstNumber || null} />
          <InfoRow label="Verification status" value={
            user.verificationStatus !== 'NONE'
              ? <Badge label={user.verificationStatus} cls={verifyCls[user.verificationStatus]} />
              : null
          } />
          <InfoRow label="Verified seller"     value={user.isVerifiedSeller
            ? <span className="text-emerald-400 text-sm">Yes</span>
            : <span className="text-slate-600 text-sm">No</span>
          } />
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <ActionCard
          title="Change Status"
          description="SUSPENDED clears the user's active sessions immediately."
        >
          <div className="flex gap-2">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as UserStatus)}
              className="flex-1 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-300 px-3 py-2 focus:outline-none focus:border-violet-500 transition-all"
            >
              <option value="">Select status…</option>
              {(['ACTIVE', 'PENDING', 'SUSPENDED'] as UserStatus[])
                .filter((s) => s !== user.status)
                .map((s) => <option key={s} value={s} className="bg-slate-900">{s}</option>)
              }
            </select>
            <Button
              variant="secondary"
              size="sm"
              loading={statusLoading}
              disabled={!selectedStatus}
              onClick={applyStatus}
            >
              Apply
            </Button>
          </div>
          <p className="text-xs text-slate-600">Current: <span className={`font-semibold ${user.status === 'ACTIVE' ? 'text-emerald-400' : user.status === 'SUSPENDED' ? 'text-red-400' : 'text-amber-400'}`}>{user.status}</span></p>
        </ActionCard>

        <ActionCard
          title="Change Role"
          description="Promoting to ADMIN is disabled via API and must be done via the seed script."
        >
          <div className="flex gap-2">
            <select
              value={selectedRole}
              disabled={user.role === 'ADMIN'}
              onChange={(e) => setSelectedRole(e.target.value as UserRole)}
              className="flex-1 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-300 px-3 py-2 focus:outline-none focus:border-violet-500 transition-all disabled:opacity-50"
            >
              <option value="">Select role…</option>
              {(['USER', 'SELLER'] as UserRole[])
                .filter((r) => r !== user.role)
                .map((r) => <option key={r} value={r} className="bg-slate-900">{r}</option>)
              }
            </select>
            <Button
              variant="secondary"
              size="sm"
              loading={roleLoading}
              disabled={!selectedRole || user.role === 'ADMIN'}
              onClick={applyRole}
            >
              Apply
            </Button>
          </div>
          <p className="text-xs text-slate-600">Current: <span className={`font-semibold ${roleCls[user.role].split(' ')[1]}`}>{user.role}</span></p>
        </ActionCard>
      </div>
    </div>
  );
}
