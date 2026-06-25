# Battle Overhaul Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** เปลี่ยน battle เป็นแบบสลับฝั่งตี (HS Battlegrounds) + เพิ่มหน้าสรุปผล/MVP, intro READY?→GO!, โชว์ธาตุในหน้า pets, passive "เร็วๆ นี้", และเติมไกด์

**Architecture:** แก้ลำดับการตีใน engine ที่ pure อยู่แล้ว (format `attack` event คงเดิม → downstream ไม่พัง) · หน้าสรุปคำนวณจาก `result.log` ผ่าน util pure ตัวใหม่ · งาน UI ที่เหลือเป็นการต่อยอด component เดิม

**Tech Stack:** Vue 3 SFC (scoped style), Pinia, Vite · เทส pure ด้วย `node --test` · ไม่มี test runner กลาง

## Global Constraints

- ภาษา UI ไทย · คอมเมนต์/commit ไทยปนอังกฤษ · commit รูปแบบ `Area: อะไร (ทำไม)`
- emoji ทุกตัวใน template ผ่าน `<Emoji :char="...">` เท่านั้น (อย่าใส่ emoji ดิบ — เป็น tofu บางเครื่อง)
- engine ต้อง pure + deterministic (seeded) — ห้ามอ่าน store/Firestore/Date.now
- `attack` event ต้องคงทุกฟิลด์เดิม: `{ t:'attack', side, attacker, target, dmg, crit, eff, targetHpAfter, dead }`
- ชื่อธาตุกลาง: **ค้อน / กรรไกร / กระดาษ** · อีโมจิ ✊ / ✌️ / ✋ (จาก `ELEMENTS`)
- เกรด clamp 0..5 · `teamSize` 4
- verify ทุกเฟส: `node --test src/utils/*.test.js src/data/*.test.js` + `npm run build`
- รันเทสตรง: `node --test src/utils/battleEngine.test.js` (Windows: cwd = `rxtu10-v2`)

---

# PHASE 1 — Engine สลับฝั่งตี

อ้างอิง spec: `docs/superpowers/specs/2026-06-25-battle-alternating-attacks-design.md`

## Task 1: เพิ่ม `maxTurns` ใน BATTLE_CFG

**Files:**
- Modify: `src/data/battle.js:8-12`
- Test: `src/data/battle.test.js:5-10`

**Interfaces:**
- Produces: `BATTLE_CFG.maxTurns` (number = 300) ใช้เป็น cap จำนวนการตีรวมใน Task 2

- [ ] **Step 1: แก้เทสให้คาดหวัง maxTurns**

ใน `src/data/battle.test.js` แก้ test แรกเป็น:

```js
test('BATTLE_CFG ตรงกับ sim ที่จูนแล้ว', () => {
  assert.equal(BATTLE_CFG.teamSize, 4)
  assert.equal(BATTLE_CFG.maxRounds, 30)
  assert.equal(BATTLE_CFG.maxTurns, 300)
  assert.equal(BATTLE_CFG.elementAdv, 1.20)
  assert.equal(BATTLE_CFG.elementDis, 0.83)
})
```

- [ ] **Step 2: รันเทส ดูว่า fail**

Run: `node --test src/data/battle.test.js`
Expected: FAIL — `maxTurns` undefined (expected 300, got undefined)

- [ ] **Step 3: เพิ่ม maxTurns ใน config**

ใน `src/data/battle.js` แก้บล็อก BATTLE_CFG:

```js
export const BATTLE_CFG = {
  teamSize: 4, maxRounds: 30,   // maxRounds = legacy (ไม่ใช้เป็น cap แล้ว ดู maxTurns)
  maxTurns: 300,                // cap จำนวนการตีรวม กันลูปยาวผิดปกติ (1 ตัวออกตี = 1 turn)
  elementAdv: 1.20, elementDis: 0.83,
  critRate: 0.12, critMult: 1.6, variance: 0.22,
}
```

- [ ] **Step 4: รันเทส ดูว่าผ่าน**

Run: `node --test src/data/battle.test.js`
Expected: PASS ทุก test

- [ ] **Step 5: commit**

```bash
git add src/data/battle.js src/data/battle.test.js
git commit -m "Battle: เพิ่ม BATTLE_CFG.maxTurns (cap จำนวนตีรวม สำหรับลำดับตีแบบสลับฝั่ง)"
```

## Task 2: เขียนลูป simulateBattle ใหม่ (สลับฝั่งตี)

**Files:**
- Modify: `src/utils/battleEngine.js:45-55` (ลูป round เดิม)
- Test: `src/utils/battleEngine.test.js`

**Interfaces:**
- Consumes: `BATTLE_CFG.maxTurns` (Task 1)
- Produces: `simulateBattle(teamA, teamB, seed)` → `{ winner, rounds, log }` (signature เดิม)
  · log มี `{t:'round',n}` ต้นแต่ละ cycle และ `{t:'attack',...}` (format เดิม) ปิดท้าย `{t:'end',...}`

- [ ] **Step 1: เพิ่มเทสพฤติกรรมใหม่**

เพิ่มท้าย `src/utils/battleEngine.test.js`:

```js
test('ฝั่งตัวเยอะกว่าได้ตีก่อน', () => {
  const a = mono('rare', 'scissors', 3, 1)  // 1 ตัว
  const b = mono('rare', 'scissors', 3, 3)  // 3 ตัว
  const first = simulateBattle(a, b, 42).log.find(e => e.t === 'attack')
  assert.equal(first.side, 'B')
})

test('ฝั่งตีสลับกันเสมอ (ไม่ว่าเหลือกี่ตัว)', () => {
  const r = simulateBattle(mono('rare', 'fist', 3, 1), mono('rare', 'scissors', 3, 4), 99)
  const sides = r.log.filter(e => e.t === 'attack').map(e => e.side)
  assert.ok(sides.length > 2)
  for (let i = 1; i < sides.length; i++) assert.notEqual(sides[i], sides[i - 1], `ตำแหน่ง ${i} ไม่สลับ`)
})

test('ฝั่งเหลือ 1 ตัว ตัวนั้นได้ตีทุกตาของฝั่งตน', () => {
  const r = simulateBattle(mono('rare', 'fist', 3, 1), mono('rare', 'scissors', 3, 4), 99)
  const aAtks = r.log.filter(e => e.t === 'attack' && e.side === 'A')
  assert.ok(aAtks.length > 1)
  assert.ok(aAtks.every(e => e.attacker === 'A0'), 'ตัวเดียวของ A ต้องเป็น A0 เสมอ')
})

test('เลือกตัวออกตีจากซ้ายไปขวา (ก่อนมีตัวตาย)', () => {
  // paper mono = อึด (hp bias 1.2) → ตัวแรกตายช้า มีพื้นที่เช็คลำดับ
  const r = simulateBattle(mono('rare', 'paper', 3, 4), mono('rare', 'paper', 3, 4), 7)
  const seq = []
  for (const e of r.log) {
    if (e.t === 'attack' && e.dead) break
    if (e.t === 'attack' && e.side === 'A') seq.push(e.attacker)
  }
  assert.deepEqual(seq.slice(0, 4), ['A0', 'A1', 'A2', 'A3'])
})
```

- [ ] **Step 2: รันเทส ดูว่า fail**

Run: `node --test src/utils/battleEngine.test.js`
Expected: FAIL — เทสใหม่ fail (ลำดับยังเป็นแบบ round เดิม สุ่มลำดับ)

- [ ] **Step 3: เขียนลูปใหม่**

ใน `src/utils/battleEngine.js` แทนบล็อกตั้งแต่ `let round = 0` ถึงปิด `while` (บรรทัด ~45-55) ด้วย:

```js
  const countAlive = (t) => t.reduce((n, f) => n + (f.hp > 0 ? 1 : 0), 0)
  // หาตัวออกตี: ไล่จาก cursor ไปขวา วนกลับมาซ้าย เจอตัวแรกที่ยังไม่ตาย (-1 = ไม่มี)
  const nextAttacker = (team, cursor) => {
    const n = team.length
    for (let k = 0; k < n; k++) { const i = (cursor + k) % n; if (team[i].hp > 0) return i }
    return -1
  }

  // ใครก่อน: ฝั่งตัวเยอะกว่าตีก่อน · เท่ากัน → สุ่ม (ดึงจาก rand เดิม คง deterministic)
  const ca = countAlive(A), cb = countAlive(B)
  const first = ca > cb ? 'A' : cb > ca ? 'B' : (rand() < 0.5 ? 'A' : 'B')
  const cursor = { A: 0, B: 0 }
  let cur = first, round = 0, turns = 0

  while (alive(A).length && alive(B).length && turns < BATTLE_CFG.maxTurns) {
    if (cur === first) { round++; log.push({ t: 'round', n: round }) }   // ต้น cycle ใหม่
    const team = cur === 'A' ? A : B
    const foes = cur === 'A' ? B : A
    const ai = nextAttacker(team, cursor[cur])
    if (ai !== -1) { hit(team[ai], foes); cursor[cur] = (ai + 1) % team.length }
    turns++
    cur = cur === 'A' ? 'B' : 'A'   // สลับฝั่งเสมอ
  }
```

หมายเหตุ: บรรทัด `let round = 0` เดิมถูกแทนแล้ว · ส่วนคำนวณ winner/pct/log end ด้านล่างคงเดิมทั้งหมด

- [ ] **Step 4: รันเทส ดูว่าผ่านทั้งหมด**

Run: `node --test src/utils/battleEngine.test.js`
Expected: PASS ทุก test (ทั้งเทสเดิม deterministic/element/grade/empty/eff/round-marker และเทสใหม่ 4 ตัว)

ถ้าเทส "เลือกตัวออกตีจากซ้ายไปขวา" flaky (ตัวตายก่อนครบ 4) — ตรวจว่า `seq.slice(0,4)` ได้ครบ; ถ้าไม่ ปรับ seed ในเทสเป็นค่าที่ตัวแรกตายช้ากว่า (ลอง 7→11→23) แล้วรันซ้ำจนผ่าน (พฤติกรรมถูกต้องไม่ขึ้นกับ seed — แค่ต้องการช่วงก่อนตาย)

- [ ] **Step 5: commit**

```bash
git add src/utils/battleEngine.js src/utils/battleEngine.test.js
git commit -m "Battle: สลับฝั่งตีแบบ HS Battlegrounds (ฝั่งเยอะตีก่อน, ซ้าย→ขวาวน, สลับฝั่งเสมอ)"
```

## Task 3: verify เฟส 1 (build + deploy gate)

- [ ] **Step 1: รันเทสรวม + build**

Run: `node --test src/utils/battleEngine.test.js src/data/battle.test.js`
แล้ว: `npm run build`
Expected: เทสผ่านหมด · build สำเร็จไม่มี error

- [ ] **Step 2: ลองใน dev (ผู้ใช้)**

แจ้งผู้ใช้: เปิด dev (`npm run dev`) → หอคอย → สู้ → ดู replay ว่าตีสลับฝั่งซ้าย→ขวา ไม่พังจอ
(หยุดรอผู้ใช้ยืนยันก่อนปิดเฟส — ถ้าผู้ใช้ให้ deploy: `git push origin master`)

---

# PHASE 2 — หน้าสรุปผล + intro READY?→GO!

อ้างอิง spec: `docs/superpowers/specs/2026-06-25-battle-ux-pets-guide-design.md` §1-2

## Task 4: util `battleSummary.js` (pure)

**Files:**
- Create: `src/utils/battleSummary.js`
- Test: `src/utils/battleSummary.test.js`

**Interfaces:**
- Produces: `computeBattleSummary(log, playerTeam, botTeam)` →
  `{ teamA: Unit[], teamB: Unit[], mvp: { A: uid|null, B: uid|null } }`
  โดย `Unit = { uid, side, id, dmgDealt, dmgTaken, kills, dead }` (เรียงตาม index ทีม)
- Consumes (โดย Task 5): export ตัวนี้

- [ ] **Step 1: เขียนเทส**

สร้าง `src/utils/battleSummary.test.js`:

```js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { computeBattleSummary } from './battleSummary.js'

const teamA = [{ id: 'x' }, { id: 'y' }]
const teamB = [{ id: 'z' }]
const log = [
  { t: 'round', n: 1 },
  { t: 'attack', side: 'A', attacker: 'A0', target: 'B0', dmg: 30, dead: false },
  { t: 'attack', side: 'B', attacker: 'B0', target: 'A1', dmg: 50, dead: false },
  { t: 'attack', side: 'A', attacker: 'A1', target: 'B0', dmg: 20, dead: true },
  { t: 'end', winner: 'A' },
]

test('รวมดาเมจทำ/รับ ต่อตัว ทั้งสองฝั่ง', () => {
  const s = computeBattleSummary(log, teamA, teamB)
  const a0 = s.teamA.find(u => u.uid === 'A0')
  const a1 = s.teamA.find(u => u.uid === 'A1')
  const b0 = s.teamB.find(u => u.uid === 'B0')
  assert.equal(a0.dmgDealt, 30); assert.equal(a0.dmgTaken, 0)
  assert.equal(a1.dmgDealt, 20); assert.equal(a1.dmgTaken, 50); assert.equal(a1.kills, 1)
  assert.equal(b0.dmgDealt, 50); assert.equal(b0.dmgTaken, 50); assert.equal(b0.dead, true)
})

test('MVP ต่อทีม = score สูงสุด (dealt + 0.5*taken)', () => {
  const s = computeBattleSummary(log, teamA, teamB)
  // A0 score=30, A1 score=20+25=45 → MVP ทีม A = A1 · ทีม B มีตัวเดียว = B0
  assert.equal(s.mvp.A, 'A1')
  assert.equal(s.mvp.B, 'B0')
})

test('เสมอ → ตัว index น้อยกว่า (ซ้าย) เป็น MVP', () => {
  const tie = [
    { t: 'attack', side: 'A', attacker: 'A0', target: 'B0', dmg: 10, dead: false },
    { t: 'attack', side: 'A', attacker: 'A1', target: 'B0', dmg: 10, dead: false },
  ]
  const s = computeBattleSummary(tie, teamA, teamB)
  assert.equal(s.mvp.A, 'A0')
})

test('ทีมว่าง → mvp null', () => {
  const s = computeBattleSummary([], [], teamB)
  assert.equal(s.mvp.A, null)
  assert.equal(s.teamA.length, 0)
})
```

- [ ] **Step 2: รันเทส ดูว่า fail**

Run: `node --test src/utils/battleSummary.test.js`
Expected: FAIL — module ยังไม่มี

- [ ] **Step 3: เขียน util**

สร้าง `src/utils/battleSummary.js`:

```js
// สรุปผลต่อตัว ทั้งสองฝั่ง + MVP ต่อทีม — pure (เทส node --test)
// ใช้แสดงหน้าสรุปการต่อสู้ (คนละหน้าที่กับ battleStats.js ที่เขียน Firestore แบบ species-keyed)
const MVP_TAKEN_WEIGHT = 0.5   // tunable: เครดิตของตัวที่ดูดดาเมจ (อึด)

const idxOf = (uid) => parseInt(uid.slice(1), 10)

export function computeBattleSummary(log, playerTeam, botTeam) {
  const units = {}
  const mk = (side, team) => (team || []).forEach((p, i) => {
    units[side + i] = { uid: side + i, side, id: p?.id || null, dmgDealt: 0, dmgTaken: 0, kills: 0, dead: false }
  })
  mk('A', playerTeam); mk('B', botTeam)

  for (const e of log || []) {
    if (e.t !== 'attack') continue
    const a = units[e.attacker], t = units[e.target]
    if (a) { a.dmgDealt += e.dmg || 0; if (e.dead) a.kills += 1 }
    if (t) { t.dmgTaken += e.dmg || 0; if (e.dead) t.dead = true }
  }

  const score = (u) => u.dmgDealt + MVP_TAKEN_WEIGHT * u.dmgTaken
  const teamOf = (side) => Object.values(units).filter(u => u.side === side).sort((x, y) => idxOf(x.uid) - idxOf(y.uid))
  const mvpOf = (list) => {
    if (!list.length) return null
    let best = list[0]                          // list เรียง index แล้ว → เสมอเลือกซ้ายสุดอัตโนมัติ
    for (const u of list) if (score(u) > score(best)) best = u
    return best.uid
  }
  const teamA = teamOf('A'), teamB = teamOf('B')
  return { teamA, teamB, mvp: { A: mvpOf(teamA), B: mvpOf(teamB) } }
}
```

- [ ] **Step 4: รันเทส ดูว่าผ่าน**

Run: `node --test src/utils/battleSummary.test.js`
Expected: PASS ทุก test

- [ ] **Step 5: commit**

```bash
git add src/utils/battleSummary.js src/utils/battleSummary.test.js
git commit -m "Battle: util computeBattleSummary (ดาเมจรายตัวสองฝั่ง + MVP ต่อทีม)"
```

## Task 5: หน้าสรุป + intro ใน BattleReplay.vue

**Files:**
- Modify: `src/components/battle/BattleReplay.vue` (template state `done` + เพิ่ม intro overlay + script + style)
- Test: manual (UI) — verify ใน dev

**Interfaces:**
- Consumes: `computeBattleSummary` (Task 4), `props.data.result.log`, `props.data.playerTeam`, `props.data.botTeam`, `props.data.won`, `props.data.cleared`

- [ ] **Step 1: import + state intro (script)**

ใน `<script setup>` ของ `BattleReplay.vue`:
1. เพิ่ม import: `import { computeBattleSummary } from '../../utils/battleSummary.js'`
2. เพิ่ม state intro หลัง `const hitStop = ref(false)`:

```js
const introPhase = ref(null)   // 'ready' | 'go' | null (null = เริ่มเล่น log แล้ว)
let introTimer = null
```

3. เพิ่ม computed summary (ใกล้ `const log = computed(...)`):

```js
const summary = computed(() => done.value
  ? computeBattleSummary(log.value, props.data?.playerTeam || [], props.data?.botTeam || [])
  : null)
function uname(uid) { return defForUid(uid)?.name || '?' }
```

4. เพิ่มฟังก์ชัน intro + เรียกใน `reset()` (แทนการเรียก `step()` ตรงๆ ท้าย reset):

```js
function runIntro() {
  introPhase.value = 'ready'
  introTimer = setTimeout(() => {
    introPhase.value = 'go'
    introTimer = setTimeout(() => { introPhase.value = null; step() }, 400)
  }, 700)
}
function skipIntro() {
  if (introPhase.value === null) return
  clearTimeout(introTimer)
  introPhase.value = null
  step()
}
```

ใน `reset()` เปลี่ยนบรรทัดสุดท้ายจาก `step()` เป็น `runIntro()`
และเพิ่ม `clearTimeout(introTimer); introPhase.value = null` ในต้น `reset()` (กันค้างตอน replay ใหม่)

5. ใน `onUnmounted` เพิ่ม `clearTimeout(introTimer)`

- [ ] **Step 2: intro overlay (template)**

เพิ่มใน `.br-box` (บนสุด หลัง `<div class="br-box" ...>`):

```html
      <div v-if="introPhase" class="br-intro" @click="skipIntro">
        <span class="br-intro-txt" :class="introPhase">{{ introPhase === 'ready' ? 'READY?' : 'GO!' }}</span>
      </div>
```

- [ ] **Step 3: หน้าสรุป (template) — แทนบล็อก `<template v-else>` ใน `.br-ctrl`**

แทนบล็อก done เดิม:
```html
        <template v-else>
          <div class="br-result" :class="{ win: data.won }">{{ data.won ? `ชนะ! ขึ้นชั้น ${data.cleared + 1}` : 'แพ้ ลองใหม่ได้เลย' }}</div>
          <button class="br-btn" @click="$emit('close')">ปิด</button>
        </template>
```
ด้วย:
```html
        <template v-else>
          <div class="br-sum">
            <div class="br-result" :class="{ win: data.won }">{{ data.won ? `ชนะ! ขึ้นชั้น ${data.cleared + 1}` : 'แพ้ ลองใหม่ได้เลย' }}</div>
            <div v-if="data.won" class="br-reward"><Emoji char="🎁" /> ได้รับ: ขึ้นชั้น {{ data.cleared + 1 }}</div>

            <div class="br-sum-team">
              <div class="br-sum-head"><i class="dot me"></i> ทีมคุณ</div>
              <div v-for="u in summary.teamA" :key="u.uid" class="br-sum-row" :class="{ mvp: summary.mvp.A === u.uid, win: data.won, dead: u.dead }">
                <span v-if="summary.mvp.A === u.uid" class="br-mvp">MVP</span>
                <span class="br-sum-face"><Emoji :char="defOf(idTeam('A', u)).emoji" /></span>
                <span class="br-sum-dmg"><Emoji char="⚔️" />{{ u.dmgDealt }}</span>
                <span class="br-sum-dmg taken"><Emoji char="🛡️" />{{ u.dmgTaken }}</span>
              </div>
            </div>

            <div class="br-sum-team">
              <div class="br-sum-head"><i class="dot foe"></i> ศัตรู</div>
              <div v-for="u in summary.teamB" :key="u.uid" class="br-sum-row" :class="{ mvp: summary.mvp.B === u.uid, win: !data.won, dead: u.dead }">
                <span v-if="summary.mvp.B === u.uid" class="br-mvp">MVP</span>
                <span class="br-sum-face"><Emoji :char="defOf(idTeam('B', u)).emoji" /></span>
                <span class="br-sum-dmg"><Emoji char="⚔️" />{{ u.dmgDealt }}</span>
                <span class="br-sum-dmg taken"><Emoji char="🛡️" />{{ u.dmgTaken }}</span>
              </div>
            </div>
          </div>
          <button class="br-btn" @click="$emit('close')">ปิด</button>
        </template>
```

เพิ่ม helper ใน script: `function idTeam(side, u) { return u.id }` (alias สั้น) — หรือใช้ `u.id` ตรงๆ ใน `defOf(u.id)`. ใช้ `defOf(u.id)` ก็ได้ → แก้ template เป็น `defOf(u.id).emoji` และไม่ต้องเพิ่ม `idTeam`. **เลือกใช้ `defOf(u.id).emoji` (มี `defOf` อยู่แล้ว)** แล้วลบ `idTeam` ออกจากตัวอย่างข้างบน

- [ ] **Step 4: style**

เพิ่มใน `<style scoped>`:

```css
.br-intro { position: absolute; inset: 0; z-index: 10; display: flex; align-items: center; justify-content: center; cursor: pointer; }
.br-intro-txt { font-weight: 900; color: #fff; text-shadow: 0 2px 12px rgba(0,0,0,.6); letter-spacing: .05em; }
.br-intro-txt.ready { font-size: 2.2rem; animation: br-ready .7s ease; }
.br-intro-txt.go { font-size: 3.4rem; color: #fde68a; animation: br-go .4s ease; }
@keyframes br-ready { from { opacity: 0; transform: scale(.7) } to { opacity: 1; transform: scale(1) } }
@keyframes br-go { from { opacity: 0; transform: scale(1.6) } to { opacity: 1; transform: scale(1) } }

.br-sum { width: 100%; max-width: 360px; display: flex; flex-direction: column; gap: 8px; margin-bottom: 8px; }
.br-reward { text-align: center; color: #fde68a; font-weight: 800; font-size: .8rem; }
.br-sum-team { background: rgba(255,255,255,.06); border-radius: 12px; padding: 8px; }
.br-sum-head { display: flex; align-items: center; gap: 6px; color: rgba(255,255,255,.8); font-weight: 800; font-size: .72rem; margin-bottom: 6px; }
.br-sum-head .dot { width: 8px; height: 8px; border-radius: 999px; }
.br-sum-row { position: relative; display: flex; align-items: center; gap: 8px; padding: 5px 8px; border-radius: 9px; border: 2px solid transparent; }
.br-sum-row.dead { opacity: .45; }
.br-sum-row.mvp.win { border-color: #fbbf24; background: rgba(251,191,36,.12); }
.br-sum-row.mvp:not(.win) { border-color: #c084fc; background: rgba(192,132,252,.12); }
.br-mvp { position: absolute; top: -8px; left: 8px; font-size: .54rem; font-weight: 900; color: #1e293b; background: #fbbf24; padding: 1px 5px; border-radius: 999px; }
.br-sum-row.mvp:not(.win) .br-mvp { background: #c084fc; color: #fff; }
.br-sum-face { font-size: 1.3rem; }
.br-sum-dmg { font-size: .68rem; font-weight: 800; color: #fde68a; display: inline-flex; align-items: center; gap: 2px; }
.br-sum-dmg.taken { color: #fca5a5; margin-left: auto; }
```

- [ ] **Step 5: verify ใน dev + commit**

Run: `npm run build` (ต้องผ่าน) แล้วแจ้งผู้ใช้ลอง dev: สู้ในหอคอย → เห็น READY?→GO! (แตะข้ามได้) → จบแล้วเห็นหน้าสรุป ดาเมจสองฝั่ง + MVP กรอบทอง(ทีมชนะ)/ม่วง(ทีมแพ้)

```bash
git add src/components/battle/BattleReplay.vue
git commit -m "Battle: หน้าสรุปผล (ดาเมจสองฝั่ง+MVP) + intro READY?→GO! (แตะข้ามได้)"
```

---

# PHASE 3 — ธาตุในหน้า pets + passive เร็วๆนี้ + ไกด์

อ้างอิง spec: `docs/superpowers/specs/2026-06-25-battle-ux-pets-guide-design.md` §3-5

## Task 6: รวมชื่อธาตุเป็นแหล่งเดียว (`EL_NAME`)

**Files:**
- Modify: `src/data/index.js:25` (ใกล้ `_EL_NAME`)
- Modify: `src/data/pets.js:4` (re-export)
- Modify: `src/components/battle/BattleReplay.vue:97` (ลบ local, import)
- Modify: `src/views/TowerView.vue:110` (ลบ local, import)

**Interfaces:**
- Produces: `EL_NAME = { fist:'ค้อน', scissors:'กรรไกร', paper:'กระดาษ' }` (ชื่อล้วน ไม่มี emoji)

- [ ] **Step 1: เพิ่ม export ใน index.js**

ใต้บรรทัด `export const _EL_NAME = ...` เพิ่ม:

```js
// ชื่อธาตุกลาง (ล้วน ไม่มี emoji) — ใช้ทุกที่ที่โชว์ชื่อธาตุ · emoji ดึงจาก ELEMENTS แยก
export const EL_NAME = { fist: 'ค้อน', scissors: 'กรรไกร', paper: 'กระดาษ' };
```

- [ ] **Step 2: re-export ใน pets.js**

ใน `src/data/pets.js` เพิ่ม `EL_NAME` ในรายการ export:
```js
    ELEMENTS, _EL_NAME, EL_NAME, elementBeats,
```

- [ ] **Step 3: ใช้ใน BattleReplay.vue**

แก้บรรทัด 97 ลบ `const EL_NAME = {...}` แล้วเพิ่ม `EL_NAME` ในบรรทัด import จาก `data/index.js`
(บรรทัด 87: `import { getPetDef, atkStyleOf, projectileOf, passiveOf, ELEMENTS, EL_NAME } from '../../data/index.js'`)
`EL_NAME[def.element]` ที่ใช้อยู่ (บรรทัด ~263) ทำงานเหมือนเดิม แต่ตอนนี้ได้ "ค้อน" แทน "หมัด"

- [ ] **Step 4: ใช้ใน TowerView.vue**

แก้บรรทัด 110 ลบ `const EL_NAME = {...}` แล้วเพิ่ม `EL_NAME` ใน import (บรรทัด 92):
`import { getPetDef, ELEMENTS, RARITY, EL_NAME } from '../data/index.js'`

- [ ] **Step 5: build + commit**

Run: `npm run build` (ต้องผ่าน)

```bash
git add src/data/index.js src/data/pets.js src/components/battle/BattleReplay.vue src/views/TowerView.vue
git commit -m "Pets: รวมชื่อธาตุเป็น EL_NAME แหล่งเดียว (ค้อน/กรรไกร/กระดาษ)"
```

## Task 7: badge ธาตุในหน้าสัตว์เลี้ยง

**Files:**
- Modify: `src/views/PetsView.vue` (grid cell + style)
- Modify: `src/components/pets/PetDetailModal.vue` (tag ธาตุ)

- [ ] **Step 1: PetsView — badge บนการ์ด**

ใน import เพิ่ม `ELEMENTS, EL_NAME` จาก `data/index.js` (มี `RARITY, PETS` อยู่แล้ว):
`import { RARITY, PETS, ELEMENTS } from '../data/index.js'`
และมี `defOf(id)` อยู่แล้ว (บรรทัด 78)

ใน grid cell (`<button class="pt-cell" ...>`) เพิ่มหลัง `<span ...pt-cell-copies>`:
```html
          <span class="pt-cell-el"><Emoji :char="ELEMENTS[defOf(p.id).element]?.emoji || '✊'" /></span>
```

เพิ่ม style:
```css
.pt-cell-el { position: absolute; top: 4px; left: 4px; font-size: .7rem; background: rgba(0,0,0,.06); border-radius: 7px; padding: 1px 3px; line-height: 1; }
```

- [ ] **Step 2: PetDetailModal — แถวธาตุใน tags**

ใน import เพิ่ม `ELEMENTS, EL_NAME`:
`import { RARITY, GRADE_LABELS, getPetDef, ELEMENTS, EL_NAME } from '../../data/index.js'`

เพิ่ม computed:
```js
const elDef = computed(() => getPetDef(pet.value?.id)?.element || pet.value?.element || 'scissors')
```

ใน `.pd-tags` เพิ่ม tag แรก:
```html
          <span class="pd-tag"><Emoji :char="ELEMENTS[elDef]?.emoji || '✊'" /> {{ EL_NAME[elDef] || elDef }}</span>
```

- [ ] **Step 3: build + commit**

Run: `npm run build`

```bash
git add src/views/PetsView.vue src/components/pets/PetDetailModal.vue
git commit -m "Pets: โชว์ธาตุในการ์ดสัตว์เลี้ยง + หน้ารายละเอียด"
```

## Task 8: passive "เร็วๆ นี้"

**Files:**
- Modify: `src/components/pets/PetDetailModal.vue` (section ใหม่)
- Modify: `src/components/battle/BattleReplay.vue:77` (inspect: `—` → เร็วๆ นี้)

- [ ] **Step 1: PetDetailModal — section ทักษะเฉพาะ**

หลัง `.pd-section` วิวัฒน์ (ก่อนปิด `</div>` ของ `.pd-box`) เพิ่ม:
```html
      <!-- ทักษะเฉพาะ — ยังไม่เปิด (ดู economy-battle-master-plan §5.5) -->
      <div class="pd-section">
        <div class="pd-sec-head"><Emoji char="✨" /> ทักษะเฉพาะ <span class="pd-soon">เร็วๆ นี้</span></div>
        <div class="pd-note">สัตว์เลี้ยงแต่ละตัวจะมีทักษะพิเศษในการต่อสู้ กำลังจะมาเร็วๆ นี้</div>
      </div>
```

เพิ่ม style:
```css
.pd-soon { font-size: .54rem; font-weight: 700; color: #b45309; background: rgba(251,191,36,.18); padding: 2px 7px; border-radius: 999px; margin-left: 6px; vertical-align: middle; }
```

- [ ] **Step 2: BattleReplay inspect — เปลี่ยนข้อความว่าง**

ที่บรรทัด ~77 แก้ช่อง passive ใน inspect card:
```html
        <div class="br-card-pass"><span>Passive</span><b>{{ insp.passive ? insp.passive.name : 'เร็วๆ นี้' }}</b></div>
```

- [ ] **Step 3: build + commit**

Run: `npm run build`

```bash
git add src/components/pets/PetDetailModal.vue src/components/battle/BattleReplay.vue
git commit -m "Pets: ช่องทักษะเฉพาะ (passive) แสดง 'เร็วๆ นี้'"
```

## Task 9: เติมไกด์ + HelpButton หอคอย

**Files:**
- Modify: `src/data/guide.js` (residence/farm/pets body + topic ใหม่ `tower`)
- Modify: `src/views/TowerView.vue` (HelpButton ที่หัวหน้า)

- [ ] **Step 1: เติมบรรทัดเรื่อง slot/plot ใน guide.js**

ใน `residence.body` เพิ่มบรรทัดท้าย array:
```js
      'พออัปเลเวลบ้าน จะปลดล็อกช่องทีมต่อสู้และแปลงปลูกในฟาร์มเพิ่มขึ้นด้วย',
```
ใน `pets.body` เพิ่มบรรทัดท้าย:
```js
      'จำนวนช่องทีมต่อสู้ (Active) เพิ่มตามเลเวลบ้าน — อัปบ้านเพื่อพาเพ็ทลงสนามได้มากขึ้น',
```

- [ ] **Step 2: เพิ่ม topic `tower` ใน GUIDE**

เพิ่มใน object `GUIDE` (ก่อน `potential`):
```js
  tower: {
    icon: '🏯', title: 'หอคอย · การต่อสู้',
    body: [
      'จัดทีมสัตว์เลี้ยง (Active) แล้วท้าสู้บอทไต่ทีละชั้น ยิ่งขึ้นสูงยิ่งได้โบนัสรายได้ต่อวันเพิ่ม',
      'ระบบธาตุแบบเป่ายิงฉุบ: ✊ ค้อน ชนะ ✌️ กรรไกร · ✌️ กรรไกร ชนะ ✋ กระดาษ · ✋ กระดาษ ชนะ ✊ ค้อน — ตีถูกธาตุดาเมจเพิ่ม เสียธาตุดาเมจลด',
      'ลำดับการตี: สลับกันตีทีต่อที เลือกตัวจากซ้ายไปขวาวนไปเรื่อยๆ ฝั่งที่มีตัวเยอะกว่าได้ตีก่อน เป้าที่โดนตีเป็นการสุ่ม',
      'จัดเรียงตำแหน่งในทีมมีผล — ตัวซ้ายสุดได้ออกตีก่อน วางตัวที่อยากให้ออกโรงก่อนไว้ซ้าย',
    ],
  },
```

- [ ] **Step 3: HelpButton ใน TowerView**

ใน import เพิ่ม `import HelpButton from '../components/help/HelpButton.vue'`
ในหัว `.tw-head` เพิ่มก่อน/หลัง RouterLink:
```html
      <RouterLink to="/play" class="tw-back">‹ กลับ</RouterLink>
      <HelpButton topic="tower" />
```
(จัด layout ให้พอดี — `.tw-head` เป็น space-between อยู่แล้ว, ใส่ HelpButton ใน RouterLink group หรือปรับ flex ตามเหมาะ)

- [ ] **Step 4: build + commit**

Run: `npm run build`

```bash
git add src/data/guide.js src/views/TowerView.vue
git commit -m "Guide: เพิ่มหัวข้อหอคอย/การต่อสู้ (ธาตุ+ลำดับตี) + บอก slot/plot เพิ่มตามบ้าน"
```

## Task 10: verify เฟส 3 (build + dev + deploy)

- [ ] **Step 1: เทสรวม + build**

Run: `node --test src/utils/*.test.js src/data/*.test.js` แล้ว `npm run build`
Expected: ผ่านหมด

- [ ] **Step 2: ลอง dev (ผู้ใช้)** — หน้า pets เห็น badge ธาตุ, detail เห็นธาตุ+ทักษะเร็วๆนี้, หอคอยมีปุ่ม ? เปิดไกด์ได้

- [ ] **Step 3: deploy (ถ้าผู้ใช้อนุมัติ)**: `git push origin master`

---

## Self-Review (ผู้เขียน plan ตรวจแล้ว)

- **Spec coverage:** alternating engine (T1-2), summary+MVP (T4-5), READY/GO (T5), ธาตุใน pets (T7), passive soon (T8), guide+slot/plot (T9), รวมชื่อธาตุ (T6) — ครบทุกข้อใน spec ทั้งสองไฟล์
- **Placeholder scan:** ไม่มี TODO/TBD · ทุก step มีโค้ดจริง
- **Type consistency:** `computeBattleSummary` คืน `{teamA,teamB,mvp:{A,B}}` ตรงกันระหว่าง Task 4 (นิยาม) และ Task 5 (ใช้) · `EL_NAME` ชื่อเดียวกันทุก task
- **หมายเหตุ:** Task 5 template ใช้ `defOf(u.id).emoji` (ลบ `idTeam` ที่เกริ่นไว้) — ผู้ทำตามต้องใช้ `defOf(u.id)` ที่มีอยู่แล้วใน BattleReplay
