# Home Header: Mailbox & Daily-Quest Buttons — Design

วันที่: 2026-06-24

## ปัญหา

หน้า Home ยาวเกินไป — เรียงเป็นการ์ดต่อกันยาว:
`header → ExamCountdown → ResidenceCard → DailyCard → DailyQuestCard → MailboxCard → (admin)`

เควสประจำวันกับกล่องจดหมายเป็นของที่ "เช็กเป็นครั้งคราว" ไม่ใช่เนื้อหาหลักรายวัน
ทำให้ต้องเลื่อนผ่านทุกครั้งกว่าจะถึงเนื้อหาหลัก

## เป้าหมาย

ยุบ DailyQuestCard + MailboxCard ออกจาก flow หลัก → เป็นปุ่มไอคอนมุมขวาบนของ header
(ระดับเดียวกับชื่อ `RxTU10`) มีจุดแดงแจ้งเตือนเมื่อมีของค้าง · เปิดเนื้อหาเป็น bottom-sheet

ขอบเขต: **เฉพาะ Mailbox + Daily Quest** · DailyCard (เหรียญ + รับรายได้รายวัน) คงไว้ inline ที่เดิม

## พฤติกรรม

### Header
```
┌────────────────────────────────────────┐
│ 🧪  RxTU10                    [📬•] [🎯•] │
│     เภสัช มธ. รุ่น 10 · หน้าหลัก          │
└────────────────────────────────────────┘
```
- ปุ่มไอคอนกลม 2 อันชิดขวา แสดงเฉพาะเมื่อ `authStore.isLoggedIn`
  - 📬 จดหมาย → เปิด Mailbox sheet
  - 🎯 เควส → เปิด Daily Quest sheet
- แต่ละปุ่มมี **จุดแดง** (dot) มุมขวาบนเมื่อมีของค้าง:
  - จดหมาย: `mailbox.attention > 0` (ยังไม่อ่าน หรือมีรางวัลยังไม่รับ)
  - เควส: `!claimed` (วันนี้ยังไม่กดรับรางวัล) — ใช้ตรรกะเดียวกับ `DailyQuestCard.claimed`
    (เควสรีเซ็ตรายวันตาม `dailyQuest.date === today()`)
- จุดแดงเป็นจุดล้วน (ไม่โชว์ตัวเลข) เพื่อความเรียบ

### Bottom-sheet
- รียูสแพทเทิร์นจาก `HelpModal.vue` (overlay มืด + แผงสไลด์ขึ้นจากล่าง, `max-width:480px`,
  `max-height:85dvh`, หัวเรื่อง + ปุ่มปิด ✕, body เลื่อนได้ `overscroll-behavior:contain`)
- เปิดทีละอัน · กดพื้นหลัง/ปุ่ม ✕ เพื่อปิด
- จดหมาย: หัว sheet = `📬 กล่องจดหมาย` (+ปุ่มรีเฟรช ↻ ที่เดิม) · เควส: หัว = `🎯 เควสต์ประจำวัน`

## สถาปัตยกรรม

### คอมโพเนนต์ใหม่
- **`components/shared/BottomSheet.vue`** — shell กลาง generalize จาก HelpModal
  - props: `open` (boolean, v-model:open ผ่าน `update:open`), `title` (string), `icon` (string emoji)
  - slots: default = body · `actions` = ปุ่มเสริมบนหัว (เช่น ↻ รีเฟรชของ Mailbox)
  - emits ปิดเมื่อคลิก overlay หรือปุ่ม ✕ → `update:open=false`
  - หัวเรื่องใช้ `<Emoji>` กับ icon
- **`components/home/HeaderIconButton.vue`** — ปุ่มไอคอนกลม + จุดแดง
  - props: `icon` (emoji), `dot` (boolean), `label` (aria-label)
  - render `<Emoji>` + `<span class="dot" v-if="dot">`

### คอมโพเนนต์ที่แก้
- **`HomeView.vue`**
  - header เพิ่ม `<div class="home-head-actions">` ชิดขวา (margin-left:auto) ใส่ HeaderIconButton 2 อัน
  - state: `showMail`, `showQuest` (ref false)
  - badge: `mailbox.attention`, และ quest `notDone` (computed จาก `auth.userData.dailyQuest`)
  - `onMounted` เรียก `mailbox.load()` (ย้ายมาจาก MailboxCard เพื่อให้จุดแดงโชว์โดยไม่ต้องเปิดแผง)
  - ตัด `<DailyQuestCard />` + `<MailboxCard />` ออกจาก flow หลัก → ใส่ใน `<BottomSheet>` แทน
  - quest `notDone` คำนวณ inline ใน HomeView ด้วย helper ที่แชร์ได้ (ดูด้านล่าง)
- **`MailboxCard.vue`** — ถอดกรอบการ์ดนอก (`.mailbox-card` border/shadow/padding/margin) +
  ถอด head (title 📬 + badge) ออก เพราะ sheet ให้หัวเรื่องแล้ว · ปุ่มรีเฟรช ↻ ย้ายไป slot `actions` ของ sheet
  · เอา `onMounted(mailbox.load)` ออก (ย้ายไป HomeView) แต่คง logic อื่นเดิม
- **`DailyQuestCard.vue`** — ถอดกรอบการ์ดนอก (`.dq-card`) + ถอด head (🎯 เควสต์ประจำวัน) ออก
  เหลือ tasks + ปุ่มรับ + buff/ticket lines เดิม

### Badge helper (เควส)
ตรรกะ "วันนี้ยังไม่กดรับ" ปัจจุบันฝังใน DailyQuestCard (`claimed = q.value.claimed`, โดย `q` เช็ก
`dq.date === today()`). เพื่อให้ HomeView ใช้ซ้ำได้โดยไม่ซ้ำโค้ด เพิ่ม pure helper ใน
`utils/dailyQuest.js`:
```js
// true = วันนี้ยังไม่กดรับรางวัลเควส (ใช้ขับจุดแดง)
export function questNotClaimed(dailyQuest, todayStr) {
  return !(dailyQuest && dailyQuest.date === todayStr && dailyQuest.claimed)
}
```
DailyQuestCard ก็เปลี่ยนมาใช้ helper นี้ได้เพื่อความสอดคล้อง (optional แต่แนะนำ)

## ผลลัพธ์
หน้า Home หลังแก้: `header(+ปุ่ม 📬 🎯) → ExamCountdown → ResidenceCard → DailyCard → (admin)`
เนื้อหาเควส/จดหมายเข้าถึงผ่านปุ่ม + จุดแดงแจ้งเตือน

## ไม่ทำ (YAGNI)
- ไม่ทำ badge แบบตัวเลข (จุดล้วนพอ)
- ไม่ย้าย DailyCard
- ไม่ทำ animation พิเศษนอกจาก slide-up ที่ HelpModal มีอยู่
- ไม่เพิ่ม route ใหม่ (ใช้ sheet ไม่ใช่หน้าแยก)

## ทดสอบ
- ไม่มี test runner กลาง — verify ด้วย `npm run build` + ลองใน dev
- pure helper `questNotClaimed` ทดสอบได้ด้วย `node --test` ถ้าต้องการ (เคสง่าย: date ตรง/ไม่ตรง, claimed true/false)
- manual: จุดแดงขึ้น/หายถูกต้อง, เปิด/ปิด sheet, เนื้อหาในแต่ละ sheet ทำงานครบ (รับรางวัลเควส, อ่าน/รับจดหมาย), หน้า Home สั้นลง
