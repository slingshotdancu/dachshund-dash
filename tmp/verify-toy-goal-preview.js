const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1400 } });
  await page.goto('http://127.0.0.1:8080', { waitUntil: 'networkidle' });

  await page.evaluate(() => {
    const levelIndex = LEVELS.findIndex((level) => (level?.sirens?.length || 0) > 0 || (level?.toys?.length || 0) > 0);
    if (levelIndex < 0) throw new Error('No siren/toy stage found');
    state.currentLevelIndex = levelIndex;
    state.mode = 'title';
    state.totalBones = LEVELS[levelIndex].totalBones;
    state.bonesCollected = 0;
    render();
    renderRunSummary(LEVELS[levelIndex]);
    renderLaunchStatus();
    window.__toyLevelIndex = levelIndex;
  });

  const result = await page.evaluate(() => {
    const status = document.getElementById('status');
    const startContext = document.getElementById('start-action-context');
    const summaryGoal = document.getElementById('summary-goal');
    return {
      levelIndex: window.__toyLevelIndex,
      statusText: status?.textContent?.trim(),
      statusAria: status?.getAttribute('aria-label'),
      startContextText: startContext?.textContent?.trim(),
      startContextAria: startContext?.getAttribute('aria-label'),
      summaryGoalText: summaryGoal?.textContent?.trim(),
      summaryGoalAria: summaryGoal?.getAttribute('aria-label'),
    };
  });

  if (!result.statusText?.includes('🧸 Toy')) {
    throw new Error(`Status preview missing toy goal: ${result.statusText}`);
  }
  if (!result.startContextText?.includes('🧸 Toy')) {
    throw new Error(`Start context missing toy goal: ${result.startContextText}`);
  }
  if (!result.summaryGoalText?.includes('🧸 Toy')) {
    throw new Error(`Summary goal missing toy goal: ${result.summaryGoalText}`);
  }
  if (!result.statusAria?.includes('toy toss')) {
    throw new Error(`Status aria missing toy objective: ${result.statusAria}`);
  }
  if (!result.startContextAria?.includes('toy toss')) {
    throw new Error(`Start context aria missing toy objective: ${result.startContextAria}`);
  }
  if (!result.summaryGoalAria?.includes('toy toss')) {
    throw new Error(`Summary goal aria missing toy objective: ${result.summaryGoalAria}`);
  }

  await page.screenshot({ path: 'changelog/2026-08-04-toy-goal-preview.png', fullPage: true });
  console.log(JSON.stringify(result, null, 2));
  await browser.close();
})();
