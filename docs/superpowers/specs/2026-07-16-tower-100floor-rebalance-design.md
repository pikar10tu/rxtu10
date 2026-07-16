# หอคอย 100 ชั้น — Rebalance + แถบเทียบเพื่อน (design)

วันที่: 2026-07-16 · แก้ตาม fable review + user decisions: 2026-07-17 · สถานะ: รอ user review รอบสุดท้าย

## เป้าหมาย (จาก user)

1. **ต้นเกมไหลลื่น** — เพื่อนไต่ช่วงแรกได้สนุก ไม่ชนกำแพงเร็ว
2. **มีการแข่ง/เทียบกัน** — เห็นว่าเพื่อนอยู่ชั้นไหน กระตุ้นการไต่แข่ง
3. **ปลายเกมวัดการจัดทีม** — พอเพ็ทถูกดันจนสุด (legendary เกรด V) ความชนะขึ้นกับการจัดทีม/ธาตุ ไม่ใช่พลังดิบ

> passive จะมาเป็น spec ถัดไป — ตอนนี้วางโครงทีมบอทตามธาตุแบบ**ถูกกลไก**ไว้ก่อน แล้วค่อยรื้อทีมบอทให้ลึกขึ้นตอนใส่ passive (ไม่ over-engineer element puzzle รอบนี้)

## การตัดสินหลัก (user)

- **Reset หอคอยตอน launch** (ผ่าน `AdminView.resetTower()` ที่มีอยู่ — set `towerFloor→1, towerBest→0` ทุกคน, ยืนยันแล้ว) → **ไม่มี regression, ตัด grandfather clause ทิ้งทั้งหมด** ทุกคนเริ่มชั้น 1 ใหม่
- **รายได้ idle ตันที่ชั้น 70 + เพิ่มเพดาน** (12,000 → 20,000) — climb ถึง 70 มีรางวัลจริง, ชั้น 71–100 flat = ศักดิ์ศรี/อันดับ
- **ลดเรท REFUND** ตอน migrate เพ็ท (ภาคผนวก)

## ข้อเท็จจริงทางเทคนิค (fable ยืนยันด้วยการรัน sim กับ engine จริง 2,000 seeds/เคส)

- ✅ `battleEngine.simulateBattle` รับทีมขนาดไม่เท่ากันได้จริง (map ตามความยาว, modulo cursor, `nextAttacker` ข้ามตัวตาย) — ลดจำนวนบอทได้โดยไม่แตะ engine
- ⚠️ **จำนวนตัว = HP pool คูณ ไม่ใช่ตีถี่ขึ้น** → 1 ตัว vs 2 ตัว (stat เท่ากัน) แพ้ ~100% · ดังนั้นถ้าอยาก "ก้าวแรกลุ้นชนะ" ชั้น 1 ต้องบอท **1 ตัว** (1v1 = 50%, ได้เปรียบธาตุ = 96.8%)
- ✅ RPS: `fist > scissors > paper > fist` (`index.js:18-26`, adv 1.20 / dis 0.83) · `ELS=[fist,scissors,paper]` → `ELS[k]` แพ้ทาง `ELS[(k+2)%3]`
- ⚠️ `getTowerBonus` ปัจจุบันผูก `TOWER_MAX` ในสูตร (`towerFloors.js:51-52`) → **ต้องแยกค่า bonus-cap-floor ออกจาก `TOWER_MAX`** ไม่งั้นเปลี่ยนเป็น 100 แล้วโบนัสทุกคนลดฮวบ
- ⚠️ แถบเทียบ **เพิ่ม read จริง** — TowerView ไม่เคยเรียก `loadFbUsers()` (มีแค่ Members/Arena/Admin) → cold cache = `getDocs(users)` ~150 reads (TTL cache 8 ชม.) ยอมรับได้ (โปรไฟล์เดียวกับหน้า Members)
- ✅ `towerBest` อยู่ใน members light subset (`members.js:86`) + รอด cache · ผู้เล่น 0 ตัว guard ที่ `useTower.js:43` · firestore.rules ไม่ guard tower fields (trust-based) → 100 ชั้นไม่ต้อง deploy rules

---

## 1) โครงหอคอย 100 ชั้น — 3 องก์

`TOWER_MAX: 50 → 100`

| องก์ | ชั้น | rarity บอท | เกรดบอท | บอท/ทีม | ธาตุ |
|---|---|---|---|---|---|
| **ต้น — สนุก ไหลลื่น** | 1–20 | common | 0 | ชั้น 1 = **1**, ชั้น 2 = **2**, ชั้น 3+ = 3 | ครบ 3 ธาตุ |
| **กลาง — สร้างทีม** | 21–55 | rare (21–40) → epic (41–55) | ไต่ 1→3 | 3 | ครบ 3 ธาตุ |
| **ปลายไต่สุด** | 56–69 | legendary | 3 → 4 | 3 | ครบ 3 ธาตุ |
| **ตัน — วัดการจัดทีม** | **70–100** | legendary | **V (5) ตัน** | 3 | **เอนธาตุต่างรายชั้น** |

### สูตรใน `towerFloors.js` (ทุกค่า tunable — sim-verify ตอน implement)

**จำนวนบอท/ทีม:**
```
botCount(f) = f === 1 ? 1 : f === 2 ? 2 : 3
```

**tier (rarity):**
```
common: 1–20 · rare: 21–40 · epic: 41–55 · legendary: 56–100
```

**เกรดบอท** — 0 ตลอด act ต้น (ถึงชั้น 20), แล้วไต่ 1→4 ช่วง 21–69, เป็น V ที่ชั้น 70 พอดี, คง V ถึง 100:
```
grade(f) = f <= 20 ? 0
         : f >= 70 ? 5
         : clamp(1 + floor((f - 21) / 12.25), 1, 4)
  // first-reach: g1@21 · g2@34 · g3@46 · g4@58 · g5@70 (ยืนยัน monotonic + V แตะ 70 จริง)
```
(แก้จากสูตรเดิมที่ `round()` ทำ V หลุดไปแตะชั้น 65)

**ธาตุ:**
- **ชั้น 1–69:** คงพฤติกรรมเดิม `ELS[(f + i) % 3]` = ครบ 3 ธาตุ (ธาตุหักล้าง — วัดพลัง/ดวง)
- **ชั้น 70–100: เอนธาตุให้ "เคาน์เตอร์" เป็นคำตอบจริง (fable sim-verified)** — วางสล็อตให้ผู้เล่นที่พาธาตุ**ที่ชนะทาง theme** (= `ELS[(theme+2)%3]`) กวาดได้ ~98% ส่วนคนก๊อปธาตุ theme แพย่ · **หมุน pattern ต่างรายชั้น** (สลับ theme ต่อชั้น + สลับสัดส่วน 2:1 / composition) ให้แต่ละชั้นเป็นโจทย์ต่างกันจริง ไม่ใช่สูตรตายตัว 3 แบบวน — **แพทเทิร์นสุดท้าย sim-verify ตอน implement** (เป้า: counter คือคำตอบ, ต่างพอไม่รู้สึกซ้ำ)
  > ⚠️ อย่าใช้ off-slot = `ELS[(f+1)%3]` (ตัวที่ theme ชนะ) — ทำให้ "ก๊อปธาตุบอท" ชนะแทนเคาน์เตอร์ (bug เดิมในดraft)

### จุดตัน = ชั้น 70
legendary เกรด V ครบที่ชั้น 70 → ชั้น 70–100 (31 ชั้น) พลังบอทตัน ต่างแค่ธาตุ = สนามวัดการจัดทีมล้วน (ความลึกเต็มมากับ passive spec ถัดไป)

---

## 2) รางวัล idle — cap 70, เพดานใหม่ 20,000 (ไม่มี grandfather)

`getTowerBonus(bestFloor)` — **แยก cap-floor ออกจาก `TOWER_MAX`:**
```
BONUS_CAP_FLOOR = 70        // ← ค่าคงที่ใหม่ ไม่ผูก TOWER_MAX
TOWER_BONUS_MIN = 50        // ชั้น 1
TOWER_BONUS_MAX = 20000     // ← เพิ่มจาก 12000 (ตันที่ชั้น 70)
TOWER_BONUS_POW = 1.7       // คงเดิม (เร่งช่วงท้าย)

t = clamp((min(best, 70) - 1) / (70 - 1), 0, 1) ^ 1.7
bonus = round((MIN + (MAX - MIN) * t) / 5) * 5
  // ชั้น 1 = 50 · ชั้น 70 = 20,000 · ชั้น 71–100 = 20,000 (flat, min(best,70))
```
- **ไม่มี grandfather** (reset ตอน launch → ทุกคนเริ่มใหม่ ไม่มี regression)
- **Economy note:** เพดาน idle จากหอคอย 12k→20k · gate หลังชั้น 70 (ต้องมี 3 legendary V — ยากมาก) → เป็นเป้าปลายทาง ไม่เฟ้อช่วงต้น · เทียบ farm ทานตะวัน ~190k/วัน ยังจิ๊บ (ดู [[economy_battle_master_plan]])

**Milestones (หมุด 🪙 บนแถบไต่) — เฉพาะชั้นที่โบนัสยังขึ้น (≤70):**
```
TOWER_BONUS_FLOORS: [20, 40, 60, 70]
```
(ไม่ใส่ 80/100 เพราะโบนัส flat แล้ว = เหรียญปลอม — ชั้น 80/100 แสดงเป็น landmark อันดับได้แต่ไม่มีไอคอนเหรียญ)

**Zones (5 โซน) เลื่อนตาม threshold + เพิ่มโซนช่วงตัน:**
```
ลานประลอง   (common)          1–20
หอเวทเก่า    (rare)            21–40
ปราการอสูร   (epic)            41–55
ยอดหอคอยมังกร (legendary ไต่)   56–69
บัลลังก์ราชันย์ (ตัน V, วัดฝีมือ) 70–100   ← art/สีใหม่ (ชื่อปรับได้)
```

---

## 3) แถบเทียบเพื่อน

การ์ดเล็กบนหน้า `TowerView.vue`:
- **top 3** เพื่อนที่ `towerBest` สูงสุด (ชื่อเล่น + ชั้น)
- **"คุณอันดับ X / Y"**
- **ลูกเล่นกระตุ้น:** เพื่อนอันดับเหนือเราติดกันนำอยู่ N ชั้น → "ตามหลัง [ชื่อ] อยู่ N ชั้น!"

**ที่มา:** `members` store (`fbUsers`) คำนวณ ranking ฝั่ง client
**Impl notes (fable):**
- TowerView ต้องเรียก `loadFbUsers()` เอง (ไม่เคยโหลด) → cold cache ~150 reads (ยอมรับ, โปรไฟล์เดียวกับ Members) · hydrate จาก cache ถ้ามี · ไม่มีข้อมูล → ซ่อนแถบ (best-effort ไม่ขวางการเล่น)
- **merge `towerBest` สดจาก `auth.userData` ทับแถวตัวเอง** ก่อนจัดอันดับ — ไม่งั้นไต่เสร็จหมาดๆ อันดับตัวเอง stale ได้ถึง 8 ชม.

---

## 4) UI/UX polish (Fable นำดีไซน์)

ยกหน้า `TowerView.vue` ให้ดูดีขึ้น คู่กับของใหม่ (100 ชั้น, โซนที่ 5, แถบเทียบ):
- **แถบไต่ชั้น** — ตอนนี้โชว์แค่ window 6 ชั้น บนหอ 100 ชั้นจะรู้สึกจิ๊บ · อยากได้ progress ที่สื่อ "ไต่ไกลแค่ไหนใน 100 ชั้น" + หมุดโซน/milestone อ่านง่าย
- **การ์ดชั้นปัจจุบัน** — โซนที่ 5 "บัลลังก์ราชันย์" (70–100) ต้องมี art/สีที่รู้สึก "ถึงสนามวัดฝีมือ" ต่างจาก 4 โซนเดิมชัด · ช่วงตันควรมี cue ว่า "พลังบอทตันแล้ว วัดกันที่ธาตุ/ทีม"
- **แถบเทียบเพื่อน** — layout top 3 + อันดับตัวเอง + hook "ตามหลัง X" ให้กระตุ้นการแข่ง ไม่รก
- คุม a11y/tap target (≥44px) + Teleport rule (CLAUDE.md ข้อ 6) ตามมาตรฐานโปรเจกต์

Fable ออกแบบ direction (typography/สี/layout) → ส่ง spec ย่อยให้ execute · ยึด frontend-design + voice-guide

---

## 5) เทส & ผลกระทบ

อัปเดต `towerFloors.test.js`:
- team length: ชั้น 1 → 1 · ชั้น 2 → 2 · ชั้น 3+ → 3 (แก้ assertion เดิมที่ pin = 3) + **แก้บั๊กเดิม `avg` หาร 4 → หาร 3** (`test.js:15`)
- เกรดยัง monotonic · **เกรด V first-reach ที่ชั้น 70** (ไม่ใช่ 65) · คง V ถึง 100
- `getTowerBonus`: ชั้น 1=50 · ชั้น 70=20000 · ชั้น 100=20000 · **strictly-increasing loop เปลี่ยน scope 1..70** (แล้ว flat 70..100 — invariant เดิม 1..TOWER_MAX จะ fail)
- `floorZone`: 5 โซนใหม่
- ธาตุชั้น 70+: composition เอน (deterministic + counter ชนะ + ไม่ใช่ครบ 3 ธาตุ)

อัปเดต `petMigration.test.js` (มีจริง — pin เลข 500/2500 ที่ `:33,39`)

ไม่แตะ: `battleEngine` loop · gacha/merge · resolveBattleTeam · Teleport wrappers
เช็ก: `TowerView.climbFloors` (รอด 100 ชั้นแล้ว) · banner "พิชิตครบ" (`:65`) จะหายจากคนเคลียร์ 50 เดิม (intended — reset launch อยู่แล้ว)

---

## ภาคผนวก: ลดเรท REFUND ตอน migrate เพ็ท

**ปัญหา:** `petMigration.js` คืนเหรียญเพ็ทเก่าที่ถูกถอด/nerf rarity — เหลือ 1–2 คนยัง `petsMigratedV2=false` ถือ legendary หลายตัว → login ครั้งหน้าได้เงินก้อนโต (5 legendary = 125,000+) เสียบรรยากาศ leaderboard

**แก้ (user เลือก ลดเรท):** กระทบเฉพาะคนยังไม่ migrate (คนเก่าได้ค่าเดิมไปแล้ว, gated `petsMigratedV2` one-time — `auth.js:141`, ไม่ย้อนหลัง)
```
REFUND: { common: 500→200, rare: 2500→1000, epic: 8000→3000, legendary: 25000→8000 }
```
→ 5 legendary โดนถอด: 125,000 → ~40,000
> fable note: ลดเรทกระทบ "ส่วนต่าง nerf rarity" ด้วย (ตัวที่ยังอยู่แต่โดนลด rarity ได้ชดเชยน้อยลง) — ถ้าอยากตรงเป้ากว่าอาจ `cap ยอดรวม` แทน แต่เหลือ 1–2 คน ผลจริงเท่ากัน → คงตามที่เลือก

---

## Resolved (จาก fable review)
- ~~grandfather clause~~ → ตัดทิ้ง (reset ตอน launch)
- ~~new bonus curve ซ้อน legacy~~ → เส้นเดียว cap 70, MAX 20000
- ~~เกรด V ที่ 65~~ → สูตรใหม่ V แตะ 70 จริง
- ~~element ก๊อปธาตุชนะ~~ → off-slot = counter, sim-verify + หมุนรายชั้น
- ~~"ไม่เพิ่ม read"~~ → เขียนตามจริง (~150 reads cold)
- ~~milestones 80/100~~ → หมุดเหรียญถึงแค่ 70
