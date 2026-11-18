import { NavLink } from 'react-router-dom';
import { CalendarDays, Heart, Home, User } from 'lucide-react';

const TABS = [
  { to: '/home', label: 'Accueil', icon: Home },
  { to: '/bookings', label: 'Réservations', icon: CalendarDays },
  { to: '/favorites', label: 'Favoris', icon: Heart },
  { to: '/profile', label: 'Profil', icon: User },
];

export function BottomNav() {
  return (
    <nav
      aria-label="Navigation principale"
      className="absolute bottom-0 left-0 right-0 z-30 bg-white border-t border-ink-100 px-2 pb-[max(8px,var(--safe-bottom))] pt-2"
    >
      <ul className="grid grid-cols-4">
        {TABS.map(({ to, label, icon: Icon }) => (
          <li key={to}>
            <NavLink
              to={to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 h-12 rounded-[12px] text-[10px] font-semibold transition-colors ${
                  isActive ? 'text-brand-700' : 'text-ink-500 hover:text-ink-700'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={21} strokeWidth={isActive ? 2.4 : 2} className={isActive ? 'fill-brand-100' : ''} />
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
