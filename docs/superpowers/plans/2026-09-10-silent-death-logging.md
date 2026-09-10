# บันทึกการตายเงียบลง log + เก็บหนี้ §7.6 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** ทำให้การตายทุกทาง (หนาม · guardian · aoeOpener) มีใบบันทึกใน log เพื่อให้หน้าสรุป อนิเมชันน็อก และเครดิตการฆ่าถูกต้อง พร้อมเก็บหนี้ §7.6 ที่เหลือทั้งหมด

**Architecture:** `resolveSilentDeath()` ใน `battleEngine.js` เป็นจุดเดียวที่ตัดสินการตายอยู่แล้ว ⇒ ให้เป็นจุดเดียวที่ push ใบ `attack` แบบ `silent: true, dmg: 0, sub: true, dead: true` ด้วย · ผู้อ่าน log ที่มีอยู่ (`battleSummary` / `battleBeats`) เข้าใจรูปแบบนี้อยู่แล้วจึงไม่ต้องแก้

**Tech Stack:** Vanilla ES modules · `node --test` (ไม่มี test runner กลาง) · Vue 3 SFC สำหรับฝั่งจอ

**สเปก:** `docs/superpowers/specs/2026-09-10-silent-death-logging-design.md` — อ่านก่อนเริ่มทุกงาน

## Global Constraints

- ห้ามเพิ่มจังหวะ (beat) ให้ไฟต์ — ใบการตายเงียบต้องเป็น `sub: true` เสมอ (ยกเว้นใบที่ปิดไฟต์ ซึ่ง `battleBeats` ยกเป็น `finish` ให้เอง)
- `dmg` ของใบ `silent` **ต้องเป็น 0 เสมอ** — `battleSummary` บวก `e.dmg` ตรงๆ โดยไม่เช็ค `silent`
- ผู้ฆ่าตามกติกา §7.6: หนาม → เจ้าของหนาม · ก้อนสะท้อนเกราะ → เจ้าของเกราะ · `aoeOpener` → บาฮามุท · `guardian` → คนที่สวนหมัดมา (ไม่ใช่ผู้พิทักษ์)
- ข้อความพาสสีฟต้องบอกเลขตรงๆ ไม่ใช้คำไม่ทางการ (มีเทสบังคับอยู่แล้ว 3 เคสใน `petPassives.test.js`)
- ฟอนต์ขั้นต่ำ `.7rem` ในไฟล์ `.vue`/`.css` (CLAUDE.md)
- รันเทส: `node --test src/utils/*.test.js src/data/*.test.js` · ตั้งต้น **1,101 ผ่าน**
- ทุกงานจบด้วย commit แยก (P4 ต้องย้อนทีละงานได้)

---

### Task 1: ใบการตายเงียบ + เปลี่ยนความหมายค่าที่ `resolveSilentDeath` คืน

**Files:**
- Modify: `src/utils/battleEngine.js` (`resolveSilentDeath`, จุดเรียกทั้ง 4)
- Test: `src/utils/battleEngine.test.js`

**Interfaces:**
- Produces: `resolveSilentDeath(unit, killer, opts?)` — `opts.announced` (default `false`) · คืน `true` ก็ต่อเมื่อ **การเรียกครั้งนี้เป็นคนประกาศการตาย** (ไม่ใช่ "ตายหรือเปล่า")
- Produces: รูปแบบใบการตายเงียบใน log — `{ t:'attack', side, attacker, target, dmg:0, sub:true, dead:true, silent:true, crit:false, eff:'neutral', dodged:false, targetHpAfter:0 }`

- [ ] **Step 1: เขียนเทสที่ยังแดง**

เติมท้าย `src/utils/battleEngine.test.js`:

```js
import { PETS } from '../data/index.js'

// เพ็ทที่ถือ effect ที่ต้องการ — หาแบบไล่จากทะเบียนจริง ไม่ hardcode id
const petWith = (effect) => {
  const id = Object.keys(PET_PASSIVES).find(k =>
    (PET_PASSIVES[k].parts || []).some(p => p.effect === effect))
  const meta = PETS.find(p => p.id === id)
  return { id, rarity: meta.rarity, element: meta.element, grade: 5 }
}
const weak = (n = 3) => Array.from({ length: n },
  (_, i) => ({ id: 'pebble' + i, rarity: 'common', element: 'fist', grade: 0 }))

/** ทุกตัวที่ฝั่งแพ้ต้องมีใบบันทึกการตายครบ ถ้าไฟต์จบก่อนหมดเวลา */
const deathsMarked = (log, side) => {
  const s = new Set()
  for (const e of log) if (e.t === 'attack' && e.dead && String(e.target).startsWith(side)) s.add(e.target)
  return s
}

test('การตายเงียบมีใบบันทึกครบทุกใบ (aoeOpener ฆ่าก่อนรอบ 1)', () => {
  const A = [petWith('aoeOpener'), petWith('stackAtk')]
  let found = false
  for (let s = 1; s <= 200 && !found; s++) {
    const r = simulateBattle(A, weak(2), s)
    if (r.winner !== 'A') continue
    const marked = deathsMarked(r.log, 'B')
    assert.equal(marked.size, 2, `seed ${s}: ฝั่งแพ้ตาย 2 ตัวแต่ log บันทึก ${marked.size}`)
    if (r.log.some(e => e.silent)) found = true
  }
  assert.ok(found, 'ไม่เจอใบ silent เลยใน 200 ซีด — เทสนี้ไม่ได้ทดสอบอะไร')
})

test('ใบการตายเงียบมี dmg 0 และเป็นหมัดลูก (ไม่กินเวลา)', () => {
  const A = [petWith('aoeOpener'), petWith('stackAtk')]
  for (let s = 1; s <= 200; s++) {
    for (const e of simulateBattle(A, weak(2), s).log) {
      if (!e.silent) continue
      assert.equal(e.t, 'attack')
      assert.equal(e.dmg, 0, 'dmg ต้องเป็น 0 ไม่งั้นหน้าสรุปนับดาเมจพาสสีฟเงียบๆ')
      assert.equal(e.sub, true)
      assert.equal(e.dead, true)
      assert.equal(e.targetHpAfter, 0)
    }
  }
})

test('ศพหนึ่งใบมีบันทึกการตายใบเดียว (ไม่นับตายซ้ำ)', () => {
  const A = [petWith('thorns'), petWith('aoeOpener'), petWith('stackAtk')]
  const B = [petWith('cleave'), petWith('multiStrike'), petWith('killChain')]
  for (let s = 1; s <= 300; s++) {
    const count = new Map()
    for (const e of simulateBattle(A, B, s).log) {
      if (e.t === 'attack' && e.dead) count.set(e.target, (count.get(e.target) || 0) + 1)
    }
    for (const [uid, n] of count) {
      assert.ok(n <= 1, `seed ${s}: ${uid} มีใบบันทึกการตาย ${n} ใบ (ต้องไม่เกิน 1 ต่อการตายหนึ่งครั้ง)`)
    }
  }
})
```

> ⚠️ เทส "ศพหนึ่งใบ" ยอมให้ >1 ได้ก็ต่อเมื่อเพ็ทนั้นฟื้นแล้วตายใหม่จริง — ฟีนิกซ์/แมวถูกกันออกจากทีมในเทสนี้แล้วโดยการเลือก effect ข้างบน ถ้าวันหลังเพ็ทที่เลือกมาเปลี่ยนไปถือ `revive` ต้องปรับเทส

- [ ] **Step 2: รันให้เห็นว่าแดง**

Run: `node --test src/utils/battleEngine.test.js`
Expected: FAIL — `ฝั่งแพ้ตาย 2 ตัวแต่ log บันทึก 1` และ `ไม่เจอใบ silent เลย`

- [ ] **Step 3: แก้ `resolveSilentDeath`**

ใน `src/utils/battleEngine.js` เปลี่ยนหัวฟังก์ชันและกิ่ง `_deathDone`:

```js
  const resolveSilentDeath = (unit, killer, { announced = false } = {}) => {
    if (!unit) return false
    if (unit.hp > 0) { psOf(unit)._deathDone = false; return false }
    const st = psOf(unit)
    // 🔴 คืน false ไม่ใช่ true — ค่าที่คืนแปลว่า "การเรียกครั้งนี้เป็นคนประกาศการตายหรือเปล่า"
    //    ไม่ใช่ "ตายหรือเปล่า" · เส้นทางอื่นประกาศไปแล้ว (พร้อมใบใน log) ⇒ ใบของผู้เรียกคนนี้
    //    ต้องไม่อ้างการฆ่าซ้ำ ไม่งั้น battleSummary แจกเครดิต kills ให้สองคนจากศพใบเดียว
    //    และ hit() จะให้ killChain กับคนที่ไม่ได้ฆ่า (สเปก §4.3)
    if (st._deathDone) return false
    const unitTeam = unit.side === 'A' ? A : B
    const killerTeam = killer.side === 'A' ? A : B
    const d = runOnDeath(unit, unitTeam, killer)
    for (const e of d.events) log.push(e)
    if (d.counter && !reflecting && !countering) {
      countering = true
      try {
        if (d.counter.target.hp > 0) strike(unit, d.counter.target, killerTeam, d.counter.mult, { crit: false, eff: 'neutral' }, true)
      } finally { countering = false }
    }
    if (d.prevented) return false
    st._deathDone = true
    // 💀 ใบการตายเงียบ — เฉพาะทางที่ไม่มีใบ attack ของตัวเองแบก dead อยู่แล้ว
    //    ต้องอยู่ "หลัง" runOnDeath (กันตายได้ = ไม่มีใบ) และ "ก่อน" runOnAnyDeath (เหตุมาก่อนผล)
    if (!announced) {
      log.push({
        t: 'attack', side: killer.side, attacker: killer.uid, target: unit.uid,
        dmg: 0, crit: false, eff: 'neutral', dodged: false,
        sub: true, silent: true, targetHpAfter: 0, dead: true,
      })
    }
    for (const e of runOnAnyDeath(unit, killerTeam, unitTeam, rand)) log.push(e)
    return true
  }
```

- [ ] **Step 4: ส่ง `announced: true` ที่เส้นทางเป้าหลักของ `strike()`**

ใน `strike()` เปลี่ยนบรรทัดเดียว (ใบ `attack` ของหมัดนั้นแบก `dead` เองอยู่แล้ว):

```js
    let dead = tg.hp <= 0
    if (dead) dead = resolveSilentDeath(tg, att, { announced: true })
```

อีกสามจุด (`resolveSilentDeath(att, tg)` · `resolveSilentDeath(hitRes.guard, att)` · ลูป `aoeOpener`) **ไม่ต้องแก้** — ค่าเริ่มต้น `announced: false` ถูกต้องแล้ว

- [ ] **Step 5: รันเทสให้เขียว**

Run: `node --test src/utils/battleEngine.test.js`
Expected: PASS ทุกเคส

- [ ] **Step 6: รันด่านใหม่**

Run: `node scripts/death-audit.mjs 400`
Expected: `ไฟต์ที่มีการตายหายไปจาก log: 0` · exit code 0

- [ ] **Step 7: Commit**

```bash
git add src/utils/battleEngine.js src/utils/battleEngine.test.js
git commit -m "Battle: การตายเงียบ 3 ทางมีใบบันทึกใน log (หน้าสรุปเคยโชว์เพ็ทที่ตายแล้วว่ายังยืนอยู่)"
```

---

### Task 2: ตรึงค่าคงที่ของหน้าสรุป — ใบ silent ไม่ขยับเลขดาเมจ แต่ให้เครดิตการฆ่า

**Files:**
- Modify: `src/utils/battleSummary.js` (คอมเมนต์อย่างเดียว — ตรรกะไม่เปลี่ยน)
- Test: `src/utils/battleSummary.test.js`

**Interfaces:**
- Consumes: รูปแบบใบการตายเงียบจาก Task 1

- [ ] **Step 1: เขียนเทสที่ยังแดง**

เติมท้าย `src/utils/battleSummary.test.js`:

```js
test('ใบการตายเงียบ: ขึ้น 💀 + ให้เครดิตการฆ่า แต่ไม่ขยับเลขดาเมจ', () => {
  const log = [
    { t: 'attack', side: 'A', attacker: 'A0', target: 'B0', dmg: 100, dead: false, targetHpAfter: 50 },
    { t: 'attack', side: 'B', attacker: 'B0', target: 'A0', dmg: 0, dead: true, silent: true, sub: true, targetHpAfter: 0 },
  ]
  const s = computeBattleSummary(log, [{ id: 'x' }], [{ id: 'y' }])
  const a0 = s.teamA[0], b0 = s.teamB[0]
  assert.equal(a0.dead, true, 'ตัวที่ตายเงียบต้องขึ้น 💀')
  assert.equal(b0.kills, 1, 'ผู้ฆ่าต้องได้เครดิต')
  assert.equal(b0.dmgDealt, 0, 'ใบ silent ห้ามบวกดาเมจให้ผู้ฆ่า')
  assert.equal(a0.dmgTaken, 100, 'ดาเมจที่รับต้องเท่าเดิม ไม่รวมใบ silent')
})
```

- [ ] **Step 2: รันให้เห็นผล**

Run: `node --test src/utils/battleSummary.test.js`
Expected: PASS ทันที (นี่คือเทสตรึงพฤติกรรม ไม่ใช่เทสขับการเปลี่ยนแปลง) — ถ้า **แดง** แปลว่าสมมติฐานของสเปก §5 ผิด ให้หยุดแล้วรายงาน

- [ ] **Step 3: เขียนคอมเมนต์ตรึงค่าคงที่**

ใน `src/utils/battleSummary.js` เหนือลูป `for (const e of log || [])`:

```js
  // 🔒 ใบ `silent: true` (การตายจากหนาม/guardian/aoeOpener — ดู battleEngine.resolveSilentDeath)
  //    ใช้รูปแบบเดียวกับหมัดปกติโดยตั้งใจ จึงไม่ต้องมีสาขาแยกที่นี่: `dead` ทำให้ขึ้น 💀 + แจกเครดิต
  //    การฆ่าให้ถูกคน ส่วน `dmg: 0` ทำให้เลขดาเมจไม่ขยับ ตามที่ผู้ใช้เคาะไว้ (สเปก §2)
  //    🔴 ถ้าวันไหนมีคนใส่ดาเมจจริงลงใบ silent เลขในหน้าสรุปจะขยับเงียบๆ — มีเทสตรึงไว้แล้ว
```

- [ ] **Step 4: Commit**

```bash
git add src/utils/battleSummary.js src/utils/battleSummary.test.js
git commit -m "Summary: ตรึงกติกาใบการตายเงียบ (ขึ้น 💀 + เครดิตการฆ่า แต่เลขดาเมจไม่ขยับ)"
```

---

### Task 3: หน้าจอ — ไม่เด้งเลข `-0` ตอนตายเงียบ

**Files:**
- Modify: `src/components/battle/BattleReplay.vue:691`

**Interfaces:**
- Consumes: ธง `silent` บน beat (ผ่านมาจาก `{ ...ev }` ใน `buildBeats`)

- [ ] **Step 1: แก้จุดเดียว**

```js
  // ใบการตายเงียบไม่มีดาเมจของตัวเอง (dmg: 0) — เด้ง "-0" ลอยบนจอจะเป็นขยะล้วน
  // ประกายน็อก + หลอดเลือดลง 0 + การ์ดจางเทา ยังทำงานครบตามปกติ
  if (!beat.silent) fx?.pop(beat.target, { dmg: beat.dmg, crit: beat.crit, eff: beat.eff, weight: w })
```

- [ ] **Step 2: ตรวจว่าไม่มี `font-size` ต่ำกว่าเกณฑ์หลุดเข้ามา**

Run: `grep -rnE "font-size:\s*\.[0-6][0-9]?rem" src/`
Expected: ไม่เจออะไร

- [ ] **Step 3: build ผ่าน**

Run: `npm run build`
Expected: สำเร็จ ไม่มี error

- [ ] **Step 4: Commit**

```bash
git add src/components/battle/BattleReplay.vue
git commit -m "Replay: ใบการตายเงียบไม่เด้งเลข -0 (ประกายน็อก+หลอดเลือดยังครบ)"
```

---

### Task 4: หนี้ข้อ 3 — โมเมนต์ `grit` ของแมว

**Files:**
- Modify: `src/utils/battleBeats.js:42`
- Test: `src/utils/battleBeats.test.js`

- [ ] **Step 1: เขียนเทสที่ยังแดง**

```js
test('grit ได้โมเมนต์เต็มเหมือนการกันตายใบอื่น (หนี้ §7.6 ข้อ 3)', () => {
  assert.ok(CLUTCH_EFFECTS.has('grit'),
    'grit คือการกันตายชั้นที่ 2-3 ของแมว — จังหวะเป็น-ตายต้องได้โมเมนต์เต็มเสมอ เหมือน cheatDeath ที่เป็นพี่มัน')
})
```

(ถ้า `CLUTCH_EFFECTS` ยังไม่ถูก import ในไฟล์เทส ให้เติมเข้า import เดิมที่ด้านบน)

- [ ] **Step 2: รันให้เห็นว่าแดง**

Run: `node --test src/utils/battleBeats.test.js`
Expected: FAIL

- [ ] **Step 3: เติมเข้าเซ็ต**

```js
// 'grit' = การกันตายชั้นที่ 2-3 ของแมว (runtime state ที่เกิดจากการกิน cheatDeath ไม่ใช่ part.effect)
// อยู่ในเซ็ตนี้ด้วยเหตุผลเดียวกับ cheatDeath เป๊ะ — จังหวะเป็น-ตายได้โมเมนต์เต็มเสมอ แม้เป็นครั้งซ้ำ
export const CLUTCH_EFFECTS = new Set(['revive', 'cheatDeath', 'saveAlly', 'grit'])
```

- [ ] **Step 4: รันเทสให้เขียว**

Run: `node --test src/utils/battleBeats.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/utils/battleBeats.js src/utils/battleBeats.test.js
git commit -m "Beats: การกันตายชั้น 2-3 ของแมวได้โมเมนต์เต็ม (เดิมได้ 0ms ขัดกับกฎที่เขียนไว้เอง)"
```

---

### Task 5: หนี้ข้อ 5 — passive หลังบีตปิดเกมต้องเงียบ

**Files:**
- Modify: `src/utils/battleBeats.js` (pass ที่ให้ `kind` กับ event ชนิด `passive`)
- Test: `src/utils/battleBeats.test.js`

**Interfaces:**
- Consumes: `finishAt` ที่คำนวณอยู่แล้วใน `buildBeats`

> ✅ ตรวจแล้ว: `finishAt` ถูกคำนวณ **ก่อน** pass ของ passive อยู่แล้ว (`battleBeats.js` ~บรรทัด 173 vs ~234) ⇒ อ่านค่ามาใช้ได้ตรงๆ **ห้ามคำนวณซ้ำ** (ค่าจะหลุดจากกันวันที่มีคนแก้ข้างเดียว)

- [ ] **Step 1: เขียนเทสที่ยังแดง — ต้องกิน log จาก `simulateBattle()` จริง**

```js
test('passive หลังใบปิดเกมต้องเงียบ 0ms (หนี้ §7.6 ข้อ 5)', () => {
  const A = [petWithEffect('killChain'), petWithEffect('stackAtk')]
  const B = weakTeam(2)
  let checked = 0
  for (let s = 1; s <= 300; s++) {
    const r = simulateBattle(A, B, s)
    const beats = buildBeats(r.log, maxHpOf(r))
    const fin = beats.findIndex(b => b.kind === 'finish')
    if (fin < 0) continue
    for (let i = fin + 1; i < beats.length; i++) {
      if (beats[i].t !== 'passive') continue
      checked++
      assert.equal(beatDuration(beats[i]), 0,
        `seed ${s}: passive '${beats[i].effect}' เล่นต่อ ${beatDuration(beats[i])}ms หลังไฟต์จบแล้ว`)
    }
  }
  assert.ok(checked > 0, 'ไม่เจอ passive หลังบีตปิดเกมเลย — เทสนี้ไม่ได้ทดสอบอะไร')
})
```

ตัวช่วยที่ต้องมีในไฟล์เทส (ถ้ายังไม่มี ให้เพิ่ม):

```js
const maxHpOf = (r) => Object.fromEntries(
  Object.entries(r.units || {}).map(([uid, s]) => [uid, Math.round(s.maxHp) || 1]))
```

- [ ] **Step 2: รันให้เห็นว่าแดง**

Run: `node --test src/utils/battleBeats.test.js`
Expected: FAIL — passive เล่น 200ms หลังไฟต์จบ

- [ ] **Step 3: ใส่กฎ**

ใน pass ของ passive เติมเช็คก่อนตัดสิน `kind`:

```js
      // 🔴 หนี้ §7.6 ข้อ 5: event ชนิด passive ไม่ผ่าน finishAt/finishGroup (รับ kind จาก pass แยก)
      //    ⇒ killChain/stackAtk ของการฆ่าที่ปิดไฟต์ได้ 'skill' 200ms = เล่นต่อทั้งที่ไฟต์จบแล้ว
      //    ไฟต์จบแล้วไม่มีอะไรเล่นต่อ — เงียบเสมอ ไม่ว่าจะเป็น CLUTCH_EFFECTS หรือไม่
      if (finishAt >= 0 && i > finishAt) { pKind.set(i, 'skillQuiet'); continue }
```

- [ ] **Step 4: รันเทสให้เขียว**

Run: `node --test src/utils/battleBeats.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/utils/battleBeats.js src/utils/battleBeats.test.js
git commit -m "Beats: พาสสีฟหลังบีตปิดเกมเงียบ (killChain เคยเล่นต่อหลังไฟต์จบแล้ว)"
```

---

### Task 6: 🦖 ทีเร็กซ์เริ่มไฟต์ด้วย 1 ชั้น

**Files:**
- Modify: `src/data/petPassives.js` (`trex`)
- Modify: `src/utils/battlePassives.js` (`runSetup`)
- Test: `src/utils/battlePassives.test.js`

**Interfaces:**
- Produces: คีย์ `value.start` ของ part ที่มี `effect: 'stackAtk'` — จำนวนชั้นที่ได้ฟรีตอนเข้าไฟต์

- [ ] **Step 1: เขียนเทสที่ยังแดง**

```js
test('ทีเร็กซ์เข้าไฟต์ด้วย 1 ชั้นและแรงขึ้นทันที', () => {
  const t = mkUnit('trex', 3)
  runSetup([t], [mkUnit('pebble', 0)])
  assert.equal(psOf(t).atkStacks, 1, 'ต้องได้ชั้นแรกฟรีตอนเข้าไฟต์')
  assert.ok(Math.abs(t.atk / mkUnit('trex', 3).atk - 1.12) < 1e-9, 'atk ต้อง × 1.12 พอดี')
})

test('ทีเร็กซ์ยังตันที่ 3 ชั้นเหมือนเดิม (ชั้นแถมไม่ขยับเพดาน)', () => {
  const t = mkUnit('trex', 3)
  const foe = mkUnit('pebble', 0)
  runSetup([t], [foe])
  const base = t.atk
  for (let i = 0; i < 5; i++) runOnAnyDeath(mkUnit('pebble', 0), [t], [foe], () => 0.5)
  assert.equal(psOf(t).atkStacks, 3, 'เพดานยังเป็น 3')
  assert.ok(Math.abs(t.atk / base - 1.12 * 1.12) < 1e-9, 'ได้เพิ่มอีกแค่ 2 ชั้นหลังชั้นแถม')
})

test('setup ไม่ยิง event ให้ชั้นแถม (อยู่ในสเตตัสตั้งต้นแล้ว ไม่ใช่โมเมนต์)', () => {
  const evs = runSetup([mkUnit('trex', 3)], [mkUnit('pebble', 0)])
  assert.equal(evs.length, 0)
})
```

> `mkUnit` / `psOf` / `runSetup` / `runOnAnyDeath` ใช้ตัวช่วยที่มีอยู่แล้วในไฟล์เทสนี้ — ถ้าชื่อไม่ตรง ให้ใช้ของเดิมที่ไฟล์นั้นใช้อยู่ ห้ามสร้างตัวช่วยซ้ำซ้อน

- [ ] **Step 2: รันให้เห็นว่าแดง**

Run: `node --test src/utils/battlePassives.test.js`
Expected: FAIL — `atkStacks` เป็น `undefined`

- [ ] **Step 3: แก้ข้อมูลทีเร็กซ์**

```js
  trex: {
    name: 'สัญชาตญาณนักล่า', icon: '🦖',
    parts: [{ hook: 'onAnyDeath', effect: 'stackAtk', value: { pct: 12, max: 3, start: 1 },
              step: { pct: 4, max: 0, start: 0 } }],
    desc: 'เข้าไฟต์พร้อมพลังโจมตี +{pct}% · ศัตรูล้ม 1 ตัว (ใครล้มก็ได้) +{pct}% อีก สะสมรวม {max} ชั้น',
    short: 'เริ่มไฟต์ +{pct}% · ศัตรูล้ม 1 ตัว +{pct}% (รวม {max} ชั้น)',
  },
```

- [ ] **Step 4: ให้ `runSetup` เติมชั้นแรก**

เติมลูปที่สองใน `runSetup` ต่อจากลูป `partsAt(p, 'setup')` เดิม:

```js
    // ── ชั้นตั้งต้นของ stackAtk (🦖 ทีเร็กซ์) ──
    // 🔴 อ่านจาก part เดิมของเพ็ท ไม่ว่ามันแขวนอยู่ hook ไหน — จงใจ **ไม่** เพิ่ม part hook 'setup'
    //    ตัวที่สอง เพราะเพ็ทที่ถือ stackAtk สอง part คือกับดักของหนี้ §7.6 ข้อ 2 (แหล่งหนึ่งดันชั้น
    //    จนชนเพดานของอีกแหล่งแล้วอีกแหล่งเงียบไปโดยไม่มี event บอก) — มีเทสกันไว้แล้ว
    // 🔇 ไม่ยิง event: ชั้นนี้เป็นสเตตัสตั้งต้น ไม่ใช่โมเมนต์ระหว่างไฟต์ · statsSnapshot() ที่เอนจิน
    //    เก็บหลัง aura แบกค่านี้ไปให้การ์ดอยู่แล้ว การยิง event จะได้ป้ายที่เลขบนจอไม่ขยับตาม
    for (const part of allParts(p)) {
      if (part.effect !== 'stackAtk') continue
      const v = valOf(part, u)
      const start = v.start || 0
      if (start <= 0) continue
      const st = psOf(u)
      const n = Math.min(start, v.max)
      st.atkStacks = (st.atkStacks || 0) + n
      u.atk *= (1 + v.pct / 100) ** n
    }
```

ถ้ายังไม่มีตัวช่วยอ่าน part ทั้งหมด ให้ใช้ตัวที่ไฟล์นี้มีอยู่แล้ว (`p.parts || []`) แทน `allParts(p)`

- [ ] **Step 5: รันเทสให้เขียว**

Run: `node --test src/utils/battlePassives.test.js src/data/petPassives.test.js`
Expected: PASS ทั้งหมด — รวมเทสกติกาข้อความ 3 เคสที่ตรวจ `desc`/`short`

- [ ] **Step 6: Commit**

```bash
git add src/data/petPassives.js src/utils/battlePassives.js src/utils/battlePassives.test.js
git commit -m "Passive: ทีเร็กซ์เข้าไฟต์ด้วย 1 ชั้น (เพดานเท่าเดิม 3 — ถึงตันเร็วขึ้น ไม่ได้แรงกว่าเพดาน)"
```

---

### Task 7: หนี้ข้อ 2 + ข้อ 8 — เทสกันพังเงียบ

**Files:**
- Test: `src/data/petPassives.test.js` (ยาม `stackAtk` ≥ 2 part)
- Test: `src/utils/battlePassives.test.js` (เพดานอูโรโบรอส)
- Test: `src/utils/battleBeats.test.js` (จังหวะเพ็ทสอง part)

- [ ] **Step 1: ยามของหนี้ข้อ 2**

```js
test('ยังไม่มีเพ็ทตัวไหนถือ stackAtk เกิน 1 part (หนี้ §7.6 ข้อ 2)', () => {
  for (const [id, p] of Object.entries(PET_PASSIVES)) {
    const n = (p.parts || []).filter(x => x.effect === 'stackAtk').length
    assert.ok(n <= 1,
      `${id} ถือ stackAtk ${n} part — ทุก part ใช้ st.atkStacks ก้อนเดียวกันแต่เพดานคนละเลข ` +
      `(onRound 4 · onAnyDeath 3 · onKill 3) ⇒ แหล่งที่เพดานต่ำกว่าจะเงียบไปโดยไม่มี event บอก ` +
      `ก่อนปล่อยเพ็ทตัวนี้ ต้องแยก state ต่อ part ก่อน (แก้ที่ runOnRound/runOnAnyDeath/runOnKill ` +
      `ใน battlePassives.js แล้วอัปเดต battleBuffs.js ที่อ่าน atkStacks ด้วย)`)
  }
})
```

- [ ] **Step 2: เพดาน `stackAtk` ของอูโรโบรอส (หนี้ข้อ 8)**

```js
test('อูโรโบรอสตันที่ 4 ชั้น ไม่ไต่ต่อไม่รู้จบ', () => {
  const u = mkUnit('ouroboros', 3)
  const before = u.atk
  for (let i = 0; i < 10; i++) runOnRound([u])
  assert.equal(psOf(u).atkStacks, 4, 'เพดาน 4 ชั้นตาม value.max')
  assert.ok(Math.abs(u.atk / before - 1.05 ** 4) < 1e-9, 'atk ขึ้นแค่ 4 ชั้น')
})
```

- [ ] **Step 3: จังหวะเพ็ทสอง part เป็นเทสถาวร (หนี้ข้อ 8)**

```js
test('เพ็ทสอง part นับเป็นจังหวะเดียว ใบสุดท้ายถือเวลาหยุด', () => {
  const A = [{ id: 'ouroboros', rarity: 'legendary', element: 'fist', grade: 3 }]
  const B = weakTeam(1)
  let checked = 0
  for (let s = 1; s <= 100; s++) {
    const r = simulateBattle(A, B, s)
    const beats = buildBeats(r.log, maxHpOf(r))
    for (let i = 0; i < beats.length - 1; i++) {
      const a = beats[i], b = beats[i + 1]
      if (a.t !== 'passive' || b.t !== 'passive' || a.uid !== b.uid) continue
      if (a.effect === b.effect) continue          // ใบซ้ำของ effect เดียวกัน คนละเรื่อง
      checked++
      assert.equal(beatDuration(a), 0,
        `part แรกของเพ็ทตัวเดียวต้องเงียบ ไม่งั้นได้ 200ms × จำนวน part (seed ${s})`)
    }
  }
  assert.ok(checked > 0, 'ไม่เจอเพ็ทสอง part ในไฟต์เลย — เทสนี้ไม่ได้ทดสอบอะไร')
})
```

- [ ] **Step 4: รันเทสทั้งสามไฟล์**

Run: `node --test src/data/petPassives.test.js src/utils/battlePassives.test.js src/utils/battleBeats.test.js`
Expected: PASS ทั้งหมด

- [ ] **Step 5: Commit**

```bash
git add src/data/petPassives.test.js src/utils/battlePassives.test.js src/utils/battleBeats.test.js
git commit -m "Tests: อุดช่องว่างหนี้ §7.6 ข้อ 2+8 (ยาม stackAtk สอง part · เพดานอูโรโบรอส · จังหวะเพ็ทสอง part)"
```

---

### Task 8: วัดผลและปิดเฟส

**Files:**
- Create: `docs/pet-passive-sim-p2c2-2026-09-10.md`
- Modify: `docs/superpowers/specs/2026-09-03-passive-v2-p2-engine-design.md` (ปิดหนี้ §7.6 ข้อ 1, 2, 3, 5, 8)

- [ ] **Step 1: ด่านของเฟสนี้**

```bash
node scripts/death-audit.mjs 400          # ต้องได้ 0 ไฟต์ · exit 0
node --test src/utils/*.test.js src/data/*.test.js   # ต้องเขียวทั้งหมด (ตั้งต้น 1,101)
npm run build                              # ต้องผ่าน
```

- [ ] **Step 2: วัด sim baseline ใหม่ให้ P4**

```bash
node scripts/passive-power-sim.mjs > /tmp/after.txt
```

เทียบกับ `docs/pet-passive-sim-p2c1-2026-09-05.md` แล้วเขียนผลลง `docs/pet-passive-sim-p2c2-2026-09-10.md`
ระบุให้ชัดว่า **ทีเร็กซ์ขยับจากสองสาเหตุพร้อมกัน** (ได้ชั้นจากการตายที่เคยหาย + ชั้นแถม) — P4 ต้องรู้

- [ ] **Step 3: วัดขนาดผลกระทบ (ดูตัวเลข ไม่ใช่ด่าน)**

```bash
node scripts/battle-differential.mjs 94f6802
```

บันทึกตัวเลข "ต่างกันกี่ไฟต์" ลงเอกสารเดียวกัน — **คาดว่าสูงมาก และนั่นถูกต้อง** (สเปก §8)

- [ ] **Step 4: ปิดหนี้ในสเปกแม่**

ใน `§7.6` ของ `2026-09-03-passive-v2-p2-engine-design.md` ทำเครื่องหมายข้อ 1, 2, 3, 5, 8 ว่าปิดแล้ว
พร้อมชี้ไปที่สเปก/แผนของเฟสนี้ · **ข้อ 4 และ 7 ยังเปิดอยู่** ห้ามทำเครื่องหมายปิด

- [ ] **Step 5: Commit**

```bash
git add docs/
git commit -m "Docs: ผลวัดหลังปิดหนี้ §7.6 + baseline ใหม่ให้ P4"
```
