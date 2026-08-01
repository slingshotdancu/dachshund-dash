const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1400 } });
  await page.goto('http://127.0.0.1:8080', { waitUntil: 'networkidle' });

  await page.evaluate(() => {
    state.currentLevelIndex = 19;
    state.mode = 'title';
    state.totalBones = LEVELS[19].totalBones;
    state.bonesCollected = 0;
    renderRunSummary(LEVELS[19]);
    openLevelSelect();
  });

  await page.waitForSelector('#henry-progress-level');

  const result = await page.evaluate(() => {
    const pill = document.getElementById('henry-progress-level');
    const computed = window.getComputedStyle(pill);
    return {
      text: pill?.textContent?.trim(),
      ariaLabel: pill?.getAttribute('aria-label'),
      title: pill?.title,
      tone: pill?.dataset.tone,
      fill: pill?.style.getPropertyValue('--henry-progress-level-fill').trim(),
      backgroundImage: computed.backgroundImage,
      visible: !!pill && !!pill.offsetParent,
    };
  });

  if (!result.visible) throw new Error('Level pill is not visible');
  if (result.text !== 'Default start · Level 20 of 20 · Boss') {
    throw new Error(`Unexpected level pill text: ${result.text}`);
  }
  if (result.fill !== '100%') {
    throw new Error(`Unexpected level pill fill: ${result.fill}`);
  }
  if (result.ariaLabel !== 'Default start · Level 20 of 20 · Boss, campaign progress 100%') {
    throw new Error(`Unexpected level pill aria-label: ${result.ariaLabel}`);
  }
  if (result.title !== 'Campaign progress 100%') {
    throw new Error(`Unexpected level pill title: ${result.title}`);
  }
  if (!result.backgroundImage.includes('linear-gradient')) {
    throw new Error(`Expected gradient background, got: ${result.backgroundImage}`);
  }

  await page.screenshot({ path: 'changelog/2026-07-19-henry-progress-level-fill.png', fullPage: true });
  console.log(JSON.stringify(result, null, 2));
  await browser.close();
})();
