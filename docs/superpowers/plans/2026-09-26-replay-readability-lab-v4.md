# รีเพลย์อ่านทัน + ห้องเทียบ v4 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** ใส่ "ปุ่มจูน" ความอ่านง่าย + การกระจายเวลาหมัด (`hitSpread`) ลงโค้ดรีเพลย์จริงโดยค่าดีฟอลต์ = พฤติกรรมเดิมเป๊ะ แล้ว build ห้องเทียบ v4 เป็น artifact ให้ user เลือกค่าและหาตัวการกระตุกบน iPhone

**Architecture:** ค่าจูนทุกตัวไหลเข้า `BattleReplay` ผ่าน `data.tuning` (object เดียว ไม่ส่ง = ของเดิม) · เวลาไปที่ `buildBeats(..., { hitSpread })` ใน `battleBeats.js` (ฟังก์ชันเดียวที่ตัดสินเวลา) · หน้าตาหลอดใช้ CSS custom property ที่มี fallback = ค่าเดิม ห้องแล็บตั้งค่าบน `body` · ห้องแล็บเป็นซอร์สนอก repo (`D:/RXTU/_replay-lab/`) ก๊อปเข้ามา build แล้วลบออก

**Tech Stack:** Vue 3 `<script setup>` · Vite · node:test · Artifact publish (files)

**Spec:** `docs/superpowers/specs/2026-09-26-replay-readability-smoothness-design.md`

## Global Constraints

- branch `replay-smooth-1` · ⛔ ห้าม push (user ยังไม่สั่ง)
- ไม่ส่ง `data.tuning` = พฤติกรรม/หน้าตาเดิม 100% (production ไม่เปลี่ยนในแผนนี้)
- ความยาวไฟต์รวมเมื่อ `hitSpread>0` ต้องเท่า `hitSpread=0` (±1ms ต่อไฟต์)
- `kind` คุมเวลา / `weight` คุมความดัง — `hitSpread` อ่าน `weight` เพื่อกระจายเวลา **ภายใน kind `hit` เท่านั้น** ไม่เปลี่ยน `kind`
- อนิเมชันใหม่ใช้ transform/opacity เท่านั้น · ห้าม backdrop-filter/blur · ห้ามเพิ่ม will-change ถาวร
- สีธีมเว็บห้ามลามเข้า BattleReplay
- ไฟล์ห้องแล็บ (`src/devlab/*`, `vite.lab.config.js`) ห้าม commit — ลบออกจาก repo หลัง build
- artifact ≤255 ไฟล์ · URL เดิม `https://claude.ai/artifact/AgpVu7S3FrrYT2TM6dw7dZ`
- เทสทั้งชุด: `node --test src/utils/*.test.js src/data/*.test.js` · build: `npm run build`

---

### Task 1: `hitSpread` ใน battleBeats

**Files:**
- Modify: `src/utils/battleBeats.js` (บล็อกค่าจูนบรรทัด ~20-45 · `buildBeats` บรรทัด 142 · ก่อน `return` บรรทัด ~326)
- Test: `src/utils/battleBeats.test.js` (ต่อท้ายไฟล์)

**Interfaces:**
- Produces: `export const HIT_SPREAD = 0` · `export const HIT_MIN_MULT = 0.55` · `export function spreadHits(beats, s)` (คืน array ใหม่ ไม่แก้ของเดิม) · `buildBeats(log, maxHp, { rng, showPets, hitSpread })` — `hitSpread` undefined ⇒ `HIT_SPREAD` · beat kind `hit` ได้ฟิลด์ `hitMult` (1 เมื่อ s=0)

สูตร: ในไฟต์หนึ่ง ให้ `W` = ค่าเฉลี่ย `weight` ของ beat kind `hit` · `m_i = (1 - s) + s * (w_i / W)` · clamp ล่าง `HIT_MIN_MULT` · แล้วสเกลทั้งชุด `m_i *= N / Σm` ให้ผลรวมเท่าเดิมเป๊ะ · `W === 0` หรือ `s <= 0` ⇒ m = 1 ทุกตัว · `timing = phasesOf(BEAT * m, SHAPE.hit)`

- [ ] **Step 1: เขียนเทสที่ fail** — ต่อท้าย `battleBeats.test.js` (เพิ่ม `spreadHits, HIT_SPREAD` ใน import บรรทัดบน)

```js
// ── hitSpread: หมัดหนักยาว หมัดเบาสั้น ความยาวรวมเท่าเดิม ──────────────
const realFight = (seed) => {
  const mk = ids => ids.map(id => ({ id, grade: 3, passiveLv: 3 }))
  const r = simulateBattle(mk(['virus', 'wolf', 'shark']), mk(['panda', 'seal', 'owl']), seed)
  const mh = {}
  for (const e of r.log) {
    if (e.t === 'attack' && e.target && !(e.target in mh)) mh[e.target] = (e.targetHpAfter || 0) + (e.dmg || 0)
  }
  return { log: r.log, mh }
}

test('HIT_SPREAD ดีฟอลต์ = 0 ⇒ ทุกหมัดปกติยาว BEAT เท่าเดิม', () => {
  assert.equal(HIT_SPREAD, 0)
  const { log, mh } = realFight(424242)
  for (const b of buildBeats(log, mh)) {
    if (b.kind === 'hit') assert.equal(Math.round(beatDuration(b)), BEAT)
  }
})

test('hitSpread: ความยาวไฟต์รวมเท่า s=0 (±1ms) ทุก seed', () => {
  for (let seed = 1; seed <= 40; seed++) {
    const { log, mh } = realFight(seed * 7919)
    const base = totalDuration(buildBeats(log, mh, { hitSpread: 0 }))
    for (const s of [0.3, 0.6, 1]) {
      const got = totalDuration(buildBeats(log, mh, { hitSpread: s }))
      assert.ok(Math.abs(got - base) <= 1, `seed ${seed} s=${s}: ${got} vs ${base}`)
    }
  }
})

test('hitSpread: หมัด weight มากกว่า ได้เวลามากกว่า · ไม่มีหมัดไหนต่ำกว่า HIT_MIN_MULT มากเกิน', () => {
  const { log, mh } = realFight(424242)
  const hits = buildBeats(log, mh, { hitSpread: 0.6 }).filter(b => b.kind === 'hit')
  const sorted = [...hits].sort((a, b) => a.weight - b.weight)
  assert.ok(beatDuration(sorted[sorted.length - 1]) > beatDuration(sorted[0]))
  for (const b of hits) assert.ok(b.hitMult > 0.4, `hitMult ${b.hitMult}`)
})

test('spreadHits: kind อื่นไม่ถูกแตะ · ไม่แก้ array เดิม', () => {
  const beats = [
    { kind: 'hit', weight: 0.1, timing: timingOf('hit') },
    { kind: 'hit', weight: 0.9, timing: timingOf('hit') },
    { kind: 'ko', weight: 1, timing: timingOf('ko') },
  ]
  const snap = JSON.stringify(beats)
  const out = spreadHits(beats, 1)
  assert.equal(JSON.stringify(beats), snap)
  assert.deepEqual(out[2].timing, timingOf('ko'))
  assert.ok(beatDuration(out[1]) > beatDuration(out[0]))
})

test('spreadHits: weight เฉลี่ย 0 (ทุกหมัดเบาหวิว) ⇒ ไม่หารศูนย์ ทุกหมัดเท่าเดิม', () => {
  const beats = [{ kind: 'hit', weight: 0, timing: timingOf('hit') }, { kind: 'hit', weight: 0, timing: timingOf('hit') }]
  for (const b of spreadHits(beats, 1)) assert.equal(Math.round(beatDuration(b)), BEAT)
})
```

- [ ] **Step 2: รันให้เห็นว่า fail**

Run: `node --test src/utils/battleBeats.test.js`
Expected: FAIL — `spreadHits` / `HIT_SPREAD` ไม่ได้ export

- [ ] **Step 3: เขียนโค้ด** — ใน `battleBeats.js`

ใต้ `SKILL_SHOW_MS` เพิ่ม:

```js
/** กระจายเวลาหมัดปกติตามความแรง (0 = ทุกหมัดยาว BEAT เท่ากัน) — ความยาวไฟต์รวมเท่าเดิมเสมอ
 *  user: "เร็วจนตามไม่ทันว่าเลือดลด แต่ไม่อยากให้ยาน" (26 ก.ย. 2026) ⇒ เอาเวลาจากหมัดเบาไปให้หมัดหนัก
 *  อ่าน weight เพื่อ "แบ่ง" เวลาภายใน kind hit เท่านั้น — kind ยังเป็นตัวตัดสินว่าได้เวลาแบบไหน */
export const HIT_SPREAD = 0
/** หมัดเบาสุดยังต้องเหลืออย่างน้อยเท่านี้ของ BEAT — ต่ำกว่านี้การ์ดพุ่งไม่ทันเห็น */
export const HIT_MIN_MULT = 0.55
```

เหนือ `export function shuffleOpening` เพิ่ม:

```js
/** แบ่งเวลาของหมัดปกติใหม่ตาม weight — ผลรวมเวลาของหมัดปกติทั้งไฟต์เท่าเดิมเป๊ะ (ไม่แก้ array เดิม) */
export function spreadHits(beats, s) {
  const hits = beats.filter(b => b.kind === 'hit')
  const W = hits.reduce((sum, b) => sum + (b.weight || 0), 0) / (hits.length || 1)
  if (!(s > 0) || !(W > 0)) return beats.map(b => (b.kind === 'hit' ? { ...b, hitMult: 1 } : b))
  const raw = new Map()
  for (const b of hits) raw.set(b, Math.max(HIT_MIN_MULT, (1 - s) + s * ((b.weight || 0) / W)))
  const k = hits.length / [...raw.values()].reduce((a, v) => a + v, 0)
  return beats.map(b => {
    if (b.kind !== 'hit') return b
    const m = raw.get(b) * k
    return { ...b, hitMult: m, timing: phasesOf(BEAT * m, SHAPE.hit) }
  })
}
```

แก้ `buildBeats` signature และ return:

```js
export function buildBeats(log, maxHpByUid, { rng = null, showPets = null, hitSpread = HIT_SPREAD } = {}) {
```

```js
  const spread = spreadHits(out, hitSpread)
  return rng ? shuffleOpening(spread, openCut, rng) : spread
```

(`shuffleOpening` ย้ายแค่ก้อนก่อน `openCut` ซึ่งไม่มี kind `hit` ⇒ ลำดับ spread → shuffle ปลอดภัย)

- [ ] **Step 4: รันเทสให้ผ่าน**

Run: `node --test src/utils/battleBeats.test.js`
Expected: PASS ทั้งไฟล์ (เทสเดิมยังผ่าน เพราะดีฟอลต์ 0 และ hitMult เป็นฟิลด์เพิ่ม)

ถ้าเทสเดิมตัวไหนใช้ `deepEqual` กับ beat ทั้งก้อนแล้วแตกเพราะ `hitMult` ⇒ ให้ `spreadHits` ข้ามการใส่ `hitMult` เมื่อ s=0 (คืน `beats` ตรงๆ) และแก้เทส Task นี้ที่อ่าน `hitMult` ให้ใช้ `b.hitMult ?? 1`

- [ ] **Step 5: รันเทสทั้งชุด**

Run: `node --test src/utils/*.test.js src/data/*.test.js`
Expected: PASS ทั้งหมด (~1260)

- [ ] **Step 6: Commit**

```bash
git add src/utils/battleBeats.js src/utils/battleBeats.test.js
git commit -m "Beats: hitSpread กระจายเวลาหมัดปกติตามความแรง ความยาวไฟต์รวมเท่าเดิม (ดีฟอลต์ 0 = ของเดิม)"
```

---

### Task 2: `data.tuning` → BattleReplay (เวลา + หลอดเลือด)

**Files:**
- Modify: `src/components/battle/BattleReplay.vue` — `beats` computed (บรรทัด ~446) · CSS `.br-hp` / `.br-hp-ghost` (บรรทัด ~1193-1199) · `labTag` (บรรทัด ~1045)

**Interfaces:**
- Consumes: `buildBeats(..., { hitSpread })` จาก Task 1
- Produces: `props.data.tuning` = `{ hitSpread?: number, hpTick?: 'snap'|'count'|'flash', skillMark?: 'dot'|'lit' }` · CSS vars ที่ห้องแล็บตั้งบน `body`: `--br-hp-h` (7px) · `--br-ghost-bg` (#fff) · `--br-ghost-op` (.75) · `--br-ghost-dur` (.45s) · `--br-ghost-delay` (.16s)

- [ ] **Step 1: ส่ง hitSpread** — แทนบรรทัด `const beats = computed(...)`

```js
// data.tuning = ปุ่มจูนจากห้องแล็บ (ไม่ส่ง = ของเดิมทุกอย่าง) — ดู spec 2026-09-26 readability
const tuning = computed(() => props.data?.tuning || {})
const beats = computed(() => buildBeats(rawLog.value, maxHp, {
  rng: Math.random, showPets: LEGEND_SHOW,
  ...(typeof tuning.value.hitSpread === 'number' ? { hitSpread: tuning.value.hitSpread } : {}),
}))
```

- [ ] **Step 2: CSS หลอด** — แก้สองกฎ (fallback = ค่าเดิมเป๊ะ)

```css
.br-hp { position: relative; width: 84%; height: var(--br-hp-h, 7px); background: rgba(0,0,0,.35); border-radius: 999px; overflow: hidden; }
```

```css
.br-hp-ghost { position: absolute; inset: 0; background: var(--br-ghost-bg, #fff); opacity: var(--br-ghost-op, .75); border-radius: 999px;
  transform-origin: left center; transition: transform var(--br-ghost-dur, .45s) ease-out var(--br-ghost-delay, .16s); }
```

- [ ] **Step 3: ป้ายแล็บบอก hitSpread** — อ่าน `labTag` computed ที่บรรทัด ~1045 แล้วต่อท้ายสตริงที่มันคืน:

```js
  + (typeof tuning.value.hitSpread === 'number' ? ` · กระจาย ${tuning.value.hitSpread}` : '')
```

(ถ้า `labTag` คืนผ่านหลายทาง ให้ต่อที่ทุก return — ป้ายนี้โผล่เฉพาะ `showFps`)

- [ ] **Step 4: build + เทส**

Run: `npm run build && node --test src/utils/*.test.js src/data/*.test.js`
Expected: build สำเร็จ · เทสผ่านทั้งหมด

- [ ] **Step 5: Commit**

```bash
git add src/components/battle/BattleReplay.vue
git commit -m "Replay: รับ data.tuning (hitSpread) + หลอดเลือด/หลอดผีจูนผ่าน CSS var (ดีฟอลต์ = ของเดิม)"
```

---

### Task 3: เลข HP ไล่นับ/กระพริบ + ไอคอนสกิลติดไฟ

**Files:**
- Modify: `src/components/battle/BattleReplay.vue` — template `.br-stats`/`.br-skill-dot` ทั้งสองทีม (บรรทัด ~48, 61, 71, 84) · `curHp` (บรรทัด ~407) · `applyImpact` (บรรทัด ~816) · กิ่ง `e.kind === 'skill'` + `spotlightPassive` (บรรทัด ~654, ~700) · `reset` (บรรทัด ~528) · CSS ใกล้ `.br-hpn` (~1202) และ `.br-skill-dot` (~1340)

**Interfaces:**
- Consumes: `tuning` computed จาก Task 2
- Produces: `tuning.hpTick` — `'snap'` (ดีฟอลต์ = ของเดิม) · `'flash'` = ชิปเลข HP เด้ง+วงแดงจางตอนโดน · `'count'` = flash + ตัวเลขไล่ลงใน 350ms · `tuning.skillMark` — `'dot'` (ดีฟอลต์) · `'lit'` = ไอคอนมุมการ์ดขยายขึ้นเมื่อสกิลโปรกครั้งแรก + ตัวนับ `×N`

🔒 กฎ v3: เลข HP เปลี่ยนตอน impact อยู่แล้วในของเดิม (ก่อนอนิเมชันการ์ดเป้า 1 เฟรม) — `count` จะเขียนข้อความทุกเฟรม 350ms บนการ์ดที่ promote ⇒ **นี่คือตัวที่ต้องวัดในแล็บ** ถ้าแพงค่อยตัดทิ้งเหลือ `flash`

- [ ] **Step 1: state + ตัวนับ** — ใต้ `function curHp`

```js
// ── เลข HP: snap (เดิม) / flash / count — tuning.hpTick ──
const hpShown = ref({})          // uid → HP ที่โชว์ระหว่างไล่นับ (ไม่มี = ใช้ curHp ตรงๆ)
const hpHit = ref({})            // uid → true ช่วงกระพริบ
const hpAnims = new Map()        // uid → rAF id
function shownHp(uid) { return hpShown.value[uid] ?? curHp(uid) }
function tickHp(uid, from) {
  const mode = tuning.value.hpTick || 'snap'
  if (mode === 'snap') return
  hpHit.value = { ...hpHit.value, [uid]: true }
  later(() => { hpHit.value = { ...hpHit.value, [uid]: false } }, 320)
  if (mode !== 'count') return
  cancelAnimationFrame(hpAnims.get(uid))
  const to = curHp(uid), t0 = performance.now(), DUR = 350
  const step = (now) => {
    const k = Math.min(1, (now - t0) / DUR)
    const v = Math.round(from + (to - from) * (1 - (1 - k) * (1 - k)))
    if (hpShown.value[uid] !== v) hpShown.value = { ...hpShown.value, [uid]: v }
    if (k < 1) hpAnims.set(uid, requestAnimationFrame(step))
    else { const n = { ...hpShown.value }; delete n[uid]; hpShown.value = n; hpAnims.delete(uid) }
  }
  hpAnims.set(uid, requestAnimationFrame(step))
}
function clearHpTicks() { hpAnims.forEach(id => cancelAnimationFrame(id)); hpAnims.clear(); hpShown.value = {}; hpHit.value = {} }
```

- [ ] **Step 2: เรียกตอนโดน** — ใน `applyImpact` แทนบรรทัด `hp.value = { ...hp.value, [beat.target]: ... }`

```js
  const hpBefore = curHp(beat.target)
  hp.value = { ...hp.value, [beat.target]: Math.max(0, Math.round((beat.targetHpAfter / (maxHp[beat.target] || 1)) * 100)) }
  tickHp(beat.target, hpBefore)
```

และใน `reset` (ฟังก์ชันที่มีบรรทัด `hp.value = h` ~528) เพิ่ม `clearHpTicks()` ข้างๆ

- [ ] **Step 3: template เลข HP** — ทั้งสองทีม (แทน `B`/`A` ตามทีม)

```html
<span class="br-hpn foe" :class="{ hit: hpHit['B'+i] }">{{ shownHp('B'+i) }}</span>
```

```html
<span class="br-hpn me" :class="{ hit: hpHit['A'+i] }">{{ shownHp('A'+i) }}</span>
```

CSS ใต้ `.br-hpn.me`:

```css
/* tuning.hpTick flash/count — เด้ง + วงแดงจาง (transform/opacity ล้วน) */
.br-hpn { position: relative; }
.br-hpn::after { content: ''; position: absolute; inset: -3px; border-radius: 999px; box-shadow: 0 0 0 2px #fbbf24; opacity: 0; pointer-events: none; }
.br-hpn.hit { animation: br-hpn-pop .32s ease-out; }
.br-hpn.hit::after { animation: br-hpn-ring .32s ease-out; }
@keyframes br-hpn-pop { 0% { transform: scale(1) } 30% { transform: scale(1.28) } 100% { transform: scale(1) } }
@keyframes br-hpn-ring { 0% { opacity: .95; transform: scale(.9) } 100% { opacity: 0; transform: scale(1.35) } }
```

- [ ] **Step 4: ไอคอนสกิลติดไฟ** — state ใกล้ `chipOn`

```js
// tuning.skillMark 'lit': ไอคอนมุมการ์ดขยาย + ×N เมื่อสกิลของใบนั้นโปรก (ค้างทั้งไฟต์ = อ่านย้อนได้)
const skillCount = ref({})       // uid → จำนวนครั้งที่โปรก
function markSkill(uid) {
  if (tuning.value.skillMark !== 'lit' || !uid) return
  skillCount.value = { ...skillCount.value, [uid]: (skillCount.value[uid] || 0) + 1 }
}
```

เรียก `markSkill(e.uid)` ที่: กิ่ง `if (e.kind === 'skill')` บรรทัดแรก · ใน `spotlightPassive` ตรงที่ `opts.fire(); else firePassiveFx(e)` · กิ่ง skillQuiet (`firePassiveFx(e)` ตัวสุดท้ายของฟังก์ชันเดียวกัน) · `reset` เพิ่ม `skillCount.value = {}`

template ทั้งสองทีม (แทน `B`/`A`):

```html
<span v-if="skillIcon(p)" class="br-skill-dot" :class="{ lit: skillCount['B'+i] }"><Emoji :char="skillIcon(p)" /><i v-if="skillCount['B'+i] > 1">×{{ skillCount['B'+i] }}</i></span>
```

CSS ใต้ `.br-skill-dot`:

```css
/* tuning.skillMark 'lit' — ขนาดคงที่หลังติดไฟ (ไม่วิ่งอนิเมชันระหว่างการ์ดพุ่ง) */
.br-skill-dot.lit { font-size: 1rem; opacity: 1; filter: none; background: rgba(15,23,42,.72); border-radius: 999px; padding: 1px 4px; box-shadow: 0 0 0 1.5px #fbbf24; display: flex; align-items: center; gap: 1px; }
.br-skill-dot i { font-style: normal; font-size: .7rem; font-weight: 800; color: #fde68a; }
```

- [ ] **Step 5: build + เทส**

Run: `npm run build && node --test src/utils/*.test.js src/data/*.test.js`
Expected: build สำเร็จ · เทสผ่าน

- [ ] **Step 6: เช็คดีฟอลต์ไม่เปลี่ยน** — grep ให้แน่ใจว่าทุกทางใหม่มี guard

Run: `grep -n "hpTick\|skillMark" src/components/battle/BattleReplay.vue`
Expected: `tickHp` return ทันทีเมื่อ `'snap'` · `markSkill` return เมื่อไม่ใช่ `'lit'` ⇒ ไม่ส่ง tuning = DOM/พฤติกรรมเดิม

- [ ] **Step 7: Commit**

```bash
git add src/components/battle/BattleReplay.vue
git commit -m "Replay: tuning.hpTick (flash/count) + tuning.skillMark lit — ดีฟอลต์ = ของเดิม รอเลือกในห้องเทียบ v4"
```

---

### Task 4: ห้องเทียบ v4 + publish

**Files:**
- Modify (นอก repo): `D:/RXTU/_replay-lab/lab.js` · `D:/RXTU/_replay-lab/lab.css`
- ชั่วคราวใน repo (ห้าม commit): `src/devlab/lab.js` · `src/devlab/lab.css` · `vite.lab.config.js`

**Interfaces:**
- Consumes: `data.tuning` + CSS vars จาก Task 2-3 · `simulateBattle(A, B, seed)` · สวิตช์กราฟิก body class เดิม (`lab-nofloor` `lab-noanim` `lab-plainpop` `lab-nocut`) + `writePrefs({ fx })` + `setSfxOn`

- [ ] **Step 1: เพิ่มค่าอ่านง่าย + พรีเซ็ตใน `lab.js`** — ใต้ `SWITCHES`

```js
// ── แผงอ่านง่าย (A) + จังหวะ (B) ──
const READ = {
  hpH:   { t: 'ความสูงหลอดเลือด', opts: [['7px', '7 (เดิม)'], ['9px', '9'], ['11px', '11']] },
  ghost: { t: 'ช่องเสียเลือด', opts: [['white', 'ขาวจาง (เดิม)'], ['amber', 'เหลืองส้ม']] },
  hold:  { t: 'ช่องเสียเลือดค้าง', opts: [['.45s', '0.45 วิ (เดิม)'], ['.8s', '0.8 วิ']] },
  hpTick:{ t: 'เลข HP บนการ์ด', opts: [['snap', 'เปลี่ยนทันที (เดิม)'], ['flash', 'เด้ง'], ['count', 'ไล่นับ + เด้ง']] },
  skillMark: { t: 'ไอคอนสกิลมุมการ์ด', opts: [['dot', 'จุดเล็ก (เดิม)'], ['lit', 'ติดไฟ + ×N']] },
}
const NOW = { hpH: '7px', ghost: 'white', hold: '.45s', hpTick: 'snap', skillMark: 'dot', spread: 0 }
const REC = { hpH: '11px', ghost: 'amber', hold: '.8s', hpTick: 'count', skillMark: 'lit', spread: 0.6 }
```

เพิ่มใน `st`: `rd: { ...NOW }` · ฟังก์ชัน:

```js
function applyRead() {
  const s = document.body.style, r = st.rd
  s.setProperty('--br-hp-h', r.hpH)
  s.setProperty('--br-ghost-bg', r.ghost === 'amber' ? '#fbbf24' : '#fff')
  s.setProperty('--br-ghost-op', r.ghost === 'amber' ? '1' : '.75')
  s.setProperty('--br-ghost-dur', r.hold)
  s.setProperty('--br-ghost-delay', r.hold === '.8s' ? '.22s' : '.16s')
}
const preset = (p) => { st.rd = { ...p } }
```

ใน `start()` เรียก `applyRead()` และเพิ่มใน `data.value`: `tuning: { hitSpread: st.rd.spread, hpTick: st.rd.hpTick, skillMark: st.rd.skillMark }` · `tagOf()` ต่อท้ายด้วยสรุปค่าอ่านง่าย (`hp ${hpH} · ${ghost} ${hold} · ${hpTick} · ${skillMark} · กระจาย ${spread}`) เพื่อให้ตาราง fps บอกว่ารอบนั้นใช้ค่าอะไร

- [ ] **Step 2: ความยาวไฟต์สด** — import `buildBeats, totalDuration` จาก `../utils/battleBeats.js` แล้วคำนวณจากไฟต์ทีมหลัก seed 424242 (maxHp แบบเดียวกับเทส Task 1) ทุกครั้งที่สไลเดอร์ขยับ แสดง `ยาว X.X วิ (เดิม Y.Y วิ)` ใต้สไลเดอร์

- [ ] **Step 3: UI สามแผง** ใน `Panel` เรียง: หัว → ลำดับที่แนะนำ (ใหม่) → ทีม → **แผงอ่านง่าย** (ปุ่ม "ตอนนี้"/"แนะนำ" + segmented ต่อแถวจาก `READ`) → **แผงจังหวะ** (`<input type=range min=0 max=1 step=0.1>` + ความยาว) → **แผงกราฟิก** (สวิตช์เดิม) → เริ่มไฟต์ → ตารางผล

ลำดับที่แนะนำ (ข้อความในหน้า):
1. กด "ตอนนี้" แล้วเล่น 1 รอบ แล้วกด "แนะนำ" เล่นอีกรอบ — เทียบความรู้สึกตามเลือดทัน
2. ปรับทีละแถวจนพอใจ แล้วแคปจอค่าส่งผม
3. แผงกราฟิก: "ปิดทั้งหมด" เล่น 1 รอบ → เปิดทีละตัว ตัวไหนเปิดแล้ว `<30fps` กระโดด = ตัวการ

segmented ใช้คลาส `.lab-seg` ที่มีอยู่แล้วใน `lab.css` · เพิ่ม CSS:

```css
.lab-row { display: grid; gap: 5px; margin-bottom: 10px; }
.lab-row > span { font-size: .78rem; color: #cbd5e1; }
.lab-range { width: 100%; accent-color: #fbbf24; }
.lab-len { font-size: .78rem; color: #fde68a; font-variant-numeric: tabular-nums; }
```

และแก้หัวเป็น `'RxTU10 · ห้องเทียบรีเพลย์ · v4'`

- [ ] **Step 4: build** (ตามสูตรใน memory)

```bash
cd /d/RXTU/rxtu10-v2
mkdir -p src/devlab && cp ../_replay-lab/lab.js ../_replay-lab/lab.css src/devlab/ && cp ../_replay-lab/vite.lab.config.js .
OUT="$TMP_SCRATCH/lab-v4"   # scratchpad ของเซสชัน
LAB_OUT="$OUT" npx vite build --config vite.lab.config.js
node ../_replay-lab/collect-emoji.mjs "$OUT"
cp ../_replay-lab/artifact-index.html "$OUT/index.html"
rm -rf src/devlab vite.lab.config.js
git status --short   # ต้องว่าง (ไม่มีไฟล์แล็บค้าง)
ls -R "$OUT" | wc -l # จำนวนไฟล์ ≤255
```

- [ ] **Step 5: เช็คในเบราว์เซอร์** — เปิด `$OUT/index.html` ผ่าน `npx vite preview`/static server + Chrome extension: กด "แนะนำ" → เริ่มไฟต์ → เห็นหลอดหนา ช่องส้ม เลขเด้ง ไอคอนติดไฟ ×N ป้าย lab-tag มี "กระจาย 0.6" · กด "ตอนนี้" → หน้าตาเหมือนของเดิม · console ไม่มี error (fps ใน Chrome ไม่ใช้ตัดสิน)

- [ ] **Step 6: publish ทับ URL เดิม** — Artifact publish `url: https://claude.ai/artifact/AgpVu7S3FrrYT2TM6dw7dZ` · `file_path: $OUT/index.html` · `files` = ทุกไฟล์อื่นใน `$OUT` (path สัมพัทธ์) · อ่าน index.html ก่อน publish

- [ ] **Step 7: อัปเดต memory** `rxtu10_replay_smoothness_review.md` — v4 publish แล้ว · commit ของ Task 1-3 · รอผล user
