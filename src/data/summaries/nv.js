// Nausea & vomiting — converted from the RxTU10 class summary PDF (see content/summaries/manifest.json)
export default {
  id: 'nv',
  date: '29/07/69',
  refs: [
    "Barrett KE, et al. Ganong's Review of Medical Physiology. 26th ed. McGraw-Hill; 2019.",
    'Longstreth GF. Approach to the adult with nausea and vomiting. UpToDate; 2024.',
    'Lexicomp: Ondansetron; Dimenhydrinate drug information. UpToDate; 2026.',
    'UEG/ESNM chronic nausea and vomiting guideline. Medscape; 2025.',
    'Queensland Health. Nausea and vomiting guideline (community pharmacy).',
  ],
  sections: [
    { id: 'def', t: 'นิยามและกลไก', html: `<div class="tbl"><table>
  <tr><th>คำ</th><th>ความหมาย</th></tr>
  <tr><td>Nausea</td><td>รู้สึกคลื่นไส้ ± อาเจียน</td></tr>
  <tr><td>Vomiting</td><td>อาเจียน (มี content) ออกทางปากอย่างรุนแรง + กล้ามเนื้อหน้าท้องหดตัว</td></tr>
  <tr><td>Retching</td><td>พยายามอาเจียนแต่ไม่มีอะไรออก (อ้วกลม) + กล้ามเนื้อหน้าท้องหดตัว</td></tr>
  <tr><td>Regurgitation</td><td>อาหาร/น้ำย่อยไหลย้อนขึ้นปาก ไม่พุ่ง ไม่มีการหดเกร็งของกล้ามเนื้อหน้าท้อง</td></tr>
  <tr><td>Rumination</td><td>ขย้อนอาหารที่เพิ่งกลืนกลับมาเคี้ยวใหม่</td></tr>
</table></div>
<h3>Pathophysiology</h3>
<ul>
  <li><b>Nucleus tractus solitarius (NTS):</b> ศูนย์รวมความรู้สึกที่กระตุ้นอาเจียน รับจาก glossopharyngeal nerve (ช่องปาก), vagus nerve (เยื่อบุลำไส้), chemoreceptor trigger zone (สารเคมีในเลือด) → กระตุ้น brainstem vomiting center และ programmed vomiting response ได้</li>
  <li><b>Brainstem vomiting center:</b> ศูนย์ควบคุมหลักของ reflex รับจาก cerebellum (การเคลื่อนไหว ทรงตัว), higher centers (เครียด ปวด), CTZ</li>
  <li><mark>CTZ ตรวจจับสารเคมีในเลือดแล้วส่งสัญญาณไปทั้ง NTS และ vomiting center</mark></li>
</ul>
<p><b>Risk factors:</b> motion sickness · vagal nerve injury · intracranial hypertension · autonomic dysfunction · วิตกกังวล ซึมเศร้า · eating disorders</p>
<h3>Management</h3>
<ol>
  <li>ซักประวัติและตรวจเลือดหาความเร่งด่วน: hypotension หรือ electrolyte imbalance แก้ก่อน · <b>ตรวจการตั้งครรภ์</b> · ตรวจการอุดตันของทางเดินอาหาร</li>
  <li>ถ้าไม่ใช่ แยกโรค: chemotherapy (antiemetics, glucocorticoids) · infection (ยืนยันเชื้อ, antiemetics) · drug-induced (ระดับยา, antiemetics, antidote) · neurologic (MRI/CT) · electrolyte/glucose imbalance (แก้ + antiemetics, glucocorticoids)</li>
  <li>ไม่เข้าทั้ง 5 ข้อ ตรวจหาสาเหตุอื่น</li>
</ol>` },
    { id: 'drugs', t: 'Pharmacotherapy', html: `<h3>1. Benzamide derivatives</h3>
<div class="tbl"><table>
  <tr><th>ยา</th><th>กลไก</th><th>หมายเหตุ</th></tr>
  <tr><td>Cisapride HCl</td><td>กระตุ้นการหลั่ง ACh เพิ่มการบีบตัวของลำไส้</td><td></td></tr>
  <tr><td>Itopride HCl</td><td>ยับยั้ง DA ยับยั้ง AChE</td><td>prolactin เพิ่ม → gynecomastia</td></tr>
  <tr><td>Mosapride HCl</td><td>5-HT4 receptor agonist</td><td></td></tr>
</table></div>
<p>ADR: cholinergic effect · ข้อห้าม: bradycardia, hypotension, ผู้สูงอายุ, ห้ามร่วมยาที่ทำ QT prolong หรือ CYP3A4 inhibitor</p>
<h3>2. Domperidone maleate</h3>
<ul>
  <li>Dopamine receptor antagonist <mark>ไม่ผ่าน BBB</mark> (EPS น้อยกว่า metoclopramide) · antiemetic</li>
  <li>10 mg วันละ 3 ครั้ง ก่อนอาหาร 15–30 นาที · DI: ยาผ่าน CYP3A4 / QT prolong</li>
</ul>
<h3>3. Metoclopramide</h3>
<ul>
  <li>Dopamine receptor antagonist + กระตุ้น ACh เพิ่มการเคลื่อนไหวของกระเพาะและลำไส้ส่วนบน</li>
  <li>N/V จากเคมีบำบัด 20–40 mg วันละ 2–4 ครั้ง · GERD 10–15 mg วันละ 2–4 ครั้ง (ก่อนอาหาร 30 นาที)</li>
  <li>ห้าม: ประวัติลมชัก GI bleeding · ระวัง: Parkinson, hypoglycemia เมื่อใช้ร่วมยาเบาหวาน, digoxin, paracetamol, antipsychotics บางตัว</li>
  <li>ADR: น้ำนมไหล หน้าอกโต ขาดประจำเดือน ง่วง อ่อนเพลีย neutrophil ต่ำ</li>
</ul>
<h3>4. 5-HT3 receptor antagonists</h3>
<p>ยับยั้ง serotonin ที่กระตุ้นศูนย์อาเจียน · premed ก่อนเคมีบำบัดหรือรังสีรักษา</p>
<div class="tbl"><table>
  <tr><th>ยา</th><th>ขนาด</th><th>วิธีให้</th></tr>
  <tr><td>Ondansetron</td><td class="num">8 mg หรือ 0.15 mg/kg</td><td>PO 1–2 ชม. ก่อนรักษา</td></tr>
  <tr><td>Palonosetron</td><td class="num">0.25 mg ครั้งเดียว / 0.5 mg ครั้งเดียว</td><td>IV 30 นาทีก่อน / PO</td></tr>
</table></div>
<h3>ยาอื่น</h3>
<ul>
  <li><b>Prochlorperazine:</b> DA antagonist (antipsychotic) · 5–10 mg PO q6–8h prn, 5–10 mg IM q3–4h prn, 2.5–10 mg IV q3–4h prn · max 40 mg/day</li>
  <li><b>Erythromycin:</b> กระตุ้น motilin receptor เพิ่มการบีบตัวไปลำไส้เล็ก · 64–240 mg PO ac</li>
  <li><b>Antihistamines (dimenhydrinate):</b> motion sickness 50–100 mg PO q4–6h · ADR: CNS depression, ผื่น · 1st gen มีฤทธิ์ <b>anticholinergic (antimuscarinic)</b> ปากแห้ง ตาพร่า ปัสสาวะขัด ท้องผูก</li>
  <li><b>NK1 receptor antagonists:</b> aprepitant (oral), fosaprepitant (parenteral) เป็น moderate CYP3A4 inhibitor · rolapitant ไม่ยับยั้ง 3A4 แต่ยับยั้ง CYP2D6</li>
</ul>` },
  ],
  questions: [
    { q: 'หญิง 45 ปี พยายามอาเจียนแต่ไม่มีอะไรออก กล้ามเนื้อหน้าท้องหดเกร็งเป็นระยะ 6 ชม. ปวดแน่นท้องรุนแรง ท้องอืดตึง ผายลมไม่ได้ การประเมินและขั้นตอนต่อไปที่ถูกต้อง', o: ['Rumination แนะนำให้เคี้ยวช้าลง', 'Retching ซึ่งอาจเกิดจาก GI obstruction ควรส่งตรวจ X-ray/CT', 'Regurgitation ให้ PPI แล้วกลับบ้าน', 'Nausea ปกติ ไม่ต้องตรวจเพิ่ม'], a: 1, e: 'อาเจียนไม่มีอะไรออก + กล้ามเนื้อหน้าท้องหดตัว = retching ร่วมกับท้องอืดผายลมไม่ได้ ต้องสงสัยทางเดินอาหารอุดตัน' },
    { q: 'ข้อใดอธิบายคุณลักษณะของ chemoreceptor trigger zone (CTZ) ได้ถูกต้องที่สุด', o: ['มี BBB หนาแน่นกันสารพิษในเลือดกระตุ้น reflex', 'ตรวจจับสารเคมีในเลือดแล้วส่งสัญญาณไปกระตุ้นได้ทั้ง NTS และ brainstem vomiting center', 'รับสัญญาณการทรงตัวส่งตรงไป vomiting center', 'เป็นศูนย์ควบคุมหลักสั่งกล้ามเนื้อหน้าท้องและกะบังลมโดยตรง'], a: 1 },
    { q: 'หญิง 22 ปี คลื่นไส้อาเจียนวันละหลายครั้ง 1 สัปดาห์ สัญญาณชีพปกติ ไม่มี hypotension ไม่มี electrolyte imbalance ขั้นตอนถัดไปคือ', o: ['ตรวจทดสอบการตั้งครรภ์', 'CT/MRI brain', 'ตรวจระดับยาและสารพิษในเลือด', 'ตรวจหาการติดเชื้อและให้ยาต้านจุลชีพ'], a: 0, e: 'ตาม Queensland community pharmacy: ตรวจ vital sign แล้วหาสาเหตุ รวมถึงตรวจการตั้งครรภ์และการให้นมบุตร' },
    { q: 'ผู้สูงอายุกิน dimenhydrinate แก้เมารถ แล้วปากแห้ง คอแห้ง ตาพร่า ปัสสาวะขัด เกิดจากการต้าน receptor ใด', o: ['Nicotinic receptor', 'Muscarinic receptor', 'Dopamine D2 receptor', 'Serotonin 5-HT3 receptor'], a: 1, e: '1st gen antihistamine นอกจากยับยั้ง H1 ยังต้าน muscarinic (anticholinergic)' },
    { q: 'ทำไมผู้สูงอายุที่แน่นท้องคลื่นไส้ แพทย์มักเลือก domperidone มากกว่า metoclopramide', o: ['Domperidone ไม่ผ่านเข้าสมอง จึงไม่ค่อยเกิดอาการสั่น/เกร็ง (EPS)', 'Domperidone เพิ่มแรงบีบตัวลำไส้ใหญ่ดีกว่า แก้ท้องผูกได้ด้วย', 'Domperidone ไม่เสี่ยง QT prolongation ในผู้สูงอายุ', 'Domperidone มีฤทธิ์ anticholinergic ลดกรดได้ในตัว'], a: 0, e: 'Domperidone ข้าม BBB ได้น้อย จึงเสี่ยง EPS น้อยกว่า (แต่ยังเสี่ยง QT prolong)' },
  ],
}
