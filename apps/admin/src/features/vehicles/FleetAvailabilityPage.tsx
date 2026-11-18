import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Info } from 'lucide-react';
import { formatDateRange, formatFCFA, type VehicleStatus } from '@rezho/shared';
import { Page } from '@/components/layout/AppShell';
import { useAdminStore, useToastStore } from '@/store/useAdminStore';
import { AvailabilityCalendar, Avatar, Card, Select, StatusBadge, Thumb, VehicleStatusBadge } from '@/components/ui';

function eachDay(start: string, end?: string): string[] {
  const out: string[] = [];
  let d = start;
  const last = end ?? start;
  while (d <= last) {
    out.push(d);
    const nd = new Date(d);
    nd.setDate(nd.getDate() + 1);
    d = nd.toISOString().slice(0, 10);
  }
  return out;
}

export function FleetAvailabilityPage() {
  const fleet = useAdminStore((s) => s.fleet);
  const reservations = useAdminStore((s) => s.reservations.vehicles);
  const toggleVehicleDate = useAdminStore((s) => s.toggleVehicleDate);
  const updateVehicle = useAdminStore((s) => s.updateVehicle);
  const show = useToastStore((s) => s.show);
  const [params, setParams] = useSearchParams();
  const vehicleId = params.get('vehicle') ?? fleet[0]?.id ?? '';
  const vehicle = fleet.find((v) => v.id === vehicleId) ?? fleet[0];

  const reserved = useMemo(() => {
    const map = new Map<string, string>();
    if (!vehicle) return map;
    for (const r of reservations) {
      if (r.itemId !== vehicle.id || r.status === 'cancelled' || r.status === 'completed') continue;
      for (const d of eachDay(r.startDate, r.endDate)) map.set(d, `${r.ref} · ${r.customer.name}`);
    }
    return map;
  }, [reservations, vehicle]);

  const upcoming = useMemo(() => (vehicle ? reservations.filter((r) => r.itemId === vehicle.id && r.status !== 'cancelled' && r.status !== 'completed').sort((a, b) => (a.startDate < b.startDate ? -1 : 1)) : []), [reservations, vehicle]);

  if (!vehicle) {
    return (
      <Page title="Disponibilités" subtitle="Gérez le calendrier de location de vos véhicules.">
        <Card>
          <p className="text-[13px] text-ink-500">Ajoutez un véhicule pour gérer ses disponibilités.</p>
        </Card>
      </Page>
    );
  }

  const dayOfWeek = (iso: string) => ((new Date(iso).getDay() + 6) % 7) + 1;

  return (
    <Page title="Disponibilités" subtitle="Gérez le calendrier de location et le statut de vos véhicules.">
      <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <Card>
          <div className="flex flex-wrap items-end justify-between gap-3 mb-5">
            <div className="flex items-center gap-3">
              <Thumb src={vehicle.media[0]?.url ?? ''} size={48} className="!w-[64px]" />
              <div>
                <p className="text-[15px] font-bold text-ink-900">{vehicle.name}</p>
                <p className="text-[12px] text-ink-500">
                  {vehicle.type} · {formatFCFA(vehicle.pricePerDay)} / jour
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Select label="Véhicule" value={vehicle.id} onChange={(e) => setParams({ vehicle: e.target.value }, { replace: true })} className="w-[220px]">
                {fleet.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))}
              </Select>
              <Select
                label="Statut"
                value={vehicle.status}
                onChange={(e) => {
                  updateVehicle(vehicle.id, { status: e.target.value as VehicleStatus });
                  show('Statut du véhicule mis à jour.');
                }}
                className="w-[160px]"
              >
                <option value="available">Disponible</option>
                <option value="rented">Loué</option>
                <option value="maintenance">Maintenance</option>
                <option value="unavailable">Indisponible</option>
              </Select>
            </div>
          </div>
          <AvailabilityCalendar
            getState={(iso) => {
              if (reserved.has(iso)) return 'reserved';
              if (vehicle.status === 'maintenance') return 'maintenance';
              if (vehicle.unavailableDates.includes(iso)) return 'unavailable';
              if (!vehicle.availableDays.includes(dayOfWeek(iso))) return 'closed';
              return 'available';
            }}
            getLabel={(iso) => reserved.get(iso)}
            onToggle={(iso) => {
              if (vehicle.status === 'maintenance') {
                show('Véhicule en maintenance : changez d’abord son statut.', 'error');
                return;
              }
              toggleVehicleDate(vehicle.id, iso);
              show(vehicle.unavailableDates.includes(iso) ? `${iso} de nouveau disponible.` : `${iso} marqué indisponible.`, 'info');
            }}
            legend={{ closed: 'Jour non proposé' }}
          />
          <p className="mt-4 flex items-center gap-2 rounded-[10px] bg-brand-50 px-3 py-2 text-[12px] text-brand-800">
            <Info size={14} /> Cliquez sur un jour pour le bloquer ou le libérer. Les jours réservés sont verrouillés.
          </p>
        </Card>

        <div className="space-y-4">
          <Card>
            <div className="flex items-center justify-between">
              <h2 className="text-[14px] font-bold text-ink-900">Statut actuel</h2>
              <VehicleStatusBadge status={vehicle.status} />
            </div>
            <dl className="mt-3 space-y-1.5 text-[12px]">
              <div className="flex justify-between">
                <dt className="text-ink-500">Jours bloqués</dt>
                <dd className="font-semibold">{vehicle.unavailableDates.length}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-500">Jours réservés à venir</dt>
                <dd className="font-semibold">{reserved.size}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-500">Jours proposés</dt>
                <dd className="font-semibold">{vehicle.availableDays.length} / 7</dd>
              </div>
            </dl>
          </Card>
          <Card padded={false}>
            <h2 className="px-5 pt-5 text-[14px] font-bold text-ink-900">Locations à venir</h2>
            {upcoming.length === 0 ? (
              <p className="px-5 py-6 text-[12px] text-ink-500">Aucune location à venir pour ce véhicule.</p>
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
