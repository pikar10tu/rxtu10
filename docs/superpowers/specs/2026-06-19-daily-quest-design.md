# Spec: Daily Quest

วันที่: 2026-06-19 · สถานะ: **ดีไซน์อนุมัติแล้ว** (ผ่าน brainstorming)

## ขอบเขต & ที่มา
เควสต์รายวันผูกการเรียนเข้ากับเกม — ทำครบ 3 อย่าง/วัน → รับ buff รายได้ + ตั๋วกาชาฟรี
**Override:** แทนแนวคิด daily quest ×1.25 ใน `2026-06-17-economy-step1-design.md` (เดิม SRS+quiz≥15 → ×1.25). ใช้อันนี้แทน

**Decisions (brainstorming 2026-06-19):**
- 3 เควสต์/วัน: **ข้อสอบ ≥5 ข้อ · แฟลชการ์ด ≥5 ใบ · เปิดกาชา ≥1 ครั้ง** · รีเซ็ตรายวัน
- รางวัลเมื่อครบ (กดรับครั้งเดียว/วัน): **(1) รายได้ idle ×1.5 นาน 24 ชม.** (มี countdown) **(2) ตั๋วกาชาฟรี +1**
- buff = 24 ชม.จากเวลา claim (ไม่ใช่สิ้นวัน) · โชว์ countdown ในการ์ด daily quest + โชว์สถานะ buff ที่การ์ดรายได้ (DailyCard) ด้วย
- ตั๋วกาชาฟรีสุ่ม tier `common` ไปก่อน (tunable — ปรับตอน rework กาชา)
- daily reset ใช้ `new Date().toISOString().slice(0,10)` ตาม pattern cap เดิม (quiz/study)
- ไม่ต้องแก้ rules (ทุก field อยู่บน user doc เขียนผ่าน patchUser owner-only) · trust-based

## 1. Data model (user doc — `data/userSchema.js`)
- `dailyQuest: { date: null, quiz: 0, study: 0, gacha: 0, claimed: false }` (nested แบบ residence/farm; normalize ให้เป็น object เต็ม)
- `freeGachaTickets: 0` (number)
- `incomeBuffUntil: null` (ms timestamp — buff active เมื่อ `Date.now() < incomeBuffUntil`)

## 2. Pure util `utils/dailyQuest.js` (+เทส)
- `QUEST_GOALS = { quiz: 5, study: 5, gacha: 1 }` (export, tunable)
- `bumpDailyQuest(dq, field, today, n=1)` → object ใหม่: ถ้า `dq.date !== today` → เริ่มใหม่ `{date:today, quiz:0,study:0,gacha:0, claimed:false}` ก่อน แล้ว `+n` ที่ field (กัน field เกินเป็นค่าจริงได้ ไม่ clamp)
- `questComplete(dq, today)` → bool: `dq.date===today && quiz>=5 && study>=5 && gacha>=1`
- `questClaimable(dq, today)` → `questComplete && !dq.claimed`
- `questIncomeMult(userData, now)` → `(userData?.incomeBuffUntil && now < userData.incomeBuffUntil) ? 1.5 : 1`
- `BUFF_MS = 24*60*60*1000`
- เทส: reset เมื่อข้ามวัน, +n สะสม, complete/claimable เงื่อนไขครบ/ไม่ครบ/claimed แล้ว, mult ตามเวลา (ก่อน/หลัง expire)

## 3. นับ progress — 3 จุด (ผ่าน `bumpDailyQuest` + patchUser)
ทุกจุด: คำนวณ `today` → `const dq = bumpDailyQuest(userData.dailyQuest, '<field>', today, n)` → `patchUser({ dailyQuest: dq }, { dailyQuest: dq })` (เขียนทั้ง object — เลี่ยง increment ซ้อนกับ reset logic)
- **QuizView `finish()`**: `bumpDailyQuest(.., 'quiz', today, answered.value)` (จำนวนข้อที่ตอบ) — รวมในการเขียน user doc ที่มีอยู่
- **StudyView `grade()`** (การ์ดใหม่ในเซสชัน, ก้อน `if(!rewarded.has(id))`): `'study'`, n=1 → ส่งผ่าน `commit()`
- **ShopView `buy()` + ใช้ตั๋วฟรี**: `'gacha'`, n=1 (นับทั้งซื้อด้วยเหรียญและใช้ตั๋วฟรี)

## 4. Claim + buff รายได้
- **DailyQuestCard** ปุ่ม "รับรางวัล" (enable เมื่อ `questClaimable`) → `patchUser`:
  - optimistic: `dailyQuest:{...dq, claimed:true}`, `freeGachaTickets: (cur||0)+1`, `incomeBuffUntil: Date.now()+BUFF_MS`
  - server: `'dailyQuest.claimed': true`, `freeGachaTickets: increment(1)`, `incomeBuffUntil: Date.now()+BUFF_MS`
  - toast "รับรางวัลแล้ว! รายได้ ×1.5 24 ชม. + ตั๋วกาชาฟรี"
- **`useDaily.js`**: คูณ rate ด้วย `questIncomeMult(userData, Date.now())` (วางหลัง/รวมกับโบนัส tags เดิม) → buff มีผลกับ idle income ที่สะสม/เก็บระหว่าง 24 ชม. · trust-based (ยอมรับ imprecision รอยต่อตอน claim income)

## 5. ใช้ตั๋วกาชาฟรี (ShopView)
- `data/shop.js` (หรือ data/index): `export const DAILY_QUEST_TICKET_EGG = 'common'` (tunable)
- ShopView: ปุ่ม "🎟️ ใช้ตั๋วฟรี (×{freeGachaTickets})" แสดงเมื่อ `freeGachaTickets>0`
  - กด → เช็ก storage cap (เหมือน buy) → `rollPetFromEgg(DAILY_QUEST_TICKET_EGG)` → `patchUser` optimistic+server: `pets: arrayUnion(pet)`, `freeGachaTickets: increment(-1)`, `dailyQuest` bump `'gacha'` → reveal pet (reuse `reveal` animation) → **ไม่หักเหรียญ**
  - กันกดรัว (`buying` flag เดิม)

## 6. UI — การ์ดบน Home: `components/home/DailyQuestCard.vue`
- วางบน HomeView (ใกล้ DailyCard/MailboxCard) เห็นเมื่อ `isLoggedIn`
- หัวการ์ด "🎯 เควสต์ประจำวัน" + HelpButton (optional)
- 3 แถบ progress: `📝 ทำข้อสอบ {min(quiz,5)}/5` · `📚 ทบทวนการ์ด {min(study,5)}/5` · `🎰 เปิดกาชา {min(gacha,1)}/1` (แถบเต็ม=เขียว/เช็ก)
- ปุ่ม "รับรางวัล (×1.5 + ตั๋วฟรี)" — enable เมื่อ `questClaimable`, ถ้า `claimed` แสดง "รับแล้ววันนี้"
- ถ้า buff active (`incomeBuffUntil > now`): แถบสถานะ "⚡ รายได้ ×1.5 · เหลือ {countdown}" (countdown อัปเดตทุกวินาที/นาที ด้วย timer ในคอมโพเนนต์ เหมือน DailyCard)
- emoji ผ่าน `<Emoji char>` เสมอ

## 7. โชว์สถานะ buff ที่ DailyCard (รายได้)
- `components/home/DailyCard.vue` breakdown: เพิ่มแถว (เหมือน `dc-bonus` ของ supporter) เมื่อ buff active: "⚡ โบนัสเควสต์รายวัน +50%" + (ถ้าจะใส่) countdown สั้นๆ
- rate ที่ DailyCard โชว์/เก็บต้องสะท้อน ×1.5 (มาจาก useDaily ที่คูณ mult แล้ว — DailyCard อ่านจาก useDaily)

## 8. Rules + เทส
- **ไม่แก้ rules** — `dailyQuest`/`freeGachaTickets`/`incomeBuffUntil` เป็น field บน user doc (owner write ครอบอยู่แล้ว)
- เทส pure: `utils/dailyQuest.test.js` (bump/reset/complete/claimable/mult)

---

## Out of scope
- ไม่ผูก achievement กับ daily quest (ทำทีหลังได้ผ่าน awarded path ที่มีแล้ว)
- ไม่มี streak/ต่อเนื่องหลายวัน (YAGNI — เพิ่มทีหลัง)
- rework กาชา (แยกงาน) — ตั๋วฟรีใช้ `DAILY_QUEST_TICKET_EGG` ที่ปรับทีหลังได้

## หลักการที่ยึด
- pure util + `node --test` · เพิ่ม field → `userSchema.js` ที่เดียว · เขียน user doc ผ่าน `patchUser`
- daily reset แบบ write-time (`bumpDailyQuest` รีเซ็ตเมื่อ date เปลี่ยน) — ไม่ต้องมี cron
- buff/ticket trust-based ตาม stance ทั้งแอป
