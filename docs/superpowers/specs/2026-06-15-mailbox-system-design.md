# Spec: ระบบจดหมาย (Mailbox / Inbox)

วันที่: 2026-06-15 · สถานะ: **ดีไซน์ตกลงแล้ว — คิวหลัง cost track** (ลำดับ: cost → **Mailbox** → Daily Challenge)

## ทำไมต้องมี
โครงสร้างพื้นฐานสำหรับ "ส่งของ/ข่าว/รางวัล" ถึงผู้ใช้ในแอป client-only ที่ rule เขียน user doc ได้เฉพาะ admin/เจ้าของ
- แก้ปัญหา serverless ของการให้รางวัล: ระบบ**ไม่โอนเหรียญตรง ๆ** แต่ส่ง "จดหมายมีของรางวัล" แล้ว**เจ้าของกดรับเอง**
- ใช้ซ้ำได้: รางวัล Daily Challenge, ของขวัญระหว่างเพื่อน, ประกาศแอดมิน, ระบบชดเชย ฯลฯ

## Data model
`users/{uid}/mail/{mailId}` (subcollection):
```
{ type: 'reward'|'gift'|'notice', title, body?,
  reward?: { coins?: number },   // payload กว้าง ขยาย type อื่นทีหลัง
  from: 'system'|'daily'|'admin'|<uid>,
  createdAt, read: bool, claimed: bool }
```

## Rules (กันโกงเป็นหัวใจ)
`users/{uid}/mail/{id}`:
- `read`: เจ้าของ (`request.auth.uid == uid`)
- `create`: **admin เท่านั้น** — owner สร้างเองไม่ได้ (ไม่งั้นเสกเหรียญใส่ตัวเอง)
- `update`: เจ้าของ — แก้ได้แค่ `read`/`claimed` (false→true) ห้ามแก้ `reward`
- `delete`: เจ้าของ หรือ admin

## พฤติกรรม
- **รับรางวัล (claim)** = transaction: อ่าน mail → ถ้า `claimed==false` → `increment` เหรียญตัวเองตาม `reward.coins` (ผ่าน `patchUser`) + set `claimed=true`
  - integrity พึ่ง coin-range guard เดิม + cheatLog (สอดคล้องโมเดล trust-based ของแอป)
- **UI**: ไอคอนกล่องจดหมาย (ที่ header/Home) + badge นับ unread/unclaimed · รายการจดหมาย · ปุ่ม "รับ"
- โหลด mail = อ่าน subcollection ตัวเอง (เบา, ต่อผู้ใช้) — ใส่ guard กันโหลดซ้ำ/cache เบา ๆ ตามแนว members

## เทส
- pure: logic claim (claimed แล้วรับซ้ำไม่ได้, คำนวณ badge unread/unclaimed) + `.test.js`

## Open / ค่อยคิด
- ของรางวัลที่ payload รองรับนอกจาก coins (pet/item/badge) — เพิ่ม type ทีหลัง
- หมดอายุจดหมาย/เก็บกวาดเก่า (อาจให้ admin ลบ หรือ TTL)
