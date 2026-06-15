# Spec: ยกเครื่องการจัดการคลังข้อสอบ (Question Bank Management)

วันที่: 2026-06-15 · สถานะ: อนุมัติดีไซน์แล้ว รอเขียน implementation plan

## ปัญหา / เป้าหมาย

คลังข้อสอบ (`questions`) จะโตถึง ~2,000 ข้อในระยะยาว ตอนนี้ทั้งฝั่งอ่านและฝั่งจัดการ
"โหลดทั้งคลัง" ทำให้เกิดปัญหา 4 ด้านเมื่อข้อเยอะขึ้น:

1. **Admin UX** — `QuestionsView` เรนเดอร์ทุกข้อในลิสต์เดียว ไม่มีค้นหา/กรอง/แบ่งหน้า → หาไม่เจอ
2. **เผยแพร่ batch** — import เข้ามาเป็น "ร่าง" ทั้งหมด ต้องกดเผยแพร่ทีละข้อ
3. **คุณภาพ / ข้อซ้ำ** — ไม่มีการตรวจซ้ำ ไม่เห็นว่าใครเพิ่ม
4. **ต้นทุน / ความเร็ว** — `QuizView` ดึงข้อที่เผยแพร่ทั้งหมดทุกครั้งที่เริ่ม quiz

### เลขที่ชี้ขาด (สเกล 2,000 ข้อ)
- **Quiz (นักศึกษา)**: ~150 คน × 3 ครั้ง/วัน × 2,000 reads ≈ **900k reads/วัน** ทะลุ free tier (50k/วัน) หลายเท่า → ปัญหาสถาปัตยกรรมจริง
- **Admin**: ใช้แค่ 2–5 คน โหลด 2,000 ข้อนาน ๆ ครั้ง = ต้นทุนต่ำมาก → แก้แค่ UX พอ

หลักการ: **แยกแก้คนละแบบ** — ฝั่ง quiz แก้ที่ data-access (อ่านเฉพาะที่ใช้), ฝั่ง admin เติม UX บนข้อมูลที่โหลดมาแล้ว

## สถานะปัจจุบัน (ก่อนแก้)

- `questions/{id}` = `{ question, choices[], answer, category, explanation, isPublished, createdBy, createdByName, createdAt, updatedAt, source }`
- `QuizView.vue:105` — `getDocs(query(collection('questions'), where('isPublished','==',true)))` → โหลดทั้งหมด สุ่มในเครื่อง
- `QuestionsView.vue:230` — `getDocs(query(collection('questions'), orderBy('createdAt','desc')))` → โหลดทั้งหมด, ลิสต์แบน, แก้/เผยแพร่/ลบทีละข้อ, import (วาง/เลือกไฟล์)
- `firestore.rules` — `allow read: isPublished==true || isAcademic()` · `allow write: isAcademic()`

## การเปลี่ยน Data model (รองรับทุกเฟส)

เพิ่ม 2 ฟิลด์ต่อข้อสอบ ใส่ตอน **สร้าง + import** และ **backfill ของเก่า**:

| ฟิลด์ | ชนิด | ใช้ทำอะไร | เฟส |
|---|---|---|---|
| `rand` | number (0–1) | สุ่มข้อใน quiz แบบ cost คงที่ | 1 |
| `qhash` | string | hash โจทย์ที่ normalize แล้ว → เช็กข้อซ้ำ | 3 |

- `data/userSchema.js` ไม่เกี่ยว (นี่เป็น collection แยก) — แต่ควรรวม helper สร้าง row ข้อสอบไว้ที่เดียว
- `importQuestions.js` `parseImport` ต้องเติม `rand` ให้ทุก row ที่ผ่าน (และ `qhash` ในเฟส 3)
- **Backfill**: ปุ่ม admin "อัปเกรดข้อเก่า" ใน `QuestionsView` วิ่ง `writeBatch` (chunk 500) เติม `rand` (และ `qhash`) ให้ข้อที่ยังไม่มี — ตรวจด้วย field ที่ขาด/undefined

---

## Phase 1 — แก้ cost ฝั่ง Quiz (หัวใจ ทำก่อน)

### พฤติกรรมใหม่ของ QuizView
1. สุ่ม `R = Math.random()`
2. query รอบแรก: `where isPublished==true · orderBy rand · startAt(R) · limit(N)` (N = จำนวนข้อต่อ quiz เช่น 20)
3. ถ้าได้ < N (ชนปลายลิสต์): query รอบสอง `where isPublished==true · orderBy rand · limit(N - got)` แล้ว **dedup ด้วย doc id** (กันข้อซ้ำตอน wrap)
4. สับไพ่ผลลัพธ์ (เพราะ orderBy rand ทำให้เรียงตาม rand)
5. ถ้าคลังเล็กกว่า N → ได้ทุกข้อ (รอบสอง wrap คืนซ้ำ dedup ออก) — ทำงานปกติ

ผล: **อ่าน ~N ข้อ/ครั้ง ไม่ขึ้นกับขนาดคลัง** (~900k → ~9k reads/วัน)

### Index
- เพิ่ม `firestore.indexes.json`: composite `questions (isPublished ASC, rand ASC)`
- deploy ด้วย `firebase deploy --only firestore:indexes`
- (อนาคต) ถ้าทำ "quiz แยกหมวด" ต้องเพิ่ม index `(isPublished, category, rand)` — นอก scope เฟสนี้

### Rules
- **ไม่ต้องแก้** — query กรอง `isPublished==true` ทุก doc ที่คืนตรงเงื่อนไข `allow read` อยู่แล้ว

### ทดสอบ
- หน่วย: logic สุ่ม+wrap+dedup แยกเป็น pure function (เช่น `quizSample(snapshotDocs, R, N)`) + `.test.js` — เคส: คลัง>N, คลัง<N, ชนปลายต้อง wrap, dedup ตอน wrap, คลังว่าง
- มือ: เริ่ม quiz หลายครั้งดูว่าข้อหลากหลาย + ไม่ error เมื่อคลังเล็ก

### Definition of done เฟส 1
quiz ทำงานเหมือนเดิมในสายตาผู้ใช้ · reads/quiz ≈ N · index deploy แล้ว · ข้อเก่า backfill `rand` ครบ

---

## Phase 2 — UX จัดการฝั่ง Admin (pain หา/แก้ + เผยแพร่ batch)

`QuestionsView` ยังโหลดทั้งคลัง (admin น้อยคน = ถูก) แต่เพิ่มเครื่องมือคุมในหน่วยความจำ:

- 🔍 **ค้นหา** — substring (normalize) บน `question` + `category`
- **ตัวกรอง** — สถานะ (ทั้งหมด / เผยแพร่ / ร่าง) + dropdown หมวด (distinct จากที่โหลด)
- **แบ่งหน้า / แสดงเพิ่ม** — เรนเดอร์ทีละ 50 (ปุ่ม "แสดงเพิ่ม") กัน DOM บวมที่ 2,000 รายการ
- ☑️ **เลือกหลายข้อ** — checkbox ต่อข้อ + "เลือกทั้งหมดในผลกรอง"
  - ปุ่ม **เผยแพร่ที่เลือก / ถอนเผยแพร่ / ลบที่เลือก** → `writeBatch` chunk 500
  - ปุ่มลัด **"เผยแพร่ร่างที่กรองอยู่ทั้งหมด"** → จบงานหลัง import คลิกเดียว
- logic กรอง/ค้นหา/เลือก แยกเป็น composable/pure function ที่เทสได้ (ไม่ผูกกับ Firestore)

### Definition of done เฟส 2
หาข้อในคลัง 2,000 ได้ใน <2 วิ · เผยแพร่ทั้ง batch import ได้คลิกเดียว · ไม่มี DOM ค้างจากลิสต์ยาว

---

## Phase 3 — คุณภาพ / กันข้อซ้ำ (pain ซ้ำ/คุณภาพ)

- `qhash` = hash ของ `cleanText(question)` ที่ normalize (lowercase + ตัดช่องว่างซ้อน) — เก็บตอนสร้าง/import
- **ตอน import**: เช็ก `qhash` ชนกับ (ก) ข้ออื่นใน batch เดียวกัน (ข) ของในคลัง → โชว์ "ซ้ำ N ข้อ" + ตัวเลือกข้ามซ้ำอัตโนมัติ
  - เช็กกับคลัง: โหลด set ของ `qhash` ที่มี (academic อ่านได้ทั้งหมด) มาเทียบในเครื่อง
- แต่ละข้อในลิสต์โชว์ **ใครเพิ่ม + เมื่อไหร่** (`createdByName` / `createdAt` มีอยู่แล้ว)
- ปุ่ม **"ตรวจซ้ำในคลัง"** — จัดกลุ่มตาม `qhash` โชว์คู่ซ้ำให้ลบ/รวม
- เทส: `qhash`/normalize เป็น pure + `.test.js` (โจทย์ต่างช่องว่าง/ตัวพิมพ์ → hash เดียวกัน)

### Definition of done เฟส 3
import เตือนข้อซ้ำก่อนเขียน · เห็นผู้เพิ่มทุกข้อ · ตรวจ/ลบข้อซ้ำในคลังได้

---

## ลำดับ & ขอบเขต

**1 → 2 → 3** · เฟสละ commit/deploy แยกได้
- เฟส 1 เร่งด่วนสุด: แก้ cost + ต้อง backfill `rand` ก่อนคลังโตกว่านี้
- เฟส 2 ได้ใช้ทุกวัน
- เฟส 3 เก็บงานคุณภาพ (ตัดออกได้ถ้าต้องรีบ)

## นอก scope (YAGNI)
- quiz pack / sharding (over-engineer ที่ 2,000 ข้อ)
- full-text search engine (substring ในเครื่องพอสำหรับ admin)
- quiz แยกหมวด (เพิ่มทีหลังได้ด้วย index เดียว)
- เวอร์ชัน/ประวัติการแก้ข้อสอบ
