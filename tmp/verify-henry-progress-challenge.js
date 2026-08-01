const { chromium } = require('playwright');
const path = require('path');

const screenshotPath = path.resolve(__dirname, '..', 'changelog', '2026-07-17-henry-progress-challenge-pill.png');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1400 } });

  try {
    await page.goto('http://127.0.0.1:8080', { waitUntil: 'networkidle' });
    await page.waitForFunction(() => typeof window.loadLevel === 'function' && typeof window.openLevelSelect === 'function');
    await page.evaluate(() => {
      window.loadLevel(9, { resetLives: true });
      window.openLevelSelect();
    });
    await page.waitForSelector('#level-select:not(.hidden)');
    await page.waitForFunction(() => {
      const pill = document.getElementById('henry-progress-challenge');
      const level = document.getElementById('henry-progress-level');
      return pill && level && pill.dataset.challengeTone === 'boss' && /Boss/i.test(pill.textContent || '') && /Level 10/i.test(level.textContent || '');
    });

    const challengeDetails = await page.$eval('#henry-progress-challenge', (el) => {
      const style = getComputedStyle(el);
      return {
        text: el.textContent?.trim(),
        tone: el.dataset.challengeTone,
        ariaLabel: el.getAttribute('aria-label'),
        backgroundColor: style.backgroundColor,
        borderColor: style.borderColor,
        color: style.color,
      };
    });

    if (challengeDetails.tone !== 'boss') throw new Error(`Expected boss tone, got ${challengeDetails.tone}`);
    if (challengeDetails.text !== 'Boss') throw new Error(`Expected Boss text, got ${challengeDetails.text}`);
    if (challengeDetails.backgroundColor !== 'rgba(102, 34, 31, 0.52)') {
      throw new Error(`Expected boss-tinted background, got ${challengeDetails.backgroundColor}`);
    }

    await page.locator('.level-select-card').screenshot({ path: screenshotPath });
    console.log(JSON.stringify({ ok: true, screenshotPath, challengeDetails }, null, 2));
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
