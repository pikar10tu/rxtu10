# Expedition (ส่งผจญภัย) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** ระบบ idle/สะสม "ส่งผจญภัย" — ส่งเพ็ท 3 ตัว (นอกทีมต่อสู้) ไปมิชชันจับเวลา → กดเก็บได้เหรียญ+ลุ้นตั๋วกาชา สเกลตามคุณภาพสาย×เวลา×ธาตุ · เปิดเลย (ไม่ gated)

**Architecture:** pure data (`data/expeditions.js`) + pure logic (`utils/expedition.js`) + เทส → schema field `user.expedition` (single party) → composable `useExpedition` → หน้า `ExpeditionView`. รางวัลคิดตอนกดเก็บด้วย deterministic seed. สาย = **snapshot สเตตัสเพ็ทตอนส่ง** (reuse `resolveBattleTeam`) → claim ไม่พึ่งเพ็ทปัจจุบัน. lock เฉพาะ TeamPicker (กันเข้าทีมต่อสู้). จัดหัวข้อ Play ใหม่ (Option A).

**Tech Stack:** Vue 3 + Pinia + Vite + Firebase (Firestore) · node:test สำหรับ pure utils

## Global Constraints

- spec อ้างอิง: `docs/superpowers/specs/2026-06-27-expedition-design.md`
- Firestore: ไม่มี collection ใหม่, ไม่มี cross-user write, ไม่แก้/deploy rules
- เขียน user doc ผ่าน `auth.patchUser(optimistic, server)` เท่านั้น (doc ตัวเอง)
- เทส pure util รันด้วย `node --test src/utils/<x>.test.js` · ตรวจรวม `npm run build`
- ค่าคงที่เกมทั้งหมด (มิชชัน/ระยะเวลา/สูตร) อยู่ที่ `data/expeditions.js` ที่เดียว — **draft pin, ต้อง number pass + sim ก่อนเปิด** (ไม่อยู่ในแผนนี้)
- 1 สายต่อครั้ง · 3 ตัว/สาย · ส่งได้เฉพาะเพ็ทที่ **ไม่อยู่ใน `activePets`** · ระหว่างผจญภัยเอาเข้าทีมไม่ได้
- รางวัล v1 = `coins` + `gachaTicket` (`freeGachaTickets`) — reward table แบบ array รองรับชนิดใหม่อนาคต
- element values = `'fist'|'scissors'|'paper'` (ตามทั้งแอป)
- commit รูปแบบ `Area: อะไร (ทำไม)` ลงท้าย `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`
- คอมเมนต์/commit ไทยปนอังกฤษ · single-file component + scoped style · ธีม indigo

---

## File Structure

- Create `src/data/expeditions.js` (+`.test.js`) — มิชชัน + ระยะเวลา + ค่าคงที่สูตร + reward type registry
- Create `src/utils/expedition.js` (+`.test.js`) — `partyPower` + `elementMatches` + `expeditionSeed` + `resolveRewards` + `expeditionState`
- Modify `src/data/userSchema.js` — เพิ่ม `expedition: null` + normalize
- Create `src/composables/useExpedition.js` — orchestrate (state/eligible/send/claim)
- Create `src/views/ExpeditionView.vue` — หน้าส่งผจญภัย (idle/active/ready)
- Modify `src/router/index.js` — route `/expedition`
- Modify `src/views/PlayView.vue` — จัดหัวข้อใหม่ Option A + การ์ดส่งผจญภัย
- Modify `src/components/battle/TeamPicker.vue` — กันเพ็ทที่กำลังผจญภัยเข้าทีม
- Create `src/components/home/ExpeditionCard.vue` + Modify `src/views/HomeView.vue` — การ์ดเตือนสถานะ

---

## Task 1: data/expeditions.js (ค่าคงที่ + มิชชัน + reward table)

**Files:**
- Create: `src/data/expeditions.js`
- Test: `src/data/expeditions.test.js`

**Interfaces:**
- Produces:
  - `DURATIONS: Array<{id:'short'|'medium'|'long', label, hours, baseCoins, coinCap, ticketChance}>`
  - `MISSIONS: Array<{id, name, element, emoji, flavor}>`
  - `RARITY_WEIGHT: {common,rare,epic,legendary}`, `GRADE_K`, `POWER_K`, `ELEMENT_K`, `TICKET_POWER_K`, `TICKET_EL_K`, `TICKET_CHANCE_MAX`
  - `REWARD_TYPES: { coins:{label,emoji,field}, gachaTicket:{label,emoji,field} }`
  - `EXPEDITION_PARTY_SIZE = 3`

- [ ] **Step 1: Write the failing test**

```js
// src/data/expeditions.test.js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  DURATIONS, MISSIONS, RARITY_WEIGHT, REWARD_TYPES, EXPEDITION_PARTY_SIZE,
} from './expeditions.js'

test('DURATIONS: 3 ระดับ ชั่วโมงเรียงเพิ่ม', () => {
  assert.equal(DURATIONS.length, 3)
  const hrs = DURATIONS.map(d => d.hours)
  assert.deepEqual(hrs, [...hrs].sort((a, b) => a - b))
  DURATIONS.forEach(d => { assert.ok(d.baseCoins > 0 && d.coinCap >= d.baseCoins && d.ticketChance >= 0) })
})
test('MISSIONS: ครอบทั้ง 3 ธาตุ + ฟิลด์ครบ', () => {
  const els = new Set(MISSIONS.map(m => m.element))
  assert.deepEqual([...els].sort(), ['fist', 'paper', 'scissors'])
  MISSIONS.forEach(m => { assert.ok(m.id && m.name && m.emoji) })
})
test('REWARD_TYPES: map ไป field จริงใน user doc', () => {
  assert.equal(REWARD_TYPES.coins.field, 'coins')
  assert.equal(REWARD_TYPES.gachaTicket.field, 'freeGachaTickets')
})
test('RARITY_WEIGHT: legendary > epic > rare > common', () => {
  assert.ok(RARITY_WEIGHT.legendary > RARITY_WEIGHT.epic)
  assert.ok(RARITY_WEIGHT.epic > RARITY_WEIGHT.rare)
  assert.ok(RARITY_WEIGHT.rare > RARITY_WEIGHT.common)
})
test('EXPEDITION_PARTY_SIZE = 3', () => { assert.equal(EXPEDITION_PARTY_SIZE, 3) })
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test src/data/expeditions.test.js`
Expected: FAIL (Cannot find module './expeditions.js')

- [ ] **Step 3: Write the data module**

```js
// src/data/expeditions.js
// Expedition (ส่งผจญภัย) — ค่าคงที่เกม + มิชชัน + reward table (ปรับเลขที่นี่ที่เดียว)
// ⚠️ ทั้งหมด draft pin — ต้อง number pass + sim ก่อนเปิดจริง (spec §8)

// ระยะเวลา 3 ระดับ (ผู้เล่นเลือก) · hours = ระยะเวลาจริง · ยาว = คุ้มกว่าต่อรอบ แต่รอนาน
export const DURATIONS = [
  { id: 'short',  label: 'สั้น',  hours: 1, baseCoins: 120,  coinCap: 400,  ticketChance: 0.04 },
  { id: 'medium', label: 'กลาง', hours: 4, baseCoins: 450,  coinCap: 1500, ticketChance: 0.12 },
  { id: 'long',   label: 'ยาว',  hours: 8, baseCoins: 1000, coinCap: 3500, ticketChance: 0.25 },
]

// มิชชันคงที่ — ครอบ 3 ธาตุ เพื่อให้เลือก element-match ได้เสมอ · ส่งตัวธาตุตรง = โบนัส
export const MISSIONS = [
  { id: 'forest', name: 'ป่าลึกลับ',      element: 'fist',     emoji: '🌲', flavor: 'บุกป่าหาสมุนไพรหายาก' },
  { id: 'ruins',  name: 'ซากปรักหักพัง', element: 'scissors', emoji: '🏚️', flavor: 'ค้นซากเมืองเก่าหาของมีค่า' },
  { id: 'peak',   name: 'ยอดเขาเมฆา',    element: 'paper',    emoji: '⛰️', flavor: 'ปีนเขาสูงเก็บผลึกพลัง' },
]

// คุณภาพเพ็ท → น้ำหนัก (rarity) · เกรด I-V (เก็บเป็น 0..5) เพิ่มทีละ GRADE_K
export const RARITY_WEIGHT = { common: 1, rare: 2, epic: 4, legendary: 7 }
export const GRADE_K = 0.15        // +15%/เกรด ต่อน้ำหนัก rarity
export const POWER_K = 0.04        // partyPower → ตัวคูณเหรียญ
export const ELEMENT_K = 0.15      // ต่อ 1 ตัวที่ธาตุตรง → +15%
export const TICKET_POWER_K = 0.008 // partyPower → +โอกาสตั๋ว
export const TICKET_EL_K = 0.05     // โบนัสธาตุ → +โอกาสตั๋ว
export const TICKET_CHANCE_MAX = 0.9

// reward table — extensible: เพิ่มชนิดใหม่ = เพิ่ม entry (field = field ใน user doc ที่จะ increment)
export const REWARD_TYPES = {
  coins:       { label: 'เหรียญ',   emoji: '🪙', field: 'coins' },
  gachaTicket: { label: 'ตั๋วกาชา', emoji: '🎟️', field: 'freeGachaTickets' },
}

export const EXPEDITION_PARTY_SIZE = 3
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test src/data/expeditions.test.js`
Expected: PASS (5 tests)

- [ ] **Step 5: Commit**

```bash
git add src/data/expeditions.js src/data/expeditions.test.js
git commit -m "Expedition: ค่าคงที่เกม + มิชชัน + reward table"
```

---

## Task 2: utils/expedition.js (pure logic)

**Files:**
- Create: `src/utils/expedition.js`
- Test: `src/utils/expedition.test.js`

**Interfaces:**
- Consumes: ค่าคงที่จาก `../data/expeditions.js`
- Produces:
  - `partyPower(party: Array<{rarity,grade}>): number`
  - `elementMatches(party: Array<{element}>, missionElement: string): number`
  - `expeditionSeed(exp: {petIds,startedAt,missionId,durationId}): number`
  - `resolveRewards(party, mission:{element}, duration:{baseCoins,coinCap,ticketChance}, seed:number): Array<{type:'coins'|'gachaTicket', amount:number}>`
  - `expeditionState(exp:object|null, now?:number): 'idle'|'active'|'ready'`

party shape = battle unit `{id, rarity, element, grade}` (จาก `resolveBattleTeam`)

- [ ] **Step 1: Write the failing test**

```js
// src/utils/expedition.test.js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  partyPower, elementMatches, expeditionSeed, resolveRewards, expeditionState,
} from './expedition.js'
import { DURATIONS, MISSIONS } from '../data/expeditions.js'

const dur = (id) => DURATIONS.find(d => d.id === id)
const SHORT = dur('short'), LONG = dur('long')
const MIS_FIST = MISSIONS.find(m => m.element === 'fist')

const lowParty = [
  { id: 'a', rarity: 'common', element: 'fist', grade: 0 },
  { id: 'b', rarity: 'common', element: 'scissors', grade: 0 },
  { id: 'c', rarity: 'common', element: 'paper', grade: 0 },
]
const highParty = [
  { id: 'a', rarity: 'legendary', element: 'fist', grade: 5 },
  { id: 'b', rarity: 'legendary', element: 'fist', grade: 5 },
  { id: 'c', rarity: 'legendary', element: 'fist', grade: 5 },
]

test('partyPower: สายเก่ง > สายอ่อน', () => {
  assert.ok(partyPower(highParty) > partyPower(lowParty))
})
test('partyPower: common grade0 = น้ำหนัก 1 ต่อตัว', () => {
  assert.equal(partyPower(lowParty), 3)
})
test('elementMatches: นับตัวธาตุตรง', () => {
  assert.equal(elementMatches(highParty, 'fist'), 3)
  assert.equal(elementMatches(lowParty, 'fist'), 1)
})
test('expeditionSeed: deterministic (input เดิม → seed เดิม) + ต่าง input → ต่าง seed', () => {
  const a = { petIds: ['a', 'b', 'c'], startedAt: 1000, missionId: 'forest', durationId: 'short' }
  assert.equal(expeditionSeed(a), expeditionSeed({ ...a }))
  assert.notEqual(expeditionSeed(a), expeditionSeed({ ...a, startedAt: 1001 }))
})
test('resolveRewards: ได้เหรียญ > 0 และ clamp ไม่เกิน coinCap', () => {
  const r = resolveRewards(highParty, MIS_FIST, LONG, 12345)
  const coin = r.find(x => x.type === 'coins')
  assert.ok(coin && coin.amount > 0)
  assert.ok(coin.amount <= LONG.coinCap)
})
test('resolveRewards: สายเก่ง+ธาตุตรง ได้เหรียญมากกว่าสายอ่อน (มิชชัน/เวลา/seed เดียวกัน)', () => {
  const hi = resolveRewards(highParty, MIS_FIST, LONG, 7).find(x => x.type === 'coins').amount
  const lo = resolveRewards(lowParty, MIS_FIST, LONG, 7).find(x => x.type === 'coins').amount
  assert.ok(hi > lo)
})
test('resolveRewards: deterministic (party/mission/duration/seed เดิม → ผลเดิม)', () => {
  assert.deepEqual(
    resolveRewards(highParty, MIS_FIST, LONG, 999),
    resolveRewards(highParty, MIS_FIST, LONG, 999),
  )
})
test('expeditionState: null → idle', () => {
  assert.equal(expeditionState(null, 1000), 'idle')
})
test('expeditionState: endsAt อนาคต → active, อดีต → ready', () => {
  assert.equal(expeditionState({ endsAt: 5000 }, 1000), 'active')
  assert.equal(expeditionState({ endsAt: 5000 }, 9000), 'ready')
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test src/utils/expedition.test.js`
Expected: FAIL (Cannot find module './expedition.js')

- [ ] **Step 3: Write minimal implementation**

```js
// src/utils/expedition.js
// Expedition — pure logic: คุณภาพสาย + รางวัล (deterministic) + สถานะ
// party = [{id, rarity, element, grade}] (สแนปช็อตตอนส่ง — รูปเดียวกับ battle unit จาก resolveBattleTeam)
import {
  RARITY_WEIGHT, GRADE_K, POWER_K, ELEMENT_K,
  TICKET_POWER_K, TICKET_EL_K, TICKET_CHANCE_MAX,
} from '../data/expeditions.js'

/** น้ำหนักคุณภาพรวมของสาย (rarity × เกรด) */
export function partyPower(party) {
  return (party || []).reduce((sum, p) => {
    const w = RARITY_WEIGHT[p?.rarity] || RARITY_WEIGHT.common
    return sum + w * (1 + (p?.grade || 0) * GRADE_K)
  }, 0)
}

/** จำนวนตัวที่ธาตุตรงมิชชัน (0..3) */
export function elementMatches(party, missionElement) {
  return (party || []).filter(p => p?.element === missionElement).length
}

/** seed คงที่ของรอบ (FNV-1a จาก petIds+startedAt+mission+duration) — กัน reroll */
export function expeditionSeed(exp) {
  const s = `${(exp?.petIds || []).join(',')}|${exp?.startedAt || 0}|${exp?.missionId || ''}|${exp?.durationId || ''}`
  let h = 2166136261
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) }
  return h >>> 0
}

// mulberry32 (แนวเดียว utils/pvpBot.js)
function rng(seed) {
  let a = seed >>> 0
  return () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** คำนวณรางวัล (คิดตอนกดเก็บ) → array ของ {type, amount} · extensible */
export function resolveRewards(party, mission, duration, seed) {
  const power = partyPower(party)
  const elBonus = elementMatches(party, mission?.element) * ELEMENT_K
  const rewards = []
  // เหรียญ — สเกลตามคุณภาพ×ธาตุ clamp ≤ cap
  const coins = Math.min(
    duration.coinCap,
    Math.round(duration.baseCoins * (1 + power * POWER_K) * (1 + elBonus)),
  )
  if (coins > 0) rewards.push({ type: 'coins', amount: coins })
  // ตั๋วกาชา — ลุ้น 1 ครั้งด้วย seed
  const chance = Math.min(
    TICKET_CHANCE_MAX,
    duration.ticketChance + power * TICKET_POWER_K + elBonus * TICKET_EL_K,
  )
  if (rng(seed)() < chance) rewards.push({ type: 'gachaTicket', amount: 1 })
  return rewards
}

/** สถานะ expedition: 'idle' (ไม่มี) | 'active' (กำลังไป) | 'ready' (กลับแล้วรอเก็บ) */
export function expeditionState(exp, now = Date.now()) {
  if (!exp) return 'idle'
  return now >= (exp.endsAt || 0) ? 'ready' : 'active'
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test src/utils/expedition.test.js`
Expected: PASS (9 tests)

- [ ] **Step 5: Commit**

```bash
git add src/utils/expedition.js src/utils/expedition.test.js
git commit -m "Expedition: util คุณภาพสาย + รางวัล deterministic + สถานะ"
```

---

## Task 3: userSchema — expedition field

**Files:**
- Modify: `src/data/userSchema.js` (USER_DEFAULTS + normalizeUserData)
- Test: `src/data/userSchema.test.js` (เพิ่มเทส)

**Interfaces:**
- Produces: user doc มี `expedition: null` (default) · normalize ให้เป็น object หรือ null เสมอ

- [ ] **Step 1: Write the failing test** (เพิ่มท้าย `src/data/userSchema.test.js` — ใช้ `normalizeUserData` ที่ import อยู่แล้ว)

```js
test('normalizeUserData: expedition default = null', () => {
  assert.equal(normalizeUserData({}).expedition, null)
})
test('normalizeUserData: expedition object คงไว้', () => {
  const exp = { petIds: ['a', 'b', 'c'], missionId: 'forest', durationId: 'short', startedAt: 1, endsAt: 2, party: [] }
  assert.deepEqual(normalizeUserData({ expedition: exp }).expedition, exp)
})
test('normalizeUserData: expedition ชนิดผิด (array/number) → null', () => {
  assert.equal(normalizeUserData({ expedition: [] }).expedition, null)
  assert.equal(normalizeUserData({ expedition: 5 }).expedition, null)
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test src/data/userSchema.test.js`
Expected: FAIL (expedition undefined / array not coerced to null)

- [ ] **Step 3: เพิ่ม default + normalize**

ใน `src/data/userSchema.js`: เพิ่มใน `USER_DEFAULTS` ใต้บล็อก PvP (ใต้บรรทัด `pvpAttacksUsed: 0,`):
```js
  // ── Expedition (ส่งผจญภัย) ──
  expedition: null,   // { petIds:[3], party:[{id,rarity,element,grade}], missionId, durationId, startedAt, endsAt } | null (1 สายต่อครั้ง)
```
ใน `normalizeUserData` ใต้บรรทัด `d.pvp = { ...USER_DEFAULTS.pvp, ...(isObj(data.pvp) ? data.pvp : {}) }` เพิ่ม:
```js
  d.expedition = isObj(data.expedition) ? data.expedition : null
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test src/data/userSchema.test.js`
Expected: PASS (รวมเทสเดิมทั้งหมด)

- [ ] **Step 5: Commit**

```bash
git add src/data/userSchema.js src/data/userSchema.test.js
git commit -m "Expedition: เพิ่ม expedition field ใน userSchema + normalize"
```

---

## Task 4: useExpedition composable

**Files:**
- Create: `src/composables/useExpedition.js`

**Interfaces:**
- Consumes: `useAuthStore`, `useToast`, `resolveBattleTeam` (`../utils/petTeam.js`), `expeditionState`/`resolveRewards`/`expeditionSeed` (`../utils/expedition.js`), `MISSIONS`/`DURATIONS`/`REWARD_TYPES`/`EXPEDITION_PARTY_SIZE` (`../data/expeditions.js`), `increment` (firebase/firestore)
- Produces: `useExpedition()` → `{ exp, eligiblePets, mission, duration, send, claim }`
  - `send(petIds:string[], missionId, durationId): Promise<boolean>`
  - `claim(): Promise<Array<{type,amount}>|null>` (คืน rewards ที่ได้ หรือ null)

- [ ] **Step 1: เขียน composable**

```js
// src/composables/useExpedition.js
// Expedition orchestration — อ่าน/เขียน user.expedition ผ่าน patchUser (doc ตัวเอง)
import { computed } from 'vue'
import { increment } from 'firebase/firestore'
import { useAuthStore } from '../stores/auth.js'
import { useToast } from './useToast.js'
import { resolveBattleTeam } from '../utils/petTeam.js'
import { resolveRewards, expeditionSeed } from '../utils/expedition.js'
import { MISSIONS, DURATIONS, REWARD_TYPES, EXPEDITION_PARTY_SIZE } from '../data/expeditions.js'

export function useExpedition() {
  const auth = useAuthStore()
  const { toast } = useToast()

  const exp = computed(() => auth.userData?.expedition || null)

  // เพ็ทที่ส่งได้ = owns + ไม่อยู่ในทีมต่อสู้ (activePets) → บังคับใช้ม้านั่ง
  const eligiblePets = computed(() => {
    const team = new Set((auth.userData?.activePets || []).filter(Boolean))
    return (auth.userData?.pets || []).filter(p => p && !team.has(p.id))
  })

  const mission = (id) => MISSIONS.find(m => m.id === id) || null
  const duration = (id) => DURATIONS.find(d => d.id === id) || null

  async function send(petIds, missionId, durationId) {
    if (exp.value) { toast('มีคณะกำลังผจญภัยอยู่ รอกลับก่อนนะ', 'info'); return false }
    const dur = duration(durationId), mis = mission(missionId)
    if (!mis || !dur) { toast('เลือกมิชชัน/ระยะเวลาก่อนนะ', 'info'); return false }
    const ids = (petIds || []).filter(Boolean)
    if (ids.length !== EXPEDITION_PARTY_SIZE) { toast(`เลือกเพ็ท ${EXPEDITION_PARTY_SIZE} ตัว`, 'info'); return false }
    const team = new Set((auth.userData?.activePets || []).filter(Boolean))
    if (ids.some(id => team.has(id))) { toast('เพ็ทในทีมต่อสู้ส่งไม่ได้', 'info'); return false }
    // สแนปช็อตสเตตัสตอนส่ง → claim คำนวณได้เองโดยไม่พึ่งเพ็ทปัจจุบัน
    const party = resolveBattleTeam(ids, auth.userData?.pets)
    const startedAt = Date.now()
    const next = { petIds: ids, party, missionId, durationId, startedAt, endsAt: startedAt + dur.hours * 3600000 }
    const ok = await auth.patchUser({ expedition: next }, { expedition: next })
    if (!ok) { toast('ส่งไม่สำเร็จ ลองใหม่', 'error'); return false }
    return true
  }

  async function claim() {
    const e = exp.value
    if (!e) return null
    if (Date.now() < (e.endsAt || 0)) { toast('ยังไม่ถึงเวลากลับ', 'info'); return null }
    const rewards = resolveRewards(e.party, mission(e.missionId), duration(e.durationId), expeditionSeed(e))
    // เคลียร์ expedition + เพิ่มรางวัลตาม field (extensible)
    const optimistic = { expedition: null }
    const server = { expedition: null }
    for (const r of rewards) {
      const field = REWARD_TYPES[r.type]?.field
      if (!field) continue
      optimistic[field] = (auth.userData?.[field] || 0) + r.amount
      server[field] = increment(r.amount)
    }
    const ok = await auth.patchUser(optimistic, server)
    if (!ok) { toast('เก็บรางวัลไม่สำเร็จ ลองใหม่', 'error'); return null }
    return rewards
  }

  return { exp, eligiblePets, mission, duration, send, claim }
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: ✓ built (ไม่มี error)

- [ ] **Step 3: Commit**

```bash
git add src/composables/useExpedition.js
git commit -m "Expedition: composable useExpedition (state/eligible/send/claim)"
```

---

## Task 5: ExpeditionView + route

**Files:**
- Create: `src/views/ExpeditionView.vue`
- Modify: `src/router/index.js`

**Interfaces:**
- Consumes: `useExpedition`, `useAuthStore`, `expeditionState` (`../utils/expedition.js`), `MISSIONS`/`DURATIONS`/`REWARD_TYPES`/`EXPEDITION_PARTY_SIZE` (`../data/expeditions.js`), `ELEMENTS`/`getPetDef` (`../data/index.js`), `PetThumb`, `Emoji`

- [ ] **Step 1: สร้าง ExpeditionView**

```vue
<!-- src/views/ExpeditionView.vue -->
<template>
  <div class="tab-content">
    <div class="page-title ex-head">
      <span><Emoji char="🗺️" /> ส่งผจญภัย</span>
      <RouterLink to="/play" class="ex-back">‹ กลับ</RouterLink>
    </div>

    <template v-if="authStore.isLoggedIn">
      <!-- ── ว่าง: เลือกมิชชัน + เพ็ท + เวลา ── -->
      <template v-if="state === 'idle'">
        <div class="ex-sec">เลือกมิชชัน</div>
        <div class="ex-missions">
          <button v-for="m in MISSIONS" :key="m.id" class="ex-mis" :class="{ on: missionId === m.id }" @click="missionId = m.id">
            <span class="ex-mis-emoji"><Emoji :char="m.emoji" /></span>
            <span class="ex-mis-name">{{ m.name }}</span>
            <span class="ex-mis-el">ธาตุ <Emoji :char="elEmoji(m.element)" /></span>
          </button>
        </div>

        <div class="ex-sec">เลือกเพ็ท {{ picked.length }}/{{ PARTY_SIZE }} <span class="ex-sec-note">(นอกทีมต่อสู้)</span></div>
        <div class="ex-pool">
          <button
            v-for="p in eligiblePets" :key="p.id"
            class="ex-pet" :class="{ on: picked.includes(p.id), match: curMission && defEl(p.id) === curMission.element }"
            :disabled="!picked.includes(p.id) && picked.length >= PARTY_SIZE"
            @click="togglePet(p.id)"
          >
            <PetThumb :pet="unitOf(p)" />
            <span v-if="curMission && defEl(p.id) === curMission.element" class="ex-pet-bonus">ธาตุตรง</span>
          </button>
          <div v-if="!eligiblePets.length" class="ex-none">ไม่มีเพ็ทนอกทีม — ปลดเพ็ทออกจากทีมต่อสู้ก่อนนะ</div>
        </div>

        <div class="ex-sec">เลือกระยะเวลา</div>
        <div class="ex-durs">
          <button v-for="d in DURATIONS" :key="d.id" class="ex-dur" :class="{ on: durationId === d.id }" @click="durationId = d.id">
            <b>{{ d.label }}</b><span>{{ d.hours }} ชม.</span>
          </button>
        </div>

        <button class="ex-go" :disabled="!canSend || busy" @click="onSend">
          <Emoji char="🚀" /> ส่งผจญภัย
        </button>
      </template>

      <!-- ── กำลังไป: countdown ── -->
      <template v-else-if="state === 'active'">
        <div class="ex-card ex-active">
          <div class="ex-active-mis"><Emoji :char="curMission?.emoji || '🗺️'" /> {{ curMission?.name || 'ผจญภัย' }}</div>
          <div class="ex-party">
            <PetThumb v-for="(u, i) in exp.party" :key="i" :pet="u" />
          </div>
          <div class="ex-count"><Emoji char="⏳" /> เหลืออีก {{ remainText }}</div>
        </div>
      </template>

      <!-- ── กลับแล้ว: กดเก็บ ── -->
      <template v-else>
        <div class="ex-card ex-ready">
          <div class="ex-ready-h"><Emoji char="🎉" /> คณะกลับมาแล้ว!</div>
          <div class="ex-party">
            <PetThumb v-for="(u, i) in exp.party" :key="i" :pet="u" />
          </div>
          <button class="ex-go" :disabled="busy" @click="onClaim"><Emoji char="🎁" /> เก็บรางวัล</button>
        </div>
      </template>
    </template>
    <div v-else class="ex-login">เข้าสู่ระบบเพื่อเล่น</div>

    <!-- สรุปรางวัล -->
    <Teleport to="body">
      <div v-if="result" class="ex-ov" @click.self="result = null">
        <div class="ex-rv">
          <div class="ex-rv-h"><Emoji char="🎁" /> ได้รับรางวัล</div>
          <div v-for="(r, i) in result" :key="i" class="ex-rv-row">
            <Emoji :char="REWARD_TYPES[r.type]?.emoji || '🎁'" />
            <span>{{ REWARD_TYPES[r.type]?.label || r.type }}</span>
            <b>+{{ r.amount.toLocaleString() }}</b>
          </div>
          <div v-if="!result.length" class="ex-rv-row ex-rv-empty">รอบนี้ไม่ได้ของพิเศษ — ลองส่งสายเก่งขึ้นนะ</div>
          <button class="ex-go" @click="result = null">เยี่ยม!</button>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import Emoji from '../components/shared/Emoji.vue'
import { RouterLink } from 'vue-router'
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '../stores/auth.js'
import { useExpedition } from '../composables/useExpedition.js'
import { expeditionState } from '../utils/expedition.js'
import { MISSIONS, DURATIONS, REWARD_TYPES, EXPEDITION_PARTY_SIZE } from '../data/expeditions.js'
import { ELEMENTS, getPetDef } from '../data/index.js'
import PetThumb from '../components/shared/PetThumb.vue'

const authStore = useAuthStore()
const { exp, eligiblePets, mission, send, claim } = useExpedition()
const PARTY_SIZE = EXPEDITION_PARTY_SIZE

const now = ref(Date.now())
let timer = null
onMounted(() => { timer = setInterval(() => { now.value = Date.now() }, 1000) })
onUnmounted(() => clearInterval(timer))

const state = computed(() => expeditionState(exp.value, now.value))

// idle selections
const missionId = ref(MISSIONS[0]?.id || null)
const durationId = ref(DURATIONS[0]?.id || null)
const picked = ref([])
const busy = ref(false)
const result = ref(null)

const curMission = computed(() => mission(missionId.value))
const canSend = computed(() => picked.value.length === PARTY_SIZE && missionId.value && durationId.value)

const elEmoji = (el) => ELEMENTS[el]?.emoji || '✊'
const defEl = (id) => getPetDef(id)?.element || 'scissors'
const unitOf = (p) => ({ id: p.id, rarity: p.rarity || getPetDef(p.id)?.rarity || 'common', element: defEl(p.id), grade: p.grade || 0 })

function togglePet(id) {
  const at = picked.value.indexOf(id)
  if (at >= 0) picked.value.splice(at, 1)
  else { if (picked.value.length >= PARTY_SIZE) return; picked.value.push(id) }
}

// countdown text
const remainText = computed(() => {
  const ms = Math.max(0, (exp.value?.endsAt || 0) - now.value)
  const h = Math.floor(ms / 3600000), m = Math.floor((ms % 3600000) / 60000), s = Math.floor((ms % 60000) / 1000)
  return h > 0 ? `${h} ชม. ${m} นาที` : (m > 0 ? `${m} นาที ${s} วิ` : `${s} วิ`)
})

async function onSend() {
  if (busy.value) return
  busy.value = true
  try { if (await send(picked.value, missionId.value, durationId.value)) picked.value = [] }
  finally { busy.value = false }
}
async function onClaim() {
  if (busy.value) return
  busy.value = true
  try { const r = await claim(); if (r) result.value = r }
  finally { busy.value = false }
}
</script>

<style scoped>
.ex-head { display: flex; align-items: center; justify-content: space-between; }
.ex-back { font-size: .8rem; color: var(--muted); text-decoration: none; }
.ex-sec { font-size: .82rem; font-weight: 800; margin: 14px 0 8px; }
.ex-sec-note { font-size: .64rem; font-weight: 600; color: rgba(0,0,0,.45); }
.ex-missions { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; }
.ex-mis { all: unset; cursor: pointer; box-sizing: border-box; text-align: center; background: #fff; border: 2px solid var(--ink); border-radius: 14px; box-shadow: var(--pop); padding: 10px 4px; display: flex; flex-direction: column; align-items: center; gap: 3px; }
.ex-mis.on { background: #eef2ff; box-shadow: inset 0 0 0 2px var(--primary), var(--pop); }
.ex-mis-emoji { font-size: 1.5rem; }
.ex-mis-name { font-size: .66rem; font-weight: 800; }
.ex-mis-el { font-size: .58rem; color: rgba(0,0,0,.5); }
.ex-pool { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
.ex-pet { position: relative; all: unset; cursor: pointer; box-sizing: border-box; border: 2px solid #ddd; border-radius: 12px; background: #fff; display: flex; justify-content: center; padding: 8px 2px; }
.ex-pet.on { background: #eef2ff; box-shadow: inset 0 0 0 2px var(--primary); }
.ex-pet.match { border-color: var(--gold); }
.ex-pet:disabled { opacity: .4; cursor: not-allowed; }
.ex-pet-bonus { position: absolute; bottom: -6px; left: 50%; transform: translateX(-50%); white-space: nowrap; background: var(--gold); color: #1f2937; font-size: .5rem; font-weight: 800; padding: 1px 6px; border-radius: 999px; border: 1.5px solid var(--ink); }
.ex-none { grid-column: 1 / -1; text-align: center; font-size: .76rem; color: rgba(0,0,0,.45); padding: 18px 0; }
.ex-durs { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; }
.ex-dur { all: unset; cursor: pointer; box-sizing: border-box; text-align: center; background: #fff; border: 2px solid var(--ink); border-radius: 12px; box-shadow: var(--pop); padding: 10px 4px; display: flex; flex-direction: column; gap: 2px; }
.ex-dur.on { background: #eef2ff; box-shadow: inset 0 0 0 2px var(--primary), var(--pop); }
.ex-dur b { font-size: .8rem; } .ex-dur span { font-size: .62rem; color: rgba(0,0,0,.5); }
.ex-go { display: block; width: 100%; margin-top: 16px; border: 2px solid var(--ink); border-radius: 13px; padding: 13px; font-family: inherit; font-weight: 800; color: #fff; background: var(--primary); box-shadow: var(--pop); cursor: pointer; }
.ex-go:disabled { background: #cbd5e1; box-shadow: none; cursor: default; }
.ex-card { background: #fff; border: 2px solid var(--ink); border-radius: 16px; box-shadow: var(--pop); padding: 18px 16px; text-align: center; margin-top: 12px; }
.ex-active-mis, .ex-ready-h { font-size: 1rem; font-weight: 800; }
.ex-party { display: flex; justify-content: center; gap: 8px; margin: 14px 0; }
.ex-party :deep(.pet-thumb), .ex-party > * { width: 52px; }
.ex-count { font-size: .82rem; font-weight: 700; color: var(--primary); }
.ex-login { text-align: center; color: rgba(0,0,0,.4); padding: 30px 0; font-size: .85rem; }
.ex-ov { position: fixed; inset: 0; z-index: 420; background: rgba(0,0,0,.5); display: flex; align-items: center; justify-content: center; padding: 24px; }
.ex-rv { background: #fff; border: 2px solid var(--ink); border-radius: 20px; box-shadow: var(--pop-lg); padding: 22px; max-width: 300px; width: 100%; text-align: center; }
.ex-rv-h { font-weight: 800; font-size: 1rem; margin-bottom: 12px; }
.ex-rv-row { display: flex; align-items: center; justify-content: center; gap: 8px; font-size: .9rem; font-weight: 700; padding: 5px 0; }
.ex-rv-row b { color: var(--primary); }
.ex-rv-empty { color: rgba(0,0,0,.5); font-weight: 600; font-size: .78rem; }
</style>
```

- [ ] **Step 2: เพิ่ม route** ใน `src/router/index.js` ใต้บรรทัด arena:
```js
    { path: '/expedition', name: 'expedition', component: () => import('../views/ExpeditionView.vue') },
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: ✓ built

- [ ] **Step 4: Commit**

```bash
git add src/views/ExpeditionView.vue src/router/index.js
git commit -m "Expedition: หน้าส่งผจญภัย + route /expedition"
```

---

## Task 6: PlayView — จัดหัวข้อใหม่ (Option A) + การ์ดส่งผจญภัย

**Files:**
- Modify: `src/views/PlayView.vue`

**Interfaces:**
- Consumes: route `/expedition` (Task 5), `useExpedition` (badge สถานะ), `expeditionState`

หมายเหตุ: PlayView ใช้ `<SectionTitle>`, `<SoonCard>`, `<RouterLink>`, การ์ดฟาร์ม (modal) อยู่แล้ว — ดูโครงปัจจุบันก่อนแก้ (อย่าเชื่อเลขบรรทัด)

- [ ] **Step 1: เพิ่ม import + badge สถานะ expedition** ใน `<script setup>` ของ `PlayView.vue`

ใต้บรรทัด import ของ farm/composables เพิ่ม:
```js
import { useExpedition } from '../composables/useExpedition.js'
import { expeditionState } from '../utils/expedition.js'
```
ใต้บรรทัด `const farm = useFarm()` เพิ่ม:
```js
const { exp } = useExpedition()
// badge การ์ดส่งผจญภัย — ใช้ now (5s tick ที่มีอยู่แล้ว) เช็คว่ากลับมายัง
const expState = computed(() => expeditionState(exp.value, now.value))
```
(`now` + `computed` มีอยู่แล้วใน PlayView)

- [ ] **Step 2: แก้ template ส่วน logged-in ให้เป็น Option A**

แทนบล็อก 3 หัวข้อเดิม (`<SectionTitle>สวน & สัตว์` … จนจบ `</div>` ของหัวข้อสนามประลอง) ด้วยโครงนี้ (คงปุ่มฟาร์ม-modal + Teleport farm sheet ด้านล่างไว้เหมือนเดิม):

```html
      <!-- ── เพ็ท & สะสม ── -->
      <SectionTitle><Emoji char="🐾" /> เพ็ท &amp; สะสม</SectionTitle>
      <div class="play-grid">
        <RouterLink to="/pets" class="game-card">
          <span class="gc-emoji"><Emoji char="🐾" /></span>
          <span class="gc-name">สัตว์เลี้ยง</span>
          <span class="gc-badge grow">คลัง · ห้องทดลอง</span>
        </RouterLink>

        <!-- Farm: live entry card → opens modal -->
        <button class="game-card" @click="farmOpen = true">
          <span class="gc-emoji"><Emoji char="🌾" /></span>
          <span class="gc-name">ฟาร์ม</span>
          <span v-if="readyCount" class="gc-badge ready"><Emoji char="🧺" /> เก็บได้ {{ readyCount }}</span>
          <span v-else-if="emptyCount" class="gc-badge plant">＋ ว่าง {{ emptyCount }} แปลง</span>
          <span v-else class="gc-badge grow"><Emoji char="🌱" /> กำลังโต</span>
        </button>

        <RouterLink to="/expedition" class="game-card">
          <span class="gc-emoji"><Emoji char="🗺️" /></span>
          <span class="gc-name">ส่งผจญภัย</span>
          <span v-if="expState === 'ready'" class="gc-badge ready"><Emoji char="🎉" /> กลับมาแล้ว!</span>
          <span v-else-if="expState === 'active'" class="gc-badge plant"><Emoji char="⏳" /> กำลังไป</span>
          <span v-else class="gc-badge grow">ส่งเพ็ทหารางวัล</span>
        </RouterLink>
      </div>

      <!-- ── ประลอง ── -->
      <SectionTitle><Emoji char="⚔️" /> ประลอง</SectionTitle>
      <div class="play-grid">
        <RouterLink to="/tower" class="game-card">
          <span class="gc-emoji"><Emoji char="🏯" /></span>
          <span class="gc-name">ปีนหอคอย</span>
          <span class="gc-badge grow">ไต่ชั้น · ปลดโบนัส</span>
        </RouterLink>
        <RouterLink to="/arena" class="game-card">
          <span class="gc-emoji"><Emoji char="⚔️" /></span>
          <span class="gc-name">สนามประลอง</span>
          <span class="gc-badge grow">PvP · แต้มประลอง</span>
        </RouterLink>
        <SoonCard emoji="🐲" label="บอสรวมรุ่น" />
      </div>

      <!-- ── ร้านค้า ── -->
      <SectionTitle><Emoji char="🛒" /> ร้านค้า</SectionTitle>
      <RouterLink to="/shop" class="game-card">
        <span class="gc-emoji"><Emoji char="🛒" /></span>
        <span class="gc-name">ร้านค้า</span>
        <span class="gc-badge grow">อัญเชิญ · ห้องทดลอง</span>
      </RouterLink>

      <!-- ── มินิเกม (เร็วๆ นี้) ── -->
      <SectionTitle><Emoji char="🎮" /> มินิเกม</SectionTitle>
      <div class="play-grid">
        <SoonCard emoji="🍬" label="เภสัช Crush" />
      </div>
```

- [ ] **Step 3: Verify build + ดูจอ**

Run: `npm run build`
Expected: ✓ built
Manual (dev): /play แสดง 4 หัวข้อ (เพ็ท&สะสม / ประลอง / ร้านค้า / มินิเกม) · การ์ด "ส่งผจญภัย" ลิงก์ไป /expedition · ฟาร์ม modal ยังเปิดได้

- [ ] **Step 4: Commit**

```bash
git add src/views/PlayView.vue
git commit -m "Play: จัดหัวข้อใหม่ (เพ็ท&สะสม/ประลอง/ร้านค้า/มินิเกม) + การ์ดส่งผจญภัย"
```

---

## Task 7: TeamPicker — กันเพ็ทที่กำลังผจญภัยเข้าทีม

**Files:**
- Modify: `src/components/battle/TeamPicker.vue`

**Interfaces:**
- Consumes: `auth.userData.expedition.petIds`

เหตุผล: เพ็ทที่ออกผจญภัยต้องเอาเข้าทีมต่อสู้ไม่ได้ (กันชนกับ PvP/หอคอยที่อ่าน `activePets`)

- [ ] **Step 1: เพิ่ม set ของเพ็ทที่ผจญภัยอยู่** ใน `<script setup>` ของ `TeamPicker.vue` (ใต้บรรทัด `const owned = computed(...)`)

```js
// เพ็ทที่กำลังออกผจญภัย — เอาเข้าทีมไม่ได้จนกว่าจะกลับ
const expeditionIds = computed(() => new Set(auth.userData?.expedition?.petIds || []))
```

- [ ] **Step 2: disable ปุ่มในคลัง + ป้ายบอก** — แก้ปุ่ม `v-for="p in sortedOwned"` ในเทมเพลต

เพิ่มเงื่อนไข disable (รวมกับเงื่อนไขเดิม) และคลาส:
```html
      <button
        v-for="p in sortedOwned" :key="p.id"
        class="tp-pet" :class="{ active: activeIds.includes(p.id), away: expeditionIds.has(p.id) }"
        :style="{ borderColor: rarityColor(p.id) }"
        :disabled="expeditionIds.has(p.id) || (!activeIds.includes(p.id) && filledCount >= battleSlots)"
        @click="toggle(p.id)"
      >
        <span v-if="expeditionIds.has(p.id)" class="tp-away"><Emoji char="🗺️" /></span>
        <span class="tp-el"><Emoji :char="elEmoji(p.id)" /></span>
        <span class="tp-emoji"><Emoji :char="defOf(p.id).emoji" /></span>
        <span class="tp-name">{{ defOf(p.id).name }}</span>
        <PetStatLine :pet="p" />
      </button>
```

- [ ] **Step 3: guard toggle()** — กันกดสลับเพ็ทที่ผจญภัยอยู่ (เผื่อ event หลุด) ใน `toggle(id)` เพิ่มบรรทัดแรก:
```js
function toggle(id) {
  if (expeditionIds.value.has(id)) return
  const cur = activeIds.value.slice()
  // …เดิม…
```

- [ ] **Step 4: เพิ่มสไตล์** ใน `<style scoped>`:
```css
.tp-pet.away { opacity: .45; }
.tp-away { position: absolute; top: 2px; right: 3px; font-size: .7rem; line-height: 1; }
```

- [ ] **Step 5: Verify build + ดูจอ**

Run: `npm run build`
Expected: ✓ built
Manual (dev): ส่งเพ็ทไปผจญภัย → เปิด TeamPicker → เพ็ทตัวนั้นจาง + มีป้าย 🗺️ + แตะเข้าทีมไม่ได้

- [ ] **Step 6: Commit**

```bash
git add src/components/battle/TeamPicker.vue
git commit -m "TeamPicker: กันเพ็ทที่กำลังผจญภัยเข้าทีมต่อสู้ (lock)"
```

---

## Task 8: Home — การ์ดเตือนสถานะผจญภัย

**Files:**
- Create: `src/components/home/ExpeditionCard.vue`
- Modify: `src/views/HomeView.vue`

**Interfaces:**
- Consumes: `useExpedition`, `expeditionState`

แสดงเฉพาะตอน active/ready (idle = ไม่โชว์ ไม่รก) · กดไป /expedition

- [ ] **Step 1: สร้าง ExpeditionCard**

```vue
<!-- src/components/home/ExpeditionCard.vue -->
<template>
  <RouterLink v-if="state !== 'idle'" to="/expedition" class="exc" :class="state">
    <span class="exc-emoji"><Emoji :char="state === 'ready' ? '🎉' : '🗺️'" /></span>
    <span class="exc-txt">
      <b>ส่งผจญภัย</b>
      <span class="exc-sub">{{ state === 'ready' ? 'คณะกลับมาแล้ว — กดเก็บรางวัล' : `กำลังผจญภัย · เหลือ ${remainText}` }}</span>
    </span>
    <span class="exc-go">›</span>
  </RouterLink>
</template>

<script setup>
import Emoji from '../shared/Emoji.vue'
import { RouterLink } from 'vue-router'
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useExpedition } from '../../composables/useExpedition.js'
import { expeditionState } from '../../utils/expedition.js'

const { exp } = useExpedition()
const now = ref(Date.now())
let timer = null
onMounted(() => { timer = setInterval(() => { now.value = Date.now() }, 1000) })
onUnmounted(() => clearInterval(timer))

const state = computed(() => expeditionState(exp.value, now.value))
const remainText = computed(() => {
  const ms = Math.max(0, (exp.value?.endsAt || 0) - now.value)
  const h = Math.floor(ms / 3600000), m = Math.floor((ms % 3600000) / 60000)
  return h > 0 ? `${h} ชม. ${m} นาที` : `${m} นาที`
})
</script>

<style scoped>
.exc { display: flex; align-items: center; gap: 10px; text-decoration: none; color: var(--ink); background: #fff; border: 2px solid var(--ink); border-radius: 14px; box-shadow: var(--pop); padding: 11px 13px; margin-top: 4px; }
.exc.ready { background: rgba(34,197,94,.12); border-color: #16a34a; }
.exc-emoji { font-size: 1.4rem; }
.exc-txt { display: flex; flex-direction: column; min-width: 0; }
.exc-txt b { font-size: .85rem; }
.exc-sub { font-size: .66rem; color: rgba(0,0,0,.55); }
.exc-go { margin-left: auto; font-size: 1.2rem; color: rgba(0,0,0,.3); }
</style>
```

- [ ] **Step 2: เสียบใน HomeView** — `src/views/HomeView.vue`

เพิ่ม import ใน `<script setup>`:
```js
import ExpeditionCard from '../components/home/ExpeditionCard.vue'
```
ในเทมเพลต ใต้ `<DailyCard />` เพิ่ม:
```html
      <!-- สถานะส่งผจญภัย (โชว์เฉพาะตอนกำลังไป/กลับมาแล้ว) -->
      <ExpeditionCard />
```

- [ ] **Step 3: Verify build + ดูจอ**

Run: `npm run build`
Expected: ✓ built
Manual (dev): ไม่มีสาย → ไม่เห็นการ์ด · ส่งสาย → Home โชว์การ์ด "กำลังผจญภัย" · ครบเวลา → การ์ดเขียว "กดเก็บรางวัล" ลิงก์ไป /expedition

- [ ] **Step 4: Commit**

```bash
git add src/components/home/ExpeditionCard.vue src/views/HomeView.vue
git commit -m "Home: การ์ดเตือนสถานะส่งผจญภัย (active/ready)"
```

---

## Task 9: Manual verification (dev)

**Files:** ไม่มี (รันจริง)

- [ ] **Step 1: รัน dev**

Run: `npm run dev` → เปิดเบราว์เซอร์ (ล็อกอิน)

- [ ] **Step 2: ส่งสาย**
  - /play → หัวข้อ "เพ็ท & สะสม" → การ์ด "ส่งผจญภัย" → /expedition
  - เลือกมิชชัน (เห็นธาตุ) · เลือก 3 ตัว (ตัวธาตุตรงมีป้าย "ธาตุตรง" ขอบทอง) · เลือกเวลา → กด "ส่งผจญภัย"
  - เพ็ทที่เลือก = เฉพาะตัวนอกทีมต่อสู้ (ถ้าไม่มี → ข้อความเตือน)

- [ ] **Step 3: ระหว่างไป**
  - /expedition โชว์ countdown · /play การ์ดขึ้น "⏳ กำลังไป" · Home การ์ด "กำลังผจญภัย"
  - เปิด TeamPicker (หน้าเพ็ท/หอคอย) → เพ็ทที่ส่งไปจาง+ป้าย 🗺️ แตะเข้าทีมไม่ได้

- [ ] **Step 4: กดเก็บ** (รอครบเวลา — หรือทดสอบด้วยมิชชันสั้น/แก้ชั่วคราว)
  - /expedition → "เก็บรางวัล" → popup สรุป (เหรียญ + ตั๋ว ถ้าได้) · เหรียญ/ตั๋วเพิ่มจริง · กลับสู่ idle ส่งใหม่ได้
  - กดเก็บซ้ำไม่ได้ (expedition = null แล้ว)

- [ ] **Step 5: ตรวจไม่กระทบของเดิม**
  - /tower และ /arena ยังสู้ปกติ (activePets ไม่โดนแตะ)
  - หน้าเพ็ท/ร้านค้า/หลอม ปกติ

- [ ] **Step 6: รันเทสรวม + build ปิดงาน**

Run: `node --test src/utils/*.test.js src/data/*.test.js`
Expected: PASS ทั้งหมด (รวมเทสใหม่ expedition*/expeditions)
Run: `npm run build`
Expected: ✓ built

- [ ] **Step 7: (เมื่อพร้อม) number pass + push**
  - ⚠️ ก่อนเปิดจริง: จูนตัวเลขใน `data/expeditions.js` + sim เทียบรายได้บ้าน/ฟาร์ม (spec §8) — แยกงาน
  - `git push origin master` (auto-deploy GitHub Pages) · **ไม่ต้อง** deploy rules (ไม่แก้ rules)

---

## Self-Review Notes

- **Spec coverage:** แก่นส่งผจญภัย 1 สาย/3 ตัว/ล็อก (T3,4,7) · มิชชัน+ธาตุ+3 ระยะเวลา (T1,5) · รางวัลเหรียญ(cap)+ลุ้นตั๋ว สเกลคุณภาพ×เวลา×ธาตุ deterministic (T2) · reward table extensible (T1,2,4) · snapshot ตอนส่ง (T4 reuse resolveBattleTeam) · schema field (T3) · UI หน้า+route+Play card+Home card (T5,6,8) · จัดหัวข้อ Play Option A (T6) · เปิดเลยไม่ gated (ไม่มี task admin toggle) · Firestore ~0 + ไม่แตะ rules (ทุก write ผ่าน patchUser doc ตัวเอง) ✓
- **เปลี่ยนจาก spec:** ตัด lock fusion/ขาย — เพราะ LabTab ใช้ copies (ตัวซ้ำ) ไม่ทำลาย instance หลัก และไม่มีระบบขายเพ็ท → snapshot ตอนส่งทำให้ claim ไม่พึ่งเพ็ทปัจจุบันอยู่แล้ว · lock เหลือเฉพาะ TeamPicker (battle integrity) ✓
- **Type consistency:** party = `{id,rarity,element,grade}` (จาก `resolveBattleTeam`) ใช้ตรงกันทั้ง util/composable/view · `expeditionState`/`resolveRewards`/`expeditionSeed` signature ตรงกันทุก consumer · REWARD_TYPES.field → patchUser increment ตรงกับ field จริง (coins/freeGachaTickets) ✓
- **ตัวเลขทั้งหมด draft pin** — number pass + sim เป็นงานแยกก่อนเปิด (spec §8)
