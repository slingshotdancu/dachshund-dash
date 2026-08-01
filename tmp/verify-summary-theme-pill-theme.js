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

    const pill = document.getElementById('summary-theme');
    if (!pill) throw new Error('summary theme pill missing');
    const style = getComputedStyle(pill);
    return {
      text: pill.textContent.trim(),
      theme: pill.dataset.theme,
      tone: pill.dataset.tone,
      borderColor: pill.style.borderColor,
      backgroundImage: style.backgroundImage,
      color: pill.style.color,
      boxShadow: pill.style.boxShadow,
    };
  });

  if (result.theme !== 'moon') throw new Error(`Expected moon theme, got ${result.theme}`);
  if (result.tone !== 'boost') throw new Error(`Expected boost tone for moon stage, got ${result.tone}`);
  if (!result.text.includes('◔ Stage Moon')) throw new Error(`Unexpected text: ${result.text}`);
  if (result.borderColor !== 'rgba(202, 212, 255, 0.42)') {
    throw new Error(`Unexpected border color: ${result.borderColor}`);
  }
  if (!result.backgroundImage.includes('rgba(58, 68, 126, 0.95)')) {
    throw new Error(`Unexpected background image: ${result.backgroundImage}`);
  }

  if (result.color !== 'rgb(241, 244, 255)') {
    throw new Error(`Unexpected text color: ${result.color}`);
  }
  if (!result.boxShadow.includes('rgba(143, 126, 255, 0.18)')) {
    throw new Error(`Unexpected box shadow: ${result.boxShadow}`);
  }

  await page.screenshot({ path: '/Users/danieljobe/.openclaw/workspace/projects/dachshund-dash/changelog/2026-07-24-summary-theme-pill-stage-accent.png', fullPage: true });
  console.log(JSON.stringify(result, null, 2));
  await browser.close();
})();
