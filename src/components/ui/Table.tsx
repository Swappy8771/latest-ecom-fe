import type { ReactNode } from 'react';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface Column<T> {
  key:       string;
  label:     string;
  align?:    'left' | 'center' | 'right';
  width?:    string;
  render?:   (value: unknown, row: T, index: number) => ReactNode;
}

interface TableProps<T extends Record<string, unknown>> {
  columns:      Column<T>[];
  data:         T[];
  loading?:     boolean;
  emptyText?:   string;
  emptyIcon?:   ReactNode;
  keyField?:    string;
  onRowClick?:  (row: T) => void;
  skeletonRows?: number;
  className?:   string;
}

// ── Skeleton row ──────────────────────────────────────────────────────────────

function SkeletonRow({ cols }: { cols: number }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-5 py-4">
          <div className="h-4 bg-slate-800 rounded-lg animate-pulse" style={{ width: `${60 + (i * 13) % 35}%` }} />
        </td>
      ))}
    </tr>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyState({ icon, text, colSpan }: { icon?: ReactNode; text: string; colSpan: number }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-5 py-16 text-center">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          {icon ?? (
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
              <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
            </svg>
          )}
          <p className="text-sm font-medium">{text}</p>
        </div>
      </td>
    </tr>
  );
}

// ── Table ─────────────────────────────────────────────────────────────────────

export default function Table<T extends Record<string, unknown>>({
  columns,
  data,
  loading = false,
  emptyText = 'No data found',
  emptyIcon,
  keyField = '_id',
  onRowClick,
  skeletonRows = 6,
  className = '',
}: TableProps<T>) {
  const alignClass = { left: 'text-left', center: 'text-center', right: 'text-right' };

  return (
    <div className={`rounded-2xl border border-slate-800/80 overflow-hidden bg-slate-900/50 ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          {/* Head */}
          <thead>
            <tr className="border-b border-slate-800">
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={col.width ? { width: col.width } : undefined}
                  className={[
                    'px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-900/80',
                    alignClass[col.align ?? 'left'],
                  ].join(' ')}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>

          {/* Body */}
          <tbody className="divide-y divide-slate-800/60">
            {loading ? (
              Array.from({ length: skeletonRows }).map((_, i) => (
                <SkeletonRow key={i} cols={columns.length} />
              ))
            ) : data.length === 0 ? (
              <EmptyState icon={emptyIcon} text={emptyText} colSpan={columns.length} />
            ) : (
              data.map((row, rowIdx) => {
                const rowKey = String(row[keyField] ?? row.id ?? rowIdx);
                return (
                  <tr
                    key={rowKey}
                    onClick={() => onRowClick?.(row)}
                    className={[
                      'transition-colors duration-150',
                      onRowClick ? 'cursor-pointer hover:bg-white/[0.03]' : '',
                    ].join(' ')}
                  >
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={[
                          'px-5 py-4 text-slate-300',
                          alignClass[col.align ?? 'left'],
                        ].join(' ')}
                      >
                        {col.render
                          ? col.render(row[col.key], row, rowIdx)
                          : String(row[col.key] ?? '—')}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Pagination ────────────────────────────────────────────────────────────────

interface PaginationProps {
  page:       number;
  totalPages: number;
  onPage:     (page: number) => void;
  className?: string;
}

export function Pagination({ page, totalPages, onPage, className = '' }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const visible = pages.filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1);

  return (
    <div className={`flex items-center justify-center gap-1 ${className}`}>
      <button
        onClick={() => onPage(page - 1)}
        disabled={page <= 1}
        className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/8 disabled:opacity-30 disabled:pointer-events-none transition-all"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
      </button>

      {visible.map((p, i) => {
        const prev = visible[i - 1];
        return (
          <>
            {prev && p - prev > 1 && (
              <span key={`ellipsis-${p}`} className="w-8 h-8 flex items-center justify-center text-slate-600 text-xs">…</span>
            )}
            <button
              key={p}
              onClick={() => onPage(p)}
              className={[
                'w-8 h-8 flex items-center justify-center rounded-lg text-sm font-semibold transition-all',
                p === page
                  ? 'bg-gradient-to-r from-violet-600 to-blue-600 text-white shadow-md shadow-violet-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/8',
              ].join(' ')}
            >
              {p}
            </button>
          </>
        );
      })}

      <button
        onClick={() => onPage(page + 1)}
        disabled={page >= totalPages}
        className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/8 disabled:opacity-30 disabled:pointer-events-none transition-all"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
      </button>
    </div>
  );
}

// ── Status Badge (common table cell pattern) ──────────────────────────────────

type StatusType = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

const statusStyles: Record<StatusType, string> = {
  success: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
  warning: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
  danger:  'bg-red-500/15 text-red-400 border-red-500/25',
  info:    'bg-blue-500/15 text-blue-400 border-blue-500/25',
  neutral: 'bg-slate-700/40 text-slate-400 border-slate-600/40',
};

export function StatusBadge({ type, label }: { type: StatusType; label: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${statusStyles[type]}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}
