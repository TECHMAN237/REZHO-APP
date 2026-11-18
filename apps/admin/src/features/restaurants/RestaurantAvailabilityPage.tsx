import { useMemo, useState } from 'react';
import { Check, Clock, Info } from 'lucide-react';
import { formatDate, parseISODate, todayISO } from '@rezho/shared';
import { Page } from '@/components/layout/AppShell';
import { useAdminStore, useToastStore } from '@/store/useAdminStore';
import { AvailabilityCalendar, Avatar, Button, Card, Counter, DayPicker, Label, Select, StatusBadge } from '@/components/ui';

const HOURS = Array.from({ length: 17 }, (_, i) => `${String(7 + i).padStart(2, '0')}:00`);
const ALL_SLOTS = ['11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30'];

export function RestaurantAvailabilityPage() {
  const hours = useAdminStore((s) => s.restaurantHours);
  const setHours = useAdminStore((s) => s.setRestaurantHours);
  const toggleClosed = useAdminStore((s) => s.toggleRestaurantClosedDate);
  const reservations = useAdminStore((s) => s.reservations.restaurants);
  const show = useToastStore((s) => s.show);
  const [draft, setDraft] = useState({ openDays: hours.openDays, open: hours.open, close: hours.close, serviceSlots: hours.serviceSlots, maxCovers: hours.maxCovers });
  const [selectedDate, setSelectedDate] = useState(todayISO());

  const dayReservations = useMemo(() => reservations.filter((r) => r.startDate === selectedDate && r.status !== 'cancelled').sort((a, b) => (a.time ?? '').localeCompare(b.time ?? '')), [reservations, selectedDate]);
  const coversForDay = dayReservations.reduce((s, r) => s + (r.guests ?? 0), 0);

  const getState = (iso: string) => {
    const dow = ((parseISODate(iso).getDay() + 6) % 7) + 1;
    if (hours.closedDates.includes(iso)) return 'unavailable' as const;
    if (!hours.openDays.includes(dow)) return 'closed' as const;
    return reservations.some((r) => r.startDate === iso && r.status !== 'cancelled') ? ('reserved' as const) : ('available' as const);
  };

  const save = () => {
    setHours(draft);
    show('Horaires et disponibilités enregistrés.');
  };

  return (
    <Page title="Disponibilités" subtitle="Définissez vos jours d’ouverture, vos horaires de service et vos fermetures.">
      <div className="grid gap-5 xl:grid-cols-[1fr_380px]">
        <div className="space-y-5">
          <Card>
            <h2 className="text-[15px] font-bold text-ink-900 mb-1">Jours d’ouverture</h2>
            <p className="text-[12px] text-ink-500 mb-3">Les clients ne peuvent réserver que les jours cochés.</p>
            <DayPicker value={draft.openDays} onChange={(v) => setDraft({ ...draft, openDays: v })} />
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              <Select label="Ouverture" icon={<Clock size={15} />} value={draft.open} onChange={(e) => setDraft({ ...draft, open: e.target.value })}>
                {HOURS.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </Select>
              <Select label="Fermeture" icon={<Clock size={15} />} value={draft.close} onChange={(e) => setDraft({ ...draft, close: e.target.value })}>
                {HOURS.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </Select>
              <div className="flex flex-col gap-1.5">
                <Label>Couverts max. par service</Label>
                <Counter value={draft.maxCovers} onChange={(v) => setDraft({ ...draft, maxCovers: v })} min={10} max={300} label="Couverts maximum" />
              </div>
            </div>
            <h3 className="mt-5 text-[13px] font-bold text-ink-900">Créneaux de réservation</h3>
            <p className="text-[12px] text-ink-500 mb-2">Sélectionnez les horaires proposés aux clients.</p>
            <div className="flex flex-wrap gap-2">
              {ALL_SLOTS.map((slot) => {
                const on = draft.serviceSlots.includes(slot);
                return (
                  <button key={slot} type="button" aria-pressed={on} onClick={() => setDraft({ ...draft, serviceSlots: on ? draft.serviceSlots.filter((s) => s !== slot) : [...draft.serviceSlots, slot].sort() })} className={`h-9 rounded-full border px-3.5 text-[12px] font-semibold transition-colors ${on ? 'border-brand-700 bg-brand-900 text-white' : 'border-ink-200 bg-white text-ink-700 hover:border-ink-300'}`}>
                    {slot}
                  </button>
                );
              })}
            </div>
            <div className="mt-5 flex justify-end">
              <Button rightIcon={<Check size={16} />} onClick={save}>
                Enregistrer
              </Button>
            </div>
          </Card>

          <Card>
            <h2 className="text-[15px] font-bold text-ink-900 mb-1">Fermetures exceptionnelles</h2>
            <p className="text-[12px] text-ink-500 mb-3">Cliquez sur un jour pour fermer ou rouvrir le restaurant à cette date.</p>
            <AvailabilityCalendar
              getState={getState}
              getLabel={(iso) => {
                const n = reservations.filter((r) => r.startDate === iso && r.status !== 'cancelled').length;
                return n ? `${n} réservation${n > 1 ? 's' : ''}` : undefined;
              }}
              onToggle={(iso) => {
                setSelectedDate(iso);
                if (getState(iso) === 'closed') return;
                toggleClosed(iso);
                show(hours.closedDates.includes(iso) ? `${formatDate(iso)} : restaurant rouvert.` : `${formatDate(iso)} : fermeture enregistrée.`, 'info');
              }}
              legend={{ unavailable: 'Fermé (exceptionnel)', closed: 'Jour de fermeture', reserved: 'Réservations' }}
            />
            <p className="mt-4 flex items-center gap-2 rounded-[10px] bg-brand-50 px-3 py-2 text-[12px] text-brand-800">
              <Info size={14} /> Les jours avec réservations restent ouverts : contactez les clients avant de fermer.
            </p>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <h2 className="text-[14px] font-bold text-ink-900">Horaires actuels</h2>
            <dl className="mt-3 space-y-1.5 text-[12px]">
              <div className="flex justify-between">
                <dt className="text-ink-500">Service</dt>
                <dd className="font-semibold">
                  {hours.open} – {hours.close}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-500">Jours ouverts</dt>
                <dd className="font-semibold">{hours.openDays.length} / 7</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-500">Créneaux</dt>
                <dd className="font-semibold">{hours.serviceSlots.length}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-500">Fermetures</dt>
                <dd className="font-semibold">{hours.closedDates.length}</dd>
              </div>
            </dl>
          </Card>
          <Card padded={false}>
            <div className="px-5 pt-5">
              <h2 className="text-[14px] font-bold text-ink-900">Réservations du {formatDate(selectedDate)}</h2>
              <p className="text-[12px] text-ink-500">
                {coversForDay} couvert{coversForDay > 1 ? 's' : ''} sur {hours.maxCovers}
              </p>
              <div className="mt-2 h-1.5 rounded-full bg-ink-100 overflow-hidden">
                <div className="h-full rounded-full bg-brand-500" style={{ width: `${Math.min(100, (coversForDay / hours.maxCovers) * 100)}%` }} />
              </div>
            </div>
            {dayReservations.length === 0 ? (
              <p className="px-5 py-6 text-[12px] text-ink-500">Aucune réservation ce jour. Cliquez sur une date du calendrier pour la consulter.</p>
            ) : (
              <ul className="mt-3 divide-y divide-ink-100">
                {dayReservations.map((r) => (
                  <li key={r.id} className="flex items-center gap-3 px-5 py-3">
                    <Avatar src={r.customer.avatar} name={r.customer.name} size={32} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[12px] font-semibold text-ink-900">{r.customer.name}</p>
                      <p className="text-[11px] text-ink-500">
                        {r.time} · {r.guests} pers. · {r.itemName}
                      </p>
                    </div>
                    <StatusBadge status={r.status} />
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </Page>
  );
}
