# Economy Step 1 — เศรษฐกิจสกุลเดียว (design spec)

> สถานะ: **อนุมัติดีไซน์แล้ว 17 มิ.ย. 2026** · build = post-launch (Phase 3 ตาม ROADMAP) — เขียน spec ตอนนี้ให้พร้อม lift-and-build
> ที่มา: chunk แรกของ `docs/economy-battle-master-plan.md` (Build Order Step 1) · หมุด cross-cutting (หอคอย/เกรด/battle numbers) **parked** ไป spec Step 2-3

---

## 1. เป้าหมาย + ขอบเขต

**ปัญหา:** สกุลเงินเดียว แต่ฟาร์มพืชยาวเป็น faucet ที่เฟ้อ — ฟาร์มเต็มให้ ~3.5–4× รายได้บ้าน (Lv12 ~220k/วัน vs บ้าน 55k) ทำให้เหรียญด้อยค่า กาชา/sink ไม่มีความหมาย

**เป้า Step 1 (faucet control + ตัวคูณการเรียน):**
1. ดึงฟาร์มเต็มลงเหลือ **≈ 1–1.5× รายได้บ้าน** ที่แต่ละเลเวล
2. ทำ **การเรียน = ศูนย์กลาง** ผ่าน daily quest ที่ปลด **×1.25 รายได้ idle** — เป็น "ตัวคูณ" ไม่ใช่เหรียญดิบ (ไม่ inflate)

**นอกขอบเขต (parked):** กาชา rework, เพ็ท/เกรด, หอคอย, streak escalation, sink ใหม่, market — ทั้งหมดเป็น Step 2-6

---

## 2. การตัดสินใจที่ล็อกแล้ว

| จุด | ตัดสินใจ | เหตุผล |
|---|---|---|
| คุมฟาร์ม | **Cut margin ~55%** (margin-scale formula) ไม่ใช่ cut sellPrice ตรงๆ | cut sellPrice ตรงๆ ทำพืชถูกกำไรติดลบ (ผักกาด seed20/sell45) · margin-scale ทุกพืชยังคุ้ม |
| ไม่ทำ daily cap | ใช้ margin-scale อย่างเดียว | smooth/tunable · ไม่แตะ schema · ไม่มี blunt ceiling |
| Quest trigger | **แต้มเรียนรวม ≥15/วัน** (SRS review + quiz question นับรวม) | ยืดหยุ่น — เลือกติว/ทำข้อสอบ · ลด friction วันที่ SRS due น้อย |
| ตัวคูณ | **×1.25 flat** บน idle (บ้าน+เพ็ท) | ไม่ครอบฟาร์ม (ฟาร์ม active income ที่ cut แล้ว) · ไม่ทำ streak (YAGNI v1) |
| ระยะเวลา | **อิงวัน** (reset พร้อม quiz/study cap) | reuse day-key เดิม กัน counter เพี้ยนคนละ boundary |
| Sink | **คงเดิม** | บ้านถึง 1.42M + grade-up + กาชา พอสำหรับ v1 · sink ลึกผูกกาชา = Step 2 |

---

## 3. Component 1 — Farm rebalance (margin-scale)

**ไฟล์:** `src/data/crops.js` (data อย่างเดียว — ไม่แตะ logic)

**สูตร** (ใช้ตอนคำนวณค่าใหม่ ไม่ใช่ runtime):
```
newSellPrice = seedCost + round((oldSellPrice − seedCost) × k)
```
- `k` = สัดส่วนกำไรที่เหลือ (เช่น k≈0.40 = ตัดกำไร 60%)
- ทุกพืชยังกำไร > 0 เสมอ (margin × k ไม่ติดลบ)
- **ไม่แตะ** `seedCost` / `growMinutes` / `unlockLevel` / `tier` — ดีไซน์ relative (short=สูง/ชม., long=สูงรวม) คงเดิม

**เป้าจูน:** ฟาร์มเต็ม (ทุกแปลง × พืช set-and-forget เด่นของเลเวล) ≈ **1–1.5× รายได้บ้าน ที่แต่ละเลเวล**

**⚠️ k อาจไม่เท่ากันทุก tier:** จากการวิเคราะห์ อัตราเฟ้อต่างกันตามเลเวล (Lv6 ฟาร์มแรงกว่าบ้านยิ่งกว่า Lv12) → อาจต้อง **k ราย tier** (common/rare/epic/legendary) ไม่ใช่ k เดียว

**วิธี finalize ตัวเลข (ตอน implement):** เขียน sim script (สไตล์เดียวกับ `scripts/battle-sim.mjs`) คำนวณ:
- profit/แปลง/วัน ของพืช set-and-forget เด่นแต่ละเลเวล × จำนวนแปลง (จาก `residence.js`)
- เทียบกับ `dailyIncome` ของบ้านเลเวลนั้น → ปรับ k จนได้ 1–1.5×
- output ตาราง before/after ให้ตรวจก่อน lock

> spec ล็อก **"วิธี + เป้า"** — เลข k จริงต่อ tier finalize ใน implementation plan (number pass)

---

## 4. Component 2 — Daily quest ×1.25

### 4.1 Pure helper — `src/utils/dailyQuest.js` (+ `.test.js`)
ฟังก์ชัน pure ไม่มี Firestore/Vue:
- `LEARN_GOAL = 15` (export const, tunable)
- `QUEST_MULTI = 1.25` (export const)
- `addLearnPoints(userData, n, today)` → คืน patch `{ learnPointsToday, questDate }` (reset เป็น n ถ้า `questDate !== today`, ไม่งั้นบวกสะสม)
- `questDone(userData, today)` → bool: `userData.questDate === today && userData.learnPointsToday >= LEARN_GOAL`
- `questMultiplier(userData, today)` → `questDone ? QUEST_MULTI : 1`
- `learnProgress(userData, today)` → `{ points, goal, done }` สำหรับ UI

### 4.2 Schema — `src/data/userSchema.js`
เพิ่มใน USER_DEFAULTS + normalizeUserData:
```js
learnPointsToday: 0,   // แต้มเรียนวันนี้ (SRS review + quiz question)
questDate: '',         // YYYY-MM-DD ของแต้มล่าสุด (reuse key เดียวกับ quiz/studyCoinDate)
```

### 4.3 จุด increment (เขียนผ่าน `auth.patchUser` ตามแพทเทิร์น)
- **SRS review** (`StudyView.vue` ตอนรีวิวการ์ด): +1/การ์ดที่ทบทวน
- **Quiz answer** (`QuizView.vue` ตอนตอบแต่ละข้อ / ส่งชุด): +1/ข้อ
- ใช้ `today = new Date().toISOString().slice(0,10)` (key เดียวกับ quizCoinDate/studyCoinDate ที่มีอยู่)
- merge เข้า patch ที่ทั้งสองหน้าเขียนอยู่แล้ว (ไม่เพิ่ม write round-trip)

> **หมายเหตุ boundary:** key นี้เป็น UTC → reset จริง ~07:00 ไทย (convention เดิมของ quiz/study cap) ไม่ใช่เที่ยงคืนเป๊ะ · เลือก reuse เพื่อให้ learnPoints sync กับระบบที่ป้อนมัน · ถ้าอยากเป็นเที่ยงคืนไทยจริง = cleanup แยก (ย้าย quiz/study/quest พร้อมกัน) ไม่อยู่ใน scope นี้

### 4.4 ตัวคูณใน `src/composables/useDaily.js`
```js
// today = new Date().toISOString().slice(0,10) — key เดียวกับ §4.3
const questMulti = computed(() => questMultiplier(auth.userData, todayKey()))
const ratePerDay = computed(() =>
  Math.round((baseIncome.value + petIncome.value)
    * (1 + bonusPct.value / 100)   // supporter (เดิม)
    * questMulti.value))           // ใหม่ ×1.25 เมื่อ quest done
```
- ครอบ **บ้าน + เพ็ท** เท่านั้น (ฟาร์มแยก ไม่เข้า useDaily)
- stack กับ supporter bonus เดิม (คูณกัน)

---

## 5. Component 3 — UI (รวมใน spec นี้)

**Home (`HomeView.vue`)** — การ์ด/แถบ daily quest:
- progress `{points}/15` (จาก `learnProgress`) + bar
- สถานะ ×1.25: "ติดแล้ววันนี้ ✓" หรือ "อีก {n} แต้ม ปลดโบนัสรายได้ ×1.25"
- ลิงก์/ปุ่มไป Study + Quiz (ทางลัดทำ quest)
- วางใกล้การ์ดเก็บรายได้ idle (useDaily) เพื่อสื่อความเชื่อมโยง "เรียน→รายได้สูงขึ้น"

**useDaily display:** rate ที่โชว์ = รวมตัวคูณแล้ว (โปร่งใส เห็น ×1.25 มีผลจริง) · อาจมี hint เล็กว่าโบนัส quest กำลังทำงาน

---

## 6. ทดสอบ

- **`src/utils/dailyQuest.test.js`** (pure, `node --test`):
  - addLearnPoints: บวกสะสมในวันเดียวกัน
  - addLearnPoints: reset เป็น n เมื่อข้ามวัน (questDate ต่าง)
  - questDone: false ต่ำกว่า 15 / false ถ้า questDate ไม่ใช่วันนี้ / true ครบ 15 วันนี้
  - questMultiplier: 1.25 เมื่อ done, 1 เมื่อไม่ done
- **Farm:** ตรวจด้วย sim script (compute before/after + ratio เทียบบ้าน) — ไม่มี runtime test กลาง
- **Build:** `npm run build` ผ่าน + ทดลอง dev (เก็บ idle เห็น ×1.25 ติดหลังทำ quest)

---

## 7. ไม่แตะ / ความเสี่ยง

- **ไม่แตะ `firestore.rules`** — learnPointsToday/questDate เป็น field ใต้ patchUser เดิม (coin range rule ครอบ, ไม่มีฟิลด์ใหม่ที่ต้อง guard)
- **Migration:** ฟิลด์ใหม่ default 0/'' ผ่าน normalizeUserData → user เดิมไม่ต้อง migrate (อ่านเป็น default)
- **ความเสี่ยงฟาร์ม:** cut margin = nerf รายได้ผู้เล่นปัจจุบัน → **build ตอน post-launch + สื่อสารล่วงหน้า** (ROADMAP จัด Phase 3 อยู่แล้ว) · อาจพิจารณาคืนส่วนต่าง/grandfather ตอนลงมือ
- **boundary 07:00 ไทย** (ข้อ 4.3) — รับรู้ไว้ ไม่ใช่บั๊ก

---

## 8. ลำดับ implement (สำหรับ plan)

1. `utils/dailyQuest.js` + test (TDD, pure ก่อน)
2. `userSchema.js` เพิ่ม 2 ฟิลด์ + normalize
3. increment ที่ StudyView + QuizView (merge เข้า patch เดิม)
4. `useDaily.js` คูณ questMulti
5. UI การ์ด quest บน Home
6. Farm sim script → finalize k → แก้ `crops.js`
7. build + ทดลอง dev
```
