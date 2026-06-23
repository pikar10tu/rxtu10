# Welcome Gift + ตั๋ว payment-first — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** แจกของขวัญต้อนรับ 15,000 เหรียญ + 50 ตั๋วกาชา ให้ผู้ใช้ทุกคน (เก่า+ใหม่) ครั้งเดียวผ่านกล่องจดหมาย + Welcome box เด้ง และทำให้ตั๋วเป็น payment-first บนปุ่มสุ่มกาชาเดิม

**Architecture:** ของขวัญส่งมอบเส้นทางเดียว — ตอน login ถ้ายังไม่เคยได้ client self-deliver จดหมาย doc id ตายตัว `welcome-v1` เข้ากล่องตัวเอง (rules ตรวจแม่แบบเป๊ะ + `claimed` monotonic = กันโกง) แล้วผู้ใช้กดรับเอง → เหรียญ+ตั๋วเติมผ่าน claim transaction. ตั๋ว payment-first คำนวณด้วย pure helper บนปุ่มสุ่มเดิม.

**Tech Stack:** Vue 3 + Pinia + Firebase (Firestore) · pure utils เทสด้วย `node --test` · ไม่มี component test runner (Vue/store เทสด้วย `npm run build` + ทดลองมือ)

## Global Constraints

- เขียน user doc ผ่าน `auth.patchUser(optimistic, server)` เท่านั้น (ยกเว้น batch ใน Task 4 ที่เขียน 2 docs atomic) — ดู CLAUDE.md
- ข้อความจากผู้ใช้ทุกช่อง: ผ่าน `cleanText(str, LIMITS.xxx)` ก่อนเขียน (งานนี้ไม่มี input ผู้ใช้ใหม่)
- เพิ่มฟิลด์ใหม่บน user doc → ใส่ `data/userSchema.js` ที่เดียว (USER_DEFAULTS) ห้าม `userData?.x || y` กระจาย
- ค่าของขวัญตายตัว: **coins = 15000, tickets = 50** (ต้องตรงกันเป๊ะทั้งใน userSchema, mailbox, firestore.rules — rules ตรวจค่าเป๊ะ)
- mail title render เป็น text ฝัง emoji ไม่ได้ (tofu) → title ห้ามมี emoji
- commit รูปแบบ `Area: อะไร (ทำไม)` ไทยปนอังกฤษ
- แก้ `firestore.rules` แล้ว **ต้อง `firebase deploy --only firestore:rules`** (Pages/Actions ไม่ deploy rules)
- รัน pure test: `node --test src/utils/<x>.test.js` หรือ `node --test src/data/<x>.test.js`

---

### Task 1: Schema fields + ค่าคงที่ของขวัญ

**Files:**
- Modify: `src/data/userSchema.js`
- Test: `src/data/userSchema.test.js`

**Interfaces:**
- Produces: `USER_DEFAULTS.welcomeGiftV1: false`, `USER_DEFAULTS.welcomeBoxSeen: false`; exports `WELCOME_GIFT_COINS = 15000`, `WELCOME_GIFT_TICKETS = 50`

- [ ] **Step 1: เขียนเทสที่ fail**

ต่อท้าย `src/data/userSchema.test.js`:

```js
import { WELCOME_GIFT_COINS, WELCOME_GIFT_TICKETS } from './userSchema.js'

test('USER_DEFAULTS มี welcome gift flags = false', () => {
  assert.equal(USER_DEFAULTS.welcomeGiftV1, false)
  assert.equal(USER_DEFAULTS.welcomeBoxSeen, false)
})

test('ค่าคงที่ของขวัญต้อนรับ = 15000 / 50', () => {
  assert.equal(WELCOME_GIFT_COINS, 15000)
  assert.equal(WELCOME_GIFT_TICKETS, 50)
})

test('normalizeUserData เติม welcome flags บน doc บางตา', () => {
  const d = normalizeUserData({ coins: 5 })
  assert.equal(d.welcomeGiftV1, false)
  assert.equal(d.welcomeBoxSeen, false)
})

test('normalizeUserData คงค่า welcome flags เดิม', () => {
  const d = normalizeUserData({ welcomeGiftV1: true, welcomeBoxSeen: true })
  assert.equal(d.welcomeGiftV1, true)
  assert.equal(d.welcomeBoxSeen, true)
})
```

- [ ] **Step 2: รันเทสให้เห็นว่า fail**

Run: `node --test src/data/userSchema.test.js`
Expected: FAIL — `WELCOME_GIFT_COINS` undefined / `welcomeGiftV1` ไม่ใช่ false

- [ ] **Step 3: เพิ่มฟิลด์ + ค่าคงที่**

ใน `src/data/userSchema.js` ภายใน `USER_DEFAULTS` ต่อจากบรรทัด `freeGachaTickets: 0,`:

```js
  freeGachaTickets: 0,
  welcomeGiftV1: false,   // one-time: ส่งจดหมายของขวัญต้อนรับแล้ว (กัน client ส่งซ้ำ)
  welcomeBoxSeen: false,  // เห็น Welcome box ต้อนรับแล้ว (กัน popup เด้งซ้ำ)
```

ใต้บรรทัด `export const STARTER_COINS = 2000` เพิ่ม:

```js
export const WELCOME_GIFT_COINS = 15000
export const WELCOME_GIFT_TICKETS = 50
```

- [ ] **Step 4: รันเทสให้ผ่าน**

Run: `node --test src/data/userSchema.test.js`
Expected: PASS ทุกเทส

- [ ] **Step 5: Commit**

```bash
git add src/data/userSchema.js src/data/userSchema.test.js
git commit -m "Schema: welcome gift flags + ค่าคงที่ (welcomeGiftV1/welcomeBoxSeen, 15000/50)"
```

---

### Task 2: mailbox utils รองรับตั๋ว + buildWelcomeGiftMail

**Files:**
- Modify: `src/utils/mailbox.js`
- Test: `src/utils/mailbox.test.js`

**Interfaces:**
- Consumes: `WELCOME_GIFT_COINS`, `WELCOME_GIFT_TICKETS` จาก Task 1
- Produces:
  - `rewardTickets(mail) → number` (จำนวนตั๋วในจดหมาย, >0 เท่านั้น)
  - `canClaim(mail)` true เมื่อยังไม่ claim และ (coins>0 หรือ tickets>0 หรือ achievement)
  - `buildBroadcastMail({title,body,coins,tickets,from,achievement}, createdAt)` ใส่ `reward.tickets` เมื่อ tickets>0
  - `buildWelcomeGiftMail(createdAt) → mail` (แม่แบบเป๊ะ from:'welcome', reward:{coins:15000,tickets:50})

- [ ] **Step 1: เขียนเทสที่ fail**

แก้ import บรรทัดบนสุดของ `src/utils/mailbox.test.js` ให้รวม `rewardTickets, buildWelcomeGiftMail`:

```js
import { rewardCoins, rewardTickets, canClaim, needsAttention, attentionCount, buildReportRewardMail, buildBroadcastMail, buildWelcomeGiftMail } from './mailbox.js'
```

ต่อท้ายไฟล์:

```js
test('rewardTickets: คืนจำนวนตั๋วถ้า reward.tickets เป็นบวก, ไม่งั้น 0', () => {
  assert.equal(rewardTickets({ reward: { tickets: 50 } }), 50)
  assert.equal(rewardTickets({ reward: { tickets: 0 } }), 0)
  assert.equal(rewardTickets({ reward: { coins: 50 } }), 0)
  assert.equal(rewardTickets(undefined), 0)
})

test('canClaim: true เมื่อมีตั๋วอย่างเดียวและยังไม่ claim', () => {
  assert.equal(canClaim({ reward: { tickets: 50 }, claimed: false }), true)
  assert.equal(canClaim({ reward: { tickets: 50 }, claimed: true }), false)
})

test('buildBroadcastMail: ใส่ reward.tickets เมื่อ tickets > 0', () => {
  const m = buildBroadcastMail({ title: 'x', tickets: 10 }, 123)
  assert.equal(m.type, 'reward')
  assert.equal(m.reward.tickets, 10)
  const n = buildBroadcastMail({ title: 'x' }, 123)
  assert.equal(n.type, 'notice')
  assert.equal(n.reward, undefined)
})

test('buildWelcomeGiftMail: แม่แบบเป๊ะ from welcome, reward 15000/50, claimable', () => {
  const m = buildWelcomeGiftMail(123)
  assert.equal(m.type, 'reward')
  assert.equal(m.from, 'welcome')
  assert.equal(m.claimed, false)
  assert.equal(m.read, false)
  assert.deepEqual(Object.keys(m.reward).sort(), ['coins', 'tickets'])
  assert.equal(m.reward.coins, 15000)
  assert.equal(m.reward.tickets, 50)
  assert.equal(m.createdAt, 123)
  assert.equal(canClaim(m), true)
})
```

- [ ] **Step 2: รันเทสให้เห็นว่า fail**

Run: `node --test src/utils/mailbox.test.js`
Expected: FAIL — `rewardTickets` / `buildWelcomeGiftMail` ไม่มี

- [ ] **Step 3: เพิ่มโค้ดใน mailbox.js**

บนสุดของ `src/utils/mailbox.js` เพิ่ม import:

```js
import { WELCOME_GIFT_COINS, WELCOME_GIFT_TICKETS } from '../data/userSchema.js'
```

ใต้ฟังก์ชัน `rewardCoins` เพิ่ม:

```js
// ตั๋วกาชาในจดหมาย (>0 เท่านั้น ไม่งั้น 0)
export function rewardTickets(mail) {
  const t = mail?.reward?.tickets
  return (typeof t === 'number' && t > 0) ? t : 0
}
```

แก้ `canClaim` ให้รวมตั๋ว:

```js
// กดรับได้ไหม = มีรางวัล (เหรียญ/ตั๋ว > 0 หรือ achievement) และยังไม่เคยรับ
export function canClaim(mail) {
  return !!mail && !mail.claimed && (rewardCoins(mail) > 0 || rewardTickets(mail) > 0 || !!mail?.reward?.achievement)
}
```

แก้ `buildBroadcastMail` ให้รับ + ใส่ tickets (แก้ทั้งฟังก์ชัน):

```js
export function buildBroadcastMail({ title, body, coins, tickets, from, achievement } = {}, createdAt) {
  const c = (typeof coins === 'number' && coins > 0) ? coins : 0
  const t = (typeof tickets === 'number' && tickets > 0) ? tickets : 0
  const hasAch = achievement && achievement.id
  const reward = {}
  if (c > 0) reward.coins = c
  if (t > 0) reward.tickets = t
  if (hasAch) reward.achievement = { id: achievement.id, ...(achievement.date ? { date: achievement.date } : {}) }
  const hasReward = c > 0 || t > 0 || hasAch
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

ต่อท้ายไฟล์เพิ่ม `buildWelcomeGiftMail`:

```js
// จดหมายของขวัญต้อนรับ — แม่แบบเป๊ะ (rules ตรวจ from/reward เป๊ะ → ห้ามเปลี่ยนรูปร่าง)
// caller (auth self-deliver) เติม createdAt = serverTimestamp()
export function buildWelcomeGiftMail(createdAt) {
  return {
    type: 'reward',
    title: 'ของขวัญต้อนรับ',
    body: `ยินดีต้อนรับสู่ RxTU10! รับของขวัญต้อนรับ ${WELCOME_GIFT_COINS.toLocaleString()} เหรียญ + ตั๋วกาชา ${WELCOME_GIFT_TICKETS} ใบ`,
    reward: { coins: WELCOME_GIFT_COINS, tickets: WELCOME_GIFT_TICKETS },
    from: 'welcome',
    createdAt,
    read: false,
    claimed: false,
  }
}
```

- [ ] **Step 4: รันเทสให้ผ่าน**

Run: `node --test src/utils/mailbox.test.js`
Expected: PASS ทุกเทส (รวมของเดิม)

- [ ] **Step 5: Commit**

```bash
git add src/utils/mailbox.js src/utils/mailbox.test.js
git commit -m "Mailbox: รองรับตั๋วในรางวัล + buildWelcomeGiftMail (welcome gift)"
```

---

### Task 3: claim transaction เติมตั๋ว + MailboxCard แสดงตั๋ว

**Files:**
- Modify: `src/stores/mailbox.js:50-78` (ฟังก์ชัน `claim`)
- Modify: `src/components/home/MailboxCard.vue`

**Interfaces:**
- Consumes: `rewardTickets`, `canClaim`, `rewardCoins` จาก Task 2
- Produces: `mailbox.claim(id)` คืน `{ coins:number, tickets:number }` (เดิมคืน number) หรือ `false` เมื่อ error

> หมายเหตุ: store เทสด้วย unit ไม่ได้ (import firebase) → gate = `npm run build` + ทดลองมือ. การเปลี่ยน return shape ทำให้ caller (MailboxCard) ต้องแก้ในงานเดียวกัน

- [ ] **Step 1: แก้ claim ใน stores/mailbox.js**

แก้ import บรรทัด 7 ให้รวม `rewardTickets`:

```js
import { attentionCount, canClaim, rewardCoins, rewardTickets } from '../utils/mailbox.js'
```

แก้ body ของ `runTransaction` callback + return (แทนบล็อกเดิมในฟังก์ชัน `claim`):

```js
      const result = await runTransaction(db, async (tx) => {
        const ref = doc(db, 'users', uid, 'mail', id)
        const snap = await tx.get(ref)
        if (!snap.exists() || snap.data().claimed) return { coins: 0, tickets: 0, ach: null }
        const data = snap.data()
        const c = rewardCoins(data)
        const t = rewardTickets(data)
        const ach = data.reward?.achievement || null
        tx.update(ref, { claimed: true, read: true })
        const userPatch = {}
        if (c > 0) userPatch.coins = increment(c)
        if (t > 0) userPatch.freeGachaTickets = increment(t)
        if (ach) {
          tx.set(doc(db, 'users', uid, 'achievements', achievementDocId(ach.id, ach.date || null)),
            { achId: ach.id, ...(ach.date ? { date: ach.date } : {}), earnedAt: serverTimestamp() })
          userPatch.achievementCount = increment(1)
        }
        if (Object.keys(userPatch).length) tx.update(doc(db, 'users', uid), userPatch)
        return { coins: c, tickets: t, ach }
      })
      usage.track(0, 1)
      if (result.coins > 0 || result.tickets > 0 || result.ach) { m.claimed = true; m.read = true }
      if (result.ach) { addEarned(result.ach.id); await announceAchievement(result.ach.id, result.ach.date || null) }
      return { coins: result.coins, tickets: result.tickets }
```

แก้ comment เหนือฟังก์ชัน `claim` (บรรทัด ~49) ให้ตรง:

```js
  // คืน { coins, tickets } ที่ได้ (0/0 ถ้ารับไปแล้ว/ไม่มีรางวัล, false ถ้า error)
```

- [ ] **Step 2: แก้ MailboxCard.vue ให้แสดง + toast ตั๋ว**

ใน `src/components/home/MailboxCard.vue` แก้ import (บรรทัด 45):

```js
import { canClaim, rewardCoins, rewardTickets } from '../../utils/mailbox.js'
```

แก้ `hasReward` (บรรทัด 53):

```js
function hasReward(m) { return rewardCoins(m) > 0 || rewardTickets(m) > 0 }
```

แทนปุ่มรับใน template (บรรทัด 28-34) ด้วย:

```vue
          <button
            v-if="hasReward(m)"
            class="mb-claim" :class="{ done: m.claimed }"
            :disabled="m.claimed || claimingId === m.id"
            @click.stop="onClaim(m)"
          >
            <template v-if="m.claimed">รับแล้ว ✓</template>
            <template v-else>
              รับ
              <template v-if="rewardCoins(m) > 0">{{ rewardCoins(m).toLocaleString() }}<Emoji char="🪙" /></template>
              <template v-if="rewardTickets(m) > 0"> +{{ rewardTickets(m) }}<Emoji char="🎟️" /></template>
            </template>
          </button>
```

แก้ `onClaim` (บรรทัด 64-73) ให้ toast ทั้งเหรียญ+ตั๋ว:

```js
async function onClaim(m) {
  if (claimingId.value || !canClaim(m)) return
  claimingId.value = m.id
  try {
    const res = await mailbox.claim(m.id)
    if (res === false) { toast('รับรางวัลไม่สำเร็จ', 'error'); return }
    const parts = []
    if (res.coins > 0) parts.push(`${res.coins.toLocaleString()} เหรียญ`)
    if (res.tickets > 0) parts.push(`${res.tickets} ตั๋ว`)
    if (parts.length) toast(`รับ ${parts.join(' + ')} แล้ว`, 'success')
    else toast('จดหมายนี้รับไปแล้ว', 'info')
  } finally { claimingId.value = null }
}
```

- [ ] **Step 3: build + ทดลองมือ**

Run: `npm run build`
Expected: build ผ่าน ไม่มี error

ทดลองมือ (dev): สร้างจดหมายที่มี `reward.tickets` (เช่น broadcast จาก Admin หลังทำ Task 7 หรือ welcome หลัง Task 4) → กดรับ → toast บอกตั๋ว, `freeGachaTickets` เพิ่ม

- [ ] **Step 4: Commit**

```bash
git add src/stores/mailbox.js src/components/home/MailboxCard.vue
git commit -m "Mailbox: claim เติมตั๋ว + การ์ดแสดง/ทอสต์ตั๋ว (welcome gift)"
```

---

### Task 4: firestore.rules (welcome-v1 + claimed monotonic) + self-deliver ตอน login

**Files:**
- Modify: `firestore.rules:88-94` (`match /mail/{mailId}`)
- Modify: `src/stores/auth.js` (เพิ่ม `runWelcomeGiftIfNeeded`, เรียกใน onSnapshot)

**Interfaces:**
- Consumes: `buildWelcomeGiftMail` จาก Task 2; `welcomeGiftV1` flag จาก Task 1
- Produces: ผู้ใช้ที่ `welcomeGiftV1 !== true` จะได้ mail `users/{uid}/mail/welcome-v1` + flag ตั้งเป็น true ตอน login

> Gate = `npm run build` + ทดลองมือ + deploy rules (จำเป็นก่อนทดสอบจริง)

- [ ] **Step 1: แก้ firestore.rules**

แทนบล็อก `match /mail/{mailId}` (บรรทัด 88-94) ด้วย:

```
      match /mail/{mailId} {
        allow read:   if request.auth != null && request.auth.uid == userId;
        // create: ทีมงาน (academic) สร้างได้ทุกแบบ · owner สร้างได้เฉพาะจดหมายต้อนรับแม่แบบเป๊ะ
        //   doc id ตายตัว 'welcome-v1' → มีได้ไม่เกิน 1 ฉบับ/คน (ซ้ำ = update ซึ่งจำกัด field)
        allow create: if isAcademic()
          || (
            request.auth != null && request.auth.uid == userId
            && mailId == 'welcome-v1'
            && request.resource.data.get('from', '') == 'welcome'
            && request.resource.data.get('claimed', true) == false
            && request.resource.data.reward.keys().hasOnly(['coins', 'tickets'])
            && request.resource.data.reward.get('coins', 0) == 15000
            && request.resource.data.reward.get('tickets', 0) == 50
          );
        // update: เจ้าของ แก้ได้เฉพาะ read/claimed และ claimed เปลี่ยนได้ทางเดียว false→true (กดรับซ้ำไม่ได้)
        allow update: if request.auth != null && request.auth.uid == userId
                      && request.resource.data.diff(resource.data).affectedKeys().hasOnly(['read', 'claimed'])
                      && (resource.data.get('claimed', false) == false
                          || request.resource.data.get('claimed', false) == true);
        allow delete: if (request.auth != null && request.auth.uid == userId) || isAdmin();
      }
```

- [ ] **Step 2: เพิ่ม self-deliver ใน auth.js**

ใน `src/stores/auth.js` แก้ import firestore (บรรทัด 7-10) เพิ่ม `writeBatch`, `collection`:

```js
import {
    doc, getDoc, setDoc, updateDoc, onSnapshot, collection, writeBatch,
    serverTimestamp, increment,
} from 'firebase/firestore'
```

แก้ import จาก userSchema (บรรทัด 13) เพิ่ม `buildWelcomeGiftMail`:

```js
import { newUserDoc, normalizeUserData } from '../data/userSchema.js'
import { buildWelcomeGiftMail } from '../utils/mailbox.js'
```

หลังฟังก์ชัน `runPetMigrationIfNeeded` (หลังบรรทัด ~151) เพิ่ม:

```js
    // One-time: ส่งจดหมายของขวัญต้อนรับ (doc id ตายตัว 'welcome-v1' — rules ตรวจแม่แบบเป๊ะ)
    // batch เขียน 2 docs atomic: สร้างจดหมาย + ตั้ง flag กันส่งซ้ำ
    let _welcomeGifting = false
    async function runWelcomeGiftIfNeeded() {
        const u = userData.value
        if (!u || u.welcomeGiftV1 === true || _welcomeGifting) return
        const uid = currentUser.value?.uid
        if (!uid) return
        _welcomeGifting = true
        try {
            const batch = writeBatch(db)
            batch.set(doc(db, 'users', uid, 'mail', 'welcome-v1'), buildWelcomeGiftMail(serverTimestamp()))
            batch.update(doc(db, 'users', uid), { welcomeGiftV1: true })
            await batch.commit()
        } catch (e) {
            console.error('[welcome gift]', e)
        } finally {
            _welcomeGifting = false
        }
    }
```

เรียกใน onSnapshot handler (บรรทัด ~225) ข้าง `runPetMigrationIfNeeded()`:

```js
                _unsub = onSnapshot(doc(db, 'users', user.uid), (snap) => {
                    if (_blockSnapshot) return
                    userData.value = normalizeUserData(snap.data())
                    runPetMigrationIfNeeded()
                    runWelcomeGiftIfNeeded()
                })
```

- [ ] **Step 3: build**

Run: `npm run build`
Expected: build ผ่าน

- [ ] **Step 4: deploy rules + ทดลองมือ**

Run: `firebase deploy --only firestore:rules`
Expected: Deploy complete

ทดลองมือ (dev, บัญชีทดสอบที่ `welcomeGiftV1` ยังไม่ true):
1. login → กล่องจดหมายมี "ของขวัญต้อนรับ" (กดรับได้) · `welcomeGiftV1` = true ใน Firestore
2. reload → ไม่ได้จดหมายซ้ำ (ยังฉบับเดียว)
3. กดรับ → +15,000 เหรียญ +50 ตั๋ว · กดอีกครั้งไม่ได้
4. (ทดสอบ rules) ลองสร้าง `mail/welcome-v1` ด้วย reward.coins อื่นผ่าน DevTools → ถูกปฏิเสธ

- [ ] **Step 5: Commit**

```bash
git add firestore.rules src/stores/auth.js
git commit -m "WelcomeGift: self-deliver จดหมาย welcome-v1 ตอน login + rules แม่แบบเป๊ะ/claimed monotonic"
```

---

### Task 5: Welcome box เด้งต้อนรับ

**Files:**
- Create: `src/components/WelcomeBox.vue`
- Modify: `src/App.vue` (mount component)

**Interfaces:**
- Consumes: `auth.userData.welcomeGiftV1`, `auth.userData.welcomeBoxSeen` จาก Task 1; `auth.patchUser`
- Produces: modal เด้งครั้งเดียว, ปิด → `welcomeBoxSeen = true`

> Gate = `npm run build` + ทดลองมือ

- [ ] **Step 1: สร้าง WelcomeBox.vue**

สร้าง `src/components/WelcomeBox.vue`:

```vue
<template>
  <Teleport to="body">
    <div v-if="show" class="wb-ov" @click.self="close">
      <div class="wb-box">
        <div class="wb-emoji"><Emoji char="🎉" /></div>
        <div class="wb-title">ยินดีต้อนรับสู่ RxTU10!</div>
        <div class="wb-sub">รับของขวัญต้อนรับของคุณได้เลย</div>
        <div class="wb-gifts">
          <div class="wb-gift"><Emoji char="🪙" /> {{ WELCOME_GIFT_COINS.toLocaleString() }} เหรียญ</div>
          <div class="wb-gift"><Emoji char="🎟️" /> ตั๋วกาชา {{ WELCOME_GIFT_TICKETS }} ใบ</div>
        </div>
        <div class="wb-hint">เปิด <b>กล่องจดหมาย</b> ที่หน้าหลักเพื่อกดรับ</div>
        <button class="wb-btn" @click="close">เยี่ยมเลย!</button>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue'
import Emoji from './shared/Emoji.vue'
import { useAuthStore } from '../stores/auth.js'
import { WELCOME_GIFT_COINS, WELCOME_GIFT_TICKETS } from '../data/userSchema.js'

const auth = useAuthStore()
const show = computed(() => !!auth.userData?.welcomeGiftV1 && !auth.userData?.welcomeBoxSeen)

async function close() {
  await auth.patchUser({ welcomeBoxSeen: true }, { welcomeBoxSeen: true })
}
</script>

<style scoped>
.wb-ov { position: fixed; inset: 0; background: rgba(0,0,0,.5); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; }
.wb-box { background: #fff; border: 2px solid var(--ink); border-radius: 20px; padding: 24px 20px; box-shadow: var(--pop); max-width: 320px; width: 100%; text-align: center; }
.wb-emoji { font-size: 3rem; }
.wb-title { font-size: 1.25rem; font-weight: 800; color: var(--ink); margin-top: 6px; }
.wb-sub { font-size: .82rem; color: rgba(0,0,0,.55); margin-top: 4px; }
.wb-gifts { display: flex; flex-direction: column; gap: 8px; margin: 16px 0; }
.wb-gift { border: 2px dashed var(--ink); border-radius: 12px; padding: 10px; font-weight: 800; font-size: .95rem; background: var(--primary-light); }
.wb-hint { font-size: .74rem; color: rgba(0,0,0,.55); line-height: 1.5; margin-bottom: 14px; }
.wb-btn { width: 100%; border: 2px solid var(--ink); border-radius: 12px; padding: 11px; font-family: inherit; font-weight: 800; color: #fff; background: var(--primary); box-shadow: var(--pop); cursor: pointer; }
</style>
```

> หมายเหตุ: ตรวจชื่อ CSS var ที่ใช้ (`--ink`, `--pop`, `--primary`, `--primary-light`) มีใน `src/style.css` (ShopView ใช้อยู่) — ถ้าตัวไหนไม่มีให้ปรับเป็นที่มี

- [ ] **Step 2: mount ใน App.vue**

ใน `src/App.vue` เพิ่ม import (ในกลุ่ม import component ใกล้บรรทัด 44):

```js
import WelcomeBox from './components/WelcomeBox.vue'
```

วาง `<WelcomeBox />` ถัดจาก `<MigrationWelcome />` (บรรทัด 32) ในบล็อก gated `<template v-else-if="authStore.isQuestionEditor || !maintenance">` — เป็น precedent เดียวกับ MigrationWelcome (อยู่ในบล็อกนี้ = login & ผ่าน onboarding แล้ว). ตัว component gate การแสดงผลเองด้วย flag `welcomeGiftV1 && !welcomeBoxSeen`:

```vue
      <HelpModal />
      <MigrationWelcome />
      <WelcomeBox />
```

- [ ] **Step 3: build + ทดลองมือ**

Run: `npm run build`
Expected: build ผ่าน

ทดลองมือ: บัญชีที่ `welcomeGiftV1=true, welcomeBoxSeen=false` → เด้ง Welcome box · กด "เยี่ยมเลย!" → ปิด, `welcomeBoxSeen=true` · reload ไม่เด้งอีก

- [ ] **Step 4: Commit**

```bash
git add src/components/WelcomeBox.vue src/App.vue
git commit -m "WelcomeGift: Welcome box เด้งต้อนรับ (ครั้งเดียว ขับด้วย flag)"
```

---

### Task 6: gacha resolvePullPayment (ตั๋ว payment-first, pure)

**Files:**
- Modify: `src/utils/gacha.js`
- Test: `src/utils/gacha.test.js`

**Interfaces:**
- Produces: `resolvePullPayment(n, tickets) → { rolls:number, pay:'ticket'|'coin', amount:number }`
  - `n===1`: rolls=1, ต้องใช้ตั๋ว 1 · `n!==1`: rolls=TEN_PULL_N(11), ต้องใช้ตั๋ว 10
  - ตั๋วพอ → pay 'ticket' (amount=จำนวนตั๋ว) · ไม่พอ → pay 'coin' (amount=PULL_COST หรือ TEN_PULL_COST)

- [ ] **Step 1: เขียนเทสที่ fail**

ต่อท้าย `src/utils/gacha.test.js`:

```js
import { resolvePullPayment, PULL_COST, TEN_PULL_COST, TEN_PULL_N } from './gacha.js'

test('resolvePullPayment ×1: ตั๋ว≥1 จ่ายตั๋ว ไม่งั้นเหรียญ', () => {
  assert.deepEqual(resolvePullPayment(1, 5), { rolls: 1, pay: 'ticket', amount: 1 })
  assert.deepEqual(resolvePullPayment(1, 0), { rolls: 1, pay: 'coin', amount: PULL_COST })
})

test('resolvePullPayment ×10: ตั๋ว≥10 จ่าย 10 ตั๋ว (11 ตัว) ไม่งั้น 10000 เหรียญ', () => {
  assert.deepEqual(resolvePullPayment(10, 10), { rolls: TEN_PULL_N, pay: 'ticket', amount: 10 })
  assert.deepEqual(resolvePullPayment(10, 9),  { rolls: TEN_PULL_N, pay: 'coin', amount: TEN_PULL_COST })
})
```

- [ ] **Step 2: รันเทสให้เห็นว่า fail**

Run: `node --test src/utils/gacha.test.js`
Expected: FAIL — `resolvePullPayment` ไม่มี

- [ ] **Step 3: เพิ่มฟังก์ชันใน gacha.js**

ต่อท้าย `src/utils/gacha.js`:

```js
/** ตั๋ว payment-first: คืนวิธีจ่ายของปุ่มสุ่ม (n=1 หรือ 10) ตามจำนวนตั๋วที่มี
 *  ×1 ใช้ 1 ตั๋ว / ×10 ใช้ 10 ตั๋ว (ได้ 11 ตัว) — มีตั๋วพอใช้ตั๋วก่อน ไม่พอจ่ายเหรียญ */
export function resolvePullPayment(n, tickets) {
  const single = n === 1
  const rolls = single ? 1 : TEN_PULL_N
  const ticketsNeeded = single ? 1 : 10
  if ((tickets || 0) >= ticketsNeeded) return { rolls, pay: 'ticket', amount: ticketsNeeded }
  return { rolls, pay: 'coin', amount: single ? PULL_COST : TEN_PULL_COST }
}
```

- [ ] **Step 4: รันเทสให้ผ่าน**

Run: `node --test src/utils/gacha.test.js`
Expected: PASS ทุกเทส

- [ ] **Step 5: Commit**

```bash
git add src/utils/gacha.js src/utils/gacha.test.js
git commit -m "Gacha: resolvePullPayment ตั๋ว payment-first (×1=1 ตั๋ว, ×10=10 ตั๋ว)"
```

---

### Task 7: ShopView ใช้ตั๋ว payment-first บนปุ่มสุ่มเดิม

**Files:**
- Modify: `src/views/ShopView.vue` (template ปุ่ม บรรทัด 51-61 + ฟังก์ชัน `pull` บรรทัด 189-216)

**Interfaces:**
- Consumes: `resolvePullPayment` จาก Task 6
- Produces: ปุ่ม ×1/×10 จ่ายด้วยตั๋วเมื่อมีพอ (ไม่งั้นเหรียญ); ลบปุ่มตั๋วฟรีแยก

> Gate = `npm run build` + ทดลองมือ

- [ ] **Step 1: แก้ import + ฟังก์ชัน pull**

ใน `src/views/ShopView.vue` แก้ import gacha (บรรทัด 142) เพิ่ม `resolvePullPayment`:

```js
import { rollMany, resolvePullPayment, GACHA_RATES, PULL_COST, TEN_PULL_COST, TEN_PULL_N, HARD_PITY } from '../utils/gacha.js'
```

แทนฟังก์ชัน `pull` ทั้งฟังก์ชัน (บรรทัด 189-216) ด้วย:

```js
async function pull(n) {
  if (buying.value) return
  const { rolls, pay, amount } = resolvePullPayment(n, tickets.value)
  if (pay === 'coin' && coins.value < amount) { toast(`เหรียญไม่พอ! ต้องการ ${amount.toLocaleString()}`, 'error'); return }

  const state = { pity: pity.value, target: target.value, guaranteed: guaranteed.value, ownedLegendaryIds: ownedLegendaryIds() }
  const { results, nextState } = rollMany(rolls, state, PETS)
  const { pets: newPets, summary } = mergeRolls(pets.value, results, PETS)
  const today = new Date().toISOString().slice(0, 10)
  const dq = bumpDailyQuest(authStore.userData?.dailyQuest, 'gacha', today, 1)

  buying.value = true
  // NOTE: gachaTarget ไม่เขียนที่นี่ — เป็นของ chooseTarget() (กัน stale-target write)
  const base = { pets: newPets, dailyQuest: dq, gachaPity: nextState.pity, gachaGuaranteed: nextState.guaranteed }
  const optimistic = {
    ...base,
    ...(pay === 'ticket'
      ? { freeGachaTickets: tickets.value - amount }
      : { coins: coins.value - amount, totalSpent: (authStore.userData?.totalSpent || 0) + amount }),
  }
  const server = {
    ...base,
    ...(pay === 'ticket'
      ? { freeGachaTickets: increment(-amount) }
      : { coins: increment(-amount), totalSpent: increment(amount) }),
  }
  const ok = await authStore.patchUser(optimistic, server)
  buying.value = false
  if (ok) showReveal(summary, rolls > 1)
  else toast('สุ่มไม่สำเร็จ', 'error')
}
```

- [ ] **Step 2: แก้ปุ่มใน template**

แทนบล็อกปุ่ม (บรรทัด 51-61) ด้วย (ลบปุ่มตั๋วฟรีแยก, ป้ายปุ่มเปลี่ยนตามวิธีจ่าย):

```vue
        <div v-if="tickets > 0" class="ticket-note"><Emoji char="🎟️" /> ตั๋วกาชา: {{ tickets }} ใบ (ใช้ตั๋วก่อนอัตโนมัติ)</div>
        <div class="pull-row">
          <button class="pull-btn" :class="{ ok: pay1.pay === 'ticket' || coins >= PULL_COST }" :disabled="buying" @click="pull(1)">
            สุ่ม 1<br>
            <small v-if="pay1.pay === 'ticket'">{{ pay1.amount }}<Emoji char="🎟️" /></small>
            <small v-else>{{ PULL_COST.toLocaleString() }}<Emoji char="🪙" /></small>
          </button>
          <button class="pull-btn" :class="{ ok: pay10.pay === 'ticket' || coins >= TEN_PULL_COST }" :disabled="buying" @click="pull(10)">
            สุ่ม 10<br>
            <small v-if="pay10.pay === 'ticket'">{{ pay10.amount }}<Emoji char="🎟️" /></small>
            <small v-else>{{ TEN_PULL_COST.toLocaleString() }}<Emoji char="🪙" /></small>
          </button>
        </div>
```

เพิ่ม computed ใน `<script setup>` (ใต้บรรทัด `const pityLeft ...` ~162):

```js
const pay1  = computed(() => resolvePullPayment(1, tickets.value))
const pay10 = computed(() => resolvePullPayment(10, tickets.value))
```

เพิ่ม style สำหรับ `.ticket-note` (ในบล็อก `<style scoped>` ใกล้ `.ticket-btn` เดิม — จะลบ `.ticket-btn` ทิ้งก็ได้เพราะไม่ใช้แล้ว):

```css
.ticket-note { font-size: .7rem; font-weight: 800; color: #b45309; margin-bottom: 8px; }
```

- [ ] **Step 3: build + ทดลองมือ**

Run: `npm run build`
Expected: build ผ่าน

ทดลองมือ (dev):
1. ตั๋ว ≥10: ปุ่ม ×10 โชว์ `10🎟️` → กด → ตั๋วลด 10, ได้ 11 ตัว, เหรียญ/totalSpent ไม่ลด
2. ตั๋ว = 5: ปุ่ม ×10 โชว์ `10,000🪙` → จ่ายเหรียญ · ปุ่ม ×1 โชว์ `1🎟️` → จ่ายตั๋ว
3. ตั๋ว = 0: ทั้งสองปุ่มจ่ายเหรียญตามเดิม
4. pity เดินทุกกรณี

- [ ] **Step 4: Commit**

```bash
git add src/views/ShopView.vue
git commit -m "Shop: ตั๋ว payment-first บนปุ่มสุ่ม (×10=10 ตั๋ว 11 pull) เลิกปุ่มตั๋วฟรีแยก"
```

---

## Final verification (หลังครบทุก Task)

- [ ] รัน pure tests ทั้งหมด: `node --test src/utils/mailbox.test.js src/utils/gacha.test.js src/data/userSchema.test.js` → PASS
- [ ] `npm run build` → ผ่าน
- [ ] `firebase deploy --only firestore:rules` (ถ้ายังไม่ได้ deploy จาก Task 4)
- [ ] ทดลองมือ end-to-end ด้วยบัญชีใหม่: login → Welcome box เด้ง → กล่องจดหมายมีของขวัญ → กดรับ +15,000 +50 ตั๋ว → ไปร้านกด ×10 ใช้ตั๋ว
- [ ] push: `git push origin master` (deploy เว็บผ่าน GitHub Actions)

## Notes / ลำดับ dependency

- Task 1 → 2 (mailbox import ค่าคงที่) → 3,4 (ใช้ buildWelcomeGiftMail)
- Task 4 ต้อง deploy rules ก่อนทดสอบ self-deliver จริง
- Task 6 → 7 (ShopView ใช้ resolvePullPayment)
- Task 3 ทดสอบมือเต็มรูปแบบได้หลัง Task 4 (มี welcome mail มีตั๋วให้กดรับ) — ระหว่างทำ Task 3 ตรวจ build ผ่านพอ

## Deferred (ของแถมใน spec — ไม่อยู่ในขอบเขต plan นี้)

- **ช่อง "ตั๋วแนบ" ในฟอร์ม Admin broadcast** (`AdminView.vue` `sendBroadcast`): `buildBroadcastMail` รองรับ `tickets` แล้ว (Task 2) เหลือแค่ wire `v-model.number="bcTickets"` + ส่งเข้า `buildBroadcastMail({...,tickets})`. ทำทีหลังถ้าต้องการให้แอดมินแนบตั๋วทั่วไป — welcome gift ไม่ต้องใช้ (self-deliver)
