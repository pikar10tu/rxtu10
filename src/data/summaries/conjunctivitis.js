// Conjunctivitis — converted from the RxTU10 class summary PDF (see content/summaries/manifest.json)
const fig = (f, cap, alt) => `<figure><img data-fig="conjunctivitis/${f}.webp" alt="${alt || cap}"><figcaption>${cap}</figcaption></figure>`

export default {
  id: 'conjunctivitis',
  date: '',
  refs: [
    'วรรณา ตั้งเจริญเสถียร. เยื่อบุตาขาวอักเสบ. ศูนย์การศึกษาต่อเนื่องทางเภสัชศาสตร์ สภาเภสัชกรรม; 2559.',
    'คณะอนุกรรมการพัฒนาบัญชียาหลักแห่งชาติ. คู่มือการใช้ยาอย่างสมเหตุผลตามบัญชียาหลักแห่งชาติ: ยาที่ใช้ทางจักษุวิทยา (Thai National Formulary 2015). สำนักงานคณะกรรมการอาหารและยา; 2017.',
    'American Academy of Ophthalmology. Conjunctivitis Preferred Practice Pattern®. 2023.',
  ],
  sections: [
    { id: 'type', t: 'ชนิดของเยื่อบุตาอักเสบ', html: `<p>การอักเสบของเยื่อบุตาขาว สาเหตุหลักคือแบคทีเรีย ไวรัส และภูมิแพ้</p>
<h3>Bacterial conjunctivitis</h3>
<p>เชื้อหลัก <i>Staphylococcus aureus</i> ในผู้ใหญ่ และ <i>Haemophilus influenzae</i> ในเด็ก · เคืองตา น้ำตาไหล <b>ขี้ตามาก เหนียวข้น สีเหลือง/เขียวคล้ายหนอง</b> (purulent) · มักเป็น 2 ตา โดยลามจากข้างหนึ่งไปอีกข้างใน 2–3 วัน · หนังตาบวม เปลือกตาติดกันหลังตื่นนอน</p>
${fig('p01-1', 'Bacterial conjunctivitis — ขี้ตาเป็นหนองเกาะขนตา')}
<h3>Viral conjunctivitis</h3>
<p>มักเกิดจาก <b>adenovirus</b> ติดต่อง่าย (น้ำไม่สะอาดเข้าตา มือไม่สะอาดขยี้ตา) · เคืองตา คันตา น้ำตาไหล <b>ขี้ตาใส</b> · เป็นข้างเดียวหรือ 2 ตาก็ได้</p>
${fig('p01-2', 'Viral conjunctivitis — ตาแดง ขี้ตาใส')}
<h3>Allergic conjunctivitis</h3>
<p>ปฏิกิริยาภูมิแพ้ (IgE) ต่อสารในสิ่งแวดล้อม เช่น เกสรดอกไม้ สปอร์เชื้อรา ขนสัตว์ ฝุ่น · มักมีโรคภูมิแพ้ร่วม เช่น allergic rhinitis · <b>เป็น 2 ตา คันเด่น</b> ตาแดง น้ำตาไหลหรือขี้ตาใส อาจมี conjunctival chemosis และ papillae · หายเมื่อกำจัดสารก่อแพ้</p>
${fig('p01-3', 'Allergic conjunctivitis — เยื่อบุตาบวม (chemosis)')}` },
    { id: 'tx', t: 'การรักษา (AAO 2023)', html: `<h3>Bacterial</h3>
<ul>
  <li>Acute bacterial conjunctivitis หายเองได้ใน 10–14 วัน</li>
  <li>ยาปฏิชีวนะ broad-spectrum 5–7 วัน · ยาหยอดใช้กลางวัน ยาขี้ผึ้งอยู่บนตานานแต่ทำให้ตามัว เหมาะกลางคืน</li>
  <li>ปวดใช้ยาแก้ปวดได้</li>
  <li><mark>เลี่ยงยาหยอดที่มี corticosteroid</mark> อาจทำให้เชื้อลุกลาม</li>
  <li>แย่ลง ปวดตา ตาขุ่นมัว ควรพบแพทย์ทันที</li>
</ul>
<h3>Viral</h3>
<ul>
  <li>หายเองภายใน ~2 สัปดาห์ · รักษาประคับประคอง: น้ำตาเทียม topical antihistamine ประคบเย็น</li>
  <li><b>ไม่ใช้ยาปฏิชีวนะ</b> (ไม่มีประโยชน์)</li>
  <li>ไม่ใช้ steroid ยกเว้นรุนแรง เช่น เยื่อบุตาบวมมาก epithelial sloughing หรือ membranous conjunctivitis</li>
  <li>งดใส่คอนแทคเลนส์จนหาย</li>
</ul>
<h3>Allergic</h3>
<ul>
  <li>หลีกเลี่ยงสารก่อแพ้ · น้ำตาเทียมชะสารก่อแพ้ · ประคบเย็นลดตาแดง</li>
  <li>เป็นไม่มากหรือครั้งแรก: <b>topical antihistamine first-line</b></li>
  <li>เป็นบ่อยหรือรุนแรง: topical antihistamine ร่วมกับ mast cell stabilizer</li>
  <li>Oral antihistamine อาจทำให้ตาแห้ง อาการทางตาแย่ลง · topical decongestant มักใช้ร่วมกับ antihistamine</li>
</ul>
<p><b>ป้องกันการเป็นซ้ำ:</b> ติดเชื้อ — ล้างมือบ่อย ไม่ใช้ของร่วมกับผู้อื่น · ภูมิแพ้ — หลีกเลี่ยงสารก่อแพ้ ทำความสะอาดที่พัก</p>
<h3>ยาตามบัญชียาหลักแห่งชาติ</h3>
<div class="tbl"><table>
  <tr><th>กลุ่ม</th><th>ยา</th><th>ข้อบ่งใช้</th><th>วิธีใช้</th><th>หมายเหตุ</th></tr>
  <tr><td>Topical decongestant</td><td>Naphazoline, tetrahydrozoline</td><td>Viral, allergic</td><td>1–2 หยด วันละ 3–4 ครั้ง</td><td>ลดตาแดง</td></tr>
  <tr><td>Topical antihistamine</td><td>Azelastine, epinastine, ketotifen</td><td>Viral, allergic</td><td>1 หยด วันละ 2 ครั้ง</td><td>บรรเทาอาการคัน</td></tr>
  <tr><td>Antihistamine + mast cell stabilizer</td><td>Olopatadine</td><td>Allergic</td><td>1 หยด วันละ 2 ครั้ง</td><td>บรรเทาและป้องกันการเป็นซ้ำ</td></tr>
  <tr><td>Mast cell stabilizer</td><td>Lodoxamide, pemirolast</td><td>Allergic</td><td>1–2 หยด วันละ 4 ครั้ง</td><td>ป้องกันการเป็นซ้ำ</td></tr>
  <tr><td>Topical antibiotics</td><td>Gentamicin, chloramphenicol, polymyxin B, levofloxacin, ciprofloxacin, azithromycin, erythromycin, sulfacetamide</td><td>Bacterial</td><td>Gentamicin ขี้ผึ้ง/หยด วันละ 4 ครั้ง · chloramphenicol ขี้ผึ้ง วันละ 4 ครั้ง · polymyxin B 1 หยด วันละ 4 ครั้ง · levofloxacin, ciprofloxacin 1–2 หยด วันละ 4 ครั้ง (cipro ขี้ผึ้ง วันละ 3 ครั้ง) · azithromycin 1 หยด วันละ 2 ครั้ง · erythromycin วันละ 4 ครั้ง · sulfacetamide ขี้ผึ้ง วันละ 4 ครั้ง หรือหยดทุก 2–3 ชม.</td><td>เลือกตามเชื้อและความรุนแรง</td></tr>
</table></div>` },
  ],
  questions: [
    { case: 'ชายอายุ 25 ปี ตาแดงทั้งสองข้าง เริ่มจากตาขวาแล้วลามมาตาซ้าย ปวด แสบ เปลือกตาบวม ขี้ตามากโดยเฉพาะเวลาตื่นนอน ขี้ตาสีเหลือง', q: 'อาการน่าจะเกิดจากเชื้อใดมากที่สุด', o: ['Staphylococcus aureus', 'Neisseria gonorrhoeae', 'Chlamydia trachomatis', 'Streptococcus pneumoniae', 'Haemophilus aegyptius'], a: 0, e: 'อาการเข้าได้กับ bacterial conjunctivitis ซึ่งเชื้อที่พบบ่อยที่สุดในผู้ใหญ่คือ S. aureus' },
    { case: 'ชายอายุ 25 ปี ตาแดงทั้งสองข้าง เริ่มจากตาขวาแล้วลามมาตาซ้าย ปวด แสบ เปลือกตาบวม ขี้ตามากโดยเฉพาะเวลาตื่นนอน ขี้ตาสีเหลือง', q: 'ควรจ่ายยาใดให้ผู้ป่วยรายนี้', o: ['Ciprofloxacin eye drop', 'Artificial tear', 'Prednisolone eye drop', 'Naphazoline eye drop', 'Olopatadine eye drop'], a: 0, e: 'Bacterial conjunctivitis ควรได้ topical antibiotic เพื่อรักษาและป้องกันภาวะแทรกซ้อน · ไม่ควรใช้ steroid' },
    { case: 'หญิงอายุ 25 ปี คันตา ตาแดง 2 ข้าง น้ำตาไหล ไม่มีขี้ตา ไม่ปวดตา มักเป็นบ่อยเมื่อเล่นกับแมว', q: 'ผู้ป่วยน่าจะเป็นโรคอะไร', o: ['Blepharitis', 'Hordeolum', 'Allergic conjunctivitis', 'Bacterial conjunctivitis', 'Viral conjunctivitis'], a: 2, e: 'ตาแดง 2 ข้าง น้ำตาไหล ไม่มีขี้ตา ไม่ปวด และเกิดหลังสัมผัสแมว (สารก่อแพ้) เข้าได้กับ allergic conjunctivitis' },
    { case: 'หญิงอายุ 25 ปี คันตา ตาแดง 2 ข้าง น้ำตาไหล ไม่มีขี้ตา ไม่ปวดตา มักเป็นบ่อยเมื่อเล่นกับแมว', q: 'หากผู้ป่วยรายนี้ใส่ contact lens ควรแนะนำอย่างไร', o: ['ใส่ contact lens ตามปกติ', 'ใส่ contact lens ให้น้อยลง', 'งดใส่ contact lens', 'ใส่ได้หากจำเป็น', 'ถูกทุกข้อ'], a: 2, e: 'ควรงดใส่คอนแทคเลนส์ระหว่างมีอาการตาอักเสบ เพราะเลนส์สะสมสารก่อแพ้และเชื้อ ระคายเคืองมากขึ้น และขวางยาหยอดตา · หมายเหตุผู้แปลง: คำอธิบายในต้นฉบับอ้างถึง bacterial conjunctivitis ซึ่งไม่ตรงกับกรณีนี้ (allergic) จึงปรับคำอธิบาย' },
    { q: 'ข้อใดไม่ใช่ topical decongestant', o: ['Naphazoline', 'Tetrahydrozoline', 'Oxymetazoline', 'Phenylephrine', 'Azelastine'], a: 4, e: 'Azelastine เป็นยากลุ่ม antihistamine' },
  ],
}
