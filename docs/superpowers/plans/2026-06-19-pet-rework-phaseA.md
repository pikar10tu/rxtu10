# Pet Rework Phase A Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** เปลี่ยนเพ็ทเป็น species-based (1 entry/ชนิด + copies), เกรด I–V (อัพด้วย copies+เหรียญ), roster 27 ตัว, และ migrate เพ็ทเดิมของทุกคนครั้งเดียว

**Architecture:** instance ยังเก็บ field denormalized (emoji/name/rarity/element) แต่ migration refresh จาก catalog ใหม่ → consumer ที่อ่าน `pet.xxx` แทบไม่ต้องแก้. การเปลี่ยนหลัก = 1 entry/ชนิด + `copies`, `activePets` ใช้ species id, grade-up ใช้ copies+เหรียญแทน fodder instances. กาชาเต็มรูปแบบ = เฟส B (ไม่อยู่ในแผนนี้).

**Tech Stack:** Vue 3 `<script setup>`, Pinia, Firebase Firestore, Vite, `node:test`+`node:assert/strict`

## Global Constraints

- ทดสอบ pure util: `node --test src/utils/<file>.test.js` · ตรวจ build: `npm run build`
- เขียน user doc ผ่าน `auth.patchUser` · ฟิลด์ใหม่ใส่ `data/userSchema.js` ที่เดียว
- emoji ในเทมเพลตผ่าน `<Emoji char>` เสมอ
- commit style `Area: อะไร (ทำไม)` ลงท้าย `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>` · ห้าม `git add -A`
- **ไม่แตะ firestore.rules / ไม่มี index**
- เกรด 0–5 (array 6 ช่อง) · อัพไปเกรด N ใช้ N copies + เหรียญ · migration idempotent ด้วย flag `petsMigratedV2`
- draft pins (ตัวเลข) ปรับได้ภายหลัง — เป้าคือ "ทำงานได้ก่อน"

---

## Task 1: Catalog 27 ตัว + เกรด 6 ช่อง + getPetDef (data/index.js + petUtils.js)

**Files:**
- Modify: `src/data/index.js` (PETS, GRADE_LABELS, GRADE_COPIES, GRADE_MULTI, STAT_MULTI, petStats, + getPetDef)
- Modify: `src/utils/petUtils.js` (GRADE_MULTI_V2)

**Interfaces:**
- Produces: `PETS` (27 entries), `getPetDef(id)`, grade arrays length-6, `petStats(p)` (clamp grade≤5)

- [ ] **Step 1: แทน `PETS` array (data/index.js:45-92) ด้วย 27 ตัว**

```js
export const PETS = [
  // ── LEGENDARY ──
  { id:"bahamut",   emoji:"🐉", name:"บาฮามุท",  rarity:"legendary", element:"fist",     flavor:"ราชันมังกรบรรพกาล กางปีกปัดเป่าโรคร้าย", hatchMins:60 },
  { id:"kirin",     emoji:"👹", name:"โอนิ",      rarity:"legendary", element:"fist",     flavor:"อสูรเขาเดียวจากตำนาน พลังทำลายล้างมหาศาล", hatchMins:60 },
  { id:"trex",      emoji:"🦖", name:"ทีเร็กซ์",  rarity:"legendary", element:"fist",     flavor:"ราชานักล่าแห่งยุคดึกดำบรรพ์ กัดทีเดียวจบ", hatchMins:60 },
  { id:"ouroboros", emoji:"🐍", name:"อูโรโบรอส", rarity:"legendary", element:"scissors", flavor:"งูกลืนหางตัวเอง วัฏจักรไม่มีวันสิ้นสุด", hatchMins:60 },
  { id:"simurgh",   emoji:"🦅", name:"กริฟฟิน",   rarity:"legendary", element:"scissors", flavor:"ราชาแห่งเวหา ปีกครึ่งอินทรีครึ่งสิงห์", hatchMins:60 },
  { id:"phoenix",   emoji:"🐦‍🔥", name:"ฟีนิกซ์", rarity:"legendary", element:"scissors", flavor:"เกิดใหม่จากเถ้าถ่าน ไม่มีวันดับสูญ", hatchMins:60 },
  { id:"whale",     emoji:"🐳", name:"คุณวาฬ",    rarity:"legendary", element:"paper",    flavor:"เจ้าสมุทรผู้ใจดี โอบอุ้มทั้งทีมไว้ในอ้อมอก", hatchMins:60 },
  { id:"qilin",     emoji:"🐘", name:"บากุ",      rarity:"legendary", element:"paper",    flavor:"ปีศาจกินฝันร้าย รวมถึงฝันว่าสอบตก", hatchMins:60 },
  { id:"mammoth",   emoji:"🦣", name:"แมมมอธ",    rarity:"legendary", element:"paper",    flavor:"ยักษ์ขนยาวแห่งยุคน้ำแข็ง เกราะหนาปราการ", hatchMins:60 },
  // ── EPIC ──
  { id:"dragon",    emoji:"🐲", name:"มังกร",     rarity:"epic", element:"fist",     flavor:"พ่นไฟ purify impurity แต่เผา reactor ไปด้วย", hatchMins:1 },
  { id:"cerberus",  emoji:"🐕", name:"เซอร์เบอรัส", rarity:"epic", element:"fist",   flavor:"หมา 3 หัวเฝ้า drug interaction เห่าทุกครั้งที่เจอ grapefruit", hatchMins:1 },
  { id:"unicorn",   emoji:"🦄", name:"ยูนิคอร์น", rarity:"epic", element:"scissors", flavor:"เขาเป็น magic wand บดยาในโกร่งเนียนกริ๊บ", hatchMins:1 },
  { id:"fairy",     emoji:"🧚", name:"ภูต",       rarity:"epic", element:"scissors", flavor:"ภูตน้อยเจ้าเวทมนตร์ โปรยละอองเสริมพลังทั้งทีม", hatchMins:1 },
  { id:"panda",     emoji:"🐼", name:"แพนด้า",    rarity:"epic", element:"paper",    flavor:"ตาดำคล้ำเพราะอดนอนติว ไม่ใช่ลายประจำสายพันธุ์", hatchMins:1 },
  { id:"genie",     emoji:"🧞", name:"จินนี่",    rarity:"epic", element:"paper",    flavor:"จินนี่จากตะเกียง ขอพรได้ แต่ใช้ไปกับการบ้านหมดแล้ว", hatchMins:1 },
  // ── RARE ──
  { id:"wolf",      emoji:"🐺", name:"หมาป่า",    rarity:"rare", element:"fist",     flavor:"หอนเรียกก๊วนมาติว สุดท้ายนั่งเล่นเกมกันหมด", hatchMins:1 },
  { id:"shark",     emoji:"🦈", name:"ฉลาม",      rarity:"rare", element:"fist",     flavor:"ว่ายไม่หยุดเหมือน deadline ที่ไม่เคยหยุดวิ่งเข้ามา", hatchMins:1 },
  { id:"fox",       emoji:"🦊", name:"จิ้งจอก",   rarity:"rare", element:"scissors", flavor:"ได้กลิ่น drug interaction ก่อน Micromedex โหลดเสร็จ", hatchMins:1 },
  { id:"rabbit",    emoji:"🐰", name:"กระต่าย",   rarity:"rare", element:"scissors", flavor:"ออกฤทธิ์เร็วกว่า IV push ซะอีก", hatchMins:1 },
  { id:"owl",       emoji:"🦉", name:"นกฮูก",     rarity:"rare", element:"paper",    flavor:"อ่านหนังสือทั้งคืน ตื่นมาจำได้แค่หน้าปก", hatchMins:1 },
  { id:"seal",      emoji:"🦭", name:"แมวน้ำ",    rarity:"rare", element:"paper",    flavor:"ตบมือให้ตัวเองทุกครั้งที่ตอบ ทั้งที่ตอบผิด", hatchMins:1 },
  // ── COMMON ──
  { id:"hedgehog",  emoji:"🦔", name:"เม่น",      rarity:"common", element:"fist",     flavor:"หนามแหลมเหมือนเข็ม 18G แต่ใจอ่อนยิ่งกว่าวุ้น", hatchMins:1 },
  { id:"hamster",   emoji:"🐹", name:"แฮมสเตอร์", rarity:"common", element:"fist",     flavor:"ตุนแคปซูลเต็มแก้มเหมือนตุนชีตก่อนสอบ", hatchMins:1 },
  { id:"mouse",     emoji:"🐭", name:"หนู",       rarity:"common", element:"scissors", flavor:"อาสาเป็นหนูทดลอง ขอแค่ได้ใส่ชื่อเป็นผู้ร่วมวิจัย", hatchMins:1 },
  { id:"cat",       emoji:"🐱", name:"แมว",       rarity:"common", element:"scissors", flavor:"นอนทับ lab sheet ที่พรุ่งนี้ต้องส่ง แต่ไม่มีใครกล้าปลุก", hatchMins:1 },
  { id:"butterfly", emoji:"🦋", name:"ผีเสื้อ",   rarity:"common", element:"paper",    flavor:"เก็บเกสรสมุนไพรเก่ง สอบ Pharmacognosy ได้ A", hatchMins:1 },
  { id:"turtle",    emoji:"🐢", name:"เต่า",      rarity:"common", element:"paper",    flavor:"อายุยืนเพราะ compliance 100% กินยาตรงเวลา", hatchMins:1 },
];

export const getPetDef = (id) => PETS.find(p => p.id === id) || null;
```

- [ ] **Step 2: แก้ grade arrays เป็น 6 ช่อง (data/index.js:15-17, 35) + petStats clamp**

```js
export const GRADE_LABELS = ['','I','II','III','IV','V'];
export const GRADE_COPIES = [0,1,2,3,4,5];        // copies ต่อการอัพไปเกรด index (อัพไป N = N copies)
export const GRADE_MULTI  = [1.0, 1.5, 2.1, 2.8, 3.6, 4.5];   // legacy stat mult (draft pin)
export const STAT_MULTI   = [1.0, 1.5, 2.1, 2.8, 3.6, 4.5];   // (draft pin)
```
แก้ `petStats(p)` ให้ clamp grade: `const g = Math.min(STAT_MULTI.length - 1, Math.max(0, p.grade || 0));`

- [ ] **Step 3: petUtils GRADE_MULTI_V2 → 6 ช่อง (petUtils.js:22)**

```js
export const GRADE_MULTI_V2 = [1.0, 1.7, 2.5, 3.4, 4.4, 5.5]   // income mult by grade 0-5 (draft pin)
```
(clamp ที่ `petDailyCoins` ใช้ `GRADE_MULTI_V2.length - 1` อยู่แล้ว — ทำงานต่อ)

- [ ] **Step 4: ตรวจ build**

Run: `npm run build`
Expected: build สำเร็จ (consumer ที่ refer GRADE index สูงๆ จะถูกแก้ใน task ถัดไป — JS ไม่ error)

- [ ] **Step 5: Commit**

```bash
git add src/data/index.js src/utils/petUtils.js
git commit -m "Pet: catalog 27 ตัว (grid 4×3) + เกรด 6 ช่อง + getPetDef + รีสเกล stat/income (draft)"
```

---

## Task 2: `utils/petGrade.js` — ค่าอัพเกรด (pure + เทส)

**Files:**
- Create: `src/utils/petGrade.js`
- Test: `src/utils/petGrade.test.js`

**Interfaces:**
- Produces: `MAX_GRADE=5` · `gradeUpCost(pet) → { copies, coins } | null` · `canUpgrade(pet, ownedCoins) → bool`

- [ ] **Step 1: เขียนเทส `src/utils/petGrade.test.js`**

```js
// เทส petGrade — ค่าอัพเกรด (copies + เหรียญ ตาม rarity/เกรดเป้า)
// รัน: node --test src/utils/petGrade.test.js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { MAX_GRADE, gradeUpCost, canUpgrade } from './petGrade.js'

test('อัพไปเกรด N ใช้ N copies', () => {
  assert.equal(gradeUpCost({ rarity: 'common', grade: 0 }).copies, 1) // →I
  assert.equal(gradeUpCost({ rarity: 'common', grade: 3 }).copies, 4) // →IV
})

test('เหรียญ = base[rarity] × เกรดเป้า', () => {
  assert.equal(gradeUpCost({ rarity: 'common', grade: 0 }).coins, 200 * 1)
  assert.equal(gradeUpCost({ rarity: 'legendary', grade: 4 }).coins, 4000 * 5)
})

test('เกรดสูงสุด (≥5) → null', () => {
  assert.equal(gradeUpCost({ rarity: 'epic', grade: 5 }), null)
})

test('canUpgrade: copies + เหรียญ พอ', () => {
  const pet = { rarity: 'common', grade: 0, copies: 1 }
  assert.equal(canUpgrade(pet, 200), true)
  assert.equal(canUpgrade(pet, 199), false)              // เหรียญไม่พอ
  assert.equal(canUpgrade({ ...pet, copies: 0 }, 999), false) // copies ไม่พอ
})

test('canUpgrade: เกรดสูงสุด → false', () => {
  assert.equal(canUpgrade({ rarity: 'rare', grade: 5, copies: 9 }, 999999), false)
})
```

- [ ] **Step 2: รันให้ FAIL**

Run: `node --test src/utils/petGrade.test.js`
Expected: FAIL — module ไม่มี

- [ ] **Step 3: เขียน `src/utils/petGrade.js`**

```js
// petGrade — pure: ค่าอัพเกรดเพ็ท (เกรด 0-5, อัพไป N ใช้ N copies + เหรียญ)
export const MAX_GRADE = 5
// เหรียญต่อการอัพ 1 ขั้น = base[rarity] × เกรดเป้า (draft pin, tunable)
const RARITY_GRADE_COIN = { common: 200, rare: 600, epic: 1500, legendary: 4000 }

export function gradeUpCost(pet) {
  const g = pet?.grade || 0
  if (g >= MAX_GRADE) return null
  const target = g + 1
  const base = RARITY_GRADE_COIN[pet?.rarity] ?? RARITY_GRADE_COIN.common
  return { copies: target, coins: base * target }
}

export function canUpgrade(pet, ownedCoins) {
  const cost = gradeUpCost(pet)
  if (!cost) return false
  return (pet.copies || 0) >= cost.copies && (ownedCoins || 0) >= cost.coins
}
```

- [ ] **Step 4: รันให้ PASS**

Run: `node --test src/utils/petGrade.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/utils/petGrade.js src/utils/petGrade.test.js
git commit -m "Pet: petGrade util (อัพเกรด N copies + เหรียญ, pure+เทส)"
```

---

## Task 3: `utils/petMigration.js` — migrate เพ็ทเดิม (pure + เทส)

**Files:**
- Create: `src/utils/petMigration.js`
- Test: `src/utils/petMigration.test.js`

**Interfaces:**
- Consumes: `getPetDef` (data/index.js)
- Produces: `migratePets(oldPets, oldActive, catalogIds, defOf) → { pets, activePets, refundCoins }`
  - `oldPets` = array instance เดิม (มี id, grade, rarity, instId, copies?, potential?)
  - `oldActive` = activePets เดิม (instId หรือ id ปน) · `catalogIds` = Set ของ id ใหม่ที่มีจริง · `defOf(id)` = catalog def หรือ null
  - คืน pets (1 entry/ชนิด, refresh identity), activePets (species id), refundCoins (number)

- [ ] **Step 1: เขียนเทส `src/utils/petMigration.test.js`**

```js
// เทส petMigration — รวม instance ซ้ำ→copies, scale grade, refund ตัวตัด/nerf, activePets instId→id
// รัน: node --test src/utils/petMigration.test.js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { migratePets } from './petMigration.js'

// catalog จำลอง: cat(common scissors), panda(epic paper), butterfly(common paper)
const DEFS = {
  cat:       { id:'cat', emoji:'🐱', name:'แมว', rarity:'common', element:'scissors' },
  panda:     { id:'panda', emoji:'🐼', name:'แพนด้า', rarity:'epic', element:'paper' },
  butterfly: { id:'butterfly', emoji:'🦋', name:'ผีเสื้อ', rarity:'common', element:'paper' },
}
const ids = new Set(Object.keys(DEFS))
const defOf = (id) => DEFS[id] || null

test('merge instance ซ้ำ → 1 entry, grade=max(scaled), copies=ตัวเกิน', () => {
  const old = [
    { id:'cat', grade:12, rarity:'common', instId:'a' },  // XII → V(5)
    { id:'cat', grade:0,  rarity:'common', instId:'b' },
    { id:'cat', grade:0,  rarity:'common', instId:'c' },
  ]
  const r = migratePets(old, [], ids, defOf)
  const cat = r.pets.find(p => p.id === 'cat')
  assert.equal(cat.grade, 5)        // round(12*5/12)=5
  assert.equal(cat.copies, 2)       // 2 ตัวเกิน
  assert.equal(cat.emoji, '🐱')     // refresh จาก catalog
})

test('ตัดตัวที่ไม่อยู่ใน catalog → refund (rarity เดิม × (1+เกรด×0.1))', () => {
  const old = [{ id:'frog', grade:0, rarity:'common', instId:'x' }]   // ไม่อยู่ใน catalog
  const r = migratePets(old, [], ids, defOf)
  assert.equal(r.pets.length, 0)
  assert.equal(r.refundCoins, 500)  // common 500 × 1.0
})

test('rarity nerf (butterfly rare→common) → คืนส่วนต่าง', () => {
  const old = [{ id:'butterfly', grade:0, rarity:'rare', instId:'x' }]  // เดิม rare, catalog common
  const r = migratePets(old, [], ids, defOf)
  assert.equal(r.refundCoins, 2500 - 500)  // rare - common
  assert.equal(r.pets.find(p => p.id === 'butterfly').rarity, 'common') // refresh
})

test('rarity buff (panda → epic) → ไม่คิดเงิน', () => {
  const old = [{ id:'panda', grade:0, rarity:'rare', instId:'x' }]  // เดิม rare, catalog epic
  const r = migratePets(old, [], ids, defOf)
  assert.equal(r.refundCoins, 0)
  assert.equal(r.pets.find(p => p.id === 'panda').rarity, 'epic')
})

test('activePets instId → species id, ตัด id ที่ถูก cut', () => {
  const old = [{ id:'cat', grade:0, rarity:'common', instId:'a' }, { id:'frog', grade:0, rarity:'common', instId:'x' }]
  const r = migratePets(old, ['a', 'x'], ids, defOf)
  assert.deepEqual(r.activePets, ['cat'])  // a→cat, x(frog ถูกตัด)→หาย
})
```

- [ ] **Step 2: รันให้ FAIL**

Run: `node --test src/utils/petMigration.test.js`
Expected: FAIL — module ไม่มี

- [ ] **Step 3: เขียน `src/utils/petMigration.js`**

```js
// petMigration — pure: รวม/รีสกิล/คืนเหรียญ เพ็ทเดิม → โมเดล species-based ใหม่ (เกรด I-V)
const REFUND = { common: 500, rare: 2500, epic: 8000, legendary: 25000 }
const scaleGrade = (g) => Math.min(5, Math.max(0, Math.round((g || 0) * 5 / 12)))
const refundOf = (rarity, grade) => Math.round((REFUND[rarity] || 0) * (1 + (grade || 0) * 0.1))

export function migratePets(oldPets, oldActive, catalogIds, defOf) {
  const list = Array.isArray(oldPets) ? oldPets : []
  let refundCoins = 0
  const byId = new Map()                 // id → array ของ instance ที่อยู่ใน catalog
  const instToId = new Map()             // instId → species id (ตัวที่รอด)

  for (const p of list) {
    if (!p || !p.id) continue
    if (!catalogIds.has(p.id)) {         // ถูกตัด → refund (rarity เดิม)
      refundCoins += refundOf(p.rarity, p.grade)
      continue
    }
    const def = defOf(p.id)
    // rarity nerf → คืนส่วนต่าง (เทียบ rarity เดิม vs ใหม่)
    if (p.rarity && def && p.rarity !== def.rarity) {
      const diff = (REFUND[p.rarity] || 0) - (REFUND[def.rarity] || 0)
      if (diff > 0) refundCoins += Math.round(diff * (1 + (p.grade || 0) * 0.1))
    }
    if (!byId.has(p.id)) byId.set(p.id, [])
    byId.get(p.id).push(p)
    if (p.instId) instToId.set(p.instId, p.id)
  }

  const pets = []
  for (const [id, group] of byId) {
    const def = defOf(id)
    const maxGrade = scaleGrade(Math.max(...group.map(g => g.grade || 0)))
    const extraCopies = group.length - 1 + group.reduce((s, g) => s + (g.copies || 0), 0)
    const primary = group[0]
    pets.push({
      id,
      grade: maxGrade,
      copies: extraCopies,
      instId: primary.instId || `${id}_${Date.now()}`,
      bornAt: primary.bornAt || Date.now(),
      potential: Array.isArray(primary.potential) ? primary.potential : [],
      // refresh identity จาก catalog (reskin/rarity/element ใหม่มีผลทันที)
      emoji: def.emoji, name: def.name, rarity: def.rarity, element: def.element,
    })
  }

  // activePets: instId/id เดิม → species id ที่ยังมี
  const ownedIds = new Set(pets.map(p => p.id))
  const activePets = []
  for (const a of (oldActive || [])) {
    const ref = (typeof a === 'string') ? a : a?.instId
    const sid = instToId.get(ref) || (ownedIds.has(ref) ? ref : null)
    if (sid && ownedIds.has(sid) && !activePets.includes(sid)) activePets.push(sid)
  }

  return { pets, activePets, refundCoins }
}
```

- [ ] **Step 4: รันให้ PASS**

Run: `node --test src/utils/petMigration.test.js`
Expected: PASS ทุกเคส

- [ ] **Step 5: Commit**

```bash
git add src/utils/petMigration.js src/utils/petMigration.test.js
git commit -m "Pet: petMigration util (merge→copies/scale grade/refund/activePets, pure+เทส)"
```

---

## Task 4: schema flag + migration runner

**Files:**
- Modify: `src/data/userSchema.js` (USER_DEFAULTS: `petsMigratedV2`)
- Modify: `src/stores/auth.js` (รัน migration เมื่อโหลด user doc ครั้งแรกถ้ายังไม่ migrate)

**Interfaces:**
- Consumes: `migratePets` (Task 3), `PETS`/`getPetDef` (data/index.js)

- [ ] **Step 1: schema flag**

`src/data/userSchema.js` ใน USER_DEFAULTS เพิ่ม: `petsMigratedV2: false,`

- [ ] **Step 2: runner ใน auth store**

`src/stores/auth.js`: หาจุดที่ `userData` ถูก set จาก onSnapshot (หลัง normalizeUserData). เพิ่มฟังก์ชัน + เรียกเมื่อ `userData && userData.petsMigratedV2 !== true` (รันครั้งเดียว guard ด้วยตัวแปร module-scope กันยิงซ้ำระหว่าง snapshot):
```js
import { migratePets } from '../utils/petMigration.js'
import { PETS, getPetDef } from '../data/index.js'
// ...
let _petMigrating = false
async function runPetMigrationIfNeeded() {
  const u = userData.value
  if (!u || u.petsMigratedV2 === true || _petMigrating) return
  _petMigrating = true
  try {
    const ids = new Set(PETS.map(p => p.id))
    const { pets, activePets, refundCoins } = migratePets(u.pets, u.activePets, ids, getPetDef)
    await patchUser(
      { pets, activePets, petsMigratedV2: true, coins: (u.coins || 0) + refundCoins },
      { pets, activePets, petsMigratedV2: true, ...(refundCoins ? { coins: increment(refundCoins) } : {}) },
    )
    if (refundCoins) toast(`อัปเดตคลังเพ็ทรุ่นใหม่ — คืนเหรียญ ${refundCoins.toLocaleString()}`, 'success')
  } catch (e) { console.error('[pet migration]', e) }
  finally { _petMigrating = false }
}
```
เรียก `runPetMigrationIfNeeded()` หลัง set `userData.value = normalized` ใน onSnapshot handler. (ตรวจว่ามี `increment` import + toast เข้าถึงได้ใน store; ถ้าไม่ ใช้ console เฉยๆ แทน toast หรือ import useToast)

> หมายเหตุ: ใช้ค่า `u` snapshot ก่อน patch · patchUser จะทำให้ onSnapshot ยิงใหม่ แต่ตอนนั้น `petsMigratedV2===true` แล้ว → ไม่รันซ้ำ · `_petMigrating` กัน race ระหว่างรอ

- [ ] **Step 3: ตรวจ build**

Run: `npm run build`
Expected: build สำเร็จ

- [ ] **Step 4: Commit**

```bash
git add src/data/userSchema.js src/stores/auth.js
git commit -m "Pet: migration runner (รันครั้งเดียวตอนโหลด user, flag petsMigratedV2)"
```

---

## Task 5: PetDetailModal rewrite (copies/grade-up/id-active/potential read-only)

**Files:**
- Modify: `src/components/pets/PetDetailModal.vue`

**Interfaces:**
- Consumes: `gradeUpCost`, `canUpgrade`, `MAX_GRADE` (petGrade.js) · `GRADE_LABELS`, `petStats` (data/index.js) · `petDailyCoins` (petUtils)

อ่านไฟล์ปัจจุบันก่อน. การเปลี่ยนหลัก (โมเดล species-based: 1 entry/ชนิด, `copies` field, `activePets`=species id, ไม่มี fodder instances):

- [ ] **Step 1: props + pet lookup เป็น species id**
- props `instId` → `petId` (string). `pet = pets.find(p => p.id === props.petId)`
- `count` → `1` (1 entry/ชนิด แล้ว) — เอา tag "×N ในคลัง" ออก หรือเปลี่ยนเป็นโชว์ `copies`
- ลบ `dupes` computed (ไม่มี fodder instance)

- [ ] **Step 2: active toggle เป็น species id**
- `activeList` = `(auth.userData?.activePets||[]).filter(id => ownedIds.has(id))` โดย `ownedIds = new Set(pets.value.map(p=>p.id))`
- `isActive = activeList.includes(pet.id)` · toggle ใช้ `pet.id` แทน `pet.instId`
- `commit()` reconcile active ด้วย id: `owned = new Set(newPets.map(p=>p.id))`

- [ ] **Step 3: evolve → ใช้ copies + เหรียญ (แทน fodder)**
แทน `evoNeed`/`dupes`/`evolve` ด้วย:
```js
import { gradeUpCost, canUpgrade, MAX_GRADE } from '../../utils/petGrade.js'
const upCost = computed(() => pet.value ? gradeUpCost(pet.value) : null)
const canUp = computed(() => pet.value && canUpgrade(pet.value, auth.userData?.coins || 0))
async function evolve() {
  if (busy.value || !pet.value || !upCost.value) return
  const p = pet.value
  if (!canUp.value) { toast('copies หรือเหรียญไม่พอ', 'info'); return }
  const newPets = pets.value.map(x => x.id === p.id
    ? { ...x, grade: (x.grade||0)+1, copies: (x.copies||0) - upCost.value.copies } : x)
  busy.value = true
  try { await commit(newPets, -upCost.value.coins); toast(`วิวัฒน์ → เกรด ${GRADE_LABELS[(p.grade||0)+1]}!`, 'success') }
  catch (e) { console.error('[evolve]', e); toast('วิวัฒน์ไม่สำเร็จ', 'error') }
  finally { busy.value = false }
}
```
template evolve section: เกรดสูงสุดเช็ก `pet.grade >= MAX_GRADE` · note โชว์ "ใช้ {{upCost.copies}} copies + {{upCost.coins}} เหรียญ (มี copies {{pet.copies||0}})" · ปุ่ม `:disabled="!canUp || busy"`

- [ ] **Step 4: potential → read-only (เฟส A)**
- เก็บการแสดง affix ที่มีอยู่ (slot ที่ filled) ไว้ · **ลบปุ่ม `rollNew`/`reroll`** + ฟังก์ชัน `rollNew`/`reroll`/`pickFodder` + import ที่ไม่ใช้ (`rollAffix`, `rollCost`, `useConfirm` ถ้าไม่เหลือที่ใช้) · เพิ่ม note "ศักยภาพปรับได้เมื่อเปิดระบบสู้ (เร็วๆ นี้)"
- คง `slotsFor`/`statBonusPct`/`affixMeta` ที่ใช้แสดงผล/คำนวณ stat

- [ ] **Step 5: ตรวจ build + ลองมือ**

Run: `npm run build` → สำเร็จ · `npm run dev`: เปิด PetDetailModal → อัพเกรดด้วย copies+เหรียญ, ตั้งทีม active ได้, ศักยภาพโชว์เฉยๆ ไม่มีปุ่มสุ่ม

- [ ] **Step 6: Commit**

```bash
git add src/components/pets/PetDetailModal.vue
git commit -m "Pet: PetDetailModal species-based (อัพเกรด copies+เหรียญ, active=id, potential read-only)"
```

---

## Task 6: PetsView + ProfileModal + PetStatPopup — id-based + copies

**Files:**
- Modify: `src/views/PetsView.vue`
- Modify: `src/components/members/ProfileModal.vue`

**Interfaces:**
- Consumes: pet `id`/`copies` · `activePets`=species id

- [ ] **Step 1: PetsView — key/select/active เป็น id**
- `v-for` key `p.id` (แทน `p.instId`) · `@click="sel = p.id"` · `activeSet` = `new Set((activePets||[]).filter(id=>owned.has(id)))` โดย owned = `new Set(pets.map(p=>p.id))` · ดาว `activeSet.has(p.id)`
- ส่ง `<PetDetailModal :petId="sel" ... />` (เปลี่ยน prop จาก instId)
- (optional) โชว์ badge copies ถ้า `p.copies > 0`

- [ ] **Step 2: ProfileModal showcase — id-based**
- `showcase` (line 122-126): `ids = (member.activePets||[]).map(x => typeof x==='string'?x:x?.instId)` คงรับ instId เก่าได้ แต่ resolve ด้วย id: `ids.map(id => pets.find(p => p.id === id || p.instId === id)).filter(Boolean)` (รองรับทั้ง id ใหม่ + instId เก่าเผื่อ member ยังไม่ migrate) · key `p.id`

- [ ] **Step 3: ตรวจ build + ลองมือ**

Run: `npm run build` → สำเร็จ · `npm run dev`: หน้า Pets แสดงคลัง (1/ชนิด) + ดาว active ถูก, เปิด detail ได้ · ProfileModal คนอื่นโชว์ทีม

- [ ] **Step 4: Commit**

```bash
git add src/views/PetsView.vue src/components/members/ProfileModal.vue
git commit -m "Pet: PetsView/ProfileModal ใช้ species id + โชว์ copies"
```

---

## Task 7: ShopView buy() merge-by-id (+copies)

**Files:**
- Modify: `src/views/ShopView.vue`
- Modify: `src/data/shop.js` (rollPetFromEgg ใช้ getPetDef refresh identity)

**Interfaces:**
- Consumes: pet `copies`/species model

> เฟส A ยังใช้ไข่เดิม (กาชาเต็มรูปแบบ=เฟส B) แต่ต้องไม่ push instance ซ้ำชนิด — ถ้าได้ชนิดที่มีแล้ว → +1 copy

- [ ] **Step 1: rollPetFromEgg refresh identity (data/shop.js)**
ใน `rollPetFromEgg` return object: เพิ่ม `copies: 0` และคง field จาก `base` (catalog). (ลบ field `rate` ที่ไม่มีแล้วไม่กระทบ — มันอ่าน `base.id/name/emoji/rarity/element` ตรง)

- [ ] **Step 2: ShopView buy() merge-by-id**
ใน `buy()` แทนการ push instance ใหม่เสมอ ด้วย merge:
```js
  const pet = rollPetFromEgg(egg.id)
  const existing = pets.value.find(p => p.id === pet.id)
  const newPets = existing
    ? pets.value.map(p => p.id === pet.id ? { ...p, copies: (p.copies||0)+1 } : p)
    : [...pets.value, pet]
```
- เปลี่ยน optimistic/updateDoc ให้เขียน `pets: newPets` (แทน `arrayUnion(pet)`) — ใช้ `pets: newPets` ทั้ง optimistic และ updateDoc (ไม่ใช้ arrayUnion แล้ว เพราะต้อง merge)
- `reveal.value = pet` คงเดิม (โชว์ตัวที่ได้) · ถ้า existing อาจ toast "ได้ตัวซ้ำ +1 copy"
- storage cap: นับ `pets.value.length` (จำนวนชนิด) เทียบ cap เหมือนเดิม — ตัวซ้ำไม่กินช่อง (merge) → ปรับเช็ก: ถ้า `!existing && pets.value.length >= storageCap` → เต็ม (ตัวซ้ำ merge ได้เสมอ)

- [ ] **Step 3: ตรวจ build + ลองมือ**

Run: `npm run build` → สำเร็จ · `npm run dev`: ซื้อไข่ได้ตัวใหม่เข้าคลัง, ซื้อได้ตัวซ้ำ → copies+1 (ไม่เพิ่มช่อง)

- [ ] **Step 4: Commit**

```bash
git add src/views/ShopView.vue src/data/shop.js
git commit -m "Pet: ซื้อไข่ merge-by-id (ตัวซ้ำ→+copies ไม่กินช่อง)"
```

---

## Task 8: ดึง emoji ใหม่ (fetch-fluent + phoenix fallback)

**Files:**
- Run: `scripts/fetch-fluent.mjs` (สแกน data → ดึง SVG ลง `public/emoji/fluent/`)
- Modify (ถ้าจำเป็น): self-host phoenix 🐦‍🔥

- [ ] **Step 1: รัน fetch-fluent**

Run: `node scripts/fetch-fluent.mjs`
Expected: ดึง emoji ใหม่ (🦖👹🐳🦣🧞🧚) ลง `public/emoji/fluent/<codepoint>.svg` · ตรวจ log ว่าตัวไหน "ไม่พบ"

- [ ] **Step 2: phoenix 🐦‍🔥 fallback (ถ้า fetch-fluent ไม่พบ)**
ถ้า log บอก phoenix (codepoint `1f426-200d-1f525`) ไม่มีใน Fluent → ดึง SVG จาก Twemoji manual: บันทึกไฟล์ `public/emoji/fluent/1f426-200d-1f525.svg` (จาก `https://cdn.jsdelivr.net/gh/jdecked/twemoji@latest/assets/svg/1f426-200d-1f525.svg` หรือ source ที่โปรเจกต์ใช้) ให้ `<Emoji char="🐦‍🔥">` หาเจอ
- ตรวจ `src/utils/emoji.js` `fluentFile()` ว่าแปลง codepoint phoenix ถูก (ZWJ sequence)

- [ ] **Step 3: ตรวจ build + ลองมือ**

Run: `npm run build` → สำเร็จ · `npm run dev`: เพ็ทใหม่ทั้ง 6 + phoenix แสดง emoji ครบ ไม่เป็น tofu

- [ ] **Step 4: Commit**

```bash
git add public/emoji/fluent/ src/utils/emoji.js
git commit -m "Pet: ดึง emoji เพ็ทใหม่ (Fluent) + phoenix 🐦‍🔥 self-host"
```

---

## สรุป deploy หลัง merge
- push master → GitHub Actions auto-deploy · **ไม่แตะ rules/index**
- ⚠️ migration รันอัตโนมัติตอน user โหลดครั้งแรก — เทสกับ account จริงหลัง deploy (เพ็ทเดิม merge/คืนเหรียญถูก, activePets ยังตั้งทีมได้)

## Self-review note
- ลำดับ: 1(catalog/grade) → 2(petGrade) → 3(petMigration) → 4(runner) → 5(PetDetailModal) → 6(PetsView/ProfileModal) → 7(Shop) → 8(emoji)
- Task 5 ซับซ้อนสุด (rewrite modal) · Task 4 = migration runner (เสี่ยง — เทสจริง)
