const { chromium } = require('playwright');
const path = require('path');

const screenshotPath = path.resolve(__dirname, '..', 'changelog', '2026-07-17-henry-progress-theme-pill.png');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1400 } });

  try {
    await page.goto('http://127.0.0.1:8080', { waitUntil: 'networkidle' });
    await page.waitForFunction(() => typeof window.loadLevel === 'function' && typeof window.openLevelSelect === 'function');
    await page.evaluate(() => {
      window.loadLevel(3, { resetLives: true });
      window.openLevelSelect();
    });
    await page.waitForSelector('#level-select:not(.hidden)');
    await page.waitForFunction(() => {
      const el = document.getElementById('henry-progress-theme');
      const level = document.getElementById('henry-progress-level');
      return el && level && el.dataset.theme === 'moon' && /Moon/i.test(el.textContent || '') && /Level 4/i.test(level.textContent || '');
    });

    const themeDetails = await page.$eval('#henry-progress-theme', (el) => {
      const style = getComputedStyle(el);
      return {
        text: el.textContent?.trim(),
        theme: el.dataset.theme,
        backgroundColor: style.backgroundColor,
        borderColor: style.borderColor,
        color: style.color,
      };
    });

    if (themeDetails.theme !== 'moon') {
      throw new Error(`Expected moon theme, got ${themeDetails.theme}`);
    }
    if (!/Moon/i.test(themeDetails.text || '')) {
      throw new Error(`Expected Moon text, got ${themeDetails.text}`);
    }
    if (themeDetails.backgroundColor !== 'rgba(57, 66, 126, 0.48)') {
      throw new Error(`Expected moon-tinted background, got ${themeDetails.backgroundColor}`);
    }

    await page.locator('.level-select-card').screenshot({ path: screenshotPath });
    console.log(JSON.stringify({ ok: true, screenshotPath, themeDetails }, null, 2));
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
