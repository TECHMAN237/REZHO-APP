import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, BedDouble, Bell, Car, Search, Sparkles, UtensilsCrossed, type LucideIcon } from 'lucide-react';
import { ACCOMMODATIONS, IMG, RESTAURANTS, VEHICLES, formatFCFA } from '@rezho/shared';
import { Avatar, SectionHeader } from '@/components/ui';
import { BottomNav } from '@/components/layout/BottomNav';
import { AssistantFab } from '@/components/layout/AssistantFab';
import { useAppStore } from '@/store/useAppStore';
import { PopularCarousel, type PopularItem } from './PopularCarousel';

interface ServiceCard {
  to: string;
  label: string;
  cta: string;
  image: string;
  icon: LucideIcon;
}

const SERVICES: ServiceCard[] = [
  { to: '/accommodations', label: 'Hébergements', cta: 'Réserver', image: IMG.hotelExterior1, icon: BedDouble },
  { to: '/restaurants', label: 'Restaurants', cta: 'Réserver', image: IMG.restaurant1, icon: UtensilsCrossed },
  { to: '/vehicles', label: 'Véhicules', cta: 'Louer', image: IMG.suv5, icon: Car },
];

const POPULAR: PopularItem[] = [
  ...ACCOMMODATIONS.filter((a) => a.featured).map((a) => ({ id: a.id, to: `/accommodations/${a.id}`, name: a.name, image: a.images[0]!, city: a.city, rating: a.rating, reviews: a.reviews, price: `${formatFCFA(a.pricePerNight)} / nuit`, kindLabel: 'Hébergement' })),
  ...RESTAURANTS.filter((r) => r.featured).map((r) => ({ id: r.id, to: `/restaurants/${r.id}`, name: r.name, image: r.images[0]!, city: r.city, rating: r.rating, reviews: r.reviews, price: `env. ${formatFCFA(r.avgPrice)} / pers.`, kindLabel: 'Restaurant' })),
  ...VEHICLES.filter((v) => v.featured).map((v) => ({ id: v.id, to: `/vehicles/${v.id}`, name: v.name, image: v.images[0]!, city: v.city, rating: v.rating, reviews: v.reviews, price: `${formatFCFA(v.pricePerDay)} / jour`, kindLabel: 'Véhicule' })),
];

export function HomeScreen() {
  const navigate = useNavigate();
  const user = useAppStore((s) => s.user);
  const favorites = useAppStore((s) => s.favorites);
  const toggleFavorite = useAppStore((s) => s.toggleFavorite);
  const bookings = useAppStore((s) => s.bookings);
  const upcoming = bookings.filter((b) => b.status === 'confirmed' || b.status === 'ongoing').length;

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

        {/* 1. Popular offers — auto-rotating cover-flow carousel (every 10 s) */}
        <section className="mt-4">
          <SectionHeader title="Offres populaires" to="/search" />
          <PopularCarousel items={POPULAR} favorites={favorites} onToggleFavorite={toggleFavorite} interval={3000} />
        </section>

        {/* 2. Promo banner — golden "offer" treatment */}
        <Link to="/accommodations?promo=1" className="gold-border mt-4 block rounded-[18px] p-[2px] shadow-card">
          <div className="relative overflow-hidden rounded-[16px] bg-brand-900 text-white">
            <span className="gold-shine" aria-hidden="true" />
            <div className="flex items-stretch">
              <div className="relative flex-1 px-4 py-4">
                <span className="gold-badge inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[9.5px] font-extrabold uppercase tracking-[0.08em] text-brand-950">
                  <Sparkles size={10} /> Offre limitée
                </span>
                <p className="gold-text mt-2 text-[24px] font-extrabold leading-none">Jusqu’à -20%</p>
                <p className="mt-1.5 text-[12px] text-white/85">sur une sélection d’hébergements</p>
                <span className="gold-badge mt-3 inline-flex h-8 items-center gap-1 rounded-full px-3.5 text-[11px] font-extrabold text-brand-950">
                  Voir les offres <ArrowRight size={13} />
                </span>
              </div>
              <div className="relative w-[42%]">
                <img src={IMG.building2} alt="" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-r from-brand-900 via-brand-900/40 to-transparent" />
                <span className="absolute right-3 top-3 rounded-full bg-brand-950/70 px-2 py-0.5 text-[10px] font-bold text-[#F6E27A] ring-1 ring-[#E8C547]/70">-20%</span>
              </div>
            </div>
          </div>
        </Link>

        {/* 3. Services — explicit call-to-action buttons */}
        <section className="mt-5">
          <SectionHeader title="Nos services" />
          <div className="grid grid-cols-3 gap-3">
            {SERVICES.map(({ to, label, cta, image, icon: Icon }) => (
              <Link key={to} to={to} className="group flex flex-col overflow-hidden rounded-[18px] bg-white shadow-card focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600">
                <div className="relative h-[84px] bg-ink-100">
                  <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" />
                  <span className="absolute left-2 top-2 flex h-7 w-7 items-center justify-center rounded-[9px] bg-white/95 text-brand-700 shadow-card">
                    <Icon size={15} />
                  </span>
                </div>
                <div className="flex flex-1 flex-col gap-2 p-2.5">
                  <span className="text-[12px] font-bold leading-tight text-ink-900">{label}</span>
                  <span className="mt-auto inline-flex h-8 w-full items-center justify-center gap-1 rounded-full bg-brand-700 text-[11px] font-bold text-white shadow-[0_4px_10px_rgba(26,107,69,0.35)] transition-colors group-hover:bg-brand-800 group-active:bg-brand-900">
                    {cta} <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" />
                  </span>
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
