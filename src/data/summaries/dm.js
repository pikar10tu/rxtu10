// Diabetes mellitus — converted from the RxTU10 class summary PDF (see content/summaries/manifest.json)
export default {
  id: 'dm',
  date: '27/07/2026',
  refs: [
    'American Diabetes Association. 2. Diagnosis and classification of diabetes: Standards of Care in Diabetes—2026. Diabetes Care. 2026;49(Suppl 1):S27-S49.',
    'แนวทางเวชปฏิบัติสำหรับโรคเบาหวาน 2566. พิมพ์ครั้งที่ 2. 2567.',
    'จุราพร พงศ์เวชรักษ์. Pathophysiology of DM, pharmacology of antidiabetic drugs and pharmacotherapy of type 2 diabetes. ภศ.314; 2567',
    'อรภา สกุลพาณิชย์. สมุนไพรกับการลดน้ำตาลในเลือด ลดน้ำหนัก. ภศ.314; 2568',
    'Boehringer Ingelheim. Sick day rules (SADMANS)',
  ],
  sections: [
    { id: 'def', t: 'นิยามและการจำแนก', html: `<p>กลุ่ม metabolic disorders ที่<b>เผาผลาญคาร์โบไฮเดรตผิดปกติ</b> ร่างกายนำกลูโคสไปใช้เป็นพลังงานไม่มีประสิทธิภาพ ขณะเดียวกันสร้างกลูโคสมากเกินผ่าน gluconeogenesis และ glycogenolysis → <b>hyperglycemia</b></p>
<ul>
  <li><b>Type 1:</b> ภูมิคุ้มกันทำลาย β-cell → <b>absolute insulin deficiency</b></li>
  <li><b>Type 2:</b> β-cell หลั่ง insulin ได้ไม่พอแบบค่อยเป็นค่อยไป บนพื้นฐาน <mark>insulin resistance</mark> · เซลล์ดื้อ insulin ร่างกายกระตุ้น β-cell ให้ผลิตมากเรื่อย ๆ จน β-cell เหนื่อย (exhausted) → insulin ไม่พอ น้ำตาลสูง</li>
</ul>
<p><b>อาการ:</b> ปัสสาวะบ่อย (polyuria) · หิวน้ำบ่อย (polydipsia) · หิวบ่อย กินเยอะ (polyphagia) · อ่อนแรง · หงุดหงิดง่าย · ตาพร่ามัว</p>
<h3>พยาธิสรีรวิทยา T2DM</h3>
<ol>
  <li>Beta-cell dysfunction: สร้างและหลั่ง insulin ได้น้อยลง</li>
  <li>Insulin resistance: กล้ามเนื้อ ตับ ไขมัน ตอบสนองต่อ insulin ลดลง</li>
</ol>
<p>ใน DM glucose uptake ลด · glycogen synthesis ลด · gluconeogenesis ไม่ถูกยับยั้ง → น้ำตาลสูง</p>
<p><b>Pathological conditions:</b> อาหารมันและคาร์บสูง (ROS) · นั่ง ๆ นอน ๆ (การออกกำลังกายช่วยให้ insulin ออกฤทธิ์) · gut microbiota · mitochondria dysfunction</p>` },
    { id: 'dx', t: 'วินิจฉัย คัดกรอง และเป้าหมาย', html: `<div class="tbl"><table>
  <tr><th>การตรวจ</th><th class="num">Prediabetes</th><th class="num">Diabetes</th><th>หมายเหตุ</th></tr>
  <tr><td>A1C</td><td class="num">5.7–6.4% (39–47 mmol/mol)</td><td class="num"><b>≥ 6.5%</b> (≥ 48 mmol/mol)</td><td>วัดเวลาไหนก็ได้ ไม่ต้องอดอาหาร</td></tr>
  <tr><td>FPG</td><td class="num">100–125 mg/dL (5.6–6.9 mmol/L)</td><td class="num"><b>≥ 126 mg/dL</b> (≥ 7.0 mmol/L)</td><td>อดอาหาร ≥ 8 ชม.</td></tr>
  <tr><td>OGTT 2 ชม.</td><td class="num">140–199 mg/dL (7.8–11.0)</td><td class="num"><b>≥ 200 mg/dL</b> (≥ 11.1)</td><td>กินน้ำตาลตามที่กำหนด แล้ววัดที่ 2 ชม.</td></tr>
  <tr><td>Random glucose + อาการ (ฉี่บ่อย หิวน้ำ น้ำหนักลด)</td><td></td><td class="num"><b>≥ 200 mg/dL</b> (≥ 11.1)</td><td>วัดเวลาไหนก็ได้</td></tr>
</table></div>
<h3>ประเมินความเสี่ยง T2DM (Thai diabetes risk score)</h3>
<figure><img data-fig="dm/p03-1.webp" alt="ตารางคะแนนความเสี่ยงโรคเบาหวานชนิดที่ 2 จากอายุ BMI รอบเอวต่อส่วนสูง ความดัน ประวัติครอบครัว และ FPG"><figcaption>คะแนนความเสี่ยงเบาหวานชนิดที่ 2 (ข้อมูลการสำรวจสุขภาพคนไทยครั้งที่ 4 พ.ศ. 2552)</figcaption></figure>
<p><b>สรุปปัจจัยที่เพิ่มคะแนน:</b> อายุมาก · อ้วน (BMI และรอบเอวต่อส่วนสูงสูง) · ความดันสูง · ญาติสายตรงเป็น DM · FPG 100–125 mg/dL</p>
<h3>คัดกรองในร้านยา (เภสัชกรชุมชน)</h3>
<ul>
  <li>Fasting capillary blood glucose (FCBG) ≥ 126 mg/dL → ส่งตรวจยืนยันด้วย FPG</li>
  <li>อดอาหารไม่ได้ และ FCBG ≥ 110 mg/dL → ตรวจ FPG ยืนยัน (FPG ≥ 126 = เบาหวาน)</li>
  <li>FCBG &lt; 110 mg/dL โอกาสน้อย ติดตามทุก 3 ปี</li>
</ul>
<h3>ภาวะแทรกซ้อนเรื้อรัง</h3>
<p>Retinopathy (ตาบอด) · nephropathy (ESRD) · neuropathy (เท้าชา แผลหายช้า อาจตัดเท้า) · CHD (เสียชีวิตจาก CV events)</p>
<h3>เป้าหมายในผู้ใหญ่ที่ไม่ใช่หญิงตั้งครรภ์</h3>
<div class="tbl"><table>
  <tr><th></th><th class="num">ควบคุมเข้มงวด</th><th class="num">ควบคุมทั่วไป</th></tr>
  <tr><td>น้ำตาลขณะอดอาหาร</td><td class="num">&gt; 70–110 mg/dL</td><td class="num">80–130 mg/dL</td></tr>
  <tr><td>น้ำตาลหลังอาหาร 2 ชม.</td><td class="num">&lt; 140 mg/dL</td><td>—</td></tr>
  <tr><td>น้ำตาลสูงสุดหลังอาหาร</td><td>—</td><td class="num">&lt; 180 mg/dL</td></tr>
  <tr><td>A1C</td><td class="num">&lt; 6.5%</td><td class="num">&lt; 7.0%</td></tr>
</table></div>
<p style="font-size:.9em">ควบคุมเข้มงวด = อายุน้อย เพิ่งวินิจฉัย ยังไม่มีภาวะแทรกซ้อน</p>` },
    { id: 'algo', t: 'แผนการรักษา', html: `<figure><img data-fig="dm/p05-1.webp" alt="แผนภูมิที่ 1 ขั้นตอนการรักษาเบาหวานชนิดที่ 2 ในผู้ใหญ่: ปรับพฤติกรรม เริ่ม metformin เพิ่มยาเป็น 2 และ 3 ชนิด หรือเริ่มอินซูลินตามระดับน้ำตาลและ A1C"><figcaption>แผนภูมิที่ 1 ขั้นตอนการรักษาเบาหวานชนิดที่ 2 ในผู้ใหญ่ (แนวทางไทย 2566)</figcaption></figure>
<ul>
  <li>FPG &lt; 160 หรือ A1C &lt; 8% → ปรับพฤติกรรม 3 เดือน ถ้ายังไม่ถึงเป้าเริ่มยา · ≥ 160 หรือ A1C ≥ 8% → <b>metformin</b> พร้อมปรับพฤติกรรม</li>
  <li>FPG ≥ 200 หรือ A1C ≥ 9% → อาจเริ่มยา 2 ชนิดร่วมกัน · FPG ≥ 300 หรือ A1C ≥ 10% ร่วมอาการน้ำตาลสูง → ยาเม็ด (± GLP-1 analog) ร่วม NPH ก่อนนอน หรือ basal insulin</li>
  <li>ยาที่ 2 ที่ใช้ได้ (เพิ่มกับ metformin): sulfonylureas หรือ glitazone · ทางเลือก DPP-4i, SGLT2i, α-glucosidase inhibitor, repaglinide, basal insulin, GLP-1 analog</li>
</ul>
<figure><img data-fig="dm/p05-2.webp" alt="แผนภูมิที่ 2 เบาหวานที่มีโรคอ้วนรุนแรง ASCVD หัวใจล้มเหลว หรือ CKD ไม่มีปัญหาค่าใช้จ่ายเลือก GLP-1 analog หรือ SGLT2 inhibitor ตามโรคร่วม"><figcaption>แผนภูมิที่ 2: มีโรคร่วมและไม่มีปัญหาค่าใช้จ่าย · ASCVD → GLP-1 analog หรือ SGLT2i · HF → SGLT2i · CKD → SGLT2i · อ้วนรุนแรง → GLP-1 analog หรือ SGLT2i</figcaption></figure>` },
    { id: 'oral', t: 'ยาเม็ดลดน้ำตาล', html: `<h3>Sulfonylureas (glipizide, glibenclamide)</h3>
<ul>
  <li>จับตัวรับที่ β-cell → ATP-sensitive K channel ปิด → depolarize → Ca influx → หลั่ง insulin · <mark>ฤทธิ์ไม่ขึ้นกับระดับน้ำตาล → hypoglycemia</mark></li>
  <li><b>Glipizide:</b> กินก่อนอาหาร 30 นาที (ตัวเดียวที่อาหารชะลอการดูดซึม) · <b>Glibenclamide:</b> เลี่ยงในผู้สูงอายุและไตบกพร่อง (ไม่ใช้ eGFR &lt; 60)</li>
  <li>ADR: hypoglycemia, weight gain, maculopapular rash · C/I: แพ้ sulfa, severe renal/hepatic impairment</li>
</ul>
<h3>Biguanide: Metformin</h3>
<ul>
  <li><b>ตับ:</b> กระตุ้น AMPK ยับยั้ง cAMP เพิ่มเผาผลาญไขมัน เพิ่ม hepatic insulin sensitivity <b>ลดการสร้างกลูโคสที่ตับ</b></li>
  <li><b>ลำไส้:</b> เผาผลาญกลูโคสแบบไม่ใช้ O₂ → ดูดซึมลด สร้าง lactate ส่งไปตับ + เพิ่ม GLP-1 → หลั่ง insulin ลด glucagon</li>
  <li>เนื้อเยื่ออื่น: เพิ่มความไวต่อ insulin · <mark>ไม่กระตุ้น insulin โดยตรง → เสี่ยง hypoglycemia ต่ำ</mark></li>
  <li>500, 850 mg กินพร้อม/หลังอาหาร ค่อย ๆ ปรับขนาดลด GI · <b>eGFR 30–45 ลดเหลือ 1,000 mg/day · eGFR &lt; 30 ห้ามใช้</b> (lactic acidosis)</li>
  <li>ADR: N/V, diarrhea, metallic taste, <b>B12 deficiency</b> (อาการทางประสาท), lactic acidosis</li>
  <li>C/I: eGFR &lt; 30, sepsis, acute HF, acute liver injury, hypoperfusion/hypoxia, chronic alcoholism, ใช้ radiocontrast</li>
</ul>
<h3>Thiazolidinedione: Pioglitazone</h3>
<ul>
  <li>PPAR-γ (และ α) agonist เพิ่ม GLUT1/4 ลดการสร้างกลูโคสที่ตับ ลดไขมันอิสระ · remodeling adipose เพิ่ม subcutaneous fat → <b>น้ำหนักเพิ่ม</b> · insulin sensitizer</li>
  <li>15–45 mg OD (max 45) ปรับทุก 3–4 สัปดาห์ · CYP2C8 · ไม่ต้องปรับตามไต</li>
  <li>ADR: <b>edema → HF แย่ลง</b>, weight gain 1.5–4 kg, กระดูกมือเท้าหัก (หญิงสูงอายุ), bladder cancer, liver enzyme↑</li>
  <li>C/I: <mark>CHF</mark>, active liver disease (ALT &gt; 2.5 เท่า), bladder cancer</li>
</ul>
<h3>DPP-4 inhibitors (-gliptin)</h3>
<ul>
  <li>ยับยั้ง DPP-4 ที่ย่อย GLP-1 และ GIP → หลั่ง insulin แบบ glucose-dependent (ออกฤทธิ์เมื่อน้ำตาลสูง) · ไม่เพิ่มน้ำหนัก ไม่เสี่ยง hypoglycemia</li>
  <li>หยุดทันทีถ้าสงสัย pancreatitis · <b>linagliptin ไม่ต้องปรับตามไต</b> · saxagliptin เพิ่มเสี่ยง CHF · ห้ามใช้ร่วม GLP-1 RA</li>
</ul>
<div class="tbl"><table>
  <tr><th>กลุ่ม</th><th>ยา</th><th>CKD ระยะ 3–4 / ปลูกถ่ายไต</th><th>CKD 5 และ 5D</th></tr>
  <tr><td>Biguanide</td><td>metformin</td><td>eGFR 30–45 ไม่เกิน 1,000 mg/d ติดตามทุก 3–6 เดือน · &lt; 30 ห้ามใช้</td><td>ห้ามใช้</td></tr>
  <tr><td rowspan="4">Sulfonylurea</td><td>glibenclamide</td><td>ไม่ควรใช้ในระยะ 3 ห้ามในระยะ 4</td><td>ห้ามใช้</td></tr>
  <tr><td>glipizide</td><td>ไม่ต้องปรับ</td><td>เลี่ยงใน 5D</td></tr>
  <tr><td>gliclazide</td><td>ไม่ต้องปรับ</td><td>เลี่ยงใน 5D</td></tr>
  <tr><td>glimepiride</td><td>เริ่ม 1 mg/d ห้ามในระยะ 4</td><td>ห้ามใช้</td></tr>
  <tr><td rowspan="2">Glinide</td><td>repaglinide</td><td>เริ่ม 0.5 mg ก่อนอาหารถ้า eGFR &lt; 30</td><td>ไม่ต้องปรับ</td></tr>
  <tr><td>mitiglinide</td><td>เริ่ม 5 mg ก่อนอาหารถ้า eGFR &lt; 30</td><td>ไม่ต้องปรับ</td></tr>
  <tr><td>α-glucosidase inh.</td><td>acarbose</td><td>ไม่ให้เมื่อ eGFR ≤ 30</td><td>ห้ามใช้</td></tr>
  <tr><td>TZD</td><td>pioglitazone</td><td>ไม่ต้องปรับ</td><td>ไม่ต้องปรับ</td></tr>
  <tr><td rowspan="6">DPP-4 inh.</td><td>linagliptin</td><td>ไม่ต้องปรับ</td><td>ไม่ต้องปรับ</td></tr>
  <tr><td>gemigliptin</td><td>ไม่ต้องปรับ</td><td>ไม่ต้องปรับ</td></tr>
  <tr><td>vildagliptin</td><td>50 mg/d ถ้า eGFR &lt; 50</td><td>50 mg/d</td></tr>
  <tr><td>saxagliptin</td><td>2.5 mg/d ถ้า eGFR &lt; 50</td><td>2.5 mg/d หลัง dialysis</td></tr>
  <tr><td>sitagliptin</td><td>50 mg/d (eGFR 30–50) · 25 mg/d (&lt; 30)</td><td>25 mg/d</td></tr>
  <tr><td>alogliptin</td><td>12.5 mg/d (30–50) · 6.25 mg/d (&lt; 30)</td><td>6.25 mg/d</td></tr>
  <tr><td rowspan="3">SGLT2i</td><td>empagliflozin</td><td>ไม่ใช้ถ้า eGFR &lt; 20</td><td rowspan="3">ห้ามใช้</td></tr>
  <tr><td>dapagliflozin</td><td>ไม่ใช้ถ้า eGFR &lt; 25</td></tr>
  <tr><td>canagliflozin</td><td>100 mg/d (30–60) · ไม่ใช้ &lt; 30</td></tr>
  <tr><td>GLP-1 analog</td><td>liraglutide, dulaglutide, semaglutide</td><td>ไม่ใช้เมื่อ eGFR &lt; 15</td><td>ห้ามใช้</td></tr>
</table></div>
<p style="font-size:.9em">eGFR หน่วย mL/min/1.73 m² · ผลข้างเคียงในตาราง: glinide/SU hypoglycemia น้ำหนักเพิ่ม · acarbose อาจเป็นพิษต่อตับ · pioglitazone บวม หัวใจวาย · SGLT2i ติดเชื้อราอวัยวะเพศ ขาดน้ำ · GLP-1 ขาดน้ำจากคลื่นไส้อาเจียน</p>
<a class="calc-link" href="#" data-calc="egfr">คำนวณ eGFR</a>` },
    { id: 'inj', t: 'GLP-1 RA, SGLT2i และอินซูลิน', html: `<h3>GLP-1 RA</h3>
<p>Short acting (daily): liraglutide · long acting (weekly): dulaglutide, semaglutide</p>
<ul>
  <li>หลั่ง insulin + ลด glucagon แบบ glucose-dependent · กดความอยากอาหาร · ชะลอ gastric emptying</li>
  <li><mark>ลดน้ำหนักได้ดีที่สุด</mark> · ไม่เสี่ยง hypoglycemia · ลด CV death/CVE · ชะลอ CKD</li>
  <li>ปากกา SC เก็บ 2–8 °C ฉีดเวลาใดก็ได้แต่ควรใกล้เคียงกันทุกวัน</li>
  <li>ADR: N/V, acute pancreatitis · C/I: pancreatitis, <b>medullary thyroid carcinoma</b>, eGFR &lt; 15</li>
</ul>
<h3>SGLT2 inhibitors (-gliflozin)</h3>
<ul>
  <li>แย่งกลูโคสจับ SGLT2 ไม่ถูกดูดกลับที่ไต ขับทางปัสสาวะ → ลดน้ำตาล ลด BP ลดน้ำหนัก ปัสสาวะมากขึ้น</li>
  <li>Empa, cana = ลด CVE และ CVD death · empa, cana, dapa, ertu = ลด HF hospitalization · empa, cana, dapa = ชะลอ CKD</li>
  <li>ADR: ติดเชื้อทางเดินปัสสาวะ · cana, dapa = กระดูกหัก · cana, ertu = lower limb amputation</li>
  <li>C/I: ขาดน้ำ BP ต่ำ eGFR &lt; 45 ESRD</li>
</ul>
<h3>Insulin</h3>
<div class="tbl"><table>
  <tr><th>ชนิด</th><th>ยา</th><th>วิธีใช้</th></tr>
  <tr><td>Short acting (human regular)</td><td>Actrapid, Humulin R</td><td>IV, SC · <b>ก่อนอาหาร 30 นาที</b> · ห้ามฉีดก่อนนอน (hypoglycemia)</td></tr>
  <tr><td>Rapid acting analogue</td><td>aspart, lispro, glulisine</td><td>ออกฤทธิ์เร็วขึ้น สั้นลง · IV, SC · <b>ก่อนอาหาร 0–15 นาที</b></td></tr>
  <tr><td>NPH (intermediate)</td><td></td><td>มักฉีดก่อนนอน (21.00–23.00) เลี่ยงน้ำตาลตกดึก · ก่อนอาหารไม่เกิน 30 นาที · <b>ต้องเขย่าขวดก่อนฉีด</b> · เสี่ยงน้ำตาลตกมากกว่า</td></tr>
  <tr><td>Glargine-100</td><td></td><td>ห้ามผสมกับ insulin อื่น · duration 24 ชม. · ก่อนนอน 21.00–23.00</td></tr>
  <tr><td>Determir</td><td></td><td>อายุ 42 วัน เก็บอุณหภูมิห้อง · ห้ามผสม</td></tr>
  <tr><td>Degludec</td><td></td><td>อายุไม่เกิน 8 สัปดาห์ · ห้ามผสม</td></tr>
  <tr><td>Premixed</td><td>short/rapid + intermediate</td><td>ฉีดตามชนิดที่ออกฤทธิ์สั้นกว่า · แกว่งเบา ๆ ก่อนฉีด</td></tr>
</table></div>
<ul>
  <li><b>เก็บ:</b> ยังไม่เปิดเก็บตู้เย็น 2–8 °C · เปิดแล้วเก็บอุณหภูมิห้อง (25 °C) · เอาออกจากตู้เย็นแล้วปรับอุณหภูมิก่อนฉีด (คลึงในมือ) ไม่งั้นเจ็บ</li>
  <li><b>เทคนิคฉีด:</b> เช็ดแอลกอฮอล์ · ห่างสะดือ 2 นิ้วมือ · แต่ละจุดห่างกัน ≥ 1 นิ้ว · <mark>ฉีดที่เดิมได้เมื่อผ่านไป 4 สัปดาห์</mark> · หยิบผิวขึ้น ฉีดตั้งฉาก 90° คาเข็ม 10 วินาที · ไม่นวดคลึงจุดฉีด · หลอดใหม่ test 2 units ก่อน</li>
  <li>ADR: hypoglycemia, weight gain, lipodystrophy (ฉีดที่เดิมซ้ำ)</li>
</ul>
<h3>สรุปจำง่าย</h3>
<div class="tbl"><table>
  <tr><th>ประเด็น</th><th>ยา</th></tr>
  <tr><td>ลด CVE/CV death</td><td>empa, cana · liraglutide, semaglutide, dulaglutide · metformin</td></tr>
  <tr><td>ลด HF hospitalization</td><td>SGLT2i ทุกตัว</td></tr>
  <tr><td>ชะลอ CKD</td><td>empa, cana, dapa · liraglutide, semaglutide, dulaglutide</td></tr>
  <tr><td>น้ำหนักเพิ่ม</td><td>sulfonylurea · insulin (ระยะยาว) · pioglitazone</td></tr>
  <tr><td>ต้องปรับตามไต</td><td>metformin · insulin · DPP-4i (ยกเว้น linagliptin) · SGLT2i · GLP-1 RA</td></tr>
</table></div>` },
    { id: 'sick', t: 'Sick day และสมุนไพร', html: `<h3>Sick day management</h3>
<div class="tbl"><table>
  <tr><th>ตัวอักษร</th><th>สิ่งที่ต้องทำ</th></tr>
  <tr><td><b>S</b>ugar</td><td>ตรวจน้ำตาลทุก 2–3 ชม. (ถี่กว่านี้ในหญิงตั้งครรภ์หรือเด็ก)</td></tr>
  <tr><td><b>I</b>nsulin</td><td><mark>ไม่หยุดอินซูลิน</mark>แม้เจ็บป่วย กัน DKA</td></tr>
  <tr><td><b>C</b>arbs</td><td>ได้คาร์บและของเหลวพอ · น้ำตาลสูงเลือกเครื่องดื่มไม่มีน้ำตาล · น้ำตาลต่ำเลือกเครื่องดื่มมีคาร์บ</td></tr>
  <tr><td><b>K</b>etones</td><td>ตรวจคีโตนทุก 4 ชม. · พบคีโตนใช้ rapid-acting insulin · ดื่มน้ำมากพอช่วยขับคีโตน</td></tr>
</table></div>
<div class="key"><strong class="k">SADMANS</strong>ถ้ารักษาปริมาณน้ำไม่ได้ (กินน้อย อาเจียน ท้องเสียมาก ไข้สูง เหงื่อมาก) ให้<b>หยุดยาชั่วคราว</b>: <b>S</b>GLT2i · <b>A</b>CEI · <b>D</b>iuretics · <b>M</b>etformin · <b>A</b>RBs · <b>N</b>SAIDs · <b>S</b>ulfonylureas<br>เสี่ยงต่อไต: ACEI/ARB, diuretics, NSAIDs · กำจัดลดลงและเสี่ยง ADR: metformin, SGLT2i · กลับมาใช้ได้เมื่อกินและดื่มปกติ 24–48 ชม.</div>
<h3>สมุนไพรลดน้ำตาล ลดน้ำหนัก</h3>
<div class="tbl"><table>
  <tr><th>สมุนไพร</th><th>ส่วนที่ใช้ / กลไก</th><th>ข้อควรระวัง</th></tr>
  <tr><td><b>มะระขี้นก</b> (Momordica charantia)</td><td>ผลสีเขียวสด ลด FPG, PPG, A1C เพิ่มการสร้าง insulin เพิ่มความไว ยับยั้งการดูดซึมกลูโคสและเอนไซม์กลูโคซิเดส · charantin, curcubitacins, polypeptide-p, polypeptide-k · คั้นน้ำดื่มหลังอาหารเช้าหรือเย็น</td><td><b>ห้ามหยุดยาแผนปัจจุบัน</b> · ADR hypoglycemic coma ท้องเดิน ท้องอืด · ระวังร่วมยาลดน้ำตาล · <mark>ห้ามในเด็ก หญิงให้นมบุตร</mark></td></tr>
  <tr><td><b>กระเจี๊ยบแดง</b> (Hibiscus sabdariffa)</td><td>กลีบเลี้ยง · ยับยั้ง α-glucosidase และ α-amylase ลด ROS · anthocyanins, delphinidin, β-carotene · 500 mg/kg ลด FPG</td><td>ปวดมวนท้อง ท้องเสีย (ระบาย) · <b>ห้ามในไตบกพร่อง</b> (เปรี้ยว กรดสูง)</td></tr>
  <tr><td><b>ขมิ้นชัน</b></td><td>เหง้า · ลด lipid peroxidation ลด FPG, A1C, TG, TC, LDL · curcumin</td><td><b>ห้ามในท่อน้ำดีอุดตัน</b> · ระวังนิ่วถุงน้ำดี ตั้งครรภ์ ยาต้านการแข็งตัวของเลือด ยาผ่าน CYP (ยับยั้ง 3A4, 1A2 กระตุ้น 2A6) ยามะเร็ง (doxorubicin, cyclophosphamide)</td></tr>
  <tr><td><b>กระเทียม</b> (Allium sativum)</td><td>หัวใต้ดิน · ยับยั้ง HMG-CoA reductase ลดไขมัน ยับยั้งเกล็ดเลือด เพิ่มการหลั่งและความไวต่อ insulin · alliin, allicin · non-enteric coated 600–900 mg/วัน แบ่ง 3 ครั้ง (สด 2–5 g, ผง 0.4–1.2 g, สารสกัด 300–1,000 mg)</td><td>DI: anticoagulant, antiplatelet, fish oil, แปะก๊วย · เลี่ยงก่อนผ่าตัด/ทำฟัน · ห้ามในคนแพ้ · ระวังแผลในกระเพาะ bleeding disorder</td></tr>
  <tr><td><b>เทียนเกล็ดหอย</b></td><td>soluble fiber (ดื่มน้ำตามมาก ๆ)</td><td>ดูดซับยาแผนปัจจุบัน · ระวังลำไส้อุดตัน</td></tr>
  <tr><td><b>ส้มแขก</b> (Garcinia cambogia)</td><td>ผล · เผาผลาญไขมัน ยับยั้งการเปลี่ยนน้ำตาลเป็นไขมัน · hydroxycitric acid (HCA) 1.2–8 g/day</td><td>ปวดศีรษะ คลื่นไส้ · น้ำหนักลดช้า ๆ กินให้ครบ 5 หมู่ ออกกำลังกายร่วม</td></tr>
</table></div>` },
  ],
  questions: [
    { q: 'ผลตรวจทางห้องปฏิบัติการข้อใดบ่งบอกว่าเป็น DM', o: ['Blood glucose > 150 mg/dL', 'HbA1c < 7%', 'ปัสสาวะมากกว่า 3 ลิตร/วัน', 'Insulin ในเลือดต่ำ', 'Glucose tolerance test > 200 mg/dL'], a: 4, e: 'OGTT ที่ 2 ชม. ≥ 200 mg/dL · เกณฑ์อื่น: FBS ≥ 126 mg/dL และ HbA1c ≥ 6.5%' },
    { q: 'ข้อใดไม่ใช่ S/E ของยาลดระดับน้ำตาลชนิดรับประทาน', o: ['Lipoatrophy', 'Hypoglycemia', 'Ketonuria', 'Hepatotoxic', 'Lactic acidosis'], a: 0, e: 'Lipoatrophy (ไขมันฝ่อบริเวณที่ฉีด) เป็นผลข้างเคียงเฉพาะของการฉีด insulin จากอินซูลินรุ่นเก่าหรือฉีดซ้ำตำแหน่งเดิม' },
    { q: 'ข้อใดเป็นปัจจัยเสี่ยงต่อการเป็นเบาหวานและโรคหัวใจและหลอดเลือด', o: ['แม่เป็นเบาหวานและความดัน', 'แม่ตายด้วยโรคหัวใจขาดเลือด', 'สูบบุหรี่วันละ 20 มวน', 'ออกกำลังกาย 1–2 ครั้ง/เดือน', 'ดื่มไวน์ 1–2 แก้ว/เดือน'], a: 1, e: 'ประวัติครอบครัว โดยเฉพาะมารดาที่เสียชีวิตจากโรคหัวใจขาดเลือด เป็นปัจจัยเสี่ยงทางพันธุกรรม (non-modifiable) ที่สำคัญมาก' },
    { q: 'ภาวะแทรกซ้อนใดไม่จำเป็นต้องแนะนำให้ผู้ป่วยเบาหวานเฝ้าระวัง', o: ['ความดันโลหิตสูง', 'ไขมันในเลือดสูง', 'โรคหลอดเลือดหัวใจ', 'โรคต้อกระจก', 'โรคเกาต์'], a: 4, e: 'ความดันสูง ไขมันสูง โรคหลอดเลือดหัวใจ (macrovascular) และต้อกระจก (microvascular) เป็นภาวะแทรกซ้อนหลักที่ต้องเฝ้าระวัง ส่วนเกาต์ไม่ใช่ภาวะแทรกซ้อนโดยตรงของเบาหวาน' },
    { q: 'ผลข้างเคียงสำคัญที่ต้องเฝ้าระวังเป็นพิเศษสำหรับยากลุ่ม thiazolidinedione', o: ['Renal toxicity', 'Retinopathy', 'Hepatotoxicity', 'Hemolytic anemia', 'Cardiotoxicity'], a: 2, e: 'TZDs เช่น pioglitazone มีคำเตือนเรื่องพิษต่อตับ ต้องติดตาม LFT (นอกจากนี้ระวังบวมน้ำ/หัวใจล้มเหลว)' },
    { q: 'ข้อใดไม่ถูกต้องเกี่ยวกับ metformin', o: ['กลไกคือกระตุ้นให้ตับอ่อนหลั่งอินซูลิน', 'ลดระดับน้ำตาลโดยเพิ่มการใช้กลูโคสในร่างกาย', 'ควรกินหลังอาหารทันที เพราะบางรายคลื่นไส้อาเจียน', 'ไม่ควรใช้ในผู้ป่วยโรคไต เนื่องจากเพิ่มการสร้าง lactic', 'ใช้ร่วมกับ sulfonylureas และ insulin ได้'], a: 0, e: 'Metformin ยับยั้งการสร้างกลูโคสที่ตับ (decrease hepatic gluconeogenesis) และเพิ่มความไวต่อ insulin ไม่ได้กระตุ้นตับอ่อนหลั่ง insulin (นั่นคือ sulfonylureas)' },
    { q: 'ควรได้วิตามินอะไรเสริมในผู้ป่วยที่ใช้ metformin', o: ['Thiamine', 'Riboflavin', 'Niacin', 'Pyridoxine', 'Cobalamin'], a: 4, e: 'Metformin ระยะยาวขัดขวางการดูดซึม B12 ที่ลำไส้เล็ก เสี่ยงโลหิตจางและชาปลายมือปลายเท้า ควรเสริม cobalamin (B12)' },
    { q: '2 เดือนต่อมา FBS 120 HbA1C 7% eGFR 25 ผู้ป่วยได้ metformin อยู่ ควรจัดการอย่างไร', o: ['เพิ่ม glipizide', 'เปลี่ยน glipizide เป็น glibenclamide', 'ลดขนาด metformin', 'เปลี่ยน metformin เป็น pioglitazone', 'หยุด metformin'], a: 4, e: 'ข้อห้ามเด็ดขาดของ metformin คือ eGFR < 30 เพราะยาสะสมเสี่ยง lactic acidosis จึงต้องหยุดทันที' },
  ],
}
