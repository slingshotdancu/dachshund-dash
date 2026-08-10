const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1400 } });
  const outPath = path.resolve('changelog/2026-08-08-pause-locked-title-card.png');

  try {
    await page.goto('http://127.0.0.1:8123', { waitUntil: 'networkidle' });

    const result = await page.evaluate(() => {
      const btn = document.getElementById('btn-pause-desktop');
      const hint = btn?.parentElement?.querySelector('.utility-btn-hint');
      return {
        text: btn?.textContent?.trim(),
        disabled: !!btn?.disabled,
        shortcut: btn?.dataset.shortcut || '',
        ariaLabel: btn?.getAttribute('aria-label') || '',
        title: btn?.title || '',
        hintText: hint?.textContent?.replace(/\s+/g, ' ').trim() || '',
      };
    });

    if (result.text !== 'Pause locked') {
      throw new Error(`Expected title-screen pause label to be "Pause locked", got ${result.text}`);
    }
    if (!result.disabled) {
      throw new Error('Expected title-screen pause button to stay disabled before a run starts.');
    }
    if (result.shortcut !== '') {
      throw new Error(`Expected no shortcut badge before a run starts, got ${result.shortcut}`);
    }
    if (result.ariaLabel !== 'Pause locked until the run starts') {
      throw new Error(`Unexpected aria-label: ${result.ariaLabel}`);
    }
    if (result.title !== result.ariaLabel) {
      throw new Error(`Expected title to match aria-label, got ${result.title}`);
    }
    if (!result.hintText.includes('Start a run to unlock pause')) {
      throw new Error(`Unexpected hint text: ${result.hintText}`);
    }
    if (!result.hintText.includes('P / Esc')) {
      throw new Error(`Expected shortcut hint to mention P / Esc, got ${result.hintText}`);
    }

    await page.locator('.utility-actions').screenshot({ path: outPath });
    console.log(JSON.stringify({ ok: true, screenshot: outPath, ...result }, null, 2));
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error && error.stack ? error.stack : String(error));
  process.exit(1);
});
