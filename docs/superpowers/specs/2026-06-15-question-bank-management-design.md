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

## Phase 1 — Quiz cost: windowed sampling + meta-doc ⭐ (cost, ทำก่อน)

> **แก้จากดีไซน์แรก:** `QuizView` ของจริงมี **เลือกหมวด + เลือกจำนวน** ที่ต้องเห็น pool ทั้งก้อน
> การ "สุ่ม 15 ตรง ๆ" จะทำฟีเจอร์พัง → ใช้ **meta-doc** (โชว์หมวด/จำนวนโดยไม่โหลดทั้งคลัง) + **windowed query** (อ่านเฉพาะที่จะทำ)

### meta-doc — `config/questionsMeta`
`{ publishedTotal: number, categories: string[] }`
- อ่าน **1 doc** ตอนเข้า QuizView home → เรนเดอร์ "มีข้อสอบ X ข้อ" + chips หมวด (แทนการ `getDocs` ทั้งคลัง)
- **ดูแลโดย admin actions** ใน `QuestionsView` (เพิ่ม hook ใน save/remove/import เดิม):
  - publish ข้อ (เดี่ยว/bulk): `publishedTotal += n` · เพิ่ม category ใหม่เข้า `categories`
  - unpublish/ลบข้อที่เผยแพร่: `publishedTotal -= n`
  - หมวดที่ไม่มีข้อเหลือ (ลบไม่ออกจาก array แบบ incremental): ยอม stale ได้ → ปุ่ม admin **"🔄 คำนวณ meta ใหม่"** อ่านทั้งคลังครั้งเดียว (admin น้อยคน = ถูก) เขียน meta ใหม่
- Rules: `config/{id}` เดิม public-read/admin-write ใช้ได้ (questionsMeta อ่านโดย authed, เขียนโดย academic)

### windowed query ตอนเริ่ม quiz
**N เลือกได้ 5/10/15/20** (เอา "ทั้งหมด" ออก — มันคืออ่านทั้งคลัง = แพง · ค่าเริ่ม 15)
1. สุ่ม `R = Math.random()`
2. รอบแรก: `where isPublished==true [· where category==X] · orderBy rand · startAt(R) · limit(N)`
3. ถ้าได้ < N (ชนปลาย): รอบสอง `where isPublished==true [· where category==X] · orderBy rand · limit(N-got)` → **dedup ด้วย doc id**
4. สับไพ่ + `shuffleChoices` (ของเดิม)
5. **ข้อไม่ถึง N / คลังว่าง**: คืนเท่าที่มี (`Math.min(N, ได้จริง)`) ไม่ error · ว่าง → "ยังไม่มีข้อสอบ"

### Index (`firestore.indexes.json` — สร้างใหม่ + ผูกใน `firebase.json`)
- `questions (isPublished ASC, rand ASC)` — ควิซรวมทุกหมวด
- `questions (isPublished ASC, category ASC, rand ASC)` — ควิซแยกหมวด
- deploy: `firebase deploy --only firestore:indexes`

### อื่น ๆ
- ใส่ `rand = Math.random()` ตอน **สร้าง/import** ทุกข้อ · **backfill** ของเก่าด้วยปุ่ม admin (writeBatch chunk 500)
- Rules questions: **ไม่ต้องแก้** (query กรอง isPublished==true ตรง `allow read`)
- เทส pure: `quizSample(firstDocs, wrapDocs, N)` → dedup+ตัด N + `.test.js` (>N, <N ต้อง wrap, dedup ซ้ำ, ว่าง)
- ผล: quiz read จาก ~ทั้งคลัง/เปิด → **1 (meta) + N (เริ่ม)** ต่อครั้ง

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

1. **Phase 1** Quiz cost ⭐ (เร่งด่วน + backfill `rand` ก่อนคลังโต) — ✅ เสร็จ + deploy แล้ว
2. **Phase 2** Members cache ⭐ (ตัวถ่วง read หลัก) — ✅ เสร็จ (`utils/membersCache.js` + test, `stores/members.js`, ↻ Members/Rank, Admin force) รอ deploy
3. **Phase 3** แจ้งเตือนลิมิต (มองเห็นความเสี่ยง) — ✅ โค้ด 3b เสร็จ (`utils/usageMeter.js`+test, `stores/usage.js`, instrument members/quiz/questions/news + patchUser, Admin เกจ+banner, rules `stats/{id}`) · 3a = docs `docs/cloud-monitoring-firestore-alert.md` (user setup console) · **รอ deploy rules + setup Monitoring**
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
