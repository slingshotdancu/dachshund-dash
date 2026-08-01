const { chromium } = require('playwright');

(async() => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1600 } });
  await page.goto('http://127.0.0.1:8123', { waitUntil: 'networkidle' });

  const result = await page.evaluate(() => {
    state.mode = 'title';
    state.currentLevelIndex = 3;
    levelRuntime = hydrateLevelRuntime(LEVELS[3]);
    renderHenryProgress();
    render();

    const pill = document.getElementById('start-action-context');
    if (!pill) throw new Error('start action context missing');
    const style = getComputedStyle(pill);
    return {
      text: pill.textContent.trim(),
      theme: pill.dataset.theme,
      tone: pill.dataset.tone,
      borderColor: style.borderTopColor,
      backgroundImage: style.backgroundImage,
      color: style.color,
      hidden: pill.hidden,
    };
  });

  if (result.hidden) throw new Error('start action context should be visible');
  if (result.theme !== 'moon') throw new Error(`Expected moon theme, got ${result.theme}`);
  if (!result.text.includes('Level 4') || !result.text.includes('◔ Moon')) {
    throw new Error(`Unexpected text: ${result.text}`);
  }
  if (result.borderColor !== 'rgba(186, 194, 255, 0.34)') {
    throw new Error(`Unexpected border color: ${result.borderColor}`);
  }

  await page.screenshot({ path: '/Users/danieljobe/.openclaw/workspace/projects/dachshund-dash/changelog/2026-07-22-start-action-context-theme.png', fullPage: true });
  console.log(JSON.stringify(result, null, 2));
  await browser.close();
})();
