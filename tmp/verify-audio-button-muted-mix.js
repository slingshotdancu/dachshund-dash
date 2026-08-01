const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1500 } });
  const outPath = path.resolve('changelog/2026-07-31-audio-button-muted-mix.png');

  try {
    await page.goto('http://127.0.0.1:8123', { waitUntil: 'networkidle' });

    const initialAudio = await page.locator('#btn-audio').evaluate((el) => ({
      text: (el.textContent || '').trim(),
      theme: el.dataset.theme || '',
      title: el.title || '',
      muted: el.classList.contains('muted'),
    }));

    if (initialAudio.text !== '🔊 Intro mix') {
      throw new Error(`Expected initial Intro mix label, got ${initialAudio.text}`);
    }
    if (initialAudio.theme !== 'classic' || initialAudio.muted) {
      throw new Error(`Unexpected initial audio state: ${JSON.stringify(initialAudio)}`);
    }

    await page.keyboard.type('henry', { delay: 40 });
    await page.waitForSelector('#level-select:not(.hidden)');
    await page.locator('#level-list .level-btn').nth(9).click({ force: true });
    await page.keyboard.press('Escape');
    await page.waitForFunction(() => document.getElementById('level-select')?.classList.contains('hidden'));
    await page.waitForFunction(() => {
      const btn = document.getElementById('btn-audio');
      return btn && (btn.textContent || '').trim() === '🔊 Boss mix' && btn.dataset.theme === 'boss';
    });

    await page.keyboard.press('m');
    await page.waitForFunction(() => {
      const btn = document.getElementById('btn-audio');
      return btn && btn.classList.contains('muted') && (btn.textContent || '').trim() === '🔇 Boss mix';
    });
    await page.waitForTimeout(200);

    const mutedBossAudio = await page.locator('#btn-audio').evaluate((el) => ({
      text: (el.textContent || '').trim(),
      theme: el.dataset.theme || '',
      title: el.title || '',
      aria: el.getAttribute('aria-label') || '',
      hint: el.parentElement?.querySelector('.utility-btn-hint')?.textContent?.trim() || '',
      muted: el.classList.contains('muted'),
    }));

    if (mutedBossAudio.text !== '🔇 Boss mix') {
      throw new Error(`Expected muted Boss mix label, got ${mutedBossAudio.text}`);
    }
    if (mutedBossAudio.theme !== 'boss' || !mutedBossAudio.muted) {
      throw new Error(`Unexpected muted boss state: ${JSON.stringify(mutedBossAudio)}`);
    }
    if (!mutedBossAudio.title.includes('Boss mix muted')) {
      throw new Error(`Unexpected muted title: ${mutedBossAudio.title}`);
    }
    if (!mutedBossAudio.aria.includes('Unmute boss arena soundtrack')) {
      throw new Error(`Unexpected muted aria: ${mutedBossAudio.aria}`);
    }
    if (!mutedBossAudio.hint.includes('restore the boss arena soundtrack')) {
      throw new Error(`Unexpected muted hint: ${mutedBossAudio.hint}`);
    }

    await page.screenshot({ path: outPath, fullPage: true });
    console.log(JSON.stringify({ ok: true, initialAudio, mutedBossAudio, screenshot: outPath }, null, 2));
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error && error.stack ? error.stack : String(error));
  process.exit(1);
});
