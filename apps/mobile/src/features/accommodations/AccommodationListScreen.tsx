import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ChevronDown, MapPin, SearchX, SlidersHorizontal, Users } from 'lucide-react';
import { ACCOMMODATIONS, ACCOMMODATION_TYPE_LABEL, CITIES, formatFCFA, matches, type AccommodationType, type City } from '@rezho/shared';
import { Badge, BottomSheet, Button, Chip, Counter, EmptyState, FavoriteButton, Rating, Select } from '@/components/ui';
import { Screen } from '@/components/layout/Screen';
import { AssistantFab } from '@/components/layout/AssistantFab';
import { useAppStore } from '@/store/useAppStore';

const TYPE_CHIPS: { key: AccommodationType | 'all'; label: string }[] = [
  { key: 'all', label: 'Tous' },
  { key: 'hotel', label: 'Hôtels' },
  { key: 'apartment', label: 'Appartements' },
  { key: 'guesthouse', label: 'Auberges' },
  { key: 'house', label: 'Maisons' },
];

const PRICE_RANGES = [
  { key: 'all', label: 'Tous les prix', min: 0, max: Infinity },
  { key: 'low', label: '< 20 000', min: 0, max: 20000 },
  { key: 'mid', label: '20 000 – 40 000', min: 20000, max: 40000 },
  { key: 'high', label: '> 40 000', min: 40000, max: Infinity },
];

export function AccommodationListScreen() {
  const [params, setParams] = useSearchParams();
  const favorites = useAppStore((s) => s.favorites);
  const toggleFavorite = useAppStore((s) => s.toggleFavorite);

  const city = (params.get('city') as City | null) ?? 'all';
  const type = (params.get('type') as AccommodationType | null) ?? 'all';
  const promo = params.get('promo') === '1';
  const [query, setQuery] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [price, setPrice] = useState('all');
  const [minRating, setMinRating] = useState(0);
  const [guests, setGuests] = useState(1);
  const [sort, setSort] = useState<'reco' | 'price' | 'rating'>('reco');

  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value === 'all' || !value) next.delete(key);
    else next.set(key, value);
    setParams(next, { replace: true });
  };

  const list = useMemo(() => {
    const range = PRICE_RANGES.find((p) => p.key === price)!;
    let out = ACCOMMODATIONS.filter(
      (a) =>
        (city === 'all' || a.city === city) &&
        (type === 'all' || a.type === type) &&
        (!promo || !!a.discount) &&
        a.pricePerNight >= range.min &&
        a.pricePerNight < range.max &&
        a.rating >= minRating &&
        a.capacity >= guests &&
        matches(`${a.name} ${a.address} ${a.city}`, query),
    );
    if (sort === 'price') out = [...out].sort((a, b) => a.pricePerNight - b.pricePerNight);
    if (sort === 'rating') out = [...out].sort((a, b) => b.rating - a.rating);
    return out;
  }, [city, type, promo, price, minRating, guests, query, sort]);

  const activeFilters = (price !== 'all' ? 1 : 0) + (minRating > 0 ? 1 : 0) + (guests > 1 ? 1 : 0) + (sort !== 'reco' ? 1 : 0);

  return (
    <div className="relative flex flex-col flex-1 min-h-0">
      <Screen
        topBar={{
          back: '/home',
          title: `Hébergements (${list.length})`,
          right: (
            <button type="button" aria-label="Trier et filtrer" onClick={() => setFiltersOpen(true)} className="h-9 w-9 rounded-full flex items-center justify-center text-ink-900 hover:bg-white">
              <SlidersHorizontal size={18} />
            </button>
          ),
        }}
        withNav={false}
      >
        <div className="flex gap-2 mb-3">
          <label className="relative flex-1">
            <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-500 pointer-events-none" />
            <select
              aria-label="Ville"
              value={city}
              onChange={(e) => update('city', e.target.value)}
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
          <button
            type="button"
            onClick={() => setFiltersOpen(true)}
            className="h-10 rounded-full border border-ink-200 bg-white px-4 text-[13px] font-semibold text-ink-900 flex items-center gap-1.5"
          >
            <SlidersHorizontal size={15} /> Filtres {activeFilters > 0 && <span className="ml-0.5 rounded-full bg-brand-700 text-white text-[10px] px-1.5">{activeFilters}</span>}
          </button>
        </div>

        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher par nom ou quartier…"
          aria-label="Rechercher un hébergement"
          className="mb-3 h-10 w-full rounded-full border border-ink-200 bg-white px-4 text-[13px] focus:outline-none focus:border-brand-600"
        />

        <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 pb-3">
          {TYPE_CHIPS.map((c) => (
            <Chip key={c.key} active={type === c.key} onClick={() => update('type', c.key)}>
              {c.label}
            </Chip>
          ))}
          {promo && (
            <Chip active onClick={() => update('promo', '')}>
              Promotions ×
            </Chip>
          )}
        </div>

        {list.length === 0 ? (
          <EmptyState
            icon={<SearchX size={28} />}
            title="Aucun hébergement trouvé"
            text="Modifiez vos filtres ou choisissez une autre ville."
            action={
              <Button
                variant="outline"
                onClick={() => {
                  setPrice('all');
                  setMinRating(0);
                  setGuests(1);
                  setQuery('');
                  setParams({}, { replace: true });
                }}
              >
                Réinitialiser les filtres
              </Button>
            }
          />
        ) : (
          <ul className="space-y-3">
            {list.map((a) => (
              <li key={a.id}>
                <Link to={`/accommodations/${a.id}`} className="flex gap-3 rounded-[16px] bg-white p-2.5 shadow-card">
                  <div className="relative shrink-0">
                    <img src={a.images[0]} alt="" className="h-[86px] w-[86px] rounded-[12px] object-cover" loading="lazy" />
                    {a.discount && (
                      <span className="absolute left-1 top-1 rounded-full bg-lime-500 px-1.5 py-0.5 text-[9px] font-extrabold text-brand-900">-{a.discount}%</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-[14px] font-bold text-ink-900 truncate">{a.name}</p>
                      <FavoriteButton active={favorites.includes(a.id)} onToggle={() => toggleFavorite(a.id)} />
                    </div>
                    <Rating value={a.rating} count={a.reviews} />
                    <p className="mt-0.5 flex items-center gap-1 text-[11px] text-ink-500">
                      <MapPin size={12} /> {a.city} · {ACCOMMODATION_TYPE_LABEL[a.type]}
                    </p>
                    <p className="mt-1 text-[13px] font-bold text-brand-700">
                      {formatFCFA(a.pricePerNight)} <span className="text-[11px] font-medium text-ink-500">/ nuit</span>
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Screen>

      <AssistantFab bottom={20} />

      <BottomSheet
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        title="Filtres"
        footer={
          <div className="flex gap-2.5">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                setPrice('all');
                setMinRating(0);
                setGuests(1);
                setSort('reco');
              }}
            >
              Réinitialiser
            </Button>
            <Button className="flex-1" onClick={() => setFiltersOpen(false)}>
              Voir {list.length} résultat{list.length > 1 ? 's' : ''}
            </Button>
          </div>
        }
      >
        <div className="space-y-5 pt-1">
          <div>
            <p className="text-[13px] font-semibold text-ink-700 mb-2">Prix par nuit</p>
            <div className="flex flex-wrap gap-2">
              {PRICE_RANGES.map((p) => (
                <Chip key={p.key} active={price === p.key} onClick={() => setPrice(p.key)}>
                  {p.label}
                </Chip>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[13px] font-semibold text-ink-700 mb-2">Note minimale</p>
            <div className="flex flex-wrap gap-2">
              {[0, 4, 4.5, 4.8].map((r) => (
                <Chip key={r} active={minRating === r} onClick={() => setMinRating(r)}>
                  {r === 0 ? 'Toutes' : `${r.toFixed(1)} +`}
                </Chip>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-[13px] font-semibold text-ink-700 flex items-center gap-1.5">
              <Users size={15} /> Voyageurs
            </p>
            <Counter value={guests} onChange={setGuests} min={1} max={8} label="Voyageurs" />
          </div>
          <Select label="Trier par" value={sort} onChange={(e) => setSort(e.target.value as typeof sort)}>
            <option value="reco">Recommandés</option>
            <option value="price">Prix croissant</option>
            <option value="rating">Meilleures notes</option>
          </Select>
          <div className="flex items-center gap-2 text-[12px] text-ink-500">
            <Badge tone="brand">{list.length}</Badge> hébergements correspondent à vos critères.
          </div>
        </div>
      </BottomSheet>
    </div>
  );
}
