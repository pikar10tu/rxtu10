# คลังเคส CC2 OSPE

แหล่งจริงของเคสทั้งหมด: `cases/<id>.json` (1 ไฟล์ = 1 เคส) · รูปอยู่ `public/cc2/img/<id>-<n>.webp`
เว็บไม่อ่านโฟลเดอร์นี้ตรงๆ — `scripts/cc2/build-cc2.mjs` สร้าง `public/cc2/` ให้ตอน `npm run dev`/`npm run build`

## เพิ่ม / แก้ / ปิด / ลบ
- **เพิ่ม**: สร้าง `cases/OS-xxxx.json` ใช้เลขถัดจากตัวสูงสุด (ชื่อไฟล์ต้องตรง `id`)
- **แก้**: แก้ไฟล์ตรงๆ
- **ปิดชั่วคราว**: `"active": false` (ไฟล์อยู่ต่อ ไม่โชว์ในเว็บ)
- **ลบถาวร**: ลบไฟล์ + รูป `public/cc2/img/<id>-*.webp` · ⚠️ ผลฝึกของเพื่อนที่ผูกกับ id นั้นจะค้างเป็นเคสที่หาไม่เจอ — ปกติใช้ปิดแทน
- ตรวจ: `node --test src/utils/cc2Case.test.js` (รูปแบบ, id ซ้ำ, รูปหาย)

## รูปแบบ
```json
{
 "id": "OS-0407", "title": "…", "cat": "Clinic | Product | SAP", "group": "การซักประวัติและจ่ายยา",
 "topic": "โรค/ยาหลัก", "diff": 2, "source": "ข้อสอบจริง ปี 2566", "active": true,
 "durationMin": null, "next": null,
 "scenario": "ข้อความโจทย์ (มีช่องเติมคำได้: [BLANK: คำตอบ1, คำตอบพ้อง | คะแนน | ป้าย])",
 "patientHtml": "", "contentHtml": "", "equipmentHtml": "", "noteHtml": "",
 "checklist": [{ "t": "ทักทาย ยืนยันตัวตนผู้ป่วย", "s": 1, "g": "หัวข้อกลุ่ม" }]
}
```
ต้องมี `checklist` หรือ `[BLANK: …]` อย่างน้อยหนึ่งอย่าง — ยกเว้น `"rest": true` (สถานีพัก) หรือ `"noScore": true` (โจทย์ฝึกทำไม่มีเกณฑ์) · HTML ถูกกรองตอน build (รูปต้องเป็น `/cc2/img/*.webp`)

## ที่มา
- `OS-0001`–`OS-0406`: นำเข้าจาก RxCU OSPE Hub (ได้รับอนุญาต 11 พ.ย. 2026) ด้วย `scripts/cc2/import-rxcu.mjs`
  รันซ้ำได้ — `_rxcu-map.json` คุมรหัสเดิมให้คงที่ · ⚠️ รันซ้ำจะ**เขียนทับ**ไฟล์ที่แก้มือ
