# Spec: ข้อสอบประจำวัน (Daily Challenge — Kahoot-style, async)

วันที่: 2026-06-15 · สถานะ: **ดีไซน์ตกลงแล้ว — คิวสุดท้าย** (ลำดับ: cost → Mailbox → **Daily Challenge**)
**ขึ้นกับ:** ระบบ Mailbox (ใช้ส่งรางวัล) + Phase 1 cost (`rand` field สำหรับสุ่มข้อ)

## คอนเซปต์ (ยืนยันแล้ว)
- ข้อสอบ **5 ข้อ ชุดเดียวกันทั้งรุ่น** ต่อวัน · สุ่มเปลี่ยนใหม่ทุกวัน
- แบบ **async**: เล่นเมื่อไหร่ก็ได้ในวันนั้น (ไม่ใช่ live sync)
- แต่ละข้อ **นับถอยหลัง 30 วิ** · คะแนนแบบ Kahoot (**ถูก + เร็ว = คะแนนสูง**)
- **เล่นได้ครั้งเดียว/วัน** · จบแล้วดู leaderboard ได้
- **รางวัลที่ 1–5 ของวัน** ส่งผ่าน Mailbox

## Data model
- `dailyChallenge/{date}` = `{ date, questions: [ {id, question, choices, answer} ×5 ] (snapshot), createdAt, settled: bool }`
  - เก็บ snapshot กันข้อถูกแก้/ลบกลางวัน + ทุกคนเห็นชุดเดียวกันแน่นอน
- `dailyChallenge/{date}/results/{uid}` = `{ uid, nickname, score, totalMs, correctCount, createdAt }` **create-only / immutable**

## การสร้างชุดประจำวัน — "คนแรกที่เล่นสร้างให้" (lazy, serverless)
- เปิดหน้า → อ่าน `dailyChallenge/{today}`
- ถ้าไม่มี → **transaction create-if-absent**: สุ่ม 5 ข้อจากคลัง `isPublished==true` (ใช้ `rand` window แบบ Phase 1) เขียน doc
- ทุกคนถัดไปอ่าน doc เดิม (1 read/คน/วัน) · ไม่ต้องมี cron/admin
- `today` = วันที่โซน Asia/Bangkok (helper `todayKey()` แนว `quizCoinDate` เดิม)

## คะแนน (Kahoot-style)
- ต่อข้อ: ถ้าถูก `points = round(BASE * (1 - (elapsedMs / 30000) / 2))` (เร็วสุด ~BASE, ช้าสุดครึ่งเดียว), ผิด = 0
- รวม 5 ข้อ = score · เก็บ `totalMs` ไว้ tie-break
- timer/score วัดฝั่ง client (cheatable — trust-based + cheatLog เดิม)

## เล่นครั้งเดียว
- ก่อนเริ่ม: เช็ก `results/{uid}` มีแล้วหรือยัง
- บังคับจริงด้วย rule: `create` only, `update/delete: false` → ส่งซ้ำไม่ได้แม้ล้าง localStorage

## Leaderboard
- query `results` `orderBy score desc, totalMs asc · limit 20` (≈20 reads/ครั้งที่เปิดดู)
- โชว์ผลตัวเอง + อันดับ

## ปิดยอด + รางวัล (admin)
- ปุ่ม admin **"ปิดยอด {date}"** → อ่าน top-5 → **สร้างจดหมายรางวัล**เข้า Mailbox แต่ละคน (type:'reward', reward.coins ตามอันดับ) → set `settled=true`
- จำนวนเหรียญต่ออันดับ = ค่าคงที่ tunable (ใส่ `data/`); ค่าเริ่ม ~ 1:500 2:300 3:200 4:150 5:100 (ปรับเข้า economy)

## Rules
- `dailyChallenge/{date}`: `read: authed` · `create: authed` (lazy) หรือจำกัด field · `update: isAcademic()` (settled flag)
- `results/{uid}`: `read: authed` · `create: authed && reported/uid == auth.uid` · `update/delete: false`

## ข้อควรรู้ / Open
- **Spoiler**: async + ข้อเดียวทั้งวัน → คนเล่นเช้าบอกคนเล่นบ่ายได้ · trust-based ยอมรับถ้ารางวัลพอประมาณ
- ของรางวัลจริง (coins vs +badge) ยังไม่ฟิกซ์ — รอ Mailbox payload
- กัน race ตอน lazy-create ด้วย transaction/create-if-absent
- เทส: pure `quizScore(elapsedMs, correct)`, `dailyPick(docs, R)`, leaderboard sort + `.test.js`
