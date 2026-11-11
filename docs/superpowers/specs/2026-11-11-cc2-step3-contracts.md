# CC2 ขั้น 3 — ข้อตกลงร่วมระหว่าง agent (11 พ.ย. 2026)

แผนหลัก: `2026-11-11-cc2-ospe-connected-hub-design.md` · เดโมที่ user เคาะ: https://claude.ai/artifact/BzLiDpGaNRw1TqZeFd6MHo
อ่าน `CLAUDE.md` ก่อนเสมอ (patchUser, Teleport overlay, ฟอนต์ ≥ .7rem, v-html ต้อง escape/sanitize, ธีมพาสเทล)
⛔ ห้าม commit / push / firebase deploy — คนประสานงาน (Claude หลัก) รวมงานเอง
⛔ **ห้ามแก้ `src/router/index.js`, `StudyView.vue`, `HomeView.vue`, `MeView.vue`** — คนประสานงานต่อสายเอง (บอก route ที่ต้องการในรายงาน)
แต่ละ agent แก้เฉพาะไฟล์ในเลนตัวเอง ถ้าจำเป็นต้องแตะไฟล์นอกเลน → เขียนไว้ในรายงาน ไม่ต้องแก้เอง

## ข้อมูลที่มีแล้ว (ขั้น 1–2)
- `public/cc2/index.json` → `{ v, cases: [{ id, title, cat: 'Clinic'|'Product'|'SAP', group, topic, diff, source, tot, mode: 'check'|'blank'|'rest'|'free', next? }] }`
- `public/cc2/cases/<id>.json` → เคสเต็ม: `scenario` (text), `patientHtml`, `contentHtml`, `equipmentHtml`, `noteHtml` (HTML กรองแล้ว — v-html ได้), `checklist: [{ t, html?, s, g, sub?, img? }]`, `blanks: [{ i, answers[], score, label }]`, `gated: ['patient'|'equipment']`, `durationMin`, `rest?`, `noScore?`
- `public/cc2/drug-links.json` → `{ [caseId]: drugId[] }` · `public/search-index.json` (ค้นหารวม)
- `src/utils/cc2Case.js` → `parseBlanks`, `checkBlank`, `normAns` · `src/composables/useGlobalSearch.js`
- โหลดไฟล์ด้วย `fetch(import.meta.env.BASE_URL + 'cc2/…')` (base = './' + hash router)
- เนื้อหาบางเคสมี "(ส่งโดยผู้ประเมิน: …)" ในข้อความ และ `patientHtml` บางเคสมี **บทผู้ป่วยจำลอง** (สำหรับผู้ประเมินเท่านั้น)

## สัญญากลาง (ทุกเลนยึดตามนี้)

### A. `src/composables/useCc2Data.js` — เลน FABLE เป็นเจ้าของ (ทำก่อนเป็นอย่างแรก เพื่อให้เลนอื่นใช้)
```js
loadCc2Index(): Promise<{v, cases[]}>      // cache ทั้งแอป
loadCc2Case(id): Promise<case>             // cache รายเคส
loadDrugLinks(): Promise<{[caseId]: drugId[]}>
```

### B. `src/components/cc2/Cc2CaseBody.vue` — เลน FABLE เป็นเจ้าของ
```
props:
  caseData: Object (เคสเต็ม)
  role: 'solo' | 'examinee' | 'examiner'     // solo = เห็นทุกอย่างรวมเช็คลิสต์ (ประเมินตัวเอง)
  revealed: Array<string>  (default [])       // ส่วนที่ผู้ประเมินส่งแล้ว ('patient'|'equipment'|key อื่นที่ FABLE กำหนด)
  checks: Object {[index]: boolean}           // v-model:checks
  answers: Object {[blankIndex]: string}      // v-model:answers
  readonly: Boolean
emits: update:checks, update:answers, reveal(key) (examiner กดส่ง), open-drug(drugId)
แสดง: สถานการณ์ · ข้อมูลผู้ป่วย · ของในสถานี · ชิปยา (drug-links → emit open-drug) · เช็คลิสต์จัดกลุ่มตาม g + คะแนนรวม · ช่องเติมคำ (ตรวจด้วย checkBlank)
examinee: ไม่เห็นเช็คลิสต์/เฉลย/บทผู้ป่วยจำลอง · ส่วนใน gated เห็นเมื่ออยู่ใน revealed
```
`scoreCase(caseData, checks, answers) → { got, tot }` export จาก `src/utils/cc2Case.js` (FABLE เพิ่ม + เทส)

### C. `src/composables/useCc2Progress.js` — เลน OPUS เป็นเจ้าของ
```js
const { finishCase, progress, summary, weakCases } = useCc2Progress()
finishCase({ caseId, cat, got, tot }): Promise<{ ok, coins }>   // เขียน 1 ครั้ง ผ่าน auth.patchUser
progress: computed {[caseId]: { got, tot, at, n }}              // จาก userData.study.cc2
summary:  computed { Clinic|Product|SAP: { got, tot, n } }      // จาก userData.study.cc2Sum
weakCases: computed [caseId]                                    // got < tot
```
ทุกโหมด (เดี่ยว / 16 สถานี / ผู้สอบในห้องคู่) เรียก `finishCase` ตอนจบเคส · ผู้ประเมินในห้องคู่**ไม่**ได้บันทึกผลตัวเอง (แต่ OPUS กำหนดรางวัลผู้ประเมินได้ถ้าเห็นควร — เขียนเหตุผลในรายงาน)

## เลนงาน
| เลน | ไฟล์ที่เป็นเจ้าของ |
|---|---|
| **FABLE** (แกน + ซ้อมคู่) | `useCc2Data.js`, `components/cc2/Cc2CaseBody.vue`, `Cc2CaseView.vue` (หน้าเคสเดี่ยว), ห้องซ้อมคู่ `useCc2Room.js` + `views/Cc2RoomView.vue` + `components/cc2/room/*`, เพิ่ม `cc2/rooms` ใน `database.rules.json`, `scoreCase` + เทสใน cc2Case.js |
| **SONNET** (คลัง + 16 สถานี + ค้นหา UI) | `views/Cc2LibraryView.vue`, `views/Cc2SimView.vue` (สุ่ม 16 สถานีตามสัดส่วน Clinic 8/Product 6/SAP 2 + พัก, จับเวลา, สรุปผล), `utils/cc2Sim.js` + เทส (สุ่ม: กลุ่มซ้ำ ≤ 2, หัวข้อไม่ซ้ำ), `components/search/GlobalSearchPanel.vue` (ใช้ useGlobalSearch — ผลกลุ่ม ยา/เคส/สรุป), `components/home/ContinueCard.vue` (dropdown ฝึกต่อ แทน DailyCard+NextActionCard — ศึกษา 2 ตัวนั้นแล้วรวม) |
| **OPUS** (ผล + เหรียญ + rules + Me) | `useCc2Progress.js` + เทส pure ใน `utils/cc2Progress.js`, `data/userSchema.js` (study.cc2, study.cc2Sum), `firestore.rules` (อนุญาตฟิลด์ใหม่ + กันโกง), `components/study/PracticeStats.vue` (segment ภาพรวม/CC1/CC2 — CC1 = ของเดิมไม่แตะพฤติกรรม), เควสต์รายวัน "ซ้อม CC2 1 เคส", DrugDbView ส่วน "เคส CC2 ที่มียานี้" |

ก่อนมี `Cc2CaseBody` จริง เลน SONNET ใช้ตามสัญญา B ได้เลย (import path ตามข้างบน) — ถ้ายังไม่มีไฟล์ตอนเทส ให้ build ข้ามไป/สร้าง stub ชั่วคราวใน **โฟลเดอร์ตัวเอง** ไม่สร้างทับไฟล์ของ FABLE

## เศรษฐกิจ — ❌ ยกเลิก (user 11 พ.ย.): CC2 = self-learning ล้วน ไม่มีเหรียญ/radar/เควสต์ · เก็บแค่บันทึกซ้อมต่อเคส study.cc2 ให้เจ้าของดู
- จบเคส: เหรียญ = round(got/tot × 200) · ได้เหรียญเฉพาะครั้งแรกต่อเคสต่อวัน (ซ้อมซ้ำได้ ไม่ได้เหรียญ) · 16 สถานีจบชุด โบนัส +500
- เทียบ: ควิซ 100/ข้อ ไม่มี cap

## ส่งงาน
รายงานสั้น: ไฟล์ที่สร้าง/แก้ · route ที่ต้องเพิ่ม · สิ่งที่ต้องการจากเลนอื่น · เทส/`npm run build` ผ่านไหม · จุดที่ยังไม่แน่ใจ
