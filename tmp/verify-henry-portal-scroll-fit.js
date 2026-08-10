const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 760 } });
  await page.goto('http://127.0.0.1:8080', { waitUntil: 'networkidle' });
  await page.keyboard.type('henry');
  await page.waitForSelector('#level-select:not(.hidden)');

  const metrics = await page.evaluate(() => {
    const card = document.querySelector('.level-select-card');
    const closeBtn = document.querySelector('.close-level-select');
    if (!card || !closeBtn) {
      return { ok: false, reason: 'Missing level-select card or close button' };
    }

    const before = closeBtn.getBoundingClientRect();
    const cardBefore = card.getBoundingClientRect();
    const styles = window.getComputedStyle(card);
    const closeStyles = window.getComputedStyle(closeBtn);

    card.scrollTop = Math.max(0, Math.floor(card.scrollHeight * 0.5));

    const after = closeBtn.getBoundingClientRect();
    const cardAfter = card.getBoundingClientRect();
    const viewportHeight = window.innerHeight;

    return {
      ok: true,
      cardHeight: cardBefore.height,
      cardScrollHeight: card.scrollHeight,
      viewportHeight,
      overflowY: styles.overflowY,
      maxHeight: styles.maxHeight,
      closePosition: closeStyles.position,
      closeBottomBefore: Math.round(viewportHeight - before.bottom),
      closeBottomAfter: Math.round(viewportHeight - after.bottom),
      closeVisibleAfterScroll: after.bottom <= viewportHeight && after.top >= 0,
      cardFitsViewport: cardAfter.height <= viewportHeight * 0.9,
      cardIsScrollable: card.scrollHeight > card.clientHeight,
      cardTop: Math.round(cardAfter.top),
      cardBottom: Math.round(cardAfter.bottom),
    };
  });

  if (!metrics.ok) throw new Error(metrics.reason);
  if (metrics.overflowY !== 'auto') throw new Error(`Expected overflow-y auto, got ${metrics.overflowY}`);
  if (metrics.closePosition !== 'sticky') throw new Error(`Expected sticky close button, got ${metrics.closePosition}`);
  if (!metrics.cardFitsViewport) throw new Error(`Portal card exceeded viewport: ${metrics.cardHeight}px vs viewport ${metrics.viewportHeight}px`);
  if (!metrics.cardIsScrollable) throw new Error('Expected portal card to scroll on the short viewport');
  if (!metrics.closeVisibleAfterScroll) throw new Error('Expected close button to remain visible after scrolling');

  const screenshotPath = path.join(process.cwd(), 'changelog', '2026-08-02-henry-portal-scroll-fit.png');
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log(JSON.stringify({ verified: true, screenshotPath, metrics }, null, 2));
  await browser.close();
})().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
