// Cervical cancer — converted from the RxTU10 class summary PDF (see content/summaries/manifest.json)
// PDF text layer แมปสระ/วรรณยุกต์เป็นสัญลักษณ์ → ตรวจกับภาพหน้า · ตารางคัดกรองและ FIGO สร้างใหม่เป็น HTML
export default {
  id: 'cervical-ca',
  date: '29/07/2026',
  refs: [
    'จตุพล ศรีสมบูรณ์, ปานวาด รัตนศรีทอง, บรรณาธิการ. แนวทางการป้องกัน ตรวจคัดกรอง และรักษามะเร็งปากมดลูก. สถาบันมะเร็งแห่งชาติ กรมการแพทย์; 2567.',
    'ราชวิทยาลัยสูตินรีแพทย์แห่งประเทศไทย. RTCOG Clinical Practice Guideline: Gynecologic Cancer Screening. 2568.',
    'National Comprehensive Cancer Network. NCCN Clinical Practice Guidelines in Oncology: Cervical Cancer. Version 2.2026.',
    'World Health Organization. Cervical cancer [fact sheet]. 2025.',
  ],
  sections: [
    { id: 'overview', t: 'Overview', html: `<p><b>สาเหตุหลัก: high-risk HPV</b> · ปกติภูมิคุ้มกันกำจัดเชื้อได้ ถ้าบกพร่องจะติดเชื้อเรื้อรังจนเซลล์กลายเป็นมะเร็ง ใช้เวลา ~5–20 ปีหลังติดเชื้อ</p>
<h3>Histology</h3>
<ul>
  <li><b>Squamous cell carcinoma</b> (72%) — อยู่ด้านนอก Pap smear ตรวจพบ</li>
  <li><b>Adenocarcinoma</b> (19%) — อยู่ด้านในลึก</li>
  <li>Adenosquamous (&lt; 5%) · clear cell, neuroendocrine (พบน้อย)</li>
</ul>
<p><b>Risk factors:</b> เพศสัมพันธ์ (ติดเชื้อ) · สูบบุหรี่ (เพิ่ม persistent dysplasia) · ภูมิคุ้มกันต่ำ (autoimmune, HIV, ยากดภูมิ) · ชนิดของ HPV · ยาคุมกำเนิดชนิดฮอร์โมน</p>
<h3>Pathogenesis</h3>
<p>ติด high-risk HPV 16 หรือ 18 → oncogenes <b>E6</b> ยับยั้ง <b>p53</b> (apoptosis ลด) · <b>E7</b> ยับยั้ง <b>Rb</b> (เซลล์แบ่งตัวไม่หยุด)</p>` },
    { id: 'screen', t: 'การคัดกรองและการแปลผล', html: `<ul>
  <li><b>Cervical cytology:</b> conventional Pap smear (ป้ายบน slide) · liquid-based cytology (เก็บในของเหลว ตรวจ HPV DNA ได้ด้วย)</li>
  <li><b>HPV DNA testing</b> (ตรวจ adenocarcinoma ได้): high-risk HPV (16, 18, 31, 33, 35, 39, 45, 51, 52, 56, 58, 59, 66, 68) บอกว่ามีแต่ไม่บอกสายพันธุ์ · HPV 16/18 genotyping บอกสายพันธุ์ได้</li>
  <li><b>Co-testing:</b> cytology + HPV DNA</li>
</ul>
<div class="tbl"><table>
  <tr><th>อายุ (USPSTF, NCCN)</th><th>คำแนะนำ</th></tr>
  <tr><td>&lt; 21</td><td>ไม่คัดกรอง</td></tr>
  <tr><td>21–29</td><td>Cytology ทุก 3 ปี</td></tr>
  <tr><td>30–65</td><td>Cytology ทุก 3 ปี ± HPV testing ทุก 5 ปี</td></tr>
  <tr><td>&gt; 65</td><td>หยุดได้ถ้าคัดกรองที่ผ่านมาปกติ</td></tr>
</table></div>
<p>ACS แนะนำคัดกรองอายุ 25–65 ปี</p>
<div class="tbl"><table>
  <tr><th>แนวทางไทย</th><th>HPV testing</th><th>Co-testing</th><th>Cytology</th></tr>
  <tr><td>อายุเริ่ม</td><td>25 ปี</td><td>25 ปี</td><td>25 ปี</td></tr>
  <tr><td>ความถี่</td><td>ทุก 5 ปี</td><td>ทุก 5 ปี</td><td>ทุก 2 ปี</td></tr>
  <tr><td>หยุดเมื่อ</td><td>&gt; 65 ปี ผลปกติติดต่อกัน 2 ครั้ง</td><td>&gt; 65 ปี ผลปกติติดต่อกัน 2 ครั้ง</td><td>&gt; 65 ปี ผลปกติติดต่อกัน 3 ครั้ง</td></tr>
</table></div>
<p>Primary HPV: ลบ → ตรวจซ้ำทุก 5 ปี · บวก HPV 16/18 → colposcopy · บวกสายพันธุ์อื่น → reflex cytology (NILM ตรวจซ้ำ 1 ปี · ≥ ASC-US ส่ง colposcopy)</p>
<h3>ผล cytology</h3>
<ul>
  <li><b>NILM</b> — ปกติ</li>
  <li><b>Squamous:</b> ASC-US · ASC-H · <b>LSIL</b> (CIN1) รอดูได้ — ตรวจ HPV ไม่พบติดตาม พบตรวจชิ้นเนื้อ · LSIL นาน 2 ปีเริ่มรักษา · <b>HSIL</b> (CIN2–3) ต้องรักษา</li>
  <li><b>Glandular:</b> AGC · AGC favor neoplasia · endocervical adenocarcinoma in situ (AIS)</li>
</ul>
<h3>อาการและ staging</h3>
<p>ระยะแรกไม่มีอาการ · ระยะลุกลาม: เลือดออกทางช่องคลอด ปวดอุ้งเชิงกราน ตกขาว</p>
<div class="tbl"><table>
  <tr><th>FIGO 2018</th><th>ความหมาย</th></tr>
  <tr><td>IA1 / IA2</td><td>เห็นจากกล้องจุลทรรศน์ ลึก ≤ 3 mm / &gt; 3–5 mm</td></tr>
  <tr><td>IB1 / IB2 / IB3</td><td>อยู่ที่ปากมดลูก ก้อน ≤ 2 cm / &gt; 2–4 cm / &gt; 4 cm</td></tr>
  <tr><td>IIA1 / IIA2</td><td>ลามไปช่องคลอดส่วนบน 2/3 ไม่ถึง parametrium ก้อน ≤ 4 / &gt; 4 cm</td></tr>
  <tr><td>IIB</td><td>ลามไป parametrium แต่ไม่ถึงผนังอุ้งเชิงกราน</td></tr>
  <tr><td>IIIA / IIIB</td><td>ลามไปช่องคลอดส่วนล่าง 1/3 / ถึงผนังอุ้งเชิงกรานหรือ hydronephrosis</td></tr>
  <tr><td>IIIC1 / IIIC2</td><td><b>Node positive</b> ต่อมน้ำเหลืองอุ้งเชิงกราน / para-aortic</td></tr>
  <tr><td>IVA / IVB</td><td>ลามกระเพาะปัสสาวะหรือลำไส้ตรง / กระจายไกล (ปอด ตับ กระดูก)</td></tr>
</table></div>` },
    { id: 'tx', t: 'การรักษา', html: `<p>เป้าหมาย: <b>cure</b> (โดยเฉพาะระยะแรก)</p>
<ul>
  <li><b>Surgery:</b> fertility sparing (เก็บมดลูก/ไข่) หรือไม่เก็บ · pelvic LN dissection ± para-aortic LN · radical หรือ simple hysterectomy</li>
  <li><b>Radiation:</b> pelvic EBRT · brachytherapy (ฝังแร่) · บริเวณที่ฉายแล้วห้ามฉายซ้ำ</li>
  <li><b>Chemotherapy:</b> platinum-based · <b>CCRT</b> (เช่น <mark>cisplatin 40 mg/m²/wk ร่วมกับฉายแสง</mark>) ใน locally advanced ที่ยังไม่กระจายไกลแต่ผ่าตัดไม่ได้ (ไม่ใช้ใน IVB) · ข้อบ่งใช้ adjuvant CCRT: positive margin · positive pelvic/para-aortic nodes · positive parametrium</li>
</ul>
<div class="tbl"><table>
  <tr><th>Stage</th><th>การรักษา</th><th>หมายเหตุ</th></tr>
  <tr><td>IA1, IA2</td><td>Surgery (radiation เป็นทางเลือก)</td><td>ขึ้นกับความต้องการมีบุตรและ LVSI</td></tr>
  <tr><td>IB1, IB2, IIA1</td><td>Surgery + pelvic LN dissection ± para-aortic LN</td><td>ขึ้นกับความต้องการมีบุตร</td></tr>
  <tr><td>IB3, IIA2 · positive margin/node/parametrium</td><td>CCRT: EBRT + platinum + brachytherapy</td><td>NCCN: พิจารณา CCRT ใน IB2, IIA1, IB3, IIA2</td></tr>
  <tr><td>IIB, IIIA, IIIB, IVA</td><td>CCRT: EBRT + platinum + brachytherapy</td><td>ขึ้นกับการประเมินระยะจากผ่าตัดหรือภาพถ่ายรังสี</td></tr>
  <tr><td>IVB / recurrent / metastatic</td><td>Systemic therapy + radiation</td><td>ตามสภาพผู้ป่วย เพื่อบรรเทาอาการ ไม่หวังผล cure</td></tr>
</table></div>
<h3>Recurrent / metastatic (IVB)</h3>
<ul>
  <li><b>Chemoradiation:</b> cisplatin + pembrolizumab · carboplatin + pembrolizumab (ทน cisplatin ไม่ได้) · cisplatin · carboplatin</li>
  <li><b>1st line PD-L1 positive (CPS ≥ 1):</b> <mark>(cisplatin หรือ carboplatin)/paclitaxel + pembrolizumab ± bevacizumab</mark></li>
  <li><b>1st line อื่น:</b> (cis/carbo)/paclitaxel + bevacizumab · (cis/carbo)/paclitaxel + atezolizumab + bevacizumab · paclitaxel/topotecan ± bevacizumab · cisplatin/topotecan · platinum เดี่ยว</li>
  <li><b>2nd line:</b> pembrolizumab (TMB-H, PD-L1+, MSI-H) · tisotumab vedotin · อื่น ๆ เช่น bevacizumab, taxanes, 5-FU, gemcitabine, pemetrexed, topotecan, vinorelbine, irinotecan, cemiplimab, ipilimumab + nivolumab</li>
  <li><b>Platinum resistance:</b> progress ขณะใช้ platinum หรือ recurrent ภายใน 6 เดือน</li>
  <li>Platinum doublets: <b>cis + paclitaxel survival ดีที่สุด</b> thrombocytopenia/anemia น้อยสุด · cis + gemcitabine leukopenia/neutropenia/febrile infection น้อย · carboplatin doublets แนะนำในผู้ที่เคยได้ cisplatin</li>
</ul>` },
    { id: 'drugs', t: 'เภสัชวิทยาของยา', html: `<h3>Platinum — DNA cross-linking</h3>
<p>ข้อห้าม: HF, CKD</p>
<ul>
  <li><b>Cisplatin</b>
    <ul>
      <li><b>N/V:</b> acute — steroid + 5-HT3 antagonist · delayed — steroid + metoclopramide · anticipatory — lorazepam</li>
      <li><b>Nephrotoxicity:</b> สะสมที่ proximal tubule (uptake transporter เพิ่ม efflux ลด) เสียเกลือแร่ (hypoK, hypoMg) · renal vasoconstriction · ทำลาย tubular cell และ Ca²⁺/Mg²⁺-sensing receptor · ปัจจัยเสี่ยง: single dose 50–75 mg/m² หรือ 15–20 mg/m² 5 วันติด · DM อายุ ยา nephrotoxic ร่วม</li>
      <li><b>ป้องกัน:</b> <mark>hydration ก่อน/หลังให้ยา</mark> (ลด t½ ความเข้มข้นในปัสสาวะ และเวลาผ่าน proximal tubule) ให้ urine output &gt; 100 mL/h (ระวังใน HF) · amifostine · Mg 8–16 mEq (ลดการสะสมผ่าน OCT-2) · mannitol เฉพาะ cisplatin ขนาดสูง (100 mg/m²) · forced diuresis (ระวัง dehydration)</li>
      <li>Myelosuppression · ไตบกพร่องใช้ carboplatin หรือลดขนาด · antiemetic ก่อนและหลัง 3–5 วัน · ไม่เกิน 100 mg/m²</li>
    </ul>
  </li>
  <li><b>Carboplatin:</b> nephrotoxicity น้อยกว่า · <b>thrombocytopenia มากกว่า</b> cisplatin</li>
</ul>
<h3>Taxanes — ยับยั้ง microtubule depolymerization</h3>
<p>ข้อห้าม: ตับบกพร่อง (bilirubin, transaminase, ALP สูง)</p>
<ul>
  <li><b>Paclitaxel:</b> hypersensitivity → premedication 30 นาทีก่อน: dexamethasone + diphenhydramine + H2 blocker · peripheral neuropathy</li>
  <li>Docetaxel</li>
</ul>
<h3>Topoisomerase I inhibitors — topotecan, irinotecan</h3>
<p>Irinotecan: <b>diarrhea</b> acute (~1 ชม. หลังให้ ใช้ atropine) และ delayed (&gt; 12 ชม.) · myelosuppression</p>
<h3>Bevacizumab (anti-VEGF-A)</h3>
<p>ข้อห้าม: hemoptysis, brain metastasis, bleeding diathesis · AE: <mark>hypertension</mark> · bleeding/vessel injury · arterial thromboembolism (stroke, MI โดยเฉพาะอายุ &gt; 65 ที่มีประวัติ) · proteinuria</p>
<h3>PD-1 inhibitors — pembrolizumab, nivolumab</h3>
<p>ขัดการจับของ PD-1 กับ PD-L1/PD-L2 ให้ T cell กลับมาทำลายเซลล์มะเร็ง · immune-related AE: thyroid (hyper/hypo) hepatitis pneumonitis colitis nephritis</p>
<h3>Monitoring และ survivorship</h3>
<ul>
  <li>อาการกลับเป็นซ้ำ: ตกขาวใส/มีเลือด เลือดออกหลังมีเพศสัมพันธ์ ปวดอุ้งเชิงกราน น้ำหนักลด ไอ (ลามปอด) · Pap ทุกปี (optional)</li>
  <li>Poor prognosis: ก้อนใหญ่ node+ adenocarcinoma/adenosquamous LVSI</li>
  <li>ผ่าตัดในระยะแรก toxicity ระยะยาวน้อยกว่าฉายแสง · pelvic radiation: acute — คลื่นไส้ อ่อนเพลีย ซีด กดไขกระดูก ท้องเสีย · long term — ช่องคลอดตีบ/แห้ง มะเร็งทุติยภูมิที่ลำไส้/กระเพาะปัสสาวะ bladder dysfunction premature menopause (ให้ HRT หลังรักษา — estrogen อย่างเดียวถ้าตัดมดลูกแล้ว + ติดตามกระดูก)</li>
</ul>
<h3>Prevention: HPV vaccine</h3>
<ul>
  <li>2 สายพันธุ์ (16, 18) · 4 สายพันธุ์ (6, 11, 16, 18 — รวมหูดหงอนไก่) · 9 สายพันธุ์ (6, 11, 16, 18, 31, 33, 45, 52, 58)</li>
  <li>ป้องกันมะเร็งปากมดลูก ปากช่องคลอด ช่องคลอด ทวารหนัก oropharynx</li>
  <li>อายุ 9–45 ปี: <b>9–14 ปี 2 เข็ม (0, 6–12 เดือน)</b> · 15–45 ปี 3 เข็ม (0, 2, 6 เดือน) · ACS แนะนำเริ่ม 11–12 ปี</li>
</ul>` },
  ],
  questions: [
    { q: 'ยาเคมีบำบัดมาตรฐานที่ใช้ร่วมกับรังสีรักษาในมะเร็งปากมดลูกระยะ locally advanced คือข้อใด', o: ['Cisplatin', 'Doxorubicin', 'Paclitaxel', 'Capecitabine', 'Bevacizumab'], a: 0, e: 'Cisplatin เป็นยาหลักของ concurrent chemoradiation' },
    { q: 'ข้อใดเป็น adverse effect เด่นของ bevacizumab', o: ['Diarrhea', 'Hypertension', 'Hyperthyroidism', 'Rash', 'Hyperkalemia'], a: 1, e: 'Bevacizumab (anti-VEGF) ทำให้ hypertension, bleeding, proteinuria, arterial thromboembolism' },
    { q: 'ยาใดคือ targeted therapy ที่ใช้ร่วมกับ paclitaxel + cisplatin/carboplatin ในมะเร็งปากมดลูกที่แพร่กระจายหรือกลับเป็นซ้ำ', o: ['Olaparib', 'Crizotinib', 'Trastuzumab', 'Bevacizumab', 'Nivolumab'], a: 3, e: 'Bevacizumab (anti-VEGF) เพิ่ม survival เมื่อใช้ร่วมกับเคมีบำบัดใน recurrent/metastatic cervical cancer' },
    { q: 'ก่อนให้ cisplatin ควรปฏิบัติข้อใดเพื่อป้องกันพิษต่อไต', o: ['ให้ allopurinol ล่วงหน้า 1 วัน', 'ให้ IV fluid hydration ก่อนและหลังให้ยา', 'ให้ dexamethasone ลดการอักเสบของไต', 'ห้ามรับประทานโปรตีน 24 ชั่วโมงก่อนให้ยา', 'ให้ loop diuretic ร่วมกับ cisplatin ทุกครั้ง'], a: 1, e: 'IV hydration ด้วย NSS (1–2 L) ก่อนและหลัง cisplatin เป็นมาตรฐานป้องกัน nephrotoxicity' },
    { q: 'ยาใดเป็น immunotherapy ในผู้ป่วยมะเร็งปากมดลูกที่มี PD-L1 CPS ≥ 1', o: ['Durvalumab', 'Nivolumab', 'Pembrolizumab', 'Avelumab', 'Sorafenib'], a: 2, e: 'Pembrolizumab ใช้ใน recurrent/metastatic cervical cancer ที่ PD-L1 positive (CPS ≥ 1)' },
  ],
}
