const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1400 } });
  await page.goto('http://127.0.0.1:8080', { waitUntil: 'networkidle' });

  await page.evaluate(() => {
    state.currentLevelIndex = 6;
    state.mode = 'title';
    state.totalBones = LEVELS[6].totalBones;
    state.bonesCollected = 0;
    render();
    renderRunSummary(LEVELS[6]);
    renderLaunchStatus();
  });

  const result = await page.evaluate(() => {
    const status = document.getElementById('status');
    const startContext = document.getElementById('start-action-context');
    const summaryGoal = document.getElementById('summary-goal');
    return {
      statusText: status?.textContent?.trim(),
      statusAria: status?.getAttribute('aria-label'),
      startContextText: startContext?.textContent?.trim(),
      startContextAria: startContext?.getAttribute('aria-label'),
      summaryGoalText: summaryGoal?.textContent?.trim(),
      summaryGoalAria: summaryGoal?.getAttribute('aria-label'),
    };
  });

  if (!result.statusText?.includes('💡 Switch')) {
    throw new Error(`Status preview missing switch goal: ${result.statusText}`);
  }
  if (!result.startContextText?.includes('💡 Switch')) {
    throw new Error(`Start context missing switch goal: ${result.startContextText}`);
  }
  if (!result.summaryGoalText?.includes('💡 Switch')) {
    throw new Error(`Summary goal missing switch goal: ${result.summaryGoalText}`);
  }
  if (!result.statusAria?.includes('3 light switches')) {
    throw new Error(`Status aria missing switch count: ${result.statusAria}`);
  }
  if (!result.startContextAria?.includes('3 light switches')) {
    throw new Error(`Start context aria missing switch count: ${result.startContextAria}`);
  }
  if (!result.summaryGoalAria?.includes('3 light switches')) {
    throw new Error(`Summary goal aria missing switch count: ${result.summaryGoalAria}`);
  }

  await page.screenshot({ path: 'changelog/2026-08-04-lights-goal-preview.png', fullPage: true });
  console.log(JSON.stringify(result, null, 2));
  await browser.close();
})();
