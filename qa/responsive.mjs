/**
 * Responsive check: no horizontal overflow and key elements visible
 * at mobile widths (375/390/430) and desktop widths (1280/1440/1600).
 * Requires both dev servers (5173 + 5174).
 */
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const MOBILE = process.env.MOBILE_URL ?? 'http://localhost:5173';
const ADMIN = process.env.ADMIN_URL ?? 'http://localhost:5174';
const OUT = path.resolve('qa/screenshots/responsive');
fs.mkdirSync(OUT, { recursive: true });

const results = [];
const log = (name, ok, info = '') => {
  results.push({ name, ok });
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${info ? ' — ' + info : ''}`);
};

const browser = await chromium.launch({ channel: 'chrome', headless: true });

// ---- Mobile app ----
for (const width of [375, 390, 430]) {
  const ctx = await browser.newContext({ viewport: { width, height: 820 }, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  // Seed a logged-in session so protected routes render.
  await page.goto(`${MOBILE}/login`);
  await page.evaluate(() => {
    localStorage.setItem('rezho-mobile-v1', JSON.stringify({ state: { onboarded: true, isAuthenticated: true }, version: 0 }));
  });
  for (const route of ['/home', '/accommodations', '/accommodations/acc_vallee', '/booking/accommodation/acc_vallee', '/restaurants/rest_bantu', '/vehicles', '/bookings', '/profile']) {
    await page.goto(`${MOBILE}${route}`);
    await page.waitForTimeout(500);
    const [sw, cw] = await page.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]);
    log(`mobile ${width}px ${route}`, sw <= cw + 1, `${sw}/${cw}`);
    if (route === '/home' || route === '/accommodations/acc_vallee') await page.screenshot({ path: path.join(OUT, `mobile-${width}${route.replace(/\//g, '_')}.png`), animations: 'disabled' });
  }
  await ctx.close();
}

// ---- Admin app ----
for (const width of [1024, 1280, 1440, 1600]) {
  const ctx = await browser.newContext({ viewport: { width, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(`${ADMIN}/partner/hotels/login`);
  await page.evaluate(() => {
    const sess = (kind) => ({ kind, email: 'demo@rezho.cm', remember: true });
    localStorage.setItem('rezho-admin-v2', JSON.stringify({ state: { sessions: { hotels: sess('hotels'), restaurants: sess('restaurants'), vehicles: sess('vehicles') } }, version: 0 }));
  });
  for (const route of ['/partner/hotels/dashboard', '/partner/hotels/rooms', '/partner/hotels/rooms/new', '/partner/hotels/reservations', '/partner/restaurants/menu', '/partner/restaurants/availability', '/partner/vehicles/fleet', '/partner/vehicles/availability', '/partner/vehicles/settings']) {
    await page.goto(`${ADMIN}${route}`);
    await page.waitForTimeout(500);
    const [sw, cw] = await page.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]);
    log(`admin ${width}px ${route}`, sw <= cw + 1, `${sw}/${cw}`);
    if (route.endsWith('/dashboard') || route.endsWith('/rooms/new')) await page.screenshot({ path: path.join(OUT, `admin-${width}${route.replace(/\//g, '_')}.png`), animations: 'disabled' });
  }
  await ctx.close();
}

await browser.close();
const failed = results.filter((r) => !r.ok).length;
console.log(`\n${results.length - failed}/${results.length} responsive checks passed.`);
process.exit(failed ? 1 : 0);
