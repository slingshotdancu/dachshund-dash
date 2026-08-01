const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1500 } });
  await page.goto('http://127.0.0.1:8080', { waitUntil: 'networkidle' });
  await page.keyboard.type('henry', { delay: 40 });
  await page.waitForSelector('#level-select:not(.hidden)');
  await page.locator('#level-list .level-btn').nth(3).click({ force: true });
  await page.waitForFunction(() => {
    const btn = document.getElementById('btn-start-desktop');
    return btn && btn.textContent.includes('Start Level 4') && btn.dataset.theme === 'moon';
  });
  const text = await page.locator('#btn-start-desktop').innerText();
  const theme = await page.locator('#btn-start-desktop').evaluate(el => el.dataset.theme || '');
  if (!text.includes('◔ Start Level 4')) throw new Error(`Unexpected start label: ${text}`);
  if (theme !== 'moon') throw new Error(`Unexpected theme: ${theme}`);
  await page.screenshot({ path: 'changelog/2026-07-10-start-button-stage-theme.png', fullPage: true });
  console.log(`label=${text}`);
  console.log(`theme=${theme}`);
  await browser.close();
})();
