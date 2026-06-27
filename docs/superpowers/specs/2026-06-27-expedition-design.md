# Expedition (ส่งผจญภัย) — Design Spec

**วันที่:** 2026-06-27
**สถานะ:** อนุมัติดีไซน์แล้ว → รอเขียน implementation plan
**ที่มา:** master plan `docs/economy-battle-master-plan.md` §5.8 (build order #4) — ปรับขอบเขตจากที่ user เคาะในการ brainstorm

---

## 1. เป้าหมาย / Why

ส่งเพ็ท **ที่ไม่ได้อยู่ในทีมต่อสู้** ออก "ผจญภัย" แบบจับเวลา → ครบเวลากดเก็บรางวัล → ลูปเช็กอินรายวัน

แก้ปัญหาหลัก: **"มีเพ็ท ~27 ตัว แต่ใช้จริงแค่ 4"** → ทำให้เพ็ทบนม้านั่งมีงาน = ให้คุณค่าการสะสม/กาชา และสร้างเหตุผลให้ผู้เล่นกลับมาเปิดแอปทุกวัน

หลักการคุม: **เป็นระบบ idle/สะสม ไม่มี combat ใหม่** (timer + reward table) — "ทำง่าย คุ้มสุด" ในกลุ่มฟีเจอร์ social/idle

---

## 2. แก่นเกมเพลย์

- **1 สายต่อครั้ง** (single active expedition) — ต้องรอชุดเดิมกลับ + กดเก็บ ก่อนส่งใหม่ ⇒ ตรงกับโจทย์ "รอชุดเก่ากลับมาก่อน" และง่ายทั้งโค้ด+UI
- **3 ตัว/สาย** — ส่งได้เฉพาะเพ็ทที่ **ไม่ได้อยู่ใน `activePets` (ทีมต่อสู้ 4 ช่อง)** เพื่อบังคับให้ใช้ม้านั่ง (= เป้าหมายหลักของฟีเจอร์)
- **ล็อกระหว่างไป** — เพ็ทที่กำลังผจญภัย: เอาเข้าทีม/ขาย/หลอมรวม (fusion)/ส่งซ้ำ ไม่ได้ จนกว่าจะกลับ ⇒ สร้าง tradeoff "ใช้สู้ vs ส่งผจญภัย"
- **เลือกมิชชัน + ระยะเวลาเอง** ก่อนส่ง

### Lifecycle (state ของ `user.expedition`)
```
idle (null) → [กดส่ง] → active (now < endsAt) → ready (now ≥ endsAt) → [กดเก็บ] → idle
```

---

## 3. มิชชัน + ระยะเวลา

### มิชชัน (`data/expeditions.js`)
- รายการ **คงที่** (v1, ไม่หมุนเวียน) อย่างน้อย 3 อัน — ครอบทั้ง 3 ธาตุ เพื่อให้ผู้เล่นเลือก element-match ได้เสมอ
- แต่ละมิชชัน: `{ id, name, element('fist'|'scissors'|'paper'), emoji, flavor }`
- *(future: หมุนเวียนมิชชันรายวัน / มิชชัน rarity-gated — out of scope v1)*

### ระยะเวลา (3 ระดับ ผู้เล่นเลือก)
| id | label | ชั่วโมง | รางวัลฐาน | โอกาสตั๋วฐาน |
|----|-------|---------|-----------|--------------|
| `short`  | สั้น | 1 | น้อย | ต่ำ |
| `medium` | กลาง | 4 | กลาง | กลาง |
| `long`   | ยาว | 8 | มาก | สูง |

> ยาว = คุ้มกว่าต่อรอบ แต่รอนาน (เลือกระหว่าง throughput กับ idle) · **ตัวเลขจริงทั้งหมด tunable → ขอ number pass + sim ก่อนเปิด** (ดู §8)

---

## 4. สูตรรางวัล (pure, deterministic, extensible)

คิดตอน **"กดเก็บ" (claim)** เท่านั้น — ผลคงที่ต่อรอบ (กัน reroll)

### อินพุต
- `party` = เพ็ท 3 ตัว (rarity, grade, element)
- `mission.element`
- `duration` (short/medium/long)
- `seed` = hash จาก `petIds + startedAt + missionId + durationId` (deterministic → re-claim ได้ผลเดิม; กัน client สุ่มใหม่)

### ตัวกลาง
- **partyPower** = Σ ของ 3 ตัว ของ `RARITY_WEIGHT[rarity] × (1 + grade × GRADE_K)`
  - `RARITY_WEIGHT = { common:1, rare:2, epic:4, legendary:7 }` *(tunable)*
- **elementMatch** = จำนวนตัว (0–3) ที่ `element === mission.element`
- **elementBonus** = `elementMatch × ELEMENT_K` *(เช่น 0.15 → ครบ 3 ตัว = +45%)*

### เอาต์พุต = `resolveRewards(...)` → array ของ `{ type, amount }`
1. **เหรียญ** — `round( baseCoins[duration] × (1 + partyPower × POWER_K) × (1 + elementBonus) )` clamp ≤ `coinCap[duration]`
2. **ตั๋วกาชา** — `chance = min(CHANCE_MAX, ticketChanceBase[duration] + partyPower × TICKET_POWER_K + elementBonus × TICKET_EL_K)` → สุ่ม 1 ครั้งด้วย seed → ได้ 0 หรือ 1 ตั๋ว

### Extensible reward table (เผื่ออนาคต)
- `resolveRewards` คืน **array ของรายการรางวัล** — เพิ่มชนิดใหม่ (shard / ตั๋วบอส / token ทัวร์ / cosmetic) = เพิ่ม entry + handler โดยไม่แก้ engine
- มี registry `REWARD_TYPES = { coins:{label,emoji,grant}, gachaTicket:{...}, ... }` — `grant` map รางวัล→field ที่จะ `increment` ผ่าน `patchUser`
- v1 มีแค่ `coins` + `gachaTicket` (สองชนิดที่ระบบรองรับจริงตอนนี้: `coins`, `freeGachaTickets`)

---

## 5. คุมเงินเฟ้อ

- **ไม่ต้องมี daily coin cap แยก** — "1 สายต่อครั้ง + ต้องรอครบเวลา" จำกัดเหรียญ/วันโดยธรรมชาติ (ยาวสุด 8 ชม. ⇒ ~3 รอบ/วัน; ถ้าเล่นสั้นรัวก็ได้น้อยต่อรอบ)
- เหรียญต่อรอบตั้งให้ **ไม่ทับ/ไม่เกินรายได้บ้าน+ฟาร์ม** — ปรับใน sim ร่วมกับงาน economy cap (ดู [[economy-battle-master-plan]])
- ตั๋วกาชาเป็น sink-feeder (มีค่า: welcome gift = 50 ตั๋ว) — โอกาสต่อรอบต่ำพอไม่ให้กาชาเฟ้อ

---

## 6. ข้อมูล + ความปลอดภัย

**ยึดแพทเทิร์นเดิมทั้งหมด — ต้นทุน Firestore ~0:**
- เพิ่ม `user.expedition = { petIds:[3], missionId, durationId, startedAt, endsAt, claimed:false } | null` ใน `userSchema.js` (default `null`) + normalize (เป็น object หรือ null)
- เขียนทุกอย่างผ่าน `auth.patchUser(optimistic, server)` — **doc ตัวเองล้วน ไม่มี cross-user write**
- **ไม่มี collection ใหม่ · ไม่แตะ firestore.rules**
- `data/expeditions.js` = มิชชัน + durations + ค่าคงที่สูตร (tunable ที่เดียว)
- seed-based RNG (แนวเดียว `utils/pvpBot.js` / `gacha.js` ฉีด rng) — สอดคล้อง trust model เดิมของแอป (เท่ากับ towerBest/quizHigh: client แก้ได้ในทางทฤษฎี แต่ไม่ใช่ช่องใหม่)

### ผลกระทบข้ามระบบ (lock)
- **TeamPicker** ต้องกัน/disable เพ็ทที่ `expedition.petIds` (เอาเข้าทีมไม่ได้ระหว่างผจญภัย)
- **PetsView / ขาย / fusion** ต้อง disable เพ็ทที่กำลังผจญภัย + โชว์ป้าย "กำลังผจญภัย"
- ตัวเลือกส่งสาย: pool = เพ็ทที่ owns และ **ไม่อยู่ใน activePets** (และไม่มี expedition active อยู่)

---

## 7. UI

### 7.1 หน้าใหม่ + route
- `src/views/ExpeditionView.vue` + route `/expedition` (lazy, สไตล์เดียวกับ sibling)
- เนื้อหา 3 สถานะ:
  - **idle:** เลือกมิชชัน (โชว์ธาตุ) → เลือก 3 ตัว (จากม้านั่ง, โชว์ธาตุ/คุณภาพ + ไฮไลต์ตัว element-match) → เลือกระยะเวลา (โชว์รางวัลคาดหวังคร่าวๆ) → ปุ่มส่ง
  - **active:** การ์ดสายที่ส่งไป + countdown ถึง `endsAt` (ยกเลิกได้ไหม? เสนอ: ยกเลิกไม่ได้ใน v1 กันเล่นรอบสั้นรัว)
  - **ready:** ปุ่ม "เก็บรางวัล" → โชว์สรุปรางวัล (เหรียญ + ตั๋ว ถ้าได้) → กลับ idle
- reuse `Emoji`, `PetThumb`, แพทเทิร์น sheet/การ์ดเดิม · scoped style · ธีม indigo

### 7.2 จุดเข้า
- **การ์ดใน Play** ใต้หัวข้อ "เพ็ท & สะสม" (ดู §7.3) — badge บอกสถานะ (ว่าง/กำลังไป Xh/กลับมาแล้ว!)
- **การ์ดบน Home** เด้งเตือนเมื่อ **ready** ("คณะสำรวจกลับมาแล้ว — กดเก็บ") — reuse แพทเทิร์น DailyCard/DailyQuestCard

### 7.3 จัดหัวข้อ Play ใหม่ (Option A — อนุมัติแล้ว)

แทนโครงเดิม (สวน&สัตว์ / ร้านค้า / สนามประลอง) เป็น:

| หัวข้อ | การ์ด |
|--------|-------|
| 🐾 **เพ็ท & สะสม** | สัตว์เลี้ยง (`/pets`) · ฟาร์ม (modal) · **ส่งผจญภัย** (`/expedition`) |
| ⚔️ **ประลอง** | ปีนหอคอย (`/tower`) · สนามประลอง (`/arena`) · บอสรวมรุ่น *(SoonCard)* |
| 🛒 **ร้านค้า** | ร้านค้า (`/shop` — อัญเชิญ + ห้องทดลอง) |
| 🎮 **มินิเกม** *(soon)* | เภสัช Crush *(SoonCard)* |

การเปลี่ยนแปลงใน `PlayView.vue`:
- ย้าย "สัตว์เลี้ยง" + "ฟาร์ม" → หัวข้อ "เพ็ท & สะสม" + เพิ่มการ์ด "ส่งผจญภัย"
- เปลี่ยนหัวข้อ "สนามประลอง" → "ประลอง" (เพราะมีหอคอยด้วย) · เปลี่ยน SoonCard "ผจญภัย Co-op" → **"บอสรวมรุ่น"** (กันสับสนกับ Expedition)
- ย้าย SoonCard "เภสัช Crush" ออกไปหัวข้อ "มินิเกม" แยก

### 7.4 Gating
- **เปิดเลย ไม่มี Admin toggle** — ไม่ใช่ระบบแข่งขัน (ต่างจาก PvP) ⇒ ไม่ต้องแตะ `config/app`

---

## 8. สิ่งที่ต้องเคาะตัวเลข (number pass ก่อนเปิด — แยกจากการ build โครง)

ค่าคงที่ทั้งหมดใน `data/expeditions.js` เป็น **draft pin** ต้องจูน + sim:
- `baseCoins` / `coinCap` ต่อ duration (เทียบรายได้บ้าน+ฟาร์ม/วัน — อย่าทับ)
- `RARITY_WEIGHT`, `GRADE_K`, `POWER_K`, `ELEMENT_K`
- `ticketChanceBase`, `TICKET_POWER_K`, `TICKET_EL_K`, `CHANCE_MAX`
- ชั่วโมง 1/4/8 (ปรับได้ตาม feedback)

> เสนอ: ทำ sim script เล็ก (แนว `scripts/battle-sim.mjs`) คำนวณเหรียญ/ตั๋วคาดหวังต่อวันที่ party คุณภาพต่างๆ เพื่อ sanity ก่อนเปิด

---

## 9. Out of scope (v1)

- รางวัลชนิดอื่นนอก coins/ตั๋วกาชา (shard/ตั๋วบอส/token/cosmetic) — โครง reward table รองรับแล้ว แต่ระบบปลายทางยังไม่มี
- หลาย slot พร้อมกัน (ปลดตาม residence) — master plan เสนอไว้ แต่ v1 เอา 1 สายก่อน
- หมุนเวียนมิชชันรายวัน / มิชชัน rarity-gated
- ยกเลิกสายกลางคัน (cancel) — v1 ส่งแล้วรอครบ
- World Boss co-op ("บอสรวมรุ่น") — คนละฟีเจอร์ (master plan #5)

---

## 10. โครงไฟล์ (คาดการณ์ — รายละเอียดอยู่ใน plan)

- **สร้าง:** `data/expeditions.js` · `utils/expedition.js` (+`.test.js`) · `composables/useExpedition.js` · `views/ExpeditionView.vue` · (อาจ) `components/home/ExpeditionCard.vue`
- **แก้:** `data/userSchema.js` (field + normalize) · `router/index.js` (route) · `views/PlayView.vue` (IA Option A + การ์ด) · `components/battle/TeamPicker.vue` (กันเพ็ทล็อก) · `views/PetsView.vue` (ป้าย/disable ขาย-fusion) · `views/HomeView.vue` (การ์ด ready)

---

## 11. Constraints (ยึดตาม CLAUDE.md + แพทเทิร์นโปรเจกต์)

- เขียน user doc ผ่าน `auth.patchUser` เท่านั้น · ไม่มี collection ใหม่ · ไม่แตะ rules
- pure util มี `.test.js` (`node --test`) · ตรวจรวม `npm run build`
- single-file component + scoped style · ธีม indigo · คอมเมนต์/commit ไทยปนอังกฤษ · commit `Area: อะไร (ทำไม)`
- ค่าคงที่เกมรวมที่ `data/expeditions.js` (ปรับเลขที่เดียว)
