const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1700 } });
  const outPath = path.resolve('changelog/2026-07-29-challenge-badge-icons.png');

  try {
    await page.goto('http://127.0.0.1:8080', { waitUntil: 'networkidle' });
    await page.evaluate(() => {
      loadLevel(9);
      openLevelSelect();
      render();
    });
    await page.waitForFunction(() => {
      const summaryBadge = document.getElementById('summary-tip-challenge');
      const portalBadge = document.getElementById('henry-progress-challenge');
      const currentCardBadge = document.querySelector('#level-list .level-btn[data-current="true"] .level-btn-difficulty');
      return summaryBadge && portalBadge && currentCardBadge
        && (summaryBadge.textContent || '').trim() === '♛ Boss'
        && (portalBadge.textContent || '').trim() === '♛ Boss'
        && (currentCardBadge.textContent || '').trim() === '♛ Boss';
    });
    await page.waitForTimeout(250);

    const details = await page.evaluate(() => {
      const summaryBadge = document.getElementById('summary-tip-challenge');
      const portalBadge = document.getElementById('henry-progress-challenge');
      const currentCardBadge = document.querySelector('#level-list .level-btn[data-current="true"] .level-btn-difficulty');
      return {
        summaryText: (summaryBadge?.textContent || '').trim(),
        summaryAria: summaryBadge?.getAttribute('aria-label') || '',
        portalText: (portalBadge?.textContent || '').trim(),
        portalTitle: portalBadge?.getAttribute('title') || '',
        currentCardText: (currentCardBadge?.textContent || '').trim(),
      };
    });

    if (details.summaryText !== '♛ Boss') {
      throw new Error(`Unexpected stage-tip challenge text: ${details.summaryText}`);
    }
    if (details.summaryAria !== 'Challenge: Boss') {
      throw new Error(`Unexpected stage-tip aria label: ${details.summaryAria}`);
    }
    if (details.portalText !== '♛ Boss') {
      throw new Error(`Unexpected portal challenge text: ${details.portalText}`);
    }
    if (details.portalTitle !== 'Challenge: Boss') {
      throw new Error(`Unexpected portal challenge title: ${details.portalTitle}`);
    }
    if (details.currentCardText !== '♛ Boss') {
      throw new Error(`Unexpected current card challenge text: ${details.currentCardText}`);
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
