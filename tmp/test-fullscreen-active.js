const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1400 } });
  await page.goto('http://127.0.0.1:8123', { waitUntil: 'networkidle' });
  await page.click('#btn-fullscreen');
  await page.waitForTimeout(300);
  const result = await page.evaluate(() => ({
    text: document.getElementById('btn-fullscreen')?.textContent?.trim(),
    shortcut: document.getElementById('btn-fullscreen')?.dataset.shortcut || '',
    aria: document.getElementById('btn-fullscreen')?.getAttribute('aria-label') || '',
    hint: document.querySelector('#btn-fullscreen + .utility-btn-hint, #btn-fullscreen ~ .utility-btn-hint')?.textContent?.trim() || '',
    fullscreen: !!document.fullscreenElement,
    fullscreenTag: document.fullscreenElement?.tagName || null,
  }));
  console.log(JSON.stringify(result, null, 2));
  await browser.close();
})().catch((err) => { console.error(err); process.exit(1); });
