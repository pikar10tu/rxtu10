# UI/IA Rework — รวมแกนเกม + ดัน "ฉัน" + design system สม่ำเสมอ

**วันที่:** 2026-06-23
**สถานะ:** อนุมัติดีไซน์แล้ว รอเขียน plan
**Backup:** branch `backup/pre-ui-rework-2026-06-23` (= `f8fcb5c`, prod ปัจจุบัน)

## ปัญหา / เหตุผล

ก่อนเปิดตัวจริง ต้องการจัด UI ใหม่ด้วยเหตุผล 4 ข้อ (ผู้ใช้ยืนยันทั้งหมด): (1) **รองรับของใหม่ที่จะมา** — Battle/Tower/PvP, ข้อสอบประจำวัน, Time Attack ยังไม่มีบ้านชัดเจน (2) **ของตอนนี้กระจัดกระจาย** — แกนเกม/เศรษฐกิจกระจาย 3 ที่ (บ้าน+รายได้ที่ Home, ฟาร์ม+เพ็ทที่ Play, กาชา+แล็บที่ Shop) (3) **หน้าตา/ความสวยงาม** — มี 2 ภาษาดีไซน์ปนกัน (4) **ก่อนเปิดตัวจริง**

**จุดอ่อนหลัก 2 อย่าง:**
1. `🛒 Shop` กินช่อง bottom-nav ทั้งช่อง ทั้งที่เป็นแค่ส่วนหนึ่งของแกนเกม — ขณะที่ `👤 ฉัน/โปรไฟล์` (ตัวตน + achievement + เพ็ทเด่น) ที่ควรเด่นตอนเปิดตัว กลับซ่อนหลังการแตะการ์ดบน Home
2. แกนเกมกระจาย 3 หน้า ไม่มีบ้านรวมให้ Battle ที่จะมา

## แนวทางที่เลือก: A — รวมเกมไว้ใต้ Play + ดัน "ฉัน" ขึ้น nav

เปลี่ยน "ทางเข้า" และการจัดกลุ่ม ไม่แตะ router path/logic/schema/rules

## ขอบเขต (Scope)

**ทำ:** โครง IA (สลับ nav, จัดกลุ่มการ์ด, ย้ายทางเข้า) + ย้าย/จัดกลุ่มเนื้อหาในหน้า + เก็บกวาด design token ให้เหลือภาษาเดียว (สติกเกอร์)

**ไม่ทำ (เก็บ post-launch):** ออกแบบสี/ฟอนต์ใหม่, รื้อ component ราย element ลึก, แตะ logic/router path/Firestore schema/rules, แตะเนื้อหา ShopView/QuizView/QuestionsView/AdminView/MembersView ภายใน

## รายละเอียดตามส่วน

### 1. Navigation + Routing

Bottom-nav 5 ช่อง เปลี่ยนแค่ช่องที่ 5:
```
🏠 Home   👥 Members   🎮 Play   📚 Study   👤 ฉัน
```
- ถอด `🛒 Shop` ออกจาก nav (route `/shop` ยังอยู่ เข้าผ่านการ์ดใน Play)
- เพิ่ม `👤 ฉัน` → route `/me` (เดิมเป็นหน้าซ่อน)

**Route ทั้งหมดคงเดิม** ไม่ลบ ไม่เปลี่ยน path:

| Route | ทางเข้าเดิม | ทางเข้าใหม่ |
|-------|-----------|------------|
| `/shop` | nav ช่อง 5 | การ์ดเดียว "🛒 ร้านค้า" ใน Play (เข้าไปเจอ 2 แท็บเดิม อัญเชิญ/ห้องทดลอง) |
| `/me` | แตะการ์ดโปรไฟล์ใน Home | nav ช่อง 5 |
| `/pets` | การ์ดใน Play | คงเดิม (การ์ดใน Play) |
| `/questions`, `/admin`, `/quiz` | ลิงก์ตามบทบาท | คงเดิม |

### 2. หน้า Play = "ฮับเกม" (จัด 3 กลุ่มมีหัวข้อ)

```
🎮 Play [?]
📣 กระดานข่าว (NewsBoard — คงเดิม)

── สวน & สัตว์ ──
[🌾 ฟาร์ม (เปิด modal เดิม)] [🐾 สัตว์ → /pets]

── ร้านค้า ──
[🛒 ร้านค้า → /shop  (อัญเชิญ · ห้องทดลอง)]

── สนามประลอง (เร็วๆ นี้) ──
[⚔️ สนามรบ] [🏯 หอคอย] [🗺️ Co-op] [🍬 Crush]
```
- การ์ดเปิด/ปิดใช้ระบบเดียวกัน (`.game-card` + badge สถานะ ฟาร์ม "เก็บได้ N")
- การ์ด "เร็วๆ นี้" คุมโทนจาง ใช้แพทเทิร์น soon เดียวกันทั้งแอป
- **scale:** Battle เปิดจริง = ย้ายการ์ดจากกลุ่ม "สนามประลอง (เร็วๆ นี้)" ขึ้นเป็นการ์ดเปิด ไม่ต้องรื้อ layout

### 3. หน้า "ฉัน" (/me) — เลื่อนขึ้นเป็น nav destination

เนื้อหา/logic เดิมอยู่ครบ ไม่ตัดอะไร เปลี่ยนแค่การจัดวาง:
- **เอาปุ่ม `‹ back` ออก** — เป็นหน้า top-level แล้ว ใช้ hero header (`.page-title`) แบบหน้าอื่น
- **ดัน identity ขึ้นบน:** อวตารใหญ่ + ฉายา/ชื่อเล่น + 🏠Lv + stat row (เหรียญ/บ้าน/เพ็ท) + 🏆 achievement grid + แท็ก + 📊 ประวัติข้อสอบ
- **พับฟอร์มข้อมูลติดต่อลงล่าง** (phone/IG/LINE + ปุ่มบันทึก) — งานธุรการ ไม่ควรเปิดมาเจอก่อน
- ส่วนล่างสุด: ข้อเสนอแนะ + ออกจากระบบ (เดิม)

### 4. หน้า Home = "แดชบอร์ดรายวัน"

```
🧪 RxTU10 · หน้าหลัก
⏳ นับถอยหลังสอบ (ExamCountdown — ★ ย้ายมาจาก Study)
🪙 รับรายได้รายวัน (DailyCard — เดิม)
📋 เควสต์ประจำวัน (DailyQuestCard — เดิม)
📬 จดหมาย (MailboxCard — เดิม)
🏠 ที่อยู่อาศัย (ResidenceCard — เดิม)
⚙️ แผงผู้ดูแลระบบ (admin เท่านั้น — เดิม)
```
- **เอาการ์ดโปรไฟล์ `home-me` ออก** (มี `👤 ฉัน` ใน nav แล้ว) → Home โฟกัส "สิ่งที่ต้องทำวันนี้" ล้วน
- **ย้าย ExamCountdown มาบนสุดของ Home** (ข้อมูลสรุปรายวัน ควรเห็นทันทีเปิดแอป) → Study เหลือฮับโหมดเรียน + flashcard สะอาดขึ้น

### 5. Design System — ทำให้สม่ำเสมอ (ภาษาเดียว = สติกเกอร์)

โปรเจกต์มี 2 ภาษาปนกัน: สติกเกอร์ (`--ink` ขอบหนา + `--pop` เงาแข็ง + ฟอนต์ `Chonburi` + `--gold`) กับ โมเดิร์นนุ่ม (`--shadow-sm/md/lg` ฟุ้ง + ขอบบาง `--border`). **รวมให้เหลือสติกเกอร์** (เอกลักษณ์เกม) เก็บกวาดของนุ่มที่หลงเหลือ

1. **Hero header เดียวกันทุกหน้าหลัก** — `.page-title` (Chonburi + `--ink`) + ปุ่ม `?` ช่วยเหลือมุมขวา (Home/Members/Play/Study/ฉัน)
2. **ระบบการ์ดเดียว** — การ์ด/ปุ่มหลักใช้ `--ink` ขอบ + `--pop` เงาแข็ง + `:active { translate(2px,2px) }` เลิกใช้ `--shadow-md` ฟุ้งบนการ์ดเนื้อหา
3. **`SectionTitle` component กลาง** — ยกสไตล์ section-title ที่ Study มีอยู่ (`.sv-section-title`) เป็น component ใช้ร่วม (Play 3 กลุ่ม + ที่อื่นที่ต้องการ)
4. **โทน "เร็วๆ นี้" สม่ำเสมอ** — รวมแพทเทิร์น soon ให้เหมือนกันทั้งแอป (ตอนนี้ Play `.soon-card` กับ Study `QuizModeCard coming-soon` คนละแบบ)
5. **nav active state ชัดขึ้น** — ช่องที่เลือกเน้น `--primary`/`--ink`

## ไฟล์ที่คาดว่าแตะ

- `src/App.vue` — bottom-nav (สลับ Shop→ฉัน), nav active state
- `src/views/PlayView.vue` — จัด 3 กลุ่ม + การ์ดร้านค้า
- `src/views/MeView.vue` — เอา back ออก, ดัน identity ขึ้น, พับฟอร์มติดต่อ
- `src/views/HomeView.vue` — เอา home-me ออก, เพิ่ม ExamCountdown
- `src/views/StudyView.vue` — เอา ExamCountdown ออก
- `src/style.css` — เก็บกวาด token (การ์ด/soon/section), nav active
- `src/components/study/ExamCountdown.vue` — ใช้ร่วมได้ (ไม่มี dependency เฉพาะ Study)
- ใหม่: `src/components/shared/SectionTitle.vue`, แพทเทิร์น soon-card ที่ใช้ร่วม

## ไม่แตะ

router path, Firestore schema/rules/index, logic ภายใน ShopView/QuizView/QuestionsView/AdminView/MembersView, composables, stores

## ความเสี่ยง / กับดัก

- **Teleport modal:** ฟาร์ม modal ใน PlayView ใช้ `<Teleport to="body">` แล้ว (กับดัก stacking context `#main-content` position:fixed) — ห้าม revert ตอนจัดกลุ่ม
- **ExamCountdown ย้ายหน้า:** เป็น data-driven (data/exams.js + countdown.js) ไม่มี state เฉพาะ Study — ย้าย import ได้ตรงๆ
- **nav 5 ช่อง:** คง 5 ช่อง (มือถือ sweet spot) ไม่เพิ่มเป็น 6
- **`/me` เป็น nav destination:** ต้องเช็กว่า logic ปุ่ม back / `$router.back()` ที่เอาออกไม่กระทบ flow อื่นที่ลิงก์มา /me

## เกณฑ์ความสำเร็จ

- bottom-nav: 🏠 👥 🎮 📚 👤 — กดครบทุกช่องเข้าถูกหน้า
- เข้า /shop ได้ผ่านการ์ดร้านค้าใน Play (2 แท็บเดิมทำงาน)
- Play แสดง 3 กลุ่มหัวข้อ การ์ดเปิดทำงาน (ฟาร์ม modal, เพ็ท, ร้านค้า) soon-card จาง
- หน้า "ฉัน" ไม่มีปุ่ม back, identity อยู่บน, ฟอร์มติดต่อพับล่าง บันทึกได้
- Home ขึ้น ExamCountdown บนสุด ไม่มีการ์ดโปรไฟล์ การเก็บเหรียญ/เควสต์/จดหมายทำงาน
- ทุกหน้าหลักใช้ hero header + ระบบการ์ดสติกเกอร์เดียวกัน ไม่มีเงาฟุ้งหลงเหลือบนการ์ดเนื้อหา
- `npm run build` เขียว
