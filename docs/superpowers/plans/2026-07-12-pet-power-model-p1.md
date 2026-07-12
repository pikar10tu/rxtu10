# P1 — Unified Pet Power Model + Roman Grade Visual — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** รวมค่าพลังเพ็ท (income/combat/expedition) ให้เป็นแหล่งเดียว `data/petPower.js` + ใช้เกรดภาษาเดียว (เลขโรมัน) ทุกจอ + จัดหน้า 3 แกนพลังใน DetailModal — **gameplay-neutral: เลขเท่าเดิมเป๊ะ migration ศูนย์**

**Architecture:** petPower.js เป็นเจ้าของตารางพลัง + MAX_GRADE + accessor (`combatStats`/`petDailyCoins`/`expWeight`). ไฟล์เดิม (battle/petUtils/expeditions/expedition/petGrade) re-export หรือเรียก accessor → **เทสเดิมทั้งหมดต้องผ่านโดยไม่แก้** = พิสูจน์ว่าเลขไม่เปลี่ยน. ส่วน UI แก้ภาษาภาพเกรดเป็นโรมัน + DetailModal panel.

**Tech Stack:** Vue 3 SFC + scoped style, pure JS utils, `node --test`.

## Global Constraints
- **ไม่แตะ:** battleEngine loop · gacha/merge · `resolveBattleTeam` shape · residence/tower ladder · engine simulate
- **เลขเท่าเดิมเป๊ะ** — ค่าย้ายแบบ verbatim · `petPower.test.js` ยืนยัน + เทสเดิมทั้งหมดผ่านไม่แก้
- **expWeight ไม่ clamp grade** (match `partyPower` เดิม: `w * (1 + (grade||0) * GRADE_K)`) · combat/income clamp ที่ MAX_GRADE=5 (= array length-1 เดิม)
- เกรดโชว์ = `GRADE_LABELS = ['','I','II','III','IV','V']` (มีใน data/index.js) โรมันทุกจอ
- commit `Area: อะไร (ทำไม)` ไทยปนอังกฤษ · รัน `node --test` + `npm run build`

---

### Task 1: `data/petPower.js` + test (แหล่งพลังเดียว, TDD)

**Files:**
- Create: `src/data/petPower.js`, `src/utils/petPower.test.js`

**Interfaces:**
- Produces: `MAX_GRADE`, `RARITY_ORDER`, `clampGrade(g)`, tables (`RARITY_DAILY_BASE`,`GRADE_MULTI_V2`,`COMBAT_BASE`,`COMBAT_GRADE`,`ELEMENT_BIAS`,`RARITY_WEIGHT`,`EXP_GRADE_K`), และ accessor `combatStats(pet)→{id,element,atk,maxHp,hp}` · `petDailyCoins(pet)→number` · `expWeight(pet)→number`

- [ ] **Step 1: เขียนเทส (เลขต้องตรงสูตรเดิม)**

```js
// src/utils/petPower.test.js — รัน: node --test src/utils/petPower.test.js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { combatStats, petDailyCoins, expWeight, clampGrade, MAX_GRADE } from '../data/petPower.js'

test('MAX_GRADE = 5', () => { assert.equal(MAX_GRADE, 5) })
test('clampGrade: คลุม 0..5', () => {
  assert.equal(clampGrade(-2), 0); assert.equal(clampGrade(9), 5); assert.equal(clampGrade(3), 3)
})

test('combatStats: legendary/fist g5 = 14×2.0×1.2 atk, 70×2.0×0.85 hp', () => {
  const c = combatStats({ id: 'x', rarity: 'legendary', element: 'fist', grade: 5 })
  assert.ok(Math.abs(c.atk - 33.6) < 1e-9)      // 14×2.0×1.2
  assert.ok(Math.abs(c.maxHp - 119) < 1e-9)     // 70×2.0×0.85
  assert.equal(c.hp, c.maxHp)
})
test('combatStats: common/scissors g0 = ฐานเป๊ะ', () => {
  const c = combatStats({ rarity: 'common', element: 'scissors', grade: 0 })
  assert.equal(c.atk, 10); assert.equal(c.maxHp, 50)
})
test('combatStats: rarity/element ผิด → default common/scissors', () => {
  const c = combatStats({ rarity: 'xxx', element: 'yyy', grade: 0 })
  assert.equal(c.atk, 10); assert.equal(c.maxHp, 50); assert.equal(c.element, 'scissors')
})

test('petDailyCoins: legendary g5 = 175×12 = 2100', () => {
  assert.equal(petDailyCoins({ rarity: 'legendary', grade: 5 }), 2100)
})
test('petDailyCoins: common g0 = 15', () => {
  assert.equal(petDailyCoins({ rarity: 'common', grade: 0 }), 15)
})
test('petDailyCoins: potential dailyCoins% เพิ่มตามเดิม', () => {
  // 85×3.5 = 297.5 → ×1.10 = 327.25 → round 327
  assert.equal(petDailyCoins({ rarity: 'epic', grade: 2, potential: [{ stat: 'dailyCoins', value: 10 }] }), 327)
})
test('petDailyCoins: null → 0', () => { assert.equal(petDailyCoins(null), 0) })

test('expWeight: legendary g5 = 7×(1+0.15×5) = 12.25 (ไม่ clamp)', () => {
  assert.ok(Math.abs(expWeight({ rarity: 'legendary', grade: 5 }) - 12.25) < 1e-9)
})
test('expWeight: common g0 = 1', () => { assert.equal(expWeight({ rarity: 'common', grade: 0 }), 1) })
```

- [ ] **Step 2: รันเทส → fail** (`node --test src/utils/petPower.test.js` → module not found)

- [ ] **Step 3: เขียน `src/data/petPower.js`** (ตรรกะ = ของเดิมเป๊ะ)

```js
// ════════════════════════════════════════════════════════════
//  petPower — แหล่งพลังเพ็ทเดียว (income/combat/expedition) + เพดานเกรด
//  ⚠️ ค่าทั้งหมดย้ายมาแบบ verbatim จาก petUtils/battle/expeditions — เลขเท่าเดิม
//     3 เส้นตั้งใจต่างกัน (สู้ flat กัน snowball · income ชัน) — ดู docs/pet-system-overhaul-audit
// ════════════════════════════════════════════════════════════
export const MAX_GRADE = 5
export const RARITY_ORDER = ['common', 'rare', 'epic', 'legendary']
export const clampGrade = (g) => Math.min(MAX_GRADE, Math.max(0, g || 0))

// ── income (จาก petUtils.js) ──
export const RARITY_DAILY_BASE = { common: 15, rare: 38, epic: 85, legendary: 175 }
export const GRADE_MULTI_V2 = [1.0, 2.0, 3.5, 5.5, 8.0, 12.0]

// ── combat (จาก battle.js) ──
export const COMBAT_BASE = {
  common:    { atk: 10, hp: 50 },
  rare:      { atk: 11, hp: 56 },
  epic:      { atk: 13, hp: 63 },
  legendary: { atk: 14, hp: 70 },
}
export const COMBAT_GRADE = [1.0, 1.15, 1.32, 1.52, 1.74, 2.0]
export const ELEMENT_BIAS = {
  fist:     { atk: 1.2,  hp: 0.85 },
  scissors: { atk: 1.0,  hp: 1.0  },
  paper:    { atk: 0.85, hp: 1.2  },
}

// ── expedition (จาก expeditions.js) ──
export const RARITY_WEIGHT = { common: 1, rare: 2, epic: 4, legendary: 7 }
export const EXP_GRADE_K = 0.15

/** pet → combat unit (= buildCombatant เดิม) */
export function combatStats(pet) {
  const base = COMBAT_BASE[pet?.rarity] || COMBAT_BASE.common
  const g = clampGrade(pet?.grade)
  const bias = ELEMENT_BIAS[pet?.element] || ELEMENT_BIAS.scissors
  const atk = base.atk * COMBAT_GRADE[g] * bias.atk
  const maxHp = base.hp * COMBAT_GRADE[g] * bias.hp
  return { id: pet?.id || null, element: pet?.element || 'scissors', atk, maxHp, hp: maxHp }
}

/** รายได้/วันต่อ 1 ตัว (= petDailyCoins เดิม รวม potential dailyCoins%) */
export function petDailyCoins(pet) {
  if (!pet) return 0
  const base = RARITY_DAILY_BASE[pet.rarity] ?? RARITY_DAILY_BASE.common
  const g = clampGrade(pet.grade)
  let coins = base * GRADE_MULTI_V2[g]
  if (Array.isArray(pet.potential)) {
    const bonus = pet.potential
      .filter(a => a?.stat === 'dailyCoins')
      .reduce((s, a) => s + (a.value || 0), 0)
    if (bonus) coins *= 1 + bonus / 100
  }
  return Math.round(coins)
}

/** น้ำหนักคุณภาพ expedition ต่อ 1 ตัว (= term ใน partyPower เดิม — ไม่ clamp) */
export function expWeight(pet) {
  const w = RARITY_WEIGHT[pet?.rarity] || RARITY_WEIGHT.common
  return w * (1 + (pet?.grade || 0) * EXP_GRADE_K)
}
```

- [ ] **Step 4: รันเทส → pass** (`node --test src/utils/petPower.test.js`)

- [ ] **Step 5: Commit**

```bash
git add src/data/petPower.js src/utils/petPower.test.js
git commit -m "PetPower: แหล่งพลังเดียว (income/combat/expedition + MAX_GRADE) เลขเท่าเดิม (pure+test)"
```

---

### Task 2: rewire battle.js + petUtils.js + petGrade.js → petPower (เทสเดิมผ่านไม่แก้)

**Files:**
- Modify: `src/data/battle.js`, `src/utils/petUtils.js`, `src/utils/petGrade.js`

**Interfaces:**
- Consumes: `combatStats`, `petDailyCoins`, tables, `MAX_GRADE` จาก petPower
- Produces: `battle.js` ยัง export `buildCombatant`/`BATTLE_CFG`/`elementMult` เหมือนเดิม · `petUtils.js` ยัง export `RARITY_DAILY_BASE`/`GRADE_MULTI_V2`/`petDailyCoins`/`totalPetDaily` · `petGrade.js` ยัง export `MAX_GRADE`

> เป้า: consumer/เทสเดิมที่ import ชื่อพวกนี้ **ไม่ต้องแก้** และผลลัพธ์เท่าเดิม

- [ ] **Step 1: battle.js — เอา combat consts ออก ใช้ petPower**

แทนบล็อก `const COMBAT_BASE … buildCombatant` (ปัจจุบัน ~15–38) ด้วย:
```js
import { combatStats } from './petPower.js'

/** pet → combat unit (ย้ายตรรกะไป petPower — เลขเท่าเดิม) */
export const buildCombatant = combatStats
```
(คง `import { elementBeats } from './index.js'`, `BATTLE_CFG`, `elementMult` เดิมไว้)

- [ ] **Step 2: petUtils.js — re-export จาก petPower**

แทน `RARITY_DAILY_BASE`/`GRADE_MULTI_V2`/`petDailyCoins` (ปัจจุบัน ~14–38) ด้วย re-export + คง `totalPetDaily`:
```js
// income constants + petDailyCoins ย้ายไป data/petPower.js (แหล่งเดียว) — re-export back-compat
export { RARITY_DAILY_BASE, GRADE_MULTI_V2, petDailyCoins } from '../data/petPower.js'
import { petDailyCoins } from '../data/petPower.js'

/** Sum of daily coins across stored (active) pets — vault pets earn nothing. */
export function totalPetDaily(pets) {
  return (pets || []).reduce((sum, p) => sum + petDailyCoins(p), 0)
}
```
(ลบคอมเมนต์หัวไฟล์ที่อ้าง legacy RARITY.dailyBase ออกได้ — ถูกลบไปแล้ว P0)

- [ ] **Step 3: petGrade.js — MAX_GRADE จาก petPower**

แทน `export const MAX_GRADE = 5` ด้วย:
```js
export { MAX_GRADE } from '../data/petPower.js'
import { MAX_GRADE } from '../data/petPower.js'
```
(คง `gradeUpCost`/`canUpgrade`/`RARITY_GRADE_COIN` เดิม — ใช้ `MAX_GRADE` ตัวที่ import)

- [ ] **Step 4: รันเทสเดิม (ต้องผ่านโดยไม่แก้เทส) + build**

Run: `node --test src/data/battle.test.js src/utils/petUtils.test.js src/utils/petGrade.test.js src/utils/battleStats.test.js`
Expected: PASS ทั้งหมด (พิสูจน์เลข combat/income เท่าเดิม)
Run: `npm run build` → สำเร็จ

- [ ] **Step 5: Commit**

```bash
git add src/data/battle.js src/utils/petUtils.js src/utils/petGrade.js
git commit -m "PetPower: rewire battle/petUtils/petGrade ให้ใช้ petPower (re-export, เลขเท่าเดิม เทสผ่านไม่แก้)"
```

---

### Task 3: rewire expeditions.js + expedition.js → petPower

**Files:**
- Modify: `src/data/expeditions.js`, `src/utils/expedition.js`

**Interfaces:**
- Consumes: `RARITY_WEIGHT`, `EXP_GRADE_K`, `expWeight` จาก petPower
- Produces: `expeditions.js` ยัง export `RARITY_WEIGHT`/`GRADE_K` (ชื่อเดิม) · `expedition.js` `partyPower` ผลเท่าเดิม

- [ ] **Step 1: expeditions.js — re-export weight จาก petPower**

แทน 2 บรรทัด (ปัจจุบัน ~22–23):
```js
export const RARITY_WEIGHT = { common: 1, rare: 2, epic: 4, legendary: 7 }
export const GRADE_K = 0.15        // +15%/เกรด ต่อน้ำหนัก rarity
```
ด้วย (คง POWER_K/ELEMENT_K/TICKET_* ที่เหลือ = tuning reward เฉพาะ expedition):
```js
// น้ำหนักคุณภาพ (rarity+เกรด) ย้ายไป data/petPower.js (แหล่งพลังเดียว) — re-export ชื่อเดิม
export { RARITY_WEIGHT, EXP_GRADE_K as GRADE_K } from './petPower.js'
```

- [ ] **Step 2: expedition.js — partyPower ใช้ expWeight**

แก้ `partyPower` (ปัจจุบัน ~10–15) ให้เรียก `expWeight` (ผลเท่าเดิมเป๊ะ) + ปรับ import:
```js
import { POWER_K, ELEMENT_K, TICKET_POWER_K, TICKET_EL_K, TICKET_CHANCE_MAX } from '../data/expeditions.js'
import { expWeight } from '../data/petPower.js'

/** น้ำหนักคุณภาพรวมของสาย (rarity × เกรด) */
export function partyPower(party) {
  return (party || []).reduce((sum, p) => sum + expWeight(p), 0)
}
```
(ลบ `RARITY_WEIGHT`, `GRADE_K` ออกจาก import ของ expedition.js — ไม่ใช้ตรงแล้ว · คงฟังก์ชันอื่นเดิม)

- [ ] **Step 2.5: ยืนยันไม่มีใคร import RARITY_WEIGHT/GRADE_K จาก expedition.js ที่หาย**

Run: `grep -rn "RARITY_WEIGHT\|GRADE_K" src/ --include=*.js --include=*.vue | grep -v "petPower\|expeditions.js"`
Expected: เหลือแค่ที่ import จาก `../data/expeditions.js` (ยัง re-export อยู่) — ถ้ามี import จาก expedition.js (utils) ให้ชี้ไป expeditions.js/petPower

- [ ] **Step 3: รันเทสเดิม + build**

Run: `node --test src/data/expeditions.test.js src/utils/expedition.test.js`
Expected: PASS (partyPower/resolveRewards เท่าเดิม)
Run: `npm run build` → สำเร็จ

- [ ] **Step 4: Commit**

```bash
git add src/data/expeditions.js src/utils/expedition.js
git commit -m "PetPower: rewire expedition weight ให้ใช้ petPower.expWeight (ผลเท่าเดิม เทสผ่าน)"
```

---

### Task 4: เกรดภาษาเดียว (เลขโรมัน) ทุกจอ

**Files:**
- Modify: `src/views/PetsView.vue` (grid badge + ⭐team badge), `src/components/battle/BattleReplay.vue` (inspect), `src/views/TowerView.vue` (scout)

**Interfaces:**
- Consumes: `GRADE_LABELS` จาก `data/index.js` (มีอยู่)
- Produces: เกรดโชว์เป็นโรมันทุกจอ · ⭐ "อยู่ในทีม" → badge "ทีม"

- [ ] **Step 1: PetsView grid — ★×n → badge โรมัน + ⭐team → badge "ทีม"**

หา markup ในการ์ด grid (ส่วนที่ render `'★'.repeat(...)` ด้วยคลาส `.pt-cell-stars` และ ⭐ ที่หมายถึง "อยู่ในทีม"). แก้:
- ★เกรด: แทน `'★'.repeat(grade)` (`.pt-cell-stars`) ด้วย badge มุมการ์ด `<span class="pt-cell-grade">{{ GRADE_LABELS[clampGrade(p.grade)] }}</span>` (แสดงเฉพาะ grade>0)
- ⭐ทีม: แทน emoji ⭐ ด้วย `<span class="pt-cell-team">ทีม</span>`

ตรวจว่า `GRADE_LABELS` + `clampGrade` import แล้วใน PetsView (ถ้ายัง เพิ่ม `import { GRADE_LABELS } from '../data/index.js'` และ `import { clampGrade } from '../data/petPower.js'`)

เพิ่ม CSS:
```css
.pt-cell-grade { position: absolute; top: -5px; left: -5px; background: #1e293b; color: #fff; font-size: .56rem; font-weight: 800; padding: 1px 6px; border-radius: 999px; border: 2px solid #fff; line-height: 1.3; }
.pt-cell-team { position: absolute; top: -5px; right: -5px; background: var(--primary); color: #fff; font-size: .52rem; font-weight: 800; padding: 1px 6px; border-radius: 999px; border: 2px solid #fff; }
```
> หมายเหตุ: อ่าน PetsView template จริงก่อน — หา element ที่ render stars/⭐ (P0 ลบ `.pt-cell-grade` CSS ไปแล้ว ตอนนี้สร้างใหม่)

- [ ] **Step 2: BattleReplay inspect — อารบิก → โรมัน**

หา `เกรด {{ ... grade }}` (อารบิก) ใน inspect panel → เปลี่ยนเป็น `เกรด {{ GRADE_LABELS[Math.min(5, Math.max(0, (...grade)||0))] }}`
ตรวจ import `GRADE_LABELS` (มีจาก data/index.js อยู่แล้วหรือไม่ — BattleReplay ใช้ RARITY จาก index อยู่แล้ว เพิ่ม GRADE_LABELS เข้า import เดียวกัน)

- [ ] **Step 3: TowerView scout — อารบิก → โรมัน**

เหมือน Step 2 ในแผง scout ของ TowerView (`เกรด ${grade}` → โรมัน) + ตรวจ import GRADE_LABELS

- [ ] **Step 4: build + ทดลอง dev**

Run: `npm run build` → สำเร็จ
ทดลอง (dev): PetsView grid เห็นเกรดโรมัน + badge "ทีม" · inspect ในไฟต์ + scout หอคอย เห็น "เกรด III" · ทุกจอเกรดโรมันตรงกัน

- [ ] **Step 5: Commit**

```bash
git add src/views/PetsView.vue src/components/battle/BattleReplay.vue src/views/TowerView.vue
git commit -m "Pet UI: เกรดเลขโรมันภาษาเดียวทุกจอ (PetsView badge/BattleReplay/Tower) + ⭐team → badge ทีม"
```

---

### Task 5: DetailModal — พาเนล 3 แกนพลัง

**Files:**
- Modify: `src/components/pets/PetDetailModal.vue`

**Interfaces:**
- Consumes: `RARITY` (สี+label ไทย, จาก index) · `GRADE_LABELS` · ปุ่มวิวัฒน์เดิม (มี confirm P0)
- Produces: พาเนล 3 แถว: ความหายาก / เกรด / ศักยภาพ(เร็วๆ นี้)

- [ ] **Step 1: อ่าน DetailModal template ปัจจุบัน** (ดูส่วน rarity tag + grade + ปุ่มวิวัฒน์ ~11–45) เพื่อจัดใหม่เป็น 3 แถว

- [ ] **Step 2: ใส่พาเนล 3 แกน** (แทน/จัดกลุ่ม markup เกรด/rarity เดิม)

```html
        <div class="pd-axes">
          <div class="pd-axis">
            <span class="pd-axis-k">ความหายาก</span>
            <span class="pd-axis-v pd-rarity" :style="{ background: RARITY[pet.rarity]?.color }">{{ RARITY[pet.rarity]?.label }}</span>
          </div>
          <div class="pd-axis">
            <span class="pd-axis-k">เกรด</span>
            <span class="pd-axis-v">
              <b class="pd-grade-badge">{{ GRADE_LABELS[gradeNow] || '0' }}</b>
              <button v-if="gradeNow < 5" class="pd-btn" :class="{ ok: canUp }" :disabled="!canUp || busy" @click="evolve">วิวัฒน์ → {{ GRADE_LABELS[gradeNow + 1] }}</button>
              <span v-else class="pd-max">สูงสุดแล้ว</span>
            </span>
          </div>
          <div class="pd-axis pd-axis-soon">
            <span class="pd-axis-k">ศักยภาพ</span>
            <span class="pd-axis-v pd-soon"><Emoji char="🔒" /> เร็วๆ นี้</span>
          </div>
        </div>
```
โดย `gradeNow = computed(() => pet.value?.grade || 0)` (เพิ่มถ้ายังไม่มี) · `canUp`/`busy`/`evolve` = ของเดิม · ลบ markup เกรด/ปุ่มวิวัฒน์ตำแหน่งเก่าออก (กันซ้ำ)

- [ ] **Step 3: CSS พาเนล**

```css
.pd-axes { display: flex; flex-direction: column; gap: 8px; margin: 12px 0; }
.pd-axis { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 8px 11px; border: 2px solid var(--ink); border-radius: 12px; }
.pd-axis-k { font-size: .72rem; font-weight: 800; color: #64748b; }
.pd-axis-v { display: inline-flex; align-items: center; gap: 8px; font-size: .82rem; font-weight: 800; }
.pd-rarity { color: #fff; padding: 2px 12px; border-radius: 999px; font-size: .74rem; }
.pd-grade-badge { background: #1e293b; color: #fff; min-width: 26px; text-align: center; padding: 2px 8px; border-radius: 8px; }
.pd-axis-soon { opacity: .7; border-style: dashed; }
.pd-soon { color: rgba(0,0,0,.45); font-weight: 700; }
.pd-max { font-size: .72rem; color: #15803d; font-weight: 800; }
```
(คง `.pd-btn` เดิม — ถ้าย้ายปุ่มวิวัฒน์เข้าแถวเกรด ตรวจว่า class/handler เดิมใช้ได้)

- [ ] **Step 4: build + ทดลอง dev**

Run: `npm run build` → สำเร็จ
ทดลอง (dev): เปิด DetailModal → เห็น 3 แถว (ความหายาก pill สีไทย · เกรดโรมัน + ปุ่มวิวัฒน์ → IV · ศักยภาพ 🔒 เร็วๆ นี้) · เกรด 5 โชว์ "สูงสุดแล้ว" · กดวิวัฒน์มี confirm (P0) แล้วเลขเกรดขึ้น

- [ ] **Step 5: Commit**

```bash
git add src/components/pets/PetDetailModal.vue
git commit -m "Pet UI: DetailModal พาเนล 3 แกนพลัง (ความหายาก/เกรดโรมัน+วิวัฒน์/ศักยภาพ เร็วๆนี้)"
```

---

## Self-Review (ตรวจ plan เทียบ spec)
- Part 1 petPower.js + MAX_GRADE + accessor → Task 1 (+test เลขตรง) ✓ · re-export → Task 2,3 (เทสเดิมผ่าน = gameplay-neutral proof) ✓
- Part 2 เกรดโรมันทุกจอ + ⭐team badge → Task 4 ✓
- Part 3 DetailModal 3 แกน (ศักยภาพ เร็วๆนี้) → Task 5 ✓
- **gameplay-neutral proof:** Task 2/3 บังคับเทสเดิมผ่านโดยไม่แก้ + petPower.test เลข hardcoded ตรงสูตร ✓
- **ไม่แตะ:** engine/gacha/resolveBattleTeam — ไม่มี task แตะ ✓

**Placeholder scan:** Task 1 โค้ดครบ · Task 4/5 มี "อ่าน template จริงก่อน" เพราะ markup PetsView/DetailModal ต้อง match anchor จริง (P0 ขยับ) — implementer อ่านก่อนแก้ ✓
**Type consistency:** `combatStats`/`petDailyCoins`/`expWeight`/`MAX_GRADE`/`clampGrade`/`GRADE_LABELS` ชื่อตรงทุก task ✓

## Deploy
frontend + pure utils เท่านั้น (ไม่แตะ rules/index) → deploy = `git push` (Pages) หลัง review ผ่าน · **verify ก่อน push:** เทสทั้งชุด `node --test src/**/*.test.js` ผ่านหมด (พิสูจน์เลขไม่เปลี่ยน)
