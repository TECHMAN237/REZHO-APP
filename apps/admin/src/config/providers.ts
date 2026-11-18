import { BedDouble, Car, CalendarCheck, CalendarDays, LayoutDashboard, Settings, UtensilsCrossed, Wallet, type LucideIcon } from 'lucide-react';
import { IMG, type ProviderKind } from '@rezho/shared';

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
}

export interface ProviderConfig {
  kind: ProviderKind;
  /** Sidebar subtitle under the REZHO wordmark */
  spaceLabel: string;
  /** Login left-panel badge */
  badge: string;
  heroImage: string;
  heroHeadline: string;
  heroFeatures: { icon: LucideIcon; label: string }[];
  loginSubtitle: string;
  basePath: string;
  inventoryLabel: string;
  inventoryPath: string;
  nav: NavItem[];
  dashboardSubtitle: string;
}

const base = (kind: ProviderKind) => `/partner/${kind}`;

export const PROVIDERS: Record<ProviderKind, ProviderConfig> = {
  hotels: {
    kind: 'hotels',
    spaceLabel: 'Espace Prestataire',
    badge: 'Espace Prestataire',
    heroImage: IMG.hotelNight,
    heroHeadline: 'Gérez votre établissement et vos réservations en toute simplicité.',
    heroFeatures: [
      { icon: BedDouble, label: 'Gérez vos chambres' },
      { icon: CalendarCheck, label: 'Suivez vos réservations' },
      { icon: Wallet, label: 'Recevez vos paiements' },
    ],
    loginSubtitle: 'Accédez à votre espace hôtelier REZHO',
    basePath: base('hotels'),
    inventoryLabel: 'Chambres',
    inventoryPath: `${base('hotels')}/rooms`,
    dashboardSubtitle: 'Voici un aperçu de votre établissement.',
    nav: [
      { to: `${base('hotels')}/dashboard`, label: 'Tableau de bord', icon: LayoutDashboard },
      { to: `${base('hotels')}/rooms`, label: 'Chambres', icon: BedDouble },
      { to: `${base('hotels')}/reservations`, label: 'Réservations', icon: CalendarCheck },
      { to: `${base('hotels')}/payments`, label: 'Paiements', icon: Wallet },
      { to: `${base('hotels')}/availability`, label: 'Disponibilités', icon: CalendarDays },
      { to: `${base('hotels')}/settings`, label: 'Paramètres', icon: Settings },
    ],
  },
  restaurants: {
    kind: 'restaurants',
    spaceLabel: 'Espace Restaurant',
    badge: 'Espace Restaurant',
    heroImage: IMG.restaurant2,
    heroHeadline: 'Gérez votre restaurant et vos réservations en toute simplicité.',
    heroFeatures: [
      { icon: UtensilsCrossed, label: 'Gérez votre menu' },
      { icon: CalendarCheck, label: 'Suivez vos réservations' },
      { icon: Wallet, label: 'Recevez vos paiements' },
    ],
    loginSubtitle: 'Accédez à votre espace restaurant REZHO',
    basePath: base('restaurants'),
    inventoryLabel: 'Menu & Plats',
    inventoryPath: `${base('restaurants')}/menu`,
    dashboardSubtitle: 'Voici un aperçu de votre restaurant.',
    nav: [
      { to: `${base('restaurants')}/dashboard`, label: 'Tableau de bord', icon: LayoutDashboard },
      { to: `${base('restaurants')}/menu`, label: 'Menu & Plats', icon: UtensilsCrossed },
      { to: `${base('restaurants')}/reservations`, label: 'Réservations', icon: CalendarCheck },
      { to: `${base('restaurants')}/payments`, label: 'Paiements', icon: Wallet },
      { to: `${base('restaurants')}/availability`, label: 'Disponibilités', icon: CalendarDays },
      { to: `${base('restaurants')}/settings`, label: 'Paramètres', icon: Settings },
    ],
  },
  vehicles: {
    kind: 'vehicles',
    spaceLabel: 'Location de voitures',
    badge: 'Espace Location de voitures',
    heroImage: IMG.suv4,
    heroHeadline: 'Gérez votre flotte, vos réservations et vos locations en toute simplicité.',
    heroFeatures: [
      { icon: Car, label: 'Gérez vos véhicules' },
      { icon: CalendarCheck, label: 'Suivez vos réservations' },
      { icon: Wallet, label: 'Recevez vos paiements' },
    ],
    loginSubtitle: 'Accédez à votre espace location REZHO',
    basePath: base('vehicles'),
    inventoryLabel: 'Véhicules',
    inventoryPath: `${base('vehicles')}/fleet`,
    dashboardSubtitle: 'Voici un aperçu de votre activité de location.',
    nav: [
      { to: `${base('vehicles')}/dashboard`, label: 'Tableau de bord', icon: LayoutDashboard },
      { to: `${base('vehicles')}/fleet`, label: 'Véhicules', icon: Car },
      { to: `${base('vehicles')}/reservations`, label: 'Réservations', icon: CalendarCheck },
      { to: `${base('vehicles')}/payments`, label: 'Paiements', icon: Wallet },
      { to: `${base('vehicles')}/availability`, label: 'Disponibilités', icon: CalendarDays },
      { to: `${base('vehicles')}/settings`, label: 'Paramètres', icon: Settings },
    ],
  },
};

export const PROVIDER_KINDS: ProviderKind[] = ['hotels', 'restaurants', 'vehicles'];

export const KIND_LABEL: Record<ProviderKind, string> = {
  hotels: 'Hôtel / Hébergement',
  restaurants: 'Restaurant',
  vehicles: 'Location de véhicules',
};
