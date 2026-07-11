# P1 — Unified Pet Power Model + Roman Grade Visual — Design

วันที่: 2026-07-12 · เฟส P1 ของ [ยกเครื่องระบบเพ็ท](../../pet-system-overhaul-audit-2026-07-12.md)
สถานะ: อนุมัติดีไซน์แล้ว (user เคาะ: goal A gameplay-neutral · เกรด = เลขโรมัน badge · Part3 ศักยภาพโชว์ "เร็วๆ นี้" · Part1 re-export back-compat)

## เป้าหมาย
รวม "แหล่งพลังเพ็ท" ให้เป็นที่เดียว + ใช้ภาษาภาพเกรดเดียว (เลขโรมัน) ทุกจอ + จัดหน้า 3 แกนพลังใน DetailModal
— **gameplay-neutral: เลขทุกตัวเท่าเดิมเป๊ะ ไม่เปลี่ยน balance · migration ศูนย์** · rarity-มีผลตอนสู้ไว้ P3 (passive)

## หลักการ (ยึดตลอด)
- **ไม่แตะ:** battleEngine loop · gacha/merge · `resolveBattleTeam` shape · residence/tower ladder · engine simulate
- **เลขเท่าเดิม:** ทุกค่าย้ายมาแบบ verbatim — `petPower.test.js` ต้องยืนยันผลลัพธ์ตรงกับสูตรเดิมทุก rarity×grade
- **เทสเดิมไม่พัง:** battle.js/petUtils.js/expeditions.js **re-export** จาก petPower → `battle.test.js`/`petUtils.test.js`/`expeditions.test.js` (ที่ import ค่าเดิม) ยังผ่านโดยไม่แก้

---

## Part 1 — `data/petPower.js` (แหล่งพลังเดียว)

สร้าง `src/data/petPower.js` เป็นเจ้าของค่าพลังทั้งหมด (ย้ายจาก 3 ไฟล์ verbatim):

```js
export const MAX_GRADE = 5                                   // เพดานเกรด — จุดเดียว
export const RARITY_ORDER = ['common', 'rare', 'epic', 'legendary']
export const clampGrade = (g) => Math.min(MAX_GRADE, Math.max(0, g || 0))

// ── income (ย้ายจาก petUtils.js — เท่าเดิม) ──
export const RARITY_DAILY_BASE = { common: 15, rare: 38, epic: 85, legendary: 175 }
export const GRADE_MULTI_V2 = [1.0, 2.0, 3.5, 5.5, 8.0, 12.0]

// ── combat (ย้ายจาก battle.js — เท่าเดิม) ──
export const COMBAT_BASE = { common:{atk:10,hp:50}, rare:{atk:11,hp:56}, epic:{atk:13,hp:63}, legendary:{atk:14,hp:70} }
export const COMBAT_GRADE = [1.0, 1.15, 1.32, 1.52, 1.74, 2.0]
export const ELEMENT_BIAS = { fist:{atk:1.2,hp:0.85}, scissors:{atk:1.0,hp:1.0}, paper:{atk:0.85,hp:1.2} }

// ── expedition (ย้ายจาก expeditions.js — เท่าเดิม) ──
export const RARITY_WEIGHT = { common:1, rare:2, epic:4, legendary:7 }
export const EXP_GRADE_K = 0.15

// accessor เดียวให้ consumer เรียก (ตรรกะ = ของเดิมเป๊ะ)
export function combatStats(pet) { /* = buildCombatant เดิม */ }
export function petDailyCoins(pet) { /* = petDailyCoins เดิม รวม potential dailyCoins% */ }
export function expWeight(pet) { /* = RARITY_WEIGHT[r] * (1 + EXP_GRADE_K * clampGrade(g)) */ }
```

**Back-compat (เลี่ยงแก้ consumer/เทส):**
- `battle.js`: ลบ COMBAT_BASE/COMBAT_GRADE/ELEMENT_BIAS local → `import ... from './petPower.js'` แล้ว `buildCombatant` เรียก `combatStats` (หรือ re-export) · `BATTLE_CFG`/`elementMult` คงเดิม
- `petUtils.js`: re-export `RARITY_DAILY_BASE`/`GRADE_MULTI_V2`/`petDailyCoins`/`totalPetDaily` (totalPetDaily คงอยู่ที่ petUtils — เรียก petDailyCoins จาก petPower)
- `expeditions.js`: re-export `RARITY_WEIGHT`/`GRADE_K`(=EXP_GRADE_K) · utils/expedition.js partyPower เรียก `expWeight`
- **MAX_GRADE จุดเดียว:** อัปเดต `petGrade.js`/`petMigration.js`/`pvpBot.js` (ที่ hardcode 5/ความยาว array) ให้ import `MAX_GRADE`/`clampGrade` จาก petPower

**เทส `petPower.test.js`:** ยืนยัน combatStats/petDailyCoins/expWeight คืนค่าตรงกับสูตรเดิม (สุ่ม rarity×grade ครบ + เทียบเลข hardcoded ที่คำนวณมือ เช่น legendary g5 combat atk = 14×2.0×1.2(fist)=33.6, income = 175×12=2100, expWeight = 7×(1+0.15×5)=12.25)

## Part 2 — เกรดภาษาเดียว (เลขโรมัน) ทุกจอ

`GRADE_LABELS = ['','I','II','III','IV','V']` (Roman) มีใน data/index.js อยู่แล้ว — helper `gradeLabel(g) = GRADE_LABELS[clampGrade(g)]` (วางใน petPower หรือใช้ GRADE_LABELS ตรง)
แก้จุดที่ยังปน:
- **PetsView grid** `'★'.repeat(grade)` → badge โรมันมุมการ์ด (ใช้ `.pt-cell-grade`-style ใหม่ — ตัวเก่าลบไปแล้ว P0, สร้าง badge ใหม่)
- **BattleReplay inspect** `เกรด ${grade}` (อารบิก) → `เกรด ${GRADE_LABELS[g]}`
- **TowerView scout** `เกรด ${grade}` → โรมัน
- **PetsView ⭐ "อยู่ในทีม"** → badge ข้อความ "ทีม" สี primary (กันสับสนดาว 2 ความหมาย — เดิม ⭐ทีม + ★เกรด)
- PetThumb/DetailModal: โรมันอยู่แล้ว ✓ (ไม่แตะ)

## Part 3 — DetailModal "3 แกนพลังหน้าตาทางการ"

พาเนล 3 แถวชัดเจน (แทนการโชว์กระจัดกระจายเดิม):
- **ความหายาก:** pill สี `RARITY[r].color` + label ไทย (ตำนาน/เอพิค/หายาก/ธรรมดา — P0 แปลแล้ว)
- **เกรด:** โรมัน I–V + ปุ่ม "วิวัฒน์ → IV" (มี progress copies เดิม + confirm P0)
- **ศักยภาพ:** แถว "🔒 เร็วๆ นี้" (ซื่อสัตย์ — ยังไม่เปิดจน P2) เว้นที่ badge ม่วงไว้

---

## ไฟล์ที่แตะ
- Create: `src/data/petPower.js` + `src/utils/petPower.test.js`
- Modify: `src/data/battle.js`, `src/utils/petUtils.js`, `src/data/expeditions.js`, `src/utils/expedition.js` (re-export/เรียก accessor) · `src/utils/petGrade.js`, `src/utils/petMigration.js`, `src/utils/pvpBot.js` (MAX_GRADE) · `src/views/PetsView.vue`, `src/components/battle/BattleReplay.vue`, `src/views/TowerView.vue` (Roman visual) · `src/components/pets/PetDetailModal.vue` (3-axes panel)

## Verification
- `node --test src/utils/petPower.test.js` ผ่าน (เลขตรงของเดิม)
- **เทสเดิมทั้งหมดผ่านโดยไม่แก้** (battle/petUtils/expeditions/petGrade/petMigration/battleStats) — พิสูจน์ gameplay-neutral
- `npm run build` ผ่าน · ทดลอง dev: เกรดโรมันทุกจอ · DetailModal 3 แถว · เลข income/combat/expedition ไม่เปลี่ยน

## นอกขอบเขต (ยกไปเฟสอื่น)
- rarity-มีผลตอนสู้ (steeper) → **P3 passive** (ไม่ใช่ P1)
- potential UI จริง → **P2**
- slim data model → **P4**
- รวมการ์ดเพ็ท PetThumb size-variants + typography pass → UX redesign (ผูก P1 แต่แยก task ถ้าใหญ่)
