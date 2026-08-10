const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1400 } });
  await page.goto('http://127.0.0.1:8123', { waitUntil: 'networkidle' });

  const result = await page.evaluate(() => {
    const chips = Array.from(document.querySelectorAll('.controls-help-chips .control-chip')).map((chip) => ({
      text: chip.textContent.replace(/\s+/g, ' ').trim(),
      important: chip.classList.contains('control-chip-important'),
      bg: window.getComputedStyle(chip).backgroundImage,
      borderColor: window.getComputedStyle(chip).borderColor,
      labelColor: window.getComputedStyle(chip.querySelector('.control-chip-label')).color,
    }));
    const pauseChip = chips.find((chip) => /^Pause\s+P \/ Esc$/i.test(chip.text));
    return { count: chips.length, chips, pauseChip };
  });

  if (result.count < 7) throw new Error(`Expected at least 7 control chips, found ${result.count}`);
  if (!result.pauseChip) throw new Error(`Pause chip missing: ${JSON.stringify(result.chips, null, 2)}`);
  if (!result.pauseChip.important) throw new Error('Pause chip is missing the emphasis class');
  if (!/rgb\(255, 210, 158\)/.test(result.pauseChip.labelColor)) {
    throw new Error(`Pause chip label color mismatch: ${result.pauseChip.labelColor}`);
  }

  await page.locator('.controls-help').screenshot({ path: 'changelog/2026-08-06-pause-shortcut-chip.png' });
  console.log(JSON.stringify(result, null, 2));
  await browser.close();
})();
