import type { ReactNode } from 'react';
import { Check, type LucideIcon } from 'lucide-react';
import { BOOKING_STATUS_LABEL, ROOM_STATUS_LABEL, VEHICLE_STATUS_LABEL, type BookingStatus, type RoomStatus, type VehicleStatus } from '@rezho/shared';

export function Card({ children, className = '', padded = true, dark }: { children: ReactNode; className?: string; padded?: boolean; dark?: boolean }) {
  return <div className={`rounded-[16px] shadow-card ${dark ? 'bg-brand-900 text-white' : 'bg-white'} ${padded ? 'p-5' : ''} ${className}`}>{children}</div>;
}

type Tone = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'brand' | 'lime';

const TONES: Record<Tone, string> = {
  success: 'bg-[#DCFCE7] text-[#15803D]',
  warning: 'bg-[#FEF3C7] text-[#B45309]',
  danger: 'bg-[#FEE2E2] text-[#B91C1C]',
  info: 'bg-[#DBEAFE] text-[#1D4ED8]',
  neutral: 'bg-ink-100 text-ink-700',
  brand: 'bg-brand-100 text-brand-800',
  lime: 'bg-lime-100 text-brand-800',
};

export function Badge({ tone = 'neutral', children, dot }: { tone?: Tone; children: ReactNode; dot?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap ${TONES[tone]}`}>
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: BookingStatus }) {
  const tone: Tone = status === 'confirmed' ? 'success' : status === 'ongoing' ? 'warning' : status === 'completed' ? 'info' : status === 'pending' ? 'neutral' : 'danger';
  return (
    <Badge tone={tone} dot>
      {BOOKING_STATUS_LABEL[status]}
    </Badge>
  );
}

export function PaymentStatusBadge({ status }: { status: 'completed' | 'pending' | 'failed' }) {
  const tone: Tone = status === 'completed' ? 'success' : status === 'pending' ? 'warning' : 'danger';
  const label = status === 'completed' ? 'Terminé' : status === 'pending' ? 'En attente' : 'Échoué';
  return (
    <Badge tone={tone} dot>
      {label}
    </Badge>
  );
}

export function RoomStatusBadge({ status }: { status: RoomStatus }) {
  const tone: Tone = status === 'available' ? 'success' : status === 'occupied' ? 'warning' : 'danger';
  return (
    <Badge tone={tone} dot>
      {ROOM_STATUS_LABEL[status]}
    </Badge>
  );
}

export function VehicleStatusBadge({ status }: { status: VehicleStatus }) {
  const tone: Tone = status === 'available' ? 'success' : status === 'rented' ? 'warning' : status === 'maintenance' ? 'info' : 'danger';
  return (
    <Badge tone={tone} dot>
      {VEHICLE_STATUS_LABEL[status]}
    </Badge>
  );
}

export function AvailabilityBadge({ available }: { available: boolean }) {
  return (
    <Badge tone={available ? 'success' : 'danger'} dot>
      {available ? 'Disponible' : 'Indisponible'}
    </Badge>
  );
}

export function StatCard({ icon: Icon, value, label, trend }: { icon: LucideIcon; value: ReactNode; label: string; trend?: string }) {
  return (
    <div className="rounded-[16px] bg-white p-5 shadow-card">
      <span className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-lime-100 text-brand-800">
        <Icon size={20} />
      </span>
      <p className="mt-4 text-[28px] font-extrabold leading-none text-ink-900">{value}</p>
      <p className="mt-1.5 text-[12px] font-medium text-ink-500">{label}</p>
      {trend && <p className="mt-1 text-[11px] font-semibold text-brand-700">{trend}</p>}
    </div>
  );
}

export function FilterChips<T extends string>({ options, value, onChange }: { options: { key: T; label: string; count?: number }[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="flex flex-wrap gap-2" role="tablist">
      {options.map((o) => {
        const active = o.key === value;
        return (
          <button
            key={o.key}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(o.key)}
            className={`h-8 rounded-full px-3.5 text-[12px] font-semibold transition-colors ${active ? 'bg-brand-900 text-white' : 'bg-white text-ink-700 border border-ink-200 hover:border-ink-300'}`}
          >
            {o.label}
            {typeof o.count === 'number' && <span className={active ? ' text-white/80' : ' text-ink-500'}> ({o.count})</span>}
          </button>
        );
      })}
    </div>
  );
}

export function Tabs<T extends string>({ options, value, onChange }: { options: { key: T; label: string }[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="inline-flex rounded-full bg-white p-1 shadow-card" role="tablist">
      {options.map((o) => (
        <button key={o.key} role="tab" aria-selected={o.key === value} onClick={() => onChange(o.key)} className={`h-8 rounded-full px-4 text-[12px] font-semibold transition-colors ${o.key === value ? 'bg-brand-900 text-white' : 'text-ink-700 hover:bg-ink-50'}`}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Avatar({ src, name, size = 32 }: { src?: string; name: string; size?: number }) {
  return <img src={src} alt={name} width={size} height={size} className="rounded-full object-cover bg-ink-100 shrink-0" style={{ width: size, height: size }} loading="lazy" />;
}

export function Thumb({ src, alt = '', size = 40, className = '' }: { src: string; alt?: string; size?: number; className?: string }) {
  return <img src={src} alt={alt} width={size} height={size} className={`rounded-[8px] object-cover bg-ink-100 shrink-0 ${className}`} style={{ width: size, height: size }} loading="lazy" />;
}

export function Stepper({ steps, current }: { steps: string[]; current: number }) {
  return (
    <ol className="flex items-start w-full" aria-label="Étapes">
      {steps.map((label, i) => {
        const n = i + 1;
        const done = n < current;
        const active = n === current;
        return (
          <li key={label} className="flex-1 flex flex-col items-center relative">
            {i > 0 && <span aria-hidden="true" className={`absolute top-[13px] right-1/2 w-full h-[2px] ${n <= current ? 'bg-brand-600' : 'bg-ink-200'}`} />}
            <span
              className={`relative z-10 flex h-7 w-7 items-center justify-center rounded-full text-[12px] font-bold ${done ? 'bg-brand-600 text-white' : active ? 'bg-lime-500 text-brand-900 ring-4 ring-lime-100' : 'bg-white border-2 border-ink-200 text-ink-500'}`}
              aria-current={active ? 'step' : undefined}
            >
              {done ? <Check size={14} strokeWidth={3} /> : n}
            </span>
            <span className={`mt-2 text-[11px] font-semibold text-center px-1 ${active ? 'text-brand-800' : done ? 'text-ink-700' : 'text-ink-500'}`}>{label}</span>
          </li>
        );
      })}
    </ol>
  );
}

export function EmptyState({ icon, title, text, action }: { icon: ReactNode; title: string; text?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center text-center py-14 px-6">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 text-brand-700 mb-4">{icon}</span>
      <p className="text-[15px] font-bold text-ink-900">{title}</p>
      {text && <p className="text-[13px] text-ink-500 mt-1 max-w-[320px]">{text}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function KeyValue({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 text-[12px] py-1.5">
      <span className="text-ink-500">{label}</span>
      <span className="font-semibold text-ink-900 text-right">{value}</span>
    </div>
  );
}

export function SectionTitle({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h2 className="text-[15px] font-bold text-ink-900">{title}</h2>
      {action}
    </div>
  );
}
