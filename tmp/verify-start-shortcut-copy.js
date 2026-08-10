const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1400 } });
  const screenshotPath = path.resolve(__dirname, '..', 'changelog', '2026-08-09-start-shortcut-copy.png');

  try {
    await page.goto('http://127.0.0.1:8080', { waitUntil: 'networkidle' });

    const details = await page.evaluate(() => {
      const startButton = document.getElementById('btn-start-desktop');
      const startHint = startButton?.parentElement?.querySelector('.utility-btn-hint');
      const startChip = document.querySelector('.control-chip-start');
      return {
        buttonShortcut: startButton?.dataset.shortcut || '',
        hintText: startHint?.textContent?.replace(/\s+/g, ' ').trim() || '',
        chipText: startChip?.textContent?.replace(/\s+/g, ' ').trim() || '',
      };
    });

    if (details.buttonShortcut !== 'Enter / Space / W / ↑') {
      throw new Error(`Expected start button shortcut to be "Enter / Space / W / ↑", got ${details.buttonShortcut}`);
    }
    if (!details.hintText.includes('Enter / Space / W / ↑')) {
      throw new Error(`Expected start hint to use slash-separated shortcut copy, got ${details.hintText}`);
    }
    if (details.chipText !== 'Start Enter / Space / W / ↑') {
      throw new Error(`Expected start chip text to be "Start Enter / Space / W / ↑", got ${details.chipText}`);
    }

    await page.locator('.controls-help').screenshot({ path: screenshotPath });
    console.log(JSON.stringify({ ok: true, screenshotPath, details }, null, 2));
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error && error.stack ? error.stack : String(error));
  process.exit(1);
});
