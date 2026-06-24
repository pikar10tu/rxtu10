# Tower UI แฟนซี + จัดทีม (ActivePets) + ดูรายละเอียดเพ็ท + รายได้หอคอยใน Home

วันที่: 2026-06-24 · สถานะ: design (อนุมัติ verbal แล้ว รอ user review spec)

## เป้าหมาย

รื้อหน้า **หอคอย** ให้แฟนซี "เป็นชั้นๆ" (แบบ Hybrid: แถบไต่ชั้น + การ์ดชั้นปัจจุบัน), ทำ **จัดทีม**
ที่ผูกกับ `activePets` ให้ใช้ร่วมกันทั้งหอคอย+หน้าเพ็ท, ให้ **กดดูรายละเอียดเพ็ท** ได้ทั้งในหอคอยและหน้าจัดทีม,
และ **โชว์รายได้โบนัสหอคอย** ในการ์ดรายได้หน้า Home

**กฎรอบนี้: UI ล้วน** — ไม่แตะ battle engine / สมดุล / firestore.rules · ไม่เพิ่ม field ใน Firestore
(เขียน `activePets` ผ่าน `auth.patchUser` ตามเดิม)

### Non-goals
- ไม่ทำกลไก battle/passive ใหม่ · ไม่แตะสูตรรายได้ (แค่ "แสดง" towerBonus ที่มีอยู่)
- ไม่ทำ reset ชั้นหอคอยทุกคน (queue แยก) · ไม่ทำ market/PvP

## บริบทที่มีอยู่ (อ่านแล้ว)

- `views/TowerView.vue` — การ์ดเดียว: floor/best/bonus + แถว emoji ศัตรู/ทีม + ปุ่มสู้ + "จัดทีม"(เปิด TeamPicker) + BattleReplay
- `components/battle/TeamPicker.vue` — BottomSheet, **ฮาร์ดโค้ด 4 ช่อง** (บั๊ก), pool owned, toggle → `activePets`. ดูรายละเอียดไม่ได้
- `components/pets/PetDetailModal.vue` — โมดัลเต็ม: stats/วิวัฒน์/ศักยภาพ + ปุ่ม Active (ใช้ `residenceBattleSlots(level)` ถูกต้อง) · รับ prop `petId`
- `views/PetsView.vue` — กริดเพ็ท, ⭐ มาร์ก active, แตะ→ PetDetailModal (`sel` ref)
- `components/home/DailyCard.vue` — breakdown รายได้ (บ้าน/เพ็ท/bonus/total) **ไม่มีบรรทัดหอคอย**
- `composables/useDaily.js` — คืน `towerBonus` อยู่แล้ว (รวมใน `ratePerDay` แล้ว) · `data/residence.js` → `residenceBattleSlots(level)` = 1..4
- `data/towerFloors.js` — `getFloorTeam(floor)`, `getTowerBonus(best)`, `TOWER_MAX=50` · tier: 1-12 common · 13-25 rare · 26-38 epic · 39-50 legendary

---

## ส่วน 1 — TowerView ใหม่ (Hybrid แฟนซี)

### 1.1 floorZone helper (data/towerFloors.js — เพิ่ม pure fn + test)
```js
// floor → โซนแฟนซีตาม tier (สี + ชื่อ + ช่วง) สำหรับ UI หอคอย
export function floorZone(floor) // → { name, color, art, from, to }
```
4 โซน (อิง tier เดิม):
| ชั้น | name | art | color |
|---|---|---|---|
| 1–12 | ลานประลอง | 🛡️ | #84cc16 |
| 13–25 | หอเวทเก่า | 🔮 | #60a5fa |
| 26–38 | ปราการอสูร | 👹 | #c084fc |
| 39–50 | ยอดหอคอยมังกร | 🐉 | #fbbf24 |

### 1.2 แถบไต่ชั้น (climb strip)
แถวแนวนอนบนการ์ด: โชว์ชั้นรอบตัว `best` → `floor` → ขึ้นไป (เช่น 5 ช่องรอบปัจจุบัน) ·
สถานะ: ✅ ผ่าน (≤ best) · ▸ ปัจจุบัน (floor) · 🔒 ยังไม่ถึง (> floor) · ปลายขวา "↑ 50" ·
หมุดโบนัส 🪙 ที่ชั้น 10/20/30/40/50 (จุดที่ `getTowerBonus` กระโดด) — แค่มาร์ก ไม่กดได้

### 1.3 การ์ดชั้นปัจจุบัน (fantasy)
- แถบหัว: art+ชื่อโซน + "ชั้น {{floor}}" + สีพื้น gradient จาก `floorZone().color` · "สูงสุด {{best}}"
- โบนัสตอนนี้: 🪙 +{{bonus}}/วัน (จาก `getTowerBonus(best)`)
- **แถวศัตรู**: emoji 4 ตัว (จาก `botTeam`) — **แตะตัว → scout popover** (ส่วน 3)
- ⚔️ VS
- **แถวทีมคุณ**: emoji ตามทีม — **แตะตัว → PetDetailModal** · ว่าง = "ยังไม่ได้จัดทีม"
- ปุ่ม **[จัดทีม]** (เปิด TeamPicker) · **[⚔️ สู้ชั้น N]** (disabled ถ้า busy/ทีมว่าง)
- เคลียร์ครบ (floor≥MAX && best≥MAX) → 🏆 พิชิตหอคอยครบแล้ว

คงภาษาดีไซน์แอป (กรอบ 2px var(--ink), box-shadow var(--pop), indigo) — แฟนซีผ่านสีโซน+art ไม่ใช่รื้อทั้งระบบ

---

## ส่วน 2 — TeamPicker อัปเกรด (ใช้ร่วมหอคอย+เพ็ท)

ไฟล์: `components/battle/TeamPicker.vue`

- **แก้บั๊ก slots**: ใช้ `residenceBattleSlots(auth.userData?.residence?.level || 1)` (1..4) แทนฮาร์ดโค้ด 4 ·
  `slots` = activePets ตัด/เติม null ให้ยาว = battleSlots · hint "{{filled}}/{{battleSlots}}"
- **interaction (ตามที่เคาะ):**
  - แตะ **ช่องทีมที่มีตัว** → เปิด `PetDetailModal` (ดู/วิวัฒน์/ถอด) — ไม่ใช่ถอดทันที
  - แตะ **ช่องว่าง** → ไม่ทำอะไร (เลือกจาก pool ข้างล่าง)
  - แตะ **ตัวใน pool** → toggle เข้า/ออกทีม (เดิม) · เต็มแล้ว disabled ตัวที่ยังไม่อยู่ในทีม
- **ฝัง PetDetailModal** ใน TeamPicker เอง (`detailId` ref) → reuse ที่ไหนก็ได้รายละเอียด ·
  ปิดโมดัลแล้วยังอยู่ใน TeamPicker
- guard: ถ้า activePets ยาวกว่า battleSlots (เลเวลบ้านลด — กันเหนียว) แสดงแค่ battleSlots ช่องแรก

---

## ส่วน 3 — ดูรายละเอียด: หน้าเพ็ท + หอคอย

### 3.1 PetsView — แถบ "ทีมต่อสู้"
ไฟล์: `views/PetsView.vue` — เพิ่ม section **เหนือ pt-summary** (ทีมเป็นของหลัก):
- หัวข้อ "⚔️ ทีมต่อสู้ ({{filled}}/{{battleSlots}})"
- ช่องทีม battleSlots ช่อง: เติม activePets (emoji+เกรด) · ว่าง = เครื่องหมาย +
- แตะช่องมีตัว → `PetDetailModal` (ใช้ `sel` ref เดิมของ PetsView) · ปุ่ม **"จัดทีม"** → เปิด TeamPicker
- ⭐ ในกริดเดิมคงไว้ (มาร์ก active)

### 3.2 TowerView — scout ศัตรู (read-only)
แตะ emoji ศัตรูในการ์ด → popover เล็ก read-only (เพ็ทศัตรูไม่ได้ครอบครอง ใช้ PetDetailModal ไม่ได้):
- emoji + ชื่อ (getPetDef) + ธาตุ (✊✌️✋ + ชื่อไทย) + rarity + เกรด + ATK/HP (จาก `buildCombatant`)
- inline ใน TowerView (เล็ก) — ไว้ดูวางแผนธาตุ · ปิดด้วยแตะนอก/ปุ่มปิด
- **ทุก emoji ผ่าน `<Emoji>`** (กัน tofu)

> หมายเหตุ: ทีมคุณในหอคอยใช้ PetDetailModal เต็ม (เป็นเพ็ทที่ครอบครอง)

---

## ส่วน 4 — รายได้หอคอยใน Home

ไฟล์: `components/home/DailyCard.vue`
- ดึง `towerBonus` เพิ่มจาก `useDaily()` (ส่งออกอยู่แล้ว)
- เพิ่มบรรทัดใน `.dc-breakdown` (หลังเพ็ท ก่อน bonus): `v-if="towerBonus"` →
  `🏯 หอคอย` … `+{{ towerBonus.toLocaleString() }}/วัน`

---

## ส่วน 5 — Admin: ปุ่มรีเซตชั้นหอคอยทุกคน (ลาดเดอร์รายเดือน)

ไฟล์: `views/AdminView.vue` — เพิ่ม section "🏯 รีเซตหอคอย" (วางแผนกดเดือนละครั้ง)

- ปุ่ม "รีเซตชั้นหอคอยทุกคน" → `useConfirm` ยืนยันก่อน (destructive: กระทบทุกคน)
  ข้อความยืนยันบอกชัด: "ตั้ง `towerFloor`→1, `towerBest`→0 ของผู้เล่นทุกคน · โบนัสรายได้หอคอยจะหายจนกว่าจะไต่ใหม่ · เพ็ท/ทีมไม่ถูกแตะ"
- กลไก: `getDocs(collection(db,'users'))` → `writeBatch` set `{ towerFloor:1, towerBest:0 }` (merge) ทุก doc →
  commit · `usage.track(reads=N, writes=N)` · จำนวนคนชั้นปี < 500 → batch เดียวพอ (ถ้าเกินค่อยแบ่ง chunk 450)
- best-effort + toast ผล ("รีเซตหอคอย N คนแล้ว" / error) · ปุ่ม disabled ระหว่างทำ
- **ไม่ต้องแก้ rules**: rules `allow update: if isAdmin()` ให้แอดมินเขียน field ใดก็ได้บน user doc ทุกคนอยู่แล้ว
  (towerFloor/towerBest ไม่ได้ถูก guard ใน admin branch) — ยืนยันก่อนทำจริง
- **ไม่แตะ** coins/pets/activePets/residence — เฉพาะ 2 field หอคอย

---

## ไฟล์ที่แตะ

| ไฟล์ | งาน |
|---|---|
| `src/data/towerFloors.js` (+test) | `floorZone(floor)` pure |
| `src/views/TowerView.vue` | rewrite: climb strip + การ์ดโซนแฟนซี + แตะทีม→detail + scout ศัตรู |
| `src/components/battle/TeamPicker.vue` | battleSlots + แตะช่อง→PetDetailModal(ฝังใน) + แตะ pool→toggle |
| `src/views/PetsView.vue` | แถบ "ทีมต่อสู้" + ปุ่มจัดทีม (เปิด TeamPicker) |
| `src/components/home/DailyCard.vue` | บรรทัดรายได้ 🏯 หอคอย |
| `src/views/AdminView.vue` | ปุ่มรีเซตชั้นหอคอยทุกคน (confirm + batch) |

reuse ตามเดิม: `PetDetailModal` (prop petId), `useTower`, `buildCombatant`, `residenceBattleSlots`, `ELEMENTS`

## Testing
- `node --test src/data/towerFloors.test.js` (floorZone: ขอบเขตชั้น 1/12/13/25/26/38/39/50 → โซนถูก)
- `npm run build` ผ่าน
- manual (dev): หอคอย — แถบไต่ชั้นถูกตาม floor/best · แตะทีมคุณ→detail · แตะศัตรู→scout · จัดทีม battleSlots ถูกตามเลเวลบ้าน · หน้าเพ็ท แถบทีม+จัดทีม · Home เห็นบรรทัดหอคอยเมื่อ best≥10
- manual (admin): ปุ่มรีเซตหอคอย → ยืนยัน → ตรวจ Firestore ว่า towerFloor/towerBest ของ user รีเซต (ทดสอบบน doc ตัวเองก่อน)

## Deploy / อนุมัติ
1. `git push origin master` (เว็บหลัก) — **ไม่มี rules deploy** (ไม่แตะ rules)

## Out of scope (ภายหลัง)
- Expedition · passive จริง · market · cron auto-reset (รอบนี้รีเซตด้วยมือ admin)
