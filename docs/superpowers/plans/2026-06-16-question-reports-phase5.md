# Phase 5 — แจ้งข้อสอบผิด (questionReports) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** ให้นักศึกษากดปุ่ม 🚩 แจ้งข้อสอบผิดใน Quiz และทีมวิชาการรีวิว/ตัดสิน/ปิดรายการได้ใน QuestionsView โดยบันทึกรางวัลค้างไว้ (ส่งจริงทีหลังผ่าน Mailbox)

**Architecture:** collection ใหม่ `questionReports/{questionId__uid}` (deterministic id = 1 คน/ข้อ/doc) · logic ล้วนแยกเป็น pure util `questionReport.js` (เทสด้วย `node --test`) · QuizView เขียน report (`setDoc merge`) · QuestionsView อ่าน open reports (academic เท่านั้น = cost ต่ำ) จัดกลุ่มแล้วปิดเป็น batch · รางวัลแค่ stamp `rewardAmount`/`rewardDelivered:false` รอ Mailbox track ถัดไป

**Tech Stack:** Vue 3 + Pinia + Firebase Firestore · pure util + `node --test` · firestore.rules + composite index (deploy ด้วย `firebase deploy`)

**Spec อ้างอิง:** `docs/superpowers/specs/2026-06-16-question-reports-design.md`

---

## File Structure

- **Create** `src/utils/questionReport.js` — pure helpers: `reportDocId`, `buildSnapshot`, `groupReports`, `resolvePayload` (ไม่ import Firestore — caller เติม timestamp เอง ให้เทสได้)
- **Create** `src/utils/questionReport.test.js` — เทส 6 เคสครอบทุก helper
- **Modify** `src/data/index.js` — เพิ่มค่าคงที่ `REPORT_REWARD` (placeholder 50)
- **Modify** `firestore.rules` — เพิ่ม match `questionReports/{id}`
- **Modify** `firestore.indexes.json` — เพิ่ม composite index `questionReports (status ASC, createdAt DESC)`
- **Modify** `src/views/QuizView.vue` — ปุ่ม 🚩 + panel เหตุผล + `setDoc`
- **Modify** `src/views/QuestionsView.vue` — section 🚩 ดูข้อที่ถูกแจ้ง + group + resolve

---

## Task 1: ค่าคงที่ REPORT_REWARD

**Files:**
- Modify: `src/data/index.js` (เพิ่มท้ายไฟล์)

- [ ] **Step 1: เพิ่มค่าคงที่**

ต่อท้าย `src/data/index.js`:

```js

// ── REPORT REWARD (Phase 5) ──
// เหรียญรางวัลเมื่อทีมวิชาการตัดสินว่า report ข้อสอบผิด "ผิดจริง" (verdict=valid).
// ส่งจริงผ่าน Mailbox (track ถัดไป) — Phase 5 แค่ stamp ค่านี้ค้างไว้บน report doc.
export const REPORT_REWARD = 50; // TBD รอเคาะตอนรีวิว economy
```

- [ ] **Step 2: ยืนยัน build ไม่พัง**

Run: `npm run build`
Expected: `✓ built in ...` (ไม่มี error)

- [ ] **Step 3: Commit**

```bash
git add src/data/index.js
git commit -m "Phase5: ค่าคงที่ REPORT_REWARD (placeholder 50)"
```

---

## Task 2: pure util `questionReport.js` + เทส (TDD)

**Files:**
- Create: `src/utils/questionReport.js`
- Test: `src/utils/questionReport.test.js`

- [ ] **Step 1: เขียนเทสที่จะ fail ก่อน**

สร้าง `src/utils/questionReport.test.js`:

```js
// เทส questionReport — pure logic ของฟีเจอร์แจ้งข้อสอบผิด (Phase 5)
// รัน: node --test src/utils/questionReport.test.js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { reportDocId, buildSnapshot, groupReports, resolvePayload } from './questionReport.js'

test('reportDocId: deterministic ${questionId}__${uid}', () => {
  assert.equal(reportDocId('q1', 'u1'), 'q1__u1')
})

test('buildSnapshot: ตัด field + answerText = ข้อความ choices[answer]', () => {
  const snap = buildSnapshot({ question: 'Q', category: 'C', choices: ['ก', 'ข', 'ค'], answer: 2, explanation: 'E', extra: 'x' })
  assert.deepEqual(snap, { question: 'Q', category: 'C', choices: ['ก', 'ข', 'ค'], answerText: 'ค', explanation: 'E' })
})

test('buildSnapshot: กัน field undefined → ค่าว่าง ไม่ throw', () => {
  assert.deepEqual(buildSnapshot({}), { question: '', category: '', choices: [], answerText: '', explanation: '' })
  assert.deepEqual(buildSnapshot(undefined), { question: '', category: '', choices: [], answerText: '', explanation: '' })
})

test('groupReports: นับถูก / แยก questionId / เรียงใหม่สุดก่อน', () => {
  const reports = [
    { id: 'q1__a', questionId: 'q1', createdAt: 100, questionSnapshot: { question: 'A' } },
    { id: 'q2__b', questionId: 'q2', createdAt: 300, questionSnapshot: { question: 'B' } },
    { id: 'q1__c', questionId: 'q1', createdAt: 200, questionSnapshot: { question: 'A2' } },
  ]
  const g = groupReports(reports)
  assert.equal(g.length, 2)
  assert.equal(g[0].questionId, 'q2')          // กลุ่มใหม่สุด (300) ก่อน
  assert.equal(g[1].questionId, 'q1')
  assert.equal(g[1].count, 2)
  assert.equal(g[1].reports[0].createdAt, 200) // ในกลุ่มเรียงใหม่สุดก่อน
  assert.equal(g[1].snapshot.question, 'A2')   // snapshot = report ใหม่สุดของกลุ่ม
})

test('resolvePayload valid: stamp reward + rewardDelivered:false (ไม่มี resolvedAt — caller เติม)', () => {
  assert.deepEqual(resolvePayload('valid', 50), { status: 'resolved', verdict: 'valid', rewardAmount: 50, rewardDelivered: false })
})

test('resolvePayload invalid: ไม่มีรางวัล', () => {
  assert.deepEqual(resolvePayload('invalid', 50), { status: 'resolved', verdict: 'invalid', rewardAmount: 0 })
})
```

- [ ] **Step 2: รันเทสให้เห็นว่า fail**

Run: `node --test src/utils/questionReport.test.js`
Expected: FAIL — `Cannot find module './questionReport.js'` (ยังไม่ได้สร้างไฟล์ implementation)

- [ ] **Step 3: เขียน implementation ขั้นต่ำให้ผ่าน**

สร้าง `src/utils/questionReport.js`:

```js
// ════════════════════════════════════════════════════════════
//  questionReport — pure helpers ฟีเจอร์ "แจ้งข้อสอบผิด" (Phase 5)
//  ไม่ import Firestore: caller เป็นคนเติม serverTimestamp() เอง → เทสได้ตรง
// ════════════════════════════════════════════════════════════

// deterministic doc id → 1 report ต่อ (ข้อ, ผู้ใช้); re-report = ทับ doc เดิม
export function reportDocId(questionId, uid) {
  return `${questionId}__${uid}`
}

// snapshot ของข้อ ณ เวลาแจ้ง — fallback เผื่อข้อถูกแก้/ลบก่อนรีวิว
// answerText เก็บ "ข้อความ" คำตอบ (ไม่ใช่ index) เพราะ QuizView สลับตำแหน่งตัวเลือก
export function buildSnapshot(q) {
  const choices = Array.isArray(q?.choices) ? q.choices.slice() : []
  const answer = typeof q?.answer === 'number' ? q.answer : -1
  return {
    question: q?.question || '',
    category: q?.category || '',
    choices,
    answerText: choices[answer] ?? '',
    explanation: q?.explanation || '',
  }
}

// Firestore Timestamp | Date | ISO string | number → ms (0 ถ้าแปลงไม่ได้)
function toMs(t) {
  if (!t) return 0
  if (typeof t === 'number') return t
  if (typeof t.toMillis === 'function') return t.toMillis()
  if (typeof t.toDate === 'function') return t.toDate().getTime()
  const n = new Date(t).getTime()
  return Number.isNaN(n) ? 0 : n
}

// จัดกลุ่ม reports[] (flat) ตาม questionId → [{ questionId, count, reports[], snapshot }]
// ในกลุ่ม + ระหว่างกลุ่ม เรียงใหม่สุดก่อน (tie-break: count มากก่อน)
export function groupReports(reports) {
  const byQ = new Map()
  for (const r of reports || []) {
    if (!byQ.has(r.questionId)) byQ.set(r.questionId, [])
    byQ.get(r.questionId).push(r)
  }
  const groups = []
  for (const [questionId, rs] of byQ) {
    const sorted = rs.slice().sort((a, b) => toMs(b.createdAt) - toMs(a.createdAt))
    groups.push({ questionId, count: sorted.length, reports: sorted, snapshot: sorted[0]?.questionSnapshot || null })
  }
  return groups.sort((a, b) =>
    toMs(b.reports[0]?.createdAt) - toMs(a.reports[0]?.createdAt) || b.count - a.count
  )
}

// patch สำหรับปิด report (ไม่รวม resolvedAt — caller เติม serverTimestamp())
//   valid   → stamp รางวัล, รอ Mailbox ส่ง (rewardDelivered:false)
//   invalid → ไม่มีรางวัล
export function resolvePayload(verdict, rewardConst) {
  if (verdict === 'valid') {
    return { status: 'resolved', verdict: 'valid', rewardAmount: rewardConst, rewardDelivered: false }
  }
  return { status: 'resolved', verdict: 'invalid', rewardAmount: 0 }
}
```

- [ ] **Step 4: รันเทสให้ผ่าน**

Run: `node --test src/utils/questionReport.test.js`
Expected: PASS — `# pass 6` `# fail 0`

- [ ] **Step 5: Commit**

```bash
git add src/utils/questionReport.js src/utils/questionReport.test.js
git commit -m "Phase5: pure util questionReport (id/snapshot/group/resolve) + 6 เทส"
```

---

## Task 3: firestore.rules + composite index (+ deploy)

**Files:**
- Modify: `firestore.rules` (เพิ่ม match ก่อนบรรทัด `// (SRS cards live...)` ~line 142)
- Modify: `firestore.indexes.json` (เพิ่ม index ใน array `"indexes"`)

- [ ] **Step 1: เพิ่ม rules บล็อก questionReports**

ใน `firestore.rules` แทรกก่อนคอมเมนต์ `// (SRS cards live in the user doc...)`:

```
    // ── Question reports (Phase 5) — นักศึกษาแจ้งข้อสอบผิด ──
    //  read:   academic เท่านั้น (คนน้อย → ไม่กระทบเพดาน reads รายวันของนักศึกษา)
    //  create: ผู้ล็อกอิน สร้าง report ของตัวเอง (reportedBy ต้องเป็น uid ตัวเอง)
    //  update: academic (ปิด/ตัดสิน) หรือ เจ้าของ report (re-report = setDoc merge → update)
    //  delete: academic
    match /questionReports/{id} {
      allow read:   if isAcademic();
      allow create: if request.auth != null
                    && request.resource.data.reportedBy == request.auth.uid;
      allow update: if isAcademic()
                    || (request.auth != null && resource.data.reportedBy == request.auth.uid);
      allow delete: if isAcademic();
    }
```

- [ ] **Step 2: เพิ่ม composite index**

ใน `firestore.indexes.json` เพิ่ม object นี้ใน array `"indexes"` (ต่อท้าย index questions สองตัวเดิม ก่อนปิด `]`):

```json
    {
      "collectionGroup": "questionReports",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    }
```

(อย่าลืมใส่ `,` หลัง index ตัวก่อนหน้าให้ JSON ถูกต้อง)

- [ ] **Step 3: ตรวจ JSON valid**

Run: `node -e "JSON.parse(require('fs').readFileSync('firestore.indexes.json','utf8')); console.log('json ok')"`
Expected: `json ok`

- [ ] **Step 4: Deploy rules + indexes**

> ⚠️ rules/indexes มีผลเฉพาะหลัง `firebase deploy` — Pages/Actions ไม่แตะ. index ใหม่อาจใช้เวลา build สักครู่; ระหว่างนั้น query ฝั่ง QuestionsView จะ error จนกว่า index พร้อม

Run: `firebase deploy --only firestore:rules,firestore:indexes`
Expected: `✔ Deploy complete!` (index อาจขึ้นสถานะ Building ในคอนโซลชั่วครู่)

- [ ] **Step 5: Commit**

```bash
git add firestore.rules firestore.indexes.json
git commit -m "Phase5: rules + composite index สำหรับ questionReports"
```

---

## Task 4: QuizView — ปุ่ม 🚩 แจ้งข้อผิด + ส่ง report

**Files:**
- Modify: `src/views/QuizView.vue`

- [ ] **Step 1: เพิ่ม import**

แก้บรรทัด import firestore (line 87) เพิ่ม `setDoc`:

```js
import { collection, getDocs, getDoc, query, where, orderBy, startAt, limit, doc, addDoc, setDoc, increment, serverTimestamp } from 'firebase/firestore'
```

เพิ่ม import ใต้บรรทัด `import { quizSample } ...` (line 92):

```js
import { cleanText, LIMITS } from '../utils/text.js'
import { reportDocId, buildSnapshot } from '../utils/questionReport.js'
```

- [ ] **Step 2: เพิ่ม state ของ report (ใต้ session state block, ~หลัง line 140 `const coinsEarned = ref(0)`)**

```js
// ── แจ้งข้อสอบผิด (Phase 5) ──
const REPORT_REASONS = ['เฉลยผิด', 'โจทย์/ตัวเลือกพิมพ์ผิด', 'โจทย์ไม่ชัด', 'ข้อมูลล้าสมัย', 'อื่นๆ']
const reportOpen = ref(false)
const reportReason = ref('')
const reportNote = ref('')
const reportSending = ref(false)
const reportedIds = ref(new Set())   // กันสแปมในเซสชันเดียว (ข้ามเซสชัน deterministic id ทับเอง)

function resetReport() { reportOpen.value = false; reportReason.value = ''; reportNote.value = '' }

async function sendReport() {
  const q = current.value
  if (reportSending.value || !reportReason.value || !q || !authStore.currentUser) return
  reportSending.value = true
  try {
    usage.track(0, 1)
    await setDoc(doc(db, 'questionReports', reportDocId(q.id, authStore.currentUser.uid)), {
      questionId: q.id,
      reason: reportReason.value,
      note: cleanText(reportNote.value, LIMITS.report),
      reportedBy: authStore.currentUser.uid,
      reportedByName: authStore.userData?.nickname || authStore.userData?.name || null,
      status: 'open',
      verdict: null,
      rewardAmount: 0,
      rewardDelivered: false,
      questionSnapshot: buildSnapshot(q),
      createdAt: serverTimestamp(),
      resolvedAt: null,
    }, { merge: true })
    reportedIds.value.add(q.id)
    resetReport()
    toast('ขอบคุณที่ช่วยแจ้ง! ทีมวิชาการจะตรวจสอบให้', 'success')
  } catch (e) {
    console.error('[question report]', e); toast('ส่งรายงานไม่สำเร็จ', 'error')
  } finally { reportSending.value = false }
}
```

- [ ] **Step 3: รีเซ็ต panel ตอนไปข้อถัดไป**

แก้ฟังก์ชัน `next()` (line 209-212) ให้เคลียร์ report panel ก่อน:

```js
function next() {
  resetReport()
  if (idx.value + 1 < quiz.value.length) { idx.value++; picked.value = null }
  else finish()
}
```

- [ ] **Step 4: เพิ่ม UI ในบล็อก feedback**

ในบล็อก `<div v-if="picked !== null" class="qv-feedback">` แทรก *หลัง* ปุ่ม `<button class="qv-next" ...>` (หลัง line 65) ก่อนปิด `</div>` ของ qv-feedback:

```html
        <!-- 🚩 แจ้งข้อผิด -->
        <div class="qv-report">
          <button v-if="reportedIds.has(current.id)" class="qv-report-btn done" disabled><Emoji char="🚩" /> แจ้งแล้ว ✓</button>
          <button v-else-if="!reportOpen" class="qv-report-btn" @click="reportOpen = true"><Emoji char="🚩" /> แจ้งข้อผิด</button>
          <div v-else class="qv-report-panel">
            <div class="qv-report-chips">
              <button
                v-for="r in REPORT_REASONS" :key="r"
                class="qv-report-chip" :class="{ on: reportReason === r }"
                @click="reportReason = r"
              >{{ r }}</button>
            </div>
            <textarea v-model="reportNote" :maxlength="LIMITS.report" class="qv-report-note" rows="2" placeholder="รายละเอียดเพิ่มเติม (ไม่บังคับ)"></textarea>
            <div class="qv-report-actions">
              <button class="qv-report-cancel" @click="resetReport">ยกเลิก</button>
              <button class="qv-report-send" :disabled="!reportReason || reportSending" @click="sendReport">{{ reportSending ? 'กำลังส่ง…' : 'ส่ง' }}</button>
            </div>
          </div>
        </div>
```

- [ ] **Step 5: เพิ่ม CSS (ใน `<style scoped>` ต่อจาก `.qv-next {...}` line 300)**

```css
.qv-report { margin-top: 12px; }
.qv-report-btn { width: 100%; border: 1px dashed rgba(0,0,0,.2); background: none; border-radius: 10px; padding: 9px; font-family: inherit; font-size: .76rem; font-weight: 700; color: #64748b; cursor: pointer; }
.qv-report-btn.done { color: #15803d; border-color: rgba(34,197,94,.4); cursor: default; }
.qv-report-panel { border: 1px solid var(--border); border-radius: 12px; padding: 10px; }
.qv-report-chips { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 8px; }
.qv-report-chip { border: 2px solid var(--ink); background: #fff; border-radius: 999px; padding: 5px 11px; font-family: inherit; font-size: .7rem; font-weight: 700; color: var(--ink); cursor: pointer; }
.qv-report-chip.on { background: var(--primary); border-color: var(--ink); color: #fff; }
.qv-report-note { width: 100%; box-sizing: border-box; border: 2px solid var(--ink); border-radius: 10px; padding: 8px 10px; font-family: inherit; font-size: .78rem; resize: vertical; }
.qv-report-actions { display: flex; gap: 8px; margin-top: 8px; }
.qv-report-cancel { flex: 0 0 80px; border: 2px solid var(--ink); background: #fff; border-radius: 10px; padding: 8px; font-family: inherit; font-size: .76rem; font-weight: 700; cursor: pointer; }
.qv-report-send { flex: 1; border: none; border-radius: 10px; padding: 8px; font-family: inherit; font-size: .78rem; font-weight: 800; color: #fff; background: var(--primary); cursor: pointer; }
.qv-report-send:disabled { background: #cbd5e1; cursor: default; }
```

- [ ] **Step 6: build ผ่าน**

Run: `npm run build`
Expected: `✓ built in ...`

- [ ] **Step 7: Commit**

```bash
git add src/views/QuizView.vue
git commit -m "Phase5: QuizView ปุ่ม 🚩 แจ้งข้อผิด + panel เหตุผล + setDoc questionReports"
```

---

## Task 5: QuestionsView — section ดูข้อที่ถูกแจ้ง + ปิดรายการ

**Files:**
- Modify: `src/views/QuestionsView.vue`

- [ ] **Step 1: เพิ่ม import**

แก้บรรทัด import firestore (line 171) เพิ่ม `where, limit`:

```js
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, where, orderBy, limit, serverTimestamp, writeBatch, setDoc } from 'firebase/firestore'
```

เพิ่ม import ใต้บรรทัด `import { filterQuestions, ... }` (line 180):

```js
import { groupReports, resolvePayload } from '../utils/questionReport.js'
import { REPORT_REWARD } from '../data/index.js'
```

- [ ] **Step 2: เพิ่ม state + logic (ใต้ `remove()` ก่อนปิด `</script>` ~line 475)**

```js
// ── ข้อที่ถูกแจ้งว่าผิด (Phase 5) ──
const reportsOpen = ref(false)
const reports = ref([])              // open reports (flat)
const reportsLoading = ref(false)
const resolvingId = ref(null)        // questionId ที่กำลังปิด
const reportGroups = computed(() => groupReports(reports.value))

function questionExists(qid) { return list.value.some(x => x.id === qid) }
function reportQuestionText(g) {
  const q = list.value.find(x => x.id === g.questionId)
  return q?.question || g.snapshot?.question || '(ไม่พบโจทย์)'
}
function fmtTime(t) {
  const ms = t?.toMillis ? t.toMillis() : (t?.toDate ? t.toDate().getTime() : new Date(t).getTime())
  if (!ms || Number.isNaN(ms)) return ''
  return new Date(ms).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' })
}

async function loadReports() {
  reportsLoading.value = true
  try {
    const snap = await getDocs(query(
      collection(db, 'questionReports'),
      where('status', '==', 'open'),
      orderBy('createdAt', 'desc'),
      limit(200),
    ))
    usage.track(snap.size)
    reports.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
  } catch (e) { console.error('[reports load]', e); toast('โหลดรายการที่ถูกแจ้งไม่สำเร็จ', 'error') }
  finally { reportsLoading.value = false }
}

function onReportsToggle(e) {
  reportsOpen.value = e.target.open
  if (e.target.open) loadReports()
}

function editReported(g) {
  const q = list.value.find(x => x.id === g.questionId)
  if (q) edit(q)
  else toast('ข้อนี้ถูกลบไปแล้ว — แก้ไขไม่ได้', 'error')
}

async function resolveReports(g, verdict) {
  if (resolvingId.value) return
  resolvingId.value = g.questionId
  try {
    const patch = resolvePayload(verdict, REPORT_REWARD)
    const batch = writeBatch(db)
    for (const r of g.reports) batch.update(doc(db, 'questionReports', r.id), { ...patch, resolvedAt: serverTimestamp() })
    await batch.commit()
    usage.track(0, g.reports.length)
    reports.value = reports.value.filter(r => r.questionId !== g.questionId) // ตัดกลุ่มที่ปิดออก
    toast(verdict === 'valid'
      ? `บันทึกว่าผิดจริง · รางวัล ${REPORT_REWARD} เหรียญ (รอส่งผ่าน Mailbox)`
      : 'ปิดรายการแล้ว (ไม่ผิด)', 'success')
  } catch (e) { console.error('[resolve report]', e); toast('ปิดรายการไม่สำเร็จ', 'error') }
  finally { resolvingId.value = null }
}
```

- [ ] **Step 3: เพิ่ม UI section (ในเทมเพลต แทรกหลัง `</details>` ของ import block, ก่อน `<!-- ── editor ── -->` ~line 55)**

```html
      <!-- ── ข้อที่ถูกแจ้งว่าผิด (questionReports) ── -->
      <details class="qz-reports" @toggle="onReportsToggle">
        <summary class="qz-reports-sum"><Emoji char="🚩" /> ข้อที่ถูกแจ้งว่าผิด<span v-if="reportsOpen"> ({{ reports.length }})</span></summary>
        <div class="qz-reports-body">
          <div v-if="reportsLoading" class="qz-empty">กำลังโหลด…</div>
          <div v-else-if="!reportGroups.length" class="qz-empty">ยังไม่มีข้อที่ถูกแจ้ง <Emoji char="🎉" /></div>
          <div v-else class="qz-report-list">
            <div v-for="g in reportGroups" :key="g.questionId" class="qz-report-card">
              <div class="qz-report-top">
                <span class="qz-report-badge">ถูกแจ้ง {{ g.count }} ครั้ง</span>
                <span v-if="!questionExists(g.questionId)" class="qz-report-deleted">ข้อถูกลบแล้ว</span>
              </div>
              <div class="qz-report-q">{{ reportQuestionText(g) }}</div>
              <ul class="qz-report-reasons">
                <li v-for="r in g.reports" :key="r.id">
                  <b>{{ r.reason }}</b><span v-if="r.note"> — {{ r.note }}</span>
                  <span class="qz-report-meta"> · {{ r.reportedByName || 'ไม่ระบุ' }} · {{ fmtTime(r.createdAt) }}</span>
                </li>
              </ul>
              <div class="qz-report-actions">
                <button class="qz-mini" :disabled="!questionExists(g.questionId)" @click="editReported(g)">แก้ไขข้อนี้</button>
                <button class="qz-mini" :disabled="resolvingId === g.questionId" @click="resolveReports(g, 'valid')">✓ ผิดจริง (ให้รางวัล)</button>
                <button class="qz-mini qz-danger" :disabled="resolvingId === g.questionId" @click="resolveReports(g, 'invalid')">✕ ไม่ผิด</button>
              </div>
            </div>
          </div>
        </div>
      </details>
```

- [ ] **Step 4: เพิ่ม CSS (ใน `<style scoped>` ต่อท้าย ~ก่อน `</style>` line 559)**

```css
.qz-reports { background: #fff; border: 2px dashed #f59e0b; border-radius: 16px; padding: 4px 14px; margin-bottom: 16px; }
.qz-reports[open] { padding-bottom: 14px; }
.qz-reports-sum { cursor: pointer; font-weight: 800; font-size: .9rem; padding: 11px 0; list-style: none; user-select: none; color: #b45309; }
.qz-reports-sum::-webkit-details-marker { display: none; }
.qz-reports-sum::before { content: '▸ '; color: #f59e0b; }
.qz-reports[open] .qz-reports-sum::before { content: '▾ '; }
.qz-reports-body { display: flex; flex-direction: column; gap: 10px; }
.qz-report-list { display: flex; flex-direction: column; gap: 10px; }
.qz-report-card { border: 1px solid rgba(0,0,0,.1); border-radius: 12px; padding: 11px; background: #fffdf7; }
.qz-report-top { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
.qz-report-badge { font-size: .6rem; font-weight: 800; padding: 2px 8px; border-radius: 999px; background: rgba(245,158,11,.16); color: #b45309; }
.qz-report-deleted { font-size: .6rem; font-weight: 800; padding: 2px 8px; border-radius: 999px; background: rgba(239,68,68,.12); color: #dc2626; }
.qz-report-q { font-size: .82rem; font-weight: 700; color: #1e293b; margin-bottom: 7px; line-height: 1.4; }
.qz-report-reasons { list-style: none; margin: 0 0 9px; padding: 0; display: flex; flex-direction: column; gap: 4px; }
.qz-report-reasons li { font-size: .74rem; color: rgba(0,0,0,.7); line-height: 1.4; }
.qz-report-meta { color: rgba(0,0,0,.4); font-size: .68rem; }
.qz-report-actions { display: flex; gap: 6px; flex-wrap: wrap; }
```

- [ ] **Step 5: build ผ่าน**

Run: `npm run build`
Expected: `✓ built in ...`

- [ ] **Step 6: Commit**

```bash
git add src/views/QuestionsView.vue
git commit -m "Phase5: QuestionsView section 🚩 ดูข้อที่ถูกแจ้ง + group + ปิด/ตัดสิน verdict"
```

---

## Task 6: ทดลอง dev + push + verify prod

**Files:** (ไม่มี — งาน verify/deploy)

- [ ] **Step 1: รัน dev ทดลอง flow จริง**

Run: `npm run dev`
ทดลอง (login admin = prawich.aum@dome.tu.ac.th):
- ไป /quiz ทำข้อสอบ → ตอบ → กด 🚩 แจ้งข้อผิด → เลือกชิป + พิมพ์ note → ส่ง → toast ขอบคุณ + ปุ่มเปลี่ยนเป็น "แจ้งแล้ว ✓"
- ไป /questions → กางการ์ด "🚩 ข้อที่ถูกแจ้งว่าผิด" → เห็นกลุ่ม report ที่เพิ่งส่ง
- กด "✓ ผิดจริง" → toast แจ้งรางวัล + การ์ดหายจากลิสต์
- (เปิดใหม่ตรวจว่า report ที่ปิดแล้วไม่โผล่ — query เฉพาะ status==open)

Expected: ทุกขั้นไม่มี error ใน console; emoji 🚩/🎉 เป็นรูป Fluent ไม่ใช่ tofu

- [ ] **Step 2: ตรวจ emoji ไม่ tofu**

ยืนยันว่าไฟล์ Fluent ครบ (มีอยู่แล้ว): `1f6a9.svg` (🚩), `1f389.svg` (🎉)
Run: `ls public/emoji/fluent/ | grep -E "1f6a9|1f389"`
Expected: เห็นทั้งสองไฟล์

- [ ] **Step 3: push deploy frontend**

> rules + indexes deploy ไปแล้วใน Task 3. ขั้นนี้ push frontend ขึ้น GitHub Pages

```bash
git push origin master
```

- [ ] **Step 4: verify prod**

หลัง GitHub Actions build เสร็จ (~1-2 นาที) เปิด `pikar10tu.github.io/rxtu10/` ทดลอง flow เดิมซ้ำบนมือถือ 1 รอบ
Expected: แจ้ง/รีวิว/ปิดได้จริง, ไม่มี error เรื่อง index (ถ้า index ยัง Building ให้รอแล้วลองใหม่)

---

## Self-Review (เช็กกับ spec)

**Spec coverage:**
- ปุ่ม 🚩 ใน QuizView ตอนเฉลย → Task 4 ✅
- แท็บรีวิว 🚩 ใน QuestionsView → Task 5 ✅ (เป็น `<details>` section)
- บันทึก verdict valid/invalid + stamp reward ค้าง → Task 2 (`resolvePayload`) + Task 5 ✅
- rules questionReports → Task 3 ✅
- pure util + test → Task 2 ✅
- deterministic id `${questionId}__${uid}` → `reportDocId` Task 2 ✅
- snapshot answerText (text ไม่ใช่ index) → `buildSnapshot` Task 2 ✅
- re-report = setDoc merge → Task 4 ✅
- REPORT_REWARD ใน data placeholder 50 → Task 1 ✅
- การส่งเหรียญจริง = นอกขอบเขต (Mailbox) → ยืนยัน: Task 5 แค่ stamp ไม่ mint mail ✅
- cost: read reports เฉพาะ academic → rules read=isAcademic + ไม่ auto-load (โหลดตอนกางเท่านั้น) ✅

**Type consistency:** `reportDocId/buildSnapshot/groupReports/resolvePayload` signature ตรงกันทั้ง util (Task 2), QuizView (Task 4), QuestionsView (Task 5). field ของ report doc (questionId, reason, note, reportedBy, reportedByName, status, verdict, rewardAmount, rewardDelivered, questionSnapshot, createdAt, resolvedAt) ตรงกับ spec data model ✅

**เพิ่มเติมจาก spec:** composite index `questionReports (status, createdAt desc)` — spec ไม่ได้ระบุชัด แต่ query `where(status)+orderBy(createdAt)` ต้องมี ไม่งั้น runtime error → เพิ่มใน Task 3
