const { test, expect } = require('@playwright/test');

test('HENRY quick jump button shows visible stage name badge', async ({ page }) => {
  await page.goto('http://127.0.0.1:8124/index.html');
  await page.evaluate(() => {
    loadLevel(3, { resetLives: true });
    openLevelSelect();
  });
  const button = page.locator('#henry-progress-jump');
  await expect(button).toHaveAttribute('data-theme', 'moon');
  await expect(button.locator('.henry-progress-action-theme')).toHaveText('◔ Moon');
  await expect(button.locator('.henry-progress-action-label')).toHaveText('Jump to Level 4');
  await page.locator('#level-select .level-select-card').screenshot({ path: 'changelog/2026-07-06-henry-quick-jump-stage-name.png' });
});
