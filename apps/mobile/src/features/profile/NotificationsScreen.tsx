import { Link } from 'react-router-dom';
import { BellOff, CalendarCheck, Percent, Wallet, type LucideIcon } from 'lucide-react';
import { formatDateRange, formatFCFA } from '@rezho/shared';
import { EmptyState } from '@/components/ui';
import { Screen } from '@/components/layout/Screen';
import { useAppStore } from '@/store/useAppStore';

interface Item {
  id: string;
  icon: LucideIcon;
  tone: string;
  title: string;
  text: string;
  time: string;
  to?: string;
}

export function NotificationsScreen() {
  const bookings = useAppStore((s) => s.bookings);
  const prefs = useAppStore((s) => s.notifications);

  const items: Item[] = [];
  for (const b of bookings.slice(0, 3)) {
    if (b.status === 'cancelled') continue;
    items.push({
      id: `b_${b.id}`,
      icon: CalendarCheck,
      tone: 'bg-brand-100 text-brand-700',
      title: b.kind === 'restaurant' ? 'Table confirmée' : 'Réservation confirmée',
      text: `${b.itemName} · ${formatDateRange(b.startDate, b.endDate)}${b.time ? ` à ${b.time}` : ''}`,
      time: "Aujourd'hui",
      to: `/bookings/${b.id}`,
    });
    if (b.paymentStatus === 'paid' && b.total > 0) {
      items.push({
        id: `p_${b.id}`,
        icon: Wallet,
        tone: 'bg-[#FEF3C7] text-[#B45309]',
        title: 'Paiement reçu',
        text: `${formatFCFA(b.total)} pour la réservation ${b.ref}.`,
        time: "Aujourd'hui",
        to: `/bookings/${b.id}`,
      });
    }
  }
  if (prefs.promos) {
    items.push({
      id: 'promo',
      icon: Percent,
      tone: 'bg-[#DBEAFE] text-[#1D4ED8]',
      title: 'Jusqu’à -20% sur certains hébergements',
      text: 'Profitez des offres de la semaine à Yaoundé, Limbe et Kribi.',
      time: 'Hier',
      to: '/accommodations?promo=1',
    });
  }

  return (
    <Screen topBar={{ back: true, title: 'Notifications' }}>
      {items.length === 0 ? (
        <EmptyState icon={<BellOff size={28} />} title="Aucune notification" text="Vous serez averti des confirmations et offres ici." />
      ) : (
        <ul className="space-y-2.5">
          {items.map(({ id, icon: Icon, tone, title, text, time, to }) => {
            const content = (
              <>
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${tone}`}>
                  <Icon size={18} />
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-[13px] font-bold text-ink-900">{title}</span>
                  <span className="block text-[12px] text-ink-500 clamp-2">{text}</span>
                  <span className="block mt-1 text-[10px] text-ink-300">{time}</span>
                </span>
              </>
            );
            return (
              <li key={id}>
                {to ? (
                  <Link to={to} className="flex gap-3 rounded-[14px] bg-white p-3 shadow-card">
                    {content}
                  </Link>
                ) : (
                  <div className="flex gap-3 rounded-[14px] bg-white p-3 shadow-card">{content}</div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </Screen>
  );
}
