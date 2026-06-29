# หน้าตรวจข้อสอบ (Peer Review วิชาการ) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** ให้ทีมวิชาการ+อาจารย์ (`canEditQuestions`) เปิดหน้า `/review` แล้วระบบสุ่มป้อนข้อสอบที่ "ต้องให้ฉันตรวจ" มาทีละข้อ ตัดสิน 3 ระดับ (ถูกต้อง/ต้องแก้/ผิด) พร้อมเหตุผลบังคับ + เรฟไม่บังคับ เก็บผลลง Firestore + มี leaderboard ว่าใครตรวจไปกี่ข้อ

**Architecture:** Pull-model client-only — อ่านคลังครั้งเดียวเหมือน QuestionsView แล้วกรองข้อที่ต้องตรวจในเครื่อง (pure util) · ผลตรวจเก็บ 2 จุด: aggregate บน `questions/{qid}` (`reviewedBy`/`reviewVerdicts`/`reviewStatus`) + รายละเอียดใน subcollection `questions/{qid}/reviews/{uid}` (snapshot ชื่อจริง) · ตรรกะสถานะ/คิว/leaderboard แยกเป็น pure util มีเทส · ไม่มี backend, ไม่มี collection ใหม่, ไม่มี composite index

**Tech Stack:** Vue 3 `<script setup>` + Pinia + Firebase Firestore (writeBatch/arrayUnion) · เทส pure util ผ่าน `node --test`

## Global Constraints

- ข้อความจากผู้ใช้ทุกช่องต้องผ่าน `cleanText(str, LIMITS.xxx)` จาก `utils/text.js` ก่อนเขียน Firestore เสมอ
- Roles gate: `canEditQuestions = isQuestionEditor = isAcademic || isInstructor` (academic+admin+instructor) — getter พร้อมใช้บน `authStore`
- เขียน user doc ต้องผ่าน `auth.patchUser` เท่านั้น — **แต่ฟีเจอร์นี้ไม่แตะ user doc** (เขียนแค่ `questions/*`)
- แก้ `firestore.rules` แล้วต้อง `firebase deploy --only firestore:rules` เสมอ (CLAUDE.md กับดักข้อ 3) — Pages/Actions ไม่ deploy rules
- ไม่มี test runner กลาง — view verify ด้วย `npm run build` (เขียว) · pure util verify ด้วย `node --test`
- โทน copy ยึด `docs/voice-guide.md` (เป็นกันเอง อธิบายชัด ไม่หวือหวา) · UI ไทย · single-file component + scoped style · ธีม indigo `#4f46e5`
- commit รูปแบบ `Area: อะไร (ทำไม)` ไทยปนอังกฤษ
- verdict values คงที่ทั้งระบบ: `'correct' | 'fix' | 'wrong'` · reviewStatus: `'pending' | 'passed' | 'conflict' | 'failed'`
- **เฟสนี้ไม่ gate การเผยแพร่ตาม reviewStatus** (YAGNI — เก็บสถานะไว้รองรับเฟสหน้าเท่านั้น)

---

### Task 1: Pure util `questionReview.js` + เทส

ตรรกะล้วน ไม่แตะ Firestore/Vue — หัวใจที่ทุก task หลังพึ่งพา ทำ TDD เต็มรูปแบบ

**Files:**
- Create: `src/utils/questionReview.js`
- Test: `src/utils/questionReview.test.js`
- Modify: `src/utils/text.js:35-47` (เพิ่ม `reviewReason`, `reviewRef` ใน `LIMITS`)

**Interfaces:**
- Consumes: (ไม่มี — pure)
- Produces:
  - `computeStatus(verdictsMap: Record<uid,'correct'|'fix'|'wrong'>) → 'pending'|'passed'|'conflict'|'failed'`
  - `needsReviewBy(question: {createdBy?, reviewedBy?: string[], reviewVerdicts?}, myUid: string) → boolean`
  - `tallyReviewCounts(questions: Array<{reviewedBy?: string[]}>) → Record<uid, number>`
  - `nextReviewQueue(questions: Array, myUid: string) → Array` (subset ของ questions ที่ `needsReviewBy` เป็น true)
  - `buildLeaderboard(counts: Record<uid,number>, nameMap: Record<uid,string>) → Array<{uid, name, count}>` (เรียง count มาก→น้อย, tiebreak ชื่อ)

- [ ] **Step 1: เพิ่ม LIMITS สองคีย์ใน text.js**

แก้ `src/utils/text.js` บล็อก `export const LIMITS = { ... }` เพิ่ม 2 บรรทัดก่อนปิดปีกกา:

```js
export const LIMITS = {
  contact: 40,
  nickname: 30,
  guestReason: 200,
  news: 280,
  feedback: 1000,
  report: 1000,
  question: 500,
  choice: 200,
  category: 60,
  explanation: 1000,
  comment: 1000,
  reviewReason: 1000,
  reviewRef: 300,
}
```

- [ ] **Step 2: เขียนเทสที่ยังล้มเหลว**

สร้าง `src/utils/questionReview.test.js`:

```js
// เทส questionReview — pure logic สถานะ/คิว/leaderboard การตรวจข้อสอบ
// รัน: node --test src/utils/questionReview.test.js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { computeStatus, needsReviewBy, tallyReviewCounts, nextReviewQueue, buildLeaderboard } from './questionReview.js'

// ── computeStatus ──
test('ยังไม่มีเสียง → pending', () => {
  assert.equal(computeStatus({}), 'pending')
  assert.equal(computeStatus(null), 'pending')
})
test('1 เสียง (ยังไม่ครบ 2) → pending', () => {
  assert.equal(computeStatus({ a: 'correct' }), 'pending')
  assert.equal(computeStatus({ a: 'wrong' }), 'pending')
})
test('correct + correct → passed', () => {
  assert.equal(computeStatus({ a: 'correct', b: 'correct' }), 'passed')
})
test('correct + fix → conflict', () => {
  assert.equal(computeStatus({ a: 'correct', b: 'fix' }), 'conflict')
})
test('correct + wrong → conflict', () => {
  assert.equal(computeStatus({ a: 'correct', b: 'wrong' }), 'conflict')
})
test('fix + wrong → failed (สองฝั่ง fail นับเป็น failed)', () => {
  assert.equal(computeStatus({ a: 'fix', b: 'wrong' }), 'failed')
})
test('wrong + wrong → failed', () => {
  assert.equal(computeStatus({ a: 'wrong', b: 'wrong' }), 'failed')
})
test('คนที่ 3 ตัดสิน conflict → เสียงข้างมากเป็น passed', () => {
  assert.equal(computeStatus({ a: 'correct', b: 'wrong', c: 'correct' }), 'passed')
})
test('คนที่ 3 ตัดสิน conflict → เสียงข้างมากเป็น failed', () => {
  assert.equal(computeStatus({ a: 'correct', b: 'wrong', c: 'fix' }), 'failed')
})

// ── needsReviewBy ──
test('ข้อตัวเอง (createdBy == me) → ไม่ต้องตรวจ', () => {
  assert.equal(needsReviewBy({ createdBy: 'me', reviewedBy: [] }, 'me'), false)
})
test('ตรวจไปแล้ว (อยู่ใน reviewedBy) → ไม่ต้องตรวจ', () => {
  assert.equal(needsReviewBy({ reviewedBy: ['me'] }, 'me'), false)
})
test('ข้อใหม่ ยังไม่มีใครตรวจ → ต้องตรวจ', () => {
  assert.equal(needsReviewBy({ reviewedBy: [] }, 'me'), true)
  assert.equal(needsReviewBy({}, 'me'), true)
})
test('มี 1 เสียงจากคนอื่น → ยังต้องตรวจ (หาให้ครบ 2)', () => {
  assert.equal(needsReviewBy({ reviewedBy: ['x'], reviewVerdicts: { x: 'correct' } }, 'me'), true)
})
test('ครบ 2 เสียง passed → ไม่ต้องตรวจ', () => {
  const q = { reviewedBy: ['x', 'y'], reviewVerdicts: { x: 'correct', y: 'correct' } }
  assert.equal(needsReviewBy(q, 'me'), false)
})
test('ครบ 2 เสียง failed → ไม่ต้องตรวจ', () => {
  const q = { reviewedBy: ['x', 'y'], reviewVerdicts: { x: 'wrong', y: 'fix' } }
  assert.equal(needsReviewBy(q, 'me'), false)
})
test('conflict (2 เสียงขัดแย้ง) → คนที่ 3 ต้องตรวจ', () => {
  const q = { reviewedBy: ['x', 'y'], reviewVerdicts: { x: 'correct', y: 'wrong' } }
  assert.equal(needsReviewBy(q, 'me'), true)
})
test('conflict แต่ฉันเป็น 1 ใน 2 คนเดิม → ไม่ต้องตรวจซ้ำ', () => {
  const q = { reviewedBy: ['me', 'y'], reviewVerdicts: { me: 'correct', y: 'wrong' } }
  assert.equal(needsReviewBy(q, 'me'), false)
})
test('conflict ที่คนที่ 3 ตัดสินแล้ว → ไม่ต้องตรวจ', () => {
  const q = { reviewedBy: ['x', 'y', 'z'], reviewVerdicts: { x: 'correct', y: 'wrong', z: 'correct' } }
  assert.equal(needsReviewBy(q, 'me'), false)
})

// ── tallyReviewCounts ──
test('นับจำนวนข้อที่แต่ละ uid ตรวจ', () => {
  const qs = [
    { reviewedBy: ['a', 'b'] },
    { reviewedBy: ['a'] },
    { reviewedBy: [] },
    { /* ไม่มี field */ },
  ]
  assert.deepEqual(tallyReviewCounts(qs), { a: 2, b: 1 })
})
test('คลังว่าง → object ว่าง', () => {
  assert.deepEqual(tallyReviewCounts([]), {})
})

// ── nextReviewQueue ──
test('คืนเฉพาะข้อที่ฉันต้องตรวจ (กันข้อตัวเอง/ตรวจซ้ำ/ครบแล้ว)', () => {
  const qs = [
    { id: '1', createdBy: 'me', reviewedBy: [] },                                  // ข้อตัวเอง
    { id: '2', reviewedBy: ['me'] },                                               // ตรวจแล้ว
    { id: '3', reviewedBy: ['x', 'y'], reviewVerdicts: { x: 'correct', y: 'correct' } }, // passed
    { id: '4', reviewedBy: [] },                                                   // ใหม่ → ต้องตรวจ
    { id: '5', reviewedBy: ['x'], reviewVerdicts: { x: 'correct' } },              // 1 เสียง → ต้องตรวจ
  ]
  assert.deepEqual(nextReviewQueue(qs, 'me').map(q => q.id), ['4', '5'])
})
test('ไม่มี myUid → คิวว่าง', () => {
  assert.deepEqual(nextReviewQueue([{ reviewedBy: [] }], null), [])
})

// ── buildLeaderboard ──
test('เรียงมาก→น้อย + แมพชื่อจาก nameMap', () => {
  const rows = buildLeaderboard({ a: 3, b: 5, c: 1 }, { a: 'Ann', b: 'Bee', c: 'Cee' })
  assert.deepEqual(rows, [
    { uid: 'b', name: 'Bee', count: 5 },
    { uid: 'a', name: 'Ann', count: 3 },
    { uid: 'c', name: 'Cee', count: 1 },
  ])
})
test('uid ไม่มีใน nameMap → ชื่อ "ไม่ระบุ"', () => {
  const rows = buildLeaderboard({ z: 2 }, {})
  assert.equal(rows[0].name, 'ไม่ระบุ')
})
test('count เท่ากัน → tiebreak ด้วยชื่อ', () => {
  const rows = buildLeaderboard({ a: 2, b: 2 }, { a: 'Beta', b: 'Alpha' })
  assert.deepEqual(rows.map(r => r.name), ['Alpha', 'Beta'])
})
```

- [ ] **Step 3: รันเทสให้เห็นว่าล้มเหลว**

Run: `node --test src/utils/questionReview.test.js`
Expected: FAIL — `Cannot find module './questionReview.js'`

- [ ] **Step 4: เขียน implementation ขั้นต่ำให้ผ่าน**

สร้าง `src/utils/questionReview.js`:

```js
// ════════════════════════════════════════════════════════════
//  Peer-review ข้อสอบ — ตรรกะล้วน (ไม่แตะ Firestore/Vue)
//  verdict: 'correct' (ผ่าน) | 'fix' | 'wrong' (ทั้งคู่นับเป็น fail)
//  reviewStatus: pending | passed | conflict | failed
//  คุมคิว pull-model + leaderboard "ใครตรวจกี่ข้อ"
// ════════════════════════════════════════════════════════════

// สรุปสถานะจาก verdict ทั้งหมดของข้อหนึ่ง
//  <2 เสียง → pending · pass>fail → passed · fail>pass → failed · เสมอ → conflict
//  (2 เสียงเสมอ = correct+fail = ขัดแย้ง รอคนที่ 3 · 3 เสียงไม่มีทางเสมอ → ตัดสินได้)
export function computeStatus(verdictsMap) {
  const verdicts = Object.values(verdictsMap || {})
  if (verdicts.length < 2) return 'pending'
  let pass = 0, fail = 0
  for (const v of verdicts) (v === 'correct' ? pass++ : fail++)
  if (pass > fail) return 'passed'
  if (fail > pass) return 'failed'
  return 'conflict'
}

// ข้อนี้ "ต้องให้ฉันตรวจ" ไหม
//  กันตรวจข้อตัวเอง · กันตรวจซ้ำ · ครบ 2 แล้วหยุด (ยกเว้น conflict ที่รอคนที่ 3)
export function needsReviewBy(question, myUid) {
  if (!myUid || !question) return false
  if (question.createdBy === myUid) return false
  const reviewedBy = question.reviewedBy || []
  if (reviewedBy.includes(myUid)) return false
  const status = computeStatus(question.reviewVerdicts || {})
  return reviewedBy.length < 2 || status === 'conflict'
}

// uid → จำนวนข้อที่ตรวจไปแล้ว (นับจาก reviewedBy ทั้งคลัง = ตัวนับ leaderboard)
export function tallyReviewCounts(questions) {
  const counts = {}
  for (const q of questions || []) {
    for (const uid of q.reviewedBy || []) counts[uid] = (counts[uid] || 0) + 1
  }
  return counts
}

// คิวข้อที่ฉันต้องตรวจ (subset ของคลัง)
export function nextReviewQueue(questions, myUid) {
  if (!myUid) return []
  return (questions || []).filter(q => needsReviewBy(q, myUid))
}

// leaderboard เรียงมาก→น้อย (tiebreak ชื่อ) แมพ uid→ชื่อจริงผ่าน nameMap
export function buildLeaderboard(counts, nameMap = {}) {
  return Object.entries(counts || {})
    .map(([uid, count]) => ({ uid, count, name: nameMap[uid] || 'ไม่ระบุ' }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
}
```

- [ ] **Step 5: รันเทสให้ผ่าน**

Run: `node --test src/utils/questionReview.test.js`
Expected: PASS — ทุกเทสเขียว (tests N pass, 0 fail)

- [ ] **Step 6: Commit**

```bash
git add src/utils/questionReview.js src/utils/questionReview.test.js src/utils/text.js
git commit -m "Review: เพิ่ม pure util questionReview + LIMITS reviewReason/reviewRef (ตรรกะสถานะ/คิว/leaderboard)"
```

---

### Task 2: Firestore rules — subcollection `reviews` + deploy

**Files:**
- Modify: `firestore.rules:157-170` (เพิ่ม match block ใน `match /questions/{id}`)

**Interfaces:**
- Consumes: helper `canEditQuestions()`, `isAdmin()` (มีอยู่แล้วในไฟล์)
- Produces: สิทธิ์อ่าน/เขียน `questions/{qid}/reviews/{reviewerUid}` ให้ write path ของ Task 4 ใช้ได้

- [ ] **Step 1: เพิ่ม match block reviews**

ใน `firestore.rules` ภายใน `match /questions/{id} { ... }` ต่อจากบล็อก `match /comments/{commentId} { ... }` (ก่อนปิดปีกกาของ questions) เพิ่ม:

```
      // ── Reviews (Peer-review วิชาการ) — ผลตรวจรายผู้ตรวจต่อข้อ ──
      //  doc id = uid ของผู้ตรวจ → กันตรวจซ้ำ + กันปลอมเป็นคนอื่น
      //  read:   canEditQuestions (วิชาการ+อาจารย์+แอดมิน) — นักศึกษาเข้าไม่ถึง
      //  create: ต้องเป็นเจ้าของจริง (id == uid และ field reviewerUid == uid)
      //  update: เจ้าของ (แก้รีวิวตัวเอง) หรือ admin
      //  delete: admin
      match /reviews/{reviewerUid} {
        allow read:   if canEditQuestions();
        allow create: if canEditQuestions()
          && reviewerUid == request.auth.uid
          && request.resource.data.get('reviewerUid', '') == request.auth.uid;
        allow update: if isAdmin()
          || (request.auth != null && resource.data.get('reviewerUid', '') == request.auth.uid);
        allow delete: if isAdmin();
      }
```

- [ ] **Step 2: ตรวจ syntax ด้วย dry-run build ของ rules (ถ้ามี firebase CLI)**

Run: `firebase deploy --only firestore:rules`
Expected: `✔ Deploy complete!` (และ `✔ cloud.firestore: rules file firestore.rules compiled successfully`)
> ถ้า CLI ไม่ได้ login/ติดตั้ง: คอมไพล์ผ่าน Console (paste → Publish) แทน — แต่ **ต้อง deploy จริง** ไม่งั้น write path ใน Task 4 จะโดน permission-denied

- [ ] **Step 3: Commit**

```bash
git add firestore.rules
git commit -m "Rules: เปิด subcollection questions/{qid}/reviews (peer-review, id=uid กันปลอม) + deploy"
```

---

### Task 3: Route `/review` (lazy)

**Files:**
- Modify: `src/router/index.js:5-19` (เพิ่ม 1 บรรทัดใน array `routes`)

**Interfaces:**
- Consumes: `views/ReviewView.vue` (สร้างใน Task 4 — route lazy import จะ resolve ตอน build/runtime)
- Produces: path `/review` ชื่อ `review`

- [ ] **Step 1: เพิ่ม route**

ใน `src/router/index.js` array `routes` เพิ่มบรรทัดต่อจาก `/questions`:

```js
    { path: '/questions', name: 'questions', component: () => import('../views/QuestionsView.vue') },
    { path: '/review',    name: 'review',    component: () => import('../views/ReviewView.vue')    },
```

- [ ] **Step 2: Commit**

```bash
git add src/router/index.js
git commit -m "Router: เพิ่ม route /review (lazy) สำหรับหน้าตรวจข้อสอบ"
```

> หมายเหตุ: ตอนนี้ `npm run build` จะ **ยังล้มเหลว** เพราะ `ReviewView.vue` ยังไม่มี — build จะเขียวหลัง Task 4 เสร็จ (commit นี้กับ Task 4 ถูกออกแบบให้ต่อกัน)

---

### Task 4: `ReviewView.vue` — หน้าตรวจ + ฟอร์ม + leaderboard

หน้าเต็มทั้งหมด: gate, โหลดคลัง, สุ่มข้อปัจจุบัน, ฟอร์มตัดสิน, write path (batch 2 จุด), ข้ามข้อ, แถบสรุปคิว, leaderboard, และโชว์รีวิวเดิมเฉพาะข้อ conflict (กันอคติข้ออื่น)

**Files:**
- Create: `src/views/ReviewView.vue`

**Interfaces:**
- Consumes:
  - `questionReview.js`: `computeStatus`, `needsReviewBy`(ผ่าน `nextReviewQueue`), `tallyReviewCounts`, `nextReviewQueue`, `buildLeaderboard`
  - `authStore`: `isQuestionEditor`, `currentUser.uid`, `userData.{realName,nickname,name}`
  - `membersStore`: `fbUsers`, `guestUsers`, `loadFbUsers()` (instructor = guest จึงต้องรวม guestUsers ด้วย)
  - `usage.track(reads, writes)`, `useToast().toast`, `cleanText`, `LIMITS.reviewReason`, `LIMITS.reviewRef`, `domainLabel`
- Produces: หน้า `/review` ที่ render ได้ + build เขียว

- [ ] **Step 1: สร้างไฟล์ ReviewView.vue ฉบับเต็ม**

สร้าง `src/views/ReviewView.vue`:

```vue
<template>
  <div class="tab-content">
    <div class="rv-head">
      <div class="rv-title"><Emoji char="🔍" /> ตรวจข้อสอบ</div>
      <RouterLink to="/questions" class="rv-back">คลังข้อสอบ ›</RouterLink>
    </div>

    <div v-if="!authStore.isQuestionEditor" class="rv-denied">
      เฉพาะแอดมินหรือทีมวิชาการเท่านั้น
    </div>

    <template v-else>
      <!-- ── แถบสรุปคิว ── -->
      <div class="rv-summary">
        <Emoji char="📋" /> เหลือต้องตรวจ <b>{{ summary.remaining }}</b> ข้อ<span v-if="summary.conflicts"> · ขัดแย้ง <b>{{ summary.conflicts }}</b> ข้อ</span>
      </div>

      <div v-if="loading" class="rv-empty">กำลังโหลดคลังข้อสอบ…</div>

      <!-- ── การ์ดข้อปัจจุบัน ── -->
      <section v-else-if="current" class="rv-card">
        <div class="rv-card-tags">
          <span v-if="current.domain" class="rv-cat">{{ domainLabel(current.domain) || current.domain }}</span>
          <span v-if="current.category" class="rv-cat rv-cat-sub">{{ current.category }}</span>
          <span v-if="!current.isPublished" class="rv-draft">ร่าง</span>
          <span v-if="currentStatus === 'conflict'" class="rv-conflict-badge">⚠️ ขัดแย้ง — คุณคือผู้ตัดสิน</span>
        </div>

        <div class="rv-q">{{ current.question }}</div>
        <ul class="rv-choices">
          <li v-for="(c, i) in current.choices" :key="i" :class="{ correct: i === current.answer }">
            <span class="rv-c-letter">{{ LETTERS[i] }}</span><span class="rv-c-text">{{ c }}</span>
            <span v-if="i === current.answer" class="rv-c-mark">✓ เฉลย</span>
          </li>
        </ul>
        <div v-if="current.explanation" class="rv-exp"><Emoji char="💡" /> {{ current.explanation }}</div>

        <!-- รีวิวเดิม 2 ฉบับ (โชว์เฉพาะข้อ conflict ให้คนที่ 3 ตัดสิน — ข้ออื่นซ่อนกันอคติ) -->
        <div v-if="currentStatus === 'conflict' && priorReviews.length" class="rv-priors">
          <div class="rv-priors-head">ผลตรวจก่อนหน้า ({{ priorReviews.length }})</div>
          <div v-for="p in priorReviews" :key="p.id" class="rv-prior">
            <div class="rv-prior-top">
              <span class="rv-prior-verdict" :class="p.verdict">{{ VERDICT_LABEL[p.verdict] || p.verdict }}</span>
              <b>{{ p.reviewerName || 'ไม่ระบุ' }}</b>
            </div>
            <div class="rv-prior-reason">{{ p.reason }}</div>
            <div v-if="p.ref" class="rv-prior-ref">เรฟ: {{ p.ref }}</div>
          </div>
        </div>

        <!-- ── ฟอร์มตรวจ ── -->
        <div class="rv-form">
          <div class="rv-verdicts">
            <button
              v-for="v in VERDICTS" :key="v.key"
              type="button" class="rv-vbtn" :class="[v.key, { on: verdict === v.key }]"
              @click="verdict = v.key"
            >{{ v.label }}</button>
          </div>

          <label class="rv-label">เหตุผล (บังคับ)</label>
          <textarea v-model="reason" :maxlength="LIMITS.reviewReason" class="rv-input" rows="3" placeholder="อธิบายว่าทำไมตัดสินแบบนี้…"></textarea>

          <label class="rv-label">เรฟอ้างอิง (ไม่บังคับ)</label>
          <input v-model="refText" :maxlength="LIMITS.reviewRef" class="rv-input" placeholder="ลิงก์ / ชื่อหนังสือ / แนวทาง…" />

          <div class="rv-actions">
            <button class="rv-btn rv-gray" :disabled="submitting" @click="skip">ข้ามข้อนี้</button>
            <button class="rv-btn rv-primary" :disabled="!canSubmit || submitting" @click="submit">
              {{ submitting ? 'กำลังส่ง…' : 'ส่งผลตรวจ' }}
            </button>
          </div>
        </div>
      </section>

      <div v-else class="rv-empty rv-done">
        <Emoji char="🎉" /> ตรวจครบทุกข้อที่เข้าคิวให้คุณแล้ว — ขอบคุณมาก!
      </div>

      <!-- ── leaderboard ── -->
      <section class="rv-board">
        <div class="rv-board-head"><Emoji char="🏅" /> ใครตรวจไปกี่ข้อ</div>
        <div v-if="!leaderboard.length" class="rv-empty rv-board-empty">ยังไม่มีใครตรวจ</div>
        <ol v-else class="rv-board-list">
          <li v-for="row in leaderboard" :key="row.uid" class="rv-board-row" :class="{ me: row.uid === myUid }">
            <span class="rv-board-name">{{ row.name }}<span v-if="row.uid === myUid" class="rv-you"> (คุณ)</span></span>
            <span class="rv-board-count">{{ row.count }} ข้อ</span>
          </li>
        </ol>
      </section>
    </template>
  </div>
</template>

<script setup>
import Emoji from '../components/shared/Emoji.vue'
import { ref, computed, watch, onMounted } from 'vue'
import { collection, getDocs, doc, writeBatch, arrayUnion, serverTimestamp, query, orderBy } from 'firebase/firestore'
import { db } from '../firebase/config.js'
import { useAuthStore } from '../stores/auth.js'
import { useMembersStore } from '../stores/members.js'
import { useUsageStore } from '../stores/usage.js'
import { useToast } from '../composables/useToast.js'
import { cleanText, LIMITS } from '../utils/text.js'
import { domainLabel } from '../data/domains.js'
import { computeStatus, tallyReviewCounts, nextReviewQueue, buildLeaderboard } from '../utils/questionReview.js'

const authStore = useAuthStore()
const members = useMembersStore()
const usage = useUsageStore()
const { toast } = useToast()

const LETTERS = ['ก', 'ข', 'ค', 'ง', 'จ', 'ฉ']
const VERDICTS = [
  { key: 'correct', label: '✅ ถูกต้อง' },
  { key: 'fix',     label: '🛠️ ต้องแก้' },
  { key: 'wrong',   label: '❌ ผิด' },
]
const VERDICT_LABEL = { correct: 'ถูกต้อง', fix: 'ต้องแก้', wrong: 'ผิด' }

const list = ref([])
const loading = ref(false)
const submitting = ref(false)
const skippedIds = ref(new Set())
const verdict = ref(null)
const reason = ref('')
const refText = ref('')
const priorReviews = ref([])

const myUid = computed(() => authStore.currentUser?.uid || null)

// คิวข้อที่ต้องให้ฉันตรวจ ลบข้อที่กด "ข้าม" ในเซสชันนี้
const queue = computed(() =>
  nextReviewQueue(list.value, myUid.value).filter(q => !skippedIds.value.has(q.id)))
const current = computed(() => queue.value[0] || null)
const currentStatus = computed(() => current.value ? computeStatus(current.value.reviewVerdicts || {}) : null)

const summary = computed(() => ({
  remaining: nextReviewQueue(list.value, myUid.value).length,
  conflicts: list.value.filter(q => computeStatus(q.reviewVerdicts || {}) === 'conflict').length,
}))

const canSubmit = computed(() => !!verdict.value && !!reason.value.trim())

// uid → ชื่อจริง จาก members store (รวม guestUsers เพราะ instructor=อาจารย์ เป็น guest)
const nameByUid = computed(() => {
  const m = {}
  const all = [...Object.values(members.fbUsers), ...members.guestUsers]
  for (const u of all) if (u.uid) m[u.uid] = u.realName || u.nickname || 'ไม่ระบุ'
  return m
})
const leaderboard = computed(() => buildLeaderboard(tallyReviewCounts(list.value), nameByUid.value))

onMounted(() => {
  if (!authStore.isQuestionEditor) return
  members.loadFbUsers()   // ได้ชื่อจริงให้ leaderboard (cache ข้ามเซสชันถ้ามี)
  load()
})

async function load() {
  loading.value = true
  try {
    const snap = await getDocs(query(collection(db, 'questions'), orderBy('createdAt', 'desc')))
    usage.track(snap.size)
    list.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
  } catch (e) { console.error('[review load]', e); toast('โหลดข้อสอบไม่สำเร็จ', 'error') }
  finally { loading.value = false }
}

// เปลี่ยนข้อปัจจุบัน → ล้างฟอร์ม + โหลดรีวิวเดิมถ้าเป็นข้อ conflict (ให้คนที่ 3 เห็น)
watch(current, async (q) => {
  verdict.value = null; reason.value = ''; refText.value = ''; priorReviews.value = []
  if (q && computeStatus(q.reviewVerdicts || {}) === 'conflict') {
    try {
      const snap = await getDocs(collection(db, 'questions', q.id, 'reviews'))
      usage.track(snap.size)
      priorReviews.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    } catch (e) { console.error('[review priors]', e) }
  }
}, { immediate: true })

function skip() {
  if (!current.value) return
  const next = new Set(skippedIds.value)
  next.add(current.value.id)
  skippedIds.value = next   // Set ใหม่ → computed queue เลื่อนไปข้อถัดไป
}

async function submit() {
  if (!canSubmit.value || submitting.value || !current.value || !myUid.value) return
  submitting.value = true
  const q = current.value
  const uid = myUid.value
  const u = authStore.userData || {}
  const reviewerName = u.realName || u.nickname || u.name || 'ไม่ระบุ'   // snapshot ชื่อจริง
  const v = verdict.value
  const newVerdicts = { ...(q.reviewVerdicts || {}), [uid]: v }
  const newStatus = computeStatus(newVerdicts)
  try {
    const batch = writeBatch(db)
    // 1) รายละเอียดเต็มใน subcollection (doc id = uid → กันตรวจซ้ำ)
    batch.set(doc(db, 'questions', q.id, 'reviews', uid), {
      reviewerUid: uid,
      reviewerName,
      verdict: v,
      reason: cleanText(reason.value, LIMITS.reviewReason),
      ref: cleanText(refText.value, LIMITS.reviewRef),
      ts: serverTimestamp(),
    })
    // 2) aggregate บนเอกสารข้อสอบ (ให้ pull-model หาข้อถัดไปจากการอ่านคลังครั้งเดียว)
    batch.update(doc(db, 'questions', q.id), {
      reviewedBy: arrayUnion(uid),
      [`reviewVerdicts.${uid}`]: v,
      reviewStatus: newStatus,
    })
    await batch.commit()
    usage.track(0, 2)
    // อัปเดต local list ให้คิว/leaderboard เลื่อนทันที (ไม่ reload ทั้งคลัง)
    const idx = list.value.findIndex(x => x.id === q.id)
    if (idx >= 0) {
      const reviewedBy = [...(q.reviewedBy || [])]
      if (!reviewedBy.includes(uid)) reviewedBy.push(uid)
      list.value[idx] = { ...q, reviewedBy, reviewVerdicts: newVerdicts, reviewStatus: newStatus }
    }
    toast('ส่งผลตรวจแล้ว ขอบคุณ!', 'success')
  } catch (e) { console.error('[review submit]', e); toast('ส่งไม่สำเร็จ', 'error') }
  finally { submitting.value = false }
}
</script>

<style scoped>
.rv-head { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 12px; }
.rv-title { font-family: var(--font-display); font-weight: 400; font-size: 1.5rem; color: var(--ink); line-height: 1.1; }
.rv-back { font-size: .72rem; font-weight: 700; color: #4f46e5; text-decoration: none; }
.rv-denied, .rv-empty { text-align: center; color: rgba(0,0,0,.4); padding: 26px 0; font-size: .85rem; }
.rv-done { color: #15803d; font-weight: 700; }

.rv-summary { font-size: .76rem; color: var(--ink); background: var(--primary-light, #eef2ff); border-radius: 10px; padding: 9px 12px; margin-bottom: 12px; line-height: 1.5; }
.rv-summary b { font-weight: 800; }

.rv-card { background: #fff; border: 2px solid var(--ink); border-radius: 16px; box-shadow: var(--pop); padding: 14px; margin-bottom: 16px; }
.rv-card-tags { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; margin-bottom: 9px; }
.rv-cat { font-size: .62rem; color: #4f46e5; font-weight: 700; }
.rv-cat-sub { color: rgba(0,0,0,.45); }
.rv-draft { font-size: .58rem; font-weight: 800; padding: 2px 8px; border-radius: 999px; background: rgba(0,0,0,.07); color: rgba(0,0,0,.5); }
.rv-conflict-badge { font-size: .62rem; font-weight: 800; padding: 2px 9px; border-radius: 999px; background: #fff7ed; color: #c2410c; }
.rv-q { font-size: .92rem; font-weight: 700; color: var(--ink); line-height: 1.5; margin-bottom: 11px; white-space: pre-wrap; overflow-wrap: anywhere; }
.rv-choices { list-style: none; margin: 0 0 4px; padding: 0; display: flex; flex-direction: column; gap: 5px; }
.rv-choices li { font-size: .8rem; color: rgba(0,0,0,.65); display: flex; gap: 8px; align-items: baseline; padding: 7px 10px; border-radius: 9px; background: #f8fafc; }
.rv-choices li.correct { background: rgba(34,197,94,.12); color: #15803d; font-weight: 700; }
.rv-c-letter { font-weight: 800; flex-shrink: 0; }
.rv-c-text { flex: 1; min-width: 0; overflow-wrap: anywhere; }
.rv-c-mark { flex-shrink: 0; font-size: .62rem; font-weight: 800; color: #15803d; }
.rv-exp { margin-top: 9px; font-size: .74rem; color: #b45309; background: #fffbeb; border-radius: 8px; padding: 8px 10px; line-height: 1.45; }

.rv-priors { margin-top: 12px; border-top: 1px dashed var(--border); padding-top: 11px; }
.rv-priors-head { font-size: .7rem; font-weight: 800; color: #c2410c; margin-bottom: 7px; }
.rv-prior { background: #fffdf7; border: 1px solid rgba(0,0,0,.08); border-radius: 10px; padding: 9px 11px; margin-bottom: 7px; }
.rv-prior-top { display: flex; align-items: center; gap: 8px; font-size: .78rem; margin-bottom: 4px; }
.rv-prior-verdict { font-size: .6rem; font-weight: 800; padding: 1px 7px; border-radius: 999px; }
.rv-prior-verdict.correct { background: rgba(34,197,94,.15); color: #15803d; }
.rv-prior-verdict.fix { background: rgba(245,158,11,.16); color: #b45309; }
.rv-prior-verdict.wrong { background: rgba(239,68,68,.12); color: #dc2626; }
.rv-prior-reason { font-size: .76rem; color: rgba(0,0,0,.7); line-height: 1.45; white-space: pre-wrap; overflow-wrap: anywhere; }
.rv-prior-ref { font-size: .68rem; color: rgba(0,0,0,.45); margin-top: 3px; overflow-wrap: anywhere; }

.rv-form { margin-top: 13px; border-top: 1px dashed var(--border); padding-top: 12px; }
.rv-verdicts { display: flex; gap: 7px; margin-bottom: 11px; }
.rv-vbtn { flex: 1; border: 2px solid var(--ink); border-radius: 11px; padding: 10px 6px; font-family: inherit; font-size: .78rem; font-weight: 800; background: #fff; color: var(--ink); cursor: pointer; transition: transform .1s; }
.rv-vbtn:active { transform: translate(1px,1px); }
.rv-vbtn.correct.on { background: #22c55e; border-color: #22c55e; color: #fff; }
.rv-vbtn.fix.on { background: #f59e0b; border-color: #f59e0b; color: #fff; }
.rv-vbtn.wrong.on { background: #ef4444; border-color: #ef4444; color: #fff; }
.rv-label { display: block; font-size: .68rem; font-weight: 700; color: #64748b; margin: 9px 0 5px; }
.rv-input { width: 100%; box-sizing: border-box; border: 2px solid var(--ink); border-radius: 10px; padding: 9px 11px; font-family: inherit; font-size: .82rem; resize: vertical; }
.rv-input:focus { outline: none; box-shadow: var(--pop); }
.rv-actions { display: flex; gap: 8px; margin-top: 13px; }
.rv-btn { flex: 1; border: 2px solid var(--ink); border-radius: 11px; padding: 11px; font-family: inherit; font-size: .85rem; font-weight: 800; cursor: pointer; transition: transform .12s, box-shadow .12s; }
.rv-primary { background: var(--primary); color: #fff; box-shadow: var(--pop); }
.rv-primary:active:not(:disabled) { transform: translate(2px,2px); box-shadow: 0 0 0 var(--ink); }
.rv-primary:disabled { background: #cbd5e1; cursor: default; box-shadow: none; }
.rv-gray { background: #fff; color: var(--ink); flex: 0 0 110px; }

.rv-board { background: #fff; border: 2px solid var(--ink); border-radius: 16px; box-shadow: var(--pop); padding: 14px; }
.rv-board-head { font-weight: 800; font-size: .9rem; margin-bottom: 10px; }
.rv-board-empty { padding: 14px 0; }
.rv-board-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 4px; counter-reset: rank; }
.rv-board-row { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 7px 10px; border-radius: 9px; font-size: .82rem; }
.rv-board-row::before { counter-increment: rank; content: counter(rank); flex-shrink: 0; width: 20px; font-weight: 800; color: rgba(0,0,0,.35); font-size: .72rem; }
.rv-board-row.me { background: var(--primary-light, #eef2ff); }
.rv-board-name { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-weight: 600; }
.rv-you { color: #4f46e5; font-weight: 800; }
.rv-board-count { flex-shrink: 0; font-weight: 800; color: var(--ink); font-size: .78rem; }
</style>
```

- [ ] **Step 2: รัน build ให้เขียว**

Run: `npm run build`
Expected: build สำเร็จ ไม่มี error (มี chunk `ReviewView-*.js` ใน output)

- [ ] **Step 3: Commit**

```bash
git add src/views/ReviewView.vue
git commit -m "Review: หน้า /review ตรวจข้อสอบ pull-model (ฟอร์มตัดสิน 3 ระดับ + write batch 2 จุด + leaderboard + กันอคติ conflict)"
```

---

### Task 5: ทางเข้า — ลิงก์ใน StudyView + AdminView

**Files:**
- Modify: `src/views/StudyView.vue:47-55` (เพิ่ม RouterLink ใต้ "จัดการคลังข้อสอบ")
- Modify: `src/views/AdminView.vue:30-47` (เพิ่ม section การ์ดทางลัด)

**Interfaces:**
- Consumes: route `/review` (Task 3), getter `authStore.isQuestionEditor` / `authStore.isAdmin`
- Produces: 2 ทางเข้าหน้า review

- [ ] **Step 1: ลิงก์ใน StudyView (ใต้การ์ดจัดการคลังข้อสอบ)**

ใน `src/views/StudyView.vue` ต่อจาก `</RouterLink>` ของ "จัดการคลังข้อสอบ" (บรรทัด 55) ก่อน `</template>` เพิ่ม:

```html
      <RouterLink v-if="authStore.isQuestionEditor" to="/review" class="sv-quizlink sv-acadlink">
        <span class="sv-quizlink-emoji"><Emoji char="🔍" /></span>
        <span class="sv-quizlink-text">
          <b>ตรวจข้อสอบ (วิชาการ)</b>
          <small>ระบบสุ่มข้อให้ช่วยตรวจความถูกต้อง · เฉพาะทีมวิชาการ</small>
        </span>
        <span class="sv-quizlink-go">›</span>
      </RouterLink>
```

- [ ] **Step 2: ปุ่มใน AdminView (การ์ดทางลัด)**

ใน `src/views/AdminView.vue` หลัง `</section>` ของการ์ด "สนามประลอง (PvP)" (บรรทัด 47) เพิ่ม section ใหม่:

```html
      <section class="admin-card">
        <div class="admin-card-head"><span><Emoji char="🔍" /> ตรวจข้อสอบ (วิชาการ)</span></div>
        <div class="admin-hint">
          สุ่มป้อนข้อให้ทีมวิชาการ+อาจารย์ช่วยตรวจความถูกต้อง — ดูได้ว่าใครตรวจไปกี่ข้อ
        </div>
        <RouterLink to="/review" class="btn-mini btn-gold" style="display:inline-block;text-decoration:none;margin-top:4px">
          ไปหน้าตรวจข้อสอบ 🔍
        </RouterLink>
      </section>
```

- [ ] **Step 3: ตรวจว่า RouterLink import พร้อมใช้ใน AdminView**

Run: `node --test 2>/dev/null; grep -n "RouterLink\|router-link" src/views/AdminView.vue`
Expected: ถ้า AdminView **ยังไม่** import/ใช้ `RouterLink` ที่ไหนเลย ให้เพิ่ม `import { RouterLink } from 'vue-router'` ในบล็อก `<script setup>` (RouterLink เป็น global component อยู่แล้ว แต่ import ชัดเจนกันพลาด) — ถ้ามีใช้อยู่แล้วข้ามขั้นนี้
> StudyView ใช้ `<RouterLink>` แบบ global อยู่แล้ว (ไม่ import) → ไม่ต้องแตะ import ฝั่ง StudyView

- [ ] **Step 4: รัน build ให้เขียว**

Run: `npm run build`
Expected: build สำเร็จ ไม่มี error

- [ ] **Step 5: Commit**

```bash
git add src/views/StudyView.vue src/views/AdminView.vue
git commit -m "Review: เพิ่มทางเข้าหน้าตรวจข้อสอบใน StudyView + AdminView"
```

---

## Self-Review

**1. Spec coverage:**
- §2 pull-model/canEditQuestions/คิวทุกข้อ/กันตรวจเอง+ซ้ำ → Task 1 (`needsReviewBy`, `nextReviewQueue`) + Task 4 (gate, current)
- §3.1 aggregate fields → Task 4 submit (`reviewedBy`/`reviewVerdicts`/`reviewStatus`)
- §3.2 subcollection + snapshot ชื่อจริง → Task 2 (rules) + Task 4 (submit `reviewerName`)
- §3.3 ตัวนับไม่สร้าง collection ใหม่ → Task 1 (`tallyReviewCounts`/`buildLeaderboard`) + Task 4 (leaderboard)
- §4 write path 2 จุด batch → Task 4 submit
- §5 pure util ตรรกะสถานะ → Task 1
- §6 หน้า+ฟอร์ม+กันอคติ conflict → Task 4 · ทางเข้า StudyView/AdminView → Task 5
- §7 rules + deploy → Task 2 · ไม่มี index ใหม่ ✓
- §8 ไม่ gate การเผยแพร่ → ไม่มี task แตะ publish ✓ (ตาม YAGNI)
- §9 ไฟล์ทั้งหมด → ครอบคลุม (QuestionsView badge optional **ตัดออก** ตาม YAGNI — ไม่อยู่ในเฟสนี้)

**2. Placeholder scan:** ไม่มี TBD/TODO/"handle edge cases" — โค้ดเต็มทุก step ✓

**3. Type consistency:** verdict `'correct'|'fix'|'wrong'` + status `'pending'|'passed'|'conflict'|'failed'` ใช้ตรงกันทุก task · `reviewerName`/`reviewerUid`/`reviewedBy`/`reviewVerdicts`/`reviewStatus` ตรงกันระหว่าง rules (Task 2) ↔ util (Task 1) ↔ view submit (Task 4) · `buildLeaderboard` คืน `{uid,name,count}` ตรงกับ template leaderboard ✓

---

## Execution Handoff

**ลำดับ task:** 1 → 2 → 3 → 4 → 5 (Task 3 ทำให้ build ล้มชั่วคราวจนกว่า Task 4 เสร็จ — รันคู่กัน)
หลังจบทุก task: `npm run build` เขียว + `node --test src/utils/questionReview.test.js` ผ่าน → push `master` (deploy Pages) + ยืนยัน rules deploy แล้ว
