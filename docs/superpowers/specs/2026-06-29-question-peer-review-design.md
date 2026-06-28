# หน้าตรวจข้อสอบ (Peer Review วิชาการ) — Design Spec

**วันที่:** 2026-06-29
**สถานะ:** อนุมัติดีไซน์แล้ว (user เคาะผ่าน brainstorm) → รอเขียน implementation plan + ลงมือ **เซสชั่นหน้า**
**ที่มา:** คิวงานใหม่ user สั่ง 29 มิ.ย. 2026 (backlog ข้อ #1, ความสำคัญสูงสุด) — memory `rxtu10_backlog_2026-06-29`
**ลำดับถัดไปในคิว:** #2 battle UI · #3 PvP gating+matchmaking · #4 Expedition rework · #5 บอสโลก

---

## 1. เป้าหมาย / Why

ให้ทีม **วิชาการ + อาจารย์** เข้ามา **ตรวจสอบความถูกต้องของข้อสอบแบบสุ่ม** ก่อน/หลังเผยแพร่ เพื่อคุมคุณภาพคลังข้อสอบ — แต่ละข้อต้องผ่านการตรวจจากผู้ตรวจ **2 คน (สุ่ม)** พร้อม **เหตุผล** และ **เรฟอ้างอิง** บันทึก **ชื่อจริงผู้ตรวจจากฐานข้อมูล** และมี **ตัวนับว่าใครตรวจไปกี่ข้อ** (เห็นกันเองในทีม + แอดมิน)

**บริบทนโยบาย (จาก user):** ช่วงสัปดาห์แรกๆ pool ข้อสอบยังน้อย → อาจต้อง **เผยแพร่ทุกข้อแม้ยังไม่ผ่านวิชาการ** ไปก่อน · เมื่อผ่านไป 2–3 สัปดาห์ จึงจะเปลี่ยนเป็น **เผยแพร่เฉพาะข้อที่ผ่านวิชาการแล้ว** ⇒ ระบบต้อง **เก็บสถานะตรวจต่อข้อ** ไว้รองรับนโยบายนี้ (แต่ **เฟสนี้ยังไม่ gate การเผยแพร่** — ดู §8)

---

## 2. ขอบเขต / โมเดลหลัก

- **Pull model (สุ่มป้อนข้อ)** — client-only ไม่มี backend assign · วิชาการเปิดหน้า → ระบบสุ่มข้อที่ "ต้องให้ฉันตรวจ" มา 1 ข้อ
- **ผู้ตรวจ = `canEditQuestions` (academic + instructor)** — ทั้งคู่ตรวจได้ และนับรวมใน leaderboard เดียวกัน
- **คิวข้อ = ทุกข้อในคลัง** (ทั้งเผยแพร่และร่าง) — ไม่กรองเฉพาะ published
- **ครบ 2 เสียงต่อข้อ** → ข้อนั้นหลุดจากคิว (ยกเว้น `conflict` ที่ต้องรอคนที่ 3)
- **กันตรวจข้อตัวเอง** — ข้อที่ `createdBy == ฉัน` ไม่เข้าคิวให้ฉันตรวจ
- **กันตรวจซ้ำ** — ข้อที่ฉันตรวจไปแล้วไม่กลับมาอีก (doc id รีวิว = uid ของฉัน)

---

## 3. โครงสร้างข้อมูล (Firestore)

### 3.1 Field สรุปบนเอกสารข้อสอบ `questions/{qid}` (denormalized)
เพิ่ม 3 field เพื่อให้ pull-model หาข้อถัดไปได้จากการ **อ่านคลังครั้งเดียว** (ไม่ต้องไล่อ่าน subcollection ทุกข้อ):

| field | ชนิด | ความหมาย |
|-------|------|----------|
| `reviewedBy` | `array<uid>` | ใครตรวจไปแล้ว (กันซ้ำ + ใช้เป็นตัวนับ leaderboard) |
| `reviewVerdicts` | `map<uid, 'correct'\|'fix'\|'wrong'>` | คำตัดสินรายคน (ใช้คำนวณสถานะ) |
| `reviewStatus` | `string` | `'pending'\|'passed'\|'conflict'\|'failed'` — denormalized จาก verdicts เพื่อ filter/แสดงง่าย |

**ข้อเก่าที่ไม่มี field เหล่านี้ = ถือว่า `pending` / `reviewedBy=[]`** (defensive read, ไม่มี migration — forward-looking เหมือน questionStats)

### 3.2 ซับคอลเลกชันรายละเอียด `questions/{qid}/reviews/{reviewerUid}`
doc id = uid ของผู้ตรวจ (deterministic → กันตรวจซ้ำ + กันปลอมเป็นคนอื่น):
```
{
  reviewerUid: string,        // = doc id
  reviewerName: string,       // 🔑 snapshot "ชื่อจริง" จาก DB ตอนตรวจ (realName || nickname || name)
  verdict: 'correct'|'fix'|'wrong',
  reason:  string,            // บังคับกรอก (cleanText + LIMITS)
  ref:     string,            // ไม่บังคับ (อาจว่าง)
  ts:      serverTimestamp
}
```

### 3.3 ตัวนับ "ใครตรวจกี่ข้อ" — **ไม่สร้าง collection ใหม่**
นับจาก `reviewedBy` ของทุกข้อในคลัง (โหลดคลังอยู่แล้ว) → tally `uid → จำนวนข้อ` แล้ว map `uid → ชื่อจริง` ผ่าน members store (`loadFbUsers`) → ได้ leaderboard ทันที ไม่กิน read เพิ่ม

---

## 4. การส่งรีวิว (write path)

ผู้ตรวจกด "ส่งผลตรวจ" → เขียน **2 จุดในชุดเดียว** (ผ่าน `writeBatch` หรือ 2 call ต่อเนื่อง):
1. `setDoc(questions/{qid}/reviews/{myUid}, {...})` — รายละเอียดเต็ม + snapshot ชื่อจริง
2. `updateDoc(questions/{qid}, { reviewedBy: arrayUnion(myUid), reviewVerdicts.{myUid}: verdict, reviewStatus: <computed> })`

`reviewStatus` คำนวณ client-side จาก `reviewVerdicts` เดิม + verdict ของฉัน ผ่าน pure util (§5) แล้วเขียนค่าใหม่ลงไป (trust-based เหมือนทั้งระบบ)

> หมายเหตุ concurrency: ถ้า 2 คนส่งพร้อมกัน `arrayUnion` ปลอดภัย แต่ `reviewStatus` อาจคำนวณจากภาพเก่าได้ — ยอมรับได้ (กลุ่มเล็ก โอกาสชนกันต่ำ) · ถ้าคลาดเคลื่อน คนที่ 3 / การ recompute จะแก้เอง · *(ทางเลือกแข็งกว่า = ใช้ transaction อ่าน verdicts สดก่อนคำนวณ — พิจารณาตอน plan ถ้าจำเป็น)*

---

## 5. ตรรกะสถานะ — pure util `utils/questionReview.js` (+ `.test.js`)

แยก verdict เป็น 2 ฝั่ง: **pass = `correct`** · **fail = `fix` หรือ `wrong`**

| verdicts ที่มี | `reviewStatus` | อยู่ในคิวต่อไหม |
|----------------|----------------|----------------|
| (ยังไม่มี / 1 เสียง) | `pending` | ใช่ — ยังหาคนตรวจให้ครบ 2 |
| `correct` + `correct` | `passed` ✅ | ไม่ |
| `correct` + (`fix`/`wrong`) | `conflict` ⚠️ | ใช่ — **รอคนที่ 3 ตัดสินเสียงข้างมาก** |
| (`fix`/`wrong`) + (`fix`/`wrong`) | `failed` ❌ | ไม่ (สรุปว่ามีปัญหา → ส่งกลับให้แก้) |
| หลังคนที่ 3 (conflict เดิม) | เสียงข้างมาก → `passed` หรือ `failed` | ไม่ |

ฟังก์ชันที่ export (เดาเบื้องต้น — ปรับตอน plan):
- `computeStatus(verdictsMap) → 'pending'|'passed'|'conflict'|'failed'`
- `needsReviewBy(question, myUid) → bool` — `createdBy!=me && !reviewedBy.includes(me) && (reviewedBy.length<2 || status==='conflict')`
- `tallyReviewCounts(questions) → { uid: count }`

---

## 6. หน้า / ทางเข้า (UI)

**View ใหม่ `views/ReviewView.vue` · route `/review` · gate `canEditQuestions`** (กันเข้าทั้งหน้า → ตัวนับเห็นเฉพาะ academic+instructor+admin โดยอัตโนมัติ)

ทางเข้า:
- ลิงก์ใน **StudyView** โซนวิชาการ ข้างๆ "🛠️ จัดการคลังข้อสอบ" (เงื่อนไข `isQuestionEditor` เดิม)
- ปุ่มใน **AdminView**

โครงหน้า:
1. **การ์ดข้อปัจจุบัน** — โจทย์ + ตัวเลือกทั้งหมด + **เฉลยที่ถูกทำเครื่องหมายชัด** + domain/หมวด → ฟอร์มตรวจ:
   - เลือกผล: **ถูกต้อง / ต้องแก้ / ผิด** (3 ปุ่ม)
   - ช่อง **เหตุผล** (บังคับ — ปุ่มส่ง disabled ถ้าว่าง)
   - ช่อง **เรฟอ้างอิง** (ไม่บังคับ)
   - ปุ่ม **ส่งผลตรวจ** + ปุ่ม **ข้ามข้อนี้** (สุ่มข้อใหม่)
2. **แถบสรุปคิว** — "เหลือต้องตรวจ N ข้อ · ขัดแย้ง M ข้อ"
3. **ตาราง leaderboard** "ใครตรวจกี่ข้อ" (ชื่อจริง + จำนวน, เรียงมาก→น้อย, ปักหมุด "คุณ")

**กันอคติ (anchoring):** ผู้ตรวจคนที่ 1–2 **ไม่เห็นผลตรวจของคนอื่นจนกว่าจะส่งของตัวเอง** (ตรวจอิสระ) · **ยกเว้นข้อ `conflict`** ที่จะโชว์ 2 รีวิวเดิม (เหตุผล+เรฟ+ชื่อ) ให้คนที่ 3 เห็น เพราะหน้าที่คือตัดสินข้อขัดแย้ง

---

## 7. กฎ Firestore (ต้อง deploy)

- **`questions/{qid}`** — เขียนได้โดย `canEditQuestions` อยู่แล้ว → review aggregate (`reviewedBy`/`reviewVerdicts`/`reviewStatus`) เขียนผ่านสิทธิ์เดิม (trust-based + light guards เหมือนทั้งระบบ — ไม่เพิ่ม guard ซับซ้อน)
- **`questions/{qid}/reviews/{reviewerUid}`** (เพิ่ม match block):
  - `read`: `canEditQuestions()`
  - `create`: `canEditQuestions() && request.resource.data.reviewerUid == request.auth.uid && reviewerUid == request.auth.uid` (id ตรงกับ uid → กันตรวจแทน/ปลอม)
  - `update`: เจ้าของ (`resource.data.reviewerUid == request.auth.uid`) หรือ `isAdmin()` (แก้รีวิวตัวเองได้)
  - `delete`: `isAdmin()`

> ⚠️ แก้ rules แล้วต้อง `firebase deploy --only firestore:rules` เสมอ (CLAUDE.md กับดักข้อ 3)

**Index:** pull-model filter ในเครื่องหลังโหลดคลัง → **ไม่ต้องมี composite index ใหม่** (โหลดคลังเหมือน QuestionsView ที่อ่านทั้งคลังอยู่แล้ว)

---

## 8. นอกขอบเขตเฟสนี้ (YAGNI — ทำเฟสถัดไป)

- **ไม่ gate การเผยแพร่ตาม `reviewStatus`** — นโยบาย "เผยแพร่เฉพาะข้อที่ผ่านวิชาการ" (สัปดาห์ 2–3) ทำเฟสหน้า · เฟสนี้แค่ **เก็บ `reviewStatus` ไว้รองรับ** + (optional) เพิ่ม badge/filter ใน QuestionsView ให้แอดมินเห็น "เผยแพร่แล้วแต่ยังไม่ผ่านวิชาการ"
- **ไม่มีระบบ push-assign** ผู้ตรวจล่วงหน้า
- **ไม่มี migration** ข้อเก่า (missing field = pending)
- **ไม่มีหน้ารวมผลตรวจ/ส่งกลับให้คนแก้แบบ workflow** — ข้อ `failed` แค่โชว์สถานะ คนแก้ไปจัดการที่ QuestionsView เดิม

---

## 9. สรุปสิ่งที่ต้องสร้าง (สำหรับเขียน plan)

| ไฟล์ | งาน |
|------|-----|
| `utils/questionReview.js` + `.test.js` | pure: computeStatus / needsReviewBy / tallyReviewCounts |
| `views/ReviewView.vue` | หน้า pull review + ฟอร์ม + leaderboard |
| `router/index.js` | route `/review` (lazy) gate canEditQuestions |
| `stores/...` หรือ composable | โหลดคลัง + submit review (batch) — reuse แพทเทิร์นเดิม |
| `firestore.rules` | match block `questions/{qid}/reviews/{reviewerUid}` (+ deploy) |
| `views/StudyView.vue`, `views/AdminView.vue` | ลิงก์ทางเข้า |
| `views/QuestionsView.vue` *(optional)* | badge/filter สถานะตรวจ |

**ไม่แตะ:** userSchema, examSessions, เกมเพลย์อื่น · **เทส:** pure util ผ่าน `node --test` + build เขียว · เวิร์กโฟลว์: subagent-driven (master + backup branch + ledger) เหมือน PvP/Expedition
