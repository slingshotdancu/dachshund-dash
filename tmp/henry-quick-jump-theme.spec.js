const { test, expect } = require('@playwright/test');

test('HENRY quick jump button shows target theme icon and tint', async ({ page }) => {
  await page.goto('http://127.0.0.1:8123/index.html');
  await page.evaluate(() => {
    loadLevel(3, { resetLives: true });
    openLevelSelect();
  });
  await expect(page.locator('#level-select')).not.toHaveClass(/hidden/);
  const button = page.locator('#henry-progress-jump');
  await expect(button).toHaveAttribute('data-theme', 'moon');
  await expect(button).toHaveAttribute('title', /Moon/);
  await expect(button).toHaveAttribute('aria-label', /moon stage/i);
  await expect(button).toHaveText('◔ Jump to Level 4');
  await page.locator('#level-select .level-select-card').screenshot({ path: 'changelog/2026-07-06-henry-quick-jump-theme-button.png' });
});
