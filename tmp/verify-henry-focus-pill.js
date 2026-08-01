const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1600, height: 1800 } });
  const outPath = path.resolve('changelog/2026-07-14-henry-focus-pill.png');

  try {
    await page.goto('http://127.0.0.1:8080', { waitUntil: 'networkidle' });
    await page.addStyleTag({ content: `*, *::before, *::after { animation: none !important; transition: none !important; }` });
    await page.keyboard.type('henry');
    const level9 = page.getByRole('button', { name: /Level 9/i });
    await level9.waitFor({ state: 'visible' });

    const focus = level9.locator('.level-btn-focus');
    await focus.waitFor({ state: 'visible' });

    const text = (await focus.innerText()).trim();
    const aria = await focus.getAttribute('aria-label');
    const cardTheme = await level9.getAttribute('data-theme');

    if (text !== '↓ DIG + BARK') throw new Error(`Unexpected focus text: ${text}`);
    if (cardTheme !== 'tunnel') throw new Error(`Unexpected card theme: ${cardTheme}`);
    if (!aria || !aria.includes('hold down to dig')) throw new Error(`Unexpected focus aria-label: ${aria}`);

    await level9.screenshot({ path: outPath });
    console.log(JSON.stringify({ ok: true, text, aria, cardTheme, screenshot: outPath }));
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error && error.stack ? error.stack : String(error));
  process.exit(1);
});
