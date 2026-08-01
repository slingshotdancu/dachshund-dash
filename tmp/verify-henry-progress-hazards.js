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

  await page.waitForSelector('#henry-progress-hazards');

  const result = await page.evaluate(() => {
    const pill = document.getElementById('henry-progress-hazards');
    return {
      text: pill?.textContent?.trim(),
      ariaLabel: pill?.getAttribute('aria-label'),
      tone: pill?.dataset.tone,
      theme: pill?.dataset.theme,
      visible: !!pill && !!pill.offsetParent,
    };
  });

  if (!result.visible) throw new Error('Hazard pill is not visible');
  if (result.text !== '▲ 14 • 🐾 12 • ♛ Boss • 📢 1') {
    throw new Error(`Unexpected hazard pill text: ${result.text}`);
  }
  if (result.ariaLabel !== 'Hazards: 14 spikes, 12 patrols, boss barks, 1 siren slow') {
    throw new Error(`Unexpected hazard aria-label: ${result.ariaLabel}`);
  }
  if (result.tone !== 'hazard' || result.theme !== 'boss') {
    throw new Error(`Unexpected hazard pill styling: ${JSON.stringify(result)}`);
  }

  await page.screenshot({ path: 'changelog/2026-07-19-henry-progress-hazard-pill.png', fullPage: true });
  console.log(JSON.stringify(result, null, 2));
  await browser.close();
})();
