const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1400 } });
  await page.goto('http://127.0.0.1:8080', { waitUntil: 'networkidle' });

  const defaultState = await page.evaluate(() => {
    state.currentLevelIndex = 0;
    state.mode = 'start';
    state.totalBones = LEVELS[0].totalBones;
    state.bonesCollected = 0;
    renderRunSummary(LEVELS[0]);
    setTouchControlsVisible(true, false);
    const btn = document.getElementById('btn-dig');
    const caption = document.getElementById('mobile-control-caption-dig');
    return {
      text: btn?.textContent?.trim(),
      ariaLabel: btn?.getAttribute('aria-label'),
      theme: btn?.dataset.theme || 'default',
      caption: caption?.textContent?.trim(),
      captionTheme: caption?.dataset.theme || 'default',
    };
  });

  if (defaultState.text !== 'DIG') throw new Error(`Default button text mismatch: ${defaultState.text}`);
  if (defaultState.caption !== 'Dig / dive') throw new Error(`Default caption mismatch: ${defaultState.caption}`);
  if (defaultState.theme !== 'default' || defaultState.captionTheme !== 'default') {
    throw new Error(`Default theme mismatch: ${JSON.stringify(defaultState)}`);
  }

  const waterState = await page.evaluate(() => {
    state.currentLevelIndex = 2;
    state.mode = 'title';
    state.totalBones = LEVELS[2].totalBones;
    state.bonesCollected = 0;
    renderRunSummary(LEVELS[2]);
    setTouchControlsVisible(true, false);
    const btn = document.getElementById('btn-dig');
    const caption = document.getElementById('mobile-control-caption-dig');
    return {
      text: btn?.textContent?.trim(),
      ariaLabel: btn?.getAttribute('aria-label'),
      title: btn?.title,
      theme: btn?.dataset.theme || 'default',
      caption: caption?.textContent?.trim(),
      captionTheme: caption?.dataset.theme || 'default',
    };
  });

  if (waterState.text !== 'DIVE') throw new Error(`Water button text mismatch: ${waterState.text}`);
  if (waterState.caption !== 'Hold to dive') throw new Error(`Water caption mismatch: ${waterState.caption}`);
  if (waterState.theme !== 'water' || waterState.captionTheme !== 'water') {
    throw new Error(`Water theme mismatch: ${JSON.stringify(waterState)}`);
  }
  if (waterState.ariaLabel !== 'Hold to dive downward through the water stage.') {
    throw new Error(`Water aria-label mismatch: ${waterState.ariaLabel}`);
  }
  if (waterState.title !== waterState.ariaLabel) {
    throw new Error(`Water title mismatch: ${waterState.title}`);
  }

  await page.locator('#mobile-controls-panel').screenshot({ path: 'changelog/2026-08-07-mobile-water-dive-preview.png' });
  console.log(JSON.stringify({ defaultState, waterState }, null, 2));
  await browser.close();
})();
