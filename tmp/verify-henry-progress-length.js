const { chromium } = require('playwright');
const path = require('path');

const screenshotPath = path.resolve(__dirname, '..', 'changelog', '2026-07-18-henry-progress-length-pill.png');

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
      const pill = document.getElementById('henry-progress-length');
      const level = document.getElementById('henry-progress-level');
      return pill && level && pill.dataset.theme === 'boss' && (pill.textContent || '').trim() === 'Long' && /Level 20/i.test(level.textContent || '');
    });

    const lengthDetails = await page.$eval('#henry-progress-length', (el) => {
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

    if (lengthDetails.text !== 'Long') throw new Error(`Expected Long text, got ${lengthDetails.text}`);
    if (lengthDetails.theme !== 'boss') throw new Error(`Expected boss theme, got ${lengthDetails.theme}`);
    if (lengthDetails.ariaLabel !== 'Length: Long') throw new Error(`Unexpected aria label: ${lengthDetails.ariaLabel}`);
    if (lengthDetails.backgroundColor !== 'rgba(114, 40, 30, 0.52)') {
      throw new Error(`Expected boss length background, got ${lengthDetails.backgroundColor}`);
    }

    await page.locator('.level-select-card').screenshot({ path: screenshotPath });
    console.log(JSON.stringify({ ok: true, screenshotPath, lengthDetails }, null, 2));
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
