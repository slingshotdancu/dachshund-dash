# Dachshund Dash

A side-scroller web game where you play as a long-haired black-and-brown dachshund.

This build now includes:
- **20 total levels**
- **Knockback-on-hit** (no level reset when damaged)
- **Corgi boss fights** at **Level 10** and **Level 20** with telegraphed attacks + phase 2 behavior
- Existing systems preserved: hearts, stomp, super bark, cape, title cards, level-clear celebration

## Run

From this folder, start any static web server and open it in a browser.

### Option A (Python)
```bash
cd /Users/danieljobe/.openclaw/workspace/projects/dachshund-dash
python3 -m http.server 8080
```
Open: `http://localhost:8080`

### Option B (Node)
```bash
cd /Users/danieljobe/.openclaw/workspace/projects/dachshund-dash
npx serve .
```

## Controls and mechanics summary

### Controls
- **Desktop**
  - Move left: `A` or `Left Arrow`
  - Move right: `D` or `Right Arrow`
  - Jump / rise while flying: `W`, `Up Arrow`, or `Space`
  - Super Jump: first jump is always normal; keep holding jump in-air to trigger one higher boost
  - Dive while flying: `S` or `Down Arrow`
  - Super Bark attack: `F`, `K`, or `Right Shift` (with bark SFX)
  - Restart: `R`
  - Cheat code: type `henry` to open level-select screen + unlock effect
- **Mobile / touch**
  - `◀` move left
  - `▶` move right
  - `▲` jump (also restarts after win/lose)
  - `BARK` triggers Super Bark attack

### Core mechanics
- **Hearts/Lives:** Start with 3 hearts, lose one per hit, game over at 0.
- **Hit reaction:** Taking damage now causes knockback (backward push + upward pop) plus brief invulnerability.
- **Stomp:** Land on enemies from above to defeat them and bounce up.
- **Super Bark:** Directional ranged attack with cooldown.
- **Cape pickup:** Temporary 20-second flight on selected levels.
- **Level clear rule:** Collect all bones and reach flag. On boss levels, boss must also be defeated first.

## Full level map overview (1-20)

- **Level 1:** Intro layout, basic enemy/spike timing.
- **Level 2:** Harder staggered jumps, denser hazards, first cape pickup.
- **Level 3:** Wider gaps, added patrol pressure.
- **Level 4:** Mixed low/high platforms, first mid-run heart cadence.
- **Level 5:** Faster patrol blends + cape opportunity.
- **Level 6:** Spike rhythm intensifies with layered routes; opening jump was tuned to be comfortably reachable.
- **Level 7:** Longer platform chains and enemy overlap patterns.
- **Level 8:** Denser hazard lanes + sustain-focused traversal.
- **Level 9:** Pre-boss ramp with tighter spacing and higher enemy count.
- **Level 10 (Boss):** **Corgi Captain** encounter.
- **Level 11:** Post-boss recovery pace, still escalating baseline difficulty.
- **Level 12:** Elevated route complexity and punish windows.
- **Level 13:** Faster patrol clusters and reduced recovery spaces.
- **Level 14:** Multi-tier pathing under heavier spike coverage.
- **Level 15:** Extended pressure with cape-enabled route options.
- **Level 16:** Tight sequence execution, hazard mix-up patterns.
- **Level 17:** High-density enemy traffic + traversal commitment.
- **Level 18:** Late-game gauntlet style pacing.
- **Level 19:** Final pre-boss stress test.
- **Level 20 (Final Boss):** **Corgi Overlord** encounter.

## Bosses (where + how)

### Level 10 Boss — Corgi Captain
- Patrols arena at level end
- Has health pool
- Attacks are telegraphed before firing/dashing (clear visual cue around the boss)
- Phase 1: aimed bark projectiles
- Phase 2 (below 50% HP): faster tempo, projectile burst upgrades, and dash attacks
- Can be damaged by stomp or Super Bark
- Victory condition: reduce health to 0, then touch flag (with all bones collected)

### Level 20 Boss — Corgi Overlord
- Same core boss system as Level 10, but stronger:
  - More health
  - Higher movement speed
- Uses the same telegraph + phase system, with stronger baseline stats

## Objective

Collect every bone in the current level, survive hazards, defeat boss when present, and reach the finish flag.
