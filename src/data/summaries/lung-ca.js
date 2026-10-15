// Lung cancer — converted from the RxTU10 class summary PDF (see content/summaries/manifest.json)
// แผนผังสร้างใหม่เป็นข้อความ · ภาพตาราง NCCN และ TNM ในต้นฉบับไม่นำขึ้นเว็บ (ลิขสิทธิ์ NCCN) สรุปสาระเป็นข้อความแทน
export default {
  id: 'lung-ca',
  date: '25/07/2026',
  refs: [
    'American Lung Association. Types of lung cancer.',
    'National Comprehensive Cancer Network. NCCN Clinical Practice Guidelines in Oncology: Non-Small Cell Lung Cancer. Version 6.2026.',
    'National Comprehensive Cancer Network. NCCN Clinical Practice Guidelines in Oncology: Small Cell Lung Cancer. Version 1.2027.',
    'National Comprehensive Cancer Network. NCCN Clinical Practice Guidelines in Oncology: Lung Cancer Screening. Version 1.2026.',
    'Kifjak D, et al. Something old something new — introduction to the ninth edition TNM classification of lung cancer. Br J Radiol. 2025;98(1174):1543–55.',
  ],
  sections: [
    { id: 'overview', t: 'Overview', html: `<h3>Classification</h3>
<ol>
  <li><b>Non-small cell lung cancer (NSCLC)</b> — พบบ่อยที่สุด · squamous cell carcinoma · non-squamous (adenocarcinoma, large cell carcinoma)</li>
  <li><b>Small cell lung cancer (SCLC)</b></li>
</ol>
<h3>Pathophysiology</h3>
<p>Proto-oncogene activation · tumor suppressor gene ถูกยับยั้ง · autocrine growth factor</p>
<ul>
  <li><b>NSCLC:</b> EGFR, BRAF, NTRK, ROS1 mutation และ EML4-ALK rearrangement</li>
  <li><b>SCLC:</b> overexpression ของ C-KIT (CD117)</li>
</ul>
<h3>Risk factors</h3>
<ul>
  <li><b>สูบบุหรี่</b> (N-nitrosamine) — ควรแนะนำให้เลิก</li>
  <li>สารก่อมะเร็งในสิ่งแวดล้อม: asbestos, benzene, arsenic</li>
  <li>เคยฉายรังสี (มะเร็งเต้านม Hodgkin lymphoma)</li>
  <li>ประวัติครอบครัว · COPD</li>
  <li>เอนไซม์ซ่อม DNA หรือเอนไซม์ metabolize สารก่อมะเร็งในบุหรี่ผิดปกติ</li>
</ul>
<h3>Clinical presentation</h3>
<ul>
  <li><b>Pulmonary:</b> ไอเรื้อรัง dyspnea เจ็บหน้าอก hemoptysis · superior vena cava obstruction (หน้า แขนบวม) · Horner's syndrome (หนังตาตก รูม่านตาหด)</li>
  <li><b>Extrapulmonary:</b> ปวดกระดูก neurological deficit spinal cord compression</li>
  <li><b>Paraneoplastic</b> (SCLC &gt; NSCLC) จากมะเร็งสร้าง peptide hormone: น้ำหนักลด Cushing's syndrome hypercalcemia <b>SIADH (hyponatremia)</b> · Lambert-Eaton myasthenic syndrome (กล้ามเนื้ออ่อนแรง หนังตาตก)</li>
</ul>
<h3>Screening (NCCN 2026)</h3>
<ul>
  <li><b>High risk:</b> อายุ ≥ 50 ปี และสูบ ≥ 20 pack-year (หรือมีประวัติสูบ ≥ 20 ปี) → พูดคุยประโยชน์/ความเสี่ยง แล้วตรวจ <b>low-dose CT</b></li>
  <li><b>Lower risk:</b> อายุ &lt; 50 ปี และ/หรือ &lt; 20 pack-year → ไม่แนะนำคัดกรอง</li>
  <li>ไม่เข้าเกณฑ์คัดกรอง: มีอาการของมะเร็งปอดแล้ว เคยเป็นมะเร็งปอด สภาพร่างกายไม่พร้อมรักษาให้หาย</li>
</ul>
<h3>Diagnosis และ goal</h3>
<ul>
  <li>CT, PET · endobronchial ultrasound · cytology/biopsy · PD-L1 expression · genetic mutation (EGFR, ALK, ROS1, BRAF V600E)</li>
  <li><b>Early stage</b> (NSCLC stage I–II, SCLC limited) → รักษาให้หาย · <b>Advanced</b> (NSCLC stage III–IV, SCLC extensive) → ยืดชีวิต</li>
  <li>Staging: NSCLC ใช้ AJCC TNM 9th edition · SCLC แบ่ง limited (โรคจุดเดียว) และ extensive (กระจายกว้าง)</li>
</ul>` },
    { id: 'nsclc', t: 'NSCLC: แนวทางการรักษา', html: `<ul>
  <li><b>Stage I–IIIA:</b> ผ่าตัด + ฉายรังสี + systemic therapy</li>
  <li><b>Stage IIIB–IIIC</b> (ผ่าตัดไม่ได้): CCRT</li>
  <li><b>Stage IV:</b> systemic therapy</li>
</ul>
<h3>Stage I–IIIA ที่ผ่าตัดได้ (ตรวจ PD-L1, EGFR, ALK ก่อน)</h3>
<div class="tbl"><table>
  <tr><th>Biomarker</th><th>แนวทาง</th></tr>
  <tr><td>ไม่มี EGFR/ALK mutation · <b>ให้ neoadjuvant ได้</b></td><td>Neoadjuvant → ผ่าตัด → adjuvant ต่อ</td></tr>
  <tr><td>ไม่มี EGFR/ALK mutation · ให้ neoadjuvant ไม่ได้</td><td>ผ่าตัด → ให้เคมีบำบัดได้: cisplatin-based แล้วตาม PD-L1 · ให้ไม่ได้: ตาม PD-L1 — <b>PD-L1 (+)</b> atezolizumab หรือ pembrolizumab · <b>PD-L1 (−)</b> pembrolizumab</td></tr>
  <tr><td><b>EGFR mutation</b></td><td>ผ่าตัด → ให้เคมีได้: cisplatin-based แล้ว osimertinib · ให้เคมีไม่ได้: osimertinib</td></tr>
  <tr><td><b>ALK rearrangement</b></td><td>ผ่าตัด → ให้เคมีบำบัด → alectinib</td></tr>
</table></div>
<h3>Neoadjuvant (ก้อน ≥ 4 cm หรือ node +)</h3>
<ul>
  <li><b>ไม่มี mutation และใช้ ICI ได้:</b> nivolumab + platinum doublet (แล้ว nivolumab adjuvant) · pembrolizumab + cisplatin doublet (แล้ว pembrolizumab adjuvant) · durvalumab + platinum doublet (แล้ว durvalumab adjuvant)</li>
  <li>Platinum doublet: <b>non-squamous = cisplatin/carboplatin + pemetrexed</b> · <b>squamous = cisplatin/carboplatin + gemcitabine</b></li>
  <li><b>ไม่มี mutation และไม่เหมาะกับ ICI/targeted:</b> cisplatin/pemetrexed (non-sq) หรือ cisplatin/gemcitabine (sq) · ใช้ cisplatin ไม่ได้เปลี่ยนเป็น carboplatin</li>
  <li><b>EGFR exon 19 del / L858R และไม่เหมาะกับ ICI:</b> osimertinib ± chemotherapy (cis/carboplatin + pemetrexed) แล้ว osimertinib adjuvant</li>
</ul>
<h3>Adjuvant (stage IB–IIA high risk, IIB–IIIB ที่ยังไม่ได้ neoadjuvant)</h3>
<ul>
  <li>Non-squamous: cisplatin/pemetrexed · squamous: cisplatin/gemcitabine (carboplatin แทนได้)</li>
  <li><b>ALK fusion:</b> ALK inhibitor — 1st gen crizotinib · 2nd gen <b>alectinib (NCCN 2026 แนะนำที่สุด)</b>, brigatinib, ceritinib · 3rd gen lorlatinib</li>
  <li><b>EGFR exon 19 del / L858R:</b> gefitinib, erlotinib, afatinib, dacomitinib, <b>osimertinib (แนะนำที่สุด)</b> · พบ T790M ใช้ osimertinib</li>
</ul>
<h3>Stage III ผ่าตัดไม่ได้</h3>
<ul>
  <li>ให้ <b>CCRT</b> ได้ก็ให้ · ให้ไม่ได้ ฉายแสงก่อนแล้วค่อยให้เคมีบำบัด</li>
  <li>CCRT: non-squamous = carboplatin/pemetrexed หรือ cisplatin/pemetrexed · squamous = carboplatin/paclitaxel</li>
  <li><b>Consolidation (ไม่มี disease progression):</b> <mark>durvalumab ถ้าไม่มี EGFR mutation (PD-L1 ≥ 1%)</mark> · <mark>osimertinib ถ้ามี EGFR exon 19 del / L858R</mark></li>
</ul>
<h3>Metastatic</h3>
<ul>
  <li><b>มี gene mutation:</b> ให้ยาตาม biomarker (เช่น EGFR → afatinib, erlotinib, dacomitinib, gefitinib, osimertinib · ALK → alectinib, brigatinib, ceritinib, crizotinib, ensartinib, lorlatinib)</li>
  <li><b>ไม่มี mutation, PD-L1 ≥ 50%:</b> เคมีบำบัดร่วมกับ ICI หรือ ICI เดี่ยวก่อน (เช่น pembrolizumab monotherapy)</li>
  <li><b>ไม่มี mutation, PD-L1 1–49%:</b> เคมีบำบัดร่วมกับ ICI — adenocarcinoma: (carboplatin หรือ cisplatin)/pemetrexed + pembrolizumab · squamous: (paclitaxel หรือ nab-paclitaxel)/carboplatin + pembrolizumab</li>
</ul>` },
    { id: 'sclc', t: 'SCLC', html: `<p>พบบ่อยในผู้สูบบุหรี่ · IHC: TTF-1 มักบวก · Ki-67 สูงมาก (แบ่งตัวเร็ว) · poor prognosis: performance status แย่ น้ำหนักลด LDH สูง</p>
<h3>Limited disease</h3>
<ul>
  <li>ผ่าตัด: ก้อนเดียว ไม่กระจายไปต่อมน้ำเหลือง</li>
  <li>ฉายแสงร่วมกับเคมีบำบัด (CCRT)</li>
  <li>Prophylactic cranial irradiation (PCI) ในผู้ที่ complete response</li>
  <li>Systemic: <b>cisplatin + etoposide</b> · consolidation durvalumab</li>
</ul>
<h3>Extensive disease</h3>
<ul>
  <li>Systemic therapy · PCI ในผู้ที่ตอบสนองต่อเคมีบำบัด</li>
  <li><b>Carboplatin + etoposide + atezolizumab</b> · carboplatin + etoposide + durvalumab · cisplatin + etoposide + durvalumab</li>
</ul>
<h3>Supportive care</h3>
<ul>
  <li>เลิกบุหรี่ · ไม่แนะนำ GM-CSF ระหว่าง CCRT</li>
  <li><b>SIADH:</b> จำกัดน้ำ · NSS เมื่อ hyponatremia · vasopressin receptor antagonist เมื่อ refractory</li>
  <li><b>Cushing syndrome:</b> พิจารณา ketoconazole</li>
</ul>
<h3>Relapse</h3>
<ul>
  <li>Relapse <b>&gt; 6 เดือน</b>หลังจบเคมีสูตรแรก → ให้สูตรเดิมซ้ำได้</li>
  <li>Relapse <b>ภายใน 6 เดือน</b> → subsequent therapy เช่น tarlatamab หรือ topotecan</li>
</ul>
<p><b>ประเมินผล</b>หลัง 2–3 cycles: CR/PR ให้ต่อจนครบ 4–6 cycles · PD หยุดสูตรเดิม เปลี่ยนเป็น subsequent therapy</p>` },
    { id: 'drugs', t: 'เภสัชวิทยาของยา', html: `<h3>Cytotoxic chemotherapy</h3>
<div class="tbl"><table>
  <tr><th>ยา</th><th>MOA</th><th>Cell cycle</th><th>AE</th></tr>
  <tr><td>Cisplatin</td><td rowspan="2">DNA cross-linking</td><td rowspan="2">Cell-cycle independent</td><td><b>คลื่นไส้อาเจียน พิษต่อไต</b> กดไขกระดูก</td></tr>
  <tr><td>Carboplatin</td><td>กดไขกระดูก คลื่นไส้อาเจียน</td></tr>
  <tr><td>Etoposide</td><td>Topoisomerase II inhibitor</td><td>G2</td><td>กดไขกระดูก hypersensitivity hypotension</td></tr>
  <tr><td>Gemcitabine</td><td>ยับยั้ง DNA polymerase</td><td>S</td><td>Flu-like symptoms กดไขกระดูก liver enzyme ผิดปกติ</td></tr>
  <tr><td>Paclitaxel</td><td>เร่ง tubulin polymerization (microtubule stabilizer) หยุดที่ mitosis</td><td>M</td><td>Hypersensitivity peripheral neuropathy กดไขกระดูก</td></tr>
  <tr><td>Pemetrexed</td><td>ยับยั้ง DHFR (antifolate)</td><td>S</td><td>กดไขกระดูก คลื่นไส้อาเจียน</td></tr>
</table></div>
<h3>EGFR inhibitors</h3>
<p>ยับยั้ง autophosphorylation ของ EGFR · AE เด่น: <b>ท้องเสีย acneiform rash</b></p>
<div class="tbl"><table>
  <tr><th></th><th>Gefitinib</th><th>Erlotinib</th><th>Afatinib</th><th>Dacomitinib</th><th>Osimertinib</th></tr>
  <tr><td>Dose</td><td>250 mg OD</td><td>150 mg OD ท้องว่าง</td><td>40 mg OD ท้องว่าง</td><td>45 mg OD</td><td>80 mg OD</td></tr>
  <tr><td>Absorption</td><td>pH &gt; 5 ลด AUC (ระวังยาลดกรด)</td><td>อาหารเพิ่ม BA แต่อาจเพิ่ม AE</td><td>อาหารลด Cmax, AUC</td><td>PPI ลด AUC, Cmax</td><td>อาหารไม่มีผล</td></tr>
  <tr><td>t½</td><td>48 hr</td><td>36 hr</td><td>37 hr</td><td>70 hr</td><td>48 hr</td></tr>
  <tr><td>Metabolism</td><td>CYP3A4 · CYP2C9 inhibitor</td><td>CYP3A4</td><td>P-gp</td><td>CYP2D6, 3A4 · CYP2D6 inhibitor</td><td>CYP3A4 · CYP1A2 inducer</td></tr>
</table></div>
<h3>ALK inhibitors</h3>
<div class="tbl"><table>
  <tr><th></th><th>Crizotinib</th><th>Ceritinib</th><th>Alectinib</th><th>Brigatinib</th><th>Lorlatinib</th></tr>
  <tr><td>Dose</td><td>250 mg BID</td><td>450 mg พร้อมอาหาร</td><td>600 mg BID พร้อมอาหาร</td><td>90 mg OD 7 วัน แล้ว 180 mg OD</td><td>100 mg OD</td></tr>
  <tr><td>Absorption</td><td>อาหารลด AUC, Cmax</td><td>อาหารเพิ่ม AUC, Cmax</td><td>อาหารไขมันสูงเพิ่มการดูดซึม</td><td>อาหารลด Cmax</td><td>อาหารไม่มีผล</td></tr>
  <tr><td>t½</td><td>42 hr</td><td>41 hr</td><td>33 hr</td><td>25 hr</td><td>24 hr</td></tr>
  <tr><td>CYP (ผ่าน CYP3A4 ทุกตัว)</td><td>CYP3A, 2B6 inhibitor</td><td>CYP3A, 2C9 inhibitor</td><td>–</td><td>Weak CYP3A inducer</td><td>CYP3A4 inducer</td></tr>
  <tr><td>AE เด่น</td><td><mark>Vision disorder (ตรวจตา)</mark> · ตับอักเสบ</td><td>อาเจียน</td><td>Anemia · AST/ALT เพิ่ม</td><td>HTN · CPK, lipase เพิ่ม</td><td>Anxiety, depression, delirium</td></tr>
</table></div>
<h3>Immune checkpoint inhibitors (IV)</h3>
<p><b>Pembrolizumab, nivolumab</b> จับ <b>PD-1</b> บน T cell · <b>atezolizumab, durvalumab</b> จับ <b>PD-L1</b> บนเซลล์มะเร็ง → ขัดการจับกันของ PD-1/PD-L1 ให้ T cell กลับมาทำลายเซลล์มะเร็ง · AE (immune-related): pneumonitis, colitis, hepatitis, nephritis</p>
<p style="font-size:.9em">ต้นฉบับเขียนว่ายาทั้ง 4 ตัวยับยั้ง "PD-L1 receptor บน T cell" แต่ตัวรับบน T cell คือ PD-1 และยาแต่ละตัวจับเป้าต่างกัน จึงแก้ข้อความ</p>` },
  ],
  questions: [
    { q: 'ผู้ป่วยชายอายุ 63 ปี เป็น stage IIIB squamous NSCLC ผ่าตัดไม่ได้ ผลตรวจ EGFR exon 19 deletion, ALK negative, PD-L1 TPS < 1% ได้รับ CCRT ด้วย carboplatin/paclitaxel ร่วมกับ thoracic radiotherapy จนครบ หลังรักษา 6 สัปดาห์ CT ไม่พบ disease progression ตาม NCCN การรักษาขั้นต่อไปที่เหมาะสมที่สุดคือข้อใด', o: ['Durvalumab เป็น consolidation therapy', 'Osimertinib เป็น consolidation therapy', 'Pembrolizumab เป็น consolidation therapy', 'Carboplatin/paclitaxel ร่วมกับ pembrolizumab ต่อเนื่อง', 'เฝ้าระวังอาการอย่างเดียว ไม่ต้องให้ systemic therapy'], a: 1, e: 'Stage III ผ่าตัดไม่ได้ ไม่มี progression และมี EGFR exon 19 deletion → osimertinib consolidation ลดการกลับเป็นซ้ำ · durvalumab ใช้เมื่อไม่มี EGFR mutation · carboplatin/paclitaxel + pembrolizumab เป็นสูตร metastatic squamous · consolidation เพิ่ม OS เทียบกับเฝ้าดู' },
    { q: 'หญิงไทยอายุ 57 ปี เป็น lung cancer stage IV with liver metastasis ยังช่วยเหลือตนเองได้ตามปกติ pathology: adenocarcinoma, EGFR negative, ALK negative, PD-L1 TPS 17% การรักษาใดเหมาะสมที่สุด', o: ['Osimertinib', 'Pembrolizumab', 'Carboplatin + pemetrexed', 'Carboplatin + pemetrexed + pembrolizumab', 'Carboplatin + paclitaxel + pembrolizumab'], a: 3, e: 'Metastatic NSCLC ไม่มี mutation PD-L1 1–49% → platinum-based chemo ร่วมกับ ICI และ performance status ดี · ไม่มี EGFR จึงไม่ใช้ osimertinib · pembrolizumab เดี่ยวใช้เมื่อ PD-L1 ≥ 50% · carboplatin + paclitaxel + pembrolizumab เป็นสูตร squamous' },
    { q: 'ผู้ป่วยชายอายุ 69 ปี เป็น lung cancer stage 4 with pleural metastasis adenocarcinoma ALK positive PD-L1 TPS 70% แพทย์เริ่ม crizotinib ข้อใดควรติดตามเป็นพิเศษ', o: ['การมองเห็น', 'ระดับน้ำตาลในเลือด', 'การได้ยิน', 'ภาวะกระดูกพรุน', 'การทำงานของต่อมไทรอยด์'], a: 0, e: 'Crizotinib มี AE เด่นคือ visual disorder ควรแนะนำให้สังเกตอาการและแจ้งแพทย์หากรุนแรง' },
    { q: 'ผู้ป่วยชายอายุ 71 ปี เป็น extensive-stage SCLC ได้ carboplatin + etoposide + atezolizumab 4 cycles และ maintenance atezolizumab ต่ออีก 8 เดือน CT พบ recurrent liver metastasis (ระยะจากสิ้นสุด platinum-based chemotherapy ถึง relapse = 8 เดือน) ข้อใดถูกต้อง', o: ['เปลี่ยนเป็น topotecan เพราะเคยได้ platinum-based แล้ว', 'เปลี่ยนเป็น tarlatamab เพราะเป็นยารุ่นใหม่', 'พิจารณาให้ platinum-based regimen สูตรเดิมอีกครั้ง เพราะ relapse นานกว่า 6 เดือน', 'เปลี่ยนเป็น osimertinib เพราะเป็น targeted therapy ที่ดีกว่า', 'เปลี่ยนเป็น lurbinectedin เพราะแนะนำใน SCLC ที่กลับเป็นซ้ำ'], a: 2, e: 'Relapse > 6 เดือนหลังจบ platinum ให้สูตรเดิมซ้ำได้ · topotecan, tarlatamab, lurbinectedin ใช้เมื่อ relapse ภายใน 6 เดือนหรือให้ platinum ซ้ำไม่ได้ · osimertinib ใช้ใน NSCLC ที่มี EGFR mutation' },
    { q: 'ผู้ป่วยหญิงอายุ 47 ปี เป็น limited disease SCLC ได้ CCRT ด้วย cisplatin + etoposide และ ondansetron ป้องกันคลื่นไส้ SCr ก่อนรักษา 0.8 mg/dL หลัง 3 cycles ไม่พบ progression แต่ SCr เพิ่มเป็น 2.0 mg/dL สาเหตุที่เป็นไปได้มากที่สุดคือข้อใด', o: ['Etoposide-induced nephrotoxicity', 'Cisplatin-induced nephrotoxicity', 'AKI จาก ondansetron', 'AKI จากตัวโรคมากกว่าจากยา', 'Radiation-induced nephropathy'], a: 1, e: 'Cisplatin ทำให้ proximal tubule บาดเจ็บ SCr สูงขึ้น โดยเฉพาะหลังได้หลายรอบ · ต้องติดตามไตก่อนให้แต่ละ cycle และให้ hydration อย่างเหมาะสม' },
  ],
}
