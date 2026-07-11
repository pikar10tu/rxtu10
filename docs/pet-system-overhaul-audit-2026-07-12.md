# ยกเครื่องระบบเพ็ท — Audit + Roadmap (12 ก.ค. 2026)

รวมผลรีวิว 2 ด้านโดย fable (อ่านโค้ดจริง อ้าง file:line): **สถาปัตยกรรม/ระบบ** + **UX/UI**
ขอบเขต: ระบบเพ็ท + เกมที่เชื่อมทั้งหมด (income idle, gacha/lab, battle engine, Tower, Arena/PvP, Expedition)

## คำตัดสินรวม
> **โครงกระดูกแข็งแรงเกินคาด — ไม่ต้อง rewrite** ยกเครื่องที่ควรทำ = (1) เผาซาก legacy · (2) เคลียร์ระบบศักยภาพที่ค้างครึ่งทาง · (3) รวมเส้นพลัง 3 ชุด + ภาษาภาพเดียว · แล้วต่อยอด passive (payoff จริงที่ยังขาด) · คู่กับแก้ UX 3 จุดใหญ่ (nav ขากลับ, typography, empty-state)

---

## ✅ ของดี — เก็บไว้ อย่ารื้อ

**สถาปัตยกรรม:**
- Species-based collection (27 ตัว ตัวซ้ำ=`copies`) → user doc ไม่บวมจากเพ็ท (ตัวเสี่ยง bloat จริง = `study.cards`/`farm`)
- `battleEngine.js` deterministic (mulberry32 seeded) + compute-then-replay + log ครบ — ถูกต้องสำหรับ client-only
- pure utils + `.test.js` เกือบทุกไฟล์ (gacha/merge/petGrade/petTeam/engine/expedition)
- `resolveBattleTeam` = abstraction กลางที่ทุกโหมดสู้+expedition ใช้ร่วม
- gacha pity/50-50/new-first · expedition snapshot+seed กัน reroll · บอทหอคอย/PvP สร้างจากสูตรไม่เก็บ DB

**UX/UI:**
- ภาษา sticker เดียวทั้งระบบ (`2px solid --ink` + `--pop` + `:active translate`) = affordance "กดได้" ชัด
- **วินัย Teleport สมบูรณ์** — ทุก overlay ในระบบเพ็ทห่อ `<Teleport to="body">` ครบ (ห้ามถอด — บั๊กนี้วน ≥5 รอบ)
- เลข combat มาจาก `buildCombatant()` แหล่งเดียว (เลขที่เห็น=เลขที่สู้)
- **ความโปร่งใสกาชาเหนือมาตรฐาน** (pity counter, target+ป้าย "มีแล้ว", banner การันตี, rates ตรงๆ, reveal เคารพ reduced-motion) — ใช้เป็นต้นแบบ
- BattleReplay อ่านรู้เรื่อง (ป้ายฝั่ง, telegraph, callout แพ้ทาง, peek bar, inspect)
- TeamPicker กัน edge case ครบ (ติดผจญภัย disable, ghost id กรอง)

---

## 🔴 ปัญหา (รวม 2 ด้าน)

### 1. แกนพลัง 3-4 ชุดที่ไม่คุยกัน (หัวใจของการยกเครื่อง)
เพ็ทตัวเดียว (rarity+grade) ให้เส้นโค้งพลังต่างกันคนละไฟล์:
| โมเดล | ที่อยู่ | spread common g0→legendary g5 |
|---|---|---|
| สู้ | `data/battle.js:15-23` | ~2.8 เท่า (จงใจ flat กัน snowball) |
| รายได้ idle | `petUtils.js:14-22` | ~140 เท่า |
| Expedition | `data/expeditions.js:22-23` | ~12 เท่า |
| display เก่า | `data/index.js:31-44` | ตายสนิท |

ผล: อัพ V แล้ว "รวยขึ้น 12 เท่า แต่เก่งขึ้นแค่ 2.8 เท่า" · **rarity แทบไม่มีผลตอนสู้** (legendary ATK ฐาน 14 vs common 10) ทั้งที่กาชา chase legendary → payoff กาชาผิดที่
+ เพดานเกรด 5 ฝังซ้ำ 5 ไฟล์ (GRADE_MULTI_V2/COMBAT_GRADE/petGrade MAX_GRADE/petMigration scaleGrade/pvpBot)
**UX สะท้อน:** เกรดแสดง 3 ภาษา 4 หน้าจอ — ดาว★ (PetsView:43) / โรมัน "III" (PetThumb:26) / อารบิก "เกรด 3" (BattleReplay:113, Tower:81) / "เกรด III" (DetailModal:13) → นักศึกษาต้อง map เองว่าเป็นสิ่งเดียวกัน

### 2. ศักยภาพ (Potential) — ค้างครึ่งทาง + หลอกผู้ใช้ (severity สูง)
- `data/potential.js` มี 7 affix แต่ `rollAffix`/`slotsFor`/`rollCost` ไม่มี UI เรียก (guide `soon:true`)
- **6/7 affix เป็นหมัน** — engine ไม่อ่าน atk/hp/crit/critDmg/lifesteal/dodge (`resolveBattleTeam` ตัด potential ทิ้ง, `buildCombatant` รับแค่ rarity/element/grade) เหลือ `dailyCoins` ตัวเดียว
- **UX โกหก 1 จุด:** `PetsView.vue:28` hint บอก "ใส่ศักยภาพ ⚗️" แต่ DetailModal ไม่มี section (เหลือ CSS ซาก `.pd-slot`)

### 3. ซาก legacy (severity กลาง — แก้ถูกสุด)
`RARITY.dailyBase`/`GRADE_MULTI`/`GRADE_COPIES` · `BASE_STATS`/`STAT_MULTI`/`petStats()` (ตายทั้งก้อน) · ระบบไข่ (`EGG_TYPES`/`HATCH_LABELS`/`hatchMins`) · `eggs[]`/`activePet` ใน schema · `data/pets.js` shim · `instId`/`bornAt` · `teamSize:4`/`battleSlots` legacy · CSS ซาก (`.tp-grade`, `.pt-cell-grade/pot`, `.pd-slot`, `:deep(.pet-thumb)`)

### 4. Data model — denormalized identity (severity กลาง)
instance ก๊อป `name/emoji/rarity/element` จาก catalog แช่ใน doc → แก้ catalog ทีต้อง migrate ทั้งฐาน + กำกวม source of truth (battle ใช้ instance rarity ก่อน def แต่ element จาก def เสมอ) · `members.js:80` แบก `pets[]` ทุกคนเข้า cache ทั้งที่ PvP ใช้แค่ทีม 3

### 5. UX — navigation ขากลับพัง (severity สูง)
ปุ่ม "กลับ" ของ Tower/Arena/Expedition hardcode `/play` (TowerView:7, ArenaView:9, ExpeditionView:9) → เด้งข้าม PetHub · PetsView ใช้ `$router.back()` (พฤติกรรมต่างอีก) → hub 2 ชั้นมีค่าใช้จ่ายขาเข้าแต่ไม่คุ้มขากลับ · bottom-nav Play ไม่ active ตอนอยู่ /pets /tower ฯลฯ (route ลูก top-level)

### 6. UX — typography เล็กเกินอ่านบนมือถือ (severity สูง)
ข้อมูล *ตัดสินใจ* ที่ .5-.58rem (8-9px): ชื่อเพ็ท, **ATK/HP บน PetThumb** (:42), PetStatLine, ribbon ธาตุตรง (.5rem), rates กาชา · tap target < 44px: SpendCopies +/− 26px (กดรัวหลายสิบครั้ง), back 32px, info ℹ️ 20px ติดมุมการ์ด

### 7. UX — empty-state dead-end + ศัพท์ไม่ล็อก (severity กลาง-สูง)
- คลังว่าง "ไปที่ Shop..." **ไม่มีปุ่มลิงก์** (PetsView:30, TeamPicker:33) — funnel ผู้ใช้ใหม่ตัน
- Arena ไม่มี loading/empty ของพูล + ปุ่มบุก disabled แบบใบ้ (3 เหตุรวม ไม่บอก) + ไม่ guard ทีมว่าง
- ศัพท์ซ้ำซ้อน: "ทีมต่อสู้/ทีม Active/จัดทีม" · "copies" ไม่เคยแปล · "กาชา" vs "อัญเชิญ" · rarity ENGLISH ตะโกน
- evolve เผา copies+เหรียญ **ไม่มี confirm** (DetailModal:134) ขณะ Lab มี 2 จังหวะ

### 8. เอกสาร/คอมเมนต์เพี้ยนจากโค้ด
pity จริง 40/50 (schema บอก 76/100) · elementAdv 1.20/0.83 (master plan บอก 1.25/0.85) · **CLAUDE.md ยังบอก quiz cap 300/วัน** (ปลดไปแล้ว 11 ก.ค.)

---

## 🛠️ Roadmap ยกเครื่อง (เรียงตาม leverage/ความเสี่ยง)

### Phase 0 — Quick wins (เสี่ยงต่ำมาก · ไม่ migrate · ทำได้ทันที)
รวม legacy sweep (arch) + UX quick wins:
- **เผาซาก legacy ทั้งหมด** (ปัญหา 3) — ลบ dead constants/egg/shim/CSS + แก้คอมเมนต์เพี้ยน (ปัญหา 8) รวม CLAUDE.md quiz cap
- **แก้ back link 3 หน้า → `/play/pets`** + PetsView ใช้ลิงก์ชัด (ปัญหา 5)
- **empty-state ใส่ปุ่ม "ไปอัญเชิญเลย →"** 2 จุด (ปัญหา 7)
- **ลบ hint "ใส่ศักยภาพ"** จนกว่าจะมี UI จริง (ปัญหา 2)
- **a11y quick:** aria-label ปุ่มปิด/กลับที่หลุด, aria-pressed toggle, picker-cell→button
- **tap target:** SpendCopies +/− ≥40px + ปุ่ม "สูงสุด", back 40px
- **แปล rarity label เป็นไทย** (data/index.js จุดเดียว ripple ทั้งแอป)
- **toast** หลังส่งผจญภัยสำเร็จ · **confirm** ก่อน evolve

### Phase 1 — Unified power model + ภาษาภาพเดียว (เสี่ยงกลาง · migrate ศูนย์ · หัวใจ)
- `data/petPower.js` — `POWER = RARITY_BASE × GRADE_CURVE` เส้นเดียว; battle/income/expedition ต่างแค่ scale K (จูนด้วย `scripts/battle-sim.mjs` เดิม) · ถ้าต้องการ battle flat กว่า → `BATTLE_COMPRESS` exponent ตัวเดียวพร้อมเหตุผล
- เพดานเกรดเหลือ constant เดียว (แก้ปัญหาฝังซ้ำ 5 ไฟล์)
- **เกรดภาษาเดียวทุกจอ** (เลือก 1: เลขโรมัน badge) แทน ★/อารบิก/โรมันปนกัน
- **"หน้าตาทางการของ 3 แกนพลัง" ใน DetailModal** (rarity/grade/potential เป็น 3 แถวมี progress+action)

### Phase 2 — เคลียร์ศักยภาพ (เสี่ยงต่ำ-กลาง)
ตัดสินทางเดียว: (ก) ถอดทิ้งให้สะอาด (ลด AFFIXES เหลือที่ engine อ่าน) หรือ (ข) build UI ตาม spec เดิม เปิดเฉพาะ affix ที่ engine รองรับ · ทำคู่ Phase 1 (การ์ดต้องมีที่ให้ badge ศักยภาพ)

### Phase 3 — Passive system (เสี่ยงสูง · payoff จริง)
legendary/epic ได้ passive แทน stat (แก้ "rarity ไม่มีผลตอนสู้" โดยไม่ทำ snowball) — master plan §5.5 มี hook design + sim tooling แล้ว · ทำ **หลัง** Phase 1 (จูนบนเส้นพลังที่นิ่ง)

### Phase 4 — Slim data model (breaking · migrate 1 ครั้ง · Phase 0 คนน้อย=ถูกสุด)
- instance เหลือ `{id, grade, copies}(+potential)` derive ที่เหลือจาก catalog (มี precedent petMigration ครบ)
- slim members payload PvP: ส่งแค่ทีม 3 `{id,grade}[]` ไม่ใช่คลังทั้งหมด

### UX redesign ใหญ่ (ผูกกับ Phase 1 — อย่าทำก่อน power model นิ่ง)
- **PetHub → dashboard** (โชว์ตัวเลขสด: ชั้นหอคอย/แต้มประลอง/พลังทีม/ตั๋ว-pity) หรือยุบขึ้น PlayView · ถ้า Expedition rework+บอสโลก (#4 #5) เพิ่มปลายทาง → hub เริ่มคุ้ม
- **รวมการ์ดเพ็ทเป็น PetThumb ตัวเดียว + size variants** (full/compact/mini) ให้ PetsView/TeamPicker/Expedition ใช้ร่วม
- **typography pass:** ยกข้อมูลตัดสินใจเป็น ≥.68rem
- **Arena hardening:** skeleton/empty พูล + ป้ายเหตุผล disabled + guard ทีมว่าง + prop `mini` PetThumb

### ⚠️ External blocker (นอกระบบเพ็ท แต่ต้องทำก่อนจูนเพ็ทให้เห็นผล)
**cap ฟาร์ม** — ทานตะวัน ~190k/วัน (crops.js) ท่วมทุกระบบ → จูนเลขเพ็ท/หอคอยเท่าไรก็โดนกลบ (ROADMAP รู้แล้ว ยังไม่แก้)

---

## ❌ อย่าแตะ (ดีอยู่แล้ว รื้อเสี่ยงฟรี)
battleEngine loop + compute-then-replay + seeded RNG · gacha/merge pity system · `resolveBattleTeam` unit shape · expedition snapshot/seed · residence/tower ladder (เพิ่งจูน) · patchUser optimistic flow · BottomSheet + วินัย Teleport · ภาษา sticker (--pop/ink border/:active) · BattleReplay flow (ปรับได้แค่ A5 reduced-motion เลขดาเมจ แบบ additive)

## ลำดับแนะนำ
Phase 0 (quick wins, ทันที) → Phase 1 (power model + ภาษาภาพ — brainstorm ก่อน) → Phase 2 (ศักยภาพ, คู่ Phase 1) → Phase 4 (slim, ตอน Phase 0 ยังคนน้อย) → Phase 3 (passive, payoff) · UX redesign ใหญ่ผูกกับ Phase 1
