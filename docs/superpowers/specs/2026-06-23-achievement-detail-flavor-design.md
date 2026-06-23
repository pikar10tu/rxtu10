# Achievement detail popup + flavor text

วันที่: 2026-06-23
สถานะ: design (อนุมัติแล้ว — รอ plan)

## เป้าหมาย

แตะ achievement ที่ปลดล็อกแล้วใน `AchievementGrid` → เปิด popup โชว์รายละเอียด (ไอคอนใหญ่ + ชื่อ + flavor text + เงื่อนไขปลดล็อก + วันที่ได้) แก้ปัญหาเดิมที่เงื่อนไขซ่อนอยู่ใน `title` tooltip ซึ่งมือถือ hover ไม่ได้ + เพิ่มสีสันด้วย flavor text ต่อ badge

## ขอบเขต

**ทำ:** เพิ่ม `flavor` ทั้ง 17 achievement ใน catalog · popup รายละเอียด (แตะ badge ที่ปลดแล้ว) · ทำ `.ach-item` แตะได้ (button + keyboard)

**ไม่ทำ:** โชว์ achievement ที่ยังไม่ปลด (โชว์เฉพาะที่ปลดแล้วเหมือนเดิม) · progress bar milestone ถัดไป · แตะ rules/schema/grant logic/subcollection/migration · ไม่มี test ใหม่ (UI ล้วน + ข้อมูลคงที่)

## 1. Catalog — เพิ่ม `flavor` (`data/achievements.js`)

เพิ่ม field `flavor` (วลีสนุก แยกจาก `desc` ที่เป็นเงื่อนไข) ทุก achievement. ค่าเริ่มต้น (ปรับได้):

| id | title | flavor |
|----|-------|--------|
| pet_5 | นักเลี้ยงสัตว์ | เริ่มจากตัวเล็กๆ สู่คอกในฝัน |
| pet_10 | คอกใหญ่ | คอกเริ่มแน่น เสียงเริ่มดัง |
| pet_25 | สวนสัตว์ส่วนตัว | นี่มันสวนสัตว์ชัดๆ |
| pet_all | นักสะสมตัวจริง | ครบทุกชนิด ไม่มีตัวไหนรอด! |
| quiz_10 | เริ่มติว | ก้าวแรกของเส้นทางเซียน |
| quiz_50 | ขยันทำโจทย์ | ปากกาเริ่มหมึกหมด |
| quiz_100 | เซียนข้อสอบ | ข้อสอบเห็นแล้วต้องหลบ |
| flash_10 | หัดท่อง | ยาตัวแรกที่จำได้ ภูมิใจ |
| flash_50 | ท่องสม่ำเสมอ | สม่ำเสมอคือกุญแจ |
| flash_100 | จำแม่น | สมองนี้คือคลังยาเคลื่อนที่ |
| farm_100k | พ่อค้าผัก | ผักสวนครัว รั้วกินได้ |
| farm_500k | นักธุรกิจ | จากแปลงผักสู่เครือธุรกิจ |
| farm_2m | เจ้าสัวเกษตร | เกษตรกรเกือบพันล้าน |
| spent_100k | นักช้อป | เงินมีไว้ใช้ ไม่ได้มีไว้กอด |
| spent_500k | ขาช้อปตัวยง | บัตรเครดิตเริ่มร้อน |
| home_max | เจ้าของคฤหาสน์ | จากข้างถนนสู่ยอดพีระมิด |
| daily_king | ราชาควิซประจำวัน | วันนี้ทั้งรุ่นต้องยอม |

โครงสร้าง: `pet_5: { title, icon, type, trigger, desc, flavor }` — เพิ่มแค่ key `flavor` ไม่แตะ field อื่น

## 2. `AchievementDetailModal.vue` (ใหม่)

popup รายละเอียด — **mirror `PetStatPopup.vue`** (overlay `position:fixed; inset:0; z-index:260; @click.self ปิด`) — **ไม่ต้อง Teleport**: PetStatPopup พิสูจน์แล้วว่า popup แบบ fixed-overlay ที่เป็น child ของ `AchievementGrid` (ซึ่งอยู่ใน ProfileModal z-index 220 หรือหน้า Me) แสดงทับถูกต้อง (z-index 260 > 220) ในทั้งสองบริบท

- props: `item: Object|null` — `{ icon, label, flavor, desc, earnedAt }` (จาก grid; `label` = ชื่อที่ grid โชว์อยู่แล้ว ผ่าน `titleOf` รวม date ของ daily_king)
- emit: `close`
- เนื้อหา (โชว์เมื่อ `item`):
  - ไอคอนใหญ่ (`<Emoji :char="item.icon" />`)
  - ชื่อ achievement (`item.label` — ใช้ชื่อเดียวกับที่ grid โชว์ ไม่สร้าง field ซ้ำ)
  - **flavor text** เด่น (italic/โทนรอง)
  - แถวเงื่อนไข: ป้าย "เงื่อนไข" + `item.desc`
  - แถววันที่: ป้าย "ปลดล็อกเมื่อ" + `fmtDate(item.earnedAt)` (ซ่อนถ้าไม่มี earnedAt)
  - ปุ่ม ✕ + แตะ backdrop ปิด
- `fmtDate(ts)` inline: รองรับ Firestore Timestamp (`toMillis`/`toDate`) → `toLocaleDateString('th-TH-u-ca-gregory', {day:'numeric',month:'long',year:'numeric'})` · คืน '' ถ้า ts พัง/ว่าง (กัน NaN)
- emoji ในเทมเพลตผ่าน `<Emoji>` เท่านั้น

## 3. `AchievementGrid.vue` — ทำ badge แตะได้ + เปิด modal

- เปลี่ยน `.ach-item` จาก `<div>` → `<button>` (`type="button"`, คง `:title="a.desc"` เป็นของแถมเดสก์ท็อป) `@click="selected = a"`
- เพิ่ม state `const selected = ref(null)` + render `<AchievementDetailModal :item="selected" @close="selected = null" />`
- map item เพิ่ม field ที่ popup ต้องใช้: `flavor: def.flavor || ''`, `earnedAt: data.earnedAt || null` (เดิมมี `icon`, `desc`, `label` อยู่แล้ว — popup ใช้ `label` เป็นชื่อ)
- CSS `.ach-item` ปรับให้เป็นปุ่ม (reset border/bg ของ button, คง layout เดิม, เพิ่ม `cursor:pointer` + active feedback)

## Data flow / cost

- popup อ่านจาก item ที่ grid โหลดมาแล้ว — **ไม่มี read/write เพิ่ม** · catalog เป็นข้อมูลคงที่ใน bundle
- ไม่แตะ Firestore (rules/schema/subcollection คงเดิม)

## Edge cases

- achievement ที่ id ไม่อยู่ใน catalog (legacy) → `getAchievement` คืน null → fallback `{icon:'🏅', desc:'', flavor:''}` (เดิมมี fallback อยู่แล้ว เพิ่ม flavor:'')
- `earnedAt` ไม่มี/พัง → ซ่อนแถววันที่ (fmtDate คืน '')
- `flavor` ว่าง → ซ่อนบรรทัด flavor
- popup ซ้อนใน ProfileModal: z-index 260 > ProfileModal 220 + PetStatPopup 250 (ไม่เปิดพร้อมกัน) — แตะ backdrop ปิดเฉพาะ popup นี้ (`@click.self`) ไม่ทะลุไปปิด ProfileModal

## Testing

- ไม่มี pure logic ใหม่ → ตรวจด้วย `npm run build` + ทดลอง dev (แตะ badge ใน Me/ProfileModal เปิด popup, ปิดได้, วันที่/flavor/เงื่อนไขถูก)
