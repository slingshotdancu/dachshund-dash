const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1500 } });
  const outPath = path.resolve('changelog/2026-07-27-start-button-launch-halo.png');

  try {
    await page.goto('http://127.0.0.1:8080', { waitUntil: 'networkidle' });
    await page.keyboard.type('henry', { delay: 40 });
    await page.waitForSelector('#level-select:not(.hidden)');
    await page.locator('#level-list .level-btn').nth(3).click({ force: true });
    await page.waitForFunction(() => {
      const btn = document.getElementById('btn-start-desktop');
      return btn && btn.textContent.includes('Start Level 4') && btn.dataset.theme === 'moon';
    });
    await page.waitForTimeout(250);

    const details = await page.locator('#btn-start-desktop').evaluate((el) => {
      const before = getComputedStyle(el, '::before');
      return {
        text: (el.textContent || '').trim(),
        theme: el.dataset.theme || '',
        state: el.dataset.state || '',
        beforeOpacity: before.opacity,
        beforeAnimationName: before.animationName,
        beforeTransform: before.transform,
      };
    });

    if (!details.text.includes('◔ Start Level 4')) {
      throw new Error(`Unexpected start label: ${details.text}`);
    }
    if (details.theme !== 'moon') {
      throw new Error(`Unexpected theme: ${details.theme}`);
    }
    if (details.state !== 'start' && details.state !== 'title') {
      throw new Error(`Unexpected state: ${details.state}`);
    }
    if (details.beforeAnimationName !== 'startButtonReadyHalo') {
      throw new Error(`Unexpected halo animation: ${details.beforeAnimationName}`);
    }
    if (!(parseFloat(details.beforeOpacity) > 0)) {
      throw new Error(`Unexpected halo opacity: ${details.beforeOpacity}`);
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
