const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1700 } });
  const outPath = path.resolve('changelog/2026-07-29-goal-preview-icons.png');

  try {
    await page.goto('http://127.0.0.1:8080', { waitUntil: 'networkidle' });
    await page.evaluate(() => {
      loadLevel(8);
      openLevelSelect();
      render();
    });

    const expected = await page.evaluate(() => {
      const level = LEVELS[8];
      return {
        summaryGoal: `🦴 ${level.totalBones} • ⬒ Dig • 🏁 Flag`,
        startContext: `Level 9 · ⬒ ${levelSelectStageText(level)} · 🦴 ${level.totalBones} • ⬒ Dig • 🏁 Flag`,
        goalLabel: `Goal: ${level.totalBones} bones • dig dirt • flag`,
      };
    });

    await page.waitForFunction((exp) => {
      const summaryGoal = document.getElementById('summary-goal');
      const startContext = document.getElementById('start-action-context');
      const portalGoal = document.getElementById('henry-progress-goal');
      const currentCardGoal = document.querySelector('#level-list .level-btn[data-current="true"] .level-btn-goal');
      return summaryGoal && startContext && portalGoal && currentCardGoal
        && (summaryGoal.textContent || '').trim() === exp.summaryGoal
        && (startContext.textContent || '').trim() === exp.startContext
        && (portalGoal.textContent || '').trim() === exp.summaryGoal
        && (currentCardGoal.textContent || '').trim() === exp.summaryGoal;
    }, expected);
    await page.waitForTimeout(250);

    const details = await page.evaluate(() => {
      const summaryGoal = document.getElementById('summary-goal');
      const startContext = document.getElementById('start-action-context');
      const portalGoal = document.getElementById('henry-progress-goal');
      const currentCardGoal = document.querySelector('#level-list .level-btn[data-current="true"] .level-btn-goal');
      return {
        summaryGoalText: (summaryGoal?.textContent || '').trim(),
        summaryGoalAria: summaryGoal?.getAttribute('aria-label') || '',
        startContextText: (startContext?.textContent || '').trim(),
        startContextAria: startContext?.getAttribute('aria-label') || '',
        portalGoalText: (portalGoal?.textContent || '').trim(),
        portalGoalTitle: portalGoal?.getAttribute('title') || '',
        currentCardGoalText: (currentCardGoal?.textContent || '').trim(),
        currentCardGoalTitle: currentCardGoal?.getAttribute('title') || '',
      };
    });

    if (details.summaryGoalText !== expected.summaryGoal) {
      throw new Error(`Unexpected summary goal: ${details.summaryGoalText}`);
    }
    if (details.summaryGoalAria !== `Goal status: ${expected.summaryGoal}. Goal preview: ${expected.goalLabel.replace(/^Goal:\s*/, '')}.`) {
      throw new Error(`Unexpected summary goal aria: ${details.summaryGoalAria}`);
    }
    if (details.startContextText !== expected.startContext) {
      throw new Error(`Unexpected start context: ${details.startContextText}`);
    }
    if (!details.startContextAria.includes(expected.goalLabel)) {
      throw new Error(`Missing goal label in start context aria: ${details.startContextAria}`);
    }
    if (details.portalGoalText !== expected.summaryGoal) {
      throw new Error(`Unexpected portal goal: ${details.portalGoalText}`);
    }
    if (details.portalGoalTitle !== expected.goalLabel) {
      throw new Error(`Unexpected portal goal title: ${details.portalGoalTitle}`);
    }
    if (details.currentCardGoalText !== expected.summaryGoal) {
      throw new Error(`Unexpected current card goal: ${details.currentCardGoalText}`);
    }
    if (details.currentCardGoalTitle !== expected.goalLabel) {
      throw new Error(`Unexpected current card goal title: ${details.currentCardGoalTitle}`);
    }

    await page.screenshot({ path: outPath, fullPage: true });
    console.log(JSON.stringify({ ok: true, ...details, screenshot: outPath }));
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error && error.stack ? error.stack : String(error));
  process.exit(1);
});
