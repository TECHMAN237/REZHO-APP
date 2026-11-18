import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { WEEKDAYS_SHORT, addDays, monthLabel, parseISODate, toISODate, todayISO } from '@rezho/shared';

interface CalendarProps {
  /** 'range' selects start+end, 'single' selects one date */
  mode: 'range' | 'single';
  start?: string;
  end?: string;
  onChange: (start: string, end?: string) => void;
  minDate?: string;
  unavailable?: string[];
}

function buildGrid(year: number, month: number): (string | null)[] {
  const first = new Date(year, month, 1);
  // Monday-first offset
  const offset = (first.getDay() + 6) % 7;
  const days = new Date(year, month + 1, 0).getDate();
  const cells: (string | null)[] = Array.from({ length: offset }, () => null);
  for (let d = 1; d <= days; d++) cells.push(toISODate(new Date(year, month, d)));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export function Calendar({ mode, start, end, onChange, minDate = todayISO(), unavailable = [] }: CalendarProps) {
  const base = start ? parseISODate(start) : parseISODate(minDate);
  const [view, setView] = useState({ y: base.getFullYear(), m: base.getMonth() });
  const cells = buildGrid(view.y, view.m);

  const prev = () => setView((v) => (v.m === 0 ? { y: v.y - 1, m: 11 } : { y: v.y, m: v.m - 1 }));
  const next = () => setView((v) => (v.m === 11 ? { y: v.y + 1, m: 0 } : { y: v.y, m: v.m + 1 }));

  const pick = (iso: string) => {
    if (mode === 'single') {
      onChange(iso);
      return;
    }
    if (!start || (start && end)) {
      onChange(iso, undefined);
    } else if (iso <= start) {
      onChange(iso, undefined);
    } else {
      onChange(start, iso);
    }
  };

  return (
    <div className="select-none">
      <div className="flex items-center justify-between mb-3">
        <button type="button" aria-label="Mois précédent" onClick={prev} className="h-8 w-8 rounded-full hover:bg-ink-50 flex items-center justify-center">
          <ChevronLeft size={18} />
        </button>
        <span className="text-[14px] font-bold text-ink-900">{monthLabel(view.y, view.m)}</span>
        <button type="button" aria-label="Mois suivant" onClick={next} className="h-8 w-8 rounded-full hover:bg-ink-50 flex items-center justify-center">
          <ChevronRight size={18} />
        </button>
      </div>
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS_SHORT.map((d) => (
          <span key={d} className="text-center text-[11px] font-semibold text-ink-500 py-1">
            {d}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-1">
        {cells.map((iso, i) => {
          if (!iso) return <span key={`e${i}`} />;
          const disabled = iso < minDate || unavailable.includes(iso);
          const isStart = iso === start;
          const isEnd = iso === end;
          const inRange = !!start && !!end && iso > start && iso < end;
          const d = parseISODate(iso).getDate();
          return (
            <button
              key={iso}
              type="button"
              disabled={disabled}
              aria-pressed={isStart || isEnd}
              aria-label={iso}
              onClick={() => pick(iso)}
              className={`relative h-9 text-[13px] font-medium transition-colors ${
                inRange ? 'bg-brand-100 text-brand-900' : ''
              } ${isStart ? 'rounded-l-full' : ''} ${isEnd ? 'rounded-r-full' : ''} ${disabled ? 'text-ink-300 line-through' : 'text-ink-900'}`}
            >
              <span
                className={`flex h-9 w-9 mx-auto items-center justify-center rounded-full ${
                  isStart || isEnd ? 'bg-brand-700 text-white font-bold' : disabled ? '' : 'hover:bg-ink-50'
                }`}
              >
                {d}
              </span>
            </button>
          );
        })}
      </div>
      {mode === 'range' && (
        <p className="mt-3 text-[11px] text-ink-500 text-center">
          {!start ? 'Sélectionnez la date d’arrivée' : !end ? 'Sélectionnez la date de départ' : `${start === end ? '' : ''}`}
        </p>
      )}
    </div>
  );
}

export function nextAvailableRange(unavailable: string[], nights = 2): { start: string; end: string } {
  let start = addDays(todayISO(), 1);
  // find a start where all nights are available
  for (let tries = 0; tries < 60; tries++) {
    let ok = true;
    for (let n = 0; n < nights; n++) if (unavailable.includes(addDays(start, n))) ok = false;
    if (ok) break;
    start = addDays(start, 1);
  }
  return { start, end: addDays(start, nights) };
}
