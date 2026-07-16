# Tower 100-Floor Rebalance Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** ยืดหอคอยเป็น 100 ชั้น + rebalance ให้ต้นเกมไหลลื่น กลางเกมสร้างทีม ปลายเกม (70+) วัดการจัดทีม + เพิ่มแถบเทียบเพื่อน + ลดเรท REFUND migrate + ยก UI/UX

**Architecture:** ตรรกะหอคอยเป็น pure data (`data/towerFloors.js`) — rebalance ที่นี่ + เทส `node --test`. แถบเทียบใช้ ranking util บริสุทธิ์ (`utils/towerRivals.js`) ป้อนจาก `members` store. UI polish นำโดย Fable (design sub-spec) แล้ว execute ใน `TowerView.vue`. ลด REFUND ใน `utils/petMigration.js`.

**Tech Stack:** Vue 3 + Pinia + Firebase · pure-util tests via `node --test` (ไม่มี central runner) · build via `npm run build`

## Global Constraints

- เทส pure util รันตรง: `node --test src/<path>.test.js` — ไม่มี test runner กลาง/lint (ตรวจ Vue ด้วย `npm run build` + dev)
- overlay/modal `position:fixed` ใต้ `<RouterView>` ต้องห่อ `<Teleport to="body">` เสมอ (CLAUDE.md ข้อ 6)
- เขียน user doc ผ่าน `auth.patchUser(optimistic, server)` เท่านั้น · ข้อความ user ผ่าน `cleanText(str, LIMITS.xxx)`
- โทนข้อความ: ยึด `docs/voice-guide.md` · commit `Area: อะไร (ทำไม)` ไทยปนอังกฤษ · scoped style · ธีม indigo `#4f46e5`
- ค่า balance ทั้งหมด tunable — เก็บเป็น const ชื่อชัดบนสุดไฟล์
- `BATTLE_SLOTS = 3` (จาก `data/residence.js`) — จำนวนบอทสูงสุด/ทีม
- **ไม่แตะ:** `battleEngine` loop · gacha/merge · `resolveBattleTeam` · Teleport wrappers ที่มีอยู่

**Spec อ้างอิง:** `docs/superpowers/specs/2026-07-16-tower-100floor-rebalance-design.md`

---

### Task 1: Tower numeric rebalance (100 ชั้น, botCount, grade, bonus, zones)

**Files:**
- Modify: `src/data/towerFloors.js` (ทั้งไฟล์ — TOWER_MAX, botCount, tier, grade, getFloorTeam, getTowerBonus, zones, milestones)
- Test: `src/data/towerFloors.test.js`

**Interfaces:**
- Produces: `TOWER_MAX=100` · `botCount(f)→1|2|3` · `botGrade(f)→0..5` · `getFloorTeam(f)→[{id,rarity,element,grade}]` (ยาว = botCount) · `getTowerBonus(best)→number` · `floorZone(f)→{name,art,color,from,to}` · `TOWER_BONUS_FLOORS=[20,40,60,70]` · `BONUS_CAP_FLOOR=70`
- Consumes: `PETS` (`data/index.js`), `BATTLE_SLOTS` (`data/residence.js`)

> Task 1 ยังใช้ธาตุเดิม `ELS[(f+i)%3]` ทุกชั้น (การเอนธาตุ 70+ อยู่ Task 2)

- [ ] **Step 1: เขียนเทสที่จะ fail** — แทนที่ `src/data/towerFloors.test.js` ทั้งไฟล์:

```js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { getFloorTeam, getTowerBonus, TOWER_MAX, floorZone, botCount, botGrade, TOWER_BONUS_FLOORS, BONUS_CAP_FLOOR } from './towerFloors.js'

test('TOWER_MAX = 100', () => { assert.equal(TOWER_MAX, 100) })

test('botCount: ชั้น 1=1, ชั้น 2=2, ชั้น 3+=3', () => {
  assert.equal(botCount(1), 1)
  assert.equal(botCount(2), 2)
  assert.equal(botCount(3), 3)
  assert.equal(botCount(50), 3)
  assert.equal(botCount(100), 3)
})

test('getFloorTeam: ยาวตาม botCount + deterministic + fields ครบ', () => {
  assert.equal(getFloorTeam(1).length, 1)
  assert.equal(getFloorTeam(2).length, 2)
  for (const f of [3, 20, 55, 70, 100]) {
    const t = getFloorTeam(f)
    assert.equal(t.length, 3)
    assert.deepEqual(getFloorTeam(f), t)  // deterministic
    t.forEach(p => { assert.ok(p.id && p.rarity && p.element); assert.ok(p.grade >= 0 && p.grade <= 5) })
  }
})

test('botGrade: 0 ถึงชั้น 20, ไต่ 1→4, V แตะที่ชั้น 70 พอดี, คง V ถึง 100', () => {
  assert.equal(botGrade(1), 0)
  assert.equal(botGrade(20), 0)
  assert.equal(botGrade(21), 1)
  assert.equal(botGrade(69), 4)
  assert.equal(botGrade(70), 5)   // first V ที่ 70 ไม่ใช่ 65
  assert.equal(botGrade(100), 5)
})

test('เกรดเฉลี่ยชั้นสูง ≥ ชั้นต่ำ (หาร length จริง)', () => {
  const avg = (f) => { const t = getFloorTeam(f); return t.reduce((s, p) => s + p.grade, 0) / t.length }
  assert.ok(avg(100) >= avg(20))
  assert.ok(avg(60) >= avg(30))
})

test('getTowerBonus: ตันที่ชั้น 70 = 20000, MIN ชั้น 1 = 50, flat 71–100', () => {
  assert.equal(getTowerBonus(0), 0)
  assert.equal(getTowerBonus(1), 50)
  assert.equal(getTowerBonus(70), 20000)
  assert.equal(getTowerBonus(100), 20000)   // flat หลัง cap
  assert.equal(getTowerBonus(70.9), 20000)  // floor
  assert.equal(BONUS_CAP_FLOOR, 70)
})

test('getTowerBonus: strictly-increasing ชั้น 1→70 แล้ว flat 70→100', () => {
  let prev = getTowerBonus(1)
  for (let f = 2; f <= BONUS_CAP_FLOOR; f++) {
    const b = getTowerBonus(f)
    assert.ok(b > prev, `ชั้น ${f} (${b}) ต้อง > ชั้น ${f - 1} (${prev})`)
    prev = b
  }
  for (let f = 71; f <= TOWER_MAX; f++) assert.equal(getTowerBonus(f), 20000)
})

test('floorZone: 5 โซนใหม่ ขอบเขตถูก', () => {
  assert.equal(floorZone(1).name, 'ลานประลอง')
  assert.equal(floorZone(20).name, 'ลานประลอง')
  assert.equal(floorZone(21).name, 'หอเวทเก่า')
  assert.equal(floorZone(40).name, 'หอเวทเก่า')
  assert.equal(floorZone(41).name, 'ปราการอสูร')
  assert.equal(floorZone(55).name, 'ปราการอสูร')
  assert.equal(floorZone(56).name, 'ยอดหอคอยมังกร')
  assert.equal(floorZone(69).name, 'ยอดหอคอยมังกร')
  assert.equal(floorZone(70).name, 'บัลลังก์ราชันย์')
  assert.equal(floorZone(100).name, 'บัลลังก์ราชันย์')
})

test('floorZone: clamp นอกช่วง', () => {
  assert.equal(floorZone(0).name, 'ลานประลอง')
  assert.equal(floorZone(999).name, 'บัลลังก์ราชันย์')
})

test('TOWER_BONUS_FLOORS = หมุดเหรียญถึงชั้น 70 เท่านั้น', () => {
  assert.deepEqual(TOWER_BONUS_FLOORS, [20, 40, 60, 70])
})
```

- [ ] **Step 2: รันเทสให้ fail**

Run: `node --test src/data/towerFloors.test.js`
Expected: FAIL (`botCount`/`botGrade`/`BONUS_CAP_FLOOR` ไม่มี, TOWER_MAX=50, zones เดิม)

- [ ] **Step 3: เขียน `towerFloors.js` ใหม่** — แทนที่ทั้งไฟล์:

```js
// ════════════════════════════════════════════════════════════
//  หอคอย PvE 100 ชั้น — ทีมบอทรายชั้น (สูตร deterministic) + โบนัสรายได้
//  3 องก์: 1–20 ต้น(สนุก) · 21–69 กลาง/ปลายไต่ · 70–100 ตัน(วัดการจัดทีม)
// ════════════════════════════════════════════════════════════
import { PETS } from './index.js'
import { BATTLE_SLOTS } from './residence.js'

export const TOWER_MAX = 100

const ELS = ['fist', 'scissors', 'paper']
const RARITY_BY_TIER = ['common', 'rare', 'epic', 'legendary']
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v))

function rng(seed) {
  let a = seed >>> 0
  return () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** จำนวนบอท/ทีม — ก้าวแรกลุ้นชนะ (1 ตัว) แล้วไต่เป็นเต็มทีม */
export function botCount(f) {
  return f === 1 ? 1 : f === 2 ? 2 : BATTLE_SLOTS
}

/** tier (rarity index) ตามชั้น: common 1–20 · rare 21–40 · epic 41–55 · legendary 56–100 */
function tierOf(f) {
  if (f <= 20) return 0
  if (f <= 40) return 1
  if (f <= 55) return 2
  return 3
}

/** เกรดบอท: 0 ถึงชั้น 20 · ไต่ 1→4 ช่วง 21–69 · V(5) ที่ชั้น 70+ */
export function botGrade(f) {
  if (f <= 20) return 0
  if (f >= 70) return 5
  return clamp(1 + Math.floor((f - 21) / 12.25), 1, 4)
}

/** ธาตุของบอทแต่ละสล็อต (ชั้น <70 = ครบ 3 ธาตุ · 70+ แทนที่ใน Task 2) */
function floorElements(f, count) {
  return Array.from({ length: count }, (_, i) => ELS[(f + i) % 3])
}

/** ชั้น → ทีมบอท (rarity/เกรด/จำนวน/ธาตุ ตามชั้น) */
export function getFloorTeam(floor) {
  const f = clamp(Math.floor(floor) || 1, 1, TOWER_MAX)
  const rand = rng((f * 2654435761) >>> 0)
  const rarity = RARITY_BY_TIER[tierOf(f)]
  const grade = botGrade(f)
  const count = botCount(f)
  const elements = floorElements(f, count)
  const team = []
  for (let i = 0; i < count; i++) {
    const element = elements[i]
    const pool = PETS.filter(p => p.rarity === rarity && p.element === element)
    const fallback = PETS.filter(p => p.element === element)
    const src = pool.length ? pool : fallback
    const def = src[Math.floor(rand() * src.length)]
    team.push({ id: def.id, rarity: def.rarity, element: def.element, grade })
  }
  return team
}

// โบนัสรายได้ idle/วัน จากชั้นสูงสุด — ตันที่ชั้น 70 (= จุดพลังบอทตัน)
export const BONUS_CAP_FLOOR = 70      // แยกจาก TOWER_MAX โดยตั้งใจ (คุมเพดานเศรษฐกิจ)
export const TOWER_BONUS_MIN = 50      // โบนัส/วัน ชั้น 1
export const TOWER_BONUS_MAX = 20000   // โบนัส/วัน ชั้น 70+ (เพิ่มจาก 12000)
const TOWER_BONUS_POW = 1.7            // >1 = เร่งช่วงท้าย

/** ชั้นสูงสุด → โบนัสเหรียญ idle/วัน · เพิ่มทุกชั้น 1→70 แล้ว flat (ปัด 5) */
export function getTowerBonus(bestFloor) {
  const b = Math.floor(bestFloor || 0)
  if (b < 1) return 0
  const f = Math.min(BONUS_CAP_FLOOR, b)
  const t = Math.pow((f - 1) / (BONUS_CAP_FLOOR - 1), TOWER_BONUS_POW)
  const raw = TOWER_BONUS_MIN + (TOWER_BONUS_MAX - TOWER_BONUS_MIN) * t
  return Math.round(raw / 5) * 5
}

// floor → โซนแฟนซี (UI) — 5 โซน · โซนที่ 5 = ช่วงตัน "วัดฝีมือ"
const ZONES = [
  { name: 'ลานประลอง',      art: '🛡️', color: '#84cc16', from: 1,  to: 20 },
  { name: 'หอเวทเก่า',       art: '🔮', color: '#60a5fa', from: 21, to: 40 },
  { name: 'ปราการอสูร',      art: '👹', color: '#c084fc', from: 41, to: 55 },
  { name: 'ยอดหอคอยมังกร',  art: '🐉', color: '#fbbf24', from: 56, to: 69 },
  { name: 'บัลลังก์ราชันย์',  art: '👑', color: '#f43f5e', from: 70, to: 100 },
]
export function floorZone(floor) {
  const f = clamp(Math.floor(floor) || 1, 1, TOWER_MAX)
  return ZONES.find(z => f >= z.from && f <= z.to) || ZONES[ZONES.length - 1]
}
export const TOWER_BONUS_FLOORS = [20, 40, 60, 70]  // หมุดเหรียญ — ถึงชั้น 70 (โบนัส flat หลังจากนั้น)
```

- [ ] **Step 4: รันเทสให้ผ่าน**

Run: `node --test src/data/towerFloors.test.js`
Expected: PASS ทุกเทส

- [ ] **Step 5: Commit**

```bash
git add src/data/towerFloors.js src/data/towerFloors.test.js
git commit -m "Tower: ยืดเป็น 100 ชั้น + rebalance botCount/grade/bonus/zones (ต้นเกมไหลลื่น, ตันชั้น 70)"
```

---

### Task 2: เอนธาตุช่วงตัน 70–100 (เคาน์เตอร์คือคำตอบ)

**Files:**
- Modify: `src/data/towerFloors.js:floorElements` (ฟังก์ชันเดียว)
- Test: `src/data/towerFloors.test.js` (เพิ่มเทส)
- Sim (scratchpad ชั่วคราว): `<scratchpad>/tower-el-sim.mjs`

**Interfaces:**
- Consumes: `getFloorTeam` (Task 1), `simulateBattle` (`utils/battleEngine.js`), `ELS` order `[fist,scissors,paper]` (fist>scissors>paper>fist)
- Produces: `floorElements(f,count)` ที่ชั้น ≥70 คืนธาตุเอน (theme ซ้ำ + counter/victim) แทนครบ 3 ธาตุ

- [ ] **Step 1: เพิ่มเทสที่จะ fail** — เติมท้าย `src/data/towerFloors.test.js`:

```js
test('ธาตุชั้น <70 = ครบ 3 ธาตุ (ไม่ซ้ำ)', () => {
  const els = getFloorTeam(50).map(p => p.element)
  assert.equal(new Set(els).size, 3)
})

test('ธาตุชั้น 70+ = เอน (มีธาตุซ้ำ ไม่ครบ 3) + deterministic', () => {
  for (const f of [70, 71, 72, 85, 100]) {
    const els = getFloorTeam(f).map(p => p.element)
    assert.equal(els.length, 3)
    assert.ok(new Set(els).size < 3, `ชั้น ${f} ควรมีธาตุซ้ำ (เอน) ได้ ${els}`)
    assert.deepEqual(getFloorTeam(f).map(p => p.element), els)  // deterministic
  }
})
```

- [ ] **Step 2: รันเทสให้ fail**

Run: `node --test src/data/towerFloors.test.js`
Expected: FAIL ที่ 'ธาตุชั้น 70+ = เอน' (ตอนนี้ยังครบ 3 ธาตุ)

- [ ] **Step 3: แทนที่ `floorElements` ใน `towerFloors.js`:**

```js
/** ธาตุของบอทแต่ละสล็อต
 *  - ชั้น <70 (หรือ <3 ตัว): ครบ 3 ธาตุ (ธาตุหักล้าง — วัดพลัง/ดวง)
 *  - ชั้น 70–100: เอน theme ซ้ำ 2 + สลับ variant รายชั้น → "เคาน์เตอร์" (ELS[(t+2)%3]) คือคำตอบ
 *    RPS: ELS[k] ชนะ ELS[(k+1)%3] แพ้ ELS[(k+2)%3]
 */
function floorElements(f, count) {
  if (f < 70 || count < 3) {
    return Array.from({ length: count }, (_, i) => ELS[(f + i) % 3])
  }
  const t = f % 3
  const theme   = ELS[t]              // ธาตุหลักของชั้น (ลง 2 ตัว)
  const counter = ELS[(t + 2) % 3]    // ธาตุที่ชนะ theme (= คำตอบผู้เล่น)
  const victim  = ELS[(t + 1) % 3]    // ธาตุที่ theme ชนะ
  const variant = Math.floor(f / 3) % 2
  return variant === 0
    ? [theme, theme, counter]         // 2 theme + 1 counter
    : [theme, theme, victim]          // 2 theme + 1 victim (โจทย์ต่าง)
}
```

- [ ] **Step 4: รันเทสให้ผ่าน**

Run: `node --test src/data/towerFloors.test.js`
Expected: PASS ทุกเทส

- [ ] **Step 5: เขียน sim ยืนยัน "เคาน์เตอร์ชนะกว่าก๊อปธาตุ"** — สร้างชั่วคราวใน repo `src/data/_tower-el-sim.mjs` (import relative สะอาด, ลบทิ้งหลังรัน ไม่ commit):

```js
// รัน: node src/data/_tower-el-sim.mjs
import { getFloorTeam } from './towerFloors.js'
import { simulateBattle } from '../utils/battleEngine.js'
const ELS = ['fist', 'scissors', 'paper']
const mono = (el) => Array.from({ length: 3 }, () => ({ id: `p_${el}`, rarity: 'legendary', element: el, grade: 5 }))
const winPct = (team, floor, n = 2000) => {
  let w = 0
  for (let s = 0; s < n; s++) if (simulateBattle(team, getFloorTeam(floor), s).winner === 'A') w++
  return (w / n * 100).toFixed(1)
}
for (const f of [70, 71, 72, 73, 85, 100]) {
  const bot = getFloorTeam(f)
  const t = f % 3
  const counter = ELS[(t + 2) % 3], theme = ELS[t]
  console.log(`ชั้น ${f} บอทธาตุ=[${bot.map(p => p.element)}] | counter(${counter})=${winPct(mono(counter), f)}% theme-copy(${theme})=${winPct(mono(theme), f)}%`)
}
```

Run: `node src/data/_tower-el-sim.mjs` แล้วลบทิ้ง `rm src/data/_tower-el-sim.mjs` (ไม่ commit)
Expected: ทุกชั้น `counter% > theme-copy%` อย่างมีนัย (คาด counter ≥75%, theme-copy ต่ำกว่าชัด) — ถ้าไม่เป็นเช่นนั้นให้ทบทวน variant pattern ก่อนไปต่อ

- [ ] **Step 6: Commit** (ลบ sim ออกจาก scratchpad, ไม่ commit)

```bash
git add src/data/towerFloors.js src/data/towerFloors.test.js
git commit -m "Tower: เอนธาตุชั้นตัน 70-100 ให้เคาน์เตอร์เป็นคำตอบ (วัดการจัดทีม, sim-verified)"
```

---

### Task 3: ลดเรท REFUND ตอน migrate เพ็ท

**Files:**
- Modify: `src/utils/petMigration.js:2` (const REFUND)
- Test: `src/utils/petMigration.test.js:33,39` (เลขที่ pin)

**Interfaces:**
- Produces: `REFUND = { common:200, rare:1000, epic:3000, legendary:8000 }` (จาก 500/2500/8000/25000)

- [ ] **Step 1: แก้เทสให้สะท้อนเรทใหม่ (จะ fail กับโค้ดเดิม)** — แก้ 2 assert ใน `src/utils/petMigration.test.js`:

บรรทัด ~33 (เทส 'ตัดตัวที่ไม่อยู่ใน catalog'):
```js
  assert.equal(r.refundCoins, 200)  // common 200 × 1.0
```
บรรทัด ~39 (เทส 'rarity nerf butterfly rare→common'):
```js
  assert.equal(r.refundCoins, 1000 - 200)  // rare - common
```

- [ ] **Step 2: รันเทสให้ fail**

Run: `node --test src/utils/petMigration.test.js`
Expected: FAIL 2 เทส (ยังคืน 500 / 2000)

- [ ] **Step 3: ลดเรทใน `petMigration.js`** — แก้บรรทัด 2:

```js
const REFUND = { common: 200, rare: 1000, epic: 3000, legendary: 8000 }
```

- [ ] **Step 4: รันเทสให้ผ่าน**

Run: `node --test src/utils/petMigration.test.js`
Expected: PASS ทุกเทส

- [ ] **Step 5: Commit**

```bash
git add src/utils/petMigration.js src/utils/petMigration.test.js
git commit -m "PetMigration: ลดเรท REFUND (กัน 1-2 คนยังไม่ migrate ได้เงินก้อนโต)"
```

---

### Task 4: Ranking util สำหรับแถบเทียบเพื่อน (pure)

**Files:**
- Create: `src/utils/towerRivals.js`
- Test: `src/utils/towerRivals.test.js`

**Interfaces:**
- Produces: `towerRanking(others, me) → { top:[{nickname,floor,isMe}], myRank:number|null, total:number, chaseName:string|null, chaseGap:number }`
  - `others`: array ของ `{ uid, nickname, towerBest }` (จาก members) · `me`: `{ uid, nickname, towerBest }` (สดจาก auth)
  - นับเฉพาะคน `towerBest ≥ 1` · sort desc + tie-break ชื่อ · `me` แทนที่ของซ้ำใน others (ค่าสด) · chase = คนอันดับเหนือเราติดกัน

- [ ] **Step 1: เขียนเทสที่จะ fail** — สร้าง `src/utils/towerRivals.test.js`:

```js
// รัน: node --test src/utils/towerRivals.test.js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { towerRanking } from './towerRivals.js'

const me = { uid: 'me', nickname: 'ฉัน', towerBest: 12 }

test('จัดอันดับ desc + top 3 + isMe + อันดับ/รวม', () => {
  const others = [
    { uid: 'a', nickname: 'เอ', towerBest: 30 },
    { uid: 'b', nickname: 'บี', towerBest: 20 },
    { uid: 'c', nickname: 'ซี', towerBest: 5 },
  ]
  const r = towerRanking(others, me)
  assert.equal(r.total, 4)
  assert.equal(r.myRank, 3)                          // 30,20,[12],5
  assert.deepEqual(r.top.map(t => t.nickname), ['เอ', 'บี', 'ฉัน'])
  assert.equal(r.top[2].isMe, true)
  assert.equal(r.top[2].floor, 12)
})

test('chase = คนอันดับเหนือเราติดกัน + ระยะห่าง', () => {
  const others = [{ uid: 'a', nickname: 'เอ', towerBest: 15 }, { uid: 'b', nickname: 'บี', towerBest: 40 }]
  const r = towerRanking(others, me)   // 40(บี), 15(เอ), 12(ฉัน)
  assert.equal(r.myRank, 3)
  assert.equal(r.chaseName, 'เอ')
  assert.equal(r.chaseGap, 3)          // 15 - 12
})

test('me เป็นที่ 1 → ไม่มี chase', () => {
  const r = towerRanking([{ uid: 'a', nickname: 'เอ', towerBest: 4 }], me)
  assert.equal(r.myRank, 1)
  assert.equal(r.chaseName, null)
  assert.equal(r.chaseGap, 0)
})

test('me ใช้ค่าสด ทับ others ที่ uid ซ้ำ', () => {
  const others = [{ uid: 'me', nickname: 'ฉันเก่า', towerBest: 1 }, { uid: 'a', nickname: 'เอ', towerBest: 8 }]
  const r = towerRanking(others, me)   // me=12 (สด) > เอ=8
  assert.equal(r.total, 2)
  assert.equal(r.myRank, 1)
  assert.equal(r.top[0].nickname, 'ฉัน')
})

test('คนที่ยังไม่ไต่ (best<1) ไม่ถูกนับ', () => {
  const others = [{ uid: 'a', nickname: 'เอ', towerBest: 0 }, { uid: 'b', nickname: 'บี', towerBest: 3 }]
  const r = towerRanking(others, me)
  assert.equal(r.total, 2)             // me(12) + บี(3) — เอ ไม่นับ
})
```

- [ ] **Step 2: รันเทสให้ fail**

Run: `node --test src/utils/towerRivals.test.js`
Expected: FAIL (`towerRanking` ไม่มี)

- [ ] **Step 3: เขียน `src/utils/towerRivals.js`:**

```js
// towerRivals — pure: จัดอันดับ towerBest ของเพื่อน + ระยะไล่ตาม (สำหรับแถบเทียบหน้าหอคอย)
/**
 * @param {Array<{uid,nickname,towerBest}>} others  รายชื่อจาก members store
 * @param {{uid,nickname,towerBest}} me              ค่าสดของผู้เล่นปัจจุบัน (auth)
 */
export function towerRanking(others, me) {
  const map = new Map()
  for (const u of (others || [])) if (u && u.uid) map.set(u.uid, u)
  map.set(me.uid, me)  // ค่าสดทับของซ้ำ
  const ranked = [...map.values()]
    .filter(u => (u.towerBest || 0) >= 1)
    .sort((a, b) => (b.towerBest - a.towerBest) || String(a.nickname).localeCompare(String(b.nickname)))
  const myIdx = ranked.findIndex(u => u.uid === me.uid)
  const chase = myIdx > 0 ? ranked[myIdx - 1] : null
  return {
    top: ranked.slice(0, 3).map(u => ({ nickname: u.nickname, floor: u.towerBest, isMe: u.uid === me.uid })),
    myRank: myIdx >= 0 ? myIdx + 1 : null,
    total: ranked.length,
    chaseName: chase ? chase.nickname : null,
    chaseGap: chase ? chase.towerBest - (me.towerBest || 0) : 0,
  }
}
```

- [ ] **Step 4: รันเทสให้ผ่าน**

Run: `node --test src/utils/towerRivals.test.js`
Expected: PASS ทุกเทส

- [ ] **Step 5: Commit**

```bash
git add src/utils/towerRivals.js src/utils/towerRivals.test.js
git commit -m "Tower: ranking util แถบเทียบเพื่อน (pure + tested)"
```

---

### Task 5: Fable ออกแบบ UI/UX direction หน้าหอคอย (design sub-spec)

**Files:**
- Create: `docs/superpowers/specs/2026-07-17-tower-ui-polish-design.md` (Fable เขียน)

**หมายเหตุ:** งานดีไซน์ ไม่มี test cycle — dispatch Fable subagent (model `fable`) ให้อ่านโค้ดจริง + ออกแบบ direction แล้วบันทึกเป็น sub-spec ให้ Task 6 execute

- [ ] **Step 1: Dispatch Fable subagent** พร้อมบรีฟนี้ (Agent tool, subagent_type `general-purpose`, model `fable`):

> ออกแบบ UI/UX direction ให้หน้า `src/views/TowerView.vue` (RxTU10, Vue 3, มือถือหลัก, ธีม indigo #4f46e5, ภาษาไทย). อ่าน `TowerView.vue` + `docs/superpowers/specs/2026-07-16-tower-100floor-rebalance-design.md` + `docs/voice-guide.md` + `components/shared/BottomSheet.vue` (Teleport pattern). ของใหม่ที่ต้องรองรับ: หอ **100 ชั้น** (แถบไต่เดิมโชว์แค่ window 6 ชั้น = จิ๊บบนหอ 100), **โซนที่ 5 "บัลลังก์ราชันย์" (70–100)** ต้องมี art/สีสื่อ "ถึงสนามวัดฝีมือ พลังบอทตัน วัดกันที่ธาตุ/ทีม", **แถบเทียบเพื่อน** (top 3 + "คุณอันดับ X/Y" + hook "ตามหลัง [ชื่อ] อยู่ N ชั้น"). ส่งมอบ: (1) direction typography/สี/layout, (2) โครง progress ที่สื่อ "ไต่ไกลแค่ไหนใน 100 ชั้น" + หมุดโซน, (3) layout แถบเทียบที่กระตุ้นการแข่งไม่รก, (4) a11y/tap ≥44px + ยึด Teleport rule (CLAUDE.md ข้อ 6). เขียน spec ย่อยระดับ execute ได้ (โครง markup + สี/ขนาด/สเปซ + คลาส) เป็นภาษาไทย บันทึกที่ `docs/superpowers/specs/2026-07-17-tower-ui-polish-design.md`. ห้ามแก้โค้ดจริง — design เท่านั้น

- [ ] **Step 2: ตรวจ sub-spec** — อ่านไฟล์ที่ Fable เขียน ยืนยันครอบคลุม 4 ข้อ + สอดคล้องธีม/voice-guide + ไม่ชน Teleport rule · ถ้าขาดให้ SendMessage กลับหา Fable ปรับ

- [ ] **Step 3: Commit**

```bash
git add docs/superpowers/specs/2026-07-17-tower-ui-polish-design.md
git commit -m "Tower: UI/UX direction หน้าหอคอย (Fable design sub-spec)"
```

---

### Task 6: TowerView integration — แถบเทียบ + โซนที่ 5 + UI polish

**Files:**
- Modify: `src/views/TowerView.vue` (template + script + style)
- อ้างอิง: `docs/superpowers/specs/2026-07-17-tower-ui-polish-design.md` (Task 5)

**Interfaces:**
- Consumes: `towerRanking` (Task 4) · `floorZone/TOWER_BONUS_FLOORS/TOWER_MAX` (Task 1, import อยู่แล้ว) · `useMembersStore().loadFbUsers()` + `fbUsers` · `auth.userData` (uid/nickname/towerBest)
- แถบเทียบไม่ block การเล่น: ไม่มีข้อมูล → ซ่อน

> Vue component — ตรวจด้วย `npm run build` + ทดลอง dev (ไม่มี unit test)

- [ ] **Step 1: เพิ่ม state โหลด members + คำนวณ ranking** — ใน `<script setup>` ของ `TowerView.vue`. **เติม `onMounted` เข้า import vue เดิม** (`import { ref, computed, onMounted } from 'vue'` — อย่า import `computed` ซ้ำ) แล้วเพิ่ม:

```js
import { useMembersStore } from '../stores/members.js'
import { towerRanking } from '../utils/towerRivals.js'

const membersStore = useMembersStore()
onMounted(() => { membersStore.loadFbUsers().catch(() => {}) })  // best-effort, ใช้ cache ถ้ามี

const rivals = computed(() => {
  const others = Object.values(membersStore.fbUsers || {})
    .map(u => ({ uid: u.uid, nickname: u.nickname, towerBest: u.towerBest || 0 }))
  const u = authStore.userData || {}
  const me = { uid: authStore.user?.uid || 'me', nickname: u.nickname || 'ฉัน', towerBest: best.value }
  if (!others.length) return null
  return towerRanking(others, me)
})
```

> เช็ก getter จริงของ members store (`fbUsers` = object keyed by studentId) + auth uid accessor ก่อนเขียน — ปรับชื่อให้ตรง store จริง

- [ ] **Step 2: เพิ่ม markup แถบเทียบ** ในเทมเพลต (ใต้ `.tw-climb`) — ตามดีไซน์ Task 5. โครงอ้างอิง:

```html
<div v-if="rivals && rivals.total > 1" class="tw-rivals">
  <div class="tw-rivals-top">
    <span v-for="(r, i) in rivals.top" :key="i" class="tw-rival" :class="{ me: r.isMe }">
      <b>{{ i + 1 }}</b> {{ r.nickname }} · ชั้น {{ r.floor }}
    </span>
  </div>
  <div class="tw-rivals-me">
    อันดับ {{ rivals.myRank }}/{{ rivals.total }}
    <span v-if="rivals.chaseName && rivals.chaseGap > 0"> · ตามหลัง {{ rivals.chaseName }} อยู่ {{ rivals.chaseGap }} ชั้น!</span>
  </div>
</div>
```
(ปรับ class/โครง/สเปซให้ตรง sub-spec Task 5 — nickname มาจาก store ที่ผ่าน normalize แล้ว)

- [ ] **Step 3: ใช้ direction ที่เหลือจาก Task 5** — ปรับแถบไต่ (สื่อ 100 ชั้น), โซนที่ 5 art/สี, typography/tap target ตาม sub-spec · ถ้าเพิ่ม overlay ใหม่ใดๆ ต้อง `<Teleport to="body">`

- [ ] **Step 4: Build + ตรวจ dev**

Run: `npm run build`
Expected: build ผ่าน ไม่มี error

ทดลอง dev (`npm run dev`): เปิดหน้าหอคอย → แถบเทียบโผล่ (มี ≥2 คนไต่), โซนที่ 5 แสดงชั้น 70+, แถบไต่อ่านออกบนหอ 100 ชั้น, ไม่มี nav บังก้น sheet/overlay

- [ ] **Step 5: Commit**

```bash
git add src/views/TowerView.vue
git commit -m "Tower: แถบเทียบเพื่อน + โซนบัลลังก์ราชันย์ + UI polish (100 ชั้น)"
```

---

## หลัง execute ครบ

- [ ] รันเทส pure util ทั้งหมดที่แตะ: `node --test src/data/towerFloors.test.js src/utils/petMigration.test.js src/utils/towerRivals.test.js`
- [ ] `npm run build` ผ่าน
- [ ] **ตอน launch:** admin กด "รีเซตชั้นหอคอย" (AdminView) — ทุกคนเริ่มชั้น 1 ใหม่ (คู่กับ rebalance นี้ + ไม่มี grandfather)
- [ ] requesting-code-review ก่อน merge/deploy
- [ ] อัปเดต memory: tower rebalance + refund + ui polish เสร็จ · passive spec ถัดไป (รื้อทีมบอท 70+ ให้ลึกด้วย passive)
