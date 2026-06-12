# CLAUDE.md — RxTU10 v2

เว็บแอพของชั้นปี (เภสัช มธ. รุ่น 10) — รวมข้อมูลเพื่อน + เกมสะสม/ฟาร์ม + ระบบเตรียมสอบ
Vue 3 + Vite + Pinia + Firebase (Auth/Firestore) · มือถือเป็นหลัก · UI ภาษาไทย · client-only ไม่มี backend

## คำสั่ง

```
npm run dev                              # dev server
npm run build                            # build → dist/
firebase deploy --only hosting           # deploy เว็บ (build ก่อน)
firebase deploy --only firestore:rules   # ⚠️ แก้ firestore.rules แล้วต้อง deploy เสมอ ไม่งั้นไม่มีผล
```
ไม่มี test/lint — ตรวจด้วย `npm run build` + ทดลองใน dev

## สถาปัตยกรรม

```
src/
  firebase/config.js   Firebase init + ADMIN_EMAIL + ค่าคงที่ระบบ (PLE_CC_DATE ฯลฯ)
                       ⚠️ ต้องใช้ initializeFirestore({experimentalForceLongPolling:true})
  stores/auth.js       หัวใจของแอพ — ดูแพทเทิร์น patchUser ด้านล่าง
  stores/members.js    รายชื่อสมาชิก (users ทุกคน + guest จาก data/students.js)
  router/index.js      hash router, lazy routes, reload-guard กัน stale chunk หลัง deploy
  App.vue              ⚠️ launch gate: คนที่ไม่ใช่ academic เห็น MaintenanceScreen (hardcode)
  views/               หน้าละไฟล์: Home Members Play Study Quiz Questions Shop Rank Admin Me Pets
  composables/         useDaily (รายได้ idle) useFarm useResidence useToast useConfirm useGuard
  data/                ค่าคงที่เกมทั้งหมด ปรับตัวเลขที่นี่ (ดู "เศรษฐกิจ")
  utils/               sm2.js (SRS) petUtils.js (รายได้เพ็ท v2) text.js (cleanText+LIMITS) avatar.js
firestore.rules        trust-based + light guards (ownership, role, coin range)
ROADMAP.md             แผนพัฒนาปัจจุบัน + บั๊กที่รู้แล้ว + ข้อเสนอปรับ economy — อ่านก่อนเริ่มงานใหม่
```

## แพทเทิร์นสำคัญ (ทำตามเสมอ)

**เขียน user doc ผ่าน `auth.patchUser(optimistic, server)` เท่านั้น**
- `optimistic` = ค่า local ตรงๆ (อัปเดต UI ทันที), `server` = Firestore patch (ใช้ `increment()`/`serverTimestamp()` ได้)
- ภายในจัดการ blockSnapshot ให้แล้ว (กัน onSnapshot เขียนทับ optimistic state ~1.5s)
- คืน boolean — caller เป็นคน toast เอง

**Roles:** `student | academic | admin` บน user doc · ADMIN_EMAIL ใน config = super-admin ถาวร
gates: `auth.isAdmin`, `auth.isAcademic` (admin ⊃ academic) · user แก้ role ตัวเองไม่ได้ (rules บังคับ)

**ข้อความจากผู้ใช้ทุกช่อง:** ผ่าน `cleanText(str, LIMITS.xxx)` จาก utils/text.js ก่อนเขียนเสมอ

**สไตล์:** คอมเมนต์/commit เป็นไทยปนอังกฤษ · commit รูปแบบ `Area: อะไร (ทำไม)` ·
single-file component + scoped style · สีธีมหลัก indigo (#4f46e5) ใน style.css

## Data model (Firestore)

- `users/{uid}` — ทุกอย่างของผู้เล่นอยู่ใน doc เดียว: coins, residence.level, pets[], activePets,
  farm{plots,inventory}, study.cards{} (SRS), quizHigh/quizCoinDate/quizCoinsToday, tags[], likes
  → schema กลาง: `data/userSchema.js` (USER_DEFAULTS + normalizeUserData) เพิ่มฟิลด์ใหม่ที่นี่ก่อน
- `questions` — คลังข้อสอบ (academic เขียน, นักศึกษาอ่านเฉพาะ isPublished)
- `examSessions` — ผลการทำข้อสอบ (เขียนแล้วแต่ยังไม่มีหน้าอ่าน — ดู ROADMAP Phase 1)
- `news` `feedback` `drugReports` `cheatLogs` — admin triage ใน AdminView
- ⚠️ rules มี `users/*/srsCards` แต่โค้ดจริงเก็บ SRS ใน user doc (`study.cards`) — rules ค้าง

## เศรษฐกิจ (ตัวเลขทั้งหมด tunable)

- รายได้ idle = บ้าน (`data/residence.js` ladder 12 ขั้น) + เพ็ทในคลัง (`utils/petUtils.js`
  RARITY_DAILY_BASE + GRADE_MULTI_V2 — **ตัวจริง**; RARITY.dailyBase/GRADE_MULTI ใน data/index.js คือ legacy)
  สะสมสูงสุด 24 ชม. กดเก็บที่ Home (useDaily)
- ฟาร์ม `data/crops.js` (ปลดล็อกตามเลเวลบ้าน) · กาชา `data/shop.js` · ศักยภาพ `data/potential.js`
- เหรียญจากการเรียน: Quiz 10/ข้อ cap 300/วัน · Study 5/ใบ ⚠️ ยังไม่มี cap (ช่องโหว่ — ROADMAP Phase 0)
- ⚠️ สมดุลปัจจุบันเพี้ยน: ฟาร์มพืชยาว >> รายได้บ้าน, รายได้จากการเรียน ~1% — ตารางวิเคราะห์+ข้อเสนอใน ROADMAP.md

## กับดักที่เคยเจอแล้ว (อย่าทำซ้ำ)

1. login มือถือต้อง `signInWithRedirect` (popup โดนบล็อก) — แก้แล้วใน stores/auth.js อย่า revert
2. Firestore ต้อง force long-polling — เครือข่ายมหาลัย/มือถือบล็อก WebChannel
3. แก้ rules แล้วลืม deploy = ไม่มีผลจริง
4. repo เดียวกันมี 2 ประวัติ: v1 (vanilla JS, GitHub Pages, branch main) และ v2 (โฟลเดอร์นี้, branch master)
5. การ์ด/กระดานของฟีเจอร์ที่ยังไม่เปิด (PvP, หอคอย, ตลาด) มีโครงใน UI แล้ว — อย่าเข้าใจผิดว่า implement แล้ว
