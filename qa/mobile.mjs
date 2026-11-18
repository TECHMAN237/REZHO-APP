/**
 * Playwright smoke test for the REZHO customer mobile app.
 * Usage: node qa/mobile.mjs  (dev server must run on http://localhost:5173)
 * Uses the locally installed Chrome (channel: 'chrome').
 */
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const BASE = process.env.MOBILE_URL ?? 'http://localhost:5173';
const OUT = path.resolve('qa/screenshots/mobile');
fs.mkdirSync(OUT, { recursive: true });

const results = [];
const consoleErrors = [];

function log(name, ok, info = '') {
  results.push({ name, ok, info });
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${info ? ' — ' + info : ''}`);
}

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'fr-FR' });
const page = await context.newPage();
page.on('console', (m) => {
  if (m.type() === 'error') consoleErrors.push(m.text());
});
page.on('pageerror', (e) => consoleErrors.push(`pageerror: ${e.message}`));

const shot = async (name) => {
  await page.waitForTimeout(350);
  await page.screenshot({ path: path.join(OUT, `${name}.png`), fullPage: false, animations: 'disabled' });
};

async function expectVisible(sel, name) {
  try {
    await page.locator(sel).first().waitFor({ state: 'visible', timeout: 8000 });
    log(name, true);
    return true;
  } catch (e) {
    log(name, false, `not visible: ${sel}`);
    return false;
  }
}

async function noOverflow(name) {
  const w = await page.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]);
  log(`${name}: no horizontal overflow`, w[0] <= w[1] + 1, `${w[0]} vs ${w[1]}`);
}

try {
  // Splash → onboarding
  await page.goto(`${BASE}/`);
  await expectVisible('text=Réservez facilement', 'Splash renders');
  await shot('01-splash');
  await page.waitForURL(/onboarding/, { timeout: 6000 });
  await expectVisible('text=Hébergements', 'Onboarding slide 1');
  await shot('02-onboarding-1');
  await page.getByRole('button', { name: 'Suivant' }).click();
  await expectVisible('text=Restaurants', 'Onboarding slide 2');
  await page.getByRole('button', { name: 'Suivant' }).click();
  await expectVisible('text=Location de', 'Onboarding slide 3');
  await shot('03-onboarding-3');
  await page.getByRole('button', { name: 'Commencer' }).click();
  await page.waitForURL(/login/);
  await expectVisible('text=Bon retour', 'Login screen');
  await shot('04-login');

  // Register validation
  await page.getByRole('link', { name: 'S’inscrire' }).click();
  await page.waitForURL(/register/);
  await shot('05-register');
  await page.getByRole('button', { name: 'S’inscrire' }).click();
  await expectVisible('text=Entrez votre nom complet', 'Register validation errors');
  await page.goBack();

  // Login
  await page.getByRole('button', { name: 'Se connecter' }).click();
  await page.waitForURL(/home/, { timeout: 8000 });
  await expectVisible('text=Bonjour,', 'Home after login');
  await noOverflow('Home');
  await shot('06-home');

  // Accommodation flow
  await page.getByRole('link', { name: 'Hébergements' }).first().click();
  await page.waitForURL(/accommodations/);
  await expectVisible('text=Hébergements (', 'Accommodation list');
  await shot('07-accommodations');
  await page.getByRole('button', { name: 'Appartements' }).click();
  await expectVisible('text=Résidence Nki', 'Type filter works');
  await page.getByRole('button', { name: 'Tous' }).click();
  await page.getByRole('link', { name: /Hôtel La Vallée/ }).first().click();
  await page.waitForURL(/accommodations\/acc_vallee/);
  await expectVisible('h1:has-text("Hôtel La Vallée")', 'Accommodation detail');
  await shot('08-accommodation-detail');
  await page.getByRole('tab', { name: 'Équipements' }).click();
  await expectVisible('text=Équipements de l’hôtel', 'Amenities tab');
  await shot('09-accommodation-amenities');
  await page.getByRole('button', { name: 'Réserver' }).click();
  await page.waitForURL(/booking\/accommodation/);
  await expectVisible('text=Détails de la réservation', 'Booking form');
  await shot('10-booking-form');
  await page.getByRole('button', { name: 'Continuer' }).click();
  await page.waitForURL(/checkout/);
  await expectVisible('text=Récapitulatif', 'Checkout / payment');
  await shot('11-payment');
  await page.getByRole('button', { name: /Payer/ }).click();
  await page.waitForURL(/booking-success/, { timeout: 10000 });
  await expectVisible('text=Réservation confirmée', 'Booking success');
  await shot('12-success');
  await page.getByRole('link', { name: 'Voir ma réservation' }).click();
  await page.waitForURL(/bookings\//);
  await expectVisible('text=Paiement', 'Booking detail');
  await shot('13-booking-detail');

  // Bookings list + cancel
  await page.goto(`${BASE}/bookings`);
  await expectVisible('text=Mes réservations', 'Bookings list');
  await shot('14-bookings');
  await page.getByRole('link', { name: /Hôtel La Vallée/ }).first().click();
  await page.getByRole('button', { name: 'Annuler la réservation' }).click();
  await page.getByRole('button', { name: 'Oui, annuler' }).click();
  await expectVisible('text=Annulée', 'Booking cancelled');

  // Restaurant flow
  await page.goto(`${BASE}/restaurants`);
  await expectVisible('text=Restaurants (', 'Restaurant list');
  await shot('15-restaurants');
  await page.getByRole('link', { name: /Le Bantu/ }).first().click();
  await expectVisible('h1:has-text("Le Bantu")', 'Restaurant detail');
  await shot('16-restaurant-detail');
  await page.getByRole('button', { name: 'Réserver une table' }).click();
  await page.waitForURL(/booking\/restaurant/);
  await shot('17-restaurant-reservation');
  await page.getByRole('button', { name: 'Continuer' }).click();
  await page.waitForURL(/checkout/);
  await page.getByRole('button', { name: 'Confirmer la réservation' }).click();
  await page.waitForURL(/booking-success/, { timeout: 10000 });
  await expectVisible('text=Table réservée', 'Restaurant reservation success');

  // Vehicle flow
  await page.goto(`${BASE}/vehicles`);
  await expectVisible('text=Véhicules (', 'Vehicle list');
  await shot('18-vehicles');
  await page.getByRole('link', { name: /Toyota Corolla/ }).first().click();
  await expectVisible('h1:has-text("Toyota Corolla")', 'Vehicle detail');
  await shot('19-vehicle-detail');
  await page.getByRole('button', { name: 'Réserver' }).click();
  await page.waitForURL(/booking\/vehicle/);
  await shot('20-vehicle-booking');
  await page.getByRole('button', { name: 'Continuer' }).click();
  await expectVisible('text=Entrez le numéro de permis', 'Vehicle form validation');
  await page.getByLabel('Numéro de permis de conduire').fill('CM-2019-123456');
  await page.getByRole('checkbox').last().click();
  await page.getByRole('button', { name: 'Continuer' }).click();
  await page.waitForURL(/checkout/);
  await page.getByRole('radio', { name: /Carte bancaire/ }).click();
  await page.getByLabel('CVC').fill('123');
  await page.getByRole('button', { name: /Payer/ }).click();
  await page.waitForURL(/booking-success/, { timeout: 10000 });
  await expectVisible('text=Location confirmée', 'Vehicle booking success');

  // Favorites, profile, settings, assistant, search
  await page.goto(`${BASE}/favorites`);
  await expectVisible('text=Mes favoris', 'Favorites');
  await shot('21-favorites');
  await page.goto(`${BASE}/profile`);
  await expectVisible('text=Se déconnecter', 'Profile');
  await shot('22-profile');
  await page.getByRole('link', { name: 'Mes informations' }).click();
  await page.waitForURL(/profile\/edit/);
  await page.getByLabel('Nom complet').fill('Ayesha Khan-Ndongo');
  await page.getByRole('button', { name: 'Enregistrer' }).click();
  await page.waitForURL(/\/profile$/);
  await expectVisible('text=Ayesha Khan-Ndongo', 'Profile edited');
  await page.goto(`${BASE}/profile/settings`);
  await expectVisible('text=Paramètres', 'Settings');
  await page.goto(`${BASE}/profile/payment-methods`);
  await expectVisible('text=Moyens de paiement', 'Payment methods');
  await page.goto(`${BASE}/profile/help`);
  await expectVisible('text=Questions fréquentes', 'Help');
  await page.goto(`${BASE}/search`);
  await page.getByLabel('Rechercher').fill('kribi');
  await expectVisible('text=Hôtel Ilomba', 'Search results');
  await shot('23-search');
  await page.goto(`${BASE}/home`);
  await page.getByRole('button', { name: 'Ouvrir l’assistant REZHO' }).click();
  await expectVisible('text=Assistant REZHO', 'Assistant panel opens');
  await page.getByLabel('Message').fill('Un hôtel pas cher à Yaoundé ?');
  await page.getByRole('button', { name: 'Envoyer' }).click();
  await page.locator('text=Résidence Nki').waitFor({ timeout: 6000 });
  log('Assistant replies', true);
  await shot('24-assistant');

  // Direct deep link to protected route after logout
  await page.goto(`${BASE}/profile`);
  await page.getByRole('button', { name: 'Se déconnecter' }).click();
  await page.getByRole('button', { name: 'Se déconnecter' }).last().click();
  await page.waitForURL(/login/);
  await page.goto(`${BASE}/bookings`);
  await page.waitForURL(/login/);
  log('Protected route redirects to login', true);
} catch (e) {
  log('Unexpected error', false, e.message);
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
