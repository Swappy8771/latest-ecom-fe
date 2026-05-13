export type UserStatus        = 'ACTIVE' | 'PENDING' | 'SUSPENDED';
export type UserRole          = 'ADMIN' | 'SELLER' | 'USER';
export type VerificationStatus = 'NONE' | 'PENDING' | 'APPROVED' | 'REJECTED';
export type ProductStatus     = 'DRAFT' | 'ACTIVE' | 'INACTIVE';

export const statusCls: Record<UserStatus, string> = {
  ACTIVE:    'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
  PENDING:   'bg-amber-500/15  text-amber-400  border-amber-500/25',
  SUSPENDED: 'bg-red-500/15    text-red-400    border-red-500/25',
};

export const roleCls: Record<UserRole, string> = {
  ADMIN:  'bg-red-500/15    text-red-400    border-red-500/25',
  SELLER: 'bg-amber-500/15  text-amber-400  border-amber-500/25',
  USER:   'bg-violet-500/15 text-violet-400 border-violet-500/25',
};

export const verifyCls: Record<VerificationStatus, string> = {
  NONE:     'bg-slate-500/15   text-slate-400   border-slate-500/25',
  PENDING:  'bg-amber-500/15   text-amber-400   border-amber-500/25',
  APPROVED: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
  REJECTED: 'bg-red-500/15     text-red-400     border-red-500/25',
};

export const productStatusCls: Record<ProductStatus, string> = {
  ACTIVE:   'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
  DRAFT:    'bg-slate-500/15   text-slate-400   border-slate-500/25',
  INACTIVE: 'bg-red-500/15     text-red-400     border-red-500/25',
};

interface Props {
  label: string;
  cls:   string;
  size?: 'xs' | 'sm';
}

export default function Badge({ label, cls, size = 'xs' }: Props) {
  const text = size === 'xs' ? 'text-[10px]' : 'text-[11px]';
  const pad  = size === 'xs' ? 'px-2 py-0.5' : 'px-2.5 py-1';
  return (
    <span className={`inline-flex ${text} font-bold ${pad} rounded-full border uppercase tracking-wide ${cls}`}>
      {label}
    </span>
  );
}
