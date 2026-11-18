import { useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Bath,
  BedDouble,
  Briefcase,
  Car,
  ChefHat,
  Coffee,
  Dumbbell,
  Lock,
  MapPin,
  Mountain,
  Shield,
  Snowflake,
  Tv,
  UtensilsCrossed,
  Waves,
  WashingMachine,
  Wifi,
  Wine,
  Star,
  Check,
} from 'lucide-react';
import { ACCOMMODATIONS, AMENITY_LABEL, formatFCFA, type AmenityKey } from '@rezho/shared';
import { Button, FavoriteButton, Rating } from '@/components/ui';
import { AssistantFab } from '@/components/layout/AssistantFab';
import { useAppStore } from '@/store/useAppStore';

export const AMENITY_ICON: Record<AmenityKey, typeof Wifi> = {
  wifi: Wifi,
  pool: Waves,
  ac: Snowflake,
  parking: Car,
  gym: Dumbbell,
  restaurant: UtensilsCrossed,
  tv: Tv,
  bathroom: Bath,
  minibar: Wine,
  kitchen: ChefHat,
  balcony: Mountain,
  security: Shield,
  safe: Lock,
  desk: Briefcase,
  breakfast: Coffee,
  laundry: WashingMachine,
};

const REVIEWS = [
  { name: 'Martin T.', rating: 5, text: 'Personnel très accueillant, chambre impeccable et petit-déjeuner copieux.', date: 'Il y a 2 semaines' },
  { name: 'Aline M.', rating: 5, text: 'Excellent rapport qualité-prix, je recommande vivement pour un séjour à Yaoundé.', date: 'Il y a 1 mois' },
  { name: 'Daniel N.', rating: 4, text: 'Très bon hôtel, seul bémol le Wi-Fi un peu lent le soir.', date: 'Il y a 2 mois' },
];

type Tab = 'details' | 'amenities' | 'reviews';

export function AccommodationDetailScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const item = ACCOMMODATIONS.find((a) => a.id === id);
  const favorites = useAppStore((s) => s.favorites);
  const toggleFavorite = useAppStore((s) => s.toggleFavorite);
  const [tab, setTab] = useState<Tab>('details');
  const [slide, setSlide] = useState(0);

  if (!item) return <Navigate to="/accommodations" replace />;

  const onScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    setSlide(Math.round(el.scrollLeft / el.clientWidth));
  };

  return (
    <div className="relative flex flex-col flex-1 min-h-0 bg-brand-50 screen-in">
      <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar pb-4">
        <div className="relative h-[300px] shrink-0">
          <div className="flex h-full w-full overflow-x-auto snap-x snap-mandatory no-scrollbar" onScroll={onScroll} aria-label="Galerie photos">
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
          <h1 className="text-[20px] font-extrabold text-ink-900">{item.name}</h1>
          <div className="mt-1.5 flex items-center gap-3 text-[12px] text-ink-500">
            <Rating value={item.rating} count={item.reviews} size={14} />
            <span className="flex items-center gap-1">
              <MapPin size={13} /> {item.city} · {item.distanceKm.toFixed(1).replace('.', ',')} km
            </span>
          </div>

          <div className="mt-4 flex gap-2 rounded-full bg-white p-1 shadow-card" role="tablist">
            {(
              [
                ['details', 'Détails'],
                ['amenities', 'Équipements'],
                ['reviews', 'Avis'],
              ] as [Tab, string][]
            ).map(([k, label]) => (
              <button
                key={k}
                role="tab"
                aria-selected={tab === k}
                onClick={() => setTab(k)}
                className={`flex-1 h-8 rounded-full text-[12px] font-semibold transition-colors ${tab === k ? 'bg-brand-700 text-white' : 'text-ink-700'}`}
              >
                {label}
              </button>
            ))}
          </div>

          {tab === 'details' && (
            <div className="mt-4 screen-in">
              <p className="text-[13px] leading-relaxed text-ink-700">{item.description}</p>
              <div className="mt-4 grid grid-cols-4 gap-2">
                {item.amenities.slice(0, 4).map((a) => {
                  const Icon = AMENITY_ICON[a];
                  return (
                    <div key={a} className="flex flex-col items-center gap-1.5 rounded-[12px] bg-white py-3 shadow-card">
                      <Icon size={20} className="text-brand-700" />
                      <span className="text-[10px] font-medium text-ink-700 text-center leading-tight px-1">{AMENITY_LABEL[a].split(' ')[0]}</span>
                    </div>
                  );
                })}
              </div>

              <h2 className="mt-5 mb-2 text-[14px] font-bold text-ink-900">Chambres disponibles</h2>
              <ul className="space-y-2.5">
                {item.rooms.map((r) => (
                  <li key={r.id}>
                    <Link to={`/booking/accommodation/${item.id}?room=${r.id}`} className="flex gap-3 rounded-[14px] bg-white p-2.5 shadow-card">
                      <img src={r.image} alt="" className="h-16 w-16 rounded-[10px] object-cover" loading="lazy" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-bold text-ink-900 truncate">{r.name}</p>
                        <p className="flex items-center gap-1 text-[11px] text-ink-500">
                          <BedDouble size={12} /> {r.bed} · {r.capacity} pers.
                        </p>
                        <p className="mt-1 text-[13px] font-bold text-brand-700">
                          {formatFCFA(r.pricePerNight)} <span className="text-[10px] font-medium text-ink-500">/ nuit</span>
                        </p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>

              <h2 className="mt-5 mb-2 text-[14px] font-bold text-ink-900">Adresse</h2>
              <div className="flex items-center gap-3 rounded-[14px] bg-white p-3 shadow-card">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-brand-700">
                  <MapPin size={18} />
                </span>
                <div className="text-[12px]">
                  <p className="font-semibold text-ink-900">{item.address}</p>
                  <p className="text-ink-500">{item.city}, Cameroun</p>
                </div>
              </div>
            </div>
          )}

          {tab === 'amenities' && (
            <div className="mt-4 screen-in">
              <h2 className="mb-2 text-[14px] font-bold text-ink-900">Équipements de l’hôtel</h2>
              <div className="grid grid-cols-3 gap-2">
                {item.amenities.map((a) => {
                  const Icon = AMENITY_ICON[a];
                  return (
                    <div key={a} className="flex flex-col items-center gap-1.5 rounded-[12px] bg-white py-3 px-1 shadow-card">
                      <Icon size={20} className="text-brand-700" />
                      <span className="text-[10px] font-medium text-ink-700 text-center leading-tight">{AMENITY_LABEL[a]}</span>
                    </div>
                  );
                })}
              </div>
              <h2 className="mt-5 mb-2 text-[14px] font-bold text-ink-900">Équipements de la chambre</h2>
              <ul className="rounded-[14px] bg-white p-3 shadow-card space-y-2">
                {Array.from(new Set(item.rooms.flatMap((r) => r.amenities))).map((a) => (
                  <li key={a} className="flex items-center gap-2.5 text-[13px] text-ink-900">
                    <Check size={16} className="text-brand-600" /> {AMENITY_LABEL[a]}
                  </li>
                ))}
                <li className="flex items-center gap-2.5 text-[13px] text-ink-900">
                  <Check size={16} className="text-brand-600" /> {item.rooms[0]?.bed ?? 'Lit double'}
                </li>
              </ul>
            </div>
          )}

          {tab === 'reviews' && (
            <div className="mt-4 screen-in">
              <div className="flex items-center gap-4 rounded-[14px] bg-white p-4 shadow-card">
                <div className="text-center">
                  <p className="text-[32px] font-extrabold text-ink-900 leading-none">{item.rating.toFixed(1)}</p>
                  <div className="mt-1 flex justify-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} size={12} className={i <= Math.round(item.rating) ? 'fill-star text-star' : 'text-ink-200'} />
                    ))}
                  </div>
                  <p className="mt-1 text-[11px] text-ink-500">{item.reviews} avis</p>
                </div>
                <div className="flex-1 space-y-1">
                  {[5, 4, 3, 2, 1].map((n, i) => (
                    <div key={n} className="flex items-center gap-2 text-[10px] text-ink-500">
                      <span className="w-3">{n}</span>
                      <div className="h-1.5 flex-1 rounded-full bg-ink-100 overflow-hidden">
                        <div className="h-full rounded-full bg-star" style={{ width: `${[78, 16, 4, 1, 1][i]}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <ul className="mt-3 space-y-2.5">
                {REVIEWS.map((r) => (
                  <li key={r.name} className="rounded-[14px] bg-white p-3.5 shadow-card">
                    <div className="flex items-center justify-between">
                      <p className="text-[13px] font-bold text-ink-900">{r.name}</p>
                      <span className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Star key={i} size={11} className={i <= r.rating ? 'fill-star text-star' : 'text-ink-200'} />
                        ))}
                      </span>
                    </div>
                    <p className="mt-1 text-[12px] text-ink-700 leading-relaxed">{r.text}</p>
                    <p className="mt-1.5 text-[10px] text-ink-500">{r.date}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <div className="shrink-0 border-t border-ink-100 bg-white px-4 pt-3 pb-4 flex items-center gap-4">
        <div>
          <p className="text-[18px] font-extrabold text-ink-900 leading-none">{formatFCFA(item.pricePerNight)}</p>
          <p className="text-[11px] text-ink-500 mt-0.5">/ nuit</p>
        </div>
        <Button size="lg" className="flex-1" onClick={() => navigate(`/booking/accommodation/${item.id}`)}>
          Réserver
        </Button>
      </div>
      <AssistantFab withNav={false} />
    </div>
  );
}
