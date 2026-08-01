const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1500 } });
  const outPath = path.resolve('changelog/2026-07-30-launch-status-progress.png');

  try {
    await page.goto('http://127.0.0.1:8123', { waitUntil: 'networkidle' });

    const initialStatus = await page.locator('#status').evaluate((el) => {
      const before = getComputedStyle(el, '::before');
      return {
        text: (el.textContent || '').trim(),
        theme: el.dataset.theme || '',
        progress: el.style.getPropertyValue('--status-progress').trim(),
        beforeWidth: before.width,
      };
    });

    if (!initialStatus.text.includes('Press Start · Level 1 of 20 · ★ Classic · 🦴 5 • 🏁 Flag')) {
      throw new Error(`Unexpected initial status: ${initialStatus.text}`);
    }
    if (initialStatus.theme !== 'classic') {
      throw new Error(`Expected classic theme, got ${initialStatus.theme}`);
    }
    if (initialStatus.progress !== '5%') {
      throw new Error(`Expected initial 5% progress, got ${initialStatus.progress}`);
    }
    if (initialStatus.beforeWidth !== '5%') {
      throw new Error(`Unexpected initial fill state: ${JSON.stringify(initialStatus)}`);
    }

    await page.keyboard.type('henry', { delay: 40 });
    await page.waitForSelector('#level-select:not(.hidden)');
    await page.locator('#level-list .level-btn').nth(9).click({ force: true });
    await page.waitForFunction(() => {
      const status = document.getElementById('status');
      return status && status.textContent.includes('Level 10 of 20') && (status.style.getPropertyValue('--status-progress') || '').trim() === '50%';
    });
    await page.waitForTimeout(200);

    const bossStatus = await page.locator('#status').evaluate((el) => {
      const before = getComputedStyle(el, '::before');
      return {
        text: (el.textContent || '').trim(),
        theme: el.dataset.theme || '',
        progress: el.style.getPropertyValue('--status-progress').trim(),
        beforeWidth: before.width,
        title: el.title || '',
      };
    });

    if (!bossStatus.text.includes('Press Start · Level 10 of 20 · ♛ Boss arena · 🦴 11 • ♛ Corgi Captain • 🏁 Flag')) {
      throw new Error(`Unexpected boss status: ${bossStatus.text}`);
    }
    if (bossStatus.theme !== 'boss') {
      throw new Error(`Expected boss theme, got ${bossStatus.theme}`);
    }
    if (bossStatus.progress !== '50%') {
      throw new Error(`Expected boss 50% progress, got ${bossStatus.progress}`);
    }
    if (!(bossStatus.beforeWidth === '50%' || parseFloat(bossStatus.beforeWidth) > 200)) {
      throw new Error(`Unexpected boss fill state: ${JSON.stringify(bossStatus)}`);
    }
    if (!bossStatus.title.includes('50% into the 20-level run')) {
      throw new Error(`Unexpected boss title: ${bossStatus.title}`);
    }

    await page.screenshot({ path: outPath, fullPage: true });
    console.log(JSON.stringify({ ok: true, initialStatus, bossStatus, screenshot: outPath }, null, 2));
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error && error.stack ? error.stack : String(error));
  process.exit(1);
});
