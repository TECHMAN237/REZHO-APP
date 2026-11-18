import { useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { CalendarDays, MapPin, Phone, Users } from 'lucide-react';
import { PAYMENT_METHOD_LABEL, formatDate, formatDateRange, formatFCFA, todayISO } from '@rezho/shared';
import { Button, ConfirmDialog, PaymentBadge, PriceRow, StatusBadge } from '@/components/ui';
import { Screen } from '@/components/layout/Screen';
import { useAppStore, useToastStore } from '@/store/useAppStore';

export function BookingDetailScreen() {
  const { id } = useParams();
  const booking = useAppStore((s) => s.bookings.find((b) => b.id === id));
  const cancelBooking = useAppStore((s) => s.cancelBooking);
  const show = useToastStore((s) => s.show);
  const [confirm, setConfirm] = useState(false);

  if (!booking) return <Navigate to="/bookings" replace />;

  const cancellable = (booking.status === 'confirmed' || booking.status === 'pending') && booking.startDate >= todayISO();
  const detailLink = booking.kind === 'accommodation' ? `/accommodations/${booking.itemId}` : booking.kind === 'restaurant' ? `/restaurants/${booking.itemId}` : `/vehicles/${booking.itemId}`;

  return (
    <div className="relative flex flex-col flex-1 min-h-0">
      <Screen
        topBar={{ back: '/bookings', title: `Réservation ${booking.ref}` }}
        footer={
          cancellable ? (
            <Button full size="lg" variant="danger" onClick={() => setConfirm(true)}>
              Annuler la réservation
            </Button>
          ) : (
            <Link to={detailLink} className="block">
              <Button full size="lg" variant="outline">
                Réserver à nouveau
              </Button>
            </Link>
          )
        }
      >
        <div className="rounded-[16px] overflow-hidden bg-white shadow-card">
          <img src={booking.itemImage} alt="" className="h-[150px] w-full object-cover" />
          <div className="p-3.5">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[16px] font-bold text-ink-900 truncate">{booking.itemName}</p>
                <p className="flex items-center gap-1 text-[12px] text-ink-500">
                  <MapPin size={12} /> {booking.city}
                </p>
              </div>
              <StatusBadge status={booking.status} />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-[12px]">
              <div className="rounded-[10px] bg-ink-50 p-2.5">
                <p className="flex items-center gap-1 text-ink-500">
                  <CalendarDays size={12} /> {booking.kind === 'restaurant' ? 'Date' : 'Dates'}
                </p>
                <p className="mt-0.5 font-semibold text-ink-900">
                  {formatDateRange(booking.startDate, booking.endDate)}
                  {booking.time ? ` · ${booking.time}` : ''}
                </p>
              </div>
              <div className="rounded-[10px] bg-ink-50 p-2.5">
                <p className="flex items-center gap-1 text-ink-500">
                  <Users size={12} /> {booking.kind === 'vehicle' ? 'Conducteur' : 'Voyageurs'}
                </p>
                <p className="mt-0.5 font-semibold text-ink-900">
                  {booking.kind === 'vehicle' ? booking.details.Conducteur ?? '1 conducteur' : `${booking.guests} personne${booking.guests > 1 ? 's' : ''}`}
                </p>
              </div>
            </div>
          </div>
        </div>

        <h2 className="mt-5 mb-2 text-[13px] font-semibold text-ink-700">Détails</h2>
        <dl className="rounded-[14px] bg-white p-3.5 shadow-card space-y-2 text-[12px]">
          {Object.entries(booking.details).map(([k, v]) => (
            <div key={k} className="flex justify-between gap-3">
              <dt className="text-ink-500 shrink-0">{k}</dt>
              <dd className="font-semibold text-ink-900 text-right">{v}</dd>
            </div>
          ))}
          <div className="flex justify-between gap-3">
            <dt className="text-ink-500">Réservé le</dt>
            <dd className="font-semibold text-ink-900">{formatDate(booking.createdAt.slice(0, 10))}</dd>
          </div>
        </dl>

        <h2 className="mt-5 mb-2 text-[13px] font-semibold text-ink-700">Paiement</h2>
        <div className="rounded-[14px] bg-white p-3.5 shadow-card">
          <div className="flex items-center justify-between text-[12px]">
            <span className="text-ink-500">{PAYMENT_METHOD_LABEL[booking.paymentMethod]}</span>
            <PaymentBadge status={booking.paymentStatus} />
          </div>
          <div className="mt-3 space-y-1.5 border-t border-ink-100 pt-3">
            {booking.lines.map((l) => (
              <PriceRow key={l.label} label={l.label} amount={l.amount === 0 ? 'Gratuit' : formatFCFA(l.amount)} />
            ))}
            <PriceRow label="Total" amount={booking.total === 0 ? 'Gratuit' : formatFCFA(booking.total)} strong />
          </div>
        </div>

        <a href="tel:+237678451230" className="mt-4 flex items-center justify-center gap-2 rounded-[14px] bg-white h-11 shadow-card text-[13px] font-semibold text-brand-700">
          <Phone size={16} /> Contacter l’établissement
        </a>
      </Screen>

      <ConfirmDialog
        open={confirm}
        danger
        title="Annuler cette réservation ?"
        text={booking.paymentStatus === 'paid' ? 'Le montant payé sera remboursé sous 48 h (simulation).' : 'Cette action est irréversible.'}
        confirmLabel="Oui, annuler"
        cancelLabel="Garder"
        onCancel={() => setConfirm(false)}
        onConfirm={() => {
          cancelBooking(booking.id);
          setConfirm(false);
          show('Réservation annulée.', 'info');
        }}
      />
    </div>
  );
}
