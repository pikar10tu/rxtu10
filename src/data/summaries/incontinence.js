// Urinary incontinence — converted from the RxTU10 class summary PDF (see content/summaries/manifest.json)
// แผนภูมิ 3 รูปสร้างใหม่เป็นข้อความ
export default {
  id: 'incontinence',
  date: '',
  refs: [
    'สมาคมศัลยแพทย์ระบบปัสสาวะแห่งประเทศไทย. หนังสือแนวทางเวชปฏิบัติการดูแลผู้สูงอายุ (ภาวะกลั้นปัสสาวะไม่อยู่). tuanet.org; 2565.',
  ],
  sections: [
    { id: 'type', t: 'ชนิดและปัจจัยเสี่ยง', html: `<p>ปัสสาวะเล็ดเกิดได้จากความผิดปกติทั้งภายในและภายนอกกระเพาะปัสสาวะ · พบมากในผู้สูงอายุ ผู้หญิงมากกว่าผู้ชาย</p>
<div class="tbl"><table>
  <tr><th>ชนิด</th><th>กลไก/อาการ</th><th>ปัจจัยเสี่ยง</th></tr>
  <tr><td><b>Stress (SUI)</b></td><td>Intra-abdominal pressure เพิ่มจากออกกำลังกาย ยกของหนัก ไอ จาม → ปัสสาวะเล็ด · พบบ่อยในผู้หญิง</td><td>ตั้งครรภ์ (เสี่ยงขึ้นตามจำนวนครั้ง) คลอดทางช่องคลอด หมดประจำเดือน cognitive impairment อ้วน อายุมาก</td></tr>
  <tr><td><b>Urgency (UUI)</b></td><td>Detrusor muscle ทำงานมากขึ้น มีปัสสาวะนิดเดียวก็ปวด · ปวดแล้วต้องไปทันที ปัสสาวะบ่อย กลางคืน กลั้นไม่ถึงห้องน้ำ · การหดตัวผ่าน <mark>muscarinic M2, M3</mark></td><td>อายุมาก โรคระบบประสาท (stroke, Parkinson, MS, spinal cord injury) bladder outlet obstruction (ต่อมลูกหมากโต) ตัดมดลูก UTI ซ้ำ</td></tr>
  <tr><td><b>Mixed / drug-induced</b></td><td>มีทั้ง SUI และ UUI หรือเกิดจากยา</td><td>ยา: diuretics, alpha-blockers, ethanol, ACEIs (ไอ → SUI)</td></tr>
</table></div>
<h3>เป้าหมาย</h3>
<ul>
  <li>คุมปัสสาวะได้ดีขึ้น ไม่เล็ด ไม่ราด ไม่ต้องลุกกลางคืน</li>
  <li>ป้องกันภาวะแทรกซ้อน เช่น แผลที่อวัยวะเพศจากความชื้น</li>
  <li>ใช้ยาขนาดต่ำสุดที่ได้ประโยชน์สูงสุด · ผู้ป่วยกล้าออกไปใช้ชีวิต</li>
</ul>
<h3>Non-pharmacologic (first-line)</h3>
<ul>
  <li>เลี่ยงดื่มน้ำปริมาณมากก่อนนอน · เลี่ยงชา กาแฟ แอลกอฮอล์</li>
  <li>ลดน้ำหนักเพื่อลดแรงดันในช่องท้อง</li>
  <li>Kegel exercise (pelvic floor) · bladder training</li>
</ul>` },
    { id: 'algo', t: 'แนวทางการดูแลตามชนิด', html: `<h3>Stress urinary incontinence</h3>
<ol>
  <li>เลี่ยงปัจจัยเสี่ยง (ยกของหนัก ท้องผูก) · ลดน้ำหนัก · หยุดยาที่ไม่จำเป็นที่อาจเป็นสาเหตุ · ออกกำลังกล้ามเนื้ออุ้งเชิงกราน · ประเมินผลที่ 4–8 สัปดาห์</li>
  <li>ดีขึ้น → ปฏิบัติต่อ</li>
  <li>ไม่ดีขึ้นและต้องการรักษาต่อ → ส่ง urologist (ชาย) หรือ urologist/urogynecologist (หญิง) · ไม่ต้องการ → ติดตามอาการ ส่งต่อเมื่อแย่ลงหรือเข้าเกณฑ์ complex UI</li>
</ol>
<h3>Urgency urinary incontinence</h3>
<ol>
  <li>เลี่ยงแอลกอฮอล์และคาเฟอีน · bladder training · topical estrogen ในผู้หญิง · ประเมินผลที่ 4 สัปดาห์</li>
  <li>ไม่ดีขึ้น → <b>antimuscarinics</b> ประเมินผลและ ADR ที่ 4 สัปดาห์</li>
  <li>ยังไม่ดีขึ้นหรือ ADR รุนแรง → ส่ง urologist/urogynecologist</li>
</ol>
<h3>Mixed urinary incontinence</h3>
<p>รวมทุกข้อของ SUI และ UUI (เลี่ยงแอลกอฮอล์ คาเฟอีน ปัจจัยเสี่ยง ยาที่เป็นสาเหตุ ลดน้ำหนัก bladder training + pelvic floor exercise topical estrogen) ประเมินที่ 4 สัปดาห์ → antimuscarinics → ส่งต่อ</p>` },
    { id: 'uui', t: 'ยารักษา UUI', html: `<p>พิจารณาจากอายุ โรคร่วม และยาที่ใช้อยู่</p>
<h3>Antimuscarinics</h3>
<p>ลด detrusor activity และ nocturia · เริ่มขนาดต่ำแล้วค่อยปรับ · ทน ADR ไม่ได้ให้เปลี่ยนยา</p>
<div class="tbl"><table>
  <tr><th>ยา</th><th>ข้อควรระวัง</th></tr>
  <tr><td>Oxybutynin</td><td>ระวังร่วมกับ CYP3A4 inhibitors</td></tr>
  <tr><td>Tolterodine</td><td>–</td></tr>
  <tr><td>Trospium chloride</td><td><mark>ห้ามใช้เมื่อ CrCl &lt; 30</mark></td></tr>
  <tr><td>Solifenacin</td><td>ผ่าน CYP3A4 · ห้ามใช้ในโรคตับรุนแรง</td></tr>
  <tr><td>Darifenacin</td><td>ผ่าน CYP3A4</td></tr>
</table></div>
<ul>
  <li><b>ข้อห้าม:</b> ปัสสาวะไม่ออก ท้องผูก ลำไส้อุดตัน ต้อหินมุมแคบ</li>
  <li><b>ADR:</b> ปากแห้ง ท้องผูก ง่วงซึม ตาแห้ง ความจำเสื่อม · ปากแห้งแนะนำเคี้ยวหมากฝรั่งไม่มีน้ำตาล</li>
</ul>
<h3>Beta-3 adrenergic agonist: mirabegron</h3>
<p>กระตุ้น β3 ที่ detrusor ให้คลายตัวช่วงเก็บปัสสาวะ เพิ่มความจุ ลดการบีบตัวผิดปกติ ลดความถี่ · ADR: ความดันสูง (จับ β1/β2 ได้บ้าง)</p>` },
    { id: 'sui', t: 'ยารักษา SUI', html: `<p>First-line คือ pelvic floor muscle rehabilitation</p>
<div class="tbl"><table>
  <tr><th>ยา</th><th>กลไก</th><th>ข้อห้าม/ข้อควรระวัง</th></tr>
  <tr><td><b>Topical estrogen</b></td><td>เพิ่มความชุ่มชื้นและเลือดมาเลี้ยง · เพิ่ม sensitivity ของ alpha-adrenoceptor</td><td>มะเร็งเต้านม/เยื่อบุมดลูก · ประจำเดือนผิดปกติ · ประวัติ thromboembolism</td></tr>
  <tr><td><b>Alpha-adrenoceptor agonist</b></td><td>Urethral constriction</td><td>ความดันสูง · ต้อหินมุมแคบ</td></tr>
  <tr><td><b>Duloxetine</b></td><td>ช่วย sphincter ทำงานดีขึ้นช่วง filling phase · เหมาะเมื่อมี depression/anxiety ร่วม</td><td>เลี่ยงเมื่อ CrCl &lt; 30 · ห้ามหยุดทันที (ต้องค่อย ๆ ลด) · ห้ามใช้ใน suicide risk · ต้อหินมุมแคบ · ระวัง DI</td></tr>
</table></div>
<p><b>Monitor:</b> ตอบสนองภายใน 1–2 สัปดาห์ · ไม่ควรใช้ยานาน ใช้เฉพาะช่วงที่ต้องออกไปข้างนอกหรือหาห้องน้ำยาก</p>` },
  ],
  questions: [
    { q: 'ผู้ป่วยหญิงอายุ 45 ปี ปัสสาวะเล็ดเวลาไอ จาม หรือยกของหนัก ไม่มีอาการปวดปัสสาวะเฉียบพลันหรือปวดท้องน้อยร่วมด้วย น่าจะเป็นภาวะใด', o: ['Urgency urinary incontinence (UUI)', 'Stress urinary incontinence (SUI)', 'Mixed urinary incontinence', 'Drug-induced urinary incontinence'], a: 1, e: 'SUI เกิดจาก intra-abdominal pressure เพิ่มจากไอ จาม ออกแรง โดยไม่มีอาการปวดปัสสาวะเฉียบพลันซึ่งเป็นลักษณะของ UUI' },
    { q: 'กลไกการหดตัวของ detrusor muscle ใน urgency urinary incontinence เกี่ยวข้องกับตัวรับชนิดใด', o: ['Alpha-1 adrenergic receptor', 'Beta-3 adrenergic receptor', 'Muscarinic cholinergic receptor (M2, M3)', 'Nicotinic receptor'], a: 2, e: 'การหดตัวของกระเพาะปัสสาวะผ่าน muscarinic M2 และ M3 ซึ่งเป็นเป้าหมายของ antimuscarinics' },
    { q: 'ผู้ป่วยที่มี CrCl 25 mL/min ควรหลีกเลี่ยงยาใด', o: ['Oxybutynin', 'Tolterodine', 'Trospium chloride', 'Mirabegron'], a: 2, e: 'Trospium chloride ห้ามใช้เมื่อ CrCl < 30 mL/min' },
    { q: 'ข้อใดเป็นข้อควรระวัง/ข้อห้ามใช้ของ duloxetine ในการรักษา stress urinary incontinence', o: ['หยุดยาได้ทันทีโดยไม่ต้องค่อย ๆ ลดขนาด', 'ใช้ได้ปลอดภัยในผู้ป่วยที่เสี่ยงต่อการฆ่าตัวตาย', 'ควรเลี่ยงการใช้ในผู้ป่วยที่มี CrCl < 30 mL/min', 'ไม่มีปฏิกิริยาระหว่างยาที่ต้องระวัง'], a: 2, e: 'Duloxetine ควรเลี่ยงเมื่อ CrCl < 30 · ห้ามหยุดทันที · ห้ามใช้ใน suicide risk · ต้องระวัง DI' },
    { q: 'ผู้ป่วยหญิงวัยหมดประจำเดือนต้องการใช้ estrogen ทาเฉพาะที่เพื่อรักษา SUI ข้อใดเป็นข้อห้ามใช้', o: ['ประวัติความดันโลหิตสูง', 'ประวัติมะเร็งเต้านมและมะเร็งเยื่อบุมดลูก', 'ประวัติต้อหินมุมแคบ', 'ประวัติโรคไตเรื้อรัง'], a: 1, e: 'ข้อห้าม estrogen: มะเร็งเต้านม/เยื่อบุมดลูก ประจำเดือนผิดปกติ ประวัติ thromboembolism' },
  ],
}
