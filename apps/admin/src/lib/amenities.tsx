import { Bath, Briefcase, Car, ChefHat, Coffee, Dumbbell, Lock, Mountain, Shield, Snowflake, Tv, UtensilsCrossed, WashingMachine, Waves, Wifi, Wine, type LucideIcon } from 'lucide-react';
import type { AmenityKey } from '@rezho/shared';

export const AMENITY_ICON: Record<AmenityKey, LucideIcon> = {
  wifi: Wifi,
  pool: Waves,
  ac: Snowflake,
  parking: Car,
  gym: Dumbbell,
  restaurant: UtensilsCrossed,
  tv: Tv,
  bathroom: Bath,
  minibar: Wine,
  kitchen: ChefHat,
  balcony: Mountain,
  security: Shield,
  safe: Lock,
  desk: Briefcase,
  breakfast: Coffee,
  laundry: WashingMachine,
};

export const ROOM_AMENITIES: AmenityKey[] = ['wifi', 'ac', 'tv', 'bathroom', 'minibar', 'safe', 'balcony', 'desk', 'kitchen', 'breakfast', 'parking', 'pool', 'gym', 'security', 'laundry', 'restaurant'];

export const VEHICLE_EQUIPMENT = ['Climatisation', 'GPS', 'Caméra de recul', 'Bluetooth', 'Apple CarPlay', 'Régulateur de vitesse', 'Cuir', 'Toit ouvrant', 'Sièges chauffants', 'Barres de toit', 'Roue de secours', 'Attelage', '4 roues motrices'];
