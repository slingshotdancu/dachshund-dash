const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1600 } });
  const url = 'http://127.0.0.1:8080';
  const screenshotPath = path.resolve(__dirname, '..', 'changelog', '2026-07-16-henry-progress-focus-pill.png');

  await page.goto(url, { waitUntil: 'networkidle' });
  await page.locator('body').click();
  await page.keyboard.type('henry', { delay: 40 });
  await page.waitForSelector('#level-select:not(.hidden)');

  const focusPill = page.locator('#henry-progress-focus');
  const focusText = (await focusPill.textContent())?.trim();
  const focusLabel = await focusPill.getAttribute('aria-label');
  const theme = await focusPill.getAttribute('data-theme');

  if (focusText !== '🦴 Path bones') {
    throw new Error(`Unexpected focus pill text: ${focusText}`);
  }
  if (!focusLabel || !focusLabel.toLowerCase().includes('focus:') || !focusLabel.toLowerCase().includes('bones')) {
    throw new Error(`Unexpected focus pill aria-label: ${focusLabel}`);
  }
  if (theme !== 'classic') {
    throw new Error(`Expected classic theme on default start, got: ${theme}`);
  }

  await page.locator('#level-select .level-select-card').screenshot({ path: screenshotPath });
  console.log(JSON.stringify({ ok: true, focusText, focusLabel, theme, screenshotPath }));
  await browser.close();
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
