# ข้อสอบประจำวัน v2 — 31 ต.ค. 2026

ทับ `2026-06-15-daily-challenge-design.md` เรื่องรางวัล/คลังสุ่ม · ส่วนอื่นยึดของเดิม

## กติกา (user เคาะ 31 ต.ค.)
- 5 ข้อ ชุดเดียวกันทั้งรุ่น/วัน (วันตามเวลาไทย) · ข้อละ 30 วิ · เล่นได้ครั้งเดียว · เริ่มแล้วออก = จบรอบ
- สุ่มจาก **ข้อที่ผ่านตรวจแล้ว** (isPublished + reviewStatus passed) เท่านั้น
- คะแนน: ถูก = round(1000 − 500 × ms/30000) (500–1000) · ผิด/หมดเวลา = 0 · เสมอ → เวลารวมน้อยกว่าชนะ
- เล่นจบ: 300 🪙/ข้อถูก + แต้มอีเวนต์ตามเรตควิซ · ข้อผิดเข้ากองทบทวน · นับ study.gs
- อันดับ (กดรับหลัง 00:00 ไม่มีแอดมิน): 1=10,000 · 2=7,000 · 3=5,000 · 4–10=2,000 · เสมอที่เส้นตัดได้ทุกคน (อันดับแบบ competition 1,2,2,4) · รับได้ภายใน 7 วัน

## Data
- `dailyChallenge/{YYYY-MM-DD}` = { date, qs[5]{id,question,choices,answer,explanation,pleGroup,domain}, createdAt } · create ครั้งเดียว (transaction) · update/delete ห้าม
- `dailyChallenge/{d}/results/{uid}` = { uid, name, photo, score, ms, correct, ts } create-only
- `dailyChallenge/{d}/claims/{uid}` = { uid, rank, coins, ts } create-only
- user doc `dc: { last: date ที่เล่นล่าสุด, claimed: date ที่รับล่าสุด }`

## Flow
- เปิด /daily: dc.last == วันนี้ → หน้าผล+กระดาน · ไม่งั้น → หน้ากติกา
- มีรางวัลค้าง (dc.last < วันนี้, ≠ claimed, ≤7 วัน) → อ่านผลวันนั้น (score desc limit 30) → คำนวณอันดับ → ติดท็อป = แบนเนอร์กดรับ
- รับ: create claims/{uid} → patchUser coins + dc.claimed
- ทางเข้า: ประตู 🌅 ในหน้าเตรียมสอบ ป้าย "ยังไม่เล่น" / "🏆" / ไม่มีป้าย

## Rules
- read: authed · ชุด create: authed + date == docId + qs.size()==5 · results/claims create: uid == auth.uid ตรงกับ doc id · update/delete ห้าม
- ⚠️ deploy rules ก่อน push

## Pure (+เทส) `utils/dailyChallenge.js`
dayKey · questionScore · rankRows · prizeFor · pendingClaimDay
