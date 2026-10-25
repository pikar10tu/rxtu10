// Urinary tract infections: cystitis — converted from the RxTU10 class summary PDF (see content/summaries/manifest.json)
export default {
  id: 'uti',
  date: '27/07/2026',
  refs: [
    'เด่นพงศ์ พัฒนเศรษฐานนท์. การติดเชื้อในทางเดินปัสสาวะ (Urinary Tract Infections). ศูนย์การศึกษาต่อเนื่องทางเภสัชศาสตร์ สภาเภสัชกรรม. Available from: https://ccpe.pharmacycouncil.org/showfile.php?file=418',
    'สุรัตน์ กันตชูเวสศิริ. ผู้ป่วยที่มีการติดเชื้อทางเดินปัสสาวะ (Patients with urinary tract infection). คณะแพทยศาสตร์โรงพยาบาลรามาธิบดี มหาวิทยาลัยมหิดล.',
    'สมาคมโรคติดเชื้อแห่งประเทศไทย. แนวทางเวชปฏิบัติการรักษาโรคติดเชื้อทางเดินปัสสาวะ พ.ศ. 2568. Available from: https://idthai.org/2015/files_upload/files/clinical%20practice%20guideline%20UTIs%202568_final.pdf',
    'ศิริมา ปึงเจริญกิจกุล, วิมล สันติมาลีวรกุล. การใช้ยาต้านจุลชีพสำหรับการติดเชื้อแบคทีเรียในระบบทางเดินปัสสาวะ. 2562. Available from: https://ccpe.pharmacycouncil.org/showfile.php?file=719',
    'กองยา สำนักงานคณะกรรมการอาหารและยา. เอกสารข้อมูลยา: nitrofurantoin 100 mg, fosfomycin 3 g, amoxicillin/clavulanate 875/125 mg และเอกสารกำกับยา Vflox 750.',
  ],
  sections: [
    { id: 'def', t: 'นิยามและปัจจัยเสี่ยง', html: `<p><b>UTI</b> คือภาวะที่มีอาการอักเสบของทางเดินปัสสาวะ ร่วมกับ <b>significant bacteriuria</b> (แบคทีเรีย ≥ 10⁵ ต่อ mL ของปัสสาวะ)</p>
<ul>
  <li>พบในผู้หญิงมากกว่าผู้ชาย · พบสูงในเบาหวาน ผ่าตัดเปลี่ยนไต ผู้สูงอายุ หรือภูมิคุ้มกันต่ำ</li>
  <li><b>ปัจจัยเสี่ยง:</b> การร่วมเพศ · ใช้ diaphragm หรือ spermicide · ดื่มน้ำน้อย · กลั้นปัสสาวะบ่อย · ชายที่ต่อมลูกหมากโต</li>
</ul>
<h3>Pathophysiology</h3>
<p>ส่วนใหญ่เป็นเชื้อแกรมลบจากลำไส้หรือช่องคลอด · มักเป็น <b>ascending infection</b> ติดเชื้อทางเดินปัสสาวะส่วนล่างก่อนแล้วลามขึ้นไต · ผู้ป่วยเรื้อรังหรือภูมิต่ำอาจติดเชื้อในกระแสเลือดแล้วแพร่ไปไต (เช่น staphylococci หรือเชื้อราจากผิวหนัง กระดูก หลอดเลือด)</p>
<div class="key"><strong class="k">เชื้อที่พบบ่อยที่สุด</strong>Acute uncomplicated UTI จากชุมชน: <b>E. coli</b> 80–90%</div>` },
    { id: 'type', t: 'ประเภทและการวินิจฉัย', html: `<h3>ตามตำแหน่ง</h3>
<div class="tbl"><table>
  <tr><th></th><th>Lower UTI</th><th>Upper UTI (pyelonephritis)</th></tr>
  <tr><td>ตำแหน่ง</td><td>กระเพาะปัสสาวะ (cystitis), ท่อปัสสาวะ (urethritis), ต่อมลูกหมาก (prostatitis), epididymis</td><td>ท่อไต กรวยไต เนื้อไต · รุนแรงกว่า</td></tr>
  <tr><td>อาการ</td><td>ปัสสาวะลำบาก แสบขัด (dysuria) · บ่อย &gt; 6 ครั้ง/วัน (frequency) · กลั้นไม่ได้ (urgency) · ปวดหน่วงหัวหน่าว (suprapubic pain) · บางรายมีเลือดปน (gross hematuria)</td><td>อาการทั่วร่างกาย: <b>ไข้ &gt; 38°C</b> หนาวสั่น คลื่นไส้ อาเจียน อ่อนเพลีย · <b>ปวดบั้นเอว (flank pain)</b> · กดเจ็บ costovertebral angle</td></tr>
</table></div>
<h3>ตามความซับซ้อน</h3>
<ul>
  <li><b>Uncomplicated:</b> ไม่มีความผิดปกติของโครงสร้างหรือการทำงานของทางเดินปัสสาวะ และไม่มีโรคที่ทำให้การรักษาซับซ้อน</li>
  <li><b>Complicated:</b> ใส่สายสวนปัสสาวะ · ปลูกถ่ายไต · ทางเดินปัสสาวะอุดกั้น (ต่อมลูกหมากโต นิ่ว ก้อนมะเร็ง พังผืด ท่อตีบ) · เบาหวาน ภูมิคุ้มกันบกพร่อง ไตบกพร่อง · <b>เพศชาย หญิงตั้งครรภ์ ผู้สูงอายุ &gt; 60 ปี</b> · recurrent UTI (≥ 3 ครั้งใน 1 ปี หรือ ≥ 2 ครั้งใน 6 เดือน จาก reinfection หรือ relapse)</li>
</ul>
<h3>การวินิจฉัย</h3>
<ul>
  <li><b>Acute uncomplicated cystitis:</b> วินิจฉัยจากประวัติและตรวจร่างกาย · อาการชัดไม่จำเป็นต้องส่ง urinalysis และ urine culture</li>
  <li><b>Complicated UTI:</b> ส่ง urinalysis และ urine culture ทุกราย</li>
  <li>Lab: bacteriuria · pyuria (WBC &gt; 10/mm³) · nitrite positive · leukocyte esterase positive · antibody-coated bacteria (upper UTI)</li>
</ul>` },
    { id: 'tx', t: 'การรักษา', html: `<p><b>เป้าหมาย:</b> กำจัดเชื้อ ป้องกันการลุกลามเป็นการติดเชื้อทั่วร่างกาย และป้องกันการกลับเป็นซ้ำ</p>
<h3>Acute uncomplicated cystitis</h3>
<div class="tbl"><table>
  <tr><th>ยาแนะนำ</th><th>ยาทางเลือก</th><th>หมายเหตุ</th></tr>
  <tr><td><b>Nitrofurantoin</b> กิน 5 วัน (เลี่ยงถ้า CrCl &lt; 30)<br><b>Fosfomycin trometamol</b> กินครั้งเดียว (เลี่ยงถ้า CrCl &lt; 10)</td><td>Oral 3rd gen cephalosporin เช่น cefixime 7 วัน<br>Amoxicillin/clavulanic acid 7 วัน<br>Single dose aminoglycoside (gentamicin, amikacin)<br>Ciprofloxacin, levofloxacin, TMP/SMX 3 วัน</td><td>Ciprofloxacin, levofloxacin, TMP/SMX ใช้เฉพาะเมื่อ urine culture ยืนยันว่าไวต่อยา เพราะ<b>เชื้อดื้อสูง</b></td></tr>
</table></div>
<p><b>ติดตาม:</b> ไม่ตอบสนองใน 72 ชม. หรือกลับเป็นซ้ำใน &lt; 3–4 สัปดาห์ → ส่งตรวจเพิ่ม เช่น รังสีวินิจฉัยหาความผิดปกติของโครงสร้าง หรือภาวะแทรกซ้อน (urinary tract obstruction, renal abscess, lobar nephronia)</p>
<h3>Acute complicated cystitis</h3>
<ul>
  <li>รักษาแนวเดียวกับ uncomplicated · ถ้าเริ่มมีอาการ upper UTI จึงรักษาแบบ complicated UTI</li>
  <li>ยาหลัก: <b>ceftriaxone</b> · ทางเลือก: gentamicin, amikacin</li>
  <li>ระยะเวลาอย่างน้อย 10–14 วัน (นานกว่านั้นถ้ามี undrained abscess, lobar nephronia, infected renal cyst) · ให้ 7 วันได้ถ้าตอบสนองเร็วและไม่มีภาวะแทรกซ้อน</li>
</ul>
<h3>UTI ในหญิงตั้งครรภ์</h3>
<div class="tbl"><table>
  <tr><th>ภาวะ</th><th>ยาแนะนำ</th><th>ยาทางเลือก</th><th>หมายเหตุ</th></tr>
  <tr><td>Asymptomatic bacteriuria</td><td>ตามผลเพาะเชื้อ</td><td></td><td>ขนาดและระยะเวลาเหมือน acute cystitis</td></tr>
  <tr><td>Acute cystitis</td><td>Nitrofurantoin 7 วัน<br>Fosfomycin trometamol ครั้งเดียว</td><td>Amoxicillin/clavulanic acid 7 วัน<br>Amoxicillin 7 วัน</td><td>Amoxicillin เฉพาะเมื่อ urine culture พบว่าไวต่อยา</td></tr>
  <tr><td>Acute pyelonephritis</td><td>Ceftriaxone<br>Amoxicillin/clavulanic acid</td><td>Cefotaxime<br>Gentamicin</td><td>ดีขึ้นและไม่มีไข้เกิน 24 ชม. → เปลี่ยนเป็นยากินตามผล culture จนครบ 14 วัน</td></tr>
</table></div>
<h3>Recurrent cystitis</h3>
<p>Fosfomycin trometamol 3 g PO 2 doses (ห่างกัน 3 วัน)</p>` },
    { id: 'drug', t: 'ยาที่ใช้', html: `<div class="tbl"><table>
  <tr><th>ยา</th><th>ขนาด</th><th>วิธีกิน</th><th>AE</th><th>ข้อควรระวัง</th></tr>
  <tr><td><b>Nitrofurantoin</b></td><td>Monohydrate/macrocrystals 100 mg BID หรือ macrocrystals 100 mg QID × 5 วัน</td><td>หลังอาหารทันที ลด AE และเพิ่มการดูดซึม</td><td>คลื่นไส้ อาเจียน ปวดท้อง ท้องเสีย</td><td>เลี่ยงใน CrCl &lt; 30 · เลี่ยงไตรมาส 3 (hemolysis ในทารกแรกเกิด) · cat. B</td></tr>
  <tr><td><b>Fosfomycin trometamol</b></td><td>3 g single dose</td><td>ท้องว่าง (ก่อนอาหาร 1 ชม. หรือหลังอาหาร 2 ชม.) · ละลายในน้ำ 50–75 mL คนแล้วดื่มทันที</td><td>ปวดหัว เวียนหัว คลื่นไส้ อาหารไม่ย่อย แสบยอดอก คันช่องคลอด</td><td>เลี่ยงใน CrCl &lt; 10 · cat. B</td></tr>
  <tr><td><b>Fluoroquinolones</b></td><td>Ciprofloxacin 500 mg BID · levofloxacin 500 mg OD × 3 วัน</td><td>กินก่อนยาลดกรด ≥ 2 ชม. หรือหลังยาลดกรดที่มี Mg, Al (ประจุบวก) 2 ชม.</td><td>Tendonitis · QT prolongation</td><td>เลี่ยงในหญิงตั้งครรภ์ (cat. C) และเด็ก &lt; 18 ปี</td></tr>
  <tr><td><b>Beta-lactams</b> (amoxicillin/clavulanate, cephalexin, cefdinir, cefixime)</td><td>Amoxicillin/clavulanic acid 1 g BID × 7 วัน</td><td>พร้อมอาหาร</td><td>ท้องร่วง คลื่นไส้ อาเจียน</td><td>ห้ามใช้ในผู้แพ้ penicillin · cat. B</td></tr>
</table></div>` },
  ],
  questions: [
    { q: 'หญิงอายุ 24 ปี มาที่ร้านยา มีอาการปัสสาวะแสบขัด ปัสสาวะบ่อย และปวดหน่วงท้องน้อยมา 1 วัน ไม่มีไข้ ไม่มีปวดสีข้าง ไม่มีตกขาว ไม่มีคันช่องคลอด ไม่ได้ตั้งครรภ์ และไม่เคยเป็น UTI มาก่อน เภสัชกรควรดำเนินการอย่างไร', o: ['จ่าย nitrofurantoin และแนะนำให้ดื่มน้ำมากขึ้น พร้อมติดตามอาการ', 'ส่งโรงพยาบาลทันทีเพื่อเพาะเชื้อปัสสาวะ', 'จ่าย ciprofloxacin เพราะออกฤทธิ์ครอบคลุมกว่า', 'จ่าย fluconazole เนื่องจากอาจเป็นเชื้อราในช่องคลอด', 'แนะนำให้ซื้อแผ่นตรวจปัสสาวะก่อน แล้วค่อยรักษา'], a: 0, e: 'อาการเข้าได้กับ acute uncomplicated cystitis (dysuria, frequency, suprapubic discomfort ไม่มี systemic symptoms) รักษาแบบ empiric ได้ · ไม่จำเป็นต้องเพาะเชื้อ · fluoroquinolone ไม่ใช่ first line เพราะในไทยดื้อยาสูง · เชื้อรามักมีคันหรือตกขาว · urine dipstick ไม่จำเป็นถ้าอาการชัด' },
    { q: 'หญิงอายุ 27 ปี มาขอซื้อยารักษา UTI มีอาการปัสสาวะแสบขัดและปัสสาวะบ่อยมา 2 วัน มีไข้ 38.8°C หนาวสั่น ปวดหลังด้านขวา การจัดการที่เหมาะสมที่สุดคือข้อใด', o: ['จ่าย nitrofurantoin 5 วัน', 'จ่าย fosfomycin 1 ซอง', 'ส่งต่อโรงพยาบาลเพื่อประเมิน pyelonephritis', 'จ่าย trimethoprim-sulfamethoxazole', 'จ่าย phenazopyridine อย่างเดียว'], a: 2, e: 'ไข้และปวดบั้นเอว (flank pain) เข้าได้กับ acute pyelonephritis จึงควรส่งต่อโรงพยาบาล' },
    { q: 'หญิงอายุ 31 ปี เป็น cystitis ครั้งแรก แพทย์สั่ง nitrofurantoin เภสัชกรพบว่าผู้ป่วยมีค่า CrCl 24 mL/min ข้อใดเหมาะสมที่สุด', o: ['จ่าย nitrofurantoin ตามเดิม', 'เพิ่มขนาดยา nitrofurantoin', 'เปลี่ยนเป็นยาที่เหมาะสมกว่าและแจ้งแพทย์', 'แนะนำดื่มน้ำมากขึ้น ยาจะออกฤทธิ์ดีขึ้น', 'ลดระยะเวลาการรักษาเหลือ 3 วัน'], a: 2, e: 'Nitrofurantoin ไม่ควรใช้ในผู้ป่วยที่มี CrCl < 30 mL/min' },
    { q: 'หญิงอายุ 28 ปี ตั้งครรภ์ 18 สัปดาห์ ปัสสาวะแสบขัด ปัสสาวะบ่อย ปวดหน่วงท้องน้อยมา 1 วัน ไม่มีไข้ ไม่มีปวดสีข้าง ไม่มีตกขาวหรือคันช่องคลอด ไม่มีประวัติแพ้ยา แพทย์วินิจฉัยว่าเป็น acute uncomplicated cystitis ยาข้อใดเหมาะสมที่สุด', o: ['Nitrofurantoin 100 mg วันละ 2 ครั้ง นาน 7 วัน', 'Ciprofloxacin 500 mg วันละ 2 ครั้ง นาน 3 วัน', 'Doxycycline 100 mg วันละ 2 ครั้ง นาน 7 วัน', 'Trimethoprim-sulfamethoxazole นาน 3 วัน', 'Levofloxacin 750 mg วันละ 1 ครั้ง นาน 5 วัน'], a: 0, e: 'Nitrofurantoin เป็น first line ของ uncomplicated cystitis ในหญิงตั้งครรภ์ นาน 7 วันในหญิงตั้งครรภ์ · fluoroquinolones ไม่แนะนำในตั้งครรภ์ · tetracyclines ห้ามใช้ (กระดูกและฟันทารก) · TMP-SMX ไม่ใช่ตัวเลือกที่ดีที่สุดในหญิงตั้งครรภ์' },
    { q: 'หญิงอายุ 22 ปี สุขภาพแข็งแรง ปัสสาวะแสบขัด ปัสสาวะบ่อย ปวดหน่วงท้องน้อยมา 2 วัน ไม่มีไข้ ไม่มีปวดสีข้าง แพทย์วินิจฉัยว่าเป็น acute uncomplicated cystitis เชื้อก่อโรคที่พบบ่อยที่สุดคือข้อใด', o: ['Staphylococcus aureus', 'Pseudomonas aeruginosa', 'Escherichia coli', 'Proteus mirabilis', 'Enterococcus faecalis'], a: 2, e: 'E. coli เป็นสาเหตุ 80–90% ของ acute uncomplicated cystitis' },
  ],
}
