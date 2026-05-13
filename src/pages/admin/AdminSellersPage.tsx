import { useState } from 'react';
import {
  useListAdminSellersQuery,
  useUpdateSellerVerificationMutation,
  useUpdateSellerStatusMutation,
  type AdminUser,
  type VerificationStatus,
} from '../../services/adminApi';
import { toast } from '../../components/ui/Toast';
import Badge, { verifyCls, statusCls } from '../../components/ui/Badge';
import type { UserStatus } from '../../components/ui/Badge';
import Avatar from '../../components/ui/Avatar';

// ── Verification action buttons ───────────────────────────────────────────────

function VerifyActions({ seller }: { seller: AdminUser }) {
  const [updateVerification, { isLoading: vLoading }] = useUpdateSellerVerificationMutation();
  const [updateStatus,       { isLoading: sLoading }] = useUpdateSellerStatusMutation();
  const loading = vLoading || sLoading;

  const setVerification = async (verificationStatus: VerificationStatus) => {
    try {
      await updateVerification({ id: seller.id, verificationStatus }).unwrap();
      toast.success(
        verificationStatus === 'APPROVED' ? 'Seller approved' : verificationStatus === 'REJECTED' ? 'Seller rejected' : 'Status updated',
        seller.name,
      );
    } catch {
      toast.error('Failed', 'Could not update verification');
    }
  };

  const toggleStatus = async () => {
    const next = seller.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      await updateStatus({ id: seller.id, status: next }).unwrap();
      toast.success('Status updated', `${seller.name} → ${next}`);
    } catch {
      toast.error('Failed', 'Could not update status');
    }
  };

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {seller.verificationStatus !== 'APPROVED' && (
        <button
          disabled={loading}
          onClick={() => setVerification('APPROVED')}
          className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 hover:bg-emerald-500/25 transition-all disabled:opacity-50"
        >
          Approve
        </button>
      )}
      {seller.verificationStatus !== 'REJECTED' && (
        <button
          disabled={loading}
          onClick={() => setVerification('REJECTED')}
          className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-red-500/15 text-red-400 border border-red-500/25 hover:bg-red-500/25 transition-all disabled:opacity-50"
        >
          Reject
        </button>
      )}
      <button
        disabled={loading}
        onClick={toggleStatus}
        className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-all disabled:opacity-50 ${
          seller.status === 'ACTIVE'
            ? 'bg-slate-700/50 text-slate-400 border-slate-600 hover:bg-red-500/15 hover:text-red-400 hover:border-red-500/25'
            : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25 hover:bg-emerald-500/25'
        }`}
      >
        {seller.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
      </button>
    </div>
  );
}

// ── Skeleton row ──────────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <tr className="border-b border-slate-800/50 animate-pulse">
      {[180, 120, 100, 80, 90, 150].map((w, i) => (
        <td key={i} className="px-4 py-4">
          <div className="h-4 bg-slate-800 rounded" style={{ width: w }} />
        </td>
      ))}
    </tr>
  );
}

// ── Pagination ────────────────────────────────────────────────────────────────

function Pagination({ page, pages, onPage }: { page: number; pages: number; onPage: (p: number) => void }) {
  if (pages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-1.5 py-4">
      <button disabled={page <= 1} onClick={() => onPage(page - 1)} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 border border-slate-700 text-slate-400 hover:text-white disabled:opacity-40 disabled:pointer-events-none transition-all">← Prev</button>
      {Array.from({ length: Math.min(pages, 7) }, (_, i) => {
        const p = pages <= 7 ? i + 1 : page <= 4 ? i + 1 : page + i - 3;
        if (p < 1 || p > pages) return null;
        return (
          <button key={p} onClick={() => onPage(p)} className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all ${p === page ? 'bg-violet-600 text-white border border-violet-500' : 'bg-slate-800 border border-slate-700 text-slate-400 hover:text-white'}`}>{p}</button>
        );
      })}
      <button disabled={page >= pages} onClick={() => onPage(page + 1)} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 border border-slate-700 text-slate-400 hover:text-white disabled:opacity-40 disabled:pointer-events-none transition-all">Next →</button>
    </div>
  );
}

// ── Sellers Page ──────────────────────────────────────────────────────────────

const VERIFY_FILTERS: { label: string; value: VerificationStatus | '' }[] = [
  { label: 'All',      value: '' },
  { label: 'Pending',  value: 'PENDING' },
  { label: 'Approved', value: 'APPROVED' },
  { label: 'Rejected', value: 'REJECTED' },
];

export default function AdminSellersPage() {
  const [page,   setPage]   = useState(1);
  const [filter, setFilter] = useState<VerificationStatus | ''>('');

  const { data, isLoading, isFetching } = useListAdminSellersQuery({
    page,
    limit: 20,
    verificationStatus: filter || undefined,
  });

  const loading = isLoading || isFetching;

  // Counts per status for the filter tabs
  const pending  = data?.sellers.filter((s) => s.verificationStatus === 'PENDING').length  ?? 0;

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white">Sellers</h1>
        <p className="text-slate-500 text-sm mt-0.5">
          {data ? `${data.total.toLocaleString()} total` : 'Loading…'}
          {pending > 0 && filter !== 'PENDING' && (
            <span className="ml-2 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/25">
              {pending} pending approval
            </span>
          )}
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1.5 flex-wrap">
        {VERIFY_FILTERS.map(({ label, value }) => (
          <button
            key={label}
            onClick={() => { setFilter(value); setPage(1); }}
            className={[
              'px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all border',
              filter === value
                ? 'bg-violet-600/20 text-violet-300 border-violet-500/30'
                : 'bg-slate-800/60 text-slate-400 border-slate-700 hover:text-white hover:border-slate-600',
            ].join(' ')}
          >
            {label}
            {label === 'Pending' && pending > 0 && (
              <span className="ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400">{pending}</span>
            )}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className={`bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden ${loading ? 'opacity-70' : ''}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Seller</th>
                <th className="px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Business</th>
                <th className="px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wide">GST</th>
                <th className="px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Verification</th>
                <th className="px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Account</th>
                <th className="px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)
                : data?.sellers.map((s) => (
                  <tr key={s.id} className="border-b border-slate-800/50 hover:bg-white/3 transition-colors">

                    {/* Seller */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={s.name} avatar={s.avatar} />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-white truncate max-w-[150px]">{s.name}</p>
                          <p className="text-xs text-slate-500 truncate max-w-[150px]">{s.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Business */}
                    <td className="px-4 py-4 text-sm text-slate-300 max-w-[140px]">
                      <p className="truncate">{s.businessName || <span className="text-slate-600 italic">—</span>}</p>
                    </td>

                    {/* GST */}
                    <td className="px-4 py-4 text-xs text-slate-400 font-mono whitespace-nowrap">
                      {s.gstNumber || <span className="text-slate-600 not-italic">—</span>}
                    </td>

                    {/* Verification */}
                    <td className="px-4 py-4">
                      <Badge label={s.verificationStatus} cls={verifyCls[s.verificationStatus]} />
                    </td>

                    {/* Account status */}
                    <td className="px-4 py-4">
                      <Badge label={s.status} cls={statusCls[s.status as UserStatus] ?? statusCls.ACTIVE} />
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-4">
                      <VerifyActions seller={s} />
                    </td>
                  </tr>
                ))
              }

              {!isLoading && data?.sellers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center text-slate-500 text-sm">
                    No sellers found{filter ? ` with status "${filter}"` : ''}.
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
