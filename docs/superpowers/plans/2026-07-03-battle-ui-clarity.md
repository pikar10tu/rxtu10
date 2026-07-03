# Battle UI Clarity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** ทำให้ replay การต่อสู้อ่านรู้เรื่อง — telegraph ก่อนตี, melee พุ่งถึงตัวเป้า, เลขดาเมจอ่านออก, หน้าสรุปเป็น modal แยก

**Architecture:** แก้ไฟล์เดียว `src/components/battle/BattleReplay.vue` (template + script + scoped style) โดยขยาย state machine เดิม (`step()` + setTimeout chain) — เพิ่มเฟส windup ก่อน motion ใน `applyAttack`, ปรับ `playMotion` melee เป็นพุ่ง 100%, ขยายเลขดาเมจ, ย้ายสรุปผลจาก `.br-ctrl` เข้า modal ใหม่ ไม่แตะ engine (`utils/battleEngine.js`) และ log format เลย

**Tech Stack:** Vue 3 SFC (script setup) + scoped CSS · ไม่มี dependency ใหม่

**Spec:** `docs/superpowers/specs/2026-07-03-battle-ui-clarity-design.md`

## Global Constraints

- แก้ไฟล์เดียวเท่านั้น: `src/components/battle/BattleReplay.vue` — ห้ามแตะ `utils/battleEngine.js`, `utils/battleSummary.js`, log format, และไฟล์อื่นทุกไฟล์
- emoji ทุกตัวในเทมเพลตต้องผ่าน `<Emoji :char="..."/>` — ห้าม emoji ดิบ (tofu บนบางเครื่อง)
- ทุก timing ต้องหารด้วย `speed.value` (×1/×2/×4) เหมือนโค้ดเดิม ยกเว้น `resultDelayMs` (จังหวะเปิด modal — คงที่ ไม่ขึ้นกับ speed)
- ตัวเลข timing ที่ ×1: `windupMs: 250` · `lungeMs: 250` · `projMs: 280` (เดิม) · `baseDelay: 380` (เดิม) · เลขดาเมจแสดง `popMs: 900` · เปิด modal หลังจบ `resultDelayMs: 500`
- ขนาดเลขดาเมจ: ปกติ **1.5rem** / crit **2rem** / weak 1.1rem · ลอยขึ้น **40px**
- commit message รูปแบบ `Area: อะไร (ทำไม)` ไทยปนอังกฤษ (ดู CLAUDE.md)
- verify ทุก task: `npm run build` ผ่าน + เทสเดิมผ่าน (`node --test src/utils/*.test.js src/data/*.test.js` — รันใน bash) — ไม่มี pure util ใหม่ จึงไม่มีเทสใหม่
- ก่อนเริ่ม Task 1: สร้าง backup branch `backup/pre-battle-ui-clarity` จาก HEAD ปัจจุบัน (`git branch backup/pre-battle-ui-clarity`)

## สถานะโค้ดปัจจุบัน (อ่านก่อนแก้)

`BattleReplay.vue` 414 บรรทัด — จุดที่เกี่ยวข้อง:

- `REPLAY_CFG` (บรรทัด ~122): `{ baseDelay: 380, speeds: [1, 2, 4], lungeMs: 150, projMs: 280, hitStopMs: 130 }`
- `applyAttack(e)` (บรรทัด ~236): ตั้ง `acting` แล้วเรียก `playMotion` ทันที — **ไม่มี windup**
- `playMotion(e, onImpact)` (บรรทัด ~204): ranged = projectile ข้ามสนาม (ทำงานดีอยู่แล้ว), melee = lunge inline transform แค่ `* 0.55` ใน 150ms
- `step()` (บรรทัด ~254): setTimeout chain, `delay = baseDelay/speed`, crit บวก hitStop extra
- `skipToEnd()` (บรรทัด ~276): เคลียร์ pops/callouts/projectiles แล้วเซ็ต `idx = log.length`
- `reset()` (บรรทัด ~169): เคลียร์ทุก state + `runIntro()` (READY?→GO!)
- สรุปผล: อยู่ใน `.br-ctrl` template ส่วน `<template v-else>` (บรรทัด 64–90) + CSS `.br-ov.result` ทำ overlay เลื่อนได้ (บรรทัด 320–326)
- `unitClass(uid)` (บรรทัด ~290): คืน `{ acting, flash, dead }`

---

### Task 1: Telegraph (windup ก่อนตี) + จังหวะเวลาใหม่ + generation guard

**Files:**
- Modify: `src/components/battle/BattleReplay.vue`

**Interfaces:**
- Consumes: `applyAttack(e)` / `step()` / `reset()` / `skipToEnd()` / `unitClass(uid)` / `els` / `centerOf(uid)` เดิมในไฟล์
- Produces (task หลังพึ่งพา):
  - `REPLAY_CFG.windupMs` (250) และ `REPLAY_CFG.lungeMs` เปลี่ยนเป็น 250
  - ref `winding` (uid ที่กำลังเงื้อ | null) + ตัวแปร `windupTimer`
  - ตัวแปร `gen` (เลข generation) — callback ทุกตัวที่แตะ game state ต้อง capture `const g = gen` แล้วเช็ก `g === gen` ก่อนทำงาน (reset/skipToEnd จะ `gen++` เพื่อยกเลิก callback ค้าง)
  - helper `motionMsOf(e)` คืน ms ของเฟส motion (projMs ถ้า attacker เป็น ranged, ไม่งั้น lungeMs)
  - คลาส CSS `.br-unit.windup` ใช้ CSS vars `--wx`/`--wy` (ตั้ง inline โดย `startWindup`)

- [ ] **Step 1: ปรับ `REPLAY_CFG` เพิ่ม windupMs + lungeMs ใหม่ + ค่าที่ task หลังใช้**

แทนที่บรรทัดเดิม:
```js
const REPLAY_CFG = { baseDelay: 380, speeds: [1, 2, 4], lungeMs: 150, projMs: 280, hitStopMs: 130 }
```
ด้วย:
```js
// windupMs = เงื้อก่อนตี (telegraph) · lungeMs = พุ่งขาไป (เด้งกลับอีกเท่าตัว) · popMs = เลขดาเมจค้างบนจอ
// resultDelayMs = เว้นจังหวะให้เห็นสนามจบก่อนเปิด modal สรุป (คงที่ ไม่หารด้วย speed)
const REPLAY_CFG = { baseDelay: 380, speeds: [1, 2, 4], windupMs: 250, lungeMs: 250, projMs: 280, hitStopMs: 130, popMs: 900, resultDelayMs: 500 }
```

- [ ] **Step 2: เพิ่ม state windup + generation guard**

ใต้บรรทัด `const introPhase = ref(null)` / กลุ่มตัวแปร timer เดิม (`let introTimer = null` และ `let timer = null, ...`) เพิ่ม:
```js
const winding = ref(null)        // uid ที่กำลังเงื้อ (telegraph) — โชว์คลาส .windup
let windupTimer = null
let gen = 0                      // generation guard — reset/skip เพิ่มค่า เพื่อให้ callback ค้างจาก setTimeout รู้ตัวว่าโดนยกเลิก
```

- [ ] **Step 3: แตก windup ออกเป็นเฟสแรกของ `applyAttack`**

แทนที่ `applyAttack` เดิมทั้งฟังก์ชัน:
```js
function applyAttack(e) {
  acting.value = e.attacker
  playMotion(e, () => {
    ...
  })
}
```
ด้วย (โค้ดชุด impact ด้านในคงเดิมทุกบรรทัด แค่ย้ายมาอยู่ใต้ windup + เพิ่ม gen guard):
```js
function applyAttack(e) {
  const g = gen
  startWindup(e, () => {
    if (g !== gen) return                       // โดน reset/skip ระหว่างเงื้อ
    acting.value = e.attacker
    playMotion(e, () => {
      if (g !== gen) return                     // โดน reset/skip ระหว่างพุ่ง/ยิง
      flashing.value = e.target
      hp.value = { ...hp.value, [e.target]: Math.max(0, Math.round((e.targetHpAfter / (maxHp[e.target] || 1)) * 100)) }
      const k = popKey++
      pops.value = { ...pops.value, [e.target]: [...(pops.value[e.target] || []), { k, dmg: e.dmg, crit: e.crit, eff: e.eff }] }
      setTimeout(() => { pops.value = { ...pops.value, [e.target]: (pops.value[e.target] || []).filter(p => p.k !== k) } }, 600)
      if (e.eff === 'super' || e.eff === 'weak') {
        const ck = calloutKey++
        const cal = e.eff === 'super' ? { text: 'แพ้ทาง! ', icon: '⚡' } : { text: 'ต้านทาน ', icon: '🛡️' }
        callouts.value = { ...callouts.value, [e.target]: { k: ck, ...cal, kind: e.eff } }
        setTimeout(() => { if (callouts.value[e.target]?.k === ck) { const c = { ...callouts.value }; delete c[e.target]; callouts.value = c } }, 750)
      }
      if (e.crit) { hitStop.value = true; setTimeout(() => hitStop.value = false, REPLAY_CFG.hitStopMs / speed.value) }
    })
  })
}

// telegraph: ลอยขึ้น + เรืองแสง + เอนถอยหลัง (ทิศตรงข้ามเป้า) ค้าง windupMs แล้วค่อยเข้าเฟส motion
function startWindup(e, onDone) {
  winding.value = e.attacker
  const el = els[e.attacker], a = centerOf(e.attacker), t = centerOf(e.target)
  if (el && a && t) {
    const dx = t.x - a.x, dy = t.y - a.y, len = Math.hypot(dx, dy) || 1
    el.style.setProperty('--wx', (-dx / len * 7).toFixed(1) + 'px')   // เอนถอย ~7px หนีเป้า
    el.style.setProperty('--wy', (-dy / len * 7 - 4).toFixed(1) + 'px') // + ลอยขึ้นอีก 4px
  }
  windupTimer = setTimeout(() => { winding.value = null; onDone() }, REPLAY_CFG.windupMs / speed.value)
}
```
(หมายเหตุ: setTimeout ลบ pop ยังเป็น 600 ในโค้ดชุดนี้ — Task 3 จะเปลี่ยนเป็น `REPLAY_CFG.popMs` เอง อย่าเพิ่งแก้ที่นี่)

- [ ] **Step 4: ปรับ `step()` — คิวจังหวะของ attack ต้องรอ windup + motion ก่อนค่อยนับ baseDelay**

ลำดับตาม spec: windup → motion → impact → คั่น `baseDelay` เดิม (baseDelay ยังเป็นตัว tune หลักถ้าจอจริงรู้สึกช้า)
แทนที่ `step()` เดิมทั้งฟังก์ชันด้วย:
```js
// motion ms ของ event attack (ranged = projectile, melee = lunge) — ใช้คำนวณคิวจังหวะ
function motionMsOf(e) {
  return atkStyleOf(defForUid(e.attacker)) === 'ranged' ? REPLAY_CFG.projMs : REPLAY_CFG.lungeMs
}

function step() {
  clearTimeout(timer)
  if (paused.value) return
  if (idx.value >= log.value.length) { acting.value = null; flashing.value = null; return }
  const e = log.value[idx.value]
  const h = handlers[e.t]
  if (h) h(e)                                   // type ที่ไม่รู้จัก = ข้ามเงียบ
  idx.value++
  const noDelay = e.t === 'round'               // round marker ไม่หน่วงเวลา
  // attack กินเวลาเพิ่ม: windup + motion (impact เกิดตอนจบ motion) + hit-stop ตอน crit — แล้วค่อยคั่น baseDelay
  const extra = e.t === 'attack'
    ? (REPLAY_CFG.windupMs + motionMsOf(e) + (e.crit ? REPLAY_CFG.hitStopMs : 0)) / speed.value
    : 0
  if (idx.value < log.value.length) timer = setTimeout(step, noDelay ? 0 : delay.value + extra)
  else { acting.value = null; flashing.value = null }
}
```

- [ ] **Step 5: เคลียร์ windup ให้ครบใน `reset()` / `skipToEnd()` / `onUnmounted`**

ใน `reset()` — แทนบรรทัดแรก:
```js
  clearTimeout(timer); clearTimeout(introTimer); introPhase.value = null   // กันค้างตอน replay ใหม่
```
ด้วย:
```js
  gen++                                                                     // ยกเลิก callback ค้างทุกตัว
  clearTimeout(timer); clearTimeout(introTimer); clearTimeout(windupTimer)
  introPhase.value = null; winding.value = null                             // กันค้างตอน replay ใหม่
```

ใน `skipToEnd()` — แทนบรรทัดแรก `clearTimeout(timer)` ด้วย:
```js
  gen++                                                    // ตัด callback windup/lunge/impact ที่ค้างอยู่
  clearTimeout(timer); clearTimeout(windupTimer); winding.value = null
  Object.values(els).forEach(el => { if (el) { el.style.transform = ''; el.style.transition = ''; el.style.zIndex = '' } })  // ล้าง lunge ค้างกลางทาง
```

ใน `onUnmounted` — แทนบรรทัดเดิมด้วย:
```js
onUnmounted(() => { clearTimeout(timer); clearTimeout(introTimer); clearTimeout(windupTimer) })
```

- [ ] **Step 6: โชว์คลาส `.windup` + CSS**

`unitClass(uid)` — แทนที่ด้วย:
```js
function unitClass(uid) {
  return { acting: acting.value === uid, windup: winding.value === uid, flash: flashing.value === uid, dead: (hp.value[uid] ?? 100) <= 0 }
}
```

ใน `<style scoped>` ใต้บรรทัด `.br-unit.acting { ... }` เพิ่ม:
```css
/* telegraph: เงื้อก่อนตี — ลอย+เอนถอยหลัง (--wx/--wy ตั้ง inline จาก startWindup) + เรืองแสงเหลือง */
.br-unit.windup { transform: translate(var(--wx, 0px), var(--wy, -6px)) scale(1.08); z-index: 3;
  box-shadow: 0 0 0 3px #fde68a, 0 0 18px 4px rgba(253, 230, 138, .55); }
```

- [ ] **Step 7: Verify**

Run (bash): `cd /d/RXTU/rxtu10-v2 && npm run build && node --test src/utils/*.test.js src/data/*.test.js 2>&1 | tail -5`
Expected: build ✓ + เทสผ่านทั้งหมด (fail 0)
เปิด `npm run dev` เข้าหอคอย (`/#/tower`) สู้ 1 ครั้ง: เห็นตัวโจมตีลอย+เรืองแสงเหลือง ~0.25 วิ **ก่อน** พุ่ง/ยิงทุกครั้ง · pause ระหว่างเงื้อ = ตีจบแล้วหยุด · ข้ามไปผล = ไม่มีตัวค้างเรืองแสง

- [ ] **Step 8: Commit**

```bash
git add src/components/battle/BattleReplay.vue
git commit -m "Battle: telegraph เงื้อก่อนตี 250ms + gen guard กัน callback ค้าง (เห็นล่วงหน้าว่าตัวไหนจะตี)"
```

---

### Task 2: Melee พุ่งสุดตัว (Hearthstone-style)

**Files:**
- Modify: `src/components/battle/BattleReplay.vue` (เฉพาะฟังก์ชัน `playMotion`)

**Interfaces:**
- Consumes: `REPLAY_CFG.lungeMs` (=250 จาก Task 1) · `gen` guard จาก Task 1 · `els` / `centerOf`
- Produces: melee lunge เดินทาง 100% ถึงจุดศูนย์กลางเป้า + z-index ระหว่างพุ่ง — ไม่มี interface ใหม่ให้ task อื่นใช้

- [ ] **Step 1: แก้ `playMotion` ท่อน melee**

แทนที่ `playMotion` เดิมทั้งฟังก์ชันด้วย (ท่อน ranged คงเดิม เพิ่มแค่ gen guard, ท่อน melee เปลี่ยนระยะ/เวลา/z-index):
```js
function playMotion(e, onImpact) {
  const g = gen
  const def = defForUid(e.attacker)
  if (atkStyleOf(def) === 'ranged') {
    const a = centerOf(e.attacker), t = centerOf(e.target)
    if (a && t) {
      const k = projKey++
      projectiles.value = [...projectiles.value, { k, emoji: projectileOf(def), x0: a.x, y0: a.y, x1: t.x, y1: t.y }]
      setTimeout(() => { projectiles.value = projectiles.value.filter(p => p.k !== k); if (g === gen) onImpact() }, REPLAY_CFG.projMs / speed.value)
      return
    }
  }
  // melee: พุ่งสุดตัวถึงศูนย์กลางเป้า (Hearthstone-style ชนทับ) แล้วเด้งกลับ — z-index สูงกันโดนการ์ดอื่นบัง
  const a = centerOf(e.attacker), t = centerOf(e.target), el = els[e.attacker]
  if (a && t && el) {
    el.style.zIndex = '7'                        // เหนือ proj-layer (5) และ acting (3)
    el.style.transition = `transform ${REPLAY_CFG.lungeMs / speed.value}ms cubic-bezier(.2, .7, .3, 1.1)`
    el.style.transform = `translate(${t.x - a.x}px, ${t.y - a.y}px) scale(1.18)`
    setTimeout(() => {
      if (g === gen) onImpact()
      el.style.transform = ''                    // เด้งกลับที่เดิม (คืน style เสมอ แม้โดน skip — กันการ์ดค้างผิดที่)
      setTimeout(() => { el.style.transition = ''; el.style.zIndex = '' }, REPLAY_CFG.lungeMs / speed.value)
    }, REPLAY_CFG.lungeMs / speed.value)
    return
  }
  onImpact()
}
```
ข้อควรระวัง: `onImpact()` อยู่ใต้ gen guard แต่การคืน `el.style.*` อยู่**นอก** guard เสมอ — ถ้า guard การคืน style ด้วย การ์ดจะค้างกลางสนามหลังกดข้าม

- [ ] **Step 2: Verify**

Run (bash): `cd /d/RXTU/rxtu10-v2 && npm run build`
Expected: build ✓
ใน dev: melee พุ่ง**ทับตัวเป้า**แล้วเด้งกลับ (ไม่หยุดครึ่งทาง) · ตอนพุ่งไม่โดนการ์ดแถวอื่นบัง · ตีข้ามสนามเห็นชัดว่าใครตีใคร · กด "ข้ามไปผล" กลางพุ่ง = การ์ดกลับที่เดิม ไม่ค้าง

- [ ] **Step 3: Commit**

```bash
git add src/components/battle/BattleReplay.vue
git commit -m "Battle: melee พุ่งสุดตัว 100% ถึงเป้า 250ms + z-index กันบัง (จากเดิม 55% ดูเหมือนตีอยู่กับที่)"
```

---

### Task 3: Impact ชัดขึ้น + เลขดาเมจอ่านออก

**Files:**
- Modify: `src/components/battle/BattleReplay.vue` (template ท่อน `.br-pop` + script ท่อน pops + CSS)

**Interfaces:**
- Consumes: `REPLAY_CFG.popMs` (=900 จาก Task 1) · โค้ด impact ใน `applyAttack` (โครงจาก Task 1)
- Produces: pop object เพิ่ม field `x` (offset แนวนอน px) — template ใช้เป็น inline style

- [ ] **Step 1: เพิ่ม offset สุ่ม + อายุ pop 900ms ใน `applyAttack`**

ในโค้ด impact (ใน callback `playMotion` ของ `applyAttack`) แทน 2 บรรทัดนี้:
```js
      const k = popKey++
      pops.value = { ...pops.value, [e.target]: [...(pops.value[e.target] || []), { k, dmg: e.dmg, crit: e.crit, eff: e.eff }] }
      setTimeout(() => { pops.value = { ...pops.value, [e.target]: (pops.value[e.target] || []).filter(p => p.k !== k) } }, 600)
```
ด้วย:
```js
      const k = popKey++
      const x = Math.round(Math.random() * 28 - 14)   // offset แนวนอนสุ่ม ±14px กันเลขหลายป็อปซ้อนทับ
      pops.value = { ...pops.value, [e.target]: [...(pops.value[e.target] || []), { k, dmg: e.dmg, crit: e.crit, eff: e.eff, x }] }
      setTimeout(() => { pops.value = { ...pops.value, [e.target]: (pops.value[e.target] || []).filter(p => p.k !== k) } }, REPLAY_CFG.popMs)
```

- [ ] **Step 2: template — ส่ง offset เข้า inline style (ทั้ง 2 ทีม)**

มี `.br-pop` 2 จุดในเทมเพลต (ทีม B บรรทัด ~24 และทีม A บรรทัด ~44) แก้**ทั้งคู่**จาก:
```html
<span v-for="pop in popsFor('B'+i)" :key="pop.k" class="br-pop" :class="popClass(pop)">-{{ pop.dmg }}</span>
```
เป็น:
```html
<span v-for="pop in popsFor('B'+i)" :key="pop.k" class="br-pop" :class="popClass(pop)" :style="{ marginLeft: pop.x + 'px' }">-{{ pop.dmg }}</span>
```
(จุดทีม A เหมือนกันแต่เป็น `popsFor('A'+i)`)

- [ ] **Step 3: CSS — เลขใหญ่ + stroke + ลอย 40px 0.9 วิ + flash impact แรงขึ้น**

แทนบล็อกเดิม:
```css
.br-pop { position: absolute; top: 0; font-weight: 800; font-size: .9rem; color: #fecaca; text-shadow: 0 1px 2px rgba(0,0,0,.6); animation: br-rise .6s ease-out forwards; pointer-events: none; }
.br-pop.crit { color: #fbbf24; font-size: 1.2rem; }
.br-pop.super { color: #fca5a5; }
.br-pop.weak { color: #cbd5e1; font-size: .78rem; }
@keyframes br-rise { from { transform: translateY(0); opacity: 1 } to { transform: translateY(-24px); opacity: 0 } }
```
ด้วย (แยก keyframe ของ pop ออกจาก `br-rise` — `.br-call` ยังใช้ `br-rise` เดิม ห้ามลบ):
```css
/* เลขดาเมจ: ใหญ่ + stroke เข้ม อ่านออกทุกพื้นหลัง + เด้งแล้วลอย 40px ค้าง .9 วิ */
.br-pop { position: absolute; top: 0; font-weight: 900; font-size: 1.5rem; color: #fecaca; z-index: 6;
  -webkit-text-stroke: 4px rgba(15, 23, 42, .85); paint-order: stroke fill;
  text-shadow: 0 2px 6px rgba(0, 0, 0, .7); animation: br-pop-rise .9s ease-out forwards; pointer-events: none; }
.br-pop.crit { color: #fbbf24; font-size: 2rem; }
.br-pop.super { color: #fca5a5; }
.br-pop.weak { color: #cbd5e1; font-size: 1.1rem; }
@keyframes br-pop-rise {
  0% { transform: translateY(0) scale(.6); opacity: 0 }
  18% { transform: translateY(-6px) scale(1.15); opacity: 1 }
  35% { transform: translateY(-12px) scale(1); opacity: 1 }
  100% { transform: translateY(-40px) scale(1); opacity: 0 }
}
@keyframes br-rise { from { transform: translateY(0); opacity: 1 } to { transform: translateY(-24px); opacity: 0 } }
```
และแทน `.br-unit.flash` เดิม:
```css
.br-unit.flash { animation: br-shake .2s; box-shadow: 0 0 0 3px #f87171; }
```
```css
@keyframes br-shake { 0%,100% { transform: translateX(0) } 25% { transform: translateX(-5px) } 75% { transform: translateX(5px) } }
```
ด้วย (กระพริบขาว + เขย่าแรงขึ้น):
```css
.br-unit.flash { animation: br-shake .25s; box-shadow: 0 0 0 3px #f87171; }
@keyframes br-shake {
  0%, 100% { transform: translateX(0); filter: none }
  15% { filter: brightness(2.2) saturate(.4) }
  25% { transform: translateX(-7px); filter: brightness(1.6) }
  50% { transform: translateX(6px) }
  75% { transform: translateX(-5px) }
}
```

- [ ] **Step 4: Verify**

Run (bash): `cd /d/RXTU/rxtu10-v2 && npm run build`
Expected: build ✓
ใน dev: เลขดาเมจใหญ่อ่านออกชัดบนพื้นหลังการ์ด · crit ใหญ่กว่า+เหลือง · เป้ากระพริบขาวตอนโดน · ตีรัวๆ เลขไม่ซ้อนทับกันพอดี (offset สุ่ม) · callout "แพ้ทาง!/ต้านทาน" ยังลอยเหมือนเดิม

- [ ] **Step 5: Commit**

```bash
git add src/components/battle/BattleReplay.vue
git commit -m "Battle: เลขดาเมจ 1.5rem/crit 2rem + stroke + ลอย 40px .9วิ + impact flash ขาว (อ่านออกทุกพื้นหลัง)"
```

---

### Task 4: หน้าสรุปเป็น modal แยก (+ ปุ่มดูสนาม/ดูสรุป)

**Files:**
- Modify: `src/components/battle/BattleReplay.vue` (template + script + CSS)

**Interfaces:**
- Consumes: `done` / `summary` computed เดิม · `skipToEnd()` / `reset()` (โครงจาก Task 1) · `REPLAY_CFG.resultDelayMs` (=500 จาก Task 1)
- Produces: refs `resultOpen` (modal โชว์อยู่), `resultReady` (จบแล้ว+ผ่านจังหวะรอ — คุมปุ่มลอย "ดูสรุป") + ตัวแปร `resultTimer`

- [ ] **Step 1: state + trigger เปิด modal**

ใต้ `const introPhase = ref(null)` เพิ่ม:
```js
const resultOpen = ref(false)    // modal สรุปโชว์อยู่
const resultReady = ref(false)   // จบไฟต์+ผ่านจังหวะรอแล้ว — ใช้โชว์ปุ่มลอย "ดูสรุป" ตอน peek
let resultTimer = null
```

ใต้ `watch(() => props.data, ...)` (ท้าย script) เพิ่ม:
```js
// ตีจบ → เว้น ~0.5 วิ ให้เห็นสนามจบ แล้วเปิด modal สรุป (skipToEnd เปิดทันทีเอง — เช็ก resultReady กันตั้งซ้ำ)
watch(done, (v) => {
  if (!v || resultReady.value) return
  resultTimer = setTimeout(() => { resultReady.value = true; resultOpen.value = true }, REPLAY_CFG.resultDelayMs)
}, { immediate: true })
```

ใน `reset()` เพิ่มต่อจากบรรทัด `clearTimeout(...)` ที่แก้ไว้ใน Task 1:
```js
  clearTimeout(resultTimer); resultOpen.value = false; resultReady.value = false
```

ท้าย `skipToEnd()` (หลัง `idx.value = log.value.length`) เพิ่ม:
```js
  clearTimeout(resultTimer); resultReady.value = true; resultOpen.value = true   // ข้าม = เปิดสรุปทันที
```

ใน `onUnmounted` เพิ่ม `clearTimeout(resultTimer)`:
```js
onUnmounted(() => { clearTimeout(timer); clearTimeout(introTimer); clearTimeout(windupTimer); clearTimeout(resultTimer) })
```

- [ ] **Step 2: template — ย้ายสรุปออกจาก `.br-ctrl` ไปเป็น modal**

แทนที่บล็อก `.br-ctrl` ทั้งหมด (จาก `<div class="br-ctrl">` ถึง `</div>` ปิดของมัน — เดิมบรรทัด 58–91) ด้วย:
```html
      <div class="br-ctrl" v-if="!done">
        <button class="br-btn sm" @click="togglePause"><Emoji :char="paused ? '▶️' : '⏸️'" /> {{ paused ? 'เล่น' : 'พัก' }}</button>
        <button class="br-btn sm" @click="cycleSpeed">เร็ว ×{{ speed }}</button>
        <button class="br-btn sm" @click="skipToEnd">ข้ามไปผล</button>
      </div>
```

แล้วเพิ่ม **หลัง** `</div>` ปิดของ `.br-box` (ก่อนบล็อก `.br-inspect`) — ปุ่มลอย "ดูสรุป" + modal:
```html
    <!-- peek สนามหลังจบ: ปุ่มลอยกลับเข้าหน้าสรุป -->
    <button v-if="resultReady && !resultOpen" class="br-btn br-peek-btn" @click="resultOpen = true">
      <Emoji char="📋" /> ดูสรุป
    </button>

    <!-- modal สรุปผล — แตะนอกกล่อง = peek สนาม (ไม่ใช่ปิดทิ้ง กันกดพลาด) -->
    <div v-if="resultOpen && summary" class="br-result-ov" @click.self="resultOpen = false">
      <div class="br-modal">
        <div class="br-result" :class="{ win: data.won }">{{ data.won ? (data.winText ?? `ชนะ! ขึ้นชั้น ${data.cleared + 1}`) : (data.loseText ?? 'แพ้ ลองใหม่ได้เลย') }}</div>
        <div v-if="data.won && (data.rewardText ?? data.cleared != null)" class="br-reward"><Emoji char="🎁" /> {{ data.rewardText ?? ('ได้รับ: ขึ้นชั้น ' + (data.cleared + 1)) }}</div>

        <div class="br-sum-team">
          <div class="br-sum-head"><i class="dot me"></i> ทีมคุณ</div>
          <div v-for="u in summary.teamA" :key="u.uid" class="br-sum-row" :class="{ mvp: summary.mvp.A === u.uid, win: data.won, dead: u.dead }">
            <span v-if="summary.mvp.A === u.uid" class="br-mvp">MVP</span>
            <span class="br-sum-face"><Emoji :char="defOf(u.id).emoji" /></span>
            <span class="br-sum-dmg"><Emoji char="⚔️" />{{ u.dmgDealt }}</span>
            <span class="br-sum-dmg taken"><Emoji char="🛡️" />{{ u.dmgTaken }}</span>
          </div>
        </div>

        <div class="br-sum-team">
          <div class="br-sum-head"><i class="dot foe"></i> ศัตรู</div>
          <div v-for="u in summary.teamB" :key="u.uid" class="br-sum-row" :class="{ mvp: summary.mvp.B === u.uid, win: !data.won, dead: u.dead }">
            <span v-if="summary.mvp.B === u.uid" class="br-mvp">MVP</span>
            <span class="br-sum-face"><Emoji :char="defOf(u.id).emoji" /></span>
            <span class="br-sum-dmg"><Emoji char="⚔️" />{{ u.dmgDealt }}</span>
            <span class="br-sum-dmg taken"><Emoji char="🛡️" />{{ u.dmgTaken }}</span>
          </div>
        </div>

        <div class="br-modal-btns">
          <button class="br-btn sm" @click="resultOpen = false"><Emoji char="👀" /> ดูสนาม</button>
          <button class="br-btn" @click="$emit('close')">ปิด</button>
        </div>
      </div>
    </div>
```
หมายเหตุ: เนื้อหาสรุป (result/reward/ตาราง 2 ทีม/MVP/dead) **ก๊อปมาจากบล็อกเดิมทุกบรรทัด** — เปลี่ยนแค่ที่อยู่กับปุ่ม

- [ ] **Step 3: CSS — ลบของเก่า เพิ่ม modal**

**ลบ** 2 บล็อกนี้ (overlay เลื่อนได้ตอน result — ไม่ต้องใช้แล้วเพราะ modal เลื่อนในตัวเอง):
```css
/* result state อาจสูงเกินจอ (สรุป + MVP 2 ทีม + ปุ่มปิด) → ให้ overlay เลื่อนได้
   ไม่งั้นปุ่ม "ปิด" หลุดใต้จอ ดูเหมือนโดน bottom-nav บัง. replay phase ยังล็อกกลางจอเหมือนเดิม */
.br-ov.result { align-items: flex-start; overflow-y: auto; -webkit-overflow-scrolling: touch;
  padding-bottom: calc(16px + env(safe-area-inset-bottom, 0px)); }
```
```css
/* margin:auto = จัดกลางแนวตั้งเมื่อเนื้อหาเตี้ย, เลื่อนได้เมื่อสูงเกินจอ */
.br-ov.result .br-box { margin: auto 0; }
```
และ**ลบ** `.br-sum { ... }` เดิม (กล่องสรุปใน br-ctrl — ย้ายเข้า modal แล้ว):
```css
.br-sum { width: 100%; max-width: 360px; display: flex; flex-direction: column; gap: 8px; margin-bottom: 8px; }
```
ใน template ก็ไม่เหลือ `.br-sum` แล้ว (Step 2 ไม่ได้ใส่กลับ) · ที่ `<div v-if="data" class="br-ov" :class="{ result: done }">` ให้ตัด `:class="{ result: done }"` ออกเหลือ `class="br-ov"` (ไม่มีตัวใช้แล้ว)

**เพิ่ม** ท้าย style (safe-area + เลื่อนในตัว modal = ทายาทของการแก้ bottom-nav เดิม):
```css
/* modal สรุปผล — ทับสนามที่มืดลง เลื่อนในตัวเองได้ ไม่โดน bottom-nav/safe-area บัง */
.br-result-ov { position: fixed; inset: 0; z-index: 425; background: rgba(15, 23, 42, .72);
  display: flex; align-items: center; justify-content: center;
  padding: 16px; padding-bottom: calc(16px + env(safe-area-inset-bottom, 0px)); }
.br-modal { width: 100%; max-width: 380px; background: #1e293b; border: 2px solid rgba(255,255,255,.25);
  border-radius: 18px; padding: 16px; display: flex; flex-direction: column; gap: 8px;
  max-height: calc(100dvh - 72px); overflow-y: auto; -webkit-overflow-scrolling: touch;
  animation: br-modal-in .25s ease; }
.br-modal .br-result { text-align: center; }
@keyframes br-modal-in { from { opacity: 0; transform: scale(.92) translateY(10px) } to { opacity: 1; transform: none } }
.br-modal-btns { display: flex; gap: 8px; justify-content: center; margin-top: 4px; }
/* ปุ่มลอยตอน peek สนาม — เกาะล่างกลาง เหนือ safe-area */
.br-peek-btn { position: fixed; left: 50%; transform: translateX(-50%);
  bottom: calc(20px + env(safe-area-inset-bottom, 0px)); z-index: 424;
  background: #4f46e5; border-color: #fff; box-shadow: 0 6px 20px rgba(0, 0, 0, .45); }
```
(z-index: modal 425 / ปุ่มลอย 424 — ต่ำกว่า inspect popover 430 เสมอ)

- [ ] **Step 4: Verify**

Run (bash): `cd /d/RXTU/rxtu10-v2 && npm run build && node --test src/utils/*.test.js src/data/*.test.js 2>&1 | tail -5`
Expected: build ✓ + เทสผ่านทั้งหมด
ใน dev: ตีจบ → เห็นสนามแป๊บ ~0.5 วิ → modal เด้งขึ้น · "ดูสนาม"/แตะนอกกล่อง → modal หาย เห็นสนาม + ปุ่มลอย "ดูสรุป" · กด "ดูสรุป" → modal กลับมา · "ปิด" → ออกจาก replay · "ข้ามไปผล" → modal เปิดทันที · สู้ใหม่ (reset) → modal ไม่ค้าง

- [ ] **Step 5: Commit**

```bash
git add src/components/battle/BattleReplay.vue
git commit -m "Battle: หน้าสรุปเป็น modal แยก + ปุ่มดูสนาม/ดูสรุป peek (สนามไม่โดนสรุปดันจนต้องเลื่อนยาว)"
```

---

### Task 5: Regression ครบวงจร + checklist จอจริง

**Files:**
- Modify: ไม่มีไฟล์ใหม่ — ตรวจ `src/components/battle/BattleReplay.vue` อย่างเดียว (แก้เฉพาะถ้าเจอบั๊กจากข้อตรวจด้านล่าง)

**Interfaces:**
- Consumes: ทุกอย่างจาก Task 1–4
- Produces: รายงานผลตรวจ + checklist เทสจอจริงสำหรับ user

- [ ] **Step 1: ตรวจ regression ตาม spec ใน dev (`npm run dev` — ทั้งหอคอย TowerView และสนามประลอง ArenaView ถ้าเปิดได้)**

ไล่ทีละข้อ บันทึกผลทุกข้อ:
1. พัก/เล่น ทำงานถูกทุกเฟส — pause กลาง windup แล้วกดเล่นต่อ ไม่มีการตีซ้อน/ข้ามจังหวะ
2. เร่ง ×1/×2/×4 — windup/lunge/projectile เร็วตามสัดส่วน ไม่มีอนิเมชันหลุดจังหวะ
3. ข้ามไปผล — ทุกจังหวะ (กลาง windup / กลาง lunge / กลาง projectile): ไม่มีตัวเรืองแสงค้าง ไม่มีการ์ดค้างผิดที่ ไม่มี pop/projectile ค้าง + modal เปิดทันที + HP สุดท้ายถูก
4. แตะตัว = pause + inspect popover — รวมแตะระหว่าง windup · ปิด popover แล้วกดเล่นต่อได้
5. เล่นจบเอง → modal เด้งหลัง ~0.5 วิ · วน "ดูสนาม" ↔ "ดูสรุป" หลายรอบ · "ปิด" emit ถูก
6. สู้ใหม่ (replay ใหม่ = `reset()`) — intro READY?→GO! มา, modal เก่าไม่ค้าง, ไม่มี timer รั่ว (ดู console ไม่มี error)
7. grep เช็คไม่มี emoji ดิบใหม่ในเทมเพลต: ทุกตัวที่เพิ่ม (📋 👀) ต้องอยู่ใน `<Emoji char="..."/>` — run: `grep -n 'char="' src/components/battle/BattleReplay.vue`

- [ ] **Step 2: รันเทส + build รอบสุดท้าย**

Run (bash): `cd /d/RXTU/rxtu10-v2 && node --test src/utils/*.test.js src/data/*.test.js 2>&1 | tail -5 && npm run build`
Expected: เทสผ่านทั้งหมด (fail 0) + build ✓

- [ ] **Step 3: Commit (ถ้ามีแก้บั๊กจาก Step 1) + สรุป checklist จอจริงให้ user**

ถ้ามีแก้: `git commit -m "Battle: เก็บ regression จากตรวจรอบสุดท้าย (<อะไร>)"`

checklist เทสจอจริง (มือถือ) ส่งให้ user หลัง deploy:
- [ ] เห็นเงื้อ (ลอย+เรืองเหลือง) ก่อนตีทุกครั้ง ทั้ง melee/ranged
- [ ] melee พุ่งชนถึงตัวเป้า ไม่หยุดครึ่งทาง ไม่โดนการ์ดอื่นบัง
- [ ] เลขดาเมจ/crit อ่านออกชัดบนมือถือ
- [ ] modal สรุปเด้งหลังจบ + ดูสนาม/ดูสรุป/ปิด ครบ + เลื่อนใน modal ได้ ปุ่มไม่โดน bottom-nav บัง
- [ ] ปุ่ม พัก/เร่ง/ข้าม + แตะดูตัว (inspect) ยังทำงาน
- [ ] ลองทั้งหอคอยและสนามประลอง (ถ้า pvpOpen เปิด — ไม่งั้นหอคอยอย่างเดียวพอ)
