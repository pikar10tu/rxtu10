// Dementia / Alzheimer's disease — converted from the RxTU10 class summary PDF (see content/summaries/manifest.json)
// ต้นฉบับเป็นโปสเตอร์ ข้อความบางส่วนสระ/วรรณยุกต์หาย → ตรวจกับภาพหน้าแล้ว
const fig = (f, cap, alt) => `<figure><img data-fig="dementia/${f}.webp" alt="${alt || cap}"><figcaption>${cap}</figcaption></figure>`

export default {
  id: 'dementia',
  date: '26/07/2026',
  refs: [
    'ศูนย์ข้อมูลข่าวสารระบบประสาท. แนวทางเวชปฏิบัติภาวะสมองเสื่อม (ฉบับสมบูรณ์ 2563). 2565.',
    'Kanin Rungardthong. Pharmacotherapy in Dementia: Alzheimer\'s disease [เอกสารประกอบการสอน]. 2025.',
  ],
  sections: [
    { id: 'overview', t: 'Overview', html: `<p><b>Dementia</b> คือภาวะสมองเสื่อม ความจำและความสามารถด้านสติปัญญา (cognitive function) เสื่อมลงจนกระทบชีวิตประจำวัน</p>
<p><b>Alzheimer's disease</b> เป็นสาเหตุที่พบบ่อยของภาวะสมองเสื่อม พบมากขึ้นตามอายุ · ไม่ได้ทำให้เสียชีวิตโดยตรง แต่ทำให้การทำงานของอวัยวะอื่นแย่ลง</p>
<ul>
  <li><b>Early onset (EOAD):</b> อายุ &lt; 65 ปี</li>
  <li><b>Late onset (LOAD):</b> อายุ &gt; 65 ปี</li>
</ul>
<h3>Etiology</h3>
<ul>
  <li><b>Genetics</b> (50% ของ EOAD): การเปลี่ยนแปลงของโครโมโซมคู่ที่ 1, 14 และ 21 (presenilin 2, presenilin 1, APP) → กระทบการเปลี่ยน amyloid precursor protein (APP) เป็น β-amyloid peptide (Aβ)</li>
  <li>สิ่งแวดล้อม</li>
</ul>
<p><b>Risk factors:</b> อายุ · การบาดเจ็บที่ศีรษะ · Down syndrome · depression · mild cognitive impairment · เพศหญิงมากกว่าชาย</p>` },
    { id: 'patho', t: 'Pathophysiology', html: `<h3>1. β-amyloid aggregation → plaque formation</h3>
<p>APP เป็นโปรตีนที่ transmembrane domain</p>
<ul>
  <li><b>Non-amyloidogenic (ปกติ):</b> α-secretase ตัด APP ได้ soluble APPα (APPsα) และ C83 → γ-secretase ตัด C83 ได้ p3 (ปล่อยออกนอกเซลล์) และ AICD (amyloid intracellular domain) อยู่ในเซลล์</li>
  <li><b>Amyloidogenic:</b> β-secretase ตัด APP ได้ APPsβ (สั้นกว่า APPsα) และ C99 → γ-secretase ตัด C99 ได้ <b>Aβ</b> รวมเป็น Aβ plaque สะสมที่ cortex</li>
</ul>
${fig('p01-1', 'Non-amyloidogenic pathway (α-secretase) เทียบกับ amyloidogenic pathway (β- แล้ว γ-secretase → Aβ plaque)')}
<p><b>พิษของ Aβ plaque:</b> neurotoxicity · ยับยั้ง long-term potentiation · เพิ่มการตายของเซลล์ประสาท · เพิ่ม Ca²⁺ เข้าเซลล์ · เพิ่ม nitric oxide</p>
<p style="font-size:.9em">ต้นฉบับเขียนว่า Ca²⁺ ไหลเข้า "ทำให้เกิด hyperpolarization" แต่ Ca²⁺ ไหลเข้าทำให้เกิด depolarization และ excitotoxicity จึงตัดคำนี้ออก</p>
<h3>2. Neurofibrillary tangles</h3>
<p>Hyperphosphorylated tau — tau ถูกเติมหมู่ฟอสเฟตผิดปกติ จับ microtubule ได้ไม่ดี → microtubule สลาย</p>
<h3>3. Inflammatory mediators (oxidative stress)</h3>
<p>Aβ เหนี่ยวนำ oxidative stress และ ROS ก็เหนี่ยวนำ Aβ · การอักเสบเพิ่ม cytokine, NO, radical species (GSK-3β → tau hyperphosphorylation)</p>
<h3>4. Cholinergic hypothesis</h3>
<p>การสูญเสียระบบ cholinergic สัมพันธ์กับความรุนแรงของโรค · ระยะท้ายสูญเสีย nicotinic receptor ในสมอง ซึ่ง presynaptic nicotinic receptor ควบคุมการปล่อย acetylcholine ที่สำคัญต่อความจำ</p>
<h3>5. Neurotransmitter abnormality</h3>
<p>ความผิดปกติใน glutamate pathway ของ cortex และ limbic (glutamate อาจเป็น neurotoxin แต่กลไกยังไม่ชัด) · การยับยั้ง NMDA receptor ลด glutamate ใน synapse อาจลดความเสียหายของเซลล์ได้</p>` },
    { id: 'dx', t: 'อาการ ระยะโรค และการวินิจฉัย', html: `<h3>อาการแสดง</h3>
<ul>
  <li>สูญเสียความทรงจำ · เสียความสามารถในการพูด/ใช้ภาษา · เสียการควบคุมการเคลื่อนไหว · ระบุชื่อสิ่งของไม่ได้ · สูญเสียการรับรู้เวลา จำคนใกล้ชิดไม่ได้ · ตัดสินใจไม่ได้</li>
  <li>ซึมเศร้า อาการทางจิต (ภาพหลอน หลงผิด) · ก้าวร้าว ใช้ความรุนแรง · ไม่ให้ความร่วมมือ · เดินเรื่อยเปื่อย · ทำกิจกรรมเดิมซ้ำ ๆ · ตอบโต้ ขัดขืน</li>
</ul>
<h3>Stages</h3>
<div class="tbl"><table>
  <tr><th>ระยะ (MMSE)</th><th>ลักษณะ</th></tr>
  <tr><td><b>Mild</b> (26–21)</td><td>จำเหตุการณ์ล่าสุดไม่ค่อยได้ · อาจหลงทางขณะขับรถ</td></tr>
  <tr><td><b>Moderate</b> (20–10)</td><td>สับสนวัน เวลา ฤดู · ต้องการความช่วยเหลือในกิจวัตรประจำวัน · จำเหตุการณ์ล่าสุดบกพร่องรุนแรง</td></tr>
  <tr><td><b>Severe</b> (9–0)</td><td>พูด เดิน กินอาหารเองไม่ได้ · กลั้นปัสสาวะอุจจาระไม่ได้ · ต้องการการดูแลตลอดเวลา</td></tr>
</table></div>
<h3>Screening / diagnosis</h3>
<ul>
  <li>คัดกรอง: Thai Mental State Examination (TMSE) · MMSE-Thai</li>
  <li>วินิจฉัย: brain tissue (autopsy/biopsy) · brain imaging (CT หรือ MRI / PET)</li>
  <li>Lab: CBC, electrolytes, TFT, BUN/Cr, LFT · <mark>vitamin B12</mark> เพื่อแยกโรคหลงลืมที่รักษาได้ เมื่อสงสัยหรือมีความเสี่ยง (มังสวิรัติ ผ่าตัดกระเพาะ โรคภูมิคุ้มกันผิดปกติ หรือประวัติครอบครัว เช่น ไทรอยด์ ด่างขาว ซีดไม่ทราบสาเหตุ)</li>
</ul>` },
    { id: 'tx', t: 'แนวทางการรักษา', html: `<p><b>Primary goal:</b> รักษาความบกพร่องของ cognitive function และคงการทำงานของร่างกายให้นานที่สุด · <b>Secondary goal:</b> จัดการผลกระทบทางพฤติกรรมและจิตเวช</p>
<p><b>Non-pharmacologic:</b> ออกกำลังกาย บำบัดด้วยแสง ดนตรีบำบัด บำบัดด้วยความทรงจำ การนวดและการสัมผัส</p>
<p><b>Pharmacologic</b></p>
<ul>
  <li>Cholinesterase inhibitors (ChEIs): donepezil, rivastigmine, galantamine</li>
  <li>NMDA receptor antagonist: memantine</li>
  <li>Dietary supplement: ginkgo biloba, vitamin E</li>
  <li>Anti-amyloid monoclonal antibody (FDA approved): donanemab, lecanemab</li>
</ul>
<h3>แนวทางการรักษา (แนวทางเวชปฏิบัติภาวะสมองเสื่อม)</h3>
<ul>
  <li><b>Mild cognitive impairment:</b> หาสาเหตุและแก้ไข เริ่มด้วยการรักษาที่ไม่ใช้ยา</li>
  <li><b>Alzheimer's dementia:</b> เริ่มยาเดี่ยว → ติดตาม cognition, behavior และ ADL หลังได้ยาอย่างน้อย 3 เดือน
    <ul>
      <li>ตอบสนอง → ใช้ยาต่อในขนาดเดิมหรือปรับให้เหมาะสม ประเมินต่อเนื่องอย่างน้อยทุก 3–6 เดือน</li>
      <li>แย่ลง → หาสาเหตุ · มีสาเหตุให้แก้ไข · ไม่มีสาเหตุให้เพิ่มขนาด เปลี่ยนยาในกลุ่ม ChEIs หรือเพิ่มยาอีก 1 ชนิดที่กลไกต่างกัน</li>
    </ul>
  </li>
</ul>
<h3>ไม่ตอบสนองหรือตอบสนองไม่ดีหลังได้ยา 3–6 เดือน</h3>
<p><b>กรณีได้ ChEIs อยู่</b></p>
<ul>
  <li>ยังไม่ถึงขนาดสูงสุดและทนผลข้างเคียงได้ → เพิ่มขนาดโดยไม่เกินขนาดสูงสุด</li>
  <li>ตอบสนองไม่ดี → เปลี่ยนเป็น ChEI ตัวอื่นได้ทันที ไม่ต้อง washout (ถ้าเปลี่ยนเพราะผลข้างเคียง ต้องมี washout ตาม PK และเวลาที่ผลข้างเคียงหาย)</li>
  <li>ระยะปานกลางหรือรุนแรง → พิจารณาเพิ่ม memantine</li>
  <li><mark>ไม่แนะนำใช้ ChEIs ร่วมกันมากกว่า 1 ตัว</mark></li>
</ul>
<p><b>กรณีระยะปานกลาง/รุนแรงที่ได้ memantine อยู่</b></p>
<ul>
  <li>ยังไม่ถึงขนาดสูงสุดและทนได้ → เพิ่มขนาดโดยไม่เกินขนาดสูงสุด</li>
  <li>เปลี่ยนไปใช้ ChEIs แทน หรือเพิ่ม ChEIs ร่วมด้วย</li>
</ul>` },
    { id: 'drugs', t: 'รายละเอียดยา', html: `<h3>Cholinesterase inhibitors</h3>
<div class="tbl"><table>
  <tr><th>ยา</th><th>ขนาดเริ่มต้น</th><th>การปรับยา</th><th>ข้อควรระวัง</th><th>PK</th></tr>
  <tr><td><b>Donepezil</b> 5, 10 mg<br>ระยะน้อย–รุนแรง</td><td>5 mg OD (ตอนเย็น)<br>Max 20 mg OD</td><td>เพิ่มครั้งละ 5 mg ทุก 4 สัปดาห์ · 15–20 mg OD ในระยะปานกลาง–รุนแรง</td><td>คลื่นไส้ อาเจียน ท้องเสีย (ดีขึ้นใน 1–3 สัปดาห์ แนะนำกินหลังอาหาร) · ฝันร้าย นอนไม่หลับ (เปลี่ยนไปกินเช้า) · QT prolongation · ชีพจรช้า หมดสติ</td><td>Absorption ดี · CYP2D6 และ 3A4 (minor) · t½ 70 ชม. (steady state 15 วัน)</td></tr>
  <tr><td><b>Rivastigmine</b><br>Cap 1.5, 3, 4.5, 6 mg · Sol 2 mg/mL · Patch 4.6, 9.5, 13.3 mg/24 h<br>Sol: น้อย–ปานกลาง · Patch: น้อย–รุนแรง</td><td>Cap/Sol 1.5 mg BID (max 12 mg/วัน)<br>Patch 4.6 mg/24 h (max 13.3 mg/24 h)</td><td>Oral: เพิ่มครั้งละ 1.5–3 mg ทุก 4 สัปดาห์ · Patch: เพิ่มทุก 4 สัปดาห์ ขึ้นเป็น 13.3 mg ได้ในระยะปานกลาง–รุนแรง</td><td>คลื่นไส้ อาเจียน ปวดท้อง เบื่ออาหาร น้ำหนักลด (เพิ่มขนาดช้า ๆ) · Patch: ไม่ตัดแบ่ง · แปะแผ่นหลัง (แกะเกายาก) เปลี่ยนตำแหน่งทุกวัน แปะซ้ำที่เดิมได้หลัง 14 วัน · ชีพจรช้า หมดสติ</td><td>Oral ดูดซึมเร็ว สมบูรณ์ใน 1 ชม. · t½ oral 1.5 ชม. · patch ~3 ชม.หลังแกะ · CrCl ≤ 50: ไม่ต้องปรับ (oral เริ่ม 1.5 mg ค่อย ๆ เพิ่ม) · Child-Pugh A/B: oral ไม่ต้องปรับ · patch เริ่มและสูงสุด 4.6 mg/24 h</td></tr>
  <tr><td><b>Galantamine</b> PR cap 8, 16 mg<br>ระยะน้อย–ปานกลาง</td><td>8 mg OD<br>Max 24 mg OD</td><td>เพิ่มครั้งละ 8 mg/วัน ทุก 4 สัปดาห์ · หยุดยา ≥ 3 วัน ให้เริ่มขนาดเริ่มต้นใหม่</td><td>เบื่ออาหาร คลื่นไส้ น้ำหนักลด ตะคริว · ชีพจรช้า หมดสติ</td><td>F 90% · CYP2D6 และ 3A4 (minor) · ขับทางปัสสาวะ 20% · t½ 7 ชม. · ไต/ตับบกพร่องปานกลาง max 16 mg OD · รุนแรง ไม่แนะนำ</td></tr>
</table></div>
<p style="font-size:.9em">ต้นฉบับเขียนขนาด rivastigmine patch ใน Child-Pugh A/B ว่า 4.5 mg/24 hr แต่ขนาด patch ที่มีคือ 4.6 mg/24 h จึงแก้เป็น 4.6 · ขนาดสูงสุดชนิดรับประทานคือ 12 mg/วัน (6 mg BID)</p>
<p><b>Withdrawal syndrome ของ ChEIs:</b> อารมณ์แปรปรวน กระสับกระส่าย ภาพหลอน นอนไม่หลับ ไม่มีสมาธิ · มักเกิด 3–6 วันหลังหยุดยาทันที · ป้องกันโดยค่อย ๆ ลดขนาด 50% หรือลดทีละน้อยทุก 4 สัปดาห์</p>
<p><b>Drug interactions:</b> CYP2D6/CYP3A4 inducers หรือ inhibitors · ยา anticholinergic (sedative antihistamine, muscle relaxant, antidepressant, antipsychotic) · ยาที่ลด HR เช่น beta-blockers</p>
<h3>NMDA receptor antagonist</h3>
<div class="tbl"><table>
  <tr><th>ยา</th><th>ขนาดเริ่มต้น</th><th>การปรับยา</th><th>ข้อควรระวัง</th><th>PK</th></tr>
  <tr><td><b>Memantine</b> tab 10, 20 mg · sol 5 mg/pump · ER cap 7 mg<br>ระยะปานกลาง–รุนแรง</td><td>5 mg OD (max 20 mg OD)<br>ER 7 mg OD (max 28 mg OD)</td><td>เพิ่มครั้งละ 5 mg ทุก 1 สัปดาห์ ให้ OD หรือ BID</td><td>ระวังในผู้ที่เพิ่งชักและยังคุมไม่ได้ภายใน 6 เดือน · ไม่แนะนำเป็นยาเดี่ยวในระยะน้อย · ปวดศีรษะ มึนงง ท้องผูก</td><td>CrCl 5–29: tab/sol maintenance 5 mg BID · ER 14 mg OD</td></tr>
</table></div>
<h3>Dietary supplements</h3>
<div class="tbl"><table>
  <tr><th>ยา</th><th>ขนาด</th><th>ข้อควรระวัง</th></tr>
  <tr><td><b>Ginkgo biloba extract</b> tab 40, 120 mg<br>ระยะน้อย–ปานกลาง</td><td>120 mg OD (max 240 mg) · เพิ่มครั้งละ 120 mg ทุก 4 สัปดาห์ ให้ OD หรือแบ่ง BID</td><td>คลื่นไส้ อาเจียน ท้องเสีย · ระวังร่วมกับยาต้านการแข็งตัวของเลือดและยาต้านเกล็ดเลือด · ไม่แนะนำในระยะรุนแรง</td></tr>
  <tr><td><b>Vitamin E</b></td><td colspan="2">ไม่แนะนำให้ใช้รักษา · 2,000 IU/วัน ชะลอการเข้าสู่ระยะรุนแรงและการเสียชีวิต แต่ &gt; 400 IU/วัน อาจเพิ่มอัตราตายจากโรคหัวใจและหลอดเลือด</td></tr>
</table></div>
<h3>Anti-amyloid monoclonal antibodies (FDA approved)</h3>
<div class="tbl"><table>
  <tr><th>ยา</th><th>ขนาด</th><th>ข้อควรระวัง</th></tr>
  <tr><td><b>Donanemab</b></td><td>700 mg IV over 30 นาที q 4 wk × 3 dose ตามด้วย 1,400 mg q 4 wk · ไม่ต้องปรับขนาด</td><td rowspan="2"><b>ARIA</b> (amyloid-related imaging abnormalities) · infusion-related reactions ไข้ อาการคล้ายไข้หวัด (มักเกิดครั้งแรก) ป้องกันได้ด้วย antihistamine, NSAIDs, acetaminophen, steroids</td></tr>
  <tr><td><b>Lecanemab</b></td><td>10 mg/kg IV q 2 wk</td></tr>
</table></div>` },
    { id: 'bpsd', t: 'BPSD และยาที่ควรหลีกเลี่ยง', html: `<h3>ยาสำหรับ BPSD (behavioral and psychological symptoms of dementia)</h3>
<div class="tbl"><table>
  <tr><th>ยา</th><th>Depression</th><th>Delirium</th><th>Psychosis</th><th>Agitation/aggression</th><th>Repetitive behavior</th><th>Anxiety</th><th>Disinhibition</th></tr>
  <tr><td>Sertraline</td><td>+</td><td></td><td></td><td>+</td><td>+</td><td>+</td><td>+</td></tr>
  <tr><td>Escitalopram</td><td>+</td><td></td><td></td><td></td><td>+</td><td>+</td><td>+</td></tr>
  <tr><td>Fluoxetine</td><td>+</td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
  <tr><td>Mirtazapine</td><td>+</td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
  <tr><td>Quetiapine</td><td></td><td>+</td><td>+</td><td>+</td><td></td><td></td><td>+</td></tr>
  <tr><td>Risperidone</td><td></td><td>+</td><td>+</td><td>+</td><td>+</td><td></td><td>+</td></tr>
  <tr><td>Olanzapine</td><td></td><td>+</td><td>+</td><td>+</td><td></td><td></td><td></td></tr>
  <tr><td>Aripiprazole</td><td></td><td></td><td>+</td><td>+</td><td>+</td><td></td><td>+</td></tr>
  <tr><td>Clozapine</td><td></td><td></td><td>+</td><td></td><td></td><td></td><td></td></tr>
  <tr><td>Haloperidol</td><td></td><td>+</td><td>+</td><td>+</td><td></td><td></td><td>+</td></tr>
</table></div>
<div class="key"><strong class="k">หลักการรักษา BPSD</strong>เป็นการรักษาชั่วคราว ใช้ขนาดต่ำ ติดตามใกล้ชิด ปรับยาช้า ๆ และใช้ระยะเวลาสั้นที่สุด</div>
<h3>ยาที่ไม่ควรใช้ในผู้ป่วยสมองเสื่อม</h3>
<p>ทำให้ cognitive function และอาการทางจิตประสาทแย่ลง</p>
<ul>
  <li>Benzodiazepines และ sedative hypnotics อื่น</li>
  <li>Anticholinergics: trihexyphenidyl, benztropine, diphenhydramine, dimenhydrinate</li>
  <li>TCAs: amitriptyline, imipramine, clomipramine, doxepin</li>
  <li>Typical antipsychotics: thioridazine, chlorpromazine, perphenazine</li>
</ul>` },
  ],
  questions: [
    { q: 'ผู้ป่วยชายอายุ 72 ปี ได้รับการวินิจฉัยเป็นภาวะปริชานบกพร่องเล็กน้อย (mild cognitive impairment: MCI) ข้อใดเป็นคำแนะนำในการจัดการผู้ป่วยรายนี้ที่ถูกต้องที่สุด', o: ['เริ่มให้ donepezil ทันทีเพื่อป้องกันการเปลี่ยนเป็นโรคอัลไซเมอร์', 'แนะนำให้รับประทานน้ำมันปลา (fish oil) และวิตามินอี เพื่อช่วยบำรุงความจำ', 'แนะนำให้ออกกำลังกายอย่างสม่ำเสมอ อย่างน้อยสัปดาห์ละ 2 ครั้ง', 'เริ่ม memantine เพื่อชะลอการดำเนินของโรคในระยะยาว', 'ให้ piracetam เพื่อช่วยกระตุ้นการทำงานของเซลล์สมอง'], a: 2, e: 'แนวทางเวชปฏิบัติไม่แนะนำ galantamine, fish oil, vitamin E, piracetam, rivastigmine หรือ memantine ใน MCI เพราะหลักฐานไม่เพียงพอ แต่แนะนำปรับพฤติกรรม เช่น ออกกำลังกาย' },
    { q: 'ในการรักษาผู้ป่วยโรคอัลไซเมอร์ระยะปานกลางถึงรุนแรง ยาในข้อใดมีคำแนะนำให้ใช้', o: ['Donepezil หรือ memantine', 'Galantamine ร่วมกับ rivastigmine ชนิดแคปซูล', 'Donepezil ร่วมกับ ginkgo biloba extract', 'Rivastigmine patch สำหรับระยะเริ่มต้นเท่านั้น', 'Citicoline ร่วมกับ piracetam เพื่อเสริมฤทธิ์กัน'], a: 0, e: 'แนวทางเวชปฏิบัติแนะนำ donepezil หรือ rivastigmine patch ในระยะน้อยถึงรุนแรง และ memantine ในระยะปานกลางถึงรุนแรง · ไม่แนะนำ ChEIs ร่วมกันมากกว่า 1 ตัว' },
    { q: 'ข้อใดเป็นข้อควรระวังสำคัญหรือข้อห้ามใช้ในการใช้ยากลุ่ม cholinesterase inhibitors (ChEIs) ในผู้ป่วยสมองเสื่อม', o: ['ผู้ป่วยที่มีภาวะท้องผูกเรื้อรัง', 'ผู้ป่วยที่มีภาวะ sick sinus syndrome หรือ sinus bradycardia', 'ผู้ป่วยที่มีค่า GFR ต่ำกว่า 30 mL/min/1.73 m²', 'ผู้ป่วยที่มีอาการนอนไม่หลับ (insomnia)', 'ผู้ป่วยที่มีน้ำหนักตัวเกินมาตรฐาน (obesity)'], a: 1, e: 'ChEIs ทำให้หัวใจเต้นช้าลงได้ จึงต้องระวังในผู้ป่วยที่มีการนำไฟฟ้าหัวใจผิดปกติ' },
    { q: 'ผู้ป่วยโรคอัลไซเมอร์รายหนึ่งมีอาการซึมเศร้าร่วมด้วย ยาใดควรหลีกเลี่ยงเนื่องจากมีฤทธิ์ anticholinergic สูง ซึ่งอาจทำให้ cognitive function ถดถอยมากขึ้น', o: ['Sertraline', 'Escitalopram', 'Amitriptyline', 'Mirtazapine', 'Trazodone'], a: 2, e: 'Amitriptyline (TCA) มีฤทธิ์ anticholinergic สูงมาก ควรหลีกเลี่ยงในผู้สูงอายุและผู้ป่วยสมองเสื่อม เพราะรบกวน cognitive function และอาจทำให้สับสนเฉียบพลัน' },
    { q: 'ข้อใดคือหลักการสำคัญในการปรับสภาพแวดล้อมในบ้าน (environment modification) สำหรับผู้ป่วยสมองเสื่อมระยะน้อยถึงปานกลาง เพื่อลดอาการสับสน', o: ['เปลี่ยนตำแหน่งเฟอร์นิเจอร์หลักในบ้านบ่อย ๆ เพื่อกระตุ้นสมอง', 'จัดตารางเวลาและกิจกรรมในแต่ละวันให้คงที่และสม่ำเสมอ (routine)', 'ปิดไฟให้มืดสนิทตลอดทั้งวันเพื่อลดสิ่งกระตุ้นทางสายตา', 'จัดบ้านให้มีเสียงดังจากโทรทัศน์ตลอดเวลาเพื่อไม่ให้ผู้ป่วยเงียบเหงา', 'นำป้ายสัญลักษณ์หรือรูปภาพต่าง ๆ ออกจากผนังบ้านเพื่อลดความสับสน'], a: 1, e: 'ตารางเวลาและกิจกรรมที่คงที่ทุกวัน รวมถึงไม่เปลี่ยนตำแหน่งสิ่งของฉับพลัน ช่วยลดอาการสับสนและปัญหาพฤติกรรม' },
  ],
}
