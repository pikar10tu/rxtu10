// Coronary artery disease — converted from the RxTU10 class summary PDF (see content/summaries/manifest.json)
export default {
  id: 'cad',
  date: '28 ก.ค. 2569',
  refs: [
    'ราชวิทยาลัยอายุรแพทย์แห่งประเทศไทย. แนวเวชปฏิบัติการดูแลรักษาผู้ป่วยภาวะหัวใจขาดเลือดเรื้อรัง พ.ศ. 2564',
    'สมาคมแพทย์โรคหัวใจแห่งประเทศไทย. แนวเวชปฏิบัติการดูแลรักษาผู้ป่วยภาวะหัวใจขาดเลือดเฉียบพลัน พ.ศ. 2563 (Thai ACS Guidelines 2020)',
    'Shahjehan RD, et al. Coronary artery disease. StatPearls (NBK564304)',
    'GRACE 3.0 risk calculator. https://www.grace-3.com · TIMI risk score calculator for UA/NSTEMI',
    'Jedsadayanmata A. Ischemic heart disease [lecture slides]. PM313 Pharmacotherapy; 2025',
    'Pattamawan K. P. Acute coronary syndrome [lecture slides]. PM313 Pharmacotherapy; 2025',
    'Rao SV, et al. 2025 ACC/AHA/ACEP/NAEMSP/SCAI guideline for the management of patients with acute coronary syndromes. Circulation. 2025;151(13):e771–862.',
  ],
  sections: [
    { id: 'def', t: 'นิยามและปัจจัยเสี่ยง', html: `<p>CAD = โรคจากการตีบแคบหรืออุดตันของ coronary artery ส่วนใหญ่จาก atherosclerotic plaque ทำให้เลือดไปเลี้ยงกล้ามเนื้อหัวใจลดลง เกิด myocardial ischemia</p>
<ul>
  <li><b>CCS (chronic coronary syndrome)</b> หลอดเลือดหัวใจตีบเรื้อรัง ได้แก่
    <ol>
      <li>สงสัยหัวใจขาดเลือด มีเจ็บหน้าอก/เหนื่อยหอบที่อาการคงที่</li>
      <li>HF หรือ LV dysfunction ครั้งแรกที่สงสัยหัวใจขาดเลือด</li>
      <li>อาการคงที่หลัง ACS ใน 1 ปีแรก หรือเพิ่งทำ revascularization</li>
      <li>หลังวินิจฉัยหรือทำ revascularization นานกว่า 1 ปี</li>
      <li>ไม่มีอาการแต่ตรวจพบจากการคัดกรอง</li>
    </ol>
  </li>
  <li><b>ACS (acute coronary syndrome)</b> หัวใจขาดเลือดเฉียบพลัน: unstable angina, NSTEMI, STEMI · ผ่านช่วง acute แล้วเข้าสู่ CCS</li>
</ul>
<h3>Risk factors</h3>
<ul>
  <li><b>Non-modifiable:</b> อายุ (ชาย &gt; 45, หญิง &gt; 55) · เพศชาย · ประวัติครอบครัว (first-degree, premature CHD ชาย &lt; 55 หญิง &lt; 65 ปี)</li>
  <li><b>Modifiable:</b> atherogenic diet, smoking, stress, obesity, physical inactivity, HTN, DM, dyslipidemia (โดยเฉพาะ LDL-C สูง), CKD</li>
</ul>` },
    { id: 'patho', t: 'Pathophysiology และอาการ', html: `<ol>
  <li><b>Endothelial dysfunction:</b> ปัจจัยเสี่ยงทำให้ endothelium บาดเจ็บ LDL ซึมผ่านมากขึ้น เกิด vascular inflammation</li>
  <li><b>Plaque formation:</b> oxidized LDL ถูก macrophage กิน → foam cells, fatty streak → cytokine กระตุ้น smooth muscle cell migration → atherosclerotic plaque</li>
  <li><b>Plaque progression:</b> plaque โตขึ้น หลอดเลือดแคบ blood flow ลด · stable plaque มี fibrous cap · <mark>unstable plaque แตกง่าย (plaque rupture)</mark></li>
  <li><b>Myocardial ischemia:</b> O₂ supply &lt; O₂ demand → เจ็บหน้าอก · plaque rupture → thrombus อุดตัน → ACS · ขาดเลือดนาน → MI</li>
</ol>
<div class="tbl"><table>
  <tr><th>ACS</th><th>CCS</th></tr>
  <tr><td>เจ็บหน้าอกอาจร้าวไปกราม คอ ไหล่ แขนซ้าย ใจสั่น เหงื่อออก หายใจลำบาก คลื่นไส้</td><td>เจ็บหน้าอกเวลาออกแรงหรือมี emotional stress เกิดซ้ำรูปแบบเดิม</td></tr>
  <tr><td><mark>มักเกิดขณะพัก นาน &gt; 20 นาที ไม่ดีขึ้นเมื่อพักหรืออมยาใต้ลิ้น</mark></td><td>เกิดเวลาออกแรง ไม่นาน ดีขึ้นเมื่อพักหรืออมยาใต้ลิ้น</td></tr>
</table></div>
<h3>Diagnosis</h3>
<div class="tbl"><table>
  <tr><th></th><th>Stable angina (CCS)</th><th>Unstable angina</th><th>NSTEMI</th><th>STEMI</th></tr>
  <tr><td>Plaque</td><td>stable</td><td colspan="3">unstable</td></tr>
  <tr><td>Troponin, CK-MB</td><td colspan="2">negative</td><td colspan="2">positive</td></tr>
  <tr><td>Chest pain</td><td>ออกแรง ดีขึ้นเมื่อพัก/nitrate</td><td colspan="3">ขณะพัก นาน ไม่หายด้วย nitrate SL</td></tr>
  <tr><td>ECG</td><td>ปกติ / ST-depression</td><td colspan="2">ST-depression และ/หรือ T-wave inversion</td><td><b>ST-elevation</b></td></tr>
</table></div>` },
    { id: 'severity', t: 'ประเมินความรุนแรง', html: `<p>NSTE-ACS ทุกรายควรทำ <b>risk stratification</b> ด้วย GRACE หรือ TIMI ตาม Thai ACS Guidelines 2020</p>
<ul>
  <li><b>GRACE score:</b> ประเมินความเร่งด่วนในการทำ coronary angiography และ revascularization · ใช้ age, HR, SBP, renal function, CHF/Killip, ST deviation, cardiac arrest, biomarkers · low ≤ 108, medium 109–140, high &gt; 140 · <mark>GRACE &gt; 140 → coronary angiography ภายใน 72 ชม.</mark></li>
  <li><b>TIMI score:</b> ความเสี่ยงเหตุการณ์ไม่พึงประสงค์ใน 14 วัน (ตายทุกสาเหตุ, MI ใหม่/ซ้ำ, severe recurrent ischemia ที่ต้อง urgent revascularization) 7 ปัจจัย ปัจจัยละ 1 คะแนน
    <ol>
      <li>อายุ ≥ 65 ปี</li>
      <li>ปัจจัยเสี่ยง CAD ≥ 3 ข้อ (family history, HTN, hypercholesterolemia, DM, current smoking)</li>
      <li>เคยวินิจฉัย CAD ที่ stenosis ≥ 50%</li>
      <li>ใช้ aspirin ภายใน 7 วัน</li>
      <li>severe angina ≥ 2 episodes ใน 24 ชม.</li>
      <li>ECG ST change ≥ 0.5 mm</li>
      <li>cardiac marker positive</li>
    </ol>
  </li>
</ul>
<h3>CCS: Canadian Cardiovascular Society angina grading</h3>
<div class="tbl"><table>
  <tr><th>Grade</th><th>เจ็บหน้าอกเมื่อ</th></tr>
  <tr><td>I</td><td>ออกแรงหนัก เช่น เดินเร็วมาก ออกแรงนาน ขึ้นบันไดเร็ว</td></tr>
  <tr><td>II</td><td>ออกแรงปานกลาง เช่น เดินขึ้นเนิน ขึ้นบันไดมากกว่า 1 ชั้น หรือออกแรงหลังอาหาร/อากาศเย็น/เครียด</td></tr>
  <tr><td>III</td><td>ออกแรงเล็กน้อย เช่น เดินระยะสั้น ขึ้นบันได 1 ชั้นความเร็วปกติ</td></tr>
  <tr><td>IV</td><td>ขณะพัก</td></tr>
</table></div>` },
    { id: 'antithrombotic', t: 'ยาต้านเกล็ดเลือดและยาต้านการแข็งตัวของเลือด', html: `<h3>Aspirin (COX-1 inhibitor)</h3>
<ul>
  <li>Irreversible COX-1 inhibitor → thromboxane A2 ลดลง</li>
  <li>ACS 162–325 mg · CCS 81–162 mg/day</li>
  <li><mark>เคี้ยวให้ละเอียดแล้วกลืน</mark> (เพิ่ม bioavailability) ไม่ควรใช้ enteric-coated</li>
</ul>
<h3>P2Y12 receptor antagonists</h3>
<div class="tbl"><table>
  <tr><th></th><th>Clopidogrel</th><th>Prasugrel</th><th>Ticagrelor</th></tr>
  <tr><td>กลุ่ม</td><td colspan="2">thienopyridine (prodrug)</td><td>cyclopentyltriazolopyrimidine</td></tr>
  <tr><td>Activation</td><td>prodrug 2-step oxidation</td><td>prodrug 1-step</td><td>active drug</td></tr>
  <tr><td>จับ P2Y12</td><td>irreversible</td><td>irreversible</td><td><b>reversible</b></td></tr>
  <tr><td>Dose</td><td class="num">LD 300–600 mg · MD 75 mg OD<br>อายุ ≥ 75 ปี ไม่ต้อง loading</td><td class="num">LD 60 mg · MD 10 mg OD</td><td class="num">LD 180 mg · MD 90 mg BID</td></tr>
  <tr><td>Onset</td><td>2–6 ชม.</td><td>30 นาที</td><td>30 นาที</td></tr>
  <tr><td>DI</td><td>CYP2C19 — omeprazole ลดฤทธิ์</td><td>—</td><td>CYP3A4, P-gp</td></tr>
  <tr><td>ADR</td><td>bleeding</td><td>bleeding</td><td>bleeding, <b>dyspnea</b>, hyperuricemia, bradycardia</td></tr>
  <tr><td>อื่น ๆ</td><td>CYP2C19 polymorphism</td><td><mark>C/I: เคย stroke/TIA</mark> · อายุ &gt; 75 หรือน้ำหนัก &lt; 60 kg ลดเหลือ 5 mg OD · ใช้เมื่อ plan PCI</td><td>ใช้ร่วม aspirin ให้ aspirin &lt; 100 mg</td></tr>
</table></div>
<h3>Glycoprotein IIb/IIIa inhibitors</h3>
<p>Abciximab, eptifibatide, tirofiban — จับ GPIIb/IIIa receptor ไม่ให้ fibrinogen และ vWF จับได้</p>
<h3>Anticoagulants (parenteral)</h3>
<div class="tbl"><table>
  <tr><th></th><th>UFH</th><th>Enoxaparin (LMWH)</th><th>Fondaparinux</th></tr>
  <tr><td>Dose</td><td class="num">60–70 U/kg IV bolus → 12–15 U/kg/hr</td><td class="num">1 mg/kg ปรับตามไต</td><td class="num">2.5 mg SC q24h</td></tr>
  <tr><td>MOA</td><td>ผ่าน antithrombin → IIa และ Xa (non-selective)</td><td>ผ่าน antithrombin → เน้น Xa</td><td>ผ่าน antithrombin → Xa (specific)</td></tr>
  <tr><td>คุณสมบัติ</td><td>high protein binding ผลแปรปรวน · <b>ไม่ต้องปรับตามไต เหมาะกับ ESRD</b></td><td>bioavailability ดี ขับทางไต ผลคาดเดาได้</td><td>ขับทางไต ผลคาดเดาได้ · ไม่แนะนำ eGFR &lt; 30</td></tr>
  <tr><td>Monitor</td><td>aPTT q6h เป้า 1.5–2.5 เท่า</td><td>anti-Xa (ไม่ต้อง aPTT)</td><td>ไม่ต้อง aPTT</td></tr>
  <tr><td>ADR</td><td>bleeding, HIT</td><td>bleeding, HIT (น้อยกว่า)</td><td>bleeding (น้อย)</td></tr>
  <tr><td>Antidote</td><td>protamine 1 mg : heparin 100 U (slow IV)</td><td>protamine บางส่วน (1 mg : enoxaparin 1 mg)</td><td>ไม่มี</td></tr>
</table></div>
<h3>Thrombolytic / fibrinolytic</h3>
<ul>
  <li>Plasminogen activator → plasmin ตัด fibrin · ใช้ใน STEMI ที่ทำ primary PCI ไม่ทัน</li>
  <li><b>Absolute C/I:</b> เคย ICH, ischemic stroke &lt; 3 เดือน, intracranial neoplasm, สงสัย aortic dissection, active bleeding, head trauma รุนแรง, เคยได้ streptokinase ใน 6 เดือน, คุม BP ไม่ได้</li>
  <li><b>Non-fibrin specific:</b> streptokinase — bleeding, hypotension, anaphylaxis (เป็นโปรตีนจากแบคทีเรีย ร่างกายสร้าง Ab ไม่แนะนำในคนที่เคยได้)</li>
  <li><b>Fibrin-specific:</b> alteplase (bolus + infusion), tenecteplase (single bolus, fibrin specificity สูงกว่า t½ ยาวกว่า)</li>
</ul>` },
    { id: 'antiischemic', t: 'ยาบรรเทาอาการเจ็บหน้าอก', html: `<ul>
  <li><b>Beta-blockers:</b> ลดการบีบตัวและ HR → ลด O₂ demand · ADR: bradycardia, AV block, hypotension · C/I: cardiogenic shock, severe bradycardia, high-grade AV block</li>
  <li><b>Non-DHP CCB</b> (verapamil, diltiazem): ลดการบีบตัวและ HR → ลด O₂ demand</li>
  <li><b>DHP-CCB</b> (amlodipine, nifedipine): ขยายหลอดเลือดแดง ลด afterload → ลด O₂ demand</li>
  <li><b>Morphine</b> (μ-opioid agonist): ลดปวดและความกังวล ลด sympathetic tone มี collateral coronary vasodilation · ใช้เมื่อเจ็บหน้าอกรุนแรงและ nitrate ไม่พอ · ADR: respiratory depression, hypotension</li>
  <li><b>Organic nitrates:</b> เปลี่ยนเป็น NO → กล้ามเนื้อเรียบคลายตัว หลอดเลือดขยาย เพิ่ม O₂ supply ผ่าน collateral · nitroglycerin (IV), isosorbide dinitrate (SL) · ADR: headache, hypotension, reflex tachycardia
    <ul>
      <li><mark>ใช้ sildenafil (PDE5 inhibitor) ห้ามใช้ nitrate ภายใน 24 ชม.</mark> → severe hypotension</li>
      <li><b>Nitrate tolerance:</b> ป้องกันด้วย nitrate-free interval 8–10 ชม./วัน เช่น ใช้ยา 8.00, 12.00, 16.00 เว้นกลางคืน 12 ชม.</li>
    </ul>
  </li>
  <li><b>Ivabradine:</b> ยับยั้ง funny current (phase 4) → ลด HR และ O₂ demand โดยไม่กระทบ BP</li>
  <li><b>Ranolazine:</b> ยับยั้ง late inward Na current → Ca ในเซลล์ลด → ลด O₂ demand · ไม่ค่อยกระทบ HR, BP · ADR: QT prolong</li>
  <li><b>Trimetazidine:</b> ยับยั้ง beta-oxidation ของ free fatty acid → ลด O₂ demand</li>
</ul>` },
    { id: 'acs', t: 'การรักษา ACS', html: `<p>ACS: ECG และแปลผลภายใน 10 นาที + cardiac troponin ภายใน 1–2 ชม.</p>
<h3>การดูแลเบื้องต้น</h3>
<ol>
  <li><b>O₂:</b> ให้เฉพาะ SaO₂ &lt; 90% หรือ PaO₂ &lt; 60 mmHg ไม่ให้เมื่อ SaO₂ &gt; 90%</li>
  <li><b>บรรเทาเจ็บหน้าอก</b></li>
</ol>
<div class="tbl"><table>
  <tr><th>ยา</th><th>คำแนะนำ</th><th>หมายเหตุ</th></tr>
  <tr><td>Short-acting nitrate (SL, spray)</td><td>ควรได้ถ้าไม่มีข้อห้าม อม 1 เม็ดทุก 5 นาที ไม่เกิน 3 เม็ด</td><td>C/I: RV infarction, ใช้ PDE-5 inhibitor ใน 24 ชม. (tadalafil 48 ชม.), SBP &lt; 90</td></tr>
  <tr><td>Nitroglycerin IV</td><td>ยังเจ็บหน้าอกแม้อม nitrate ครบ 3 เม็ด</td><td></td></tr>
  <tr><td>Morphine</td><td>ไม่ตอบสนองหรือห้ามใช้ nitrate</td><td>ไม่ค่อยใช้ เพราะลดการดูดซึม P2Y12 inhibitor</td></tr>
</table></div>
<h3>STEMI</h3>
<figure><img data-fig="cad/p10-1.webp" alt="ระยะเวลาการขาดเลือดและเส้นทาง primary PCI หรือ fibrinolysis ตาม Thai ACS Guidelines 2020"><figcaption>Total ischemic time: ส่งทำ PCI ได้ ≤ 120 นาที → primary PCI · &gt; 120 นาที → fibrinolysis (Thai ACS Guidelines 2020)</figcaption></figure>
<ul>
  <li><b>Reperfusion:</b> primary PCI หรือยาละลายลิ่มเลือด · ไปถึงโรงพยาบาลที่ทำ PCI ได้ → primary PCI ทันที</li>
  <li>อยู่โรงพยาบาลที่ทำ PCI ไม่ได้: <mark>ส่งต่อได้ภายใน 120 นาทีนับจากวินิจฉัย STEMI → primary PCI · ไม่ทัน 120 นาที → ยาละลายลิ่มเลือด</mark></li>
  <li>ยาละลายลิ่มเลือดให้เร็วที่สุด ในผู้ที่มีอาการไม่เกิน 12 ชม. แล้วส่งต่อทำ PCI · ตอบสนองต่อยา → ส่งต่อใน 24–72 ชม. · ไม่ตอบสนอง → <b>rescue PCI</b> ทันที</li>
  <li>เลือก <b>fibrin-specific (tenecteplase, alteplase)</b> มากกว่า streptokinase (ได้ผลดีกว่า เลือดออกน้อยกว่า)</li>
</ul>
<div class="tbl"><table>
  <tr><th></th><th>Primary PCI</th><th>Fibrinolytic agent</th></tr>
  <tr><td>DAPT ≥ 12 เดือน</td><td>Aspirin + P2Y12 inh. (แนะนำ ticagrelor, prasugrel มากกว่า clopidogrel) · GP IIb/IIIa เฉพาะภาวะแทรกซ้อนจาก PCI เช่น no-reflow (ให้ในห้องสวนหัวใจเท่านั้น)</td><td>Aspirin + <b>clopidogrel เท่านั้น</b> · อายุ ≤ 75 ปี LD 300 mg · &gt; 75 ปี 75 mg ไม่ต้อง loading</td></tr>
  <tr><td>Parenteral anticoagulant ทุกราย หยุดหลัง PCI</td><td>UFH, enoxaparin</td><td>UFH, enoxaparin, fondaparinux</td></tr>
</table></div>
<h3>ขนาดยาใน STEMI ที่ทำ PCI (ตาราง 7)</h3>
<div class="tbl"><table>
  <tr><th>ยา</th><th>ขนาด</th></tr>
  <tr><td>Aspirin</td><td>ไม่เคยได้มาก่อน: 162–325 mg (loading) แล้ว 81–100 mg/วัน</td></tr>
  <tr><td>Clopidogrel</td><td>600 mg (loading) แล้ว 75 mg/วัน</td></tr>
  <tr><td>Prasugrel</td><td>60 mg (loading) แล้ว 10 mg/วัน · อายุ ≥ 75 ปีหรือน้ำหนัก ≤ 60 kg ลด maintenance เหลือ 5 mg · ห้ามในคนเคย stroke หรือ TIA</td></tr>
  <tr><td>Ticagrelor</td><td>180 mg (loading) แล้ว 90 mg วันละ 2 ครั้ง</td></tr>
  <tr><td>Eptifibatide</td><td>180 mcg/kg IV 2 ครั้งห่างกัน 10 นาที แล้ว 2.0 mcg/kg/นาที 18 ชม. (ในห้องสวนหัวใจเท่านั้น)</td></tr>
  <tr><td>UFH ขณะทำ PCI</td><td>70–100 U/kg IV bolus (ไม่ได้ GP IIb/IIIa) · ถ้าจะให้ GP IIb/IIIa ลดเหลือ 50–70 U/kg</td></tr>
  <tr><td>Enoxaparin ขณะทำ PCI</td><td>0.5 mg/kg IV bolus</td></tr>
</table></div>
<h3>ขนาดยาต้านการแข็งตัวเมื่อได้ยาละลายลิ่มเลือด</h3>
<ul>
  <li><b>UFH:</b> 60 U/kg IV (ไม่เกิน 4,000 U) แล้ว 12 U/kg/ชม. (ไม่เกิน 1,000 U/ชม.) ปรับ aPTT 1.5–2.0 เท่า</li>
  <li><b>Enoxaparin:</b> อายุ &lt; 75 ปี 30 mg IV แล้ว 15 นาทีต่อมา 1 mg/kg SC q12h (2 โดสแรกรวมไม่เกิน 100 mg) · อายุ ≥ 75 ปี 0.75 mg/kg SC q12h ไม่ต้องให้ IV ก่อน (2 โดสแรกรวมไม่เกิน 75 mg)</li>
  <li><b>Fondaparinux:</b> 2.5 mg IV แล้ว 2.5 mg SC q24h</li>
</ul>
<h3>NSTE-ACS</h3>
<ol>
  <li>Risk stratification ด้วยอาการ + GRACE หรือ TIMI เพื่อกำหนดความเร่งด่วนของการฉีดสี</li>
  <li><b>Revascularization:</b> PCI (บอลลูน + stent ไม่ผ่าตัดใหญ่ ฟื้นตัวไว 1–2 ชม.) หรือ CABG (บายพาส ผ่าตัดใหญ่ พักฟื้นนาน) ตามความเห็นสหวิชาชีพ</li>
  <li><b>DAPT + parenteral anticoagulant</b> ทุกราย ยกเว้นมีข้อห้าม
    <ul>
      <li>DAPT: aspirin + P2Y12 (ticagrelor หรือ prasugrel &gt; clopidogrel) นาน 1 ปี แล้วหยุด P2Y12 ให้ aspirin ตลอดชีวิต</li>
      <li><mark>Ticagrelor ใช้ได้ทุกแนวทางการรักษา · prasugrel เฉพาะคนที่ plan PCI</mark></li>
      <li>Anticoagulant: fondaparinux, enoxaparin หรือ UFH ทันทีที่วินิจฉัย · fondaparinux เมื่อไม่ทำ PCI ถ้าได้แล้วจะทำ PCI ต้องให้ UFH เพิ่ม · หยุดหลังทำหัตถการ</li>
    </ul>
  </li>
</ol>
<h3>Long-term (STEMI และ NSTE-ACS)</h3>
<ol>
  <li>DAPT ≥ 12 เดือน แล้ว aspirin ตลอดชีวิต · เสี่ยง GI bleeding ให้ PPI ร่วม</li>
  <li>Beta-blocker ชนิดกิน: ทุกรายที่มี HFrEF (LVEF &lt; 40) เมื่ออาการคงที่</li>
  <li><mark>High-intensity statin ทุกราย</mark> ลด LDL-C ≥ 50% และ LDL-C &lt; 70 mg/dL</li>
  <li>ACEI/ARB: HF, LV systolic dysfunction, DM, anterior wall MI</li>
  <li>MRA: HFrEF ทุกราย</li>
  <li>Influenza vaccine ทุกราย (ACC/AHA 2025)</li>
</ol>` },
    { id: 'ccs', t: 'การรักษา CCS', html: `<h3>Anti-anginal drugs</h3>
<ul>
  <li><b>1st choice:</b> BB หรือ CCB (DHP, non-DHP) · ไม่ได้ผลอาจให้ BB + DHP-CCB</li>
  <li><b>2nd choice:</b> long-acting nitrate (LAN), ranolazine, trimetazidine, ivabradine — เมื่อมีข้อห้าม ทนยาไม่ได้ หรือคุมอาการไม่ได้</li>
  <li><b>ห้ามให้ร่วมกัน:</b> BB + non-DHP CCB (HR ลดทั้งคู่) · ivabradine + non-DHP CCB (non-DHP เป็น CYP inhibitor เพิ่มระดับ ivabradine) · <mark>non-DHP CCB ห้ามใช้เมื่อ LVEF &lt; 40</mark></li>
  <li>ใช้ short-acting nitrate เมื่อเจ็บหน้าอกขณะออกแรงหรือต้องการผลเร็ว</li>
</ul>
<div class="tbl"><table>
  <tr><th>ขั้น</th><th>Standard</th><th>HR เร็ว (&gt; 80)</th><th>HR ช้า (&lt; 50)</th><th>LV dysfunction / HF</th><th>BP ต่ำ</th></tr>
  <tr><td>1</td><td>BB หรือ CCB</td><td>BB หรือ non-DHP-CCB</td><td>DHP-CCB</td><td>BB</td><td>low-dose BB หรือ low-dose non-DHP-CCB</td></tr>
  <tr><td>2</td><td>BB + DHP-CCB</td><td>BB + CCB</td><td>เปลี่ยนเป็น LAN</td><td>เพิ่ม LAN หรือ ivabradine</td><td>เปลี่ยนเป็น ivabradine, ranolazine หรือ trimetazidine</td></tr>
  <tr><td>3</td><td>เพิ่ม 2nd line</td><td>BB + ivabradine</td><td>DHP-CCB + LAN</td><td>เพิ่ม 2nd line ตัวอื่น</td><td>2nd line สองตัวร่วมกัน</td></tr>
  <tr><td>4</td><td></td><td></td><td>เพิ่ม ranolazine หรือ trimetazidine</td><td></td><td></td></tr>
</table></div>
<h3>ป้องกัน cardiovascular events</h3>
<ol>
  <li><b>Antiplatelet/anticoagulant:</b> 1st choice aspirin 81–100 mg/day · 2nd clopidogrel 75 mg/day (ทน aspirin ไม่ได้) · เพิ่งทำ PCI: aspirin + clopidogrel 1–6 เดือนตามความเสี่ยงเลือดออก · มี AF: OAC (NOAC ก่อน VKA) เมื่อ CHA₂DS₂-VASc ≥ 2 ในชาย ≥ 3 ในหญิง
    <ul><li>พิจารณา PPI ร่วมเมื่อ: เสี่ยง GI bleed หรือมีแผล, ใช้ NSAIDs และ steroid, อายุ &gt; 65, ประวัติโรคกระเพาะ/กรดไหลย้อน, H. pylori, ดื่มสุรา</li></ul>
  </li>
  <li><b>Lipid-lowering:</b> high-potency statin ลด LDL-C ≥ 50% และ &lt; 70 mg/dL</li>
  <li><b>ACEI/ARB:</b> HFrEF, HTN, DM</li>
  <li><b>SGLT2i หรือ GLP-1 RA:</b> ผู้ป่วย DM</li>
  <li><b>Beta-blocker:</b> LV systolic dysfunction</li>
  <li><b>อื่น ๆ:</b> colchicine 0.5 mg/วัน ใน CCS หรือเคย MI ลด CV events · purified EPA 4 g/วัน + statin ใน CVD ที่ TG 150–499 mg/dL ลด CV events แต่เพิ่มเสี่ยง new-onset AF</li>
</ol>
<h3>ปรับพฤติกรรม: “ใส่ใจ 3อ. บอกลา 2ส.”</h3>
<ul>
  <li><b>อ.อาหาร</b> ย่อยง่าย แบบ Mediterranean diet</li>
  <li><b>อ.อิริยาบถ</b> ออกกำลังกายปานกลางวันละ 30 นาที อย่างน้อย 150 นาที/สัปดาห์</li>
  <li><b>อ.อารมณ์</b> คลายเครียด · <b>ส.สูบบุหรี่</b> เลิก · <b>ส.สุรา</b> เลิก</li>
</ul>
<figure><img data-fig="cad/p15-1.webp" alt="อาหารย่อยง่ายไกลโรค สูตร 2-1-1: ผักถั่วงา 2 ส่วน ปลา 1 ส่วน ข้าวกล้อง 1 ส่วน บวกผลไม้และน้ำ"><figcaption>อาหารย่อยง่าย ไกลโรค 2-1-1</figcaption></figure>` },
  ],
  questions: [
    { q: 'ชายไทย 59 ปี มี HT, DM, dyslipidemia เจ็บแน่นหน้าอกเวลาเดินขึ้นสะพานลอยทุกครั้ง 6 เดือน ดีขึ้นใน 5 นาทีหลังพัก ไม่เคยมีอาการขณะพัก ECG ปกติ troponin ไม่สูง อาการจัดอยู่ในกลุ่มใด', o: ['STEMI', 'NSTEMI', 'Unstable angina', 'Acute coronary syndrome', 'Chronic coronary syndrome'], a: 4, e: 'อาการสัมพันธ์กับการออกแรง ดีขึ้นเมื่อพัก troponin negative และ ECG ปกติ' },
    { q: 'ชายไทย 76 ปี เป็น DM, HTN, CKD เจ็บแน่นหน้าอกขณะพัก ~40 นาที ร้าวไปแขนซ้าย เหงื่อออก คลื่นไส้ BP 95/60 HR 105 ECG ST depression V4–V6 troponin I สูง ตาม Thai ACS Guidelines 2020 หลังวินิจฉัยควรทำอะไรเพื่อกำหนดเวลาตรวจ coronary angiography', o: ['คำนวณ CCS grading', 'คำนวณ TIMI score', 'คำนวณ GRACE score', 'ทำ exercise stress test', 'ทำ coronary CT angiography'], a: 2, e: 'เข้าได้กับ NSTEMI (เจ็บแบบ ischemic + ST depression + troponin สูง) หลังวินิจฉัย NSTE-ACS ควรทำ risk stratification ด้วย GRACE เพื่อกำหนดเวลาฉีดสี · GRACE > 140 = เสี่ยงสูง ควรตรวจหลอดเลือดหัวใจระหว่างนอนโรงพยาบาล' },
    { q: 'ชายไทย 68 ปี เป็น NSTEMI แพทย์จะทำ PCI ใน 24 ชม. มีประวัติ ischemic stroke 2 ปีก่อน ไม่มีความพิการเหลือ ยาใดไม่เหมาะสมเมื่อเริ่ม DAPT', o: ['Aspirin', 'Clopidogrel', 'Prasugrel', 'Ticagrelor', 'Aspirin ร่วมกับ clopidogrel'], a: 2, e: 'Prasugrel ห้ามใช้ในผู้ที่มีประวัติ stroke หรือ TIA (เลือดออกรุนแรง) แม้เป็น ischemic stroke นานแล้ว · clopidogrel และ ticagrelor ใช้ได้ถ้าไม่มีข้อห้ามอื่น' },
    { case: 'ชายไทย 68 ปี เจ็บหน้าอกเฉียบพลัน · PMH: HTN · ยาเดิม HCTZ · PE: mild crepitation, CXR infiltrate ปอดล่างทั้งสองข้าง · BP 110/70 HR 65 SaO₂ 98% · EKG ST elevation V2–V4 · EF 30% · troponin T+, BUN 12, SCr 1.0 (ใช้ตอบข้อ 4–6)', q: 'ถ้าผู้ป่วยอยู่โรงพยาบาลชุมชน ซึ่งห่างโรงพยาบาลศูนย์ 3 ชั่วโมง ข้อใดถูกที่สุดเรื่อง revascularization', o: ['Primary PCI เมื่อถึงโรงพยาบาลศูนย์ เพราะส่งต่อได้ภายใน 12 ชม.', 'Fibrinolytic เพราะส่งทำ PCI ไม่ได้ใน 120 นาที เลือก streptokinase เป็นตัวแรก', 'Fibrinolytic เพราะส่งทำ PCI ไม่ได้ใน 120 นาที เลือก fibrin-specific agent เป็นตัวแรก', 'Fibrinolytic เพราะส่งทำ PCI ไม่ได้ใน 150 นาที เลือก streptokinase เป็นตัวแรก', 'Fibrinolytic เพราะส่งทำ PCI ไม่ได้ใน 150 นาที เลือก fibrin-specific agent เป็นตัวแรก'], a: 2, e: 'ส่งทำ PCI ไม่ได้ภายใน 120 นาที → fibrinolytic และเลือก fibrin-specific (tenecteplase, alteplase) มากกว่า streptokinase เพราะได้ผลดีกว่าและเลือดออกน้อยกว่า' },
    { q: 'ถ้าผู้ป่วยได้รับ fibrinolytic agent ข้อใดเหมาะสมที่สุด', o: ['Aspirin อย่างเดียวเพื่อลดเลือดออก', 'Aspirin + clopidogrel ≥ 12 เดือน และ enoxaparin จนทำ PCI เสร็จ', 'Aspirin + clopidogrel ≥ 12 เดือน และ dabigatran จนทำ PCI เสร็จ', 'Aspirin + prasugrel ≥ 12 เดือน และ enoxaparin จนทำ PCI เสร็จ', 'Aspirin + P2Y12 inhibitor ตัวใดก็ได้ตลอดชีวิต'], a: 1, e: 'ACS ต้องได้ DAPT ≥ 12 เดือน ร่วม parenteral anticoagulant จนทำ PCI เสร็จ · ได้ fibrinolytic ใช้ aspirin + clopidogrel และ anticoagulant เป็น UFH, enoxaparin หรือ fondaparinux' },
    { q: 'หลังรักษา ACS อาการคงที่ เตรียมกลับบ้าน ยังมีภาวะ CCS (BP 121/78 HR 60 EF 30%) ยาทางเลือกแรกต้านอาการเจ็บหน้าอกคือ', o: ['Atenolol', 'Bisoprolol + amlodipine', 'Verapamil', 'Bisoprolol + verapamil', 'Ivabradine'], a: 0, e: 'BP ปกติและมี LV dysfunction (LVEF < 40%) ควรเลือก beta-blocker · non-DHP CCB ห้ามใช้ใน LV dysfunction' },
  ],
}
