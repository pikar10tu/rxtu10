# Gacha Rework Phase B — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** รื้อกาชาเป็น banner เดียว + pity + ระบบเลือกเป้า legendary 50/50 (new-first ถ้าไม่เลือก) + สุ่ม 1/สุ่ม 10 + grade-up เหลือ 1 copy/ขั้น + ดันรายได้เพ็ท ×2.5 + เก็บกวาด field ตาย `refine`

**Architecture:** logic กาชาทั้งหมดเป็น **pure util ฉีด `rng` ได้** (`utils/gacha.js`, `utils/gachaMerge.js`) + เทส `node --test` · UI ใน `ShopView.vue` เรียก util แล้วเขียน user doc ผ่าน `auth.patchUser(optimistic, server)` · ทุก field ใหม่อยู่บน user doc (owner-write) — **ไม่แตะ firestore.rules / ไม่มี index ใหม่**

**Tech Stack:** Vue 3 (SFC, `<script setup>`) · Pinia (`stores/auth.js`) · Firebase Firestore (`increment`) · เทส `node:test` + `node:assert/strict`

## Global Constraints

- เพิ่มฟิลด์ใหม่ทุกตัว → ใส่ `data/userSchema.js` `USER_DEFAULTS` ที่เดียว (ห้าม `userData?.x || y` กระจาย)
- เขียน user doc ผ่าน `auth.patchUser(optimistic, server)` เท่านั้น (`server` ใช้ `increment()` ได้)
- ข้อความ commit รูปแบบ `Area: อะไร (ทำไม)` ไทยปนอังกฤษ · ปิดท้ายด้วย `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`
- ตัวเลขเศรษฐกิจทั้งหมด = draft pin ปรับที่เดียวใน `data/`/`utils/`
- modal/overlay ใหม่ทุกตัว → ครอบด้วย `<Teleport to="body">` (กับดัก stacking context: `#main-content` เป็น `position:fixed`)
- emoji ใน template → `<Emoji :char="..." />` เสมอ (อย่าใส่ emoji ดิบใน text node)
- เทส pure รันด้วย `node --test src/utils/<x>.test.js` (ไม่มี test runner กลาง)
- **อย่าแตะ `EGG_TYPES` ใน `data/index.js`** (คนละตัวกับ `data/shop.js` — index.js ตัวนี้ถูกใช้โดย `data/pets.js`) · งานนี้ลบเฉพาะของใน `data/shop.js`
- roster legendary = 9 ตัว: `bahamut, kirin, trex, ouroboros, simurgh, phoenix, whale, qilin, mammoth`

---

### Task 1: userSchema — เพิ่ม 3 field กาชา

**Files:**
- Modify: `src/data/userSchema.js` (USER_DEFAULTS)
- Test: `src/data/userSchema.test.js` (create)

**Interfaces:**
- Produces: `USER_DEFAULTS.gachaPity:0`, `USER_DEFAULTS.gachaTarget:null`, `USER_DEFAULTS.gachaGuaranteed:false` · `normalizeUserData(data)` เติมค่า default เหล่านี้

- [ ] **Step 1: เขียนเทสที่ยังไม่ผ่าน**

สร้าง `src/data/userSchema.test.js`:
```js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { USER_DEFAULTS, normalizeUserData } from './userSchema.js'

test('USER_DEFAULTS has gacha fields', () => {
  assert.equal(USER_DEFAULTS.gachaPity, 0)
  assert.equal(USER_DEFAULTS.gachaTarget, null)
  assert.equal(USER_DEFAULTS.gachaGuaranteed, false)
})

test('normalizeUserData fills gacha defaults on a sparse doc', () => {
  const d = normalizeUserData({ coins: 5 })
  assert.equal(d.gachaPity, 0)
  assert.equal(d.gachaTarget, null)
  assert.equal(d.gachaGuaranteed, false)
})

test('normalizeUserData keeps existing gacha values', () => {
  const d = normalizeUserData({ gachaPity: 42, gachaTarget: 'bahamut', gachaGuaranteed: true })
  assert.equal(d.gachaPity, 42)
  assert.equal(d.gachaTarget, 'bahamut')
  assert.equal(d.gachaGuaranteed, true)
})
```

- [ ] **Step 2: รันเทสให้เห็นว่า fail**

Run: `node --test src/data/userSchema.test.js`
Expected: FAIL (`gachaPity` undefined → expected 0)

- [ ] **Step 3: เพิ่ม field ใน USER_DEFAULTS**

ใน `src/data/userSchema.js` หลังบรรทัด `freeGachaTickets: 0,` เพิ่ม:
```js
  // ── gacha (Phase B) ──
  gachaPity: 0,            // จำนวน pull ตั้งแต่ legendary ล่าสุด (soft 76 / hard 100)
  gachaTarget: null,       // species id ของ legendary ที่เลือกเป็นเป้า (null = ไม่เลือก → new-first)
  gachaGuaranteed: false,  // true = legendary ครั้งหน้าการันตีตัวเป้า (จาก lose 50/50)
```

- [ ] **Step 4: รันเทสให้ผ่าน**

Run: `node --test src/data/userSchema.test.js`
Expected: PASS (3 tests)

- [ ] **Step 5: commit**

```bash
git add src/data/userSchema.js src/data/userSchema.test.js
git commit -m "Schema: เพิ่ม gachaPity/gachaTarget/gachaGuaranteed (รองรับกาชา Phase B)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 2: petUtils — ดันรายได้เพ็ท base ×2.5

**Files:**
- Modify: `src/utils/petUtils.js:14-19` (RARITY_DAILY_BASE)
- Test: `src/utils/petUtils.test.js` (create)

**Interfaces:**
- Consumes: `petDailyCoins(pet)` (มีอยู่แล้ว), `GRADE_MULTI_V2` (คงเดิม `[1.0,2.0,3.5,5.5,8.0,12.0]`)
- Produces: `RARITY_DAILY_BASE = { common:15, rare:38, epic:85, legendary:175 }`

- [ ] **Step 1: เขียนเทสที่ยังไม่ผ่าน**

สร้าง `src/utils/petUtils.test.js`:
```js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { RARITY_DAILY_BASE, petDailyCoins } from './petUtils.js'

test('RARITY_DAILY_BASE bumped x2.5', () => {
  assert.deepEqual(RARITY_DAILY_BASE, { common: 15, rare: 38, epic: 85, legendary: 175 })
})

test('petDailyCoins grade 0 = base', () => {
  assert.equal(petDailyCoins({ rarity: 'common', grade: 0 }), 15)
  assert.equal(petDailyCoins({ rarity: 'legendary', grade: 0 }), 175)
})

test('petDailyCoins grade V = base x12', () => {
  assert.equal(petDailyCoins({ rarity: 'legendary', grade: 5 }), 2100) // 175 * 12
})
```

- [ ] **Step 2: รันเทสให้เห็นว่า fail**

Run: `node --test src/utils/petUtils.test.js`
Expected: FAIL (RARITY_DAILY_BASE.common === 6, expected 15)

- [ ] **Step 3: แก้ตัวเลข**

ใน `src/utils/petUtils.js` แก้:
```js
export const RARITY_DAILY_BASE = {
  common: 15,
  rare: 38,
  epic: 85,
  legendary: 175,
}
```
(คอมเมนต์เดิม `(was 4 / 10 / 22 / 45)` เปลี่ยนเป็น `(Phase B ×2.5 จาก 6/15/35/70)`)

- [ ] **Step 4: รันเทสให้ผ่าน**

Run: `node --test src/utils/petUtils.test.js`
Expected: PASS (3 tests)

- [ ] **Step 5: commit**

```bash
git add src/utils/petUtils.js src/utils/petUtils.test.js
git commit -m "Economy: ดันรายได้เพ็ท base ×2.5 (income คิดต่อชนิดแล้ว ไม่ใช่ต่อ instance)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 3: petGrade — อัพเกรดใช้ 1 copy/ขั้น

**Files:**
- Modify: `src/utils/petGrade.js:6-12` (gradeUpCost)
- Test: `src/utils/petGrade.test.js` (มีอยู่แล้ว — แก้)

**Interfaces:**
- Produces: `gradeUpCost(pet)` → `{ copies: 1, coins: RARITY_GRADE_COIN[rarity] * targetGrade }` (เหรียญคงสูตรเดิม) · `null` เมื่อ grade ≥ 5

- [ ] **Step 1: แก้เทสให้สะท้อน 1 copy/ขั้น (จะ fail)**

แทนที่เนื้อหา `src/utils/petGrade.test.js` ด้วย:
```js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { gradeUpCost, canUpgrade, MAX_GRADE } from './petGrade.js'

test('gradeUpCost ใช้ 1 copy ทุกขั้น, เหรียญ scale ตามเกรดเป้า', () => {
  assert.deepEqual(gradeUpCost({ grade: 0, rarity: 'common' }), { copies: 1, coins: 200 })   // 200*1
  assert.deepEqual(gradeUpCost({ grade: 1, rarity: 'common' }), { copies: 1, coins: 400 })   // 200*2
  assert.deepEqual(gradeUpCost({ grade: 4, rarity: 'legendary' }), { copies: 1, coins: 20000 }) // 4000*5
})

test('gradeUpCost = null เมื่อ maxed', () => {
  assert.equal(gradeUpCost({ grade: MAX_GRADE, rarity: 'epic' }), null)
})

test('canUpgrade ต้องมี 1 copy + เหรียญพอ', () => {
  assert.equal(canUpgrade({ grade: 0, rarity: 'common', copies: 1 }, 200), true)
  assert.equal(canUpgrade({ grade: 0, rarity: 'common', copies: 0 }, 200), false) // copy ไม่พอ
  assert.equal(canUpgrade({ grade: 0, rarity: 'common', copies: 1 }, 199), false) // เหรียญไม่พอ
})
```

- [ ] **Step 2: รันเทสให้เห็นว่า fail**

Run: `node --test src/utils/petGrade.test.js`
Expected: FAIL (gradeUpCost คืน `copies: 1` ของเกรด 1 ยังเป็น 2 อยู่ → mismatch ที่ case แรก grade 0 ผ่าน แต่ canUpgrade copies:1 ของเกรดสูงจะ fail)

- [ ] **Step 3: แก้ gradeUpCost**

ใน `src/utils/petGrade.js` แก้ return:
```js
export function gradeUpCost(pet) {
  const g = pet?.grade || 0
  if (g >= MAX_GRADE) return null
  const target = g + 1
  const base = RARITY_GRADE_COIN[pet?.rarity] ?? RARITY_GRADE_COIN.common
  return { copies: 1, coins: base * target }
}
```
(แก้คอมเมนต์บรรทัดบนสุดจาก `อัพไป N ใช้ N copies + เหรียญ` → `อัพ 1 ขั้นใช้ 1 copy + เหรียญ (เหรียญ scale ตามเกรดเป้า)`)

- [ ] **Step 4: รันเทสให้ผ่าน**

Run: `node --test src/utils/petGrade.test.js`
Expected: PASS (3 tests)

- [ ] **Step 5: commit**

```bash
git add src/utils/petGrade.js src/utils/petGrade.test.js
git commit -m "Pet: grade-up เหลือ 1 copy/ขั้น (max ง่ายขึ้น, เหรียญยังเป็น coin sink)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 4: gacha.js — rate + pity (legendaryChance, rollRarity)

**Files:**
- Create: `src/utils/gacha.js`
- Test: `src/utils/gacha.test.js` (create)

**Interfaces:**
- Produces: ค่าคงที่ `GACHA_RATES`, `SOFT_PITY=76`, `HARD_PITY=100`, `SOFT_PITY_STEP=6`, `PULL_COST=1000`, `TEN_PULL_COST=10000`, `TEN_PULL_N=11` · `legendaryChance(pity) → number` (%) · `rollRarity(pity, rng) → 'common'|'rare'|'epic'|'legendary'`
- หมายเหตุ: `pity` = จำนวน pull ตั้งแต่ legendary ล่าสุด (pull ปัจจุบันคือ pull ที่ `pity+1`)

- [ ] **Step 1: เขียนเทสที่ยังไม่ผ่าน**

สร้าง `src/utils/gacha.test.js`:
```js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { legendaryChance, rollRarity, GACHA_RATES, SOFT_PITY, HARD_PITY } from './gacha.js'

// rng ปลอม: คืนค่าจาก list ตามลำดับการเรียก (ตัวสุดท้ายค้างไว้)
const seq = (vals) => { let i = 0; return () => vals[Math.min(i++, vals.length - 1)] }

test('legendaryChance base ก่อน soft pity', () => {
  assert.equal(legendaryChance(0), 1.5)
  assert.equal(legendaryChance(74), 1.5) // pull 75
})

test('legendaryChance ไต่ขึ้นที่ soft pity', () => {
  assert.equal(legendaryChance(75), 7.5)         // pull 76 = 1.5 + 6
  assert.ok(legendaryChance(90) > legendaryChance(80))
})

test('legendaryChance hard pity = 100', () => {
  assert.equal(legendaryChance(99), 100)  // pull 100
})

test('rollRarity = legendary เมื่อ rng ต่ำกว่า chance', () => {
  assert.equal(rollRarity(0, seq([0.0])), 'legendary')   // 0 < 1.5%
})

test('rollRarity hard pity บังคับ legendary', () => {
  assert.equal(rollRarity(99, seq([0.99])), 'legendary') // chance 100 → 99 < 100
})

test('rollRarity tier ล่างเมื่อไม่ออก legendary', () => {
  assert.equal(rollRarity(0, seq([0.99, 0.0])), 'epic')    // ไม่ legendary; r2 ต่ำ → epic
  assert.equal(rollRarity(0, seq([0.99, 0.99])), 'common') // r2 สูง → common
})
```

- [ ] **Step 2: รันเทสให้เห็นว่า fail**

Run: `node --test src/utils/gacha.test.js`
Expected: FAIL (Cannot find module './gacha.js')

- [ ] **Step 3: เขียน gacha.js (ส่วน rate/pity)**

สร้าง `src/utils/gacha.js`:
```js
// gacha (Phase B) — pure, ฉีด rng ได้ทุกฟังก์ชัน · ค่าทั้งหมด draft pin
export const GACHA_RATES = { common: 60.5, rare: 30, epic: 8, legendary: 1.5 } // % รวม 100
export const SOFT_PITY = 76      // pull ที่เริ่มไต่ rate legendary
export const HARD_PITY = 100     // pull ที่การันตี legendary
export const SOFT_PITY_STEP = 6  // +%/pull หลัง soft pity
export const PULL_COST = 1000
export const TEN_PULL_COST = 10000
export const TEN_PULL_N = 11     // สุ่ม 10 ได้ 11 ตัว

/** % โอกาสออก legendary ของ pull ถัดไป เมื่อ pity = pull ที่สะสมตั้งแต่ legendary ล่าสุด */
export function legendaryChance(pity) {
  const pull = pity + 1
  if (pull >= HARD_PITY) return 100
  if (pull >= SOFT_PITY) return Math.min(100, GACHA_RATES.legendary + (pull - SOFT_PITY + 1) * SOFT_PITY_STEP)
  return GACHA_RATES.legendary
}

/** สุ่ม rarity 1 ครั้ง (อาจเรียก rng ได้ถึง 2 ครั้ง: เช็ค legendary → เลือก tier ล่าง) */
export function rollRarity(pity, rng = Math.random) {
  if (rng() * 100 < legendaryChance(pity)) return 'legendary'
  const rest = GACHA_RATES.common + GACHA_RATES.rare + GACHA_RATES.epic // 98.5
  const r = rng() * rest
  if (r < GACHA_RATES.epic) return 'epic'
  if (r < GACHA_RATES.epic + GACHA_RATES.rare) return 'rare'
  return 'common'
}
```

- [ ] **Step 4: รันเทสให้ผ่าน**

Run: `node --test src/utils/gacha.test.js`
Expected: PASS (6 tests)

- [ ] **Step 5: commit**

```bash
git add src/utils/gacha.js src/utils/gacha.test.js
git commit -m "Gacha: rate + pity (soft 76 ไต่ขึ้น, hard 100 การันตี legendary)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 5: gacha.js — pickLegendary (50/50 เลือกเป้า + new-first)

**Files:**
- Modify: `src/utils/gacha.js` (เพิ่มฟังก์ชัน)
- Test: `src/utils/gacha.test.js` (เพิ่มเทส)

**Interfaces:**
- Produces: `pickLegendary({ target, guaranteed, ownedLegendaryIds, legendaryIds, rng }) → { id, won, newGuaranteed }`
  - มี `target` + `guaranteed` → `{ id: target, won: true, newGuaranteed: false }`
  - มี `target` + 50/50 win → `{ id: target, won: true, newGuaranteed: false }` · lose → `{ id: <legendary อื่น>, won: false, newGuaranteed: true }`
  - ไม่มี `target` (new-first) → `won: null`, สุ่มจากตัวที่ยังไม่มีก่อน, ครบแล้วสุ่มทั้งหมด

- [ ] **Step 1: เพิ่มเทส (จะ fail)**

ต่อท้าย `src/utils/gacha.test.js`:
```js
import { pickLegendary } from './gacha.js'

const LEG = ['bahamut', 'kirin', 'trex', 'ouroboros']

test('pickLegendary: guaranteed → ได้เป้าแน่ ล้างธง', () => {
  const r = pickLegendary({ target: 'kirin', guaranteed: true, ownedLegendaryIds: [], legendaryIds: LEG, rng: () => 0.99 })
  assert.deepEqual(r, { id: 'kirin', won: true, newGuaranteed: false })
})

test('pickLegendary: win 50/50 → ได้เป้า', () => {
  const r = pickLegendary({ target: 'kirin', guaranteed: false, ownedLegendaryIds: [], legendaryIds: LEG, rng: () => 0.0 }) // <0.5
  assert.deepEqual(r, { id: 'kirin', won: true, newGuaranteed: false })
})

test('pickLegendary: lose 50/50 → ได้ตัวอื่น + ติดธง', () => {
  // rng#1 = 0.9 (>=0.5 → lose), rng#2 = 0 → เลือก others[0]
  const seqq = (() => { let i = 0; const v = [0.9, 0.0]; return () => v[Math.min(i++, v.length - 1)] })()
  const r = pickLegendary({ target: 'kirin', guaranteed: false, ownedLegendaryIds: [], legendaryIds: LEG, rng: seqq })
  assert.equal(r.won, false)
  assert.equal(r.newGuaranteed, true)
  assert.notEqual(r.id, 'kirin')
  assert.ok(LEG.includes(r.id))
})

test('pickLegendary: ไม่มีเป้า → new-first (สุ่มตัวที่ยังไม่มี)', () => {
  const r = pickLegendary({ target: null, guaranteed: false, ownedLegendaryIds: ['bahamut', 'kirin', 'trex'], legendaryIds: LEG, rng: () => 0.0 })
  assert.equal(r.id, 'ouroboros') // ตัวเดียวที่ยังไม่มี
  assert.equal(r.won, null)
  assert.equal(r.newGuaranteed, false)
})

test('pickLegendary: ไม่มีเป้า + มีครบแล้ว → สุ่มทั้งหมด', () => {
  const r = pickLegendary({ target: null, guaranteed: false, ownedLegendaryIds: LEG, legendaryIds: LEG, rng: () => 0.0 })
  assert.ok(LEG.includes(r.id))
  assert.equal(r.won, null)
})
```

- [ ] **Step 2: รันเทสให้เห็นว่า fail**

Run: `node --test src/utils/gacha.test.js`
Expected: FAIL (pickLegendary is not a function)

- [ ] **Step 3: เพิ่ม pickLegendary**

ต่อท้าย `src/utils/gacha.js`:
```js
/** เลือกตัว legendary ที่จะออก ตามระบบเป้า 50/50 หรือ new-first */
export function pickLegendary({ target, guaranteed, ownedLegendaryIds, legendaryIds, rng = Math.random }) {
  if (target) {
    if (guaranteed) return { id: target, won: true, newGuaranteed: false }
    if (rng() < 0.5) return { id: target, won: true, newGuaranteed: false }
    const others = legendaryIds.filter((id) => id !== target)
    const id = others.length ? others[Math.floor(rng() * others.length)] : target
    return { id, won: false, newGuaranteed: true }
  }
  // new-first: สุ่มตัวที่ยังไม่มีก่อน, ครบแล้วสุ่มทั้งหมด
  const owned = new Set(ownedLegendaryIds || [])
  const unowned = legendaryIds.filter((id) => !owned.has(id))
  const pool = unowned.length ? unowned : legendaryIds
  return { id: pool[Math.floor(rng() * pool.length)], won: null, newGuaranteed: false }
}
```

- [ ] **Step 4: รันเทสให้ผ่าน**

Run: `node --test src/utils/gacha.test.js`
Expected: PASS (11 tests รวมของ Task 4)

- [ ] **Step 5: commit**

```bash
git add src/utils/gacha.js src/utils/gacha.test.js
git commit -m "Gacha: pickLegendary (เลือกเป้า 50/50 + การันตี, new-first ถ้าไม่เลือก)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 6: gacha.js — rollOne + rollMany (carry state + การันตี epic ต่อ 10)

**Files:**
- Modify: `src/utils/gacha.js` (เพิ่มฟังก์ชัน)
- Test: `src/utils/gacha.test.js` (เพิ่มเทส)

**Interfaces:**
- Produces:
  - `rarityPool(catalog, rarity) → string[]` (species id ของ rarity นั้น)
  - `rollOne(state, catalog, rng) → { rarity, id, won, nextPity, nextGuaranteed, nextOwned }` — `state = { pity, target, guaranteed, ownedLegendaryIds }` · legendary → `nextPity:0`; ไม่ใช่ → `nextPity: pity+1`
  - `rollMany(n, state, catalog, rng) → { results:[{rarity,id,won}], nextState:{pity,target,guaranteed} }` · ถ้า `n>=10` แล้วไม่มี ≥ epic → อัพตัวสุดท้ายเป็น epic
- Consumes: `PETS` จาก `data/index.js` (ในเทสใช้ catalog ปลอม)

- [ ] **Step 1: เพิ่มเทส (จะ fail)**

ต่อท้าย `src/utils/gacha.test.js`:
```js
import { rollOne, rollMany, rarityPool } from './gacha.js'

// catalog ปลอม: 1 legendary, 1 epic, 1 rare, 1 common
const CAT = [
  { id: 'L1', rarity: 'legendary' }, { id: 'L2', rarity: 'legendary' },
  { id: 'E1', rarity: 'epic' }, { id: 'R1', rarity: 'rare' }, { id: 'C1', rarity: 'common' },
]

test('rarityPool คืน id ตาม rarity', () => {
  assert.deepEqual(rarityPool(CAT, 'legendary'), ['L1', 'L2'])
  assert.deepEqual(rarityPool(CAT, 'common'), ['C1'])
})

test('rollOne: ไม่ legendary → pity+1', () => {
  const r = rollOne({ pity: 3, target: null, guaranteed: false, ownedLegendaryIds: [] }, CAT, () => 0.99)
  assert.equal(r.nextPity, 4)
  assert.notEqual(r.rarity, 'legendary')
})

test('rollOne: legendary → pity reset 0 + เพิ่ม owned', () => {
  const r = rollOne({ pity: 99, target: null, guaranteed: false, ownedLegendaryIds: [] }, CAT, () => 0.0)
  assert.equal(r.rarity, 'legendary')
  assert.equal(r.nextPity, 0)
  assert.ok(r.nextOwned.includes(r.id))
})

test('rollMany: การันตี ≥1 epic ใน 10-pull (เคสได้ common ล้วน)', () => {
  const { results, nextState } = rollMany(11, { pity: 0, target: null, guaranteed: false, ownedLegendaryIds: [] }, CAT, () => 0.99)
  assert.equal(results.length, 11)
  assert.ok(results.some((r) => r.rarity === 'epic'))   // ตัวสุดท้ายถูกอัพ
  assert.equal(results[10].rarity, 'epic')
  assert.equal(nextState.pity, 11)                      // 11 common = pity ไต่ถึง 11
})
```

- [ ] **Step 2: รันเทสให้เห็นว่า fail**

Run: `node --test src/utils/gacha.test.js`
Expected: FAIL (rollOne is not a function)

- [ ] **Step 3: เพิ่ม rarityPool/rollOne/rollMany**

ต่อท้าย `src/utils/gacha.js`:
```js
export const rarityPool = (catalog, rarity) => catalog.filter((p) => p.rarity === rarity).map((p) => p.id)

const RANK = { common: 0, rare: 1, epic: 2, legendary: 3 }

/** สุ่ม 1 ครั้งพร้อม carry state (pity/guaranteed/owned) */
export function rollOne(state, catalog, rng = Math.random) {
  const legendaryIds = rarityPool(catalog, 'legendary')
  const rarity = rollRarity(state.pity, rng)
  if (rarity === 'legendary') {
    const pick = pickLegendary({
      target: state.target, guaranteed: state.guaranteed,
      ownedLegendaryIds: state.ownedLegendaryIds, legendaryIds, rng,
    })
    const nextOwned = state.ownedLegendaryIds.includes(pick.id)
      ? state.ownedLegendaryIds : [...state.ownedLegendaryIds, pick.id]
    return { rarity, id: pick.id, won: pick.won, nextPity: 0, nextGuaranteed: pick.newGuaranteed, nextOwned }
  }
  const pool = rarityPool(catalog, rarity)
  const id = pool[Math.floor(rng() * pool.length)]
  return { rarity, id, won: null, nextPity: state.pity + 1, nextGuaranteed: state.guaranteed, nextOwned: state.ownedLegendaryIds }
}

/** สุ่ม n ครั้ง (carry state) + การันตี ≥1 epic ต่อ 10-pull */
export function rollMany(n, state, catalog, rng = Math.random) {
  let cur = { pity: state.pity, target: state.target, guaranteed: state.guaranteed, ownedLegendaryIds: [...(state.ownedLegendaryIds || [])] }
  const results = []
  for (let i = 0; i < n; i++) {
    const r = rollOne(cur, catalog, rng)
    results.push({ rarity: r.rarity, id: r.id, won: r.won })
    cur = { pity: r.nextPity, target: cur.target, guaranteed: r.nextGuaranteed, ownedLegendaryIds: r.nextOwned }
  }
  if (n >= 10 && !results.some((r) => RANK[r.rarity] >= RANK.epic)) {
    const pool = rarityPool(catalog, 'epic')
    results[results.length - 1] = { rarity: 'epic', id: pool[Math.floor(rng() * pool.length)], won: null }
  }
  return { results, nextState: { pity: cur.pity, target: cur.target, guaranteed: cur.guaranteed } }
}
```

- [ ] **Step 4: รันเทสให้ผ่าน**

Run: `node --test src/utils/gacha.test.js`
Expected: PASS (15 tests)

- [ ] **Step 5: commit**

```bash
git add src/utils/gacha.js src/utils/gacha.test.js
git commit -m "Gacha: rollOne/rollMany (carry pity+guaranteed, การันตี epic ต่อ 10-pull)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 7: gachaMerge.js — รวมผลสุ่มเข้า pets[]

**Files:**
- Create: `src/utils/gachaMerge.js`
- Test: `src/utils/gachaMerge.test.js` (create)

**Interfaces:**
- Produces: `mergeRolls(pets, results, catalog) → { pets: newPets, summary: [{ id, name, rarity, emoji, isNew }] }`
  - ตัวใหม่ → push instance (`grade:0, copies:0, potential:[]`) + `isNew:true` · ตัวมีแล้ว → `copies+1`, `isNew:false`
  - ซ้ำในชุดเดียว: ครั้งแรก unlock (isNew true) ครั้งถัดไป +copies (isNew false)
  - `summary` เรียง rarity สูง→ต่ำ
- Consumes: `results` จาก `rollMany` (`[{rarity,id,won}]`), `catalog` = `PETS`

- [ ] **Step 1: เขียนเทสที่ยังไม่ผ่าน**

สร้าง `src/utils/gachaMerge.test.js`:
```js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mergeRolls } from './gachaMerge.js'

const CAT = [
  { id: 'cat', name: 'แมว', emoji: '🐱', rarity: 'common', element: 'scissors' },
  { id: 'wolf', name: 'หมาป่า', emoji: '🐺', rarity: 'rare', element: 'fist' },
  { id: 'bahamut', name: 'บาฮามุท', emoji: '🐉', rarity: 'legendary', element: 'fist' },
]

test('ตัวใหม่ = unlock (copies 0, isNew true)', () => {
  const { pets, summary } = mergeRolls([], [{ rarity: 'common', id: 'cat' }], CAT)
  assert.equal(pets.length, 1)
  assert.equal(pets[0].id, 'cat')
  assert.equal(pets[0].copies, 0)
  assert.equal(pets[0].grade, 0)
  assert.equal(summary[0].isNew, true)
})

test('ตัวที่มีอยู่แล้ว = +1 copy, isNew false', () => {
  const { pets, summary } = mergeRolls([{ id: 'cat', rarity: 'common', copies: 2, grade: 1 }], [{ rarity: 'common', id: 'cat' }], CAT)
  assert.equal(pets[0].copies, 3)
  assert.equal(pets[0].grade, 1) // grade ไม่เปลี่ยน
  assert.equal(summary[0].isNew, false)
})

test('ได้ตัวเดียวกัน 3 ครั้งในชุด → unlock + 2 copies', () => {
  const r = [{ rarity: 'common', id: 'cat' }, { rarity: 'common', id: 'cat' }, { rarity: 'common', id: 'cat' }]
  const { pets, summary } = mergeRolls([], r, CAT)
  assert.equal(pets.length, 1)
  assert.equal(pets[0].copies, 2)
  assert.equal(summary.filter((s) => s.isNew).length, 1)
})

test('summary เรียง rarity สูง→ต่ำ', () => {
  const r = [{ rarity: 'common', id: 'cat' }, { rarity: 'legendary', id: 'bahamut' }, { rarity: 'rare', id: 'wolf' }]
  const { summary } = mergeRolls([], r, CAT)
  assert.deepEqual(summary.map((s) => s.rarity), ['legendary', 'rare', 'common'])
})
```

- [ ] **Step 2: รันเทสให้เห็นว่า fail**

Run: `node --test src/utils/gachaMerge.test.js`
Expected: FAIL (Cannot find module './gachaMerge.js')

- [ ] **Step 3: เขียน gachaMerge.js**

สร้าง `src/utils/gachaMerge.js`:
```js
// รวมผลสุ่มกาชาเข้า pets[] (species-based: ตัวใหม่ unlock, ซ้ำ +copies) — pure
const RANK = { common: 0, rare: 1, epic: 2, legendary: 3 }

export function mergeRolls(pets, results, catalog) {
  const newPets = (pets || []).map((p) => ({ ...p }))
  const byId = new Map(newPets.map((p) => [p.id, p]))
  const summary = []
  for (const r of results) {
    const def = catalog.find((p) => p.id === r.id)
    if (!def) continue
    let isNew = false
    if (byId.has(def.id)) {
      const p = byId.get(def.id)
      p.copies = (p.copies || 0) + 1
    } else {
      const inst = {
        id: def.id, name: def.name, emoji: def.emoji, rarity: def.rarity, element: def.element,
        grade: 0, copies: 0, potential: [],
        instId: `${def.id}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`, bornAt: Date.now(),
      }
      newPets.push(inst)
      byId.set(inst.id, inst)
      isNew = true
    }
    summary.push({ id: def.id, name: def.name, rarity: def.rarity, emoji: def.emoji, isNew })
  }
  summary.sort((a, b) => RANK[b.rarity] - RANK[a.rarity])
  return { pets: newPets, summary }
}
```

- [ ] **Step 4: รันเทสให้ผ่าน**

Run: `node --test src/utils/gachaMerge.test.js`
Expected: PASS (4 tests)

- [ ] **Step 5: commit**

```bash
git add src/utils/gachaMerge.js src/utils/gachaMerge.test.js
git commit -m "Gacha: mergeRolls รวมผลสุ่มเข้า pets (unlock vs +copies, summary เรียง rarity)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 8: ShopView — รื้อเป็น banner เดียว + สุ่ม 1/10 + เลือกเป้า + pity + reveal

**Files:**
- Modify: `src/views/ShopView.vue` (รื้อ template + script ส่วนกาชา)
- Test: manual (`npm run build` + ลองมือใน dev)

**Interfaces:**
- Consumes: `rollMany`, `mergeRolls`, `PULL_COST`, `TEN_PULL_COST`, `GACHA_RATES`, `rarityPool` จาก `utils/gacha.js`+`utils/gachaMerge.js` · `PETS`, `RARITY` จาก `data/index.js` · `auth.patchUser(optimistic, server)`
- เขียน user doc: `pets`, `gachaPity`, `gachaGuaranteed`, `gachaTarget`, `dailyQuest`, `coins`/`totalSpent` (ซื้อด้วยเหรียญ) หรือ `freeGachaTickets` (ใช้ตั๋ว)

- [ ] **Step 1: เขียน `<script setup>` ใหม่**

แทนที่ `<script setup>` ทั้งบล็อกใน `src/views/ShopView.vue` ด้วย:
```js
import { computed, ref } from 'vue'
import Emoji from '../components/shared/Emoji.vue'
import HelpButton from '../components/help/HelpButton.vue'
import { increment } from 'firebase/firestore'
import { useAuthStore } from '../stores/auth.js'
import { useToast } from '../composables/useToast.js'
import { PETS, RARITY } from '../data/index.js'
import { residenceShopDiscount } from '../data/residence.js'
import { bumpDailyQuest } from '../utils/dailyQuest.js'
import { rollMany, GACHA_RATES, PULL_COST, TEN_PULL_COST, HARD_PITY } from '../utils/gacha.js'
import { mergeRolls } from '../utils/gachaMerge.js'

const authStore = useAuthStore()
const { toast } = useToast()

// ร้านค้ายังไม่เปิดให้นักศึกษา — flip เป็น true เมื่อพร้อม (admin เห็นร้านปกติเสมอเพื่อทดสอบ)
const SHOP_OPEN = false
const shopOpen = computed(() => SHOP_OPEN || authStore.isAdmin)

const coins   = computed(() => authStore.userData?.coins || 0)
const pets    = computed(() => authStore.userData?.pets || [])
const level   = computed(() => authStore.userData?.residence?.level || 1)
const discount = computed(() => residenceShopDiscount(level.value))
const tickets = computed(() => authStore.userData?.freeGachaTickets || 0)
const pity    = computed(() => authStore.userData?.gachaPity || 0)
const target  = computed(() => authStore.userData?.gachaTarget || null)
const guaranteed = computed(() => !!authStore.userData?.gachaGuaranteed)

const legendaries = PETS.filter((p) => p.rarity === 'legendary')
const targetPet = computed(() => legendaries.find((p) => p.id === target.value) || null)
const pityLeft  = computed(() => Math.max(0, HARD_PITY - pity.value))

const reveal = ref(null)       // { summary, multi }
const pickerOpen = ref(false)
const buying = ref(false)

const price = (base) => Math.round(base * (1 - discount.value / 100))
const rarityColor = (r) => RARITY[r]?.color || '#94a3b8'
const rarityLabel = (r) => RARITY[r]?.label || r
const ownedLegendaryIds = () => pets.value.filter((p) => p.rarity === 'legendary').map((p) => p.id)

const rateList = ['legendary', 'epic', 'rare', 'common'].map((k) => ({ key: k, pct: GACHA_RATES[k], color: RARITY[k]?.color, label: RARITY[k]?.label }))

async function pull(n, useFreeTicket = false) {
  if (buying.value) return
  const rolls = useFreeTicket ? 1 : n
  const cost = useFreeTicket ? 0 : price(n === 1 ? PULL_COST : TEN_PULL_COST)
  if (useFreeTicket) { if (tickets.value < 1) return }
  else if (coins.value < cost) { toast(`เหรียญไม่พอ! ต้องการ ${cost.toLocaleString()}`, 'error'); return }

  const state = { pity: pity.value, target: target.value, guaranteed: guaranteed.value, ownedLegendaryIds: ownedLegendaryIds() }
  const { results, nextState } = rollMany(rolls, state, PETS)
  const { pets: newPets, summary } = mergeRolls(pets.value, results, PETS)
  const today = new Date().toISOString().slice(0, 10)
  const dq = bumpDailyQuest(authStore.userData?.dailyQuest, 'gacha', today, 1)

  buying.value = true
  const optimistic = {
    pets: newPets, dailyQuest: dq, gachaPity: nextState.pity, gachaGuaranteed: nextState.guaranteed,
    ...(useFreeTicket ? { freeGachaTickets: tickets.value - 1 } : { coins: coins.value - cost, totalSpent: (authStore.userData?.totalSpent || 0) + cost }),
  }
  const server = {
    pets: newPets, dailyQuest: dq, gachaPity: nextState.pity, gachaGuaranteed: nextState.guaranteed,
    ...(useFreeTicket ? { freeGachaTickets: increment(-1) } : { coins: increment(-cost), totalSpent: increment(cost) }),
  }
  const ok = await authStore.patchUser(optimistic, server)
  buying.value = false
  if (ok) reveal.value = { summary, multi: rolls > 1 }
  else toast('สุ่มไม่สำเร็จ', 'error')
}

async function chooseTarget(id) {
  const next = target.value === id ? null : id
  await authStore.patchUser({ gachaTarget: next }, { gachaTarget: next })
  pickerOpen.value = false
}
</script>
```

- [ ] **Step 2: เขียน template ใหม่ (ส่วนร้านเปิด)**

ในบล็อก `<template v-else-if="authStore.isLoggedIn">` แทนที่ตั้งแต่ `<div class="shop-storage">` ถึงก่อน `<div v-else class="shop-login">` ด้วย:
```html
      <div class="shop-storage">
        <Emoji char="🐾" /> สัตว์เลี้ยง {{ pets.length }}/{{ PETS.length }} ชนิด
        <span v-if="discount" class="shop-disc">· ส่วนลดร้าน −{{ discount }}%</span>
      </div>

      <!-- banner -->
      <div class="banner">
        <div class="banner-top">
          <div class="banner-title"><Emoji char="🎰" /> อัญเชิญสัตว์เลี้ยง</div>
          <div class="banner-pity">การันตี legendary อีก {{ pityLeft }} ครั้ง</div>
        </div>

        <button class="target-row" @click="pickerOpen = true">
          <template v-if="targetPet">
            <span class="target-emoji"><Emoji :char="targetPet.emoji" /></span>
            <span class="target-text">เป้าหมาย: <b>{{ targetPet.name }}</b></span>
          </template>
          <span v-else class="target-text">เลือกเป้าหมาย legendary (ยังไม่เลือก = ตัวที่ยังไม่มีก่อน)</span>
          <span class="target-edit">เปลี่ยน</span>
        </button>
        <div v-if="guaranteed && targetPet" class="banner-guar"><Emoji char="✅" /> รอบหน้าได้ {{ targetPet.name }} แน่นอน</div>

        <div class="banner-rates">
          <span v-for="r in rateList" :key="r.key" :style="{ color: r.color }">{{ r.label }} {{ r.pct }}%</span>
        </div>

        <button v-if="tickets > 0" class="ticket-btn" :disabled="buying" @click="pull(1, true)">
          <Emoji char="🎟️" /> ใช้ตั๋วฟรี สุ่ม 1 (×{{ tickets }})
        </button>
        <div class="pull-row">
          <button class="pull-btn" :class="{ ok: coins >= price(PULL_COST) }" :disabled="buying" @click="pull(1)">
            สุ่ม 1<br><small>{{ price(PULL_COST).toLocaleString() }}<Emoji char="🪙" /></small>
          </button>
          <button class="pull-btn" :class="{ ok: coins >= price(TEN_PULL_COST) }" :disabled="buying" @click="pull(10)">
            สุ่ม 10<br><small>{{ price(TEN_PULL_COST).toLocaleString() }}<Emoji char="🪙" /></small>
          </button>
        </div>
      </div>
      <div class="shop-note">สุ่ม 10 ได้ 11 ตัว · ตัวซ้ำ → +1 copy (ใช้อัพเกรด)</div>
```

- [ ] **Step 3: เพิ่ม target picker + reveal modal (Teleport)**

แทนที่บล็อก reveal modal เดิม (`<div v-if="reveal" ...>`) ด้วย:
```html
    <!-- target picker -->
    <Teleport to="body">
      <div v-if="pickerOpen" class="ov" @click.self="pickerOpen = false">
        <div class="picker">
          <div class="picker-head">เลือกเป้าหมาย legendary</div>
          <div class="picker-grid">
            <button v-for="p in legendaries" :key="p.id" class="picker-cell" :class="{ on: p.id === target }" @click="chooseTarget(p.id)">
              <span class="picker-emoji"><Emoji :char="p.emoji" /></span>
              <span class="picker-name">{{ p.name }}</span>
              <span v-if="pets.find((x) => x.id === p.id)" class="picker-have">มีแล้ว</span>
            </button>
          </div>
          <button class="picker-clear" @click="chooseTarget(target)">{{ target ? 'ล้างเป้าหมาย' : 'ปิด' }}</button>
        </div>
      </div>
    </Teleport>

    <!-- reveal -->
    <Teleport to="body">
      <div v-if="reveal" class="ov" @click.self="reveal = null">
        <div class="rv-box">
          <div class="rv-label">คุณได้รับ!</div>
          <div class="rv-grid" :class="{ single: !reveal.multi }">
            <div v-for="(s, i) in reveal.summary" :key="i" class="rv-cell" :style="{ borderColor: rarityColor(s.rarity) }">
              <span class="rv-emoji"><Emoji :char="s.emoji" /></span>
              <span class="rv-nm">{{ s.name }}</span>
              <span class="rv-badge" :style="{ background: rarityColor(s.rarity) }">{{ s.isNew ? 'ใหม่!' : '+1' }}</span>
            </div>
          </div>
          <button class="rv-ok" @click="reveal = null">เยี่ยม!</button>
        </div>
      </div>
    </Teleport>
```

- [ ] **Step 4: เพิ่ม/ปรับ `<style scoped>`**

เพิ่ม CSS ต่อท้าย `<style scoped>` (ลบคลาสไข่เก่า `.egg-list/.egg-card/.egg-emoji/.egg-info/.egg-name/.egg-desc/.egg-rates/.egg-buy` ที่ไม่ใช้แล้วได้):
```css
.banner { background: #fff; border: 2px solid var(--ink); border-radius: 16px; padding: 14px; box-shadow: var(--pop); }
.banner-top { display: flex; justify-content: space-between; align-items: baseline; gap: 8px; }
.banner-title { font-weight: 800; font-size: .95rem; }
.banner-pity { font-size: .62rem; color: #b45309; font-weight: 700; }
.target-row { display: flex; align-items: center; gap: 8px; width: 100%; margin-top: 10px; border: 2px dashed var(--ink); border-radius: 11px; padding: 8px 10px; background: var(--primary-light); font-family: inherit; font-size: .72rem; cursor: pointer; text-align: left; }
.target-emoji { font-size: 1.4rem; }
.target-text { flex: 1; min-width: 0; }
.target-edit { font-weight: 800; color: var(--primary); font-size: .66rem; }
.banner-guar { margin-top: 6px; font-size: .66rem; font-weight: 700; color: #059669; }
.banner-rates { display: flex; flex-wrap: wrap; gap: 8px; margin: 10px 0; font-size: .6rem; font-weight: 700; }
.ticket-btn { width: 100%; margin-bottom: 8px; border: 2px solid var(--ink); border-radius: 11px; padding: 10px; font-family: inherit; font-weight: 800; color: var(--ink); background: var(--gold); box-shadow: var(--pop); cursor: pointer; }
.ticket-btn:disabled { opacity: .5; }
.pull-row { display: flex; gap: 8px; }
.pull-btn { flex: 1; border: 2px solid var(--ink); border-radius: 11px; padding: 10px; font-family: inherit; font-weight: 800; font-size: .85rem; color: #fff; background: #c9c2d4; cursor: pointer; transition: transform .12s, box-shadow .12s; }
.pull-btn small { font-size: .66rem; font-weight: 700; }
.pull-btn.ok { background: var(--primary); box-shadow: var(--pop); }
.pull-btn.ok:active:not(:disabled) { transform: translate(2px,2px); box-shadow: 0 0 0 var(--ink); }
.pull-btn:disabled { opacity: .6; }
.ov { position: fixed; inset: 0; z-index: 400; background: rgba(0,0,0,.55); display: flex; align-items: center; justify-content: center; padding: 20px; }
.picker { background: #fff; border: 2px solid var(--ink); border-radius: 18px; box-shadow: var(--pop-lg); padding: 18px; width: 100%; max-width: 360px; max-height: 80vh; overflow-y: auto; }
.picker-head { font-weight: 800; margin-bottom: 12px; text-align: center; }
.picker-grid { display: grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap: 8px; }
.picker-cell { display: flex; flex-direction: column; align-items: center; gap: 2px; border: 2px solid var(--ink); border-radius: 11px; padding: 8px 4px; background: #fff; cursor: pointer; font-family: inherit; }
.picker-cell.on { background: var(--gold); }
.picker-emoji { font-size: 1.6rem; }
.picker-name { font-size: .58rem; font-weight: 700; }
.picker-have { font-size: .5rem; color: #059669; font-weight: 800; }
.picker-clear { width: 100%; margin-top: 12px; border: 2px solid var(--ink); border-radius: 11px; padding: 9px; font-family: inherit; font-weight: 800; background: #fff; cursor: pointer; }
.rv-box { background: #fff; border: 2px solid var(--ink); border-radius: 22px; box-shadow: var(--pop-lg); padding: 22px; text-align: center; max-width: 340px; width: 100%; }
.rv-label { font-size: .8rem; color: rgba(0,0,0,.5); margin-bottom: 10px; }
.rv-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
.rv-grid.single { grid-template-columns: 1fr; }
.rv-cell { position: relative; border: 2px solid var(--ink); border-radius: 11px; padding: 8px 2px; display: flex; flex-direction: column; align-items: center; gap: 2px; }
.rv-grid.single .rv-emoji { font-size: 3.4rem; }
.rv-emoji { font-size: 1.7rem; }
.rv-nm { font-size: .52rem; font-weight: 700; }
.rv-grid.single .rv-nm { font-size: .9rem; }
.rv-badge { color: #fff; font-size: .48rem; font-weight: 800; padding: 1px 5px; border-radius: 999px; }
.rv-ok { display: block; width: 100%; margin-top: 16px; border: 2px solid var(--ink); border-radius: 12px; padding: 11px; font-family: inherit; font-weight: 800; color: #fff; background: var(--primary); box-shadow: var(--pop); cursor: pointer; }
```

- [ ] **Step 5: build + ลองมือ**

Run: `npm run build`
Expected: build ผ่าน ไม่มี error import

ลองมือใน dev (`npm run dev`, login admin เพราะ `shopOpen` bypass): กดสุ่ม 1 / สุ่ม 10 (เห็น grid 11 ตัว) / เลือกเป้า → ปั่นจน lose เห็นธงการันตี / pity ลดลงทุกครั้ง / ตัวซ้ำขึ้น "+1"

- [ ] **Step 6: commit**

```bash
git add src/views/ShopView.vue
git commit -m "Shop: รื้อกาชาเป็น banner เดียว + สุ่ม 1/10 + เลือกเป้า 50/50 + pity + reveal grid

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 9: PetDetailModal — ปรับข้อความอัพเกรด 1 copy

**Files:**
- Modify: `src/components/pets/PetDetailModal.vue` (ส่วน evolve note)
- Test: manual (`npm run build`)

**Interfaces:**
- Consumes: `gradeUpCost(pet)` (Task 3 คืน `copies:1` แล้ว) — UI อ่านค่าจาก `upCost.copies` อยู่แล้ว ไม่ต้องแก้ logic

- [ ] **Step 1: ตรวจว่า UI อ่าน upCost.copies แบบ dynamic**

เปิด `src/components/pets/PetDetailModal.vue` ดูบรรทัด evolve note (`ใช้ {{ upCost.copies }} copies + ...`) — ใช้ค่า dynamic อยู่แล้ว Task 3 ทำให้แสดง "1 copies" อัตโนมัติ **ไม่ต้องแก้โค้ด** ถ้าข้อความถูกต้อง

- [ ] **Step 2: build + ลองมือ**

Run: `npm run build`
Expected: ผ่าน · เปิด modal เพ็ทที่ยังไม่ max → เห็น "ใช้ 1 copies + N เหรียญ"

- [ ] **Step 3: commit (เฉพาะถ้ามีการแก้)**

ถ้าไม่มีการแก้ไฟล์ ข้าม commit นี้ (Task 3 ครอบคลุมแล้ว) · ถ้าแก้ถ้อยคำ:
```bash
git add src/components/pets/PetDetailModal.vue
git commit -m "Pet: ปรับถ้อยคำอัพเกรดให้ตรง 1 copy/ขั้น

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 10: เก็บกวาด — ลบ egg API ใน shop.js + field refine + guide

**Files:**
- Delete: `src/data/shop.js`
- Modify: `src/data/guide.js:29` (ข้อความ "ตีบวก (refine)")
- Test: manual (`npm run build` + grep)

**Interfaces:**
- ก่อนทำ task นี้: ShopView (Task 8) **ไม่ import จาก `data/shop.js` แล้ว** (ย้ายไป gacha.js)
- ⚠️ อย่าแตะ `EGG_TYPES` ใน `data/index.js` (คนละตัว, ใช้โดย `data/pets.js`)

- [ ] **Step 1: ยืนยันว่าไม่มีใคร import shop.js แล้ว**

Run: `node --test src/utils/gacha.test.js src/utils/gachaMerge.test.js src/utils/petGrade.test.js src/utils/petUtils.test.js src/data/userSchema.test.js`
Expected: PASS ทั้งหมด

ตรวจ import ที่เหลือของ shop.js (ควรไม่เหลือหลัง Task 8):
Run: `grep -rn "data/shop" src/ ; grep -rn "rollPetFromEgg\|DAILY_QUEST_TICKET_EGG" src/`
Expected: ไม่มีผลลัพธ์ (ถ้ายังมี ต้องแก้ caller ก่อน)

- [ ] **Step 2: ลบไฟล์ shop.js**

```bash
git rm src/data/shop.js
```

- [ ] **Step 3: แก้ข้อความ guide**

ใน `src/data/guide.js:29` แก้:
```js
      'วิวัฒน์ (เกรด) ทำให้เพ็ทแข็งแกร่งและมีค่ามากขึ้น',
```
(ลบ "และตีบวก (refine)")

- [ ] **Step 4: build ยืนยันไม่พัง**

Run: `npm run build`
Expected: build ผ่าน ไม่มี error "Cannot resolve '../data/shop.js'"

- [ ] **Step 5: commit**

```bash
git add src/data/guide.js
git commit -m "Cleanup: ลบ egg API ใน data/shop.js + ข้อความ refine ใน guide (ตายแล้วหลัง rework กาชา)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## หมายเหตุปิดงาน (ทำหลังครบทุก task)
- รัน build รอบสุดท้าย + ลองมือครบ flow (สุ่ม/เลือกเป้า/อัพเกรด 1 copy/รายได้เพ็ทใหม่)
- **ไม่ push / ไม่เปิด Shop** ใน Phase B (รอ Phase C+D เสร็จก่อนเปิด `SHOP_OPEN=true`) — push เมื่อ user สั่ง
- copies ระดับล่างจะเริ่มล้น (ยังไม่มีทางระบายจน Phase D) — เป็นไปตามดีไซน์
