const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const mobileOverlayEl = document.getElementById("mobile-immersive-overlay");
const mobileOverlayTitleEl = document.getElementById("mobile-immersive-title");
const mobileOverlayMessageEl = document.getElementById("mobile-immersive-message");
const mobileMotionBtn = document.getElementById("mobile-enable-motion");
const statusEl = document.getElementById("status");
const livesEl = document.getElementById("lives"); // shows lives/continues as dog heads
const livesIconsEl = document.getElementById("lives-icons");
const continuesLabelEl = document.getElementById("continues-label");
const levelSelectEl = document.getElementById("level-select");
const levelListEl = document.getElementById("level-list");
const closeLevelSelectEl = document.getElementById("close-level-select");
const startDesktopBtn = document.getElementById("btn-start-desktop");
const pauseDesktopBtn = document.getElementById("btn-pause-desktop");
const fullscreenBtn = document.getElementById("btn-fullscreen");
const touchControlsBtn = document.getElementById("btn-touch-controls");
const hideTouchControlsBtn = document.getElementById("btn-hide-touch-controls");
const audioBtn = document.getElementById("btn-audio");
const mobileControlsPanelEl = document.getElementById("mobile-controls-panel");
const mobileControlsSubtitleEl = document.getElementById("mobile-controls-subtitle");
const mobileBarkCaptionEl = document.getElementById("mobile-control-caption-bark");
const mobileDigCaptionEl = document.getElementById("mobile-control-caption-dig");
const mobilePauseCaptionEl = document.getElementById("mobile-control-caption-pause");
const recoveryShortcutCalloutEl = document.getElementById("recovery-shortcut-callout");
const summaryLevelEl = document.getElementById("summary-level");
const summaryThemeEl = document.getElementById("summary-theme");
const summaryBonesEl = document.getElementById("summary-bones");
const summaryContinuesEl = document.getElementById("summary-continues");
const summaryPowerEl = document.getElementById("summary-power");
const summaryGoalEl = document.getElementById("summary-goal");
const summaryTipLabelEl = document.getElementById("summary-tip-label");
const summaryTipLevelEl = document.getElementById("summary-tip-level");
const summaryTipLengthEl = document.getElementById("summary-tip-length");
const summaryTipChallengeEl = document.getElementById("summary-tip-challenge");
const summaryTipFocusEl = document.getElementById("summary-tip-focus");
const summaryTipHazardsEl = document.getElementById("summary-tip-hazards");
const summaryTipPickupsEl = document.getElementById("summary-tip-pickups");
const summaryTipEl = document.getElementById("summary-tip");
const startActionContextEl = document.getElementById("start-action-context");
const henryProgressLevelEl = document.getElementById("henry-progress-level");
const henryProgressThemeEl = document.getElementById("henry-progress-theme");
const henryProgressChallengeEl = document.getElementById("henry-progress-challenge");
const henryProgressLengthEl = document.getElementById("henry-progress-length");
const henryProgressGoalEl = document.getElementById("henry-progress-goal");
const henryProgressPickupsEl = document.getElementById("henry-progress-pickups");
const henryProgressHazardsEl = document.getElementById("henry-progress-hazards");
const henryProgressFocusEl = document.getElementById("henry-progress-focus");
const henryProgressTipEl = document.getElementById("henry-progress-tip");
const henryProgressJumpBtn = document.getElementById("henry-progress-jump");

const bgMusic = { handle: null, started: false, token: 0, src: null, loadingToken: null };
let capeAudio = null;
let tornadoAudio = null;
let dieAudio = null;
let capeAmbientAudio = null;

const MAIN_MUSIC = "assets/Henry.wav";
const LEVEL_ONE_MUSIC = ["assets/levelone.wav", "dachshund-dash/assets/levelone.wav"];
const BOSS_MUSIC = "assets/BossLevels.wav";
const LAVA_LEVEL_MUSIC = "assets/lavalevel.wav";
const WATER_LEVEL_MUSIC = "assets/waterlevel.wav";
const MOON_LEVEL_MUSIC = "assets/moonlevel.wav";
const CLOUD_LEVEL_MUSIC = "assets/newlevel.wav";
const GIANT_LEVEL_MUSIC = "assets/giantlevel.wav";
const LIGHTS_LEVEL_MUSIC = "assets/lightslevel.wav";
const LOGO_IMG = "assets/henry/middle.jpg";

function levelMusicProfile(level) {
  if (level?.boss) {
    return {
      src: BOSS_MUSIC,
      label: "Boss mix",
      description: "boss arena soundtrack",
    };
  }
  if (level?.id === 1) {
    return {
      src: LEVEL_ONE_MUSIC,
      label: "Intro mix",
      description: "Level 1 intro soundtrack",
    };
  }
  if (level?.water) {
    return {
      src: WATER_LEVEL_MUSIC,
      label: "Swim mix",
      description: "swim stage soundtrack",
    };
  }
  if (level?.moon) {
    return {
      src: MOON_LEVEL_MUSIC,
      label: "Moon mix",
      description: "moon stage soundtrack",
    };
  }
  if (level?.volcano) {
    return {
      src: LAVA_LEVEL_MUSIC,
      label: "Volcano mix",
      description: "volcano stage soundtrack",
    };
  }
  if (level?.cloud) {
    return {
      src: CLOUD_LEVEL_MUSIC,
      label: "Cloud mix",
      description: "cloud stage soundtrack",
    };
  }
  if (level?.giantEnemies) {
    return {
      src: GIANT_LEVEL_MUSIC,
      label: "Big Corgi mix",
      description: "big corgi chase soundtrack",
    };
  }
  if (level?.dark) {
    return {
      src: LIGHTS_LEVEL_MUSIC,
      label: "Lights mix",
      description: "lights stage soundtrack",
    };
  }
  return {
    src: MAIN_MUSIC,
    label: "Classic mix",
    description: "classic run soundtrack",
  };
}
const DOG_SPRITES = {
  left: [
    "assets/henry/left.jpg",
    "assets/henry/left2.jpg",
    "assets/henry/left3.jpg",
    "assets/henry/left4.jpg",
  ],
  right: [
    "assets/henry/right.jpg",
    "assets/henry/right2.jpg",
    "assets/henry/right3.jpg",
    "assets/henry/right4.jpg",
  ],
};

const WATER_GRAVITY = 0.18;
const WATER_THRUST = 0.55;
const WATER_DRAG = 0.9;
const WATER_MAX_VY = 3.2;
const WATER_MAX_VX = 2.4;
const MOON_GRAVITY_FACTOR = 0.3;
const MOON_JUMP_VELOCITY_FACTOR = 0.88;
const MOON_MAX_FALL_SPEED = 6;
const CLOUD_PLATFORM_HOLD_MS = 2200;
const CLOUD_PLATFORM_RESPAWN_MS = 3200;
const DARK_SWITCH_REVEAL_MS = 5000;
const DARK_SWITCH_BEACON_RADIUS = 38;
const LAVA_TOP_Y = 510;
const LAVA_HEIGHT = 30;
const TUNNEL_DIG_SLOW_MS = 950;
const TUNNEL_DIG_FAST_MS = 320;
const TUNNEL_DIG_PARTICLE_MS = 90;
const TUNNEL_DIG_BOOST_MS = 260;

const AUDIO = {
  musicVol: 60, // 0-100
  sfxVol: 70, // 0-100
  musicPausedFactor: 0.25,
  muted: false,
};

const GRAVITY = 0.7;
const MOVE_SPEED = 4.3;
const SIREN_SLOW_FACTOR = 0.25;
const JUMP_VELOCITY = -15;
const COYOTE_TIME_MS = 120;
const JUMP_BUFFER_MS = 140;
const START_X = 90;
const START_Y = 420;

// Combat tuning.
const STOMP_DESCENT_MIN = 2.2;
const STOMP_TOP_MARGIN = 10;
const STOMP_BOUNCE_VELOCITY = -9.2;
const ENEMY_DEATH_GRAVITY = 0.55;

const MAX_LIVES = 3; // health hearts per run
const LEVEL_RESPAWNS = 3; // lives/continues per level
const HIT_INVULN_MS = 1100;

// New hit reaction tuning (Part A).
const HIT_KNOCKBACK_X = 8.8;
const HIT_KNOCKBACK_Y = -7.2;
const HIT_KNOCKBACK_LOCK_MS = 150;

const CAPE_FLIGHT_MS = 20000;
const CAPE_LIFT = 0.68;
const CAPE_DESCEND = 0.5;
const CAPE_MAX_RISE = -6.2;

const SUPER_JUMP_BOOST = -6.8;
const SUPER_JUMP_MIN_ASCENT_MS = 220;
const SUPER_JUMP_FLOAT_MS = 180;
const SUPER_JUMP_FLOAT_GRAVITY_FACTOR = 0.72;

const BARK_COOLDOWN_MS = 20000;
const BARK_WAVE_SPEED = 12;
const BARK_WAVE_LIFETIME_MS = 280;
const BARK_WAVE_WIDTH = 130;
const BARK_WAVE_HEIGHT = 58;
const SUPER_BARK_FREEZE_MS = 900;
const SUPER_BARK_SHAKE_INTENSITY = 12;
const SUPER_BARK_BLAST_MS = 900;

const LEVEL_TITLE_MS = 2400;
const LEVEL_CELEBRATE_MS = 2300;

const SIREN_COUNTDOWN_MS = 5000;
const SIREN_SOUND_MS = 10000;

const BOSS_ATTACK_COOLDOWN_MS = 1450;
const BOSS_PROJECTILE_SPEED = 4.6;
const BOSS_PHASE2_HEALTH_FACTOR = 0.5;
const BOSS_TELEGRAPH_MS = 540;
const BOSS_DASH_TELEGRAPH_MS = 700;
const BOSS_DASH_SPEED = 8.2;
const BOSS_DASH_DURATION_MS = 430;

const TOUCH_CONTROLS_STORAGE_KEY = "dachshund-dash-touch-controls-visible";
const MOBILE_SWIPE_JUMP_MIN = 34;
const MOBILE_TAP_JUMP_MAX_MS = 220;
const MOBILE_DOUBLE_TAP_MS = 280;
const MOBILE_CENTER_HOLD_DIG_MS = 180;

function intersects(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function isEnemyAlive(enemy) {
  return !enemy.dead && !enemy.dying;
}

function isPlatformSolid(platform) {
  return platform.active !== false && !platform.dugOut;
}

function buildLavaPools(platforms, worldWidth) {
  const floorPlatforms = [...platforms]
    .filter((platform) => platform.y >= 495 && platform.h >= 30)
    .sort((a, b) => a.x - b.x);
  if (floorPlatforms.length < 2) return [];

  const startPlatform = floorPlatforms[0];
  const endPlatform = floorPlatforms[floorPlatforms.length - 1];
  const lavaStart = startPlatform.x + startPlatform.w;
  const lavaEnd = endPlatform.x;
  const lavaWidth = lavaEnd - lavaStart;

  if (lavaWidth < 80) return [];
  return [{ x: lavaStart, y: LAVA_TOP_Y, w: lavaWidth, h: LAVA_HEIGHT }];
}

function makeLevelTemplate(levelNum) {
  const t = levelNum - 3;
  const bossLevel = levelNum === 10 || levelNum === 20;
  const worldWidth = 3000 + t * 95 + (bossLevel ? 280 : 0);
  const totalBones = 6 + Math.min(6, Math.floor(t / 2)) + (bossLevel ? 2 : 0);
  const sirenLevel = levelNum % 5 === 0;
  const difficulty = Math.min(1, t / 17);

  const platforms = [{ x: 0, y: 500, w: 420, h: 40 }];
  const segments = 8 + Math.floor(t / 3);
  for (let i = 0; i < segments; i++) {
    const x = 460 + i * 260;
    const y = 460 - ((i + t) % 4) * 34 - Math.floor(t / 4) * 4;
    const w = 170 - ((i + t) % 3) * 10;
    platforms.push({ x, y, w, h: 22 });

    if ((i + t) % 3 === 1) {
      platforms.push({ x: x + 90, y: y - 52, w: 120, h: 20 });
    }
  }
  platforms.push({ x: worldWidth - 150, y: 500, w: 150, h: 40 });

  const spikes = [];
  const spikeCount = 5 + Math.floor(t / 2) + (bossLevel ? 1 : 0);
  for (let i = 0; i < spikeCount; i++) {
    const x = 430 + i * (205 - Math.floor(t / 4) * 8) + ((i + t) % 2) * 35;
    if (x < worldWidth - 300) {
      spikes.push({ x, y: 500, w: 58 + ((i + t) % 3) * 14, h: 24 });
    }
  }

  const enemies = [];
  const enemyCount = 4 + Math.floor(t / 2);
  for (let i = 0; i < enemyCount; i++) {
    const laneX = 480 + i * 300;
    const p = platforms[1 + (i % Math.max(1, platforms.length - 2))];
    const baseY = p ? p.y - 30 : 470;
    const minX = Math.max(30, laneX - 60);
    const maxX = Math.min(worldWidth - 200, laneX + 160 + (i % 2) * 40);
    enemies.push({
      x: laneX,
      y: Math.min(470, baseY),
      w: 38,
      h: 30,
      dir: i % 2 ? -1 : 1,
      minX,
      maxX,
      speed: 1.8 + difficulty * 1.2 + (i % 3) * 0.1,
    });
  }

  const bones = [];
  for (let i = 0; i < totalBones; i++) {
    const p = platforms[1 + (i % Math.max(1, platforms.length - 2))];
    const x = p ? p.x + 28 + (i % 3) * 34 : 300 + i * 120;
    const y = p ? p.y - 38 : 450;
    bones.push({ x, y, r: 11 });
  }

  const hearts = levelNum % 4 === 0 ? [{ x: 1480 + (t % 3) * 170, y: 420, w: 24, h: 24 }] : [];
  const capes = levelNum % 5 === 0 ? [{ x: 1200 + (t % 4) * 180, y: 322, w: 28, h: 30 }] : [];

  const arenaStart = worldWidth - 520;
  platforms.push({ x: arenaStart, y: 440, w: 440, h: 26 });

  const sirens = sirenLevel
    ? [
        {
          x: worldWidth * 0.5,
          y: 360,
          w: 38,
          h: 140,
          countdownStart: null,
          soundingUntil: 0,
          disabled: false,
        },
      ]
    : [];
  const toys = sirenLevel
    ? [
        {
          x: worldWidth * 0.5 - 140,
          y: 380,
          w: 26,
          h: 18,
          taken: false,
        },
      ]
    : [];

  return {
    id: levelNum,
    name: `Level ${levelNum}`,
    worldWidth,
    totalBones,
    platforms,
    spikes,
    enemies,
    bones,
    hearts,
    capes,
    sirens,
    toys,
    lavaPools: [],
    finishFlag: { x: worldWidth - 60, y: 360, w: 16, h: 140 },
    boss: bossLevel
      ? {
          name: levelNum === 10 ? "Corgi Captain" : "Corgi Overlord",
          x: worldWidth - 360,
          y: 392,
          w: 88,
          h: 48,
          minX: worldWidth - 500,
          maxX: worldWidth - 130,
          dir: -1,
          speed: levelNum === 10 ? 1.7 : 2.1,
          maxHealth: levelNum === 10 ? 8 : 12,
        }
      : null,
  };
}

const LEVELS = [
  {
    id: 1,
    name: "Level 1",
    worldWidth: 2400,
    totalBones: 5,
    platforms: [
      { x: 0, y: 500, w: 620, h: 40 },
      { x: 670, y: 450, w: 280, h: 24 },
      { x: 1010, y: 410, w: 260, h: 24 },
      { x: 1320, y: 455, w: 220, h: 24 },
      { x: 1620, y: 410, w: 260, h: 24 },
      { x: 1930, y: 355, w: 300, h: 24 },
      { x: 2280, y: 500, w: 120, h: 40 },
    ],
    spikes: [
      { x: 570, y: 500, w: 70, h: 24 },
      { x: 1220, y: 500, w: 60, h: 24 },
      { x: 1820, y: 500, w: 80, h: 24 },
    ],
    enemies: [
      { x: 760, y: 420, w: 38, h: 30, dir: 1, minX: 700, maxX: 900, speed: 1.6 },
      { x: 1670, y: 380, w: 38, h: 30, dir: -1, minX: 1640, maxX: 1840, speed: 1.4 },
    ],
    bones: [
      { x: 260, y: 450, r: 11 },
      { x: 760, y: 398, r: 11 },
      { x: 1110, y: 360, r: 11 },
      { x: 1720, y: 358, r: 11 },
      { x: 2140, y: 300, r: 11 },
    ],
    hearts: [{ x: 1410, y: 420, w: 24, h: 24 }],
    capes: [],
    sirens: [],
    toys: [],
    finishFlag: { x: 2340, y: 420, w: 16, h: 80 },
    boss: null,
  },
  {
    id: 2,
    name: "Level 2",
    worldWidth: 3000,
    totalBones: 7,
    platforms: [
      { x: 0, y: 500, w: 420, h: 40 },
      { x: 500, y: 448, w: 170, h: 22 },
      { x: 760, y: 390, w: 170, h: 22 },
      { x: 1020, y: 340, w: 190, h: 22 },
      { x: 1290, y: 390, w: 170, h: 22 },
      { x: 1540, y: 450, w: 210, h: 22 },
      { x: 1830, y: 388, w: 210, h: 22 },
      { x: 2120, y: 332, w: 190, h: 22 },
      { x: 2400, y: 390, w: 180, h: 22 },
      { x: 2660, y: 455, w: 180, h: 22 },
      { x: 2870, y: 500, w: 130, h: 40 },
    ],
    spikes: [
      { x: 430, y: 500, w: 60, h: 24 },
      { x: 680, y: 500, w: 70, h: 24 },
      { x: 1210, y: 500, w: 80, h: 24 },
      { x: 1460, y: 500, w: 70, h: 24 },
      { x: 2050, y: 500, w: 85, h: 24 },
      { x: 2580, y: 500, w: 70, h: 24 },
    ],
    enemies: [
      { x: 530, y: 418, w: 38, h: 30, dir: 1, minX: 500, maxX: 660, speed: 2.0 },
      { x: 1060, y: 310, w: 38, h: 30, dir: -1, minX: 1020, maxX: 1210, speed: 2.2 },
      { x: 1870, y: 358, w: 38, h: 30, dir: 1, minX: 1830, maxX: 2040, speed: 2.1 },
      { x: 2430, y: 360, w: 38, h: 30, dir: -1, minX: 2400, maxX: 2580, speed: 2.35 },
    ],
    bones: [
      { x: 320, y: 450, r: 11 },
      { x: 560, y: 398, r: 11 },
      { x: 840, y: 340, r: 11 },
      { x: 1120, y: 290, r: 11 },
      { x: 1920, y: 338, r: 11 },
      { x: 2200, y: 282, r: 11 },
      { x: 2730, y: 408, r: 11 },
    ],
    hearts: [{ x: 1700, y: 420, w: 24, h: 24 }],
    capes: [{ x: 2325, y: 294, w: 28, h: 30 }],
    sirens: [],
    toys: [],
    finishFlag: { x: 2940, y: 420, w: 16, h: 80 },
    boss: null,
  },
  ...Array.from({ length: 18 }, (_, i) => makeLevelTemplate(i + 3)),
];

// Targeted jump comfort fix: lower Level 6 opening platform for reachable start.
if (LEVELS[5] && LEVELS[5].platforms && LEVELS[5].platforms[1]) {
  LEVELS[5].platforms[1].y = 392;
}

// Practice pass: add more visual/gameplay variety with less on-screen reading.
if (LEVELS[2]) LEVELS[2].water = true;
if (LEVELS[3]) LEVELS[3].moon = true;
if (LEVELS[4]) {
  LEVELS[4].volcano = true;
  LEVELS[4].lavaPools = buildLavaPools(LEVELS[4].platforms, LEVELS[4].worldWidth);
}
if (LEVELS[5]) LEVELS[5].giantEnemies = true;
if (LEVELS[6]) {
  LEVELS[6].dark = true;
  LEVELS[6].lightSwitches = [
    { x: 760, y: 398, w: 26, h: 42, on: false },
    { x: 1640, y: 340, w: 26, h: 42, on: false },
    { x: 2480, y: 282, w: 26, h: 42, on: false },
  ];
}
if (LEVELS[7]) {
  LEVELS[7].cloud = true;
  LEVELS[7].worldWidth = 3500;
  LEVELS[7].totalBones = 8;
  LEVELS[7].platforms = [
    { x: 0, y: 500, w: 360, h: 40, cloudPuffs: 5 },
    { x: 430, y: 452, w: 180, h: 24, cloudPuffs: 4 },
    { x: 650, y: 402, w: 150, h: 22, cloudPuffs: 4, cloudVanish: true },
    { x: 860, y: 350, w: 190, h: 24, cloudPuffs: 5 },
    { x: 1080, y: 294, w: 140, h: 22, cloudPuffs: 4, cloudVanish: true },
    { x: 1290, y: 344, w: 200, h: 24, cloudPuffs: 5 },
    { x: 1530, y: 402, w: 150, h: 22, cloudPuffs: 4, cloudVanish: true },
    { x: 1740, y: 352, w: 200, h: 24, cloudPuffs: 5 },
    { x: 1980, y: 298, w: 150, h: 22, cloudPuffs: 4, cloudVanish: true },
    { x: 2190, y: 342, w: 210, h: 24, cloudPuffs: 5 },
    { x: 2440, y: 392, w: 150, h: 22, cloudPuffs: 4, cloudVanish: true },
    { x: 2660, y: 334, w: 210, h: 24, cloudPuffs: 5 },
    { x: 2900, y: 278, w: 150, h: 22, cloudPuffs: 4, cloudVanish: true },
    { x: 3110, y: 330, w: 180, h: 24, cloudPuffs: 5 },
    { x: 3330, y: 430, w: 170, h: 36, cloudPuffs: 5 },
  ];
  LEVELS[7].spikes = [];
  LEVELS[7].enemies = [
    { x: 470, y: 422, w: 38, h: 30, dir: 1, minX: 445, maxX: 565, speed: 2.15 },
    { x: 1335, y: 314, w: 38, h: 30, dir: -1, minX: 1310, maxX: 1450, speed: 2.25 },
    { x: 1790, y: 322, w: 38, h: 30, dir: 1, minX: 1760, maxX: 1900, speed: 2.35 },
    { x: 2715, y: 304, w: 38, h: 30, dir: -1, minX: 2680, maxX: 2820, speed: 2.45 },
  ];
  LEVELS[7].bones = [
    { x: 290, y: 450, r: 11 },
    { x: 700, y: 360, r: 11 },
    { x: 915, y: 308, r: 11 },
    { x: 1338, y: 302, r: 11 },
    { x: 1585, y: 360, r: 11 },
    { x: 2025, y: 256, r: 11 },
    { x: 2695, y: 292, r: 11 },
    { x: 3160, y: 288, r: 11 },
  ];
  LEVELS[7].hearts = [{ x: 2225, y: 304, w: 24, h: 24 }];
  LEVELS[7].capes = [];
  LEVELS[7].sirens = [];
  LEVELS[7].toys = [];
  LEVELS[7].lavaPools = [];
  LEVELS[7].finishFlag = { x: 3440, y: 350, w: 16, h: 120 };
  LEVELS[7].boss = null;
}
if (LEVELS[8]) {
  LEVELS[8].tunnel = true;
  LEVELS[8].worldWidth = 3400;
  LEVELS[8].totalBones = 8;
  LEVELS[8].platforms = [
    { x: 0, y: 500, w: 330, h: 40 },
    { x: 470, y: 500, w: 220, h: 40 },
    { x: 330, y: 0, w: 70, h: 220 },
    { x: 400, y: 0, w: 70, h: 260 },
    { x: 330, y: 430, w: 140, h: 110 },
    { x: 470, y: 0, w: 2360, h: 180 },
    { x: 470, y: 430, w: 2960, h: 110 },
    { x: 560, y: 250, w: 270, h: 22 },
    { x: 840, y: 180, w: 60, h: 250, diggable: true },
    { x: 900, y: 330, w: 250, h: 22 },
    { x: 1210, y: 250, w: 310, h: 22 },
    { x: 1560, y: 330, w: 260, h: 22 },
    { x: 1820, y: 180, w: 60, h: 250, diggable: true },
    { x: 1880, y: 250, w: 290, h: 22 },
    { x: 2230, y: 330, w: 260, h: 22 },
    { x: 2490, y: 180, w: 60, h: 250, diggable: true },
    { x: 2550, y: 250, w: 300, h: 22 },
    { x: 2910, y: 330, w: 240, h: 22 },
    { x: 3170, y: 250, w: 150, h: 22 },
    { x: 830, y: 180, w: 70, h: 100 },
    { x: 1450, y: 272, w: 80, h: 80 },
    { x: 2140, y: 180, w: 80, h: 80 },
    { x: 2810, y: 272, w: 80, h: 80 },
  ];
  LEVELS[8].spikes = [];
  LEVELS[8].enemies = [
    { x: 610, y: 220, w: 42, h: 28, dir: 1, minX: 580, maxX: 800, speed: 1.55, kind: "mole" },
    { x: 980, y: 300, w: 34, h: 24, dir: -1, minX: 930, maxX: 1120, speed: 1.9, kind: "mouse" },
    { x: 1280, y: 220, w: 42, h: 28, dir: 1, minX: 1240, maxX: 1480, speed: 1.6, kind: "mole" },
    { x: 1670, y: 300, w: 34, h: 24, dir: -1, minX: 1600, maxX: 1790, speed: 1.95, kind: "mouse" },
    { x: 1950, y: 220, w: 42, h: 28, dir: 1, minX: 1910, maxX: 2140, speed: 1.65, kind: "mole" },
    { x: 2300, y: 300, w: 34, h: 24, dir: -1, minX: 2260, maxX: 2460, speed: 2.0, kind: "mouse" },
    { x: 2610, y: 220, w: 42, h: 28, dir: 1, minX: 2580, maxX: 2820, speed: 1.7, kind: "mole" },
    { x: 2980, y: 300, w: 34, h: 24, dir: -1, minX: 2940, maxX: 3120, speed: 2.05, kind: "mouse" },
  ];
  LEVELS[8].bones = [
    { x: 250, y: 450, r: 11 },
    { x: 520, y: 470, r: 11 },
    { x: 690, y: 210, r: 11 },
    { x: 1040, y: 290, r: 11 },
    { x: 1380, y: 210, r: 11 },
    { x: 2050, y: 210, r: 11 },
    { x: 2700, y: 210, r: 11 },
    { x: 3200, y: 210, r: 11 },
  ];
  LEVELS[8].hearts = [{ x: 2420, y: 290, w: 24, h: 24 }];
  LEVELS[8].capes = [];
  LEVELS[8].sirens = [];
  LEVELS[8].toys = [];
  LEVELS[8].lavaPools = [];
  LEVELS[8].finishFlag = { x: 3340, y: 170, w: 16, h: 260 };
  LEVELS[8].tunnelEntrance = { x: 330, y: 500, w: 140, h: 40, burstY: 470 };
  LEVELS[8].boss = null;
}

const mobileControlState = {
  enabled: false,
  immersive: false,
  landscape: false,
  activeTouches: new Map(),
  movementTouchId: null,
  movementSide: null,
  jumpReleaseTimeout: null,
  lastCenterTapAt: 0,
  centerTapTimeout: null,
  centerHoldTimeout: null,
  centerHoldTouchId: null,
};

const state = {
  mode: "start",
  currentLevelIndex: 0,
  cameraX: 0,
  bonesCollected: 0,
  totalBones: LEVELS[0].totalBones,
  lives: MAX_LIVES,
  levelRespawnsLeft: LEVEL_RESPAWNS,
  invulnerableUntil: 0,
  hitControlLockUntil: 0,
  capeUntil: 0,
  levelTitleUntil: 0,
  celebrateUntil: 0,
  pendingNextLevel: null,
  celebrationBurstAt: 0,
  cheatBuffer: "",
  levelSelectOpen: false,
  keys: { left: false, right: false, jump: false, down: false },
  jumpHeld: false,
  jumpHoldStartedAt: 0,
  jumpPressedThisFrame: false,
  jumpBufferedUntil: 0,
  superJumpUsed: false,
  airJumpsUsed: 0, // count of mid-air jumps used (max 1)
  lastJumpTapAt: 0,
  lastAirJumpConsumedAt: 0,
  lastGroundedAt: 0,
  superJumpFloatUntil: 0,
  idleWagUntil: 0,
  idleNextWagAt: 0,
  barkWagUntil: 0,
  sneezeUntil: 0,
  sneezeNextAt: Date.now() + 5000,
  backflipUntil: 0,
  backflipNextAt: Date.now() + 6000,
  danceUntil: 0,
  danceNextAt: Date.now() + 6000,
  digUntil: 0,
  digNextAt: Date.now() + 7000,
  pauseMenu: "main",
  pauseOptionIndex: 0,
  combat: { barkCooldownUntil: 0, barkWaves: [], barkFlashUntil: 0 },
  bossProjectiles: [],
  freezeUntil: 0,
  shakeUntil: 0,
  shakeIntensity: 0,
  barkBlast: null,
  deathAt: 0,
  sirenSlowUntil: 0,
  sirenOverlayUntil: 0,
  toyHeld: false,
  toyProjectile: null,
  dirtBursts: [],
  tunnelBurstDone: false,
  tunnelDigTarget: null,
  tunnelDigLastAt: 0,
  tunnelDigBoostUntil: 0,
  dog: {
    x: START_X,
    y: START_Y,
    w: 74,
    h: 36,
    vx: 0,
    vy: 0,
    onGround: false,
    facing: 1,
  },
};

function getLevel() {
  return LEVELS[state.currentLevelIndex];
}

function defeatEnemy(enemy, horizontalPush = 0) {
  enemy.dying = true;
  enemy.vy = -2.2;
  enemy.vx = horizontalPush;
}

function barkReady() {
  return Date.now() >= state.combat.barkCooldownUntil;
}

function spawnTunnelDirtBurst(entrance) {
  const burstX = entrance.x + entrance.w / 2;
  const burstY = entrance.burstY ?? entrance.y;
  for (let i = 0; i < 28; i++) {
    const angle = -Math.PI + Math.random() * Math.PI;
    const speed = 2 + Math.random() * 5.5;
    state.dirtBursts.push({
      x: burstX + (Math.random() - 0.5) * entrance.w * 0.7,
      y: burstY + Math.random() * 16,
      vx: Math.cos(angle) * speed * 0.8,
      vy: Math.sin(angle) * speed - 1.8,
      r: 4 + Math.random() * 6,
      bornAt: Date.now(),
      life: 700 + Math.random() * 260,
      color: i % 3 === 0 ? "#7f5632" : i % 2 === 0 ? "#9e7245" : "#5f3e24",
    });
  }
  state.digUntil = Date.now() + 850;
}

function spawnDigDirtBurst(platform, contact = "side", options = {}) {
  const { finish = false, boosted = false } = options;
  const count = finish ? 26 : boosted ? 12 : 7;
  const originX =
    contact === "top"
      ? platform.x + platform.w * (0.3 + Math.random() * 0.4)
      : contact === "left"
        ? platform.x + 6
        : contact === "right"
          ? platform.x + platform.w - 6
          : platform.x + platform.w / 2;
  const originY =
    contact === "top"
      ? platform.y + 4
      : platform.y + platform.h * (0.28 + Math.random() * 0.44);

  for (let i = 0; i < count; i++) {
    const horizontal = contact === "left" ? -1 : contact === "right" ? 1 : (Math.random() - 0.5) * 1.8;
    const speed = finish ? 3.4 + Math.random() * 5.4 : 1.4 + Math.random() * (boosted ? 4.2 : 2.3);
    state.dirtBursts.push({
      x: originX + (Math.random() - 0.5) * Math.max(16, platform.w * 0.14),
      y: originY + (Math.random() - 0.5) * Math.max(12, platform.h * 0.12),
      vx: horizontal * speed + (contact === "top" ? (Math.random() - 0.5) * 2.3 : 0),
      vy: finish ? -2.6 - Math.random() * 2.2 : -0.9 - Math.random() * 1.6,
      r: finish ? 4 + Math.random() * 5.5 : 2.8 + Math.random() * 3.2,
      bornAt: Date.now(),
      life: finish ? 780 + Math.random() * 280 : 420 + Math.random() * 220,
      color: i % 3 === 0 ? "#7f5632" : i % 2 === 0 ? "#9e7245" : "#5f3e24",
    });
  }
}

function getTunnelDigTarget(level = levelRuntime) {
  if (!level?.tunnel) return null;
  const dog = state.dog;
  for (const p of level.platforms) {
    if (!p.diggable || p.dugOut) continue;

    const fromTop =
      dog.onGround &&
      dog.x + dog.w > p.x + 8 &&
      dog.x < p.x + p.w - 8 &&
      Math.abs(dog.y + dog.h - p.y) <= 8;

    const verticalOverlap = dog.y + dog.h > p.y + 8 && dog.y < p.y + p.h - 8;
    const touchingLeft = dog.facing > 0 && dog.x + dog.w >= p.x - 10 && dog.x + dog.w <= p.x + 16 && verticalOverlap;
    const touchingRight = dog.facing < 0 && dog.x <= p.x + p.w + 10 && dog.x >= p.x + p.w - 16 && verticalOverlap;

    if (fromTop) return { platform: p, contact: "top" };
    if (touchingLeft) return { platform: p, contact: "left" };
    if (touchingRight) return { platform: p, contact: "right" };
  }
  return null;
}

function triggerTunnelDigBoost() {
  if (state.mode !== "playing" || !state.keys.down || !levelRuntime?.tunnel) return false;
  const digTarget = getTunnelDigTarget(levelRuntime);
  if (!digTarget) return false;
  state.tunnelDigBoostUntil = Date.now() + TUNNEL_DIG_BOOST_MS;
  state.digUntil = Date.now() + 240;
  state.barkWagUntil = Date.now() + 220;
  playBarkSound(false);
  spawnDigDirtBurst(digTarget.platform, digTarget.contact, { boosted: true });
  return true;
}

function updateTunnelDigging(level, now) {
  if (!level?.tunnel) return;

  if (!state.keys.down) {
    state.tunnelDigTarget = null;
    state.tunnelDigLastAt = 0;
    return;
  }

  const digTarget = getTunnelDigTarget(level);
  if (!digTarget) {
    state.tunnelDigTarget = null;
    state.tunnelDigLastAt = 0;
    return;
  }

  const { platform, contact } = digTarget;
  const boosted = now < state.tunnelDigBoostUntil;
  const elapsed = state.tunnelDigTarget === platform ? Math.max(0, now - (state.tunnelDigLastAt || now)) : 0;
  platform.digProgress = Math.min(1, (platform.digProgress || 0) + elapsed / (boosted ? TUNNEL_DIG_FAST_MS : TUNNEL_DIG_SLOW_MS));
  state.tunnelDigTarget = platform;
  state.tunnelDigLastAt = now;
  state.digUntil = Math.max(state.digUntil, now + 120);

  if (!platform.lastDigParticleAt || now - platform.lastDigParticleAt >= (boosted ? TUNNEL_DIG_PARTICLE_MS * 0.45 : TUNNEL_DIG_PARTICLE_MS)) {
    spawnDigDirtBurst(platform, contact, { boosted });
    platform.lastDigParticleAt = now;
  }

  if (platform.digProgress >= 1 && !platform.dugOut) {
    platform.dugOut = true;
    platform.active = false;
    platform.digProgress = 1;
    spawnDigDirtBurst(platform, contact, { finish: true, boosted });
    state.digUntil = now + 520;
    state.tunnelDigBoostUntil = 0;
    state.tunnelDigTarget = null;
    state.tunnelDigLastAt = 0;
    statusEl.textContent = `${level.name}: Tunnel opened!`;
  }
}

function renderLives() {
  if (!livesEl) return;
  const continues = Math.max(0, state.levelRespawnsLeft);
  const head = "🐶";
  if (livesIconsEl) livesIconsEl.textContent = head.repeat(continues);
  if (continuesLabelEl) continuesLabelEl.textContent = `Continues ${continues}/${LEVEL_RESPAWNS}`;
  livesEl.setAttribute("aria-label", `Continues ${continues} of ${LEVEL_RESPAWNS}`);
}

function runSummaryContinuesMeter() {
  const continuesLeft = Math.max(0, Math.min(LEVEL_RESPAWNS, state.levelRespawnsLeft || 0));
  const progress = LEVEL_RESPAWNS > 0 ? (continuesLeft / LEVEL_RESPAWNS) * 100 : 0;
  const remainingText = `${continuesLeft} of ${LEVEL_RESPAWNS} continues remaining`;
  if (continuesLeft <= 0) {
    return {
      progress,
      tone: "danger",
      state: "empty",
      label: `${remainingText}. No recovery tries remain for this level.`
    };
  }
  if (continuesLeft === LEVEL_RESPAWNS) {
    return {
      progress,
      tone: "ready",
      state: "full",
      label: `${remainingText}. All recovery tries are available.`
    };
  }
  return {
    progress,
    tone: continuesLeft === 1 ? "danger" : "warning",
    state: continuesLeft === 1 ? "critical" : "mid",
    label: `${remainingText}. ${continuesLeft === 1 ? "Final recovery try left." : "Recovery tries are running low."}`
  };
}

function runSummaryGoal(level = levelRuntime) {
  if (state.mode === "start" || state.mode === "title") {
    return {
      text: levelSelectGoalPreview(level).text,
      tone: level?.boss ? "boss" : level?.tunnel ? "warning" : "collect"
    };
  }
  if (state.mode === "paused") return { text: "Paused", tone: "paused" };
  if (state.mode === "celebrating") return { text: "Level clear", tone: "clear" };
  if (state.mode === "dead") {
    return state.levelRespawnsLeft > 0 ? { text: `Continue · ${state.levelRespawnsLeft}`, tone: "warning" } : { text: "No retry", tone: "danger" };
  }
  if (state.mode === "gameover") return { text: "Restart", tone: "danger" };
  if (state.mode === "won") return { text: "You win", tone: "clear" };

  const bonesLeft = Math.max(0, state.totalBones - state.bonesCollected);
  if (bonesLeft > 0) return { text: bonesLeft === 1 ? "1 bone" : `${bonesLeft} bones`, tone: "collect" };
  if (level?.boss && !level.boss.dead) return { text: "Beat boss", tone: "boss" };
  return { text: "Touch flag", tone: "ready" };
}

function runSummaryGoalMeter(level = levelRuntime) {
  if (state.mode === "start" || state.mode === "title") {
    return {
      progress: 100,
      state: "preview",
      label: `Goal preview: ${levelSelectGoalPreview(level).label.replace(/^Goal:\s*/, "")}.`
    };
  }
  if (state.mode === "paused") {
    return { progress: 100, state: "paused", label: "Goal progress is frozen while paused." };
  }
  if (state.mode === "dead" || state.mode === "gameover") {
    return { progress: 0, state: "reset", label: "Goal progress resets when the run restarts." };
  }
  if (state.mode === "celebrating" || state.mode === "won") {
    return { progress: 100, state: "clear", label: "Goal complete." };
  }

  const totalBones = Math.max(0, state.totalBones || 0);
  const bonesCollected = Math.max(0, Math.min(state.bonesCollected || 0, totalBones || state.bonesCollected || 0));
  const bonesProgress = totalBones > 0 ? (bonesCollected / totalBones) * 100 : 100;
  if (bonesCollected < totalBones) {
    return {
      progress: bonesProgress,
      state: "bones",
      label: `Collected ${bonesCollected} of ${totalBones} bones.`
    };
  }

  if (level?.boss && !level.boss.dead) {
    const maxHealth = Math.max(1, level.boss.maxHealth || 1);
    const health = Math.max(0, Math.min(level.boss.health || 0, maxHealth));
    return {
      progress: ((maxHealth - health) / maxHealth) * 100,
      state: "boss",
      label: `${level.boss.name} is down to ${health} of ${maxHealth} HP.`
    };
  }

  return {
    progress: 100,
    state: "ready",
    label: level?.boss ? "Boss defeated. Touch the flag to finish the stage." : "All bones collected. Touch the flag to finish the stage."
  };
}

function launchStatePowerPreview(level = levelRuntime) {
  if (level?.boss) {
    return {
      text: "Bark · Boss",
      tone: "boss",
      meterState: "preview-boss",
      label: `Power preview: super bark is ready, and ${level.boss.name} is waiting at the end of this stage.`
    };
  }
  if (level?.tunnel) {
    return {
      text: "Bark · Dig ↓",
      tone: "warning",
      meterState: "preview-dig",
      label: "Power preview: super bark is ready, and this tunnel stage uses hold down to dig."
    };
  }
  if (level?.water) {
    return {
      text: "Bark · Swim ↑",
      tone: "theme",
      meterState: "preview-swim",
      label: "Power preview: super bark is ready, and jump taps double as swim strokes in this water stage."
    };
  }
  if (level?.moon) {
    return {
      text: "Bark · Float ◔",
      tone: "theme",
      meterState: "preview-moon",
      label: "Power preview: super bark is ready, and this moon stage uses floatier jumps."
    };
  }
  if (Array.isArray(level?.capes) && level.capes.length) {
    return {
      text: "Bark · Cape",
      tone: "boost",
      meterState: "preview-cape",
      label: "Power preview: super bark is ready, and a cape pickup appears in this stage."
    };
  }
  return {
    text: "Bark ready",
    tone: "ready",
    meterState: "preview-ready",
    label: "Power preview: super bark is ready for this stage."
  };
}

function runSummaryPower(level = levelRuntime) {
  if (state.mode === "start" || state.mode === "title") {
    const preview = launchStatePowerPreview(level);
    return { text: preview.text, tone: preview.tone };
  }
  if (state.mode === "paused") return { text: "Frozen", tone: "paused" };
  if (state.mode === "dead" || state.mode === "gameover") return { text: "Reset", tone: "warning" };
  if (state.mode === "won") return { text: "Champion ✨", tone: "clear" };

  const barkLeft = Math.max(0, state.combat.barkCooldownUntil - Date.now());
  const capeLeft = Math.max(0, state.capeUntil - Date.now());
  const parts = [];

  if (state.toyHeld) {
    parts.push("Toy ready");
  } else {
    parts.push(barkLeft > 0 ? `Bark ${Math.ceil(barkLeft / 1000)}s` : "Bark ready");
  }

  if (level?.tunnel) {
    parts.push("Dig ↓");
  } else {
    parts.push(capeLeft > 0 ? `Cape ${Math.ceil(capeLeft / 1000)}s` : "Cape inactive");
  }

  let tone = "level";
  if (state.toyHeld || capeLeft > 0) tone = "boost";
  else if (barkLeft <= 0) tone = "ready";
  else tone = "warning";

  if (level?.boss && !level.boss.dead && !state.toyHeld && barkLeft <= 0) {
    return { text: `${parts.join(" · ")} · Boss`, tone: "boss" };
  }

  return { text: parts.join(" · "), tone };
}

function runSummaryPowerMeter(level = levelRuntime) {
  if (state.mode === "start" || state.mode === "title") {
    const preview = launchStatePowerPreview(level);
    return { progress: 100, state: preview.meterState, label: preview.label };
  }
  if (state.mode === "paused") {
    return { progress: 100, state: "paused", label: "Power timers are frozen while paused." };
  }
  if (state.mode === "dead" || state.mode === "gameover") {
    return { progress: 0, state: "reset", label: "Power state resets on restart." };
  }
  if (state.mode === "won") {
    return { progress: 100, state: "clear", label: "Victory reached." };
  }

  const barkLeft = Math.max(0, state.combat.barkCooldownUntil - Date.now());
  const capeLeft = Math.max(0, state.capeUntil - Date.now());
  const barkProgress = Math.max(0, Math.min(100, ((BARK_COOLDOWN_MS - barkLeft) / BARK_COOLDOWN_MS) * 100));
  const capeProgress = Math.max(0, Math.min(100, (capeLeft / CAPE_FLIGHT_MS) * 100));

  if (state.toyHeld) {
    return { progress: 100, state: "toy", label: "Toy toss is ready to throw." };
  }
  if (capeLeft > 0 && !level?.tunnel) {
    return {
      progress: capeProgress,
      state: "cape",
      label: `Cape flight remains active for ${Math.ceil(capeLeft / 1000)} more second${capeLeft > 1000 ? "s" : ""}.`
    };
  }
  if (barkLeft > 0) {
    return {
      progress: barkProgress,
      state: "recharge",
      label: `Super bark recharges in ${Math.ceil(barkLeft / 1000)} second${barkLeft > 1000 ? "s" : ""}.`
    };
  }
  return {
    progress: 100,
    state: level?.boss && !level.boss.dead ? "boss-ready" : "ready",
    label: level?.tunnel ? "Super bark is ready and dig stays available." : "Super bark is ready."
  };
}

function levelProgressPercent() {
  const current = Math.min(LEVELS.length, Math.max(1, (state.currentLevelIndex || 0) + 1));
  return Math.max(0, Math.min(100, (current / LEVELS.length) * 100));
}

function levelSelectGoalText(level) {
  if (!level) return "Goal: finish the run";
  const steps = [`${level.totalBones} bones`];
  if (level.tunnel) steps.push("dig dirt");
  if (level.dark) {
    const switchCount = Array.isArray(level.lightSwitches) ? level.lightSwitches.length : 1;
    steps.push(`${switchCount} light switch${switchCount === 1 ? "" : "es"}`);
  }
  if (level.sirens?.length || level.toys?.length) steps.push("toy toss");
  if (level.boss?.name) steps.push(level.boss.name);
  steps.push("flag");
  return `Goal: ${steps.join(" • ")}`;
}

function levelSelectGoalPreview(level) {
  if (!level) {
    return { text: "🏁 Finish", label: "Goal: finish the run" };
  }

  const steps = [{ icon: "🦴", text: String(level.totalBones || 0), label: `${level.totalBones || 0} bone${level.totalBones === 1 ? "" : "s"}` }];
  if (level.tunnel) {
    steps.push({ icon: "⬒", text: "Dig", label: "dig dirt" });
  }
  if (level.dark) {
    const switchCount = Array.isArray(level.lightSwitches) ? level.lightSwitches.length : 1;
    steps.push({ icon: "💡", text: "Switch", label: `${switchCount} light switch${switchCount === 1 ? "" : "es"}` });
  }
  if (level.sirens?.length || level.toys?.length) {
    steps.push({ icon: "🧸", text: "Toy", label: "toy toss" });
  }
  if (level.boss?.name) {
    steps.push({ icon: "♛", text: level.boss.name, label: level.boss.name });
  }
  steps.push({ icon: "🏁", text: "Flag", label: "flag" });

  return {
    text: steps.map(({ icon, text }) => `${icon} ${text}`).join(" • "),
    label: `Goal: ${steps.map(({ label }) => label).join(" • ")}`,
  };
}

function levelSelectHazardText(level) {
  if (!level) return "Hazards: platforming";

  const hazards = [];
  if (Array.isArray(level.spikes) && level.spikes.length) {
    hazards.push(`${level.spikes.length} spike${level.spikes.length === 1 ? "" : "s"}`);
  }
  if (Array.isArray(level.enemies) && level.enemies.length) {
    hazards.push(`${level.enemies.length} ${level.giantEnemies ? "big patrol" : "patrol"}${level.enemies.length === 1 ? "" : "s"}`);
  }
  if (Array.isArray(level.lavaPools) && level.lavaPools.length) {
    hazards.push(`${level.lavaPools.length} lava lane${level.lavaPools.length === 1 ? "" : "s"}`);
  }
  if (level.cloud) hazards.push("vanishing clouds");
  if (level.dark) hazards.push("blackout");
  if (level.tunnel) hazards.push("dirt walls");
  if (level.water) hazards.push("currents");
  if (level.moon) hazards.push("floaty jumps");
  if (level.boss) hazards.push("boss barks");
  if (level.sirens?.length) {
    hazards.push(`${level.sirens.length} siren slow${level.sirens.length === 1 ? "" : " zones"}`);
  }

  return `Hazards: ${hazards.length ? hazards.join(" • ") : "platforming"}`;
}

function levelSelectTipText(level) {
  if (!level) return "Tip: finish the warmup and touch the flag";
  if (level.tunnel) return "Tip: Hold ↓ to dig, then add BARK to chew through dirt faster.";
  if (level.water) return "Tip: Paddle with jump taps and stay centered so the currents do not drag you off line.";
  if (level.moon) return "Tip: Let floaty jumps breathe—tap early and land gently on the next platform.";
  if (level.cloud) return "Tip: Keep moving once you land because cloud platforms vanish after a short pause.";
  if (level.dark) return "Tip: Hunt for the light switch fast so hidden routes and threats stop blending into the dark.";
  if (level.volcano) return "Tip: Keep a forward rhythm over lava gaps so you do not lose speed on the hottest jumps.";
  if (level.giantEnemies) return "Tip: Give the bigger patrols extra room, then bark or stomp once their lane opens.";
  if (level.sirens?.length || level.toys?.length) return "Tip: Grab the toy toss pickup quickly to shut down the siren slow before the chase gets messy.";
  if (level.boss) return "Tip: Save a bark for the boss telegraph, then punish the opening before the next attack starts.";
  return "Tip: Scoop the bones on your main path first, then finish with a clean flag dash.";
}

function levelSelectPortalTipText(level) {
  if (!level) return "💡 Tip: Flag finish";
  if (level.tunnel) return "💡 Tip: ↓ Dig · BARK fast";
  if (level.water) return "💡 Tip: Tap swim · stay centered";
  if (level.moon) return "💡 Tip: Early jumps · soft landings";
  if (level.cloud) return "💡 Tip: Keep moving";
  if (level.dark) return "💡 Tip: Find the switch fast";
  if (level.volcano) return "💡 Tip: Keep rhythm over lava";
  if (level.giantEnemies) return "💡 Tip: Give patrols room";
  if (level.sirens?.length || level.toys?.length) return "💡 Tip: Grab the toy first";
  if (level.boss) return "💡 Tip: Save bark for telegraphs";
  return "💡 Tip: Path bones first";
}

function levelSelectFocusPill(level) {
  if (!level) return { icon: "🦴", text: "Path bones", label: "Focus: scoop the bones on your main path" };
  if (level.tunnel) return { icon: "↓", text: "Dig + Bark", label: "Focus: hold down to dig and add bark to chew through dirt faster" };
  if (level.water) return { icon: "↑", text: "Tap swim", label: "Focus: tap jump to swim through currents" };
  if (level.moon) return { icon: "◔", text: "Float jumps", label: "Focus: start moon jumps early and land gently" };
  if (level.cloud) return { icon: "☁", text: "Keep moving", label: "Focus: cloud platforms fade if you wait too long" };
  if (level.dark) return { icon: "💡", text: "Find switch", label: "Focus: light the stage fast so routes stop hiding" };
  if (level.volcano) return { icon: "🔥", text: "Clear gaps", label: "Focus: keep your rhythm over the lava lanes" };
  if (level.giantEnemies) return { icon: "!", text: "Give room", label: "Focus: make space before barking at the big patrols" };
  if (level.sirens?.length || level.toys?.length) return { icon: "🧸", text: "Grab toy", label: "Focus: grab the toy toss pickup before the sirens stack up" };
  if (level.boss) return { icon: "♛", text: "Save bark", label: "Focus: save a bark for the boss telegraph opening" };
  return { icon: "🦴", text: "Path bones", label: "Focus: scoop the bones on your main path" };
}

function levelSelectHazardPills(level) {
  if (!level) return [{ icon: "↔", text: "Run", label: "platforming" }];

  const pills = [];
  if (Array.isArray(level.spikes) && level.spikes.length) {
    pills.push({ icon: "▲", text: String(level.spikes.length), label: `${level.spikes.length} spike${level.spikes.length === 1 ? "" : "s"}` });
  }
  if (Array.isArray(level.enemies) && level.enemies.length) {
    pills.push({ icon: level.giantEnemies ? "!" : "🐾", text: String(level.enemies.length), label: `${level.enemies.length} ${level.giantEnemies ? "big patrol" : "patrol"}${level.enemies.length === 1 ? "" : "s"}` });
  }
  if (Array.isArray(level.lavaPools) && level.lavaPools.length) {
    pills.push({ icon: "🔥", text: String(level.lavaPools.length), label: `${level.lavaPools.length} lava lane${level.lavaPools.length === 1 ? "" : "s"}` });
  }
  if (level.cloud) pills.push({ icon: "☁", text: "Fade", label: "vanishing clouds" });
  if (level.dark) pills.push({ icon: "◐", text: "Dark", label: "blackout" });
  if (level.tunnel) pills.push({ icon: "⬒", text: "Dig", label: "dirt walls" });
  if (level.water) pills.push({ icon: "≈", text: "Current", label: "currents" });
  if (level.moon) pills.push({ icon: "◔", text: "Float", label: "floaty jumps" });
  if (level.boss) pills.push({ icon: "♛", text: "Boss", label: "boss barks" });
  if (level.sirens?.length) {
    pills.push({ icon: "📢", text: String(level.sirens.length), label: `${level.sirens.length} siren slow${level.sirens.length === 1 ? "" : " zones"}` });
  }

  return pills.length ? pills : [{ icon: "↔", text: "Run", label: "platforming" }];
}

function levelSelectPickupPills(level) {
  if (!level) return [{ icon: "🦴", text: "0", label: "0 bones" }];
  return [
    { icon: "🦴", text: String(level.totalBones || 0), label: `${level.totalBones || 0} bone${level.totalBones === 1 ? "" : "s"}` },
    ...(level.hearts?.length ? [{ icon: "❤️", text: String(level.hearts.length), label: `${level.hearts.length} heart${level.hearts.length === 1 ? "" : "s"}` }] : []),
    ...(level.capes?.length ? [{ icon: "🦸", text: String(level.capes.length), label: `${level.capes.length} cape${level.capes.length === 1 ? "" : "s"}` }] : []),
    ...((level.sirens?.length || level.toys?.length) ? [{ icon: "🧸", text: "Toy", label: "toy toss" }] : []),
  ];
}

function levelSelectPickupSummary(level) {
  const pills = levelSelectPickupPills(level);
  return {
    text: pills.map(({ icon, text }) => `${icon} ${text}`).join(" • "),
    label: `Pickups: ${pills.map(({ label }) => label).join(", ")}`,
  };
}

function levelSelectLengthText(level) {
  if (!level) return "Length: Short";
  const width = Number(level.worldWidth) || 0;
  if (level.boss || width >= 3600) return "Length: Long";
  if (width >= 3200) return "Length: Medium";
  return "Length: Short";
}

function levelSelectDifficulty(level, idx) {
  if (!level) return { text: "Challenge: Warmup", tone: "warmup" };

  let score = idx + 1;
  score += Math.min(3, Math.floor((level.totalBones || 0) / 3));
  if (Array.isArray(level.spikes) && level.spikes.length) score += 1;
  if (Array.isArray(level.enemies) && level.enemies.length >= 5) score += 1;
  if (level.water) score += 1;
  if (level.moon) score += 1;
  if (level.cloud) score += 1;
  if (level.tunnel) score += 1;
  if (level.dark) score += 1;
  if (level.volcano) score += 1;
  if (level.giantEnemies) score += 1;
  if (level.sirens?.length) score += 1;
  if (level.boss) score += 3;

  if (level.boss || score >= 19) return { text: "Challenge: Boss", tone: "boss" };
  if (score >= 14) return { text: "Challenge: Tough", tone: "tough" };
  if (score >= 9) return { text: "Challenge: Tricky", tone: "tricky" };
  return { text: "Challenge: Warmup", tone: "warmup" };
}

function levelSelectChallengeBadge(level, idx) {
  const challenge = levelSelectDifficulty(level, idx);
  const iconMap = {
    warmup: "☀",
    tricky: "⚠",
    tough: "🔥",
    boss: "♛",
  };
  return {
    ...challenge,
    icon: iconMap[challenge.tone] || "•",
    badgeText: `${iconMap[challenge.tone] || "•"} ${challenge.text.replace(/^Challenge:\s*/, "")}`,
  };
}

function levelSelectThemeKey(level) {
  if (level?.boss) return "boss";
  if (level?.dark) return "dark";
  if (level?.volcano) return "volcano";
  if (level?.water) return "water";
  if (level?.moon) return "moon";
  if (level?.cloud) return "cloud";
  if (level?.tunnel) return "tunnel";
  if (level?.giantEnemies) return "giant";
  return "classic";
}

function levelSelectStageText(level) {
  if (level?.boss?.name) return level.boss.name;
  return runSummaryTheme(level).text.replace(/^Stage\s+/, "");
}

function levelSelectStageIcon(level) {
  const theme = levelSelectThemeKey(level);
  const icons = {
    classic: "★",
    water: "≈",
    moon: "◔",
    cloud: "☁",
    tunnel: "⬒",
    volcano: "▲",
    giant: "!",
    dark: "◐",
    boss: "♛"
  };
  return icons[theme] || icons.classic;
}

function levelSelectLengthBadge(level) {
  const text = levelSelectLengthText(level).replace(/^Length:\s*/, "");
  const iconMap = {
    Short: "⚡",
    Medium: "↔",
    Long: "▭",
  };
  return {
    icon: iconMap[text] || "•",
    text,
    label: `Length: ${text}`,
  };
}

function runSummaryTheme(level = levelRuntime) {
  if (level?.boss?.name) {
    return { text: `Boss · ${level.boss.name}`, tone: "boss" };
  }

  const labels = [];
  if (level?.water) labels.push("Swim");
  if (level?.moon) labels.push("Moon");
  if (level?.cloud) labels.push("Clouds");
  if (level?.tunnel) labels.push("Tunnel");
  if (level?.volcano) labels.push("Volcano");
  if (level?.giantEnemies) labels.push("Big Corgis");
  if (level?.dark) labels.push("Lights");

  if (!labels.length) {
    return { text: "Stage Classic", tone: "level" };
  }

  let tone = "theme";
  if (level?.dark) tone = "warning";
  else if (level?.volcano || level?.giantEnemies) tone = "boss";
  else if (level?.water || level?.moon || level?.cloud || level?.tunnel) tone = "boost";

  return { text: `Stage ${labels.join(" · ")}`, tone };
}

function runSummaryThemeAccent(level = levelRuntime) {
  const themeKey = levelSelectThemeKey(level);
  const accentMap = {
    classic: {
      borderColor: "rgba(141, 212, 255, 0.34)",
      color: "#f0fbff",
      boxShadow: "0 0 0 1px rgba(121, 225, 255, 0.08), 0 0 16px rgba(52, 131, 214, 0.12)",
    },
    water: {
      borderColor: "rgba(121, 225, 255, 0.42)",
      color: "#e9fbff",
      boxShadow: "0 0 0 1px rgba(121, 225, 255, 0.12), 0 0 18px rgba(79, 153, 255, 0.18)",
    },
    moon: {
      borderColor: "rgba(202, 212, 255, 0.42)",
      color: "#f1f4ff",
      boxShadow: "0 0 0 1px rgba(202, 212, 255, 0.12), 0 0 18px rgba(143, 126, 255, 0.18)",
    },
    cloud: {
      borderColor: "rgba(186, 233, 255, 0.4)",
      color: "#effbff",
      boxShadow: "0 0 0 1px rgba(186, 233, 255, 0.1), 0 0 18px rgba(118, 198, 255, 0.16)",
    },
    tunnel: {
      borderColor: "rgba(216, 191, 145, 0.38)",
      color: "#fff1dc",
      boxShadow: "0 0 0 1px rgba(216, 191, 145, 0.12), 0 0 16px rgba(165, 113, 53, 0.16)",
    },
    volcano: {
      borderColor: "rgba(255, 176, 126, 0.42)",
      color: "#fff0e5",
      boxShadow: "0 0 0 1px rgba(255, 176, 126, 0.12), 0 0 18px rgba(255, 111, 73, 0.18)",
    },
    giant: {
      borderColor: "rgba(255, 190, 115, 0.4)",
      color: "#fff3de",
      boxShadow: "0 0 0 1px rgba(255, 190, 115, 0.12), 0 0 18px rgba(222, 140, 57, 0.18)",
    },
    dark: {
      borderColor: "rgba(208, 176, 255, 0.4)",
      color: "#f5ecff",
      boxShadow: "0 0 0 1px rgba(208, 176, 255, 0.12), 0 0 18px rgba(143, 113, 255, 0.18)",
    },
    boss: {
      borderColor: "rgba(255, 145, 109, 0.48)",
      color: "#fff0e9",
      boxShadow: "0 0 0 1px rgba(255, 145, 109, 0.14), 0 0 20px rgba(255, 117, 93, 0.2)",
    },
  };
  return accentMap[themeKey] || accentMap.classic;
}

function runSummaryLevelText(level = levelRuntime) {
  const current = Math.min(LEVELS.length, Math.max(1, (state.currentLevelIndex || 0) + 1));
  const bossTag = level?.boss ? " · ♛ Boss" : "";
  return `Level ${current} of ${LEVELS.length}${bossTag}`;
}

function launchPreviewLevel() {
  if (state.mode === "start") return LEVELS[0];
  return LEVELS[Math.max(0, Math.min(LEVELS.length - 1, state.currentLevelIndex || 0))] || LEVELS[0];
}

function renderLaunchStatus() {
  if (!statusEl) return;

  if (state.mode !== "start" && state.mode !== "title") {
    delete statusEl.dataset.mode;
    delete statusEl.dataset.theme;
    statusEl.style.removeProperty("--status-progress");
    statusEl.removeAttribute("title");
    return;
  }

  const level = launchPreviewLevel();
  const themeKey = levelSelectThemeKey(level);
  const previewGoal = levelSelectGoalPreview(level);
  const levelNumber = Math.max(1, Math.min(LEVELS.length, (state.currentLevelIndex || 0) + 1));
  const levelText = `Level ${levelNumber} of ${LEVELS.length}`;
  const stageText = `${levelSelectStageIcon(level)} ${level?.boss?.name ? `Boss · ${level.boss.name}` : levelSelectStageText(level)}`;
  const progress = Math.max(0, Math.min(100, (levelNumber / LEVELS.length) * 100));
  const statusText = `Press Start · ${levelText} · ${stageText} · ${previewGoal.text}`;

  statusEl.textContent = statusText;
  statusEl.dataset.mode = "launch-preview";
  statusEl.dataset.theme = themeKey;
  statusEl.style.setProperty("--status-progress", `${progress}%`);
  statusEl.setAttribute(
    "aria-label",
    `Press Start to launch ${levelText}. ${level?.boss?.name ? `Boss stage featuring ${level.boss.name}.` : `Stage ${levelSelectStageText(level)}.`} ${previewGoal.label}.`
  );
  statusEl.title = `Preview start: ${Math.round(progress)}% into the 20-level run`;
}

function mobileSpecialActionMeta(level) {
  if (level?.tunnel) {
    return {
      text: "DIG",
      caption: "Hold to dig",
      ariaLabel: "Hold to dig through dirt. Add BARK for faster digging.",
      theme: "tunnel",
    };
  }
  if (level?.water) {
    return {
      text: "DIVE",
      caption: "Hold to dive",
      ariaLabel: "Hold to dive downward through the water stage.",
      theme: "water",
    };
  }
  return {
    text: "DIG",
    caption: "Dig / dive",
    ariaLabel: "Dig or dive",
    theme: "default",
  };
}

function renderMobileControlHints(level = levelRuntime) {
  const meta = mobileSpecialActionMeta(level);
  const launchState = state.mode === "start" || state.mode === "title";
  const subtitleParts = [launchState ? "▲ start" : "▲ jump", "BARK attack"];

  if (level?.tunnel) {
    subtitleParts.push("DIG hold");
  } else if (level?.water) {
    subtitleParts.push("DIVE hold");
  }
  if (launchState) subtitleParts.push("HENRY portal");

  if (digBtn) {
    digBtn.textContent = meta.text;
    digBtn.dataset.theme = meta.theme;
    digBtn.setAttribute("aria-label", meta.ariaLabel);
    digBtn.title = meta.ariaLabel;
  }
  if (mobileDigCaptionEl) {
    mobileDigCaptionEl.textContent = meta.caption;
    mobileDigCaptionEl.dataset.theme = meta.theme;
  }
  if (mobileControlsSubtitleEl) {
    const subtitle = subtitleParts.join(" · ");
    mobileControlsSubtitleEl.textContent = subtitle;
    mobileControlsSubtitleEl.setAttribute(
      "aria-label",
      launchState ? `${subtitle}. Mobile title-screen controls.` : `${subtitle}. Mobile gameplay controls.`
    );
    mobileControlsSubtitleEl.title = subtitle;
  }
}

function renderRunSummary(level = levelRuntime) {
  const summarySection = summaryLevelEl?.parentElement;
  const hudSection = statusEl?.parentElement;
  const stageTipSection = summaryTipEl?.parentElement;
  const hideSummary = false;
  const hideHud = state.mode === "start";
  const showStageTip = state.mode === "start" || state.mode === "title";
  if (summarySection) summarySection.style.display = hideSummary ? "none" : "flex";
  if (hudSection) hudSection.style.display = hideHud ? "none" : "flex";
  if (stageTipSection) {
    stageTipSection.style.display = showStageTip ? "flex" : "none";
    stageTipSection.setAttribute("aria-hidden", showStageTip ? "false" : "true");
    stageTipSection.dataset.theme = levelSelectThemeKey(level);
  }

  if (summaryLevelEl) {
    const bossLevel = Boolean(level?.boss) && state.mode !== "paused";
    const progressText = `${Math.round(levelProgressPercent())}% through the 20-level run`;
    summaryLevelEl.textContent = runSummaryLevelText(level);
    summaryLevelEl.dataset.tone = state.mode === "paused" ? "paused" : bossLevel ? "boss-level" : "level";
    summaryLevelEl.style.setProperty("--summary-progress", `${levelProgressPercent()}%`);
    summaryLevelEl.style.background = bossLevel ? "linear-gradient(135deg, rgba(108, 32, 28, 0.96), rgba(61, 18, 22, 0.92))" : "";
    summaryLevelEl.style.borderColor = bossLevel ? "rgba(255, 145, 109, 0.48)" : "";
    summaryLevelEl.style.color = bossLevel ? "#fff0e9" : "";
    summaryLevelEl.style.boxShadow = bossLevel ? "0 0 0 1px rgba(255, 145, 109, 0.12), 0 0 20px rgba(255, 117, 93, 0.18)" : "";
    summaryLevelEl.setAttribute(
      "aria-label",
      `${runSummaryLevelText(level)}. ${bossLevel ? "Boss checkpoint." : "Campaign progress."} ${progressText}.`
    );
    summaryLevelEl.title = `${bossLevel ? "Boss checkpoint" : "Campaign progress"}: ${progressText}`;
  }

  if (summaryThemeEl) {
    const theme = runSummaryTheme(level);
    const accent = runSummaryThemeAccent(level);
    summaryThemeEl.textContent = `${levelSelectStageIcon(level)} ${theme.text}`;
    summaryThemeEl.dataset.tone = theme.tone;
    summaryThemeEl.dataset.theme = levelSelectThemeKey(level);
    summaryThemeEl.style.borderColor = accent.borderColor;
    summaryThemeEl.style.color = accent.color;
    summaryThemeEl.style.boxShadow = accent.boxShadow;
  }

  if (summaryBonesEl) {
    const totalBones = Math.max(0, state.totalBones || 0);
    const bonesCollected = Math.max(0, Math.min(state.bonesCollected || 0, totalBones || state.bonesCollected || 0));
    const bonesProgress = totalBones > 0 ? (bonesCollected / totalBones) * 100 : 0;
    summaryBonesEl.textContent = `Bones ${bonesCollected}/${totalBones}`;
    summaryBonesEl.dataset.tone = bonesCollected >= totalBones && totalBones > 0 ? "complete" : "collect";
    summaryBonesEl.style.setProperty("--summary-progress", `${bonesProgress}%`);
    summaryBonesEl.setAttribute("aria-label", `Bones collected: ${bonesCollected} of ${totalBones}`);
    summaryBonesEl.title = totalBones > 0 ? `${bonesCollected} of ${totalBones} bones collected` : "No bones in this stage";
  }

  if (summaryContinuesEl) {
    const meter = runSummaryContinuesMeter();
    const continuesLeft = Math.max(0, Math.min(LEVEL_RESPAWNS, state.levelRespawnsLeft || 0));
    summaryContinuesEl.textContent = `Continues ${continuesLeft}/${LEVEL_RESPAWNS}`;
    summaryContinuesEl.dataset.tone = meter.tone;
    summaryContinuesEl.dataset.continuesState = meter.state;
    summaryContinuesEl.style.setProperty("--summary-progress", `${meter.progress}%`);
    summaryContinuesEl.setAttribute("aria-label", `Continues status: ${meter.label}`);
    summaryContinuesEl.title = meter.label;
  }

  if (summaryPowerEl) {
    const power = runSummaryPower(level);
    const meter = runSummaryPowerMeter(level);
    summaryPowerEl.textContent = power.text;
    summaryPowerEl.dataset.tone = power.tone;
    summaryPowerEl.dataset.powerState = meter.state;
    summaryPowerEl.style.setProperty("--summary-progress", `${meter.progress}%`);
    summaryPowerEl.setAttribute("aria-label", `Power status: ${power.text}. ${meter.label}`);
    summaryPowerEl.title = meter.label;
  }

  if (summaryGoalEl) {
    const goal = runSummaryGoal(level);
    const meter = runSummaryGoalMeter(level);
    const launchState = state.mode === "start" || state.mode === "title";
    summaryGoalEl.textContent = goal.text;
    summaryGoalEl.dataset.tone = goal.tone;
    summaryGoalEl.dataset.theme = launchState ? levelSelectThemeKey(level) : "";
    summaryGoalEl.dataset.goalState = meter.state;
    summaryGoalEl.style.setProperty("--summary-progress", `${meter.progress}%`);
    summaryGoalEl.setAttribute("aria-label", `Goal status: ${goal.text}. ${meter.label}`);
    summaryGoalEl.title = meter.label;
  }

  if (summaryTipLabelEl) {
    summaryTipLabelEl.textContent = `${levelSelectStageIcon(level)} ${levelSelectStageText(level)} tip`;
    summaryTipLabelEl.dataset.theme = levelSelectThemeKey(level);
  }

  if (summaryTipLevelEl) {
    const progress = levelProgressPercent();
    const levelText = runSummaryLevelText(level);
    summaryTipLevelEl.textContent = levelText;
    summaryTipLevelEl.dataset.theme = levelSelectThemeKey(level);
    summaryTipLevelEl.style.setProperty("--stage-tip-level-progress", `${progress}%`);
    summaryTipLevelEl.setAttribute(
      "aria-label",
      `${levelText}. Campaign progress ${Math.round(progress)}% through the 20-level run.`
    );
    summaryTipLevelEl.title = `${Math.round(progress)}% through the 20-level run`;
  }

  if (summaryTipLengthEl) {
    const length = levelSelectLengthBadge(level);
    summaryTipLengthEl.textContent = `${length.icon} ${length.text}`;
    summaryTipLengthEl.dataset.theme = levelSelectThemeKey(level);
    summaryTipLengthEl.setAttribute("aria-label", length.label);
    summaryTipLengthEl.title = length.label;
  }

  if (summaryTipChallengeEl) {
    const challenge = levelSelectChallengeBadge(level, Math.max(0, state.currentLevelIndex || 0));
    summaryTipChallengeEl.textContent = challenge.badgeText;
    summaryTipChallengeEl.dataset.tone = challenge.tone;
    summaryTipChallengeEl.setAttribute("aria-label", challenge.text);
    summaryTipChallengeEl.title = challenge.text;
  }

  if (summaryTipFocusEl) {
    const focus = levelSelectFocusPill(level);
    summaryTipFocusEl.textContent = `${focus.icon} ${focus.text}`;
    summaryTipFocusEl.dataset.theme = levelSelectThemeKey(level);
    summaryTipFocusEl.setAttribute("aria-label", focus.label);
    summaryTipFocusEl.title = focus.label;
  }

  if (summaryTipHazardsEl) {
    const hazardPills = levelSelectHazardPills(level);
    summaryTipHazardsEl.replaceChildren();
    summaryTipHazardsEl.setAttribute(
      "aria-label",
      `Upcoming stage hazards: ${hazardPills.map((pill) => pill.label).join(", ")}`
    );

    hazardPills.forEach(({ icon, text, label }) => {
      const pillEl = document.createElement("span");
      pillEl.className = "stage-tip-hazard-pill";
      pillEl.dataset.theme = levelSelectThemeKey(level);
      pillEl.setAttribute("aria-label", label);

      const iconEl = document.createElement("span");
      iconEl.className = "stage-tip-hazard-icon";
      iconEl.textContent = icon;
      iconEl.setAttribute("aria-hidden", "true");

      const textEl = document.createElement("span");
      textEl.className = "stage-tip-hazard-text";
      textEl.textContent = text;

      pillEl.append(iconEl, textEl);
      summaryTipHazardsEl.appendChild(pillEl);
    });
  }

  if (summaryTipPickupsEl) {
    const pickupPills = levelSelectPickupPills(level);
    summaryTipPickupsEl.replaceChildren();
    summaryTipPickupsEl.setAttribute(
      "aria-label",
      `Upcoming stage pickups: ${pickupPills.map((pill) => pill.label).join(", ")}`
    );

    pickupPills.forEach(({ icon, text, label }) => {
      const pillEl = document.createElement("span");
      pillEl.className = "stage-tip-pickup-pill";
      pillEl.dataset.theme = levelSelectThemeKey(level);
      pillEl.setAttribute("aria-label", label);

      const iconEl = document.createElement("span");
      iconEl.className = "stage-tip-pickup-icon";
      iconEl.textContent = icon;
      iconEl.setAttribute("aria-hidden", "true");

      const textEl = document.createElement("span");
      textEl.className = "stage-tip-pickup-text";
      textEl.textContent = text;

      pillEl.append(iconEl, textEl);
      summaryTipPickupsEl.appendChild(pillEl);
    });
  }

  if (summaryTipEl) {
    summaryTipEl.textContent = levelSelectTipText(level);
  }

  renderMobileControlHints(level);
}

function goToStartScreen() {
  state.mode = "start";
  state.currentLevelIndex = 0;
  state.totalBones = LEVELS[0].totalBones;
  state.bonesCollected = 0;
  state.lives = MAX_LIVES;
  state.levelRespawnsLeft = LEVEL_RESPAWNS;
  state.invulnerableUntil = 0;
  state.hitControlLockUntil = 0;
  state.capeUntil = 0;
  state.levelTitleUntil = 0;
  state.celebrateUntil = 0;
  state.pendingNextLevel = null;
  state.celebrationBurstAt = 0;
  state.cheatBuffer = "";
  state.levelSelectOpen = false;
  state.combat.barkCooldownUntil = 0;
  state.combat.barkWaves = [];
  state.combat.barkFlashUntil = 0;
  state.bossProjectiles = [];
  state.sirenSlowUntil = 0;
  state.toyHeld = false;
  state.toyProjectile = null;
  state.backflipUntil = 0;
  state.backflipNextAt = Date.now() + 6000;
  state.danceUntil = 0;
  state.danceNextAt = Date.now() + 6000;
  state.digUntil = 0;
  state.digNextAt = Date.now() + 7000;
  state.sirenOverlayUntil = 0;
  state.pauseOptionIndex = 0;
  stopCapeSound();
  stopCapeAmbient();
  stopTornadoSound();
  state.cameraX = 0;
  state.jumpBufferedUntil = 0;
  state.lastGroundedAt = 0;
  levelRuntime = hydrateLevelRuntime(LEVELS[0]);
  resetPlayerPosition();
  renderLives();
  renderLaunchStatus();
}

function renderHenryProgress() {
  const level = LEVELS[state.currentLevelIndex] || LEVELS[0];
  const showingDefaultStart = !["playing", "paused", "dead"].includes(state.mode);
  const levelText = `${showingDefaultStart ? "Default start" : "Current run"} · ${runSummaryLevelText(level)}`;
  const themeKey = levelSelectThemeKey(level);
  const themeText = levelSelectStageText(level);
  const themeIcon = levelSelectStageIcon(level);
  if (henryProgressLevelEl) {
    const progressPercent = `${Math.min(100, Math.max(5, ((Math.max(0, state.currentLevelIndex || 0) + 1) / LEVELS.length) * 100))}%`;
    henryProgressLevelEl.textContent = levelText;
    henryProgressLevelEl.dataset.tone = showingDefaultStart ? "default" : "current";
    henryProgressLevelEl.style.setProperty("--henry-progress-level-fill", progressPercent);
    henryProgressLevelEl.setAttribute("aria-label", `${levelText}, campaign progress ${progressPercent}`);
    henryProgressLevelEl.title = `Campaign progress ${progressPercent}`;
  }
  if (henryProgressThemeEl) {
    const themeText = level?.boss?.name ? `Boss · ${level.boss.name}` : `Stage ${levelSelectStageText(level)}`;
    henryProgressThemeEl.textContent = `${themeIcon} ${themeText}`;
    henryProgressThemeEl.dataset.tone = "theme";
    henryProgressThemeEl.dataset.theme = themeKey;
    henryProgressThemeEl.setAttribute("aria-label", themeText);
    henryProgressThemeEl.title = themeText;
  }
  if (henryProgressChallengeEl) {
    const difficulty = levelSelectChallengeBadge(level, state.currentLevelIndex || 0);
    henryProgressChallengeEl.textContent = difficulty.badgeText;
    henryProgressChallengeEl.dataset.tone = "challenge";
    henryProgressChallengeEl.dataset.challengeTone = difficulty.tone;
    henryProgressChallengeEl.setAttribute("aria-label", difficulty.text);
    henryProgressChallengeEl.title = difficulty.text;
  }
  if (henryProgressLengthEl) {
    const length = levelSelectLengthBadge(level);
    henryProgressLengthEl.textContent = `${length.icon} ${length.text}`;
    henryProgressLengthEl.dataset.tone = "length";
    henryProgressLengthEl.dataset.theme = themeKey;
    henryProgressLengthEl.setAttribute("aria-label", length.label);
    henryProgressLengthEl.title = length.label;
  }
  if (henryProgressGoalEl) {
    const goalPreview = levelSelectGoalPreview(level);
    henryProgressGoalEl.textContent = goalPreview.text;
    henryProgressGoalEl.dataset.tone = "goal";
    henryProgressGoalEl.dataset.theme = themeKey;
    henryProgressGoalEl.setAttribute("aria-label", goalPreview.label);
    henryProgressGoalEl.title = goalPreview.label;
  }
  if (henryProgressPickupsEl) {
    const pickupSummary = levelSelectPickupSummary(level);
    henryProgressPickupsEl.textContent = pickupSummary.text;
    henryProgressPickupsEl.dataset.tone = "pickup";
    henryProgressPickupsEl.dataset.theme = themeKey;
    henryProgressPickupsEl.setAttribute("aria-label", pickupSummary.label);
    henryProgressPickupsEl.title = pickupSummary.label;
  }
  if (henryProgressHazardsEl) {
    const hazardPills = levelSelectHazardPills(level);
    const hazardSummaryText = hazardPills.map(({ icon, text }) => `${icon} ${text}`).join(" • ");
    const hazardSummaryLabel = `Hazards: ${hazardPills.map(({ label }) => label).join(", ")}`;
    henryProgressHazardsEl.textContent = hazardSummaryText;
    henryProgressHazardsEl.dataset.tone = "hazard";
    henryProgressHazardsEl.dataset.theme = themeKey;
    henryProgressHazardsEl.setAttribute("aria-label", hazardSummaryLabel);
    henryProgressHazardsEl.title = hazardSummaryLabel;
  }
  if (henryProgressFocusEl) {
    const focus = levelSelectFocusPill(level);
    henryProgressFocusEl.textContent = `${focus.icon} ${focus.text}`;
    henryProgressFocusEl.dataset.tone = "focus";
    henryProgressFocusEl.dataset.theme = themeKey;
    henryProgressFocusEl.setAttribute("aria-label", focus.label);
    henryProgressFocusEl.title = focus.label;
  }
  if (henryProgressTipEl) {
    const tipText = levelSelectTipText(level);
    henryProgressTipEl.textContent = levelSelectPortalTipText(level);
    henryProgressTipEl.dataset.tone = "tip";
    henryProgressTipEl.dataset.theme = themeKey;
    henryProgressTipEl.setAttribute("aria-label", tipText);
    henryProgressTipEl.title = tipText;
  }
  if (henryProgressJumpBtn) {
    const targetLevelLabel = `Level ${Math.max(1, (state.currentLevelIndex || 0) + 1)}`;
    const runModeLabel = showingDefaultStart ? "Default start" : "Current run";
    henryProgressJumpBtn.dataset.theme = themeKey;
    henryProgressJumpBtn.dataset.mode = showingDefaultStart ? "default" : "current";
    henryProgressJumpBtn.title = `${runModeLabel} · ${themeText} quick jump`;
    henryProgressJumpBtn.replaceChildren();

    const modeBadge = document.createElement("span");
    modeBadge.className = "henry-progress-action-mode";
    modeBadge.textContent = runModeLabel;
    modeBadge.setAttribute("aria-hidden", "true");

    const themeBadge = document.createElement("span");
    themeBadge.className = "henry-progress-action-theme";
    themeBadge.textContent = `${themeIcon} ${themeText}`;
    themeBadge.setAttribute("aria-hidden", "true");

    const label = document.createElement("span");
    label.className = "henry-progress-action-label";
    label.textContent = showingDefaultStart ? `Jump to ${targetLevelLabel}` : `Resume ${targetLevelLabel}`;

    henryProgressJumpBtn.append(modeBadge, themeBadge, label);
    henryProgressJumpBtn.setAttribute(
      "aria-label",
      showingDefaultStart
        ? `Jump straight to the default start on ${targetLevelLabel}, ${themeText.toLowerCase()} stage`
        : `Jump straight back into the current run on ${targetLevelLabel}, ${themeText.toLowerCase()} stage`
    );
  }
}

function openLevelSelect() {
  if (!levelSelectEl || !levelListEl) return;
  state.levelSelectOpen = true;
  playUnlockSound();
  playSecretSound();
  setBgVolume(0.04);
  levelSelectEl.style.backgroundImage = `url('${LOGO_IMG}')`;
  levelSelectEl.style.backgroundRepeat = "no-repeat";
  levelSelectEl.style.backgroundPosition = "center";
  levelSelectEl.style.backgroundSize = "50% auto";
  levelSelectEl.classList.remove("hidden");
  renderHenryProgress();
  levelListEl.innerHTML = "";
  let currentLevelBtn = null;

  LEVELS.forEach((lvl, idx) => {
    const btn = document.createElement("button");
    btn.className = "level-btn";
    btn.dataset.theme = levelSelectThemeKey(lvl);

    const isCurrentLevel = idx === state.currentLevelIndex;
    if (isCurrentLevel) {
      btn.dataset.current = "true";
    }

    const levelLabel = document.createElement("span");
    levelLabel.className = "level-btn-number";
    levelLabel.textContent = `Level ${idx + 1}`;

    const currentBadge = document.createElement("span");
    currentBadge.className = "level-btn-current";
    currentBadge.textContent = state.mode === "start" ? "Default" : "Current";
    currentBadge.hidden = !isCurrentLevel;

    const stage = document.createElement("span");
    stage.className = "level-btn-stage";

    const stageIcon = document.createElement("span");
    stageIcon.className = "level-btn-stage-icon";
    stageIcon.textContent = levelSelectStageIcon(lvl);
    stageIcon.setAttribute("aria-hidden", "true");

    const stageText = document.createElement("span");
    stageText.className = "level-btn-stage-text";
    stageText.textContent = levelSelectStageText(lvl);

    stage.append(stageIcon, stageText);

    const difficulty = document.createElement("span");
    difficulty.className = "level-btn-difficulty";
    const difficultyMeta = levelSelectChallengeBadge(lvl, idx);
    difficulty.textContent = difficultyMeta.badgeText;
    difficulty.dataset.tone = difficultyMeta.tone;

    const length = document.createElement("span");
    length.className = "level-btn-length";
    length.textContent = levelSelectLengthText(lvl);

    const focus = document.createElement("span");
    focus.className = "level-btn-focus";
    const focusMeta = levelSelectFocusPill(lvl);
    focus.textContent = `${focusMeta.icon} ${focusMeta.text}`;
    focus.setAttribute("aria-label", focusMeta.label);
    focus.title = focusMeta.label;

    const pickupBits = [`${lvl.totalBones} bones`];
    if (lvl.hearts?.length) pickupBits.push(`${lvl.hearts.length} heart${lvl.hearts.length === 1 ? "" : "s"}`);
    if (lvl.capes?.length) pickupBits.push(`${lvl.capes.length} cape${lvl.capes.length === 1 ? "" : "s"}`);
    if (lvl.sirens?.length || lvl.toys?.length) pickupBits.push("toy toss");

    const stats = document.createElement("span");
    stats.className = "level-btn-stats";
    stats.setAttribute("aria-label", `Pickups: ${pickupBits.join(", ")}`);

    const pickupPills = levelSelectPickupPills(lvl);

    pickupPills.forEach(({ icon, text, label }) => {
      const pill = document.createElement("span");
      pill.className = "level-btn-stat-pill";
      pill.setAttribute("aria-label", label);

      const iconEl = document.createElement("span");
      iconEl.className = "level-btn-stat-icon";
      iconEl.textContent = icon;
      iconEl.setAttribute("aria-hidden", "true");

      const textEl = document.createElement("span");
      textEl.className = "level-btn-stat-text";
      textEl.textContent = text;

      pill.append(iconEl, textEl);
      stats.appendChild(pill);
    });

    const hazards = document.createElement("span");
    hazards.className = "level-btn-hazards";
    hazards.textContent = levelSelectHazardText(lvl);

    const goal = document.createElement("span");
    goal.className = "level-btn-goal";
    const goalPreview = levelSelectGoalPreview(lvl);
    goal.textContent = goalPreview.text;
    goal.setAttribute("aria-label", goalPreview.label);
    goal.title = goalPreview.label;

    const tip = document.createElement("span");
    tip.className = "level-btn-tip";
    tip.textContent = levelSelectTipText(lvl);

    const badges = [];
    if (lvl.water) badges.push("Swim");
    if (lvl.moon) badges.push("Moon");
    if (lvl.cloud) badges.push("Clouds");
    if (lvl.tunnel) badges.push("Tunnel");
    if (lvl.volcano) badges.push("Volcano");
    if (lvl.giantEnemies) badges.push("Big Corgis");
    if (lvl.dark) badges.push("Lights");
    if (lvl.capes?.length) badges.push("Cape");
    if (lvl.sirens?.length || lvl.toys?.length) badges.push("Toy");
    if (lvl.boss) badges.push("Boss");

    const meta = document.createElement("span");
    meta.className = "level-btn-meta";
    meta.textContent = badges.length ? badges.join(" • ") : "Classic run";

    btn.append(levelLabel, currentBadge, stage, difficulty, length, focus, goal, tip, hazards, stats, meta);
    btn.setAttribute(
      "aria-label",
      `${isCurrentLevel ? `${state.mode === "start" ? "Default start, " : "Current level, "}` : ""}${lvl.name}, ${difficultyMeta.text.replace(/^Challenge:\s*/, "challenge ")}, ${levelSelectHazardText(lvl).replace(/^Hazards:\s*/, "")}, ${pickupBits.join(", ")}${badges.length ? `, ${badges.join(", ")}` : ", classic run"}`
    );
    if (isCurrentLevel) currentLevelBtn = btn;
    btn.addEventListener("click", () => {
      closeLevelSelect();
      loadLevel(idx, { resetLives: true });
      statusEl.textContent = `${lvl.name}: Cheat start activated.`;
    });
    levelListEl.appendChild(btn);
  });

  requestAnimationFrame(() => {
    currentLevelBtn?.scrollIntoView({ block: "nearest", inline: "nearest" });
    currentLevelBtn?.focus({ preventScroll: true });
  });
}

function closeLevelSelect() {
  if (!levelSelectEl) return;
  state.levelSelectOpen = false;
  levelSelectEl.classList.add("hidden");
  levelSelectEl.style.backgroundImage = "";
  setBgVolume(0.18);
}

function getLevelSelectButtons() {
  return levelListEl ? [...levelListEl.querySelectorAll(".level-btn")] : [];
}

function getLevelSelectFocusedButton() {
  const active = document.activeElement;
  if (active instanceof HTMLElement && active.classList.contains("level-btn")) return active;
  return getLevelSelectButtons().find((btn) => btn.dataset.current === "true") || getLevelSelectButtons()[0] || null;
}

function levelSelectRows() {
  const buttons = getLevelSelectButtons();
  const rows = [];
  buttons.forEach((btn) => {
    const rect = btn.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const row = rows.find((entry) => Math.abs(entry.top - rect.top) < 12);
    const item = { btn, centerX };
    if (row) {
      row.items.push(item);
    } else {
      rows.push({ top: rect.top, items: [item] });
    }
  });
  rows.forEach((row) => row.items.sort((a, b) => a.centerX - b.centerX));
  return rows;
}

function moveLevelSelectFocus(direction) {
  const current = getLevelSelectFocusedButton();
  if (!current) return false;

  const rows = levelSelectRows();
  let rowIndex = -1;
  let colIndex = -1;

  rows.some((row, rIdx) => {
    const cIdx = row.items.findIndex((item) => item.btn === current);
    if (cIdx >= 0) {
      rowIndex = rIdx;
      colIndex = cIdx;
      return true;
    }
    return false;
  });

  if (rowIndex < 0 || colIndex < 0) return false;

  const currentItem = rows[rowIndex].items[colIndex];
  let target = null;

  if (direction === "left") {
    target = rows[rowIndex].items[colIndex - 1]?.btn || current;
  } else if (direction === "right") {
    target = rows[rowIndex].items[colIndex + 1]?.btn || current;
  } else if (direction === "up" || direction === "down") {
    const nextRow = rows[rowIndex + (direction === "up" ? -1 : 1)];
    if (nextRow) {
      target = nextRow.items.reduce((best, item) => {
        if (!best) return item;
        return Math.abs(item.centerX - currentItem.centerX) < Math.abs(best.centerX - currentItem.centerX) ? item : best;
      }, null)?.btn || current;
    } else {
      target = current;
    }
  } else if (direction === "home") {
    target = rows[0]?.items[0]?.btn || current;
  } else if (direction === "end") {
    const lastRow = rows[rows.length - 1];
    target = lastRow?.items[lastRow.items.length - 1]?.btn || current;
  }

  if (!target || target === current) return false;
  target.focus({ preventScroll: true });
  target.scrollIntoView({ block: "nearest", inline: "nearest" });
  return true;
}

const imgCache = new Map();
function getImage(src) {
  if (imgCache.has(src)) return imgCache.get(src);
  const img = new Image();
  img.src = src;
  imgCache.set(src, img);
  return img;
}

let audioCtx = null;
let audioUnlocked = false;
const audioBufferCache = new Map();

function preferredAudioSources(src) {
  const list = Array.isArray(src) ? src : [src];
  if (!mobileControlState.enabled) return list;
  const out = [];
  for (const item of list) {
    if (typeof item === "string" && item.endsWith(".wav")) {
      out.push(item.replace(/\.wav$/i, ".m4a"));
    }
    out.push(item);
  }
  return [...new Set(out)];
}

function stopAudioHandle(handle) {
  if (!handle) return;
  try {
    handle.source?.stop();
  } catch (_) {}
  try {
    handle.source?.disconnect();
    handle.gain?.disconnect();
  } catch (_) {}
}

function unlockAudio() {
  try {
    audioCtx ||= new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx?.state === "suspended" && audioCtx.resume) audioCtx.resume().catch(() => {});
    audioUnlocked = true;
  } catch (_) {
    audioUnlocked = false;
  }
}

async function loadAudioBuffer(src) {
  const candidates = preferredAudioSources(src);
  const cacheKey = candidates.join("|");
  if (!audioBufferCache.has(cacheKey)) {
    audioBufferCache.set(
      cacheKey,
      (async () => {
        unlockAudio();
        for (const candidate of candidates) {
          try {
            const res = await fetch(candidate);
            if (!res.ok) continue;
            const arrayBuffer = await res.arrayBuffer();
            const buffer = await audioCtx.decodeAudioData(arrayBuffer.slice(0));
            return { buffer, src: candidate };
          } catch (_) {}
        }
        throw new Error(`Failed to load audio: ${candidates.join(", ")}`);
      })()
    );
  }
  return audioBufferCache.get(cacheKey);
}

async function playBufferedSound(src, { volume = 1, loop = false } = {}) {
  unlockAudio();
  if (!audioCtx || AUDIO.muted) return null;
  try {
    const { buffer, src: resolvedSrc } = await loadAudioBuffer(src);
    const source = audioCtx.createBufferSource();
    const gain = audioCtx.createGain();
    source.buffer = buffer;
    source.loop = loop;
    gain.gain.setValueAtTime(volume, audioCtx.currentTime);
    source.connect(gain);
    gain.connect(audioCtx.destination);
    source.start();
    return {
      source,
      gain,
      src: resolvedSrc,
      stop() {
        stopAudioHandle({ source, gain });
      },
    };
  } catch (_) {
    return null;
  }
}

function musicVolume(paused = false) {
  if (AUDIO.muted) return 0;
  const maxVol = 0.3;
  const base = (AUDIO.musicVol / 100) * maxVol;
  return paused ? base * AUDIO.musicPausedFactor : base;
}

function applyMusicVolume(paused = false) {
  if (bgMusic.handle?.gain && audioCtx) {
    bgMusic.handle.gain.gain.setValueAtTime(musicVolume(paused), audioCtx.currentTime);
  }
}

function startBgMusic() {
  unlockAudio();
  if (capeAmbientAudio) return;
  if ((bgMusic.started && bgMusic.handle) || bgMusic.loadingToken === bgMusic.token) return;
  const token = bgMusic.token;
  bgMusic.loadingToken = token;
  playBufferedSound(bgMusic.src || MAIN_MUSIC, { volume: musicVolume(state.mode === "paused"), loop: true }).then((handle) => {
    if (bgMusic.loadingToken === token) bgMusic.loadingToken = null;
    if (!handle) return;
    if (bgMusic.token !== token) {
      handle.stop();
      return;
    }
    if (bgMusic.handle) bgMusic.handle.stop();
    bgMusic.handle = handle;
    bgMusic.started = true;
    applyMusicVolume(state.mode === "paused");
  }).catch(() => {
    if (bgMusic.loadingToken === token) bgMusic.loadingToken = null;
  });
}

function setBgTrack(src) {
  stopBgMusic();
  bgMusic.src = src;
  bgMusic.started = false;
  bgMusic.token += 1;
  startBgMusic();
}

function stopBgMusic() {
  bgMusic.token += 1;
  bgMusic.loadingToken = null;
  if (bgMusic.handle) bgMusic.handle.stop();
  bgMusic.handle = null;
  bgMusic.started = false;
}

function setBgVolume(vol) {
  if (bgMusic.handle?.gain && audioCtx) {
    bgMusic.handle.gain.gain.setValueAtTime(AUDIO.muted ? 0 : vol, audioCtx.currentTime);
  }
}

function toggleAudioMute() {
  AUDIO.muted = !AUDIO.muted;
  applyMusicVolume(state.mode === "paused");
}

function pauseGame() {
  if (state.mode !== "playing") return;
  state.mode = "paused";
  state.pauseMenu = "main";
  applyMusicVolume(true);
  playPauseEnterSound();
}

function resumeGame() {
  if (state.mode !== "paused") return;
  state.mode = "playing";
  applyMusicVolume(false);
  playPauseExitSound();
}

function cyclePauseSelection(direction = 1) {
  if (state.mode !== "paused") return;
  if (state.pauseMenu === "main") {
    const opts = ["continue", "options"];
    state.pauseOptionIndex = (state.pauseOptionIndex + opts.length + direction) % opts.length;
    return;
  }
  if (state.pauseMenu === "options") {
    const opts = ["music", "sfx"];
    state.pauseOptionIndex = (state.pauseOptionIndex + opts.length + direction) % opts.length;
  }
}

function adjustPauseOption(delta) {
  if (state.mode !== "paused" || state.pauseMenu !== "options" || delta === 0) return;
  const opts = ["music", "sfx"];
  const key = opts[state.pauseOptionIndex] || "music";
  if (key === "music") AUDIO.musicVol = Math.max(0, Math.min(100, AUDIO.musicVol + delta));
  if (key === "sfx") AUDIO.sfxVol = Math.max(0, Math.min(100, AUDIO.sfxVol + delta));
  applyMusicVolume(true);
}

function confirmPauseSelection() {
  if (state.mode !== "paused") return;
  if (state.pauseMenu === "main") {
    if ((state.pauseOptionIndex || 0) === 1) {
      state.pauseMenu = "options";
      state.pauseOptionIndex = 0;
    } else {
      resumeGame();
    }
    return;
  }
  if (state.pauseMenu === "options") {
    state.pauseMenu = "main";
  }
}

function tone(freq = 440, ms = 120, type = "square", vol = 0.03, slideTo = null) {
  try {
    unlockAudio();
    audioCtx ||= new (window.AudioContext || window.webkitAudioContext)();
    const ctxA = audioCtx;
    const osc = ctxA.createOscillator();
    const gain = ctxA.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctxA.currentTime);
    if (slideTo) osc.frequency.linearRampToValueAtTime(slideTo, ctxA.currentTime + ms / 1000);
    gain.gain.setValueAtTime(0.0001, ctxA.currentTime);
    gain.gain.exponentialRampToValueAtTime(vol, ctxA.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctxA.currentTime + ms / 1000);
    osc.connect(gain);
    gain.connect(ctxA.destination);
    osc.start();
    osc.stop(ctxA.currentTime + ms / 1000 + 0.02);
  } catch (_) {}
}

function playUnlockSound() {
  tone(420, 110, "square", 0.035, 780);
  setTimeout(() => tone(640, 130, "triangle", 0.035, 980), 85);
  setTimeout(() => tone(860, 180, "sawtooth", 0.03, 1320), 165);
}

function playSecretSound() {
  stopBgMusic();
  playBufferedSound("assets/Secret.wav", { volume: sfxVolume(0.7) });
}

function playBoneSound() {
  playBufferedSound("assets/Bone.wav", { volume: sfxVolume(0.6) });
}

function playJumpSound() {
  playBufferedSound("assets/Jump.wav", { volume: sfxVolume(0.55) });
}

function playAirJumpSound() {
  playBufferedSound("assets/Jump2.wav", { volume: sfxVolume(0.55) });
}

function playKillSound() {
  playBufferedSound("assets/Kill.wav", { volume: sfxVolume(0.55) });
}

function stopDieSound() {
  if (dieAudio) dieAudio.stop();
  dieAudio = null;
}

function playDieSound() {
  stopDieSound();
  stopBgMusic();
  stopCapeSound();
  stopTornadoSound();
  playBufferedSound("assets/Die.wav", { volume: sfxVolume(0.65) }).then((handle) => {
    dieAudio = handle;
  });
}

function sfxVolume(base = 1) {
  if (AUDIO.muted) return 0;
  return base * (AUDIO.sfxVol / 100);
}

function playHeartSound() {
  playBufferedSound("assets/Heart.wav", { volume: sfxVolume(0.55) });
}

function playSneezeSound() {
  playBufferedSound("assets/Sneeze.wav", { volume: sfxVolume(0.6) });
}

function playPauseEnterSound() {
  playBufferedSound("assets/pause1.wav", { volume: sfxVolume(0.6) });
}

function playPauseExitSound() {
  playBufferedSound("assets/pause2.wav", { volume: sfxVolume(0.6) });
}

function playShortBarkSound() {
  playBufferedSound("assets/Bark.wav", { volume: sfxVolume(0.7) });
}

function playBarkSound(strong = true) {
  if (strong) {
    tone(220, 120, "sawtooth", 0.04, 140);
    setTimeout(() => tone(180, 110, "square", 0.03, 120), 45);
  } else {
    tone(250, 80, "square", 0.025, 170);
  }
}

function playSuperBarkSound() {
  playBufferedSound(["assets/Superbark.m4a", "assets/Superbark.wav"], { volume: sfxVolume(0.65) });
}

function stopCapeSound() {
  if (capeAudio) capeAudio.stop();
  capeAudio = null;
}

function stopTornadoSound() {
  if (tornadoAudio) tornadoAudio.stop();
  tornadoAudio = null;
}

function playTornadoSound() {
  if (tornadoAudio) return;
  playBufferedSound("assets/Tornado.wav", { volume: sfxVolume(0.55), loop: true }).then((handle) => {
    tornadoAudio = handle;
  });
}

function stopCapeAmbient() {
  if (capeAmbientAudio) capeAmbientAudio.stop();
  capeAmbientAudio = null;
}

function playCapeAmbient() {
  stopCapeAmbient();
  stopBgMusic();
  playBufferedSound("assets/water.wav", { volume: sfxVolume(0.35), loop: true }).then((handle) => {
    capeAmbientAudio = handle;
  });
}

function playCapeSound() {
  stopCapeSound();
  playBufferedSound(["assets/Supergrowl.m4a", "assets/Supergrowl.wav"], { volume: sfxVolume(0.55) }).then((handle) => {
    capeAudio = handle;
  });
}

function playLevelClearSound() {
  playBufferedSound(["assets/Superbark.m4a", "assets/Superbark.wav"], { volume: sfxVolume(0.6) });
}

function resolvePlayerPenetration(level) {
  const dog = state.dog;
  for (const p of level.platforms) {
    if (!isPlatformSolid(p)) continue;
    if (!intersects(dog, p)) continue;

    const overlapLeft = dog.x + dog.w - p.x;
    const overlapRight = p.x + p.w - dog.x;
    const overlapTop = dog.y + dog.h - p.y;
    const overlapBottom = p.y + p.h - dog.y;

    const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);

    if (minOverlap === overlapTop) {
      dog.y = p.y - dog.h;
      dog.vy = Math.min(0, dog.vy);
      dog.onGround = true;
    } else if (minOverlap === overlapBottom) {
      dog.y = p.y + p.h;
      if (dog.vy < 0) dog.vy = 0;
    } else if (minOverlap === overlapLeft) {
      dog.x = p.x - dog.w;
      if (dog.vx > 0) dog.vx = 0;
    } else {
      dog.x = p.x + p.w;
      if (dog.vx < 0) dog.vx = 0;
    }
  }

  dog.x = Math.max(0, Math.min(level.worldWidth - dog.w, dog.x));
}

function updateCloudPlatforms(level, now, supportingPlatform) {
  if (!level.cloud) return false;

  let collapsedUnderDog = false;
  for (const p of level.platforms) {
    if (!p.cloudVanish) continue;

    if (p.active === false) {
      if (now >= (p.respawnAt || 0)) {
        p.active = true;
        p.occupiedSince = 0;
        p.respawnAt = 0;
      }
      continue;
    }

    if (p === supportingPlatform) {
      if (!p.occupiedSince) p.occupiedSince = now;
      if (now - p.occupiedSince >= CLOUD_PLATFORM_HOLD_MS) {
        p.active = false;
        p.occupiedSince = 0;
        p.respawnAt = now + CLOUD_PLATFORM_RESPAWN_MS;
        collapsedUnderDog = true;
      }
    } else {
      p.occupiedSince = 0;
    }
  }

  return collapsedUnderDog;
}

function applyHitKnockback() {
  const dog = state.dog;
  const backDir = -dog.facing || -1;
  dog.vx = backDir * HIT_KNOCKBACK_X;
  dog.vy = HIT_KNOCKBACK_Y;
  dog.onGround = false;
  state.hitControlLockUntil = Date.now() + HIT_KNOCKBACK_LOCK_MS;
}

function takeHit(reasonText) {
  const now = Date.now();
  if (now < state.invulnerableUntil || state.mode !== "playing") return;

  const lethal = state.lives <= 1;
  state.lives -= 1;
  renderLives();

  if (lethal) {
    stopBgMusic();
    stopCapeSound();
    stopCapeAmbient();
    stopTornadoSound();
    if (state.levelRespawnsLeft <= 0) {
      state.mode = "gameover";
      playDieSound();
      statusEl.textContent = `${reasonText} GAME OVER. Press Q to restart or tap ▲.`;
    } else {
      state.mode = "dead";
      state.deathAt = now;
      playDieSound();
      statusEl.textContent = `${reasonText} You fainted. Press C to continue (${state.levelRespawnsLeft} left) or Q to quit. Touch: ▲ continue, BARK quit.`;
    }
    return;
  }

  playHitSound();
  state.invulnerableUntil = now + HIT_INVULN_MS;
  applyHitKnockback();
  resolvePlayerPenetration(levelRuntime);
  statusEl.textContent = `${reasonText} Knocked back! Hearts left: ${state.lives}/${MAX_LIVES}`;
}

function continueRun() {
  if (state.levelRespawnsLeft <= 0) {
    state.mode = "gameover";
    statusEl.textContent = "GAME OVER. Press Q, Enter, or Space to restart. Touch: tap ▲ to restart.";
    return;
  }
  state.levelRespawnsLeft = Math.max(0, state.levelRespawnsLeft - 1);
  state.lives = MAX_LIVES;
  renderLives();
  stopDieSound();
  stopBgMusic();
  startBgMusic();
  loadLevel(state.currentLevelIndex, { resetLives: true, preserveRespawns: true });
}

function quitToStart() {
  state.levelRespawnsLeft = LEVEL_RESPAWNS;
  state.lives = MAX_LIVES;
  renderLives();
  stopDieSound();
  stopBgMusic();
  startBgMusic();
  loadLevel(0, { resetLives: true, preserveRespawns: false });
}

function playHitSound() {
  playBufferedSound("assets/hit.wav", { volume: sfxVolume(0.65) });
}

function spawnBarkWave(mode = "forward") {
  const dog = state.dog;
  const now = Date.now();
  const upward = mode === "up";
  const wave = {
    x: upward ? dog.x + dog.w * 0.3 : dog.facing > 0 ? dog.x + dog.w - 6 : dog.x - BARK_WAVE_WIDTH + 6,
    y: upward ? dog.y - 70 : dog.y + 4,
    w: upward ? 70 : BARK_WAVE_WIDTH,
    h: upward ? 120 : BARK_WAVE_HEIGHT,
    dir: upward ? 0 : dog.facing,
    bornAt: now,
    mode,
  };
  state.combat.barkWaves.push(wave);
  state.combat.barkFlashUntil = now + 160;
}

function triggerBark() {
  // Normal bark: short range, no cooldown, two-hit kill on enemies.
  if (state.mode !== "playing") return;
  state.combat.barkWaves.push({
    x: state.dog.facing > 0 ? state.dog.x + state.dog.w - 6 : state.dog.x - 60,
    y: state.dog.y + 6,
    w: 60,
    h: 32,
    dir: state.dog.facing,
    bornAt: Date.now(),
    mode: "short",
  });
  state.combat.barkFlashUntil = Date.now() + 140;
  playShortBarkSound();
}

function triggerSuperBark() {
  if (triggerTunnelDigBoost()) return;
  if (state.mode !== "playing" || !barkReady()) return;

  // If holding a toy, throw it instead of the normal super bark clear.
  if (state.toyHeld) {
    const dir = state.dog.facing > 0 ? 1 : -1;
    state.toyProjectile = {
      x: dir > 0 ? state.dog.x + state.dog.w : state.dog.x - 12,
      y: state.dog.y + 10,
      w: 14,
      h: 10,
      vx: 9 * dir,
    };
    state.toyHeld = false;
    playSuperBarkSound();
    state.combat.barkCooldownUntil = Date.now() + BARK_COOLDOWN_MS;
    statusEl.textContent = `${levelRuntime.name}: Toy launched!`;
    return;
  }

  const now = Date.now();
  playBarkSound(true);
  playSuperBarkSound();
  state.barkWagUntil = now + 650;
  state.combat.barkCooldownUntil = now + BARK_COOLDOWN_MS;

  const camStart = state.cameraX - 40;
  const camEnd = state.cameraX + canvas.width + 40;
  for (const e of levelRuntime.enemies) {
    if (isEnemyAlive(e) && e.x + e.w > camStart && e.x < camEnd) {
      defeatEnemy(e, state.dog.facing * 2.5);
    }
  }
  // Clear projectiles and give a brief freeze + shake.
  state.bossProjectiles = [];
  state.freezeUntil = now + SUPER_BARK_FREEZE_MS;
  state.shakeUntil = now + SUPER_BARK_FREEZE_MS;
  state.shakeIntensity = SUPER_BARK_SHAKE_INTENSITY;
  state.barkBlast = { startedAt: now, duration: SUPER_BARK_BLAST_MS };

  statusEl.textContent = `${levelRuntime.name}: SUPER BARK! Screen clear!`;
}

function hydrateLevelRuntime(level) {
  const enemyScale = level.giantEnemies ? 1.85 : 1;
  const boss = level.boss
    ? {
        ...level.boss,
        health: level.boss.maxHealth,
        dead: false,
        dying: false,
        vy: 0,
        vx: 0,
        lastAttackAt: 0,
        phase2: false,
        telegraphUntil: 0,
        telegraphType: null,
        dashUntil: 0,
        dashVx: 0,
      }
    : null;

  return {
    ...level,
    bones: level.bones.map((b) => ({ ...b, taken: false })),
    hearts: (level.hearts || []).map((h) => ({ ...h, taken: false })),
    capes: (level.capes || []).map((c) => ({ ...c, taken: false })),
    enemies: level.enemies.map((e) => ({
      ...e,
      w: e.w * enemyScale,
      h: e.h * enemyScale,
      y: e.y - (e.h * enemyScale - e.h),
      speed: e.speed * (level.giantEnemies ? 0.82 : 1),
      giant: Boolean(level.giantEnemies),
      dying: false,
      dead: false,
      vx: 0,
      vy: 0,
    })),
    spikes: level.spikes.map((s) => ({ ...s })),
    lavaPools: (level.lavaPools || []).map((pool) => ({ ...pool })),
    platforms: level.platforms.map((p) => ({ ...p, active: p.active ?? true, occupiedSince: 0, respawnAt: 0, dugOut: false, digProgress: 0, lastDigParticleAt: 0 })),
    finishFlag: { ...level.finishFlag },
    boss,
    sirens: (level.sirens || []).map((s) => ({ ...s })),
    toys: (level.toys || []).map((t) => ({ ...t })),
    lightSwitches: (level.lightSwitches || []).map((s) => ({ ...s, on: false, wasTouching: false, litUntil: 0, rearmLocked: false })),
    darkRevealUntil: 0,
  };
}

let levelRuntime = hydrateLevelRuntime(LEVELS[0]);

function resetPlayerPosition() {
  state.dog.x = START_X;
  state.dog.y = START_Y;
  state.dog.vx = 0;
  state.dog.vy = 0;
  state.dog.onGround = false;
  state.superJumpUsed = false;
  state.airJumpsUsed = 0;
  state.lastJumpTapAt = 0;
  state.lastAirJumpConsumedAt = 0;
  state.lastGroundedAt = 0;
  state.superJumpFloatUntil = 0;
  state.idleWagUntil = 0;
  state.barkWagUntil = 0;
  state.sneezeUntil = 0;
  state.sneezeNextAt = Date.now() + 5000;
  state.backflipUntil = 0;
  state.backflipNextAt = Date.now() + 6000;
  state.danceUntil = 0;
  state.danceNextAt = Date.now() + 6000;
  state.digUntil = 0;
  state.digNextAt = Date.now() + 7000;
  state.idleNextWagAt = Date.now() + 900;
  state.jumpHeld = false;
  state.jumpHoldStartedAt = 0;
  state.jumpBufferedUntil = 0;
  state.dirtBursts = [];
  state.tunnelBurstDone = false;
  state.tunnelDigTarget = null;
  state.tunnelDigLastAt = 0;
  state.tunnelDigBoostUntil = 0;
}

function bossStatusText(level) {
  if (!level.boss) return "";
  if (level.boss.dead) return `${level.name}: Boss defeated! Reach the flag.`;
  return `${level.name} BOSS: ${level.boss.name} ${level.boss.health}/${level.boss.maxHealth}`;
}

function levelObjectiveBadges(level) {
  if (!level) return [];
  const badges = [`${level.totalBones} bones`];
  if (level.hearts?.length) badges.push("heart pickup");
  if (level.capes?.length) badges.push("super cape");
  if (level.sirens?.length) badges.push("toy vs siren");
  if (level.boss) badges.push(`boss: ${level.boss.name}`);
  return badges;
}

function levelPreviewRows(level) {
  if (!level) return [];
  const pickups = [];
  if (level.hearts?.length) pickups.push("heart pickup");
  if (level.capes?.length) pickups.push("super cape");
  if (level.sirens?.length) pickups.push("toy toss");

  const threats = ["spikes", "corgi patrols"];
  if (level.tunnel) threats.push("dirt walls");
  if (level.sirens?.length) threats.push("siren slowdown");
  if (level.boss) threats.push(level.boss.name);

  const goal = level.boss
    ? `${level.totalBones} bones • defeat ${level.boss.name} • finish flag`
    : `${level.totalBones} bones + finish flag`;

  const rows = [
    { label: "Goal", value: goal },
    { label: "Pickups", value: pickups.length ? pickups.join(" • ") : "no special pickup this round" },
    { label: "Watch for", value: threats.join(" • ") },
  ];

  if (level.tunnel) {
    rows.push({ label: "Dig", value: "hold ↓ to dig • add BARK to chew faster" });
  }

  return rows;
}

function roundedRectPath(x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function drawInfoChip(x, y, text, options = {}) {
  const paddingX = options.paddingX ?? 12;
  ctx.save();
  ctx.font = options.font ?? "16px 'Roboto', system-ui";
  const width = ctx.measureText(text).width + paddingX * 2;
  const height = options.height ?? 32;
  const radius = options.radius ?? 14;
  const bg = options.bg ?? "rgba(9, 22, 44, 0.82)";
  const border = options.border ?? "rgba(159, 229, 255, 0.45)";
  const color = options.color ?? "#f8fdff";

  ctx.fillStyle = bg;
  ctx.strokeStyle = border;
  ctx.lineWidth = 1.5;
  roundedRectPath(x, y, width, height, radius);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = color;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(text, x + paddingX, y + height / 2 + 1);
  ctx.restore();
  return width;
}

function drawCenteredChipRow(y, items, options = {}) {
  if (!items?.length) return;
  ctx.save();
  ctx.font = options.font ?? "15px 'Roboto', system-ui";
  const gap = options.gap ?? 10;
  const paddingX = options.paddingX ?? 12;
  const widths = items.map((item) => ctx.measureText(item).width + paddingX * 2);
  const totalWidth = widths.reduce((sum, width) => sum + width, 0) + gap * Math.max(0, items.length - 1);
  let chipX = canvas.width / 2 - totalWidth / 2;
  ctx.restore();

  items.forEach((item, index) => {
    chipX += drawInfoChip(chipX, y, item, options);
    if (index < items.length - 1) chipX += gap;
  });
}

function drawStartPromptCard(y, text, hint = "") {
  const pulse = (Math.sin(Date.now() / 280) + 1) / 2;
  ctx.save();
  ctx.font = "bold 20px 'Roboto', system-ui";
  const paddingX = 22;
  const hintPaddingX = 18;
  const primaryWidth = ctx.measureText(text).width + paddingX * 2;
  ctx.font = "13px 'Roboto', system-ui";
  const hintWidth = hint ? ctx.measureText(hint).width + hintPaddingX * 2 : 0;
  const width = Math.max(primaryWidth, hintWidth);
  const height = hint ? 62 : 44;
  const x = canvas.width / 2 - width / 2;

  ctx.shadowColor = `rgba(120, 225, 255, ${0.18 + pulse * 0.24})`;
  ctx.shadowBlur = 16 + pulse * 10;
  ctx.fillStyle = "rgba(9, 22, 44, 0.9)";
  ctx.strokeStyle = `rgba(159, 229, 255, ${0.45 + pulse * 0.35})`;
  ctx.lineWidth = 2;
  roundedRectPath(x, y, width, height, 18);
  ctx.fill();
  ctx.stroke();

  ctx.shadowBlur = 0;
  ctx.fillStyle = "#eafcff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "bold 20px 'Roboto', system-ui";
  ctx.fillText(text, canvas.width / 2, y + (hint ? 21 : height / 2) + 1);
  if (hint) {
    ctx.fillStyle = "rgba(224, 245, 255, 0.86)";
    ctx.font = "13px 'Roboto', system-ui";
    ctx.fillText(hint, canvas.width / 2, y + 46);
  }
  ctx.restore();
}

function drawLevelPreviewCard(x, y, level) {
  const rows = levelPreviewRows(level);
  if (!rows.length) return;

  const width = 540;
  const rowGap = 28;
  const height = Math.max(150, 92 + rows.length * rowGap);

  ctx.save();
  ctx.fillStyle = "rgba(8, 16, 32, 0.9)";
  ctx.strokeStyle = "rgba(121, 225, 255, 0.34)";
  ctx.lineWidth = 2;
  roundedRectPath(x, y, width, height, 20);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
  roundedRectPath(x + 14, y + 14, width - 28, height - 28, 16);
  ctx.fill();

  ctx.fillStyle = "#ecfbff";
  ctx.font = "bold 17px 'Roboto', system-ui";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText("Level preview", x + 20, y + 22);

  rows.forEach((row, index) => {
    const rowY = y + 52 + index * rowGap;
    ctx.fillStyle = "#79e1ff";
    ctx.font = "bold 14px 'Roboto', system-ui";
    ctx.fillText(`${row.label}:`, x + 20, rowY);

    ctx.fillStyle = "#f6fbff";
    ctx.font = "14px 'Roboto', system-ui";
    ctx.fillText(row.value, x + 116, rowY);
  });

  ctx.fillStyle = "rgba(210, 240, 255, 0.82)";
  ctx.font = "13px 'Roboto', system-ui";
  ctx.fillText("Each level still restocks 3 continues before you jump in.", x + 20, y + 52 + rows.length * rowGap + 7);

  const pulse = (Math.sin(Date.now() / 280) + 1) / 2;
  const promptY = y + height - 34;
  const promptX = x + 20;
  const promptW = width - 40;
  const promptH = 28;
  ctx.shadowColor = `rgba(120, 225, 255, ${0.14 + pulse * 0.18})`;
  ctx.shadowBlur = 12 + pulse * 6;
  ctx.fillStyle = "rgba(10, 26, 50, 0.95)";
  ctx.strokeStyle = `rgba(159, 229, 255, ${0.32 + pulse * 0.24})`;
  ctx.lineWidth = 1.5;
  roundedRectPath(promptX, promptY, promptW, promptH, 12);
  ctx.fill();
  ctx.stroke();
  ctx.shadowBlur = 0;

  ctx.fillStyle = "#eafcff";
  ctx.font = "bold 13px 'Roboto', system-ui";
  ctx.textAlign = "center";
  ctx.fillText("▶ Press Enter / Space / W / ↑ or tap ▲ to start this level", x + width / 2, promptY + promptH / 2 + 1);
  ctx.restore();
}

function loadLevel(index, options = {}) {
  const { resetLives = false, preserveRespawns = false } = options;

  if (mobileControlState.enabled) {
    resetMobileTrackedTouches();
    clearMobileDirectionalInput();
    clearMobileJumpReleaseTimeout();
    clearMobileCenterTapTimeout();
    mobileControlState.lastCenterTapAt = 0;
    handleJumpRelease();
  }
  state.currentLevelIndex = index;
  state.mode = "title";
  state.levelTitleUntil = Date.now() + LEVEL_TITLE_MS;
  state.cameraX = 0;

  if (!preserveRespawns) state.levelRespawnsLeft = LEVEL_RESPAWNS;

  stopCapeSound();
  stopCapeAmbient();

  levelRuntime = hydrateLevelRuntime(LEVELS[index]);
  state.totalBones = levelRuntime.totalBones;
  state.bonesCollected = 0;
  state.combat.barkWaves = [];
  state.combat.barkCooldownUntil = 0;
  state.invulnerableUntil = 0;
  state.hitControlLockUntil = 0;
  state.capeUntil = 0;
  state.bossProjectiles = [];
  state.airJumpsUsed = 0;
  state.lastJumpTapAt = 0;
  state.lastAirJumpConsumedAt = 0;
  state.jumpPressedThisFrame = false;
  state.jumpBufferedUntil = 0;
  state.lastGroundedAt = 0;
  state.sirenSlowUntil = 0;
  state.toyHeld = false;
  state.toyProjectile = null;
  state.sneezeUntil = 0;
  state.sneezeNextAt = Date.now() + 5000;
  state.backflipUntil = 0;
  state.backflipNextAt = Date.now() + 6000;
  state.danceUntil = 0;
  state.danceNextAt = Date.now() + 6000;
  state.pauseOptionIndex = 0;
  stopCapeSound();
  stopTornadoSound();

  if (resetLives) state.lives = MAX_LIVES;
  renderLives();

  resetPlayerPosition();
  const bossHint = levelRuntime.boss ? " Boss first." : "";
  setBgTrack(levelMusicProfile(levelRuntime).src);

  statusEl.textContent = `${levelRuntime.name}: ${state.totalBones} bones.${bossHint}`;
}

function startGame() {
  resetGame();
}

function beginLevelPlay() {
  if (state.mode !== "title") return;
  if (mobileControlState.enabled) {
    resetMobileTrackedTouches();
    clearMobileDirectionalInput();
    clearMobileJumpReleaseTimeout();
    clearMobileCenterTapTimeout();
    mobileControlState.lastCenterTapAt = 0;
    handleJumpRelease();
  }
  state.mode = "playing";
  const bossHint = levelRuntime.boss ? ` • BOSS LEVEL: ${levelRuntime.boss.name}` : "";
  statusEl.textContent = `${levelRuntime.name}: Collect ${state.totalBones} bones and reach the flag!${bossHint}`;
}

function resetGame() {
  loadLevel(0, { resetLives: true });
}

function startLevelCelebration() {
  state.mode = "celebrating";
  state.celebrateUntil = Date.now() + LEVEL_CELEBRATE_MS;
  state.pendingNextLevel = state.currentLevelIndex + 1;
  state.celebrationBurstAt = Date.now();
  state.keys.left = false;
  state.keys.right = false;
  state.keys.jump = false;
  state.keys.down = false;
  state.dog.vx = 0;
  state.dog.vy = 0;
  state.bossProjectiles = [];
  stopCapeSound();
  stopCapeAmbient();
  stopTornadoSound();
  playLevelClearSound();
  statusEl.textContent = `${levelRuntime.name} clear! Good dog celebration!`;
}

function updateBoss(level, dog) {
  const boss = level.boss;
  if (!boss || boss.dead) return;

  if (boss.dying) {
    boss.vy += ENEMY_DEATH_GRAVITY;
    boss.y += boss.vy;
    if (boss.y > canvas.height + 100) boss.dead = true;
    return;
  }

  if (!boss.phase2 && boss.health <= boss.maxHealth * BOSS_PHASE2_HEALTH_FACTOR) {
    boss.phase2 = true;
    statusEl.textContent = `${level.name}: ${boss.name} is enraged! Phase 2!`;
  }

  const now = Date.now();

  if (now < boss.dashUntil) {
    boss.x += boss.dashVx;
  } else {
    boss.x += boss.speed * (boss.phase2 ? 1.35 : 1) * boss.dir;
  }

  if (boss.x < boss.minX) {
    boss.x = boss.minX;
    boss.dir = 1;
  }
  if (boss.x + boss.w > boss.maxX) {
    boss.x = boss.maxX - boss.w;
    boss.dir = -1;
  }

  if (intersects(dog, boss)) {
    const previousDogBottom = dog.y + dog.h - dog.vy;
    const stompedFromAbove =
      dog.vy >= STOMP_DESCENT_MIN && previousDogBottom <= boss.y + STOMP_TOP_MARGIN && dog.y + dog.h <= boss.y + boss.h;

    if (stompedFromAbove) {
      dog.y = boss.y - dog.h;
      dog.vy = STOMP_BOUNCE_VELOCITY;
      dog.onGround = false;
      boss.health -= 1;
      playKillSound();
      statusEl.textContent = `${level.name}: ${boss.name} HP ${Math.max(0, boss.health)}/${boss.maxHealth}`;
      if (boss.health <= 0) {
        boss.dying = true;
        boss.vy = -2.4;
        statusEl.textContent = `${level.name}: ${boss.name} defeated! Reach the flag!`;
      }
    } else {
      takeHit(now < boss.dashUntil ? `${boss.name} dash-slammed you!` : `${boss.name} rammed you!`);
    }
  }

  if (boss.health <= 0) return;

  const cooldown = boss.phase2 ? BOSS_ATTACK_COOLDOWN_MS * 0.7 : BOSS_ATTACK_COOLDOWN_MS;
  const telegraphing = now < boss.telegraphUntil;

  if (!telegraphing && now >= boss.telegraphUntil && boss.telegraphType) {
    if (boss.telegraphType === "dash") {
      const targetDir = dog.x + dog.w / 2 >= boss.x + boss.w / 2 ? 1 : -1;
      boss.dir = targetDir;
      boss.dashVx = targetDir * BOSS_DASH_SPEED;
      boss.dashUntil = now + BOSS_DASH_DURATION_MS;
    } else {
      const dx = dog.x + dog.w / 2 - (boss.x + boss.w / 2);
      const dy = dog.y + dog.h / 2 - (boss.y + boss.h / 2);
      const len = Math.max(1, Math.hypot(dx, dy));
      const baseSpeed = boss.phase2 ? BOSS_PROJECTILE_SPEED * 1.15 : BOSS_PROJECTILE_SPEED;
      const spawnProjectile = (spreadY = 0) => {
        state.bossProjectiles.push({
          x: boss.x + boss.w / 2,
          y: boss.y + 10,
          w: 20,
          h: 14,
          vx: (dx / len) * baseSpeed,
          vy: (dy / len) * baseSpeed * 0.65 + spreadY,
          bornAt: now,
        });
      };

      spawnProjectile(0);
      if (boss.phase2) {
        spawnProjectile(-1.15);
        spawnProjectile(1.15);
      }
    }

    boss.telegraphType = null;
  }

  if (!boss.telegraphType && now - boss.lastAttackAt > cooldown) {
    boss.lastAttackAt = now;
    const chooseDash = boss.phase2 && Math.random() < 0.48;
    boss.telegraphType = chooseDash ? "dash" : "projectile";
    boss.telegraphUntil = now + (chooseDash ? BOSS_DASH_TELEGRAPH_MS : BOSS_TELEGRAPH_MS);
  }
}

function updateSirens(level) {
  const now = Date.now();
  const camStart = state.cameraX;
  const camEnd = state.cameraX + canvas.width;
  let activeSlowUntil = 0;
  let anySirenSounding = false;

  for (const s of level.sirens || []) {
    if (s.disabled) continue;

    const onScreen = s.x + s.w > camStart && s.x < camEnd;
    if (!onScreen) {
      s.countdownStart = null;
      s.soundingUntil = 0;
      continue;
    }

    if (s.countdownStart === null && s.soundingUntil <= now) {
      s.countdownStart = now;
      statusEl.textContent = "Noon Siren! Throw the toy to defeat the paralyzing howl-inducing machine!";
      state.sirenOverlayUntil = now + 3000;
    }

    if (s.countdownStart && s.soundingUntil <= now && now - s.countdownStart >= SIREN_COUNTDOWN_MS) {
      s.soundingUntil = now + SIREN_SOUND_MS;
      playTornadoSound();
      statusEl.textContent = "Noon Siren! Throw the toy to defeat the paralyzing howl-inducing machine!";
      state.sirenOverlayUntil = now + 3000;
    }

    if (s.soundingUntil > now) {
      activeSlowUntil = Math.max(activeSlowUntil, s.soundingUntil);
      anySirenSounding = true;
    }
  }

  if (activeSlowUntil > state.sirenSlowUntil) state.sirenSlowUntil = activeSlowUntil;
  if (!anySirenSounding) {
    state.sirenSlowUntil = 0;
    stopTornadoSound();
  }
}

function updateToyProjectile(level) {
  if (!state.toyProjectile) return;
  const p = state.toyProjectile;
  p.x += p.vx;

  for (const s of level.sirens || []) {
    if (s.disabled) continue;
    if (intersects(p, s)) {
      s.disabled = true;
      s.soundingUntil = 0;
      s.countdownStart = null;
      state.sirenSlowUntil = 0;
      state.toyProjectile = null;
      stopTornadoSound();
      statusEl.textContent = `${level.name}: Siren disabled!`;
      return;
    }
  }

  if (p.x < state.cameraX - 200 || p.x > level.worldWidth + 200) {
    state.toyProjectile = null;
  }
}

function updateLightSwitches(level) {
  if (!level.dark || !level.lightSwitches?.length) return;

  const now = Date.now();
  if (level.darkRevealUntil && now >= level.darkRevealUntil) {
    level.darkRevealUntil = 0;
    for (const light of level.lightSwitches) {
      light.on = false;
      light.litUntil = 0;
    }
  }

  for (const light of level.lightSwitches) {
    const touching = intersects(state.dog, light);
    if (!touching && !light.on && level.darkRevealUntil <= now) {
      light.rearmLocked = false;
    }
    if (touching && !light.rearmLocked) {
      light.on = true;
      light.litUntil = now + DARK_SWITCH_REVEAL_MS;
      light.rearmLocked = true;
      level.darkRevealUntil = now + DARK_SWITCH_REVEAL_MS;
      statusEl.textContent = `${level.name}: Lights on for 5 seconds!`;
    }
    light.wasTouching = touching;
  }
}

function update() {
  const jumpPressedNow = state.jumpPressedThisFrame;
  state.jumpPressedThisFrame = false;
  const now = Date.now();

  if (state.levelSelectOpen) return;

  if (state.mode === "start") return;

  if (state.mode === "paused") return;

  if (state.mode === "dead" || state.mode === "gameover") return;

  if (state.mode === "playing" && Date.now() < state.freezeUntil) return;

  if (state.mode === "title") {
    if (Date.now() >= state.levelTitleUntil) {
      beginLevelPlay();
    }
    return;
  }

  if (state.mode === "celebrating") {
    if (Date.now() - state.celebrationBurstAt > 340) {
      spawnBarkWave("up");
      playBarkSound(false);
      state.celebrationBurstAt = Date.now();
    }

    state.combat.barkWaves = state.combat.barkWaves.filter((wave) => {
      if (wave.mode === "up") wave.y -= 6;
      else wave.x += BARK_WAVE_SPEED * wave.dir;
      return Date.now() - wave.bornAt < BARK_WAVE_LIFETIME_MS;
    });

    if (Date.now() >= state.celebrateUntil) {
      if (state.pendingNextLevel < LEVELS.length) loadLevel(state.pendingNextLevel);
      else {
        state.mode = "won";
        statusEl.textContent = "All levels complete! Dachshund Dash champion. Press R or tap ▲ to play again.";
      }
    }
    return;
  }

  if (state.mode !== "playing") return;

  const dog = state.dog;
  const level = levelRuntime;

  if (dog.onGround) state.lastGroundedAt = now;

  updateSirens(level);
  updateToyProjectile(level);
  updateLightSwitches(level);

  if (level.tunnel && level.tunnelEntrance && !state.tunnelBurstDone) {
    const entry = level.tunnelEntrance;
    const dogCenterX = dog.x + dog.w / 2;
    if (dogCenterX >= entry.x && dogCenterX <= entry.x + entry.w && dog.y + dog.h >= (entry.burstY ?? entry.y)) {
      spawnTunnelDirtBurst(entry);
      state.tunnelBurstDone = true;
      statusEl.textContent = `${level.name}: ↓ digs • ↓ + BARK drills fast`;
    }
  }

  state.dirtBursts = state.dirtBursts.filter((particle) => {
    particle.x += particle.vx;
    particle.y += particle.vy;
    particle.vy += 0.22;
    particle.vx *= 0.98;
    return Date.now() - particle.bornAt < particle.life && particle.y < canvas.height + 40;
  });

  if (Date.now() >= state.hitControlLockUntil) {
    if (level.water) {
      dog.vx *= WATER_DRAG;
      if (Math.abs(dog.vx) < 0.08) dog.vx = 0;
      if (state.keys.left) {
        dog.vx = Math.max(-WATER_MAX_VX, dog.vx - WATER_THRUST);
        dog.facing = -1;
      }
      if (state.keys.right) {
        dog.vx = Math.min(WATER_MAX_VX, dog.vx + WATER_THRUST);
        dog.facing = 1;
      }
    } else {
      dog.vx = 0;
      if (state.keys.left) {
        dog.vx = -MOVE_SPEED;
        dog.facing = -1;
      }
      if (state.keys.right) {
        dog.vx = MOVE_SPEED;
        dog.facing = 1;
      }
    }

    if (Date.now() < state.sirenSlowUntil) {
      dog.vx *= SIREN_SLOW_FACTOR;
      state.barkWagUntil = Math.max(state.barkWagUntil, Date.now() + 400);
    }

    const noMovementInput = !state.keys.left && !state.keys.right && !state.keys.jump && !state.keys.down;
    if (noMovementInput && dog.onGround) {
      if (Date.now() > state.idleNextWagAt) {
        state.idleWagUntil = Date.now() + 1400;
        state.idleNextWagAt = Date.now() + 3400;
      }
      if (Date.now() > state.sneezeNextAt && Date.now() > state.sneezeUntil && Date.now() > state.backflipUntil && Date.now() > state.danceUntil && Date.now() > state.digUntil) {
        state.sneezeUntil = Date.now() + 700;
        state.sneezeNextAt = Date.now() + 5000 + Math.random() * 4000;
        playSneezeSound();
      }
      if (Date.now() > state.backflipNextAt && Date.now() > state.backflipUntil && Date.now() > state.danceUntil && Date.now() > state.digUntil) {
        state.backflipUntil = Date.now() + 900;
        state.backflipNextAt = Date.now() + 7000 + Math.random() * 5000;
      }
      if (Date.now() > state.danceNextAt && Date.now() > state.danceUntil && Date.now() > state.backflipUntil && Date.now() > state.digUntil) {
        state.danceUntil = Date.now() + 1200;
        state.danceNextAt = Date.now() + 8000 + Math.random() * 5000;
      }
      if (Date.now() > state.digNextAt && Date.now() > state.digUntil && Date.now() > state.backflipUntil && Date.now() > state.danceUntil) {
        state.digUntil = Date.now() + 900;
        state.digNextAt = Date.now() + 8000 + Math.random() * 5000;
      }
    } else {
      state.idleWagUntil = 0;
      state.idleNextWagAt = Date.now() + 1200;
      state.sneezeUntil = 0;
      state.sneezeNextAt = Date.now() + 5000;
      state.backflipUntil = 0;
      state.backflipNextAt = Date.now() + 7000;
      state.danceUntil = 0;
      state.danceNextAt = Date.now() + 8000;
      state.digUntil = 0;
      state.digNextAt = Date.now() + 7000;
    }
  }

  const capeActive = Date.now() < state.capeUntil;
  const waterMode = Boolean(level.water && !capeActive);
  const moonGravity = level.moon ? MOON_GRAVITY_FACTOR : 1;
  if (!capeActive && capeAmbientAudio) {
    stopCapeAmbient();
    startBgMusic();
  }

  const hasBufferedJump = now <= state.jumpBufferedUntil;
  const canUseGroundJump = dog.onGround || (now - state.lastGroundedAt) <= COYOTE_TIME_MS;
  if (!waterMode && !capeActive && hasBufferedJump && canUseGroundJump && now >= state.hitControlLockUntil) {
    dog.vy = JUMP_VELOCITY * (level.moon ? MOON_JUMP_VELOCITY_FACTOR : 1);
    dog.onGround = false;
    state.superJumpUsed = false;
    state.airJumpsUsed = 0;
    state.lastAirJumpConsumedAt = state.lastJumpTapAt;
    state.jumpHoldStartedAt = now;
    state.jumpBufferedUntil = 0;
    state.lastGroundedAt = 0;
    state.sneezeUntil = 0;
    state.sneezeNextAt = now + 5000;
    playJumpSound();
  }

  // Mid-air double jump: one extra jump while airborne if you tap jump again.
  const newJumpTap = state.lastJumpTapAt > state.lastAirJumpConsumedAt;
  const nearApex = dog.vy > -2; // wait until upward velocity has nearly ended (close to peak)
  if (!waterMode && !dog.onGround && newJumpTap && state.airJumpsUsed < 1 && nearApex) {
    dog.vy = JUMP_VELOCITY * (level.moon ? MOON_JUMP_VELOCITY_FACTOR : 1);
    state.airJumpsUsed += 1;
    state.lastAirJumpConsumedAt = state.lastJumpTapAt;
    state.superJumpUsed = true; // prevent super-jump float chaining
    state.superJumpFloatUntil = 0;
    playAirJumpSound();
    statusEl.textContent = `${level.name}: Double jump!`;
  }

  // Super jump: keep holding jump to trigger a second, stronger lift while rising.
  if (!waterMode && !capeActive && state.keys.jump && state.jumpHeld && !dog.onGround && !state.superJumpUsed) {
    const heldLongEnough = state.jumpHoldStartedAt && (Date.now() - state.jumpHoldStartedAt) >= SUPER_JUMP_MIN_ASCENT_MS;
    if (heldLongEnough && dog.vy < 0) {
      dog.vy += SUPER_JUMP_BOOST;
      state.superJumpUsed = true;
      state.superJumpFloatUntil = Date.now() + SUPER_JUMP_FLOAT_MS;
      statusEl.textContent = `${level.name}: Super Jump!`;
    }
  }

  updateTunnelDigging(level, now);

  if (capeActive) {
    if (state.keys.jump) dog.vy -= CAPE_LIFT;
    if (state.keys.down) dog.vy += CAPE_DESCEND;
    dog.vy += GRAVITY * 0.35;
    dog.vy = Math.max(CAPE_MAX_RISE, Math.min(7, dog.vy));
  } else if (waterMode) {
    if (state.keys.jump) dog.vy -= WATER_THRUST;
    if (state.keys.down) dog.vy += WATER_THRUST * 0.72;
    dog.vy += WATER_GRAVITY;
    dog.vy *= 0.98;
    dog.vy = Math.max(-WATER_MAX_VY, Math.min(WATER_MAX_VY, dog.vy));
  } else {
    const baseGravity = GRAVITY * moonGravity;
    const grav = Date.now() < state.superJumpFloatUntil ? baseGravity * SUPER_JUMP_FLOAT_GRAVITY_FACTOR : baseGravity;
    dog.vy += grav;
    if (level.moon) dog.vy = Math.min(dog.vy, MOON_MAX_FALL_SPEED);
  }

  dog.x += dog.vx;
  dog.x = Math.max(0, Math.min(level.worldWidth - dog.w, dog.x));

  dog.y += dog.vy;
  dog.onGround = false;

  state.supportingPlatform = null;
  for (const p of level.platforms) {
    if (!isPlatformSolid(p)) continue;
    const wasAbove = dog.y + dog.h - dog.vy <= p.y;
    if (intersects(dog, p) && dog.vy >= 0 && wasAbove) {
      dog.y = p.y - dog.h;
      dog.vy = 0;
      dog.onGround = true;
      state.lastGroundedAt = now;
      state.superJumpUsed = false;
      state.supportingPlatform = p;
    }
  }

  const collapsedCloud = updateCloudPlatforms(level, now, state.supportingPlatform || null);
  if (collapsedCloud) {
    dog.onGround = false;
    state.lastGroundedAt = 0;
    dog.vy = Math.max(dog.vy, 1.8);
    state.supportingPlatform = null;
  }

  resolvePlayerPenetration(level);

  if (dog.onGround) state.airJumpsUsed = 0;

  if (dog.y > canvas.height + 120) takeHit("You fell!");

  for (const b of level.bones) {
    if (!b.taken && intersects(dog, { x: b.x - b.r, y: b.y - b.r, w: b.r * 2, h: b.r * 2 })) {
      b.taken = true;
      state.bonesCollected += 1;
      playBoneSound();
      statusEl.textContent = `${level.name} bones: ${state.bonesCollected}/${state.totalBones}`;
    }
  }

  for (const h of level.hearts || []) {
    if (!h.taken && intersects(dog, h)) {
      h.taken = true;
      playHeartSound();
      if (state.lives < MAX_LIVES) {
        state.lives += 1;
        renderLives();
        statusEl.textContent = `${level.name}: Heart found! ${state.lives}/${MAX_LIVES}`;
      }
    }
  }

  for (const t of level.toys || []) {
    if (!t.taken && intersects(dog, t)) {
      t.taken = true;
      state.toyHeld = true;
      statusEl.textContent = `${level.name}: Toy collected! Press Shift/F/K to throw at the siren.`;
    }
  }

  for (const c of level.capes || []) {
    if (!c.taken && intersects(dog, c)) {
      c.taken = true;
      state.capeUntil = Date.now() + CAPE_FLIGHT_MS;
      playCapeSound();
      playCapeAmbient();
      statusEl.textContent = `${level.name}: Super Cape active for 20s! Use arrow keys to fly.`;
    }
  }

  state.combat.barkWaves = state.combat.barkWaves.filter((wave) => {
    if (wave.mode === "up") {
      wave.y -= 6;
    } else if (wave.mode === "short") {
      wave.x += 8 * wave.dir;
      for (const e of level.enemies) {
        if (!isEnemyAlive(e)) continue;
        if (intersects(wave, e)) {
          e.barkHits = (e.barkHits || 0) + 1;
          if (e.barkHits >= 2) defeatEnemy(e, wave.dir * 0.8);
        }
      }
    } else {
      wave.x += BARK_WAVE_SPEED * wave.dir;
      for (const e of level.enemies) {
        if (isEnemyAlive(e) && intersects(wave, e)) defeatEnemy(e, wave.dir * 1.2);
      }
      if (level.boss && !level.boss.dead && !level.boss.dying && intersects(wave, level.boss)) {
        level.boss.health -= 1;
        statusEl.textContent = `${level.name}: ${level.boss.name} hit by bark! ${Math.max(0, level.boss.health)}/${level.boss.maxHealth}`;
        if (level.boss.health <= 0) {
          level.boss.dying = true;
          level.boss.vy = -2.6;
          statusEl.textContent = `${level.name}: ${level.boss.name} defeated! Reach the flag!`;
        }
      }
    }
    return Date.now() - wave.bornAt < BARK_WAVE_LIFETIME_MS;
  });

  for (const e of level.enemies) {
    if (e.dead) continue;

    if (e.dying) {
      e.vy += ENEMY_DEATH_GRAVITY;
      e.y += e.vy;
      e.x += e.vx;
      if (e.y > canvas.height + 100) e.dead = true;
      continue;
    }

    e.x += e.speed * e.dir;
    if (e.x < e.minX || e.x + e.w > e.maxX) e.dir *= -1;

    if (intersects(dog, e)) {
      const previousDogBottom = dog.y + dog.h - dog.vy;
      const stompedFromAbove =
        dog.vy >= STOMP_DESCENT_MIN && previousDogBottom <= e.y + STOMP_TOP_MARGIN && dog.y + dog.h <= e.y + e.h;

      if (stompedFromAbove) {
        dog.y = e.y - dog.h;
        dog.vy = STOMP_BOUNCE_VELOCITY;
        dog.onGround = false;
        defeatEnemy(e, dog.vx * 0.15);
        playKillSound();
        statusEl.textContent = `${level.name}: Stomp!`;
      } else {
        takeHit("You bumped an enemy!");
      }
    }
  }

  updateBoss(level, dog);

  state.bossProjectiles = state.bossProjectiles.filter((p) => {
    p.x += p.vx;
    p.y += p.vy;
    if (intersects(dog, p)) {
      takeHit("Corgi bark blast!");
      return false;
    }
    const age = Date.now() - p.bornAt;
    const out = p.x < state.cameraX - 120 || p.x > level.worldWidth + 80 || p.y > canvas.height + 120 || p.y < -120;
    return age < 5000 && !out;
  });

  for (const s of level.spikes) {
    if (intersects(dog, s)) takeHit("Ouch, spikes!");
  }
  for (const pool of level.lavaPools || []) {
    if (intersects(dog, pool)) takeHit("Too hot! Lava!");
  }

  const flagTouch = intersects(dog, level.finishFlag);
  const bossDone = !level.boss || level.boss.dead;
  if (flagTouch && state.bonesCollected === state.totalBones && bossDone) {
    startLevelCelebration();
  } else if (flagTouch) {
    if (state.bonesCollected < state.totalBones) {
      statusEl.textContent = `${level.name}: Need all bones first (${state.bonesCollected}/${state.totalBones})`;
    } else if (!bossDone) {
      statusEl.textContent = bossStatusText(level);
    }
  }

  const targetCam = dog.x - canvas.width * 0.35;
  state.cameraX = Math.max(0, Math.min(level.worldWidth - canvas.width, targetCam));
}

function drawParallax() {
  const cam = state.cameraX;
  const level = levelRuntime;

  if (level.water) {
    const g = ctx.createLinearGradient(0, 0, 0, canvas.height);
    g.addColorStop(0, "#08365f");
    g.addColorStop(0.55, "#0b5f8a");
    g.addColorStop(1, "#0d7f96");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "rgba(255,255,255,0.07)";
    for (let i = 0; i < 6; i++) {
      const x = ((i * 180 - cam * 0.12) % (canvas.width + 260)) - 80;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + 90, canvas.height);
      ctx.lineTo(x + 180, canvas.height);
      ctx.lineTo(x + 50, 0);
      ctx.closePath();
      ctx.fill();
    }

    ctx.fillStyle = "rgba(190, 238, 255, 0.45)";
    for (let i = 0; i < 22; i++) {
      const x = ((i * 120 - cam * 0.45 + Date.now() * 0.02) % (canvas.width + 120)) - 40;
      const y = (i * 33 + Date.now() * 0.03) % canvas.height;
      ctx.beginPath();
      ctx.arc(x, canvas.height - y, 5 + (i % 3), 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = "rgba(9, 74, 70, 0.72)";
    for (let i = 0; i < 16; i++) {
      const x = i * 150 - cam * 0.5;
      ctx.fillRect(x + 30, 430, 8, 110);
      ctx.beginPath();
      ctx.ellipse(x + 34, 430, 24, 80, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    return;
  }

  if (level.moon) {
    const g = ctx.createLinearGradient(0, 0, 0, canvas.height);
    g.addColorStop(0, "#060814");
    g.addColorStop(0.65, "#15193d");
    g.addColorStop(1, "#2a2753");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "rgba(255,255,255,0.9)";
    for (let i = 0; i < 44; i++) {
      const x = (i * 97 - cam * 0.08) % (canvas.width + 60);
      const y = 30 + (i * 37) % 230;
      ctx.fillRect(x, y, i % 3 === 0 ? 3 : 2, i % 3 === 0 ? 3 : 2);
    }

    const earthX = canvas.width - 170;
    const earthY = 92;
    ctx.fillStyle = "rgba(87, 147, 255, 0.96)";
    ctx.beginPath();
    ctx.arc(earthX, earthY, 54, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(205, 245, 255, 0.18)";
    ctx.beginPath();
    ctx.arc(earthX - 16, earthY - 18, 50, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(92, 196, 122, 0.88)";
    ctx.beginPath();
    ctx.ellipse(earthX - 12, earthY - 8, 18, 12, -0.35, 0, Math.PI * 2);
    ctx.ellipse(earthX + 16, earthY + 10, 15, 10, 0.45, 0, Math.PI * 2);
    ctx.ellipse(earthX + 4, earthY - 26, 10, 7, 0.1, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#6f748c";
    for (let i = 0; i < 11; i++) {
      const x = i * 260 - cam * 0.3;
      ctx.beginPath();
      ctx.arc(x + 120, 500, 180, Math.PI, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = "#8c90a8";
    for (let i = 0; i < 14; i++) {
      const x = i * 190 - cam * 0.45;
      ctx.beginPath();
      ctx.arc(x + 70, 520, 95, Math.PI, Math.PI * 2);
      ctx.fill();
    }
    return;
  }

  if (level.cloud) {
    const g = ctx.createLinearGradient(0, 0, 0, canvas.height);
    g.addColorStop(0, "#8fd7ff");
    g.addColorStop(0.52, "#cceeff");
    g.addColorStop(1, "#f4fbff");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "rgba(255, 235, 165, 0.95)";
    ctx.beginPath();
    ctx.arc(canvas.width - 130, 92, 46, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(255, 249, 224, 0.32)";
    ctx.beginPath();
    ctx.arc(canvas.width - 146, 76, 34, 0, Math.PI * 2);
    ctx.fill();

    for (let band = 0; band < 3; band++) {
      const parallax = 0.12 + band * 0.14;
      const baseY = 84 + band * 96;
      const alpha = 0.46 - band * 0.09;
      ctx.fillStyle = `rgba(255,255,255,${alpha})`;
      for (let i = 0; i < 7; i++) {
        const cx = ((i * 230 - cam * parallax) % (canvas.width + 320)) - 120;
        const cy = baseY + (i % 2) * 22;
        ctx.beginPath();
        ctx.ellipse(cx, cy, 64, 26, 0, 0, Math.PI * 2);
        ctx.ellipse(cx + 46, cy - 10, 44, 22, 0, 0, Math.PI * 2);
        ctx.ellipse(cx - 42, cy - 6, 40, 20, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.fillStyle = "rgba(186, 220, 245, 0.5)";
    for (let i = 0; i < 10; i++) {
      const x = i * 220 - cam * 0.28;
      ctx.beginPath();
      ctx.ellipse(x + 110, 520, 140, 52, 0, Math.PI, Math.PI * 2);
      ctx.fill();
    }
    return;
  }

  if (level.tunnel) {
    const g = ctx.createLinearGradient(0, 0, 0, canvas.height);
    g.addColorStop(0, "#5b3b1c");
    g.addColorStop(0.34, "#7a5228");
    g.addColorStop(0.341, "#3a2614");
    g.addColorStop(1, "#1a120c");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "rgba(255, 214, 149, 0.08)";
    for (let i = 0; i < 12; i++) {
      const x = ((i * 160 - cam * 0.18) % (canvas.width + 180)) - 60;
      ctx.beginPath();
      ctx.arc(x, 125 + (i % 3) * 42, 20 + (i % 2) * 7, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = "rgba(59, 37, 20, 0.7)";
    for (let i = 0; i < 16; i++) {
      const x = i * 220 - cam * 0.28;
      ctx.beginPath();
      ctx.arc(x + 90, 520, 145, Math.PI, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = "rgba(210, 170, 100, 0.14)";
    for (let i = 0; i < 15; i++) {
      const x = ((i * 200 - cam * 0.42 + Date.now() * 0.012) % (canvas.width + 220)) - 80;
      const y = 210 + (i % 4) * 58;
      ctx.beginPath();
      ctx.ellipse(x, y, 46, 14, ((i % 3) - 1) * 0.18, 0, Math.PI * 2);
      ctx.fill();
    }

    if (level.tunnelEntrance) {
      const shaft = level.tunnelEntrance;
      const shaftX = shaft.x - cam;
      const shaftCenterX = shaftX + shaft.w / 2;
      const pulse = 0.72 + Math.sin(Date.now() * 0.01) * 0.12;

      ctx.fillStyle = "rgba(0, 0, 0, 0.24)";
      ctx.fillRect(shaftX + 8, 432, shaft.w - 16, 108);

      ctx.strokeStyle = "rgba(255, 214, 140, 0.42)";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(shaftX + 10, 432);
      ctx.lineTo(shaftX + shaft.w - 10, 432);
      ctx.stroke();

      for (const sideX of [shaftX + 18, shaftX + shaft.w - 18]) {
        ctx.fillStyle = `rgba(255, 206, 112, ${0.22 * pulse})`;
        ctx.beginPath();
        ctx.arc(sideX, 404, 26, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#f6c56d";
        ctx.fillRect(sideX - 4, 390, 8, 18);
        ctx.fillStyle = "#6a4020";
        ctx.fillRect(sideX - 6, 386, 12, 6);
      }

      ctx.fillStyle = `rgba(255, 226, 150, ${0.7 * pulse})`;
      for (let i = 0; i < 3; i++) {
        const y = 348 + i * 24;
        ctx.beginPath();
        ctx.moveTo(shaftCenterX, y + 14);
        ctx.lineTo(shaftCenterX - 16, y - 6);
        ctx.lineTo(shaftCenterX + 16, y - 6);
        ctx.closePath();
        ctx.fill();
      }
    }
    return;
  }

  if (level.volcano) {
    const g = ctx.createLinearGradient(0, 0, 0, canvas.height);
    g.addColorStop(0, "#1f0603");
    g.addColorStop(0.45, "#4a1209");
    g.addColorStop(1, "#180909");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "rgba(255, 160, 74, 0.18)";
    for (let i = 0; i < 10; i++) {
      const x = i * 210 - cam * 0.25;
      ctx.beginPath();
      ctx.arc(x + 100, 120 + (i % 2) * 36, 28, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = "#33120e";
    for (let i = 0; i < 12; i++) {
      const x = i * 220 - cam * 0.35;
      ctx.beginPath();
      ctx.moveTo(x, 540);
      ctx.lineTo(x + 90, 320 + (i % 3) * 30);
      ctx.lineTo(x + 180, 540);
      ctx.closePath();
      ctx.fill();
    }

    ctx.fillStyle = "rgba(255, 124, 44, 0.28)";
    for (let i = 0; i < 18; i++) {
      const x = ((i * 140 - cam * 0.5 + Date.now() * 0.03) % (canvas.width + 80)) - 20;
      const y = 430 + (i % 4) * 24;
      ctx.beginPath();
      ctx.arc(x, y, 3 + (i % 3), 0, Math.PI * 2);
      ctx.fill();
    }
    return;
  }

  if (level.dark) {
    const g = ctx.createLinearGradient(0, 0, 0, canvas.height);
    g.addColorStop(0, "#02030a");
    g.addColorStop(0.7, "#081222");
    g.addColorStop(1, "#101d32");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "rgba(255, 240, 164, 0.08)";
    for (let i = 0; i < 9; i++) {
      const x = i * 260 - cam * 0.2;
      ctx.beginPath();
      ctx.arc(x + 120, 120 + (i % 2) * 36, 24, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = "#0c1627";
    for (let i = 0; i < 12; i++) {
      const x = i * 240 - cam * 0.4;
      ctx.beginPath();
      ctx.arc(x + 90, 500, 155, Math.PI, Math.PI * 2);
      ctx.fill();
    }
    return;
  }

  if (level.giantEnemies) {
    const g = ctx.createLinearGradient(0, 0, 0, canvas.height);
    g.addColorStop(0, "#ffcb86");
    g.addColorStop(0.52, "#ff965b");
    g.addColorStop(1, "#5c2d47");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  } else {
    const g = ctx.createLinearGradient(0, 0, 0, canvas.height);
    g.addColorStop(0, "#7fd0ff");
    g.addColorStop(1, "#d4f2ff");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "rgba(255,255,255,0.7)";
    for (let i = 0; i < 8; i++) {
      const cx = ((i * 260 - cam * 0.2) % (canvas.width + 320)) - 120;
      const cy = 60 + (i % 3) * 50;
      ctx.beginPath();
      ctx.ellipse(cx, cy, 56, 24, 0, 0, Math.PI * 2);
      ctx.ellipse(cx + 42, cy - 8, 40, 20, 0, 0, Math.PI * 2);
      ctx.ellipse(cx - 40, cy - 5, 34, 18, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.fillStyle = level.giantEnemies ? "#b47065" : "#9dd59f";
  for (let i = 0; i < 12; i++) {
    const x = i * 320 - cam * 0.35;
    ctx.beginPath();
    ctx.arc(x + 100, 440, 170, Math.PI, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = level.giantEnemies ? "#7f4d52" : "#6db77d";
  for (let i = 0; i < 12; i++) {
    const x = i * 300 - cam * 0.55;
    ctx.beginPath();
    ctx.arc(x + 80, 470, 135, Math.PI, Math.PI * 2);
    ctx.fill();
  }
}

function roundedRect(x, y, w, h, r) {
  const radius = Math.max(0, Math.min(r, w / 2, h / 2));
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function drawPlatform(p) {
  const radius = Math.min(12, Math.min(p.w, p.h) / 2);
  const level = levelRuntime;
  const now = Date.now();
  let top = "#7f5640";
  let bottom = "#4e3529";
  let highlight = "rgba(255,255,255,0.12)";

  if (level.tunnel) {
    top = "#8e6336";
    bottom = "#4f331b";
    highlight = "rgba(255, 228, 173, 0.12)";
  }

  if (p.diggable && !p.dugOut) {
    const progress = Math.max(0, Math.min(1, p.digProgress || 0));
    top = progress > 0 ? "#b27f46" : "#a7743c";
    bottom = progress > 0 ? "#644026" : "#5a381f";
    highlight = progress > 0 ? "rgba(255, 229, 171, 0.28)" : "rgba(255, 218, 150, 0.16)";
  }

  if (level.cloud) {
    const unstable = Boolean(p.cloudVanish);
    const active = isPlatformSolid(p);
    const collapseProgress = unstable && p.occupiedSince ? Math.min(1, (now - p.occupiedSince) / CLOUD_PLATFORM_HOLD_MS) : 0;
    const respawnProgress = unstable && !active && p.respawnAt ? 1 - Math.max(0, p.respawnAt - now) / CLOUD_PLATFORM_RESPAWN_MS : 1;
    const alpha = active ? 0.98 - collapseProgress * (unstable ? 0.35 : 0) : 0.18 + respawnProgress * 0.26;
    const puffCount = p.cloudPuffs || Math.max(4, Math.round(p.w / 42));
    const fill = unstable ? "#efe7ff" : "#ffffff";
    const shade = unstable ? "rgba(201, 188, 255, 0.78)" : "rgba(199, 227, 255, 0.82)";
    const rim = unstable ? "rgba(144, 126, 214, 0.34)" : "rgba(158, 204, 255, 0.3)";
    const puffWidth = p.w / puffCount;
    const warningProgress = unstable ? Math.max(0, (collapseProgress - 0.32) / 0.68) : 0;
    const sway = warningProgress > 0 ? Math.sin(now * 0.03 + p.x * 0.02) * 4.5 * warningProgress : 0;
    const sag = warningProgress > 0 ? 10 * warningProgress : 0;
    const squishY = 1 - warningProgress * 0.15;
    const squishX = 1 + warningProgress * 0.04;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(sway, sag);
    if (unstable && warningProgress > 0) {
      ctx.scale(squishX, squishY);
      ctx.translate((-p.x - p.w / 2) * (squishX - 1), (-p.y - p.h / 2) * (squishY - 1));
    }

    ctx.fillStyle = unstable && warningProgress > 0 ? "rgba(178, 160, 226, 0.24)" : "rgba(154, 190, 225, 0.22)";
    ctx.beginPath();
    ctx.ellipse(p.x + p.w / 2, p.y + p.h - 2, p.w * 0.44, Math.max(8, p.h * 0.35), 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = fill;
    for (let i = 0; i < puffCount; i++) {
      const cx = p.x + puffWidth * i + puffWidth * 0.5;
      const rx = puffWidth * 0.68;
      const ry = p.h * (0.65 + (i % 2) * 0.08);
      const cy = p.y + p.h * 0.54 - (i % 2) * 2;
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = shade;
    ctx.beginPath();
    ctx.ellipse(p.x + p.w / 2, p.y + p.h * 0.78, p.w * 0.42, Math.max(7, p.h * 0.24), 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = rim;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(p.x + p.w / 2, p.y + p.h * 0.54, p.w * 0.46, Math.max(10, p.h * 0.52), 0, Math.PI * 1.02, Math.PI * 1.98);
    ctx.stroke();

    if (unstable && warningProgress > 0) {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalAlpha = alpha;
      const worldCenterX = p.x + p.w / 2 + sway;
      const worldTopY = p.y + sag;
      ctx.fillStyle = `rgba(255,255,255,${0.3 + warningProgress * 0.18})`;
      for (let i = 0; i < 3; i++) {
        const puffX = worldCenterX + (i - 1) * (18 + i * 3) + Math.sin(now * 0.02 + p.x * 0.01 + i) * 6;
        const puffY = worldTopY - 8 - warningProgress * (10 + i * 6) - ((now * 0.04 + i * 9) % 12);
        ctx.beginPath();
        ctx.arc(puffX, puffY, 6 - i * 1.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
    return;
  }

  if (level.water) {
    top = "#466a74";
    bottom = "#24424a";
    highlight = "rgba(180,240,255,0.16)";
  } else if (level.moon) {
    top = "#8b90aa";
    bottom = "#5a617d";
    highlight = "rgba(255,255,255,0.18)";
  } else if (level.volcano) {
    top = "#6e3c2f";
    bottom = "#3a1e18";
    highlight = "rgba(255,182,120,0.14)";
  } else if (level.dark) {
    top = "#36404f";
    bottom = "#202632";
    highlight = "rgba(255,230,150,0.08)";
  }

  ctx.fillStyle = top;
  roundedRect(p.x, p.y, p.w, p.h, radius);
  ctx.fill();
  ctx.fillStyle = bottom;
  roundedRect(p.x, p.y + p.h - 10, p.w, 12, Math.max(4, radius * 0.6));
  ctx.fill();
  ctx.fillStyle = highlight;
  roundedRect(p.x + 6, p.y + 4, Math.max(0, p.w - 12), Math.max(6, p.h * 0.32), Math.max(3, radius * 0.4));
  ctx.fill();

  if (p.diggable && !p.dugOut) {
    const progress = Math.max(0, Math.min(1, p.digProgress || 0));
    ctx.save();
    ctx.globalAlpha = 0.28 + progress * 0.2;
    ctx.strokeStyle = "rgba(79, 46, 19, 0.75)";
    ctx.lineWidth = 3;
    for (let y = p.y + 18; y < p.y + p.h - 8; y += 28) {
      ctx.beginPath();
      ctx.moveTo(p.x + 8, y);
      ctx.lineTo(p.x + p.w - 10, y + 8);
      ctx.stroke();
    }
    ctx.restore();

    if (progress > 0) {
      ctx.fillStyle = `rgba(255, 231, 175, ${0.2 + progress * 0.2})`;
      const revealH = Math.max(12, p.h * progress);
      roundedRect(p.x + 6, p.y + p.h - revealH - 4, p.w - 12, revealH, Math.max(6, radius - 2));
      ctx.fill();
    }
  }
}

function drawSpike(s) {
  ctx.fillStyle = "#8f9094";
  const spikesCount = Math.floor(s.w / 12);
  for (let i = 0; i < spikesCount; i++) {
    const x = s.x + i * 12;
    const baseR = 2.5;
    ctx.beginPath();
    ctx.moveTo(x + baseR, s.y + s.h);
    ctx.quadraticCurveTo(x, s.y + s.h, x, s.y + s.h - baseR);
    ctx.lineTo(x + 6, s.y + 2);
    ctx.lineTo(x + 12, s.y + s.h - baseR);
    ctx.quadraticCurveTo(x + 12, s.y + s.h, x + 12 - baseR, s.y + s.h);
    ctx.closePath();
    ctx.fill();
  }
}

function drawLavaPool(pool) {
  const flicker = Math.sin(Date.now() * 0.02 + pool.x * 0.01) * 0.08;
  ctx.fillStyle = "#45110c";
  roundedRect(pool.x, pool.y - 4, pool.w, pool.h + 6, 10);
  ctx.fill();

  const lavaGrad = ctx.createLinearGradient(pool.x, pool.y, pool.x, pool.y + pool.h);
  lavaGrad.addColorStop(0, "rgba(255, 225, 120, 0.95)");
  lavaGrad.addColorStop(0.45, `rgba(255, 126, 38, ${0.92 + flicker})`);
  lavaGrad.addColorStop(1, "rgba(201, 40, 18, 0.95)");
  ctx.fillStyle = lavaGrad;
  roundedRect(pool.x, pool.y, pool.w, pool.h, 10);
  ctx.fill();

  ctx.fillStyle = "rgba(255, 242, 186, 0.5)";
  for (let x = pool.x + 10; x < pool.x + pool.w - 8; x += 24) {
    ctx.beginPath();
    ctx.arc(x, pool.y + 7 + Math.sin(Date.now() * 0.015 + x * 0.08) * 2, 4, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawBone(b) {
  if (b.taken) return;
  ctx.fillStyle = "#f9edd6";
  ctx.beginPath();
  ctx.arc(b.x - 7, b.y - 3, 5, 0, Math.PI * 2);
  ctx.arc(b.x - 7, b.y + 3, 5, 0, Math.PI * 2);
  ctx.arc(b.x + 7, b.y - 3, 5, 0, Math.PI * 2);
  ctx.arc(b.x + 7, b.y + 3, 5, 0, Math.PI * 2);
  ctx.fillRect(b.x - 7, b.y - 6, 14, 12);
  ctx.fill();
}

function drawHeartPickup(h) {
  if (h.taken) return;
  const x = h.x;
  const y = h.y;
  ctx.fillStyle = "#ff6b8a";
  ctx.beginPath();
  ctx.arc(x + 7, y + 9, 6, 0, Math.PI * 2);
  ctx.arc(x + 17, y + 9, 6, 0, Math.PI * 2);
  ctx.lineTo(x + 12, y + 24);
  ctx.closePath();
  ctx.fill();
}

function drawCapePickup(c) {
  if (c.taken) return;
  const x = c.x;
  const y = c.y;
  ctx.fillStyle = "#7a4cff";
  ctx.fillRect(x + 9, y + 3, 8, 5);
  ctx.fillStyle = "#9f7dff";
  ctx.beginPath();
  ctx.moveTo(x + 3, y + 6);
  ctx.lineTo(x + 23, y + 6);
  ctx.lineTo(x + 18, y + 28);
  ctx.lineTo(x + 8, y + 28);
  ctx.closePath();
  ctx.fill();
}

function drawToy(t) {
  if (t.taken) return;
  ctx.fillStyle = "#f2c66d";
  ctx.fillRect(t.x, t.y, t.w, t.h);
  ctx.fillStyle = "#d38b32";
  ctx.fillRect(t.x + 4, t.y + 3, t.w - 8, t.h - 6);
}

function drawToyProjectile(p) {
  if (!p) return;
  ctx.fillStyle = "#f2c66d";
  ctx.fillRect(p.x, p.y, p.w, p.h);
  ctx.fillStyle = "#d38b32";
  ctx.fillRect(p.x + 3, p.y + 2, p.w - 6, p.h - 4);
}

function drawLightSwitch(light) {
  const pulse = 0.5 + Math.sin(Date.now() * 0.008) * 0.5;
  const glow = light.on ? 0.55 + pulse * 0.1 : 0;
  if (light.on) {
    ctx.fillStyle = `rgba(255, 235, 150, ${glow})`;
    ctx.beginPath();
    ctx.arc(light.x + light.w / 2, light.y + light.h / 2, 44, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.strokeStyle = `rgba(255, 240, 170, ${0.22 + pulse * 0.12})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(light.x + light.w / 2, light.y + light.h / 2, 16 + pulse * 4, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.fillStyle = "#2e3642";
  roundedRect(light.x, light.y, light.w, light.h, 8);
  ctx.fill();
  ctx.fillStyle = light.on ? "#ffe792" : "#9caac4";
  roundedRect(light.x + 6, light.y + 8, light.w - 12, light.h - 16, 6);
  ctx.fill();
}

function drawDarknessOverlay(level) {
  if (!level.dark) return;
  if (level.darkRevealUntil > Date.now()) return;
  const lights = level.lightSwitches || [];
  const onCount = lights.filter((light) => light.on).length;

  ctx.save();
  ctx.fillStyle = `rgba(2, 4, 10, ${0.8 - onCount * 0.16})`;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.globalCompositeOperation = "destination-out";

  const dogX = state.dog.x + state.dog.w / 2 - state.cameraX;
  const dogY = state.dog.y + state.dog.h / 2;
  const dogRadius = 100 + onCount * 34;
  const dogGlow = ctx.createRadialGradient(dogX, dogY, 24, dogX, dogY, dogRadius);
  dogGlow.addColorStop(0, "rgba(255,255,255,1)");
  dogGlow.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = dogGlow;
  ctx.beginPath();
  ctx.arc(dogX, dogY, dogRadius, 0, Math.PI * 2);
  ctx.fill();

  for (const light of lights) {
    const x = light.x + light.w / 2 - state.cameraX;
    const y = light.y + light.h / 2;
    const radius = light.on ? 120 : DARK_SWITCH_BEACON_RADIUS + Math.sin(Date.now() * 0.008) * 6;
    const innerRadius = light.on ? 12 : 6;
    const centerAlpha = light.on ? 0.95 : 0.58;
    const edgeAlpha = light.on ? 0 : 0.06;
    const glow = ctx.createRadialGradient(x, y, innerRadius, x, y, radius);
    glow.addColorStop(0, `rgba(255,255,255,${centerAlpha})`);
    glow.addColorStop(1, `rgba(255,255,255,${edgeAlpha})`);
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

function drawSiren(s) {
  ctx.fillStyle = s.disabled ? "#777" : "#6c7ba0";
  ctx.fillRect(s.x, s.y, s.w, s.h);
  ctx.fillStyle = "#c7d6ff";
  ctx.fillRect(s.x + 6, s.y + 10, s.w - 12, 18);
  ctx.fillStyle = "#9ab2ff";
  ctx.fillRect(s.x + 10, s.y + 34, s.w - 20, 12);

  // Countdown display
  if (s.countdownStart && !s.disabled && s.soundingUntil <= Date.now()) {
    const remaining = Math.max(0, Math.ceil((SIREN_COUNTDOWN_MS - (Date.now() - s.countdownStart)) / 1000));
    ctx.fillStyle = "#fff";
    ctx.font = "16px 'Roboto', system-ui";
    ctx.textAlign = "center";
    ctx.fillText(`${remaining}`, s.x + s.w / 2, s.y - 6);
    ctx.textAlign = "start";
  }

  // Waves while sounding
  if (s.soundingUntil > Date.now() && !s.disabled) {
    drawSirenWave(s);
  }
}

function drawSirenWave(s) {
  const now = Date.now();
  const t = (s.soundingUntil - now) / SIREN_SOUND_MS;
  const alpha = Math.max(0.15, t);
  ctx.strokeStyle = `rgba(180, 220, 255, ${alpha})`;
  ctx.lineWidth = 3;
  const cx = s.x + s.w / 2;
  const cy = s.y + s.h / 2;
  for (let i = 0; i < 3; i++) {
    const r = 30 + i * 18 + (1 - t) * 40;
    ctx.beginPath();
    ctx.arc(cx, cy, r, -0.6, 0.6);
    ctx.stroke();
  }
}

function drawEnemy(e) {
  const isDying = e.dying;

  if (e.kind === "mole") {
    ctx.fillStyle = isDying ? "#4b3426" : "#62412b";
    ctx.beginPath();
    ctx.ellipse(e.x + e.w * 0.5, e.y + e.h * 0.64, e.w * 0.5, e.h * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#8a6646";
    ctx.beginPath();
    ctx.ellipse(e.x + e.w * 0.5, e.y + e.h * 0.52, e.w * 0.34, e.h * 0.28, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#d8b498";
    ctx.beginPath();
    ctx.ellipse(e.x + e.w * (e.dir > 0 ? 0.72 : 0.28), e.y + e.h * 0.5, e.w * 0.14, e.h * 0.1, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.fillRect(e.x + (e.dir > 0 ? e.w * 0.56 : e.w * 0.24), e.y + e.h * 0.3, Math.max(4, e.w * 0.08), Math.max(4, e.h * 0.1));
    ctx.fillStyle = "#e6c59d";
    ctx.fillRect(e.x + e.w * 0.18, e.y + e.h * 0.8, e.w * 0.16, e.h * 0.08);
    ctx.fillRect(e.x + e.w * 0.66, e.y + e.h * 0.8, e.w * 0.16, e.h * 0.08);
    return;
  }

  if (e.kind === "mouse") {
    ctx.fillStyle = isDying ? "#474746" : "#676766";
    ctx.beginPath();
    ctx.ellipse(e.x + e.w * 0.5, e.y + e.h * 0.62, e.w * 0.42, e.h * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(e.x + e.w * 0.3, e.y + e.h * 0.34, e.w * 0.12, 0, Math.PI * 2);
    ctx.arc(e.x + e.w * 0.48, e.y + e.h * 0.28, e.w * 0.11, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#c2b5aa";
    ctx.beginPath();
    ctx.ellipse(e.x + e.w * (e.dir > 0 ? 0.76 : 0.24), e.y + e.h * 0.54, e.w * 0.12, e.h * 0.09, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#d3a3b0";
    ctx.lineWidth = 2;
    ctx.beginPath();
    const tailStartX = e.dir > 0 ? e.x + e.w * 0.14 : e.x + e.w * 0.86;
    const tailDir = e.dir > 0 ? -1 : 1;
    ctx.moveTo(tailStartX, e.y + e.h * 0.56);
    ctx.quadraticCurveTo(tailStartX + tailDir * 10, e.y + e.h * 0.34, tailStartX + tailDir * 18, e.y + e.h * 0.62);
    ctx.stroke();
    ctx.fillStyle = "#fff";
    ctx.fillRect(e.x + (e.dir > 0 ? e.w * 0.58 : e.w * 0.28), e.y + e.h * 0.42, Math.max(3, e.w * 0.08), Math.max(3, e.h * 0.1));
    return;
  }

  ctx.fillStyle = isDying ? "#4c2525" : e.giant ? "#824141" : "#6f2f2f";
  ctx.fillRect(e.x, e.y, e.w, e.h);
  ctx.fillStyle = e.giant ? "#efc496" : "#d6a574";
  ctx.fillRect(e.x + e.w * 0.16, e.y + e.h * 0.2, e.w - e.w * 0.32, Math.max(10, e.h * 0.24));
  if (!isDying) {
    ctx.fillStyle = "#fff";
    ctx.fillRect(e.x + (e.dir > 0 ? e.w * 0.56 : e.w * 0.18), e.y + e.h * 0.2, Math.max(5, e.w * 0.12), Math.max(5, e.h * 0.12));
  }
}

function drawBoss(boss) {
  if (!boss || boss.dead) return;
  const isDying = boss.dying;
  const telegraphing = Date.now() < boss.telegraphUntil;
  const pulse = 0.5 + Math.sin(Date.now() * 0.03) * 0.5;

  if (telegraphing) {
    if (boss.telegraphType === "dash") {
      ctx.strokeStyle = `rgba(255, 105, 105, ${0.35 + pulse * 0.45})`;
      ctx.lineWidth = 5;
      ctx.strokeRect(boss.x - 10, boss.y - 8, boss.w + 20, boss.h + 16);
    } else {
      ctx.strokeStyle = `rgba(120, 255, 255, ${0.4 + pulse * 0.4})`;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(boss.x + boss.w / 2, boss.y + boss.h / 2, 42 + pulse * 8, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  ctx.fillStyle = isDying ? "#5a3b2f" : boss.phase2 ? "#d06c2a" : "#ba7a3b";
  ctx.fillRect(boss.x, boss.y, boss.w, boss.h);
  ctx.fillStyle = "#f0cc96";
  ctx.fillRect(boss.x + 14, boss.y + 12, boss.w - 28, 15);
  ctx.fillStyle = "#2a1a12";
  ctx.fillRect(boss.x + 8, boss.y + 30, 10, 16);
  ctx.fillRect(boss.x + boss.w - 18, boss.y + 30, 10, 16);
  ctx.fillStyle = "#fff";
  ctx.fillRect(boss.x + (boss.dir > 0 ? boss.w - 28 : 18), boss.y + 12, 7, 7);
}

function drawBarkWave(wave) {
  const age = Date.now() - wave.bornAt;
  const alpha = 1 - age / BARK_WAVE_LIFETIME_MS;
  ctx.strokeStyle = `rgba(159, 246, 255, ${Math.max(alpha, 0)})`;
  ctx.lineWidth = wave.mode === "short" ? 3 : 4;

  if (wave.mode === "up") {
    const originX = wave.x + wave.w / 2;
    const originY = wave.y + wave.h;
    for (let i = 0; i < 3; i++) {
      const arcRadius = 12 + i * 13 + age * 0.08;
      ctx.beginPath();
      ctx.arc(originX, originY, arcRadius, Math.PI + 0.4, Math.PI * 2 - 0.4);
      ctx.stroke();
    }
  } else {
    const centerY = wave.y + wave.h / 2;
    const originX = wave.dir > 0 ? wave.x : wave.x + wave.w;
    const spread = wave.mode === "short" ? 0.4 : 0.6;
    for (let i = 0; i < (wave.mode === "short" ? 2 : 3); i++) {
      const arcRadius = 10 + i * (wave.mode === "short" ? 10 : 14) + age * 0.08;
      const start = wave.dir > 0 ? -spread : Math.PI - spread;
      const end = wave.dir > 0 ? spread : Math.PI + spread;
      ctx.beginPath();
      ctx.arc(originX, centerY, arcRadius, start, end);
      ctx.stroke();
    }
  }

  ctx.fillStyle = `rgba(159, 246, 255, ${Math.max(alpha * 0.15, 0)})`;
  ctx.fillRect(wave.x, wave.y, wave.w, wave.h);
}

function drawBossProjectile(p) {
  ctx.fillStyle = "#ff9a73";
  ctx.fillRect(p.x, p.y, p.w, p.h);
  ctx.fillStyle = "#fff4";
  ctx.fillRect(p.x + 3, p.y + 3, p.w - 6, p.h - 6);
}

function drawDachshund(dog) {
  const x = dog.x;
  const celebrating = state.mode === "celebrating";
  const sirenBark = state.mode === "playing" && Date.now() < state.sirenSlowUntil;
  const altPose = celebrating || sirenBark;
  const baseY = altPose ? dog.y - 12 : dog.y;
  const y = baseY; // keep legacy references stable
  const invulnerable = Date.now() < state.invulnerableUntil;
  const sneezing = Date.now() < state.sneezeUntil;
  const backflipping = Date.now() < state.backflipUntil;
  const dancing = Date.now() < state.danceUntil;
  const digging = Date.now() < state.digUntil;

  if (invulnerable && Math.floor(Date.now() / 80) % 2 === 0) ctx.globalAlpha = 0.45;

  const now = Date.now();
  let renderY = baseY;
  let footY = dog.y + dog.h;

  ctx.save();
  if (levelRuntime.dark && !(levelRuntime.darkRevealUntil > Date.now())) {
    ctx.shadowColor = "rgba(255, 243, 189, 0.7)";
    ctx.shadowBlur = 18;
  }
  if (backflipping) {
    const duration = 900;
    const progress = 1 - Math.max(0, state.backflipUntil - now) / duration;
    const lift = Math.sin(progress * Math.PI) * 8;
    const cx = x + dog.w / 2;
    const cy = footY;
    renderY -= lift;
    ctx.translate(cx, cy);
    ctx.rotate(progress * Math.PI * 2);
    ctx.translate(-cx, -cy);
  } else if (dancing) {
    const bob = Math.sin(now * 0.012) * 4;
    renderY -= bob;
  } else if (digging) {
    renderY += 4;
  }

  if (altPose) {
    const bounce = Math.sin(now * 0.016) * 2;
    const bx = x + 18;
    const by = renderY - 12 + bounce;

    // Vertical rear-up pose: hind legs planted, torso upright, muzzle pointed upward.
    ctx.fillStyle = "#1f1b19";
    ctx.fillRect(bx + 16, by + 16, 22, 34);

    ctx.fillStyle = "#8f5f2a";
    ctx.fillRect(bx + 19, by + 28, 16, 14);

    ctx.fillStyle = "#1a1716";
    ctx.fillRect(bx + 16, by + 50, 7, 15);
    ctx.fillRect(bx + 31, by + 50, 7, 15);
    ctx.fillStyle = "#8f5f2a";
    ctx.fillRect(bx + 17, by + 63, 5, 4);
    ctx.fillRect(bx + 32, by + 63, 5, 4);

    ctx.fillStyle = "#1f1b19";
    ctx.fillRect(bx + 17, by + 0, 20, 19);
    ctx.fillRect(bx + 21, by - 8, 12, 10);

    ctx.fillStyle = "#9a6a34";
    ctx.fillRect(bx + 22, by - 6, 10, 7);

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(bx + 31, by + 5, 3, 3);
    ctx.fillStyle = "#000";
    ctx.fillRect(bx + 32, by + 6, 1, 1);

    ctx.fillStyle = "#1d1a18";
    ctx.beginPath();
    ctx.ellipse(bx + 13, by + 38, 9, 5, -1.2, 0, Math.PI * 2);
    ctx.fill();

    if (Date.now() < state.combat.barkFlashUntil) {
      ctx.fillStyle = "#bff8ff";
      ctx.beginPath();
      ctx.arc(bx + 27, by - 10, 5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalAlpha = 1;
    return;
  }

  ctx.fillStyle = "#1d1a18";
  ctx.beginPath();
  const idleWagging = Date.now() < state.idleWagUntil && Math.abs(dog.vx) < 0.05 && !state.keys.jump;
  const barkWagging = state.mode === "playing" && Date.now() < state.barkWagUntil;
  const wagging = idleWagging || barkWagging;
  const wagSpeed = barkWagging ? 0.11 : 0.06;
  const wagAmp = barkWagging ? 1.15 : 0.95;
  const wagAngle = wagging ? Math.sin(Date.now() * wagSpeed) * wagAmp : -0.7;
  const tailX = dog.facing > 0 ? x - 10 : x + 68;
  const tailStubX = dog.facing > 0 ? x - 19 : x + 58;
  ctx.ellipse(tailX, renderY + 10, 10, 5, wagAngle * dog.facing, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#2f2926";
  ctx.fillRect(tailStubX, y + 8, 10, 7);

  ctx.fillStyle = "#1f1b19";
  ctx.fillRect(x, renderY + 8, 58, 20);

  ctx.fillStyle = "#8f5f2a";
  ctx.fillRect(x + 12, renderY + 14, 18, 14);

  ctx.fillStyle = "#2a2320";
  for (let i = 0; i < 7; i++) ctx.fillRect(x + 6 + i * 7, renderY + 27, 4, 5 + (i % 2));

  if (Date.now() < state.capeUntil) {
    const flutter = Math.sin(Date.now() * 0.02) * 5;
    const collarX = dog.facing > 0 ? x + 48 : x + 10;
    const collarY = renderY + 11;

    // Collar clasp/attachment at the neck.
    ctx.fillStyle = "#b58bff";
    ctx.fillRect(collarX - 3, collarY - 2, 6, 6);

    // Animated cape sits above/behind the dog, attached at collar.
    const trailDir = dog.facing > 0 ? -1 : 1;
    ctx.fillStyle = "rgba(140, 95, 255, 0.9)";
    ctx.beginPath();
    ctx.moveTo(collarX, collarY);
    ctx.lineTo(collarX + trailDir * (16 + flutter), collarY - 16);
    ctx.lineTo(collarX + trailDir * (30 + flutter * 1.4), collarY - 3);
    ctx.lineTo(collarX + trailDir * (12 + flutter * 0.5), collarY + 8);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "rgba(210, 190, 255, 0.75)";
    ctx.beginPath();
    ctx.moveTo(collarX, collarY);
    ctx.lineTo(collarX + trailDir * (10 + flutter * 0.6), collarY - 11);
    ctx.lineTo(collarX + trailDir * (18 + flutter), collarY - 2);
    ctx.closePath();
    ctx.fill();
  }

  const hx = dog.facing > 0 ? x + 52 : x - 14;
  ctx.fillStyle = "#1f1b19";
  ctx.fillRect(hx, renderY + 4, 20, 18);
  ctx.fillRect(hx + (dog.facing > 0 ? 14 : -10), renderY + 8, 12, 10);

  ctx.fillStyle = "#9a6a34";
  ctx.fillRect(hx + (dog.facing > 0 ? 12 : -8), renderY + 11, 8, 6);
  ctx.fillRect(hx + 4, renderY + 8, 5, 4);

  ctx.fillStyle = "#151211";
  ctx.fillRect(hx + (dog.facing > 0 ? 3 : 11), y + 16, 7, 14);

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(hx + (dog.facing > 0 ? 12 : 5), y + 8, 3, 3);
  ctx.fillStyle = "#000";
  ctx.fillRect(hx + (dog.facing > 0 ? 13 : 6), y + 9, 1, 1);
  ctx.fillRect(hx + (dog.facing > 0 ? 24 : -3), y + 12, 3, 3);

  ctx.fillStyle = "#1a1716";
  if (celebrating) {
    ctx.fillRect(x + 20, y + 20, 8, 18);
    ctx.fillRect(x + 34, y + 20, 8, 18);
    ctx.fillStyle = "#8f5f2a";
    ctx.fillRect(x + 21, y + 36, 6, 4);
    ctx.fillRect(x + 35, y + 36, 6, 4);
  } else {
    const stride = Math.sin(Date.now() * 0.02) * (Math.abs(dog.vx) > 0 ? 2 : 0);
    ctx.fillRect(x + 10, y + 28, 8, 11 + stride);
    ctx.fillRect(x + 26, y + 28, 8, 11 - stride);
    ctx.fillRect(x + 40, y + 28, 8, 11 + stride);
    ctx.fillStyle = "#8f5f2a";
    ctx.fillRect(x + 11, y + 35, 6, 4);
    ctx.fillRect(x + 27, y + 35, 6, 4);
    ctx.fillRect(x + 41, y + 35, 6, 4);
  }

  if (Date.now() < state.combat.barkFlashUntil) {
    ctx.fillStyle = "#bff8ff";
    const flashX = dog.facing > 0 ? hx + 22 : hx - 3;
    ctx.beginPath();
    ctx.arc(flashX, y + 14, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  if (sneezing) {
    const baseX = dog.facing > 0 ? hx + 24 : hx - 6;
    const baseY = y + 14;
    ctx.fillStyle = "rgba(200, 220, 255, 0.75)";
    for (let i = 0; i < 3; i++) {
      const dx = (dog.facing > 0 ? 1 : -1) * (6 + i * 8);
      const dy = -2 + i * 3;
      ctx.beginPath();
      ctx.ellipse(baseX + dx, baseY + dy, 6 + i * 2, 4 + i, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.globalAlpha = 1;
  ctx.restore();
}

function drawFlag(flag) {
  const level = levelRuntime;
  const bossDone = !level.boss || level.boss.dead;
  const canExit = state.bonesCollected === state.totalBones && bossDone;
  const now = Date.now();

  ctx.save();
  if (canExit) {
    const glow = 0.55 + Math.sin(now * 0.01) * 0.18;
    ctx.shadowColor = `rgba(93, 255, 162, ${0.45 + glow * 0.35})`;
    ctx.shadowBlur = 18 + glow * 10;
  }

  ctx.fillStyle = "#ddd";
  ctx.fillRect(flag.x, flag.y, 4, flag.h);

  const flutter = canExit ? Math.sin(now * 0.016) * 6 : 0;
  ctx.fillStyle = canExit ? "#4cff88" : "#f6d365";
  ctx.beginPath();
  ctx.moveTo(flag.x + 4, flag.y + 5);
  ctx.lineTo(flag.x + 40 + flutter, flag.y + 16);
  ctx.lineTo(flag.x + 4, flag.y + 28);
  ctx.closePath();
  ctx.fill();

  if (canExit) {
    ctx.shadowBlur = 0;
    ctx.fillStyle = "rgba(225, 255, 234, 0.9)";
    for (let i = 0; i < 3; i++) {
      const drift = ((now * (0.05 + i * 0.012)) + i * 24) % 42;
      const sparkleX = flag.x + 18 + i * 11 + Math.sin(now * 0.013 + i) * 4;
      const sparkleY = flag.y + 30 - drift;
      ctx.beginPath();
      ctx.arc(sparkleX, sparkleY, i === 1 ? 3.2 : 2.4, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

function drawBarkIcon(x, y, ready, cooldownLeftMs) {
  const baseColor = ready ? "#79ffbc" : "#ffd27d";
  ctx.save();
  ctx.translate(x, y);
  ctx.shadowColor = "rgba(0,0,0,0.3)";
  ctx.shadowBlur = 6;
  ctx.fillStyle = "rgba(0,0,0,0.5)";
  ctx.beginPath();
  ctx.roundRect(-4, -4, 44, 42, 9);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = "rgba(255,255,255,0.3)";
  ctx.lineWidth = 1.4;
  ctx.stroke();

  ctx.fillStyle = ready ? baseColor : "#c1a469";
  ctx.beginPath();
  ctx.moveTo(4, 8);
  ctx.lineTo(22, 16);
  ctx.lineTo(4, 24);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = ready ? baseColor : "#b38d54";
  ctx.fillRect(4, 12, 5, 12);
  ctx.fillStyle = ready ? "#caffdd" : "#f7e2b0";
  ctx.beginPath();
  ctx.arc(26, 16, 5, -Math.PI / 6, Math.PI / 6);
  ctx.arc(30, 16, 7, -Math.PI / 6, Math.PI / 6);
  ctx.fill();
  if (!ready && cooldownLeftMs > 0) {
    ctx.fillStyle = "#ffe6b3";
    ctx.font = "11px 'Roboto', system-ui";
    ctx.textAlign = "center";
    ctx.fillText(`${(cooldownLeftMs / 1000).toFixed(1)}s`, 18, 36);
  }
  ctx.restore();
}

function drawCapeIcon(x, y, active, secondsLeft) {
  ctx.save();
  ctx.translate(x, y);
  ctx.shadowColor = "rgba(0,0,0,0.3)";
  ctx.shadowBlur = 6;
  ctx.fillStyle = "rgba(0,0,0,0.5)";
  ctx.beginPath();
  ctx.roundRect(-4, -4, 44, 42, 9);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = "rgba(255,255,255,0.3)";
  ctx.lineWidth = 1.4;
  ctx.stroke();

  ctx.fillStyle = active ? "#c8a8ff" : "#666a7a";
  ctx.beginPath();
  ctx.moveTo(6, 8);
  ctx.lineTo(30, 12);
  ctx.lineTo(25, 30);
  ctx.lineTo(10, 26);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = active ? "#f0e5ff" : "#8a8f9f";
  ctx.beginPath();
  ctx.moveTo(6, 8);
  ctx.quadraticCurveTo(4, 16, 10, 26);
  ctx.quadraticCurveTo(16, 16, 14, 8);
  ctx.closePath();
  ctx.fill();
  if (active && secondsLeft > 0) {
    ctx.fillStyle = "#f7f0ff";
    ctx.font = "11px 'Roboto', system-ui";
    ctx.textAlign = "center";
    ctx.fillText(`${secondsLeft}s`, 18, 36);
  }
  ctx.restore();
}

function drawLivesHUD() {
  const head = "🐶";
  const txt = head.repeat(Math.max(0, state.levelRespawnsLeft));
  ctx.save();
  ctx.textAlign = "left";
  ctx.font = "18px 'Roboto', system-ui";
  ctx.fillStyle = "#fff";
  ctx.strokeStyle = "rgba(0,0,0,0.35)";
  ctx.lineWidth = 3;
  ctx.strokeText(txt, 12, 22);
  ctx.fillText(txt, 12, 22);
  ctx.restore();
}

function drawAbilityStatusHUD(cooldownLeft, capeLeft) {
  if (state.mode !== "playing") return;

  const statuses = [
    {
      label: cooldownLeft > 0 ? `Bark ${Math.ceil(cooldownLeft / 1000)}s` : "Bark ready",
      active: cooldownLeft <= 0,
    },
    {
      label: capeLeft > 0 ? `Cape ${Math.ceil(capeLeft / 1000)}s` : "Cape inactive",
      active: capeLeft > 0,
    },
  ];

  ctx.save();
  ctx.font = "bold 13px 'Roboto', system-ui";
  ctx.textAlign = "left";

  const gap = 8;
  const height = 24;
  const paddingX = 10;
  let x = 18;
  const y = 58;

  statuses.forEach((status) => {
    const width = ctx.measureText(status.label).width + paddingX * 2;
    ctx.fillStyle = status.active ? "rgba(14, 46, 34, 0.84)" : "rgba(34, 25, 18, 0.82)";
    ctx.strokeStyle = status.active ? "rgba(76, 255, 136, 0.72)" : "rgba(255, 205, 122, 0.48)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, 999);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = status.active ? "#e9fff1" : "#fff0d8";
    ctx.fillText(status.label, x + paddingX, y + 16);
    x += width + gap;
  });

  ctx.restore();
}

function drawBonesHUD(total, collected) {
  const gap = 6;
  const w = 26;
  const h = 14;
  const margin = 12;
  const startX = canvas.width - margin - total * (w + gap) + gap;
  const y = 14;
  for (let i = 0; i < total; i++) {
    const x = startX + i * (w + gap);
    ctx.save();
    ctx.translate(x, y);
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#fff";
    ctx.fillStyle = i < collected ? "#fff" : "#000";
    ctx.beginPath();
    ctx.arc(5, h / 2 - 2, 4, 0, Math.PI * 2);
    ctx.arc(w - 5, h / 2 - 2, 4, 0, Math.PI * 2);
    ctx.rect(5, 2, w - 10, h - 4);
    ctx.arc(5, h / 2 + 2, 4, 0, Math.PI * 2);
    ctx.arc(w - 5, h / 2 + 2, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  ctx.save();
  ctx.textAlign = "right";
  ctx.font = "bold 14px 'Roboto', system-ui";
  ctx.fillStyle = "#f5fbff";
  ctx.strokeStyle = "rgba(0,0,0,0.45)";
  ctx.lineWidth = 3;
  const label = `Bones ${collected}/${total}`;
  const textX = canvas.width - margin;
  const textY = y + h + 16;
  ctx.strokeText(label, textX, textY);
  ctx.fillText(label, textX, textY);
  ctx.restore();
}

function getActiveMobileZones() {
  const zones = new Set();
  for (const touch of mobileControlState.activeTouches.values()) {
    if (touch.zone) zones.add(touch.zone);
  }
  return zones;
}

function getMobilePortalChipRect() {
  return { x: canvas.width - 128, y: 12, w: 108, h: 34 };
}

function mobilePortalChipVisible() {
  return mobileControlState.immersive && (state.mode === "start" || state.mode === "title");
}

function drawMobilePortalChip() {
  if (!mobilePortalChipVisible()) return;
  const rect = getMobilePortalChipRect();
  ctx.save();
  ctx.fillStyle = "rgba(106, 47, 127, 0.88)";
  ctx.strokeStyle = "rgba(255, 219, 255, 0.82)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(rect.x, rect.y, rect.w, rect.h, 999);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#fff5ff";
  ctx.font = "bold 15px 'Roboto', system-ui";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("HENRY", rect.x + rect.w / 2, rect.y + rect.h / 2 + 1);
  ctx.restore();
}

function drawMobileTouchGuide() {
  if (!mobileControlState.immersive || state.mode !== "playing") return;

  const zones = getActiveMobileZones();
  const zoneY = canvas.height - 78;
  const zoneH = 60;
  const leftW = canvas.width * 0.29;
  const centerW = canvas.width * 0.22;
  const rightW = canvas.width * 0.29;
  const gap = canvas.width * 0.04;
  const totalW = leftW + centerW + rightW + gap * 2;
  const startX = (canvas.width - totalW) / 2;
  const zonesToDraw = [
    { key: "left", x: startX, w: leftW, tint: "110, 231, 183" },
    { key: "center", x: startX + leftW + gap, w: centerW, tint: "255, 210, 122" },
    { key: "right", x: startX + leftW + gap + centerW + gap, w: rightW, tint: "110, 231, 183" },
  ];

  ctx.save();
  ctx.lineWidth = 2;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  for (const zone of zonesToDraw) {
    const active = zones.has(zone.key);
    const fillAlpha = active ? 0.28 : 0.14;
    const strokeAlpha = active ? 0.62 : 0.28;
    ctx.fillStyle = `rgba(${zone.tint}, ${fillAlpha})`;
    ctx.strokeStyle = `rgba(255, 255, 255, ${strokeAlpha})`;
    ctx.beginPath();
    ctx.roundRect(zone.x, zoneY, zone.w, zoneH, 22);
    ctx.fill();
    ctx.stroke();

    ctx.save();
    ctx.translate(zone.x + zone.w / 2, zoneY + zoneH / 2);
    ctx.strokeStyle = active ? "rgba(255,255,255,0.96)" : "rgba(255,255,255,0.74)";
    ctx.fillStyle = active ? "rgba(255,255,255,0.96)" : "rgba(255,255,255,0.74)";
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    if (zone.key === "left") {
      ctx.beginPath();
      ctx.moveTo(16, -14);
      ctx.lineTo(-10, 0);
      ctx.lineTo(16, 14);
      ctx.stroke();
    } else if (zone.key === "right") {
      ctx.beginPath();
      ctx.moveTo(-16, -14);
      ctx.lineTo(10, 0);
      ctx.lineTo(-16, 14);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.arc(-7, 0, 7, -0.6, 0.6);
      ctx.arc(4, 0, 10, -0.55, 0.55);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(-20, -2, 3.5, 0, Math.PI * 2);
      ctx.arc(-15, -10, 2.5, 0, Math.PI * 2);
      ctx.arc(-13, 6, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  if (levelRuntime?.tunnel) {
    const centerZone = zonesToDraw[1];
    ctx.fillStyle = "rgba(8, 17, 35, 0.82)";
    ctx.strokeStyle = "rgba(255,255,255,0.22)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(centerZone.x + centerZone.w / 2 - 44, zoneY - 26, 88, 22, 999);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "rgba(255,245,220,0.95)";
    ctx.font = "bold 12px 'Roboto', system-ui";
    ctx.fillText("HOLD DIG", centerZone.x + centerZone.w / 2, zoneY - 15);
  }

  ctx.restore();
}

function drawLevelProgressHUD(level) {
  if (!level?.worldWidth || state.mode !== "playing") return;

  const barW = 260;
  const barH = 12;
  const x = canvas.width / 2 - barW / 2;
  const y = canvas.height - 28;
  const dogCenterX = state.dog.x + state.dog.w / 2;
  const dogProgress = Math.max(0, Math.min(1, dogCenterX / level.worldWidth));
  const flagCenterX = level.finishFlag ? level.finishFlag.x + level.finishFlag.w / 2 : level.worldWidth;
  const flagProgress = Math.max(0, Math.min(1, flagCenterX / level.worldWidth));

  ctx.save();
  ctx.fillStyle = "rgba(5, 12, 26, 0.72)";
  ctx.strokeStyle = "rgba(255,255,255,0.22)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(x - 10, y - 18, barW + 20, 42, 14);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "rgba(255,255,255,0.14)";
  ctx.beginPath();
  ctx.roundRect(x, y, barW, barH, 999);
  ctx.fill();

  const fillW = Math.max(barH, barW * dogProgress);
  const grad = ctx.createLinearGradient(x, 0, x + barW, 0);
  grad.addColorStop(0, "#79e1ff");
  grad.addColorStop(1, "#4cff88");
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.roundRect(x, y, fillW, barH, 999);
  ctx.fill();

  const flagX = x + barW * flagProgress;
  ctx.strokeStyle = "rgba(255,255,255,0.4)";
  ctx.beginPath();
  ctx.moveTo(flagX, y - 4);
  ctx.lineTo(flagX, y + barH + 4);
  ctx.stroke();

  const markerX = x + barW * dogProgress;
  ctx.fillStyle = "#fff7d6";
  ctx.beginPath();
  ctx.arc(markerX, y + barH / 2, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(0,0,0,0.4)";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.textAlign = "center";
  ctx.font = "13px 'Roboto', system-ui";
  ctx.fillStyle = "#eefcff";
  ctx.fillText("Start", x + 18, y - 7);
  ctx.fillText("Flag", Math.min(x + barW - 16, Math.max(x + 22, flagX)), y - 7);
  ctx.restore();
}

function drawObjectiveGuideHUD(level) {
  if (state.mode !== "playing" || !level) return;

  const bonesLeft = Math.max(0, state.totalBones - state.bonesCollected);
  const bossAlive = Boolean(level.boss && !level.boss.dead);
  let label = "Flag ready!";
  let bg = "rgba(14, 46, 34, 0.86)";
  let border = "rgba(76, 255, 136, 0.72)";
  let color = "#ecfff0";

  if (bonesLeft > 0) {
    label = bonesLeft === 1 ? "Need 1 more bone" : `Need ${bonesLeft} more bones`;
    bg = "rgba(34, 25, 18, 0.84)";
    border = "rgba(255, 205, 122, 0.48)";
    color = "#fff0d8";
  } else if (bossAlive) {
    label = `Defeat ${level.boss.name}`;
    bg = "rgba(59, 22, 18, 0.86)";
    border = "rgba(255, 147, 109, 0.56)";
    color = "#ffe5d8";
  }

  ctx.save();
  ctx.font = "bold 14px 'Roboto', system-ui";
  const width = ctx.measureText(label).width + 26;
  const x = canvas.width / 2 - width / 2;
  const y = 42;
  ctx.fillStyle = bg;
  ctx.strokeStyle = border;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(x, y, width, 28, 999);
  ctx.fill();
  ctx.stroke();
  ctx.textAlign = "center";
  ctx.fillStyle = color;
  ctx.fillText(label, canvas.width / 2, y + 19);
  ctx.restore();
}

function drawDeadDog(x, y) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(Math.PI);
  ctx.fillStyle = "#1f1b19";
  ctx.fillRect(-26, -10, 52, 18);
  ctx.fillStyle = "#8f5f2a";
  ctx.fillRect(-10, -6, 20, 10);
  ctx.fillStyle = "#1f1b19";
  ctx.fillRect(18, -4, 18, 16);
  ctx.fillStyle = "#9a6a34";
  ctx.fillRect(18, -1, 10, 6);
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(24, 2);
  ctx.lineTo(30, 8);
  ctx.moveTo(30, 2);
  ctx.lineTo(24, 8);
  ctx.stroke();
  ctx.restore();
}

function drawPauseSlider(x, y, value, label, selected) {
  const w = 220;
  const notchCount = 10;
  ctx.save();
  ctx.textAlign = "left";
  ctx.font = "18px 'Roboto', system-ui";
  ctx.fillStyle = "#fff";
  ctx.fillText(`${label}: ${value}%`, x, y - 10);
  ctx.strokeStyle = selected ? "#9fe5ff" : "#ccc";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + w, y);
  ctx.stroke();
  ctx.lineWidth = 1.5;
  for (let i = 0; i <= notchCount; i++) {
    const nx = x + (w / notchCount) * i;
    ctx.beginPath();
    ctx.moveTo(nx, y - 6);
    ctx.lineTo(nx, y + 6);
    ctx.stroke();
  }
  const markerX = x + (w * value) / 100;
  ctx.fillStyle = selected ? "#4cff88" : "#fff";
  ctx.beginPath();
  ctx.arc(markerX, y, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawPauseMenuOption(x, y, w, h, label, subtitle, selected) {
  ctx.save();
  ctx.fillStyle = selected ? "rgba(18, 46, 74, 0.92)" : "rgba(7, 18, 36, 0.74)";
  ctx.strokeStyle = selected ? "rgba(159, 229, 255, 0.88)" : "rgba(159, 229, 255, 0.26)";
  ctx.lineWidth = selected ? 2.5 : 1.5;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 16);
  ctx.fill();
  ctx.stroke();

  if (selected) {
    ctx.fillStyle = "rgba(76, 255, 136, 0.94)";
    ctx.beginPath();
    ctx.moveTo(x + 16, y + h / 2);
    ctx.lineTo(x + 28, y + h / 2 - 8);
    ctx.lineTo(x + 28, y + h / 2 + 8);
    ctx.closePath();
    ctx.fill();
  }

  ctx.textAlign = "left";
  ctx.fillStyle = selected ? "#f6feff" : "#ffffff";
  ctx.font = "bold 21px 'Roboto', system-ui";
  ctx.fillText(label, x + 42, y + 24);
  ctx.fillStyle = selected ? "#dff8ff" : "rgba(217, 251, 255, 0.88)";
  ctx.font = "15px 'Roboto', system-ui";
  ctx.fillText(subtitle, x + 42, y + 46);
  ctx.restore();
}

function buildBossSnapshotLine(level) {
  return level?.boss
    ? level.boss.dead
      ? `Boss: ${level.boss.name} defeated • flag ready when bones are done`
      : `Boss: ${level.boss.name} ${Math.max(0, level.boss.health)}/${level.boss.maxHealth}`
    : "";
}

function drawRunSnapshotCard(level, options = {}) {
  const cooldownLeft = Math.max(0, state.combat.barkCooldownUntil - Date.now());
  const capeLeft = Math.max(0, state.capeUntil - Date.now());
  const bossLine = buildBossSnapshotLine(level);
  const title = options.title || `${level.name} snapshot`;
  const footer = options.footer || "";
  const accent = options.accent || "rgba(159, 229, 255, 0.32)";
  const y = options.y ?? canvas.height / 2 + 42;
  const showAbilities = options.showAbilities !== false;
  const cardW = 370;
  const extraLines = (showAbilities ? 1 : 0) + (bossLine ? 1 : 0) + (footer ? 1 : 0);
  const cardH = 74 + extraLines * 24;
  const x = canvas.width / 2 - cardW / 2;

  ctx.save();
  ctx.fillStyle = "rgba(7, 18, 36, 0.82)";
  ctx.strokeStyle = accent;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(x, y, cardW, cardH, 16);
  ctx.fill();
  ctx.stroke();

  ctx.textAlign = "left";
  ctx.fillStyle = "#f8fdff";
  ctx.font = "bold 18px 'Roboto', system-ui";
  ctx.fillText(title, x + 16, y + 26);

  ctx.font = "15px 'Roboto', system-ui";
  ctx.fillStyle = "#d9fbff";
  ctx.fillText(`Bones: ${state.bonesCollected}/${state.totalBones}`, x + 16, y + 52);
  ctx.fillText(`Lives: ${state.lives}/${MAX_LIVES} • Continues: ${state.levelRespawnsLeft}`, x + 16, y + 74);

  let lineY = y + 98;
  if (showAbilities) {
    const barkText = cooldownLeft > 0 ? `recharging ${Math.ceil(cooldownLeft / 1000)}s` : "ready";
    const capeText = capeLeft > 0 ? `active ${Math.ceil(capeLeft / 1000)}s` : "inactive";
    ctx.fillText(`Super Bark: ${barkText}`, x + 16, lineY);
    ctx.fillText(`Cape: ${capeText}`, x + 188, lineY);
    lineY += 24;
  }

  if (bossLine) {
    ctx.fillStyle = level.boss.dead ? "#dfffea" : "#ffe6d8";
    ctx.fillText(bossLine, x + 16, lineY);
    lineY += 24;
  }

  if (footer) {
    ctx.fillStyle = "#bfefff";
    ctx.fillText(footer, x + 16, lineY);
  }
  ctx.restore();
}

function drawPauseSummaryCard(level) {
  drawRunSnapshotCard(level, { title: `${level.name} snapshot` });
}

function drawLogo(x, y, scale = 0.5) {
  const img = getImage(LOGO_IMG);
  if (!img || !img.complete || !img.naturalWidth) return;
  const w = img.naturalWidth * scale;
  const h = img.naturalHeight * scale;
  const padX = 18;
  const padY = 18;
  const cardX = x - w / 2 - padX;
  const cardY = y - h / 2 - padY;
  const cardW = w + padX * 2;
  const cardH = h + padY * 2;

  ctx.save();
  const glow = ctx.createRadialGradient(x, y, Math.min(w, h) * 0.2, x, y, Math.max(cardW, cardH) * 0.8);
  glow.addColorStop(0, "rgba(121, 225, 255, 0.24)");
  glow.addColorStop(1, "rgba(121, 225, 255, 0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(x, y, Math.max(cardW, cardH) * 0.72, 0, Math.PI * 2);
  ctx.fill();

  ctx.shadowColor = "rgba(0, 0, 0, 0.35)";
  ctx.shadowBlur = 28;
  ctx.shadowOffsetY = 10;
  ctx.fillStyle = "rgba(255, 255, 255, 0.96)";
  ctx.strokeStyle = "rgba(121, 225, 255, 0.52)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(cardX, cardY, cardW, cardH, 24);
  ctx.fill();
  ctx.stroke();

  ctx.shadowColor = "transparent";
  ctx.fillStyle = "rgba(16, 28, 52, 0.08)";
  ctx.beginPath();
  ctx.roundRect(cardX + 10, cardY + 10, cardW - 20, cardH - 20, 18);
  ctx.fill();

  ctx.drawImage(img, x - w / 2, y - h / 2, w, h);
  ctx.restore();
}

function drawOverlay() {
  if (state.mode === "playing") return;

  if (state.mode === "start") {
    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, "#0a0f1e");
    grad.addColorStop(1, "#0f1c35");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawLogo(canvas.width / 2, canvas.height / 2 - 22, 0.35);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 48px 'Flubby', 'Roboto', system-ui";
    ctx.textAlign = "center";
    ctx.fillText("Dachshund Dash", canvas.width / 2, canvas.height / 2 + 68);
    drawCenteredChipRow(canvas.height / 2 + 112, ["Swim", "Moon", "Volcano", "Lights", "Big Corgis"], {
      font: "bold 15px 'Roboto', system-ui",
      paddingX: 14,
      height: 30,
      gap: 10,
      bg: "rgba(19, 33, 64, 0.84)",
      border: "rgba(159, 229, 255, 0.34)",
      color: "#effaff",
    });
    drawStartPromptCard(canvas.height / 2 + 166, "▶ Press Start", "Enter / Space / W / ↑ or tap ▲");
    ctx.textAlign = "start";
    return;
  }

  if (state.mode === "title") {
    ctx.fillStyle = "rgba(0, 0, 0, 0.28)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#fff";
    ctx.font = "bold 52px 'Flubby', 'Roboto', system-ui";
    ctx.textAlign = "center";
    ctx.fillText(levelRuntime.name, canvas.width / 2, canvas.height / 2);
    const tags = [];
    if (levelRuntime.water) tags.push("Swim");
    if (levelRuntime.moon) tags.push("Moon");
    if (levelRuntime.cloud) tags.push("Clouds");
    if (levelRuntime.tunnel) tags.push("Tunnel");
    if (levelRuntime.volcano) tags.push("Volcano");
    if (levelRuntime.giantEnemies) tags.push("Big Corgis");
    if (levelRuntime.dark) tags.push("Lights");
    if (levelRuntime.boss) tags.push("Boss");
    if (tags.length) {
      drawCenteredChipRow(canvas.height / 2 + 46, tags, {
        font: "bold 15px 'Roboto', system-ui",
        paddingX: 14,
        height: 30,
        gap: 10,
        bg: "rgba(9, 22, 44, 0.82)",
        border: "rgba(159, 229, 255, 0.34)",
        color: "#f4fbff",
      });
    }
    drawStartPromptCard(canvas.height / 2 + 102, "▶ Press Start", "Enter / Space / W / ↑ or tap ▲");
    ctx.textAlign = "start";
    return;
  }

  if (state.mode === "celebrating") {
    ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#d9fbff";
    ctx.font = "bold 42px 'Flubby', 'Roboto', system-ui";
    ctx.textAlign = "center";
    ctx.fillText(`${levelRuntime.name} CLEAR!`, canvas.width / 2, 96);
    ctx.textAlign = "start";
    return;
  }

  if (state.mode === "paused") {
    ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#fff";
    ctx.font = "bold 48px 'Flubby', 'Roboto', system-ui";
    ctx.textAlign = "center";
    ctx.fillText("PAUSED", canvas.width / 2, canvas.height / 2 - 108);
    ctx.font = "18px 'Roboto', 'Roboto', system-ui";
    ctx.fillStyle = "#d9fbff";
    ctx.fillText("Quick status stays visible here so you can resume without losing the thread.", canvas.width / 2, canvas.height / 2 - 78);
    ctx.font = "22px 'Roboto', 'Roboto', system-ui";
    if (state.pauseMenu === "main") {
      const sel = state.pauseOptionIndex || 0;
      const cardW = 330;
      const cardH = 58;
      const cardX = canvas.width / 2 - cardW / 2;
      const firstY = canvas.height / 2 - 44;
      const options = [
        ["Continue", "Jump straight back into the level."],
        ["Options", "Adjust music and sound effects."],
      ];
      options.forEach(([label, subtitle], i) => {
        drawPauseMenuOption(cardX, firstY + i * 68, cardW, cardH, label, subtitle, sel === i);
      });
      ctx.font = "17px 'Roboto', system-ui";
      ctx.fillStyle = "#d9fbff";
      ctx.fillText("↑/↓ select • Enter confirm • P/Esc resume", canvas.width / 2, canvas.height / 2 + 98);
      ctx.font = "15px 'Roboto', system-ui";
      ctx.fillStyle = "#b8eef6";
      ctx.fillText("Touch: ◀/▶ choose • ▲ confirm • PAUSE resume", canvas.width / 2, canvas.height / 2 + 122);
    } else {
      const musicSelected = state.pauseOptionIndex === 0;
      const sfxSelected = state.pauseOptionIndex === 1;
      drawPauseSlider(canvas.width / 2 - 110, canvas.height / 2 - 22, AUDIO.musicVol, "Music", musicSelected);
      drawPauseSlider(canvas.width / 2 - 110, canvas.height / 2 + 22, AUDIO.sfxVol, "SFX", sfxSelected);
      ctx.font = "17px 'Roboto', system-ui";
      ctx.fillStyle = "#d9fbff";
      ctx.fillText("Enter: Save • Esc/B: Back • ←/→ adjust", canvas.width / 2, canvas.height / 2 + 54);
      ctx.font = "15px 'Roboto', system-ui";
      ctx.fillStyle = "#b8eef6";
      ctx.fillText("Touch: BARK switches row • ◀/▶ adjust • ▲ save", canvas.width / 2, canvas.height / 2 + 78);
    }
    drawPauseSummaryCard(levelRuntime);
    ctx.textAlign = "start";
    return;
  }

  if (state.mode === "dead") {
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#fff";
    ctx.font = "bold 44px 'Flubby', 'Roboto', system-ui";
    ctx.textAlign = "center";
    ctx.fillText("YOU FAINTED", canvas.width / 2, canvas.height / 2 - 70);
    ctx.font = "20px 'Roboto', 'Roboto', system-ui";
    ctx.fillText(`Lives left: ${"🐶".repeat(Math.max(0, state.levelRespawnsLeft))}`, canvas.width / 2, canvas.height / 2 - 42);
    ctx.fillText(`C to Continue (${state.levelRespawnsLeft} left) • Q to Quit`, canvas.width / 2, canvas.height / 2 - 16);
    ctx.font = "18px 'Roboto', 'Roboto', system-ui";
    ctx.fillStyle = "#d9fbff";
    ctx.fillText("Touch: tap ▲ to continue or BARK to quit", canvas.width / 2, canvas.height / 2 + 10);
    drawRunSnapshotCard(levelRuntime, {
      title: `${levelRuntime.name} recovery snapshot`,
      y: canvas.height / 2 + 32,
      accent: "rgba(255, 205, 132, 0.36)",
      footer: state.levelRespawnsLeft > 0 ? "Continue keeps this level progress. Quit returns to the title screen." : "No continues remain for this level."
    });
    drawDeadDog(canvas.width / 2, canvas.height / 2 + 196);
    ctx.textAlign = "start";
    return;
  }

  if (state.mode === "gameover") {
    ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#fff";
    ctx.font = "bold 50px 'Flubby', 'Roboto', system-ui";
    ctx.textAlign = "center";
    ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 56);
    ctx.font = "20px 'Roboto', 'Roboto', system-ui";
    ctx.fillText("No continues left this run.", canvas.width / 2, canvas.height / 2 - 26);
    ctx.fillText("Keyboard: Q / Enter / Space to restart", canvas.width / 2, canvas.height / 2);
    ctx.font = "18px 'Roboto', 'Roboto', system-ui";
    ctx.fillStyle = "#d9fbff";
    ctx.fillText("Touch: tap ▲ to restart from the title screen", canvas.width / 2, canvas.height / 2 + 26);
    drawRunSnapshotCard(levelRuntime, {
      title: `${levelRuntime.name} final snapshot`,
      y: canvas.height / 2 + 48,
      accent: "rgba(255, 159, 159, 0.36)",
      footer: "Restart begins a fresh run from Level 1.",
      showAbilities: false
    });
    drawDeadDog(canvas.width / 2, canvas.height / 2 + 200);
    ctx.textAlign = "start";
    return;
  }

  ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#fff";
  ctx.font = "bold 46px 'Flubby', 'Roboto', system-ui";
  ctx.textAlign = "center";
  ctx.fillText(state.mode === "won" ? "ALL LEVELS CLEAR!" : "YOU LOST", canvas.width / 2, canvas.height / 2 - 10);
  ctx.font = "22px 'Roboto', 'Roboto', system-ui";
  ctx.fillText("Press R (or tap ▲) to restart", canvas.width / 2, canvas.height / 2 + 30);
  ctx.textAlign = "start";
}

function render() {
  const level = levelRuntime;
  const now = Date.now();
  renderRunSummary(level);
  renderLaunchStatus();
  const shaking = now < state.shakeUntil ? state.shakeIntensity : 0;
  const shakeX = shaking ? Math.random() * shaking * 2 - shaking : 0;
  const shakeY = shaking ? Math.random() * shaking * 2 - shaking : 0;

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = "source-over";
  ctx.filter = "none";
  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  ctx.translate(shakeX, shakeY);

  drawParallax();

  ctx.save();
  ctx.translate(-state.cameraX, 0);

  for (const pool of level.lavaPools || []) drawLavaPool(pool);
  for (const p of level.platforms) drawPlatform(p);
  for (const burst of state.dirtBursts) {
    ctx.fillStyle = burst.color;
    ctx.beginPath();
    ctx.arc(burst.x, burst.y, burst.r, 0, Math.PI * 2);
    ctx.fill();
  }
  for (const s of level.spikes) drawSpike(s);
  for (const b of level.bones) drawBone(b);
  for (const h of level.hearts || []) drawHeartPickup(h);
  for (const c of level.capes || []) drawCapePickup(c);
  for (const t of level.toys || []) drawToy(t);
  for (const light of level.lightSwitches || []) drawLightSwitch(light);
  for (const s of level.sirens || []) drawSiren(s);
  for (const e of level.enemies) if (!e.dead) drawEnemy(e);
  drawBoss(level.boss);
  for (const wave of state.combat.barkWaves) drawBarkWave(wave);
  for (const p of state.bossProjectiles) drawBossProjectile(p);
  if (state.toyProjectile) drawToyProjectile(state.toyProjectile);
  drawFlag(level.finishFlag);
  drawDachshund(state.dog);

  ctx.restore();

  drawDarknessOverlay(level);
  if (level.dark && !(level.darkRevealUntil > Date.now())) {
    ctx.save();
    ctx.translate(-state.cameraX, 0);
    ctx.shadowColor = "rgba(255, 243, 189, 0.78)";
    ctx.shadowBlur = 22;
    drawDachshund(state.dog);
    ctx.restore();
  }

  if (state.sirenOverlayUntil > Date.now()) {
    ctx.save();
    ctx.fillStyle = "rgba(0,0,0,0.35)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.font = "bold 52px 'Flubby', 'Roboto', system-ui";
    ctx.fillText("NOON SIREN!", canvas.width / 2, canvas.height / 2 - 10);
    ctx.font = "20px 'Roboto', system-ui";
    ctx.fillText("Throw the toy to defeat the paralyzing howl-inducing machine!", canvas.width / 2, canvas.height / 2 + 24);
    ctx.restore();
  }

  drawLivesHUD();

  if (state.barkBlast) {
    const elapsed = now - state.barkBlast.startedAt;
    const progress = Math.min(1, elapsed / state.barkBlast.duration);
    const maxR = Math.hypot(canvas.width, canvas.height) * 1.2;
    const r = progress * maxR;
    const cx = state.dog.x + state.dog.w * 0.5 - state.cameraX;
    const cy = state.dog.y + state.dog.h * 0.5;
    const grad = ctx.createRadialGradient(cx, cy, Math.max(6, r * 0.06), cx, cy, r);
    grad.addColorStop(0, "rgba(255,255,255,0.7)");
    grad.addColorStop(0.35, "rgba(255,255,255,0.35)");
    grad.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
    if (elapsed >= state.barkBlast.duration) state.barkBlast = null;
  }

  const cooldownLeft = Math.max(0, state.combat.barkCooldownUntil - Date.now());
  const capeLeft = Math.max(0, state.capeUntil - Date.now());

  drawBarkIcon(18, 22, cooldownLeft <= 0, cooldownLeft);
  drawCapeIcon(70, 22, capeLeft > 0, Math.max(0, Math.ceil(capeLeft / 1000)));
  drawBonesHUD(state.totalBones, state.bonesCollected);

  if (state.mode === "playing") {
    ctx.save();
    ctx.font = "16px 'Roboto', system-ui";
    const chipText = `${level.name}`;
    const chipWidth = ctx.measureText(chipText).width + 24;
    drawInfoChip(canvas.width / 2 - chipWidth / 2, 10, chipText, {
      bg: "rgba(7, 18, 36, 0.78)",
      border: "rgba(255, 255, 255, 0.26)",
      color: "#f8fdff",
    });
    ctx.restore();
  }

  drawMobilePortalChip();
  drawMobileTouchGuide();

  if (level.boss) {
    const boss = level.boss;
    const barW = 320;
    const barH = 16;
    const margin = 18;
    const containerH = 52;
    const barX = canvas.width - barW - margin;
    const barY = canvas.height - containerH - margin;
    const hpRatio = boss.dead ? 0 : Math.max(0, boss.health / boss.maxHealth);

    ctx.save();
    ctx.textAlign = "left";
    ctx.font = "16px 'Roboto', system-ui";

    ctx.fillStyle = "rgba(20,20,28,0.72)";
    ctx.fillRect(barX - 12, barY - 10, barW + 24, containerH);
    ctx.strokeStyle = boss.phase2 ? "#ff8d4d" : "#ffd9a3";
    ctx.lineWidth = 2;
    ctx.strokeRect(barX - 12, barY - 10, barW + 24, containerH);

    ctx.fillStyle = "#fff2d6";
    ctx.fillText(`${boss.name}${boss.phase2 ? " • PHASE 2" : ""}`, barX, barY + 2);

    ctx.fillStyle = "#3a2c2c";
    ctx.fillRect(barX, barY + 10, barW, barH);
    const grad = ctx.createLinearGradient(barX, 0, barX + barW, 0);
    grad.addColorStop(0, boss.phase2 ? "#ff5f4f" : "#ff8a62");
    grad.addColorStop(1, boss.phase2 ? "#ffb347" : "#ffd36f");
    ctx.fillStyle = grad;
    ctx.fillRect(barX, barY + 10, barW * hpRatio, barH);
    ctx.strokeStyle = "rgba(255,255,255,0.35)";
    ctx.strokeRect(barX, barY + 10, barW, barH);

    ctx.fillStyle = "#ffe8cb";
    const telegraphText = Date.now() < boss.telegraphUntil ? ` • Telegraph: ${boss.telegraphType}` : "";
    const defeatedText = boss.dead ? "DEFEATED" : `${Math.max(0, boss.health)}/${boss.maxHealth}`;
    ctx.fillText(`HP ${defeatedText}${telegraphText}`, barX, barY + 39);

    ctx.restore();
  }

  drawOverlay();

  const barkBtn = document.getElementById("btn-bark");
  if (barkBtn) {
    const barkCoolingDown = cooldownLeft > 0;
    barkBtn.textContent = barkCoolingDown ? `BARK ${Math.ceil(cooldownLeft / 1000)}` : "BARK";
    barkBtn.classList.toggle("cooldown", barkCoolingDown);
    barkBtn.setAttribute("aria-label", barkCoolingDown ? `Super bark recharging, ${Math.ceil(cooldownLeft / 1000)} seconds left` : "Super bark attack");
    barkBtn.title = barkCoolingDown ? `Super bark recharging: ${Math.ceil(cooldownLeft / 1000)}s left` : "Super bark ready";
    if (mobileBarkCaptionEl) {
      mobileBarkCaptionEl.textContent = barkCoolingDown ? "Cooldown" : "Attack";
    }
  }

  const pauseBtn = document.getElementById("btn-pause");
  if (pauseBtn) {
    const paused = state.mode === "paused";
    const pauseAvailable = state.mode === "playing" || paused;
    pauseBtn.textContent = paused ? "RESUME" : pauseAvailable ? "PAUSE" : "RUN FIRST";
    pauseBtn.classList.toggle("paused", paused);
    pauseBtn.disabled = !pauseAvailable;
    pauseBtn.dataset.state = paused ? "paused" : pauseAvailable ? "ready" : "locked";
    const pauseLabel = paused ? "Resume run" : pauseAvailable ? "Pause run" : "Pause locked until a run starts";
    pauseBtn.setAttribute("aria-label", pauseLabel);
    pauseBtn.title = pauseLabel;
    if (mobilePauseCaptionEl) {
      mobilePauseCaptionEl.textContent = pauseAvailable ? "Pause / resume" : "Pause locked";
    }
  }

  const previewLevel =
    state.mode === "start"
      ? LEVELS[0]
      : LEVELS[Math.max(0, Math.min(LEVELS.length - 1, state.currentLevelIndex || 0))] || LEVELS[0];
  const previewLevelNumber = LEVELS.indexOf(previewLevel) + 1;
  const previewStage = levelSelectStageText(previewLevel);
  const previewGoal = levelSelectGoalPreview(previewLevel);
  const previewStageIcon = levelSelectStageIcon(previewLevel);
  const previewTheme = levelSelectThemeKey(previewLevel);

  if (startDesktopBtn) {
    let label = "Run live";
    let hint = "Run is already in progress";
    let aria = "Run already in progress";
    let disabled = true;
    let shortcut = "";

    if (state.mode === "start") {
      label = `${previewStageIcon} Start Level ${previewLevelNumber}`;
      hint = `Start from the title screen with a click or press Enter / Space / W / ↑`;
      aria = `Start Level ${previewLevelNumber} from the title screen with Enter, Space, W, or Arrow Up`;
      disabled = false;
      shortcut = "Enter / Space / W / ↑";
    } else if (state.mode === "paused") {
      label = "Resume run";
      hint = "Resume the paused run with a click";
      aria = "Resume paused run";
      disabled = false;
      shortcut = "P / Esc";
    } else if (state.mode === "title") {
      label = `${previewStageIcon} Start Level ${previewLevelNumber}`;
      hint = `Launch ${previewLevel.name} now with a click or press Enter / Space / W / ↑`;
      aria = `Start ${previewLevel.name} now with Enter, Space, W, or Arrow Up`;
      disabled = false;
      shortcut = "Enter / Space / W / ↑";
    } else if (state.mode === "dead") {
      label = "Continue";
      hint = `Continue from faint state (${state.levelRespawnsLeft} left) with C, Enter, or Space`;
      aria = "Continue after fainting with C, Enter, or Space";
      disabled = false;
      shortcut = "C / Enter / Space";
    } else if (state.mode === "gameover") {
      label = "Restart run";
      hint = "Restart from Level 1 with Q, Enter, Space, or Esc after game over";
      aria = "Restart run after game over with Q, Enter, Space, or Escape";
      disabled = false;
      shortcut = "Q / Enter / Space";
    }

    startDesktopBtn.textContent = label;
    startDesktopBtn.dataset.shortcut = shortcut;
    startDesktopBtn.disabled = disabled;
    startDesktopBtn.dataset.state = state.mode;
    startDesktopBtn.dataset.theme = state.mode === "start" || state.mode === "title" ? previewTheme : "";
    startDesktopBtn.setAttribute("aria-label", aria);
    const hintEl = startDesktopBtn.parentElement?.querySelector(".utility-btn-hint");
    if (hintEl) hintEl.textContent = hint;

    if (startActionContextEl) {
      const showPreview = state.mode === "start" || state.mode === "title";
      const previewProgress = Math.max(0, Math.min(100, (previewLevelNumber / LEVELS.length) * 100));
      const previewText = `Level ${previewLevelNumber} · ${levelSelectStageIcon(previewLevel)} ${previewStage} · ${previewGoal.text}`;
      startActionContextEl.hidden = !showPreview;
      startActionContextEl.textContent = previewText;
      startActionContextEl.dataset.tone = runSummaryTheme(previewLevel).tone;
      startActionContextEl.dataset.theme = showPreview ? previewTheme : "";
      startActionContextEl.style.setProperty("--context-progress", showPreview ? `${previewProgress}%` : "0%");
      startActionContextEl.setAttribute(
        "aria-label",
        `Level ${previewLevelNumber} · ${levelSelectStageIcon(previewLevel)} ${previewStage} · ${previewGoal.label}. Preview start is ${Math.round(previewProgress)}% into the 20-level run.`
      );
      startActionContextEl.title = `Preview start: ${Math.round(previewProgress)}% into the 20-level run`;
    }
  }

  if (pauseDesktopBtn) {
    const paused = state.mode === "paused";
    const pauseAvailable = state.mode === "playing" || paused;
    pauseDesktopBtn.textContent = paused ? "Resume" : pauseAvailable ? "Pause" : "Pause locked";
    pauseDesktopBtn.dataset.shortcut = pauseAvailable ? "P / Esc" : "";
    pauseDesktopBtn.disabled = !pauseAvailable;
    pauseDesktopBtn.classList.toggle("paused", paused);
    const pauseLabel = paused
      ? "Resume game"
      : pauseAvailable
        ? "Pause game"
        : "Pause locked until the run starts";
    pauseDesktopBtn.setAttribute("aria-label", pauseLabel);
    pauseDesktopBtn.title = pauseLabel;
    const hintEl = pauseDesktopBtn.parentElement?.querySelector(".utility-btn-hint");
    if (hintEl) {
      hintEl.innerHTML = paused
        ? "Resume the run with a click or press <kbd>P</kbd> / <kbd>Esc</kbd>"
        : pauseAvailable
          ? "Stop or resume a run with a click or press <kbd>P</kbd> / <kbd>Esc</kbd>"
          : "Start a run to unlock pause and the <kbd>P</kbd> / <kbd>Esc</kbd> shortcut.";
    }
  }

  if (recoveryShortcutCalloutEl) {
    const showRecoveryShortcuts = state.mode === "dead" || state.mode === "gameover";
    recoveryShortcutCalloutEl.classList.toggle("hidden", !showRecoveryShortcuts);
    recoveryShortcutCalloutEl.setAttribute("aria-hidden", showRecoveryShortcuts ? "false" : "true");
  }

  if (audioBtn) {
    const muted = AUDIO.muted;
    const previewAudioLevel = state.mode === "start" || state.mode === "title" ? previewLevel : levelRuntime;
    const musicProfile = levelMusicProfile(previewAudioLevel);
    const audioTheme = levelSelectThemeKey(previewAudioLevel);
    audioBtn.textContent = `${muted ? "🔇" : "🔊"} ${musicProfile.label}`;
    audioBtn.dataset.shortcut = "M";
    audioBtn.dataset.theme = audioTheme;
    audioBtn.classList.toggle("muted", muted);
    audioBtn.setAttribute(
      "aria-label",
      muted ? `Unmute ${musicProfile.description} and sound effects` : `Mute ${musicProfile.description} and sound effects`
    );
    audioBtn.title = muted ? `${musicProfile.label} muted` : `${musicProfile.label} ready`;
    const hintEl = audioBtn.parentElement?.querySelector(".utility-btn-hint");
    if (hintEl) {
      hintEl.textContent = muted
        ? `Click or press M to restore the ${musicProfile.description} and sound effects`
        : `Mute the ${musicProfile.description} and sound effects with one click or press M`;
    }
  }

  ctx.restore();
}

function loop() {
  update();
  render();
  requestAnimationFrame(loop);
}

function setKey(code, value) {
  if (["ArrowLeft", "KeyA"].includes(code)) state.keys.left = value;
  if (["ArrowRight", "KeyD"].includes(code)) state.keys.right = value;
  if (["ArrowUp", "Space", "KeyW"].includes(code)) {
    state.keys.jump = value;
    if (!value) {
      state.jumpHeld = false;
    } else {
      if (!state.jumpHeld) state.jumpHeld = true;
      state.jumpPressedThisFrame = true;
      state.jumpBufferedUntil = Date.now() + JUMP_BUFFER_MS;
      state.lastJumpTapAt = Date.now();
      startBgMusic();
    }
  }
  if (["ArrowDown", "KeyS"].includes(code)) state.keys.down = value;
  if (value) startBgMusic();
}

window.addEventListener("keydown", (e) => {
  if (state.levelSelectOpen) {
    if (e.code === "Escape") {
      closeLevelSelect();
      e.preventDefault();
      return;
    }

    if (e.code === "ArrowLeft" && moveLevelSelectFocus("left")) {
      e.preventDefault();
      return;
    }
    if (e.code === "ArrowRight" && moveLevelSelectFocus("right")) {
      e.preventDefault();
      return;
    }
    if (e.code === "ArrowUp" && moveLevelSelectFocus("up")) {
      e.preventDefault();
      return;
    }
    if (e.code === "ArrowDown" && moveLevelSelectFocus("down")) {
      e.preventDefault();
      return;
    }
    if (e.code === "Home" && moveLevelSelectFocus("home")) {
      e.preventDefault();
      return;
    }
    if (e.code === "End" && moveLevelSelectFocus("end")) {
      e.preventDefault();
      return;
    }
    if (["Enter", "Space"].includes(e.code)) {
      getLevelSelectFocusedButton()?.click();
      e.preventDefault();
      return;
    }
  }

  if (e.code === "KeyM") {
    toggleAudioMute();
    e.preventDefault();
    return;
  }

  if (state.mode === "dead") {
    if (["KeyC", "Enter", "Space"].includes(e.code)) {
      continueRun();
      e.preventDefault();
      return;
    }
    if (["KeyQ", "Escape"].includes(e.code)) {
      quitToStart();
      e.preventDefault();
      return;
    }
  }

  if (state.mode === "gameover") {
    if (["KeyQ", "Enter", "Space", "Escape"].includes(e.code)) {
      quitToStart();
      e.preventDefault();
      return;
    }
  }

  if (state.mode === "paused") {
    if (["KeyP", "Escape"].includes(e.code)) {
      resumeGame();
      e.preventDefault();
      return;
    }
    if (state.pauseMenu === "main") {
      const opts = ["continue", "options"];
      if (["ArrowUp", "KeyW"].includes(e.code)) {
        state.pauseOptionIndex = (state.pauseOptionIndex + opts.length - 1) % opts.length;
        e.preventDefault();
        return;
      }
      if (["ArrowDown", "KeyS"].includes(e.code)) {
        state.pauseOptionIndex = (state.pauseOptionIndex + 1) % opts.length;
        e.preventDefault();
        return;
      }
      if (["KeyC", "Enter", "Space"].includes(e.code)) {
        if ((state.pauseOptionIndex || 0) === 1) {
          state.pauseMenu = "options";
          state.pauseOptionIndex = 0;
        } else {
          resumeGame();
        }
        e.preventDefault();
        return;
      }
      if (e.code === "KeyO") {
        state.pauseMenu = "options";
        state.pauseOptionIndex = 0;
        e.preventDefault();
        return;
      }
    } else if (state.pauseMenu === "options") {
      const opts = ["music", "sfx"];
      if (["ArrowUp", "KeyW"].includes(e.code)) {
        state.pauseOptionIndex = (state.pauseOptionIndex + opts.length - 1) % opts.length;
        e.preventDefault();
        return;
      }
      if (["ArrowDown", "KeyS"].includes(e.code)) {
        state.pauseOptionIndex = (state.pauseOptionIndex + 1) % opts.length;
        e.preventDefault();
        return;
      }
      const delta = (["ArrowLeft", "KeyA"].includes(e.code) ? -5 : 0) + (["ArrowRight", "KeyD"].includes(e.code) ? 5 : 0);
      if (delta !== 0) {
        const key = opts[state.pauseOptionIndex];
        if (key === "music") AUDIO.musicVol = Math.max(0, Math.min(100, AUDIO.musicVol + delta));
        if (key === "sfx") AUDIO.sfxVol = Math.max(0, Math.min(100, AUDIO.sfxVol + delta));
        applyMusicVolume(true);
        e.preventDefault();
        return;
      }
      if (["Enter", "Space"].includes(e.code)) {
        state.pauseMenu = "main";
        e.preventDefault();
        return;
      }
      if (["Escape", "KeyB"].includes(e.code)) {
        state.pauseMenu = "main";
        e.preventDefault();
        return;
      }
    }
    return;
  }

  if (e.code === "KeyP") {
    if (state.mode === "playing") {
      pauseGame();
    } else if (state.mode === "paused") {
      resumeGame();
    }
    e.preventDefault();
    return;
  }

  if (["Space", "Enter", "KeyW", "ArrowUp"].includes(e.code)) {
    if (state.mode === "start") {
      startGame();
      e.preventDefault();
      return;
    }
    if (state.mode === "title") {
      beginLevelPlay();
      e.preventDefault();
      return;
    }
  }

  if (/^Key[A-Z]$/.test(e.code)) {
    state.cheatBuffer = (state.cheatBuffer + e.code.replace("Key", "").toLowerCase()).slice(-12);
    if (state.cheatBuffer.includes("henry")) {
      stopBgMusic();
      playSecretSound();
      openLevelSelect();
      state.cheatBuffer = "";
      return;
    }
  }

  if (state.levelSelectOpen) return;

  if (e.code === "KeyR") {
    resetGame();
    return;
  }

  if (e.code === "Slash") {
    triggerBark();
    e.preventDefault();
  }

  if (["KeyF", "KeyK", "ShiftRight"].includes(e.code)) {
    if (!triggerTunnelDigBoost()) triggerSuperBark();
    e.preventDefault();
  }

  setKey(e.code, true);
  if (["ArrowUp", "ArrowLeft", "ArrowRight", "Space", "ArrowDown"].includes(e.code)) e.preventDefault();
});

window.addEventListener("keyup", (e) => setKey(e.code, false));

function isMobileDevice() {
  return Boolean(
    (window.matchMedia && window.matchMedia("(pointer: coarse)").matches && navigator.maxTouchPoints > 0) ||
      /iPhone|iPad|iPod|Android|Mobile/i.test(navigator.userAgent || "")
  );
}

function isLandscapeOrientation() {
  return window.innerWidth > window.innerHeight;
}

function clearMobileJumpReleaseTimeout() {
  if (!mobileControlState.jumpReleaseTimeout) return;
  window.clearTimeout(mobileControlState.jumpReleaseTimeout);
  mobileControlState.jumpReleaseTimeout = null;
}

function clearMobileCenterTapTimeout() {
  if (!mobileControlState.centerTapTimeout) return;
  window.clearTimeout(mobileControlState.centerTapTimeout);
  mobileControlState.centerTapTimeout = null;
}

function clearMobileCenterHoldTimeout() {
  if (!mobileControlState.centerHoldTimeout) return;
  window.clearTimeout(mobileControlState.centerHoldTimeout);
  mobileControlState.centerHoldTimeout = null;
  mobileControlState.centerHoldTouchId = null;
}

function releaseMobileDigInput() {
  state.keys.down = false;
}

function clearMobileDirectionalInput() {
  mobileControlState.movementSide = null;
  mobileControlState.movementTouchId = null;
  if (state.mode === "paused") return;
  state.keys.left = false;
  state.keys.right = false;
}

function resetMobileTrackedTouches() {
  mobileControlState.activeTouches.clear();
  mobileControlState.movementTouchId = null;
  mobileControlState.movementSide = null;
  clearMobileCenterHoldTimeout();
  releaseMobileDigInput();
}

function getMobileBottomZone(x, y) {
  if (y < window.innerHeight / 2) return null;
  const leftEdge = window.innerWidth * 0.35;
  const rightEdge = window.innerWidth * 0.65;
  if (x < leftEdge) return "left";
  if (x > rightEdge) return "right";
  return "center";
}

function applyMobileDirectionalInput(side) {
  if (!mobileControlState.enabled || !mobileControlState.immersive || state.mode === "paused") {
    clearMobileDirectionalInput();
    return;
  }

  mobileControlState.movementSide = side;
  state.keys.left = side === "left";
  state.keys.right = side === "right";
  if (side === "left") state.dog.facing = -1;
  if (side === "right") state.dog.facing = 1;
}

function getTrackedMobileTouch(touchId) {
  return mobileControlState.activeTouches.get(touchId) || null;
}

function trackMobileTouch(touch) {
  const tracked = {
    id: touch.identifier,
    startX: touch.clientX,
    startY: touch.clientY,
    startAt: Date.now(),
    zone: getMobileBottomZone(touch.clientX, touch.clientY),
    jumpSwipeTriggered: false,
    centerHoldTriggered: false,
  };
  mobileControlState.activeTouches.set(touch.identifier, tracked);
  return tracked;
}

function updateTrackedMobileTouch(tracked, touch) {
  if (!tracked) return null;
  tracked.zone = getMobileBottomZone(touch.clientX, touch.clientY) || tracked.zone;
  tracked.lastX = touch.clientX;
  tracked.lastY = touch.clientY;
  return tracked;
}

function syncMobileMovementTouch() {
  const currentMovementTouch = getTrackedMobileTouch(mobileControlState.movementTouchId);
  if (currentMovementTouch && (currentMovementTouch.zone === "left" || currentMovementTouch.zone === "right")) {
    applyMobileDirectionalInput(currentMovementTouch.zone);
    return;
  }

  const nextMovementTouch = [...mobileControlState.activeTouches.values()]
    .filter((touch) => touch.zone === "left" || touch.zone === "right")
    .sort((a, b) => a.startAt - b.startAt)[0];

  if (!nextMovementTouch) {
    clearMobileDirectionalInput();
    return;
  }

  mobileControlState.movementTouchId = nextMovementTouch.id;
  applyMobileDirectionalInput(nextMovementTouch.zone);
}

function triggerMobileSwipeJump(tracked) {
  if (tracked) tracked.jumpSwipeTriggered = true;
  clearMobileJumpReleaseTimeout();
  handleJumpPress();
  mobileControlState.jumpReleaseTimeout = window.setTimeout(() => {
    handleJumpRelease();
    mobileControlState.jumpReleaseTimeout = null;
  }, 90);
}

function triggerMobileTapJump() {
  clearMobileJumpReleaseTimeout();
  handleJumpPress();
  mobileControlState.jumpReleaseTimeout = window.setTimeout(() => {
    handleJumpRelease();
    mobileControlState.jumpReleaseTimeout = null;
  }, 90);
}

function startMobileCenterHold(tracked) {
  if (!tracked || tracked.zone !== "center") return;
  clearMobileCenterHoldTimeout();
  mobileControlState.centerHoldTouchId = tracked.id;
  mobileControlState.centerHoldTimeout = window.setTimeout(() => {
    const liveTouch = getTrackedMobileTouch(tracked.id);
    if (!liveTouch || liveTouch.zone !== "center" || state.mode !== "playing") return;
    liveTouch.centerHoldTriggered = true;
    state.keys.down = true;
    mobileControlState.centerHoldTimeout = null;
  }, MOBILE_CENTER_HOLD_DIG_MS);
}

async function requestGameFullscreen() {
  if (!mobileControlState.enabled) return false;
  const targetEl = canvas;
  try {
    if (document.fullscreenElement !== targetEl && targetEl.requestFullscreen) {
      await targetEl.requestFullscreen();
      return true;
    }
  } catch (_) {}
  return document.fullscreenElement === targetEl;
}

function syncMobileExperience() {
  mobileControlState.enabled = isMobileDevice();
  mobileControlState.landscape = isLandscapeOrientation();
  mobileControlState.immersive = mobileControlState.enabled && mobileControlState.landscape;

  document.body.classList.toggle("mobile-device", mobileControlState.enabled);
  document.body.classList.toggle("mobile-portrait", mobileControlState.enabled && !mobileControlState.landscape);
  document.body.classList.toggle("mobile-motion-prompt", mobileControlState.enabled && !mobileControlState.landscape);
  document.body.classList.toggle("mobile-immersive", mobileControlState.immersive);

  if (!mobileControlState.immersive) {
    resetMobileTrackedTouches();
    clearMobileDirectionalInput();
    clearMobileJumpReleaseTimeout();
    clearMobileCenterTapTimeout();
    clearMobileCenterHoldTimeout();
    mobileControlState.lastCenterTapAt = 0;
    handleJumpRelease();
    releaseMobileDigInput();
  }

  if (mobileOverlayEl) {
    mobileOverlayEl.classList.toggle("hidden", !mobileControlState.enabled || mobileControlState.landscape);
  }
  if (mobileOverlayTitleEl) {
    mobileOverlayTitleEl.textContent = "Rotate to landscape";
  }
  if (mobileOverlayMessageEl) {
    mobileOverlayMessageEl.textContent = mobileControlState.landscape
      ? ""
      : "Turn your phone sideways. Bottom left/right move Henry, tap or swipe up there to jump, hold the bottom center to dig, and double tap there for the HENRY portal on the start screen.";
  }
  if (mobileMotionBtn) {
    mobileMotionBtn.classList.add("hidden");
  }

  if (mobileControlState.enabled && mobileControlState.immersive && mobileControlsPanelEl) {
    setTouchControlsVisible(false, false);
  }
}

function handleJumpPress() {
  startBgMusic();
  if (state.mode === "start") {
    startGame();
  } else if (state.mode === "title") {
    beginLevelPlay();
  } else if (state.mode === "won" || state.mode === "lost" || state.mode === "gameover") {
    resetGame();
  } else if (state.mode === "dead") {
    continueRun();
  } else if (state.mode === "paused") {
    confirmPauseSelection();
  } else {
    state.keys.jump = true;
    state.jumpHeld = true;
    noteJumpTap();
  }
}

function handleJumpRelease() {
  state.keys.jump = false;
  state.jumpHeld = false;
}

function handleMobilePortalAction() {
  if (state.levelSelectOpen) return;
  startBgMusic();
  openLevelSelect();
}

function handleSingleBarkAction() {
  startBgMusic();
  if (state.mode === "dead") {
    quitToStart();
    return;
  }
  if (state.mode === "paused") {
    cyclePauseSelection(1);
    return;
  }
  if (state.mode === "playing") triggerBark();
}

function handleSuperBarkAction() {
  startBgMusic();
  if (state.mode === "start" || state.mode === "title") {
    handleMobilePortalAction();
    return;
  }
  if (state.mode === "dead") {
    quitToStart();
    return;
  }
  if (state.mode === "paused") {
    cyclePauseSelection(1);
    return;
  }
  if (triggerTunnelDigBoost()) return;
  triggerSuperBark();
}

async function primeMobileExperience() {
  unlockAudio();
  if (!mobileControlState.enabled) return;
  syncMobileExperience();
  if (!mobileControlState.landscape) return;
  await requestGameFullscreen();
  syncMobileExperience();
}

function eventToCanvasPoint(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((clientX - rect.left) / rect.width) * canvas.width,
    y: ((clientY - rect.top) / rect.height) * canvas.height,
  };
}

function isInsideMobilePortalChip(clientX, clientY) {
  if (!mobilePortalChipVisible()) return false;
  const point = eventToCanvasPoint(clientX, clientY);
  const rect = getMobilePortalChipRect();
  return point.x >= rect.x && point.x <= rect.x + rect.w && point.y >= rect.y && point.y <= rect.y + rect.h;
}

canvas.addEventListener("pointerdown", (e) => {
  unlockAudio();
  if (mobileControlState.enabled && e.pointerType !== "mouse") primeMobileExperience();
  if (mobileControlState.enabled && e.pointerType !== "mouse" && isInsideMobilePortalChip(e.clientX, e.clientY)) {
    e.preventDefault();
    handleMobilePortalAction();
    return;
  }
  startBgMusic();
  if (state.mode === "start") {
    e.preventDefault();
    startGame();
  } else if (state.mode === "title") {
    e.preventDefault();
    beginLevelPlay();
  }
});

function setMobileButtonPressed(id, pressed, pulseMs = 0) {
  const btn = document.getElementById(id);
  if (!btn) return;
  const item = btn.closest(".mobile-control-item");

  if (btn._mobilePressedTimeout) {
    window.clearTimeout(btn._mobilePressedTimeout);
    btn._mobilePressedTimeout = null;
  }

  const apply = (active) => {
    btn.classList.toggle("is-held", active);
    item?.classList.toggle("is-held", active);
  };

  apply(pressed);
  if (pressed && pulseMs > 0) {
    btn._mobilePressedTimeout = window.setTimeout(() => {
      apply(false);
      btn._mobilePressedTimeout = null;
    }, pulseMs);
  }
}

function bindHoldButton(id, onPress, onRelease = onPress) {
  const btn = document.getElementById(id);
  btn.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    setMobileButtonPressed(id, true);
    onPress(true);
  });
  const stop = (e) => {
    e.preventDefault();
    setMobileButtonPressed(id, false);
    onRelease(false);
  };
  btn.addEventListener("pointerup", stop);
  btn.addEventListener("pointerleave", stop);
  btn.addEventListener("pointercancel", stop);
}

bindHoldButton(
  "btn-left",
  (v) => {
    if (state.mode === "paused") {
      if (!v) return;
      if (state.pauseMenu === "options") adjustPauseOption(-5);
      else cyclePauseSelection(-1);
      return;
    }
    state.keys.left = v;
  },
  () => {
    if (state.mode !== "paused") state.keys.left = false;
  }
);
bindHoldButton(
  "btn-right",
  (v) => {
    if (state.mode === "paused") {
      if (!v) return;
      if (state.pauseMenu === "options") adjustPauseOption(5);
      else cyclePauseSelection(1);
      return;
    }
    state.keys.right = v;
  },
  () => {
    if (state.mode !== "paused") state.keys.right = false;
  }
);

const jumpBtn = document.getElementById("btn-jump");
jumpBtn.addEventListener("pointerdown", (e) => {
  e.preventDefault();
  setMobileButtonPressed("btn-jump", true);
  handleJumpPress();
});
jumpBtn.addEventListener("pointerup", (e) => {
  setMobileButtonPressed("btn-jump", false);
  handleJumpRelease(e);
});
jumpBtn.addEventListener("pointerleave", (e) => {
  setMobileButtonPressed("btn-jump", false);
  handleJumpRelease(e);
});
jumpBtn.addEventListener("pointercancel", (e) => {
  setMobileButtonPressed("btn-jump", false);
  handleJumpRelease(e);
});

const barkBtn = document.getElementById("btn-bark");
if (barkBtn) {
  barkBtn.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    setMobileButtonPressed("btn-bark", true, 180);
    handleSuperBarkAction();
  });
}

const digBtn = document.getElementById("btn-dig");
if (digBtn) {
  bindHoldButton(
    "btn-dig",
    (v) => {
      if (state.mode === "playing") state.keys.down = v;
    },
    () => releaseMobileDigInput()
  );
}

const henryBtn = document.getElementById("btn-henry");
if (henryBtn) {
  henryBtn.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    setMobileButtonPressed("btn-henry", true, 220);
    handleMobilePortalAction();
  });
}

const pauseBtn = document.getElementById("btn-pause");
if (pauseBtn) {
  pauseBtn.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    setMobileButtonPressed("btn-pause", true, 220);
    startBgMusic();
    if (state.mode === "playing") {
      pauseGame();
    } else if (state.mode === "paused") {
      resumeGame();
    }
  });
}

if (startDesktopBtn) {
  startDesktopBtn.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    startBgMusic();
    if (state.mode === "start") {
      startGame();
    } else if (state.mode === "title") {
      beginLevelPlay();
    } else if (state.mode === "paused") {
      resumeGame();
    } else if (state.mode === "dead") {
      continueRun();
    } else if (state.mode === "gameover") {
      resetGame();
    }
  });
}

if (pauseDesktopBtn) {
  pauseDesktopBtn.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    startBgMusic();
    if (state.mode === "playing") {
      pauseGame();
    } else if (state.mode === "paused") {
      resumeGame();
    }
  });
}

function prefersTouchControlsOpenByDefault() {
  return Boolean(
    (window.matchMedia && window.matchMedia("(pointer: coarse)").matches) ||
      navigator.maxTouchPoints > 0
  );
}

function setTouchControlsVisible(visible, persist = true) {
  if (!mobileControlsPanelEl || !touchControlsBtn) return;

  mobileControlsPanelEl.classList.toggle("is-collapsed", !visible);
  mobileControlsPanelEl.setAttribute("aria-hidden", visible ? "false" : "true");
  touchControlsBtn.textContent = visible ? "📱 Hide touch controls" : "📱 Show touch controls";
  touchControlsBtn.classList.toggle("active", visible);
  touchControlsBtn.setAttribute("aria-label", visible ? "Hide touch controls" : "Show touch controls");
  touchControlsBtn.setAttribute("aria-expanded", visible ? "true" : "false");
  const hintEl = touchControlsBtn.parentElement?.querySelector(".utility-btn-hint");
  if (hintEl) {
    hintEl.textContent = visible
      ? "Hide the on-screen controls again once you are done with mouse/touch play."
      : "Reveal the on-screen controls when you want mouse/touch play.";
  }

  if (persist) {
    try {
      window.localStorage.setItem(TOUCH_CONTROLS_STORAGE_KEY, visible ? "shown" : "hidden");
    } catch (_) {}
  }
}

function initTouchControlsVisibility() {
  if (!mobileControlsPanelEl || !touchControlsBtn) return;

  let visible = prefersTouchControlsOpenByDefault();
  try {
    const saved = window.localStorage.getItem(TOUCH_CONTROLS_STORAGE_KEY);
    if (saved === "shown") visible = true;
    if (saved === "hidden") visible = false;
  } catch (_) {}

  setTouchControlsVisible(visible, false);
}

function noteJumpTap() {
  state.jumpPressedThisFrame = true;
  state.lastJumpTapAt = Date.now();
  state.jumpBufferedUntil = Date.now() + JUMP_BUFFER_MS;
}

if (closeLevelSelectEl) {
  closeLevelSelectEl.addEventListener("click", () => closeLevelSelect());
}
if (henryProgressJumpBtn) {
  henryProgressJumpBtn.addEventListener("click", () => {
    const idx = Math.max(0, Math.min(LEVELS.length - 1, state.currentLevelIndex || 0));
    const level = LEVELS[idx];
    closeLevelSelect();
    loadLevel(idx, { resetLives: true });
    statusEl.textContent = `${level?.name || `Level ${idx + 1}`}: Quick jump activated.`;
  });
}
if (levelSelectEl) {
  levelSelectEl.addEventListener("click", (e) => {
    if (e.target === levelSelectEl) closeLevelSelect();
  });
}

function startAfterFonts() {
  const begin = () => {
    goToStartScreen();
    loop();
  };
  if (document.fonts && document.fonts.load) {
    document.fonts
      .load("16px 'Roboto'")
      .then(() => document.fonts.ready)
      .then(begin)
      .catch(begin);
  } else {
    begin();
  }
}

if (fullscreenBtn) {
  const targetEl = canvas;
  const updateLabel = () => {
    const active = document.fullscreenElement === targetEl;
    fullscreenBtn.textContent = active ? "⛶ Exit Fullscreen" : "⛶ Play Fullscreen";
    fullscreenBtn.dataset.shortcut = active ? "Esc" : "";
    const fullscreenLabel = active ? "Exit fullscreen" : "Enter fullscreen";
    fullscreenBtn.setAttribute("aria-label", fullscreenLabel);
    fullscreenBtn.title = active ? "Press Esc or click to exit fullscreen" : "Click to enter fullscreen";
    const hintEl = fullscreenBtn.parentElement?.querySelector(".utility-btn-hint");
    if (hintEl) {
      hintEl.innerHTML = active
        ? "Fullscreen active — press <kbd>Esc</kbd> or click to exit."
        : "Stretch the playfield for distraction-free play, then press <kbd>Esc</kbd> to exit.";
    }
    document.body.classList.toggle("fullscreen-mode", active);
    syncMobileExperience();
  };
  updateLabel();
  fullscreenBtn.addEventListener("click", async () => {
    try {
      if (document.fullscreenElement !== targetEl) {
        await targetEl.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (_) {}
    updateLabel();
  });
  document.addEventListener("fullscreenchange", updateLabel);
}

if (touchControlsBtn) {
  touchControlsBtn.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    const visible = mobileControlsPanelEl?.classList.contains("is-collapsed");
    setTouchControlsVisible(visible);
  });
}

if (hideTouchControlsBtn) {
  hideTouchControlsBtn.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    setTouchControlsVisible(false);
  });
}

if (mobileMotionBtn) {
  mobileMotionBtn.addEventListener("click", async () => {
    unlockAudio();
    await primeMobileExperience();
  });
}

canvas.addEventListener(
  "touchstart",
  async (e) => {
    unlockAudio();
    if (!mobileControlState.enabled) return;
    if (!mobileControlState.immersive) {
      await primeMobileExperience();
    }
    if (!mobileControlState.immersive) return;
    if (!e.changedTouches.length) return;
    e.preventDefault();

    for (const touch of e.changedTouches) {
      const tracked = trackMobileTouch(touch);
      if ((tracked.zone === "left" || tracked.zone === "right") && mobileControlState.movementTouchId == null) {
        mobileControlState.movementTouchId = tracked.id;
      }
      if (tracked.zone === "center") {
        startMobileCenterHold(tracked);
      }
    }

    syncMobileMovementTouch();
  },
  { passive: false }
);

canvas.addEventListener(
  "touchmove",
  (e) => {
    if (!mobileControlState.enabled || !mobileControlState.immersive) return;
    if (!e.changedTouches.length) return;
    e.preventDefault();

    for (const touch of e.changedTouches) {
      const tracked = updateTrackedMobileTouch(getTrackedMobileTouch(touch.identifier), touch);
      if (!tracked || (tracked.zone !== "left" && tracked.zone !== "right" && tracked.zone !== "center")) continue;

      const deltaY = touch.clientY - tracked.startY;
      if ((tracked.zone === "left" || tracked.zone === "right") && !tracked.jumpSwipeTriggered && deltaY <= -MOBILE_SWIPE_JUMP_MIN) {
        triggerMobileSwipeJump(tracked);
      }
      if (tracked.zone !== "center" && mobileControlState.centerHoldTouchId === tracked.id) {
        clearMobileCenterHoldTimeout();
      }
    }

    syncMobileMovementTouch();
  },
  { passive: false }
);

canvas.addEventListener(
  "touchend",
  (e) => {
    if (!mobileControlState.enabled || !mobileControlState.immersive) return;
    if (!e.changedTouches.length) return;
    e.preventDefault();

    for (const touch of e.changedTouches) {
      const tracked = getTrackedMobileTouch(touch.identifier);
      if (!tracked) continue;

      const touchDuration = Date.now() - tracked.startAt;
      const deltaX = touch.clientX - tracked.startX;
      const deltaY = touch.clientY - tracked.startY;
      const isTap = Math.abs(deltaX) < 20 && Math.abs(deltaY) < 20 && touchDuration <= MOBILE_TAP_JUMP_MAX_MS;

      if (mobileControlState.centerHoldTouchId === touch.identifier) {
        clearMobileCenterHoldTimeout();
      }

      if (tracked.zone === "left" || tracked.zone === "right") {
        if (isTap && !tracked.jumpSwipeTriggered) {
          triggerMobileTapJump();
        }
      } else if (tracked.zone === "center") {
        if (tracked.centerHoldTriggered) {
          releaseMobileDigInput();
        } else if (isTap) {
          const now = Date.now();
          if (now - mobileControlState.lastCenterTapAt <= MOBILE_DOUBLE_TAP_MS) {
            clearMobileCenterTapTimeout();
            mobileControlState.lastCenterTapAt = 0;
            handleSuperBarkAction();
          } else {
            mobileControlState.lastCenterTapAt = now;
            clearMobileCenterTapTimeout();
            mobileControlState.centerTapTimeout = window.setTimeout(() => {
              handleSingleBarkAction();
              mobileControlState.centerTapTimeout = null;
              mobileControlState.lastCenterTapAt = 0;
            }, MOBILE_DOUBLE_TAP_MS);
          }
        }
      }

      mobileControlState.activeTouches.delete(touch.identifier);
      if (mobileControlState.movementTouchId === touch.identifier) {
        mobileControlState.movementTouchId = null;
      }
    }

    syncMobileMovementTouch();
  },
  { passive: false }
);

canvas.addEventListener(
  "touchcancel",
  (e) => {
    if (!mobileControlState.enabled) return;
    clearMobileJumpReleaseTimeout();
    clearMobileCenterHoldTimeout();
    handleJumpRelease();
    releaseMobileDigInput();
    if (e.changedTouches.length) {
      for (const touch of e.changedTouches) {
        mobileControlState.activeTouches.delete(touch.identifier);
        if (mobileControlState.movementTouchId === touch.identifier) {
          mobileControlState.movementTouchId = null;
        }
      }
    }
    syncMobileMovementTouch();
    e.preventDefault();
  },
  { passive: false }
);

window.addEventListener("resize", syncMobileExperience);
window.addEventListener("orientationchange", syncMobileExperience);

if (audioBtn) {
  audioBtn.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    toggleAudioMute();
  });
}

syncMobileExperience();
initTouchControlsVisibility();
startAfterFonts();
