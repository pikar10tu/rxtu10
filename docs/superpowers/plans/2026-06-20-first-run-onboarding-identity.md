# First-run Onboarding & Identity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** เพิ่ม flow ครั้งแรกที่ login — ขอ consent (PDPA) → ผูกตัวตนนักศึกษาด้วยรหัส หรือสมัคร guest (รอ admin อนุมัติ) → แก้จอ logged-out ให้เป็นหน้า login ที่ถูกต้อง

**Architecture:** Overlay-gate ใน `App.vue` (ตาม pattern เดิม MaintenanceScreen/MigrationWelcome) ขับด้วย pure function `onboardingGate(userData)` + flag บน user doc. รหัสนักศึกษากันจองซ้ำ atomic ด้วย doc `claims/{studentId}` (create-only ผ่าน rules). Identity match กับ roster ทำ client-side จาก `data/students.js`

**Tech Stack:** Vue 3 (`<script setup>` + scoped style), Pinia, Firebase Firestore, pure utils + `node --test`

## Global Constraints

- เขียน user doc ผ่าน `auth.patchUser(optimistic, server)` เท่านั้น (ห้าม updateDoc user ตรงๆ ในโค้ดใหม่ ยกเว้น claims/admin actions)
- ข้อความจากผู้ใช้ทุกช่องผ่าน `cleanText(str, LIMITS.xxx)` ก่อนเขียน
- คอมโพเนนต์: single-file + scoped style · emoji ทุกตัวผ่าน `<Emoji char="...">` (ห้าม emoji ดิบใน template text) · overlay/modal ต้อง z-index > 200 และ render ที่ระดับ root (อยู่ใน App.vue แล้ว = ปลอดภัย)
- commit message รูปแบบ `Area: อะไร (ทำไม)` ไทยปนอังกฤษ · จบ commit ด้วย `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`
- เทส pure util รันด้วย `node --test src/utils/<x>.test.js` · คอมโพเนนต์/integration ตรวจด้วย `npm run build`
- CONSENT_VERSION เริ่มที่ `'2026-06-20'`
- ⚠️ หลัง build เสร็จต้อง `firebase deploy --only firestore:rules` (ดู Task 4) — ไม่ deploy = rules ไม่มีผล
- ห้าม revert `signInWithRedirect` (มือถือ) และ `experimentalForceLongPolling`

---

## File Structure

**สร้างใหม่:**
- `src/data/consent.js` — ข้อความ consent (array บรรทัด) + หัวข้อ/ปุ่ม
- `src/utils/onboarding.js` — pure: `needsConsent`, `matchRoster`, `validateGuest`, `onboardingGate`
- `src/utils/onboarding.test.js` — เทส pure util
- `src/components/onboarding/ConsentGate.vue`
- `src/components/onboarding/OnboardingWizard.vue`
- `src/components/onboarding/GuestPendingScreen.vue`
- `src/components/onboarding/LoginLanding.vue`

**แก้ไข:**
- `src/firebase/config.js` — เพิ่ม `export const CONSENT_VERSION`
- `src/data/userSchema.js` — เพิ่ม field ใหม่ใน USER_DEFAULTS
- `src/utils/text.js` — เพิ่ม `LIMITS.nickname`, `LIMITS.guestReason`
- `src/stores/auth.js` — เพิ่ม actions `acceptConsent`, `linkStudent`, `registerGuest`
- `src/App.vue` — gate logic ใหม่
- `firestore.rules` — `claims/{studentId}` block + guard `guestStatus`
- `src/stores/members.js` — แยก guest ด้วย `accountType` + light fields ใหม่
- `src/views/MembersView.vue` — ปุ่ม toggle ดู guest แยก
- `src/views/AdminView.vue` — การ์ดอนุมัติ guest + อีเมล/แก้การผูก
- `src/components/members/ProfileModal.vue` — label "ผู้เยี่ยมชม" สำหรับ guest

---

## Task 1: Data model + constants

**Files:**
- Modify: `src/firebase/config.js`
- Modify: `src/data/userSchema.js:14-56`
- Modify: `src/utils/text.js:28-37`
- Create: `src/data/consent.js`

**Interfaces:**
- Produces: `CONSENT_VERSION` (string) from `firebase/config.js`; new USER_DEFAULTS keys `consent {accepted,version,at}`, `onboarded`, `accountType`, `guestReason`, `guestStatus`; `LIMITS.nickname=30`, `LIMITS.guestReason=200`; `CONSENT` object from `data/consent.js`

- [ ] **Step 1: เพิ่ม CONSENT_VERSION ใน config**

ใน `src/firebase/config.js` เพิ่มบรรทัด (วางใกล้ค่าคงที่อื่น เช่นใต้ `ADMIN_EMAIL`):

```js
// bump เมื่อแก้ข้อความ consent → บังคับผู้ใช้ยินยอมใหม่อัตโนมัติ
export const CONSENT_VERSION = '2026-06-20'
```

- [ ] **Step 2: เพิ่ม field ใหม่ใน USER_DEFAULTS**

ใน `src/data/userSchema.js` ภายใน `USER_DEFAULTS` (ต่อท้ายก่อนปิด `}` ที่บรรทัด ~55, หลัง `petsMigratedV2: false,`):

```js
  // ── onboarding / identity (first-run) ──
  consent: { accepted: false, version: null, at: null },  // PDPA
  onboarded: false,        // ผ่าน wizard ผูกตัวตนแล้ว
  accountType: null,       // 'student' | 'guest'
  guestReason: null,       // เหตุผลเข้าชม (เฉพาะ guest)
  guestStatus: null,       // null | 'pending' | 'approved' | 'rejected'
```

- [ ] **Step 3: เพิ่ม LIMITS**

ใน `src/utils/text.js` ใน object `LIMITS` เพิ่ม:

```js
  nickname: 30,
  guestReason: 200,
```

- [ ] **Step 4: สร้าง data/consent.js**

```js
// ════════════════════════════════════════════════════════════
//  ข้อความยินยอมใช้ข้อมูล (PDPA) — แสดงใน ConsentGate
//  แก้ข้อความเมื่อไหร่ ให้ bump CONSENT_VERSION ใน firebase/config.js ด้วย
// ════════════════════════════════════════════════════════════
export const CONSENT = {
  title: 'ก่อนเริ่ม ขออนุญาตแป๊บนึงนะ',
  titleEmoji: '🌿',
  intro: 'RxTU10 เป็นพื้นที่เล็กๆ ของชาวเภสัช มธ. รุ่น 10 ที่ทำกันเองเพื่อให้พวกเราได้สนุกไปด้วยกัน และช่วยกันเตรียมตัวสอบใบประกอบวิชาชีพเภสัชกรรม (CC) ให้ผ่านไปพร้อมๆ กัน',
  lead: 'เพื่อให้ทุกอย่างทำงานได้ เราขอเก็บข้อมูลของคุณนิดหน่อย:',
  items: [
    { emoji: '🪪', head: 'ตัวตนของคุณ', body: 'ชื่อ อีเมล และรูปจากบัญชี Google ที่ใช้เข้าระบบ พร้อมรหัสนักศึกษา/ชื่อเล่นที่ผูกไว้' },
    { emoji: '🎮', head: 'ความเคลื่อนไหวในเกม', body: 'เหรียญ ความคืบหน้าการอ่านหนังสือ และอื่นๆ ที่ทำให้เล่นต่อได้' },
    { emoji: '👀', head: 'ใครเห็นอะไรบ้าง', body: 'เพื่อนร่วมรุ่นเห็นแค่ชื่อเล่น สาย และเลเวลบ้านของคุณ ส่วนจำนวนเหรียญเก็บเป็นความลับเฉพาะคุณคนเดียว' },
    { emoji: '🛠️', head: 'ช่วยให้เว็บดีขึ้น', body: 'เรานำข้อมูลการใช้งานไปปรับปรุงและพัฒนาเว็บให้ดีขึ้นเรื่อยๆ' },
    { emoji: '✏️', head: 'เปลี่ยนใจได้เสมอ', body: 'อยากแก้หรือลบข้อมูล ทักแอดมินได้ตลอดเลย' },
  ],
  checkboxLabel: 'อ่านแล้วน้า ยินดีให้ใช้ข้อมูลตามนี้',
  acceptLabel: 'ไปลุยกันเลย!',
}
```

- [ ] **Step 5: ตรวจ build**

Run: `npm run build`
Expected: build ผ่าน (exit 0) ไม่มี error

- [ ] **Step 6: Commit**

```bash
git add src/firebase/config.js src/data/userSchema.js src/utils/text.js src/data/consent.js
git commit -m "Onboarding: data model + ข้อความ consent (field user doc + CONSENT_VERSION)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 2: Pure util `onboarding.js` + tests (TDD)

**Files:**
- Create: `src/utils/onboarding.js`
- Test: `src/utils/onboarding.test.js`

**Interfaces:**
- Consumes: (ไม่มี — pure)
- Produces:
  - `needsConsent(userData, version) -> bool`
  - `matchRoster(studentId, students) -> {id,nickname,realName,track} | null` (students = array จาก `members.students`, แต่ละตัวมี `{id,nickname,realName,track}`)
  - `validateGuest({nickname, reason}) -> {ok: bool, error: string|null}`
  - `onboardingGate(userData) -> 'consent' | 'wizard' | 'guest-pending' | 'ok'` (สมมติ logged-in แล้ว; รับ `version` ผ่าน arg 2: `onboardingGate(userData, version)`)

- [ ] **Step 1: เขียนเทสที่ fail ก่อน**

สร้าง `src/utils/onboarding.test.js`:

```js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { needsConsent, matchRoster, validateGuest, onboardingGate } from './onboarding.js'

const V = '2026-06-20'
const students = [
  { id: '6512345678', nickname: 'อุ้ม', realName: 'ปรวิชญ์', track: 'care' },
  { id: '6587654321', nickname: 'มาย', realName: 'มาลี', track: 'sci' },
]

test('needsConsent: ยังไม่เคยยอมรับ → true', () => {
  assert.equal(needsConsent({}, V), true)
  assert.equal(needsConsent({ consent: { accepted: false, version: null } }, V), true)
})
test('needsConsent: ยอมรับ version เดิม → true (ต้อง re-consent)', () => {
  assert.equal(needsConsent({ consent: { accepted: true, version: '2025-01-01' } }, V), true)
})
test('needsConsent: ยอมรับ version ปัจจุบัน → false', () => {
  assert.equal(needsConsent({ consent: { accepted: true, version: V } }, V), false)
})

test('matchRoster: เจอรหัส (trim ช่องว่าง) → คืนข้อมูล', () => {
  assert.deepEqual(matchRoster(' 6512345678 ', students), students[0])
})
test('matchRoster: ไม่เจอ → null', () => {
  assert.equal(matchRoster('9999999999', students), null)
  assert.equal(matchRoster('', students), null)
})

test('validateGuest: ชื่อ+เหตุผลครบ → ok', () => {
  assert.deepEqual(validateGuest({ nickname: 'แขก', reason: 'มาดูเฉยๆ' }), { ok: true, error: null })
})
test('validateGuest: ชื่อว่าง → error', () => {
  assert.equal(validateGuest({ nickname: '  ', reason: 'x' }).ok, false)
})
test('validateGuest: เหตุผลว่าง → error', () => {
  assert.equal(validateGuest({ nickname: 'แขก', reason: '' }).ok, false)
})

test('onboardingGate: ยังไม่ consent → consent', () => {
  assert.equal(onboardingGate({}, V), 'consent')
})
test('onboardingGate: consent แล้วแต่ยังไม่ onboard → wizard', () => {
  assert.equal(onboardingGate({ consent: { accepted: true, version: V } }, V), 'wizard')
})
test('onboardingGate: คนเก่ามี studentId แม้ onboarded ไม่ตั้ง → ok (effective)', () => {
  assert.equal(onboardingGate({ consent: { accepted: true, version: V }, studentId: '6512345678' }, V), 'ok')
})
test('onboardingGate: guest pending → guest-pending', () => {
  assert.equal(onboardingGate({ consent: { accepted: true, version: V }, onboarded: true, accountType: 'guest', guestStatus: 'pending' }, V), 'guest-pending')
})
test('onboardingGate: guest approved → ok', () => {
  assert.equal(onboardingGate({ consent: { accepted: true, version: V }, onboarded: true, accountType: 'guest', guestStatus: 'approved' }, V), 'ok')
})
test('onboardingGate: guest เก่า track=guest (ไม่มี guestStatus) → ok', () => {
  assert.equal(onboardingGate({ consent: { accepted: true, version: V }, studentId: null, track: 'guest' }, V), 'ok')
})
```

- [ ] **Step 2: รันเทสให้เห็นว่า fail**

Run: `node --test src/utils/onboarding.test.js`
Expected: FAIL — "Cannot find module './onboarding.js'" หรือ export ไม่เจอ

- [ ] **Step 3: เขียน implementation ขั้นต่ำ**

สร้าง `src/utils/onboarding.js`:

```js
// ════════════════════════════════════════════════════════════
//  Pure helpers สำหรับ first-run onboarding (ไม่แตะ Firebase/DOM)
// ════════════════════════════════════════════════════════════

// ยังต้องขอ consent ไหม — ยังไม่ยอมรับ หรือ version ไม่ตรงกับปัจจุบัน
export function needsConsent(userData, version) {
  const c = userData?.consent
  return !(c && c.accepted === true && c.version === version)
}

// หา record นักศึกษาจาก roster ด้วยรหัส (trim ก่อนเทียบ)
export function matchRoster(studentId, students) {
  const id = String(studentId ?? '').trim()
  if (!id) return null
  return (students || []).find(s => s.id === id) || null
}

// ตรวจ input ฟอร์ม guest
export function validateGuest({ nickname, reason } = {}) {
  if (!String(nickname ?? '').trim()) return { ok: false, error: 'กรุณากรอกชื่อเล่น' }
  if (!String(reason ?? '').trim()) return { ok: false, error: 'กรุณากรอกเหตุผลที่เข้าชม' }
  return { ok: true, error: null }
}

// gate ลำดับชั้น (สมมติผู้ใช้ login แล้ว) — คืนชื่อหน้าจอที่ควรแสดง
//  ใช้ค่า "effective": คนเก่าที่มี studentId อยู่แล้ว ถือว่า onboarded
//  และ track เดิม 'guest' ถือว่า accountType guest + approved
export function onboardingGate(userData, version) {
  if (needsConsent(userData, version)) return 'consent'

  const onboarded = userData?.onboarded === true || !!userData?.studentId
  if (!onboarded) return 'wizard'

  const type = userData?.accountType
    || (userData?.studentId ? 'student' : (userData?.track === 'guest' ? 'guest' : null))
  if (type === 'guest') {
    const status = userData?.guestStatus || (userData?.track === 'guest' ? 'approved' : null)
    if (status !== 'approved') return 'guest-pending'
  }
  return 'ok'
}
```

- [ ] **Step 4: รันเทสให้ผ่าน**

Run: `node --test src/utils/onboarding.test.js`
Expected: PASS ทุกเคส

- [ ] **Step 5: Commit**

```bash
git add src/utils/onboarding.js src/utils/onboarding.test.js
git commit -m "Onboarding: pure util gate/matchRoster/validateGuest/needsConsent (+เทส)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 3: Auth store actions (consent / linkStudent / registerGuest)

**Files:**
- Modify: `src/stores/auth.js`

**Interfaces:**
- Consumes: `patchUser`, `currentUser`, `userData` (auth store); `matchRoster` (Task 2); `useMembersStore().students`; `CONSENT_VERSION` (Task 1)
- Produces (exposed จาก store):
  - `acceptConsent() -> Promise<bool>`
  - `linkStudent(studentId) -> Promise<{ok: bool, reason?: 'notfound'|'taken'}>`
  - `registerGuest(nickname, reason) -> Promise<bool>`

- [ ] **Step 1: เพิ่ม import**

ใน `src/stores/auth.js` แก้ import block:
- บรรทัด 8: เพิ่ม `getDoc` มีอยู่แล้ว — เพิ่ม ไม่ต้อง (มี `doc, getDoc, setDoc, updateDoc` แล้ว)
- เพิ่มบรรทัดใหม่หลัง import ที่ 13:

```js
import { CONSENT_VERSION } from '../firebase/config.js'
import { matchRoster } from '../utils/onboarding.js'
import { useMembersStore } from './members.js'
import { cleanText, LIMITS } from '../utils/text.js'
```

หมายเหตุ: `CONSENT_VERSION` import จาก config — แก้บรรทัด 11 ให้รวม `CONSENT_VERSION` ด้วยแทนการเพิ่มบรรทัดซ้ำ:
`import { auth, db, provider, ADMIN_EMAIL, SNAPSHOT_DELAY, CONSENT_VERSION } from '../firebase/config.js'`

- [ ] **Step 2: เพิ่ม actions (วางก่อน `function init()` ที่บรรทัด ~145)**

```js
    // ── Onboarding actions ──
    // ยอมรับ consent → persist consent block (ค่าเดียวที่ต้องเขียนจริงสำหรับคนเก่า)
    async function acceptConsent() {
        return patchUser(
            { consent: { accepted: true, version: CONSENT_VERSION, at: Date.now() } },
            { consent: { accepted: true, version: CONSENT_VERSION, at: serverTimestamp() } },
        )
    }

    // ผูกตัวตนนักศึกษา: match roster (client) → จอง claims/{id} (atomic) → เขียน identity
    //  คืน reason 'notfound' (ไม่อยู่ roster) / 'taken' (รหัสถูกจองแล้ว)
    async function linkStudent(studentId) {
        if (!currentUser.value) return { ok: false, reason: 'taken' }
        const members = useMembersStore()
        if (!members.students.length) members.initStudents()
        const m = matchRoster(studentId, members.students)
        if (!m) return { ok: false, reason: 'notfound' }

        const claimRef = doc(db, 'claims', m.id)
        try {
            const existing = await getDoc(claimRef)
            if (existing.exists()) return { ok: false, reason: 'taken' }
            // create-only (rules ปฏิเสธถ้ามีอยู่แล้ว = ตัวกันซ้ำจริง)
            await setDoc(claimRef, { uid: currentUser.value.uid, at: serverTimestamp() })
        } catch (e) {
            console.error('[linkStudent claim]', e)
            return { ok: false, reason: 'taken' }
        }

        const identity = {
            studentId: m.id, nickname: m.nickname, realName: m.realName,
            track: m.track, accountType: 'student', onboarded: true,
        }
        const ok = await patchUser(identity, identity)
        return { ok }
    }

    // สมัคร guest → pending (รอ admin อนุมัติ)
    async function registerGuest(nickname, reason) {
        const nick = cleanText(nickname, LIMITS.nickname)
        const why  = cleanText(reason, LIMITS.guestReason)
        if (!nick || !why) return false
        const patch = {
            nickname: nick, guestReason: why,
            accountType: 'guest', guestStatus: 'pending', onboarded: true,
        }
        return patchUser(patch, patch)
    }
```

- [ ] **Step 3: export actions ใหม่**

ใน return ของ store (บรรทัด ~174) เพิ่ม `acceptConsent, linkStudent, registerGuest`:

```js
        login, logout, ensureDoc,
        blockSnapshot, setUserDataOptimistic, patchUser,
        acceptConsent, linkStudent, registerGuest,
        init,
```

- [ ] **Step 4: ตรวจ build**

Run: `npm run build`
Expected: build ผ่าน ไม่มี error (ระวัง circular import auth↔members — members ไม่ได้ import auth จึงปลอดภัย)

- [ ] **Step 5: Commit**

```bash
git add src/stores/auth.js
git commit -m "Onboarding: auth actions acceptConsent/linkStudent/registerGuest (claims atomic)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 4: Firestore rules — claims + guestStatus guard

**Files:**
- Modify: `firestore.rules`

**Interfaces:**
- Produces: collection `claims/{studentId}` (create-only) + guard บน `users` update ที่ owner ตั้ง `guestStatus` ได้แค่ `'pending'`

- [ ] **Step 1: เพิ่ม guard guestStatus ใน users owner-update branch**

ใน `firestore.rules` ใน `match /users/{userId}` branch `allow update` ส่วน owner (บรรทัด 51-63) เพิ่มเงื่อนไขก่อนปิดวงเล็บของ owner branch (หลังบรรทัด 62 `<= ... + 1`):

```
          // owner ตั้ง guestStatus ได้แค่ 'pending' (สมัคร) — approve/reject = admin เท่านั้น
          && (
            request.resource.data.get('guestStatus', null) == resource.data.get('guestStatus', null)
            || request.resource.data.get('guestStatus', null) == 'pending'
          )
```

(admin branch `isAdmin()` ด้านบนยังเปลี่ยน guestStatus เป็นอะไรก็ได้)

- [ ] **Step 2: เพิ่ม match block claims (วางก่อนปิด `match /databases/...` ที่บรรทัด ~187, ใต้ questionReports)**

```
    // ── Identity claims — กันจองรหัสนักศึกษาซ้ำ (atomic) ──
    //  doc id = รหัสนักศึกษา · create-only: มีแล้วสร้างทับไม่ได้
    //  delete: admin (ตอนแก้การผูกผิด)
    match /claims/{studentId} {
      allow read:   if request.auth != null;
      allow create: if request.auth != null
                    && request.resource.data.uid == request.auth.uid
                    && !exists(/databases/$(database)/documents/claims/$(studentId));
      allow update: if false;
      allow delete: if isAdmin();
    }
```

- [ ] **Step 3: ตรวจ syntax ด้วย build rules (compile check)**

Run: `firebase deploy --only firestore:rules --dry-run 2>/dev/null || firebase firestore:rules 2>/dev/null | head -1`
Expected: ไม่มี compile error (ถ้า `--dry-run` ไม่รองรับ ให้ข้ามไป deploy จริงใน Step 4 ตอนรวม)

หมายเหตุ: deploy จริง (`firebase deploy --only firestore:rules`) ทำตอนจบ branch ทั้งหมดพร้อม push — ดู "หลัง implement เสร็จ" ท้ายไฟล์

- [ ] **Step 4: Commit**

```bash
git add firestore.rules
git commit -m "Rules: claims/{studentId} create-only + guard guestStatus (owner ตั้งได้แค่ pending)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 5: ConsentGate component

**Files:**
- Create: `src/components/onboarding/ConsentGate.vue`

**Interfaces:**
- Consumes: `auth.acceptConsent` (Task 3); `CONSENT` (Task 1); `auth.logout`
- Produces: คอมโพเนนต์ `<ConsentGate />` (ไม่มี props/emit — เขียน consent เองแล้ว gate ใน App.vue จะ re-evaluate จาก userData)

- [ ] **Step 1: สร้างคอมโพเนนต์**

```vue
<template>
  <div class="cg-ov">
    <div class="cg-box">
      <div class="cg-emoji"><Emoji :char="CONSENT.titleEmoji" /></div>
      <div class="cg-title">{{ CONSENT.title }}</div>
      <p class="cg-intro">{{ CONSENT.intro }}</p>
      <p class="cg-lead">{{ CONSENT.lead }}</p>

      <div class="cg-list">
        <div v-for="(it, i) in CONSENT.items" :key="i" class="cg-item">
          <span class="cg-ico"><Emoji :char="it.emoji" /></span>
          <div><b>{{ it.head }}</b> — {{ it.body }}</div>
        </div>
      </div>

      <label class="cg-check">
        <input v-model="agreed" type="checkbox" />
        <span>{{ CONSENT.checkboxLabel }}</span>
      </label>

      <button class="cg-btn" :disabled="!agreed || saving" @click="accept">
        {{ saving ? 'กำลังบันทึก…' : CONSENT.acceptLabel }} →
      </button>
      <button class="cg-logout" @click="auth.logout()">ออกจากระบบ</button>
    </div>
  </div>
</template>

<script setup>
import Emoji from '../shared/Emoji.vue'
import { ref } from 'vue'
import { useAuthStore } from '../../stores/auth.js'
import { CONSENT } from '../../data/consent.js'
import { useToast } from '../../composables/useToast.js'

const auth = useAuthStore()
const { toast } = useToast()
const agreed = ref(false)
const saving = ref(false)

async function accept() {
  if (!agreed.value || saving.value) return
  saving.value = true
  const ok = await auth.acceptConsent()
  saving.value = false
  if (!ok) toast('บันทึกไม่สำเร็จ ลองใหม่อีกครั้ง', 'error')
  // สำเร็จ → userData.consent อัปเดต → App.vue gate เลื่อนไป wizard เอง
}
</script>

<style scoped>
.cg-ov { position: fixed; inset: 0; z-index: 320; background: linear-gradient(160deg,#eef2ff,#fff); display: flex; align-items: center; justify-content: center; padding: 18px; overflow-y: auto; }
.cg-box { background:#fff; width:100%; max-width:420px; border:2px solid var(--ink); border-radius:20px; box-shadow:var(--pop-lg); padding:22px; max-height:92vh; overflow-y:auto; }
.cg-emoji { font-size:2.2rem; text-align:center; }
.cg-title { font-family:var(--font-display); font-weight:400; font-size:1.4rem; color:var(--ink); text-align:center; margin-top:4px; }
.cg-intro { font-size:.8rem; color:rgba(0,0,0,.6); line-height:1.6; margin:12px 0 8px; }
.cg-lead { font-size:.8rem; font-weight:700; color:var(--ink); margin:0 0 10px; }
.cg-list { display:flex; flex-direction:column; gap:10px; margin-bottom:16px; }
.cg-item { display:flex; gap:10px; align-items:flex-start; font-size:.78rem; line-height:1.5; }
.cg-ico { font-size:1.2rem; flex-shrink:0; }
.cg-item b { color:var(--ink); }
.cg-check { display:flex; gap:10px; align-items:center; font-size:.82rem; font-weight:700; color:var(--ink); cursor:pointer; margin-bottom:14px; }
.cg-check input { width:20px; height:20px; flex-shrink:0; }
.cg-btn { width:100%; border:2px solid var(--ink); border-radius:12px; padding:13px; font-family:inherit; font-size:.92rem; font-weight:800; color:#fff; background:var(--gold); box-shadow:var(--pop); cursor:pointer; transition:transform .12s,box-shadow .12s; }
.cg-btn:disabled { opacity:.5; cursor:not-allowed; }
.cg-btn:active:not(:disabled) { transform:translate(2px,2px); box-shadow:0 0 0 var(--ink); }
.cg-logout { width:100%; margin-top:10px; background:none; border:none; color:rgba(0,0,0,.45); font-size:.72rem; cursor:pointer; }
</style>
```

- [ ] **Step 2: ตรวจ build**

Run: `npm run build`
Expected: build ผ่าน

- [ ] **Step 3: Commit**

```bash
git add src/components/onboarding/ConsentGate.vue
git commit -m "Onboarding: ConsentGate component (ฟอร์มยินยอม PDPA)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 6: OnboardingWizard component

**Files:**
- Create: `src/components/onboarding/OnboardingWizard.vue`

**Interfaces:**
- Consumes: `auth.linkStudent`, `auth.registerGuest`, `auth.logout`, `auth.currentUser.email`; `validateGuest` (Task 2); `LIMITS` (text.js)
- Produces: `<OnboardingWizard />` (ไม่มี props/emit; เขียน userData → App.vue gate เลื่อนเอง)

- [ ] **Step 1: สร้างคอมโพเนนต์**

```vue
<template>
  <div class="ow-ov">
    <div class="ow-box">
      <!-- แสดงอีเมลที่กำลังใช้เสมอ -->
      <div class="ow-email">
        <Emoji char="📧" /> เข้าสู่ระบบด้วย <b>{{ auth.currentUser?.email }}</b>
        <div class="ow-email-warn">ถ้านี่ไม่ใช่อีเมลที่ต้องการ <a href="#" @click.prevent="auth.logout()">ออกแล้วเข้าใหม่</a> ด้วยอีเมลที่ถูก</div>
      </div>

      <!-- ขั้น 1: เลือกประเภท -->
      <template v-if="step === 'type'">
        <div class="ow-title">ยินดีต้อนรับ! คุณคือใคร?</div>
        <button class="ow-choice" @click="goStudent">
          <span class="ow-choice-ico"><Emoji char="🎓" /></span>
          <span><b>ฉันเป็นนักศึกษาเภสัช มธ. รุ่น 10</b><small>ผูกด้วยรหัสนักศึกษา</small></span>
        </button>
        <button class="ow-choice" @click="step = 'guest'">
          <span class="ow-choice-ico"><Emoji char="👤" /></span>
          <span><b>ฉันเป็นผู้เยี่ยมชม</b><small>กรอกชื่อเล่น รอแอดมินอนุมัติ</small></span>
        </button>
      </template>

      <!-- ขั้น 2a: นักศึกษากรอกรหัส -->
      <template v-else-if="step === 'student'">
        <button class="ow-back" @click="resetStudent">‹ กลับ</button>
        <div class="ow-title">กรอกรหัสนักศึกษา</div>
        <input v-model="sid" class="ow-input" inputmode="numeric" placeholder="รหัสนักศึกษา" @keyup.enter="checkStudent" />
        <div v-if="sErr" class="ow-err"><Emoji char="⚠️" /> {{ sErr }}</div>

        <!-- การ์ดยืนยันตัวตน -->
        <div v-if="matched" class="ow-confirm">
          <div class="ow-confirm-h">นี่คือคุณใช่ไหม?</div>
          <div class="ow-confirm-nick">{{ matched.nickname }}</div>
          <div class="ow-confirm-sub">{{ matched.realName }} · {{ trackLabel(matched.track) }}</div>
          <div class="ow-confirm-mail"><Emoji char="📧" /> {{ auth.currentUser?.email }}</div>
        </div>

        <button v-if="!matched" class="ow-btn" :disabled="busy" @click="checkStudent">
          {{ busy ? 'กำลังตรวจ…' : 'ตรวจสอบรหัส' }}
        </button>
        <button v-else class="ow-btn" :disabled="busy" @click="confirmStudent">
          {{ busy ? 'กำลังบันทึก…' : 'ใช่ ยืนยัน →' }}
        </button>
      </template>

      <!-- ขั้น 2b: guest -->
      <template v-else-if="step === 'guest'">
        <button class="ow-back" @click="step = 'type'">‹ กลับ</button>
        <div class="ow-title">สมัครเป็นผู้เยี่ยมชม</div>
        <input v-model="gNick" class="ow-input" :maxlength="LIMITS.nickname" placeholder="ชื่อเล่นที่อยากให้เรียก" />
        <textarea v-model="gReason" class="ow-input ow-ta" rows="3" :maxlength="LIMITS.guestReason" placeholder="เข้ามาด้วยเหตุผลอะไรนะ? (เช่น เพื่อนรุ่นพี่ชวนมาดู)"></textarea>
        <div v-if="gErr" class="ow-err"><Emoji char="⚠️" /> {{ gErr }}</div>
        <button class="ow-btn" :disabled="busy" @click="submitGuest">
          {{ busy ? 'กำลังส่ง…' : 'ส่งคำขอ →' }}
        </button>
      </template>
    </div>
  </div>
</template>

<script setup>
import Emoji from '../shared/Emoji.vue'
import { ref } from 'vue'
import { useAuthStore } from '../../stores/auth.js'
import { useMembersStore } from '../../stores/members.js'
import { validateGuest, matchRoster } from '../../utils/onboarding.js'
import { LIMITS } from '../../utils/text.js'
import { useToast } from '../../composables/useToast.js'

const auth = useAuthStore()
const members = useMembersStore()
const { toast } = useToast()

const step = ref('type')
const busy = ref(false)

// student
const sid = ref('')
const sErr = ref('')
const matched = ref(null)
function goStudent() { step.value = 'student'; if (!members.students.length) members.initStudents() }
function resetStudent() { step.value = 'type'; sid.value = ''; sErr.value = ''; matched.value = null }
function checkStudent() {
  sErr.value = ''
  const m = matchRoster(sid.value, members.students)
  if (!m) { sErr.value = 'ไม่พบรหัสนี้ ลองใหม่อีกครั้ง'; matched.value = null; return }
  matched.value = m
}
async function confirmStudent() {
  if (busy.value) return
  busy.value = true
  const r = await auth.linkStudent(sid.value)
  busy.value = false
  if (r.ok) return // gate เลื่อนเอง
  if (r.reason === 'notfound') sErr.value = 'ไม่พบรหัสนี้ ลองใหม่อีกครั้ง'
  else sErr.value = 'รหัสนี้ถูกใช้ไปแล้ว — ถ้าเป็นของคุณ ทักแอดมิน'
  matched.value = null
}

// guest
const gNick = ref('')
const gReason = ref('')
const gErr = ref('')
async function submitGuest() {
  gErr.value = ''
  const v = validateGuest({ nickname: gNick.value, reason: gReason.value })
  if (!v.ok) { gErr.value = v.error; return }
  busy.value = true
  const ok = await auth.registerGuest(gNick.value, gReason.value)
  busy.value = false
  if (!ok) { gErr.value = 'ส่งไม่สำเร็จ ลองใหม่อีกครั้ง'; toast('ส่งคำขอไม่สำเร็จ', 'error') }
  // สำเร็จ → guestStatus=pending → gate ไป GuestPendingScreen
}

const TRACK = { sci: 'สาย Sci', care: 'สาย Care' }
const trackLabel = (t) => TRACK[t] || 'สมาชิก'
</script>

<style scoped>
.ow-ov { position: fixed; inset: 0; z-index: 320; background: linear-gradient(160deg,#eef2ff,#fff); display:flex; align-items:center; justify-content:center; padding:18px; overflow-y:auto; }
.ow-box { background:#fff; width:100%; max-width:400px; border:2px solid var(--ink); border-radius:20px; box-shadow:var(--pop-lg); padding:22px; max-height:92vh; overflow-y:auto; }
.ow-email { font-size:.74rem; color:rgba(0,0,0,.6); background:#f1f5f9; border-radius:12px; padding:10px 12px; margin-bottom:16px; }
.ow-email b { color:var(--ink); word-break:break-all; }
.ow-email-warn { font-size:.68rem; margin-top:4px; color:rgba(0,0,0,.5); }
.ow-email-warn a { color:#b45309; }
.ow-title { font-family:var(--font-display); font-weight:400; font-size:1.3rem; color:var(--ink); margin-bottom:14px; }
.ow-choice { display:flex; gap:12px; align-items:center; width:100%; text-align:left; background:#fff; border:2px solid var(--ink); border-radius:14px; padding:14px; margin-bottom:12px; box-shadow:var(--pop); cursor:pointer; transition:transform .12s,box-shadow .12s; }
.ow-choice:active { transform:translate(2px,2px); box-shadow:0 0 0 var(--ink); }
.ow-choice-ico { font-size:1.6rem; }
.ow-choice b { display:block; font-size:.88rem; color:var(--ink); }
.ow-choice small { font-size:.68rem; color:var(--muted); }
.ow-back { background:none; border:none; color:var(--muted); font-size:.8rem; cursor:pointer; margin-bottom:8px; padding:0; }
.ow-input { width:100%; border:2px solid var(--ink); border-radius:12px; padding:12px; font-family:inherit; font-size:.9rem; margin-bottom:10px; box-sizing:border-box; }
.ow-ta { resize:vertical; }
.ow-err { font-size:.76rem; color:#dc2626; margin-bottom:10px; }
.ow-confirm { border:2px dashed var(--ink); border-radius:14px; padding:14px; text-align:center; margin-bottom:12px; background:#f8fafc; }
.ow-confirm-h { font-size:.72rem; color:var(--muted); }
.ow-confirm-nick { font-size:1.3rem; font-weight:800; color:var(--ink); margin:4px 0; }
.ow-confirm-sub { font-size:.8rem; color:rgba(0,0,0,.6); }
.ow-confirm-mail { font-size:.7rem; color:rgba(0,0,0,.5); margin-top:6px; word-break:break-all; }
.ow-btn { width:100%; border:2px solid var(--ink); border-radius:12px; padding:13px; font-family:inherit; font-size:.92rem; font-weight:800; color:#fff; background:var(--gold); box-shadow:var(--pop); cursor:pointer; transition:transform .12s,box-shadow .12s; }
.ow-btn:disabled { opacity:.5; cursor:not-allowed; }
.ow-btn:active:not(:disabled) { transform:translate(2px,2px); box-shadow:0 0 0 var(--ink); }
</style>
```

- [ ] **Step 2: ตรวจ build**

Run: `npm run build`
Expected: build ผ่าน

- [ ] **Step 3: Commit**

```bash
git add src/components/onboarding/OnboardingWizard.vue
git commit -m "Onboarding: OnboardingWizard (เลือกประเภท + ผูกรหัส นศ. + สมัคร guest)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 7: GuestPendingScreen + LoginLanding components

**Files:**
- Create: `src/components/onboarding/GuestPendingScreen.vue`
- Create: `src/components/onboarding/LoginLanding.vue`

**Interfaces:**
- Consumes: `auth.logout`, `auth.login`, `auth.userData.guestStatus`
- Produces: `<GuestPendingScreen />`, `<LoginLanding />`

- [ ] **Step 1: สร้าง GuestPendingScreen.vue**

```vue
<template>
  <div class="gp">
    <div class="gp-emoji"><Emoji :char="rejected ? '🙏' : '⏳'" /></div>
    <div class="gp-title">{{ rejected ? 'ยังเข้าไม่ได้ตอนนี้' : 'รอแอดมินอนุมัติแป๊บนะ' }}</div>
    <p class="gp-msg">
      {{ rejected
        ? 'ขออภัย คำขอเข้าชมยังไม่ได้รับอนุมัติ ถ้าคิดว่าผิดพลาด ทักแอดมินได้เลย'
        : 'คำขอเข้าชมของคุณส่งให้แอดมินแล้ว เดี๋ยวอนุมัติเสร็จจะเข้าเล่นได้เลย ลองเข้ามาใหม่อีกทีนะ' }}
    </p>
    <button class="gp-btn" @click="auth.logout()">ออกจากระบบ</button>
  </div>
</template>

<script setup>
import Emoji from '../shared/Emoji.vue'
import { computed } from 'vue'
import { useAuthStore } from '../../stores/auth.js'
const auth = useAuthStore()
const rejected = computed(() => auth.userData?.guestStatus === 'rejected')
</script>

<style scoped>
.gp { position:fixed; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; padding:28px; gap:10px; background:linear-gradient(160deg,#fef3c7,#fff); }
.gp-emoji { font-size:3rem; }
.gp-title { font-size:1.4rem; font-weight:800; color:#92400e; }
.gp-msg { font-size:.86rem; color:rgba(0,0,0,.6); max-width:320px; line-height:1.6; }
.gp-btn { margin-top:12px; border:2px solid var(--ink); border-radius:12px; padding:11px 22px; font-family:inherit; font-size:.88rem; font-weight:800; background:#fff; box-shadow:var(--pop); cursor:pointer; }
.gp-btn:active { transform:translate(2px,2px); box-shadow:0 0 0 var(--ink); }
</style>
```

- [ ] **Step 2: สร้าง LoginLanding.vue**

```vue
<template>
  <div class="ll">
    <div class="ll-badge"><Emoji char="🧪" /></div>
    <div class="ll-title">RxTU10</div>
    <div class="ll-sub">เภสัช มธ. รุ่น 10</div>
    <p class="ll-msg">พื้นที่เล็กๆ ของพวกเรา — สะสม เล่น และเตรียมสอบใบประกอบฯ (CC) ไปด้วยกัน</p>
    <button class="ll-btn" @click="auth.login()"><Emoji char="🔑" /> เข้าสู่ระบบด้วย Google</button>
  </div>
</template>

<script setup>
import Emoji from '../shared/Emoji.vue'
import { useAuthStore } from '../../stores/auth.js'
const auth = useAuthStore()
</script>

<style scoped>
.ll { position:fixed; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; padding:28px; gap:8px; background:linear-gradient(160deg,#eef2ff,#fff); }
.ll-badge { width:64px; height:64px; display:flex; align-items:center; justify-content:center; font-size:2rem; border-radius:18px; background:var(--gold); border:2px solid var(--ink); box-shadow:var(--pop); transform:rotate(-6deg); margin-bottom:8px; }
.ll-title { font-family:var(--font-display); font-weight:400; font-size:2.2rem; color:var(--ink); line-height:1; }
.ll-sub { font-size:.8rem; color:var(--muted); font-weight:700; }
.ll-msg { font-size:.84rem; color:rgba(0,0,0,.6); max-width:300px; line-height:1.6; margin:12px 0 18px; }
.ll-btn { border:2px solid var(--ink); border-radius:12px; padding:13px 24px; font-family:inherit; font-size:.92rem; font-weight:800; color:#fff; background:var(--accent,#4f46e5); box-shadow:var(--pop); cursor:pointer; transition:transform .12s,box-shadow .12s; }
.ll-btn:active { transform:translate(2px,2px); box-shadow:0 0 0 var(--ink); }
</style>
```

- [ ] **Step 3: ตรวจ build**

Run: `npm run build`
Expected: build ผ่าน

- [ ] **Step 4: Commit**

```bash
git add src/components/onboarding/GuestPendingScreen.vue src/components/onboarding/LoginLanding.vue
git commit -m "Onboarding: GuestPendingScreen + LoginLanding (จอรออนุมัติ + จอ login)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 8: App.vue gate integration

**Files:**
- Modify: `src/App.vue`

**Interfaces:**
- Consumes: `onboardingGate` (Task 2); `CONSENT_VERSION` (Task 1); all 4 onboarding components (Tasks 5-7); `auth`, `maintenance`, `configLoaded`
- Produces: gate flow ที่แสดงหน้าจอถูกตัวตามสถานะผู้ใช้

- [ ] **Step 1: เพิ่ม import + computed gate**

ใน `src/App.vue` `<script setup>` เพิ่ม import:

```js
import ConsentGate       from './components/onboarding/ConsentGate.vue'
import OnboardingWizard  from './components/onboarding/OnboardingWizard.vue'
import GuestPendingScreen from './components/onboarding/GuestPendingScreen.vue'
import LoginLanding      from './components/onboarding/LoginLanding.vue'
import { onboardingGate } from './utils/onboarding.js'
import { CONSENT_VERSION } from './firebase/config.js'
import { computed } from 'vue'
```

(ถ้า `computed` import อยู่แล้ว ไม่ต้องเพิ่มซ้ำ)

เพิ่ม computed:

```js
const gate = computed(() =>
  authStore.isLoggedIn ? onboardingGate(authStore.userData, CONSENT_VERSION) : 'login')
```

- [ ] **Step 2: แก้ template gate ordering**

แทนที่บล็อก gate เดิม (บรรทัด ~5-29: loading / launch gate / MaintenanceScreen) ด้วย:

```vue
    <div v-if="authStore.loading || !configLoaded" class="loading-screen">กำลังโหลด...</div>

    <!-- ยังไม่ login → จอ login (ไม่ใช่จอปรับปรุง) -->
    <LoginLanding v-else-if="!authStore.isLoggedIn" />

    <!-- ด่าน onboarding ตามลำดับ -->
    <ConsentGate        v-else-if="gate === 'consent'" />
    <OnboardingWizard   v-else-if="gate === 'wizard'" />
    <GuestPendingScreen v-else-if="gate === 'guest-pending'" />

    <!-- ผ่าน onboarding แล้ว → launch gate เดิม -->
    <template v-else-if="authStore.isAcademic || !maintenance">
      <main id="main-content"><ErrorBoundary><RouterView /></ErrorBoundary></main>
      <!-- ⚠️ คงเนื้อหาเดิมทั้งหมดในบล็อกนี้ไว้: bottom-nav, HelpModal, MigrationWelcome ฯลฯ -->
    </template>

    <MaintenanceScreen v-else />
```

หมายเหตุสำคัญ: เก็บเนื้อหาภายใน `<template v-else-if="authStore.isAcademic || !maintenance">` เดิมไว้ครบ (bottom-nav, HelpModal, MigrationWelcome, AchievementBalloon ฯลฯ ที่อยู่บรรทัด 13-27 เดิม) — เปลี่ยนแค่เงื่อนไข `v-else-if` ให้มาต่อจาก gate ใหม่

- [ ] **Step 3: ตรวจ build**

Run: `npm run build`
Expected: build ผ่าน

- [ ] **Step 4: ตรวจด้วยตา — เปิด dev server เช็ก gate**

Run: `npm run dev` แล้วเปิดเบราว์เซอร์
Expected: logged-out เห็น **LoginLanding** (ไม่ใช่ "เว็บกำลังปรับปรุง")

- [ ] **Step 5: Commit**

```bash
git add src/App.vue
git commit -m "App: gate flow onboarding (login→consent→wizard→guest-pending→แอป)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 9: Members store — แยก guest ด้วย accountType + light fields

**Files:**
- Modify: `src/stores/members.js:67-93`
- Modify: `src/utils/membersCache.js` (ฟังก์ชัน `slimForCache` — เพิ่ม field ใหม่ใน subset)

**Interfaces:**
- Consumes: `accountType`, `guestStatus`, `guestReason` (Task 1 schema)
- Produces: `members.guestUsers` แต่ละตัวมี `accountType, guestStatus, guestReason, email` เพิ่ม; เงื่อนไขแยก guest = `accountType === 'guest'`

- [ ] **Step 1: เพิ่ม field ใน light subset + เปลี่ยนเงื่อนไขแยก guest**

ใน `src/stores/members.js` ใน `loadFbUsers` object `light` (บรรทัด 67-90) เพิ่ม 3 field:

```js
                    accountType: n.accountType,
                    guestStatus: n.guestStatus,
                    guestReason: n.guestReason,
```

และแก้เงื่อนไขแยก guest (บรรทัด 91-92) จาก:

```js
                if (n.track === 'guest') guests.push(light)
                else if (n.studentId) newFb[n.studentId] = light
```

เป็น:

```js
                if (n.accountType === 'guest' || n.track === 'guest') guests.push(light)
                else if (n.studentId) newFb[n.studentId] = light
```

- [ ] **Step 2: เพิ่ม field ใน slimForCache**

เปิด `src/utils/membersCache.js` หา `slimForCache` — ถ้ามันคัดเฉพาะ key (allowlist) ให้เพิ่ม `accountType, guestStatus, guestReason` เข้า allowlist ของ guest entries. ถ้ามันเก็บทั้ง object อยู่แล้ว ไม่ต้องแก้ (ตรวจไฟล์ก่อน)

(ดูเนื้อ `slimForCache` จริงก่อน แล้วเพิ่ม 3 key นี้ในจุดที่ map guest/fbUser ให้บางลง)

- [ ] **Step 3: รันเทส membersCache**

Run: `node --test src/utils/membersCache.test.js`
Expected: PASS (ถ้าเทสเช็ก field ที่หายไป ให้อัปเดตเทสให้ครอบ field ใหม่ตามจริง)

- [ ] **Step 4: ตรวจ build**

Run: `npm run build`
Expected: build ผ่าน

- [ ] **Step 5: Commit**

```bash
git add src/stores/members.js src/utils/membersCache.js src/utils/membersCache.test.js
git commit -m "Members: แยก guest ด้วย accountType + พก guestStatus/reason/email ใน light subset

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 10: MembersView — ปุ่ม toggle ดู guest แยก

**Files:**
- Modify: `src/views/MembersView.vue:76-89` (roster computed), เพิ่ม UI toggle ใน template
- Modify: `src/components/members/ProfileModal.vue` (label "ผู้เยี่ยมชม")

**Interfaces:**
- Consumes: `members.guestUsers` (Task 9) มี `guestStatus`
- Produces: list หลัก = นักศึกษา; ปุ่ม "ผู้เยี่ยมชม (N)" สลับดู guest ที่ approved

- [ ] **Step 1: ตัด guest ออกจาก roster + เพิ่ม approvedGuests + state toggle**

ใน `src/views/MembersView.vue` `<script setup>` แก้ `roster` computed (บรรทัด 76-89) ตัด 2 บรรทัด guest ออก:

```js
const roster = computed(() => {
  const fb = members.fbUsers || {}
  return (members.students || []).map(s => {
    const u = fb[s.id]
    if (u) return { ...u, registered: true }
    return {
      uid: 'static_' + s.id, studentId: s.id,
      nickname: s.nickname, realName: s.realName, track: s.track,
      residence: { level: 1 }, likes: 0, pets: [], registered: false,
    }
  })
})

// guest ที่อนุมัติแล้วเท่านั้น (pending/rejected ไม่โชว์ให้สมาชิก)
const approvedGuests = computed(() =>
  (members.guestUsers || []).filter(g => g.guestStatus === 'approved').map(g => ({ ...g, registered: true })))

const showGuests = ref(false)
```

- [ ] **Step 2: ให้ list สลับตาม showGuests**

แก้ `list` computed (บรรทัด 99-105) ให้เลือกฐานข้อมูลตาม showGuests:

```js
const list = computed(() => {
  const q = search.value.trim().toLowerCase()
  let r = showGuests.value ? approvedGuests.value : roster.value
  if (!showGuests.value && track.value !== 'all') r = r.filter(m => m.track === track.value)
  if (q) r = r.filter(m => [m.nickname, m.realName, m.studentId].some(v => (v || '').toLowerCase().includes(q)))
  return sortMembers(r, sortKey.value, myUid.value)
})
```

- [ ] **Step 3: เพิ่มปุ่ม toggle ใน template (ใต้แถว filter บรรทัด ~17)**

```vue
    <button
      v-if="approvedGuests.length"
      class="mv-guest-toggle" :class="{ on: showGuests }"
      @click="showGuests = !showGuests"
    >
      <Emoji char="👤" /> {{ showGuests ? '← กลับไปดูนักศึกษา' : `ผู้เยี่ยมชม (${approvedGuests.length})` }}
    </button>
```

เพิ่ม style (ใน `<style scoped>`):

```css
.mv-guest-toggle { width:100%; margin:0 0 12px; border:2px solid var(--ink); border-radius:12px; padding:9px; background:#fff; font-family:inherit; font-size:.82rem; font-weight:700; color:var(--ink); box-shadow:var(--pop); cursor:pointer; }
.mv-guest-toggle.on { background:#eef2ff; }
.mv-guest-toggle:active { transform:translate(2px,2px); box-shadow:0 0 0 var(--ink); }
```

- [ ] **Step 4: ProfileModal label guest**

ใน `src/components/members/ProfileModal.vue` หาส่วนที่แสดง track/สาย แล้วเพิ่มเงื่อนไข: ถ้า `member.accountType === 'guest'` (หรือ `member.track === 'guest'`) ให้แสดง "ผู้เยี่ยมชม" แทนสาย sci/care. (จุดแก้ขึ้นกับโครงสร้างไฟล์จริง — ใช้ข้อความ `ผู้เยี่ยมชม`)

- [ ] **Step 5: ตรวจ build + รันเทส sortMembers**

Run: `npm run build && node --test src/utils/sortMembers.test.js`
Expected: build ผ่าน + เทส PASS

- [ ] **Step 6: Commit**

```bash
git add src/views/MembersView.vue src/components/members/ProfileModal.vue
git commit -m "Members: แยก list นักศึกษา/guest ด้วยปุ่ม toggle (โชว์เฉพาะ guest approved)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 11: AdminView — อนุมัติ guest + อีเมล/แก้การผูก

**Files:**
- Modify: `src/views/AdminView.vue`

**Interfaces:**
- Consumes: `members.guestUsers` (Task 9, มี guestStatus/guestReason/email); `members.loadFbUsers`
- Produces: การ์ด "คำขอ guest" (approve/reject) + อีเมลในแถว role + ปุ่มแก้การผูก

- [ ] **Step 1: เพิ่ม computed pendingGuests + actions (ใน `<script setup>`)**

```js
import { useConfirm } from '../composables/useConfirm.js'   // ถ้ายังไม่ได้ import
const { confirm } = useConfirm()
import { deleteDoc } from 'firebase/firestore'  // ถ้ายังไม่อยู่ใน import (บรรทัด 236 มี deleteDoc แล้ว — ข้าม)

const pendingGuests = computed(() =>
  (members.guestUsers || []).filter(g => g.guestStatus === 'pending'))

async function setGuestStatus(g, status) {
  try {
    await updateDoc(doc(db, 'users', g.uid), { guestStatus: status })
    g.guestStatus = status
    toast(status === 'approved' ? `อนุมัติ ${g.nickname} แล้ว` : `ปฏิเสธ ${g.nickname} แล้ว`, 'success')
  } catch (e) { console.error('[guest status]', e); toast('อัปเดตไม่สำเร็จ', 'error') }
}

// แก้การผูกผิด: ลบ claim + ล้าง identity → ผู้ใช้ผูกใหม่ตอน login ครั้งหน้า
async function resetLink(m) {
  if (!(await confirm(`ล้างการผูกตัวตนของ ${m.nickname}? เขาจะต้องผูกรหัสใหม่ตอนเข้าครั้งหน้า`))) return
  try {
    if (m.studentId) await deleteDoc(doc(db, 'claims', m.studentId))
    await updateDoc(doc(db, 'users', m.uid), {
      studentId: null, nickname: null, realName: null, track: null,
      accountType: null, onboarded: false,
    })
    toast(`ล้างการผูกของ ${m.nickname || m.email} แล้ว`, 'success')
    reload()
  } catch (e) { console.error('[resetLink]', e); toast('ล้างไม่สำเร็จ', 'error') }
}
```

(ตรวจว่า `computed`, `updateDoc`, `doc`, `db`, `toast`, `members`, `reload` import/นิยามแล้ว — ส่วนใหญ่มีอยู่; เพิ่มเฉพาะที่ขาด)

- [ ] **Step 2: เพิ่มการ์ดอนุมัติ guest ใน template (วางก่อนการ์ด role 🎓 ที่บรรทัด ~60)**

```vue
      <!-- ───── คำขอ guest (รออนุมัติ) ───── -->
      <section v-if="pendingGuests.length" class="admin-card">
        <div class="admin-card-head"><span><Emoji char="📨" /> คำขอเข้าชม (รออนุมัติ)</span></div>
        <ul class="role-list">
          <li v-for="g in pendingGuests" :key="g.uid" class="role-row">
            <div class="role-top">
              <div class="role-info">
                <div class="role-name">{{ g.nickname }}</div>
                <div class="role-sub">{{ g.email }}</div>
                <div class="gq-reason">{{ g.guestReason }}</div>
              </div>
              <div class="role-actions">
                <button class="btn-mini btn-gold" @click="setGuestStatus(g, 'approved')">✓ อนุมัติ</button>
                <button class="btn-mini btn-gray" @click="setGuestStatus(g, 'rejected')">✗ ปฏิเสธ</button>
              </div>
            </div>
          </li>
        </ul>
      </section>
```

เพิ่ม style: `.gq-reason { font-size:.72rem; color:rgba(0,0,0,.55); margin-top:4px; }`

- [ ] **Step 3: เพิ่มอีเมล + ปุ่มแก้การผูก ในแถว role เดิม**

ใน `<li>` ของ role-list (บรรทัด ~83-118) แก้ `role-sub` ให้โชว์อีเมลเสมอ + เพิ่มปุ่ม 🔧:

แก้บรรทัด 90 จาก `<div class="role-sub">{{ m.studentId || m.email || m.uid.slice(0, 8) }}</div>` เป็น:

```vue
                <div class="role-sub">{{ m.studentId || '—' }} · {{ m.email || m.uid.slice(0, 8) }}</div>
```

ใน `.role-actions` (บรรทัด 93-107) เพิ่มปุ่มก่อนปุ่ม tag:

```vue
                <button v-if="m.studentId" class="btn-mini btn-gray" title="แก้การผูกตัวตน" @click="resetLink(m)"><Emoji char="🔧" /></button>
```

- [ ] **Step 4: ตรวจ build**

Run: `npm run build`
Expected: build ผ่าน

- [ ] **Step 5: Commit**

```bash
git add src/views/AdminView.vue
git commit -m "Admin: การ์ดอนุมัติ guest + โชว์อีเมล + ปุ่มแก้การผูกตัวตน (ลบ claim+ล้าง identity)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## หลัง implement เสร็จ (ทำครั้งเดียว ตอนจบ branch)

- [ ] รันเทส pure util ทั้งหมด: `node --test src/utils/onboarding.test.js src/utils/membersCache.test.js src/utils/sortMembers.test.js` → PASS หมด
- [ ] `npm run build` ผ่าน
- [ ] `firebase deploy --only firestore:rules` (claims + guestStatus guard — ไม่ deploy = ผูกรหัสจะ permission-denied)
- [ ] push master (frontend auto-deploy ผ่าน GitHub Actions)
- [ ] ทดสอบ manual บน prod (มือถือ): บัญชีใหม่ student (เจอ/ไม่เจอ/รหัสซ้ำ), guest (สมัคร→รอ→admin อนุมัติ→เข้าได้), บัญชีเก่า (ข้าม wizard แต่เจอ consent ครั้งเดียว), MembersView ปุ่ม guest, Admin แก้การผูก

---

## Self-Review (ผู้เขียน plan ตรวจเองแล้ว)

**Spec coverage:** consent (T1,T5) · onboarded/accountType/guestStatus schema (T1) · claims + uniqueness (T3,T4) · gate ordering + LoginLanding (T2,T8) · wizard student/guest + แสดงอีเมล (T6) · guest pending (T7) · rules (T4) · admin approve + email + fix-link (T11) · members store accountType (T9) · MembersView guest toggle + ProfileModal label (T10) · migration คนเก่า effective onboarded (T2 onboardingGate) · consent text (T1). ครบทุก section ของ spec ✅

**Placeholder scan:** ไม่มี TBD/TODO; ทุก step ที่แก้โค้ดมีโค้ดจริง · จุดที่ระบุ "ตรวจไฟล์จริงก่อน" (slimForCache T9-S2, ProfileModal T10-S4) เป็นการปรับตามโครงสร้างที่ต่างกันได้ ไม่ใช่ placeholder ของ logic

**Type consistency:** `onboardingGate(userData, version)` คืน `'consent'|'wizard'|'guest-pending'|'ok'` ใช้ตรงกันใน App.vue (T8) · `linkStudent` คืน `{ok, reason}` ใช้ตรงใน wizard (T6) · `matchRoster(id, students)` ใช้ทั้ง util/auth/wizard ตรงกัน · field schema (consent/onboarded/accountType/guestStatus/guestReason) ตรงกันทุก task ✅
