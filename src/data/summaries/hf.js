// Stable heart failure — converted from the RxTU10 class summary PDF (see content/summaries/manifest.json)
export default {
  id: 'hf',
  date: '25/07/2026',
  refs: [
    'สมาคมแพทย์โรคหัวใจแห่งประเทศไทย. แนวทางเวชปฏิบัติเพื่อการวินิจฉัยและการดูแลรักษาผู้ป่วยภาวะหัวใจล้มเหลว พ.ศ. 2562. https://cpg.dms.go.th/ebooks/',
    'Jedsadayanmata A. Pathophysiology, Pharmacology & Pharmacotherapy of Chronic Heart Failure. Thammasat University; 2024.',
    'Valente V, et al. The global epidemiology of heart failure: a comprehensive and contemporary review. Eur J Heart Fail. 2026.',
    'McDonagh TA, et al. 2021 ESC Guidelines for the diagnosis and treatment of acute and chronic heart failure. Eur Heart J. 2021;42(36):3599–726.',
    'Heidenreich PA, et al. 2022 AHA/ACC/HFSA Guideline for the Management of Heart Failure. Circulation. 2022;145(18):e895–e1032.',
    'Chirakarnjanakorn S, et al. 2023 HFCT Focused Update of the 2019 HFCT Heart Failure Guidelines Part 2: HFmrEF and HFpEF. J Med Assoc Thai. 2023;106.',
    'Jedsadayanmata A. Dietary Supplements for Prevention of Cardiovascular Diseases. Thammasat University; 2026.',
    'Mortensen SA, et al. The effect of coenzyme Q10 on morbidity and mortality in chronic heart failure: Q-SYMBIO. JACC Heart Fail. 2014;2(6):641–9.',
  ],
  sections: [
    { id: 'def', t: 'นิยามและระบาดวิทยา', html: `<p>กลุ่มอาการจากความผิดปกติของหัวใจและหลอดเลือด ทั้งโครงสร้างหรือการทำงาน เช่น กล้ามเนื้อหัวใจ ลิ้นหัวใจ เยื่อหุ้มหัวใจ หลอดเลือด <mark>ทำให้เลือดไปเลี้ยงร่างกายไม่เพียงพอ</mark> เกิดอาการเหนื่อยล้า อ่อนแรง <b>หายใจลำบากเมื่อออกแรง (dyspnea on exertion)</b> นอนราบไม่ได้ (orthopnea) นอนราบ 1–2 ชม. แล้วหอบ (paroxysmal nocturnal dyspnea) และบวม (fluid congestion)</p>
<div class="tbl"><table>
  <tr><th>Left-side HF</th><th>Right-side HF</th></tr>
  <tr><td><b>Dyspnea</b>, orthopnea, PND, pulmonary congestion (S3, rales, crepitation), mental confusion, fatigue, weakness, อาการของ right-sided HF</td>
      <td>เลือดจากระบบหลอดเลือดดำไหลกลับหัวใจไม่ได้ · peripheral (pitting) edema · dyspnea · elevated neck vein · hepatic enlargement, hepatojugular reflux · GI edema, nausea, anorexia</td></tr>
</table></div>
<p style="font-size:.9em">ส่วนใหญ่เริ่มจาก left HF แล้วตามด้วย right HF</p>
<ul>
  <li><b>Chronic HF:</b> อาการน้อย ค่อนข้างคงที่ หอบเหนื่อยเมื่อออกแรง เรื้อรัง รักษาแบบผู้ป่วยนอกได้</li>
  <li><b>Acute HF:</b> อาการแย่ลง หอบเหนื่อย<b>ขณะพัก</b> ต้องรักษาเร่งด่วน</li>
</ul>
<p><b>Epidemiology (2026):</b> อัตราการเกิดทั่วโลก 1–3% · ปี 2021 ผู้ป่วย 55.50 ล้านราย (676.68 ต่อ 100,000) · เอเชีย 50%, ยุโรป 18%, แอฟริกา 14%, อเมริกาเหนือ 10%, อเมริกาใต้และกลาง 8%</p>
<h3>Risk factors</h3>
<p>อายุมาก · CAD (เช่น IHD, AF) · HTN · DM · อ้วน · บุหรี่ แอลกอฮอล์ · ติดเชื้อ (virus, bacteria) · ยา (anthracyclines, taxanes) · พันธุกรรม</p>` },
    { id: 'dx', t: 'วินิจฉัย', html: `<h3>แนวทางไทย พ.ศ. 2562</h3>
<p>ใช้อาการและอาการแสดงทางคลินิกเป็นหลัก ตรวจเลือด ภาพถ่าย เป็นเพียงการช่วยยืนยัน</p>
<div class="tbl"><table>
  <tr><th>อาการและอาการแสดง</th><th>ผลตรวจที่บ่งชี้</th></tr>
  <tr><td>ออกแรง/ออกกำลังได้น้อยลง</td><td>LVEF &lt; 40% (HFrEF)</td></tr>
  <tr><td>นอนราบไม่ได้ (orthopnea)</td><td>เงาหัวใจใน chest X-ray กว้างขึ้น (HFrEF)</td></tr>
  <tr><td>หอบเหนื่อยหลังนอนหลับ (PND)</td><td>LVEF &gt; 40% ร่วมผนังหัวใจห้องล่างซ้ายหนา หัวใจห้องบนซ้ายโต หรือ diastolic dysfunction (HFmrEF, HFpEF)</td></tr>
  <tr><td>JVP สูง</td><td>LV end-diastolic pressure สูงขึ้น</td></tr>
  <tr><td>S3 gallop</td><td>natriuretic peptide (NP) สูง</td></tr>
  <tr><td>apical impulse เลื่อนออกด้านข้าง</td><td></td></tr>
</table></div>
<h3>ESC 2021</h3>
<p>อาการ และ/หรือ อาการแสดงของ HF + หลักฐานเชิงประจักษ์ว่าหัวใจทำงานผิดปกติ</p>
<figure><img data-fig="hf/p03-1.webp" alt="ESC diagnostic algorithm for heart failure: สงสัย HF → NT-proBNP/BNP → echocardiography → แบ่งตาม LVEF"><figcaption>ESC diagnostic algorithm: NT-proBNP ≥ 125 pg/mL หรือ BNP ≥ 35 pg/mL → echocardiography → แบ่ง phenotype ตาม LVEF</figcaption></figure>
<div class="tbl"><table>
  <tr><th>Symptoms</th><th>Signs</th></tr>
  <tr><td><b>Typical:</b> breathlessness, orthopnoea, PND, reduced exercise tolerance, fatigue, tiredness, ankle swelling</td><td><b>More specific:</b> elevated JVP, hepatojugular reflux, third heart sound (gallop), laterally displaced apical impulse</td></tr>
  <tr><td><b>Less typical:</b> nocturnal cough, wheezing, bloated feeling, loss of appetite, confusion (โดยเฉพาะผู้สูงอายุ), depression, palpitation, dizziness, syncope, bendopnea</td><td><b>Less specific:</b> weight gain (&gt; 2 kg/สัปดาห์), weight loss (advanced HF), cardiac murmur, peripheral oedema (ankle, sacral, scrotal), pulmonary crepitations, pleural effusion, tachycardia, irregular pulse, tachypnoea, hepatomegaly, ascites, cold extremities, oliguria, narrow pulse pressure</td></tr>
</table></div>` },
    { id: 'patho', t: 'กลไกและความรุนแรง', html: `<div class="tbl"><table>
  <tr><th>สาเหตุ</th><th>ผลที่ตามมา</th></tr>
  <tr><td>HR สูงหรือต่ำ (bradycardia, tachycardia ใน AF)<br>Preload ลด (mitral stenosis, hypertrophic cardiomyopathy)<br>Contractility ลด (MI, dilated cardiomyopathy จาก DM, CKD)<br>Afterload เพิ่ม (aortic stenosis, aortic regurgitation)</td>
      <td>ความดันในห้องหัวใจและหลอดเลือดสูง (elevated filling pressure) → การไหลเวียนไม่พอ → ระบบประสาทอัตโนมัติ ฮอร์โมน cytokine ถูกกระตุ้น → <b>left ventricle remodeling</b> (systolic และ diastolic dysfunction)</td></tr>
</table></div>
<h3>Severity</h3>
<div class="tbl"><table>
  <tr><th>ระบบ</th><th>ระดับ</th><th>คำอธิบาย</th></tr>
  <tr><td rowspan="4">ACC/AHA staging</td><td>A</td><td>มีปัจจัยเสี่ยง โครงสร้างหัวใจยังปกติ</td></tr>
  <tr><td>B</td><td>โครงสร้างผิดปกติ ยังไม่มีอาการ</td></tr>
  <tr><td>C</td><td>โครงสร้างผิดปกติ และมีหรือเคยมีอาการ</td></tr>
  <tr><td>D</td><td>อาการมาก ต้องได้การดูแลพิเศษ</td></tr>
  <tr><td rowspan="4">NYHA functional class</td><td>I</td><td>ใช้ชีวิตปกติ ไม่มีอาการ</td></tr>
  <tr><td>II</td><td>ทำกิจกรรมได้น้อยลงบ้าง ไม่มีอาการขณะพัก มีอาการเล็กน้อยเมื่อทำกิจกรรมทั่วไป</td></tr>
  <tr><td>III</td><td>ทำกิจกรรมได้น้อยลงมาก ไม่มีอาการขณะพัก มีอาการเมื่อทำกิจกรรมเพียงเล็กน้อย</td></tr>
  <tr><td>IV</td><td>มีอาการตลอดเวลา แม้ขณะพักหรือทำกิจกรรมเล็กน้อย</td></tr>
  <tr><td rowspan="4">LVEF</td><td>rEF</td><td>LVEF &lt; 40%</td></tr>
  <tr><td>mrEF</td><td>LVEF 40–49%</td></tr>
  <tr><td>pEF</td><td>LVEF ≥ 50%</td></tr>
  <tr><td>Recovery</td><td>HFrEF ที่รักษาแล้ว LVEF กลับมา ≥ 50%</td></tr>
</table></div>
<div class="key"><strong class="k">Ejection fraction</strong>EF = stroke volume / end-diastolic volume × 100 · บอก contractility จาก echocardiography</div>` },
    { id: 'drugs', t: 'Pharmacology', html: `<ul>
  <li><b>ลด neurohormonal activation (ลด mortality ใน HFrEF):</b> <mark>ACEI/ARNI, beta-blockers, MRAs, SGLT2 inhibitors</mark></li>
  <li><b>ลด preload/afterload (ลดอาการ):</b> vasodilators (ACEI/ARB, neprilysin inhibitor, hydralazine), diuretics (loop, thiazide)</li>
  <li><b>เพิ่มการบีบตัว:</b> positive inotrope เช่น digoxin</li>
  <li><b>ลด HR:</b> ivabradine, beta-blockers</li>
</ul>
<div class="tbl"><table>
  <tr><th>กลุ่ม</th><th>ยา</th><th>ADR / หมายเหตุ</th></tr>
  <tr><td>ACEI — ยับยั้ง ACE ไม่เกิด Ang II = vasodilation (efferent arteriole)</td><td>captopril, enalapril, lisinopril, ramipril, trandolapril</td><td>hypotension, AKI, hyperkalemia, angioedema, teratogenic, dry cough</td></tr>
  <tr><td>ARB — block AT1 receptor</td><td>candesartan, losartan, valsartan</td><td>hypotension, AKI, hyperkalemia, angioedema, teratogenic</td></tr>
  <tr><td>Beta-blockers</td><td><b>bisoprolol, carvedilol, metoprolol succinate, nebivolol</b> (มีการศึกษาว่าลดการตาย)</td><td>bradycardia, bronchospasm, hyperglycemia, hyperTG</td></tr>
  <tr><td>MRA</td><td>spironolactone</td><td>hyperkalemia — ติดตาม K ภายใน 7 วันหลังเพิ่มขนาด</td></tr>
  <tr><td>SGLT2i — เลียนแบบกลูโคส ยับยั้ง SGLT2 ลดการดูดกลับกลูโคส</td><td>dapagliflozin, empagliflozin</td><td>hypotension, UTI, Fournier's gangrene</td></tr>
  <tr><td>ARNI</td><td>sacubitril + valsartan</td><td>bleeding disorder, AKI, angioedema, hypotension, hyperkalemia</td></tr>
</table></div>
<div class="key"><strong class="k">ARNI</strong><mark>ห้ามใช้ ARNI พร้อม ACEI</mark> (ความดันต่ำมากและ angioedema) · ACEI → ARNI ต้อง hold 36 ชม. · ARB → ARNI เปลี่ยนได้เลย</div>
<div class="tbl"><table>
  <tr><th>ยา</th><th>MOA</th><th>ADR / หมายเหตุ</th></tr>
  <tr><td><b>Ivabradine</b> (If-channel inhibitor)</td><td>ยับยั้ง funny current (Na, K) → HR ลด · CYP3A4 (DI กับ inducer/inhibitor)</td><td>bradycardia, visual symptoms · ใช้ใน HFrEF ที่ HR &gt; 70 ลด mortality และ hospitalization</td></tr>
  <tr><td><b>Digoxin</b> (cardiac glycoside)</td><td>ยับยั้ง Na-K ATPase → Ca²⁺↑ → contractility↑</td><td>digitalis toxicity (cholinergic SE) · narrow therapeutic index · <mark>ระวัง hypokalemia, hypomagnesemia, hypercalcemia</mark> · ใช้ใน HFrEF ลด mortality (ตามต้นฉบับ)</td></tr>
  <tr><td><b>Hydralazine + isosorbide dinitrate</b></td><td>ลด venous return และ afterload ขยาย coronary</td><td>headache, hypotension, dizziness · ตัวสุดท้ายเมื่อใช้ ACEI/ARB/ARNI ไม่ได้</td></tr>
  <tr><td><b>Vericiguat</b></td><td>กระตุ้น sGC → cGMP↑ → vasodilation</td><td>hypotension, anemia, birth defect · AHA/ACC แนะนำใน CHFrEF ที่ยังมีอาการหลังได้ยาตาม guideline ครบ</td></tr>
  <tr><td><b>Diuretics</b></td><td>loop diuretics</td><td>ลดอาการหรืออาการแสดงของภาวะคั่งน้ำ</td></tr>
</table></div>` },
    { id: 'hfref', t: 'การรักษา HFrEF', html: `<figure><img data-fig="hf/p07-1.webp" alt="การรักษา HFrEF แบ่งตามประโยชน์ในการลดอัตราตาย: ACEI/ARB, BB, MRA ลดตายในผู้ป่วยส่วนใหญ่ · ARNI, ICD, CRT ในผู้ป่วยบางกลุ่ม · ivabradine, digoxin, ISDN/HDZ ลดการนอนโรงพยาบาล"><figcaption>การรักษา HFrEF ตามประโยชน์ในการลดอัตราตาย (แนวทางไทย 2562)</figcaption></figure>
<figure><img data-fig="hf/p07-2.webp" alt="ESC management of patients with HFrEF"><figcaption>ESC 2021: ACEI/ARNI + beta-blocker + MRA + dapagliflozin/empagliflozin + loop diuretic for fluid retention (class I)</figcaption></figure>
<h3>First line (Thai 2019)</h3>
<div class="tbl"><table>
  <tr><th>ยา</th><th>เริ่ม → เป้า</th><th>หมายเหตุ</th></tr>
  <tr><td>Enalapril</td><td class="num">2.5 mg BID → 10–20 mg BID</td><td>ผู้ป่วยทุกคนควรได้ ACEI</td></tr>
  <tr><td>Losartan</td><td class="num">25–50 mg OD → 50–150 mg OD</td><td>เมื่อใช้ ACEI ไม่ได้</td></tr>
  <tr><td>Bisoprolol</td><td class="num">1.25 mg OD → 10 mg OD</td><td></td></tr>
  <tr><td>Spironolactone</td><td class="num">12.5–25 mg OD</td><td><mark>ไม่ควรเกิน 50 mg OD · eGFR &lt; 30 หรือ K &gt; 5 ไม่ควรเริ่ม</mark></td></tr>
  <tr><td>Dapagliflozin / empagliflozin</td><td class="num">10 mg OD</td><td>ESC 2021</td></tr>
  <tr><td>Sacubitril/valsartan</td><td class="num">24/26 mg BID → 97/103 mg BID</td><td>เปลี่ยนจาก ACEI เว้น 36 ชม. · eGFR &lt; 30 สตรีมีครรภ์ หลีกเลี่ยง</td></tr>
</table></div>
<p style="font-size:.9em">ต้นฉบับพิมพ์ขนาดเริ่มต้นของ sacubitril/valsartan เป็น "sacubitril 19 mg + valsartan 51 mg" ซึ่งไม่มีขนาดนี้ ขนาดเริ่มต้นจริงคือ 24/26 mg — ข้อสอบข้อ 2 ใช้ตัวเลขตามต้นฉบับ</p>
<ul>
  <li><b>Ivabradine:</b> HFrEF ≤ 35% ที่ได้ ACEI/ARB, BB, MRA ครบแล้ว</li>
  <li><b>Hydralazine + ISDN:</b> ผู้ที่ใช้ ACEI/ARB ไม่ได้</li>
  <li><b>Digoxin:</b> HFrEF sinus rhythm ที่ได้ ACEI/ARB, BB, MRA ครบแล้ว</li>
  <li>ACEI, ARNI, ARB เริ่มได้ทุกราย ยกเว้น hyperkalemia, AKI · ESC 2021, AHA/ACC/HFSA 2022 และ Thai 2019 แนะนำแบบเดียวกัน</li>
</ul>
<h3>ยาที่ไม่ควรใช้ใน CHFrEF</h3>
<ul>
  <li>CCB โดยเฉพาะ <mark>non-DHP (verapamil, diltiazem) เพิ่ม mortality</mark></li>
  <li>NSAIDs · corticosteroids · glitazones (pioglitazone)</li>
  <li>Sympathomimetics (nasal decongestant, appetite suppressants) · anticholinergics (antihistamines, TCAs)</li>
</ul>` },
    { id: 'hfpef', t: 'การรักษา HFpEF', html: `<figure><img data-fig="hf/p08-1.webp" alt="2022 AHA/ACC/HFSA treatment of HFpEF: diuretics as needed (1), SGLT2i (2a), ARNI MRA ARB (2b)"><figcaption>2022 AHA/ACC/HFSA: diuretics ตามจำเป็น (1) · SGLT2i (2a) · ARNI, MRA, ARB (2b)</figcaption></figure>
<figure><img data-fig="hf/p08-2.webp" alt="Thai Heart Failure Guideline 2023 HFpEF: diuretics + RASi/ARNI + MRA + SGLT2i"><figcaption>Thai Heart Failure Guideline 2023 (HFpEF)</figcaption></figure>
<h3>First line (Thai 2023)</h3>
<ul>
  <li>Diuretic ตามจำเป็นเมื่อมีภาวะคั่งน้ำ (บรรเทาอาการ ป้องกัน HF แย่ลง)</li>
  <li>Dapagliflozin หรือ empagliflozin 10 mg OD — <b>ลด mortality และ hospitalization</b></li>
  <li>ARNI · spironolactone · ARB — ลด hospitalization</li>
</ul>
<h3>Herbs & food supplement</h3>
<ul>
  <li><b>วัคซีนไข้หวัดใหญ่:</b> ลดการนอนโรงพยาบาลจาก HF เฉียบพลัน และอัตราตายน้อยกว่าผู้ที่ไม่ได้รับ</li>
  <li><b>Coenzyme Q10</b> (ubiquinone): อยู่ในไมโทคอนเดรีย มีส่วนใน oxidative phosphorylation สร้าง ATP · ใช้ 300 mg/วันเพื่อป้องกัน CHF (มาก ปกติผลิตภัณฑ์มีแค่ 30 mg/เม็ด) · อาจมีประโยชน์ใน HFrEF แต่ข้อมูลไม่ชัด <b>ยังไม่แนะนำ</b></li>
</ul>` },
  ],
  questions: [
    { q: 'ยาใด "ไม่ได้" ช่วยลดอัตราตายในผู้ป่วย CHFrEF', o: ['Dapagliflozin', 'Digoxin', 'Carvedilol', 'Spironolactone', 'Candesartan'], a: 1, e: 'การศึกษา DIG พบว่า digoxin ลดการนอนโรงพยาบาลได้โดยเฉพาะผู้ที่อาการรุนแรง แต่ไม่ลดอัตราการเสียชีวิต' },
    { q: 'แพทย์ต้องการเปลี่ยน enalapril 2.5 mg BID เป็น sacubitril 19 mg + valsartan 51 mg BID เพราะผู้ป่วยไอแห้งรบกวนการนอน ควรปรับแผนอย่างไร', o: ['ลด enalapril เหลือ 2.5 mg OD 1 วัน แล้วเริ่ม sacubitril/valsartan', 'ลด enalapril เหลือ 2.5 mg OD ควบคู่กับเริ่ม sacubitril/valsartan', 'หยุด enalapril แล้วเริ่ม sacubitril/valsartan มื้อถัดไปได้เลย', 'หยุด enalapril แล้วเว้นอย่างน้อย 36 ชั่วโมงก่อนเริ่ม sacubitril/valsartan', 'หยุด enalapril แล้วเว้นอย่างน้อย 72 ชั่วโมงก่อนเริ่ม sacubitril/valsartan'], a: 3, e: 'ห้ามใช้ ARNI พร้อม ACEI เพราะความดันต่ำมากและเกิด angioedema ได้ จึงต้องหยุด ACEI อย่างน้อย 36 ชั่วโมงก่อนเริ่ม ARNI' },
    { q: 'ชาย 60 ปี CHFrEF, HTN EF 30% eGFR 70 · BP 123/78 HR 68 ไม่มี JVD ไม่บวม · K 4.2 · ยาที่ได้ enalapril 20 mg BID, (ยาอื่น) 10 mg OD · ถ้าต้องการเพิ่ม spironolactone ข้อใดเหมาะสมที่สุด', o: ['เริ่ม spironolactone 12.5 mg 1×1 เพราะมีข้อบ่งชี้ และ K กับไตอยู่ในเกณฑ์ปลอดภัยเริ่มยา', 'เริ่ม spironolactone 25 mg 1×2 เพราะมีข้อบ่งชี้ และ K กับไตอยู่ในเกณฑ์ปลอดภัย', 'เริ่ม spironolactone 25 mg 1×1 ควบคู่กับ KCl เพื่อป้องกัน electrolyte imbalance', 'เริ่ม spironolactone 50 mg 1×1 ทันทีเพื่อลดอัตราตายเร็ว', 'เริ่ม spironolactone ไม่ได้ เพราะ K ต้อง > 4.0'], a: 0, e: 'MRA ขนาดต่ำที่ไม่มีฤทธิ์ขับปัสสาวะลดอัตราตายและการนอนโรงพยาบาลซ้ำใน HFrEF (LVEF < 35%) NYHA II–IV แม้ได้ ACEI และ BB อยู่ · เลี่ยง spironolactone ตั้งแต่ 50 mg/วัน · ห้ามใช้ MRA + ACEI + ARB พร้อมกัน · ไม่เริ่มเมื่อ eGFR < 30 หรือ K > 5.0' },
    { q: 'ผู้ป่วย 54 ปี HTN, HFrEF (EF 30%) ได้ enalapril, bisoprolol, spironolactone มีอาการไอแห้งรบกวนการนอนและชีวิตประจำวัน ควรปรับแผนอย่างไร', o: ['ไม่ปรับเปลี่ยน', 'ให้ยาบรรเทาไอ (เช่น dextromethorphan) ควบคู่ enalapril', 'หยุด enalapril โดยไม่ต้องเริ่มยายับยั้ง RAAS อื่น', 'หยุด enalapril และเริ่ม losartan', 'หยุด enalapril เปลี่ยนเป็น lisinopril ขนาดเทียบเท่า'], a: 3, e: 'ไอแห้งเป็นผลข้างเคียงที่พบบ่อยของ ACEI · แนะนำ ARB ใน HFrEF ที่ใช้ ACEI ไม่ได้ เพื่อลดอัตราตายและภาวะแทรกซ้อน โดยให้ beta-blocker และ MRA ร่วมด้วย' },
    { q: 'หญิง 61 ปี HFrEF (LVEF 30%) ร่วม HTN BP 130/80 HR 78 ไม่มีน้ำเกิน ได้ enalapril 10 mg BID, atenolol 50 mg OD, spironolactone 25 mg OD ข้อใดเหมาะสมที่สุด', o: ['การรักษาเหมาะสมแล้ว', 'เพิ่ม atenolol เป็น 100 mg OD', 'หยุด atenolol โดยไม่เริ่ม beta-blocker ตัวอื่น', 'เปลี่ยน atenolol เป็น propranolol เพราะ non-selective ครอบคลุมกว่า', 'เปลี่ยน atenolol เป็น carvedilol แล้วค่อย ๆ titrate'], a: 4, e: 'Beta-blocker ที่มีหลักฐานลดอัตราตายและการเกิดโรคร่วมใน HFrEF ได้แก่ bisoprolol, carvedilol, sustained-release metoprolol succinate และ nebivolol' },
  ],
}
