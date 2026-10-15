// Peripheral neuropathy — converted from the RxTU10 class summary PDF (see content/summaries/manifest.json)
const fig = (f, cap, alt) => `<figure><img data-fig="neuropathy/${f}.webp" alt="${alt || cap}"><figcaption>${cap}</figcaption></figure>`

export default {
  id: 'neuropathy',
  date: '23/07/2026',
  refs: [
    'สมาคมการศึกษาเรื่องความปวดแห่งประเทศไทย. คำแนะนำเวชปฏิบัติในภาวะปวดเหตุพยาธิสภาพประสาท (Clinical guidance for neuropathic pain). 2020.',
    'Cleveland Clinic. Peripheral Neuropathy: What It Is, Symptoms & Treatment. 2022.',
    'Hammi C, Yeung B. Neuropathy. StatPearls Publishing; 2022.',
    'Jones MR, et al. Drug-induced peripheral neuropathy: a narrative review. Curr Clin Pharmacol. 2020;15(1):38–48.',
  ],
  sections: [
    { id: 'epi', t: 'Overview และระบาดวิทยา', html: `<p>ในเวชปฏิบัติ ภาวะปวดเหตุพยาธิสภาพประสาท (neuropathic pain) แบ่งตามสาเหตุ/บริบทได้ดังนี้</p>
<ul>
  <li>ร่วมกับโรคทางอายุรกรรมที่มีผลต่อระบบประสาท เช่น multiple sclerosis, diabetic neuropathy</li>
  <li>เกิดหลังโรคที่รอยโรคหายแล้ว เช่น postherpetic neuralgia</li>
  <li>หลังการบาดเจ็บของระบบประสาท เช่น spinal cord injury</li>
  <li>หลังการผ่าตัด เช่น post-mastectomy syndrome, phantom pain (หลัง amputation)</li>
  <li>ร่วมกับโรคเรื้อรังอื่น เช่น low back pain ที่มี sciatica, cancer-related neuropathic pain</li>
</ul>
<h3>ความชุก</h3>
<ul>
  <li>ประชากรทั่วไป 6.8–8.2% · ผู้ป่วยคลินิกระงับปวด 37.8–48% · ผู้ป่วยมะเร็ง 36%</li>
  <li>พบในเพศหญิงมากกว่าชาย ส่วนใหญ่วัยกลางคน</li>
</ul>
<div class="tbl"><table>
  <tr><th>กลุ่ม</th><th>โรค</th><th>ความชุก</th></tr>
  <tr><td rowspan="3">ระบบประสาทส่วนปลาย</td><td>Postherpetic neuralgia</td><td>10–15%</td></tr>
  <tr><td>Diabetic neuropathy</td><td>16–26%</td></tr>
  <tr><td>Low back pain</td><td>54.7%</td></tr>
  <tr><td rowspan="3">ระบบประสาทส่วนกลาง</td><td>Poststroke pain</td><td>8%</td></tr>
  <tr><td>Multiple sclerosis</td><td>27.5%</td></tr>
  <tr><td>Spinal cord injury</td><td>13–38%</td></tr>
  <tr><td>หลังผ่าตัด</td><td>Post-mastectomy syndrome</td><td>20%</td></tr>
</table></div>
<p><b>ผลกระทบ:</b> ปวดเรื้อรังกระทบคุณภาพชีวิตชัดเจน · อาการร่วมที่พบบ่อย ได้แก่ นอนไม่หลับ ขาดสมาธิ ซึมเศร้า วิตกกังวล เบื่ออาหาร · ค่ารักษาพยาบาลสูงกว่าผู้ที่ไม่มีภาวะนี้</p>` },
    { id: 'def', t: 'นิยาม การจำแนก และการวินิจฉัย', html: `<p><b>Neuropathic pain</b> คือความปวดที่เป็นผลโดยตรงจากพยาธิสภาพหรือโรคของ somatosensory system ส่วนใหญ่เรื้อรัง ลักษณะเช่น ปวดเสียวแปลบเหมือนไฟช็อต (lancinating) แสบร้อน (burning) ปวดเย็นเหมือนน้ำแข็ง ยิบ ๆ ซ่า ๆ (tingling) แปลบปลาบคล้ายเข็มตำ (pins and needles) คัน หรือสัมผัสผิดปกติ (paresthesia — ถ้ามากจนไม่พึงพอใจเรียก dysesthesia) · อาจเกิดเอง (spontaneous) หรือเกิดหลังการกระตุ้น (stimulus-dependent)</p>
${fig('p03-1', 'การจำแนก chronic neuropathic pain ตาม ICD-11: peripheral (trigeminal neuralgia, หลัง peripheral nerve injury, painful polyneuropathy, PHN, painful radiculopathy) และ central (spinal cord injury, brain injury, poststroke pain, multiple sclerosis)')}
<h3>การวินิจฉัย</h3>
<p><b>ประวัติที่ต้องซัก</b></p>
<ul>
  <li>ลักษณะความปวด (แต่ละคนอธิบายต่างกัน)</li>
  <li>อาการ/ความรู้สึกอื่นที่ไม่ใช่ความปวดที่พบร่วม</li>
  <li>ปัจจัยกระตุ้นหรือบรรเทา</li>
  <li>ลักษณะที่บ่งชี้ว่าปวดจากพยาธิสภาพประสาท ไม่ใช่จากการอักเสบหรือการทำลายเนื้อเยื่ออื่น</li>
  <li>ความสัมพันธ์ระหว่างรอยโรคกับความปวด ทั้งเวลาและตำแหน่ง เช่น ปวดแปลบเป็นพัก ๆ ใน trigeminal neuralgia</li>
</ul>
<p>หลักสำคัญ: <b>การกระจายของความปวดต้องสอดคล้องกับรอยโรคหรือโรคที่สงสัย</b></p>
${fig('p04-1', 'ขั้นตอนวินิจฉัย neuropathic pain: possible → probable → definite (ลักษณะตาม DN4 อย่างน้อย 4 ข้อ)')}
<div class="tbl"><table>
  <tr><th>ระดับ</th><th>เกณฑ์</th></tr>
  <tr><td>Probable neuropathic pain</td><td>ลักษณะปวด + ตำแหน่ง + รอยโรค/โรคที่สงสัยสอดคล้องกัน</td></tr>
  <tr><td>Definite neuropathic pain</td><td>Probable + มีการทดสอบยืนยัน (confirmatory tests) ว่าตำแหน่งและรอยโรคอธิบายอาการปวดได้</td></tr>
</table></div>
<p>Definite neuropathic pain ยืนยันเพียงว่าลักษณะปวดเข้ากับ neuropathic pain แต่ไม่ได้บอกสาเหตุที่แท้จริงของโรค</p>` },
    { id: 'risk', t: 'สาเหตุ ปัจจัยเสี่ยง และพยาธิสรีรวิทยา', html: `<div class="tbl"><table>
  <tr><th>กลุ่มสาเหตุ</th><th>ตัวอย่าง</th></tr>
  <tr><td><b>เมตาบอลิก (พบบ่อยที่สุด)</b></td><td>เบาหวาน — น้ำตาลสูงเรื้อรังทำลายหลอดเลือดเล็กที่เลี้ยงเส้นประสาท</td></tr>
  <tr><td>แอลกอฮอล์</td><td>Alcohol use disorder — ทำลายเส้นประสาทโดยตรง และ/หรือทำให้ขาดวิตามิน</td></tr>
  <tr><td>ขาดสารอาหาร/วิตามิน</td><td>ทองแดง, วิตามิน B1, B6, B9 (folic acid), B12, E</td></tr>
  <tr><td>Paraproteinemia</td><td>Multiple myeloma</td></tr>
  <tr><td>สารพิษ</td><td>โลหะหนัก สารเคมีอุตสาหกรรม</td></tr>
  <tr><td>ยา</td><td>เคมีบำบัด ยาปฏิชีวนะบางชนิด</td></tr>
  <tr><td>ภูมิคุ้มกัน/การอักเสบ</td><td>Guillain-Barré syndrome, lupus, vasculitis</td></tr>
  <tr><td>การติดเชื้อ</td><td>HIV, งูสวัด (shingles), โรคเรื้อน (leprosy)</td></tr>
  <tr><td>โรคไต/ตับเรื้อรัง</td><td>การสะสมของสารพิษในร่างกาย</td></tr>
  <tr><td>การกดทับเส้นประสาท</td><td>บวม หมอนรองกระดูกเคลื่อน เนื้องอก</td></tr>
  <tr><td>การบาดเจ็บโดยตรง</td><td>อุบัติเหตุ การผ่าตัด</td></tr>
  <tr><td>โรคทางพันธุกรรม</td><td>Amyloidosis, Fabry disease, Charcot-Marie-Tooth disease</td></tr>
  <tr><td>ไม่ทราบสาเหตุ</td><td>Idiopathic neuropathy</td></tr>
</table></div>
<p><b>ปัจจัยเสี่ยงโดยรวม:</b> อายุมากขึ้น · มีโรคหรือภาวะที่เป็นสาเหตุตามตาราง</p>
<h3>Pathophysiology</h3>
<p>การบาดเจ็บของเส้นประสาทส่วนปลายมี 3 รูปแบบหลัก</p>
<ol>
  <li>การทำลายไมอีลิน (demyelination)</li>
  <li>Wallerian degeneration จากการบาดเจ็บโดยตรง</li>
  <li>Axonal degeneration แบบ <b>dying-back</b> — พบบ่อยที่สุด สัมพันธ์กับโรคเมตาบอลิกอย่างเบาหวาน</li>
</ol>` },
    { id: 'tx', t: 'แนวทางการรักษา', html: `${fig('p07-1', 'แนวทางการรักษา neuropathic pain (สมาคมการศึกษาเรื่องความปวดแห่งประเทศไทย)')}
<ul>
  <li><b>ตอบสนองดี:</b> VAS/NRS ลดเหลือ ≤ 3/10 หรือคุณภาพชีวิตดีขึ้น และทนผลข้างเคียงได้ → รักษาต่อ (ถ้าคุมได้ดีนานอาจค่อย ๆ ลดยา)</li>
  <li><b>ตอบสนองบางส่วน:</b> VAS/NRS ยัง ≥ 4/10 หลังรักษาที่เหมาะสม 4–6 สัปดาห์ หรือยังกระทบคุณภาพชีวิต → ปรับยา และ/หรือเพิ่มการรักษาที่ไม่ใช้ยา</li>
  <li><b>ไม่ตอบสนอง:</b> ลดลง &lt; 30% หลัง 4–6 สัปดาห์ และยังกระทบคุณภาพชีวิต → ถ้าใช้ first-line เดี่ยวหรือร่วมกันแล้วไม่ได้ผล ส่งต่อผู้เชี่ยวชาญ</li>
  <li>ช่วงแรกของการให้ยาควรประเมินค่อนข้างถี่</li>
</ul>
<h3>เลือกยาตามโรคร่วม</h3>
<div class="tbl"><table>
  <tr><th>Positive comorbidities</th><th>Negative comorbidities</th></tr>
  <tr><td><ul>
    <li>ซึมเศร้า → TCAs, SNRIs</li>
    <li>วิตกกังวล → pregabalin, SNRIs</li>
    <li>นอนไม่หลับ → TCAs, gabapentin, pregabalin</li>
  </ul></td><td><ul>
    <li>โรคหัวใจ → เลี่ยง TCAs</li>
    <li>ความดันสูง → ระวัง TCAs, SNRIs</li>
    <li>โรคตับ โรคไต → มีผลต่อการปรับขนาด</li>
    <li>Gait instability → ระวัง TCAs, gabapentin, pregabalin, opioids</li>
    <li>โรคลมชัก สมองเสื่อม ต่อมลูกหมากโต ต้อหินมุมปิด → เลี่ยง TCAs</li>
  </ul></td></tr>
</table></div>
<h3>First-line</h3>
<div class="tbl"><table>
  <tr><th>ยา</th><th>กลไก</th><th>ขนาด</th><th>ADR สำคัญ</th><th>ข้อควรระวัง</th><th>ทั่วไป</th><th>มีโรคร่วม</th></tr>
  <tr><td colspan="7"><b>Tricyclic antidepressants (TCAs)</b></td></tr>
  <tr><td>Amitriptyline</td><td rowspan="2">Enhance descending inhibitory pain pathway</td><td rowspan="2">10–75 mg/วัน</td><td rowspan="2">ง่วง หัวใจเต้นเร็ว anticholinergic น้ำหนักเพิ่ม</td><td rowspan="2">ระวังในผู้สูงอายุ สมองเสื่อม โรคหัวใจ และผู้ที่ต้องระวังผล anticholinergic</td><td>++</td><td>−− ในผู้สูงอายุ สมองเสื่อม โรคหัวใจ ต่อมลูกหมากโต ต้อหินมุมปิด โรคลมชัก</td></tr>
  <tr><td>Nortriptyline</td><td>+ (ไม่เกิน 75 mg/วัน)</td><td>− ในกลุ่มเดียวกัน</td></tr>
  <tr><td colspan="7"><b>Calcium channel α2δ1 ligands</b></td></tr>
  <tr><td>Gabapentin</td><td rowspan="2">Block α2δ1 subunit ของ calcium channel</td><td>300–2,400 mg/วัน</td><td rowspan="2">ง่วง วิงเวียน peripheral edema</td><td rowspan="2">ลดขนาดในไตบกพร่อง (ขับทางไตในรูปเดิม)</td><td>+</td><td rowspan="2">++ ในผู้สูงอายุ สมองเสื่อม โรคหัวใจ ต่อมลูกหมากโต ต้อหินมุมปิด</td></tr>
  <tr><td>Pregabalin</td><td>75–600 mg/วัน</td><td>+</td></tr>
  <tr><td colspan="7"><b>SNRIs</b></td></tr>
  <tr><td>Duloxetine</td><td>Enhance descending inhibitory pain pathway</td><td>30–60 mg/วัน</td><td>คลื่นไส้ ใจสั่น ความดันเพิ่ม ท้องผูก</td><td>ระวังในโรคหัวใจ · ไม่ใช้ร่วม tramadol (serotonin syndrome)</td><td>+</td><td>+/− ในความดันสูงที่คุมไม่ได้</td></tr>
</table></div>
<h3>Second-line</h3>
<div class="tbl"><table>
  <tr><th>ยา</th><th>กลไก</th><th>ขนาด</th><th>ADR สำคัญ</th><th>ข้อควรระวัง</th><th>ทั่วไป</th><th>มีโรคร่วม</th></tr>
  <tr><td>Tramadol (weak opioid)</td><td>Weak μ agonist + enhance descending inhibitory pathway</td><td>50–400 mg/วัน</td><td>คลื่นไส้ อาเจียน ท้องผูก วิงเวียน ง่วง ชักง่ายขึ้น</td><td>เลี่ยงในโรคลมชักและการใช้ร่วม SSRIs/SNRIs · ลดขนาดในไตบกพร่อง</td><td>+</td><td>+/− ในโรคลมชัก ผู้ใช้ SSRIs, SNRIs, TCAs</td></tr>
  <tr><td>Venlafaxine (SNRI)</td><td>Enhance descending inhibitory pathway</td><td>75–150 mg/วัน</td><td>คลื่นไส้ ใจสั่น ความดันเพิ่ม ท้องผูก</td><td>ระวังในโรคหัวใจ · ไม่ใช้ร่วม tramadol</td><td>+</td><td>+/− ในความดันสูงที่คุมไม่ได้</td></tr>
  <tr><td>Carbamazepine*</td><td rowspan="2">Block sodium channel</td><td>200–1,200 mg/วัน</td><td>คลื่นไส้ อาเจียน เวียนศีรษะ เห็นภาพซ้อน</td><td>โซเดียมในเลือดต่ำ โดยเฉพาะผู้ใช้ยาขับปัสสาวะ</td><td rowspan="2">+</td><td rowspan="2">++ first-line เฉพาะ trigeminal neuralgia · − ในโรคตับ โรคไขกระดูก</td></tr>
  <tr><td>Oxcarbazepine*</td><td>300–1,800 mg/วัน</td><td>ผลข้างเคียงโดยรวมน้อยกว่า carbamazepine</td><td></td></tr>
</table></div>
<p>* ยาหลักของ trigeminal neuralgia · ก่อนเริ่ม carbamazepine และ oxcarbazepine ต้องตรวจ <mark>HLA-B*15:02</mark> เพื่อป้องกัน SJS/TEN</p>
<h3>การรักษาในโรคที่จำเพาะ</h3>
<div class="tbl"><table>
  <tr><th>โรค</th><th>อาการ</th><th>ยา</th></tr>
  <tr><td><b>Trigeminal neuralgia</b></td><td>ปวดที่ช่องปากและใบหน้าตามแขนงเส้นประสาทสมองคู่ที่ 5 · ปวดรุนแรงเป็นพัก ๆ แปลบเหมือนไฟช็อต · กระตุ้นด้วยการสัมผัสเบา ๆ การพูด การกินข้าว</td><td><b>1st line: carbamazepine</b> (ไม่ได้ผล/ทนไม่ได้ → oxcarbazepine) · ตรวจ HLA-B*15:02 ก่อนเริ่มยา · 2nd line: lamotrigine, baclofen, gabapentin, phenytoin</td></tr>
  <tr><td><b>Diabetic polyneuropathy</b></td><td>ชา ปวดแสบร้อนที่เท้าทั้ง 2 ข้าง</td><td>TCAs (amitriptyline, nortriptyline) · duloxetine · gabapentin, pregabalin · ไม่ได้ผล → tramadol · อื่น ๆ เช่น topical capsaicin 0.075%</td></tr>
  <tr><td><b>Postherpetic neuralgia</b></td><td>ปวดตาม dermatome เช่น ปวดแปลบ แสบร้อน ตื้อ คัน</td><td>TCAs · gabapentin, pregabalin · อาจใช้ tramadol ร่วม · topical capsaicin 0.075% · 5% lidocaine patch</td></tr>
</table></div>` },
    { id: 'dipn', t: 'Drug-induced peripheral neuropathy', html: `<ul>
  <li><b>Chemotherapy:</b> vincristine, paclitaxel, cisplatin</li>
  <li><b>Antibiotics:</b> isoniazid (ให้ vitamin B6 / pyridoxine ป้องกันได้), metronidazole</li>
  <li><b>Anticonvulsants:</b> phenytoin (ขนาดสูง)</li>
  <li><b>Antivirals:</b> stavudine, didanosine, zidovudine</li>
  <li><b>Cardiovascular:</b> amiodarone</li>
</ul>` },
  ],
  questions: [
    { q: 'สาเหตุของ peripheral neuropathy ในข้อใดจัดอยู่ในกลุ่ม "เมตาบอลิก" ซึ่งเป็นกลุ่มสาเหตุที่พบบ่อยที่สุด', o: ['Guillain-Barré syndrome', 'Amyloidosis', 'เบาหวาน (น้ำตาลสูงเรื้อรังทำลายหลอดเลือดเล็กที่เลี้ยงเส้นประสาท)', 'Multiple myeloma', 'HIV'], a: 2, e: 'กลุ่มเมตาบอลิก (พบบ่อยที่สุด) คือเบาหวาน · GBS อยู่ในกลุ่มภูมิคุ้มกัน/การอักเสบ · amyloidosis กลุ่มพันธุกรรม · multiple myeloma กลุ่ม paraproteinemia · HIV กลุ่มการติดเชื้อ' },
    { q: 'ผู้ป่วย diabetic polyneuropathy ที่ปวดขาแสบปวดร้อนทั้งสองข้าง มีโรคร่วมเป็นโรคซึมเศร้าและนอนไม่หลับ ยาใดเหมาะสมที่สุดเป็นอันดับแรก เนื่องจากได้ประโยชน์ต่อโรคร่วมด้วย', o: ['Carbamazepine', 'Amitriptyline (TCA)', 'Venlafaxine', 'Tramadol', 'Oxcarbazepine'], a: 1, e: 'TCAs ได้ประโยชน์เพิ่มในผู้ที่มีซึมเศร้าและนอนไม่หลับ (gabapentin/pregabalin ช่วยนอนไม่หลับแต่ไม่ครอบคลุมซึมเศร้า) และเป็นยาแนะนำใน diabetic polyneuropathy · carbamazepine/oxcarbazepine เป็นยาหลักของ trigeminal neuralgia · venlafaxine เป็น second-line · tramadol ใช้เมื่อยาอื่นไม่ได้ผลและต้องระวัง serotonin syndrome' },
    { q: 'ยากลุ่ม calcium channel α2δ ligands ที่ใช้เป็น first-line ในการรักษา neuropathic pain ได้แก่ยาในข้อใด', o: ['Amitriptyline และ nortriptyline', 'Tramadol และ lidocaine patch', 'Duloxetine และ venlafaxine', 'Carbamazepine และ oxcarbazepine', 'Gabapentin และ pregabalin'], a: 4, e: 'First-line มี 3 กลุ่ม: TCAs (amitriptyline, nortriptyline) · α2δ1 ligands (gabapentin, pregabalin) · SNRIs (duloxetine) · carbamazepine/oxcarbazepine (Na⁺ channel blockers) และ tramadol อยู่ใน second-line' },
    { q: 'ก่อนเริ่มยา carbamazepine หรือ oxcarbazepine ในการรักษา trigeminal neuralgia ควรตรวจคัดกรองทางพันธุกรรมชนิดใด เพื่อป้องกันภาวะแทรกซ้อนทางผิวหนังที่รุนแรง', o: ['HLA-B*57:01', 'HLA-B*15:02', 'HLA-A*31:01', 'CYP2C9*3', 'G6PD deficiency screening'], a: 1, e: 'ตรวจ HLA-B*15:02 ก่อนเริ่ม carbamazepine และ oxcarbazepine เพื่อป้องกัน SJS/TEN ซึ่งเสี่ยงสูงในประชากรเอเชีย' },
    { q: 'ผู้ป่วย active pulmonary TB ได้รับ isoniazid เริ่มมีอาการชาปลายมือปลายเท้าหลังใช้ยาหลายสัปดาห์ ข้อใดอธิบายกลไกและการป้องกันได้ถูกต้องที่สุด', o: ['Isoniazid รบกวนการสร้าง pyridoxine (vitamin B6) ในร่างกาย จึงควรให้ vitamin B6 เสริมเพื่อป้องกัน peripheral neuropathy', 'Isoniazid ทำลายปลอกไมอีลินโดยตรง ป้องกันได้ด้วยการให้ folic acid เสริม', 'Isoniazid ทำให้ขาดวิตามิน B12 โดยตรง จึงควรให้ B12 เสริม', 'Isoniazid ไม่มีความสัมพันธ์กับ peripheral neuropathy ต้องมองหาสาเหตุอื่นเสมอ', 'Isoniazid ทำให้เกิด peripheral neuropathy ผ่านกลไกการกดทับเส้นประสาทจากการอักเสบ'], a: 0, e: 'Isoniazid รบกวน metabolism/activation ของ pyridoxine ทำให้พร่อง B6 แบบ functional จึงให้ vitamin B6 ป้องกันได้ · B9 และ B12 ไม่เกี่ยวกับกลไกนี้' },
  ],
}
