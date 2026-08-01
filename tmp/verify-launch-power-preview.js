const { chromium } = require('playwright');

(async() => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1400 } });
  await page.goto('http://127.0.0.1:8123', { waitUntil: 'networkidle' });

  const result = await page.evaluate(() => {
    state.mode = 'title';
    state.currentLevelIndex = 8;
    levelRuntime = hydrateLevelRuntime(LEVELS[8]);
    renderHenryProgress();
    render();

    const pill = document.getElementById('summary-power');
    if (!pill) throw new Error('summary power pill missing');
    const before = getComputedStyle(pill, '::before');
    return {
      text: pill.textContent.trim(),
      tone: pill.dataset.tone,
      powerState: pill.dataset.powerState,
      ariaLabel: pill.getAttribute('aria-label'),
      progress: pill.style.getPropertyValue('--summary-progress').trim(),
      beforeBackground: before.backgroundImage,
    };
  });

  if (result.text !== 'Bark · Dig ↓') {
    throw new Error(`Expected tunnel preview text, got ${result.text}`);
  }
  if (result.tone !== 'warning') {
    throw new Error(`Expected warning tone, got ${result.tone}`);
  }
  if (result.powerState !== 'preview-dig') {
    throw new Error(`Expected preview-dig state, got ${result.powerState}`);
  }
  if (result.progress !== '100%') {
    throw new Error(`Expected 100% preview fill, got ${result.progress}`);
  }
  if (!result.ariaLabel || !result.ariaLabel.includes('tunnel stage uses hold down to dig')) {
    throw new Error(`Unexpected aria label: ${result.ariaLabel}`);
  }
  if (!result.beforeBackground.includes('255, 193, 108')) {
    throw new Error(`Unexpected preview gradient: ${result.beforeBackground}`);
  }

  await page.screenshot({
    path: '/Users/danieljobe/.openclaw/workspace/projects/dachshund-dash/changelog/2026-07-23-launch-power-preview-tunnel.png',
    fullPage: true,
  });

  console.log(JSON.stringify(result, null, 2));
  await browser.close();
})();
