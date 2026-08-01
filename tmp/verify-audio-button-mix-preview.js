const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1500 } });
  const outPath = path.resolve('changelog/2026-07-31-audio-button-mix-preview.png');

  try {
    await page.goto('http://127.0.0.1:8123', { waitUntil: 'networkidle' });

    const initialAudio = await page.locator('#btn-audio').evaluate((el) => ({
      text: (el.textContent || '').trim(),
      theme: el.dataset.theme || '',
      title: el.title || '',
      aria: el.getAttribute('aria-label') || '',
      hint: el.parentElement?.querySelector('.utility-btn-hint')?.textContent?.trim() || '',
    }));

    if (initialAudio.text !== '🔊 Intro mix') {
      throw new Error(`Expected initial Level 1 audio label to be Intro mix, got ${initialAudio.text}`);
    }
    if (initialAudio.theme !== 'classic') {
      throw new Error(`Expected initial classic theme, got ${initialAudio.theme}`);
    }
    if (!initialAudio.hint.includes('Level 1 intro soundtrack')) {
      throw new Error(`Unexpected initial hint: ${initialAudio.hint}`);
    }

    await page.keyboard.type('henry', { delay: 40 });
    await page.waitForSelector('#level-select:not(.hidden)');
    await page.locator('#level-list .level-btn').nth(9).click({ force: true });
    await page.keyboard.press('Escape');
    await page.waitForFunction(() => document.getElementById('level-select')?.classList.contains('hidden'));
    await page.waitForFunction(() => {
      const btn = document.getElementById('btn-audio');
      return btn && (btn.textContent || '').includes('Boss mix') && btn.dataset.theme === 'boss';
    });
    await page.waitForTimeout(200);

    const bossAudio = await page.locator('#btn-audio').evaluate((el) => ({
      text: (el.textContent || '').trim(),
      theme: el.dataset.theme || '',
      title: el.title || '',
      aria: el.getAttribute('aria-label') || '',
      hint: el.parentElement?.querySelector('.utility-btn-hint')?.textContent?.trim() || '',
      boxShadow: getComputedStyle(el).boxShadow,
      background: getComputedStyle(el).backgroundColor,
    }));

    if (bossAudio.text !== '🔊 Boss mix') {
      throw new Error(`Expected boss audio label, got ${bossAudio.text}`);
    }
    if (bossAudio.theme !== 'boss') {
      throw new Error(`Expected boss theme, got ${bossAudio.theme}`);
    }
    if (!bossAudio.aria.includes('boss arena soundtrack')) {
      throw new Error(`Unexpected boss aria-label: ${bossAudio.aria}`);
    }
    if (!bossAudio.hint.includes('boss arena soundtrack')) {
      throw new Error(`Unexpected boss hint: ${bossAudio.hint}`);
    }
    if (!bossAudio.title.includes('Boss mix')) {
      throw new Error(`Unexpected boss title: ${bossAudio.title}`);
    }

    await page.screenshot({ path: outPath, fullPage: true });
    console.log(JSON.stringify({ ok: true, initialAudio, bossAudio, screenshot: outPath }, null, 2));
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error && error.stack ? error.stack : String(error));
  process.exit(1);
});
