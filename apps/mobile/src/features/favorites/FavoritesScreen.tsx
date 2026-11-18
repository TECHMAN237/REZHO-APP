import { Link } from 'react-router-dom';
import { Heart, MapPin } from 'lucide-react';
import { ACCOMMODATIONS, RESTAURANTS, VEHICLES, formatFCFA } from '@rezho/shared';
import { Button, EmptyState, FavoriteButton, Rating } from '@/components/ui';
import { Screen } from '@/components/layout/Screen';
import { BottomNav } from '@/components/layout/BottomNav';
import { AssistantFab } from '@/components/layout/AssistantFab';
import { useAppStore } from '@/store/useAppStore';

export function FavoritesScreen() {
  const favorites = useAppStore((s) => s.favorites);
  const toggleFavorite = useAppStore((s) => s.toggleFavorite);

  const items = [
    ...ACCOMMODATIONS.filter((a) => favorites.includes(a.id)).map((a) => ({ id: a.id, to: `/accommodations/${a.id}`, name: a.name, image: a.images[0]!, city: a.city, rating: a.rating, reviews: a.reviews, price: `${formatFCFA(a.pricePerNight)} / nuit`, kind: 'Hébergement' })),
    ...RESTAURANTS.filter((r) => favorites.includes(r.id)).map((r) => ({ id: r.id, to: `/restaurants/${r.id}`, name: r.name, image: r.images[0]!, city: r.city, rating: r.rating, reviews: r.reviews, price: `env. ${formatFCFA(r.avgPrice)} / pers.`, kind: 'Restaurant' })),
    ...VEHICLES.filter((v) => favorites.includes(v.id)).map((v) => ({ id: v.id, to: `/vehicles/${v.id}`, name: v.name, image: v.images[0]!, city: v.city, rating: v.rating, reviews: v.reviews, price: `${formatFCFA(v.pricePerDay)} / jour`, kind: 'Véhicule' })),
  ];

  return (
    <div className="relative flex flex-col flex-1 min-h-0">
      <Screen topBar={{ title: `Mes favoris (${items.length})` }} withNav>
        {items.length === 0 ? (
          <EmptyState
            icon={<Heart size={28} />}
            title="Aucun favori pour le moment"
            text="Appuyez sur le cœur d’un hébergement, restaurant ou véhicule pour le retrouver ici."
            action={
              <Link to="/home">
                <Button>Explorer</Button>
              </Link>
            }
          />
        ) : (
          <ul className="space-y-3 mt-1">
            {items.map((it) => (
              <li key={it.id}>
                <Link to={it.to} className="flex gap-3 rounded-[16px] bg-white p-2.5 shadow-card">
                  <img src={it.image} alt="" className="h-[84px] w-[84px] rounded-[12px] object-cover shrink-0" loading="lazy" />
                  <div className="flex-1 min-w-0 py-0.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-[10px] font-semibold text-brand-700 uppercase tracking-wide">{it.kind}</p>
                        <p className="text-[14px] font-bold text-ink-900 truncate">{it.name}</p>
                      </div>
                      <FavoriteButton active onToggle={() => toggleFavorite(it.id)} />
                    </div>
                    <Rating value={it.rating} count={it.reviews} />
                    <p className="mt-0.5 flex items-center gap-1 text-[11px] text-ink-500">
                      <MapPin size={12} /> {it.city}
                    </p>
                    <p className="mt-1 text-[13px] font-bold text-brand-700">{it.price}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Screen>
      <AssistantFab />
      <BottomNav />
    </div>
  );
}
