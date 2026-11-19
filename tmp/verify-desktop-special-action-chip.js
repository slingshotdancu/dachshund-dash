const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1400 } });
  const screenshotPath = path.resolve(__dirname, '..', 'changelog', '2026-08-11-desktop-special-action-chip.png');

  try {
    await page.goto('http://127.0.0.1:8123', { waitUntil: 'networkidle' });

    const defaultState = await page.evaluate(() => {
      state.currentLevelIndex = 0;
      state.mode = 'start';
      state.totalBones = LEVELS[0].totalBones;
      state.bonesCollected = 0;
      renderRunSummary(LEVELS[0]);
      const chip = document.getElementById('control-chip-special');
      const label = document.getElementById('control-chip-special-label');
      const text = document.getElementById('control-chip-special-text');
      return {
        label: label?.textContent?.trim() || '',
        text: text?.textContent?.replace(/\s+/g, ' ').trim() || '',
        theme: chip?.dataset.theme || '',
        ariaLabel: chip?.getAttribute('aria-label') || '',
      };
    });

    if (defaultState.label !== 'Dive' || defaultState.text !== 'S / ↓ while flying' || defaultState.theme !== 'default') {
      throw new Error(`Default special action chip mismatch: ${JSON.stringify(defaultState)}`);
    }

    const tunnelState = await page.evaluate(() => {
      state.currentLevelIndex = 8;
      state.mode = 'title';
      state.totalBones = LEVELS[8].totalBones;
      state.bonesCollected = 0;
      renderRunSummary(LEVELS[8]);
      const chip = document.getElementById('control-chip-special');
      const label = document.getElementById('control-chip-special-label');
      const text = document.getElementById('control-chip-special-text');
      return {
        label: label?.textContent?.trim() || '',
        text: text?.textContent?.replace(/\s+/g, ' ').trim() || '',
        theme: chip?.dataset.theme || '',
        ariaLabel: chip?.getAttribute('aria-label') || '',
        title: chip?.title || '',
      };
    });

    if (tunnelState.label !== 'Dig' || tunnelState.text !== 'Hold ↓ · BARK boost' || tunnelState.theme !== 'tunnel') {
      throw new Error(`Tunnel special action chip mismatch: ${JSON.stringify(tunnelState)}`);
    }
    if (!/dig through dirt/i.test(tunnelState.ariaLabel)) {
      throw new Error(`Tunnel special action chip aria-label mismatch: ${tunnelState.ariaLabel}`);
    }
    if (tunnelState.title !== tunnelState.ariaLabel) {
      throw new Error(`Tunnel special action chip title mismatch: ${tunnelState.title}`);
    }

    const waterState = await page.evaluate(() => {
      state.currentLevelIndex = 2;
      state.mode = 'title';
      state.totalBones = LEVELS[2].totalBones;
      state.bonesCollected = 0;
      renderRunSummary(LEVELS[2]);
      const chip = document.getElementById('control-chip-special');
      const label = document.getElementById('control-chip-special-label');
      const text = document.getElementById('control-chip-special-text');
      return {
        label: label?.textContent?.trim() || '',
        text: text?.textContent?.replace(/\s+/g, ' ').trim() || '',
        theme: chip?.dataset.theme || '',
      };
    });

    if (waterState.label !== 'Dive' || waterState.text !== 'S / ↓ hold underwater' || waterState.theme !== 'water') {
      throw new Error(`Water special action chip mismatch: ${JSON.stringify(waterState)}`);
    }

    await page.evaluate(() => {
      state.currentLevelIndex = 8;
      state.mode = 'title';
      state.totalBones = LEVELS[8].totalBones;
      state.bonesCollected = 0;
      renderRunSummary(LEVELS[8]);
    });

    await page.locator('#control-chip-special').screenshot({ path: screenshotPath });
    console.log(JSON.stringify({ ok: true, screenshotPath, defaultState, tunnelState, waterState }, null, 2));
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error && error.stack ? error.stack : String(error));
  process.exit(1);
});
