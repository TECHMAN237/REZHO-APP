import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, MapPin, Star } from 'lucide-react';
import { FavoriteButton } from '@/components/ui';

export interface PopularItem {
  id: string;
  to: string;
  name: string;
  image: string;
  city: string;
  rating: number;
  reviews: number;
  price: string;
  kindLabel: string;
}

interface Props {
  items: PopularItem[];
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  /** Auto-rotation interval in ms (default 10 s). */
  interval?: number;
}

/** Shortest signed distance from `index` to `i` on a ring of `n` items. */
function ringOffset(i: number, index: number, n: number): number {
  let d = (i - index) % n;
  if (d > n / 2) d -= n;
  if (d < -n / 2) d += n;
  return d;
}

/**
 * Cover-flow style carousel: the centre card is the highlighted offer, the previous
 * and next offers peek on each side. Every `interval` ms the centre card slides to
 * the left and the right card becomes the new centre (auto-rotation pauses while the
 * user touches / hovers the carousel, and is disabled when reduced motion is preferred).
 */
export function PopularCarousel({ items, favorites, onToggleFavorite, interval = 10000 }: Props) {
  const n = items.length;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchX = useRef<number | null>(null);

  const next = useCallback(() => setIndex((i) => (i + 1) % n), [n]);
  const prev = useCallback(() => setIndex((i) => (i - 1 + n) % n), [n]);

  useEffect(() => {
    if (n < 2 || paused) return;
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = window.setInterval(next, interval);
    return () => window.clearInterval(id);
  }, [n, paused, interval, next]);

  if (n === 0) return null;

  return (
    <div
      className="relative -mx-4 select-none"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={(e) => {
        setPaused(true);
        touchX.current = e.touches[0]?.clientX ?? null;
      }}
      onTouchEnd={(e) => {
        const start = touchX.current;
        const end = e.changedTouches[0]?.clientX;
        if (start !== null && typeof end === 'number') {
          if (end - start > 40) prev();
          else if (start - end > 40) next();
        }
        touchX.current = null;
        setPaused(false);
      }}
      role="region"
      aria-roledescription="carrousel"
      aria-label="Offres populaires"
    >
      <div className="relative h-[232px] overflow-hidden">
        {items.map((p, i) => {
          const d = ringOffset(i, index, n);
          const visible = Math.abs(d) <= 1;
          const isCenter = d === 0;
          // Side cards peek at ±66 % of the card width; far cards are parked off-screen on their side.
          const x = isCenter ? 0 : d < 0 ? (d === -1 ? -66 : -150) : d === 1 ? 66 : 150;
          const style = {
            transform: `translate(-50%, 0) translateX(${x}%) scale(${isCenter ? 1 : 0.84})`,
            opacity: visible ? (isCenter ? 1 : 0.72) : 0,
            zIndex: isCenter ? 20 : visible ? 10 : 0,
            pointerEvents: visible ? ('auto' as const) : ('none' as const),
          };
          const card = (
            <>
              <img src={p.image} alt={isCenter ? p.name : ''} className="absolute inset-0 h-full w-full object-cover" loading={visible ? 'eager' : 'lazy'} draggable={false} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/10" />
              <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold text-brand-800">{p.kindLabel}</span>
              {isCenter && <FavoriteButton active={favorites.includes(p.id)} onToggle={() => onToggleFavorite(p.id)} className="absolute right-3 top-3" />}
              <div className="absolute inset-x-0 bottom-0 p-3.5 text-white">
                <p className="text-[15px] font-extrabold leading-tight truncate">{p.name}</p>
                <div className="mt-1 flex items-center gap-2 text-[11px] text-white/85">
                  <span className="inline-flex items-center gap-1">
                    <MapPin size={11} /> {p.city}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Star size={11} className="fill-star text-star" /> {p.rating.toFixed(1)} ({p.reviews})
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-[13px] font-extrabold text-lime-400">{p.price}</span>
                  {isCenter && <span className="rounded-full bg-lime-500 px-3 py-1 text-[11px] font-bold text-brand-900">Réserver</span>}
                </div>
              </div>
            </>
          );
          const cls = 'absolute left-1/2 top-2 h-[212px] w-[64%] overflow-hidden rounded-[20px] bg-ink-100 shadow-float transition-[transform,opacity] duration-700 ease-out';
          return isCenter ? (
            <Link key={p.id} to={p.to} className={cls} style={style} aria-current="true">
              {card}
            </Link>
          ) : (
            <button
              key={p.id}
              type="button"
              className={`${cls} text-left`}
              style={style}
              onClick={() => setIndex(i)}
              aria-label={`Afficher ${p.name}`}
              tabIndex={visible ? 0 : -1}
            >
              {card}
            </button>
          );
        })}
      </div>

      {n > 1 && (
        <div className="mt-1 flex items-center justify-center gap-3 px-4">
          <button type="button" onClick={prev} aria-label="Offre précédente" className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-ink-900 shadow-card">
            <ChevronLeft size={16} />
          </button>
          <div className="flex items-center gap-1.5" aria-hidden="true">
            {items.map((p, i) => (
              <span key={p.id} className={`h-1.5 rounded-full transition-all duration-500 ${i === index ? 'w-5 bg-brand-700' : 'w-1.5 bg-ink-200'}`} />
            ))}
          </div>
          <button type="button" onClick={next} aria-label="Offre suivante" className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-ink-900 shadow-card">
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
