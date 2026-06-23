# Study Redesign SP1 — จัด IA หน้า Study + ฮับโหมด + Zen + เศรษฐกิจใหม่

วันที่: 2026-06-23
สถานะ: design (อนุมัติแล้ว — รอ plan)

## บริบท: นี่คือ SP1 ของการรื้อ Study/Quiz 3 ก้อน

ผู้ใช้ต้องการรื้อหน้า Study ให้เน้นทำข้อสอบ + เพิ่มโหมดใหม่ + ปรับเศรษฐกิจ งานใหญ่ จึงซอยเป็น 3 sub-project (แต่ละอันมี spec→plan→build แยก):

- **SP1 (เอกสารนี้):** จัด IA หน้า Study (ข้อสอบบน/flashcard ล่าง) + "ฮับเลือกโหมด" + **Zen mode** + **เศรษฐกิจข้อสอบใหม่**. frontend + reward ล้วน — **ไม่มี backend/leaderboard/rules ใหม่**
- **SP2 (ภายหลัง):** **ข้อสอบประจำวัน (Daily Challenge)** — ชุด deterministic 3 ข้อเดียวกันทั้งรุ่น/วัน, เล่นสไตล์ Kahoot, วันละครั้ง, leaderboard, แจกรางวัล top-N ผ่าน Mailbox
- **SP3 (ภายหลัง):** **Time Attack** — จับเวลา 4/15 นาที, leaderboard

ใน SP1 โหมด Daily Challenge + Time Attack จะ**โชว์การ์ดค้างไว้พร้อม badge "เร็วๆ นี้"** (กดไม่ได้) เพื่อให้นักศึกษาเห็นว่ากำลังจะมา และ layout ฮับครบตั้งแต่แรก

**โน้ตกันสับสน:** "ข้อสอบประจำวัน" (SP2) เป็นคนละอันกับ **Daily Quest** ที่มีอยู่แล้ว (3 เควสต์/วัน รวม "ทำข้อสอบ 5 ข้อ" → บัฟรายได้) และ **Daily Card** (เก็บเหรียญรายวัน). SP1 ไม่แตะของพวกนี้

## ขอบเขต SP1

**ทำ:**
1. รื้อ layout `StudyView` (home) — ข้อสอบบน, flashcard ล่าง, เพิ่มฮับการ์ดโหมด
2. การ์ดโหมด presentational ใช้ซ้ำได้ (`QuizModeCard.vue`)
3. **Zen mode** ใน `QuizView` (รับ `?mode=zen`) — ทำต่อเนื่องไม่จำกัดจนกดออก
4. **เศรษฐกิจข้อสอบใหม่** — 100 เหรียญ/ข้อถูก, เพดาน/วัน = `max(1000, residenceDailyIncome(level))`, pure util + เทส

**ไม่ทำ (เก็บไป SP2/SP3):** logic Daily Challenge, logic Time Attack, leaderboard, Firestore collection/rules/index ใหม่, schema/migration ใหม่

## 1. StudyView — โครงหน้าใหม่ (เฉพาะ `mode === 'home'`)

เรียงบน→ล่าง:

1. **`<ExamCountdown />`** (คงเดิม บนสุด)
2. **ส่วน "ทำข้อสอบ"** (หัวข้อ + การ์ดโหมด เรียงตามนี้):
   - 🗓️ **ข้อสอบประจำวัน** — `comingSoon` (badge "เร็วๆ นี้", กดไม่ได้) · subtitle "ชุดเดียวกันทั้งรุ่น 3 ข้อ แข่งเก็บคะแนน"
   - 📝 **ทั่วไป** — `to="/quiz"` · subtitle "เลือกหมวด + จำนวนข้อ (5/10/15/20) ได้เหรียญ"
   - ♾️ **Zen** — `to="/quiz?mode=zen"` · subtitle "ทำเรื่อยๆ ไม่จำกัด ฝึกจนพอใจ"
   - ⏱️ **Time Attack** — `comingSoon` · subtitle "แข่งกับเวลา 4 / 15 นาที"
3. **ส่วน "ทบทวน flashcard"** (หัวข้อ + เนื้อหา home flashcard เดิมทั้งหมด ย้ายลงมา): `sv-stats` (due/new/mastered) + `sv-progress` + ปุ่ม `sv-start` เริ่มทบทวน + `sv-freebtn` ฝึกอิสระ + `sv-caphint`
4. **ลิงก์ 🛠️ จัดการคลังข้อสอบ** (`isQuestionEditor`, โทนอำพันเดิม `sv-acadlink`) — ล่างสุด

ลบ `RouterLink .sv-quizlink` เดิม (ทางเข้า /quiz แบบลิงก์เดียว) — แทนด้วยการ์ดโหมด. ส่วน review/done/report modal ของ flashcard **ไม่เปลี่ยน**

### `components/study/QuizModeCard.vue` (ใหม่, presentational)
- props: `emoji` (string), `title` (string), `subtitle` (string), `to` (string|null), `comingSoon` (bool default false)
- ถ้า `comingSoon` → render เป็น `<div>` (กดไม่ได้, ทึบลง, badge "เร็วๆ นี้" มุมขวา) · ไม่งั้น → `<RouterLink :to="to">` (กดได้, มี ›)
- ใช้ `<Emoji :char="emoji" />` (กัน tofu), aria เหมาะสม (comingSoon = `aria-disabled`)
- สไตล์ scoped ในตัว (แนวเดียวกับ `.sv-quizlink` เดิม)

## 2. Zen mode (`QuizView.vue`, รับ `?mode=zen`)

**โมเดล:** reuse quiz engine เดิม (pick/next/choiceClass) แต่ session ไม่มีจำนวนข้อตายตัว ทำจนกดออก

- อ่าน variant จาก `route.query.mode` → `'zen'` หรือ default `'normal'` (useRoute import อยู่แล้ว)
- เข้าด้วย `?mode=zen` → **ข้ามหน้าเลือกหมวด/จำนวน** เริ่ม Zen ทันที (ทุกหมวด, ไม่กรอง domain)
- **โหลดข้อแบบ batch:** reuse การสุ่ม windowed `orderBy rand` เดิม ดึงทีละ batch (เช่น 15 ข้อ) · เมื่อทำใกล้หมด batch (เหลือ ≤2) โหลด batch ถัดไปต่อท้าย `quiz` array · ทำได้ไม่จำกัด (best-effort กันซ้ำติดกันด้วยช่วง rand ที่ต่างกัน — ยอมรับซ้ำได้บ้างถ้าคลังเล็ก)
- UI ตอนทำ: แถบบนแทนที่ progress-เต็มด้วย **ตัวนับข้อที่ทำ** (เช่น "ข้อที่ 7") + คะแนนวิ่ง `correct/answered` (reuse `qv-running`) · ปุ่ม ✕ ออก
- **กดออก (✕) = จบ session** → ไปหน้า result (reuse) แสดง: ทำไป N ข้อ · ถูก M · เหรียญที่ได้
- **เหรียญ:** ได้ตามเศรษฐกิจใหม่ (ข้อ 3) — **แชร์เพดานรวมกับโหมดทั่วไป** ผ่าน `quizCoinDate`/`quizCoinsToday` เดิม (Zen เล่นนานแค่ไหนก็ไม่เกินเพดาน = กันฟาร์ม)
- **นับเหมือนโหมดทั่วไป:** `quizDoneTotal += answered`, `bumpDailyQuest('quiz', …, answered)`, `questionStats/{qid}` increment (reuse SP2b path), เขียน `examSessions` (total = จำนวนที่ทำ)
- เก็บ `id` ต่อข้อใน answers อยู่แล้ว (จาก SP2b) → questionStats ใช้ได้เลย

**finish() ปรับให้รองรับ 2 variant:** normal จบเมื่อทำครบ `quiz.length`; zen จบเมื่อกดออก. ใช้ `answered.value`/`correct.value` ที่มีอยู่ทั้งคู่ — ตรรกะ reward/บันทึกใช้ร่วมได้ (normal: total=quiz.length, zen: total=answered)

## 3. เศรษฐกิจข้อสอบใหม่ (`utils/quizReward.js` + pins)

### pins ใน `data/index.js`
```js
export const QUIZ_COIN_PER_CORRECT = 100   // เหรียญต่อข้อที่ตอบถูก (เดิม 10)
export const QUIZ_DAILY_CAP_FLOOR  = 1000  // พื้นเพดาน/วัน (บ้านเล็กไม่ตันเกินไป)
```

### `utils/quizReward.js` (pure + เทส)
```js
import { residenceDailyIncome } from '../data/residence.js'   // pure ไม่พึ่ง firebase

// เพดานเหรียญข้อสอบต่อวัน = มากสุดระหว่างพื้น กับ รายได้บ้าน/วัน ของเลเวลนั้น
export function quizDailyCap(level, floor) {
  return Math.max(floor, residenceDailyIncome(level))
}
// เหรียญที่ได้จริงรอบนี้ (clamp ไม่เกินเพดานที่เหลือ)
export function quizGrant(correct, earnedToday, cap, perCorrect) {
  return Math.max(0, Math.min(correct * perCorrect, cap - earnedToday))
}
```
เทสครอบ: cap = พื้นเมื่อบ้านเล็ก (Lv1 income 300 < 1000 → 1000) / cap = รายได้บ้านเมื่อบ้านใหญ่ (Lv15 → 140000) / grant clamp เมื่อใกล้เต็มเพดาน / grant = 0 เมื่อเต็มแล้ว / perCorrect คูณถูก

### แก้ `QuizView.finish()`
- แทน `DAILY_CAP=300`/`COIN_PER_CORRECT=10` inline → ใช้ pins + util:
  ```js
  const level = authStore.userData?.residence?.level || 1
  const cap = quizDailyCap(level, QUIZ_DAILY_CAP_FLOOR)
  const grant = quizGrant(correct.value, earnedToday, cap, QUIZ_COIN_PER_CORRECT)
  ```
- อัปเดตข้อความ hint หน้า home: "+10/ข้อ" → "+100/ข้อ" + เพดานแสดงเป็น "ตามเลเวลบ้าน (ขั้นต่ำ 1,000)" (ไม่โชว์ตัวเลขเดียวเพราะ cap ผันตามบ้าน)
- toast เดิม `ได้ X🪙` คงเดิม (X = grant)

## Data flow / ไม่กระทบ cost

- reward คำนวณฝั่ง client เขียนผ่าน `patchUser` รอบเดียว (เดิม) — **ไม่เพิ่ม read/write** ต่อ quiz เกินที่มี
- Zen เพิ่ม read เฉพาะตอนโหลด batch ต่อ (เท่าจำนวนข้อที่ดึง เหมือนโหมดทั่วไปดึงตามจำนวนที่เลือก) — อยู่ในงบ
- ไม่มี collection/rules/index/schema ใหม่ใน SP1

## Testing

- `utils/quizReward.test.js` (`node --test`) — quizDailyCap + quizGrant ตามเคสด้านบน
- ส่วน UI (StudyView layout, QuizModeCard, Zen flow) ตรวจด้วย `npm run build` + ทดลอง dev (ไม่มี test runner กลาง)

## Edge cases / กับดัก

- เข้า `/quiz?mode=zen` ตอนยังไม่มีข้อสอบเผยแพร่ → โชว์ empty เหมือนโหมดทั่วไป (ไม่ค้าง)
- Zen โหลด batch ต่อแล้วคลังหมด/ไม่พอ → จบ session อย่างนุ่มนวล (ไม่ infinite loop รอข้อที่ไม่มา)
- บ้านเลเวลหาย/undefined → `residenceDailyIncome` clamp อยู่แล้ว (Lv1) → cap = พื้น 1000
- เพดานแชร์: เล่นทั่วไปจนเกือบเต็ม แล้วต่อ Zen → grant ต่อเนื่องจากเพดานที่เหลือ (ใช้ `quizCoinsToday` เดิม)
- การ์ด comingSoon ต้องกดไม่ได้จริง (ไม่ใช่แค่หน้าตา) — ใช้ `<div>` ไม่ใช่ RouterLink ที่ disabled ด้วย CSS
