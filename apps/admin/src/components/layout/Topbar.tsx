import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, CalendarDays, ChevronDown, Menu } from 'lucide-react';
import type { ProviderKind } from '@rezho/shared';
import { formatDateRange } from '@rezho/shared';
import { PROVIDERS } from '@/config/providers';
import { useAdminStore } from '@/store/useAdminStore';
import { Avatar } from '@/components/ui';

export const DATE_RANGES = [
  { key: '7d', label: '7 derniers jours', start: '2026-11-12', end: '2026-11-18' },
  { key: 'month', label: 'Ce mois-ci', start: '2026-11-01', end: '2026-11-30' },
  { key: 'next', label: 'Mois prochain', start: '2026-12-01', end: '2026-12-31' },
  { key: 'quarter', label: 'Ce trimestre', start: '2026-10-01', end: '2026-12-31' },
] as const;

export type RangeKey = (typeof DATE_RANGES)[number]['key'];

export function DateRangeSelect({ value, onChange }: { value: RangeKey; onChange: (v: RangeKey) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = DATE_RANGES.find((r) => r.key === value) ?? DATE_RANGES[1];
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false);
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);
  return (
    <div ref={ref} className="relative">
      <button type="button" aria-haspopup="listbox" aria-expanded={open} onClick={() => setOpen((v) => !v)} className="inline-flex h-10 items-center gap-2 rounded-full border border-ink-200 bg-white px-3.5 text-[12px] font-semibold text-ink-900 hover:border-ink-300">
        <CalendarDays size={15} className="text-ink-500" />
        {formatDateRange(current.start, current.end)}
        <ChevronDown size={14} className="text-ink-500" />
      </button>
      {open && (
        <ul role="listbox" className="absolute right-0 top-11 z-30 min-w-[200px] rounded-[12px] border border-ink-100 bg-white p-1.5 shadow-float pop-in">
          {DATE_RANGES.map((r) => (
            <li key={r.key}>
              <button
                type="button"
                role="option"
                aria-selected={r.key === value}
                onClick={() => {
                  onChange(r.key);
                  setOpen(false);
                }}
                className={`flex w-full flex-col rounded-[8px] px-3 py-2 text-left hover:bg-brand-50 ${r.key === value ? 'bg-brand-50' : ''}`}
              >
                <span className="text-[12px] font-semibold text-ink-900">{r.label}</span>
                <span className="text-[11px] text-ink-500">{formatDateRange(r.start, r.end)}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function Topbar({ kind, onOpenMobile, title, subtitle, right }: { kind: ProviderKind; onOpenMobile: () => void; title: string; subtitle?: string; right?: React.ReactNode }) {
  const cfg = PROVIDERS[kind];
  const profile = useAdminStore((s) => s.profiles[kind]);
  const reservations = useAdminStore((s) => s.reservations[kind]);
  // Derive with useMemo: a selector returning a fresh array would re-render endlessly.
  const pendingList = useMemo(() => reservations.filter((r) => r.status === 'pending').slice(0, 4), [reservations]);
  const pending = useMemo(() => reservations.filter((r) => r.status === 'pending').length, [reservations]);
  const [notifOpen, setNotifOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!notifOpen) return;
    const onDoc = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setNotifOpen(false);
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [notifOpen]);
  return (
    <header className="flex items-start gap-3 px-5 pt-5 pb-4 lg:px-8 lg:pt-6">
      <button type="button" aria-label="Ouvrir le menu" onClick={onOpenMobile} className="lg:hidden mt-1 h-9 w-9 rounded-[8px] bg-white shadow-card flex items-center justify-center text-ink-900">
        <Menu size={18} />
      </button>
      <div className="min-w-0 flex-1">
        <h1 className="text-[20px] lg:text-[22px] font-extrabold text-ink-900 leading-tight truncate">{title}</h1>
        {subtitle && <p className="text-[12px] lg:text-[13px] text-ink-500 mt-0.5">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-2.5 shrink-0">
        {right}
        <div ref={ref} className="relative">
          <button type="button" aria-label={`Notifications${pending ? ` (${pending})` : ''}`} aria-expanded={notifOpen} onClick={() => setNotifOpen((v) => !v)} className="relative h-10 w-10 rounded-full bg-white shadow-card flex items-center justify-center text-ink-900 hover:bg-ink-50">
            <Bell size={18} />
            {pending > 0 && <span className="absolute top-2 right-2.5 h-2 w-2 rounded-full bg-danger ring-2 ring-white" />}
          </button>
          {notifOpen && (
            <div className="absolute right-0 top-12 z-30 w-[320px] rounded-[12px] border border-ink-100 bg-white p-2 shadow-float pop-in">
              <p className="px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink-500">Notifications</p>
              {pendingList.length === 0 ? (
                <p className="px-2 py-4 text-[12px] text-ink-500">Aucune nouvelle notification.</p>
              ) : (
                pendingList.map((r) => (
                  <Link key={r.id} to={`${cfg.basePath}/reservations?focus=${r.id}`} onClick={() => setNotifOpen(false)} className="flex items-start gap-2.5 rounded-[8px] px-2 py-2 hover:bg-brand-50">
                    <Avatar src={r.customer.avatar} name={r.customer.name} size={30} />
                    <span className="min-w-0">
                      <span className="block text-[12px] font-semibold text-ink-900">Nouvelle réservation en attente</span>
                      <span className="block truncate text-[11px] text-ink-500">
                        {r.customer.name} · {r.itemName}
                      </span>
                    </span>
                  </Link>
                ))
              )}
            </div>
          )}
        </div>
        <Link to={`${cfg.basePath}/settings?tab=account`} aria-label="Mon compte" className="shrink-0">
          <Avatar src={profile.managerAvatar} name={profile.managerName} size={40} />
        </Link>
      </div>
    </header>
  );
}
