# CC2 OSPE + เชื่อม 5 หน้า + ค้นหารวม — แผน (11 พ.ย. 2026)

เดโมที่ user เคาะ: https://claude.ai/artifact/BzLiDpGaNRw1TqZeFd6MHo (v2)
ที่มาเนื้อหา: RxCU OSPE Hub (เพื่อนอนุญาตแล้ว) · เปลี่ยนแค่รหัสเคส + ชื่อระบบ · rewrite/ผลิตเพิ่ม = ภายหลัง
⛔ ห้าม push จนกว่า user สั่ง

## สิ่งที่เคาะแล้ว
| เรื่อง | ตัดสิน |
|---|---|
| ผลฝึก CC2 | เขียน Firestore **ครั้งเดียวตอนจบเคส** → สถิติ + เหรียญ + เควสต์ |
| Members | **ไม่โชว์ข้อมูลซ้อมรายคน** — คงเดิม |
| หน้าหลัก | ค้นหา = ปุ่ม 🔍 มุมขวาบน (เปิดหน้าค้นหาเต็ม) · "ฝึกต่อ" = dropdown รวม DailyCard + NextActionCard |
| Study | ช่องค้นหาเต็ม + ประตูใหม่ CC2 OSPE |
| Me | ปุ่มสลับ ภาพรวม · CC1 · CC2 — CC1 = radar 21 หมวดเดิม (PracticeStats.vue) ไม่แตะพฤติกรรมเดิม |
| Play | เควสต์รายวัน "ซ้อม CC2 1 เคส" |
| ค้นหายา | ดัชนี build-time จาก drugDb.json → ยาที่เพิ่มทีหลังเข้าเอง + เทสกันลืม |

## ขั้นงาน
### 1. นำเข้าข้อมูล CC2 (สคริปต์ `scripts/cc2/`)
- อ่าน `case-data-offline.js` / `case-details-offline.js` ด้วย **JSON.parse เท่านั้น** (ห้าม eval)
- กรอง isActive · **ข้าม 30 เคสเข้ารหัส** (isEncrypted)
- normalize หมวด (clinic→Clinic ฯลฯ) + mainGroup ที่กระจัดกระจาย → ทะเบียนกลุ่มเรา
- รหัสใหม่ `OS-####` · ตัด author/docId/password/salt ทิ้ง · ชื่อระบบเรา
- แตกรูป base64 (254 รูป/104 เคส) → `public/cc2/img/<id>-<n>.webp`
- Product `[BLANK: ans1, ans2 | คะแนน | ป้าย | len]` → `{type:'blank', answers[], score, label}` ตรวจอัตโนมัติ (ตัดช่องว่าง/ตัวพิมพ์)
- ผลลัพธ์: `public/cc2/index.json` (รายการเบา) + `public/cc2/cases/<id>.json` (โหลดตอนเปิดเคส — ไม่เข้า bundle)

### 2. ดัชนีค้นหารวม (0 read)
- `scripts/build-search-index.mjs` รันใน `prebuild` + `predev` → `public/search-index.json`
  - ยา: name, ชื่อพ้อง/ชื่อการค้า (เพิ่มฟิลด์ `aka` ใน drugDb — ตัวเลือก), cls, group, chips
  - เคส CC2: title, disease, group · สรุป: manifest เดิม · โหมดฝึก: รายการคงที่
- **เทส** `searchIndex.test.js`: ยาทุกตัวใน drugDb.json อยู่ในดัชนี + ค้นด้วยชื่อหลักเจอ → เพิ่มยาแล้วลืม build เทสพัง
- ลิงก์ยา↔เคส: คำนวณตอน build (จับชื่อยา + aka ในข้อความเคส) เก็บ `drugIds` ในเคส และ `cc2Cases` ในดัชนียา
- composable `useGlobalSearch()` ใช้ร่วม หน้าหลัก (overlay) + Study

### 3. หน้าฝึก CC2
- `/study/cc2` คลัง (กรอง Clinic/Product/SAP + กลุ่ม) · `/study/cc2/:id` เคส (สถานการณ์, ผู้ป่วย, ชิปยา, เช็คลิสต์ติ๊ก/ช่องเติมคำ)
- โหมดซ้อม 16 สถานี จับเวลา (เฟส 2)
- จบเคส → เขียน `users/{uid}.study.cc2.<caseId> = {got, tot, at}` + สรุป `study.cc2Sum.{Clinic|Product|SAP} = {got,tot,n}` ด้วย **dot-path** (ห้ามเขียน `study:` ทั้งก้อน — ดู memory rxtu10_quiz_srs)
- เหรียญ: ผ่าน transaction/กฎเศรษฐกิจเดิม · กันฟาร์ม: ให้เหรียญเฉพาะครั้งแรกต่อเคสต่อวัน
- rules: อนุญาตฟิลด์ใหม่ใน users (deploy rules ก่อน push)

### 4. เชื่อมหน้าอื่น
- HomeView: ปุ่ม 🔍 ใน header · `ContinueCard` dropdown แทน DailyCard + NextActionCard
- PracticeStats.vue: segment ภาพรวม/CC1/CC2 · CC2 radar 3 แกนจาก `cc2Sum` (0 read) · รายการเคสไม่ครบ
- DrugDbView: ส่วน "เคส CC2 ที่มียานี้"
- เควสต์รายวัน: งาน cc2 1 เคส

## ความเสี่ยง
- จับชื่อยาด้วยชื่อตรงตัว พลาดชื่อการค้า/ไทย → ฟิลด์ `aka`
- ขนาด: รายละเอียดเคสแยกไฟล์ต่อเคส ไม่โหลดทั้ง 18MB
- 30 เคสเข้ารหัส ไม่นำเข้า

## ลำดับ / ใครทำ
1 → 2 → 3 → 4 · สคริปต์นำเข้า/ดัชนี: sonnet · rules + การเขียนผล/เหรียญ + รีวิวสุดท้าย: opus · Fable เฉพาะถ้าติดหนัก
