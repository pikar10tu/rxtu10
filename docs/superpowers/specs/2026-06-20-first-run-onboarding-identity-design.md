# First-run Onboarding & Identity — Design

วันที่: 2026-06-20
สถานะ: อนุมัติดีไซน์แล้ว (รอเขียน implementation plan)

## ปัญหา / ที่มา

ตรวจ first-run ก่อนเปิดตัวจริงแล้วพบว่า **ปัจจุบันไม่มี flow ให้ผู้ใช้ผูก identity เลย** —
`newUserDoc` ตั้ง `studentId/nickname/realName/track = null` และไม่มี UI ตั้งค่าที่ไหน
(MeView แก้ได้แค่รูป/ช่องทางติดต่อ) ผลคือผู้ใช้ใหม่ขึ้นเป็น `?` / `ฉัน` และไม่ถูกจัดเข้า
`members.fbUsers` (ซึ่ง key ด้วย studentId)

นอกจากนี้:
- ผู้ใช้ใหม่ไม่เห็น welcome ใดๆ (MigrationWelcome gate ที่ `migratedV2===true` ซึ่งคนใหม่ไม่มี)
- จอ logged-out คือจอเดียวกับ "เว็บกำลังปรับปรุง" (MaintenanceScreen) → first impression สื่อผิด
- ยังไม่มีฟอร์มยินยอมใช้ข้อมูล (PDPA)

เป้าหมาย: สร้าง flow ครั้งแรกที่ login ที่ (1) ขอ consent (2) ให้ผูกตัวตนนักศึกษาด้วยรหัส
หรือสมัครเป็น guest (รอ admin อนุมัติ) (3) แก้จอ logged-out ให้เป็นหน้า login ที่ถูกต้อง

## ขอบเขต (scope)

อยู่ในขอบเขต:
- Consent gate (PDPA) เป็นด่านแรกสุด
- Onboarding wizard: ผูกตัวตนนักศึกษา (รหัส → roster) หรือสมัคร guest
- จอรออนุมัติ guest + การอนุมัติฝั่ง admin
- จอ login landing แทนจอ "ปรับปรุง" สำหรับ logged-out
- แยก guest ออกจาก list หลักในหน้าสมาชิก (ปุ่มดูแยก)
- admin เห็นอีเมลคนที่ผูกแล้ว + แก้การผูกผิดได้

นอกขอบเขต (ไม่ทำรอบนี้):
- เปลี่ยนชื่อเล่นเอง (นักศึกษาใช้ชื่อเล่นตาม roster, ห้ามแก้)
- Home help / getting-started guide (item 3 จาก audit — แยก track)
- การ re-consent UI ที่ละเอียดกว่า version bump

## แนวทางที่เลือก

**A. Gate ใน App.vue ขับด้วย flag บน user doc** (ตรงกับ pattern เดิม: MaintenanceScreen,
MigrationWelcome เป็น overlay-gate ใน App.vue) — แต่ละ gate เป็นคอมโพเนนต์อิสระ เทสได้
uniqueness ของรหัสใช้ doc `claims/{studentId}` แบบ create-only (atomic ฝั่ง server)

ทางเลือกที่ตัดออก: (B) wizard เดียวจบ — consent แยกไม่ออก + ยังต้องมีจอ pending แยกอยู่ดี ·
(C) route /onboarding + router guard — ซับซ้อนเกินจำเป็นสำหรับแอป hash-routing นี้

## Data model

### `users/{uid}` — เพิ่มใน `data/userSchema.js` USER_DEFAULTS

```js
consent:     { accepted: false, version: null, at: null },  // PDPA
onboarded:   false,        // ผ่าน wizard ผูกตัวตนแล้ว
accountType: null,         // 'student' | 'guest'
guestReason: null,         // เหตุผลเข้าชม (เฉพาะ guest)
guestStatus: null,         // null(ไม่ใช่ guest) | 'pending' | 'approved' | 'rejected'
// studentId / nickname / realName / track มีอยู่แล้ว — wizard เป็นคนเขียน
```

### `claims/{studentId}` — collection ใหม่ (กันจองรหัสซ้ำ atomic)

```js
{ uid, at }   // doc id = รหัสนักศึกษา · create-only: มีแล้วสร้างทับไม่ได้
```

### ค่าคงที่

- `CONSENT_VERSION` ใน `firebase/config.js` (เริ่ม `'2026-06-20'`) — bump เมื่อแก้ข้อความ consent
  → บังคับ consent ใหม่อัตโนมัติ (เทียบ `consent.version !== CONSENT_VERSION`)
- ข้อความ consent เก็บใน `data/consent.js` (ดู/แก้/ย้อน version ได้)

## Flow & หน้าจอ (ลำดับ gate ใน App.vue)

gate แรกที่ "ไม่ผ่าน" คือหน้าจอที่แสดง:

| เงื่อนไข | หน้าจอ |
|---|---|
| ยังไม่ login | **LoginLanding** (แทนจอ "ปรับปรุง" เดิมตอน logged-out) |
| login แล้ว แต่ `consent.version !== CONSENT_VERSION` | **ConsentGate** |
| consent ผ่าน แต่ `!onboarded` | **OnboardingWizard** |
| `accountType==='guest'` และ `guestStatus !== 'approved'` | **GuestPendingScreen** |
| `maintenance` ON และไม่ใช่ academic | **MaintenanceScreen** (เดิม) |
| ผ่านหมด | เข้าแอป |

หมายเหตุ: academic/admin ข้าม maintenance ได้เหมือนเดิม แต่ยังต้องผ่าน consent + onboarding
(หรือ seed ให้ผ่านสำหรับบัญชีที่มีอยู่ — ดู Migration ด้านล่าง)

### ConsentGate
- แสดงข้อความ consent (จาก `data/consent.js`) + checkbox
- ติ๊ก → ปุ่ม "ไปลุยกันเลย! →" เปิดใช้ได้ → เขียน
  `consent { accepted:true, version:CONSENT_VERSION, at:serverTimestamp() }`
- มีปุ่มออกจากระบบ

### OnboardingWizard (2 ขั้น)
แสดง **อีเมลที่กำลังใช้** (`auth.currentUser.email`) เด่นๆ ทุกขั้น
+ ข้อความเตือน "ถ้านี่ไม่ใช่อีเมลที่ต้องการ ออกแล้วเข้าใหม่ด้วยอีเมลที่ถูก"
(กันสับสนอีเมลมหาลัย vs อีเมลส่วนตัว)

1. **เลือกประเภท**: "ฉันเป็นนักศึกษาเภสัช มธ. รุ่น 10" / "ฉันเป็นผู้เยี่ยมชม (guest)"
2a. **student** → กรอกรหัสนักศึกษา → match roster (client-side จาก `data/students.js`)
    - เจอ → โชว์การ์ดยืนยัน "นี่คือคุณ: [ชื่อเล่น] · [ชื่อจริง] · [สาย]" + อีเมล → ปุ่ม "ใช่ ยืนยัน"
      → สร้าง `claims/{รหัส}` (atomic) + เขียน
      `studentId, nickname, realName, track, accountType:'student', onboarded:true`
    - ไม่เจอใน roster → error "ไม่พบรหัสนี้ ลองใหม่อีกครั้ง" (ไม่ตก guest อัตโนมัติ)
    - รหัสถูกจองแล้ว (create `claims` ล้มเพราะ exists) → error "รหัสนี้ถูกใช้ไปแล้ว"
2b. **guest** → กรอกชื่อเล่น + เหตุผลเข้าชม → เขียน
    `nickname, guestReason, accountType:'guest', guestStatus:'pending', onboarded:true`
    → ตกไป GuestPendingScreen

ทุกข้อความที่ผู้ใช้กรอก (ชื่อเล่น guest, เหตุผล) ผ่าน `cleanText(str, LIMITS.xxx)` ก่อนเขียน

### GuestPendingScreen
- `pending`: "รอแอดมินอนุมัติ เดี๋ยวจะเปิดให้เข้าเล่นนะ" + ปุ่มออกจากระบบ
- `rejected`: ข้อความถูกปฏิเสธ + ปุ่มออกจากระบบ

### LoginLanding
- หน้าต้อนรับ + ปุ่ม "เข้าสู่ระบบ" (เรียก `auth.login()`)
- แยกจาก MaintenanceScreen — logged-out ไม่ควรเห็น "เว็บกำลังปรับปรุง"

## เหรียญเริ่มต้น
`STARTER_COINS = 2000` ให้ตอนสร้าง doc เหมือนเดิม (ทั้ง student/guest — guest ได้ใช้จริงเมื่อ approved)

## Firestore rules

### `claims/{studentId}`
```
match /claims/{studentId} {
  allow read:   if isSignedIn();
  allow create: if isSignedIn()
                && request.resource.data.uid == request.auth.uid
                && !exists(/databases/$(database)/documents/claims/$(studentId));
  allow delete: if isAdmin();       // admin ปลดล็อกตอนแก้ผูกผิด
  allow update: if false;
}
```

### `users/{uid}` (ปรับจาก owner-write + guard เดิม)
- field `consent, onboarded, accountType, guestReason, studentId, nickname, realName, track`
  → owner เขียนได้ (self-onboarding)
- `guestStatus` → owner เขียนได้เฉพาะค่า `'pending'` (ตอนสมัคร) ·
  เปลี่ยนเป็น `'approved'/'rejected'` = admin เท่านั้น (กัน guest อนุมัติตัวเอง)
- `role` ล็อก admin-only เหมือนเดิม

หมายเหตุ TOCTOU: query เช็กรหัสซ้ำใน wizard ไว้โชว์ error เร็ว แต่ตัวตัดสินจริงคือ
`exists()` ตอน create `claims` (atomic ฝั่ง server)

⚠️ ต้อง `firebase deploy --only firestore:rules` หลัง build (CLAUDE.md กับดักข้อ 3)

## Admin surface (AdminView)

### (1) การ์ดใหม่ "📨 คำขอ guest (รออนุมัติ)" — แสดงเฉพาะเมื่อมี pending
- list user ที่ `guestStatus==='pending'` → โชว์ ชื่อเล่น · อีเมล · เหตุผลเข้าชม
- ปุ่ม **✓ อนุมัติ** (`guestStatus='approved'`) / **✗ ปฏิเสธ** (`guestStatus='rejected'`)
- ไม่มี pending → ซ่อนการ์ดทั้งใบ

### (2) การ์ด role เดิม (🎓 ทีมวิชาการ) — โชว์อีเมลตลอด + แก้การผูก
- เพิ่มบรรทัดอีเมลให้เห็นทุกแถว (ตอนนี้เป็น fallback เฉยๆ ที่ line 90)
- ปุ่มใหม่ **🔧 แก้การผูก** ต่อแถว → ยืนยันแล้ว: ลบ `claims/{studentId}` +
  ล้าง `studentId/nickname/realName/track/accountType/onboarded` ของ user นั้น
  → ครั้งหน้าที่ login เขาจะเข้า wizard ผูกใหม่

## ผลต่อ members store (`stores/members.js`)
- เปลี่ยนเงื่อนไขแยก guest จาก `track==='guest'` เป็น `accountType==='guest'`
- เพิ่ม `accountType, guestStatus, guestReason` เข้า light subset (slimForCache)
  เพื่อให้ AdminView + MembersView ใช้ร่วมกัน

## MembersView (แยก guest ออกจาก list หลัก)
- list หลัก = นักศึกษาเท่านั้น (roster 83) — ตัด `[...merged, ...guests]` เหลือ `merged`
- ปุ่ม toggle **"👤 ผู้เยี่ยมชม (N)"** ใต้แถว filter
  - แสดงเฉพาะเมื่อมี guest `guestStatus==='approved'` (N = จำนวน) · ไม่มี → ซ่อนปุ่ม
  - กดสลับ list ไป/กลับระหว่างนักศึกษา ↔ guest
  - guest `pending/rejected` ไม่โชว์ให้สมาชิก (เห็นเฉพาะ admin)
- ตัวนับ `registeredCount/roster` คิดจากนักศึกษาเหมือนเดิม
- ProfileModal ของ guest: ไม่มี studentId/track sci-care → โชว์ "ผู้เยี่ยมชม"

## ข้อความ consent (เก็บใน `data/consent.js`)

> **ก่อนเริ่ม ขออนุญาตแป๊บนึงนะ 🌿**
>
> RxTU10 เป็นพื้นที่เล็กๆ ของชาวเภสัช มธ. รุ่น 10 ที่ทำกันเองเพื่อให้พวกเราได้สนุกไปด้วยกัน
> และช่วยกันเตรียมตัวสอบ **ใบประกอบวิชาชีพเภสัชกรรม (CC)** ให้ผ่านไปพร้อมๆ กัน
>
> เพื่อให้ทุกอย่างทำงานได้ เราขอเก็บข้อมูลของคุณนิดหน่อย:
>
> - 🪪 **ตัวตนของคุณ** — ชื่อ อีเมล และรูปจากบัญชี Google ที่ใช้เข้าระบบ พร้อมรหัสนักศึกษา/ชื่อเล่นที่ผูกไว้
> - 🎮 **ความเคลื่อนไหวในเกม** — เหรียญ ความคืบหน้าการอ่านหนังสือ และอื่นๆ ที่ทำให้เล่นต่อได้
> - 👀 **ใครเห็นอะไรบ้าง** — เพื่อนร่วมรุ่นเห็นแค่ชื่อเล่น สาย และเลเวลบ้านของคุณ ส่วนจำนวนเหรียญเก็บเป็นความลับเฉพาะคุณคนเดียว
> - 🛠️ **ช่วยให้เว็บดีขึ้น** — เรานำข้อมูลการใช้งานไปปรับปรุงและพัฒนาเว็บให้ดีขึ้นเรื่อยๆ
> - ✏️ **เปลี่ยนใจได้เสมอ** — อยากแก้หรือลบข้อมูล ทักแอดมินได้ตลอดเลย
>
> ☐ อ่านแล้วน้า ยินดีให้ใช้ข้อมูลตามนี้
>
> ปุ่ม: **ไปลุยกันเลย! →**

## Migration / บัญชีที่มีอยู่แล้ว

บัญชีเดิม (migratedV2) มี studentId/nickname อยู่แล้ว แต่ไม่มี `consent/onboarded/accountType`
→ ต้องไม่บังคับให้คนเก่าทำ wizard ผูกตัวตนซ้ำ — gate logic ใช้ค่า **effective** ไม่ต้องเขียน Firestore ย้อนหลัง:
- `onboardingGate()` ถือว่า onboarded เมื่อ `onboarded===true || !!studentId`
  (คนเก่ามี studentId อยู่แล้ว → ข้าม wizard อัตโนมัติ ไม่ต้อง migrate เขียนค่า)
- ถ้ามี studentId แต่ `accountType` ว่าง → ถือเป็น `'student'` (derived ใน gate/normalize)
- track เดิม `'guest'` (ถ้ามี) → ถือเป็น `accountType:'guest', guestStatus:'approved'` (derived — คนเก่าที่เป็น guest ถือว่าผ่าน)
- **consent ยังต้องขอจากทุกคนรอบแรก** (รวมคนเก่า) — เป็น gate ใหม่ของ PDPA โดยตั้งใจ
  และเป็นค่าเดียวที่ต้อง persist จริงตอนผู้ใช้กดยอมรับ

## Testing
- pure utils ใหม่: `utils/onboarding.js` (เช่น `matchRoster(studentId)`, `validateGuest(input)`,
  `needsConsent(userData, version)`, `onboardingGate(userData)` → คืนชื่อ gate ที่ควรแสดง) + `.test.js`
- ทดสอบ manual บน prod หลัง deploy: บัญชีใหม่ (student เจอ/ไม่เจอ/ซ้ำ), guest (สมัคร→รอ→อนุมัติ),
  บัญชีเก่า (ข้าม wizard แต่เจอ consent), admin แก้การผูก

## สิ่งที่ต้องทำตอน deploy
- `firebase deploy --only firestore:rules` (claims + users guestStatus)
- push master (frontend auto-deploy)
- ไม่มี index ใหม่ (claims query by doc id, pending guests กรองใน client จาก members ที่โหลดอยู่)
