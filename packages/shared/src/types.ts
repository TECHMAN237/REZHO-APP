export type City = 'Douala' | 'Yaoundé' | 'Buea' | 'Limbe' | 'Kribi' | 'Bamenda';
export const CITIES: City[] = ['Yaoundé', 'Douala', 'Buea', 'Limbe', 'Kribi', 'Bamenda'];

export type AccommodationType = 'hotel' | 'apartment' | 'guesthouse' | 'house';
export const ACCOMMODATION_TYPE_LABEL: Record<AccommodationType, string> = {
  hotel: 'Hôtel',
  apartment: 'Appartement',
  guesthouse: 'Auberge',
  house: 'Maison',
};

export type AmenityKey =
  | 'wifi'
  | 'pool'
  | 'ac'
  | 'parking'
  | 'gym'
  | 'restaurant'
  | 'tv'
  | 'bathroom'
  | 'minibar'
  | 'kitchen'
  | 'balcony'
  | 'security'
  | 'safe'
  | 'desk'
  | 'breakfast'
  | 'laundry';

export const AMENITY_LABEL: Record<AmenityKey, string> = {
  wifi: 'Wi-Fi gratuit',
  pool: 'Piscine',
  ac: 'Climatisation',
  parking: 'Parking',
  gym: 'Salle de sport',
  restaurant: 'Restaurant',
  tv: 'Télévision Smart',
  bathroom: 'Salle de bain privée',
  minibar: 'Mini-bar',
  kitchen: 'Cuisine équipée',
  balcony: 'Balcon',
  security: 'Sécurité 24h/24',
  safe: 'Coffre-fort',
  desk: 'Bureau',
  breakfast: 'Petit-déjeuner',
  laundry: 'Blanchisserie',
};

export interface RoomOption {
  id: string;
  name: string;
  bed: string;
  capacity: number;
  pricePerNight: number;
  image: string;
  amenities: AmenityKey[];
}

export interface Accommodation {
  id: string;
  name: string;
  type: AccommodationType;
  city: City;
  address: string;
  rating: number;
  reviews: number;
  pricePerNight: number;
  discount?: number;
  distanceKm: number;
  images: string[];
  description: string;
  amenities: AmenityKey[];
  rooms: RoomOption[];
  featured?: boolean;
  capacity: number;
}

export type DishCategory = 'Entrées' | 'Plats principaux' | 'Desserts' | 'Boissons';
export const DISH_CATEGORIES: DishCategory[] = ['Entrées', 'Plats principaux', 'Desserts', 'Boissons'];

export interface Dish {
  id: string;
  name: string;
  category: DishCategory;
  price: number;
  promoPercent?: number;
  image: string;
  description: string;
  available: boolean;
  availableDays?: number[]; // 1..7 (Mon..Sun)
}

export interface Restaurant {
  id: string;
  name: string;
  city: City;
  address: string;
  cuisine: string;
  rating: number;
  reviews: number;
  priceLevel: 1 | 2 | 3;
  distanceKm: number;
  images: string[];
  description: string;
  openingHours: string;
  menu: Dish[];
  featured?: boolean;
  avgPrice: number;
}

export type VehicleType = 'Berline' | 'SUV' | 'Pick-up' | 'Citadine' | '4x4';
export const VEHICLE_TYPES: VehicleType[] = ['Berline', 'SUV', 'Citadine', 'Pick-up', '4x4'];
export type Transmission = 'Automatique' | 'Manuelle';
export type Fuel = 'Essence' | 'Diesel' | 'Hybride' | 'Électrique';

export interface Vehicle {
  id: string;
  brand: string;
  model: string;
  year: number;
  name: string;
  type: VehicleType;
  transmission: Transmission;
  fuel: Fuel;
  seats: number;
  color: string;
  mileage: number;
  pricePerDay: number;
  deposit: number;
  longTermDiscount?: number;
  images: string[];
  description: string;
  equipment: string[];
  city: City;
  agency: string;
  rating: number;
  reviews: number;
  available: boolean;
  featured?: boolean;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  city?: City;
}

export type BookingKind = 'accommodation' | 'restaurant' | 'vehicle';
export type BookingStatus = 'confirmed' | 'ongoing' | 'completed' | 'cancelled' | 'pending';
export type PaymentMethod = 'mobile_money' | 'card' | 'on_site';
export type PaymentStatus = 'paid' | 'pending' | 'refunded' | 'failed';

export const BOOKING_STATUS_LABEL: Record<BookingStatus, string> = {
  confirmed: 'Confirmée',
  ongoing: 'En cours',
  completed: 'Terminée',
  cancelled: 'Annulée',
  pending: 'En attente',
};

export const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> = {
  mobile_money: 'Mobile Money',
  card: 'Carte bancaire',
  on_site: 'Paiement sur place',
};

export const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
  paid: 'Payé',
  pending: 'En attente',
  refunded: 'Remboursé',
  failed: 'Échoué',
};

export interface PriceLine {
  label: string;
  amount: number;
}

export interface Booking {
  id: string;
  ref: string;
  kind: BookingKind;
  status: BookingStatus;
  itemId: string;
  itemName: string;
  itemImage: string;
  city: City;
  createdAt: string; // ISO datetime
  startDate: string; // ISO date
  endDate?: string; // ISO date
  time?: string;
  guests: number;
  lines: PriceLine[];
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  details: Record<string, string>;
}

/* ---------- Provider side ---------- */

export type ProviderKind = 'hotels' | 'restaurants' | 'vehicles';

export interface ProviderReservation {
  id: string;
  ref: string;
  customer: Customer;
  itemId: string;
  itemName: string;
  itemImage: string;
  startDate: string;
  endDate?: string;
  time?: string;
  guests?: number;
  amount: number;
  status: BookingStatus;
  createdAt: string;
  paymentMethod: PaymentMethod;
  note?: string;
}

export interface Payment {
  id: string;
  ref: string;
  reservationRef: string;
  customer: Customer;
  amount: number;
  date: string;
  status: 'completed' | 'pending' | 'failed';
  method: PaymentMethod;
}

export type RoomStatus = 'available' | 'occupied' | 'unavailable';
export const ROOM_STATUS_LABEL: Record<RoomStatus, string> = {
  available: 'Disponible',
  occupied: 'Occupée',
  unavailable: 'Indisponible',
};

export type RoomType = 'Simple' | 'Double' | 'Suite' | 'Studio' | 'Appartement' | 'Maison';
export const ROOM_TYPES: RoomType[] = ['Simple', 'Double', 'Suite', 'Studio', 'Appartement', 'Maison'];

export interface MediaItem {
  id: string;
  kind: 'image' | 'video';
  url: string;
  name: string;
  duration?: string;
}

export interface ProviderRoom {
  id: string;
  number: string;
  name: string;
  type: RoomType;
  capacity: number;
  bedrooms: number;
  bathrooms: number;
  surface: number;
  address: string;
  city: City;
  description: string;
  media: MediaItem[];
  amenities: AmenityKey[];
  pricePerNight: number;
  weekendPrice?: number;
  promoPercent?: number;
  unavailableDates: string[];
  status: RoomStatus;
  createdAt: string;
}

export type VehicleStatus = 'available' | 'rented' | 'unavailable' | 'maintenance';
export const VEHICLE_STATUS_LABEL: Record<VehicleStatus, string> = {
  available: 'Disponible',
  rented: 'Loué',
  unavailable: 'Indisponible',
  maintenance: 'Maintenance',
};

export interface FleetVehicle {
  id: string;
  brand: string;
  model: string;
  year: number;
  name: string;
  type: VehicleType;
  description: string;
  media: MediaItem[];
  transmission: Transmission;
  fuel: Fuel;
  color: string;
  mileage: number;
  seats: number;
  equipment: string[];
  pricePerDay: number;
  deposit?: number;
  longTermDiscount?: number;
  availableDays: number[];
  unavailableDates: string[];
  status: VehicleStatus;
  createdAt: string;
}

export interface ProviderDish extends Dish {
  media: MediaItem[];
  createdAt: string;
}

export interface ProviderProfile {
  kind: ProviderKind;
  name: string;
  city: City;
  address: string;
  phone: string;
  email: string;
  image: string;
  managerName: string;
  managerAvatar: string;
  description: string;
}
