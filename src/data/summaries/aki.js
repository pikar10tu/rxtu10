// Acute kidney injury — converted from the RxTU10 class summary PDF (see content/summaries/manifest.json)
// ภาพตารางจาก KDIGO 2026 draft สร้างใหม่เป็น HTML
export default {
  id: 'aki',
  date: '28/07/2026',
  refs: [
    'Kidney Disease: Improving Global Outcomes (KDIGO). KDIGO 2026 Clinical Practice Guideline for Acute Kidney Injury (AKI) and Acute Kidney Disease (AKD): Public Review Draft. 2026 Mar.',
  ],
  sections: [
    { id: 'def', t: 'นิยามและเกณฑ์ (KDIGO 2026)', html: `<ul>
  <li>พบบ่อยทั่วโลก สัมพันธ์กับการเกิด CKD · AKI/AKD เป็น continuum โดย AKD พบมากกว่า AKI ~3 เท่า · พบในผู้ป่วย ICU &gt; 50%</li>
  <li>AKI เป็น "ภาวะ" ไม่ใช่โรค — การทำงานของไตลดลงในเวลาสั้น ภายใน 7 วัน · ไม่มียารักษาจำเพาะ</li>
</ul>
<h3>เกณฑ์วินิจฉัย (มีข้อใดข้อหนึ่ง ภายในช่วงเวลาที่กำหนด)</h3>
<div class="tbl"><table>
  <tr><th>Functional criteria</th><th>Structural criteria</th></tr>
  <tr><td><ul>
    <li>SCr เพิ่ม <b>≥ 0.3 mg/dL ภายใน 48 ชม.</b></li>
    <li>SCr เพิ่ม <b>≥ 1.5 เท่าของ baseline</b> ที่ทราบหรือคาดว่าเกิดใน 7 วันก่อน</li>
    <li>Serum cystatin C เพิ่ม ≥ 1.5 เท่าของ baseline ใน 7 วัน</li>
    <li>Urine output <b>&lt; 0.5 mL/kg/h นาน ≥ 6 ชม.</b> (ใช้ ideal body weight)</li>
  </ul></td><td>Biomarker บ่งชี้ไตเสียหาย (ที่ผ่านการรับรอง) ใน 7 วัน เช่น albuminuria, urine NGAL, TIMP-2·IGFBP7, serum cystatin C · urine microscopy ช่วยวินิจฉัย</td></tr>
</table></div>
<h3>Staging</h3>
<div class="tbl"><table>
  <tr><th>Stage</th><th>SCr</th><th>Urine output</th></tr>
  <tr><td>1</td><td>เพิ่ม ≥ 0.3 mg/dL หรือ 1.5–1.9 เท่าของ baseline</td><td>&lt; 0.5 mL/kg/h นาน 6–12 ชม.</td></tr>
  <tr><td>2</td><td>2.0–2.9 เท่าของ baseline</td><td>&lt; 0.5 mL/kg/h นาน &gt; 12 ชม.</td></tr>
  <tr><td>3</td><td>≥ 3 เท่าของ baseline หรือ SCr ≥ 4.0 mg/dL หรือเริ่ม RRT</td><td><mark>&lt; 0.3 mL/kg/h นาน ≥ 24 ชม. หรือ anuria &gt; 12 ชม.</mark></td></tr>
</table></div>
<ul>
  <li><b>Transient AKI</b> &lt; 48 ชม. · <b>persistent AKI</b> &gt; 48 ชม.–7 วัน · <b>AKD</b> 7 วัน–3 เดือน · <b>CKD</b> ≥ 3 เดือน</li>
  <li>AKI เป็นได้ทั้ง anuric (&lt; 50–100 mL/วัน) oliguric (&lt; 400–500 mL/วัน) และ nonoliguric</li>
</ul>` },
    { id: 'patho', t: 'Pathophysiology และชนิดของ AKI', html: `<p>ไตบาดเจ็บ → ของเหลวคั่ง · renal tubular epithelial cell ตายจากขาดเลือด หลุดเป็น cell debris อุดท่อไตและกระตุ้นการอักเสบ (mild: nephron ปกติ · moderate: เสียบางส่วน · severe: ตายหมด) → เสียสมดุล homeostasis เช่น lung injury (fluid overload) · uremic encephalopathy · HF/arrhythmia (fluid overload, hyperkalemia)</p>
<p><b>Risk factors:</b> CKD · DM · โรคหัวใจ · โรคตับ · ADHF · major surgery · อายุ · ติดเชื้อ · hypotension · volume depletion · hypoxia · ยา เช่น PPI, vancomycin, cisplatin, aminoglycoside, sulfonamide, ganciclovir, trimethoprim, methotrexate, IV contrast</p>
<h3>1. Prerenal (60–70% พบบ่อยที่สุด)</h3>
<p>เลือดไปเลี้ยงไตลดลง: ยา sepsis ท้องเสียรุนแรง แผลไหม้รุนแรง anaphylaxis เสียเลือด</p>
<div class="tbl"><table>
  <tr><th>Afferent vasoconstriction</th><th>Efferent vasodilation</th></tr>
  <tr><td>NSAIDs, COX-2 inhibitors, cyclosporine, amphotericin B, radiocontrast, vasopressors</td><td>ACEIs, ARBs</td></tr>
</table></div>
<p style="font-size:.9em">ต้นฉบับใส่ CCBs (dihydropyridine, diltiazem, verapamil) ไว้ในกลุ่ม efferent vasodilation แต่ CCBs ขยาย afferent arteriole เป็นหลัก ยาที่ลด GFR ผ่านการขยาย efferent คือ ACEIs/ARBs จึงตัด CCBs ออก (CCBs ทำให้เกิด prerenal AKI ได้ทางอ้อมเมื่อความดันต่ำเกิน)</p>
<h3>2. Intrarenal</h3>
<p>เนื้อไตถูกทำลาย: ischemia · direct tubular toxicity · glomerulonephritis · AIN (แพ้ยา) · prolonged hypoperfusion · lupus nephritis · แอลกอฮอล์ โลหะหนัก สารเสพติด · COVID-19</p>
<h3>3. Postrenal</h3>
<p>ทางเดินปัสสาวะอุดกั้น: BPH · มะเร็ง · ยา anticholinergic (เช่น TCA) · นิ่ว</p>
<div class="tbl"><table>
  <tr><th>Lab</th><th>Prerenal</th><th>Intrinsic (ATN)</th><th>Postrenal</th></tr>
  <tr><td>History</td><td>Volume depletion, hypotension, HF, cirrhosis</td><td>Nephrotoxin, ischemia, GN</td><td>BPH, นิ่ว, เนื้องอก</td></tr>
  <tr><td>Response to fluids</td><td>SCr ดีขึ้น</td><td>ไม่ค่อยดีขึ้น</td><td>ไม่ดีขึ้นจนกว่าจะแก้การอุดกั้น</td></tr>
  <tr><td>Urine sediment</td><td>Hyaline casts หรือปกติ</td><td><b>Muddy brown granular casts</b>, tubular epithelial cells</td><td>Cellular debris, crystals</td></tr>
  <tr><td>Urine RBC</td><td>ไม่มี/เล็กน้อย</td><td>↑ (GN มาก)</td><td>Variable</td></tr>
  <tr><td>Urine WBC</td><td>ไม่มี</td><td>↑ (โดยเฉพาะ AIN)</td><td>เล็กน้อย–ปานกลาง</td></tr>
  <tr><td>Urine Na (mEq/L)</td><td><b>&lt; 20</b></td><td>&gt; 40</td><td>Variable</td></tr>
  <tr><td>FeNa</td><td><b>&lt; 1%</b></td><td>&gt; 2%</td><td>Variable</td></tr>
  <tr><td>FeUrea</td><td>&lt; 35%</td><td>&gt; 50%</td><td>Variable</td></tr>
  <tr><td>Urine SG</td><td>&gt; 1.020</td><td>&lt; 1.010–1.012</td><td>Variable</td></tr>
  <tr><td>Urine osmolality</td><td>&gt; 500 mOsm/kg</td><td>&lt; 350 mOsm/kg</td><td>Variable</td></tr>
  <tr><td>Renal ultrasound</td><td>ปกติ</td><td>ปกติหรือไตโต</td><td><b>Hydronephrosis</b></td></tr>
</table></div>
<p>SCr ใช้แยกชนิด AKI ไม่ได้ (ขึ้นกับมวลกล้ามเนื้อ) · BUN ไม่ใช้แยกหรือวินิจฉัย</p>` },
    { id: 'tx', t: 'การป้องกันและรักษา', html: `<div class="key"><strong class="k">ป้องกันสำคัญที่สุด</strong>หยุดยาที่เป็นสาเหตุ</div>
<ol>
  <li><b>Fluid:</b> crystalloids ดีกว่า colloids ให้ urine output ≥ 0.5 mL/kg/h · <mark>balanced crystalloids (Ringer's lactate, Plasma-Lyte) ดีกว่า 0.9% saline</mark> ถ้าไม่มี traumatic brain injury · severe metabolic acidosis pH &lt; 7.20 พิจารณา <b>IV bicarbonate ก่อน RRT</b> ถ้าไม่มีข้อบ่งชี้เร่งด่วนอื่น · elective major abdominal surgery สนับสนุน liberal fluid</li>
  <li><b>Hemodynamic:</b> MAP &gt; 65 mmHg · norepinephrine ร่วมกับ fluid เมื่อไม่ตอบสนอง · <b>ไม่ใช้ low-dose dopamine</b> เพื่อป้องกันไต</li>
  <li><b>Diuretics:</b> ใช้เฉพาะเมื่อมี volume overload · furosemide intermittent bolus ก่อน continuous · ลองก่อนดึงน้ำด้วยเครื่องถ้ายังไม่มีข้อบ่งชี้ RRT อื่น</li>
  <li><b>Glucose:</b> 140–180 mg/dL ในผู้ป่วยวิกฤต</li>
  <li><b>สถานการณ์เฉพาะ:</b> tumor lysis syndrome เสี่ยงสูงใช้ <b>rasburicase</b> มากกว่า allopurinol/febuxostat (ถ้าไม่มี G6PD deficiency) · rhabdomyolysis/hemolysis ใช้ IV crystalloids · nutrition: enteral มากกว่า parenteral ไม่จำกัดโปรตีนเพื่อเลื่อน RRT ผู้ที่ทำ CRRT ระวังการสูญเสียวิตามิน/แร่ธาตุ</li>
  <li><b>Contrast:</b> ประเมินความเสี่ยง + hydration + ใช้ contrast ต่ำที่สุด</li>
</ol>
<h3>ปรับขนาดยาตามระยะ</h3>
<div class="tbl"><table>
  <tr><th>Phase</th><th>ลักษณะ</th><th>การปรับยา</th></tr>
  <tr><td>Initiation</td><td>GFR เริ่มลด SCr อาจยังไม่ขึ้น</td><td><mark>Loading dose ปกติ</mark> ประเมินยาที่ขับทางไต หยุด nephrotoxic drugs ถ้าทำได้</td></tr>
  <tr><td>Extension / maintenance</td><td>GFR ต่ำสุด urine output มักลด</td><td>ลด maintenance dose หรือยืด interval · TDM · ติดตาม SCr/UO ทุกวัน</td></tr>
  <tr><td>Recovery</td><td>GFR เพิ่ม ปัสสาวะมาก (diuretic phase)</td><td>ค่อย ๆ เพิ่ม maintenance dose ประเมินใหม่ทุกวัน</td></tr>
</table></div>
<h3>RRT (dialysis) — ตามข้อบ่งชี้ ไม่ใช่ตาม creatinine</h3>
<div class="tbl"><table>
  <tr><td><b>A</b></td><td>Acidosis รุนแรงที่แก้ไม่ได้ (pH &lt; 7.2)</td></tr>
  <tr><td><b>E</b></td><td>Electrolyte ผิดปกติ โดยเฉพาะ hyperkalemia</td></tr>
  <tr><td><b>I</b></td><td>Intoxication จากสารที่ฟอกออกได้ เช่น lithium, theophylline</td></tr>
  <tr><td><b>O</b></td><td>Overload ที่ไม่ตอบสนองต่อ diuretic</td></tr>
  <tr><td><b>U</b></td><td>Uremic complications เช่น encephalopathy, pericarditis</td></tr>
</table></div>` },
  ],
  questions: [
    { q: 'ชายอายุ 65 ปี น้ำหนัก 70 kg ท้องเสียรุนแรง 3 วัน BP 85/55 mmHg SCr เพิ่มจาก 1.0 เป็น 1.8 mg/dL ใน 2 วัน urine Na 12 mEq/L, FeNa 0.5% หลังได้สารน้ำ creatinine ลดลงชัดเจน สาเหตุของ AKI ที่เป็นไปได้มากที่สุดคือข้อใด', o: ['Intrarenal AKI จาก ATN', 'Postrenal AKI จาก BPH', 'Prerenal AKI จาก volume depletion', 'AKI จาก acute interstitial nephritis', 'AKI จาก glomerulonephritis'], a: 2, e: 'ท้องเสีย ความดันต่ำ FeNa < 1% urine Na < 20 และ SCr ดีขึ้นหลังให้สารน้ำ = prerenal · ATN มัก FeNa > 2% muddy brown casts · postrenal ต้องมีการอุดกั้น · AIN มี WBC · GN มี RBC มาก' },
    { q: "หญิงอายุ 72 ปี น้ำหนัก 60 kg ปัสสาวะ 150 mL ในช่วง 10 ชั่วโมงที่ผ่านมา urine output เท่าใด และเข้าเกณฑ์ AKI stage ใดตาม KDIGO", o: ['0.15 mL/kg/hr, stage 3', '0.25 mL/kg/hr, stage 3', '0.30 mL/kg/hr, stage 2', "0.25 mL/kg/hr, stage 1", '0.50 mL/kg/hr, ยังไม่เข้าเกณฑ์'], a: 3, e: "🤖 ปรับแก้โดย AI: Urine output = 150 ÷ (60 × 10) = 0.25 mL/kg/h · KDIGO: stage 1 = < 0.5 นาน 6–12 ชม. · stage 2 = < 0.5 นาน ≥ 12 ชม. · stage 3 = < 0.3 นาน ≥ 24 ชม. หรือ anuria ≥ 12 ชม. ข้อมูล 10 ชม. จึงเข้าได้แค่ stage 1 (เดิมเฉลย stage 3)" },
    { q: 'ผู้ป่วย AKI มี pH 7.16 ไม่มีภาวะน้ำเกิน ไม่มี hyperkalemia และยังไม่มีข้อบ่งชี้เร่งด่วนอื่นในการฟอกไต แนวทางรักษาที่เหมาะสมที่สุดคือข้อใด', o: ['รีบเริ่ม RRT ทันทีเพราะ creatinine สูง', 'ให้ IV sodium bicarbonate ก่อน', 'ให้ low-dose dopamine เพื่อป้องกันไต', 'ให้ mannitol', 'จำกัดโปรตีนทันที'], a: 1, e: 'KDIGO 2026: severe metabolic acidosis pH < 7.20 และไม่มี urgent indication อื่น ให้พิจารณา IV bicarbonate ก่อน RRT · ไม่เริ่ม RRT เพราะ creatinine · ไม่ใช้ low-dose dopamine · ไม่จำกัดโปรตีนเพื่อเลื่อนการฟอกไต' },
    { q: 'ผู้ป่วย AKI มี pulmonary edema แม้ได้ furosemide แล้วไม่ดีขึ้น ร่วมกับ K⁺ 6.8 mEq/L และ ECG เปลี่ยนแปลง เหตุผลที่เหมาะสมที่สุดในการเริ่ม RRT คือข้อใด', o: ['Serum creatinine 3.0 mg/dL', 'อายุ > 70 ปี', 'มีข้อบ่งชี้ตามหลัก AEIOU', 'ปัสสาวะน้อยกว่า 500 mL/day เพียงอย่างเดียว', 'BUN สูง'], a: 2, e: 'มี O (overload ไม่ตอบสนอง diuretic) และ E (hyperkalemia) ซึ่งเป็นข้อบ่งชี้เริ่มฟอกไตทันทีตาม AEIOU' },
    { q: 'ผู้ป่วย AKI ระยะ initiation phase ได้ vancomycin และ piperacillin/tazobactam รักษาการติดเชื้อ เภสัชกรควรดำเนินการข้อใด', o: ['ลด loading dose ของ vancomycin ทันที', 'ให้ขนาดยาเดิมทุกตัวจนกว่า SCr จะสูงขึ้น', 'ให้ loading dose ตามปกติ ประเมินยาที่ขับทางไต และหยุด nephrotoxic drugs หากทำได้', 'งดยาปฏิชีวนะทั้งหมด', 'เพิ่ม maintenance dose เพราะ clearance ยังปกติ'], a: 2, e: 'Initiation phase: loading dose ปกติ (ขึ้นกับ Vd ไม่ใช่การขับ) ประเมินยาที่ขับทางไต และหยุด nephrotoxic drugs หากทำได้ · ไม่ควรรอจน SCr สูง ไม่ต้องหยุดยาปฏิชีวนะทุกตัว และไม่เพิ่ม maintenance dose' },
  ],
}
