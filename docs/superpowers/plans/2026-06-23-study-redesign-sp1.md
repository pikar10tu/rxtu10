# Study Redesign SP1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** จัด IA หน้า Study (ข้อสอบบน/flashcard ล่าง) + ฮับเลือกโหมด + Zen mode + เศรษฐกิจข้อสอบใหม่ (100/ข้อ เพดานตามบ้าน)

**Architecture:** frontend + reward ล้วน ไม่มี backend ใหม่. แยก reward เป็น pure util `quizReward.js` (เทสได้). Zen reuse quiz engine เดิมใน QuizView โดยเพิ่ม variant + batch-load. StudyView ใช้การ์ดโหมด presentational `QuizModeCard.vue` ซ้ำ 4 ใบ (2 ใบ comingSoon).

**Tech Stack:** Vue 3 + Pinia + Firestore (modular SDK) · `node --test` สำหรับ pure util

## Global Constraints

- ไม่มี Firestore collection/rules/index/schema/migration ใหม่ (Daily Challenge/Time Attack/leaderboard = SP2/SP3)
- โหมด Daily Challenge + Time Attack ใน SP1 = การ์ด `comingSoon` กดไม่ได้จริง (ใช้ `<div>` ไม่ใช่ RouterLink) badge "เร็วๆ นี้"
- เศรษฐกิจ: `QUIZ_COIN_PER_CORRECT = 100`, `QUIZ_DAILY_CAP_FLOOR = 1000`, เพดาน/วัน = `max(floor, residenceDailyIncome(level))`
- Zen + ทั่วไป **แชร์เพดานรวม** ผ่าน `quizCoinDate`/`quizCoinsToday` เดิม
- Zen นับเหมือนทั่วไป: `quizDoneTotal`, `bumpDailyQuest('quiz',…)`, `questionStats/{qid}` increment, เขียน `examSessions`
- emoji ในเทมเพลตใช้ `<Emoji char="…" />` เท่านั้น (กัน tofu) — ห้าม emoji ดิบใน text node
- `usage.track(reads, writes)` หลัง getDocs/เขียน (Phase 3 usage meter)
- คอมเมนต์/commit ไทยปนอังกฤษ · commit format `Area: อะไร (ทำไม)`
- Zen batch = 15 ข้อ, โหลดต่อเมื่อเหลือ ≤ 2

---

### Task 1: utils/quizReward.js (pure + เทส)

**Files:**
- Create: `src/utils/quizReward.js`
- Test: `src/utils/quizReward.test.js`

**Interfaces:**
- Consumes: `residenceDailyIncome(level)` จาก `../data/residence.js` (pure, clamp level อยู่แล้ว)
- Produces:
  - `quizDailyCap(level, floor) → int` = `Math.max(floor, residenceDailyIncome(level))`
  - `quizGrant(correct, earnedToday, cap, perCorrect) → int` = `Math.max(0, Math.min(correct*perCorrect, cap-earnedToday))`

- [ ] **Step 1: เขียนเทสที่ยังล้มเหลว**

`src/utils/quizReward.test.js`:
```js
// เทส quizReward — pure logic เหรียญข้อสอบ (SP1: 100/ข้อ เพดานตามบ้าน)
// รัน: node --test src/utils/quizReward.test.js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { quizDailyCap, quizGrant } from './quizReward.js'

test('quizDailyCap: บ้านเล็ก (Lv1 income 300) < พื้น → ใช้พื้น', () => {
  assert.equal(quizDailyCap(1, 1000), 1000)
})
test('quizDailyCap: บ้านใหญ่ (Lv15 income 140000) → ใช้รายได้บ้าน', () => {
  assert.equal(quizDailyCap(15, 1000), 140000)
})
test('quizDailyCap: level หาย/undefined → clamp Lv1 → ใช้พื้น', () => {
  assert.equal(quizDailyCap(undefined, 1000), 1000)
})
test('quizGrant: คูณ perCorrect ภายในเพดาน', () => {
  assert.equal(quizGrant(3, 0, 1000, 100), 300)
})
test('quizGrant: เกินเพดานที่เหลือ → clamp', () => {
  assert.equal(quizGrant(20, 0, 1000, 100), 1000)   // 2000 → 1000
  assert.equal(quizGrant(5, 800, 1000, 100), 200)   // เหลือ 200
})
test('quizGrant: เต็มเพดานแล้ว → 0 (ไม่ติดลบ)', () => {
  assert.equal(quizGrant(5, 1000, 1000, 100), 0)
  assert.equal(quizGrant(5, 1200, 1000, 100), 0)
})
```

- [ ] **Step 2: รันเทสให้เห็นว่าล้มเหลว**

Run: `node --test src/utils/quizReward.test.js`
Expected: FAIL — `Cannot find module './quizReward.js'`

- [ ] **Step 3: เขียน implementation**

`src/utils/quizReward.js`:
```js
// เหรียญข้อสอบ (SP1) — pure logic · เพดาน/วัน ผูกกับเลเวลบ้าน
import { residenceDailyIncome } from '../data/residence.js'

// เพดานเหรียญข้อสอบต่อวัน = มากสุดระหว่างพื้น กับ รายได้บ้าน/วัน ของเลเวลนั้น
export function quizDailyCap(level, floor) {
  return Math.max(floor, residenceDailyIncome(level))
}

// เหรียญที่ได้รอบนี้ (clamp 0..เพดานที่เหลือ)
export function quizGrant(correct, earnedToday, cap, perCorrect) {
  return Math.max(0, Math.min(correct * perCorrect, cap - earnedToday))
}
```

- [ ] **Step 4: รันเทสให้ผ่าน**

Run: `node --test src/utils/quizReward.test.js`
Expected: PASS — 6 เทสผ่าน

- [ ] **Step 5: commit**

```bash
git add src/utils/quizReward.js src/utils/quizReward.test.js
git commit -m "Util: quizReward (quizDailyCap/quizGrant pure + เทส) — SP1 เศรษฐกิจข้อสอบใหม่"
```

---

### Task 2: tunable pins ใน data/index.js

**Files:**
- Modify: `src/data/index.js` (เพิ่มท้ายไฟล์)

**Interfaces:**
- Produces: `QUIZ_COIN_PER_CORRECT = 100`, `QUIZ_DAILY_CAP_FLOOR = 1000` (export const)

- [ ] **Step 1: เพิ่ม constants**

ต่อท้าย `src/data/index.js`:
```js
// ── QUIZ ECONOMY (SP1) — เหรียญข้อสอบ (ใช้ใน QuizView โหมดทั่วไป + Zen) ──
// tunable pin: ปรับที่นี่ที่เดียว · เพดาน/วันคำนวณใน utils/quizReward.js
export const QUIZ_COIN_PER_CORRECT = 100;  // เหรียญต่อข้อที่ตอบถูก (เดิม 10)
export const QUIZ_DAILY_CAP_FLOOR  = 1000; // พื้นเพดาน/วัน (บ้านเล็กไม่ตันเกินไป)
```

- [ ] **Step 2: ตรวจ build**

Run: `npm run build`
Expected: build สำเร็จ (exit 0)

- [ ] **Step 3: commit**

```bash
git add src/data/index.js
git commit -m "Data: pin เศรษฐกิจข้อสอบ (COIN_PER_CORRECT 100 / CAP_FLOOR 1000) — SP1"
```

---

### Task 3: QuizView ใช้เศรษฐกิจใหม่

**Files:**
- Modify: `src/views/QuizView.vue` (import; ลบ const เดิม line 160-161; `finish()` reward block ~351-356; hint text line 37)

**Interfaces:**
- Consumes: `quizDailyCap`, `quizGrant` (Task 1) · `QUIZ_COIN_PER_CORRECT`, `QUIZ_DAILY_CAP_FLOOR` (Task 2)
- Produces: (พฤติกรรม reward ใหม่ — Task 4 reuse `finish()` ต่อ)

- [ ] **Step 1: import util + pins**

ใน `<script setup>` เพิ่ม (ใกล้ import utils อื่น):
```js
import { quizDailyCap, quizGrant } from '../utils/quizReward.js'
import { QUIZ_COIN_PER_CORRECT, QUIZ_DAILY_CAP_FLOOR } from '../data/index.js'
```

- [ ] **Step 2: ลบ const เดิมที่ไม่ใช้แล้ว**

ลบ 2 บรรทัด (line ~160-161):
```js
const DAILY_CAP = 300
const COIN_PER_CORRECT = 10
```

- [ ] **Step 3: แก้ reward block ใน finish()**

แทนบล็อก (line ~352-356):
```js
  const today = new Date().toISOString().slice(0, 10)
  const earnedToday = authStore.userData?.quizCoinDate === today ? (authStore.userData?.quizCoinsToday || 0) : 0
  const reward = correct.value * COIN_PER_CORRECT
  const grant = Math.max(0, Math.min(reward, DAILY_CAP - earnedToday))
  coinsEarned.value = grant
```
ด้วย:
```js
  const today = new Date().toISOString().slice(0, 10)
  const earnedToday = authStore.userData?.quizCoinDate === today ? (authStore.userData?.quizCoinsToday || 0) : 0
  const level = authStore.userData?.residence?.level || 1
  const cap = quizDailyCap(level, QUIZ_DAILY_CAP_FLOOR)
  const grant = quizGrant(correct.value, earnedToday, cap, QUIZ_COIN_PER_CORRECT)
  coinsEarned.value = grant
```

- [ ] **Step 4: แก้ hint text หน้า home**

แทน (line ~37):
```html
        <div class="qv-hint">ทำข้อสอบได้เหรียญ +10/ข้อที่ถูก (สูงสุด {{ DAILY_CAP }}<Emoji char="🪙" />/วัน)</div>
```
ด้วย:
```html
        <div class="qv-hint">ทำข้อสอบได้เหรียญ +{{ QUIZ_COIN_PER_CORRECT }}/ข้อที่ถูก · เพดานตามเลเวลบ้าน (ขั้นต่ำ {{ QUIZ_DAILY_CAP_FLOOR.toLocaleString() }}<Emoji char="🪙" />/วัน)</div>
```

- [ ] **Step 5: ตรวจ build**

Run: `npm run build`
Expected: build สำเร็จ (exit 0) — ยืนยันไม่เหลือ reference ของ `DAILY_CAP`/`COIN_PER_CORRECT`

- [ ] **Step 6: commit**

```bash
git add src/views/QuizView.vue
git commit -m "Quiz: เศรษฐกิจใหม่ 100/ข้อ เพดานตามเลเวลบ้าน (max floor, รายได้บ้าน) — SP1"
```

---

### Task 4: QuizView Zen mode

**Files:**
- Modify: `src/views/QuizView.vue` (script: เพิ่ม variant/sessionTotal/fetchQuestions/startZen/loadMoreZen, แก้ start/next/finish/onMounted, ปรับ pct; template: bar row + result; style: qv-zen-tag)

**Interfaces:**
- Consumes: `route.query.mode` (useRoute มีแล้ว) · `quizSample`, `shuffle`, `shuffleChoices`, `fetchQuestions` (ใหม่) · `finish()` reward จาก Task 3
- Produces: (โหมดใหม่ — ปลายทาง ไม่มี downstream)

- [ ] **Step 1: เพิ่ม state + sessionTotal + ปรับ pct**

หลัง `const answers = ref([])` (line ~207) เพิ่ม:
```js
const ZEN_BATCH = 15
const variant = ref('normal')   // 'normal' | 'zen'
const sessionTotal = computed(() => variant.value === 'zen' ? answered.value : quiz.value.length)
```
แก้ `pct` (line ~271) ให้ใช้ sessionTotal:
```js
const pct = computed(() => sessionTotal.value ? Math.round((correct.value / sessionTotal.value) * 100) : 0)
```

- [ ] **Step 2: แยก fetchQuestions ออกมา + ให้ start() เรียกใช้**

หลัง `const starting = ref(false)` (line ~291) เพิ่มฟังก์ชันดึงข้อ (ย้าย logic จาก start เดิมมาใช้ร่วม):
```js
// ดึงข้อสุ่ม n ข้อ (windowed orderBy rand + wrap) — ใช้ร่วมทั้งโหมดทั่วไปและ Zen
async function fetchQuestions(n) {
  const R = Math.random()
  const base = [where('isPublished', '==', true)]
  if (dom.value !== '__all') base.push(where('domain', '==', dom.value))
  const col = collection(db, 'questions')
  const firstSnap = await getDocs(query(col, ...base, orderBy('rand'), startAt(R), limit(n)))
  usage.track(firstSnap.size)
  const first = firstSnap.docs.map(d => ({ id: d.id, ...d.data() }))
  let wrap = []
  if (first.length < n) {
    const wrapSnap = await getDocs(query(col, ...base, orderBy('rand'), limit(n)))
    usage.track(wrapSnap.size)
    wrap = wrapSnap.docs.map(d => ({ id: d.id, ...d.data() }))
  }
  return quizSample(first, wrap, n).filter(q => Array.isArray(q.choices) && q.choices.length >= 2)
}
```
แก้ `start()` ให้ใช้ fetchQuestions แทน inline fetch (แทน body ใน try):
```js
async function start() {
  if (starting.value) return
  starting.value = true
  variant.value = 'normal'
  try {
    const picks = await fetchQuestions(len.value)
    quiz.value = shuffle(picks).map(shuffleChoices)
    idx.value = 0; resetRound()
    if (quiz.value.length) mode.value = 'quiz'
    else toast('ยังไม่มีข้อสอบในหมวดนี้', 'error')
  } catch (e) {
    console.error('[quiz start]', e); toast('เริ่มข้อสอบไม่สำเร็จ', 'error')
  } finally { starting.value = false }
}
```

- [ ] **Step 3: เพิ่ม startZen + loadMoreZen**

ต่อจาก `start()`:
```js
// Zen — ทำต่อเนื่องไม่จำกัด ทุกหมวด จนกดออก
async function startZen() {
  if (starting.value) return
  starting.value = true
  variant.value = 'zen'
  dom.value = '__all'
  try {
    const picks = await fetchQuestions(ZEN_BATCH)
    quiz.value = shuffle(picks).map(shuffleChoices)
    idx.value = 0; resetRound()
    if (quiz.value.length) mode.value = 'quiz'
    else { toast('ยังไม่มีข้อสอบให้ทำ', 'error'); mode.value = 'home' }
  } catch (e) {
    console.error('[zen start]', e); toast('เริ่ม Zen ไม่สำเร็จ', 'error'); mode.value = 'home'
  } finally { starting.value = false }
}
// โหลดข้อเพิ่มต่อท้ายเมื่อใกล้หมด batch
async function loadMoreZen() {
  try {
    const more = await fetchQuestions(ZEN_BATCH)
    if (more.length) quiz.value = [...quiz.value, ...shuffle(more).map(shuffleChoices)]
  } catch (e) { console.error('[zen more]', e) }
}
```

- [ ] **Step 4: แก้ next() ให้รองรับ Zen (async)**

แทน `next()` (line ~339-343):
```js
async function next() {
  resetReport()
  if (variant.value === 'zen') {
    if (idx.value + 1 >= quiz.value.length - 2) await loadMoreZen()   // ใกล้หมด → เติม
    if (idx.value + 1 < quiz.value.length) { idx.value++; picked.value = null }
    else finish()   // คลังหมดจริง → จบนุ่มนวล
    return
  }
  if (idx.value + 1 < quiz.value.length) { idx.value++; picked.value = null }
  else finish()
}
```

- [ ] **Step 5: แก้ finish() ให้ examSessions total = sessionTotal**

ใน `finish()` แก้ field `total` ของ `addDoc(collection(db, 'examSessions'), {...})` จาก:
```js
      total: quiz.value.length,
```
เป็น:
```js
      total: sessionTotal.value,
```

- [ ] **Step 6: แก้ onMounted ให้เริ่ม Zen เมื่อ ?mode=zen**

แทน `onMounted(...)` (line ~185-189):
```js
onMounted(() => {
  if (!authStore.isLoggedIn) return
  load()
  if (route.query.mode === 'zen') startZen()
  else if (route.query.view === 'history') openHistory()
})
```

- [ ] **Step 7: เพิ่ม backToHome + แก้ template bar row และ result**

หลัง `function quit()` เพิ่ม:
```js
function backToHome() { variant.value = 'normal'; mode.value = 'home' }
```
แก้ bar row (line ~43-47):
```html
      <div class="qv-bar-row">
        <button class="qv-quit" aria-label="ออกจากการทำข้อสอบ" @click="quit">✕</button>
        <div v-if="variant === 'normal'" class="qv-bar"><div class="qv-fill" :style="{ width: progress + '%' }"></div></div>
        <div v-else class="qv-zen-tag"><Emoji char="♾️" /> Zen</div>
        <span class="qv-count">{{ variant === 'zen' ? `ข้อที่ ${idx + 1}` : `${idx + 1}/${quiz.length}` }}</span>
      </div>
```
แก้ result score line (line ~96):
```html
        <div class="qv-result-score">{{ correct }}<span>/{{ sessionTotal }}</span></div>
```
แก้ปุ่ม "ทำชุดใหม่" ใน result (line ~100) ให้รีเซ็ต variant:
```html
        <button class="qv-start" @click="backToHome">ทำชุดใหม่</button>
```

- [ ] **Step 8: เพิ่ม style qv-zen-tag**

ใน `<style scoped>` ใกล้ `.qv-bar` เพิ่ม:
```css
.qv-zen-tag { flex: 1; display: flex; align-items: center; gap: 5px; font-size: .8rem; font-weight: 800; color: var(--primary); }
```

- [ ] **Step 9: ตรวจ build**

Run: `npm run build`
Expected: build สำเร็จ (exit 0)

- [ ] **Step 10: commit**

```bash
git add src/views/QuizView.vue
git commit -m "Quiz: Zen mode (?mode=zen) ทำต่อเนื่อง batch-load · จบเมื่อกดออก — SP1"
```

---

### Task 5: QuizModeCard.vue (การ์ดโหมด presentational)

**Files:**
- Create: `src/components/study/QuizModeCard.vue`

**Interfaces:**
- Consumes: `Emoji` component, `RouterLink` (global)
- Produces: `<QuizModeCard emoji title subtitle :to="path|null" :coming-soon="bool" />` — ใช้ใน StudyView (Task 6)

- [ ] **Step 1: สร้าง component**

`src/components/study/QuizModeCard.vue`:
```vue
<template>
  <component :is="comingSoon ? 'div' : 'RouterLink'" :to="comingSoon ? undefined : to"
    class="qmc" :class="{ soon: comingSoon }" :aria-disabled="comingSoon ? 'true' : undefined">
    <span class="qmc-emoji"><Emoji :char="emoji" /></span>
    <span class="qmc-text">
      <b>{{ title }}</b>
      <small>{{ subtitle }}</small>
    </span>
    <span v-if="comingSoon" class="qmc-soon">เร็วๆ นี้</span>
    <span v-else class="qmc-go">›</span>
  </component>
</template>

<script setup>
import Emoji from '../shared/Emoji.vue'
defineProps({
  emoji:      { type: String, required: true },
  title:      { type: String, required: true },
  subtitle:   { type: String, default: '' },
  to:         { type: String, default: null },
  comingSoon: { type: Boolean, default: false },
})
</script>

<style scoped>
.qmc { display: flex; align-items: center; gap: 12px; padding: 14px; border-radius: 16px; background: var(--primary-light); border: 2px solid var(--ink); box-shadow: var(--pop); text-decoration: none; transition: transform .12s, box-shadow .12s; }
.qmc:not(.soon):active { transform: translate(2px,2px); box-shadow: 0 0 0 var(--ink); }
.qmc.soon { background: #f1f5f9; border-color: #94a3b8; box-shadow: none; opacity: .75; cursor: default; }
.qmc-emoji { font-size: 1.6rem; flex-shrink: 0; }
.qmc-text { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.qmc-text b { font-size: .9rem; color: #3730a3; }
.qmc-text small { font-size: .66rem; color: #6366f1; }
.qmc.soon .qmc-text b { color: #475569; }
.qmc.soon .qmc-text small { color: #64748b; }
.qmc-go { font-size: 1.4rem; color: #6366f1; flex-shrink: 0; }
.qmc-soon { font-size: .6rem; font-weight: 800; color: #fff; background: #94a3b8; padding: 2px 8px; border-radius: 999px; flex-shrink: 0; }
</style>
```

- [ ] **Step 2: ตรวจ build**

Run: `npm run build`
Expected: build สำเร็จ (exit 0)

- [ ] **Step 3: commit**

```bash
git add src/components/study/QuizModeCard.vue
git commit -m "Study: QuizModeCard component (การ์ดเลือกโหมด รองรับ comingSoon) — SP1"
```

---

### Task 6: StudyView restructure (ข้อสอบบน / flashcard ล่าง + ฮับโหมด)

**Files:**
- Modify: `src/views/StudyView.vue` (import QuizModeCard; แทน home block line 16-57; เพิ่ม style; retitle header)

**Interfaces:**
- Consumes: `QuizModeCard` (Task 5) · state เดิม (dueCount/newCount/.../queueSize/startSession/COIN_PER_CARD/STUDY_DAILY_CAP) ไม่เปลี่ยน
- Produces: (UI ปลายทาง)

- [ ] **Step 1: import QuizModeCard**

ใน `<script setup>` เพิ่ม (ใกล้ import component อื่น):
```js
import QuizModeCard from '../components/study/QuizModeCard.vue'
```

- [ ] **Step 2: retitle header**

แทน (line ~5, 8):
```html
        <div class="sv-title"><Emoji char="📚" /> ทบทวนกลุ่มยา</div>
```
และ
```html
      <div class="sv-sub">Flashcard แบบ spaced repetition · {{ DECK.length }} ตัวยา</div>
```
ด้วย:
```html
        <div class="sv-title"><Emoji char="📚" /> เตรียมสอบ</div>
```
และ
```html
      <div class="sv-sub">ทำข้อสอบ + ทบทวนกลุ่มยา ({{ DECK.length }} ตัวยา)</div>
```

- [ ] **Step 3: แทน home block ทั้งก้อน (line 16-57)**

แทน `<template v-else-if="mode === 'home'"> … </template>` ทั้งบล็อกด้วย:
```html
    <!-- ── HOME ── -->
    <template v-else-if="mode === 'home'">
      <!-- นับถอยหลังสู่วันสอบ (data-driven: data/exams.js) -->
      <ExamCountdown />

      <!-- ── ส่วนทำข้อสอบ (ฮับโหมด) ── -->
      <div class="sv-section-title"><Emoji char="📝" /> ทำข้อสอบ</div>
      <div class="sv-modes">
        <QuizModeCard emoji="🗓️" title="ข้อสอบประจำวัน" subtitle="ชุดเดียวกันทั้งรุ่น 3 ข้อ แข่งเก็บคะแนน" coming-soon />
        <QuizModeCard emoji="📝" title="ทั่วไป" subtitle="เลือกหมวด + จำนวนข้อ (5/10/15/20) ได้เหรียญ" to="/quiz" />
        <QuizModeCard emoji="♾️" title="Zen" subtitle="ทำเรื่อยๆ ไม่จำกัด ฝึกจนพอใจ" to="/quiz?mode=zen" />
        <QuizModeCard emoji="⏱️" title="Time Attack" subtitle="แข่งกับเวลา 4 / 15 นาที" coming-soon />
      </div>

      <!-- ── ส่วนทบทวน flashcard ── -->
      <div class="sv-section-title sv-section-flash"><Emoji char="📚" /> ทบทวน flashcard</div>
      <div class="sv-stats">
        <div class="sv-stat due"><span class="sv-stat-n">{{ dueCount }}</span><span class="sv-stat-l">ครบกำหนด</span></div>
        <div class="sv-stat new"><span class="sv-stat-n">{{ newCount }}</span><span class="sv-stat-l">ยังไม่เคยเรียน</span></div>
        <div class="sv-stat mast"><span class="sv-stat-n">{{ masteredCount }}</span><span class="sv-stat-l">แม่นแล้ว</span></div>
      </div>

      <div class="sv-progress">
        <div class="sv-progress-bar"><div class="sv-progress-fill" :style="{ width: seenPct + '%' }"></div></div>
        <div class="sv-progress-txt">เรียนไปแล้ว {{ seenCount }}/{{ DECK.length }} ตัว</div>
      </div>

      <button class="sv-start" :disabled="!queueSize" @click="startSession">
        {{ queueSize ? `เริ่มทบทวน ${queueSize} ใบ` : '🎉 วันนี้ทบทวนครบแล้ว!' }}
      </button>
      <div v-if="!queueSize" class="sv-allclear">กลับมาใหม่พรุ่งนี้ หรือกดด้านล่างเพื่อฝึกแบบสุ่ม</div>
      <button v-if="!queueSize" class="sv-freebtn" @click="startSession(true)">ฝึกอิสระ (ไม่นับ SRS) <Emoji char="🎲" /></button>

      <div class="sv-caphint">ทบทวนได้เหรียญ +{{ COIN_PER_CARD }}/ใบ (สูงสุด {{ STUDY_DAILY_CAP }}<Emoji char="🪙" />/วัน)</div>

      <!-- ทางเข้าจัดการคลังข้อสอบ — เฉพาะทีมวิชาการ -->
      <RouterLink v-if="authStore.isQuestionEditor" to="/questions" class="sv-quizlink sv-acadlink">
        <span class="sv-quizlink-emoji"><Emoji char="🛠️" /></span>
        <span class="sv-quizlink-text">
          <b>จัดการคลังข้อสอบ</b>
          <small>เพิ่ม/แก้/เผยแพร่ข้อสอบ · เฉพาะทีมวิชาการ</small>
        </span>
        <span class="sv-quizlink-go">›</span>
      </RouterLink>
    </template>
```

- [ ] **Step 4: เพิ่ม style section-title + modes**

ใน `<style scoped>` ใกล้ส่วน `/* home */` เพิ่ม:
```css
.sv-section-title { font-weight: 800; font-size: .82rem; color: var(--ink); margin: 4px 0 10px; display: flex; align-items: center; gap: 6px; }
.sv-section-flash { margin-top: 22px; padding-top: 18px; border-top: 1px dashed var(--border); }
.sv-modes { display: flex; flex-direction: column; gap: 10px; margin-bottom: 4px; }
```

- [ ] **Step 5: ตรวจ build**

Run: `npm run build`
Expected: build สำเร็จ (exit 0) — ไม่เหลือ reference `.sv-quizlink` ของลิงก์ /quiz เดิม (class ยังใช้กับ acadlink ได้)

- [ ] **Step 6: commit**

```bash
git add src/views/StudyView.vue
git commit -m "Study: รื้อ IA หน้า home — ข้อสอบ(ฮับโหมด)บน / flashcard ล่าง — SP1"
```

---

## Self-Review

**Spec coverage:**
- StudyView IA (countdown → ทำข้อสอบ → flashcard → ลิงก์จัดการคลัง) → Task 6 ✅
- การ์ดโหมด 4 ใบ (2 comingSoon กดไม่ได้จริง = `<div>`) → Task 5 (component) + Task 6 (ใช้งาน) ✅
- Zen mode `?mode=zen` batch-load, จบเมื่อกดออก, นับ/ให้เหรียญเหมือนทั่วไป → Task 4 ✅
- questionStats/dailyQuest/quizDoneTotal สำหรับ Zen → reuse `finish()` (มี tallyAnswers/bumpDailyQuest/quizDoneTotal อยู่แล้ว, answers มี id จาก SP2b) — Task 4 ไม่แตะส่วนนั้น = ครอบอัตโนมัติ ✅
- เศรษฐกิจ 100/ข้อ + เพดาน max(1000, รายได้บ้าน) pure util + เทส + pin → Task 1, 2, 3 ✅
- แชร์เพดาน ทั่วไป+Zen ผ่าน quizCoinDate/quizCoinsToday → Task 3 (finish reward ใช้ earnedToday เดิม) + Task 4 (zen reuse finish) ✅
- ไม่มี rules/schema/index/leaderboard ใหม่ → ไม่มี task ที่แตะ (ตรงสเปก) ✅

**Placeholder scan:** ไม่มี TBD/TODO ในขั้นตอน ✅

**Type consistency:** `quizDailyCap(level, floor)` / `quizGrant(correct, earnedToday, cap, perCorrect)` ตรงกัน Task 1↔3 · `QUIZ_COIN_PER_CORRECT`/`QUIZ_DAILY_CAP_FLOOR` ตรง Task 2↔3↔4(template) · `variant`/`sessionTotal`/`fetchQuestions`/`startZen`/`loadMoreZen`/`backToHome` นิยาม+ใช้สอดคล้องใน Task 4 · `<QuizModeCard>` props (emoji/title/subtitle/to/comingSoon) ตรง Task 5↔6 ✅
