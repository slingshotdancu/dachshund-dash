const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1500 } });
  const outPath = path.resolve('changelog/2026-07-27-start-action-context-progress.png');

  try {
    await page.goto('http://127.0.0.1:8080', { waitUntil: 'networkidle' });
    await page.evaluate(() => {
      loadLevel(9);
      render();
    });
    await page.waitForFunction(() => {
      const pill = document.getElementById('start-action-context');
      return pill && /Level 10/.test(pill.textContent || '') && (pill.style.getPropertyValue('--context-progress') || '').trim() === '50%';
    });
    await page.waitForTimeout(250);

    const details = await page.locator('#start-action-context').evaluate((el) => {
      const before = getComputedStyle(el, '::before');
      return {
        text: (el.textContent || '').trim(),
        theme: el.dataset.theme || '',
        tone: el.dataset.tone || '',
        progress: el.style.getPropertyValue('--context-progress').trim(),
        beforeWidth: before.width,
        beforeOpacity: before.opacity,
        title: el.title,
      };
    });

    if (!details.text.includes('Level 10')) throw new Error(`Unexpected preview text: ${details.text}`);
    if (details.theme !== 'boss') throw new Error(`Unexpected preview theme: ${details.theme}`);
    if (details.progress !== '50%') throw new Error(`Unexpected preview progress: ${details.progress}`);
    if (!details.title.includes('50%')) throw new Error(`Missing progress title: ${details.title}`);
    if (!(parseFloat(details.beforeWidth) > 50)) throw new Error(`Unexpected fill width: ${details.beforeWidth}`);

    await page.screenshot({ path: outPath, fullPage: true });
    console.log(JSON.stringify({ ok: true, ...details, screenshot: outPath }));
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error && error.stack ? error.stack : String(error));
  process.exit(1);
});
