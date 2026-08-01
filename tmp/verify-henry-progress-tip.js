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

  await page.waitForSelector('#henry-progress-tip');

  const result = await page.evaluate(() => {
    const pill = document.getElementById('henry-progress-tip');
    return {
      text: pill?.textContent?.trim(),
      ariaLabel: pill?.getAttribute('aria-label'),
      tone: pill?.dataset.tone,
      theme: pill?.dataset.theme,
      visible: !!pill && !!pill.offsetParent,
      width: pill ? Math.round(pill.getBoundingClientRect().width) : 0,
    };
  });

  const expectedTip = '💡 Tip: Grab the toy toss pickup quickly to shut down the siren slow before the chase gets messy.';
  if (!result.visible) throw new Error('Tip pill is not visible');
  if (result.text !== expectedTip) {
    throw new Error(`Unexpected tip pill text: ${result.text}`);
  }
  if (result.ariaLabel !== expectedTip.replace('💡 ', '')) {
    throw new Error(`Unexpected tip aria-label: ${result.ariaLabel}`);
  }
  if (result.tone !== 'tip' || result.theme !== 'boss') {
    throw new Error(`Unexpected tip pill styling: ${JSON.stringify(result)}`);
  }
  if (result.width < 420) {
    throw new Error(`Tip pill did not render at a useful width: ${result.width}`);
  }

  await page.locator('#henry-progress').screenshot({ path: 'changelog/2026-07-20-henry-progress-tip-pill.png' });
  console.log(JSON.stringify(result, null, 2));
  await browser.close();
})();
