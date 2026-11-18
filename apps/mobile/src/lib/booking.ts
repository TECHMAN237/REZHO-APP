export const SERVICE_FEE = 2500;

export const ACCOMMODATION_OPTIONS = [
  { id: 'breakfast', label: 'Petit-déjeuner', price: 5000, perPerson: true },
  { id: 'shuttle', label: 'Navette aéroport', price: 3000, perPerson: false },
  { id: 'early', label: 'Arrivée anticipée', price: 10000, perPerson: false },
] as const;

export const VEHICLE_OPTIONS = [
  { id: 'driver', label: 'Chauffeur professionnel', price: 15000, perDay: true },
  { id: 'gps', label: 'GPS supplémentaire', price: 2000, perDay: true },
  { id: 'child', label: 'Siège enfant', price: 3000, perDay: false },
  { id: 'insurance', label: 'Assurance tous risques', price: 8000, perDay: true },
] as const;

export const PICKUP_LOCATIONS: Record<string, string[]> = {
  Yaoundé: ['Agence AutoDrive, Carrefour Warda', 'Aéroport de Yaoundé-Nsimalen', 'Gare voyageurs, Yaoundé', 'Livraison à l’adresse du client'],
  Douala: ['Agence AutoDrive, Bonapriso', 'Aéroport international de Douala', 'Gare de Bessengue', 'Livraison à l’adresse du client'],
  Buea: ['Agence Fako Car Rental, Molyko', 'Livraison à l’adresse du client'],
  Limbe: ['Agence Down Beach', 'Livraison à l’adresse du client'],
  Kribi: ['Agence Kribi Auto Location, Centre-ville', 'Livraison à l’adresse du client'],
  Bamenda: ['Agence North West Rentals, Commercial Avenue', 'Livraison à l’adresse du client'],
};

export const RESTAURANT_TIME_SLOTS = ['12:00', '12:30', '13:00', '13:30', '19:00', '19:30', '20:00', '20:30', '21:00'];
