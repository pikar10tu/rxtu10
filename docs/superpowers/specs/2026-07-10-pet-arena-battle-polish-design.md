# Pet/Arena/Battle UI Polish — Design Spec

วันที่: 2026-07-10
สถานะ: ร่างรออนุมัติ (brainstorm เสร็จ)

## 1. ที่มา / เป้าหมาย

งาน UI polish 4 อย่างที่ user สั่ง (อิสระต่อกัน รวมเป็น spec เดียว):
1. **หน้า Pet รก** — การ์ดลิสต์ยัดข้อมูล 7 อย่าง/ใบ (รวม ATK/HP) → จัดใหม่แบบ Seven Deadly Sins: Grand Cross (art เด่น + ดาวเกรด + ขอบสี rarity) ย้าย ATK/HP ไปดูใน detail
2. **ลานประลองไม่มีบรรยากาศ** — สนามรบพื้นหลังน้ำเงินเข้มเรียบๆ เหมือนกันทั้ง Arena/Tower → ทำพื้นหลังธีมแยกโหมด
3. **เลข HP/ATK ในไฟต์เล็ก** (.58rem) → ใหญ่ขึ้นให้อ่านง่าย
4. **Active team แปรผัน 1-4 ตามเลเวลบ้าน** → ปรับเป็น **3 คงที่ทุกคน** ตัด slot ออกจาก perk บ้าน

## 2. ขอบเขต

**ทำ:** 4 ฟีเจอร์ด้านบน
**ไม่ทำ (out of scope):**
- Tower rework (user แจ้งว่ามีแผน แต่ไว้ครั้งหน้า) — ดู ROADMAP
- ไม่แตะกลไก battle engine, กาชา, กลไก evolve/รายได้เพ็ท
- ไม่ทำระบบชดเชยช่องทีมให้คน Lv11-12 (Phase 0 คนน้อย — nerf ตรงๆ)

## 3. Feature 1 — หน้า Pet declutter (7DS style)

**สภาพเดิม:** `PetsView.vue:32-45` กริด 4 คอลัมน์ · การ์ด `.pt-cell` โชว์ 7 อย่าง: ⭐active, ×copies, อีโมจิธาตุ, อีโมจิเพ็ท, ชื่อ, และ `<PetStatLine>` (เกรด+⚔️ATK+❤️HP) = ตัวที่ทำให้รก · ขอบการ์ดสีตาม rarity อยู่แล้ว (`:35 borderColor`)

**ดีไซน์:**
- ถอด `<PetStatLine>` ออกจากการ์ดลิสต์ (`PetsView.vue:43`)
- แทนด้วย **ดาวเกรด**: `★` ซ้ำตามจำนวน `grade` (0 = ไม่มีดาว, สูงสุด V = ★★★★★) — สีทอง/อำพัน เล็กพอดี ใต้หรือบนชื่อ
- ขอบสี rarity คงเดิม (เป็นตัวบอก rarity หลัก) · ⭐ active มุมคงเดิม
- ผลลัพธ์การ์ด: อีโมจิธาตุ↖ + ⭐active↗ + อีโมจิเพ็ท(art) + ดาวเกรด + ชื่อ — สะอาด เห็น art เด่น
- **ATK/HP:** ไม่ทำอะไร — มีครบใน `PetDetailModal` แล้ว (`:25-29`)
- **TeamPicker (`TeamPicker.vue:31`) คง `PetStatLine` ไว้** — ตอนจัดทีมต้องเทียบเลข ไม่แตะ

**ไฟล์:** `src/views/PetsView.vue` (แก้ template การ์ด + style ดาว; อาจฟื้น `.pt-cell-grade` เดิมที่ `:124` หรือทำ class ใหม่)
**ระวัง:** `PetStatLine` ใช้ 2 ที่ (PetsView + TeamPicker) — แก้ที่ "จุดเรียก" ใน PetsView เท่านั้น ห้ามแก้ใน component (จะกระทบ TeamPicker)

## 4. Feature 2 — พื้นหลังสนามธีมแยกโหมด

**สภาพเดิม:** Arena+Tower ใช้ `BattleReplay` ตัวเดียวกัน · `.br-ov` (`BattleReplay.vue:~401`) `background: rgba(15,23,42,.88)` น้ำเงินเข้มโปร่งแสงเรียบ ไม่มีธีมต่อโหมด

**ดีไซน์:**
- เพิ่ม prop `theme` ให้ `BattleReplay` (ค่า `'arena' | 'tower'`, default `'tower'`) → bind class ที่ `.br-ov` (เช่น `:class="'br-theme-' + theme"`)
- **Arena = โคลอสเซียม:** gradient ทราย/อำพัน-น้ำตาลอุ่น + ลายเสา/ซุ้มโค้งด้วย CSS (`repeating-linear-gradient` หรือ pseudo-element) + ขอบมืดล่างให้ตัวหนังสือขาวอ่านออก
- **Tower = หอคอย/ดันเจี้ยน:** โทนหินเข้ม/ม่วง-น้ำเงิน + สัมผัสคบเพลิง (glow อุ่นมุมจอ) — ต่อยอดจากน้ำเงินเข้มเดิมให้มีมิติ
- ทั้งคู่ต้อง **เข้มพอ**ให้ `.br-round`/`.br-side`/ป้าย HP/ATK (ขาว) อ่านออก · ทำเป็น CSS ล้วน (CSP ห้ามภาพนอก) · อยู่ใน `.br-ov` เดิม (Teleport แล้ว — ห้ามสร้าง fixed layer นอก Teleport)
- Callers: `ArenaView.vue:46` ส่ง `theme="arena"`, `TowerView.vue:71` ส่ง `theme="tower"`
- เช็ก `.br-result-ov` (`:~509` rgba navy .72) ทับอีกชั้น — ให้ยังกลืนกับธีมใหม่

**ไฟล์:** `src/components/battle/BattleReplay.vue` (prop + class + theme styles), `src/views/ArenaView.vue:46`, `src/views/TowerView.vue:71`

## 5. Feature 3 — เลข HP/ATK ในไฟต์ใหญ่ขึ้น

**สภาพเดิม:** `.br-atk, .br-hpn` (`BattleReplay.vue:~438`) `font-size: .58rem` — ป้าย ATK (อำพัน) + HP ปัจจุบัน (แดง/เขียว) ใต้หลอดเลือดแต่ละยูนิต (เป็นเลขคงอยู่ ไม่ใช่เลขดาเมจเด้งที่ใหญ่แล้ว)

**ดีไซน์:**
- ขยาย `.br-atk / .br-hpn` เป็น **~.72rem** (font-weight คง 800) + ปรับ padding/min-width ให้พอดี
- **Guard layout:** `.br-unit` เป็น `aspect-ratio:1` ใน grid 4 คอลัมน์ (จอ ~440px กล่อง ~95px) — เลข HP หลักพัน ("1250") อาจดัน/ล้น → ถ้าจำเป็นลด `.br-stats` gap หรือ face 2rem ลงเล็กน้อย เพื่อไม่ให้ล้นกล่อง

**ไฟล์:** `src/components/battle/BattleReplay.vue` (CSS `:~437-441`)

## 6. Feature 4 — Active team = 3 คงที่

**สภาพเดิม:** ช่องทีมแปรผัน 1-4 ตาม `residenceBattleSlots(level)` (`data/residence.js`: Lv1-3=1, Lv4-7=2, Lv8-10=3, Lv11+=4) · `activePets` array ยาว 4 (`userSchema.js:20`, normalize `TEAM_SIZE=4` `:115-117`)

**ดีไซน์:**
- **Source เดียว:** `export const BATTLE_SLOTS = 3` ใน `data/residence.js`
- **ลบ field `battleSlots` ออกจากทุก tier** ใน `RESIDENCE_TIERS` + ลบ/แทน accessor `residenceBattleSlots` (เลิกผูกกับ level) — battleSlots ไม่ใช่ perk บ้านอีกต่อไป
- แก้ 3 จุดที่ใช้ `residenceBattleSlots(level)` → ใช้ `BATTLE_SLOTS`: `PetsView.vue:72`, `TeamPicker.vue:59`, `PetDetailModal.vue:74`
- **`userSchema.js`:** `TEAM_SIZE 4→3` (`:115`), default `activePets: [null,null,null]` (`:20`), migration legacy (`:107`) → normalize จะ slice คนเก่า 4→3 อัตโนมัติ (**ไม่ต้อง migration แยก**)
- **`userSchema.test.js`:** อัปเทสที่ล็อกยาว 4 → 3 (`:47-65`)
- **`utils/petTeam.js` `resolveBattleTeam`:** เพิ่ม `.slice(0, BATTLE_SLOTS)` — **สำคัญ** เพราะเป็นจุด cap ฝั่ง combat จริง กันทีมศัตรู/บอทที่ doc เก่ายังมี 4 id (useArena อ่าน doc คู่ต่อสู้ตรง ไม่รู้เลเวลเขา) → รับประกัน 3v3 แฟร์
- **`guide.js`:** แก้ copy 2 จุด — `:22` (topic residence "ปลดล็อกช่องทีมต่อสู้...เพิ่ม") และ `:38` (topic pets "จำนวนช่องทีมต่อสู้ (Active) เพิ่มตามเลเวลบ้าน") → เปลี่ยนเป็น "ทีมต่อสู้ 3 ช่องคงที่" (topic residence เก็บเฉพาะส่วนแปลงฟาร์ม/รายได้)

**ไฟล์:** `data/residence.js`, `PetsView.vue`, `TeamPicker.vue`, `PetDetailModal.vue`, `userSchema.js`, `userSchema.test.js`, `utils/petTeam.js`, `data/guide.js`

**ความเสี่ยง:**
- คน Lv11-12 (เคย 4) เหลือ 3 — ตัวที่ 4 หลุดเงียบตอน normalize (ไม่มี toast) · รับได้ Phase 0
- คน Lv1-7 (เคย 1-2) ได้เพิ่มเป็น 3 = buff · ไม่มี logic ที่ assume slots<3 (ยืนยันจาก grep)
- ต้อง cap `resolveBattleTeam` ไม่งั้นศัตรู 4 vs เรา 3 ไม่แฟร์

## 7. เทส

**Unit (node --test):**
- `userSchema.test.js`: default `activePets` ยาว 3 · normalize doc ที่มี 4 → slice เหลือ 3 · pad doc ที่มี <3 → 3
- `petTeam.test.js` (ถ้ามี/สร้าง): `resolveBattleTeam` cap ที่ 3 (ส่ง 4 id → คืน 3)

**Manual (จอจริง มือถือ):**
- หน้า Pet: การ์ดเห็น art+ดาวเกรด+ชื่อ ไม่มี ATK/HP · แตะดู detail มี ATK/HP ครบ · TeamPicker ยังมี ATK/HP
- ไฟต์ Arena = พื้นโคลอสเซียม, Tower = หอคอย · ตัวหนังสือขาวอ่านออกทั้งคู่ · หน้าสรุปยังกลืน
- เลข HP/ATK อ่านง่ายขึ้น ไม่ล้นกล่อง (ลองเพ็ท HP หลักพัน)
- ทีม Active สูงสุด 3 ทุกเลเวลบ้าน · คนเคยมี 4 เหลือ 3 · ไฟต์ 3v3 (Tower + Arena ถ้าเปิด)

## 8. โน้ต out-of-scope (จดกันลืม)
- **Tower rework** — user มีแผนรื้อหอคอย ไว้ session ถัดไป (แยก brainstorm)
