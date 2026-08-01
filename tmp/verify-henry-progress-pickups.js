const { chromium } = require('playwright');
const path = require('path');

const screenshotPath = path.resolve(__dirname, '..', 'changelog', '2026-07-18-henry-progress-pickups-pill.png');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1400 } });

  try {
    await page.goto('http://127.0.0.1:8080', { waitUntil: 'networkidle' });
    await page.waitForFunction(() => typeof window.loadLevel === 'function' && typeof window.openLevelSelect === 'function');
    await page.evaluate(() => {
      window.loadLevel(19, { resetLives: true });
      window.openLevelSelect();
    });
    await page.waitForSelector('#level-select:not(.hidden)');
    await page.waitForFunction(() => {
      const pill = document.getElementById('henry-progress-pickups');
      const level = document.getElementById('henry-progress-level');
      return pill && level && pill.dataset.theme === 'boss' && /🦴 14/.test(pill.textContent || '') && /🦸 1/.test(pill.textContent || '') && /🧸 Toy/.test(pill.textContent || '') && /Level 20/i.test(level.textContent || '');
    });

    const pickupDetails = await page.$eval('#henry-progress-pickups', (el) => {
      const style = getComputedStyle(el);
      return {
        text: el.textContent?.trim(),
        theme: el.dataset.theme,
        ariaLabel: el.getAttribute('aria-label'),
        backgroundColor: style.backgroundColor,
        borderColor: style.borderColor,
        color: style.color,
      };
    });

    if (pickupDetails.theme !== 'boss') throw new Error(`Expected boss theme, got ${pickupDetails.theme}`);
    if (pickupDetails.text !== '🦴 14 • ❤️ 1 • 🦸 1 • 🧸 Toy') {
      throw new Error(`Unexpected pickup summary text: ${pickupDetails.text}`);
    }
    if (pickupDetails.ariaLabel !== 'Pickups: 14 bones, 1 heart, 1 cape, toy toss') {
      throw new Error(`Unexpected pickup aria label: ${pickupDetails.ariaLabel}`);
    }
    if (pickupDetails.backgroundColor !== 'rgba(115, 42, 31, 0.52)') {
      throw new Error(`Expected boss pickup background, got ${pickupDetails.backgroundColor}`);
    }

    await page.locator('.level-select-card').screenshot({ path: screenshotPath });
    console.log(JSON.stringify({ ok: true, screenshotPath, pickupDetails }, null, 2));
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
