# Pet/Arena/Battle UI Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** จัดหน้า Pet ให้สะอาดแบบ 7DS (ดาวเกรด+ขอบ rarity, ถอด ATK/HP), ทำพื้นหลังสนามธีมแยกโหมด (Arena/Tower), ขยายเลข HP/ATK ในไฟต์, และปรับ Active team เป็น 3 คงที่ทุกคน

**Architecture:** งาน UI polish 4 ก้อนอิสระ · ตรรกะ pure (team size + team cap) แยกเทสได้ใน `data/residence.js` + `userSchema.js` + `utils/petTeam.js` · ส่วน Vue (การ์ดเพ็ท, ธีมสนาม, เลขไฟต์) verify ด้วย build · ทุก task จบแล้ว build ต้องเขียว (Task 2 ใส่ shim ให้ importer เดิมไม่พังก่อน Task 3 ย้าย)

**Tech Stack:** Vue 3 (SFC + `<script setup>`, scoped style) · Pinia (auth store) · node:test (pure utils) · CSS-only (CSP ห้ามภาพนอก)

## Global Constraints

- **`BATTLE_SLOTS = 3`** — ค่าคงที่เดียว, ทีมต่อสู้ 3 ช่องทุกคน (ไม่ผูกเลเวลบ้านอีกต่อไป)
- **ทุก emoji ในเทมเพลตต้องผ่าน `<Emoji char="..."/>`** — ห้าม emoji ดิบ (เป็น tofu บนบางเครื่อง) · ยกเว้น `★` (ดาว = อักขระ ไม่ใช่ emoji, ใส่ตรงๆ ได้)
- **overlay/สนามใหม่อยู่ใน `.br-ov` เดิม** (Teleport ไป body แล้ว) — ห้ามสร้าง `position:fixed` layer ใหม่นอก Teleport (stacking-context trap, CLAUDE.md ข้อ 6)
- **เขียน user doc ผ่าน `auth.patchUser` เท่านั้น** · ไม่แตะ battle engine / กาชา / รายได้เพ็ท
- **CSS ล้วน** สำหรับพื้นหลังสนาม (ไม่มีภาพภายนอก) · คุมความเข้มให้ตัวหนังสือขาว (`.br-side`/`.br-round`/`.br-atk`/`.br-hpn`) อ่านออก
- **เทส:** เฉพาะ pure utils `node --test` · Vue component verify ด้วย `npm run build`
- **สไตล์:** SFC scoped · commit `Area: อะไร (ทำไม)` ไทยปนอังกฤษ · โทน copy ยึด voice-guide.md

---

## File Structure

**แก้:**
- `src/views/PetsView.vue` — การ์ดลิสต์: ถอด `PetStatLine` → ดาวเกรด (Task 1) · ใช้ `BATTLE_SLOTS` (Task 3)
- `src/data/residence.js` — เพิ่ม `BATTLE_SLOTS` + shim (Task 2) → ลบ shim (Task 3)
- `src/data/userSchema.js` + `.test.js` — `TEAM_SIZE 4→3` (Task 2)
- `src/utils/petTeam.js` + `.test.js` — cap `resolveBattleTeam` ที่ 3 (Task 2)
- `src/components/battle/TeamPicker.vue`, `src/components/pets/PetDetailModal.vue` — ใช้ `BATTLE_SLOTS` (Task 3)
- `src/data/guide.js` — copy ทีม 3 ช่อง (Task 3)
- `src/components/battle/BattleReplay.vue` — prop theme + สนามธีม + เลข HP/ATK ใหญ่ (Task 4)
- `src/views/ArenaView.vue`, `src/views/TowerView.vue` — ส่ง `theme` (Task 4)

---

### Task 1: หน้า Pet — ดาวเกรดแทน PetStatLine

**Files:**
- Modify: `src/views/PetsView.vue`

**Interfaces:**
- Consumes: `p.grade` (number 0-5) ของแต่ละเพ็ทในลิสต์
- Produces: (ไม่มี export ใหม่ — UI only)

- [ ] **Step 1: แทน PetStatLine ด้วยดาวเกรดในการ์ด**

แก้ `src/views/PetsView.vue` บรรทัด 43 — จาก:
```html
          <PetStatLine :pet="p" />
```
เป็น:
```html
          <span v-if="p.grade > 0" class="pt-cell-stars">{{ '★'.repeat(Math.min(p.grade, 5)) }}</span>
```

- [ ] **Step 2: ลบ import PetStatLine ที่ไม่ใช้แล้ว**

แก้ `src/views/PetsView.vue` — ลบบรรทัด 64:
```js
import PetStatLine from '../components/shared/PetStatLine.vue'
```
(PetStatLine ยังถูกใช้ใน TeamPicker.vue — ไม่ต้องแตะ component ตัวนั้น)

- [ ] **Step 3: เพิ่ม style ดาว**

แก้ `src/views/PetsView.vue` — เพิ่มใน `<style scoped>` (หลัง `.pt-cell-name` บรรทัด 123):
```css
.pt-cell-stars { font-size: .62rem; color: #f59e0b; letter-spacing: -1px; line-height: 1; }
```

- [ ] **Step 4: Build ให้ผ่าน**

Run: `npm run build`
Expected: build สำเร็จ · manual (`npm run dev` → `#/pets`): การ์ดเห็น art+ดาวเกรด(ตามเกรด)+ชื่อ ไม่มี ATK/HP · เกรด 0 = ไม่มีดาว · แตะการ์ด → PetDetailModal ยังโชว์ ATK/HP ครบ

- [ ] **Step 5: Commit**

```bash
git add src/views/PetsView.vue
git commit -m "Pets: การ์ดลิสต์โชว์ดาวเกรดแทน ATK/HP (declutter แบบ 7DS — ดู stat เต็มใน detail)"
```

---

### Task 2: Team size = 3 core (residence + schema + petTeam cap)

**Files:**
- Modify: `src/data/residence.js:57`
- Modify: `src/data/userSchema.js:20,115` + migration
- Modify: `src/utils/petTeam.js`
- Test: `src/data/userSchema.test.js`, `src/utils/petTeam.test.js`

**Interfaces:**
- Produces:
  - `BATTLE_SLOTS = 3` (number) จาก `data/residence.js`
  - `residenceBattleSlots()` — shim คืน `BATTLE_SLOTS` เสมอ (ให้ importer เดิม 3 จุดยังทำงานจนกว่า Task 3 ย้าย)
  - `resolveBattleTeam(ids, pets)` — cap ผลลัพธ์ที่ `BATTLE_SLOTS` (สูงสุด 3 ยูนิต)
  - `USER_DEFAULTS.activePets` ยาว 3 · `normalizeUserData` slice/pad `activePets` เป็น 3

- [ ] **Step 1: เขียนเทส petTeam cap ที่ล้มก่อน**

เพิ่มท้าย `src/utils/petTeam.test.js`:
```js
test('resolveBattleTeam: cap ที่ BATTLE_SLOTS (3) — ส่ง 4 id คืน 3', () => {
  const r = resolveBattleTeam(['a', 'b', 'c', 'd'], [])
  assert.equal(r.length, 3)
  assert.deepEqual(r.map(u => u.id), ['a', 'b', 'c'])
})
```

- [ ] **Step 2: รันเทสให้เห็นว่าล้ม**

Run: `node --test src/utils/petTeam.test.js`
Expected: FAIL — คืน 4 (ยังไม่ cap)

- [ ] **Step 3: เพิ่ม BATTLE_SLOTS + shim ใน residence.js**

แก้ `src/data/residence.js` บรรทัด 57 — จาก:
```js
export const residenceBattleSlots  = (level) => getTier(level).battleSlots
```
เป็น:
```js
// ทีมต่อสู้ = 3 ช่องคงที่ทุกเลเวลบ้าน (เลิกเป็น perk บ้าน) — source เดียวคือ BATTLE_SLOTS
export const BATTLE_SLOTS = 3
// shim: importer เดิมยังเรียก residenceBattleSlots(level) ได้ (คืน 3 เสมอ) จนกว่าจะย้ายไปใช้ BATTLE_SLOTS ตรงๆ
export const residenceBattleSlots  = () => BATTLE_SLOTS
```
(field `battleSlots` ในแต่ละ tier กลายเป็น legacy dead data — ปล่อยไว้เหมือน `farm.plotCount`, ไม่ลบเพื่อเลี่ยงแก้ economy data 15 บรรทัดเสี่ยงพิมพ์ผิด · Task 3 อัปเดตคอมเมนต์หัวไฟล์)

- [ ] **Step 4: cap resolveBattleTeam**

แก้ `src/utils/petTeam.js` — เพิ่ม import + `.slice`:

บรรทัด 4 จาก:
```js
import { getPetDef } from '../data/index.js'
```
เป็น:
```js
import { getPetDef } from '../data/index.js'
import { BATTLE_SLOTS } from '../data/residence.js'
```

บรรทัด 6-7 จาก:
```js
export function resolveBattleTeam(ids, pets) {
  return (ids || []).filter(Boolean).map(id => {
```
เป็น:
```js
export function resolveBattleTeam(ids, pets) {
  // cap ที่ BATTLE_SLOTS — กันทีมศัตรู/บอทที่ doc เก่ายังมี 4 id → รับประกัน 3v3
  return (ids || []).filter(Boolean).slice(0, BATTLE_SLOTS).map(id => {
```

- [ ] **Step 5: รันเทส petTeam ให้ผ่าน**

Run: `node --test src/utils/petTeam.test.js`
Expected: PASS ทั้งหมด (รวมเทสเดิม)

- [ ] **Step 6: เขียนเทส userSchema (ทีม 3) ที่ล้มก่อน**

แก้ `src/data/userSchema.test.js` — ในบล็อกทีมสู้ (บรรทัด ~47-65) เปลี่ยนเลข 4→3 และเพิ่มเคส slice:
```js
// ── ทีมสู้: activePets ยาว 3 (Active team = 3 คงที่) ──
test('default activePets ยาว 3', () => {
  assert.equal(USER_DEFAULTS.activePets.length, 3)
})
test('normalize: activePets เดิม 2 ช่อง → pad เป็น 3', () => {
  const d = normalizeUserData({ activePets: ['cat', 'fox'] })
  assert.deepEqual(d.activePets, ['cat', 'fox', null])
})
test('normalize: activePets ยาวเกิน (4) → ตัดเหลือ 3', () => {
  const d = normalizeUserData({ activePets: ['a', 'b', 'c', 'd'] })
  assert.equal(d.activePets.length, 3)
  assert.deepEqual(d.activePets, ['a', 'b', 'c'])
})
test('normalize: legacy activePet → slot 0 (ยาว 3)', () => {
  const d = normalizeUserData({ activePet: 'cat' })
  assert.deepEqual(d.activePets, ['cat', null, null])
})
```
(ลบเทสเดิม 4 ตัวในบล็อกนี้ที่ล็อกเลข 4 — `default activePets ยาว 4`, `เดิม 3 ช่อง → pad เป็น 4`, `ยาวเกิน → ตัดเหลือ 4`, `legacy → slot 0 (ยาว 4)` แทนด้วยชุดบน)

- [ ] **Step 7: รันเทสให้เห็นว่าล้ม**

Run: `node --test src/data/userSchema.test.js`
Expected: FAIL — default ยังยาว 4

- [ ] **Step 8: แก้ userSchema เป็นทีม 3**

แก้ `src/data/userSchema.js`:

บรรทัด 20 จาก:
```js
  activePets: [null, null, null, null],
```
เป็น:
```js
  activePets: [null, null, null],
```

บรรทัด 106-107 (migration legacy activePet) จาก:
```js
  if (data.activePet && !(data.activePets || []).some(Boolean)) {
    d.activePets = [data.activePet, null, null, null]
  }
```
เป็น:
```js
  if (data.activePet && !(data.activePets || []).some(Boolean)) {
    d.activePets = [data.activePet, null, null]
  }
```

บรรทัด 115 จาก:
```js
  const TEAM_SIZE = 4
```
เป็น:
```js
  const TEAM_SIZE = 3
```

- [ ] **Step 9: รันเทส userSchema ให้ผ่าน + build**

Run: `node --test src/data/userSchema.test.js src/utils/petTeam.test.js`
Expected: PASS ทั้งหมด

Run: `npm run build`
Expected: build สำเร็จ (importer เดิมของ residenceBattleSlots ยังทำงานผ่าน shim)

- [ ] **Step 10: Commit**

```bash
git add src/data/residence.js src/data/userSchema.js src/data/userSchema.test.js src/utils/petTeam.js src/utils/petTeam.test.js
git commit -m "Battle: Active team = 3 คงที่ (BATTLE_SLOTS + schema TEAM_SIZE 3 + cap resolveBattleTeam กัน 4v3)"
```

---

### Task 3: Team=3 consumers + guide copy + ลบ shim

**Files:**
- Modify: `src/views/PetsView.vue:61,72`
- Modify: `src/components/battle/TeamPicker.vue:1,49,59`
- Modify: `src/components/pets/PetDetailModal.vue:58,74`
- Modify: `src/data/residence.js` (ลบ shim + คอมเมนต์หัว)
- Modify: `src/data/guide.js:22,38`

**Interfaces:**
- Consumes: `BATTLE_SLOTS` จาก `data/residence.js` (Task 2)
- Produces: (ไม่มี export ใหม่) · `residenceBattleSlots` ถูกลบออก

- [ ] **Step 1: PetsView ใช้ BATTLE_SLOTS**

แก้ `src/views/PetsView.vue`:

บรรทัด 61 จาก:
```js
import { residenceBattleSlots } from '../data/residence.js'
```
เป็น:
```js
import { BATTLE_SLOTS } from '../data/residence.js'
```

บรรทัด 72 จาก:
```js
const battleSlots = computed(() => residenceBattleSlots(authStore.userData?.residence?.level || 1))
```
เป็น:
```js
const battleSlots = computed(() => BATTLE_SLOTS)
```

- [ ] **Step 2: TeamPicker ใช้ BATTLE_SLOTS**

แก้ `src/components/battle/TeamPicker.vue`:

บรรทัด 1 (คอมเมนต์หัว) จาก:
```html
<!-- TeamPicker — จัดทีม (= activePets, ช่อง = battleSlots ตามเลเวลบ้าน) ใช้ร่วมหอคอย+หน้าเพ็ท
```
เป็น:
```html
<!-- TeamPicker — จัดทีม (= activePets, 3 ช่องคงที่ = BATTLE_SLOTS) ใช้ร่วมหอคอย+หน้าเพ็ท
```

บรรทัด 49 จาก:
```js
import { residenceBattleSlots } from '../../data/residence.js'
```
เป็น:
```js
import { BATTLE_SLOTS } from '../../data/residence.js'
```

บรรทัด 59 จาก:
```js
const battleSlots = computed(() => residenceBattleSlots(auth.userData?.residence?.level || 1))
```
เป็น:
```js
const battleSlots = computed(() => BATTLE_SLOTS)
```

- [ ] **Step 3: PetDetailModal ใช้ BATTLE_SLOTS**

แก้ `src/components/pets/PetDetailModal.vue`:

บรรทัด 58 จาก:
```js
import { residenceBattleSlots } from '../../data/residence.js'
```
เป็น:
```js
import { BATTLE_SLOTS } from '../../data/residence.js'
```

บรรทัด 74 จาก:
```js
const battleSlots = computed(() => residenceBattleSlots(auth.userData?.residence?.level || 1))
```
เป็น:
```js
const battleSlots = computed(() => BATTLE_SLOTS)
```

- [ ] **Step 4: ลบ shim residenceBattleSlots + อัปคอมเมนต์หัว residence.js**

แก้ `src/data/residence.js` — ลบบรรทัด shim (ที่ Task 2 ใส่):
```js
// shim: importer เดิมยังเรียก residenceBattleSlots(level) ได้ (คืน 3 เสมอ) จนกว่าจะย้ายไปใช้ BATTLE_SLOTS ตรงๆ
export const residenceBattleSlots  = () => BATTLE_SLOTS
```
(เหลือแค่ `export const BATTLE_SLOTS = 3` + คอมเมนต์เหนือมัน)

แก้คอมเมนต์หัวไฟล์ บรรทัด 6 จาก:
```js
//  `residence.level` drives daily income, farm plots, pet-income bonus %, battle slots,
```
เป็น:
```js
//  `residence.level` drives daily income, farm plots, pet-income bonus %,
//  (battle slots ไม่ผูกเลเวลแล้ว = BATTLE_SLOTS คงที่ 3 · field `battleSlots` ในตารางเป็น legacy)
```

- [ ] **Step 5: แก้ copy guide.js (ทีม 3 ช่อง)**

แก้ `src/data/guide.js` บรรทัด 22 (topic residence) จาก:
```js
      'พออัปเลเวลบ้าน จะปลดล็อกช่องทีมต่อสู้และแปลงปลูกในฟาร์มเพิ่มขึ้นด้วย',
```
เป็น:
```js
      'พออัปเลเวลบ้าน จะเพิ่มรายได้ต่อวันและปลดเพดานแปลงปลูกในฟาร์มให้ปลดได้มากขึ้น',
```

แก้บรรทัด 38 (topic pets) จาก:
```js
      'จำนวนช่องทีมต่อสู้ (Active) เพิ่มตามเลเวลบ้าน — อัปบ้านเพื่อพาเพ็ทลงสนามได้มากขึ้น',
```
เป็น:
```js
      'ทีมต่อสู้ (Active) มี 3 ช่อง — จัดเพ็ทที่แข็งที่สุดลงทีมเพื่อไต่หอคอยและลงสนามประลอง',
```

- [ ] **Step 6: Build + manual**

Run: `npm run build`
Expected: build สำเร็จ · ไม่มี import residenceBattleSlots หลงเหลือ — ยืนยันด้วย:

Run: `grep -rn "residenceBattleSlots" src/`
Expected: ไม่พบผลลัพธ์ (ลบหมดแล้ว)

manual: หน้า Pet/หอคอย/จัดทีม โชว์ 3 ช่องทุกเลเวลบ้าน · คนเคยมี 4 ตัว → เหลือ 3

- [ ] **Step 7: Commit**

```bash
git add src/views/PetsView.vue src/components/battle/TeamPicker.vue src/components/pets/PetDetailModal.vue src/data/residence.js src/data/guide.js
git commit -m "Battle: UI ทีมใช้ BATTLE_SLOTS (3 ช่อง) + guide copy + ลบ shim residenceBattleSlots"
```

---

### Task 4: BattleReplay — สนามธีมแยกโหมด + เลข HP/ATK ใหญ่ขึ้น

**Files:**
- Modify: `src/components/battle/BattleReplay.vue` (template `:9`, prop `:133`, CSS `:401,438`)
- Modify: `src/views/ArenaView.vue:46`
- Modify: `src/views/TowerView.vue:71`

**Interfaces:**
- Consumes: (ไม่มีจาก task อื่น)
- Produces: `BattleReplay` รับ prop `theme: 'arena' | 'tower'` (default `'tower'`)

- [ ] **Step 1: เพิ่ม prop theme + bind class ที่ .br-ov**

แก้ `src/components/battle/BattleReplay.vue`:

บรรทัด 133 จาก:
```js
const props = defineProps({ data: { type: Object, default: null } })
```
เป็น:
```js
const props = defineProps({
  data: { type: Object, default: null },
  theme: { type: String, default: 'tower' },   // 'arena' | 'tower' — พื้นหลังสนาม
})
```

บรรทัด 9 จาก:
```html
  <div v-if="data" class="br-ov">
```
เป็น:
```html
  <div v-if="data" class="br-ov" :class="'br-theme-' + theme">
```

- [ ] **Step 2: ทำพื้นหลังธีม + ย้าย background ออกจาก .br-ov base**

แก้ `src/components/battle/BattleReplay.vue` บรรทัด 401 จาก:
```css
.br-ov { position: fixed; inset: 0; z-index: 420; background: rgba(15,23,42,.88); display: flex; align-items: center; justify-content: center; padding: 16px; }
```
เป็น:
```css
.br-ov { position: fixed; inset: 0; z-index: 420; background: #0f172a; display: flex; align-items: center; justify-content: center; padding: 16px; }
/* Tower = ดันเจี้ยน/หอคอย: หินม่วง-น้ำเงินเข้ม + เรืองคบเพลิงอุ่นมุมล่าง (คงโทนเดิมแต่มีมิติ) */
.br-theme-tower {
  background:
    radial-gradient(120% 80% at 50% 0%, rgba(76,29,149,.55), transparent 60%),
    radial-gradient(80% 55% at 50% 100%, rgba(217,119,6,.22), transparent 70%),
    linear-gradient(180deg, #1e1b4b, #0f172a 70%);
}
/* Arena = โคลอสเซียม: ฟ้าเย็นด้านบน → หินทรายอุ่นเข้มด้านล่าง + ลายเสาแนวตั้งจางๆ (คุมเข้มพอให้ตัวขาวอ่านออก) */
.br-theme-arena {
  background:
    radial-gradient(100% 70% at 50% 10%, rgba(59,130,246,.28), transparent 55%),
    linear-gradient(180deg, #3b2f1a 0%, #2a1f12 60%, #17100a 100%),
    repeating-linear-gradient(90deg, rgba(255,220,150,.05) 0 2px, transparent 2px 46px);
}
```
(สีทั้งหมด tunable · ทั้งคู่โทนเข้มพอ ตัวหนังสือขาวเดิมอ่านออก · ไม่มีภาพนอก = ผ่าน CSP)

- [ ] **Step 3: ขยายเลข HP/ATK ในไฟต์**

แก้ `src/components/battle/BattleReplay.vue` บรรทัด 438 จาก:
```css
.br-atk, .br-hpn { font-size: .58rem; font-weight: 800; color: #fff; line-height: 1; padding: 2px 5px; border-radius: 999px; min-width: 14px; text-align: center; }
```
เป็น:
```css
.br-atk, .br-hpn { font-size: .72rem; font-weight: 800; color: #fff; line-height: 1; padding: 2px 6px; border-radius: 999px; min-width: 18px; text-align: center; }
```

และลด gap ของแถวเลขกันล้นกล่องเลข HP หลักพัน — บรรทัด 437 จาก:
```css
.br-stats { display: flex; justify-content: space-between; width: 84%; margin-top: 3px; }
```
เป็น:
```css
.br-stats { display: flex; justify-content: space-between; align-items: center; gap: 3px; width: 88%; margin-top: 3px; }
```

- [ ] **Step 4: ส่ง theme จาก ArenaView + TowerView**

แก้ `src/views/ArenaView.vue` บรรทัด 46 จาก:
```html
    <BattleReplay :data="replay" @close="replay = null" />
```
เป็น:
```html
    <BattleReplay :data="replay" theme="arena" @close="replay = null" />
```

แก้ `src/views/TowerView.vue` บรรทัด 71 จาก:
```html
    <BattleReplay :data="replay" @close="replay = null" />
```
เป็น:
```html
    <BattleReplay :data="replay" theme="tower" @close="replay = null" />
```

- [ ] **Step 5: Build + manual**

Run: `npm run build`
Expected: build สำเร็จ · manual (ต้องล็อกอิน+ไฟต์จริง): ไฟต์หอคอย = พื้นม่วง-น้ำเงินมีมิติ · ไฟต์สนามประลอง (ถ้า pvpOpen) = พื้นโคลอสเซียมทราย · ตัวหนังสือขาว (รอบ/ฝั่ง/ATK/HP) อ่านออกทั้งคู่ · เลข ATK/HP ใหญ่ขึ้นอ่านง่าย ไม่ล้นกล่อง (ลองเพ็ท HP หลักพัน) · หน้าสรุปผลยังกลืน

- [ ] **Step 6: Commit**

```bash
git add src/components/battle/BattleReplay.vue src/views/ArenaView.vue src/views/TowerView.vue
git commit -m "Battle: พื้นหลังสนามธีมแยกโหมด (Arena โคลอสเซียม/Tower หอคอย) + เลข HP/ATK ใหญ่ขึ้น"
```

---

## Self-Review Notes

- **Spec coverage:** F1 การ์ดเพ็ทดาวเกรด (Task 1) · F2 สนามธีมแยกโหมด (Task 4) · F3 เลข HP/ATK ใหญ่ (Task 4) · F4 team=3 (Task 2 core + Task 3 consumers) — ครบ 4 ฟีเจอร์
- **Green ทุก task:** Task 2 ใส่ shim `residenceBattleSlots()` ให้ importer เดิมไม่พังก่อน Task 3 ย้าย → build เขียวทุกจุด
- **Type consistency:** `BATTLE_SLOTS` (number) จาก residence.js ใช้เหมือนกันทั้ง Task 2/3 + petTeam · `theme` prop string 'arena'|'tower' ตรงกันทั้ง BattleReplay + callers
- **เบี่ยงจาก spec (ตั้งใจ):** spec ข้อ 6 เขียน "ลบ field battleSlots จากทุก tier" → แผนปล่อย field ไว้เป็น legacy dead data (เหมือน `farm.plotCount`) เพื่อเลี่ยงแก้ economy data 15 บรรทัดเสี่ยงพิมพ์ผิด · ไม่มีใครอ่าน field แล้ว + copy แก้แล้ว = ไม่ใช่ perk อีกต่อไป (ผลลัพธ์ตรง intent)
- **ระวัง:** `PetStatLine` ยังใช้ใน TeamPicker (Task 1 แก้แค่จุดเรียกใน PetsView ไม่แตะ component) · เลข HP/ATK ใหญ่ต้องไม่ล้นกล่อง grid 4 คอลัมน์ (guard ด้วย gap/width ใน Task 4 Step 3)
