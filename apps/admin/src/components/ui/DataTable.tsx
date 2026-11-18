import type { ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  className?: string;
  align?: 'left' | 'right' | 'center';
  /** Hide on tablet widths (< 1024px) */
  hideBelowLg?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  empty?: ReactNode;
  page?: number;
  pageSize?: number;
  onPageChange?: (p: number) => void;
  dense?: boolean;
}

export function DataTable<T>({ columns, rows, rowKey, onRowClick, empty, page = 1, pageSize, onPageChange, dense }: DataTableProps<T>) {
  const total = rows.length;
  const pages = pageSize ? Math.max(1, Math.ceil(total / pageSize)) : 1;
  const current = Math.min(page, pages);
  const visible = pageSize ? rows.slice((current - 1) * pageSize, current * pageSize) : rows;

  return (
    <div className="overflow-hidden rounded-[16px] bg-white shadow-card">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-[13px]">
          <thead>
            <tr className="border-b border-ink-100 text-[11px] font-semibold uppercase tracking-wide text-ink-500">
              {columns.map((c) => (
                <th key={c.key} scope="col" className={`px-4 ${dense ? 'py-2.5' : 'py-3'} font-semibold whitespace-nowrap ${c.align === 'right' ? 'text-right' : c.align === 'center' ? 'text-center' : ''} ${c.hideBelowLg ? 'hidden lg:table-cell' : ''} ${c.className ?? ''}`}>
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 ? (
              <tr>
                <td colSpan={columns.length}>{empty ?? <p className="py-10 text-center text-[13px] text-ink-500">Aucun résultat.</p>}</td>
              </tr>
            ) : (
              visible.map((row) => (
                <tr
                  key={rowKey(row)}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={`border-b border-ink-100 last:border-0 transition-colors ${onRowClick ? 'cursor-pointer hover:bg-brand-50/60' : ''}`}
                >
                  {columns.map((c) => (
                    <td key={c.key} className={`px-4 ${dense ? 'py-2.5' : 'py-3'} align-middle ${c.align === 'right' ? 'text-right' : c.align === 'center' ? 'text-center' : ''} ${c.hideBelowLg ? 'hidden lg:table-cell' : ''} ${c.className ?? ''}`}>
                      {c.render(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {pageSize && total > pageSize && (
        <div className="flex items-center justify-between border-t border-ink-100 px-4 py-3 text-[12px] text-ink-500">
          <span>
            {(current - 1) * pageSize + 1}–{Math.min(current * pageSize, total)} sur {total}
          </span>
          <div className="flex items-center gap-1">
            <button type="button" aria-label="Page précédente" disabled={current <= 1} onClick={() => onPageChange?.(current - 1)} className="h-8 w-8 rounded-[8px] flex items-center justify-center hover:bg-ink-100 disabled:opacity-40">
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
              <button key={p} type="button" aria-current={p === current ? 'page' : undefined} onClick={() => onPageChange?.(p)} className={`h-8 min-w-[32px] rounded-[8px] px-2 font-semibold ${p === current ? 'bg-brand-900 text-white' : 'hover:bg-ink-100 text-ink-700'}`}>
                {p}
              </button>
            ))}
            <button type="button" aria-label="Page suivante" disabled={current >= pages} onClick={() => onPageChange?.(current + 1)} className="h-8 w-8 rounded-[8px] flex items-center justify-center hover:bg-ink-100 disabled:opacity-40">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
