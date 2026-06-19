# Spec: Pet Rework — Phase A (model + grade + roster + migration)

วันที่: 2026-06-19 · สถานะ: **ดีไซน์อนุมัติแล้ว** (ผ่าน brainstorming)

## ขอบเขต & ที่มา
เฟส A ของการ rework เพ็ท+กาชา (sub-project 2 ของ `docs/economy-battle-master-plan.md`). เฟสนี้ = **รากฐาน**: เปลี่ยนโมเดลถือเพ็ทเป็น species-based, เกรด I–V ใหม่ (dupe-copies + เหรียญ), roster 42→27, และ **migration ของเพ็ททุกคน** (one-time).
**เฟส B (กาชา rework) = spec แยก ทำหลังเทสเฟส A** — ไม่อยู่ใน spec นี้.

**Decisions (brainstorming 2026-06-19):**
- **Species-based**: `pets` ยังเป็น array แต่ **1 entry/ชนิด** + field `copies` (dupe สะสม) · `activePets` เก็บ **species id** (เลิก instId)
- **เก็บ field denormalized** (emoji/name/rarity/element) บน instance ต่อ → **migration เขียนทับจาก catalog ใหม่** (reskin ไม่ค้าง, consumer ที่อ่าน `pet.xxx` ไม่ต้องแก้). acquisition ใหม่ก็ copy จาก catalog
- **เกรด I–V** · อัพไปเกรด N ใช้ **N copies + เหรียญ** (รวม 1+2+3+4+5 = 15 copies ถึง V) · ของเก่าลดเกรดตามสัดส่วน · **รีสเกลพลัง/รายได้ใหม่ (array 6 ช่อง)**
- **Migration เก็บเพ็ทไว้** (ไม่ reset): merge instance ซ้ำ, reskin, scale grade, คืนเหรียญเฉพาะตัวตัด + rarity-nerf
- ไม่รวม: กาชา (เฟส B), battle stat/passive, farm cap, featured banner
- ไม่แตะ firestore.rules (pets เป็น field บน user doc, owner-write)

---

## 1. Catalog ใหม่ — `data/index.js` `PETS` (27 ตัว)
กริด **4 rarity × 3 ธาตุ** · legendary 3/ธาตุ · epic/rare/common 2/ธาตุ · ทุก emoji ไม่ซ้ำ (master plan §3.5)

| rarity | ✊ fist | ✌️ scissors | ✋ paper |
|---|---|---|---|
| legendary | `bahamut` บาฮามุท 🐉 · `kirin`→โอนิ 👹 · `trex` ทีเร็กซ์ 🦖 | `ouroboros` อูโรโบรอส 🐍 · `simurgh`→กริฟฟิน 🦅 · `phoenix` ฟีนิกซ์ 🐦‍🔥 | `whale` คุณวาฬ 🐳 · `qilin`→บากุ 🐘 · `mammoth` แมมมอธ 🦣 |
| epic | `dragon` มังกร 🐲 · `cerberus` เซอร์เบอรัส 🐕 | `unicorn` ยูนิคอร์น 🦄 · `fairy` ภูต 🧚 | `panda` แพนด้า 🐼 · `genie` จินนี่ 🧞 |
| rare | `wolf` หมาป่า 🐺 · `shark` ฉลาม 🦈 | `fox` จิ้งจอก 🦊 · `rabbit` กระต่าย 🐰 | `owl` นกฮูก 🦉 · `seal` แมวน้ำ 🦭 |
| common | `hedgehog` เม่น 🦔 · `hamster` แฮมสเตอร์ 🐹 | `mouse` หนู 🐭 · `cat` แมว 🐱 | `butterfly` ผีเสื้อ 🦋 · `turtle` เต่า 🐢 |

- **id ใหม่ (5):** `trex`🦖, `whale`🐳, `mammoth`🦣, `genie`🧞, `fairy`🧚 (ไม่มีในของเดิม)
- **reskin (คง id):** `kirin`(🦁→👹 คิริน→โอนิ, fist คงเดิม) · `simurgh`(🦅 ซีมูร์ก→กริฟฟิน, paper→**scissors**) · `qilin`(🐘 บากุ คงชื่อ/emoji, fist→**paper**)
- **phoenix:** epic→**legendary**, emoji 🦅→**🐦‍🔥**, scissors คงเดิม
- เก็บ field เดิม (`flavor`, `hatchMins`) ได้ · **ลบ field `rate`** (egg เก่า — เฟส B กาชาใหม่ไม่ใช้)
- เพิ่ม helper `getPetDef(id)` → catalog entry (ใช้ตอน migration/acquire refresh identity); ถ้า id ไม่รู้จัก → null
- **emoji ใหม่ต้อง fetch:** รัน `scripts/fetch-fluent.mjs` ดึง 🦖👹🐳🦣🧞🧚🐐(baku 🐘 มีแล้ว) · **🐦‍🔥 phoenix = emoji 2023 Fluent อาจไม่มี → fallback ดึง Twemoji SVG codepoint `1f426-200d-1f525` self-host** (master plan §3.5 เตือน)

## 2. Grade system I–V — `data/index.js` + `utils/petUtils.js`
- `GRADE_LABELS = ['','I','II','III','IV','V']` (6 ช่อง, index 0-5)
- **อัพเกรด:** ไป grade N ใช้ **N copies + เหรียญ** · `GRADE_UP_COPIES[n]` = n (n=1..5) · เหรียญ `gradeUpCoins(rarity, targetGrade)` = `RARITY_GRADE_COIN[rarity] * targetGrade` (draft pin `{common:200, rare:600, epic:1500, legendary:4000}`, tunable)
- **รีสเกลพลัง (draft pins, 6 ช่อง):**
  - stats: `STAT_MULTI = [1.0, 1.5, 2.1, 2.8, 3.6, 4.5]` (เดิม 13 ช่อง→6)
  - income: `GRADE_MULTI_V2 = [1.0, 1.7, 2.5, 3.4, 4.4, 5.5]` (เดิม 13→6) · `RARITY_DAILY_BASE` คงเดิม `{common:4,rare:10,epic:22,legendary:45}`
  - `GRADE_MULTI` (legacy stats) อัปเป็น 6 ช่องด้วย หรือลบถ้าไม่มีใช้ (ตรวจ consumer)
- pure util `utils/petGrade.js`: `gradeUpCost(pet) → { copies, coins } | null` (null ถ้า maxed/grade≥5) · `canUpgrade(pet, ownedCoins) → bool` (copies≥ต้องการ && coins พอ) + เทส
- `petStats`/`petDailyCoins` clamp grade ≤ 5 (array ใหม่ 6 ช่อง)

## 3. Pet instance shape (species-based)
```
{ id, grade(0-5), copies, instId, bornAt, potential[],   // คงไว้
  emoji, name, rarity, element }                          // denormalized — refresh จาก catalog
```
- **1 entry/ชนิด** ใน `pets[]` (ห้ามมี id ซ้ำ) · `copies` = dupe สะสมยังไม่ได้ใช้อัพเกรด
- `activePets` = array ของ **species id** (string) แทน instId · normalize: ถ้าเจอ instId เก่า → map เป็น id ตอน migration
- `userSchema.js`: เพิ่ม default `copies:0` ใน normalize ของ pet ไม่จำเป็น (instance-level) แต่เพิ่ม flag `petsMigratedV2: false` ใน USER_DEFAULTS

## 4. Migration (one-time, `utils/petMigration.js` pure + runner)
pure `migratePets(userData, catalog) → { pets, activePets, refundCoins }`:
1. **กรอง+merge:** จัดกลุ่ม `pets` เดิมตาม id → ตัดตัวที่ไม่อยู่ใน catalog ใหม่ (cut list) → ตัวที่เหลือ merge เป็น 1 entry/ชนิด:
   - `grade` = **max** ของกลุ่ม สเกล `round(oldGrade * 5 / 12)` clamp 0-5
   - `copies` = (จำนวน instance เกิน 1 ในกลุ่ม) + (copies เดิมถ้ามี)
   - refresh `emoji/name/rarity/element` จาก `getPetDef(id)` (reskin/rarity/element ใหม่มีผลทันที)
2. **refund เหรียญ:**
   - ตัวที่ถูกตัด: `REFUND[rarity] * (1 + grade*0.1)` ต่อ instance · `REFUND = {common:500, rare:2500, epic:8000, legendary:25000}` (draft pin — ใช้ rarity **เดิม**)
   - rarity nerf (butterfly rare→common, turtle rare→common): คืนส่วนต่าง `REFUND[old]-REFUND[new]` ต่อ instance
   - rarity buff (rabbit/seal common→rare, panda rare→epic, phoenix epic→legendary): ไม่คิดเงิน (ผู้เล่นได้เปรียบฟรี)
3. **activePets:** map instId เดิม → species id (หาเจ้าของ instId ใน pets เดิม) · ตัด id ที่ถูก cut ออก
- **runner** (`stores/auth.js` หรือ composable): เมื่อโหลด user doc แล้ว `!petsMigratedV2` → คำนวณ `migratePets` → `patchUser` เขียน `pets`/`activePets`/`coins: increment(refundCoins)`/`petsMigratedV2: true` ครั้งเดียว · toast แจ้ง "อัปเดตคลังเพ็ท + คืนเหรียญ X" ถ้า refund>0
- เทส pure `petMigration.test.js`: merge instance ซ้ำ→copies, grade scale XII→V, cut→refund, nerf→ส่วนต่าง, buff→ไม่คิด, activePets instId→id, idempotent (รันซ้ำ flag กัน)

## 5. Consumer updates (instance fields คงเดิม → แก้น้อย)
- **PetsView**: (a) grade-up UI ใหม่ — ปุ่ม "อัพเกรด (ใช้ N copies + เหรียญ)" ใช้ `gradeUpCost`/`canUpgrade` แทนระบบ refine เดิม · โชว์ `copies` · (b) active team select ใช้ species id (เทียบ `activePets.includes(pet.id)` แทน instId) · (c) acquisition เดิม (ถ้ามี) ที่ push instance ต้อง merge-by-id
- **ProfileModal showcase / activePets matching**: เทียบ species id แทน instId (`pets.find(p => p.id === activeId)`)
- **petStats/petDailyCoins/totalPetDaily**: ทำงานต่อ (array iterate) — แค่ array grade ใหม่ 6 ช่อง
- ตรวจ grep ทุกที่ที่ใช้ `instId` / `activePets` / `pet.rarity`-pool → ปรับ id-based
- **ShopView buy()/rollPetFromEgg**: เฟส A ยังไม่แตะกาชา แต่ `rollPetFromEgg` push instance → ต้อง merge-by-id (ถ้าได้ชนิดที่มีแล้ว → +copies) เพื่อไม่ให้ขัดโมเดลใหม่ระหว่างรอเฟส B · (กาชาเต็มรูปแบบ = เฟส B)

## 6. Rules / index / เทส
- **ไม่แตะ rules** (pets/activePets/coins/copies เป็น field user doc owner-write) · ไม่มี index
- เทส pure: `petGrade.test.js` (cost/canUpgrade/clamp) · `petMigration.test.js` (ครบเคสข้อ 4)
- UI: `npm run build` + ลองมือ (โดยเฉพาะ migration กับ account จริงหลัง deploy)

---

## Draft pins (จูนทีหลัง — เน้น "ทำงานได้ก่อน")
- STAT_MULTI / GRADE_MULTI_V2 (6 ช่อง) · RARITY_GRADE_COIN · REFUND — ทั้งหมดอยู่ใน data/ ปรับที่เดียว
- "เดี๋ยวมาสเกลพลังกันใหม่" (user) — ตัวเลขข้างบนเป็นหมุดเริ่ม

## Out of scope (→ เฟส B / ภายหลัง)
- กาชา rework (single/10-pull/pity/dupe→copies เต็มรูปแบบ + Shop UI) = เฟส B
- battle stat/passive, farm cap, featured banner, potential affix rework

## หลักการที่ยึด
- pure util + `node --test` (petGrade, petMigration) · เพิ่ม field → userSchema ที่เดียว · เขียน user doc ผ่าน patchUser
- migration idempotent (flag `petsMigratedV2`) — รันครั้งเดียว/คน · เก็บเพ็ทไว้ + คืนเหรียญเฉพาะที่เสีย
- denormalized refresh จาก catalog ตอน migrate/acquire (reskin ไม่ค้าง)
