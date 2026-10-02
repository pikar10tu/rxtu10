// Hypertension — converted from the RxTU10 class summary PDF (see content/summaries/manifest.json)
// ⚠️ ต้นฉบับไม่มีเฉลยข้อสอบ — เฉลยในไฟล์นี้ผู้แปลงใส่เอง (keyBy: 'converter') ให้ติดป้ายในคลัง
export default {
  id: 'htn',
  date: '18/7/2026',
  refs: [
    'สมาคมความดันโลหิตสูงแห่งประเทศไทย. แนวทางการรักษาโรคความดันโลหิตสูงในเวชปฏิบัติทั่วไป พ.ศ. 2567. https://thaihypertension.org/wp-content/uploads/2025/07/Guideline2024.pdf',
    'American Heart Association. High Blood Pressure Guidelines. https://www.ahajournals.org/guidelines/high-blood-pressure',
    'กรมการแพทย์แผนไทยและการแพทย์ทางเลือก. องค์ความรู้ความดันโลหิตสูง. 2019',
    'Alexander MR. Hypertension Clinical Presentation. Medscape; 2023',
    'StatPearls: Calcium Channel Blockers (NBK482473), Thiazide Diuretics (NBK532918), ACE Inhibitors (NBK430896), ARB (NBK537027), Alpha-Blockers (NBK556066), Vasodilators (NBK554423), Loop Diuretics (NBK546656)',
    'Klabunde RE. Aldosterone Antagonists. CV Pharmacology Concepts; 2022',
    'British Heart Foundation. Calcium channel blockers',
  ],
  sections: [
    { id: 'def', t: 'นิยาม', html: `<ul>
  <li><b>Arterial blood pressure:</b> แรงดันเลือดในหลอดเลือดแดง · ค่าบน (systolic) = ขณะหัวใจบีบ · ค่าล่าง (diastolic) = ขณะหัวใจคลายตัว</li>
  <li><b>Mean arterial pressure (MAP):</b> ความดันเฉลี่ยใน 1 รอบการเต้น ใช้ประเมินว่าเลือดไปเลี้ยงสมอง ไต หัวใจพอไหม แม่นกว่าดูค่าบนหรือล่างอย่างเดียว
    <div class="key"><strong class="k">MAP</strong>MAP = (SBP + 2 × DBP) / 3 · ปกติ 70–100 mmHg</div>
  </li>
  <li><b>Hypertension:</b> แรงดันเลือดต่อผนังหลอดเลือดแดงสูงเกินมาตรฐานเรื้อรัง <mark>BP ≥ 140/90</mark> · มักไม่มีอาการ แต่ทำให้เกิดโรคหัวใจ stroke หลอดเลือดแดงใหญ่โป่งพอง ไตวาย ทุพพลภาพหรือเสียชีวิต · ความเสี่ยงเพิ่มตั้งแต่ BP &gt; 115/75</li>
</ul>` },
    { id: 'patho', t: 'Pathophysiology', html: `<div class="key"><strong class="k">สูตร</strong>BP = cardiac output (CO) × total peripheral resistance (TPR)</div>
<ul>
  <li>BP เปลี่ยน → ระบบประสาทอัตโนมัติคุมก่อน (<b>baroreceptor reflex</b>)
    <ul>
      <li>BP↑ → parasympathetic ทำงาน → หัวใจบีบน้อยลง เต้นช้าลง</li>
      <li>BP↓ → sympathetic ทำงาน → หัวใจบีบแรง เต้นเร็ว หลอดเลือดหดตัว หลั่ง renin ที่ไต</li>
    </ul>
  </li>
  <li>ถ้าระบบประสาทอัตโนมัติคุมไม่ได้ → <b>RAAS</b> ช่วยคุม: angiotensinogen →(renin)→ Ang I →(ACE)→ <b>Ang II</b>
    <ul>
      <li>ต่อมหมวกไต: หลั่ง aldosterone → ไตดูดกลับน้ำและ Na⁺</li>
      <li>สมอง: กระตุ้นความหิวน้ำที่ hypothalamus เก็บน้ำและเกลือ → CO↑ → BP↑</li>
      <li>หลอดเลือด: vasoconstriction, หลั่ง catecholamine จาก adrenal medulla, sympathetic จาก CNS → peripheral resistance↑</li>
    </ul>
  </li>
</ul>
<h3>ชนิด</h3>
<ul>
  <li><b>Primary HTN</b> (พบบ่อยที่สุด): ไม่ทราบสาเหตุแน่ชัด สัมพันธ์กับกินเค็ม กรรมพันธุ์ หลอดเลือดผิดปกติจากอ้วน อายุ เชื้อชาติ ไขมันสูง ไม่ออกกำลังกาย บุหรี่ แอลกอฮอล์ ความเครียด</li>
  <li><b>Secondary HTN</b> (พบน้อย):
    <ul>
      <li>โรค: renal parenchymal disease (CKD, กรวยไตอักเสบ), obstructive sleep apnea, โรคไทรอยด์</li>
      <li>ยา: NSAIDs, steroid, decongestant, ยาคุมกำเนิด, amphetamines</li>
    </ul>
  </li>
</ul>
<h3>Clinical presentation</h3>
<p>ส่วนใหญ่ไม่มีอาการ บางรายปวดหัว เวียนหัว มึนงง เหนื่อยง่าย · ความดันสูงนาน ๆ ผนังหลอดเลือดหนาขึ้น รูเล็กลง เกิด <b>target organ damage (TOD)</b></p>
<ul>
  <li>หัวใจ: angina, เคย MI, เคยทำ revascularization, HF, LVH, ischemic heart disease</li>
  <li>สมอง: stroke, TIA, dementia</li>
  <li>ไต: CKD · หลอดเลือด: PAD · ตา: retinopathy</li>
</ul>` },
    { id: 'class', t: 'การแบ่งระดับ', html: `<h3>แนวทางไทย พ.ศ. 2567</h3>
<div class="tbl"><table>
  <tr><th>ระดับ</th><th class="num">SBP (mmHg)</th><th></th><th class="num">DBP (mmHg)</th></tr>
  <tr><td>Optimal</td><td class="num">&lt; 120</td><td>และ</td><td class="num">&lt; 80</td></tr>
  <tr><td>Normal</td><td class="num">120–129</td><td>และ/หรือ</td><td class="num">&lt; 80</td></tr>
  <tr><td>BP at risk</td><td class="num">130–139</td><td>และ/หรือ</td><td class="num">80–89</td></tr>
  <tr><td>ความดันสูงระดับ 1</td><td class="num">140–159</td><td>และ/หรือ</td><td class="num">90–99</td></tr>
  <tr><td>ความดันสูงระดับ 2</td><td class="num">160–179</td><td>และ/หรือ</td><td class="num">100–109</td></tr>
  <tr><td>ความดันสูงระดับ 3</td><td class="num">≥ 180</td><td>และ/หรือ</td><td class="num">≥ 110</td></tr>
  <tr><td>Isolated systolic HTN</td><td class="num">≥ 140</td><td>และ</td><td class="num">&lt; 90</td></tr>
  <tr><td>Isolated diastolic HTN</td><td class="num">&lt; 140</td><td>และ</td><td class="num">≥ 90</td></tr>
</table></div>
<h3>เทียบแนวทางต่างประเทศ</h3>
<div class="tbl"><table>
  <tr><th>ระดับ</th><th>ACC/AHA 2025</th><th>ESH/ESC 2024</th><th>JNC 8</th></tr>
  <tr><td>Normal</td><td class="num">&lt; 120 และ &lt; 80</td><td class="num">&lt; 120 / &lt; 70</td><td class="num">&lt; 120 / &lt; 80</td></tr>
  <tr><td>Elevated / pre-HTN</td><td class="num">120–129 และ &lt; 80</td><td class="num">120–139 / 70–89</td><td class="num">120–139 หรือ 80–89</td></tr>
  <tr><td>Stage 1</td><td class="num">130–139 หรือ 80–89</td><td class="num">140–159 / 90–99</td><td class="num">140–159 หรือ 90–99</td></tr>
  <tr><td>Stage 2</td><td class="num">≥ 140 หรือ ≥ 90</td><td class="num">160–179 / 100–109</td><td class="num">≥ 160 หรือ ≥ 100</td></tr>
  <tr><td>Stage 3</td><td>—</td><td class="num">≥ 180 / ≥ 110</td><td>—</td></tr>
</table></div>
<h3>Epidemiology</h3>
<p>ความดันสูงเป็นปัจจัยเสี่ยงอันดับต้นของการเสียชีวิตก่อนวัยอันควรทั่วโลก เป็นสาเหตุสำคัญของ stroke, CAD, HF, CKD และ PAD</p>
<h3>Risk factors</h3>
<div class="tbl"><table>
  <tr><th>Modifiable</th><th>Non-modifiable</th></tr>
  <tr><td><b>พฤติกรรม:</b> โซเดียมสูง · น้ำหนักเกิน/อ้วน (BMI ≥ 25 ในคนเอเชีย) · ไม่ออกกำลังกาย · สูบบุหรี่ · ดื่มแอลกอฮอล์มาก · เครียดเรื้อรัง · นอนไม่พอ/OSA<br>
  <b>โรคร่วม:</b> เบาหวาน CKD ไขมันสูง metabolic syndrome โรคหัวใจและหลอดเลือด<br>
  <b>ยา/สาร:</b> NSAIDs, ยาคุมกำเนิด, corticosteroids, decongestants (pseudoephedrine), calcineurin inhibitors (cyclosporine, tacrolimus), erythropoietin, cocaine, amphetamine</td>
  <td>อายุ (โดยเฉพาะ ≥ 65 ปี) · พันธุกรรม/ครอบครัว · เพศ (ชายเสี่ยงกว่าก่อน 55 ปี หญิงเสี่ยงขึ้นหลังหมดประจำเดือน) · เชื้อชาติ (เชื้อสายแอฟริกันเสี่ยงกว่า)</td></tr>
</table></div>` },
    { id: 'dx', t: 'วินิจฉัยและเป้าหมาย', html: `<ul>
  <li><b>Office BP:</b> วัดในสถานพยาบาลโดยบุคลากรหรือเครื่องอัตโนมัติตามมาตรฐาน</li>
  <li><b>HBPM:</b> วัดเองที่บ้านด้วยเครื่องต้นแขนที่ผ่านการรับรอง (validated upper-arm device)</li>
  <li><mark>White-coat (isolated office) HTN:</mark> วัดที่สถานพยาบาล ≥ 140/90 แต่วัดนอกสถานพยาบาลปกติ</li>
  <li><mark>Masked HTN:</mark> วัดที่สถานพยาบาลปกติ แต่วัดนอกสถานพยาบาลสูง</li>
</ul>
<figure><img data-fig="htn/p07-1.webp" alt="แผนภาพคัดกรอง white-coat hypertension และ masked hypertension ในผู้ใหญ่ที่ยังไม่ได้ใช้ยา"><figcaption>Algorithm คัดกรอง white-coat และ masked hypertension (ผู้ใหญ่ที่ยังไม่ได้ใช้ยา)</figcaption></figure>
<h3>เป้าหมายตามกลุ่มผู้ป่วย</h3>
<div class="tbl"><table>
  <tr><th>กลุ่มผู้ป่วย</th><th class="num">เป้า BP</th></tr>
  <tr><td>อายุ 18–64 ปี</td><td class="num">&lt; 130/80</td></tr>
  <tr><td>อายุ 65–79 ปี</td><td class="num">&lt; 140/90 (ทนได้ดี &lt; 130/80)</td></tr>
  <tr><td>อายุ 65–79 ปี ที่เป็น ISH</td><td class="num">&lt; 140–150/90</td></tr>
  <tr><td>อายุ &gt; 80 ปี</td><td class="num">&lt; 140–150/80</td></tr>
  <tr><td>เคยเป็น stroke</td><td class="num">&lt; 120–130/70–80</td></tr>
  <tr><td>เบาหวาน</td><td class="num">&lt; 130/80</td></tr>
  <tr><td>เบาหวานอายุน้อย คุมง่าย หรือมี albuminuria</td><td class="num">&lt; 130/80</td></tr>
  <tr><td>CKD ไม่มี albuminuria หรือ albuminuria &lt; 30 mg/day</td><td class="num">&lt; 140/90</td></tr>
  <tr><td>CKD มี albuminuria ≥ 30 mg/day</td><td class="num">&lt; 120–130/70–79</td></tr>
  <tr><td>เคยเป็น CVD</td><td class="num">&lt; 130/80</td></tr>
</table></div>
<p><b>แนวทางไทย 2567:</b> ลด BP ≤ 140/90 ถ้าทนได้ดีไม่มีผลข้างเคียง ปรับให้ ≤ 130/80</p>
<figure><img data-fig="htn/p08-1.webp" alt="เป้าหมายความดันโลหิตตาม ACC/AHA guideline 2025"><figcaption>เป้าหมายตาม ACC/AHA 2025</figcaption></figure>` },
    { id: 'lifestyle', t: 'Lifestyle modification', html: `<div class="tbl"><table>
  <tr><th>การปรับเปลี่ยน</th><th>คำแนะนำ</th></tr>
  <tr><td>ลดน้ำหนัก</td><td>BMI 18.5–22.9 kg/m² · รอบเอวคนไทย ชาย &lt; 90 cm หญิง &lt; 80 cm หรือไม่เกินส่วนสูงหารสอง</td></tr>
  <tr><td>อาหาร</td><td><b>DASH</b>: อาหารไม่แปรรูป แป้ง/ธัญพืชไม่ขัดสี ถั่วเปลือกแข็ง ผัก ผลไม้ โปรตีนไขมันอิ่มตัวต่ำ</td></tr>
  <tr><td>จำกัดโซเดียม</td><td><mark>โซเดียม ≤ 2 g/วัน</mark> = เกลือแกง 1 ช้อนชา (5 g) หรือน้ำปลา/ซีอิ๊วขาว 3 ช้อนชา</td></tr>
  <tr><td>ออกกำลังกาย</td><td>แอโรบิกอย่างน้อย 5 วัน/สัปดาห์ (≥ 150 นาที/สัปดาห์) ไม่งดติดกันเกิน 2 วัน</td></tr>
  <tr><td>แอลกอฮอล์</td><td>หญิง ≤ 1 standard drink/วัน ชาย ≤ 2 · มี alcohol-free day ทุกสัปดาห์</td></tr>
  <tr><td>บุหรี่</td><td>เลิกสูบ</td></tr>
</table></div>` },
    { id: 'diuretic', t: 'ยาขับปัสสาวะ', html: `<h3>1. Thiazide diuretics</h3>
<p>Hydrochlorothiazide (HCTZ), indapamide, chlorthalidone</p>
<ul>
  <li><b>MOA:</b> ยับยั้ง Na⁺/Cl⁻ cotransporter ที่ต้น DCT → ลดการดูดกลับ Na⁺ และน้ำ · ร่างกายชดเชยด้วย Na⁺/Ca²⁺ exchange → <b>ดูดกลับ Ca²⁺ มากขึ้น</b> · Na⁺ ไปถึงปลาย DCT/collecting tubule มากขึ้น → aldosterone เร่ง Na⁺/K⁺ pump → <b>ขับ K⁺ และ H⁺</b></li>
  <li>สรุป: ขับน้ำและเกลือ เก็บ Ca²⁺ ไว้ เสีย K⁺</li>
  <li>ตับบกพร่อง: ระวัง อาจกระตุ้น hepatic coma · บวมจากตับแข็งมักใช้ spironolactone + loop แทน</li>
  <li>ไตบกพร่อง: ฤทธิ์ลดลงเมื่อ GFR ลด แนะนำ loop มากกว่า · <mark>chlorthalidone, metolazone, indapamide ใช้ใน eGFR &lt; 30 ได้</mark> · thiazide + loop ขับปัสสาวะดีแต่ระวัง AKI, hypokalemia, hypomagnesemia</li>
  <li>ตั้งครรภ์: second line (อาจลดปริมาตรเลือดแม่ ทารกโตช้า น้ำคร่ำน้อย) · ให้นมบุตร: ขนาดต่ำ ขนาดสูงอาจลดน้ำนม</li>
  <li>มีโครงสร้าง sulfonamide → เลี่ยงในคนแพ้ sulfonamide</li>
</ul>
<div class="tbl"><table>
  <tr><th>ผลข้างเคียง</th><th>ข้อห้ามใช้</th><th>Drug interaction</th></tr>
  <tr><td>hypokalemia, hyponatremia, metabolic alkalosis, <b>hypercalcemia, hyperglycemia, hyperuricemia, hyperlipidemia</b>, sulfonamide allergy, pancreatitis</td><td>anuria, แพ้ sulfonamide</td><td>digitalis glycosides, corticosteroids/ACTH, curariform drugs, lithium, salicylates/NSAIDs</td></tr>
</table></div>
<h3>2. Loop diuretics</h3>
<p>Furosemide, torasemide, bumetanide</p>
<ul>
  <li><b>MOA:</b> ยับยั้ง Na-K-2Cl cotransporter ที่ thick ascending limb → ขับน้ำและเกลือ ลดการดูดกลับ Ca และ Mg</li>
  <li>ตัวเลือกในปัญหาไต (บวมน้ำ, CKD, renal failure: <b>GFR &lt; 30 หรือ Scr &gt; 2 mg/dL</b>) ได้ผลดีเมื่อ GFR &gt; 15</li>
  <li>ลด BP ได้น้อยกว่า thiazide เพราะออกฤทธิ์สั้นกว่า</li>
  <li>t½ (ในไต/ตับ/HF): furosemide 1.5–2 ชม. (ถึง 2.6) · bumetanide 1 ชม. (1.3–1.6) · <b>torsemide 3–4 ชม. (5–6) ยาวสุด</b> ขับปัสสาวะดีกว่าในโรคตับหรือ HF</li>
</ul>
<div class="tbl"><table>
  <tr><th>ผลข้างเคียง</th><th>ข้อห้ามใช้</th><th>Drug interaction</th></tr>
  <tr><td>hypomagnesemia, hyponatremia, hypokalemia, hypochloremia, hyperuricemia, hyperglycemia, hypertriglyceridemia, metabolic alkalosis, postural hypotension, <b>ototoxicity</b></td><td>anuria, hepatic coma, electrolyte depletion รุนแรง · แพ้ sulfonamide (ตัวที่เป็น sulfonamide derivative) · ระวังมากในขาดน้ำรุนแรง hypovolemia</td><td>digoxin (toxicity↑), NSAIDs (AKI↑), lithium (ไตดูดกลับ Li มากขึ้น), aminoglycoside (พิษต่อหูเสริมกัน)</td></tr>
</table></div>
<h3>3. K-sparing diuretics</h3>
<p><b>Aldosterone antagonists (MRAs):</b> spironolactone, eplerenone — แย่งจับ mineralocorticoid receptor ที่ late DCT/collecting duct → ไม่สร้าง ENaC และไม่กระตุ้น Na⁺/K⁺-ATPase → เสีย Na⁺ เก็บ K⁺</p>
<ul>
  <li>ไม่ใช่ first line ใน HTN · ใช้ร่วม diuretic อื่นกัน hypokalemia · ใช้ใน CHF, liver cirrhosis, primary hyperaldosteronism</li>
</ul>
<div class="tbl"><table>
  <tr><th>ผลข้างเคียง</th><th>ข้อห้ามใช้</th><th>Drug interaction</th></tr>
  <tr><td>hyperkalemia, dizziness, headache, diarrhea, <b>gynecomastia</b> (เฉพาะ spironolactone ฤทธิ์ต้าน androgen หายเมื่อหยุดยา)</td><td>severe CKD (eGFR &lt; 30), hyperkalemia</td><td>ACEI/ARB, NSAIDs, K⁺ supplements</td></tr>
</table></div>
<p><b>Na channel blockers:</b> amiloride, triamterene — ยับยั้ง ENaC ที่ principal cell (late DCT, cortical collecting duct) → ดูดกลับ Na⁺ ลด → ขับ K⁺ และ H⁺ ลดลง · ไม่ใช่ first line ใช้ร่วมกัน hypokalemia</p>
<div class="tbl"><table>
  <tr><th>ผลข้างเคียง</th><th>ข้อห้ามใช้</th><th>Drug interaction</th></tr>
  <tr><td>hyperkalemia, ปากแห้ง, ท้องผูก, ท้องเสีย, dizziness, headache</td><td>severe CKD (eGFR &lt; 30), hyperkalemia</td><td>ACEI/ARB, NSAIDs, K⁺ supplements</td></tr>
</table></div>` },
    { id: 'raas', t: 'ACEI และ ARB', html: `<h3>4. ACE inhibitors</h3>
<p>Enalapril, captopril, ramipril, lisinopril</p>
<ul>
  <li><b>MOA:</b> competitive inhibitor ของ ACE → ไม่สร้าง Ang II → หลอดเลือดขยาย ลด aldosterone ขับ Na⁺ และน้ำ ลด adverse cardiac remodeling</li>
  <li>ACE สลาย bradykinin → ยาทำให้ <mark>bradykinin คั่ง → ไอแห้ง, angioedema</mark></li>
  <li>ใช้เดี่ยวหรือร่วม ผู้ใหญ่และเด็ก &gt; 6 ปี · แนะนำในโรคร่วม DM, CKD, CVD, stable ischemic disease, PAD · adjuvant ใน HFrEF และ MI</li>
  <li>CKD: ยาเริ่มต้นช่วยไตระยะยาว โดยเฉพาะ albuminuria ปานกลาง–รุนแรง ไม่ว่าเป็น DM หรือไม่</li>
  <li>CAD: chronic stable angina ร่วม LV ผิดปกติ, DM, CKD</li>
  <li>STEMI: เริ่มใน 24 ชม. แรก โดยเฉพาะ anterior MI</li>
  <li>เลี่ยงใน Child-Pugh C · <b>captopril และ lisinopril ไม่ใช่ prodrug</b> ใช้ได้</li>
</ul>
<div class="tbl"><table>
  <tr><th>ผลข้างเคียง</th><th>ข้อห้ามใช้</th><th>Drug interaction</th></tr>
  <tr><td>dry cough, dizziness, hypotension, BUN/Cr↑, syncope, hyperkalemia, angioedema, fetopathic</td><td>hypersensitivity, <b>pregnancy</b>, <b>bilateral renal artery stenosis</b></td><td>NSAIDs, K⁺-sparing diuretics, ARB, sulfonylureas, lithium, Mg supplements, azathioprine, allopurinol, fluconazole, ketoconazole, bupivacaine</td></tr>
</table></div>
<h3>5. ARBs</h3>
<p>Losartan, valsartan</p>
<ul>
  <li><b>MOA:</b> กั้น Ang II จับ AT1 receptor → หลอดเลือดขยาย ลดการเก็บน้ำและ Na⁺</li>
  <li>CKD: ยาหลักชะลอไต โดยเฉพาะ DM ที่มีโปรตีนรั่ว ระวัง hyperkalemia</li>
  <li>ตับ: losartan ผ่าน CYP2C9/3A4 · candesartan, olmesartan, azilsartan เป็น prodrug · ตับบกพร่องปานกลาง–รุนแรงยาสะสม BP ต่ำ → ลดขนาดเริ่มต้นหรือเลือกตัวที่ไม่ขับทางตับ</li>
</ul>
<div class="tbl"><table>
  <tr><th>ผลข้างเคียง</th><th>ข้อห้ามใช้</th><th>Drug interaction</th></tr>
  <tr><td>dizziness, fatigue, headache, hyperkalemia, hypotension, fetopathic</td><td>hypersensitivity, pregnancy, bilateral renal artery stenosis</td><td>ACEI, K⁺-sparing diuretics, NSAIDs, lithium</td></tr>
</table></div>` },
    { id: 'ccb', t: 'Calcium channel blockers', html: `<h3>Dihydropyridine (DHP)</h3>
<p>Nifedipine, amlodipine, felodipine, nitrendipine, nicardipine, isradipine</p>
<ul>
  <li>ยับยั้ง Ca เข้าเซลล์ → <b>ขยายหลอดเลือดแดงเป็นหลัก</b> TPR ลด BP ลด ป้องกันเจ็บหน้าอก</li>
  <li>ขยายหลอดเลือดมากกว่ากดหัวใจ → <b>reflex tachycardia</b> โดยเฉพาะ nifedipine · <mark>ห้าม immediate-release nifedipine ใน ischemic heart disease</mark> (ใช้รูป sustained-release ได้)</li>
  <li>เมตาบอลิซึมที่ตับ ตับบกพร่องมักต้องปรับขนาด · ไตบกพร่องโดยทั่วไปไม่ต้องปรับ</li>
</ul>
<div class="tbl"><table>
  <tr><th>ผลข้างเคียง</th><th>ข้อห้ามใช้</th><th>Drug interaction</th></tr>
  <tr><td>reflex tachycardia, headache, dizziness, flushing, orthostatic hypotension, chest pain, <b>edema</b></td><td>แพ้ยา, severe hypotension, severe aortic stenosis, acute MI (เฉพาะ short-acting nifedipine)</td><td>grapefruit, St John's wort, strong CYP3A4 inhibitors (clarithromycin, erythromycin, ketoconazole, itraconazole, ritonavir) และ inducers (rifampin, carbamazepine, phenytoin, phenobarbital)</td></tr>
</table></div>
<h3>Non-dihydropyridine</h3>
<p>Verapamil, diltiazem — กด SA node และการนำสัญญาณที่ AV node → ลดอัตราการเต้นและการบีบตัว · ใช้ใน HTN, PSVT (แปลงจังหวะ/ป้องกัน), AF/flutter, chronic stable angina, vasospastic angina</p>
<div class="tbl"><table>
  <tr><th>ผลข้างเคียง</th><th>ข้อห้ามใช้</th><th>Drug interaction</th></tr>
  <tr><td>ท้องผูก, orthostatic hypotension, liver enzyme↑, dizziness, fatigue, bradycardia, <b>gingival hyperplasia</b></td><td>severe bradycardia (HR &lt; 60), <mark>HFrEF</mark>, AV block degree 2–3, sick sinus syndrome</td><td>grapefruit, St John's wort, strong CYP3A4 inhibitors/inducers, P-gp inhibition โดย verapamil/diltiazem (carbamazepine, ciclosporin, fexofenadine, daunorubicin)</td></tr>
</table></div>` },
    { id: 'bb', t: 'Beta blockers และยาอื่น', html: `<h3>7. Beta blockers</h3>
<ul>
  <li><b>β1-selective:</b> atenolol, metoprolol, bisoprolol, nebivolol — ยับยั้ง β1 ที่หัวใจและ JG cell → cAMP↓ Ca²⁺ influx↓ renin↓</li>
  <li><b>Non-selective:</b> propranolol, timolol — ยับยั้งทั้ง β1 และ β2 (หลอดลม หลอดเลือด)</li>
  <li>β1 blockade → HR และ stroke volume ลด → CO ลด · β2 blockade → bronchoconstriction, vasoconstriction</li>
</ul>
<div class="tbl"><table>
  <tr><th>ผลข้างเคียง</th><th>ข้อห้ามใช้</th><th>Drug interaction</th></tr>
  <tr><td>bradycardia, negative inotropic, hypotension, fatigue, dizziness, ท้องผูก, sexual/erectile dysfunction, bronchospasm, hyperglycemia</td><td><b>asthma</b> (β2 blocker), HF ที่ยังไม่คงที่ (คงที่แล้วใช้ carvedilol, bisoprolol, metoprolol, nebivolol ได้), severe depression, bradycardia &lt; 60, AV block degree 2–3, PVD</td><td>reserpine, guanethidine, verapamil/diltiazem, digitalis, CYP2D6 inhibitors, rifampin</td></tr>
</table></div>
<h3>8. Alpha blockers</h3>
<p>Prazosin, doxazosin, terazosin — block α1 ที่กล้ามเนื้อเรียบหลอดเลือด → หลอดเลือดขยาย</p>
<ul>
  <li><mark>กินก่อนนอน</mark> (orthostatic hypotension) · ใช้ใน BPH ร่วมด้วย (คลายหูรูดกระเพาะปัสสาวะและต่อมลูกหมาก)</li>
  <li>ตับปานกลางเริ่มขนาดต่ำ ตับรุนแรงหลีกเลี่ยง · <b>ไม่ใช่ first line</b></li>
</ul>
<div class="tbl"><table>
  <tr><th>ผลข้างเคียง</th><th>ข้อห้ามใช้</th><th>Drug interaction</th></tr>
  <tr><td>postural hypotension, headache, ใจสั่นจาก reflex tachycardia, tachyphylaxis (เก็บเกลือและน้ำ)</td><td>hypersensitivity</td><td>NSAIDs, beta blocker, diuretics, PDE-5 inhibitors</td></tr>
</table></div>
<h3>9. Central alpha agonists</h3>
<p>Methyldopa, clonidine — กระตุ้น α2 ใน CNS → ลด sympathetic outflow</p>
<ul>
  <li><mark>Methyldopa = drug of choice ในหญิงตั้งครรภ์</mark></li>
  <li>Clonidine: ยาเสริมหรือในคนดื้อยา · <b>ห้ามหยุดกะทันหัน (rebound hypertension)</b></li>
  <li>ขับทางไต ปรับตามไต · ปรับขนาดในผู้สูงอายุและ recent MI</li>
</ul>
<div class="tbl"><table>
  <tr><th>ผลข้างเคียง</th><th>ข้อห้ามใช้</th><th>Drug interaction</th></tr>
  <tr><td>ง่วง ปากแห้ง ท้องผูก ซึมเศร้า bradycardia · autoimmune hemolytic anemia (methyldopa)</td><td>active hepatic disease (methyldopa)</td><td>TCAs, beta blocker, CNS depressants, MAOIs</td></tr>
</table></div>
<h3>10. Combined α/β blockers</h3>
<p>Carvedilol, labetalol — ยับยั้ง α1 + β1 + β2 ลดทั้งการทำงานของหัวใจและขยายหลอดเลือด ไม่มีผลเสียต่อเมตาบอลิซึมและไม่เพิ่ม peripheral resistance เหมือน beta อย่างเดียว</p>
<ul>
  <li>Carvedilol: HF, variceal bleeding, antiarrhythmic class II</li>
  <li><b>Labetalol:</b> HTN ในหญิงตั้งครรภ์, hypertensive emergency, cocaine toxicity, HF</li>
</ul>
<div class="tbl"><table>
  <tr><th>ผลข้างเคียง</th><th>ข้อห้ามใช้</th><th>Drug interaction</th></tr>
  <tr><td>orthostatic hypotension, bradycardia, dizziness, fatigue, bronchospasm, บดบังอาการ hypoglycemia</td><td>asthma/bronchospastic disease, severe bradycardia, AV block degree 2–3, sick sinus syndrome, cardiogenic shock, acute decompensated HF, แพ้ยา</td><td>verapamil, diltiazem, digoxin</td></tr>
</table></div>
<h3>11. Direct arterial vasodilators</h3>
<p>Hydralazine, minoxidil — คลายกล้ามเนื้อเรียบ arterioles โดยตรง BP ลดเร็ว · minoxidil เป็น prodrug (sulfotransferase → minoxidil sulfate) แรงกว่า hydralazine · ใช้ใน resistant hypertension</p>
<div class="tbl"><table>
  <tr><th>ผลข้างเคียง</th><th>ข้อห้ามใช้</th><th>Drug interaction</th></tr>
  <tr><td><b>Hydralazine:</b> headache, flushing, reflex tachycardia, <b>drug-induced lupus</b><br><b>Minoxidil:</b> reflex tachycardia, เก็บ Na⁺ และน้ำ, headache, <b>hypertrichosis</b></td><td>dissecting aortic aneurysm · ระวังในประวัติ cerebrovascular disease</td><td>ยาลดความดันอื่น (hypotension↑)</td></tr>
</table></div>` },
    { id: 'risk', t: 'ประเมินความเสี่ยง CV', html: `<figure><img data-fig="htn/p22-1.webp" alt="ASCVD risk estimator"><figcaption>ASCVD risk</figcaption></figure>
<figure><img data-fig="htn/p23-1.webp" alt="Thai CV risk score"><figcaption>Thai CV risk score</figcaption></figure>
<div class="key"><strong class="k">Thai CV risk</strong>10-year Thai CV risk &lt; 10% = เสี่ยงต่ำ · ≥ 10% = เสี่ยงปานกลางถึงสูง</div>
<figure><img data-fig="htn/p23-2.webp" alt="ตารางคำแนะนำการรักษาและการติดตามผลตามระดับความดันและความเสี่ยง"><figcaption>Recommendations for treatment and follow-up</figcaption></figure>
<figure><img data-fig="htn/p24-1.webp" alt="ACC/AHA guideline on the primary prevention of cardiovascular disease"><figcaption>ACC/AHA guideline on the primary prevention of CVD</figcaption></figure>` },
    { id: 'special', t: 'การรักษาตามโรคร่วม', html: `<h3>โรคหลอดเลือดหัวใจ</h3>
<ul>
  <li>เริ่มยาเมื่อ BP 130–139/85–89 เป้า ≤ 130/80 · ลด HR ให้อยู่ 60–80 ครั้ง/นาที</li>
  <li>ยาที่แนะนำ: ACEI/ARB, beta blocker, CCB</li>
</ul>
<h3>หัวใจล้มเหลว (เป้า &lt; 130/80)</h3>
<ul>
  <li><b>HFrEF:</b> ACEI/ARB/ARNI, beta blocker, MRA, SGLT2i · diuretics: ไม่มีน้ำคั่ง → thiazide/thiazide-like · น้ำคั่งหรือ eGFR &lt; 30 → loop · ใช้ครบแล้วไม่ดีขึ้น → เพิ่ม DHP-CCB · <mark>non-DHP CCB ทำให้ HF แย่ลง</mark> (negative inotropic)</li>
  <li><b>HFpEF:</b> ARNI, SGLT2i, spironolactone</li>
</ul>
<h3>CKD, renovascular disease, ปลูกถ่ายไต</h3>
<ul>
  <li>CKD = eGFR &lt; 60 หรือ albuminuria &gt; 30 mg/g Cr นานกว่า 3 เดือน · เป้า 120–130/70–79</li>
  <li>Albuminuria &lt; 30 mg/g: ACEI/ARB, beta blocker, CCB, thiazide/thiazide-like (ACEI ไม่มีประโยชน์เมื่อโปรตีนในปัสสาวะ &lt; 500 mg/day)</li>
  <li>Albuminuria &gt; 30 mg/g: <b>ACEI/ARB</b> ปรับถึงขนาดสูงสุด ติดตาม Cr ใน 4 สัปดาห์ · <mark>Cr เพิ่มไม่เกิน 30% ใช้ขนาดเดิมต่อได้</mark> · ลดยาเมื่อ hypotension, hyperkalemia, uremia (CKD 5) · ให้ potassium binder ให้ K &lt; 5.5 mmol/L เพื่อใช้ ACEI/ARB ต่อได้</li>
  <li>eGFR &gt; 45: ACEI/ARB, CCB, thiazide · eGFR 30–45: ACEI/ARB, CCB, loop</li>
  <li>Atherosclerotic renovascular disease: ACEI/ARB ติดตามใกล้ชิด · ปลูกถ่ายไต: ACEI/ARB, DHP-CCB</li>
</ul>
<h3>Stroke</h3>
<p>Acute ischemic stroke: ลด BP เมื่อ &gt; 185/110 ก่อนให้ thrombolysis หรือ mechanical thrombectomy · ยาที่แนะนำ <b>nicardipine</b> หรือ labetalol · ไม่ใช้ short-acting nifedipine</p>
<h3>PAD</h3>
<p>คุม SBP 120–129 ใช้ยากลุ่มหลักได้ทุกกลุ่ม (diuretics, CCB, RAS blockers, beta blockers)</p>
<h3>เบาหวาน</h3>
<p>Office BP &lt; 130/80 ยากลุ่มหลักตัวใดก็ได้ · มี albuminuria (UACR ≥ 30 mg/g) → <b>ACEI หรือ ARB</b></p>
<h3>สตรีตั้งครรภ์</h3>
<ul>
  <li>Preeclampsia-eclampsia: ความดันสูงร่วม proteinuria หรือ end-organ ผิดปกติ ที่ไม่เคยพบมาก่อน · หายได้ทางเดียวคือยุติการตั้งครรภ์</li>
  <li>มีอวัยวะผิดปกติ → <b>magnesium sulfate</b> ฉีดป้องกันชัก · hypertensive crisis → hydralazine IV/IM, nifedipine รับประทาน, labetalol IV</li>
</ul>
<h3>การติดตาม</h3>
<p>พบแพทย์สม่ำเสมอ ปรับยา เฝ้าระวังผลข้างเคียง · primary HTN ต้องกินยาต่อเนื่อง · secondary HTN ถ้าแก้สาเหตุได้ความดันอาจกลับมาปกติ</p>` },
  ],
  // ต้นฉบับมีแต่โจทย์ ไม่มีเฉลย → keyBy: 'converter' (ผู้แปลงเฉลยเอง ต้องติดป้ายให้เห็นในคลัง)
  questions: [
    { keyBy: 'converter', q: 'ชาย 55 ปี เป็นความดันสูงร่วมกับเบาหวานชนิดที่ 2 และมี albuminuria ควรเลือกยาลดความดันกลุ่มใดเป็นอันดับแรกเพื่อปกป้องไต', o: ['Amlodipine', 'Enalapril', 'HCTZ', 'Metoprolol'], a: 1 },
    { keyBy: 'converter', q: 'หญิง 32 ปี ตั้งครรภ์ 20 สัปดาห์ BP 150/95 ยาใดห้ามใช้อย่างเด็ดขาดในสตรีมีครรภ์เพราะอาจทำให้ทารกผิดปกติ (teratogenic)', o: ['Methyldopa', 'Labetalol', 'Nifedipine', 'Valsartan'], a: 3 },
    { keyBy: 'converter', q: 'หญิง 45 ปี วัดที่สถานพยาบาล 148/92 ทั้งสองครั้ง (ห่างกัน 15 นาที) ไม่มีอาการ ตรวจร่างกายและ EKG ปกติ แต่วัดที่บ้านไม่เกิน 120/80 เสมอ ควรทำอะไรต่อเพื่อยืนยันการวินิจฉัย', o: ['เริ่มยาลดความดันทันที', 'นัดวัดใหม่ที่สถานพยาบาลอีก 3 เดือน', 'ยืนยันด้วย HBPM หรือ ABPM 24 ชั่วโมง', 'ส่ง echocardiogram ก่อนเริ่มยา'], a: 2 },
    { keyBy: 'converter', q: 'ชาย 65 ปี มี HFrEF และความดันสูง ยาในกลุ่มใดมีข้อห้ามใช้อย่างชัดเจน', o: ['Bisoprolol', 'Enalapril', 'Verapamil', 'Spironolactone'], a: 2 },
    { keyBy: 'converter', q: 'หญิง 50 ปี ใช้ enalapril ต่อเนื่อง แล้วซื้อ naproxen มากินเองเพราะปวดเข่า ผลของการใช้ร่วมกันคือ', o: ['เพิ่มความเสี่ยงไอแห้ง', 'ลดประสิทธิภาพการลดความดัน และเพิ่มความเสี่ยงไตวายเฉียบพลัน', 'ระดับ enalapril สูงจนความดันต่ำรุนแรง', 'เพิ่มความเสี่ยง hyponatremia'], a: 1 },
    { keyBy: 'converter', q: 'ชาย 60 ปี ความดันสูงและ CKD ระยะ 3 เริ่ม enalapril 4 สัปดาห์ Cr เพิ่ม 25% จากเดิม K 4.8 mmol/L ควรแนะนำอย่างไร', o: ['หยุด enalapril ทันทีเพราะเกิด AKI', 'ลดขนาดลงครึ่งหนึ่ง', 'ใช้ขนาดเดิมต่อได้ และติดตามต่อเนื่อง', 'เปลี่ยนเป็น amlodipine ทันที'], a: 2 },
    { keyBy: 'converter', q: 'หญิง 45 ปี ใช้ lithium รักษาโรคอารมณ์สองขั้ว ตรวจพบความดันสูง ยาลดความดันกลุ่มใดเพิ่มความเสี่ยง lithium toxicity', o: ['Loop diuretics', 'Thiazide diuretics', 'ACE inhibitors / ARBs', 'ถูกทุกข้อ'], a: 3 },
  ],
}
