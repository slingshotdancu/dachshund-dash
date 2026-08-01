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
    renderRunSummary(LEVELS[9]);
    openLevelSelect();
  });

  await page.waitForSelector('#henry-progress-theme');

  const result = await page.evaluate(() => {
    const themePill = document.getElementById('henry-progress-theme');
    const jumpButton = document.getElementById('henry-progress-jump');
    const activeCard = document.querySelector('.level-btn[data-current="true"] .level-btn-stage-text');
    return {
      themeText: themePill?.textContent?.trim(),
      themeAria: themePill?.getAttribute('aria-label'),
      jumpThemeText: jumpButton?.querySelector('.henry-progress-action-theme')?.textContent?.trim(),
      jumpAria: jumpButton?.getAttribute('aria-label'),
      currentCardStage: activeCard?.textContent?.trim(),
      visible: !!themePill && !!themePill.offsetParent && !!jumpButton && !!jumpButton.offsetParent,
    };
  });

  if (!result.visible) throw new Error('Boss portal summary is not visible');
  if (result.themeText !== '♛ Boss · Corgi Captain') throw new Error(`Unexpected theme pill: ${result.themeText}`);
  if (result.themeAria !== 'Boss · Corgi Captain') throw new Error(`Unexpected theme aria-label: ${result.themeAria}`);
  if (result.jumpThemeText !== '♛ Corgi Captain') throw new Error(`Unexpected quick jump badge: ${result.jumpThemeText}`);
  if (!result.jumpAria?.includes('Level 10')) throw new Error(`Unexpected quick jump aria-label: ${result.jumpAria}`);
  if (result.currentCardStage !== 'Corgi Captain') throw new Error(`Unexpected current level card stage text: ${result.currentCardStage}`);

  await page.locator('#level-select .level-select-card').screenshot({ path: 'changelog/2026-07-21-henry-boss-stage-name.png' });
  console.log(JSON.stringify(result, null, 2));
  await browser.close();
})();
