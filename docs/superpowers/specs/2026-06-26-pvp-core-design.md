# Async PvP — Core (เครื่องยนต์ซีซั่นรายเดือน) · Spec

วันที่: 2026-06-26 · สถานะ: ออกแบบ (รออนุมัติ)

## บริบท & เป้าหมาย

แอปชั้นปี (~83 คน) มีวงจรกระตุ้นรายวัน (เดลีเควส/รายได้/เรียน) และโปรเกรส (หอคอย/เพ็ท/บ้าน) ครบแล้ว
แต่ขาด **"การแข่งวนซ้ำรายเดือน"** — เครื่องยนต์ที่ทำให้เพื่อนๆ กลับมาดันกันใหม่ทุกเดือนแบบรีเฟรชตัวเองได้

ตัวเลือกที่ตัดสินแล้ว (จาก brainstorm): **ไม่ใช้การรีหอคอยเป็นตัวกระตุ้น** (หอคอยถูกแก้จบ + รีเซ็ตคือลงโทษ)
ใช้ **async PvP** แทน เพราะคู่ต่อสู้ = ทีมเพื่อนที่พัฒนาตลอด → เล่นซ้ำได้ไม่จบ และ engine
`simulateBattle(teamA, teamB, seed)` รองรับ team-vs-team อยู่แล้ว

**ขอบเขต spec นี้ = ซับโปรเจกต์ (1) แกน PvP เท่านั้น:** combat loop + เรต + state ซีซั่น + เลือกคู่ (คน+บอท)
**นอกขอบเขต (ทำเป็นสเปกแยกภายหลัง):** (2) ลีดเดอร์บอร์ด UI เต็ม · (3) รางวัลซีซั่น + ดิวิชั่น/ทีเยอร์

## หลักการออกแบบที่ยึด

1. **Firestore แทบไม่เพิ่มต้นทุน** (memory flag เรื่อง cost) — ไม่มี collection ใหม่, ไม่มี cross-user write
2. **rules ไม่ต้องแก้/deploy** — `pvp` เป็น field บน user doc เจ้าของ (เหมือน `incomeBuffUntil`)
3. **ไม่ลงโทษ** — โปรเกรสถาวร (เพ็ท/เกรด/หอคอย) ไม่ถูกแตะ · รีแค่เรตซีซั่นแบบ soft
4. **บอท = ซ้อม ไม่ใช่บันได** — เพิ่มความหลากหลาย/คู่สู้เสมอ แต่ไม่ทำลายการแข่งสังคม
5. **pure logic + เทส** ตามแพทเทิร์น utils ของโปรเจกต์

## โมเดลหลัก: Attack-only ladder

- ทุกคนมี **"ทีมรับ" = snapshot ของ `activePets`** (อัปเดตอัตโนมัติเมื่อจัดทีม — ไม่มี state แยก)
- ผู้เล่น **"บุก"** ทีมรับของคนอื่น → `simulateBattle(myTeam, oppSnapshot, seed)` · ชนะ = เรตขึ้น, แพ้ = เรตลงนิดหน่อย
- **เรตขยับเฉพาะตอนเราบุกเอง** (เขียน user doc ตัวเองเท่านั้น) → ไม่มี cross-user write
  - ผลข้างเคียงที่ยอมรับ: ตอนทีมเราถูกคนอื่นบุก เราไม่เสีย/ได้เรตสด (defense ไม่กระทบเรตเรา) — แลกกับต้นทุน/ความเรียบของ rules
- **ลิมิตบุกคนจริง ~5 ครั้ง/วัน** (รีเซ็ต write-time ตามวันที่ เหมือน `studyCoinDate`) → คุมต้นทุน + กันผู้นำวิ่งหนี
- **ดู replay ได้** (reuse `BattleReplay.vue`) — ของเล่นโซเชียล "เราชนะนาย!"

## บอทในพูลคู่ต่อสู้

- พูลคู่ต่อสู้ = **คนจริงเรตใกล้กัน (จาก members cache)** + **บอท 1–2 ตัว** (โชว์รวม ~5 ตัวเลือก)
- บอทสร้างแบบ procedural (สเกลตามเรตผู้เล่น) — แนวเดียวกับ `getFloorTeam` ใน `towerFloors.js`
- **บอท = ซ้อม:** ชนะบอท → ได้**เหรียญน้อย** (ไม่ขยับเรต, ไม่นับ win สังคม) · **สู้ไม่จำกัดจำนวน** + **ไม่กินโควต้าบุกคนจริง**
  - ⚠️ กันฟาร์มเหรียญไม่จำกัด: **เหรียญจากบอทมีเพดาน/วัน** (แพทเทิร์นเดียวกับ `studyCoinsToday`/`quizDailyCap`) — เกินเพดานยังสู้/ดู replay ได้แต่ไม่ได้เหรียญ
- เหตุผล: คู่สู้เสมอ + มือใหม่มีที่ซ้อม แต่ลีดเดอร์บอร์ดยังเป็นการแข่งคนจริงล้วน

## Data model (เพิ่มใน `data/userSchema.js`)

```js
pvp: {
  rating: 1000,     // เรตเริ่มต้น (Elo-ish)
  wins: 0,          // ชนะคนจริง (สะสมในซีซั่น)
  losses: 0,
  seasonId: null,   // ซีซั่นล่าสุดที่เล่น (YYYY-MM) — ใช้ lazy reset
},
pvpAttackDate: null,   // YYYY-MM-DD (local) รีโควต้าบุกรายวัน
pvpAttacksUsed: 0,     // จำนวนบุกคนจริงที่ใช้ไปวันนี้
pvpBotCoinDate: null,  // YYYY-MM-DD (local) รีเพดานเหรียญบอทรายวัน
pvpBotCoinsToday: 0,   // เหรียญจากบอทที่ได้ไปวันนี้ (cap กันฟาร์ม)
```
- normalize: `{ ...USER_DEFAULTS, ...data }` + deep-default `pvp` (เหมือน `dailyQuest`)
- เพิ่ม `pvp` เข้า **light subset ใน `members.js`** (เหมือน `towerBest`) → ลีดเดอร์บอร์ด/พูลคู่ derive จาก cache เดิม = ไม่มี read เพิ่ม

## ซีซั่น & รีเซ็ต (lazy, ไม่มี batch)

- **seasonId = เดือนปฏิทินปัจจุบัน** `YYYY-MM` (local) → ขึ้นเดือนใหม่ = ซีซั่นใหม่อัตโนมัติ **ไม่ต้องมี config/admin/cron**
- ตอนจะบุกครั้งแรกของซีซั่นใหม่ (`pvp.seasonId !== currentSeason`): **soft reset** ก่อนคิดผล
  - `rating = round(BASE + (rating − BASE) × SOFT_KEEP)` (เช่น BASE=1000, SOFT_KEEP=0.5 → บีบเข้ากลางครึ่งทาง)
  - `wins=0, losses=0, seasonId=currentSeason`
  - เขียนตอนเล่นจริง (write-time) — ไม่ต้องไล่เขียนทุก user

## ระบบเรต (pure util ใหม่ `utils/pvpRating.js` + เทส)

```
expectedScore(my, opp) = 1 / (1 + 10^((opp − my) / 400))
nextRating(my, opp, won, K=32) = round(my + K × ((won?1:0) − expectedScore(my, opp)))   // clamp ≥ RATING_FLOOR
```
ชนะคนแกร่งกว่า = ได้เยอะ · แพ้คนอ่อนกว่า = เสียเยอะ → ปรับสมดุล "คนนำ vs คนตาม" ในตัว

## การเลือกคู่ (pure util `utils/pvpMatch.js` + เทส)

`pickOpponents(meUid, myRating, members, bots, rng)`:
- กรองคนจริง: มี `activePets` ≥1, ไม่ใช่ตัวเอง, เรียงตาม |rating − myRating| เอาใกล้สุด ~4 คน
- เติมบอท 1–2 ตัว (สเกลตามเรต) → คืนลิสต์ ~5 (flag `isBot`)
- deterministic เทสได้ (ฉีด rng)

## บอทเจน (pure util `utils/pvpBot.js` หรือ reuse แนว `getFloorTeam`)

`getPvpBot(rating, seed)` → ทีม 4 ตัว rarity/grade สเกลตามเรต + ชื่อ/อีโมจิบอท · deterministic

## Flow การบุก (composable `useArena.js`)

1. โหลด: ถ้า `pvp.seasonId !== currentSeason` → เตรียม soft-reset (apply ตอนเขียนครั้งแรก)
2. โชว์เรต/โควต้า/พูลคู่ต่อสู้
3. กดท้า → `simulateBattle(myTeam, oppSnapshot, Date.now())` → เปิด `BattleReplay`
4. จบ replay → `patchUser` (เขียน doc ตัวเองอย่างเดียว):
   - **คนจริง:** `pvp.rating = nextRating(...)`, `wins/losses++`, `pvpAttacksUsed++` (+ soft-reset ถ้าซีซั่นใหม่)
   - **บอท:** `coins += grant` โดย `grant = clamp(reward, 0, capเหลือวันนี้)` (reuse แนว `quizGrant`), อัปเดต `pvpBotCoinsToday`, ไม่แตะเรต, ไม่กินโควต้าคนจริง
5. โควต้าหมด → ปุ่มบุกคนจริงปิด (ยังซ้อมบอทได้)

## UI ขั้นต่ำ (spec นี้) — "สนามประลอง (Arena)"

หน้า/แท็บใหม่ (route lazy) แสดง: เรตปัจจุบัน + โควต้าบุกที่เหลือ + การ์ดคู่ต่อสู้ ~5 (คน/บอท มี badge) + ปุ่มท้า → replay → ผล
**ลีดเดอร์บอร์ดเต็ม + รางวัลซีซั่น = ซับโปรเจกต์ (2)/(3)** (spec นี้แค่ทำให้เล่น/เทสได้ครบลูป)

## ความปลอดภัย (rules)

- `pvp`, `pvpAttackDate`, `pvpAttacksUsed`, `coins` = field บน user doc เจ้าของ → ครอบด้วย rules เดิม (owner write + coins guard)
- **ไม่ต้องแก้/deploy rules** · trust-based ตามแนวทั้งแอป (PvE/PvP client-only ปลอม snapshot ตัวเองได้ = ยอมรับสำหรับแอปชั้นปี)

## เทส (node --test, pure)

- `pvpRating.test.js`: expectedScore สมมาตร, ชนะคนแกร่ง > ชนะคนอ่อน, clamp floor
- `pvpMatch.test.js`: เลือกคนเรตใกล้สุด, ตัดตัวเอง/คนไม่มีทีม, เติมบอทครบจำนวน, deterministic
- `pvpBot.test.js`: คืน 4 ตัวเสมอ, สเกลตามเรต, deterministic
- ซีซั่น soft-reset: pure helper `applySeasonReset(pvp, currentSeason)` มีเทส (บีบเข้ากลาง, รี wins/losses, stamp seasonId)
- เพดานเหรียญบอท: pure helper (เช่น reuse `quizGrant`) มีเทส (clamp 0..capเหลือ, ข้ามวันรีเซ็ต)
- UI/flow: manual ใน dev

## ลำดับถัดไปหลัง spec นี้

(2) ลีดเดอร์บอร์ด UI (derive จาก members cache) → (3) รางวัลซีซั่น + ดิวิชั่น + สรุปจบเดือน
