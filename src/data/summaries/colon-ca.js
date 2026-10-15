// Colon cancer — converted from the RxTU10 class summary PDF (see content/summaries/manifest.json)
// ตาราง AJCC staging สร้างใหม่เป็น HTML
export default {
  id: 'colon-ca',
  date: '23/07/2026',
  refs: [
    'American Cancer Society. Colorectal cancer screening guideline.',
    'American Joint Committee on Cancer. AJCC Cancer Staging Manual, 8th ed. 2017.',
    'National Comprehensive Cancer Network. NCCN Clinical Practice Guidelines in Oncology: Colon Cancer.',
  ],
  sections: [
    { id: 'overview', t: 'Pathophysiology และการคัดกรอง', html: `<h3>Pathophysiology</h3>
<ul>
  <li>COX-2 overexpression</li>
  <li>Proto-oncogene activation (EGFR, KRAS, BRAF)</li>
  <li>Tumor suppressor gene inactivation (APC)</li>
</ul>
<h3>Risk factors</h3>
<ul>
  <li><b>Modifiable:</b> น้ำหนักเกิน · เนื้อแปรรูป</li>
  <li><b>Non-modifiable:</b> ประวัติครอบครัว · advanced polyps · FAP · Lynch syndrome (HNPCC) · เพศชาย · อายุมาก</li>
</ul>
<h3>Prevention และ screening (ACS)</h3>
<p>อาหารกากใยสูง · งดแอลกอฮอล์/บุหรี่ · aspirin, COX-2 inhibitors · <b>เริ่มคัดกรองอายุ 45 ปี</b></p>
<div class="tbl"><table>
  <tr><th>วิธีคัดกรอง</th><th>ความถี่</th></tr>
  <tr><td>FOBT / FIT</td><td>ทุกปี</td></tr>
  <tr><td>Stool DNA test</td><td>ทุก 3 ปี</td></tr>
  <tr><td>mt-sRNA</td><td>ทุก 3 ปี</td></tr>
  <tr><td>Sigmoidoscopy</td><td>ทุก 5 ปี</td></tr>
  <tr><td>CT colonography</td><td>ทุก 5 ปี</td></tr>
  <tr><td><b>Colonoscopy</b></td><td><b>ทุก 10 ปี</b></td></tr>
</table></div>` },
    { id: 'dx', t: 'อาการ การวินิจฉัย และ staging', html: `<p><b>อาการ:</b> การขับถ่ายเปลี่ยน · ถ่ายเป็นเลือด → iron-deficiency anemia → อ่อนเพลีย · ปวดท้อง</p>
<p><b>วินิจฉัย:</b> colonoscopy · biopsy/CT · CEA · MMR protein (คัดกรอง Lynch syndrome)</p>
<h3>AJCC 8th edition</h3>
<div class="tbl"><table>
  <tr><th>Stage</th><th>T</th><th>N</th><th>M</th></tr>
  <tr><td>0</td><td>Tis</td><td>N0</td><td>M0</td></tr>
  <tr><td>I</td><td>T1–T2</td><td>N0</td><td>M0</td></tr>
  <tr><td>IIA / IIB / IIC</td><td>T3 / T4a / T4b</td><td>N0</td><td>M0</td></tr>
  <tr><td>IIIA</td><td>T1–T2 / T1</td><td>N1/N1c / N2a</td><td>M0</td></tr>
  <tr><td>IIIB</td><td>T3–T4a / T2–T3 / T1–T2</td><td>N1/N1c / N2a / N2b</td><td>M0</td></tr>
  <tr><td>IIIC</td><td>T4a / T3–T4a / T4b</td><td>N2a / N2b / N1–N2</td><td>M0</td></tr>
  <tr><td>IVA / IVB / IVC</td><td>Any T</td><td>Any N</td><td>M1a / M1b / M1c</td></tr>
</table></div>` },
    { id: 'tx', t: 'การรักษา', html: `<div class="tbl"><table>
  <tr><th>Stage</th><th>การรักษา</th></tr>
  <tr><td>I</td><td>ผ่าตัด แล้วติดตาม (surveillance)</td></tr>
  <tr><td>II–III</td><td>ผ่าตัด + เคมีบำบัด</td></tr>
  <tr><td>IV</td><td>ผ่าตัด + เคมีบำบัด + targeted therapy</td></tr>
</table></div>
<ul>
  <li><b>FOLFOX</b> (leucovorin/5-FU/oxaliplatin) · <b>CAPEOX</b> (capecitabine/oxaliplatin)</li>
  <li>Low-risk stage III (T1–3 N1): <mark>CAPEOX 3 เดือน</mark> (NCCN)</li>
</ul>
<h3>Toxicity</h3>
<div class="tbl"><table>
  <tr><th>ยา</th><th>ADR เด่น</th></tr>
  <tr><td>Oxaliplatin</td><td><mark>Cold dysesthesia</mark> (ชา/เจ็บเมื่อสัมผัสของเย็น) · delayed hypersensitivity</td></tr>
  <tr><td>5-Fluorouracil</td><td>Mucositis · ให้แบบ infusion → diarrhea · bolus → myelosuppression</td></tr>
  <tr><td>Capecitabine</td><td>Hand-foot syndrome</td></tr>
</table></div>
<h3>Unresectable metastatic colorectal cancer</h3>
<p>5-FU/LV หรือ capecitabine + irinotecan หรือ oxaliplatin ± anti-VEGF หรือ anti-EGFR · <b>anti-EGFR ใช้เฉพาะ left-sided tumor และ RAS/BRAF wild type</b></p>
<div class="tbl"><table>
  <tr><th>ยา</th><th>ประเด็นสำคัญ</th></tr>
  <tr><td>Bevacizumab (anti-VEGF)</td><td>Hypertension, proteinuria</td></tr>
  <tr><td>Cetuximab, panitumumab (anti-EGFR)</td><td>Skin rash, infusion reaction</td></tr>
  <tr><td>Regorafenib (multikinase inhibitor)</td><td>160 mg PO OD (3 สัปดาห์ หยุด 1 สัปดาห์)</td></tr>
  <tr><td>Trifluridine + tipiracil</td><td>Antimetabolite + <b>thymidine phosphorylase inhibitor</b> (tipiracil ยับยั้งการทำลาย trifluridine)</td></tr>
  <tr><td>Pembrolizumab, nivolumab, dostarlimab</td><td>Immune checkpoint inhibitors</td></tr>
</table></div>` },
  ],
  questions: [
    { q: 'ชายอายุ 45 ปี ไม่มีอาการ ต้องการคัดกรองมะเร็งลำไส้ใหญ่ด้วย colonoscopy ตามแนวทาง ACS ถ้าผลครั้งแรกปกติควรตรวจซ้ำทุกกี่ปี', o: ['ทุก 5 ปี', 'ทุก 3 ปี', 'ทุก 10 ปี', 'ทุก 1 ปี'], a: 2, e: 'ACS: colonoscopy ในผู้มีความเสี่ยงปกติทำทุก 10 ปี เริ่มอายุ 45 ปี' },
    { q: 'ผู้ป่วยมะเร็งลำไส้ใหญ่ระยะที่ III ได้ FOLFOX แล้วชาและเจ็บเมื่อสัมผัสของเย็น (cold dysesthesia) เกิดจากยาใดในสูตร', o: ['Oxaliplatin', '5-Fluorouracil', 'Capecitabine', 'Leucovorin'], a: 0, e: 'Oxaliplatin มี neurotoxicity ที่ถูกกระตุ้นด้วยความเย็นเป็นลักษณะจำเพาะ' },
    { q: 'การใช้ cetuximab ในมะเร็งลำไส้ใหญ่ระยะแพร่กระจาย ข้อใดคือเงื่อนไขสำคัญที่ทำให้ตอบสนองได้ดี', o: ['Left-sided tumor และ RAS/BRAF wild type', 'Right-sided tumor และ RAS/BRAF mutation', 'Left-sided tumor และ PI3K mutation', 'Right-sided tumor และ RAS/BRAF wild type'], a: 0, e: 'Anti-EGFR ได้ผลดีในก้อนฝั่งซ้ายและต้องไม่มีการกลายพันธุ์ในเส้นทางส่งสัญญาณ (RAS/BRAF wild type)' },
    { q: 'ผู้ป่วยมะเร็งลำไส้ใหญ่ระยะ T3 N1 M0 ตาม NCCN ระยะเวลาที่เหมาะสมที่สุดในการให้ CAPEOX คือข้อใด', o: ['6 เดือน', '3 สัปดาห์', '1 ปี', '3 เดือน'], a: 3, e: 'Low-risk stage III (T1–3 N1) ใช้ CAPEOX 3 เดือนเป็นทางเลือกที่เหมาะสม' },
    { q: 'ในยาผสม trifluridine + tipiracil สาร tipiracil ยับยั้งเอนไซม์ใดเพื่อเพิ่มระดับ trifluridine', o: ['Thymidylate synthase', 'Dihydropyrimidine dehydrogenase', 'DNA polymerase', 'Thymidine phosphorylase'], a: 3, e: 'Tipiracil ยับยั้ง thymidine phosphorylase ซึ่งทำลาย trifluridine ทำให้ระดับยาในเลือดสูงขึ้น' },
  ],
}
