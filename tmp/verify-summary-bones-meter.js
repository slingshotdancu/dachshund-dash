const { chromium } = require('playwright');
const path = require('path');

const screenshotPath = path.join(__dirname, '..', 'changelog', '2026-07-25-summary-bones-progress-pill.png');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });

  await page.goto('http://127.0.0.1:8080', { waitUntil: 'networkidle' });
  await page.evaluate(() => {
    state.mode = 'playing';
    state.currentLevelIndex = 3;
    levelRuntime = LEVELS[3];
    state.totalBones = levelRuntime.totalBones;
    state.bonesCollected = Math.max(1, Math.floor(state.totalBones / 2));
    state.levelRespawnsLeft = LEVEL_RESPAWNS;
    state.combat.barkCooldownUntil = 0;
    state.capeUntil = 0;
    statusEl.textContent = 'Verification snapshot.';
    renderRunSummary(levelRuntime);
  });

  const result = await page.evaluate(() => {
    const bones = document.getElementById('summary-bones');
    const style = getComputedStyle(bones, '::before');
    return {
      text: bones.textContent,
      tone: bones.dataset.tone,
      progress: bones.style.getPropertyValue('--summary-progress').trim(),
      beforeBackground: style.backgroundImage,
      aria: bones.getAttribute('aria-label'),
      title: bones.title,
    };
  });

  if (result.text !== 'Bones 3/6') throw new Error(`Unexpected bones text: ${result.text}`);
  if (result.tone !== 'collect') throw new Error(`Unexpected bones tone: ${result.tone}`);
  if (result.progress !== '50%') throw new Error(`Unexpected bones progress: ${result.progress}`);
  if (!/gradient/i.test(result.beforeBackground)) throw new Error(`Missing gradient background: ${result.beforeBackground}`);
  if (result.aria !== 'Bones collected: 3 of 6') throw new Error(`Unexpected aria label: ${result.aria}`);

  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log(JSON.stringify({ ok: true, screenshotPath, result }, null, 2));

  await browser.close();
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
