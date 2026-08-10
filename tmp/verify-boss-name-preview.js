const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1400 } });
  await page.goto('http://127.0.0.1:8080', { waitUntil: 'networkidle' });

  await page.evaluate(() => {
    state.currentLevelIndex = 9;
    state.mode = 'title';
    state.totalBones = LEVELS[9].totalBones;
    state.bonesCollected = 0;
    renderLaunchStatus();
    renderRunSummary(LEVELS[9]);
  });

  const result = await page.evaluate(() => {
    const status = document.getElementById('status');
    const theme = document.getElementById('summary-theme');
    return {
      statusText: status?.textContent?.trim(),
      statusAria: status?.getAttribute('aria-label'),
      themeText: theme?.textContent?.trim(),
      themeTheme: theme?.dataset.theme,
      themeTone: theme?.dataset.tone,
    };
  });

  if (!result.statusText?.includes('Boss · Corgi Captain')) {
    throw new Error(`Status pill missing boss name: ${result.statusText}`);
  }
  if (!result.statusAria?.includes('Corgi Captain')) {
    throw new Error(`Status aria missing boss name: ${result.statusAria}`);
  }
  if (result.themeText !== '♛ Boss · Corgi Captain') {
    throw new Error(`Theme pill mismatch: ${result.themeText}`);
  }
  if (result.themeTheme !== 'boss' || result.themeTone !== 'boss') {
    throw new Error(`Theme pill styling mismatch: ${JSON.stringify(result)}`);
  }

  await page.screenshot({ path: 'changelog/2026-08-03-boss-name-preview.png', fullPage: true });
  console.log(JSON.stringify(result, null, 2));
  await browser.close();
})();
