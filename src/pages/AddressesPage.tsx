import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  useListAddressesQuery,
  useCreateAddressMutation,
  useUpdateAddressMutation,
  useDeleteAddressMutation,
  useSetDefaultAddressMutation,
  type Address,
} from '../services/addressApi';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { logout } from '../features/auth/authSlice';
import { useLogoutMutation } from '../services/authApi';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { toast } from '../components/ui/Toast';

// ── Indian states list ────────────────────────────────────────────────────────

const INDIAN_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh',
  'Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka',
  'Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram',
  'Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana',
  'Tripura','Uttar Pradesh','Uttarakhand','West Bengal',
  'Andaman and Nicobar Islands','Chandigarh','Dadra and Nagar Haveli and Daman and Diu',
  'Delhi','Jammu and Kashmir','Ladakh','Lakshadweep','Puducherry',
];

const LABEL_PRESETS = ['Home', 'Work', 'Other'];

// ── Zod schema ────────────────────────────────────────────────────────────────

const schema = z.object({
  label:      z.string().max(40).optional(),
  fullName:   z.string().min(1, 'Full name is required').max(80, 'Max 80 chars'),
  phone:      z.string().min(7, 'Phone is required').max(30, 'Max 30 chars'),
  line1:      z.string().min(1, 'Address line 1 is required').max(120, 'Max 120 chars'),
  line2:      z.string().max(120, 'Max 120 chars').optional(),
  city:       z.string().min(1, 'City is required').max(60, 'Max 60 chars'),
  state:      z.string().min(1, 'State is required').max(60, 'Max 60 chars'),
  postalCode: z.string().min(1, 'Postal code is required').max(20, 'Max 20 chars')
    .regex(/^\d{6}$/, 'Enter a valid 6-digit PIN code'),
  country:    z.string().min(1, 'Country is required').max(60, 'Max 60 chars'),
  isDefault:  z.boolean().optional(),
});

type FormValues = z.infer<typeof schema>;

// ── Address form (used inside drawer) ────────────────────────────────────────

interface AddressFormProps {
  existing?:  Address;
  onSuccess:  () => void;
  onCancel:   () => void;
}

function AddressForm({ existing, onSuccess, onCancel }: AddressFormProps) {
  const [create, { isLoading: creating }] = useCreateAddressMutation();
  const [update, { isLoading: updating }] = useUpdateAddressMutation();
  const isLoading = creating || updating;
  const isEdit    = !!existing;

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: existing
      ? {
          label:      existing.label || '',
          fullName:   existing.fullName,
          phone:      existing.phone,
          line1:      existing.line1,
          line2:      existing.line2 || '',
          city:       existing.city,
          state:      existing.state,
          postalCode: existing.postalCode,
          country:    existing.country,
          isDefault:  existing.isDefault,
        }
      : { country: 'India', isDefault: false },
  });

  const selectedLabel = watch('label');
  const isDefault     = watch('isDefault');

  const onSubmit = async (data: FormValues) => {
    try {
      if (isEdit && existing) {
        await update({ id: existing.id, ...data }).unwrap();
        toast.success('Address updated', data.fullName);
      } else {
        await create(data).unwrap();
        toast.success('Address added', data.label || data.line1);
      }
      onSuccess();
    } catch (err: unknown) {
      const msg = (err as { data?: { message?: string } })?.data?.message ?? 'Could not save address';
      toast.error('Failed', msg);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-5 p-6">

        {/* Label quick-select */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Label</label>
          <div className="flex gap-2 flex-wrap mb-2">
            {LABEL_PRESETS.map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setValue('label', l === selectedLabel ? '' : l)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                  selectedLabel === l
                    ? 'bg-violet-600/20 text-violet-300 border-violet-500/30'
                    : 'bg-slate-800/60 text-slate-400 border-slate-700 hover:border-slate-600 hover:text-white'
                }`}
              >
                {l === 'Home'  ? '🏠 ' : l === 'Work' ? '💼 ' : '📍 '}
                {l}
              </button>
            ))}
          </div>
          <Input
            placeholder="Custom label (optional)"
            error={errors.label?.message}
            {...register('label')}
          />
        </div>

        {/* Full name + phone */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Full name"
            placeholder="Priya Sharma"
            required
            error={errors.fullName?.message}
            leftIcon={
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
            }
            {...register('fullName')}
          />
          <Input
            label="Phone"
            placeholder="+91 98765 43210"
            required
            error={errors.phone?.message}
            leftIcon={
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.01 1.21 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92v2z"/>
              </svg>
            }
            {...register('phone')}
          />
        </div>

        {/* Line 1 */}
        <Input
          label="Address line 1"
          placeholder="Flat / House no., Building, Street"
          required
          error={errors.line1?.message}
          leftIcon={
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
            </svg>
          }
          {...register('line1')}
        />

        {/* Line 2 */}
        <Input
          label="Address line 2"
          placeholder="Area, Colony, Landmark (optional)"
          error={errors.line2?.message}
          {...register('line2')}
        />

        {/* City + Postal code */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="City"
            placeholder="Mumbai"
            required
            error={errors.city?.message}
            {...register('city')}
          />
          <Input
            label="PIN code"
            placeholder="400001"
            required
            error={errors.postalCode?.message}
            {...register('postalCode')}
          />
        </div>

        {/* State */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            State <span className="text-red-400">*</span>
          </label>
          <select
            className={`w-full bg-slate-800/70 border rounded-xl text-sm px-4 py-3 focus:outline-none focus:ring-2 transition-all ${
              errors.state
                ? 'border-red-500/60 text-white focus:border-red-500 focus:ring-red-500/20'
                : 'border-slate-700 hover:border-slate-600 text-white focus:border-violet-500 focus:ring-violet-500/20'
            }`}
            {...register('state')}
          >
            <option value="" className="bg-slate-900">Select state…</option>
            {INDIAN_STATES.map((s) => (
              <option key={s} value={s} className="bg-slate-900">{s}</option>
            ))}
          </select>
          {errors.state && (
            <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
              {errors.state.message}
            </p>
          )}
        </div>

        {/* Country */}
        <Input
          label="Country"
          placeholder="India"
          required
          error={errors.country?.message}
          {...register('country')}
        />

        {/* Set as default */}
        <label className="flex items-center gap-3 cursor-pointer group">
          <div className="relative shrink-0">
            <input type="checkbox" className="peer sr-only" {...register('isDefault')} />
            <div className={`w-[18px] h-[18px] rounded-md border transition-all flex items-center justify-center
              ${isDefault ? 'bg-violet-600 border-violet-600' : 'bg-slate-800 border-slate-600'}`}>
              {isDefault && (
                <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5">
                  <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
          </div>
          <span className="text-sm text-slate-300">Set as default address</span>
        </label>
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-slate-800 flex gap-3 shrink-0">
        <Button type="submit" variant="primary" size="md" loading={isLoading} fullWidth>
          {isEdit ? 'Save Changes' : 'Add Address'}
        </Button>
        <Button type="button" variant="ghost" size="md" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

// ── Drawer ────────────────────────────────────────────────────────────────────

interface DrawerProps {
  open:     boolean;
  title:    string;
  onClose:  () => void;
  children: React.ReactNode;
}

function Drawer({ open, title, onClose, children }: DrawerProps) {
  // lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={`fixed right-0 top-0 h-full w-full max-w-md z-50 bg-slate-950 border-l border-slate-800 flex flex-col shadow-2xl transition-transform duration-300 ease-out ${open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 shrink-0">
          <h2 className="text-base font-semibold text-white">{title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/8 transition-all"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" strokeLinecap="round"/>
              <line x1="6" y1="6" x2="18" y2="18" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {children}
        </div>
      </div>
    </>
  );
}

// ── Delete confirm modal ──────────────────────────────────────────────────────

interface DeleteModalProps {
  address:   Address | null;
  onConfirm: () => void;
  onCancel:  () => void;
  loading:   boolean;
}

function DeleteModal({ address, onConfirm, onCancel, loading }: DeleteModalProps) {
  if (!address) return null;
  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={onCancel}>
        <div
          className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-red-500/15 flex items-center justify-center shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-400">
                <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                <path d="M10 11v6"/><path d="M14 11v6"/>
                <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
              </svg>
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Delete address?</h3>
              <p className="text-sm text-slate-400 mt-1">
                <span className="text-white font-medium">{address.label || address.line1}</span> will be permanently removed.
                {address.isDefault && (
                  <span className="block mt-1 text-amber-400 text-xs">This is your default address — the next address will become default.</span>
                )}
              </p>
            </div>
          </div>
          <div className="flex gap-3 mt-5">
            <Button variant="danger" size="sm" fullWidth loading={loading} onClick={onConfirm}>
              Delete
            </Button>
            <Button variant="ghost"  size="sm" fullWidth onClick={onCancel} disabled={loading}>
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Address card ──────────────────────────────────────────────────────────────

const LABEL_ICON: Record<string, string> = { Home: '🏠', Work: '💼' };

interface AddressCardProps {
  address:   Address;
  onEdit:    (a: Address) => void;
  onDelete:  (a: Address) => void;
}

function AddressCard({ address, onEdit, onDelete }: AddressCardProps) {
  const [setDefault, { isLoading: settingDefault }] = useSetDefaultAddressMutation();

  const handleSetDefault = async () => {
    try {
      await setDefault(address.id).unwrap();
      toast.success('Default updated', `${address.label || address.fullName} is now your default address`);
    } catch {
      toast.error('Failed', 'Could not set default address');
    }
  };

  const icon = address.label ? (LABEL_ICON[address.label] ?? '📍') : '📍';

  return (
    <div className={`relative rounded-2xl border p-5 flex flex-col gap-4 transition-all duration-200 ${
      address.isDefault
        ? 'bg-violet-600/8 border-violet-500/30 shadow-lg shadow-violet-500/5'
        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
    }`}>
      {/* Default badge */}
      {address.isDefault && (
        <div className="absolute top-4 right-4">
          <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30 uppercase tracking-wide">
            <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
            Default
          </span>
        </div>
      )}

      {/* Label row */}
      <div className="flex items-center gap-2">
        <span className="text-lg">{icon}</span>
        <span className="text-sm font-semibold text-white">{address.label || 'Address'}</span>
      </div>

      {/* Address text */}
      <div className="space-y-1 text-sm text-slate-300 leading-relaxed">
        <p className="font-medium text-white">{address.fullName}</p>
        <p>{address.line1}</p>
        {address.line2 && <p>{address.line2}</p>}
        <p>{address.city}, {address.state} — {address.postalCode}</p>
        <p>{address.country}</p>
        <p className="text-slate-400 flex items-center gap-1.5 mt-1">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.01 1.21 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92v2z"/>
          </svg>
          {address.phone}
        </p>
      </div>

      {/* Action row */}
      <div className="flex items-center gap-2 pt-1 border-t border-slate-800/70 flex-wrap">
        {!address.isDefault && (
          <button
            disabled={settingDefault}
            onClick={handleSetDefault}
            className="text-xs font-medium text-violet-400 hover:text-violet-300 transition-colors flex items-center gap-1 disabled:opacity-50"
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" className="text-violet-400">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            {settingDefault ? 'Setting…' : 'Set default'}
          </button>
        )}
        <div className="flex items-center gap-1 ml-auto">
          <button
            onClick={() => onEdit(address)}
            className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-white/8 transition-all"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            Edit
          </button>
          <button
            onClick={() => onDelete(address)}
            className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-red-400 px-2.5 py-1.5 rounded-lg hover:bg-red-500/8 transition-all"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
            </svg>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Skeleton card ─────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="animate-pulse bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-3">
      <div className="h-4 w-24 bg-slate-800 rounded" />
      <div className="h-3 w-48 bg-slate-800 rounded" />
      <div className="h-3 w-36 bg-slate-800 rounded" />
      <div className="h-3 w-40 bg-slate-800 rounded" />
    </div>
  );
}

// ── Addresses Page ────────────────────────────────────────────────────────────

export default function AddressesPage() {
  const dispatch     = useAppDispatch();
  const refreshToken = useAppSelector((s) => s.auth.refreshToken);
  const [logoutApi]  = useLogoutMutation();

  const { data, isLoading } = useListAddressesQuery();
  const [deleteAddress, { isLoading: deleting }] = useDeleteAddressMutation();

  // Drawer state
  const [drawerOpen, setDrawerOpen]   = useState(false);
  const [editTarget, setEditTarget]   = useState<Address | null>(null);

  // Delete confirm state
  const [deleteTarget, setDeleteTarget] = useState<Address | null>(null);

  const addresses = data?.addresses ?? [];
  const MAX       = 10;

  const openAdd = () => { setEditTarget(null); setDrawerOpen(true); };
  const openEdit = (a: Address) => { setEditTarget(a); setDrawerOpen(true); };
  const closeDrawer = () => { setDrawerOpen(false); setEditTarget(null); };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteAddress(deleteTarget.id).unwrap();
      toast.success('Address deleted', deleteTarget.label || deleteTarget.line1);
      setDeleteTarget(null);
    } catch {
      toast.error('Failed', 'Could not delete address');
    }
  };

  const handleLogout = async () => {
    if (refreshToken) {
      try { await logoutApi({ refreshToken }).unwrap(); } catch { /* ignore */ }
    }
    dispatch(logout());
  };

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Top bar */}
      <header className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800/60">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center font-extrabold text-white text-sm shadow-lg shadow-violet-500/30">
              K
            </div>
            <span className="font-extrabold text-base tracking-tight text-white hidden sm:block">Klyro</span>
          </Link>

          <nav className="flex items-center gap-1">
            <Link to="/account/profile" className="text-sm text-slate-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/6">
              Profile
            </Link>
            <span className="text-slate-700">·</span>
            <span className="text-sm font-semibold text-white px-3 py-1.5">Addresses</span>
          </nav>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            leftIcon={
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
                <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            }
          >
            Sign out
          </Button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Page heading */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Saved Addresses</h1>
            <p className="text-slate-500 text-sm mt-1">
              {isLoading
                ? 'Loading…'
                : `${addresses.length} of ${MAX} addresses saved`}
            </p>
          </div>

          <Button
            variant="primary"
            size="md"
            disabled={addresses.length >= MAX}
            onClick={openAdd}
            leftIcon={
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
            }
          >
            Add Address
          </Button>
        </div>

        {/* Limit warning */}
        {addresses.length >= MAX && (
          <div className="flex items-center gap-3 px-4 py-3 bg-amber-500/8 border border-amber-500/20 rounded-xl text-sm text-amber-400">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            You've reached the maximum of {MAX} addresses. Delete one to add a new address.
          </div>
        )}

        {/* Address grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : addresses.length === 0 ? (
          <div className="text-center py-20 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-800/60 flex items-center justify-center mx-auto">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-slate-500">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
              </svg>
            </div>
            <div className="space-y-1">
              <h3 className="text-white font-semibold">No addresses saved</h3>
              <p className="text-slate-500 text-sm">Add a delivery address to speed up checkout.</p>
            </div>
            <Button variant="primary" size="md" onClick={openAdd}>
              Add your first address
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {addresses.map((a) => (
              <AddressCard
                key={a.id}
                address={a}
                onEdit={openEdit}
                onDelete={setDeleteTarget}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit drawer */}
      <Drawer
        open={drawerOpen}
        title={editTarget ? 'Edit Address' : 'New Address'}
        onClose={closeDrawer}
      >
        {drawerOpen && (
          <AddressForm
            existing={editTarget ?? undefined}
            onSuccess={closeDrawer}
            onCancel={closeDrawer}
          />
        )}
      </Drawer>

      {/* Delete confirm */}
      <DeleteModal
        address={deleteTarget}
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
