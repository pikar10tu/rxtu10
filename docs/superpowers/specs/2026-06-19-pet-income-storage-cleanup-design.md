# Spec: Pet income retune + ลบ storage/vault (post-species-rework)

วันที่: 2026-06-19 · สถานะ: **ดีไซน์อนุมัติแล้ว** (ผ่าน brainstorming)

## ขอบเขต & ที่มา
หลัง Pet Rework เฟส A (species-based: 1 entry/ชนิด + copies) พบว่า: (1) ระบบคลัง/vault ไม่จำเป็นแล้ว (ซ้ำ→copies ไม่ overflow, max 27 ชนิด) · (2) รายได้ pet รายวันลดลง (เดิม Σ ทุก instance, ตอนนี้ Σ 27 ชนิด). spec นี้แก้ทั้งสอง = tuning + cleanup (ไม่มี pure util ใหม่, ไม่แตะ rules/migration).

**Decisions (brainstorming 2026-06-19):**
- ลบ storage cap + vault ทิ้ง (ถือครบ 27 ชนิดได้เสมอ)
- residence perk `petStorage` (ตายแล้ว) → **โบนัสรายได้ pet %**
- จูนรายได้ pet แบบ **reward-grind** (เกรดสูง = ออกเงินเยอะ, คุ้มการลง copies→เกรด)
- draft pins อนุมัติแล้ว (ปรับต่อได้ใน data/)

## 1. ลบ vault + storage cap
- `data/userSchema.js`: ลบ `petsVault` ออกจาก `USER_DEFAULTS` + บรรทัด normalize (`d.petsVault = ...`) · doc เก่าที่มี key `petsVault` ค้าง = ignore (ไม่ re-migrate)
- `views/PetsView.vue`: เลิกโชว์ `{{ pets.length }}/{{ storageCap }} คลัง` → เป็น `{{ pets.length }}/27 ชนิด` (27 = `PETS.length`, import จาก data) · ลบ `storageCap` computed + import `residencePetStorage`
- `views/ShopView.vue`: **ตัดเช็ก storage-cap ออกจาก `buy()` และ `useTicket()`** (ไม่มี "คลังเต็ม" แล้ว — 27 ชนิด max, ซ้ำ merge เข้า copies) · ลบแถบ `shop-storage` ที่โชว์ `pets.length/storageCap` (หรือเปลี่ยนเป็น "X/27 ชนิด") · ลบ `storageCap`/`residencePetStorage` import
- `data/guide.js` (pets section) + `components/onboarding/MigrationWelcome.vue`: แก้ข้อความเลิกพูดถึง "คลังพัก"/"เกินช่อง" — บอกแค่ว่าสะสมได้ทุกตัว ตัวซ้ำ→อัปเกรด

## 2. Residence perk: petStorage → petIncomeBonusPct
- `data/residence.js`: ในแต่ละ tier เปลี่ยน field `petStorage: <n>` → `petIncomeBonusPct: <n>` (ladder draft, level 1-15):
  `[0, 5, 10, 15, 20, 25, 35, 45, 60, 80, 100, 120, 140, 160, 180]` (index = level-1)
- เปลี่ยน accessor `residencePetStorage(level)` → `residencePetIncomeBonus(level)` (คืน `getTier(level).petIncomeBonusPct`) · ตรวจ grep ว่าไม่มีที่อื่นเรียก `residencePetStorage` (PetsView/ShopView จะถูกตัดในข้อ 1)
- `composables/useDaily.js`: ปัจจุบัน `ratePerDay = round((baseIncome + petIncome) * (1 + bonusPct/100) * buffMult)`. แก้ให้โบนัส residence คูณเฉพาะ **petIncome**:
  ```js
  const petBonusPct = computed(() => residencePetIncomeBonus(level.value))
  const petIncomeBoosted = computed(() => Math.round(petIncome.value * (1 + petBonusPct.value / 100)))
  const ratePerDay = computed(() => Math.round((baseIncome.value + petIncomeBoosted.value) * (1 + bonusPct.value / 100) * buffMult.value))
  ```
  expose `petBonusPct` (+ คง `petIncome` ดิบสำหรับ breakdown)
- `components/home/DailyCard.vue`: แถว breakdown เพิ่ม/ปรับ — โชว์ "🐾 สัตว์เลี้ยง {petIncome}/วัน" + ถ้า `petBonusPct>0` แถว "🏠 โบนัสบ้าน (เพ็ท) +{petBonusPct}%" (รูปแบบเดียวกับแถว supporter/quest เดิม)

## 3. จูนรายได้ pet (reward-grind, draft pins — `utils/petUtils.js`)
- `GRADE_MULTI_V2 = [1.0, 2.0, 3.5, 5.5, 8.0, 12.0]` (เกรด 0-5; V=12× เดิม 5.5× → ดันเกรดสูง)
- `RARITY_DAILY_BASE = { common: 6, rare: 15, epic: 35, legendary: 70 }` (เดิม 4/10/22/45)
- `petDailyCoins` clamp grade เดิม (≤ array length) ใช้ได้ต่อ — ไม่แตะ logic แค่เปลี่ยนค่า
- **ไม่แตะ** `STAT_MULTI`/`GRADE_MULTI` (battle stat — deferred)

## Scope / test
- ไม่มี pure util ใหม่ · ไม่แตะ rules/index/migration · ตรวจด้วย `npm run build` + ลองมือ (รายได้ pet ขึ้น, ไม่มี cap/vault ใน UI, DailyCard โชว์โบนัสถูก)
- หมายเหตุ: `residencePetStorage` ถูก rename → grep ให้แน่ใจไม่มี caller ค้าง

## หลักการ
- ค่าทั้งหมดเป็น draft pins ใน data/ ปรับที่เดียว · reward-grind: เกรด = ตัวขับรายได้หลัก · residence ยังมีค่า (perk ใหม่)
