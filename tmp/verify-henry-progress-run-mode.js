const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1400 } });
  await page.goto('http://127.0.0.1:8080', { waitUntil: 'networkidle' });

  await page.evaluate(() => {
    state.currentLevelIndex = 0;
    state.mode = 'title';
    renderRunSummary(LEVELS[0]);
    openLevelSelect();
  });

  const defaultState = await page.evaluate(() => {
    const button = document.getElementById('henry-progress-jump');
    return {
      mode: button?.dataset.mode,
      label: button?.querySelector('.henry-progress-action-label')?.textContent?.trim(),
      modeBadge: button?.querySelector('.henry-progress-action-mode')?.textContent?.trim(),
      ariaLabel: button?.getAttribute('aria-label'),
    };
  });

  if (defaultState.mode !== 'default') throw new Error(`Expected default mode, got ${defaultState.mode}`);
  if (defaultState.modeBadge !== 'Default start') throw new Error(`Unexpected default mode badge: ${defaultState.modeBadge}`);
  if (defaultState.label !== 'Jump to Level 1') throw new Error(`Unexpected default label: ${defaultState.label}`);

  await page.evaluate(() => {
    loadLevel(9, { resetLives: true });
    state.mode = 'paused';
    renderRunSummary(levelRuntime);
    openLevelSelect();
  });

  await page.waitForSelector('#henry-progress-jump .henry-progress-action-mode');

  const currentState = await page.evaluate(() => {
    const button = document.getElementById('henry-progress-jump');
    const modeStyle = button ? window.getComputedStyle(button.querySelector('.henry-progress-action-mode')) : null;
    return {
      mode: button?.dataset.mode,
      label: button?.querySelector('.henry-progress-action-label')?.textContent?.trim(),
      modeBadge: button?.querySelector('.henry-progress-action-mode')?.textContent?.trim(),
      themeBadge: button?.querySelector('.henry-progress-action-theme')?.textContent?.trim(),
      ariaLabel: button?.getAttribute('aria-label'),
      modeColor: modeStyle?.color,
      visible: !!button && !!button.offsetParent,
    };
  });

  if (!currentState.visible) throw new Error('Quick jump button is not visible');
  if (currentState.mode !== 'current') throw new Error(`Expected current mode, got ${currentState.mode}`);
  if (currentState.modeBadge !== 'Current run') throw new Error(`Unexpected current mode badge: ${currentState.modeBadge}`);
  if (currentState.label !== 'Resume Level 10') throw new Error(`Unexpected current label: ${currentState.label}`);
  if (!currentState.themeBadge?.startsWith('♛ ') || !currentState.themeBadge.includes('Boss')) {
    throw new Error(`Unexpected theme badge: ${currentState.themeBadge}`);
  }
  if (!currentState.ariaLabel?.includes('current run on Level 10')) {
    throw new Error(`Unexpected current aria-label: ${currentState.ariaLabel}`);
  }

  await page.locator('#level-select .level-select-card').screenshot({ path: 'changelog/2026-07-21-henry-progress-run-mode-badge.png' });
  console.log(JSON.stringify({ defaultState, currentState }, null, 2));
  await browser.close();
})();
