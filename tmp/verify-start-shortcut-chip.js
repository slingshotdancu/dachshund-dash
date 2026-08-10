const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1400 } });
  await page.goto('http://127.0.0.1:8123', { waitUntil: 'networkidle' });

  const result = await page.evaluate(() => {
    const chips = Array.from(document.querySelectorAll('.controls-help-chips .control-chip')).map((chip) => ({
      text: chip.textContent.replace(/\s+/g, ' ').trim(),
      start: chip.classList.contains('control-chip-start'),
      important: chip.classList.contains('control-chip-important'),
      borderColor: window.getComputedStyle(chip).borderColor,
      labelColor: window.getComputedStyle(chip.querySelector('.control-chip-label')).color,
      backgroundImage: window.getComputedStyle(chip).backgroundImage,
    }));
    const startChip = chips.find((chip) => /^Start\s+Enter \/ W \/ ↑ \/ Space$/i.test(chip.text));
    return { count: chips.length, chips, startChip };
  });

  if (result.count < 8) throw new Error(`Expected at least 8 control chips, found ${result.count}`);
  if (!result.startChip) throw new Error(`Start chip missing: ${JSON.stringify(result.chips, null, 2)}`);
  if (!result.startChip.start) throw new Error('Start chip is missing the start emphasis class');
  if (!/rgb\(191, 255, 210\)/.test(result.startChip.labelColor)) {
    throw new Error(`Start chip label color mismatch: ${result.startChip.labelColor}`);
  }

  await page.locator('.controls-help').screenshot({ path: 'changelog/2026-08-06-start-shortcut-chip.png' });
  console.log(JSON.stringify(result, null, 2));
  await browser.close();
})();
