# Global Fun Facts Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show site-wide "fun fact" totals (questions answered, PvP battles fought, flashcards flipped, plus three more existing lifetime stats rolled up) on the dashboard, a new full stats page, and the pre-login page.

**Architecture:** A single Firestore doc `stats/global` holds six numeric fields. Two (`pvpTotal`, `flashcardFlips`) are live-incremented from new call sites via a fire-and-forget helper. Four (`quizTotal`, `farmSalesTotal`, `totalSpent`, `achievementsUnlockedTotal`) already exist per-user and get a one-time idempotent admin "backfill" button that sums across all users and overwrites `stats/global`. Three UI surfaces read the doc once on mount via `getDoc` — no live listener.

**Tech Stack:** Vue 3 (`<script setup>`), Pinia, Firebase/Firestore (client-only, no Cloud Functions), Vue Router (hash history), `node --test` for the one pure-logic module (no Vitest/Jest in this project).

## Global Constraints

- No test runner/lint exists project-wide; verify with `npm run build` + manual testing in `npm run dev`. Only pure, Firestore-free logic gets `node --test` unit tests — this matches every existing `*.test.js` file in the repo (`src/utils/roster.test.js` etc.), none of which mock Firestore.
- All user-doc writes must go through `auth.patchUser(optimistic, server)` — **not applicable here** since `stats/global` is not a user doc; direct `updateDoc`/`setDoc` calls on `stats/global` are correct and match the precedent of `useRosterSync.js`/`AdminView.vue`'s `rebuildRoster`.
- Every Firestore read/write outside `patchUser` must self-report to the usage meter via `useUsageStore().track(reads, writes)` (see `useRosterSync.js:57`, `AdminView.vue:783,786,789`) so the admin cost gauge stays accurate.
- Minimum font size `.7rem` anywhere in `.vue`/`.css` — do not go smaller in any new style block.
- Any `position:fixed` overlay rendered inside a view/component under `<RouterView>` must be wrapped in `<Teleport to="body">` — **not applicable here**, this feature adds no modals/overlays.
- After editing `firestore.rules`, it has **zero effect** until `firebase deploy --only firestore:rules` is run — `git push` alone does not deploy rules (CLAUDE.md pitfall #3).
- Commit message style: `Area: อะไร (ทำไม)`, Thai/English mixed, matching existing history.
- `bumpGlobalStat()` calls must always be fire-and-forget (never `await`ed by their caller) — a failure here must never block or roll back the real gameplay action it's attached to.
- The admin backfill (`computeGlobalStats`) must only ever write `quizTotal`, `farmSalesTotal`, `totalSpent`, `achievementsUnlockedTotal` via `setDoc(..., { merge: true })` — it must never touch `pvpTotal` or `flashcardFlips`, which have no historical source data and are live-increment-only.

---

### Task 1: Pure aggregation logic (`src/utils/globalStats.js`)

**Files:**
- Create: `src/utils/globalStats.js`
- Create: `src/utils/globalStats.test.js`

**Interfaces:**
- Produces: `DEFAULT_GLOBAL_STATS` (object, 6 numeric keys, all `0`) — consumed by Task 2's `fetchGlobalStats()` and by every UI component that renders stats before the real doc loads.
- Produces: `sumGlobalStatsFromUsers(usersData)` — `usersData: Array<object>` (raw Firestore `.data()` results from `users/*`), returns `{ quizTotal, farmSalesTotal, totalSpent, achievementsUnlockedTotal }` (4 keys only — no `pvpTotal`/`flashcardFlips`). Consumed by Task 4's `computeGlobalStats()` admin handler.

- [ ] **Step 1: Write the failing test**

Create `src/utils/globalStats.test.js`:

```js
import test from 'node:test'
import assert from 'node:assert/strict'
import { sumGlobalStatsFromUsers, DEFAULT_GLOBAL_STATS } from './globalStats.js'

test('sumGlobalStatsFromUsers รวม 4 ฟิลด์จากทุก user เข้าด้วยกัน', () => {
  const users = [
    { quizDoneTotal: 100, farmSalesTotal: 5000, totalSpent: 2000, achievementCount: 3 },
    { quizDoneTotal: 250, farmSalesTotal: 0,    totalSpent: 500,  achievementCount: 7 },
  ]
  const sums = sumGlobalStatsFromUsers(users)
  assert.equal(sums.quizTotal, 350)
  assert.equal(sums.farmSalesTotal, 5000)
  assert.equal(sums.totalSpent, 2500)
  assert.equal(sums.achievementsUnlockedTotal, 10)
})

test('sumGlobalStatsFromUsers ทนต่อ user ที่ไม่มีฟิลด์เลย (undefined นับเป็น 0)', () => {
  const sums = sumGlobalStatsFromUsers([{}, { quizDoneTotal: 5 }])
  assert.equal(sums.quizTotal, 5)
  assert.equal(sums.farmSalesTotal, 0)
  assert.equal(sums.totalSpent, 0)
  assert.equal(sums.achievementsUnlockedTotal, 0)
})

test('sumGlobalStatsFromUsers array ว่าง คืนค่า 0 ทั้งหมด', () => {
  const sums = sumGlobalStatsFromUsers([])
  assert.deepEqual(sums, { quizTotal: 0, farmSalesTotal: 0, totalSpent: 0, achievementsUnlockedTotal: 0 })
})

test('DEFAULT_GLOBAL_STATS มีครบ 6 ฟิลด์เป็น 0', () => {
  assert.deepEqual(DEFAULT_GLOBAL_STATS, {
    quizTotal: 0, pvpTotal: 0, flashcardFlips: 0,
    farmSalesTotal: 0, totalSpent: 0, achievementsUnlockedTotal: 0,
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test src/utils/globalStats.test.js`
Expected: FAIL — `Cannot find module './globalStats.js'` (file doesn't exist yet).

- [ ] **Step 3: Write the implementation**

Create `src/utils/globalStats.js`:

```js
// ตรรกะล้วน ไม่แตะ Firestore/Vue — เทส node --test src/utils/globalStats.test.js
// ดู docs/superpowers/specs/2026-09-14-global-fun-facts-design.md

export const DEFAULT_GLOBAL_STATS = {
  quizTotal: 0,
  pvpTotal: 0,
  flashcardFlips: 0,
  farmSalesTotal: 0,
  totalSpent: 0,
  achievementsUnlockedTotal: 0,
}

// รวม 4 ฟิลด์สะสมที่มีประวัติอยู่แล้วในทุก user doc (backfill ครั้งแรกเท่านั้น)
// pvpTotal/flashcardFlips ไม่รวมที่นี่ — ไม่มีประวัติเก่า ต้องเริ่มนับจาก bumpGlobalStat() เท่านั้น
export function sumGlobalStatsFromUsers(usersData) {
  const sums = { quizTotal: 0, farmSalesTotal: 0, totalSpent: 0, achievementsUnlockedTotal: 0 }
  for (const u of usersData) {
    sums.quizTotal += u?.quizDoneTotal || 0
    sums.farmSalesTotal += u?.farmSalesTotal || 0
    sums.totalSpent += u?.totalSpent || 0
    sums.achievementsUnlockedTotal += u?.achievementCount || 0
  }
  return sums
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test src/utils/globalStats.test.js`
Expected: PASS, 4 tests green.

- [ ] **Step 5: Commit**

```bash
git add src/utils/globalStats.js src/utils/globalStats.test.js
git commit -m "$(cat <<'EOF'
Stats: เพิ่ม globalStats.js ตรรกะรวมยอด fun-fact (เตรียม backfill)

รวม 4 ฟิลด์สะสมเดิม (quiz/farm/spent/achievements) จาก user doc เป็นค่าเดียว
เทสด้วย node --test ตามแพทเทิร์นเดิม (pure logic ไม่แตะ Firestore)
EOF
)"
```

---

### Task 2: Firestore-touching composable (`src/composables/useGlobalStats.js`)

**Files:**
- Create: `src/composables/useGlobalStats.js`

**Interfaces:**
- Consumes: `DEFAULT_GLOBAL_STATS` from `../utils/globalStats.js` (Task 1).
- Produces: `bumpGlobalStat(field, amount = 1)` — fire-and-forget, no return value used by callers. Consumed by Tasks 5–8 (QuizView, TimeAttackView, useArena, StudyView).
- Produces: `async fetchGlobalStats()` — returns `Promise<{quizTotal, pvpTotal, flashcardFlips, farmSalesTotal, totalSpent, achievementsUnlockedTotal}>`, always resolves (never throws), falling back to `DEFAULT_GLOBAL_STATS` on any error or missing doc. Consumed by Task 9 (`FunFactsWidget.vue`) and Task 10 (`FunFactsView.vue`).

No test for this file — matches every other Firestore-touching module in the repo (`useRosterSync.js`, `useArena.js`, `QuizView.vue`), none of which have a `.test.js`. Verified manually in Task 9/10's browser check instead.

- [ ] **Step 1: Write the implementation**

Create `src/composables/useGlobalStats.js`:

```js
import { doc, getDoc, updateDoc, increment } from 'firebase/firestore'
import { db } from '../firebase/config.js'
import { useUsageStore } from '../stores/usage.js'
import { DEFAULT_GLOBAL_STATS } from '../utils/globalStats.js'

// เพิ่มตัวนับ fun-fact รวมทั้งเว็บ — fire-and-forget เสมอ ห้าม await จากฝั่งเรียก
// ผิดพลาดได้ (offline/permission) ไม่กระทบเกม เลขคลาดเคลื่อนไป 1 ยอมรับได้
// ดีกว่าทำ action จริง (ส่งข้อสอบ/จบไฟต์ PvP/พลิกการ์ด) พังเพื่อฟีเจอร์นี้
export function bumpGlobalStat(field, amount = 1) {
  updateDoc(doc(db, 'stats', 'global'), { [field]: increment(amount) })
    .then(() => useUsageStore().track(0, 1))
    .catch(err => console.warn('[globalStats] bump failed', field, err))
}

// อ่านค่าปัจจุบันครั้งเดียว (ไม่ onSnapshot) — ใช้ทั้ง widget/หน้าเต็ม/หน้า login
// ไม่ throw ออกไปข้างนอกเลย — ผู้เรียกไม่ต้อง try/catch
export async function fetchGlobalStats() {
  try {
    const snap = await getDoc(doc(db, 'stats', 'global'))
    useUsageStore().track(1)
    return snap.exists() ? { ...DEFAULT_GLOBAL_STATS, ...snap.data() } : { ...DEFAULT_GLOBAL_STATS }
  } catch (e) {
    console.warn('[globalStats] fetch failed', e)
    return { ...DEFAULT_GLOBAL_STATS }
  }
}
```

- [ ] **Step 2: Manual smoke check**

Run `npm run build` — must succeed with no import errors (confirms `db`/`useUsageStore`/`DEFAULT_GLOBAL_STATS` paths resolve correctly). This module has no UI yet to click through; full manual verification happens once Tasks 3–10 wire it up.

- [ ] **Step 3: Commit**

```bash
git add src/composables/useGlobalStats.js
git commit -m "$(cat <<'EOF'
Stats: เพิ่ม useGlobalStats.js — bumpGlobalStat + fetchGlobalStats

Firestore-touching helper คู่กับ globalStats.js (pure logic) —
bump แบบ fire-and-forget เสมอ, fetch ไม่ throw ออกนอกเลย
EOF
)"
```

---

### Task 3: Firestore security rules — `stats/global` public-read exception

**Files:**
- Modify: `firestore.rules:310` (insert new `match` block immediately before the existing `match /stats/{id}` block at line 313)

**Interfaces:** None (rules only) — but Task 4's admin write and Tasks 5–8's live increments will fail with `permission-denied` until this is deployed, and Task 9's login-page read will fail until this is deployed.

- [ ] **Step 1: Add the new rule block**

In `firestore.rules`, insert immediately before the existing comment block at line 310 (`// ── Usage stats (Phase 3) ...`) and its `match /stats/{id} { ... }` at lines 313–324:

```
    // ── Global fun-fact counters (public read for the pre-login page) ──
    //  doc เดียว stats/global เก็บตัวเลขรวมทั้งเว็บโชว์เล่นๆ (ไม่กระทบเหรียญ/แต้มจริงของใคร)
    //  read: เปิดสาธารณะ เฉพาะ doc นี้ doc เดียว — ไม่กระทบ stats/{id} ตัวอื่นด้านล่าง (ยังต้อง isAdmin() เหมือนเดิม)
    //  write: ต้องล็อกอิน ไม่ต้อง admin — ระดับความน่าเชื่อถือเดียวกับจุดอื่นที่ client เขียนตรง (เศรษฐกิจ ฯลฯ)
    //  ดู docs/superpowers/specs/2026-09-14-global-fun-facts-design.md
    match /stats/global {
      allow get: if true;
      allow write: if request.auth != null;
    }

```

Leave the existing `match /stats/{id}` block (now starting a few lines further down) completely unchanged — Firestore rules are evaluated as OR across all matching blocks, so this narrower, more specific match only *adds* permission for the single path `stats/global`; it cannot weaken the generic block's `isAdmin()`-gated read for any other doc under `stats/*` (e.g. the daily usage-meter docs).

- [ ] **Step 2: Deploy the rules**

Run: `firebase deploy --only firestore:rules`
Expected: CLI reports success. **This step is not optional and has no code-level test** — CLAUDE.md pitfall #3: editing `firestore.rules` without running this command has zero effect on the live app, on either GitHub Pages or Firebase Hosting (both share the same Firestore project/rules).

- [ ] **Step 3: Manual verification**

Open the browser console on any page (logged out is fine) and run:
```js
firebase.firestore().doc('stats/global').get().then(s => console.log(s.exists, s.data()))
```
(or, since this app doesn't expose a global `firebase` object, verify indirectly once Task 9's login-page widget is wired up — an unauthenticated page successfully showing numbers, with no `permission-denied` in the console, confirms the rule works.)

- [ ] **Step 4: Commit**

```bash
git add firestore.rules
git commit -m "$(cat <<'EOF'
Rules: เปิด public read ให้ stats/global (fun facts หน้า login)

doc เดียวสำหรับตัวเลขรวมทั้งเว็บ ไม่กระทบ stats/{id} เดิม (usage meter ยัง isAdmin())
เขียนต้องล็อกอิน ไม่ต้อง admin — ระดับเชื่อถือเดียวกับจุดอื่นที่ client เขียนตรง
EOF
)"
```

---

### Task 4: Admin backfill button (`src/views/AdminView.vue`)

**Files:**
- Modify: `src/views/AdminView.vue:139` (insert new `<section class="admin-card">` template block right after the closing `</section>` of "Roster ทั้งรุ่น", before the "การใช้ Firestore" section)
- Modify: `src/views/AdminView.vue:463` (add import)
- Modify: `src/views/AdminView.vue:794` (insert new handler function right after `rebuildRoster`, before the blank line at 795)

**Interfaces:**
- Consumes: `sumGlobalStatsFromUsers` from `../utils/globalStats.js` (Task 1).
- Produces: nothing consumed elsewhere — this is a leaf admin action.

- [ ] **Step 1: Add the import**

In `src/views/AdminView.vue`, change line 463 from:
```js
import { buildRosterFromUsers } from '../utils/roster.js'
```
to:
```js
import { buildRosterFromUsers } from '../utils/roster.js'
import { sumGlobalStatsFromUsers } from '../utils/globalStats.js'
```

- [ ] **Step 2: Add the template section**

In `src/views/AdminView.vue`, insert this new `<section>` immediately after line 139 (`</section>` closing "Roster ทั้งรุ่น") and before line 141 (`<!-- ───── การใช้ Firestore (ประมาณการ) ───── -->`):

```html
      <!-- ───── Fun facts รวมทั้งเว็บ (stats/global) ───── -->
      <section class="admin-card">
        <div class="admin-card-head"><span><Emoji char="📊" /> สถิติรวมทั้งเว็บ (fun facts)</span></div>
        <div class="admin-hint">
          รวม 4 ตัวเลขสะสมของทุกคน (ข้อสอบ/ยอดขายฟาร์ม/เหรียญที่ใช้/ความสำเร็จ) เข้า doc เดียว
          ให้หน้า fun facts อ่าน <b>1 read</b> แทนอ่าน user ทุกคน · <b>ต้องกดครั้งแรกหนึ่งครั้ง</b>
          ก่อนหน้า fun facts จะมีเลข · กดซ้ำได้ ปลอดภัย (คำนวณใหม่จากของจริงเสมอ ไม่บวกซ้ำ) ·
          ไม่แตะตัวนับ PvP/พลิกการ์ด (สองตัวนั้นนับสดจากการเล่นเท่านั้น)
        </div>
        <button class="btn-mini" :disabled="computingGlobalStats" @click="computeGlobalStats">
          {{ computingGlobalStats ? 'กำลังคำนวณ…' : '📊 คำนวณสถิติรวมครั้งแรก' }}
        </button>
      </section>

```

- [ ] **Step 3: Add the handler function**

In `src/views/AdminView.vue`, insert this immediately after line 794 (the closing `}` of `rebuildRoster`) and before line 796 (`const usageLevel = computed(...)`):

```js

// ── คำนวณสถิติรวมทั้งเว็บครั้งแรก (fun facts) — อ่าน users ทั้ง collection, sum, set ทับ
//    เฉพาะ 4 ฟิลด์ที่มีประวัติเก่า (ห้ามแตะ pvpTotal/flashcardFlips — ไม่มีประวัติเก่า
//    สองตัวนั้นถูก bumpGlobalStat() เพิ่มสดจากการเล่นเท่านั้น) กดซ้ำได้ปลอดภัยเพราะ sum ใหม่ทุกครั้ง
const computingGlobalStats = ref(false)
async function computeGlobalStats() {
  if (computingGlobalStats.value) return
  computingGlobalStats.value = true
  try {
    const snap = await getDocs(collection(db, 'users'))
    usage.track(snap.size)
    const sums = sumGlobalStatsFromUsers(snap.docs.map(d => d.data()))
    await setDoc(doc(db, 'stats', 'global'), sums, { merge: true })
    usage.track(0, 1)
    toast(`คำนวณสถิติรวมแล้ว (ข้อสอบ ${sums.quizTotal.toLocaleString()} ข้อ)`, 'success')
  } catch (e) {
    console.error('[computeGlobalStats]', e); toast('คำนวณสถิติรวมไม่สำเร็จ', 'error')
  } finally { computingGlobalStats.value = false }
}
```

- [ ] **Step 4: Manual verification**

Run `npm run dev`, log in as the admin account (`ADMIN_EMAIL` in `src/firebase/config.js`), go to `/admin`, click "📊 คำนวณสถิติรวมครั้งแรก". Expected: success toast showing a non-zero quiz total (assuming any user has answered quizzes before); open Firestore console and confirm `stats/global` now has `quizTotal`, `farmSalesTotal`, `totalSpent`, `achievementsUnlockedTotal` populated and **no** `pvpTotal`/`flashcardFlips` keys yet. Click the button again — confirm the numbers stay the same (idempotent), not doubled.

- [ ] **Step 5: Commit**

```bash
git add src/views/AdminView.vue
git commit -m "$(cat <<'EOF'
Admin: เพิ่มปุ่มคำนวณสถิติรวมทั้งเว็บครั้งแรก (fun facts backfill)

sum 4 ฟิลด์เก่าจากทุก user doc แล้ว set ทับ stats/global (merge: true)
กดซ้ำได้ปลอดภัย ไม่แตะ pvpTotal/flashcardFlips ที่ต้องนับสดเท่านั้น
EOF
)"
```

---

### Task 5: Wire quiz submission (`src/views/QuizView.vue`)

**Files:**
- Modify: `src/views/QuizView.vue:158` (add import)
- Modify: `src/views/QuizView.vue:563-564`

**Interfaces:**
- Consumes: `bumpGlobalStat` from `../composables/useGlobalStats.js` (Task 2).

- [ ] **Step 1: Add the import**

Change line 158 from:
```js
import { useRosterSync } from '../composables/useRosterSync.js'
```
to:
```js
import { useRosterSync } from '../composables/useRosterSync.js'
import { bumpGlobalStat } from '../composables/useGlobalStats.js'
```

- [ ] **Step 2: Wire the bump**

Change (current lines 563–564):
```js
  if (ok) missingQIds.value = []
  else toast('บันทึกผลไม่สำเร็จ — ลองใหม่อีกครั้ง', 'error')
```
to:
```js
  if (ok) {
    missingQIds.value = []
    bumpGlobalStat('quizTotal', answered.value)
  } else {
    toast('บันทึกผลไม่สำเร็จ — ลองใหม่อีกครั้ง', 'error')
  }
```

- [ ] **Step 3: Manual verification**

Run `npm run dev`, log in, go to `/quiz`, answer a few questions, submit. Expected: quiz submission works exactly as before (coins/toast unchanged); no new console errors. In Firestore console, confirm `stats/global.quizTotal` increased by the number of questions answered in that run.

- [ ] **Step 4: Commit**

```bash
git add src/views/QuizView.vue
git commit -m "$(cat <<'EOF'
Quiz: bump stats/global.quizTotal ทุกครั้งที่ส่งข้อสอบสำเร็จ

fire-and-forget — ไม่กระทบ flow เดิมถ้าเขียนไม่สำเร็จ
EOF
)"
```

---

### Task 6: Wire Time Attack submission (`src/views/TimeAttackView.vue`)

**Files:**
- Modify: `src/views/TimeAttackView.vue:115` (add import)
- Modify: `src/views/TimeAttackView.vue:373-374`

**Interfaces:**
- Consumes: `bumpGlobalStat` from `../composables/useGlobalStats.js` (Task 2).

- [ ] **Step 1: Add the import**

Change line 115 from:
```js
import { useRosterSync } from '../composables/useRosterSync.js'
```
to:
```js
import { useRosterSync } from '../composables/useRosterSync.js'
import { bumpGlobalStat } from '../composables/useGlobalStats.js'
```

- [ ] **Step 2: Wire the bump**

Change (current lines 373–374):
```js
  if (!ok) { toast('บันทึกผลไม่สำเร็จ — ลองใหม่อีกครั้ง', 'error'); return }
  if (grant) toast(`ได้ ${grant.toLocaleString()}🪙 จาก Time Attack`, 'success')
```
to:
```js
  if (!ok) { toast('บันทึกผลไม่สำเร็จ — ลองใหม่อีกครั้ง', 'error'); return }
  bumpGlobalStat('quizTotal', snapAnswered)
  if (grant) toast(`ได้ ${grant.toLocaleString()}🪙 จาก Time Attack`, 'success')
```

- [ ] **Step 3: Manual verification**

Run `npm run dev`, log in, go to `/study/time-attack`, play a round to completion. Expected: existing behavior unchanged. Confirm `stats/global.quizTotal` increased by the answered count from that run.

- [ ] **Step 4: Commit**

```bash
git add src/views/TimeAttackView.vue
git commit -m "$(cat <<'EOF'
TimeAttack: bump stats/global.quizTotal ทุกครั้งที่จบรอบสำเร็จ

ใช้ field เดียวกับ Quiz ปกติ (quizTotal) — ทั้งสองโหมดนับรวมกันเป็นตัวเดียว
EOF
)"
```

---

### Task 7: Wire PvP battle resolution (`src/composables/useArena.js`)

**Files:**
- Modify: `src/composables/useArena.js:12` (add import)
- Modify: `src/composables/useArena.js:126-127`

**Interfaces:**
- Consumes: `bumpGlobalStat` from `./useGlobalStats.js` (Task 2).

- [ ] **Step 1: Add the import**

Change line 12 from:
```js
import { useRosterSync } from './useRosterSync.js'
```
to:
```js
import { useRosterSync } from './useRosterSync.js'
import { bumpGlobalStat } from './useGlobalStats.js'
```

- [ ] **Step 2: Wire the bump**

In `applyResult`, change (current lines 123–127):
```js
    syncRosterRow({
      history: opp.isBot ? null : { u: opp.uid, w: won ? 1 : 0, c: coin, t: Date.now() },
      event: (newRank < prevRank && newRank <= 10) ? { k: 'pv', v: newRank, t: Date.now() } : null,
    })
    return { ok, newRating, delta: newRating - base.rating, coin }
```
to:
```js
    syncRosterRow({
      history: opp.isBot ? null : { u: opp.uid, w: won ? 1 : 0, c: coin, t: Date.now() },
      event: (newRank < prevRank && newRank <= 10) ? { k: 'pv', v: newRank, t: Date.now() } : null,
    })
    if (ok) bumpGlobalStat('pvpTotal', 1)
    return { ok, newRating, delta: newRating - base.rating, coin }
```

This fires once per resolved battle — bot or human opponent, win or lose — matching `applyResult`'s single unconditional call site from `fight()`. Gated on `ok` so a failed write doesn't inflate the counter for a battle that didn't actually save.

- [ ] **Step 3: Manual verification**

Run `npm run dev`, log in, go to `/arena`, fight one opponent (bot is fine). Expected: existing PvP flow (result screen, rating change, roster update) unchanged. Confirm `stats/global.pvpTotal` incremented by 1. Fight a second time and confirm it increments again regardless of win/loss.

- [ ] **Step 4: Commit**

```bash
git add src/composables/useArena.js
git commit -m "$(cat <<'EOF'
Arena: bump stats/global.pvpTotal ทุกไฟต์ที่จบสำเร็จ (รวมบอท)

นับทุกครั้งไม่ว่าแพ้ชนะ/สู้บอทหรือคนจริง — gate ด้วย ok กันนับไฟต์ที่เขียนไม่สำเร็จ
EOF
)"
```

---

### Task 8: Wire flashcard flip (`src/views/StudyView.vue`)

**Files:**
- Modify: `src/views/StudyView.vue:187` (add import)
- Modify: `src/views/StudyView.vue:110` (template)
- Modify: `src/views/StudyView.vue:231` (add function, right after the session-state refs block)

**Interfaces:**
- Consumes: `bumpGlobalStat` from `../composables/useGlobalStats.js` (Task 2).
- Consumes: `flipped` ref, already declared at `StudyView.vue:227`.

- [ ] **Step 1: Add the import**

Change line 187 from:
```js
import { useToast } from '../composables/useToast.js'
```
to:
```js
import { useToast } from '../composables/useToast.js'
import { bumpGlobalStat } from '../composables/useGlobalStats.js'
```

- [ ] **Step 2: Add the flip handler function**

The flip trigger is currently an inline template expression, not a named function — insert a real handler after line 231 (`const rewarded = ref(new Set())`), before line 233 (`const coachStep = ref(1)`):

```js

// พลิกการ์ดดูเฉลย — นับเข้าตัวเลข fun fact รวมทั้งเว็บ (พลิกซ้ำใบเดิมก็นับ ไม่ dedupe)
function flipCard() {
  if (flipped.value) return
  flipped.value = true
  bumpGlobalStat('flashcardFlips', 1)
}
```

- [ ] **Step 3: Wire the template**

Change line 110 from:
```html
      <div class="sv-card" :class="{ flipped }" @click="!flipped && (flipped = true)">
```
to:
```html
      <div class="sv-card" :class="{ flipped }" @click="flipCard">
```

- [ ] **Step 4: Manual verification**

Run `npm run dev`, log in, go to `/study`, start a review session, tap a card to flip it. Expected: card flips exactly as before, grading/SRS logic (lines ~306–347, untouched) still works. Confirm `stats/global.flashcardFlips` incremented by 1. Advance to the next card (which resets `flipped` back to `false` — existing logic at line ~341) and flip it again; confirm the counter keeps incrementing per flip, including if you were to flip, grade-reject, and see the same card again later in the queue.

- [ ] **Step 5: Commit**

```bash
git add src/views/StudyView.vue
git commit -m "$(cat <<'EOF'
Study: bump stats/global.flashcardFlips ทุกครั้งที่พลิกการ์ด

แปลง inline @click เป็น flipCard() เพื่อแทรก bump — พฤติกรรมพลิกเดิมไม่เปลี่ยน
นับซ้ำได้ (ไม่ dedupe เหมือน studyReviewedTotal ที่มีอยู่แล้ว)
EOF
)"
```

---

### Task 9: Shared widget component + wire into dashboard and login page

**Files:**
- Create: `src/components/shared/FunFactsWidget.vue`
- Modify: `src/views/HomeView.vue:27` (import + template)
- Modify: `src/components/onboarding/LoginLanding.vue:6` (import + template)

**Interfaces:**
- Consumes: `fetchGlobalStats` from `../../composables/useGlobalStats.js` and `DEFAULT_GLOBAL_STATS` from `../../utils/globalStats.js` (both from `src/components/shared/`, hence the `../../` prefix).
- Produces: `<FunFactsWidget />` component, no props, no emits — self-contained.

- [ ] **Step 1: Create the widget component**

Create `src/components/shared/FunFactsWidget.vue`:

```vue
<template>
  <div v-if="!loading" class="ffw">
    <div class="ffw-row"><Emoji char="📝" /> เพื่อนๆ ทำข้อสอบไปแล้ว <b>{{ stats.quizTotal.toLocaleString() }}</b> ข้อ</div>
    <div class="ffw-row"><Emoji char="⚔️" /> สู้กันไปแล้ว <b>{{ stats.pvpTotal.toLocaleString() }}</b> ครั้ง</div>
    <div class="ffw-row"><Emoji char="🃏" /> พลิกการ์ดไปแล้ว <b>{{ stats.flashcardFlips.toLocaleString() }}</b> ครั้ง</div>
    <RouterLink to="/fun-facts" class="ffw-more">ดูสถิติทั้งหมด →</RouterLink>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import Emoji from './Emoji.vue'
import { fetchGlobalStats } from '../../composables/useGlobalStats.js'
import { DEFAULT_GLOBAL_STATS } from '../../utils/globalStats.js'

const stats = ref(DEFAULT_GLOBAL_STATS)
const loading = ref(true)

onMounted(async () => {
  stats.value = await fetchGlobalStats()
  loading.value = false
})
</script>

<style scoped>
.ffw { background:#fff; border:2px solid var(--ink); border-radius:14px; box-shadow:var(--pop); padding:12px 14px; margin:10px 0; display:flex; flex-direction:column; gap:6px; }
.ffw-row { font-size:.82rem; color:var(--ink); display:flex; align-items:center; gap:6px; }
.ffw-more { align-self:flex-end; font-size:.75rem; color:var(--accent,#4f46e5); font-weight:700; text-decoration:none; }
</style>
```

- [ ] **Step 2: Wire into the dashboard**

In `src/views/HomeView.vue`, add the import alongside the other card imports (near line 58, after `ExpeditionCard`):
```js
import FunFactsWidget from '../components/shared/FunFactsWidget.vue'
```
Add the component to the template right after `<ExpeditionCard />` (line 27) and before the admin `RouterLink` (line 30):
```html
      <FunFactsWidget />
```

- [ ] **Step 3: Wire into the login page**

In `src/components/onboarding/LoginLanding.vue`, add the import:
```js
import FunFactsWidget from '../shared/FunFactsWidget.vue'
```
(placed alongside the existing `import Emoji from '../shared/Emoji.vue'` at line 21)

Add the component to the template right after line 6 (`<p class="ll-msg">...</p>`) and before line 8's in-app-browser warning comment:
```html
    <FunFactsWidget />
```

- [ ] **Step 4: Manual verification**

Run `npm run dev`. Logged in: open `/` (Home) and confirm the widget shows real numbers matching `stats/global` in the Firestore console, with a working "ดูสถิติทั้งหมด →" link. Logged out (or an incognito window): confirm the same widget renders on the login screen with no console errors (validates Task 3's public-read rule actually works end to end) and that the "เข้าสู่ระบบด้วย Google" button still works normally below it.

- [ ] **Step 5: Commit**

```bash
git add src/components/shared/FunFactsWidget.vue src/views/HomeView.vue src/components/onboarding/LoginLanding.vue
git commit -m "$(cat <<'EOF'
UI: เพิ่ม FunFactsWidget โชว์ที่หน้า Home และหน้า login

component เดียวใช้ร่วมกัน 2 ที่ — อ่าน stats/global ครั้งเดียวตอน mount
หน้า login อ่านได้แม้ยังไม่ล็อกอิน (ต้องมี rule public-read จาก Task 3 ก่อน)
EOF
)"
```

---

### Task 10: Full stats page + route

**Files:**
- Create: `src/views/FunFactsView.vue`
- Modify: `src/router/index.js:29` (add route)
- Modify: `src/views/MeView.vue:35` (add nav link)

**Interfaces:**
- Consumes: `fetchGlobalStats` from `../composables/useGlobalStats.js`, `DEFAULT_GLOBAL_STATS` from `../utils/globalStats.js`.

- [ ] **Step 1: Create the full stats page**

Create `src/views/FunFactsView.vue`:

```vue
<template>
  <div class="tab-content">
    <div class="page-title"><Emoji char="📊" /> สถิติรวมทั้งเว็บ</div>
    <div class="ff-sub">ตัวเลขนี้เป็นของทุกคนในรุ่นรวมกัน ไม่ใช่ของคุณคนเดียว</div>

    <div v-if="loading" class="ff-empty">กำลังโหลด…</div>
    <div v-else class="ff-list">
      <div class="ff-row"><Emoji char="📝" /><span class="ff-label">ข้อสอบที่ตอบรวมกัน</span><b class="ff-num">{{ stats.quizTotal.toLocaleString() }}</b><span class="ff-unit">ข้อ</span></div>
      <div class="ff-row"><Emoji char="⚔️" /><span class="ff-label">ไฟต์ PvP ที่สู้กันไปแล้ว</span><b class="ff-num">{{ stats.pvpTotal.toLocaleString() }}</b><span class="ff-unit">ครั้ง</span></div>
      <div class="ff-row"><Emoji char="🃏" /><span class="ff-label">พลิกการ์ดไปแล้ว</span><b class="ff-num">{{ stats.flashcardFlips.toLocaleString() }}</b><span class="ff-unit">ครั้ง</span></div>
      <div class="ff-row"><Emoji char="🌾" /><span class="ff-label">ยอดขายฟาร์มสะสม</span><b class="ff-num">{{ stats.farmSalesTotal.toLocaleString() }}</b><span class="ff-unit">เหรียญ</span></div>
      <div class="ff-row"><Emoji char="💰" /><span class="ff-label">เหรียญที่ใช้ไปสะสม</span><b class="ff-num">{{ stats.totalSpent.toLocaleString() }}</b><span class="ff-unit">เหรียญ</span></div>
      <div class="ff-row"><Emoji char="🏆" /><span class="ff-label">ความสำเร็จที่ปลดรวมกัน</span><b class="ff-num">{{ stats.achievementsUnlockedTotal.toLocaleString() }}</b><span class="ff-unit">รายการ</span></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Emoji from '../components/shared/Emoji.vue'
import { fetchGlobalStats } from '../composables/useGlobalStats.js'
import { DEFAULT_GLOBAL_STATS } from '../utils/globalStats.js'

const stats = ref(DEFAULT_GLOBAL_STATS)
const loading = ref(true)

onMounted(async () => {
  stats.value = await fetchGlobalStats()
  loading.value = false
})
</script>

<style scoped>
.ff-sub { font-size:.78rem; color:var(--muted); margin:-4px 0 14px; }
.ff-empty { font-size:.82rem; color:var(--muted); padding:20px 0; text-align:center; }
.ff-list { display:flex; flex-direction:column; gap:10px; }
.ff-row { display:flex; align-items:center; gap:8px; background:#fff; border:2px solid var(--ink); border-radius:12px; padding:10px 12px; box-shadow:var(--pop); }
.ff-label { flex:1; font-size:.8rem; color:var(--ink); }
.ff-num { font-size:1rem; color:var(--accent,#4f46e5); }
.ff-unit { font-size:.74rem; color:var(--muted); }
</style>
```

- [ ] **Step 2: Add the route**

In `src/router/index.js`, add this line after line 29 (`stacker` route) and before line 30's comment:
```js
    { path: '/fun-facts', name: 'funFacts', component: () => import('../views/FunFactsView.vue') },
```
No `meta` field needed — this route has no auth gate (matches every other route in this file except the four `GATED` feature-flagged ones, which this isn't).

- [ ] **Step 3: Add a nav link from the "ฉัน" (Me) page**

In `src/views/MeView.vue`, add a new link right after the existing history link at line 35:
```html
      <RouterLink to="/quiz?view=history" class="me-link"><Emoji char="📊" /> ประวัติการทำข้อสอบ</RouterLink>
      <RouterLink to="/fun-facts" class="me-link"><Emoji char="🌐" /> สถิติรวมทั้งเว็บ</RouterLink>
```
(`RouterLink` and the `.me-link` style are already imported/defined in this file — no new imports needed.)

- [ ] **Step 4: Manual verification**

Run `npm run dev`, log in, go to `/me`, click "🌐 สถิติรวมทั้งเว็บ" — confirm it navigates to `/fun-facts` and shows all six numbers matching Firestore. Click the "ดูสถิติทั้งหมด →" link from the Task 9 dashboard widget and confirm it lands on the same page. Run `npm run build` and confirm it completes with no errors (new route/component compile cleanly).

- [ ] **Step 5: Commit**

```bash
git add src/views/FunFactsView.vue src/router/index.js src/views/MeView.vue
git commit -m "$(cat <<'EOF'
UI: เพิ่มหน้า /fun-facts โชว์สถิติรวมทั้งเว็บครบ 6 ตัว

ลิงก์เข้าถึงจากหน้า "ฉัน" และจาก widget หน้า Home/login
EOF
)"
```

---

## Post-implementation checklist (not a task — a reminder for whoever executes this plan)

1. Tasks must run in order 1 → 10: Task 2 imports Task 1's output; Tasks 4–10 all import Task 2's `bumpGlobalStat`/`fetchGlobalStats`; Task 3 (rules deploy) must land before Tasks 4/9's manual verification steps can actually succeed against a real Firestore project (the writes/public-read will 403 until then).
2. After Task 4 is deployed to production (`git push origin master`) and the admin has clicked "📊 คำนวณสถิติรวมครั้งแรก" at least once in production, the fun-fact page will show real historical numbers for 4 of 6 stats; `pvpTotal`/`flashcardFlips` will read `0` until real traffic starts hitting Tasks 5–8's new call sites. This is expected, not a bug (see spec).
