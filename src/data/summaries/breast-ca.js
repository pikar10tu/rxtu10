// Breast cancer — converted from the RxTU10 class summary PDF (see content/summaries/manifest.json)
export default {
  id: 'breast-ca',
  date: '27/07/2026',
  refs: [
    'National Comprehensive Cancer Network. NCCN Clinical Practice Guidelines in Oncology: Breast Cancer. Version 5.2026.',
    'de Azambuja E, et al. Metastatic breast cancer: ESMO Clinical Practice Guideline for diagnosis, treatment and follow-up. Ann Oncol. 2026.',
    'Armenian SH, et al. Prevention and monitoring of cardiac dysfunction in survivors of adult cancers: ASCO clinical practice guideline. J Clin Oncol. 2017;35(8):893–911.',
    'Amgen Inc. Xgeva (denosumab) prescribing information. 2025.',
  ],
  sections: [
    { id: 'epi', t: 'Epidemiology และ risk factors', html: `<ul>
  <li>อายุกลางที่วินิจฉัย 63 ปี (พบในคนอายุน้อยให้สงสัยพันธุกรรม)</li>
  <li><b>HR+/HER2−</b> พบมากที่สุด prognosis ดีที่สุด · <b>triple negative</b> (HR−/HER2−) prognosis แย่ที่สุด · HER2+ ทำให้ survival ลดลง · ระยะกระจาย prognosis ขึ้นกับอวัยวะที่ไป</li>
</ul>
<h3>Risk factors</h3>
<ul>
  <li><b>Gene mutation:</b> BRCA1/BRCA2 เพิ่มมะเร็งเต้านม รังไข่ ท่อนำไข่ ต่อมลูกหมาก · BRCA2 เพิ่ม melanoma และมะเร็งตับอ่อน</li>
  <li><b>เพิ่มความเสี่ยง:</b> อายุมาก · ญาติลำดับ 1–2 เป็นตั้งแต่อายุน้อย (แนะนำตรวจพันธุกรรม) · ประจำเดือนมาเร็ว (&lt; 11 ปี) หมดช้า (≥ 55 ปี) ไม่มีบุตร หรือมีบุตรคนแรกอายุ ≥ 30 ปี · เคยฉายแสงที่ทรวงอกก่อนอายุ 30 (เช่น Hodgkin lymphoma) · อ้วน · <b>HRT</b> ในหญิงหมดประจำเดือน (ยาคุมกำเนิดผลยังไม่ชัด) · แอลกอฮอล์ &gt; 10 g/วัน · สูบบุหรี่</li>
  <li><b>ลดความเสี่ยง:</b> ผ่าตัดรังไข่ก่อนอายุ 45 ปี · เคยได้ risk-reducing therapy · ออกกำลังกาย · ให้นมบุตร</li>
  <li><b>เครื่องมือประเมิน:</b> Gail model (อายุ ≥ 35 ปี) · IBIS (Tyrer-Cuzick)</li>
</ul>` },
    { id: 'path', t: 'พยาธิวิทยา การคัดกรอง และการวินิจฉัย', html: `<ul>
  <li>ช่วงมีประจำเดือนเต้านมเปลี่ยนตามฮอร์โมน คัดกรองช่วงนี้อาจได้ผลบวกเท็จ</li>
  <li>คลำได้ก้อนไม่ใช่มะเร็งเสมอไป เช่น fibroadenoma, fibrocystic disease, fat necrosis</li>
</ul>
<div class="tbl"><table>
  <tr><th>ชนิด</th><th>สัดส่วน</th><th>ลักษณะ</th></tr>
  <tr><td>Invasive ductal carcinoma (IDC)</td><td>75% (มากที่สุด)</td><td>Prognosis แย่กว่า lobular · กระจายไปกระดูก ตับ ปอด สมอง</td></tr>
  <tr><td>Invasive lobular carcinoma (ILC)</td><td>~15%</td><td>กระจายไป leptomeninges, peritoneum, retroperitoneum, GI tract, อวัยวะสืบพันธุ์</td></tr>
</table></div>
<h3>Screening</h3>
<p>Breast awareness (สังเกตตนเอง) · clinical breast exam · <b>mammogram เริ่มอายุ 40–45 ปี</b> (ACS/NCCN/USPSTF) · กลุ่มเสี่ยงสูงเริ่มเร็วกว่า</p>
<h3>Clinical presentation</h3>
<ul>
  <li>พบบ่อยที่สุด: <b>ก้อนคลำได้ ไม่เจ็บ</b></li>
  <li>พบน้อยกว่า: ปวด nipple discharge รอยบุ๋ม peau d'orange หัวนมบุ๋ม/เป็นแผล</li>
  <li>อาการจากการกระจาย: ปวดกระดูก หายใจลำบาก ปวดท้อง พฤติกรรม/สติปัญญาเปลี่ยน</li>
</ul>
<h3>Diagnostic workup</h3>
<ol>
  <li>ตรวจร่างกาย · mammogram, breast MRI (ผิดปกติส่ง biopsy)</li>
  <li><b>Biopsy</b> (จำเป็น): ER, PR, HER2 และ Ki-67/mitotic index</li>
  <li><b>HER2 (IHC):</b> 0, 1+ = negative · <mark>2+ = equivocal ส่ง FISH</mark> · 3+ = positive</li>
  <li>Staging: CT chest/abdomen, bone scan</li>
</ol>
<p><b>TNM:</b> T ขนาดก้อน · N ต่อมน้ำเหลืองรักแร้ · M กระจายไกล · <b>poor prognosis:</b> อายุ &lt; 35 · node+ · HR− · HER2 overexpression</p>` },
    { id: 'early', t: 'การรักษาระยะเริ่มต้นและ locally advanced', html: `<h3>Locoregional therapy</h3>
<ul>
  <li><b>Total mastectomy</b></li>
  <li><b>Breast conserving therapy (lumpectomy)</b> — เสี่ยงกลับเป็นซ้ำสูงกว่า จึงต้องฉายแสงตามเสมอ</li>
  <li>Axillary lymph node dissection / surgical axillary staging</li>
  <li><b>Neoadjuvant</b> ใน locally advanced เพื่อลดขนาดก้อนก่อนผ่าตัด</li>
</ul>
<h3>Systemic therapy</h3>
<ul>
  <li><b>Anthracycline-containing</b> เช่น AC (doxorubicin + cyclophosphamide) — ระวัง cardiotoxicity ของ doxorubicin (ความเสี่ยงสูงเมื่อ cumulative dose ≥ 250 mg/m²)</li>
  <li><b>Taxane-containing</b> เช่น docetaxel, paclitaxel (ต่อจาก AC หรือ TC)</li>
  <li>Anti-HER2 (trastuzumab) <b>ไม่ให้พร้อม anthracycline</b> แต่ให้พร้อม taxane ได้</li>
  <li><b>Anti-HER2:</b> trastuzumab, pertuzumab ให้จนครบ 1 ปี · <b>T-DM1</b> เมื่อผ่าตัดแล้วยังมีเซลล์มะเร็งเหลือ (non-pCR)</li>
  <li><b>Oncotype DX:</b> low risk (≤ 15) endocrine อย่างเดียว · high risk (≥ 26) endocrine + adjuvant chemo · 16–25 ในวัยก่อนหมดประจำเดือนได้ประโยชน์จาก chemo (TAILORx/RxPONDER)</li>
  <li><b>PARP inhibitors</b> (olaparib, talazoparib) เมื่อมี BRCA1/2 mutation</li>
  <li><b>CDK4/6 inhibitors</b> (palbociclib, ribociclib, abemaciclib) ในกลุ่ม HR+/HER2−</li>
</ul>
<p style="font-size:.9em">ต้นฉบับเขียน doxorubicin "max cumulative dose 250 mg/m²" แต่ขีดจำกัดตลอดชีวิตที่ใช้ทั่วไปคือ 450–550 mg/m² ส่วน ≥ 250 mg/m² เป็นเกณฑ์ "ความเสี่ยงสูง" ตาม ASCO จึงปรับข้อความ</p>
<h3>Endocrine therapy (ER+/PR+)</h3>
<ul>
  <li><b>SERM: tamoxifen</b> — <mark>ระวัง CYP2D6 inhibitors</mark> (paroxetine, fluoxetine) ลดการเปลี่ยนเป็น active metabolite</li>
  <li><b>Aromatase inhibitors:</b> anastrozole, letrozole, exemestane — ADR: bone loss/osteoporosis, hot flashes, arthralgia</li>
  <li><b>LHRH agonists / ovarian suppression:</b> goserelin, triptorelin, leuprolide</li>
</ul>
<div class="tbl"><table>
  <tr><th>ผู้ป่วย</th><th>ทางเลือก adjuvant endocrine</th></tr>
  <tr><td><b>Premenopause</b></td><td>1. Tamoxifen 5 ปี (อาจต่อเป็น 10 ปี แต่เพิ่ม endometrial cancer, PE, IHD) หรือตามด้วย AI 5 ปี<br>2. Ovarian suppression + tamoxifen หรือ AI 5 ปี (high risk: อายุน้อย high grade node+)</td></tr>
  <tr><td><b>Postmenopause</b></td><td>1. AI 5–10 ปี (10 ปีเมื่อ node+ หรือ high risk)<br>2. Tamoxifen 2–3 ปี แล้วเปลี่ยนเป็น AI รวม 5 ปี<br>3. AI 2–3 ปี แล้วเปลี่ยนเป็น tamoxifen รวม 5 ปี</td></tr>
</table></div>` },
    { id: 'meta', t: 'Metastatic breast cancer', html: `<p>Systemic therapy ± locoregional (ฉายแสงลดปวด) · กระจายไปปอด ตับ ไขกระดูก สมอง (visceral crisis) ต้องให้เคมีบำบัดเพราะโรคโตเร็ว</p>
<h3>HR+/HER2− (luminal) — มักตรวจ PIK3CA</h3>
<ul>
  <li><b>First line:</b> endocrine therapy ± <b>CDK4/6 inhibitor</b> (เช่น palbociclib + letrozole)</li>
  <li><b>Second line:</b> fulvestrant · everolimus (mTOR inhibitor) + exemestane · <mark>fulvestrant + alpelisib เมื่อมี PIK3CA mutation</mark></li>
  <li>Alpelisib (PI3Kα inhibitor) S/E: <b>hyperglycemia</b>, rash (2 สัปดาห์แรก แนะนำ non-sedating antihistamine ป้องกัน), GI toxicity, fatigue</li>
</ul>
<h3>HER2+</h3>
<p>Chemo + anti-HER2: trastuzumab + pertuzumab · trastuzumab + lapatinib (ยากิน)</p>
<h3>HER2− อื่น ๆ</h3>
<ul>
  <li>BRCA1/2 mutation → <b>olaparib หรือ talazoparib</b> (PARP inhibitor ทำให้ซ่อม DNA ไม่ได้ เซลล์ตาย)</li>
  <li>Triple negative → antibody-drug conjugates · PD-L1 (+) → ICI เช่น <b>atezolizumab + nab-paclitaxel</b></li>
</ul>
<p><b>ประเมินผล:</b> RECIST criteria</p>` },
    { id: 'tox', t: 'ผลข้างเคียงและ supportive care', html: `<p><b>Common:</b> fatigue · N/V (เช่น taxane) · กดไขกระดูก · menopausal symptoms (tamoxifen, AIs) · peripheral sensory neuropathy · alopecia</p>
<div class="tbl"><table>
  <tr><th>Toxicity</th><th>ยา</th></tr>
  <tr><td>Diarrhea</td><td>Neratinib, lapatinib, pertuzumab, abemaciclib, alpelisib, everolimus</td></tr>
  <tr><td>LVEF decline</td><td>Trastuzumab, pertuzumab, HER2 oral TKIs, ADCs</td></tr>
  <tr><td>Hyperglycemia</td><td>Alpelisib</td></tr>
  <tr><td>Rash</td><td>Alpelisib, everolimus</td></tr>
  <tr><td>Immunotoxicity</td><td>PD-1/PD-L1 antibodies</td></tr>
  <tr><td>QTc prolongation</td><td>Ribociclib</td></tr>
  <tr><td>Mucositis</td><td>Everolimus</td></tr>
  <tr><td>Liver enzyme elevation</td><td>Ribociclib, abemaciclib, tucatinib</td></tr>
  <tr><td>Pneumonitis (ILD)</td><td>Trastuzumab deruxtecan, atezolizumab, pembrolizumab, everolimus, CDK4/6 inhibitors</td></tr>
</table></div>
<h3>Hot flashes (จาก endocrine therapy)</h3>
<p>SNRIs/SSRIs — ในผู้ใช้ tamoxifen เลือก <b>weak CYP2D6 inhibitors</b>: venlafaxine, citalopram, escitalopram · หรือ gabapentin, pregabalin</p>
<h3>Bone health</h3>
<p>AI, ovarian suppression/oophorectomy, LHRH agonist ทำให้กระดูกบาง · ประเมินด้วย FRAX และ BMD ทุก 1 ปี · ปัจจัยเสี่ยง: อายุ &gt; 65, T-score &lt; −1.5, สูบบุหรี่, BMI &lt; 24, ประวัติครอบครัวสะโพกหัก, เคย fragility fracture หลังอายุ 50, glucocorticoid &gt; 6 เดือน</p>
<ul>
  <li>ออกกำลังกาย · calcium + vitamin D</li>
  <li>Bisphosphonates: alendronate, ibandronate, risedronate (PO) · <b>zoledronic acid 5 mg IV ปีละครั้ง</b> — AE: ไตเสื่อม (ปรับตามไต) hypocalcemia hypophosphatemia hypomagnesemia flu-like ONJ</li>
  <li><b>Denosumab 60 mg ทุก 6 เดือน</b> — AE: ONJ hypocalcemia hypophosphatemia (โดยเฉพาะไตบกพร่อง)</li>
</ul>
<h3>Bone metastasis — ป้องกัน skeletal-related events (SREs)</h3>
<p>SREs: pathologic fracture · spinal cord compression · ต้องผ่าตัดกระดูก · ต้องฉายรังสีที่กระดูก · ± hypercalcemia</p>
<ul>
  <li>Pamidronate 90 mg IV drip &gt; 2 ชม. ทุก 3–4 สัปดาห์</li>
  <li>Zoledronic acid 4 mg IV drip &gt; 15 นาที ทุก 3–4 สัปดาห์</li>
  <li><b>Denosumab 120 mg SC ทุก 4 สัปดาห์</b> (ไม่ขับทางไต ไม่ต้องปรับขนาด)</li>
</ul>
<h3>Cardiotoxicity</h3>
<ul>
  <li><b>Doxorubicin</b> ขนาดสูง ทำลายเซลล์หัวใจแบบ irreversible · anthracycline ตามด้วย trastuzumab เพิ่มความเสี่ยง</li>
  <li><b>Trastuzumab</b> ยับยั้ง HER2 ทำให้การซ่อมแซมหัวใจลด LVEF ลดลง แบบ <mark>reversible</mark> — หยุดยาแล้ว LVEF กลับมา ต้อง &gt; 50% จึงให้ต่อ</li>
  <li>ปัจจัยผู้ป่วย: สูบบุหรี่ HT DM DLP อ้วน</li>
  <li>Tamoxifen: VTE · QT ยาว (ขนาดสูง) · AIs: DLP HT metabolic syndrome HF MI</li>
  <li>CDK4/6 inhibitors ต้องตรวจ ECG · <b>ribociclib + tamoxifen</b> เพิ่มความเสี่ยง QT prolongation</li>
</ul>
<p style="font-size:.9em">ต้นฉบับระบุว่า "trastuzumab ทำให้เกิด peripheral neuropathy" ซึ่งไม่ใช่ ADR เด่นของ trastuzumab (neuropathy มักมาจาก taxane ที่ให้ร่วมกัน) จึงไม่ได้ใส่ไว้ในหัวข้อ HER2+</p>` },
  ],
  questions: [
    { q: 'ผู้ป่วยหญิงวัยก่อนหมดประจำเดือนอายุ 42 ปี pathology: IDC, ER 70%, PR 40%, HER2 negative (IHC 1+) s/p mastectomy with sentinel lymph node biopsy มะเร็งเต้านมระยะที่ 2 (T2N0M0) Oncotype DX recurrence score = 24 ควรแนะนำการรักษาใด', o: ['Adjuvant endocrine therapy alone', 'Adjuvant endocrine therapy + chemotherapy', 'Adjuvant trastuzumab + chemotherapy', 'Adjuvant chemotherapy alone'], a: 1, e: 'HR+ HER2− จึงต้องมี endocrine และไม่ใช้ trastuzumab · RS 24 ในวัยก่อนหมดประจำเดือน (RS 16–25) การเพิ่ม chemotherapy ลด distant recurrence อย่างมีนัยสำคัญ (TAILORx/RxPONDER)' },
    { q: 'ผู้ป่วยหญิงวัยหลังหมดประจำเดือนอายุ 62 ปี ปวดสะโพก เป็นมะเร็งเต้านมระยะที่ 4 กระจายไปกระดูกและตับ ไม่มี visceral crisis ER 80%, PR 60%, HER2 negative ควรเลือก first-line therapy ใด', o: ['Fulvestrant monotherapy', 'Palbociclib + letrozole', 'Capecitabine monotherapy', 'Trastuzumab + pertuzumab + docetaxel'], a: 1, e: 'HR+/HER2− ระยะกระจายไม่มี visceral crisis ใช้ endocrine-based therapy · CDK4/6 inhibitor + AI ให้ PFS และ OS เหนือกว่าฮอร์โมนเดี่ยว' },
    { q: 'ผู้ป่วยหญิงวัยหลังหมดประจำเดือนอายุ 58 ปี เป็น metastatic breast cancer ER+, PR+, HER2− ได้ letrozole + ribociclib เป็น first line 14 เดือน แล้วโรคลุกลาม ตรวจพบ PIK3CA mutation การรักษาลำดับถัดไปที่เหมาะสมที่สุดคือข้อใด', o: ['Trastuzumab + pertuzumab', 'Atezolizumab + nab-paclitaxel', 'Fulvestrant + alpelisib', 'Olaparib'], a: 2, e: 'Luminal ที่ได้ ET + CDK4/6 แล้ว และมี PIK3CA mutation → fulvestrant + alpelisib (PI3Kα inhibitor) เป็น second line · trastuzumab ใช้ใน HER2+ · atezolizumab + nab-paclitaxel ใช้ใน TNBC PD-L1+ · olaparib ใช้เมื่อมี BRCA mutation' },
    { q: 'ผู้ป่วยหญิงอายุ 47 ปี HER2+ metastatic breast cancer เริ่ม trastuzumab + pertuzumab ร่วมกับ chemotherapy LVEF baseline 60% หลัง 4 เดือนเหนื่อยง่าย LVEF 42% ควรแนะนำอย่างไร', o: ['ให้ยาต่อในขนาดเดิม', 'ชะลอการให้ trastuzumab และ pertuzumab ไว้ก่อน ติดตาม LVEF จนกลับมามากกว่า 50% จึงพิจารณาให้ต่อ', 'เปลี่ยนไปใช้ doxorubicin ขนาดสูงเพื่อควบคุมโรคแทน', 'ลดขนาด trastuzumab ลง 50% แล้วให้ต่อทันที'], a: 1, e: 'Anti-HER2 ยับยั้ง HER2 signaling ที่ใช้ซ่อมแซมกล้ามเนื้อหัวใจ LVEF ลดแบบ reversible · LVEF < 50% ให้หยุดชั่วคราว ตรวจซ้ำทุก 4–8 สัปดาห์ จน > 50% · doxorubicin เพิ่ม cardiotoxicity แบบ irreversible · การลดขนาดไม่ใช่แนวทางมาตรฐาน' },
    { q: 'ผู้ป่วยหญิงอายุ 63 ปี metastatic breast cancer มี bone metastasis หลายตำแหน่ง ต้องการป้องกัน SREs CrCl 25 mL/min ยาใดเหมาะสมที่สุด', o: ['Zoledronic acid 4 mg IV drip ทุก 3–4 สัปดาห์', 'Pamidronate 90 mg IV drip ทุก 3–4 สัปดาห์', 'Alendronate ชนิดรับประทาน', 'Denosumab 120 mg SC ทุก 4 สัปดาห์'], a: 3, e: 'Bisphosphonates ขับทางไตและอาจทำให้ไตแย่ลง ต้องปรับขนาดหรือใช้ไม่ได้ในไตบกพร่องรุนแรง · denosumab (anti-RANKL) ไม่ขับทางไต ไม่ต้องปรับขนาด · alendronate ใช้รักษา osteoporosis ไม่ใช่ป้องกัน SREs' },
  ],
}
