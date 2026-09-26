# ตู้ธีมรายเดือน + ปล่อยเพ็ทตามรุ่น (wave) Implementation Plan (แผน B)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** ตู้ธีมรายเดือน (ตัวเด่นน้ำหนัก ×3 ตลอด · ถึงการันตี (hard pity) ได้ตัวเด่นที่เลือกไว้แน่นอน) แทนตู้อีเวนต์เดิม และปิดช่องโหว่ที่เพ็ทรุ่นใหม่หลุดเข้าตู้ก่อนเปิดตัว

**Architecture:** `config/app.gachaEvent` ได้ฟิลด์ `wave` (ไม่มี = 2 เพื่อเข้ากับ config ก.ย. ที่อยู่ใน Firestore แล้ว) · คลังคิดจาก `wave` ของเพ็ทเทียบกับ wave ของอีเวนต์ · ชื่อ/ตัวเด่นของแต่ละ wave อยู่ในโค้ด (`src/data/gachaThemes.js`) แอดมินแค่กดเปิด · ตู้ธีมมีเป้าของตัวเอง (`gachaThemeTarget`) ไม่มี 50/50 ไม่มีธงการันตี ไม่แตะของตู้ปกติ · pity แชร์กระเป๋าเดียวเหมือนเดิม

**Tech Stack:** Vue 3 · Firestore (config/app, users) · `node --test`

**สเปก:** `docs/superpowers/specs/2026-09-26-pharmaverse-roadmap-design.md` §4 · ต้อง deploy **พร้อมหรือก่อน** แผน A (`2026-09-26-oct-celestial-battle.md`) เพราะแผน A เพิ่มเพ็ท `wave: 3`

## Global Constraints

- ตู้คงที่ = เลือกเป้า L ได้ทุกตัว **ยกเว้นตัวใหม่ของเดือนนั้น** · ตู้ธีม = อัตรา L รวมเท่าเดิม (`GACHA_RATES` + pity เดิม) · ตัวเด่นน้ำหนัก **×3** เทียบ L ตัวอื่น **ทุกครั้งที่ได้ L** (ไม่มี 50/50) · **L ที่มาจาก hard pity (ครั้งที่ `HARD_PITY`) = ตัวเด่นที่เลือกไว้หน้าตู้แน่นอน** (user เคาะ 26 ก.ย.) · กดสุ่มตอนยังไม่เลือกเป้า = เตือนให้เลือกก่อน ยกเว้นยืนยันสุ่มต่อ
- 🔴 ตู้ธีมห้ามเขียน `gachaTarget` / `gachaGuaranteed` ของตู้ปกติ (กฎเดิมจาก passive v2 P5)
- 🔴 ดีฟอลต์ต้องปิด: ไม่มี config/รูปพัง = ไม่ปล่อยเพ็ทรุ่นที่ยังไม่เปิด (fail-closed)
- เขียนเวลาเป็นมิลลิวินาที (number) ห้าม `serverTimestamp()` ใน config (CLAUDE.md ข้อ 10)
- ชื่อธีม (ตู้ + สนามแจก) ภาษาอังกฤษตามสเปก: wave 2 **King of the Jungle** · wave 3 **My Earth tilted for you**
- เทส `node --test src/**/*.test.js src/utils/*.test.js` · build `npx vite build` · **ห้าม push**
- commit `Area: อะไร (ทำไม)` + `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`

---

## File Structure

| ไฟล์ | หน้าที่ |
|---|---|
| `src/data/gachaThemes.js` (ใหม่) | ทะเบียนธีมต่อ wave: ชื่อ · ตัวเด่น · เดือน |
| `src/utils/petCatalog.js` | คลังตาม wave (ตู้ปกติ / หาได้ตอนนี้ / wave 1 นิ่ง) |
| `src/utils/gachaEvent.js` | `eventState` อ่าน wave+ธีม · เลิก `eventLegendaryIds` |
| `src/utils/gacha.js` | `pickThemeLegendary` น้ำหนัก + การันตี · `rollOne` รับโหมดธีม |
| `src/data/userSchema.js` | `gachaThemeTarget` |
| `src/views/ShopView.vue` | ตู้ธีม: เลือกเป้าจากตัวเด่น · สุ่มด้วยคลังที่ถูก |
| `src/views/AdminView.vue` | ปุ่มเปิดตู้ธีม wave ล่าสุด |

---

### Task 1: ทะเบียนธีม + คลังตาม wave

**Files:**
- Create: `src/data/gachaThemes.js`
- Modify: `src/utils/petCatalog.js`
- Test: `src/utils/petCatalog.test.js`

**Interfaces:**
- Produces:
  - `GACHA_THEMES: { [wave:number]: { name:string, month:string, featured:string[] } }` · `LATEST_THEME_WAVE:number` · `themeOf(wave) → theme|null`
  - `eventWave(gachaEvent) → number` (ไม่มี `wave` แต่มี `endsAt` = 2 · ไม่มี config = 1)
  - `releasedPets(gachaEvent, now)` = เพ็ท wave ≤ (อีเวนต์จบแล้ว ? w : w − 1)
  - `obtainablePets(gachaEvent, now)` = released + (อีเวนต์เปิดอยู่ ? เพ็ท wave w)
  - `wave1Pets()` = เพ็ทไม่มี wave หรือ wave 1 (คลังนิ่งของบอทหอคอย)

- [ ] **Step 1: เขียนเทสที่ต้องล้ม** — ต่อท้าย `src/utils/petCatalog.test.js`

```js
import { PETS } from '../data/index.js'
import { eventWave } from './petCatalog.js'

const idsOf = (list) => new Set(list.map(p => p.id))
const NOW = 1_000_000

test('config ก.ย. เดิม (ไม่มี wave) = wave 2 · จบแล้ว ⇒ ตู้ปกติมี wave 2 แต่ไม่มี wave 3', () => {
  const ev = { endsAt: NOW - 1 }
  assert.equal(eventWave(ev), 2)
  const got = idsOf(releasedPets(ev, NOW))
  assert.ok(got.has('lion'))
  assert.ok(!got.has('sol'), 'เพ็ท ต.ค. ห้ามหลุดเข้าตู้ก่อนเปิดตัว')
})

test('ตู้ wave 3 เปิดอยู่: ตู้ปกติไม่มี wave 3 · หาได้ตอนนี้มี', () => {
  const ev = { wave: 3, endsAt: NOW + 1000 }
  assert.ok(!idsOf(releasedPets(ev, NOW)).has('sol'))
  assert.ok(idsOf(obtainablePets(ev, NOW)).has('sol'))
  assert.ok(idsOf(releasedPets(ev, NOW)).has('lion'), 'wave 2 ปล่อยแล้ว')
})

test('ตู้ wave 3 จบแล้ว ⇒ wave 3 ไหลเข้าตู้ปกติ', () => {
  assert.ok(idsOf(releasedPets({ wave: 3, endsAt: NOW - 1 }, NOW)).has('sol'))
})

test('ไม่มี config = wave 1 เท่านั้น (fail-closed)', () => {
  const got = idsOf(releasedPets(null, NOW))
  assert.ok(!got.has('lion') && !got.has('sol'))
})

test('wave1Pets ไม่มี wave 2/3', () => {
  assert.ok(wave1Pets().every(p => !p.wave || p.wave === 1))
})
```

(ถ้าไฟล์เทสยังไม่ import `releasedPets`/`obtainablePets`/`wave1Pets`/`assert`/`test` ให้รวมเข้าบรรทัด import เดิม ห้าม import ซ้ำ)

Run: `node --test src/utils/petCatalog.test.js` → FAIL (`eventWave` ไม่มี)

- [ ] **Step 2: สร้าง `src/data/gachaThemes.js`**

```js
// src/data/gachaThemes.js
// ธีมของตู้รายเดือน — 1 wave = 1 ธีม = 1 ประตูมิติ (สเปก Pharmaverse §4)
// 🔑 ชื่อธีมใช้ซ้ำเป็นชื่อสนามแชมป์ของเดือนนั้น (`ch-YYYY-MM` ใน data/arenas.js) — ตั้งให้ตรงกัน
// เพิ่มเดือนใหม่: เติมแถว + ใส่ `wave` ให้เพ็ทใน data/index.js ให้ตรง
export const GACHA_THEMES = {
  2: { name: 'King of the Jungle', month: '2026-09', featured: ['lion', 'virus', 'gorilla'] },
  3: { name: 'My Earth tilted for you', month: '2026-10', featured: ['sol', 'earth', 'luna'] },
}
export const LATEST_THEME_WAVE = Math.max(...Object.keys(GACHA_THEMES).map(Number))
export const themeOf = (wave) => GACHA_THEMES[wave] || null
```

- [ ] **Step 3: เขียน `petCatalog.js` ใหม่ส่วนคลัง** (คง `endsAtMs` เดิม)

```js
/** wave ของอีเวนต์ใน config — config ก.ย. เขียนก่อนมีฟิลด์นี้ (มีแต่ endsAt) ⇒ ถือเป็น 2
 *  ไม่มี config/อ่าน endsAt ไม่ออก = 1 (fail-closed: ไม่ปล่อยรุ่นใหม่) */
export function eventWave(gachaEvent) {
  if (endsAtMs(gachaEvent) === null) return 1
  const w = Number(gachaEvent.wave)
  return Number.isInteger(w) && w >= 2 ? w : 2
}
const waveOf = (p) => p.wave || 1

/** เพ็ทรุ่นแรก — คลังที่ต้องนิ่งตลอดกาล (บอทหอคอย) */
export const wave1Pets = () => PETS.filter(p => waveOf(p) === 1)

/** "ตู้ปกติ" แจกอะไรได้ตอนนี้ — รุ่นของอีเวนต์ปัจจุบันเข้าตู้ปกติเมื่ออีเวนต์จบเท่านั้น
 *  (user: ตู้คงที่เลือกได้ทุกตัว ยกเว้นตัวใหม่ของเดือนนั้น) · รุ่นที่ใหม่กว่าอีเวนต์ = ยังไม่เปิดตัว ไม่มีทางหลุด */
export function releasedPets(gachaEvent = null, now = Date.now()) {
  const w = eventWave(gachaEvent)
  const ends = endsAtMs(gachaEvent)
  const max = ends !== null && now > ends ? w : w - 1
  return PETS.filter(p => waveOf(p) <= Math.max(1, max))
}

/** "หาได้จริงตอนนี้" = ตู้ปกติ + รุ่นของอีเวนต์ถ้าตู้ธีมยังเปิด — ใช้กับตัวหาร x/y · เควสเก็บครบ */
export function obtainablePets(gachaEvent = null, now = Date.now()) {
  if (!eventOpen(gachaEvent, now)) return releasedPets(gachaEvent, now)
  const w = eventWave(gachaEvent)
  return PETS.filter(p => waveOf(p) <= w)
}
```

⚠️ แผน A Task 4 ใส่ `wave1Pets` ชั่วคราวไว้ — ตัวนี้แทนที่ตัวนั้น

- [ ] **Step 4: รันเทสทั้งหมด** — PASS (`useAchievements` / `PetsView` / `LabTab` ใช้ API ชื่อเดิม ไม่ต้องแก้)

- [ ] **Step 5: Commit**

```bash
git add src/data/gachaThemes.js src/utils/petCatalog.js src/utils/petCatalog.test.js
git commit -m "Gacha: ปล่อยเพ็ทตาม wave ของอีเวนต์ (เดิมอีเวนต์ไหนจบก็ปล่อยทั้งคลัง = เพ็ท ต.ค. จะหลุดทันทีที่ deploy)"
```

---

### Task 2: สุ่มตู้ธีม — น้ำหนัก ×3 + hard pity ได้ตัวเด่นที่เลือก

**Files:**
- Modify: `src/utils/gacha.js`
- Modify: `src/utils/gachaEvent.js`
- Test: `src/utils/gacha.test.js`, `src/utils/gachaEvent.test.js`

**Interfaces:**
- Consumes: `themeOf`, `eventWave` (Task 1)
- Produces:
  - `THEME_FEATURED_WEIGHT = 3`
  - `pickThemeLegendary({ target, atHardPity, legendaryIds, featured, rng }) → { id, won: boolean|null, newGuaranteed: false }`
  - `rollOne(state, catalog, rng, opts)` รับ `opts.theme = { featured: string[] }` ⇒ ใช้ `pickThemeLegendary` แทน `pickLegendary`
  - `eventState(gachaEvent, now)` คืน `{ active, name, endsAt, featured, msLeft, wave }` — name/featured มาจาก `themeOf(wave)` ก่อน config

> ✅ user เคาะ 26 ก.ย.: ×3 คงที่ทุกครั้งที่ได้ L · hard pity = ตัวเด่นที่เลือก · ไม่มี 50/50/ธงการันตี

- [ ] **Step 1: เทสที่ต้องล้ม** — `src/utils/gacha.test.js`

```js
import { pickThemeLegendary, THEME_FEATURED_WEIGHT, rollOne } from './gacha.js'

const L = ['a', 'b', 'c', 'x', 'y']        // x, y = ตัวเด่น

test('ตู้ธีม: ตัวเด่นน้ำหนัก ×3', () => {
  assert.equal(THEME_FEATURED_WEIGHT, 3)
  // น้ำหนักรวม 3 + 6 = 9 · rng 0.5 → 4.5 → ตก x (ช่วง 3..6)
  const r = pickThemeLegendary({ target: null, atHardPity: false, legendaryIds: L, featured: ['x', 'y'], rng: () => 0.5 })
  assert.equal(r.id, 'x')
  assert.equal(r.won, null)
})

test('ตู้ธีม: hard pity = ได้เป้าเสมอ', () => {
  const r = pickThemeLegendary({ target: 'y', atHardPity: true, legendaryIds: L, featured: ['x', 'y'], rng: () => 0 })
  assert.deepEqual(r, { id: 'y', won: true, newGuaranteed: false })
})

test('ตู้ธีม: ไม่ใช่ hard pity = ถ่วง ×3 ธรรมดา แม้มีเป้า (ไม่มี 50/50 ไม่มีธง)', () => {
  const r = pickThemeLegendary({ target: 'y', atHardPity: false, legendaryIds: L, featured: ['x', 'y'], rng: () => 0 })
  assert.equal(r.id, 'a')
  assert.equal(r.newGuaranteed, false)
})

test('ตู้ธีม: hard pity แต่ไม่ได้เลือกเป้า = ถ่วง ×3', () => {
  const r = pickThemeLegendary({ target: null, atHardPity: true, legendaryIds: L, featured: ['x', 'y'], rng: () => 0.5 })
  assert.equal(r.id, 'x')
})

test('rollOne โหมดธีม: legendary ใช้ pickThemeLegendary', () => {
  const cat = [{ id: 'a', rarity: 'legendary' }, { id: 'x', rarity: 'legendary' }, { id: 'c1', rarity: 'common' }]
  // pity 49 ⇒ ครั้งนี้คือครั้งที่ 50 = hard pity ⇒ ได้เป้า
  const r = rollOne({ pity: 49, target: 'x', guaranteed: false, ownedLegendaryIds: [] }, cat, () => 0.1, { theme: { featured: ['x'] } })
  assert.equal(r.id, 'x')
})
```

Run → FAIL

- [ ] **Step 2: เทส eventState** — `src/utils/gachaEvent.test.js`

```js
test('eventState: wave 3 เอาชื่อ/ตัวเด่นจากทะเบียนธีม', () => {
  const s = eventState({ wave: 3, endsAt: 9e12 }, 0)
  assert.equal(s.name, 'My Earth tilted for you')
  assert.deepEqual(s.featured, ['sol', 'earth', 'luna'])
  assert.equal(s.wave, 3)
})
test('eventState: config ก.ย. เดิม = wave 2 King of the Jungle', () => {
  const s = eventState({ endsAt: 9e12, name: 'อัญเชิญพิเศษ · King of the Jungle' }, 0)
  assert.equal(s.wave, 2)
  assert.deepEqual(s.featured, ['lion', 'virus', 'gorilla'])
})
```

เทสเดิมของ `eventLegendaryIds` ให้ลบทิ้ง (ฟังก์ชันถูกลบใน Step 4)

- [ ] **Step 3: เขียนใน `gacha.js`** (ใต้ `pickLegendary`)

```js
/** ตู้ธีม: ตัวเด่นของเดือนมีน้ำหนักเท่านี้เทียบกับ L ตัวอื่น (user เคาะ 26 ก.ย. 2026) */
export const THEME_FEATURED_WEIGHT = 3

/** legendary ของตู้ธีม — อัตรา L รวมไม่เปลี่ยน (ตัดสินแล้วใน rollRarity) เปลี่ยนแค่ "ได้ตัวไหน"
 *  ทุกครั้ง: ตัวเด่น ×THEME_FEATURED_WEIGHT · L ที่มาจาก hard pity + เลือกเป้าไว้ = ได้เป้าแน่นอน (user เคาะ 26 ก.ย.)
 *  ไม่มี 50/50 และไม่มีธงการันตีข้ามครั้ง — newGuaranteed คืน false เสมอเพื่อให้รูปเดียวกับ pickLegendary */
export function pickThemeLegendary({ target, atHardPity, legendaryIds, featured, rng = Math.random }) {
  if (target && atHardPity) return { id: target, won: true, newGuaranteed: false }
  const feat = new Set(featured || [])
  const w = (id) => (feat.has(id) ? THEME_FEATURED_WEIGHT : 1)
  const total = legendaryIds.reduce((s, id) => s + w(id), 0)
  let r = rng() * total
  let id = legendaryIds[legendaryIds.length - 1]
  for (const x of legendaryIds) { r -= w(x); if (r < 0) { id = x; break } }
  return { id, won: target ? id === target : null, newGuaranteed: false }
}
```

ใน `rollOne` บล็อก legendary:

```js
    const pick = opts.theme
      ? pickThemeLegendary({ target: state.target, atHardPity: state.pity + 1 >= HARD_PITY, legendaryIds, featured: opts.theme.featured, rng })
      : pickLegendary({ target: state.target, guaranteed: state.guaranteed, ownedLegendaryIds: state.ownedLegendaryIds, legendaryIds, rng })
```

- [ ] **Step 4: `gachaEvent.js`** — import `themeOf` + `eventWave` · แก้ `eventState`:

```js
export function eventState(gachaEvent, now = Date.now()) {
  const endsAt = endsAtMs(gachaEvent)
  const active = endsAt !== null && now <= endsAt
  const wave = eventWave(gachaEvent)
  const theme = themeOf(wave)
  const featured = theme?.featured
    || (Array.isArray(gachaEvent?.featured) && gachaEvent.featured.length ? gachaEvent.featured : EVENT_FEATURED)
  return {
    active, wave, endsAt, featured,
    name: theme?.name || gachaEvent?.name || 'อัญเชิญพิเศษ',
    msLeft: active ? endsAt - now : 0,
  }
}
```

ลบ `eventLegendaryIds` (ตู้ธีมเลิก "ตัวที่ยังไม่มีก่อน" แล้ว — ใช้น้ำหนักแทน) · `grep -rn eventLegendaryIds src` ต้องเหลือแค่ ShopView ซึ่ง Task 3 แก้

- [ ] **Step 5: รันเทส** — PASS (ShopView จะพังตอน build จนกว่า Task 3 เสร็จ — ไม่เป็นไร ห้าม commit build ที่พัง: ทำ Task 3 ต่อก่อน commit ถ้าจำเป็นให้ commit Task 2+3 รวมกัน)

---

### Task 3: หน้าร้าน — ตู้ธีมมีเป้า/การันตีของตัวเอง

**Files:**
- Modify: `src/data/userSchema.js`
- Modify: `src/views/ShopView.vue`
- Test: `src/data/userSchema.test.js`

**Interfaces:**
- Consumes: `eventState` (`wave`, `featured`) · `rollOne` `opts.theme` · `obtainablePets`
- Produces: ฟิลด์ user `gachaThemeTarget: string|null`

- [ ] **Step 1: schema** — `userSchema.js` ใต้ `gachaGuaranteed`

```js
  gachaThemeTarget: null,       // ตู้ธีม: ตัวเด่นที่เลือกไว้ ⇒ L จาก hard pity ของตู้ธีมได้ตัวนี้แน่นอน
```

เทสใน `userSchema.test.js`:

```js
test('ค่าเริ่มตู้ธีม', () => {
  const d = normalizeUserData({})
  assert.equal(d.gachaThemeTarget, null)
})
```

- [ ] **Step 2: ShopView สคริปต์**

```js
const themeTarget = computed(() => {
  const t = authStore.userData?.gachaThemeTarget || null
  return ev.value.featured.includes(t) ? t : null          // เป้าของเดือนก่อน = ถือว่าไม่มี
})
const themeTargetPet = computed(() => featuredPets.value.find(p => p.id === themeTarget.value) || null)
const pickerMode = ref('normal')          // 'normal' | 'theme' — ตัวเลือกเป้าชุดเดียวกัน แต่รายการคนละชุด
const pickerList = computed(() => (pickerMode.value === 'theme' ? featuredPets.value : legendaries.value))
const pickerOn = computed(() => (pickerMode.value === 'theme' ? themeTarget.value : target.value))
function openPicker(mode) { pickerMode.value = mode; pickerOpen.value = true }
```

ใน `pull()` แทนบล็อก `state` / `rollCatalog` / `opts` / `base`:

```js
  // 🔴 ตู้ธีมห้ามแตะการันตี 50/50 ของตู้ปกติ ⇒ ใช้เป้าของตัวเอง ไม่มีธง · pity แชร์กระเป๋าเดียว (สเปก §6 ข้อ 5 เดิม)
  const state = isEvent
    ? { pity: pity.value, target: themeTarget.value, guaranteed: false, ownedLegendaryIds: ownedLegendaryIds() }
    : { pity: pity.value, target: target.value, guaranteed: guaranteed.value, ownedLegendaryIds: ownedLegendaryIds() }
  // ตู้ธีม = ของที่หาได้ตอนนี้ (ปล่อยแล้ว + รุ่นของเดือน) — ห้ามใช้ PETS เต็ม ไม่งั้นรุ่นที่ยังไม่เปิดหลุด
  const rollCatalog = isEvent ? ownable.value : catalog.value
  const opts = isEvent ? { theme: { featured: ev.value.featured } } : {}
```

```js
  const base = isEvent
    ? { pets: newPets, dailyQuest: dq, gachaPity: nextState.pity }
    : { pets: newPets, dailyQuest: dq, gachaPity: nextState.pity, gachaGuaranteed: nextState.guaranteed }
```

`chooseTarget(id)` แยกตามโหมด:

```js
async function chooseTarget(id) {
  const theme = pickerMode.value === 'theme'
  const cur = theme ? themeTarget.value : target.value
  const next = cur === id ? null : id
  const field = theme ? 'gachaThemeTarget' : 'gachaTarget'
  await authStore.patchUser({ [field]: next }, { [field]: next })
  pickerOpen.value = false
}
```

**เตือนก่อนสุ่มตู้ธีมเมื่อยังไม่เลือกเป้า** (user ขอ 26 ก.ย.) — ต้นฟังก์ชัน `pull()` หลังเช็ค `ev.active`:

```js
  if (isEvent && !themeTarget.value) {
    const go = await confirm(`ยังไม่ได้เลือกตัวหน้าตู้
ถ้าถึงการันตี (ครั้งที่ ${HARD_PITY}) จะได้ตัวเด่นที่เลือกไว้แน่นอน
ถ้าไม่เลือก การันตีจะสุ่มแบบธรรมดาแทน

สุ่มต่อโดยไม่เลือกเลยไหม?`)
    if (!go) { openPicker('theme'); return }
  }
```

(`confirm` มาจาก `useConfirm` — ดูว่า ShopView import ไว้แล้วหรือยัง ถ้ายังให้ import แบบเดียวกับ AdminView)

- [ ] **Step 3: ShopView template**

ตู้ธีม (`GachaBanner` ตัวบน) เพิ่ม props เป้า:

```html
        show-target :target-pet="themeTargetPet"
        @pull="(n) => pull(n, true)" @open-target="openPicker('theme')"
```

ตู้ปกติ: `@open-target="openPicker('normal')"` · ตัวเลือกเป้า: `v-for="p in pickerList"` · `:class="{ on: p.id === pickerOn }"` · หัวข้อ `{{ pickerMode === 'theme' ? 'เลือกเป้าหมายตู้ ' + ev.name : 'เลือกเป้าหมาย legendary' }}` · ปุ่มล่าง `{{ pickerOn ? 'ล้างเป้าหมาย' : 'ปิด' }}` และ `@click="chooseTarget(pickerOn)"` · ปุ่ม "ตั้งเป็นเป้าหมาย" ในกล่อง info: ซ่อนถ้า `pickerMode === 'theme' && !ev.featured.includes(infoPet.id)`

ลบ import `eventLegendaryIds` · ตรวจว่า `GachaBanner` รับ `show-target` คู่กับ `event` ได้ (อ่าน `src/components/shop/GachaBanner.vue` — ถ้า `event` ซ่อนแถวเป้าไว้ ให้เอาเงื่อนไขนั้นออก)

- [ ] **Step 4: build + เทส** — `npx vite build` ผ่าน · เทสผ่าน

- [ ] **Step 5: ลองในเบราว์เซอร์ (dev + บัญชีทดสอบ localhost ตามกติกา)** — ถ้ายังไม่มีวิธีล็อกอินบน localhost ให้ข้ามและบอก user ว่าต้องเทสเองบนเว็บจริงหลัง deploy: เปิดตู้ธีม → กดสุ่มโดยไม่เลือกเป้า ต้องเจอคำเตือน → ตั้งเป้า ☀️ → การ์ดตู้โชว์เป้า

- [ ] **Step 6: Commit (รวม Task 2)**

```bash
git add src/utils/gacha.js src/utils/gacha.test.js src/utils/gachaEvent.js src/utils/gachaEvent.test.js src/data/userSchema.js src/data/userSchema.test.js src/views/ShopView.vue
git commit -m "Gacha: ตู้ธีมรายเดือน — ตัวเด่น ×3 ตลอด + hard pity ได้ตัวที่เลือก + เตือนถ้ายังไม่เลือก (ไม่แตะ 50/50 ตู้ปกติ)"
```

---

### Task 4: แอดมิน — เปิดตู้ธีม wave ล่าสุด

**Files:**
- Modify: `src/views/AdminView.vue:30-46` (template) และ `:786-835` (สคริปต์)

**Interfaces:**
- Consumes: `LATEST_THEME_WAVE`, `themeOf` (Task 1)

- [ ] **Step 1: สคริปต์** — แก้ `startGachaEvent` / ข้อความยืนยัน:

```js
import { LATEST_THEME_WAVE, themeOf } from '../data/gachaThemes.js'
const nextTheme = themeOf(LATEST_THEME_WAVE)
async function startGachaEvent(days) {
  const ok = await confirm(`เปิดตู้ธีม "${nextTheme.name}" ${days} วัน?
• ทั้งชั้นปีเห็นทันที · ตัวเด่น ${nextTheme.featured.length} ตัวมีในตู้นี้เท่านั้น
• หมดเวลาแล้วตัวเด่นไหลเข้าตู้ปกติเอง`)
  if (!ok) return
  // 🔑 wave ต้องเขียนเสมอ — คลัง (petCatalog) ใช้ตัดว่าเพ็ทรุ่นไหนปล่อยแล้ว
  await writeGachaEvent({ wave: LATEST_THEME_WAVE, name: nextTheme.name, endsAt: Date.now() + days * 86400000 },
    `เปิดตู้ ${nextTheme.name} ${days} วันแล้ว`)
}
```

`endGachaEvent` ข้อความ: แทน "เพ็ทใหม่ 6 ตัว" ด้วย `ตัวเด่น ${gachaEv.value.featured.length} ตัว`

- [ ] **Step 2: template** — hint แทนข้อความตายตัวเรื่อง 🦁👾🦍:

```html
        <div class="admin-hint">
          ตู้ถัดไป: <b>{{ nextTheme.name }}</b> ({{ nextTheme.featured.length }} ตัวเด่น) ·
          <b>หมดเวลาแล้วตู้หายเอง และตัวเด่นไหลเข้าตู้ปกติทันที</b>
        </div>
```

ปุ่ม: เพิ่ม `เริ่ม 30 วัน` (`startGachaEvent(30)`) — ตู้ธีมเปิดทั้งเดือน

- [ ] **Step 3: build ผ่าน · Commit**

```bash
git add src/views/AdminView.vue
git commit -m "Admin: เปิดตู้ธีม wave ล่าสุด (เขียน wave+ชื่อ) + ปุ่ม 30 วัน"
```

---

### Task 5: ลำดับ deploy (บันทึก ไม่ใช่โค้ด)

- [ ] เพิ่มลงข้อความส่งมอบให้ user: **ก่อนกดเปิดตู้ ต.ค.** ต้อง (1) push แผน A+B พร้อมกัน (2) ตู้ ก.ย. ต้องจบแล้ว (3) กด "เริ่ม 30 วัน" ในแอดมิน · config ก.ย. ที่ไม่มี `wave` ถูกอ่านเป็น wave 2 อัตโนมัติ ไม่ต้องแก้ Firestore
- [ ] ย้ำ: สนามแชมป์ `ch-2026-10` ชื่อ **My Earth tilted for you** ต้องเพิ่มใน `data/arenas.js` ก่อนกดแจกรางวัลซีซั่น ต.ค. (ต้นเดือน พ.ย.) — ไม่ใช่งานของแผนนี้
