# Spec: Phase 1 launch-critical (4 ก้อน)

วันที่: 2026-06-18 · สถานะ: **ดีไซน์อนุมัติแล้ว** (ผ่าน brainstorming)
ที่มา: ROADMAP.md §🟠 Phase 1 — งานที่ต้องเสร็จก่อนเปิดตัวให้ทั้งชั้นปี

## ขอบเขต

4 ก้อนงานอิสระต่อกัน รวมเป็น spec เดียวเพื่อให้แตกเป็น task/PR แยกได้:

| ก้อน | งาน | ROADMAP # | dep |
|---|---|---|---|
| A | Domain infrastructure (Care/Sci/Law) | (รองรับ #2) | — |
| B | หน้าประวัติการทำข้อสอบ (ส่วนตัว 🔒) | #2 | A |
| C | Contextual help (ตัด guide รวม) | #5 | — |
| D | Privacy: ลบ Rank + Member sort | #3, #6, #7 | — |

**ลำดับ build:** D → C → A → B (B ต้องรอ A) — แต่ละก้อนเป็น task/PR อิสระ
- **D, C = เสี่ยงต่ำ shippable ทันที** (UX win, แทบไม่มี dep) → ทำก่อนเพื่อ momentum + ตรวจทิศทาง contextual help กับ user จริง
- **A = เสี่ยงสุด** (แตะ read path ที่ optimize cost ไว้ + งานกรอกของ cowork) → ทำหลังได้ feedback จาก C

**Decisions ที่ตกลงแล้ว (brainstorming 2026-06-18):**
- quiz filter = **domain อย่างเดียว** (Care/Sci/Law) — **ซ่อน category จาก quiz UI นักศึกษา** (เก็บ field ไว้) → UX สะอาด + query ติด where ตัวเดียว ไม่ต้อง index 4 ฟิลด์
- หน้าประวัติ = **mode ใน QuizView** ไม่ใช่ route แยก · เข้าได้จาก quiz home + MeView
- contextual help = **แทนที่ทั้งหมด ตัด FAB + modal รวมทิ้ง**
- privacy = **ลบ Rank ทั้งหน้า** (สถิติเกมค่อยให้แต่ละเกมมีปุ่มดูเองภายหลัง — out of scope)

---

## ก้อน A — Domain infrastructure

**จุดประสงค์:** ให้ทั้งระบบรู้จัก domain 3 ค่าคงที่ **Care / Sci / Law** เพื่อรองรับ (1) สถิติราย domain ในก้อน B และ (2) ฝึกเฉพาะหมวดใหญ่ใน quiz

### Data model
- ไฟล์ใหม่ `src/data/domains.js` — แหล่งความจริงเดียว:
  ```js
  export const DOMAINS = [
    { key: 'care', label: 'Care' },
    { key: 'sci',  label: 'Sci'  },
    { key: 'law',  label: 'Law'  },
  ]
  export const DOMAIN_KEYS = DOMAINS.map(d => d.key)        // ['care','sci','law']
  export const domainLabel = (k) => DOMAINS.find(d => d.key === k)?.label || null
  ```
- `questions/{id}` เพิ่ม field `domain` ค่าเป็น `'care' | 'sci' | 'law' | null` (null = ข้อเก่า/ยังไม่ระบุ)
- `config/questionsMeta` เพิ่ม field `domains` = แมปนับต่อ domain เฉพาะข้อ published เช่น `{ care: 12, sci: 30, law: 8 }` (ของเดิม `publishedTotal`, `categories` คงไว้)

### QuestionsView (editor + import + filter)
- **editor draft**: เพิ่ม `domain: null` ใน `blank()` (ราว `QuestionsView.vue:337`) + `<select>` domain ในฟอร์ม (วางใกล้ช่อง category ราว line 130) ตัวเลือก = "— ไม่ระบุ —" + DOMAINS · save เขียน `domain` ลง doc
- **import** (`src/utils/importQuestions.js`): รับ `item.domain` → ถ้าเป็นค่าใน `DOMAIN_KEYS` ใช้ค่านั้น ไม่งั้น `null` (รูปแบบเดียวกับ category) · อัปเดต `parseImport.test.js` ครอบเคส domain ถูก/ผิด/ขาด
- **list filter**: เพิ่ม `<select>` domainFilter ข้าง catFilter (ราว line 163) ตัวเลือก = ทั้งหมด / Care / Sci / Law / **"ไม่ระบุหมวด"** (กรอง `domain == null`) → ใช้หาข้อเก่ามาเติม domain = ทาง migrate ข้อเดิม (ไม่มี migration script; academic ทยอยเติมเอง)
- **recompute meta**: ฟังก์ชัน recompute เดิม (ปุ่ม 🔄) ต้องคำนวณ `domains` เพิ่ม — แยก logic เป็น pure helper เพื่อเทสได้ (ดู "เทส")

### QuizView (filter = domain อย่างเดียว)
**ตัดสินใจ:** quiz home มี selector เดียว "ฝึกหมวดไหน?" = ทั้งหมด / Care / Sci / Law — **ซ่อน category ออกจาก quiz UI นักศึกษา** (เก็บ field category ไว้ใช้ฝั่ง academic จัดระเบียบ + filter ใน QuestionsView; เปิดให้นักศึกษากรองภายหลังได้ถ้าจำเป็น)
- home: แทนแถว chips category เดิม (`QuizView.vue:17-24`) ด้วย chips domain (Care/Sci/Law/ทั้งหมด) — เลิกใช้ `categories`/`cat` ใน quiz UI
- state: `dom = ref('__all')` (แทน `cat`)
- `start()` (ราว line 226-234): `base = [where('isPublished','==',true)]` + เติม `where('domain','==',dom)` เมื่อ `dom !== '__all'` — **ไม่มี where category** → query ติด where ตัวเดียวเสมอ (ทั้ง firstSnap + wrap)
- แสดง chips เฉพาะเมื่อ `config/questionsMeta.domains` มี > 0 ค่า

### Deploy / index
- composite index เดียว `questions: (isPublished ASC, domain ASC, rand ASC)` ใน `firestore.indexes.json` → `firebase deploy --only firestore:indexes`
  - **ไม่ต้องมี index domain+category รวม** เพราะ quiz ไม่ filter 2 ตัวพร้อมกัน (decision 2026-06-18)
- **rules ไม่ต้องแก้** — `questions` write=`isAcademic()` ครอบ field ใหม่อยู่แล้ว
- หลัง deploy: กดปุ่ม 🔄 recompute meta หนึ่งครั้งเพื่อ populate `domains`

### เทส (pure, `node --test`)
- `importQuestions.test.js`: เพิ่มเคส domain (ค่าถูก → เก็บ, ค่ามั่ว → null, ขาด → null)
- meta-recompute helper ใหม่ (เช่น `src/utils/questionsMeta.js` `computeMeta(publishedDocs)` → `{ publishedTotal, categories, domains }`) + `.test.js`

---

## ก้อน B — หน้าประวัติการทำข้อสอบ (ส่วนตัว 🔒)

**ขึ้นกับก้อน A** (ต้องมี domain บนข้อสอบก่อน)

### examSessions write (QuizView `finish()`, ราว line 295)
- เพิ่ม array `answers` (เก็บ `{ domain, correct }` ต่อข้อ) อัปเดตใน `pick()` — ปัจจุบัน track แค่ `correct.value` รวม
- เพิ่ม field `domainStats` = แมป `{ <domainKey>: {c, t} }` สร้างจาก `answers` โดย **วนจาก `DOMAIN_KEYS`** (ไม่ hardcode `care/sci/law`) + bucket `none` สำหรับข้อ `domain == null`
  - `t` = จำนวนข้อใน domain นั้น, `c` = จำนวนตอบถูก
- เพิ่ม field `domain` = `dom === '__all' ? null : dom` (ชุดนี้ฝึก domain เดียวหรือรวม)
- field เดิมคงไว้ (`userId, nickname, total, correct, pct, ts`) · **`category` เลิก set จาก quiz UI** (ไม่มี category selector แล้ว) → เขียน `null` (คง schema เดิม backward-compat)

### หน้าประวัติ = mode `'history'` ใน QuizView
- เพิ่ม mode ใหม่ `'history'` (ปัจจุบันมี home | quiz | result)
- ปุ่มเข้า 2 จุด (discoverability):
  - quiz home: ปุ่ม "📊 ประวัติของฉัน" → `mode = 'history'` + loadHistory()
  - **MeView**: การ์ด/ปุ่ม "ประวัติการทำข้อสอบ" → `RouterLink to="/quiz?view=history"` (QuizView อ่าน query param ตอน mount → เปิด mode history) — Me คือที่ผู้ใช้มองหาข้อมูลส่วนตัว
- โหลด: `getDocs(query(collection(db,'examSessions'), where('userId','==',uid), orderBy('ts','desc'), limit(30)))` · `usage.track(snap.size)` · rules `read: owner-only` มีแล้ว (`firestore.rules:135`) ไม่ต้องแก้
- composite index `examSessions: (userId ASC, ts DESC)` — เพิ่มใน `firestore.indexes.json` ถ้ายังไม่มี

### แสดงผล
- **คะแนนล่าสุด**: session ล่าสุด (correct/total, %)
- **กราฟพัฒนาการ**: % ของ session ย้อนหลัง (เรียงเก่า→ใหม่) เป็น bar inline (CSS/SVG) — **ไม่ใช้ chart library**
- **สถิติราย domain**: รวม `domainStats` ทุก session → Care/Sci/Law: ถูก/ทั้งหมด + % (ซ่อน bucket `none` หรือแสดงเป็น "อื่นๆ")
- **ไม่มี ranking/leaderboard** (privacy — การฝึกข้อสอบเป็นเรื่องส่วนตัว)
- empty state: ยังไม่เคยทำข้อสอบ → ข้อความชวนไปทำ

### เทส (pure)
- `src/utils/examStats.js` `aggregateExamStats(sessions)` → `{ latest, trend: [pct…], byDomain }` — byDomain **วนจาก `DOMAIN_KEYS`** (data-driven; เพิ่ม domain ใหม่ไม่ต้องแก้ logic) + **ทนกับ session เก่าที่ domainStats ขาด/มี key แปลกปลอม** (ไม่ throw) · `.test.js` (เคส: ว่าง, session เดียว, หลาย session, domainStats ขาด, legacy key)

---

## ก้อน C — Contextual help (ตัด guide รวม)

### refactor data
- `src/data/guide.js`: เปลี่ยนจาก array `GUIDE_SECTIONS` → keyed map
  ```js
  export const GUIDE = {
    residence: { icon:'🏠', title:'ที่อยู่อาศัย', body:[…] },
    income:    { … },
    pets:      { … },
    farm:      { … },
    study:     { … },
    quiz:      { … },
    shop:      { … },
    potential: { icon:'⚗️', title:'ศักยภาพ', soon:true, body:[…] },
  }
  ```
  - ย้ายเนื้อหาเดิมทั้งหมด + **แก้ copy ที่ผิด** (เช่น "ปราสาท 🏰 (12 ขั้น)" → ใช้ภาษาที่ตรงกับ `data/residence.js` จริง)
  - residence entry: รองรับการแสดง **ตารางรายได้ราย level** (อาจใส่ flag เช่น `table:'residence'` ให้ HelpModal render ตารางจาก `data/residence.js`)

### component
- `src/components/help/HelpButton.vue` ใหม่ — props `topic` → วงกลม `?` เล็ก (`aria-label="ดูวิธีใช้"`) คลิกแล้วเปิด HelpModal ที่ topic นั้น
- `src/composables/useHelp.js`: เปลี่ยนจาก `helpOpen: bool` → `helpTopic: ref(null)` + `openHelp(topic)` / `closeHelp()`
- `src/components/help/HelpModal.vue`: render **section เดียว** ตาม `helpTopic` (icon + title + body[] + ตารางถ้ามี) แทน accordion รวม
- HelpModal ยังอยู่ที่ App.vue ระดับ root (singleton) — แค่เปลี่ยนเนื้อหาเป็น topic เดียว

### วางปุ่ม `?`
- convention: `?` วงกลมเล็ก มุมขวาบนของหัวการ์ด/หัวหน้า — ตำแหน่ง + ขนาดเดียวกันทุกที่ (ไม่ ad-hoc)
- ResidenceCard (residence) · ฟาร์ม (farm — ใน PlayView/FarmGrid) · StudyView (study) · QuizView home (quiz) · ShopView (shop) · PetsView (pets)

### ตัดของเดิม
- ลบ `help-fab` ❓ ใน `App.vue:25` (ปุ่มลอย)
- `MigrationWelcome.vue`: เลิกเรียก `openHelp()` (line ~79) — ผู้ใช้ใหม่กด `?` ราย feature เอง (เพิ่ม hint สั้นๆ ได้)

### เทส
- ไม่มี logic ซับซ้อน — ตรวจด้วย build + ลองมือ (data-driven เป็นหลัก)

---

## ก้อน D — Privacy: ลบ Rank + Member sort

### ลบ Rank ทั้งหน้า
- ลบไฟล์ `src/views/RankView.vue`
- ลบ route `/rank` ใน `src/router/index.js:13`
- ลบ Home shortcut `sc-rank` (`HomeView.vue:42-46`) + CSS `.sc-rank` ที่เกี่ยว
- grep หา ref `/rank` หรือ `name: 'rank'` ทั่วโปรเจกต์ → ลบให้หมด (Rank ไม่ได้อยู่ใน bottom nav อยู่แล้ว)
- **เก็บ `ResidenceBadge.vue` ไว้** (ใช้ที่อื่นด้วย ไม่ใช่แค่ RankView)
- สถิติเกม (leaderboard เลเวล/ไลก์) = out of scope รอบนี้ — ค่อยให้แต่ละเกมมีปุ่มดูเองภายหลัง

### Member sort (MembersView)
- pure util `src/utils/sortMembers.js` `sortMembers(list, key, myUid)` + `.test.js`
  - `key`: `'studentId'` (default, น้อย→มาก) · `'nickname'` (ก-ฮ) · `'level'` (มาก→น้อย)
  - **ปักหมุดการ์ดตัวเอง (uid === myUid) ช่องแรกเสมอ** ไม่ว่าเลือก key ไหน
  - registered ก่อน, unregistered ท้ายสุดเสมอ
  - เทส: default sort, pin self, แต่ละ key, unregistered ไปท้าย
- MembersView: เพิ่ม `<select>` เลือกการเรียง (รหัส / ชื่อ / เลเวล) · default = รหัส · แทน sort hardcode ที่ `MembersView.vue:90-94` ด้วย `sortMembers()` · การ์ดตัวเองที่ปักหมุดติดป้าย "คุณ"

---

## สรุป deploy ที่ต้องทำ (รวมทุกก้อน)
- `firebase deploy --only firestore:indexes` — index `questions (isPublished, domain, rand)` + `examSessions (userId, ts desc)` (ถ้ายังไม่มี)
- กดปุ่ม 🔄 recompute meta หนึ่งครั้ง (populate `domains`)
- **rules ไม่ต้องแก้** ทั้ง 4 ก้อน
- push master = GitHub Actions auto-deploy frontend

## หลักการที่ยึด
- pure util + `node --test` ทุกก้อนที่มี logic (ตามแพทเทิร์นโปรเจกต์)
- ไม่เพิ่ม dependency (กราฟทำเอง inline)
- เพิ่ม field ใหม่ → ผ่าน schema กลางที่เกี่ยวข้อง (`data/domains.js`, `userSchema.js` ถ้าจำเป็น)
- privacy-first: ไม่มี ranking การฝึกข้อสอบที่ไหนเลย
