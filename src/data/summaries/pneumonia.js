// Pneumonia — converted from the RxTU10 class summary PDF (see content/summaries/manifest.json)
// PDF text layer ใช้ฟอนต์ที่แมปวรรณยุกต์เป็นตัวอังกฤษ → ถอดรหัสกลับเป็นไทยแล้วตรวจกับภาพหน้า
const fig = (f, cap, alt) => `<figure><img data-fig="pneumonia/${f}.webp" alt="${alt || cap}"><figcaption>${cap}</figcaption></figure>`

export default {
  id: 'pneumonia',
  date: '28/07/2026',
  refs: [
    'Kittiya Jantarathaneewat, PharmD. Community acquired pneumonia. 2024.',
    'Infectious Diseases Society of America. CAP clinical pathway. 2023.',
    'Metlay JP, et al. Diagnosis and treatment of adults with community-acquired pneumonia. An official clinical practice guideline of the ATS and IDSA. Am J Respir Crit Care Med. 2019;200(7):e45-e67.',
    'Guideline Central. ATS/IDSA diagnosis and management of community-acquired pneumonia guidelines timeline (2019–2025). 2025.',
    'Jones BE, et al. Diagnosis and management of community-acquired pneumonia: an official American Thoracic Society clinical practice guideline. Am J Respir Crit Care Med. 2026;212(1):24-44.',
    'กรมการแพทย์. คำแนะนำการใช้ยารักษาโรคไข้หวัดใหญ่ ฉบับปรับปรุงวันที่ 2 ตุลาคม 2566.',
    'กรมการแพทย์. แนวทางเวชปฏิบัติ การวินิจฉัย ดูแลรักษา และป้องกันการติดเชื้อในโรงพยาบาล กรณีโรคติดเชื้อไวรัสโคโรนา 2019 (COVID-19) ฉบับปรับปรุงครั้งที่ 27 วันที่ 18 เมษายน 2566.',
    'เอกสารกำกับยาและบทความ PK: amoxicillin, doxycycline, ceftriaxone, azithromycin, levofloxacin, vancomycin, linezolid, piperacillin/tazobactam, oseltamivir, nirmatrelvir/ritonavir, remdesivir, molnupiravir.',
  ],
  sections: [
    { id: 'def', t: 'นิยามและการวินิจฉัย', html: `<ul>
  <li>ปอดบวม/ปอดอักเสบเป็นสาเหตุที่พบบ่อยที่สุดของ severe sepsis และเป็นสาเหตุการเสียชีวิตจากโรคติดเชื้อที่สำคัญ อัตราเสียชีวิตอาจสูงถึง 50%</li>
  <li>พบได้ทั้งปีและทุกช่วงอายุ · รุนแรงที่สุดในเด็กเล็ก ผู้สูงอายุ และผู้ป่วยโรคเรื้อรัง</li>
</ul>
<p><b>นิยาม:</b> การอักเสบจากการติดเชื้อของเนื้อปอด (lung parenchyma) · <b>pathogen + weak defense mechanism → pneumonia</b> · เชื้อกระตุ้นการอักเสบของถุงลม มีของเหลว หนอง และเซลล์อักเสบแทนอากาศ → แลกเปลี่ยนก๊าซลดลง → ไอ หายใจลำบาก เหนื่อย ไข้</p>
<div class="tbl"><table>
  <tr><th>ชนิด</th><th>นิยาม</th></tr>
  <tr><td><b>CAP</b></td><td>ติดเชื้อเฉียบพลันของเนื้อปอดนอกโรงพยาบาล</td></tr>
  <tr><td><b>HAP</b></td><td>เกิดหลังนอนโรงพยาบาล ≥ 48 ชม.</td></tr>
  <tr><td><b>VAP</b></td><td>HAP ที่เกิดหลังใส่ท่อช่วยหายใจ &gt; 48 ชม. (90% ของ HAP เกิดระหว่างใช้เครื่องช่วยหายใจ)</td></tr>
</table></div>
<p><b>ปัจจัยเสี่ยง:</b> อายุ &gt; 65 ปี · โรคเรื้อรังของหัวใจ ปอด ไต ตับ · เบาหวาน · สูบบุหรี่ ดื่มแอลกอฮอล์ในทางที่ผิด · asplenia</p>
<h3>Pathophysiology</h3>
<p>เชื้อ (เช่น <i>S. pneumoniae</i>) เข้าปอดทาง inhalation, aspiration หรือ hematogenous → เพิ่มจำนวนในถุงลม → alveolar macrophage หลั่ง cytokines → neutrophils เข้าถุงลม → alveolar exudate → อาการทางปอด (ไอ เสมหะ หอบ เสียงปอดผิดปกติ hypoxia) และทั่วร่างกาย (ไข้ อ่อนเพลีย หัวใจเต้นเร็ว WBC สูง)</p>
<h3>อาการ</h3>
<ul>
  <li>ไข้ หนาวสั่น หอบ ไอมีเสมหะ เกิดเฉียบพลัน · เสมหะสีสนิม (rust-colored) หรือมีเลือด · pleuritic chest pain</li>
  <li><b>ตรวจร่างกาย:</b> tachypnea, tachycardia · dullness to percussion · tactile fremitus, whisper pectoriloquy, egophony เพิ่ม · chest wall retraction, grunting · เสียงหายใจลดลง · inspiratory crackles</li>
</ul>
<h3>วินิจฉัย CAP ในผู้ใหญ่ ≥ 18 ปี ที่ภูมิคุ้มกันปกติ (ครบ 3 ข้อ)</h3>
<ol>
  <li>Pulmonary infiltrate ใหม่จาก chest imaging</li>
  <li>อาการทางเดินหายใจ ≥ 1: ไอใหม่หรือมากขึ้น · เสมหะใหม่หรือมากขึ้น · dyspnea · pleuritic chest pain</li>
  <li>อาการอื่น ≥ 1: เสียงปอดผิดปกติ (rhonchi, rales) · ไข้ ≥ 38°C (100.4°F) · leukocytosis หรือ bandemia ไม่ทราบสาเหตุ · hypoxia &lt; 90%</li>
</ol>` },
    { id: 'severity', t: 'ความรุนแรงและการตรวจเชื้อ', html: `<h3>Severe CAP</h3>
<p>Major ≥ 1 ข้อ <b>หรือ</b> minor ≥ 3 ข้อ</p>
<div class="tbl"><table>
  <tr><th>Major criteria</th><th>Minor criteria</th></tr>
  <tr><td>Septic shock ที่ต้องใช้ vasopressors<br>Respiratory failure ที่ต้องใช้ mechanical ventilation</td><td>RR ≥ 30/min · PaO₂/FiO₂ ≤ 250 · multilobar infiltrates · confusion/disorientation · BUN ≥ 20 mg/dL · WBC &lt; 4,000/µL · platelet &lt; 100,000/µL · core temp &lt; 36°C · ความดันต่ำที่ต้องให้สารน้ำอย่างเข้มข้น</td></tr>
</table></div>
<h3>CURB-65 (OPD หรือ IPD)</h3>
<p><b>C</b>onfusion · <b>U</b>rea (BUN) &gt; 20 mg/dL · <b>R</b>R ≥ 30/min · <b>B</b>P systolic &lt; 90 หรือ diastolic ≤ 60 mmHg · อายุ ≥ <b>65</b> ปี (ข้อละ 1 คะแนน)</p>
<div class="tbl"><table>
  <tr><th>คะแนน</th><th>30-day mortality</th><th>ที่รักษา</th></tr>
  <tr><td>0–1</td><td>&lt; 3%</td><td>OPD</td></tr>
  <tr><td>2</td><td>9%</td><td>IPD</td></tr>
  <tr><td>3–5</td><td>15–40%</td><td>IPD</td></tr>
</table></div>
<h3>PSI (Pneumonia Severity Index)</h3>
${fig('p05-1', 'คะแนน PSI: ข้อมูลประชากร โรคร่วม การตรวจร่างกาย และผลแล็บ', 'ตารางคะแนน PSI ประกอบด้วยอายุ เพศ nursing home โรคร่วม การตรวจร่างกาย และผลแล็บ')}
<div class="tbl"><table>
  <tr><th>คะแนน</th><th>Class</th><th>คำแนะนำ</th></tr>
  <tr><td>&lt; 51</td><td>I</td><td rowspan="3">พิจารณารักษาแบบผู้ป่วยนอก โดยเฉพาะ class I และ II</td></tr>
  <tr><td>51–70</td><td>II</td></tr>
  <tr><td>71–90</td><td>III</td></tr>
  <tr><td>91–130</td><td>IV</td><td rowspan="2">ควรรับไว้ในโรงพยาบาล</td></tr>
  <tr><td>&gt; 130</td><td>V</td></tr>
</table></div>
<h3>Microbiology testing</h3>
<ul>
  <li>OPD: ไม่จำเป็นต้องตรวจ</li>
  <li>IPD: blood cultures · sputum Gram stain และ culture · ตรวจ respiratory viruses</li>
  <li>Severe: urinary antigen ของ S. pneumoniae · Legionella outbreak หรือเพิ่งเดินทางในพื้นที่ระบาด: Legionella PCR</li>
</ul>
<div class="tbl"><table>
  <tr><th>วิธีเก็บ (quantitative)</th><th>มีนัยสำคัญเมื่อ</th></tr>
  <tr><td>Noninvasive: ขากเสมหะ, tracheal aspiration</td><td>≥ 10⁶ CFU/mL</td></tr>
  <tr><td>Bronchoalveolar lavage (BAL)</td><td>≥ 10⁴ CFU/mL</td></tr>
  <tr><td>Protected specimen brush (PSB)</td><td>≥ 10³ CFU/mL</td></tr>
</table></div>
<p><b>เสมหะคุณภาพดี:</b> WBC &gt; 25/LPF (ภูมิคุ้มกันบกพร่องอาจต่ำกว่า) และ epithelial cells &lt; 10/LPF · เชื้อในเสมหะอาจเป็นแค่ colonization (ไม่ก่ออาการ)</p>` },
    { id: 'path', t: 'เชื้อก่อโรค', html: `${fig('p07-1', 'เชื้อก่อโรคที่พบบ่อยในผู้ใหญ่และเด็ก', 'ตารางเชื้อไวรัสและแบคทีเรียก่อปอดบวมในผู้ใหญ่และเด็ก ผู้ใหญ่พบ S. pneumoniae มากสุด')}
${fig('p07-2', 'สาเหตุที่พบบ่อยของ CAP ตามสถานที่รักษา (OPD, IPD non-ICU, ICU)', 'Outpatient: S. pneumoniae, M. pneumoniae, H. influenzae, C. pneumoniae, respiratory virus · ICU เพิ่ม S. aureus, Legionella, gram-negative bacilli')}
<h3>ปัจจัยเสี่ยง drug-resistant S. pneumoniae (DRSP)</h3>
<p>อายุ &lt; 2 ปี หรือ &gt; 65 ปี · ได้ beta-lactam (หรือ macrolide, FQ) ใน 3–6 เดือน · alcoholism · โรคร่วม · ภูมิคุ้มกันบกพร่องหรือยากดภูมิ · สัมผัสเด็กใน day care</p>
<h3>ปัจจัยเสี่ยง MRSA และ Pseudomonas</h3>
<div class="tbl"><table>
  <tr><th></th><th>MRSA</th><th>Pseudomonas</th></tr>
  <tr><td><b>Strong risk</b> (empiric ทุกระดับความรุนแรง)</td><td colspan="2">มี colonization หรือเคยติดเชื้อนั้นมาก่อน · เคยนอนโรงพยาบาลและได้ IV antibiotics ใน 3 เดือน</td></tr>
  <tr><td>ปัจจัยอื่น (พิจารณาในรายรุนแรง)</td><td>เพิ่งนอนโรงพยาบาลหรือได้ ATB (โดยเฉพาะ IV) · เพิ่งมี influenza-like illness · necrotizing/cavitary pneumonia · empyema · immunosuppression · เสี่ยง MRSA colonization: ESRD, ที่แออัด, ยาเสพติดฉีด, contact sports, MSM</td><td>เพิ่งนอนโรงพยาบาลหรือสถานดูแลระยะยาว · เพิ่งได้ ATB ทุกชนิด · COPD exacerbation บ่อยจนต้องใช้ steroid/ATB · โรคโครงสร้างปอด เช่น bronchiectasis, cystic fibrosis · immunosuppression</td></tr>
</table></div>
<ul>
  <li><b>M. pneumoniae, C. pneumoniae:</b> walking pneumonia ค่อยเป็นค่อยไป รุนแรงน้อย · patchy infiltrates ใน CXR กว้างกว่าอาการ</li>
  <li><b>Legionella pneumophila:</b> รุนแรง พบบ่อยใน CAP ที่ต้องเข้า ICU</li>
</ul>` },
    { id: 'tx', t: 'การรักษา Bacterial CAP (ATS/IDSA 2019)', html: `${fig('p09-1', 'แนวทางแบ่ง OPD/IPD ตาม PSI และสูตรยาเริ่มต้น', 'แผนภูมิ PSI ≤ 70 รักษาแบบผู้ป่วยนอก 71–90 ผู้ป่วยนอกหรือสังเกตอาการ ≥ 91 รับไว้ แล้วเลือกสูตรยาตามโรคร่วมและความรุนแรง')}
<h3>ผู้ป่วยนอก (OPD)</h3>
<div class="tbl"><table>
  <tr><th>ภาวะ</th><th>การรักษา</th></tr>
  <tr><td><b>ไม่มีโรคร่วม</b>และไม่มีปัจจัยเสี่ยง MRSA/Pseudomonas</td><td><b>Amoxicillin 1 g TID</b> หรือ doxycycline 100 mg BID หรือ macrolide (ถ้า pneumococcal resistance ในพื้นที่ &lt; 25%): azithromycin 500 mg วันแรก แล้ว 250 mg OD · clarithromycin 500 mg BID หรือ ER 1,000 mg OD</td></tr>
  <tr><td><b>มีโรคร่วม</b> (หัวใจ ปอด ตับ ไตเรื้อรัง เบาหวาน ติดสุรา มะเร็ง asplenia)</td><td>Combination: amoxicillin/clavulanate (500/125 TID, 875/125 BID, 2,000/125 BID) หรือ cephalosporin (cefpodoxime 200 mg BID, cefuroxime 500 mg BID) <b>ร่วมกับ</b> macrolide หรือ doxycycline<br>หรือ monotherapy ด้วย respiratory FQ: levofloxacin 750 mg OD · moxifloxacin 400 mg OD · gemifloxacin 320 mg OD</td></tr>
</table></div>
<p>ผู้มีโรคร่วมต้องใช้ยาครอบคลุมกว้างขึ้น เพราะเสี่ยงผลลัพธ์แย่ถ้ายาไม่ครอบคลุม และมักเคยสัมผัสระบบสาธารณสุขหรือได้ ATB มาก่อน · ต้องครอบคลุม H. influenzae และ M. catarrhalis (สร้าง beta-lactamase), S. aureus, gram-negative bacilli, M. pneumoniae, C. pneumoniae</p>
<h3>ผู้ป่วยใน (IPD) standard regimen</h3>
<div class="tbl"><table>
  <tr><th>ภาวะ</th><th>การรักษา</th></tr>
  <tr><td>Non-severe</td><td><b>Beta-lactam + macrolide</b> (นิยม) หรือ respiratory FQ</td></tr>
  <tr><td>Severe</td><td>Beta-lactam + macrolide หรือ beta-lactam + respiratory FQ</td></tr>
  <tr><td>ห้ามใช้ทั้ง macrolide และ FQ</td><td>Beta-lactam + doxycycline 100 mg BID</td></tr>
</table></div>
<div class="tbl"><table>
  <tr><th>กลุ่ม</th><th>ขนาด</th></tr>
  <tr><td>Beta-lactam</td><td>Ampicillin/sulbactam 1.5–3 g q 6 h · cefotaxime 1–2 g q 8 h · <b>ceftriaxone 1–2 g OD</b> · ceftaroline 600 mg q 12 h</td></tr>
  <tr><td>Macrolide</td><td>Azithromycin 500 mg OD (กิน/ฉีด) · clarithromycin 500 mg BID</td></tr>
  <tr><td>Respiratory FQ</td><td>Levofloxacin 750 mg OD · moxifloxacin 400 mg OD</td></tr>
  <tr><td>MRSA</td><td>Vancomycin 15 mg/kg q 12 h ปรับตามระดับยา · linezolid 600 mg q 12 h</td></tr>
  <tr><td>P. aeruginosa</td><td>Piperacillin/tazobactam 4.5 g q 6 h (ครอบคลุม anaerobe กรณีสำลัก) · cefepime 2 g q 8 h · ceftazidime 2 g q 8 h · imipenem 500 mg q 6 h · meropenem 1 g q 8 h (carbapenem เก็บไว้เคสดื้อยา วิกฤต หรือ shock) · aztreonam 2 g q 8 h</td></tr>
</table></div>
<h3>เพิ่ม MRSA / Pseudomonas coverage</h3>
<div class="tbl"><table>
  <tr><th>ภาวะ</th><th>เคยติดเชื้อนั้นมาก่อน</th><th>เพิ่งนอนโรงพยาบาล + IV ATB และมีปัจจัยเสี่ยงในพื้นที่</th></tr>
  <tr><td>Non-severe</td><td>เพิ่ม coverage และเพาะเชื้อ (MRSA: nasal PCR) เพื่อ de-escalate</td><td>เพาะเชื้อก่อน ให้ coverage เมื่อผลเป็นบวก</td></tr>
  <tr><td>Severe</td><td>เพิ่ม coverage และเพาะเชื้อเพื่อ de-escalate</td><td>เพิ่ม coverage ทันที และเพาะเชื้อเพื่อ de-escalate</td></tr>
</table></div>
<h3>Additional therapy</h3>
<ul>
  <li><b>Anaerobic coverage:</b> เฉพาะสงสัย lung abscess หรือ empyema → เพิ่ม clindamycin หรือใช้ beta-lactam/beta-lactamase inhibitor · ไม่เพิ่มเป็นประจำใน aspiration pneumonia</li>
  <li><b>Corticosteroids:</b> ใช้ใน CAP ที่มี refractory septic shock</li>
  <li><b>Influenza บวก:</b> ให้ oseltamivir และ<b>ให้ ATB มาตรฐานตั้งแต่แรก</b> ทั้ง OPD และ IPD เพราะการติดเชื้อแบคทีเรียร่วมพบบ่อยและรุนแรง ตัดออกไม่ได้</li>
</ul>
<h3>De-escalation และ IV-to-PO</h3>
${fig('p14-1', 'ยาที่เลือกตามเชื้อที่เพาะได้ (1)', 'ตารางยาที่แนะนำและทางเลือกตามเชื้อ เช่น S. pneumoniae ไวต่อ penicillin ใช้ penicillin G หรือ amoxicillin')}
${fig('p14-2', 'ยาที่เลือกตามเชื้อที่เพาะได้ (2)', 'ตารางยาตามเชื้อ เช่น Pseudomonas ใช้ antipseudomonal beta-lactam, MRSA ใช้ vancomycin หรือ linezolid')}
${fig('p15-1', 'ยาที่เลือกตามเชื้อที่เพาะได้ (3) และหมายเหตุ', 'ตารางยาตามเชื้อส่วนที่เหลือ เช่น anaerobe, influenza, TB และเชื้อรา')}
${fig('p16-1', 'การเปลี่ยนจากยาฉีดเป็นยากิน', 'แผนภูมิ IV-to-PO: ถ้าอาการดีขึ้น hemodynamic stable กินยาได้ เปลี่ยนเป็นยากินตามเชื้อ หรือตามยาฉีดเดิม')}
<ul>
  <li>เปลี่ยนเป็นยากินเมื่อดีขึ้นทางคลินิก hemodynamic stable กินได้ ไข้และอาการดีขึ้น · ไข้อาจยังมีใน lobar pneumonia · ไอจาก pneumococcus อาจไม่หายใน 1 สัปดาห์ · CXR มักหายใน 4 สัปดาห์ (ผู้สูงอายุหรือโรคปอดเดิมนานถึง 12 สัปดาห์)</li>
  <li>เลี่ยง FQ ในผู้มี QT prolongation · ได้ azithromycin ครบ 1.5 g แล้วหยุด atypical coverage ได้</li>
</ul>
<h3>ระยะเวลา</h3>
<p>ให้จน <b>clinical stability และไม่น้อยกว่า 5 วัน</b> · CAP ที่หายใน 5–7 วันไม่ต้อง CXR ติดตาม</p>
<div class="key"><strong class="k">Clinical stability</strong>T ≤ 37.8°C · HR ≤ 100 · SBP ≥ 90 mmHg · SpO₂ ≥ 90% หรือ PaO₂ ≥ 60 mmHg (room air) · RR &lt; 24 · รู้สึกตัวปกติ · กินได้</div>
<h3>เปรียบเทียบแนวทาง 2019 กับ 2025</h3>
<div class="tbl"><table>
  <tr><th>หัวข้อ</th><th>2019</th><th>2025</th></tr>
  <tr><td>Lung ultrasound</td><td>ไม่กล่าวถึง</td><td>ใช้แทน CXR ในการวินิจฉัยได้ถ้ามีความเชี่ยวชาญ</td></tr>
  <tr><td>ATB เมื่อพบ respiratory virus</td><td>ไม่กล่าวถึง</td><td>OPD ไม่มีโรคร่วม: <b>ไม่ให้</b> · OPD มีโรคร่วม, IPD non-severe, severe: ให้</td></tr>
  <tr><td>ระยะเวลา ATB</td><td>จน stable และ ≥ 5 วัน</td><td>OPD และ IPD non-severe ที่ stable: <b>3 ถึง &lt; 5 วัน</b> · severe ยัง ≥ 5 วัน</td></tr>
  <tr><td>Systemic corticosteroids</td><td>ไม่แนะนำเป็นประจำทั้ง non-severe, severe CAP และ severe influenza</td><td>Non-severe ยังไม่แนะนำ · <b>severe CAP แนะนำให้ใช้</b></td></tr>
</table></div>` },
    { id: 'drug', t: 'PK ของยาต้านแบคทีเรีย', html: `<div class="tbl"><table>
  <tr><th>ยา</th><th>Absorption / Distribution</th><th>Metabolism / Elimination</th></tr>
  <tr><td><b>Amoxicillin</b></td><td>F 75–93% อาหารไม่มีผล Tmax 1–2 ชม. · กระจายดี (หูชั้นกลาง เสมหะ ปอด ทางเดินปัสสาวะ) PB 17–20% · เข้า CSF น้อย ยกเว้นเยื่อหุ้มสมองอักเสบ</td><td>เปลี่ยนแปลงน้อย ไม่ผ่าน CYP · ขับทางไต 60–80% ใน 6–8 ชม. · t½ 1–1.5 ชม. ต้องกินตามรอบเคร่งครัด</td></tr>
  <tr><td><b>Doxycycline</b></td><td>F 90–100% · อาหารและนมรบกวนน้อยกว่า tetracycline รุ่นเก่า แต่ Ca, Mg, Al, Fe ลดการดูดซึมมาก · Tmax 2–3 ชม. · PB 80–93% กระจายดี (ปอด ไต ต่อมลูกหมาก)</td><td>ผ่านตับน้อยมาก ไม่ต้องปรับในตับหรือไตบกพร่องเล็กน้อยถึงปานกลาง · ขับทางอุจจาระ 40–60% ปัสสาวะ 35–40% · t½ 10–22 ชม.</td></tr>
  <tr><td><b>Ceftriaxone</b></td><td>IV/IM เท่านั้น (IM F 100% Tmax 2–3 ชม.) · PB 85–95% · Vd 5.8–13.5 L · เข้าปอด กระดูก น้ำดี ผ่านรก · เข้า CSF ดีเมื่อเยื่อหุ้มสมองอักเสบ</td><td>แทบไม่ถูก metabolize · t½ 5.8–8.7 ชม. · ขับทางไต 33–67% ที่เหลือทางน้ำดี · HD กำจัดไม่ได้ · ไม่ต้องปรับในไตหรือตับบกพร่องอย่างเดียว</td></tr>
  <tr><td><b>Azithromycin</b></td><td>F ~38% Tmax 2–3 ชม. อาหารเพิ่ม Cmax · Vd 31.1 L/kg สะสมในเนื้อเยื่อสูง (ใน phagocytes) · PB 7–51% · เข้า CSF น้อย</td><td>แทบไม่ถูก metabolize · terminal t½ ~68 ชม. · ขับทางน้ำดีเป็นหลัก ปัสสาวะ ~6%</td></tr>
  <tr><td><b>Levofloxacin</b></td><td>F ~99% → IV-to-PO ขนาดเท่ากัน · Tmax 1–2 ชม. · Vd 74–112 L PB 24–38% กระจายดี</td><td>Metabolize น้อย ไม่ผ่าน CYP · ขับทางไตรูปเดิม ~87% · t½ 6–8 ชม. · <b>ปรับขนาดในไตบกพร่อง</b></td></tr>
  <tr><td><b>Vancomycin</b></td><td>กินดูดซึมน้อยมาก (ใช้กินเฉพาะ C. difficile) · systemic ต้อง IV · Vd 0.4–1.0 L/kg PB 30–55% · เข้า CSF เมื่อเยื่อหุ้มสมองอักเสบ</td><td>แทบไม่ถูก metabolize · ขับทางไตรูปเดิม 75–90% ใน 24 ชม. · t½ 4–8 ชม. (ยาวมากในไตบกพร่อง) · <b>ต้องปรับขนาดและทำ TDM</b></td></tr>
  <tr><td><b>Linezolid</b></td><td>F ~100% IV-to-PO ขนาดเท่ากัน · Vd 40–50 L PB 31% กระจายดีรวม CSF</td><td>Non-enzymatic oxidation ไม่ผ่าน CYP · t½ 5–7 ชม. · ปัสสาวะรูปเดิม 30% · ไม่ต้องปรับในไตบกพร่อง (metabolite อาจสะสมในไตวายรุนแรง)</td></tr>
  <tr><td><b>Piperacillin/tazobactam</b></td><td>IV เท่านั้น · Vd 13–18 L / 18–20 L · PB ~30% / 20–30% · กระจายดี เข้า CSF น้อย</td><td>Metabolize เล็กน้อย ไม่ผ่าน CYP · ขับทางไต (pip 68%, tazo 80%) · t½ 0.7–1.2 ชม. · <b>ปรับขนาดในไตบกพร่อง</b></td></tr>
</table></div>` },
    { id: 'flu', t: 'Viral pneumonia: Influenza', html: `<p>25% ของ CAP เกิดจากไวรัส · พบบ่อย: influenza, rhinovirus, RSV, coronavirus</p>
<ul>
  <li>Influenza เป็น single-stranded RNA virus มี 4 ชนิด A, B, C, D · A และ B ระบาดตามฤดูกาลในคน · subtype ตาม hemagglutinin (H) และ neuraminidase (N)</li>
  <li>ระบาดสูงสุด: เขตอบอุ่นช่วงฤดูหนาว · เขตร้อนชื้นช่วงอากาศเย็นและฤดูฝน</li>
  <li><b>อาการ:</b> ฟักตัว 1–4 วัน · ไข้เฉียบพลัน 37.8–40°C · ไอแห้ง · ปวดเมื่อย อ่อนเพลีย · เจ็บคอ คลื่นไส้ คัดจมูก ปวดหัว · ผู้สูงอายุและภูมิคุ้มกันบกพร่องอาการไม่ชัด (ไม่มีไข้ ซึมสับสน เบื่ออาหาร)</li>
</ul>
<div class="tbl"><table>
  <tr><th>การตรวจ</th><th>ความไว / จำเพาะ</th><th>เวลา</th></tr>
  <tr><td>Rapid influenza diagnostic test (antigen)</td><td>ไวต่ำ–ปานกลาง / จำเพาะสูง</td><td>&lt; 15 นาที</td></tr>
  <tr><td>Rapid molecular assay</td><td>สูง / สูง</td><td>15–30 นาที</td></tr>
  <tr><td>RT-PCR</td><td>สูง / สูง</td><td>1–8 ชม.</td></tr>
  <tr><td>Viral culture</td><td>สูง / สูง</td><td>3–10 วัน</td></tr>
</table></div>
<p><b>กลุ่มเสี่ยงที่ควรได้รับการรักษา:</b> อายุ ≥ 65 ปี · เด็ก &lt; 2 ปี · หืด · โรคระบบประสาท · โรคเลือด · ปอดเรื้อรัง · เบาหวาน · โรคหัวใจ ไต ตับ · โรคเมตาบอลิก · BMI ≥ 40 · อายุ &lt; 19 ปีที่ได้ aspirin ระยะยาว · ภูมิคุ้มกันอ่อนแอ (HIV มะเร็ง เคมีบำบัด steroid/ยากดภูมิระยะยาว) · stroke · หญิงตั้งครรภ์และ 2 สัปดาห์หลังคลอด · ผู้อยู่ในสถานดูแลผู้สูงอายุ</p>
<h3>การรักษา (กรมการแพทย์ 2 ต.ค. 2566)</h3>
${fig('p30-1', 'แนวทางรักษาผู้ป่วยไข้หวัดใหญ่ (กรมการแพทย์ 2566)', 'แผนภูมิแนวทางรักษาไข้หวัดใหญ่ แยกผู้ป่วยที่มีอาการรุนแรง กลุ่มเสี่ยง และกลุ่มไม่เสี่ยง')}
<ul>
  <li>Supportive treatment</li>
  <li>ยาต้านไวรัส: <b>first line oseltamivir</b> · second line <b>favipiravir</b> เมื่อใช้ยาแรกไม่ได้ และเฉพาะอาการไม่รุนแรง</li>
  <li>ได้ผลดีที่สุดเมื่อเริ่ม<b>ภายใน 48 ชม.</b> แต่ยังมีประโยชน์ในรายรุนแรงหรือเสี่ยงสูงแม้เกิน 48 ชม.</li>
  <li>ให้ยาใน: อาการรุนแรง ต้องนอนโรงพยาบาล หรือภาวะแทรกซ้อนรุนแรง · กลุ่มเสี่ยง · อาการไม่รุนแรงอาจพิจารณาถ้ามีอาการไม่เกิน 48 ชม. (หายเร็วขึ้น)</li>
  <li>Oseltamivir ขนาด 2 เท่าไม่ได้ผลดีกว่า · ใช้นานกว่า 5 วันตามดุลยพินิจแพทย์</li>
  <li><b>ไม่แนะนำให้ยาป้องกัน</b> ทั้ง pre- และ post-exposure · ผู้สัมผัสให้สังเกตอาการแล้วรีบเริ่มยาเมื่อมีอาการ</li>
</ul>
<div class="tbl"><table>
  <tr><th>ภาวะ</th><th>Thailand 2023</th><th>CDC 2023</th></tr>
  <tr><td>Non-severe</td><td>Supportive</td><td>Supportive</td></tr>
  <tr><td>Non-severe เริ่มยาเร็วภายใน 48 ชม.</td><td>First line oseltamivir · second line favipiravir</td><td>Oseltamivir, inhaled zanamivir, IV peramivir, oral baloxavir</td></tr>
  <tr><td>Severe</td><td>Oseltamivir</td><td>Oseltamivir</td></tr>
</table></div>
<div class="tbl"><table>
  <tr><th>ยา</th><th>ผู้ใหญ่</th><th>เด็ก</th><th>ข้อควรระวัง</th></tr>
  <tr><td><b>Oseltamivir</b> (75 mg)</td><td>75 mg BID 5 วัน</td><td>&gt; 40 kg 75 mg · &gt; 23–40 kg 60 mg · &gt; 15–23 kg 45 mg · ≤ 15 kg (อายุ &gt; 1 ปี) 30 mg BID · อายุ &lt; 1 ปี 3 mg/kg BID · 5 วัน</td><td>คลื่นไส้อาเจียน (กินพร้อมอาหาร) · ปรับตามไต: CrCl 30–60 → 30 mg BID · 10–30 → 30 mg OD · HD → 30 mg หลังฟอกเลือด · 5 วัน</td></tr>
  <tr><td><b>Favipiravir</b> (200 mg)</td><td>วันที่ 1: 1,600 mg (8 เม็ด) BID · วันที่ 2–5: 600 mg (3 เม็ด) BID</td><td>วันที่ 1: 70 mg/kg/วัน แบ่ง BID · วันที่ 2–5: 30 mg/kg/วัน แบ่ง BID</td><td><b>Teratogenic</b> ห้ามในหญิงตั้งครรภ์ · เพิ่ม uric acid · อาจ hypoglycemia ร่วม repaglinide, pioglitazone · ตับบกพร่องลดขนาด</td></tr>
</table></div>
${fig('p32-1', 'ขนาดยาต้านไวรัสไข้หวัดใหญ่ (กรมการแพทย์ 2566)', 'ตารางขนาด oseltamivir และ favipiravir ในผู้ใหญ่และเด็ก พร้อมการปรับขนาดตามไต')}
<p><b>Oseltamivir PK:</b> F ~80% เป็น prodrug เปลี่ยนเป็น oseltamivir carboxylate ด้วย hepatic esterases (ไม่ผ่าน CYP) · Vd 23–26 L PB ต่ำ · ขับทางไต &gt; 99% · t½ carboxylate 6–10 ชม. · ปรับขนาดในไตบกพร่อง</p>` },
    { id: 'covid', t: 'COVID-19', html: `<ul>
  <li>เกิดจากไวรัสโคโรนาสายพันธุ์ใหม่ (ตระกูลเดียวกับ SARS-CoV, MERS-CoV) แพร่จากคนสู่คนผ่านการสัมผัสและละอองฝอย · พบครั้งแรกที่อู่ฮั่น ปลายปี 2019</li>
  <li><b>อาการ:</b> คล้ายหวัด ไข้ ไอ น้ำมูก · รุนแรงเป็นปอดอักเสบ ไตวาย เสียชีวิต · สูญเสียการได้กลิ่นและรับรส · GI 1/3 · ตาแดง น้ำตาไหล · ปวดหัว เวียนหัว · viral shedding 8–10 วัน</li>
</ul>
${fig('p34-1', 'แนวทางการวินิจฉัย COVID-19 (กรมการแพทย์ 2566)', 'แผนภูมิการตรวจวินิจฉัยและคัดแยกผู้ป่วย COVID-19')}
<p><b>ปัจจัยเสี่ยงโรครุนแรง:</b> อายุ &gt; 60 ปี · COPD และโรคปอดเรื้อรัง · CKD · โรคหัวใจและหลอดเลือด · stroke · มะเร็ง (ยกเว้นรักษาหายแล้ว) · เบาหวาน · อ้วน (&gt; 90 kg หรือ BMI ≥ 30) · ตับแข็ง Child-Pugh B ขึ้นไป · ภูมิคุ้มกันต่ำ (เคมีบำบัด ยากดภูมิ หรือ prednisolone ≥ 15 mg/วัน นาน ≥ 15 วัน) · HIV ที่ CD4 &lt; 200</p>
<div class="tbl"><table>
  <tr><th>กลุ่มผู้ป่วย</th><th>การรักษา</th></tr>
  <tr><td>1. ไม่มีอาการ</td><td>ไม่ให้ยาต้านไวรัส</td></tr>
  <tr><td>2. มีอาการไม่รุนแรง ไม่มีปอดอักเสบ ไม่มีปัจจัยเสี่ยง</td><td>ไม่ให้ยาต้านไวรัส</td></tr>
  <tr><td>3. ไม่รุนแรง + มีปัจจัยเสี่ยง หรือปอดอักเสบเล็กน้อยถึงปานกลาง</td><td>เลือก 1 ชนิดตามลำดับ: nirmatrelvir/ritonavir 5 วัน · remdesivir 3 วัน · molnupiravir 5 วัน (ไม่ใช้ในหญิงตั้งครรภ์) · หรือ tixagevimab/cilgavimab (LAAB) · ควรเริ่มเร็วที่สุด ภายใน 5 วันหลังมีอาการ</td></tr>
  <tr><td>4. ปอดอักเสบที่มี hypoxia (SpO₂ ≤ 94%) ภายใน 10 วันหลังมีอาการ</td><td><b>Remdesivir</b> 5–10 วัน + <b>corticosteroid</b> (dexamethasone)</td></tr>
</table></div>
<div class="tbl"><table>
  <tr><th>ยาต้านไวรัส</th><th>เริ่ม</th><th>ระยะเวลา</th></tr>
  <tr><td>Nirmatrelvir/ritonavir</td><td>ภายใน 5 วันหลังมีอาการ</td><td>5 วัน 10 โดส</td></tr>
  <tr><td>Remdesivir</td><td>ภายใน 5 วันหลังมีอาการ</td><td>3 วัน 3 โดส</td></tr>
  <tr><td>Molnupiravir</td><td>ภายใน 5 วันหลังมีอาการ</td><td>5 วัน 10 โดส</td></tr>
</table></div>
<p>การเลือกยาพิจารณา: ประสิทธิภาพ · ข้อห้ามใช้ · drug-drug interaction (โดยเฉพาะ ritonavir) · การบริหารยา · ความสะดวกและราคา</p>
${fig('p37-1', 'ขนาดยาต้านไวรัส COVID-19 ในผู้ใหญ่และเด็ก (1)', 'ตารางขนาด molnupiravir, nirmatrelvir/ritonavir, corticosteroid และ LAAB พร้อมข้อควรระวัง')}
${fig('p38-1', 'ขนาดยาต้านไวรัส COVID-19 ในผู้ใหญ่และเด็ก (2)', 'ตารางขนาดฟ้าทะลายโจร favipiravir และ remdesivir พร้อมข้อควรระวัง')}
<p><b>เกณฑ์จำหน่าย:</b> อาการดีขึ้นและภาพรังสีไม่แย่ลง · T ≤ 37.8°C ต่อเนื่อง 24–48 ชม. · RR ≤ 20 · SpO₂ room air &gt; 96% ขณะพัก</p>
<div class="tbl"><table>
  <tr><th>ยา</th><th>PK</th></tr>
  <tr><td><b>Nirmatrelvir/ritonavir</b></td><td>Tmax ~3 ชม. อาหารไม่มีผล · nirmatrelvir เป็น CYP3A substrate ส่วน <b>ritonavir เป็น potent CYP3A inhibitor</b> (PK enhancer) · nirmatrelvir ขับทางไต t½ ~6 ชม. · ปรับขนาดในไตบกพร่องปานกลางถึงรุนแรง</td></tr>
  <tr><td><b>Remdesivir</b></td><td>IV เท่านั้น · phosphoramidate prodrug → GS-441524 → GS-443902 (active triphosphate ยับยั้ง RNA-dependent RNA polymerase) · t½ remdesivir ~1 ชม. · GS-441524 ~27 ชม. · ขับทางไต ~74%</td></tr>
  <tr><td><b>Molnupiravir</b></td><td>Prodrug → N-hydroxycytidine (NHC) โดย esterases ไม่ผ่าน CYP · NHC triphosphate ทำให้เกิด viral error catastrophe · PB ≤ 2% · t½ ~3.3 ชม. · อาหารไม่มีผลต่อ AUC</td></tr>
</table></div>` },
    { id: 'prev', t: 'การป้องกัน', html: `<h3>Pneumococcal vaccine</h3>
<ul>
  <li>PCV13, PCV15, <b>PCV20</b> (ครอบคลุมมากสุด 83% แนะนำมากที่สุด) · PPSV23 ครอบคลุม 82% แต่ภูมิอยู่ไม่นาน</li>
  <li>ข้อบ่งชี้: อายุ ≥ 65 ปี · 18–64 ปีที่มีปัจจัยเสี่ยง · ภูมิคุ้มกันบกพร่อง</li>
</ul>
<div class="tbl"><table>
  <tr><th>กลุ่ม</th><th>วิธีที่ 1</th><th>วิธีที่ 2</th></tr>
  <tr><td>อายุ ≥ 65 ปี หรือ 18–64 ปีที่มีปัจจัยเสี่ยง (โรคหัวใจ ปอดเรื้อรัง เบาหวาน สูบบุหรี่ alcoholism cochlear implant CSF leak)</td><td>PCV13 หรือ PCV15 → เว้น 1 ปี → PPSV23 (cochlear implant, CSF leak หรือภูมิบกพร่อง เว้น 8 สัปดาห์)</td><td>PCV20 เข็มเดียวจบ</td></tr>
  <tr><td>18–64 ปี ภูมิคุ้มกันบกพร่อง (HIV CD4 &lt; 200, ยากดภูมิ/steroid/รังสี, CKD stage 4, nephrotic syndrome, มะเร็ง, asplenia, ปลูกถ่ายอวัยวะ/ไขกระดูก)</td><td>PCV13 หรือ PCV15 → เว้น 8 สัปดาห์ → PPSV23 → เว้น 5 ปี → PPSV23 อีก 1 เข็ม</td><td>PCV20 เข็มเดียวจบ</td></tr>
</table></div>
<p>ปลูกถ่ายอวัยวะหรือไขกระดูก ควรฉีดก่อนปลูกถ่าย ≥ 2 สัปดาห์</p>
<h3>Influenza vaccine</h3>
<p>ปีละ 1 ครั้ง (0.5 mL) · แนะนำใน อายุ ≥ 65 ปี · หญิงตั้งครรภ์ไตรมาส 2–3 · COPD, asthma · โรคหัวใจ · DM · CKD · ตับแข็ง · asplenia · HIV · ภูมิคุ้มกันต่ำ · ปลูกถ่ายอวัยวะ · บุคลากรการแพทย์ · cocooning (คนใกล้ชิดผู้ป่วยเสี่ยง) · ไทยใช้ Southern Hemisphere strain · WHO แนะนำกลับมาใช้ trivalent</p>
<h3>COVID-19 vaccine</h3>
<p>วัคซีนปี 2024–2025 ปรับตามสายพันธุ์ Omicron JN.1 · Moderna, Pfizer อายุ ≥ 6 เดือน · Novavax อายุ ≥ 12 ปี · ควรได้เป็นพิเศษ: ไม่เคยฉีด · อายุ ≥ 65 ปี · กลุ่มเสี่ยงโรครุนแรง · อยู่ในสถานดูแลระยะยาว · ตั้งครรภ์/ให้นม/วางแผนตั้งครรภ์ · ต้องการลดเสี่ยง long COVID</p>` },
  ],
  questions: [
    { case: 'หญิงไทยอายุ 58 ปี น้ำหนัก 58 kg มี DM ควบคุมได้ดี มาด้วยไข้ 38.5°C ไอมีเสมหะสีเหลือง 4 วัน เหนื่อยเล็กน้อย ไม่มีประวัตินอนโรงพยาบาลใน 1 ปี ไม่มีโรคปอดเรื้อรัง · BP 126/78, HR 96, RR 22, SpO₂ 95% RA · CXR: right lower lobe infiltration · Dx: CAP (admit ward)', q: 'เชื้อที่เป็นสาเหตุน่าจะเป็นมากที่สุดคือข้อใด', o: ['Pseudomonas aeruginosa', 'Klebsiella pneumoniae', 'Streptococcus pneumoniae', 'Mycoplasma pneumoniae', 'Staphylococcus aureus'], a: 2, e: 'CAP ที่ไม่มีประวัตินอนโรงพยาบาลหรือได้ ATB มาก่อน และไม่มีปัจจัยเสี่ยง MRSA หรือ P. aeruginosa ควรนึกถึง S. pneumoniae เป็นอันดับแรก' },
    { case: "หญิงไทยอายุ 58 ปี น้ำหนัก 58 kg มี DM ควบคุมได้ดี มาด้วยไข้ 38.5°C ไอมีเสมหะสีเหลือง 4 วัน เหนื่อยเล็กน้อย ไม่มีประวัตินอนโรงพยาบาลใน 1 ปี ไม่มีโรคปอดเรื้อรัง · BP 126/78, HR 96, RR 22, SpO₂ 95% RA · CXR: right lower lobe infiltration · Dx: CAP (admit ward)", q: 'Empiric antibiotic regimen ที่เหมาะสมที่สุดคือข้อใด', o: ['Ceftriaxone', 'Ceftriaxone + azithromycin', 'Piperacillin/tazobactam', 'Cefepime + levofloxacin', 'Vancomycin + meropenem'], a: 1, e: 'CAP ที่รับไว้ในโรงพยาบาลแต่ไม่ severe ใช้ beta-lactam + macrolide: ceftriaxone ครอบคลุม typical เช่น pneumococcus ส่วน azithromycin ครอบคลุม atypical เช่น Legionella, Mycoplasma' },
    { case: "หญิงไทยอายุ 58 ปี น้ำหนัก 58 kg มี DM ควบคุมได้ดี มาด้วยไข้ 38.5°C ไอมีเสมหะสีเหลือง 4 วัน เหนื่อยเล็กน้อย ไม่มีประวัตินอนโรงพยาบาลใน 1 ปี ไม่มีโรคปอดเรื้อรัง · BP 126/78, HR 96, RR 22, SpO₂ 95% RA · CXR: right lower lobe infiltration · Dx: CAP (admit ward)", q: 'หลังให้ยาครบ 72 ชั่วโมง ผู้ป่วยไม่มีไข้ รับประทานอาหารได้ RR 18/min SpO₂ 97% ผลเพาะเชื้อพบ Streptococcus pneumoniae ไวต่อ penicillin ควรทำอย่างไร', o: ['เปลี่ยนเป็น meropenem', 'เพิ่ม vancomycin', 'De-escalate เป็น amoxicillin รับประทาน', 'ให้ ceftriaxone ต่อครบ 14 วัน', 'เปลี่ยนเป็น piperacillin/tazobactam'], a: 2, e: 'ผู้ป่วยมี clinical stability กินได้ และเชื้อไวต่อ penicillin จึงลด spectrum เป็น amoxicillin รับประทาน ตรงเชื้อ ลดผลไม่พึงประสงค์และการดื้อยา' },
    { case: 'ชายไทยอายุ 72 ปี น้ำหนัก 65 kg มี COPD, bronchiectasis, CKD stage 3 · admit ด้วย pneumonia เมื่อ 2 เดือนก่อน ได้ IV piperacillin/tazobactam · ครั้งนี้ไข้สูง หนาวสั่น ไอเสมหะสีเขียว หอบมาก · T 39.4°C BP 88/54 HR 125 RR 34 SpO₂ 86% RA · WBC 22,000 lactate 3.8 · CXR: right upper lobe consolidation · Dx: severe CAP with septic shock', q: 'เชื้อที่ควรครอบคลุมมากที่สุดในการให้ empiric therapy คือข้อใด', o: ['Streptococcus pneumoniae เพียงอย่างเดียว', 'Mycoplasma pneumoniae', 'Pseudomonas aeruginosa', 'Legionella pneumophila เพียงอย่างเดียว', 'Chlamydia pneumoniae'], a: 2, e: 'เคยนอนโรงพยาบาลและได้ IV ATB ภายใน 90 วัน ร่วมกับ bronchiectasis (มีโอกาส colonization ด้วย gram-negative รวมถึง P. aeruginosa) ในผู้ป่วย severe CAP ที่มี septic shock จึงต้องครอบคลุม P. aeruginosa ตั้งแต่แรก' },
    { case: "ชายไทยอายุ 72 ปี น้ำหนัก 65 kg มี COPD, bronchiectasis, CKD stage 3 · admit ด้วย pneumonia เมื่อ 2 เดือนก่อน ได้ IV piperacillin/tazobactam · ครั้งนี้ไข้สูง หนาวสั่น ไอเสมหะสีเขียว หอบมาก · T 39.4°C BP 88/54 HR 125 RR 34 SpO₂ 86% RA · WBC 22,000 lactate 3.8 · CXR: right upper lobe consolidation · Dx: severe CAP with septic shock", q: 'Empiric regimen ที่เหมาะสมที่สุดคือข้อใด', o: ['Ceftriaxone + azithromycin', 'Piperacillin/tazobactam + levofloxacin', 'Cefazolin', 'Amoxicillin/clavulanate', 'Doxycycline'], a: 1, e: 'Severe CAP ใช้ beta-lactam + respiratory FQ และเพราะมีปัจจัยเสี่ยง P. aeruginosa จึงเปลี่ยน beta-lactam เป็น antipseudomonal beta-lactam (piperacillin/tazobactam)' },
    { case: "ชายไทยอายุ 72 ปี มี COPD, bronchiectasis, CKD stage 3 · เคยได้ IV piperacillin/tazobactam เมื่อ 2 เดือนก่อน · Dx: severe CAP with septic shock ได้ empiric piperacillin/tazobactam + levofloxacin", q: 'Sputum culture รายงาน Pseudomonas aeruginosa ไวต่อ piperacillin/tazobactam และ cefepime ดื้อต่อ levofloxacin ผู้ป่วยอาการดีขึ้น hemodynamic stable ควรปรับการรักษาอย่างไร', o: ['ให้ piperacillin/tazobactam เดี่ยว', 'เปลี่ยนเป็น ceftriaxone', 'เพิ่ม vancomycin', 'เปลี่ยนเป็น meropenem', 'ให้ piperacillin/tazobactam + levofloxacin ต่อเหมือนเดิม'], a: 0, e: 'เชื้อดื้อ levofloxacin จึงหยุด และใช้ยาที่เชื้อไวเพียงตัวเดียว ไม่จำเป็นต้องเปลี่ยนเป็น meropenem ที่ spectrum กว้างกว่า (de-escalation ตามหลัก antimicrobial stewardship) · ceftriaxone ไม่ครอบคลุม Pseudomonas' },
  ],
}
