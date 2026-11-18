/**
 * Home screen check: iPhone 11 phone frame, popular-offers carousel auto-rotation (10 s),
 * golden promo banner, service cards. Requires the mobile dev server on 5173.
 */
import { chromium } from 'playwright';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const errors = [];
// Desktop viewport → iPhone 11 phone frame
const ctx = await browser.newContext({ viewport: { width: 1280, height: 1000 } });
const page = await ctx.newPage();
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
await page.goto('http://localhost:5173/login');
await page.evaluate(() => localStorage.setItem('rezho-mobile-v1', JSON.stringify({ state: { onboarded: true, isAuthenticated: true }, version: 0 })));
await page.goto('http://localhost:5173/home');
await page.waitForTimeout(2500);
const frame = await page.locator('#phone-frame').boundingBox();
console.log('frame size', Math.round(frame.width), 'x', Math.round(frame.height));
await page.screenshot({ path: 'qa/screenshots/home/home-iphone11-frame.png' });
const center = () => page.locator('[aria-roledescription="carrousel"] a[aria-current="true"] p').first().innerText();
const firstCenter = await center();
await page.waitForTimeout(10500);
const secondCenter = await center();
console.log('center before:', firstCenter, '| after 10s:', secondCenter, '| rotated:', firstCenter !== secondCenter);
await page.screenshot({ path: 'qa/screenshots/home/home-iphone11-after-10s.png' });
await page.getByRole('button', { name: 'Offre suivante' }).click();
await page.waitForTimeout(900);
console.log('after next click:', await center());
await page.goto('http://localhost:5173/login');
await page.evaluate(() => localStorage.setItem('rezho-mobile-v1', JSON.stringify({ state: { onboarded: true, isAuthenticated: false }, version: 0 })));
await page.goto('http://localhost:5173/login');
await page.waitForTimeout(1200);
await page.screenshot({ path: 'qa/screenshots/home/login-iphone11-frame.png' });
await ctx.close();
// Real iPhone 11 viewport
const ctx2 = await browser.newContext({ viewport: { width: 414, height: 896 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
const p2 = await ctx2.newPage();
await p2.goto('http://localhost:5173/login');
await p2.evaluate(() => localStorage.setItem('rezho-mobile-v1', JSON.stringify({ state: { onboarded: true, isAuthenticated: true }, version: 0 })));
await p2.goto('http://localhost:5173/home');
await p2.waitForTimeout(2500);
const [sw, cw] = await p2.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]);
console.log('iphone11 overflow check', sw, cw);
await p2.screenshot({ path: 'qa/screenshots/home/home-iphone11-device.png' });
await p2.locator('main').evaluate((el) => el.scrollTo(0, 420));
await p2.waitForTimeout(400);
await p2.screenshot({ path: 'qa/screenshots/home/home-iphone11-device-scrolled.png' });
await browser.close();
console.log('console errors:', errors.length ? errors : 'none');
