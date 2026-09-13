# Global Fun Facts — Design

Date: 2026-09-14
Status: Approved by user, ready for implementation planning

## Problem

The user wants site-wide "fun fact" style aggregate stats visible to everyone — e.g. "friends have answered 20,000 quiz questions in total" — not per-user stats (those already exist via `ProfileModal` / achievements). Nothing today aggregates across all users into a single number.

## Scope

Three new/confirmed site-wide lifetime counters, plus existing per-user lifetime fields rolled up into totals:

**New counters (no historical data — start at 0 from ship date):**
- `quizTotal` — actually NOT new, see below; listed here for clarity of naming only.
- `pvpTotal` — every PvP battle resolved via the live arena board (`useArena.js` → `applyResult`), **including bot fill-in matches**, regardless of win/loss. Counted once per battle.
- `flashcardFlips` — every time a flashcard is flipped to reveal the answer in `StudyView.vue`, **including repeated flips of the same card** (not deduplicated, unlike the existing `studyReviewedTotal`).

**Existing lifetime fields to roll up into global totals (already accumulate historical data):**
- `quizTotal` ← sum of every user's `quizDoneTotal` (`src/data/userSchema.js:43`)
- `farmSalesTotal` ← sum of every user's `farmSalesTotal` (`useFarm.js`)
- `totalSpent` ← sum of every user's `totalSpent`
- `achievementsUnlockedTotal` ← sum of every user's `achievementCount`

Out of scope: anything derived from `towerBest` (a per-user high-water mark, not a summable quantity) and the two backlog items noted separately ([[rxtu10-profile-stale-and-unranked-duel]]) — those are explicitly parked, not part of this feature.

## Data model

Single new Firestore document: `stats/global`

```
stats/global: {
  quizTotal: number,
  pvpTotal: number,
  flashcardFlips: number,
  farmSalesTotal: number,
  totalSpent: number,
  achievementsUnlockedTotal: number,
}
```

One doc, six fields. No sharding — traffic at this app's scale (~100–300 students, non-synchronized actions) does not approach Firestore's single-document contention limits. Sharded counters would add complexity with no measurable benefit here (rejected — see Alternatives).

## Backfill (one-time, admin-triggered)

`quizTotal`, `farmSalesTotal`, `totalSpent`, `achievementsUnlockedTotal` already have historical values sitting in every user doc, accumulated before this feature existed. A live-increment-only approach would start those four fields at 0 and lose all prior history.

**Fix:** an admin-panel button — "📊 คำนวณสถิติรวมครั้งแรก" — following the project's existing "click once after deploy" convention (e.g. "🔄 สร้าง roster ใหม่", "🔄 ซิงก์ระบบตรวจ", "🏷️ แมพหมวด"). On click it:
1. Reads all `users/*` docs.
2. Sums `quizDoneTotal`, `farmSalesTotal`, `totalSpent`, `achievementCount` across all of them.
3. **`setDoc` (overwrite), not `increment`**, writing only those four fields into `stats/global`.

This makes the button idempotent and safe to click multiple times: since the four source fields are monotonically non-decreasing per-user lifetime counters, re-running the backfill just recomputes the same-or-larger correct sum. There is no risk of double-counting from repeated clicks, unlike a one-shot increment migration.

**Hard constraint:** the backfill button must never write `pvpTotal` or `flashcardFlips` — those two have no historical source data and must only ever be touched by the live increment hooks below. Mixing the two write paths on the same fields would either wipe live increments or double-count.

Known consequence, already accepted by the user: after backfill, `quizTotal` will show a large historical number (thousands) while `pvpTotal` and `flashcardFlips` start at 0 and grow only from the ship date forward. This asymmetry is expected, not a bug.

## Write path (live increments)

New helper: `src/utils/globalStats.js`

```js
export function bumpGlobalStat(field, amount = 1) {
  updateDoc(doc(db, 'stats', 'global'), { [field]: increment(amount) })
    .catch(err => console.warn('[globalStats] bump failed', field, err))
}
```

Called **fire-and-forget** (not awaited) everywhere it's used. Rationale: this is a decorative, low-stakes number. If it fails (offline, rules issue, transient error), the primary gameplay action it's attached to — submitting a quiz, finishing a PvP battle, flipping a flashcard — must never be blocked, delayed, or rolled back because of it. An occasional missed increment is an acceptable failure mode; breaking the real feature to protect a fun-fact counter is not.

**Four call sites:**
1. `QuizView.vue` (~line 551, 558) — alongside the existing `increment(answered.value)` write to the user's `quizDoneTotal`, add `bumpGlobalStat('quizTotal', answered.value)`.
2. `TimeAttackView.vue` (~line 361, 369) — same treatment as above.
3. `src/composables/useArena.js` (`applyResult`, ~lines 83–112) — add `bumpGlobalStat('pvpTotal', 1)` once per battle resolution, unconditional on win/loss/bot-vs-human.
4. `StudyView.vue` — the flashcard-flip action (distinct from the grading logic at lines 319–373; exact flip handler not yet located as of this spec — **must be located during implementation planning**, e.g. via a targeted code search for the "reveal answer" / flip toggle). Add `bumpGlobalStat('flashcardFlips', 1)` there, fired on every flip including repeats of the same card.

## UI placement

Three surfaces, all reading `stats/global`:

1. **Dashboard widget** — compact card on the main dashboard shown after login, e.g. "🧑‍⚕️ เพื่อนๆ ทำข้อสอบไปแล้ว 12,345 ข้อ · ⚔️ สู้กันไป 890 ครั้ง · 🃏 พลิกการ์ด 3,201 ครั้ง".
2. **Full stats page** — new route (e.g. `/fun-facts`), showing all six numbers with icon + short label, linked from the main nav menu.
3. **Login page** — same widget (or a subset) shown to signed-out visitors, to give a taste of site activity before signing in.

**Read strategy:** one-time `getDoc` on mount for each surface, not a live `onSnapshot` listener. This is a fun-fact display, not a live ticker — freshness on page load/navigation is enough, and it keeps read cost to a minimum (matches this project's general cost-consciousness). If the doc is missing or the read fails, surfaces show 0 or hide silently — no user-visible error.

## Security rules

`stats/global` needs different rules from the rest of the app because of the login-page requirement:

- **Read:** public — `allow get` on this single document only, unauthenticated. Every other document/collection keeps its existing auth-required rules; this is a narrowly scoped exception for exactly one doc path.
- **Write:** requires `request.auth != null`. No stronger integrity check (e.g. field-level increment enforcement) is added — this matches the trust level already extended to authenticated clients elsewhere in the app's economy-related writes. Worst case of a malicious client is a cosmetically wrong fun-fact number; it cannot affect coins, ratings, or any real game state.

## Testing

- Unit test `bumpGlobalStat()`: calls `updateDoc` with the correct field name and `increment(amount)`.
- Unit test each of the 4 call sites: verify `bumpGlobalStat` is invoked with the right field/amount at the right moment (quiz submit, time-attack submit, PvP battle resolution including bot matches, flashcard flip including repeats).
- Unit test the backfill button: correct sums; running it twice produces the same result (idempotency); confirms `pvpTotal`/`flashcardFlips` are never written by it.
- Manual: open the login page in an incognito/signed-out browser session and confirm real numbers render with no console errors.
- Manual: perform one of each tracked action while logged in, confirm the corresponding `stats/global` field increments by the expected amount.

## Alternatives considered (rejected)

- **Sharded counters** for `stats/global` — avoids single-document write contention under heavy concurrent load. Rejected: this app's scale (~100–300 users, non-synchronized action bursts) doesn't approach Firestore's per-document write-rate limits. Adds complexity with no measurable benefit today.
- **Cloud Function aggregator** (server-side trigger on user-doc writes, or scheduled recompute) — more tamper-resistant since the client can't write the aggregate directly. Rejected: this project has no Cloud Functions infrastructure at all today, and standing one up is disproportionate effort for a purely decorative, non-economy-affecting feature. Revisit only if abuse of the fun-fact numbers becomes an actual problem.

## Related / explicitly out of scope

Two adjacent items were raised during this conversation and intentionally parked, not part of this design: `ProfileModal`'s stale `pvpVictories` field, and a proposed unranked "challenge to duel" feature from profile cards. See [[rxtu10-profile-stale-and-unranked-duel]] memory — do not fold that work into this implementation.
