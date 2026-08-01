const { chromium } = require('playwright');
const path = require('path');

const screenshotPath = path.join(__dirname, '..', 'changelog', '2026-07-26-summary-level-boss-pill.png');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });

  await page.goto('http://127.0.0.1:8080', { waitUntil: 'networkidle' });
  await page.evaluate(() => {
    state.mode = 'playing';
    state.currentLevelIndex = 9;
    levelRuntime = LEVELS[9];
    state.totalBones = levelRuntime.totalBones;
    state.bonesCollected = 0;
    state.levelRespawnsLeft = LEVEL_RESPAWNS;
    statusEl.textContent = 'Verification snapshot.';
    renderRunSummary(levelRuntime);
  });

  const result = await page.evaluate(() => {
    const level = document.getElementById('summary-level');
    const style = getComputedStyle(level, '::before');
    return {
      text: level.textContent,
      tone: level.dataset.tone,
      progress: level.style.getPropertyValue('--summary-progress').trim(),
      aria: level.getAttribute('aria-label'),
      title: level.title,
      beforeBackground: style.backgroundImage,
      borderColor: getComputedStyle(level).borderColor,
    };
  });

  if (result.text !== 'Level 10 of 20 · ♛ Boss') throw new Error(`Unexpected level text: ${result.text}`);
  if (result.tone !== 'boss-level') throw new Error(`Unexpected level tone: ${result.tone}`);
  if (result.progress !== '50%') throw new Error(`Unexpected level progress: ${result.progress}`);
  if (result.aria !== 'Level 10 of 20 · ♛ Boss. Boss checkpoint. 50% through the 20-level run.') {
    throw new Error(`Unexpected aria label: ${result.aria}`);
  }
  if (!/gradient/i.test(result.beforeBackground)) throw new Error(`Missing fill gradient: ${result.beforeBackground}`);

  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log(JSON.stringify({ ok: true, screenshotPath, result }, null, 2));

  await browser.close();
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
