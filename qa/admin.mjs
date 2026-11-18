/**
 * Playwright smoke test for the REZHO provider dashboards (hotels, restaurants, vehicles).
 * Usage: node qa/admin.mjs  (dev server must run on http://localhost:5174)
 */
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const BASE = process.env.ADMIN_URL ?? 'http://localhost:5174';
const OUT = path.resolve('qa/screenshots/admin');
fs.mkdirSync(OUT, { recursive: true });

const results = [];
const consoleErrors = [];
const log = (name, ok, info = '') => {
  results.push({ name, ok, info });
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${info ? ' — ' + info : ''}`);
};

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'fr-FR' });
const page = await context.newPage();
page.on('console', (m) => m.type() === 'error' && consoleErrors.push(m.text()));
page.on('pageerror', (e) => consoleErrors.push(`pageerror: ${e.message}`));

const shot = async (name) => {
  await page.waitForTimeout(350);
  await page.screenshot({ path: path.join(OUT, `${name}.png`), fullPage: false, animations: 'disabled' });
};
async function expectVisible(sel, name) {
  try {
    await page.locator(sel).first().waitFor({ state: 'visible', timeout: 8000 });
    log(name, true);
  } catch {
    log(name, false, `not visible: ${sel}`);
  }
}
async function noOverflow(name) {
  const w = await page.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]);
  log(`${name}: no horizontal overflow`, w[0] <= w[1] + 1, `${w[0]} vs ${w[1]}`);
}

try {
  // ---------- Portal + per-space login ----------
  await page.goto(`${BASE}/partner/login`);
  await expectVisible('text=Espace Partenaire REZHO', 'Portal page lists the three spaces');
  await shot('00-portal');
  await page.getByRole('link', { name: /Restaurant/ }).click();
  await page.waitForURL(/partner\/restaurants\/login/);
  await expectVisible('text=Espace Restaurant', 'Restaurant login has its own address and hero');
  await page.goto(`${BASE}/partner/hotels/login`);
  await expectVisible('text=Connexion Partenaire', 'Hotel login page');
  await shot('01-login-hotel');
  await page.getByLabel('Email').fill('bad');
  await page.getByRole('button', { name: 'Se connecter' }).click();
  await expectVisible('text=Entrez une adresse email valide', 'Login validation');
  await page.getByLabel('Email').fill('contact@hotellavallee.cm');
  await page.getByRole('button', { name: 'Se connecter' }).click();
  await page.waitForURL(/partner\/hotels\/dashboard/, { timeout: 8000 });

  // ---------- Isolation: a hotel session must NOT open the other spaces ----------
  await page.goto(`${BASE}/partner/restaurants/dashboard`);
  await page.waitForURL(/partner\/restaurants\/login/, { timeout: 8000 });
  log('Hotel session cannot open restaurant space (redirected to restaurant login)', true);
  await page.goto(`${BASE}/partner/vehicles/fleet`);
  await page.waitForURL(/partner\/vehicles\/login/, { timeout: 8000 });
  log('Hotel session cannot open vehicle space (redirected to vehicle login)', true);
  await page.goto(`${BASE}/partner/hotels/dashboard`);
  await expectVisible('text=Chambres actives', 'Hotel session still valid after blocked attempts');
  log('Sidebar has no establishment switcher', (await page.locator('aside [role="listbox"], aside [aria-haspopup="listbox"]').count()) === 0);

  // ---------- Hotels ----------
  await expectVisible('text=Chambres actives', 'Hotel dashboard');
  await noOverflow('Hotel dashboard');
  await shot('02-hotel-dashboard');
  await page.getByRole('link', { name: 'Chambres', exact: true }).click();
  await page.waitForURL(/hotels\/rooms$/);
  await expectVisible('text=Chambres & Logements', 'Rooms list');
  await shot('03-hotel-rooms');
  const roomsBefore = await page.locator('tbody tr').count();
  await page.getByRole('tab', { name: /Occupées/ }).click();
  await expectVisible('text=Chambre Standard', 'Rooms status filter');
  await page.getByRole('tab', { name: /Toutes/ }).click();

  // Add room wizard
  await page.getByRole('link', { name: 'Ajouter une chambre' }).click();
  await page.waitForURL(/rooms\/new/);
  await shot('04-hotel-wizard-1');
  await page.getByRole('button', { name: 'Suivant' }).click();
  await expectVisible('text=Nom requis', 'Wizard step 1 validation');
  await page.getByLabel('Nom de la chambre').fill('Chambre Panorama');
  await page.getByLabel('Description').fill('Chambre lumineuse avec vue panoramique sur la ville et grand balcon privé.');
  await page.getByLabel('Surface (optionnel)').fill('30');
  await page.getByRole('button', { name: 'Suivant' }).click();
  await expectVisible('text=Glissez-déposez', 'Wizard step 2 media');
  await page.getByRole('button', { name: 'Suivant' }).click();
  await expectVisible('text=Ajoutez au moins une photo', 'Media required validation');
  await page.getByRole('button', { name: 'Utiliser des photos d’exemple' }).click();
  await page.getByRole('button', { name: 'Ajouter chambre-1.jpg' }).click();
  await page.getByRole('button', { name: 'Ajouter chambre-2.jpg' }).click();
  await page.getByRole('button', { name: 'Ajouter une vidéo d’exemple' }).click();
  await expectVisible('text=00:45', 'Video preview with duration');
  await shot('05-hotel-wizard-media');
  await page.getByRole('button', { name: 'Supprimer chambre-2.jpg' }).click();
  await page.getByRole('button', { name: 'Suivant' }).click();
  await expectVisible('text=Équipements de la chambre', 'Wizard step 3 amenities');
  await page.getByRole('checkbox', { name: 'Télévision Smart' }).click();
  await shot('06-hotel-wizard-amenities');
  await page.getByRole('button', { name: 'Suivant' }).click();
  await expectVisible('text=Tarification', 'Wizard step 4 pricing');
  await page.getByLabel('Prix par nuit').fill('35000');
  await page.getByLabel('Promo (optionnel)').fill('10');
  await shot('07-hotel-wizard-pricing');
  await page.getByRole('button', { name: 'Publier la chambre' }).click();
  await page.waitForURL(/rooms\/success/, { timeout: 8000 });
  await expectVisible('text=Chambre publiée avec succès', 'Room publish success');
  await shot('08-hotel-success');
  await page.getByRole('link', { name: 'Voir les chambres' }).click();
  await page.waitForURL(/hotels\/rooms$/);
  await expectVisible('text=Chambre Panorama', 'New room appears in list');
  const roomsAfter = await page.locator('tbody tr').count();
  log('Room count increased', roomsAfter === roomsBefore + 1, `${roomsBefore} → ${roomsAfter}`);

  // Delete a room via row menu
  const row = page.locator('tbody tr', { hasText: 'Chambre Panorama' });
  await row.getByRole('button', { name: 'Plus d’actions' }).click();
  await page.getByRole('menuitem', { name: 'Supprimer' }).click();
  await page.getByRole('button', { name: 'Supprimer' }).click();
  await page.waitForTimeout(300);
  log('Room deleted', (await page.locator('tbody tr', { hasText: 'Chambre Panorama' }).count()) === 0);

  // Reservations
  await page.getByRole('link', { name: 'Réservations' }).click();
  await page.waitForURL(/hotels\/reservations/);
  await expectVisible('text=N° Réservation', 'Hotel reservations table');
  await shot('09-hotel-reservations');
  await page.getByRole('tab', { name: /En attente/ }).click();
  await page.locator('tbody tr').first().click();
  await expectVisible('text=Détails', 'Reservation drawer');
  await page.getByRole('button', { name: 'Confirmer' }).click();
  await expectVisible('text=Réservation confirmée', 'Reservation confirmed toast');
  await page.keyboard.press('Escape');

  // Payments
  await page.getByRole('link', { name: 'Paiements' }).click();
  await page.waitForURL(/hotels\/payments/);
  await expectVisible('text=N° Paiement', 'Hotel payments table');
  await shot('10-hotel-payments');
  await page.getByRole('tab', { name: /En attente/ }).click();
  await page.getByRole('button', { name: 'Marquer payé' }).first().click();
  await expectVisible('text=marqué comme terminé', 'Payment marked completed');

  // Availability
  await page.getByRole('link', { name: 'Disponibilités' }).click();
  await page.waitForURL(/hotels\/availability/);
  await expectVisible('text=Calendrier', 'Hotel availability page');
  await shot('11-hotel-availability');

  // Settings
  await page.getByRole('link', { name: 'Paramètres' }).click();
  await page.waitForURL(/hotels\/settings/);
  await expectVisible('text=Informations de l’établissement', 'Hotel settings');
  await page.getByLabel('Téléphone').first().fill('+237 6 11 22 33 44');
  await page.getByRole('button', { name: 'Enregistrer les modifications' }).click();
  await expectVisible('text=Modifications enregistrées', 'Settings saved');
  await shot('12-hotel-settings');
  await page.getByRole('tab', { name: 'Notifications' }).click();
  await expectVisible('text=Préférences de notification', 'Notifications tab');

  // ---------- Restaurants (own login address) ----------
  await page.goto(`${BASE}/partner/restaurants/dashboard`);
  await page.waitForURL(/partner\/restaurants\/login/);
  await page.getByRole('button', { name: 'Se connecter' }).click();
  await page.waitForURL(/partner\/restaurants\/dashboard/, { timeout: 8000 });
  await expectVisible('text=Bonjour, Le Bantu', 'Restaurant dashboard');
  await shot('13-restaurant-dashboard');
  await page.getByRole('link', { name: 'Menu & Plats' }).click();
  await page.waitForURL(/restaurants\/menu$/);
  await expectVisible('text=Poulet DG', 'Menu list');
  await shot('14-restaurant-menu');
  await page.getByRole('tab', { name: /Boissons/ }).click();
  await expectVisible('text=Bissap frais', 'Menu category filter');
  await page.getByRole('link', { name: 'Ajouter un plat' }).click();
  await page.waitForURL(/menu\/new/);
  await page.getByLabel('Nom du plat').fill('Mbongo tchobi');
  await page.getByLabel('Description').fill('Poisson mijoté dans une sauce noire aux épices grillées.');
  await page.getByRole('button', { name: 'Suivant' }).click();
  await page.getByRole('button', { name: 'Utiliser des photos d’exemple' }).click();
  await page.getByRole('button', { name: 'Ajouter plat-3.jpg' }).click();
  await page.getByRole('button', { name: 'Suivant' }).click();
  await page.getByLabel('Prix du plat').fill('6000');
  await shot('15-restaurant-wizard-pricing');
  await page.getByRole('button', { name: 'Publier le plat' }).click();
  await page.waitForURL(/menu\/success/, { timeout: 8000 });
  await expectVisible('text=Plat publié avec succès', 'Dish publish success');
  await shot('16-restaurant-success');
  await page.getByRole('link', { name: 'Voir le menu' }).click();
  await expectVisible('text=Mbongo tchobi', 'New dish in menu');
  await page.getByRole('link', { name: 'Réservations' }).click();
  await expectVisible('text=Couvert(s)', 'Restaurant reservations (covers column)');
  await shot('17-restaurant-reservations');
  await page.getByRole('link', { name: 'Disponibilités' }).click();
  await expectVisible('text=Jours d’ouverture', 'Restaurant availability (hours)');
  await shot('18-restaurant-availability');
  await page.getByRole('link', { name: 'Paiements' }).click();
  await expectVisible('text=PAY-67321', 'Restaurant payments');

  // ---------- Vehicles (own login address) ----------
  await page.goto(`${BASE}/partner/vehicles/login`);
  await page.getByRole('button', { name: 'Se connecter' }).click();
  await page.waitForURL(/partner\/vehicles\/dashboard/, { timeout: 8000 });
  await expectVisible('text=Véhicules actifs', 'Vehicle dashboard');
  await shot('19-vehicle-dashboard');
  await page.getByRole('link', { name: 'Véhicules', exact: true }).click();
  await page.waitForURL(/vehicles\/fleet$/);
  await expectVisible('text=Ma flotte', 'Fleet list');
  await shot('20-vehicle-fleet');
  await page.getByRole('link', { name: 'Ajouter un véhicule' }).click();
  await page.waitForURL(/fleet\/new/);
  await page.getByLabel('Modèle').fill('Yaris');
  await page.getByLabel('Nom du véhicule (interne)').fill('Toyota Yaris 2023');
  await page.getByLabel('Description').fill('Citadine compacte et économique, parfaite pour la ville.');
  await page.getByRole('button', { name: 'Suivant' }).click();
  await page.getByRole('button', { name: 'Utiliser des photos d’exemple' }).click();
  await page.getByRole('button', { name: 'Ajouter vehicule-1.jpg' }).click();
  await page.getByRole('button', { name: 'Suivant' }).click();
  await expectVisible('text=Caractéristiques du véhicule', 'Vehicle wizard specs');
  await page.getByRole('button', { name: /^\+?\s*GPS$/ }).click();
  await shot('21-vehicle-wizard-specs');
  await page.getByRole('button', { name: 'Suivant' }).click();
  await page.getByLabel('Prix par jour').fill('20000');
  await page.getByLabel('Caution (optionnel)').fill('80000');
  await shot('22-vehicle-wizard-pricing');
  await page.getByRole('button', { name: 'Publier le véhicule' }).click();
  await page.waitForURL(/fleet\/success/, { timeout: 8000 });
  await expectVisible('text=Véhicule publié avec succès', 'Vehicle publish success');
  await shot('23-vehicle-success');
  await page.getByRole('link', { name: 'Voir le véhicule' }).click();
  await expectVisible('text=Toyota Yaris 2023', 'New vehicle in fleet');
  await page.getByRole('link', { name: 'Réservations' }).click();
  await expectVisible('text=Période', 'Vehicle reservations');
  await page.getByRole('link', { name: 'Disponibilités' }).click();
  await expectVisible('text=Locations à venir', 'Fleet availability');
  await shot('24-vehicle-availability');
  await page.getByRole('link', { name: 'Paramètres' }).click();
  await expectVisible('text=Nom de l’agence', 'Vehicle settings');

  // ---------- Tablet width: sidebar collapses behind menu button ----------
  await page.setViewportSize({ width: 900, height: 800 });
  await page.goto(`${BASE}/partner/vehicles/fleet`);
  await expectVisible('button[aria-label="Ouvrir le menu"]', 'Tablet: mobile menu button visible');
  await noOverflow('Tablet fleet page');
  await shot('25-tablet-fleet');

  // ---------- Logout & protected route ----------
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.getByRole('button', { name: 'Se déconnecter' }).click();
  await page.waitForURL(/partner\/vehicles\/login/);
  log('Logout returns to the vehicle space login', true);
  await page.goto(`${BASE}/partner/hotels/dashboard`);
  await expectVisible('text=Chambres actives', 'Hotel session unaffected by vehicle logout');
  await page.getByRole('button', { name: 'Se déconnecter' }).click();
  await page.waitForURL(/partner\/hotels\/login/);
  await page.goto(`${BASE}/partner/hotels/rooms`);
  await page.waitForURL(/partner\/hotels\/login/);
  log('Protected hotel route redirects to hotel login', true);
} catch (e) {
  log('Unexpected error', false, e.message.split('\n')[0]);
  await shot('99-error');
}

await browser.close();
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed.`);
if (consoleErrors.length) {
  console.log('Console errors:');
  for (const e of consoleErrors.slice(0, 20)) console.log('  -', e.slice(0, 200));
} else console.log('No console errors.');
process.exit(failed.length ? 1 : 0);
