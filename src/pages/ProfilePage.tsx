import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { logout, updateUser } from '../features/auth/authSlice';
import {
  useGetProfileQuery,
  useUpdateProfileMutation,
  useChangePasswordMutation,
  useDeleteAccountMutation,
} from '../services/profileApi';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { toast } from '../components/ui/Toast';

// ── Zod schemas ───────────────────────────────────────────────────────────────

const editSchema = z.object({
  name:   z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name too long'),
  phone:  z.string().regex(/^\+?[\d\s\-().]{7,20}$/, 'Invalid phone format').or(z.literal('')).optional(),
  avatar: z.string().url('Must be a valid URL').or(z.literal('')).optional(),
});

const pwdSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'Minimum 8 characters')
    .regex(/[A-Z]/, 'Must include an uppercase letter')
    .regex(/[0-9]/, 'Must include a number')
    .regex(/[^A-Za-z0-9]/, 'Must include a special character'),
  confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

const deleteSchema = z.object({
  password: z.string().min(1, 'Password is required'),
  confirm:  z.string(),
}).refine((d) => d.confirm === 'DELETE MY ACCOUNT', {
  message: 'Type DELETE MY ACCOUNT exactly to confirm',
  path: ['confirm'],
});

type EditValues   = z.infer<typeof editSchema>;
type PwdValues    = z.infer<typeof pwdSchema>;
type DeleteValues = z.infer<typeof deleteSchema>;

// ── Tab IDs ───────────────────────────────────────────────────────────────────

type Tab = 'overview' | 'edit' | 'security' | 'danger';

// ── Role badge ────────────────────────────────────────────────────────────────

const roleBadge: Record<string, string> = {
  ADMIN:  'bg-red-500/15 text-red-400 border border-red-500/25',
  SELLER: 'bg-amber-500/15 text-amber-400 border border-amber-500/25',
  USER:   'bg-violet-500/15 text-violet-400 border border-violet-500/25',
};

const verifyBadge: Record<string, string> = {
  APPROVED: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25',
  PENDING:  'bg-amber-500/15 text-amber-400 border border-amber-500/25',
  REJECTED: 'bg-red-500/15 text-red-400 border border-red-500/25',
  NONE:     'bg-slate-500/15 text-slate-400 border border-slate-500/25',
};

// ── Shared card wrapper ───────────────────────────────────────────────────────

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-slate-900/60 border border-slate-800 rounded-2xl p-6 ${className}`}>
      {children}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-base font-semibold text-white mb-5">{children}</h2>;
}

// ── Skeleton loader ───────────────────────────────────────────────────────────

function ProfileSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-6 w-48 bg-slate-800 rounded-lg" />
      <div className="h-4 w-72 bg-slate-800 rounded-lg" />
      <div className="h-4 w-56 bg-slate-800 rounded-lg" />
    </div>
  );
}

// ── Avatar initials ───────────────────────────────────────────────────────────

function Avatar({ name, avatar, size = 'lg' }: { name: string; avatar?: string; size?: 'sm' | 'lg' }) {
  const dim    = size === 'lg' ? 'w-20 h-20 text-2xl' : 'w-10 h-10 text-sm';
  const letter = name ? name.charAt(0).toUpperCase() : '?';
  if (avatar) {
    return <img src={avatar} alt={name} className={`${dim} rounded-2xl object-cover border border-slate-700`} />;
  }
  return (
    <div className={`${dim} rounded-2xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center font-bold text-white shrink-0`}>
      {letter}
    </div>
  );
}

// ── Info row ──────────────────────────────────────────────────────────────────

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between py-3.5 border-b border-slate-800/70 last:border-0">
      <span className="text-sm text-slate-500 shrink-0 w-36">{label}</span>
      <span className="text-sm text-slate-200 text-right">{value ?? <span className="text-slate-600 italic">—</span>}</span>
    </div>
  );
}

// ── Overview tab ──────────────────────────────────────────────────────────────

function OverviewTab({ profile }: { profile: ReturnType<typeof useGetProfileQuery>['data'] }) {
  if (!profile) return null;
  const p = profile.profile;

  return (
    <div className="space-y-4">
      {/* Hero card */}
      <Card>
        <div className="flex items-center gap-5">
          <Avatar name={p.name} avatar={p.avatar || undefined} size="lg" />
          <div className="min-w-0">
            <h3 className="text-xl font-bold text-white truncate">{p.name}</h3>
            <p className="text-slate-400 text-sm mt-0.5 truncate">{p.email}</p>
            <div className="flex flex-wrap gap-2 mt-2.5">
              <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide ${roleBadge[p.role] ?? roleBadge.USER}`}>
                {p.role}
              </span>
              <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide ${
                p.isVerified ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25' : 'bg-slate-500/15 text-slate-400 border border-slate-500/25'
              }`}>
                {p.isVerified ? 'Email Verified' : 'Unverified'}
              </span>
              {p.status !== 'ACTIVE' && (
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide bg-red-500/15 text-red-400 border border-red-500/25">
                  {p.status}
                </span>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Account details */}
      <Card>
        <SectionTitle>Account Details</SectionTitle>
        <InfoRow label="Full name"   value={p.name} />
        <InfoRow label="Email"       value={p.email} />
        <InfoRow label="Phone"       value={p.phone || null} />
        <InfoRow label="Member since" value={new Date(p.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} />
        <InfoRow label="Last login"  value={p.lastLogin ? new Date(p.lastLogin).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : null} />
      </Card>

      {/* Quick links */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { to: '/addresses', icon: '📍', label: 'Addresses',  desc: 'Manage delivery addresses' },
          { to: '/orders',    icon: '📦', label: 'My Orders',  desc: 'Track & view past orders'  },
        ].map(({ to, icon, label, desc }) => (
          <Link
            key={to}
            to={to}
            className="flex items-center gap-3 p-4 bg-slate-800/40 border border-slate-700/60 rounded-xl hover:border-violet-500/30 hover:bg-violet-500/5 transition-all group"
          >
            <span className="text-2xl">{icon}</span>
            <div>
              <p className="text-sm font-semibold text-white group-hover:text-violet-300 transition-colors">{label}</p>
              <p className="text-xs text-slate-500">{desc}</p>
            </div>
            <svg className="ml-auto text-slate-600 group-hover:text-violet-400 transition-colors shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
          </Link>
        ))}
      </div>

      {/* Seller details — only for SELLER role */}
      {p.role === 'SELLER' && (
        <Card>
          <SectionTitle>Seller Details</SectionTitle>
          <InfoRow label="Business name" value={p.businessName} />
          <InfoRow label="GST number"    value={p.gstNumber} />
          <InfoRow label="Verification"  value={
            p.verificationStatus ? (
              <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide ${verifyBadge[p.verificationStatus] ?? verifyBadge.NONE}`}>
                {p.verificationStatus}
              </span>
            ) : null
          } />
        </Card>
      )}
    </div>
  );
}

// ── Edit Profile tab ──────────────────────────────────────────────────────────

function EditProfileTab({ profile }: { profile: ReturnType<typeof useGetProfileQuery>['data'] }) {
  const dispatch = useAppDispatch();
  const [updateProfile, { isLoading }] = useUpdateProfileMutation();

  const p = profile?.profile;

  const { register, handleSubmit, formState: { errors, isDirty }, reset } = useForm<EditValues>({
    resolver: zodResolver(editSchema),
    defaultValues: { name: p?.name ?? '', phone: p?.phone ?? '', avatar: p?.avatar ?? '' },
  });

  // Sync form when profile reloads
  useEffect(() => {
    if (p) reset({ name: p.name, phone: p.phone ?? '', avatar: p.avatar ?? '' });
  }, [p, reset]);

  const onSubmit = async (data: EditValues) => {
    try {
      const result = await updateProfile({
        name:   data.name,
        phone:  data.phone  || undefined,
        avatar: data.avatar || undefined,
      }).unwrap();
      // Keep Redux auth user in sync (header avatar etc.)
      dispatch(updateUser({ name: result.profile.name, avatar: result.profile.avatar || undefined }));
      toast.success('Profile updated', `Changes saved, ${result.profile.name}.`);
      reset({ name: result.profile.name, phone: result.profile.phone ?? '', avatar: result.profile.avatar ?? '' });
    } catch (err: unknown) {
      const msg = (err as { data?: { message?: string } })?.data?.message ?? 'Could not save changes';
      toast.error('Update failed', msg);
    }
  };

  return (
    <Card>
      <SectionTitle>Edit Profile</SectionTitle>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Input
          label="Full name"
          placeholder="Your full name"
          required
          error={errors.name?.message}
          leftIcon={
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
          }
          {...register('name')}
        />

        <Input
          label="Phone number"
          placeholder="+91 98765 43210"
          error={errors.phone?.message}
          hint="Optional — used for delivery updates"
          leftIcon={
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.01 1.21 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92v2z"/>
            </svg>
          }
          {...register('phone')}
        />

        <Input
          label="Avatar URL"
          placeholder="https://example.com/photo.jpg"
          error={errors.avatar?.message}
          hint="Paste a direct image URL"
          leftIcon={
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
          }
          {...register('avatar')}
        />

        <div className="flex gap-3 pt-1">
          <Button type="submit" variant="primary" size="md" loading={isLoading} disabled={!isDirty}>
            Save Changes
          </Button>
          <Button type="button" variant="ghost" size="md" onClick={() => reset()} disabled={!isDirty || isLoading}>
            Discard
          </Button>
        </div>
      </form>
    </Card>
  );
}

// ── Security tab ──────────────────────────────────────────────────────────────

function SecurityTab() {
  const dispatch  = useAppDispatch();
  const navigate  = useNavigate();
  const [changePassword, { isLoading }] = useChangePasswordMutation();

  const { register, handleSubmit, formState: { errors }, reset } = useForm<PwdValues>({
    resolver: zodResolver(pwdSchema),
  });

  const onSubmit = async (data: PwdValues) => {
    try {
      const result = await changePassword({
        currentPassword: data.currentPassword,
        newPassword:     data.newPassword,
      }).unwrap();
      toast.success('Password changed', result.message);
      reset();
      // Backend clears all refresh tokens → force re-login
      setTimeout(() => {
        dispatch(logout());
        navigate('/login', { replace: true });
      }, 1500);
    } catch (err: unknown) {
      const msg = (err as { data?: { message?: string } })?.data?.message ?? 'Could not change password';
      toast.error('Change failed', msg);
    }
  };

  return (
    <Card>
      <SectionTitle>Change Password</SectionTitle>
      <p className="text-sm text-slate-500 mb-6 -mt-2">
        After changing your password all active sessions will be signed out.
      </p>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Input
          label="Current password"
          type="password"
          placeholder="Enter your current password"
          required
          error={errors.currentPassword?.message}
          leftIcon={
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
            </svg>
          }
          {...register('currentPassword')}
        />

        <Input
          label="New password"
          type="password"
          placeholder="Create a strong password"
          required
          error={errors.newPassword?.message}
          hint="Min 8 chars, uppercase, number, special character"
          leftIcon={
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          }
          {...register('newPassword')}
        />

        <Input
          label="Confirm new password"
          type="password"
          placeholder="Re-enter new password"
          required
          error={errors.confirmPassword?.message}
          leftIcon={
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
            </svg>
          }
          {...register('confirmPassword')}
        />

        <Button type="submit" variant="primary" size="md" loading={isLoading} className="mt-1">
          Update Password
        </Button>
      </form>
    </Card>
  );
}

// ── Danger Zone tab ───────────────────────────────────────────────────────────

function DangerTab() {
  const dispatch  = useAppDispatch();
  const navigate  = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [deleteAccount, { isLoading }] = useDeleteAccountMutation();

  const { register, handleSubmit, formState: { errors }, watch } = useForm<DeleteValues>({
    resolver: zodResolver(deleteSchema),
  });

  const confirmValue = watch('confirm', '');

  const onSubmit = async (data: DeleteValues) => {
    try {
      await deleteAccount({ password: data.password }).unwrap();
      toast.success('Account deleted', 'Your account has been permanently removed.');
      dispatch(logout());
      navigate('/', { replace: true });
    } catch (err: unknown) {
      const msg = (err as { data?: { message?: string } })?.data?.message ?? 'Could not delete account';
      toast.error('Deletion failed', msg);
    }
  };

  return (
    <div className="space-y-4">
      {/* Warning card */}
      <div className="bg-red-500/8 border border-red-500/20 rounded-2xl p-5">
        <div className="flex gap-3">
          <div className="shrink-0 w-9 h-9 rounded-xl bg-red-500/15 flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-400">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-red-400">This action is irreversible</p>
            <p className="text-sm text-slate-400 mt-1 leading-relaxed">
              Deleting your account permanently anonymises your profile data. Your order history is retained for legal purposes but cannot be accessed.
            </p>
          </div>
        </div>
      </div>

      {!showForm ? (
        <Card>
          <SectionTitle>Delete Account</SectionTitle>
          <p className="text-sm text-slate-500 mb-5 -mt-2">
            Once deleted, your account cannot be recovered. All personal data will be anonymised immediately.
          </p>
          <Button
            variant="danger"
            size="md"
            onClick={() => setShowForm(true)}
            leftIcon={
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
              </svg>
            }
          >
            Delete My Account
          </Button>
        </Card>
      ) : (
        <Card>
          <SectionTitle>Confirm Account Deletion</SectionTitle>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              label="Password"
              type="password"
              placeholder="Enter your password to confirm"
              required
              error={errors.password?.message}
              leftIcon={
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
                </svg>
              }
              {...register('password')}
            />

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Type <span className="font-mono text-red-400 select-all">DELETE MY ACCOUNT</span> to confirm
              </label>
              <input
                type="text"
                placeholder="DELETE MY ACCOUNT"
                autoComplete="off"
                className={`w-full bg-slate-800/70 border rounded-xl text-white text-sm placeholder:text-slate-600 px-4 py-3
                  focus:outline-none focus:ring-2 transition-all duration-200
                  ${errors.confirm
                    ? 'border-red-500/60 focus:border-red-500 focus:ring-red-500/20'
                    : confirmValue === 'DELETE MY ACCOUNT'
                      ? 'border-emerald-500/60 focus:border-emerald-500 focus:ring-emerald-500/20'
                      : 'border-slate-700 hover:border-slate-600 focus:border-violet-500 focus:ring-violet-500/20'
                  }`}
                {...register('confirm')}
              />
              {errors.confirm && (
                <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
                  {errors.confirm.message}
                </p>
              )}
            </div>

            <div className="flex gap-3 pt-1">
              <Button
                type="submit"
                variant="danger"
                size="md"
                loading={isLoading}
                disabled={confirmValue !== 'DELETE MY ACCOUNT'}
              >
                Permanently Delete Account
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="md"
                onClick={() => setShowForm(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
}

// ── Tab navigation ────────────────────────────────────────────────────────────

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  {
    id: 'overview',
    label: 'Overview',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  },
  {
    id: 'edit',
    label: 'Edit Profile',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
      </svg>
    ),
  },
  {
    id: 'security',
    label: 'Security',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
      </svg>
    ),
  },
  {
    id: 'danger',
    label: 'Danger Zone',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
        <path d="M10 11v6"/><path d="M14 11v6"/>
      </svg>
    ),
  },
];

// ── Profile Page ──────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const dispatch  = useAppDispatch();
  const navigate  = useNavigate();
  const authUser  = useAppSelector((s) => s.auth.user);
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  const { data, isLoading, isError } = useGetProfileQuery();

  // If not authenticated — redirect (PrivateRoute handles this, but extra guard)
  useEffect(() => {
    if (!authUser) navigate('/login', { replace: true });
  }, [authUser, navigate]);

  return (
    <div className="min-h-screen bg-slate-950">
      {/* ── Top bar ── */}
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800/60">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center font-extrabold text-white text-sm shadow-lg shadow-violet-500/30">
              K
            </div>
            <span className="font-extrabold text-base tracking-tight text-white hidden sm:block">Klyro</span>
          </Link>

          <h1 className="text-sm font-semibold text-white">My Profile</h1>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => { dispatch(logout()); navigate('/', { replace: true }); }}
            leftIcon={
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            }
          >
            Sign out
          </Button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* ── Page heading ── */}
        <div className="mb-8">
          {isLoading ? (
            <ProfileSkeleton />
          ) : isError ? (
            <p className="text-red-400 text-sm">Could not load profile. Please try again.</p>
          ) : data ? (
            <div className="flex items-center gap-4">
              <Avatar name={data.profile.name} avatar={data.profile.avatar || undefined} size="sm" />
              <div>
                <h2 className="text-xl font-bold text-white">{data.profile.name}</h2>
                <p className="text-slate-500 text-sm">{data.profile.email}</p>
              </div>
            </div>
          ) : null}
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* ── Sidebar tabs ── */}
          <nav className="md:w-52 shrink-0">
            <ul className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible pb-1 md:pb-0">
              {TABS.map(({ id, label, icon }) => (
                <li key={id} className="shrink-0">
                  <button
                    onClick={() => setActiveTab(id)}
                    className={[
                      'flex items-center gap-2.5 w-full px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 whitespace-nowrap',
                      activeTab === id
                        ? id === 'danger'
                          ? 'bg-red-500/15 text-red-400 border border-red-500/25'
                          : 'bg-violet-600/15 text-violet-300 border border-violet-500/20'
                        : id === 'danger'
                          ? 'text-red-500 hover:bg-red-500/8 border border-transparent'
                          : 'text-slate-400 hover:text-white hover:bg-white/6 border border-transparent',
                    ].join(' ')}
                  >
                    <span className="shrink-0">{icon}</span>
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* ── Tab content ── */}
          <div className="flex-1 min-w-0">
            {isLoading && (
              <Card>
                <ProfileSkeleton />
              </Card>
            )}
            {!isLoading && !isError && data && (
              <>
                {activeTab === 'overview'  && <OverviewTab profile={data} />}
                {activeTab === 'edit'      && <EditProfileTab profile={data} />}
                {activeTab === 'security'  && <SecurityTab />}
                {activeTab === 'danger'    && <DangerTab />}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
