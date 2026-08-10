const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1400 } });
  const screenshotPath = path.resolve(__dirname, '..', 'changelog', '2026-08-09-mobile-controls-subtitle.png');

  try {
    await page.goto('http://127.0.0.1:8080', { waitUntil: 'networkidle' });

    const defaultState = await page.evaluate(() => {
      state.currentLevelIndex = 0;
      state.mode = 'start';
      state.totalBones = LEVELS[0].totalBones;
      state.bonesCollected = 0;
      renderRunSummary(LEVELS[0]);
      setTouchControlsVisible(true, false);
      const subtitle = document.getElementById('mobile-controls-subtitle');
      return {
        subtitle: subtitle?.textContent?.replace(/\s+/g, ' ').trim() || '',
        ariaLabel: subtitle?.getAttribute('aria-label') || '',
        title: subtitle?.title || '',
      };
    });

    if (defaultState.subtitle !== '▲ start · BARK attack · HENRY portal') {
      throw new Error(`Default mobile subtitle mismatch: ${defaultState.subtitle}`);
    }
    if (!defaultState.ariaLabel.includes('Mobile title-screen controls.')) {
      throw new Error(`Default subtitle aria-label mismatch: ${defaultState.ariaLabel}`);
    }

    const tunnelState = await page.evaluate(() => {
      state.currentLevelIndex = 8;
      state.mode = 'title';
      state.totalBones = LEVELS[8].totalBones;
      state.bonesCollected = 0;
      renderRunSummary(LEVELS[8]);
      setTouchControlsVisible(true, false);
      const subtitle = document.getElementById('mobile-controls-subtitle');
      return {
        subtitle: subtitle?.textContent?.replace(/\s+/g, ' ').trim() || '',
        ariaLabel: subtitle?.getAttribute('aria-label') || '',
        title: subtitle?.title || '',
      };
    });

    if (tunnelState.subtitle !== '▲ start · BARK attack · DIG hold · HENRY portal') {
      throw new Error(`Tunnel mobile subtitle mismatch: ${tunnelState.subtitle}`);
    }
    if (tunnelState.title !== tunnelState.subtitle) {
      throw new Error(`Tunnel subtitle title mismatch: ${tunnelState.title}`);
    }

    const waterState = await page.evaluate(() => {
      state.currentLevelIndex = 2;
      state.mode = 'title';
      state.totalBones = LEVELS[2].totalBones;
      state.bonesCollected = 0;
      renderRunSummary(LEVELS[2]);
      setTouchControlsVisible(true, false);
      const subtitle = document.getElementById('mobile-controls-subtitle');
      return {
        subtitle: subtitle?.textContent?.replace(/\s+/g, ' ').trim() || '',
      };
    });

    if (waterState.subtitle !== '▲ start · BARK attack · DIVE hold · HENRY portal') {
      throw new Error(`Water mobile subtitle mismatch: ${waterState.subtitle}`);
    }

    await page.evaluate(() => {
      state.currentLevelIndex = 8;
      state.mode = 'title';
      state.totalBones = LEVELS[8].totalBones;
      state.bonesCollected = 0;
      renderRunSummary(LEVELS[8]);
      setTouchControlsVisible(true, false);
    });

    await page.locator('#mobile-controls-panel').screenshot({ path: screenshotPath });
    console.log(JSON.stringify({ ok: true, screenshotPath, defaultState, tunnelState, waterState }, null, 2));
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error && error.stack ? error.stack : String(error));
  process.exit(1);
});
