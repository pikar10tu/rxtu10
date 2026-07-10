# ระบบข้อสอบย้อนหลัง — P1 (แกนหลัก) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** ให้ทีมวิชาการติดป้าย "ชุดข้อสอบย้อนหลัง" ให้ข้อสอบ (1 ข้อหลายชุดได้), นำเข้า/รวมแท็กจาก JSON, batch-tag ข้อเก่า, และดูประวัติ (ใครเพิ่ม/ใครตรวจ) แบบ read-only

**Architecture:** เพิ่ม field `examSets: string[]` บน `questions/{id}` + รายการชุดกลางที่ `config/examSets` (`{list:[{name,year}]}`). Pure logic (normalize ปี, dedup ชุด, วางแผน merge-tag ตอน import) แยกเป็น util มี unit test; ส่วน Vue (composable/component/view) verify ด้วย `npm run build` + ทดลอง dev ตาม convention โปรเจกต์ (ไม่มี test runner กลาง). การติดป้ายเป็น additive — ไม่แตะ flow ควิซ/ตรวจเดิม

**Tech Stack:** Vue 3 (SFC + scoped style, Composition API `<script setup>`), Pinia, Firebase Firestore (client SDK), Vite. Unit test = `node --test` บน pure utils เท่านั้น

## Global Constraints

- ภาษา UI = ไทย · คอมเมนต์/commit ไทยปนอังกฤษ · commit รูปแบบ `Area: อะไร (ทำไม)`
- ข้อความผู้ใช้ทุกช่องผ่าน `cleanText(str, LIMITS.xxx)` จาก `utils/text.js` ก่อนเขียนเสมอ
- เขียน user doc ผ่าน `auth.patchUser` เท่านั้น (งานนี้ไม่แตะ user doc — ไม่เกี่ยว)
- overlay/modal `position:fixed` ใต้ `<RouterView>` ต้อง `<Teleport to="body">` (งานนี้ไม่มี overlay ใหม่)
- แก้ `firestore.rules` ต้อง `firebase deploy --only firestore:rules` เสมอ (ไม่งั้นไม่มีผล)
- ปี = **พ.ศ.** ทุกที่ · normalize ค.ศ.→พ.ศ. (`year < 2400 → +543`) · ช่วงที่ยอมรับ 2500–2600
- ชื่อชุดใน`questions.examSets[]` ต้องมาจาก `config/examSets` เท่านั้น (กัน fragmentation)
- แก้ tag = metadata → **ห้าม**ทำให้ผลตรวจถูกล้าง (อย่าเอา examSets ไปยัดใน `reviewContentChanged` key)
- รัน test: `node --test src/utils/<x>.test.js` · build ตรวจ: `npm run build`

---

### Task 1: Pure util — normalize ปี + dedup/validate ชุด (`examSets.js`)

**Files:**
- Create: `src/utils/examSets.js`
- Test: `src/utils/examSets.test.js`

**Interfaces:**
- Consumes: `cleanText, LIMITS` จาก `./text.js`
- Produces:
  - `normalizeExamYear(y) → number | null` — coerce int, ค.ศ.→พ.ศ., ตกช่วง 2500–2600 = null
  - `upsertExamSet(list, name, year) → { list, entry } | null` — dedup by name (มีอยู่แล้ว = อัปเดตปี), name ผ่าน cleanText, ปีผ่าน normalizeExamYear; ชื่อว่าง = null
  - `keepKnownSets(sets, knownNames) → string[]` — คัดเฉพาะชื่อที่อยู่ใน knownNames (unique, ตัด falsy)
  - `examSetLabel(entry) → string` — `"name · 2566"` (ไม่มีปี = `name`)

- [ ] **Step 1: เขียนเทสที่ยังไม่ผ่าน**

```js
// src/utils/examSets.test.js
// รัน: node --test src/utils/examSets.test.js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { normalizeExamYear, upsertExamSet, keepKnownSets, examSetLabel } from './examSets.js'

test('normalizeExamYear: พ.ศ. ในช่วง → คงเดิม', () => {
  assert.equal(normalizeExamYear(2566), 2566)
})
test('normalizeExamYear: ค.ศ. → +543', () => {
  assert.equal(normalizeExamYear(2023), 2566)
})
test('normalizeExamYear: string "2566" → 2566', () => {
  assert.equal(normalizeExamYear('2566'), 2566)
})
test('normalizeExamYear: ตกช่วง/ไม่ใช่ตัวเลข → null', () => {
  assert.equal(normalizeExamYear(1200), null)
  assert.equal(normalizeExamYear(9999), null)
  assert.equal(normalizeExamYear('abc'), null)
  assert.equal(normalizeExamYear(null), null)
})

test('upsertExamSet: เพิ่มชุดใหม่', () => {
  const r = upsertExamSet([], 'PLE-CC1 ชุด 1', 2566)
  assert.deepEqual(r.list, [{ name: 'PLE-CC1 ชุด 1', year: 2566 }])
  assert.deepEqual(r.entry, { name: 'PLE-CC1 ชุด 1', year: 2566 })
})
test('upsertExamSet: ชื่อซ้ำ → อัปเดตปี ไม่เพิ่ม entry', () => {
  const r = upsertExamSet([{ name: 'A', year: 2565 }], 'A', 2566)
  assert.equal(r.list.length, 1)
  assert.equal(r.list[0].year, 2566)
})
test('upsertExamSet: ชื่อว่าง → null', () => {
  assert.equal(upsertExamSet([], '   ', 2566), null)
})
test('upsertExamSet: ปีไม่ valid → เก็บ year:null ได้ (ชุดไม่ระบุปี)', () => {
  const r = upsertExamSet([], 'B', 99999)
  assert.equal(r.list[0].year, null)
})

test('keepKnownSets: คัดเฉพาะชื่อที่รู้จัก + unique', () => {
  assert.deepEqual(keepKnownSets(['A', 'X', 'A', ''], ['A', 'B']), ['A'])
})
test('keepKnownSets: input ไม่ใช่ array → []', () => {
  assert.deepEqual(keepKnownSets(null, ['A']), [])
})

test('examSetLabel: มีปี → "name · ปี"', () => {
  assert.equal(examSetLabel({ name: 'A', year: 2566 }), 'A · 2566')
})
test('examSetLabel: ไม่มีปี → name', () => {
  assert.equal(examSetLabel({ name: 'A', year: null }), 'A')
})
```

- [ ] **Step 2: รันเทสให้เห็นว่า fail**

Run: `node --test src/utils/examSets.test.js`
Expected: FAIL — `Cannot find module './examSets.js'`

- [ ] **Step 3: เขียน implementation ให้น้อยที่สุดที่ผ่าน**

```js
// src/utils/examSets.js
// ════════════════════════════════════════════════════════════
//  ชุดข้อสอบย้อนหลัง — pure logic (ไม่แตะ Firestore/Vue)
//  - normalizeExamYear : coerce → พ.ศ. (ค.ศ.→+543) ในช่วงที่ยอมรับ ไม่งั้น null
//  - upsertExamSet      : dedup ตาม name (ชื่อซ้ำ = อัปเดตปี) — ห้าม arrayUnion object
//  - keepKnownSets      : คัดชื่อชุดให้เหลือเฉพาะที่อยู่ใน config (กัน fragmentation)
// ════════════════════════════════════════════════════════════
import { cleanText, LIMITS } from './text.js'

const YEAR_MIN = 2500
const YEAR_MAX = 2600

export function normalizeExamYear(y) {
  let n = Math.trunc(Number(y))
  if (!Number.isFinite(n)) return null
  if (n < 2400) n += 543               // ค.ศ. → พ.ศ.
  return (n >= YEAR_MIN && n <= YEAR_MAX) ? n : null
}

// คืน { list ใหม่, entry ที่ upsert } — name ว่างหลัง clean = null
export function upsertExamSet(list, name, year) {
  const clean = cleanText(name, LIMITS.category)
  if (!clean) return null
  const entry = { name: clean, year: normalizeExamYear(year) }
  const next = Array.isArray(list) ? [...list] : []
  const i = next.findIndex(s => s && s.name === clean)
  if (i >= 0) next[i] = entry
  else next.push(entry)
  return { list: next, entry }
}

export function keepKnownSets(sets, knownNames) {
  if (!Array.isArray(sets)) return []
  const known = new Set(knownNames || [])
  return [...new Set(sets.filter(s => s && known.has(s)))]
}

export function examSetLabel(entry) {
  if (!entry || !entry.name) return ''
  return entry.year ? `${entry.name} · ${entry.year}` : entry.name
}
```

- [ ] **Step 4: รันเทสให้ผ่าน**

Run: `node --test src/utils/examSets.test.js`
Expected: PASS ทุก test

- [ ] **Step 5: Commit**

```bash
git add src/utils/examSets.js src/utils/examSets.test.js
git commit -m "ExamSets: pure util normalize ปี + dedup/validate ชุด (กัน fragmentation + desync)"
```

---

### Task 2: composable `useExamSets` (clone useTopics)

**Files:**
- Create: `src/composables/useExamSets.js`

**Interfaces:**
- Consumes: `upsertExamSet` จาก `../utils/examSets.js`; `db`, `useUsageStore`
- Produces: `useExamSets()` → `{ sets, loadExamSets(), addExamSet(name, year) }`
  - `sets: Ref<{name,year}[]>` (module-cache อ่านครั้งเดียว/เซสชัน)
  - `addExamSet(name, year) → Promise<{name,year} | null>` — setDoc merge ทับทั้ง list (ไม่ใช่ arrayUnion)

> ทดสอบไม่ได้ด้วย node (แตะ Firestore) — logic dedup อยู่ใน `upsertExamSet` ที่ test แล้ว
> Task นี้ verify ด้วย build + ใช้จริงใน Task 4

- [ ] **Step 1: เขียน composable**

```js
// src/composables/useExamSets.js
// รายการชุดข้อสอบย้อนหลัง (config/examSets.list = [{name, year}]) — cache ระดับ module
// วิชาการเพิ่มชุดใหม่ได้จาก ExamSetSelect · dedup ตาม name → setDoc ทับทั้ง list
// (ห้าม arrayUnion เพราะ object equality ทั้งใบ ทำให้ชื่อเดิมปีต่างซ้ำเป็น 2 entries)
import { ref } from 'vue'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '../firebase/config.js'
import { useUsageStore } from '../stores/usage.js'
import { upsertExamSet } from '../utils/examSets.js'

const sets = ref([])
let loadPromise = null   // cache promise ไม่ใช่ boolean — กัน race (ดู addExamSet)

export function useExamSets() {
  const usage = useUsageStore()

  // คืน promise ของการโหลด (idempotent) — caller await ได้เพื่อรอ list ครบ
  function loadExamSets() {
    if (!loadPromise) {
      loadPromise = (async () => {
        try {
          const snap = await getDoc(doc(db, 'config', 'examSets'))
          usage.track(1)
          if (snap.exists()) sets.value = snap.data().list || []
        } catch (e) { console.error('[examSets]', e); loadPromise = null }   // ให้ retry ได้
      })()
    }
    return loadPromise
  }

  // เพิ่ม/อัปเดตชุด — คืน entry ที่ clean แล้ว (null ถ้าชื่อว่าง)
  async function addExamSet(name, year) {
    await loadExamSets()   // ⚠️ กัน race: ต้องมี list ปัจจุบันครบก่อน upsert ไม่งั้น setDoc { list } ทับชุดเดิมหายหมด
    const r = upsertExamSet(sets.value, name, year)
    if (!r) return null
    await setDoc(doc(db, 'config', 'examSets'), { list: r.list }, { merge: true })
    usage.track(0, 1)
    sets.value = r.list
    return r.entry
  }

  return { sets, loadExamSets, addExamSet }
}
```

> **FIX (fable review):** ใช้ cache-promise ไม่ใช่ `loaded` boolean — เดิมถ้า user กด "เพิ่มชุด" ก่อน getDoc resolve, `sets.value` ยังเป็น `[]` → `setDoc { list: [ตัวเดียว] }` **ทับชุดทั้งหมดใน config หาย** (data loss) · `addExamSet` await load ก่อน upsert เสมอ

- [ ] **Step 2: ตรวจ syntax ด้วย node**

> ⚠️ **FIX (fable):** `npm run build` **ไม่ compile ไฟล์ที่ยังไม่ถูก import** (Vite tree-shake) → build ผ่านลวงๆ ไม่ยืนยันอะไร · การ verify จริงของ composable นี้เกิดตอน Task 5/7 (ที่ import ใช้จริง)

Run (เช็ค parse ผ่านเฉยๆ): `node --check src/composables/useExamSets.js` — ไม่ error = syntax ok
(หมายเหตุ: `node --check` ไม่ resolve import Vue/Firebase แต่จับ syntax error ได้)

- [ ] **Step 3: Commit**

```bash
git add src/composables/useExamSets.js
git commit -m "ExamSets: composable useExamSets (config/examSets, setDoc dedup ไม่ใช่ arrayUnion)"
```

---

### Task 3: firestore.rules — ให้ academic เขียน `config/examSets`

**Files:**
- Modify: `firestore.rules` (ต่อจากบล็อก `match /config/topics` ~บรรทัด 126–128)

**Interfaces:**
- Consumes: function `canEditQuestions()` (มีอยู่แล้วในไฟล์ rules)
- Produces: สิทธิ์เขียน `config/examSets` สำหรับ academic/admin/instructor

> ยืนยัน gap: `match /config/topics` เจาะจง doc เดียว → `config/examSets` จะตกไป
> `match /config/{doc}` ที่ `write: if isAdmin()` เท่านั้น · read ได้ฟรีจาก public-read ของ config

- [ ] **Step 1: เพิ่มบล็อก rule**

หา (firestore.rules ~บรรทัด 123–128):
```
    // ── Topics — รายชื่อหมวด/หัวข้อข้อสอบ (dropdown) ──
    //  read: public ผ่าน match /config/{doc} ด้านบนอยู่แล้ว (นักศึกษาใช้ดู label สถิติในอนาคต)
    //  write: กว้างกว่า config ปกติ — วิชาการ/อาจารย์เพิ่มหัวข้อเองได้ระหว่างตรวจข้อสอบ
    match /config/topics {
      allow write: if canEditQuestions();
    }
```
เพิ่มต่อท้าย (ก่อนบล็อก `cheatLogs`):
```
    // ── Exam sets — รายชื่อชุดข้อสอบย้อนหลัง (config/examSets.list = [{name, year}]) ──
    //  read: public ผ่าน match /config/{doc} (นักศึกษาโหลด picker "ข้อสอบย้อนหลัง")
    //  write: วิชาการ/อาจารย์เพิ่มชุดเองได้ระหว่างติดป้ายข้อสอบ (เหมือน topics)
    match /config/examSets {
      allow write: if canEditQuestions();
    }
```

- [ ] **Step 2: ตรวจ syntax + deploy**

Run: `firebase deploy --only firestore:rules`
Expected: `✔ Deploy complete!` (ถ้า syntax ผิด CLI จะ error ก่อน publish)

- [ ] **Step 3: Commit**

```bash
git add firestore.rules
git commit -m "Rules: อนุญาต academic เขียน config/examSets (ชุดข้อสอบย้อนหลัง)"
```

---

### Task 4: component `ExamSetSelect` (multi-select ชุด, clone TopicSelect)

**Files:**
- Create: `src/components/questions/ExamSetSelect.vue`

**Interfaces:**
- Consumes: `useExamSets` (Task 2), `examSetLabel` (Task 1), `useToast`, `LIMITS` (normalize ปีเกิดใน `upsertExamSet`/`addExamSet` แล้ว — component ไม่เรียกเอง)
- Produces: `<ExamSetSelect v-model="draft.examSets" />` — `modelValue: string[]`, emit `update:modelValue` เป็น `string[]`

> เลือกได้หลายชุด: โชว์ชิปชุดที่เลือก (กด ✕ ถอด) + dropdown เพิ่มจาก config + ปุ่มสร้างชุดใหม่ (name+year)
> Verify ด้วย build + ทดลองใน dev (Task 5 ต่อเชื่อมเข้าฟอร์ม)

- [ ] **Step 1: เขียน component**

```vue
<!-- src/components/questions/ExamSetSelect.vue -->
<template>
  <div class="es">
    <!-- ชุดที่เลือก (ชิป) -->
    <div v-if="modelValue.length" class="es-chips">
      <span v-for="name in modelValue" :key="name" class="es-chip">
        {{ labelOf(name) }}
        <button type="button" class="es-chip-x" @click="removeSet(name)" aria-label="ถอดชุดนี้">✕</button>
      </span>
    </div>

    <!-- เพิ่มจากรายการที่มี -->
    <select class="es-input" :value="''" @change="onSelect">
      <option value="">+ เลือกชุดข้อสอบย้อนหลัง…</option>
      <option v-for="s in available" :key="s.name" :value="s.name">{{ labelOf(s.name) }}</option>
      <option value="__add">➕ เพิ่มชุดใหม่…</option>
    </select>

    <!-- สร้างชุดใหม่ -->
    <div v-if="adding" class="es-add">
      <input v-model="newName" :maxlength="LIMITS.category" class="es-input" placeholder="ชื่อชุด เช่น PLE-CC1 ชุด 1" @keydown.enter.prevent="confirmAdd" />
      <input v-model="newYear" class="es-input es-year" inputmode="numeric" placeholder="ปี พ.ศ." @keydown.enter.prevent="confirmAdd" />
      <button type="button" class="es-btn" :disabled="busy || !newName.trim()" @click="confirmAdd">เพิ่ม</button>
      <button type="button" class="es-btn es-cancel" @click="cancelAdd">ยกเลิก</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useExamSets } from '../../composables/useExamSets.js'
import { useToast } from '../../composables/useToast.js'
import { examSetLabel } from '../../utils/examSets.js'
import { LIMITS } from '../../utils/text.js'

const props = defineProps({ modelValue: { type: Array, default: () => [] } })
const emit = defineEmits(['update:modelValue'])
const { sets, loadExamSets, addExamSet } = useExamSets()
const { toast } = useToast()
const adding = ref(false)
const newName = ref('')
const newYear = ref('')
const busy = ref(false)

onMounted(loadExamSets)

// ชุดที่ยังไม่ถูกเลือก (ให้เลือกเพิ่ม)
const available = computed(() => sets.value.filter(s => !props.modelValue.includes(s.name)))

function labelOf(name) {
  const entry = sets.value.find(s => s.name === name)
  return entry ? examSetLabel(entry) : name   // ชุดที่ config โหลดไม่ทัน/ถูกลบ ยังโชว์ชื่อดิบ
}

function onSelect(e) {
  const v = e.target.value
  e.target.value = ''                    // reset ไม่ให้ค้างค่าใน select
  if (v === '__add') { adding.value = true; return }
  if (v && !props.modelValue.includes(v)) emit('update:modelValue', [...props.modelValue, v])
}

function removeSet(name) {
  emit('update:modelValue', props.modelValue.filter(n => n !== name))
}

function cancelAdd() { adding.value = false; newName.value = ''; newYear.value = '' }

async function confirmAdd() {
  if (busy.value) return
  busy.value = true
  try {
    const entry = await addExamSet(newName.value, newYear.value)
    if (!entry) { toast('ชื่อชุดใช้ไม่ได้ ลองพิมพ์ใหม่', 'error'); return }
    if (!props.modelValue.includes(entry.name)) emit('update:modelValue', [...props.modelValue, entry.name])
    cancelAdd()
  } catch (e) { console.error('[examSet add]', e); toast('เพิ่มชุดไม่สำเร็จ', 'error') }
  finally { busy.value = false }
}
</script>

<style scoped>
.es-chips { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 7px; }
.es-chip { display: inline-flex; align-items: center; gap: 6px; background: var(--primary-light, #eef2ff); color: #4f46e5; border-radius: 999px; padding: 4px 6px 4px 11px; font-size: .74rem; font-weight: 700; }
.es-chip-x { border: none; background: rgba(0,0,0,.08); border-radius: 50%; width: 18px; height: 18px; cursor: pointer; color: #4f46e5; font-size: .66rem; line-height: 1; }
.es-input { width: 100%; box-sizing: border-box; border: 2px solid var(--ink); border-radius: 10px; padding: 9px 11px; font-family: inherit; font-size: .82rem; background: #fff; }
.es-input:focus { outline: none; box-shadow: var(--pop); }
.es-add { display: flex; gap: 6px; margin-top: 6px; flex-wrap: wrap; }
.es-add .es-input { flex: 1; min-width: 120px; }
.es-year { flex: 0 0 90px; }
.es-btn { flex-shrink: 0; border: 2px solid var(--ink); border-radius: 9px; padding: 6px 12px; font-family: inherit; font-size: .75rem; font-weight: 800; background: var(--primary); color: #fff; cursor: pointer; }
.es-btn:disabled { background: #cbd5e1; cursor: default; }
.es-cancel { background: #fff; color: var(--ink); }
</style>
```

- [ ] **Step 2: ตรวจ syntax**

> ⚠️ **FIX (fable):** เหมือน Task 2 — ไฟล์ยังไม่ถูก import, `npm run build` ไม่ compile · verify จริงตอน Task 5

Run: `npx vue-tsc --noEmit 2>/dev/null || node --check src/components/questions/ExamSetSelect.vue` — ถ้าโปรเจกต์ไม่มี vue-tsc ให้ข้ามไป verify จริงที่ Task 5 (mount ในฟอร์ม)

- [ ] **Step 3: Commit**

```bash
git add src/components/questions/ExamSetSelect.vue
git commit -m "ExamSetSelect: component เลือกชุดข้อสอบย้อนหลังได้หลายชุด + สร้างชุดใหม่ (name+ปี)"
```

---

### Task 5: ต่อ `examSets` เข้าฟอร์มเพิ่ม/แก้ (QuestionsView)

**Files:**
- Modify: `src/views/QuestionsView.vue` (blankDraft ~429–431, edit ~687–700, save payload ~603–635, template ฟอร์ม ~129–131, import ExamSetSelect ~304)

**Interfaces:**
- Consumes: `ExamSetSelect` (Task 4)
- Produces: `draft.examSets: string[]` ถูกเขียนลง `questions/{id}.examSets` ทั้งตอน add และ update

> examSets ไม่อยู่ใน `reviewContentChanged` key → แก้ชุดไม่ล้างผลตรวจ (ต้องการแบบนี้)
> rules: update ที่แตะแค่ examSets ผ่าน `reviewUntouched` (ไม่ใช่ review key) — academic เขียนได้

- [ ] **Step 1: import component + เพิ่ม field ใน draft**

เพิ่ม import (ต่อจากบรรทัด `import TopicSelect ...` ~304):
```js
import ExamSetSelect from '../components/questions/ExamSetSelect.vue'
```
แก้ `blankDraft()` (~429–431):
```js
function blankDraft() {
  return { id: null, question: '', choices: ['', '', '', ''], answer: 0, category: '', explanation: '', isPublished: false, domain: null, examSets: [] }
}
```
แก้ `edit(q)` (~687–698) — เพิ่มบรรทัด examSets ใน object ที่ assign ให้ draft.value:
```js
  draft.value = {
    id: q.id,
    question: q.question || '',
    choices: (q.choices && q.choices.length >= 2) ? [...q.choices] : ['', ''],
    answer: q.answer || 0,
    category: q.category || '',
    explanation: q.explanation || '',
    isPublished: !!q.isPublished,
    domain: q.domain || null,
    examSets: Array.isArray(q.examSets) ? [...q.examSets] : [],
  }
```

- [ ] **Step 2: เพิ่ม examSets ลง save payload**

แก้ `payload` ใน `save()` (~603–613) — เพิ่มบรรทัด `examSets`:
```js
  const payload = {
    question: cleanText(d.question, LIMITS.question),
    choices: d.choices.map(c => cleanText(c, LIMITS.choice)).filter(Boolean),
    answer: d.answer,
    category: cleanText(d.category, LIMITS.category) || null,
    explanation: cleanText(d.explanation, LIMITS.explanation) || null,
    isPublished: !!d.isPublished,
    domain: d.domain || null,
    examSets: Array.isArray(d.examSets) ? d.examSets : [],
    qhash: qhash(cleanText(d.question, LIMITS.question)),
    updatedAt: serverTimestamp(),
  }
```

- [ ] **Step 3: เพิ่ม UI ในฟอร์ม**

หาในเทมเพลต (~129–131):
```
        <label class="qz-label">หมวด / กลุ่มเนื้อหา</label>
        <TopicSelect v-model="draft.category" />
```
เพิ่มต่อท้าย (ก่อน `<label class="qz-label">หมวดใหญ่ (domain)</label>`):
```
        <label class="qz-label">ชุดข้อสอบย้อนหลัง (ไม่บังคับ — 1 ข้ออยู่ได้หลายชุด)</label>
        <ExamSetSelect v-model="draft.examSets" />
```

- [ ] **Step 4: ตรวจ build + ทดลอง dev**

Run: `npm run build`
Expected: build สำเร็จ

ทดลอง (manual, dev): `npm run dev` → เข้า /questions (บัญชี academic) → เพิ่มข้อใหม่ + เลือก/สร้างชุด → บันทึก → กด "แก้ไข" ข้อเดิม เห็นชิปชุดที่เลือกกลับมา
Expected: ชุดถูกบันทึก + โหลดกลับถูก

- [ ] **Step 5: Commit**

```bash
git add src/views/QuestionsView.vue
git commit -m "Questions: ต่อ ExamSetSelect เข้าฟอร์มเพิ่ม/แก้ (บันทึก examSets ลง doc)"
```

---

### Task 6: `parseImport` รับ `examSets` ต่อข้อ

**Files:**
- Modify: `src/utils/importQuestions.js` (`rowFromItem` ~18–41)
- Modify: `src/utils/importQuestions.test.js` (อัปเดต assertion เดิม + เพิ่ม test)

**Interfaces:**
- Consumes: `cleanText, LIMITS`
- Produces: แต่ละ row เพิ่ม `examSets: string[]` — รับจาก `item.examSets` (array) หรือ `item.examSet` (string → array 1 ตัว); ไม่มี = `[]`; ชื่อผ่าน cleanText, ตัด falsy

> **ยังไม่ validate กับ config ที่นี่** (parseImport เป็น pure ไม่รู้จัก config) — คัดชื่อที่ไม่รู้จัก
> ทำตอน runImport (Task 7) ด้วย `keepKnownSets`

- [ ] **Step 1: อัปเดตเทส — assertion เดิม (บรรทัด 18–21) + เพิ่ม test ใหม่**

แก้ test แรก (บรรทัด 18–21) ให้ deepEqual รวม `examSets: []`:
```js
  assert.deepEqual(r.rows[0], {
    question: 'ยาใดเป็น first-line', choices: ['A', 'B', 'C', 'D'], answer: 2,
    category: 'ยาปฏิชีวนะ', explanation: 'เพราะ X', domain: null, isPublished: false, examSets: [],
  })
```
เพิ่ม test ใหม่ท้ายไฟล์:
```js
test('examSets เป็น array → เก็บ (ผ่าน cleanText, ตัดว่าง)', () => {
  const r = parseImport(one({ question: 'Q', choices: ['a', 'b'], answer: 0, examSets: ['PLE-CC1 ชุด 1', '  ', ''] }))
  assert.deepEqual(r.rows[0].examSets, ['PLE-CC1 ชุด 1'])
})
test('examSet เดี่ยว (string) → กลายเป็น array 1 ตัว', () => {
  const r = parseImport(one({ question: 'Q', choices: ['a', 'b'], answer: 0, examSet: 'PLE-CC1 ชุด 2' }))
  assert.deepEqual(r.rows[0].examSets, ['PLE-CC1 ชุด 2'])
})
test('ไม่ส่ง examSets/examSet → []', () => {
  const r = parseImport(one({ question: 'Q', choices: ['a', 'b'], answer: 0 }))
  assert.deepEqual(r.rows[0].examSets, [])
})
```

- [ ] **Step 2: รันเทสให้เห็นว่า fail**

Run: `node --test src/utils/importQuestions.test.js`
Expected: FAIL — test ใหม่ fail + test แรก fail (rows[0] ไม่มี examSets)

- [ ] **Step 3: แก้ `rowFromItem`**

แก้ return ใน `rowFromItem` (~32–40) — เพิ่มการอ่าน examSets ก่อน return:
```js
  // ชุดข้อสอบย้อนหลัง: รับ examSets (array) หรือ examSet (string เดี่ยว) — clean + ตัดว่าง
  const rawSets = Array.isArray(item.examSets)
    ? item.examSets
    : (item.examSet != null ? [item.examSet] : [])
  const examSets = rawSets.map(s => cleanText(s, LIMITS.category)).filter(Boolean)

  return {
    question,
    choices,
    answer,
    category: cleanText(item.category, LIMITS.category) || null,
    explanation: cleanText(item.explanation, LIMITS.explanation) || null,
    domain: isDomainKey(item.domain) ? item.domain : null,
    examSets,
    isPublished: false,
  }
```

- [ ] **Step 4: รันเทสให้ผ่าน**

Run: `node --test src/utils/importQuestions.test.js`
Expected: PASS ทุก test

- [ ] **Step 5: Commit**

```bash
git add src/utils/importQuestions.js src/utils/importQuestions.test.js
git commit -m "Import: parseImport รับ examSets/examSet ต่อข้อ (clean + เป็น array)"
```

---

### Task 7: merge-tag ตอน import (pure planner + wire runImport + file-stamp)

**Files:**
- Create: `src/utils/importTagging.js`
- Test: `src/utils/importTagging.test.js`
- Modify: `src/views/QuestionsView.vue` (`runImport` ~493–533, เพิ่ม UI file-stamp + import util)

**Interfaces:**
- Consumes: `qhash` จาก `./qhash.js`
- Produces:
  - `planImportWrites(rows, existing) → { fresh, tagUpdates }`
    - `existing: {id, qhash}[]` (จากคลังที่โหลดอยู่)
    - `fresh: row[]` (ข้อใหม่จริง — ข้อซ้ำในไฟล์รวม examSets เข้าตัวแรก)
    - `tagUpdates: {id, addSets: string[]}[]` (ข้อซ้ำคลัง + มี examSets → arrayUnion เข้า doc เดิม)
  - `stampFileSets(rows, fileSets) → row[]` (ข้อที่ examSets ว่าง → ใช้ fileSets)

- [ ] **Step 1: เขียนเทส pure planner**

```js
// src/utils/importTagging.test.js
// รัน: node --test src/utils/importTagging.test.js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { planImportWrites, stampFileSets } from './importTagging.js'
import { qhash } from './qhash.js'

const row = (question, examSets = []) => ({ question, choices: ['a', 'b'], answer: 0, examSets })

test('ข้อไม่ซ้ำ → เข้า fresh, ไม่มี tagUpdate', () => {
  const r = planImportWrites([row('ใหม่')], [])
  assert.equal(r.fresh.length, 1)
  assert.equal(r.tagUpdates.length, 0)
})

test('ข้อซ้ำคลัง + มี examSets → tagUpdate เข้า doc เดิม ไม่เข้า fresh', () => {
  const existing = [{ id: 'D1', qhash: qhash('ซ้ำ') }]
  const r = planImportWrites([row('ซ้ำ', ['ชุด A'])], existing)
  assert.equal(r.fresh.length, 0)
  assert.deepEqual(r.tagUpdates, [{ id: 'D1', addSets: ['ชุด A'] }])
})

test('ข้อซ้ำคลัง + ไม่มี examSets → ข้ามเงียบ (ไม่ fresh ไม่ tag)', () => {
  const existing = [{ id: 'D1', qhash: qhash('ซ้ำ') }]
  const r = planImportWrites([row('ซ้ำ', [])], existing)
  assert.equal(r.fresh.length, 0)
  assert.equal(r.tagUpdates.length, 0)
})

test('ข้อซ้ำกันเองในไฟล์ → รวม examSets เข้าตัวแรก (fresh เดียว)', () => {
  const r = planImportWrites([row('ก', ['A']), row('ก', ['B'])], [])
  assert.equal(r.fresh.length, 1)
  assert.deepEqual(r.fresh[0].examSets, ['A', 'B'])
})

test('stampFileSets: ข้อ examSets ว่าง → ใช้ fileSets; ข้อมีอยู่แล้ว → คงเดิม', () => {
  const out = stampFileSets([row('x', []), row('y', ['เดิม'])], ['ไฟล์'])
  assert.deepEqual(out[0].examSets, ['ไฟล์'])
  assert.deepEqual(out[1].examSets, ['เดิม'])
})
```

- [ ] **Step 2: รันเทสให้เห็นว่า fail**

Run: `node --test src/utils/importTagging.test.js`
Expected: FAIL — `Cannot find module './importTagging.js'`

- [ ] **Step 3: เขียน implementation**

```js
// src/utils/importTagging.js
// ════════════════════════════════════════════════════════════
//  วางแผนการเขียนตอน import ข้อสอบย้อนหลัง (pure) —
//  ข้อซ้ำคลังเดิม (qhash ชน) เปลี่ยนจาก "ข้าม" เป็น "merge tag": arrayUnion ชุดใหม่เข้า doc เดิม
//  ข้อซ้ำกันเองในไฟล์ → รวม examSets เข้าตัวแรก (ไม่เขียน 2 docs)
// ════════════════════════════════════════════════════════════
import { qhash } from './qhash.js'

function unionInto(target, add) {
  for (const s of add || []) if (!target.includes(s)) target.push(s)
}

export function planImportWrites(rows, existing = []) {
  const byHash = new Map((existing || []).map(e => [e.qhash, e.id]))
  const freshByHash = new Map()   // hash → index ใน fresh (รวมซ้ำในไฟล์)
  const fresh = []
  const tagUpdates = []
  for (const r of rows || []) {
    const h = qhash(r.question)
    const sets = Array.isArray(r.examSets) ? r.examSets : []
    if (byHash.has(h)) {
      if (sets.length) tagUpdates.push({ id: byHash.get(h), addSets: [...sets] })
    } else if (freshByHash.has(h)) {
      unionInto(fresh[freshByHash.get(h)].examSets, sets)
    } else {
      const copy = { ...r, examSets: [...sets] }
      freshByHash.set(h, fresh.length)
      fresh.push(copy)
    }
  }
  return { fresh, tagUpdates }
}

export function stampFileSets(rows, fileSets = []) {
  if (!fileSets.length) return rows || []
  return (rows || []).map(r => {
    const sets = Array.isArray(r.examSets) ? r.examSets : []
    return sets.length ? r : { ...r, examSets: [...fileSets] }
  })
}
```

- [ ] **Step 4: รันเทสให้ผ่าน**

Run: `node --test src/utils/importTagging.test.js`
Expected: PASS ทุก test

- [ ] **Step 5: Commit util**

```bash
git add src/utils/importTagging.js src/utils/importTagging.test.js
git commit -m "Import: planImportWrites — ข้อซ้ำ merge tag แทนข้าม (pure + test)"
```

- [ ] **Step 6: wire เข้า `runImport` + UI file-stamp**

เพิ่ม import ใน QuestionsView (~294–303 กลุ่ม import utils):
```js
import { planImportWrites, stampFileSets } from '../utils/importTagging.js'
import { keepKnownSets } from '../utils/examSets.js'
import { useExamSets } from '../composables/useExamSets.js'
```
**FIX (fable):** `splitDuplicateRows` เลิกใช้แล้ว (แทนด้วย planImportWrites) — แก้ import qhash เดิม (บรรทัด 295) ตัด `splitDuplicateRows` ออก:
```js
import { qhash, groupDuplicates } from '../utils/qhash.js'
```
เพิ่ม state + โหลดชุด (ใกล้ๆ state ของ import ~468–470):
```js
const { sets: examSetOptions, loadExamSets } = useExamSets()
const fileSets = ref([])   // ชุดที่จะ stamp ทั้งไฟล์
```
เรียก `loadExamSets()` ใน `onMounted` (~451–456) ต่อจาก `load()`:
```js
onMounted(() => {
  if (!authStore.isQuestionEditor) return
  load()
  loadStats()
  loadExamSets()
  if (authStore.isAcademic) loadReports()
})
```
**FIX (fable):** โค้ดด้านล่างคือ**ทั้งฟังก์ชัน** — แทนที่ `runImport` เดิมทั้งก้อน (บรรทัด 493–533):
```js
async function runImport() {
  if (importing.value) return
  const { rows: rawRows, skipped, error } = parseImport(importText.value)
  if (error) { toast(error, 'error'); return }
  if (!rawRows.length) { toast('ไม่มีข้อที่นำเข้าได้', 'error'); return }
  importing.value = true
  try {
    const known = examSetOptions.value.map(s => s.name)
    // 1) stamp ชุดทั้งไฟล์ให้ข้อที่ยังไม่มีชุด → 2) คัดเฉพาะชื่อชุดที่รู้จัก (กัน fragmentation)
    const stamped = stampFileSets(rawRows, keepKnownSets(fileSets.value, known))
    const rows = stamped.map(r => ({ ...r, examSets: keepKnownSets(r.examSets, known) }))
    // 3) วางแผนเขียน: ข้อใหม่ = fresh, ข้อซ้ำคลัง+มีชุด = tagUpdate (arrayUnion เข้า doc เดิม)
    const existing = list.value.map(q => ({ id: q.id, qhash: (typeof q.qhash === 'string' ? q.qhash : qhash(q.question)) }))
    const { fresh, tagUpdates } = planImportWrites(rows, existing)
    if (!fresh.length && !tagUpdates.length) { toast('ทุกข้อซ้ำคลังและไม่มีชุดใหม่ให้เพิ่ม', 'error'); return }
    const meta = {
      createdBy: authStore.currentUser?.uid || null,
      createdByName: authStore.userData?.nickname || authStore.userData?.name || null,
      source: 'import',
      ...REVIEW_RESET,
    }
    // เขียน fresh (chunk 500) — ข้อใหม่พร้อม examSets
    const col = collection(db, 'questions')
    for (let i = 0; i < fresh.length; i += 500) {
      const batch = writeBatch(db)
      for (const r of fresh.slice(i, i + 500)) {
        batch.set(doc(col), { ...r, ...meta, qhash: qhash(r.question), rand: Math.random(), createdAt: serverTimestamp() })
      }
      await batch.commit()
    }
    // arrayUnion tag เข้า doc เดิม (chunk 500) — ไม่แตะ review keys → ไม่ล้างผลตรวจ
    for (let i = 0; i < tagUpdates.length; i += 500) {
      const batch = writeBatch(db)
      for (const t of tagUpdates.slice(i, i + 500)) {
        batch.update(doc(db, 'questions', t.id), { examSets: arrayUnion(...t.addSets), updatedAt: serverTimestamp() })
      }
      await batch.commit()
    }
    if (skipped.length) console.warn('[questions import] ข้ามข้อ:', skipped)
    const parts = [`นำเข้าใหม่ ${fresh.length} ข้อ`]
    if (tagUpdates.length) parts.push(`เพิ่มแท็กข้อเดิม ${tagUpdates.length} ข้อ`)
    if (skipped.length) parts.push(`ผิดรูปแบบ ${skipped.length} ข้อ`)
    toast(parts.join(' · '), 'success')
    importText.value = ''
    fileSets.value = []
    await load()
    await recomputeMeta()
  } catch (e) {
    console.error('[questions import]', e)
    toast('นำเข้าไม่สำเร็จ', 'error')
  } finally {
    importing.value = false
  }
}
```
เพิ่ม `arrayUnion` เข้า import จาก firebase/firestore (~286) — ต่อท้าย list ที่มีอยู่:
```js
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, where, orderBy, limit, serverTimestamp, writeBatch, setDoc, deleteField, arrayUnion } from 'firebase/firestore'
```
เพิ่ม UI เลือกชุดทั้งไฟล์ ในบล็อก import (~เหนือปุ่ม `qz-import-btn` ~43):
```
          <div class="qz-import-sets">
            <span class="qz-import-sets-label">ตั้งชุดให้ทุกข้อในไฟล์ (ข้อที่มีชุดของตัวเองใน JSON ใช้ของตัวเอง)</span>
            <ExamSetSelect v-model="fileSets" />
          </div>
```
เพิ่ม CSS ใน `<style scoped>` (ท้ายบล็อก) — **FIX (fable): คลาสนี้ยังไม่มี style**:
```css
.qz-import-sets { display: flex; flex-direction: column; gap: 5px; }
.qz-import-sets-label { font-size: .7rem; font-weight: 700; color: #64748b; }
```
อัปเดต note รูปแบบ JSON (บรรทัด ~31–35, `qz-fmt-note`) — เติมบรรทัดบอก field ใหม่ให้วิชาการรู้:
```
              <code>examSets</code> = array ชื่อชุด เช่น <code>["PLE-CC1 ชุด 1"]</code> (หรือ <code>examSet</code> เดี่ยว) · ไม่บังคับ ·

- [ ] **Step 7: ตรวจ build + ทดลอง dev**

Run: `npm run build`
Expected: build สำเร็จ

ทดลอง (dev, academic): สร้างชุด "ทดสอบ 2566" ก่อน → วาง JSON 2 ข้อ (ข้อหนึ่งซ้ำโจทย์เดิมในคลัง) → เลือก fileSets = "ทดสอบ 2566" → นำเข้า
Expected: toast "นำเข้าใหม่ 1 · เพิ่มแท็กข้อเดิม 1"; ข้อเดิมในคลังได้ examSets เพิ่มโดยผลตรวจไม่ถูกล้าง

- [ ] **Step 8: Commit**

```bash
git add src/views/QuestionsView.vue
git commit -m "Import: merge-tag ข้อซ้ำ + เลือกชุดทั้งไฟล์ + validate ชื่อกับ config (wire runImport)"
```

---

### Task 8: batch-tag ข้อที่เลือกในคลัง

**Files:**
- Modify: `src/views/QuestionsView.vue` (batch actions template ~225–230, เพิ่มฟังก์ชัน batchTag ใกล้ batchPublish ~378)

**Interfaces:**
- Consumes: `commitInChunks` (มีอยู่ ~361), `arrayUnion` (Task 7), `examSetOptions/loadExamSets` (Task 7), `ExamSetSelect` (Task 4)
- Produces: ปุ่ม "เพิ่มชุดให้ข้อที่เลือก" → arrayUnion examSets เข้าทุก id ที่เลือก

- [ ] **Step 1: เพิ่ม state + ฟังก์ชัน batchTag**

เพิ่ม state (ใกล้ `batchBusy` ~326):
```js
const batchSets = ref([])   // ชุดที่จะ tag ให้ข้อที่เลือก
```
เพิ่มฟังก์ชัน (ต่อจาก `batchPublish` ~387):
```js
// batch-tag: arrayUnion ชุดเข้าทุกข้อที่เลือก — ไม่แตะ review keys → ไม่ล้างผลตรวจ
async function batchTag() {
  const ids = [...selected.value]
  if (!ids.length || !batchSets.value.length || batchBusy.value) return
  batchBusy.value = true
  try {
    await commitInChunks(ids, (b, ref) => b.update(ref, { examSets: arrayUnion(...batchSets.value), updatedAt: serverTimestamp() }))
    batchSets.value = []
    await afterBatch(`เพิ่มชุดให้ ${ids.length} ข้อแล้ว`)
  } catch (e) { console.error('[batch tag]', e); toast('เพิ่มชุดไม่สำเร็จ', 'error') }
  finally { batchBusy.value = false }
}
```

- [ ] **Step 2: เพิ่ม UI ในแถบ batch**

หา (~225–230, บล็อก `qz-batch-actions`) เพิ่มส่วน tag ต่อท้ายในบล็อกเดียวกัน:
```
      <div v-if="selected.size" class="qz-batch-tag">
        <ExamSetSelect v-model="batchSets" />
        <button class="qz-mini" :disabled="batchBusy || !batchSets.length" @click="batchTag">เพิ่มชุดให้ {{ selected.size }} ข้อที่เลือก</button>
      </div>
```
เพิ่ม CSS ใน `<style scoped>` — **FIX (fable): คลาสนี้ยังไม่มี style**:
```css
.qz-batch-tag { display: flex; flex-direction: column; gap: 7px; margin: 8px 0 10px; padding: 9px 10px; background: #f8fafc; border-radius: 10px; }
```

- [ ] **Step 3: ตรวจ build + ทดลอง dev**

Run: `npm run build`
Expected: build สำเร็จ

ทดลอง (dev): เลือกข้อ 2–3 ข้อ → เลือกชุด → กด "เพิ่มชุดให้…" → กด "แก้ไข" ข้อใดข้อหนึ่งเห็นชุดติดมา
Expected: ทุกข้อที่เลือกได้ examSets เพิ่ม, ผลตรวจไม่ถูกล้าง

- [ ] **Step 4: Commit**

```bash
git add src/views/QuestionsView.vue
git commit -m "Questions: batch-tag เพิ่มชุดให้ข้อที่เลือกทีเดียว (arrayUnion, ไม่ล้างผลตรวจ)"
```

---

### Task 9: audit display (ประวัติข้อนี้ — read-only)

**Files:**
- Modify: `src/views/QuestionsView.vue` (expanded detail ~258–272, เพิ่ม state/loader โหลด reviews ตอน expand)

**Interfaces:**
- Consumes: `getDocs, collection` (มีอยู่), `fmtTime` (มีอยู่ ~749), `VERDICT_LABEL` (import แล้ว ~301)
- Produces: กล่อง "ประวัติข้อนี้" ในรายละเอียดข้อที่กาง — เพิ่มโดย + ผลตรวจรอบปัจจุบัน + สถานะ

> โหลด reviews **เฉพาะข้อที่กาง** (ไม่ใช่ทุกข้อในลิสต์) · label "ผลตรวจรอบปัจจุบัน" · fallback "ไม่ระบุ"

- [ ] **Step 1: เพิ่ม state + loader (โหลดตอน expand)**

เพิ่ม state (ใกล้ `expandedId` ~327):
```js
const detailReviews = ref([])          // reviews ของข้อที่กางอยู่ (รอบปัจจุบัน)
const detailReviewsLoading = ref(false)
```
แก้ `toggleExpand` (~328) ให้โหลด reviews ตอนกาง:
```js
async function toggleExpand(id) {
  if (expandedId.value === id) { expandedId.value = null; return }
  expandedId.value = id
  detailReviews.value = []
  const q = list.value.find(x => x.id === id)
  if (!q || !(q.reviewedBy?.length)) return
  detailReviewsLoading.value = true
  try {
    const snap = await getDocs(collection(db, 'questions', id, 'reviews'))
    usage.track(snap.size)
    if (expandedId.value !== id) return   // FIX (fable): กางข้ออื่นไปแล้วระหว่าง await — ทิ้งผลเก่า
    detailReviews.value = snap.docs.filter(d => (q.reviewedBy || []).includes(d.id)).map(d => ({ id: d.id, ...d.data() }))
  } catch (e) { console.error('[detail reviews]', e) }
  finally { detailReviewsLoading.value = false }
}
```

- [ ] **Step 2: เพิ่มกล่องประวัติในเทมเพลต detail**

หาในเทมเพลต detail (~266–272, ต่อจาก `<div v-if="q.explanation" class="qz-exp">`) เพิ่มก่อน `<QuestionComments ...>`:
```
            <div class="qz-audit">
              <div class="qz-audit-row"><b>เพิ่มโดย:</b> {{ q.createdByName || 'ไม่ระบุ' }}<span v-if="q.source === 'import'"> · นำเข้า</span> · {{ fmtTime(q.createdAt) || '—' }}</div>
              <div class="qz-audit-row"><b>สถานะตรวจ:</b> {{ REVIEW_STATUS_LABEL[reviewStatusKey(q)] }}</div>
              <div v-if="detailReviewsLoading" class="qz-audit-row">กำลังโหลดผลตรวจ…</div>
              <template v-else-if="detailReviews.length">
                <div class="qz-audit-head">ผลตรวจรอบปัจจุบัน ({{ detailReviews.length }})</div>
                <div v-for="r in detailReviews" :key="r.id" class="qz-audit-rev">
                  <b>{{ r.reviewerName || 'ไม่ระบุ' }}</b> — {{ VERDICT_LABEL[r.verdict] || r.verdict }}
                  <span v-if="r.reason" class="qz-audit-reason">· {{ r.reason }}</span>
                </div>
              </template>
            </div>
```

- [ ] **Step 3: เพิ่ม style**

เพิ่มใน `<style scoped>` (ท้ายบล็อก):
```css
.qz-audit { margin-top: 10px; padding: 9px 11px; border: 1px dashed var(--border); border-radius: 10px; background: #fafafa; font-size: .72rem; color: rgba(0,0,0,.6); line-height: 1.55; }
.qz-audit-row b { color: rgba(0,0,0,.75); font-weight: 800; }
.qz-audit-head { font-weight: 800; color: #c2410c; margin-top: 5px; }
.qz-audit-rev { margin-top: 2px; }
.qz-audit-reason { color: rgba(0,0,0,.5); }
```

- [ ] **Step 4: ตรวจ build + ทดลอง dev**

Run: `npm run build`
Expected: build สำเร็จ

ทดลอง (dev, academic): กางข้อที่มีผลตรวจแล้ว → เห็น "เพิ่มโดย … · สถานะตรวจ … · ผลตรวจรอบปัจจุบัน (ชื่อผู้ตรวจ + verdict)"; กางข้อยังไม่ตรวจ → เห็นแค่เพิ่มโดย + สถานะ
Expected: แสดงถูก, ข้อเก่าไม่มีชื่อผู้เพิ่มขึ้น "ไม่ระบุ"

- [ ] **Step 5: Commit**

```bash
git add src/views/QuestionsView.vue
git commit -m "Questions: กล่องประวัติ read-only (เพิ่มโดย/ผลตรวจรอบปัจจุบัน) โหลด reviews ตอนกาง"
```

---

## Self-Review (ตรวจ plan เทียบ spec)

**Spec coverage P1:**
- A. examSets[] + config/examSets → Task 1,2,5 · rules → Task 3 ✓
- B1 ฟอร์ม → Task 4,5 · B2 import(+file-stamp) → Task 6,7 · B3 batch-tag → Task 8 ✓
- C normalize ปี พ.ศ./ค.ศ. → Task 1 (normalizeExamYear) ✓
- D audit read-only → Task 9 ✓
- แก้ tag ไม่ล้างผลตรวจ → อาศัย reviewContentChanged เดิม (Task 5/7/8 ใช้ examSets ไม่ใช่ review key) ✓
  - **หมายเหตุ:** spec เสนอเพิ่ม test กัน reviewContentChanged เผลอรวม exam fields — เป็น regression guard เชิงป้องกัน ไม่ block P1 → ยกไปทำพร้อม P2 (ตอนแตะ questionReview เพิ่ม) หรือเสริมได้ถ้าต้องการความมั่นใจ
- E (นักศึกษา/quiz/index/meta examSets) → **ไม่อยู่ P1** (แยก plan P2) — ตั้งใจ
- F (tabs) → **ไม่อยู่ P1** (แยก plan P3) — ตั้งใจ

**Placeholder scan:** ไม่มี TBD/TODO · ทุก step โค้ดครบ ✓

**Type consistency:**
- `examSets: string[]` ทุกที่ (draft, payload, row, arrayUnion) ✓
- `upsertExamSet → {list, entry}` · `addExamSet → entry|null` · `planImportWrites → {fresh, tagUpdates}` · `tagUpdates[].addSets` ตรงกันข้าม Task 7 wire ✓
- `examSetOptions` (alias ของ `sets`) ใช้ทั้ง Task 7,8 ✓

## Open items ที่ตัดสินแล้วใน plan นี้ (จาก spec)
- ชุดใน JSON ไม่ตรง config → **ตัดทิ้ง** ผ่าน `keepKnownSets` (Task 7) — auto-add เสี่ยง fragmentation
- recompute meta → **ยกไป P2** (P1 ยังไม่มี picker นักศึกษา ไม่ต้องใช้ meta; runImport เรียก recomputeMeta เดิมอยู่แล้ว)
- rules กัน createdBy/source → **ข้าม** (trust-model; save() ตอน update ไม่เขียน field พวกนี้)

## ถัดไป (แยก plan)
- **P2:** buildMeta.examSets + recompute trigger + composite index `isPublished+examSets(CONTAINS)+rand` + QuizView picker (สลับกับหมวด) + gate flag + examSessions.examSet + startZen reset
- **P3:** ยก state คลังเป็น composable → แตก QuestionsView เป็น tabs (✍️เพิ่ม/แก้ · 📚คลัง · 🔍ตรวจสอบ) + filter ชุด/ปีใน questionsFilter.js
