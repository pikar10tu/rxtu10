# Pet Income + Storage Cleanup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** ลบ storage cap/vault ที่ไม่จำเป็นหลัง species-rework + เปลี่ยน residence petStorage perk → โบนัสรายได้ pet % + จูนรายได้ pet (reward-grind)

**Architecture:** data tuning (petUtils numbers, residence ladder) + wiring (useDaily/DailyCard apply pet bonus) + removal (vault/cap in schema/PetsView/ShopView/guide). ไม่มี pure util ใหม่/ไม่แตะ rules/migration.

**Tech Stack:** Vue 3 `<script setup>`, Pinia, Firebase, Vite

## Global Constraints
- ตรวจ build: `npm run build` (ไม่มี unit test ใหม่ — เป็น data/UI) · commit style `Area: อะไร (ทำไม)` ลงท้าย `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>` · ห้าม `git add -A`
- emoji ในเทมเพลตผ่าน `<Emoji char>` · ไม่แตะ rules/index/migration · ไม่แตะ STAT_MULTI/GRADE_MULTI (battle, deferred)
- ตัวเลขเป็น draft pins (ปรับใน data/)
- ลำดับ build: 1 (income) → 2 (ลบ cap/vault) → 3 (residence perk + useDaily) — แต่ละ task build เขียว

---

## Task 1: จูนรายได้ pet (petUtils.js)

**Files:** Modify `src/utils/petUtils.js`

- [ ] **Step 1: แก้ตัวเลข**
ใน `src/utils/petUtils.js`:
```js
export const RARITY_DAILY_BASE = { common: 6, rare: 15, epic: 35, legendary: 70 }
export const GRADE_MULTI_V2 = [1.0, 2.0, 3.5, 5.5, 8.0, 12.0]
```
(แทนค่าเดิม `{common:4,rare:10,epic:22,legendary:45}` และ `[1.0,1.7,2.5,3.4,4.4,5.5]` · ไม่แตะ `petDailyCoins`/`totalPetDaily` logic)

- [ ] **Step 2: ตรวจ build**
Run: `npm run build` → สำเร็จ

- [ ] **Step 3: Commit**
```bash
git add src/utils/petUtils.js
git commit -m "Pet: จูนรายได้ขึ้น reward-grind (เกรด V 12×, base 6/15/35/70)"
```

---

## Task 2: ลบ storage cap + vault (consumers)

**Files:** Modify `src/data/userSchema.js`, `src/views/PetsView.vue`, `src/views/ShopView.vue`, `src/data/guide.js`, `src/components/onboarding/MigrationWelcome.vue`

- [ ] **Step 1: userSchema — ลบ petsVault**
`src/data/userSchema.js`: ลบบรรทัด `petsVault: [],` ใน USER_DEFAULTS และบรรทัด `d.petsVault = Array.isArray(d.petsVault) ? d.petsVault : []` ใน normalizeUserData. (doc เก่ามี key ค้าง = harmless)

- [ ] **Step 2: PetsView — เลิก storage cap**
`src/views/PetsView.vue`:
- ลบ import `residencePetStorage` (จาก data/residence.js) + เพิ่ม `import { PETS } from '../data/index.js'`
- ลบ `const storageCap = computed(...)` (+ `level` ถ้าเหลือใช้แค่อันนั้น — ตรวจก่อนลบ)
- header: เปลี่ยน `<div><b>{{ pets.length }}</b>/{{ storageCap }} <small>คลัง</small></div>` → `<div><b>{{ pets.length }}</b>/{{ PETS.length }} <small>ชนิด</small></div>`

- [ ] **Step 3: ShopView — ตัดเช็กคลังเต็ม**
`src/views/ShopView.vue`:
- ใน `buy()`: ลบบล็อก `if (pets.value.length >= storageCap.value) { toast(...คลังเพ็ทเต็ม...); return }` (ตัวซ้ำ merge, ชนิดใหม่ ≤27 ถือได้เสมอ)
- ใน `useTicket()`: ลบบล็อกเช็ก storage cap เดียวกัน
- ลบแถบ `.shop-storage` ในเทมเพลต (ที่โชว์ `คลังเพ็ท {{ pets.length }}/{{ storageCap }}`) หรือเปลี่ยนเป็น `🐾 สัตว์เลี้ยง {{ pets.length }}/{{ PETS.length }} ชนิด`
- ลบ `storageCap` computed + import `residencePetStorage` · เพิ่ม `import { ... , PETS } from '../data/index.js'` ถ้าใช้ในแถบ · (`residenceShopDiscount` ที่ใช้ส่วนลด — คงไว้)

- [ ] **Step 4: guide + MigrationWelcome — แก้ข้อความ**
- `src/data/guide.js` (entry `pets`): แก้ body เลิกพูด "คลังเก็บมีจำกัด"/"เกินช่อง→คลังพัก" → เช่น "สะสมสัตว์ได้ครบทุกชนิด · ตัวซ้ำใช้อัปเกรด (เพิ่มเกรด → รายได้/พลังสูงขึ้น)" · แก้ title "สัตว์เลี้ยง · คลังเก็บ · คลังพัก" → "สัตว์เลี้ยง"
- `src/components/onboarding/MigrationWelcome.vue:27`: ลบ/แก้ `<div class="mw-note">ตัวเก่งอยู่ในคลังเก็บ ที่เหลืออยู่ใน "คลังพัก" — ไม่มีตัวไหนหาย</div>` → "สัตว์เลี้ยงทุกตัวเก็บได้หมด ตัวซ้ำใช้อัปเกรด" (หรือลบบรรทัดถ้าไม่เกี่ยวแล้ว)

- [ ] **Step 5: ตรวจ build + grep**
Run: `npm run build` → สำเร็จ
Run: `grep -rn "petsVault\|storageCap\|คลังพัก" src/` → เหลือเฉพาะที่ตั้งใจ (ไม่มี caller storageCap แล้ว)

- [ ] **Step 6: Commit**
```bash
git add src/data/userSchema.js src/views/PetsView.vue src/views/ShopView.vue src/data/guide.js src/components/onboarding/MigrationWelcome.vue
git commit -m "Pet: ลบ storage cap + vault (species model ถือครบ 27 ได้เสมอ)"
```

---

## Task 3: Residence perk petStorage → โบนัสรายได้ pet %

**Files:** Modify `src/data/residence.js`, `src/composables/useDaily.js`, `src/components/home/DailyCard.vue`

**Interfaces:**
- Produces: `residencePetIncomeBonus(level) → number` (% ) แทน `residencePetStorage`

- [ ] **Step 1: residence.js — เปลี่ยน column + accessor**
`src/data/residence.js`: ในแต่ละ tier เปลี่ยน field `petStorage: <n>` → `petIncomeBonusPct: <v>` ตาม ladder นี้ (index = level):
```
Lv1:0  Lv2:5  Lv3:10  Lv4:15  Lv5:20  Lv6:25  Lv7:35  Lv8:45
Lv9:60 Lv10:80 Lv11:100 Lv12:120 Lv13:140 Lv14:160 Lv15:180
```
แก้ accessor: `export const residencePetStorage = (level) => getTier(level).petStorage` → `export const residencePetIncomeBonus = (level) => getTier(level).petIncomeBonusPct`
(Task 2 ลบ caller `residencePetStorage` หมดแล้ว — rename ปลอดภัย)

- [ ] **Step 2: useDaily.js — คูณโบนัสเฉพาะ petIncome**
`src/composables/useDaily.js`:
- import: เพิ่ม `residencePetIncomeBonus` จาก `../data/residence.js` (มี `residenceDailyIncome` อยู่แล้ว)
- หลัง `petIncome`/`bonusPct` เพิ่ม:
```js
  const petBonusPct = computed(() => residencePetIncomeBonus(level.value))
  const petIncomeBoosted = computed(() => Math.round(petIncome.value * (1 + petBonusPct.value / 100)))
```
- แก้ `ratePerDay`:
```js
  const ratePerDay = computed(() => Math.round((baseIncome.value + petIncomeBoosted.value) * (1 + bonusPct.value / 100) * buffMult.value))
```
- เพิ่ม `petBonusPct` ใน return object (คง `petIncome` ดิบไว้สำหรับ breakdown)

- [ ] **Step 3: DailyCard — โชว์โบนัสบ้าน(เพ็ท)**
`src/components/home/DailyCard.vue`:
- destructure เพิ่ม `petBonusPct` จาก `useDaily()`
- ในบล็อก breakdown หลังแถว `🐾 สัตว์เลี้ยงในคลัง` เพิ่มแถว (เมื่อ `petBonusPct > 0`):
```html
<div v-if="petBonusPct" class="dc-row dc-bonus"><span><Emoji char="🏠" /> โบนัสบ้าน (เพ็ท)</span><b>+{{ petBonusPct }}%</b></div>
```

- [ ] **Step 4: ตรวจ build + ตา**
Run: `npm run build` → สำเร็จ
Run: `npm run dev` → DailyCard: รายได้ pet สูงขึ้น (Task 1) + แถวโบนัสบ้านโชว์ตาม residence level + รายได้/วันรวมสะท้อนโบนัส

- [ ] **Step 5: Commit**
```bash
git add src/data/residence.js src/composables/useDaily.js src/components/home/DailyCard.vue
git commit -m "Pet: residence perk → โบนัสรายได้ pet % (แทน storage cap ที่เลิกใช้)"
```

---

## สรุป deploy
- push master → auto-deploy · ไม่แตะ rules/index/migration

## Self-review note
- spec coverage: §1 ลบ vault/cap → Task 2 · §2 residence perk → Task 3 · §3 income → Task 1 · ครบ
- type: `residencePetIncomeBonus` (Task 3) แทน `residencePetStorage` (caller ลบใน Task 2) — ลำดับถูก, build เขียวทุกขั้น
