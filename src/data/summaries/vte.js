// Venous thromboembolism — converted from the RxTU10 class summary PDF (see content/summaries/manifest.json)
export default {
  id: 'vte',
  date: '29/07/2569',
  refs: [
    'อรัมษ์ เจษฎาญานเมธา. เอกสารประกอบการสอนวิชา ภศ.313 หัวข้อ Venous Thromboembolism. คณะเภสัชศาสตร์ มหาวิทยาลัยธรรมศาสตร์. 2568.',
    'กฤติน บัณฑิตานุกูล. Venous thromboembolism. สมาคมเภสัชกรรมการตลาด (ประเทศไทย). 2564.',
    'Creager MD, et al. 2026 AHA/ACC/ACCP/ACEP/CHEST/SCAI/SHM/SIR/SVM/SVN guideline for the evaluation and management of acute pulmonary embolism in adults. Circulation. 2026;153(12):e977-e1051.',
    'Ortel TL, et al. American Society of Hematology 2020 guidelines for management of VTE: treatment of DVT and PE. Blood Adv. 2020;4(19):4693-4738.',
    'MIMS Thailand: Apixaban, Rivaroxaban',
  ],
  sections: [
    { id: 'def', t: 'นิยามและปัจจัยเสี่ยง', html: `<p>ภาวะที่มีลิ่มเลือดในหลอดเลือดดำ แบ่งเป็น 2 ชนิด</p>
<ol>
  <li><b>Deep vein thrombosis (DVT)</b> เกิดที่แขน ขา</li>
  <li><b>Pulmonary embolism (PE)</b> เกิดที่ปอด <mark>อาจเสียชีวิตได้ภายในไม่กี่นาทีหลังมีอาการ</mark></li>
</ol>
<h3>Virchow's triad</h3>
<ol>
  <li>Hypercoagulability (เลือดแข็งตัวง่าย)</li>
  <li>Vascular endothelial damage (หลอดเลือดถูกทำลาย)</li>
  <li>Blood flow stasis (เลือดไหลไม่ดี)</li>
</ol>
<figure><img data-fig="vte/p01-1.webp" alt="Virchow's triad: hypercoagulability, vascular damage, circulatory stasis พร้อมตัวอย่างปัจจัยเสี่ยงแต่ละด้าน"><figcaption>Virchow's triad และตัวอย่างปัจจัยเสี่ยง</figcaption></figure>
<h3>อาการ</h3>
<div class="tbl"><table>
  <tr><th>DVT</th><th>PE</th></tr>
  <tr><td>แขน/ขาข้างหนึ่งปวด บวม แดง ร้อน สีผิวต่างจากอีกข้าง หรือเกิดแผล</td><td>rapid onset dyspnea, tachypnea, tachycardia, dizziness, hemoptysis, chest pain, chest tightness</td></tr>
</table></div>
<h3>Pathophysiology</h3>
<p>หลอดเลือดบาดเจ็บ → กระตุ้น platelet เกาะกลุ่มเป็น platelet plug + coagulation cascade สร้าง fibrin → blood clot</p>
<figure><img data-fig="vte/p01-2.webp" alt="Coagulation cascade: intrinsic, extrinsic และ common pathway"><figcaption>Coagulation cascade (Osmosis)</figcaption></figure>` },
    { id: 'dx', t: 'วินิจฉัยและการรักษา', html: `<p>อาการของ DVT และ PE ไม่จำเพาะ แยกจากโรคอื่นยาก ต้องตรวจเพิ่ม</p>
<div class="tbl"><table>
  <tr><th></th><th>DVT</th><th>PE</th></tr>
  <tr><td>Clinical probability (Wells score)</td><td>ใช้</td><td>ใช้</td></tr>
  <tr><td>D-dimer (degradation product ของ cross-linked fibrin ไม่ specific เจอใน infection, inflammation ได้)</td><td>ใช้</td><td>ใช้</td></tr>
  <tr><td>Diagnosis tests</td><td>contrast venography (gold standard) หรือ venous duplex ultrasound</td><td>V/Q scan หรือ CT pulmonary angiogram (CTPA)</td></tr>
</table></div>
<h3>Management</h3>
<div class="tbl"><table>
  <tr><th>ภาวะ</th><th>การรักษา</th></tr>
  <tr><td>Proximal DVT</td><td>anticoagulant</td></tr>
  <tr><td>Distal DVT</td><td>anticoagulant</td></tr>
  <tr><td><b>High-risk PE</b> (hypotension/shock)</td><td>volume optimization (saline หรือ Ringer's lactate) · cardiogenic shock ให้ vasopressor ± inotropes · <mark>fibrinolytic ตามด้วย anticoagulant</mark></td></tr>
  <tr><td>Non-high-risk PE</td><td>anticoagulant</td></tr>
</table></div>
<h3>Anticoagulant therapy 3 แบบ</h3>
<ol>
  <li><b>Bridging:</b> parenteral → warfarin (warfarin ออกฤทธิ์ช้า)</li>
  <li><b>Switching:</b> parenteral → dabigatran 150 mg BID หรือ edoxaban 60 mg OD</li>
  <li><b>Single drug approach:</b> rivaroxaban (กินพร้อมอาหาร) 15 mg BID × 21 วัน แล้ว 20 mg OD · apixaban 10 mg BID × 7 วัน แล้ว 5 mg BID · extended (≥ 6 เดือน) rivaroxaban 10 mg OD หรือ apixaban 2.5 mg BID</li>
</ol>
<figure><img data-fig="vte/p03-1.webp" alt="ระยะการรักษา VTE: acute 5–10 วัน, long-term ถึง 3 เดือน, extended มากกว่า 3 เดือน เทียบ bridging, switching, single drug approach"><figcaption>Phase ของการรักษา VTE: acute (5–10 วัน) → long-term (ถึง 3 เดือน) → extended (&gt; 3 เดือน)</figcaption></figure>` },
    { id: 'warfarin', t: 'Warfarin', html: `<ul>
  <li><b>MOA:</b> ยับยั้ง reductase ใน vitamin K cycle → factor <b>II, VII, IX, X</b> ทำงานไม่ได้</li>
  <li><b>PK:</b> bioavailability สูง onset ช้า therapeutic index แคบ เมตาบอลิซึมผ่าน CYP2C9</li>
  <li><b>Dose:</b> เริ่ม 3–5 mg/day พิจารณาอายุ เชื้อชาติ น้ำหนัก โรคร่วม อาหาร ตับ ไต · คิดเป็น <b>total weekly dose (TWD)</b> · <mark>เพิ่ม/ลดครั้งละไม่เกิน 5–20%</mark></li>
  <li>Monitor: INR · ADR: bleeding · C/I: หญิงตั้งครรภ์ · antidote: vitamin K</li>
  <li><b>ปัจจัยที่มีผล:</b> พันธุกรรม (CYP2C9, VKORC1) · อาหาร: vitamin E, fish oil รบกวนเกล็ดเลือด · แปะก๊วยเพิ่มฤทธิ์ · ผลิตภัณฑ์ที่มี vitamin K ลดฤทธิ์</li>
  <li><b>ยาเสริมฤทธิ์:</b> amiodarone, fluvastatin, rosuvastatin, propranolol · erythromycin, clarithromycin, cotrimoxazole, ciprofloxacin, cefoperazone, metronidazole · ketoconazole, itraconazole, fluconazole · NSAIDs</li>
  <li><b>ยาต้านฤทธิ์:</b> rifampicin, phenytoin, carbamazepine, phenobarbital, griseofulvin</li>
</ul>
<h3>INR เป้าหมาย</h3>
<div class="tbl"><table>
  <tr><th>ข้อบ่งใช้</th><th class="num">INR</th></tr>
  <tr><td>ป้องกัน venous thrombosis (high-risk surgery), รักษา DVT, รักษา PE, ป้องกัน systemic embolism, tissue heart valves, mechanical prosthetic heart valves, acute MI (ป้องกัน systemic embolism), valvular heart disease, AF</td><td class="num">2.0–3.0</td></tr>
  <tr><td>Mechanical prosthetic valves (high risk)</td><td class="num">2.5–3.5</td></tr>
</table></div>
<h3>ปรับขนาดเพื่อให้ได้ INR 2.0–3.0</h3>
<div class="tbl"><table>
  <tr><th class="num">INR</th><th>การปรับ</th></tr>
  <tr><td class="num">&lt; 1.5</td><td>เพิ่ม 10–20%</td></tr>
  <tr><td class="num">1.5–1.9</td><td>เพิ่ม 5–10%</td></tr>
  <tr><td class="num">2.0–3.0</td><td>ขนาดเดิม</td></tr>
  <tr><td class="num">3.1–3.9</td><td>ลด 5–10%</td></tr>
  <tr><td class="num">4.0–4.9</td><td>หยุด 1 วัน แล้วลด 10%</td></tr>
  <tr><td class="num">5.0–8.9 ไม่มีเลือดออก</td><td>งด 1–2 โดส, vitamin K1 1 mg กิน</td></tr>
  <tr><td class="num">≥ 9.0 ไม่มีเลือดออก</td><td>vitamin K1 5–10 mg กิน</td></tr>
  <tr><td>Major bleeding ทุก INR</td><td>vitamin K1 10 mg IV + FFP ให้ซ้ำทุก 12 ชม. ถ้าจำเป็น</td></tr>
</table></div>` },
    { id: 'doac', t: 'DOACs', html: `<p>ออกฤทธิ์โดยตรง จำเพาะกว่า warfarin · direct thrombin (IIa) inhibitor: <b>dabigatran</b> · direct Xa inhibitors: <b>apixaban, edoxaban, rivaroxaban</b></p>
<div class="tbl"><table>
  <tr><th></th><th>Dabigatran</th><th>Apixaban</th><th>Edoxaban</th><th>Rivaroxaban</th></tr>
  <tr><td>ตำแหน่ง</td><td>IIa</td><td>Xa</td><td>Xa</td><td>Xa</td></tr>
  <tr><td>อาหารกับการดูดซึม</td><td>ไม่เปลี่ยน</td><td>ไม่เปลี่ยน</td><td>ไม่เปลี่ยน</td><td><b>เพิ่ม</b> (กินพร้อมอาหาร)</td></tr>
  <tr><td>ขับทางไต</td><td class="num"><b>80%</b> (รูป active)</td><td class="num">27%</td><td class="num">24%</td><td class="num">36%</td></tr>
  <tr><td>P-gp substrate</td><td>ใช่</td><td>ใช่</td><td>ใช่</td><td>ใช่</td></tr>
  <tr><td>CYP</td><td>—</td><td>CYP3A4</td><td>CYP3A4 (น้อย)</td><td>CYP3A4</td></tr>
  <tr><td>ขนาด (VTE)</td><td class="num">150 mg BID</td><td class="num">10 mg BID 7 วัน → 5 mg BID</td><td class="num">60 mg OD</td><td class="num">15 mg BID 21 วัน → 20 mg OD</td></tr>
</table></div>
<p>DOACs เป็น fixed dose ไม่ต้องปรับตาม INR เหมือน warfarin</p>` },
    { id: 'parenteral', t: 'Parenteral anticoagulants', html: `<h3>Unfractionated heparin (UFH)</h3>
<ul>
  <li>จับ antithrombin III ยับยั้ง IIa, IXa, Xa, XIIa · non-specific binding → bioavailability แปรปรวน</li>
  <li><b>Dose:</b> 80 U/kg (max 5,000 U) แล้ว 18 U/kg/hr (max 1,000 U/hr)</li>
  <li>ตรวจ aPTT หลังให้ 6 ชม. ปรับตาม aPTT · ADR: bleeding, thrombocytopenia · antidote: protamine sulphate</li>
</ul>
<h3>LMWH</h3>
<ul>
  <li>จับ antithrombin III ยับยั้ง Xa และ IIa</li>
  <li>Enoxaparin 1 mg/kg SC q12h หรือ 1.5 mg/kg SC q24h · dalteparin 100 U/kg SC q12h · tinzaparin 175 U/kg SC q24h</li>
  <li>eGFR &lt; 30 ปรับขนาด · <mark>eGFR &lt; 15 เปลี่ยนเป็น UFH</mark></li>
  <li>ใช้ร่วม warfarin <b>อย่างน้อย 5 วัน</b> และหยุดได้เมื่อ INR 2–3 นานอย่างน้อย 24 ชม.</li>
  <li>ไม่ต้องติดตาม aPTT · ADR: bleeding, thrombocytopenia (น้อยกว่า heparin)</li>
</ul>
<h3>Fondaparinux</h3>
<ul>
  <li>จับ antithrombin III ยับยั้งเฉพาะ Xa · SC only</li>
  <li>น้ำหนัก &lt; 50 kg 5 mg OD · 50–100 kg 7.5 mg OD · &gt; 100 kg 10 mg OD</li>
  <li>eGFR &lt; 30 ไม่แนะนำ (ขับทางไตเป็นหลัก) · ไม่ต้องติดตาม aPTT · thrombocytopenia น้อยกว่า heparin (specific binding)</li>
</ul>` },
  ],
  questions: [
    { q: 'ผู้ป่วยสงสัย pulmonary embolism มีอาการใดพบบ่อยที่สุด', o: ['ปวดศีรษะรุนแรง', 'หายใจลำบากเฉียบพลัน', 'ปวดท้องน้อย', 'ปวดข้อ'], a: 1, e: 'อาการที่พบบ่อยของ PE ได้แก่ หายใจเหนื่อยเฉียบพลัน เจ็บหน้าอก และหัวใจเต้นเร็ว' },
    { q: 'การตรวจใดไวสูงและนิยมใช้คัดกรองผู้ที่สงสัย VTE ที่ความเสี่ยงต่ำถึงปานกลาง', o: ['D-dimer', 'Troponin I', 'BNP', 'Creatinine'], a: 0, e: 'D-dimer sensitivity สูง specificity ต่ำ เหมาะใช้ "ตัดโรค" ในผู้ที่ pretest probability ต่ำ' },
    { q: 'ข้อใดเป็น direct oral anticoagulant (DOAC)', o: ['Aspirin', 'Clopidogrel', 'Apixaban', 'Alteplase'], a: 2, e: 'Apixaban เป็น direct factor Xa inhibitor ใช้รักษาและป้องกัน VTE' },
    { q: 'ข้อใดเป็นคำแนะนำที่เหมาะสมสำหรับผู้ป่วยที่ได้ warfarin', o: ['หยุดยาเมื่ออาการดีขึ้น', 'กินวิตามินเคในปริมาณไม่สม่ำเสมอ', 'ติดตามค่า INR อย่างสม่ำเสมอ', 'ใช้ NSAIDs ได้โดยไม่ต้องระวัง'], a: 2, e: 'Warfarin มี therapeutic index แคบ ต้องติดตาม INR สม่ำเสมอ กินวิตามินเคให้สม่ำเสมอ และระวัง NSAIDs ที่เสริมฤทธิ์' },
    { q: 'ข้อใดเป็นข้อได้เปรียบของ DOACs เมื่อเทียบกับ warfarin ในการรักษา VTE', o: ['ต้องตรวจ INR เป็นประจำ', 'มีปฏิกิริยากับอาหารมากกว่า warfarin', 'ไม่จำเป็นต้องติดตาม INR เป็นประจำ', 'ใช้ได้ในผู้ป่วย mechanical heart valve'], a: 2, e: 'DOACs ไม่ต้องติดตาม INR เป็นประจำ และมีปฏิกิริยากับอาหารน้อยกว่า warfarin' },
  ],
}
