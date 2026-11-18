import { useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { CalendarDays, Check, Copy, MapPin } from 'lucide-react';
import { formatDateRange } from '@rezho/shared';
import { Button } from '@/components/ui';
import { useAppStore, useToastStore } from '@/store/useAppStore';

const CONFETTI = [
  { x: 18, y: 10, c: '#9BE017', r: 20 },
  { x: 70, y: 6, c: '#F5B301', r: -15 },
  { x: 84, y: 30, c: '#1F8A4C', r: 40 },
  { x: 10, y: 40, c: '#F5B301', r: -30 },
  { x: 60, y: 48, c: '#9BE017', r: 10 },
  { x: 30, y: 55, c: '#DC2626', r: 60 },
  { x: 88, y: 60, c: '#2563EB', r: -50 },
  { x: 45, y: 4, c: '#2563EB', r: 25 },
];

export function BookingSuccessScreen() {
  const { id } = useParams();
  const booking = useAppStore((s) => s.bookings.find((b) => b.id === id));
  const show = useToastStore((s) => s.show);
  const [copied, setCopied] = useState(false);

  if (!booking) return <Navigate to="/bookings" replace />;

  const kindLabel = booking.kind === 'accommodation' ? 'Réservation confirmée !' : booking.kind === 'restaurant' ? 'Table réservée !' : 'Location confirmée !';
  const place = booking.kind === 'accommodation' ? `à l’${booking.itemName}` : booking.kind === 'restaurant' ? `chez ${booking.itemName}` : `de la ${booking.itemName}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(booking.ref);
      setCopied(true);
      show('Référence copiée.', 'info');
      setTimeout(() => setCopied(false), 1500);
    } catch {
      show('Impossible de copier.', 'error');
    }
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-brand-50 screen-in">
      <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar px-6 pt-16 sm:pt-24 pb-8 flex flex-col items-center text-center">
        <div className="relative h-28 w-28">
          {CONFETTI.map((p, i) => (
            <span
              key={i}
              aria-hidden="true"
              className="absolute h-2 w-3 rounded-sm"
              style={{ left: `${p.x}%`, top: `${p.y}%`, background: p.c, transform: `rotate(${p.r}deg)` }}
            />
          ))}
          <span className="absolute inset-4 flex items-center justify-center rounded-full bg-brand-600 text-white shadow-float pop-in">
            <Check size={44} strokeWidth={3} />
          </span>
        </div>
        <h1 className="mt-5 text-[22px] font-extrabold text-ink-900">{kindLabel}</h1>
        <p className="mt-1.5 text-[13px] text-ink-500 max-w-[260px]">
          Votre réservation {place} est confirmée.
        </p>

        <div className="mt-6 w-full rounded-[16px] bg-white p-3.5 shadow-card text-left">
          <div className="flex gap-3">
            <img src={booking.itemImage} alt="" className="h-14 w-14 rounded-[10px] object-cover" />
            <div className="min-w-0">
              <p className="text-[14px] font-bold text-ink-900 truncate">{booking.itemName}</p>
              <p className="flex items-center gap-1 text-[11px] text-ink-500">
                <MapPin size={12} /> {booking.city}
              </p>
            </div>
          </div>
          <div className="mt-3 space-y-2 border-t border-ink-100 pt-3 text-[12px]">
            <p className="flex items-center gap-2 text-ink-900">
              <CalendarDays size={14} className="text-brand-700" /> {formatDateRange(booking.startDate, booking.endDate)}
              {booking.time ? ` · ${booking.time}` : ''}
            </p>
            <button type="button" onClick={copy} className="flex items-center gap-2 text-ink-900">
              <span className="text-ink-500">Réservation n°</span>
              <span className="font-bold">{booking.ref}</span>
              {copied ? <Check size={13} className="text-brand-600" /> : <Copy size={13} className="text-ink-500" />}
            </button>
          </div>
        </div>

        <div className="mt-6 w-full space-y-2.5">
          <Link to={`/bookings/${booking.id}`} className="block">
            <Button full size="lg">
              Voir ma réservation
            </Button>
          </Link>
          <Link to="/home" className="block">
            <Button full size="lg" variant="outline">
              Retour à l’accueil
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
