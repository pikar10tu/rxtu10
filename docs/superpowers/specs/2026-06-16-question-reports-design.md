# Phase 5 — แจ้งข้อสอบผิด (🚩 `questionReports`)

รีวิว/อนุมัติดีไซน์ 16 มิ.ย. 2026 · ต่อจาก cost-track Phase 1-4 · spec แม่: `2026-06-15-question-bank-management-design.md` (ส่วน Phase 5)

## ปัญหา / เป้าหมาย

นักศึกษาเจอข้อสอบผิด (เฉลยผิด/พิมพ์ผิด/โจทย์ไม่ชัด) แต่บอกทีมวิชาการไม่ได้ → ต้องมีปุ่มแจ้งใน Quiz + ที่รีวิวฝั่งวิชาการ + จูงใจด้วยเหรียญรางวัลเมื่อแจ้งถูกต้อง

## ขอบเขต (ทำใน Phase นี้)

- ปุ่ม 🚩 แจ้งข้อผิดใน QuizView (ตอนเฉลย)
- แท็บรีวิว 🚩 ใน QuestionsView (ฝั่งวิชาการ) — ดู/แก้/ตัดสิน verdict/ปิด
- บันทึก verdict (`valid`/`invalid`) + stamp รางวัลค้างไว้
- rules `questionReports`
- pure util `utils/questionReport.js` + test

## นอกขอบเขต (ยกไปทีหลัง)

- **การส่งเหรียญรางวัลจริง → ทำผ่าน Mailbox** (track ถัดไป). Phase 5 แค่บันทึก `rewardAmount` + `rewardDelivered:false` ค้างไว้ พอ Mailbox เสร็จค่อย mint mail ส่งให้แล้ว flip `rewardDelivered:true`
- จำนวนเหรียญรางวัลที่แน่นอน — ใช้ค่าคงที่ placeholder ก่อน รอเคาะตอนรีวิว economy

## Data model

**Collection `questionReports/{id}`** โดย `id = ${questionId}__${uid}` (deterministic → 1 คน/ข้อ = 1 doc, re-report ทับเอง ไม่เพิ่ม doc)

```js
{
  questionId,                      // doc id ของข้อใน collection questions
  reason,                          // label ชิปเหตุผลที่เลือก
  note,                            // ช่องพิมพ์เสริม (ผ่าน cleanText(.., LIMITS.report)) — '' ได้
  reportedBy,                      // uid
  reportedByName,                  // nickname/name ตอนแจ้ง
  status: 'open' | 'resolved',
  verdict: null | 'valid' | 'invalid',   // ตั้งตอนวิชาการปิด
  rewardAmount: 0,                 // stamp ค่าคงที่ตอน verdict='valid' (0 ถ้า invalid)
  rewardDelivered: false,          // Mailbox flip เป็น true ตอนส่งจริง
  createdAt,                       // serverTimestamp ตอนแจ้ง
  resolvedAt,                      // serverTimestamp ตอนปิด (null ก่อนปิด)
  questionSnapshot: {              // fallback เผื่อข้อถูกแก้/ลบก่อนรีวิว
    question, category, choices, answerText, explanation
  }
}
```

- **`valid`** = ผิดจริง → `rewardAmount = REPORT_REWARD` (ค่าคงที่ขณะนั้น), `rewardDelivered:false` รอ Mailbox
- **`invalid`** = ไม่ผิด/ปิดเฉยๆ → `rewardAmount:0`, ไม่มีรางวัล
- **`answerText`** เก็บข้อความคำตอบ (ไม่ใช่ index) เพราะ QuizView สลับตำแหน่งตัวเลือก — index จะเพี้ยน

**ค่าคงที่** `REPORT_REWARD` ใน `data/` (เช่น `data/index.js` หรือไฟล์ economy ที่เหมาะ) พร้อมคอมเมนต์ `// TBD รอเคาะตอนรีวิว economy` · placeholder = `50`

## firestore.rules

ต้อง `firebase deploy --only firestore:rules` หลังแก้ (ไม่งั้นไม่มีผล)

```
match /questionReports/{id} {
  allow read:   if isAcademic();
  allow create: if request.auth != null
                && request.resource.data.reportedBy == request.auth.uid;
  allow update: if isAcademic()
                || (request.auth != null && resource.data.reportedBy == request.auth.uid);
  allow delete: if isAcademic();
}
```

- reporter เขียน/แก้ doc ตัวเองได้ (re-report = `setDoc(.., {merge:true})` → ติด update ของ doc เดิม)
- academic อ่านทั้งหมด, ปิด report (update status/verdict), ลบได้
- **หมายเหตุ cost:** read questionReports จำกัดเฉพาะ academic (คนน้อย) → ไม่กระทบเพดาน reads รายวันของนักศึกษา

## Pure util — `utils/questionReport.js` (+ `.test.js`, รันด้วย `node --test`)

- `reportDocId(questionId, uid)` → `` `${questionId}__${uid}` ``
- `buildSnapshot(question)` → `{ question, category, choices, answerText, explanation }` (คำนวณ `answerText = choices[answer]`; กัน field undefined)
- `groupReports(reports)` → จัดกลุ่มตาม `questionId` → `[{ questionId, count, reports[], snapshot }]` เรียงตามใหม่สุด/count มากสุด
- `resolvePayload(verdict, rewardConst)` → คืน patch สำหรับปิด report:
  - `valid` → `{ status:'resolved', verdict:'valid', rewardAmount: rewardConst, rewardDelivered:false, resolvedAt: <ts> }`
  - `invalid` → `{ status:'resolved', verdict:'invalid', rewardAmount:0, resolvedAt: <ts> }`
  - (รับ `ts` หรือใช้ sentinel ให้ caller ใส่ `serverTimestamp()` — pure: คืน object ที่ caller เติม ts เอง)

เทสครอบ: deterministic id, snapshot ตัด field + answerText ถูก, group นับถูก/แยก questionId, resolvePayload ทั้ง 2 verdict

## UI — QuizView (`src/views/QuizView.vue`)

ในบล็อก `qv-feedback` (โผล่ตอน `picked !== null`, ใต้ปุ่ม "ข้อถัดไป"):

- ปุ่มเล็ก **🚩 แจ้งข้อผิด** → toggle panel inline:
  - ชิปเหตุผล (เลือก 1): **เฉลยผิด · โจทย์/ตัวเลือกพิมพ์ผิด · โจทย์ไม่ชัด · ข้อมูลล้าสมัย · อื่นๆ**
  - ช่องพิมพ์เสริม (optional, `LIMITS.report`)
  - ปุ่ม **ส่ง** (ต้องเลือกชิปก่อน)
- ส่ง → `setDoc(doc(db,'questionReports', reportDocId(current.id, uid)), payload, {merge:true})` · `usage.track(1)` (write) · toast ขอบคุณ
- in-session `Set<questionId>` → ส่งแล้วปุ่มเปลี่ยนเป็น **🚩 แจ้งแล้ว ✓** disabled (กันสแปมในรอบเดียว; ข้ามเซสชัน deterministic id ทับเองอยู่แล้ว)
- payload ใช้ `buildSnapshot(current)` + reason/note/reportedBy/reportedByName/status:'open'/verdict:null/reward fields/createdAt

## UI — QuestionsView (`src/views/QuestionsView.vue`)

`list` โหลดทุกข้อไว้ในหน่วยความจำแล้ว → จับคู่ report↔ข้อได้โดยไม่อ่าน questions เพิ่ม

- แถบ/ปุ่ม **"🚩 ถูกแจ้ง (N)"** (N = จำนวน report ที่ `status=='open'`)
- กดเปิด → `getDocs(query(collection(db,'questionReports'), where('status','==','open'), orderBy('createdAt','desc'), limit(200)))` · `usage.track(snap.size)` · `groupReports()`
- แต่ละกลุ่มแสดง:
  - โจทย์ (จาก `list` by id; ถ้าไม่เจอ = ถูกลบ → ใช้ `snapshot.question` + ป้าย "ข้อถูกลบแล้ว")
  - เหตุผล + ผู้แจ้ง + เวลา (แต่ละ report) + count
  - ปุ่ม: **แก้ไขข้อนี้** → `edit(q)` แล้วเลื่อนไป editor (ถ้าข้อยังอยู่) · **✓ ผิดจริง (ให้รางวัล)** → verdict valid · **✕ ไม่ผิด** → verdict invalid
  - ปิด (resolved): `writeBatch` update ทุก report ของ `questionId` นั้นด้วย `resolvePayload(...)` (+ `resolvedAt: serverTimestamp()`) แล้วตัดออกจากลิสต์ · `usage.track` ตามจำนวน write

## Flow รวม

```
นักศึกษาทำ Quiz → เจอข้อผิด → 🚩 เลือกชิป+พิมพ์ → setDoc questionReports (open)
                                                          │
วิชาการเปิดแท็บ 🚩 ใน Questions → getDocs(open) → group → ดู
   ├─ แก้ไขข้อนี้ → edit(q) → แก้ใน editor เดิม
   └─ ปิด: ✓ ผิดจริง(valid+stamp reward)  /  ✕ ไม่ผิด(invalid) → batch resolved
                                                          │
               (track ถัดไป) Mailbox อ่าน valid && !rewardDelivered → mint mail → flip delivered
```

## ลำดับทำ (จะลง plan ละเอียดในขั้นถัดไป)

1. `utils/questionReport.js` + test (pure ก่อน)
2. ค่าคงที่ `REPORT_REWARD` ใน data
3. rules `questionReports` (+ deploy)
4. QuizView ปุ่ม 🚩 + panel + setDoc
5. QuestionsView แท็บ 🚩 + group + resolve
6. build + ทดลอง dev + commit + push (frontend) + deploy rules
