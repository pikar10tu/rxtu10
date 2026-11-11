// ชื่อเรียกอื่นของยาในฐานข้อมูล (ชื่อการค้า / ชื่อไทย / ตัวย่อ) — ใช้จับยาในเคส CC2 + ค้นหารวม
// key = id ใน drugDb.json · ชื่อทั่วไปกับชื่อในวงเล็บถูกดึงให้อัตโนมัติแล้ว ใส่เฉพาะที่ขาด
// ⚠️ ชื่อสั้นหรือคำทั่วไปจะจับผิดเคส — ใช้ชื่อที่ยาวพอ (≥ 4 ตัวอักษร) และเฉพาะตัวยานั้นจริงๆ
// ชื่อการค้าชุด 11 พ.ย. 2026 ดึงจากคู่ "ชื่อการค้า (ชื่อสามัญ)" ที่เขียนอยู่ในเคส CC2 จริง (สะกดตรงกับเคสแน่นอน)
export const DRUG_AKA = {
  cotrimoxazole: ['cotrimoxazole', 'sulfamethoxazole/trimethoprim', 'Bactrim'],
  nitroglycerin: ['glyceryl trinitrate'],
  levothyroxine: ['thyroxine', 'Thyrosit'],
  amoxicillin_clavulanate: ['amoxicillin-clavulanate', 'augmentin'],
  isosorbide_mononitrate: ['ISMN'],
  hydrochlorothiazide: ['HCTZ'],
  amoxicillin: ['Amoxil'],
  azithromycin: ['Zithromax'],
  cephalexin: ['Sporidex'],
  fluconazole: ['Diflucan'],
  metronidazole: ['Flagyl'],
  doxycycline: ['Vibramycin'],
  ciprofloxacin: ['Ciproxin'],
  acyclovir: ['Zovirax', 'Vilerm'],
  aspirin: ['แอสไพริน'],
}
