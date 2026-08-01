const { chromium } = require('playwright');

(async() => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } });
  await page.goto('http://127.0.0.1:8123', { waitUntil: 'networkidle' });

  const result = await page.evaluate(() => {
    state.currentLevelIndex = 0;
    levelRuntime = hydrateLevelRuntime(LEVELS[0]);
    state.mode = 'playing';
    state.bonesCollected = 2;
    state.totalBones = levelRuntime.totalBones;
    state.levelRespawnsLeft = 3;
    state.combat.barkCooldownUntil = Date.now() + (BARK_COOLDOWN_MS / 2);
    state.capeUntil = 0;
    state.toyHeld = false;
    render();

    const pill = document.getElementById('summary-power');
    if (!pill) throw new Error('summary power pill missing');
    const before = getComputedStyle(pill, '::before');
    return {
      text: pill.textContent.trim(),
      tone: pill.dataset.tone,
      powerState: pill.dataset.powerState,
      progress: pill.style.getPropertyValue('--summary-progress').trim(),
      ariaLabel: pill.getAttribute('aria-label'),
      beforeBackground: before.backgroundImage,
      beforeWidth: before.width,
    };
  });

  if (result.powerState !== 'recharge') throw new Error(`Expected recharge state, got ${result.powerState}`);
  if (!result.text.includes('Bark') || !result.text.includes('Cape inactive')) {
    throw new Error(`Unexpected power text: ${result.text}`);
  }
  if (result.progress !== '50%') throw new Error(`Expected 50% progress, got ${result.progress}`);
  if (!result.ariaLabel || !result.ariaLabel.includes('Super bark recharges')) {
    throw new Error(`Unexpected aria label: ${result.ariaLabel}`);
  }
  if (!result.beforeBackground.includes('255, 193, 108')) {
    throw new Error(`Unexpected meter gradient: ${result.beforeBackground}`);
  }

  await page.screenshot({
    path: '/Users/danieljobe/.openclaw/workspace/projects/dachshund-dash/changelog/2026-07-23-summary-power-meter.png',
    fullPage: true,
  });
  console.log(JSON.stringify(result, null, 2));
  await browser.close();
})();
