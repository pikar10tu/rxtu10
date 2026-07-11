# ระบบข้อสอบย้อนหลัง — P2 (ฝั่งนักศึกษา) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** ให้นักศึกษาเลือกทำข้อสอบย้อนหลังตาม "ชุด" ในควิซเดิม (ได้เหรียญปกติ) — picker ชุด (จัดเรียงตามปี) สลับกับตัวกรองหมวด, query ด้วย array-contains, meta โหลด 1 read

**Architecture:** ต่อยอด P1 (`examSets: string[]` + `config/examSets` + composable useExamSets ที่มีแล้ว). เพิ่มนับชุดใน `buildMeta` (pure, มี test) → เขียนลง `config/questionsMeta` (recompute เดิม), QuizView โหลด meta (counts) + config/examSets (ปี) มาผสมเป็น picker, `fetchQuestions` เพิ่ม `where('examSets','array-contains', set)`. ตัวกรองชุด **สลับกับ** หมวด (เลือกได้ทีละอย่าง) → ต้องมี composite index ใหม่ตัวเดียว `isPublished+examSets(CONTAINS)+rand`

**Tech Stack:** Vue 3 `<script setup>`, Pinia, Firebase Firestore (client SDK, windowed `orderBy('rand')` query), Vite. Unit test = `node --test` บน pure util (`questionsMeta`)

## Global Constraints

- ภาษา UI = ไทย · commit `Area: อะไร (ทำไม)` ไทยปนอังกฤษ · สีธีม indigo (#4f46e5)
- ปี = **พ.ศ.** ทุกที่ (P1 normalize ไว้แล้ว — P2 แค่แสดง)
- ตัวกรองชุด/หมวด **mutually exclusive** — เลือกชุด = ล้างหมวด, เลือกหมวด = ล้างชุด (เหตุผล: จอมือถือ + ชุดเล็ก×หมวดเหลือน้อยข้อ + คุมจำนวน composite index) · ที่ระดับ query: ถ้ามีชุด → filter ชุดอย่างเดียว ไม่ใส่ domain
- **self-gating:** ซ่อน section "ข้อสอบย้อนหลัง" เมื่อไม่มีชุดที่มีข้อ published (count>0) — ไม่มี config flag แยก
- **composite index ต้อง deploy ก่อน query ทำงาน** — `firebase deploy --only firestore:indexes` + รอ build เสร็จ **ก่อน** push master (ไม่งั้นนักศึกษาเจอ error) · array-contains ใช้ `"arrayConfig": "CONTAINS"` ไม่ใช่ `"order"`
- meta อ่านจาก `config/questionsMeta` (public-read, 1 read) — ห้ามสแกนทั้งคลังฝั่งนักศึกษา
- รัน test: `node --test src/utils/questionsMeta.test.js` · build: `npm run build`

---

### Task 1: `buildMeta` นับชุด (examSets counts) — pure + test

**Files:**
- Modify: `src/utils/questionsMeta.js` (`buildMeta` ~5–14)
- Test: `src/utils/questionsMeta.test.js` (สร้างใหม่ถ้ายังไม่มี)

**Interfaces:**
- Consumes: `DOMAIN_KEYS` (มีอยู่)
- Produces: `buildMeta(questions)` เพิ่ม field `examSets: [{ name, count }]` — นับจากข้อ **published** เท่านั้น, 1 ข้ออยู่หลายชุดนับทุกชุด, เรียงตามชื่อ (th)

- [ ] **Step 1: แก้เทสเดิม + เพิ่มเทส examSets**

> **FIX (fable):** ไฟล์ `src/utils/questionsMeta.test.js` **มีอยู่แล้ว** และมี exact-shape `assert.deepEqual(buildMeta([]), {...})` ที่จะพังเมื่อ buildMeta คืน key `examSets` เพิ่ม — ต้องแก้ assertion เดิมด้วย · import (test/assert/buildMeta/DOMAIN_KEYS) มีครบแล้ว ไม่ต้อง import ซ้ำ

(a) แก้เทส "คลังว่าง" (ปัจจุบัน ~บรรทัด 29–35) เพิ่ม `examSets: []` เข้า expected:
```js
test('คลังว่าง → publishedTotal 0, categories [], domains ครบ 0', () => {
  assert.deepEqual(buildMeta([]), {
    publishedTotal: 0,
    categories: [],
    domains: Object.fromEntries(DOMAIN_KEYS.map(k => [k, 0])),
    examSets: [],
  })
})
```
(b) เพิ่ม 4 เทสท้ายไฟล์ (ใช้ import เดิม + helper `q` ใหม่):
```js
// ── examSets ──
const q = (over = {}) => ({ isPublished: true, question: 'Q', choices: ['a', 'b'], answer: 0, ...over })

test('examSets: นับต่อชื่อชุด จากข้อ published เท่านั้น', () => {
  const m = buildMeta([
    q({ examSets: ['ชุด A'] }),
    q({ examSets: ['ชุด A'] }),
    q({ examSets: ['ชุด A'], isPublished: false }),   // draft ไม่นับ
  ])
  assert.deepEqual(m.examSets, [{ name: 'ชุด A', count: 2 }])
})
test('examSets: 1 ข้ออยู่หลายชุด → นับทุกชุด', () => {
  const m = buildMeta([q({ examSets: ['ชุด A', 'ชุด B'] })])
  assert.deepEqual(
    [...m.examSets].sort((a, b) => a.name.localeCompare(b.name)),
    [{ name: 'ชุด A', count: 1 }, { name: 'ชุด B', count: 1 }],
  )
})
test('examSets: ข้อไม่มีชุด/ไม่ใช่ array → ไม่พัง, ไม่นับ', () => {
  const m = buildMeta([q(), q({ examSets: null }), q({ examSets: [] })])
  assert.deepEqual(m.examSets, [])
})
test('examSets: เรียงตามชื่อ (th)', () => {
  const m = buildMeta([q({ examSets: ['ข'] }), q({ examSets: ['ก'] })])
  assert.deepEqual(m.examSets.map(s => s.name), ['ก', 'ข'])
})
```

- [ ] **Step 2: รันเทสให้เห็นว่า fail**

Run: `node --test src/utils/questionsMeta.test.js`
Expected: FAIL — examSets tests fail (buildMeta ยังไม่คืน field `examSets`)

- [ ] **Step 3: แก้ `buildMeta`**

แทนฟังก์ชัน `buildMeta` ทั้งก้อน (ปัจจุบัน ~5–14):
```js
export function buildMeta(questions) {
  const pub = questions.filter(q => q && q.isPublished === true)
  const cats = [...new Set(pub.map(q => (q.category || '').trim()).filter(Boolean))]
  cats.sort((a, b) => a.localeCompare(b, 'th'))
  const domains = Object.fromEntries(DOMAIN_KEYS.map(k => [k, 0]))
  for (const q of pub) {
    if (q.domain in domains) domains[q.domain]++
  }
  // นับชุดข้อสอบย้อนหลัง (published เท่านั้น) — 1 ข้ออยู่หลายชุดนับทุกชุด
  const examCounts = {}
  for (const q of pub) {
    for (const name of (Array.isArray(q.examSets) ? q.examSets : [])) {
      if (name) examCounts[name] = (examCounts[name] || 0) + 1
    }
  }
  const examSets = Object.entries(examCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => a.name.localeCompare(b.name, 'th'))
  return { publishedTotal: pub.length, categories: cats, domains, examSets }
}
```

- [ ] **Step 4: รันเทสให้ผ่าน**

Run: `node --test src/utils/questionsMeta.test.js`
Expected: PASS ทุก test

- [ ] **Step 5: Commit**

```bash
git add src/utils/questionsMeta.js src/utils/questionsMeta.test.js
git commit -m "Meta: buildMeta นับ examSets ต่อชุด (published) ให้ quiz picker (pure + test)"
```

---

### Task 2: composite index `isPublished + examSets(CONTAINS) + rand`

**Files:**
- Modify: `firestore.indexes.json` (เพิ่ม 1 index เข้า array `indexes`)

**Interfaces:**
- Produces: index รองรับ query `where('isPublished','==',true) + where('examSets','array-contains', set) + orderBy('rand')`

> ⚠️ **ไม่ deploy ใน task นี้** (user คุม deploy) — controller จะ `firebase deploy --only firestore:indexes` ตอนจบ **ก่อน push master** · array field ใช้ `"arrayConfig": "CONTAINS"` ไม่ใช่ `"order"`

- [ ] **Step 1: เพิ่ม index**

ใน `firestore.indexes.json` เพิ่ม object นี้เข้า array `"indexes"` (ต่อจาก index `isPublished+domain+rand` ก่อน block `questionReports`):
```json
    {
      "collectionGroup": "questions",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "isPublished", "order": "ASCENDING" },
        { "fieldPath": "examSets", "arrayConfig": "CONTAINS" },
        { "fieldPath": "rand", "order": "ASCENDING" }
      ]
    },
```
ตรวจ JSON ถูก syntax (comma คั่นถูก, ไม่มี trailing comma เกินก่อน `]`).

- [ ] **Step 2: verify JSON**

Run: `node -e "JSON.parse(require('fs').readFileSync('firestore.indexes.json','utf8')); console.log('json ok')"`
Expected: พิมพ์ `json ok`

- [ ] **Step 3: Commit**

```bash
git add firestore.indexes.json
git commit -m "Index: questions isPublished+examSets(CONTAINS)+rand สำหรับควิซย้อนหลัง — ยังไม่ deploy"
```

---

### Task 3: firestore.rules — ให้ academic เขียน `config/questionsMeta`

**Files:**
- Modify: `firestore.rules` (ต่อจากบล็อก `match /config/examSets` ~133–135)

**Interfaces:**
- Consumes: `canEditQuestions()` (มีอยู่)
- Produces: academic/instructor กด "🔄 คำนวณ meta ใหม่" (recomputeMeta เขียน `config/questionsMeta`) ได้

> **FIX (fable):** `config/questionsMeta` เขียนได้เฉพาะ admin (match `/config/{doc}` = `isAdmin()`), ไม่มี carve-out เหมือน topics/examSets · ปุ่ม recompute โชว์ให้ `isQuestionEditor` ทุกคน แต่ academic ที่ไม่ใช่ admin จะ **permission-denied** (pre-existing hole — runImport→recomputeMeta ก็โดน) · P2 พึ่ง recompute ให้ picker อัปเดต → academic ต้องกดเองได้ · **⚠️ ต้อง deploy rules** (controller ทำตอนจบ)

- [ ] **Step 1: เพิ่มบล็อก rule**

หา (firestore.rules ~133–135):
```
    match /config/examSets {
      allow write: if canEditQuestions();
    }
```
เพิ่มต่อท้าย (ก่อนบล็อก `cheatLogs`):
```
    // ── Questions meta — สรุปคลัง (config/questionsMeta) ให้ quiz home อ่าน 1 read ──
    //  read: public ผ่าน match /config/{doc} · write: วิชาการ/อาจารย์ กด "คำนวณ meta ใหม่"
    //  (recompute จากทั้งคลัง — trust-based, worst case ตัวเลขเพี้ยน ไม่ใช่ data loss)
    match /config/questionsMeta {
      allow write: if canEditQuestions();
    }
```

- [ ] **Step 2: verify + commit (ไม่ deploy — controller deploy ตอนจบ)**

Run: `node -e "const s=require('fs').readFileSync('firestore.rules','utf8'); const o=(s.match(/{/g)||[]).length, c=(s.match(/}/g)||[]).length; console.log('braces', o, c, o===c?'balanced':'UNBALANCED')"`
Expected: `braces N N balanced`

```bash
git add firestore.rules
git commit -m "Rules: อนุญาต academic เขียน config/questionsMeta (กดคำนวณ meta ใหม่) — ยังไม่ deploy"
```

---

### Task 4: QuizView — picker ชุดข้อสอบย้อนหลัง (โหลด/UI/filter/session/zen)

**Files:**
- Modify: `src/views/QuizView.vue` (imports ~146–159, load ~175–189, onMounted ~190–195, state ~197–203, fetchQuestions ~304–319, startZen ~336–350, finish examSessions ~419–429, template info ~20 + chips ~22–28)

**Interfaces:**
- Consumes: `useExamSets` (P1 — `{ sets, loadExamSets }`), `config/questionsMeta.examSets` (Task 1), `where` (มีอยู่)
- Produces: state `examSet` (ชื่อชุดที่เลือก | null), `metaExamSets`, computed `examSetChips`/`activeCount`; query กรองชุด; examSessions เก็บ `examSet`

> mutually exclusive กับ domain · self-gating (section ซ่อนถ้า `examSetChips` ว่าง) · reset ใน startZen

- [ ] **Step 1: import useExamSets**

เพิ่มต่อจาก import กลุ่ม data (~154, หลัง `import { DOMAINS, ... } from '../data/domains.js'`):
```js
import { useExamSets } from '../composables/useExamSets.js'
```

- [ ] **Step 2: state + โหลด config ชุด**

หลังบรรทัด `const dom = ref('__all')` (~197) เพิ่ม:
```js
const examSet = ref(null)                       // ชื่อชุดที่เลือก (null = ไม่เลือก) — สลับกับ dom
const metaExamSets = ref([])                    // [{ name, count }] จาก meta (published)
const { sets: examSetConfig, loadExamSets } = useExamSets()  // ปีของแต่ละชุด (config/examSets)

// ชิปชุด: เฉพาะชุดที่มีข้อ published (count>0) + ผสมปีจาก config · เรียงปีใหม่→เก่า แล้วชื่อ
const examSetChips = computed(() => {
  const yearOf = Object.fromEntries(examSetConfig.value.map(s => [s.name, s.year]))
  return (metaExamSets.value || [])
    .filter(s => s.count > 0)
    .map(s => ({ name: s.name, count: s.count, year: yearOf[s.name] ?? null }))
    .sort((a, b) => (b.year || 0) - (a.year || 0) || a.name.localeCompare(b.name, 'th'))
})
// จำนวนข้อที่ทำได้ตามตัวเลือกปัจจุบัน (ชุดที่เลือก หรือ ทั้งคลัง)
const activeCount = computed(() =>
  examSet.value ? (examSetChips.value.find(s => s.name === examSet.value)?.count || 0) : publishedTotal.value)

// เลือกหมวด → ล้างชุด (mutually exclusive)
function pickDomain(key) { dom.value = key; examSet.value = null }
// เลือกชุด → toggle + ล้างหมวด
function pickExamSet(name) { examSet.value = examSet.value === name ? null : name; if (examSet.value) dom.value = '__all' }
```

- [ ] **Step 3: อ่าน examSets จาก meta ใน load() + โหลด config**

ใน `load()` หลัง `metaDomains.value = m.domains || {}` (~182) เพิ่ม:
```js
    metaExamSets.value = m.examSets || []
```
ใน `onMounted` (~190–195) หลัง `load()` เพิ่ม `loadExamSets()`:
```js
onMounted(() => {
  if (!authStore.isLoggedIn) return
  load()
  loadExamSets()
  if (route.query.mode === 'zen') startZen()
  else if (route.query.view === 'history') openHistory()
})
```

- [ ] **Step 4: fetchQuestions กรองชุด (สลับกับ domain)**

แทน 3 บรรทัดต้น `fetchQuestions` (~305–308, ตั้งแต่ `const base = [...]` ถึงก่อน `const col`):
```js
  const base = [where('isPublished', '==', true)]
  // ชุดย้อนหลังมาก่อน (สลับกับหมวด) — ใช้ composite index isPublished+examSets(CONTAINS)+rand
  if (examSet.value) base.push(where('examSets', 'array-contains', examSet.value))
  else if (dom.value !== '__all') base.push(where('domain', '==', dom.value))
```

- [ ] **Step 5: startZen ล้างตัวกรองชุด**

ใน `startZen()` หลัง `dom.value = '__all'` (~340) เพิ่ม:
```js
  examSet.value = null
```

- [ ] **Step 6: examSessions เก็บชุดที่เลือก**

ใน `finish()` object ของ `addDoc(collection(db, 'examSessions'), {...})` (~419–429) เพิ่มบรรทัดต่อจาก `domain: ...`:
```js
      examSet: examSet.value || null,
```

- [ ] **Step 7: UI — info ตามตัวเลือก + section ชุดย้อนหลัง**

แก้บรรทัด info (~20):
```
        <div class="qv-info">มีข้อสอบให้ทำ <b>{{ activeCount }}</b> ข้อ</div>
```
แก้ปุ่ม pickDomain ในบล็อกหมวด (~22–28) ให้เรียก pickDomain:
```
        <template v-if="domainChips.length">
          <div class="qv-label">หมวด</div>
          <div class="qv-chips">
            <button class="qv-chip" :class="{ on: dom === '__all' && !examSet }" @click="pickDomain('__all')">ทั้งหมด</button>
            <button v-for="d in domainChips" :key="d.key" class="qv-chip" :class="{ on: dom === d.key }" @click="pickDomain(d.key)">{{ d.label }}</button>
          </div>
        </template>

        <template v-if="examSetChips.length">
          <div class="qv-label"><Emoji char="📜" /> ข้อสอบย้อนหลัง</div>
          <div class="qv-chips">
            <button
              v-for="s in examSetChips" :key="s.name"
              class="qv-chip" :class="{ on: examSet === s.name }"
              @click="pickExamSet(s.name)"
            >{{ s.name }}<span v-if="s.year"> · {{ s.year }}</span> ({{ s.count }})</button>
          </div>
        </template>
```

- [ ] **Step 8: ตรวจ build + ทดลอง dev**

Run: `npm run build`
Expected: build สำเร็จ

ทดลอง (dev): หน้า Quiz → ถ้ามีชุดที่มีข้อ published จะเห็นแถว "📜 ข้อสอบย้อนหลัง" · กดชุด → หมวดกลับเป็นทั้งหมด, info โชว์จำนวนของชุด · กดหมวด → ชุดถูกล้าง · (query จริงต้องรอ index deploy — dev ต่อ Firestore prod เดียวกัน ถ้ายังไม่ deploy index จะ error ตอน "เริ่มทำข้อสอบ" ของชุด → controller deploy index ก่อน)

- [ ] **Step 9: Commit**

```bash
git add src/views/QuizView.vue
git commit -m "Quiz: picker ข้อสอบย้อนหลังตามชุด (array-contains, สลับกับหมวด) + เก็บ examSet ใน session"
```

---

### Task 5: เตือน recompute meta หลัง save เดี่ยวที่ติดชุด (ปิด gap)

**Files:**
- Modify: `src/views/QuestionsView.vue` (`save()` toast success — update branch ~708, add branch ~718)

**Interfaces:**
- Produces: หลังบันทึกข้อ **published** ที่มี examSets → toast เตือนให้กด "🔄 คำนวณ meta ใหม่" (import/batch เรียก recompute อยู่แล้ว, save เดี่ยวไม่เรียก — ไม่ auto-recompute เพราะอ่านทั้งคลัง/ครั้ง)

> gap: picker นักศึกษาอ่านจาก meta — ข้อที่เพิ่งติดชุดทีละข้อจะยังไม่ขึ้นจนกด recompute · เตือนเฉพาะ published (ร่างไม่ขึ้น picker อยู่แล้ว)

- [ ] **Step 1: เตือนใน 2 จุด toast ของ save()**

> **FIX (fable):** toast จริงอยู่ ~708 (update) และ ~718 (add) — ไม่ใช่ ~626/~636 (นั่นคือ backfillRand) · anchor ด้วย string ที่ unique · gate เพิ่ม `payload.isPublished` (NIT fable — ร่างไม่ขึ้น picker)

แก้ toast ของ **update branch** (ปัจจุบัน `toast('บันทึกการแก้ไขแล้ว', 'success')`):
```js
      toast(payload.isPublished && payload.examSets.length ? 'บันทึกแล้ว · กด 🔄 คำนวณ meta ใหม่ ให้ชุดขึ้นในควิซ' : 'บันทึกการแก้ไขแล้ว', 'success')
```
และ toast ของ **add branch** (ปัจจุบัน `toast('เพิ่มข้อสอบแล้ว', 'success')`):
```js
      toast(payload.isPublished && payload.examSets.length ? 'เพิ่มข้อสอบแล้ว · กด 🔄 คำนวณ meta ใหม่ ให้ชุดขึ้นในควิซ' : 'เพิ่มข้อสอบแล้ว', 'success')
```
(`payload` อยู่ใน scope ของ save() ทั้งสอง branch แล้ว — ดู P1 Task 5)

- [ ] **Step 2: ตรวจ build**

Run: `npm run build`
Expected: build สำเร็จ

- [ ] **Step 3: Commit**

```bash
git add src/views/QuestionsView.vue
git commit -m "Questions: เตือนกด คำนวณ meta ใหม่ หลัง save ข้อที่ติดชุด (ให้ขึ้นใน quiz picker)"
```

---

## Self-Review (ตรวจ plan เทียบ spec section E)

**Spec E coverage:**
- picker ชุด (จัดตามปี) → Task 4 (examSetChips เรียงปี) ✓
- สลับกับหมวด → Task 4 (pickDomain/pickExamSet + fetchQuestions if/else) ✓
- `where('examSets','array-contains', set)` → Task 4 Step 4 ✓
- composite index → Task 2 (+ deploy ก่อน push) ✓
- buildMeta.examSets + โหลด 1 read → Task 1 + Task 4 (metaExamSets จาก config/questionsMeta) ✓
- ซ่อน section count=0 / empty → Task 4 (examSetChips filter count>0 + v-if) ✓
- examSessions.examSet → Task 4 Step 6 ✓
- startZen reset → Task 4 Step 5 ✓
- ปิด gap recompute → Task 5 (+ Task 3 rules ให้ academic กด recompute ได้จริง) ✓
- "กรองทั้งปี" (array-contains-any) → **ไม่ทำใน P2** (spec ระบุเป็น option) — นักศึกษาเลือกทีละชุด, YAGNI จนกว่าจะขอ

**Placeholder scan:** ไม่มี TBD · ทุก step มีโค้ด ✓

**Type consistency:**
- `metaExamSets` = `[{name, count}]` (จาก buildMeta Task 1) · `examSetChips` = `[{name, count, year}]` · `examSet` = string|null ทุกจุด (fetchQuestions/session/zen/pick) ✓
- `useExamSets()` คืน `{ sets, loadExamSets }` (P1) — Task 3 destructure `sets: examSetConfig` ✓

## Deploy (controller ทำตอนจบ — ต้องได้ consent, ตามลำดับ)
1. `firebase deploy --only firestore:rules,firestore:indexes` → deploy rule `config/questionsMeta` (Task 3) + index array-contains (Task 2) พร้อมกัน · **รอ index build เสร็จ** (เช็ค Firebase console; คลังพันข้อ build เร็ว) — ต้องก่อน push
2. `git push origin master` (Pages deploy) หลัง index build เสร็จ
3. หลัง deploy: กด "🔄 คำนวณ meta ใหม่" ใน /questions 1 ครั้ง เพื่อให้ examSets ขึ้นใน picker (meta เดิมยังไม่มี field examSets)
