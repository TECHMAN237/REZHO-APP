import { useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Calendar, Check, Fuel, Gauge, MapPin, Palette, Settings2, ShieldCheck, Users } from 'lucide-react';
import { VEHICLES, formatFCFA } from '@rezho/shared';
import { Badge, Button, FavoriteButton, Rating } from '@/components/ui';
import { AssistantFab } from '@/components/layout/AssistantFab';
import { useAppStore } from '@/store/useAppStore';

export function VehicleDetailScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const item = VEHICLES.find((v) => v.id === id);
  const favorites = useAppStore((s) => s.favorites);
  const toggleFavorite = useAppStore((s) => s.toggleFavorite);
  const [slide, setSlide] = useState(0);

  if (!item) return <Navigate to="/vehicles" replace />;

  const specs = [
    { icon: Settings2, label: 'Transmission', value: item.transmission },
    { icon: Fuel, label: 'Carburant', value: item.fuel },
    { icon: Users, label: 'Places', value: `${item.seats}` },
    { icon: Palette, label: 'Couleur', value: item.color },
    { icon: Gauge, label: 'Kilométrage', value: `${formatFCFA(item.mileage, false)} km` },
    { icon: Calendar, label: 'Année', value: `${item.year}` },
  ];

  return (
    <div className="relative flex flex-col flex-1 min-h-0 bg-brand-50 screen-in">
      <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar pb-4">
        <div className="relative h-[280px] shrink-0">
          <div className="flex h-full w-full overflow-x-auto snap-x snap-mandatory no-scrollbar" onScroll={(e) => setSlide(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}>
            {item.images.map((src, i) => (
              <img key={src} src={src} alt={`${item.name} photo ${i + 1}`} className="h-full w-full shrink-0 snap-center object-cover" loading={i === 0 ? 'eager' : 'lazy'} />
            ))}
          </div>
          <div className="absolute top-3 sm:top-12 left-4 right-4 flex items-center justify-between">
            <button type="button" aria-label="Retour" onClick={() => navigate(-1)} className="h-10 w-10 rounded-full bg-white/95 shadow-sm flex items-center justify-center text-ink-900">
              <ArrowLeft size={20} />
            </button>
            <FavoriteButton active={favorites.includes(item.id)} onToggle={() => toggleFavorite(item.id)} className="!h-10 !w-10" />
          </div>
          <span className="absolute bottom-3 right-4 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-semibold text-white">
            {slide + 1}/{item.images.length}
          </span>
        </div>

        <div className="-mt-5 relative rounded-t-[24px] bg-brand-50 px-4 pt-5">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h1 className="text-[20px] font-extrabold text-ink-900">{item.name}</h1>
              <p className="text-[12px] text-ink-500">
                {item.type} · {item.agency}
              </p>
            </div>
            <Badge tone={item.available ? 'success' : 'danger'}>{item.available ? 'Disponible' : 'Indisponible'}</Badge>
          </div>
          <div className="mt-1.5 flex items-center gap-3 text-[12px] text-ink-500">
            <Rating value={item.rating} count={item.reviews} size={14} />
            <span className="flex items-center gap-1">
              <MapPin size={13} /> {item.city}
            </span>
          </div>

          <p className="mt-4 text-[13px] leading-relaxed text-ink-700">{item.description}</p>

          <h2 className="mt-5 mb-2 text-[14px] font-bold text-ink-900">Caractéristiques</h2>
          <div className="grid grid-cols-3 gap-2">
            {specs.map(({ icon: Icon, label, value }) => (
              <div key={label} className="rounded-[12px] bg-white p-3 shadow-card">
                <Icon size={18} className="text-brand-700" />
                <p className="mt-1.5 text-[10px] text-ink-500">{label}</p>
                <p className="text-[12px] font-bold text-ink-900 truncate">{value}</p>
              </div>
            ))}
          </div>

          <h2 className="mt-5 mb-2 text-[14px] font-bold text-ink-900">Équipements</h2>
          <ul className="rounded-[14px] bg-white p-3 shadow-card grid grid-cols-2 gap-y-2">
            {item.equipment.map((e) => (
              <li key={e} className="flex items-center gap-2 text-[12px] text-ink-900">
                <Check size={14} className="text-brand-600 shrink-0" /> {e}
              </li>
            ))}
          </ul>

          <h2 className="mt-5 mb-2 text-[14px] font-bold text-ink-900">Conditions de location</h2>
          <div className="rounded-[14px] bg-white p-3.5 shadow-card space-y-2 text-[12px] text-ink-700">
            <p className="flex items-center gap-2">
              <ShieldCheck size={15} className="text-brand-700" /> Caution : <span className="font-bold text-ink-900">{formatFCFA(item.deposit)}</span> (restituée au retour)
            </p>
            <p className="flex items-center gap-2">
              <Check size={15} className="text-brand-700" /> Permis de conduire valide depuis 2 ans minimum
            </p>
            <p className="flex items-center gap-2">
              <Check size={15} className="text-brand-700" /> Kilométrage illimité au Cameroun, carburant à la charge du client
            </p>
            {item.longTermDiscount && (
              <p className="flex items-center gap-2">
                <Check size={15} className="text-brand-700" /> -{item.longTermDiscount}% à partir de 7 jours de location
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="shrink-0 border-t border-ink-100 bg-white px-4 pt-3 pb-4 flex items-center gap-4">
        <div>
          <p className="text-[18px] font-extrabold text-ink-900 leading-none">{formatFCFA(item.pricePerDay)}</p>
          <p className="text-[11px] text-ink-500 mt-0.5">/ jour</p>
        </div>
        <Button size="lg" className="flex-1" disabled={!item.available} onClick={() => navigate(`/booking/vehicle/${item.id}`)}>
          {item.available ? 'Réserver' : 'Indisponible'}
        </Button>
      </div>
      <AssistantFab withNav={false} />
    </div>
  );
}
