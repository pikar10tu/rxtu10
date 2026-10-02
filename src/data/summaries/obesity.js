// Obesity — converted from the RxTU10 class summary PDF (see content/summaries/manifest.json)
export default {
  id: 'obesity',
  date: '3/8/69',
  refs: [
    'Clinical practice guideline for obesity (แนวทางวินิจฉัยโรคอ้วน พ.ศ. 2568)',
    'Cleveland Clinic. Obesity (2024) · Class III obesity (2025)',
    'NHLBI. Overweight and obesity: causes and risk factors. 2022',
    'Gjermeni E, et al. Obesity—an update on the basic pathophysiology and review of recent therapeutic advances. Biomolecules. 2021;11(10):1426.',
    'American Diabetes Association. How to treat obesity',
  ],
  sections: [
    { id: 'def', t: 'นิยามและสาเหตุ', html: `<p>โรคเรื้อรังไม่ติดต่อจากการสะสมไขมันผิดปกติหรือมากเกินจนเป็นอันตราย เช่น เบาหวาน ความดันสูง โรคหัวใจ (WHO และแนวทางไทย พ.ศ. 2568)</p>
<div class="tbl"><table>
  <tr><th></th><th class="num">น้ำหนักเกิน</th><th class="num">โรคอ้วน</th></tr>
  <tr><td>WHO</td><td class="num">BMI 25.0–30.0</td><td class="num">&gt; 30</td></tr>
  <tr><td>คนเอเชีย</td><td class="num">BMI 23.0–25.0</td><td class="num">&gt; 25</td></tr>
</table></div>
<a class="calc-link" href="#" data-calc="bmi">คำนวณ BMI</a>
<h3>Epidemiology (WHO)</h3>
<ul>
  <li>ปี 2022 ผู้ใหญ่ 2.5 พันล้านคนน้ำหนักเกิน (43% เพิ่มจาก 25% ในปี 1990) อ้วน &gt; 890 ล้านคน · โรคอ้วนทั่วโลกเพิ่ม &gt; 2 เท่าระหว่าง 1990–2022</li>
  <li>ปี 2024 เด็ก &lt; 5 ปี น้ำหนักเกิน ~35 ล้านคน เกือบครึ่งอยู่ในเอเชีย · เด็กและวัยรุ่น 5–19 ปี อ้วนเพิ่มจาก 2% (1990) เป็น 8% (2022) &gt; 160 ล้านคน</li>
</ul>
<h3>สาเหตุ</h3>
<p>ความไม่สมดุลระหว่างพลังงานที่ได้รับกับพลังงานที่ใช้ · หลายปัจจัย</p>
<ol>
  <li><b>สิ่งแวดล้อม:</b> อาหารไขมันสูงหาง่าย อาหารสุขภาพเข้าถึงยาก ไม่มีพื้นที่/เวลาออกกำลังกาย กินร่วมกับคนอ้วน นอนน้อย แบคทีเรียในทางเดินอาหาร</li>
  <li><b>พันธุกรรม:</b> การกระจายไขมันตามยีน หรือยีนกลายพันธุ์</li>
  <li><b>การเจ็บป่วย:</b> โรคพันธุกรรม, Cushing syndrome, leptin deficiency, โรคซึมเศร้า โรคจิตเวช</li>
  <li><b>ยา:</b> ยากันชัก (carbamazepine, valproic acid), ยาจิตเวช (olanzapine, risperidone), ฮอร์โมนยาคุม (progesterone), insulin</li>
</ol>
<p><b>ปัจจัยเสี่ยง:</b> ไม่ออกกำลังกาย (หน้าจอนาน) · กินแคลอรี่เกิน ไขมันอิ่มตัวหรือน้ำตาลเกิน 10% ของแคลอรี่ · นอนไม่พอ (ไม่รับรู้ว่าอิ่ม) · เครียด (cortisol) · metabolic syndrome, PCOS · ยา · สภาพแวดล้อม</p>` },
    { id: 'dx', t: 'วินิจฉัย พยาธิสรีรวิทยา และการประเมิน', html: `<ol>
  <li><b>BMI:</b> เกณฑ์เอเชียต่างจาก WHO เพราะอุบัติการณ์เบาหวานและความดันสูงในคนเอเชีย · BMI 27 ของคนเอเชีย ≈ BMI 30 ของคนตะวันตก</li>
  <li><b>เส้นรอบเอว:</b> วัดกึ่งกลางระหว่างขอบล่างซี่โครงกับขอบบนกระดูกเชิงกราน คาดเดาไขมันในช่องท้อง</li>
</ol>
<div class="tbl"><table>
  <tr><th>ภาวะ (คนไทย)</th><th class="num">BMI (kg/m²)</th></tr>
  <tr><td>น้ำหนักน้อย ระดับ 3 / 2 / 1</td><td class="num">&lt; 16.0 / 16.0–16.9 / 17.0–18.4</td></tr>
  <tr><td>ปกติ</td><td class="num">18.5–22.9</td></tr>
  <tr><td>น้ำหนักเกิน</td><td class="num">23.0–24.9</td></tr>
  <tr><td>โรคอ้วน ระดับ 1</td><td class="num">25.0–29.9</td></tr>
  <tr><td>โรคอ้วน ระดับ 2</td><td class="num">≥ 30.0</td></tr>
</table></div>
<div class="tbl"><table>
  <tr><th>อ้วนลงพุง (รอบเอว)</th><th class="num">ชาวตะวันตก</th><th class="num">ชาวเอเชีย</th></tr>
  <tr><td>ชาย</td><td class="num">≥ 102 cm</td><td class="num">≥ 90 cm</td></tr>
  <tr><td>หญิง</td><td class="num">≥ 88 cm</td><td class="num">≥ 80 cm</td></tr>
</table></div>
<p>Lancet Diabetes & Endocrinology Commission แนะนำใช้ BMI ร่วมกับรอบเอวหรือไขมันในร่างกาย และประเมินการทำงานของอวัยวะและกิจวัตรประจำวัน</p>
<h3>Pathophysiology</h3>
<ul>
  <li><b>สมดุลพลังงาน:</b> ได้รับเกิน ใช้น้อย → สะสมเป็น triglyceride adipose tissue ขยาย</li>
  <li><b>ความอยากอาหาร:</b> hypothalamus · neuropeptide Y (จากเซลล์ไขมันหน้าท้อง) เพิ่มความอยากอาหาร · <b>leptin resistance</b> (อาจจากนอนไม่พอ) → อยากอาหารมากขึ้น ใช้พลังงานลดลง</li>
</ul>
<h3>โรคแทรกซ้อน</h3>
<p>Obstructive sleep apnea · OA (ปวดเข่า หลัง เสี่ยงเก๊าท์) · เบาหวาน (ตอบสนอง insulin ลด) · โรคหัวใจ stroke · asthma · dyslipidemia (TG สูง) · นิ่วในถุงน้ำดี</p>` },
    { id: 'drugs', t: 'ยาลดน้ำหนัก', html: `<div class="key"><strong class="k">เกณฑ์ใช้ยา</strong>ปรับพฤติกรรม 3–6 เดือนไม่ได้ผล และ <b>BMI ≥ 27</b> หรือ <b>BMI ≥ 23 ร่วมโรคที่เกี่ยวกับน้ำหนักอย่างน้อย 1 โรค</b> (เบาหวาน ความดัน ไขมันผิดปกติ) · ต้องใช้ร่วมคุมอาหารและปรับพฤติกรรมเสมอ</div>
<div class="tbl"><table>
  <tr><th>ยา</th><th>กลไก</th><th>วิธีใช้</th><th>ADR / ข้อห้าม</th></tr>
  <tr><td><b>Phentermine, diethylpropion</b> (ระยะสั้น)</td><td>เพิ่มการหลั่งและยับยั้งการเก็บ dopamine, norepinephrine ใน CNS ลดความอยากอาหาร</td><td>ก่อนอาหารเช้า เริ่ม 7.5 mg/วัน <b>ไม่เกิน 9.00 น.</b> (นอนไม่หลับ) · <mark>ไม่เกิน 3–6 เดือน</mark> (rebound hyperphagia, ซึมเศร้า) · วัตถุออกฤทธิ์ประเภท 2 ขายในร้านยาไม่ได้</td><td>หงุดหงิด นอนไม่หลับ หวาดระแวง หูแว่ว ใจสั่น ความดันสูง · C/I: ซึมเศร้า วิตกกังวล นอนไม่หลับ หัวใจเต้นผิดจังหวะ ความดันคุมไม่ได้ ตั้งครรภ์ เด็ก &lt; 12 ปี ประวัติติดยา</td></tr>
  <tr><td><b>Orlistat</b> (ระยะยาว <mark>ขายในร้านยาได้</mark>)</td><td>GI lipase inhibitor ไขมันไม่ถูกย่อยและไม่ดูดซึม ขับทางอุจจาระ ได้ผลกับอาหารที่มีไขมันเท่านั้น</td><td>120 mg วันละ 3 ครั้งพร้อมอาหาร · ไม่ต้องปรับตามไต</td><td>ปวดท้อง <b>oily defecation</b> กลั้นอุจจาระไม่ได้ ท้องอืด · หยุดถ้าเบื่ออาหาร ผื่น ตัวตาเหลือง ปัสสาวะเข้ม · <b>ใช้นาน 1 ปีขาดวิตามิน A, D, E, K และ β-carotene</b> เสริมวิตามินรวม</td></tr>
  <tr><td><b>Liraglutide</b> (ควบคุมพิเศษ)</td><td>GLP-1 RA เสริม serotonin ลดความอยากอาหาร ชะลอกระเพาะ อิ่มเร็ว</td><td>SC หน้าท้อง 0.6 mg วันละครั้ง 1 สัปดาห์ เพิ่ม 0.6 mg ทุกสัปดาห์จนถึง 3 mg · เด็กใช้ได้</td><td rowspan="3">คลื่นไส้ อาเจียน ท้องเสีย · รุนแรง: มะเร็งเต้านม, medullary thyroid carcinoma, นิ่วถุงน้ำดี, <b>ตับอ่อนอักเสบ</b> · semaglutide: นอนไม่หลับ ซึมเศร้า วิตกกังวล · <mark>C/I: MTC, MEN2, ตั้งครรภ์</mark></td></tr>
  <tr><td><b>Tirzepatide</b> (ควบคุมพิเศษ)</td><td><b>Dual GLP-1 + GIP receptor agonist</b> · ลดตายจาก HF</td><td>SC 2.5 mg สัปดาห์ละครั้ง 4 สัปดาห์ เพิ่ม 2.5 mg ทุก 4 สัปดาห์จนถึง 10–15 mg</td></tr>
  <tr><td><b>Semaglutide</b> (ควบคุมพิเศษ)</td><td>GLP-1 RA t½ ยาวกว่า liraglutide</td><td>SC 0.25 mg สัปดาห์ละครั้ง 4 สัปดาห์ แล้วเพิ่มทุก 4 สัปดาห์ 0.5 → 1.0 → 1.7 → 2.4 mg · เด็กใช้ได้</td></tr>
</table></div>
<p style="font-size:.9em">US FDA มี phentermine/topiramate และ naltrexone/bupropion (วัตถุออกฤทธิ์ประเภท 2) ยังไม่เข้าไทย</p>` },
    { id: 'tx', t: 'แนวทางการรักษา', html: `<p><b>First-line = ไม่ใช้ยา</b> เป้าหมาย<mark>ลดน้ำหนัก 5–10% จากน้ำหนักเดิม</mark></p>
<h3>ควบคุมอาหาร</h3>
<ol>
  <li><b>Low-calorie diet (LCD)</b> ≤ 800 kcal/วัน คาร์บต่ำ · BMI &gt; 30 หรือหยุดหายใจขณะหลับ · ใช้ระยะสั้นภายใต้แพทย์ดูแลใกล้ชิด</li>
  <li><b>พลังงานต่ำปานกลาง</b> แนะนำแบบ<b>พลังงานต่ำสมดุล 1,000–1,200 kcal/วัน</b> สารอาหารครบ ทำได้นาน</li>
  <li><b>ตาม micronutrients:</b> Mediterranean diet (ปลา ผัก น้ำมันมะกอก ถั่ว ธัญพืช ลดน้ำหนักได้ดีกว่าไขมันต่ำ) · low energy density (ผักผลไม้แป้งน้อย นมพร่องมันเนย ซุปน้ำใส เนื้อไม่ติดมัน) · portion control (อาหารทดแทน) · <b>intermittent fasting</b> (อด 16–18 ชม. กิน 6–8 ชม.)</li>
</ol>
<h3>ออกกำลังกาย</h3>
<ul>
  <li>แอโรบิก กล้ามเนื้อมัดใหญ่ต่อเนื่อง ≥ 10 นาที (เดิน วิ่ง ว่ายน้ำ จักรยาน) 20–30 นาที 5–7 วัน/สัปดาห์</li>
  <li>ยกน้ำหนัก/แรงต้าน สะสมวันละ ≥ 30 นาที เพิ่มทุก 1–2 สัปดาห์</li>
</ul>
<h3>ปรับพฤติกรรม (กลุ่ม 8–12 คน)</h3>
<p>สัมภาษณ์เชิงสร้างแรงจูงใจ · บันทึกอาหารและการออกกำลังกาย · จัดการความเครียด · ควบคุมสิ่งกระตุ้น (เลี่ยงอาหารแคลอรี่สูง) · ให้รางวัลตัวเอง · ปรับความคิด · CBT</p>
<h3>ยาและการผ่าตัด</h3>
<ul>
  <li>ปรับ 3–6 เดือนไม่ถึงเป้า: เพิ่มยาเมื่อ BMI ≥ 27 หรือ ≥ 23 ร่วมโรคที่เกี่ยวข้อง ≥ 1 โรค (phentermine, diethylpropion, orlistat, liraglutide, semaglutide, tirzepatide)</li>
  <li><b>ผ่าตัด</b> เมื่อ BMI ≥ 35 หรือ ≥ 30 ร่วมโรคที่เกี่ยวข้อง (โดยเฉพาะเบาหวาน) แนะนำส่องกล้อง: <b>Roux-en-Y gastric bypass</b> (ลดการดูดซึม BMI ≥ 35) · <b>sleeve gastrectomy</b> (ลดขนาดกระเพาะ BMI &lt; 35)</li>
</ul>` },
  ],
  questions: [
    { case: 'หญิงไทย 35 ปี น้ำหนัก 88 kg สูง 158 cm ไม่มีโรคประจำตัว ตรวจร่างกายปกติ ต้องการลดน้ำหนัก ชอบอาหารเผ็ด มัน นัว และของทอดมาก (ใช้ตอบข้อ 1–3)', q: 'ผู้ป่วยจัดอยู่ในเกณฑ์ใดตามเกณฑ์คนเอเชีย', o: ['น้ำหนักเกิน (overweight)', 'โรคอ้วนระดับ 1 (obesity class I)', 'โรคอ้วนระดับ 2 (obesity class II)', 'โรคอ้วนระดับ 3 (obesity class III)', 'เกณฑ์ปกติ'], a: 2, e: 'BMI = 88 / 1.58² ≈ 35.3 kg/m² ≥ 30 = โรคอ้วนระดับ 2 ตามเกณฑ์คนไทย' },
    { q: 'ถ้าต้องการใช้ยาร่วมกับปรับพฤติกรรม ยาใดเหมาะสมที่สุดและซื้อได้ที่ร้านยาทั่วไป', o: ['Liraglutide', 'Phentermine/topiramate', 'Orlistat', 'Naltrexone/bupropion', 'Diethylpropion'], a: 2, e: 'Orlistat ขายในร้านยาได้ · GLP-1 RA เป็นยาควบคุมพิเศษ · phentermine/diethylpropion เป็นวัตถุออกฤทธิ์ประเภท 2 · combination ยังไม่มีในไทย' },
    { q: 'จากข้อที่แล้ว อาการไม่พึงประสงค์ที่พบบ่อยที่สุดจากยานี้คือ', o: ['ใจสั่น นอนไม่หลับ', 'ท้องเสีย มีไขมันปนอุจจาระ (steatorrhea)', 'ปากแห้ง ท้องผูก', 'ความดันสูง หัวใจเต้นผิดจังหวะ', 'นิ่วในถุงน้ำดี ตับแข็ง'], a: 1, e: 'Orlistat ยับยั้ง lipase ไขมันจึงถูกขับออกทางอุจจาระ' },
    { q: 'ผู้ที่ใช้ orlistat นาน ๆ เสี่ยงขาดวิตามินใดมากที่สุด', o: ['วิตามิน C และ B12', 'วิตามิน A, D, E, K', 'วิตามิน B1 และ B6', 'โฟเลตและธาตุเหล็ก', 'วิตามิน B รวม'], a: 1, e: 'วิตามินที่ละลายในไขมัน (A, D, E, K) ดูดซึมลดลง ควรเสริมวิตามินรวม' },
    { q: 'หญิง 40 ปี BMI 36.5 เริ่มยาฉีดใต้ผิวหนังวันละครั้งขนาด 3.0 mg เพื่อลดน้ำหนัก 3 สัปดาห์ต่อมาปวดท้องส่วนบนรุนแรงร้าวไปหลัง คลื่นไส้อาเจียน ยาที่ใช้คือ', o: ['Liraglutide', 'Phentermine/topiramate', 'Orlistat', 'Naltrexone/bupropion', 'Diethylpropion'], a: 0, e: 'ยาฉีด SC วันละครั้ง 3.0 mg คือ liraglutide และอาการเข้าได้กับตับอ่อนอักเสบซึ่งเป็น ADR รุนแรงของ GLP-1 RA' },
    { q: 'เป้าหมายลดน้ำหนักระยะสั้น (6 เดือนแรก) ด้วยการปรับพฤติกรรมอย่างเดียวที่เหมาะสมและลดเสี่ยงโรคหัวใจได้จริงคือ', o: ['5–10% จากน้ำหนักตั้งต้น', '15–20% จากน้ำหนักตั้งต้น', '10 kg โดยไม่สนน้ำหนักตั้งต้น', 'จน BMI เข้าเกณฑ์ปกติ', 'ดูเพียง BMI อย่างเดียว'], a: 0, e: 'แนวทางแนะนำลดน้ำหนัก 5–10% จากน้ำหนักเดิม' },
    { q: 'ยาใดเป็น dual GIP and GLP-1 receptor agonist', o: ['Liraglutide', 'Semaglutide', 'Tirzepatide', 'Orlistat', 'Metformin'], a: 2, e: 'Tirzepatide กระตุ้นทั้ง GIP และ GLP-1 receptor อิ่มนาน ชะลอกระเพาะ เพิ่มการหลั่ง insulin ลดน้ำหนักได้ดี' },
    { q: 'หญิง 44 ปี ขอยาลดน้ำหนักที่ร้านยา มี CKD แม่และพี่สาวเคยเป็นหัวใจเต้นผิดจังหวะและ medullary thyroid carcinoma ยาลดน้ำหนักใดเหมาะสมที่สุด', o: ['Orlistat', 'Phentermine', 'Liraglutide', 'Naltrexone/bupropion', 'Tirzepatide'], a: 0, e: 'ประวัติครอบครัว MTC ห้าม GLP-1/GIP agonist · phentermine ไม่เหมาะกับประวัติหัวใจเต้นผิดจังหวะ · orlistat ไม่ต้องปรับตามไตและขายในร้านยาได้' },
  ],
}
