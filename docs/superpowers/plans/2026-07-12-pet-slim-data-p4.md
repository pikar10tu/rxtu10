# P4 — Slim Pet Data Model (hydrate-on-read + slim-on-write) — Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`) syntax.

**Goal:** เก็บ pet instance แบบ slim `{id, grade, copies}` ใน Firestore, เติม identity (name/emoji/rarity/element) จาก catalog ตอนอ่าน — แก้ desync (catalog เป็นเจ้าของ) + doc หด + ตัด vestigial (instId/bornAt/potential) · **non-breaking (ไม่ forced migration) · gameplay-neutral**

**Architecture:** 2 จุดเท่านั้น — (A) `hydratePet` ใน `normalizeUserData` เติม field จาก `getPetDef` ตอนอ่าน user doc; (B) `slimPet` ใน `patchUser` slim `pets` เฉพาะ payload ที่เขียน Firestore (optimistic local คง fat ให้ display ทันที). members/PvP ไม่แตะ — `PetThumb`/`resolveBattleTeam` อ่าน identity จาก catalog (def) อยู่แล้ว → slim pets ของคนอื่นทำงานทันที.

**Tech Stack:** Vue 3 + Pinia, pure schema helpers, `node --test`.

## Global Constraints
- **gameplay-neutral:** hydrate เติมค่าจาก catalog = ค่าเดิม (pet ปัจจุบันมี name/emoji/rarity/element = catalog อยู่แล้ว) · grade/copies ไม่แตะ · เทสเดิมผ่าน
- **non-breaking:** doc เก่า (fat) อ่านได้ปกติ (hydrate ทับ), เขียนครั้งหน้าค่อย slim → ไม่ต้อง migrate ทั้งฐาน
- **ไม่แตะ:** engine/gacha logic · `resolveBattleTeam` · migration V2 เดิม (auth.js migratePets) · members store
- `hydratePet` ต้องทน 3 กรณี: fat doc (มี field), slim doc (id/grade/copies), catalog id หาย (fallback placeholder)
- **slim เฉพาะ Firestore write** ใน patchUser — **ห้าม slim optimistic** (local ต้อง fat เพื่อ display ทันทีก่อน snapshot รอบหน้า hydrate)
- commit `Area: อะไร (ทำไม)` ไทยปนอังกฤษ · verify: `node --test src/**/*.test.js` + `npm run build`

---

### Task 1: `hydratePet` + `slimPet` + normalizeUserData + test

**Files:**
- Modify: `src/data/userSchema.js` (เพิ่ม helper + ใช้ใน normalize ~111)
- Modify: `src/data/userSchema.test.js` (เพิ่มเทส hydrate/slim)

**Interfaces:**
- Consumes: `getPetDef` จาก `./index.js`
- Produces: `export function hydratePet(p)` · `export function slimPet(p)` · `normalizeUserData` คืน `d.pets` ที่ hydrate แล้ว

- [ ] **Step 1: เขียนเทส**

เพิ่มใน `src/data/userSchema.test.js` (import `hydratePet, slimPet` + `normalizeUserData`):
```js
import { normalizeUserData, hydratePet, slimPet } from './userSchema.js'
// (ถ้ามี import normalizeUserData อยู่แล้ว เพิ่ม hydratePet/slimPet เข้าไป)

test('hydratePet: slim {id,grade,copies} → เติม name/emoji/rarity/element จาก catalog', () => {
  const h = hydratePet({ id: 'cat', grade: 2, copies: 3 })
  assert.equal(h.rarity, 'common')      // cat = common ใน catalog
  assert.equal(h.element, 'scissors')   // cat = scissors
  assert.equal(h.grade, 2); assert.equal(h.copies, 3)
  assert.ok(h.name && h.emoji)
})
test('hydratePet: fat doc → catalog ทับ identity (แก้ desync) เก็บ grade/copies', () => {
  const h = hydratePet({ id: 'cat', grade: 1, copies: 0, rarity: 'legendary', name: 'ของเก่า', emoji: '👾', element: 'fist', instId: 'x', potential: [{}] })
  assert.equal(h.rarity, 'common')      // catalog ทับ 'legendary' เก่า
  assert.equal(h.element, 'scissors')
  assert.equal(h.instId, undefined)     // vestigial ถูกตัด
  assert.equal(h.potential, undefined)
  assert.deepEqual(Object.keys(h).sort(), ['copies','element','emoji','grade','id','name','rarity'])
})
test('hydratePet: catalog id หาย → fallback placeholder ไม่พัง', () => {
  const h = hydratePet({ id: 'ghost_removed', grade: 0, copies: 0 })
  assert.equal(h.rarity, 'common'); assert.equal(h.element, 'scissors'); assert.ok(h.emoji)
})
test('slimPet: เหลือแค่ id/grade/copies', () => {
  assert.deepEqual(slimPet({ id: 'cat', grade: 2, copies: 3, name: 'x', emoji: 'y', rarity: 'z', element: 'w', instId: 'q' }), { id: 'cat', grade: 2, copies: 3 })
})
test('normalizeUserData: pets ถูก hydrate (rarity มาจาก catalog)', () => {
  const d = normalizeUserData({ pets: [{ id: 'cat', grade: 0, copies: 0 }] })
  assert.equal(d.pets[0].rarity, 'common'); assert.ok(d.pets[0].emoji)
})
```

- [ ] **Step 2: รันเทส → fail** (`node --test src/data/userSchema.test.js`)

- [ ] **Step 3: เพิ่ม helper + ใช้ใน normalize**

ใน `src/data/userSchema.js` เพิ่ม import + helper (ตรวจว่ายังไม่ import getPetDef):
```js
import { getPetDef } from './index.js'

// เก็บ instance แบบ slim — identity มาจาก catalog ตอนอ่าน (hydratePet)
export function slimPet(p) {
  return { id: p.id, grade: p.grade || 0, copies: p.copies || 0 }
}
// เติม name/emoji/rarity/element จาก catalog (catalog เป็นเจ้าของ = แก้ desync)
// รับได้ทั้ง slim/fat/def หาย (fallback placeholder ไม่ให้ view พัง)
export function hydratePet(p) {
  const def = getPetDef(p?.id) || {}
  return {
    id: p?.id,
    grade: p?.grade || 0,
    copies: p?.copies || 0,
    name:    def.name    ?? p?.name    ?? '?',
    emoji:   def.emoji   ?? p?.emoji   ?? '❓',
    rarity:  def.rarity  ?? p?.rarity  ?? 'common',
    element: def.element ?? p?.element ?? 'scissors',
  }
}
```
แก้บรรทัด normalize pets (ปัจจุบัน `d.pets = Array.isArray(d.pets) ? d.pets : []` ~111):
```js
  d.pets       = (Array.isArray(d.pets) ? d.pets : []).map(hydratePet)
```

- [ ] **Step 4: รันเทส → pass** + เทสเดิม userSchema ผ่าน (`node --test src/data/userSchema.test.js`)

- [ ] **Step 5: Commit**

```bash
git add src/data/userSchema.js src/data/userSchema.test.js
git commit -m "PetSlim: hydratePet/slimPet + normalizeUserData hydrate own pets จาก catalog (แก้ desync, รับ slim/fat)"
```

---

### Task 2: patchUser slim `pets` ตอนเขียน Firestore

**Files:**
- Modify: `src/stores/auth.js` (`patchUser` ~114–130, import slimPet)

**Interfaces:**
- Consumes: `slimPet` จาก `../data/userSchema.js`
- Produces: การเขียน user doc ที่มี `pets` → Firestore ได้ slim `{id,grade,copies}` (optimistic local คง fat)

> ⚠️ slim เฉพาะ **payload ที่เขียน** (`server ?? optimistic`) · ห้าม slim `optimistic` ที่ setUserDataOptimistic (local ต้อง fat)
> `pets` ในทุก write site เป็น plain array เสมอ (ไม่มี arrayUnion) — safe map

- [ ] **Step 1: import slimPet**

เพิ่มใน auth.js (ใกล้ import userSchema): ตรวจว่า import `normalizeUserData` จาก '../data/userSchema.js' อยู่แล้ว → เพิ่ม `slimPet`:
```js
import { normalizeUserData, USER_DEFAULTS, slimPet } from '../data/userSchema.js'
```
(ปรับให้ตรงกับ import เดิมจริง)

- [ ] **Step 2: slim ใน patchUser**

แก้ใน `patchUser` (บล็อก `await updateDoc(...)` ~120):
```js
        setUserDataOptimistic(optimistic)   // local คง fat (display ทันที)
        try {
            const payload = server ?? optimistic
            // slim เฉพาะที่เขียนลง Firestore — pets เก็บแค่ {id,grade,copies}, identity มาจาก catalog ตอนอ่าน (normalizeUserData)
            const toWrite = Array.isArray(payload.pets) ? { ...payload, pets: payload.pets.map(slimPet) } : payload
            await updateDoc(doc(db, 'users', currentUser.value.uid), toWrite)
            useUsageStore().track(0, 1)
            return true
```

- [ ] **Step 3: verify — full suite + build + ทดลอง dev**

Run: `node --test src/**/*.test.js` → ผ่านหมด (gameplay-neutral)
Run: `npm run build` → สำเร็จ
ทดลอง (dev): อัพเกรดเพ็ท/เปิดกาชา → เพ็ทแสดงชื่อ/emoji ปกติ · reload → เพ็ทยังอยู่ครบ (hydrate จาก doc slim) · เช็ค Firestore console: pets ใหม่เป็น `{id,grade,copies}` (ไม่มี name/instId/potential) · หน้าสมาชิก/Arena คู่ต่อสู้ยัง render เพ็ทได้

- [ ] **Step 4: Commit**

```bash
git add src/stores/auth.js
git commit -m "PetSlim: patchUser slim pets ตอนเขียน Firestore (doc หด, optimistic คง fat) — non-breaking"
```

---

## Self-Review
- Part A hydrate-on-read → Task 1 (normalizeUserData + hydratePet, ทน slim/fat/def-หาย) ✓
- Part B slim-on-write → Task 2 (patchUser, server payload เท่านั้น) ✓
- members/PvP ไม่แตะ — PetThumb/resolveBattleTeam catalog-based อยู่แล้ว (ยืนยันตอน brainstorm) ✓
- vestigial (instId/bornAt/potential) ตัดผ่าน hydratePet+slimPet (ไม่เก็บ ไม่อ่าน) ✓
- **gameplay-neutral proof:** เทสเดิมทั้งชุดผ่าน + hydrate เติมค่า catalog = ค่าเดิม
- **non-breaking:** doc fat เก่าอ่านได้ (hydrate), หดตอนเขียนครั้งหน้า — ไม่มี forced migration

## Open items / ความเสี่ยงที่ต้องเฝ้า (implementer อ่าน)
- gachaMerge ยังสร้าง inst แบบ fat (instId/bornAt/potential) — **ไม่ต้องแก้** (patchUser slim ตอนเขียน + hydrate ตอนอ่าน ทำให้ irrelevant) · ถ้าจะเก็บกวาดให้สร้าง slim เลย = optional follow-up ไม่อยู่ P4
- ProfileModal `showcase` มี `instId` fallback — dead หลัง slim แต่ไม่พัง (path `p.id===id` ทำงาน)
- ยืนยัน `payload.pets` ไม่เคยเป็น FieldValue (arrayUnion) — ทุก write site ส่ง array เต็ม (grep ยืนยันตอน implement)

## Deploy
frontend + schema logic เท่านั้น (ไม่แตะ rules/index) → deploy = `git push` (Pages) หลัง review · **verify:** full suite ผ่าน + ทดลอง reload เพ็ทไม่หาย (hydrate ทำงาน)
