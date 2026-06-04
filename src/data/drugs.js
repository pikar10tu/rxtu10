// ════════════════════════════════════════════════════════════
//  คลังยาสำหรับ Flashcard ทบทวน (Study tab)
// ════════════════════════════════════════════════════════════
//  แต่ละตัว: n=ชื่อยา, a=กลุ่ม/กลไก, ind=ข้อบ่งใช้, dose=ขนาดผู้ใหญ่ทั่วไป
//
//  ⚠️ ข้อมูล dose เป็นขนาด "ผู้ใหญ่ทั่วไป" สำหรับใช้ทบทวน/อ้างอิงเบื้องต้น
//     เท่านั้น ไม่ใช่คำสั่งจ่ายยา — การใช้จริงต้องปรับตามผู้ป่วย/ข้อบ่งใช้/
//     การทำงานของไต-ตับ และอ้างอิงเอกสารกำกับยา. ผู้ใช้แจ้งแก้ไขได้ผ่าน
//     ปุ่ม "แจ้งข้อมูลผิด" ในแท็บ Study (เก็บที่ collection `drugReports`).
// ════════════════════════════════════════════════════════════

export const DRUGS = [
  { n: 'Paracetamol', a: 'Analgesic / Antipyretic', ind: 'บรรเทาปวดเล็กน้อย-ปานกลาง และลดไข้', dose: '500–1000 mg ทุก 4–6 ชม. (สูงสุด 4 g/วัน)' },
  { n: 'Amoxicillin', a: 'Antibiotic (Penicillin)', ind: 'ติดเชื้อแบคทีเรีย: ทางเดินหายใจ หู ไซนัส ทางเดินปัสสาวะ', dose: '500 mg ทุก 8 ชม. หรือ 875 mg ทุก 12 ชม.' },
  { n: 'Cetirizine', a: 'Antihistamine Gen 2', ind: 'ภูมิแพ้จมูก ลมพิษ คันตา/จมูก (ง่วงน้อย)', dose: '10 mg วันละครั้ง' },
  { n: 'Omeprazole', a: 'Proton Pump Inhibitor (PPI)', ind: 'กรดไหลย้อน แผลในกระเพาะ/ลำไส้เล็ก', dose: '20–40 mg วันละครั้ง ก่อนอาหารเช้า 30–60 นาที' },
  { n: 'Simvastatin', a: 'HMG-CoA Reductase Inhibitor (Statin)', ind: 'ลดไขมัน LDL ป้องกันโรคหัวใจ-หลอดเลือด', dose: '10–40 mg วันละครั้ง ตอนเย็น' },
  { n: 'Metformin', a: 'Biguanide (เบาหวาน)', ind: 'เบาหวานชนิดที่ 2 (ยาตัวแรก)', dose: '500–1000 mg วันละ 1–2 ครั้ง พร้อมอาหาร (สูงสุด 2 g/วัน)' },
  { n: 'Amlodipine', a: 'Calcium Channel Blocker (CCB)', ind: 'ความดันโลหิตสูง โรคหลอดเลือดหัวใจตีบ (angina)', dose: '5–10 mg วันละครั้ง' },
  { n: 'Ibuprofen', a: 'NSAIDs (COX-1/2 inhibitor)', ind: 'ปวด อักเสบ ลดไข้ ปวดประจำเดือน', dose: '200–400 mg ทุก 4–6 ชม. พร้อมอาหาร (OTC สูงสุด 1200 mg/วัน)' },
  { n: 'Prednisolone', a: 'Systemic Corticosteroid', ind: 'ต้านการอักเสบ/กดภูมิ (หอบ แพ้รุนแรง โรคภูมิคุ้มกัน)', dose: '5–60 mg/วัน ปรับตามโรค รับประทานพร้อมอาหารเช้า' },
  { n: 'Salbutamol', a: 'Short-acting β2-agonist (SABA)', ind: 'หอบหืด/หลอดลมหดเกร็ง บรรเทาเฉียบพลัน', dose: 'พ่น 100–200 mcg เมื่อมีอาการ; ชนิดกิน 2–4 mg วันละ 3–4 ครั้ง' },
  { n: 'Losartan', a: 'Angiotensin II Receptor Blocker (ARB)', ind: 'ความดันโลหิตสูง ปกป้องไตในผู้ป่วยเบาหวาน', dose: '50 mg วันละครั้ง (ช่วง 25–100 mg/วัน)' },
  { n: 'Atorvastatin', a: 'HMG-CoA Reductase Inhibitor (Statin)', ind: 'ลดไขมัน LDL ป้องกันโรคหัวใจ-หลอดเลือด', dose: '10–80 mg วันละครั้ง (เวลาใดก็ได้)' },
  { n: 'Clopidogrel', a: 'P2Y12 Antiplatelet', ind: 'ป้องกันลิ่มเลือดหลังหัวใจขาดเลือด/ใส่ขดลวด/อัมพาต', dose: '75 mg วันละครั้ง' },
  { n: 'Gabapentin', a: 'Anticonvulsant / Neuropathic pain', ind: 'ปวดปลายประสาท โรคลมชัก (ยาเสริม)', dose: 'เริ่ม 300 mg วันละครั้ง ค่อยเพิ่มเป็น 300 mg วันละ 3 ครั้ง' },
  { n: 'Domperidone', a: 'Dopamine Antagonist Antiemetic', ind: 'คลื่นไส้ อาเจียน ท้องอืด อาหารไม่ย่อย', dose: '10 mg วันละ 3 ครั้ง ก่อนอาหาร' },
  { n: 'Lorazepam', a: 'Benzodiazepine (anxiolytic)', ind: 'วิตกกังวล นอนไม่หลับระยะสั้น', dose: '1–2 mg/วัน แบ่งให้; นอนไม่หลับ 1–2 mg ก่อนนอน' },
  { n: 'Tramadol', a: 'Weak Opioid Analgesic', ind: 'ปวดปานกลางถึงรุนแรง', dose: '50–100 mg ทุก 4–6 ชม. (สูงสุด 400 mg/วัน)' },
  { n: 'Acetylcysteine', a: 'Mucolytic / Antidote (paracetamol OD)', ind: 'ละลายเสมหะ; แก้พิษพาราเซตามอลเกินขนาด', dose: 'ละลายเสมหะ 200 mg วันละ 2–3 ครั้ง' },
  { n: 'Mefenamic Acid', a: 'NSAIDs (NSAID fenamate)', ind: 'ปวดประจำเดือน ปวดทั่วไป อักเสบ', dose: 'เริ่ม 500 mg แล้ว 250 mg ทุก 6 ชม. พร้อมอาหาร' },
  { n: 'Enalapril', a: 'ACE Inhibitor', ind: 'ความดันโลหิตสูง หัวใจล้มเหลว', dose: '5–20 mg/วัน (สูงสุด 40 mg แบ่งให้)' },
  { n: 'Propranolol', a: 'Non-selective Beta-blocker', ind: 'ความดัน หัวใจเต้นเร็ว ไมเกรน (ป้องกัน) มือสั่น', dose: '40 mg วันละ 2–3 ครั้ง ปรับตามข้อบ่งใช้' },
  { n: 'Furosemide', a: 'Loop Diuretic', ind: 'บวมน้ำ หัวใจล้มเหลว ความดันโลหิตสูง', dose: '20–80 mg/วัน รับประทานตอนเช้า' },
  { n: 'Warfarin', a: 'Vitamin K Antagonist (Anticoagulant)', ind: 'ป้องกันลิ่มเลือด (AF, ลิ่มเลือดอุดตัน, ลิ้นหัวใจเทียม)', dose: 'ปรับตาม INR (เริ่ม ~2–5 mg/วัน) วันละครั้งเวลาเดิม' },
  { n: 'Digoxin', a: 'Cardiac Glycoside (inotrope)', ind: 'หัวใจล้มเหลว ภาวะหัวใจเต้นผิดจังหวะ (AF)', dose: '0.125–0.25 mg วันละครั้ง' },
  { n: 'Azithromycin', a: 'Macrolide Antibiotic', ind: 'ติดเชื้อทางเดินหายใจ ผิวหนัง โรคติดต่อทางเพศ', dose: '500 mg วันแรก แล้ว 250 mg/วัน อีก 4 วัน (หรือ 500 mg/วัน 3 วัน)' },
  { n: 'Ciprofloxacin', a: 'Fluoroquinolone Antibiotic', ind: 'ติดเชื้อทางเดินปัสสาวะ ท้องเสียจากแบคทีเรีย', dose: '250–750 mg ทุก 12 ชม.' },
  { n: 'Doxycycline', a: 'Tetracycline Antibiotic', ind: 'สิว ติดเชื้อทางเดินหายใจ โรคจากเห็บ มาลาเรีย', dose: '100 mg ทุก 12 ชม. วันแรก แล้ว 100 mg วันละครั้ง' },
  { n: 'Ceftriaxone', a: '3rd-gen Cephalosporin', ind: 'ติดเชื้อแบคทีเรียรุนแรง (ยาฉีด)', dose: '1–2 g วันละครั้ง IV/IM (ไม่ใช่ยารับประทาน)' },
  { n: 'Diazepam', a: 'Benzodiazepine (anticonvulsant/anxiolytic)', ind: 'วิตกกังวล ชัก คลายกล้ามเนื้อ', dose: '2–10 mg วันละ 2–4 ครั้ง' },
  { n: 'Fluoxetine', a: 'Selective Serotonin Reuptake Inhibitor (SSRI)', ind: 'ซึมเศร้า ย้ำคิดย้ำทำ (OCD) แพนิค', dose: '20 mg วันละครั้ง ตอนเช้า (สูงสุด 80 mg/วัน)' },
  { n: 'Amitriptyline', a: 'Tricyclic Antidepressant (TCA)', ind: 'ซึมเศร้า ปวดปลายประสาท ป้องกันไมเกรน', dose: '10–25 mg ก่อนนอน ค่อยเพิ่มขนาด' },
  { n: 'Phenytoin', a: 'Hydantoin Anticonvulsant (Na+ channel blocker)', ind: 'โรคลมชัก', dose: '300 mg/วัน (ครั้งเดียวหรือแบ่ง) ปรับตามระดับยาในเลือด' },
  { n: 'Chlorpheniramine (CPM)', a: '1st-gen Antihistamine (sedating)', ind: 'ภูมิแพ้ ลมพิษ น้ำมูกไหล (ทำให้ง่วง)', dose: '4 mg ทุก 4–6 ชม. (สูงสุด 24 mg/วัน)' },
  { n: 'Loratadine', a: '2nd-gen Antihistamine (non-sedating)', ind: 'ภูมิแพ้ ลมพิษ (ไม่ง่วง)', dose: '10 mg วันละครั้ง' },
  { n: 'Fexofenadine', a: '3rd-gen Antihistamine (peripherally selective)', ind: 'ภูมิแพ้จมูก ลมพิษเรื้อรัง', dose: '180 mg วันละครั้ง หรือ 60 mg วันละ 2 ครั้ง' },
  { n: 'Dextromethorphan', a: 'NMDA Antagonist Antitussive', ind: 'ระงับอาการไอแห้ง', dose: '15–30 mg ทุก 6–8 ชม. (สูงสุด 120 mg/วัน)' },
  { n: 'Bromhexine', a: 'Mucolytic (depolymerizes mucopolysaccharides)', ind: 'ละลายเสมหะ ขับเสมหะ', dose: '8–16 mg วันละ 3 ครั้ง' },
  { n: 'Famotidine', a: 'H2-Receptor Antagonist', ind: 'แผลในกระเพาะ กรดไหลย้อน', dose: '20–40 mg ก่อนนอน หรือ 20 mg วันละ 2 ครั้ง' },
  { n: 'Hyoscine (Scopolamine)', a: 'Anticholinergic / Antispasmodic', ind: 'ปวดเกร็งช่องท้อง/ลำไส้', dose: '10–20 mg วันละ 3–4 ครั้ง' },
  { n: 'Loperamide', a: 'Peripheral Opioid Receptor Agonist (Antidiarrheal)', ind: 'ท้องเสียเฉียบพลัน (ไม่มีไข้/ถ่ายเป็นเลือด)', dose: 'เริ่ม 4 mg แล้ว 2 mg หลังถ่ายเหลวแต่ละครั้ง (สูงสุด 16 mg/วัน)' },
  { n: 'Glibenclamide', a: 'Sulfonylurea (closes K-ATP channel)', ind: 'เบาหวานชนิดที่ 2', dose: '2.5–5 mg วันละครั้ง พร้อมอาหารเช้า (สูงสุด 20 mg/วัน)' },
  { n: 'Allopurinol', a: 'Xanthine Oxidase Inhibitor (antigout)', ind: 'ลดกรดยูริก ป้องกันโรคเกาต์ (ไม่ใช้ตอนกำเริบ)', dose: '100–300 mg วันละครั้ง หลังอาหาร' },
  { n: 'Colchicine', a: 'Microtubule Inhibitor (acute gout)', ind: 'โรคเกาต์กำเริบเฉียบพลัน', dose: 'เริ่ม 1 mg แล้ว 0.5 mg ใน 1 ชม.; ป้องกัน 0.5–1 mg/วัน' },
  { n: 'Diclofenac', a: 'NSAIDs (acetic acid derivative)', ind: 'ปวด/อักเสบข้อ ปวดประจำเดือน', dose: '25–50 mg วันละ 2–3 ครั้ง พร้อมอาหาร' },
  { n: 'Naproxen', a: 'NSAIDs (propionic acid derivative)', ind: 'ปวด อักเสบข้อ เกาต์', dose: '250–500 mg วันละ 2 ครั้ง' },
  { n: 'Celecoxib', a: 'Selective COX-2 Inhibitor', ind: 'ข้อเสื่อม ข้ออักเสบรูมาตอยด์ (ระคายกระเพาะน้อย)', dose: '100–200 mg วันละ 1–2 ครั้ง' },
  { n: 'Aspirin (Low dose)', a: 'Irreversible COX-1 Inhibitor / Antiplatelet', ind: 'ต้านเกล็ดเลือด ป้องกันหัวใจขาดเลือด/อัมพาต', dose: '75–100 mg วันละครั้ง' },
  { n: 'Ergotamine', a: 'Serotonin Agonist Antimigraine', ind: 'รักษาไมเกรนเฉียบพลัน', dose: '1–2 mg เมื่อเริ่มปวด ซ้ำได้ (สูงสุด 6 mg/วัน, 10 mg/สัปดาห์)' },
  { n: 'Norfloxacin', a: 'Fluoroquinolone (urinary/GI tract)', ind: 'ติดเชื้อทางเดินปัสสาวะ ท้องเสียจากแบคทีเรีย', dose: '400 mg ทุก 12 ชม.' },
  { n: 'ORS', a: 'Oral Rehydration Solution (WHO formula)', ind: 'ทดแทนน้ำและเกลือแร่จากท้องเสีย/อาเจียน', dose: 'จิบทีละน้อยหลังถ่ายเหลวแต่ละครั้ง (ผสม 1 ซองตามฉลาก)' },
]
