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
ให้ admin เห็น · การ์ดคิวอาจารย์แยกใน AdminView · ข้อความอธิบายตอนเข้า `/questions` แล้วยังไม่มีสิทธิ์ · ผ่อน rules เท่าที่จำเป็น

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

### 3. Data model — เพิ่ม 1 field เท่านั้น
`users/{uid}.instructorClaim: boolean` (default `false`) — แปลว่า "ประกาศตัวเป็นอาจารย์ตอนสมัคร รอ admin ตั้ง role"
เซ็ตครั้งเดียวตอนสมัคร ไม่มีใครแก้คืนได้ (ไม่ต้องมี unset — เอาไว้กรอง list ฝั่ง admin เท่านั้น ไม่ใช่ permission gate)

### 4. Rules — ผ่อน guestStatus เฉพาะเงื่อนไขแคบมาก
เดิม owner set guestStatus เองได้แค่ `'pending'` เท่านั้น (บังคับรอคิว) เพิ่มทางเลือกที่สอง:
เซ็ตเป็น `'approved'` ได้ **เฉพาะ** (ก) ส่ง `instructorClaim:true` มาพร้อมกันในการเขียนเดียวกัน และ
(ข) `guestStatus` **เดิม** (ก่อนเขียน) เป็น `null` เท่านั้น (แปลว่าเป็นการสมัครครั้งแรกจริงๆ) — กันไม่ให้คนที่เคย
ถูกปฏิเสธ หรืออยู่ระหว่างคิว pending ปกติ มาเขียนซ้ำเพื่อสวมทางลัดทีหลัง
`role` ไม่อยู่ใน diff นี้เลย — เงื่อนไข self-promote เดิม (line ~59) คุมอยู่แล้วไม่ต้องแตะ

### 5. UI — เพิ่มปุ่มที่ 3 ในหน้าเลือกตอนสมัคร ไม่ใช่ทางแยกใน guest step เดิม
`OnboardingWizard.vue` step `'type'`: เพิ่มปุ่ม "🩺 ฉันเป็นอาจารย์" คู่กับนักศึกษา/ผู้เยี่ยมชม → ไป step ใหม่
`'instructor'` (ฟอร์มหน้าตาเดียวกับ guest: ชื่อเล่น + เหตุผล/วิชาที่สอน แค่ placeholder ต่าง) → เรียก action ใหม่
`auth.registerInstructor(nickname, reason)` (คู่ขนานกับ `registerGuest` เดิม ไม่แก้ของเดิม)

---

## งานที่ต้องทำ (ราย task)

### Task 1 — `src/data/userSchema.js`
เพิ่ม field `instructorClaim: false` ต่อจาก `guestStatus` (ตาม pattern บูลีนระดับบนสุดแบบ `welcomeBoxSeen`)

### Task 2 — `src/stores/auth.js`: action ใหม่ + rules ผ่อน
- เพิ่ม `async function registerInstructor(nickname, reason)` คู่ขนาน `registerGuest` (บรรทัด ~269):
  ```js
  async function registerInstructor(nickname, reason) {
      const nick = cleanText(nickname, LIMITS.nickname)
      const why  = cleanText(reason, LIMITS.guestReason)
      if (!nick || !why) return false
      const patch = {
          nickname: nick, guestReason: why,
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

### Task 3 — `src/components/onboarding/OnboardingWizard.vue`
- step `'type'`: เพิ่มปุ่มที่ 3 หลังปุ่ม guest เดิม (บรรทัด ~17-20):
  ```html
  <button class="ow-choice" @click="step = 'instructor'">
    <span class="ow-choice-ico"><Emoji char="🩺" /></span>
    <span><b>ฉันเป็นอาจารย์</b><small>เข้าได้ทันที — รอแอดมินเปิดสิทธิ์แก้ข้อสอบ</small></span>
  </button>
  ```
- เพิ่ม step ใหม่ `'instructor'` (คัดลอกโครง step `'guest'`) — placeholder ปรับเป็น "วิชาที่สอน/เหตุผลที่มาช่วยตรวจข้อสอบ"
  ปุ่มส่งข้อความ "เข้าระบบ →" (ไม่ใช่ "ส่งคำขอ →" เพราะไม่ต้องรอ)
- ใช้ ref `gNick`/`gReason`/`gErr` **ตัวเดิมร่วมกับ step guest** ได้เลย (สอง step เป็น `v-else-if` mount ทีละอันเท่านั้น
  ไม่มีทางชนกัน) เขียน `submitInstructor()` เป็นฟังก์ชันแยกจาก `submitGuest()` เรียก `auth.registerInstructor(...)`
  แทน `auth.registerGuest(...)` — สำเร็จแล้ว gate เลื่อนเข้า `'ok'` เอง (ไม่มี `'guest-pending'` เหมือนทางเดิม)

### Task 4 — `src/views/QuestionsView.vue`: ข้อความปฏิเสธเฉพาะทาง
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
- เพิ่ม section การ์ดใหม่ต่อจาก "คำขอเข้าชม (รออนุมัติ)" เดิม (บรรทัด ~236):
  ```html
  <section v-if="pendingInstructors.length" class="admin-card">
    <div class="admin-card-head"><span><Emoji char="🩺" /> อาจารย์ที่ขอเข้าระบบ</span></div>
    <ul class="role-list">
      <li v-for="m in pendingInstructors" :key="m.uid" class="role-row">
        <div class="role-top">
          <div class="role-info">
            <div class="role-name">{{ m.nickname }}</div>
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
  (การ์ดนี้แค่ทำให้หาเจอง่ายกว่าไล่สแครอลทั้งลิสต์)

### Task 6 — เทส
- `src/utils/onboarding.test.js` (ถ้ามี) หรือไฟล์ใหม่: เทส `registerInstructor` inputs ผ่าน pure helper ถ้ามีการดึง
  logic ออกมา pure ได้ (validate nickname/reason เหมือน `validateGuest`) — ถ้า logic เล็กพอจนไม่คุ้มแยกไฟล์
  ให้ข้ามได้ (YAGNI) แต่ต้องมี manual test ผ่าน UI จริงก่อนปิดงาน

---

## Acceptance criteria

- [ ] คนที่ไม่มีรหัสนักศึกษา login แล้วเลือก "ฉันเป็นอาจารย์" → กรอกชื่อ+เหตุผล → เข้าแอปได้ทันที **ไม่เจอหน้ารอคิว**
- [ ] บัญชีนั้น: เล่นเกมปกติได้ (เหรียญ/ฟาร์ม/PvP) เหมือน guest ที่ approved แล้วทุกอย่าง
- [ ] บัญชีนั้น: เข้า `/questions` → เห็นข้อความ "ลงทะเบียนเป็นอาจารย์แล้ว รอแอดมิน…" (ไม่ใช่ข้อความปฏิเสธทั่วไป) — ยังแก้ข้อสอบไม่ได้จริง
- [ ] admin เข้า `/admin` → เห็นการ์ด "🩺 อาจารย์ที่ขอเข้าระบบ" มีชื่อ+เหตุผลที่กรอกไว้ → กดตั้งเป็นอาจารย์ครั้งเดียวจบ
- [ ] หลังตั้งแล้ว: เข้า `/questions` ได้เต็มสิทธิ์ (เหมือน SP1 เดิมทุกอย่าง) การ์ดในแอดมินหายไปจากคิว (role เปลี่ยนแล้ว)
- [ ] guest ทั่วไป (เลือกปุ่ม "ผู้เยี่ยมชม") ยังรอคิวเหมือนเดิมทุกอย่าง ไม่ได้รับผลกระทบ
- [ ] คนที่เคยถูก reject จาก guest ทั่วไป ไปกดปุ่ม "อาจารย์" ซ้ำ **ต้องไม่หลุด auto-approve** (rules เช็ค guestStatus เดิมต้องเป็น null)
- [ ] `npm run build` ผ่าน + deploy rules แล้ว (`firebase deploy --only firestore:rules`) ก่อนทดสอบจริงกับบัญชีจริง

## หมายเหตุ / กับดัก

- **ต้อง deploy rules** ก่อนทดสอบ ไม่งั้น `registerInstructor` จะถูก rules ปฏิเสธเงียบๆ (permission-denied) —
  ดู CLAUDE.md ข้อ 7 เรื่อง rules ต้อง `firebase deploy` เท่านั้นถึงมีผลจริง
- `instructorClaim` เป็นแค่ป้ายช่วยแอดมิน**หา**คน ไม่ใช่ permission gate เอง — ต่อให้ค่านี้หลุด/ถูกปลอมทางไหนก็ตาม
  ผลคือ "โผล่ในคิวแอดมิน" เฉยๆ ไม่ได้ให้สิทธิ์อะไรเพิ่ม (สิทธิ์จริงมาจาก `role==='instructor'` ที่ยังแก้ได้แค่ admin เท่านั้น)
- `pendingInstructors` filter ต้องอ่านจาก source เดียวกับที่ `pendingGuests`/role management list ใช้อยู่แล้ว
  (ดูของเดิมใน AdminView ว่าดึงจาก `members` store ตัวไหน — อย่าเปิด read ใหม่)
- ปุ่ม "ฉันเป็นอาจารย์" กับ "ผู้เยี่ยมชม" ใช้ `guestReason`/`LIMITS.guestReason` ร่วมกัน — ไม่ต้องเพิ่ม limit ใหม่

## ความเชื่อมโยง

- ต่อยอด SP1 ([[2026-06-22-instructor-role-comments-design]]) — SP1 ทำ role + สิทธิ์แก้คลังข้อสอบไว้ครบแล้ว
  งานนี้แก้แค่ "ทางเข้า" ให้ friction ต่ำลง ไม่แตะ permission model ของ SP1 เลย
- ยืนยันแล้ว (16 ก.ย. 2026) ว่า rules ของ SP1 deploy ขึ้น production จริงแล้วตั้งแต่มิ.ย. (เช็คผ่าน
  `firebase deploy --only firestore:rules` แล้วขึ้น "already up to date, skipping upload")
