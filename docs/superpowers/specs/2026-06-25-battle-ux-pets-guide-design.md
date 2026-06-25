# Battle UX + Pets/Guide polish

วันที่: 2026-06-25 · สถานะ: อนุมัติ design แล้ว รอเขียน plan
เกี่ยวข้อง: [2026-06-25-battle-alternating-attacks-design.md](./2026-06-25-battle-alternating-attacks-design.md)
(ship พร้อมกัน แต่เป็นอิสระต่อกัน — summary อ่าน `result.log` ซึ่งทำงานได้ไม่ว่าลำดับตีแบบไหน)

## เป้าหมาย

ชุดงานต่อยอด battle/หอคอย + ขัดเกลา UI สัตว์เลี้ยง/ไกด์ 5 อย่าง:
1. หน้าสรุปการต่อสู้ (post-battle summary)
2. ดีเลย์ก่อนเริ่มแมตช์ — `READY?` → `GO!`
3. โชว์ธาตุในหน้าดูสัตว์เลี้ยง
4. ทักษะเฉพาะ (passive) → แสดง "เร็วๆ นี้"
5. เติมไกด์ข้อมูลที่ผู้เล่นควรรู้

---

## 1. หน้าสรุปการต่อสู้

ต่อยอดจาก state `done` ใน `BattleReplay.vue` (ปัจจุบันโชว์แค่ ชนะ/แพ้ + ปุ่มปิด)
→ แทนด้วยหน้าสรุปเต็ม ข้อมูลทั้งหมดคำนวณจาก `props.data.result.log` (มีครบอยู่แล้ว)

**เนื้อหา:**
- ผล: ชนะ/แพ้ (คงข้อความเดิม "ชนะ! ขึ้นชั้น N+1" / "แพ้ ลองใหม่ได้เลย")
- **ของที่ได้รับ (ฝั่งผู้เล่นเท่านั้น — ศัตรูเป็นบอท PvE ไม่มีรางวัล):** ขึ้นชั้น +1 และถ้าถึงหมุด
  (`TOWER_BONUS_FLOORS`) โชว์ +โบนัสรายได้/วันที่เพิ่ม · ถ้าแพ้ = ไม่มีของ
- **ดาเมจรายตัว ทั้งสองทีม:** ต่อ unit แสดง ดาเมจที่ทำ + ดาเมจที่รับ (+ จำนวน kill, สถานะตาย/รอด)
  จัดกลุ่มเป็น 2 ฝั่ง (ทีมคุณ / ศัตรู)
- **MVP ทั้งสองทีม (ทีมละ 1 ตัว):**
  - สูตร: `score = dmgDealt + 0.5 × dmgTaken` (tunable) → ตัวที่ score สูงสุดในทีมนั้น
  - เสมอกัน → ตัวที่ตำแหน่งซ้ายกว่า (index น้อยกว่า) ชนะ
  - ป้าย/กรอบ MVP: **ทีมที่ชนะ = กรอบทอง (amber #fbbf24)**, **ทีมที่แพ้ = กรอบม่วง (#c084fc)**

**สถาปัตยกรรม:** เพิ่ม util ใหม่ `src/utils/battleSummary.js` (pure + มี `.test.js`)
- input: `log`, `playerTeam`, `botTeam` → output: per-unit `{ uid, side, id, dmgDealt, dmgTaken, kills, dead }`
  ทั้งสองฝั่ง + `mvp: { A: uid, B: uid }`
- แยกจาก `battleStats.js` เพราะคนละหน้าที่/คนละ shape: `battleStats` = species-keyed ฝั่งผู้เล่น
  สำหรับเขียน Firestore (คงเดิม ไม่แตะ), `battleSummary` = uid-keyed สองฝั่งสำหรับแสดงผล
- `BattleReplay.vue` import มาแสดงใน state `done` · ปุ่ม "ปิด" คงเดิม (`$emit('close')`)

## 2. Intro `READY?` → `GO!`

overlay สั้นในจังหวะเริ่ม replay ก่อน log เล่นจริง:
- ลำดับ: `READY?` (~700ms) → `GO!` (~400ms) → เริ่มเดิน log
- **แตะที่ใดก็ได้เพื่อข้าม intro** (กันน่ารำคาญตอนไต่หอคอยซ้ำๆ)
- คุมใน `BattleReplay.vue`: เพิ่ม phase `intro` ก่อน `step()` เริ่ม · ตั้ง timer แล้วเข้าลูปเดิม
- ภาษา: อังกฤษ `READY?` / `GO!` (ตามที่ผู้ใช้เลือก)

## 3. ธาตุในหน้าดูสัตว์เลี้ยง

ปัจจุบัน `PetsView`/`PetDetailModal` ใช้ธาตุคำนวณ combat แต่ไม่โชว์ให้ผู้เล่นเห็น
ธาตุมาจาก def per-species: `getPetDef(id).element` · emoji จาก `ELEMENTS[el].emoji` (✊/✌️/✋)

- **`PetsView.vue`:** เพิ่ม badge ธาตุมุมการ์ดแต่ละตัวใน grid (เหมือน `.br-el` ใน BattleReplay)
- **`PetDetailModal.vue`:** เพิ่มแถวธาตุ (emoji + ชื่อ) ใน tags หรือ stats — ใช้ชื่อจาก `_EL_NAME`
  (`✊ ค้อน` / `✌️ กรรไกร` / `✋ กระดาษ` ใน data/index.js) · ปรับใช้ชื่อชุดเดียวกันทั้งแอป

> หมายเหตุชื่อธาตุไม่ตรงกันในโค้ดปัจจุบัน: `_EL_NAME` (data) = "ค้อน/กรรไกร/กระดาษ" แต่
> `EL_NAME` ใน BattleReplay/TowerView = "หมัด/กรรไกร/กระดาษ" → งานนี้ทำให้ตรงกัน
> (ใช้ค่ากลางจาก data/index.js แหล่งเดียว) เพื่อกันสับสน

## 4. ทักษะเฉพาะ (passive) → "เร็วๆ นี้"

ทุก pet ตอนนี้ `passiveOf(def)` = null (ยังไม่มีระบบ — ดู economy-battle-master-plan §5.5)

- **`PetDetailModal.vue`:** เพิ่ม section "ทักษะเฉพาะ" แสดง badge "เร็วๆ นี้" (สไตล์เดียวกับ `.help-soon`)
- **`BattleReplay.vue` inspect panel:** ช่อง passive มี slot รออยู่แล้ว (`insp.passive ? ... : '—'`)
  → เปลี่ยน `—` เป็น "เร็วๆ นี้" เมื่อ passive ว่าง

## 5. เติมไกด์ (`data/guide.js` + อาจเพิ่ม HelpButton)

- **residence / farm / pets:** เพิ่มบรรทัดบอกชัดว่า **อัปเลเวลบ้าน → ปลดล็อกช่องต่อสู้ (battle slot)
  และแปลงปลูก (farm plot) เพิ่ม** (อ้างอิง `residenceBattleSlots`, การปลดแปลงใน farm)
- **เพิ่มหัวข้อ `tower` (หรือ `battle`):** อธิบายระบบต่อสู้ — ธาตุ ✊>✌️>✋>✊, ลำดับตีซ้าย→ขวา
  สลับฝั่ง, ฝั่งตัวเยอะตีก่อน, เป้าสุ่ม, โบนัสรายได้จากการไต่ชั้น · ใส่ `<HelpButton topic="tower">`
  ที่หัว `TowerView`
- ระวัง spoil: ตารางบ้านมี mask อยู่แล้ว — เนื้อหาใหม่เป็นกลไกทั่วไป ไม่ต้อง mask

---

## ผลกระทบไฟล์

| ไฟล์ | การเปลี่ยน |
|------|-----------|
| `src/utils/battleSummary.js` (ใหม่) + `.test.js` | คำนวณ per-unit สองฝั่ง + MVP (pure) |
| `src/components/battle/BattleReplay.vue` | intro READY/GO + หน้าสรุปใน state done |
| `src/views/PetsView.vue` | badge ธาตุในการ์ด |
| `src/components/pets/PetDetailModal.vue` | แถวธาตุ + section passive "เร็วๆ นี้" |
| `src/views/TowerView.vue` | HelpButton topic="tower" |
| `src/data/guide.js` | หัวข้อ tower + เติม residence/farm/pets (battle slot/plot) |
| `src/data/index.js` | (ถ้าจำเป็น) รวมชื่อธาตุให้เป็นแหล่งเดียว |

## วิธีพัฒนา

TDD เฉพาะ logic ที่ pure: `battleSummary.js` (`node --test`) · ส่วน UI (intro/summary/badge/guide)
verify ด้วย `npm run build` + ลองใน dev (หอคอย → สู้ → ดู intro + summary, หน้า pets, ไกด์)
