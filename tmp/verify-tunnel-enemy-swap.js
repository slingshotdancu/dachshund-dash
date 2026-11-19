const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });

  try {
    await page.goto('http://127.0.0.1:8080', { waitUntil: 'networkidle' });

    const result = await page.evaluate(() => {
      const allowedKinds = new Set(['mole', 'mouse']);
      const levelSummaries = LEVELS.map((level) => ({
        id: level.id,
        giantEnemies: Boolean(level.giantEnemies),
        enemyCount: level.enemies.length,
        enemyKinds: level.enemies.map((enemy) => enemy.kind || 'missing'),
        enemySizes: level.enemies.map((enemy) => ({ w: enemy.w, h: enemy.h })),
        bossName: level.boss?.name || null,
      }));

      const invalidLevels = levelSummaries.filter((level) =>
        level.enemyKinds.some((kind) => !allowedKinds.has(kind))
      );

      state.currentLevelIndex = 5;
      loadLevel(5, { resetLives: true, preserveRespawns: false });
      const giantRuntime = levelRuntime.enemies.map((enemy) => ({
        kind: enemy.kind,
        giant: Boolean(enemy.giant),
        w: enemy.w,
        h: enemy.h,
      }));

      return {
        levelSummaries,
        invalidLevels,
        giantRuntime,
      };
    });

    if (result.invalidLevels.length) {
      throw new Error(`Found enemies without tunnel kinds: ${JSON.stringify(result.invalidLevels)}`);
    }

    if (!result.giantRuntime.length || result.giantRuntime.some((enemy) => !enemy.giant || !['mole', 'mouse'].includes(enemy.kind))) {
      throw new Error(`Expected giant stage runtime enemies to be giant tunnel enemies: ${JSON.stringify(result.giantRuntime)}`);
    }

    console.log(JSON.stringify({ ok: true, checkedLevels: result.levelSummaries.length, giantRuntime: result.giantRuntime }, null, 2));
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error && error.stack ? error.stack : String(error));
  process.exit(1);
});
