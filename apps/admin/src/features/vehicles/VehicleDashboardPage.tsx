import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Car, CalendarCheck, Gauge, Plus, Wallet } from 'lucide-react';
import { VEHICLE_STATUS_LABEL, formatDateRange, formatFCFA } from '@rezho/shared';
import { Page } from '@/components/layout/AppShell';
import { DATE_RANGES, DateRangeSelect, type RangeKey } from '@/components/layout/Topbar';
import { useAdminStore } from '@/store/useAdminStore';
import { Button, Card, StatCard, StatusBadge, Thumb, VehicleStatusBadge } from '@/components/ui';

export function VehicleDashboardPage() {
  const profile = useAdminStore((s) => s.profiles.vehicles);
  const fleet = useAdminStore((s) => s.fleet);
  const reservations = useAdminStore((s) => s.reservations.vehicles);
  const payments = useAdminStore((s) => s.payments.vehicles);
  const [range, setRange] = useState<RangeKey>('month');
  const current = DATE_RANGES.find((r) => r.key === range)!;

  const inRange = reservations.filter((r) => r.startDate >= current.start && r.startDate <= current.end);
  const active = fleet.filter((v) => v.status !== 'unavailable').length;
  const completedPayments = payments.filter((p) => p.status === 'completed' && p.date >= current.start && p.date <= current.end).length;
  const availabilityRate = fleet.length ? Math.round((fleet.filter((v) => v.status === 'available').length / fleet.length) * 100) : 0;
  const recent = [...reservations].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)).slice(0, 5);
  const statusCounts = (['available', 'rented', 'maintenance', 'unavailable'] as const).map((s) => ({ s, n: fleet.filter((v) => v.status === s).length }));

  return (
    <Page title={`Bonjour, ${profile.name} 👋`} subtitle="Voici un aperçu de votre activité de location." actions={<DateRangeSelect value={range} onChange={setRange} />}>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Car} value={active} label="Véhicules actifs" trend={`${fleet.length} véhicules dans la flotte`} />
        <StatCard icon={CalendarCheck} value={inRange.length} label="Réservations" trend={`${inRange.filter((r) => r.status === 'pending').length} en attente`} />
        <StatCard icon={Wallet} value={completedPayments} label="Paiements terminés" trend={formatFCFA(payments.filter((p) => p.status === 'completed').reduce((s, p) => s + p.amount, 0))} />
        <StatCard icon={Gauge} value={`${availabilityRate}%`} label="Taux de disponibilité" trend="Véhicules disponibles aujourd’hui" />
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[1fr_340px]">
        <Card padded={false}>
          <div className="flex items-center justify-between px-5 pt-5 pb-3">
            <h2 className="text-[15px] font-bold text-ink-900">Réservations récentes</h2>
            <Link to="/partner/vehicles/reservations" className="inline-flex items-center gap-1 text-[12px] font-semibold text-brand-700 hover:underline">
              Voir toutes <ArrowRight size={14} />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-[13px]">
              <tbody>
                {recent.map((r) => (
                  <tr key={r.id} className="border-t border-ink-100">
                    <td className="px-5 py-3">
                      <span className="flex items-center gap-3">
                        <Thumb src={r.itemImage} size={38} />
                        <span className="font-bold text-ink-900">{r.ref}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-ink-900">{r.itemName}</td>
                    <td className="px-4 py-3 text-ink-700 whitespace-nowrap">{formatDateRange(r.startDate, r.endDate)}</td>
                    <td className="px-4 py-3 text-right font-semibold whitespace-nowrap hidden lg:table-cell">{formatFCFA(r.amount)}</td>
                    <td className="px-5 py-3 text-right">
                      <StatusBadge status={r.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="space-y-4">
          <Card>
            <h2 className="text-[15px] font-bold text-ink-900">État de la flotte</h2>
            <ul className="mt-3 space-y-3">
              {statusCounts.map(({ s, n }) => (
                <li key={s}>
                  <div className="flex items-center justify-between text-[12px]">
                    <VehicleStatusBadge status={s} />
                    <span className="font-bold text-ink-900">
                      {n} <span className="font-medium text-ink-500">/ {fleet.length}</span>
                    </span>
                  </div>
                  <div className="mt-1.5 h-1.5 rounded-full bg-ink-100 overflow-hidden">
                    <div className={`h-full rounded-full ${s === 'available' ? 'bg-brand-500' : s === 'rented' ? 'bg-[#F59E0B]' : s === 'maintenance' ? 'bg-[#2563EB]' : 'bg-danger'}`} style={{ width: `${fleet.length ? (n / fleet.length) * 100 : 0}%` }} />
                  </div>
                </li>
              ))}
            </ul>
            <p className="sr-only">{statusCounts.map(({ s, n }) => `${VEHICLE_STATUS_LABEL[s]}: ${n}`).join(', ')}</p>
          </Card>
          <Card dark>
            <p className="text-[15px] font-bold">Ajouter un véhicule</p>
            <p className="mt-1 text-[12px] text-white/75">Enregistrez un nouveau véhicule en 4 étapes et proposez-le à la location.</p>
            <Link to="/partner/vehicles/fleet/new" className="mt-4 inline-block">
              <Button leftIcon={<Plus size={16} />}>Nouveau véhicule</Button>
            </Link>
          </Card>
        </div>
      </div>
    </Page>
  );
}
