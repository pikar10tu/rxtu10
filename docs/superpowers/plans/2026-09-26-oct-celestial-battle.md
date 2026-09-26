# ต.ค. "My Earth tilted for you" — ไฟต์ + เพ็ท ☀️🌍🌙 Implementation Plan (แผน A)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** เพิ่มเพ็ท L 3 ตัว (☀️ Sol · 🌍 Earth · 🌙 Luna) พร้อมกลไกใหม่ และเปลี่ยนนิยาม "รอบ" ทั้งเกมให้หมายถึง "ทุกตัวตีครบ"

**Architecture:** เอนจินยัง pure/deterministic เหมือนเดิม — เติม hook ใหม่ `onRoundEnd` + ตัวนับ "รอบ" แบบ pending-set + ข้ามตา (`ps.skip`) · ตรรกะร่าง "องศา"/ชื่อบนจอ/ฤดูตามช่อง รวมไว้ที่ `src/utils/petForms.js` ไฟล์เดียว (pure + เทส) ให้เอนจิน · ป้าย · รีเพลย์ · หน้าจัดทีม อ่านจากที่เดียว · ตู้กาชาเป็นแผน B แยก (`2026-09-26-oct-theme-gacha.md`)

**Tech Stack:** Vue 3 + Vite · เทส `node --test` · sim `scripts/passive-power-sim.mjs`

**สเปก:** `docs/superpowers/specs/2026-09-26-pharmaverse-roadmap-design.md` §3.1 · §3.2 · §3.4

## Global Constraints

- ศัพท์: **"ตา"** = 1 หมัดของเพ็ท 1 ตัว · **"รอบ"** = ทุกตัวที่ยังมีชีวิตทั้งสองฝั่งได้ตาครบคนละ 1 ครั้ง — ห้ามใช้คำ "วง"/"รอบใหญ่" ในโค้ด คอมเมนต์ หรือข้อความบนจอ
- เลขกลม (50 / 30 / 25 / 20 / 10 …) ยอม off-balance นิดหน่อย — sim ใช้กันหลุดโลก ไม่ใช่จูนละเอียด
- เลิกกฎ "passive ห้ามเพิ่มจังหวะหมัด" แล้ว (user สั่ง 26 ก.ย.) — แต่เทสงบเวลาไฟต์ที่มีอยู่ต้องผ่าน
- ข้อความพาสสีฟตาม CLAUDE.md ข้อ 16: เลขผ่าน `{…}` เท่านั้น ห้ามพิมพ์เลขตรงๆ · `short` ~40–60 ตัวอักษร
- event ของพาสสีฟใช้ `fxKind` ห้ามมีฟิลด์ชื่อ `kind` (CLAUDE.md ข้อ 15)
- อีโมจิใหม่: `node scripts/fetch-fluent.mjs` แล้ว `node scripts/fluent-webp.mjs` เสมอ (CLAUDE.md ข้อ 17)
- ฟอนต์ขั้นต่ำ `.7rem` · overlay ใหม่ต้อง Teleport (CLAUDE.md ข้อ 6)
- อีสเตอร์เอ้ก: ห้ามเอ่ยชื่อนิยาย/ซีรีส์ต้นฉบับในข้อความใดๆ
- เทสทั้งหมด: `node --test src/**/*.test.js src/utils/*.test.js` · build: `npx vite build`
- commit รูปแบบ `Area: อะไร (ทำไม)` + `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>` · **ห้าม push**
- โค้ดเทสในแผนที่มีบรรทัด `import` อยู่กลางบล็อก: ให้ **รวมเข้าบรรทัด import บนสุดของไฟล์เทส** ห้าม import ชื่อเดิมซ้ำ (ES module พัง) · ตัวช่วย `U(...)` นิยามครั้งเดียวใน Task 4 แล้ว Task 5/6 ใช้ต่อในไฟล์เดียวกัน
- hook ใหม่ `onRoundEnd` — ถ้าเทสใน `petPassives.test.js` มีรายการ hook ที่รู้จัก แล้วแดงว่าไม่รู้จัก ให้เติมลงรายการนั้น (อย่าลบเทส)
- ⚠️ ต้อง merge/deploy **พร้อมแผน B** (`2026-09-26-oct-theme-gacha.md`) — ไม่งั้นเพ็ท wave 3 หลุดเข้าตู้

---

## File Structure

| ไฟล์ | หน้าที่ |
|---|---|
| `src/utils/petForms.js` (ใหม่) | ร่างองศา · rarity ที่นับ · ชื่อบนจอ · ฤดูตามช่อง · คู่หน้าแบนเนอร์ — pure |
| `src/utils/petForms.test.js` (ใหม่) | เทสของข้างบน |
| `src/utils/battleEngine.js` | รอบแบบ pending-set · ข้ามตา · เรียก `applyForms` / `runOnRoundEnd` · พกค่า `rarity`/`slot` |
| `src/utils/battlePassives.js` | `applyForms` · `rarityBoost` · `runOnRoundEnd` (season) · `moonPhase` · เปิดบัฟร้อนต้นรอบ |
| `src/data/petPassives.js` | พาสสีฟ 3 ตัวใหม่ + ทะเบียนป้าย + จูนตัวต้นรอบ 5 ตัว + ข้อความโอนิ |
| `src/data/index.js` | `PETS` 3 ตัวใหม่ (`wave: 3`) พร้อม `flavor` (คำพูด) + `lore` |
| `src/utils/battleBeats.js` | `OPENING_EFFECTS` + `rarityBoost` · `CLUTCH_EFFECTS` + `fullMoon` |
| `src/utils/battleBuffs.js` | ป้าย ☀️ ขึ้นเฉพาะตัวที่นับเป็น common |
| `src/components/battle/BattleReplay.vue` | FX แช่แข็ง/ข้ามตา/ฤดู/จันทร์ · ชื่อ ซัน/องศา · หน้าคู่ในแบนเนอร์ |
| `src/utils/battleFx.js` | ป้าย callout `'frozen'` |
| `src/utils/sfx.js` | เสียง `sol` `earth` `luna` `freeze` |
| `src/components/battle/TeamPicker.vue` | บอกฤดูของช่องเมื่อวาง 🌍 · บอกร่างองศา |

---

### Task 1: นิยาม "รอบ" ใหม่ + ข้ามตา ในเอนจิน

**Files:**
- Modify: `src/utils/battleEngine.js:26-30` (พก rarity/slot), `:274-307` (ลูปหลัก)
- Modify: `src/utils/battlePassives.js` (เพิ่ม export `runOnRoundEnd` แบบยังว่าง)
- Test: `src/utils/battleEngine.test.js`

**Interfaces:**
- Produces: combatant มีฟิลด์ `rarity` (string) และ `slot` (index ในทีม 0..2) · `psOf(u).skip` (จำนวนตาที่ต้องข้าม) + `psOf(u).skipName` / `psOf(u).skipIcon` · event ข้ามตา = `{ t:'passive', uid, side, petId, name, icon, effect:'frozen', targets:[uid], fxKind:'skip' }` · `runOnRoundEnd(team, foes, rand) → event[]` (Task 5 เติมเนื้อ)

- [ ] **Step 1: เขียนเทสที่ต้องล้ม** — ต่อท้าย `src/utils/battleEngine.test.js`

```js
// ── นิยามรอบใหม่ (26 ก.ย. 2026): "รอบ" = ทุกตัวที่ยังมีชีวิตได้ตาครบคนละ 1 ครั้ง ──
const blank = (n, rarity = 'legendary', element = 'fist') =>
  Array.from({ length: n }, () => ({ id: '__blank__', rarity, element, grade: 0 }))

test('รอบ: 3v3 รอบแรก (ยังไม่มีใครตาย) มีหมัดหลัก 6 หมัดพอดี', () => {
  const r = simulateBattle(blank(3), blank(3), 11)
  const r1 = r.log.findIndex(e => e.t === 'round' && e.n === 1)
  const r2 = r.log.findIndex(e => e.t === 'round' && e.n === 2)
  assert.ok(r1 >= 0 && r2 > r1, 'ต้องมีรอบ 1 และรอบ 2')
  const deaths = r.log.slice(r1, r2).filter(e => e.t === 'attack' && e.dead).length
  assert.equal(deaths, 0, 'seed นี้รอบแรกต้องไม่มีใครตาย (ถ้าล้ม ให้เปลี่ยน seed)')
  const mains = r.log.slice(r1, r2).filter(e => e.t === 'attack' && !e.sub)
  assert.equal(mains.length, 6)
  assert.equal(new Set(mains.map(e => e.attacker)).size, 6, 'ทุกตัวได้ตาคนละครั้ง')
})

test('รอบ: 3v1 ฝั่งตัวเดียวตีได้หลายตาในรอบเดียว แต่รอบจบเมื่อทุกตัวได้ตาครบ', () => {
  const r = simulateBattle(blank(3), blank(1), 5)
  const r1 = r.log.findIndex(e => e.t === 'round' && e.n === 1)
  const r2 = r.log.findIndex(e => e.t === 'round' && e.n === 2)
  const mains = r.log.slice(r1, r2).filter(e => e.t === 'attack' && !e.sub)
  const a = new Set(mains.filter(e => e.side === 'A').map(e => e.attacker))
  assert.equal(a.size, 3, 'ฝั่ง A ครบ 3 ตัว')
  assert.ok(mains.filter(e => e.side === 'B').length >= 2, 'ฝั่ง B ตัวเดียวได้มากกว่า 1 ตา')
})

test('end.rounds = จำนวน round event', () => {
  const r = simulateBattle(blank(3), blank(3), 3)
  const n = r.log.filter(e => e.t === 'round').length
  assert.equal(r.log.at(-1).rounds, n)
  assert.equal(r.rounds, n)
})
```

- [ ] **Step 2: รันให้เห็นว่าล้ม**

Run: `node --test src/utils/battleEngine.test.js`
Expected: FAIL เทส "3v3 รอบแรก … 6 หมัด" (ของเดิมได้ 2)

- [ ] **Step 3: พก `rarity`/`slot` เข้า combatant** — `battleEngine.js` บรรทัดสร้าง A/B:

```js
  const A = (teamA || []).map((p, i) => ({ ...buildCombatant(p), id: p?.id, rarity: p?.rarity || 'common', slot: i, uid: `A${i}`, side: 'A' }))
  const B = (teamB || []).map((p, i) => ({ ...buildCombatant(p), id: p?.id, rarity: p?.rarity || 'common', slot: i, uid: `B${i}`, side: 'B' }))
```

- [ ] **Step 4: เพิ่ม `runOnRoundEnd` แบบว่างใน `battlePassives.js`** (ใต้ `runOnRound`) และ import ในเอนจิน

```js
// ══════════════════════════════════════════════════════════════
//  onRoundEnd — จบรอบ (ทุกตัวได้ตาครบแล้ว) · 🌍 ฤดูกาล (Task 5)
// ══════════════════════════════════════════════════════════════
export function runOnRoundEnd(team, foes, rand) {
  return []
}
```

- [ ] **Step 5: เขียนลูปหลักใหม่** — แทน `battleEngine.js` ตั้งแต่ `const cursor = { A: 0, B: 0 }` ถึงปิด `while`

```js
  const cursor = { A: 0, B: 0 }
  let cur = first, round = 0, turns = 0
  // 🔑 "รอบ" (user เคาะ 26 ก.ย. 2026) = ทุกตัวที่ยังมีชีวิตทั้งสองฝั่งได้ตาครบคนละ 1 ครั้ง
  //    เดิม round++ ทุกครั้งที่วนกลับมาฝั่งที่ตีก่อน = ฝั่งละ 1 หมัด ⇒ 3v3 ต้อง 3 round กว่าทุกตัวจะตีครบ
  //    pending = uid ที่ยังไม่ได้ตาในรอบนี้ · null = ต้องเปิดรอบใหม่ก่อนตาถัดไป
  //    ตัวที่ตายกลางรอบไม่ต้องรอ · ตาที่ถูกข้าม (แช่แข็ง) นับเป็นตาแล้ว · ตีต่อของโอนิไม่ใช่ตาใหม่
  let pending = null
  const startRound = () => {
    round++; log.push({ t: 'round', n: round })
    for (const e of [...runOnRound(A), ...runOnRound(B)]) log.push(e)
    pending = new Set([...alive(A), ...alive(B)].map(u => u.uid))
  }
  const endRoundIfDone = () => {
    for (const uid of [...pending]) {
      const u = (uid[0] === 'A' ? A : B).find(x => x.uid === uid)
      if (!u || u.hp <= 0) pending.delete(uid)
    }
    if (pending.size) return
    for (const e of [...runOnRoundEnd(A, B, rand), ...runOnRoundEnd(B, A, rand)]) log.push(e)
    pending = null
  }

  while (alive(A).length && alive(B).length && turns < BATTLE_CFG.maxTurns) {
    if (!pending) startRound()
    const team = cur === 'A' ? A : B
    const foes = cur === 'A' ? B : A
    const ai = nextAttacker(team, cursor[cur])
    if (ai !== -1) {
      const att = team[ai]
      const st = psOf(att)
      if (st.skip > 0) {
        // ⏸️ ข้ามตา (❄️ แช่แข็ง · 🛸 สตั๊นในอนาคต) — ตานี้หายไปทั้งตา แต่นับว่าได้ตาในรอบนี้แล้ว
        st.skip -= 1
        log.push({ t: 'passive', uid: att.uid, side: att.side, petId: att.id,
          name: st.skipName || 'แช่แข็ง', icon: st.skipIcon || '❄️', effect: 'frozen', targets: [att.uid], fxKind: 'skip' })
      } else {
        let killed = hit(att, foes)
        // killChain — ยังมีเพดานจาก value.max (กฎ "ห้ามเพิ่ม beat" เลิกแล้ว แต่ตีต่อไม่รู้จบไม่ได้)
        // 🔴 เรียก runOnKill ครั้งเดียวต่อการฆ่าหนึ่งครั้ง · เช็ค att.hp > 0 (โดนหนามสวนตายกลางหมัดได้)
        let chain = 0
        while (killed && att.hp > 0 && turns < BATTLE_CFG.maxTurns) {
          const k = runOnKill(att, chain, team, foes)
          for (const e of k.events) log.push(e)
          if (!k.extraAttack || !alive(foes).length) break
          chain++; turns++
          killed = hit(att, foes)
        }
      }
      pending.delete(att.uid)
      cursor[cur] = (ai + 1) % team.length
    }
    turns++
    cur = cur === 'A' ? 'B' : 'A'   // สลับฝั่งเสมอ
    if (alive(A).length && alive(B).length) endRoundIfDone()
  }
```

และแก้ import บรรทัดบนสุดให้มี `runOnRoundEnd`

- [ ] **Step 6: รันเทสเอนจิน**

Run: `node --test src/utils/battleEngine.test.js`
Expected: PASS ทั้งไฟล์ · ถ้าเทสเก่าเทสไหนตรึงจำนวนรอบแบบเดิม (เช่น "ก่อนรอบ 1" หรือเลข round เฉพาะ) ให้แก้เทสนั้นให้ตรงนิยามใหม่ พร้อมคอมเมนต์ `// นิยามรอบใหม่ 26 ก.ย.`

- [ ] **Step 7: รันเทสทั้งหมด + ตรวจการตาย**

Run: `node --test src/**/*.test.js src/utils/*.test.js` แล้ว `node scripts/death-audit.mjs`
Expected: เทสผ่านทั้งหมด · death-audit = 0 ไฟต์

- [ ] **Step 8: Commit**

```bash
git add src/utils/battleEngine.js src/utils/battlePassives.js src/utils/battleEngine.test.js
git commit -m "Battle: รอบ = ทุกตัวได้ตาครบ + ข้ามตา (ps.skip) + hook onRoundEnd (user เคาะศัพท์ ตา/รอบ)"
```

---

### Task 2: จูนสกิลต้นรอบ 5 ตัว + คู่หู + ข้อความโอนิ

**Files:**
- Modify: `src/data/petPassives.js` (ouroboros · qilin · panda · butterfly · seal · kirin)
- Test: `src/data/petPassives.test.js` (เทสค่าเดิมที่ตรึงเลขไว้ ถ้ามี)

**Interfaces:** ไม่มี — เปลี่ยนเลข/ข้อความล้วน

เหตุผล: รอบใหม่ใน 3v3 ยาวราว 3 เท่าของรอบเดิม (6 หมัด vs 2 หมัด) ⇒ สกิลต้นรอบทำงานน้อยลง ~3 เท่า

- [ ] **Step 1: วัดก่อนแก้** — ต้องรันบนโค้ด *หลัง* Task 1 แต่ *ก่อน* แก้เลข

Run: `node scripts/passive-power-sim.mjs 1500 1 > /tmp/sim-before.txt` (บน Windows ใช้ path ใน scratchpad)
จดค่า lift ของ 🐍 ouroboros · 🐘 qilin · 🐼 panda · 🦋 butterfly · 🦭 seal

- [ ] **Step 2: แก้เลข** ใน `src/data/petPassives.js`

| เพ็ท | ของเดิม | ของใหม่ |
|---|---|---|
| ouroboros regen | `{ pct: 4 }` step `{ pct: 1.5 }` | `{ pct: 12 }` step `{ pct: 4 }` |
| ouroboros rage | `{ pct: 5, max: 4 }` step `{ pct: 1, max: 0 }` | `{ pct: 10, max: 4 }` step `{ pct: 2, max: 0 }` |
| qilin regen | `{ pct: 3 }` step `{ pct: 1 }` | `{ pct: 10 }` step `{ pct: 3 }` |
| panda | `{ pct: 5 }` step `{ pct: 2 }` | `{ pct: 15 }` step `{ pct: 5 }` |
| butterfly | `{ pct: 2 }` step `{ pct: 1 }` | `{ pct: 6 }` step `{ pct: 3 }` |
| seal duoRegen | `duoRegen: 3` step `duoRegen: 1` | `duoRegen: 10` step `duoRegen: 3` |

และข้อความโอนิ (ตัวนับ chain รีเซ็ตทุกตา ไม่ใช่ทุกรอบ):

```js
    desc: 'น็อกศัตรูแล้วได้ตีต่อทันที (สูงสุด {max} ครั้งต่อตา)',
    short: 'น็อกแล้วได้ตีต่อ สูงสุด {max} ครั้ง/ตา',
```

- [ ] **Step 3: วัดหลังแก้**

Run: `node scripts/passive-power-sim.mjs 1500 1`
Expected: lift ของ 5 ตัวห่างจากค่าก่อนแก้ไม่เกิน ±8 จุด · ถ้าเกิน ขยับเลขทีละขั้นกลม (เช่น panda 15 → 10 หรือ 20) แล้ววัดใหม่ · จดผลก่อน/หลังลงข้อความ commit

- [ ] **Step 4: รันเทส** `node --test src/**/*.test.js src/utils/*.test.js` — เทสที่ตรึงเลขเก่าให้แก้เป็นเลขใหม่

- [ ] **Step 5: Commit**

```bash
git add src/data/petPassives.js src/data/petPassives.test.js
git commit -m "Passive: ×3 สกิลต้นรอบ 5 ตัว + คู่หู 🦭🐳 ชดเชยรอบใหม่ + โอนิ 'ต่อตา' (lift ก่อน/หลัง: …)"
```

---

### Task 3: `petForms.js` — ร่างองศา · rarity ที่นับ · ชื่อบนจอ · ฤดู · คู่แบนเนอร์

**Files:**
- Create: `src/utils/petForms.js`
- Create: `src/utils/petForms.test.js`

**Interfaces:**
- Produces:
  - `degreeFormActive(team: Array<{id, rarity}>): boolean` — มี `'sol'` และไม่มีตัวไหน rarity `'common'` และมี `'earth'`
  - `effectiveRarity(pet: {id, rarity}, team): string` — `'common'` ถ้าเป็น earth ในร่างองศา ไม่งั้น `pet.rarity`
  - `displayName(petId: string, baseName: string, team): string` — ร่างองศา: sol → `'ซัน'` · earth → `'องศา'` · อื่นๆ คืน `baseName`
  - `SEASONS: Array<{ key:'hot'|'rain'|'cold', icon, label }>` (index = ช่อง 0/1/2)
  - `seasonOfSlot(slot: number)` → ของใน `SEASONS` (slot เกิน 2 ใช้ช่องสุดท้าย)
  - `duoPartnerOf(petId: string, team): string|null` — id ของคู่ที่ควรขึ้นหน้าคู่กันในแบนเนอร์

- [ ] **Step 1: เขียนเทสที่ต้องล้ม** — `src/utils/petForms.test.js`

```js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { degreeFormActive, effectiveRarity, displayName, seasonOfSlot, SEASONS, duoPartnerOf } from './petForms.js'

const P = (id, rarity) => ({ id, rarity })
const sol = P('sol', 'legendary'), earth = P('earth', 'legendary'), cat = P('cat', 'common'), lion = P('lion', 'legendary')

test('ร่างองศา: มี Sol + Earth + ไม่มี common เลย', () => {
  assert.equal(degreeFormActive([sol, earth, lion]), true)
  assert.equal(degreeFormActive([sol, earth, cat]), false, 'มี common แล้ว Earth ไม่ต้องแปลง')
  assert.equal(degreeFormActive([earth, lion]), false, 'ไม่มี Sol ไม่แปลง')
  assert.equal(degreeFormActive([sol, lion]), false, 'ไม่มี Earth')
})

test('effectiveRarity: Earth ในร่างองศานับเป็น common', () => {
  assert.equal(effectiveRarity(earth, [sol, earth, lion]), 'common')
  assert.equal(effectiveRarity(earth, [sol, earth, cat]), 'legendary')
  assert.equal(effectiveRarity(cat, [sol, earth, cat]), 'common')
})

test('displayName: ร่างองศา = ซัน/องศา · ปกติ = ชื่อเดิม', () => {
  const t = [sol, earth, lion]
  assert.equal(displayName('sol', 'ซอล', t), 'ซัน')
  assert.equal(displayName('earth', 'เอิร์ธ', t), 'องศา')
  assert.equal(displayName('lion', 'สิงโต', t), 'สิงโต')
  assert.equal(displayName('sol', 'ซอล', [sol, cat]), 'ซอล')
})

test('ฤดูตามช่อง: 0 ร้อน · 1 ฝน · 2 หนาว', () => {
  assert.deepEqual(SEASONS.map(s => s.key), ['hot', 'rain', 'cold'])
  assert.equal(seasonOfSlot(0).key, 'hot')
  assert.equal(seasonOfSlot(2).key, 'cold')
  assert.equal(seasonOfSlot(7).key, 'cold')
})

test('duoPartnerOf: ☀️🌍 เฉพาะร่างองศา · 🐳🦭 เมื่ออยู่ทีมเดียวกัน', () => {
  assert.equal(duoPartnerOf('sol', [sol, earth, lion]), 'earth')
  assert.equal(duoPartnerOf('earth', [sol, earth, lion]), 'sol')
  assert.equal(duoPartnerOf('sol', [sol, earth, cat]), null)
  assert.equal(duoPartnerOf('whale', [P('whale', 'legendary'), P('seal', 'rare')]), 'seal')
  assert.equal(duoPartnerOf('whale', [P('whale', 'legendary')]), null)
})
```

- [ ] **Step 2: รันให้ล้ม** — `node --test src/utils/petForms.test.js` → FAIL "Cannot find module"

- [ ] **Step 3: เขียน `src/utils/petForms.js`**

```js
// src/utils/petForms.js
// จุดเดียวที่ตอบว่า "ในทีมนี้ เพ็ทตัวนี้อยู่ในร่างไหน / นับเป็น rarity อะไร / ชื่อบนจออะไร / ฤดูอะไร"
// pure — เอนจิน (battlePassives) · ป้าย (battleBuffs) · รีเพลย์ · หน้าจัดทีม อ่านจากที่นี่ที่เดียว
// สเปก: docs/superpowers/specs/2026-09-26-pharmaverse-roadmap-design.md §3.1–3.2
//
// 🔑 ร่าง "องศา": ทีมมี ☀️ Sol และ 🌍 Earth แต่ไม่มี common เลย ⇒ Earth นับเป็น common (ได้บัฟ Sol)
//    แลกกับเสียสกิลฤดูกาลทั้งหมด · บนจอ Sol ชื่อ "ซัน" · Earth ชื่อ "องศา" (log/เอนจินแบกชื่อจริงเสมอ)

const ids = (team) => new Set((team || []).filter(Boolean).map(p => p.id))

export function degreeFormActive(team) {
  const list = (team || []).filter(Boolean)
  const has = ids(list)
  return has.has('sol') && has.has('earth') && !list.some(p => p.rarity === 'common')
}

export function effectiveRarity(pet, team) {
  if (pet?.id === 'earth' && degreeFormActive(team)) return 'common'
  return pet?.rarity || 'common'
}

const FORM_NAMES = { sol: 'ซัน', earth: 'องศา' }

export function displayName(petId, baseName, team) {
  if (FORM_NAMES[petId] && degreeFormActive(team)) return FORM_NAMES[petId]
  return baseName
}

/** ฤดูของ 🌍 ตามช่องในทีม (index = ลำดับออกตี) — ฤดูของไทย 3 ฤดูพอดีกับ 3 ช่อง */
export const SEASONS = [
  { key: 'hot', icon: '☀️', label: 'ฤดูร้อน' },
  { key: 'rain', icon: '🌧️', label: 'ฤดูฝน' },
  { key: 'cold', icon: '❄️', label: 'ฤดูหนาว' },
]
export const seasonOfSlot = (slot) => SEASONS[Math.max(0, Math.min(SEASONS.length - 1, slot | 0))]

/** คู่ที่แบนเนอร์ขึ้นหน้าเพ็ทสองตัวชิดกัน — `when` คืน true เมื่อคู่ทำงานในทีมนั้น */
const DUO_FACES = [
  { ids: ['sol', 'earth'], when: degreeFormActive },
  { ids: ['whale', 'seal'], when: (team) => ['whale', 'seal'].every(id => ids(team).has(id)) },
]

export function duoPartnerOf(petId, team) {
  for (const d of DUO_FACES) {
    if (!d.ids.includes(petId) || !d.when(team)) continue
    return d.ids.find(id => id !== petId) || null
  }
  return null
}
```

- [ ] **Step 4: รันเทสให้ผ่าน** — `node --test src/utils/petForms.test.js` → PASS

- [ ] **Step 5: Commit**

```bash
git add src/utils/petForms.js src/utils/petForms.test.js
git commit -m "Pets: petForms — ร่างองศา/ชื่อบนจอ/ฤดูตามช่อง/คู่แบนเนอร์ รวมไว้ที่เดียว (สเปก Pharmaverse §3.2)"
```

---

### Task 4: ข้อมูลเพ็ท 3 ตัว + พาสสีฟ + ☀️ บัฟตามระดับ

**Files:**
- Modify: `src/data/index.js` (PETS)
- Modify: `src/data/petPassives.js` (3 ตัว + ทะเบียนป้าย)
- Modify: `src/utils/battlePassives.js` (`applyForms` + เคส `rarityBoost` ใน `applyAuras` + `STAT_EFFECTS`)
- Modify: `src/utils/battleEngine.js` (เรียก `applyForms` ก่อน `runSetup`)
- Modify: `src/utils/battleBeats.js` (`OPENING_EFFECTS`)
- Modify: `src/utils/battleBuffs.js` (ป้าย ☀️ เฉพาะตัวที่นับเป็น common)
- Test: `src/utils/battlePassives.test.js`, `src/utils/battleBuffs.test.js`

**Interfaces:**
- Consumes: `degreeFormActive`, `effectiveRarity` (Task 3) · combatant `rarity`/`slot` (Task 1)
- Produces: `applyForms(team)` ตั้ง `u.countsAs = 'common'` + `psOf(u).formed = true` ให้ Earth ในร่างองศา · effect `rarityBoost` value `{ rarity: 'common', pct }`

- [ ] **Step 1: เพิ่ม PETS** — `src/data/index.js` ต่อท้ายกลุ่ม legendary (หลังบรรทัด gorilla)

> ข้อความ `flavor` (คำพูด) และ `lore` ด้านล่างเป็น **ร่างที่ต้องให้ user อนุมัติ** (Step 8) — ห้ามเอ่ยชื่อเรื่องต้นฉบับ

```js
  // ── ต.ค. 2569 "My Earth tilted for you" — ฟากฟ้า (wave 3) ──
  { id:"sol",   emoji:"☀️", name:"ซอล",   rarity:"legendary", element:"fist",     wave:3,
    flavor:"ยืดอกไว้ ตราบใดที่ฉันยังส่องแสง ไม่มีใครในทีมนี้ตัวเล็กหรอก",
    lore:"ดวงอาทิตย์แห่งมิติฟากฟ้า ผู้ส่องแสงให้ทุกชีวิตโดยไม่เลือกว่าใครตัวเล็กหรือใหญ่ พอประตูของผู้อัญเชิญเปิดออก เธอเป็นดวงแรกที่ก้าวข้ามมา เพราะเชื่อว่าแสงสว่างมีไว้ให้คนที่ยังไม่เชื่อในตัวเอง" },
  { id:"earth", emoji:"🌍", name:"เอิร์ธ", rarity:"legendary", element:"paper",    wave:3,
    flavor:"ไม่ต้องมองฉันก็ได้… แค่ให้ฉันได้อยู่ข้างๆ ก็พอ",
    lore:"ดาวดวงเล็กที่คิดมาตลอดว่าตัวเองธรรมดาเกินกว่าจะมีใครมองเห็น ความเอียง 23.5 องศาที่ทำให้เกิดฤดูกาล คือแรงเดียวกับที่เหวี่ยงเธอไปหาดวงอาทิตย์ ทุกครั้งที่โคจรครบรอบ เธอจะส่งฤดูกาลใหม่ให้เพื่อนๆ อย่างเงียบๆ" },
  { id:"luna",  emoji:"🌙", name:"ลูน่า",  rarity:"legendary", element:"scissors", wave:3,
    flavor:"คืนนี้พระจันทร์สวยนะ… เธอว่าไหม",
    lore:"จันทราผู้เฝ้ามองโลกจากอีกฟากของคืน อบอุ่นกับทุกคน แต่สายตามักลอยไปหาดวงดาวที่ไกลเกินเอื้อม แสงของเธอขึ้นลงตามข้างจันทร์ และเมื่อเต็มดวงเมื่อไหร่ ไม่มีเงาไหนหลบพ้น" },
```

⚠️ `petCatalog.wave1Pets()` ปัจจุบันกรอง `wave !== 2` ⇒ wave 3 จะหลุดเข้าตู้ปกติทันที — **แผน B Task 1 แก้ตรงนี้ ต้อง merge แผน B ก่อน deploy เสมอ** · ระหว่างทำแผน A ให้เพิ่มบรรทัดนี้ชั่วคราวใน `wave1Pets` แล้วค่อยให้แผน B เขียนทับ:

```js
export const wave1Pets = () => PETS.filter(p => !p.wave || p.wave === 1)
```

- [ ] **Step 2: เพิ่มพาสสีฟ** — `src/data/petPassives.js` ต่อจาก `mammoth`

```js
  // ── ต.ค. 2569 ฟากฟ้า ─────────────────────────────────────────
  sol: {
    name: 'แสงนำทาง', icon: '🌟',
    parts: [{ hook: 'aura', effect: 'rarityBoost', value: { rarity: 'common', pct: 50 }, step: { pct: 5 } }],
    desc: 'เพื่อนระดับธรรมดา (common) ทุกตัวในทีม พลังโจมตีและเลือดสูงสุด +{pct}%',
    short: 'common ในทีม แรง+เลือด +{pct}%',
  },
  earth: {
    name: 'ฤดูกาลหมุนเวียน', icon: '🌏',
    parts: [{ hook: 'onRoundEnd', effect: 'season', value: { hot: 20, rain: 25, cold: 30 },
              step: { hot: 5, rain: 5, cold: 5 } }],
    desc: 'จบรอบทีไร ฤดูตามช่องทำงาน: ช่อง 1 ☀️ รอบหน้าทีมแรง +{hot}% · ช่อง 2 🌧️ ทีมฟื้น {rain}% ของเลือดที่หาย · ช่อง 3 ❄️ ศัตรูแต่ละตัว {cold}% โดนแช่แข็ง 1 ตา · ทีมมีซอลแต่ไม่มี common: กลายเป็นองศา (นับเป็น common ไม่มีฤดู)',
    short: 'จบรอบ: ช่อง1 แรง +{hot}% · ช่อง2 ฟื้น {rain}% · ช่อง3 แช่แข็ง {cold}%',
  },
  luna: {
    name: 'ข้างขึ้นข้างแรม', icon: '🌕',
    parts: [{ hook: 'onAttack', effect: 'moonPhase', value: { dark: 75, half: 125, full: 175 },
              step: { dark: 0, half: 0, full: 25 } }],
    desc: 'หมัดวนตามข้างจันทร์: 🌑 จันทร์ดับ {dark}% → 🌙 เสี้ยว {half}% → 🌕 เต็มดวง {full}%',
    short: 'หมัดวน 🌑 {dark}% → 🌙 {half}% → 🌕 {full}%',
  },
```

ทะเบียนป้ายในไฟล์เดียวกัน (ไอคอนต้องไม่ซ้ำตัวอื่น — มีเทสคุม):

```js
// STATUS_ICON — เพิ่ม
  rarityBoost: '🌟', season: '🌏', moonPhase: '🌕',
// STATUS_TEXT — เพิ่ม
  rarityBoost: 'ตัวธรรมดาได้แสงนำทาง', season: 'ส่งฤดูกาลทุกจบรอบ', moonPhase: 'หมัดวนตามข้างจันทร์',
// TEAM_AURA_EFFECTS — เพิ่ม 'rarityBoost'
// SELF_STATUS_EFFECTS — เพิ่ม 'season', 'moonPhase'
// BADGE_PRIORITY — เพิ่ม
  rarityBoost: 31, season: 20, moonPhase: 11,
```

และเพิ่ม `'sol', 'earth', 'luna'` ท้าย `PASSIVE_V2_CHANGED` **ไม่ต้อง** (เป็นเพ็ทใหม่ ไม่ใช่กลไกเปลี่ยน)

- [ ] **Step 3: เขียนเทสที่ต้องล้ม** — ต่อท้าย `src/utils/battlePassives.test.js`

```js
import { applyForms, applyAuras, psOf as psOfForms } from './battlePassives.js'

const U = (id, rarity, slot, side = 'A') => ({ id, rarity, slot, uid: side + slot, side, element: 'fist', atk: 10, maxHp: 100, hp: 100 })

test('rarityBoost: ☀️ บัฟเฉพาะ common +50% ทั้งแรงและเลือด', () => {
  const team = [U('sol', 'legendary', 0), U('cat', 'common', 1), U('lion', 'legendary', 2)]
  applyForms(team)
  applyAuras(team, [])
  assert.equal(Math.round(team[1].atk), 15)
  assert.equal(Math.round(team[1].maxHp), 150)
  assert.equal(team[1].hp, team[1].maxHp)
  assert.equal(Math.round(team[2].atk), 10, 'L ไม่ได้')
  assert.equal(Math.round(team[0].atk), 10, 'Sol เองไม่ได้')
})

test('ร่างองศา: Earth นับเป็น common ได้บัฟ + ถูกปิดฤดู', () => {
  const team = [U('sol', 'legendary', 0), U('earth', 'legendary', 1), U('lion', 'legendary', 2)]
  applyForms(team)
  applyAuras(team, [])
  assert.equal(team[1].countsAs, 'common')
  assert.equal(psOfForms(team[1]).formed, true)
  assert.equal(Math.round(team[1].atk), 15)
})

test('มี common ในทีม ⇒ Earth ไม่แปลงร่าง ไม่ได้บัฟ', () => {
  const team = [U('sol', 'legendary', 0), U('earth', 'legendary', 1), U('cat', 'common', 2)]
  applyForms(team)
  applyAuras(team, [])
  assert.equal(team[1].countsAs, undefined)
  assert.equal(Math.round(team[1].atk), 10)
})
```

Run: `node --test src/utils/battlePassives.test.js` → FAIL (`applyForms` ไม่มี)

- [ ] **Step 4: เขียน `applyForms` + เคส `rarityBoost`** — `src/utils/battlePassives.js`

import เพิ่มบนสุด: `import { degreeFormActive } from './petForms.js'`

ใต้ `runSetup`:

```js
// ══════════════════════════════════════════════════════════════
//  forms — ร่างพิเศษตามองค์ประกอบทีม (ก่อน setup/aura ทุกอย่าง)
// ══════════════════════════════════════════════════════════════
/** 🌍 ร่าง "องศา": ทีมมี Sol + Earth และไม่มี common ⇒ Earth นับเป็น common (ได้แสงนำทาง) แต่ไม่มีฤดู
 *  🔑 เงื่อนไขอยู่ที่ utils/petForms.js ที่เดียว — ป้าย/รีเพลย์/หน้าจัดทีมอ่านตัวเดียวกัน */
export function applyForms(team) {
  if (!degreeFormActive(team)) return
  for (const u of team) {
    if (u.id !== 'earth') continue
    u.countsAs = 'common'
    psOf(u).formed = true
  }
}
```

ใน `applyAuras` เพิ่มเคสใน `switch`:

```js
        case 'rarityBoost':
          // ☀️ แสงนำทาง — ตัวที่ "นับเป็น" rarity นั้น (Earth ในร่างองศานับเป็น common) · Sol เองไม่ได้
          for (const t of team) {
            if (t === u) continue
            if ((t.countsAs || t.rarity) !== v.rarity) continue
            t.atk *= 1 + v.pct / 100
            t.maxHp *= 1 + v.pct / 100
            t.hp = t.maxHp
          }
          break
```

และเพิ่ม `'rarityBoost'` ใน `STAT_EFFECTS`

- [ ] **Step 5: เรียก `applyForms` ในเอนจิน** — `battleEngine.js` ก่อนบรรทัด `runSetup`:

```js
  applyForms(A); applyForms(B)   // ร่างพิเศษตามองค์ประกอบทีม (🌍 องศา) — ต้องก่อน setup/aura
```

(เพิ่ม `applyForms` ใน import)

- [ ] **Step 6: `OPENING_EFFECTS`** — `src/utils/battleBeats.js` เพิ่มบรรทัด

```js
  'rarityBoost',                                                       // ☀️ ต.ค. 2569
```

- [ ] **Step 7: ป้าย ☀️ เฉพาะตัวที่นับเป็น common** — `src/utils/battleBuffs.js` ใน `buffSources` ลูป `for (const a of [...own.mine, ...own.duo])` เพิ่มบรรทัดแรก:

```js
        if (a.effect === 'rarityBoost' && effectiveRarity(pet, teams[side]) !== a.passive.parts[0].value.rarity) continue
```

(import `effectiveRarity` จาก `./petForms.js`) · เทสใน `battleBuffs.test.js`:

```js
test('ป้าย 🌟 ขึ้นเฉพาะ common (และองศา)', () => {
  const s = buffSources([{ id: 'sol', rarity: 'legendary' }, { id: 'cat', rarity: 'common' }, { id: 'lion', rarity: 'legendary' }], [])
  assert.ok(s.A1.some(b => b.effect === 'rarityBoost'))
  assert.ok(!s.A2.some(b => b.effect === 'rarityBoost'))
})
```

- [ ] **Step 8: ขอ user อนุมัติข้อความ** — ส่ง `flavor`/`lore`/ชื่อสกิล/desc ของ 3 ตัวให้ user อ่าน แก้ตามที่สั่งก่อน commit

- [ ] **Step 9: อีโมจิ + เทสทั้งหมด**

Run: `node scripts/fetch-fluent.mjs` แล้ว `node scripts/fluent-webp.mjs` (ต้องได้ `1f30d` 🌍 · `1f31f` 🌟 · `1f30f` 🌏 · `1f315` 🌕 · `1f311` 🌑 · `2744` ❄️ · `1f327` 🌧️)
Run: `node --test src/**/*.test.js src/utils/*.test.js` → PASS (เทสทะเบียนป้าย/ไอคอนไม่ซ้ำใน `petPassives.test.js` จะบอกถ้าลืมลงทะเบียน — ทำตามที่มันบอก)

- [ ] **Step 10: Commit**

```bash
git add src/data src/utils public/emoji
git commit -m "Pets: ☀️ซอล 🌍เอิร์ธ 🌙ลูน่า (wave 3) + แสงนำทาง common +50% + ร่างองศา"
```

---

### Task 5: 🌍 ฤดูกาลตอนจบรอบ + แช่แข็ง

**Files:**
- Modify: `src/utils/battlePassives.js` (`runOnRoundEnd` · บัฟร้อนใน `runOnRound` · ตัวคูณใน `runOnAttack`)
- Test: `src/utils/battlePassives.test.js`, `src/utils/battleEngine.test.js`

**Interfaces:**
- Consumes: `seasonOfSlot` (Task 3) · `psOf(u).skip/skipName/skipIcon` (Task 1) · `psOf(u).formed` (Task 4)
- Produces: event `effect: 'seasonHot'` (fxKind `'buff'`, targets = เพื่อนทุกตัว, amount = %) · `'seasonRain'` (fxKind `'heal'`, 1 event ต่อ 1 เป้า, มี `hpPct`) · `'seasonCold'` (fxKind `'freeze'`, targets = ศัตรูที่โดน) · `psOf(u).hotNext` / `hotActive`

- [ ] **Step 1: เขียนเทสที่ต้องล้ม** — `battlePassives.test.js`

```js
import { runOnRoundEnd, runOnRound, runOnAttack } from './battlePassives.js'

test('ฤดูร้อน (ช่อง 0): จบรอบ → รอบหน้าหมัดแรง +20%', () => {
  const team = [U('earth', 'legendary', 0), U('cat', 'common', 1)]
  const out = runOnRoundEnd(team, [], () => 0)
  assert.equal(out[0].effect, 'seasonHot')
  runOnRound(team)                                  // ต้นรอบถัดไป: hotNext → hotActive
  const r = runOnAttack(team[1], U('x', 'common', 0, 'B'), [U('x', 'common', 0, 'B')], () => 0.99)
  assert.equal(Math.round(r.atkMult * 100), 120)
})

test('ฤดูฝน (ช่อง 1): ฟื้น 25% ของเลือดที่หาย · event ต่อเป้า', () => {
  const team = [U('cat', 'common', 0), U('earth', 'legendary', 1)]
  team[0].hp = 60                                   // หาย 40 → ฟื้น 10
  const out = runOnRoundEnd(team, [], () => 0)
  const e = out.find(x => x.targets[0] === 'A0')
  assert.equal(e.effect, 'seasonRain')
  assert.equal(team[0].hp, 70)
  assert.equal(e.hpPct, 70)
})

test('ฤดูหนาว (ช่อง 2): rand < 30% → ศัตรูได้ skip 1', () => {
  const team = [U('cat', 'common', 0), U('lion', 'legendary', 1), U('earth', 'legendary', 2)]
  const foes = [U('a', 'common', 0, 'B'), U('b', 'common', 1, 'B')]
  const rolls = [0.1, 0.9]
  const out = runOnRoundEnd(team, foes, () => rolls.shift())
  assert.equal(foes[0].ps.skip, 1)
  assert.ok(!foes[1].ps?.skip)
  assert.deepEqual(out[0].targets, ['B0'])
})

test('ร่างองศา: ไม่มีฤดู', () => {
  const team = [U('sol', 'legendary', 0), U('earth', 'legendary', 1)]
  applyForms([...team, U('lion', 'legendary', 2)])
  assert.deepEqual(runOnRoundEnd(team, [], () => 0), [])
})
```

Run → FAIL

- [ ] **Step 2: เขียน `runOnRoundEnd`** (แทนตัวว่างจาก Task 1)

```js
export function runOnRoundEnd(team, foes, rand) {
  const out = []
  for (const u of alive(team)) {
    const p = passiveFor(u)
    for (const part of partsAt(p, 'onRoundEnd')) {
      if (part.effect !== 'season' || psOf(u).formed) continue   // ร่างองศาไม่มีฤดู
      const v = valOf(part, u)
      const s = seasonOfSlot(u.slot)
      if (s.key === 'hot') {
        for (const t of alive(team)) psOf(t).hotNext = v.hot
        out.push(ev(u, p, part, { effect: 'seasonHot', targets: alive(team).map(t => t.uid), amount: v.hot, fxKind: 'buff' }))
      } else if (s.key === 'rain') {
        for (const t of alive(team)) {
          const before = t.hp
          t.hp = Math.min(t.maxHp, t.hp + (t.maxHp - t.hp) * v.rain / 100)
          const amount = Math.round(t.hp - before)
          if (amount > 0) out.push(ev(u, p, part, { effect: 'seasonRain', targets: [t.uid], amount,
            hpPct: Math.round((t.hp / t.maxHp) * 100), fxKind: 'heal' }))
        }
      } else {
        // 🎲 ดึง rand ศัตรูละ 1 ครั้ง ตามลำดับช่อง (deterministic)
        const hit = alive(foes).filter(() => rand() * 100 < v.cold)
        for (const f of hit) { const st = psOf(f); st.skip = 1; st.skipName = 'แช่แข็ง'; st.skipIcon = '❄️' }
        if (hit.length) out.push(ev(u, p, part, { effect: 'seasonCold', targets: hit.map(f => f.uid), amount: hit.length, fxKind: 'freeze' }))
      }
    }
  }
  return out
}
```

import `seasonOfSlot` จาก `./petForms.js`

- [ ] **Step 3: เปิดบัฟร้อนต้นรอบ** — บรรทัดแรกในลูป `for (const u of alive(team))` ของ `runOnRound`:

```js
    // ☀️ ฤดูร้อนจากจบรอบก่อน มีผลทั้งรอบนี้ แล้วหมดอายุ (จบรอบนี้ถ้า Earth ยังอยู่จะตั้งใหม่)
    { const st = psOf(u); st.hotActive = st.hotNext || 0; st.hotNext = 0 }
```

- [ ] **Step 4: ตัวคูณร้อนใน `runOnAttack`** — ก่อน `return res`:

```js
  const hot = psOf(att).hotActive || 0
  if (hot > 0) res.atkMult *= 1 + hot / 100
```

- [ ] **Step 5: เทสเอนจิน: ตัวที่โดนแช่แข็ง ตาถัดไปเป็น 'frozen'** — `battleEngine.test.js`

```js
test('แช่แข็ง: เป้าที่โดน ตาถัดไปของมันคือ frozen ไม่ใช่หมัด', () => {
  const A = [{ id: 'cat', rarity: 'common', element: 'fist', grade: 3 }, { id: 'lion', rarity: 'legendary', element: 'fist', grade: 3 },
             { id: 'earth', rarity: 'legendary', element: 'paper', grade: 3 }]
  const B = blank(3)
  let checked = 0
  for (let seed = 1; seed < 60 && checked < 3; seed++) {
    const log = simulateBattle(A, B, seed).log
    const ci = log.findIndex(e => e.effect === 'seasonCold')
    if (ci < 0) continue
    for (const uid of log[ci].targets) {
      const next = log.slice(ci + 1).find(e => (e.t === 'attack' && e.attacker === uid && !e.sub) || (e.effect === 'frozen' && e.uid === uid))
      if (!next) continue                            // ไฟต์จบก่อนถึงตา
      assert.equal(next.effect, 'frozen', `seed ${seed}: ${uid} ต้องข้ามตา`)
      checked++
    }
  }
  assert.ok(checked > 0, 'ต้องเจอเคสแช่แข็งอย่างน้อย 1')
})
```

- [ ] **Step 6: รันเทสทั้งหมด** — PASS

- [ ] **Step 7: Commit**

```bash
git add src/utils/battlePassives.js src/utils/battlePassives.test.js src/utils/battleEngine.test.js
git commit -m "Battle: 🌍 ฤดูกาลตามช่องทำงานตอนจบรอบ (ร้อน/ฝน/หนาว→แช่แข็งข้ามตา)"
```

---

### Task 6: 🌙 ข้างจันทร์

**Files:**
- Modify: `src/utils/battlePassives.js` (`runOnAttack` เคส `moonPhase`)
- Modify: `src/utils/battleBeats.js` (`CLUTCH_EFFECTS` + `'fullMoon'`)
- Test: `src/utils/battlePassives.test.js`

**Interfaces:**
- Produces: event `effect: 'moonPhase'` (fxKind `'moon'`, `phase` 0|1, amount = %) และ `effect: 'fullMoon'` (fxKind `'fullMoon'`, `phase` 2, amount = %) · `psOf(u).moon` = index ข้างถัดไป

- [ ] **Step 1: เทสที่ต้องล้ม**

```js
test('ลูน่า: หมัดวน 75 → 125 → 175 → 75', () => {
  const luna = U('luna', 'legendary', 0)
  const foe = U('x', 'common', 0, 'B')
  const got = [0, 1, 2, 3].map(() => runOnAttack(luna, foe, [foe], () => 0.99))
  assert.deepEqual(got.map(r => Math.round(r.atkMult * 100)), [75, 125, 175, 75])
  assert.equal(got[2].events[0].effect, 'fullMoon')
  assert.equal(got[0].events[0].effect, 'moonPhase')
})
```

- [ ] **Step 2: เขียนเคสใน `runOnAttack`**

```js
      case 'moonPhase': {
        // 🌙 วนตามหมัดของตัวเอง: ดับ → เสี้ยว → เต็มดวง · เต็มดวงได้แบนเนอร์ (fullMoon อยู่ใน CLUTCH_EFFECTS)
        const st = psOf(att)
        const i = st.moon || 0
        st.moon = (i + 1) % 3
        const pct = [v.dark, v.half, v.full][i]
        res.atkMult *= pct / 100
        const full = i === 2
        res.events.push(ev(att, p, part, { effect: full ? 'fullMoon' : 'moonPhase', targets: [att.uid],
          amount: pct, phase: i, fxKind: full ? 'fullMoon' : 'moon' }))
        break
      }
```

- [ ] **Step 3: `CLUTCH_EFFECTS`** — `battleBeats.js`:

```js
export const CLUTCH_EFFECTS = new Set(['revive', 'cheatDeath', 'saveAlly', 'grit', 'fullMoon'])
```

- [ ] **Step 4: เทสทั้งหมด → PASS · Commit**

```bash
git add src/utils/battlePassives.js src/utils/battleBeats.js src/utils/battlePassives.test.js
git commit -m "Battle: 🌙 ข้างจันทร์ 75/125/175% + เต็มดวงได้แบนเนอร์"
```

---

### Task 7: รีเพลย์ — ภาพ/เสียง/ชื่อ/หน้าคู่

**Files:**
- Modify: `src/components/battle/BattleReplay.vue` (`firePassiveFx` · `applyPassive` · `spotlightPassive` · ชื่อในหน้า inspect · แบนเนอร์)
- Modify: `src/utils/battleFx.js` (`CALL_TEXT.frozen`)
- Modify: `src/utils/sfx.js` (`sol` `earth` `luna` `freeze`)

**Interfaces:**
- Consumes: event จาก Task 1/5/6 · `displayName`, `duoPartnerOf` (Task 3)

- [ ] **Step 1: ป้าย "แข็ง!"** — `battleFx.js` ใน `CALL_TEXT` เพิ่ม `frozen: 'แข็ง! ❄️'` และให้ `frozen` ใช้คลาส `weak` เหมือน `miss`/`block`:

```js
    el.className = 'brfx brfx-call ' + (kind === 'miss' || kind === 'block' || kind === 'frozen' ? 'weak' : kind)
```

- [ ] **Step 2: เสียง** — `src/utils/sfx.js` ในกลุ่มเสียงเลเจนด์ (ใกล้ `gorilla:`)

```js
  sol:    () => { arp([523, 659, 784, 1047], 0.06, { type: 'triangle', vol: 0.55, d: 0.3 }); tone(1568, 0.25, 0.4, { type: 'sine', vol: 0.25 }) },
  earth:  () => { tone(196, 0, 0.5, { type: 'sine', vol: 0.6, slide: 262 }); noise(0.05, 0.3, { vol: 0.12, hp: 800 }) },
  luna:   () => { arp([659, 880, 1319], 0.12, { type: 'sine', vol: 0.4, d: 0.5 }) },
  freeze: () => { tone(2400, 0, 0.25, { type: 'sine', vol: 0.25, slide: 1200 }); noise(0, 0.2, { vol: 0.2, hp: 5000 }) },
```

- [ ] **Step 3: `LEGEND_SFX`** — `BattleReplay.vue` เพิ่ม `sol: 'sol', earth: 'earth', luna: 'luna'`

- [ ] **Step 4: FX ใน `firePassiveFx`** — เพิ่มก่อน `const PSFX`:

```js
  // ❄️ ฤดูหนาว: ตราแช่แข็งค้างบนการ์ดที่โดน จนกว่าจะถึงตาที่ถูกข้าม
  if (e.fxKind === 'freeze') { for (const t of on) fx?.stateMark(t, '❄️', 1); sfx('freeze') }
  // ⏸️ ถึงตาที่ถูกแช่แข็ง: ป้าย "แข็ง!" แล้วเอาตราออก
  if (e.fxKind === 'skip') { fx?.callout(e.uid, 'frozen'); fx?.stateMark(e.uid, '❄️', 0) }
```

⚠️ ตรวจ `stateMark` ใน `battleFx.js` ก่อน: ถ้ามันเก็บได้ทีละไอคอนต่อการ์ด (ชนกับ 🦠 ของไวรัส) ให้เปลี่ยนคีย์เป็น `uid + icon` แล้วเทสทั้งสองไอคอนบนการ์ดใบเดียวในห้องแล็บ (Task 9)

ใน `PSFX` เพิ่ม `moon: 'p_buff', fullMoon: 'p_fire'` · ใน `switch (e.fxKind)` เพิ่ม:

```js
    case 'moon':     fx?.ring(e.uid, 'windup', 200); break
    case 'fullMoon': fx?.sweep(on, '🌕', 0); break
    case 'freeze':   fx?.sweep(on, '❄️', 40); break
```

- [ ] **Step 5: แบนเนอร์เต็มดวงบอกเลข** — ใน `applyPassive` บล็อก `if (e.kind === 'skillMoment')` แทนด้วย:

```js
  if (e.kind === 'skillMoment') {
    if (LEGEND_SFX[e.petId]) sfx(LEGEND_SFX[e.petId])      // 🐦‍🔥 เกิดใหม่ ฯลฯ
    const opts = e.effect === 'fullMoon' ? { desc: `🌕 จันทร์เต็มดวง · หมัดนี้แรง ${e.amount}%` } : {}
    await spotlightPassive(e, t, g, opts); return
  }
```

- [ ] **Step 6: ชื่อ ซัน/องศา + หน้าคู่ในแบนเนอร์**

ในสคริปต์ เพิ่ม computed ทีมแบบ `{id, rarity}` และตัวช่วย:

```js
import { displayName, duoPartnerOf } from '../../utils/petForms.js'
const sideTeam = (side) => (side === 'A' ? props.data?.playerTeam : props.data?.botTeam) || []
/** ชื่อเพ็ทบนจอ (ซัน/องศา ในร่างพิเศษ) — log แบกชื่อจริงเสมอ */
function petNameOf(uid) {
  const def = defForUid(uid)
  return displayName(def.id, def.name, sideTeam(uid[0]))
}
```

ใน `spotlightPassive` ตอนสร้าง `view` เพิ่ม:

```js
    face2: (() => { const d = defForUid(e.uid); const id = duoPartnerOf(d.id, sideTeam(e.uid[0])); return id ? getPetDef(id)?.emoji || null : null })(),
    who: petNameOf(e.uid),
```

template แบนเนอร์ (`br-cut-face` + `br-cut-who`):

```html
<span class="br-cut-face" :class="{ duo: spotView.face2 }"><Emoji :char="spotView.face" /><Emoji v-if="spotView.face2" class="br-cut-face2" :char="spotView.face2" /></span>
…
<span class="br-cut-who">{{ spotView.side === 'B' ? 'ศัตรู' : 'ทีมคุณ' }} · {{ spotView.who }}</span>
```

CSS (scoped ในไฟล์เดียวกัน ใกล้ `.br-cut-face`):

```css
.br-cut-face.duo { display: inline-flex; align-items: center; }
.br-cut-face2 { margin-left: -.45em; transform: scale(.82); filter: drop-shadow(0 2px 3px rgba(0,0,0,.35)); }
```

หน้า inspect: แทน `{{ insp.def.name }}` ด้วย `{{ petNameOf(insp.uid) }}` (ถ้า `insp` ไม่มี `uid` ให้ดูว่าเปิด inspect ด้วยอะไรแล้วส่งตัวนั้น)

⚠️ `spotView` ค่าเริ่ม (ที่ reset) ต้องมี `face2: null, who: ''` ด้วย

- [ ] **Step 7: build + เทส** — `npx vite build` · `node --test …` → ผ่าน · `grep -n "color: rgba(0,0,0" src/components/battle/BattleReplay.vue` ไล่ดูว่าไม่มีสีดำบนพื้นเข้มใหม่ (CLAUDE.md ข้อ 13)

- [ ] **Step 8: Commit**

```bash
git add src/components/battle/BattleReplay.vue src/utils/battleFx.js src/utils/sfx.js
git commit -m "Replay: แช่แข็ง/ข้ามตา/ข้างจันทร์/ฤดูกาล + ชื่อ ซัน·องศา + หน้าคู่ในแบนเนอร์ (รวม 🐳🦭)"
```

---

### Task 8: หน้าจัดทีม — บอกฤดูของช่อง + ร่างองศา

**Files:**
- Modify: `src/components/battle/TeamPicker.vue`

**Interfaces:**
- Consumes: `seasonOfSlot`, `degreeFormActive`, `displayName` (Task 3)

- [ ] **Step 1: ตัวช่วยในสคริปต์**

```js
import { seasonOfSlot, degreeFormActive } from '../../utils/petForms.js'
// ทีมตามลำดับออกตีจริง = ช่องที่มีเพ็ท เรียงตามช่อง (resolveBattleTeam กรองช่องว่างทิ้ง)
const teamNow = computed(() => edit.slots.filter(Boolean).map(id => ({ id, rarity: defOf(id).rarity })))
const formOn = computed(() => degreeFormActive(teamNow.value))
/** ป้ายใต้ช่องของ 🌍 — ฤดูของตำแหน่งจริง หรือบอกว่ากลายเป็นองศา */
function earthTag(i) {
  if (edit.slots[i] !== 'earth') return null
  if (formOn.value) return '🌗 องศา · นับเป็น common'
  const pos = edit.slots.slice(0, i).filter(Boolean).length
  const s = seasonOfSlot(pos)
  return `${s.icon} ${s.label}`
}
```

- [ ] **Step 2: template** ใต้ `<span class="tp-slotname">…</span>` ในช่อง:

```html
<span v-if="earthTag(i)" class="tp-season">{{ earthTag(i) }}</span>
```

CSS:

```css
.tp-season { display: block; font-size: .7rem; font-weight: 700; color: var(--primary); margin-top: 2px; white-space: nowrap; }
```

ถ้า `formOn` ชื่อในช่องของ sol/earth ใช้ `displayName(id, defOf(id).name, teamNow)` แทน `defOf(id).name`

- [ ] **Step 3: build ผ่าน · Commit**

```bash
git add src/components/battle/TeamPicker.vue
git commit -m "Team: ช่องของ 🌍 บอกฤดู (ร้อน/ฝน/หนาว ตามตำแหน่ง) หรือร่างองศา"
```

---

### Task 9: ตรวจบนจอจริง + sim

**Files:** ชั่วคราวทั้งหมด (ลบก่อนจบ ห้าม commit): `skill-lab.html`, `src/devlab/skill-lab.js`

- [ ] **Step 1: ห้องแล็บ** — แพทเทิร์นเดียวกับ 26 ก.ย. (memory `rxtu10_replay_smoothness_review`): หน้า html + `window.__lab.run(i, seed)` เรนเดอร์ `BattleReplay` ของจริง · ⚠️ ทีมที่ส่งเข้า `simulateBattle` ต้องมี `rarity` + `element` ครบ (ไม่งั้นตกเป็น common/สมดุลทั้งหมด) · ไฟต์ที่ต้องมี:
  1. `[sol, cat, turtle]` vs `[lion, whale, gorilla]` — ☀️ ป้าย 🌟 เฉพาะ 🐱🐢 · เลขบนการ์ดขึ้น +50%
  2. `[sol, earth, lion]` vs อะไรก็ได้ — ชื่อ "ซัน"/"องศา" ในแบนเนอร์และหน้า inspect · หน้าคู่ ☀️🌍
  3. `[cat, lion, earth]` (ช่อง 3 = หนาว) — ❄️ ขึ้นบนศัตรู · ตาถัดไป "แข็ง!" · ตราหาย
  4. `[earth, cat, lion]` (ร้อน) และ `[cat, earth, lion]` (ฝน) — ป้าย/เลขฟื้นเด้ง
  5. `[luna, whale, seal]` — แบนเนอร์เต็มดวงทุกหมัดที่ 3 · หน้าคู่ 🐳🦭 ในแบนเนอร์ของ 🦭/🐳
- [ ] **Step 2: ตัวจด DOM** จับ "เลขเด้งแต่หลอดไม่ขยับ" ต้องไม่มี · ตัวนับ "รอบ N" บนจอต้องขึ้นทุกครั้งที่ทุกตัวตีครบ · ⚠️ หน้าต่าง Chrome ต้องไม่ถูกซ่อน (visibilityState hidden = timer ช้า — ขอ user เปิดหน้าต่างไว้)
- [ ] **Step 3: จับภาพ** แบนเนอร์เต็มดวง · หน้าคู่ · ❄️ บนการ์ด · หน้าจัดทีมที่ความกว้าง 390px → ส่งให้ user ดู
- [ ] **Step 4: sim** — `node scripts/passive-power-sim.mjs 1500 1` จดตำแหน่งของ sol/earth/luna ในตาราง ถ้าตัวไหน lift สูงกว่า L อันดับ 1 เดิมเกิน 15 จุด หรือติดลบ ให้รายงาน user พร้อมเลขที่เสนอ (เลขกลม) ห้ามแก้เอง
- [ ] **Step 5: ลบไฟล์แล็บ** `rm -rf src/devlab skill-lab.html` · `git status` ต้องสะอาด
