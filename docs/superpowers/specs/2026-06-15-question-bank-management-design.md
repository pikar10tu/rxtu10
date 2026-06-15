# Spec: ยกเครื่องคลังข้อสอบ + คุม Firestore cost (Question Bank & Cost)

วันที่: 2026-06-15 · สถานะ: อนุมัติดีไซน์แล้ว รอเขียน implementation plan

## ปัญหา / เป้าหมาย

คลังข้อสอบ (`questions`) จะโตถึง ~2,000 ข้อในระยะยาว และจำนวนผู้ใช้จะถึง ~150 คนเต็มรุ่น
ตอนนี้หลายจุด "โหลดทั้ง collection" ทำให้เกิดปัญหาเมื่อสเกลขึ้น:

1. **Admin UX** — `QuestionsView` เรนเดอร์ทุกข้อในลิสต์เดียว ไม่มีค้นหา/กรอง/แบ่งหน้า
2. **เผยแพร่ batch** — import เข้ามาเป็น "ร่าง" ต้องกดเผยแพร่ทีละข้อ
3. **คุณภาพ / ข้อซ้ำ** — ไม่มีการตรวจซ้ำ ไม่เห็นว่าใครเพิ่ม
4. **ต้นทุน Firestore reads** — `QuizView` ดึงข้อที่เผยแพร่ทั้งหมด + `members` ดึง user ทั้ง collection
5. **ไม่มีทางรู้ว่าใกล้ชนลิมิต** — Spark free = 50k reads/วัน แต่ไม่มีสัญญาณเตือน
6. **ไม่มีช่องแจ้งข้อสอบผิด** — เจอข้อผิดแล้วบอกวิชาการไม่ได้

### เลขที่ชี้ขาด (สเกลเต็ม ~150 คน, 2,000 ข้อ)
- Spark free: **reads 50k/วัน · writes 20k/วัน · storage 1GiB**
- **Members/Rank** โหลด user ทั้งหมด ~150 docs/เซสชัน → **~22k+ reads/วัน** (ตัวถ่วงหลัก)
- **Quiz** ดึง 2,000 ข้อ/ครั้ง → ~900k reads/วัน ถ้าไม่แก้ (ระเบิดเวลา)
- รวมเสี่ยงทะลุ 50k ฟรี → ต้องลด read ที่ต้นทาง (ฟรี) ก่อนคิดอัปเกรด

หลักการ: **ฝั่งผู้ใช้จำนวนมาก (quiz/members) แก้ที่ data-access ให้อ่านเฉพาะที่ใช้ · ฝั่ง admin จำนวนน้อยเติม UX บนข้อมูลที่โหลดแล้ว**

## สถานะปัจจุบัน (ก่อนแก้)

- `questions/{id}` = `{ question, choices[], answer, category, explanation, isPublished, createdBy, createdByName, createdAt, updatedAt, source }`
- `QuizView.vue:105` — `getDocs(where isPublished==true)` โหลดทั้งหมด สุ่มในเครื่อง
- `QuestionsView.vue:230` — `getDocs(orderBy createdAt desc)` โหลดทั้งหมด, ลิสต์แบน, แก้/เผยแพร่/ลบทีละข้อ, import (วาง/เลือกไฟล์)
- `stores/members.js:24` — `loadFbUsers()` `getDocs(collection users)` ดึงทุกคน; โหลด 1 ครั้ง/เซสชัน (guard ใน Members/Rank), Admin ไม่ guard. **ไม่มี cache ข้ามเซสชัน**
- `firestore.rules` — questions: `read: isPublished==true || isAcademic()` · `write: isAcademic()` · drugReports/feedback: create authed, manage admin
- onSnapshot: own user doc (auth.js) + config/app (useAppConfig) — รายตัว ไม่สเกล

## Data model — ของใหม่

ฟิลด์ใหม่บน `questions/{id}` (ใส่ตอนสร้าง/import + backfill ของเก่า):
| ฟิลด์ | ชนิด | ใช้ | เฟส |
|---|---|---|---|
| `rand` | number 0–1 | สุ่มข้อใน quiz cost คงที่ | 1 |
| `qhash` | string | hash โจทย์ normalize → เช็กซ้ำ | 6 |

Collection ใหม่:
- `questionReports/{id}` = `{ questionId, reason?, reportedBy, reportedByName, createdAt, status: 'open'|'resolved', questionSnapshot }` (เฟส 5)
- `stats/usage_{YYYY-MM-DD}` = `{ date, reads, writes }` ตัวนับประมาณ (เฟส 3)

**Backfill**: ปุ่ม admin "อัปเกรดข้อเก่า" ใน `QuestionsView` วิ่ง `writeBatch` (chunk 500) เติม `rand`/`qhash` ให้ข้อที่ยังไม่มี

---

## Phase 1 — Quiz cost: สุ่ม 15 ข้อแบบ cost คงที่ ⭐ (cost, ทำก่อน)

**N = 15 ข้อต่อ quiz** (const ที่เดียว tunable)

1. สุ่ม `R = Math.random()`
2. รอบแรก: `where isPublished==true · orderBy rand · startAt(R) · limit(15)`
3. ถ้าได้ < 15 (ชนปลาย): รอบสอง `where isPublished==true · orderBy rand · limit(15-got)` แล้ว **dedup ด้วย doc id**
4. สับไพ่ผลลัพธ์
5. **เคสข้อไม่ถึง 15** (สถานะตอนนี้): คืน**เท่าที่มีจริง** quiz เริ่มได้เลย **ไม่ error/ไม่ค้าง** — ความยาวชุด = `Math.min(15, ได้จริง)` · คลังว่าง (0) → ข้อความ "ยังไม่มีข้อสอบ"
6. วิชาการเพิ่มข้อเกิน 15 → สุ่ม 15 เองอัตโนมัติ ไม่ต้องแก้โค้ด

- Index: composite `questions (isPublished ASC, rand ASC)` ใน `firestore.indexes.json` → `firebase deploy --only firestore:indexes`
- Rules: **ไม่ต้องแก้** (query กรอง isPublished==true ตรง `allow read` ทุก doc)
- เทส: pure `quizSample(docs, R, N)` + `.test.js` — เคส >N, <N, wrap, dedup, ว่าง
- ผล: ~900k → ~7k reads/วัน

---

## Phase 2 — Members caching: TTL 8 ชม. ⭐ (cost, ตัวถ่วงหลัก)

แก้ใน `stores/members.js`:
- cache light list ลง `localStorage` key `rxtu10:members:v1` = `{ ts, fbUsers, guestUsers }`
- `loadFbUsers({ force })`:
  1. in-memory มีแล้ว + ไม่ force → ข้าม (เดิม)
  2. มี cache + **สด** (`now - ts < TTL`, **TTL = 8 ชม.**) → hydrate จาก cache **ไม่ยิง Firestore**
  3. ไม่งั้น → `getDocs(users)` สร้าง light map → set in-memory + เขียน cache `ts=now`
- เพิ่มปุ่ม **↻ refresh** บน Members & Rank → `loadFbUsers({ force: true })`
- Admin caller → `force: true` (triage ต้องสด)
- bump `v1`→`v2` ถ้า shape light subset เปลี่ยน · cache เฉพาะ subset เบาเดิม (ห้ามมี base64)
- เทส: pure `readCache(raw, now, ttl)` → fresh/expired/shape-mismatch → ใช้/ทิ้ง + `.test.js`
- **Trade-off ยอมรับแล้ว**: coins/อันดับ stale ได้ถึง 8 ชม. ยกเว้นกด ↻
- ผล: members read จาก "ทุกเซสชัน" → "ทุก 8 ชม./เครื่อง" ตัด read หลัก ~60–70%

---

## Phase 3 — แจ้งเตือนใกล้ชนลิมิต (ทำทั้งคู่)

**3a. Cloud Monitoring → อีเมล (backstop เชื่อถือได้, ฟรี, ไม่กิน read/write)**
- ตั้ง alerting policy ใน GCP บน metric `firestore.googleapis.com/document/read_count` (+ write_count) → อีเมลหา admin เมื่อ rolling 1 วัน > ~40k (80%)
- เป็น **งาน setup (ไม่ใช่โค้ด)** — เขียนเป็นขั้นตอนใน docs ให้ทำใน console
- ⚠️ ต้องเช็ก: บางนโยบาย alert ของ Cloud Monitoring ใช้ได้บน Spark หรือไม่ — ถ้าจำเป็นต้อง Blaze ให้ลดมาพึ่ง 3b เป็นหลัก (Blaze ยังฟรี quota เดิม จ่ายเฉพาะส่วนเกิน)

**3b. ตัวนับประมาณในแอป + banner (เห็นในที่เดียว)**
- doc `stats/usage_{today}` `{ reads, writes }`
- **กิน write น้อย**: สะสม estimate ในเครื่องต่อเซสชัน (accumulator) แล้ว **flush ครั้งเดียว** ด้วย `increment(delta)` ตอนปิด/เปลี่ยนหน้า → ~1 write/เซสชัน (ไม่ใช่ทุก read) · `increment` atomic ไม่ต้อง read ไม่ชนกัน
- instrument เฉพาะจุด getDocs ใหญ่ (members, quiz, questions, news) → บวก `snapshot.size`
- หน้า Admin: อ่าน `stats/usage_{today}` โชว์เกจ reads/50k, writes/20k · **banner เตือน**เมื่อ est. reads > เกณฑ์อนุรักษ์ (เช่น 35k เพราะตัวนับ undercount)
- ระบุชัดว่า "ประมาณการ" (ไม่นับ snapshot listener echo)
- เทส: pure logic accumulator/threshold + `.test.js`
- Rules: `stats/{id}` — `read: isAdmin()` · `write: request.auth != null` (เฉพาะ increment field ที่กำหนด)

---

## Phase 4 — Admin management UX (pain หา/แก้ + เผยแพร่ batch)

`QuestionsView` ยังโหลดทั้งคลัง (admin น้อยคน = ถูก) เพิ่มเครื่องมือในหน่วยความจำ:
- 🔍 ค้นหา substring (normalize) บน `question` + `category`
- กรอง: สถานะ (ทั้งหมด/เผยแพร่/ร่าง) + dropdown หมวด (distinct)
- แบ่งหน้า/แสดงเพิ่มทีละ 50 (กัน DOM บวม)
- ☑️ เลือกหลายข้อ + "เลือกทั้งหมดในผลกรอง" → **เผยแพร่/ถอน/ลบ ที่เลือก** (`writeBatch` chunk 500)
  - ปุ่มลัด **"เผยแพร่ร่างที่กรองอยู่ทั้งหมด"** → จบงานหลัง import คลิกเดียว
- logic กรอง/เลือก แยกเป็น pure/composable เทสได้

---

## Phase 5 — แจ้งข้อสอบผิด (🚩 report → วิชาการรีวิว)

ทำตามแพทเทิร์น `drugReports`/`feedback`:
- **ปุ่ม 🚩 "แจ้งข้อผิด"** ใน `QuizView` (ตอนเฉลย/รีวิวแต่ละข้อ) → ใส่เหตุผลสั้น ๆ (ไม่บังคับ) → สร้าง `questionReports`
- เก็บ `questionSnapshot` (ข้อความ ณ ตอนแจ้ง) กันข้อถูกแก้/ลบแล้วรีวิวไม่ได้
- **ฝั่งวิชาการ**: ใน `QuestionsView` เพิ่มตัวกรอง/แท็บ **"🚩 ถูกแจ้ง (N)"** → เห็นข้อ + เหตุผล → กดแก้ทันที (เปิด editor) → กด **resolved**
- กันแจ้งซ้ำ (optional): ผู้ใช้คนเดิม + ข้อเดิม → ไม่สร้าง report ซ้ำ
- Rules: `questionReports/{id}` — `create: request.auth != null && request.resource.data.reportedBy == request.auth.uid` · `read/update/delete: isAcademic()`

---

## Phase 6 — คุณภาพ / กันข้อซ้ำ (qhash)

- `qhash` = hash ของ `cleanText(question)` normalize (lowercase + ตัดช่องว่างซ้อน) เก็บตอนสร้าง/import
- import: เช็ก `qhash` ชน (ก) ใน batch (ข) ในคลัง → โชว์ "ซ้ำ N ข้อ" + ข้ามซ้ำอัตโนมัติ
- ลิสต์โชว์ **ใครเพิ่ม + เมื่อไหร่** (`createdByName`/`createdAt` มีแล้ว)
- ปุ่ม **"ตรวจซ้ำในคลัง"** จัดกลุ่มตาม `qhash` โชว์คู่ซ้ำให้ลบ/รวม
- เทส: `qhash`/normalize pure + `.test.js`

---

## ลำดับ & ขอบเขต

แนะนำทำ **cost track ก่อน** (เป็นความเสี่ยงจริงตอนเปิดตัว) แล้วค่อย management track:

1. **Phase 1** Quiz cost ⭐ (เร่งด่วน + backfill `rand` ก่อนคลังโต)
2. **Phase 2** Members cache ⭐ (ตัวถ่วง read หลัก)
3. **Phase 3** แจ้งเตือนลิมิต (มองเห็นความเสี่ยง)
4. **Phase 4** Admin UX (ได้ใช้ทุกวัน)
5. **Phase 5** แจ้งข้อสอบผิด (ค่อนข้างอิสระ เลื่อนขึ้นได้ถ้าวิชาการอยากได้ก่อน)
6. **Phase 6** dedup/คุณภาพ (เก็บงาน)

เฟสละ commit/deploy แยกได้

## นอก scope (YAGNI)
- quiz pack / sharding (over-engineer ที่ 2,000 ข้อ)
- full-text search engine (substring ในเครื่องพอสำหรับ admin)
- quiz แยกหมวด (เพิ่มทีหลังด้วย index `(isPublished, category, rand)`)
- ระบบนับ read แบบแม่นยำ 100% (ใช้ Monitoring เป็นตัวจริง, ในแอปเป็นค่าประมาณ)
- auto-disable billing เมื่อเกินงบ (ใช้ budget alert พอ)
- เวอร์ชัน/ประวัติการแก้ข้อสอบ
