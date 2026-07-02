# Review Workflow v2 (ปิดวงจรผลตรวจ + หมวดหมู่) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** ปิดวงจรงานตรวจข้อสอบก่อนเปิดใช้จริง — ผลตรวจไหลกลับถึงคนแก้ข้อ, ลด friction ผู้ตรวจ, กันตรวจข้อ stale, มีทาง "นำออก/นำกลับ" สำหรับข้อไม่ผ่าน + ระบบหมวดหมู่แบบ dropdown ที่วิชาการเพิ่มหัวข้อเองได้ระหว่างตรวจ

**Architecture:** ต่อยอดระบบ peer-review เดิม (query `reviewStatus in [pending,conflict]` + `runTransaction` + `reviewMeta/main`) — เพิ่ม field `retired` บนเอกสารข้อสอบ (แยกจาก `reviewStatus` เพราะสถานะนั้น derive จากตัวนับ), รายชื่อหัวข้อเก็บใน `config/topics` (doc เดียว, public-read ผ่าน rule `config/{doc}` เดิม, write เปิดให้ canEditQuestions), หมวดหมู่ reuse field `category` เดิม (filter/LIMITS เดิมใช้ได้ ค่า free-text เก่ายังแสดงได้จนกว่าจะ re-tag)

**Tech Stack:** Vue 3 SFC + scoped style · Firebase Firestore (rules v2) · เทส pure util ด้วย `node --test`

## Global Constraints (จาก CLAUDE.md)

- ข้อความจากผู้ใช้ทุกช่อง: ผ่าน `cleanText(str, LIMITS.xxx)` จาก `utils/text.js` ก่อนเขียนเสมอ
- แก้ `firestore.rules` แล้วต้อง `firebase deploy --only firestore:rules` เสมอ ไม่งั้นไม่มีผล
- commit รูปแบบ `Area: อะไร (ทำไม)` คอมเมนต์ไทยปนอังกฤษ · ท้าย commit: `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`
- ตรวจงานด้วย `node --test src/utils/<x>.test.js` + `npm run build` (ไม่มี test runner กลาง)
- โทนข้อความผู้ใช้ยึด `docs/voice-guide.md` (เป็นกันเอง อธิบายชัด ไม่หวือหวา)
- **rules ฝั่ง questions มี field guard อยู่แล้ว**: update ที่แตะ review fields ต้องเข้าเงื่อนไข `isReviewSubmit` / `isReviewReset` / `reviewUntouched` / isAdmin — งานใน plan นี้ต้องไม่ทำให้ write path ใดหลุดเงื่อนไข (Task 2 ขยายเงื่อนไขรองรับ)

## Design decisions (ล็อกแล้ว — อย่าเปลี่ยนเองระหว่างทำ)

1. **ข้อไม่ผ่าน มี 2 ทางออก:** (a) แก้เนื้อหา + บันทึก → ผลตรวจถูกล้าง วนกลับเข้าคิวตรวจอัตโนมัติ (กลไก `reviewContentChanged`+`REVIEW_RESET` มีอยู่แล้ว) (b) ปุ่ม "นำออก" → `retired: true` + `isPublished: false` — ไม่เข้าคิวตรวจ นักศึกษาไม่เห็น ไม่ลบทิ้ง นำกลับมาได้ (นำกลับ = ล้างผลตรวจ กลับเข้าคิว)
2. `retired` เป็น field แยก **ห้าม**เพิ่มค่าใหม่ใน `reviewStatus` enum เพราะสถานะนั้นถูกคำนวณทับจากตัวนับตลอด
3. ข้อ retired ยังติด query ของหน้า /review ได้ (ถ้าสถานะ pending/conflict) — กรองที่ client ใน `needsReviewBy` ไม่แก้ query (เลี่ยง composite index + ข้อเก่าไม่มี field)
4. เหตุผลบังคับเฉพาะ verdict "ต้องแก้/ผิด" — "ถูกต้อง" ไม่บังคับ (ลด friction อาสาสมัคร)
5. หมวดหมู่ reuse field `category` (ไม่สร้าง field ใหม่) · รายชื่อหัวข้อใน `config/topics` `{ list: [...] }` · ผู้ตรวจติดแท็กได้ในหน้า /review ตอนส่งผลตรวจ (เขียนไปกับ transaction เดียวกัน)

---

### Task 1: Pure logic — retired + ป้ายสถานะ + VERDICT_LABEL กลาง

**Files:**
- Modify: `src/utils/questionReview.js`
- Test: `src/utils/questionReview.test.js`

**Interfaces:**
- Produces: `needsReviewBy(question, myUid)` เพิ่มกติกา — `question.retired` truthy → `false` เสมอ
- Produces: `reviewStatusKey(question)` → `'retired' | 'pending' | 'passed' | 'conflict' | 'failed'` (retired ทับสถานะคำนวณ)
- Produces: `REVIEW_STATUS_LABEL` map key→ป้ายไทย และ `VERDICT_LABEL = { correct: 'ถูกต้อง', fix: 'ต้องแก้', wrong: 'ผิด' }` (ย้ายมาจาก ReviewView เพื่อให้ QuestionsView ใช้ร่วม — Task 4 จะลบ const ซ้ำใน ReviewView)

- [ ] **Step 1: เขียนเทสที่ fail ก่อน** — เพิ่มท้าย `src/utils/questionReview.test.js` (แก้บรรทัด import ให้รวม `reviewStatusKey, REVIEW_STATUS_LABEL, VERDICT_LABEL`)

```js
// ── retired + reviewStatusKey ──
test('ข้อ retired → ไม่เข้าคิวตรวจ ไม่ว่าสถานะไหน', () => {
  assert.equal(needsReviewBy({ retired: true, reviewedBy: [] }, 'me'), false)
  assert.equal(needsReviewBy({ retired: true, reviewedBy: ['x', 'y'], reviewPass: 1, reviewFail: 1 }, 'me'), false)
})
test('reviewStatusKey: retired ทับสถานะคำนวณ', () => {
  assert.equal(reviewStatusKey({ retired: true, reviewPass: 2, reviewFail: 0 }), 'retired')
  assert.equal(reviewStatusKey({ reviewPass: 1, reviewFail: 1 }), 'conflict')
  assert.equal(reviewStatusKey({}), 'pending')
  assert.equal(reviewStatusKey(null), 'pending')
})
test('label ครบทุก key', () => {
  for (const k of ['pending', 'passed', 'conflict', 'failed', 'retired']) assert.ok(REVIEW_STATUS_LABEL[k])
  for (const k of ['correct', 'fix', 'wrong']) assert.ok(VERDICT_LABEL[k])
})
```

- [ ] **Step 2: รันเทสให้เห็นว่า fail**

Run: `node --test src/utils/questionReview.test.js`
Expected: FAIL (reviewStatusKey is not a function)

- [ ] **Step 3: implement** — ใน `src/utils/questionReview.js`:

(3a) ใน `needsReviewBy` เพิ่มบรรทัดหลัง `if (!myUid || !question) return false`:

```js
  if (question.retired) return false   // นำออกจากการใช้งานแล้ว — ไม่ต้องตรวจ
```

(3b) เพิ่มท้ายไฟล์:

```js
// ป้าย verdict / สถานะตรวจ — ใช้ร่วมหน้า Review + Questions
export const VERDICT_LABEL = { correct: 'ถูกต้อง', fix: 'ต้องแก้', wrong: 'ผิด' }
export const REVIEW_STATUS_LABEL = {
  pending: 'รอตรวจ', passed: 'ผ่านตรวจ', conflict: 'ขัดแย้ง', failed: 'ไม่ผ่าน', retired: 'นำออก',
}

// key ป้ายสถานะของข้อ — 'retired' (นำออก) ทับสถานะที่คำนวณจากตัวนับ
export function reviewStatusKey(question) {
  return question?.retired ? 'retired' : computeStatus(question)
}
```

- [ ] **Step 4: รันเทสให้ผ่านทั้งไฟล์**

Run: `node --test src/utils/questionReview.test.js`
Expected: PASS ทั้งหมด (33 เทส)

- [ ] **Step 5: Commit**

```bash
git add src/utils/questionReview.js src/utils/questionReview.test.js
git commit -m "Review: pure logic retired + reviewStatusKey + label กลาง (รองรับนำข้อออก/ป้ายสถานะในคลัง)"
```

---

### Task 2: Firestore rules — config/topics + ให้ submit ติดแท็ก category ได้

**Files:**
- Modify: `firestore.rules`

**Interfaces:**
- Produces: doc `config/topics` เขียนได้โดย canEditQuestions (อ่าน public ผ่าน `match /config/{doc}` เดิมซึ่ง `allow read: if true`)
- Produces: `isReviewSubmit` ยอมให้ diff แตะ `category` เพิ่มได้ (Task 5 ฝั่ง ReviewView จะส่ง category ไปใน transaction ส่งผลตรวจ)
- หมายเหตุ: ปุ่ม "นำออก" (`retired`+`isPublished`) ไม่ต้องแก้ rules — ไม่ใช่ review key เข้าเงื่อนไข `reviewUntouched` อยู่แล้ว · "นำกลับ" เขียน `REVIEW_RESET` เข้าเงื่อนไข `isReviewReset` อยู่แล้ว

- [ ] **Step 1: แก้ `isReviewSubmit` ใน match /questions/{id}** — เปลี่ยนบรรทัด `hasOnly(reviewKeys())` เป็นใช้ set ที่รวม category (นิยาม function เพิ่มใต้ `reviewKeys()`):

```
      // ชุด key ที่ยอมให้แตะตอน "ส่งผลตรวจ" = review keys + category (ติดแท็กหมวดระหว่างตรวจ)
      function reviewSubmitKeys() {
        return ['reviewedBy', 'reviewPass', 'reviewFail', 'reviewStatus', 'reviewVerdicts', 'category'].toSet();
      }
```

แล้วใน `isReviewSubmit` เปลี่ยน

```
        return request.resource.data.diff(resource.data).affectedKeys().hasOnly(reviewKeys())
```

เป็น

```
        return request.resource.data.diff(resource.data).affectedKeys().hasOnly(reviewSubmitKeys())
```

- [ ] **Step 2: เพิ่ม match สำหรับ config/topics** — วางถัดจากบล็อก `match /config/{doc} { ... }` (บรรทัด ~118):

```
    // ── Topics — รายชื่อหมวด/หัวข้อข้อสอบ (dropdown) ──
    //  read: public ผ่าน match /config/{doc} ด้านบนอยู่แล้ว (นักศึกษาใช้ดู label สถิติในอนาคต)
    //  write: กว้างกว่า config ปกติ — วิชาการ/อาจารย์เพิ่มหัวข้อเองได้ระหว่างตรวจข้อสอบ
    match /config/topics {
      allow write: if canEditQuestions();
    }
```

- [ ] **Step 3: Deploy rules + ตรวจว่าไม่มี syntax error**

Run: `firebase deploy --only firestore:rules`
Expected: `+ firestore: released rules firestore.rules to cloud.firestore` / `Deploy complete!` (ถ้า compile error จะขึ้นก่อน release — ห้ามข้าม)

- [ ] **Step 4: Commit**

```bash
git add firestore.rules
git commit -m "Rules: config/topics ให้วิชาการเพิ่มหัวข้อเอง + submit ตรวจติดแท็ก category ได้ (deploy แล้ว)"
```

---

### Task 3: useTopics composable + TopicSelect component

**Files:**
- Create: `src/composables/useTopics.js`
- Create: `src/components/questions/TopicSelect.vue`

**Interfaces:**
- Consumes: doc `config/topics` `{ list: string[] }` (Task 2 เปิด write แล้ว) · `cleanText`/`LIMITS.category` จาก `utils/text.js`
- Produces: `useTopics()` → `{ topics: Ref<string[]>, loadTopics(): Promise, addTopic(name): Promise<string|null> }` (cache ระดับ module — อ่าน Firestore ครั้งเดียวต่อเซสชัน)
- Produces: `<TopicSelect v-model="..." />` — v-model เป็น `string|null` · ค่าเดิมที่ไม่อยู่ใน list (free-text เก่า) ยังแสดง/เลือกค้างไว้ได้ · มีตัวเลือก "➕ เพิ่มหัวข้อใหม่…" เปิดช่องกรอก+ปุ่มเพิ่ม เขียน list กลางด้วย arrayUnion
- ⚠️ ห้ามพึ่ง class `.qz-input`/`.rv-input` ของ view แม่ — scoped style ของแม่ไม่ทะลุเข้า component ลูก ต้องมี style ของตัวเอง

- [ ] **Step 1: สร้าง `src/composables/useTopics.js`**

```js
// รายชื่อหมวด/หัวข้อข้อสอบ (config/topics.list) — cache ระดับ module อ่านครั้งเดียวต่อเซสชัน
// วิชาการเพิ่มหัวข้อใหม่ได้จาก TopicSelect — เก็บกลางใช้ร่วมหน้า Questions/Review
import { ref } from 'vue'
import { doc, getDoc, setDoc, arrayUnion } from 'firebase/firestore'
import { db } from '../firebase/config.js'
import { useUsageStore } from '../stores/usage.js'
import { cleanText, LIMITS } from '../utils/text.js'

const topics = ref([])
let loaded = false

export function useTopics() {
  const usage = useUsageStore()

  async function loadTopics() {
    if (loaded) return
    loaded = true
    try {
      const snap = await getDoc(doc(db, 'config', 'topics'))
      usage.track(1)
      if (snap.exists()) topics.value = snap.data().list || []
    } catch (e) { console.error('[topics]', e); loaded = false }
  }

  // เพิ่มหัวข้อเข้า list กลาง — คืนชื่อที่ clean แล้ว (null ถ้าว่าง) · ชื่อซ้ำไม่เขียนซ้ำ
  async function addTopic(name) {
    const clean = cleanText(name, LIMITS.category)
    if (!clean) return null
    if (!topics.value.includes(clean)) {
      await setDoc(doc(db, 'config', 'topics'), { list: arrayUnion(clean) }, { merge: true })
      usage.track(0, 1)
      topics.value = [...topics.value, clean]
    }
    return clean
  }

  return { topics, loadTopics, addTopic }
}
```

- [ ] **Step 2: สร้าง `src/components/questions/TopicSelect.vue`**

```vue
<template>
  <div>
    <select class="ts-input" :value="modelValue || ''" @change="onSelect">
      <option value="">— ไม่ระบุหมวด —</option>
      <!-- ค่าเดิมที่ไม่อยู่ใน list (ข้อเก่าพิมพ์อิสระ) ยังแสดง/คงค่าได้ -->
      <option v-if="modelValue && !topics.includes(modelValue)" :value="modelValue">{{ modelValue }}</option>
      <option v-for="t in topics" :key="t" :value="t">{{ t }}</option>
      <option value="__add">➕ เพิ่มหัวข้อใหม่…</option>
    </select>
    <div v-if="adding" class="ts-add">
      <input v-model="newName" :maxlength="LIMITS.category" class="ts-input" placeholder="ชื่อหัวข้อใหม่ เช่น ยาปฏิชีวนะ" @keydown.enter.prevent="confirmAdd" />
      <button type="button" class="ts-btn" :disabled="busy || !newName.trim()" @click="confirmAdd">เพิ่ม</button>
      <button type="button" class="ts-btn ts-cancel" @click="adding = false; newName = ''">ยกเลิก</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useTopics } from '../../composables/useTopics.js'
import { useToast } from '../../composables/useToast.js'
import { LIMITS } from '../../utils/text.js'

const props = defineProps({ modelValue: { type: String, default: '' } })
const emit = defineEmits(['update:modelValue'])
const { topics, loadTopics, addTopic } = useTopics()
const { toast } = useToast()
const adding = ref(false)
const newName = ref('')
const busy = ref(false)

onMounted(loadTopics)

function onSelect(e) {
  const v = e.target.value
  if (v === '__add') {
    adding.value = true
    e.target.value = props.modelValue || ''   // ไม่ให้ "__add" ค้างเป็นค่าใน select
    return
  }
  emit('update:modelValue', v || null)
}

async function confirmAdd() {
  if (busy.value) return
  busy.value = true
  try {
    const name = await addTopic(newName.value)
    if (name) { emit('update:modelValue', name); adding.value = false; newName.value = '' }
  } catch (e) { console.error('[topic add]', e); toast('เพิ่มหัวข้อไม่สำเร็จ', 'error') }
  finally { busy.value = false }
}
</script>

<style scoped>
.ts-input { width: 100%; box-sizing: border-box; border: 2px solid var(--ink); border-radius: 10px; padding: 9px 11px; font-family: inherit; font-size: .82rem; background: #fff; }
.ts-input:focus { outline: none; box-shadow: var(--pop); }
.ts-add { display: flex; gap: 6px; margin-top: 6px; }
.ts-add .ts-input { flex: 1; }
.ts-btn { flex-shrink: 0; border: 2px solid var(--ink); border-radius: 9px; padding: 6px 12px; font-family: inherit; font-size: .75rem; font-weight: 800; background: var(--primary); color: #fff; cursor: pointer; }
.ts-btn:disabled { background: #cbd5e1; cursor: default; }
.ts-cancel { background: #fff; color: var(--ink); }
</style>
```

- [ ] **Step 3: ตรวจด้วย build**

Run: `npm run build`
Expected: `✓ built in ...s` ไม่มี error

- [ ] **Step 4: Commit**

```bash
git add src/composables/useTopics.js src/components/questions/TopicSelect.vue
git commit -m "Topics: composable + TopicSelect dropdown (list กลาง config/topics วิชาการเพิ่มเองได้)"
```

---

### Task 4: ReviewView — ผ่อนเหตุผล + confirm + qhash guard + ติดแท็กหมวดระหว่างตรวจ

**Files:**
- Modify: `src/views/ReviewView.vue`

**Interfaces:**
- Consumes: `VERDICT_LABEL` จาก `utils/questionReview.js` (Task 1) · `TopicSelect` (Task 3) · rules ยอม category ใน submit (Task 2) · `useConfirm` จาก `composables/useConfirm.js` (แพทเทิร์นเดียวกับ QuestionsView: `const { confirm } = useConfirm()` แล้ว `await confirm('ข้อความ')` คืน boolean)

- [ ] **Step 1: imports + state**

- ลบ const ซ้ำ: `const VERDICT_LABEL = { correct: 'ถูกต้อง', fix: 'ต้องแก้', wrong: 'ผิด' }` แล้ว import แทน — แก้บรรทัด import questionReview เป็น:

```js
import { computeStatus, nextReviewQueue, buildLeaderboard, VERDICT_LABEL } from '../utils/questionReview.js'
```

- เพิ่ม import:

```js
import TopicSelect from '../components/questions/TopicSelect.vue'
import { useConfirm } from '../composables/useConfirm.js'
```

- ใต้ `const { toast } = useToast()` เพิ่ม:

```js
const { confirm } = useConfirm()
```

- ใต้ `const priorReviews = ref([])` เพิ่ม:

```js
const topic = ref(null)   // แท็กหมวดของข้อปัจจุบัน (ตั้งต้นจาก category เดิม แก้ได้ระหว่างตรวจ)
```

- [ ] **Step 2: เหตุผลบังคับเฉพาะ "ต้องแก้/ผิด"** — เปลี่ยน `canSubmit`:

```js
// เหตุผลบังคับเฉพาะ verdict ที่ไม่ผ่าน — "ถูกต้อง" ไม่ต้องพิมพ์ (ลด friction กันเหตุผลขยะ)
const canSubmit = computed(() => !!verdict.value && (verdict.value === 'correct' || !!reason.value.trim()))
```

และใน template เปลี่ยน label เหตุผล:

```html
<label class="rv-label">เหตุผล (บังคับเมื่อ "ต้องแก้ / ผิด")</label>
```

- [ ] **Step 3: reset topic ใน watch(current)** — บรรทัดแรกของ watch เปลี่ยนเป็น:

```js
  verdict.value = null; reason.value = ''; refText.value = ''; priorReviews.value = []
  topic.value = q?.category || null
```

- [ ] **Step 4: template — dropdown หมวดในฟอร์มตรวจ** — แทรกเหนือ `<label class="rv-label">เหตุผล...` :

```html
          <label class="rv-label">หมวด / หัวข้อ (ติดแท็กระหว่างตรวจ — ใช้ทำสถิติรายหัวข้อ)</label>
          <TopicSelect v-model="topic" />
```

- [ ] **Step 5: submit() — confirm + qhash guard + เขียน category**

(5a) ต้น submit หลัง guard เดิม `if (!canSubmit.value || ...) return` เพิ่ม (ก่อน `submitting.value = true`):

```js
  const lbl = VERDICT_LABEL[verdict.value] || verdict.value
  if (!(await confirm(`ยืนยันส่งผลตรวจ: "${lbl}"?\nส่งแล้วแก้เองไม่ได้ — ถ้ากดพลาดให้แจ้งแอดมินล้างผลตรวจ`))) return
```

(5b) ใน transaction หลัง `const cur = snap.data()` เพิ่ม guard เนื้อหา stale:

```js
      // ข้อถูกแก้เนื้อหาไประหว่างเราดูอยู่ (qhash เปลี่ยน) — verdict เราตัดสินจากเวอร์ชันเก่า ห้ามนับ
      if ((cur.qhash || null) !== (q.qhash || null)) throw new Error('__stale')
```

(5c) เปลี่ยน `tx.update(qRef, {...})` ให้ติดแท็ก category เมื่อผู้ตรวจตั้ง/เปลี่ยนค่า:

```js
      const qPatch = {
        reviewedBy: arrayUnion(uid),
        reviewPass: newPass,
        reviewFail: newFail,
        reviewStatus: newStatus,
        reviewVerdicts: deleteField(),   // ล้าง map โครงเก่า (ถ้ามี)
      }
      if (topic.value && topic.value !== (cur.category || null)) qPatch.category = topic.value
      tx.update(qRef, qPatch)
```

(5d) ใน catch ของ submit ดัก stale ก่อน error ทั่วไป:

```js
  } catch (e) {
    if (e.message === '__stale') {
      toast('ข้อนี้เพิ่งถูกแก้เนื้อหา — โหลดคิวใหม่ให้แล้ว', 'error')
      load()
    } else { console.error('[review submit]', e); toast('ส่งไม่สำเร็จ', 'error') }
  } finally { submitting.value = false }
```

(5e) local update หลัง txn: ใน `list.value[idx] = { ...q, reviewedBy: ..., ...patch }` เพิ่ม category ใน patch เมื่อไม่ already:

```js
      const patch = already ? {} : { reviewPass: newPass, reviewFail: newFail, reviewStatus: newStatus, ...(topic.value ? { category: topic.value } : {}) }
```

- [ ] **Step 6: กันข้อ retired ในตัวนับขัดแย้ง** — ใน `summary` computed เปลี่ยนบรรทัด conflicts:

```js
  conflicts: list.value.filter(q => !q.retired && computeStatus(q) === 'conflict').length,
```

(คิว remaining ไม่ต้องแก้ — `needsReviewBy` กรอง retired จาก Task 1 แล้ว)

- [ ] **Step 7: build ตรวจ**

Run: `npm run build`
Expected: `✓ built in ...s`

- [ ] **Step 8: Commit**

```bash
git add src/views/ReviewView.vue
git commit -m "Review: เหตุผล optional เมื่อถูกต้อง + confirm กันกดพลาด + qhash guard กันตรวจข้อ stale + ติดแท็กหมวดระหว่างตรวจ"
```

---

### Task 5: QuestionsView — ป้าย/กรองสถานะตรวจ + เหตุผลผู้ตรวจในฟอร์มแก้ + นำออก/นำกลับ + dropdown หมวด

**Files:**
- Modify: `src/views/QuestionsView.vue`

**Interfaces:**
- Consumes: `reviewStatusKey`, `REVIEW_STATUS_LABEL`, `VERDICT_LABEL` (Task 1) · `TopicSelect` (Task 3) · มีอยู่แล้วในไฟล์: `reviewContentChanged`, `REVIEW_RESET`, `deleteField`, `confirm`, `usage`, `resetReviewState`
- Produces: ผู้ใช้เห็นสถานะตรวจทุกข้อในคลัง + อ่านเหตุผลผู้ตรวจได้ตอนแก้ข้อ + ปุ่มนำออก/นำกลับ

- [ ] **Step 1: imports** — แก้บรรทัด import questionReview เป็น:

```js
import { reviewContentChanged, REVIEW_RESET, reviewStatusKey, REVIEW_STATUS_LABEL, VERDICT_LABEL } from '../utils/questionReview.js'
```

เพิ่ม:

```js
import TopicSelect from '../components/questions/TopicSelect.vue'
```

- [ ] **Step 2: ช่องหมวดในฟอร์ม → dropdown** — แทนที่บรรทัด ~130:

```html
        <label class="qz-label">หมวด / กลุ่มเนื้อหา</label>
        <input v-model="draft.category" :maxlength="LIMITS.category" class="qz-input" placeholder="เช่น ยาปฏิชีวนะ, ระบบหัวใจ, เภสัชจลนศาสตร์…" />
```

ด้วย:

```html
        <label class="qz-label">หมวด / กลุ่มเนื้อหา</label>
        <TopicSelect v-model="draft.category" />
```

(`save()` เดิมผ่าน `cleanText(d.category, LIMITS.category) || null` อยู่แล้ว — null ปลอดภัย ไม่ต้องแก้)

- [ ] **Step 3: ป้ายสถานะตรวจบนการ์ด** — ในแถวการ์ด (บรรทัด ~223) ถัดจาก `<span class="qz-badge" :class="q.isPublished ? 'pub' : 'draft'">…</span>` เพิ่ม:

```html
            <span class="qz-badge rv" :class="reviewStatusKey(q)">{{ REVIEW_STATUS_LABEL[reviewStatusKey(q)] }}</span>
```

และเพิ่ม style ใต้ `.qz-badge.draft { ... }`:

```css
.qz-badge.rv.pending { background: #eef2ff; color: #4f46e5; }
.qz-badge.rv.passed { background: rgba(34,197,94,.15); color: #15803d; }
.qz-badge.rv.conflict { background: #fff7ed; color: #c2410c; }
.qz-badge.rv.failed { background: #fef2f2; color: #b91c1c; }
.qz-badge.rv.retired { background: rgba(0,0,0,.12); color: rgba(0,0,0,.55); }
```

- [ ] **Step 4: ตัวกรองสถานะตรวจ** — เพิ่ม state `const reviewFilter = ref('')` แล้วหาแถวตัวกรอง (บริเวณที่ใช้ `distinctCategories` / ใต้ `.qz-overview`) เพิ่ม select ต่อท้ายตัวกรองเดิม:

```html
        <select v-model="reviewFilter" class="qz-input qz-filter-rv">
          <option value="">สถานะตรวจ: ทั้งหมด</option>
          <option value="pending">รอตรวจ</option>
          <option value="passed">ผ่านตรวจ</option>
          <option value="conflict">ขัดแย้ง</option>
          <option value="failed">ไม่ผ่าน</option>
          <option value="retired">นำออก</option>
        </select>
```

แล้วแทรกชั้นกรองใน computed ที่ป้อน `visible` (ดู chain เดิม `filtered` → pagination): ครอบผล `filterQuestions(...)` เดิมด้วย

```js
  const base = /* ผลกรองเดิม */
  return reviewFilter.value ? base.filter(q => reviewStatusKey(q) === reviewFilter.value) : base
```

style: `.qz-filter-rv { margin-top: 6px; }` (ปรับตาม layout แถวกรองจริง — ให้กลืนกับ select กรองเดิม)

- [ ] **Step 5: แผงเหตุผลผู้ตรวจในฟอร์มแก้ข้อ**

(5a) state + loader (วางใกล้ `function edit(q)` บรรทัด ~613):

```js
// รีวิวของข้อที่กำลังแก้ — โชว์เหตุผลผู้ตรวจให้คนแก้เห็น (วงจร ตรวจ→รู้ผล→แก้ ครบรอบ)
const editReviews = ref([])
async function loadEditReviews(q) {
  editReviews.value = []
  if (!q.reviewedBy?.length) return
  try {
    const snap = await getDocs(collection(db, 'questions', q.id, 'reviews'))
    usage.track(snap.size)
    // เฉพาะรีวิวรอบปัจจุบัน (กรองด้วย reviewedBy — subdoc รอบก่อน reset อาจค้าง)
    editReviews.value = snap.docs.filter(d => (q.reviewedBy || []).includes(d.id)).map(d => ({ id: d.id, ...d.data() }))
  } catch (e) { console.error('[edit reviews]', e) }
}
```

(5b) ใน `edit(q)` เรียก `loadEditReviews(q)` (ไม่ต้อง await) และใน `resetDraft()` เพิ่ม `editReviews.value = []`

(5c) template — แทรกในฟอร์ม เหนือ `<div class="qz-actions">`:

```html
        <div v-if="draft.id && editReviews.length" class="qz-reviews">
          <div class="qz-reviews-head"><Emoji char="🔍" /> ผลตรวจจากทีมวิชาการ ({{ editReviews.length }})</div>
          <div v-for="r in editReviews" :key="r.id" class="qz-review">
            <b>{{ r.reviewerName || 'ไม่ระบุ' }}</b> — {{ VERDICT_LABEL[r.verdict] || r.verdict }}
            <div v-if="r.reason" class="qz-review-reason">{{ r.reason }}</div>
            <div v-if="r.ref" class="qz-review-ref">เรฟ: {{ r.ref }}</div>
          </div>
          <div class="qz-reviews-hint">แก้โจทย์/ตัวเลือก/เฉลย/คำอธิบายแล้วบันทึก → ผลตรวจถูกล้าง ข้อกลับเข้าคิวตรวจใหม่อัตโนมัติ</div>
        </div>
```

(5d) style:

```css
.qz-reviews { margin: 10px 0; border: 1px dashed var(--border); border-radius: 10px; padding: 10px 12px; background: #fffdf7; }
.qz-reviews-head { font-size: .72rem; font-weight: 800; color: #c2410c; margin-bottom: 6px; }
.qz-review { font-size: .78rem; margin-bottom: 7px; }
.qz-review-reason { color: rgba(0,0,0,.7); white-space: pre-wrap; overflow-wrap: anywhere; }
.qz-review-ref { font-size: .68rem; color: rgba(0,0,0,.45); overflow-wrap: anywhere; }
.qz-reviews-hint { font-size: .68rem; color: rgba(0,0,0,.5); margin-top: 4px; }
```

- [ ] **Step 6: ปุ่มนำออก / นำกลับ** — ใต้ปุ่ม "ล้างผลตรวจ" เดิม (ปุ่ม `resetReviewState`) เพิ่ม:

```html
        <button v-if="draft.id && !isDraftRetired" class="qz-mini" style="margin-top:8px" @click="retireQuestion">
          🗑️ นำออกจากการใช้งาน (ไม่ลบ — เก็บไว้ นำกลับมาได้)
        </button>
        <button v-if="draft.id && isDraftRetired" class="qz-mini" style="margin-top:8px" @click="unretireQuestion">
          ↩️ นำกลับมาใช้ (กลับเข้าคิวตรวจใหม่)
        </button>
```

หมายเหตุ: ปุ่มนำออก/นำกลับเป็นของ canEditQuestions ทุกคน (การตัดสิน disposition เป็นงานวิชาการ ไม่ใช่เฉพาะแอดมิน — ต่างจาก "ล้างผลตรวจ" ที่ยังเป็น admin-only)

script:

```js
const isDraftRetired = computed(() => {
  const q = list.value.find(x => x.id === draft.value.id)
  return !!q?.retired
})

// นำออก = ปลดระวาง: ถอนเผยแพร่ + ไม่เข้าคิวตรวจ (needsReviewBy กรอง retired) — ไม่ลบ ไม่แตะผลตรวจเดิม
async function retireQuestion() {
  const id = draft.value.id
  if (!id || !(await confirm('นำข้อนี้ออกจากการใช้งาน? (ถอนเผยแพร่ + ไม่เข้าคิวตรวจ — นำกลับมาได้ทีหลัง)'))) return
  try {
    await updateDoc(doc(db, 'questions', id), { retired: true, isPublished: false, updatedAt: serverTimestamp() })
    usage.track(0, 1)
    const idx = list.value.findIndex(q => q.id === id)
    if (idx >= 0) list.value[idx] = { ...list.value[idx], retired: true, isPublished: false }
    toast('นำออกแล้ว — นำกลับมาได้จากปุ่มเดิม', 'success')
  } catch (e) { console.error('[retire]', e); toast('ทำไม่สำเร็จ', 'error') }
}

// นำกลับ = ล้างผลตรวจกลับเข้าคิว (ยังเป็นร่าง — ให้ทีมตรวจก่อนค่อยเผยแพร่เอง)
async function unretireQuestion() {
  const id = draft.value.id
  if (!id || !(await confirm('นำข้อนี้กลับมาใช้? (ล้างผลตรวจเดิม กลับเข้าคิวตรวจใหม่ — ยังเป็นร่างจนกว่าจะเผยแพร่)'))) return
  try {
    await updateDoc(doc(db, 'questions', id), { retired: deleteField(), ...REVIEW_RESET, reviewVerdicts: deleteField(), updatedAt: serverTimestamp() })
    usage.track(0, 1)
    const idx = list.value.findIndex(q => q.id === id)
    if (idx >= 0) list.value[idx] = { ...list.value[idx], retired: false, ...REVIEW_RESET }
    toast('นำกลับมาแล้ว — ข้อนี้เข้าคิวตรวจใหม่', 'success')
  } catch (e) { console.error('[unretire]', e); toast('ทำไม่สำเร็จ', 'error') }
}
```

- [ ] **Step 7: save() ล้าง retired เมื่อแก้เนื้อหา** — ในบล็อก reset ที่มีอยู่ใน `save()` เปลี่ยน:

```js
      if (reviewContentChanged(before, payload)) {
        Object.assign(payload, REVIEW_RESET, { reviewVerdicts: deleteField() })
      }
```

เป็น:

```js
      if (reviewContentChanged(before, payload)) {
        // แก้เนื้อหา = ตั้งใจนำกลับมาใช้ — ล้างทั้งผลตรวจและสถานะนำออก ให้วนเข้าคิวตรวจใหม่
        Object.assign(payload, REVIEW_RESET, { reviewVerdicts: deleteField(), retired: deleteField() })
      }
```

- [ ] **Step 8: build + เทสรวม**

Run: `node --test src/utils/questionReview.test.js` → PASS ทั้งหมด
Run: `npm run build` → `✓ built in ...s`

- [ ] **Step 9: Commit + push (deploy)**

```bash
git add src/views/QuestionsView.vue
git commit -m "Questions: ป้าย+กรองสถานะตรวจ + เหตุผลผู้ตรวจในฟอร์มแก้ + ปุ่มนำออก/นำกลับ + dropdown หมวด (ปิดวงจร ตรวจ→รู้ผล→แก้/นำออก)"
git push origin master
```

---

### Task 6: Manual verification (จอจริง — ทำโดย user/ผู้รัน หลัง Pages deploy)

- [ ] แอดมินกด "🔄 ซิงก์ระบบตรวจ" ใน Admin (ถ้ายังไม่เคยกดหลัง deploy รอบก่อน)
- [ ] /review: ตรวจข้อ verdict "ถูกต้อง" โดยไม่กรอกเหตุผล → ส่งได้ · verdict "ผิด" ไม่กรอกเหตุผล → ปุ่มส่ง disabled
- [ ] /review: กดส่ง → มีกล่องยืนยัน verdict ก่อนส่งจริง
- [ ] /review: เลือกหมวดจาก dropdown + ลอง "➕ เพิ่มหัวข้อใหม่…" → หัวข้อโผล่ใน list ทั้งหน้า /review และฟอร์ม /questions
- [ ] /questions: ข้อที่ไม่ผ่าน → เปิดแก้ → เห็นเหตุผลผู้ตรวจ → แก้โจทย์แล้วบันทึก → ป้ายกลับเป็น "รอตรวจ" และโผล่ในคิว /review อีกครั้ง
- [ ] /questions: กด "นำออก" → ป้าย "นำออก" + หายจากคิว /review + นักศึกษาไม่เห็นใน Quiz → กด "นำกลับมาใช้" → กลับเข้าคิว
- [ ] กรองสถานะตรวจในคลังทำงานครบ 5 ค่า

---

## Self-review notes (ผ่านแล้ว)

- ทุก write path ใหม่เทียบกับ rules guard แล้ว: retire/unretire → `reviewUntouched`/`isReviewReset` · submit+category → `reviewSubmitKeys` (Task 2) · เพิ่ม topic → match `config/topics`
- `reviewStatusKey`/`REVIEW_STATUS_LABEL`/`VERDICT_LABEL` นิยามใน Task 1 — Task 4/5 import ชื่อตรงกัน
- TopicSelect ไม่พึ่ง scoped class ของ view แม่ (มี `.ts-input` เอง)
- ข้อ retired: กรองที่ `needsReviewBy` (client) — query /review ไม่แก้ ไม่ต้องมี composite index
