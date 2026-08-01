const { chromium } = require('playwright');

(async() => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1600 } });
  await page.goto('http://127.0.0.1:8123', { waitUntil: 'networkidle' });

  const result = await page.evaluate(() => {
    const hint = document.querySelector('.utility-btn-hint');
    if (!hint) throw new Error('utility hint not found');
    const style = window.getComputedStyle(hint);
    return {
      text: hint.textContent.trim(),
      fontSize: style.fontSize,
      lineHeight: style.lineHeight,
      color: style.color,
      maxWidth: style.maxWidth,
    };
  });

  if (result.fontSize !== '12.64px') {
    throw new Error(`Expected 12.64px font size, got ${result.fontSize}`);
  }
  if (result.color !== 'rgba(240, 252, 255, 0.94)') {
    throw new Error(`Expected rgba(240, 252, 255, 0.94), got ${result.color}`);
  }
  if (result.maxWidth !== '207.005px') {
    throw new Error(`Expected maxWidth 207.005px, got ${result.maxWidth}`);
  }

  await page.screenshot({ path: 'changelog/2026-07-22-utility-hints-readability.png', fullPage: true });
  console.log(JSON.stringify(result, null, 2));
  await browser.close();
})();
