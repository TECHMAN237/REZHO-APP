import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { WEEKDAYS_SHORT, monthLabel, parseISODate, toISODate, todayISO } from '@rezho/shared';

export type DayState = 'available' | 'reserved' | 'unavailable' | 'maintenance' | 'closed';

interface AvailabilityCalendarProps {
  /** Resolve the state of a given ISO date */
  getState: (iso: string) => DayState;
  /** Click handler; typically toggles unavailable */
  onToggle?: (iso: string) => void;
  /** Reservation label shown in a tooltip */
  getLabel?: (iso: string) => string | undefined;
  compact?: boolean;
  initialMonth?: { y: number; m: number };
  legend?: Partial<Record<DayState, string>>;
}

const STATE_CLASS: Record<DayState, string> = {
  available: 'bg-lime-100 text-brand-900 hover:bg-lime-400/60',
  reserved: 'bg-[#DBEAFE] text-[#1D4ED8]',
  unavailable: 'bg-[#FEE2E2] text-[#B91C1C] hover:bg-[#FECACA]',
  maintenance: 'bg-[#FEF3C7] text-[#B45309]',
  closed: 'bg-ink-100 text-ink-500',
};

const DEFAULT_LEGEND: Record<DayState, string> = {
  available: 'Disponible',
  reserved: 'Réservé',
  unavailable: 'Indisponible',
  maintenance: 'Maintenance',
  closed: 'Fermé',
};

function buildGrid(year: number, month: number): (string | null)[] {
  const first = new Date(year, month, 1);
  const offset = (first.getDay() + 6) % 7;
  const days = new Date(year, month + 1, 0).getDate();
  const cells: (string | null)[] = Array.from({ length: offset }, () => null);
  for (let d = 1; d <= days; d++) cells.push(toISODate(new Date(year, month, d)));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export function AvailabilityCalendar({ getState, onToggle, getLabel, compact, initialMonth, legend }: AvailabilityCalendarProps) {
  const now = new Date();
  const [view, setView] = useState(initialMonth ?? { y: now.getFullYear(), m: now.getMonth() });
  const cells = buildGrid(view.y, view.m);
  const today = todayISO();
  const legendEntries = Object.entries({ ...DEFAULT_LEGEND, ...legend }) as [DayState, string][];
  const usedStates = new Set(cells.filter(Boolean).map((iso) => getState(iso!)));

  return (
    <div className="select-none">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[13px] font-semibold text-ink-900">{compact ? 'Calendrier de disponibilité' : ''}</p>
        <div className="flex items-center gap-1">
          <button type="button" aria-label="Mois précédent" onClick={() => setView((v) => (v.m === 0 ? { y: v.y - 1, m: 11 } : { y: v.y, m: v.m - 1 }))} className="h-8 w-8 rounded-[8px] hover:bg-ink-100 flex items-center justify-center">
            <ChevronLeft size={16} />
          </button>
          <span className="min-w-[130px] text-center text-[13px] font-bold text-ink-900">{monthLabel(view.y, view.m)}</span>
          <button type="button" aria-label="Mois suivant" onClick={() => setView((v) => (v.m === 11 ? { y: v.y + 1, m: 0 } : { y: v.y, m: v.m + 1 }))} className="h-8 w-8 rounded-[8px] hover:bg-ink-100 flex items-center justify-center">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEKDAYS_SHORT.map((d) => (
          <span key={d} className="text-center text-[11px] font-semibold text-ink-500 py-1">
            {d}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((iso, i) => {
          if (!iso) return <span key={`e${i}`} />;
          const state = getState(iso);
          const past = iso < today;
          const d = parseISODate(iso).getDate();
          const clickable = !!onToggle && !past && state !== 'reserved';
          return (
            <button
              key={iso}
              type="button"
              disabled={!clickable}
              title={getLabel?.(iso) ?? DEFAULT_LEGEND[state]}
              aria-label={`${iso} ${DEFAULT_LEGEND[state]}`}
              onClick={() => onToggle?.(iso)}
              className={`${compact ? 'h-8' : 'h-10'} rounded-[8px] text-[12px] font-semibold transition-colors ${past ? 'bg-ink-50 text-ink-300' : STATE_CLASS[state]} ${iso === today ? 'ring-2 ring-brand-600 ring-offset-1' : ''} ${clickable ? 'cursor-pointer' : 'cursor-default'}`}
            >
              {d}
            </button>
          );
        })}
      </div>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
        {legendEntries
          .filter(([k]) => usedStates.has(k) || k === 'available' || k === 'unavailable')
          .map(([k, label]) => (
            <span key={k} className="inline-flex items-center gap-1.5 text-[11px] text-ink-700">
              <span className={`h-3 w-3 rounded-[3px] ${STATE_CLASS[k].split(' ')[0]}`} /> {label}
            </span>
          ))}
      </div>
    </div>
  );
}
