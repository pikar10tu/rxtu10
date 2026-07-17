# BattleReplay v3 (Scene/FX Split) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** แก้ battle replay กระตุกบน iOS Safari โดยแยกฉาก (Scene, นิ่ง) ออกจาก motion (FX pool) + decouple ephemeral ออกจาก Vue reactivity — คงฟีล Hearthstone (การ์ดพุ่งจริง)

**Architecture:** Scene = การ์ด/หลอด/เลข layout นิ่งใน Vue เปลี่ยนแค่ discrete state · Motion = `battleFx.js` (plain JS) เป็น pool ของ element จิ๋ว promote ถาวร reuse ขับด้วย WAAPI · Sequencer = promise chain (แทน setTimeout+CSS) · melee lunge = การ์ดจริง 1 animation out-and-back (ข้อยกเว้นเดียวที่การ์ดขยับ)

**Tech Stack:** Vue 3 SFC + Vite · Web Animations API (`element.animate`) · Fluent Color SVG assets (`fluentFile()`)

**Spec:** `docs/superpowers/specs/2026-07-17-battle-replay-v3-fx-split-design.md` (อ่านก่อนเริ่ม)

## Global Constraints

- **ไม่มี DOM test runner** — verify ทุก task = `npm run build` ต้องผ่าน + ทดลองใน `npm run dev` + (task ที่แตะ perf/visual) เทสบน **iPhone Safari จริง** ด้วย `?fps=1` และ **Safari Web Inspector → Layers tab** · อย่าเขียน unit test ที่รัน DOM/WAAPI ใน node (รันไม่ได้)
- **ไม่แตะ:** `src/data/battle.js`, `src/utils/battleEngine.js` (log schema), `src/components/shared/Emoji.vue`
- **FX doctrine (บังคับทุก task ที่แตะ fx):** (1) fx promise **resolve เสมอ ไม่ reject** (ห่อ `finished.catch(()=>{})`) · (2) pool ขยับด้วย **transform เท่านั้น** ห้ามแตะ layout property · (3) FX styles ต้อง **ไม่ scoped** namespace `.brfx-*` · (4) one-way: Vue → fx call ไม่มีขากลับเข้า reactive state · (5) การ์ด **static ยกเว้น melee lunge** (1 animation out-and-back, `fill:'none'`, keyframes = transform เท่านั้น, z-index set นอก keyframes)
- **commit style:** `Battle: อะไร (ทำไม)` ไทยปนอังกฤษ · ท้าย message: `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`
- **deploy:** `git push origin master` = GitHub Actions auto build+publish (ทั้งชั้นปีใช้) — push เฉพาะ task ที่ตั้งใจให้ขึ้น live (Phase 0 ship ได้, Phase 1-2 ไม่ push จน Phase 3 หรือ user สั่ง)
- **default lite (มือถือ) คงไว้** จน Phase 3 — เพื่อนจะได้ไม่เจอกระตุกระหว่าง rework

## File Structure

- **Create** `src/utils/battleFx.js` — pool + WAAPI motion + centers cache (ย้ายมาจาก BattleReplay) · export `createBattleFx()` · plain JS ไม่ import vue
- **Modify** `src/components/battle/BattleReplay.vue` — รื้อไส้: ephemeral refs ออก, sequencer เป็น async, wire fx, FX `<style>` ไม่ scoped, ลบ CSS card-motion/`::after`
- **Create (ชั่วคราว)** dev harness — ปุ่ม dev ใน `src/views/ArenaView.vue` (gated `import.meta.env.DEV`) ยิง fx ทุกชนิด เพื่อดู Layers inspector บน iPhone · ลบทิ้ง Phase 3

---

## Task 1: Phase 0 — preload combat assets ครบ + ตัด text-shadow (ship ได้เดี่ยว)

**Files:**
- Modify: `src/components/battle/BattleReplay.vue` (`preloadProjectiles` → ครอบหน้าเพ็ท+ไอคอน · CSS `.br-pop` ตัด `text-shadow`)

**Interfaces:**
- Produces: `preloadCombat(d)` — preload+decode หน้าเพ็ททุกตัว + ⚡🛡️💀💥 + projectiles ของทั้ง 2 ทีม (ใช้ตอน intro)

- [ ] **Step 1: ขยาย preload ให้ครอบ asset combat ทั้งหมด**

ใน `BattleReplay.vue` แทน `preloadProjectiles` ด้วย (ชื่อใหม่ `preloadCombat`, เรียกใน `watch(props.data)` แทนตัวเดิม):

```js
// อุ่น cache+decode asset combat ทั้งหมดก่อนเริ่มเล่น (intro หน่วง ~1.1s) — dash/pop/projectile swap src กลางไฟต์
// ไม่งั้น decoding="sync" ครั้งแรกของแต่ละรูป = บล็อกเฟรม
const preloadedImgs = []
function preloadCombat(d) {
  const chars = new Set(['⚡', '🛡️', '💀', '💥'])
  for (const p of [...(d?.playerTeam || []), ...(d?.botTeam || [])]) {
    const def = getPetDef(p?.id); if (!def) continue
    if (def.emoji) chars.add(def.emoji)                                  // หน้าเพ็ท (dash sprite)
    if (atkStyleOf(def) === 'ranged') chars.add(projectileOf(def))       // projectile
  }
  for (const c of chars) {
    const f = fluentFile(c); if (!f) continue
    const img = new Image(); img.decoding = 'sync'; img.src = BASE_URL + f
    if (img.decode) img.decode().catch(() => {})                         // force decode ล่วงหน้า
    preloadedImgs.push(img)
  }
}
```

เพิ่มบนสุด (ถ้ายังไม่มี): `const BASE_URL = import.meta.env.BASE_URL`

- [ ] **Step 2: อัปเดตจุดเรียก**

ใน `watch(() => props.data, ...)` เปลี่ยน `preloadProjectiles(d)` → `preloadCombat(d)`

- [ ] **Step 3: ตัด text-shadow จาก pop**

ใน CSS `.br-pop` ลบ `text-shadow: 0 2px 6px rgba(0, 0, 0, .7);` (stroke พออ่านออกแล้ว — ลด raster)

- [ ] **Step 4: build**

Run: `npm run build`
Expected: `✓ built` ไม่มี error

- [ ] **Step 5: ทดลอง dev**

Run: `npm run dev` → เปิด battle (Tower/Arena) → เลขดาเมจยังอ่านออก, projectile ยังโผล่ปกติ

- [ ] **Step 6: Commit + push (ship ได้ ไม่เสี่ยง)**

```bash
git add src/components/battle/BattleReplay.vue
git commit -m "Battle: Phase 0 preload combat assets ครบ + ตัด text-shadow pop (เก็บ perf ฟรี)"
git push origin master
```

---

## Task 2: Phase 1 — battleFx.js scaffold (module + layer + centers + lifecycle)

**Files:**
- Create: `src/utils/battleFx.js`

**Interfaces:**
- Produces: `createBattleFx() → fx` object · `fx.attach({ boxEl, layerEl, getEl })` · `fx.reset()` · `fx.destroy()` · `fx.cancelAll()` · `fx.setRate(s)` · internal: `centerOf(uid)`, `run(el, keyframes, {duration, easing})`, `positionAt(el, uid, dx, dy)`

- [ ] **Step 1: สร้าง `src/utils/battleFx.js` scaffold**

```js
// battleFx.js — motion layer ของ BattleReplay (plain JS ไม่พึ่ง Vue)
// doctrine: pool element promote ถาวร reuse · ขับด้วย WAAPI transform/opacity เท่านั้น · promise resolve เสมอ · one-way (Vue→fx)
import { fluentFile } from './emoji.js'

const BASE = import.meta.env.BASE_URL

export function createBattleFx() {
  let boxEl = null, layer = null, getEl = () => null, rate = 1
  const anims = new Set()               // active WAAPI (สำหรับ cancelAll)
  let centers = {}, boxRect = null

  // ── centers cache (ย้ายมาจาก BattleReplay) ──
  function invalidateCenters() { centers = {}; boxRect = null }
  function centerOf(uid) {
    const c = centers[uid]; if (c) return c
    const el = getEl(uid); if (!el || !boxEl) return null
    if (!boxRect) boxRect = boxEl.getBoundingClientRect()
    const r = el.getBoundingClientRect()
    const v = { x: r.left - boxRect.left + r.width / 2, y: r.top - boxRect.top + r.height / 2 }
    centers[uid] = v; return v
  }
  function onResize() { invalidateCenters() }

  // ── WAAPI helper: resolve เสมอ (cancel = reject → กลืน) ──
  function run(el, keyframes, opts) {
    const a = el.animate(keyframes, { duration: opts.duration / rate, easing: opts.easing || 'ease-out', fill: opts.fill || 'none' })
    anims.add(a)
    return a.finished.catch(() => {}).finally(() => anims.delete(a))
  }

  function attach({ boxEl: b, layerEl, getEl: g }) {
    boxEl = b; layer = layerEl; getEl = g
    buildPools()
    window.addEventListener('resize', onResize)
    window.addEventListener('orientationchange', onResize)
  }
  function reset() { invalidateCenters(); cancelAll() }
  function cancelAll() {
    for (const a of anims) a.cancel()          // reject → run() กลืนแล้ว
    anims.clear()
    hideAllPools()
  }
  function setRate(s) { rate = s || 1 }
  function destroy() {
    cancelAll()
    window.removeEventListener('resize', onResize)
    window.removeEventListener('orientationchange', onResize)
    if (layer) layer.innerHTML = ''
  }

  // pools + effect methods เติมใน task ถัดไป
  function buildPools() {}
  function hideAllPools() {}

  return { attach, reset, cancelAll, setRate, destroy, centerOf, invalidateCenters }
}
```

- [ ] **Step 2: build (import ต้องผ่าน)**

Run: `npm run build`
Expected: `✓ built` — battleFx.js ยังไม่ถูก import ที่ไหน แต่ต้อง compile ได้

- [ ] **Step 3: Commit**

```bash
git add src/utils/battleFx.js
git commit -m "Battle: Phase 1 battleFx.js scaffold (layer/centers/lifecycle/WAAPI helper)"
```

---

## Task 3: Phase 1 — pop / callout / koPuff (pooled ephemeral)

**Files:**
- Modify: `src/utils/battleFx.js`

**Interfaces:**
- Consumes: `run`, `positionAt`, `centerOf`, pool infra
- Produces: `fx.pop(uid, {dmg, crit, eff})` · `fx.callout(uid, kind)` ('super'|'weak') · `fx.koPuff(uid)` — imperative, ไม่คืน promise (fire-and-forget, ลบตัวเองด้วย timer/animation end)

- [ ] **Step 1: เพิ่ม pool infra + helper positionAt**

ใน `battleFx.js` เพิ่มใน closure (ก่อน `buildPools`):

```js
  function mkEl(cls) { const e = document.createElement('div'); e.className = 'brfx ' + cls; layer.appendChild(e); return e }
  function mkImg(cls) { const e = document.createElement('img'); e.className = 'brfx ' + cls; e.setAttribute('aria-hidden', 'true'); e.loading = 'eager'; e.decoding = 'sync'; layer.appendChild(e); return e }
  function imgSrc(el, char) { const f = fluentFile(char); el.src = f ? BASE + f : '' }
  // ตั้งตำแหน่งฐานด้วย transform (translateZ promote) — dx/dy = offset ในหน่วย px, bake ใน translate
  function baseXform(uid, dx = 0, dy = 0) { const c = centerOf(uid); return c ? `translate(${(c.x + dx).toFixed(1)}px, ${(c.y + dy).toFixed(1)}px) translateZ(0)` : null }

  const pool = { pop: [], call: [], puff: [] }
  let popIdx = 0, callIdx = 0, puffIdx = 0
```

- [ ] **Step 2: buildPools + hideAllPools (pop/callout/puff)**

แทน `buildPools`/`hideAllPools` ที่ว่างด้วย:

```js
  function buildPools() {
    for (let i = 0; i < 4; i++) pool.pop.push(mkEl('brfx-pop'))
    for (let i = 0; i < 2; i++) pool.call.push(mkEl('brfx-call'))
    for (let i = 0; i < 2; i++) { const e = mkImg('brfx-puff'); imgSrc(e, '💀'); pool.puff.push(e) }
    hideAllPools()
  }
  function hideAllPools() {
    for (const arr of Object.values(pool)) for (const e of arr) { e.style.opacity = '0'; e.getAnimations?.().forEach(a => a.cancel()) }
  }
```

- [ ] **Step 3: pop / callout / koPuff**

```js
  function pop(uid, { dmg, crit, eff }) {
    const el = pool.pop[popIdx = (popIdx + 1) % pool.pop.length]
    el.getAnimations?.().forEach(a => a.cancel())
    el.textContent = '-' + dmg
    el.className = 'brfx brfx-pop' + (crit ? ' crit' : eff === 'super' ? ' super' : eff === 'weak' ? ' weak' : '')
    const dx = Math.round(Math.random() * 28 - 14)          // offset สุ่ม bake ใน translate (ไม่ใช้ margin)
    const base = baseXform(uid, dx, -6); if (!base) return
    el.style.opacity = '1'
    // popMs คงที่ไม่หารด้วย rate (อ่านเลขทันแม้ ×4) — จึงเรียก animate ตรง ไม่ผ่าน run() ที่หาร rate
    const a = el.animate([
      { transform: base + ' translateY(0) scale(.6)', opacity: 0, offset: 0 },
      { transform: base + ' translateY(-6px) scale(1.15)', opacity: 1, offset: .18 },
      { transform: base + ' translateY(-12px) scale(1)', opacity: 1, offset: .35 },
      { transform: base + ' translateY(-40px) scale(1)', opacity: 0, offset: 1 },
    ], { duration: 900, easing: 'ease-out', fill: 'forwards' })
    a.finished.catch(() => {}).then(() => { if (el.textContent === '-' + dmg) el.style.opacity = '0' })
  }

  function callout(uid, kind) {              // kind: 'super' | 'weak'
    const el = pool.call[callIdx = (callIdx + 1) % pool.call.length]
    el.getAnimations?.().forEach(a => a.cancel())
    el.className = 'brfx brfx-call ' + kind
    el.textContent = kind === 'super' ? 'แพ้ทาง! ⚡' : 'ต้านทาน 🛡️'
    const base = baseXform(uid, 0, -16); if (!base) return
    el.style.opacity = '1'
    const a = el.animate([
      { transform: base + ' translateY(0)', opacity: 1 },
      { transform: base + ' translateY(-24px)', opacity: 0 },
    ], { duration: 750, easing: 'ease-out', fill: 'forwards' })
    a.finished.catch(() => {}).then(() => { el.style.opacity = '0' })
  }

  function koPuff(uid) {
    const el = pool.puff[puffIdx = (puffIdx + 1) % pool.puff.length]
    el.getAnimations?.().forEach(a => a.cancel())
    const base = baseXform(uid, 0, 0); if (!base) return
    el.style.opacity = '1'
    const a = el.animate([
      { transform: base + ' translateY(0) scale(.6)', opacity: 1 },
      { transform: base + ' translateY(-16px) scale(1.25)', opacity: 0 },
    ], { duration: 500, easing: 'ease-out', fill: 'forwards' })
    a.finished.catch(() => {}).then(() => { el.style.opacity = '0' })
  }
```

หมายเหตุ: callout ฝังข้อความ+emoji ใน textContent (emoji เป็น glyph ของเครื่อง ok สำหรับ callout สั้น) — ถ้าต้องการ Fluent icon ให้แยก `<img>` (deferred, YAGNI ตอนนี้)

- [ ] **Step 4: export methods ใหม่**

เพิ่ม `pop, callout, koPuff` ใน return object

- [ ] **Step 5: build**

Run: `npm run build` → Expected: `✓ built`

- [ ] **Step 6: Commit**

```bash
git add src/utils/battleFx.js
git commit -m "Battle: Phase 1 fx pop/callout/koPuff (pooled ephemeral, WAAPI, resolve-safe)"
```

---

## Task 4: Phase 1 — ring / burst (pooled highlight+impact)

**Files:**
- Modify: `src/utils/battleFx.js`

**Interfaces:**
- Produces: `fx.ring(uid, phase) → Promise` (phase: 'windup'|'acting') · `fx.burst(uid) → Promise`

- [ ] **Step 1: buildPools เพิ่ม ring(1) + burst(2)**

ใน `buildPools` เพิ่ม:

```js
    pool.ring = [mkEl('brfx-ring')]
    pool.burst = [mkImg('brfx-burst'), mkImg('brfx-burst')]
    pool.burst.forEach(e => imgSrc(e, '💥'))
```

(pool object เพิ่ม key: แก้ประกาศเป็น `const pool = { pop: [], call: [], puff: [], ring: [], burst: [] }`)

- [ ] **Step 2: ring + burst methods**

```js
  let burstIdx = 0
  function ring(uid, phase) {
    const el = pool.ring[0]
    el.getAnimations?.().forEach(a => a.cancel())
    el.className = 'brfx brfx-ring ' + phase
    const base = baseXform(uid, 0, 0); if (!base) return Promise.resolve()
    el.style.transform = base
    return run(el, [
      { transform: base + ' scale(.85)', opacity: 0 },
      { transform: base + ' scale(1.05)', opacity: 1, offset: .4 },
      { transform: base + ' scale(1)', opacity: phase === 'windup' ? .9 : 1 },
    ], { duration: phase === 'windup' ? 250 : 120, easing: 'ease-out', fill: 'forwards' })
      .then(() => { if (phase === 'acting') { el.style.opacity = '0' } })
  }
  function burst(uid) {
    const el = pool.burst[burstIdx = (burstIdx + 1) % pool.burst.length]
    el.getAnimations?.().forEach(a => a.cancel())
    const base = baseXform(uid, 0, 0); if (!base) return Promise.resolve()
    el.style.opacity = '1'
    return run(el, [
      { transform: base + ' scale(.4)', opacity: 1 },
      { transform: base + ' scale(1.4)', opacity: 0 },
    ], { duration: 280, easing: 'ease-out', fill: 'forwards' }).then(() => { el.style.opacity = '0' })
  }
```

- [ ] **Step 3: export + build + Commit**

เพิ่ม `ring, burst` ใน return · `npm run build` → `✓ built`

```bash
git add src/utils/battleFx.js
git commit -m "Battle: Phase 1 fx ring/burst (highlight+impact composite)"
```

---

## Task 5: Phase 1 — projectile / dash / cardLunge (motion) + FX styles

**Files:**
- Modify: `src/utils/battleFx.js`
- Modify: `src/components/battle/BattleReplay.vue` (เพิ่ม `<style>` ไม่ scoped `.brfx-*`)

**Interfaces:**
- Produces: `fx.projectile(fromUid, toUid, char) → Promise` · `fx.dash(fromUid, toUid, char) → Promise` · `fx.cardLunge(el, fromUid, toUid) → Promise`

- [ ] **Step 1: buildPools เพิ่ม projectile(2) + dash(1)**

```js
    pool.proj = [mkImg('brfx-proj'), mkImg('brfx-proj')]
    pool.dash = [mkImg('brfx-dash')]
```

(เพิ่ม key `proj: [], dash: []` ใน `const pool = {...}`)

- [ ] **Step 2: projectile / dash / cardLunge**

```js
  let projIdx = 0
  function projectile(fromUid, toUid, char) {
    const a = centerOf(fromUid), b = centerOf(toUid); if (!a || !b) return Promise.resolve()
    const el = pool.proj[projIdx = (projIdx + 1) % pool.proj.length]
    el.getAnimations?.().forEach(x => x.cancel()); imgSrc(el, char); el.style.opacity = '1'
    return run(el, [
      { transform: `translate(${a.x}px, ${a.y}px) translateZ(0)` },
      { transform: `translate(${b.x}px, ${b.y}px) translateZ(0)` },
    ], { duration: 280, easing: 'linear', fill: 'forwards' }).then(() => { el.style.opacity = '0' })
  }
  function dash(fromUid, toUid, char) {        // plan B melee: sprite เพ็ทพุ่งเข้าฟาดแล้ว fade
    const a = centerOf(fromUid), b = centerOf(toUid); if (!a || !b) return Promise.resolve()
    const el = pool.dash[0]
    el.getAnimations?.().forEach(x => x.cancel()); imgSrc(el, char); el.style.opacity = '1'
    return run(el, [
      { transform: `translate(${a.x}px, ${a.y}px) scale(1) translateZ(0)`, opacity: .9 },
      { transform: `translate(${b.x}px, ${b.y}px) scale(1.3) translateZ(0)`, opacity: 1, offset: .7 },
      { transform: `translate(${b.x}px, ${b.y}px) scale(.9) translateZ(0)`, opacity: 0 },
    ], { duration: 250, easing: 'cubic-bezier(.2,.7,.3,1.1)', fill: 'forwards' }).then(() => { el.style.opacity = '0' })
  }
  // melee ข้อยกเว้น: การ์ดจริงพุ่ง out-and-back = 1 animation (fill:none) · z-index set นอก keyframes
  function cardLunge(el, fromUid, toUid) {
    const a = centerOf(fromUid), b = centerOf(toUid); if (!el || !a || !b) return Promise.resolve()
    const dx = (b.x - a.x).toFixed(1), dy = (b.y - a.y).toFixed(1)
    el.style.zIndex = '7'                         // ยกบนสุด (static ก่อนเริ่ม ไม่อยู่ใน keyframes)
    const anim = el.animate([
      { transform: 'translate(0,0) scale(1)' },
      { transform: `translate(${dx}px, ${dy}px) scale(1.18)`, offset: .5 },
      { transform: 'translate(0,0) scale(1)' },
    ], { duration: 500 / rate, easing: 'ease-in-out', fill: 'none' })
    anims.add(anim)
    return anim.finished.catch(() => {}).finally(() => { anims.delete(anim); el.style.zIndex = ''; el.style.transform = '' })
  }
```

- [ ] **Step 3: export ทั้งหมด**

return object สุดท้าย: `{ attach, reset, cancelAll, setRate, destroy, centerOf, invalidateCenters, pop, callout, koPuff, ring, burst, projectile, dash, cardLunge }`

- [ ] **Step 4: เพิ่ม FX styles (ไม่ scoped) ใน BattleReplay.vue**

ท้ายไฟล์ เพิ่ม `<style>` block **แยก ไม่มี `scoped`** (element ของ fx ไม่มี data-v-*):

```html
<style>
/* FX pool styles — ไม่ scoped (element สร้าง imperative ไม่มี data-v-*) · namespace .brfx-* กันชน global */
.br-fx-layer { position: absolute; inset: 0; pointer-events: none; z-index: 6; }
.brfx { position: absolute; left: 0; top: 0; will-change: transform; }
.brfx-pop { font-weight: 900; font-size: 1.5rem; color: #fecaca; -webkit-text-stroke: 3px rgba(15,23,42,.85); paint-order: stroke fill; white-space: nowrap; }
.brfx-pop.crit { color: #fbbf24; font-size: 2rem; }
.brfx-pop.super { color: #fca5a5; }
.brfx-pop.weak { color: #cbd5e1; font-size: 1.1rem; }
.brfx-call { font-weight: 800; font-size: .6rem; white-space: nowrap; padding: 2px 6px; border-radius: 7px; }
.brfx-call.super { background: #ef4444; color: #fff; }
.brfx-call.weak { background: rgba(203,213,225,.95); color: #334155; }
.brfx-puff { width: 1.2rem; height: 1.2rem; }
.brfx-burst { width: 2rem; height: 2rem; }
.brfx-proj { width: 1.4rem; height: 1.4rem; }
.brfx-dash { width: 2rem; height: 2rem; }
.brfx-ring { width: 84px; height: 84px; margin: -42px 0 0 -42px; border-radius: 18px; }
.brfx-ring.windup { box-shadow: 0 0 0 3px #fde68a, 0 0 18px 4px rgba(253,230,138,.55); }
.brfx-ring.acting { box-shadow: 0 0 0 3px #fde68a, 0 6px 16px rgba(0,0,0,.4); }
</style>
```

(หมายเหตุ: `.brfx-ring` ขนาด/`margin` = จัดให้กึ่งกลางตรง translate ของ center — ปรับเลขให้พอดีการ์ดตอน Phase 2b บนจอจริง)

- [ ] **Step 5: build + Commit**

`npm run build` → `✓ built`

```bash
git add src/utils/battleFx.js src/components/battle/BattleReplay.vue
git commit -m "Battle: Phase 1 fx projectile/dash/cardLunge + FX styles (ไม่ scoped .brfx-*)"
```

---

## Task 6: Phase 1 — dev harness + Layers inspector check (iPhone)

**Files:**
- Modify: `src/views/ArenaView.vue` (ปุ่ม dev gated `import.meta.env.DEV`)

**Interfaces:**
- Consumes: `createBattleFx`

- [ ] **Step 1: เพิ่ม dev harness ใน ArenaView**

เพิ่มปุ่ม (แสดงเฉพาะ dev) ที่ mount `.br-box` จำลอง + fx layer + ยิง fx ทุกชนิดวนลูป:

```html
<!-- DEV ONLY: fx harness — ดู Layers inspector บน iPhone -->
<div v-if="isDev" class="fxh-wrap">
  <div ref="fxhBox" class="fxh-box">
    <div class="fxh-card" ref="fxhA"></div>
    <div class="fxh-card" ref="fxhB"></div>
    <div class="br-fx-layer" ref="fxhLayer"></div>
  </div>
  <button @click="fxhStart">▶ fx loop</button>
</div>
```

```js
import { createBattleFx } from '../utils/battleFx.js'
const isDev = import.meta.env.DEV
const fxhBox = ref(null), fxhLayer = ref(null), fxhA = ref(null), fxhB = ref(null)
let fxh = null, fxhTimer = null
function fxhStart() {
  if (!fxh) {
    fxh = createBattleFx()
    fxh.attach({ boxEl: fxhBox.value, layerEl: fxhLayer.value, getEl: u => u === 'A0' ? fxhA.value : fxhB.value })
  }
  let i = 0
  clearInterval(fxhTimer)
  fxhTimer = setInterval(() => {
    fxh.invalidateCenters()
    fxh.ring('A0', 'windup'); setTimeout(() => fxh.cardLunge(fxhA.value, 'A0', 'B0'), 250)
    setTimeout(() => { fxh.pop('B0', { dmg: 123, crit: i % 2 === 0 }); fxh.burst('B0'); fxh.callout('B0', 'super') }, 500)
    i++
  }, 900)
}
onUnmounted(() => { clearInterval(fxhTimer); fxh?.destroy() })
```

CSS (scoped ok สำหรับ harness เอง): `.fxh-box{position:relative;width:200px;height:120px;margin:20px auto} .fxh-card{position:absolute;width:70px;height:70px;border:2px solid #4f46e5;border-radius:16px} .fxh-card:first-child{left:10px;top:25px} .fxh-card:nth-child(2){right:10px;top:25px}`

- [ ] **Step 2: build + dev**

`npm run build` → `✓ built` · `npm run dev` → เปิด Arena → กด "fx loop" → เห็น ring/lunge/pop/burst/callout วนลูป ไม่ error console

- [ ] **Step 3: 🔴 เทส iPhone Safari + Layers inspector**

- เปิด dev บนมือถือ (หรือ Safari desktop → Develop → Show Web Inspector → Layers)
- กด fx loop → เปิด **Layers tab**
- **ยืนยัน:** pool elements (pop/ring/burst/proj/dash) **มี compositing layer** (จิ๋วๆ คงที่) · ตอน cardLunge เห็นการ์ด harness ขึ้น layer แล้วหายหลังจบ
- ถ้า pool ชิ้นไหน **ไม่** promote (Safari ไม่ยอมเพราะจิ๋วเกิน) → เพิ่ม `backface-visibility:hidden` หรือ `translateZ(0)` (มีอยู่แล้วใน .brfx) ยืนยันก่อนไป Phase 2

- [ ] **Step 4: Commit**

```bash
git add src/views/ArenaView.vue
git commit -m "Battle: Phase 1 dev fx harness (ดู Layers inspector บน iPhone) — DEV only"
```

---

## Task 7: Phase 2a — sequencer เป็น async promise chain (ยังไม่เปลี่ยน visual)

**Files:**
- Modify: `src/components/battle/BattleReplay.vue`

**Interfaces:**
- แปลง `applyAttack`/`startWindup`/`playMotion` → คืน promise · `step()` → `await handler` แล้วเว้น `baseDelay`

**หมายเหตุ:** task นี้เปลี่ยน**โครงการขับจังหวะ** โดย**คงกลไก visual เดิม** (CSS windup/lift/lunge/shake, refs เดิม) — พิสูจน์ async chain แยกจากการเปลี่ยนภาพ ถ้า perf/behavior เพี้ยนจะรู้ว่าอยู่ที่โครง ไม่ใช่ภาพ

- [ ] **Step 1: แปลง startWindup/playMotion เป็น promise**

`startWindup(e)` → คืน `Promise` ที่ resolve เมื่อครบ windupMs (แทน callback `onDone`) · `playMotion(e)` → คืน `Promise` resolve เมื่อจบ motion (แทน `onImpact` callback) · ใช้ `wait(ms)` helper:

```js
function wait(ms) { return new Promise(r => { const t = setTimeout(r, ms); pendingTimers.add(t) }) }
```

(เพิ่ม `const pendingTimers = new Set()` · `wait` เก็บ timer เพื่อ clear ตอน reset/skip)

- [ ] **Step 2: applyAttack เป็น async**

```js
async function applyAttack(e) {
  const g = gen
  winding.value = e.attacker
  setWindupVars(e)                                   // (โค้ดเดิมที่ set --wx/--wy, แยกเป็นฟังก์ชัน)
  await wait(windMs()); if (g !== gen) return
  winding.value = null; acting.value = e.attacker
  await playMotion(e); if (g !== gen) return          // playMotion คืน promise (impact เกิดตอน resolve)
  applyImpact(e, g)                                   // hp/pop/callout/crit เดิม (ยกออกมาเป็นฟังก์ชัน)
  if (e.crit && !lite.value) await wait(REPLAY_CFG.hitStopMs / speed.value)
}
```

(`windMs = () => (lite.value ? REPLAY_CFG.liteWindupMs : REPLAY_CFG.windupMs) / speed.value` · `applyImpact` = โค้ดใน callback เดิม (set hp, pop, callout) ยกออกมา รับ `g` เช็ค gen)

- [ ] **Step 3: step() เป็น async**

```js
async function step() {
  clearTimeout(timer)
  if (paused.value || idx.value >= log.value.length) { acting.value = null; return }
  const g = gen
  const e = log.value[idx.value]
  const h = handlers[e.t]
  if (h) await h(e)                                  // attack = รอจบ · round = sync
  if (g !== gen) return
  idx.value++
  if (idx.value < log.value.length) timer = setTimeout(step, (e.t === 'round' ? 0 : REPLAY_CFG.baseDelay / speed.value))
  else { acting.value = null; flashing.value = null }
}
```

(handlers.attack → `applyAttack` (async), handlers.round → sync set `round.value`)

- [ ] **Step 4: reset/skip เคลียร์ pendingTimers**

ใน `reset()` และ `skipToEnd()` เพิ่ม: `pendingTimers.forEach(clearTimeout); pendingTimers.clear()` (นอกจาก gen++ เดิม)

- [ ] **Step 5: build + dev + เทสครบ flow**

`npm run build` → `✓ built` · `npm run dev` → battle เล่นจบปกติ, pause/speed/skip/inspect ทำงาน, ผลตรงกับ log (behavior เหมือนเดิมเป๊ะ — แค่โครงเปลี่ยน)

- [ ] **Step 6: Commit**

```bash
git add src/components/battle/BattleReplay.vue
git commit -m "Battle: Phase 2a-1 sequencer → async promise chain (คง visual เดิม)"
```

---

## Task 8: Phase 2a — ย้าย pops/callouts/koPuff/projectile ไป fx pool + wire lifecycle

**Files:**
- Modify: `src/components/battle/BattleReplay.vue`

**Interfaces:**
- Consumes: `createBattleFx`, `fx.pop/callout/koPuff/projectile/reset/attach/destroy`
- ลบ refs: `pops`, `callouts`, `projectiles` + v-for markup · ย้าย centers cache ไป fx

- [ ] **Step 1: เพิ่ม fx layer + instance + lifecycle**

template: ใน `.br-box` เพิ่ม `<div class="br-fx-layer" ref="fxLayerEl"></div>` (แทน `.br-proj-layer` เดิม) · script:

```js
import { createBattleFx } from '../../utils/battleFx.js'
const fxLayerEl = ref(null)
const boxRef = ref(null)                       // ref บน .br-box
let fx = null
function ensureFx() {
  if (fx || !boxRef.value || !fxLayerEl.value) return
  fx = createBattleFx()
  fx.attach({ boxEl: boxRef.value, layerEl: fxLayerEl.value, getEl: uid => els[uid] || null })
}
```

(เพิ่ม `ref="boxRef"` บน `.br-box` · เรียก `ensureFx()` ต้น`reset()` หลัง DOM พร้อม — ใช้ `nextTick` ถ้าจำเป็น) · `onUnmounted`: `fx?.destroy()` · `reset()`: `ensureFx(); fx?.reset()`

- [ ] **Step 2: แทนการใช้งาน pops/callouts/koPuff ใน applyImpact ด้วย fx**

ใน `applyImpact` แทน block ที่ set `pops.value`/`callouts.value` และ puff ด้วย:

```js
  fx.pop(e.target, { dmg: e.dmg, crit: e.crit, eff: e.eff })
  if (e.eff === 'super' || e.eff === 'weak') fx.callout(e.target, e.eff)
  // koPuff: เรียกเมื่อ targetHpAfter <= 0
  if (e.targetHpAfter <= 0) fx.koPuff(e.target)
```

- [ ] **Step 3: แทน projectile ใน playMotion ด้วย fx.projectile**

ใน `playMotion` (ranged branch) แทนการ push `projectiles.value` + setTimeout ด้วย:

```js
  if (atkStyleOf(def) === 'ranged') return fx.projectile(e.attacker, e.target, projectileOf(def))
```

(melee branch คงเดิม — inline transform lunge ยังอยู่ ยังไม่แตะ Phase 2b)

- [ ] **Step 4: ลบ refs + markup + centers เดิม**

- ลบ `const pops`, `const callouts`, `const projectiles` refs · ลบ `popsFor`/`popClass`/`projStyle` + markup `<span class="br-pop">`, `<span class="br-call">`, `<span class="br-puff">`, `.br-proj-layer` v-for
- ลบ `centerOf`/`invalidateCenters`/`centers`/`boxRect` ใน component (ย้ายไป fx แล้ว) · จุดที่เคยเรียก `centerOf` (melee lunge) → ใช้ `fx.centerOf(uid)`
- ลบ `preloadedImgs` ซ้ำถ้าย้าย (คง preloadCombat)
- CSS: ลบ `.br-pop*`, `.br-call*`, `.br-puff`, `.br-proj*` (ย้ายไป .brfx แล้ว) · เก็บ `br-pop-rise`/`br-rise`/`br-fly` keyframes ที่ไม่ใช้แล้วทิ้ง

- [ ] **Step 5: build + dev + iPhone**

`npm run build` → `✓ built` · dev → เลขดาเมจ/callout/💀/projectile ยังโผล่ครบ (คราวนี้จาก fx pool) · **iPhone:** melee ยังเป็นการ์ดพุ่งเดิม แต่ ephemeral มาจาก pool — fps ควรดีขึ้นบางส่วน

- [ ] **Step 6: Commit**

```bash
git add src/components/battle/BattleReplay.vue
git commit -m "Battle: Phase 2a-2 ย้าย pops/callouts/projectile ไป fx pool (ephemeral ออกจาก Vue reactivity)"
```

---

## Task 9: Phase 2b — highlight → classList + ring/burst FX (ถอด card lift/shake/glow)

**Files:**
- Modify: `src/components/battle/BattleReplay.vue`

**Interfaces:**
- ลบ refs `acting`, `winding`, `flashing` → ใช้ `classList` บน `els[uid]` โดยตรง + `fx.ring`/`fx.burst`

- [ ] **Step 1: highlight helper (classList ตรง ไม่ผ่าน ref)**

```js
function highlight(uid, cls, on = true) { const el = els[uid]; if (el) el.classList[on ? 'add' : 'remove'](cls) }
function clearHighlights() { Object.values(els).forEach(el => el && el.classList.remove('windup', 'acting', 'flash')) }
```

- [ ] **Step 2: applyAttack ใช้ ring + classList (แทน winding/acting refs)**

```js
async function applyAttack(e) {
  const g = gen
  highlight(e.attacker, 'windup')
  await fx.ring(e.attacker, 'windup'); if (g !== gen) return
  highlight(e.attacker, 'windup', false); highlight(e.attacker, 'acting')
  await playMotion(e); if (g !== gen) return
  applyImpact(e, g)                                  // + highlight(e.target,'flash') + burst
  highlight(e.attacker, 'acting', false)
  if (e.crit && !lite.value) await wait(REPLAY_CFG.hitStopMs / speed.value)
}
```

ใน `applyImpact` เพิ่ม: `highlight(e.target, 'flash'); fx.burst(e.target); setTimeout(() => { if (g === gen) highlight(e.target, 'flash', false) }, 250)` · ลบ `setWindupVars`/`--wx`/`--wy` (ไม่มี card lean แล้ว)

- [ ] **Step 3: ลบ refs + unitClass + CSS card-motion/glow**

- ลบ `acting`, `winding`, `flashing` refs · `unitClass(uid)` เหลือ `{ dead: (hp.value[uid] ?? 100) <= 0 }`
- CSS: ลบ `.br-unit.acting` transform, `.br-unit.windup` transform, `.br-unit.flash` animation + `br-shake` keyframe, `.br-unit::after` ทั้งหมด · **เพิ่ม** cheap border highlight: `.br-unit.acting, .br-unit.windup { border-color: #fde68a; }` `.br-unit.flash { border-color: #f87171; }`
- reset/skip: แทน clear reactive ด้วย `clearHighlights()`

- [ ] **Step 4: build + dev + iPhone**

`npm run build` → `✓ built` · dev → windup=ขอบเหลือง+ring, โดนตี=ขอบแดง+burst, ไม่มี card lift/shake แล้ว (melee lunge ยังเป็น inline transform เดิม) · iPhone: fps ดีขึ้นชัด

- [ ] **Step 5: Commit**

```bash
git add src/components/battle/BattleReplay.vue
git commit -m "Battle: Phase 2b-1 highlight → classList + ring/burst FX (ถอด card lift/shake/glow)"
```

---

## Task 10: Phase 2b — melee = fx.cardLunge + meleeMode flag (ถอด inline lunge + Layers acceptance)

**Files:**
- Modify: `src/components/battle/BattleReplay.vue`

**Interfaces:**
- Consumes: `fx.cardLunge(el, from, to)`, `fx.dash(from, to, char)`
- Produces: `meleeMode` const/flag ('card' | 'dash' จาก `?melee=`)

- [ ] **Step 1: meleeMode flag**

```js
const meleeMode = new URLSearchParams(location.search).get('melee') === 'dash' ? 'dash' : 'card'
```

- [ ] **Step 2: playMotion melee → fx**

แทน melee branch (inline `el.style.transform` lunge เดิม) ด้วย:

```js
function playMotion(e) {
  if (lite.value) return wait(REPLAY_CFG.liteMotionMs / speed.value)
  const def = defForUid(e.attacker)
  if (atkStyleOf(def) === 'ranged') return fx.projectile(e.attacker, e.target, projectileOf(def))
  if (meleeMode === 'dash') return fx.dash(e.attacker, e.target, def.emoji)
  return fx.cardLunge(els[e.attacker], e.attacker, e.target)
}
```

- [ ] **Step 3: ลบโค้ด lunge เดิม + zIndex bookkeeping**

ลบ inline `el.style.zIndex='7'`/`transition`/`transform` melee เดิมใน component (cardLunge จัดการเองใน fx) · ลบ `.br-unit { transition: transform }` เหลือ `transition: border-color`

- [ ] **Step 4: 🔴 Layers acceptance (iPhone) — DoD Phase 2**

- เปิด `npm run dev` บน iPhone Safari + Layers inspector, กด `✨ เอฟเฟกต์เต็ม` (ปิด lite)
- เล่น battle melee-หนัก → **ยืนยัน: ตอน melee เห็น layer เพิ่มแค่ 1 ใบ (การ์ดที่ lunge) แล้วหายทันทีที่จบ** · pool คงที่ · ไม่มีการ์ดอื่น/hp-fill/::after ขึ้น layer
- ยืนยัน `getComputedStyle($('.br-unit')).transform === 'none'` ตอนไม่ได้ lunge + ไม่มี `transition: transform`
- ถ้าเห็น layer เพิ่มเกิน 1 หรือการ์ดค้าง layer = ยังหลุด fix#4 → หา transform/paint-toggle ตกค้าง

- [ ] **Step 5: build + Commit**

`npm run build` → `✓ built`

```bash
git add src/components/battle/BattleReplay.vue
git commit -m "Battle: Phase 2b-2 melee = fx.cardLunge (1 animation out-and-back) + meleeMode flag"
```

---

## Task 11: Phase 3 — จูน + วัด fps ตัดสิน + flip default + ลบโค้ดตาย

**Files:**
- Modify: `src/components/battle/BattleReplay.vue`
- Remove: dev harness ใน `src/views/ArenaView.vue`

- [ ] **Step 1: 🔴 วัด fps ตัดสิน card vs dash (iPhone จริง)**

- scenario 4v4 melee-หนัก, `?fps=1`, วัดทั้ง ×1 และ ×4, ช่วง combat
- **ผ่าน (คง card):** เขียวตลอด/เหลืองนานๆ ครั้ง → เก็บ `meleeMode='card'` เป็น default
- **แดงซ้ำๆ ตรง melee + Layers ยืนยันการ์ด:** เปลี่ยน default เป็น `'dash'` (แก้ Step 1 Task 10: default `'dash'`, `?melee=card` เพื่อลอง)
- bisect ก่อนโทษ: ลองปิด ring/pop ชั่วคราวถ้าเหลือง cluster

- [ ] **Step 2: flip default lite (มือถือ) → full + precedence**

แก้ `initLite()`:

```js
function initLite() {
  try { const s = localStorage.getItem(LITE_KEY); if (s !== null) return s === '1' } catch {}   // user choice ชนะเสมอ
  try { if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return true } catch {} // a11y ชนะ default
  return false                                                                                     // default = full (ทุกอุปกรณ์)
}
```

(ลบ `pointer:coarse` default ออก — v3 ลื่นบนมือถือแล้ว)

- [ ] **Step 3: lite ปิดเฉพาะ motion คงเลขดาเมจ**

ยืนยันใน `applyImpact`: `fx.pop`/`fx.callout`/`fx.koPuff` **เรียกเสมอ** (ไม่ gate ด้วย lite) · `fx.ring`/`cardLunge`/`dash`/`projectile`/`burst` gate ด้วย `!lite.value` (lite → `wait()` แทน) · `.br-lite` CSS: ให้ `.brfx-pop`/`.brfx-call` คงโชว์ (pop ใช้ animate สั้น ok บน lite; ถ้าต้องนิ่งจริงเพิ่ม `.br-lite .brfx-*{animation:none}` — เทสก่อน)

- [ ] **Step 4: ลบโค้ดตาย (ชี้ชื่อ selector)**

- ลบ dev harness ใน ArenaView (Task 6)
- ลบ keyframes เดิมที่ไม่ใช้: `br-pop-rise`, `br-rise`, `br-fly`, `br-shake` (ถ้ายังเหลือ), `br-hitstop`
- ลบ CSS `.br-lite` override เดิมที่อ้าง element ที่ไม่มีแล้ว (`.br-lite .br-hp-fill`, ฯลฯ ที่ยังใช้ ให้เก็บ)
- ลบ `hitStop` ที่ตายแล้ว (ถ้ายังเหลือซาก) · ยืนยันไม่มี `will-change` ถาวรบน `.br-unit`/`.br-hp-fill`/`.br-box`/`::after`

- [ ] **Step 5: build + dev เทสครบ (full + lite + reduced-motion)**

`npm run build` → `✓ built` · dev: default = full มี motion, กด lite = นิ่งแต่มีเลข, จำลอง reduced-motion (DevTools) = auto lite

- [ ] **Step 6: Commit + push (ขึ้น live)**

```bash
git add src/components/battle/BattleReplay.vue src/views/ArenaView.vue
git commit -m "Battle: Phase 3 flip default full + วัด fps card-lunge + reduced-motion + ลบโค้ดตาย"
git push origin master
```

- [ ] **Step 7: 🔴 verify บน production (iPhone Safari incognito)**

หลัง GitHub Actions deploy (~2 นาที) → เปิด `pikar10tu.github.io/rxtu10/?fps=1` incognito บน iPhone → battle เต็มลื่น (เขียว/เหลืองอ่อน) + มี motion ครบ → ปิดเคสกระตุก

---

## Self-Review

**Spec coverage:** §2 doctrine → Task 9-10 (cards static + melee exception) ✓ · §3 fx pool API → Task 2-5 ✓ · §4 sequencer async + hitStop + speed + highlight removal → Task 7,9 ✓ · §5 lite คงเลข + preload → Task 8,11,1 ✓ · §7 phases → Task 1,2-6,7-8,9-10,11 ✓ · §8 cleanup checklist → Task 7 step4, Task 8-10 cleanup, Task 11 ✓ · non-scoped CSS → Task 5 ✓ · mount contract → Task 8 ✓ · fx resolve-safe → Task 2 `run()` + Task 3-5 ✓ · Layers acceptance → Task 10 ✓ · flip default → Task 11 ✓

**Placeholder scan:** ไม่มี TBD/TODO · code steps มีโค้ดจริงครบ · verify = build+dev+iPhone (ระบุชัด repo ไม่มี DOM test)

**Type consistency:** `fx.cardLunge(el, from, to)` (Task 5 def = Task 10 use) ✓ · `fx.attach({boxEl, layerEl, getEl})` (Task 2 = Task 8 use) ✓ · `fx.pop(uid,{dmg,crit,eff})` (Task 3 = Task 8) ✓ · `centerOf` ย้ายเข้า fx (Task 2) → component ใช้ `fx.centerOf` (Task 8 step4) ✓ · `meleeMode` (Task 10) ✓ · `run(el,keyframes,{duration,easing,fill})` (Task 2 = Task 4-5) ✓

**หมายเหตุ dependency:** Task ต้องทำเรียง 1→11 (2a ก่อน 2b; fx pool (2-5) ก่อน wire (8+)) · Task 7 (async chain) ต้องก่อน 8-10
