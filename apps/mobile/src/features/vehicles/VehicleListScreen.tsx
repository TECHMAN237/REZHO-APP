import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ChevronDown, Fuel, MapPin, SearchX, Settings2, SlidersHorizontal, Users } from 'lucide-react';
import { CITIES, VEHICLES, VEHICLE_TYPES, formatFCFA, matches, type City, type Transmission, type VehicleType } from '@rezho/shared';
import { Badge, BottomSheet, Button, Chip, EmptyState, FavoriteButton, Rating, Select } from '@/components/ui';
import { Screen } from '@/components/layout/Screen';
import { AssistantFab } from '@/components/layout/AssistantFab';
import { useAppStore } from '@/store/useAppStore';

export function VehicleListScreen() {
  const [params, setParams] = useSearchParams();
  const favorites = useAppStore((s) => s.favorites);
  const toggleFavorite = useAppStore((s) => s.toggleFavorite);
  const city = (params.get('city') as City | null) ?? 'all';
  const [type, setType] = useState<VehicleType | 'Tous'>('Tous');
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [transmission, setTransmission] = useState<Transmission | 'Toutes'>('Toutes');
  const [maxPrice, setMaxPrice] = useState(0);
  const [minSeats, setMinSeats] = useState(0);
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [sort, setSort] = useState<'reco' | 'price' | 'rating'>('reco');

  const list = useMemo(() => {
    let out = VEHICLES.filter(
      (v) =>
        (city === 'all' || v.city === city) &&
        (type === 'Tous' || v.type === type) &&
        (transmission === 'Toutes' || v.transmission === transmission) &&
        (maxPrice === 0 || v.pricePerDay <= maxPrice) &&
        v.seats >= minSeats &&
        (!onlyAvailable || v.available) &&
        matches(`${v.name} ${v.brand} ${v.model} ${v.city} ${v.type}`, query),
    );
    if (sort === 'price') out = [...out].sort((a, b) => a.pricePerDay - b.pricePerDay);
    if (sort === 'rating') out = [...out].sort((a, b) => b.rating - a.rating);
    return out;
  }, [city, type, transmission, maxPrice, minSeats, onlyAvailable, query, sort]);

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
          title: `Véhicules (${list.length})`,
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
          placeholder="Rechercher une marque ou un modèle…"
          aria-label="Rechercher un véhicule"
          className="mb-3 h-10 w-full rounded-full border border-ink-200 bg-white px-4 text-[13px] focus:outline-none focus:border-brand-600"
        />
        <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 pb-3">
          {(['Tous', ...VEHICLE_TYPES] as const).map((t) => (
            <Chip key={t} active={type === t} onClick={() => setType(t)}>
              {t}
            </Chip>
          ))}
        </div>

        {list.length === 0 ? (
          <EmptyState icon={<SearchX size={28} />} title="Aucun véhicule trouvé" text="Modifiez vos filtres ou choisissez une autre ville." />
        ) : (
          <ul className="space-y-3">
            {list.map((v) => (
              <li key={v.id}>
                <Link to={`/vehicles/${v.id}`} className="block overflow-hidden rounded-[16px] bg-white shadow-card">
                  <div className="relative h-[150px]">
                    <img src={v.images[0]} alt="" className="h-full w-full object-cover" loading="lazy" />
                    <FavoriteButton active={favorites.includes(v.id)} onToggle={() => toggleFavorite(v.id)} className="absolute top-2 right-2" />
                    <span className="absolute left-2 top-2">
                      <Badge tone={v.available ? 'success' : 'danger'}>{v.available ? 'Disponible' : 'Indisponible'}</Badge>
                    </span>
                  </div>
                  <div className="p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[14px] font-bold text-ink-900 truncate">{v.name}</p>
                      <Badge tone="neutral">{v.type}</Badge>
                    </div>
                    <div className="mt-0.5 flex items-center justify-between text-[11px] text-ink-500">
                      <Rating value={v.rating} count={v.reviews} />
                      <span className="flex items-center gap-1">
                        <MapPin size={12} /> {v.city}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center gap-3 text-[11px] text-ink-700">
                      <span className="flex items-center gap-1">
                        <Settings2 size={12} /> {v.transmission}
                      </span>
                      <span className="flex items-center gap-1">
                        <Fuel size={12} /> {v.fuel}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users size={12} /> {v.seats} places
                      </span>
                    </div>
                    <p className="mt-2 text-[14px] font-bold text-brand-700">
                      {formatFCFA(v.pricePerDay)} <span className="text-[11px] font-medium text-ink-500">/ jour</span>
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
        open={open}
        onClose={() => setOpen(false)}
        title="Filtres"
        footer={
          <div className="flex gap-2.5">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                setTransmission('Toutes');
                setMaxPrice(0);
                setMinSeats(0);
                setOnlyAvailable(false);
                setSort('reco');
                setType('Tous');
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
            <p className="text-[13px] font-semibold text-ink-700 mb-2">Transmission</p>
            <div className="flex gap-2">
              {(['Toutes', 'Automatique', 'Manuelle'] as const).map((t) => (
                <Chip key={t} active={transmission === t} onClick={() => setTransmission(t)}>
                  {t}
                </Chip>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[13px] font-semibold text-ink-700 mb-2">Prix maximum par jour</p>
            <div className="flex flex-wrap gap-2">
              {[0, 30000, 50000, 80000].map((p) => (
                <Chip key={p} active={maxPrice === p} onClick={() => setMaxPrice(p)}>
                  {p === 0 ? 'Tous' : `≤ ${formatFCFA(p, false)}`}
                </Chip>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[13px] font-semibold text-ink-700 mb-2">Places minimum</p>
            <div className="flex gap-2">
              {[0, 5, 7].map((s) => (
                <Chip key={s} active={minSeats === s} onClick={() => setMinSeats(s)}>
                  {s === 0 ? 'Toutes' : `${s}+`}
                </Chip>
              ))}
            </div>
          </div>
          <Chip active={onlyAvailable} onClick={() => setOnlyAvailable((v) => !v)}>
            Disponibles uniquement
          </Chip>
          <Select label="Trier par" value={sort} onChange={(e) => setSort(e.target.value as typeof sort)}>
            <option value="reco">Recommandés</option>
            <option value="price">Prix croissant</option>
            <option value="rating">Meilleures notes</option>
          </Select>
        </div>
      </BottomSheet>
    </div>
  );
}
