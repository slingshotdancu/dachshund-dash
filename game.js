const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const statusEl = document.getElementById("status");
const livesEl = document.getElementById("lives"); // shows lives/continues as dog heads
const levelSelectEl = document.getElementById("level-select");
const levelListEl = document.getElementById("level-list");
const closeLevelSelectEl = document.getElementById("close-level-select");
const fullscreenBtn = document.getElementById("btn-fullscreen");

const bgMusic = { audio: null, started: false };
let capeAudio = null;
let tornadoAudio = null;
let dieAudio = null;
let capeAmbientAudio = null;

const MAIN_MUSIC = "assets/Henry.wav";
const BOSS_MUSIC = "assets/BossLevels.wav";
const LOGO_IMG = "assets/henry/middle.jpg";
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

const AUDIO = {
  musicVol: 60, // 0-100
  sfxVol: 70, // 0-100
  musicPausedFactor: 0.25,
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

function intersects(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function isEnemyAlive(enemy) {
  return !enemy.dead && !enemy.dying;
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
    water: true,
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

function renderLives() {
  if (!livesEl) return;
  const head = "🐶";
  livesEl.textContent = `${head.repeat(Math.max(0, state.levelRespawnsLeft))}`;
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
  statusEl.textContent = "Press Space/Jump or tap to start Dachshund Dash.";
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
  levelListEl.innerHTML = "";

  LEVELS.forEach((lvl, idx) => {
    const btn = document.createElement("button");
    btn.className = "level-btn";
    btn.textContent = `${idx + 1}`;
    btn.addEventListener("click", () => {
      closeLevelSelect();
      loadLevel(idx, { resetLives: true });
      statusEl.textContent = `${lvl.name}: Cheat start activated.`;
    });
    levelListEl.appendChild(btn);
  });
}

function closeLevelSelect() {
  if (!levelSelectEl) return;
  state.levelSelectOpen = false;
  levelSelectEl.classList.add("hidden");
  levelSelectEl.style.backgroundImage = "";
  setBgVolume(0.18);
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

function musicVolume(paused = false) {
  const maxVol = 0.3;
  const base = (AUDIO.musicVol / 100) * maxVol;
  return paused ? base * AUDIO.musicPausedFactor : base;
}

function applyMusicVolume(paused = false) {
  if (bgMusic.audio) bgMusic.audio.volume = musicVolume(paused);
}

function startBgMusic() {
  if (capeAmbientAudio) return; // mute bg music while cape ambient is active
  if (bgMusic.started && bgMusic.audio && !bgMusic.audio.paused) return;
  try {
    const audio = bgMusic.audio || new Audio(MAIN_MUSIC);
    audio.loop = true;
    audio.currentTime = 0;
    applyMusicVolume(state.mode === "paused");
    audio.play().then(() => {
      bgMusic.audio = audio;
      bgMusic.started = true;
      applyMusicVolume(state.mode === "paused");
    }).catch(() => {});
  } catch (_) {}
}

function setBgTrack(src) {
  stopBgMusic();
  try {
    bgMusic.audio = new Audio(src);
    bgMusic.started = false;
    startBgMusic();
  } catch (_) {}
}

function stopBgMusic() {
  try {
    if (bgMusic.audio) {
      bgMusic.audio.pause();
      bgMusic.audio.currentTime = 0;
    }
  } catch (_) {}
  bgMusic.started = false;
}

function setBgVolume(vol) {
  if (bgMusic.audio) bgMusic.audio.volume = AUDIO.musicMuted ? 0 : vol;
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

function tone(freq = 440, ms = 120, type = "square", vol = 0.03, slideTo = null) {
  try {
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
  try {
    if (bgMusic.audio) bgMusic.audio.pause();
    const audio = new Audio("assets/Secret.wav");
    audio.volume = sfxVolume(0.7);
    audio.play().catch(() => {});
  } catch (_) {}
}

function playBoneSound() {
  try {
    const audio = new Audio("assets/Bone.wav");
    audio.volume = sfxVolume(0.6);
    audio.play().catch(() => {});
  } catch (_) {}
}

function playJumpSound() {
  try {
    if (AUDIO.sfxMuted) return;
    const audio = new Audio("assets/Jump.wav");
    audio.volume = 0.55;
    audio.play().catch(() => {});
  } catch (_) {}
}

function playAirJumpSound() {
  try {
    const audio = new Audio("assets/Jump2.wav");
    audio.volume = sfxVolume(0.55);
    audio.play().catch(() => {});
  } catch (_) {}
}

function playKillSound() {
  try {
    const audio = new Audio("assets/Kill.wav");
    audio.volume = sfxVolume(0.55);
    audio.play().catch(() => {});
  } catch (_) {}
}

function stopDieSound() {
  try {
    if (dieAudio) {
      dieAudio.pause();
      dieAudio.currentTime = 0;
    }
  } catch (_) {}
  dieAudio = null;
}

function playDieSound() {
  try {
    stopDieSound();
    stopBgMusic();
    stopCapeSound();
    stopTornadoSound();
    const audio = new Audio("assets/Die.wav");
    audio.volume = sfxVolume(0.65);
    audio.play().catch(() => {});
    dieAudio = audio;
  } catch (_) {}
}

function sfxVolume(base = 1) {
  return base * (AUDIO.sfxVol / 100);
}

function playHeartSound() {
  try {
    const audio = new Audio("assets/Heart.wav");
    audio.volume = sfxVolume(0.55);
    audio.play().catch(() => {});
  } catch (_) {}
}

function playSneezeSound() {
  try {
    const audio = new Audio("assets/Sneeze.wav");
    audio.volume = sfxVolume(0.6);
    audio.play().catch(() => {});
  } catch (_) {}
}

function playPauseEnterSound() {
  try {
    const audio = new Audio("assets/pause1.wav");
    audio.volume = sfxVolume(0.6);
    audio.play().catch(() => {});
  } catch (_) {}
}

function playPauseExitSound() {
  try {
    const audio = new Audio("assets/pause2.wav");
    audio.volume = sfxVolume(0.6);
    audio.play().catch(() => {});
  } catch (_) {}
}

function playShortBarkSound() {
  try {
    const audio = new Audio("assets/Bark.wav");
    audio.volume = sfxVolume(0.7);
    audio.play().catch(() => {});
  } catch (_) {}
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
  try {
    const audio = new Audio("assets/Superbark.wav");
    audio.volume = sfxVolume(0.65);
    audio.play().catch(() => {});
  } catch (_) {}
}

function stopCapeSound() {
  try {
    if (capeAudio) {
      capeAudio.pause();
      capeAudio.currentTime = 0;
    }
  } catch (_) {}
  capeAudio = null;
}

function stopTornadoSound() {
  try {
    if (tornadoAudio) {
      tornadoAudio.pause();
      tornadoAudio.currentTime = 0;
    }
  } catch (_) {}
  tornadoAudio = null;
}

function playTornadoSound() {
  try {
    if (tornadoAudio) return;
    const audio = new Audio("assets/Tornado.wav");
    audio.loop = true;
    audio.volume = sfxVolume(0.55);
    audio.play().then(() => {
      tornadoAudio = audio;
    }).catch(() => {});
  } catch (_) {}
}

function stopCapeAmbient() {
  try {
    if (capeAmbientAudio) {
      capeAmbientAudio.pause();
      capeAmbientAudio.currentTime = 0;
    }
  } catch (_) {}
  capeAmbientAudio = null;
}

function playCapeAmbient() {
  try {
    stopCapeAmbient();
    stopBgMusic();
    const audio = new Audio("assets/water.wav");
    audio.loop = true;
    audio.volume = sfxVolume(0.35);
    audio.play().catch(() => {});
    capeAmbientAudio = audio;
  } catch (_) {}
}

function playCapeSound() {
  try {
    stopCapeSound();
    const audio = new Audio("assets/Supergrowl.wav");
    audio.volume = sfxVolume(0.55);
    audio.play().catch(() => {});
    capeAudio = audio;
  } catch (_) {}
}

function playLevelClearSound() {
  try {
    const src = "assets/Superbark.wav";
    const playChain = (remaining) => {
      if (remaining <= 0) return;
      const audio = new Audio(src);
      audio.volume = sfxVolume(0.6);
      audio.onended = () => playChain(remaining - 1);
      audio.play().catch(() => {});
    };
    playChain(2);
  } catch (_) {}
}

function resolvePlayerPenetration(level) {
  const dog = state.dog;
  for (const p of level.platforms) {
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
      statusEl.textContent = `${reasonText} GAME OVER. Press Q to restart.`;
    } else {
      state.mode = "dead";
      state.deathAt = now;
      playDieSound();
      statusEl.textContent = `${reasonText} You fainted. Press C to continue (${state.levelRespawnsLeft} left) or Q to quit.`;
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
    statusEl.textContent = "GAME OVER. Press Q to restart.";
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
  try {
    const audio = new Audio("assets/hit.wav");
    audio.volume = sfxVolume(0.65);
    audio.play().catch(() => {});
  } catch (_) {}
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
    enemies: level.enemies.map((e) => ({ ...e, dying: false, dead: false, vx: 0, vy: 0 })),
    spikes: level.spikes.map((s) => ({ ...s })),
    platforms: level.platforms.map((p) => ({ ...p })),
    finishFlag: { ...level.finishFlag },
    boss,
    sirens: (level.sirens || []).map((s) => ({ ...s })),
    toys: (level.toys || []).map((t) => ({ ...t })),
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

function loadLevel(index, options = {}) {
  const { resetLives = false, preserveRespawns = false } = options;

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
  const bossHint = levelRuntime.boss ? ` Defeat ${levelRuntime.boss.name} before exiting.` : "";
  const musicSrc = levelRuntime.boss ? BOSS_MUSIC : MAIN_MUSIC;
  setBgTrack(musicSrc);

  statusEl.textContent = `${levelRuntime.name}: Collect ${state.totalBones} bones and reach the flag!${bossHint}`;
}

function startGame() {
  resetGame();
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
      state.mode = "playing";
      const bossHint = levelRuntime.boss ? ` • BOSS LEVEL: ${levelRuntime.boss.name}` : "";
      statusEl.textContent = `${levelRuntime.name}: Collect ${state.totalBones} bones and reach the flag!${bossHint}`;
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

  if (Date.now() >= state.hitControlLockUntil) {
    dog.vx = 0;
    if (state.keys.left) {
      dog.vx = -MOVE_SPEED;
      dog.facing = -1;
    }
    if (state.keys.right) {
      dog.vx = MOVE_SPEED;
      dog.facing = 1;
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
  if (!capeActive && capeAmbientAudio) {
    stopCapeAmbient();
    startBgMusic();
  }

  const hasBufferedJump = now <= state.jumpBufferedUntil;
  const canUseGroundJump = dog.onGround || (now - state.lastGroundedAt) <= COYOTE_TIME_MS;
  if (!capeActive && hasBufferedJump && canUseGroundJump && now >= state.hitControlLockUntil) {
    dog.vy = JUMP_VELOCITY;
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
  if (
    !dog.onGround &&
    newJumpTap &&
    state.airJumpsUsed < 1 &&
    nearApex
  ) {
    dog.vy = JUMP_VELOCITY;
    state.airJumpsUsed += 1;
    state.lastAirJumpConsumedAt = state.lastJumpTapAt;
    state.superJumpUsed = true; // prevent super-jump float chaining
    state.superJumpFloatUntil = 0;
    playAirJumpSound();
    statusEl.textContent = `${level.name}: Double jump!`;
  }

  // Super jump: keep holding jump to trigger a second, stronger lift while rising.
  if (!capeActive && state.keys.jump && state.jumpHeld && !dog.onGround && !state.superJumpUsed) {
    const heldLongEnough = state.jumpHoldStartedAt && (Date.now() - state.jumpHoldStartedAt) >= SUPER_JUMP_MIN_ASCENT_MS;
    if (heldLongEnough && dog.vy < 0) {
      dog.vy += SUPER_JUMP_BOOST;
      state.superJumpUsed = true;
      state.superJumpFloatUntil = Date.now() + SUPER_JUMP_FLOAT_MS;
      statusEl.textContent = `${level.name}: Super Jump!`;
    }
  }

  if (capeActive) {
    if (state.keys.jump) dog.vy -= CAPE_LIFT;
    if (state.keys.down) dog.vy += CAPE_DESCEND;
    dog.vy += GRAVITY * 0.35;
    dog.vy = Math.max(CAPE_MAX_RISE, Math.min(7, dog.vy));
  } else {
    const grav = Date.now() < state.superJumpFloatUntil ? GRAVITY * SUPER_JUMP_FLOAT_GRAVITY_FACTOR : GRAVITY;
    dog.vy += grav;
  }

  dog.x += dog.vx;
  dog.x = Math.max(0, Math.min(level.worldWidth - dog.w, dog.x));

  dog.y += dog.vy;
  dog.onGround = false;

  for (const p of level.platforms) {
    const wasAbove = dog.y + dog.h - dog.vy <= p.y;
    if (intersects(dog, p) && dog.vy >= 0 && wasAbove) {
      dog.y = p.y - dog.h;
      dog.vy = 0;
      dog.onGround = true;
      state.lastGroundedAt = now;
      state.superJumpUsed = false;
    }
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

  ctx.fillStyle = "#9dd59f";
  for (let i = 0; i < 12; i++) {
    const x = i * 320 - cam * 0.35;
    ctx.beginPath();
    ctx.arc(x + 100, 440, 170, Math.PI, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = "#6db77d";
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
  ctx.fillStyle = "#7f5640";
  roundedRect(p.x, p.y, p.w, p.h, radius);
  ctx.fill();
  ctx.fillStyle = "#4e3529";
  roundedRect(p.x, p.y + p.h - 10, p.w, 12, Math.max(4, radius * 0.6));
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.12)";
  roundedRect(p.x + 6, p.y + 4, Math.max(0, p.w - 12), Math.max(6, p.h * 0.32), Math.max(3, radius * 0.4));
  ctx.fill();
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
  ctx.fillStyle = isDying ? "#4c2525" : "#6f2f2f";
  ctx.fillRect(e.x, e.y, e.w, e.h);
  ctx.fillStyle = "#d6a574";
  ctx.fillRect(e.x + 8, e.y + 8, e.w - 16, 10);
  if (!isDying) {
    ctx.fillStyle = "#fff";
    ctx.fillRect(e.x + (e.dir > 0 ? 24 : 8), e.y + 8, 5, 5);
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
  ctx.fillStyle = "#ddd";
  ctx.fillRect(flag.x, flag.y, 4, flag.h);
  const level = levelRuntime;
  const bossDone = !level.boss || level.boss.dead;
  const canExit = state.bonesCollected === state.totalBones && bossDone;
  ctx.fillStyle = canExit ? "#4cff88" : "#f6d365";
  ctx.beginPath();
  ctx.moveTo(flag.x + 4, flag.y + 5);
  ctx.lineTo(flag.x + 40, flag.y + 16);
  ctx.lineTo(flag.x + 4, flag.y + 28);
  ctx.closePath();
  ctx.fill();
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

function drawPauseSummaryCard(level) {
  const cooldownLeft = Math.max(0, state.combat.barkCooldownUntil - Date.now());
  const capeLeft = Math.max(0, state.capeUntil - Date.now());
  const cardW = 370;
  const cardH = 120;
  const x = canvas.width / 2 - cardW / 2;
  const y = canvas.height / 2 + 42;

  ctx.save();
  ctx.fillStyle = "rgba(7, 18, 36, 0.82)";
  ctx.strokeStyle = "rgba(159, 229, 255, 0.32)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(x, y, cardW, cardH, 16);
  ctx.fill();
  ctx.stroke();

  ctx.textAlign = "left";
  ctx.fillStyle = "#f8fdff";
  ctx.font = "bold 18px 'Roboto', system-ui";
  ctx.fillText(`${level.name} snapshot`, x + 16, y + 26);

  ctx.font = "15px 'Roboto', system-ui";
  ctx.fillStyle = "#d9fbff";
  ctx.fillText(`Bones: ${state.bonesCollected}/${state.totalBones}`, x + 16, y + 52);
  ctx.fillText(`Lives: ${state.lives}/${MAX_LIVES} • Continues: ${state.levelRespawnsLeft}`, x + 16, y + 74);

  const barkText = cooldownLeft > 0 ? `recharging ${Math.ceil(cooldownLeft / 1000)}s` : "ready";
  const capeText = capeLeft > 0 ? `active ${Math.ceil(capeLeft / 1000)}s` : "inactive";
  ctx.fillText(`Super Bark: ${barkText}`, x + 16, y + 98);
  ctx.fillText(`Cape: ${capeText}`, x + 188, y + 98);
  ctx.restore();
}

function drawLogo(x, y, scale = 0.5) {
  const img = getImage(LOGO_IMG);
  if (!img || !img.complete || !img.naturalWidth) return;
  const w = img.naturalWidth * scale;
  const h = img.naturalHeight * scale;
  ctx.drawImage(img, x - w / 2, y - h / 2, w, h);
}

function drawOverlay() {
  if (state.mode === "playing") return;

  if (state.mode === "start") {
    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, "#0a0f1e");
    grad.addColorStop(1, "#0f1c35");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawLogo(canvas.width / 2, canvas.height / 2 - 30, 0.35);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 48px 'Flubby', 'Roboto', system-ui";
    ctx.textAlign = "center";
    ctx.fillText("Dachshund Dash", canvas.width / 2, canvas.height / 2 + 60);
    ctx.font = "20px 'Roboto', 'Roboto', system-ui";
    ctx.fillText("Guide the long-haired dachshund to the flag.", canvas.width / 2, canvas.height / 2 + 92);
    ctx.fillStyle = "#9fe5ff";
    ctx.fillText("Press Space/Jump or tap to start", canvas.width / 2, canvas.height / 2 + 126);
    drawCenteredChipRow(canvas.height / 2 + 154, ["Move: A/D or ←/→", "Jump: W / ↑ / Space", "Bark: F / K / Shift"], {
      font: "15px 'Roboto', system-ui",
      paddingX: 12,
      height: 30,
      gap: 10,
      bg: "rgba(9, 22, 44, 0.82)",
      border: "rgba(159, 229, 255, 0.45)",
      color: "#f8fdff",
    });
    drawCenteredChipRow(canvas.height / 2 + 192, ["Restart: R", "Pause: Esc", "Touch: on-screen buttons"], {
      font: "15px 'Roboto', system-ui",
      paddingX: 12,
      height: 30,
      gap: 10,
      bg: "rgba(17, 34, 64, 0.8)",
      border: "rgba(121, 225, 255, 0.3)",
      color: "#dff8ff",
    });
    ctx.textAlign = "start";
    return;
  }

  if (state.mode === "title") {
    ctx.fillStyle = "rgba(0, 0, 0, 0.38)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#fff";
    ctx.font = "bold 52px 'Flubby', 'Roboto', system-ui";
    ctx.textAlign = "center";
    ctx.fillText(levelRuntime.name, canvas.width / 2, canvas.height / 2 - 8);
    ctx.font = "22px 'Roboto', 'Roboto', system-ui";
    const subtitle = levelRuntime.boss ? `Boss encounter: ${levelRuntime.boss.name}` : "Get ready...";
    ctx.fillText(subtitle, canvas.width / 2, canvas.height / 2 + 28);

    const badges = levelObjectiveBadges(levelRuntime);
    if (badges.length) {
      const chipGap = 10;
      ctx.font = "16px 'Roboto', system-ui";
      const chipWidths = badges.map((badge) => ctx.measureText(badge).width + 24);
      const totalWidth = chipWidths.reduce((sum, width) => sum + width, 0) + chipGap * Math.max(0, badges.length - 1);
      let chipX = canvas.width / 2 - totalWidth / 2;
      const chipY = canvas.height / 2 + 52;
      badges.forEach((badge, index) => {
        const isBossBadge = levelRuntime.boss && badge.startsWith("boss:");
        const bg = isBossBadge ? "rgba(78, 27, 17, 0.88)" : "rgba(9, 22, 44, 0.82)";
        const border = isBossBadge ? "rgba(255, 189, 122, 0.58)" : "rgba(159, 229, 255, 0.45)";
        chipX += drawInfoChip(chipX, chipY, badge, { bg, border });
        chipX += chipGap;
      });
    }

    ctx.font = "18px 'Roboto', 'Roboto', system-ui";
    ctx.fillStyle = "#d9fbff";
    ctx.fillText("Objective cards now preview what each level throws at you.", canvas.width / 2, canvas.height / 2 + 108);
    ctx.textAlign = "start";
    return;
  }

  if (state.mode === "celebrating") {
    ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#d9fbff";
    ctx.font = "bold 42px 'Flubby', 'Roboto', system-ui";
    ctx.textAlign = "center";
    ctx.fillText(`${levelRuntime.name} COMPLETE!`, canvas.width / 2, 88);
    ctx.font = "20px 'Roboto', 'Roboto', system-ui";
    ctx.fillText("Super Bark Celebration!", canvas.width / 2, 118);
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
      const opts = ["Continue", "Options"];
      opts.forEach((opt, i) => {
        const isSel = sel === i;
        ctx.fillStyle = isSel ? "#9fe5ff" : "#fff";
        ctx.fillText(opt, canvas.width / 2, canvas.height / 2 - 24 + i * 30);
      });
      ctx.font = "17px 'Roboto', system-ui";
      ctx.fillStyle = "#d9fbff";
      ctx.fillText("↑/↓ select • Enter confirm • Esc resume", canvas.width / 2, canvas.height / 2 + 42);
    } else {
      const musicSelected = state.pauseOptionIndex === 0;
      const sfxSelected = state.pauseOptionIndex === 1;
      drawPauseSlider(canvas.width / 2 - 110, canvas.height / 2 - 22, AUDIO.musicVol, "Music", musicSelected);
      drawPauseSlider(canvas.width / 2 - 110, canvas.height / 2 + 22, AUDIO.sfxVol, "SFX", sfxSelected);
      ctx.font = "17px 'Roboto', system-ui";
      ctx.fillStyle = "#d9fbff";
      ctx.fillText("Enter: Save • Esc/B: Back • ←/→ adjust", canvas.width / 2, canvas.height / 2 + 62);
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
    ctx.fillText("YOU FAINTED", canvas.width / 2, canvas.height / 2 - 40);
    ctx.font = "20px 'Roboto', 'Roboto', system-ui";
    ctx.fillText(`Lives left: ${"🐶".repeat(Math.max(0, state.levelRespawnsLeft))}`, canvas.width / 2, canvas.height / 2 - 10);
    ctx.fillText(`C to Continue (${state.levelRespawnsLeft} left) • Q to Quit`, canvas.width / 2, canvas.height / 2 + 16);
    drawDeadDog(canvas.width / 2, canvas.height / 2 + 80);
    ctx.textAlign = "start";
    return;
  }

  if (state.mode === "gameover") {
    ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#fff";
    ctx.font = "bold 50px 'Flubby', 'Roboto', system-ui";
    ctx.textAlign = "center";
    ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 20);
    ctx.font = "20px 'Roboto', 'Roboto', system-ui";
    ctx.fillText(`Lives left: ${"🐶".repeat(Math.max(0, state.levelRespawnsLeft))}`, canvas.width / 2, canvas.height / 2 + 8);
    ctx.fillText("Q / Enter / Space to restart", canvas.width / 2, canvas.height / 2 + 32);
    drawDeadDog(canvas.width / 2, canvas.height / 2 + 80);
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
  const shaking = now < state.shakeUntil ? state.shakeIntensity : 0;
  const shakeX = shaking ? Math.random() * shaking * 2 - shaking : 0;
  const shakeY = shaking ? Math.random() * shaking * 2 - shaking : 0;

  ctx.save();
  ctx.translate(shakeX, shakeY);

  drawParallax();

  ctx.save();
  ctx.translate(-state.cameraX, 0);

  for (const p of level.platforms) drawPlatform(p);
  for (const s of level.spikes) drawSpike(s);
  for (const b of level.bones) drawBone(b);
  for (const h of level.hearts || []) drawHeartPickup(h);
  for (const c of level.capes || []) drawCapePickup(c);
  for (const t of level.toys || []) drawToy(t);
  for (const s of level.sirens || []) drawSiren(s);
  for (const e of level.enemies) if (!e.dead) drawEnemy(e);
  drawBoss(level.boss);
  for (const wave of state.combat.barkWaves) drawBarkWave(wave);
  for (const p of state.bossProjectiles) drawBossProjectile(p);
  if (state.toyProjectile) drawToyProjectile(state.toyProjectile);
  drawFlag(level.finishFlag);
  drawDachshund(state.dog);

  ctx.restore();

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
  drawLevelProgressHUD(level);

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
    barkBtn.textContent = cooldownLeft > 0 ? `BARK ${Math.ceil(cooldownLeft / 1000)}` : "BARK";
    barkBtn.classList.toggle("cooldown", cooldownLeft > 0);
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
  if (e.code === "Escape" && state.levelSelectOpen) {
    closeLevelSelect();
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
      if (["KeyC", "Enter", "Space"].includes(e.code)) {
        resumeGame();
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

  if (state.mode === "start" && ["Space", "Enter", "KeyW", "ArrowUp"].includes(e.code)) {
    startGame();
    e.preventDefault();
    return;
  }

  if (/^Key[A-Z]$/.test(e.code)) {
    state.cheatBuffer = (state.cheatBuffer + e.code.replace("Key", "").toLowerCase()).slice(-12);
    if (state.cheatBuffer.includes("henry")) {
      if (bgMusic.audio) bgMusic.audio.pause();
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
    triggerSuperBark();
    e.preventDefault();
  }

  setKey(e.code, true);
  if (["ArrowUp", "ArrowLeft", "ArrowRight", "Space", "ArrowDown"].includes(e.code)) e.preventDefault();
});

window.addEventListener("keyup", (e) => setKey(e.code, false));

canvas.addEventListener("pointerdown", (e) => {
  startBgMusic();
  if (state.mode === "start") {
    e.preventDefault();
    startGame();
  }
});

function bindHoldButton(id, onPress, onRelease = onPress) {
  const btn = document.getElementById(id);
  btn.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    onPress(true);
  });
  const stop = (e) => {
    e.preventDefault();
    onRelease(false);
  };
  btn.addEventListener("pointerup", stop);
  btn.addEventListener("pointerleave", stop);
  btn.addEventListener("pointercancel", stop);
}

bindHoldButton("btn-left", (v) => (state.keys.left = v));
bindHoldButton("btn-right", (v) => (state.keys.right = v));

const jumpBtn = document.getElementById("btn-jump");
jumpBtn.addEventListener("pointerdown", (e) => {
  e.preventDefault();
  startBgMusic();
  if (state.mode === "start") {
    startGame();
  } else if (state.mode === "won" || state.mode === "lost") {
    resetGame();
  } else {
    state.keys.jump = true;
    state.jumpHeld = true;
    noteJumpTap();
  }
});
jumpBtn.addEventListener("pointerup", () => {
  state.keys.jump = false;
  state.jumpHeld = false;
});
jumpBtn.addEventListener("pointerleave", () => {
  state.keys.jump = false;
  state.jumpHeld = false;
});
jumpBtn.addEventListener("pointercancel", () => {
  state.keys.jump = false;
  state.jumpHeld = false;
});

const barkBtn = document.getElementById("btn-bark");
if (barkBtn) {
  barkBtn.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    startBgMusic();
    triggerSuperBark();
  });
}

function noteJumpTap() {
  state.jumpPressedThisFrame = true;
  state.lastJumpTapAt = Date.now();
  state.jumpBufferedUntil = Date.now() + JUMP_BUFFER_MS;
}

if (closeLevelSelectEl) {
  closeLevelSelectEl.addEventListener("click", () => closeLevelSelect());
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
    fullscreenBtn.textContent = active ? "⛶ Exit Fullscreen" : "⛶ Fullscreen";
    document.body.classList.toggle("fullscreen-mode", active);
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

startAfterFonts();
