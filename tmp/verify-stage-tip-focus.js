const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1400 } });
  const outPath = path.resolve('changelog/2026-07-14-stage-tip-focus-badge.png');

  try {
    await page.goto('http://127.0.0.1:8080', { waitUntil: 'networkidle' });
    await page.keyboard.type('henry');
    await page.getByRole('button', { name: /Level 9/i }).click({ force: true });
    await page.waitForTimeout(250);

    const focus = page.locator('#summary-tip-focus');
    await focus.waitFor({ state: 'visible' });

    const text = (await focus.innerText()).trim();
    const aria = await focus.getAttribute('aria-label');
    const theme = await focus.getAttribute('data-theme');
    const tipLabel = (await page.locator('#summary-tip-label').innerText()).trim();

    if (text !== '↓ DIG + BARK') {
      throw new Error(`Unexpected focus text: ${text}`);
    }
    if (theme !== 'tunnel') {
      throw new Error(`Unexpected focus theme: ${theme}`);
    }
    if (!aria || !aria.includes('hold down to dig')) {
      throw new Error(`Unexpected focus aria-label: ${aria}`);
    }
    if (!/TUNNEL/.test(tipLabel)) {
      throw new Error(`Unexpected tip label: ${tipLabel}`);
    }

    await page.screenshot({ path: outPath, fullPage: true });
    console.log(JSON.stringify({ ok: true, text, aria, theme, tipLabel, screenshot: outPath }));
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error && error.stack ? error.stack : String(error));
  process.exit(1);
});
