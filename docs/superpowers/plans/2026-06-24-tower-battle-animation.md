# Tower Battle Animation v2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** ทำให้ replay หอคอย "มันส์/อ่านออก" (melee/ranged, ป้ายธาตุ, crit, ตาย, pause, inspect) + ปูโครง event-driven ให้ passive เสียบทีหลัง + เก็บสถิติราย species ไว้จูน — โดยไม่แตะสมดุล engine

**Architecture:** engine เพิ่มแค่ field ข้อมูลลง log (`eff`, round marker) ไม่แตะ logic · replay rewrite เป็น event-dispatch (handler ต่อ `event.t`) · pet data เพิ่ม `atkStyle/projectile/passive` · `battleStats/{petId}` increment-only mirror `questionStats` · ตาราง win% ใน Admin

**Tech Stack:** Vue 3 (script setup, scoped CSS), Pinia, Firebase Firestore, `node --test` (pure utils)

## Global Constraints

- **ห้ามแตะสมดุล:** `battleEngine.js` แก้ได้แค่ "เพิ่ม field ลง log" — ห้ามเปลี่ยนสูตรดาเมจ/ลำดับ/เป้าหมาย/crit/variance/maxRounds/ขนาดทีม
- `battleEngine.test.js` test `deepEqual(r1,r2)` ต้องผ่านเสมอ (determinism)
- เขียน user-facing ทุกช่องผ่าน `cleanText` — (แผนนี้ไม่มี free text input ใหม่)
- คอมเมนต์/commit เป็นไทยปนอังกฤษ · commit รูปแบบ `Area: อะไร (ทำไม)`
- Firestore: เขียน user doc ผ่าน `auth.patchUser` เท่านั้น (แผนนี้เขียน battleStats เป็น collection ใหม่ ไม่ใช่ user doc → ใช้ writeBatch ตรง)
- ⚠️ แก้ `firestore.rules` แล้ว **ต้อง** `firebase deploy --only firestore:rules` (ไม่งั้นไม่มีผล)
- pure util ต้องไม่ import store/Firestore/Vue (เทสด้วย `node --test` ได้)
- รัน build ตรวจ: `npm run build` · element ids = `fist|scissors|paper`

---

### Task 1: Engine log enrichment (`eff` + round marker)

**Files:**
- Modify: `src/utils/battleEngine.js`
- Test: `src/utils/battleEngine.test.js`

**Interfaces:**
- Consumes: `elementMult(att.element, tg.element)` จาก `data/battle.js` (มีอยู่)
- Produces: attack log event เพิ่ม `eff: 'super'|'weak'|'neutral'` · log มี `{ t:'round', n }` ต้นทุกรอบ

- [ ] **Step 1: เพิ่ม test ผลธาตุใน log** — เติมใน `src/utils/battleEngine.test.js`

```js
test('attack event มี eff ตรงกับ matchup ธาตุ', () => {
  // fist ชนะ scissors → ผู้ตีฝั่ง A (fist) ควรมี eff:'super' บ้าง, ฝั่ง B (scissors→fist) eff:'weak'
  const r = simulateBattle(mono('rare', 'fist', 3), mono('rare', 'scissors', 3), 7)
  const atkA = r.log.filter(e => e.t === 'attack' && e.side === 'A')
  const atkB = r.log.filter(e => e.t === 'attack' && e.side === 'B')
  assert.ok(atkA.length && atkA.every(e => e.eff === 'super'), 'A (fist) ตี scissors = super ทุกครั้ง')
  assert.ok(atkB.length && atkB.every(e => e.eff === 'weak'), 'B (scissors) ตี fist = weak ทุกครั้ง')
  assert.ok(['super','weak','neutral'].includes(atkA[0].eff))
})

test('log มี round marker ต้นแต่ละรอบ ตามจำนวน rounds', () => {
  const r = simulateBattle(mono('rare', 'fist', 3), mono('rare', 'scissors', 3), 7)
  const rounds = r.log.filter(e => e.t === 'round')
  assert.equal(rounds.length, r.rounds)
  assert.equal(rounds[0].n, 1)
})
```

- [ ] **Step 2: รัน test ดูให้ fail**

Run: `node --test src/utils/battleEngine.test.js`
Expected: FAIL — 2 test ใหม่ fail (`eff` undefined, ไม่มี round event)

- [ ] **Step 3: แก้ engine — เพิ่ม eff ใน hit() + round marker**

ใน `src/utils/battleEngine.js` แก้ฟังก์ชัน `hit` ให้บันทึก `eff` (อนุมานจากธาตุล้วน ก่อนคูณ crit/variance) — หาบรรทัด `let m = elementMult(att.element, tg.element)` แล้วเพิ่ม `const eff` ใต้มันทันที และเพิ่ม `eff` ลง `log.push`:

```js
  const hit = (att, foes) => {
    const tg = pick(foes)
    if (!tg) return
    let m = elementMult(att.element, tg.element)
    const eff = m > 1 ? 'super' : (m < 1 ? 'weak' : 'neutral')   // ธาตุล้วน ก่อนคูณ crit/variance
    const crit = rand() < BATTLE_CFG.critRate
    if (crit) m *= BATTLE_CFG.critMult
    m *= 1 + (rand() * 2 - 1) * BATTLE_CFG.variance
    const dmg = Math.max(0, att.atk * m)
    tg.hp -= dmg
    log.push({
      t: 'attack', side: att.side, attacker: att.uid, target: tg.uid,
      dmg: Math.round(dmg), crit, eff, targetHpAfter: Math.max(0, Math.round(tg.hp)), dead: tg.hp <= 0,
    })
  }
```

หา loop `while (round < BATTLE_CFG.maxRounds ...)` แล้วเพิ่ม `log.push({ t:'round', n: round })` หลัง `round++`:

```js
  while (round < BATTLE_CFG.maxRounds && alive(A).length && alive(B).length) {
    round++
    log.push({ t: 'round', n: round })
    const act = []
    ...
```

- [ ] **Step 4: รัน test ทั้งไฟล์ ต้องผ่านหมด (รวม deepEqual เดิม)**

Run: `node --test src/utils/battleEngine.test.js`
Expected: PASS ทุก test (determinism deepEqual ยังผ่านเพราะ field ใหม่เท่ากันทั้ง 2 รัน)

- [ ] **Step 5: Commit**

```bash
git add src/utils/battleEngine.js src/utils/battleEngine.test.js
git commit -m "Battle: ใส่ผลธาตุ(eff)+round marker ลง log (ให้ replay โชว์ได้ ไม่แตะ logic)"
```

---

### Task 2: Pet data — atkStyle / projectile / passive

**Files:**
- Modify: `src/data/index.js` (PETS array + helper)
- Test: `src/data/petAtkStyle.test.js` (create)

**Interfaces:**
- Produces: `atkStyleOf(def) → 'melee'|'ranged'` · `projectileOf(def) → string` · pet def รองรับ `passive` (default undefined → ผู้บริโภคอ่านเป็น null)

- [ ] **Step 1: เพิ่ม field ranged ให้ pet ที่เป็นสายยิง/เวท/พ่น** — ใน `src/data/index.js` เติม `atkStyle:"ranged", projectile:"…"` ต่อท้าย object ของ 8 ตัวนี้ (ที่เหลือ = melee โดย default ในโค้ด ไม่ต้องแก้):

| id | projectile |
|---|---|
| bahamut | `"🔥"` |
| phoenix | `"🔥"` |
| dragon | `"🔥"` |
| fairy | `"✨"` |
| genie | `"✨"` |
| unicorn | `"💫"` |
| owl | `"🪶"` |
| whale | `"💧"` |

ตัวอย่าง (เติมในบรรทัดของ dragon):
```js
  { id:"dragon",    emoji:"🐲", name:"มังกร",     rarity:"epic", element:"fist", flavor:"พ่นไฟ purify impurity แต่เผา reactor ไปด้วย", hatchMins:1, atkStyle:"ranged", projectile:"🔥" },
```

- [ ] **Step 2: เพิ่ม helper ใต้ `export const PETS`** — ปลายบล็อก PETS (หลัง array ปิด `];`) เพิ่ม:

```js
// รูปแบบการตีใน replay (data ล้วน ปรับได้) — default melee
export function atkStyleOf(def){ return def?.atkStyle === 'ranged' ? 'ranged' : 'melee' }
export function projectileOf(def){ return def?.projectile || '✦' }
// passive signature (ปูทาง — รอบนี้ทุกตัวยังไม่มี → null) ดู docs/economy-battle-master-plan.md §5.5
export function passiveOf(def){ return def?.passive || null }
```

- [ ] **Step 3: เขียน test sanity** — `src/data/petAtkStyle.test.js`:

```js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { PETS, atkStyleOf, projectileOf, passiveOf } from './index.js'

test('ranged pet ทุกตัวมี projectile emoji', () => {
  const ranged = PETS.filter(p => atkStyleOf(p) === 'ranged')
  assert.ok(ranged.length >= 8, `ranged count ${ranged.length}`)
  ranged.forEach(p => assert.ok(p.projectile && projectileOf(p) === p.projectile, `${p.id} projectile`))
})
test('melee เป็น default + passive default null', () => {
  const wolf = PETS.find(p => p.id === 'wolf')
  assert.equal(atkStyleOf(wolf), 'melee')
  assert.equal(passiveOf(wolf), null)
})
```

- [ ] **Step 4: รัน test**

Run: `node --test src/data/petAtkStyle.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/data/index.js src/data/petAtkStyle.test.js
git commit -m "Pets: เพิ่ม atkStyle/projectile (melee/ranged) + passive shape(ปูทาง) ใน pet data"
```

---

### Task 3: Pure util `computeBattleStats`

**Files:**
- Create: `src/utils/battleStats.js`
- Test: `src/utils/battleStats.test.js`

**Interfaces:**
- Consumes: battle log (array ของ event จาก Task 1) · `playerTeam` = array `{id,...}` (index ตรงกับ uid `A{i}`)
- Produces: `computeBattleStats(log, playerTeam, won) → { [petId]: { battles, wins, kills, deaths, dmgDealt, dmgTaken } }`

- [ ] **Step 1: เขียน test** — `src/utils/battleStats.test.js`:

```js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { computeBattleStats } from './battleStats.js'

const team = [{ id: 'wolf' }, { id: 'fox' }]
const log = [
  { t: 'round', n: 1 },
  { t: 'attack', side: 'A', attacker: 'A0', target: 'B0', dmg: 10, dead: false },
  { t: 'attack', side: 'B', attacker: 'B0', target: 'A1', dmg: 7,  dead: false },
  { t: 'attack', side: 'A', attacker: 'A1', target: 'B0', dmg: 12, dead: true },
  { t: 'attack', side: 'B', attacker: 'B1', target: 'A1', dmg: 99, dead: true },
  { t: 'end', winner: 'A' },
]

test('รวม dmgDealt/dmgTaken/kills/deaths/battles/wins ต่อ petId ฝั่งผู้เล่น', () => {
  const s = computeBattleStats(log, team, true)
  assert.deepEqual(s.wolf, { battles: 1, wins: 1, kills: 0, deaths: 0, dmgDealt: 10, dmgTaken: 0 })
  assert.deepEqual(s.fox,  { battles: 1, wins: 1, kills: 1, deaths: 1, dmgDealt: 12, dmgTaken: 106 })
})

test('won=false → wins 0', () => {
  const s = computeBattleStats(log, team, false)
  assert.equal(s.wolf.wins, 0)
})

test('ทีมซ้ำ species → รวมยอด (กัน index ชนกัน)', () => {
  const s = computeBattleStats(
    [{ t:'attack', side:'A', attacker:'A0', target:'B0', dmg:5, dead:false },
     { t:'attack', side:'A', attacker:'A1', target:'B0', dmg:5, dead:false }],
    [{ id:'cat' }, { id:'cat' }], true)
  assert.equal(s.cat.dmgDealt, 10)
  assert.equal(s.cat.battles, 2) // ลงสนาม 2 ช่อง
})
```

- [ ] **Step 2: รัน test ดู fail**

Run: `node --test src/utils/battleStats.test.js`
Expected: FAIL — `computeBattleStats is not a function`

- [ ] **Step 3: เขียน util** — `src/utils/battleStats.js`:

```js
// สรุปสถิติการสู้ต่อ species จาก battle log — pure (เทส node --test)
// อ่านเฉพาะฝั่งผู้เล่น (uid 'A{i}', map ไป playerTeam[i].id) → increment delta ไปเขียน Firestore
const EMPTY = () => ({ battles: 0, wins: 0, kills: 0, deaths: 0, dmgDealt: 0, dmgTaken: 0 })

export function computeBattleStats(log, playerTeam, won) {
  const out = {}
  const idOf = (uid) => {                 // 'A2' → playerTeam[2].id
    if (!uid || uid[0] !== 'A') return null
    const i = parseInt(uid.slice(1), 10)
    return playerTeam?.[i]?.id || null
  }
  const bump = (id, patch) => {
    if (!id) return
    const cur = out[id] || (out[id] = EMPTY())
    for (const k in patch) cur[k] += patch[k]
  }
  // battles/wins: ทุกช่องที่ลงสนาม (นับตาม index ทีม)
  ;(playerTeam || []).forEach((p) => bump(p?.id, { battles: 1, wins: won ? 1 : 0 }))
  for (const e of log || []) {
    if (e.t !== 'attack') continue
    if (e.side === 'A') {                  // ผู้เล่นเป็นผู้ตี
      bump(idOf(e.attacker), { dmgDealt: e.dmg || 0, kills: e.dead ? 1 : 0 })
    }
    const tId = idOf(e.target)             // ผู้เล่นเป็นเป้า (ไม่ว่าใครตี)
    if (tId) bump(tId, { dmgTaken: e.dmg || 0, deaths: e.dead ? 1 : 0 })
  }
  return out
}
```

- [ ] **Step 4: รัน test ผ่าน**

Run: `node --test src/utils/battleStats.test.js`
Expected: PASS ทั้ง 3

- [ ] **Step 5: Commit**

```bash
git add src/utils/battleStats.js src/utils/battleStats.test.js
git commit -m "Battle: util computeBattleStats สรุปสถิติราย species จาก log (pure+test)"
```

---

### Task 4: เขียน battleStats หลังจบไฟต์ (useTower)

**Files:**
- Modify: `src/composables/useTower.js`

**Interfaces:**
- Consumes: `computeBattleStats` (Task 3) · `result.log`, `team.value`, `won` (มีใน fight อยู่แล้ว)
- Produces: เขียน `battleStats/{petId}` ด้วย increment (≤4 docs, batch 1 รอบ) · `usage.track(0, n)`

- [ ] **Step 1: เพิ่ม import** — บนสุดของ `src/composables/useTower.js` เพิ่ม:

```js
import { doc, setDoc, increment, writeBatch } from 'firebase/firestore'
import { db } from '../firebase/config.js'
import { computeBattleStats } from '../utils/battleStats.js'
import { useUsageStore } from '../stores/usage.js'
```

- [ ] **Step 2: เพิ่มฟังก์ชันเขียนสถิติ + เรียกใน fight()** — ใน `useTower()` ก่อน `return`:

```js
  // best-effort: เขียนสถิติราย species (increment-only) — fail เงียบ ไม่ขวางการเล่น
  async function recordStats(result, playerTeam, won) {
    try {
      const stats = computeBattleStats(result.log, playerTeam, won)
      const ids = Object.keys(stats)
      if (!ids.length) return
      const batch = writeBatch(db)
      for (const id of ids) {
        const s = stats[id]
        batch.set(doc(db, 'battleStats', id), {
          battles: increment(s.battles), wins: increment(s.wins),
          kills: increment(s.kills), deaths: increment(s.deaths),
          dmgDealt: increment(s.dmgDealt), dmgTaken: increment(s.dmgTaken),
        }, { merge: true })
      }
      await batch.commit()
      useUsageStore().track(0, ids.length)
    } catch (e) { console.error('[battleStats]', e) }
  }
```

แก้ `fight()` — หลังบรรทัด `const won = result.winner === 'A'` เพิ่มเรียก (ไม่ await ก็ได้ แต่ await กัน race ตอนปิดแอป):

```js
    const won = result.winner === 'A'
    await recordStats(result, team.value, won)
    if (won) {
      ...
```

- [ ] **Step 3: Build ตรวจ compile**

Run: `npm run build`
Expected: built สำเร็จ ไม่มี error

- [ ] **Step 4: Manual (dev) — ยืนยันเขียนจริง**

Run: `npm run dev` → สู้ 1 ไฟต์ในหอคอย → เปิด Firebase Console > Firestore > collection `battleStats` ควรเห็น doc ตาม species ทีมเรา มีเลข battles/dmgDealt ขึ้น
(หมายเหตุ: rules ยังไม่ deploy = เขียนจะ permission-denied; ทำ Task 5 ก่อนถึงจะผ่าน — หรือทดสอบหลัง Task 5)

- [ ] **Step 5: Commit**

```bash
git add src/composables/useTower.js
git commit -m "Tower: เขียนสถิติราย species ลง battleStats หลังจบไฟต์ (best-effort, batch)"
```

---

### Task 5: Firestore rules — battleStats (⚠️ deploy)

**Files:**
- Modify: `firestore.rules`

**Interfaces:**
- Produces: match `battleStats/{petId}` — read: academic+instructor · write: increment-only (mirror `questionStats`)

- [ ] **Step 1: เพิ่ม match block** — ใน `firestore.rules` หลัง block `match /questionStats/{qid} { ... }` (ปิด `}` ของมัน) เพิ่ม:

```
    // ── Battle stats (Tower) — ตัวนับสถิติการสู้ราย species (increment-only) ──
    //  read:  ผู้แก้คลัง (academic+instructor) เพื่อจูนตัวเลขจากการเล่นจริง
    //  write: ผู้ล็อกอิน แตะได้แค่ field ชุดนี้ และต้องไม่ลดลง (increment เท่านั้น)
    match /battleStats/{petId} {
      function statFields() { return ['battles','wins','kills','deaths','dmgDealt','dmgTaken']; }
      allow read:   if canEditQuestions();
      allow create: if request.auth != null
        && request.resource.data.keys().hasOnly(statFields())
        && request.resource.data.battles  is int && request.resource.data.battles  >= 0
        && request.resource.data.wins     is int && request.resource.data.wins     >= 0
        && request.resource.data.kills    is int && request.resource.data.kills    >= 0
        && request.resource.data.deaths   is int && request.resource.data.deaths   >= 0
        && request.resource.data.dmgDealt is int && request.resource.data.dmgDealt >= 0
        && request.resource.data.dmgTaken is int && request.resource.data.dmgTaken >= 0;
      allow update: if request.auth != null
        && request.resource.data.diff(resource.data).affectedKeys().hasOnly(statFields())
        && request.resource.data.battles  >= resource.data.get('battles', 0)
        && request.resource.data.wins     >= resource.data.get('wins', 0)
        && request.resource.data.kills    >= resource.data.get('kills', 0)
        && request.resource.data.deaths   >= resource.data.get('deaths', 0)
        && request.resource.data.dmgDealt >= resource.data.get('dmgDealt', 0)
        && request.resource.data.dmgTaken >= resource.data.get('dmgTaken', 0);
      allow delete: if isAdmin();
    }
```

- [ ] **Step 2: Deploy rules** ⚠️ (จำเป็น ไม่งั้น Task 4 เขียนไม่ผ่าน)

Run: `firebase deploy --only firestore:rules`
Expected: `✔ Deploy complete!`

- [ ] **Step 3: Manual — ยืนยัน Task 4 เขียนผ่านแล้ว**

`npm run dev` → สู้ 1 ไฟต์ → Firestore `battleStats` มี doc ขึ้นเลข (ไม่ permission-denied ใน console)

- [ ] **Step 4: Commit**

```bash
git add firestore.rules
git commit -m "Rules: battleStats increment-only (mirror questionStats) สำหรับสถิติหอคอย"
```

---

### Task 6: BattleReplay v2 — event-driven core + controls (pause/×4/skip/round)

**Files:**
- Modify (rewrite): `src/components/battle/BattleReplay.vue`

**Interfaces:**
- Consumes: `props.data = { result:{log}, botTeam, playerTeam, won, cleared }` (เดิม) · log มี `round`/`attack`/`end` (Task 1) · `buildCombatant` (data/battle.js)
- Produces: replay ที่ dispatch ตาม `event.t` (handler map) — type แปลก = ข้าม · controls: pause/▶, speed ×1/×2/×4, ข้ามไปผล · ป้ายรอบ

- [ ] **Step 1: Rewrite component (core)** — แทนทั้งไฟล์ `src/components/battle/BattleReplay.vue` ด้วยโครง event-driven + controls (visuals คงระดับเดิมก่อน — juice ใน Task 7):

```vue
<!-- BattleReplay v2 — event-driven (dispatch ตาม event.t) · controls: pause/speed/skip · ป้ายรอบ
     โครงนี้รองรับ event ใหม่ (passive/heal/…) แค่เพิ่ม handler — ดู docs/.../economy-battle-master-plan §5.5 -->
<template>
  <div v-if="data" class="br-ov">
    <div class="br-box">
      <div class="br-round" v-if="!done">รอบ {{ round }}</div>

      <div class="br-team">
        <div v-for="(p, i) in data.botTeam" :key="'B'+i" :ref="el => setEl('B'+i, el)"
             class="br-unit" :class="unitClass('B'+i)" @click="inspect('B'+i)">
          <Emoji :char="defOf(p.id).emoji" />
          <div class="br-hp"><div class="br-hp-fill" :style="{ width: hpPct('B'+i) + '%' }"></div></div>
          <span v-for="pop in popsFor('B'+i)" :key="pop.k" class="br-pop" :class="popClass(pop)">-{{ pop.dmg }}</span>
        </div>
      </div>

      <div class="br-vs">⚔️ ชั้น {{ data.cleared }}</div>

      <div class="br-team">
        <div v-for="(p, i) in data.playerTeam" :key="'A'+i" :ref="el => setEl('A'+i, el)"
             class="br-unit me" :class="unitClass('A'+i)" @click="inspect('A'+i)">
          <Emoji :char="defOf(p.id).emoji" />
          <div class="br-hp"><div class="br-hp-fill mine" :style="{ width: hpPct('A'+i) + '%' }"></div></div>
          <span v-for="pop in popsFor('A'+i)" :key="pop.k" class="br-pop" :class="popClass(pop)">-{{ pop.dmg }}</span>
        </div>
      </div>

      <div class="br-ctrl">
        <template v-if="!done">
          <button class="br-btn sm" @click="togglePause">{{ paused ? '▶' : '⏸' }}</button>
          <button class="br-btn sm" @click="cycleSpeed">×{{ speed }}</button>
          <button class="br-btn sm" @click="skipToEnd">ข้ามไปผล</button>
        </template>
        <template v-else>
          <div class="br-result" :class="{ win: data.won }">{{ data.won ? `ชนะ! ขึ้นชั้น ${data.cleared + 1}` : 'แพ้ ลองใหม่ได้เลย' }}</div>
          <button class="br-btn" @click="$emit('close')">ปิด</button>
        </template>
      </div>
    </div>

    <!-- inspect popover (Task 7 เติมเนื้อใน) -->
    <div v-if="inspectUid" class="br-inspect" @click.self="inspectUid = null"></div>
  </div>
</template>

<script setup>
import Emoji from '../shared/Emoji.vue'
import { ref, computed, watch, onUnmounted } from 'vue'
import { getPetDef } from '../../data/index.js'
import { buildCombatant } from '../../data/battle.js'

const props = defineProps({ data: { type: Object, default: null } })
defineEmits(['close'])

const REPLAY_CFG = { baseDelay: 180, speeds: [1, 2, 4] }  // จูนง่าย

const defOf = (id) => getPetDef(id) || { emoji: '❓' }

const idx = ref(0)
const round = ref(1)
const paused = ref(false)
const speed = ref(1)
const hp = ref({})
const pops = ref({})
const flashing = ref(null)
const acting = ref(null)
const inspectUid = ref(null)
let timer = null, popKey = 0
let maxHp = {}
const els = {}                 // uid → DOM el (สำหรับวัดตำแหน่ง Task 7)
function setEl(uid, el) { if (el) els[uid] = el }

const log = computed(() => props.data?.result?.log || [])
const done = computed(() => idx.value >= log.value.length)
const delay = computed(() => REPLAY_CFG.baseDelay / speed.value)

function buildMax(d) {
  maxHp = {}
  ;(d?.botTeam || []).forEach((p, i) => { maxHp['B' + i] = buildCombatant(p).maxHp || 1 })
  ;(d?.playerTeam || []).forEach((p, i) => { maxHp['A' + i] = buildCombatant(p).maxHp || 1 })
}
function reset() {
  clearTimeout(timer)
  idx.value = 0; round.value = 1; pops.value = {}; flashing.value = null; acting.value = null
  paused.value = false; inspectUid.value = null
  const h = {}; Object.keys(maxHp).forEach(uid => { h[uid] = 100 }); hp.value = h
  step()
}

// ── event dispatch — เพิ่ม handler ใหม่ที่นี่ (passive/heal/…) ──
const handlers = {
  round(e) { round.value = e.n },               // ไม่หน่วง — ป้ายรอบอัปเดต
  attack(e) { applyAttack(e) },
  end() { acting.value = null; flashing.value = null },
}
function applyAttack(e) {
  acting.value = e.attacker
  flashing.value = e.target
  hp.value = { ...hp.value, [e.target]: Math.max(0, Math.round((e.targetHpAfter / (maxHp[e.target] || 1)) * 100)) }
  const k = popKey++
  pops.value = { ...pops.value, [e.target]: [...(pops.value[e.target] || []), { k, dmg: e.dmg, crit: e.crit, eff: e.eff }] }
  setTimeout(() => { pops.value = { ...pops.value, [e.target]: (pops.value[e.target] || []).filter(p => p.k !== k) } }, 600)
}

function step() {
  clearTimeout(timer)
  if (paused.value) return
  if (idx.value >= log.value.length) { acting.value = null; flashing.value = null; return }
  const e = log.value[idx.value]
  const h = handlers[e.t]
  if (h) h(e)                                   // type ที่ไม่รู้จัก = ข้ามเงียบ
  idx.value++
  const noDelay = e.t === 'round'               // round marker ไม่หน่วงเวลา
  if (idx.value < log.value.length) timer = setTimeout(step, noDelay ? 0 : delay.value)
  else { acting.value = null; flashing.value = null }
}

function togglePause() {
  paused.value = !paused.value
  if (!paused.value) { clearTimeout(timer); step() }   // เคลียร์ timer ค้างก่อนเล่นต่อ (กันรันซ้อน)
}
function cycleSpeed() {
  const s = REPLAY_CFG.speeds
  speed.value = s[(s.indexOf(speed.value) + 1) % s.length]
}
function skipToEnd() {
  clearTimeout(timer)
  const end = log.value[log.value.length - 1]
  // apply ผลสุดท้าย: ตัวที่ targetHpAfter ล่าสุด/ตาย
  const finalHp = {}; Object.keys(maxHp).forEach(uid => finalHp[uid] = 100)
  for (const ev of log.value) if (ev.t === 'attack') finalHp[ev.target] = Math.max(0, Math.round((ev.targetHpAfter / (maxHp[ev.target] || 1)) * 100))
  hp.value = finalHp; pops.value = {}; acting.value = null; flashing.value = null
  round.value = end?.rounds || round.value
  idx.value = log.value.length
}
function inspect(uid) { paused.value = true; clearTimeout(timer); inspectUid.value = uid }

function hpPct(uid) { return hp.value[uid] ?? 100 }
function popsFor(uid) { return pops.value[uid] || [] }
function popClass(pop) { return { crit: pop.crit, super: pop.eff === 'super', weak: pop.eff === 'weak' } }
function unitClass(uid) {
  return { acting: acting.value === uid, flash: flashing.value === uid, dead: (hp.value[uid] ?? 100) <= 0 }
}

watch(() => props.data, (d) => { if (d) { buildMax(d); reset() } }, { immediate: true })
onUnmounted(() => clearTimeout(timer))
</script>

<style scoped>
.br-ov { position: fixed; inset: 0; z-index: 420; background: rgba(15,23,42,.82); display: flex; align-items: center; justify-content: center; padding: 16px; }
.br-box { width: 100%; max-width: 440px; display: flex; flex-direction: column; gap: 14px; position: relative; }
.br-round { text-align: center; color: rgba(255,255,255,.7); font-weight: 800; font-size: .72rem; letter-spacing: .05em; }
.br-team { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
.br-unit { position: relative; aspect-ratio: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 2rem; background: rgba(255,255,255,.08); border-radius: 14px; transition: transform .1s; cursor: pointer; }
.br-unit.acting { transform: scale(1.18); z-index: 2; }
.br-unit.flash { animation: br-shake .18s; }
.br-unit.dead { opacity: .25; filter: grayscale(1); }
@keyframes br-shake { 0%,100% { transform: translateX(0) } 25% { transform: translateX(-4px) } 75% { transform: translateX(4px) } }
.br-hp { width: 80%; height: 5px; background: rgba(255,255,255,.2); border-radius: 999px; margin-top: 4px; overflow: hidden; }
.br-hp-fill { height: 100%; background: #ef4444; transition: width .15s; }
.br-hp-fill.mine { background: #34d399; }
.br-pop { position: absolute; top: -2px; font-weight: 800; font-size: .8rem; color: #fca5a5; animation: br-rise .6s ease-out forwards; pointer-events: none; }
.br-pop.crit { color: #fbbf24; font-size: 1.05rem; }
.br-pop.super { color: #f87171; }
.br-pop.weak { color: #cbd5e1; font-size: .7rem; }
@keyframes br-rise { from { transform: translateY(0); opacity: 1 } to { transform: translateY(-22px); opacity: 0 } }
.br-vs { text-align: center; color: #fff; font-weight: 800; font-size: .9rem; letter-spacing: .04em; }
.br-ctrl { display: flex; flex-direction: row; align-items: center; justify-content: center; gap: 10px; margin-top: 4px; flex-wrap: wrap; }
.br-btn { border: 2px solid #fff; background: rgba(255,255,255,.12); color: #fff; border-radius: 12px; padding: 10px 24px; font-family: inherit; font-weight: 800; cursor: pointer; }
.br-btn.sm { padding: 8px 14px; font-size: .82rem; }
.br-result { font-size: 1.15rem; font-weight: 800; color: #fff; }
.br-result.win { color: #34d399; }
.br-inspect { position: absolute; inset: 0; }
</style>
```

- [ ] **Step 2: Build**

Run: `npm run build`
Expected: built สำเร็จ

- [ ] **Step 3: Manual (dev)** — `npm run dev` → สู้ → ยืนยัน: ป้าย "รอบ N" เดิน, ปุ่ม ⏸ หยุดได้/▶ เล่นต่อ, ×1→×2→×4 เปลี่ยนความเร็ว, "ข้ามไปผล" กระโดดไปจอผล, หลอดเลือด/เลขเด้งยังทำงาน

- [ ] **Step 4: Commit**

```bash
git add src/components/battle/BattleReplay.vue
git commit -m "BattleReplay: rewrite เป็น event-driven + ปุ่ม pause/×4/ข้ามไปผล/ป้ายรอบ (ปูทาง passive)"
```

---

### Task 7: BattleReplay v2 — visual juice + inspect popover

**Files:**
- Modify: `src/components/battle/BattleReplay.vue` (ต่อยอด Task 6)

**Interfaces:**
- Consumes: `els` map (วัดตำแหน่ง), `atkStyleOf/projectileOf/passiveOf` (Task 2), `buildCombatant`, log fields `eff/crit/dead`
- Produces: melee lunge / ranged projectile, ป้าย "แพ้ทาง!/ต้านทาน", crit hit-stop, death puff, ghost HP, การ์ด inspect

- [ ] **Step 1: เพิ่ม import + state** — ใน `<script setup>` แก้ import data/index และเพิ่ม state:

```js
import { getPetDef, atkStyleOf, projectileOf, passiveOf } from '../../data/index.js'
```
เพิ่มใต้ `const inspectUid = ref(null)`:
```js
const projectiles = ref([])      // [{k, emoji, x0,y0,x1,y1}]
const callouts = ref({})         // uid → {k, text, kind}
const hitStop = ref(false)
let projKey = 0, calloutKey = 0
```

- [ ] **Step 2: ฟังก์ชันวัดตำแหน่ง + motion** — เพิ่มใต้ `setEl`:

```js
function centerOf(uid) {
  const box = els[uid]?.closest('.br-box'); const el = els[uid]
  if (!box || !el) return null
  const b = box.getBoundingClientRect(), r = el.getBoundingClientRect()
  return { x: r.left - b.left + r.width / 2, y: r.top - b.top + r.height / 2 }
}
function defForUid(uid) {
  const i = parseInt(uid.slice(1), 10)
  const arr = uid[0] === 'A' ? props.data?.playerTeam : props.data?.botTeam
  return getPetDef(arr?.[i]?.id) || { emoji: '❓' }
}
function playMotion(e, onImpact) {
  const def = defForUid(e.attacker)
  if (atkStyleOf(def) === 'ranged') {
    const a = centerOf(e.attacker), t = centerOf(e.target)
    if (a && t) {
      const k = projKey++
      projectiles.value = [...projectiles.value, { k, emoji: projectileOf(def), x0: a.x, y0: a.y, x1: t.x, y1: t.y }]
      setTimeout(() => { projectiles.value = projectiles.value.filter(p => p.k !== k); onImpact() }, 260 / speed.value)
      return
    }
  }
  // melee: lunge เข้าหาเป้า แล้วเด้งกลับ (transform ชั่วคราว)
  const a = centerOf(e.attacker), t = centerOf(e.target), el = els[e.attacker]
  if (a && t && el) {
    el.style.transition = `transform ${120 / speed.value}ms ease-out`
    el.style.transform = `translate(${(t.x - a.x) * 0.6}px, ${(t.y - a.y) * 0.6}px) scale(1.15)`
    setTimeout(() => {
      onImpact()
      el.style.transform = ''
      setTimeout(() => { el.style.transition = '' }, 140 / speed.value)
    }, 130 / speed.value)
    return
  }
  onImpact()
}
```

- [ ] **Step 3: แก้ applyAttack ให้ใช้ motion + callout + hit-stop + death** — แทนฟังก์ชัน `applyAttack` เดิม:

```js
function applyAttack(e) {
  acting.value = e.attacker
  playMotion(e, () => {
    flashing.value = e.target
    hp.value = { ...hp.value, [e.target]: Math.max(0, Math.round((e.targetHpAfter / (maxHp[e.target] || 1)) * 100)) }
    const k = popKey++
    pops.value = { ...pops.value, [e.target]: [...(pops.value[e.target] || []), { k, dmg: e.dmg, crit: e.crit, eff: e.eff }] }
    setTimeout(() => { pops.value = { ...pops.value, [e.target]: (pops.value[e.target] || []).filter(p => p.k !== k) } }, 600)
    if (e.eff === 'super' || e.eff === 'weak') {
      const ck = calloutKey++
      callouts.value = { ...callouts.value, [e.target]: { k: ck, text: e.eff === 'super' ? 'แพ้ทาง! ⚡' : 'ต้านทาน 🛡️', kind: e.eff } }
      setTimeout(() => { if (callouts.value[e.target]?.k === ck) { const c = { ...callouts.value }; delete c[e.target]; callouts.value = c } }, 700)
    }
    if (e.crit) { hitStop.value = true; setTimeout(() => hitStop.value = false, 120 / speed.value) }
  })
}
```

แก้ `step()` ให้ดีเลย์เพิ่มตอน hit-stop: เปลี่ยนบรรทัด schedule เป็น
```js
  if (idx.value < log.value.length) timer = setTimeout(step, noDelay ? 0 : delay.value + (e.t === 'attack' && e.crit ? 120 / speed.value : 0))
```

- [ ] **Step 4: เพิ่ม template — projectiles, callouts, ghost HP, death puff, inspect card**

ใน `.br-unit` แต่ละฝั่ง เพิ่มหลัง `<span br-pop>`:
```html
          <span v-if="callouts[uidKey('B', i)]" class="br-call" :class="callouts[uidKey('B', i)].kind">{{ callouts[uidKey('B', i)].text }}</span>
          <span v-if="(hp[uidKey('B', i)] ?? 100) <= 0" class="br-puff">💀</span>
```
(ฝั่ง A ใช้ `uidKey('A', i)` — เพิ่ม helper `function uidKey(s, i){ return s + i }`)

หลัง `</div>` ปิด `.br-box` (ก่อน inspect) เพิ่มชั้น projectile:
```html
    <div class="br-proj-layer">
      <span v-for="pj in projectiles" :key="pj.k" class="br-proj"
            :style="projStyle(pj)">{{ pj.emoji }}</span>
    </div>
```
แทน `<div v-if="inspectUid" class="br-inspect">` เดิม ด้วยการ์ดเต็ม:
```html
    <div v-if="inspectUid" class="br-inspect" @click.self="inspectUid = null">
      <div class="br-card">
        <div class="br-card-emoji"><Emoji :char="insp.def.emoji" /></div>
        <div class="br-card-name">{{ insp.def.name }}</div>
        <div class="br-card-row"><span>ธาตุ</span><b>{{ elName(insp.def.element) }}</b></div>
        <div class="br-card-row"><span>ระดับ</span><b>{{ rarityLabel(insp.def.rarity) }} · เกรด {{ insp.grade }}</b></div>
        <div class="br-card-row"><span>ATK</span><b>{{ insp.atk }}</b></div>
        <div class="br-card-row"><span>HP</span><b>{{ insp.hpNow }} / {{ insp.hpMax }}</b></div>
        <div class="br-card-pass"><span>Passive</span><b>{{ insp.passive ? insp.passive.name : '—' }}</b></div>
        <button class="br-btn sm" @click="inspectUid = null">ปิด</button>
      </div>
    </div>
```

- [ ] **Step 5: เพิ่ม computed/helper สำหรับ inspect + projectile** — ใน `<script setup>`:

```js
import { ELEMENTS, RARITY, GRADE_LABELS } from '../../data/index.js'
function uidKey(s, i) { return s + i }
function projStyle(pj) {
  return { '--x0': pj.x0 + 'px', '--y0': pj.y0 + 'px', '--x1': pj.x1 + 'px', '--y1': pj.y1 + 'px',
           animationDuration: (260 / speed.value) + 'ms' }
}
function elName(el) { return ELEMENTS[el]?.emoji || '?' }
function rarityLabel(r) { return RARITY[r]?.label || r }
const insp = computed(() => {
  const uid = inspectUid.value; if (!uid) return null
  const i = parseInt(uid.slice(1), 10)
  const arr = uid[0] === 'A' ? props.data?.playerTeam : props.data?.botTeam
  const p = arr?.[i] || {}
  const c = buildCombatant(p)
  return { def: getPetDef(p.id) || { emoji: '❓', name: '?', element: 'scissors', rarity: 'common' },
           grade: p.grade || 0, atk: Math.round(c.atk), hpMax: Math.round(c.maxHp),
           hpNow: Math.round((c.maxHp) * (hp.value[uid] ?? 100) / 100), passive: passiveOf(getPetDef(p.id)) }
})
```

- [ ] **Step 6: เพิ่ม CSS** — ใน `<style scoped>` เพิ่ม:

```css
.br-box.hitstop { animation: br-hitstop .12s; }
.br-call { position: absolute; top: -18px; font-weight: 800; font-size: .62rem; white-space: nowrap; padding: 1px 5px; border-radius: 6px; animation: br-rise .7s ease-out forwards; pointer-events: none; }
.br-call.super { background: #f87171; color: #fff; }
.br-call.weak { background: rgba(203,213,225,.9); color: #334155; }
.br-puff { position: absolute; font-size: 1.1rem; animation: br-puff .5s ease-out forwards; pointer-events: none; }
@keyframes br-puff { from { transform: translateY(0) scale(.6); opacity: 1 } to { transform: translateY(-14px) scale(1.2); opacity: 0 } }
.br-proj-layer { position: absolute; inset: 0; pointer-events: none; z-index: 5; }
.br-proj { position: absolute; left: 0; top: 0; font-size: 1.3rem; transform: translate(var(--x0), var(--y0)); animation: br-fly linear forwards; }
@keyframes br-fly { from { transform: translate(var(--x0), var(--y0)) } to { transform: translate(var(--x1), var(--y1)) } }
.br-inspect { position: fixed; inset: 0; z-index: 430; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,.4); }
.br-card { background: #1e293b; color: #fff; border: 2px solid #fff; border-radius: 16px; padding: 16px 18px; width: 240px; display: flex; flex-direction: column; gap: 6px; }
.br-card-emoji { font-size: 2.6rem; text-align: center; }
.br-card-name { text-align: center; font-weight: 800; font-size: 1.05rem; margin-bottom: 4px; }
.br-card-row, .br-card-pass { display: flex; justify-content: space-between; font-size: .8rem; }
.br-card-row span, .br-card-pass span { color: rgba(255,255,255,.6); }
.br-card-pass { border-top: 1px solid rgba(255,255,255,.15); margin-top: 4px; padding-top: 6px; }
.br-card .br-btn { margin-top: 8px; }
```

แก้ `.br-box` ให้ผูก hit-stop: ใน template เปลี่ยน `<div class="br-box">` เป็น `<div class="br-box" :class="{ hitstop: hitStop }">` และเพิ่ม keyframe:
```css
@keyframes br-hitstop { 0%,100% { transform: scale(1) } 50% { transform: scale(1.012) } }
```

- [ ] **Step 7: Build**

Run: `npm run build`
Expected: built สำเร็จ ไม่มี error/warning ที่เป็น error

- [ ] **Step 8: Manual (dev) — ไล่เช็คครบ**

`npm run dev` → สู้หลายรอบ ยืนยัน:
- melee (เช่น หมาป่า) พุ่งเข้าหาเป้าแล้วเด้งกลับ · ranged (มังกร 🔥 / นางฟ้า ✨) ยิง projectile ข้ามจอ
- โดนแพ้ทาง → ป้าย "แพ้ทาง! ⚡" · โดนต้าน → "ต้านทาน 🛡️"
- crit → กระแทก/hit-stop · ตาย → 💀 พั่ฟ + เทา
- แตะตัว → pause + การ์ดโชว์ ATK/HP/เกรด/ธาตุ + Passive: — · ปิดแล้วกด ▶ เล่นต่อ

- [ ] **Step 9: Commit**

```bash
git add src/components/battle/BattleReplay.vue
git commit -m "BattleReplay: juice — melee/ranged, ป้ายธาตุ, crit hit-stop, ตายพั่ฟ, แตะดู inspect"
```

---

### Task 8: Admin — ตารางสถิติ battle (win% / ดาเมจเฉลี่ย)

**Files:**
- Modify: `src/views/AdminView.vue`

**Interfaces:**
- Consumes: `getDocs(collection(db,'battleStats'))` · `getPetDef`
- Produces: section ตาราง species → battles / win% / avg dmg (เรียง win%)

- [ ] **Step 1: เพิ่ม state + loader** — ใน `<script setup>` ของ AdminView (มี `getDocs, collection` import แล้ว) เพิ่ม:

```js
import { getPetDef } from '../data/index.js'   // ถ้ายังไม่มี
const battleStats = ref([])
const loadingBattle = ref(false)
async function loadBattleStats() {
  loadingBattle.value = true
  try {
    const snap = await getDocs(collection(db, 'battleStats'))
    usage.track(snap.size)
    battleStats.value = snap.docs.map(d => {
      const x = d.data(), def = getPetDef(d.id) || { emoji: '❓', name: d.id }
      const battles = x.battles || 0
      return {
        id: d.id, emoji: def.emoji, name: def.name, battles,
        winPct: battles ? Math.round((x.wins || 0) / battles * 100) : 0,
        avgDmg: battles ? Math.round((x.dmgDealt || 0) / battles) : 0,
        kills: x.kills || 0, deaths: x.deaths || 0,
      }
    }).sort((a, b) => b.winPct - a.winPct)
  } catch (e) { console.error('[loadBattleStats]', e) }
  finally { loadingBattle.value = false }
}
```

- [ ] **Step 2: เพิ่ม section ใน template** — เพิ่มบล็อกนี้ในส่วน admin (เช่น ใกล้ section usage/สถิติ):

```html
    <section class="admin-card">
      <h3>⚔️ สถิติการสู้ (หอคอย)</h3>
      <button class="abtn" :disabled="loadingBattle" @click="loadBattleStats">
        {{ loadingBattle ? 'กำลังโหลด…' : 'โหลดสถิติ' }}
      </button>
      <table v-if="battleStats.length" class="bstat">
        <thead><tr><th>ตัว</th><th>สู้</th><th>ชนะ%</th><th>ดาเมจ/ไฟต์</th><th>K/D</th></tr></thead>
        <tbody>
          <tr v-for="s in battleStats" :key="s.id">
            <td><Emoji :char="s.emoji" /> {{ s.name }}</td>
            <td>{{ s.battles }}</td>
            <td :class="{ hi: s.winPct >= 60, lo: s.winPct <= 40 }">{{ s.winPct }}%</td>
            <td>{{ s.avgDmg }}</td>
            <td>{{ s.kills }}/{{ s.deaths }}</td>
          </tr>
        </tbody>
      </table>
    </section>
```

- [ ] **Step 3: เพิ่ม CSS** — ใน `<style scoped>` ของ AdminView:

```css
.bstat { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: .8rem; }
.bstat th, .bstat td { text-align: left; padding: 5px 6px; border-bottom: 1px solid rgba(0,0,0,.08); }
.bstat th { color: rgba(0,0,0,.45); font-weight: 700; }
.bstat td.hi { color: #15803d; font-weight: 800; }
.bstat td.lo { color: #b91c1c; font-weight: 800; }
```
(ถ้า class `.admin-card`/`.abtn` ไม่ตรงกับของเดิมในไฟล์ ให้ใช้ class section/ปุ่มที่ไฟล์ใช้อยู่จริง)

- [ ] **Step 4: Build + Manual**

Run: `npm run build` → สำเร็จ
`npm run dev` → เข้า Admin (ต้อง login เป็น admin) → กด "โหลดสถิติ" → ตารางขึ้น species + win% (สีเขียว ≥60 / แดง ≤40) + ดาเมจเฉลี่ย

- [ ] **Step 5: Commit**

```bash
git add src/views/AdminView.vue
git commit -m "Admin: ตารางสถิติการสู้ราย species (win%/ดาเมจเฉลี่ย) ไว้จูนเลข"
```

---

## Deploy (หลังทำครบ — ต้องอนุมัติ)
1. `git push origin master` — เว็บหลัก auto build+publish
2. **`firebase deploy --only firestore:rules`** — Task 5 (battleStats) — ทำไปแล้วใน Task 5 step 2 ถ้ายังให้ทำตอนนี้

## Self-review notes
- spec ส่วน 1–4 ครอบด้วย Task 6/7 (anim+inspect+controls), Task 2+6/7 (passive groundwork: data + event-dispatch), Task 1 (log eff/round), Task 3/4/5/8 (stats)
- ไม่แตะ logic engine (Task 1 เพิ่ม field เท่านั้น) — deepEqual test คุ้มกัน
- ชื่อ field สถิติตรงกันทุก task: `battles/wins/kills/deaths/dmgDealt/dmgTaken`
- **เลื่อนเป็น polish ทีหลัง (ไม่ใช่ blocker):** ghost HP bar (เงาขาวตามหลัง spec §1.3) — ของเดิม
  หลอด drain นุ่มด้วย `transition: width` อ่านออกพอแล้ว เพิ่มทีหลังได้ถ้าอยากเนียนขึ้น
