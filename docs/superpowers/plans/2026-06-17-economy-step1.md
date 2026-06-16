# Economy Step 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** คุม faucet ฟาร์ม (cut margin) + ปลดตัวคูณรายได้ idle ×1.25 เมื่อทำ "แต้มเรียน" ครบ 15/วัน

**Architecture:** pure helper `dailyQuest.js` ถือ logic แต้ม/เป้า/ตัวคูณ (ทดสอบตรง) · 2 ฟิลด์ใหม่ใน user doc (`learnPointsToday`/`questDate`) เขียนผ่าน `patchUser` ตรงจุดที่ SRS review & quiz answer เขียนอยู่แล้ว · `useDaily` คูณตัวคูณเข้า idle income · ฟาร์ม rebalance เป็น data-only ใน `crops.js` โดยใช้ sim script คำนวณเลข

**Tech Stack:** Vue 3 + Pinia + Firebase · pure utils ทดสอบด้วย `node --test` · ไม่มี runtime test กลาง

**อ้างอิง spec:** `docs/superpowers/specs/2026-06-17-economy-step1-design.md`

> ⚠️ **build = post-launch** (Phase 3 ตาม ROADMAP) — plan นี้พร้อม execute แต่ตั้งใจ defer การลงมือจริงไปหลังเปิดตัว · เป็น nerf รายได้ผู้เล่นปัจจุบัน ควรสื่อสารล่วงหน้า + พิจารณา grandfather ตอนลงมือ

---

## File Structure

| ไฟล์ | รับผิดชอบ | สถานะ |
|---|---|---|
| `src/utils/dailyQuest.js` | logic แต้มเรียน/เป้า/ตัวคูณ (pure) | สร้างใหม่ |
| `src/utils/dailyQuest.test.js` | เทส pure helper | สร้างใหม่ |
| `src/data/userSchema.js` | + 2 ฟิลด์ `learnPointsToday`/`questDate` | แก้ |
| `src/views/StudyView.vue` | +1 แต้ม/การทบทวน 1 ครั้ง (ใน `commit`) | แก้ |
| `src/views/QuizView.vue` | +N แต้ม (= ข้อที่ตอบ) ใน `finish` | แก้ |
| `src/composables/useDaily.js` | คูณ questMultiplier เข้า ratePerDay | แก้ |
| `src/components/home/QuestCard.vue` | การ์ดความคืบหน้า quest + สถานะ ×1.25 | สร้างใหม่ |
| `src/views/HomeView.vue` | วาง `<QuestCard>` ใต้ `<DailyCard>` | แก้ |
| `scripts/farm-balance-sim.mjs` | คำนวณ sellPrice ใหม่ (margin-scale) → พิมพ์เลข | สร้างใหม่ |
| `src/data/crops.js` | sellPrice ใหม่ตามผล sim | แก้ |

---

## Task 1: Pure helper `dailyQuest.js` (TDD)

**Files:**
- Create: `src/utils/dailyQuest.js`
- Test: `src/utils/dailyQuest.test.js`

- [ ] **Step 1: เขียนเทสที่ fail ก่อน**

`src/utils/dailyQuest.test.js`:
```js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  addLearnPoints, questDone, questMultiplier, learnProgress,
  LEARN_GOAL, QUEST_MULTI,
} from './dailyQuest.js'

const T = '2026-06-17'  // วันนี้
const Y = '2026-06-16'  // เมื่อวาน

test('addLearnPoints: บวกสะสมในวันเดียวกัน', () => {
  assert.deepEqual(addLearnPoints({ questDate: T, learnPointsToday: 5 }, 3, T),
    { learnPointsToday: 8, questDate: T })
})

test('addLearnPoints: reset เมื่อข้ามวัน', () => {
  assert.deepEqual(addLearnPoints({ questDate: Y, learnPointsToday: 99 }, 2, T),
    { learnPointsToday: 2, questDate: T })
})

test('addLearnPoints: ค่าว่าง/null → เริ่มที่ n', () => {
  assert.deepEqual(addLearnPoints({}, 1, T), { learnPointsToday: 1, questDate: T })
  assert.deepEqual(addLearnPoints(null, 4, T), { learnPointsToday: 4, questDate: T })
})

test('questDone: false เมื่อต่ำกว่าเป้า', () => {
  assert.equal(questDone({ questDate: T, learnPointsToday: LEARN_GOAL - 1 }, T), false)
})

test('questDone: false เมื่อ questDate ไม่ใช่วันนี้ (แม้แต้มถึง)', () => {
  assert.equal(questDone({ questDate: Y, learnPointsToday: 999 }, T), false)
})

test('questDone: true เมื่อครบเป้าในวันนี้', () => {
  assert.equal(questDone({ questDate: T, learnPointsToday: LEARN_GOAL }, T), true)
})

test('questMultiplier: QUEST_MULTI เมื่อ done, 1 เมื่อไม่ done', () => {
  assert.equal(questMultiplier({ questDate: T, learnPointsToday: LEARN_GOAL }, T), QUEST_MULTI)
  assert.equal(questMultiplier({ questDate: T, learnPointsToday: 0 }, T), 1)
})

test('learnProgress: points = 0 เมื่อข้ามวัน', () => {
  assert.deepEqual(learnProgress({ questDate: Y, learnPointsToday: 10 }, T),
    { points: 0, goal: LEARN_GOAL, done: false })
})

test('learnProgress: done true เมื่อถึงเป้าวันนี้', () => {
  assert.deepEqual(learnProgress({ questDate: T, learnPointsToday: LEARN_GOAL }, T),
    { points: LEARN_GOAL, goal: LEARN_GOAL, done: true })
})
```

- [ ] **Step 2: รันเทสให้เห็นว่า fail**

Run: `node --test src/utils/dailyQuest.test.js`
Expected: FAIL — `Cannot find module './dailyQuest.js'`

- [ ] **Step 3: เขียน implementation ขั้นต่ำ**

`src/utils/dailyQuest.js`:
```js
// ════════════════════════════════════════════════════════════
//  Daily learning quest — ทำแต้มเรียน (SRS review + quiz question)
//  ครบ LEARN_GOAL/วัน → ปลดตัวคูณรายได้ idle ×QUEST_MULTI จนถึง reset รายวัน
//  pure — ไม่พึ่ง Firestore/Vue (ทดสอบตรงด้วย `node --test`)
//
//  `today` = YYYY-MM-DD (caller ส่งเข้ามา) ใช้ key เดียวกับ quiz/studyCoinDate
//  → `new Date().toISOString().slice(0,10)` (UTC = reset ~07:00 ไทย ตาม convention เดิม)
// ════════════════════════════════════════════════════════════

export const LEARN_GOAL = 15     // แต้มเรียนต่อวันเพื่อปลดโบนัส
export const QUEST_MULTI = 1.25  // ตัวคูณรายได้ idle เมื่อ quest ครบ

/**
 * เพิ่มแต้มเรียน n แต้มสำหรับวัน `today`. คืน patch แบบ "ค่าสัมบูรณ์"
 * (ไม่ใช่ Firestore increment) ให้ caller เขียนผ่าน patchUser:
 *   - ข้ามวัน (questDate !== today) → reset เริ่มนับใหม่ที่ n
 *   - วันเดียวกัน → บวกสะสม
 */
export function addLearnPoints(userData, n, today) {
  const sameDay = userData?.questDate === today
  const base = sameDay ? (userData?.learnPointsToday || 0) : 0
  return { learnPointsToday: base + n, questDate: today }
}

/** quest ของวันนี้ทำครบหรือยัง */
export function questDone(userData, today) {
  return userData?.questDate === today && (userData?.learnPointsToday || 0) >= LEARN_GOAL
}

/** ตัวคูณรายได้ idle จาก quest (1 ถ้ายังไม่ครบ) */
export function questMultiplier(userData, today) {
  return questDone(userData, today) ? QUEST_MULTI : 1
}

/** ข้อมูลความคืบหน้าสำหรับ UI */
export function learnProgress(userData, today) {
  const points = userData?.questDate === today ? (userData?.learnPointsToday || 0) : 0
  return { points, goal: LEARN_GOAL, done: points >= LEARN_GOAL }
}
```

- [ ] **Step 4: รันเทสให้ผ่าน**

Run: `node --test src/utils/dailyQuest.test.js`
Expected: PASS — 9 tests pass

- [ ] **Step 5: commit**

```bash
git add src/utils/dailyQuest.js src/utils/dailyQuest.test.js
git commit -m "Economy: pure util dailyQuest (แต้มเรียน/เป้า/ตัวคูณ) + 9 เทส"
```

---

## Task 2: เพิ่ม 2 ฟิลด์ใน userSchema

**Files:**
- Modify: `src/data/userSchema.js:32` (ใน USER_DEFAULTS ต่อจาก studyCoinsToday)

- [ ] **Step 1: เพิ่มฟิลด์ใน USER_DEFAULTS**

ใน `src/data/userSchema.js` หลังบรรทัด `studyCoinsToday: 0,   // study coins earned today (capped)` เพิ่ม:
```js
  learnPointsToday: 0,  // แต้มเรียนวันนี้ (SRS review + quiz question) — daily quest
  questDate: '',        // YYYY-MM-DD ของแต้มล่าสุด (reuse key เดียวกับ quiz/studyCoinDate)
```

> ไม่ต้องแก้ `normalizeUserData` — primitive default ถูกเติมจาก `{ ...USER_DEFAULTS, ...data }` อยู่แล้ว · user เดิมที่ไม่มีฟิลด์ = อ่านเป็น 0/'' (questDate '' ≠ วันนี้ → quest ยังไม่ทำ ถูกต้อง)

- [ ] **Step 2: verify build**

Run: `npm run build`
Expected: build ผ่าน ไม่มี error

- [ ] **Step 3: commit**

```bash
git add src/data/userSchema.js
git commit -m "Economy: userSchema เพิ่ม learnPointsToday/questDate (daily quest)"
```

---

## Task 3: นับแต้มที่ SRS review (StudyView)

**Files:**
- Modify: `src/views/StudyView.vue` (import + ฟังก์ชัน `commit`, ~line 248-262)

- [ ] **Step 1: เพิ่ม import**

ในบล็อก `<script setup>` ของ `StudyView.vue` เพิ่ม import (ใกล้ import utils อื่น):
```js
import { addLearnPoints } from '../utils/dailyQuest.js'
```

- [ ] **Step 2: นับ +1 แต้มต่อการทบทวน 1 ครั้ง ใน `commit`**

แก้ฟังก์ชัน `commit` — เพิ่มแต้มทุกครั้งที่ commit (= ทบทวน 1 การ์ด). แทนที่ส่วนต้นของ `commit`:
```js
async function commit(newCards, reward, today, dailyTotal) {
  const newStudy = { ...study.value, cards: newCards, lastStudied: Date.now() }
  const lp = addLearnPoints(authStore.userData, 1, today)  // +1 แต้มเรียน/การทบทวน
  const optimistic = { study: newStudy, learnPointsToday: lp.learnPointsToday, questDate: lp.questDate }
  const patch = { study: newStudy, learnPointsToday: lp.learnPointsToday, questDate: lp.questDate }
  if (reward) {
    optimistic.coins = (authStore.userData?.coins || 0) + reward
    optimistic.studyCoinDate = today
    optimistic.studyCoinsToday = dailyTotal
    patch.coins = increment(reward)
    patch.studyCoinDate = today
    patch.studyCoinsToday = dailyTotal
  }
  const ok = await authStore.patchUser(optimistic, patch)
  if (!ok) toast('บันทึกการทบทวนไม่สำเร็จ', 'error')
}
```

> `today` ถูกส่งเข้า `commit` อยู่แล้ว (จาก `gradeCard`, ค่า = `new Date().toISOString().slice(0,10)`) · เขียนค่าสัมบูรณ์ (ไม่ใช่ increment) — แต้มสะสมข้ามการ์ดในเซสชันได้เพราะ optimistic state อัปเดต userData ก่อนการ์ดถัดไป (เหมือน studyCoinsToday)

- [ ] **Step 3: verify build**

Run: `npm run build`
Expected: build ผ่าน

- [ ] **Step 4: commit**

```bash
git add src/views/StudyView.vue
git commit -m "Economy: นับแต้มเรียน +1/การทบทวน SRS (StudyView)"
```

---

## Task 4: นับแต้มที่ quiz answer (QuizView)

**Files:**
- Modify: `src/views/QuizView.vue` (import + ฟังก์ชัน `finish`, ~line 280-319)

- [ ] **Step 1: เพิ่ม import**

ในบล็อก `<script setup>` ของ `QuizView.vue` เพิ่ม:
```js
import { addLearnPoints } from '../utils/dailyQuest.js'
```

- [ ] **Step 2: นับแต้ม = จำนวนข้อที่ตอบ ใน `finish`**

ในฟังก์ชัน `finish` แก้ส่วนเขียน user doc (ขั้นที่ 2). หลังบรรทัด `const newHigh = Math.max(...)` เพิ่มการคำนวณแต้ม แล้วใส่ลงทั้ง optimistic + patch:
```js
  // 2) update the user doc: coins + best score + daily cap + แต้มเรียน
  const newHigh = Math.max(authStore.userData?.quizHigh || 0, correct.value)
  const lp = addLearnPoints(authStore.userData, answered.value, today)  // +1/ข้อที่ตอบ
  await authStore.patchUser(
    {
      coins: (authStore.userData?.coins || 0) + grant,
      quizHigh: newHigh, quizCoinDate: today, quizCoinsToday: earnedToday + grant,
      learnPointsToday: lp.learnPointsToday, questDate: lp.questDate,
    },
    {
      ...(grant ? { coins: increment(grant) } : {}),
      quizHigh: newHigh, quizCoinDate: today, quizCoinsToday: earnedToday + grant,
      learnPointsToday: lp.learnPointsToday, questDate: lp.questDate,
    },
  )
```

> `answered.value` = จำนวนข้อที่ตอบใน run นี้ (เพิ่มที่ line 261 ทุกครั้งที่ตอบ) · `today` คำนวณไว้แล้วต้นฟังก์ชัน `finish`

- [ ] **Step 3: verify build**

Run: `npm run build`
Expected: build ผ่าน

- [ ] **Step 4: commit**

```bash
git add src/views/QuizView.vue
git commit -m "Economy: นับแต้มเรียน +1/ข้อที่ตอบ (QuizView)"
```

---

## Task 5: คูณตัวคูณ ×1.25 เข้า idle income (useDaily)

**Files:**
- Modify: `src/composables/useDaily.js` (import + ratePerDay + return, ~line 6, 28-29)

- [ ] **Step 1: เพิ่ม import**

ต้นไฟล์ `useDaily.js` เพิ่ม:
```js
import { questMultiplier, questDone } from '../utils/dailyQuest.js'
```

- [ ] **Step 2: คูณ questMulti เข้า ratePerDay + expose สถานะ**

แทนที่บล็อกคำนวณ rate (ใกล้บรรทัด `const ratePerDay = ...`):
```js
  const bonusPct   = computed(() => auth.incomeBonusPct)
  const questMulti = computed(() => questMultiplier(auth.userData, new Date().toISOString().slice(0, 10)))
  const questActive = computed(() => questDone(auth.userData, new Date().toISOString().slice(0, 10)))
  const ratePerDay = computed(() => Math.round(
    (baseIncome.value + petIncome.value)
    * (1 + bonusPct.value / 100)  // supporter bonus (เดิม)
    * questMulti.value            // daily quest ×1.25 (ใหม่) — ครอบบ้าน+เพ็ท ไม่ครอบฟาร์ม
  ))
```

- [ ] **Step 3: เพิ่ม questActive ใน return**

ในออบเจกต์ที่ `useDaily` return เพิ่ม `questActive` (ให้ DailyCard/หน้าอื่นโชว์ป้ายโบนัสได้):
```js
  return {
    baseIncome, petIncome, bonusPct, ratePerDay, ratePerHour,
    accrued, fillPct, isFull, remainingMs, claim, questActive,
  }
```

- [ ] **Step 4: verify build**

Run: `npm run build`
Expected: build ผ่าน

- [ ] **Step 5: commit**

```bash
git add src/composables/useDaily.js
git commit -m "Economy: useDaily คูณ ×1.25 จาก daily quest เข้า idle income"
```

---

## Task 6: การ์ด Daily Quest บน Home (UI)

**Files:**
- Create: `src/components/home/QuestCard.vue`
- Modify: `src/views/HomeView.vue` (import + วางใต้ `<DailyCard />`)

- [ ] **Step 1: สร้าง QuestCard.vue**

`src/components/home/QuestCard.vue`:
```vue
<template>
  <div class="quest" :class="{ done: prog.done }">
    <div class="quest-head">
      <span class="quest-title"><Emoji char="🎯" /> ภารกิจเรียนรู้วันนี้</span>
      <span class="quest-multi" :class="{ on: prog.done }">รายได้ ×1.25</span>
    </div>
    <div class="quest-bar"><div class="quest-fill" :style="{ width: pct + '%' }"></div></div>
    <div class="quest-msg">
      <template v-if="prog.done">ปลดโบนัสรายได้ ×1.25 แล้ววันนี้ <Emoji char="✅" /></template>
      <template v-else>อีก {{ prog.goal - prog.points }} แต้ม ({{ prog.points }}/{{ prog.goal }}) — ทบทวน SRS หรือทำข้อสอบเพื่อปลดโบนัสรายได้ ×1.25</template>
    </div>
    <div v-if="!prog.done" class="quest-links">
      <RouterLink to="/study" class="quest-link"><Emoji char="📚" /> ทบทวน</RouterLink>
      <RouterLink to="/quiz" class="quest-link"><Emoji char="📝" /> ทำข้อสอบ</RouterLink>
    </div>
  </div>
</template>

<script setup>
import Emoji from '../shared/Emoji.vue'
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '../../stores/auth.js'
import { learnProgress } from '../../utils/dailyQuest.js'

const auth = useAuthStore()
const prog = computed(() => learnProgress(auth.userData, new Date().toISOString().slice(0, 10)))
const pct  = computed(() => Math.min(100, Math.round((prog.value.points / prog.value.goal) * 100)))
</script>

<style scoped>
.quest { background: #fff; border: 2px solid var(--ink); border-radius: 18px; padding: 14px; margin-bottom: 14px; box-shadow: var(--pop); }
.quest.done { background: #eafaf1; }
.quest-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
.quest-title { font-weight: 800; font-size: .9rem; color: var(--ink); }
.quest-multi { font-size: .62rem; font-weight: 800; padding: 3px 9px; border-radius: 999px; background: rgba(0,0,0,.06); color: rgba(0,0,0,.45); }
.quest-multi.on { background: rgba(34,197,94,.18); color: #15803d; }
.quest-bar { height: 8px; background: rgba(0,0,0,.08); border-radius: 999px; overflow: hidden; margin-bottom: 8px; }
.quest-fill { height: 100%; background: linear-gradient(90deg,#84cc16,#22c55e); transition: width .3s; }
.quest-msg { font-size: .72rem; color: rgba(0,0,0,.6); line-height: 1.4; }
.quest-links { display: flex; gap: 8px; margin-top: 10px; }
.quest-link { flex: 1; text-align: center; text-decoration: none; font-size: .74rem; font-weight: 700; color: var(--ink); border: 1.5px solid var(--ink); border-radius: 10px; padding: 7px 0; background: #fff; }
.quest-link:active { transform: translate(1px,1px); }
</style>
```

- [ ] **Step 2: วาง QuestCard ใน HomeView**

ใน `src/views/HomeView.vue` เพิ่ม import:
```js
import QuestCard from '../components/home/QuestCard.vue'
```
แล้ววาง `<QuestCard />` ต่อจาก `<DailyCard />` (ใน block `v-if="authStore.isLoggedIn"`):
```html
      <!-- เหรียญ + รับรายได้รายวัน (ส่วนตัว เห็นเฉพาะเจ้าของ) -->
      <DailyCard />
      <!-- ภารกิจเรียนรู้รายวัน → ปลดรายได้ ×1.25 -->
      <QuestCard />
      <!-- กล่องจดหมาย (รางวัล/ประกาศ) -->
      <MailboxCard />
```

- [ ] **Step 3: verify build**

Run: `npm run build`
Expected: build ผ่าน

- [ ] **Step 4: commit**

```bash
git add src/components/home/QuestCard.vue src/views/HomeView.vue
git commit -m "Economy: การ์ดภารกิจเรียนรู้รายวันบน Home (progress + สถานะ ×1.25)"
```

---

## Task 7: Farm rebalance (sim → margin-scale)

**Files:**
- Create: `scripts/farm-balance-sim.mjs`
- Modify: `src/data/crops.js` (เฉพาะค่า `sellPrice` ตามผล sim)

- [ ] **Step 1: สร้าง sim script**

`scripts/farm-balance-sim.mjs`:
```js
// node scripts/farm-balance-sim.mjs
// คำนวณ sellPrice ใหม่แบบ margin-scale ให้ฟาร์มเต็ม ≈ TARGET_RATIO × รายได้บ้าน ที่ระดับปลดล็อก
// โมเดล: นับ profit/วัน/แปลง = (sell-seed)/growDays · เต็มแปลง = ×plots(unlockLevel)
//        nerf เฉพาะพืชที่เกินเป้า (ไม่ buff พืชอ่อน) · newSell = seed + newMargin (ปัดลงใกล้ 10)
import { CROPS } from '../src/data/crops.js'
import { RESIDENCE_TIERS } from '../src/data/residence.js'

const TARGET_RATIO = 1.25  // ฟาร์มเต็ม ≈ 1.25× บ้าน (อยู่ในช่วงเป้า 1–1.5×)
const tier = (lv) => RESIDENCE_TIERS[Math.min(lv, 12) - 1]
const round10 = (n) => Math.max(1, Math.round(n / 10) * 10)

console.log('id            grow(d)  oldSell  newSell  oldRatio newRatio')
const out = []
for (const c of CROPS) {
  const t = tier(c.unlockLevel)
  const growDays = c.growMinutes / 1440
  const curPerDayPerPlot = (c.sellPrice - c.seedCost) / growDays
  const curFull = curPerDayPerPlot * t.plots
  const curRatio = curFull / t.dailyIncome
  const targetPerDayPerPlot = (TARGET_RATIO * t.dailyIncome) / t.plots
  const newPerDayPerPlot = Math.min(curPerDayPerPlot, targetPerDayPerPlot) // nerf only
  const newMargin = newPerDayPerPlot * growDays
  const newSell = round10(c.seedCost + newMargin)
  const newRatio = ((newSell - c.seedCost) / growDays * t.plots) / t.dailyIncome
  out.push({ id: c.id, sellPrice: newSell })
  console.log(
    `${c.id.padEnd(13)} ${growDays.toFixed(2).padStart(6)} ${String(c.sellPrice).padStart(8)} ` +
    `${String(newSell).padStart(8)} ${curRatio.toFixed(2).padStart(8)} ${newRatio.toFixed(2).padStart(8)}`
  )
}
console.log('\n// sellPrice ใหม่ (paste ลง crops.js):')
console.log(out.map(o => `${o.id}: ${o.sellPrice}`).join('\n'))
```

- [ ] **Step 2: รัน sim ดูผล**

Run: `node scripts/farm-balance-sim.mjs`
Expected: ตารางพิมพ์ออก — คอลัมน์ `newRatio` ของพืชที่เคยเกิน ควรลงมา ~1.25, พืชที่ต่ำกว่าเป้าอยู่แล้ว `newSell` = `oldSell` (ไม่เปลี่ยน) · ตรวจว่าไม่มี newSell ≤ seedCost (ต้องกำไรบวก)

- [ ] **Step 3: ตรวจ + ปรับ TARGET_RATIO ถ้าต้องการ**

ถ้าอยากให้ฟาร์มแรง/อ่อนกว่านี้ ปรับ `TARGET_RATIO` (1.0–1.5) แล้วรันซ้ำ · เคาะค่าที่พอใจ (ค่าเริ่ม 1.25)

- [ ] **Step 4: นำ sellPrice ใหม่ไปใส่ crops.js**

แก้เฉพาะ field `sellPrice` ของแต่ละพืชใน `src/data/crops.js` ตามบล็อกที่ sim พิมพ์ (ไม่แตะ `seedCost`/`growMinutes`/`unlockLevel`/`tier`)

- [ ] **Step 5: verify build + sanity**

Run: `npm run build`
Expected: build ผ่าน
ตรวจตา: ทุกพืช `sellPrice > seedCost`

- [ ] **Step 6: commit**

```bash
git add scripts/farm-balance-sim.mjs src/data/crops.js
git commit -m "Economy: cut margin ฟาร์ม (margin-scale sim) → ฟาร์มเต็ม ~1.25x บ้าน"
```

---

## Task 8: Verify รวม + ทดลอง dev

- [ ] **Step 1: รันเทส pure ทั้งหมดที่เกี่ยว**

Run: `node --test src/utils/dailyQuest.test.js`
Expected: PASS ครบ

- [ ] **Step 2: build สุดท้าย**

Run: `npm run build`
Expected: build ผ่าน ไม่มี error/warning ใหม่

- [ ] **Step 3: ทดลอง dev (manual)**

Run: `npm run dev` แล้วเช็ก:
- Home มีการ์ด "ภารกิจเรียนรู้วันนี้" progress 0/15
- ทำข้อสอบ ≥... หรือทบทวน SRS → แต้มเพิ่ม → ครบ 15 การ์ดขึ้น "ปลดโบนัส ×1.25" + การ์ดเก็บรายได้ (DailyCard) แสดง rate สูงขึ้น
- ฟาร์ม: ราคาขายพืชลดลงตามคาด (เทียบ ROADMAP ตารางเดิม)

> ไม่ deploy ใน plan นี้ — build เป็น post-launch (ดู header)

---

## หมายเหตุ migration / ความเสี่ยง

- ฟิลด์ใหม่ default ผ่าน `USER_DEFAULTS` → user เดิมไม่ต้อง migrate
- ไม่แตะ `firestore.rules` (ฟิลด์ใหม่อยู่ใต้ patchUser เดิม, coin range rule ครอบ)
- Farm nerf = ลดรายได้ผู้เล่นปัจจุบัน → ตอนลงมือจริงพิจารณา grandfather/คืนส่วนต่าง + ประกาศล่วงหน้า
- boundary reset ~07:00 ไทย (reuse key เดิม) — รับรู้ไว้ ไม่ใช่บั๊ก
