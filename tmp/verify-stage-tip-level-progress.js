const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1500 } });
  const outPath = path.resolve('changelog/2026-07-28-stage-tip-level-progress.png');

  try {
    await page.goto('http://127.0.0.1:8080', { waitUntil: 'networkidle' });
    await page.keyboard.type('henry', { delay: 40 });
    await page.waitForSelector('#level-select:not(.hidden)');
    await page.locator('#level-list .level-btn').nth(9).click({ force: true });
    await page.waitForFunction(() => {
      const pill = document.getElementById('summary-tip-level');
      return pill && pill.textContent.includes('Level 10 of 20') && pill.dataset.theme === 'boss';
    });
    await page.waitForTimeout(250);

    const details = await page.locator('#summary-tip-level').evaluate((el) => {
      const before = getComputedStyle(el, '::before');
      return {
        text: (el.textContent || '').trim(),
        theme: el.dataset.theme || '',
        progress: el.style.getPropertyValue('--stage-tip-level-progress').trim(),
        title: el.getAttribute('title') || '',
        beforeWidth: before.width,
        beforeBackgroundImage: before.backgroundImage,
      };
    });

    if (details.text !== 'Level 10 of 20 · ♛ Boss') {
      throw new Error(`Unexpected level text: ${details.text}`);
    }
    if (details.theme !== 'boss') {
      throw new Error(`Unexpected theme: ${details.theme}`);
    }
    if (details.progress !== '50%') {
      throw new Error(`Unexpected progress: ${details.progress}`);
    }
    if (details.title !== '50% through the 20-level run') {
      throw new Error(`Unexpected title: ${details.title}`);
    }
    if (!details.beforeBackgroundImage.includes('linear-gradient')) {
      throw new Error(`Missing progress gradient: ${details.beforeBackgroundImage}`);
    }

    await page.screenshot({ path: outPath, fullPage: true });
    console.log(JSON.stringify({ ok: true, ...details, screenshot: outPath }));
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error && error.stack ? error.stack : String(error));
  process.exit(1);
});
