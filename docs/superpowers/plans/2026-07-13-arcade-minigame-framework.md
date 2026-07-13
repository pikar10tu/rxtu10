# Arcade Minigame Framework + Capsule Rush Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** เพิ่มแพลตฟอร์มมินิเกม (registry + shell + leaderboard จาก members store) พร้อมเกมแรก Capsule Rush (Flappy-style) ให้เว็บ RxTU10 v2

**Architecture:** ตรรกะเกม/leaderboard ล้วนอยู่ใน `utils/minigameCore.js` (เทสด้วย `node --test`) · registry เป็น pure data · shell คุมแค่ chrome (game-over เป็น slot) · แต่ละเกม = route หน้าเต็ม (เลี่ยง stacking-context trap) · คะแนน/เหรียญเขียนลง user doc เดียวผ่าน `patchUser` แบบ dot-notation · leaderboard sort จาก members store ที่โหลดอยู่แล้ว (overlay "ฉัน" ก่อน sort)

**Tech Stack:** Vue 3 (`<script setup>` + scoped style) · Pinia · Firebase Firestore (`updateDoc`/`increment`) · Canvas 2D + `requestAnimationFrame` · Node test runner (`node --test`)

## Global Constraints

- Spec อ้างอิง: `docs/superpowers/specs/2026-07-13-arcade-minigame-framework-design.md`
- เขียน user doc **ผ่าน `auth.patchUser(optimistic, server)` เท่านั้น** — server ใช้ dot-notation + `increment()`, optimistic deep-merge เอง (`setUserDataOptimistic` เป็น shallow spread)
- overlay/modal/sheet ต้อง Teleport to body (CLAUDE.md ข้อ 6) — ใช้ `BottomSheet.vue` ที่ teleport อยู่แล้ว
- อีโมจิเรนเดอร์ด้วย Fluent image (`fluentFile()` → `.svg`) fallback เป็น native ตอนโหลดพัง
- ไม่แตะ firestore.rules (ไม่ deploy) — `minigames` อยู่ใต้ guard user doc เดิม, coins guard `0..50M` รองรับ
- เหรียญ = `min(score, maxPlausibleScore) × coinPerPoint` **ไม่มี cap รายวัน** — เกินเพดาน = clamp + log `cheatLogs`
- commit รูปแบบ `Area: อะไร (ทำไม)` ไทยปนอังกฤษ · ทุก task จบด้วย `npm run build` ผ่าน
- UI ภาษาไทย · โทนตาม `docs/voice-guide.md`

---

## File Structure

**สร้างใหม่:**
- `src/data/minigames.js` — registry (pure data)
- `src/utils/minigameCore.js` + `src/utils/minigameCore.test.js` — ตรรกะล้วน + เทส
- `src/composables/useMinigameBoard.js` — wire members store → board
- `src/composables/useCapsuleRush.js` — canvas game loop (physics จาก core)
- `src/components/minigame/MinigameShell.vue` — chrome ร่วม
- `src/components/minigame/MinigameLeaderboard.vue` — บอร์ด top 50
- `src/views/CapsuleRushView.vue` — หน้าเกม (pet picker + shell + canvas)

**แก้:**
- `src/data/userSchema.js` — field `minigames` + normalize
- `src/stores/members.js` — light subset + `minigames`
- `src/utils/membersCache.js` — bump `MEMBERS_CACHE_KEY` v4→v5
- `src/router/index.js` — route `/play/games/capsule-rush`
- `src/views/PlayView.vue` — เรนเดอร์การ์ดจาก registry แทน SoonCard เดิม

---

### Task 1: Registry + schema field + normalize

**Files:**
- Create: `src/data/minigames.js`
- Modify: `src/data/userSchema.js` (USER_DEFAULTS + normalizeUserData)
- Test: `src/utils/minigameCore.test.js` (สร้างไฟล์ ใส่เทส registry/normalize ก่อน — Task 2 เติมต่อ)

**Interfaces:**
- Produces: `MINIGAMES` (array), `getMinigame(key)` → game|undefined จาก `data/minigames.js`
- Produces: `USER_DEFAULTS.minigames = {}` และ `normalizeUserData(d).minigames` เป็น object เสมอ

- [ ] **Step 1: เขียนเทสที่ล้มเหลว** — `src/utils/minigameCore.test.js`

```js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { MINIGAMES, getMinigame } from '../data/minigames.js'
import { normalizeUserData, USER_DEFAULTS } from '../data/userSchema.js'

test('registry: capsuleRush live + fields ครบ', () => {
  const g = getMinigame('capsuleRush')
  assert.ok(g, 'ต้องมี capsuleRush')
  assert.equal(g.status, 'live')
  assert.equal(g.coinPerPoint, 5)
  assert.ok(g.maxPlausibleScore > 0)
  assert.ok(g.route.startsWith('/play/games/'))
})

test('registry: ทุกเกมมี key/name/status', () => {
  for (const g of MINIGAMES) {
    assert.ok(g.key && g.name && g.status, `${g.key} ต้องครบ`)
  }
})

test('schema: minigames default เป็น object', () => {
  assert.deepEqual(USER_DEFAULTS.minigames, {})
})

test('normalize: doc เก่าไม่มี minigames → object ว่าง (ไม่ crash)', () => {
  const d = normalizeUserData({ coins: 10 })
  assert.deepEqual(d.minigames, {})
})

test('normalize: minigames ที่มีอยู่ถูกคงไว้', () => {
  const d = normalizeUserData({ minigames: { capsuleRush: { best: 42, plays: 3 } } })
  assert.equal(d.minigames.capsuleRush.best, 42)
})

test('normalize: minigames ผิดชนิด (array) → object ว่าง', () => {
  const d = normalizeUserData({ minigames: [1, 2] })
  assert.deepEqual(d.minigames, {})
})
```

- [ ] **Step 2: รันเทสให้เห็นว่า fail**

Run: `cd rxtu10-v2 && node --test src/utils/minigameCore.test.js`
Expected: FAIL — `Cannot find module '../data/minigames.js'`

- [ ] **Step 3: สร้าง registry** — `src/data/minigames.js`

```js
// ════════════════════════════════════════════════════════════
//  Minigame registry — แหล่งข้อมูลเดียวของทุกมินิเกม
//  Play landing เรนเดอร์การ์ดจากที่นี่ · เกมอ่าน coinPerPoint/maxPlausibleScore
//  เพิ่มเกมใหม่ = เพิ่ม entry ที่นี่ (status:'live' ต้องมี route)
// ════════════════════════════════════════════════════════════

export const MINIGAMES = [
  {
    key: 'capsuleRush',
    name: 'Capsule Rush',
    emoji: '💊',
    route: '/play/games/capsule-rush',
    coinPerPoint: 5,          // เหรียญ/คะแนน
    maxPlausibleScore: 500,   // เกินนี้ = clamp เหรียญ + log cheat (กันเงินเฟ้อ ไม่ใช่ cap รายวัน)
    scoreLabel: 'คะแนน',
    tagline: 'พาเพ็ทบินลอดชั้นวางยา',
    status: 'live',
  },
  {
    key: 'pillCrush',
    name: 'Pill Crush',
    emoji: '🍬',
    scoreLabel: 'คะแนน',
    tagline: 'เรียงเม็ดยา 3 สี ตะลุยด่าน',
    status: 'soon',
  },
]

export function getMinigame(key) {
  return MINIGAMES.find(g => g.key === key)
}
```

- [ ] **Step 4: เพิ่ม field ใน schema** — `src/data/userSchema.js`

ใน `USER_DEFAULTS` เพิ่มบรรทัด (วางถัดจาก `expedition: null,` หรือกลุ่ม v2 fields):
```js
  minigames: {},   // { [key]: { best, plays } } — คะแนนมินิเกม (ดู data/minigames.js)
```

ใน `normalizeUserData` เพิ่มถัดจากบรรทัด `d.likedBy = isObj(data.likedBy) ? data.likedBy : {}`:
```js
  d.minigames = isObj(data.minigames) ? { ...data.minigames } : {}
```

- [ ] **Step 5: รันเทสให้ผ่าน**

Run: `cd rxtu10-v2 && node --test src/utils/minigameCore.test.js`
Expected: PASS ทั้ง 6 เทส

- [ ] **Step 6: build ผ่าน + commit**

Run: `cd rxtu10-v2 && npm run build`
```bash
git add src/data/minigames.js src/data/userSchema.js src/utils/minigameCore.test.js
git commit -m "Minigame: registry + user schema field minigames (แหล่งข้อมูลเกม + เก็บคะแนน)"
```

---

### Task 2: Core logic ล้วน (physics/collision/score/coins/board)

**Files:**
- Create: `src/utils/minigameCore.js`
- Test: `src/utils/minigameCore.test.js` (เติมเทสต่อจาก Task 1)

**Interfaces:**
- Produces:
  - `applyJump(bird, cfg)` → `{ y, vy }` (vy = cfg.jump)
  - `stepBird(bird, dt, cfg)` → `{ y, vy }` (dt เป็นวินาที)
  - `stepPipes(pipes, dt, speed)` → array (เลื่อนซ้าย ตัดที่หลุดจอ `x + pipeW < 0`)
  - `collides(bird, pipes, cfg)` → boolean (ชนท่อ/พื้น/เพดาน)
  - `scorePassed(bird, pipes, cfg)` → `{ pipes, gained }` (mark `scored` เมื่อท่อผ่าน birdX)
  - `grantCoins(score, game)` → `{ coins, flagged }` (`game` = `{ coinPerPoint, maxPlausibleScore }`)
  - `buildMinigameBoard(fbUsers, me, key)` → array row `{ uid, studentId, nickname, track, googlePhoto, customPhoto, best, isMe }` (best>0, desc, top 50, overlay me)
- Model: `bird = { y, vy }` (x คงที่ = cfg.birdX) · `pipe = { x, gapY, gapH, scored }` · `cfg = { gravity, jump, birdX, birdR, pipeW, worldH }`

- [ ] **Step 1: เขียนเทสที่ล้มเหลว** — เพิ่มท้าย `src/utils/minigameCore.test.js`

```js
import {
  applyJump, stepBird, stepPipes, collides, scorePassed, grantCoins, buildMinigameBoard,
} from './minigameCore.js'

const CFG = { gravity: 1600, jump: -520, birdX: 80, birdR: 18, pipeW: 70, worldH: 600 }

test('applyJump: ตั้ง vy = jump', () => {
  assert.equal(applyJump({ y: 300, vy: 100 }, CFG).vy, -520)
})

test('stepBird: gravity เพิ่ม vy, y ขยับตาม vy', () => {
  const b = stepBird({ y: 300, vy: 0 }, 0.5, CFG)
  assert.equal(b.vy, 800)          // 0 + 1600*0.5
  assert.equal(b.y, 300)           // 300 + 0*0.5 (ใช้ vy เดิมก่อน integrate)
})

test('stepPipes: เลื่อนซ้าย (ยังไม่หลุด) — x ลดลง', () => {
  const out = stepPipes([{ x: 200, gapY: 200, gapH: 160, scored: false }], 0.1, 300)
  assert.equal(out.length, 1)
  assert.equal(out[0].x, 170)      // 200 - 300*0.1
})

test('stepPipes: ตัดท่อที่หลุดจอซ้าย (x + 70 <= 0)', () => {
  // x=5, speed=300, dt=0.3 → 5 - 90 = -85 ; -85 + 70 = -15 <= 0 → ถูกตัด
  const out = stepPipes([{ x: 5, gapY: 200, gapH: 160, scored: false }], 0.3, 300)
  assert.equal(out.length, 0)
})

test('collides: ตกพื้นล่าง = true', () => {
  assert.equal(collides({ y: 620, vy: 0 }, [], CFG), true)
})

test('collides: ทะลุเพดาน = true', () => {
  assert.equal(collides({ y: -5, vy: 0 }, [], CFG), true)
})

test('collides: กลางจอ ไม่มีท่อ = false', () => {
  assert.equal(collides({ y: 300, vy: 0 }, [], CFG), false)
})

test('collides: ชนท่อ (นกอยู่ในคอลัมน์ท่อ นอกช่อง) = true', () => {
  const pipe = { x: 70, gapY: 100, gapH: 120, scored: false } // ช่อง 100..220
  assert.equal(collides({ y: 400, vy: 0 }, [pipe], CFG), true)
})

test('collides: อยู่ในช่องท่อ = false', () => {
  const pipe = { x: 70, gapY: 100, gapH: 120, scored: false }
  assert.equal(collides({ y: 160, vy: 0 }, [pipe], CFG), false)
})

test('scorePassed: ท่อผ่าน birdX ครั้งแรก → +1 + mark scored', () => {
  const pipe = { x: 5, gapY: 100, gapH: 120, scored: false } // x+pipeW=75 < birdX=80
  const r = scorePassed({ y: 160, vy: 0 }, [pipe], CFG)
  assert.equal(r.gained, 1)
  assert.equal(r.pipes[0].scored, true)
})

test('scorePassed: ท่อที่ scored แล้ว ไม่ +ซ้ำ', () => {
  const pipe = { x: 5, gapY: 100, gapH: 120, scored: true }
  assert.equal(scorePassed({ y: 160, vy: 0 }, [pipe], CFG).gained, 0)
})

test('grantCoins: ปกติ = score * coinPerPoint', () => {
  assert.deepEqual(grantCoins(40, { coinPerPoint: 5, maxPlausibleScore: 500 }),
    { coins: 200, flagged: false })
})

test('grantCoins: เกินเพดาน → clamp + flagged', () => {
  assert.deepEqual(grantCoins(999, { coinPerPoint: 5, maxPlausibleScore: 500 }),
    { coins: 2500, flagged: true })
})

test('buildMinigameBoard: sort desc + filter best>0 + top50', () => {
  const fb = {
    '01': { uid: 'a', studentId: '01', nickname: 'A', best: undefined, minigames: { cr: { best: 10 } } },
    '02': { uid: 'b', studentId: '02', nickname: 'B', minigames: { cr: { best: 30 } } },
    '03': { uid: 'c', studentId: '03', nickname: 'C', minigames: {} }, // best 0 → ตัดออก
  }
  const rows = buildMinigameBoard(fb, null, 'cr')
  assert.equal(rows.length, 2)
  assert.equal(rows[0].nickname, 'B')
  assert.equal(rows[0].best, 30)
})

test('buildMinigameBoard: overlay me ด้วย best สดกว่า cache + isMe', () => {
  const fb = { '02': { uid: 'b', studentId: '02', nickname: 'Me', minigames: { cr: { best: 5 } } } }
  const me = { uid: 'b', studentId: '02', nickname: 'Me', track: 'sci', best: 50 }
  const rows = buildMinigameBoard(fb, me, 'cr')
  assert.equal(rows[0].best, 50)     // ใช้ best สดจาก me ไม่ใช่ 5 จาก cache
  assert.equal(rows[0].isMe, true)
})

test('buildMinigameBoard: me ยังไม่อยู่ใน fbUsers → เพิ่มเข้าไป', () => {
  const me = { uid: 'z', studentId: '99', nickname: 'New', track: 'care', best: 7 }
  const rows = buildMinigameBoard({}, me, 'cr')
  assert.equal(rows.length, 1)
  assert.equal(rows[0].isMe, true)
})
```

- [ ] **Step 2: รันเทสให้เห็น fail**

Run: `cd rxtu10-v2 && node --test src/utils/minigameCore.test.js`
Expected: FAIL — `The requested module './minigameCore.js' does not provide...` / ไฟล์ยังไม่มี

- [ ] **Step 3: เขียน implementation** — `src/utils/minigameCore.js`

```js
// ════════════════════════════════════════════════════════════
//  Minigame core — ตรรกะล้วน เทสได้ (ไม่แตะ canvas/DOM/Firestore)
//  Capsule Rush physics + collision + scoring + coin grant + leaderboard build
// ════════════════════════════════════════════════════════════

// ── Capsule Rush physics (dt = วินาที) ──
export function applyJump(bird, cfg) {
  return { ...bird, vy: cfg.jump }
}

export function stepBird(bird, dt, cfg) {
  return { y: bird.y + bird.vy * dt, vy: bird.vy + cfg.gravity * dt }
}

export function stepPipes(pipes, dt, speed) {
  return pipes
    .map(p => ({ ...p, x: p.x - speed * dt }))
    .filter(p => p.x + 70 > 0) // pipeW=70; ตัดท่อที่หลุดจอซ้าย
}

export function collides(bird, pipes, cfg) {
  // พื้น/เพดาน
  if (bird.y + cfg.birdR >= cfg.worldH || bird.y - cfg.birdR <= 0) return true
  // ท่อ: นกเป็นวงกลมที่ x=birdX รัศมี birdR — เช็คทับคอลัมน์ท่อ แล้วต้องอยู่ในช่อง
  for (const p of pipes) {
    const overlapX = cfg.birdX + cfg.birdR > p.x && cfg.birdX - cfg.birdR < p.x + cfg.pipeW
    if (!overlapX) continue
    const inGap = bird.y - cfg.birdR > p.gapY && bird.y + cfg.birdR < p.gapY + p.gapH
    if (!inGap) return true
  }
  return false
}

export function scorePassed(bird, pipes, cfg) {
  let gained = 0
  const out = pipes.map(p => {
    if (!p.scored && p.x + cfg.pipeW < cfg.birdX) {
      gained += 1
      return { ...p, scored: true }
    }
    return p
  })
  return { pipes: out, gained }
}

// ── เหรียญ (clamp เพดาน กันเงินเฟ้อ ไม่มี cap รายวัน) ──
export function grantCoins(score, game) {
  const capped = Math.min(score, game.maxPlausibleScore)
  return { coins: capped * game.coinPerPoint, flagged: score > game.maxPlausibleScore }
}

// ── Leaderboard: จาก members (fbUsers) + overlay me (best สดกว่า cache) ──
export function buildMinigameBoard(fbUsers, me, key) {
  const rows = {}
  for (const u of Object.values(fbUsers || {})) {
    rows[u.studentId || u.uid] = {
      uid: u.uid, studentId: u.studentId, nickname: u.nickname, track: u.track,
      googlePhoto: u.googlePhoto, customPhoto: u.customPhoto,
      best: u.minigames?.[key]?.best || 0, isMe: false,
    }
  }
  if (me) {
    const k = me.studentId || me.uid
    const prev = rows[k]
    rows[k] = {
      uid: me.uid, studentId: me.studentId, nickname: me.nickname, track: me.track,
      googlePhoto: me.googlePhoto, customPhoto: me.customPhoto,
      best: Math.max(me.best || 0, prev?.best || 0), isMe: true,
    }
  }
  return Object.values(rows)
    .filter(r => r.best > 0)
    .sort((a, b) => b.best - a.best)
    .slice(0, 50)
}
```

- [ ] **Step 4: รันเทสให้ผ่าน**

Run: `cd rxtu10-v2 && node --test src/utils/minigameCore.test.js`
Expected: PASS ทุกเทส (Task 1 + Task 2)

- [ ] **Step 5: Commit**

```bash
git add src/utils/minigameCore.js src/utils/minigameCore.test.js
git commit -m "Minigame: core logic ล้วน (physics/collision/score/coins/board) + เทส node --test"
```

---

### Task 3: Members store subset + cache bump (leaderboard data plumbing)

**Files:**
- Modify: `src/stores/members.js:68-95` (light subset)
- Modify: `src/utils/membersCache.js:5` (bump key)

**Interfaces:**
- Produces: `fbUsers[studentId].minigames` มีค่า (ให้ `buildMinigameBoard` อ่านได้)

- [ ] **Step 1: เพิ่ม `minigames` เข้า light subset** — `src/stores/members.js`

ในอ็อบเจกต์ `light` (หลังบรรทัด `pvp: n.pvp,`) เพิ่ม:
```js
                    minigames: n.minigames,
```

- [ ] **Step 2: bump cache key** — `src/utils/membersCache.js:5`

เปลี่ยน:
```js
export const MEMBERS_CACHE_KEY = 'rxtu10:members:v4' // v4: เพิ่ม pvp (light subset เปลี่ยน)
```
เป็น:
```js
export const MEMBERS_CACHE_KEY = 'rxtu10:members:v5' // v5: เพิ่ม minigames (light subset เปลี่ยน)
```

- [ ] **Step 3: build ผ่าน + commit**

Run: `cd rxtu10-v2 && npm run build`
```bash
git add src/stores/members.js src/utils/membersCache.js
git commit -m "Members: ใส่ minigames ใน light subset + bump cache v5 (ให้ leaderboard เกมอ่านได้)"
```

---

### Task 4: useMinigameBoard composable

**Files:**
- Create: `src/composables/useMinigameBoard.js`

**Interfaces:**
- Consumes: `buildMinigameBoard` (Task 2), `useMembersStore().loadFbUsers()/fbUsers`, `useAuthStore().userData`
- Produces: `useMinigameBoard(key)` → `{ rows: ComputedRef, loading: Ref, load: () => Promise }`

- [ ] **Step 1: เขียน composable** — `src/composables/useMinigameBoard.js`

```js
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useMembersStore } from '../stores/members.js'
import { useAuthStore } from '../stores/auth.js'
import { buildMinigameBoard } from '../utils/minigameCore.js'

// Leaderboard ต่อเกม — จาก members store (โหลด lazy, ใช้ cache) + overlay "ฉัน" ด้วย best สด
// guestUsers ไม่รวมในอันดับ (Phase นี้) — เป็นผู้เยี่ยมชม ไม่ใช่ผู้เล่นประจำ
export function useMinigameBoard(key) {
  const members = useMembersStore()
  const auth = useAuthStore()
  const { fbUsers, loading } = storeToRefs(members)

  const rows = computed(() => {
    const u = auth.userData
    const me = u && u.studentId
      ? {
          uid: u.uid, studentId: u.studentId, nickname: u.nickname, track: u.track,
          googlePhoto: u.googlePhoto, customPhoto: u.customPhoto,
          best: u.minigames?.[key]?.best || 0,
        }
      : null
    return buildMinigameBoard(fbUsers.value, me, key)
  })

  return { rows, loading, load: () => members.loadFbUsers() }
}
```

- [ ] **Step 2: build ผ่าน + commit**

Run: `cd rxtu10-v2 && npm run build`
```bash
git add src/composables/useMinigameBoard.js
git commit -m "Minigame: composable useMinigameBoard (board จาก members + overlay ฉัน)"
```

---

### Task 5: MinigameLeaderboard component

**Files:**
- Create: `src/components/minigame/MinigameLeaderboard.vue`

**Interfaces:**
- Consumes: `useMinigameBoard(key)` (Task 4), `getMinigame(key)` (Task 1), `avatarUrl` จาก `utils/avatar.js`
- Props: `gameKey: String`

- [ ] **Step 1: ตรวจ helper รูปโปรไฟล์** — เปิด `src/utils/avatar.js` ดูชื่อฟังก์ชันสร้าง URL รูป (เช่น `avatarUrl(user)` หรือ `photoFor(user)`). ใช้ชื่อจริงในไฟล์ ถ้าไม่มี ให้ inline: `user.customPhoto || user.googlePhoto || fallbackLetter`

- [ ] **Step 2: เขียน component** — `src/components/minigame/MinigameLeaderboard.vue`

```vue
<template>
  <div class="mlb">
    <div class="mlb-head">🏆 อันดับ {{ game?.name }}</div>
    <div v-if="loading && !rows.length" class="mlb-empty">กำลังโหลด…</div>
    <div v-else-if="!rows.length" class="mlb-empty">ยังไม่มีใครทำคะแนน — เป็นคนแรกเลย!</div>
    <div v-else class="mlb-list">
      <div v-for="(r, i) in rows" :key="r.uid" class="mlb-row" :class="{ me: r.isMe }">
        <span class="mlb-rank">{{ medal(i) }}</span>
        <span class="mlb-nick">{{ r.nickname }}<span v-if="r.isMe" class="mlb-you"> (คุณ)</span></span>
        <span class="mlb-best">{{ r.best.toLocaleString() }} {{ game?.scoreLabel }}</span>
      </div>
    </div>
    <div class="mlb-foot">แสดงเฉพาะผู้ที่ทำคะแนนแล้ว · สูงสุด 50 อันดับ</div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useMinigameBoard } from '../../composables/useMinigameBoard.js'
import { getMinigame } from '../../data/minigames.js'

const props = defineProps({ gameKey: { type: String, required: true } })
const game = getMinigame(props.gameKey)
const { rows, loading, load } = useMinigameBoard(props.gameKey)
onMounted(load)

const medal = (i) => (i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`)
</script>

<style scoped>
.mlb { padding: 4px 2px; }
.mlb-head { font-weight: 800; font-size: 1rem; margin-bottom: 8px; }
.mlb-empty { text-align: center; color: rgba(0,0,0,.45); padding: 24px 0; font-size: .85rem; }
.mlb-list { display: flex; flex-direction: column; gap: 4px; }
.mlb-row { display: grid; grid-template-columns: 34px 1fr auto; align-items: center; gap: 8px;
  padding: 8px 10px; border-radius: 12px; background: rgba(0,0,0,.03); font-size: .82rem; }
.mlb-row.me { background: rgba(79,70,229,.12); font-weight: 700; }
.mlb-rank { text-align: center; font-weight: 800; }
.mlb-nick { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.mlb-you { color: #4f46e5; font-size: .72rem; }
.mlb-best { font-weight: 800; color: #4f46e5; }
.mlb-foot { text-align: center; font-size: .62rem; color: rgba(0,0,0,.4); padding-top: 8px; }
</style>
```

- [ ] **Step 3: build ผ่าน + commit**

Run: `cd rxtu10-v2 && npm run build`
```bash
git add src/components/minigame/MinigameLeaderboard.vue
git commit -m "Minigame: component leaderboard top 50 (ต่อเกม)"
```

---

### Task 6: MinigameShell component (chrome ร่วม)

**Files:**
- Create: `src/components/minigame/MinigameShell.vue`

**Interfaces:**
- Consumes: `getMinigame(key)` (Task 1), `MinigameLeaderboard` (Task 5), `BottomSheet` (`components/shared/BottomSheet.vue`)
- Props: `gameKey: String`, `best: Number`
- Slots: default (พื้นที่เกม), `gameover` (มี default — คะแนน/เหรียญ/ปุ่ม)
- Emits/expose: ไม่มี — game-over เนื้อหาส่งผ่าน slot จาก view

- [ ] **Step 1: ตรวจ prop ของ BottomSheet** — เปิด `src/components/shared/BottomSheet.vue` ดู prop เปิด/ปิด (เช่น `:open` / `v-model` / event `@close`). ใช้ให้ตรงใน Step 2

- [ ] **Step 2: เขียน shell** — `src/components/minigame/MinigameShell.vue`

```vue
<template>
  <div class="ms">
    <header class="ms-head">
      <button class="ms-back" @click="$router.push('/play')" aria-label="กลับ">‹ กลับ</button>
      <span class="ms-title"><Emoji :char="game?.emoji" /> {{ game?.name }}</span>
      <button class="ms-lb" @click="lbOpen = true" aria-label="อันดับ">🏆</button>
    </header>

    <div class="ms-best">สถิติของคุณ: <b>{{ best.toLocaleString() }}</b> {{ game?.scoreLabel }}</div>

    <div class="ms-stage"><slot /></div>

    <slot name="gameover" />

    <BottomSheet :open="lbOpen" @close="lbOpen = false">
      <MinigameLeaderboard :game-key="gameKey" />
    </BottomSheet>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Emoji from '../shared/Emoji.vue'
import BottomSheet from '../shared/BottomSheet.vue'
import MinigameLeaderboard from './MinigameLeaderboard.vue'
import { getMinigame } from '../../data/minigames.js'

const props = defineProps({
  gameKey: { type: String, required: true },
  best: { type: Number, default: 0 },
})
const game = getMinigame(props.gameKey)
const lbOpen = ref(false)
</script>

<style scoped>
.ms { max-width: 480px; margin: 0 auto; padding: 8px 12px; }
.ms-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 6px; }
.ms-back { all: unset; cursor: pointer; font-weight: 700; color: #4f46e5; padding: 6px 4px; }
.ms-title { font-weight: 800; font-size: 1.05rem; display: flex; align-items: center; gap: 6px; }
.ms-lb { all: unset; cursor: pointer; font-size: 1.3rem; padding: 6px; }
.ms-best { text-align: center; font-size: .78rem; color: rgba(0,0,0,.55); margin-bottom: 8px; }
.ms-stage { position: relative; }
</style>
```

> ⚠️ ถ้า BottomSheet ใช้ `v-model:open` หรือ prop ชื่ออื่น (จาก Step 1) ปรับ binding ให้ตรง

- [ ] **Step 3: build ผ่าน + commit**

Run: `cd rxtu10-v2 && npm run build`
```bash
git add src/components/minigame/MinigameShell.vue
git commit -m "Minigame: shell chrome ร่วม (หัว/best/ปุ่มอันดับ + slot game-over)"
```

---

### Task 7: useCapsuleRush game engine composable

**Files:**
- Create: `src/composables/useCapsuleRush.js`

**Interfaces:**
- Consumes: core physics จาก `minigameCore.js` (Task 2), `getMinigame('capsuleRush')`
- Produces: `useCapsuleRush(canvasRef, { onGameOver })` → `{ score: Ref, running: Ref, start(spriteImg), stop() }`
  - `start(spriteImg)` = เริ่มเกมใหม่ (spriteImg = HTMLImageElement|null สำหรับวาดเพ็ท; null → วาด fillText)
  - `onGameOver(finalScore)` = callback ตอนตาย

- [ ] **Step 1: เขียน engine** — `src/composables/useCapsuleRush.js`

```js
import { ref } from 'vue'
import { applyJump, stepBird, stepPipes, collides, scorePassed } from '../utils/minigameCore.js'

// Canvas game loop สำหรับ Capsule Rush — physics จาก core (เทสแล้ว), ที่นี่คุมแค่ loop/วาด/อินพุต
// rAF: clamp dt + pause ตอนสลับแอป (กัน dt spike = ตายฟรี/พุ่งทะลุท่อ)
export function useCapsuleRush(canvasRef, { onGameOver }) {
  const score = ref(0)
  const running = ref(false)

  const CFG = { gravity: 1600, jump: -520, birdX: 80, birdR: 18, pipeW: 70, worldH: 600 }
  const WORLD_W = 400
  let bird, pipes, speed, spawnTimer, sprite, raf, lastT

  function reset() {
    bird = { y: 300, vy: 0 }
    pipes = []
    speed = 170
    spawnTimer = 0
    score.value = 0
  }

  function spawnPipe() {
    const gapH = 190
    const margin = 60
    const gapY = margin + Math.random() * (CFG.worldH - gapH - margin * 2)
    pipes.push({ x: WORLD_W, gapY, gapH, scored: false })
  }

  function flap() { if (running.value) bird = applyJump(bird, CFG) }

  function loop(t) {
    if (!running.value) return
    let dt = (t - lastT) / 1000
    lastT = t
    if (dt > 0.05) dt = 0.05 // clamp กัน spike (สลับแอป/เฟรมตก)

    bird = stepBird(bird, dt, CFG)
    pipes = stepPipes(pipes, dt, speed)
    spawnTimer += dt
    if (spawnTimer > 1.6) { spawnPipe(); spawnTimer = 0 }

    const sr = scorePassed(bird, pipes, CFG)
    pipes = sr.pipes
    if (sr.gained) { score.value += sr.gained; speed += 4 } // เร่งขึ้นเรื่อยๆ

    draw()

    if (collides(bird, pipes, CFG)) { end(); return }
    raf = requestAnimationFrame(loop)
  }

  function draw() {
    const cv = canvasRef.value
    if (!cv) return
    const ctx = cv.getContext('2d')
    ctx.clearRect(0, 0, WORLD_W, CFG.worldH)
    // ท่อ (ชั้นวางยา)
    ctx.fillStyle = '#a7f3d0'
    for (const p of pipes) {
      ctx.fillRect(p.x, 0, CFG.pipeW, p.gapY)
      ctx.fillRect(p.x, p.gapY + p.gapH, CFG.pipeW, CFG.worldH - p.gapY - p.gapH)
    }
    // เพ็ท
    const r = CFG.birdR
    if (sprite) ctx.drawImage(sprite, CFG.birdX - r, bird.y - r, r * 2, r * 2)
    else { ctx.font = `${r * 2}px serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
           ctx.fillText('💊', CFG.birdX, bird.y) }
  }

  function start(spriteImg) {
    sprite = spriteImg || null
    reset()
    running.value = true
    lastT = performance.now()
    raf = requestAnimationFrame(loop)
  }

  function end() {
    running.value = false
    cancelAnimationFrame(raf)
    onGameOver(score.value)
  }

  function stop() { running.value = false; cancelAnimationFrame(raf) }

  // pause ตอนสลับแอป — กลับมาแล้วต่อ lastT ใหม่ (ไม่ให้ dt พุ่ง)
  function onVisibility() {
    if (document.hidden) { cancelAnimationFrame(raf) }
    else if (running.value) { lastT = performance.now(); raf = requestAnimationFrame(loop) }
  }
  document.addEventListener('visibilitychange', onVisibility)
  const dispose = () => document.removeEventListener('visibilitychange', onVisibility)

  return { score, running, start, stop, flap, dispose, WORLD_W, WORLD_H: CFG.worldH }
}
```

- [ ] **Step 2: build ผ่าน + commit**

Run: `cd rxtu10-v2 && npm run build`
```bash
git add src/composables/useCapsuleRush.js
git commit -m "Minigame: engine Capsule Rush (canvas loop + clamp dt + pause สลับแอป)"
```

---

### Task 8: CapsuleRushView + route (pet picker + game-over write/retry)

**Files:**
- Create: `src/views/CapsuleRushView.vue`
- Modify: `src/router/index.js` (route `/play/games/capsule-rush`)

**Interfaces:**
- Consumes: `MinigameShell` (Task 6), `useCapsuleRush` (Task 7), `getMinigame`+`grantCoins` (Task 1/2), `useAuthStore().patchUser/userData`, `fluentFile` (`utils/emoji.js`), `increment` (firebase/firestore), `useToast`
- game-over write: dot-notation + increment (spec §3.2) + retry ถ้า patchUser คืน false + log cheatLogs ถ้า flagged

- [ ] **Step 1: เพิ่ม route** — `src/router/index.js`

หา array `routes` แล้วเพิ่ม (ตามแพทเทิร์น lazy route เดิมในไฟล์):
```js
  { path: '/play/games/capsule-rush', component: () => import('../views/CapsuleRushView.vue') },
```

- [ ] **Step 2: เขียน view** — `src/views/CapsuleRushView.vue`

```vue
<template>
  <MinigameShell game-key="capsuleRush" :best="best">
    <!-- pet picker ก่อนเริ่ม -->
    <div v-if="phase === 'pick'" class="cr-pick">
      <div class="cr-pick-title">เลือกเพ็ทที่จะบิน</div>
      <div class="cr-pick-grid">
        <button v-for="p in petChoices" :key="p.id" class="cr-pet" :class="{ sel: p.emoji === chosen }"
                @click="chosen = p.emoji">
          <Emoji :char="p.emoji" />
        </button>
        <button class="cr-pet" :class="{ sel: chosen === '💊' }" @click="chosen = '💊'"><Emoji char="💊" /></button>
      </div>
      <button class="cr-start" @click="begin">เริ่มเล่น</button>
      <p class="cr-hint">แตะจอเพื่อกระพือขึ้น · ลอดช่องชั้นวางยา</p>
    </div>

    <!-- canvas -->
    <div v-show="phase === 'play'" class="cr-stage" @pointerdown.prevent="flap">
      <canvas ref="canvasEl" :width="WORLD_W" :height="WORLD_H" class="cr-canvas" />
      <div class="cr-score">{{ score }}</div>
    </div>

    <!-- game-over slot -->
    <template #gameover>
      <div v-if="phase === 'over'" class="cr-over">
        <div class="cr-over-score">คะแนน {{ lastScore }}</div>
        <div v-if="saveState === 'saved'" class="cr-over-coin">+{{ earned.toLocaleString() }} 🪙</div>
        <div v-else-if="saveState === 'saving'" class="cr-over-coin">กำลังบันทึก…</div>
        <button v-else-if="saveState === 'failed'" class="cr-retry" @click="saveResult">
          บันทึกไม่สำเร็จ — ลองอีกครั้ง
        </button>
        <div class="cr-over-btns">
          <button class="cr-start" @click="begin">เล่นอีกครั้ง</button>
          <button class="cr-exit" @click="$router.push('/play')">ออก</button>
        </div>
      </div>
    </template>
  </MinigameShell>
</template>

<script setup>
import { ref, computed, onBeforeUnmount } from 'vue'
import { increment } from 'firebase/firestore'
import MinigameShell from '../components/minigame/MinigameShell.vue'
import Emoji from '../components/shared/Emoji.vue'
import { useCapsuleRush } from '../composables/useCapsuleRush.js'
import { getMinigame, MINIGAMES } from '../data/minigames.js'
import { grantCoins } from '../utils/minigameCore.js'
import { fluentFile } from '../utils/emoji.js'
import { useAuthStore } from '../stores/auth.js'
import { logCheat } from '../utils/cheatLog.js' // ตรวจชื่อจริงใน Step 3

const GAME = getMinigame('capsuleRush')
const auth = useAuthStore()
const canvasEl = ref(null)
const phase = ref('pick') // 'pick' | 'play' | 'over'
const lastScore = ref(0)
const earned = ref(0)
const saveState = ref('idle') // idle | saving | saved | failed

const best = computed(() => auth.userData?.minigames?.capsuleRush?.best || 0)
const petChoices = computed(() => (auth.userData?.pets || []).slice(0, 12))
const LS_KEY = 'rxtu10:capsuleRush:pet'
const chosen = ref(localStorage.getItem(LS_KEY)
  || auth.userData?.pets?.[0]?.emoji || '💊')

const { score, start, stop, flap, dispose, WORLD_W, WORLD_H } =
  useCapsuleRush(canvasEl, { onGameOver })

function loadSprite(emoji) {
  return new Promise((resolve) => {
    const f = fluentFile(emoji)
    if (!f) return resolve(null)
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => resolve(null) // fallback → engine วาด fillText
    img.src = import.meta.env.BASE_URL + f
  })
}

async function begin() {
  localStorage.setItem(LS_KEY, chosen.value)
  phase.value = 'play'
  saveState.value = 'idle'
  const sprite = await loadSprite(chosen.value)
  start(sprite)
}

function onGameOver(finalScore) {
  lastScore.value = finalScore
  phase.value = 'over'
  saveResult()
}

async function saveResult() {
  const score = lastScore.value
  if (score <= 0) { saveState.value = 'saved'; earned.value = 0; return }
  saveState.value = 'saving'
  const { coins, flagged } = grantCoins(score, GAME)
  earned.value = coins
  if (flagged) logCheat(auth, { type: 'minigameScore', game: 'capsuleRush', score })

  const cur = auth.userData?.minigames?.capsuleRush || { best: 0, plays: 0 }
  const newBest = Math.max(cur.best, score)
  const ok = await auth.patchUser(
    {
      coins: (auth.userData?.coins || 0) + coins,
      minigames: { ...auth.userData?.minigames, capsuleRush: { best: newBest, plays: cur.plays + 1 } },
    },
    {
      coins: increment(coins),
      'minigames.capsuleRush.best': newBest,
      'minigames.capsuleRush.plays': increment(1),
    },
  )
  saveState.value = ok ? 'saved' : 'failed'
}

onBeforeUnmount(() => { stop(); dispose() })
// เงียบ ESLint: MINIGAMES ใช้ที่อื่นได้ ถ้าไม่ใช้ให้ลบ import
void MINIGAMES
</script>

<style scoped>
.cr-pick { text-align: center; padding: 16px 0; }
.cr-pick-title { font-weight: 700; margin-bottom: 12px; }
.cr-pick-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 16px; }
.cr-pet { all: unset; cursor: pointer; font-size: 1.8rem; padding: 10px; border: 2px solid transparent;
  border-radius: 14px; background: rgba(0,0,0,.03); text-align: center; min-height: 44px; }
.cr-pet.sel { border-color: #4f46e5; background: rgba(79,70,229,.12); }
.cr-start { all: unset; cursor: pointer; background: #4f46e5; color: #fff; font-weight: 800;
  padding: 12px 28px; border-radius: 14px; }
.cr-exit { all: unset; cursor: pointer; padding: 12px 22px; border-radius: 14px; font-weight: 700;
  border: 2px solid var(--ink, #333); }
.cr-hint { font-size: .72rem; color: rgba(0,0,0,.45); margin-top: 12px; }
.cr-stage { position: relative; width: 100%; max-width: 400px; margin: 0 auto; touch-action: none; }
.cr-canvas { width: 100%; height: auto; border: 2px solid var(--ink, #333); border-radius: 14px;
  background: linear-gradient(160deg,#eff6ff,#dbeafe); display: block; }
.cr-score { position: absolute; top: 12px; left: 50%; transform: translateX(-50%);
  font-size: 2rem; font-weight: 900; color: #1e293b; text-shadow: 0 2px 0 #fff; }
.cr-over { text-align: center; padding: 18px 0; }
.cr-over-score { font-size: 1.4rem; font-weight: 900; }
.cr-over-coin { font-size: 1.1rem; font-weight: 800; color: #b45309; margin: 6px 0 14px; }
.cr-retry { all: unset; cursor: pointer; color: #dc2626; font-weight: 700; margin: 8px 0 14px; }
.cr-over-btns { display: flex; gap: 10px; justify-content: center; }
</style>
```

- [ ] **Step 3: ตรวจ helper ที่อ้างถึง** — ก่อน build:
  - `src/utils/cheatLog.js`: ตรวจว่ามีฟังก์ชัน log cheat จริงไหม (grep `cheatLogs` ในโปรเจกต์ดูรูปแบบเดิม). ถ้าไม่มี util สำเร็จรูป ให้ inline `addDoc(collection(db,'cheatLogs'), { uid, type, game, score, ts: serverTimestamp() })` แทน `logCheat(...)` และลบ import
  - ตรวจว่า `Emoji.vue` รับ prop ชื่อ `char` (จาก PlayView เดิมใช้ `<Emoji char="🎮" />` — ยืนยันแล้ว)

- [ ] **Step 4: build ผ่าน + ทดสอบ dev**

Run: `cd rxtu10-v2 && npm run build`
จากนั้น `npm run dev` → เปิด `/#/play/games/capsule-rush`:
- เลือกเพ็ท → เริ่ม → แตะจอกระพือ → ชน = game-over → เห็นคะแนน + เหรียญ
- กด 🏆 เห็นบอร์ด (ตัวเองขึ้นทันทีถ้าทำคะแนนได้)

- [ ] **Step 5: Commit**

```bash
git add src/views/CapsuleRushView.vue src/router/index.js
git commit -m "Minigame: Capsule Rush view + route (pet picker + game-over เขียน dot-notation + retry)"
```

---

### Task 9: Play landing เรนเดอร์การ์ดจาก registry

**Files:**
- Modify: `src/views/PlayView.vue:27-31` (section มินิเกม)

**Interfaces:**
- Consumes: `MINIGAMES` (Task 1), `authStore.userData.minigames`, `RouterLink`, `SoonCard`

- [ ] **Step 1: แก้ template section มินิเกม** — `src/views/PlayView.vue`

แทนบล็อก:
```html
      <!-- ── มินิเกม (เร็วๆ นี้) ── -->
      <SectionTitle><Emoji char="🎮" /> มินิเกม</SectionTitle>
      <div class="soon-grid">
        <SoonCard emoji="🍬" label="เภสัช Crush" />
      </div>
```
ด้วย:
```html
      <!-- ── มินิเกม (จาก registry data/minigames.js) ── -->
      <SectionTitle><Emoji char="🎮" /> มินิเกม</SectionTitle>
      <div class="soon-grid">
        <template v-for="g in games" :key="g.key">
          <RouterLink v-if="g.status === 'live'" :to="g.route" class="mg-card">
            <span class="mg-emoji"><Emoji :char="g.emoji" /></span>
            <span class="mg-name">{{ g.name }}</span>
            <span class="mg-best">สถิติ {{ bestOf(g.key).toLocaleString() }}</span>
          </RouterLink>
          <SoonCard v-else :emoji="g.emoji" :label="g.name" />
        </template>
      </div>
```

- [ ] **Step 2: เพิ่มใน `<script setup>`** — `src/views/PlayView.vue`

เพิ่ม import + computed:
```js
import { MINIGAMES } from '../data/minigames.js'

const games = MINIGAMES
const bestOf = (key) => authStore.userData?.minigames?.[key]?.best || 0
```

- [ ] **Step 3: เพิ่ม style** — `src/views/PlayView.vue` (ใน `<style scoped>`)

```css
.mg-card { all: unset; cursor: pointer; box-sizing: border-box; border: 2px solid var(--ink);
  border-radius: 16px; box-shadow: var(--pop); padding: 16px 12px; display: flex; flex-direction: column;
  align-items: center; gap: 4px; text-align: center; background: linear-gradient(160deg,#fef3c7,#fde68a); }
.mg-card:active { transform: translate(2px,2px); box-shadow: 0 0 0 var(--ink); }
.mg-emoji { font-size: 2rem; }
.mg-name { font-weight: 800; font-size: .9rem; }
.mg-best { font-size: .62rem; color: rgba(0,0,0,.5); font-weight: 600; }
```

- [ ] **Step 4: build + ทดสอบ dev**

Run: `cd rxtu10-v2 && npm run build`
`npm run dev` → หน้า `/#/play` เห็นการ์ด Capsule Rush (เล่นได้) + Pill Crush (soon) · กดการ์ดเข้าเกมได้

- [ ] **Step 5: Commit**

```bash
git add src/views/PlayView.vue
git commit -m "Play: เรนเดอร์การ์ดมินิเกมจาก registry (Capsule Rush เล่นได้ + soon)"
```

---

## Final verification (หลังครบ 9 tasks)

- [ ] `cd rxtu10-v2 && node --test src/utils/minigameCore.test.js` — ผ่านทั้งหมด
- [ ] `cd rxtu10-v2 && npm run build` — ผ่าน
- [ ] เทสจอจริง (มือถือ) ตาม spec §10:
  - เล่นจบ → เหรียญเข้า + best อัปเดต + ขึ้น leaderboard (ตัวเอง overlay ทันที)
  - เน็ตพังตอนจบ → ปุ่ม "ลองอีกครั้ง" บันทึกได้
  - สลับแอปกลางเกมกลับมา → ไม่ตายฟรี
  - บัญชีเก่า (ไม่มี minigames) เล่นได้ไม่ crash
  - ปุ่ม 🏆 ไม่โดน bottom-nav บัง (Teleport ทำงาน)
- [ ] push master (deploy) เมื่อ user ยืนยัน

## Self-review notes (ผู้เขียนแผน)
- Spec coverage: §2 registry→T1 · shell→T6 · route→T8 · landing→T9 · §3 schema/write→T1/T8 · §4 leaderboard→T2/T3/T4/T5 · §5 Capsule Rush→T7/T8 · §6 core+test→T2 · §7 anti-cheat(grantCoins/cheatLog)→T2/T8 · §8 write monitoring = runtime (ไม่ต้อง task)
- Type consistency: `buildMinigameBoard(fbUsers, me, key)` · `grantCoins(score, game)` · `useCapsuleRush(canvasRef,{onGameOver})→{score,start,stop,flap,dispose,WORLD_W,WORLD_H}` — ตรงกันทุก task
- จุดต้องยืนยันตอน implement (มี step ตรวจแล้ว): prop ของ BottomSheet (T6.S1) · helper รูป avatar (T5.S1) · util cheatLog vs inline addDoc (T8.S3)
