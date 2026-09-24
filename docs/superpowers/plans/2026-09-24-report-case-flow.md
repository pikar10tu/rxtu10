# ตรวจข้อสอบด้วยปุ่มชุดเดียว (Report Case Flow) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** การ์ดตรวจปกติและข้อที่ถูกรีพอร์ทใช้คำถามตัดสิน + ปุ่มชุดเดียว (ถูก / มีจุดผิด→แก้|นำออก) · รีพอร์ทขึ้นการ์ดหลักก่อนคิวปกติ · รางวัลผู้แจ้งออกหลังจัดการข้อเสร็จเท่านั้น

**Architecture:** ตรรกะล้วนใน `utils/reportCase.js` + `utils/mailbox.js` + `utils/questionReview.js` (มีเทส) · เส้นเขียน Firestore รวมที่ `composables/useReviewWrites.js` (ย้ายจาก ReviewView ที่ซ้ำกัน 3 ชุด) · UI ใหม่ 2 คอมโพเนนต์ `components/review/JudgeActions.vue` (ร่วม) + `ReportCaseCard.vue` · ReviewView เหลือหน้าที่จัดลำดับการ์ด + confirm + อัปเดต state ในเครื่อง

**Tech Stack:** Vue 3 `<script setup>` · Firebase modular SDK · `node --test` สำหรับ utils

**Spec:** `docs/superpowers/specs/2026-09-24-report-case-flow-design.md`

## Global Constraints

- ฟอนต์ขั้นต่ำ `.7rem` ในทุก `.vue` — ตรวจ: `grep -rnE "font-size:\s*\.[0-6][0-9]?rem" src/` ต้องว่าง
- ข้อความจากผู้ใช้ผ่าน `cleanText(str, LIMITS.xxx)` ก่อนเขียนเสมอ (`reviewReason` 1000 · `reviewNote` 1000 · `reviewRef` 300 · `reviewerName` 60)
- ลำดับเขียนแก้ข้อ: `reviews/{uid}` **ก่อน** `questions/{id}` เสมอ (rules `isReviewFix` ใช้ existsAfter)
- ห้ามใส่ field นอก `reviewSubmitKeys` ใน qPatch ของการส่งเสียง (rules ใช้ hasOnly)
- `categories` เป็นค่า derive — เขียนหมวดผ่าน `plePatch(group, sub)` เท่านั้น
- ไม่มี overlay ใหม่ (ทุกฟอร์มอยู่ในการ์ด) · confirm ใช้ `useConfirm()` เดิม
- rules **ไม่ต้องแก้** (retiredBy/retireReason ผ่าน `reviewUntouched()` · mail create = `isAcademic()`)
- โทนข้อความตาม `docs/voice-guide.md` · ห้ามใช้คำว่า "งานค้าง"
- commit รูปแบบ `Area: อะไร (ทำไม)` ลงท้าย `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`

---

### Task 1: ตรรกะล้วน — reportCase + จดหมายแจ้งผล + เครดิตนำออก

**Files:**
- Create: `src/utils/reportCase.js`, `src/utils/reportCase.test.js`
- Modify: `src/utils/mailbox.js` (เพิ่ม `buildReportResultMail` ถัดจาก `buildReportRewardMail` — ใช้ `truncate` ในไฟล์เดิม) · `src/utils/mailbox.test.js`
- Modify: `src/utils/questionReview.js` (`tallyReviewCounts` นับ `retiredBy` · `VERDICT_LABEL.retired`) · `src/utils/questionReview.test.js`

**Interfaces — Produces:**
- `canHandleReport(q, uid) → boolean`
- `nextReportGroup(groups, skippedIds:Set) → group|null`
- `snapshotDiffers(snapshot, q) → boolean`
- `buildReportResultMail(report, note, createdAt) → mail` (type `'notice'`, ไม่มี reward)
- `tallyReviewCounts(questions)` นับ `q.retiredBy` เพิ่ม 1 เมื่อไม่อยู่ใน `q.reviewedBy`

- [ ] **Step 1: เขียนเทส** `src/utils/reportCase.test.js`

```js
import test from 'node:test'
import assert from 'node:assert/strict'
import { canHandleReport, nextReportGroup, snapshotDiffers } from './reportCase.js'

test('canHandleReport — กันคนตรวจ/แก้/แต่งข้อนั้นเอง', () => {
  assert.equal(canHandleReport({ reviewedBy: [] }, 'u'), true)
  assert.equal(canHandleReport({ reviewedBy: ['u'] }, 'u'), false)
  assert.equal(canHandleReport({ lastFixBy: 'u' }, 'u'), false)
  assert.equal(canHandleReport({ createdBy: 'u' }, 'u'), false)
  assert.equal(canHandleReport({ createdBy: 'u', source: 'import' }, 'u'), true)
  assert.equal(canHandleReport(null, 'u'), false)
  assert.equal(canHandleReport({}, null), false)
})

test('nextReportGroup — ข้ามกลุ่มที่ข้ามไว้ เรียงตามลำดับเดิม', () => {
  const gs = [{ questionId: 'a' }, { questionId: 'b' }]
  assert.equal(nextReportGroup(gs, new Set()).questionId, 'a')
  assert.equal(nextReportGroup(gs, new Set(['a'])).questionId, 'b')
  assert.equal(nextReportGroup(gs, new Set(['a', 'b'])), null)
  assert.equal(nextReportGroup(null, new Set()), null)
})

test('snapshotDiffers — ไม่สนลำดับตัวเลือก (ควิซสลับตำแหน่ง) แต่จับโจทย์/ตัวเลือก/เฉลยที่เปลี่ยน', () => {
  const q = { question: 'Q', choices: ['a', 'b', 'c'], answer: 1 }
  const snap = { question: 'Q', choices: ['c', 'a', 'b'], answerText: 'b' }
  assert.equal(snapshotDiffers(snap, q), false)
  assert.equal(snapshotDiffers({ ...snap, answerText: 'c' }, q), true)
  assert.equal(snapshotDiffers({ ...snap, question: 'Q2' }, q), true)
  assert.equal(snapshotDiffers({ ...snap, choices: ['a', 'b', 'x'] }, q), true)
  assert.equal(snapshotDiffers(null, q), false)
})
```

ต่อท้าย `src/utils/mailbox.test.js` (เพิ่ม `buildReportResultMail` ใน import บนสุดของไฟล์):

```js
test('buildReportResultMail: notice ไม่มีรางวัล + เหตุผลจากคนตรวจ', () => {
  const r = { questionSnapshot: { question: 'ข้อทดสอบ' } }
  const m = buildReportResultMail(r, 'ข้อนี้ถามที่ eGFR 30–45', 'TS')
  assert.equal(m.type, 'notice')
  assert.equal(m.reward, undefined)
  assert.ok(m.body.includes('ข้อทดสอบ'))
  assert.ok(m.body.includes('eGFR 30–45'))
  assert.equal(m.createdAt, 'TS')
  assert.equal(m.claimed, false)
  assert.ok(!buildReportResultMail(r, '', 'TS').body.includes('เหตุผล'))
})
```

ต่อท้าย `src/utils/questionReview.test.js`:

```js
test('tallyReviewCounts — นำออกได้เครดิต (retiredBy) แต่ไม่นับซ้ำคนที่อยู่ใน reviewedBy', () => {
  const qs = [
    { reviewedBy: ['a'], retiredBy: 'b' },
    { reviewedBy: ['c'], retiredBy: 'c' },
    { retiredBy: 'b' },
  ]
  assert.deepEqual(tallyReviewCounts(qs), { a: 1, b: 2, c: 1 })
})
test('VERDICT_LABEL มีป้ายนำออก', () => { assert.equal(VERDICT_LABEL.retired, 'นำออก') })
```

- [ ] **Step 2: รันให้ fail** — `node --test src/utils/reportCase.test.js src/utils/mailbox.test.js src/utils/questionReview.test.js` → FAIL (module/export ไม่มี)

- [ ] **Step 3: เขียนโค้ด** `src/utils/reportCase.js`

```js
// ════════════════════════════════════════════════════════════
//  reportCase — ตรรกะล้วนของการ์ด "ข้อที่ถูกรีพอร์ท" ในหน้าตรวจ (24 ก.ย. 2026)
//  การ์ดรีพอร์ทขึ้นก่อนคิวปกติ · ถาม "ผู้แจ้งพูดถูกไหม" → ไม่ผิด / แก้ / นำออก
//  ดู docs/superpowers/specs/2026-09-24-report-case-flow-design.md
// ════════════════════════════════════════════════════════════

// ใครตัดสินรีพอร์ทข้อนี้ได้ — กันตัดสินงานตัวเอง และให้ rules isReviewSubmit ผ่านเสมอตอนตอบ "ไม่ผิด"
//  (ไม่เช็คจำนวนเสียงแบบ needsReviewBy: ข้อที่ผ่านตรวจแล้วก็ถูกรีพอร์ทได้)
export function canHandleReport(q, uid) {
  if (!q || !uid) return false
  if ((q.reviewedBy || []).includes(uid)) return false
  if (q.lastFixBy === uid) return false
  if (q.createdBy === uid && q.source !== 'import') return false
  return true
}

// กลุ่มรีพอร์ทถัดไปที่ยังไม่ได้ข้ามในเซสชันนี้ (groups เรียงใหม่สุดก่อนมาจาก groupReports แล้ว)
export function nextReportGroup(groups, skippedIds) {
  return (groups || []).find(g => !skippedIds?.has(g.questionId)) || null
}

// ข้อตอนนี้ต่างจากตอนที่นักศึกษาแจ้งไหม — ตัวเลือกเทียบแบบไม่สนลำดับ เพราะควิซสลับตำแหน่ง
// (snapshot เก็บ answerText ไม่ใช่ index ด้วยเหตุผลเดียวกัน)
export function snapshotDiffers(snapshot, q) {
  if (!snapshot || !q) return false
  const norm = a => [...(a || [])].map(String).sort().join('\u0001')
  return (snapshot.question || '') !== (q.question || '')
    || norm(snapshot.choices) !== norm(q.choices)
    || (snapshot.answerText ?? '') !== (q.choices?.[q.answer] ?? '')
}
```

ใน `src/utils/mailbox.js` ต่อจาก `buildReportRewardMail`:

```js
// จดหมายแจ้งผู้แจ้งว่า "ข้อนี้ไม่ผิด" — ไม่มีรางวัล (notice) · note = เหตุผลที่คนตรวจเขียน (ผ่าน cleanText มาแล้ว)
// ⚠️ body แสดงด้วย {{ }} ใน MailboxCard (ไม่มี pre-wrap) — ต่อด้วย " · " ไม่ใช้ขึ้นบรรทัด
export function buildReportResultMail(report, note, createdAt) {
  const q = report?.questionSnapshot?.question
  const head = q
    ? `ทีมวิชาการตรวจข้อ "${truncate(q, 60)}" ที่คุณแจ้งแล้ว — ข้อนี้ถูกต้องอยู่แล้ว`
    : 'ทีมวิชาการตรวจข้อที่คุณแจ้งแล้ว — ข้อนี้ถูกต้องอยู่แล้ว'
  return {
    type: 'notice',
    title: 'ผลการแจ้งข้อสอบ',
    body: note ? `${head} · เหตุผล: ${note}` : head,
    from: 'system',
    createdAt,
    read: false,
    claimed: false,
  }
}
```

ใน `src/utils/questionReview.js`:

```js
// uid → จำนวนข้อที่ตรวจไปแล้ว (นับจาก reviewedBy ทั้งคลัง = ตัวนับ leaderboard)
//  + นำออก (retiredBy) นับ 1 ข้อให้คนนำออก ถ้าเขาไม่ได้อยู่ใน reviewedBy ของข้อนั้นอยู่แล้ว
//    (24 ก.ย. 2026 — นำออกได้เครดิต · ไม่งั้นปุ่มซิงก์ระบบตรวจจะลบเครดิตนี้ทิ้งทุกครั้ง)
export function tallyReviewCounts(questions) {
  const counts = {}
  for (const q of questions || []) {
    const by = q.reviewedBy || []
    for (const uid of by) counts[uid] = (counts[uid] || 0) + 1
    if (q.retiredBy && !by.includes(q.retiredBy)) counts[q.retiredBy] = (counts[q.retiredBy] || 0) + 1
  }
  return counts
}
```

และ `VERDICT_LABEL` เพิ่ม `retired: 'นำออก'`

- [ ] **Step 4: รันให้ผ่าน** — คำสั่งเดิม → PASS · แล้วรันทั้งหมด `node --test src/utils/*.test.js` → fail 0
- [ ] **Step 5: Commit** — `Review: ตรรกะการ์ดรีพอร์ท + จดหมายแจ้งผล "ไม่ผิด" + นำออกได้เครดิต`

---

### Task 2: รวมเส้นเขียน Firestore ที่ `useReviewWrites` (refactor ไม่เปลี่ยนพฤติกรรม)

**Files:**
- Create: `src/composables/useReviewWrites.js`
- Modify: `src/views/ReviewView.vue` — `submit()` · `saveEdit()` สาขา isFix · `saveFix()` · `resolveReportGroup()` เรียก composable แทนโค้ดในตัว

**Interfaces — Consumes:** Task 1 (`buildReportResultMail`, `VERDICT_LABEL`)
**Produces:**
- `useReviewWrites() → { reviewerName(), writeVote, writeFix, writeRetireWithCredit, resolveReports }`
- `writeVote(q, { verdict, reason, ref, ple, note }) → Promise<{ already, wasResolved, oldStatus, newStatus, newPass, newFail, committedCats, committedPle, committedNote }>` — throw `Error('__stale')` เมื่อ qhash เปลี่ยน · `ple` = `{group, sub}` หรือ null (null = ไม่แตะหมวด) · `note` = ข้อความดิบ หรือ `undefined` (ไม่แตะหมายเหตุ)
- `writeFix(q, payload, reason) → Promise<{ oldStatus }>` — payload จาก `draftPayload()` · เขียน reviews/{uid} ก่อน แล้ว question · แล้ว bump reviewMeta (พลาดได้ไม่ throw)
- `writeRetireWithCredit(q, reason) → Promise<{ oldStatus, credited }>` — `retired:true, isPublished:false, retiredBy, retiredByName, retireReason, retiredAt, updatedAt` · credited = uid ไม่อยู่ใน reviewedBy
- `resolveReports(group, verdict:'valid'|'invalid', note='') → Promise<{ closed, skipped }>` — transaction อ่านรีพอร์ททุกฉบับก่อน ฉบับที่ไม่ `open` ข้าม · valid = จดหมายรางวัล `REPORT_REWARD` · invalid = `buildReportResultMail`

- [ ] **Step 1: สร้าง composable** — ย้ายโค้ดจาก ReviewView แบบคำต่อคำ:
  - `writeVote` = ตัว `runTransaction` ใน `submit()` (บรรทัด ~966–1033) โดยแทน `verdict.value`/`reason.value`/`refText.value`/`ple.value`/`note.value` ด้วยพารามิเตอร์ · `baseNote` = `cleanText(q.reviewNote || '', LIMITS.reviewNote)` · ถ้า `ple` เป็น null ข้ามบล็อก plePatch · ถ้า `note === undefined` ข้ามบล็อกหมายเหตุ · `usage.track(1, already ? 0 : 3)` ย้ายมาด้วย
  - `writeFix` = สาขา isFix ของ `saveEdit()` ตั้งแต่ `setDoc(reviews)` ถึง bump reviewMeta (ไม่รวม patch local/toast)
  - `bumpMeta(uid, name, from, to)` ภายใน: `setDoc(reviewMeta/main, { counts:{[uid]:increment(1)}, names:{[uid]:name}, ...(from !== to && from && to ? { progress: { [from]: increment(-1), [to]: increment(1) } } : {}) }, { merge:true })` ใน try/catch `console.error('[reviewMeta bump]', e)` คืน boolean
  - `writeRetireWithCredit`:

```js
async function writeRetireWithCredit(q, reason) {
  const uid = authStore.currentUser?.uid
  const name = reviewerName()
  const oldStatus = computeStatus(q)
  await updateDoc(doc(db, 'questions', q.id), {
    retired: true, isPublished: false,
    retiredBy: uid, retiredByName: name,
    retireReason: cleanText(reason, LIMITS.reviewReason),
    retiredAt: serverTimestamp(), updatedAt: serverTimestamp(),
  })
  usage.track(0, 1)
  // เครดิตเฉพาะคนที่ไม่ได้อยู่ใน reviewedBy — ตรงกับ tallyReviewCounts (ไม่งั้นซิงก์แล้วเลขหด)
  const credited = !(q.reviewedBy || []).includes(uid)
  if (credited && await bumpMeta(uid, name, oldStatus, 'retired')) usage.track(0, 1)
  return { oldStatus, credited }
}
```

  - `resolveReports`:

```js
async function resolveReports(group, verdict, note = '') {
  const cleanNote = cleanText(note, LIMITS.reviewReason)
  let closed = 0, skipped = 0
  await runTransaction(db, async (tx) => {
    closed = 0; skipped = 0   // transaction รีทรายได้
    const refs = group.reports.map(r => doc(db, 'questionReports', r.id))
    const snaps = []
    for (const ref of refs) snaps.push(await tx.get(ref))   // อ่านทั้งหมดก่อนเขียน (กติกา transaction)
    snaps.forEach((s, i) => {
      const r = group.reports[i]
      if (!s.exists() || s.data().status !== 'open') { skipped++; return }   // มีคนปิดไปแล้ว → ไม่จ่ายซ้ำ
      const mailRef = doc(collection(db, 'users', r.reportedBy, 'mail'))
      if (verdict === 'valid') {
        tx.set(mailRef, buildReportRewardMail(r, REPORT_REWARD, serverTimestamp()))
        tx.update(refs[i], { ...resolvePayload('valid', REPORT_REWARD), rewardDelivered: true, resolvedAt: serverTimestamp() })
      } else {
        tx.set(mailRef, buildReportResultMail(r, cleanNote, serverTimestamp()))
        tx.update(refs[i], { ...resolvePayload('invalid', REPORT_REWARD), resolvedAt: serverTimestamp() })
      }
      closed++
    })
  })
  usage.track(group.reports.length, closed * 2)
  return { closed, skipped }
}
```

- [ ] **Step 2: ต่อ ReviewView เข้า composable** — `submit()` เรียก `writeVote(q, { verdict: verdict.value, reason: reason.value, ref: refText.value, ple: ple.value, note: note.value })` แล้วใช้ค่าที่คืนทำส่วน local เหมือนเดิม · `saveEdit()` isFix → `writeFix(q, payload, fixReason.value)` · `saveFix()` → `writeFix(q, payload, triageFixReason.value)` + ถ้ามีกลุ่มรีพอร์ท `resolveReports(g,'valid')` · `resolveReportGroup(g, verdict)` → `resolveReports(g, verdict)` แล้ว filter openReports เหมือนเดิม · ลบ import ที่ไม่ใช้แล้ว (`runTransaction`, `arrayUnion`, `writeBatch`, `buildReportRewardMail`, `resolvePayload`, `REPORT_REWARD` ถ้าไม่มีที่ใช้แล้ว — ตรวจด้วย grep ก่อนลบ)
- [ ] **Step 3: ตรวจ** — `npm run build` ผ่าน · `node --test src/utils/*.test.js` fail 0 · `grep -n "runTransaction\|reviewMeta" src/views/ReviewView.vue` เหลือเฉพาะจุดอ่าน `getDoc(reviewMeta)` ใน load()
- [ ] **Step 4: Commit** — `Review: รวมเส้นเขียนตรวจ/แก้/นำออก/ปิดรีพอร์ทที่ useReviewWrites (ปิดรีพอร์ทเป็น transaction กันจ่ายรางวัลซ้ำ)`

---

### Task 3: `JudgeActions.vue` + การ์ดตรวจปกติแบบใหม่

**Files:**
- Create: `src/components/review/JudgeActions.vue`
- Modify: `src/views/ReviewView.vue` (template การ์ดปกติ + script)

**Interfaces — Consumes:** Task 2 (`writeFix`, `writeRetireWithCredit`) · `draftFrom/draftPayload/draftValid` · `verdictContentChanged`
**Produces:** `<JudgeActions :question :mode="'review'|'report'" :busy :canPass :blockedHint @pass="({ note })" @fix="({ payload, reason })" @retire="({ reason })" @skip />`
- mode `review`: คำถาม "ข้อนี้ถูกต้องไหม?" · ปุ่ม `มีจุดผิด` / `✅ ถูกต้อง ส่งผล` → emit `pass({ note: '' })` ทันที
- mode `report`: คำถาม "ผู้แจ้งพูดถูกไหม?" · ปุ่ม `ผิดจริง` / `ไม่ผิด ข้อสอบถูกแล้ว` → ขั้น note (textarea ไม่บังคับ + `‹ ย้อนกลับ` + `ปิดรีพอร์ท`) → emit `pass({ note })`
- ขั้น how: `✏️ แก้ข้อนี้` / `🗑️ นำออก` / `‹ ย้อนกลับ` + hint ("รางวัลผู้แจ้งจะออกตอนจัดการเสร็จ" เฉพาะ report)
- ขั้น edit: `<QuestionEditor v-model="draft" compact />` + textarea "แก้อะไร/ทำไม (บังคับ)" · ปุ่มบันทึกเปิดเมื่อ `draftValid(draft) && verdictContentChanged(draftPayload(draftFrom(question)), draftPayload(draft)) && reason.trim()` · ข้อความใต้ปุ่มเมื่อเปิดไม่ได้เพราะไม่ได้แก้ชั้นตัดสิน: "ยังไม่ได้แก้โจทย์ ตัวเลือก หรือเฉลย"
- ขั้น retire: textarea "ทำไมถึงนำออก (บังคับ)" + ปุ่มนำออก
- ปุ่มผ่าน disabled เมื่อ `!canPass` และแสดง `blockedHint` ใต้ปุ่ม (มองเห็นก่อนกด)
- ลิงก์ `ข้ามข้อนี้` → emit `skip` (ทั้งสองโหมด)
- ไม่ confirm เอง (parent confirm เพราะรู้จำนวนเหรียญ) · parent reset ด้วย `:key="question.id"`

- [ ] **Step 1: สร้าง JudgeActions.vue** — state `step: 'judge'|'note'|'how'|'edit'|'retire'`, `draft`, `reason`, `note` · สไตล์ใช้คลาสเดียวกับ ReviewView (`.rv-btn`, `.rv-primary`, `.rv-gray`, `.rv-mini`, `.rv-input`, `.rv-label`) ก๊อปกฎที่ใช้มาไว้ใน scoped style ของคอมโพเนนต์ + `.ja-good { background: var(--mint); color:#fff }` `.ja-bad { background: var(--accent); color:#fff }` · ทุก font-size ≥ .7rem
- [ ] **Step 2: การ์ดปกติใน ReviewView**
  - ลบ `.rv-card-tools` (ปุ่มเล็กแก้/นำออกบนหัวการ์ด) · ลบ `VERDICTS`, `verdict` ref, บล็อก `.rv-verdicts` และสไตล์ `.rv-vbtn*` · `canSubmit` เหลือ `isPleGroupKey(ple.value.group)`
  - แถวกลุ่มโรค: ถ้ามีกลุ่ม → "กลุ่มโรค: **{{ groupLabel(ple.group) }}** · sub" + ป้าย "เดาให้" เมื่อ `ple.inferred` + ปุ่ม [เปลี่ยน] (toggle `groupOpen`) · ถ้าไม่มี → กรอบเหลือง "ต้องเลือกกลุ่มโรคก่อนส่ง — ระบบเดาจากหมวดเดิมไม่ได้" + TopicSelect กางเลย
  - ปุ่ม "＋ เพิ่ม เหตุผล / เรฟ / หมายเหตุถึงนักศึกษา" toggle `extrasOpen` (watch(currentId) ตั้ง `extrasOpen = !!q?.reviewNote`, `groupOpen = false`) · ข้างในมี 3 ช่องเดิม + ปุ่ม "📝 แก้คำอธิบายเฉลย" → `openEdit()` (ฟอร์ม edit เดิมคงไว้ทั้งก้อน)
  - `<JudgeActions :key="current.id" mode="review" :question="current" :busy="submitting || savingEdit || retiring" :canPass="canSubmit" blockedHint="เลือกกลุ่มโรคก่อนถึงจะส่งผลได้" @pass="submit" @fix="onJudgeFix" @retire="onJudgeRetire" @skip="skip" />`
  - `submit()` confirm ข้อความ `ส่งผลว่า "ถูกต้อง"?` แล้ว `writeVote(... verdict: 'correct' ...)`
  - `onJudgeFix({ payload, reason })`: confirm "บันทึกการแก้?\nนับว่าคุณตรวจข้อนี้ผ่านแล้ว ไม่ต้องรอคนอื่นตรวจซ้ำ" → `writeFix(q, { ...payload, ...(plePatch(ple.value.group, ple.value.sub) || {}) }, reason)` → patch local + meta local + toast 'แก้และตรวจผ่านแล้ว ขอบคุณ!' + pickNext (เหมือนสาขา isFix เดิม)
  - `onJudgeRetire({ reason })`: confirm "นำข้อนี้ออกจากการใช้งาน?…" → `writeRetireWithCredit(q, reason)` → `patchTriageRow(q.id, { retired: true, isPublished: false })` + ถ้า credited ขยับ meta local + toast 'นำข้อนี้ออกแล้ว' + pickNext · ลบ `retireCurrent()` เดิม
- [ ] **Step 3: ตรวจ** — `npm run build` · grep ฟอนต์ · `grep -n "verdict.value\|VERDICTS\|retireCurrent" src/views/ReviewView.vue` ว่าง
- [ ] **Step 4: Commit** — `Review: การ์ดตรวจปกติถามคำเดียว "ข้อนี้ถูกต้องไหม" (มีจุดผิด→แก้/นำออก · กลุ่มโรคบรรทัดเดียว · พับช่องไม่บังคับ)`

---

### Task 4: `ReportCaseCard.vue` + รีพอร์ทขึ้นก่อนคิวปกติ

**Files:**
- Create: `src/components/review/ReportCaseCard.vue`
- Modify: `src/views/ReviewView.vue`

**Interfaces — Consumes:** Task 1 (`canHandleReport`, `nextReportGroup`, `snapshotDiffers`) · Task 2 (`writeVote`, `writeFix`, `writeRetireWithCredit`, `resolveReports`) · Task 3 (`JudgeActions`)
**Produces:** `<ReportCaseCard :group :question :gone :busy @pass @fix @retire @closeGone @skip />`

- [ ] **Step 1: ReportCaseCard.vue** — แสดง: หัว "🚩 นักศึกษาแจ้ง {{ group.count }} คน" · โจทย์เต็ม/ตัวเลือก (ติ๊กเฉลย)/คำอธิบาย จาก `question` (ถ้า `gone` ใช้ `group.snapshot` + กรอบ "ข้อนี้ถูกนำออกหรือลบไปแล้ว" + ปุ่มเดียว `ปิดรีพอร์ท + ให้รางวัล` → emit `closeGone`) · รายการรีพอร์ท (`<b>reason</b> — note`) · ถ้า `snapshotDiffers(group.snapshot, question)` → ป้าย "ข้อนี้ถูกแก้ไปแล้วหลังมีคนแจ้ง — ดูว่ายังผิดอยู่ไหม" · `<JudgeActions mode="report" :key="question.id" canPass …>` ส่ง event ต่อขึ้นไป · 💬 `QuestionComments` แบบพับ (v-if เมื่อกาง, :key)
- [ ] **Step 2: ลำดับการ์ดใน ReviewView**

```js
const reportSkipped = ref(new Set())
const reportCase = ref(null)        // { group, question, gone }
const reportOpening = ref(false)
const reportBusy = ref(false)
const pendingReportCount = computed(() => authStore.isAcademic
  ? reportGroups.value.filter(g => !reportSkipped.value.has(g.questionId)).length : 0)
let openToken = 0
async function openNextReport() {
  const g = authStore.isAcademic ? nextReportGroup(reportGroups.value, reportSkipped.value) : null
  if (!g) { reportCase.value = null; return }
  if (reportCase.value?.group.questionId === g.questionId) { reportCase.value = { ...reportCase.value, group: g }; return }
  const token = ++openToken
  reportOpening.value = true
  try {
    const snap = await getDoc(doc(db, 'questions', g.questionId))
    usage.track(1)
    if (token !== openToken) return
    const q = snap.exists() ? { id: snap.id, ...snap.data() } : null
    if (q && !q.retired && !canHandleReport(q, myUid.value)) {   // ข้อของตัวเอง → ปล่อยให้คนอื่น
      reportSkipped.value = new Set([...reportSkipped.value, g.questionId]); return
    }
    reportCase.value = { group: g, question: q, gone: !q || !!q.retired }
  } catch (e) { console.error('[report open]', e); toast('โหลดข้อที่ถูกแจ้งไม่สำเร็จ', 'error'); reportCase.value = null }
  finally { if (token === openToken) reportOpening.value = false }
}
watch([reportGroups, reportSkipped], openNextReport)
```

  - handlers (ทุกตัว: `if (reportBusy.value) return` → confirm → try/finally reportBusy):
    - `onReportPass({ note })`: confirm `ปิดรีพอร์ทว่า "ไม่ผิด"?\nผู้แจ้ง ${n} คนจะได้จดหมายแจ้งผล ไม่มีรางวัล` → `writeVote(q, { verdict: 'correct', reason: note, ref: '', ple: null, note: undefined })` → ถ้า `already` toast 'คุณตรวจข้อนี้ไปแล้ว' · else ขยับ meta local (+1 counts, progress old→new) → `resolveReports(g, 'invalid', note)` → `finishReport(g, closed, skipped)`
    - `onReportFix({ payload, reason })`: confirm `บันทึกการแก้?\nข้อผ่านตรวจทันที และส่งรางวัล ${REPORT_REWARD} เหรียญให้ผู้แจ้ง ${n} คน` → `writeFix` → meta local → `resolveReports(g,'valid')` → finish
    - `onReportRetire({ reason })`: confirm `นำข้อนี้ออก?\nถอนเผยแพร่ และส่งรางวัล ${REPORT_REWARD} เหรียญให้ผู้แจ้ง ${n} คน` → `writeRetireWithCredit` → meta local ถ้า credited → `resolveReports(g,'valid')` → finish
    - `onReportCloseGone()`: confirm `ปิดรีพอร์ท + ให้รางวัล ${REPORT_REWARD} เหรียญแก่ผู้แจ้ง ${n} คน?` → `resolveReports(g,'valid')` → finish
    - `onReportSkip()`: เพิ่มเข้า reportSkipped
    - `finishReport(g, closed, skipped)`: `openReports.value = openReports.value.filter(r => r.questionId !== g.questionId)` · toast: skipped && !closed → 'มีคนปิดรีพอร์ทข้อนี้ไปแล้ว' · else 'จัดการแล้ว ขอบคุณ!' (valid เติม ` · ส่งรางวัลให้ผู้แจ้ง ${closed} คน`)
    - ถ้า writeX สำเร็จแต่ `resolveReports` throw: toast 'จัดการข้อแล้ว แต่ปิดรีพอร์ทไม่สำเร็จ — กด "ปิดรีพอร์ท + ให้รางวัล" อีกครั้ง' และตั้ง `reportCase.value = { ...reportCase.value, gone: true }` (ข้อจัดการแล้ว เหลือปุ่มเดียว) — กรณี "ไม่ผิด" ใช้ข้อความเดียวกันแต่ไม่เปลี่ยนเป็น gone (กดไม่ผิดซ้ำได้ เพราะ writeVote คืน already)
  - template: แบนเนอร์ `<div v-if="pendingReportCount" class="rv-report-banner">🚩 มีข้อที่ถูกแจ้ง <b>{{ pendingReportCount }}</b> ข้อ — ขึ้นให้ตรวจก่อนข้อปกติ</div>` ใต้แถบสรุป · เงื่อนไขพื้นที่การ์ด: `loading || reportsLoading || reportOpening` → "กำลังโหลด…" · `v-else-if="reportCase"` → ReportCaseCard · `v-else-if="current"` → การ์ดปกติ (เดิม)
  - ลบ section `🚩 ข้อที่ถูกรีพอร์ท` เดิมทั้งก้อน + `openReportedFix`, `fixSourceQuestion`, `resolveReportGroup`, `resolvingReportId`, `reportQuestionText` และสไตล์ `.rv-reports`/`.rv-report-reasons` ที่ไม่มีคนใช้ (grep ก่อนลบ) · `saveFix()` ของกอง failed ยังปิดรีพอร์ทอัตโนมัติด้วย `resolveReports` (Task 2)
- [ ] **Step 3: ตรวจ** — `npm run build` · เทสทั้งหมด · grep ฟอนต์ · `grep -n "resolveReportGroup\|openReportedFix" src/views/ReviewView.vue` ว่าง
- [ ] **Step 4: Commit** — `Review: ข้อที่ถูกรีพอร์ทขึ้นการ์ดหลักก่อนคิวปกติ (ต้องแก้/นำออกก่อนถึงจ่ายรางวัล · "ไม่ผิด" แจ้งผู้แจ้ง+นับเครดิต)`

---

### Task 5: ตรวจรวม + เช็คลิสต์เทสมือ + deploy

**Files:**
- Create: `docs/superpowers/plans/2026-09-24-report-case-flow-testlist.md`

- [ ] **Step 1: ตรวจรวม** — `node --test src/utils/*.test.js` (fail 0) · `npm run build` · `grep -rnE "font-size:\s*\.[0-6][0-9]?rem" src/` ว่าง · อ่าน diff ReviewView ทั้งไฟล์ครั้งเดียวหาของค้าง (ตัวแปรไม่ได้ใช้, import ค้าง)
- [ ] **Step 2: เช็คลิสต์เทสมือ** (เขียนลงไฟล์) — ข้อปกติ: ถูกต้อง (2 แตะ) / แก้เฉลย / แก้แค่คำอธิบาย (ปุ่มบันทึกเทา + ข้อความบอก) / นำออก (ตัวนับ +1) / ไม่มีกลุ่มโรค (กรอบเหลือง ปุ่มเทาพร้อมเหตุผล) / ข้าม · รีพอร์ท: ไม่ผิด (ผู้แจ้งได้จดหมาย notice, ตัวนับ +1) / แก้ (รางวัล+เครดิต) / นำออก / ข้าม / ข้อถูกลบ / สองเครื่องปิดพร้อมกัน (จดหมายรางวัลฉบับเดียว) / ข้อที่ตัวเองแก้ไม่ขึ้นให้ตัวเอง / อาจารย์ไม่เห็นแบนเนอร์ · แอดมินกดซิงก์ระบบตรวจแล้วเครดิตนำออกไม่หาย
- [ ] **Step 3: Commit + push** — `git push origin master` (Pages auto-deploy) · รอ `gh run watch` success · rules ไม่ต้อง deploy
