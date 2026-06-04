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
  { n: 'Colchicine', a: 'Microtubule Inhibitor (acute gout)', ind: 'โรคเกาต์กำเริบเฉียบพลัน; ป้องกันช่วงเริ่มยาลดยูริก', dose: 'เริ่ม 1.2 mg แล้ว 0.6 mg ใน 1 ชม. (สูงสุด 1.8 mg วันแรก); ป้องกัน 0.6 mg วันละ 1–2 ครั้ง' },
  { n: 'Diclofenac', a: 'NSAIDs (acetic acid derivative)', ind: 'ปวด/อักเสบข้อ ปวดประจำเดือน', dose: '25–50 mg วันละ 2–3 ครั้ง พร้อมอาหาร' },
  { n: 'Naproxen', a: 'NSAIDs (propionic acid derivative)', ind: 'ปวด อักเสบข้อ เกาต์', dose: '250–500 mg วันละ 2 ครั้ง' },
  { n: 'Celecoxib', a: 'Selective COX-2 Inhibitor', ind: 'ข้อเสื่อม ข้ออักเสบรูมาตอยด์ (ระคายกระเพาะน้อย)', dose: '100–200 mg วันละ 1–2 ครั้ง' },
  { n: 'Aspirin (Low dose)', a: 'Irreversible COX-1 Inhibitor / Antiplatelet', ind: 'ต้านเกล็ดเลือด ป้องกันหัวใจขาดเลือด/อัมพาต', dose: '75–100 mg วันละครั้ง' },
  { n: 'Ergotamine', a: 'Serotonin Agonist Antimigraine', ind: 'รักษาไมเกรนเฉียบพลัน', dose: '1–2 mg เมื่อเริ่มปวด ซ้ำได้ (สูงสุด 6 mg/วัน, 10 mg/สัปดาห์)' },
  { n: 'Norfloxacin', a: 'Fluoroquinolone (urinary/GI tract)', ind: 'ติดเชื้อทางเดินปัสสาวะ ท้องเสียจากแบคทีเรีย', dose: '400 mg ทุก 12 ชม.' },
  { n: 'ORS', a: 'Oral Rehydration Solution (WHO formula)', ind: 'ทดแทนน้ำและเกลือแร่จากท้องเสีย/อาเจียน', dose: 'จิบทีละน้อยหลังถ่ายเหลวแต่ละครั้ง (ผสม 1 ซองตามฉลาก)' },

  // ── เพิ่มเติม: ยาต้านจุลชีพ (antibiotics / antifungal / antiviral) ──
  { n: 'Amoxicillin/Clavulanate (Co-amoxiclav)', a: 'Penicillin + β-lactamase inhibitor', ind: 'ติดเชื้อที่ดื้อ amoxicillin: ไซนัส หู ปอด ผิวหนัง แผลสัตว์กัด', dose: '625 mg ทุก 8 ชม. หรือ 1 g ทุก 12 ชม. พร้อมอาหาร' },
  { n: 'Cephalexin', a: '1st-gen Cephalosporin (oral)', ind: 'ติดเชื้อผิวหนัง ทางเดินปัสสาวะ คออักเสบ', dose: '250–500 mg ทุก 6 ชม.' },
  { n: 'Dicloxacillin', a: 'Antistaphylococcal Penicillin', ind: 'ติดเชื้อ Staphylococcus ที่ผิวหนัง (ฝี หนอง)', dose: '250–500 mg ทุก 6 ชม. ตอนท้องว่าง (ก่อนอาหาร 1 ชม.)' },
  { n: 'Clarithromycin', a: 'Macrolide Antibiotic', ind: 'ติดเชื้อทางเดินหายใจ; สูตรกำจัด H. pylori', dose: '250–500 mg ทุก 12 ชม.' },
  { n: 'Clindamycin', a: 'Lincosamide Antibiotic', ind: 'ติดเชื้อ Staph/Strep ผิวหนัง-กระดูก ฟันอักเสบ (ทางเลือกเมื่อแพ้ penicillin)', dose: '150–450 mg ทุก 6 ชม.' },
  { n: 'Metronidazole', a: 'Nitroimidazole (anaerobes/protozoa)', ind: 'ติดเชื้อแบคทีเรียไร้อากาศ บิดมีตัว ช่องคลอดอักเสบ', dose: '400 mg ทุก 8 ชม. (ห้ามดื่มแอลกอฮอล์)' },
  { n: 'Co-trimoxazole (TMP-SMX)', a: 'Trimethoprim + Sulfamethoxazole', ind: 'ติดเชื้อทางเดินปัสสาวะ; ป้องกัน/รักษา PCP', dose: '1 DS (800/160) ทุก 12 ชม. ดื่มน้ำมากๆ' },
  { n: 'Fluconazole', a: 'Azole Antifungal', ind: 'เชื้อราในช่องคลอด/ช่องปาก; เชื้อราระบบ', dose: 'ช่องคลอด 150 mg ครั้งเดียว; อื่นๆ 100–200 mg/วัน' },
  { n: 'Acyclovir', a: 'Antiviral (guanosine analogue)', ind: 'เริม (HSV) และงูสวัด (VZV)', dose: 'เริม 400 mg วันละ 3 ครั้ง; งูสวัด 800 mg วันละ 5 ครั้ง' },

  // ── เพิ่มเติม: หัวใจ-หลอดเลือด-ความดัน ──
  { n: 'Hydrochlorothiazide (HCTZ)', a: 'Thiazide Diuretic', ind: 'ความดันโลหิตสูง บวมน้ำ', dose: '12.5–25 mg วันละครั้ง ตอนเช้า' },
  { n: 'Spironolactone', a: 'K-sparing Diuretic / Aldosterone antagonist', ind: 'หัวใจล้มเหลว บวมจากตับแข็ง ความดันดื้อยา', dose: '25–50 mg วันละครั้ง' },
  { n: 'Atenolol', a: 'Cardioselective Beta-blocker (β1)', ind: 'ความดันโลหิตสูง โรคหลอดเลือดหัวใจ', dose: '25–100 mg วันละครั้ง' },
  { n: 'Isosorbide dinitrate (ISDN)', a: 'Nitrate Vasodilator', ind: 'ป้องกัน/บรรเทาอาการเจ็บหน้าอก (angina)', dose: 'อมใต้ลิ้น 5 mg เมื่อเจ็บ; ชนิดกิน 10–20 mg วันละ 2–3 ครั้ง' },

  // ── เพิ่มเติม: เบาหวาน-ต่อมไร้ท่อ ──
  { n: 'Sitagliptin', a: 'DPP-4 Inhibitor', ind: 'เบาหวานชนิดที่ 2', dose: '100 mg วันละครั้ง' },
  { n: 'Pioglitazone', a: 'Thiazolidinedione (TZD)', ind: 'เบาหวานชนิดที่ 2 (เพิ่มความไวอินซูลิน)', dose: '15–30 mg วันละครั้ง (สูงสุด 45 mg)' },
  { n: 'Levothyroxine', a: 'Thyroid Hormone (T4)', ind: 'ภาวะไทรอยด์ต่ำ (hypothyroidism)', dose: '50–100 mcg วันละครั้ง ตอนเช้าท้องว่าง' },
  { n: 'Methimazole (Thiamazole)', a: 'Antithyroid (thionamide)', ind: 'ภาวะไทรอยด์เป็นพิษ (hyperthyroidism)', dose: 'เริ่ม 10–30 mg/วัน แล้วปรับตามผลเลือด' },

  // ── เพิ่มเติม: ทางเดินหายใจ ──
  { n: 'Montelukast', a: 'Leukotriene Receptor Antagonist', ind: 'ควบคุมหอบหืด; ภูมิแพ้จมูก', dose: '10 mg วันละครั้ง ตอนเย็น' },
  { n: 'Theophylline', a: 'Methylxanthine Bronchodilator', ind: 'หอบหืด/ถุงลมโป่งพอง (COPD)', dose: 'ชนิดออกฤทธิ์นาน 200 mg ทุก 12 ชม. (ติดตามระดับยา)' },

  // ── เพิ่มเติม: ทางเดินอาหาร ──
  { n: 'Sucralfate', a: 'Mucosal Protectant', ind: 'แผลในกระเพาะ/ลำไส้เล็ก', dose: '1 g วันละ 4 ครั้ง ก่อนอาหารและก่อนนอน (ท้องว่าง)' },
  { n: 'Metoclopramide', a: 'D2 Antagonist Prokinetic / Antiemetic', ind: 'คลื่นไส้ อาเจียน กระตุ้นการบีบตัวของกระเพาะ', dose: '10 mg วันละ 3 ครั้ง ก่อนอาหาร (ใช้ระยะสั้น)' },
  { n: 'Ondansetron', a: '5-HT3 Receptor Antagonist Antiemetic', ind: 'คลื่นไส้/อาเจียนจากเคมีบำบัดหรือหลังผ่าตัด', dose: '4–8 mg ทุก 8–12 ชม.' },
  { n: 'Dimenhydrinate', a: 'Antihistamine Antiemetic', ind: 'เมารถ-เรือ คลื่นไส้ เวียนศีรษะ', dose: '50 mg ทุก 4–6 ชม. (สูงสุด 400 mg/วัน)' },
  { n: 'Bisacodyl', a: 'Stimulant Laxative', ind: 'ท้องผูก', dose: '5–10 mg ก่อนนอน (ออกฤทธิ์ ~6–12 ชม.)' },
  { n: 'Lactulose', a: 'Osmotic Laxative', ind: 'ท้องผูก; ลดแอมโมเนียในภาวะตับวาย (hepatic encephalopathy)', dose: 'ท้องผูก 15–30 mL วันละ 1–2 ครั้ง' },
  { n: 'Simethicone', a: 'Antiflatulent (defoaming agent)', ind: 'ท้องอืด แน่นท้องจากแก๊ส', dose: '40–125 mg หลังอาหารและก่อนนอน' },

  // ── เพิ่มเติม: จิตเวช / อื่นๆ ──
  { n: 'Sertraline', a: 'Selective Serotonin Reuptake Inhibitor (SSRI)', ind: 'ซึมเศร้า วิตกกังวล แพนิค PTSD', dose: '50 mg วันละครั้ง (ช่วง 25–200 mg/วัน)' },
  { n: 'Ferrous sulfate', a: 'Iron Supplement', ind: 'ภาวะโลหิตจางจากขาดธาตุเหล็ก', dose: '200 mg (≈65 mg elemental Fe) วันละ 1–3 ครั้ง' },
]
