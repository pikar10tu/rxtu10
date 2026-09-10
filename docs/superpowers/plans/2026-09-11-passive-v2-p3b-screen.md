# P3b — ฝั่งจอที่บอกความจริง Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:executing-plans · steps ใช้ checkbox

**Goal:** ทำให้สิ่งที่ผู้เล่นเห็นตรงกับสิ่งที่เกิดขึ้นจริงในไฟต์ (ชั้นเชื้อ · เกราะ · ความแค้น) และบอกผู้เล่นว่าเพ็ทตัวไหนเปลี่ยนกลไก + มีของใหม่กำลังมา

**Architecture:** ป้าย "ค่าคงที่ตั้งแต่ต้นไฟต์" ยังมาจาก `buffSources()` เหมือนเดิม (static) · สถานะที่เปลี่ยนระหว่างไฟต์แยกเป็น 2 ทาง — **บนการ์ด** ใช้ชั้น FX (element ที่ promote ถาวรอยู่แล้ว ไม่แตะ DOM ของการ์ด) · **ในหน้าต่าง inspect** ใช้ `liveBuffs()` ที่อ่าน beat ที่เล่นไปแล้ว และถูกเรียกตอนไฟต์พักเท่านั้น

**Tech Stack:** Vue 3 · `node:test` · WAAPI ผ่าน `utils/battleFx.js`

**สเปก:** `docs/superpowers/specs/2026-09-10-passive-v2-p3-design.md` §7

## Global Constraints

- **branch `passive-v2-p3` (ต่อจาก P3a) — merge เข้า master เมื่อจบ P3b ทั้งก้อน**
- เทสฐาน **1,150 ผ่าน** · `node --test $(find src -name "*.test.js")` เขียวทุกคอมมิต · `npm run build` ผ่าน
- 🔒 **ห้ามให้ป้ายบนการ์ดเปลี่ยน paint ขณะการ์ดมีอนิเมชัน** (v3 doctrine ของ `BattleReplay` — บทเรียนเคสกระตุก iOS Safari: raster การ์ดเต็มใบทุกหมัด = paint-bound) ⇒ ของที่เปลี่ยนระหว่างไฟต์ต้องอยู่ชั้น FX · **ห้ามผูก `liveBuffs()` เข้ากับป้ายบนการ์ด**
- 🔒 ห้ามเพิ่มจำนวน beat · ห้ามแตะเอนจินหรือตรรกะสุ่ม (P3b เป็นงานแสดงผลล้วน ยกเว้น `buffSources` ที่เป็น pure)
- ป้ายต้องมาจาก `utils/battleBuffs.js` ที่เดียว · ไอคอนต้องมีไฟล์จริงใน `public/emoji/fluent/`
- ข้อความทุกชิ้นตาม CLAUDE.md ข้อ 16 (กระชับ · บอกตัวเลขตรงๆ) และ `docs/voice-guide.md`
- overlay `position:fixed` ใต้ `<RouterView>` ต้อง `<Teleport to="body">` (CLAUDE.md ข้อ 6)

## ผลวัดที่ใช้ตัดสิน (วัดจริง 11 ก.ย. ด้วย `scripts/badge-load-sim.mjs`)

ทีมสุ่ม 5,000 คู่ · การ์ด 30,000 ใบ · **เฉลี่ย 1.15 ป้าย/ใบ · สูงสุด 5**
`0 ป้าย 21.4% · 1 ป้าย 48.2% · 2 ป้าย 25.0% · 3 ป้าย 4.8% · 4 ป้าย 0.6% · 5 ป้าย 0.0%`
**เพดาน 3 → ตัดป้ายทิ้ง 0.6% · เพดาน 4 → 0.0%**

⇒ สเปก §7.2 เดาว่า "ของใหม่จะชนเพดานบ่อยกว่ามาก" — **วัดแล้วไม่จริง** เพราะเพ็ทใหม่ส่วนใหญ่เป็นผลของ *เจ้าตัวเอง* (berserk/giantSlayer/taunt) ไม่ใช่ออร่าที่แผ่ทั้งทีม ⇒ **ขยับเพดานเป็น 4 พอ ไม่ต้องรื้อ** (ยังต้องมีลำดับความสำคัญ เพราะป้ายชั้นเชื้อจากชั้น FX มาแย่งพื้นที่เดียวกันบนการ์ด)

## File Structure

| ไฟล์ | หน้าที่ในเฟสนี้ |
|---|---|
| `src/data/petPassives.js` | `STATUS_MAX` 3→4 · `BADGE_PRIORITY` ใหม่ · ไอคอน `elementTrinity` |
| `src/utils/battleBuffs.js` | `badgesOf` เรียงตามความสำคัญ · `elementTrinity` ต้องไม่โกหก · `liveBuffs` อ่านสถานะเพิ่ม |
| `src/utils/battleFx.js` | `stateMark(uid, char, n)` — ป้ายสถานะค้างบนการ์ดในชั้น FX (แพทเทิร์นเดียวกับ `dangerRing`) |
| `src/components/battle/BattleReplay.vue` | เรียก `stateMark` จาก event ที่มีอยู่ · ส่ง uid ให้ `liveBuffs` · CSS ของป้าย |
| `src/views/PetsView.vue` | การ์ดเงาดำ "เร็วๆ นี้" + แถบ "พาสสีฟอัปเดต" |
| `scripts/badge-load-sim.mjs` | เครื่องมือวัดถาวร (เขียนแล้ว — commit ใน Task 1) |

---

### Task 1: เพดานป้าย 4 + ลำดับความสำคัญ

**Files:** `src/data/petPassives.js` · `src/utils/battleBuffs.js` · `src/utils/battleBuffs.test.js` · `scripts/badge-load-sim.mjs`

- [ ] **Step 1: เทสที่ยังแดง** — เติมใน `battleBuffs.test.js` (import `STATUS_MAX` เพิ่ม)

```js
test('ป้ายบนการ์ด: เพดาน 4 และเรียงตามความสำคัญ (ของที่เปลี่ยนสถานการณ์มาก่อนบัฟเล็ก)', () => {
  const list = [
    { icon: '⚔️', effect: 'teamAtk', buff: true },
    { icon: '🏰', effect: 'armorStack', buff: true },
    { icon: '💥', effect: 'teamCrit', buff: true },
    { icon: '📢', effect: 'taunt', buff: true },
    { icon: '❤️', effect: 'teamHp', buff: true },
  ]
  assert.equal(STATUS_MAX, 4)
  const out = badgesOf(list, STATUS_MAX).map(b => b.key)
  assert.deepEqual(out.slice(0, 2), ['armorStack', 'taunt'])   // สองอันนี้ต้องรอดเสมอ
  assert.equal(out.length, 4)
})

test('badgesOf: ความสำคัญเท่ากัน = ยึดลำดับเดิมของรายการ (เสถียร ไม่สลับมั่ว)', () => {
  const list = [
    { icon: '❤️', effect: 'teamHp', buff: true },
    { icon: '⚔️', effect: 'teamAtk', buff: true },
  ]
  assert.deepEqual(badgesOf(list, 4).map(b => b.key), ['teamHp', 'teamAtk'])
})
```

- [ ] **Step 2:** `node --test src/utils/battleBuffs.test.js` → FAIL (`STATUS_MAX` = 3)

- [ ] **Step 3: ลงมือ** — ใน `petPassives.js` แทนที่บรรทัด `STATUS_MAX` เดิม

```js
/** สูงสุดกี่ป้ายต่อการ์ด — วัดใหม่ 11 ก.ย. 2026 ด้วยคลัง 33 ตัว (`scripts/badge-load-sim.mjs`,
 *  ทีมสุ่ม 5,000 คู่ = การ์ด 30,000 ใบ): เฉลี่ย 1.15 · เพดาน 3 ตัดทิ้ง 0.6% · เพดาน 4 ตัดทิ้ง 0.0%
 *  ⇒ ขยับเป็น 4 · ยังต้องมี BADGE_PRIORITY เพราะป้ายชั้นเชื้อ (ชั้น FX) มาแย่งพื้นที่เดียวกันบนการ์ด */
export const STATUS_MAX = 4

/** ป้ายไหนสำคัญกว่าเมื่อพื้นที่ไม่พอ — เลขน้อย = มาก่อน · ไม่อยู่ในนี้ = 50 (เรียงตามลำดับเดิม)
 *  🔑 เกณฑ์: "อ่านแล้วเปลี่ยนความเข้าใจว่าไฟต์กำลังเป็นยังไง" มาก่อน "บัฟตัวเลขที่รู้ก็ทำอะไรไม่ได้" */
export const BADGE_PRIORITY = {
  infect: 0, armorStack: 1, taunt: 2, guardian: 3, cheatDeath: 4, revive: 4, saveAlly: 4,
  stackAtk: 10, atkOnHit: 10, berserk: 11, giantSlayer: 11, stealStats: 12,
  elementTrinity: 20, enemyVuln: 21, teamDamageReduction: 22, dodge: 23, thorns: 23,
  teamLifesteal: 30, healOnAttack: 30, teamHp: 31, teamAtk: 31, teamAtkElement: 31,
  teamCrit: 32, duoRegen: 33,
}
```

ใน `battleBuffs.js` — import `BADGE_PRIORITY` แล้วให้ `badgesOf` เรียงก่อนตัด (เสถียร: index เดิมเป็นตัวตัดสินเมื่อเท่ากัน)

```js
export function badgesOf(list, max) {
  const seen = new Set()
  const out = []
  const ranked = (list || []).map((b, i) => ({ b, i }))
    .sort((x, y) => (BADGE_PRIORITY[x.b.effect] ?? 50) - (BADGE_PRIORITY[y.b.effect] ?? 50) || x.i - y.i)
  for (const { b } of ranked) {
    if (!b.icon || seen.has(b.effect)) continue
    seen.add(b.effect)
    out.push({ key: b.effect, icon: b.icon, label: STATUS_TEXT[b.effect] || '', buff: b.buff })
    if (out.length >= max) break
  }
  return out
}
```

- [ ] **Step 4:** `node --test $(find src -name "*.test.js")` เขียวทั้งชุด
- [ ] **Step 5: Commit** — `git add -A && git commit -m "Badges: เพดาน 4 + เรียงตามความสำคัญ (วัดจากทีมสุ่ม 5,000 คู่)"`

---

### Task 2: ป้าย 🦁 ต้องไม่โกหก + ไอคอนที่มีไฟล์จริง

**Files:** `src/utils/battleBuffs.js` · `src/data/petPassives.js` · `src/utils/battleBuffs.test.js`

`elementTrinity` ทำงาน **ก็ต่อเมื่อทีมครบ 3 สาย** แต่ `aurasOf()` แปะป้ายให้ทุกทีมที่มีสิงโต ⇒ ทีมที่ขาดสายก็เห็นป้ายทั้งที่ไม่ได้อะไรเลย · ข้อมูลที่ต้องใช้ตัดสิน (`team[].element`) อยู่ในมืออยู่แล้ว

- [ ] **Step 1: เทสที่ยังแดง**

```js
test('ป้ายอาณัติเจ้าป่าขึ้นเฉพาะทีมที่ครบ 3 สาย — ทีมขาดสายต้องไม่เห็น', () => {
  const q = (id, element) => ({ id, element })
  const full = buffSources([q('lion', 'fist'), q('fox', 'scissors'), q('panda', 'paper')], [q('cat', 'scissors')])
  assert.ok(full.A0.some(b => b.effect === 'elementTrinity'))
  const missing = buffSources([q('lion', 'fist'), q('shark', 'fist'), q('wolf', 'fist')], [q('cat', 'scissors')])
  assert.equal(missing.A0.some(b => b.effect === 'elementTrinity'), false)
})

test('ทีมที่ไม่ได้ส่ง element มาด้วย ต้องยังตัดสินได้จากคลัง (ไม่ใช่เงียบแล้วซ่อนป้าย)', () => {
  const full = buffSources([{ id: 'lion' }, { id: 'fox' }, { id: 'panda' }], [{ id: 'cat' }])
  assert.ok(full.A0.some(b => b.effect === 'elementTrinity'))
})
```

- [ ] **Step 2:** รัน → FAIL
- [ ] **Step 3: ลงมือ** — ใน `aurasOf()` ของ `battleBuffs.js`

```js
/** สายของทีม — pet object จากหน้าไฟต์มี element ติดมาอยู่แล้ว แต่ fallback ไปคลังไว้ด้วย
 *  (เทส/ผู้เรียกบางทางส่งมาแค่ id) · ถ้าเดาไม่ได้เลยจะกลายเป็น undefined ซึ่งนับเป็นสายไม่ได้ */
const elementsOf = (t) => new Set((t || []).filter(Boolean)
  .map(p => p.element || getPetDef(p.id)?.element).filter(Boolean))
```

แล้วในลูป `partsAt(p, 'aura')` ก่อน push:

```js
      // elementTrinity ทำงานเมื่อทีมครบ 3 สายเท่านั้น (เงื่อนไขเดียวกับ applyAuras ในเอนจิน)
      // ไม่เช็ค = ทีมที่ขาดสายเห็นป้ายทั้งที่ไม่ได้บัฟอะไรเลย → ป้ายโกหก
      if (part.effect === 'elementTrinity' && elementsOf(team).size < 3) continue
```

และใน `petPassives.js` เปลี่ยนไอคอน: `elementTrinity: '🧩'`
(🔺 ไม่มีไฟล์ใน Fluent ⇒ fallback เป็นอีโมจิของเครื่อง หน้าตาต่างกันทุกอุปกรณ์ · 🧩 = "ต่อครบชุด" อ่านตรงความหมายและมีไฟล์อยู่แล้ว)

- [ ] **Step 4:** เทสทั้งชุดเขียว
- [ ] **Step 5: Commit** — `"Badges: ป้ายอาณัติเจ้าป่าขึ้นเฉพาะทีมที่ครบ 3 สาย + ไอคอนที่มีไฟล์จริง"`

---

### Task 3: `liveBuffs()` อ่านสถานะจริงเพิ่ม (หน้าต่าง inspect)

**Files:** `src/utils/battleBuffs.js` · `src/utils/battleBuffs.test.js` · `src/components/battle/BattleReplay.vue`

วันนี้ `liveBuffs` เติมสถานะสดได้แค่ `stackAtk` กับกลุ่มใช้แล้วหมด · P3a เพิ่มของที่ต้องอ่านจาก event: `armorStack` (เหลือกี่ชั้น) · `atkOnHit` (สะสมกี่ชั้น) · `infect` (เป้าติดกี่ชั้น — ไม่อยู่ใน `sources` เพราะไม่ใช่ค่าคงที่ก่อนไฟต์)

- [ ] **Step 1: เทสที่ยังแดง**

```js
const pev = (o) => ({ t: 'passive', ...o })

test('liveBuffs: เกราะบอกจำนวนชั้นที่เหลือจริง', () => {
  const src = buffSources([{ id: 'mammoth', element: 'paper' }], [{ id: 'cat', element: 'scissors' }])
  const beats = [pev({ effect: 'armorStack', uid: 'A0', armorLeft: 1 })]
  const b = liveBuffs(src.A0, beats, 0, 'A0').find(x => x.effect === 'armorStack')
  assert.equal(b.stacks, 1)
})

test('liveBuffs: ความแค้นของกอริลลานับชั้นจาก event และไม่มีเพดานให้โชว์', () => {
  const src = buffSources([{ id: 'gorilla', element: 'paper' }], [{ id: 'cat', element: 'scissors' }])
  const beats = [pev({ effect: 'atkOnHit', uid: 'A0', amount: 3 })]
  const b = liveBuffs(src.A0, beats, 0, 'A0').find(x => x.effect === 'atkOnHit')
  assert.equal(b.stacks, 3)
  assert.equal(b.maxStacks, 0)          // 0 = ไม่มีเพดาน ⇒ UI ต้องไม่วาด "x/max"
})

test('liveBuffs: ชั้นเชื้อโผล่บนรายการของ "เป้า" แม้ไม่มีใน sources', () => {
  const src = buffSources([{ id: 'virus', element: 'scissors' }], [{ id: 'cat', element: 'scissors' }])
  const beats = [pev({ effect: 'infect', uid: 'A0', targets: ['B0'], amount: 2 })]
  const onTarget = liveBuffs(src.B0, beats, 0, 'B0').find(x => x.effect === 'infect')
  assert.equal(onTarget.stacks, 2)
  assert.equal(liveBuffs(src.A0, beats, 0, 'A0').some(x => x.effect === 'infect'), false)
})

test('liveBuffs: ไม่ส่ง uid ก็ต้องไม่พัง (ผู้เรียกเก่ายังอยู่ได้)', () => {
  const src = buffSources([{ id: 'virus', element: 'scissors' }], [{ id: 'cat', element: 'scissors' }])
  assert.ok(Array.isArray(liveBuffs(src.A0, [], -1)))
})
```

- [ ] **Step 2:** รัน → FAIL
- [ ] **Step 3: ลงมือ** — เปลี่ยนลายเซ็นเป็น `liveBuffs(sources, beats, idx, uid = null)` แล้ว

```js
    if (b.effect === 'stackAtk' || b.effect === 'atkOnHit') {
      // amount ของสองอันนี้คือ "จำนวนชั้นสะสม" (กติกาใน docblock ของ ev() ใน battlePassives.js)
      // atkOnHit ไม่มี value.max ⇒ maxStacksOf คืน 0 = ไม่มีเพดาน ⇒ UI ห้ามวาด "x/max"
      let stacks = 0
      for (const e of played) if (e?.t === 'passive' && e.effect === b.effect && e.uid === b.ownerUid) stacks = e.amount || stacks
      return { ...b, stacks, maxStacks: maxStacksOf(b) }
    }
    if (b.effect === 'armorStack') {
      // เกราะนับ "ที่เหลือ" ไม่ใช่ "ที่ใช้ไป" — เอนจินส่ง armorLeft มาให้ตรงๆ
      let left = null
      for (const e of played) if (e?.t === 'passive' && e.effect === 'armorStack' && e.uid === b.ownerUid) left = e.armorLeft
      return left === null ? b : { ...b, stacks: left, maxStacks: maxStacksOf(b) }
    }
```

และท้ายฟังก์ชัน (ก่อน return) เติมรายการเชื้อของ "ตัวนี้"

```js
  // เชื้อไม่ได้อยู่ใน sources (ไม่ใช่ค่าคงที่ก่อนไฟต์) — ต้องอ่านจาก event ที่ลงบนตัวนี้
  // ⚠️ ต้องอ่านทั้ง infect (แปะ) และ infectSpread (ย้ายเชื้อมาจากศพ) ไม่งั้นตัวที่รับเชื้อต่อจะไม่มีป้าย
  if (uid) {
    let n = 0
    for (const e of played) {
      if (e?.t !== 'passive') continue
      if ((e.effect === 'infect' || e.effect === 'infectSpread') && (e.targets || []).includes(uid)) n = e.amount || 0
    }
    if (n > 0) out.push({
      key: `infect:${uid}`, effect: 'infect', icon: STATUS_ICON.infect, label: STATUS_TEXT.infect,
      skillName: '', skillIcon: STATUS_ICON.infect, ownerUid: '', ownerName: '', ownerEmoji: '',
      self: false, buff: false, foeSide: true, stacks: n, maxStacks: 0,
    })
  }
```

ใน `BattleReplay.vue`: `return liveBuffs(buffMap.value[uid] || [], beats.value, idx.value, uid)`
และในรายการบัฟของหน้าต่าง inspect ถ้ามี `stacks` ให้ต่อท้ายว่า `×{stacks}` (แสดง `/{maxStacks}` เฉพาะเมื่อ `maxStacks > 0`)

- [ ] **Step 4:** เทสทั้งชุดเขียว + `npm run build`
- [ ] **Step 5: Commit** — `"Inspect: หน้าต่างดูสถานะอ่านเกราะ/ความแค้น/ชั้นเชื้อจากไฟต์จริง"`

---

### Task 4: ป้ายชั้นเชื้อบนการ์ด (ชั้น FX)

**Files:** `src/utils/battleFx.js` · `src/components/battle/BattleReplay.vue`

🔴 **ทำไมไม่ทำเป็นป้ายในการ์ด:** ป้ายในการ์ดมาจาก `statusMap` ซึ่งเป็น computed ที่ขึ้นกับ `props.data` เท่านั้น ถ้าผูกกับ beat ปัจจุบัน การ์ดจะ re-render ทุกบีต = re-raster ทั้งใบขณะมีอนิเมชัน — อาการเดียวกับเคสกระตุก iOS Safari ที่แก้ด้วยสถาปัตยกรรม v3 ⇒ **ของที่เปลี่ยนระหว่างไฟต์ต้องอยู่ชั้น FX** (แพทเทิร์นเดียวกับ `dangerRing` ที่เป็นสถานะค้างอยู่แล้ว)

- [ ] **Step 1: เพิ่มพูล + API ใน `battleFx.js`**
  - ประกาศ `const markOn = new Map()` ข้างๆ `dangerOn`
  - เพิ่มพูล `mark` (6 ช่อง) ใน `buildPools()` แบบเดียวกับพูลอื่น
  - ล้างใน `cancelAll()`: `stateMarkClearAll()`

```js
  /** ป้ายสถานะค้างบนการ์ด (วันนี้มีแค่ชั้นเชื้อ) — n = 0/ไม่ส่ง ⇒ เอาออก
   *  🔒 อยู่ชั้น FX ไม่ใช่ DOM ของการ์ด — การ์ดต้องไม่ re-raster เพราะตัวเลขนี้เปลี่ยน */
  function stateMark(uid, char, n) {
    const cur = markOn.get(uid)
    if (!n) { if (cur) { cur.style.opacity = '0'; markOn.delete(uid) } return }
    const el = cur || pool.mark.find(e => !Array.from(markOn.values()).includes(e))
    if (!el) return
    const base = baseXform(uid, 0, -26); if (!base) return
    el.style.transform = base
    el.style.opacity = '1'
    el.textContent = String(n)
    el.dataset.ico = char
    markOn.set(uid, el)
  }
  function stateMarkClearAll() { for (const el of markOn.values()) el.style.opacity = '0'; markOn.clear() }
```

  - export `stateMark`, `stateMarkClearAll` ใน object ที่ return
  - ไอคอนวาดด้วย `<img>` ลูกหนึ่งใบที่สร้างครั้งเดียวตอน `buildPools()` (อย่าสร้าง element ใหม่ทุกครั้งที่เลขเปลี่ยน — พูลมีไว้เพื่อไม่ให้เกิด element ใหม่กลางไฟต์) ⇒ ตั้ง `imgSrc(icoEl, char)` ครั้งแรกที่ใช้

- [ ] **Step 2: CSS ใน `BattleReplay.vue`** — ป้ายเล็ก พื้นเข้ม โค้งมน ตัวเลขอ่านออกบนพื้นเข้ม
  (CLAUDE.md ข้อ 13: สีตัวอักษรบนพื้นเข้ม อย่าก๊อปสไตล์ข้ามพื้นหลัง) · `pointer-events: none`

- [ ] **Step 3: ต่อสายในจุดที่เล่น event ของบีต**

```js
      // ชั้นเชื้อ: event แปะ/ย้าย ส่ง amount = ชั้นสะสมของ "เป้า" หลังเหตุการณ์นั้น
      if (e.effect === 'infect' || e.effect === 'infectSpread') {
        for (const t of e.targets || []) fx.stateMark(t, '🦠', e.amount || 0)
      }
```

  และตรงจุดที่การ์ดตาย (ที่เรียก `fx.ko(...)` อยู่แล้ว) → `fx.stateMark(uid, '🦠', 0)`
  (ไฟต์ใหม่ล้างเองผ่าน `fx.reset()` → `cancelAll()`)

- [ ] **Step 4:** เทสทั้งชุดเขียว + build · แล้ว **ตรวจด้วยตาในเบราว์เซอร์** (`npm run dev`, ไฟต์ที่มีไวรัส):
  เลขต้องขึ้นบนการ์ดเป้า เพิ่มตามหมัดของไวรัส ย้ายเมื่อเชื้อย้าย และหายเมื่อเป้าตาย
- [ ] **Step 5: Commit** — `"Replay: ชั้นเชื้อขึ้นเป็นตัวเลขบนการ์ดเป้า (ชั้น FX ไม่แตะการ์ด)"`

---

### Task 5: การ์ดเงาดำ "เร็วๆ นี้" ในหน้าเพ็ท

**Files:** `src/views/PetsView.vue`

- [ ] **Step 1:** computed ของเพ็ทที่ยังไม่เปิด

```js
// เพ็ทที่ยังแจกไม่ได้ = อยู่ในคลังเต็มแต่ไม่อยู่ในคลังที่แจกได้ (ดู utils/petCatalog.js)
const upcoming = computed(() => {
  const live = new Set(catalog.value.map(p => p.id))
  return PETS.filter(p => !live.has(p.id))
})
```

- [ ] **Step 2:** แถวการ์ดเงาดำท้ายรายการ (แสดงเมื่อ `upcoming.length` เท่านั้น)
  - หัวข้อกลุ่ม "กำลังจะมา" + บรรทัดรอง "ยังหมุนไม่ได้ตอนนี้"
  - เงาดำ: อีโมจิเพ็ท `filter: brightness(0); opacity: .45`
  - **ชื่อพาสสีฟ + `short` อ่านได้** (จุดประสงค์คือสร้างความอยาก ถ้าอ่านอะไรไม่ได้เลยก็ไม่ทำหน้าที่)
  - กดแล้วไม่มีอะไรเกิดขึ้น (ห้ามเปิด modal ที่ทำให้คิดว่ากดได้)
- [ ] **Step 3:** ตรวจด้วยตาที่ความกว้าง 390px — การ์ดต้องไม่ล้น
- [ ] **Step 4:** build ผ่าน
- [ ] **Step 5: Commit** — `"Pets: การ์ดเงาดำของเพ็ทที่กำลังจะมา"`

---

### Task 6: แถบ "พาสสีฟอัปเดต"

**Files:** `src/views/PetsView.vue`

- [ ] **Step 1:** รายชื่อเพ็ทที่เปลี่ยนกลไกในรอบนี้ เก็บเป็นค่าคงที่ที่เดียว

```js
// เพ็ทที่กลไกเปลี่ยนในรอบพาสสีฟ v2 (P2c + P3a) — ใช้เฉพาะแถบแจ้งครั้งเดียว ไม่ใช่ข้อมูลเกม
const PASSIVE_V2_CHANGED = ['cat', 'phoenix', 'cerberus', 'trex', 'wolf', 'ouroboros', 'qilin', 'bahamut',
                            'mammoth', 'turtle', 'mouse', 'unicorn', 'hamster']
```

- [ ] **Step 2:** แถบขึ้นเฉพาะคนที่ **มีเพ็ทในรายการนั้นจริง** และยังไม่เคยกดปิด
  - อ่านสถานะจาก user doc คีย์เดียว (เช่น `flags.passiveV2Seen`) · กดปิด → `patchUser(...)`
  - 🔴 **ตรวจก่อนเขียนว่า `patchUser` รองรับรูปไหน** — โปรเจกต์นี้เคยมีปัญหา dot-notation write
    ถ้าไม่ชัวร์ให้ส่ง object ซ้อนทั้งก้อน (`{ flags: { ...เดิม, passiveV2Seen: true } }`)
  - ⚠️ `set(merge)` กับ map ทั้งก้อนเคยล้างข้อมูลเดิมมาแล้ว — ต้องรวมค่าเดิมเสมอ
- [ ] **Step 3:** เนื้อความสั้น: บอกจำนวนตัวที่เปลี่ยน + ชื่อ 3 ตัวแรก + "แตะการ์ดเพื่ออ่านพาสสีฟใหม่"
  ห้ามยาวเป็นย่อหน้า · ห้ามป๊อปอัป · ห้ามส่งจดหมาย (user เคาะแล้ว)
- [ ] **Step 4:** เทสทั้งชุดเขียว + build
- [ ] **Step 5: Commit** — `"Pets: แถบบอกว่าพาสสีฟตัวไหนเปลี่ยนไป (ปิดแล้วไม่กลับมา)"`

---

### Task 7: ปิดเฟส

- [ ] `node --test $(find src -name "*.test.js")` · `node scripts/death-audit.mjs` · `npm run build`
- [ ] อัปเดตกล่องสถานะใน `docs/superpowers/specs/2026-09-10-passive-v2-p3-design.md` §1 ให้ครอบคลุม P3b
      (เลขเทสจริง · ช่วง commit · ของที่ต่างจากแผน · ของที่ยังค้าง)
- [ ] **ยังไม่ merge เอง** — สรุปให้ user ตัดสินว่าจะ merge เข้า master (= deploy) เมื่อไร
