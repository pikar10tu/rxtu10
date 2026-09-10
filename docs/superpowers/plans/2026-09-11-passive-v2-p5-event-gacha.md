# P5 — ตู้อัญเชิญพิเศษ (Event Gacha) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:executing-plans · steps ใช้ checkbox

**Goal:** เปิดตัวเพ็ทรุ่น 2 หกตัวผ่าน "ตู้อัญเชิญพิเศษ" ที่จำกัดเวลา — ปิดเองด้วยนาฬิกา แล้วเพ็ทไหลเข้าตู้ปกติอัตโนมัติ

**Architecture:** ตรรกะอีเวนต์เป็นฟังก์ชันบริสุทธิ์ใน `utils/gachaEvent.js` (อ่าน `config/app.gachaEvent`) · ตู้สองใบใช้ component แบนเนอร์ตัวเดียวกันคนละ props · การสุ่มยังเป็น `utils/gacha.js` เดิม เพิ่มแค่ช่อง "รายชื่อ legendary ที่ตู้นี้ให้ได้"

**Tech Stack:** Vue 3 · Firestore (`config/app` public-read) · `node:test`

**สเปกแม่:** `docs/superpowers/specs/2026-09-03-passive-v2-design.md` §6 (กติกา 8 ข้อ user เคาะไว้ 3 ก.ย.)

## การตัดสินใจที่เพิ่มวันนี้ (11 ก.ย. — user เคาะ)

1. **หน้าร้านโชว์สองแบนเนอร์ซ้อนกันในหน้าเดียว** แบบเกมกาชาทั่วไป — อีเวนต์อยู่บนพร้อมป้าย `EVENT`
   ตู้ปกติอยู่ล่าง · **ไม่เพิ่มแท็บ ไม่ใช้สวิตช์สลับ** (ของเดิมมีแท็บ "อัญเชิญ / ห้องทดลอง" อยู่แล้ว ไม่ยุ่ง)
2. **แอดมินเปิดอีเวนต์ด้วยปุ่มสำเร็จรูป 7 วัน / 14 วัน** — ไม่ต้องกรอกวันที่เอง · ปุ่ม "จบตอนนี้" มีได้
   แต่ต้องทำงานด้วยการ **ตั้ง `endsAt` = เวลาปัจจุบัน** ไม่ใช่ธงปิดแยก ⇒ กติกา "ปิดด้วยนาฬิกา" ยังจริงข้อเดียว
3. **ตัวเด่น 3 ตัวมาจากโค้ด** (legendary รุ่น 2: 🦁 👾 🦍) ไม่ต้องให้แอดมินติ๊กเลือก — ลดโอกาสตั้งผิด
   (คอนฟิกยังรับ `featured` ทับได้ เผื่อรอบหน้า)

## Global Constraints

- เทสฐาน **1,160 ผ่าน** · `node --test $(find src -name "*.test.js")` เขียวทุกคอมมิต · `npm run build` ผ่าน
- 🔴 **ห้ามแตะสถานะการันตี 50/50 ของตู้ปกติ** — หมุนตู้อีเวนต์ต้องเขียนแค่ `gachaPity` (+`pets`)
  ห้ามเขียน `gachaGuaranteed`/`gachaTarget` เด็ดขาด (ผู้เล่นสะสม 50/50 ไว้กับตู้ปกติ)
- 🔴 **pity แชร์กระเป๋าเดียว** soft 40 / hard 50 เหมือนเดิม — ห้ามเพิ่มฟิลด์ใน user doc
- 🔴 **ปิดระบบ "เป้าหมาย" ในตู้อีเวนต์** — ไม่งั้นเป้าที่ตั้งค้างไว้จะชนะตัวเด่น
- 🔴 **ตู้ปิดเองด้วยนาฬิกา** · เมื่อ `now > endsAt` เพ็ทรุ่น 2 ไหลเข้าตู้ปกติเอง (`releasedPets()` ทำให้แล้วตั้งแต่ P3a)
  **ห้ามมีปุ่มแอดมินที่ต้องกดเพื่อให้ของไหลเข้า**
- ราคาเท่าตู้ปกติ (1,000 / 10,000 ได้ 11) ใช้เหรียญ + ตั๋วเดิม
- overlay `position:fixed` ใต้ `<RouterView>` ต้อง `<Teleport to="body">` (CLAUDE.md ข้อ 6)
- ข้อความตาม `docs/voice-guide.md` · ห้ามใส่อีโมจิในหัวข้อจดหมาย (ถ้ามีการแจ้ง — รอบนี้ไม่มี)

## File Structure

| ไฟล์ | หน้าที่ |
|---|---|
| `src/utils/gachaEvent.js` | **สร้างใหม่** — สถานะอีเวนต์ + คลัง legendary ของตู้อีเวนต์ (pure) |
| `src/utils/gachaEvent.test.js` | **สร้างใหม่** |
| `src/utils/gacha.js` | `rollOne`/`rollMany` รับ `opts.legendaryIds` (ค่าเริ่มต้น = เดิมเป๊ะ) |
| `src/components/shop/GachaBanner.vue` | **สร้างใหม่** — แบนเนอร์ 1 ใบ ใช้ทั้งตู้ปกติและตู้อีเวนต์ |
| `src/views/ShopView.vue` | วางสองแบนเนอร์ · แยกเส้นทางหมุน · อนิเมชันไต่สี |
| `src/views/AdminView.vue` | การ์ด "ตู้อัญเชิญพิเศษ" (ปุ่ม 7/14 วัน · จบตอนนี้ · โชว์เวลาที่เหลือ) |

---

### Task 1: ตรรกะอีเวนต์ (pure)

**Files:** สร้าง `src/utils/gachaEvent.js` + `src/utils/gachaEvent.test.js`

**Interfaces (Produces):**
- `EVENT_FEATURED: string[]` — 3 ตัวเด่นตั้งต้น (`lion` `virus` `gorilla`)
- `eventState(gachaEvent, now) → { active, name, endsAt, featured, msLeft }`
- `eventLegendaryIds(featured, ownedLegendaryIds, catalog) → string[]`

- [ ] **Step 1: เทสที่ยังแดง**

```js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { eventState, eventLegendaryIds, EVENT_FEATURED } from './gachaEvent.js'
import { PETS } from '../data/index.js'

test('ไม่มีคอนฟิก = ไม่มีอีเวนต์', () => {
  assert.equal(eventState(null, 1000).active, false)
  assert.equal(eventState({}, 1000).active, false)
})

test('ยังไม่หมดเวลา = อีเวนต์เปิด และบอกเวลาที่เหลือ', () => {
  const st = eventState({ name: 'King of the Jungle', endsAt: 5000 }, 1000)
  assert.equal(st.active, true)
  assert.equal(st.name, 'King of the Jungle')
  assert.equal(st.msLeft, 4000)
})

test('หมดเวลาแล้ว = ปิด (เท่ากับ endsAt พอดี ยังถือว่าเปิด)', () => {
  assert.equal(eventState({ endsAt: 1000 }, 1000).active, true)
  assert.equal(eventState({ endsAt: 1000 }, 1001).active, false)
})

test('endsAt แบบ Firestore Timestamp อ่านได้ · รูปพัง = ไม่เปิด', () => {
  assert.equal(eventState({ endsAt: { seconds: 2 } }, 1000).active, true)
  assert.equal(eventState({ endsAt: 'พรุ่งนี้' }, 1000).active, false)
})

test('ตัวเด่นดีฟอลต์มาจากโค้ด · คอนฟิกทับได้', () => {
  assert.deepEqual(eventState({ endsAt: 9e12 }, 0).featured, EVENT_FEATURED)
  assert.deepEqual(eventState({ endsAt: 9e12, featured: ['bahamut'] }, 0).featured, ['bahamut'])
})

test('legendary ในตู้อีเวนต์: ดันตัวเด่นที่ยังไม่มีก่อนเสมอ', () => {
  const ids = eventLegendaryIds(EVENT_FEATURED, ['lion'], PETS)
  assert.deepEqual(ids, ['virus', 'gorilla'])
})

test('มีตัวเด่นครบแล้ว = ตกไปคลัง legendary ทั้งกอง', () => {
  const ids = eventLegendaryIds(EVENT_FEATURED, EVENT_FEATURED, PETS)
  assert.equal(ids.length, PETS.filter(p => p.rarity === 'legendary').length)
  assert.ok(ids.includes('bahamut'))
})

test('ตัวเด่นที่พิมพ์ผิด/ไม่มีในคลัง ต้องถูกกรองทิ้ง ไม่ใช่แจกของที่ไม่มีจริง', () => {
  assert.deepEqual(eventLegendaryIds(['lion', 'ไม่มีตัวนี้'], [], PETS), ['lion'])
})
```

- [ ] **Step 2:** `node --test src/utils/gachaEvent.test.js` → FAIL (ไม่มีไฟล์)
- [ ] **Step 3: ลงมือ**

```js
// src/utils/gachaEvent.js
// สถานะ "ตู้อัญเชิญพิเศษ" — pure ทั้งหมด อ่านจาก config/app.gachaEvent
// สเปก: docs/superpowers/specs/2026-09-03-passive-v2-design.md §6
//
// 🔴 ตู้ปิดเองด้วยนาฬิกาเท่านั้น — ไม่มีธง "ปิดแล้ว" แยก และไม่มีปุ่มแอดมินที่ต้องกดเพื่อให้เพ็ทไหลเข้าตู้ปกติ
//    (คลังที่แจกได้อ่านจาก releasedPets() ซึ่งใช้ endsAt ตัวเดียวกันนี้)
// 🔴 รูปคอนฟิกพัง/อ่านไม่ออก = ถือว่าไม่มีอีเวนต์ ห้าม fail-open

const FEATURED_FALLBACK = ['lion', 'virus', 'gorilla']
export const EVENT_FEATURED = FEATURED_FALLBACK

function endsAtMs(ev) {
  const raw = ev && typeof ev === 'object' ? ev.endsAt : null
  if (typeof raw === 'number' && Number.isFinite(raw)) return raw
  if (raw && typeof raw === 'object' && typeof raw.seconds === 'number') return raw.seconds * 1000
  return null
}

/** สถานะอีเวนต์ ณ เวลา now */
export function eventState(gachaEvent, now = Date.now()) {
  const endsAt = endsAtMs(gachaEvent)
  const active = endsAt !== null && now <= endsAt
  const featured = Array.isArray(gachaEvent?.featured) && gachaEvent.featured.length
    ? gachaEvent.featured : FEATURED_FALLBACK
  return {
    active,
    name: gachaEvent?.name || 'อัญเชิญพิเศษ',
    endsAt,
    featured,
    msLeft: active ? endsAt - now : 0,
  }
}

/** legendary ที่ตู้อีเวนต์ให้ได้ — ตัวเด่นที่ยังไม่มีมาก่อนเสมอ ครบแล้วตกไปทั้งกอง
 *  🔑 ใช้กลไก new-first เดิมของ pickLegendary() ไม่ได้เขียนสุ่มใหม่ — แค่ส่งรายชื่อที่แคบลง */
export function eventLegendaryIds(featured, ownedLegendaryIds, catalog) {
  const all = (catalog || []).filter(p => p.rarity === 'legendary').map(p => p.id)
  const valid = (featured || []).filter(id => all.includes(id))
  const owned = new Set(ownedLegendaryIds || [])
  const unowned = valid.filter(id => !owned.has(id))
  return unowned.length ? unowned : all
}
```

- [ ] **Step 4:** เทสทั้งชุดเขียว
- [ ] **Step 5: Commit** `"Gacha: ตรรกะตู้อัญเชิญพิเศษ (สถานะ + คลังตัวเด่น)"`

---

### Task 2: `rollOne`/`rollMany` รับคลัง legendary เฉพาะกิจ

**Files:** `src/utils/gacha.js` · `src/utils/gacha.test.js`

- [ ] **Step 1: เทสที่ยังแดง**

```js
test('rollOne: ส่ง legendaryIds เฉพาะกิจเข้าไป = legendary ออกจากกองนั้นเท่านั้น', () => {
  const state = { pity: 49, target: null, guaranteed: false, ownedLegendaryIds: [] }   // hard pity = legendary แน่
  const r = rollOne(state, CAT, () => 0, { legendaryIds: ['virus'] })
  assert.equal(r.rarity, 'legendary')
  assert.equal(r.id, 'virus')
})

test('rollOne: ไม่ส่ง opts = พฤติกรรมเดิมเป๊ะ (อ่าน legendary จาก catalog)', () => {
  const state = { pity: 49, target: null, guaranteed: false, ownedLegendaryIds: [] }
  const r = rollOne(state, CAT, () => 0)
  assert.ok(CAT.filter(p => p.rarity === 'legendary').map(p => p.id).includes(r.id))
})
```

(`CAT` = แค็ตตาล็อกจำลองที่มีอยู่แล้วในไฟล์เทสนั้น — ถ้ายังไม่มี legendary หลายตัว ให้เติมให้ครบก่อน)

- [ ] **Step 2:** รัน → FAIL
- [ ] **Step 3: ลงมือ** — เปลี่ยนลายเซ็นเป็น

```js
export function rollOne(state, catalog, rng = Math.random, opts = {}) {
  // legendaryIds override = คลัง legendary ของ "ตู้นี้" (ตู้อีเวนต์ดันตัวเด่นก่อน) · ไม่ส่ง = เหมือนเดิมเป๊ะ
  const legendaryIds = opts.legendaryIds?.length ? opts.legendaryIds : rarityPool(catalog, 'legendary')
  …
}
export function rollMany(n, state, catalog, rng = Math.random, opts = {}) { … ส่งต่อ opts … }
```

⚠️ การันตี ≥1 epic ต่อ 10-pull ที่อยู่ใน `rollMany` **ห้ามเปลี่ยนพฤติกรรม** — ตรวจว่ายังผ่านเทสเดิมทั้งหมด

- [ ] **Step 4:** เทสทั้งชุดเขียว
- [ ] **Step 5: Commit** `"Gacha: rollOne/rollMany รับคลัง legendary ของตู้นั้นได้ (ดีฟอลต์เหมือนเดิม)"`

---

### Task 3: แยกแบนเนอร์เป็น component (พฤติกรรมเดิมเป๊ะ)

**Files:** สร้าง `src/components/shop/GachaBanner.vue` · แก้ `src/views/ShopView.vue`

**Interfaces (Produces):** props
`title` `icon` `subtitle?` `event?: boolean` `msLeft?: number` `featured?: PetDef[]` `pityLeft` `tickets` `coins` `busy` `showTarget: boolean` `targetPet?` `guaranteed?`
events: `@pull(n)` `@open-target`

- [ ] **Step 1:** ย้าย markup ของแบนเนอร์ปัจจุบัน (หัวข้อ · pity · target-row · rates · ticket-note · pull-row)
      ไปไว้ใน component พร้อม CSS ที่เกี่ยวข้อง **โดยไม่เปลี่ยนคลาสและข้อความ**
- [ ] **Step 2:** `ShopView` ใช้ `<GachaBanner … @pull="pull" @open-target="pickerOpen = true" />` สำหรับตู้ปกติ
- [ ] **Step 3:** `npm run build` ผ่าน + เปิดดูด้วยตาว่าหน้าตาเหมือนเดิมทุกจุด (ยังไม่มีอะไรใหม่ให้เห็น)
- [ ] **Step 4:** เทสทั้งชุดเขียว
- [ ] **Step 5: Commit** `"Shop: แยกแบนเนอร์อัญเชิญเป็น component (ยังเหมือนเดิมทุกจุด)"`

---

### Task 4: แบนเนอร์อีเวนต์ + เส้นทางหมุนของตู้อีเวนต์

**Files:** `src/views/ShopView.vue` · `src/components/shop/GachaBanner.vue`

- [ ] **Step 1:** ต่อสถานะอีเวนต์

```js
const evState = computed(() => eventState(rawConfig.value?.gachaEvent, nowTick.value))
const featuredPets = computed(() => evState.value.featured.map(id => PETS.find(p => p.id === id)).filter(Boolean))
```

`nowTick` = `ref(Date.now())` + `setInterval(1000)` ใน `onMounted` (เคลียร์ใน `onUnmounted`)
⇒ นับถอยหลังเดินจริง และตู้ **หายเองตอนหมดเวลาโดยไม่ต้องรีโหลด**

- [ ] **Step 2:** วางแบนเนอร์อีเวนต์ **เหนือ** แบนเนอร์ปกติ (แสดงเมื่อ `evState.active`)
  - ป้ายมุม `EVENT` · ชื่ออีเวนต์ · นับถอยหลัง `เหลืออีก X วัน HH:MM` · แถวตัวเด่น 3 ตัว (อีโมจิ + ชื่อ)
  - **ไม่มีแถวเป้าหมาย** (`showTarget: false`) · เรตแสดงชุดเดียวกับตู้ปกติ
  - บรรทัดกำกับ: "คลังเต็ม 33 ตัว · legendary ดันตัวเด่นที่ยังไม่มีก่อน"
- [ ] **Step 3:** เส้นทางหมุนแยก — `pull(n, { event: true })`

```js
  const catalogNow = ev ? PETS : catalog.value              // ตู้อีเวนต์ = คลังเต็ม 33
  const state = ev
    // 🔴 ตู้อีเวนต์ต้องไม่แตะการันตี 50/50 ของตู้ปกติ ⇒ ส่ง target/guaranteed เป็นค่าว่างเข้าไป
    //    แล้วตอนเขียนกลับก็เขียนแค่ pity (ดูด้านล่าง) — ผู้เล่นสะสม 50/50 ไว้กับตู้ปกติ ห้ามให้อีเวนต์กิน
    ? { pity: pity.value, target: null, guaranteed: false, ownedLegendaryIds: ownedLegendaryIds() }
    : { pity: pity.value, target: target.value, guaranteed: guaranteed.value, ownedLegendaryIds: ownedLegendaryIds() }
  const opts = ev ? { legendaryIds: eventLegendaryIds(evState.value.featured, ownedLegendaryIds(), PETS) } : {}
  const { results, nextState } = rollMany(rolls, state, catalogNow, undefined, opts)
```

และตอนเขียน user doc:

```js
  const base = ev
    ? { pets: newPets, dailyQuest: dq, gachaPity: nextState.pity }               // ห้ามมี gachaGuaranteed
    : { pets: newPets, dailyQuest: dq, gachaPity: nextState.pity, gachaGuaranteed: nextState.guaranteed }
```

- [ ] **Step 4:** เทสทั้งชุดเขียว + build + ตรวจด้วยตา (ตั้ง `gachaEvent` ชั่วคราวใน Firestore หรือ mock)
- [ ] **Step 5: Commit** `"Shop: แบนเนอร์ตู้อัญเชิญพิเศษ + นับถอยหลัง (ไม่แตะการันตีของตู้ปกติ)"`

---

### Task 5: อนิเมชันไต่สีลูกแก้ว

**Files:** `src/views/ShopView.vue`

🔴 ของเดิมเฉลยคำตอบตั้งแต่วินาทีแรก: `--glow: rarityColor(reveal.best)` ⇒ 1.3 วิที่ควรลุ้น บอกผลไปแล้ว

- [ ] **Step 1:** ระหว่าง `phase === 'anticipate'` ไต่สีทีละขั้น **ขาว → ฟ้า → ม่วง → ทอง** โดยหยุดที่ขั้นของผลจริง

```js
// ไต่สีทีละขั้นจนถึงระดับของผลจริง — ขั้นสูงกว่าอยู่ได้สั้นลง (เร่งจังหวะ) แล้วค่อยเผย
const CLIMB = ['#94a3b8', '#38bdf8', '#a855f7', '#fbbf24']   // ขาว→ฟ้า→ม่วง→ทอง
const climb = ref(0)
```

- ตั้ง `setTimeout` ไล่ขั้นจาก 0 ถึง `RANK[best]` ภายในงบ 1,300ms เท่าเดิม (**ห้ามยืดเวลารวม**)
- ผูก `--glow: CLIMB[climb]` แทนค่าคงที่ · ขั้นสูงเพิ่มความสั่น/ความเร็วด้วยคลาส `.t3`/`.t2`
- 🔒 **ห้ามแตะตรรกะสุ่ม** — อนิเมชันอ่านผลที่สุ่มเสร็จแล้วอย่างเดียว
- 🔒 ทาง reduced-motion เดิม (ข้ามไป `show` ทันที) ต้องยังทำงาน · กดข้ามระหว่างไต่ต้องได้เหมือนเดิม
- [ ] **Step 2:** เคลียร์ timer ทุกตัวใน `skipReveal`/`closeReveal` (ของเดิมมี `revealTimer` ตัวเดียว — ตอนนี้มีหลายตัว
      ให้เก็บเป็น array แล้วล้างทั้งชุด ไม่งั้นสีไต่ต่อหลังปิดจอ)
- [ ] **Step 3:** build + ตรวจด้วยตา (หมุนหลายรอบ ดูว่า common ไม่ไต่ถึงทอง)
- [ ] **Step 4:** เทสทั้งชุดเขียว
- [ ] **Step 5: Commit** `"Shop: ลูกแก้วไต่สีทีละขั้นแทนการเฉลยตั้งแต่วินาทีแรก"`

---

### Task 6: การ์ดแอดมิน "ตู้อัญเชิญพิเศษ"

**Files:** `src/views/AdminView.vue`

- [ ] **Step 1:** การ์ดใหม่ (แพทเทิร์นเดียวกับการ์ด "โหมดซ่อมบำรุง")
  - สถานะ: `🟢 เปิดอยู่ · เหลือ X วัน HH:MM` หรือ `⚪ ยังไม่มีอีเวนต์`
  - ปุ่ม **เริ่ม 7 วัน** · **เริ่ม 14 วัน** → `setDoc(config/app, { gachaEvent: { name, endsAt } }, { merge: true })`
  - ปุ่ม **จบตอนนี้** → เขียน `endsAt: Date.now()` (ไม่ใช่ธงแยก · ไม่ลบ doc)
  - hint: "หมดเวลาแล้วเพ็ทใหม่จะไหลเข้าตู้ปกติเอง ไม่ต้องกดอะไรอีก"
  - 🔴 `endsAt` เขียนเป็น **มิลลิวินาที (number)** ให้ตรงกับที่ `eventState`/`releasedPets` อ่าน
    (เขียน `serverTimestamp()` ไม่ได้ — snapshot ที่ยังไม่ยืนยันจะกลับมาเป็น `null` แล้วอีเวนต์หายเงียบ
     บทเรียนเดิมของโปรเจกต์: CLAUDE.md ข้อ 10)
- [ ] **Step 2:** ปุ่มยืนยันก่อนเขียน (`ConfirmModal` ที่มีอยู่) — เปิดอีเวนต์คือของที่ทั้งชั้นปีเห็นทันที
- [ ] **Step 3:** build ผ่าน + เทสทั้งชุดเขียว
- [ ] **Step 4: Commit** `"Admin: การ์ดเปิด/จบตู้อัญเชิญพิเศษ (7/14 วัน · ปิดด้วยนาฬิกา)"`

---

### Task 7: ปิดเฟส

- [ ] `node --test $(find src -name "*.test.js")` · `npm run build`
- [ ] เขียนสรุปสถานะ P5 ต่อท้ายสเปกแม่ §6 (commit range · เลขเทส · ของที่ต่างจากแผน)
- [ ] push `master` → Actions deploy · ตรวจว่ารันสำเร็จ
- [ ] **บอก user ให้กด "เริ่ม 7 วัน" เองเมื่อพร้อมเปิดตัว** — deploy แล้วตู้ยังไม่โผล่จนกว่าจะมีอีเวนต์จริง
