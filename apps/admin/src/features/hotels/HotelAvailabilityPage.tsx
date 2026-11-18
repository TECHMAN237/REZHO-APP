import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Info } from 'lucide-react';
import { formatDateRange, formatFCFA, type RoomStatus } from '@rezho/shared';
import { Page } from '@/components/layout/AppShell';
import { useAdminStore, useToastStore } from '@/store/useAdminStore';
import { AvailabilityCalendar, Avatar, Card, RoomStatusBadge, Select, StatusBadge, Thumb } from '@/components/ui';

function eachNight(start: string, end?: string): string[] {
  if (!end) return [start];
  const out: string[] = [];
  let d = start;
  while (d < end) {
    out.push(d);
    const nd = new Date(d);
    nd.setDate(nd.getDate() + 1);
    d = nd.toISOString().slice(0, 10);
  }
  return out;
}

export function HotelAvailabilityPage() {
  const rooms = useAdminStore((s) => s.rooms);
  const reservations = useAdminStore((s) => s.reservations.hotels);
  const toggleRoomDate = useAdminStore((s) => s.toggleRoomDate);
  const updateRoom = useAdminStore((s) => s.updateRoom);
  const show = useToastStore((s) => s.show);
  const [params, setParams] = useSearchParams();
  const roomId = params.get('room') ?? rooms[0]?.id ?? '';
  const room = rooms.find((r) => r.id === roomId) ?? rooms[0];

  const reserved = useMemo(() => {
    const map = new Map<string, string>();
    if (!room) return map;
    for (const r of reservations) {
      if (r.itemId !== room.id || r.status === 'cancelled' || r.status === 'completed') continue;
      for (const d of eachNight(r.startDate, r.endDate)) map.set(d, `${r.ref} · ${r.customer.name}`);
    }
    return map;
  }, [reservations, room]);

  const upcoming = useMemo(() => (room ? reservations.filter((r) => r.itemId === room.id && r.status !== 'cancelled' && r.status !== 'completed').sort((a, b) => (a.startDate < b.startDate ? -1 : 1)) : []), [reservations, room]);

  if (!room) {
    return (
      <Page title="Disponibilités" subtitle="Gérez le calendrier de vos chambres.">
        <Card>
          <p className="text-[13px] text-ink-500">Ajoutez une chambre pour gérer ses disponibilités.</p>
        </Card>
      </Page>
    );
  }

  return (
    <Page title="Disponibilités" subtitle="Gérez le calendrier et le statut de vos chambres.">
      <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <Card>
          <div className="flex flex-wrap items-end justify-between gap-3 mb-5">
            <div className="flex items-center gap-3">
              <Thumb src={room.media[0]?.url ?? ''} size={48} />
              <div>
                <p className="text-[15px] font-bold text-ink-900">{room.name}</p>
                <p className="text-[12px] text-ink-500">
                  {room.number} · {formatFCFA(room.pricePerNight)} / nuit
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Select label="Chambre" value={room.id} onChange={(e) => setParams({ room: e.target.value }, { replace: true })} className="w-[220px]">
                {rooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.number})
                  </option>
                ))}
              </Select>
              <Select
                label="Statut"
                value={room.status}
                onChange={(e) => {
                  updateRoom(room.id, { status: e.target.value as RoomStatus });
                  show('Statut de la chambre mis à jour.');
                }}
                className="w-[160px]"
              >
                <option value="available">Disponible</option>
                <option value="occupied">Occupée</option>
                <option value="unavailable">Indisponible</option>
              </Select>
            </div>
          </div>
          <AvailabilityCalendar
            getState={(iso) => (reserved.has(iso) ? 'reserved' : room.unavailableDates.includes(iso) ? 'unavailable' : 'available')}
            getLabel={(iso) => reserved.get(iso)}
            onToggle={(iso) => {
              toggleRoomDate(room.id, iso);
              show(room.unavailableDates.includes(iso) ? `${iso} de nouveau disponible.` : `${iso} marqué indisponible.`, 'info');
            }}
          />
          <p className="mt-4 flex items-center gap-2 rounded-[10px] bg-brand-50 px-3 py-2 text-[12px] text-brand-800">
            <Info size={14} /> Cliquez sur un jour pour basculer entre disponible et indisponible. Les jours réservés sont verrouillés.
          </p>
        </Card>

        <div className="space-y-4">
          <Card>
            <div className="flex items-center justify-between">
              <h2 className="text-[14px] font-bold text-ink-900">Statut actuel</h2>
              <RoomStatusBadge status={room.status} />
            </div>
            <dl className="mt-3 space-y-1.5 text-[12px]">
              <div className="flex justify-between">
                <dt className="text-ink-500">Jours bloqués</dt>
                <dd className="font-semibold">{room.unavailableDates.length}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-500">Nuits réservées à venir</dt>
                <dd className="font-semibold">{reserved.size}</dd>
              </div>
            </dl>
          </Card>
          <Card padded={false}>
            <h2 className="px-5 pt-5 text-[14px] font-bold text-ink-900">Réservations affectant la disponibilité</h2>
            {upcoming.length === 0 ? (
              <p className="px-5 py-6 text-[12px] text-ink-500">Aucune réservation à venir pour cette chambre.</p>
            ) : (
              <ul className="mt-2 divide-y divide-ink-100">
                {upcoming.map((r) => (
                  <li key={r.id} className="flex items-center gap-3 px-5 py-3">
                    <Avatar src={r.customer.avatar} name={r.customer.name} size={32} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[12px] font-semibold text-ink-900">{r.customer.name}</p>
                      <p className="text-[11px] text-ink-500">{formatDateRange(r.startDate, r.endDate)}</p>
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
