# Copy/Voice Rewrite Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** ปรับ "เสียง" ของข้อความทั่วเว็บให้เป็นกันเอง อธิบายฟังก์ชันชัด ตัดคำหวือหวา/โอ้อวด โดยไม่แตะ logic

**Architecture:** เป็นงาน copy ล้วน — แก้ string literals ในเทมเพลต `.vue`, `data/*.js`, และ toast เท่านั้น สร้างเอกสาร `docs/voice-guide.md` เป็นแหล่งอ้างอิงโทนถาวร แล้วกวาดแก้ทีละกลุ่มไฟล์ตาม Voice Guide + Glossary

**Tech Stack:** Vue 3 SFC, Pinia, ไม่มี test runner กลาง — verify ด้วย `npm run build` + grep banned words

## Global Constraints

ทุก task ยึดข้อจำกัดเหล่านี้ (คัดจาก spec `docs/superpowers/specs/2026-06-28-copy-voice-rewrite-design.md`):

**Voice Guide (6 ข้อ):**
1. พูดกับผู้เล่นตรง ๆ ว่า "คุณ" — สุภาพแต่เป็นกันเอง
2. บอกก่อนว่า "นี่คืออะไร ทำอะไรได้" แล้วค่อยบอกวิธีใช้
3. ตัดคำโอ้อวด/หวือหวา (เก๋า, เทพ, เซียนในคำอธิบาย, สุดยอด, ปัง, อลังการ, จัดเต็ม, "ไม่มีใครรอด")
4. ใช้คำที่เข้าใจทันที — ศัพท์เกม/อังกฤษลอย ๆ ต้องขยายความครั้งแรกที่เจอ
5. สั้น กระชับ หนึ่งความคิดต่อประโยค
6. flavor เก็บความอบอุ่น/ยินดีได้ แต่อิงสิ่งที่ผู้เล่นทำจริง ไม่เคลมเกินจริง

**Glossary:** เก๋า/ปัง/อลังการ/จัดเต็ม/สุดยอด → ตัด หรือบอกผลลัพธ์จริง · เซียน/เทพ ในคำอธิบาย → เก่ง/ขยัน/ชำนาญ (คงได้เฉพาะใน achievement title) · เคลมเว่อร์ → อิงสิ่งที่ทำจริง

**ห้ามแตะ:** logic, ตัวเลขเศรษฐกิจ, ชื่อฟิลด์ schema, ชื่อ route/id, ชื่อเพ็ท/พืช/โรค/หมวด (data identity)

**emoji:** ห้ามเพิ่ม emoji ใหม่ลง JS string (toast/ternary) — ทำให้ tofu; ถ้าจำเป็นต้องผ่าน `<Emoji>` ในเทมเพลตเท่านั้น

**verify ทุก task:** `npm run build` ต้องเขียว · diff ต้องเป็น string literal เท่านั้น (ไม่เปลี่ยน identifier/ฟิลด์/route)

**commit style:** `Copy: <ไฟล์/กลุ่ม> — <อะไร>` ลงท้ายด้วย `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`

---

### Task 1: สร้าง voice-guide.md + ลิงก์จาก CLAUDE.md

**Files:**
- Create: `docs/voice-guide.md`
- Modify: `CLAUDE.md` (ส่วน "สไตล์")

**Interfaces:** ไม่มี (เอกสาร)

- [ ] **Step 1: เขียน `docs/voice-guide.md`**

ใส่เนื้อหา: หลักการ 6 ข้อ + ตาราง Glossary + ตาราง before/after (คัดจาก Global Constraints ด้านบน + ตัวอย่างใน spec) + ประโยคเปิดว่า "เอกสารนี้เป็นแหล่งอ้างอิงโทนข้อความของเว็บ — เพิ่ม/แก้ copy ฟีเจอร์ใหม่ให้ยึดไกด์นี้"

- [ ] **Step 2: เพิ่มบรรทัดใน `CLAUDE.md` ส่วน "สไตล์"**

เพิ่มบรรทัด: `· โทนข้อความผู้ใช้: ยึด docs/voice-guide.md (เป็นกันเอง อธิบายฟังก์ชันชัด ไม่ใช้คำหวือหวา)`

- [ ] **Step 3: Build + commit**

```bash
npm run build && git add docs/voice-guide.md CLAUDE.md && git commit -m "Copy: เพิ่ม voice-guide.md + ลิงก์จาก CLAUDE.md"
```
Expected: build เขียว

---

### Task 2: `data/guide.js` (เนื้อหาปุ่ม ? ทั้ง 12 หัวข้อ)

**Files:**
- Modify: `src/data/guide.js`

**Interfaces:** ไม่แตะ key/icon/title structure — แก้เฉพาะ string ใน `body[]` และ flavor

- [ ] **Step 1: อ่านทั้งไฟล์** เพื่อเห็น 12 หัวข้อครบ (play, residence, income, pets, farm, study, quiz, shop, tower, potential ฯลฯ)

- [ ] **Step 2: แก้จุดที่รู้แน่ (offenders)**

`residence.body` บรรทัด "เป็นเครื่องวัดความเก๋าของคุณ":
- ก่อน: `'เลเวลบ้านจะโชว์บนโปรไฟล์ให้เพื่อนเห็น เป็นเครื่องวัดความเก๋าของคุณ',`
- หลัง: `'เลเวลบ้านจะโชว์บนโปรไฟล์ให้เพื่อนเห็นว่าคุณเล่นมาถึงไหนแล้ว',`

- [ ] **Step 3: กวาดทั้งไฟล์ตาม Voice Guide** — อ่านทุก `body[]` ตัดคำใน Glossary, ทำให้แต่ละบรรทัดบอกฟังก์ชันชัด/สั้น/หนึ่งความคิด · คงเนื้อหาเทคนิค (เช่น กติกาธาตุเป่ายิงฉุบใน tower, สูตรเหรียญ) ครบถ้วน ห้ามตัดข้อมูล

- [ ] **Step 4: ตรวจไม่มีคำ banned หลงเหลือ**

```bash
grep -nE "เก๋า|ปัง|จัดเต็ม|อลังการ|สุดยอด" src/data/guide.js
```
Expected: ไม่มีผลลัพธ์

- [ ] **Step 5: Build + commit**

```bash
npm run build && git add src/data/guide.js && git commit -m "Copy: guide.js — ตัดคำหวือหวา + ปรับคำอธิบายให้ชัด"
```

---

### Task 3: `data/achievements.js` (flavor 17 อัน)

**Files:**
- Modify: `src/data/achievements.js`

**Interfaces:** แก้เฉพาะค่า `flavor:` — คง `title`/`icon`/`type`/`trigger`/`desc` เดิมทุกอัน

- [ ] **Step 1: แก้ flavor ที่เคลมเว่อร์ (offenders ที่รู้แน่)**

```
pet_all:    'ครบทุกชนิด ไม่มีตัวไหนรอด!' → 'สะสมครบทุกชนิดแล้ว เก่งมาก'
quiz_10:    'ก้าวแรกของเส้นทางเซียน'      → 'เริ่มทำข้อสอบแล้ว ก้าวแรกที่ดี'
quiz_100:   'ข้อสอบเห็นแล้วต้องหลบ'        → 'ทำข้อสอบมา 100 ข้อ ขยันสุด ๆ'
daily_king: 'วันนี้ทั้งรุ่นต้องยอม'         → 'ทำคะแนนข้อสอบประจำวันได้อันดับ 1'
```

- [ ] **Step 2: ทบทวน flavor ที่เหลือตาม Voice Guide** — อันที่อบอุ่น/อิงจริงอยู่แล้วเก็บไว้ (เช่น flash_50 'สม่ำเสมอคือกุญแจ', spent_100k 'เงินมีไว้ใช้ ไม่ได้มีไว้กอด') · ปรับเฉพาะอันที่ยังเคลม/หวือหวา ให้อิงสิ่งที่ทำจริง · **คง title สนุกทั้งหมด** (เซียนข้อสอบ/เจ้าสัวเกษตร/เจ้าของคฤหาสน์ ฯลฯ)

- [ ] **Step 3: Build + commit**

```bash
npm run build && git add src/data/achievements.js && git commit -m "Copy: achievements flavor — ตัดคำเคลม อิงสิ่งที่ผู้เล่นทำจริง"
```

---

### Task 4: `data/index.js` (pet flavor — light-touch)

**Files:**
- Modify: `src/data/index.js` (เฉพาะ `flavor:` ของรายการเพ็ท)

**Interfaces:** แก้เฉพาะ `flavor:` ที่หลุดโทน — คง name/emoji/rarity/element/hatchMins และ lore เชิงบรรยายที่ดีอยู่แล้ว

- [ ] **Step 1: อ่าน flavor เพ็ททุกตัว** (`grep -nE "flavor:" src/data/index.js`)

- [ ] **Step 2: แก้เฉพาะตัวที่มีคำ Glossary หรือเคลมเว่อร์** — lore เชิงบรรยาย (เช่น "ราชาแห่งเวหา ปีกครึ่งอินทรีครึ่งสิงห์") เป็น flavor ที่ดี เก็บไว้ · ห้ามแตะชื่อเพ็ท

- [ ] **Step 3: ตรวจ + Build + commit**

```bash
grep -nE "เก๋า|ปัง|จัดเต็ม|อลังการ|สุดยอด" src/data/index.js
npm run build && git add src/data/index.js && git commit -m "Copy: pet flavor — เก็บ lore ตัดคำหวือหวาเฉพาะจุด"
```
Expected grep: ไม่มีผลลัพธ์

---

### Task 5: Onboarding / Consent (จุดแรกที่ผู้ใช้เจอ)

**Files:**
- Modify: `src/components/onboarding/ConsentGate.vue`, `src/components/onboarding/OnboardingWizard.vue`, `src/components/onboarding/GuestPendingScreen.vue`, `src/components/onboarding/MigrationWelcome.vue`

**Interfaces:** ไม่แตะ props/emit/logic — เฉพาะ text ในเทมเพลต

- [ ] **Step 1: แก้ offender ที่รู้แน่** — `MigrationWelcome.vue` `<div class="mw-note">`:
  - ก่อน: `ความมั่งคั่งเดิมของคุณถูกแปลงเป็นเลเวลที่อยู่อาศัย — ยิ่งสูงยิ่งเก๋า!`
  - หลัง: `ความมั่งคั่งเดิมของคุณถูกแปลงเป็นเลเวลที่อยู่อาศัยแล้ว — ยิ่งอัปสูง รายได้ต่อวันยิ่งเยอะ`

- [ ] **Step 2: อ่านแต่ละไฟล์ แก้ข้อความที่ผู้ใช้เห็นตาม Voice Guide** — หัวข้อ/คำอธิบาย/ปุ่ม/ข้อความรอ-อนุมัติ ให้ชัดและเป็นกันเอง · คงเนื้อหา PDPA/เงื่อนไขครบ (consent เป็นเรื่องกฎหมาย ห้ามตัดสาระ)

- [ ] **Step 3: ตรวจ + Build + commit**

```bash
grep -rnE "เก๋า|ปัง|จัดเต็ม|อลังการ|สุดยอด" src/components/onboarding/
npm run build && git add src/components/onboarding/ && git commit -m "Copy: onboarding/consent — โทนเป็นกันเอง ชัดเจน"
```

---

### Task 6: Home + Play + การ์ด Home + WelcomeBox

**Files:**
- Modify: `src/views/HomeView.vue`, `src/views/PlayView.vue`, `src/components/home/*.vue` (DailyCard, ResidenceCard, การ์ดเตือน Expedition ฯลฯ), `src/components/WelcomeBox.vue` (หรือ path ตามจริง)

**Interfaces:** ไม่แตะ binding/logic — เฉพาะ text/หัวข้อ/ปุ่ม/empty state

- [ ] **Step 1: ระบุไฟล์การ์ด Home จริง** — `ls src/components/home/` แล้วรวม WelcomeBox (`grep -rl "WelcomeBox\|welcome" src/components`)

- [ ] **Step 2: อ่านแต่ละไฟล์ แก้ข้อความผู้ใช้ตาม Voice Guide** — หัวข้อส่วน, ป้ายปุ่ม "เก็บรายได้", empty state, ข้อความ WelcomeBox · คงตัวเลข/ฟอร์แมตเหรียญเดิม

- [ ] **Step 3: ตรวจ + Build + commit**

```bash
grep -rnE "เก๋า|ปัง|จัดเต็ม|อลังการ|สุดยอด" src/views/HomeView.vue src/views/PlayView.vue src/components/home/
npm run build && git add src/views/HomeView.vue src/views/PlayView.vue src/components/home/ src/components/WelcomeBox.vue && git commit -m "Copy: Home/Play/การ์ด Home — โทนเป็นกันเอง อธิบายชัด"
```

---

### Task 7: Study + Quiz

**Files:**
- Modify: `src/views/StudyView.vue`, `src/views/QuizView.vue` + toast ใน QuizView/StudyView

**Interfaces:** ไม่แตะ logic — text/หัวข้อ/ปุ่ม/toast นักศึกษา

- [ ] **Step 1: อ่านทั้งสองไฟล์** — โฟกัสหัวข้อโหมด, คำอธิบายโหมด (ทั่วไป/Zen/แข่ง), ปุ่ม, ข้อความปุ่มธงแจ้งข้อผิด, toast ผลคะแนน/เหรียญ

- [ ] **Step 2: แก้ตาม Voice Guide** — คงศัพท์โหมด (Zen) แต่ขยายความให้เข้าใจ · คงตัวเลขเหรียญ/เพดาน

- [ ] **Step 3: ตรวจ + Build + commit**

```bash
grep -rnE "เก๋า|ปัง|จัดเต็ม|อลังการ|สุดยอด" src/views/StudyView.vue src/views/QuizView.vue
npm run build && git add src/views/StudyView.vue src/views/QuizView.vue && git commit -m "Copy: Study/Quiz — คำอธิบายโหมด/ปุ่ม/toast ให้ชัด"
```

---

### Task 8: Shop + LabTab + Pets + PetDetailModal

**Files:**
- Modify: `src/views/ShopView.vue`, `src/components/shop/LabTab.vue`, `src/views/PetsView.vue`, `src/components/pets/PetDetailModal.vue`

**Interfaces:** ไม่แตะ logic — text/ปุ่ม/หัวข้อ/toast

- [ ] **Step 1: อ่านทั้ง 4 ไฟล์** — โฟกัสคำอธิบายกาชา/ห้องทดลอง (หลอม/แลก), ป้ายปุ่มสุ่ม, คำอธิบายเกรด/อัปเกรดเพ็ท, toast

- [ ] **Step 2: แก้ตาม Voice Guide** — อธิบายกลไกกาชา/หลอมให้เข้าใจง่าย · คงตัวเลขราคา/อัตรา/จำนวน copies

- [ ] **Step 3: ตรวจ + Build + commit**

```bash
grep -rnE "เก๋า|ปัง|จัดเต็ม|อลังการ|สุดยอด" src/views/ShopView.vue src/components/shop/LabTab.vue src/views/PetsView.vue src/components/pets/PetDetailModal.vue
npm run build && git add src/views/ShopView.vue src/components/shop/LabTab.vue src/views/PetsView.vue src/components/pets/PetDetailModal.vue && git commit -m "Copy: Shop/Lab/Pets — อธิบายกาชา/หลอม/เกรดให้ชัด"
```

---

### Task 9: Tower + Arena + Expedition + toast ที่เกี่ยวข้อง

**Files:**
- Modify: `src/views/TowerView.vue`, `src/views/ArenaView.vue`, `src/views/ExpeditionView.vue`, `src/composables/useTower.js`, `src/composables/useArena.js`, `src/composables/useExpedition.js`

**Interfaces:** ไม่แตะ logic — text/หัวข้อ/ปุ่ม/toast

- [ ] **Step 1: อ่านทั้ง 6 ไฟล์** — โฟกัสคำอธิบายกติกาต่อสู้/ปีนหอคอย/ส่งผจญภัย, ป้ายปุ่ม, แบนเนอร์ล็อก (PvP ก่อนเปิด), toast

- [ ] **Step 2: แก้ตาม Voice Guide** — toast ส่วนใหญ่ดีอยู่แล้ว ปรับเฉพาะที่ยังไม่ชัด · คงกติกาธาตุ/ตัวเลขครบ

- [ ] **Step 3: ตรวจ + Build + commit**

```bash
grep -rnE "เก๋า|ปัง|จัดเต็ม|อลังการ|สุดยอด" src/views/TowerView.vue src/views/ArenaView.vue src/views/ExpeditionView.vue src/composables/useTower.js src/composables/useArena.js src/composables/useExpedition.js
npm run build && git add src/views/TowerView.vue src/views/ArenaView.vue src/views/ExpeditionView.vue src/composables/useTower.js src/composables/useArena.js src/composables/useExpedition.js && git commit -m "Copy: Tower/Arena/Expedition — กติกา/ปุ่ม/toast ให้ชัด"
```

---

### Task 10: Me + Members + toast/composables ที่เหลือ (income/farm/residence/mailbox)

**Files:**
- Modify: `src/views/MeView.vue`, `src/views/MembersView.vue`, `src/composables/useDaily.js`, `src/composables/useFarm.js`, `src/composables/useResidence.js`, `src/components/home/MailboxCard.vue`

**Interfaces:** ไม่แตะ logic — text/หัวข้อ/ปุ่ม/toast

- [ ] **Step 1: อ่านทั้งหมด** — โฟกัสหัวข้อโปรไฟล์, ฟอร์มติดต่อ, dropdown เรียงสมาชิก, toast ฟาร์ม/รายได้/บ้าน/จดหมาย

- [ ] **Step 2: แก้ตาม Voice Guide**

- [ ] **Step 3: ตรวจ + Build + commit**

```bash
grep -rnE "เก๋า|ปัง|จัดเต็ม|อลังการ|สุดยอด" src/views/MeView.vue src/views/MembersView.vue src/composables/useDaily.js src/composables/useFarm.js src/composables/useResidence.js src/components/home/MailboxCard.vue
npm run build && git add src/views/MeView.vue src/views/MembersView.vue src/composables/useDaily.js src/composables/useFarm.js src/composables/useResidence.js src/components/home/MailboxCard.vue && git commit -m "Copy: Me/Members/toast ที่เหลือ — โทนสม่ำเสมอ"
```

---

### Task 11: Admin / Questions — light-touch

**Files:**
- Modify: `src/views/AdminView.vue`, `src/views/QuestionsView.vue` (เฉพาะจุดที่กำกวม)

**Interfaces:** ไม่แตะ logic — เฉพาะ text ที่อ่านแล้วงงจริง

- [ ] **Step 1: อ่านสองไฟล์ มองหา label/hint/toast ที่กำกวม** — ไม่ต้องกวาดทุก string (เห็นเฉพาะทีมงาน) แก้เฉพาะที่ทำให้ทีมงานสับสน หรือมีคำ Glossary

- [ ] **Step 2: แก้เท่าที่จำเป็น** — ถ้าไม่มีจุดกำกวมเลย ข้าม commit ได้

- [ ] **Step 3: ตรวจ + Build + commit (ถ้ามีแก้)**

```bash
grep -rnE "เก๋า|ปัง|จัดเต็ม|อลังการ|สุดยอด" src/views/AdminView.vue src/views/QuestionsView.vue
npm run build && git add src/views/AdminView.vue src/views/QuestionsView.vue && git commit -m "Copy: Admin/Questions — แก้จุดกำกวม (light-touch)"
```

---

### Task 12: Final sweep — ตรวจคำ banned ทั้ง src + build รวม

**Files:** ไม่แก้ (เว้นแต่ sweep เจอตกค้าง)

- [ ] **Step 1: grep คำ banned ทั่ว user-facing src**

```bash
grep -rnE "เก๋า|ปัง|จัดเต็ม|อลังการ|สุดยอด|ไม่มีตัวไหนรอด|ต้องหลบ|ทั้งรุ่นต้องยอม" src --include=*.vue --include=*.js | grep -v ".test.js"
```
Expected: ไม่มีผลลัพธ์ในจุด user-facing (ถ้าเจอ แก้แล้ว commit เพิ่ม)

- [ ] **Step 2: full build**

```bash
npm run build
```
Expected: เขียว

- [ ] **Step 3: eyeball (USER)** — เปิด `npm run dev` อ่านหน้า Home/Play/Study/Shop + ปุ่ม ? สัก 3-4 หัวข้อ ว่าโทนสม่ำเสมอ เป็นกันเอง ไม่มีคำหวือหวา

---

## Self-Review (ผู้เขียนแผนตรวจเอง)

**Spec coverage:** กลุ่มไฟล์ทั้ง 5 ใน spec → Task 2-10; Admin light-touch → Task 11; voice-guide.md deliverable → Task 1; verification → Task 12. ครบ.

**Placeholder scan:** offender ที่รู้แน่ใส่ before/after ตรง ๆ แล้ว (guide/achievements/migration) · ส่วน "อ่านไฟล์แล้วแก้ตาม Voice Guide" เป็นลักษณะงาน copy ที่ judgment ผูกกับ Voice Guide + Glossary (Global Constraints) — execution เป็น subagent-driven มี review ระหว่าง task เป็น safety net จับโทนเพี้ยน

**Type consistency:** ไม่มี code interface (copy ล้วน) — ความเสี่ยงคือเผลอแตะ identifier; กันด้วย constraint "diff ต้องเป็น string literal เท่านั้น" + build ทุก task
