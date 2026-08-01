const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1600 } });
  const outPath = path.resolve('changelog/2026-07-28-length-badge-icons.png');

  try {
    await page.goto('http://127.0.0.1:8080', { waitUntil: 'networkidle' });
    await page.evaluate(() => {
      state.mode = 'start';
      state.currentLevelIndex = 9;
      levelRuntime = LEVELS[9];
      state.totalBones = levelRuntime.totalBones;
      state.bonesCollected = 0;
      renderRunSummary(levelRuntime);
      openLevelSelect();
    });
    await page.waitForSelector('#level-select:not(.hidden)');
    await page.waitForFunction(() => {
      const summary = document.getElementById('summary-tip-length');
      const henry = document.getElementById('henry-progress-length');
      return summary && henry && summary.textContent.includes('Long') && henry.textContent.includes('Long');
    });
    await page.waitForTimeout(250);

    const details = await page.evaluate(() => {
      const summary = document.getElementById('summary-tip-length');
      const henry = document.getElementById('henry-progress-length');
      return {
        summaryText: (summary?.textContent || '').trim(),
        summaryTheme: summary?.dataset.theme || '',
        summaryTitle: summary?.getAttribute('title') || '',
        summaryAria: summary?.getAttribute('aria-label') || '',
        henryText: (henry?.textContent || '').trim(),
        henryTheme: henry?.dataset.theme || '',
        henryTitle: henry?.getAttribute('title') || '',
        henryAria: henry?.getAttribute('aria-label') || '',
      };
    });

    if (details.summaryText !== '▭ Long') throw new Error(`Unexpected summary badge: ${details.summaryText}`);
    if (details.henryText !== '▭ Long') throw new Error(`Unexpected HENRY badge: ${details.henryText}`);
    if (details.summaryTheme !== 'boss') throw new Error(`Unexpected summary theme: ${details.summaryTheme}`);
    if (details.henryTheme !== 'boss') throw new Error(`Unexpected HENRY theme: ${details.henryTheme}`);
    if (details.summaryTitle !== 'Length: Long') throw new Error(`Unexpected summary title: ${details.summaryTitle}`);
    if (details.henryTitle !== 'Length: Long') throw new Error(`Unexpected HENRY title: ${details.henryTitle}`);
    if (details.summaryAria !== 'Length: Long') throw new Error(`Unexpected summary aria: ${details.summaryAria}`);
    if (details.henryAria !== 'Length: Long') throw new Error(`Unexpected HENRY aria: ${details.henryAria}`);

    await page.screenshot({ path: outPath, fullPage: true });
    console.log(JSON.stringify({ ok: true, ...details, screenshot: outPath }));
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error && error.stack ? error.stack : String(error));
  process.exit(1);
});
