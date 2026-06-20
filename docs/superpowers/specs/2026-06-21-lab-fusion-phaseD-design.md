# Spec: ห้องทดลอง / Fusion — Phase D (dupe sink: fusion ไต่ระดับ + แลก copies เป็นเหรียญ)

วันที่: 2026-06-21 · สถานะ: **ดีไซน์อนุมัติแล้ว** (ผ่าน brainstorming)

## ขอบเขต & ที่มา
Phase D ของ rework เพ็ท+กาชา (ต่อจาก Phase B กาชา · spec `2026-06-20-gacha-rework-phaseB-design.md` §8) — **ทางระบาย copies** ที่ล้นหลังลด grade-up เหลือ 1 copy/ขั้น. ต่อยอดแนวคิด "ห้องทดลอง/วิวัฒนาการยีน" ของ v1.

**โมเดลหลัก (เคาะ brainstorming 2026-06-21): ไม่มี currency ใหม่ — ใช้ `pets[].copies` ตรงๆ**
- "ยอด copies ของระดับ R" = ผลรวม `copies` ของเพ็ททุกตัวระดับ R (computed, ไม่เก็บ field)
- ตอนใช้จ่าย → เปิด **spend-picker** ให้เลือกว่าจะดึง copies จากเพ็ทตัวไหน กี่ตัว (ยืดหยุ่น ไม่ commit ล่วงหน้าแบบ dissolve)
- **ไม่แตะ `firestore.rules` / `userSchema` / ไม่มี migration** — copies มีอยู่แล้วจาก Phase A/B

### Decisions
- **ไม่มีระบบ "สลาย" / ไม่มี token pool** — copies คาบนเพ็ทเหมือนเดิม จ่ายตอนใช้ผ่าน picker
- **Fusion:** จ่าย **copies ระดับล่างอย่างเดียว** (ไม่ใช้เหรียญ) → **สุ่ม uniform ระดับบน** (ไม่ new-first → ได้ตัวซ้ำก็ได้ = +1 copy) · common→rare 15 · rare→epic 12 · epic→legendary 10 (draft)
- **ร้านแลก:** copies → **เหรียญ scale ตามระดับ** (ไม่ใช่ตั๋ว — ตั๋วค่าคงที่เลยไม่คุ้ม copies ระดับสูง) · common 50 / rare 200 / epic 800 / legendary 3000 ต่อ copy (draft)
- copies ยังใช้ **อัพเกรด** ได้เหมือนเดิม → ผู้เล่นเลือกตอนจ่ายว่าดึงจากตัวไหน
- **UI = แท็บใน Shop** `[อัญเชิญ | ห้องทดลอง]`
- **Out of scope:** ของอื่นในร้านแลกนอกจากเหรียญ, fusion นับ daily quest (ไม่นับ), passive/battle (Phase C)

### หมายเหตุเศรษฐกิจ (ไม่ใช่ faucet)
ร้านแลก copies→เหรียญ = **คืนทุนแบบขาดทุนเสมอ** (ค่า redeem ต่อ copy << ต้นทุนสุ่มที่ได้ copy นั้นมา) → เป็น sink ไม่ใช่ faucet. ตรวจ loop fusion→redeem ไม่ exploit: 15 common→1 rare→redeem 200 เหรียญ **น้อยกว่า** redeem 15 common ตรงๆ (750) → ไม่มีช่องปั่น. copies สร้างฟรีไม่ได้.

---

## 1. `utils/lab.js` (ใหม่ · pure · ฉีด `rng` ได้ · มี `.test.js`)
ค่าคงที่ (draft pin):
```
FUSION_COST = { common: 15, rare: 12, epic: 10 }   // copies ระดับล่างที่ต้องจ่ายเพื่อหลอมขึ้น
REDEEM_COIN = { common: 50, rare: 200, epic: 800, legendary: 3000 }  // เหรียญต่อ 1 copy
```
ฟังก์ชัน pure:
- `nextRarity(r)` → `'common'→'rare'`, `'rare'→'epic'`, `'epic'→'legendary'`, อื่น/`legendary`→`null` (legendary หลอมต่อไม่ได้)
- `rarityCopyTotal(pets, rarity)` → ผลรวม `copies` ของเพ็ทระดับ `rarity` (เฉพาะตัวที่ `copies>0`)
- `applyCopySpend(pets, allocation)` → pets ใหม่ที่หัก copies ตาม `allocation = [{ id, n }]`:
  - validate: ทุก entry เพ็ทมีจริง + `n>=1` + `n <= pet.copies` · ถ้า invalid → throw `Error('invalid copy spend')`
  - return pets clone ที่ `copies -= n` (ไม่แตะ field อื่น)
- `fuseRoll(sourceRarity, catalog, rng)` → species id สุ่ม uniform จาก pool ของ `nextRarity(sourceRarity)` (reuse `rarityPool` จาก `utils/gacha.js`)
- `redeemValue(allocation, rarity)` → `Σ n × REDEEM_COIN[rarity]`
- `allocationTotal(allocation)` → `Σ n` (helper สำหรับเช็คครบ X ใน fusion)

## 2. `components/shop/SpendCopiesModal.vue` (ใหม่ · Teleport)
Picker กลางที่ fusion + redeem ใช้ร่วม.
- **Props:** `rarity` (R), `mode` (`'fusion'|'redeem'`), `required` (fusion: จำนวน X ที่ต้องครบ · redeem: ไม่ใช้)
- แสดงเพ็ทระดับ R ที่ `copies>0` แต่ละตัว: emoji/ชื่อ + stepper `0..pet.copies` (local allocation state)
- หัวข้อ:
  - fusion → "ต้องใช้ {required} · เลือกแล้ว {total}/{required}" + ปุ่ม **auto** (เติมจากตัว copies เยอะสุดก่อนจนครบ)
  - redeem → "เลือก {total} copies · ได้ {redeemValue} เหรียญ" (live)
- ปุ่มยืนยัน enable เมื่อ: fusion `total === required` · redeem `total >= 1`
- **Emit `confirm(allocation)`** (`[{id,n}]` เฉพาะ n>0) · `cancel`
- ถ้า `rarityCopyTotal < required` (fusion) → แสดง "copies ไม่พอ ({total}/{required})" ปิดปุ่ม
- `<Teleport to="body">` (กับดัก stacking context)

## 3. `components/shop/LabTab.vue` (ใหม่)
- **ยอด copies 4 ระดับ:** การ์ดบนสุดโชว์ `rarityCopyTotal` ของ common/rare/epic/legendary (สี rarity)
- **การ์ด Fusion:** 3 แถว (common→rare / rare→epic / epic→legendary) · แต่ละแถวโชว์ราคา (`FUSION_COST`) + ปุ่ม "หลอม" (disable ถ้า copies ระดับล่างไม่พอ) → เปิด SpendCopiesModal (mode fusion)
- **การ์ดแลกเหรียญ:** 4 แถว (ต่อ rarity) โชว์อัตรา (`REDEEM_COIN`/copy) + ปุ่ม "แลกเหรียญ" (disable ถ้าระดับนั้น copies=0) → เปิด SpendCopiesModal (mode redeem)
- **Reveal (fusion):** modal เล็กโชว์ผลที่หลอมได้ (emoji/ชื่อ/rarity + ป้าย "ใหม่!"/"+1") — `<Teleport>`
- **Actions** (เขียน user doc ผ่าน `authStore.patchUser(optimistic, server)`):
  - **fusion confirm(allocation):** `petsAfter = applyCopySpend(pets, allocation)` → `roll = { rarity: nextRarity(src), id: fuseRoll(src, PETS) }` → `{ pets: final, summary } = mergeRolls(petsAfter, [roll], PETS)` → `patchUser({pets: final}, {pets: final})` → reveal `summary[0]`
  - **redeem confirm(allocation):** `petsAfter = applyCopySpend(pets, allocation)` · `coinsGain = redeemValue(allocation, rarity)` → `patchUser({pets: petsAfter, coins: coins+coinsGain}, {pets: petsAfter, coins: increment(coinsGain)})` → toast "ได้ {coinsGain} เหรียญ"
  - guard `busy` กันกดซ้ำ · fusion ไม่ bump `dailyQuest.gacha`

## 4. `views/ShopView.vue` (แก้ — เพิ่ม tab)
- เพิ่ม state `tab` (`'gacha'|'lab'`, default `'gacha'`)
- แถบ tab switcher บนสุด (ใต้ shop-head): ปุ่ม `[🎰 อัญเชิญ | 🧪 ห้องทดลอง]`
- เนื้อหา banner เดิม → ครอบ `v-if="tab==='gacha'"` · `<LabTab v-else />`
- gate `shopOpen` เดิมครอบทั้งสองแท็บ (นักศึกษายังเห็น "ปรับปรุง", admin เห็นจริง)
- ไม่แตะ logic กาชาเดิม

## 5. เทส & verify
- pure (`node --test src/utils/lab.test.js`): `nextRarity` (รวม legendary→null) · `rarityCopyTotal` · `applyCopySpend` (หักถูก, clone ไม่ mutate, invalid→throw) · `fuseRoll` (อยู่ใน pool nextRarity, ฉีด rng) · `redeemValue` · `allocationTotal`
- UI: `npm run build` + ลองมือ (fusion ครบ 3 ชั้น, auto-fill, แลกเหรียญ, copies ไม่พอ disable, reveal)
- **ไม่แตะ rules/index/userSchema/migration** · reuse `mergeRolls`(gachaMerge) + `rarityPool`(gacha)

## 6. ลำดับงาน (คร่าวๆ — ละเอียดใน plan)
1. `utils/lab.js` + เทส (nextRarity/rarityCopyTotal/applyCopySpend/fuseRoll/redeemValue/allocationTotal)
2. `components/shop/SpendCopiesModal.vue` (picker, Teleport)
3. `components/shop/LabTab.vue` (ยอด copies + fusion + redeem + reveal + เขียน doc)
4. `views/ShopView.vue` เพิ่ม tab switcher + ครอบ banner/LabTab
5. build + ลองมือ

## หลักการที่ยึด
- pure util + `node --test` (ฉีด rng) · เขียน user doc ผ่าน `patchUser` · ตัวเลขเศรษฐกิจ = draft pin ใน `utils/lab.js` ที่เดียว
- modal/overlay ใหม่ → `<Teleport to="body">` · emoji ผ่าน `<Emoji>`
- ไม่แตะ firestore.rules / userSchema / migration · reuse ของ Phase B (`mergeRolls`, `rarityPool`)
- แตกไฟล์ให้โฟกัส (lab logic / picker / lab tab แยกกัน) กัน ShopView บวม
