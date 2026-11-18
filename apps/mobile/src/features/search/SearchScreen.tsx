import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Search, SearchX, X } from 'lucide-react';
import { ACCOMMODATIONS, RESTAURANTS, VEHICLES, formatFCFA, matches } from '@rezho/shared';
import { Chip, EmptyState, Rating } from '@/components/ui';
import { Screen } from '@/components/layout/Screen';

type Kind = 'all' | 'accommodation' | 'restaurant' | 'vehicle';

export function SearchScreen() {
  const [q, setQ] = useState('');
  const [kind, setKind] = useState<Kind>('all');

  const results = useMemo(() => {
    const acc = ACCOMMODATIONS.filter((a) => matches(`${a.name} ${a.city} ${a.address} ${a.type}`, q)).map((a) => ({
      id: a.id,
      kind: 'accommodation' as const,
      to: `/accommodations/${a.id}`,
      name: a.name,
      image: a.images[0]!,
      city: a.city,
      rating: a.rating,
      reviews: a.reviews,
      price: `${formatFCFA(a.pricePerNight)} / nuit`,
      label: 'Hébergement',
    }));
    const rest = RESTAURANTS.filter((r) => matches(`${r.name} ${r.city} ${r.cuisine} ${r.menu.map((d) => d.name).join(' ')}`, q)).map((r) => ({
      id: r.id,
      kind: 'restaurant' as const,
      to: `/restaurants/${r.id}`,
      name: r.name,
      image: r.images[0]!,
      city: r.city,
      rating: r.rating,
      reviews: r.reviews,
      price: `env. ${formatFCFA(r.avgPrice)} / pers.`,
      label: 'Restaurant',
    }));
    const veh = VEHICLES.filter((v) => matches(`${v.name} ${v.brand} ${v.model} ${v.type} ${v.city}`, q)).map((v) => ({
      id: v.id,
      kind: 'vehicle' as const,
      to: `/vehicles/${v.id}`,
      name: v.name,
      image: v.images[0]!,
      city: v.city,
      rating: v.rating,
      reviews: v.reviews,
      price: `${formatFCFA(v.pricePerDay)} / jour`,
      label: 'Véhicule',
    }));
    const all = [...acc, ...rest, ...veh];
    return kind === 'all' ? all : all.filter((r) => r.kind === kind);
  }, [q, kind]);

  return (
    <Screen
      topBar={{
        back: '/home',
        title: (
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-500" />
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Rechercher un hébergement, restaurant…"
              aria-label="Rechercher"
              className="h-10 w-full rounded-full bg-white border border-ink-200 pl-9 pr-9 text-[13px] focus:outline-none focus:border-brand-600"
            />
            {q && (
              <button type="button" aria-label="Effacer" onClick={() => setQ('')} className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-ink-100 flex items-center justify-center">
                <X size={12} />
              </button>
            )}
          </div>
        ),
      }}
    >
      <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 pb-3">
        {(
          [
            ['all', 'Tous'],
            ['accommodation', 'Hébergements'],
            ['restaurant', 'Restaurants'],
            ['vehicle', 'Véhicules'],
          ] as [Kind, string][]
        ).map(([k, label]) => (
          <Chip key={k} active={kind === k} onClick={() => setKind(k)}>
            {label}
          </Chip>
        ))}
      </div>
      <p className="text-[12px] text-ink-500 mb-2">{results.length} résultat{results.length > 1 ? 's' : ''}</p>
      {results.length === 0 ? (
        <EmptyState icon={<SearchX size={28} />} title="Aucun résultat" text="Essayez un autre mot-clé ou une autre ville." />
      ) : (
        <ul className="space-y-3">
          {results.map((r) => (
            <li key={r.id}>
              <Link to={r.to} className="flex gap-3 rounded-[16px] bg-white p-2.5 shadow-card">
                <img src={r.image} alt="" className="h-[72px] w-[72px] rounded-[12px] object-cover shrink-0" loading="lazy" />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-semibold text-brand-700 uppercase tracking-wide">{r.label}</p>
                  <p className="text-[14px] font-bold text-ink-900 truncate">{r.name}</p>
                  <div className="flex items-center gap-2">
                    <Rating value={r.rating} count={r.reviews} />
                  </div>
                  <p className="flex items-center gap-1 text-[11px] text-ink-500">
                    <MapPin size={12} /> {r.city} · <span className="font-bold text-brand-700">{r.price}</span>
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Screen>
  );
}
