const { chromium } = require('playwright');

function luminance(pixel) {
  const [r, g, b] = pixel;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1400 } });
  await page.goto('http://127.0.0.1:8080', { waitUntil: 'networkidle' });

  const result = await page.evaluate(() => {
    loadLevel(6);
    state.mode = 'playing';
    state.levelSelectOpen = false;
    state.cameraX = 520;
    state.dog.x = 1320;
    state.dog.y = 420;
    state.dog.vx = 0;
    state.dog.vy = 0;
    state.dog.onGround = true;
    render();

    const light = levelRuntime.lightSwitches[0];
    const canvas = document.getElementById('game');
    const ctx = canvas.getContext('2d');
    const screenX = Math.round(light.x + light.w / 2 - state.cameraX);
    const screenY = Math.round(light.y + light.h / 2);

    const sample = (x, y) => Array.from(ctx.getImageData(x, y, 1, 1).data);
    const center = sample(screenX, screenY);
    const dark = sample(70, screenY);

    return {
      screenX,
      screenY,
      center,
      dark,
      statusText: document.getElementById('status')?.textContent?.trim(),
    };
  });

  const centerLum = luminance(result.center);
  const darkLum = luminance(result.dark);

  if (centerLum - darkLum < 25) {
    throw new Error(`Dark-stage switch beacon too dim at center: center=${centerLum.toFixed(1)} dark=${darkLum.toFixed(1)}`);
  }

  await page.screenshot({ path: 'changelog/2026-08-05-dark-switch-beacon.png', fullPage: true });
  console.log(JSON.stringify({ ...result, centerLum, darkLum }, null, 2));
  await browser.close();
})();
