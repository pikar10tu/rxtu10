# SP2b — สถิติรายข้อ Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** ติด badge 🔴%ถูก (เฉพาะข้อใต้เกณฑ์) + 🚩report บนแถวย่อ QuestionsView เพื่อชี้ข้อมีปัญหา

**Architecture:** เก็บ counter `questionStats/{qid}` increment-only เขียนตอน quiz จบ (writeBatch), อ่านทั้ง collection ตอนผู้แก้คลังเปิดหน้า แล้วคำนวณ %ถูก + flag ข้อใต้เกณฑ์. report count reuse `questionReports` เดิม (group `status='open'`). pure logic แยกเป็น `utils/questionStats.js` มีเทส.

**Tech Stack:** Vue 3 + Pinia + Firestore (modular SDK) · `node --test` สำหรับ pure util

## Global Constraints

- คอมเมนต์/commit เป็นไทยปนอังกฤษ · commit format `Area: อะไร (ทำไม)`
- เขียน user doc ผ่าน `auth.patchUser` เท่านั้น (งานนี้ไม่แตะ user doc — เขียน `questionStats` ตรงผ่าน writeBatch ได้ เพราะเป็น top-level collection ไม่ใช่ user doc)
- ไม่แตะ userSchema / migration / composite index
- emoji ในเทมเพลตใช้ `<Emoji char="..." />` (กัน tofu) — อย่าฝัง emoji ดิบใน text node
- `usage.track(reads, writes)` หลัง getDocs ใหญ่ / การเขียน batch (Phase 3 usage meter)
- แก้ `firestore.rules` แล้วต้อง `firebase deploy --only firestore:rules` เสมอ (Pages/Actions ไม่ deploy rules)
- เกณฑ์เป็น tunable pin: `QUESTION_STAT_MIN_ATTEMPTS = 5`, `QUESTION_STAT_PROBLEM_PCT = 50`

---

### Task 1: utils/questionStats.js (pure logic + เทส)

**Files:**
- Create: `src/utils/questionStats.js`
- Test: `src/utils/questionStats.test.js`

**Interfaces:**
- Consumes: (ไม่มี — pure)
- Produces:
  - `tallyAnswers(answers: {id, correct}[]) → { [qid]: { a:int, c:int } }` — รวมจำนวนตอบ/ถูกต่อ qid; ข้าม record ที่ไม่มี `id`; รวมซ้ำ qid ได้
  - `pctCorrect(a:int, c:int) → number|null` — `Math.round(c/a*100)` หรือ `null` ถ้า `a<=0`
  - `isProblem(stat:{a,c}, minAttempts:int, pctThreshold:int) → boolean` — `stat.a >= minAttempts && pctCorrect(stat.a, stat.c) < pctThreshold`; ปลอดภัยถ้า `stat` เป็น `null/undefined` → `false`

- [ ] **Step 1: เขียนเทสที่ยังล้มเหลว**

`src/utils/questionStats.test.js`:
```js
// เทส questionStats — pure logic ของสถิติรายข้อ (SP2b)
// รัน: node --test src/utils/questionStats.test.js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { tallyAnswers, pctCorrect, isProblem } from './questionStats.js'

test('tallyAnswers: นับ a/c ต่อ qid + รวมซ้ำ', () => {
  const out = tallyAnswers([
    { id: 'q1', correct: true },
    { id: 'q2', correct: false },
    { id: 'q1', correct: false },
  ])
  assert.deepEqual(out, { q1: { a: 2, c: 1 }, q2: { a: 1, c: 0 } })
})

test('tallyAnswers: ข้าม record ที่ไม่มี id + รับ array ว่าง', () => {
  assert.deepEqual(tallyAnswers([{ correct: true }, { id: null, correct: false }]), {})
  assert.deepEqual(tallyAnswers([]), {})
})

test('pctCorrect: ปัดถูก + a<=0 คืน null', () => {
  assert.equal(pctCorrect(4, 1), 25)
  assert.equal(pctCorrect(3, 2), 67)   // 66.67 → 67
  assert.equal(pctCorrect(0, 0), null)
})

test('isProblem: flag เฉพาะ a>=min และ pct<threshold', () => {
  assert.equal(isProblem({ a: 10, c: 4 }, 5, 50), true)   // 40% < 50, a>=5
  assert.equal(isProblem({ a: 10, c: 5 }, 5, 50), false)  // 50% ไม่ < 50 (ขอบไม่ flag)
  assert.equal(isProblem({ a: 3, c: 0 }, 5, 50), false)   // a<min → ไม่ flag แม้ 0%
})

test('isProblem: stat ว่าง/undefined ปลอดภัย', () => {
  assert.equal(isProblem(null, 5, 50), false)
  assert.equal(isProblem(undefined, 5, 50), false)
})
```

- [ ] **Step 2: รันเทสให้เห็นว่าล้มเหลว**

Run: `node --test src/utils/questionStats.test.js`
Expected: FAIL — `Cannot find module './questionStats.js'`

- [ ] **Step 3: เขียน implementation ขั้นต่ำ**

`src/utils/questionStats.js`:
```js
// สถิติรายข้อ (SP2b) — pure logic นับ %ถูก + flag ข้อมีปัญหา
// ไม่พึ่ง Firestore/Vue เพื่อให้เทสด้วย node --test ได้

// รวม answers ({id, correct}) ต่อ qid → { [qid]: { a, c } } (ข้าม record ไม่มี id)
export function tallyAnswers(answers) {
  const out = {}
  for (const a of answers || []) {
    if (!a || !a.id) continue
    const cur = out[a.id] || (out[a.id] = { a: 0, c: 0 })
    cur.a++
    if (a.correct) cur.c++
  }
  return out
}

// %ถูก ปัดจำนวนเต็ม หรือ null ถ้ายังไม่มีการตอบ
export function pctCorrect(a, c) {
  if (!a || a <= 0) return null
  return Math.round((c / a) * 100)
}

// ข้อมีปัญหา = ถูกตอบพอ (>=minAttempts) และ %ถูกต่ำกว่า threshold
export function isProblem(stat, minAttempts, pctThreshold) {
  if (!stat || stat.a < minAttempts) return false
  const pct = pctCorrect(stat.a, stat.c)
  return pct !== null && pct < pctThreshold
}
```

- [ ] **Step 4: รันเทสให้ผ่าน**

Run: `node --test src/utils/questionStats.test.js`
Expected: PASS — 5 เทสผ่าน

- [ ] **Step 5: commit**

```bash
git add src/utils/questionStats.js src/utils/questionStats.test.js
git commit -m "Util: questionStats (tally/pctCorrect/isProblem pure + เทส) — SP2b"
```

---

### Task 2: tunable pins ใน data/index.js

**Files:**
- Modify: `src/data/index.js` (เพิ่มท้ายไฟล์ ต่อจาก `REPORT_REWARD`)

**Interfaces:**
- Consumes: (ไม่มี)
- Produces: `QUESTION_STAT_MIN_ATTEMPTS = 5`, `QUESTION_STAT_PROBLEM_PCT = 50` (export const)

- [ ] **Step 1: เพิ่ม constants**

ต่อท้าย `src/data/index.js`:
```js
// ── QUESTION STATS (SP2b) — เกณฑ์ flag "ข้อมีปัญหา" บนแถวย่อจัดการข้อสอบ ──
// tunable pin: ปรับตัวเลขที่นี่ที่เดียว
export const QUESTION_STAT_MIN_ATTEMPTS = 5; // ต้องถูกตอบ ≥ เท่านี้ก่อนจึง flag (กัน sample น้อยหลอก)
export const QUESTION_STAT_PROBLEM_PCT  = 50; // %ถูก < เท่านี้ = ข้อมีปัญหา (โชว์ 🔴)
```

- [ ] **Step 2: ตรวจ build ไม่พัง**

Run: `npm run build`
Expected: build สำเร็จ (exit 0)

- [ ] **Step 3: commit**

```bash
git add src/data/index.js
git commit -m "Data: เกณฑ์ flag ข้อมีปัญหา (MIN_ATTEMPTS/PROBLEM_PCT) — SP2b pin"
```

---

### Task 3: เขียน questionStats ตอน quiz จบ (QuizView.vue)

**Files:**
- Modify: `src/views/QuizView.vue` (line ~330 `answers.value.push`; `finish()` ~371 หลัง `addDoc(examSessions)`; import เพิ่ม)

**Interfaces:**
- Consumes: `tallyAnswers` จาก Task 1 · `writeBatch`, `doc`, `increment` (มี import แล้วบางส่วน) · `usage.track`
- Produces: doc `questionStats/{qid}` `{ a:int, c:int }` increment-only (Task 4 rules อนุญาต, Task 5 อ่าน)

- [ ] **Step 1: import tallyAnswers**

ใน `<script setup>` ของ QuizView.vue เพิ่มบรรทัด import (ใกล้ import utils อื่น):
```js
import { tallyAnswers } from '../utils/questionStats.js'
```
ตรวจว่า `writeBatch` อยู่ใน import จาก `firebase/firestore` แล้ว (บรรทัด 141 มี `addDoc, setDoc, increment` — เพิ่ม `writeBatch` ถ้ายังไม่มี):
```js
import { collection, getDocs, getDoc, query, where, orderBy, startAt, limit, doc, addDoc, setDoc, increment, serverTimestamp, writeBatch } from 'firebase/firestore'
```

- [ ] **Step 2: เก็บ question id ในแต่ละ answer**

แก้ `pick(i)` (บรรทัด ~330):
```js
  answers.value.push({ id: current.value.id, domain: current.value.domain || null, correct: isCorrect })
```

- [ ] **Step 3: batch increment ใน finish() หลังบันทึก examSessions**

ใน `finish()` หลังบล็อก `try { ... addDoc(collection(db, 'examSessions'), {...}) } catch (e) { ... }` (ปิดที่บรรทัด ~382) เพิ่มบล็อกใหม่ก่อนข้อ "2) update the user doc":
```js
  // 1.5) สถิติรายข้อ — increment questionStats/{qid} ต่อข้อที่ตอบ (SP2b, non-fatal)
  try {
    const tally = tallyAnswers(answers.value)
    const qids = Object.keys(tally)
    if (qids.length) {
      const batch = writeBatch(db)
      for (const qid of qids) {
        batch.set(doc(db, 'questionStats', qid),
          { a: increment(tally[qid].a), c: increment(tally[qid].c) }, { merge: true })
      }
      await batch.commit()
      usage.track(0, qids.length)
    }
  } catch (e) { console.error('[questionStats]', e) }
```

- [ ] **Step 4: ตรวจ build**

Run: `npm run build`
Expected: build สำเร็จ (exit 0)

- [ ] **Step 5: commit**

```bash
git add src/views/QuizView.vue
git commit -m "Quiz: increment questionStats/{qid} ตอนจบข้อสอบ (เก็บ %ถูกรายข้อ) — SP2b"
```

---

### Task 4: firestore.rules — collection questionStats

**Files:**
- Modify: `firestore.rules` (เพิ่ม block ต่อจาก `match /stats/{id}` ที่ปิดบรรทัด ~187)

**Interfaces:**
- Consumes: helper `canEditQuestions()` (มีอยู่ บรรทัด 39), `isAdmin()` (บรรทัด 32)
- Produces: read=canEditQuestions, create/update=authed increment-only `['a','c']`, delete=admin

- [ ] **Step 1: เพิ่ม rules block**

ใน `firestore.rules` หลัง block `match /stats/{id} { ... }` เพิ่ม:
```
    // ── Question stats (SP2b) — ตัวนับ %ถูกรายข้อ (increment-only) ──
    //  read:   ผู้แก้คลัง (academic+instructor) เพื่อโชว์ badge 🔴 · นักศึกษาเขียนได้อย่างเดียว
    //  write:  ผู้ล็อกอิน แตะได้แค่ field a/c และต้องไม่ลดลง (increment เท่านั้น) เหมือน stats/{date}
    match /questionStats/{qid} {
      allow read:   if canEditQuestions();
      allow create: if request.auth != null
        && request.resource.data.keys().hasOnly(['a', 'c'])
        && request.resource.data.a is int && request.resource.data.a >= 0
        && request.resource.data.c is int && request.resource.data.c >= 0;
      allow update: if request.auth != null
        && request.resource.data.diff(resource.data).affectedKeys().hasOnly(['a', 'c'])
        && request.resource.data.a is int && request.resource.data.a >= resource.data.get('a', 0)
        && request.resource.data.c is int && request.resource.data.c >= resource.data.get('c', 0);
      allow delete: if isAdmin();
    }
```

- [ ] **Step 2: ตรวจ syntax ด้วย dry-run (ไม่ deploy จริง)**

Run: `npx firebase deploy --only firestore:rules --dry-run`
Expected: ผ่าน compile ไม่มี syntax error (ถ้า `--dry-run` ไม่รองรับ ให้ข้ามไปตรวจตอน deploy จริงใน Task 6)

- [ ] **Step 3: commit**

```bash
git add firestore.rules
git commit -m "Rules: questionStats/{qid} increment-only (read=ผู้แก้คลัง) — SP2b"
```

---

### Task 5: อ่าน stat + report → badge บนแถวย่อ (QuestionsView.vue)

**Files:**
- Modify: `src/views/QuestionsView.vue` (import; state refs; onMounted ~394; loadReports/onReportsToggle ~616-634; row template ~218-224; style ~734)

**Interfaces:**
- Consumes: `tallyAnswers`→ไม่ใช้; ใช้ `pctCorrect`, `isProblem` จาก Task 1 · `QUESTION_STAT_MIN_ATTEMPTS`, `QUESTION_STAT_PROBLEM_PCT` จาก Task 2 · `groupReports` (มีแล้ว) · `getDocs`, `collection` (มีแล้ว)
- Produces: (UI ปลายทาง — ไม่มี downstream)

- [ ] **Step 1: import เพิ่ม**

ใน `<script setup>` ของ QuestionsView.vue:
```js
import { pctCorrect, isProblem } from '../utils/questionStats.js'
import { QUESTION_STAT_MIN_ATTEMPTS, QUESTION_STAT_PROBLEM_PCT } from '../data/index.js'
```
(`REPORT_REWARD` ถูก import จาก `../data/index.js` อยู่แล้ว — เพิ่มชื่อในบรรทัดเดิมได้ หรือเพิ่มบรรทัดใหม่)

- [ ] **Step 2: เพิ่ม state + computed + helper + กัน double-fetch reports**

ใกล้ `const reports = ref([])` (บรรทัด ~600) เพิ่ม:
```js
const statMap = ref({})              // { qid: { a, c } } — สถิติ %ถูกรายข้อ
const reportsLoaded = ref(false)     // กัน loadReports ซ้ำ (mount + กางแผง)

const reportCountMap = computed(() => {
  const m = {}
  for (const g of reportGroups.value) m[g.questionId] = g.count
  return m
})
function problemPct(qid) {
  const s = statMap.value[qid]
  return isProblem(s, QUESTION_STAT_MIN_ATTEMPTS, QUESTION_STAT_PROBLEM_PCT)
    ? pctCorrect(s.a, s.c) : null
}

async function loadStats() {
  try {
    const snap = await getDocs(collection(db, 'questionStats'))
    usage.track(snap.size)
    const m = {}
    snap.docs.forEach(d => { m[d.id] = d.data() })
    statMap.value = m
  } catch (e) { console.error('[questionStats load]', e) }
}
```

แก้ `loadReports()` ให้ตั้ง flag (ต่อท้ายใน `try`, หลัง `reports.value = ...`):
```js
    reports.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    reportsLoaded.value = true
```

แก้ `onReportsToggle` กัน fetch ซ้ำ:
```js
function onReportsToggle(e) {
  reportsOpen.value = e.target.open
  if (e.target.open && !reportsLoaded.value) loadReports()
}
```

- [ ] **Step 3: โหลดตอน mount**

แก้บรรทัด 394:
```js
onMounted(() => {
  if (!authStore.isQuestionEditor) return
  load()
  loadStats()
  if (authStore.isAcademic) loadReports()
})
```

- [ ] **Step 4: เพิ่ม badge ในแถวย่อ**

ใน `.qz-row` (หลัง `<span v-if="q.domain" class="qz-cat">` บรรทัด 221, ก่อน `<span class="qz-row-q">`):
```html
            <span v-if="problemPct(q.id) !== null" class="qz-badge-stat low">
              <Emoji char="🔴" /> {{ problemPct(q.id) }}%
            </span>
            <span v-if="reportCountMap[q.id]" class="qz-badge-stat rep">
              <Emoji char="🚩" /> {{ reportCountMap[q.id] }}
            </span>
```

- [ ] **Step 5: เพิ่ม style**

ใน `<style scoped>` ใกล้ `.qz-badge`/`.qz-cat` (รอบบรรทัด 734):
```css
.qz-badge-stat { flex-shrink: 0; font-size: .68rem; font-weight: 700; padding: 1px 6px; border-radius: 6px; white-space: nowrap; }
.qz-badge-stat.low { background: #fef2f2; color: #b91c1c; }
.qz-badge-stat.rep { background: #fff7ed; color: #c2410c; }
```

- [ ] **Step 6: ตรวจ build**

Run: `npm run build`
Expected: build สำเร็จ (exit 0)

- [ ] **Step 7: commit**

```bash
git add src/views/QuestionsView.vue
git commit -m "Questions: badge 🔴%ถูก + 🚩report บนแถวย่อ (โหลด stat/report ตอนเปิดหน้า) — SP2b"
```

---

### Task 6: deploy rules + push + ตรวจ

**Files:** (ไม่มีโค้ดใหม่ — งาน deploy/verify)

- [ ] **Step 1: รันเทส pure ทั้งหมดของงานนี้**

Run: `node --test src/utils/questionStats.test.js`
Expected: PASS 5 เทส

- [ ] **Step 2: build ครั้งสุดท้าย**

Run: `npm run build`
Expected: สำเร็จ

- [ ] **Step 3: deploy rules**

Run: `firebase deploy --only firestore:rules`
Expected: `Deploy complete!` — ยืนยัน `questionStats` อยู่ใน rules ที่ deploy

- [ ] **Step 4: push (auto-deploy frontend ผ่าน GitHub Actions)**

```bash
git push origin master
```
Expected: Actions build+publish เขียว

- [ ] **Step 5: verify บน prod (manual)**

- เปิดหน้า `/questions` ด้วยบัญชี academic → ทำข้อสอบบางข้อให้ผิดหลายครั้ง (หรือรอข้อมูลจริงสะสม) → กลับมาดูแถวย่อว่ามี 🔴/🚩 ขึ้นกับข้อที่ตรงเกณฑ์
- หมายเหตุ interactive ต้องบัญชีจริง — ระบุไว้ว่า user ตรวจเองได้ บั๊กแจ้งกลับ

---

## Self-Review

**Spec coverage:**
- questionStats/{qid} increment-only → Task 3 (เขียน) + Task 4 (rules) ✅
- เพิ่ม id ใน answers.push → Task 3 Step 2 ✅
- pure util tallyAnswers/pctCorrect/isProblem + เทส → Task 1 ✅
- tunable pin MIN/PCT → Task 2 ✅
- read stat ตอน mount (isQuestionEditor) + report eager (isAcademic) + กัน double-fetch → Task 5 Step 2-3 ✅
- badge 🔴 (problem only) + 🚩 (open count) บนแถวย่อ → Task 5 Step 4 ✅
- report reuse groupReports (open) → Task 5 Step 2 (reportCountMap) ✅
- rules read=canEditQuestions, write=increment-only, delete=admin → Task 4 ✅
- ไม่ backfill / ไม่ index / ไม่ migration → ไม่มี task (ตรงสเปก) ✅
- deploy rules + push → Task 6 ✅

**Placeholder scan:** ไม่มี TBD/TODO ในขั้นตอน (REPORT_REWARD เดิมมี "TBD" แต่ไม่ใช่ของงานนี้) ✅

**Type consistency:** `tallyAnswers`/`pctCorrect`/`isProblem` ชื่อ+signature ตรงกันทั้ง Task 1↔3↔5 · `statMap`/`reportCountMap`/`problemPct`/`reportsLoaded` ใช้สอดคล้องใน Task 5 · `QUESTION_STAT_MIN_ATTEMPTS`/`QUESTION_STAT_PROBLEM_PCT` ตรง Task 2↔5 ✅
