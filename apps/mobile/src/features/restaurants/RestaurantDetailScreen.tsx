import { useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Clock, MapPin, Phone, Star, UtensilsCrossed } from 'lucide-react';
import { DISH_CATEGORIES, RESTAURANTS, formatFCFA, type DishCategory } from '@rezho/shared';
import { Badge, Button, Chip, FavoriteButton, Rating } from '@/components/ui';
import { AssistantFab } from '@/components/layout/AssistantFab';
import { useAppStore } from '@/store/useAppStore';

type Tab = 'menu' | 'infos' | 'reviews';

const REVIEWS = [
  { name: 'Estelle K.', rating: 5, text: 'Le poulet DG est une tuerie, service rapide et souriant.', date: 'Il y a 1 semaine' },
  { name: 'Paul B.', rating: 4, text: 'Très bonne cuisine, un peu d’attente le vendredi soir.', date: 'Il y a 3 semaines' },
];

export function RestaurantDetailScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const item = RESTAURANTS.find((r) => r.id === id);
  const favorites = useAppStore((s) => s.favorites);
  const toggleFavorite = useAppStore((s) => s.toggleFavorite);
  const [tab, setTab] = useState<Tab>('menu');
  const [category, setCategory] = useState<DishCategory | 'Tous'>('Tous');

  if (!item) return <Navigate to="/restaurants" replace />;
  const dishes = item.menu.filter((d) => category === 'Tous' || d.category === category);

  return (
    <div className="relative flex flex-col flex-1 min-h-0 bg-brand-50 screen-in">
      <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar pb-4">
        <div className="relative h-[260px] shrink-0">
          <img src={item.images[0]} alt={item.name} className="h-full w-full object-cover" />
          <div className="absolute top-3 sm:top-12 left-4 right-4 flex items-center justify-between">
            <button type="button" aria-label="Retour" onClick={() => navigate(-1)} className="h-10 w-10 rounded-full bg-white/95 shadow-sm flex items-center justify-center text-ink-900">
              <ArrowLeft size={20} />
            </button>
            <FavoriteButton active={favorites.includes(item.id)} onToggle={() => toggleFavorite(item.id)} className="!h-10 !w-10" />
          </div>
        </div>

        <div className="-mt-5 relative rounded-t-[24px] bg-brand-50 px-4 pt-5">
          <div className="flex items-start justify-between gap-2">
            <h1 className="text-[20px] font-extrabold text-ink-900">{item.name}</h1>
            <Badge tone="brand">{item.cuisine}</Badge>
          </div>
          <div className="mt-1.5 flex items-center gap-3 text-[12px] text-ink-500">
            <Rating value={item.rating} count={item.reviews} size={14} />
            <span className="flex items-center gap-1">
              <MapPin size={13} /> {item.city} · {item.distanceKm.toFixed(1).replace('.', ',')} km
            </span>
          </div>

          <div className="mt-4 flex gap-2 rounded-full bg-white p-1 shadow-card" role="tablist">
            {(
              [
                ['menu', 'Menu'],
                ['infos', 'Infos'],
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

          {tab === 'menu' && (
            <div className="mt-4 screen-in">
              <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 pb-3">
                {(['Tous', ...DISH_CATEGORIES] as const).map((c) => (
                  <Chip key={c} size="sm" active={category === c} onClick={() => setCategory(c)}>
                    {c}
                  </Chip>
                ))}
              </div>
              <ul className="space-y-2.5">
                {dishes.map((d) => (
                  <li key={d.id} className={`flex gap-3 rounded-[14px] bg-white p-2.5 shadow-card ${d.available ? '' : 'opacity-60'}`}>
                    <img src={d.image} alt="" className="h-[72px] w-[72px] rounded-[10px] object-cover" loading="lazy" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-[13px] font-bold text-ink-900 truncate">{d.name}</p>
                        {!d.available && <Badge tone="danger">Épuisé</Badge>}
                        {d.promoPercent && d.available && <Badge tone="warning">-{d.promoPercent}%</Badge>}
                      </div>
                      <p className="text-[11px] text-ink-500 clamp-2">{d.description}</p>
                      <p className="mt-1 text-[13px] font-bold text-brand-700">
                        {d.promoPercent ? (
                          <>
                            {formatFCFA(Math.round(d.price * (1 - d.promoPercent / 100)))}{' '}
                            <span className="text-[10px] font-medium text-ink-300 line-through">{formatFCFA(d.price, false)}</span>
                          </>
                        ) : (
                          formatFCFA(d.price)
                        )}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {tab === 'infos' && (
            <div className="mt-4 screen-in space-y-3">
              <p className="text-[13px] leading-relaxed text-ink-700">{item.description}</p>
              <div className="rounded-[14px] bg-white p-3.5 shadow-card space-y-3 text-[12px]">
                <p className="flex items-center gap-2.5 text-ink-900">
                  <Clock size={16} className="text-brand-700" /> Ouvert : {item.openingHours}
                </p>
                <p className="flex items-center gap-2.5 text-ink-900">
                  <MapPin size={16} className="text-brand-700" /> {item.address}, {item.city}
                </p>
                <p className="flex items-center gap-2.5 text-ink-900">
                  <Phone size={16} className="text-brand-700" /> +237 6 78 45 12 30
                </p>
                <p className="flex items-center gap-2.5 text-ink-900">
                  <UtensilsCrossed size={16} className="text-brand-700" /> Prix moyen : {formatFCFA(item.avgPrice)} / pers.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {item.images.slice(1).map((src) => (
                  <img key={src} src={src} alt="" className="h-20 w-full rounded-[10px] object-cover" loading="lazy" />
                ))}
              </div>
            </div>
          )}

          {tab === 'reviews' && (
            <ul className="mt-4 space-y-2.5 screen-in">
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
          )}
        </div>
      </div>

      <div className="shrink-0 border-t border-ink-100 bg-white px-4 pt-3 pb-4 flex items-center gap-4">
        <div>
          <p className="text-[12px] text-ink-500">Ouvert</p>
          <p className="text-[13px] font-bold text-ink-900">{item.openingHours.split(',')[0]}</p>
        </div>
        <Button size="lg" className="flex-1" onClick={() => navigate(`/booking/restaurant/${item.id}`)}>
          Réserver une table
        </Button>
      </div>
      <AssistantFab withNav={false} />
    </div>
  );
}
