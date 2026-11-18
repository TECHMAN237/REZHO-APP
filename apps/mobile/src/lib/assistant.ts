import { ACCOMMODATIONS, RESTAURANTS, VEHICLES, formatFCFA, normalize } from '@rezho/shared';

export const SUGGESTED_QUESTIONS = [
  'Un hôtel pas cher à Yaoundé ?',
  'Où manger du poisson braisé à Douala ?',
  'Louer un SUV pour le week-end',
  'Comment annuler une réservation ?',
  'Quels moyens de paiement acceptez-vous ?',
];

const CITY_KEYS = ['yaounde', 'douala', 'buea', 'limbe', 'kribi', 'bamenda'] as const;

function detectCity(q: string): string | undefined {
  return CITY_KEYS.find((c) => q.includes(c));
}

/**
 * Deterministic, frontend-only "AI" responses. Looks for intents (hotel,
 * restaurant, vehicle, cancel, payment...) and answers from the mock catalog.
 */
export function generateAssistantReply(question: string): string {
  const q = normalize(question);
  const cityKey = detectCity(q);
  const cityLabel = cityKey ? cityKey.charAt(0).toUpperCase() + cityKey.slice(1) : undefined;
  const byCity = <T extends { city: string }>(items: T[]) => (cityKey ? items.filter((i) => normalize(i.city) === cityKey) : items);

  if (/(annul|rembours)/.test(q)) {
    return 'Vous pouvez annuler une réservation depuis l’onglet « Réservations » : ouvrez la réservation puis appuyez sur « Annuler la réservation ». Les paiements Mobile Money et carte sont remboursés sous 48 h pour les annulations faites plus de 24 h avant la date d’arrivée.';
  }
  if (/(paiement|payer|mobile money|orange money|mtn|carte)/.test(q)) {
    return 'REZHO accepte Mobile Money (MTN MoMo et Orange Money), les cartes bancaires Visa / Mastercard, et le paiement sur place pour certains établissements. Vous choisissez la méthode à l’étape « Paiement » de chaque réservation.';
  }
  if (/(hotel|hebergement|chambre|dormir|appartement|auberge|nuit|loger)/.test(q)) {
    const cheap = /(pas cher|economique|moins cher|budget|petit prix)/.test(q);
    let list = byCity(ACCOMMODATIONS).slice();
    list.sort((a, b) => (cheap ? a.pricePerNight - b.pricePerNight : b.rating - a.rating));
    const top = list.slice(0, 3);
    if (!top.length) return 'Je n’ai pas encore d’hébergement dans cette ville, mais vous pouvez explorer Yaoundé, Douala, Buea, Limbe, Kribi et Bamenda.';
    const lines = top.map((a) => `• ${a.name} (${a.city}) – ${formatFCFA(a.pricePerNight)}/nuit, note ${a.rating.toFixed(1)}`).join('\n');
    return `Voici ${cheap ? 'les hébergements les plus abordables' : 'les hébergements les mieux notés'}${cityLabel ? ` à ${cityLabel}` : ''} :\n${lines}\n\nOuvrez « Hébergements » pour voir les photos, les chambres et réserver.`;
  }
  if (/(restaurant|manger|plat|poisson|poulet|ndole|diner|dejeuner|cuisine|table)/.test(q)) {
    let list = byCity(RESTAURANTS).slice();
    const dishQuery = /(poisson|poulet|ndole|crevette|pizza|langouste)/.exec(q)?.[0];
    if (dishQuery) list = list.filter((r) => r.menu.some((d) => normalize(d.name).includes(dishQuery)));
    list.sort((a, b) => b.rating - a.rating);
    const top = list.slice(0, 3);
    if (!top.length) return 'Je n’ai pas trouvé de restaurant correspondant. Essayez « poisson braisé à Limbe » ou « restaurant à Yaoundé ».';
    const lines = top
      .map((r) => `• ${r.name} (${r.city}) – ${r.cuisine}, note ${r.rating.toFixed(1)}, env. ${formatFCFA(r.avgPrice)}/pers.`)
      .join('\n');
    return `Mes suggestions${cityLabel ? ` à ${cityLabel}` : ''} :\n${lines}\n\nVous pouvez réserver une table directement depuis la fiche du restaurant.`;
  }
  if (/(voiture|vehicule|louer|location|suv|4x4|berline|conduire|chauffeur)/.test(q)) {
    let list = byCity(VEHICLES).filter((v) => v.available);
    const type = /(suv|4x4|berline|pick-?up|citadine)/.exec(q)?.[0];
    if (type) list = list.filter((v) => normalize(v.type).includes(type.replace('-', '')));
    list.sort((a, b) => a.pricePerDay - b.pricePerDay);
    const top = list.slice(0, 3);
    if (!top.length) return 'Aucun véhicule disponible pour ces critères. Essayez « SUV à Yaoundé » ou « berline à Douala ».';
    const lines = top.map((v) => `• ${v.name} – ${v.transmission}, ${v.seats} places, ${formatFCFA(v.pricePerDay)}/jour`).join('\n');
    return `Véhicules disponibles${cityLabel ? ` à ${cityLabel}` : ''} :\n${lines}\n\nLa caution est restituée au retour du véhicule.`;
  }
  if (/(bonjour|salut|hello|bonsoir)/.test(q)) {
    return 'Bonjour ! Dites-moi ce que vous cherchez : un hôtel, un restaurant ou un véhicule, et dans quelle ville.';
  }
  if (/(merci)/.test(q)) {
    return 'Avec plaisir ! Bon séjour au Cameroun avec REZHO.';
  }
  return 'Je peux vous aider à trouver un hébergement, un restaurant ou un véhicule. Par exemple : « un hôtel à Kribi avec piscine » ou « louer une berline à Douala ».';
}
