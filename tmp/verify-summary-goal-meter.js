const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });

  await page.goto('http://127.0.0.1:8080', { waitUntil: 'networkidle' });
  await page.evaluate(() => {
    state.mode = 'playing';
    state.currentLevelIndex = 3;
    levelRuntime = LEVELS[3];
    state.totalBones = levelRuntime.totalBones;
    state.bonesCollected = 3;
    state.levelRespawnsLeft = LEVEL_RESPAWNS;
    state.combat.barkCooldownUntil = 0;
    state.capeUntil = 0;
    renderRunSummary(levelRuntime);
  });

  const result = await page.evaluate(() => {
    const goal = document.getElementById('summary-goal');
    const style = getComputedStyle(goal, '::before');
    return {
      text: goal.textContent,
      tone: goal.dataset.tone,
      goalState: goal.dataset.goalState,
      progress: goal.style.getPropertyValue('--summary-progress').trim(),
      aria: goal.getAttribute('aria-label'),
      title: goal.title,
      beforeBackground: style.backgroundImage,
    };
  });

  if (result.text !== '3 bones') throw new Error(`Unexpected goal text: ${result.text}`);
  if (result.tone !== 'collect') throw new Error(`Unexpected goal tone: ${result.tone}`);
  if (result.goalState !== 'bones') throw new Error(`Unexpected goal state: ${result.goalState}`);
  if (result.progress !== '50%') throw new Error(`Unexpected goal progress: ${result.progress}`);
  if (result.aria !== 'Goal status: 3 bones. Collected 3 of 6 bones.') throw new Error(`Unexpected aria label: ${result.aria}`);
  if (!/gradient/i.test(result.beforeBackground)) throw new Error(`Missing fill gradient: ${result.beforeBackground}`);

  console.log(JSON.stringify({ ok: true, result }, null, 2));
  await browser.close();
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
