# รับรางวัลซีซั่นในหน้าโหมด — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** รางวัลซีซั่นขั้นใหม่ + กดรับในหน้าหอคอย/อารีน่าพร้อมอนิเมชัน (spec `docs/superpowers/specs/2026-09-28-season-claim-design.md`)

**Architecture:** ยังเขียนจดหมายลง `users/{uid}/mail` เหมือนเดิม แต่ติด `kind:'season'`+`mode` · กล่องจดหมายซ่อนจดหมายพวกนี้ · หน้าโหมดอ่านจาก store กล่องจดหมาย (cache) แล้วโชว์แบนเนอร์ + overlay อนิเมชัน · กดรับด้วย `mailbox.claim(id)` ตัวเดิม

**Tech Stack:** Vue 3 `<script setup>` + Pinia + Firestore · เทส `node --test`

## Global Constraints
- ⛔ ห้าม push — commit ในเครื่องเท่านั้น (user สั่งเอง)
- ไม่แก้ `firestore.rules`
- overlay fixed ต้อง `<Teleport to="body">` (CLAUDE.md ข้อ 6)
- หัวข้อจดหมายห้ามมีอีโมจิ (tofu) · อีโมจิบนจอใช้ `<Emoji :char>` (`src/components/shared/Emoji.vue`)
- ต้อง `prefers-reduced-motion` = ไม่มีอนิเมชัน
- โทนภาษาตาม `docs/voice-guide.md`

---

### Task 1: รางวัลขั้นใหม่ใน `seasonRewards.js`

**Files:**
- Modify: `src/utils/seasonRewards.js` (ทั้งไฟล์)
- Test: `src/utils/seasonRewards.test.js` (เขียนใหม่ทั้งไฟล์ — เทสเดิมผูกกับกติกาเก่า)

**Interfaces:**
- Produces:
  - `TOWER_TIERS: [{min, coins, tickets, lv, name}]` เรียงชั้นน้อย→มาก
  - `ARENA_TIERS: [{maxRank, coins, tickets, lv, name, champ, ach}]` เรียงอันดับ 1→11+
  - `towerTier(best) → tier|null` · `arenaTier(rank) → tier`
  - `computeSeasonRewards(users, season) → [{uid, nickname, tower?:{best, tier}, arena?:{rating,wins,losses,rank,tier}}]`
  - `seasonRewardMails(r, season, monthLabel) → [mailInput]` แต่ละใบมี `kind:'season'`, `mode`, `season`, `tier:{lv, name, best?|rank?, rating?}`

- [ ] **Step 1: เขียนเทสใหม่ (แทนไฟล์เดิม)**

```js
// เทส seasonRewards — pure · รัน: node --test src/utils/seasonRewards.test.js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { computeSeasonRewards, seasonRewardMails, towerTier, arenaTier } from './seasonRewards.js'

const S = '2026-09'
const tw = (uid, towerBest) => ({ uid, towerBest })
const pv = (uid, rating) => ({ uid, pvp: { seasonId: S, rating, wins: 1, losses: 0 } })

test('หอคอย: ขอบขั้น', () => {
  assert.equal(towerTier(0), null)
  assert.deepEqual([1, 19, 20, 39, 40, 59, 60, 79, 80, 99, 100].map(b => towerTier(b).coins),
    [10000, 10000, 15000, 15000, 20000, 20000, 25000, 25000, 30000, 30000, 35000])
  assert.deepEqual([19, 20, 100].map(b => towerTier(b).tickets), [5, 10, 30])
  assert.deepEqual([19, 59, 79, 99, 100].map(b => towerTier(b).lv), [1, 2, 2, 3, 4])
})

test('หอคอย: ไม่ดูอันดับ · achievement เฉพาะชั้น 100', () => {
  const r = computeSeasonRewards([tw('a', 0), tw('b', 100), tw('c', 100), tw('d', 99)], S)
  assert.equal(r.find(x => x.uid === 'a'), undefined)
  const mail = (uid) => seasonRewardMails(r.find(x => x.uid === uid), S, 'ก.ย.')[0]
  assert.deepEqual(mail('b').achievement, { id: 'tower_champ', date: S })
  assert.deepEqual(mail('c').achievement, { id: 'tower_champ', date: S })
  assert.equal(mail('d').achievement, undefined)
  assert.equal(mail('d').coins, 30000)
  assert.equal(mail('d').tickets, 25)
})

test('อารีน่า: ขั้นตามอันดับ', () => {
  assert.deepEqual([1, 2, 3, 4, 10, 11, 40].map(k => arenaTier(k).coins),
    [45000, 40000, 35000, 25000, 25000, 20000, 20000])
  assert.deepEqual([1, 2, 3, 4, 11].map(k => arenaTier(k).tickets), [35, 30, 25, 20, 15])
  assert.deepEqual([1, 3, 4, 10, 11].map(k => arenaTier(k).champ), [true, true, true, true, false])
  assert.deepEqual([3, 4].map(k => arenaTier(k).ach), [true, false])
})

test('อารีน่า: ใช้ผลจาก last · ไม่เคยบุก/คนละซีซั่น = ไม่ได้', () => {
  const users = [
    { uid: 'now', pvp: { seasonId: S, rating: 1200, wins: 2, losses: 1 } },
    { uid: 'moved', pvp: { seasonId: '2026-10', rating: 1050, wins: 1, losses: 0, last: { seasonId: S, rating: 1300, wins: 5, losses: 0 } } },
    { uid: 'idle', pvp: { seasonId: S, rating: 1000, wins: 0, losses: 0 } },
    { uid: 'old', pvp: { seasonId: '2026-08', rating: 1500, wins: 9, losses: 0 } },
  ]
  const r = computeSeasonRewards(users, S)
  assert.deepEqual(r.map(x => x.uid).sort(), ['moved', 'now'])
  assert.equal(r.find(x => x.uid === 'moved').arena.rank, 1)
})

test('อารีน่า: เสมอที่อันดับ 3 ได้ขั้น 3 ทั้งคู่ · เสมอที่ 10 ได้สนามทั้งคู่', () => {
  const users = [...Array(12)].map((_, i) => pv('u' + i, 2000 - i * 10))
  users.push(pv('t3', 1980), pv('t10', 1910))
  const r = computeSeasonRewards(users, S)
  const rk = (uid) => r.find(x => x.uid === uid).arena
  assert.equal(rk('t3').rank, 3); assert.equal(rk('t3').tier.coins, 35000)
  assert.equal(rk('t10').rank, 11)   // มี t3 แทรก → u9 กับ t10 = อันดับ 11
})

test('จดหมาย: ติด kind/mode/season/tier · สนามแชมป์ต้องอยู่ในทะเบียน', () => {
  const [t] = seasonRewardMails({ tower: { best: 45, tier: towerTier(45) } }, S, 'ก.ย.')
  assert.equal(t.kind, 'season'); assert.equal(t.mode, 'tower'); assert.equal(t.season, S)
  assert.deepEqual(t.tier, { lv: 2, name: towerTier(45).name, best: 45 })
  const [a] = seasonRewardMails({ arena: { rating: 2000, wins: 5, losses: 0, rank: 1, tier: arenaTier(1) } }, S, 'ก.ย.')
  assert.equal(a.mode, 'arena'); assert.equal(a.coins, 45000); assert.equal(a.tickets, 35)
  assert.deepEqual(a.achievement, { id: 'arena_champ', date: S })
  assert.deepEqual(a.arena, { id: 'ch-2026-09', rank: 1 })
  const [z] = seasonRewardMails({ arena: { rating: 2000, wins: 5, losses: 0, rank: 1, tier: arenaTier(1) } }, '2020-01', 'ม.ค.')
  assert.equal(z.arena, undefined)
  for (const m of [t, a]) assert.ok(!/\p{Extended_Pictographic}/u.test(m.title))
})
```

- [ ] **Step 2: รันให้ fail** — `node --test src/utils/seasonRewards.test.js` → FAIL (`towerTier` ไม่มี)

- [ ] **Step 3: เขียน `seasonRewards.js` ใหม่**

```js
// ════════════════════════════════════════════════════════════
//  seasonRewards — pure: คำนวณรางวัลสิ้นซีซั่น (หอคอย + อารีน่า) จาก user doc ดิบ
//  แอดมินกดแจกใน AdminView → จดหมาย kind:'season' (กดรับในหน้าหอคอย/อารีน่า ไม่โชว์ในกล่องจดหมาย)
//  user เคาะ 28 ก.ย. 2026: หอคอยแจกตามชั้น (ไม่ดูอันดับ) · อารีน่าทุกคนได้ตั๋ว คงขั้นอันดับ 1/2/3
//  อันดับเท่ากัน = อันดับเดียวกัน · ไม่ import Firestore
// ════════════════════════════════════════════════════════════
import { pvpOfSeason } from './pvpSeason.js'
import { getArena } from '../data/arenas.js'

export const TOWER_TIERS = [
  { min: 1,   coins: 10000, tickets: 5,  lv: 1, name: 'ชั้น 1–19' },
  { min: 20,  coins: 15000, tickets: 10, lv: 1, name: 'ชั้น 20–39' },
  { min: 40,  coins: 20000, tickets: 15, lv: 2, name: 'ชั้น 40–59' },
  { min: 60,  coins: 25000, tickets: 20, lv: 2, name: 'ชั้น 60–79' },
  { min: 80,  coins: 30000, tickets: 25, lv: 3, name: 'ชั้น 80–99' },
  { min: 100, coins: 35000, tickets: 30, lv: 4, name: 'พิชิตชั้น 100', ach: 'tower_champ' },
]
export const ARENA_TIERS = [
  { maxRank: 1,        coins: 45000, tickets: 35, lv: 4, name: 'แชมป์ซีซั่น', champ: true, ach: true },
  { maxRank: 2,        coins: 40000, tickets: 30, lv: 3, name: 'อันดับ 2',    champ: true, ach: true },
  { maxRank: 3,        coins: 35000, tickets: 25, lv: 3, name: 'อันดับ 3',    champ: true, ach: true },
  { maxRank: 10,       coins: 25000, tickets: 20, lv: 2, name: 'ท็อป 10',     champ: true, ach: false },
  { maxRank: Infinity, coins: 20000, tickets: 15, lv: 1, name: 'นักประลอง',   champ: false, ach: false },
]

export function towerTier(best) {
  if (!(best > 0)) return null
  return [...TOWER_TIERS].reverse().find(t => best >= t.min)
}
export function arenaTier(rank) {
  return ARENA_TIERS.find(t => rank <= t.maxRank)
}

/**
 * users: [{ uid, nickname, towerBest, pvp }] (อ่านจาก users collection ตรงๆ ไม่ใช่ roster
 *        เพราะแถว roster ถูกรีซีซั่นทับตั้งแต่มีคนเปิดเว็บวันที่ 1)
 * คืนเฉพาะคนที่ได้อะไรสักอย่าง
 */
export function computeSeasonRewards(users, season) {
  const list = (users || []).filter(u => u?.uid)
  const arenaIn = list
    .map(u => ({ u, p: pvpOfSeason(u.pvp, season) }))
    .filter(x => x.p && ((x.p.wins || 0) + (x.p.losses || 0)) > 0)
  const aScores = arenaIn.map(x => x.p.rating || 0)

  const out = new Map()
  const row = (u) => {
    if (!out.has(u.uid)) out.set(u.uid, { uid: u.uid, nickname: u.nickname || '?' })
    return out.get(u.uid)
  }
  for (const u of list) {
    const tier = towerTier(u.towerBest || 0)
    if (tier) row(u).tower = { best: u.towerBest, tier }
  }
  for (const { u, p } of arenaIn) {
    const rating = p.rating || 0
    const rank = 1 + aScores.filter(s => s > rating).length   // เท่ากัน = อันดับเดียวกัน
    row(u).arena = { rating, wins: p.wins || 0, losses: p.losses || 0, rank, tier: arenaTier(rank) }
  }
  return [...out.values()]
}

/** จดหมาย (input ของ buildBroadcastMail) ของคนหนึ่ง — หอคอยกับอารีน่าแยกใบ
 *  ⚠️ title ห้ามมีอีโมจิ (render เป็น text → tofu) */
export function seasonRewardMails(r, season, monthLabel) {
  const mails = []
  if (r.tower) {
    const { best, tier } = r.tower
    mails.push({
      kind: 'season', mode: 'tower', season,
      tier: { lv: tier.lv, name: tier.name, best },
      title: `รางวัลหอคอย ซีซั่น ${monthLabel}`,
      body: tier.ach
        ? `พิชิตชั้น 100 ได้ achievement "ผู้ครอบครองหอคอย ซีซั่น ${monthLabel}"`
        : `ซีซั่นนี้ขึ้นไปถึงชั้น ${best} ขอบคุณที่มาไต่ด้วยกัน`,
      coins: tier.coins, tickets: tier.tickets,
      achievement: tier.ach ? { id: tier.ach, date: season } : undefined,
    })
  }
  if (r.arena) {
    const { rating, wins, losses, rank, tier } = r.arena
    // สนามแชมป์ของซีซั่นต้องอยู่ในทะเบียนก่อน ไม่งั้นไม่แนบ (ยังได้เหรียญ/achievement ตามปกติ)
    const champ = tier.champ && getArena('ch-' + season) ? { id: 'ch-' + season, rank } : undefined
    mails.push({
      kind: 'season', mode: 'arena', season,
      tier: { lv: tier.lv, name: tier.name, rank, rating },
      title: `รางวัลอารีน่า ซีซั่น ${monthLabel}`,
      body: rank <= 10
        ? `จบซีซั่นที่อันดับ ${rank} (${rating.toLocaleString()} แต้ม)${champ ? ' ได้สนามแชมป์ประจำซีซั่น' : ''}`
        : `ซีซั่นนี้ลงสนามไป ${wins + losses} ไฟต์ ขอบคุณที่มาประลองด้วยกัน`,
      coins: tier.coins, tickets: tier.tickets,
      achievement: tier.ach ? { id: 'arena_champ', date: season } : undefined,
      arena: champ,
    })
  }
  return mails
}
```

- [ ] **Step 4: รันให้ pass** — `node --test src/utils/seasonRewards.test.js` → PASS ทั้งหมด (ถ้าเทสเสมอ t10 ผิด ให้แก้ค่าที่คาดในเทสตามการนับอันดับจริง ไม่ใช่แก้ตรรกะ)

- [ ] **Step 5: Commit** `git add src/utils/seasonRewards.js src/utils/seasonRewards.test.js && git commit -m "Season: รางวัลขั้นใหม่ หอคอยตามชั้น อารีน่าทุกคนได้ตั๋ว"`

---

### Task 2: จดหมายซีซั่นผ่าน `buildBroadcastMail` + ซ่อนจากกล่องจดหมาย

**Files:**
- Modify: `src/utils/mailbox.js` (`buildBroadcastMail` บรรทัด ~127, `attentionCount` ~47, เพิ่ม `isSeasonMail`)
- Modify: `src/stores/mailbox.js` (เพิ่ม computed `inbox`, `seasonPending(mode)`)
- Modify: `src/components/home/MailboxCard.vue` (บรรทัด 4, 7: `mailbox.mails` → `mailbox.inbox`)
- Test: `src/utils/mailbox.test.js` (ถ้ามีไฟล์ ให้เพิ่มเทส · ถ้าไม่มี สร้างใหม่)

**Interfaces:**
- Consumes: mail input จาก Task 1 (`kind`, `mode`, `season`, `tier`)
- Produces: `isSeasonMail(mail) → bool` · store: `inbox` (computed, ไม่มี season) · `seasonPending(mode) → mail|null` (ยังไม่ claimed, `createdAt` ใหม่สุด)

- [ ] **Step 1: เทส**

```js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildBroadcastMail, isSeasonMail, attentionCount } from './mailbox.js'

test('buildBroadcastMail: ส่ง kind/mode/season/tier ผ่าน · จดหมายปกติไม่มีฟิลด์พวกนี้', () => {
  const m = buildBroadcastMail({ title: 'x', coins: 5, kind: 'season', mode: 'tower', season: '2026-09', tier: { lv: 1, name: 'ชั้น 1–19', best: 3 } }, 0)
  assert.equal(m.kind, 'season'); assert.equal(m.mode, 'tower'); assert.equal(m.season, '2026-09')
  assert.deepEqual(m.tier, { lv: 1, name: 'ชั้น 1–19', best: 3 })
  const n = buildBroadcastMail({ title: 'y', coins: 5 }, 0)
  assert.ok(!('kind' in n) && !('mode' in n) && !('tier' in n))
})

test('attentionCount ไม่นับจดหมายซีซั่น', () => {
  const season = { kind: 'season', read: false, claimed: false, reward: { coins: 1 } }
  const normal = { read: false, claimed: false }
  assert.equal(isSeasonMail(season), true)
  assert.equal(attentionCount([season, normal]), 1)
})
```

- [ ] **Step 2: รัน** `node --test src/utils/mailbox.test.js` → FAIL

- [ ] **Step 3: แก้ `mailbox.js`**

เพิ่มก่อน `needsAttention`:
```js
// จดหมายรางวัลซีซั่น — กดรับในหน้าหอคอย/อารีน่า ไม่โชว์/ไม่นับในกล่องจดหมาย (client เก่ายังเห็นและรับได้ตามปกติ)
export function isSeasonMail(mail) {
  return mail?.kind === 'season'
}
```
`attentionCount`:
```js
export function attentionCount(mails) {
  return (mails || []).filter(m => !isSeasonMail(m) && needsAttention(m)).length
}
```
`buildBroadcastMail` signature เพิ่ม `kind, mode, season, tier` และใน object ที่คืน ต่อท้าย:
```js
    ...(kind ? { kind } : {}),
    ...(mode ? { mode } : {}),
    ...(season ? { season } : {}),
    ...(tier ? { tier } : {}),
```

- [ ] **Step 4: แก้ store** `src/stores/mailbox.js` — import `isSeasonMail`, เพิ่ม:
```js
  const inbox = computed(() => mails.value.filter(m => !isSeasonMail(m)))
  // mails เรียงใหม่→เก่าแล้ว (orderBy createdAt desc)
  function seasonPending(mode) {
    return mails.value.find(m => isSeasonMail(m) && m.mode === mode && !m.claimed) || null
  }
```
และ `return { mails, inbox, loading, attention, load, markRead, claim, remove, seasonPending }`

- [ ] **Step 5: `MailboxCard.vue`** เปลี่ยน `mailbox.mails` ทั้ง 3 จุดในเทมเพลต (บรรทัด 3, 4, 7) เป็น `mailbox.inbox`

- [ ] **Step 6: รัน** `node --test src/utils/mailbox.test.js src/utils/seasonRewards.test.js` → PASS · `npm run build` → ผ่าน

- [ ] **Step 7: Commit** `git commit -am "Mailbox: จดหมายซีซั่นมีป้าย kind/mode/tier + ซ่อนจากกล่องจดหมาย"` (อย่าลืม `git add src/utils/mailbox.test.js` ถ้าสร้างใหม่)

---

### Task 3: พรีวิว/แจกในแอดมินใช้ขั้นใหม่

**Files:**
- Modify: `src/views/AdminView.vue:659-714` (`previewSeason`, `paySeason`) และเทมเพลตพรีวิว (grep `spPreview`)

**Interfaces:**
- Consumes: `computeSeasonRewards`, `seasonRewardMails` (Task 1) — row มี `tower.tier`, `arena.tier`, `arena.rank`; ไม่มี `tower.top/tickets`, `arena.top/ach` แล้ว

- [ ] **Step 1:** ใน `previewSeason` แทนตัวนับเดิม (`towerTop`, `tickets`, `arenaTop`, `arenaAch`) ด้วย
```js
      towerTiers: countBy(rows.filter(r => r.tower), r => r.tower.tier.name),
      arenaTiers: countBy(rows.filter(r => r.arena), r => r.arena.tier.name),
```
พร้อม helper ในไฟล์:
```js
const countBy = (arr, f) => arr.reduce((m, x) => ((m[f(x)] = (m[f(x)] || 0) + 1), m), {})
```
- [ ] **Step 2:** เทมเพลตพรีวิว: ทุกที่ที่อ้าง `spPreview.towerTop / tickets / arenaTop / arenaAch` และ `r.tower.top`, `r.tower.coins`, `r.arena.top`, `r.arena.coins` ในตาราง → เปลี่ยนเป็นโชว์ `towerTiers`/`arenaTiers` (ชื่อขั้น: จำนวนคน) และในแถว `r.tower.tier.coins`, `r.tower.tier.name`, `r.arena.tier.coins`, `r.arena.tier.name` · grep `\.top\b\|towerTop\|arenaAch\|arenaTop` ใน AdminView ต้องไม่เหลือที่อ้างของเก่า
- [ ] **Step 3:** `paySeason` ไม่ต้องแก้ตรรกะ (ใช้ `seasonRewardMails` → `buildBroadcastMail` ส่งฟิลด์ใหม่ผ่านเองแล้ว)
- [ ] **Step 4:** `npm run build` ผ่าน
- [ ] **Step 5: Commit** `git commit -am "Admin: พรีวิวรางวัลซีซั่นนับตามขั้นใหม่"`

---

### Task 4: `SeasonClaimReveal.vue` (overlay อนิเมชัน)

**Files:**
- Create: `src/components/shared/SeasonClaimReveal.vue`

**Interfaces:**
- Props: `mail` (season mail object — ใช้ `tier.lv`, `tier.name`, `reward.coins`, `reward.tickets`, `reward.achievement`, `reward.arena`)
- Emits: `close`
- ไม่เรียก Firestore เอง (แบนเนอร์เป็นคนเรียก claim ก่อนเปิด)

- [ ] **Step 1: เขียน component** ตามเดโม (https://claude.ai/artifact/Rv9dbdMf9Cuu3yswTQz1QB — ซอร์สอยู่ใน scratchpad ไม่อยู่ในรีโป ใช้โค้ดด้านล่าง)

```vue
<template>
  <Teleport to="body">
    <div class="scr-ov" role="dialog" aria-modal="true" :aria-label="`รางวัล ${mail.tier?.name || ''}`" @click="onTap">
      <canvas ref="cv" class="scr-cv" />
      <div class="scr-chest" :class="{ shake: phase === 'shake', pop: phase !== 'shake' }">
        <Emoji :char="phase === 'shake' ? chestChar : '✨'" />
      </div>
      <div class="scr-name">{{ phase === 'shake' ? '' : mail.tier?.name }}</div>
      <div class="scr-items">
        <div v-for="(r, i) in shown" :key="i" class="scr-item" :class="{ special: r.special }">
          <span><Emoji :char="r.icon" /> {{ r.label }}</span>
          <b v-if="r.value != null">+{{ fmt(r.shownValue) }}</b>
        </div>
      </div>
      <button v-if="finished" ref="doneBtn" type="button" class="scr-done" @click.stop="$emit('close')">เก็บเข้ากระเป๋า</button>
      <div v-else class="scr-hint">แตะเพื่อข้าม</div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import Emoji from './Emoji.vue'
import { sfx } from '../../utils/sfx.js'
import { getArena } from '../../data/arenas.js'
import { ACHIEVEMENTS } from '../../data/achievements.js'

const props = defineProps({ mail: { type: Object, required: true } })
defineEmits(['close'])

const reduce = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches
const lv = computed(() => props.mail.tier?.lv || 1)
const chestChar = computed(() => lv.value >= 4 ? '👑' : lv.value >= 3 ? '💎' : '🎁')
const fmt = (n) => Math.round(n).toLocaleString('en-US')

const rows = computed(() => {
  const w = props.mail.reward || {}
  const out = []
  if (w.coins) out.push({ icon: '🪙', label: 'เหรียญ', value: w.coins })
  if (w.tickets) out.push({ icon: '🎟️', label: 'ตั๋วอัญเชิญ', value: w.tickets })
  if (w.arena && getArena(w.arena.id)) out.push({ icon: '🏟️', label: getArena(w.arena.id).name, special: true })
  if (w.achievement) out.push({ icon: '🏅', label: ACHIEVEMENTS[w.achievement.id]?.name || 'achievement', special: true })
  return out
})

const phase = ref(reduce ? 'open' : 'shake')
const shown = ref([])
const finished = ref(false)
const cv = ref(null)
const doneBtn = ref(null)
let timers = [], raf = 0

const SHAKE_MS = [0, 500, 800, 1100, 1500]
const ROW_GAP = 450

function addRow(r, animate) {
  const item = { ...r, shownValue: animate && r.value != null ? 0 : r.value }
  shown.value.push(item)
  if (!animate || r.value == null) return
  const s = performance.now()
  const step = (n) => {
    const p = Math.min(1, (n - s) / 600)
    shown.value[shown.value.indexOf(item)] && (item.shownValue = r.value * (1 - Math.pow(1 - p, 3)))
    shown.value = [...shown.value]
    if (p < 1) raf = requestAnimationFrame(step)
  }
  raf = requestAnimationFrame(step)
}

function finishNow() {
  timers.forEach(clearTimeout); timers = []
  cancelAnimationFrame(raf)
  phase.value = 'open'
  shown.value = rows.value.map(r => ({ ...r, shownValue: r.value }))
  finished.value = true
  nextTick(() => doneBtn.value?.focus())
}

function onTap() { if (!finished.value) finishNow() }

function burst() {
  const el = cv.value
  if (!el) return
  const r = el.getBoundingClientRect(), dpr = devicePixelRatio || 1
  el.width = r.width * dpr; el.height = r.height * dpr
  const c = el.getContext('2d'); c.scale(dpr, dpr)
  const cx = r.width / 2, cy = r.height / 2 - 90, N = [0, 24, 45, 70, 110][lv.value]
  const ps = Array.from({ length: N }, () => {
    const a = Math.random() * Math.PI * 2, v = 3 + Math.random() * (4 + lv.value * 1.5)
    return { x: cx, y: cy, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 4, r: 4 + Math.random() * 4, s: Math.random() * 6, c: Math.random() < 0.8 ? '#ffcf5a' : '#f472b6' }
  })
  let fr = 0
  const tick = () => {
    c.clearRect(0, 0, r.width, r.height); fr++
    for (const p of ps) {
      p.vy += 0.22; p.x += p.vx; p.y += p.vy; p.vx *= 0.99; p.s += 0.2
      c.fillStyle = p.c; c.globalAlpha = Math.max(0, 1 - fr / 90)
      c.beginPath(); c.ellipse(p.x, p.y, p.r * Math.abs(Math.cos(p.s)), p.r, 0, 0, 7); c.fill()
    }
    if (fr < 90) raf = requestAnimationFrame(tick); else c.clearRect(0, 0, r.width, r.height)
  }
  raf = requestAnimationFrame(tick)
}

onMounted(() => {
  if (reduce) { finishNow(); return }
  const at = (ms, f) => timers.push(setTimeout(f, ms))
  const sh = SHAKE_MS[lv.value]
  sfx('roll')
  at(sh, () => { phase.value = 'open'; burst(); sfx(lv.value >= 3 ? 'levelup' : 'coin') })
  rows.value.forEach((r, i) => at(sh + 400 + i * ROW_GAP, () => { addRow(r, true); sfx(r.special ? 'finish' : 'coin') }))
  at(sh + 400 + rows.value.length * ROW_GAP, () => { finished.value = true; nextTick(() => doneBtn.value?.focus()) })
})
onBeforeUnmount(() => { timers.forEach(clearTimeout); cancelAnimationFrame(raf) })
</script>

<style scoped>
.scr-ov{position:fixed;inset:0;z-index:9000;background:#070510b3;backdrop-filter:blur(3px);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;padding:20px;color:#f3eefc}
.scr-cv{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}
.scr-chest{font-size:88px;line-height:1}
.scr-chest.shake{animation:scr-shake .12s linear infinite}
.scr-chest.pop{animation:scr-pop .5s cubic-bezier(.2,1.6,.4,1)}
@keyframes scr-shake{25%{transform:rotate(-6deg)}75%{transform:rotate(6deg)}}
@keyframes scr-pop{0%{transform:scale(.6)}100%{transform:scale(1)}}
.scr-name{font-family:Mitr,sans-serif;font-weight:600;font-size:20px;color:#ffcf5a;min-height:30px;text-align:center}
.scr-items{display:grid;gap:8px;width:100%;max-width:280px}
.scr-item{display:flex;justify-content:space-between;align-items:center;gap:8px;background:#ffffff14;border-radius:12px;padding:10px 12px;animation:scr-in .35s cubic-bezier(.2,1.4,.4,1)}
.scr-item b{font-family:Mitr,sans-serif;font-size:18px;font-variant-numeric:tabular-nums}
.scr-item.special{background:linear-gradient(90deg,#ffcf5a33,#f472b633);border:1px solid #ffcf5a88}
@keyframes scr-in{from{opacity:0;transform:translateY(12px) scale(.95)}}
.scr-done{border:0;border-radius:12px;padding:10px 26px;font:600 15px Mitr,sans-serif;background:#352a5c;color:#f3eefc;cursor:pointer}
.scr-done:focus-visible{outline:2px solid #ffcf5a;outline-offset:2px}
.scr-hint{font-size:12px;color:#b3a8d4}
@media (prefers-reduced-motion:reduce){.scr-chest,.scr-item{animation:none}}
</style>
```

- [ ] **Step 2:** เช็คชื่อที่ import จริง: `grep -n "export" src/data/achievements.js` — ถ้าไม่ได้ export `ACHIEVEMENTS` เป็น map id→{name} ให้ใช้ตัวที่มีจริง (เช่น `getAchievement(id)`) · เช็ค `roll`/`coin`/`levelup`/`finish` อยู่ใน `SOUNDS` ของ `src/utils/sfx.js` (มีแล้วที่บรรทัด 157–166)
- [ ] **Step 3:** `npm run build` ผ่าน
- [ ] **Step 4: Commit** `git add src/components/shared/SeasonClaimReveal.vue && git commit -m "SeasonClaimReveal: อนิเมชันเปิดรางวัลซีซั่น"`

---

### Task 5: `SeasonClaimBanner.vue` + วางในหอคอย/อารีน่า

**Files:**
- Create: `src/components/shared/SeasonClaimBanner.vue`
- Modify: `src/views/TowerView.vue:12` (เหนือ `<SeasonCountdown kind="tower" />`)
- Modify: `src/components/battle/ArenaStatus.vue:21` (เหนือ `<SeasonCountdown kind="arena" />`)

**Interfaces:**
- Consumes: store `seasonPending(mode)`, `claim(id)` (คืน `false` = พัง · `{coins:0,tickets:0}` = รับไปแล้ว/ไม่มี) · `SeasonClaimReveal` (Task 4) · `seasonMonthLabel(season)` จาก `utils/pvpSeason.js`
- Props: `mode: 'tower'|'arena'`

- [ ] **Step 1: เขียน component**

```vue
<template>
  <div v-if="mail || justClaimed" class="scb" :class="{ done: justClaimed }">
    <p class="scb-t">ซีซั่น {{ label }} จบแล้ว</p>
    <p class="scb-s">{{ mode === 'tower' ? 'รางวัลตามชั้นที่ไต่ถึง' : 'รางวัลตามอันดับอารีน่า' }}</p>
    <div class="scb-line">
      <div class="scb-big">{{ bigText }}</div>
      <div class="scb-d">
        {{ mode === 'tower' ? 'ชั้นสูงสุดของคุณ' : `อันดับจบซีซั่น · ${(tier.rating || 0).toLocaleString()} แต้ม` }}<br>
        <span class="scb-mute">ขั้น {{ tier.name }}</span>
      </div>
    </div>
    <div v-if="justClaimed" class="scb-ok">✓ รับแล้ว</div>
    <button v-else type="button" class="scb-btn" :disabled="busy" @click="onClaim">
      <Emoji char="🎁" /> {{ busy ? 'กำลังรับ…' : 'รับรางวัล' }}
    </button>
  </div>
  <SeasonClaimReveal v-if="revealMail" :mail="revealMail" @close="revealMail = null" />
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import Emoji from './Emoji.vue'
import SeasonClaimReveal from './SeasonClaimReveal.vue'
import { useMailbox } from '../../stores/mailbox.js'
import { seasonMonthLabel } from '../../utils/pvpSeason.js'
import { useToast } from '../../composables/useToast.js'

const props = defineProps({ mode: { type: String, required: true } })
const mailbox = useMailbox()
const { toast } = useToast()

const justClaimed = ref(null)   // mail ที่เพิ่งรับในรอบนี้ (โชว์ ✓ จนออกจากหน้า)
const revealMail = ref(null)
const busy = ref(false)

const mail = computed(() => justClaimed.value ? null : mailbox.seasonPending(props.mode))
const shownMail = computed(() => justClaimed.value || mail.value)
const tier = computed(() => shownMail.value?.tier || {})
const label = computed(() => shownMail.value?.season ? seasonMonthLabel(shownMail.value.season) : '')
const bigText = computed(() => props.mode === 'tower' ? String(tier.value.best ?? '') : `#${tier.value.rank ?? ''}`)

onMounted(() => { mailbox.load() })

async function onClaim() {
  const m = mail.value
  if (!m || busy.value) return
  busy.value = true
  const res = await mailbox.claim(m.id)
  busy.value = false
  if (res === false) { toast('รับไม่สำเร็จ ลองใหม่อีกครั้ง', 'error'); return }
  justClaimed.value = m
  if (res.coins > 0 || res.tickets > 0 || res.arena) revealMail.value = m
  else toast('รางวัลนี้รับไปแล้ว', 'info')
}
</script>

<style scoped>
.scb{border-radius:18px;padding:14px;margin-bottom:12px;background:linear-gradient(135deg,#3a2d6b,#261d49);border:1px solid #ffcf5a55;color:#f3eefc;animation:scb-glow 2.4s infinite}
.scb.done{animation:none}
@keyframes scb-glow{50%{box-shadow:0 0 22px 2px #ffcf5a44}}
.scb-t{margin:0;font-family:Mitr,sans-serif;font-weight:600;font-size:17px}
.scb-s{margin:2px 0 10px;color:#b3a8d4;font-size:13px}
.scb-line{display:flex;gap:10px;align-items:center;background:#0006;border-radius:12px;padding:10px}
.scb-big{font-family:Mitr,sans-serif;font-weight:600;font-size:26px;color:#ffcf5a;min-width:64px;text-align:center;font-variant-numeric:tabular-nums}
.scb-d{font-size:13px}
.scb-mute{color:#b3a8d4}
.scb-btn{margin-top:10px;width:100%;border:0;border-radius:12px;padding:12px;font:600 16px Mitr,sans-serif;color:#3b2300;background:linear-gradient(#ffe08a,#f59e0b);cursor:pointer}
.scb-btn:disabled{opacity:.6;cursor:default}
.scb-ok{margin-top:10px;text-align:center;color:#86efac;font-size:14px}
@media (prefers-reduced-motion:reduce){.scb{animation:none}}
</style>
```

- [ ] **Step 2:** เช็ค toast: `grep -rn "export function useToast\|export.*toast" src/composables src/utils | head` — ถ้าชื่อไม่ตรง ใช้แบบที่ `AdminView.vue` ใช้ (grep `toast(` import ในไฟล์นั้น)
- [ ] **Step 3:** วาง `<SeasonClaimBanner mode="tower" />` เหนือ `<SeasonCountdown kind="tower" />` ใน `TowerView.vue` + import · วาง `<SeasonClaimBanner mode="arena" />` เหนือ `<SeasonCountdown kind="arena" />` ใน `ArenaStatus.vue` + import
- [ ] **Step 4:** `npm run build` ผ่าน · รันเทสทั้งหมด `node --test src/**/*.test.js` ผ่าน
- [ ] **Step 5: Commit** `git commit -am "SeasonClaimBanner: กดรับรางวัลซีซั่นในหน้าหอคอย/อารีน่า"` (add ไฟล์ใหม่ด้วย)

---

### Task 6: เทสบนจอ dev (ไม่แตะข้อมูลเพื่อน)

- [ ] **Step 1:** dev server (พอร์ต 5199 ถ้ายังรันอยู่ ไม่งั้น `npm run dev`) · ล็อกอินบัญชีแอดมินของ user
- [ ] **Step 2:** ใน DevTools console ของแท็บที่ล็อกอินแอดมิน เขียนจดหมายทดสอบ 2 ฉบับเข้า **uid ตัวเอง** (ผ่าน academic rule) ด้วยข้อมูลเท่ากับ `seasonRewardMails` ขั้นหอคอย 40–59 และอารีน่าอันดับ 1 · id ตายตัว `season-test-tower` / `season-test-arena` กันซ้ำ
- [ ] **Step 3:** เช็ค: แบนเนอร์โผล่ทั้งสองหน้า · กล่องจดหมายไม่เห็น 2 ฉบับนี้ และ badge ไม่นับ · กดรับ → อนิเมชัน + แตะข้ามได้ · เหรียญ/ตั๋วขึ้น · รีเฟรชแล้วแบนเนอร์หาย · มือถือ (ขนาด 390px) ไม่ล้นจอ
- [ ] **Step 4:** แจ้ง user ว่าเหรียญ/ตั๋ว/achievement ทดสอบเข้าบัญชีแอดมินจริง แล้วลบจดหมายทดสอบ 2 ฉบับ (เจ้าของลบได้)
- [ ] **Step 5:** อัปเดต memory `rxtu10_season_rewards.md` · ห้าม push จนกว่า user สั่ง (เตือนว่าต้อง push ก่อน 1 ต.ค.)
