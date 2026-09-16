# Spec: ทางเข้าอาจารย์แบบไว (self-declare + auto-approve guest) — ต่อยอด SP1

วันที่: 2026-09-16 · สถานะ: **ดีไซน์อนุมัติแล้ว** (เคาะกับเจ้าของโปรเจกต์ในเซสชัน)

## ที่มา & เป้าหมาย

SP1 ([[2026-06-22-instructor-role-comments-design]]) สร้าง role `instructor` + gate `isQuestionEditor` ไว้ครบแล้ว
(deploy จริงตั้งแต่ 22 มิ.ย. ยืนยันแล้วว่า rules สดตรงกับโค้ดในเครื่อง) แต่ flow การ "เข้าระบบครั้งแรก" ของอาจารย์
ยังใช้ทางเดียวกับ guest ทั่วไปทั้งหมด — ต้องกรอกแบบฟอร์ม guest, ติดหน้ารอคิว (`GuestPendingScreen`, บล็อกทั้งแอป)
จนกว่า admin จะเข้ามาอนุมัติ *สองครั้ง* (อนุมัติ guest → ตั้ง role instructor) เป็นแรงเสียดทานที่ไม่จำเป็นสำหรับ
การเชิญอาจารย์ครั้งแรก ซึ่งเจ้าของระบบรู้จักตัวตนอยู่แล้ว (เชิญเอง ไม่ใช่คนแปลกหน้าเดินเข้ามาสมัคร)

เป้าหมาย: อาจารย์กด "ฉันเป็นอาจารย์" ครั้งเดียว **เข้าเล่นแอปได้เต็มที่ทันที** (เหมือน guest ที่อนุมัติแล้ว —
coins/ฟาร์ม/PvP ฯลฯ) โดยไม่ต้องรอคิว ส่วน **สิทธิ์แก้ไขคลังข้อสอบ** (สิ่งเดียวที่มีความหมายจริงจัง) ยังคงต้องให้
admin กดตั้งเองเหมือนเดิม (แค่ "หาเจอง่ายขึ้น" ไม่ใช่ "อัตโนมัติ")

## ขอบเขต (scope)

**ทำ:** ปุ่มสมัคร "อาจารย์" แยกจาก guest ทั่วไป · auto-approve guestStatus เฉพาะทางนี้ · แฟล็ก `instructorClaim`
ให้ admin เห็น · การ์ดคิวอาจารย์แยกใน AdminView · ข้อความอธิบายตอนเข้า `/questions` แล้วยังไม่มีสิทธิ์ · ผ่อน rules เท่าที่จำเป็น ·
เก็บชื่อ-นามสกุลจริงแยกจากชื่อเล่น · ประกาศในกระดานข่าวตอนสมัครสำเร็จ (เพิ่มเติม 16 ก.ย. — ดู decision 6)

**ไม่ทำ (นอกขอบเขต):** ไม่แตะ flow guest ทั่วไป (ยังรอคิวเหมือนเดิมทุกอย่าง) · ไม่ตรวจสอบตัวตนอาจารย์อัตโนมัติ
(ไม่เช็คโดเมนอีเมล ไม่มี invite token) — **เชื่อคำประกาศตัวเอง 100%** (เคาะกับ user แล้ว) · ไม่แตะ `role`
ผ่านทางไหนก็ตามที่ไม่ใช่ admin กดเอง

## Decisions (เคาะแล้ว)

### 1. ระดับ "เข้าได้ก่อนอนุมัติ" — เท่ากับ guest ปกติที่ approved แล้ว
ไม่มี tier พิเศษระหว่างกลาง — self-declare แล้วได้สิทธิ์เท่า guest ที่ admin อนุมัติเองทุกอย่าง (ดู `เกิดจริง` ด้านล่าง
ว่า guestStatus ไม่ใช่ตัวจำกัด feature ใดๆ ในแอปอยู่แล้ว มีผลแค่ผ่าน launch gate) **ยกเว้นหน้าคลังข้อสอบ**
ที่ยังคุมด้วย `role==='instructor'` เหมือนเดิม ไม่เกี่ยวกับ guestStatus เลย

### 2. ระดับความเชื่อ — เชื่อ 100% ไม่มีการยืนยันตัวตนเพิ่ม
ยอมรับความเสี่ยงที่คนทั่วไปอาจกดปุ่ม "ฉันเป็นอาจารย์" เพื่อลัดคิวรออนุมัติแบบ guest (เข้าเกมได้เร็วขึ้นเฉยๆ)
เพราะสิ่งเดียวที่มีความหมายจริง (แก้ไขคลังข้อสอบ) ยังล็อกด้วย role เหมือนเดิม ไม่ได้เปิดช่องเพิ่ม

### 3. Data model — 1 field ใหม่ + reuse field เดิม 1 ตัว
`users/{uid}.instructorClaim: boolean` (default `false`) — แปลว่า "ประกาศตัวเป็นอาจารย์ตอนสมัคร รอ admin ตั้ง role"
เซ็ตครั้งเดียวตอนสมัคร ไม่มีใครแก้คืนได้ (ไม่ต้องมี unset — เอาไว้กรอง list ฝั่ง admin เท่านั้น ไม่ใช่ permission gate)

`users/{uid}.realName` **มีอยู่แล้ว** ในสคีมา (ปกติมาจาก roster ตอนนักศึกษาผูกรหัส) — ทางอาจารย์ reuse field เดิม
ตัวนี้เก็บชื่อ-นามสกุลที่กรอกเอง ไม่สร้าง field ใหม่ซ้อน ไม่มีข้อจำกัดจาก rules (owner เขียนเองได้อยู่แล้ว
เพราะไม่ใช่ field ที่ถูกล็อกอย่าง role/tags/coins)

### 4. Rules — ผ่อน guestStatus เฉพาะเงื่อนไขแคบมาก
เดิม owner set guestStatus เองได้แค่ `'pending'` เท่านั้น (บังคับรอคิว) เพิ่มทางเลือกที่สอง:
เซ็ตเป็น `'approved'` ได้ **เฉพาะ** (ก) ส่ง `instructorClaim:true` มาพร้อมกันในการเขียนเดียวกัน และ
(ข) `guestStatus` **เดิม** (ก่อนเขียน) เป็น `null` เท่านั้น (แปลว่าเป็นการสมัครครั้งแรกจริงๆ) — กันไม่ให้คนที่เคย
ถูกปฏิเสธ หรืออยู่ระหว่างคิว pending ปกติ มาเขียนซ้ำเพื่อสวมทางลัดทีหลัง
`role` ไม่อยู่ใน diff นี้เลย — เงื่อนไข self-promote เดิม (line ~59) คุมอยู่แล้วไม่ต้องแตะ

### 5. UI — เพิ่มปุ่มที่ 3 ในหน้าเลือกตอนสมัคร ไม่ใช่ทางแยกใน guest step เดิม
`OnboardingWizard.vue` step `'type'`: เพิ่มปุ่ม "🩺 ฉันเป็นอาจารย์" คู่กับนักศึกษา/ผู้เยี่ยมชม → ไป step ใหม่
`'instructor'` (ฟอร์ม **3 ช่อง** ต่างจาก guest step 2 ช่อง — ดู decision 6) → เรียก action ใหม่
`auth.registerInstructor(nickname, realName, reason)` (คู่ขนานกับ `registerGuest` เดิม ไม่แก้ของเดิม)
ใช้ ref ของตัวเองแยกจาก guest step (`iNick`/`iRealName`/`iReason`/`iErr`) เพราะจำนวนช่องไม่เท่ากันแล้ว

### 6. ชื่อ-นามสกุล + ประกาศในกระดานข่าว (เพิ่มเติม 16 ก.ย. 2026 — user ขอเพิ่มระหว่างวางแผน implementation)

**เหตุผล:** อยากให้เพื่อนในรุ่นรู้ว่า "อาจารย์ XX มาเยือนแล้ว" ผ่านกระดานข่าวหน้าแรก (ระบบข่าวมีอยู่แล้ว —
[[2026-08-28-news-board-live-design]]) — nickname เพียงอย่างเดียวไม่พอสื่อว่าเป็นใคร ต้องมีชื่อจริง/คำนำหน้า

**สิ่งที่เพิ่ม:**
- ฟอร์มสมัครอาจารย์เก็บ **3 ช่อง**: ชื่อ-นามสกุล (เช่น "อ.สมชาย ใจดี") · ชื่อเล่น (ใช้เรียกในเกม เหมือนคนอื่น) ·
  เหตุผล/วิชาที่สอน (ช่องเดิม) — ชื่อ-นามสกุลเก็บใน field `realName` ที่มีอยู่แล้ว (reuse ไม่สร้างใหม่)
- เพิ่ม `LIMITS.realName = 60` ใน `utils/text.js` (ยังไม่เคยมี — เดิม `realName` มาจาก roster ที่คุมความยาวอยู่แล้ว
  ไม่เคยผ่าน `cleanText` ตรงๆ จากฟอร์มมาก่อน)
- สมัครสำเร็จ → ยิงข่าวเข้ากระดานข่าวทันที (เลน `news` collection — เลนข่าว "อยู่ยาว" ไม่ใช่เลน `ev` ที่หมดอายุ
  7 วัน เพราะเป็นเหตุการณ์ไม่บ่อย ควรอยู่ให้เห็นนาน): เพิ่มชนิดข่าวใหม่ `'instructor'` เข้า `NEWS_TYPES`
  (`useNewsPost.js`) **และ** whitelist ของ `firestore.rules` (`match /news/{newsId}`) พร้อมกันทั้งสองที่
  ข้อความ: `อาจารย์ ${realName} แวะมาเยือนแล้ว!` (เรียก `postNews({ type:'instructor', icon:'🩺', msg })`
  จากฝั่ง component หลัง `registerInstructor()` สำเร็จ — ตามแพทเทิร์นเดิมที่ `useTower.js`/`ShopView.vue` ใช้
  เรียก `postNews` เองหลัง action สำเร็จ ไม่ใช่เรียกจากใน store)
- ยิงข่าวเป็น **best-effort** — ถ้า post ข่าวล้มเหลว (เช่น rules ยังไม่ deploy) **ไม่บล็อกการสมัคร** เข้าแอปได้ปกติ
  (ตรงกับที่ `useNewsPost.js` ออกแบบไว้แล้ว: ล้มเหลว = เงียบ ไม่ toast ไม่ retry)

---

## งานที่ต้องทำ (ราย task)

### Task 1 — `src/data/userSchema.js`
เพิ่ม field `instructorClaim: false` ต่อจาก `guestStatus` (ตาม pattern บูลีนระดับบนสุดแบบ `welcomeBoxSeen`)

### Task 2 — `src/stores/auth.js`: action ใหม่ + rules ผ่อน
- เพิ่ม `async function registerInstructor(nickname, realName, reason)` คู่ขนาน `registerGuest` (บรรทัด ~269):
  ```js
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
- export เพิ่มในจุดเดียวกับ `registerGuest`
- **`firestore.rules`** (⚠️ ต้อง deploy): ในเงื่อนไข guestStatus ของ `match /users/{userId}` (บรรทัด ~72-73 ปัจจุบัน)
  เพิ่ม branch ที่สาม:
  ```
  && (
    request.resource.data.get('guestStatus', null) == resource.data.get('guestStatus', null)
    || request.resource.data.get('guestStatus', null) == 'pending'
    || (
      request.resource.data.get('guestStatus', null) == 'approved'
      && request.resource.data.get('instructorClaim', false) == true
      && resource.data.get('guestStatus', null) == null
    )
  )
  ```
  หลังแก้: `firebase deploy --only firestore:rules`

### Task 3 — `src/utils/text.js` + `src/utils/onboarding.js`: limit + validator ใหม่
- เพิ่ม `realName: 60,` ใน `LIMITS` (`text.js`)
- เพิ่ม `validateInstructor({ nickname, realName, reason })` ใน `onboarding.js` (pure, คู่กับ `validateGuest`
  เดิมแต่เช็ค 3 ช่อง) + เทสใน `onboarding.test.js`

### Task 4 — `src/composables/useNewsPost.js` + `firestore.rules`: เปิดชนิดข่าว `'instructor'`
- เพิ่ม `'instructor'` เข้า `NEWS_TYPES` array (`useNewsPost.js`)
- เพิ่ม `'instructor'` เข้า type whitelist ของ `match /news/{newsId}` ใน `firestore.rules`
  (บรรทัด `type in ['achievement','legendary','tower100','record1']`) → deploy rules

### Task 5 — `src/components/onboarding/OnboardingWizard.vue`
- step `'type'`: เพิ่มปุ่มที่ 3 หลังปุ่ม guest เดิม (บรรทัด ~17-20):
  ```html
  <button class="ow-choice" @click="step = 'instructor'">
    <span class="ow-choice-ico"><Emoji char="🩺" /></span>
    <span><b>ฉันเป็นอาจารย์</b><small>เข้าได้ทันที — รอแอดมินเปิดสิทธิ์แก้ข้อสอบ</small></span>
  </button>
  ```
- เพิ่ม step ใหม่ `'instructor'` — ฟอร์ม **3 ช่อง**: ชื่อ-นามสกุล / ชื่อเล่น / เหตุผล-วิชาที่สอน ใช้ ref ของตัวเอง
  แยกจาก guest step (`iNick`/`iRealName`/`iReason`/`iErr`) ปุ่มส่งข้อความ "เข้าระบบ →"
- `submitInstructor()`: validate ด้วย `validateInstructor` (Task 3) → เรียก `auth.registerInstructor(nick, realName, reason)`
  → สำเร็จแล้วยิงข่าวด้วย `useNewsPost().postNews({ type:'instructor', icon:'🩺', msg: \`อาจารย์ ${realName} แวะมาเยือนแล้ว!\` })`
  (best-effort — ไม่ await/บล็อกถ้า post ข่าวพลาด, การเข้าแอปสำเร็จแล้วตั้งแต่ `registerInstructor` ผ่าน)
  gate เลื่อนเข้า `'ok'` เอง (ไม่มี `'guest-pending'` เหมือนทางเดิม)

### Task 6 — `src/views/QuestionsView.vue`: ข้อความปฏิเสธเฉพาะทาง
เปลี่ยนบรรทัด `qz-denied` (บรรทัด ~8-10) ให้เช็ค `authStore.userData?.instructorClaim` ก่อน:
```html
<div v-if="!authStore.isQuestionEditor" class="qz-denied">
  {{ authStore.userData?.instructorClaim
      ? 'คุณลงทะเบียนเป็นอาจารย์แล้ว รอแอดมินตั้งสิทธิ์แก้ไขข้อสอบให้อีกนิดนะ'
      : 'เฉพาะแอดมินหรือทีมวิชาการเท่านั้น' }}
</div>
```

### Task 5 — `src/views/AdminView.vue`: การ์ดคิวอาจารย์
- เพิ่ม computed `pendingInstructors` (คู่กับ `pendingGuests` เดิม) กรองจาก roster/members:
  `m.instructorClaim === true && m.role !== 'instructor'`
- เพิ่ม section การ์ดใหม่ต่อจาก "คำขอเข้าชม (รออนุมัติ)" เดิม (บรรทัด ~236) — โชว์ `realName` ด้วยถ้ามี
  (ใช้ pattern เดียวกับ role-management list เดิมที่มี `<span v-if="m.realName">· {{ m.realName }}</span>`):
  ```html
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
  reuse `setRole()` ที่มีอยู่แล้ว (ไม่ต้องเขียน handler ใหม่) — ปุ่มเดิมในลิสต์ทีมวิชาการยังอยู่เหมือนเดิม
  (การ์ดนี้แค่ทำให้หาเจอง่ายกว่าไล่สแครอลทั้งลิสต์) · `members.js` projection ต้องมี `instructorClaim`
  (เพิ่มเข้า `light` object — `realName` มีอยู่แล้วในนั้น ไม่ต้องแตะ)

### Task 8 — end-to-end + เทสที่เหลือ
- รัน `node --test src/data/userSchema.test.js src/utils/onboarding.test.js` ให้ผ่านทั้งหมด
- manual test เต็มรอบตาม acceptance criteria ด้านล่าง (รวมเช็คว่าข่าวขึ้นกระดานจริง)

---

## Acceptance criteria

- [ ] คนที่ไม่มีรหัสนักศึกษา login แล้วเลือก "ฉันเป็นอาจารย์" → กรอกชื่อ-นามสกุล+ชื่อเล่น+เหตุผล → เข้าแอปได้ทันที **ไม่เจอหน้ารอคิว**
- [ ] บัญชีนั้น: เล่นเกมปกติได้ (เหรียญ/ฟาร์ม/PvP) เหมือน guest ที่ approved แล้วทุกอย่าง
- [ ] สมัครสำเร็จแล้วเปิดกระดานข่าวหน้าแรก → เห็นข่าว "🩺 อาจารย์ {ชื่อ-นามสกุล} แวะมาเยือนแล้ว!" (ไอคอน 🩺 แสดงจาก `icon` field)"
- [ ] บัญชีนั้น: เข้า `/questions` → เห็นข้อความ "ลงทะเบียนเป็นอาจารย์แล้ว รอแอดมิน…" (ไม่ใช่ข้อความปฏิเสธทั่วไป) — ยังแก้ข้อสอบไม่ได้จริง
- [ ] admin เข้า `/admin` → เห็นการ์ด "🩺 อาจารย์ที่ขอเข้าระบบ" มีชื่อ-นามสกุล+ชื่อเล่น+เหตุผลที่กรอกไว้ → กดตั้งเป็นอาจารย์ครั้งเดียวจบ
- [ ] หลังตั้งแล้ว: เข้า `/questions` ได้เต็มสิทธิ์ (เหมือน SP1 เดิมทุกอย่าง) การ์ดในแอดมินหายไปจากคิว (role เปลี่ยนแล้ว)
- [ ] guest ทั่วไป (เลือกปุ่ม "ผู้เยี่ยมชม") ยังรอคิวเหมือนเดิมทุกอย่าง ไม่ได้รับผลกระทบ ไม่มีช่องชื่อ-นามสกุลเพิ่ม
- [ ] คนที่เคยถูก reject จาก guest ทั่วไป ไปกดปุ่ม "อาจารย์" ซ้ำ **ต้องไม่หลุด auto-approve** (rules เช็ค guestStatus เดิมต้องเป็น null)
- [ ] ถ้าปิด/ยกเลิก type ข่าว `'instructor'` ใน rules ไว้ (ลืม deploy) การสมัครอาจารย์ยัง**ต้องสำเร็จ** แค่ไม่มีข่าวขึ้น (best-effort)
- [ ] `npm run build` ผ่าน + deploy rules แล้ว (`firebase deploy --only firestore:rules`) ก่อนทดสอบจริงกับบัญชีจริง

## หมายเหตุ / กับดัก

- **ต้อง deploy rules** ก่อนทดสอบ ไม่งั้น `registerInstructor` จะถูก rules ปฏิเสธเงียบๆ (permission-denied) —
  ดู CLAUDE.md ข้อ 7 เรื่อง rules ต้อง `firebase deploy` เท่านั้นถึงมีผลจริง
- `instructorClaim` เป็นแค่ป้ายช่วยแอดมิน**หา**คน ไม่ใช่ permission gate เอง — ต่อให้ค่านี้หลุด/ถูกปลอมทางไหนก็ตาม
  ผลคือ "โผล่ในคิวแอดมิน" เฉยๆ ไม่ได้ให้สิทธิ์อะไรเพิ่ม (สิทธิ์จริงมาจาก `role==='instructor'` ที่ยังแก้ได้แค่ admin เท่านั้น)
- `pendingInstructors` filter ต้องอ่านจาก source เดียวกับที่ `pendingGuests`/role management list ใช้อยู่แล้ว
  (ดูของเดิมใน AdminView ว่าดึงจาก `members` store ตัวไหน — อย่าเปิด read ใหม่)
- ปุ่ม "ฉันเป็นอาจารย์" กับ "ผู้เยี่ยมชม" ใช้ `guestReason`/`LIMITS.guestReason` ร่วมกัน (ช่องเหตุผล) — แต่ **ช่องชื่อ-นามสกุล
  เป็นของใหม่เฉพาะทางอาจารย์** ไม่มีใน guest step (`LIMITS.realName` ใหม่)
- ข่าว `'instructor'` เป็น**คนละเรื่อง**กับ rules ของ `users/{userId}` (Task 2) — ต้องแก้ `firestore.rules` **2 จุด**
  ในไฟล์เดียวกัน (guestStatus branch + news type whitelist) อย่าแก้แค่จุดเดียวแล้วคิดว่าจบ
- `postNews` ต้องเรียก**หลัง** `registerInstructor()` คืน `true` แล้วเท่านั้น (ต้องมี `users/{uid}` doc อยู่ก่อน
  auth.currentUser ถึงจะ valid ให้ rules เช็ค `uid` ตรง — จริงๆ ณ จุดนี้ login เสร็จแล้วเสมอ แต่ให้เรียงลำดับตามนี้
  เพื่อไม่ให้ข่าวขึ้นก่อนบัญชีเสร็จสมบูรณ์)

## ความเชื่อมโยง

- ต่อยอด SP1 ([[2026-06-22-instructor-role-comments-design]]) — SP1 ทำ role + สิทธิ์แก้คลังข้อสอบไว้ครบแล้ว
  งานนี้แก้แค่ "ทางเข้า" ให้ friction ต่ำลง ไม่แตะ permission model ของ SP1 เลย
- ยืนยันแล้ว (16 ก.ย. 2026) ว่า rules ของ SP1 deploy ขึ้น production จริงแล้วตั้งแต่มิ.ย. (เช็คผ่าน
  `firebase deploy --only firestore:rules` แล้วขึ้น "already up to date, skipping upload")
