# ระบบข้อสอบย้อนหลัง (Past-Exam System) — Design

วันที่: 2026-07-11
สถานะ: อนุมัติดีไซน์แล้ว (ผ่านรีวิว fable 5) — รอ user รีวิว spec ก่อนทำ plan

## เป้าหมาย

ให้ทีมวิชาการติดป้ายข้อสอบว่ามาจาก "ชุด" ข้อสอบย้อนหลังไหน (เช่น PLE-CC1 ชุด 1),
เก็บ/แสดงประวัติ (ใครเพิ่ม/ใครตรวจ) แบบ read-only, ให้นักศึกษาเลือกทำข้อสอบย้อนหลัง
ตามชุด/ปีในควิซเดิม (ได้เหรียญปกติ), และจัดหน้าคลังข้อสอบให้วิชาการทำงานง่ายขึ้น

## หลักการที่ยึด (จากรีวิว)

1. **1 ข้อ tag ได้หลายชุด** — ข้อสอบ PLE ข้อเดียวออกซ้ำหลายปีเป็นปกติ + ชนกับ dedup `qhash`
   เดิมที่ข้ามข้อซ้ำเงียบๆ → ใช้ `examSets: string[]` (array) ไม่ใช่ scalar
2. **ปีเป็น attribute ของชุด ไม่ใช่ของข้อ** — เก็บปีที่ `config/examSets` entry `{name, year}` ที่เดียว
   ไม่ denormalize `examYear` ลง question doc (กัน desync กรณีข้อโผล่หลายปี)
3. **แก้ tag = metadata → ไม่ล้างผลตรวจ** — `reviewContentChanged` key จาก
   `[question, choices, answer, explanation]` เท่านั้น field ใหม่ไม่ trigger reset โดยธรรมชาติ
   และ rules `reviewUntouched` ผ่านเพราะไม่แตะ review keys
4. **filter ฝั่งนักศึกษา: หมวด หรือ ชุด อย่างใดอย่างหนึ่ง** — เป็น product/UX choice
   (จอมือถือ + ชุดเล็ก×หมวดแล้วเหลือไม่กี่ข้อ) ไม่ใช่ข้อจำกัด index

---

## A. Data model

### questions/{id} — เพิ่ม field เดียว
```
examSets: string[]   // ชื่อชุดที่ข้อนี้อยู่ (0..N) — ไม่มี = []/ไม่มี field
```
- ไม่มี `examYear` บน doc (ปีมาจาก config ของชุด)
- ค่าชื่อชุดต้องมาจาก `config/examSets` เท่านั้น (กัน fragmentation)

### config/examSets — รายการชุดกลาง (clone pattern config/topics)
```
config/examSets → {
  list: [ { name: 'PLE-CC1 ชุด 1', year: 2566 }, ... ]
}
```
- `name` = key ที่ไปโผล่ใน `questions.examSets[]`
- `year` = ปี พ.ศ. (int) ใช้จัดกลุ่ม picker + แสดงผล
- กรณี "รู้ปีแต่ไม่รู้ชุด" → สร้าง pseudo-set เช่น `{ name: 'ปี 2566 (ไม่ระบุชุด)', year: 2566 }`
  (โครงเดียว ไม่ต้องมี field ปีอิสระ)

### composable useExamSets (clone useTopics)
- module-cache `sets: ref([])`, `loadExamSets()`, `addExamSet(name, year)`
- **ต่างจาก useTopics:** list เป็น array ของ object → **ห้ามใช้ `arrayUnion`**
  (arrayUnion เทียบทั้ง object ไม่ dedup ตาม name — เพิ่มชื่อเดิมปีต่างได้ 2 entries)
  → เช็คชื่อซ้ำเองใน memory แล้ว `setDoc(ref, { list: newList }, {merge:true})` ทับทั้ง list
- validate: `name` ผ่าน `cleanText(_, LIMITS.category)`, `year` เป็น int + normalize
  (ดู C — พ.ศ./ค.ศ.)

### firestore.rules — เพิ่ม rule (ยืนยัน gap แล้ว)
`match /config/topics` เจาะจง doc เดียว → `config/examSets` จะ match แค่ `/config/{doc}`
ซึ่ง `write: if isAdmin()` → academic เพิ่มชุดไม่ได้ ต้องเพิ่ม:
```
match /config/examSets { allow write: if canEditQuestions(); }
```
read ได้ฟรีจาก public-read ของ `config/{doc}` (จำเป็นสำหรับ picker นักศึกษา)
**⚠️ แก้ rules ต้อง `firebase deploy --only firestore:rules` เสมอ** (กับดัก #3)

---

## B. จุดติดป้าย (tagging)

### B1. ฟอร์มเพิ่ม/แก้ทีละข้อ (QuestionsView editor)
- เพิ่มช่อง "ชุดข้อสอบ" — component `ExamSetSelect` (clone TopicSelect) เลือกได้**หลายชุด** (multi)
  - dropdown จัดกลุ่มตามปี, ปุ่ม "➕ เพิ่มชุดใหม่…" กรอก name + year
  - ปีไม่มีช่องแยก — โผล่ติดชื่อชุด (`PLE-CC1 ชุด 1 · 2566`)
- `draft.examSets` เข้า payload ตอน save() (ทั้ง add และ update)

### B2. นำเข้า JSON (bulk import)
- เพิ่ม control **"ตั้งชุดให้ทั้งไฟล์นี้"** (เลือกชุดจาก config) เหนือปุ่มนำเข้า
  → stamp `examSets` ให้ทุกข้อในไฟล์ (ข้อที่ JSON มี `examSets`/`examSet` ของตัวเองใช้ของตัวเอง)
- `parseImport` รับ per-row `examSets: string[]` หรือ `examSet: string` (แปลงเป็น array 1 ตัว)
  - validate ชื่อชุดกับ `config/examSets` list — ไม่ตรง → ตัดชื่อนั้นทิ้ง + log (กัน fragmentation)
    (หรือ auto-add เข้า config ถ้ามี year มาด้วย — เลือกใน plan)
- **ข้อซ้ำ (qhash ชนคลัง): เปลี่ยนจาก "ข้าม" → "merge tag"**
  - `splitDuplicateRows` ปัจจุบันคืน `{ fresh, duplicates }` เป็น rows เท่านั้น
  - ต้องให้ runImport map duplicate → doc id เดิม: สร้าง `hashToId` จาก `list`
    (มี id + qhash อยู่แล้ว) แล้ว `arrayUnion(examSets)` เข้า doc เดิมด้วย writeBatch
  - arrayUnion tag = ไม่แตะ review keys → ไม่ล้างผลตรวจ (ผ่าน rules `reviewUntouched`)
  - toast สรุป: "นำเข้าใหม่ X · เพิ่มแท็กข้อเดิม Y · ผิดรูปแบบ Z"

### B3. Batch-tag ในคลัง (อยู่ P1 — ต้นทุนต่ำ ผลตอบแทนสูงสุด)
- ใช้ batch UI + `commitInChunks` ที่มีอยู่: เลือกหลายข้อ → action "เพิ่มชุดให้ข้อที่เลือก"
  → `arrayUnion(examSets)` ทีละ chunk (500)
- เป็นทางหลักที่ทำให้ข้อเก่ามีข้อมูลชุดเร็วสุด (tag ทีละข้อผ่าน editor ไม่ไหว)

---

## C. Import — normalize ปี พ.ศ./ค.ศ.

- กติกาเดียว: เก็บเป็น **พ.ศ.** ทุกที่
- normalize ตอนรับ year (ทั้ง addExamSet และ parseImport):
  `year < 2400 ? year + 543 : year` (ค.ศ. → พ.ศ.)
- ช่วงที่ยอมรับ: เช่น 2500–2600 (กันพิมพ์พลาด) — ตกช่วง = ปฏิเสธ/แจ้ง

---

## D. ประวัติ/audit (read-only, เฉพาะวิชาการ)

แสดงในรายละเอียดข้อ (expanded detail) + ฟอร์มแก้:
- **เพิ่มโดย:** `createdByName` + `createdAt` + `source` (แต่งเอง/import)
  - fallback "ไม่ระบุ" สำหรับข้อยุคแรกที่ไม่มี field
- **ตรวจโดย (ผลตรวจรอบปัจจุบัน):** ดึงจาก subcollection `reviews` — reviewerName + verdict
  + reason + time (มี `loadEditReviews` อยู่แล้ว ในฟอร์มแก้ — เพิ่มใน detail ด้วย)
  - **label ให้ตรง: "ผลตรวจรอบปัจจุบัน"** ไม่ใช่ประวัติถาวร (subdoc id = uid → ตรวจใหม่ทับเก่า)
  - โหลด reviews **ตอน expand เท่านั้น** — ห้ามโหลดทุกข้อใน list (N subqueries)
- **สถานะตรวจปัจจุบัน** (badge เดิม)

หมายเหตุ read-only: rules ล็อก verdict ไม่ให้แก้อยู่แล้ว + นักศึกษาอ่าน `reviews` ไม่ได้
(optional hardening: rules กัน non-admin แก้ `createdBy/createdAt/source` — save() ตอน update
ไม่เขียน field พวกนี้อยู่แล้ว จะขันก็ได้ แต่อยู่ใน trust-model จะข้ามก็ได้)

---

## E. ฝั่งนักศึกษา — ตัวกรองในควิซเดิม (QuizView)

- Quiz home เพิ่มส่วน "📜 ข้อสอบย้อนหลัง": picker เลือกชุด (จัดกลุ่มตามปี)
  - **สลับกับ** ตัวกรองหมวด (เลือกอย่างใดอย่างหนึ่ง)
  - ซ่อนชุดที่ count = 0 (ตาม pattern `domainChips`)
  - empty state: ถ้ายังไม่มีชุดที่มีข้อ published → ซ่อนส่วนนี้/ขึ้นข้อความ
- **query:** `fetchQuestions` เพิ่ม `where('examSets', 'array-contains', set)`
  - กรอง "ทั้งปี": `array-contains-any` ของชุดในปีนั้น (ปีนึงมีไม่กี่ชุด << ลิมิต 30)
  - **composite index ใหม่:** `isPublished + examSets(CONTAINS) + rand`
    (มี `isPublished+domain+rand` อยู่แล้ว · `firestore.indexes.json` มี category+rand ค้างเลิกใช้)
  - **deploy index ก่อนปล่อย P2:** `firebase deploy --only firestore:indexes` + รอ build เสร็จ
    ไม่งั้น query error · แนะนำ gate P2 ด้วย config flag (pattern `pvpOpen`)
- **meta:** `buildMeta` เติม `examSets: [{ name, year, count }]` (นับเฉพาะ published)
  - picker โหลดจาก `config/questionsMeta` 1 read (public-read) — ไม่สแกนทั้งคลัง
- **⚠️ workflow gap ที่ต้องปิด:** `recomputeMeta` ถูกเรียกแค่หลัง import/batch, `save()` เดี่ยว
  ไม่เรียก → tag ทีละข้อแล้ว picker นักศึกษาค้าง
  - แก้: หลัง save()/batch-tag ที่แตะ examSets → toast เตือน "อย่าลืมกด 🔄 คำนวณ meta ใหม่"
    หรือ recompute อัตโนมัติครั้งเดียวตอนจบ (debounce) — **ห้าม recompute ทุก save**
    (อ่านทั้งคลัง/ครั้ง ขัด cost constraint)
- **เก็บตก:** `startZen` reset exam filter ด้วย (ปัจจุบัน reset แค่ `dom='__all'`)
- `examSessions` เก็บ `examSet` ที่เลือก (rules ไม่ล็อก keys เพิ่ม field ได้)

---

## F. UX rework หน้าคลังข้อสอบ (P3)

แยกสกอลล์ยาวก้อนเดียว → แท็บย่อยในหน้าเดียว:
- **✍️ เพิ่ม/แก้** — ฟอร์ม (จัดกลุ่มช่อง + ชุด inline) + นำเข้า JSON
- **📚 คลัง** — ค้นหา/กรอง (เพิ่มกรองชุด/ปีใน `questionsFilter.js`) + รายการ + batch + ภาพรวมนับตามชุด
- **🔍 ตรวจสอบ** — ข้อถูกแจ้ง + ตรวจซ้ำ

**เงื่อนไขก่อนแตก tab:** ยก state คลัง (`list` ที่ share ข้าม import-dedup/duplicate/reports)
ขึ้น composable module-cache (แบบ useTopics) ก่อน ไม่งั้นแต่ละ tab `getDocs` ทั้งคลังเอง =
reads คูณจำนวน tab + ออกแบบ cross-tab nav ("แก้ไขข้อนี้" จาก 🔍 → เด้งไป ✍️ พร้อม draft)

---

## เฟส

- **P1 (แกนหลัก, ด่วน):** data model + rules + useExamSets + ExamSetSelect + ฟอร์ม + import
  (merge-tag + normalize ปี) + batch-tag + audit display
- **P2 (นักศึกษา):** buildMeta examSets + recompute trigger + index + QuizView picker +
  gate flag + examSessions field
- **P3 (UX):** ยก state เป็น composable → แตกเป็น tabs + filter ชุด/ปีในคลัง

---

## Test (pure utils — แนวป้องกันเดียว ไม่มี test runner กลาง)

- `useExamSets` dedup ตาม name (แก้ปีไม่เพิ่ม entry)
- `parseImport`: รับ examSets, normalize ปี, validate ชื่อกับ config
- `splitDuplicateRows`/merge-tag mapping: duplicate → doc id เดิม
- `buildMeta`: examSets counts (published เท่านั้น)
- `reviewContentChanged`: exam fields ไม่ trigger reset (กันคนอนาคตเผลอยัดเข้า key)

## Migration / backfill

- ข้อเก่าไม่มี `examSets` → ถือเป็น `[]` (ไม่โผล่ใน filter — ถูกต้องตาม requirement)
- ไม่ต้อง backfill บังคับ — ทีมวิชาการ batch-tag เอาเองตามต้องการ
- ข้อเก่าไม่มี `createdByName` → audit แสดง "ไม่ระบุ"

## Open items (เคาะใน plan)
- per-row examSet ใน JSON ที่ไม่ตรง config: ตัดทิ้ง+log หรือ auto-add (ถ้ามี year)
- recompute meta: toast เตือน vs auto-debounce ตอนจบ session
- optional rules hardening: กัน non-admin แก้ createdBy/source
