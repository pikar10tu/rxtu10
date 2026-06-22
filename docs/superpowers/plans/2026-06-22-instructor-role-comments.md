# Role "อาจารย์" (instructor) + คอมเมนต์รายข้อ — Implementation Plan (SP1)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** เพิ่ม role `instructor` (อาจารย์เป็น guest ที่แก้คลังข้อสอบได้แต่แตะเหรียญไม่ได้) + ระบบคอมเมนต์รายข้อ (thread วิชาการ↔อาจารย์ นักศึกษาไม่เห็น)

**Architecture:** role เป็น field เดิมบน user doc รับค่าใหม่ `'instructor'` · gate ใหม่ `isQuestionEditor` (frontend) / `canEditQuestions()` (rules) ครอบเฉพาะคลังข้อสอบ+คอมเมนต์ · คอมเมนต์เก็บใน subcollection `questions/{qid}/comments` โหลด lazy ตอนกาง panel · `isAcademic` คงเดิม (ยังคุม mint/broadcast/report)

**Tech Stack:** Vue 3 `<script setup>` + Pinia + Firebase Firestore (client SDK) · pure utils + `node --test` · firestore.rules deploy ผ่าน firebase CLI

## Global Constraints
- เขียน user doc ผ่าน `auth.patchUser` เท่านั้น — **แต่คอมเมนต์อยู่ใน subcollection (ไม่ใช่ user doc) → เขียนด้วย Firestore SDK ตรงได้** (addDoc/deleteDoc)
- ข้อความจากผู้ใช้ทุกช่องผ่าน `cleanText(str, LIMITS.xxx)` ก่อนเขียนเสมอ
- emoji แสดงผ่าน `<Emoji :char>` (ยกเว้นใน JS string/label สั้น) — แต่ใน component ใหม่นี้ใช้ตัวอักษร emoji ตรงใน label เล็ก ๆ ได้ (โทสต์/ปุ่ม) ตามแพทเทิร์นเดิม
- ไม่มี test runner กลาง — UI verify ด้วย `npm run build` · pure util verify ด้วย `node --test src/utils/<x>.test.js`
- commit รูปแบบ `Area: อะไร (ทำไม)` ไทยปนอังกฤษ
- **แก้ firestore.rules ต้อง `firebase deploy --only firestore:rules` เสมอ** ไม่งั้นไม่มีผล
- `isAcademic` (auth.js + rules) **ห้ามแตะ** — คงเป็น `isAdmin || role==='academic'`

---

### Task 1: Role plumbing — userSchema comment + auth computeds

**Files:**
- Modify: `src/data/userSchema.js:47`
- Modify: `src/stores/auth.js:36-37` (เพิ่ม computeds ใต้ isAcademic) + `:232` (export)

**Interfaces:**
- Produces: `authStore.isInstructor` (computed bool), `authStore.isQuestionEditor` (computed bool) — Task 5/6 ใช้

- [ ] **Step 1: ขยายคอมเมนต์ role ใน userSchema**

แก้ `src/data/userSchema.js` บรรทัด ~47:
```js
  role: 'student',                            // 'student' | 'academic' | 'instructor' | 'admin'
```

- [ ] **Step 2: เพิ่ม computeds ใน auth.js**

ใน `src/stores/auth.js` หลังบรรทัด `isAcademic` (~37) เพิ่ม:
```js
    // Instructor — อาจารย์ (เข้ามาเป็น guest) ที่แก้คลังข้อสอบได้ แต่ไม่ใช่ isAcademic
    // (จึงเสกจดหมาย/แจกเหรียญ/broadcast/ตัดสิน report ไม่ได้)
    const isInstructor = computed(() => userData.value?.role === 'instructor')
    // Gate แก้คลังข้อสอบ + คอมเมนต์ (ทีมวิชาการ OR อาจารย์)
    const isQuestionEditor = computed(() => isAcademic.value || isInstructor.value)
```

- [ ] **Step 3: export computeds ใหม่**

ใน return object (~232) แก้บรรทัด getters ให้รวม 2 ตัวใหม่:
```js
        isLoggedIn, isAdmin, isAcademic, isInstructor, isQuestionEditor, isLinked, incomeBonusPct,
```

- [ ] **Step 4: verify build**

Run: `npm run build`
Expected: `✓ built` ไม่มี error

- [ ] **Step 5: commit**

```bash
git add src/data/userSchema.js src/stores/auth.js
git commit -m "Auth: role instructor + gate isQuestionEditor (อาจารย์แก้ข้อสอบได้ ไม่แตะเหรียญ)"
```

---

### Task 2: Pure util `questionComments` + LIMITS.comment

**Files:**
- Modify: `src/utils/text.js:28-39` (เพิ่ม `comment` ใน LIMITS)
- Create: `src/utils/questionComments.js`
- Test: `src/utils/questionComments.test.js`

**Interfaces:**
- Consumes: `cleanText`, `LIMITS` จาก `./text.js`
- Produces:
  - `buildComment({ text, uid, name, role }) → { text, authorUid, authorName, authorRole } | null` (ไม่มี createdAt)
  - `sortComments(list) → array` (เรียงเก่า→ใหม่ ตาม createdAt, pending ไว้ท้าย)

- [ ] **Step 1: เพิ่ม LIMITS.comment**

ใน `src/utils/text.js` ใน object `LIMITS` (หลัง `explanation: 1000,`) เพิ่ม:
```js
  comment: 1000,
```

- [ ] **Step 2: เขียนเทสที่ยังไม่ผ่าน**

สร้าง `src/utils/questionComments.test.js`:
```js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildComment, sortComments } from './questionComments.js'

test('buildComment trims + เก็บ field ครบ ไม่มี createdAt', () => {
  const c = buildComment({ text: '  hi  ', uid: 'u1', name: 'A', role: 'instructor' })
  assert.equal(c.text, 'hi')
  assert.equal(c.authorUid, 'u1')
  assert.equal(c.authorName, 'A')
  assert.equal(c.authorRole, 'instructor')
  assert.equal('createdAt' in c, false)
})

test('buildComment คืน null ถ้า text ว่างหลัง clean', () => {
  assert.equal(buildComment({ text: '   ', uid: 'u1' }), null)
  assert.equal(buildComment({ text: '', uid: 'u1' }), null)
})

test('buildComment cap ที่ LIMITS.comment (1000)', () => {
  const c = buildComment({ text: 'x'.repeat(2000), uid: 'u1' })
  assert.equal(c.text.length, 1000)
})

test('buildComment default field ที่ขาด', () => {
  const c = buildComment({ text: 'hi' })
  assert.equal(c.authorUid, '')
  assert.equal(c.authorName, 'ไม่ระบุ')
  assert.equal(c.authorRole, 'student')
})

test('sortComments เรียงเก่า→ใหม่ pending ท้ายสุด', () => {
  const list = [
    { text: 'c', createdAt: { seconds: 300 } },   // 300000ms
    { text: 'a', createdAt: { seconds: 100 } },   // 100000ms
    { text: 'pending', createdAt: null },          // Infinity
    { text: 'b', createdAt: 200000 },              // 200000ms (number=ms)
  ]
  assert.deepEqual(sortComments(list).map(c => c.text), ['a', 'b', 'c', 'pending'])
})

test('sortComments ทน non-array', () => {
  assert.deepEqual(sortComments(null), [])
})
```

- [ ] **Step 3: รันเทส ยืนยันว่า fail**

Run: `node --test src/utils/questionComments.test.js`
Expected: FAIL — `Cannot find module './questionComments.js'`

- [ ] **Step 4: เขียน implementation**

สร้าง `src/utils/questionComments.js`:
```js
// คอมเมนต์รายข้อ (thread วิชาการ↔อาจารย์) — pure helpers + เทส
import { cleanText, LIMITS } from './text.js'

// สร้าง object คอมเมนต์ (ไม่มี createdAt — caller เติม serverTimestamp ตอนเขียน)
// คืน null ถ้า text ว่างหลัง clean (กันคอมเมนต์เปล่า)
export function buildComment({ text, uid, name, role }) {
  const clean = cleanText(text, LIMITS.comment)
  if (!clean) return null
  return {
    text: clean,
    authorUid: uid || '',
    authorName: name || 'ไม่ระบุ',
    authorRole: role || 'student',
  }
}

// เรียงเก่า→ใหม่ ตาม createdAt — รองรับ Firestore Timestamp ({seconds}/toMillis),
// number (ms), และ null/pending (serverTimestamp ยังไม่ลง → ไว้ท้ายสุด)
export function sortComments(list) {
  const ms = (c) => {
    const t = c && c.createdAt
    if (!t) return Infinity
    if (typeof t === 'number') return t
    if (typeof t.toMillis === 'function') return t.toMillis()
    if (typeof t.seconds === 'number') return t.seconds * 1000
    return Infinity
  }
  return [...(Array.isArray(list) ? list : [])].sort((a, b) => ms(a) - ms(b))
}
```

- [ ] **Step 5: รันเทส ยืนยันผ่าน**

Run: `node --test src/utils/questionComments.test.js`
Expected: PASS ทั้ง 6 เทส

- [ ] **Step 6: commit**

```bash
git add src/utils/text.js src/utils/questionComments.js src/utils/questionComments.test.js
git commit -m "Util: questionComments (buildComment/sortComments pure + เทส) + LIMITS.comment"
```

---

### Task 3: firestore.rules — canEditQuestions + comments subcollection (⚠️ deploy)

**Files:**
- Modify: `firestore.rules:36-38` (เพิ่ม helper), `:147-150` (questions block)

**Interfaces:**
- Produces: rules `canEditQuestions()` + read/create comments — Task 4 (component) พึ่งพา

- [ ] **Step 1: เพิ่ม helper canEditQuestions ใต้ isAcademic()**

ใน `firestore.rules` หลัง function `isAcademic()` (ปิดที่บรรทัด ~38) เพิ่ม:
```
    function canEditQuestions() {
      return isAcademic() || (request.auth != null && myRole() == 'instructor');
    }
```

- [ ] **Step 2: แก้ questions block + เพิ่ม comments subcollection**

แทนที่ block `match /questions/{id}` (บรรทัด ~147-150) ด้วย:
```
    // ── Question bank — editable by Academic Team + Instructors (อาจารย์) ──
    match /questions/{id} {
      allow read:  if request.auth != null && (resource.data.get('isPublished', false) == true || canEditQuestions());
      allow write: if canEditQuestions();

      // ── Comments (SP1) — thread วิชาการ↔อาจารย์ ต่อข้อ (นักศึกษาเข้าไม่ถึง) ──
      match /comments/{commentId} {
        allow read, create: if canEditQuestions();
        allow update, delete: if isAdmin()
          || (request.auth != null && request.auth.uid == resource.data.get('authorUid', ''));
      }
    }
```
> `questionReports`, mail create, achievements **ไม่แตะ** (คงเป็น `isAcademic()` — อาจารย์เข้าไม่ถึง)

- [ ] **Step 3: deploy rules**

Run: `firebase deploy --only firestore:rules`
Expected: `✔  Deploy complete!` (หรือ `rules file ... compiled successfully` + released)

- [ ] **Step 4: commit**

```bash
git add firestore.rules
git commit -m "Rules: canEditQuestions (instructor แก้ข้อสอบได้) + comments subcollection (academic+instructor อ่าน/เขียน)"
```

---

### Task 4: `QuestionComments.vue` — thread component (lazy)

**Files:**
- Create: `src/components/questions/QuestionComments.vue`

**Interfaces:**
- Consumes: `buildComment`, `sortComments` (Task 2) · `authStore.currentUser/userData` · `LIMITS.comment`
- Produces: `<QuestionComments :questionId="..." />` — Task 5 ใช้ · โหลด comments ตอน `onMounted` (component render เฉพาะตอนกาง → lazy)

- [ ] **Step 1: สร้าง component**

สร้าง `src/components/questions/QuestionComments.vue`:
```vue
<template>
  <div class="qc">
    <div v-if="loading" class="qc-empty">กำลังโหลด…</div>
    <template v-else>
      <ul v-if="comments.length" class="qc-list">
        <li v-for="c in comments" :key="c.id" class="qc-item">
          <div class="qc-meta">
            <span class="qc-author">{{ c.authorName }}</span>
            <span class="qc-role">{{ roleIcon(c.authorRole) }}</span>
            <span class="qc-time">{{ fmtTime(c.createdAt) }}</span>
            <button v-if="c.authorUid === uid" class="qc-del" title="ลบคอมเมนต์" @click="removeComment(c)">✕</button>
          </div>
          <div class="qc-text">{{ c.text }}</div>
        </li>
      </ul>
      <div v-else class="qc-empty">ยังไม่มีคอมเมนต์ — เริ่มสนทนาได้เลย</div>
    </template>
    <div class="qc-form">
      <textarea v-model="draft" :maxlength="LIMITS.comment" rows="2" class="qc-input" placeholder="พิมพ์คอมเมนต์ถึงทีม…"></textarea>
      <button class="qc-send" :disabled="sending || !draft.trim()" @click="send">ส่ง</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { collection, addDoc, deleteDoc, doc, getDocs, query, orderBy, serverTimestamp } from 'firebase/firestore'
import { db } from '../../firebase/config.js'
import { useAuthStore } from '../../stores/auth.js'
import { useToast } from '../../composables/useToast.js'
import { useConfirm } from '../../composables/useConfirm.js'
import { LIMITS } from '../../utils/text.js'
import { buildComment, sortComments } from '../../utils/questionComments.js'

const props = defineProps({ questionId: { type: String, required: true } })
const authStore = useAuthStore()
const { toast } = useToast()
const { confirm } = useConfirm()

const comments = ref([])
const loading = ref(true)
const sending = ref(false)
const draft = ref('')
const uid = authStore.currentUser?.uid

const colRef = () => collection(db, 'questions', props.questionId, 'comments')

async function load() {
  loading.value = true
  try {
    const snap = await getDocs(query(colRef(), orderBy('createdAt', 'asc')))
    comments.value = sortComments(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  } catch (e) {
    console.error('[comments load]', e); toast('โหลดคอมเมนต์ไม่สำเร็จ', 'error')
  } finally { loading.value = false }
}

async function send() {
  const payload = buildComment({
    text: draft.value, uid,
    name: authStore.userData?.nickname,
    role: authStore.userData?.role || 'student',
  })
  if (!payload) return
  sending.value = true
  try {
    const added = await addDoc(colRef(), { ...payload, createdAt: serverTimestamp() })
    comments.value.push({ id: added.id, ...payload, createdAt: Date.now() })
    draft.value = ''
  } catch (e) {
    console.error('[comment send]', e); toast('ส่งคอมเมนต์ไม่สำเร็จ', 'error')
  } finally { sending.value = false }
}

async function removeComment(c) {
  if (!(await confirm('ลบคอมเมนต์นี้?'))) return
  try {
    await deleteDoc(doc(db, 'questions', props.questionId, 'comments', c.id))
    comments.value = comments.value.filter(x => x.id !== c.id)
  } catch (e) { console.error('[comment del]', e); toast('ลบไม่สำเร็จ', 'error') }
}

function roleIcon(r) {
  return r === 'admin' ? '👑' : r === 'academic' ? '🎓' : r === 'instructor' ? '🩺' : ''
}
function fmtTime(t) {
  const ms = (t && t.seconds) ? t.seconds * 1000 : (typeof t === 'number' ? t : null)
  if (!ms) return ''
  return new Date(ms).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })
}

onMounted(load)
</script>

<style scoped>
.qc { margin-top: 8px; border-top: 1px dashed var(--border); padding-top: 8px; }
.qc-list { list-style: none; display: flex; flex-direction: column; gap: 8px; margin: 0 0 8px; padding: 0; }
.qc-item { background: rgba(0,0,0,.03); border-radius: 10px; padding: 7px 9px; }
.qc-meta { display: flex; align-items: center; gap: 6px; font-size: .62rem; color: var(--muted); }
.qc-author { font-weight: 800; color: var(--ink); }
.qc-time { margin-left: auto; }
.qc-del { border: none; background: none; cursor: pointer; color: var(--muted); font-size: .72rem; padding: 0 2px; }
.qc-text { font-size: .8rem; margin-top: 3px; white-space: pre-wrap; word-break: break-word; }
.qc-empty { font-size: .72rem; color: var(--muted); padding: 6px 0; }
.qc-form { display: flex; gap: 6px; align-items: flex-end; }
.qc-input { flex: 1; resize: vertical; border: 1.5px solid var(--border); border-radius: 10px; padding: 6px 8px; font: inherit; font-size: .8rem; }
.qc-send { flex-shrink: 0; border: none; background: var(--primary); color: #fff; font-weight: 700; border-radius: 10px; padding: 8px 14px; cursor: pointer; font-size: .78rem; }
.qc-send:disabled { opacity: .5; }
</style>
```
> หมายเหตุ: `useToast`/`useConfirm` คืน `{ toast }`/`{ confirm }` — ยืนยันรูปแบบกับไฟล์ composable ถ้าต่าง (ดู QuestionsView ที่ใช้ `const { toast } = useToast()` / `const { confirm } = useConfirm()`)

- [ ] **Step 2: verify build**

Run: `npm run build`
Expected: `✓ built` ไม่มี error (ยังไม่ถูก import ที่ไหน = build ผ่านเฉย ๆ)

- [ ] **Step 3: commit**

```bash
git add src/components/questions/QuestionComments.vue
git commit -m "Comments: QuestionComments.vue — thread รายข้อ โหลด lazy + ลบของตัวเอง"
```

---

### Task 5: QuestionsView — guard isQuestionEditor + ปุ่ม 💬 ต่อข้อ + ซ่อน report จากอาจารย์

**Files:**
- Modify: `src/views/QuestionsView.vue` — `:8` (guard), `:57` (ซ่อน report), `:213-216` (ปุ่ม 💬), `:224` (panel), `:234-251` (import), `:375` (onMounted), + ref ใหม่

**Interfaces:**
- Consumes: `authStore.isQuestionEditor` (Task 1), `<QuestionComments>` (Task 4)

- [ ] **Step 1: import component + ref**

ใน `<script setup>` เพิ่ม import (ใกล้ import component อื่น ๆ ~235):
```js
import QuestionComments from '../components/questions/QuestionComments.vue'
```
เพิ่ม ref (ใกล้ ref state อื่น ๆ เช่นหลัง `const selected = ...`):
```js
const commentOpenId = ref(null)
```

- [ ] **Step 2: เปลี่ยน guard เป็น isQuestionEditor**

บรรทัด ~8:
```html
    <div v-if="!authStore.isQuestionEditor" class="qz-denied">
```
บรรทัด ~375 (onMounted):
```js
onMounted(() => { if (authStore.isQuestionEditor) load() })
```

- [ ] **Step 3: ซ่อน report panel จากอาจารย์ (คง isAcademic)**

บรรทัด ~57 เพิ่ม `v-if="authStore.isAcademic"`:
```html
      <details v-if="authStore.isAcademic" class="qz-reports" @toggle="onReportsToggle">
```

- [ ] **Step 4: เพิ่มปุ่ม 💬 + panel ต่อข้อ**

แก้ `.qz-item-actions` (บรรทัด ~213-216):
```html
            <div class="qz-item-actions">
              <button class="qz-mini" @click="commentOpenId = commentOpenId === q.id ? null : q.id">💬</button>
              <button class="qz-mini" @click="edit(q)">แก้ไข</button>
              <button class="qz-mini qz-danger" @click="remove(q)">ลบ</button>
            </div>
```
เพิ่ม panel ต่อจาก `.qz-exp` (บรรทัด ~224) ก่อนปิด `</li>`:
```html
          <div v-if="q.explanation" class="qz-exp"><Emoji char="💡" /> {{ q.explanation }}</div>
          <QuestionComments v-if="commentOpenId === q.id" :questionId="q.id" />
```

- [ ] **Step 5: verify build**

Run: `npm run build`
Expected: `✓ built` ไม่มี error

- [ ] **Step 6: commit**

```bash
git add src/views/QuestionsView.vue
git commit -m "Questions: เปิดให้อาจารย์ (isQuestionEditor) + ปุ่มคอมเมนต์ต่อข้อ + ซ่อน report จากอาจารย์"
```

---

### Task 6: StudyView — ลิงก์คลังข้อสอบให้อาจารย์เห็น

**Files:**
- Modify: `src/views/StudyView.vue` (ลิงก์ `.sv-acadlink` → เปลี่ยนเงื่อนไข)

**Interfaces:**
- Consumes: `authStore.isQuestionEditor` (Task 1)

- [ ] **Step 1: เปลี่ยนเงื่อนไขลิงก์**

แก้ลิงก์ "จัดการคลังข้อสอบ" จาก:
```html
      <RouterLink v-if="authStore.isAcademic" to="/questions" class="sv-quizlink sv-acadlink">
```
เป็น:
```html
      <RouterLink v-if="authStore.isQuestionEditor" to="/questions" class="sv-quizlink sv-acadlink">
```

- [ ] **Step 2: verify build**

Run: `npm run build`
Expected: `✓ built` ไม่มี error

- [ ] **Step 3: commit**

```bash
git add src/views/StudyView.vue
git commit -m "Study: ลิงก์จัดการคลังข้อสอบ โชว์ให้อาจารย์ด้วย (isQuestionEditor)"
```

---

### Task 7: AdminView — ปุ่มตั้งอาจารย์ + badge

**Files:**
- Modify: `src/views/AdminView.vue` — `:113-128` (ปุ่ม role-actions), `:477-479` (roleLabel), `<style>` (badge)

**Interfaces:**
- Consumes: `setRole(m, role)` เดิม (`:523`, เขียน role string ใดก็ได้), `roleLabel(role)` เดิม
- members light object มี `accountType`/`guestStatus` (cache v3) ใช้ guard ปุ่มได้

- [ ] **Step 1: roleLabel เพิ่มเคส instructor**

แก้ฟังก์ชัน `roleLabel` (บรรทัด ~477):
```js
function roleLabel(role) {
  return role === 'admin' ? '👑 แอดมิน'
    : role === 'academic' ? '🎓 วิชาการ'
    : role === 'instructor' ? '🩺 อาจารย์'
    : 'สมาชิก'
}
```

- [ ] **Step 2: เพิ่มปุ่มตั้ง/ถอนอาจารย์ ใน role-actions**

ใน `.role-actions` (หลังปุ่ม + วิชาการ / − เอาออก ของ academic, ก่อนปุ่ม 🏷️ บรรทัด ~127) เพิ่ม:
```html
                <button
                  v-if="m.accountType === 'guest' && m.guestStatus === 'approved' && m.role !== 'instructor'"
                  class="btn-mini btn-gold"
                  :disabled="savingUid === m.uid || m.role === 'admin'"
                  @click="setRole(m, 'instructor')"
                ><Emoji char="🩺" /> อาจารย์</button>
                <button
                  v-else-if="m.role === 'instructor'"
                  class="btn-mini btn-gray"
                  :disabled="savingUid === m.uid"
                  @click="setRole(m, 'student')"
                >− ถอนอาจารย์</button>
```
> ปุ่มนี้โผล่เฉพาะ guest ที่ approved แล้ว (กัน strand) · ตัด instructor ออก = กลับเป็น 'student'

- [ ] **Step 3: เพิ่ม badge style instructor**

ใน `<style scoped>` ใกล้ ๆ rule `.role-badge` / `.role-academic` เดิม (ถ้าไม่มี ให้เพิ่มต่อท้าย style) เพิ่ม:
```css
.role-badge.role-instructor { background: #fff7ed; color: #9a3412; }
```

- [ ] **Step 4: verify build**

Run: `npm run build`
Expected: `✓ built` ไม่มี error

- [ ] **Step 5: commit**

```bash
git add src/views/AdminView.vue
git commit -m "Admin: ปุ่มตั้ง/ถอนอาจารย์ (instructor) สำหรับ guest ที่อนุมัติแล้ว + badge"
```

---

## Final verification (หลังครบทุก task)
- [ ] `node --test src/utils/questionComments.test.js` → เขียวทั้ง 6 เทส
- [ ] `npm run build` → `✓ built` ไม่มี error
- [ ] ยืนยัน rules deploy แล้ว (Task 3 Step 3 สำเร็จ)
- [ ] (manual หลัง push/deploy — ต้องบัญชีจริง) admin ตั้ง guest เป็นอาจารย์ → อาจารย์เห็นลิงก์คลังข้อสอบใน Study → แก้ข้อ+คอมเมนต์ได้ · นักศึกษาไม่เห็นคอมเมนต์/ลิงก์ · อาจารย์ broadcast/report ไม่ได้

## หมายเหตุ deploy
- push master = auto-deploy frontend (GitHub Actions)
- **rules deploy แยก** (Task 3) — ทำก่อน push เพื่อให้ instructor/comments ใช้ได้จริงตอน frontend ขึ้น
- ทดสอบ interactive (ตั้งอาจารย์/คอมเมนต์) ต้องบัญชี Google จริง — user ทำเอง
