// Parkinson's disease — converted from the RxTU10 class summary PDF (see content/summaries/manifest.json)
// รูปอินโฟกราฟิกหน้า 2 มาจากเพจภายนอก จึงไม่นำขึ้นเว็บ (เนื้อหาเดียวกันอยู่ในส่วน Diagnosis แล้ว)
export default {
  id: 'parkinson',
  date: '26/07/2026',
  refs: [
    'คณะทำงานเฉพาะกิจเพื่อการจัดทำคู่มือการใช้ยารักษาโรคพาร์กินสันอย่างสมเหตุผลตามบัญชียาหลักแห่งชาติ. Thai National Formulary 2019: Drugs used in Parkinson\'s disease. สำนักงานคณะกรรมการอาหารและยา; 2562.',
    'พิทยศิริ ร, จิตรักนที อ, บรรณาธิการ. Thai National Formulary 2023: Drugs used in Parkinson\'s disease (ฉบับปรับปรุงครั้งที่ 1). สำนักงานคณะกรรมการอาหารและยา; 2566.',
    'ปาลเดชพงศ์ เดนหลา. Parkinson disease. คณะแพทยศาสตร์ศิริราชพยาบาล มหาวิทยาลัยมหิดล; 2564.',
  ],
  sections: [
    { id: 'overview', t: 'Overview', html: `<h3>Epidemiology</h3>
<ul>
  <li>โรคระบบประสาทเสื่อมที่พบบ่อยเป็นอันดับ 2 รองจาก Alzheimer's disease</li>
  <li>ความชุกประมาณ 0.5–1% ในอายุ 65–69 ปี และเพิ่มเป็น 1–3% ในอายุ ≥ 80 ปี</li>
</ul>
<h3>Definition</h3>
<ul>
  <li>โรคความผิดปกติของการเคลื่อนไหวจากระบบประสาทเสื่อมแบบก้าวหน้า</li>
  <li>สูญเสีย dopaminergic neurons ใน <b>substantia nigra pars compacta</b></li>
  <li>Pathological hallmark: alpha-synuclein จับกลุ่มผิดปกติในเซลล์ เกิด <b>Lewy bodies</b> และ Lewy neurites</li>
</ul>
<h3>Risk factors</h3>
<ul>
  <li><b>Genetics:</b> 10–15% มีประวัติครอบครัว · ยีน PARK family (23 ยีน), GBA1, SNCA (alpha-synuclein)</li>
  <li><b>Environmental:</b> ยาฆ่าแมลง โลหะหนัก การสูบบุหรี่ gut microbiota dysbiosis</li>
  <li><b>Drug-induced parkinsonism (DIP):</b> ยาที่ปิดกั้น dopamine receptor หรือทำให้ dopamine พร่อง เช่น typical/atypical antipsychotics · metoclopramide · flunarizine, cinnarizine</li>
</ul>
<h3>Diagnosis</h3>
<ol>
  <li><b>วินิจฉัยกลุ่มอาการ parkinsonism:</b> อย่างน้อย 2 ใน 6 อาการ โดย 1 อาการต้องเป็น tremor-at-rest หรือ bradykinesia
    <ul><li>Tremor-at-rest</li><li>Bradykinesia</li><li>Rigidity</li><li>Loss of postural reflexes</li><li>Flexed posture</li><li>Freezing</li></ul>
  </li>
  <li><b>คัดกรองแยกโรคอื่น (red flags):</b> stroke ซ้ำ ๆ · เคยได้ยาต้านโดปามีน · ไม่ตอบสนองต่อ levodopa ขนาดสูง (&gt; 1,000 mg/วัน) · อาการข้างเดียวนานเกิน 3 ปี · ความผิดปกติของ cerebellum/eye movement</li>
  <li><b>อาการสนับสนุน (≥ 3 ข้อ):</b> เริ่มข้างเดียวก่อน · rest tremor · อาการเพิ่มขึ้นตามเวลา · ตอบสนองดีต่อ levodopa (≥ 70%) · การรับกลิ่นลดลง · มีอาการยุกยิกจาก levodopa</li>
</ol>
<p>Secondary parkinsonism มีสาเหตุจากยา (neuroleptics, metoclopramide, cinnarizine, flunarizine) หลอดเลือด การติดเชื้อ หรือ metabolic disorders · นอกจากนี้ยังต้องแยก heredodegenerative parkinsonism และ multisystem degenerations (parkinsonism-plus)</p>` },
    { id: 'patho', t: 'Pathophysiology และอาการ', html: `<ul>
  <li><b>Dopaminergic neuron degeneration:</b> สูญเสียเซลล์สร้าง dopamine ใน SNpc แบบก้าวหน้า</li>
  <li><b>Dopamine depletion:</b> dopamine ใน striatum (caudate nucleus, putamen) ลดลงมาก รบกวนวงจรควบคุมการเคลื่อนไหวใน basal ganglia</li>
  <li><b>Alpha-synuclein misfolding:</b> สะสมเป็น Lewy bodies และ Lewy neurites</li>
  <li><b>Braak staging hypothesis:</b> เริ่มที่ enteric nervous system หรือ olfactory bulb แล้วลามผ่าน vagus nerve ขึ้นสู่ brainstem, midbrain และ cerebral cortex</li>
  <li><b>Neurotransmitter imbalance:</b> dopamine ขาด → acetylcholine เด่นขึ้นโดยเปรียบเทียบ ทำให้อาการเคลื่อนไหวแย่ลง</li>
</ul>
<h3>Clinical presentation</h3>
<ul>
  <li><b>Motor:</b> bradykinesia, rest tremor, rigidity, postural instability</li>
  <li><b>Non-motor:</b> autonomic dysfunction, neuropsychiatric symptoms, sleep disorders</li>
</ul>
<h3>Hoehn and Yahr staging</h3>
<div class="tbl"><table>
  <tr><th>Stage</th><th>ลักษณะ</th></tr>
  <tr><td class="num">1</td><td>ข้างเดียว มักไม่มีหรือมีความบกพร่องน้อย</td></tr>
  <tr><td class="num">1.5</td><td>ข้างเดียวและ axial</td></tr>
  <tr><td class="num">2</td><td>สองข้างหรือแนวกลาง ไม่มีปัญหาการทรงตัว</td></tr>
  <tr><td class="num">2.5</td><td>สองข้างเล็กน้อย ทรงตัวกลับได้ใน pull test</td></tr>
  <tr><td class="num">3</td><td>สองข้างเล็กน้อย–ปานกลาง มี postural instability บ้าง ยังช่วยเหลือตัวเองได้</td></tr>
  <tr><td class="num">4</td><td>พิการรุนแรง ยังเดิน/ยืนเองได้ แต่ทำกิจกรรมได้จำกัดมาก</td></tr>
  <tr><td class="num">5</td><td>ติดรถเข็นหรือติดเตียงหากไม่มีคนช่วย</td></tr>
</table></div>
<h3>MDS-UPDRS</h3>
<ul>
  <li>Part I: non-motor experiences of daily living</li>
  <li>Part II: motor experiences of daily living</li>
  <li>Part III: motor examination (แพทย์ตรวจ)</li>
  <li>Part IV: motor complications (dyskinesia, motor fluctuation เช่น "off" time)</li>
</ul>` },
    { id: 'drugs', t: 'ยารักษาโรคพาร์กินสัน', html: `<div class="key"><strong class="k">Symptomatic only</strong>ยังไม่มียาที่หยุดหรือย้อนการดำเนินโรค · เป้าหมายคือคุมอาการ motor/non-motor เพิ่มคุณภาพชีวิต และลด motor complications จากยา</div>
<h3>Levodopa + DDCI (carbidopa/benserazide)</h3>
<p>Levodopa ถูกเปลี่ยนเป็น dopamine ใน presynaptic neuron · DDCI ยับยั้งการเปลี่ยนที่ส่วนปลาย ทำให้ levodopa เข้าสมองได้มากขึ้นและลดผลข้างเคียงส่วนปลาย</p>
<div class="tbl"><table>
  <tr><th>ADR</th><th>ข้อควรระวัง</th><th>Drug interaction</th></tr>
  <tr><td><b>ระยะแรก:</b> คลื่นไส้อาเจียน มึนศีรษะ ปวดศีรษะ ง่วง orthostatic hypotension<br><b>ระยะยาว:</b> motor complications (wearing-off, dyskinesia) เฉลี่ย 10%/ปี</td>
  <td>เลี่ยงกินพร้อมอาหารโปรตีนสูง — กินก่อนอาหาร ≥ 30 นาที หรือหลังอาหาร 1–2 ชม. · <mark>ห้ามหยุดยาทันที</mark> เสี่ยงอาการคล้าย NMS (ตัวแข็ง ไข้สูง ความดันสูง) · ขนาดเริ่มต้นระยะแรกไม่ควรเกิน 300–400 mg/วัน</td>
  <td>ธาตุเหล็กลดการดูดซึมได้ถึง 50% (chelation) ควรห่าง ≥ 2 ชม. · โปรตีนแย่งดูดซึมผ่าน large neutral amino acid transporter · ยาต้านโดปามีน (metoclopramide, prochlorperazine) ลดฤทธิ์</td></tr>
</table></div>
<h3>Dopamine agonists</h3>
<p>กระตุ้น dopamine receptor ที่ striatal postsynaptic neuron โดยตรง · ergot (bromocriptine) และ non-ergot (pramipexole, ropinirole, rotigotine, piribedil, apomorphine) — <b>เลือก non-ergot ก่อนเสมอ</b> เพราะ ergot เสี่ยงพังผืดที่ลิ้นหัวใจ/ปอด</p>
<div class="tbl"><table>
  <tr><th>ยา</th><th>ADR</th><th>ข้อควรระวัง</th><th>Drug interaction</th></tr>
  <tr><td><b>Non-ergot:</b> pramipexole, ropinirole, rotigotine (patch), piribedil</td><td>คลื่นไส้ อาเจียน ง่วง/หลับฉับพลันขณะทำกิจกรรม ประสาทหลอน ขาบวม · <b>impulse control disorders</b> (พนัน เพศสัมพันธ์ ซื้อของ/กินมากผิดปกติ) พบสูงกว่ากลุ่มอื่น</td><td>เพิ่มขนาดช้า ๆ ทุก 2–4 สัปดาห์ · เฝ้าระวัง ICDs โดยเฉพาะชาย อายุน้อย มีประวัติเสพติด/พนัน · ลดยาช้า ๆ ห้ามหยุดทันที (เสี่ยง dopamine agonist withdrawal syndrome, DAWS)</td><td><b>Ropinirole:</b> ผ่าน CYP1A2 — ciprofloxacin เพิ่มระดับ · carbamazepine, rifampin, บุหรี่ ลดระดับ<br><b>Pramipexole:</b> ขับทางไตในรูปเดิม ปรับขนาดถ้า CrCl &lt; 50 mL/min</td></tr>
  <tr><td><b>Ergot:</b> bromocriptine</td><td>เหมือน non-ergot + พังผืดที่ลิ้นหัวใจ เยื่อหุ้มปอด ช่องท้อง</td><td>Chest radiography ก่อนเริ่มและเป็นระยะ · ไม่เกิน 30 mg/วัน</td><td>ระวังร่วมกับยา serotonergic/vasoconstrictive อื่น</td></tr>
  <tr><td><b>Apomorphine</b> (injection)</td><td>คลื่นไส้อาเจียนรุนแรง orthostatic hypotension ง่วง หาว dyskinesia</td><td>ใช้ในระยะ advanced ที่ตอบสนองต่อยาไม่สม่ำเสมอ ต้องติดตามใกล้ชิด</td><td><mark>ห้ามใช้ร่วม 5-HT3 antagonist</mark> (ondansetron, palonosetron) — ความดันต่ำรุนแรงและหมดสติ</td></tr>
</table></div>
<h3>MAO-B inhibitors</h3>
<p>ในไทยมีเฉพาะ selegiline และ rasagiline (safinamide ไม่อยู่ในบัญชียาหลัก) · ยับยั้ง MAO-B ที่ทำลาย dopamine</p>
<div class="tbl"><table>
  <tr><th>ยา</th><th>ADR</th><th>ข้อควรระวัง</th><th>Drug interaction</th></tr>
  <tr><td><b>Selegiline</b></td><td>คลื่นไส้ ปวดศีรษะ มึนงง นอนไม่หลับ (amphetamine-like metabolite)</td><td>ห้ามกินหลัง 14.00 น. · สูงสุด 10 mg/วัน (เกินนี้ไม่ selective ต่อ MAO-B)</td><td>ห้ามใช้ร่วม bupropion (ยับยั้ง CYP2B6 → hypertensive reaction) · ระวัง SSRIs, SNRIs, TCA, dextromethorphan, meperidine, methadone, tramadol, triptans, St. John's wort (serotonin syndrome) · เกินขนาดร่วมกับอาหาร tyramine สูง → hypertensive crisis ("cheese reaction")</td></tr>
  <tr><td><b>Rasagiline</b></td><td>ปวดศีรษะ dyskinesia คลื่นไส้ orthostatic hypotension</td><td>กินเช้าครั้งเดียว สูงสุด 1 mg/วัน</td><td>ผ่าน CYP1A2 — ciprofloxacin เพิ่มระดับ · carbamazepine, rifampin, บุหรี่ ลดระดับ · serotonin syndrome เช่นเดียวกับ selegiline</td></tr>
</table></div>
<h3>COMT inhibitors</h3>
<p>ในไทยมีเฉพาะ entacapone · <b>ต้องใช้ร่วมกับ levodopa เสมอ ห้ามใช้เดี่ยว</b> เพื่อลด wearing-off</p>
<div class="tbl"><table>
  <tr><th>ADR</th><th>ข้อควรระวัง</th><th>Drug interaction</th></tr>
  <tr><td>ปวดท้อง ท้องเสีย (5–10%) · ปัสสาวะสีน้ำตาล-ส้ม (ไม่อันตราย) · เพิ่ม dyskinesia จาก levodopa</td><td>1 เม็ดทุกมื้อของ levodopa/DDCI สูงสุด 2,000 mg/วัน · ไม่มีหลักฐานว่าใช้ตั้งแต่ระยะแรกป้องกัน motor complications</td><td>เพิ่มระดับ/ผลของ levodopa จึงเพิ่ม ADR ของ levodopa ด้วย</td></tr>
</table></div>
<h3>Amantadine</h3>
<div class="tbl"><table>
  <tr><th>ADR</th><th>ข้อควรระวัง</th><th>PK</th></tr>
  <tr><td><b>Livedo reticularis</b> (ผื่นลายร่างแหที่แขนขา มักมีขาบวม) · ปากแห้ง ท้องผูก สับสน ประสาทหลอน (ผู้สูงอายุไว) · orthostatic hypotension</td><td><mark>ยาหลักลด levodopa-induced dyskinesia</mark> · ห้ามหยุดทันที (parkinsonism แย่ลง) · ระวังในผู้มีประวัติชักหรือหัวใจล้มเหลว</td><td>ขับทางไตในรูปเดิม ปรับขนาดถ้า CrCl &lt; 50 mL/min</td></tr>
</table></div>
<h3>Anticholinergics (trihexyphenidyl)</h3>
<div class="tbl"><table>
  <tr><th>ADR</th><th>ข้อควรระวัง</th><th>Interaction / ข้อห้าม</th></tr>
  <tr><td>ปากแห้ง ท้องผูก ปัสสาวะคั่ง ตาพร่า สับสน ประสาทหลอน หลงลืม</td><td>ไม่ใช้เป็นยาตัวแรก · ไม่แนะนำในผู้สูงอายุ/สมองเสื่อม · มีประโยชน์เฉพาะลดอาการสั่นที่ตอบสนองยาอื่นไม่ดี โดยเฉพาะผู้ป่วยอายุน้อย</td><td>เสริมฤทธิ์กับยา anticholinergic อื่น (antihistamine รุ่นเก่า, TCA) · ข้อห้าม: ต้อหินมุมแคบ ลำไส้อุดตัน สมองเสื่อม</td></tr>
</table></div>` },
    { id: 'strategy', t: 'กลยุทธ์การรักษาตามระยะ', html: `<h3>Early stage</h3>
<ul>
  <li><b>อายุ &lt; 60–65 ปี:</b> พิจารณาเริ่ม dopamine agonist หรือ MAO-B inhibitor เพื่อชะลอ motor complications จาก levodopa</li>
  <li><b>อายุ &gt; 65 ปี หรืออาการรุนแรง:</b> เริ่ม levodopa เลย (ได้ผลดีกว่าและปลอดภัยกว่า)</li>
</ul>
<h3>Advanced stage (motor complications)</h3>
<div class="tbl"><table>
  <tr><th>ปัญหา</th><th>การจัดการ</th></tr>
  <tr><td>Wearing-off</td><td>เพิ่มความถี่การให้ levodopa หรือเพิ่ม COMT inhibitor, MAO-B inhibitor หรือ dopamine agonist</td></tr>
  <tr><td>Dyskinesia (LID)</td><td>ลดขนาด levodopa ต่อครั้ง หรือเพิ่ม amantadine</td></tr>
</table></div>
<p><b>Deep brain stimulation (DBS):</b> ผ่าตัดฝังอิเล็กโทรดที่ subthalamic nucleus (STN) หรือ globus pallidus interna (GPi) ในผู้ที่มี motor fluctuation รุนแรงและปรับยาแล้วไม่ดีขึ้น</p>` },
  ],
  questions: [
    { q: 'ผู้ป่วยชายอายุ 58 ปี เป็นโรคพาร์กินสัน ควบคุมอาการได้ดีด้วย levodopa/carbidopa 100/25 mg วันละ 3 ครั้ง มา 3 ปี รายงานว่าเริ่มมีอาการสั่นขณะพักและกล้ามเนื้อเกร็งกลับมาประมาณ 1 ชั่วโมงก่อนถึงเวลาทานยามื้อถัดไป กลยุทธ์เริ่มต้นที่เหมาะสมที่สุดสำหรับ "wearing-off" ของผู้ป่วยรายนี้คือข้อใด', o: ['ยกเลิก levodopa/carbidopa แล้วเปลี่ยนไปใช้ trihexyphenidyl', 'เพิ่ม entacapone 200 mg ทานพร้อม levodopa/carbidopa ทุกมื้อ', 'เพิ่ม amantadine 100 mg วันละ 2 ครั้ง', 'เพิ่มขนาด levodopa/carbidopa เป็น 250/25 mg วันละ 3 ครั้ง'], a: 1, e: 'Wearing-off (end-of-dose deterioration) เกิดจากระยะออกฤทธิ์ของ levodopa สั้นลงเมื่อโรคดำเนินไป · entacapone (COMT inhibitor) ยับยั้งการสลาย levodopa ที่ส่วนปลาย ยืด half-life ทำให้ออกฤทธิ์นานขึ้นโดยไม่ทำให้ peak level สูงเกินไป' },
    { q: 'ผู้ป่วยหญิงอายุ 72 ปี ได้รับการวินิจฉัยเป็นโรคพาร์กินสันระยะเริ่มต้น อาการหลักคือ rest tremor และ bradykinesia ยาตัวเลือกแรกที่เหมาะสมที่สุดคือข้อใด', o: ['Pramipexole', 'Trihexyphenidyl', 'Levodopa/carbidopa', 'Selegiline (monotherapy)'], a: 2, e: 'อายุ > 65 ปี (หรืออาการรุนแรง) ใช้ levodopa/carbidopa เป็นตัวเลือกแรก เพราะคุมอาการเคลื่อนไหวได้ดีที่สุด และเสี่ยงผลข้างเคียงทางประสาท/จิตใจ (ประสาทหลอน ง่วงกลางวัน ความจำเสื่อม) ต่ำกว่า dopamine agonists' },
    { q: 'เหตุผลหลักในการให้ peripheral DOPA decarboxylase inhibitor (DDCI) เช่น carbidopa ควบคู่กับ levodopa เสมอคือข้อใด', o: ['เพื่อช่วยขนส่ง levodopa ผ่าน blood-brain barrier ด้วย active transport', 'เพื่อยับยั้งการเปลี่ยน levodopa เป็น dopamine ที่ระบบส่วนปลาย ช่วยลดผลข้างเคียงและเพิ่มปริมาณยาที่เข้าสู่สมอง', 'เพื่อป้องกันการสลายตัวของ dopamine ภายในระบบประสาทส่วนกลาง', 'เพื่อออกฤทธิ์กระตุ้นตัวรับ D2 ที่ striatum โดยตรง'], a: 1, e: 'Dopamine ผ่าน BBB ไม่ได้ ถ้า levodopa ถูกเปลี่ยนนอกสมองจะเกิดผลข้างเคียง (คลื่นไส้อาเจียน orthostatic hypotension) และเหลือเข้าสมองน้อย · carbidopa ยับยั้ง DOPA decarboxylase ส่วนปลายโดยตัวเองไม่ผ่าน BBB จึงให้ levodopa เข้าสมองได้เต็มที่' },
    { q: 'ผู้ป่วยชายอายุ 65 ปี เป็นโรคพาร์กินสันระยะรุนแรง ได้รับ levodopa ขนาดสูง เกิดอาการยุกยิก บิดเกร็งของศีรษะและแขนขาโดยไม่ตั้งใจ (choreiform movements) ในช่วงที่ยาขึ้นสูงสุด ยาใดควรนำมาใช้จัดการภาวะนี้โดยเฉพาะ', o: ['Entacapone', 'Amantadine', 'Rasagiline', 'Metoclopramide'], a: 1, e: 'Levodopa-induced dyskinesia (peak-dose) · amantadine เป็น NMDA antagonist (ลด glutamate) จึงเป็นยาหลักลด dyskinesia โดยไม่ทำให้อาการพาร์กินสันแย่ลง' },
    { q: 'ผู้ป่วยพาร์กินสันอายุ 62 ปี รับประทาน levodopa/carbidopa มีอาการคลื่นไส้อาเจียนรุนแรง ยาแก้คลื่นไส้ในข้อใดห้ามใช้ และข้อใดเป็นตัวเลือกที่ปลอดภัย', o: ['ห้ามใช้: metoclopramide · ปลอดภัย: domperidone', 'ห้ามใช้: domperidone · ปลอดภัย: metoclopramide', 'ห้ามใช้: ondansetron · ปลอดภัย: prochlorperazine', 'ห้ามใช้: haloperidol · ปลอดภัย: metoclopramide'], a: 0, e: 'Metoclopramide (รวมถึง prochlorperazine และ typical antipsychotics) เป็น central D2 antagonist ผ่าน BBB ทำให้พาร์กินสันแย่ลง · domperidone เป็น peripheral D2 antagonist ผ่าน BBB น้อยมาก จึงลดคลื่นไส้โดยไม่ต้านฤทธิ์ยาในสมอง' },
  ],
}
