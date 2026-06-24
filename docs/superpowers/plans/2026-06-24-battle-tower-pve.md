# Battle Engine + Tower (PvE) v1 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** ให้เพ็ทมี payoff — จัดทีม 4 ตัวไต่หอคอย PvE (auto-resolve battle), ชั้นสูงสุดปลดโบนัสรายได้ idle รายวัน

**Architecture:** Engine เป็น pure + deterministic (seeded) แยกจาก UI — พอร์ตจาก `scripts/battle-sim.mjs` ที่จูนเลขแล้ว · หอคอยสร้างทีมบอทจากสูตร (ไม่เขียนมือ) · ทีม = `activePets` (ขยาย 3→4) · โบนัสเสียบเข้า `useDaily.ratePerDay` · UI raw (CSS) replay จาก battle log

**Tech Stack:** Vue 3 + Pinia + Firebase · pure logic ทดสอบด้วย `node --test` · ไม่มี test runner Vue (UI verify ด้วย `npm run build` + manual)

## Global Constraints
- เขียน user doc ผ่าน `auth.patchUser(optimistic, server)` เท่านั้น
- เลข combat = ชุดจาก `scripts/battle-sim.mjs` (อย่าคิดใหม่): teamSize 4, maxRounds 30, elementAdv 1.20, elementDis 0.83, crit 0.12×1.6, variance 0.22
- เกรดในเกม = 0–5 (clamp) · ธาตุ RPS: fist>scissors>paper>fist
- ไม่แตะ firestore.rules · ไม่ทำ passive/PvP/expedition (นอก scope v1)
- commit รูปแบบ `Area: อะไร (ทำไม)` ลงท้าย `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`
- UI ภาษาไทย · emoji ผ่าน `<Emoji>` เสมอ (อย่าใส่ emoji ดิบใน template/string)

---

### Task 1: `data/battle.js` — ค่าคงที่ combat + buildCombatant

**Files:**
- Create: `src/data/battle.js`
- Test: `src/data/battle.test.js`

**Interfaces:**
- Consumes: `elementBeats` จาก `src/data/index.js`
- Produces:
  - `BATTLE_CFG = { teamSize, maxRounds, elementAdv, elementDis, critRate, critMult, variance }`
  - `buildCombatant(pet) → { id, element, atk, maxHp, hp }` — pet = `{ id, rarity, element, grade }`
  - `elementMult(attEl, defEl) → number` (1.20 / 0.83 / 1)

- [ ] **Step 1: Write the failing test**

```js
// src/data/battle.test.js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildCombatant, elementMult, BATTLE_CFG } from './battle.js'

test('BATTLE_CFG ตรงกับ sim ที่จูนแล้ว', () => {
  assert.equal(BATTLE_CFG.teamSize, 4)
  assert.equal(BATTLE_CFG.maxRounds, 30)
  assert.equal(BATTLE_CFG.elementAdv, 1.20)
  assert.equal(BATTLE_CFG.elementDis, 0.83)
})

test('buildCombatant: fist เกรด 0 legendary — bias atk↑ hp↓', () => {
  const c = buildCombatant({ id: 'trex', rarity: 'legendary', element: 'fist', grade: 0 })
  // base legendary 14/70 × grade0 1.0 × bias fist 1.2/0.85
  assert.equal(c.atk, 14 * 1.2)
  assert.equal(c.maxHp, 70 * 0.85)
  assert.equal(c.hp, c.maxHp)
  assert.equal(c.element, 'fist')
})

test('buildCombatant: clamp เกรดเกิน 5 → ใช้ index 5', () => {
  const c = buildCombatant({ id: 'x', rarity: 'common', element: 'scissors', grade: 99 })
  // base common 10/50 × grade5 1.34 × bias 1/1
  assert.equal(Math.round(c.atk), Math.round(10 * 1.34))
})

test('elementMult: ได้เปรียบ/เสียเปรียบ/เสมอ', () => {
  assert.equal(elementMult('fist', 'scissors'), 1.20) // fist ชนะ scissors
  assert.equal(elementMult('scissors', 'fist'), 0.83) // scissors แพ้ fist
  assert.equal(elementMult('fist', 'fist'), 1)
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test src/data/battle.test.js`
Expected: FAIL (Cannot find module './battle.js')

- [ ] **Step 3: Write minimal implementation**

```js
// src/data/battle.js
// ════════════════════════════════════════════════════════════
//  Battle combat constants — พอร์ตจาก scripts/battle-sim.mjs (จูนแล้ว)
//  ⚠️ ชุดเลขนี้ "flatter" กว่า BASE_STATS/STAT_MULTI ใน data/index.js
//     (เดิมใช้แค่ petStats() แสดงผล) — battle ใช้ชุดนี้
// ════════════════════════════════════════════════════════════
import { elementBeats } from './index.js'

export const BATTLE_CFG = {
  teamSize: 4, maxRounds: 30,
  elementAdv: 1.20, elementDis: 0.83,
  critRate: 0.12, critMult: 1.6, variance: 0.22,
}

const COMBAT_BASE = {
  common:    { atk: 10, hp: 50 },
  rare:      { atk: 11, hp: 56 },
  epic:      { atk: 13, hp: 63 },
  legendary: { atk: 14, hp: 70 },
}
// index = grade 0..5 (in-game cap = 5)
const COMBAT_GRADE = [1.0, 1.06, 1.12, 1.19, 1.26, 1.34]
const ELEMENT_BIAS = {
  fist:     { atk: 1.2,  hp: 0.85 },
  scissors: { atk: 1.0,  hp: 1.0  },
  paper:    { atk: 0.85, hp: 1.2  },
}

/** pet { id, rarity, element, grade } → combat unit (เกรด clamp 0..5) */
export function buildCombatant(pet) {
  const base = COMBAT_BASE[pet?.rarity] || COMBAT_BASE.common
  const g = Math.min(COMBAT_GRADE.length - 1, Math.max(0, pet?.grade || 0))
  const bias = ELEMENT_BIAS[pet?.element] || ELEMENT_BIAS.scissors
  const atk = base.atk * COMBAT_GRADE[g] * bias.atk
  const maxHp = base.hp * COMBAT_GRADE[g] * bias.hp
  return { id: pet?.id || null, element: pet?.element || 'scissors', atk, maxHp, hp: maxHp }
}

/** ตัวคูณดาเมจตามธาตุ: ได้เปรียบ 1.20 / เสียเปรียบ 0.83 / เสมอ 1 */
export function elementMult(attEl, defEl) {
  if (elementBeats(attEl, defEl)) return BATTLE_CFG.elementAdv
  if (elementBeats(defEl, attEl)) return BATTLE_CFG.elementDis
  return 1
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test src/data/battle.test.js`
Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add src/data/battle.js src/data/battle.test.js
git commit -m "Battle: ค่าคงที่ combat + buildCombatant (พอร์ตจาก sim)"
```

---

### Task 2: `utils/battleEngine.js` — pure engine + log

**Files:**
- Create: `src/utils/battleEngine.js`
- Test: `src/utils/battleEngine.test.js`

**Interfaces:**
- Consumes: `BATTLE_CFG`, `buildCombatant`, `elementMult` จาก `data/battle.js`
- Produces: `simulateBattle(teamA, teamB, seed) → { winner:'A'|'B', rounds:number, log:Array }`
  - team = array ของ `{ id, rarity, element, grade }` (1–4 ตัว)
  - log event: `{ t:'attack', side, attacker, target, dmg, crit, targetHpAfter, dead }` และปิดท้าย `{ t:'end', winner, rounds, hpPctA, hpPctB }`
  - `attacker`/`target` = uid รูปแบบ `'A0'..'A3'`, `'B0'..'B3'` (side+slot)

- [ ] **Step 1: Write the failing test**

```js
// src/utils/battleEngine.test.js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { simulateBattle } from './battleEngine.js'

const mono = (rarity, element, grade, n = 4) =>
  Array.from({ length: n }, (_, i) => ({ id: `${element}${i}`, rarity, element, grade }))

test('deterministic: seed เดิม → ผลเหมือนเป๊ะ', () => {
  const a = mono('rare', 'fist', 3), b = mono('rare', 'scissors', 3)
  const r1 = simulateBattle(a, b, 12345)
  const r2 = simulateBattle(a, b, 12345)
  assert.deepEqual(r1, r2)
})

test('log จบด้วย end event ที่ winner ตรงกับผล', () => {
  const r = simulateBattle(mono('rare', 'fist', 3), mono('rare', 'scissors', 3), 7)
  const end = r.log[r.log.length - 1]
  assert.equal(end.t, 'end')
  assert.equal(end.winner, r.winner)
  assert.ok(r.rounds >= 1)
})

test('ธาตุได้เปรียบชนะเกินครึ่ง (fist vs scissors, เกรดเท่ากัน)', () => {
  let wins = 0, N = 300
  for (let s = 1; s <= N; s++)
    if (simulateBattle(mono('rare', 'fist', 3), mono('rare', 'scissors', 3), s * 99991).winner === 'A') wins++
  assert.ok(wins / N > 0.6, `winrate ${wins / N}`)
})

test('เกรดสูงกว่าชนะเกินครึ่ง (ธาตุเดียวกัน)', () => {
  let wins = 0, N = 300
  for (let s = 1; s <= N; s++)
    if (simulateBattle(mono('rare', 'scissors', 5), mono('rare', 'scissors', 2), s * 1237).winner === 'A') wins++
  assert.ok(wins / N > 0.6, `winrate ${wins / N}`)
})

test('ทีมว่างฝั่งหนึ่ง → อีกฝั่งชนะ', () => {
  assert.equal(simulateBattle(mono('common', 'fist', 0), [], 1).winner, 'A')
  assert.equal(simulateBattle([], mono('common', 'fist', 0), 1).winner, 'B')
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test src/utils/battleEngine.test.js`
Expected: FAIL (Cannot find module './battleEngine.js')

- [ ] **Step 3: Write minimal implementation**

```js
// src/utils/battleEngine.js
// ════════════════════════════════════════════════════════════
//  Battle engine — pure + deterministic (seeded) · พอร์ตจาก
//  scripts/battle-sim.mjs (resolve) + บันทึก log ทุก action ให้ UI replay
//  ไม่มี side effect — ไม่อ่าน store/Firestore/Date.now
// ════════════════════════════════════════════════════════════
import { BATTLE_CFG, buildCombatant, elementMult } from '../data/battle.js'

// mulberry32 — RNG เดียวกับ sim
function rng(seed) {
  let a = seed >>> 0
  return () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const alive = (t) => t.filter(f => f.hp > 0)

/** teamA/teamB = array ของ {id,rarity,element,grade} (≤4) · seed = int */
export function simulateBattle(teamA, teamB, seed) {
  const rand = rng(seed)
  const A = (teamA || []).map((p, i) => ({ ...buildCombatant(p), uid: `A${i}`, side: 'A' }))
  const B = (teamB || []).map((p, i) => ({ ...buildCombatant(p), uid: `B${i}`, side: 'B' }))
  const log = []

  const pick = (foes) => { const al = alive(foes); return al.length ? al[Math.floor(rand() * al.length)] : null }
  const hit = (att, foes) => {
    const tg = pick(foes)
    if (!tg) return
    let m = elementMult(att.element, tg.element)
    const crit = rand() < BATTLE_CFG.critRate
    if (crit) m *= BATTLE_CFG.critMult
    m *= 1 + (rand() * 2 - 1) * BATTLE_CFG.variance
    const dmg = Math.max(0, att.atk * m)
    tg.hp -= dmg
    log.push({
      t: 'attack', side: att.side, attacker: att.uid, target: tg.uid,
      dmg: Math.round(dmg), crit, targetHpAfter: Math.max(0, Math.round(tg.hp)), dead: tg.hp <= 0,
    })
  }

  let round = 0
  while (round < BATTLE_CFG.maxRounds && alive(A).length && alive(B).length) {
    round++
    const act = []
    A.forEach(f => { if (f.hp > 0) act.push([f, B]) })
    B.forEach(f => { if (f.hp > 0) act.push([f, A]) })
    // สุ่มลำดับ (กัน first-mover)
    for (let i = act.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1));[act[i], act[j]] = [act[j], act[i]] }
    for (const [f, foes] of act) if (f.hp > 0) hit(f, foes)
  }

  const pct = (t) => { const max = t.reduce((s, f) => s + f.maxHp, 0); return max ? t.reduce((s, f) => s + Math.max(0, f.hp), 0) / max : 0 }
  const aAlive = alive(A).length > 0, bAlive = alive(B).length > 0
  const hpPctA = pct(A), hpPctB = pct(B)
  let winner
  if (aAlive && !bAlive) winner = 'A'
  else if (bAlive && !aAlive) winner = 'B'
  else winner = hpPctA >= hpPctB ? 'A' : 'B'

  log.push({ t: 'end', winner, rounds: round, hpPctA, hpPctB })
  return { winner, rounds: round, log }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test src/utils/battleEngine.test.js`
Expected: PASS (5 tests)

- [ ] **Step 5: Commit**

```bash
git add src/utils/battleEngine.js src/utils/battleEngine.test.js
git commit -m "Battle: pure engine + battle log (deterministic, port จาก sim)"
```

---

### Task 3: `data/towerFloors.js` — บอทรายชั้น + โบนัส

**Files:**
- Create: `src/data/towerFloors.js`
- Test: `src/data/towerFloors.test.js`

**Interfaces:**
- Consumes: `PETS` จาก `src/data/index.js`
- Produces:
  - `TOWER_MAX = 50`
  - `getFloorTeam(floor) → [4 × {id, rarity, element, grade}]` (deterministic จาก floor)
  - `getTowerBonus(bestFloor) → number` (เหรียญ/วัน, monotonic non-decreasing)

- [ ] **Step 1: Write the failing test**

```js
// src/data/towerFloors.test.js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { getFloorTeam, getTowerBonus, TOWER_MAX } from './towerFloors.js'

test('getFloorTeam คืน 4 ตัวเสมอ + deterministic', () => {
  for (const f of [1, 10, 25, 50]) {
    const t = getFloorTeam(f)
    assert.equal(t.length, 4)
    assert.deepEqual(getFloorTeam(f), t) // floor เดิม = ทีมเดิม
    t.forEach(p => { assert.ok(p.id && p.rarity && p.element); assert.ok(p.grade >= 0 && p.grade <= 5) })
  }
})

test('ชั้นสูง เกรดเฉลี่ย ≥ ชั้นต่ำ', () => {
  const avg = (f) => getFloorTeam(f).reduce((s, p) => s + p.grade, 0) / 4
  assert.ok(avg(50) >= avg(1))
  assert.ok(avg(40) >= avg(10))
})

test('getTowerBonus: monotonic + ขอบ ladder', () => {
  assert.equal(getTowerBonus(0), 0)
  assert.equal(getTowerBonus(9), 0)
  assert.equal(getTowerBonus(10), 500)
  assert.equal(getTowerBonus(20), 1500)
  assert.equal(getTowerBonus(30), 4000)
  assert.equal(getTowerBonus(40), 8000)
  assert.equal(getTowerBonus(50), 12000)
  // non-decreasing
  let prev = 0
  for (let f = 0; f <= TOWER_MAX; f++) { const b = getTowerBonus(f); assert.ok(b >= prev); prev = b }
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test src/data/towerFloors.test.js`
Expected: FAIL (Cannot find module './towerFloors.js')

- [ ] **Step 3: Write minimal implementation**

```js
// src/data/towerFloors.js
// ════════════════════════════════════════════════════════════
//  หอคอย PvE — ทีมบอทรายชั้น (สร้างจากสูตร ไม่เขียนมือ) + โบนัสรายได้
//  deterministic จาก floor → ทีมบอทคงที่/ทดสอบได้
// ════════════════════════════════════════════════════════════
import { PETS } from './index.js'

export const TOWER_MAX = 50

const ELS = ['fist', 'scissors', 'paper']
const RARITY_BY_TIER = ['common', 'rare', 'epic', 'legendary']

function rng(seed) {
  let a = seed >>> 0
  return () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** ชั้น → ทีมบอท 4 ตัว (rarity/เกรดไต่ตามชั้น + ธาตุผสม) */
export function getFloorTeam(floor) {
  const f = Math.max(1, Math.min(TOWER_MAX, Math.floor(floor) || 1))
  const rand = rng((f * 2654435761) >>> 0)
  const tier = Math.min(3, Math.floor((f - 1) / 12.5))  // 1-12 common · 13-25 rare · 26-38 epic · 39-50 legendary
  const grade = Math.min(5, Math.floor((f - 1) / 9))     // 0..5
  const rarity = RARITY_BY_TIER[tier]
  const team = []
  for (let i = 0; i < 4; i++) {
    const element = ELS[(f + i) % 3]
    const pool = PETS.filter(p => p.rarity === rarity && p.element === element)
    const fallback = PETS.filter(p => p.element === element)
    const def = (pool.length ? pool : fallback)[Math.floor(rand() * (pool.length ? pool.length : fallback.length))]
    team.push({ id: def.id, rarity: def.rarity, element: def.element, grade })
  }
  return team
}

/** ชั้นสูงสุดที่เคยผ่าน → โบนัสเหรียญ idle/วัน (flat, มี cap — ไม่ทวีคูณ) */
export function getTowerBonus(bestFloor) {
  const b = bestFloor || 0
  if (b >= 50) return 12000
  if (b >= 40) return 8000
  if (b >= 30) return 4000
  if (b >= 20) return 1500
  if (b >= 10) return 500
  return 0
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test src/data/towerFloors.test.js`
Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add src/data/towerFloors.js src/data/towerFloors.test.js
git commit -m "Tower: ทีมบอทรายชั้น (สูตร) + โบนัสรายได้ ladder"
```

---

### Task 4: ขยายทีม activePets 3 → 4 (schema)

**Files:**
- Modify: `src/data/userSchema.js:20` (USER_DEFAULTS.activePets), `:99-101` (migration), `:107` (normalize)
- Test: `src/data/userSchema.test.js`

**Interfaces:**
- Produces: `normalizeUserData(d).activePets` ยาว 4 เสมอ (pad null / truncate)

- [ ] **Step 1: Write the failing test**

```js
// src/data/userSchema.test.js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { normalizeUserData, USER_DEFAULTS } from './userSchema.js'

test('default activePets ยาว 4', () => {
  assert.equal(USER_DEFAULTS.activePets.length, 4)
})

test('normalize: activePets เดิม 3 ช่อง → pad เป็น 4', () => {
  const d = normalizeUserData({ activePets: ['cat', 'fox', 'owl'] })
  assert.deepEqual(d.activePets, ['cat', 'fox', 'owl', null])
})

test('normalize: activePets ยาวเกิน → ตัดเหลือ 4', () => {
  const d = normalizeUserData({ activePets: ['a', 'b', 'c', 'd', 'e'] })
  assert.equal(d.activePets.length, 4)
  assert.deepEqual(d.activePets, ['a', 'b', 'c', 'd'])
})

test('normalize: legacy activePet → slot 0 (ยาว 4)', () => {
  const d = normalizeUserData({ activePet: 'cat' })
  assert.deepEqual(d.activePets, ['cat', null, null, null])
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test src/data/userSchema.test.js`
Expected: FAIL (activePets length 3, not 4)

- [ ] **Step 3: Apply edits**

แก้ `src/data/userSchema.js`:

(ก) บรรทัด 20:
```js
  activePets: [null, null, null, null],
```

(ข) บรรทัด 99-101 (migration legacy):
```js
  // migration: legacy single `activePet` → `activePets` slot 0 (once)
  if (data.activePet && !(data.activePets || []).some(Boolean)) {
    d.activePets = [data.activePet, null, null, null]
  }
```

(ค) แทนบรรทัด 107 — pad/truncate เป็น 4:
```js
  // ทีม 4 ตัว: ยาว 4 เสมอ (pad null / ตัดส่วนเกิน)
  const TEAM_SIZE = 4
  d.activePets = (Array.isArray(d.activePets) ? d.activePets : []).slice(0, TEAM_SIZE)
  while (d.activePets.length < TEAM_SIZE) d.activePets.push(null)
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test src/data/userSchema.test.js`
Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add src/data/userSchema.js src/data/userSchema.test.js
git commit -m "Schema: ขยายทีม activePets 3→4 (รองรับทีมสู้หอคอย)"
```

---

### Task 5: `useTower.js` + เสียบโบนัสใน `useDaily`

**Files:**
- Create: `src/composables/useTower.js`
- Modify: `src/composables/useDaily.js` (เพิ่ม towerBonus เข้า ratePerDay)

**Interfaces:**
- Consumes: `simulateBattle`, `getFloorTeam`/`getTowerBonus`/`TOWER_MAX`, `getPetDef`, `useAuthStore`, `useToast`
- Produces: `useTower() → { floor, best, team, botTeam, bonus, fight }`
  - `fight() → { result, botTeam, playerTeam, won, cleared } | null`

- [ ] **Step 1: เขียน `useTower.js`**

```js
// src/composables/useTower.js
import { computed } from 'vue'
import { useAuthStore } from '../stores/auth.js'
import { useToast } from './useToast.js'
import { simulateBattle } from '../utils/battleEngine.js'
import { getFloorTeam, getTowerBonus, TOWER_MAX } from '../data/towerFloors.js'
import { getPetDef } from '../data/index.js'

/** activePets (species id) → battle units {id,rarity,element,grade} จาก pets ที่ owns */
function resolveTeam(ids, pets) {
  return (ids || []).filter(Boolean).map(id => {
    const inst = (pets || []).find(p => (p.id || p.species) === id) || {}
    const def = getPetDef(id) || {}
    return { id, rarity: inst.rarity || def.rarity || 'common', element: def.element || 'scissors', grade: inst.grade || 0 }
  })
}

export function useTower() {
  const auth = useAuthStore()
  const { toast } = useToast()

  const floor = computed(() => auth.userData?.towerFloor || 1)
  const best  = computed(() => auth.userData?.towerBest || 0)
  const team  = computed(() => resolveTeam(auth.userData?.activePets, auth.userData?.pets))
  const botTeam = computed(() => getFloorTeam(floor.value))
  const bonus = computed(() => getTowerBonus(best.value))

  async function fight() {
    if (!team.value.length) { toast('จัดทีมก่อนนะ (อย่างน้อย 1 ตัว)', 'info'); return null }
    const cleared = floor.value
    const seed = Date.now()
    const result = simulateBattle(team.value, botTeam.value, seed)
    const won = result.winner === 'A'
    if (won) {
      const nextFloor = Math.min(TOWER_MAX, cleared + 1)
      const nextBest = Math.max(best.value, cleared)
      await auth.patchUser(
        { towerFloor: nextFloor, towerBest: nextBest },
        { towerFloor: nextFloor, towerBest: nextBest },
      )
    }
    return { result, botTeam: botTeam.value, playerTeam: team.value, won, cleared }
  }

  return { floor, best, team, botTeam, bonus, fight, TOWER_MAX }
}
```

- [ ] **Step 2: เสียบโบนัสใน `useDaily.js`**

เพิ่ม import (ใต้ `import { totalPetDaily } ...`):
```js
import { getTowerBonus } from '../data/towerFloors.js'
```
เพิ่ม computed (ใต้ `const petIncome = ...`):
```js
  const towerBonus = computed(() => getTowerBonus(auth.userData?.towerBest || 0))
```
แก้ `ratePerDay` ให้รวม towerBonus:
```js
  const ratePerDay = computed(() => Math.round((baseIncome.value + petIncome.value + towerBonus.value) * (1 + bonusPct.value / 100) * buffMult.value))
```
เพิ่ม `towerBonus` ใน return object (ต่อท้าย `petIncome`):
```js
    baseIncome, petIncome, towerBonus, bonusPct, buffActive, buffMult, ratePerDay, ratePerHour,
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: ✓ built (ไม่มี error)

- [ ] **Step 4: Commit**

```bash
git add src/composables/useTower.js src/composables/useDaily.js
git commit -m "Tower: useTower (รันชั้น+bump state) + โบนัสหอคอยเข้า idle income"
```

---

### Task 6: `TeamPicker.vue` — เลือก 4 ตัว (= activePets)

**Files:**
- Create: `src/components/battle/TeamPicker.vue`

**Interfaces:**
- Consumes: `useAuthStore`, `getPetDef`, `<Emoji>`, `<BottomSheet>`
- Props: `open` (boolean) · Emits: `update:open`
- เขียน `activePets` ผ่าน `auth.patchUser`

- [ ] **Step 1: เขียนคอมโพเนนต์**

```vue
<!-- src/components/battle/TeamPicker.vue -->
<template>
  <BottomSheet :open="open" icon="⚔️" title="จัดทีม (4 ตัว)" @update:open="$emit('update:open', $event)">
    <div class="tp-slots">
      <div v-for="(id, i) in slots" :key="i" class="tp-slot" :class="{ filled: id }" @click="id && removeAt(i)">
        <template v-if="id"><Emoji :char="defOf(id).emoji" /></template>
        <span v-else class="tp-empty">+</span>
      </div>
    </div>
    <div class="tp-hint">{{ filledCount }}/4 · แตะตัวในทีมเพื่อถอด</div>

    <div class="tp-pool">
      <button
        v-for="p in owned" :key="p.id"
        class="tp-pet" :class="{ active: slots.includes(p.id) }"
        :disabled="!slots.includes(p.id) && filledCount >= 4"
        @click="toggle(p.id)"
      >
        <Emoji :char="defOf(p.id).emoji" />
        <span class="tp-grade" v-if="p.grade">{{ p.grade }}</span>
      </button>
      <div v-if="!owned.length" class="tp-none">ยังไม่มีเพ็ท — ไปเปิดกาชาที่ร้านค้าก่อนนะ</div>
    </div>
  </BottomSheet>
</template>

<script setup>
import Emoji from '../shared/Emoji.vue'
import BottomSheet from '../shared/BottomSheet.vue'
import { computed } from 'vue'
import { useAuthStore } from '../../stores/auth.js'
import { getPetDef } from '../../data/index.js'

defineProps({ open: { type: Boolean, default: false } })
defineEmits(['update:open'])

const auth = useAuthStore()
const owned = computed(() => auth.userData?.pets || [])
const slots = computed(() => {
  const a = (auth.userData?.activePets || []).slice(0, 4)
  while (a.length < 4) a.push(null)
  return a
})
const filledCount = computed(() => slots.value.filter(Boolean).length)
const defOf = (id) => getPetDef(id) || { emoji: '❓' }

async function save(next) {
  await auth.patchUser({ activePets: next }, { activePets: next })
}
function toggle(id) {
  const cur = slots.value.slice()
  const at = cur.indexOf(id)
  if (at >= 0) { cur[at] = null }
  else { const empty = cur.indexOf(null); if (empty < 0) return; cur[empty] = id }
  save(cur)
}
function removeAt(i) {
  const cur = slots.value.slice(); cur[i] = null; save(cur)
}
</script>

<style scoped>
.tp-slots { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 6px; }
.tp-slot { aspect-ratio: 1; border: 2px dashed rgba(0,0,0,.2); border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 1.8rem; background: #f8fafc; }
.tp-slot.filled { border-style: solid; border-color: var(--ink); background: #eef2ff; cursor: pointer; }
.tp-empty { color: rgba(0,0,0,.25); font-size: 1.6rem; }
.tp-hint { font-size: .68rem; color: rgba(0,0,0,.45); text-align: center; margin-bottom: 12px; }
.tp-pool { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; }
.tp-pet { position: relative; aspect-ratio: 1; border: 2px solid rgba(0,0,0,.12); border-radius: 12px; background: #fff; font-size: 1.5rem; cursor: pointer; display: flex; align-items: center; justify-content: center; }
.tp-pet.active { border-color: var(--primary); background: #eef2ff; }
.tp-pet:disabled { opacity: .4; cursor: not-allowed; }
.tp-grade { position: absolute; bottom: 2px; right: 4px; font-size: .56rem; font-weight: 800; color: #b45309; }
.tp-none { grid-column: 1 / -1; text-align: center; font-size: .76rem; color: rgba(0,0,0,.4); padding: 16px 0; }
</style>
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: ✓ built

- [ ] **Step 3: Commit**

```bash
git add src/components/battle/TeamPicker.vue
git commit -m "Battle: TeamPicker เลือกทีม 4 ตัว (= activePets)"
```

---

### Task 7: `BattleReplay.vue` + `TowerView.vue` + route + entry

**Files:**
- Create: `src/components/battle/BattleReplay.vue`, `src/views/TowerView.vue`
- Modify: `src/router/index.js` (route `/tower` lazy), `src/views/PlayView.vue` (SoonCard หอคอย → entry จริง)

**Interfaces:**
- BattleReplay props: `data` = `{ result, botTeam, playerTeam, won, cleared }` (หรือ null) · Emits `close`
- TowerView ใช้ `useTower()`

- [ ] **Step 1: เขียน `BattleReplay.vue`**

```vue
<!-- src/components/battle/BattleReplay.vue -->
<template>
  <div v-if="data" class="br-ov">
    <div class="br-box">
      <div class="br-team br-bot">
        <div v-for="(p, i) in data.botTeam" :key="'B'+i" class="br-unit" :class="unitClass('B'+i)">
          <Emoji :char="defOf(p.id).emoji" />
          <div class="br-hp"><div class="br-hp-fill" :style="{ width: hpPct('B'+i) + '%' }"></div></div>
          <span v-for="pop in popsFor('B'+i)" :key="pop.k" class="br-pop" :class="{ crit: pop.crit }">-{{ pop.dmg }}</span>
        </div>
      </div>

      <div class="br-vs">⚔️ ชั้น {{ data.cleared }}</div>

      <div class="br-team br-me">
        <div v-for="(p, i) in data.playerTeam" :key="'A'+i" class="br-unit" :class="unitClass('A'+i)">
          <Emoji :char="defOf(p.id).emoji" />
          <div class="br-hp"><div class="br-hp-fill me" :style="{ width: hpPct('A'+i) + '%' }"></div></div>
          <span v-for="pop in popsFor('A'+i)" :key="pop.k" class="br-pop" :class="{ crit: pop.crit }">-{{ pop.dmg }}</span>
        </div>
      </div>

      <div class="br-ctrl">
        <button v-if="!done" class="br-speed" @click="fast = !fast">{{ fast ? '×2 ⏩' : '×1 ▶' }}</button>
        <template v-else>
          <div class="br-result" :class="{ win: data.won }">{{ data.won ? `ชนะ! ขึ้นชั้น ${data.cleared + 1}` : 'แพ้ ลองใหม่ได้เลย' }}</div>
          <button class="br-close" @click="$emit('close')">ปิด</button>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import Emoji from '../shared/Emoji.vue'
import { ref, computed, watch, onUnmounted } from 'vue'
import { getPetDef } from '../../data/index.js'

const props = defineProps({ data: { type: Object, default: null } })
defineEmits(['close'])

const defOf = (id) => getPetDef(id) || { emoji: '❓' }
const idx = ref(0)            // ตำแหน่งใน log ที่เล่นถึง
const fast = ref(false)
const hp = ref({})            // uid → %hp ปัจจุบัน
const pops = ref({})          // uid → [{k,dmg,crit}] เลขเด้ง
const flashing = ref(null)    // uid ที่เพิ่งโดน
const acting = ref(null)      // uid ที่กำลังตี
let timer = null, popKey = 0

const log = computed(() => props.data?.result?.log || [])
const done = computed(() => idx.value >= log.value.length)

function reset() {
  idx.value = 0; pops.value = {}; flashing.value = null; acting.value = null
  const h = {}
  ;(props.data?.botTeam || []).forEach((_, i) => { h['B' + i] = 100 })
  ;(props.data?.playerTeam || []).forEach((_, i) => { h['A' + i] = 100 })
  hp.value = h
  step()
}
function maxHpOf(uid) {
  // %hp อิงจาก targetHpAfter เทียบ maxHp — engine ส่ง hp ดิบ; เราเก็บ % จากการไล่ log
  return 1
}
function step() {
  clearTimeout(timer)
  if (idx.value >= log.value.length) return
  const e = log.value[idx.value]
  if (e.t === 'attack') {
    acting.value = e.attacker
    flashing.value = e.target
    // เก็บ maxHp ครั้งแรกที่เห็น target เพื่อคำนวณ % (engine log มี targetHpAfter ดิบ)
    setHpPct(e.target, e.targetHpAfter)
    const k = popKey++
    pops.value = { ...pops.value, [e.target]: [...(pops.value[e.target] || []), { k, dmg: e.dmg, crit: e.crit }] }
    setTimeout(() => { pops.value = { ...pops.value, [e.target]: (pops.value[e.target] || []).filter(p => p.k !== k) } }, 600)
  }
  idx.value++
  if (idx.value < log.value.length) timer = setTimeout(step, fast.value ? 90 : 180)
  else { acting.value = null; flashing.value = null }
}
// targetHpAfter ดิบ → % เทียบค่าสูงสุดที่เคยเห็น (rough; เริ่ม 100%)
const seenMax = {}
function setHpPct(uid, rawAfter) {
  if (seenMax[uid] === undefined) seenMax[uid] = Math.max(rawAfter, 1)
  // ถ้าค่าแรกคือหลังโดนตีแล้ว อาจ < max จริง — ใช้ max ที่เคยเห็นเป็นฐาน (พอสำหรับ visual)
  seenMax[uid] = Math.max(seenMax[uid], rawAfter)
  hp.value = { ...hp.value, [uid]: Math.max(0, Math.round((rawAfter / seenMax[uid]) * 100)) }
}
function hpPct(uid) { return hp.value[uid] ?? 100 }
function popsFor(uid) { return pops.value[uid] || [] }
function unitClass(uid) {
  return { acting: acting.value === uid, flash: flashing.value === uid, dead: (hp.value[uid] ?? 100) <= 0 }
}

watch(() => props.data, (d) => { Object.keys(seenMax).forEach(k => delete seenMax[k]); if (d) reset() }, { immediate: true })
onUnmounted(() => clearTimeout(timer))
</script>

<style scoped>
.br-ov { position: fixed; inset: 0; z-index: 420; background: rgba(15,23,42,.82); display: flex; align-items: center; justify-content: center; padding: 16px; }
.br-box { width: 100%; max-width: 440px; display: flex; flex-direction: column; gap: 14px; }
.br-team { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
.br-unit { position: relative; aspect-ratio: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 2rem; background: rgba(255,255,255,.08); border-radius: 14px; transition: transform .1s; }
.br-unit.acting { transform: scale(1.18); z-index: 2; }
.br-unit.flash { animation: br-shake .18s; }
.br-unit.dead { opacity: .25; filter: grayscale(1); }
@keyframes br-shake { 0%,100% { transform: translateX(0) } 25% { transform: translateX(-4px) } 75% { transform: translateX(4px) } }
.br-hp { width: 80%; height: 5px; background: rgba(255,255,255,.2); border-radius: 999px; margin-top: 4px; overflow: hidden; }
.br-hp-fill { height: 100%; background: #ef4444; transition: width .15s; }
.br-hp-fill.me { background: #34d399; }
.br-pop { position: absolute; top: -2px; font-weight: 800; font-size: .8rem; color: #fca5a5; animation: br-rise .6s ease-out forwards; }
.br-pop.crit { color: #fbbf24; font-size: 1.05rem; }
@keyframes br-rise { from { transform: translateY(0); opacity: 1 } to { transform: translateY(-22px); opacity: 0 } }
.br-vs { text-align: center; color: #fff; font-weight: 800; font-size: .9rem; letter-spacing: .04em; }
.br-ctrl { display: flex; flex-direction: column; align-items: center; gap: 10px; margin-top: 4px; }
.br-speed, .br-close { border: 2px solid #fff; background: rgba(255,255,255,.12); color: #fff; border-radius: 12px; padding: 10px 20px; font-family: inherit; font-weight: 800; cursor: pointer; }
.br-result { font-size: 1.15rem; font-weight: 800; color: #fff; }
.br-result.win { color: #34d399; }
</style>
```

> หมายเหตุ replay: engine log ส่ง `targetHpAfter` เป็น hp ดิบ — UI ประมาณ %เลือดจากค่าสูงสุดที่เคยเห็น (พอสำหรับ visual v1). ถ้าต้องการ %เป๊ะ ค่อยให้ engine แนบ `maxHp`/uid ใน end event เป็น enhancement รอบหน้า (ไม่บล็อก v1).

- [ ] **Step 2: เขียน `TowerView.vue`**

```vue
<!-- src/views/TowerView.vue -->
<template>
  <div class="tab-content">
    <div class="page-title tw-head">
      <span><Emoji char="🏯" /> หอคอย</span>
      <RouterLink to="/play" class="tw-back">‹ กลับ</RouterLink>
    </div>

    <template v-if="authStore.isLoggedIn">
      <div class="tw-card">
        <div class="tw-floor">ชั้น {{ floor }}<span class="tw-best">· สูงสุด {{ best }}</span></div>
        <div class="tw-bonus"><Emoji char="🪙" /> โบนัสรายได้ตอนนี้ +{{ bonus.toLocaleString() }}/วัน</div>

        <div class="tw-row tw-bot">
          <span class="tw-label">ศัตรู</span>
          <span class="tw-team">
            <Emoji v-for="(p, i) in botTeam" :key="i" :char="defOf(p.id).emoji" />
          </span>
        </div>
        <div class="tw-vs">VS</div>
        <div class="tw-row tw-me">
          <span class="tw-label">ทีมคุณ</span>
          <span class="tw-team">
            <template v-if="team.length"><Emoji v-for="(p, i) in team" :key="i" :char="defOf(p.id).emoji" /></template>
            <span v-else class="tw-empty">ยังไม่ได้จัดทีม</span>
          </span>
          <button class="tw-edit" @click="pickOpen = true">จัดทีม</button>
        </div>

        <button class="tw-fight" :disabled="busy || !team.length" @click="onFight">
          <Emoji char="⚔️" /> {{ busy ? 'กำลังสู้…' : `สู้ชั้น ${floor}` }}
        </button>
        <div v-if="floor >= TOWER_MAX && best >= TOWER_MAX" class="tw-clear"><Emoji char="🏆" /> พิชิตหอคอยครบแล้ว!</div>
      </div>
    </template>
    <div v-else class="tw-login">เข้าสู่ระบบเพื่อเล่น</div>

    <TeamPicker v-model:open="pickOpen" />
    <BattleReplay :data="replay" @close="replay = null" />
  </div>
</template>

<script setup>
import Emoji from '../components/shared/Emoji.vue'
import { RouterLink } from 'vue-router'
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth.js'
import { useTower } from '../composables/useTower.js'
import { getPetDef } from '../data/index.js'
import TeamPicker from '../components/battle/TeamPicker.vue'
import BattleReplay from '../components/battle/BattleReplay.vue'

const authStore = useAuthStore()
const { floor, best, team, botTeam, bonus, fight, TOWER_MAX } = useTower()
const defOf = (id) => getPetDef(id) || { emoji: '❓' }

const pickOpen = ref(false)
const replay = ref(null)
const busy = ref(false)

async function onFight() {
  if (busy.value) return
  busy.value = true
  try { const r = await fight(); if (r) replay.value = r }
  finally { busy.value = false }
}
</script>

<style scoped>
.tw-head { display: flex; align-items: center; justify-content: space-between; }
.tw-back { font-size: .8rem; color: var(--muted); text-decoration: none; }
.tw-card { background: #fff; border: 2px solid var(--ink); border-radius: 18px; padding: 16px; box-shadow: var(--pop); }
.tw-floor { font-family: var(--font-display); font-size: 1.4rem; color: var(--ink); }
.tw-best { font-size: .8rem; color: var(--muted); margin-left: 8px; }
.tw-bonus { font-size: .76rem; color: #b45309; font-weight: 700; margin: 4px 0 14px; }
.tw-row { display: flex; align-items: center; gap: 10px; padding: 8px 0; }
.tw-label { font-size: .68rem; color: rgba(0,0,0,.45); width: 48px; flex-shrink: 0; }
.tw-team { font-size: 1.7rem; display: flex; gap: 6px; flex: 1; }
.tw-empty { font-size: .76rem; color: rgba(0,0,0,.35); }
.tw-edit { border: 1.5px solid var(--ink); background: #fff; border-radius: 10px; padding: 6px 12px; font-family: inherit; font-size: .72rem; font-weight: 800; cursor: pointer; }
.tw-vs { text-align: center; font-weight: 800; font-size: .72rem; color: rgba(0,0,0,.3); }
.tw-fight { width: 100%; margin-top: 14px; border: 2px solid var(--ink); border-radius: 14px; padding: 14px; font-family: inherit; font-size: .95rem; font-weight: 800; color: #fff; background: var(--primary); box-shadow: var(--pop); cursor: pointer; transition: transform .12s, box-shadow .12s; }
.tw-fight:active:not(:disabled) { transform: translate(2px,2px); box-shadow: 0 0 0 var(--ink); }
.tw-fight:disabled { background: #cbd5e1; cursor: default; box-shadow: none; }
.tw-clear { text-align: center; margin-top: 12px; font-weight: 800; color: #f59e0b; }
.tw-login { text-align: center; color: rgba(0,0,0,.4); padding: 30px 0; font-size: .85rem; }
</style>
```

- [ ] **Step 3: เพิ่ม route `/tower`**

ใน `src/router/index.js` เพิ่ม route (ตามแพทเทิร์น lazy เดิมของไฟล์):
```js
  { path: '/tower', component: () => import('../views/TowerView.vue') },
```

- [ ] **Step 4: เปลี่ยน entry หอคอยใน `PlayView.vue`**

แทน `<SoonCard emoji="🏯" label="ปีนหอคอย" />` ด้วยการ์ดจริง:
```vue
        <RouterLink to="/tower" class="game-card">
          <span class="gc-emoji"><Emoji char="🏯" /></span>
          <span class="gc-name">ปีนหอคอย</span>
          <span class="gc-badge grow">ไต่ชั้น · ปลดโบนัส</span>
        </RouterLink>
```
(เหลือ SoonCard ⚔️/🗺️/🍬 ตามเดิมในกริดสนามประลอง)

- [ ] **Step 5: Verify build**

Run: `npm run build`
Expected: ✓ built (ไม่มี error)

- [ ] **Step 6: Commit**

```bash
git add src/components/battle/BattleReplay.vue src/views/TowerView.vue src/router/index.js src/views/PlayView.vue
git commit -m "Tower: หน้าหอคอย + battle replay + entry จาก Play (route /tower)"
```

---

### Task 8: รวมเทส + manual verify + รีวิว

**Files:** (ไม่แก้โค้ดใหม่ — verify อย่างเดียว เว้นเจอบั๊ก)

- [ ] **Step 1: รันเทส pure ทั้งหมด**

Run:
```bash
node --test src/data/battle.test.js src/utils/battleEngine.test.js src/data/towerFloors.test.js src/data/userSchema.test.js
```
Expected: ทุกไฟล์ PASS

- [ ] **Step 2: Build**

Run: `npm run build`
Expected: ✓ built

- [ ] **Step 3: Manual verify (dev) — checklist**

`npm run dev` → เปิด `/play` → "ปีนหอคอย":
- จัดทีม 4 ตัว (TeamPicker เปิด/ใส่/ถอด/ปิด) → activePets เปลี่ยนจริง
- กดสู้ → replay เล่น (เลขเด้ง/แฟลช/หลอดเลือด ลด), ปุ่ม ×2 เร่งได้
- ชนะ → ชั้นเพิ่ม + towerBest อัปเดต · แพ้ → ชั้นเท่าเดิม (รีทรายฟรี)
- กลับ Home → DailyCard ratePerDay รวมโบนัสหอคอย (ถ้า best ≥ 10)
- โปรไฟล์/Members ที่โชว์ activePets ยังไม่พัง (รองรับ 4)

- [ ] **Step 4: (ถ้าผ่าน) ขอ requesting-code-review ก่อน merge/deploy**

ใช้ skill `superpowers:requesting-code-review` ทบทวนงานทั้ง feature เทียบ spec ก่อนตัดสินใจ deploy

## Self-Review (ผู้เขียนแผนตรวจแล้ว)
- **Spec coverage:** battle.js(T1) · engine(T2) · towerFloors+bonus(T3) · activePets 3→4(T4) · useTower+useDaily(T5) · TeamPicker(T6) · TowerView+BattleReplay+route+entry(T7) · test+verify(T8) — ครบทุกหน่วยใน spec §สถาปัตยกรรม/UI/schema/test ✓
- **Placeholder scan:** โค้ดเต็มทุก step ที่แตะโค้ด ✓ (replay %hp ใช้ค่าประมาณ — มีหมายเหตุ + ทางปรับ ไม่บล็อก)
- **Type consistency:** `simulateBattle(team, team, seed)→{winner,rounds,log}` · `getFloorTeam→[{id,rarity,element,grade}]` · `buildCombatant(pet)→{id,element,atk,maxHp,hp}` · `useTower().fight()→{result,botTeam,playerTeam,won,cleared}` ใช้ตรงกันทุก task ✓
