# Daily Quest Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** เควสต์รายวัน 3 อย่าง (ข้อสอบ5/แฟลช5/กาชา1) → รับ buff รายได้ ×1.5 นาน 24ชม. + ตั๋วกาชาฟรี 1 ใบ

**Architecture:** logic อยู่ใน pure `utils/dailyQuest.js` (+เทส); progress เก็บบน user doc (`dailyQuest` object) นับแบบ write-time reset; buff = `incomeBuffUntil` timestamp ที่ `useDaily` คูณ rate; การ์ดบน Home; ตั๋วฟรีใช้ใน ShopView. ไม่แก้ rules.

**Tech Stack:** Vue 3 `<script setup>`, Pinia, Firebase Firestore (modular SDK), Vite, `node:test`+`node:assert/strict`

## Global Constraints

- ทดสอบ pure util: `node --test src/utils/<file>.test.js` · ตรวจ build: `npm run build` (ไม่มี runner กลาง/lint)
- เขียน user doc ผ่าน `auth.patchUser(optimistic, server)` (ยกเว้น ShopView `buy()` ที่ใช้ `blockSnapshot`+`updateDoc` เดิม — ทำตามแพทเทิร์นไฟล์นั้น) · ฟิลด์ใหม่ใส่ `data/userSchema.js` ที่เดียว
- emoji ในเทมเพลตใช้ `<Emoji char="…" />` เสมอ · ห้าม emoji ใน JS string
- commit style `Area: อะไร (ทำไม)` ลงท้าย body: `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`
- **git add เฉพาะไฟล์ที่ตั้งใจ** — ห้าม `git add -A`
- daily reset key = `new Date().toISOString().slice(0, 10)` (ตรงกับ cap quiz/study เดิม)
- 3 เป้า: quiz≥5, study≥5, gacha≥1 · รางวัล: `incomeBuffUntil = now + 24ชม` (×1.5) + `freeGachaTickets +1`
- **ไม่แก้ firestore.rules** (ทุก field บน user doc owner-write)

---

## Task 1: pure util `utils/dailyQuest.js` + เทส

**Files:**
- Create: `src/utils/dailyQuest.js`
- Test: `src/utils/dailyQuest.test.js`

**Interfaces:**
- Produces: `QUEST_GOALS = {quiz:5, study:5, gacha:1}` · `BUFF_MS` · `bumpDailyQuest(dq, field, today, n=1) → newDq` · `questComplete(dq, today) → bool` · `questClaimable(dq, today) → bool` · `questIncomeMult(userData, now) → 1|1.5`

- [ ] **Step 1: เขียนเทส `src/utils/dailyQuest.test.js`**

```js
// เทส dailyQuest — pure (bump/reset/complete/claimable/mult)
// รัน: node --test src/utils/dailyQuest.test.js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  QUEST_GOALS, BUFF_MS, bumpDailyQuest, questComplete, questClaimable, questIncomeMult,
} from './dailyQuest.js'

const T = '2026-06-19'

test('bump: doc ว่าง → เริ่มวันนี้ +1', () => {
  const dq = bumpDailyQuest(undefined, 'quiz', T)
  assert.deepEqual(dq, { date: T, quiz: 1, study: 0, gacha: 0, claimed: false })
})

test('bump: +n สะสมในวันเดียว', () => {
  let dq = bumpDailyQuest({ date: T, quiz: 2, study: 0, gacha: 0, claimed: false }, 'quiz', T, 3)
  assert.equal(dq.quiz, 5)
})

test('bump: ข้ามวัน → รีเซ็ตก่อนนับ (รวม claimed)', () => {
  const old = { date: '2026-06-18', quiz: 9, study: 9, gacha: 9, claimed: true }
  const dq = bumpDailyQuest(old, 'study', T)
  assert.deepEqual(dq, { date: T, quiz: 0, study: 1, gacha: 0, claimed: false })
})

test('questComplete: ครบทั้ง 3 + วันตรง', () => {
  assert.equal(questComplete({ date: T, quiz: 5, study: 5, gacha: 1, claimed: false }, T), true)
  assert.equal(questComplete({ date: T, quiz: 5, study: 4, gacha: 1, claimed: false }, T), false)
  assert.equal(questComplete({ date: '2026-06-18', quiz: 9, study: 9, gacha: 9 }, T), false) // คนละวัน
})

test('questClaimable: ครบและยังไม่รับ', () => {
  assert.equal(questClaimable({ date: T, quiz: 5, study: 5, gacha: 1, claimed: false }, T), true)
  assert.equal(questClaimable({ date: T, quiz: 5, study: 5, gacha: 1, claimed: true }, T), false)
})

test('questIncomeMult: buff active/หมดอายุ', () => {
  const now = 1_000_000
  assert.equal(questIncomeMult({ incomeBuffUntil: now + 1000 }, now), 1.5)
  assert.equal(questIncomeMult({ incomeBuffUntil: now - 1000 }, now), 1)
  assert.equal(questIncomeMult({}, now), 1)
  assert.equal(questIncomeMult(null, now), 1)
})

test('BUFF_MS = 24 ชม.', () => {
  assert.equal(BUFF_MS, 24 * 60 * 60 * 1000)
})
```

- [ ] **Step 2: รันเทสให้ FAIL**

Run: `node --test src/utils/dailyQuest.test.js`
Expected: FAIL — `Cannot find module './dailyQuest.js'`

- [ ] **Step 3: เขียน `src/utils/dailyQuest.js`**

```js
// dailyQuest — pure: เควสต์รายวัน (reset แบบ write-time, ไม่ต้อง cron)
export const QUEST_GOALS = { quiz: 5, study: 5, gacha: 1 }
export const BUFF_MS = 24 * 60 * 60 * 1000

const fresh = (today) => ({ date: today, quiz: 0, study: 0, gacha: 0, claimed: false })

// คืน object ใหม่: ถ้าข้ามวัน รีเซ็ตก่อน แล้ว +n ที่ field
export function bumpDailyQuest(dq, field, today, n = 1) {
  const base = (dq && dq.date === today)
    ? { date: dq.date, quiz: dq.quiz || 0, study: dq.study || 0, gacha: dq.gacha || 0, claimed: !!dq.claimed }
    : fresh(today)
  base[field] = (base[field] || 0) + n
  return base
}

export function questComplete(dq, today) {
  return !!dq && dq.date === today
    && (dq.quiz || 0) >= QUEST_GOALS.quiz
    && (dq.study || 0) >= QUEST_GOALS.study
    && (dq.gacha || 0) >= QUEST_GOALS.gacha
}

export function questClaimable(dq, today) {
  return questComplete(dq, today) && !dq.claimed
}

export function questIncomeMult(userData, now) {
  const until = userData?.incomeBuffUntil
  return (until && now < until) ? 1.5 : 1
}
```

- [ ] **Step 4: รันเทสให้ PASS**

Run: `node --test src/utils/dailyQuest.test.js`
Expected: PASS ทุกเคส

- [ ] **Step 5: Commit**

```bash
git add src/utils/dailyQuest.js src/utils/dailyQuest.test.js
git commit -m "DailyQuest: pure util (bump/reset/complete/claimable/mult, +เทส)"
```

---

## Task 2: userSchema fields

**Files:**
- Modify: `src/data/userSchema.js`

**Interfaces:**
- Produces: user doc มี `dailyQuest` (object), `freeGachaTickets` (number), `incomeBuffUntil` (number|null)

- [ ] **Step 1: เพิ่ม defaults + normalize**

`src/data/userSchema.js`:
- ใน `USER_DEFAULTS` (ใกล้ `studyCoinsToday`/counters) เพิ่ม:
```js
  dailyQuest: { date: null, quiz: 0, study: 0, gacha: 0, claimed: false },
  freeGachaTickets: 0,
  incomeBuffUntil: null,
```
- ใน `normalizeUserData` (ใกล้ deep-default ของ residence/farm) เพิ่ม deep-default ให้ dailyQuest เป็น object เต็ม:
```js
  d.dailyQuest = { ...USER_DEFAULTS.dailyQuest, ...(isObj(data.dailyQuest) ? data.dailyQuest : {}) }
```

- [ ] **Step 2: ตรวจ build**

Run: `npm run build`
Expected: build สำเร็จ

- [ ] **Step 3: Commit**

```bash
git add src/data/userSchema.js
git commit -m "DailyQuest: schema (dailyQuest/freeGachaTickets/incomeBuffUntil)"
```

---

## Task 3: นับ progress 3 จุด (Quiz / Study / Shop buy)

**Files:**
- Modify: `src/views/QuizView.vue` (finish write)
- Modify: `src/views/StudyView.vue` (grade/commit)
- Modify: `src/views/ShopView.vue` (buy)

**Interfaces:**
- Consumes: `bumpDailyQuest` (Task 1)

- [ ] **Step 1: QuizView — bump quiz**

`src/views/QuizView.vue`:
- เพิ่ม import: `import { bumpDailyQuest } from '../utils/dailyQuest.js'`
- ใน `finish()` ตรงที่เขียน user doc ผ่าน `patchUser(optimistic, server)` (ก้อนที่มี `quizDoneTotal`/`coins` จาก Task achievement) — คำนวณ `today` (มีอยู่แล้ว `const today = new Date().toISOString().slice(0,10)`) แล้วเพิ่ม:
```js
    const dq = bumpDailyQuest(authStore.userData?.dailyQuest, 'quiz', today, answered.value)
```
  ใส่ `dailyQuest: dq` ลงทั้ง optimistic object และ server patch object (เขียนทั้ง object — ไม่ใช่ increment)

- [ ] **Step 2: StudyView — bump study (การ์ดใหม่ในเซสชัน)**

`src/views/StudyView.vue`:
- เพิ่ม import: `import { bumpDailyQuest } from '../utils/dailyQuest.js'`
- ใน `commit(newCards, reward, today, dailyTotal, reviewedInc)` (พารามิเตอร์ `reviewedInc` มาจาก Task achievement) — เมื่อ `reviewedInc > 0` เพิ่ม:
```js
    const dq = bumpDailyQuest(authStore.userData?.dailyQuest, 'study', today, reviewedInc)
    optimistic.dailyQuest = dq
    patch.dailyQuest = dq
```
  (วางในบล็อก `if (reviewedInc > 0)` เดียวกับ studyReviewedTotal — `today` มีในพารามิเตอร์แล้ว)

- [ ] **Step 3: ShopView — bump gacha ใน buy()**

`src/views/ShopView.vue` `buy()` (ใช้ `blockSnapshot`+`updateDoc` เดิม):
- เพิ่ม import: `import { bumpDailyQuest } from '../utils/dailyQuest.js'` + `serverTimestamp` ไม่ต้อง (ใช้ของเดิม)
- ใน `buy()` หลังคำนวณ `pet` ก่อน optimistic:
```js
  const today = new Date().toISOString().slice(0, 10)
  const dq = bumpDailyQuest(authStore.userData?.dailyQuest, 'gacha', today, 1)
```
- เพิ่ม `dailyQuest: dq` ลง `setUserDataOptimistic({...})` และ `updateDoc(..., { ..., dailyQuest: dq })`

- [ ] **Step 4: ตรวจ build**

Run: `npm run build`
Expected: build สำเร็จ

- [ ] **Step 5: Commit**

```bash
git add src/views/QuizView.vue src/views/StudyView.vue src/views/ShopView.vue
git commit -m "DailyQuest: นับ progress (ข้อสอบ/แฟลช/กาชา) 3 จุด"
```

---

## Task 4: useDaily buff multiplier + DailyCard buff row

**Files:**
- Modify: `src/composables/useDaily.js`
- Modify: `src/components/home/DailyCard.vue`

**Interfaces:**
- Consumes: `questIncomeMult` (Task 1)
- Produces: `useDaily()` เพิ่ม return `buffActive` (bool), `buffMult` (1|1.5) — ratePerDay/ratePerHour รวม buff แล้ว

- [ ] **Step 1: useDaily คูณ buff**

`src/composables/useDaily.js`:
- import: `import { questIncomeMult } from '../utils/dailyQuest.js'`
- เพิ่ม computed (ก่อน `ratePerDay`):
```js
  const buffMult = computed(() => questIncomeMult(auth.userData, now.value))
  const buffActive = computed(() => buffMult.value > 1)
```
  > `now` (live clock) มีอยู่แล้วบรรทัด ~29 — ย้าย/วาง buffMult หลังนิยาม `now` ถ้าจำเป็น (now ถูกประกาศหลัง ratePerDay เดิม → **ย้ายประกาศ `buffMult`/`buffActive` ไปหลัง `now`** แล้วแก้ `ratePerDay` ให้อ้าง buffMult)
- แก้ `ratePerDay`:
```js
  const ratePerDay = computed(() => Math.round((baseIncome.value + petIncome.value) * (1 + bonusPct.value / 100) * buffMult.value))
```
- เพิ่ม `buffActive, buffMult` ใน return object

> ลำดับประกาศ: `now` ต้องมาก่อน `buffMult`; และ `ratePerDay` อ้าง `buffMult` → จัดลำดับ: baseIncome/petIncome/bonusPct → now (live clock) → buffMult/buffActive → ratePerDay/ratePerHour. ย้ายบล็อก `now`/timer ขึ้นมาก่อน ratePerDay

- [ ] **Step 2: DailyCard โชว์แถว buff**

`src/components/home/DailyCard.vue`:
- ดึงเพิ่มจาก useDaily: แก้ destructure (`useDaily()`) ให้รวม `buffActive`
- ในบล็อก breakdown (`.dc-breakdown`) เพิ่มแถวก่อน `.dc-total` (รูปแบบเหมือน `dc-bonus` ของ supporter):
```html
<div v-if="buffActive" class="dc-row dc-bonus"><span><Emoji char="⚡" /> โบนัสเควสต์รายวัน</span><b>+50%</b></div>
```

- [ ] **Step 3: ตรวจ build**

Run: `npm run build`
Expected: build สำเร็จ

- [ ] **Step 4: ตรวจด้วยตา (dev)**

Run: `npm run dev` → (หลังมี buff) DailyCard โชว์แถว "⚡ โบนัสเควสต์รายวัน +50%" + รายได้/วันเพิ่มขึ้น 1.5 เท่า

- [ ] **Step 5: Commit**

```bash
git add src/composables/useDaily.js src/components/home/DailyCard.vue
git commit -m "DailyQuest: buff รายได้ ×1.5 ใน useDaily + โชว์แถวที่ DailyCard"
```

---

## Task 5: DailyQuestCard (Home) + claim

**Files:**
- Create: `src/components/home/DailyQuestCard.vue`
- Modify: `src/views/HomeView.vue` (mount)

**Interfaces:**
- Consumes: `QUEST_GOALS`, `questClaimable`, `BUFF_MS` (Task 1) · `auth.patchUser`

- [ ] **Step 1: เขียน `src/components/home/DailyQuestCard.vue`**

```html
<template>
  <div class="dq-card">
    <div class="dq-head"><Emoji char="🎯" /> เควสต์ประจำวัน</div>

    <div class="dq-tasks">
      <div class="dq-task" :class="{ done: q.quiz >= GOALS.quiz }">
        <span class="dq-task-l"><Emoji char="📝" /> ทำข้อสอบ</span>
        <span class="dq-task-n">{{ Math.min(q.quiz, GOALS.quiz) }}/{{ GOALS.quiz }}</span>
      </div>
      <div class="dq-task" :class="{ done: q.study >= GOALS.study }">
        <span class="dq-task-l"><Emoji char="📚" /> ทบทวนการ์ด</span>
        <span class="dq-task-n">{{ Math.min(q.study, GOALS.study) }}/{{ GOALS.study }}</span>
      </div>
      <div class="dq-task" :class="{ done: q.gacha >= GOALS.gacha }">
        <span class="dq-task-l"><Emoji char="🎰" /> เปิดกาชา</span>
        <span class="dq-task-n">{{ Math.min(q.gacha, GOALS.gacha) }}/{{ GOALS.gacha }}</span>
      </div>
    </div>

    <button v-if="!claimed" class="dq-claim" :class="{ ready: claimable }" :disabled="!claimable || claiming" @click="claimReward">
      {{ claiming ? 'กำลังรับ…' : (claimable ? 'รับรางวัล (×1.5 + ตั๋วฟรี)' : 'ทำให้ครบเพื่อรับรางวัล') }}
    </button>
    <div v-else class="dq-claimed"><Emoji char="✅" /> รับรางวัลแล้ววันนี้</div>

    <div v-if="buffActive" class="dq-buff"><Emoji char="⚡" /> รายได้ ×1.5 · เหลือ {{ buffRemain }}</div>
    <div v-if="tickets > 0" class="dq-ticket"><Emoji char="🎟️" /> ตั๋วกาชาฟรี ×{{ tickets }} (ใช้ที่ร้านค้า)</div>
  </div>
</template>

<script setup>
import Emoji from '../shared/Emoji.vue'
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { increment } from 'firebase/firestore'
import { useAuthStore } from '../../stores/auth.js'
import { useToast } from '../../composables/useToast.js'
import { QUEST_GOALS, BUFF_MS, questClaimable } from '../../utils/dailyQuest.js'

const auth = useAuthStore()
const { toast } = useToast()
const GOALS = QUEST_GOALS

const now = ref(Date.now())
let timer = null
onMounted(() => { timer = setInterval(() => { now.value = Date.now() }, 1000) })
onUnmounted(() => clearInterval(timer))

const today = () => new Date().toISOString().slice(0, 10)
const q = computed(() => {
  const dq = auth.userData?.dailyQuest
  return (dq && dq.date === today()) ? dq : { date: today(), quiz: 0, study: 0, gacha: 0, claimed: false }
})
const claimed = computed(() => q.value.claimed)
const claimable = computed(() => questClaimable(auth.userData?.dailyQuest, today()))
const tickets = computed(() => auth.userData?.freeGachaTickets || 0)
const buffActive = computed(() => (auth.userData?.incomeBuffUntil || 0) > now.value)
const buffRemain = computed(() => {
  const s = Math.max(0, Math.ceil(((auth.userData?.incomeBuffUntil || 0) - now.value) / 1000))
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60)
  return h > 0 ? `${h}ชม ${m}น` : `${m}น`
})

const claiming = ref(false)
async function claimReward() {
  if (claiming.value || !claimable.value) return
  claiming.value = true
  const until = Date.now() + BUFF_MS
  const dq = { ...auth.userData.dailyQuest, claimed: true }
  const ok = await auth.patchUser(
    { dailyQuest: dq, freeGachaTickets: tickets.value + 1, incomeBuffUntil: until },
    { 'dailyQuest.claimed': true, freeGachaTickets: increment(1), incomeBuffUntil: until },
  )
  toast(ok ? 'รับรางวัลแล้ว! รายได้ ×1.5 24 ชม. + ตั๋วกาชาฟรี' : 'รับรางวัลไม่สำเร็จ', ok ? 'success' : 'error')
  claiming.value = false
}
</script>

<style scoped>
.dq-card { background: #fff; border: 2px solid var(--ink); border-radius: 18px; padding: 14px; margin-bottom: 14px; box-shadow: var(--pop); }
.dq-head { font-family: var(--font-display); font-weight: 400; font-size: 1.15rem; color: var(--ink); margin-bottom: 10px; }
.dq-tasks { display: flex; flex-direction: column; gap: 7px; margin-bottom: 12px; }
.dq-task { display: flex; justify-content: space-between; align-items: center; font-size: .82rem; font-weight: 700; color: rgba(0,0,0,.65); padding: 7px 10px; border: 2px solid rgba(0,0,0,.1); border-radius: 10px; }
.dq-task.done { border-color: var(--mint, #34d399); background: rgba(52,211,153,.12); color: var(--ink); }
.dq-task-n { font-variant-numeric: tabular-nums; }
.dq-claim { width: 100%; border: 2px solid var(--ink); border-radius: 12px; padding: 11px; font-family: inherit; font-size: .85rem; font-weight: 800; color: #fff; background: #c9c2d4; cursor: pointer; transition: transform .12s, box-shadow .12s; }
.dq-claim.ready { background: var(--gold); box-shadow: var(--pop); }
.dq-claim.ready:active { transform: translate(2px,2px); box-shadow: 0 0 0 var(--ink); }
.dq-claim:disabled { cursor: default; }
.dq-claimed { text-align: center; font-size: .8rem; font-weight: 700; color: #15803d; }
.dq-buff { margin-top: 10px; font-size: .72rem; font-weight: 700; color: #b45309; background: rgba(251,191,36,.15); border-radius: 8px; padding: 6px 10px; }
.dq-ticket { margin-top: 8px; font-size: .72rem; font-weight: 700; color: var(--primary); }
</style>
```

- [ ] **Step 2: mount ใน HomeView**

`src/views/HomeView.vue`:
- import: `import DailyQuestCard from '../components/home/DailyQuestCard.vue'`
- ในเทมเพลต (ใน `<template v-if="authStore.isLoggedIn">` ใกล้ `<DailyCard />`/`<MailboxCard />`) เพิ่ม `<DailyQuestCard />` (วางหลัง DailyCard)

- [ ] **Step 3: ตรวจ build**

Run: `npm run build`
Expected: build สำเร็จ

- [ ] **Step 4: ตรวจด้วยตา (dev)**

Run: `npm run dev` → การ์ดเควสต์โชว์ 3 แถบ · ทำครบ → ปุ่ม "รับรางวัล" enable → กดแล้วขึ้น buff countdown + ตั๋ว +1 · refresh ยังเห็นสถานะถูกต้อง · ข้ามวันรีเซ็ต

- [ ] **Step 5: Commit**

```bash
git add src/components/home/DailyQuestCard.vue src/views/HomeView.vue
git commit -m "DailyQuest: การ์ดบน Home (progress 3 แถบ + รับรางวัล + countdown buff/ตั๋ว)"
```

---

## Task 6: ตั๋วกาชาฟรีใน ShopView

**Files:**
- Modify: `src/data/shop.js` (export const)
- Modify: `src/views/ShopView.vue` (ปุ่มใช้ตั๋ว + redeem)

**Interfaces:**
- Consumes: `rollPetFromEgg` (มีแล้ว), `bumpDailyQuest` (import แล้วจาก Task 3), `DAILY_QUEST_TICKET_EGG`

- [ ] **Step 1: const tier ตั๋ว**

`src/data/shop.js` เพิ่มท้ายไฟล์:
```js
// tier ที่ตั๋วกาชาฟรี (จาก daily quest) สุ่ม — ปรับได้ตอน rework กาชา
export const DAILY_QUEST_TICKET_EGG = 'common'
```

- [ ] **Step 2: ShopView — ปุ่ม + redeem**

`src/views/ShopView.vue`:
- import เพิ่ม: `import { EGG_TYPES, rollPetFromEgg, DAILY_QUEST_TICKET_EGG } from '../data/shop.js'` (แก้บรรทัด import shop เดิม)
- เพิ่ม computed: `const tickets = computed(() => authStore.userData?.freeGachaTickets || 0)`
- ในเทมเพลต เหนือ `.egg-list` เพิ่มปุ่ม (แสดงเมื่อมีตั๋ว):
```html
<button v-if="tickets > 0" class="ticket-btn" :disabled="buying" @click="useTicket">
  <Emoji char="🎟️" /> ใช้ตั๋วกาชาฟรี (×{{ tickets }})
</button>
```
- เพิ่มฟังก์ชัน `useTicket()` (ทำตามแพทเทิร์น `buy()` แต่ไม่หักเหรียญ + ลดตั๋ว + bump gacha):
```js
async function useTicket() {
  if (buying.value || tickets.value < 1) return
  if (pets.value.length >= storageCap.value) {
    toast(`คลังเพ็ทเต็ม (${storageCap.value}) — ขาย/ย้ายก่อน หรืออัปที่อยู่อาศัย`, 'info'); return
  }
  buying.value = true
  const pet = rollPetFromEgg(DAILY_QUEST_TICKET_EGG)
  const today = new Date().toISOString().slice(0, 10)
  const dq = bumpDailyQuest(authStore.userData?.dailyQuest, 'gacha', today, 1)
  authStore.blockSnapshot()
  authStore.setUserDataOptimistic({
    pets: [...pets.value, pet],
    freeGachaTickets: tickets.value - 1,
    dailyQuest: dq,
  })
  try {
    await updateDoc(doc(db, 'users', authStore.currentUser.uid), {
      pets: arrayUnion(pet),
      freeGachaTickets: increment(-1),
      dailyQuest: dq,
    })
    reveal.value = pet
  } catch (e) {
    console.error('[ticket roll]', e); toast('ใช้ตั๋วไม่สำเร็จ', 'error')
  } finally { buying.value = false }
}
```
- style ปุ่ม:
```css
.ticket-btn { width: 100%; margin-bottom: 12px; border: 2px solid var(--ink); border-radius: 12px; padding: 11px; font-family: inherit; font-size: .85rem; font-weight: 800; color: var(--ink); background: var(--gold); box-shadow: var(--pop); cursor: pointer; transition: transform .12s, box-shadow .12s; }
.ticket-btn:active { transform: translate(2px,2px); box-shadow: 0 0 0 var(--ink); }
.ticket-btn:disabled { opacity: .5; cursor: default; }
```

- [ ] **Step 3: ตรวจ build**

Run: `npm run build`
Expected: build สำเร็จ

- [ ] **Step 4: ตรวจด้วยตา (dev)**

Run: `npm run dev` → มีตั๋ว → ปุ่มโผล่ → กดได้ pet ฟรี (ไม่หักเหรียญ) ตั๋วลด 1 + นับ gacha task · คลังเต็มเตือน

- [ ] **Step 5: Commit**

```bash
git add src/data/shop.js src/views/ShopView.vue
git commit -m "DailyQuest: ใช้ตั๋วกาชาฟรีใน Shop (สุ่ม common ฟรี + นับ gacha task)"
```

---

## สรุป deploy หลัง merge
- push master → GitHub Actions auto-deploy frontend
- **ไม่แก้ rules / ไม่มี index ใหม่**

## หลักการที่ยึด
- pure util + `node --test` · เพิ่ม field → userSchema.js ที่เดียว · เขียน user doc ผ่าน patchUser (ยกเว้น Shop buy/ticket ที่ใช้ blockSnapshot+updateDoc เดิม)
- daily reset write-time (bumpDailyQuest) ไม่ต้อง cron
- buff/ticket trust-based
