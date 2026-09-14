# ตรวจข้อสอบ: แก้แล้วผ่านเลย — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** ตัด verdict "ผิด/ต้องแก้" ที่แค่ตีธงไม่แก้เนื้อหาออก เหลือ "ถูกต้อง" กับ "แก้แล้ว" (แก้เนื้อหา+ผ่านตรวจในตาเดียว ได้เครดิต ไม่วนกลับเข้าคิว) แก้ปมที่เพื่อนวิชาการบ่นว่าไม่จูงใจ

**Architecture:** เพิ่มฟังก์ชันล้วน `reviewFixResult(uid)` ใน `questionReview.js` เป็นชุดค่าเดียวของ "แก้แล้วผ่าน" คู่กับ `REVIEW_RESET` เดิม แล้วให้ทั้ง 2 เส้นทางเขียนใน `ReviewView.vue` (การ์ดข้อปัจจุบัน + กอง "ไม่ผ่านตรวจ") ใช้ค่านี้แทน `REVIEW_RESET` เวลาแก้ชั้นตัดสิน · เพิ่ม `firestore.rules` ฟังก์ชันใหม่ `isReviewFix()` อนุญาตเขียนเนื้อหา+ตั้งผลเป็น `passed` พร้อมกัน · เครดิตย้อนหลังใช้แพทเทิร์นเดียวกับปุ่ม "🔄 ซิงก์ระบบตรวจ" ที่มีอยู่แล้ว (เติม `reviewedBy` จริงถาวร ไม่ใช่ counter แยก)

**Tech Stack:** Vue 3 (script setup) · Pinia · Firebase Firestore v9 modular · เทส `node:test` + `node:assert/strict`

**สเปกอ้างอิง:** `docs/superpowers/specs/2026-09-14-review-fix-motivation-design.md`

## Global Constraints

- **เทสทั้งรีโป:** `node --test "src/**/*.test.js"` — รันก่อนเริ่มเพื่อจับ baseline ปัจจุบัน ห้ามลดลงหลังงานนี้
- **เทสไฟล์เดียว:** `node --test src/utils/<ชื่อ>.test.js`
- **บิลด์:** `npm run build` — ไม่มี lint/test runner กลาง บิลด์ผ่าน = เกณฑ์ขั้นต่ำของงานฝั่ง `.vue`
- **ต้อง `firebase deploy --only firestore:rules`** ก่อนเทสหน้าเว็บจริง — เพิ่มฟังก์ชัน `isReviewFix()` ใหม่ (ดู Task 2)
- **ห้ามมี `font-size` ต่ำกว่า `.7rem`** ในไฟล์ `.vue`/`.css` (CLAUDE.md) — ตรวจ: `grep -rnE "font-size:\s*\.[0-6][0-9]?rem" src/`
- **ข้อความจากผู้ใช้ทุกช่องต้องผ่าน `cleanText(str, LIMITS.xxx)`** จาก `utils/text.js` ก่อนเขียน Firestore
- **`questions.categories` เป็นค่า derive ห้ามเขียนมือ** — ผ่าน `plePatch(group, sub)` เสมอ (CLAUDE.md ข้อ 14) — งานนี้ไม่แตะหมวด จึงไม่ชนกฎนี้โดยตรง แต่ห้ามลืมตอนแก้ payload
- **VERDICT_LABEL ห้ามลบ key `'fix'`/`'wrong'` เดิมทิ้ง** — ข้อมูลเก่าใน `reviews/{uid}` subcollection ยังมี verdict เหล่านี้อยู่จริง ต้องแสดงผลได้เหมือนเดิม แค่ไม่มี UI ให้สร้างใหม่อีก
- **UI เป็นภาษาไทย** · โทนตาม `docs/voice-guide.md` (เป็นกันเอง อธิบายชัด ไม่หวือหวา)
- **commit format:** `Area: อะไร (ทำไม)` ภาษาไทยปนอังกฤษ · commit บน `master` · **ห้าม push** จนกว่า user จะสั่ง (push = deploy เว็บจริงผ่าน GitHub Actions)
- **QuestionsView.vue (`/questions`) ไม่อยู่ในสโคปนี้** — มันมีเส้นทางแก้ข้อของตัวเอง (บรรทัด 864 `verdictContentChanged` → `REVIEW_RESET` + `lastFixBy`) แต่นั่นคือ "ประตูแก้คลังข้อสอบ" สำหรับผู้แต่งเนื้อหา ไม่ใช่ "ประตูตรวจของ peer-review" ที่เพื่อนวิชาการบ่นถึง — คงพฤติกรรม reset-to-pending ไว้เหมือนเดิมที่นั่น (คนแก้ที่นั่นอาจเป็นผู้แต่งข้อเอง ให้ self-approve ทันทีจะเปิดช่องรับรองข้อของตัวเองแบบไม่มีใครตรวจเลย)

## File Structure

| ไฟล์ | หน้าที่ |
|---|---|
| `src/utils/questionReview.js` | เพิ่ม `reviewFixResult(uid)` + `VERDICT_LABEL.fixed` |
| `src/utils/questionReview.test.js` | เทสของฟังก์ชันใหม่ + อัปเดตเทส label |
| `firestore.rules` | เพิ่ม `isReviewFix(qid)` เข้า `allow update` ของ `questions/{id}` |
| `src/views/ReviewView.vue` | ตัด verdict fix/wrong · เขียนเส้นทาง "แก้แล้วผ่าน" (การ์ดปัจจุบัน + กอง "ไม่ผ่านตรวจ") · ตัดฟีเจอร์ "แก้ผลตรวจที่เพิ่งส่ง" |
| `src/utils/questionTriage.js` | ปรับคำอธิบายกอง "ไม่ผ่านตรวจ" |
| `src/views/AdminView.vue` | ปุ่มเครดิตย้อนหลัง `creditLegacyFixes()` |

**ลำดับ task บังคับ** — 1 → 2 → 3 → 4 → 5 → 6 → 7 (Task 3–5 แก้ `ReviewView.vue` ไฟล์เดียวกันต่อกันเป็นทอด — ต้องทำตามลำดับ)

---

## Task 1: `questionReview.js` — `reviewFixResult(uid)` + verdict label ใหม่

**Files:**
- Modify: `src/utils/questionReview.js`
- Test: `src/utils/questionReview.test.js`

**Interfaces:**
- Consumes: ไม่มี (pure, ไม่ import อะไรเพิ่ม)
- Produces: `reviewFixResult(uid: string) -> { reviewedBy: string[], reviewPass: number, reviewFail: number, reviewStatus: string }` — Task 3/4/7 ใช้ค่านี้แทน `REVIEW_RESET` เวลาแก้แล้วถือว่าผ่าน · `VERDICT_LABEL.fixed`

- [ ] **Step 1: เขียนเทสที่ยังไม่ผ่าน**

เพิ่มในไฟล์ `src/utils/questionReview.test.js` ต่อจากบล็อกเทสของ `REVIEW_RESET` (หลังบรรทัด 109):

```js
// ── reviewFixResult: "แก้แล้ว" นับเป็นตรวจผ่านทันที (ไม่ต้องล้างกลับ pending ให้คนอื่นตรวจซ้ำ) ──
test('reviewFixResult(uid) คืนชุดค่าเดียวของ "แก้แล้วผ่าน" — คนแก้คือคนตรวจ 1 เสียงที่จบข้อทันที', () => {
  const patch = reviewFixResult('me')
  assert.deepEqual(patch, { reviewedBy: ['me'], reviewPass: 1, reviewFail: 0, reviewStatus: 'passed' })
  assert.equal(computeStatus(patch), 'passed')
})
test('reviewFixResult: คนที่แก้ข้อเองไม่มีทางถูกเรียกให้ตรวจข้อนั้นอีก (lastFixBy กันไว้)', () => {
  const q = { ...reviewFixResult('me'), lastFixBy: 'me' }
  assert.equal(needsReviewBy(q, 'me'), false)
  assert.equal(needsReviewBy(q, 'other'), false)   // เกณฑ์ 1 คน/ข้อ: จบไปแล้ว ไม่ต้องมีคนตรวจซ้ำอีกเลย
})
```

แก้บล็อกเทส `label ครบทุก key` (บรรทัด 157-160 เดิม) ให้เพิ่ม `'fixed'` เข้าไปแต่ **ห้ามลบ `'fix'`/`'wrong'`** (ข้อมูลเก่ายังมี verdict พวกนี้จริง ต้องแสดงผลได้):

```js
test('label ครบทุก key', () => {
  for (const k of ['pending', 'passed', 'conflict', 'failed', 'retired']) assert.ok(REVIEW_STATUS_LABEL[k])
  // 'fix'/'wrong' เก็บไว้แสดงผลข้อมูลเก่า แม้ UI จะไม่มีทางสร้าง verdict นี้ใหม่แล้ว
  for (const k of ['correct', 'fix', 'wrong', 'fixed']) assert.ok(VERDICT_LABEL[k])
})
```

แก้ import ที่หัวไฟล์เทสให้ดึง `reviewFixResult` เข้ามาด้วย:

```js
import { computeStatus, needsReviewBy, verdictContentChanged, sideContentChanged, REVIEW_RESET, reviewFixResult, tallyReviewCounts, nextReviewQueue, buildLeaderboard, reviewStatusKey, REVIEW_STATUS_LABEL, VERDICT_LABEL, pickRandom } from './questionReview.js'
```

- [ ] **Step 2: รันเทส ยืนยันว่าพัง**

Run: `node --test src/utils/questionReview.test.js`
Expected: FAIL — `reviewFixResult is not a function` + `VERDICT_LABEL.fixed` เป็น `undefined`

- [ ] **Step 3: เขียนโค้ดจริง**

ใน `src/utils/questionReview.js` เพิ่มต่อจาก `REVIEW_RESET` (บรรทัด 67):

```js
// payload "แก้แล้วผ่าน" — ใช้แทน REVIEW_RESET เวลาคนตรวจแก้ชั้นตัดสินเอง (โจทย์/ตัวเลือก/เฉลย)
// แล้วถือว่าจบการตรวจในตาเดียว ไม่ต้องล้างกลับ pending ให้คนอื่นตรวจซ้ำอีกรอบ (user สั่ง 14 ก.ย. 2026
// แก้ปมที่คนแก้ไม่ได้เครดิต + ข้อวนหาคนใหม่ตรวจ) — cนแก้ = คนตรวจ 1 เสียงที่จบข้อ ตรงเกณฑ์ 1 คน/ข้อ
export function reviewFixResult(uid) {
  return { reviewedBy: [uid], reviewPass: 1, reviewFail: 0, reviewStatus: 'passed' }
}
```

แก้ `VERDICT_LABEL` (บรรทัดที่มี `export const VERDICT_LABEL = ...`) เพิ่ม key ใหม่ **ต่อท้าย** ของเดิม (ห้ามลบ `fix`/`wrong` — ข้อมูลเก่าใน `reviews/{uid}` ยังใช้ label พวกนี้):

```js
export const VERDICT_LABEL = { correct: 'ถูกต้อง', fix: 'ต้องแก้', wrong: 'ผิด', fixed: 'แก้แล้วผ่าน' }
```

- [ ] **Step 4: รันเทส ยืนยันว่าผ่าน**

Run: `node --test src/utils/questionReview.test.js`
Expected: PASS ทั้งไฟล์

- [ ] **Step 5: Commit**

```bash
git add src/utils/questionReview.js src/utils/questionReview.test.js
git commit -m "Review: เพิ่ม reviewFixResult() + verdict 'fixed' (เตรียมทางให้แก้แล้วผ่านตรวจทันที)"
```

---

## Task 2: `firestore.rules` — `isReviewFix()` + deploy

**Files:**
- Modify: `firestore.rules` (บล็อก `match /questions/{id}` บรรทัด 208-262)

**Interfaces:**
- Consumes: ไม่มี (rules ล้วน)
- Produces: เส้นทาง `allow update` ใหม่ที่ Task 3/4 ต้องพึ่ง — ถ้าไม่ deploy ก่อน หน้าเว็บจะเขียนไม่ผ่าน permission ตอนกด "บันทึกการแก้"

- [ ] **Step 1: เพิ่มฟังก์ชัน `isReviewFix()`**

ใน `firestore.rules` เพิ่มต่อจาก `isReviewReset()` (หลังบรรทัด 258 `&& request.resource.data.get('reviewStatus', '') == 'pending';` กับ `}`):

```
      // แก้เนื้อหา + ถือว่าผ่านตรวจทันที (14 ก.ย. 2026) — คนแก้ = คนตรวจ 1 เสียงที่จบข้อ
      // ต้องมี reviews/{uid} ของตัวเองคู่กันเสมอ (เหมือน isReviewSubmit) เป็นหลักฐานว่าใครแก้/ทำไม
      function isReviewFix(qid) {
        return request.resource.data.get('reviewedBy', []) == [request.auth.uid]
          && request.resource.data.get('reviewPass', 0) == 1
          && request.resource.data.get('reviewFail', 0) == 0
          && request.resource.data.get('reviewStatus', '') == 'passed'
          && request.resource.data.get('lastFixBy', '') == request.auth.uid
          && existsAfter(/databases/$(database)/documents/questions/$(qid)/reviews/$(request.auth.uid));
      }
```

แก้บรรทัด `allow update: if canEditQuestions() && (isAdmin() || reviewUntouched() || isReviewSubmit(id) || isReviewAmend(id) || isReviewReset());` เพิ่ม `isReviewFix(id)` เข้าไป:

```
      allow update: if canEditQuestions()
        && (isAdmin() || reviewUntouched() || isReviewSubmit(id) || isReviewAmend(id) || isReviewReset() || isReviewFix(id));
```

- [ ] **Step 2: Deploy rules**

Run: `firebase deploy --only firestore:rules`
Expected: `✔ Deploy complete!` — **ต้องทำก่อน Task 3/4 เทสบนเว็บจริงได้** (client เขียนผ่าน `isReviewFix` ไม่ได้ถ้ายังไม่ deploy)

- [ ] **Step 3: Commit**

```bash
git add firestore.rules
git commit -m "Rules: เพิ่ม isReviewFix() - อนุญาตแก้เนื้อหา+ตั้งผลตรวจเป็น passed พร้อมกันในตาเดียว"
```

---

## Task 3: `ReviewView.vue` — การ์ดข้อปัจจุบัน: ตัด verdict fix/wrong + แก้แล้วผ่านเลย

**Files:**
- Modify: `src/views/ReviewView.vue` — `VERDICTS` (บรรทัด 307-311), template ฟอร์มแก้ (บรรทัด 53-66), template ฟอร์มตรวจ (บรรทัด 112-143), import (บรรทัด 289), state/computed แก้ข้อ (บรรทัด 358-374), `saveEdit()` (บรรทัด 386-446), `canSubmit` (บรรทัด 484-487)

**Interfaces:**
- Consumes: `reviewFixResult` (Task 1) · `LIMITS` (มี import อยู่แล้ว)
- Produces: `fixReason` ref ใหม่ — Task 4 ใช้ชื่อ `triageFixReason` แยกกันคนละ ref (คนละฟอร์ม ไม่ชนกัน)

- [ ] **Step 1: ตัด verdict fix/wrong ออกจากตัวเลือก**

บรรทัด 307-311 แก้จาก:
```js
const VERDICTS = [
  { key: 'correct', label: '✅ ถูกต้อง' },
  { key: 'fix',     label: '🛠️ ต้องแก้' },
  { key: 'wrong',   label: '❌ ผิด' },
]
```
เป็น:
```js
// เหลือ verdict เดียว — เจอปัญหาให้กด "✏️ แก้ข้อนี้" แก้เนื้อหาแล้วนับว่าผ่านตรวจในตาเดียว (ดู saveEdit)
// ไม่มี "ตีว่าผิดไม่แก้" อีกแล้ว (user สั่ง 14 ก.ย. 2026) — เจอปัญหาที่แก้เองไม่ได้ ใช้ "ข้ามข้อนี้" + คอมเมนต์แทน
const VERDICTS = [
  { key: 'correct', label: '✅ ถูกต้อง' },
]
```

- [ ] **Step 2: เพิ่ม import `reviewFixResult`**

บรรทัด 289 แก้จาก:
```js
import { computeStatus, nextReviewQueue, needsReviewBy, buildLeaderboard, VERDICT_LABEL, pickRandom, REVIEW_RESET, verdictContentChanged, sideContentChanged } from '../utils/questionReview.js'
```
เป็น:
```js
import { computeStatus, nextReviewQueue, needsReviewBy, buildLeaderboard, VERDICT_LABEL, pickRandom, REVIEW_RESET, reviewFixResult, verdictContentChanged, sideContentChanged } from '../utils/questionReview.js'
```

- [ ] **Step 3: เพิ่ม `fixReason` ref + บังคับกรอกก่อนบันทึกตอนแก้ชั้นตัดสิน**

บรรทัด 358-374 แก้จาก:
```js
const editing = ref(false)
const editDraft = ref(null)
const savingEdit = ref(false)
const commentsOpen = ref(false)   // กล่องคอมเมนต์ — mount เมื่อกางเท่านั้น (ดูหมายเหตุที่ template)
const retiring = ref(false)

const editPayload = computed(() => (editing.value && editDraft.value) ? draftPayload(editDraft.value) : null)
// 🔑 ฐานเปรียบเทียบต้อง normalize ด้วยสูตรเดียวกับฝั่งที่จะเขียน (draftFrom → draftPayload)
//    เทียบกับ doc ดิบตรงๆ ไม่ได้: ข้อเก่าที่มีช่องว่างหัวท้าย / ตัวเลือกว่างคาไว้ / โจทย์ยาวเกิน
//    LIMITS จะ "ต่าง" ตั้งแต่เปิดฟอร์มโดยยังไม่มีใครพิมพ์ ⇒ ป้ายส้มขึ้นหลอก แล้วกดบันทึก
//    ก็โยนงานตรวจให้ทั้งทีมฟรีๆ
const editBase = computed(() => current.value ? draftPayload(draftFrom(current.value)) : null)
// แก้แบบนี้แล้วข้อจะวนเข้าคิวไหม — ใช้ทั้งตัดสินเส้นทางเขียนและขึ้นป้ายเตือนก่อนกด
const editRequeues = computed(() => !!editPayload.value && verdictContentChanged(editBase.value, editPayload.value))
const editTouched = computed(() =>
  !!editPayload.value && (editRequeues.value || sideContentChanged(editBase.value, editPayload.value)))
const canSaveEdit = computed(() => !!editPayload.value && draftValid(editDraft.value) && editTouched.value)

function openEdit() {
  if (!current.value) return
  editDraft.value = draftFrom(current.value)
  editing.value = true
  // ปิดกล่องคอมเมนต์ก่อนกางฟอร์ม — <details v-if="!editing"> unmount ทั้งก้อน ถ้าปล่อยค้างเปิดไว้
  // พอกดยกเลิก QuestionComments จะ mount ใหม่แล้วยิงอ่านคอมเมนต์ซ้ำฟรีอีกรอบ
  commentsOpen.value = false
}
function closeEdit() { editing.value = false; editDraft.value = null }
```
เป็น (เพิ่ม `fixReason` ref + เงื่อนไขบังคับใน `canSaveEdit` + ล้างค่าตอนปิดฟอร์ม):
```js
const editing = ref(false)
const editDraft = ref(null)
const savingEdit = ref(false)
const commentsOpen = ref(false)   // กล่องคอมเมนต์ — mount เมื่อกางเท่านั้น (ดูหมายเหตุที่ template)
const retiring = ref(false)
// "แก้อะไร/ทำไม" — บังคับกรอกเฉพาะตอนแก้ชั้นตัดสิน (editRequeues) เพราะการบันทึกครั้งนั้นคือการตรวจ
// ที่จบในตาเดียว (ดู saveEdit) ต้องมีเหตุผลให้คนตรวจรอบถัดไปเห็นเหมือนกับ reason ของฟอร์มตรวจหลัก
const fixReason = ref('')

const editPayload = computed(() => (editing.value && editDraft.value) ? draftPayload(editDraft.value) : null)
// 🔑 ฐานเปรียบเทียบต้อง normalize ด้วยสูตรเดียวกับฝั่งที่จะเขียน (draftFrom → draftPayload)
//    เทียบกับ doc ดิบตรงๆ ไม่ได้: ข้อเก่าที่มีช่องว่างหัวท้าย / ตัวเลือกว่างคาไว้ / โจทย์ยาวเกิน
//    LIMITS จะ "ต่าง" ตั้งแต่เปิดฟอร์มโดยยังไม่มีใครพิมพ์ ⇒ ป้ายส้มขึ้นหลอก แล้วกดบันทึก
//    ก็โยนงานตรวจให้ทั้งทีมฟรีๆ
const editBase = computed(() => current.value ? draftPayload(draftFrom(current.value)) : null)
// แก้แบบนี้แล้วข้อจะนับว่าผ่านตรวจทันทีไหม (แทนที่จะ "วนเข้าคิว" แบบเดิม) — ใช้ทั้งตัดสินเส้นทางเขียน
// และขึ้นป้ายเตือนก่อนกด (ชื่อตัวแปรคงไว้ตามเดิมเพื่อลด diff แต่ความหมายเปลี่ยนจาก "จะวนคิว" เป็น "จะนับว่าผ่านตรวจ")
const editRequeues = computed(() => !!editPayload.value && verdictContentChanged(editBase.value, editPayload.value))
const editTouched = computed(() =>
  !!editPayload.value && (editRequeues.value || sideContentChanged(editBase.value, editPayload.value)))
const canSaveEdit = computed(() => !!editPayload.value && draftValid(editDraft.value) && editTouched.value
  && (!editRequeues.value || !!fixReason.value.trim()))

function openEdit() {
  if (!current.value) return
  editDraft.value = draftFrom(current.value)
  editing.value = true
  fixReason.value = ''
  // ปิดกล่องคอมเมนต์ก่อนกางฟอร์ม — <details v-if="!editing"> unmount ทั้งก้อน ถ้าปล่อยค้างเปิดไว้
  // พอกดยกเลิก QuestionComments จะ mount ใหม่แล้วยิงอ่านคอมเมนต์ซ้ำฟรีอีกรอบ
  commentsOpen.value = false
}
function closeEdit() { editing.value = false; editDraft.value = null; fixReason.value = '' }
```

- [ ] **Step 4: เพิ่มช่องเหตุผลในฟอร์มแก้ + แก้ข้อความคำเตือน**

บรรทัด 53-66 แก้จาก:
```html
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
เป็น:
```html
        <div v-else class="rv-editbox">
          <QuestionEditor v-model="editDraft" compact />
          <template v-if="editRequeues">
            <label class="rv-label">แก้อะไร/ทำไม (บังคับ)</label>
            <textarea v-model="fixReason" :maxlength="LIMITS.reviewReason" class="rv-input" rows="3" placeholder="สรุปสั้นๆ ว่าแก้ตรงไหน เพราะอะไร…"></textarea>
          </template>
          <div class="rv-edit-hint" :class="editRequeues ? 'requeue' : 'stay'">
            <template v-if="editRequeues">✅ บันทึกแล้ว = ตรวจผ่านทันที (นับเป็นข้อที่คุณตรวจแล้ว)</template>
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
(class `.requeue`/`.stay` ของ `.rv-edit-hint` เก็บชื่อเดิมไว้ — สีส้ม/เขียวยังใช้ได้ตรงความหมายใหม่พอดี ไม่ต้องแก้ CSS)

- [ ] **Step 5: เขียน `saveEdit()` เส้นทางใหม่**

บรรทัด 386-446 แก้ทั้งฟังก์ชันจาก (branch `if (requeue) { ... }`) เป็น:
```js
async function saveEdit() {
  if (!canSaveEdit.value || savingEdit.value || !current.value || !myUid.value) return
  const q = current.value
  const uid = myUid.value
  const u = authStore.userData || {}
  const fixerName = cleanText(u.realName || u.nickname || u.name || 'ไม่ระบุ', LIMITS.reviewerName)
  const payload = editPayload.value
  const isFix = editRequeues.value
  if (!(await confirm(isFix
    ? 'บันทึกการแก้?\nนับว่าคุณตรวจข้อนี้ผ่านแล้ว ไม่ต้องรอคนอื่นตรวจซ้ำ'
    : 'บันทึกคำอธิบาย / หมายเหตุ?\nผลตรวจเดิมยังอยู่ ตรวจต่อได้เลย'))) return
  savingEdit.value = true
  const oldStatus = computeStatus(q)
  try {
    if (isFix) {
      const fixReasonText = cleanText(fixReason.value, LIMITS.reviewReason)
      // rules ผ่านทาง isReviewFix() — เขียนเนื้อหา + ตั้งผลตรวจเป็น passed พร้อมกันในตาเดียว
      await updateDoc(doc(db, 'questions', q.id), {
        ...payload,
        ...reviewFixResult(uid),
        reviewVerdicts: deleteField(),
        retired: deleteField(),   // แก้เนื้อหา = ตั้งใจนำกลับมาใช้
        lastFixBy: uid, lastFixByName: fixerName, lastFixAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
      // หลักฐานว่าใครแก้/ทำไม — เก็บที่เดียวกับผลตรวจปกติ (reviews/{uid}) ให้กล่อง
      // "รอบก่อนแก้ ตกเพราะ" ของรอบถัดไปเห็นได้เหมือนผลตรวจทั่วไป
      await setDoc(doc(db, 'questions', q.id, 'reviews', uid), {
        reviewerUid: uid, reviewerName: fixerName, verdict: 'fixed',
        reason: fixReasonText, ref: '', ts: serverTimestamp(),
      })
      usage.track(0, 2)
      // เครดิต leaderboard เสมอไม่ว่าสถานะเดิมจะเป็นอะไร (นี่คือใจความหลักของงานนี้)
      // progress ขยับเฉพาะตอนสถานะเปลี่ยนจริง (กันคีย์ซ้ำ 'passed' ชนกันเองถ้า oldStatus เป็น 'passed' อยู่แล้ว)
      try {
        await setDoc(doc(db, 'reviewMeta', 'main'), {
          counts: { [uid]: increment(1) }, names: { [uid]: fixerName },
          ...(oldStatus !== 'passed' ? { progress: { [oldStatus]: increment(-1), passed: increment(1) } } : {}),
        }, { merge: true })
        usage.track(0, 1)
        meta.value = {
          counts: { ...(meta.value.counts || {}), [uid]: ((meta.value.counts || {})[uid] || 0) + 1 },
          names: { ...(meta.value.names || {}), [uid]: fixerName },
          progress: bumpedProgress(oldStatus, 'passed'),
        }
      } catch (e) { console.error('[reviewMeta fix bump]', e) }   // พลาดตรงนี้ต้องไม่ทำให้การแก้ล้ม
      patchTriageRow(q.id, {
        ...payload, ...reviewFixResult(uid), retired: false,
        lastFixBy: uid, lastFixByName: fixerName, lastFixAt: new Date(),   // local ใช้ Date จริง
      })
      fixReason.value = ''
      closeEdit()
      toast('แก้และตรวจผ่านแล้ว ขอบคุณ!', 'success')
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

- [ ] **Step 6: ลดเงื่อนไข `canSubmit`**

บรรทัด 484-487 แก้จาก:
```js
const canSubmit = computed(() =>
  !!verdict.value
  && (verdict.value === 'correct' || !!reason.value.trim())
  && isPleGroupKey(ple.value.group))
```
เป็น (verdict มีทางเดียวคือ `'correct'` แล้ว ไม่ต้องมีเงื่อนไข reason บังคับอีก):
```js
const canSubmit = computed(() => !!verdict.value && isPleGroupKey(ple.value.group))
```

- [ ] **Step 7: แก้ label ช่องเหตุผลในฟอร์มตรวจหลัก**

บรรทัด 125 แก้จาก:
```html
          <label class="rv-label">เหตุผล (บังคับเมื่อ "ต้องแก้ / ผิด")</label>
```
เป็น (verdict เดียวคือ "ถูกต้อง" แล้ว เหตุผลไม่มีทางบังคับอีก):
```html
          <label class="rv-label">เหตุผล (ไม่บังคับ)</label>
```

- [ ] **Step 8: บิลด์ตรวจว่าไม่มี syntax error**

Run: `npm run build`
Expected: build สำเร็จ ไม่มี error

- [ ] **Step 9: Commit**

```bash
git add src/views/ReviewView.vue
git commit -m "Review: การ์ดข้อปัจจุบัน - ตัด verdict ต้องแก้/ผิด แก้แล้วนับผ่านตรวจในตาเดียว (ไม่วนคิว)"
```

---

## Task 4: `ReviewView.vue` — กอง "ไม่ผ่านตรวจ": แก้แล้วผ่านเลยเหมือนกัน

**Files:**
- Modify: `src/views/ReviewView.vue` — template กอง failed (บรรทัด 219-242), `openFix()`/`saveFix()` (บรรทัด 562-615)

**Interfaces:**
- Consumes: `reviewFixResult` (Task 1, import มาแล้วจาก Task 3 Step 2)
- Produces: `triageFixReason` ref ใหม่ (แยกจาก `fixReason` ของ Task 3 — คนละฟอร์ม)

- [ ] **Step 1: เพิ่ม ref เหตุผลแยกของฟอร์มนี้**

หาบรรทัด `const fixId = ref(null)` (ราวบรรทัด 562) เพิ่มต่อจากนั้น:
```js
const fixId = ref(null)
const fixDraft = ref(null)
const fixSaving = ref(false)
const triageFixReason = ref('')   // "แก้อะไร/ทำไม" บังคับกรอกก่อนบันทึก — คนละช่องกับฟอร์มการ์ดข้อปัจจุบัน
```

- [ ] **Step 2: ล้าง `triageFixReason` ตอนเปิด/ปิดแผงแก้**

`openFix()` แก้จาก:
```js
function openFix(q) {
  if (fixId.value === q.id) { fixId.value = null; fixDraft.value = null; return }
  fixId.value = q.id
  fixDraft.value = draftFrom(q)
}
```
เป็น:
```js
function openFix(q) {
  if (fixId.value === q.id) { fixId.value = null; fixDraft.value = null; triageFixReason.value = ''; return }
  fixId.value = q.id
  fixDraft.value = draftFrom(q)
  triageFixReason.value = ''
}
```

- [ ] **Step 3: เพิ่มช่องเหตุผลในฟอร์มแถว + บังคับกรอกก่อนกดบันทึก**

บรรทัด 232-242 แก้จาก:
```html
                    <div v-if="k === 'failed' && fixId === q.id && fixDraft" class="rv-fix">
                      <QuestionEditor v-model="fixDraft" compact />
                      <p class="rv-fix-note">
                        🔄 บันทึกแล้วข้อนี้กลับเข้าคิวให้คนอื่นตรวจ — คุณจะไม่ได้ตรวจข้อนี้
                      </p>
                      <button
                        class="rv-btn rv-primary rv-fix-save"
                        :disabled="!draftValid(fixDraft) || fixSaving"
                        @click="saveFix(q)"
                      >{{ fixSaving ? 'กำลังบันทึก…' : 'บันทึกการแก้' }}</button>
                    </div>
```
เป็น:
```html
                    <div v-if="k === 'failed' && fixId === q.id && fixDraft" class="rv-fix">
                      <QuestionEditor v-model="fixDraft" compact />
                      <label class="rv-label">แก้อะไร/ทำไม (บังคับ)</label>
                      <textarea v-model="triageFixReason" :maxlength="LIMITS.reviewReason" class="rv-input" rows="3" placeholder="สรุปสั้นๆ ว่าแก้ตรงไหน เพราะอะไร…"></textarea>
                      <p class="rv-fix-note">
                        ✅ บันทึกแล้ว = ตรวจผ่านทันที (นับเป็นข้อที่คุณตรวจแล้ว)
                      </p>
                      <button
                        class="rv-btn rv-primary rv-fix-save"
                        :disabled="!draftValid(fixDraft) || !triageFixReason.trim() || fixSaving"
                        @click="saveFix(q)"
                      >{{ fixSaving ? 'กำลังบันทึก…' : 'บันทึกการแก้' }}</button>
                    </div>
```

- [ ] **Step 4: เขียน `saveFix()` เส้นทางใหม่**

บรรทัด 572-615 แก้ทั้งฟังก์ชันเป็น:
```js
async function saveFix(q) {
  if (fixSaving.value || fixId.value !== q.id || !fixDraft.value) return
  if (!draftValid(fixDraft.value) || !triageFixReason.value.trim() || !myUid.value) return
  const uid = myUid.value
  const u = authStore.userData || {}
  const fixerName = cleanText(u.realName || u.nickname || u.name || 'ไม่ระบุ', LIMITS.reviewerName)
  const payload = draftPayload(fixDraft.value)
  const fixReasonText = cleanText(triageFixReason.value, LIMITS.reviewReason)
  if (!(await confirm('บันทึกการแก้?\nนับว่าคุณตรวจข้อนี้ผ่านแล้ว ไม่ต้องรอคนอื่นตรวจซ้ำ'))) return
  fixSaving.value = true
  const oldStatus = computeStatus(q)
  try {
    // rules ผ่านทาง isReviewFix() — เขียนเนื้อหา + ตั้งผลตรวจเป็น passed พร้อมกันในตาเดียว
    await updateDoc(doc(db, 'questions', q.id), {
      ...payload,
      ...reviewFixResult(uid),
      reviewVerdicts: deleteField(),
      retired: deleteField(),   // แก้เนื้อหา = ตั้งใจนำกลับมาใช้
      lastFixBy: uid, lastFixByName: fixerName, lastFixAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    await setDoc(doc(db, 'questions', q.id, 'reviews', uid), {
      reviewerUid: uid, reviewerName: fixerName, verdict: 'fixed',
      reason: fixReasonText, ref: '', ts: serverTimestamp(),
    })
    usage.track(0, 2)
    try {
      await setDoc(doc(db, 'reviewMeta', 'main'), {
        counts: { [uid]: increment(1) }, names: { [uid]: fixerName },
        ...(oldStatus !== 'passed' ? { progress: { [oldStatus]: increment(-1), passed: increment(1) } } : {}),
      }, { merge: true })
      usage.track(0, 1)
      meta.value = {
        counts: { ...(meta.value.counts || {}), [uid]: ((meta.value.counts || {})[uid] || 0) + 1 },
        names: { ...(meta.value.names || {}), [uid]: fixerName },
        progress: bumpedProgress(oldStatus, 'passed'),
      }
    } catch (e) { console.error('[reviewMeta fix bump]', e) }   // พลาดตรงนี้ต้องไม่ทำให้การแก้ล้ม
    patchTriageRow(q.id, {
      ...payload, ...reviewFixResult(uid), retired: false,
      lastFixBy: uid, lastFixByName: fixerName, lastFixAt: new Date(),   // local ใช้ Date จริง
    })   // computeStatus กลับเป็น passed → แถวหลุดกอง 🔴 ทันที ไม่ต้องรอโหลดใหม่
    if (fixId.value === q.id) { fixId.value = null; fixDraft.value = null; triageFixReason.value = '' }
    toast('แก้และตรวจผ่านแล้ว ขอบคุณ!', 'success')
  } catch (e) { console.error('[triage fix]', e); toast('บันทึกไม่สำเร็จ', 'error') }
  finally { fixSaving.value = false }
}
```

- [ ] **Step 5: บิลด์**

Run: `npm run build`
Expected: build สำเร็จ

- [ ] **Step 6: Commit**

```bash
git add src/views/ReviewView.vue
git commit -m "Review: กอง 'ไม่ผ่านตรวจ' - แก้แล้วผ่านเลยเหมือนการ์ดข้อปัจจุบัน (เส้นทางเดียวกัน)"
```

---

## Task 5: `ReviewView.vue` — ตัดฟีเจอร์ "แก้ผลตรวจที่เพิ่งส่ง"

**Files:**
- Modify: `src/views/ReviewView.vue` — template (บรรทัด 155-176), state (บรรทัด 328-334), `openAmend()`/`canAmend` (บรรทัด 506-514), `submit()` (บรรทัด 883-891), `submitAmend()` (บรรทัด 908-982), CSS (บรรทัด 1092-1096)

**Interfaces:**
- Consumes: ไม่มี
- Produces: ไม่มี (ลบเท่านั้น — verdict มีทางเดียวคือ "ถูกต้อง" แล้ว ไม่มีอะไรให้สลับไป — user เคาะให้ตัดทิ้ง 14 ก.ย. 2026)

- [ ] **Step 1: ลบบล็อก template "เพิ่งส่ง"**

ลบทั้งบล็อกบรรทัด 155-176:
```html
      <!-- ── แถบแก้ผลตรวจที่เพิ่งส่ง (session เดียว หายเมื่อรีโหลด) ── -->
      <div v-if="lastSubmit" class="rv-last">
        ...
      </div>
```

- [ ] **Step 2: ลบ state ที่เกี่ยวข้อง**

บรรทัด 328-334 ลบ:
```js
// ข้อที่เพิ่งส่งในเซสชันนี้ — ให้กดแก้ได้ถ้ากดพลาด (หายเมื่อรีโหลดหน้า)
const lastSubmit = ref(null)     // { qid, qhash, verdict, reason, ref, questionText }
const amending = ref(false)      // กำลังเปิดฟอร์มแก้อยู่ไหม
const amendVerdict = ref(null)
const amendReason = ref('')
const amendRef = ref('')
```

- [ ] **Step 3: ลบ `openAmend()`/`canAmend`**

ลบบรรทัด 506-514:
```js
function openAmend() {
  amendVerdict.value = lastSubmit.value?.verdict || null
  amendReason.value = lastSubmit.value?.reason || ''
  amendRef.value = lastSubmit.value?.ref || ''
  amending.value = true
}
// เหตุผลบังคับเฉพาะผลที่ไม่ผ่าน (เหมือนฟอร์มหลัก)
const canAmend = computed(() =>
  !!amendVerdict.value && (amendVerdict.value === 'correct' || !!amendReason.value.trim()))
```

- [ ] **Step 4: ลบการอ้าง `lastSubmit`/amend ใน `submit()`**

ในฟังก์ชัน `submit()` หา block:
```js
    if (!already) {
      meta.value = {
        counts: { ...(meta.value.counts || {}), [uid]: ((meta.value.counts || {})[uid] || 0) + 1 },
        names: { ...(meta.value.names || {}), [uid]: reviewerName },
        progress: bumpedProgress(oldStatusLocal, newStatus),
      }
      lastSubmit.value = {
        qid: q.id, qhash: q.qhash || null, verdict: v,
        reason: reason.value, ref: refText.value,
        questionText: truncate60(q.question),
      }
      // ข้อใหม่แล้ว — ปิดฟอร์มแก้ที่อาจค้างเปิดจากข้อก่อนหน้า กันเผลอบันทึกเวอร์ดิกต์เก่าทับข้อใหม่
      amending.value = false
      amendVerdict.value = null; amendReason.value = ''; amendRef.value = ''
    }
```
แก้เป็น:
```js
    if (!already) {
      meta.value = {
        counts: { ...(meta.value.counts || {}), [uid]: ((meta.value.counts || {})[uid] || 0) + 1 },
        names: { ...(meta.value.names || {}), [uid]: reviewerName },
        progress: bumpedProgress(oldStatusLocal, newStatus),
      }
    }
```

- [ ] **Step 5: ลบ `submitAmend()` ทั้งฟังก์ชัน**

ลบทั้งฟังก์ชัน `submitAmend()` (บรรทัด 908-982 เดิม — ตั้งแต่ comment `// แก้ผลตรวจของตัวเอง...` จนถึงปิด `}` ท้ายฟังก์ชันก่อน `</script>`)

- [ ] **Step 6: ลบ CSS ที่เกี่ยวข้อง**

ลบ:
```css
.rv-last { background: #fffdf7; border: 2px dashed rgba(0,0,0,.18); border-radius: 14px; padding: 11px 13px; margin-bottom: 16px; }
.rv-last-top { display: flex; align-items: center; gap: 10px; justify-content: space-between; font-size: .76rem; color: rgba(0,0,0,.65); line-height: 1.4; }
.rv-mini { flex-shrink: 0; border: 2px solid var(--ink); border-radius: 9px; padding: 5px 11px; font-family: inherit; font-size: .72rem; font-weight: 800; background: #fff; color: var(--ink); cursor: pointer; }
.rv-last-form { margin-top: 10px; }
.rv-last-form .rv-input { margin-bottom: 6px; }
```
⚠️ **เก็บ `.rv-mini` ไว้** — ใช้ที่อื่นทั่วหน้า (ปุ่ม "แก้ข้อนี้", "นำออก" ฯลฯ) มีแค่ `.rv-last`/`.rv-last-top`/`.rv-last-form`/`.rv-last-form .rv-input` ที่ลบได้จริง

- [ ] **Step 7: บิลด์ + grep เช็คไม่มีคำอ้างค้าง**

Run: `npm run build`
Expected: build สำเร็จ

Run: `grep -n "lastSubmit\|amending\|amendVerdict\|amendReason\|amendRef\|submitAmend\|openAmend\|canAmend" src/views/ReviewView.vue`
Expected: ไม่มีผลลัพธ์เลย (ลบครบ)

- [ ] **Step 8: Commit**

```bash
git add src/views/ReviewView.vue
git commit -m "Review: ตัดฟีเจอร์ 'แก้ผลตรวจที่เพิ่งส่ง' - verdict เหลือทางเดียวแล้วไม่มีอะไรให้สลับ"
```

---

## Task 6: `questionTriage.js` — ปรับคำอธิบายกอง "ไม่ผ่านตรวจ"

**Files:**
- Modify: `src/utils/questionTriage.js` (บรรทัด 40-43)

**Interfaces:**
- Consumes: ไม่มี
- Produces: ไม่มี (แก้ string เดียว — ไม่กระทบเทสที่มีอยู่ เพราะไม่มีเทสเช็ค `hint` string)

- [ ] **Step 1: แก้ข้อความ**

บรรทัด 40-43 แก้จาก:
```js
  failed: {
    icon: '🔴', label: 'ไม่ผ่านตรวจ',
    hint: 'คนตรวจบอกว่าต้องแก้หรือผิด — กด "✏️ แก้ข้อนี้" ในแถวได้เลย บันทึกแล้วข้อจะกลับเข้าคิวตรวจเอง',
  },
```
เป็น:
```js
  failed: {
    icon: '🔴', label: 'ไม่ผ่านตรวจ',
    hint: 'ของเก่าก่อนเปลี่ยนระบบตรวจ (11 ก.ย. 2026) — กด "✏️ แก้ข้อนี้" ในแถวได้เลย บันทึกแล้วนับว่าผ่านตรวจทันที กองนี้จะค่อยๆ หมดไปเอง',
  },
```

- [ ] **Step 2: รันเทสทั้งไฟล์ที่เกี่ยวข้อง (เผื่อมีเทส regression)**

Run: `node --test src/utils/questionTriage.test.js` (ถ้ามีไฟล์นี้อยู่ — ถ้าไม่มีให้ข้าม step นี้)
Expected: PASS หรือไม่มีไฟล์เทส (ไม่มี regression)

- [ ] **Step 3: Commit**

```bash
git add src/utils/questionTriage.js
git commit -m "Triage: ปรับคำอธิบายกอง 'ไม่ผ่านตรวจ' ให้ตรงกับพฤติกรรมใหม่ (แก้แล้วผ่านทันที)"
```

---

## Task 7: `AdminView.vue` — ปุ่มเครดิตย้อนหลังงานแก้ไข

**Files:**
- Modify: `src/views/AdminView.vue` — import (บรรทัด 494), template (ต่อจากบรรทัด 122-123 ในบล็อก "ตรวจข้อสอบ"), script (ต่อจาก `migratePleGroups()`)

**Interfaces:**
- Consumes: `reviewFixResult`, `computeStatus`, `reviewStatusKey`, `tallyReviewCounts` จาก `utils/questionReview.js` (`reviewFixResult` เป็นตัวใหม่ต้องเพิ่มเข้า import — ตัวอื่นมีอยู่แล้วที่บรรทัด 494)
- Produces: ปุ่ม "🧮 ให้เครดิตย้อนหลังงานแก้ไข" ในหน้า Admin — ไม่มีอะไรให้ task อื่นต่อจากนี้ (task สุดท้าย)

- [ ] **Step 1: เพิ่ม import**

บรรทัด 494 แก้จาก:
```js
import { computeStatus, reviewStatusKey, tallyReviewCounts } from '../utils/questionReview.js'
```
เป็น:
```js
import { computeStatus, reviewStatusKey, tallyReviewCounts, reviewFixResult } from '../utils/questionReview.js'
```

- [ ] **Step 2: เพิ่มปุ่มในหน้า Admin**

ต่อจากบรรทัด 123 (`<div v-if="pleReport" ...>{{ pleReport }}</div>`) ในบล็อก "ตรวจข้อสอบ (วิชาการ)" เพิ่ม:
```html
        <div class="admin-hint" style="margin-top:12px">
          <b>เครดิตย้อนหลังงานแก้ไข</b> — ก่อนเปลี่ยนเป็น "แก้แล้ว = ผ่านเลย" (14 ก.ย. 2026) คนที่แก้ข้อ
          ผ่านหน้าตรวจไม่ได้เครดิตในตัวนับ "ใครตรวจกี่ข้อ" เลย — กดปุ่มนี้ครั้งเดียวให้ย้อนไปเติมให้
          กดซ้ำได้ ปลอดภัย (ข้อที่เคยให้เครดิตแล้วจะไม่ถูกเลือกมาให้ซ้ำ)
        </div>
        <button class="btn-mini" :disabled="creditingFixes" @click="creditLegacyFixes">
          {{ creditingFixes ? 'กำลังให้เครดิต…' : '🧮 ให้เครดิตย้อนหลังงานแก้ไข' }}
        </button>
        <div v-if="creditReport" class="admin-hint" style="margin-top:8px">{{ creditReport }}</div>
```

- [ ] **Step 3: เขียนฟังก์ชัน `creditLegacyFixes()`**

ต่อจากท้ายฟังก์ชัน `migratePleGroups()` ที่มีอยู่แล้ว เพิ่ม:
```js
// เครดิตย้อนหลัง: คนที่แก้ข้อสอบผ่านหน้าตรวจไปแล้ว (lastFixBy) ก่อนเปลี่ยนระบบเป็น
// "แก้แล้ว = ผ่านเลย" (14 ก.ย. 2026) ไม่เคยถูกนับเป็นคนตรวจเลยตอนนั้น (saveEdit/saveFix เดิม
// เขียนแค่ REVIEW_RESET ไม่แตะ reviewMeta) — เติม lastFixBy เข้า reviewedBy จริงถาวร (ไม่ใช่ counter
// แยก) ให้ tallyReviewCounts() นับได้เองตลอดไป ทนต่อการกดปุ่ม "🔄 ซิงก์ระบบตรวจ" ซ้ำในอนาคต
// ⚠️ idempotent โดยตัวมันเอง — ข้อที่ lastFixBy อยู่ใน reviewedBy แล้ว (เคยไมเกรตไปแล้ว) จะไม่ถูกเลือกมาแก้อีก
const creditingFixes = ref(false)
const creditReport = ref('')
async function creditLegacyFixes() {
  if (creditingFixes.value) return
  creditingFixes.value = true
  creditReport.value = ''
  try {
    const snap = await getDocs(collection(db, 'questions'))
    const all = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    const toCredit = all.filter(q => q.lastFixBy && !(q.reviewedBy || []).includes(q.lastFixBy))
    for (let i = 0; i < toCredit.length; i += 450) {
      const batch = writeBatch(db)
      for (const q of toCredit.slice(i, i + 450)) {
        // สถานะยังเป็น pending = ไม่มีใครตรวจซ้ำตั้งแต่แก้ → ตั้งเป็นผ่านให้เลย (เหมือนใช้ isReviewFix จริง)
        // สถานะอื่นแล้ว (มีคนตรวจซ้ำไปแล้ว) → เติมแค่ reviewedBy ให้เครดิต ไม่แตะผลที่ตัดสินไปแล้ว
        const patch = computeStatus(q) === 'pending'
          ? reviewFixResult(q.lastFixBy)
          : { reviewedBy: [...(q.reviewedBy || []), q.lastFixBy] }
        batch.update(doc(db, 'questions', q.id), patch)
        Object.assign(q, patch)   // สะท้อนเข้า `all` ให้ progress/counts ข้างล่างเห็นค่าใหม่
      }
      await batch.commit()
    }
    usage.track(snap.size, toCredit.length)
    // recompute progress + counts จากคลังที่แพตช์แล้วทั้งก้อน — แพทเทิร์นเดียวกับ syncReviewSystem()
    const progress = { pending: 0, passed: 0, failed: 0, conflict: 0, retired: 0 }
    for (const q of all) { const key = reviewStatusKey(q); if (key in progress) progress[key]++ }
    const metaRef = doc(db, 'reviewMeta', 'main')
    await runTransaction(db, async (tx) => {
      const cur = await tx.get(metaRef)
      // ชื่อ: คนที่เคยแก้แต่ไม่เคยกด "ถูกต้อง" ผ่าน submit() เลย จะไม่มีชื่ออยู่ใน reviewMeta.names
      // มาก่อน — ไม่เติมจะโชว์เป็น "ไม่ระบุ" ใน leaderboard ทั้งที่มีตัวเลขแล้ว
      const names = { ...(cur.exists() ? (cur.data().names || {}) : {}) }
      for (const q of all) { if (q.lastFixBy && q.lastFixByName) names[q.lastFixBy] = q.lastFixByName }
      tx.set(metaRef, { counts: tallyReviewCounts(all), names, progress })
    })
    usage.track(0, 1)
    creditReport.value = toCredit.length
      ? `ให้เครดิตย้อนหลังแล้ว ${toCredit.length} ข้อ`
      : 'ไม่มีข้อที่ต้องให้เครดิตย้อนหลัง (ให้ไปแล้วหมด หรือยังไม่มีคนแก้)'
    toast(creditReport.value, 'success')
  } catch (e) { console.error('[credit legacy fixes]', e); toast('ให้เครดิตย้อนหลังไม่สำเร็จ', 'error') }
  finally { creditingFixes.value = false }
}
```

- [ ] **Step 4: บิลด์**

Run: `npm run build`
Expected: build สำเร็จ

- [ ] **Step 5: Commit**

```bash
git add src/views/AdminView.vue
git commit -m "Admin: เพิ่มปุ่มให้เครดิตย้อนหลังงานแก้ไข (ก่อนเปลี่ยนเป็นแก้แล้วผ่านเลย)"
```

---

## Self-Review (ทำแล้วตอนเขียนแผน)

- **Spec coverage:** verdict เหลือ 2 ทาง (Task 3) · rules `isReviewFix` (Task 2) · เครดิตย้อนหลังเติม `reviewedBy` จริง (Task 7) · ตัดฟีเจอร์ amend (Task 5) · กอง failed ใช้เส้นทางเดียวกัน (Task 4) · reason บังคับ (Task 3/4) — ครบทุกข้อในสเปก
- **Type consistency:** `reviewFixResult(uid)` นิยามครั้งเดียวใน Task 1 ใช้ชื่อเดิมทุกที่ (Task 3/4/7) · `fixReason` (การ์ดข้อปัจจุบัน) กับ `triageFixReason` (กอง failed) แยกชื่อกันชัดเจน ไม่ชนกัน
- **ไม่มี placeholder** — ทุก step มีโค้ดเต็ม ไม่มี "เหมือน Task N" ให้เดา

## หลังจบทุก Task — เทสมือบนเว็บจริง (ต้องล็อกอิน academic/admin)

1. `/review` — กด "✏️ แก้ข้อนี้" จากการ์ดข้อปัจจุบัน แก้โจทย์ พิมพ์เหตุผล กดบันทึก → ต้องขึ้น toast "แก้และตรวจผ่านแล้ว" + leaderboard ตัวเองขยับ +1 + ข้อไม่กลับมาให้ตรวจอีก
2. กด "🗂️ ดูรายการ" → กองไม่ผ่านตรวจ (ถ้ามีของเก่า) → "✏️ แก้ข้อนี้" ในแถว → กรอกเหตุผลบังคับ → บันทึก → แถวหายจากกอง 🔴
3. แก้แค่คำอธิบาย/หมายเหตุ (ไม่แตะโจทย์/ตัวเลือก/เฉลย) → ต้องไม่ขอเหตุผล ไม่นับเครดิต อยู่ข้อเดิมตรวจต่อได้
4. ส่งผลตรวจ "✅ ถูกต้อง" ปกติ → ต้องไม่มีแถบ "เพิ่งส่ง...แก้ผลตรวจ" ขึ้นมาอีกแล้ว
5. Admin → กด "🧮 ให้เครดิตย้อนหลังงานแก้ไข" → เช็ค leaderboard ที่ `/review` ว่าคนที่เคยแก้ข้อไปก่อนหน้านี้ขึ้นชื่อ+ตัวเลขถูก (ไม่ใช่ "ไม่ระบุ") → กดปุ่มซ้ำอีกครั้ง ต้องได้ "ไม่มีข้อที่ต้องให้เครดิตย้อนหลัง"
