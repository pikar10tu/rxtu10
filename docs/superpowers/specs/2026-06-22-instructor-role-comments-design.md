# Spec: Role "อาจารย์" (instructor) + คอมเมนต์รายข้อ — SP1

วันที่: 2026-06-22 · สถานะ: **ดีไซน์อนุมัติแล้ว** (เคาะกับเจ้าของโปรเจกต์ในเซสชัน)

## ที่มา & เป้าหมาย
อยากให้ทีมวิชาการทำงานคลังข้อสอบง่ายขึ้น และเปิดทางให้ "อาจารย์" เข้ามาช่วยตรวจ/แก้ข้อสอบได้ โดยอาจารย์เข้าระบบในฐานะ **guest** (ไม่มีรหัสนักศึกษา). **ยังไม่มีอาจารย์เข้ามาจริง — งานนี้คือเตรียมระบบรอไว้ให้พร้อม.**

นี่คือ **sub-project 1 (SP1)** ของแผนใหญ่ "Academic/Instructor workflow". SP2 = สถิติข้อสอบ (ภาพรวมคลัง + รายข้อ %ถูก + report) จะ design แยกทีหลัง (มีประเด็น cost การเก็บข้อมูลตอนนักศึกษาตอบ).

## ขอบเขต (scope)
**ทำ:** role ใหม่ `instructor` (เป็น guest + role) · gate แยก `isQuestionEditor` (แก้คลังข้อสอบ + คอมเมนต์) · คอมเมนต์รายข้อ (thread วิชาการ+อาจารย์คุยกัน นักศึกษาไม่เห็น) · ปุ่มตั้งอาจารย์ใน AdminView · ปรับทางเข้า QuestionsView ให้ instructor เห็น
**ไม่ทำ (defer/นอกขอบเขต):** สถิติข้อสอบทุกชนิด (= SP2) · count badge บนปุ่มคอมเมนต์ (กัน read; ทำ denormalized counter ทีหลังถ้าต้องการ) · ให้อาจารย์ broadcast mail / ตัดสิน report / แจก achievement (คงเป็น `isAcademic` เท่านั้น)

---

## Decisions (เคาะแล้ว)

### 1. อาจารย์ทำอะไรได้
- **แก้ข้อสอบได้เต็มที่** (เหมือนวิชาการ) — เพิ่ม/แก้/เผยแพร่ข้อสอบ
- **คอมเมนต์รายข้อ** — thread สนทนา วิชาการ ↔ อาจารย์ (นักศึกษาไม่เห็น/ไม่เขียน)
- **ทำไม่ได้:** เสกจดหมาย/แจกเหรียญ (mail mint), broadcast, ตัดสิน report, แจก achievement → เพราะอาจารย์เป็น guest นอกรุ่น ให้สิทธิ์แตะเหรียญเสี่ยงเกิน

### 2. โมเดล role / สิทธิ์ — **gate แยก ไม่ขยาย `isAcademic`**
- `userSchema.role` รับค่าใหม่ `'instructor'` (ค่า default ยัง `'student'`; ค่าที่เป็นไปได้ = `student | academic | instructor | admin`)
- **`isAcademic` คงนิยามเดิม** = `isAdmin || role==='academic'` (ยังคุม mail mint / broadcast / report resolve / achievement)
- **gate ใหม่ `isQuestionEditor`** = `isAcademic || role==='instructor'` → ครอบเฉพาะ **แก้คลังข้อสอบ + คอมเมนต์**
- 2 แกนแยกกัน: `accountType` (เข้ามายังไง: student/guest) · `role` (สิทธิ์). อาจารย์ = `accountType:'guest'` + `guestStatus:'approved'` + `role:'instructor'`

### 3. คอมเมนต์ — subcollection
- `questions/{qid}/comments/{cid}` — thread เล็กต่อข้อ
- โหลด **lazy** ตอนกาง panel คอมเมนต์ของข้อนั้น → ไม่กิน read ถ้าไม่เปิด
- **ไม่มี count badge** ใน v1 (โชว์ count ต้องอ่าน — ขัดเป้า cost)

### 4. การสร้างอาจารย์
- อาจารย์ login Google → กรอกชื่อ+เหตุผลแบบ guest → **admin อนุมัติ (guestStatus='approved')** → **admin ติ๊ก "ตั้งเป็นอาจารย์" (role='instructor')**
- reuse flow guest + role management เดิมใน AdminView (ไม่สร้าง flow ใหม่)

---

## งานที่ต้องทำ (ราย task)

### Task 1 — `src/data/userSchema.js`: รับ role ใหม่
- อัปเดตคอมเมนต์ของ field `role` ให้ครอบ `'instructor'` (line ~47: `'student' | 'academic' | 'instructor' | 'admin'`)
- ไม่ต้องเพิ่ม field ใหม่ (role มีอยู่แล้ว, default `'student'` คงเดิม)

### Task 2 — `src/stores/auth.js`: gate ใหม่
- เพิ่ม computed:
  - `isInstructor = computed(() => userData.value?.role === 'instructor')`
  - `isQuestionEditor = computed(() => isAcademic.value || isInstructor.value)`
- **`isAcademic` ไม่แตะ** (ยัง `isAdmin || role==='academic'`)
- export `isInstructor`, `isQuestionEditor` เพิ่มใน return object (จุดเดียวกับ `isAdmin, isAcademic`)

### Task 3 — `firestore.rules`: helper + ใช้กับ questions/comments (⚠️ ต้อง deploy)
- เพิ่ม helper ใต้ `isAcademic()`:
  ```
  function canEditQuestions() {
    return isAcademic() || (request.auth != null && myRole() == 'instructor');
  }
  ```
- `match /questions/{id}`:
  - `allow read:` เปลี่ยน `isAcademic()` → `canEditQuestions()` (อาจารย์อ่านข้อยังไม่เผยแพร่ได้)
  - `allow write:` เปลี่ยน `isAcademic()` → `canEditQuestions()`
- เพิ่ม subcollection ภายใน `match /questions/{id}`:
  ```
  match /comments/{commentId} {
    allow read, create: if canEditQuestions();
    allow update, delete: if isAdmin()
      || (request.auth != null && request.auth.uid == resource.data.get('authorUid', ''));
  }
  ```
- **`questionReports` / mail create / achievements คงไว้ `isAcademic()` เดิม** (อาจารย์แตะไม่ได้)
- หลังแก้: `firebase deploy --only firestore:rules`

### Task 4 — `src/utils/questionComments.js` (pure + เทส)
- `buildComment({ text, uid, name, role })` → object `{ text: cleanText(text, LIMITS.comment), authorUid: uid, authorName: name, authorRole: role }` (**pure ล้วน ไม่มี createdAt** — caller spread กับ `createdAt: serverTimestamp()` ตอนเขียน เพื่อให้เทสได้ deterministic) · คืน `null`/`false` ถ้า text ว่างหลัง clean (กันคอมเมนต์เปล่า)
- `sortComments(list)` → เรียงเก่า→ใหม่ ตาม createdAt (ทน createdAt เป็น null/pending)
- เพิ่ม `comment: 1000` ใน `LIMITS` (`src/utils/text.js`)
- `questionComments.test.js`: clean/trim/ตัดความยาว, sort เสถียร, ทน field ขาด — รันด้วย `node --test`

### Task 5 — `src/components/questions/QuestionComments.vue`
- props: `questionId`
- โหลด comments **เมื่อ mount** (component นี้ render เฉพาะตอนกาง panel) จาก `questions/{qid}/comments` orderBy createdAt
- แสดง thread (ชื่อ+role badge+ข้อความ+เวลา) + ช่องพิมพ์ + ปุ่มส่ง → `addDoc` ผ่าน `buildComment` + `serverTimestamp()`
- ปุ่มลบของคอมเมนต์ตัวเอง (own) — **มีใน v1** (deleteDoc, rules อนุญาตเจ้าของ/admin) · ยืนยันก่อนลบด้วย useConfirm
- เขียนผ่าน Firestore SDK ตรง (ไม่ใช่ patchUser — ไม่ใช่ user doc) · cleanText ก่อนเขียนเสมอ
- scoped style · emoji ผ่าน `<Emoji>`

### Task 6 — `src/views/QuestionsView.vue`: ทางเข้า + ปุ่มคอมเมนต์
- เปลี่ยน guard 2 จุด: `v-if="!authStore.isAcademic"` (qz-denied, line ~8) และ `onMounted(() => { if (authStore.isAcademic) load() })` (line ~375) → ใช้ **`isQuestionEditor`**
- panel report ในหน้านี้ (🚩 group) **คงเงื่อนไข `isAcademic`** (อาจารย์ไม่เห็น report-resolve เพราะ rules report = isAcademic)
- ต่อข้อ: ปุ่ม 💬 toggle เปิด/ปิด `<QuestionComments :questionId="q.id" />` (mount=โหลด lazy) · ไม่มี count badge

### Task 7 — `src/views/StudyView.vue`: ลิงก์คลังข้อสอบให้อาจารย์เห็น
- เปลี่ยนเงื่อนไขลิงก์ "จัดการคลังข้อสอบ" จาก `v-if="authStore.isAcademic"` → `v-if="authStore.isQuestionEditor"`

### Task 8 — `src/views/AdminView.vue`: ปุ่มตั้งอาจารย์
- ในรายการ guest **ที่ approved แล้ว** (หรือใน role management) เพิ่มปุ่ม toggle:
  - "🩺 ตั้งเป็นอาจารย์" → set `role: 'instructor'` · "เอาออก" → set `role: 'student'`
  - เงื่อนไข: ทำได้เฉพาะ guest ที่ `guestStatus==='approved'` (กัน strand) — ปุ่มไม่โผล่ถ้ายัง pending
- `roleLabel`: เพิ่มเคส `role==='instructor'` → `'🩺 อาจารย์'` · role badge class `role-instructor`
- reuse กลไก set role เดิม (เขียน users doc, rules อนุญาต admin เปลี่ยน role อยู่แล้ว)

---

## Acceptance criteria
- [ ] admin ตั้ง guest (approved) เป็น `role:'instructor'` ได้จาก AdminView + เห็น badge 🩺 อาจารย์
- [ ] บัญชี instructor: เห็นลิงก์ "จัดการคลังข้อสอบ" ใน Study → เข้า QuestionsView ได้ (ไม่โดน qz-denied) → เพิ่ม/แก้/เผยแพร่ข้อสอบได้จริง
- [ ] บัญชี instructor: **broadcast mail / ตัดสิน report ไม่ได้** (rules ปฏิเสธ — เป็น isAcademic)
- [ ] คอมเมนต์: วิชาการ+อาจารย์ เปิด panel 💬 ต่อข้อ → เห็น+โพสต์ thread ได้ · ลบคอมเมนต์ตัวเองได้ (ยืนยันก่อนลบ) · นักศึกษาเข้าไม่ถึง (rules ปฏิเสธ read/create)
- [ ] บัญชี instructor: **ไม่เห็น panel report** (🚩) ในหน้าจัดการข้อสอบ (ซ่อนด้วย isAcademic)
- [ ] คอมเมนต์โหลด **เฉพาะตอนกาง panel** (ไม่ยิง read ตอนเปิดหน้า/ตอนไม่กาง)
- [ ] นักศึกษาทั่วไป: ไม่เห็นลิงก์คลังข้อสอบ, ไม่เห็นปุ่มคอมเมนต์, พฤติกรรมเดิมทุกอย่าง
- [ ] `npm run build` ผ่าน + `node --test src/utils/questionComments.test.js` เขียว
- [ ] deploy rules แล้ว (`firebase deploy --only firestore:rules`) ก่อนทดสอบจริง

## หมายเหตุ / กับดัก
- **ต้อง deploy rules** ไม่งั้น read/write comments + read ข้อ unpublished ของ instructor จะถูกปฏิเสธ (rules ขึ้นผ่าน `firebase deploy` เท่านั้น — Pages ไม่แตะ rules)
- `slimForCache` (membersCache.js) เก็บ `role` อยู่แล้ว (ตัดแค่ customPhoto) → **ไม่ต้อง bump cache key** สำหรับ role/instructor
- self-promote กันด้วย rules เดิม (line ~53: user เปลี่ยน role ตัวเองไม่ได้ — admin เท่านั้น)
- อาจารย์เป็น guest → ต้อง `guestStatus:'approved'` ถึงผ่าน launch gate ของแอป (App.vue) · อยู่ใน toggle guest ของ MembersView เหมือน guest อื่น
- คอมเมนต์เขียนลง subcollection ตรงด้วย Firestore SDK (ไม่ผ่าน patchUser เพราะไม่ใช่ user doc) แต่ยัง `cleanText` ก่อนเขียนเสมอ
- เขียน `authorName` snapshot ตอนโพสต์ (ถ้าเปลี่ยนชื่อภายหลัง คอมเมนต์เก่าคงชื่อ ณ ตอนนั้น — ยอมรับได้)

## ความเชื่อมโยง
- ต่อยอดจาก nav/IA redesign (22 มิ.ย.) ที่เพิ่งย้ายลิงก์คลังข้อสอบเข้า Study
- SP2 (สถิติข้อสอบ) จะ design แยก — รวมสถิติ report ที่อ่านจาก `questionReports` เดิม + รายข้อ %ถูก (เคาะวิธีเก็บข้อมูลแบบ piggyback examSessions เพื่อคุม write)
