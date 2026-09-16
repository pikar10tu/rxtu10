# ทางเข้าอาจารย์แบบไว (self-declare + auto-approve guest) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** ให้คนที่กดปุ่ม "ฉันเป็นอาจารย์" ตอนสมัครเข้าเล่นแอปได้ทันที (เหมือน guest ที่ admin อนุมัติแล้ว) โดยไม่ต้องรอคิว พร้อมประกาศในกระดานข่าวให้เพื่อนรู้ ส่วนสิทธิ์แก้ไขคลังข้อสอบ (`role:'instructor'`) ยังต้องให้ admin กดตั้งเองเหมือนเดิม

**Architecture:** เพิ่ม field บูลีน `instructorClaim` + reuse field `realName` เดิมบน user doc + ทางสมัครใหม่ที่ auto-set `guestStatus:'approved'` (ผ่อน rules เฉพาะเงื่อนไขแคบ) + ยิงข่าวชนิดใหม่ `'instructor'` เข้ากระดานข่าวที่มีอยู่แล้ว — ไม่แตะ permission model เดิมของ SP1 (role/`isQuestionEditor`) เลยสักจุด

**Tech Stack:** Vue 3 (Composition API, `<script setup>`) · Pinia · Firebase Firestore + firestore.rules · `node --test` สำหรับ pure utils

## Global Constraints

- **`role` ห้ามถูกแก้โดยเจ้าของ doc เองทางไหนก็ตาม** — ทุก task ต้องไม่แตะเงื่อนไข self-promote เดิมใน `firestore.rules`
- **guestStatus auto-approve ใช้ได้เฉพาะตอนสมัครครั้งแรกจริงๆ** (`guestStatus` เดิมก่อนเขียนต้องเป็น `null`) — กันคนที่เคยถูกปฏิเสธ/อยู่คิว pending มาลัดคิว
- **การยิงข่าวเป็น best-effort เสมอ** — ล้มเหลว (เช่น rules ยังไม่ deploy) ต้อง**ไม่บล็อก**การสมัคร/เข้าแอป (ดู `useNewsPost.js` ที่ออกแบบไว้แบบนี้อยู่แล้ว: ล้มเหลว = เงียบ ไม่ toast ไม่ retry)
- ข้อความ/ปุ่มในแอปเป็นภาษาไทย โทนเป็นกันเอง ตาม `docs/voice-guide.md`
- ห้าม `font-size` ต่ำกว่า `.7rem` ในไฟล์ `.vue`/`.css` ใดๆ (ดู CLAUDE.md ข้อ 6 ของโปรเจกต์)
- ไม่มี test runner กลาง — ตรวจ `.vue`/store ด้วย `npm run build`; ตรวจ pure utils ด้วย `node --test <file>`
- แก้ `firestore.rules` แล้ว **ต้อง** `firebase deploy --only firestore:rules` ถึงมีผลจริง (Pages/GitHub Actions ไม่แตะ rules) — รอบนี้แก้ไฟล์เดียวกัน **2 จุด** (guestStatus branch ใน Task 2 + news type whitelist ใน Task 4) แต่ละ task deploy ของตัวเองได้ ไม่ต้องรอรวมกัน

---

## Task 1: เพิ่ม field `instructorClaim` ใน user schema

**Files:**
- Modify: `src/data/userSchema.js:85` (ต่อจาก `guestStatus`)
- Test: `src/data/userSchema.test.js`

**Interfaces:**
- Produces: `USER_DEFAULTS.instructorClaim` (boolean, default `false`) — `normalizeUserData()` เติม default นี้ให้ doc เก่าที่ไม่มี field นี้อัตโนมัติ (generic top-level boolean merge ที่มีอยู่แล้ว เหมือน `welcomeGiftV1`/`welcomeBoxSeen`)

- [ ] **Step 1: เขียนเทสที่ยังไม่ผ่าน**

เปิด `src/data/userSchema.test.js` แล้วเพิ่มท้ายไฟล์:

```js
test('USER_DEFAULTS.instructorClaim = false', () => {
  assert.equal(USER_DEFAULTS.instructorClaim, false)
})

test('normalizeUserData เติม instructorClaim ให้ doc เก่าที่ยังไม่มี field นี้', () => {
  const d = normalizeUserData({ coins: 5 })
  assert.equal(d.instructorClaim, false)
})

test('normalizeUserData คงค่า instructorClaim เดิมถ้ามี', () => {
  const d = normalizeUserData({ instructorClaim: true })
  assert.equal(d.instructorClaim, true)
})
```

- [ ] **Step 2: รันเทส ยืนยันว่า fail**

Run: `node --test src/data/userSchema.test.js`
Expected: FAIL — `USER_DEFAULTS.instructorClaim` เป็น `undefined` ไม่ใช่ `false`

- [ ] **Step 3: เพิ่ม field ใน USER_DEFAULTS**

แก้ `src/data/userSchema.js` บรรทัดที่มี `guestStatus: null,` (บรรทัด ~85) ให้กลายเป็น:

```js
  guestStatus: null,       // null | 'pending' | 'approved' | 'rejected'
  instructorClaim: false,  // ประกาศตัวเป็นอาจารย์ตอนสมัคร (guestStatus auto-approve ทันที)
                            // — ป้ายช่วยแอดมิน "หา" คนเท่านั้น ไม่ใช่ permission gate (role ต่างหาก)
}
```

- [ ] **Step 4: รันเทส ยืนยันว่าผ่าน**

Run: `node --test src/data/userSchema.test.js`
Expected: PASS ทั้งหมด (รวมเทสเดิมที่มีอยู่แล้วในไฟล์)

- [ ] **Step 5: Commit**

```bash
git add src/data/userSchema.js src/data/userSchema.test.js
git commit -m "Schema: เพิ่ม instructorClaim field (เตรียมทางเข้าอาจารย์แบบไว)"
```

---

## Task 2: ผ่อน firestore.rules ให้ self-declare instructor auto-approve ได้

**Files:**
- Modify: `firestore.rules` (บล็อก `match /users/{userId}` → `allow update`, บรรทัด ~70-76)

**Interfaces:**
- Consumes: field `instructorClaim` จาก Task 1
- Produces: เงื่อนไข rules ใหม่ที่ Task 5 (`registerInstructor` ใน auth store) ต้องเขียนผ่าน

- [ ] **Step 1: อ่านเงื่อนไขเดิมให้แม่นก่อนแก้**

เปิด `firestore.rules` หาบล็อกนี้ (อยู่ใน `allow update:` ของ `match /users/{userId}`, มีคอมเมนต์ "owner ตั้ง guestStatus ได้แค่ 'pending'"):

```
          // owner ตั้ง guestStatus ได้แค่ 'pending' (สมัคร) — approve/reject = admin เท่านั้น
          && (
            request.resource.data.get('guestStatus', null) == resource.data.get('guestStatus', null)
            || request.resource.data.get('guestStatus', null) == 'pending'
          )
        )
        || isAdmin()
      );
```

- [ ] **Step 2: แทนที่ด้วยเงื่อนไข 3 ทาง**

```
          // owner ตั้ง guestStatus ได้แค่ 'pending' (สมัคร guest ปกติ) — approve/reject = admin เท่านั้น
          // ข้อยกเว้น: self-declare "อาจารย์" (instructorClaim:true) auto-approve ได้ทันที
          //   แต่แค่ครั้งแรกที่สมัครจริงๆ เท่านั้น (guestStatus เดิมต้องเป็น null) — กันคนโดน
          //   ปฏิเสธ/อยู่คิว pending ปกติมาลัดคิวทีหลัง · role ไม่อยู่ในเงื่อนไขนี้เลย (ยังกันอยู่ด้านบน)
          && (
            request.resource.data.get('guestStatus', null) == resource.data.get('guestStatus', null)
            || request.resource.data.get('guestStatus', null) == 'pending'
            || (
              request.resource.data.get('guestStatus', null) == 'approved'
              && request.resource.data.get('instructorClaim', false) == true
              && resource.data.get('guestStatus', null) == null
            )
          )
        )
        || isAdmin()
      );
```

- [ ] **Step 3: ตรวจ rules คอมไพล์ผ่าน**

Run: `firebase deploy --only firestore:rules`
Expected: เห็นบรรทัด `rules file firestore.rules compiled successfully` ตามด้วย `Deploy complete!`
(ถ้าเห็น "already up to date, skipping upload" แปลว่ายังไม่ได้เซฟไฟล์ — เช็คว่าบันทึกแล้วจริงก่อนรันซ้ำ)

- [ ] **Step 4: Commit**

```bash
git add firestore.rules
git commit -m "Rules: ผ่อน guestStatus auto-approve เฉพาะ self-declare อาจารย์ครั้งแรก"
```

---

## Task 3: LIMITS.realName + validator `validateInstructor`

**Files:**
- Modify: `src/utils/text.js` (เพิ่ม `LIMITS.realName`)
- Modify: `src/utils/onboarding.js` (เพิ่ม `validateInstructor`)
- Test: `src/utils/onboarding.test.js`

**Interfaces:**
- Produces: `LIMITS.realName = 60` · `validateInstructor({ nickname, realName, reason }): { ok: boolean, error: string|null }` — Task 6 (OnboardingWizard) เรียกใช้ทั้งสองตัวนี้เพื่อ validate ฟอร์มก่อนเรียก store action

- [ ] **Step 1: เขียนเทสที่ยังไม่ผ่านสำหรับ `validateInstructor`**

เปิด `src/utils/onboarding.test.js` เพิ่ม import `validateInstructor` เข้า import line เดิม (บรรทัด 3):

```js
import { needsConsent, matchRoster, validateGuest, validateInstructor, onboardingGate } from './onboarding.js'
```

เพิ่มท้ายไฟล์:

```js
test('validateInstructor: ครบ 3 ช่อง → ok', () => {
  assert.deepEqual(
    validateInstructor({ nickname: 'หมอดี', realName: 'อ.สมชาย ใจดี', reason: 'สอนวิชา Pharmacotherapy' }),
    { ok: true, error: null }
  )
})
test('validateInstructor: ชื่อเล่นว่าง → error', () => {
  assert.equal(validateInstructor({ nickname: '  ', realName: 'x', reason: 'y' }).ok, false)
})
test('validateInstructor: ชื่อ-นามสกุลว่าง → error', () => {
  assert.equal(validateInstructor({ nickname: 'x', realName: '  ', reason: 'y' }).ok, false)
})
test('validateInstructor: เหตุผลว่าง → error', () => {
  assert.equal(validateInstructor({ nickname: 'x', realName: 'y', reason: '' }).ok, false)
})
```

- [ ] **Step 2: รันเทส ยืนยันว่า fail**

Run: `node --test src/utils/onboarding.test.js`
Expected: FAIL — `validateInstructor is not a function` (ยังไม่ได้ export)

- [ ] **Step 3: เพิ่ม `LIMITS.realName` ใน text.js**

เปิด `src/utils/text.js` หา `LIMITS` object (บรรทัด ~35-51) เพิ่มบรรทัดใหม่ต่อจาก `nickname: 30,`:

```js
export const LIMITS = {
  contact: 40,
  nickname: 30,
  realName: 60,
  guestReason: 200,
  ...
```

- [ ] **Step 4: เพิ่ม `validateInstructor` ใน onboarding.js**

เปิด `src/utils/onboarding.js` หาฟังก์ชัน `validateGuest` (บรรทัด ~18-22):

```js
// ตรวจ input ฟอร์ม guest
export function validateGuest({ nickname, reason } = {}) {
  if (!String(nickname ?? '').trim()) return { ok: false, error: 'กรุณากรอกชื่อเล่น' }
  if (!String(reason ?? '').trim()) return { ok: false, error: 'กรุณากรอกเหตุผลที่เข้าชม' }
  return { ok: true, error: null }
}
```

เพิ่มต่อท้าย:

```js

// ตรวจ input ฟอร์มอาจารย์ (เพิ่มช่องชื่อ-นามสกุลจริง จาก validateGuest)
export function validateInstructor({ nickname, realName, reason } = {}) {
  if (!String(nickname ?? '').trim()) return { ok: false, error: 'กรุณากรอกชื่อเล่น' }
  if (!String(realName ?? '').trim()) return { ok: false, error: 'กรุณากรอกชื่อ-นามสกุล' }
  if (!String(reason ?? '').trim()) return { ok: false, error: 'กรุณากรอกวิชาที่สอน/เหตุผลที่มาช่วย' }
  return { ok: true, error: null }
}
```

- [ ] **Step 5: รันเทส ยืนยันว่าผ่าน**

Run: `node --test src/utils/onboarding.test.js`
Expected: PASS ทั้งหมด (รวมเทสเดิม)

- [ ] **Step 6: Commit**

```bash
git add src/utils/text.js src/utils/onboarding.js src/utils/onboarding.test.js
git commit -m "Onboarding: เพิ่ม validateInstructor + LIMITS.realName (ฟอร์มอาจารย์ 3 ช่อง)"
```

---

## Task 4: เปิดชนิดข่าว `'instructor'` (useNewsPost + rules)

**Files:**
- Modify: `src/composables/useNewsPost.js:11`
- Modify: `firestore.rules` (บล็อก `match /news/{newsId}`, บรรทัด ~197)

**Interfaces:**
- Produces: ชนิดข่าว `'instructor'` ที่ทั้ง client (`NEWS_TYPES`) และ rules ยอมรับตรงกัน — Task 6 (OnboardingWizard) เรียก `postNews({ type: 'instructor', ... })` ผ่านได้

- [ ] **Step 1: เพิ่ม `'instructor'` เข้า `NEWS_TYPES`**

เปิด `src/composables/useNewsPost.js` แก้บรรทัด ~11:

```js
export const NEWS_TYPES = ['achievement', 'legendary', 'tower100', 'record1']
```

เป็น:

```js
export const NEWS_TYPES = ['achievement', 'legendary', 'tower100', 'record1', 'instructor']
```

- [ ] **Step 2: เพิ่ม `'instructor'` เข้า whitelist ของ rules**

เปิด `firestore.rules` หาบล็อก `match /news/{newsId}` (บรรทัด ~193-205) แก้บรรทัด:

```
            && request.resource.data.type in ['achievement','legendary','tower100','record1']
```

เป็น:

```
            && request.resource.data.type in ['achievement','legendary','tower100','record1','instructor']
```

- [ ] **Step 3: Deploy rules**

Run: `firebase deploy --only firestore:rules`
Expected: `Deploy complete!`

- [ ] **Step 4: Build**

Run: `npm run build`
Expected: build ผ่าน

- [ ] **Step 5: Commit**

```bash
git add src/composables/useNewsPost.js firestore.rules
git commit -m "News: เปิดชนิดข่าว 'instructor' (ประกาศอาจารย์มาเยือน)"
```

---

## Task 5: เพิ่ม action `registerInstructor` ใน auth store

**Files:**
- Modify: `src/stores/auth.js` (เพิ่มฟังก์ชันคู่ขนาน `registerGuest` ที่บรรทัด ~278, และ export ที่บรรทัด ~329)

**Interfaces:**
- Consumes: `cleanText`, `LIMITS` (import อยู่แล้วในไฟล์นี้) · `LIMITS.realName` จาก Task 3 · `patchUser(optimistic, server)` (มีอยู่แล้ว) · rules จาก Task 2
- Produces: `auth.registerInstructor(nickname: string, realName: string, reason: string): Promise<boolean>` — คืน `true` ถ้าเขียนสำเร็จ, `false` ถ้า validate ไม่ผ่าน (ช่องใดช่องหนึ่งว่าง) — Task 6 (OnboardingWizard) เรียกใช้ฟังก์ชันนี้

- [ ] **Step 1: เพิ่มฟังก์ชันต่อจาก `registerGuest`**

เปิด `src/stores/auth.js` หาฟังก์ชัน `registerGuest` (บรรทัด ~269-278):

```js
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

เพิ่มต่อท้าย (บรรทัดถัดไป):

```js

    // สมัคร "ฉันเป็นอาจารย์" → auto-approve ทันที (เข้าเล่นแอปได้เลยเหมือน guest ที่ approved แล้ว)
    // role ยังเป็น 'student' เหมือนเดิม — instructorClaim แค่ติดป้ายให้ admin เห็นคิว แล้วไปกด
    // "ตั้งเป็นอาจารย์" เอง (ดู AdminView) rules คุมไว้แล้วว่า auto-approve ได้แค่ครั้งแรกที่สมัครจริงๆ
    async function registerInstructor(nickname, realName, reason) {
        const nick = cleanText(nickname, LIMITS.nickname)
        const name = cleanText(realName, LIMITS.realName)
        const why  = cleanText(reason, LIMITS.guestReason)
        if (!nick || !name || !why) return false
        const patch = {
            nickname: nick, realName: name, guestReason: why,
            accountType: 'guest', guestStatus: 'approved', instructorClaim: true,
            onboarded: true,
        }
        return patchUser(patch, patch)
    }
```

- [ ] **Step 2: Export ฟังก์ชันใหม่**

แก้บรรทัด `return { ... }` ท้ายไฟล์ (บรรทัด ~329):

```js
        acceptConsent, linkStudent, registerGuest,
```

เป็น:

```js
        acceptConsent, linkStudent, registerGuest, registerInstructor,
```

- [ ] **Step 3: Build ตรวจ syntax**

Run: `npm run build`
Expected: build ผ่านไม่มี error (ยังไม่มีอะไรเรียก `registerInstructor` จริง แต่ต้องไม่มี syntax error)

- [ ] **Step 4: Commit**

```bash
git add src/stores/auth.js
git commit -m "Auth: เพิ่ม registerInstructor (สมัครอาจารย์แบบ auto-approve)"
```

---

## Task 6: หน้าสมัคร — ปุ่ม "ฉันเป็นอาจารย์" + step ใหม่ + ประกาศข่าว

**Files:**
- Modify: `src/components/onboarding/OnboardingWizard.vue`

**Interfaces:**
- Consumes: `auth.registerInstructor(nickname, realName, reason)` จาก Task 5 · `validateInstructor({nickname, realName, reason})` จาก Task 3 · `useNewsPost().postNews({type, icon, msg})` จาก Task 4 (import `useNewsPost` จาก `'../../composables/useNewsPost.js'`)
- Produces: หลังสมัครสำเร็จ `onboardingGate()` (ไม่ต้องแก้ไฟล์นั้นเลย — คืน `'ok'` เองเพราะ `guestStatus` เป็น `'approved'` แล้ว) ทำให้ `App.vue` เลื่อนเข้าแอปทันที + ข่าวขึ้นกระดาน

- [ ] **Step 1: เพิ่มปุ่มที่ 3 ในหน้าเลือกประเภท**

เปิด `src/components/onboarding/OnboardingWizard.vue` หา step `'type'` (บรรทัด ~11-21):

```html
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
```

เพิ่มปุ่มที่ 3 ก่อน `</template>`:

```html
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
        <button class="ow-choice" @click="step = 'instructor'">
          <span class="ow-choice-ico"><Emoji char="🩺" /></span>
          <span><b>ฉันเป็นอาจารย์</b><small>เข้าได้ทันที — รอแอดมินเปิดสิทธิ์แก้ข้อสอบ</small></span>
        </button>
      </template>
```

- [ ] **Step 2: เพิ่ม step `'instructor'` (3 ช่อง) ต่อจาก step `'guest'`**

หา step `'guest'` (บรรทัด ~46-56), ปิดท้ายก่อน `</div></div></template>`:

```html
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
```

เพิ่ม step ใหม่ (ref แยกจาก guest step เพราะมี 3 ช่องไม่ใช่ 2):

```html
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

      <!-- ขั้น 2c: อาจารย์ (self-declare, auto-approve) -->
      <template v-else-if="step === 'instructor'">
        <button class="ow-back" @click="step = 'type'">‹ กลับ</button>
        <div class="ow-title">สมัครเป็นอาจารย์</div>
        <input v-model="iRealName" class="ow-input" :maxlength="LIMITS.realName" placeholder="ชื่อ-นามสกุล (เช่น อ.สมชาย ใจดี)" />
        <input v-model="iNick" class="ow-input" :maxlength="LIMITS.nickname" placeholder="ชื่อเล่นที่อยากให้เรียก" />
        <textarea v-model="iReason" class="ow-input ow-ta" rows="3" :maxlength="LIMITS.guestReason" placeholder="วิชาที่สอน/เหตุผลที่มาช่วยตรวจข้อสอบ"></textarea>
        <div v-if="iErr" class="ow-err"><Emoji char="⚠️" /> {{ iErr }}</div>
        <button class="ow-btn" :disabled="busy" @click="submitInstructor">
          {{ busy ? 'กำลังบันทึก…' : 'เข้าระบบ →' }}
        </button>
      </template>
    </div>
  </div>
</template>
```

- [ ] **Step 3: import `validateInstructor` และ `useNewsPost`**

หาบรรทัด import ใน `<script setup>` (บรรทัด ~66):

```js
import { validateGuest, matchRoster } from '../../utils/onboarding.js'
```

เป็น:

```js
import { validateGuest, validateInstructor, matchRoster } from '../../utils/onboarding.js'
```

เพิ่ม import ใหม่ต่อจาก import ของ `useToast` (บรรทัด ~68):

```js
import { useToast } from '../../composables/useToast.js'
import { useNewsPost } from '../../composables/useNewsPost.js'
```

เพิ่มการเรียก composable ต่อจากบรรทัด `const { toast } = useToast()` (บรรทัด ~72):

```js
const { toast } = useToast()
const { postNews } = useNewsPost()
```

- [ ] **Step 4: เพิ่ม ref ใหม่สำหรับ step อาจารย์**

หา ref ของ step guest (บรรทัด ~101-103):

```js
// guest
const gNick = ref('')
const gReason = ref('')
const gErr = ref('')
```

เพิ่มต่อท้าย:

```js

// instructor
const iNick = ref('')
const iRealName = ref('')
const iReason = ref('')
const iErr = ref('')
```

- [ ] **Step 5: เพิ่มฟังก์ชัน `submitInstructor` ต่อจาก `submitGuest`**

หา `submitGuest` (บรรทัด ~104-113):

```js
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
```

เพิ่มต่อท้าย:

```js

async function submitInstructor() {
  iErr.value = ''
  const v = validateInstructor({ nickname: iNick.value, realName: iRealName.value, reason: iReason.value })
  if (!v.ok) { iErr.value = v.error; return }
  busy.value = true
  const ok = await auth.registerInstructor(iNick.value, iRealName.value, iReason.value)
  busy.value = false
  if (!ok) { iErr.value = 'บันทึกไม่สำเร็จ ลองใหม่อีกครั้ง'; toast('บันทึกไม่สำเร็จ', 'error'); return }
  // สำเร็จ → guestStatus=approved ทันที → gate เข้า 'ok' เอง (ไม่ผ่าน guest-pending)
  // ยิงข่าวแบบ best-effort — ไม่ await ผลเพื่อไม่ให้ผู้ใช้รอ (postNews ล้มเหลวเงียบเองอยู่แล้ว)
  postNews({ type: 'instructor', icon: '🩺', msg: `อาจารย์ ${iRealName.value} แวะมาเยือนแล้ว!` })
}
```

- [ ] **Step 6: Build**

Run: `npm run build`
Expected: build ผ่าน ไม่มี error

- [ ] **Step 7: ทดสอบมือใน dev server**

Run: `npm run dev` แล้วเปิดเบราว์เซอร์ (ใช้ account Google ที่ยังไม่เคย onboard หรือ incognito + account ทดสอบ):
1. ล็อกอิน → เจอหน้า "คุณคือใคร?" → เห็นปุ่ม 3 ปุ่ม รวม "🩺 ฉันเป็นอาจารย์"
2. กดปุ่มอาจารย์ → เห็นฟอร์ม 3 ช่อง (ชื่อ-นามสกุล / ชื่อเล่น / เหตุผล) → กรอกครบ → กด "เข้าระบบ →"
3. **ต้องเข้าแอปทันที ไม่เจอหน้า "รอแอดมินอนุมัติ"**
4. เปิดหน้า Home ดูกระดานข่าว → **ต้องเห็นข่าว "🩺 อาจารย์ {ชื่อ-นามสกุลที่กรอก} แวะมาเยือนแล้ว!"** (ไอคอน 🩺 มาจาก `icon` field ไม่ได้ซ้ำใน `msg`)
5. เข้า `/questions` → ต้องเห็น**ข้อความปฏิเสธ**อยู่ (ยังไม่มี Task 7 มาเปลี่ยนข้อความ — ยืนยันแค่ว่ายังเข้าแก้ไม่ได้ ถูกต้องตามสิทธิ์)

- [ ] **Step 8: Commit**

```bash
git add src/components/onboarding/OnboardingWizard.vue
git commit -m "Onboarding: เพิ่มทางสมัครอาจารย์ (เข้าแอปได้ทันที + ประกาศข่าว)"
```

---

## Task 7: ข้อความเฉพาะทางในหน้าคลังข้อสอบ (ยังไม่ได้รับสิทธิ์)

**Files:**
- Modify: `src/views/QuestionsView.vue:8-10`

**Interfaces:**
- Consumes: `authStore.userData?.instructorClaim` (จาก Task 1) · `authStore.isQuestionEditor` (มีอยู่แล้วจาก SP1)

- [ ] **Step 1: แก้ข้อความปฏิเสธให้มีเงื่อนไข**

เปิด `src/views/QuestionsView.vue` หาบรรทัด ~8-10:

```html
    <div v-if="!authStore.isQuestionEditor" class="qz-denied">
      เฉพาะแอดมินหรือทีมวิชาการเท่านั้น
    </div>
```

แทนที่ด้วย:

```html
    <div v-if="!authStore.isQuestionEditor" class="qz-denied">
      {{ authStore.userData?.instructorClaim
          ? 'คุณลงทะเบียนเป็นอาจารย์แล้ว รอแอดมินตั้งสิทธิ์แก้ไขข้อสอบให้อีกนิดนะ'
          : 'เฉพาะแอดมินหรือทีมวิชาการเท่านั้น' }}
    </div>
```

- [ ] **Step 2: Build**

Run: `npm run build`
Expected: build ผ่าน

- [ ] **Step 3: ทดสอบมือ**

ใช้ account อาจารย์ที่สมัครไว้ใน Task 6 Step 7 → เข้า `/questions` → ต้องเห็นข้อความ
"คุณลงทะเบียนเป็นอาจารย์แล้ว รอแอดมินตั้งสิทธิ์แก้ไขข้อสอบให้อีกนิดนะ" (ไม่ใช่ข้อความทั่วไป)

- [ ] **Step 4: Commit**

```bash
git add src/views/QuestionsView.vue
git commit -m "Questions: ข้อความปฏิเสธเฉพาะทาง สำหรับอาจารย์ที่รออนุมัติ"
```

---

## Task 8: ฝั่งแอดมิน — คิวอาจารย์ที่ขอเข้าระบบ

**Files:**
- Modify: `src/stores/members.js:163` (เพิ่ม field เข้า `light` projection)
- Modify: `src/views/AdminView.vue` (computed ใหม่ + section การ์ดใหม่)

**Interfaces:**
- Consumes: `members.guestUsers` (array of `light` objects — ต้องมี `instructorClaim` หลัง Step 1 ของ task นี้; `realName`/`role`/`nickname`/`email`/`guestReason`/`uid` มีอยู่แล้ว) · `setRole(m, role)` (มีอยู่แล้วจาก SP1, ไม่ต้องเขียนใหม่)
- Produces: การ์ด UI ใหม่ในหน้า `/admin`

- [ ] **Step 1: เพิ่ม `instructorClaim` เข้า light projection**

เปิด `src/stores/members.js` หา object `light` ใน `loadFbUsers()` (บรรทัด ~146-148):

```js
                    accountType: n.accountType,
                    guestStatus: n.guestStatus,
                    guestReason: n.guestReason,
```

แทรกบรรทัดใหม่ต่อจาก `guestReason`:

```js
                    accountType: n.accountType,
                    guestStatus: n.guestStatus,
                    guestReason: n.guestReason,
                    instructorClaim: n.instructorClaim,
```

- [ ] **Step 2: เพิ่ม computed `pendingInstructors`**

เปิด `src/views/AdminView.vue` หา `pendingGuests` (บรรทัด ~1090-1091):

```js
const pendingGuests = computed(() =>
  (members.guestUsers || []).filter(g => g.guestStatus === 'pending'))
```

เพิ่มต่อท้าย:

```js
const pendingInstructors = computed(() =>
  (members.guestUsers || []).filter(g => g.instructorClaim === true && g.role !== 'instructor'))
```

- [ ] **Step 3: เพิ่ม section การ์ดใหม่ในเทมเพลต**

หาการ์ด "คำขอ guest (รออนุมัติ)" (บรรทัด ~218-236, ปิดท้ายด้วย `</section>` ก่อนคอมเมนต์ "ทีมวิชาการ"):

```html
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

เพิ่มการ์ดใหม่ต่อท้าย (ก่อนคอมเมนต์ "ทีมวิชาการ") — โชว์ `realName` ถ้ามี ด้วย pattern เดียวกับ role-management list เดิม:

```html
      <!-- ───── อาจารย์ที่ขอเข้าระบบ (self-declare, auto-approved แล้ว รอตั้ง role) ───── -->
      <section v-if="pendingInstructors.length" class="admin-card">
        <div class="admin-card-head"><span><Emoji char="🩺" /> อาจารย์ที่ขอเข้าระบบ</span></div>
        <ul class="role-list">
          <li v-for="m in pendingInstructors" :key="m.uid" class="role-row">
            <div class="role-top">
              <div class="role-info">
                <div class="role-name">
                  {{ m.nickname }}
                  <span v-if="m.realName" class="role-real">· {{ m.realName }}</span>
                </div>
                <div class="role-sub">{{ m.email }}</div>
                <div class="gq-reason">{{ m.guestReason }}</div>
              </div>
              <div class="role-actions">
                <button class="btn-mini btn-gold" @click="setRole(m, 'instructor')"><Emoji char="🩺" /> ตั้งเป็นอาจารย์</button>
              </div>
            </div>
          </li>
        </ul>
      </section>
```

- [ ] **Step 4: Build**

Run: `npm run build`
Expected: build ผ่าน

- [ ] **Step 5: ทดสอบมือ**

1. เข้า `/admin` ด้วย account admin → กด "↻ โหลด" (หรือรีเฟรชถ้า cache เก่า) → ต้องเห็นการ์ด
   "🩺 อาจารย์ที่ขอเข้าระบบ" มีชื่อเล่น+ชื่อ-นามสกุล+เหตุผลของ account อาจารย์ที่สมัครไว้ใน Task 6
2. กด "🩺 ตั้งเป็นอาจารย์" → การ์ดต้องหายไป (เพราะ `role` เปลี่ยนเป็น `'instructor'` แล้ว ไม่ตรงเงื่อนไข filter อีก)
3. สลับไป account อาจารย์ (ต้อง reload หน้า/ออกจากระบบแล้วเข้าใหม่เพื่อดึง `userData` สด) → เข้า `/questions`
   → ต้องเข้าได้เต็มสิทธิ์แล้ว (ไม่เห็นข้อความปฏิเสธ)

- [ ] **Step 6: Commit**

```bash
git add src/stores/members.js src/views/AdminView.vue
git commit -m "Admin: การ์ดคิวอาจารย์ที่ขอเข้าระบบ (ตั้งสิทธิ์ได้คลิกเดียว)"
```

---

## Task 9: ตรวจ acceptance criteria ทั้งชุด (end-to-end)

**Files:** ไม่มีไฟล์ใหม่ — เช็คลิสต์สุดท้ายก่อนปิดงาน

- [ ] **Step 1: guest ทั่วไปไม่ได้รับผลกระทบ**

ใช้ account ทดสอบอีกตัว → หน้า "คุณคือใคร?" → กด "🎓 ฉันเป็นผู้เยี่ยมชม" (ปุ่มเดิม ไม่ใช่ปุ่มอาจารย์) →
กรอก+ส่ง → **ต้องเจอหน้า "รอแอดมินอนุมัติ" เหมือนเดิมทุกอย่าง** (guestStatus ยัง `'pending'` ไม่ auto-approve
ไม่มีช่องชื่อ-นามสกุลเพิ่ม)

- [ ] **Step 2: กันลัดคิวหลังโดนปฏิเสธ**

ใน `/admin` กด "✗ ปฏิเสธ" ให้ account ทดสอบจาก Step 1 (guestStatus → `'rejected'`) → ให้ account นั้น
ล็อกเอาต์แล้วเข้าใหม่ (หรือเปิด DevTools console ยิง `auth.registerInstructor('x','y','z')` ตรงๆ ถ้าเข้า UI ไม่ได้
เพราะติด `GuestPendingScreen` แบบ rejected) → **ต้องถูก rules ปฏิเสธ (permission-denied)** เพราะ
`resource.data.guestStatus` ไม่ใช่ `null` แล้ว (เป็น `'rejected'`)

- [ ] **Step 3: เล่นเกมได้ปกติในฐานะอาจารย์ที่ยังไม่ได้ตั้ง role**

Account อาจารย์จาก Task 6 (ก่อนแอดมินกด "ตั้งเป็นอาจารย์"): เข้าหน้า Home/Members/Farm → ต้องใช้งานได้ปกติ
ไม่มีอะไรถูกบล็อกเพิ่มเติมนอกจาก `/questions`

- [ ] **Step 4: ข่าว best-effort ไม่บล็อกการสมัคร**

ตรวจโค้ด `submitInstructor()` (Task 6) อีกรอบ — ยืนยันว่า `postNews(...)` ไม่ได้ `await` ก่อนจบฟังก์ชัน และ
ต่อให้ `postNews` throw/reject ก็ต้องไม่กระทบผลลัพธ์การสมัคร (อ่าน `useNewsPost.js` — internal try/catch คืน
`false` เงียบๆ อยู่แล้ว ไม่ throw ออกมาให้ caller เลย ยืนยันจากโค้ดจริงไม่ใช่แค่เดา)

- [ ] **Step 5: รัน test suite ที่เกี่ยวข้องทั้งหมดอีกรอบ**

Run: `node --test src/data/userSchema.test.js src/utils/onboarding.test.js`
Expected: PASS ทั้งหมด

- [ ] **Step 6: Build รอบสุดท้าย**

Run: `npm run build`
Expected: ผ่าน ไม่มี warning ใหม่

- [ ] **Step 7: อัปเดต spec ให้ตรงสถานะจริง (ถ้ามีจุดที่ implement ต่างจากที่เขียนไว้)**

เปิด `docs/superpowers/specs/2026-09-16-instructor-fast-onboarding-design.md` เทียบกับโค้ดจริง ถ้าตรงกันหมด
ไม่ต้องแก้อะไร — ถ้ามีจุดที่ implementation ต่างจาก spec ให้แก้ spec ให้ตรง แล้ว commit

```bash
git add docs/superpowers/specs/2026-09-16-instructor-fast-onboarding-design.md
git commit -m "Docs: อัปเดต spec ให้ตรงกับ implementation จริง"
```

(ข้ามได้ถ้าไม่มีอะไรต้องแก้)
