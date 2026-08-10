const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1400 } });
  const outPath = path.resolve('changelog/2026-08-08-fullscreen-esc-shortcut.png');

  try {
    await page.goto('http://127.0.0.1:8123', { waitUntil: 'networkidle' });

    const defaultState = await page.evaluate(() => {
      const btn = document.getElementById('btn-fullscreen');
      const hint = btn?.parentElement?.querySelector('.utility-btn-hint');
      return {
        text: btn?.textContent?.trim(),
        shortcut: btn?.dataset.shortcut || '',
        ariaLabel: btn?.getAttribute('aria-label') || '',
        title: btn?.title || '',
        hintText: hint?.textContent?.replace(/\s+/g, ' ').trim() || '',
      };
    });

    if (defaultState.text !== '⛶ Play Fullscreen') throw new Error(`Unexpected default text: ${defaultState.text}`);
    if (defaultState.shortcut !== '') throw new Error(`Expected no default shortcut, got ${defaultState.shortcut}`);
    if (defaultState.ariaLabel !== 'Enter fullscreen') throw new Error(`Unexpected default aria-label: ${defaultState.ariaLabel}`);

    await page.click('#btn-fullscreen');
    await page.waitForTimeout(250);

    const activeState = await page.evaluate(() => {
      const btn = document.getElementById('btn-fullscreen');
      const hint = btn?.parentElement?.querySelector('.utility-btn-hint');
      return {
        text: btn?.textContent?.trim(),
        shortcut: btn?.dataset.shortcut || '',
        ariaLabel: btn?.getAttribute('aria-label') || '',
        title: btn?.title || '',
        hintText: hint?.textContent?.replace(/\s+/g, ' ').trim() || '',
        fullscreenTag: document.fullscreenElement?.tagName || null,
      };
    });

    if (activeState.text !== '⛶ Exit Fullscreen') throw new Error(`Unexpected active text: ${activeState.text}`);
    if (activeState.shortcut !== 'Esc') throw new Error(`Expected active Esc shortcut, got ${activeState.shortcut}`);
    if (activeState.ariaLabel !== 'Exit fullscreen') throw new Error(`Unexpected active aria-label: ${activeState.ariaLabel}`);
    if (!activeState.title.includes('Press Esc')) throw new Error(`Unexpected active title: ${activeState.title}`);
    if (!activeState.hintText.includes('press Esc') || !activeState.hintText.includes('click to exit')) {
      throw new Error(`Unexpected active hint: ${activeState.hintText}`);
    }
    if (activeState.fullscreenTag !== 'CANVAS') throw new Error(`Expected canvas fullscreen, got ${activeState.fullscreenTag}`);

    await page.evaluate(async () => {
      if (document.fullscreenElement && document.exitFullscreen) {
        await document.exitFullscreen();
      }
    });
    await page.waitForTimeout(250);
    await page.locator('.utility-actions').screenshot({ path: outPath });
    console.log(JSON.stringify({ ok: true, screenshot: outPath, defaultState, activeState }, null, 2));
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error && error.stack ? error.stack : String(error));
  process.exit(1);
});
