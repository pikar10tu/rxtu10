# Phase 1 — Quiz Cost (windowed sampling + meta-doc) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** ทำให้หน้าทำข้อสอบ (`QuizView`) อ่าน Firestore เฉพาะข้อที่จะทำจริง (1 meta-doc + N ข้อ) แทนการโหลดข้อที่เผยแพร่ทั้งคลัง — โดยยังเก็บฟีเจอร์เลือกหมวด/จำนวนไว้

**Architecture:** เพิ่ม `config/questionsMeta` (publishedTotal + รายชื่อหมวด) ให้หน้า home เรนเดอร์ได้โดยไม่อ่านทั้งคลัง · เริ่ม quiz ใช้ windowed query `where isPublished==true [+category] orderBy rand startAt(random) limit(N)` + wrap/dedup · ทุกข้อมี field `rand` (สุ่มตอนสร้าง/import + backfill ของเก่า)

**Tech Stack:** Vue 3 (`<script setup>`), Pinia, Firebase Firestore (modular SDK), เทส `node:test`

> **ลำดับสำคัญ (อย่าสลับ):** deploy index → ใส่/backfill `rand` → สลับ QuizView ไป windowed query
> เพราะ `orderBy('rand')` จะ **ไม่คืน** doc ที่ไม่มี field `rand` — ถ้าสลับก่อน backfill ข้อเก่าจะหายจากควิซ

---

## โครงไฟล์ที่แตะ

| ไฟล์ | หน้าที่ | สร้าง/แก้ |
|---|---|---|
| `src/utils/quizSample.js` | pure: รวมผล 2 query → dedup → ตัด N | สร้าง |
| `src/utils/quizSample.test.js` | เทส quizSample | สร้าง |
| `src/utils/questionsMeta.js` | pure: `buildMeta(questions)` → {publishedTotal, categories} | สร้าง |
| `src/utils/questionsMeta.test.js` | เทส buildMeta | สร้าง |
| `firestore.indexes.json` | composite indexes สำหรับ windowed query | สร้าง |
| `firebase.json` | ผูก indexes เข้า config | แก้ |
| `src/views/QuestionsView.vue` | ใส่ `rand` ตอนสร้าง/import · ปุ่ม backfill · เขียน meta (recompute) | แก้ |
| `src/views/QuizView.vue` | home อ่าน meta · start ใช้ windowed query | แก้ |

---

## Task 1: pure util `quizSample` (รวม+dedup+ตัด N)

**Files:**
- Create: `src/utils/quizSample.js`
- Test: `src/utils/quizSample.test.js`

- [ ] **Step 1: เขียนเทสที่ยังไม่ผ่าน**

```js
// เทส quizSample — รวมผล windowed query 2 รอบ → dedup ด้วย id → ตัดให้เหลือ ≤ n
// รัน: node --test src/utils/quizSample.test.js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { quizSample } from './quizSample.js'

const docs = (...ids) => ids.map(id => ({ id, question: 'Q' + id }))

test('first ครบ N แล้ว → คืน N ข้อแรก ไม่แตะ wrap', () => {
  const r = quizSample(docs(1, 2, 3, 4, 5), docs(9), 3)
  assert.equal(r.length, 3)
  assert.deepEqual(r.map(d => d.id), [1, 2, 3])
})

test('first ไม่ครบ → เติมจาก wrap จนครบ N', () => {
  const r = quizSample(docs(1, 2), docs(1, 2, 3, 4), 3)
  assert.equal(r.length, 3)
  assert.deepEqual(r.map(d => d.id), [1, 2, 3]) // 1,2 จาก first; ข้าม 1,2 ซ้ำใน wrap; เติม 3
})

test('dedup: ไม่มี id ซ้ำในผลลัพธ์', () => {
  const r = quizSample(docs(1, 2, 3), docs(1, 2, 3), 5)
  assert.deepEqual(r.map(d => d.id), [1, 2, 3]) // คลังมีจริง 3 ข้อ → คืน 3 ไม่ซ้ำ
})

test('ข้อรวมน้อยกว่า N → คืนเท่าที่มี ไม่ error', () => {
  const r = quizSample(docs(1, 2), docs(1, 2), 15)
  assert.equal(r.length, 2)
})

test('ว่างทั้งคู่ → คืน []', () => {
  assert.deepEqual(quizSample([], [], 15), [])
})
```

- [ ] **Step 2: รันเทสให้เห็นว่า fail**

Run: `node --test src/utils/quizSample.test.js`
Expected: FAIL — `Cannot find module './quizSample.js'`

- [ ] **Step 3: เขียน implementation ขั้นต่ำ**

```js
// quizSample — รวมผล windowed query รอบแรก (first) + รอบ wrap → ตัด id ซ้ำ → เหลือ ≤ n
//  first = ผล where(...).orderBy(rand).startAt(R).limit(n)
//  wrap  = ผล where(...).orderBy(rand).limit(n)  (วนต้นลิสต์ เผื่อ first ชนปลาย)
// pure: รับ array ของ doc ({ id, ... }) ไม่ผูก Firestore
export function quizSample(first, wrap, n) {
  const out = []
  const seen = new Set()
  for (const d of [...first, ...wrap]) {
    if (out.length >= n) break
    if (seen.has(d.id)) continue
    seen.add(d.id)
    out.push(d)
  }
  return out
}
```

- [ ] **Step 4: รันเทสให้ผ่าน**

Run: `node --test src/utils/quizSample.test.js`
Expected: PASS — 5 tests pass

- [ ] **Step 5: commit**

```bash
git add src/utils/quizSample.js src/utils/quizSample.test.js
git commit -m "Quiz: pure quizSample รวม+dedup ผล windowed query (Phase 1)"
```

---

## Task 2: pure util `buildMeta` (สรุป meta จากรายการข้อสอบ)

**Files:**
- Create: `src/utils/questionsMeta.js`
- Test: `src/utils/questionsMeta.test.js`

- [ ] **Step 1: เขียนเทสที่ยังไม่ผ่าน**

```js
// เทส buildMeta — สรุป { publishedTotal, categories } จากรายการข้อสอบ (นับเฉพาะ isPublished)
// รัน: node --test src/utils/questionsMeta.test.js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildMeta } from './questionsMeta.js'

test('นับเฉพาะข้อที่ isPublished', () => {
  const m = buildMeta([
    { isPublished: true, category: 'ยา' },
    { isPublished: false, category: 'ยา' },
    { isPublished: true, category: 'หัวใจ' },
  ])
  assert.equal(m.publishedTotal, 2)
})

test('categories = หมวดไม่ซ้ำของข้อที่เผยแพร่ เรียง ก-ฮ ตัดค่าว่าง', () => {
  const m = buildMeta([
    { isPublished: true, category: 'หัวใจ' },
    { isPublished: true, category: 'ยา' },
    { isPublished: true, category: 'ยา' },
    { isPublished: true, category: '' },
    { isPublished: true },
    { isPublished: false, category: 'ไต' },
  ])
  assert.deepEqual(m.categories, ['ยา', 'หัวใจ'])
})

test('คลังว่าง → publishedTotal 0, categories []', () => {
  assert.deepEqual(buildMeta([]), { publishedTotal: 0, categories: [] })
})
```

- [ ] **Step 2: รันเทสให้เห็นว่า fail**

Run: `node --test src/utils/questionsMeta.test.js`
Expected: FAIL — `Cannot find module './questionsMeta.js'`

- [ ] **Step 3: เขียน implementation ขั้นต่ำ**

```js
// buildMeta — pure: สรุปข้อมูลคลังให้หน้า quiz home ใช้โดยไม่ต้องโหลดทั้งคลัง
//  publishedTotal = จำนวนข้อที่เผยแพร่ · categories = หมวดไม่ซ้ำ (เรียง, ตัดว่าง)
export function buildMeta(questions) {
  const pub = questions.filter(q => q && q.isPublished === true)
  const cats = [...new Set(pub.map(q => (q.category || '').trim()).filter(Boolean))]
  cats.sort((a, b) => a.localeCompare(b, 'th'))
  return { publishedTotal: pub.length, categories: cats }
}
```

- [ ] **Step 4: รันเทสให้ผ่าน**

Run: `node --test src/utils/questionsMeta.test.js`
Expected: PASS — 3 tests pass

- [ ] **Step 5: commit**

```bash
git add src/utils/questionsMeta.js src/utils/questionsMeta.test.js
git commit -m "Quiz: pure buildMeta สรุป publishedTotal+categories (Phase 1)"
```

---

## Task 3: composite indexes + firebase.json

**Files:**
- Create: `firestore.indexes.json`
- Modify: `firebase.json`

- [ ] **Step 1: สร้าง `firestore.indexes.json`**

```json
{
  "indexes": [
    {
      "collectionGroup": "questions",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "isPublished", "order": "ASCENDING" },
        { "fieldPath": "rand", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "questions",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "isPublished", "order": "ASCENDING" },
        { "fieldPath": "category", "order": "ASCENDING" },
        { "fieldPath": "rand", "order": "ASCENDING" }
      ]
    }
  ],
  "fieldOverrides": []
}
```

- [ ] **Step 2: ผูก indexes เข้า `firebase.json`**

แก้บล็อก `"firestore"` (เดิมมีแค่ `"rules"`) เป็น:

```json
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
```

- [ ] **Step 3: deploy index**

Run: `firebase deploy --only firestore:indexes`
Expected: `✔ Deploy complete!` — รอ index ขึ้นสถานะ Enabled ใน Firebase Console > Firestore > Indexes (อาจใช้เวลาสักครู่)

- [ ] **Step 4: commit**

```bash
git add firestore.indexes.json firebase.json
git commit -m "Firestore: composite indexes สำหรับ quiz windowed query (Phase 1)"
```

---

## Task 4: ใส่ `rand` ตอนสร้าง/import + ปุ่ม backfill ข้อเก่า

**Files:**
- Modify: `src/views/QuestionsView.vue`

- [ ] **Step 1: ใส่ `rand` ตอน bulk import**

ใน `runImport` (`src/views/QuestionsView.vue`) บรรทัดที่ set แต่ละ row — เพิ่ม `rand`:

แก้จาก:
```js
        batch.set(doc(col), { ...row, ...meta, createdAt: serverTimestamp() })
```
เป็น:
```js
        batch.set(doc(col), { ...row, ...meta, rand: Math.random(), createdAt: serverTimestamp() })
```

- [ ] **Step 2: ใส่ `rand` ตอนสร้างข้อเดี่ยว**

ใน `save` ที่ branch `addDoc` (สร้างใหม่) — เพิ่ม `rand`:

แก้จาก:
```js
      await addDoc(collection(db, 'questions'), {
        ...payload,
        createdBy: authStore.currentUser?.uid || null,
        createdByName: authStore.userData?.nickname || authStore.userData?.name || null,
        createdAt: serverTimestamp(),
      })
```
เป็น:
```js
      await addDoc(collection(db, 'questions'), {
        ...payload,
        rand: Math.random(),
        createdBy: authStore.currentUser?.uid || null,
        createdByName: authStore.userData?.nickname || authStore.userData?.name || null,
        createdAt: serverTimestamp(),
      })
```

- [ ] **Step 3: เพิ่ม state + ฟังก์ชัน backfill ในบล็อก `<script setup>`**

เพิ่มต่อท้ายบล็อก import functions (เช่นหลัง `runImport`) — เติม `rand` ให้ข้อที่ยังไม่มี:

```js
const backfilling = ref(false)
// เติม rand ให้ข้อเก่าที่ยังไม่มี field (จำเป็นก่อนสลับ quiz ไป windowed query —
// orderBy('rand') จะไม่คืน doc ที่ไม่มี rand)
async function backfillRand() {
  if (backfilling.value) return
  if (!(await confirm('เติมค่า rand ให้ข้อสอบเก่าที่ยังไม่มี? (ทำครั้งเดียวก่อนเปิดควิซแบบใหม่)'))) return
  backfilling.value = true
  try {
    const snap = await getDocs(query(collection(db, 'questions'), orderBy('createdAt', 'desc')))
    const missing = snap.docs.filter(d => typeof d.data().rand !== 'number')
    for (let i = 0; i < missing.length; i += 500) {
      const batch = writeBatch(db)
      for (const d of missing.slice(i, i + 500)) batch.update(d.ref, { rand: Math.random() })
      await batch.commit()
    }
    toast(`เติม rand แล้ว ${missing.length} ข้อ`, 'success')
  } catch (e) {
    console.error('[backfill rand]', e); toast('เติม rand ไม่สำเร็จ', 'error')
  } finally { backfilling.value = false }
}
```

- [ ] **Step 4: เพิ่มปุ่ม backfill ใน template (ในกล่อง import details, ต่อท้ายปุ่มนำเข้า)**

เพิ่มหลังปุ่ม `qz-import-btn`:

```html
          <button class="qz-btn qz-gray qz-import-btn" :disabled="backfilling" @click="backfillRand">
            {{ backfilling ? 'กำลังเติม rand…' : '🔧 เติม rand ให้ข้อเก่า' }}
          </button>
```

- [ ] **Step 5: ตรวจ build ผ่าน**

Run: `npm run build`
Expected: `✓ built` ไม่มี error

- [ ] **Step 6: commit**

```bash
git add src/views/QuestionsView.vue
git commit -m "Questions: ใส่ rand ตอนสร้าง/import + ปุ่ม backfill ข้อเก่า (Phase 1)"
```

---

## Task 5: เขียน meta-doc (recompute) + ปุ่ม admin + อัตโนมัติหลัง import

**Files:**
- Modify: `src/views/QuestionsView.vue`

- [ ] **Step 1: import buildMeta + setDoc**

บนหัวไฟล์ `QuestionsView.vue` แก้บรรทัด import firestore ให้มี `setDoc`:
```js
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, orderBy, serverTimestamp, writeBatch, setDoc } from 'firebase/firestore'
```
และเพิ่ม import util:
```js
import { buildMeta } from '../utils/questionsMeta.js'
```

- [ ] **Step 2: ฟังก์ชัน recompute meta**

เพิ่มในบล็อก `<script setup>` (ใกล้ backfill):

```js
const recomputingMeta = ref(false)
// อ่านทั้งคลังครั้งเดียว (admin เท่านั้น = ถูก) → เขียน config/questionsMeta
// ให้หน้า quiz home ใช้แทนการ getDocs ทั้งคลัง
async function recomputeMeta() {
  if (recomputingMeta.value) return
  recomputingMeta.value = true
  try {
    const snap = await getDocs(collection(db, 'questions'))
    const meta = buildMeta(snap.docs.map(d => d.data()))
    await setDoc(doc(db, 'config', 'questionsMeta'), { ...meta, updatedAt: serverTimestamp() })
    toast(`อัปเดต meta: เผยแพร่ ${meta.publishedTotal} ข้อ, ${meta.categories.length} หมวด`, 'success')
  } catch (e) {
    console.error('[recompute meta]', e); toast('อัปเดต meta ไม่สำเร็จ', 'error')
  } finally { recomputingMeta.value = false }
}
```

- [ ] **Step 3: เรียก recompute อัตโนมัติหลัง import สำเร็จ**

ใน `runImport` หลังบรรทัด `await load()` (ในบล็อก try สำเร็จ) เพิ่ม:
```js
    await recomputeMeta()
```

- [ ] **Step 4: เพิ่มปุ่ม recompute ใน template (ต่อจากปุ่ม backfill)**

```html
          <button class="qz-btn qz-gray qz-import-btn" :disabled="recomputingMeta" @click="recomputeMeta">
            {{ recomputingMeta ? 'กำลังคำนวณ…' : '🔄 คำนวณ meta ใหม่' }}
          </button>
```

- [ ] **Step 5: ตรวจ build + รัน meta ครั้งแรก**

Run: `npm run build`
Expected: `✓ built` ไม่มี error
หลัง deploy: เข้าหน้า Questions กด **🔧 เติม rand** แล้วกด **🔄 คำนวณ meta ใหม่** หนึ่งครั้ง (สร้าง `config/questionsMeta` + เติม rand ให้ข้อเก่า ก่อนสลับ QuizView)

- [ ] **Step 6: commit**

```bash
git add src/views/QuestionsView.vue
git commit -m "Questions: recompute config/questionsMeta + auto หลัง import (Phase 1)"
```

---

## Task 6: QuizView — home อ่าน meta, start ใช้ windowed query

**Files:**
- Modify: `src/views/QuizView.vue`

- [ ] **Step 1: แก้ import firestore + util + const N**

แก้บรรทัด import firestore ให้มีตัวที่ใช้ทำ windowed query:
```js
import { collection, getDocs, getDoc, query, where, orderBy, startAt, limit, doc, addDoc, increment, serverTimestamp } from 'firebase/firestore'
```
เพิ่ม import util:
```js
import { quizSample } from '../utils/quizSample.js'
```
เพิ่ม const ชุดจำนวนข้อ (ใกล้ `DAILY_CAP`):
```js
const LEN_CHOICES = [5, 10, 15, 20]
const DEFAULT_LEN = 15
```

- [ ] **Step 2: แทน `load()` — อ่าน meta-doc แทนทั้งคลัง**

แก้ `load()` และ state `pool` ให้เป็น:
```js
// home: อ่านแค่ config/questionsMeta (1 read) แทนการโหลดข้อทั้งคลัง
const publishedTotal = ref(0)
const metaCategories = ref([])
const loading = ref(true)

async function load() {
  loading.value = true
  try {
    const snap = await getDoc(doc(db, 'config', 'questionsMeta'))
    const m = snap.exists() ? snap.data() : { publishedTotal: 0, categories: [] }
    publishedTotal.value = m.publishedTotal || 0
    metaCategories.value = Array.isArray(m.categories) ? m.categories : []
  } catch (e) {
    console.error('[quiz meta]', e)
    toast('โหลดข้อมูลข้อสอบไม่สำเร็จ', 'error')
  } finally {
    loading.value = false
  }
}
onMounted(() => { if (authStore.isLoggedIn) load() })
```
แล้ว **ลบ** `const pool = ref([])` เดิม (บรรทัด 99) ออก

- [ ] **Step 3: แทน computed ที่อิง pool (categories/filtered/lenChoices/quizCount)**

แทนบล็อก `categories`/`cat`/`filtered`/`len`/`lenChoices`/`watch`/`quizCount` เดิม ด้วย:
```js
const categories = computed(() => ['__all', ...metaCategories.value])
const cat = ref('__all')

const len = ref(DEFAULT_LEN)
const lenChoices = computed(() => LEN_CHOICES)
const quizCount = computed(() => len.value) // ขอ N; ได้จริงอาจน้อยกว่าถ้าคลัง/หมวดมีไม่พอ
```

- [ ] **Step 4: แก้ template home ให้ใช้ค่าจาก meta**

- บรรทัดเงื่อนไขว่าง: `v-else-if="!pool.length"` → `v-else-if="!publishedTotal"`
- บรรทัดนับ: `มีข้อสอบให้ทำ <b>{{ pool.length }}</b> ข้อ` → `มีข้อสอบให้ทำ <b>{{ publishedTotal }}</b> ข้อ`
- ปุ่มจำนวน: เอาตัวเลือก "ทั้งหมด" ออก — แก้ปุ่ม chip จำนวนเป็น:
```html
          <button v-for="n in lenChoices" :key="n" class="qv-chip" :class="{ on: len === n }" @click="len = n">
            {{ n }} ข้อ
          </button>
```
- ปุ่มเริ่ม: `:disabled="!filtered.length"` → `:disabled="!publishedTotal"`

- [ ] **Step 5: แทน `start()` — ดึงข้อด้วย windowed query**

แก้ `start()` เป็น async + ใช้ quizSample:
```js
const starting = ref(false)
async function start() {
  if (starting.value) return
  starting.value = true
  try {
    const R = Math.random()
    const base = [where('isPublished', '==', true)]
    if (cat.value !== '__all') base.push(where('category', '==', cat.value))
    const col = collection(db, 'questions')
    const firstSnap = await getDocs(query(col, ...base, orderBy('rand'), startAt(R), limit(len.value)))
    const first = firstSnap.docs.map(d => ({ id: d.id, ...d.data() }))
    let wrap = []
    if (first.length < len.value) {
      const wrapSnap = await getDocs(query(col, ...base, orderBy('rand'), limit(len.value)))
      wrap = wrapSnap.docs.map(d => ({ id: d.id, ...d.data() }))
    }
    const picked = quizSample(first, wrap, len.value)
      .filter(q => Array.isArray(q.choices) && q.choices.length >= 2)
    quiz.value = shuffle(picked).map(shuffleChoices)
    idx.value = 0; picked2Reset()
    if (quiz.value.length) mode.value = 'quiz'
    else toast('ยังไม่มีข้อสอบในหมวดนี้', 'error')
  } catch (e) {
    console.error('[quiz start]', e); toast('เริ่มข้อสอบไม่สำเร็จ', 'error')
  } finally { starting.value = false }
}
// รีเซ็ต state รอบใหม่ (แยกออกมาเพื่ออ่านง่าย)
function picked2Reset() {
  picked.value = null; correct.value = 0; answered.value = 0; coinsEarned.value = 0
}
```

> หมายเหตุ: ชื่อ `picked2Reset` เลี่ยงชนกับ ref `picked` เดิม — ตั้งใจให้สื่อว่าเป็นการรีเซ็ตรอบ

- [ ] **Step 6: เผื่อปุ่ม start กำลังโหลด (กันกดซ้ำ)**

แก้ปุ่มเริ่มใน template ให้ disable ตอน starting:
```html
        <button class="qv-start" :disabled="!publishedTotal || starting" @click="start">
          {{ starting ? 'กำลังสุ่มข้อ…' : `เริ่มทำข้อสอบ (${quizCount} ข้อ)` }}
        </button>
```

- [ ] **Step 7: ตรวจ build ผ่าน**

Run: `npm run build`
Expected: `✓ built` ไม่มี error (ตรวจว่าไม่มีการอ้าง `pool`/`filtered` ที่ลบไปแล้วหลงเหลือ)

- [ ] **Step 8: commit**

```bash
git add src/views/QuizView.vue
git commit -m "Quiz: home อ่าน meta + start windowed query แทนโหลดทั้งคลัง (Phase 1)"
```

---

## Task 7: Verify ปลายทาง (manual) + deploy

- [ ] **Step 1: รันเทส pure ทั้งหมดผ่าน**

Run: `node --test src/utils/quizSample.test.js src/utils/questionsMeta.test.js`
Expected: PASS ทั้งหมด

- [ ] **Step 2: ลองในเครื่อง (`npm run dev`)** — ตรวจตามนี้:
  - หน้า Quiz: โชว์จำนวนข้อ + chips หมวดถูกต้อง (มาจาก meta)
  - เลือกหมวด + จำนวน → เริ่ม → ได้ข้อตามจำนวน (หรือน้อยกว่าถ้าหมวดมีไม่พอ) ไม่ error
  - คลัง/หมวดที่ข้อ < N → เริ่มได้ ไม่ค้าง
  - ทำจบ → เหรียญ + บันทึก examSessions ทำงานเหมือนเดิม
  - (DevTools > Network) ตอนเข้าหน้า quiz ไม่มีการดึง document จำนวนมาก — แค่ 1 meta; ตอนเริ่มดึง ≤ 2 query

- [ ] **Step 3: ยืนยันลำดับ prod ก่อน deploy frontend**
  - index ขึ้น Enabled แล้ว (Task 3)
  - กด **🔧 เติม rand** + **🔄 คำนวณ meta ใหม่** ในหน้า Questions แล้ว (Task 5 Step 5)

- [ ] **Step 4: deploy**

Run: `git push origin master`
Expected: GitHub Actions build+publish ขึ้น `pikar10tu.github.io/rxtu10/` สำเร็จ

---

## Self-review (ผู้เขียนแผนตรวจแล้ว)
- **ครอบคลุม spec Phase 1:** meta-doc (T2,T5) · windowed query + category + N (T6) · กันข้อไม่ถึง/ว่าง (T1,T6) · indexes (T3) · rand สร้าง/import/backfill (T4) · rules ไม่แตะ (ระบุใน header) ✓
- **ลำดับ index→backfill→switch:** ระบุใน header + T7 Step 3 ✓
- **ชื่อสอดคล้อง:** `quizSample(first, wrap, n)`, `buildMeta(questions)→{publishedTotal,categories}`, `config/questionsMeta` ใช้ตรงกันทุก task ✓
- **เปิด "ทั้งหมด" ออก:** lenChoices = [5,10,15,20] (T6) ตรง spec ✓
