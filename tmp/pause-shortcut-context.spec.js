const { test, expect } = require('@playwright/test');

test('pause button only shows its shortcut once a run is active', async ({ page }) => {
  await page.goto('http://127.0.0.1:8125/index.html');

  const pauseBtn = page.locator('#btn-pause-desktop');
  await expect(pauseBtn).toHaveText('Run first');
  await expect(pauseBtn).toHaveAttribute('data-shortcut', '');

  await page.locator('.utility-actions').screenshot({ path: 'changelog/2026-07-06-pause-shortcut-contextual.png' });

  await page.evaluate(() => {
    state.mode = 'playing';
    render();
  });
  await expect(pauseBtn).toHaveText('Pause');
  await expect(pauseBtn).toHaveAttribute('data-shortcut', 'P / Esc');
});
