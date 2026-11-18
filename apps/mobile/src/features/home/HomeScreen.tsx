import { Link, useNavigate } from 'react-router-dom';
import { Bell, Search } from 'lucide-react';
import { ACCOMMODATIONS, IMG, RESTAURANTS, VEHICLES, formatFCFA } from '@rezho/shared';
import { Avatar, FavoriteButton, Rating, SectionHeader } from '@/components/ui';
import { BottomNav } from '@/components/layout/BottomNav';
import { AssistantFab } from '@/components/layout/AssistantFab';
import { useAppStore } from '@/store/useAppStore';

const CATEGORIES = [
  { to: '/accommodations', label: 'Hébergements', image: IMG.hotelExterior1 },
  { to: '/restaurants', label: 'Restaurants', image: IMG.restaurant1 },
  { to: '/vehicles', label: 'Véhicules', image: IMG.suv5 },
];

export function HomeScreen() {
  const navigate = useNavigate();
  const user = useAppStore((s) => s.user);
  const favorites = useAppStore((s) => s.favorites);
  const toggleFavorite = useAppStore((s) => s.toggleFavorite);
  const bookings = useAppStore((s) => s.bookings);
  const upcoming = bookings.filter((b) => b.status === 'confirmed' || b.status === 'ongoing').length;

  const popular = [
    ...ACCOMMODATIONS.filter((a) => a.featured).map((a) => ({ id: a.id, to: `/accommodations/${a.id}`, name: a.name, image: a.images[0]!, city: a.city, rating: a.rating, reviews: a.reviews, price: `${formatFCFA(a.pricePerNight)} / nuit` })),
    ...RESTAURANTS.filter((r) => r.featured).map((r) => ({ id: r.id, to: `/restaurants/${r.id}`, name: r.name, image: r.images[0]!, city: r.city, rating: r.rating, reviews: r.reviews, price: `env. ${formatFCFA(r.avgPrice)} / pers.` })),
    ...VEHICLES.filter((v) => v.featured).map((v) => ({ id: v.id, to: `/vehicles/${v.id}`, name: v.name, image: v.images[0]!, city: v.city, rating: v.rating, reviews: v.reviews, price: `${formatFCFA(v.pricePerDay)} / jour` })),
  ];

  return (
    <div className="relative flex flex-col flex-1 min-h-0 bg-brand-50 screen-in">
      <header className="shrink-0 px-4 pt-3 sm:pt-12 pb-2 flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-[12px] text-ink-500">Bonjour,</p>
          <h1 className="text-[17px] font-extrabold text-ink-900 truncate">{user.name} 👋</h1>
        </div>
        <Link
          to="/notifications"
          aria-label={`Notifications${upcoming ? ` (${upcoming} nouvelles)` : ''}`}
          className="relative h-10 w-10 rounded-full bg-white flex items-center justify-center text-ink-900 shadow-card"
        >
          <Bell size={19} />
          {upcoming > 0 && <span className="absolute top-2 right-2.5 h-2 w-2 rounded-full bg-danger ring-2 ring-white" />}
        </Link>
        <Link to="/profile" aria-label="Profil">
          <Avatar src={user.avatar} name={user.name} size={40} />
        </Link>
      </header>

      <main className="flex-1 min-h-0 overflow-y-auto no-scrollbar px-4 pb-28">
        <button
          type="button"
          onClick={() => navigate('/search')}
          className="mt-2 flex w-full items-center gap-2.5 rounded-full bg-white px-4 h-11 text-[13px] text-ink-300 shadow-card text-left"
        >
          <Search size={17} className="text-ink-500" />
          Rechercher un hébergement, restaurant…
        </button>

        <div className="mt-4 grid grid-cols-3 gap-3">
          {CATEGORIES.map((c) => (
            <Link key={c.to} to={c.to} className="group relative aspect-[0.9] overflow-hidden rounded-[16px] bg-ink-100 shadow-card">
              <img src={c.image} alt="" className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent pt-8 pb-2 px-2">
                <span className="block text-center text-[11px] font-bold text-white leading-tight">{c.label}</span>
              </div>
            </Link>
          ))}
        </div>

        <Link to="/accommodations?promo=1" className="mt-4 relative block overflow-hidden rounded-[16px] bg-brand-900 text-white shadow-card">
          <div className="flex items-stretch">
            <div className="flex-1 px-4 py-5">
              <p className="text-[18px] font-extrabold leading-tight">Jusqu’à -20%</p>
              <p className="text-[12px] text-white/85 mt-1">sur certains hébergements</p>
              <span className="mt-3 inline-block rounded-full bg-lime-500 px-3 py-1 text-[11px] font-bold text-brand-900">Voir les offres</span>
            </div>
            <div className="relative w-[44%]">
              <img src={IMG.building2} alt="" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-r from-brand-900 to-transparent" />
            </div>
          </div>
        </Link>

        <section className="mt-5">
          <SectionHeader title="Offres populaires" to="/search" />
          <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-4 px-4 pb-1">
            {popular.map((p) => (
              <Link key={p.id} to={p.to} className="w-[200px] shrink-0 overflow-hidden rounded-[16px] bg-white shadow-card">
                <div className="relative h-[120px]">
                  <img src={p.image} alt={p.name} className="h-full w-full object-cover" loading="lazy" />
                  <FavoriteButton active={favorites.includes(p.id)} onToggle={() => toggleFavorite(p.id)} className="absolute top-2 right-2" />
                </div>
                <div className="p-3">
                  <p className="text-[13px] font-bold text-ink-900 truncate">{p.name}</p>
                  <div className="mt-1 flex items-center justify-between">
                    <Rating value={p.rating} />
                    <span className="text-[11px] text-ink-500">{p.city}</span>
                  </div>
                  <p className="mt-1.5 text-[12px] font-bold text-brand-700">{p.price}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-5">
          <SectionHeader title="Destinations" to="/accommodations" action="Explorer" />
          <div className="grid grid-cols-2 gap-3">
            {[
              { city: 'Kribi', image: IMG.beach2, text: 'Plages & chutes de la Lobé' },
              { city: 'Buea', image: IMG.city1, text: 'Mont Cameroun' },
              { city: 'Limbe', image: IMG.beach1, text: 'Sable noir & jardin botanique' },
              { city: 'Douala', image: IMG.palm1, text: 'Capitale économique' },
            ].map((d) => (
              <Link key={d.city} to={`/accommodations?city=${encodeURIComponent(d.city)}`} className="relative h-[110px] overflow-hidden rounded-[16px] shadow-card">
                <img src={d.image} alt="" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <div className="absolute bottom-2.5 left-3 right-3 text-white">
                  <p className="text-[14px] font-bold">{d.city}</p>
                  <p className="text-[10px] text-white/85 truncate">{d.text}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <AssistantFab />
      <BottomNav />
    </div>
  );
}
