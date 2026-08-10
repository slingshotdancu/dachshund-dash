const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1400 } });
  await page.goto('http://127.0.0.1:8080', { waitUntil: 'networkidle' });

  await page.evaluate(() => {
    state.currentLevelIndex = 8;
    state.mode = 'title';
    state.totalBones = LEVELS[8].totalBones;
    state.bonesCollected = 0;
    renderRunSummary(LEVELS[8]);
    openLevelSelect();
  });

  await page.waitForSelector('#henry-progress-tip');

  const result = await page.evaluate(() => {
    const pill = document.getElementById('henry-progress-tip');
    return {
      text: pill?.textContent?.trim(),
      ariaLabel: pill?.getAttribute('aria-label'),
      title: pill?.title,
      tone: pill?.dataset.tone,
      theme: pill?.dataset.theme,
      visible: !!pill && !!pill.offsetParent,
    };
  });

  const expectedText = '💡 Tip: ↓ Dig · BARK fast';
  const expectedAccessible = 'Tip: Hold ↓ to dig, then add BARK to chew through dirt faster.';

  if (!result.visible) throw new Error('Short tip pill is not visible');
  if (result.text !== expectedText) {
    throw new Error(`Unexpected short tip text: ${result.text}`);
  }
  if (result.ariaLabel !== expectedAccessible) {
    throw new Error(`Unexpected short tip aria-label: ${result.ariaLabel}`);
  }
  if (result.title !== expectedAccessible) {
    throw new Error(`Unexpected short tip title: ${result.title}`);
  }
  if (result.tone !== 'tip' || result.theme !== 'tunnel') {
    throw new Error(`Unexpected short tip styling: ${JSON.stringify(result)}`);
  }

  await page.locator('.level-select-card').screenshot({ path: 'changelog/2026-08-01-henry-progress-short-tip.png' });
  console.log(JSON.stringify(result, null, 2));
  await browser.close();
})();
