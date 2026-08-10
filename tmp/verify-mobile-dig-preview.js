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
    };
  });

  if (defaultState.text !== 'DIG') throw new Error(`Default button text mismatch: ${defaultState.text}`);
  if (defaultState.caption !== 'Dig / dive') throw new Error(`Default caption mismatch: ${defaultState.caption}`);
  if (defaultState.theme !== 'default') throw new Error(`Default theme mismatch: ${defaultState.theme}`);

  const tunnelState = await page.evaluate(() => {
    state.currentLevelIndex = 8;
    state.mode = 'title';
    state.totalBones = LEVELS[8].totalBones;
    state.bonesCollected = 0;
    renderRunSummary(LEVELS[8]);
    setTouchControlsVisible(true, false);
    const btn = document.getElementById('btn-dig');
    const caption = document.getElementById('mobile-control-caption-dig');
    return {
      text: btn?.textContent?.trim(),
      ariaLabel: btn?.getAttribute('aria-label'),
      theme: btn?.dataset.theme || 'default',
      caption: caption?.textContent?.trim(),
      captionTheme: caption?.dataset.theme || 'default',
      title: btn?.title,
    };
  });

  if (tunnelState.text !== 'DIG') throw new Error(`Tunnel button text mismatch: ${tunnelState.text}`);
  if (tunnelState.caption !== 'Hold to dig') throw new Error(`Tunnel caption mismatch: ${tunnelState.caption}`);
  if (tunnelState.theme !== 'tunnel' || tunnelState.captionTheme !== 'tunnel') {
    throw new Error(`Tunnel theme mismatch: ${JSON.stringify(tunnelState)}`);
  }
  if (tunnelState.ariaLabel !== 'Hold to dig through dirt. Add BARK for faster digging.') {
    throw new Error(`Tunnel aria-label mismatch: ${tunnelState.ariaLabel}`);
  }

  await page.locator('#mobile-controls-panel').screenshot({ path: 'changelog/2026-08-01-mobile-dig-preview.png' });
  console.log(JSON.stringify({ defaultState, tunnelState }, null, 2));
  await browser.close();
})();
