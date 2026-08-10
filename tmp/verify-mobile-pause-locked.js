const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1400 } });
  const screenshotPath = path.resolve(__dirname, '..', 'changelog', '2026-08-10-mobile-pause-locked.png');

  try {
    await page.goto('http://127.0.0.1:8080', { waitUntil: 'networkidle' });

    await page.evaluate(() => {
      state.currentLevelIndex = 0;
      state.mode = 'start';
      state.totalBones = LEVELS[0].totalBones;
      state.bonesCollected = 0;
      renderRunSummary(LEVELS[0]);
      setTouchControlsVisible(true, false);
    });
    await page.waitForTimeout(80);

    const startState = await page.evaluate(() => {
      const pauseBtn = document.getElementById('btn-pause');
      const caption = document.getElementById('mobile-control-caption-pause');
      return {
        text: pauseBtn?.textContent?.trim() || '',
        disabled: Boolean(pauseBtn?.disabled),
        ariaLabel: pauseBtn?.getAttribute('aria-label') || '',
        state: pauseBtn?.dataset.state || '',
        caption: caption?.textContent?.trim() || '',
      };
    });

    if (startState.text !== 'RUN FIRST') {
      throw new Error(`Expected locked title-screen label, got: ${startState.text}`);
    }
    if (!startState.disabled) {
      throw new Error('Expected title-screen pause button to be disabled.');
    }
    if (startState.caption !== 'Pause locked') {
      throw new Error(`Expected locked caption, got: ${startState.caption}`);
    }

    await page.evaluate(() => {
      state.currentLevelIndex = 0;
      state.mode = 'playing';
      renderRunSummary(LEVELS[0]);
    });
    await page.waitForTimeout(80);

    const playingState = await page.evaluate(() => {
      const pauseBtn = document.getElementById('btn-pause');
      const caption = document.getElementById('mobile-control-caption-pause');
      return {
        text: pauseBtn?.textContent?.trim() || '',
        disabled: Boolean(pauseBtn?.disabled),
        ariaLabel: pauseBtn?.getAttribute('aria-label') || '',
        state: pauseBtn?.dataset.state || '',
        caption: caption?.textContent?.trim() || '',
      };
    });

    if (playingState.text !== 'PAUSE' || playingState.disabled) {
      throw new Error(`Expected active playing pause button, got: ${JSON.stringify(playingState)}`);
    }
    if (playingState.caption !== 'Pause / resume') {
      throw new Error(`Expected active caption, got: ${playingState.caption}`);
    }

    await page.evaluate(() => {
      state.currentLevelIndex = 0;
      state.mode = 'paused';
      renderRunSummary(LEVELS[0]);
    });
    await page.waitForTimeout(80);

    const pausedState = await page.evaluate(() => {
      const pauseBtn = document.getElementById('btn-pause');
      return {
        text: pauseBtn?.textContent?.trim() || '',
        disabled: Boolean(pauseBtn?.disabled),
        ariaLabel: pauseBtn?.getAttribute('aria-label') || '',
        state: pauseBtn?.dataset.state || '',
      };
    });

    if (pausedState.text !== 'RESUME' || pausedState.disabled) {
      throw new Error(`Expected paused resume button, got: ${JSON.stringify(pausedState)}`);
    }

    await page.evaluate(() => {
      state.currentLevelIndex = 0;
      state.mode = 'start';
      state.totalBones = LEVELS[0].totalBones;
      state.bonesCollected = 0;
      renderRunSummary(LEVELS[0]);
      setTouchControlsVisible(true, false);
    });
    await page.waitForTimeout(80);

    await page.locator('#mobile-controls-panel').screenshot({ path: screenshotPath });
    console.log(JSON.stringify({ ok: true, screenshotPath, startState, playingState, pausedState }, null, 2));
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error && error.stack ? error.stack : String(error));
  process.exit(1);
});
