const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1800 } });
  await page.goto('http://127.0.0.1:8080', { waitUntil: 'networkidle' });
  await page.keyboard.type('henry');
  await page.waitForSelector('#level-select:not(.hidden)');

  const result = await page.evaluate(() => {
    const overlay = document.getElementById('level-select');
    if (!overlay) {
      return { ok: false, reason: 'Missing #level-select overlay' };
    }
    const styles = window.getComputedStyle(overlay, '::before');
    return {
      ok: true,
      backgroundImage: styles.backgroundImage,
      backdropFilter: styles.backdropFilter,
      webkitBackdropFilter: styles.webkitBackdropFilter || '',
      cardVisible: Boolean(document.querySelector('.level-select-card')),
    };
  });

  if (!result.ok) {
    throw new Error(result.reason);
  }
  if (!/radial-gradient/i.test(result.backgroundImage)) {
    throw new Error(`Expected radial-gradient backdrop, got: ${result.backgroundImage}`);
  }
  if (!/blur\(7px\)/.test(result.backdropFilter) && !/blur\(7px\)/.test(result.webkitBackdropFilter)) {
    throw new Error(`Expected blur backdrop filter, got: ${result.backdropFilter || result.webkitBackdropFilter || 'none'}`);
  }
  if (!result.cardVisible) {
    throw new Error('Expected Henry overlay card to be visible');
  }

  const screenshotPath = path.join(process.cwd(), 'changelog', '2026-08-02-henry-overlay-backdrop.png');
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log(JSON.stringify({
    verified: true,
    screenshotPath,
    backgroundImage: result.backgroundImage,
    backdropFilter: result.backdropFilter || result.webkitBackdropFilter,
  }, null, 2));

  await browser.close();
})().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
