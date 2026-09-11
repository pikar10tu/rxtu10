# ปิดลูปตรวจข้อสอบ — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** ให้ทีมวิชาการแก้ข้อสอบได้ตั้งแต่หน้าตรวจ แล้วข้อวนกลับเข้าคิวหรือไม่วน ตามสิ่งที่ถูกแก้ พร้อมอุดรูที่ทำให้คนแก้ตรวจงานตัวเองได้

**Architecture:** ดึงฟอร์มข้อสอบจาก `QuestionsView` ออกเป็น `QuestionEditor.vue` + ตรรกะ payload ล้วนใน `questionDraft.js` แล้วให้ `/questions` กับ `/review` เรียกของชุดเดียวกัน · แยกเนื้อหาข้อสอบเป็น 2 ชั้น (ชั้นตัดสินถูก/ผิด vs ชั้นประกอบ) เพื่อตัดสินว่าการแก้ครั้งนั้นต้องล้างผลตรวจไหม

**Tech Stack:** Vue 3 (script setup, `defineProps`/`defineEmits` ตามแบบ `TopicSelect.vue` — รีโปนี้ไม่ใช้ `defineModel`) · Pinia · Firebase Firestore v9 modular · เทส `node:test` + `node:assert/strict`

**สเปกอ้างอิง:** `docs/superpowers/specs/2026-09-11-review-edit-loop-design.md`

## Global Constraints

- **เทสทั้งรีโป:** `node --test "src/**/*.test.js"` — baseline ก่อนเริ่ม **1,193 pass / 0 fail** ห้ามลดลง
- **เทสไฟล์เดียว:** `node --test src/utils/<ชื่อ>.test.js`
- **บิลด์:** `npm run build` — ไม่มี lint/test runner กลาง บิลด์ผ่าน = เกณฑ์ขั้นต่ำของงานฝั่ง `.vue`
- **ห้าม `firebase deploy --only firestore:rules`** — งานนี้ไม่แตะ `firestore.rules` เลย
- **ห้ามมี `font-size` ต่ำกว่า `.7rem`** ในไฟล์ `.vue`/`.css` (CLAUDE.md) ตรวจ: `grep -rnE "font-size:\s*\.[0-6][0-9]?rem" src/`
- **ข้อความจากผู้ใช้ทุกช่องต้องผ่าน `cleanText(str, LIMITS.xxx)`** จาก `utils/text.js` ก่อนเขียน Firestore
- **`questions.categories` เป็นค่า derive ห้ามเขียนมือ** — ต้องผ่าน `plePatch(group, sub)` เสมอ (CLAUDE.md ข้อ 14)
- **UI เป็นภาษาไทย** · โทนตาม `docs/voice-guide.md` (เป็นกันเอง อธิบายชัด ไม่หวือหวา)
- **commit format:** `Area: อะไร (ทำไม)` เป็นภาษาไทยปนอังกฤษ · commit บน `master` · **ห้าม push** (push = deploy ขึ้นเว็บจริงผ่าน GitHub Actions) จนกว่า user จะสั่ง
- **`overlay position:fixed` ใต้ `<RouterView>` ต้อง `<Teleport to="body">`** (CLAUDE.md ข้อ 6) — แผนนี้ไม่มี overlay ใหม่ ฟอร์มแก้กางในที่ ไม่ใช่ modal

## File Structure

| ไฟล์ | หน้าที่ |
|---|---|
| `src/utils/questionDraft.js` *(ใหม่)* | pure — แปลง doc ↔ draft ↔ payload · แหล่งเดียวของ "payload หน้าตายังไง" |
| `src/utils/questionDraft.test.js` *(ใหม่)* | เทสของไฟล์บน |
| `src/components/questions/QuestionEditor.vue` *(ใหม่)* | ฟอร์มล้วน ไม่ import firebase · `compact` ซ่อนช่องที่คนตรวจไม่ต้องใช้ |
| `src/utils/questionReview.js` | เพิ่ม `verdictContentChanged`/`sideContentChanged` · ลบ `reviewContentChanged` · `needsReviewBy` รู้จัก `lastFixBy` |
| `src/utils/questionReview.test.js` | อัปเดตเทสตาม |
| `src/views/QuestionsView.vue` | ใช้ `QuestionEditor` + `questionDraft` แทนโค้ดฟอร์มของตัวเอง |
| `src/views/ReviewView.vue` | ฟอร์มแก้ในที่ · 2 เส้นทางเขียน · ประวัติรอบก่อน · คอมเมนต์ · นำออก · แก้หมวดในกอง |

**ลำดับ task บังคับ** — 1 → 2 → 3 → 4 → 5 → 6 → 7 (Task 4–7 แก้ `ReviewView.vue` ไฟล์เดียวกันต่อกันเป็นทอด)

---

## Task 1: `questionDraft.js` — payload มีสูตรเดียว

**Files:**
- Create: `src/utils/questionDraft.js`
- Test: `src/utils/questionDraft.test.js`

**Interfaces:**
- Consumes: `cleanText`/`LIMITS` จาก `utils/text.js` · `plePatch`/`pleFields` จาก `utils/pleMapping.js` · `qhash` จาก `utils/qhash.js`
- Produces:
  - `draftFrom(question: object|null) -> draft` — `draft = { id, question, choices: string[], answer: number, ple: {group, sub}, reviewNote, explanation, isPublished, domain, examSets }`
  - `draftPayload(draft) -> payload` — object พร้อมเขียน Firestore (**ไม่มี `updatedAt`** — ผู้เรียกเติมเอง)
  - `draftValid(draft) -> boolean` — **ไม่เช็คกลุ่มโรค** (หน้าคลังบังคับเอง ฟอร์มย่อในหน้าตรวจไม่มีช่องนั้น)

- [ ] **Step 1: เขียนเทสที่ยังไม่ผ่าน**

สร้าง `src/utils/questionDraft.test.js`:

```js
// เทส questionDraft — แปลง doc ↔ draft ↔ payload (pure ทั้งไฟล์)
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { draftFrom, draftPayload, draftValid } from './questionDraft.js'

// ── draftFrom ──
test('draftFrom(null) = ข้อใหม่ ได้ช่องว่าง 4 ตัวเลือกและ key ครบทุกตัวที่ draftPayload ต้องใช้', () => {
  const d = draftFrom(null)
  assert.equal(d.id, null)
  assert.equal(d.question, '')
  assert.deepEqual(d.choices, ['', '', '', ''])
  assert.equal(d.answer, 0)
  assert.deepEqual(d.ple, { group: null, sub: null })
  assert.equal(d.explanation, '')
  assert.equal(d.reviewNote, '')
  assert.equal(d.isPublished, false)
  assert.equal(d.domain, null)
  assert.deepEqual(d.examSets, [])
})

test('draftFrom(doc) ก๊อป choices/examSets เป็น array ใหม่ — แก้ draft แล้วต้องไม่กระทบ doc เดิม', () => {
  const doc = { id: 'q1', question: 'Q', choices: ['a', 'b'], answer: 1, examSets: ['s1'] }
  const d = draftFrom(doc)
  d.choices.push('c')
  d.examSets.push('s2')
  assert.deepEqual(doc.choices, ['a', 'b'])
  assert.deepEqual(doc.examSets, ['s1'])
  assert.equal(d.answer, 1)
})

test('draftFrom ก๊อปช่องที่ฟอร์มย่อซ่อนไว้มาด้วย — ไม่งั้นบันทึกจากหน้าตรวจแล้วค่าหาย', () => {
  const doc = { id: 'q1', question: 'Q', choices: ['a', 'b'], answer: 0, pleGroup: 'cardio', domain: 'pharm', isPublished: true, examSets: ['s1'] }
  const d = draftFrom(doc)
  assert.equal(d.domain, 'pharm')
  assert.equal(d.isPublished, true)
  assert.deepEqual(d.examSets, ['s1'])
  assert.equal(d.ple.group, 'cardio')
})

// ── draftPayload ──
test('draftPayload ตัดตัวเลือกว่างท้ายทิ้ง แล้ว clamp answer เป็น 0 เมื่อเฉลยชี้ตัวที่ถูกตัด', () => {
  const p = draftPayload({ question: 'Q', choices: ['a', 'b', '', ''], answer: 3, ple: { group: null, sub: null } })
  assert.deepEqual(p.choices, ['a', 'b'])
  assert.equal(p.answer, 0)
})

test('draftPayload เก็บ answer ไว้เมื่อยังชี้ตัวเลือกที่มีจริง', () => {
  const p = draftPayload({ question: 'Q', choices: ['a', 'b', 'c'], answer: 2, ple: { group: null, sub: null } })
  assert.equal(p.answer, 2)
})

test('draftPayload: explanation/reviewNote ว่าง → null ไม่ใช่ string ว่าง', () => {
  const p = draftPayload({ question: 'Q', choices: ['a', 'b'], answer: 0, explanation: '   ', reviewNote: '', ple: { group: null, sub: null } })
  assert.equal(p.explanation, null)
  assert.equal(p.reviewNote, null)
})

test('draftPayload คำนวณ qhash จากโจทย์ที่ cleanText แล้ว — โจทย์เท่ากันได้ hash เท่ากัน', () => {
  const a = draftPayload({ question: '  ยาลดความดัน  ', choices: ['a', 'b'], answer: 0, ple: { group: null, sub: null } })
  const b = draftPayload({ question: 'ยาลดความดัน', choices: ['a', 'b'], answer: 0, ple: { group: null, sub: null } })
  assert.equal(a.qhash, b.qhash)
  assert.equal(typeof a.qhash, 'string')
})

test('draftPayload ไม่ใส่ updatedAt — ผู้เรียกเติม serverTimestamp() เอง (pure ห้ามแตะ Firestore)', () => {
  const p = draftPayload({ question: 'Q', choices: ['a', 'b'], answer: 0, ple: { group: null, sub: null } })
  assert.equal('updatedAt' in p, false)
})

test('draftPayload: กลุ่มโรคไม่ถูกต้อง → ไม่เขียน pleGroup/categories เลย (plePatch คืน null)', () => {
  const p = draftPayload({ question: 'Q', choices: ['a', 'b'], answer: 0, ple: { group: null, sub: null } })
  assert.equal('pleGroup' in p, false)
  assert.equal('categories' in p, false)
})

// ── draftValid ──
test('draftValid: ตัวเลือกไม่ถึง 2 ตัว → ไม่ผ่าน', () => {
  assert.equal(draftValid({ question: 'Q', choices: ['a', '', '', ''], answer: 0 }), false)
})

test('draftValid: โจทย์ว่าง → ไม่ผ่าน', () => {
  assert.equal(draftValid({ question: '   ', choices: ['a', 'b'], answer: 0 }), false)
})

test('draftValid: เฉลยชี้ช่องว่าง → ไม่ผ่าน', () => {
  assert.equal(draftValid({ question: 'Q', choices: ['a', 'b', ''], answer: 2 }), false)
})

test('draftValid: ครบเงื่อนไข → ผ่าน (ไม่สนกลุ่มโรค — หน้าคลังบังคับเอง)', () => {
  assert.equal(draftValid({ question: 'Q', choices: ['a', 'b'], answer: 1 }), true)
})
```

- [ ] **Step 2: รันเทสให้เห็นว่าพัง**

```
node --test src/utils/questionDraft.test.js
```

คาดว่า: FAIL — `Cannot find module ... questionDraft.js`

- [ ] **Step 3: เขียน `questionDraft.js`**

สร้าง `src/utils/questionDraft.js`:

```js
// ════════════════════════════════════════════════════════════
//  questionDraft — แปลงระหว่าง "เอกสารข้อสอบ" กับ "ฟอร์มที่คนกรอก" (pure ทั้งไฟล์)
//  ใช้ร่วมกัน 2 หน้า: /questions (ฟอร์มเต็ม) และ /review (ฟอร์มย่อ)
//
//  🔑 payload ที่เขียนลง Firestore มีสูตรเดียวอยู่ที่นี่ — สองหน้าจึงเขียนเหมือนกันเป๊ะ
//     (เดิมสูตรอยู่ใน QuestionsView.save() หน้าเดียว พอหน้าตรวจแก้ข้อได้ด้วยจะกลายเป็นสองสูตร)
//
//  ⚠️ ไม่ใส่ updatedAt/serverTimestamp ที่นี่ — ไฟล์นี้ต้อง import ไม่ติด firebase เพื่อให้เทสได้
//  ⚠️ draftValid ไม่เช็คกลุ่มโรค: ฟอร์มย่อในหน้าตรวจไม่มีช่องนั้น (ฟอร์มตรวจมี TopicSelect ของตัวเอง)
//     หน้าคลังที่บังคับกลุ่มโรคต้องเช็ค isPleGroupKey เองต่อท้าย
// ════════════════════════════════════════════════════════════
import { cleanText, LIMITS } from './text.js'
import { plePatch, pleFields } from './pleMapping.js'
import { qhash } from './qhash.js'

// doc (หรือ null = ข้อใหม่) → draft สำหรับผูกกับฟอร์ม
// ก๊อป array ใหม่เสมอ — แก้ในฟอร์มต้องไม่ไปกลายพันธุ์แถวที่ค้างอยู่ใน list ของ view
export function draftFrom(question) {
  const q = question || {}
  return {
    id: q.id ?? null,
    question: q.question || '',
    // ข้อที่มีตัวเลือกน้อยกว่า 2 คือข้อเสียอยู่แล้ว — ให้ช่องว่าง 4 ช่องเหมือนข้อใหม่
    choices: (Array.isArray(q.choices) && q.choices.length >= 2) ? [...q.choices] : ['', '', '', ''],
    answer: q.answer || 0,
    ple: pleFields(q),
    reviewNote: q.reviewNote || '',
    explanation: q.explanation || '',
    isPublished: !!q.isPublished,
    domain: q.domain || null,
    examSets: Array.isArray(q.examSets) ? [...q.examSets] : [],
  }
}

// draft → payload พร้อมเขียน Firestore (ผู้เรียกเติม updatedAt/REVIEW_RESET เอง)
export function draftPayload(draft) {
  const d = draft || {}
  const question = cleanText(d.question, LIMITS.question)
  const choices = (d.choices || []).map(c => cleanText(c, LIMITS.choice)).filter(Boolean)
  // ตัวเลือกว่างท้ายถูกตัดทิ้งแล้วเฉลยอาจชี้เลยขอบ — ดึงกลับมาข้อแรก (พฤติกรรมเดิมของ QuestionsView)
  let answer = Number.isInteger(d.answer) && d.answer >= 0 ? d.answer : 0
  if (answer >= choices.length) answer = 0
  return {
    question,
    choices,
    answer,
    // plePatch คืน null เมื่อกลุ่มไม่ถูกต้อง — spread null ได้ {} จึงไม่เขียนหมวดเลย
    // (categories เป็นค่า derive ห้ามเขียนมือ ดู CLAUDE.md ข้อ 14)
    ...plePatch(d.ple?.group, d.ple?.sub),
    reviewNote: cleanText(d.reviewNote, LIMITS.reviewNote) || null,
    explanation: cleanText(d.explanation, LIMITS.explanation) || null,
    isPublished: !!d.isPublished,
    domain: d.domain || null,
    examSets: Array.isArray(d.examSets) ? d.examSets : [],
    qhash: qhash(question),   // กันข้อซ้ำ + อัปเดตเมื่อโจทย์เปลี่ยน
  }
}

// พอที่จะบันทึกได้ไหม — โจทย์มี · ตัวเลือกที่กรอกจริง ≥ 2 · เฉลยชี้ตัวที่กรอกแล้ว
export function draftValid(draft) {
  const d = draft || {}
  const choices = d.choices || []
  const filled = choices.filter(c => String(c ?? '').trim()).length
  return !!(String(d.question ?? '').trim() && filled >= 2 && String(choices[d.answer] ?? '').trim())
}
```

- [ ] **Step 4: รันเทสให้ผ่าน**

```
node --test src/utils/questionDraft.test.js
```

คาดว่า: PASS ทั้งหมด (13 tests)

- [ ] **Step 5: รันเทสทั้งรีโปกันของเก่าพัง**

```
node --test "src/**/*.test.js"
```

คาดว่า: `pass 1206 / fail 0` (1,193 เดิม + 13 ใหม่)

- [ ] **Step 6: commit**

```bash
git add src/utils/questionDraft.js src/utils/questionDraft.test.js
git commit -m "Questions: แยกตรรกะ draft/payload ออกเป็น questionDraft.js (เตรียมให้หน้าตรวจใช้ฟอร์มเดียวกับหน้าคลัง)"
```

---

## Task 2: แยกเนื้อหา 2 ชั้น + อุดรูตรวจงานตัวเอง

**Files:**
- Modify: `src/utils/questionReview.js:43-52` (แทน `reviewContentChanged`) และ `:34-41` (`needsReviewBy`)
- Modify: `src/utils/questionReview.test.js:5` (import) และ `:74-93` (บล็อกเทสของ `reviewContentChanged`)
- Modify: `src/views/QuestionsView.vue:432` (import) และ `:929` (จุดเรียก)

**Interfaces:**
- Consumes: —
- Produces:
  - `verdictContentChanged(before, after) -> boolean` — เทียบ `question`/`choices`/`answer`
  - `sideContentChanged(before, after) -> boolean` — เทียบ `explanation`/`reviewNote`
  - `needsReviewBy(question, myUid)` เดิม + เงื่อนไขใหม่ `question.lastFixBy === myUid → false`
  - **`reviewContentChanged` ถูกลบ** — ห้ามเหลือ alias

- [ ] **Step 1: เขียนเทสที่ยังไม่ผ่าน**

ใน `src/utils/questionReview.test.js` — แก้บรรทัด import (บรรทัด 5) เป็น:

```js
import { computeStatus, needsReviewBy, verdictContentChanged, sideContentChanged, REVIEW_RESET, tallyReviewCounts, nextReviewQueue, buildLeaderboard, reviewStatusKey, REVIEW_STATUS_LABEL, VERDICT_LABEL, pickRandom } from './questionReview.js'
```

แล้ว**แทนที่บล็อกทั้งบล็อก** ตั้งแต่คอมเมนต์ `// ── reviewContentChanged + REVIEW_RESET ──` (บรรทัด 74) ถึงบรรทัดปิดของเทส `REVIEW_RESET ทำให้ข้อกลับเข้าคิว…` (บรรทัด 98) ด้วย:

```js
// ── verdictContentChanged / sideContentChanged + REVIEW_RESET ──
// เนื้อหาข้อสอบมี 2 ชั้น: ชั้นตัดสินถูก/ผิด (โจทย์/ตัวเลือก/เฉลย) กับชั้นประกอบ (คำอธิบาย/หมายเหตุ)
// แก้ชั้นบน = ผลตรวจเดิมใช้ไม่ได้ ต้องล้าง · แก้ชั้นล่าง = ผลตรวจเดิมยังใช้ได้
test('verdictContentChanged: แก้คำอธิบายไม่นับ — ผลตรวจเดิมยังใช้ได้ (toggle publish/หมวดก็ไม่นับ)', () => {
  const before = { question: 'Q', choices: ['a', 'b'], answer: 0, explanation: 'e', isPublished: false, category: 'x' }
  const after  = { question: 'Q', choices: ['a', 'b'], answer: 0, explanation: 'แก้ใหม่', isPublished: true, category: 'y' }
  assert.equal(verdictContentChanged(before, after), false)
})
test('verdictContentChanged: แก้โจทย์/เฉลย/ตัวเลือก → เปลี่ยน', () => {
  const base = { question: 'Q', choices: ['a', 'b'], answer: 0, explanation: null }
  assert.equal(verdictContentChanged(base, { ...base, question: 'Q2' }), true)
  assert.equal(verdictContentChanged(base, { ...base, answer: 1 }), true)
  assert.equal(verdictContentChanged(base, { ...base, choices: ['a', 'c'] }), true)
})
test('verdictContentChanged: ไม่มีข้อมูลเดิมให้เทียบ → ถือว่าเปลี่ยน (ปลอดภัยไว้ก่อน)', () => {
  assert.equal(verdictContentChanged(null, { question: 'Q' }), true)
})
test('sideContentChanged: แก้คำอธิบายหรือหมายเหตุ → เปลี่ยน', () => {
  const base = { question: 'Q', choices: ['a', 'b'], answer: 0, explanation: 'e', reviewNote: null }
  assert.equal(sideContentChanged(base, { ...base, explanation: 'e2' }), true)
  assert.equal(sideContentChanged(base, { ...base, reviewNote: 'ระวังตรงนี้' }), true)
})
test('sideContentChanged: แก้โจทย์อย่างเดียวไม่นับ (คนละชั้นกัน)', () => {
  const base = { question: 'Q', choices: ['a', 'b'], answer: 0, explanation: 'e', reviewNote: null }
  assert.equal(sideContentChanged(base, { ...base, question: 'Q2' }), false)
})
test('sideContentChanged: undefined กับ null ถือว่าเท่ากัน (doc เก่าไม่มีฟิลด์ vs payload ที่เขียน null)', () => {
  const before = { question: 'Q', choices: ['a'], answer: 0 }
  const after  = { question: 'Q', choices: ['a'], answer: 0, explanation: null, reviewNote: null }
  assert.equal(sideContentChanged(before, after), false)
})
test('REVIEW_RESET ทำให้ข้อกลับเข้าคิวและสถานะกลับเป็น pending', () => {
  const q = { reviewedBy: ['x', 'y'], reviewPass: 0, reviewFail: 2, reviewStatus: 'failed', ...REVIEW_RESET }
  assert.equal(computeStatus(q), 'pending')
  assert.equal(needsReviewBy(q, 'x'), true)
})

// ── lastFixBy: คนแก้ข้อไม่ใช่คนตรวจข้อ ──
// 🔴 นี่คือเทสที่กันรูจริง: REVIEW_RESET ล้าง reviewedBy เป็น [] ⇒ เงื่อนไข reviewedBy.length < 1
//    จะคืน true ให้ทุกคนรวมทั้งคนที่เพิ่งแก้ข้อนั้นเอง ถ้าไม่มีบรรทัด lastFixBy
test('needsReviewBy: คนที่เพิ่งแก้ข้อ ตรวจข้อนั้นไม่ได้ แม้ reviewedBy จะว่าง', () => {
  const q = { ...REVIEW_RESET, lastFixBy: 'me' }
  assert.equal(needsReviewBy(q, 'me'), false)
})
test('needsReviewBy: คนอื่นยังตรวจข้อที่ถูกแก้ได้ตามปกติ', () => {
  const q = { ...REVIEW_RESET, lastFixBy: 'someone-else' }
  assert.equal(needsReviewBy(q, 'me'), true)
})
test('needsReviewBy: lastFixBy กันแม้ข้อจะอยู่สถานะ conflict (ไม่ให้ไปตัดสินงานตัวเอง)', () => {
  const q = { reviewedBy: ['a', 'b'], reviewPass: 1, reviewFail: 1, lastFixBy: 'me' }
  assert.equal(computeStatus(q), 'conflict')
  assert.equal(needsReviewBy(q, 'me'), false)
})
```

- [ ] **Step 2: รันเทสให้เห็นว่าพัง**

```
node --test src/utils/questionReview.test.js
```

คาดว่า: FAIL — `SyntaxError: The requested module './questionReview.js' does not provide an export named 'verdictContentChanged'`

- [ ] **Step 3: แก้ `questionReview.js`**

แทนที่บล็อก `reviewContentChanged` เดิม (บรรทัด 43–50 — คอมเมนต์ 2 บรรทัด + ฟังก์ชัน) ด้วย:

```js
// ── เนื้อหาข้อสอบ 2 ชั้น ──
//  ชั้นตัดสินถูก/ผิด: โจทย์/ตัวเลือก/เฉลย — เปลี่ยนแล้ว "คำตัดสินเดิมพูดถึงของที่ไม่มีแล้ว"
//    ⇒ ต้องล้างผลตรวจ กลับเข้าคิวใหม่
//  ชั้นประกอบ: คำอธิบาย/หมายเหตุผู้ตรวจ — เปลี่ยนแล้วผลตรวจเดิมยังใช้ได้ ⇒ ไม่ล้าง
//  ⚠️ เดิมรวม explanation ไว้ชั้นบน ทำให้แก้คำอธิบายทีเดียวโยนงานตรวจซ้ำให้ทั้งทีมฟรีๆ
//     user เคาะ 11 ก.ย. 2026 ให้ย้ายลงชั้นล่าง — แลกกับที่คำอธิบายจะไม่มีใครตรวจซ้ำ
const verdictKey = q => JSON.stringify([q.question, q.choices, q.answer])
export function verdictContentChanged(before, after) {
  if (!before || !after) return true
  return verdictKey(before) !== verdictKey(after)
}

// ใช้ตอบคำถามเดียว: "กดบันทึกได้หรือยัง" — ฟอร์มแก้ในหน้าตรวจเปิดปุ่มเมื่อชั้นใดชั้นหนึ่งเปลี่ยน
const sideKey = q => JSON.stringify([q.explanation ?? null, q.reviewNote ?? null])
export function sideContentChanged(before, after) {
  if (!before || !after) return true
  return sideKey(before) !== sideKey(after)
}
```

จากนั้นใน `needsReviewBy` เติมบรรทัดเดียว **ต่อจาก** บรรทัด `if (question.createdBy === myUid && question.source !== 'import') return false`:

```js
  // คนแก้ข้อไม่ใช่คนตรวจข้อ — REVIEW_RESET ล้าง reviewedBy เป็น [] ทำให้ข้อเด้งกลับเข้าคิว
  // ของคนที่เพิ่งแก้มันเอง ถ้าไม่กันตรงนี้ ตาที่สองจะหายไปเงียบๆ
  // ไม่มีข้อยกเว้น source==='import' แบบ createdBy เพราะ lastFixBy คือคนที่ลงมือแก้เนื้อหาจริงเสมอ
  if (question.lastFixBy === myUid) return false
```

- [ ] **Step 4: อัปเดตจุดเรียกใน `QuestionsView.vue`**

บรรทัด 432 — เปลี่ยนชื่อที่ import:

```js
import { verdictContentChanged, REVIEW_RESET, reviewStatusKey, REVIEW_STATUS_LABEL, VERDICT_LABEL } from '../utils/questionReview.js'
```

บรรทัด 927–932 — แก้เงื่อนไขและคอมเมนต์เหนือมัน:

```js
      // เนื้อหาชั้นตัดสินถูก/ผิด (โจทย์/ตัวเลือก/เฉลย) เปลี่ยน → ล้างผลตรวจ ให้กลับเข้าคิว peer-review
      // คำอธิบาย/หมายเหตุ/หมวด/toggle publish ไม่ล้าง (ไม่ทิ้งงานผู้ตรวจฟรี)
      const before = list.value.find(q => q.id === d.id)
      if (verdictContentChanged(before, payload)) {
        // แก้เนื้อหา = ตั้งใจนำกลับมาใช้ — ล้างทั้งผลตรวจและสถานะนำออก ให้วนเข้าคิวตรวจใหม่
        Object.assign(payload, REVIEW_RESET, { reviewVerdicts: deleteField(), retired: deleteField() })
      }
```

- [ ] **Step 5: ยืนยันว่าไม่เหลือชื่อเก่า**

```
grep -rn "reviewContentChanged" src/
```

คาดว่า: ไม่เจออะไรเลย (exit code 1)

- [ ] **Step 6: รันเทส + บิลด์**

```
node --test "src/**/*.test.js"
npm run build
```

คาดว่า: `pass 1211 / fail 0` (1,206 จาก Task 1 − 5 เทสเก่าที่ถูกแทน + 10 เทสใหม่) · build สำเร็จ

> หมายเหตุ: ตัวเลขรวมเป็นค่าประมาณ — เกณฑ์จริงคือ **`fail 0`** และจำนวนต้องไม่ต่ำกว่า 1,193

- [ ] **Step 7: commit**

```bash
git add src/utils/questionReview.js src/utils/questionReview.test.js src/views/QuestionsView.vue
git commit -m "Review: แยกเนื้อหาข้อสอบเป็นชั้นตัดสิน/ชั้นประกอบ + กันคนแก้ข้อตรวจข้อตัวเอง (lastFixBy)"
```

---

## Task 3: `QuestionEditor.vue` — ฟอร์มมีที่เดียว

**Files:**
- Create: `src/components/questions/QuestionEditor.vue`
- Modify: `src/views/QuestionsView.vue` — template ฟอร์ม (บรรทัด 203–240), `blankDraft`/`valid`/`removeChoice` (บรรทัด 594–620), `save()` (บรรทัด 905–924), `startEdit` (บรรทัด 1005–1020), CSS ฟอร์ม (บรรทัด 1175–1186)

**Interfaces:**
- Consumes: `draftFrom`/`draftPayload`/`draftValid` จาก Task 1
- Produces: `<QuestionEditor v-model="draft" :compact="false" />` — component ที่ Task 4 จะเรียกด้วย `:compact="true"`

**เกณฑ์ผ่านของ task นี้: พฤติกรรมหน้าคลังต้องเหมือนเดิมเป๊ะ** (refactor ล้วน ไม่มีฟีเจอร์ใหม่)

- [ ] **Step 1: สร้าง `QuestionEditor.vue`**

```vue
<template>
  <div class="qe">
    <label class="qz-label">โจทย์</label>
    <textarea v-model="question" :maxlength="LIMITS.question" class="qz-input" rows="3" placeholder="พิมพ์คำถาม…"></textarea>

    <label class="qz-label">ตัวเลือก (กดวงกลมเพื่อเลือกข้อที่ถูก)</label>
    <div v-for="(c, i) in modelValue.choices" :key="i" class="qz-choice">
      <button
        class="qz-radio" :class="{ on: modelValue.answer === i }"
        type="button" @click="set({ answer: i })"
        :title="modelValue.answer === i ? 'ข้อที่ถูก' : 'ตั้งเป็นข้อที่ถูก'"
      >{{ modelValue.answer === i ? '✓' : LETTERS[i] }}</button>
      <input
        :value="c" :maxlength="LIMITS.choice" class="qz-input qz-choice-in"
        :placeholder="`ตัวเลือก ${LETTERS[i]}`" @input="setChoice(i, $event.target.value)"
      />
      <button class="qz-del-choice" type="button" :disabled="modelValue.choices.length <= 2" @click="removeChoice(i)">✕</button>
    </div>
    <button class="qz-add-choice" type="button" :disabled="modelValue.choices.length >= 6" @click="addChoice">+ เพิ่มตัวเลือก</button>

    <template v-if="!compact">
      <label class="qz-label">กลุ่มโรค / หมวด (ตามเกณฑ์สภาเภสัชกรรม)</label>
      <TopicSelect :modelValue="modelValue.ple" @update:modelValue="v => set({ ple: v })" />

      <label class="qz-label">ชุดข้อสอบย้อนหลัง (ไม่บังคับ — 1 ข้ออยู่ได้หลายชุด)</label>
      <ExamSetSelect :modelValue="modelValue.examSets" @update:modelValue="v => set({ examSets: v })" />

      <label class="qz-label">หมวดใหญ่ (domain)</label>
      <select :value="modelValue.domain" class="qz-input" @change="set({ domain: $event.target.value || null })">
        <option :value="null">— ไม่ระบุ —</option>
        <option v-for="d in DOMAINS" :key="d.key" :value="d.key">{{ d.label }}</option>
      </select>
    </template>

    <label class="qz-label">คำอธิบายเฉลย (ไม่บังคับ)</label>
    <textarea v-model="explanation" :maxlength="LIMITS.explanation" class="qz-input" rows="2" placeholder="อธิบายว่าทำไมข้อนี้ถูก…"></textarea>

    <label class="qz-label">หมายเหตุผู้ตรวจ (นักศึกษาเห็นท้ายเฉลย — ไม่บังคับ)</label>
    <textarea v-model="reviewNote" :maxlength="LIMITS.reviewNote" class="qz-input" rows="2" placeholder="ข้อควรระวัง / จุดที่คนมักเข้าใจผิด…"></textarea>

    <label v-if="!compact" class="qz-check">
      <input type="checkbox" :checked="modelValue.isPublished" @change="set({ isPublished: $event.target.checked })" />
      เผยแพร่ให้นักศึกษาเห็น (ติ๊กออก = ร่าง เห็นเฉพาะทีมวิชาการ)
    </label>
  </div>
</template>

<script setup>
// ════════════════════════════════════════════════════════════
//  QuestionEditor — ฟอร์มข้อสอบล้วน ใช้ร่วมกัน /questions (เต็ม) และ /review (compact)
//  ⚠️ ห้าม import firebase ในไฟล์นี้ — หน้าที่เดียวคือวาดฟอร์มกับคุมกติกาตัวเลือก
//     ใครเรียกใช้เป็นคนเขียน Firestore เอง (ผ่าน draftPayload ใน utils/questionDraft.js)
//  compact=true ซ่อนช่องที่คนตรวจไม่ต้องใช้: กลุ่มโรค (ฟอร์มตรวจมี TopicSelect ของตัวเองอยู่แล้ว
//  จะซ้อนกันสองอัน) · ชุดข้อสอบย้อนหลัง · domain · เผยแพร่ (หน้าตรวจใช้ปุ่ม "นำออก" แทน)
//  ไม่ mutate props — ทุกการแก้ emit ก้อนใหม่ทั้งใบ (แบบเดียวกับ TopicSelect.vue)
// ════════════════════════════════════════════════════════════
import { computed } from 'vue'
import TopicSelect from './TopicSelect.vue'
import ExamSetSelect from './ExamSetSelect.vue'
import { LIMITS } from '../../utils/text.js'
import { DOMAINS } from '../../data/domains.js'

const props = defineProps({
  modelValue: { type: Object, required: true },
  compact: { type: Boolean, default: false },
})
const emit = defineEmits(['update:modelValue'])

const LETTERS = ['ก', 'ข', 'ค', 'ง', 'จ', 'ฉ']

function set(patch) { emit('update:modelValue', { ...props.modelValue, ...patch }) }

const question = computed({ get: () => props.modelValue.question, set: v => set({ question: v }) })
const explanation = computed({ get: () => props.modelValue.explanation, set: v => set({ explanation: v }) })
const reviewNote = computed({ get: () => props.modelValue.reviewNote, set: v => set({ reviewNote: v }) })

function setChoice(i, v) {
  const choices = [...props.modelValue.choices]
  choices[i] = v
  set({ choices })
}
function addChoice() {
  if (props.modelValue.choices.length >= 6) return
  set({ choices: [...props.modelValue.choices, ''] })
}
// ลบตัวเลือกแล้วต้องดึงเฉลยให้ยังชี้ของที่มีจริง (ตรรกะเดิมจาก QuestionsView.removeChoice)
function removeChoice(i) {
  const choices = [...props.modelValue.choices]
  if (choices.length <= 2) return
  choices.splice(i, 1)
  let answer = props.modelValue.answer
  if (answer >= choices.length) answer = choices.length - 1
  else if (answer > i) answer--
  set({ choices, answer })
}
</script>

<style scoped>
.qz-label { display: block; font-size: .7rem; font-weight: 700; color: #64748b; margin: 10px 0 5px; }
.qz-input { width: 100%; box-sizing: border-box; border: 2px solid var(--ink); border-radius: 10px; padding: 9px 11px; font-family: inherit; font-size: .82rem; resize: vertical; }
.qz-input:focus { outline: none; box-shadow: var(--pop); }
.qz-choice { display: flex; align-items: center; gap: 7px; margin-bottom: 6px; }
.qz-radio { flex-shrink: 0; width: 30px; height: 30px; border-radius: 50%; border: 2px solid rgba(0,0,0,.15); background: #fff; color: rgba(0,0,0,.45); font-weight: 800; font-size: .82rem; cursor: pointer; }
.qz-radio.on { background: #22c55e; border-color: #22c55e; color: #fff; }
.qz-choice-in { flex: 1; }
.qz-del-choice { flex-shrink: 0; border: none; background: rgba(0,0,0,.05); border-radius: 8px; width: 28px; height: 28px; cursor: pointer; color: #ef4444; }
.qz-del-choice:disabled { opacity: .3; cursor: default; }
.qz-add-choice { margin-top: 2px; border: 1px dashed rgba(0,0,0,.2); background: none; border-radius: 9px; padding: 7px 12px; font-family: inherit; font-size: .74rem; font-weight: 700; color: #475569; cursor: pointer; }
.qz-add-choice:disabled { opacity: .4; cursor: default; }
.qz-check { display: flex; align-items: center; gap: 8px; font-size: .74rem; color: rgba(0,0,0,.65); margin-top: 12px; cursor: pointer; }
</style>
```

- [ ] **Step 2: ให้ `QuestionsView.vue` เรียกใช้แทนฟอร์มเดิม**

**2a — template:** แทนที่บรรทัด 203–240 (ตั้งแต่ `<label class="qz-label">โจทย์</label>` ถึงบรรทัดปิด `</label>` ของ checkbox "เผยแพร่ให้นักศึกษาเห็น") ด้วยบรรทัดเดียว:

```html
        <QuestionEditor v-model="draft" />
```

**2b — import:** เพิ่มใต้บรรทัด 407 (`import QuestionComments …`):

```js
import QuestionEditor from '../components/questions/QuestionEditor.vue'
import { draftFrom, draftPayload, draftValid } from '../utils/questionDraft.js'
```

**2c — `blankDraft`/`resetDraft`:** แทนที่ฟังก์ชัน `blankDraft()` (บรรทัด 598–600) ด้วยการเรียก `draftFrom(null)` ตรงๆ — เปลี่ยนบรรทัด `const draft = ref(blankDraft())` เป็น `const draft = ref(draftFrom(null))` และ `function resetDraft() { draft.value = draftFrom(null); editReviews.value = [] }` แล้วลบ `blankDraft()` ทิ้ง

**2d — `valid`:** แทนที่ทั้ง computed (บรรทัด 606–611):

```js
// draftValid ไม่เช็คกลุ่มโรค — หน้าคลังบังคับเอง (ปล่อยข้อไม่มีกลุ่มออกไปคือที่มาของคลังที่จัดหมวดไม่ได้)
const valid = computed(() => draftValid(draft.value) && isPleGroupKey(draft.value.ple?.group))
```

**2e — `removeChoice`:** ลบฟังก์ชัน `removeChoice` (บรรทัด 613–619) ทิ้ง — ย้ายเข้า `QuestionEditor` แล้ว

**2f — `save()`:** แทนที่การประกอบ payload (บรรทัด 908–924 ตั้งแต่ `const payload = {` ถึงบรรทัด `if (payload.answer >= payload.choices.length) payload.answer = 0`) ด้วย:

```js
  const payload = { ...draftPayload(d), updatedAt: serverTimestamp() }
```

**2g — `startEdit`:** แทนที่การประกอบ draft (บรรทัด 1005–1017 ตั้งแต่ `draft.value = {` ถึง `}` ปิด) ด้วย:

```js
  draft.value = draftFrom(q)
```

- [ ] **Step 3: ยืนยันว่าไม่เหลือของเก่าค้าง**

```
grep -n "blankDraft\|removeChoice\|qz-radio\|qz-add-choice" src/views/QuestionsView.vue
```

คาดว่า: ไม่เจอ `blankDraft`/`removeChoice` เลย · `qz-radio`/`qz-add-choice` เจอเฉพาะในบล็อก `<style>` (CSS ที่ไม่มีใครใช้แล้ว — ลบบรรทัด 1178–1186 `.qz-choice` / `.qz-radio` / `.qz-radio.on` / `.qz-choice-in` / `.qz-del-choice` / `.qz-del-choice:disabled` / `.qz-add-choice` / `.qz-add-choice:disabled` ทิ้ง แต่ **เก็บ `.qz-label` `.qz-input` `.qz-input:focus` `.qz-check` ไว้** เพราะส่วนอื่นของหน้าคลัง เช่น กล่อง import และตัวกรอง ยังใช้อยู่)

หลังลบ รันซ้ำเพื่อยืนยันว่าเหลือแค่ที่ตั้งใจ:

```
grep -n "qz-radio\|qz-add-choice\|qz-del-choice\|qz-choice" src/views/QuestionsView.vue
```

คาดว่า: ไม่เจออะไรเลย

จากนั้นเช็ค import ที่อาจกลายเป็นของไม่ได้ใช้หลังย้ายฟอร์มออก (Vite ไม่เตือนให้ ต้องดูเอง):

```
grep -n "qhash\|DOMAINS\|ExamSetSelect\|TopicSelect\|LIMITS" src/views/QuestionsView.vue
```

ชื่อไหนเหลือปรากฏแค่ในบรรทัด `import` บรรทัดเดียว แปลว่าไม่มีใครใช้แล้ว → ลบออกจาก import
(`cleanText`/`LIMITS` น่าจะยังใช้ในกล่อง import ข้อสอบ · `TopicSelect` อาจยังใช้ในตัวกรอง — ตรวจทีละตัว อย่าลบเหมา)

- [ ] **Step 4: บิลด์ + ไล่ดูด้วยตา**

```
npm run build
node --test "src/**/*.test.js"
grep -rnE "font-size:\s*\.[0-6][0-9]?rem" src/
```

คาดว่า: build สำเร็จ · `fail 0` · grep ฟอนต์ไม่เจออะไร

จากนั้น `npm run dev` แล้วเปิด `/questions` แท็บ "✍️ เพิ่ม/แก้" ตรวจด้วยตา **7 ข้อ**:
1. พิมพ์โจทย์ได้ ตัวอักษรไม่หาย ไม่เด้ง cursor
2. กดวงกลมเปลี่ยนเฉลยได้ วงที่เลือกเป็นสีเขียวมี ✓
3. กด "+ เพิ่มตัวเลือก" ได้ถึง 6 แล้วปุ่มจาง
4. กด ✕ ลบตัวเลือกได้ เหลือ 2 แล้วปุ่มจาง · **ลบตัวที่อยู่ก่อนเฉลย แล้วเฉลยต้องยังชี้ตัวเลือกเดิม**
5. กลุ่มโรค / ชุดข้อสอบย้อนหลัง / domain / checkbox เผยแพร่ ครบและกดได้
6. กด "แก้ไข" จากแท็บคลัง → ฟอร์มขึ้นค่าเดิมครบทุกช่อง
7. กดบันทึกแล้วข้อถูกบันทึกจริง (รีเฟรชแล้วค่ายังอยู่)

- [ ] **Step 5: commit**

```bash
git add src/components/questions/QuestionEditor.vue src/views/QuestionsView.vue
git commit -m "Questions: ดึงฟอร์มข้อสอบออกเป็น QuestionEditor.vue (ให้หน้าตรวจใช้ตัวเดียวกันได้)"
```

---

## Task 4: หน้าตรวจ — ฟอร์มแก้ในที่ + 2 เส้นทางเขียน

**Files:**
- Modify: `src/views/ReviewView.vue` — import (บรรทัด 206, 209), การ์ดข้อ (บรรทัด 27–90), `watch(current)` (บรรทัด 419–434)

**Interfaces:**
- Consumes: `QuestionEditor` (Task 3) · `draftFrom`/`draftPayload`/`draftValid` (Task 1) · `verdictContentChanged`/`sideContentChanged` (Task 2)
- Produces: `editing`/`editDraft`/`openEdit()`/`closeEdit()`/`saveEdit()` และฟิลด์ใหม่บนเอกสาร `lastFixBy` (uid) · `lastFixByName` (string) · `lastFixAt` (Timestamp) ที่ Task 5 จะใช้

### ⚠️ สองกับดักที่เจอตอนเตรียมแผน — ห้ามข้าม

**(1) `watch(current, …)` ต้องเปลี่ยนเป็น `watch(currentId, …)`**
`current` เป็น computed ที่ `.find()` ในอาเรย์ `list` ⇒ พอเส้นทาง B แก้แถวใน `list`
มันคืน **object ใหม่** ทั้งที่ยังเป็นข้อเดิม ⇒ watch เดิมจะยิง แล้ว**ล้าง verdict/เหตุผลที่คนตรวจกรอกค้างไว้**
(และยิงอ่าน subcollection ซ้ำฟรีๆ) · ผูกกับ `currentId` = ผูกกับ "ข้อไหน" ไม่ใช่ "object ใบไหน"

**(2) `reviewMeta.progress` ห้ามเขียนเมื่อ `oldStatus === 'pending'`**
จะกลายเป็น `{ pending: increment(-1), pending: increment(1) }` = key ซ้ำใน object literal เดียว
ตัวหลังทับตัวแรก เหลือ `+1` ⇒ ตัวเลข "รอตรวจ" เฟ้อขึ้นทุกครั้งที่มีคนแก้ข้อที่ยังไม่มีใครตรวจ
(กับดักเดียวกับที่ `submit()` เตือนไว้ที่บรรทัด 536)

- [ ] **Step 1: เพิ่ม import**

บรรทัด 206 — เติม `setDoc` เข้าไปในรายการ (ตอนนี้ยังไม่มี):

```js
import { collection, getDocs, getDoc, doc, updateDoc, setDoc, runTransaction, arrayUnion, increment, deleteField, serverTimestamp, query, where, orderBy, startAt, limit } from 'firebase/firestore'
```

บรรทัด 209 — เติมสองชื่อใหม่:

```js
import { computeStatus, nextReviewQueue, needsReviewBy, buildLeaderboard, VERDICT_LABEL, pickRandom, REVIEW_RESET, verdictContentChanged, sideContentChanged } from '../utils/questionReview.js'
```

เติมสองบรรทัดนี้ต่อจากบรรทัด 215 (`import TopicSelect …`):

```js
import QuestionEditor from '../components/questions/QuestionEditor.vue'
import { draftFrom, draftPayload, draftValid } from '../utils/questionDraft.js'
```

- [ ] **Step 2: เพิ่ม state + computed ของฟอร์มแก้**

ใส่ต่อจากบรรทัด `const currentStatus = computed(() => current.value ? computeStatus(current.value) : null)` (ราวบรรทัด 262)

⚠️ **ต้องอยู่หลัง `current`/`currentStatus` ไม่ใช่ก่อน** — computed ข้างล่างอ้าง `current.value` ถ้าวางไว้ก่อนจะอ่านยากและเสี่ยง TDZ ถ้าอนาคตมีใครเปลี่ยน computed เป็นค่าที่ประเมินทันที:

```js
// ── ฟอร์มแก้ข้อในหน้าตรวจ ──
//  คนตรวจเจอข้อผิดแล้วแก้ได้เลย ไม่ต้องเดินไปคลัง — นี่คือชิ้นส่วนที่ทำให้ลูป "ตก→แก้→ตรวจใหม่" ครบ
//  แก้ชั้นตัดสิน (โจทย์/ตัวเลือก/เฉลย) → ข้อวนเข้าคิวให้คนอื่นตรวจ คนแก้ตรวจเองไม่ได้ (lastFixBy)
//  แก้ชั้นประกอบ (คำอธิบาย/หมายเหตุ) → อยู่ข้อเดิม ส่งผลตรวจต่อได้เลย
const editing = ref(false)
const editDraft = ref(null)
const savingEdit = ref(false)

const editPayload = computed(() => (editing.value && editDraft.value) ? draftPayload(editDraft.value) : null)
// แก้แบบนี้แล้วข้อจะวนเข้าคิวไหม — ใช้ทั้งตัดสินเส้นทางเขียนและขึ้นป้ายเตือนก่อนกด
const editRequeues = computed(() => !!editPayload.value && verdictContentChanged(current.value, editPayload.value))
const editTouched = computed(() =>
  !!editPayload.value && (editRequeues.value || sideContentChanged(current.value, editPayload.value)))
const canSaveEdit = computed(() => !!editPayload.value && draftValid(editDraft.value) && editTouched.value)

function openEdit() {
  if (!current.value) return
  editDraft.value = draftFrom(current.value)
  editing.value = true
}
function closeEdit() { editing.value = false; editDraft.value = null }
```

- [ ] **Step 3: เขียน `saveEdit()`**

ใส่ต่อจาก `closeEdit()`:

```js
async function saveEdit() {
  if (!canSaveEdit.value || savingEdit.value || !current.value || !myUid.value) return
  const q = current.value
  const uid = myUid.value
  const u = authStore.userData || {}
  const fixerName = cleanText(u.realName || u.nickname || u.name || 'ไม่ระบุ', LIMITS.reviewerName)
  const payload = editPayload.value
  const requeue = editRequeues.value
  if (!(await confirm(requeue
    ? 'บันทึกการแก้?\nข้อนี้จะกลับเข้าคิวให้คนอื่นตรวจ — คุณจะไม่ได้ตรวจข้อนี้'
    : 'บันทึกคำอธิบาย / หมายเหตุ?\nผลตรวจเดิมยังอยู่ ตรวจต่อได้เลย'))) return
  savingEdit.value = true
  const oldStatus = computeStatus(q)
  try {
    if (requeue) {
      // rules ผ่านทาง isReviewReset() — ไม่มี hasOnly จึงเขียนเนื้อหาไปพร้อมกับการล้างผลตรวจได้
      await updateDoc(doc(db, 'questions', q.id), {
        ...payload,
        ...REVIEW_RESET,
        reviewVerdicts: deleteField(),
        retired: deleteField(),   // แก้เนื้อหา = ตั้งใจนำกลับมาใช้
        lastFixBy: uid, lastFixByName: fixerName, lastFixAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
      usage.track(0, 1)
      // ⚠️ ห้ามเขียนตอน oldStatus === 'pending' — key ซ้ำในก้อนเดียว ตัวหลังทับตัวแรก ตัวเลขเฟ้อ
      if (oldStatus !== 'pending') {
        try {
          await setDoc(doc(db, 'reviewMeta', 'main'),
            { progress: { [oldStatus]: increment(-1), pending: increment(1) } }, { merge: true })
          usage.track(0, 1)
        } catch (e) { console.error('[reviewMeta fix bump]', e) }   // พลาดตรงนี้ต้องไม่ทำให้การแก้ล้ม
      }
      meta.value = { ...meta.value, progress: bumpedProgress(oldStatus, 'pending') }
      patchTriageRow(q.id, {
        ...payload, ...REVIEW_RESET, retired: false,
        lastFixBy: uid, lastFixByName: fixerName, lastFixAt: new Date(),   // local ใช้ Date จริง
      })
      closeEdit()
      toast('บันทึกแล้ว — ส่งข้อนี้ให้คนอื่นตรวจต่อ', 'success')
      pickNext()
    } else {
      await updateDoc(doc(db, 'questions', q.id), {
        explanation: payload.explanation,
        reviewNote: payload.reviewNote,
        updatedAt: serverTimestamp(),
      })
      usage.track(0, 1)
      // 🔑 ต้อง patch local ด้วย — submit() เทียบ baseNote จาก q.reviewNote ที่โหลดมาตอนเปิดข้อ
      //    ถ้าไม่ patch หมายเหตุที่เพิ่งบันทึกจะโดนค่าเก่าเขียนทับตอนกดส่งผลตรวจ
      patchTriageRow(q.id, { explanation: payload.explanation, reviewNote: payload.reviewNote })
      note.value = payload.reviewNote || ''
      hadNote.value = !!payload.reviewNote
      closeEdit()
      toast('บันทึกแล้ว — ตรวจต่อได้เลย', 'success')
    }
  } catch (e) { console.error('[review edit]', e); toast('บันทึกไม่สำเร็จ', 'error') }
  finally { savingEdit.value = false }
}
```

- [ ] **Step 4: เปลี่ยน `watch(current)` เป็น `watch(currentId)`**

แทนที่ทั้งบล็อก (บรรทัด 418–434 รวมคอมเมนต์เหนือมัน) ด้วย:

```js
// เปลี่ยน "ข้อ" → ล้างฟอร์ม + โหลดรีวิวเดิมถ้าเป็นข้อ conflict (ให้คนที่ 3 เห็น)
// ⚠️ ผูกกับ currentId ไม่ใช่ current — current เป็น computed ที่ .find() ในอาเรย์ list
//    พอแก้แถวใน list (เช่นบันทึกคำอธิบาย) มันคืน object ใบใหม่ทั้งที่ยังเป็นข้อเดิม
//    ⇒ ถ้า watch ตัว current จะล้าง verdict/เหตุผลที่คนตรวจกรอกค้างไว้ แล้วยิงอ่าน subcollection ซ้ำฟรี
watch(currentId, async (id) => {
  closeEdit()
  verdict.value = null; reason.value = ''; refText.value = ''; priorReviews.value = []
  const q = current.value
  ple.value = pleFields(q)
  note.value = q?.reviewNote || ''
  hadNote.value = !!q?.reviewNote
  if (!q) return
  if (computeStatus(q) === 'conflict') {
    try {
      const snap = await getDocs(collection(db, 'questions', q.id, 'reviews'))
      if (currentId.value !== id) return   // เลื่อนข้อไปแล้วระหว่างรอเน็ต — ทิ้งผลชุดนี้
      usage.track(snap.size)
      // กรองเฉพาะรีวิวของรอบปัจจุบัน — subdoc รอบก่อน reset (แก้เนื้อหาแล้ว) ยังค้างอยู่
      priorReviews.value = snap.docs.filter(d => (q.reviewedBy || []).includes(d.id))
        .map(d => ({ id: d.id, ...d.data() }))
    } catch (e) { console.error('[review priors]', e) }
  }
}, { immediate: true })
```

- [ ] **Step 5: เพิ่ม UI ในการ์ดข้อ**

**5a** — ใน `<template>` ครอบเนื้อข้อเดิม (บรรทัด 35–42: `.rv-q`, `.rv-choices`, `.rv-exp`) ด้วย `v-if="!editing"` แล้วเติมบล็อกฟอร์มต่อท้าย:

```html
        <template v-if="!editing">
          <div class="rv-q">{{ current.question }}</div>
          <ul class="rv-choices">
            <li v-for="(c, i) in current.choices" :key="i" :class="{ correct: i === current.answer }">
              <span class="rv-c-letter">{{ LETTERS[i] }}</span><span class="rv-c-text">{{ c }}</span>
              <span v-if="i === current.answer" class="rv-c-mark">✓ เฉลย</span>
            </li>
          </ul>
          <div v-if="current.explanation" class="rv-exp"><Emoji char="💡" /> {{ current.explanation }}</div>
          <div v-else class="rv-exp rv-exp-none"><Emoji char="💡" /> ข้อนี้ยังไม่มีคำอธิบายเฉลย — เติมได้ที่ปุ่ม "แก้ข้อนี้"</div>
          <button class="rv-mini rv-edit-btn" @click="openEdit">✏️ แก้ข้อนี้</button>
        </template>

        <div v-else class="rv-editbox">
          <QuestionEditor v-model="editDraft" compact />
          <div class="rv-edit-hint" :class="editRequeues ? 'requeue' : 'stay'">
            <template v-if="editRequeues">🔄 บันทึกแล้วข้อนี้ไปเข้าคิวให้คนอื่นตรวจ — คุณจะไม่ได้ตรวจข้อนี้</template>
            <template v-else-if="editTouched">✅ บันทึกแล้วตรวจต่อได้เลย ผลตรวจเดิมยังอยู่</template>
            <template v-else>ยังไม่ได้แก้อะไร</template>
          </div>
          <div class="rv-actions">
            <button class="rv-btn rv-gray" :disabled="savingEdit" @click="closeEdit">ยกเลิก</button>
            <button class="rv-btn rv-primary" :disabled="!canSaveEdit || savingEdit" @click="saveEdit">
              {{ savingEdit ? 'กำลังบันทึก…' : 'บันทึกการแก้' }}
            </button>
          </div>
        </div>
```

**5b** — ซ่อนฟอร์มตรวจระหว่างแก้: หาบรรทัด `<div class="rv-form">` (ตัวเปิดบล็อกปุ่ม verdict — เลขบรรทัดขยับไปแล้วจาก 5a ให้ค้นด้วยข้อความ) เปลี่ยนเป็น:

```html
        <div v-if="!editing" class="rv-form">
```

**5c** — เติม CSS ในบล็อก `<style scoped>` (วางต่อจากกฎ `.rv-exp` ที่มีอยู่):

```css
.rv-exp-none { color: #94a3b8; font-style: italic; }
.rv-edit-btn { margin-top: 10px; }
.rv-editbox { margin-top: 4px; }
.rv-edit-hint { margin-top: 12px; border-radius: 10px; padding: 9px 11px; font-size: .74rem; font-weight: 700; line-height: 1.5; }
.rv-edit-hint.requeue { background: rgba(245,158,11,.13); color: #92400e; }
.rv-edit-hint.stay { background: rgba(34,197,94,.13); color: #166534; }
```

- [ ] **Step 6: บิลด์ + เทส**

```
npm run build
node --test "src/**/*.test.js"
grep -rnE "font-size:\s*\.[0-6][0-9]?rem" src/
```

คาดว่า: build สำเร็จ · `fail 0` · grep ฟอนต์ไม่เจออะไร

- [ ] **Step 7: ทดสอบด้วยตาใน dev (ต้องล็อกอินด้วยบัญชี academic/admin)**

`npm run dev` → `/review` → ตรวจ **5 ข้อ**:
1. กด "✏️ แก้ข้อนี้" → ฟอร์มขึ้นพร้อมค่าเดิม · **ปุ่มตัดสิน ✅/🛠️/❌ หายไป** · ไม่มีช่องกลุ่มโรคซ้อนกันสองอัน
2. แก้แค่คำอธิบาย → ป้ายเขียว "✅ บันทึกแล้วตรวจต่อได้เลย" → กดบันทึก → **ยังอยู่ข้อเดิม** และคำอธิบายใหม่ขึ้นในการ์ด
3. ต่อจากข้อ 2 กดเลือก verdict + พิมพ์เหตุผล + ส่งผลตรวจ → ส่งผ่าน **ไม่ขึ้น "ข้อนี้เพิ่งถูกแก้เนื้อหา"** และหมายเหตุที่เพิ่งบันทึกไม่หาย
4. แก้เฉลยหรือตัวเลือก → ป้ายส้ม "🔄 …ไปเข้าคิวให้คนอื่นตรวจ" → กดบันทึก → **เด้งไปข้อถัดไปทันที**
5. ต่อจากข้อ 4 กด "โหลดรอบใหม่" → **ข้อที่เพิ่งแก้ต้องไม่กลับมาให้เราตรวจ** (นี่คือ `lastFixBy` ทำงาน)

- [ ] **Step 8: commit**

```bash
git add src/views/ReviewView.vue
git commit -m "Review: แก้ข้อสอบได้ในหน้าตรวจ — แตะโจทย์/เฉลยแล้ววนเข้าคิว แตะคำอธิบายแล้วตรวจต่อได้เลย"
```

---

## Task 5: หน้าตรวจ — เห็นเหตุผลรอบก่อนแก้ + ใครแก้

**Files:**
- Modify: `src/views/ReviewView.vue` — `watch(currentId)` (จาก Task 4), การ์ดข้อ (บล็อก `.rv-priors`)

**Interfaces:**
- Consumes: `lastFixBy`/`lastFixByName`/`lastFixAt` ที่ Task 4 เขียนไว้
- Produces: `priorFixedReviews` (array) · `fmtFixTime(t)`

- [ ] **Step 1: เพิ่ม state + ตัวจัดรูปเวลา**

ใต้บรรทัด `const priorReviews = ref([])` เติม:

```js
// ผลตรวจของ "รอบก่อนแก้" — subdoc ที่ uid หลุดจาก reviewedBy ไปตอน REVIEW_RESET
// ⚠️ Firestore ไม่ได้ลบ subdoc พวกนี้ทิ้งเลย ข้อมูลอยู่ครบมาตลอด แค่ไม่เคยมีใครเอามาโชว์
//    ⇒ เห็นได้โดยไม่ต้องเก็บฟิลด์เพิ่มสักตัว (0 write เพิ่ม · +1–2 read เฉพาะข้อที่เคยถูกแก้)
const priorFixedReviews = ref([])
```

เติมฟังก์ชันนี้ต่อจาก `truncate60()`:

```js
// Firestore Timestamp | Date | number → "11 ก.ย." (รับ Date ด้วยเพราะ patch local ใช้ new Date())
function fmtFixTime(t) {
  if (!t) return ''
  const ms = t instanceof Date ? t.getTime()
    : typeof t.toMillis === 'function' ? t.toMillis()
    : t.seconds ? t.seconds * 1000
    : typeof t === 'number' ? t : null
  if (!ms) return ''
  return new Date(ms).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })
}
```

- [ ] **Step 2: แก้ `watch(currentId)` ให้โหลดและแบ่งสองกลุ่ม**

แทนที่บล็อก `if (computeStatus(q) === 'conflict') { … }` ใน watch (จาก Task 4) ด้วย:

```js
  priorFixedReviews.value = []
  // โหลดผลตรวจเดิมเมื่อ (ก) ข้อ conflict รอคนที่ 3 ตัดสิน หรือ (ข) ข้อเคยถูกแก้ — คนตรวจรอบนี้
  // ต้องรู้ว่ารอบก่อนตกเพราะอะไร ไม่งั้นตรวจไม่ได้ว่า "เขาแก้ตรงจุดหรือเปล่า"
  // ข้อปกติยังไม่เห็นผลตรวจคนอื่น (กันอคติ) — เจตนาเดิมคงไว้
  if (computeStatus(q) === 'conflict' || q.lastFixAt) {
    try {
      const snap = await getDocs(collection(db, 'questions', q.id, 'reviews'))
      if (currentId.value !== id) return   // เลื่อนข้อไปแล้วระหว่างรอเน็ต — ทิ้งผลชุดนี้
      usage.track(snap.size)
      const rows = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      const nowVoters = new Set(q.reviewedBy || [])
      priorReviews.value = rows.filter(r => nowVoters.has(r.id))        // เสียงของรอบปัจจุบัน
      priorFixedReviews.value = rows.filter(r => !nowVoters.has(r.id))  // เสียงก่อนข้อถูกแก้
    } catch (e) { console.error('[review priors]', e) }
  }
```

- [ ] **Step 3: เพิ่มกล่อง "รอบก่อนแก้" ในการ์ด**

ใส่ **ก่อน** บล็อก `.rv-priors` เดิม (บล็อกที่มี `v-if="currentStatus === 'conflict' && priorReviews.length"`):

```html
        <!-- ข้อที่เคยถูกแก้ — โชว์ว่ารอบก่อนตกเพราะอะไร ให้คนตรวจรอบนี้ยืนยันว่าแก้ตรงจุดไหม -->
        <div v-if="!editing && current.lastFixAt" class="rv-fixed">
          <div class="rv-fixed-head">
            <Emoji char="🛠️" /> แก้โดย <b>{{ current.lastFixByName || 'ไม่ระบุ' }}</b>
            <span v-if="fmtFixTime(current.lastFixAt)" class="rv-fixed-when">· {{ fmtFixTime(current.lastFixAt) }}</span>
          </div>
          <template v-if="priorFixedReviews.length">
            <div class="rv-fixed-sub">รอบก่อนแก้ ตกเพราะ ({{ priorFixedReviews.length }})</div>
            <div v-for="p in priorFixedReviews" :key="p.id" class="rv-prior">
              <div class="rv-prior-top">
                <span class="rv-prior-verdict" :class="p.verdict">{{ VERDICT_LABEL[p.verdict] || p.verdict }}</span>
                <b>{{ p.reviewerName || 'ไม่ระบุ' }}</b>
              </div>
              <div class="rv-prior-reason">{{ p.reason }}</div>
              <div v-if="p.ref" class="rv-prior-ref">เรฟ: {{ p.ref }}</div>
            </div>
          </template>
          <div v-else class="rv-fixed-sub">ไม่มีเหตุผลของรอบก่อนเก็บไว้ — ข้อนี้ถูกแก้ตั้งแต่ยังไม่มีใครตรวจ</div>
        </div>
```

- [ ] **Step 4: เพิ่ม CSS**

```css
.rv-fixed { margin-top: 12px; border: 2px dashed rgba(245,158,11,.5); border-radius: 12px; padding: 10px 12px; background: rgba(245,158,11,.07); }
.rv-fixed-head { font-size: .76rem; font-weight: 800; color: #92400e; }
.rv-fixed-when { font-weight: 700; color: #b45309; }
.rv-fixed-sub { margin-top: 7px; font-size: .72rem; font-weight: 700; color: #b45309; }
```

- [ ] **Step 5: บิลด์ + เทส + ตรวจด้วยตา**

```
npm run build
node --test "src/**/*.test.js"
grep -rnE "font-size:\s*\.[0-6][0-9]?rem" src/
```

ใน dev: หาข้อที่ยังไม่มีใครตรวจ → กด "ต้องแก้" พร้อมพิมพ์เหตุผล (ส่งผลตรวจ) → กด "โหลดรอบใหม่" → เข้าไปแก้ข้อนั้นจาก**บัญชีอื่น**หรือแก้จากหน้าคลัง → กลับมา `/review` แล้วยืนยันว่า:
1. กล่องส้ม "🛠️ แก้โดย …" ขึ้นเหนือการ์ด
2. มีเหตุผลรอบก่อนแสดงอยู่ในกล่อง
3. ข้อธรรมดา (ไม่เคยถูกแก้) **ต้องไม่มี**กล่องนี้ และไม่ยิง read เพิ่ม

- [ ] **Step 6: commit**

```bash
git add src/views/ReviewView.vue
git commit -m "Review: ข้อที่ถูกแก้แล้วโชว์ว่ารอบก่อนตกเพราะอะไรและใครแก้ (ข้อมูลมีอยู่แล้วใน subcollection)"
```

---

## Task 6: หน้าตรวจ — คอมเมนต์ต่อข้อ + ปุ่มนำออก

**Files:**
- Modify: `src/views/ReviewView.vue` — import, `watch(currentId)`, การ์ดข้อ, CSS

**Interfaces:**
- Consumes: `QuestionComments.vue` (มีอยู่แล้ว) · `patchTriageRow`/`pickNext` (มีอยู่แล้ว)
- Produces: `commentsOpen` · `retiring` · `retireCurrent()`

### ⚠️ `QuestionComments` โหลดเองตอน mount

`QuestionComments.vue:92` เป็น `onMounted(load)` เฉยๆ ไม่มี watch ⇒
- ถ้าใส่ตรงๆ **ทุกข้อที่เปิดจะยิง read ทันที** ผิดหลักต้นทุน read คงที่ของหน้านี้ → ต้อง `v-if="commentsOpen"`
- ถ้าไม่ใส่ `:key="current.id"` **เลื่อนข้อแล้วจะยังเห็นคอมเมนต์ข้อเก่า** เพราะมันไม่โหลดซ้ำ

- [ ] **Step 1: import + state**

เติมต่อจาก import ของ `QuestionEditor`:

```js
import QuestionComments from '../components/questions/QuestionComments.vue'
```

เติมต่อจาก `const savingEdit = ref(false)`:

```js
const commentsOpen = ref(false)   // กล่องคอมเมนต์ — mount เมื่อกางเท่านั้น (ดูหมายเหตุที่ template)
const retiring = ref(false)
```

- [ ] **Step 2: ปิดกล่องคอมเมนต์ตอนเปลี่ยนข้อ**

ใน `watch(currentId)` เติมต่อจากบรรทัด `closeEdit()`:

```js
  commentsOpen.value = false
```

- [ ] **Step 3: เขียน `retireCurrent()`**

ใส่ต่อจาก `saveEdit()`:

```js
// นำออก = ปลดระวางข้อที่ผิดจนแก้ไม่คุ้ม — ถอนเผยแพร่ + ไม่เข้าคิวตรวจอีก (ไม่ลบ ไม่แตะผลตรวจเดิม)
// rules ผ่านทาง reviewUntouched() · ไม่แตะ reviewMeta (drift ปล่อย self-heal ตอนแอดมินกดซิงก์ระบบตรวจ
// — แพทเทิร์นเดียวกับ QuestionsView.retire())
async function retireCurrent() {
  if (retiring.value || !current.value) return
  const q = current.value
  if (!(await confirm(`นำข้อนี้ออกจากการใช้งาน?\n\n"${truncate60(q.question)}"\n\nข้อจะถอนเผยแพร่และไม่เข้าคิวตรวจอีก (ไม่ได้ลบทิ้ง — กู้คืนได้ที่คลังข้อสอบ)`))) return
  retiring.value = true
  try {
    await updateDoc(doc(db, 'questions', q.id), { retired: true, isPublished: false, updatedAt: serverTimestamp() })
    usage.track(0, 1)
    patchTriageRow(q.id, { retired: true, isPublished: false })   // needsReviewBy กรอง retired → หลุดคิวเอง
    toast('นำข้อนี้ออกแล้ว', 'success')
    pickNext()
  } catch (e) { console.error('[review retire]', e); toast('นำออกไม่สำเร็จ', 'error') }
  finally { retiring.value = false }
}
```

- [ ] **Step 4: เพิ่ม UI**

**4a** — เปลี่ยนปุ่ม "✏️ แก้ข้อนี้" (จาก Task 4 step 5a) ให้เป็นแถวสองปุ่ม:

```html
          <div class="rv-card-tools">
            <button class="rv-mini" @click="openEdit">✏️ แก้ข้อนี้</button>
            <button class="rv-mini rv-retire" :disabled="retiring" @click="retireCurrent">
              {{ retiring ? 'กำลังนำออก…' : '🗑️ นำออก' }}
            </button>
          </div>
```

**4b** — เติมกล่องคอมเมนต์ **ก่อน** `<div v-if="!editing" class="rv-form">`:

```html
        <!-- 💬 คุยกันต่อข้อ — ⚠️ QuestionComments โหลดเองตอน mount (onMounted) ไม่มี watch
             จึงต้อง v-if ให้ mount เมื่อกางเท่านั้น (ไม่งั้นทุกข้อยิง read ทันที)
             และต้องมี :key ไม่งั้นเลื่อนข้อแล้วยังเห็นคอมเมนต์ข้อเก่า -->
        <details v-if="!editing" class="rv-comments" :open="commentsOpen">
          <summary class="rv-comments-sum" @click.prevent="commentsOpen = !commentsOpen">
            <Emoji char="💬" /> คุยกันเรื่องข้อนี้
            <span class="rv-comments-hint">{{ commentsOpen ? 'ปิด' : 'เปิดดู' }}</span>
          </summary>
          <QuestionComments v-if="commentsOpen" :key="current.id" :questionId="current.id" />
        </details>
```

**4c** — CSS:

```css
.rv-card-tools { display: flex; gap: 8px; margin-top: 10px; }
.rv-retire { color: #b91c1c; }
.rv-comments { margin-top: 12px; border-top: 2px dashed rgba(0,0,0,.1); padding-top: 10px; }
.rv-comments-sum { list-style: none; cursor: pointer; display: flex; align-items: center; gap: 7px; font-size: .78rem; font-weight: 800; color: var(--ink); }
.rv-comments-sum::-webkit-details-marker { display: none; }
.rv-comments-hint { margin-left: auto; font-size: .72rem; font-weight: 700; color: #64748b; }
```

- [ ] **Step 5: บิลด์ + เทส + ตรวจด้วยตา**

```
npm run build
node --test "src/**/*.test.js"
grep -rnE "font-size:\s*\.[0-6][0-9]?rem" src/
```

ใน dev ตรวจ **4 ข้อ**:
1. เปิด `/review` แล้วดู Network — **ยังไม่กาง 💬 ต้องไม่มี request ไป `questions/*/comments`**
2. กาง 💬 → คอมเมนต์โหลด · พิมพ์ส่งได้ · ลบของตัวเองได้
3. **ข้ามไปข้อถัดไปแล้วกาง 💬 อีกครั้ง → ต้องเป็นคอมเมนต์ของข้อใหม่ ไม่ใช่ข้อเก่า**
4. กด 🗑️ นำออก → ยืนยัน → เด้งข้อถัดไป · ข้อที่นำออกไม่กลับมาในคิวแม้กด "โหลดรอบใหม่"

- [ ] **Step 6: commit**

```bash
git add src/views/ReviewView.vue
git commit -m "Review: คุยกันต่อข้อได้ในหน้าตรวจ + ปุ่มนำออกสำหรับข้อที่แก้ไม่คุ้ม"
```

---

## Task 7: กอง "ไม่มีกลุ่มโรค" — เลือกหมวดได้ในแถวเลย

**Files:**
- Modify: `src/views/ReviewView.vue` — รายการกอง triage (บรรทัด 165–180 เดิม), script, CSS

**Interfaces:**
- Consumes: `plePatch`/`pleFields` (import อยู่แล้ว) · `isPleGroupKey` (import อยู่แล้ว) · `TopicSelect` (import อยู่แล้ว) · `patchTriageRow`
- Produces: `nogroupId` · `nogroupPle` · `nogroupSaving` · `openNogroup(q)` · `saveNogroup(q)`

- [ ] **Step 1: state + ฟังก์ชัน**

เติมต่อจาก `const requeuingId = ref(null)`:

```js
// แก้กลุ่มโรคในแถวของกอง "ไม่มีกลุ่มโรค" — เดิมเป็นลิงก์ไป /questions มือเปล่า ต้องไปไล่หาข้อเอง
// ทีละแถว ไม่ทำ bulk เพราะกองนี้ต้องอ่านโจทย์ก่อนถึงจะเลือกกลุ่มได้
const nogroupId = ref(null)
const nogroupPle = ref({ group: null, sub: null })
const nogroupSaving = ref(false)

function openNogroup(q) {
  nogroupId.value = nogroupId.value === q.id ? null : q.id
  nogroupPle.value = pleFields(q)
}

async function saveNogroup(q) {
  const patch = plePatch(nogroupPle.value.group, nogroupPle.value.sub)
  if (!patch || nogroupSaving.value) return
  nogroupSaving.value = true
  try {
    // rules ผ่านทาง reviewUntouched() — ไม่แตะผลตรวจเลย
    // categories มาจาก plePatch เสมอ ห้ามเขียนมือ (CLAUDE.md ข้อ 14)
    await updateDoc(doc(db, 'questions', q.id), { ...patch, updatedAt: serverTimestamp() })
    usage.track(0, 1)
    patchTriageRow(q.id, patch)   // bucketsOf() อ่าน pleFields → แถวหลุดกองทันที
    nogroupId.value = null
    toast('บันทึกกลุ่มโรคแล้ว', 'success')
  } catch (e) { console.error('[nogroup save]', e); toast('บันทึกไม่สำเร็จ', 'error') }
  finally { nogroupSaving.value = false }
}
```

- [ ] **Step 2: เปลี่ยน UI ของแถว**

แทนที่บรรทัด `<RouterLink v-if="k === 'nogroup'" to="/questions" class="rv-mini">แก้ในคลังข้อสอบ ›</RouterLink>` ด้วย:

```html
                      <button v-if="k === 'nogroup'" class="rv-mini" @click="openNogroup(q)">
                        {{ nogroupId === q.id ? 'ปิด' : '🏷️ เลือกกลุ่มโรค' }}
                      </button>
```

แล้วเติมบล็อกนี้ **ต่อจาก** `</div>` ที่ปิด `.rv-bucket-acts` (ยังอยู่ใน `<li>` เดียวกัน):

```html
                    <div v-if="k === 'nogroup' && nogroupId === q.id" class="rv-nogroup">
                      <TopicSelect v-model="nogroupPle" />
                      <button
                        class="rv-btn rv-primary rv-nogroup-save"
                        :disabled="!isPleGroupKey(nogroupPle.group) || nogroupSaving"
                        @click="saveNogroup(q)"
                      >{{ nogroupSaving ? 'กำลังบันทึก…' : 'บันทึกกลุ่มโรค' }}</button>
                    </div>
```

- [ ] **Step 3: CSS**

```css
.rv-nogroup { margin-top: 9px; border-top: 1px dashed rgba(0,0,0,.12); padding-top: 9px; }
.rv-nogroup-save { margin-top: 9px; width: 100%; }
```

- [ ] **Step 4: บิลด์ + เทส + ตรวจด้วยตา**

```
npm run build
node --test "src/**/*.test.js"
grep -rnE "font-size:\s*\.[0-6][0-9]?rem" src/
```

ใน dev: `/review` → เลื่อนไป 🗂️ "ข้อที่รอดำเนินการ" → กด "ดูรายการ" → กาง 🏷️ "ไม่มีกลุ่มโรค" → ตรวจ **3 ข้อ**:
1. กด "🏷️ เลือกกลุ่มโรค" → TopicSelect กางในแถว · ปุ่มบันทึกจางจนกว่าจะเลือกกลุ่ม
2. เลือกกลุ่มแล้วกดบันทึก → **แถวหายจากกองทันที** และตัวเลขบนหัวกองลดลง
3. รีเฟรชหน้า กด "ดูรายการ" อีกครั้ง → ข้อนั้นไม่กลับมาในกอง

- [ ] **Step 5: commit**

```bash
git add src/views/ReviewView.vue
git commit -m "Review: เลือกกลุ่มโรคได้ในแถวของกอง 'ไม่มีกลุ่มโรค' (เดิมเป็นลิงก์ไปคลังมือเปล่า)"
```

---

## เช็คตอนจบ (ทำหลัง Task 7)

- [ ] `node --test "src/**/*.test.js"` → `fail 0` และจำนวนเทส **ไม่ต่ำกว่า 1,193**
- [ ] `npm run build` → สำเร็จ
- [ ] `grep -rn "reviewContentChanged" src/` → ไม่เจออะไร
- [ ] `grep -rnE "font-size:\s*\.[0-6][0-9]?rem" src/` → ไม่เจออะไร
- [ ] `git status` → working tree สะอาด
- [ ] **`git diff HEAD~7 --stat -- firestore.rules` → ต้องว่าง** (งานนี้ไม่แตะ rules)
- [ ] **ห้าม `git push`** — รอ user สั่ง (push = deploy ขึ้นเว็บจริง)

### ลูปที่ควรเดินได้ครบหลังจบงาน

```
คนตรวจเจอข้อผิด  →  กด "ต้องแก้" พร้อมเหตุผล   →  ข้อไปกอง 🔴 ไม่ผ่านตรวจ
                                                        ↓
คนอื่นเปิด /review  ←  ข้อกลับเข้าคิว (คนแก้ตรวจเองไม่ได้)  ←  ใครสักคนกด "✏️ แก้ข้อนี้" แล้วแก้
        ↓
เห็นกล่องส้ม "🛠️ แก้โดย X · รอบก่อนตกเพราะ …"  →  ยืนยันว่าแก้ตรงจุด  →  กด "ถูกต้อง"  →  ✅ ผ่าน
```
