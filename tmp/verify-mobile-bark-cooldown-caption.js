const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1400 } });
  const screenshotPath = path.resolve(__dirname, '..', 'changelog', '2026-08-10-mobile-bark-cooldown-caption.png');

  try {
    await page.goto('http://127.0.0.1:8080', { waitUntil: 'networkidle' });

    await page.evaluate(() => {
      state.currentLevelIndex = 0;
      state.mode = 'start';
      state.totalBones = LEVELS[0].totalBones;
      state.bonesCollected = 0;
      state.combat.barkCooldownUntil = 0;
      renderRunSummary(LEVELS[0]);
      setTouchControlsVisible(true, false);
    });
    await page.waitForTimeout(80);

    const readyState = await page.evaluate(() => {
      const barkBtn = document.getElementById('btn-bark');
      const caption = document.getElementById('mobile-control-caption-bark');
      return {
        text: barkBtn?.textContent?.trim() || '',
        caption: caption?.textContent?.trim() || '',
        ariaLabel: barkBtn?.getAttribute('aria-label') || '',
      };
    });

    if (readyState.text !== 'BARK' || readyState.caption !== 'Attack') {
      throw new Error(`Expected ready bark state, got: ${JSON.stringify(readyState)}`);
    }

    await page.evaluate(() => {
      state.mode = 'playing';
      state.combat.barkCooldownUntil = Date.now() + 1800;
      renderRunSummary(LEVELS[0]);
    });
    await page.waitForTimeout(80);

    const cooldownState = await page.evaluate(() => {
      const barkBtn = document.getElementById('btn-bark');
      const caption = document.getElementById('mobile-control-caption-bark');
      return {
        text: barkBtn?.textContent?.trim() || '',
        caption: caption?.textContent?.trim() || '',
        ariaLabel: barkBtn?.getAttribute('aria-label') || '',
        title: barkBtn?.title || '',
        hasCooldownClass: barkBtn?.classList.contains('cooldown') || false,
      };
    });

    if (!/^BARK [12]$/.test(cooldownState.text)) {
      throw new Error(`Expected cooldown bark countdown, got: ${cooldownState.text}`);
    }
    if (cooldownState.caption !== 'Cooldown') {
      throw new Error(`Expected cooldown caption, got: ${cooldownState.caption}`);
    }
    if (!cooldownState.hasCooldownClass) {
      throw new Error('Expected bark button to keep its cooldown class while recharging.');
    }

    await page.locator('#mobile-controls-panel').screenshot({ path: screenshotPath });
    console.log(JSON.stringify({ ok: true, screenshotPath, readyState, cooldownState }, null, 2));
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error && error.stack ? error.stack : String(error));
  process.exit(1);
});
