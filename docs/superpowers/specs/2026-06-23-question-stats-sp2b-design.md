# SP2b — สถิติรายข้อ (per-question stats)

วันที่: 2026-06-23
สถานะ: design (อนุมัติแล้ว — รอ plan)
ต่อยอดจาก: SP2a (หน้าจัดการข้อสอบแบบกระชับ — แถวย่อ + accordion) · SP1 (instructor role + คอมเมนต์รายข้อ)

## เป้าหมาย

ติด badge บน **แถวย่อ** ของ QuestionsView (SP2a) เพื่อให้ผู้แก้คลังข้อสอบกวาดตาเจอ "ข้อมีปัญหา" ได้ทันทีโดยไม่ต้องกางทุกข้อ:

- 🔴 **%ถูก** — แสดง *เฉพาะข้อที่อยู่ใต้เกณฑ์* (%ถูกต่ำ + มีตัวอย่างพอ) = สัญญาณว่าข้ออาจกำกวม/เฉลยผิด
- 🚩 **จำนวน report ที่ยังไม่ตัดสิน** — ชี้ข้อที่นักศึกษาแจ้งว่าผิด

หลักการ: signal น้อยแต่ตรงเป้า — ข้อปกติไม่มี badge (ไม่รก), badge ขึ้นเฉพาะข้อที่ควรไปดู

## ขอบเขต (scope)

- **ทำ:** counter %ถูกใหม่ (collection `questionStats`), เขียนตอน quiz จบ, badge 2 ตัวบนแถวย่อ, rules collection ใหม่
- **ไม่ทำ:** backfill ข้อเก่า (สถิติสะสมไปข้างหน้า — ข้อที่ทำก่อน deploy จะยังไม่มีตัวเลขจนกว่าจะมีคนทำใหม่), หน้าสถิติแยก/กราฟรายข้อ, แก้ logic report/QuizView scoring, แตะ userSchema/migration/index

## โมเดลข้อมูล

### `questionStats/{qid}` (collection ใหม่, top-level)

```
{
  a: <int>,   // attempts — จำนวนครั้งที่ข้อนี้ถูกตอบ
  c: <int>,   // correct — จำนวนครั้งที่ตอบถูก
}
```

- **doc id = question id** (qid) ตรงๆ — ผูกกับ `questions/{qid}`
- **increment-only** — เขียนด้วย `increment()` เท่านั้น ไม่มีการลด/รีเซ็ต (เหมือน pattern `stats/{date}` ของ Phase 3 usage meter)
- ไม่มีใน `userSchema` (เป็น top-level collection แยก), ไม่มี migration
- ข้อที่ยังไม่เคยถูกตอบ = ไม่มี doc = ไม่มี badge (ถูกต้อง)
- ข้อที่ถูกลบจาก `questions` แต่ stat doc ยังค้าง = ถูกมองข้าม (badge lookup ใช้ `q.id` จาก `list` ปัจจุบันเท่านั้น)

### report count — **reuse `questionReports` เดิม ไม่สร้าง counter ใหม่**

`questionReports/{qid__uid}` มีอยู่แล้ว (Phase 5, deterministic id, setDoc merge re-report ทับเอง). นับจำนวน report ที่ `status=='open'` ต่อ qid ด้วย `groupReports` ที่มีอยู่แล้ว — ไม่ต้องเก็บตัวนับซ้ำ ไม่มีปัญหา double-count ตอน re-report

## การเขียน (QuizView.vue)

1. **บรรทัด ~330** เพิ่ม `id` ลงใน answer record:
   ```js
   answers.value.push({ id: current.value.id, domain: current.value.domain || null, correct: isCorrect })
   ```
2. **`finish()`** หลังบันทึก `examSessions`: tally answers ต่อ qid → `writeBatch` increment `questionStats/{qid}`:
   ```js
   const tally = tallyAnswers(answers.value)        // { qid: { a, c } }
   const batch = writeBatch(db)
   for (const [qid, { a, c }] of Object.entries(tally)) {
     batch.set(doc(db, 'questionStats', qid),
       { a: increment(a), c: increment(c) }, { merge: true })
   }
   await batch.commit()
   usage.track(0, Object.keys(tally).length)
   ```
   - ครอบ `try/catch` **non-fatal** — สถิติพังต้องไม่บล็อกหน้าผลคะแนน/รางวัล
   - นับเฉพาะข้อที่ตอบจริง (จาก `answers.value`) — ข้อที่ skip/ไม่ทันไม่ถูกนับ
   - write เพิ่ม ~N docs/quiz (default 5) ฝั่งนักศึกษา (budget 20k writes/วัน เหลือเฟือสำหรับรุ่นเดียว)

## การอ่าน + แสดง badge (QuestionsView.vue)

### โหลดตอน mount
- **ถ้า `isQuestionEditor`** (academic + instructor): `getDocs(collection 'questionStats')` ครั้งเดียว → `statMap` ref `{ qid: { a, c } }` + `usage.track(snap.size)`
- **ถ้า `isAcademic`**: เรียก `loadReports()` ทันที (เดิม lazy ตอนกางแผง 🚩) + ตั้ง flag `reportsLoaded` → `onReportsToggle` ข้ามการ fetch ซ้ำถ้าโหลดแล้ว → แผง report เดิมกับ badge ใช้ `reports.value` ชุดเดียวกัน (ไม่ double-fetch)
- read เพิ่มเฉพาะ "ผู้แก้คลัง" (กลุ่มเล็ก) ตอนเปิดหน้า — ไม่แตะเพดาน read 50k/วันของนักศึกษา

### computed
- `reportCountMap` = จาก `reportGroups` (มีอยู่แล้ว) → `{ qid: count }` (เฉพาะ open) · instructor อ่าน reports ไม่ได้ตาม rules → `reports` ว่าง → map ว่าง → ไม่มี badge 🚩 อัตโนมัติ
- helper `problemPct(qid)` → ถ้า `isProblem(statMap[qid], MIN, PCT)` คืน `pctCorrect` มิฉะนั้น `null`

### template (แถวย่อ `.qz-row`, หลัง badge สถานะ/domain ก่อน `.qz-row-q`)
```html
<span v-if="problemPct(q.id) !== null" class="qz-badge-stat low">
  <Emoji char="🔴" /> {{ problemPct(q.id) }}%
</span>
<span v-if="reportCountMap[q.id]" class="qz-badge-stat rep">
  <Emoji char="🚩" /> {{ reportCountMap[q.id] }}
</span>
```

## utils/questionStats.js (pure + เทส `node --test`)

- `tallyAnswers(answers)` → `{ [qid]: { a, c } }` — reduce array `{id, correct}`; ข้อไม่มี id ถูกข้าม; รวมซ้ำ qid ได้ (กันกรณีข้อซ้ำในชุด)
- `pctCorrect(a, c)` → `Math.round(c / a * 100)` หรือ `null` ถ้า `a <= 0`
- `isProblem(stat, minAttempts, pctThreshold)` → `boolean` — `stat.a >= minAttempts && pctCorrect(stat.a, stat.c) < pctThreshold`

เทสครอบ: ตัวอย่างน้อย (a<min) ไม่ flag · a=0/undefined ปลอดภัย · pct ปัดถูก · ขอบ threshold (เท่ากับ 50 ไม่ flag, ต่ำกว่าจึง flag) · tally รวมซ้ำ + ข้าม id ว่าง

## tunable pins (data/index.js)

```js
export const QUESTION_STAT_MIN_ATTEMPTS = 5   // ต้องถูกตอบ ≥ เท่านี้ก่อนจึง flag (กัน sample น้อยหลอก)
export const QUESTION_STAT_PROBLEM_PCT  = 50  // %ถูก < เท่านี้ = ข้อมีปัญหา (โชว์ 🔴)
```

## firestore.rules (ต้อง deploy)

เพิ่ม block ใหม่ (วางคู่กับ `stats/{id}` ของ Phase 3):

```
match /questionStats/{qid} {
  allow read:   if canEditQuestions();
  allow create: if request.auth != null
    && request.resource.data.keys().hasOnly(['a', 'c'])
    && request.resource.data.a is int && request.resource.data.a >= 0
    && request.resource.data.c is int && request.resource.data.c >= 0;
  allow update: if request.auth != null
    && request.resource.data.diff(resource.data).affectedKeys().hasOnly(['a', 'c'])
    && request.resource.data.a is int && request.resource.data.a >= resource.data.get('a', 0)
    && request.resource.data.c is int && request.resource.data.c >= resource.data.get('c', 0);
  allow delete: if isAdmin();
}
```

- **read = `canEditQuestions()`** (academic + instructor — ทั้งคู่ต้องเห็น badge 🔴) · นักศึกษาอ่านไม่ได้ (เขียนได้อย่างเดียว)
- **create/update = ผู้ล็อกอิน + increment-only** บน field `a`,`c` (นักศึกษาเขียนตอน quiz จบ) — แตะได้แค่ 2 field, ลดค่าไม่ได้ (เหมือน `stats/{date}` เป๊ะ)
- consistent กับโมเดล "trust-based + light guards" ของโปรเจกต์: corrupt ได้แค่ค่าสถิติ (low stakes), มินต์เหรียญไม่ได้
- ไม่ต้อง composite index (อ่านทั้ง collection ไม่มี where/orderBy; report query reuse index เดิมจาก Phase 5)

## Cost

- **write:** +~N docs/quiz (N = ข้อที่ตอบ, default 5) ฝั่งนักศึกษา — budget Spark 20k writes/วัน เหลือเฟือสำหรับรุ่นเดียว (user ยอมรับ เผื่อเติมเล็กน้อย)
- **read:** +stat docs ที่มี + open reports — เฉพาะตอน "ผู้แก้คลัง" เปิดหน้า QuestionsView (กลุ่มเล็ก) — ไม่กระทบเพดาน read 50k/วันของนักศึกษา (ตัวถ่วงหลักยังเป็น members)

## Edge cases / กับดัก

- stat write fail → non-fatal (หน้า result/รางวัลต้องไม่พัง)
- stat doc ของข้อที่ถูกลบ → badge lookup ผ่าน `list` ปัจจุบัน จึงถูกมองข้ามเอง
- instructor → reports อ่านไม่ได้ → `reportCountMap` ว่าง → ไม่มี 🚩 (โดยดีไซน์) แต่ยังเห็น 🔴
- `loadReports()` ตอน mount + ตอนกางแผง → ต้องกัน double-fetch ด้วย flag `reportsLoaded`
- ข้อที่ a < MIN_ATTEMPTS → ไม่ flag (แม้ %ถูกต่ำ) กัน sample น้อยหลอก
