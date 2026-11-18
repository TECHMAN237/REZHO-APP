import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, Heart, Star } from 'lucide-react';
import type { BookingStatus, PaymentStatus } from '@rezho/shared';
import { BOOKING_STATUS_LABEL, PAYMENT_STATUS_LABEL } from '@rezho/shared';

export function Card({ children, className = '', onClick }: { children: ReactNode; className?: string; onClick?: () => void }) {
  const base = `rounded-[16px] bg-white shadow-card ${className}`;
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={`${base} text-left w-full`}>
        {children}
      </button>
    );
  }
  return <div className={base}>{children}</div>;
}

export function Chip({
  active,
  children,
  onClick,
  size = 'md',
}: {
  active?: boolean;
  children: ReactNode;
  onClick?: () => void;
  size?: 'sm' | 'md';
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`shrink-0 rounded-full border font-semibold transition-colors ${size === 'sm' ? 'h-7 px-3 text-[11px]' : 'h-8 px-3.5 text-[12px]'} ${
        active ? 'bg-brand-700 border-brand-700 text-white' : 'bg-white border-ink-200 text-ink-700 hover:border-ink-300'
      }`}
    >
      {children}
    </button>
  );
}

export function Badge({ tone = 'neutral', children }: { tone?: 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'brand'; children: ReactNode }) {
  const tones = {
    success: 'bg-[#DCFCE7] text-[#15803D]',
    warning: 'bg-[#FEF3C7] text-[#B45309]',
    danger: 'bg-[#FEE2E2] text-[#B91C1C]',
    info: 'bg-[#DBEAFE] text-[#1D4ED8]',
    neutral: 'bg-ink-100 text-ink-700',
    brand: 'bg-brand-100 text-brand-800',
  };
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${tones[tone]}`}>{children}</span>;
}

export function StatusBadge({ status }: { status: BookingStatus }) {
  const tone = status === 'confirmed' ? 'success' : status === 'ongoing' ? 'warning' : status === 'completed' ? 'info' : status === 'pending' ? 'neutral' : 'danger';
  return <Badge tone={tone}>{BOOKING_STATUS_LABEL[status]}</Badge>;
}

export function PaymentBadge({ status }: { status: PaymentStatus }) {
  const tone = status === 'paid' ? 'success' : status === 'pending' ? 'warning' : status === 'refunded' ? 'info' : 'danger';
  return <Badge tone={tone}>{PAYMENT_STATUS_LABEL[status]}</Badge>;
}

export function Rating({ value, count, size = 12 }: { value: number; count?: number; size?: number }) {
  return (
    <span className="inline-flex items-center gap-1 text-[12px] text-ink-700">
      <Star size={size} className="fill-star text-star" aria-hidden="true" />
      <span className="font-semibold text-ink-900">{value.toFixed(1)}</span>
      {typeof count === 'number' && <span className="text-ink-500">({count} avis)</span>}
    </span>
  );
}

export function Avatar({ src, name, size = 40 }: { src?: string; name: string; size?: number }) {
  return (
    <img
      src={src}
      alt={name}
      width={size}
      height={size}
      className="rounded-full object-cover bg-ink-100 shrink-0"
      style={{ width: size, height: size }}
      loading="lazy"
    />
  );
}

export function FavoriteButton({ active, onToggle, className = '' }: { active: boolean; onToggle: () => void; className?: string }) {
  return (
    <button
      type="button"
      aria-label={active ? 'Retirer des favoris' : 'Ajouter aux favoris'}
      aria-pressed={active}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onToggle();
      }}
      className={`flex h-8 w-8 items-center justify-center rounded-full bg-white/95 shadow-sm transition-transform active:scale-90 ${className}`}
    >
      <Heart size={16} className={active ? 'fill-danger text-danger' : 'text-ink-700'} />
    </button>
  );
}

export function SectionHeader({ title, to, action = 'Voir tout' }: { title: string; to?: string; action?: string }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h2 className="text-[15px] font-bold text-ink-900">{title}</h2>
      {to && (
        <Link to={to} className="inline-flex items-center gap-1 text-[12px] font-semibold text-brand-700">
          {action} <ArrowRight size={14} />
        </Link>
      )}
    </div>
  );
}

export function Stepper({ steps, current }: { steps: string[]; current: number }) {
  return (
    <ol className="flex items-start justify-between w-full px-2" aria-label="Étapes">
      {steps.map((label, i) => {
        const n = i + 1;
        const done = n < current;
        const active = n === current;
        return (
          <li key={label} className="flex-1 flex flex-col items-center relative">
            {i > 0 && (
              <span
                aria-hidden="true"
                className={`absolute top-[11px] right-1/2 w-full h-[2px] ${n <= current ? 'bg-brand-600' : 'bg-ink-200'}`}
                style={{ transform: 'translateX(-50%)' }}
              />
            )}
            <span
              className={`relative z-10 flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold ${
                done || active ? 'bg-brand-600 text-white' : 'bg-white border-2 border-ink-200 text-ink-500'
              }`}
              aria-current={active ? 'step' : undefined}
            >
              {done ? <Check size={12} strokeWidth={3} /> : n}
            </span>
            <span className={`mt-1.5 text-[11px] font-medium ${active ? 'text-brand-700' : 'text-ink-500'}`}>{label}</span>
          </li>
        );
      })}
    </ol>
  );
}

export function EmptyState({ icon, title, text, action }: { icon: ReactNode; title: string; text?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center text-center py-14 px-6">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 text-brand-700 mb-4">{icon}</span>
      <p className="text-[15px] font-bold text-ink-900">{title}</p>
      {text && <p className="text-[13px] text-ink-500 mt-1 max-w-[260px]">{text}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Divider({ className = '' }: { className?: string }) {
  return <hr className={`border-0 border-t border-ink-100 ${className}`} />;
}

export function PriceRow({ label, amount, strong }: { label: string; amount: string; strong?: boolean }) {
  return (
    <div className={`flex items-center justify-between ${strong ? 'text-[14px] font-bold text-ink-900' : 'text-[12px] text-ink-700'}`}>
      <span>{label}</span>
      <span className={strong ? 'text-brand-700' : 'font-semibold text-ink-900'}>{amount}</span>
    </div>
  );
}

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-[12px] bg-ink-100 ${className}`} aria-hidden="true" />;
}
