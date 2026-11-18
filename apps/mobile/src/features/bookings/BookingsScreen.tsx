import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, CalendarX2, MapPin } from 'lucide-react';
import { formatDateRange, formatFCFA, type Booking } from '@rezho/shared';
import { Button, Chip, EmptyState, StatusBadge } from '@/components/ui';
import { Screen } from '@/components/layout/Screen';
import { BottomNav } from '@/components/layout/BottomNav';
import { AssistantFab } from '@/components/layout/AssistantFab';
import { useAppStore } from '@/store/useAppStore';

type Filter = 'active' | 'completed' | 'cancelled';

const KIND_LABEL: Record<Booking['kind'], string> = { accommodation: 'Hébergement', restaurant: 'Restaurant', vehicle: 'Véhicule' };

export function BookingsScreen() {
  const bookings = useAppStore((s) => s.bookings);
  const [filter, setFilter] = useState<Filter>('active');

  const list = bookings
    .filter((b) => (filter === 'active' ? b.status === 'confirmed' || b.status === 'ongoing' || b.status === 'pending' : filter === 'completed' ? b.status === 'completed' : b.status === 'cancelled'))
    .sort((a, b) => (a.startDate < b.startDate ? (filter === 'active' ? -1 : 1) : filter === 'active' ? 1 : -1));

  const counts = {
    active: bookings.filter((b) => b.status === 'confirmed' || b.status === 'ongoing' || b.status === 'pending').length,
    completed: bookings.filter((b) => b.status === 'completed').length,
    cancelled: bookings.filter((b) => b.status === 'cancelled').length,
  };

  return (
    <div className="relative flex flex-col flex-1 min-h-0">
      <Screen topBar={{ title: 'Mes réservations' }} withNav>
        <div className="flex gap-2 pb-3">
          {(
            [
              ['active', 'À venir'],
              ['completed', 'Terminées'],
              ['cancelled', 'Annulées'],
            ] as [Filter, string][]
          ).map(([k, label]) => (
            <Chip key={k} active={filter === k} onClick={() => setFilter(k)}>
              {label} ({counts[k]})
            </Chip>
          ))}
        </div>
        {list.length === 0 ? (
          <EmptyState
            icon={filter === 'active' ? <CalendarDays size={28} /> : <CalendarX2 size={28} />}
            title={filter === 'active' ? 'Aucune réservation à venir' : filter === 'completed' ? 'Aucune réservation terminée' : 'Aucune réservation annulée'}
            text={filter === 'active' ? 'Explorez les hébergements, restaurants et véhicules pour réserver.' : undefined}
            action={
              filter === 'active' ? (
                <Link to="/home">
                  <Button>Explorer</Button>
                </Link>
              ) : undefined
            }
          />
        ) : (
          <ul className="space-y-3">
            {list.map((b) => (
              <li key={b.id}>
                <Link to={`/bookings/${b.id}`} className="block rounded-[16px] bg-white p-3 shadow-card">
                  <div className="flex gap-3">
                    <img src={b.itemImage} alt="" className="h-[70px] w-[70px] rounded-[12px] object-cover" loading="lazy" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-[10px] font-semibold uppercase tracking-wide text-brand-700">{KIND_LABEL[b.kind]}</p>
                          <p className="text-[14px] font-bold text-ink-900 truncate">{b.itemName}</p>
                        </div>
                        <StatusBadge status={b.status} />
                      </div>
                      <p className="mt-0.5 flex items-center gap-1 text-[11px] text-ink-500">
                        <MapPin size={12} /> {b.city}
                      </p>
                      <p className="flex items-center gap-1 text-[11px] text-ink-700">
                        <CalendarDays size={12} /> {formatDateRange(b.startDate, b.endDate)}
                        {b.time ? ` · ${b.time}` : ''}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2.5 flex items-center justify-between border-t border-ink-100 pt-2.5 text-[12px]">
                    <span className="text-ink-500">N° {b.ref}</span>
                    <span className="font-bold text-ink-900">{b.total === 0 ? 'Sans prépaiement' : formatFCFA(b.total)}</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Screen>
      <AssistantFab />
      <BottomNav />
    </div>
  );
}
