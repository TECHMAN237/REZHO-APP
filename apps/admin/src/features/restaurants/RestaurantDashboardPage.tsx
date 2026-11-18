import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CalendarCheck, Plus, ShoppingBag, Star, Wallet } from 'lucide-react';
import { formatFCFA, relativeLabel } from '@rezho/shared';
import { Page } from '@/components/layout/AppShell';
import { DATE_RANGES, DateRangeSelect, type RangeKey } from '@/components/layout/Topbar';
import { useAdminStore } from '@/store/useAdminStore';
import { Button, Card, StatCard, StatusBadge, Thumb } from '@/components/ui';

export function RestaurantDashboardPage() {
  const profile = useAdminStore((s) => s.profiles.restaurants);
  const dishes = useAdminStore((s) => s.dishes);
  const reservations = useAdminStore((s) => s.reservations.restaurants);
  const payments = useAdminStore((s) => s.payments.restaurants);
  const [range, setRange] = useState<RangeKey>('month');
  const current = DATE_RANGES.find((r) => r.key === range)!;

  const inRange = reservations.filter((r) => r.startDate >= current.start && r.startDate <= current.end);
  const covers = inRange.reduce((s, r) => s + (r.guests ?? 0), 0);
  const completedPayments = payments.filter((p) => p.status === 'completed' && p.date >= current.start && p.date <= current.end).length;
  const recent = [...reservations].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)).slice(0, 5);
  const popular = [...dishes].filter((d) => d.available).slice(0, 4);

  return (
    <Page title={`Bonjour, ${profile.name} 👋`} subtitle="Voici un aperçu de votre restaurant." actions={<DateRangeSelect value={range} onChange={setRange} />}>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={CalendarCheck} value={inRange.length} label="Réservations" trend={`${inRange.filter((r) => r.status === 'pending').length} en attente de confirmation`} />
        <StatCard icon={ShoppingBag} value={covers} label="Couverts" trend="Sur la période sélectionnée" />
        <StatCard icon={Wallet} value={completedPayments} label="Paiements terminés" trend={formatFCFA(payments.filter((p) => p.status === 'completed').reduce((s, p) => s + p.amount, 0))} />
        <StatCard icon={Star} value="4.8" label="Note moyenne" trend="256 avis clients" />
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[1fr_340px]">
        <Card padded={false}>
          <div className="flex items-center justify-between px-5 pt-5 pb-3">
            <h2 className="text-[15px] font-bold text-ink-900">Réservations récentes</h2>
            <Link to="/partner/restaurants/reservations" className="inline-flex items-center gap-1 text-[12px] font-semibold text-brand-700 hover:underline">
              Voir toutes <ArrowRight size={14} />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-[13px]">
              <tbody>
                {recent.map((r) => (
                  <tr key={r.id} className="border-t border-ink-100">
                    <td className="px-5 py-3">
                      <span className="flex items-center gap-3">
                        <Thumb src={r.itemImage} size={38} />
                        <span className="font-bold text-ink-900">{r.ref}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 text-ink-900 whitespace-nowrap">{r.guests} pers.</td>
                    <td className="px-4 py-3 text-ink-700 whitespace-nowrap">
                      {relativeLabel(r.startDate)}, {r.time}
                    </td>
                    <td className="px-4 py-3 text-ink-700 hidden lg:table-cell">{r.customer.name}</td>
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
          <Card padded={false}>
            <div className="flex items-center justify-between px-5 pt-5 pb-2">
              <h2 className="text-[14px] font-bold text-ink-900">Plats du menu</h2>
              <Link to="/partner/restaurants/menu" className="text-[12px] font-semibold text-brand-700 hover:underline">
                Gérer
              </Link>
            </div>
            <ul className="divide-y divide-ink-100">
              {popular.map((d) => (
                <li key={d.id} className="flex items-center gap-3 px-5 py-2.5">
                  <Thumb src={d.image} size={36} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[12px] font-semibold text-ink-900">{d.name}</p>
                    <p className="text-[11px] text-ink-500">{d.category}</p>
                  </div>
                  <span className="text-[12px] font-bold text-ink-900">{formatFCFA(d.price)}</span>
                </li>
              ))}
            </ul>
          </Card>
          <Card dark>
            <p className="text-[15px] font-bold">Ajouter un plat</p>
            <p className="mt-1 text-[12px] text-white/75">Enrichissez votre menu en 3 étapes : informations, médias, prix.</p>
            <Link to="/partner/restaurants/menu/new" className="mt-4 inline-block">
              <Button leftIcon={<Plus size={16} />}>Nouveau plat</Button>
            </Link>
          </Card>
        </div>
      </div>
    </Page>
  );
}
