import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ChevronDown, Clock, MapPin, SearchX, SlidersHorizontal } from 'lucide-react';
import { CITIES, RESTAURANTS, formatFCFA, matches, type City } from '@rezho/shared';
import { BottomSheet, Button, Chip, EmptyState, FavoriteButton, Rating, Select } from '@/components/ui';
import { Screen } from '@/components/layout/Screen';
import { AssistantFab } from '@/components/layout/AssistantFab';
import { useAppStore } from '@/store/useAppStore';

const CUISINES = ['Tous', 'Camerounaise', 'Africaine', 'Française', 'Asiatique', 'Européenne', 'Fruits de mer'];

export function RestaurantListScreen() {
  const [params, setParams] = useSearchParams();
  const favorites = useAppStore((s) => s.favorites);
  const toggleFavorite = useAppStore((s) => s.toggleFavorite);
  const city = (params.get('city') as City | null) ?? 'all';
  const [cuisine, setCuisine] = useState('Tous');
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [priceLevel, setPriceLevel] = useState<0 | 1 | 2 | 3>(0);
  const [minRating, setMinRating] = useState(0);
  const [sort, setSort] = useState<'reco' | 'rating' | 'distance' | 'price'>('reco');

  const list = useMemo(() => {
    let out = RESTAURANTS.filter(
      (r) =>
        (city === 'all' || r.city === city) &&
        (cuisine === 'Tous' || r.cuisine === cuisine) &&
        (priceLevel === 0 || r.priceLevel === priceLevel) &&
        r.rating >= minRating &&
        matches(`${r.name} ${r.cuisine} ${r.city} ${r.menu.map((d) => d.name).join(' ')}`, query),
    );
    if (sort === 'rating') out = [...out].sort((a, b) => b.rating - a.rating);
    if (sort === 'distance') out = [...out].sort((a, b) => a.distanceKm - b.distanceKm);
    if (sort === 'price') out = [...out].sort((a, b) => a.avgPrice - b.avgPrice);
    return out;
  }, [city, cuisine, priceLevel, minRating, query, sort]);

  const setCity = (v: string) => {
    const next = new URLSearchParams(params);
    if (v === 'all') next.delete('city');
    else next.set('city', v);
    setParams(next, { replace: true });
  };

  return (
    <div className="relative flex flex-col flex-1 min-h-0">
      <Screen
        topBar={{
          back: '/home',
          title: `Restaurants (${list.length})`,
          right: (
            <button type="button" aria-label="Filtres" onClick={() => setOpen(true)} className="h-9 w-9 rounded-full flex items-center justify-center text-ink-900 hover:bg-white">
              <SlidersHorizontal size={18} />
            </button>
          ),
        }}
      >
        <div className="flex gap-2 mb-3">
          <label className="relative flex-1">
            <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-500 pointer-events-none" />
            <select
              aria-label="Ville"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="h-10 w-full appearance-none rounded-full border border-ink-200 bg-white pl-8 pr-8 text-[13px] font-semibold text-ink-900 focus:outline-none focus:border-brand-600"
            >
              <option value="all">Toutes les villes</option>
              {CITIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-500 pointer-events-none" />
          </label>
          <button type="button" onClick={() => setOpen(true)} className="h-10 rounded-full border border-ink-200 bg-white px-4 text-[13px] font-semibold text-ink-900 flex items-center gap-1.5">
            <SlidersHorizontal size={15} /> Filtres
          </button>
        </div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher un restaurant ou un plat…"
          aria-label="Rechercher un restaurant"
          className="mb-3 h-10 w-full rounded-full border border-ink-200 bg-white px-4 text-[13px] focus:outline-none focus:border-brand-600"
        />
        <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 pb-3">
          {CUISINES.map((c) => (
            <Chip key={c} active={cuisine === c} onClick={() => setCuisine(c)}>
              {c}
            </Chip>
          ))}
        </div>

        {list.length === 0 ? (
          <EmptyState icon={<SearchX size={28} />} title="Aucun restaurant trouvé" text="Essayez une autre cuisine ou une autre ville." />
        ) : (
          <ul className="space-y-3">
            {list.map((r) => (
              <li key={r.id}>
                <Link to={`/restaurants/${r.id}`} className="block overflow-hidden rounded-[16px] bg-white shadow-card">
                  <div className="relative h-[130px]">
                    <img src={r.images[0]} alt="" className="h-full w-full object-cover" loading="lazy" />
                    <FavoriteButton active={favorites.includes(r.id)} onToggle={() => toggleFavorite(r.id)} className="absolute top-2 right-2" />
                    <span className="absolute left-2 bottom-2 rounded-full bg-white/95 px-2 py-0.5 text-[10px] font-bold text-ink-900">{r.cuisine}</span>
                  </div>
                  <div className="p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[14px] font-bold text-ink-900 truncate">{r.name}</p>
                      <span className="text-[11px] font-bold text-ink-700" aria-label={`Gamme de prix ${r.priceLevel} sur 3`}>
                        {'€'.repeat(r.priceLevel)}
                      </span>
                    </div>
                    <div className="mt-0.5 flex items-center justify-between text-[11px] text-ink-500">
                      <Rating value={r.rating} count={r.reviews} />
                      <span className="flex items-center gap-1">
                        <MapPin size={12} /> {r.city} · {r.distanceKm.toFixed(1).replace('.', ',')} km
                      </span>
                    </div>
                    <div className="mt-1.5 flex items-center justify-between text-[11px]">
                      <span className="flex items-center gap-1 text-ink-500">
                        <Clock size={12} /> {r.openingHours}
                      </span>
                      <span className="font-bold text-brand-700">env. {formatFCFA(r.avgPrice)} / pers.</span>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Screen>
      <AssistantFab bottom={20} />
      <BottomSheet
        open={open}
        onClose={() => setOpen(false)}
        title="Filtres"
        footer={
          <div className="flex gap-2.5">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                setPriceLevel(0);
                setMinRating(0);
                setSort('reco');
                setCuisine('Tous');
              }}
            >
              Réinitialiser
            </Button>
            <Button className="flex-1" onClick={() => setOpen(false)}>
              Voir {list.length} résultat{list.length > 1 ? 's' : ''}
            </Button>
          </div>
        }
      >
        <div className="space-y-5 pt-1">
          <div>
            <p className="text-[13px] font-semibold text-ink-700 mb-2">Gamme de prix</p>
            <div className="flex gap-2">
              {([0, 1, 2, 3] as const).map((p) => (
                <Chip key={p} active={priceLevel === p} onClick={() => setPriceLevel(p)}>
                  {p === 0 ? 'Tous' : '€'.repeat(p)}
                </Chip>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[13px] font-semibold text-ink-700 mb-2">Note minimale</p>
            <div className="flex gap-2">
              {[0, 4, 4.5, 4.7].map((r) => (
                <Chip key={r} active={minRating === r} onClick={() => setMinRating(r)}>
                  {r === 0 ? 'Toutes' : `${r.toFixed(1)} +`}
                </Chip>
              ))}
            </div>
          </div>
          <Select label="Trier par" value={sort} onChange={(e) => setSort(e.target.value as typeof sort)}>
            <option value="reco">Recommandés</option>
            <option value="rating">Meilleures notes</option>
            <option value="distance">Les plus proches</option>
            <option value="price">Prix moyen croissant</option>
          </Select>
        </div>
      </BottomSheet>
    </div>
  );
}
