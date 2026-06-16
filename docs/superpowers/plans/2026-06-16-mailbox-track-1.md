# Mailbox Track — Increment 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** ระบบจดหมาย (Mailbox) — ผู้ใช้รับ/กดรับรางวัลเป็นเหรียญผ่านการ์ดบน Home + ต่อ hook Phase 5 ให้ academic กด "✓ ผิดจริง" แล้ว mint mail รางวัลส่งผู้แจ้งอัตโนมัติ

**Architecture:** subcollection `users/{uid}/mail/{mailId}` — ระบบไม่โอนเหรียญตรงๆ แต่ส่ง "จดหมายมีรางวัล" แล้วเจ้าของกดรับ (claim = transaction: flip `claimed` + `increment` เหรียญ). logic ล้วนแยกเป็น pure util `mailbox.js` (เทส `node --test`) · store `stores/mailbox.js` (load/markRead/claim) · `MailboxCard.vue` บน Home · QuestionsView resolveReports(valid) mint mail ในbatchเดียว

**Tech Stack:** Vue 3 + Pinia + Firebase Firestore (`runTransaction`, `increment`) · pure util + `node --test` · firestore.rules (deploy ด้วย `firebase deploy`)

**Spec อ้างอิง:** `docs/superpowers/specs/2026-06-15-mailbox-system-design.md`
**ตัดสินใจ (16 มิ.ย. 2026):** scope = core + auto-mint report reward (ไม่รวม admin compose) · mint รางวัลตอน academic กด valid (rule mail create = `isAcademic`) · การ์ดบน Home

---

## File Structure

- **Create** `src/utils/mailbox.js` — pure: `rewardCoins`, `canClaim`, `needsAttention`, `attentionCount`, `buildReportRewardMail`
- **Create** `src/utils/mailbox.test.js` — เทสครอบทุก helper
- **Create** `src/stores/mailbox.js` — Pinia store: `mails`, `attention`, `load({force})`, `markRead(id)`, `claim(id)`
- **Create** `src/components/home/MailboxCard.vue` — การ์ดกล่องจดหมายบน Home (badge + list + ปุ่มรับ)
- **Modify** `src/views/HomeView.vue` — แทรก `<MailboxCard />` ใต้ `<DailyCard />`
- **Modify** `firestore.rules` — nested match `users/{userId}/mail/{mailId}`
- **Modify** `src/views/QuestionsView.vue` — `resolveReports('valid')` mint mail + `rewardDelivered:true` ใน batch เดียว
- **Run** `node scripts/fetch-fluent.mjs` — ดึง emoji 📬 ที่ยังไม่มี (🎁 📢 มีแล้ว)

---

## Task 1: pure util `mailbox.js` + เทส (TDD)

**Files:**
- Create: `src/utils/mailbox.js`
- Test: `src/utils/mailbox.test.js`

- [ ] **Step 1: เขียนเทสที่จะ fail ก่อน**

สร้าง `src/utils/mailbox.test.js`:

```js
// เทส mailbox — pure logic ระบบจดหมาย (Mailbox track)
// รัน: node --test src/utils/mailbox.test.js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { rewardCoins, canClaim, needsAttention, attentionCount, buildReportRewardMail } from './mailbox.js'

test('rewardCoins: คืนจำนวนเหรียญถ้า reward.coins เป็นบวก, ไม่งั้น 0', () => {
  assert.equal(rewardCoins({ reward: { coins: 50 } }), 50)
  assert.equal(rewardCoins({ reward: { coins: 0 } }), 0)
  assert.equal(rewardCoins({ type: 'notice' }), 0)
  assert.equal(rewardCoins(undefined), 0)
})

test('canClaim: true เฉพาะมีรางวัล > 0 และยังไม่ claim', () => {
  assert.equal(canClaim({ reward: { coins: 50 }, claimed: false }), true)
  assert.equal(canClaim({ reward: { coins: 50 }, claimed: true }), false)
  assert.equal(canClaim({ type: 'notice', claimed: false }), false)  // ไม่มีรางวัล
  assert.equal(canClaim(null), false)
})

test('needsAttention: ยังไม่อ่าน หรือ ยังกดรับได้', () => {
  assert.equal(needsAttention({ read: false, type: 'notice' }), true)        // unread
  assert.equal(needsAttention({ read: true, reward: { coins: 50 }, claimed: false }), true) // อ่านแล้วแต่ยังไม่รับ
  assert.equal(needsAttention({ read: true, type: 'notice' }), false)
  assert.equal(needsAttention({ read: true, reward: { coins: 50 }, claimed: true }), false)
})

test('attentionCount: นับ mail ที่ต้องสนใจ', () => {
  const mails = [
    { read: false, type: 'notice' },                                  // +1 unread
    { read: true, reward: { coins: 50 }, claimed: false },            // +1 claimable
    { read: true, type: 'notice' },                                   // 0
    { read: true, reward: { coins: 50 }, claimed: true },             // 0
  ]
  assert.equal(attentionCount(mails), 2)
  assert.equal(attentionCount([]), 0)
  assert.equal(attentionCount(undefined), 0)
})

test('buildReportRewardMail: type reward, title ไม่มี emoji (กัน tofu), reward.coins ถูก, read/claimed=false', () => {
  const report = { questionSnapshot: { question: 'ยาใดเป็น first-line ของ CAP' }, reportedByName: 'มายด์' }
  const mail = buildReportRewardMail(report, 50, 1234)
  assert.equal(mail.type, 'reward')
  assert.equal(mail.reward.coins, 50)
  assert.equal(mail.from, 'system')
  assert.equal(mail.read, false)
  assert.equal(mail.claimed, false)
  assert.equal(mail.createdAt, 1234)
  assert.ok(!/\p{Extended_Pictographic}/u.test(mail.title), 'title ต้องไม่มี emoji')
  assert.ok(mail.body.includes('CAP'), 'body อ้างถึงโจทย์')
})

test('buildReportRewardMail: ไม่มี snapshot → body ทั่วไป ไม่ throw', () => {
  const mail = buildReportRewardMail({}, 50, 1)
  assert.equal(mail.reward.coins, 50)
  assert.ok(mail.body.length > 0)
})
```

- [ ] **Step 2: รันเทสให้เห็นว่า fail**

Run: `node --test src/utils/mailbox.test.js`
Expected: FAIL — `Cannot find module './mailbox.js'`

- [ ] **Step 3: เขียน implementation**

สร้าง `src/utils/mailbox.js`:

```js
// ════════════════════════════════════════════════════════════
//  mailbox — pure helpers ระบบจดหมาย (Mailbox track)
//  ไม่ import Firestore: caller เติม serverTimestamp() เอง → เทสได้ตรง
//  mail: { type:'reward'|'gift'|'notice', title, body?, reward?:{coins?},
//          from:'system'|'daily'|'admin'|<uid>, createdAt, read:bool, claimed:bool }
// ════════════════════════════════════════════════════════════

// เหรียญในจดหมาย (>0 เท่านั้น ไม่งั้น 0)
export function rewardCoins(mail) {
  const c = mail?.reward?.coins
  return (typeof c === 'number' && c > 0) ? c : 0
}

// กดรับได้ไหม = มีรางวัล > 0 และยังไม่เคยรับ
export function canClaim(mail) {
  return !!mail && !mail.claimed && rewardCoins(mail) > 0
}

// ต้องสนใจไหม = ยังไม่อ่าน หรือ ยังกดรับได้ (ใช้คิด badge)
export function needsAttention(mail) {
  return !!mail && (!mail.read || canClaim(mail))
}

// นับจำนวน mail ที่ต้องสนใจ (badge)
export function attentionCount(mails) {
  return (mails || []).filter(needsAttention).length
}

function truncate(s, n) {
  const str = String(s ?? '')
  return str.length > n ? str.slice(0, n) + '…' : str
}

// สร้าง payload จดหมายรางวัล "แจ้งข้อสอบผิด" — title ไม่ใส่ emoji (mail title render
// เป็น text ฝัง <Emoji> ไม่ได้ → ใส่ emoji จะ tofu; ไอคอนให้การ์ด render จาก type แทน)
// caller เติม createdAt = serverTimestamp()
export function buildReportRewardMail(report, coins, createdAt) {
  const q = report?.questionSnapshot?.question
  return {
    type: 'reward',
    title: 'รางวัลแจ้งข้อสอบผิด',
    body: q
      ? `ขอบคุณที่ช่วยแจ้งข้อสอบ "${truncate(q, 60)}" — ทีมวิชาการตรวจแล้วว่าถูกต้อง`
      : 'ขอบคุณที่ช่วยแจ้งข้อสอบผิด ทีมวิชาการตรวจแล้วว่าถูกต้อง',
    reward: { coins },
    from: 'system',
    createdAt,
    read: false,
    claimed: false,
  }
}
```

- [ ] **Step 4: รันเทสให้ผ่าน**

Run: `node --test src/utils/mailbox.test.js`
Expected: PASS — `# pass 6` `# fail 0`

- [ ] **Step 5: Commit**

```bash
git add src/utils/mailbox.js src/utils/mailbox.test.js
git commit -m "Mailbox: pure util mailbox (reward/claim/attention/buildReportRewardMail) + 6 เทส"
```

---

## Task 2: firestore.rules — subcollection mail (+ deploy)

**Files:**
- Modify: `firestore.rules` (เพิ่ม nested match ใน `match /users/{userId}` ก่อน `allow delete: if isAdmin();` line 72)

- [ ] **Step 1: เพิ่ม nested match**

ใน `firestore.rules` หา block `match /users/{userId} {` แล้วแทรก nested match **หลัง** `allow delete: if isAdmin();` (ปิด rule ของ user doc) แต่ **ก่อน** `}` ที่ปิด `match /users/{userId}`:

แทนที่:
```
      allow delete: if isAdmin();
    }
```
ด้วย:
```
      allow delete: if isAdmin();

      // ── Mailbox (Mailbox track) — จดหมาย/ของรางวัลรายผู้ใช้ ──
      //  read:   เจ้าของเท่านั้น
      //  create: isAcademic (admin+academic = ทีมงานที่เชื่อใจ) — owner สร้างเองไม่ได้
      //          กันนักศึกษาเสกเหรียญใส่ตัวเอง (auto-mint รางวัล report ตอน academic กด valid)
      //  update: เจ้าของ แก้ได้เฉพาะ read/claimed (ห้ามแตะ reward)
      //  delete: เจ้าของ หรือ admin
      match /mail/{mailId} {
        allow read:   if request.auth != null && request.auth.uid == userId;
        allow create: if isAcademic();
        allow update: if request.auth != null && request.auth.uid == userId
                      && request.resource.data.diff(resource.data).affectedKeys().hasOnly(['read', 'claimed']);
        allow delete: if (request.auth != null && request.auth.uid == userId) || isAdmin();
      }
    }
```

> หมายเหตุ: claim flip `claimed` ทำใน transaction พร้อม `increment` เหรียญใน user doc — การเขียน user doc ผ่าน coin-range guard เดิม (`coins >= 0 && <= 50M`, role/tags/founder ไม่เปลี่ยน) อยู่แล้ว

- [ ] **Step 2: Deploy rules**

> ⚠️ rules มีผลเฉพาะหลัง `firebase deploy` — ถ้าไม่ deploy ปุ่มรับ/การ mint จะโดน permission denied

Run: `firebase deploy --only firestore:rules`
Expected: `✔ rules file firestore.rules compiled successfully` + `Deploy complete!`

- [ ] **Step 3: Commit**

```bash
git add firestore.rules
git commit -m "Mailbox: rules subcollection users/{uid}/mail (create=academic, claim=owner read/claimed) + deploy"
```

---

## Task 3: store `stores/mailbox.js`

**Files:**
- Create: `src/stores/mailbox.js`

- [ ] **Step 1: เขียน store**

สร้าง `src/stores/mailbox.js`:

```js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { collection, getDocs, doc, updateDoc, query, orderBy, runTransaction, increment } from 'firebase/firestore'
import { db } from '../firebase/config.js'
import { useAuthStore } from './auth.js'
import { useUsageStore } from './usage.js'
import { attentionCount, canClaim, rewardCoins } from '../utils/mailbox.js'

// จดหมายของผู้ใช้ = subcollection users/{uid}/mail (เบา, ของตัวเอง)
// load มี in-memory guard (โหลดครั้งเดียวต่อ session ต่อ uid) — refresh ได้ด้วย force
export const useMailbox = defineStore('mailbox', () => {
  const auth = useAuthStore()
  const usage = useUsageStore()

  const mails = ref([])
  const loading = ref(false)
  let loadedFor = null   // uid ที่โหลดไว้แล้ว (guard)

  const attention = computed(() => attentionCount(mails.value))

  async function load({ force = false } = {}) {
    const uid = auth.currentUser?.uid
    if (!uid) { mails.value = []; loadedFor = null; return }
    if (!force && loadedFor === uid) return
    loading.value = true
    try {
      const snap = await getDocs(query(collection(db, 'users', uid, 'mail'), orderBy('createdAt', 'desc')))
      usage.track(snap.size)
      mails.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      loadedFor = uid
    } catch (e) { console.error('[mailbox load]', e) }
    finally { loading.value = false }
  }

  async function markRead(id) {
    const uid = auth.currentUser?.uid
    const m = mails.value.find(x => x.id === id)
    if (!uid || !m || m.read) return
    m.read = true // optimistic
    try { await updateDoc(doc(db, 'users', uid, 'mail', id), { read: true }); usage.track(0, 1) }
    catch (e) { console.error('[mail read]', e); m.read = false }
  }

  // claim = transaction: ถ้ายังไม่ claim → flip claimed/read + increment เหรียญ user doc
  // คืนจำนวนเหรียญที่ได้ (0 ถ้ารับไปแล้ว/ไม่มีรางวัล, false ถ้า error)
  async function claim(id) {
    const uid = auth.currentUser?.uid
    const m = mails.value.find(x => x.id === id)
    if (!uid || !canClaim(m)) return 0
    try {
      const coins = await runTransaction(db, async (tx) => {
        const ref = doc(db, 'users', uid, 'mail', id)
        const snap = await tx.get(ref)
        if (!snap.exists() || snap.data().claimed) return 0
        const c = rewardCoins(snap.data())
        tx.update(ref, { claimed: true, read: true })
        tx.update(doc(db, 'users', uid), { coins: increment(c) })
        return c
      })
      usage.track(0, 1)
      if (coins > 0) { m.claimed = true; m.read = true } // optimistic local (coins อัปเดตผ่าน auth onSnapshot)
      return coins
    } catch (e) { console.error('[mail claim]', e); return false }
  }

  return { mails, loading, attention, load, markRead, claim }
})
```

- [ ] **Step 2: build ผ่าน (ตรวจ syntax/import)**

Run: `npm run build`
Expected: `✓ built in ...`

- [ ] **Step 3: Commit**

```bash
git add src/stores/mailbox.js
git commit -m "Mailbox: store load/markRead/claim (claim = transaction flip claimed + increment เหรียญ)"
```

---

## Task 4: `MailboxCard.vue` + วางบน Home

**Files:**
- Create: `src/components/home/MailboxCard.vue`
- Modify: `src/views/HomeView.vue` (import + วางใต้ `<DailyCard />`)

- [ ] **Step 1: สร้าง MailboxCard.vue**

สร้าง `src/components/home/MailboxCard.vue`:

```html
<template>
  <div class="mailbox-card">
    <div class="mb-head">
      <span class="mb-title"><Emoji char="📬" /> กล่องจดหมาย</span>
      <span v-if="mailbox.attention" class="mb-badge">{{ mailbox.attention }}</span>
      <button class="mb-refresh" :disabled="mailbox.loading" @click="mailbox.load({ force: true })">↻</button>
    </div>

    <div v-if="mailbox.loading && !mailbox.mails.length" class="mb-empty">กำลังโหลด…</div>
    <div v-else-if="!mailbox.mails.length" class="mb-empty">ยังไม่มีจดหมาย</div>
    <ul v-else class="mb-list">
      <li
        v-for="m in mailbox.mails" :key="m.id"
        class="mb-item" :class="{ unread: !m.read }"
        @click="mailbox.markRead(m.id)"
      >
        <span class="mb-ico"><Emoji :char="typeIcon(m)" /></span>
        <div class="mb-body">
          <div class="mb-item-title">{{ m.title }}</div>
          <div v-if="m.body" class="mb-item-text">{{ m.body }}</div>
          <div class="mb-meta">{{ fromLabel(m.from) }} · {{ fmtTime(m.createdAt) }}</div>
        </div>
        <div class="mb-action">
          <button
            v-if="hasReward(m)"
            class="mb-claim" :class="{ done: m.claimed }"
            :disabled="m.claimed || claimingId === m.id"
            @click.stop="onClaim(m)"
          >{{ m.claimed ? 'รับแล้ว ✓' : `รับ ${m.reward.coins}` }}<Emoji v-if="!m.claimed" char="🪙" /></button>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup>
import Emoji from '../shared/Emoji.vue'
import { ref, onMounted } from 'vue'
import { useMailbox } from '../../stores/mailbox.js'
import { useToast } from '../../composables/useToast.js'
import { canClaim, rewardCoins } from '../../utils/mailbox.js'

const mailbox = useMailbox()
const { toast } = useToast()
const claimingId = ref(null)

onMounted(() => mailbox.load())

function hasReward(m) { return rewardCoins(m) > 0 }
function typeIcon(m) { return m.type === 'reward' ? '🎁' : m.type === 'gift' ? '🎁' : '📢' }
function fromLabel(from) {
  return from === 'system' ? 'ระบบ' : from === 'daily' ? 'เดลี่' : from === 'admin' ? 'แอดมิน' : 'เพื่อน'
}
function fmtTime(t) {
  const ms = t?.toMillis ? t.toMillis() : (t?.toDate ? t.toDate().getTime() : new Date(t).getTime())
  if (!ms || Number.isNaN(ms)) return ''
  return new Date(ms).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' })
}

async function onClaim(m) {
  if (claimingId.value || !canClaim(m)) return
  claimingId.value = m.id
  try {
    const coins = await mailbox.claim(m.id)
    if (coins > 0) toast(`รับ ${coins.toLocaleString()} เหรียญแล้ว`, 'success')
    else if (coins === 0) toast('จดหมายนี้รับไปแล้ว', 'info')
    else toast('รับรางวัลไม่สำเร็จ', 'error')
  } finally { claimingId.value = null }
}
</script>

<style scoped>
.mailbox-card { background: #fff; border: 2px solid var(--ink); border-radius: 18px; padding: 14px; margin-bottom: 14px; box-shadow: var(--pop); }
.mb-head { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
.mb-title { font-weight: 800; font-size: .95rem; }
.mb-badge { font-size: .62rem; font-weight: 800; color: #fff; background: #ef4444; border-radius: 999px; padding: 1px 7px; min-width: 18px; text-align: center; }
.mb-refresh { margin-left: auto; border: none; background: rgba(0,0,0,.06); border-radius: 8px; width: 28px; height: 28px; font-size: .8rem; cursor: pointer; color: rgba(0,0,0,.55); }
.mb-refresh:disabled { opacity: .5; }
.mb-empty { font-size: .76rem; color: rgba(0,0,0,.4); text-align: center; padding: 12px 0; }
.mb-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px; max-height: 320px; overflow-y: auto; }
.mb-item { display: flex; align-items: flex-start; gap: 10px; border: 1px solid rgba(0,0,0,.1); border-radius: 12px; padding: 10px; background: #fff; cursor: pointer; }
.mb-item.unread { background: #eef2ff; border-color: rgba(79,70,229,.3); }
.mb-ico { font-size: 1.3rem; flex-shrink: 0; }
.mb-body { flex: 1; min-width: 0; }
.mb-item-title { font-weight: 800; font-size: .8rem; color: #1e293b; }
.mb-item-text { font-size: .72rem; color: rgba(0,0,0,.6); line-height: 1.4; margin-top: 2px; }
.mb-meta { font-size: .62rem; color: rgba(0,0,0,.4); margin-top: 4px; }
.mb-action { flex-shrink: 0; }
.mb-claim { border: none; border-radius: 9px; padding: 7px 11px; font-family: inherit; font-size: .72rem; font-weight: 800; color: #fff; background: var(--mint); cursor: pointer; white-space: nowrap; }
.mb-claim.done { background: rgba(0,0,0,.12); color: rgba(0,0,0,.5); cursor: default; }
.mb-claim:disabled { cursor: default; }
</style>
```

- [ ] **Step 2: วาง MailboxCard บน Home**

ใน `src/views/HomeView.vue` แก้ 2 จุด:

(ก) เพิ่ม import ใต้ `import DailyCard from '../components/home/DailyCard.vue'`:
```js
import MailboxCard from '../components/home/MailboxCard.vue'
```

(ข) แทรก `<MailboxCard />` ใต้ `<DailyCard />` — แทนที่:
```html
      <!-- เหรียญ + รับรายได้รายวัน (ส่วนตัว เห็นเฉพาะเจ้าของ) -->
      <DailyCard />
```
ด้วย:
```html
      <!-- เหรียญ + รับรายได้รายวัน (ส่วนตัว เห็นเฉพาะเจ้าของ) -->
      <DailyCard />
      <!-- กล่องจดหมาย (รางวัล/ประกาศ) -->
      <MailboxCard />
```

- [ ] **Step 3: build ผ่าน**

Run: `npm run build`
Expected: `✓ built in ...`

- [ ] **Step 4: ดึง emoji 📬 ที่ยังไม่มี (🎁 📢 มีแล้ว)**

> `MailboxCard` ใช้ 📬 ซึ่งยังไม่มีไฟล์ Fluent — รัน script ดึง (สแกน src/ หา emoji ดิบ → ดาวน์โหลด ต้องต่อเน็ต)

Run: `node scripts/fetch-fluent.mjs`
Expected: log `พบ emoji N ตัวจาก src/` + ได้ไฟล์ `public/emoji/fluent/1f4ec.svg`

ตรวจ: `ls public/emoji/fluent/1f4ec.svg`
Expected: เห็นไฟล์

- [ ] **Step 5: Commit**

```bash
git add src/components/home/MailboxCard.vue src/views/HomeView.vue public/emoji/fluent/
git commit -m "Mailbox: MailboxCard บน Home (badge + list + ปุ่มรับ) + ดึง emoji 📬"
```

---

## Task 5: ต่อ hook Phase 5 — auto-mint รางวัลตอน academic กด "✓ ผิดจริง"

**Files:**
- Modify: `src/views/QuestionsView.vue` (แทนฟังก์ชัน `resolveReports` + เพิ่ม import)

- [ ] **Step 1: เพิ่ม import**

ใน `src/views/QuestionsView.vue` แก้บรรทัด import จาก questionReport เป็น (เพิ่ม `buildReportRewardMail` จาก mailbox):
```js
import { groupReports, resolvePayload } from '../utils/questionReport.js'
import { buildReportRewardMail } from '../utils/mailbox.js'
import { REPORT_REWARD } from '../data/index.js'
```

- [ ] **Step 2: แทนฟังก์ชัน resolveReports**

แทนที่ฟังก์ชัน `resolveReports` ทั้งก้อน (ที่เพิ่งเขียนใน Phase 5) ด้วย:

```js
async function resolveReports(g, verdict) {
  if (resolvingId.value) return
  resolvingId.value = g.questionId
  try {
    const batch = writeBatch(db)
    if (verdict === 'valid') {
      // ผิดจริง → mint mail รางวัลให้ผู้แจ้งแต่ละคน (auto-deliver) + ปิด report เป็น delivered
      for (const r of g.reports) {
        const mailRef = doc(collection(db, 'users', r.reportedBy, 'mail'))
        batch.set(mailRef, buildReportRewardMail(r, REPORT_REWARD, serverTimestamp()))
        batch.update(doc(db, 'questionReports', r.id), {
          ...resolvePayload('valid', REPORT_REWARD),
          rewardDelivered: true,                 // ส่งทันที (auto-mint)
          resolvedAt: serverTimestamp(),
        })
      }
    } else {
      for (const r of g.reports) {
        batch.update(doc(db, 'questionReports', r.id), {
          ...resolvePayload('invalid', REPORT_REWARD),
          resolvedAt: serverTimestamp(),
        })
      }
    }
    await batch.commit()
    usage.track(0, verdict === 'valid' ? g.reports.length * 2 : g.reports.length)
    reports.value = reports.value.filter(r => r.questionId !== g.questionId) // ตัดกลุ่มที่ปิดออก
    toast(verdict === 'valid'
      ? `ส่งรางวัล ${REPORT_REWARD} เหรียญให้ผู้แจ้ง ${g.reports.length} คนแล้ว`
      : 'ปิดรายการแล้ว (ไม่ผิด)', 'success')
  } catch (e) { console.error('[resolve report]', e); toast('ปิดรายการไม่สำเร็จ', 'error') }
  finally { resolvingId.value = null }
}
```

- [ ] **Step 3: build ผ่าน**

Run: `npm run build`
Expected: `✓ built in ...`

- [ ] **Step 4: Commit**

```bash
git add src/views/QuestionsView.vue
git commit -m "Mailbox: auto-mint รางวัล report ตอน academic กด valid (mint mail + rewardDelivered:true ใน batch)"
```

---

## Task 6: รวมเทส + ทดลอง dev + push + verify

**Files:** (ไม่มี — verify/deploy)

- [ ] **Step 1: รัน util test ทั้งหมด**

Run: `node --test src/utils/*.test.js`
Expected: ทุกชุดผ่าน (`# fail 0`) — รวม mailbox 6 เคสใหม่

- [ ] **Step 2: รัน dev ทดลอง flow จริง (login admin = prawich.aum@dome.tu.ac.th)**

Run: `npm run dev`
ทดลอง:
- /quiz ทำข้อ → 🚩 แจ้งข้อผิด → ส่ง (จากเครื่อง/บัญชีนักศึกษาถ้ามี; ถ้าทดสอบคนเดียว admin แจ้งเองได้ — report doc = `${qid}__${adminUid}`)
- /questions → กางการ์ด 🚩 → กด "✓ ผิดจริง" → toast "ส่งรางวัล…"
- กลับ Home → การ์ด "📬 กล่องจดหมาย" มี badge + จดหมายรางวัล → กด "รับ 50🪙" → toast "รับ 50 เหรียญแล้ว" + เหรียญ (DailyCard) เพิ่มขึ้น + ปุ่มเปลี่ยนเป็น "รับแล้ว ✓"
- กดรับซ้ำ/รีเฟรชแล้วกดอีก = ไม่ได้เหรียญเพิ่ม (claimed กันไว้)

Expected: ทุกขั้นไม่มี error console; emoji 📬/🎁/🪙 เป็นรูป ไม่ tofu

- [ ] **Step 3: push deploy frontend**

> rules deploy แล้วใน Task 2 — ขั้นนี้ push frontend ขึ้น GitHub Pages

```bash
git push origin master
```

- [ ] **Step 4: verify prod**

หลัง GitHub Actions เสร็จ (~1-2 นาที) เปิด `pikar10tu.github.io/rxtu10/` ลอง flow รับจดหมายบนมือถือ 1 รอบ
Expected: รับรางวัลได้จริง, เหรียญเพิ่ม, รับซ้ำไม่ได้

- [ ] **Step 5: อัปเดต memory/spec**

อัปเดต memory `rxtu10-roadmap-plan`: Mailbox track increment 1 ✅ เสร็จ (core + auto-mint report reward) · เหลือ admin compose/broadcast (เพิ่มทีหลัง) + Daily Challenge ใช้ Mailbox ส่งรางวัล top-5

---

## Self-Review (เช็กกับ spec)

**Spec coverage:**
- `users/{uid}/mail` subcollection + payload (type/title/body/reward/from/createdAt/read/claimed) → Task 1 (buildReportRewardMail) + Task 3 (load map) ✅
- rule read=owner / create=admin / update=owner read|claimed / delete=owner|admin → Task 2 ✅ (**deviation ที่ตัดสินแล้ว: create=isAcademic ไม่ใช่ admin-only** เพื่อ auto-mint ตอน academic กด valid — academic = ทีมงานเชื่อใจ, นักศึกษายังสร้างไม่ได้)
- claim = transaction (claimed→true + increment เหรียญ) กันรับซ้ำ → Task 3 `claim()` ✅
- UI ไอคอน + badge unread/unclaimed + รายการ + ปุ่มรับ → Task 4 (badge = attentionCount, ปุ่มรับ) ✅ (วางบน Home ตามตัดสินใจ ไม่ใช่ header)
- load = อ่าน subcollection ตัวเอง + guard กันโหลดซ้ำ → Task 3 (loadedFor guard) ✅
- pure test: claim รับซ้ำไม่ได้ + คำนวณ badge → Task 1 (canClaim/attentionCount) ✅
- integrity พึ่ง coin-range guard เดิม → claim ใช้ increment ผ่าน rule users เดิม ✅
- ใช้ซ้ำได้หลายระบบ → payload กว้าง + from หลายค่า + Daily Challenge ต่อยอดได้ ✅
- Open items (payload pet/item, หมดอายุ/เก็บกวาด) = นอก scope increment นี้ ✅

**Type consistency:** `rewardCoins/canClaim/needsAttention/attentionCount/buildReportRewardMail` signature ตรงกันทั้ง util (Task 1), store (Task 3), card (Task 4), QuestionsView (Task 5). field mail (type/title/body/reward.coins/from/createdAt/read/claimed) ตรงทุกที่ ✅

**นอกเหนือ spec (ตัดสินใจ 16 มิ.ย.):** auto-mint รางวัล report ตอน valid (Task 5) = การต่อ hook Phase 5 (`rewardDelivered:false` → mint mail + flip true) ซึ่ง spec Phase 5 ระบุว่า "รอ Mailbox" — increment นี้ทำให้ครบ loop
