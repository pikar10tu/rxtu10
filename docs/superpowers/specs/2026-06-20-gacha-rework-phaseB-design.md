# Spec: Gacha Rework — Phase B (banner + pity + target 50/50 + copies exchange + pet income)

วันที่: 2026-06-20 · สถานะ: **ดีไซน์อนุมัติแล้ว** (ผ่าน brainstorming)

## ขอบเขต & ที่มา
เฟส B ของการ rework เพ็ท+กาชา (sub-project 2 ของ `docs/economy-battle-master-plan.md`).
เฟส A (`2026-06-19-pet-rework-phaseA-design.md`) วางรากฐาน species-based + เกรด I–V + migration ไปแล้ว (live).
เฟส B = **รื้อกาชาเต็มรูปแบบ**: ยุบไข่ 4 ใบเป็น banner เดียว + pity + ระบบเลือกเป้า legendary 50/50 + ปรับ grade-up cost (1 copy/ขั้น) + ดันรายได้เพ็ท + เก็บกวาด refine
(ทางระบาย copies — token/แลกของ/fusion — แยกไป Phase D · potential combat แยก Phase C)

**ไม่แตะ `firestore.rules` / ไม่มี composite index ใหม่** — ทุก field อยู่บน user doc (owner-write)

### Decisions (brainstorming 2026-06-20)
- **Banner เดียว** — ยุบ `EGG_TYPES` 4 ใบ → standard banner pool รวม. สุ่ม 1 = 1,000🪙 · สุ่ม 10 = 10,000🪙 (ได้ 11 ตัว, "เปิด 10 แถม 1")
- **Pity ตัวนับเดียว** `gachaPity` — soft pity 76+, hard pity 100 การันตี legendary, reset เมื่อออก legendary
- **Legendary ออกตัวไหน:** มีเป้า → **50/50** (win=เป้า · lose=สุ่มตัวอื่น+ติดธงการันตี) · ไม่มีเป้า → **new-first** (สุ่มตัวที่ยังไม่มีก่อน)
- **ตัวซ้ำ:** ตัวแรก=ปลดล็อก (copies 0) · ซ้ำ=+1 copy *(เฟส A ทำอยู่แล้ว)*
- **Grade-up:** เปลี่ยนจาก N copies/ขั้น → **1 copy/ขั้น** (รวม 5 copies ถึง V) · เหรียญค่าอัพคงสูตรเดิม (coin sink)
- **copies ใน Phase B = ใช้อัพเกรดอย่างเดียว** (1 copy/ขั้น) · ทางระบาย copies (สลายเป็น token → แลกของ/fusion) = **แยก Phase D, spec ต่างหาก** (ดู §8)
- **ตั๋วรวมระบบเดียว** — 1 ตั๋ว = สุ่ม 1 ครั้งบน banner (Phase B: ตั๋วมาจาก daily quest เท่านั้น) · เลิกใช้ `DAILY_QUEST_TICKET_EGG`
- **ดันรายได้เพ็ท base ×2.5** (income คิดต่อชนิดแล้ว ไม่ใช่ต่อ instance → ต้องชดเชย)
- **เก็บกวาด `refine` (ตีบวก) — field ตาย** เฟส A แทนด้วยระบบเกรดแล้ว ไม่มี logic อ่าน · ลบออกตอนสร้างเพ็ทใหม่ + แก้ guide.js
- **Out of scope:** featured banner หมุนตามเวลา/แอดมินจัด, **ระบบ token/แลกของ/fusion (→ Phase D)**, battle stat/passive, **potential rework (→ Phase C)**
- **หมายเหตุ:** ลด grade เหลือ 1 copy/ขั้น → common/rare/epic จะมี copies ล้นใน Phase B (ยังไม่มีทางระบายจน Phase D) — ยอมรับได้ชั่วคราว (Shop ยังปิด `SHOP_OPEN=false`, build Phase D ทันก่อนเปิด)

---

## 1. Data model — `data/userSchema.js` USER_DEFAULTS
เพิ่ม 3 field:
```
gachaPity: 0,          // จำนวน pull ตั้งแต่ legendary ล่าสุด (soft 76 / hard 100)
gachaTarget: null,     // species id ของ legendary ที่เลือกเป็นเป้า (null = ไม่เลือก → new-first)
gachaGuaranteed: false // true = legendary ครั้งหน้าการันตีตัวเป้า (จากการ lose 50/50)
```
- reuse: `pets[].copies`, `freeGachaTickets`, `totalSpent`, `dailyQuest.gacha`
- legacy ที่เลิกใช้ (ไม่ลบ field กัน normalize พัง): `eggs[]`, `pityClaimedRounds` (ระบบไข่เก่า) — ปล่อยไว้, ไม่อ้างอิงในโค้ดใหม่
- `gachaTarget`/`gachaGuaranteed` เป็น scalar/bool ไม่ต้อง deep-default

## 2. `utils/gacha.js` (ใหม่ · pure · ฉีด `rng` ได้ทุกฟังก์ชัน · มี `.test.js`)
ค่าคงที่ (draft pin, export ไว้ปรับที่เดียว):
```
GACHA_RATES   = { common: 60.5, rare: 30, epic: 8, legendary: 1.5 }  // % (sum 100)
SOFT_PITY     = 76    // pull ที่เริ่มไต่ rate legendary
HARD_PITY     = 100   // การันตี legendary
SOFT_PITY_STEP= 6     // +%/pull หลัง soft pity (draft)
PULL_COST     = 1000
TEN_PULL_COST = 10000
TEN_PULL_N    = 11    // ได้ 11 ตัวจากการสุ่ม 10
```

ฟังก์ชัน pure:
- `legendaryChance(pity)` → % legendary ที่ pity นี้: ก่อน soft = `GACHA_RATES.legendary`; ตั้งแต่ `SOFT_PITY` ไต่ `+SOFT_PITY_STEP`/pull; `>= HARD_PITY-1` → 100
- `rollRarity(pity, rng)` → `'common'|'rare'|'epic'|'legendary'` (ใช้ `legendaryChance` คุม legendary, ที่เหลือกระจายตามสัดส่วน rate เดิม)
- `pickLegendary({ target, guaranteed, ownedLegendaryIds, legendaryIds, rng })` → `{ id, won|null, newGuaranteed }`:
  - ถ้า `target`:
    - `guaranteed` → คืน `target`, `won:true`, `newGuaranteed:false`
    - ไม่งั้น 50/50: win → `target`, `newGuaranteed:false` · lose → สุ่มจาก legendary **ที่ไม่ใช่ target**, `won:false`, `newGuaranteed:true`
  - ไม่มี `target` (new-first): unowned = `legendaryIds \ ownedLegendaryIds`; ถ้ามี → สุ่มจาก unowned; ครบแล้ว → สุ่มทั้งหมด · `newGuaranteed:false`
  - **กฎการันตี (ยืนยัน 2026-06-20):** pity รีเซ็ต 0 ทุกครั้งที่ออก legendary · lose → `newGuaranteed:true` → legendary **ตัวถัดไป** (จะออกเองตอน pity เท่าไรก็ตาม หรือชน hard pity) = ตัวเป้าแน่นอน → ล้างธง · ซวยสุด = lose ที่ pull 100 → ได้เป้าช้าสุด pull 200 · **ระหว่างนั้นถ้าโชคดีออก legendary เองที่ pull 130 ตัวนั้น = ตัวเป้าทันที** (ไม่ใช่ 50/50 ซ้ำ)
- `pickNonLegendary(rarity, rarityPoolIds, rng)` → สุ่ม species id จาก pool ของ rarity นั้น (ทุก rarity ใช้สุ่มเต็ม pool — ตั้งใจให้ rare/epic/common ได้ตัวซ้ำเป็น copies)
- `rollOne(state, catalog, rng)` → `{ rarity, id, won, nextPity, nextTarget, nextGuaranteed }` (รวม logic ข้างบน 1 ครั้ง · legendary → pity reset 0 + อัปเดต guaranteed; ไม่ใช่ → pity+1)
- `rollMany(n, state, catalog, rng)` → `{ results[], nextState }`: วน `rollOne` n ครั้ง (carry state) + **การันตี ≥1 epic ต่อ 10**: ถ้าใน 10 ตัวแรก (หรือทั้งชุดถ้า n<10) ไม่มี ≥ epic → upgrade ตัวสุดท้ายเป็น epic (สุ่ม id epic pool)
  - `results[i]` = `{ rarity, id, won }` (ดิบ — caller เอาไป merge)

> หมายเหตุ: `catalog` = `PETS` จาก `data/index.js`; helper สร้าง `legendaryIds`/`rarityPoolIds` จาก catalog. `ownedLegendaryIds` ส่งจาก caller (จาก `user.pets`).

## 3. `utils/gachaMerge.js` (ใหม่ · pure · `.test.js`) — รวมผลเข้า pets
- `mergeRolls(pets, results, catalog)` → `{ pets: newPets, summary: [{ id, name, rarity, emoji, isNew }] }`
  - แต่ละ result: ถ้า species ยังไม่มีใน `pets` → push instance ใหม่จาก catalog (grade 0, copies 0, `isNew:true`) · ถ้ามีแล้ว → `copies+1`, `isNew:false`
  - หลายตัวซ้ำในชุดเดียว (10-pull) ต้องสะสมถูก (เช่นได้ cat 3 ตัว → ปลดล็อก +2 copies)
  - คืน `summary` ไว้โชว์ reveal grid (เรียง rarity สูง→ต่ำ)
- ใช้ logic merge-by-id ร่วมกับ acquisition เดิม (เลี่ยงโค้ดซ้ำกับ ShopView `buy()` เดิม)

## 4. `utils/petGrade.js` (แก้) — grade-up 1 copy/ขั้น
- `gradeUpCost(pet)`: เปลี่ยน `copies: target` → **`copies: 1`** (เหรียญ `base * target` คงเดิม)
- `canUpgrade` ไม่ต้องแก้ (อ่านจาก `gradeUpCost`)
- อัปเดต `petGrade.test.js`: ทุกขั้นต้องการ 1 copy, เหรียญยัง scale ตามเกรดเป้า, grade≥5 → null

## 5. UI

### 5.1 `data/shop.js` (รื้อ)
- ลบ `EGG_TYPES`, `getEgg`, `rollPetFromEgg`, `DAILY_QUEST_TICKET_EGG` (ย้าย logic ไป `utils/gacha.js`)
- เก็บ banner meta เบาๆ ถ้าต้อง (ชื่อ/emoji banner) หรือ inline ใน ShopView

### 5.2 `views/ShopView.vue` (รื้อ section กาชา)
- ลบ egg-list 4 ใบ → **การ์ด banner เดียว**:
  - แสดงเป้าหมายปัจจุบัน (`gachaTarget` → emoji+ชื่อ legendary) + ปุ่ม **"เลือกเป้าหมาย"** → modal เลือกจาก 9 legendary (โชว์ตัวที่มี/เกรด/เป็นเป้าอยู่) · เลือก/ล้างเป้าได้
  - ตัวนับ pity: "อีก {100 − gachaPity} ครั้งการันตี legendary" + ป้าย **"การันตีตัวเป้ารอบหน้า"** เมื่อ `gachaGuaranteed`
  - rate ย่อ (legendary 1.5% ฯลฯ)
  - ปุ่ม **สุ่ม 1 (1,000)** / **สุ่ม 10 (10,000)** · ปุ่ม **ใช้ตั๋วฟรี (×N)** = สุ่ม 1 ฟรี
- เขียน user doc (pattern `patchUser`/`blockSnapshot` เดิม): `coins` (−cost), `pets`, `gachaPity`/`gachaTarget`/`gachaGuaranteed` (ค่าใหม่จาก `nextState`), `dailyQuest` (bump `gacha`), `totalSpent` (+cost), `freeGachaTickets` (−1 ถ้าใช้ตั๋ว)
- ส่วนลดร้าน (`residenceShopDiscount`) — คงไว้กับ PULL_COST/TEN_PULL_COST (เหมือนไข่เดิม)

### 5.3 Reveal
- single (1 ตัว / ตั๋ว) — reuse modal เดิม + ป้าย "ใหม่!"/"+1 copy" + ถ้า win เป้า → ไฮไลต์พิเศษ
- **grid reveal 10-pull** (ใหม่) — โชว์ 11 ผลเป็นกริด, สีกรอบตาม rarity, ป้าย "ใหม่!"/"+1", ปุ่มปิด · animation เบาๆ
- ⚠️ modal ต้อง `<Teleport to="body">` (กับดัก stacking context `#main-content` position:fixed — ดู ROADMAP/memory)

### 5.4 `views/PetsView.vue` + `components/pets/PetDetailModal.vue`
- อัพเกรด: ใช้ `gradeUpCost` (1 copy + เหรียญ) — UI เดิมทำงานต่อ, แค่ตัวเลข copies ลดเหลือ 1/ขั้น
- *(ทางระบาย copies — สลายเป็น token/fusion — อยู่ Phase D ไม่ทำใน B)*

### 5.5 `utils/petUtils.js` — ดันรายได้เพ็ท
- `RARITY_DAILY_BASE` 6/15/35/70 → **15/38/85/175** (×2.5, draft pin)
- `GRADE_MULTI_V2` คงเดิม `[1.0, 2.0, 3.5, 5.5, 8.0, 12.0]`
- เป้า: ครบ 27 ตัวเกรด V ≈ 28,980/วัน (+โบนัสบ้าน Lv12 ≈ 63k) ≈ เท่าบ้านระดับเดียวกัน

## 6. เทส & verify
- pure (`node --test`): `gacha.test.js` (legendaryChance ramp / hard pity / rollRarity สัดส่วน / pickLegendary 50-50+guarantee+new-first / rollMany epic-guarantee — ฉีด rng deterministic) · `gachaMerge.test.js` (unlock vs +copy, ซ้ำในชุด) · `petGrade.test.js` (อัปเดต 1 copy/ขั้น)
- UI: `npm run build` + ลองมือใน dev (สุ่ม 1/10, เลือกเป้า, 50/50, อัพเกรด 1 copy, รายได้เพ็ทใหม่)
- ไม่แตะ rules/index · Shop เปิดจริง = flip `SHOP_OPEN=true` (แยก commit ตอนพร้อม launch)

## 7. ลำดับงาน (คร่าวๆ — ละเอียดใน plan)
1. userSchema 3 field + petUtils รายได้ ×2.5
2. `utils/gacha.js` + เทส
3. `utils/gachaMerge.js` + เทส
4. `petGrade.js` 1 copy/ขั้น + เทสอัปเดต
5. ShopView รื้อ banner + target picker + pity + เขียน doc
6. Reveal single + grid 10-pull (Teleport)
7. PetsView/PetDetailModal: อัพเกรด 1 copy
8. ลบ legacy `data/shop.js` egg API + `refine` field + ตรวจ caller (`DAILY_QUEST_TICKET_EGG` ใน Shop/daily, guide.js ข้อความ "ตีบวก") + build + ลองมือ

## 8. Phase ถัดไป (จดไว้กัน decision หาย — เขียน spec แยกทีละเฟส)

### Phase C — Potential rework (ระบบเตรียมพลังต่อสู้ combat-only) — brainstorm 2026-06-20
- affix เหลือ **6 ตัวต่อสู้** (ตัด `dailyCoins` + ตัด code path income ใน `petUtils.petDailyCoins`): atk/hp/crit/critDmg/lifesteal/dodge
- roll cost รื้อจาก "สังเวยเพ็ท fodder" → **token (จาก Phase D) + เหรียญ** หรือ copies + เหรียญ (เคาะตอน spec C)
- slot ตาม rarity (1-4) · 1 slot 1 affix ห้ามสแตทซ้ำ · re-roll → preview → เก็บ/ทับ
- pre-battle: เลขสู้ขยับเห็นใน PetDetailModal (min-max) แต่ไม่มีผลกลไกจน battle เปิด — frame "เตรียมทีม"
- มีอยู่แล้ว: `data/potential.js`, PetDetailModal โชว์ slot read-only

### Phase D — Token Shop / ห้องทดลอง (dupe sink รวม) — brainstorm 2026-06-20
- กอง **`dupeCoins{common,rare,epic,legendary}`** (per-rarity, field ใหม่เริ่ม 0, ไม่ต้อง migrate)
- **สลาย copies → token:** ผู้เล่นเลือก "สลาย" copy ของเพ็ทตัวใดก็ได้ (ไม่ต้องรอเกรด V) → +token ตาม rarity ตัวนั้น (one-way; เกรดยังต้องใช้ copies ของตัวเองเอง → token แปลงกลับเป็น copy เฉพาะตัวไม่ได้ = legendary ไม่ง่ายเกิน)
- **fusion ไต่ระดับ:** รวม X token tier T → การันตีสุ่มเพ็ท tier T+1 (random ตัว, legendary ใช้ new-first) · X ต่อชั้นไม่เท่ากันได้ (เช่น common→rare 20 / rare→epic 15 / epic→legendary 10 — TBD ตอน spec D)
- **แลกของ:** token → ตั๋วกาชา (+ ของอื่นต่อยอด) · ต่อยอดแนวคิด "ห้องทดลอง/วิวัฒนาการยีน" ของ v1
- ⚠️ ต้องสร้างก่อนเปิด Shop จริง (ไม่งั้น copies ระดับล่างล้นไม่มีทางระบายตั้งแต่ Phase B)

## หลักการที่ยึด
- pure util + `node --test` (ฉีด rng) · เพิ่ม field → userSchema ที่เดียว · เขียน user doc ผ่าน `patchUser`
- ตัวเลขเศรษฐกิจทั้งหมด = draft pin ใน `data/`/`utils/` ปรับที่เดียว ("ทำงานได้ก่อน จูนทีหลัง")
- modal/sheet ใหม่ → `<Teleport to="body">` เสมอ · emoji ใหม่ (ถ้ามี) → `<Emoji>` + fetch fluent
- ไม่แตะ firestore.rules / ไม่มี index ใหม่
