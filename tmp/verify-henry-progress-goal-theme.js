const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1600 } });
  const url = 'http://127.0.0.1:8080';
  const screenshotPath = path.resolve(__dirname, '..', 'changelog', '2026-07-16-henry-progress-goal-theme.png');

  await page.goto(url, { waitUntil: 'networkidle' });
  await page.locator('body').click();
  await page.evaluate(() => {
    window.loadLevel(3, { resetLives: true });
    window.openLevelSelect();
  });
  await page.waitForSelector('#level-select:not(.hidden)');

  const goalPill = page.locator('#henry-progress-goal');
  const goalTheme = await goalPill.getAttribute('data-theme');
  const goalText = (await goalPill.textContent())?.trim();
  const bgColor = await goalPill.evaluate((el) => getComputedStyle(el).backgroundColor);

  if (goalTheme !== 'moon') {
    throw new Error(`Expected moon goal theme, got: ${goalTheme}`);
  }
  if (!goalText || !goalText.toLowerCase().includes('bones')) {
    throw new Error(`Unexpected goal text: ${goalText}`);
  }
  if (bgColor !== 'rgba(57, 66, 126, 0.48)') {
    throw new Error(`Unexpected goal background color: ${bgColor}`);
  }

  await page.locator('#level-select .level-select-card').screenshot({ path: screenshotPath });
  console.log(JSON.stringify({ ok: true, goalTheme, goalText, bgColor, screenshotPath }));
  await browser.close();
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
