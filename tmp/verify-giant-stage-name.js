const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1400 } });
  const screenshotPath = path.resolve(__dirname, '..', 'changelog', '2026-08-11-big-corgis-preview.png');

  try {
    await page.goto('http://127.0.0.1:8123', { waitUntil: 'networkidle' });

    const giantState = await page.evaluate(() => {
      const giantIndex = LEVELS.findIndex((level) => level.giantEnemies);
      if (giantIndex < 0) throw new Error('No giant-enemy level found');
      state.currentLevelIndex = giantIndex;
      state.mode = 'title';
      state.totalBones = LEVELS[giantIndex].totalBones;
      state.bonesCollected = 0;
      renderRunSummary(LEVELS[giantIndex]);
      update();
      return {
        giantIndex,
        status: document.getElementById('status')?.textContent?.replace(/\s+/g, ' ').trim() || '',
        startContext: document.getElementById('start-action-context')?.textContent?.replace(/\s+/g, ' ').trim() || '',
        summaryTheme: document.getElementById('summary-theme')?.textContent?.replace(/\s+/g, ' ').trim() || '',
        tipLabel: document.getElementById('summary-tip-label')?.textContent?.replace(/\s+/g, ' ').trim() || '',
      };
    });

    const surfaces = [giantState.status, giantState.startContext, giantState.summaryTheme, giantState.tipLabel].join(' | ');
    if (!/Big Corgis/.test(surfaces)) {
      throw new Error(`Big Corgis text missing from giant-stage surfaces: ${JSON.stringify(giantState)}`);
    }
    if (/Big Burrowers/i.test(surfaces)) {
      throw new Error(`Unexpected Big Burrowers text still present: ${JSON.stringify(giantState)}`);
    }

    await page.locator('.run-summary').screenshot({ path: screenshotPath });
    console.log(JSON.stringify({ ok: true, screenshotPath, giantState }, null, 2));
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error && error.stack ? error.stack : String(error));
  process.exit(1);
});
