# Spec: Achievement System (core)

วันที่: 2026-06-18 · สถานะ: **ดีไซน์อนุมัติแล้ว** (ผ่าน brainstorming)

## ขอบเขต & ที่มา
ระบบ achievement กลาง (cross-cutting) ที่ระบบอื่นมาเกาะเพื่อแจกความสำเร็จ — ต่างจาก `tags` เดิม (admin แปะมือ) ตรงที่ achievement **ได้อัตโนมัติ** จากการเล่น/แข่ง

**Decompose:** นี่คือ sub-project 1 (core). **Daily Challenge = sub-project 2** ที่จะมาเกาะ (ใช้ awarded path แจก `daily_king`) — แยก spec/แผนต่างหาก ทำหลัง core นี้

**Decisions (brainstorming 2026-06-18):**
- เก็บใน **subcollection** `users/{uid}/achievements` (ไม่ใช่ array ใน user doc — กัน doc บวม/members read บวม ตาม [[rxtu10-architecture]])
- awarded ส่งผ่าน **Mailbox claim** (reuse กลไกเดิม, owner เขียน doc ตัวเอง = rule create=owner เดียว)
- milestone เช็คจากที่เดียว (watcher `userData`) แทนกระจาย check ทุก action
- seed แบบ **tiered** (5/10/25) + v1 **โชว์เฉพาะที่ได้แล้ว** (catalog เต็ม+locked = อนาคต)

---

## 1. Catalog (data-driven) — `src/data/achievements.js`
แมป `{ id: { title, icon, desc, type, dated?, trigger? } }`
- `type: 'milestone'` — `trigger: { stat:'<progressKey>', gte:N }` · ได้ครั้งเดียว
- `type: 'awarded'` — ไม่มี trigger (ระบบ/admin มอบ) · `dated:true` = แจกได้ซ้ำคนละวัน (เก็บ date, title render ต่อท้ายวันที่)
- tier = หลาย entry คนละ `gte` (เช่น `pet_5/pet_10/pet_25`) — ไม่มี logic พิเศษ

```js
export const ACHIEVEMENTS = {
  // ── สะสมสัตว์ (derived: petCount) ──
  pet_5:   { title:'นักเลี้ยงสัตว์',     icon:'🐣', type:'milestone', trigger:{stat:'petCount', gte:5},  desc:'สะสมสัตว์ 5 ตัว' },
  pet_10:  { title:'คอกใหญ่',           icon:'🐾', type:'milestone', trigger:{stat:'petCount', gte:10}, desc:'สะสมสัตว์ 10 ตัว' },
  pet_25:  { title:'สวนสัตว์ส่วนตัว',    icon:'🦁', type:'milestone', trigger:{stat:'petCount', gte:25}, desc:'สะสมสัตว์ 25 ตัว' },
  pet_all: { title:'นักสะสมตัวจริง',     icon:'🏆', type:'milestone', trigger:{stat:'petSpeciesCount', gte:'ALL_SPECIES'}, desc:'สะสมสัตว์ครบทุกชนิด' },
  // ── ทำข้อสอบ (counter: quizDoneTotal) ──
  quiz_10:  { title:'เริ่มติว',     icon:'📝', type:'milestone', trigger:{stat:'quizDoneTotal', gte:10},  desc:'ทำข้อสอบครบ 10 ข้อ' },
  quiz_50:  { title:'ขยันทำโจทย์', icon:'✍️', type:'milestone', trigger:{stat:'quizDoneTotal', gte:50},  desc:'ทำข้อสอบครบ 50 ข้อ' },
  quiz_100: { title:'เซียนข้อสอบ', icon:'🎓', type:'milestone', trigger:{stat:'quizDoneTotal', gte:100}, desc:'ทำข้อสอบครบ 100 ข้อ' },
  // ── แฟลชการ์ด (counter: studyReviewedTotal) ──
  flash_10:  { title:'หัดท่อง',     icon:'📚', type:'milestone', trigger:{stat:'studyReviewedTotal', gte:10},  desc:'ทบทวนแฟลชการ์ด 10 ใบ' },
  flash_50:  { title:'ท่องสม่ำเสมอ', icon:'📖', type:'milestone', trigger:{stat:'studyReviewedTotal', gte:50},  desc:'ทบทวนแฟลชการ์ด 50 ใบ' },
  flash_100: { title:'จำแม่น',      icon:'🧠', type:'milestone', trigger:{stat:'studyReviewedTotal', gte:100}, desc:'ทบทวนแฟลชการ์ด 100 ใบ' },
  // ── ฟาร์ม (counter: farmSalesTotal) ──
  farm_100k: { title:'พ่อค้าผัก',   icon:'🥬', type:'milestone', trigger:{stat:'farmSalesTotal', gte:100000},  desc:'ขายผลผลิตรวม 100,000' },
  farm_500k: { title:'นักธุรกิจ',   icon:'💼', type:'milestone', trigger:{stat:'farmSalesTotal', gte:500000},  desc:'ขายผลผลิตรวม 500,000' },
  farm_2m:   { title:'เจ้าสัวเกษตร', icon:'🏭', type:'milestone', trigger:{stat:'farmSalesTotal', gte:2000000}, desc:'ขายผลผลิตรวม 2,000,000' },
  // ── ใช้จ่าย (derived: totalSpent) ──
  spent_100k: { title:'นักช้อป',   icon:'🛍️', type:'milestone', trigger:{stat:'totalSpent', gte:100000},  desc:'ใช้จ่ายรวม 100,000' },
  spent_500k: { title:'ขาช้อปตัวยง', icon:'💳', type:'milestone', trigger:{stat:'totalSpent', gte:500000}, desc:'ใช้จ่ายรวม 500,000' },
  // ── บ้าน (derived: residenceLevel) ──
  home_max: { title:'เจ้าของคฤหาสน์', icon:'🏰', type:'milestone', trigger:{stat:'residenceLevel', gte:'MAX_RESIDENCE'}, desc:'อัปบ้านถึงระดับสูงสุด' },
  // ── awarded (รอ Daily Challenge — นิยามไว้, ยังไม่มี consumer ใน spec นี้) ──
  daily_king: { title:'ราชาควิซประจำวัน', icon:'👑', type:'awarded', dated:true, desc:'อันดับ 1 ข้อสอบประจำวัน' },
}
```
- `gte: 'ALL_SPECIES'` / `'MAX_RESIDENCE'` = sentinel แทนค่า dynamic → resolve ตอน build progress/catalog (`ALL_SPECIES` = `PETS.length`, `MAX_RESIDENCE` = `MAX_RESIDENCE_LEVEL`) เพื่อไม่ hardcode
- export `ACHIEVEMENTS`, `getAchievement(id)`, `MILESTONES` (entries type milestone)
- **immutable record:** ถ้า `ALL_SPECIES` โตขึ้นภายหลัง คนที่ได้ `pet_all` แล้วเก็บใบเดิมไว้ (subcollection ไม่ลบ) — คนใหม่ต้องครบตามจำนวนใหม่ · ยอมรับได้

## 2. ที่เก็บ (subcollection) + user doc
- `users/{uid}/achievements/{docId}` = `{ achId, date?, earnedAt }`
  - `docId` = `achId` (milestone) · `achId__YYYY-MM-DD` (dated awarded)
- user doc เพิ่ม (flat ตาม convention เดิม เช่น quizHigh/totalSpent ใน `userSchema.js`):
  - `quizDoneTotal: 0` · `studyReviewedTotal: 0` · `farmSalesTotal: 0` (counters สำหรับ milestone)
  - `achievementCount: 0` (denormalize ไว้โชว์เลขบนการ์ดได้โดยไม่อ่าน subcollection)
  - normalize เป็น number ใน `normalizeUserData`

## 3. กลไก trigger (pure + watcher)
`src/utils/achievements.js`:
- `computeProgress(userData, allSpecies)` → object แบนๆ ทุก progressKey:
  `{ petCount, petSpeciesCount, quizDoneTotal, studyReviewedTotal, farmSalesTotal, totalSpent, residenceLevel }`
  - `petCount = (userData.pets||[]).length` · `petSpeciesCount` = distinct `pet.id` · counters อ่านตรง · `residenceLevel = userData.residence?.level||1`
- `resolveGte(trigger, ctx)` → แปลง sentinel (`'ALL_SPECIES'`→ctx.allSpecies, `'MAX_RESIDENCE'`→ctx.maxResidence) เป็นเลข
- `checkMilestones(progress, earnedIds, ctx)` → array ของ achId ใหม่ (type milestone, `progress[stat] >= resolveGte` และไม่อยู่ใน earnedIds)
- เทส pure ครบ (ดู §7)

**granting (centralized):** composable `useAchievements()` init ใน `App.vue` (แนว `initAppConfig`)
- ตอน login: โหลด earnedIds จาก subcollection ครั้งเดียว → เก็บ in-memory Set (usage.track)
- **รอบแรกหลังโหลด earnedIds = backfill เงียบ:** run `checkMilestones` หนึ่งครั้ง → grant ทุก id ที่เข้าเกณฑ์อยู่แล้ว **แบบไม่ประกาศ** (เขียน subcollection + นับ แต่ไม่เด้ง balloon/news) แล้วตั้ง flag `announceOn=true`
  - **เหตุผล:** กัน flood ตอน feature เปิดครั้งแรก — ผู้เล่นเก่าเข้าเกณฑ์ย้อนหลังหลายใบพร้อมกัน
- `watch(auth.userData)` หลังจากนั้น: `computeProgress` → `checkMilestones(progress, earnedIds, ctx)` → ถ้ามี id ใหม่ → เรียก `grantAchievement(achId)` (ดู §7)
  - **กัน loop:** อัปเดต Set ทันทีก่อน write → achievementCount เปลี่ยน (userData refire) จะไม่เจอ id ใหม่

## 4. counters — เพิ่ม increment 1 บรรทัด/จุด (ผ่าน patchUser server `increment()`)
- `QuizView.vue finish()` → `quizDoneTotal: increment(answered.value)` (จำนวนข้อที่ตอบในชุด)
- `StudyView.vue grade()` → `studyReviewedTotal: increment(1)` (ต่อการให้คะแนน 1 ใบ)
- `useFarm.js sell()` + `sellAll()` → `farmSalesTotal: increment(gain)` (เหรียญจากการขาย)
- `totalSpent` มีอยู่แล้ว (ใช้ตรง) · `residenceLevel`/`petCount` derive จาก field ที่มีอยู่ (ไม่ต้องเพิ่ม)

## 5. awarded path (Mailbox extension)
- `utils/mailbox.js`: `mail.reward` รองรับ `achievement: { id, date? }` เพิ่มจาก `coins`
- `stores/mailbox.js claim()` transaction: นอกจาก increment coins → ถ้า `reward.achievement` มี: `setDoc users/{uid}/achievements/{docId}` ({achId, date?, earnedAt}) + `achievementCount: increment(1)` (ใน transaction เดียว, idempotent — claimed flag กันรับซ้ำอยู่แล้ว)
- consumer ใน v1: **admin broadcast** (`buildBroadcastMail`) เพิ่ม optional `achievement` → AdminView form มีช่องเลือก achievement แนบ (ทำให้ awarded path ใช้ได้จริง + ทดสอบได้ทันที ก่อน Daily Challenge)
- `daily_king` (dated) จะถูกแจกโดย Daily Challenge settle (sub-project 2) ผ่าน path เดียวกันนี้

## 6. แสดงผล (v1 = เฉพาะที่ได้แล้ว)
- `src/components/shared/AchievementGrid.vue` (แนว `TagChips`): props `uid` → โหลด subcollection `users/{uid}/achievements` orderBy earnedAt desc → grid ไอคอน+ชื่อ (dated ต่อท้ายวันที่ผ่าน `achievementTitle(def, date)`) · tooltip = desc
- วาง: `MeView.vue` (ของตัวเอง) + `ProfileModal.vue` (ดูคนอื่น) ใกล้ `TagChips` เดิม
- empty state: "ยังไม่มีความสำเร็จ — เริ่มเล่นเพื่อปลดล็อก!"
- หน้า catalog เต็ม+locked = **out of scope v1**

## 7. ปลดล็อก UX: balloon + กระดานข่าว + ปุ่มเคลียร์ (admin)
**shared announce helper** `grantAchievement(achId, date?)` (ใน `useAchievements`) — เรียกทั้งจาก self-grant watcher และหลัง mail `claim()` สำเร็จ:
1. เขียน subcollection (ถ้ายังไม่เขียน — claim เขียนใน transaction แล้ว ก็ข้าม) + `achievementCount: increment(1)` + เพิ่มเข้า earnedIds Set
2. **ถ้า `announceOn`** → (a) เด้ง balloon (b) โพสต์ news · backfill รอบแรก = ข้ามทั้งสอง

**(a) Balloon ด้านบน** — `components/shared/AchievementBalloon.vue` mount ที่ `App.vue` root (singleton, แยกจาก Toast):
- composable `useAchievementBalloon()` singleton: `queue: ref([])`, `celebrate({title, icon})` push เข้า queue
- component แสดงทีละใบจาก queue (banner ลอยบนสุด, animation เด้งเข้า/ออก, auto-dismiss ~4s, แตะปิดได้) — โชว์ "🎉 ปลดล็อก: <Emoji icon> <title>"
- emoji ผ่าน `<Emoji char>` เสมอ (กัน tofu)

**(b) กระดานข่าว** — โพสต์ลง `news` collection:
- `addDoc(news, { msg: '<nickname> ปลดล็อก "<title>"', icon: <achievement icon>, type:'achievement', uid, ts: serverTimestamp() })`
- NewsBoard เดิม render ได้เลย (มี `icon`/`msg`/`ts`) — ไม่ต้องแก้ NewsBoard
- title ของ news เป็น text ฝัง emoji ไม่ได้ (NewsBoard render `{{ n.msg }}`) → **msg ไม่ใส่ emoji**, ไอคอนไปที่ field `icon` (render ผ่าน `<Emoji>` แล้วใน NewsBoard line 18)

**(c) ปุ่มเคลียร์กระดานข่าว (admin)** — AdminView (มี post + ลบทีละอันอยู่แล้ว):
- เพิ่มปุ่ม "🧹 เคลียร์ข่าวทั้งหมด" → ConfirmModal → `getDocs(news)` → `writeBatch` ลบ (chunk 500) → reload newsList
- reuse `useConfirm` + pattern `commitInChunks` ที่มีในโปรเจกต์

**Cost/abuse note:** เปิด news ให้ user สร้าง (เฉพาะ type 'achievement') = ทุกปลดล็อก +1 write, ทุกคนอ่าน news 10 docs/เปิด Play · volume รับได้สำหรับ 1 รุ่น · backfill เงียบกัน flood ตอนเปิด · ปุ่มเคลียร์จัดการสะสม · abuse = vanity spam เท่านั้น (สร้างได้แค่ type achievement, trust-based ตามทั้งแอป)

## 8. Rules + เทส
- rules `users/{userId}/achievements/{id}`: `read: request.auth != null` (ดูโปรไฟล์คนอื่นได้) · `create: request.auth.uid == userId` (เจ้าของเท่านั้น — ครอบทั้ง self-grant และ claim) · `update, delete: false` (immutable)
- rules `news/{newsId}` แก้ `create` ให้ user โพสต์ achievement-news ได้ (เดิม admin เท่านั้น):
  ```
  allow create: if isAdmin()
    || (request.auth != null
        && request.resource.data.type == 'achievement'
        && request.resource.data.msg is string && request.resource.data.msg.size() <= 140
        && request.resource.data.keys().hasOnly(['msg','icon','type','uid','ts']));
  ```
  delete คง `isAdmin()` (ปุ่มเคลียร์), update คง false
  - ⚠️ ต้อง `firebase deploy --only firestore:rules`
- ไม่ต้องมี composite index (subcollection orderBy earnedAt = single-field auto index · news orderBy ts มี index เดิม)
- เทส pure (`node --test`):
  - `utils/achievements.test.js`: `computeProgress` (petCount/species/derive), `resolveGte` (sentinel), `checkMilestones` (ถึงเกณฑ์/ยังไม่ถึง/กัน earned ซ้ำ/tier หลายใบพร้อมกัน), `achievementTitle` (dated ต่อวันที่), `buildAchievementNews(nickname, def, date)` (msg ไม่มี emoji, icon แยก field)
  - `utils/mailbox.test.js`: เพิ่มเคส `reward.achievement` ใน builder/claim helper (pure ส่วนที่แยกได้)

---

## Out of scope (v1)
- หน้า catalog เต็ม + locked + progress bar
- Daily Challenge เอง (sub-project 2 — เกาะ awarded path นี้)
- tiered แบบ auto-upgrade ใบเดียว (ใช้หลาย entry แทน)
- achievement ที่ผูก PvP/หอคอย (ฟีเจอร์ยังไม่เปิด)

## หลักการที่ยึด
- pure util + `node --test` ทุกส่วนที่มี logic
- ไม่เพิ่ม dependency
- เพิ่ม field user doc → `userSchema.js` ที่เดียว · เขียน user doc ผ่าน `patchUser` เท่านั้น
- subcollection โหลด on-demand (ไม่บวม user doc / members read)
- trust-based self-grant (ตาม stance ทั้งแอป — badge เป็น cosmetic, แรงจูงใจโกงต่ำ)
