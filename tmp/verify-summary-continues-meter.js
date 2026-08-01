const { chromium } = require('playwright');
const path = require('path');

const screenshotPath = path.join(__dirname, '..', 'changelog', '2026-07-26-summary-continues-meter.png');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });

  await page.goto('http://127.0.0.1:8080', { waitUntil: 'networkidle' });
  await page.evaluate(() => {
    state.mode = 'playing';
    state.currentLevelIndex = 3;
    levelRuntime = LEVELS[3];
    state.totalBones = levelRuntime.totalBones;
    state.bonesCollected = 2;
    state.levelRespawnsLeft = 2;
    state.combat.barkCooldownUntil = 0;
    state.capeUntil = 0;
    statusEl.textContent = 'Verification snapshot.';
    renderRunSummary(levelRuntime);
  });

  const result = await page.evaluate(() => {
    const continues = document.getElementById('summary-continues');
    const style = getComputedStyle(continues, '::before');
    return {
      text: continues.textContent,
      tone: continues.dataset.tone,
      continuesState: continues.dataset.continuesState,
      progress: continues.style.getPropertyValue('--summary-progress').trim(),
      aria: continues.getAttribute('aria-label'),
      title: continues.title,
      beforeBackground: style.backgroundImage,
    };
  });

  if (result.text !== 'Continues 2/3') throw new Error(`Unexpected continues text: ${result.text}`);
  if (result.tone !== 'warning') throw new Error(`Unexpected continues tone: ${result.tone}`);
  if (result.continuesState !== 'mid') throw new Error(`Unexpected continues state: ${result.continuesState}`);
  if (result.progress !== '66.66666666666666%') throw new Error(`Unexpected continues progress: ${result.progress}`);
  if (result.aria !== 'Continues status: 2 of 3 continues remaining. Recovery tries are running low.') {
    throw new Error(`Unexpected aria label: ${result.aria}`);
  }
  if (!/gradient/i.test(result.beforeBackground)) throw new Error(`Missing gradient fill: ${result.beforeBackground}`);

  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log(JSON.stringify({ ok: true, screenshotPath, result }, null, 2));

  await browser.close();
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
