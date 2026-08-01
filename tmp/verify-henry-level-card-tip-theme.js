const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1600, height: 1400 } });
  await page.goto('http://127.0.0.1:8080', { waitUntil: 'networkidle' });

  await page.evaluate(() => {
    state.currentLevelIndex = 3;
    state.mode = 'title';
    state.totalBones = LEVELS[3].totalBones;
    state.bonesCollected = 0;
    renderRunSummary(LEVELS[3]);
    openLevelSelect();
  });

  await page.addStyleTag({ content: '* { animation: none !important; transition: none !important; }' });
  await page.waitForSelector('.level-btn[data-current="true"] .level-btn-tip');

  const result = await page.evaluate(() => {
    const card = document.querySelector('.level-btn[data-current="true"]');
    const tip = card?.querySelector('.level-btn-tip');
    if (!card || !tip) return null;
    const styles = window.getComputedStyle(tip);
    return {
      text: tip.textContent?.trim(),
      theme: card.getAttribute('data-theme'),
      backgroundColor: styles.backgroundColor,
      borderColor: styles.borderColor,
      color: styles.color,
      visible: !!tip.offsetParent,
    };
  });

  if (!result) throw new Error('Could not find current HENRY level card tip');
  if (!result.visible) throw new Error('HENRY level card tip is not visible');
  if (result.theme !== 'moon') throw new Error(`Expected moon theme, got ${result.theme}`);
  if (result.text !== 'Tip: Let floaty jumps breathe—tap early and land gently on the next platform.') {
    throw new Error(`Unexpected tip text: ${result.text}`);
  }
  if (result.backgroundColor !== 'rgba(52, 58, 106, 0.24)') {
    throw new Error(`Unexpected moon tip background: ${result.backgroundColor}`);
  }
  if (result.borderColor !== 'rgba(220, 230, 255, 0.24)') {
    throw new Error(`Unexpected moon tip border: ${result.borderColor}`);
  }

  await page.locator('.level-btn[data-current="true"] .level-btn-tip').screenshot({ path: 'changelog/2026-07-20-henry-level-card-tip-theme.png' });
  console.log(JSON.stringify(result, null, 2));
  await browser.close();
})();
