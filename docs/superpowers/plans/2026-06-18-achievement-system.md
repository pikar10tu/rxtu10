# Achievement System (core) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** ระบบ achievement กลางที่ได้อัตโนมัติ (milestone + awarded) เก็บใน subcollection, เด้ง balloon + โพสต์กระดานข่าวตอนปลดล็อก, โชว์บนโปรไฟล์

**Architecture:** logic บริสุทธิ์อยู่ใน `utils/achievements.js` (+เทส); catalog ใน `data/achievements.js`; เก็บที่ `users/{uid}/achievements` (subcollection); grant 2 ทาง (milestone self-grant ผ่าน watcher กลาง + awarded ผ่าน Mailbox claim) — ทั้งคู่เจ้าของเขียน doc ตัวเอง; ประกาศ (balloon+news) ผ่าน helper ร่วม โดย backfill รอบแรกเงียบ

**Tech Stack:** Vue 3 `<script setup>`, Pinia, Firebase Firestore (modular SDK), Vite, `node:test`+`node:assert/strict`

## Global Constraints

- ทดสอบ pure util: `node --test src/utils/<file>.test.js` · ตรวจ build: `npm run build` (ไม่มี runner กลาง/lint)
- เขียน user doc ผ่าน `auth.patchUser(optimistic, server)` เท่านั้น · ฟิลด์ใหม่ใส่ `data/userSchema.js` ที่เดียว
- emoji ในเทมเพลตใช้ `<Emoji char="…" />` เสมอ · **ห้าม emoji ใน JS string / news `msg`** (→ tofu); ไอคอนไปที่ field แยกที่ render ผ่าน `<Emoji>`
- ข้อความผู้ใช้ → `cleanText(str, LIMITS.xxx)` ก่อนเขียน (ที่เกี่ยว: news msg ถ้ามาจาก input)
- commit style `Area: อะไร (ทำไม)` ไทยปนอังกฤษ · ลงท้าย body: `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`
- **git add เฉพาะไฟล์ที่ตั้งใจ** — ห้าม `git add -A`
- single-file component + scoped style · ธีม `--primary` #4f46e5
- rules แก้แล้วต้อง `firebase deploy --only firestore:rules` (manual, แจ้ง user)
- domain ของ achievement = catalog `ACHIEVEMENTS` (data-driven) · logic วน `MILESTONES` ไม่ hardcode id

---

## Task 1: catalog `data/achievements.js` + pure util `utils/achievements.js` + เทส

**Files:**
- Create: `src/data/achievements.js`
- Create: `src/utils/achievements.js`
- Test: `src/utils/achievements.test.js`

**Interfaces:**
- Produces (catalog): `ACHIEVEMENTS` (map), `getAchievement(id)`, `MILESTONES` (array ของ entry type 'milestone', แต่ละตัวมี `{id, title, icon, desc, type, trigger:{stat,gte}}`)
- Produces (util):
  - `computeProgress(userData) → { petCount, petSpeciesCount, quizDoneTotal, studyReviewedTotal, farmSalesTotal, totalSpent, residenceLevel }`
  - `resolveGte(gte, ctx) → number` (sentinel `'ALL_SPECIES'`→`ctx.allSpecies`, `'MAX_RESIDENCE'`→`ctx.maxResidence`)
  - `checkMilestones(milestones, progress, earnedIds, ctx) → string[]` (achId ใหม่)
  - `achievementTitle(def, date) → string`
  - `achievementDocId(achId, date) → string`
  - `buildAchievementNews(nickname, def, date) → { msg, icon, type:'achievement' }`

- [ ] **Step 1: เขียน catalog `src/data/achievements.js`**

```js
// ════════════════════════════════════════════════════════════
//  Achievement catalog (data-driven) — ความสำเร็จที่ได้อัตโนมัติ
//  type 'milestone' (trigger {stat,gte}) | 'awarded' (ระบบ/admin มอบ, dated?)
//  gte sentinel: 'ALL_SPECIES' = จำนวนสัตว์ทุกชนิด, 'MAX_RESIDENCE' = บ้านสูงสุด
// ════════════════════════════════════════════════════════════
export const ACHIEVEMENTS = {
  pet_5:   { title: 'นักเลี้ยงสัตว์',  icon: '🐣', type: 'milestone', trigger: { stat: 'petCount', gte: 5 },  desc: 'สะสมสัตว์ 5 ตัว' },
  pet_10:  { title: 'คอกใหญ่',        icon: '🐾', type: 'milestone', trigger: { stat: 'petCount', gte: 10 }, desc: 'สะสมสัตว์ 10 ตัว' },
  pet_25:  { title: 'สวนสัตว์ส่วนตัว', icon: '🦁', type: 'milestone', trigger: { stat: 'petCount', gte: 25 }, desc: 'สะสมสัตว์ 25 ตัว' },
  pet_all: { title: 'นักสะสมตัวจริง',  icon: '🏆', type: 'milestone', trigger: { stat: 'petSpeciesCount', gte: 'ALL_SPECIES' }, desc: 'สะสมสัตว์ครบทุกชนิด' },
  quiz_10:  { title: 'เริ่มติว',     icon: '📝', type: 'milestone', trigger: { stat: 'quizDoneTotal', gte: 10 },  desc: 'ทำข้อสอบครบ 10 ข้อ' },
  quiz_50:  { title: 'ขยันทำโจทย์', icon: '✍️', type: 'milestone', trigger: { stat: 'quizDoneTotal', gte: 50 },  desc: 'ทำข้อสอบครบ 50 ข้อ' },
  quiz_100: { title: 'เซียนข้อสอบ', icon: '🎓', type: 'milestone', trigger: { stat: 'quizDoneTotal', gte: 100 }, desc: 'ทำข้อสอบครบ 100 ข้อ' },
  flash_10:  { title: 'หัดท่อง',      icon: '📚', type: 'milestone', trigger: { stat: 'studyReviewedTotal', gte: 10 },  desc: 'ทบทวนแฟลชการ์ด 10 ใบ' },
  flash_50:  { title: 'ท่องสม่ำเสมอ', icon: '📖', type: 'milestone', trigger: { stat: 'studyReviewedTotal', gte: 50 },  desc: 'ทบทวนแฟลชการ์ด 50 ใบ' },
  flash_100: { title: 'จำแม่น',       icon: '🧠', type: 'milestone', trigger: { stat: 'studyReviewedTotal', gte: 100 }, desc: 'ทบทวนแฟลชการ์ด 100 ใบ' },
  farm_100k: { title: 'พ่อค้าผัก',    icon: '🥬', type: 'milestone', trigger: { stat: 'farmSalesTotal', gte: 100000 },  desc: 'ขายผลผลิตรวม 100,000' },
  farm_500k: { title: 'นักธุรกิจ',    icon: '💼', type: 'milestone', trigger: { stat: 'farmSalesTotal', gte: 500000 },  desc: 'ขายผลผลิตรวม 500,000' },
  farm_2m:   { title: 'เจ้าสัวเกษตร', icon: '🏭', type: 'milestone', trigger: { stat: 'farmSalesTotal', gte: 2000000 }, desc: 'ขายผลผลิตรวม 2,000,000' },
  spent_100k: { title: 'นักช้อป',      icon: '🛍️', type: 'milestone', trigger: { stat: 'totalSpent', gte: 100000 }, desc: 'ใช้จ่ายรวม 100,000' },
  spent_500k: { title: 'ขาช้อปตัวยง', icon: '💳', type: 'milestone', trigger: { stat: 'totalSpent', gte: 500000 }, desc: 'ใช้จ่ายรวม 500,000' },
  home_max: { title: 'เจ้าของคฤหาสน์', icon: '🏰', type: 'milestone', trigger: { stat: 'residenceLevel', gte: 'MAX_RESIDENCE' }, desc: 'อัปบ้านถึงระดับสูงสุด' },
  daily_king: { title: 'ราชาควิซประจำวัน', icon: '👑', type: 'awarded', dated: true, desc: 'อันดับ 1 ข้อสอบประจำวัน' },
}

export const getAchievement = (id) => ACHIEVEMENTS[id] || null
export const MILESTONES = Object.entries(ACHIEVEMENTS)
  .filter(([, a]) => a.type === 'milestone')
  .map(([id, a]) => ({ id, ...a }))
```

- [ ] **Step 2: เขียนเทส `src/utils/achievements.test.js`**

```js
// เทส achievements util — pure (computeProgress/checkMilestones/title/docId/news)
// รัน: node --test src/utils/achievements.test.js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  computeProgress, resolveGte, checkMilestones,
  achievementTitle, achievementDocId, buildAchievementNews,
} from './achievements.js'

const M = [
  { id: 'pet_5',   trigger: { stat: 'petCount', gte: 5 } },
  { id: 'pet_10',  trigger: { stat: 'petCount', gte: 10 } },
  { id: 'pet_all', trigger: { stat: 'petSpeciesCount', gte: 'ALL_SPECIES' } },
  { id: 'home_max', trigger: { stat: 'residenceLevel', gte: 'MAX_RESIDENCE' } },
]
const CTX = { allSpecies: 3, maxResidence: 12 }

test('computeProgress: petCount + distinct species', () => {
  const p = computeProgress({ pets: [{ id: 'a' }, { id: 'a' }, { id: 'b' }] })
  assert.equal(p.petCount, 3)
  assert.equal(p.petSpeciesCount, 2)
})

test('computeProgress: counters + derived defaults', () => {
  const p = computeProgress({ quizDoneTotal: 12, totalSpent: 50, residence: { level: 6 } })
  assert.equal(p.quizDoneTotal, 12)
  assert.equal(p.totalSpent, 50)
  assert.equal(p.residenceLevel, 6)
  assert.equal(p.petCount, 0)       // pets missing → 0
  assert.equal(p.farmSalesTotal, 0)
})

test('resolveGte: sentinel + numeric', () => {
  assert.equal(resolveGte(5, CTX), 5)
  assert.equal(resolveGte('ALL_SPECIES', CTX), 3)
  assert.equal(resolveGte('MAX_RESIDENCE', CTX), 12)
})

test('checkMilestones: คืน id ที่ถึงเกณฑ์และยังไม่ได้', () => {
  const progress = computeProgress({ pets: [{ id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'd' }, { id: 'e' }] })
  // petCount 5, species 5 → pet_5 ✓, pet_10 ✗, pet_all (gte 3) ✓
  const got = checkMilestones(M, progress, new Set(), CTX)
  assert.deepEqual(got.sort(), ['pet_5', 'pet_all'])
})

test('checkMilestones: ข้ามที่ได้แล้ว (earnedIds)', () => {
  const progress = computeProgress({ pets: Array.from({ length: 5 }, (_, i) => ({ id: 'x' + i })) })
  const got = checkMilestones(M, progress, new Set(['pet_5']), CTX)
  assert.ok(!got.includes('pet_5'))
  assert.ok(got.includes('pet_all'))
})

test('checkMilestones: หลาย tier พร้อมกัน', () => {
  const progress = computeProgress({ pets: Array.from({ length: 10 }, (_, i) => ({ id: 'x' + i })) })
  const got = checkMilestones(M, progress, new Set(), CTX)
  assert.ok(got.includes('pet_5') && got.includes('pet_10'))
})

test('checkMilestones: residence sentinel', () => {
  const got = checkMilestones(M, computeProgress({ residence: { level: 12 } }), new Set(), CTX)
  assert.ok(got.includes('home_max'))
})

test('achievementTitle: dated ต่อท้ายวันที่', () => {
  assert.equal(achievementTitle({ title: 'ราชา' }, '2026-06-18'), 'ราชา 2026-06-18')
  assert.equal(achievementTitle({ title: 'นักช้อป' }, null), 'นักช้อป')
})

test('achievementDocId: dated → id__date', () => {
  assert.equal(achievementDocId('daily_king', '2026-06-18'), 'daily_king__2026-06-18')
  assert.equal(achievementDocId('pet_5', null), 'pet_5')
})

test('buildAchievementNews: msg ไม่มี emoji, icon แยก field', () => {
  const n = buildAchievementNews('โจ้', { title: 'นักธุรกิจ', icon: '💼' }, null)
  assert.equal(n.type, 'achievement')
  assert.equal(n.icon, '💼')
  assert.ok(!/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(n.msg))  // ไม่มี emoji ใน msg
  assert.ok(n.msg.includes('โจ้') && n.msg.includes('นักธุรกิจ'))
})
```

- [ ] **Step 3: รันเทสให้ FAIL**

Run: `node --test src/utils/achievements.test.js`
Expected: FAIL — `Cannot find module './achievements.js'`

- [ ] **Step 4: เขียน `src/utils/achievements.js`**

```js
// achievements — pure helpers (ไม่ import data/firestore; ctx/catalog ส่งเข้ามา)
const SENTINEL = { ALL_SPECIES: 'allSpecies', MAX_RESIDENCE: 'maxResidence' }

export function computeProgress(userData) {
  const u = userData || {}
  const pets = Array.isArray(u.pets) ? u.pets : []
  return {
    petCount: pets.length,
    petSpeciesCount: new Set(pets.map(p => p && p.id).filter(Boolean)).size,
    quizDoneTotal: u.quizDoneTotal || 0,
    studyReviewedTotal: u.studyReviewedTotal || 0,
    farmSalesTotal: u.farmSalesTotal || 0,
    totalSpent: u.totalSpent || 0,
    residenceLevel: u.residence?.level || 1,
  }
}

export function resolveGte(gte, ctx = {}) {
  const key = SENTINEL[gte]
  if (key) return Number(ctx[key]) || 0
  return Number(gte) || 0
}

export function checkMilestones(milestones, progress, earnedIds, ctx = {}) {
  const earned = earnedIds instanceof Set ? earnedIds : new Set(earnedIds || [])
  const out = []
  for (const m of milestones || []) {
    if (earned.has(m.id)) continue
    const have = progress[m.trigger.stat] || 0
    if (have >= resolveGte(m.trigger.gte, ctx)) out.push(m.id)
  }
  return out
}

export const achievementTitle = (def, date) => (date ? `${def.title} ${date}` : def.title)
export const achievementDocId = (achId, date) => (date ? `${achId}__${date}` : achId)

export function buildAchievementNews(nickname, def, date) {
  return {
    msg: `${nickname || 'มีคน'} ปลดล็อก "${achievementTitle(def, date)}"`,
    icon: def.icon,
    type: 'achievement',
  }
}
```

- [ ] **Step 5: รันเทสให้ PASS**

Run: `node --test src/utils/achievements.test.js`
Expected: PASS ทุกเคส

- [ ] **Step 6: Commit**

```bash
git add src/data/achievements.js src/utils/achievements.js src/utils/achievements.test.js
git commit -m "Achievement: catalog + pure util (computeProgress/checkMilestones/news, +เทส)"
```

---

## Task 2: userSchema fields + counter increments (Quiz/Study/Farm)

**Files:**
- Modify: `src/data/userSchema.js` (USER_DEFAULTS + normalize)
- Modify: `src/views/QuizView.vue` (finish write)
- Modify: `src/views/StudyView.vue` (grade/commit)
- Modify: `src/composables/useFarm.js` (commit + sell/sellAll)

**Interfaces:**
- Produces: user doc มี `quizDoneTotal`, `studyReviewedTotal`, `farmSalesTotal`, `achievementCount` (number, default 0) — Task 1's `computeProgress` อ่านสามตัวแรก

- [ ] **Step 1: เพิ่ม fields ใน userSchema**

`src/data/userSchema.js` ใน `USER_DEFAULTS` (ใกล้ `quizCoinsToday`/`totalSpent`) เพิ่ม:
```js
  quizDoneTotal: 0,        // lifetime: ข้อสอบที่ทำ (achievement)
  studyReviewedTotal: 0,   // lifetime: แฟลชการ์ดที่ทบทวน (achievement)
  farmSalesTotal: 0,       // lifetime: เหรียญจากการขายฟาร์ม (achievement)
  achievementCount: 0,     // denormalized count ของ achievements subcollection
```
ใน `normalizeUserData` ไม่ต้องเพิ่มอะไรพิเศษ (number ผ่าน `{...USER_DEFAULTS, ...data}` ได้ค่า default ถ้าหาย) — ตรวจว่า field ไม่ถูก normalize เป็นชนิดอื่น (ไม่มี logic แปลง = ok)

- [ ] **Step 2: increment `quizDoneTotal` ตอนจบข้อสอบ**

`src/views/QuizView.vue` `finish()` — ในการเขียน user doc ผ่าน `patchUser` (object ที่ 2 = server patch มี `coins: increment(...)` ฯลฯ) เพิ่ม `quizDoneTotal: increment(answered.value)` เข้าทั้ง optimistic (ค่า local) และ server patch:
- optimistic: `quizDoneTotal: (authStore.userData?.quizDoneTotal || 0) + answered.value`
- server: `quizDoneTotal: increment(answered.value)`
(`increment` ถูก import ไว้แล้วใน QuizView)

- [ ] **Step 3: increment `studyReviewedTotal` ตอนทบทวนการ์ดใหม่ในเซสชัน**

`src/views/StudyView.vue` — ในบล็อก `if (!rewarded.value.has(id)) { ... }` ของ `grade()` (จุดที่นับการ์ดใหม่ครั้งแรก) ส่งสัญญาณนับ 1 ไปที่ `commit()`. แก้ `commit(newCards, reward, today, dailyTotal)` ให้รับ flag เพิ่ม `reviewedInc` (จำนวนการ์ดใหม่ที่นับรอบนี้ = 1 หรือ 0):
- ใน `grade()`: ประกาศ `const reviewedInc = rewarded had-not-id ? 1 : 0` — ใช้ตัวเดียวกับเงื่อนไข reward (การ์ดใหม่ในเซสชัน). ส่ง `await commit(newCards, reward, today, dailyTotal, reviewedInc)`
- ใน `commit(...)`: เพิ่มพารามิเตอร์ `reviewedInc = 0`; ถ้า `reviewedInc` > 0 → `optimistic.studyReviewedTotal = (authStore.userData?.studyReviewedTotal || 0) + reviewedInc` และ `patch.studyReviewedTotal = increment(reviewedInc)` (`increment` import แล้วใน StudyView)

> หมายเหตุ: นับ "การ์ดใหม่ที่ทบทวนในเซสชัน" (ตรงกับ reward gating) → 1 ครั้ง/การ์ด/เซสชัน

- [ ] **Step 4: increment `farmSalesTotal` ตอนขายฟาร์ม**

`src/composables/useFarm.js`:
- แก้ `commit(newPlots, { coinDelta = 0, inventory: newInv } = {})` → เพิ่ม option `salesGain = 0`:
```js
  async function commit(newPlots, { coinDelta = 0, inventory: newInv, salesGain = 0 } = {}) {
    const farm = { ...(auth.userData?.farm || {}), plots: newPlots }
    if (newInv) farm.inventory = newInv
    const optimistic = { farm, ...(coinDelta ? { coins: (auth.userData?.coins || 0) + coinDelta } : {}) }
    if (salesGain) optimistic.farmSalesTotal = (auth.userData?.farmSalesTotal || 0) + salesGain
    const patch = { 'farm.plots': newPlots }
    if (newInv) patch['farm.inventory'] = newInv
    if (coinDelta) patch.coins = increment(coinDelta)
    if (salesGain) patch.farmSalesTotal = increment(salesGain)
    const ok = await auth.patchUser(optimistic, patch)
    if (!ok) toast('บันทึกฟาร์มไม่สำเร็จ', 'error')
  }
```
- ใน `sell()`: เปลี่ยน `await commit(clonePlots(), { coinDelta: gain, inventory: inv })` → เพิ่ม `salesGain: gain`
- ใน `sellAll()`: เปลี่ยน `await commit(clonePlots(), { coinDelta: gain, inventory: {} })` → เพิ่ม `salesGain: gain`

- [ ] **Step 5: ตรวจ build**

Run: `npm run build`
Expected: build สำเร็จ

- [ ] **Step 6: Commit**

```bash
git add src/data/userSchema.js src/views/QuizView.vue src/views/StudyView.vue src/composables/useFarm.js
git commit -m "Achievement: lifetime counters (quizDone/studyReviewed/farmSales) + achievementCount ใน schema"
```

---

## Task 3: Balloon ปลดล็อก (singleton + component + mount)

**Files:**
- Create: `src/composables/useAchievementBalloon.js`
- Create: `src/components/shared/AchievementBalloon.vue`
- Modify: `src/App.vue` (mount component)

**Interfaces:**
- Produces: `useAchievementBalloon() → { queue, current, celebrate({title, icon}), dismiss() }` — `celebrate` push เข้า queue; component แสดงทีละใบ

- [ ] **Step 1: เขียน singleton `src/composables/useAchievementBalloon.js`**

```js
import { ref } from 'vue'

// คิว balloon ปลดล็อก achievement (singleton ข้ามทั้งแอป)
const queue = ref([])   // [{ title, icon }]

export function useAchievementBalloon() {
  function celebrate(item) { if (item) queue.value = [...queue.value, item] }
  function dismiss() { queue.value = queue.value.slice(1) }
  return { queue, celebrate, dismiss }
}
```

- [ ] **Step 2: เขียน `src/components/shared/AchievementBalloon.vue`**

```html
<template>
  <Transition name="balloon">
    <div v-if="current" class="ach-balloon" role="status" aria-live="polite" @click="dismiss">
      <span class="ach-balloon-icon"><Emoji :char="current.icon" /></span>
      <div class="ach-balloon-txt">
        <div class="ach-balloon-head"><Emoji char="🎉" /> ปลดล็อกความสำเร็จ!</div>
        <div class="ach-balloon-title">{{ current.title }}</div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import Emoji from './Emoji.vue'
import { computed, watch } from 'vue'
import { useAchievementBalloon } from '../../composables/useAchievementBalloon.js'

const { queue, dismiss } = useAchievementBalloon()
const current = computed(() => queue.value[0] || null)

let timer = null
watch(current, (c) => {
  clearTimeout(timer)
  if (c) timer = setTimeout(dismiss, 4000)   // auto-dismiss 4s
})
</script>

<style scoped>
.ach-balloon {
  position: fixed; top: 14px; left: 50%; transform: translateX(-50%);
  z-index: 500; display: flex; align-items: center; gap: 12px;
  background: var(--gold, #fbbf24); border: 2px solid var(--ink); border-radius: 16px;
  box-shadow: var(--pop); padding: 10px 16px; max-width: 92vw; cursor: pointer;
}
.ach-balloon-icon { font-size: 1.8rem; }
.ach-balloon-head { font-size: .62rem; font-weight: 800; color: rgba(0,0,0,.55); }
.ach-balloon-title { font-size: .95rem; font-weight: 800; color: var(--ink); }
.balloon-enter-active, .balloon-leave-active { transition: transform .3s ease, opacity .3s ease; }
.balloon-enter-from, .balloon-leave-to { transform: translate(-50%, -120%); opacity: 0; }
</style>
```

- [ ] **Step 3: mount ใน App.vue**

`src/App.vue`: import + วาง `<AchievementBalloon />` ที่ระดับ root (ใกล้ `<HelpModal />` / `<Toast />` ที่มีอยู่):
```js
import AchievementBalloon from './components/shared/AchievementBalloon.vue'
```
ในเทมเพลต root เพิ่ม `<AchievementBalloon />`

- [ ] **Step 4: ตรวจ build**

Run: `npm run build`
Expected: build สำเร็จ

- [ ] **Step 5: Commit**

```bash
git add src/composables/useAchievementBalloon.js src/components/shared/AchievementBalloon.vue src/App.vue
git commit -m "Achievement: balloon ปลดล็อก (singleton queue + component บน App root)"
```

---

## Task 4: useAchievements (watcher self-grant + backfill เงียบ + announce helper)

**Files:**
- Create: `src/composables/useAchievements.js`
- Modify: `src/App.vue` (เรียก `initAchievements()`)

**Interfaces:**
- Consumes: `MILESTONES`, `getAchievement` (data/achievements.js) · `computeProgress`, `checkMilestones`, `achievementDocId`, `achievementTitle`, `buildAchievementNews` (utils/achievements.js) · `useAchievementBalloon().celebrate` · `PETS` (data/pets.js → `.length`) · `MAX_RESIDENCE_LEVEL` (data/residence.js)
- Produces: `initAchievements()` (เรียกครั้งเดียวใน App.vue) · `announceAchievement(achId, date?)` (export — Task 6 ใช้) · `addEarned(achId)` (export — Task 6 ใช้กัน watcher grant ซ้ำ)

- [ ] **Step 1: เขียน `src/composables/useAchievements.js`**

```js
import { ref, watch } from 'vue'
import { collection, getDocs, doc, setDoc, addDoc, serverTimestamp, increment } from 'firebase/firestore'
import { db } from '../firebase/config.js'
import { useAuthStore } from '../stores/auth.js'
import { useUsageStore } from '../stores/usage.js'
import { useAchievementBalloon } from './useAchievementBalloon.js'
import { MILESTONES, getAchievement } from '../data/achievements.js'
import { PETS } from '../data/pets.js'
import { MAX_RESIDENCE_LEVEL } from '../data/residence.js'
import {
  computeProgress, checkMilestones, achievementDocId, achievementTitle, buildAchievementNews,
} from '../utils/achievements.js'

const earned = new Set()       // achId/docId-base ที่ได้แล้ว (in-memory)
let announceOn = false         // backfill รอบแรกเงียบ → true หลังจากนั้น
let _started = false

const ctx = () => ({ allSpecies: PETS.length, maxResidence: MAX_RESIDENCE_LEVEL })

export function addEarned(achId) { earned.add(achId) }

// balloon + กระดานข่าว (ใช้ร่วม self-grant + claim) — best effort
export async function announceAchievement(achId, date = null) {
  const def = getAchievement(achId)
  if (!def) return
  const auth = useAuthStore()
  const usage = useUsageStore()
  useAchievementBalloon().celebrate({ title: achievementTitle(def, date), icon: def.icon })
  try {
    const news = buildAchievementNews(auth.userData?.nickname || auth.userData?.name, def, date)
    await addDoc(collection(db, 'news'), { ...news, uid: auth.currentUser?.uid || null, ts: serverTimestamp() })
    usage.track(0, 1)
  } catch (e) { console.error('[achievement news]', e) }
}

// grant milestone (self): เขียน subcollection + นับ + (ถ้า announceOn) ประกาศ
async function grantMilestone(achId) {
  const auth = useAuthStore()
  const uid = auth.currentUser?.uid
  if (!uid || earned.has(achId)) return
  earned.add(achId)   // กัน loop/ซ้ำก่อน write
  try {
    await setDoc(doc(db, 'users', uid, 'achievements', achievementDocId(achId, null)),
      { achId, earnedAt: serverTimestamp() })
    await auth.patchUser({ achievementCount: (auth.userData?.achievementCount || 0) + 1 },
      { achievementCount: increment(1) })
    if (announceOn) await announceAchievement(achId, null)
  } catch (e) { console.error('[achievement grant]', e); earned.delete(achId) }
}

async function loadEarned(uid) {
  earned.clear()
  const usage = useUsageStore()
  const snap = await getDocs(collection(db, 'users', uid, 'achievements'))
  usage.track(snap.size)
  snap.forEach(d => earned.add(d.data().achId || d.id))
}

export function initAchievements() {
  if (_started) return
  _started = true
  const auth = useAuthStore()

  watch(() => auth.currentUser?.uid, async (uid) => {
    announceOn = false
    earned.clear()
    if (!uid) return
    try {
      await loadEarned(uid)
      // backfill เงียบ: grant ที่เข้าเกณฑ์อยู่แล้ว โดยไม่ประกาศ
      const news = checkMilestones(MILESTONES, computeProgress(auth.userData), earned, ctx())
      for (const id of news) await grantMilestone(id)
    } catch (e) { console.error('[achievement init]', e) }
    finally { announceOn = true }   // หลังจากนี้ปลดล็อกจริง → ประกาศ
  }, { immediate: true })

  // ปลดล็อกระหว่างเล่น: userData เปลี่ยน → เช็ค → grant (ประกาศ)
  watch(() => auth.userData, async (u) => {
    if (!u || !announceOn || !auth.currentUser?.uid) return
    const news = checkMilestones(MILESTONES, computeProgress(u), earned, ctx())
    for (const id of news) await grantMilestone(id)
  }, { deep: true })
}
```

- [ ] **Step 2: เรียก initAchievements ใน App.vue**

`src/App.vue` `<script setup>`: 
```js
import { initAchievements } from './composables/useAchievements.js'
```
เรียกตอน setup (ใกล้ `initAppConfig()` ถ้ามี เรียกในที่เดียวกัน) — เรียกระดับ top ของ setup: `initAchievements()`

- [ ] **Step 3: ตรวจ build**

Run: `npm run build`
Expected: build สำเร็จ

- [ ] **Step 4: ตรวจด้วยตา (dev) — ต้อง deploy rules ก่อน (Task 8) ถึงจะเขียน subcollection ได้**

Run: `npm run dev` → (หลัง rules deploy) ทำให้เข้าเกณฑ์ milestone ระหว่างเล่น (เช่นซื้อสัตว์ครบ 5) → เห็น balloon เด้ง + ข่าวขึ้นกระดาน · refresh แล้วไม่เด้งซ้ำ (backfill เงียบ)

- [ ] **Step 5: Commit**

```bash
git add src/composables/useAchievements.js src/App.vue
git commit -m "Achievement: watcher self-grant + backfill เงียบ + announce (balloon+news) ร่วม"
```

---

## Task 5: AchievementGrid display (Me + ProfileModal)

**Files:**
- Create: `src/components/shared/AchievementGrid.vue`
- Modify: `src/views/MeView.vue`
- Modify: `src/components/members/ProfileModal.vue`

**Interfaces:**
- Consumes: `getAchievement`, `achievementTitle` · subcollection `users/{uid}/achievements`
- Produces: `<AchievementGrid :uid="..." />`

- [ ] **Step 1: เขียน `src/components/shared/AchievementGrid.vue`**

```html
<template>
  <div class="ach-grid-wrap">
    <div class="ach-grid-head">ความสำเร็จ <span v-if="items.length" class="ach-count">{{ items.length }}</span></div>
    <div v-if="loading" class="ach-empty">กำลังโหลด…</div>
    <div v-else-if="!items.length" class="ach-empty">ยังไม่มีความสำเร็จ — เริ่มเล่นเพื่อปลดล็อก!</div>
    <div v-else class="ach-grid">
      <div v-for="a in items" :key="a.docId" class="ach-item" :title="a.desc">
        <span class="ach-item-icon"><Emoji :char="a.icon" /></span>
        <span class="ach-item-title">{{ a.label }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import Emoji from './Emoji.vue'
import { ref, watch } from 'vue'
import { collection, getDocs, query, orderBy } from 'firebase/firestore'
import { db } from '../../firebase/config.js'
import { useUsageStore } from '../../stores/usage.js'
import { getAchievement } from '../../data/achievements.js'
import { achievementTitle as titleOf } from '../../utils/achievements.js'

const props = defineProps({ uid: { type: String, default: null } })
const usage = useUsageStore()
const items = ref([])
const loading = ref(false)

async function load(uid) {
  if (!uid) { items.value = []; return }
  loading.value = true
  try {
    const snap = await getDocs(query(collection(db, 'users', uid, 'achievements'), orderBy('earnedAt', 'desc')))
    usage.track(snap.size)
    items.value = snap.docs.map(d => {
      const data = d.data()
      const def = getAchievement(data.achId) || { title: data.achId, icon: '🏅', desc: '' }
      return { docId: d.id, icon: def.icon, desc: def.desc, label: titleOf(def, data.date || null) }
    })
  } catch (e) { console.error('[achievement grid]', e) }
  finally { loading.value = false }
}

watch(() => props.uid, load, { immediate: true })
</script>

<style scoped>
.ach-grid-wrap { margin-top: 14px; }
.ach-grid-head { font-size: .8rem; font-weight: 800; color: var(--ink); margin-bottom: 8px; display: flex; align-items: center; gap: 6px; }
.ach-count { font-size: .62rem; background: var(--primary); color: #fff; border-radius: 999px; padding: 1px 7px; }
.ach-empty { font-size: .72rem; color: rgba(0,0,0,.4); }
.ach-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(72px, 1fr)); gap: 8px; }
.ach-item { display: flex; flex-direction: column; align-items: center; gap: 3px; padding: 8px 4px; border: 2px solid var(--ink); border-radius: 12px; background: #fff; box-shadow: var(--pop); text-align: center; }
.ach-item-icon { font-size: 1.5rem; }
.ach-item-title { font-size: .56rem; font-weight: 700; color: var(--ink); line-height: 1.2; }
</style>
```

- [ ] **Step 2: ใส่ใน MeView (ของตัวเอง)**

`src/views/MeView.vue`: import + วางใกล้ `<TagChips :member="auth.userData" class="me-tags" />` (line ~36):
```js
import AchievementGrid from '../components/shared/AchievementGrid.vue'
```
เพิ่มหลัง TagChips: `<AchievementGrid :uid="auth.currentUser?.uid" />`

- [ ] **Step 3: ใส่ใน ProfileModal (ดูคนอื่น)**

`src/components/members/ProfileModal.vue`: import + วางใกล้ `<TagChips :member="member" />` (line ~18):
```js
import AchievementGrid from '../shared/AchievementGrid.vue'
```
เพิ่ม: `<AchievementGrid :uid="member?.uid" />` (member มี uid — ตรวจ field; ถ้า static roster ไม่มี uid จริง grid จะ empty ซึ่ง ok)

- [ ] **Step 4: ตรวจ build**

Run: `npm run build`
Expected: build สำเร็จ

- [ ] **Step 5: Commit**

```bash
git add src/components/shared/AchievementGrid.vue src/views/MeView.vue src/components/members/ProfileModal.vue
git commit -m "Achievement: AchievementGrid โชว์บน Me + ProfileModal (โหลด subcollection)"
```

---

## Task 6: Mailbox awarded path (claim grant achievement + admin broadcast attach)

**Files:**
- Modify: `src/utils/mailbox.js` (`buildBroadcastMail` รับ achievement)
- Modify: `src/utils/mailbox.test.js` (เคส achievement)
- Modify: `src/stores/mailbox.js` (`claim()` grant achievement + announce)
- Modify: `src/views/AdminView.vue` (broadcast form: เลือก achievement แนบ)

**Interfaces:**
- Consumes: `announceAchievement`, `addEarned` (composables/useAchievements.js) · `achievementDocId` (utils/achievements.js) · `ACHIEVEMENTS` (data)
- Produces: mail `reward.achievement = { id, date? }`

- [ ] **Step 1: เทส buildBroadcastMail รองรับ achievement**

`src/utils/mailbox.test.js` เพิ่ม:
```js
test('buildBroadcastMail: แนบ achievement → reward.achievement', () => {
  const m = buildBroadcastMail({ title: 'ยินดีด้วย', body: 'เก่งมาก', achievement: { id: 'daily_king', date: '2026-06-18' } }, 'TS')
  assert.deepEqual(m.reward.achievement, { id: 'daily_king', date: '2026-06-18' })
  assert.equal(m.type, 'reward')
})

test('buildBroadcastMail: ไม่มี coins/achievement → notice', () => {
  const m = buildBroadcastMail({ title: 'ประกาศ', body: 'ข่าว' }, 'TS')
  assert.equal(m.type, 'notice')
  assert.equal(m.reward, undefined)
})
```

- [ ] **Step 2: รันเทสให้ FAIL**

Run: `node --test src/utils/mailbox.test.js`
Expected: FAIL — achievement ไม่ถูกเก็บ / type ผิด

- [ ] **Step 3: แก้ buildBroadcastMail**

`src/utils/mailbox.js` `buildBroadcastMail` — รองรับ `achievement`:
```js
export function buildBroadcastMail({ title, body, coins, from, achievement } = {}, createdAt) {
  const c = (typeof coins === 'number' && coins > 0) ? coins : 0
  const hasAch = achievement && achievement.id
  const reward = {}
  if (c > 0) reward.coins = c
  if (hasAch) reward.achievement = { id: achievement.id, ...(achievement.date ? { date: achievement.date } : {}) }
  const hasReward = c > 0 || hasAch
  return {
    type: hasReward ? 'reward' : 'notice',
    title: title || '',
    body: body || '',
    ...(hasReward ? { reward } : {}),
    from: from || 'admin',
    createdAt,
    read: false,
    claimed: false,
  }
}
```
> ตรวจ `canClaim` (mailbox.js): ปัจจุบัน `canClaim` = ยังไม่ claimed && coins>0. ต้องให้ mail ที่มี **achievement อย่างเดียว (coins 0)** ก็กดรับได้ → แก้ `canClaim`:
```js
export function canClaim(mail) {
  return !!mail && !mail.claimed && (rewardCoins(mail) > 0 || !!mail?.reward?.achievement)
}
```
เพิ่มเทส:
```js
test('canClaim: achievement อย่างเดียว (coins 0) ก็รับได้', () => {
  assert.equal(canClaim({ claimed: false, reward: { achievement: { id: 'x' } } }), true)
})
```

- [ ] **Step 4: รันเทสให้ PASS**

Run: `node --test src/utils/mailbox.test.js`
Expected: PASS ทุกเคส

- [ ] **Step 5: claim() grant achievement ใน transaction + announce**

`src/stores/mailbox.js` — import:
```js
import { announceAchievement, addEarned } from '../composables/useAchievements.js'
import { achievementDocId } from '../utils/achievements.js'
import { serverTimestamp } from 'firebase/firestore'
```
แก้ `claim(id)` — ใน transaction เพิ่มการเขียน achievement, และคืนข้อมูล achievement เพื่อ announce หลัง transaction:
```js
  async function claim(id) {
    const uid = auth.currentUser?.uid
    const m = mails.value.find(x => x.id === id)
    if (!uid || !canClaim(m)) return 0
    try {
      const result = await runTransaction(db, async (tx) => {
        const ref = doc(db, 'users', uid, 'mail', id)
        const snap = await tx.get(ref)
        if (!snap.exists() || snap.data().claimed) return { coins: 0, ach: null }
        const data = snap.data()
        const c = rewardCoins(data)
        const ach = data.reward?.achievement || null
        tx.update(ref, { claimed: true, read: true })
        const userPatch = {}
        if (c > 0) userPatch.coins = increment(c)
        if (ach) {
          tx.set(doc(db, 'users', uid, 'achievements', achievementDocId(ach.id, ach.date || null)),
            { achId: ach.id, ...(ach.date ? { date: ach.date } : {}), earnedAt: serverTimestamp() })
          userPatch.achievementCount = increment(1)
        }
        if (Object.keys(userPatch).length) tx.update(doc(db, 'users', uid), userPatch)
        return { coins: c, ach }
      })
      usage.track(0, 1)
      if (result.coins > 0 || result.ach) { m.claimed = true; m.read = true }
      if (result.ach) { addEarned(result.ach.id); await announceAchievement(result.ach.id, result.ach.date || null) }
      return result.coins
    } catch (e) { console.error('[mail claim]', e); return false }
  }
```
> claim ยังคืน `coins` (number) เหมือนเดิม → MailboxCard ไม่ต้องแก้ · achievement ประกาศเองภายใน

- [ ] **Step 6: AdminView broadcast — เลือก achievement แนบ (optional)**

`src/views/AdminView.vue`:
- import: `import { ACHIEVEMENTS } from '../data/achievements.js'`
- เพิ่ม state: `const bcAchievement = ref('')` (id ที่เลือก, '' = ไม่แนบ)
- ในฟอร์ม broadcast (ใกล้ `bcTitle`/`bcBody`/`bcCoins`) เพิ่ม `<select>`:
```html
<select v-model="bcAchievement" class="admin-search" style="margin:0">
  <option value="">— ไม่แนบ achievement —</option>
  <option v-for="(a, id) in ACHIEVEMENTS" :key="id" :value="id">{{ a.icon }} {{ a.title }}</option>
</select>
```
- ในฟังก์ชันส่ง broadcast: เวลาเรียก `buildBroadcastMail({...}, createdAt)` เพิ่ม `achievement: bcAchievement.value ? { id: bcAchievement.value } : undefined` เข้า object แรก · หลังส่งสำเร็จ reset `bcAchievement.value = ''`

- [ ] **Step 7: ตรวจ build**

Run: `npm run build`
Expected: build สำเร็จ

- [ ] **Step 8: Commit**

```bash
git add src/utils/mailbox.js src/utils/mailbox.test.js src/stores/mailbox.js src/views/AdminView.vue
git commit -m "Achievement: awarded path — Mailbox claim มอบ achievement + admin broadcast แนบได้"
```

---

## Task 7: ปุ่มเคลียร์กระดานข่าว (admin)

**Files:**
- Modify: `src/views/AdminView.vue` (ปุ่ม + ฟังก์ชัน)

**Interfaces:**
- Consumes: `useConfirm().confirm` · `news` collection · `writeBatch`

- [ ] **Step 1: ฟังก์ชัน clear news**

`src/views/AdminView.vue` — เพิ่ม (ใกล้ `delNews`):
```js
const clearingNews = ref(false)
async function clearAllNews() {
  if (!(await confirm('ลบข่าวทั้งหมดในกระดานข่าว?'))) return
  clearingNews.value = true
  try {
    const snap = await getDocs(collection(db, 'news'))
    let batch = writeBatch(db); let n = 0
    for (const d of snap.docs) {
      batch.delete(d.ref); n++
      if (n % 450 === 0) { await batch.commit(); batch = writeBatch(db) }
    }
    if (n % 450 !== 0) await batch.commit()
    usage.track(snap.size, n)
    await loadNews()
    toast(`ลบข่าวแล้ว ${n} รายการ`, 'success')
  } catch (e) { console.error('[clear news]', e); toast('ลบข่าวไม่สำเร็จ', 'error') }
  finally { clearingNews.value = false }
}
```
> ตรวจว่า `confirm` มาจาก `useConfirm()` (ถ้ายังไม่ได้ใช้ในไฟล์ ให้ `const { confirm } = useConfirm()` + import) · `writeBatch`/`getDocs`/`collection` import แล้วใน AdminView · `toast`/`usage` มีแล้ว

- [ ] **Step 2: ปุ่มในเทมเพลต**

ใกล้ news-form / news-admin-list เพิ่ม:
```html
<button class="btn-mini btn-gray" :disabled="clearingNews || !newsList.length" @click="clearAllNews">
  <Emoji char="🧹" /> เคลียร์ข่าวทั้งหมด
</button>
```

- [ ] **Step 3: ตรวจ build**

Run: `npm run build`
Expected: build สำเร็จ

- [ ] **Step 4: Commit**

```bash
git add src/views/AdminView.vue
git commit -m "Admin: ปุ่มเคลียร์กระดานข่าวทั้งหมด (batch delete + confirm)"
```

---

## Task 8: Rules (achievements subcollection + news achievement-create)

**Files:**
- Modify: `firestore.rules`

- [ ] **Step 1: เพิ่ม rules achievements subcollection**

`firestore.rules` — ภายใน `match /users/{userId}` (หรือเป็น nested match ใต้ users) เพิ่ม:
```
    match /achievements/{achId} {
      allow read:   if request.auth != null;
      allow create: if request.auth != null && request.auth.uid == userId;
      allow update, delete: if false;
    }
```
> วางในตำแหน่งเดียวกับ nested `match /mail/{...}` ที่มีอยู่ใต้ `users/{userId}`

- [ ] **Step 2: แก้ rules news ให้ user โพสต์ achievement-news ได้**

`firestore.rules` `match /news/{newsId}` — แก้ `create`:
```
    match /news/{newsId} {
      allow read:   if request.auth != null;
      allow create: if isAdmin()
        || (request.auth != null
            && request.resource.data.type == 'achievement'
            && request.resource.data.msg is string && request.resource.data.msg.size() <= 140
            && request.resource.data.keys().hasOnly(['msg','icon','type','uid','ts']));
      allow update: if false;
      allow delete: if isAdmin();
    }
```

- [ ] **Step 3: ตรวจ rules compile (deploy)**

Run: `firebase deploy --only firestore:rules`
Expected: `rules file firestore.rules compiled successfully` + `Deploy complete!`
> ⚠️ จำเป็นก่อนทดสอบ grant จริง — self-grant/claim เขียน subcollection + news ต้องผ่าน rules นี้

- [ ] **Step 4: Commit**

```bash
git add firestore.rules
git commit -m "Rules: achievements subcollection (owner-create/immutable) + news achievement-create (user)"
```

---

## สรุป deploy หลัง merge
- `firebase deploy --only firestore:rules` (Task 8 — **ก่อน** ทดสอบ grant จริง)
- push master → GitHub Actions auto-deploy frontend
- ไม่มี composite index ใหม่ (subcollection orderBy earnedAt = single-field auto · news orderBy ts มี index เดิม)

## Self-review note (ทำตอนทบทวนแผน)
- ลำดับ build: 1(util/catalog) → 2(schema/counters) → 3(balloon) → 4(watcher) → 5(display) → 6(mailbox awarded) → 7(clear news) → 8(rules)
- Task 4 + 6 เป็นจุดซับซ้อนสุด (grant 2 ทาง + announce ร่วม) — review เข้ม
