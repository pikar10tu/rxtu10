# P3a — ทะเบียนเพ็ท 33 ตัว Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** ใส่เพ็ทใหม่ 6 ตัวลงทะเบียน (ยังหมุนไม่ออก) · แจกกลไกใหม่ให้เพ็ทเดิมที่เหลือ 5 ตัว · เปลี่ยนชื่อพาสสีฟ 4 ตัว โดยเกมเดิมไม่พังและเพ็ทใหม่ต้องหลุดออกทางไหนไม่ได้เลย

**Architecture:** `PETS` เป็นคลังเต็ม 33 ตัว · เพ็ทใหม่ติด `wave: 2` · ทุกทางที่ "แจกเพ็ทให้ผู้เล่น" อ่านผ่านฟังก์ชันบริสุทธิ์ `releasedPets()` ตัวเดียว · ทีมบอทหอคอยล็อก wave 1 ถาวรเพื่อให้ผลสุ่มนิ่ง · พาสสีฟทั้งหมดเป็น data ล้วนใน `petPassives.js` ยกเว้นการเปลี่ยนนิยาม `giantSlayer` 1 จุดในเอนจิน

**Tech Stack:** Vue 3 + Pinia + Firebase (Firestore) · เทสเป็น `node:test` ล้วน ไม่มี framework เพิ่ม · build ด้วย Vite

**สเปก:** `docs/superpowers/specs/2026-09-10-passive-v2-p3-design.md` (อ่านก่อนเริ่ม — โดยเฉพาะ §2, §3, §5, §8)

## Global Constraints

- **branch `passive-v2-p3` เท่านั้น ห้าม merge เข้า `master` จนกว่า P3b จะเสร็จ** — Actions deploy ทันทีที่ push master
- **เทสต้องเขียวครบทุกคอมมิต** — ฐานคือ **1,115 ผ่าน** · รัน `node --test $(find src -name "*.test.js")`
- **`node scripts/death-audit.mjs` ต้องได้ 0 ไฟต์ทุกคอมมิตที่แตะเอนจินหรือพาสสีฟ**
- **ห้ามพิมพ์ตัวเลขลง `desc`/`short`** — ใช้ตัวแปรแม่แบบ `{pct}` `{count}` `{max}` เสมอ (ค่าจริงมาจาก `value`/`step`)
  ข้อยกเว้นที่อนุญาต 2 จุด: "ทุก 10%" ของ 🐗 และ "สองเท่า" ของ 🐢 — เป็นค่าคงที่ของเอนจินที่จูนไม่ได้
- **CLAUDE.md ข้อ 16:** ข้อความพาสสีฟต้องกระชับ อ่านรอบเดียวเข้าใจ บอกตัวเลขตรงๆ · `short` ~40–60 ตัวอักษร ·
  ใช้คำที่ผู้เล่นพูด ("ชั้น" ไม่ใช่ stack · "ทั้งทีม" ไม่ใช่ aura · "ทะลุเกราะ" ไม่ใช่ pierce)
- **ห้ามใส่ `atkStyle`/`projectile` ให้เพ็ทใหม่** — `atkStyleOf()` คืน `'melee'` เสมอและมีเทสล็อกไว้
- **ห้ามเพิ่มจำนวน beat** — พาสสีฟแนบเป็น event บน beat ที่มีอยู่ (`killChain` เป็นข้อยกเว้นเดียวและไม่มีใครเพิ่มในเฟสนี้)
- **`step` ตั้งให้ขั้น 3 ≈ 1.5–1.8 เท่าของขั้น 1** · `step: 0` = อัพขั้นไม่เพิ่มค่านี้
- **1 เพ็ท = 1 commit** — P4 ต้องย้อนทีละตัวได้เมื่อ sim ชี้ว่าตัวไหนพัง
- **ยูนิตทดสอบที่ต้องการตัวประกอบที่ "ไม่มีพาสสีฟเลย" ให้ใช้ `id: 'blank'`** (แพทเทิร์นที่เทสในรีโปใช้อยู่แล้ว)
  ห้ามใช้ `mouse` เป็นตัวประกอบอีกต่อไป — Task 13 ทำให้มันขโมยสเตตัสตอนเริ่มไฟต์

---

## File Structure

| ไฟล์ | หน้าที่ | สถานะ |
|---|---|---|
| `src/utils/petCatalog.js` | ด่านเดียวที่ตอบว่า "ตอนนี้เพ็ทตัวไหนแจกให้ผู้เล่นได้" | **สร้างใหม่** |
| `src/utils/petCatalog.test.js` | เทสของด่านนั้น | **สร้างใหม่** |
| `src/data/index.js` | คลังเพ็ท 33 ตัว + ฟิลด์ `wave` | แก้ |
| `src/data/petPassives.js` | พาสสีฟทั้งหมด (data ล้วน) + ทะเบียนป้าย | แก้ |
| `src/utils/battlePassives.js` | เอนจินพาสสีฟ — แก้จุดเดียว: `giantSlayer` | แก้ |
| `src/data/towerFloors.js` | ทีมบอทหอคอย — ล็อก wave 1 | แก้ |
| `src/views/ShopView.vue` · `src/components/shop/LabTab.vue` · `src/views/PetsView.vue` · `src/composables/useAchievements.js` | ผู้บริโภคคลังเพ็ท | แก้ |
| `public/emoji/fluent/*.svg` | อีโมจิ self-host | เพิ่มไฟล์ |

---

### Task 1: ด่านคลังเพ็ท `releasedPets()`

**Files:**
- Create: `src/utils/petCatalog.js`
- Create: `src/utils/petCatalog.test.js`

**Interfaces:**
- Consumes: `PETS` จาก `src/data/index.js` (วันนี้ 27 ตัว ยังไม่มีฟิลด์ `wave`)
- Produces:
  - `wave1Pets(): PetDef[]` — เพ็ทที่ `wave` ไม่ใช่ 2 (คือ `undefined` หรือ 1)
  - `releasedPets(gachaEvent?: {endsAt?: number|{seconds:number}} | null, now?: number): PetDef[]`

- [ ] **Step 1: เขียนเทสที่ยังแดง**

สร้าง `src/utils/petCatalog.test.js`:

```js
// เทสด่านคลังเพ็ท — pure · รัน: node --test src/utils/petCatalog.test.js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { wave1Pets, releasedPets } from './petCatalog.js'
import { PETS } from '../data/index.js'

test('ไม่มีอีเวนต์ = แจกได้แค่ wave 1 (ดีฟอลต์ปลอดภัย)', () => {
  const ids = releasedPets(null).map(p => p.id)
  assert.deepEqual(ids, wave1Pets().map(p => p.id))
  assert.ok(ids.length > 0)
  assert.ok(PETS.every(p => p.wave === 2 || ids.includes(p.id)))
})

test('อีเวนต์ยังไม่หมดเวลา = ตู้ปกติยังเป็น wave 1', () => {
  const ev = { endsAt: 2_000 }
  assert.deepEqual(releasedPets(ev, 1_000).map(p => p.id), wave1Pets().map(p => p.id))
})

test('หมดเวลาแล้ว = ได้ครบทั้งคลังโดยไม่ต้องกดปุ่มแอดมิน', () => {
  const ev = { endsAt: 1_000 }
  assert.equal(releasedPets(ev, 2_000).length, PETS.length)
})

test('endsAt แบบ Firestore Timestamp ({seconds}) อ่านได้เหมือนกัน', () => {
  const ev = { endsAt: { seconds: 1 } }                 // = 1,000ms
  assert.equal(releasedPets(ev, 2_000).length, PETS.length)
  assert.deepEqual(releasedPets(ev, 500).map(p => p.id), wave1Pets().map(p => p.id))
})

test('อีเวนต์รูปพัง/ไม่มี endsAt = ถือว่ายังไม่เปิด (ห้าม fail-open)', () => {
  for (const ev of [{}, { endsAt: null }, { endsAt: 'พรุ่งนี้' }, 'ไม่ใช่ออบเจกต์']) {
    assert.deepEqual(releasedPets(ev, 9e12).map(p => p.id), wave1Pets().map(p => p.id))
  }
})

test('ลำดับในคลังไม่สลับ — ผลสุ่มของทุกระบบอ่านด้วยดัชนี', () => {
  const ids = releasedPets(null).map(p => p.id)
  assert.deepEqual(ids, PETS.filter(p => p.wave !== 2).map(p => p.id))
})
```

- [ ] **Step 2: รันให้เห็นว่าแดง**

Run: `node --test src/utils/petCatalog.test.js`
Expected: FAIL — `Cannot find module './petCatalog.js'`

- [ ] **Step 3: เขียน implementation ให้น้อยที่สุดที่ผ่าน**

สร้าง `src/utils/petCatalog.js`:

```js
// src/utils/petCatalog.js
// ด่านเดียวที่ตอบว่า "ตอนนี้เพ็ทตัวไหนแจกให้ผู้เล่นได้" — pure ทั้งหมด ไม่แตะ store/Firestore
// สเปก: docs/superpowers/specs/2026-09-10-passive-v2-p3-design.md §2
//
// 🔑 `wave` คือ "รุ่นที่เข้าเกม" ไม่ใช่ "ยังไม่เปิด" — ฟิลด์นี้อยู่ถาวร ไม่ถูกลบตอนเปิดตัว (P5)
//    ของที่ต้องนิ่งตลอดกาล (ทีมบอทหอคอย) อ้าง `wave1Pets()` · ของที่เปิดตามอีเวนต์อ้าง `releasedPets()`
//
// 🔴 ดีฟอลต์ต้องปิดเสมอ: ไม่มี config / config รูปพัง = คืนแค่ wave 1
//    (flag ใน Firestore เป็นค่าที่เดาจากรีโปไม่ได้ — fail-open แปลว่าเพ็ทที่ยังไม่เปิดตัวหลุดออกกาชาเงียบๆ)
import { PETS } from '../data/index.js'

/** ms จาก endsAt ที่รับได้ทั้งเลขล้วนและ Firestore Timestamp — อ่านไม่ออกคืน null (= ยังไม่เปิด) */
function endsAtMs(gachaEvent) {
  const raw = gachaEvent && typeof gachaEvent === 'object' ? gachaEvent.endsAt : null
  if (typeof raw === 'number' && Number.isFinite(raw)) return raw
  if (raw && typeof raw === 'object' && typeof raw.seconds === 'number') return raw.seconds * 1000
  return null
}

/** เพ็ทรุ่นแรก 27 ตัว — คลังที่ต้องนิ่งตลอดกาล */
export const wave1Pets = () => PETS.filter(p => p.wave !== 2)

/** เพ็ทที่ "แจกให้ผู้เล่นได้" ตอนนี้ · อีเวนต์หมดเวลาแล้ว = ไหลเข้าคลังปกติเองโดยไม่ต้องกดปุ่ม */
export function releasedPets(gachaEvent = null, now = Date.now()) {
  const ends = endsAtMs(gachaEvent)
  if (ends !== null && now > ends) return PETS.slice()
  return wave1Pets()
}
```

- [ ] **Step 4: รันให้เขียว**

Run: `node --test src/utils/petCatalog.test.js`
Expected: PASS ทั้ง 6 เทส

- [ ] **Step 5: Commit**

```bash
git add src/utils/petCatalog.js src/utils/petCatalog.test.js
git commit -m "Pets: ด่านเดียวที่ตอบว่าเพ็ทตัวไหนแจกได้ (releasedPets)"
```

---

### Task 2: เดินสายผู้บริโภคทั้งหมด + ล็อกหอคอยเป็น wave 1

**Files:**
- Modify: `src/data/towerFloors.js:82-83`
- Modify: `src/views/ShopView.vue:170, 216-217, 243` และบรรทัดตัวหารในเทมเพลต (`PETS.length`)
- Modify: `src/components/shop/LabTab.vue:106`
- Modify: `src/views/PetsView.vue:24`
- Modify: `src/composables/useAchievements.js:18`
- Test: `src/data/towerFloors.test.js`

**Interfaces:**
- Consumes: `wave1Pets()`, `releasedPets()` จาก Task 1
- Produces: ไม่มี API ใหม่ — พฤติกรรมวันนี้ต้องเหมือนเดิมเป๊ะ (คลังยังมี 27 ตัวเท่ากัน)

**หมายเหตุสำคัญ:** งานนี้ต้อง **ไม่เปลี่ยนพฤติกรรมอะไรเลย** เพราะยังไม่มีเพ็ท wave 2 — คุณค่าของมันคือ
"ด่านอยู่ที่เดิมก่อนของใหม่จะเข้ามา" · Task 3 คือตัวพิสูจน์ว่าด่านทำงาน

- [ ] **Step 1: เขียนเทสหอคอยที่ตรึงทีมบอทไว้กับ wave 1**

เติมท้าย `src/data/towerFloors.test.js`:

```js
test('ทีมบอททุกชั้นมาจาก wave 1 เท่านั้น — คลังโตแล้วผลสุ่มห้ามขยับ', async () => {
  const { wave1Pets } = await import('../utils/petCatalog.js')
  const ids = new Set(wave1Pets().map(p => p.id))
  for (let f = 1; f <= TOWER_MAX; f++) {
    for (const p of getFloorTeam(f)) {
      assert.ok(ids.has(p.id), `ชั้น ${f} ได้ ${p.id} ซึ่งไม่ใช่ wave 1`)
    }
  }
})
```

- [ ] **Step 2: รันให้เห็นว่าเขียวอยู่แล้ว (ยังไม่มี wave 2 = ยังไม่พิสูจน์อะไร)**

Run: `node --test src/data/towerFloors.test.js`
Expected: PASS — บันทึกไว้ว่านี่คือเทสที่จะ **แดงทันที** ถ้า Task 3 ลืมกรอง

- [ ] **Step 3: เปลี่ยนหอคอยให้อ่าน wave 1**

ใน `src/data/towerFloors.js` เปลี่ยน import และสองบรรทัดที่สร้าง pool:

```js
import { wave1Pets } from '../utils/petCatalog.js'
```

```js
    // 🔴 ล็อก wave 1 ถาวร ไม่ใช่ releasedPets() — ดัชนีสุ่มอ่านจากความยาวคลัง
    //    คลังโตขึ้นเมื่อไร ทีมบอท "ทุกชั้น" สลับตัวทันที ชั้นที่ผู้เล่นเคยผ่านจะกลายเป็นอีกโจทย์
    const catalog = wave1Pets()
    const pool = catalog.filter(p => p.rarity === rarity && p.element === element)
    const fallback = catalog.filter(p => p.element === element)
```

(บรรทัด `import { PETS } from './index.js'` ลบได้ถ้าไม่มีใครใช้แล้ว — เช็คด้วย `grep -n "PETS" src/data/towerFloors.js`)

- [ ] **Step 4: เดินสายผู้บริโภคที่เหลือ**

`src/views/ShopView.vue` — เพิ่ม import และ computed:

```js
import { releasedPets } from '../utils/petCatalog.js'
import { useAppConfig } from '../composables/useAppConfig.js'
```

```js
const { rawConfig } = useAppConfig()
// คลังที่ "แจกได้" ตอนนี้ — เพ็ทที่ยังไม่เปิดตัวต้องไม่โผล่ในกาชา/เป้าการันตี/ตัวหาร
const catalog = computed(() => releasedPets(rawConfig.value?.gachaEvent))
const legendaries = computed(() => catalog.value.filter((p) => p.rarity === 'legendary'))
```

- `pull()`: เปลี่ยน `rollMany(rolls, state, PETS)` → `rollMany(rolls, state, catalog.value)`
- `mergeRolls(pets.value, results, PETS)` **คงไว้เป็น `PETS`** — เป็นการหา identity ของ id ที่สุ่มมาแล้ว
  ไม่ใช่การเลือกว่าจะแจกอะไร (ถ้ากรองตรงนี้ วันเปิดตัวเพ็ทใหม่จะ merge ไม่เข้า)
- `PETS.find((p) => p.id === leg.id)` (ข่าวกระดาน) **คงไว้เป็น `PETS`** ด้วยเหตุผลเดียวกัน
- เทมเพลต `{{ pets.length }}/{{ PETS.length }}` → `{{ pets.length }}/{{ catalog.length }}`
- `legendaries` กลายเป็น computed แล้ว ⇒ ที่อ้างในเทมเพลต/`targetPet` ต้องเป็น `legendaries.value` ในสคริปต์

`src/components/shop/LabTab.vue`:

```js
import { releasedPets } from '../../utils/petCatalog.js'
import { useAppConfig } from '../../composables/useAppConfig.js'
```

```js
const { rawConfig } = useAppConfig()
```

- `fuseRoll(rarity, PETS)` → `fuseRoll(rarity, releasedPets(rawConfig.value?.gachaEvent))`
- `mergeRolls(petsAfter, [{ id }], PETS)` **คงไว้เป็น `PETS`**

`src/views/PetsView.vue`:

```js
import { releasedPets } from '../utils/petCatalog.js'
import { useAppConfig } from '../composables/useAppConfig.js'
```

```js
const { rawConfig } = useAppConfig()
const catalog = computed(() => releasedPets(rawConfig.value?.gachaEvent))
```

- เทมเพลต `{{ pets.length }}/{{ PETS.length }}` → `{{ pets.length }}/{{ catalog.length }}`
- `defOf(id)` **คงไว้เป็น `PETS`** — ต้องหาเพ็ทที่ผู้เล่นถืออยู่ให้เจอเสมอ

`src/composables/useAchievements.js`:

```js
import { releasedPets } from '../utils/petCatalog.js'
```

```js
// allSpecies = จำนวนที่ "หมุนได้จริง" ไม่ใช่ทั้งคลัง — ไม่งั้นเควสเก็บครบทำไม่ได้ทั้งชั้นปีตอนมีเพ็ทที่ยังไม่เปิด
const ctx = () => ({ allSpecies: releasedPets().length, maxResidence: MAX_RESIDENCE_LEVEL })
```

- [ ] **Step 5: รันเทสทั้งชุด + build**

Run: `node --test $(find src -name "*.test.js")`
Expected: PASS 1,116 (1,115 เดิม + เทสหอคอยใหม่)

Run: `npm run build`
Expected: build ผ่าน ไม่มี error เรื่อง import

- [ ] **Step 6: Commit**

```bash
git add -A src
git commit -m "Pets: ทุกทางที่แจกเพ็ทอ่านผ่าน releasedPets · หอคอยล็อก wave 1 ถาวร"
```

---

### Task 3: เพ็ทใหม่ 6 ตัวเข้าคลัง (⚠️ ย้ายไปทำ **หลัง Task 10** — ดูกล่องด้านล่าง)

> 🔴 **แก้ลำดับตอนลงมือจริง (10 ก.ย.):** `battlePassives.test.js:34` มีเทสเดิมบังคับว่า
> **เพ็ททุกตัวในคลังต้องมีพาสสีฟ** ⇒ ใส่เพ็ทเข้าคลังก่อนแขวนพาสสีฟ = เทสแดงตลอด 6 คอมมิต
> ซึ่งขัดกฎ "เทสเขียวทุกคอมมิต" · เทสนั้นเป็นทางเดียว (คลัง → พาสสีฟ) ⇒ **แขวนพาสสีฟก่อนได้**
> ⇒ ลำดับจริง: Task 4 → Task 5–10 (พาสสีฟ 6 ตัว) → **Task 3** (เข้าคลัง) → Task 11–16

**Files:**
- Modify: `src/data/index.js:33-65`
- Test: `src/utils/petCatalog.test.js`

**Interfaces:**
- Consumes: `wave1Pets()`/`releasedPets()` จาก Task 1
- Produces: id ใหม่ 6 ตัวที่ Task 5–10 จะแขวนพาสสีฟทับ — `lion` `virus` `gorilla` `boar` `badger` `bat`

- [ ] **Step 1: เขียนเทสที่ยังแดง**

เติมท้าย `src/utils/petCatalog.test.js`:

```js
const WAVE2 = ['lion', 'virus', 'gorilla', 'boar', 'badger', 'bat']

test('เพ็ทรุ่น 2 อยู่ในคลัง 33 ตัว แต่แจกไม่ได้จนกว่าอีเวนต์จะหมดเวลา', () => {
  assert.equal(PETS.length, 33)
  const live = new Set(releasedPets(null).map(p => p.id))
  for (const id of WAVE2) {
    assert.ok(PETS.some(p => p.id === id), `${id} ไม่อยู่ในคลัง`)
    assert.equal(live.has(id), false, `${id} หลุดออกมาแจกได้`)
  }
  assert.equal(releasedPets(null).length, 27)
})

test('สัดส่วนชั้น/สายของคลังเต็มตรงสเปก (11/11/11 · 12 legend · 9 epic)', () => {
  const by = (k, v) => PETS.filter(p => p[k] === v).length
  assert.equal(by('element', 'fist'), 11)
  assert.equal(by('element', 'scissors'), 11)
  assert.equal(by('element', 'paper'), 11)
  assert.equal(by('rarity', 'legendary'), 12)
  assert.equal(by('rarity', 'epic'), 9)
  assert.equal(by('rarity', 'rare'), 6)
  assert.equal(by('rarity', 'common'), 6)
})

test('เพ็ทรุ่น 2 ห้ามมี atkStyle/projectile (ทุกตัวเป็น melee หมดแล้ว)', () => {
  for (const p of PETS.filter(p => p.wave === 2)) {
    assert.equal(p.atkStyle, undefined, `${p.id} มี atkStyle`)
    assert.equal(p.projectile, undefined, `${p.id} มี projectile`)
  }
})
```

- [ ] **Step 2: รันให้เห็นว่าแดง**

Run: `node --test src/utils/petCatalog.test.js`
Expected: FAIL — `PETS.length` ได้ 27 ไม่ใช่ 33

- [ ] **Step 3: เติมเพ็ทลงคลัง**

ใน `src/data/index.js` เติมในหมวดของแต่ละชั้น (ต่อท้ายกลุ่มเดิมของชั้นนั้น):

```js
  // ── LEGENDARY ── (ต่อท้ายกลุ่ม legendary เดิม)
  { id:"lion",      emoji:"🦁", name:"สิงโต",     rarity:"legendary", element:"fist",     wave:2, flavor:"เจ้าป่าตัวจริงคุมได้ทั้งสามสาย เหมือนคุมยาครบสามมื้อ" },
  { id:"virus",     emoji:"👾", name:"ไวรัส",     rarity:"legendary", element:"scissors", wave:2, flavor:"ตัวจิ๋วที่เคยทำทั้งชั้นปีเลื่อนสอบมาแล้ว" },
  { id:"gorilla",   emoji:"🦍", name:"กอริลลา",   rarity:"legendary", element:"paper",    wave:2, flavor:"ตีอกดังลั่นให้ทุกคนหันมา แล้วยืนรับแทนเพื่อนทั้งกลุ่ม" },
  // ── EPIC ── (ต่อท้ายกลุ่ม epic เดิม)
  { id:"boar",      emoji:"🐗", name:"หมูป่า",     rarity:"epic", element:"fist",     wave:2, flavor:"ยิ่งเจ็บยิ่งพุ่ง เหมือนคืนก่อนสอบที่ยิ่งดึกยิ่งอ่านเร็ว" },
  { id:"badger",    emoji:"🦡", name:"แบดเจอร์",   rarity:"epic", element:"scissors", wave:2, flavor:"ตัวเล็กแต่ไม่เคยถอย ยิ่งเป้าตัวใหญ่ยิ่งชอบ" },
  { id:"bat",       emoji:"🦇", name:"ค้างคาว",    rarity:"epic", element:"paper",    wave:2, flavor:"ห้อยหัวอ่านชีทตอนตีสาม แบ่งเลือด (และชีท) ให้เพื่อนทั้งทีม" },
```

- [ ] **Step 4: รันเทสทั้งชุด**

Run: `node --test $(find src -name "*.test.js")`
Expected: PASS — โดยเฉพาะ **เทสหอคอยจาก Task 2 ต้องยังเขียว** (ถ้าแดง แปลว่าหอคอยยังอ่านคลังเต็มอยู่)

⚠️ ถ้าเทสตัวไหนแดงเพราะนับจำนวนเพ็ท ให้ดูก่อนว่ามันควรนับ "ทั้งคลัง" หรือ "ที่แจกได้" แล้วแก้ให้ตรงเจตนา
ห้ามแก้ตัวเลขคาดหวังลอยๆ

- [ ] **Step 5: Commit**

```bash
git add -A src
git commit -m "Pets: เพ็ทรุ่น 2 หกตัวเข้าคลัง (wave 2 — ยังแจกไม่ได้)"
```

---

### Task 4: `giantSlayer` เปลี่ยนเป็นธรณีประตูเดียว

**Files:**
- Modify: `src/utils/battlePassives.js:382-392` (เคส `giantSlayer`) และดอคบล็อกของ `ev()` บรรทัด ~58
- Modify: `src/data/petPassives.js` (`STATUS_TEXT.giantSlayer`)
- Test: `src/utils/battlePassives.test.js:343-374, 376-398`

**Interfaces:**
- Consumes: `runOnAttack(att, target, foes, rand)` เดิม
- Produces: สัญญาใหม่ของ `giantSlayer` — `value: { pct }` เท่านั้น (**คีย์ `max` ถูกลบ**) ·
  Task 9 (🦡 แบดเจอร์) พึ่งสัญญานี้

- [ ] **Step 1: แก้เทสเดิมให้บังคับพฤติกรรมใหม่**

ใน `src/utils/battlePassives.test.js` **แทนที่** เทสชื่อ `'giantSlayer: เป้าตัวใหญ่กว่ายิ่งแรง แต่ชนเพดาน'`
และ `'giantSlayer: เส้นพอดี 1.2×/1.4× ต้องไม่ตกขั้นเพราะ float …'` ด้วยตัวเดียวนี้:

```js
test('giantSlayer: เป้าใหญ่กว่าตัวเอง = +pct% คงที่ · ไม่ไต่ขั้น ไม่มีเพดาน', () => {
  PET_PASSIVES.__badger = {
    name: 'ทดสอบแบดเจอร์', icon: '🧪',
    parts: [{ hook: 'onAttack', effect: 'giantSlayer', value: { pct: 25 }, step: { pct: 0 } }],
    desc: 'ล้มยักษ์ +{pct}%', short: 'ล้มยักษ์ +{pct}%',
  }
  try {
    const me = { uid: 'A0', side: 'A', id: '__badger', hp: 100, maxHp: 100, atk: 10 }
    const foe = (maxHp) => ({ uid: 'B0', side: 'B', id: 'blank', hp: maxHp, maxHp, atk: 10 })
    const mult = (maxHp) => Math.round(runOnAttack(me, foe(maxHp), [foe(maxHp)], () => 0.5).atkMult * 100) / 100
    assert.equal(mult(80), 1)      // เล็กกว่า = ไม่ได้อะไร
    assert.equal(mult(100), 1)     // เท่ากันเป๊ะ = ไม่ได้อะไร (ธรณีประตูคือ "มากกว่า" เท่านั้น)
    assert.equal(mult(101), 1.25)  // ใหญ่กว่านิดเดียวก็ได้เต็ม
    assert.equal(mult(500), 1.25)  // ใหญ่กว่ามากก็ยังเท่าเดิม ไม่ไต่ขั้น
    // เป้าเล็กกว่า = ไม่มี event ให้จอเล่า
    assert.equal(runOnAttack(me, foe(80), [foe(80)], () => 0.5).events.length, 0)
  } finally { delete PET_PASSIVES.__badger }
})
```

ในเทส `'berserk/giantSlayer: fxKind buff ใช้กติกาเดียวกัน …'` แก้ 3 จุด:
- `value: { pct: 5, max: 50 }, step: { pct: 0, max: 0 }` → `value: { pct: 25 }, step: { pct: 0 }`
- `assert.equal(e2.amount, 50)` → `assert.equal(e2.amount, 25)`
- คอมเมนต์ท้ายบรรทัดเดิม (`ชนเพดาน 50%`) → `// % คงที่ของธรณีประตู ไม่ใช่จำนวนขั้น`

- [ ] **Step 2: รันให้เห็นว่าแดง**

Run: `node --test src/utils/battlePassives.test.js`
Expected: FAIL — `mult(101)` ได้ 1 (ของเดิมต้องใหญ่กว่า 10% ถึงจะได้ขั้นแรก)

- [ ] **Step 3: แก้เอนจิน**

ใน `src/utils/battlePassives.js` แทนที่เคส `giantSlayer` ทั้งบล็อกด้วย:

```js
      case 'giantSlayer': {
        // ธรณีประตูเดียว: เป้ามี maxHp มากกว่าเรา → +pct% คงที่ (user เคาะ 10 ก.ย. 2026)
        // 🔑 ของเดิมไต่ขั้นละ 10% + เพดาน `max` — เปลี่ยนเพราะอ่านบนการ์ดแล้วต้องเข้าใจทันที
        //    และตัดคำถาม "ใหญ่กว่ากี่ % ถึงนับ" ออกจากหัวผู้เล่น · คีย์ `max` ถูกลบทั้งสัญญา
        if (!target) break
        if (target.maxHp <= att.maxHp) break
        res.atkMult *= 1 + v.pct / 100
        res.events.push(ev(att, p, part, { targets: [att.uid], amount: Math.round(v.pct), fxKind: 'buff' }))
        break
      }
```

แก้ดอคบล็อกของ `ev()` (บรรทัดที่เขียนว่า `⚠️ giantSlayer ห้ามส่งเป็น "จำนวนขั้น" เพราะมันมีเพดาน max …`) เป็น:

```js
 *       ⚠️ `giantSlayer` ส่งเป็น % คงที่ของธรณีประตู (ไม่มีขั้น ไม่มีเพดานตั้งแต่ 10 ก.ย. 2026)
```

⚠️ **ห้ามลบ `stepsOf10()`** — 🐗 `berserk` ยังใช้อยู่

แก้ `src/data/petPassives.js`:

```js
  giantSlayer: 'ตีเป้าตัวใหญ่กว่าแรงขึ้น',
```

- [ ] **Step 4: รันให้เขียว**

Run: `node --test $(find src -name "*.test.js")`
Expected: PASS ทั้งชุด

Run: `node scripts/death-audit.mjs`
Expected: 0 ไฟต์

- [ ] **Step 5: Commit**

```bash
git add -A src
git commit -m "Passive: ล้มยักษ์เป็นธรณีประตูเดียว (เป้าใหญ่กว่า = แรงขึ้นเท่ากันเสมอ)"
```

---

### Task 5: 🦁 สิงโต — `elementTrinity`

**Files:**
- Modify: `src/data/petPassives.js` (เพิ่มในหมวด Legendary)
- Test: `src/utils/battlePassives.test.js`

**Interfaces:**
- Consumes: `applyAuras(team, foes)` · เคส `elementTrinity` มีในเอนจินแล้ว (`value: { pct, hpPct }`)
- Produces: `PET_PASSIVES.lion`

- [ ] **Step 1: เขียนเทสที่ยังแดง**

เติมใน `src/utils/battlePassives.test.js` (หมวด aura):

```js
test('🦁 สิงโต: ครบ 3 สายได้บัฟทั้งทีม · ขาดสายเดียวไม่ได้อะไรเลย', () => {
  const mk = () => [
    u('lion',     { uid: 'A0', element: 'fist',     atk: 100, maxHp: 1000, hp: 1000 }),
    u('fox',      { uid: 'A1', element: 'scissors', atk: 100, maxHp: 1000, hp: 1000 }),
    u('panda',    { uid: 'A2', element: 'paper',    atk: 100, maxHp: 1000, hp: 1000 }),
  ]
  const full = mk()
  applyAuras(full, [])
  assert.equal(Math.round(full[0].atk), 112)
  assert.equal(Math.round(full[1].maxHp), 1120)
  assert.equal(full[1].hp, full[1].maxHp)          // เลือดเต็มหลอดใหม่

  const missing = [mk()[0], mk()[1], u('hedgehog', { uid: 'A2', element: 'fist', atk: 100, maxHp: 1000, hp: 1000 })]
  applyAuras(missing, [])
  assert.equal(missing[0].atk, 100)
  assert.equal(missing[2].maxHp, 1000)
})

test('🦁 สิงโต: บัฟไม่หายเมื่อเพื่อนต่างสายตายกลางไฟต์ (aura คิดครั้งเดียวตอนเริ่ม)', () => {
  const team = [
    u('lion',  { uid: 'A0', element: 'fist',     atk: 100, maxHp: 1000, hp: 1000 }),
    u('fox',   { uid: 'A1', element: 'scissors', atk: 100, maxHp: 1000, hp: 1000 }),
    u('panda', { uid: 'A2', element: 'paper',    atk: 100, maxHp: 1000, hp: 1000 }),
  ]
  applyAuras(team, [])
  const atkAfterAura = team[0].atk
  team[2].hp = 0                                    // เพื่อนสายพิทักษ์ตาย
  assert.equal(team[0].atk, atkAfterAura)           // ตั้งใจ — เหมือน aura ตัวอื่นทั้งหมด
})
```

- [ ] **Step 2: รันให้เห็นว่าแดง**

Run: `node --test src/utils/battlePassives.test.js`
Expected: FAIL — atk ยัง 100 (ยังไม่มีพาสสีฟของสิงโต)

- [ ] **Step 3: เพิ่มพาสสีฟ**

ใน `src/data/petPassives.js` หมวด Legendary:

```js
  lion: {
    name: 'อาณัติเจ้าป่า', icon: '👑',
    parts: [{ hook: 'aura', effect: 'elementTrinity', value: { pct: 12, hpPct: 12 },
              step: { pct: 3, hpPct: 3 } }],
    desc: 'ทีมมีครบทั้ง 3 สาย → ทั้งทีมพลังโจมตี +{pct}% และเลือดสูงสุด +{hpPct}%',
    short: 'ครบ 3 สาย → ทั้งทีมแรง +{pct}% เลือด +{hpPct}%',
  },
```

- [ ] **Step 4: รันให้เขียว**

Run: `node --test $(find src -name "*.test.js")` → PASS
Run: `node scripts/death-audit.mjs` → 0 ไฟต์

- [ ] **Step 5: Commit**

```bash
git add -A src
git commit -m "Passive: 🦁 สิงโต — ทีมครบสามสายแล้วแรงขึ้นทั้งทีม"
```

---

### Task 6: 👾 ไวรัส — `infect`

**Files:**
- Modify: `src/data/petPassives.js` (หมวด Legendary)
- Test: `src/utils/battlePassives.test.js`

**Interfaces:**
- Consumes: `runOnHit(defender, dmg, attacker, team, rand, forced)` · เคส `infect`/`infectBurst`/`infectSpread`
  มีในเอนจินแล้ว (`value: { pct, max }`) · state อยู่ที่ `psOf(target).infect = { n, from }`
- Produces: `PET_PASSIVES.virus`

- [ ] **Step 1: เขียนเทสที่ยังแดง**

```js
test('👾 ไวรัส: ชั้นขึ้นจากหมัดไวรัสเท่านั้น · ชนเพดาน · เพื่อนตีก็ระเบิด · ทะลุทุกสายลด', () => {
  const virus = u('virus', { uid: 'A0', atk: 100 })
  const mate  = u('blank', { uid: 'A1', atk: 100 })
  const foe   = u('turtle', { uid: 'B0', side: 'B', element: 'paper', atk: 10, maxHp: 1000, hp: 1000 })

  // เพื่อนตีก่อน: ยังไม่มีเชื้อ ⇒ ไม่มีชั้น ไม่มีระเบิด
  const first = runOnHit(foe, 50, mate, [foe], () => 0.99)
  assert.equal(first.pierce, 0)
  assert.equal(psOf(foe).infect, undefined)

  for (let i = 0; i < 7; i++) runOnHit(foe, 50, virus, [foe], () => 0.99)
  assert.equal(psOf(foe).infect.n, 5)               // เพดาน 5 ชั้น

  const res = runOnHit(foe, 50, mate, [foe], () => 0.99)
  assert.equal(Math.round(res.pierce), 40)          // 5 ชั้น × 8% ของ atk ไวรัส (100)
  assert.equal(psOf(foe).infect.n, 5)               // เชื้อไม่หายตอนระเบิด
  const burst = res.events.find(e => e.effect === 'infectBurst')
  assert.ok(burst, 'ต้องมี event ระเบิดให้จอเล่า')
  assert.deepEqual(burst.targets, ['B0'])
})

test('👾 ไวรัส: ดาเมจเชื้อไม่ถูกหักด้วยเกราะ/ลดดาเมจของเป้า (pierce แยกช่องจาก dmg)', () => {
  const virus = u('virus', { uid: 'A0', atk: 100 })
  const foe   = u('turtle', { uid: 'B0', side: 'B', element: 'paper', maxHp: 1000, hp: 1000, teamDrPct: 90 })
  runOnHit(foe, 100, virus, [foe], () => 0.99)      // ชั้นที่ 1
  const res = runOnHit(foe, 100, virus, [foe], () => 0.99)
  assert.ok(res.dmg < 100, 'หมัดหลักต้องถูกลดตามปกติ')
  assert.equal(Math.round(res.pierce), 8)           // 1 ชั้น × 8% — ไม่โดนลด 90% ด้วย
})
```

- [ ] **Step 2: รันให้เห็นว่าแดง**

Run: `node --test src/utils/battlePassives.test.js`
Expected: FAIL — `psOf(foe).infect` เป็น `undefined`

- [ ] **Step 3: เพิ่มพาสสีฟ**

```js
  virus: {
    name: 'เชื้อลุกลาม', icon: '🦠',
    // 🔴 ดาเมจเชื้อ "ทะลุทุกอย่าง" (ช่อง pierce) — เป็นสิทธิพิเศษของตัวนี้ตัวเดียว
    //    ถ้าวันหน้าแจกให้ตัวอื่น มันจะกลายเป็นแค่ "ดาเมจเพิ่ม" อีกอันหนึ่ง และไวรัสจะไม่มีเหตุผลที่จะมีอยู่
    // step.max = 0 — เพดานชั้นเป็นของที่โตแล้วพัง (7 ชั้น = +56% ต่อหมัดของทั้งทีม)
    parts: [{ hook: 'onAttack', effect: 'infect', value: { pct: 8, max: 5 }, step: { pct: 2, max: 0 } }],
    desc: 'ไวรัสตีใคร เป้านั้นติดเชื้อ 1 ชั้น (สูงสุด {max} ชั้น) · ทีมเราตีเป้าที่ติดเชื้อ เจ็บเพิ่มชั้นละ {pct}% ของพลังโจมตีไวรัส ทะลุทุกการป้องกัน',
    short: 'ติดเชื้อสูงสุด {max} ชั้น · ชั้นละ {pct}% ทะลุเกราะ',
  },
```

- [ ] **Step 4: รันให้เขียว**

Run: `node --test $(find src -name "*.test.js")` → PASS
Run: `node scripts/death-audit.mjs` → 0 ไฟต์

- [ ] **Step 5: Commit**

```bash
git add -A src
git commit -m "Passive: 👾 ไวรัส — เชื้อสะสมชั้น ระเบิดทุกหมัดของทั้งทีม ทะลุเกราะ"
```

---

### Task 7: 🦍 กอริลลา — `taunt` + `atkOnHit`

**Files:**
- Modify: `src/data/petPassives.js` (หมวด Legendary)
- Test: `src/utils/battlePassives.test.js`

**Interfaces:**
- Consumes: `tauntTargetOf(foes)` · `runOnHit(..., forced)` · `psOf(u).rage`
- Produces: `PET_PASSIVES.gorilla` — เพ็ทสอง part ตัวที่สาม (ต่อจาก 🐍 🐘) ⇒ กฎจังหวะ §2.4 ทำงานที่นี่

- [ ] **Step 1: เขียนเทสที่ยังแดง**

```js
test('🦍 กอริลลา: ท้าชนดึงเป้ามาที่ตัวเอง และมาก่อน targetLowest ของกริฟฟิน', () => {
  const gori = u('gorilla', { uid: 'B0', side: 'B', hp: 900, maxHp: 1000 })
  const weak = u('blank',   { uid: 'B1', side: 'B', hp: 10,  maxHp: 1000 })
  assert.equal(tauntTargetOf([gori, weak])?.uid, 'B0')

  const griffin = u('simurgh', { uid: 'A0' })
  const res = runOnAttack(griffin, weak, [gori, weak], () => 0.5)
  assert.equal((res.target || weak).uid, 'B0', 'ถูกท้าชนอยู่ ห้ามไปเล็งตัวเลือดน้อย')
})

test('🦍 กอริลลา: กอริลลาสองตัวในทีมเดียว ตัวช่องซ้ายสุดชนะเสมอ (replay ต้องตรง)', () => {
  const g0 = u('gorilla', { uid: 'B0', side: 'B' })
  const g1 = u('gorilla', { uid: 'B1', side: 'B' })
  assert.equal(tauntTargetOf([g0, g1]).uid, 'B0')
  assert.equal(tauntTargetOf([g1, g0]).uid, 'B1')   // ลำดับในทีมคือคำตอบ ไม่ใช่การสุ่ม
})

test('🦍 กอริลลา: หมัดที่ถูกดึงมาเจ็บน้อยลง · โดนตีแล้วสะสมพลังไม่มีเพดาน', () => {
  const gori = u('gorilla', { uid: 'B0', side: 'B', atk: 100, hp: 1000, maxHp: 1000 })
  const att  = u('blank',   { uid: 'A0', atk: 100 })

  const forced = runOnHit(gori, 100, att, [gori], () => 0.99, true)
  assert.equal(Math.round(forced.dmg), 75)          // ลด 25% เฉพาะหมัดที่ถูกบังคับ
  assert.equal(psOf(gori).rage, 1)
  assert.equal(Math.round(gori.atk), 103)           // +3% ต่อครั้งที่โดน

  const free = runOnHit(gori, 100, att, [gori], () => 0.99, false)
  assert.equal(Math.round(free.dmg), 100)           // ไม่ได้ถูกดึงมา = ไม่ลด
  assert.equal(psOf(gori).rage, 2)

  for (let i = 0; i < 20; i++) runOnHit(gori, 100, att, [gori], () => 0.99, false)
  assert.equal(psOf(gori).rage, 22)                 // ไม่มีเพดาน (user ยืนยัน)
})
```

- [ ] **Step 2: รันให้เห็นว่าแดง**

Run: `node --test src/utils/battlePassives.test.js`
Expected: FAIL — `tauntTargetOf` คืน `null`

- [ ] **Step 3: เพิ่มพาสสีฟ**

```js
  gorilla: {
    name: 'ตีอกท้าชน', icon: '🦍',
    // สอง part คนละ hook ⇒ ไม่ชนกันในลูปเดียว · `tag` เพราะทั้งคู่ใช้คีย์ชื่อ pct
    // ⚠️ atkOnHit ไม่มีเพดานโดยตั้งใจ (user เคาะในสเปกแม่) — ป้ายฝั่งจอห้ามพยายามวาด "x/max"
    parts: [
      { hook: 'onRound', effect: 'taunt',    value: { pct: 25 }, step: { pct: 5 }, tag: 'taunt' },
      { hook: 'onHit',   effect: 'atkOnHit', value: { pct: 3 },  step: { pct: 1 }, tag: 'rage' },
    ],
    desc: 'ต้นรอบท้าชนให้ศัตรูตีมาที่ตัวเอง · หมัดที่ถูกดึงมาเจ็บน้อยลง {taunt.pct}% · ทุกครั้งที่โดนตี พลังโจมตี +{rage.pct}% ไม่มีเพดาน',
    short: 'ท้าชน ลดหมัดที่ดึงมา {taunt.pct}% · โดนตี +{rage.pct}%',
  },
```

- [ ] **Step 4: รันให้เขียว**

Run: `node --test $(find src -name "*.test.js")` → PASS
Run: `node scripts/death-audit.mjs` → 0 ไฟต์

- [ ] **Step 5: Commit**

```bash
git add -A src
git commit -m "Passive: 🦍 กอริลลา — ท้าชนดึงหมัดมาที่ตัวเอง ยิ่งโดนยิ่งแรง"
```

---

### Task 8: 🐗 หมูป่า — `berserk`

**Files:**
- Modify: `src/data/petPassives.js` (หมวด Epic)
- Test: `src/utils/battlePassives.test.js`

**Interfaces:**
- Consumes: `runOnAttack` เคส `berserk` (`value: { pct }` · ขั้นละ 10% ของเลือดที่หายไป)
- Produces: `PET_PASSIVES.boar`

- [ ] **Step 1: เขียนเทสที่ยังแดง**

```js
test('🐗 หมูป่า: ดาเมจบวกตาม % เลือดที่หายไปแบบ 1:1', () => {
  const foe = u('blank', { uid: 'B0', side: 'B', maxHp: 1000, hp: 1000 })
  const mult = (hp) => {
    const boar = u('boar', { uid: 'A0', hp, maxHp: 100, atk: 10 })
    return Math.round(runOnAttack(boar, foe, [foe], () => 0.5).atkMult * 100) / 100
  }
  assert.equal(mult(100), 1)      // เลือดเต็ม = ไม่ได้อะไร
  assert.equal(mult(40), 1.6)     // หาย 60% = +60%
  assert.equal(mult(10), 1.9)     // หาย 90% = +90%
})

test('🐗 หมูป่า: เลือดเต็ม = ไม่มี event ให้จอเล่า', () => {
  const boar = u('boar', { uid: 'A0', hp: 100, maxHp: 100, atk: 10 })
  const foe  = u('blank', { uid: 'B0', side: 'B', maxHp: 1000, hp: 1000 })
  assert.equal(runOnAttack(boar, foe, [foe], () => 0.5).events.length, 0)
})
```

- [ ] **Step 2: รันให้เห็นว่าแดง**

Run: `node --test src/utils/battlePassives.test.js`
Expected: FAIL — `mult(40)` ได้ 1

- [ ] **Step 3: เพิ่มพาสสีฟ**

```js
  boar: {
    name: 'ยิ่งเจ็บยิ่งบ้า', icon: '🐗',
    // pct 10 = 1:1 กับ % เลือดที่หายไป (user เคาะ 10 ก.ย.) — เอนจินคิดเป็นขั้นละ 10% อยู่แล้ว
    // เลข "10%" ใน desc พิมพ์ตรงๆ ได้ เพราะเป็นค่าคงที่ของเอนจิน (stepsOf10) ไม่ใช่ค่าที่จูนได้
    parts: [{ hook: 'onAttack', effect: 'berserk', value: { pct: 10 }, step: { pct: 2.5 } }],
    desc: 'เลือดที่หายไปทุก 10% ตีแรงขึ้น {pct}%',
    short: 'เลือดหายทุก 10% ตีแรงขึ้น {pct}%',
  },
```

- [ ] **Step 4: รันให้เขียว**

Run: `node --test $(find src -name "*.test.js")` → PASS
Run: `node scripts/death-audit.mjs` → 0 ไฟต์

- [ ] **Step 5: Commit**

```bash
git add -A src
git commit -m "Passive: 🐗 หมูป่า — เลือดยิ่งหายหมัดยิ่งหนัก"
```

---

### Task 9: 🦡 แบดเจอร์ — `giantSlayer`

**Files:**
- Modify: `src/data/petPassives.js` (หมวด Epic)
- Test: `src/utils/battlePassives.test.js`

**Interfaces:**
- Consumes: สัญญาใหม่จาก Task 4 — `value: { pct }` ไม่มีคีย์ `max`
- Produces: `PET_PASSIVES.badger`

- [ ] **Step 1: เขียนเทสที่ยังแดง**

```js
test('🦡 แบดเจอร์: เป้าเลือดสูงสุดมากกว่าเรา = แรงขึ้นเท่ากันเสมอ', () => {
  const badger = u('badger', { uid: 'A0', maxHp: 500, hp: 500, atk: 10 })
  const foe = (maxHp) => u('blank', { uid: 'B0', side: 'B', maxHp, hp: maxHp })
  const mult = (maxHp) => Math.round(runOnAttack(badger, foe(maxHp), [foe(maxHp)], () => 0.5).atkMult * 100) / 100
  assert.equal(mult(499), 1)
  assert.equal(mult(500), 1)
  assert.equal(mult(501), 1.25)
  assert.equal(mult(5000), 1.25)
})

test('🦡 แบดเจอร์: ทะเบียนต้องไม่มีคีย์ max หลงเหลือ (สัญญาเปลี่ยนแล้วตั้งแต่ 10 ก.ย.)', () => {
  const part = partsOf(PET_PASSIVES.badger)[0]
  assert.equal(part.value.max, undefined)
  assert.equal(part.step.max, undefined)
})
```

- [ ] **Step 2: รันให้เห็นว่าแดง**

Run: `node --test src/utils/battlePassives.test.js`
Expected: FAIL — `PET_PASSIVES.badger` เป็น `undefined`

- [ ] **Step 3: เพิ่มพาสสีฟ**

```js
  badger: {
    name: 'ล้มยักษ์', icon: '🦡',
    parts: [{ hook: 'onAttack', effect: 'giantSlayer', value: { pct: 25 }, step: { pct: 6 } }],
    desc: 'ตีเป้าที่เลือดสูงสุดมากกว่าตัวเอง แรงขึ้น {pct}%',
    short: 'เป้าตัวใหญ่กว่า ตีแรงขึ้น {pct}%',
  },
```

- [ ] **Step 4: รันให้เขียว**

Run: `node --test $(find src -name "*.test.js")` → PASS
Run: `node scripts/death-audit.mjs` → 0 ไฟต์

- [ ] **Step 5: Commit**

```bash
git add -A src
git commit -m "Passive: 🦡 แบดเจอร์ — เจอเป้าตัวใหญ่กว่าแล้วตีแรงขึ้น"
```

---

### Task 10: 🦇 ค้างคาว — `teamLifesteal`

**Files:**
- Modify: `src/data/petPassives.js` (หมวด Epic)
- Test: `src/utils/battlePassives.test.js`

**Interfaces:**
- Consumes: `applyAuras` แปะ `lifestealPct` บนตัวละคร · `runOnDealt(attacker, attTeam, dealt)` เป็นคนใช้จริง
- Produces: `PET_PASSIVES.bat`

- [ ] **Step 1: เขียนเทสที่ยังแดง**

```js
test('🦇 ค้างคาว: ทั้งทีมดูดเลือดตามดาเมจที่ตัวเองทำได้ (รวมค้างคาวเอง)', () => {
  const team = [
    u('bat',   { uid: 'A0', maxHp: 1000, hp: 500 }),
    u('blank', { uid: 'A1', maxHp: 1000, hp: 500 }),
  ]
  applyAuras(team, [])
  assert.equal(team[0].lifestealPct, 8)
  assert.equal(team[1].lifestealPct, 8)

  const out = runOnDealt(team[1], team, 100)
  assert.equal(team[1].hp, 508)                     // 8% ของดาเมจ 100
  const e = out.events.find(x => x.effect === 'teamLifesteal')
  assert.ok(e && e.fxKind === 'heal')
  assert.deepEqual(e.targets, ['A1'])
})

test('🦇 ค้างคาว: เลือดเต็มแล้วไม่ล้นหลอด และไม่มี event หลอกตา', () => {
  const team = [u('bat', { uid: 'A0', maxHp: 1000, hp: 1000 })]
  applyAuras(team, [])
  const out = runOnDealt(team[0], team, 100)
  assert.equal(team[0].hp, 1000)
  assert.equal(out.events.filter(e => e.effect === 'teamLifesteal').length, 0)
})
```

- [ ] **Step 2: รันให้เห็นว่าแดง**

Run: `node --test src/utils/battlePassives.test.js`
Expected: FAIL — `lifestealPct` เป็น `undefined`

- [ ] **Step 3: เพิ่มพาสสีฟ**

```js
  bat: {
    name: 'พันธะเลือด', icon: '🩸',
    parts: [{ hook: 'aura', effect: 'teamLifesteal', value: { pct: 8 }, step: { pct: 3 } }],
    desc: 'ทั้งทีมฟื้นเลือด {pct}% ของดาเมจที่ตัวเองทำได้',
    short: 'ทีมดูดเลือด {pct}% ของดาเมจที่ตีได้',
  },
```

- [ ] **Step 4: รันให้เขียว**

Run: `node --test $(find src -name "*.test.js")` → PASS
Run: `node scripts/death-audit.mjs` → 0 ไฟต์

- [ ] **Step 5: Commit**

```bash
git add -A src
git commit -m "Passive: 🦇 ค้างคาว — ทั้งทีมดูดเลือดจากดาเมจที่ตัวเองทำได้"
```

---

### Task 11: 🦣 แมมมอธ → `armorStack` (+ ปิดหนี้เทส §7.6 ข้อ 8)

**Files:**
- Modify: `src/data/petPassives.js` (`mammoth`)
- Test: `src/utils/battlePassives.test.js`

**Interfaces:**
- Consumes: `runOnHit` เคส `armorStack` (`value: { count, pct }` · `res.reflect` · `armorLeft` ใน event)
  · เอนจินยิงก้อนสะท้อนใส่ศัตรูทุกตัวผ่าน `strike()` และคุมด้วยธง `reflecting`/`countering`
- Produces: `PET_PASSIVES.mammoth` รูปใหม่ — **เพ็ทตัวแรกของเกมที่ถือ `armorStack` จริง**

- [ ] **Step 1: เขียนเทสที่ยังแดง (รวมเทสที่กิน log จากไฟต์จริง)**

```js
test('🦣 แมมมอธ: เกราะกันหมัดทั้งดอกแล้วสะท้อน · หมดสแตคแล้วรับปกติ', () => {
  const mam = u('mammoth', { uid: 'B0', side: 'B', element: 'paper', maxHp: 1000, hp: 1000 })
  const att = u('blank',   { uid: 'A0', atk: 100 })

  const a = runOnHit(mam, 100, att, [mam], () => 0.99)
  assert.equal(a.dmg, 0)                            // กันทั้งหมัด ไม่ใช่โล่ที่มีค่าเลือด
  assert.equal(Math.round(a.reflect), 80)           // สะท้อน 80% ของหมัดนั้น
  assert.equal(a.events.find(e => e.effect === 'armorStack').armorLeft, 1)

  const b = runOnHit(mam, 100, att, [mam], () => 0.99)
  assert.equal(b.dmg, 0)
  assert.equal(b.events.find(e => e.effect === 'armorStack').armorLeft, 0)

  const c = runOnHit(mam, 100, att, [mam], () => 0.99)
  assert.equal(c.dmg, 100)                          // สแตคหมด = รับเต็ม ไม่มีการเติมกลางไฟต์
  assert.equal(c.reflect, 0)
})

test('🦣 แมมมอธ: หมัดที่ดาเมจเหลือ 0 อยู่แล้ว ห้ามกินสแตคเกราะฟรี', () => {
  const mam = u('mammoth', { uid: 'B0', side: 'B', element: 'paper', maxHp: 1000, hp: 1000 })
  const att = u('blank',   { uid: 'A0', atk: 100 })
  runOnHit(mam, 0, att, [mam], () => 0.99)
  const after = runOnHit(mam, 100, att, [mam], () => 0.99)
  assert.equal(after.events.find(e => e.effect === 'armorStack').armorLeft, 1)  // ยังเหลือ 1 = ใบแรกไม่ได้กิน
})

test('🦣 แมมมอธ: เกราะที่โดนหมัดสวนของฟีนิกซ์ยังสะท้อนได้จริงในไฟต์จริง (ธง countering ไม่บล็อก)', () => {
  const phoenix = [{ id: 'phoenix', rarity: 'legendary', element: 'scissors', grade: 3 }]
  const mammoth = [{ id: 'mammoth', rarity: 'legendary', element: 'paper', grade: 3 }]
  let found = false
  for (let seed = 1; seed <= 300 && !found; seed++) {
    const log = simulateBattle(phoenix, mammoth, seed).log
    const revive = log.findIndex(e => e?.t === 'passive' && e.effect === 'revive')
    if (revive < 0) continue
    found = log.slice(revive).some(e => e?.t === 'passive' && e.effect === 'armorStack' && e.amount > 0)
  }
  assert.ok(found, 'ไม่เจอไฟต์ที่เกราะสะท้อนหลังหมัดสวนเลย — ธง countering อาจบล็อกอยู่')
})
```

- [ ] **Step 2: รันให้เห็นว่าแดง**

Run: `node --test src/utils/battlePassives.test.js`
Expected: FAIL — `a.dmg` ได้ 80 (ยังเป็น `damageReduction` 20%)

- [ ] **Step 3: เปลี่ยนพาสสีฟ**

แทนที่ entry `mammoth` เดิมด้วย:

```js
  mammoth: {
    name: 'เกราะปฐพี', icon: '🪨',
    // step.count = 0 — จำนวนสแตคเป็นของที่โตแล้วพัง (เกราะ 4 ชั้น = กันฟรี 4 หมัดเต็ม)
    // สิ่งที่โตตามขั้นคือ % สะท้อนเท่านั้น · ไม่มีการเติมสแตคระหว่างไฟต์ (สเปกแม่ §4.3)
    parts: [{ hook: 'onHit', effect: 'armorStack', value: { count: 2, pct: 80 },
              step: { count: 0, pct: 10 } }],
    desc: 'เข้าไฟต์พร้อมเกราะ {count} ชั้น · เกราะกันหมัดนั้นทั้งดอก แล้วสะท้อน {pct}% ใส่ศัตรูทุกตัว',
    short: 'เกราะ {count} ชั้น กันเต็มหมัด · สะท้อน {pct}%',
  },
```

- [ ] **Step 4: รันเทสทั้งชุด แล้วเก็บผลกระทบ**

Run: `node --test $(find src -name "*.test.js")`

เทสไฟต์จริงที่ใช้ `mammoth` เป็นตัวประกอบอาจขยับตัวเลข — **ไล่ดูทีละตัวว่าการขยับสมเหตุสมผลไหม**
(เกราะกันหมัดเต็ม 2 ครั้ง + สะท้อนใส่ทุกตัว = ไฟต์เปลี่ยนจริง) แล้วค่อยแก้ค่าคาดหวังพร้อมคอมเมนต์เหตุผล
ถ้าเทสนั้นแค่ต้องการ "ตัวประกอบที่ไม่ยุ่ง" ให้เปลี่ยนเป็น `id: 'blank'` แทนการแก้ตัวเลข

Run: `node scripts/death-audit.mjs` → 0 ไฟต์ (ถ้าไม่ 0 = ก้อนสะท้อนฆ่าใครแล้วไม่ถูกบันทึก **หยุดและรายงาน**)

- [ ] **Step 5: Commit**

```bash
git add -A src
git commit -m "Passive: 🦣 แมมมอธ — เกราะกันหมัดเต็มใบแล้วสะท้อนใส่ศัตรูทั้งแถว"
```

---

### Task 12: 🐢 เต่า → `teamDamageReduction`

**Files:**
- Modify: `src/data/petPassives.js` (`turtle`)
- Test: `src/utils/battlePassives.test.js`

**Interfaces:**
- Consumes: `applyAuras` เคส `teamDamageReduction` (แปะ `teamDrPct` · เจ้าของได้เพิ่มอีกรอบ = 2 เท่า)
- Produces: `PET_PASSIVES.turtle` รูปใหม่ — ⚠️ `SELF_STATUS_EFFECTS` เดิมมี `damageReduction`
  แต่ `teamDamageReduction` อยู่ใน `TEAM_AURA_EFFECTS` แล้ว ⇒ ป้ายย้ายจาก "เฉพาะเต่า" เป็น "ทั้งทีม" เอง

- [ ] **Step 1: เขียนเทสที่ยังแดง**

```js
test('🐢 เต่า: ทั้งทีมลดดาเมจ · ตัวเต่าเองได้สองเท่า', () => {
  const team = [
    u('turtle', { uid: 'A0', element: 'paper' }),
    u('blank',  { uid: 'A1' }),
  ]
  applyAuras(team, [])
  assert.equal(team[0].teamDrPct, 40)                // เจ้าของ 2 เท่า
  assert.equal(team[1].teamDrPct, 20)

  const att = u('blank', { uid: 'B0', side: 'B', atk: 100 })
  assert.equal(Math.round(runOnHit(team[0], 100, att, team, () => 0.99).dmg), 60)
  assert.equal(Math.round(runOnHit(team[1], 100, att, team, () => 0.99).dmg), 80)
})
```

- [ ] **Step 2: รันให้เห็นว่าแดง**

Run: `node --test src/utils/battlePassives.test.js`
Expected: FAIL — `teamDrPct` เป็น `undefined`

- [ ] **Step 3: เปลี่ยนพาสสีฟ**

```js
  turtle: {
    name: 'กระดองศิลา', icon: '🐢',
    // 🔴 ส่งต่อให้ P4: นี่คือ common ที่แจกลดดาเมจให้ "ทั้งทีม" — ขัดกฎ §8 ของสเปกแม่ที่ว่า
    //    เลข common ต้องต่ำกว่าคู่เทียบ epic/legendary เสมอ · เลข 20% เป็นค่าที่ user เคาะเอง
    //    P3 ใส่ตามนั้นและให้ sim เป็นคนหั่น — ห้ามหั่นเงียบในเฟสนี้
    // "สองเท่า" ใน desc พิมพ์ตรงๆ ได้ เพราะเอนจินบวกให้เจ้าของรอบที่สองตายตัว ไม่ใช่ค่าที่จูนได้
    parts: [{ hook: 'aura', effect: 'teamDamageReduction', value: { pct: 20 }, step: { pct: 4 } }],
    desc: 'ทั้งทีมรับดาเมจน้อยลง {pct}% · ตัวเต่าเองได้สองเท่า',
    short: 'ทีมรับดาเมจน้อยลง {pct}% · เต่าเองสองเท่า',
  },
```

- [ ] **Step 4: รันเทสทั้งชุด**

Run: `node --test $(find src -name "*.test.js")`

⚠️ `battleBuffs.test.js` มีเทสที่ใช้ `turtle` เป็นเจ้าของป้าย `damageReduction` — ป้ายย้ายกลุ่มแล้ว
(จาก "สถานะติดตัว" เป็น "ออร่าทีม") ⇒ แก้ค่าคาดหวังให้ตรงความจริงใหม่ พร้อมคอมเมนต์ว่าทำไม

Run: `node scripts/death-audit.mjs` → 0 ไฟต์

- [ ] **Step 5: Commit**

```bash
git add -A src
git commit -m "Passive: 🐢 เต่า — กระดองคุ้มทั้งทีม (ตัวเองสองเท่า)"
```

---

### Task 13: 🐭 หนู → `stealStats` + เปลี่ยนชื่อ

**Files:**
- Modify: `src/data/petPassives.js` (`mouse`)
- Test: `src/utils/battlePassives.test.js`
- อาจต้องแก้: `src/utils/battleEngine.test.js` · `src/utils/battleBeats.test.js` (ที่ใช้ `mouse` เป็นตัวประกอบ)

**Interfaces:**
- Consumes: `runSetup(team, foes)` เคส `stealStats` — รัน **ก่อน** `applyAuras` เสมอ

⚠️ **กับดักที่ต้องแก้พร้อมกัน:** `battlePassives.test.js` มีเทส `'passive ทุกอันมีฟิลด์ครบและ hook ที่รู้จัก'`
ที่ไล่ `HOOKS = ['aura','onStart','onRound','onAttack','onHit','onKill','onDeath','onAnyDeath']` —
**ยังไม่มี `'setup'`** เพราะวันนี้ไม่มีเพ็ทตัวไหนใช้ ⇒ หนูจะทำให้เทสนั้นแดงทันที ต้องเติม `'setup'` เข้าไปในลิสต์
- Produces: `PET_PASSIVES.mouse` รูปใหม่ ชื่อ 'หัวขโมยตัวจิ๋ว'

- [ ] **Step 1: เขียนเทสที่ยังแดง**

```js
test('🐭 หนู: ขโมยพลังและเลือดจากศัตรูทุกตัวตอนเริ่มไฟต์ · ศัตรูเสียจริง', () => {
  const me   = [u('mouse', { uid: 'A0', atk: 100, maxHp: 1000, hp: 1000 })]
  const foes = [
    u('blank', { uid: 'B0', side: 'B', atk: 200, maxHp: 2000, hp: 2000 }),
    u('blank', { uid: 'B1', side: 'B', atk: 100, maxHp: 1000, hp: 1000 }),
  ]
  runSetup(me, foes)
  assert.equal(Math.round(foes[0].atk), 190)        // เสียไป 5%
  assert.equal(Math.round(foes[1].maxHp), 950)
  assert.equal(Math.round(me[0].atk), 115)          // ได้ 10 + 5
  assert.equal(Math.round(me[0].maxHp), 1150)
  assert.equal(me[0].hp, me[0].maxHp)               // ได้เลือดมาเต็มก้อนที่ขโมยได้
})

test('🐭 หนู: เลือดปัจจุบันของศัตรูห้ามล้นหลอดที่หดลง', () => {
  const me   = [u('mouse', { uid: 'A0', atk: 100, maxHp: 1000, hp: 1000 })]
  const foes = [u('blank', { uid: 'B0', side: 'B', atk: 100, maxHp: 1000, hp: 1000 })]
  runSetup(me, foes)
  assert.ok(foes[0].hp <= foes[0].maxHp)
})

test('🐭 หนู: ขโมยก่อนออร่าเสมอ — สิงโตคูณจากเลขหลังถูกขโมยแล้ว', () => {
  const A = [
    u('mouse', { uid: 'A0', element: 'fist',     atk: 100, maxHp: 1000, hp: 1000 }),
    u('fox',   { uid: 'A1', element: 'scissors', atk: 100, maxHp: 1000, hp: 1000 }),
    u('lion',  { uid: 'A2', element: 'paper',    atk: 100, maxHp: 1000, hp: 1000 }),
  ]
  const B = [u('blank', { uid: 'B0', side: 'B', atk: 100, maxHp: 1000, hp: 1000 })]
  runSetup(A, B)
  applyAuras(A, B)
  assert.equal(Math.round(A[0].atk), 118)           // (100 + 5) × 1.12
})
```

⚠️ เทสที่สามใช้ `lion` เป็นสายพิทักษ์เพื่อให้ครบ 3 สายในเทสเท่านั้น (ในคลังจริงสิงโตเป็นสายจู่โจม) —
`applyAuras` อ่าน `element` จากตัวละคร ไม่ได้อ่านจากคลัง จึงตั้งได้อิสระในยูนิตเทส

- [ ] **Step 2: รันให้เห็นว่าแดง**

Run: `node --test src/utils/battlePassives.test.js`
Expected: FAIL — `foes[0].atk` ยัง 200

- [ ] **Step 3: เปลี่ยนพาสสีฟ**

```js
  mouse: {
    name: 'หัวขโมยตัวจิ๋ว', icon: '🫳',
    // 🔴 hook `setup` เท่านั้น — ห้ามขยับ maxHp กลางไฟต์เด็ดขาด (จะ re-compute แล้วพังทั้งไฟต์)
    parts: [{ hook: 'setup', effect: 'stealStats', value: { pct: 5 }, step: { pct: 1.5 } }],
    desc: 'เริ่มไฟต์ ขโมยพลังโจมตีและเลือดสูงสุดจากศัตรูทุกตัว อย่างละ {pct}%',
    short: 'เริ่มไฟต์ ขโมยพลัง+เลือด {pct}% จากศัตรูทุกตัว',
  },
```

- [ ] **Step 4: รันเทสทั้งชุด แล้วเก็บผลกระทบของ "ตัวประกอบที่ไม่เฉยอีกต่อไป"**

Run: `node --test $(find src -name "*.test.js")`

`mouse` ถูกใช้เป็นตัวประกอบในเทสไฟต์จริงหลายที่ (`battleEngine.test.js` และ `battleBeats.test.js`)
ตอนนี้มันขโมยสเตตัสตอนเริ่มไฟต์ ⇒ ตัวเลขในเทสพวกนั้นขยับ · **วิธีแก้ที่ถูก:**
- ถ้าเทสนั้นไม่ได้สนใจพาสสีฟของตัวประกอบ → เปลี่ยน `id: 'mouse'` เป็น `id: 'blank'`
- ถ้าเทสนั้นตั้งใจวัดไฟต์จริงกับเพ็ทจริง → แก้ค่าคาดหวังพร้อมคอมเมนต์ว่าเลขใหม่มาจากไหน

Run: `node scripts/death-audit.mjs` → 0 ไฟต์

- [ ] **Step 5: Commit**

```bash
git add -A src
git commit -m "Passive: 🐭 หนู — หัวขโมยตัวจิ๋ว ขโมยพลังและเลือดตั้งแต่ยังไม่เริ่มตี"
```

---

### Task 14: 🦄 ยูนิคอร์น → `healOnAttack`

**Files:**
- Modify: `src/data/petPassives.js` (`unicorn`)
- Test: `src/utils/battlePassives.test.js`

**Interfaces:**
- Consumes: `runOnDealt(attacker, attTeam, dealt)` เคส `healOnAttack` (ยิงครั้งเดียวต่อหมัดลูก 1 ใบ)
- Produces: `PET_PASSIVES.unicorn` รูปใหม่

- [ ] **Step 1: เขียนเทสที่ยังแดง**

```js
test('🦄 ยูนิคอร์น: ตีแล้วฟื้นเพื่อนที่บอบช้ำสุดตามดาเมจจริง (ไม่ใช่ต้นรอบอีกแล้ว)', () => {
  const uni  = u('unicorn', { uid: 'A0', maxHp: 1000, hp: 1000 })
  const hurt = u('blank',   { uid: 'A1', maxHp: 1000, hp: 300 })
  const ok   = u('blank',   { uid: 'A2', maxHp: 1000, hp: 900 })
  const out = runOnDealt(uni, [uni, hurt, ok], 100)
  assert.equal(hurt.hp, 320)                        // 20% ของดาเมจ 100
  assert.equal(ok.hp, 900)
  const e = out.events.find(x => x.effect === 'healOnAttack')
  assert.ok(e && e.fxKind === 'heal')
  assert.deepEqual(e.targets, ['A1'])

  // ไม่ทำงานที่ต้นรอบอีกแล้ว
  assert.equal(runOnRound([uni, hurt, ok]).filter(x => x.effect === 'healLowestAlly').length, 0)
})

test('🦄 + 🦇 ในทีมเดียวกัน: สองผลนี้ต้องได้ event ของตัวเองครบ ไม่มีใบไหนถูกกลืน', () => {
  // สเปก §9 ข้อ 8 — หนี้ P2 §7.4 ข้อ 7 เตือนว่าถ้าสองผลนี้ยิงบน uid เดียวกันติดกัน กฎจังหวะจะปิดเสียงใบแรก
  // วันนี้เป็นคนละเพ็ท (uid ต่างกัน) จึงยังไม่ชน — เทสนี้คือตัวที่จะแดงทันทีถ้าวันหน้ามีเพ็ทถือทั้งคู่
  const uni  = u('unicorn', { uid: 'A0', maxHp: 1000, hp: 1000 })
  const bat  = u('bat',     { uid: 'A1', maxHp: 1000, hp: 500 })
  const hurt = u('blank',   { uid: 'A2', maxHp: 1000, hp: 300 })
  const team = [uni, bat, hurt]
  applyAuras(team, [])
  const out = runOnDealt(uni, team, 100)
  const kinds = out.events.map(e => e.effect)
  assert.ok(kinds.includes('healOnAttack'), 'ผลของยูนิคอร์นหาย')
  assert.ok(kinds.includes('teamLifesteal'), 'ผลดูดเลือดของค้างคาวหาย')
  assert.equal(new Set(out.events.map(e => `${e.uid}:${e.effect}`)).size, out.events.length)
})
```

- [ ] **Step 2: รันให้เห็นว่าแดง**

Run: `node --test src/utils/battlePassives.test.js`
Expected: FAIL — `hurt.hp` ยัง 300

- [ ] **Step 3: เปลี่ยนพาสสีฟ**

```js
  unicorn: {
    name: 'เขาศักดิ์สิทธิ์', icon: '✨',
    parts: [{ hook: 'onAttack', effect: 'healOnAttack', value: { pct: 20 }, step: { pct: 6 } }],
    desc: 'ทุกครั้งที่ตี ฟื้นเลือดเพื่อนที่บอบช้ำสุด {pct}% ของดาเมจที่ทำได้',
    short: 'ตีแล้วฟื้นเพื่อนบอบช้ำสุด {pct}% ของดาเมจ',
  },
```

- [ ] **Step 4: รันให้เขียว**

Run: `node --test $(find src -name "*.test.js")` → PASS (แก้เทสที่พึ่ง `healLowestAlly` ของยูนิคอร์นถ้ามี)
Run: `node scripts/death-audit.mjs` → 0 ไฟต์

- [ ] **Step 5: Commit**

```bash
git add -A src
git commit -m "Passive: 🦄 ยูนิคอร์น — ฟื้นเพื่อนตอนออกหมัด แทนการฟื้นทุกต้นรอบ"
```

---

### Task 15: 🐹 แฮมสเตอร์ 200% + เปลี่ยนชื่อ 3 ตัวที่เหลือ

**Files:**
- Modify: `src/data/petPassives.js` (`hamster`, `whale`, `qilin`, `genie`)
- Test: `src/data/petPassives.test.js`

**Interfaces:**
- Consumes: ไม่มีของใหม่ — เปลี่ยนค่าและชื่อล้วน
- Produces: ชื่อพาสสีฟชุดสุดท้ายที่ P3b จะเอาไปขึ้นแถบ "พาสสีฟอัปเดต"

- [ ] **Step 1: เขียนเทสที่ยังแดง**

เติมใน `src/data/petPassives.test.js`:

```js
test('ชื่อพาสสีฟชุดใหม่ของ P3 ตรงตามที่ user เคาะ', () => {
  assert.equal(PET_PASSIVES.whale.name, 'อ้อมกอดเบลูก้า')
  assert.equal(PET_PASSIVES.qilin.name, 'กลืนกินฝันร้าย')
  assert.equal(PET_PASSIVES.mouse.name, 'หัวขโมยตัวจิ๋ว')
  assert.equal(PET_PASSIVES.genie.name, 'พรข้อสุดท้าย')
})

test('ชื่อพาสสีฟห้ามซ้ำกัน — battleBuffs.maxStacksOf ค้นทะเบียนด้วยชื่อ', () => {
  const names = Object.values(PET_PASSIVES).map(p => p.name)
  assert.equal(new Set(names).size, names.length)
})

test('🐹 แฮมสเตอร์: หมัดเปิดตอนเลือดเต็มแรงตามที่ user เคาะ', () => {
  const part = partsOf(PET_PASSIVES.hamster)[0]
  assert.equal(part.value.pct, 200)
  assert.equal(passiveValueAt(part, 3).pct, 320)    // ขั้น 3 ≈ 1.6 เท่าของขั้น 1
})

test('ทุก effect ที่มีเพ็ทถือจริง ต้องมีป้าย + คำอธิบาย + อยู่ในกลุ่มป้ายสักกลุ่ม', () => {
  // เทสความครบเดิมไล่จาก "รายชื่อ effect ที่เขียนไว้ในเทส" — ตัวนี้ไล่จาก "เพ็ทที่มีอยู่จริง" แทน
  // ⇒ วันที่มีคนเพิ่มเพ็ทที่ถือ effect ใหม่แล้วลืมลงทะเบียนป้าย เทสนี้แดงเอง ไม่ต้องรอคนมาอัปเดตรายชื่อ
  const GROUPS = [TEAM_AURA_EFFECTS, FOE_AURA_EFFECTS, SELF_STATUS_EFFECTS, FOE_STATUS_EFFECTS]
  for (const [id, p] of Object.entries(PET_PASSIVES)) {
    for (const part of partsOf(p)) {
      const k = part.effect
      assert.ok(STATUS_ICON[k], `${id}: ${k} ไม่มีไอคอนป้าย`)
      assert.ok(STATUS_TEXT[k], `${id}: ${k} ไม่มีคำอธิบายป้าย`)
      assert.ok(GROUPS.some(g => g.has(k)), `${id}: ${k} ไม่อยู่ในกลุ่มป้ายไหนเลย`)
    }
  }
})
```

⚠️ เทสตัวสุดท้ายอาจแดงกับ effect เก่าที่ยังไม่เคยถูกจัดกลุ่ม (เช่น `killChain` `aoeOpener` `multiStrike`
`execute` `regenSelf` `healLowestAlly` `targetLowest` `teamHealOpener`) — พวกนี้เป็น **เหตุการณ์ครั้งเดียว
ไม่ใช่สถานะที่ค้างบนการ์ด** จึงตั้งใจไม่มีป้าย · ถ้าแดง ให้เพิ่มเซ็ตยกเว้นที่ **เขียนเหตุผลกำกับรายตัว**
ไว้ในเทส แล้วปล่อยให้ effect ที่เป็น "สถานะค้าง" ทุกตัวยังถูกบังคับเหมือนเดิม
(ห้ามยกเว้นแบบเหมารวมด้วยการลบเทสทิ้ง)

- [ ] **Step 2: รันให้เห็นว่าแดง**

Run: `node --test src/data/petPassives.test.js`
Expected: FAIL — ชื่อยังเป็น 'พรมหาสมุทร' และ `pct` ยัง 15

- [ ] **Step 3: แก้ทะเบียน**

- `whale.name` → `'อ้อมกอดเบลูก้า'`
- `qilin.name` → `'กลืนกินฝันร้าย'`
- `genie.name` → `'พรข้อสุดท้าย'`
- `hamster`:

```js
  hamster: {
    name: 'พลังกักตุน', icon: '🐹',
    // 🔴 200% = user เคาะเอง ("หมัดเปิดที่แรงมาก") · ส่งต่อให้ P4 ตรวจว่ามันไม่ได้ทำให้ "เปิดเกมแล้วจบเกม"
    //    ตัวนี้เป็น common ที่ทุกคนมีจากตั๋วฟรี 50 ใบ ⇒ ถ้าแรงเกิน ตู้อัพเรทจะไม่มีใครหมุน (สเปกแม่ §8)
    parts: [{ hook: 'onAttack', effect: 'atkWhenFull', value: { pct: 200 }, step: { pct: 60 } }],
    desc: 'ตอนเลือดเต็ม พลังโจมตี +{pct}%',
    short: 'ตอนเลือดเต็ม พลังโจมตี +{pct}%',
  },
```

- [ ] **Step 4: รันเทสทั้งชุด**

Run: `node --test $(find src -name "*.test.js")`
เทสไฟต์จริงที่มี `hamster` จะขยับ — แก้ค่าคาดหวังพร้อมเหตุผล หรือเปลี่ยนเป็น `id: 'blank'` ถ้ามันเป็นแค่ตัวประกอบ

Run: `node scripts/death-audit.mjs` → 0 ไฟต์

- [ ] **Step 5: Commit**

```bash
git add -A src
git commit -m "Passive: หมัดเปิดของแฮมสเตอร์ + ชื่อพาสสีฟชุดใหม่ 4 ตัว"
```

---

### Task 16: อีโมจิ + ด่านปิดเฟส

**Files:**
- Create: `public/emoji/fluent/*.svg` (ผลจากสคริปต์)
- Modify: `docs/superpowers/specs/2026-09-10-passive-v2-p3-design.md` (บันทึกสถานะปิด P3a)

**Interfaces:**
- Consumes: ทุกอย่างจาก Task 1–15
- Produces: สถานะ "P3a ปิด" ที่ P3b และ P4 อ้างอิงได้

- [ ] **Step 1: โหลดอีโมจิที่ยังไม่มี**

Run: `node scripts/fetch-fluent.mjs`
Expected: สคริปต์สแกน `.vue` + `data` เอง แล้วโหลดเฉพาะตัวที่ยังไม่มีลง `public/emoji/fluent/`

- [ ] **Step 2: ตรวจด้วยตาว่าครบ**

ดึง codepoint ของอีโมจิที่เฟสนี้เพิ่ม แล้วเทียบกับไฟล์ในโฟลเดอร์:

```bash
for e in 🦁 👾 🦍 🐗 🦡 🦇 👑 🦠 🩸 🪨; do
  node -e "import('./src/utils/emoji.js').then(m=>console.log('$e', m.emojiCodepoint('$e')))"
done
ls public/emoji/fluent | wc -l
```

เอา codepoint ที่ได้ไปเช็คว่ามีไฟล์ `public/emoji/fluent/<codepoint>.svg` จริงทุกตัว
ตัวไหน Fluent ไม่มี ให้บันทึกไว้ในข้อความคอมมิต **ห้ามปล่อยเงียบ** (`<Emoji>` จะตกไปใช้อีโมจิของเครื่องโดยไม่มีใครรู้)

- [ ] **Step 3: ด่านสุดท้ายทั้งชุด**

```bash
node --test $(find src -name "*.test.js")
node scripts/death-audit.mjs
npm run build
```

Expected: เทสเขียวทั้งหมด (ต้องมากกว่า 1,115 เพราะเพิ่มเทสใหม่ทุก task) · death-audit 0 ไฟต์ · build ผ่าน

- [ ] **Step 4: บันทึกสถานะปิด P3a ลงสเปก**

เติมกล่องสถานะไว้ใต้หัวข้อ §1 ของ `docs/superpowers/specs/2026-09-10-passive-v2-p3-design.md`:
จำนวนเทสที่ผ่านจริง · commit ช่วงของ P3a · ของที่เปลี่ยนไปจากแผน (ถ้ามี) · เทสเดิมที่ต้องแก้ค่าคาดหวังและเหตุผล

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "Assets+Docs: อีโมจิเพ็ทรุ่น 2 + ปิดสถานะ P3a"
```

---

## หลังจบ P3a

- **อย่า merge เข้า master** — รอ P3b (ฝั่งจอ) ตามสเปก §7
- **P4 เริ่มได้ทันที**: วัด baseline ใหม่ด้วย `scripts/passive-power-sim.mjs` + `scripts/passive-vs-passive-sim.mjs`
  แล้วเทียบกับ `docs/pet-passive-sim-p2c2-2026-09-10.md` · **ห้ามเชื่อ lift ของ 🐘 บากุ / 🧞 จินนี่**
  จาก `passive-power-sim` (สนามวัดไม่มีหนาม/guardian)
- ของที่ต้องจับตาใน P4: 🐢 เต่า (common ที่แจกทั้งทีม) · 🐹 แฮมสเตอร์ 200% · 👾 ไวรัสที่ทบต้นตามจำนวนหมัดของทีม
