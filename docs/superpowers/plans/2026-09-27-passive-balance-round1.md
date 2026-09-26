# บาลานซ์พาสสีฟรอบ 1 + ป้ายคอมโบ Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** ใส่ค่าบาลานซ์ที่ user เคาะ 27 ก.ย. (16 เพ็ท) + กลไกใหม่ 5 ตัว + ป้ายคอมโบสดในหน้าจัดทีม

**Architecture:** เลขอยู่ `src/data/petPassives.js` · ตรรกะพาสสีฟ `src/utils/battlePassives.js` · ลำดับตา/หมัด `src/utils/battleEngine.js` · จังหวะ `battleBeats.js` · FX `BattleReplay.vue` · ป้ายบนการ์ด `battleBuffs.js` · ป้ายคอมโบ = pure util ใหม่ `src/utils/teamSynergy.js` + `TeamPicker.vue`

**Tech Stack:** Vue 3 · node:test (`node --test src/utils/<x>.test.js`) · `npm run build`

**Spec:** `docs/superpowers/specs/2026-09-27-passive-balance-round1-design.md` (อ่านก่อนเริ่มทุก task)

## Global Constraints

- ข้อความพาสสีฟตาม CLAUDE.md ข้อ 16: มีเลขผ่าน `{ตัวแปร}` เสมอ ห้ามพิมพ์เลขตรง · `short` ~40–60 ตัวอักษร · `desc` 1 ประโยค · คำที่ผู้เล่นพูด
- `passiveLv` ยังไม่มีในเกม — ทุกตัวขั้น 1 · ตัวเก่าคง `step` เดิม · กลไกใหม่ `step` ค่า 0
- event ของพาสสีฟใช้ `fxKind` ห้ามส่งฟิลด์ `kind` (CLAUDE.md ข้อ 15)
- ห้ามแตะ `stackAtk` ของ 🐍 อูโรโบรอส (ทบต้น onRound) — ทีเร็กซ์ย้ายไป effect ใหม่ `hunt`
- ฟอนต์ ≥ `.7rem` · ธีมใช้ตัวแปร `style.css`
- เทสทั้งชุด: `node --test src/` ต้องผ่านหมด (เดิม 1348) · `npm run build` ผ่าน
- commit รูปแบบ `Pets/Balance: อะไร (ทำไม)` ลงท้าย `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>` · **ห้าม push**

---

### Task 1: ปรับเลขล้วน 11 ตัว

**Files:**
- Modify: `src/data/petPassives.js` (bahamut · earth · mammoth · lion · luna · hamster · hedgehog · mouse · cat · butterfly · turtle)
- Test: `src/data/petPassives.test.js`, เทสอื่นที่ผูกเลขเดิม (หาด้วย grep)

- [ ] **Step 1: เขียนเทสล็อกค่าใหม่** ใน `src/data/petPassives.test.js`

```js
test('บาลานซ์รอบ 1 (27 ก.ย. 2026): ค่าขั้น 1 ตามที่ user เคาะ', () => {
  const v = (id, eff) => passiveValueAt(partWithEffect(PET_PASSIVES[id], eff), 1)
  assert.equal(v('bahamut', 'aoeOpener').pct, 100)
  assert.deepEqual(v('earth', 'season'), { hot: 20, rain: 12, cold: 30 })
  assert.equal(v('mammoth', 'armorStack').pct, 25)
  assert.equal(v('mammoth', 'armorStack').count, 2)
  assert.deepEqual(v('lion', 'elementTrinity'), { pct: 12, hpPct: 12 })
  assert.deepEqual(v('luna', 'moonPhase'), { dark: 75, half: 200, full: 325 })
  assert.equal(v('hamster', 'atkWhenFull').pct, 300)
  assert.equal(v('hedgehog', 'thorns').pct, 60)
  assert.equal(v('mouse', 'stealStats').pct, 5)
  assert.equal(v('cat', 'cheatDeath').atkPct, 80)
  assert.equal(v('butterfly', 'healLowestAlly').pct, 20)
  assert.equal(v('turtle', 'teamDamageReduction').pct, 15)
})
```
(import `partWithEffect`, `passiveValueAt` จาก `./petPassives.js` ถ้ายังไม่มี)

- [ ] **Step 2: รันให้แดง** `node --test src/data/petPassives.test.js` → FAIL

- [ ] **Step 3: แก้ `value` ใน `petPassives.js`** ตามตาราง spec ข้อ 3 (แตะเฉพาะ `value` · คง `step`) และอัปเดตคอมเมนต์เลขเก่าที่อ้างถึงค่าเดิม (เช่นคอมเมนต์แมมมอธ "สะท้อน 50% (จูน 11 ก.ย.…)" → บันทึกว่าลดเป็น 25 ตามเมต้าซิม 27 ก.ย.)

- [ ] **Step 4: ตามแก้เทสอื่นที่ผูกเลขเดิม**
Run: `node --test src/` · ตัวที่แดงเพราะคาดเลขเก่า (ไม่ใช่พฤติกรรมพัง) ให้อัปเดตค่าคาดหวัง · ถ้าแดงเพราะพฤติกรรม ให้หยุดรายงาน
Expected: PASS ทั้งหมด

- [ ] **Step 5: Commit** `Pets/Balance: ปรับเลข 11 ตัวตามเมต้าซิม (บาฮามุท 100 · ฝน 12 · แมมมอธ 25 · สิงโต 12 · ลูน่า 75/200/325 · common 6 ตัว)`

---

### Task 2: ☀️ ซอลขั้นบันไดตามระดับ

**Files:**
- Modify: `src/data/petPassives.js` (sol) · `src/utils/battlePassives.js` case `'rarityBoost'` (~บรรทัด 232)
- Check: `src/utils/petForms.js` (`degreeFormActive` / `effectiveRarity`) + ที่อื่นที่อ่าน `value.rarity` ของซอล: `grep -rn "rarityBoost\|\.rarity ===\|v.rarity" src`
- Test: `src/utils/battlePassives.test.js`

**Interfaces:** Produces: sol value `{ common: 50, rare: 40, epic: 30, legendary: 0 }`

- [ ] **Step 1: เทส**

```js
test('ซอลขั้นบันได: common +50 · rare +40 · epic +30 · ตำนาน 0 · ตัวเองไม่ได้', () => {
  const mk = (id, rarity) => ({ id, uid: 'A' + id, side: 'A', rarity, element: 'fist', atk: 100, maxHp: 1000, hp: 1000 })
  const team = [mk('sol', 'legendary'), mk('__c', 'common'), mk('__e', 'epic')]
  const foes = [mk('__x', 'rare')]
  runSetup(team, foes)   // ใช้ชื่อฟังก์ชัน setup/aura ที่ไฟล์นี้ export จริง — ดูเทสซอลเดิมในไฟล์เดียวกันแล้วเลียนแบบ
  assert.equal(Math.round(team[1].atk), 150)
  assert.equal(Math.round(team[2].atk), 130)
  assert.equal(Math.round(team[0].atk), 100)
})
```
เพิ่มเคส rare = 140 และเพื่อนตำนาน = 100 · เคสเอิร์ธร่างองศา (นับเป็น common) ได้ +50

- [ ] **Step 2: รันให้แดง**

- [ ] **Step 3: แก้ข้อมูล**

```js
parts: [{ hook: 'aura', effect: 'rarityBoost', value: { common: 50, rare: 40, epic: 30, legendary: 0 },
          step: { common: 0, rare: 0, epic: 0, legendary: 0 } }],
desc: 'เพื่อนในทีมได้พลังโจมตีและเลือด +% ตามระดับ: ธรรมดา {common}% · หายาก {rare}% · เอพิค {epic}%',
short: 'เพื่อนแรง+อึด: ธรรมดา {common}% · หายาก {rare}% · เอพิค {epic}%',
```

- [ ] **Step 4: แก้ตรรกะ**

```js
case 'rarityBoost': {
  // ☀️ ขั้นบันไดตามระดับ (27 ก.ย. 2026) — ตัวที่ "นับเป็น" ระดับนั้น (เอิร์ธร่างองศา = common) · ซอลเองไม่ได้
  for (const t of team) {
    if (t === u) continue
    const pct = v[t.countsAs || t.rarity] || 0
    if (!pct) continue
    t.atk *= 1 + pct / 100
    t.maxHp *= 1 + pct / 100
    t.hp = t.maxHp
  }
  break
}
```
ตามแก้ที่อื่นที่อ่าน `v.rarity`/`v.pct` ของซอล (ป้ายบัฟใน `battleBuffs.js`, ข้อความเอิร์ธ, `effectText`) ให้ใช้รูปใหม่

- [ ] **Step 5: รัน `node --test src/` ผ่าน · Commit** `Pets/Balance: ☀️ ซอลขั้นบันไดตามระดับ 50/40/30/0 (ตำนาน 0 กันซอลครองเมต้า)`

---

### Task 3: 🦅 กริฟฟินดาเมจตามเลือดที่เป้าหาย

**Files:** `src/data/petPassives.js` (simurgh) · `src/utils/battlePassives.js` `runOnAttack` (~บรรทัด 385) · Test `battlePassives.test.js`

**Interfaces:** Produces: effect ใหม่ `'woundBonus'` value `{ pct: 100 }` → `res.atkMult *= 1 + pct/100 × (1 − hp/maxHp)` ของ `res.target`

- [ ] **Step 1: เทส**

```js
test('กริฟฟิน woundBonus: เป้าเลือดหาย 40% → หมัด ×1.4 และเล็งตัวเลือดน้อยสุด', () => {
  const att = { id: 'simurgh', uid: 'A0', side: 'A', atk: 100, hp: 500, maxHp: 500 }
  const full = { uid: 'B0', side: 'B', hp: 1000, maxHp: 1000 }
  const hurt = { uid: 'B1', side: 'B', hp: 600, maxHp: 1000 }
  const r = runOnAttack(att, full, [full, hurt], () => 0.5)
  assert.equal(r.target, hurt)
  assert.ok(Math.abs(r.atkMult - 1.4) < 1e-9)
})
```

- [ ] **Step 2: รันให้แดง**

- [ ] **Step 3: ข้อมูล** (part ต่อจาก targetLowest — ลำดับสำคัญ: เล็งก่อนแล้วค่อยคิดโบนัสจากเป้าใหม่)

```js
parts: [
  { hook: 'onAttack', effect: 'targetLowest', value: {}, step: {} },
  { hook: 'onAttack', effect: 'woundBonus', value: { pct: 100 }, step: { pct: 0 } },
],
desc: 'เล็งศัตรูที่เลือดน้อยที่สุดเสมอ · เป้าเลือดหายไปกี่ % หมัดแรงขึ้นเท่านั้น',
short: 'เล็งตัวเลือดน้อยสุด · เลือดเป้าหายเท่าไหร่ แรงขึ้นเท่านั้น',
```
(ถ้า `{pct}` ≠ 100 ในอนาคต ข้อความต้องเปลี่ยน — ใส่คอมเมนต์ไว้)

- [ ] **Step 4: ตรรกะ** ใน `runOnAttack` switch

```js
case 'woundBonus': {
  const tg = res.target
  if (!tg || !tg.maxHp) break
  const lost = Math.max(0, 1 - tg.hp / tg.maxHp)
  if (lost <= 0) break
  res.atkMult *= 1 + (v.pct / 100) * lost
  res.events.push(ev(att, p, part, { targets: [tg.uid], amount: Math.round(lost * v.pct), fxKind: 'aim' }))
  break
}
```
เพิ่ม `woundBonus` ใน `STATUS_TEXT`/`STATUS_ICON` ถ้าตารางนั้นครอบทุก effect (ดูเทส `petPassives.test.js` ที่เช็คความครบ)

- [ ] **Step 5: `node --test src/` ผ่าน · Commit** `Pets/Balance: 🦅 กริฟฟินแรงขึ้นตามเลือดที่เป้าหาย (ทำงานตั้งแต่หมัดแรก)`

---

### Task 4: 🦠 ไวรัสแพร่เชื้อทั้งทีม

**Files:** `src/utils/battlePassives.js` `runOnHit` บล็อกแปะเชื้อ (~บรรทัด 703–721) · `src/data/petPassives.js` (virus desc/short) · Test `battlePassives.test.js`

- [ ] **Step 1: เทส** — ไวรัสตีเป้า B0 ในทีม [B0,B1,B2] ⇒ ทั้ง 3 ตัวได้ `ps.infect.n === 1` · ตีอีกครั้ง ⇒ 2 · ตัวตายไม่ติด · เพดาน `max` · ได้ **event เดียว** `fxKind:'debuff'` ที่ `targets` มีครบทุกตัวที่ชั้นขึ้น · เจ้าของสแตค (`from`) ยังเป็นไวรัสตัวแรก (ดูเทสเดิมของ infect ในไฟล์นี้เป็นแม่แบบการสร้าง unit/ps)

- [ ] **Step 2: รันให้แดง**

- [ ] **Step 3: ตรรกะ** — `team` ใน `runOnHit(defender, dmg, attacker, team, …)` คือทีมของเป้า

```js
const ap = passiveFor(attacker)
for (const part of partsAt(ap, 'onAttack')) {
  if (part.effect !== 'infect') continue
  const v = valOf(part, attacker)
  // 🦠 แพร่ทั้งทีม (27 ก.ย. 2026): หมัดเดียว = ศัตรูทุกตัวที่ยังอยู่ติด +1 ชั้น · event เดียวหลายเป้า กันรีเพลย์รก
  const hit = []
  for (const d of (team ? alive(team) : [defender])) {
    const st = psOf(d)
    const cur = st.infect || { n: 0, from: attacker }
    if (cur.n >= v.max) { st.infect = cur; continue }
    st.infect = { n: cur.n + 1, from: cur.from }   // 🔴 กฎไวรัสตัวแรกเป็นเจ้าของสแตค (คอมเมนต์เดิมคงไว้)
    hit.push(d)
  }
  if (hit.length) res.events.push(ev(attacker, ap, part, { targets: hit.map(d => d.uid),
    amount: Math.max(...hit.map(d => psOf(d).infect.n)), fxKind: 'debuff' }))
}
```
⚠️ ตรวจผู้อ่าน event `infect` (`battleBuffs.js` ชั้นเชื้อบนการ์ด · `BattleReplay.vue` ป้ายลอยชั้นเชื้อ) ว่ารองรับหลาย `targets` และอ่านชั้นต่อเป้าจาก state ไม่ใช่ `amount` เดียว — ถ้าอ่าน `amount` ให้เปลี่ยนไปนับต่อเป้า (เช่นส่ง `stacks: {uid: n}` เพิ่มใน event)

- [ ] **Step 4: ข้อความ** `desc: 'ไวรัสตีทีไร ศัตรูทุกตัวติดเชื้อ +1 ชั้น (สูงสุด {max}) · ทีมเราตีตัวที่ติดเชื้อ เจ็บเพิ่มชั้นละ {pct}% ของพลังโจมตีไวรัส ทะลุทุกการป้องกัน'` · `short: 'ตีทีไรเชื้อลามทั้งทีม · ชั้นละ {pct}% ทะลุเกราะ'`

- [ ] **Step 5: `node --test src/` ผ่าน · Commit** `Pets/Balance: 🦠 ไวรัสแพร่เชื้อให้ศัตรูทุกตัวทุกหมัด (เดิมเป้าตายก่อนชั้นขึ้น)`

---

### Task 5: 🦖 ทีเร็กซ์ `hunt` — ทุกหมัด +20% ATK ฐาน ไม่มีเพดาน

**Files:** `src/data/petPassives.js` (trex) · `src/utils/battlePassives.js` (setup ชั้นตั้งต้น + `runOnAttack`) · `src/utils/battleBuffs.js` (`COUNTER_EFFECTS` + `ownCounter` case) · `STATUS_TEXT`/`STATUS_ICON`/`BADGE_PRIORITY`/`SELF_STATUS_EFFECTS` ใน `petPassives.js` ตามที่ `stackAtk` อยู่ · Test `battlePassives.test.js`, `battleBuffs.test.js`, `petPassives.test.js`

**Interfaces:** Produces: effect `'hunt'` value `{ pct: 20, start: 2 }` · state `psOf(u).huntBase` (atk ฐานหลัง aura) + `psOf(u).huntStacks`

- [ ] **Step 1: เทส**
  - หลัง setup: `huntStacks === 2`, `atk === huntBase × 1.4`
  - `runOnAttack` ครั้งที่ 1: `huntStacks === 3`, `atk === huntBase × 1.6` (บวกจากฐาน ไม่ทบต้น: ครั้งที่ 10 = ×3.4 ไม่ใช่ 1.2^12)
  - ไม่มีเพดาน: 30 หมัด ⇒ 32 ชั้น
  - event `fxKind:'buff'` `amount` = ชั้นหลังเพิ่ม · มี `statsAfter`
  - `ownCounter` ของทีเร็กซ์คืน `{ n: ชั้น, kind: 'stack' }`
  - เทสเดิม "ห้ามเพ็ทถือ stackAtk เกิน 1 part" ยังผ่าน (ทีเร็กซ์ไม่ถือ stackAtk แล้ว)

- [ ] **Step 2: รันให้แดง**

- [ ] **Step 3: ข้อมูล**

```js
trex: {
  name: 'สัญชาตญาณนักล่า', icon: '🦖',
  // 27 ก.ย. 2026: เดิม onAnyDeath stackAtk (คนตายช้า ได้ชั้นตอนไฟต์จะจบ) → ทุกหมัด +pct% ของ atk ฐาน ไม่มีเพดาน
  // 🔴 บวกจากฐาน ไม่ทบต้น — ไม่มีเพดาน + ทบต้น = ระเบิดในไฟต์ยาว (world boss ในอนาคต)
  parts: [{ hook: 'onAttack', effect: 'hunt', value: { pct: 20, start: 2 }, step: { pct: 0, start: 0 } }],
  desc: 'ทุกหมัดที่ตี พลังโจมตี +{pct}% สะสมไม่มีเพดาน · เข้าไฟต์พร้อม {start} ชั้น',
  short: 'ตีทีไรแรง +{pct}% สะสมไม่จำกัด · เริ่ม {start} ชั้น',
},
```

- [ ] **Step 4: ตรรกะ**
  - setup (ต่อจากบล็อกชั้นตั้งต้น stackAtk ~บรรทัด 130): หา part `hunt` → ใส่ชั้นตั้งต้นแบบบวกเพิ่ม (โค้ดอยู่ในบูลเล็ต setup ด้านล่าง) (ไม่ยิง event เหตุผลเดียวกับคอมเมนต์ stackAtk)
    ⚠️ setup ต้องทำ **หลัง** aura ทั้งหมด (ซอล/สิงโต/วาฬ) ไม่งั้น aura ที่คูณ atk ทีหลังจะไม่ถูกนับในฐาน — ตรวจลำดับใน engine/setup
  - `runOnAttack` case:

```js
case 'hunt': {
  const st = psOf(att)
  if (st.huntBase == null) { st.huntBase = att.atk; st.huntStacks = 0 }
  st.huntStacks += 1
  att.atk += st.huntBase * v.pct / 100   // บวกเพิ่ม ไม่เซ็ตทับ — ไม่ลบผลขโมย/ฤดูร้อน/บัฟอื่นที่แตะ atk
  const e = ev(att, p, part, { targets: [att.uid], amount: st.huntStacks, fxKind: 'buff' })
  e.statsAfter = statsSnapshot(/* ทีมของ att, foes — ใช้รูปแบบเดียวกับ case อื่นในไฟล์ */)
  res.events.push(e)
  break
}
```
  (หมัดนี้ได้ชั้นใหม่ทันที เพราะเอนจินคิด `base = att.atk * m` หลัง `runOnAttack`)
  - setup ก็ใช้แบบบวกเพิ่มเช่นกัน: `st.huntBase = u.atk; st.huntStacks = v.start; u.atk += st.huntBase * v.pct / 100 * v.start` (เทสข้อ Step 1 "atk === huntBase × 1.4" ยังจริงเมื่อไม่มีตัวอื่นแตะ atk)
  - ℹ️ หมัดแรกจริงได้ 3 ชั้น (+60%) เพราะชั้นเพิ่มก่อนคิดดาเมจ · sim ทดลองหมัดแรก +40% ⇒ แรงกว่าที่วัดนิดหน่อย — Task 9 วัดซ้ำ
  - `battleBuffs.js`: เติม `'hunt'` ใน `COUNTER_EFFECTS` และ `case 'hunt':` เหมือน `stackAtk` (`n = max(b.stacks, v.start)`) · ให้ `liveBuffs` นับชั้นจาก event `hunt` แบบที่ทำกับ `stackAtk` (grep `'stackAtk'` ในไฟล์แล้วเติม `hunt` ทุกจุดที่เป็นเรื่องชั้น)
  - เพิ่ม `'hunt'` ใน `STAT_EFFECTS` (battlePassives.js บรรทัด 43) · `STATUS_ICON/TEXT`, `SELF_STATUS_EFFECTS`, `BADGE_PRIORITY` ตาม `stackAtk`

- [ ] **Step 5: `node --test src/` ผ่าน · Commit** `Pets/Balance: 🦖 ทีเร็กซ์ ทุกหมัด +20% ATK ฐาน ไม่มีเพดาน เริ่ม 2 ชั้น (ไฟต์ยื้อ/world boss)`

---

### Task 6: 🐹 แฮมสเตอร์ช่อง 1 ⇒ ทีมตีก่อน

**Files:** `src/utils/battleEngine.js:274` · `src/data/petPassives.js` (hamster desc/short) · Test `battleEngine.test.js`

- [ ] **Step 1: เทส** — ทีม A `[hamster, blank, blank]` vs ทีม B 3 ตัวที่ **เยอะกว่า**ไม่ได้ (3v3 เท่ากัน) · 50 seed ⇒ attack event แรกใน log เป็น `side:'A'` ทุก seed · กรณีแฮมสเตอร์อยู่ช่อง 2 ⇒ บาง seed B ตีก่อน · กรณีทั้งสองฝั่งมีแฮมสเตอร์ช่อง 1 ⇒ กติกาเดิม (บาง seed B ก่อน) · กรณี A 2 ตัวมีแฮมสเตอร์ vs B 3 ตัว ⇒ A ก่อน (แฮมสเตอร์ชนะกติกาจำนวนตัว)

- [ ] **Step 2: รันให้แดง**

- [ ] **Step 3: ตรรกะ**

```js
// 🐹 แฮมสเตอร์ช่อง 1 = ทีมได้ตีก่อนเสมอ (27 ก.ย. 2026) · มีทั้งสองฝั่ง = กติกาเดิม
// ⚠️ ห้ามดึง rand() เพิ่มในเส้นทางนี้ — ลำดับสุ่มของไฟต์ต้องเหมือนเดิมเมื่อไม่มีแฮมสเตอร์
const leadA = A[0]?.id === 'hamster', leadB = B[0]?.id === 'hamster'
const first = leadA !== leadB ? (leadA ? 'A' : 'B')
  : ca > cb ? 'A' : cb > ca ? 'B' : (rand() < 0.5 ? 'A' : 'B')
```
⚠️ `A[0]` ต้องเป็นช่อง 1 ตามที่ผู้เล่นจัด — ตรวจว่า `simulateBattle` รับทีมตามลำดับช่อง (ดูผู้เรียกใน PvP/หอคอย) · ถ้าแฮมสเตอร์ช่อง 1 ตายไปแล้วไม่เกี่ยว (ตัดสินครั้งเดียวตอนเริ่ม)
⚠️ ถ้าผลตีก่อนถูกบอกในรีเพลย์ (เช่นป้าย "ฝั่งไหนตีก่อน") ให้ตรวจว่าไม่ขัดกัน

- [ ] **Step 4: ข้อความ** เติมท้าย desc `· อยู่ช่อง 1 ทีมได้ตีก่อนเสมอ` · short ถ้ายาวเกิน 60 ให้ย่อ เช่น `เลือดเต็มตีแรง {pct}% · ช่อง 1 ทีมตีก่อน`

- [ ] **Step 5: `node --test src/` ผ่าน · Commit** `Pets/Balance: 🐹 แฮมสเตอร์ช่อง 1 ทีมตีก่อนเสมอ (ช็อตแรกสมชื่อ)`

---

### Task 7: 👹 โอนิ "ง้างตะบองฟาด!" (`windup`)

**Files:** `src/data/petPassives.js` (kirin + STATUS_*) · `src/utils/battlePassives.js` (`runOnAttack` case, ลบ `killChain` ใน `runOnKill` ถ้าไม่มีใครใช้) · `src/utils/battleEngine.js` ลูปตา (~บรรทัด 300–322) · `src/utils/battleBeats.js` (event ง้างต้องได้ beat ของตัวเอง) · `src/components/battle/BattleReplay.vue` (`firePassiveFx` case `windup`/`smash`, `PSFX`) · `src/utils/battleBuffs.js` (`ownCounter` แสดง "ง้าง") · Test `battleEngine.test.js`, `battleBeats.test.js`, `battlePassives.test.js`

**Interfaces:** effect `'windup'` value `{ pct: 300 }` · state `psOf(u).wound` (true = ง้างค้างอยู่) · event ง้าง `{ t:'passive', effect:'windup', fxKind:'windup', uid, targets:[uid] }` · event ฟาด `{ effect:'windup', fxKind:'smash' }` ผ่าน `runOnAttack` · ตีต่อ `{ effect:'windup', fxKind:'chain' }`

- [ ] **Step 1: เทสเอนจิน**
  - โอนิ vs blank 3 ตัว: ตาแรกของโอนิไม่มี attack event ของโอนิ มี passive `fxKind:'windup'` · ตาที่สองมี attack ที่ดาเมจ ≈ 3× ของหมัดปกติ (เทียบ `__blank__` สเตตัสเดียวกัน seed เดียวกัน ยอม variance ±`BATTLE_CFG.variance`) · ตาที่สามง้างอีก
  - หมัดฟาดน็อก ⇒ attack ถัดไปทันทีเป็นของโอนิ (ตีต่อ 1 ครั้ง ×3 เช่นกัน) แล้วไม่ตีต่อครั้งที่ 3 แม้จะน็อกอีก
  - แช่แข็งตอนง้างค้าง ⇒ ตานั้นเป็น skip · `wound` ยังเป็น true · ตาถัดไปฟาด
  - ง้างนับเป็นการได้ตาในรอบ (`pending` ลด) — ไฟต์ไม่ค้าง รอบจบได้
  - เทสเดิมของ killChain (`battleEngine.test.js:253`, `battleBeats.test.js:513`) ปรับให้ใช้ windup หรือลบถ้าไม่มีเพ็ทถือ killChain แล้ว — **ย้ายเจตนาเดิม**: "ผู้ตีตายจากหนามกลางหมัดต้องไม่ตีต่อ" ใช้ได้กับตีต่อของ windup ด้วย ⇒ เขียนใหม่ให้เทสนั้นกับโอนิแบบใหม่

- [ ] **Step 2: รันให้แดง**

- [ ] **Step 3: ข้อมูล**

```js
kirin: {
  name: 'ง้างตะบองฟาด!', icon: '👹',
  // 27 ก.ย. 2026 (ไอเดีย user): ง้าง 1 ตา → ฟาด {pct}% · ฟาดน็อก = ตีต่อ 1 ครั้งแรงเท่ากัน · แล้ววนง้างใหม่
  // ตาแรกของไฟต์ = ง้าง (แบนเนอร์ขึ้นพร้อมชาร์จ — user เคาะ) · โดนแช่แข็งตอนง้างค้าง = ง้างค้างไว้ต่อ
  parts: [{ hook: 'onAttack', effect: 'windup', value: { pct: 300 }, step: { pct: 0 } }],
  desc: 'ตาแรกง้างตะบอง ตาถัดไปฟาด {pct}% · ฟาดน็อกได้ฟาดต่ออีก 1 ครั้ง แล้ววนง้างใหม่',
  short: 'ง้าง 1 ตา → ฟาด {pct}% · น็อกแล้วฟาดต่อ',
},
```
(ชื่อสกิลเดิม 'อสูรกระหายเลือด' → 'ง้างตะบองฟาด!' ตามที่ user สั่ง)

- [ ] **Step 4: ตรรกะ**
  - `battlePassives.js` export helper:

```js
/** 👹 พาสสีฟง้าง/ฟาดของ unit นี้ (null = ไม่มี) — เอนจินใช้ตัดสินว่าตานี้ง้างหรือฟาด */
export function windupOf(unit) {
  const part = partWithEffect(passiveFor(unit), 'windup')
  return part ? { part, v: valOf(part, unit) } : null
}
```
    และ case ใน `runOnAttack`: `case 'windup': if (psOf(att).smashing) { res.atkMult *= v.pct / 100; res.events.push(ev(att, p, part, { targets: [target.uid], fxKind: 'smash' })) } break`
  - `battleEngine.js` ในลูปตา แทน `else { let killed = hit(att, foes) … killChain while … }`:

```js
} else if (windupOf(att) && !st.wound) {
  // 👹 ง้าง — ไม่ตี แต่นับว่าได้ตาในรอบแล้ว (เหมือนตาที่ถูกข้าม)
  st.wound = true
  const { part } = windupOf(att)
  const p = PET_PASSIVES[att.id]
  log.push({ t: 'passive', uid: att.uid, side: att.side, petId: att.id, name: p.name, icon: p.icon,
    effect: 'windup', targets: [att.uid], fxKind: 'windup' })
} else {
  const wu = windupOf(att)
  if (wu) { st.wound = false; st.smashing = true }
  let killed = hit(att, foes)
  // ตีต่อของโอนิ: ฟาดน็อก ⇒ ฟาดซ้ำ 1 ครั้ง (ไม่ใช่ตาใหม่) · เช็ค att.hp > 0 (โดนหนามสวนตายกลางหมัดได้)
  if (wu && killed && att.hp > 0 && alive(foes).length && turns < BATTLE_CFG.maxTurns) {
    log.push({ t: 'passive', uid: att.uid, side: att.side, petId: att.id, name: PET_PASSIVES[att.id].name,
      icon: PET_PASSIVES[att.id].icon, effect: 'windup', targets: [att.uid], fxKind: 'chain' })
    turns++
    hit(att, foes)
  }
  if (wu) st.smashing = false
  // onKill อื่นๆ (stackAtk onKill ถ้ามี) — คงการเรียก runOnKill ครั้งเดียวต่อการฆ่า
}
```
    ⚠️ รักษาพฤติกรรม `runOnKill` ของเพ็ทอื่น (grep `hook: 'onKill'` ใน petPassives.js — ถ้ายังมีเพ็ทใช้ ให้คงลูปเรียก runOnKill สำหรับการฆ่าแต่ละครั้ง โดยไม่มี extraAttack) · ถ้าไม่มีใครถือ `killChain` แล้ว ลบ branch `killChain` ใน `runOnKill` และคอมเมนต์ที่อ้างถึง (battlePassives.js บรรทัด 5–7, battleEngine.js 312) ให้ตรงความจริง
    ⚠️ ลำดับ skip ต้องมาก่อน: `if (st.skip > 0) {…} else if (ง้าง) … else …` — โดนแช่แข็งตอน `wound=true` ⇒ skip กิน ตา wound คงอยู่
  - `battleBeats.js`: event `fxKind:'windup'` ไม่มี attack ตามมา ⇒ ต้องได้เวลาเป็น beat ของตัวเอง (ไม่ใช่ timing ZERO) ใช้ทางเดียวกับ `fxKind:'skip'` (ดูบรรทัด ~292–304 `isFreezeSkip`) — ครั้งแรกของโอนิควรได้ `skillShow` (แบนเนอร์ขึ้นพร้อมชาร์จ ตามที่ user สั่ง) ⇒ **อย่า** ปฏิบัติแบบ freezeSkip ที่ห้ามโชว์ไทม์ · ครั้งต่อไป `skill` · เขียนเทสใน `battleBeats.test.js`: log ที่มีง้างได้ beat kind `skillShow` ครั้งแรก และทุก beat ง้างมี timing > 0
  - `BattleReplay.vue` `firePassiveFx`: `case 'windup': fx?.ring(e.uid, 'windup', 420); break` · `case 'smash': fx?.sweep(on, '💥', 0); break` · `PSFX` เพิ่ม `windup: 'p_guard', smash: 'p_fire'` (เลือกเสียงที่มีอยู่แล้วใน `sfx.js`) · `chain` มีอยู่แล้ว
  - `battleBuffs.js` `ownCounter`: เติม `'windup'` ใน `COUNTER_EFFECTS` · case คืน `{ n: 1, kind: 'charge', spent: false }` เมื่อ beat ล่าสุดของ uid นี้ที่ effect `windup` มี `fxKind:'windup'` (ง้างค้าง) · คืน null หลัง `smash` — ตรวจว่าตัววาดป้าย (`BattleReplay.vue` ที่อ่าน `ownCounter`) รู้จัก `kind:'charge'` ถ้าไม่ ให้แสดงเป็นไอคอน 🏏 ไม่มีเลข
  - `STATUS_ICON/TEXT` ของ `windup` (เช่น 🏏 / 'ง้างอยู่') ตามแพทเทิร์นไฟล์

- [ ] **Step 5: `node --test src/` ผ่าน · `npm run build` ผ่าน · Commit** `Pets/Balance: 👹 โอนิ "ง้างตะบองฟาด!" ง้าง 1 ตา ฟาด 300% น็อกฟาดต่อ (แทน killChain ที่ทำงาน ~1 ครั้ง/ไฟต์)`

---

### Task 8: ป้ายคอมโบสดในหน้าจัดทีม

**Files:**
- Create: `src/utils/teamSynergy.js`, `src/utils/teamSynergy.test.js`
- Modify: `src/components/battle/TeamPicker.vue` (ใต้ `.tp-slots` ก่อน `.tp-status`)

**Interfaces:**
- Consumes: `PETS` (`src/data/index.js` — rarity/element), `PET_PASSIVES`, `passiveValueAt`, `partWithEffect` (`src/data/petPassives.js`), `seasonOfSlot`, `seasonText`, `degreeFormActive`, `effectiveRarity`, `duoPartnerOf` (`src/utils/petForms.js`), `DUO_TITLES`
- Produces: `teamSynergy(slotIds: (string|null)[]) → Array<{ key: string, icon: string, ok: boolean, text: string }>`

- [ ] **Step 1: เทส** (`teamSynergy.test.js`)

```js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { teamSynergy } from './teamSynergy.js'

const find = (r, key) => r.find(x => x.key === key)

test('สิงโตครบ 3 สาย → ok พร้อมเลข · ไม่ครบ → บอกสายที่ขาด', () => {
  const ok = find(teamSynergy(['lion', 'gorilla', 'luna']), 'lion')     // fist · paper · scissors
  assert.equal(ok.ok, true); assert.match(ok.text, /12%/)
  const no = find(teamSynergy(['lion', 'bahamut', 'gorilla']), 'lion')   // ขาด scissors
  assert.equal(no.ok, false); assert.match(no.text, /✂️|กรรไกร|scissors/)
})
test('ซอล: มีตัวต่ำกว่าตำนาน → ok บอกจำนวน · ตำนานล้วน → เตือน', () => {
  assert.equal(find(teamSynergy(['sol', 'cat', 'panda']), 'sol').ok, true)
  assert.equal(find(teamSynergy(['sol', 'bahamut', 'phoenix']), 'sol').ok, false)
})
test('เอิร์ธบอกฤดูตามช่อง', () => {
  assert.match(find(teamSynergy(['bahamut', 'earth', 'phoenix']), 'earth').text, /🌧️/)
})
test('แฮมสเตอร์ช่อง 1 ok · ช่องอื่นแนะนำให้ย้าย', () => {
  assert.equal(find(teamSynergy(['hamster', 'sol', 'panda']), 'hamster').ok, true)
  assert.equal(find(teamSynergy(['sol', 'hamster', 'panda']), 'hamster').ok, false)
})
test('ดูโอ้ครบคู่ขึ้นชื่อคู่ · ทีมว่าง/ไม่มีเงื่อนไข → []', () => {
  assert.ok(teamSynergy(['whale', 'seal', null]).some(x => x.key.startsWith('duo')))
  assert.deepEqual(teamSynergy([null, null, null]), [])
  assert.deepEqual(teamSynergy(['bahamut', 'phoenix', 'mammoth']), [])
})
```

- [ ] **Step 2: รันให้แดง** `node --test src/utils/teamSynergy.test.js`

- [ ] **Step 3: เขียน `teamSynergy.js`** — pure · เลขจาก `passiveValueAt(part, 1)` เท่านั้น
  - 🦁 `lion`: สายของทีม (`PETS` element) ครบ fist/paper/scissors ⇒ `{ok:true, text:'ครบ 3 สาย ทั้งทีมแรง +{pct}% เลือด +{hpPct}%'}` · ไม่ครบ ⇒ `{ok:false, text:'ยังขาดสาย <อีโมจิสาย>'}` (ใช้อีโมจิสายเดียวกับ `elEmoji` ใน TeamPicker — import จากที่มันมา)
  - ☀️ `sol`: นับเพื่อนที่ `effectiveRarity(pet, team)` ได้ % > 0 ⇒ `ok` `'บัฟเพื่อน N ตัว'` · 0 ⇒ `'เพื่อนเป็นตำนานหมด ไม่ได้บัฟ'`
  - 🌍 `earth`: `seasonOfSlot(index)` ⇒ `{ok:true, text: '<icon ฤดู> ' + seasonText(key, v)}` · ร่างองศา (`degreeFormActive`) ⇒ ข้อความร่างองศาแทน
  - 🐹 `hamster`: index 0 ⇒ `'ช่อง 1: ทีมได้ตีก่อน'` ok · อื่น ⇒ `'ย้ายไปช่อง 1 ทีมจะได้ตีก่อน'` not ok
  - ดูโอ้: ทุกคู่ใน `DUO_TITLES` ที่ครบ ⇒ `{key:'duo:'+ids.join('+'), ok:true, text: name}`
  - ลำดับผลลัพธ์ตามช่อง · ข้อความตาม `docs/voice-guide.md`

- [ ] **Step 4: เทสผ่าน**

- [ ] **Step 5: UI ใน `TeamPicker.vue`**

```vue
<div v-if="synergy.length" class="tp-syn">
  <span v-for="s in synergy" :key="s.key" class="tp-syn-chip" :class="{ off: !s.ok }">
    <Emoji :char="s.icon" /> {{ s.text }}
  </span>
</div>
```
```js
import { teamSynergy } from '../../utils/teamSynergy.js'
const synergy = computed(() => teamSynergy(edit.value.slots))
```
```css
.tp-syn { display: flex; flex-wrap: wrap; gap: 6px; justify-content: center; margin: 8px 0 2px; }
.tp-syn-chip { font-size: .75rem; padding: 3px 9px; border-radius: 999px; background: var(--mint); border: var(--bw) solid var(--line); }
.tp-syn-chip.off { background: transparent; opacity: .85; border-style: dashed; }
```
(ตรวจชื่อตัวแปรสีใน `style.css` ให้มีจริง · ฟอนต์ ≥ .7rem)

- [ ] **Step 6: `npm run build` ผ่าน · ดูใน dev (`npm run dev` → หน้าจัดทีม) ว่าชิปขึ้น/เปลี่ยนตามการสลับช่อง · Commit** `Pets/Team: ป้ายคอมโบสดในหน้าจัดทีม (บอกว่าพาสสีฟที่มีเงื่อนไขทำงานไหม ไม่บอกทีมเมต้า)`

---

### Task 9: ตรวจรับรวม

- [ ] **Step 1:** `node --test src/` ผ่านหมด · `npm run build` ผ่าน · `grep -rnE "font-size:\s*\.[0-6][0-9]?rem" src/` ไม่เจออะไร
- [ ] **Step 2:** `node scripts/meta-team-sim.mjs 100 30 50` — เทียบกับ spec ข้อ 2: อันดับ 1 ≤ ~65% · ตัวบ่อยสุด ≤ ~15/30 · ≥ 16 species · ถ้าเพี้ยนมาก (เช่นเม่น/ผีเสื้อหรือทีเร็กซ์ start ทำให้ครองเมต้า) **หยุดรายงาน user พร้อมตัวเลข อย่าจูนเอง**
- [ ] **Step 3:** `node scripts/passive-power-sim.mjs 1500 1` รันผ่าน (ไม่ crash กับ effect ใหม่)
- [ ] **Step 4:** ดูรีเพลย์โอนิ/ไวรัส/ทีเร็กซ์/กริฟฟินในแล็บ (`D:/RXTU/_replay-lab/` หรือ dev) — แบนเนอร์ง้างขึ้นตาแรก · ป้ายชั้นทีเร็กซ์นับขึ้น · ชั้นเชื้อขึ้นทุกตัว
- [ ] **Step 5:** อัปเดต memory `rxtu10_pet_balance_pass.md` + handoff (commit ล่าสุด · ยังไม่ push · ผลเมต้าซิมจริง)
