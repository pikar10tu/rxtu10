// Substance use disorders (drug and alcohol) — converted from the RxTU10 class summary PDF (see content/summaries/manifest.json)
// PDF text layer แมปสระ/วรรณยุกต์เป็นตัวอังกฤษ → เขียนใหม่และตรวจกับภาพหน้า
export default {
  id: 'substance',
  date: '26/06/2026',
  refs: [
    'American Society of Addiction Medicine. What is the Definition of Addiction.',
    'Mosel S. What is a Substance Use Disorder (SUD)? American Addiction Centers; 2025.',
    'สถาบันบำบัดรักษาและฟื้นฟูผู้ติดยาเสพติดแห่งชาติบรมราชชนนี กรมการแพทย์. แนวปฏิบัติในการดูแลผู้ป่วยที่มีภาวะขาดแอลกอฮอล์. พิมพ์ครั้งที่ 3. 2567.',
    'สถาบันบำบัดรักษาและฟื้นฟูผู้ติดยาเสพติดแห่งชาติบรมราชชนนี กรมการแพทย์. แนวปฏิบัติการดูแลผู้ป่วยภาวะขาดสุรา. 2558.',
    'American Psychiatric Association. Diagnostic and Statistical Manual of Mental Disorders (DSM-5-TR). 2022.',
    'Mar Y, et al. Treatment of Alcohol Use Disorder. Johns Hopkins University; 2023.',
    'Ghanavatian S, Derian A. Baclofen. StatPearls Publishing; 2024.',
  ],
  sections: [
    { id: 'def', t: 'นิยามและการวินิจฉัย', html: `<p>ภาวะติดสารเสพติดและแอลกอฮอล์ (alcohol use disorder, AUD) พบบ่อยและเป็นปัญหาระดับโลก ถือเป็น<b>โรคเรื้อรังทางสมองที่รักษาได้</b> เกี่ยวข้องกับวงจรสมองด้าน reward, motivation และ memory ร่วมกับพันธุกรรมและสิ่งแวดล้อม · ลักษณะสำคัญคือควบคุมพฤติกรรมไม่ได้ งดดื่มไม่ได้ อยากรุนแรง (craving) และกลับไปดื่มซ้ำ (relapse)</p>
<h3>นิยามตาม ASAM</h3>
<ul>
  <li><b>Substance use disorder:</b> รูปแบบการใช้สารเสพติด (รวมแอลกอฮอล์หรือยาอื่น) ซ้ำ ๆ จนเกิดความบกพร่องทางคลินิกและพฤติกรรม</li>
  <li><b>Addiction:</b> โรคเรื้อรังที่รักษาได้ เกี่ยวกับวงจรสมอง พันธุกรรม สิ่งแวดล้อม และประสบการณ์ชีวิต · ใช้สารหรือมีพฤติกรรมที่ควบคุมไม่ได้ (compulsive)</li>
</ul>
<h3>DSM-5</h3>
<p>รวมคำว่า substance abuse และ substance dependence เป็น <b>substance use disorder (SUD)</b> เพื่อเน้นว่าเป็นโรคเรื้อรัง · วินิจฉัยเมื่อมี<b>อย่างน้อย 2 ใน 11 ข้อ ในช่วง 12 เดือน</b></p>
<div class="tbl"><table>
  <tr><th>กลุ่ม</th><th>เกณฑ์</th></tr>
  <tr><td><b>Impaired control</b></td><td>1. ใช้มากหรือนานกว่าที่ตั้งใจ · 2. พยายามเลิกหรือลดแต่ไม่สำเร็จ · 3. ใช้เวลามากในการหา ใช้ หรือฟื้นจากสาร · 4. อยากรุนแรง (craving)</td></tr>
  <tr><td><b>Social impairment</b></td><td>5. ใช้จนเสียหน้าที่การงาน/การเรียน · 6. ยังใช้แม้มีปัญหาความสัมพันธ์หรือสังคม · 7. ลดหรือเลิกกิจกรรมทางสังคม/อาชีพ</td></tr>
  <tr><td><b>Risky use</b></td><td>8. ใช้ในสถานการณ์ที่อาจเกิดอันตราย · 9. ยังใช้แม้รู้ว่าทำให้เกิดปัญหาทางกายหรือใจ</td></tr>
  <tr><td><b>Pharmacological indicators</b></td><td>10. Tolerance: ต้องเพิ่มปริมาณเพื่อให้ได้ผลเท่าเดิม · 11. Withdrawal: มีอาการเมื่อไม่ได้ใช้ หรือต้องใช้เพื่อระงับอาการถอน</td></tr>
</table></div>
<p><b>Severity:</b> mild 2–3 ข้อ · moderate 4–5 ข้อ · severe ≥ 6 ข้อ</p>` },
    { id: 'aws', t: 'ภาวะขาดแอลกอฮอล์ (alcohol withdrawal)', html: `<h3>ปัจจัยเสี่ยง</h3>
<ol>
  <li>อายุ &gt; 30 ปี</li>
  <li>ดื่มต่อเนื่องปริมาณมาก (&gt; 150 g/วัน หรือ &gt; 10 ดื่มมาตรฐาน/วัน ≈ เหล้าขาว 40 ดีกรี ครึ่งถึง 1 ขวด/วัน)</li>
  <li>ดื่มติดต่อกันหลายปี (&gt; 5 ปี)</li>
  <li>เคยมี delirium tremens (DTs)</li>
  <li>เคยชักจากการขาดแอลกอฮอล์</li>
  <li>เริ่มมีอาการขาดขณะระดับแอลกอฮอล์ในเลือดยังสูง</li>
  <li>หยุดดื่มครั้งสุดท้ายมาแล้วหลายวัน</li>
  <li>มีโรคทางกายร่วม หรือบาดเจ็บ/อุบัติเหตุร่วม</li>
  <li>ไม่มีอาการเมาทั้งที่ระดับแอลกอฮอล์สูง (tolerance สูง)</li>
  <li>ใช้สารเสพติดอื่นร่วม รวมถึงยากล่อมประสาทหรือยานอนหลับต่อเนื่อง</li>
  <li>สัญญาณชีพผิดปกติ โดยเฉพาะชีพจร &gt; 100 ครั้ง/นาที</li>
</ol>
<h3>Pathophysiology</h3>
<ol>
  <li><b>Acute intake:</b> แอลกอฮอล์เพิ่มการทำงานของ GABA (GABA-A) → ผ่อนคลาย ง่วง และยับยั้ง glutamate (NMDA)</li>
  <li><b>Chronic intake (neuroadaptation):</b> <mark>downregulation ของ GABA-A และ upregulation ของ NMDA</mark> · เพิ่มการเปิด voltage-dependent Ca²⁺ channel · adrenergic receptor ที่ limbic และก้านสมองไวขึ้น → ต้องดื่มมากขึ้นเพื่อได้ฤทธิ์เท่าเดิม</li>
  <li><b>Withdrawal:</b> หยุดหรือลดการดื่มกะทันหัน ฤทธิ์กดประสาทหายไป → ระบบประสาทอัตโนมัติตื่นตัวผิดปกติ (hyperactivity): มือสั่น เหงื่อแตก ชีพจรเร็ว กระวนกระวาย สับสน หูแว่ว ภาพหลอน</li>
</ol>
<h3>อาการทางคลินิก</h3>
<div class="tbl"><table>
  <tr><th>ภาวะ</th><th>เวลาหลังหยุดดื่ม</th><th>อาการ</th></tr>
  <tr><td><b>Minor / uncomplicated withdrawal</b></td><td>6–36 ชม.</td><td>มือสั่น (เห็นชัดเวลาเหยียดแขน) วิตกกังวล เหงื่อออก หัวใจเต้นเร็ว/ความดันสูงเล็กน้อย คลื่นไส้อาเจียน เบื่ออาหาร ปวดศีรษะ นอนไม่หลับ</td></tr>
  <tr><td><b>Withdrawal seizures</b></td><td>6–48 ชม.</td><td>มักเป็น generalized tonic-clonic ช่วงสั้น ๆ อาจชักซ้ำได้ · ถ้าเป็น focal seizure หรือ status epilepticus ให้สงสัยสาเหตุอื่น เช่น บาดเจ็บที่ศีรษะ เกลือแร่ผิดปกติ</td></tr>
  <tr><td><b>Alcoholic hallucinosis</b></td><td>12–48 ชม.</td><td>ภาพหลอนพบบ่อยที่สุด (เห็นแมลง สัตว์เล็ก คนแปลกหน้า) อาจมีหูแว่วหรือหลอนทางสัมผัส</td></tr>
  <tr><td><b>Delirium tremens (DTs)</b></td><td>48–96 ชม. (2–4 วัน) อาจนานถึง 1 สัปดาห์</td><td>Delirium: สับสนรุนแรง ไม่รู้วันเวลาสถานที่ หวาดระแวง หลอนแบบเชื่อว่าจริง · severe autonomic hyperactivity: ไข้สูง ชีพจรเร็วมาก (มัก &gt; 120) ความดันสูง หายใจเร็ว เหงื่อแตกชุ่ม</td></tr>
</table></div>` },
    { id: 'wd-tx', t: 'การรักษาระยะถอนพิษแอลกอฮอล์', html: `<p>เป้าหมาย: ป้องกันภาวะแทรกซ้อนรุนแรง (ชัก, DTs) และลดอาการขาดแอลกอฮอล์</p>
<h3>1. Benzodiazepines — first-line</h3>
<p>ทำให้สงบ คลายกังวล ต้านชัก ลดการกระตุ้นระบบประสาทอัตโนมัติ: diazepam, chlordiazepoxide, lorazepam · ให้ตามความรุนแรง (ประเมินด้วย CIWA-Ar) · ถ้าหวาดระแวง ประสาทหลอน หรือตอบสนองต่อ BZD ไม่ดี อาจให้ antipsychotic ร่วม เช่น haloperidol</p>
<div class="tbl"><table>
  <tr><th>Fixed-schedule regimen</th><th>Symptom-triggered regimen</th><th>IV loading</th></tr>
  <tr><td>ให้ทุก 6 ชม. (diazepam 5 mg)<br>D1–2: 2×3 & 3×hs<br>D3: 1×3 & 3×hs<br>D4: 1×2 & 3×hs<br>D5: 1×2 & 2×hs<br>D6: 1 OD & 2×hs<br>D7: 2×hs<br>D8: 1×hs</td>
  <td>ให้ตามความรุนแรง (AWS หรือ CIWA-Ar)<br><b>Moderate:</b> diazepam 5–10 mg slow IV prn ซ้ำได้ทุก 15–30 นาทีจนสงบ ไม่เกิน 4 doses ประเมินสัญญาณชีพและรายงานแพทย์ก่อนให้ทุกครั้ง<br><b>Severe:</b> มีประสาทหลอน เพิ่มยาที่แรงกว่า เช่น haloperidol IM</td>
  <td>ฉีดเข้าหลอดเลือดดำเพื่อควบคุมอาการให้เร็วที่สุด</td></tr>
  <tr><td>Moderate / severe</td><td>Moderate / severe</td><td>Very severe</td></tr>
</table></div>
<p>เทียบขนาด: <b>diazepam 5 mg = chlordiazepoxide 10 mg = lorazepam 1 mg</b></p>
<div class="tbl"><table>
  <tr><th>PK</th><th>Diazepam</th><th>Chlordiazepoxide</th><th>Lorazepam</th></tr>
  <tr><td>Absorption</td><td>ดีและเร็ว Tmax 1–2 ชม.</td><td>ดี Tmax 0.5–4 ชม.</td><td>ดี Tmax 1–6 ชม.</td></tr>
  <tr><td>Protein binding</td><td>98%</td><td>96%</td><td>85%</td></tr>
  <tr><td>Metabolism</td><td>CYP3A4, CYP2C19 → active metabolite desmethyldiazepam (t½ 50–100 ชม.)</td><td>ผ่านตับ</td><td><mark>Glucuronide conjugation → inactive metabolite</mark></td></tr>
  <tr><td>Elimination</td><td>ไต</td><td>ไต ในรูป glucuronide ของ oxazepam</td><td>ไต</td></tr>
</table></div>
<h3>2. วิตามินและเกลือแร่</h3>
<ul>
  <li><b>Thiamine (vitamin B1)</b> 100 mg IM (หรือรับประทาน) จำเป็นต้องให้ เพื่อป้องกัน Wernicke-Korsakoff syndrome</li>
  <li>วิตามินบีรวม และ folic acid แก้ภาวะขาดสารอาหาร</li>
  <li>ปรับเกลือแร่ที่ผิดปกติ เช่น โพแทสเซียม แมกนีเซียม</li>
</ul>` },
    { id: 'aud-tx', t: 'ยารักษาภาวะติดแอลกอฮอล์', html: `<p>หลังผ่านระยะถอนพิษ ใช้ยาลดความอยากดื่ม (anti-craving) และป้องกันการกลับไปดื่มซ้ำ</p>
<ul>
  <li><b>Naltrexone:</b> ลดความอยากดื่มและลดความรู้สึกเป็นสุข (euphoria) เมื่อดื่ม</li>
  <li><b>Acamprosate:</b> ปรับสมดุลสารสื่อประสาท ลดความตึงเครียดและความอยากดื่ม</li>
  <li><b>Disulfiram:</b> ทำให้เกิดอาการทรมาน (คลื่นไส้ อาเจียน ใจสั่น หน้าแดง) เมื่อดื่ม เพื่อให้หลีกเลี่ยงการดื่ม · ในไทยไม่ค่อยนิยมเพราะผลข้างเคียงสูง และห้ามใช้ในตับแข็ง</li>
  <li><b>Baclofen:</b> นิยมใช้ลดความอยากดื่ม ได้ผลดีและปลอดภัย โดยเฉพาะผู้ป่วยตับแข็ง</li>
  <li><b>Topiramate</b> ใช้ได้อีกทางเลือกหนึ่ง</li>
</ul>
<div class="tbl"><table>
  <tr><th></th><th>Acamprosate</th><th>Naltrexone</th><th>Disulfiram</th></tr>
  <tr><td>MOA</td><td>Modulate GABA และ NMDA transmission ปรับสมดุลระบบประสาท</td><td>Opioid receptor antagonist</td><td>ยับยั้ง aldehyde dehydrogenase → acetaldehyde ในเลือดสูง เกิด disulfiram-ethanol reaction</td></tr>
  <tr><td>Initial dose</td><td>666 mg TID</td><td>50 mg OD</td><td>500 mg OD 1–2 สัปดาห์ แล้วลดเป็น 250 mg OD · เริ่มหลังดื่มครั้งสุดท้ายอย่างน้อย 12 ชม.</td></tr>
  <tr><td>Hepatic / renal</td><td>ปรับขนาดเมื่อ CrCl 30–50 mL/min</td><td>ระวังในโรคตับ ตรวจค่าตับ baseline · ระวังเมื่อ LFT 3–5 เท่า ULN</td><td>ตรวจค่าตับ baseline · เลี่ยงเมื่อ AST/ALT &gt; 3–5 เท่า ULN</td></tr>
  <tr><td>Contraindication</td><td><mark>CrCl หรือ eGFR &lt; 30</mark></td><td>ผู้ที่ติดหรือใช้ opioid</td><td>Severe myocardial disease, coronary occlusion, psychoses · ห้ามใช้ร่วม metronidazole, alcohol หรือผลิตภัณฑ์ที่มี alcohol</td></tr>
  <tr><td>Side effects</td><td>Diarrhea</td><td>คลื่นไส้ อาเจียน ปวดท้อง ท้องเสีย มึนงง</td><td>Disulfiram-ethanol reaction: tachycardia, N/V, flushing, diaphoresis</td></tr>
</table></div>
<p style="font-size:.9em">ต้นฉบับเขียนว่าให้ disulfiram "ภายใน 12 ชั่วโมงหลังดื่มสุราครั้งสุดท้าย" แต่ต้องเว้นอย่างน้อย 12 ชั่วโมงหลังดื่มครั้งสุดท้ายก่อนเริ่มยา จึงแก้ข้อความ</p>
<div class="tbl"><table>
  <tr><th></th><th>Topiramate</th><th>Gabapentin</th><th>Baclofen</th></tr>
  <tr><td>MOA</td><td>เพิ่ม GABAergic และยับยั้ง glutamatergic transmission</td><td>ปรับและ stabilize ระบบประสาท</td><td>GABA-B agonist</td></tr>
  <tr><td>Initial dose</td><td>25 mg OD</td><td>300 mg OD</td><td>10 mg TID นาน 12 สัปดาห์</td></tr>
  <tr><td>Hepatic / renal</td><td>ลดขนาดครึ่งหนึ่งเมื่อ CrCl ≤ 70 · ระวังในตับบกพร่อง</td><td>ลดขนาดในโรคไต</td><td>ระวังในโรคไต</td></tr>
  <tr><td>Contraindication</td><td>แพ้ยา</td><td>แพ้ยา</td><td>ระวังร่วมกับ opioid และในผู้ป่วย peptic ulcer</td></tr>
  <tr><td>Side effects</td><td>Paresthesia, cognitive impairment</td><td>Headache, insomnia, fatigue, muscle aches, GI</td><td>Sedation, confusion, muscle weakness, vertigo, nausea</td></tr>
</table></div>` },
  ],
  questions: [
    { q: 'กลไกการเกิดภาวะขาดสุรา (alcohol withdrawal state) เกิดจากการเปลี่ยนแปลงของตัวรับในสมองอย่างไร', o: ['Upregulation ของตัวรับ GABA-A และ downregulation ของตัวรับ NMDA', 'Downregulation ของตัวรับ GABA-A และ upregulation ของตัวรับ NMDA', 'Upregulation ของตัวรับ dopamine บริเวณก้านสมอง', 'แอลกอฮอล์ยับยั้งการเปิด voltage-dependent calcium channel อย่างถาวร'], a: 1, e: 'ดื่มต่อเนื่องนาน สมองปรับตัว (neuroadaptation) โดยลดการทำงานของ GABA-A และเพิ่มความไวของ NMDA · เมื่อหยุดดื่มกะทันหัน ฤทธิ์กดประสาทหายไป สมองเสียสมดุล ระบบประสาทอัตโนมัติตื่นตัวผิดปกติ' },
    { q: 'ผู้ป่วยชายหยุดดื่มสุรากะทันหันเพราะประสบอุบัติเหตุต้องเข้าโรงพยาบาล วันที่ 3 หลังหยุดดื่มมีอาการสับสนรุนแรง ไม่รู้วันเวลาและสถานที่ หวาดระแวง ไข้สูง ชีพจร 135 ครั้ง/นาที เหงื่อแตกชุ่มทั่วตัว อาการเข้าได้กับภาวะใดมากที่สุด', o: ['อาการขาดสุราระยะแรก (uncomplicated withdrawal)', 'อาการชักจากการขาดสุรา (alcohol withdrawal seizures)', 'อาการประสาทหลอน (alcoholic hallucinosis)', 'ภาวะเพ้อคลั่งสับสน (delirium tremens)'], a: 3, e: 'DTs เป็นภาวะแทรกซ้อนรุนแรง มักเกิด 48–96 ชม. (2–4 วัน) หลังหยุดดื่ม มี delirium (สับสนรุนแรง ไม่รู้วันเวลา หวาดระแวง) ร่วมกับ autonomic hyperactivity รุนแรง (ไข้สูง ชีพจร > 120 เหงื่อแตกชุ่ม)' },
    { q: 'ยากลุ่มใดเป็น first-line ในระยะถอนพิษแอลกอฮอล์ เพื่อทำให้ผู้ป่วยสงบลงและต้านการชัก', o: ['Antipsychotics เช่น haloperidol', 'Benzodiazepines เช่น diazepam', 'ยาลดความอยากดื่ม เช่น acamprosate', 'วิตามินบำรุงประสาท เช่น thiamine'], a: 1, e: 'Benzodiazepines เป็นยาหลักในระยะถอนพิษแอลกอฮอล์' },
    { q: 'ยารักษาภาวะติดแอลกอฮอล์ชนิดใดยับยั้งเอนไซม์ aldehyde dehydrogenase และห้ามใช้ในผู้ป่วยตับแข็ง', o: ['Naltrexone', 'Acamprosate', 'Disulfiram', 'Baclofen'], a: 2, e: 'Disulfiram ยับยั้ง aldehyde dehydrogenase ซึ่งเปลี่ยน acetaldehyde เป็น acetate' },
    { q: 'ผู้ป่วยชายอายุ 45 ปี เป็น alcohol use disorder ต้องการยาช่วยลดความอยากดื่ม มีโรคไตเรื้อรัง eGFR 25 mL/min/1.73 m² การทำงานของตับปกติ ยาใดมีข้อห้ามใช้ในผู้ป่วยรายนี้', o: ['Naltrexone', 'Acamprosate', 'Baclofen', 'Gabapentin'], a: 1, e: 'Acamprosate ห้ามใช้เมื่อ CrCl หรือ eGFR < 30 mL/min' },
  ],
}
