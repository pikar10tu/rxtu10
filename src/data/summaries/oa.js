// Osteoarthritis — converted from the RxTU10 class summary PDF (see content/summaries/manifest.json)
// รูป: <img data-fig="oa/pNN-K.webp"> → ตัวแสดงผลเติม src จาก public/summaries/
export default {
  id: 'oa',
  date: '29 ก.ค. 69',
  refs: [
    'พีรพัฒน์ ทรัพย์พฤทธิกุล. เอกสารประกอบการสอนวิชา ภศ.416 หัวข้อ Osteoarthritis. คณะเภสัชศาสตร์ มหาวิทยาลัยธรรมศาสตร์. 2568.',
    'สมาคมรูมาติสซั่มแห่งประเทศไทย. แนวทางเวชปฏิบัติการดูแลรักษาผู้ป่วยโรคข้อเข่าเสื่อม พ.ศ. 2553. https://thairheumatology.org/phocadownload/36/Guideline_003.pdf',
    'Kolasinski SL, et al. 2019 American College of Rheumatology/Arthritis Foundation Guideline for the Management of Osteoarthritis of the Hand, Hip, and Knee. Arthritis Care Res. 2020;72(2):149-62.',
  ],
  sections: [
    { id: 'def', t: 'นิยามและพยาธิสรีรวิทยา', html: `<ul>
  <li>โรคที่มีการเปลี่ยนแปลงไปในทางเสื่อมของข้อ ตำแหน่งที่เปลี่ยนชัดเจนคือ<b>กระดูกอ่อนผิวข้อ (articular cartilage)</b> ในข้อชนิดที่มีเยื่อบุ (diarthrodial joint) โดยกระดูกอ่อนถูกทำลายอย่างช้า ๆ ต่อเนื่องตามเวลา</li>
  <li><b>นิยามใหม่:</b> ไม่ใช่แค่การสึกหรอตามอายุ (wear and tear) แต่เป็น<mark>ความล้มเหลวของข้อต่อทั้งระบบ</mark> ได้แก่ cartilage, synovium, แคปซูลหุ้มข้อ และ subchondral bone</li>
  <li><b>พยาธิสภาพ:</b> การสลายกระดูกอ่อนมากกว่าการสร้าง → กระดูกอ่อนบางลงและขรุขระ</li>
  <li><b>การเปลี่ยนแปลงโครงสร้าง:</b> joint space narrowing, กระดูกใต้กระดูกอ่อนหนาตัว (sclerosis), กระดูกงอก (osteophytes) เพื่อพยายามรักษาความมั่นคงของข้อ</li>
  <li><b>การอักเสบ:</b> synovitis ระดับต่ำ เกี่ยวข้องกับ macrophages และ T-cells กระดูกเกิด remodeling ตอบสนองต่อการอักเสบ</li>
</ul>
<figure><img data-fig="oa/p01-1.webp" alt="เปรียบเทียบข้อปกติกับข้อเสื่อม: กระดูกอ่อนบางลง กระดูกงอก ถุงน้ำในกระดูก เยื่อบุข้ออักเสบ"><figcaption>ข้อปกติเทียบกับข้อเสื่อม (DiPiro's Pharmacotherapy 13th ed.)</figcaption></figure>` },
    { id: 'epi', t: 'ระบาดวิทยาและปัจจัยเสี่ยง', html: `<ul>
  <li>ปี 2020 ประชากรโลกราว 7.6% เป็นโรคข้อเสื่อม พบที่<b>เข่า</b>บ่อยที่สุด รองลงมาคือมือและสะโพก</li>
  <li><b>แก้ไขไม่ได้:</b> พันธุกรรม (มีผล 30–70%), อายุ (มัก &gt; 45 ปี), เพศ (หญิงเสี่ยงกว่าชายหลังอายุ 45 ปี)</li>
  <li><b>แก้ไขได้:</b>
    <ul>
      <li><mark>โรคอ้วน = ปัจจัยเสี่ยงที่สำคัญที่สุดที่ป้องกันได้</mark> BMI เพิ่มทุก 5 หน่วย เพิ่มความเสี่ยง 35%</li>
      <li>อาชีพและกิจกรรม: คุกเข่า นั่งยอง แรงสั่นสะเทือนบ่อย การบาดเจ็บจากกีฬา</li>
    </ul>
  </li>
</ul>` },
    { id: 'dx', t: 'อาการและการวินิจฉัย', html: `<ul>
  <li><b>ปวด (nociceptive):</b> เริ่มช้า ๆ ปวดลึก ๆ แย่ลงเมื่อใช้งาน ดีขึ้นเมื่อพัก</li>
  <li><b>ข้อติด (stiffness):</b> ช่วงเช้าหรือหลังพักนาน ๆ <mark>มักน้อยกว่า 30 นาที</mark></li>
  <li>ข้อติดขัด องศาการเคลื่อนไหวลดลง จำกัดกิจกรรม</li>
  <li><b>ตามตำแหน่ง:</b>
    <ul>
      <li>มือ: monoarticular/asymmetrical พบปุ่มกระดูกที่ข้อปลายนิ้ว (<b>Heberden's nodes</b>) และข้อกลางนิ้ว (<b>Bouchard's nodes</b>)</li>
      <li>เข่า: ปวดเวลาขึ้นบันได มีน้ำในข้อเข่าเป็น ๆ หาย ๆ</li>
      <li>สะโพก: ปวดขาหนีบขณะลงน้ำหนัก</li>
    </ul>
  </li>
  <li><b>วินิจฉัย:</b> เน้นประวัติและตรวจร่างกาย · X-ray ช่วยยืนยัน (ช่องข้อแคบ กระดูกงอกที่ขอบข้อ subchondral sclerosis ถุงน้ำในกระดูก) แต่ระยะแรกอาจปกติ · ผลเลือดมักปกติ ใช้แยกจาก RA หรือเก๊าท์</li>
</ul>
<div class="key"><strong class="k">Red flags</strong>น้ำหนักลด หรือมีไข้ · ข้อติดตอนเช้านาน &gt; 1 ชั่วโมง · ผลเลือดผิดปกติ หรือ WBC ในน้ำไขข้อ &gt; 2,000 cells/mm³</div>` },
    { id: 'nonpharm', t: 'การรักษาโดยไม่ใช้ยา', html: `<p><b>เป้าหมายหลัก:</b> บรรเทาปวด คงการใช้งานของข้อ เพิ่มคุณภาพชีวิต</p>
<p>ช่วยชะลอการดำเนินโรค ควรทำต่อเนื่องในผู้ป่วยทุกราย แม้ได้รับยาอยู่ก็ตาม</p>
<figure><img data-fig="oa/p03-1.webp" alt="ตารางคำแนะนำการรักษาโดยไม่ใช้ยาตามข้อมือ เข่า สะโพก (ACR/AF 2019)"><figcaption>Table 1 คำแนะนำการรักษาที่ไม่ใช้ยา แยกตามข้อ (ACR/AF 2019) · เขียวเข้ม = strongly recommended · เขียวอ่อน = conditionally recommended · แดงเข้ม = strongly against · ชมพู = conditionally against</figcaption></figure>
<ul>
  <li><b>ออกกำลังกาย:</b> บริหารกล้ามเนื้อให้แข็งแรง และออกกำลังกายในน้ำ</li>
  <li><b>ลดน้ำหนัก:</b> แนะนำอย่างยิ่งในข้อเข่าและข้อสะโพก ลดเพียง 5% ก็ลดปวดได้ <mark>เป้าหมายเริ่มต้นอย่างน้อย 10%</mark> เพื่อลดปวดอย่างมีนัยสำคัญ</li>
  <li><b>อุปกรณ์ช่วย:</b> ไม้เท้า อุปกรณ์พยุงข้อ (orthoses) ประคบร้อน/เย็นลดอาการติดขัด</li>
</ul>` },
    { id: 'pharm', t: 'การรักษาโดยใช้ยา', html: `<p>เลือกยาตามตำแหน่งของข้อ</p>
<figure><img data-fig="oa/p04-1.webp" alt="ตารางคำแนะนำการใช้ยาในข้อเสื่อมที่มือ เข่า สะโพก (ACR/AF 2019)"><figcaption>Table 2 คำแนะนำการใช้ยาแยกตามข้อ (ACR/AF 2019)</figcaption></figure>
<div class="tbl"><table>
  <tr><th>Strong recommendation</th><th>Conditional recommendation</th></tr>
  <tr><td>Topical NSAIDs — เข่า<br>Oral NSAIDs<br>IA glucocorticoids — เข่า, สะโพก<br>Ultrasound-guided IA glucocorticoid — สะโพก</td>
      <td>Topical NSAIDs — มือ<br>Topical capsaicin — เข่า<br>IA glucocorticoids — มือ<br>IA glucocorticoids เทียบกับยาฉีดอื่น<br>Acetaminophen<br>Duloxetine<br>Tramadol</td></tr>
</table></div>
<div class="key"><strong class="k">จำง่าย</strong><b>เข่า:</b> topical NSAIDs เป็นอันดับแรก · <b>สะโพก:</b> ฉีดสเตียรอยด์เข้าข้อ (ข้ออยู่ลึก ยาทาไม่ได้ผล) · <b>มือ:</b> oral NSAIDs เป็นหลัก</div>` },
    { id: 'drugs', t: 'ยา', html: `<h3>Acetaminophen (APAP)</h3>
<ul><li>สูงสุดไม่เกิน <b>4 g/day</b> ระวังพิษต่อตับ โดยเฉพาะผู้ที่ดื่มแอลกอฮอล์เป็นประจำ</li></ul>
<h3>Oral NSAIDs</h3>
<ul>
  <li>ลดปวดและอักเสบ · เลือกตามความเสี่ยงด้าน GI, CV และไต</li>
  <li><b>Naproxen</b> ค่อนข้างปลอดภัยต่อหัวใจ · <b>Celecoxib</b> (COX-2 selective) ลดความเสี่ยง GI</li>
  <li><mark>หลีกเลี่ยงในโรคไตรุนแรง (CrCl &lt; 30 mL/min)</mark> <a class="calc-link" href="#" data-calc="crcl">คำนวณ CrCl</a></li>
</ul>
<div class="tbl"><table>
  <tr><th>ครึ่งชีวิต</th><th>ยา</th><th class="num">ขนาดที่แนะนำ</th></tr>
  <tr><td rowspan="3">สั้น (t½ 1–8 ชม.)</td><td>Ibuprofen</td><td class="num">600–1,200 mg</td></tr>
  <tr><td>Nimesulide</td><td class="num">100–200 mg</td></tr>
  <tr><td>Diclofenac</td><td class="num">50–75 mg</td></tr>
  <tr><td rowspan="5">ปานกลาง (t½ 10–20 ชม.)</td><td>Naproxen</td><td class="num">250–500 mg</td></tr>
  <tr><td>Sulindac</td><td class="num">150–200 mg</td></tr>
  <tr><td>Loxoprofen</td><td class="num">60–120 mg</td></tr>
  <tr><td>Meloxicam</td><td class="num">7.5–15 mg</td></tr>
  <tr><td>Celecoxib</td><td class="num">200 mg</td></tr>
  <tr><td rowspan="3">ยาว (t½ 24–36 ชม.)</td><td>Piroxicam</td><td class="num">10 mg</td></tr>
  <tr><td>Nabumetone</td><td class="num">500–1,000 mg</td></tr>
  <tr><td>Etoricoxib</td><td class="num">60 mg</td></tr>
</table></div>
<ul>
  <li><b>Ibuprofen:</b> สูงสุด 3,200 mg/day แบ่งกินวันละ 3–4 ครั้ง</li>
  <li><b>Meloxicam:</b> ขนาดต่ำ (≤ 7.5 mg) ค่อนข้างจำเพาะต่อ COX-2 เมื่อขนาดสูงขึ้น (เช่น 15 mg) ความจำเพาะลดลง</li>
  <li>ใช้ NSAIDs ขนาดต่ำที่สุดที่คุมอาการได้ และระยะสั้นที่สุด</li>
</ul>
<h3>Capsaicin 0.025% / 0.15%</h3>
<ul>
  <li>แสบร้อนบริเวณที่ทา (แตกต่างกันในแต่ละคน) · ทาวันละ 3–4 ครั้ง</li>
  <li>ADR: ระคายเคืองผิว แสบร้อน</li>
  <li><mark>ห้ามใช้ร่วมกับ heating pad พันผ้าแน่น หรือโดนแดดตรงบริเวณที่ทา</mark></li>
</ul>
<h3>Topical NSAIDs (Diclofenac gel)</h3>
<ul>
  <li>แนะนำในข้อเข่าเสื่อม (ดูดซึมเข้ากระแสเลือดน้อย)</li>
  <li>Upper extremity: ครั้งละ 2 g สูงสุดวันละ 4 ครั้ง (ไม่เกิน 8 g/day ต่อข้อ)</li>
  <li>Lower extremity: ครั้งละ 4 g สูงสุดวันละ 4 ครั้ง (ไม่เกิน 16 g/day ต่อข้อ)</li>
  <li>ไม่ใช่ยาแก้ปวดฉับพลัน <b>อาจใช้เวลาถึง 7 วัน</b>จึงเห็นผล</li>
  <li>ห้ามใช้ heating pad หรือ occlusive dressing ทับ · ADR: คัน ผื่น</li>
</ul>
<h3>Intra-articular glucocorticoids</h3>
<ul>
  <li>บรรเทาปวดระยะสั้นที่เข่าและสะโพก (ฉีดสะโพกควรใช้ ultrasound guidance)</li>
  <li><b>ห้ามฉีด:</b> ติดเชื้อในข้อหรือเนื้อเยื่อรอบข้อ, ติดเชื้อในกระแสเลือด, ข้อหลวมคลอน (unstable joint), กระดูกในข้อหัก</li>
  <li>ADR: hypertension, hyperglycemia, dermal/subdermal atrophy · ฉีดบ่อยเกิน → HPA axis suppression</li>
  <li><b>Triamcinolone acetonide:</b> เริ่ม 5–15 mg ต่อข้อใหญ่ ขนาดทั่วไป 10–40 mg ต่อข้อใหญ่ (หลายข้อพร้อมกันรวมไม่เกิน 80 mg)</li>
  <li><b>Methylprednisolone acetate:</b> ข้อเล็ก 4–10 mg ข้อกลาง 10–40 mg ข้อใหญ่ 20–80 mg · ไม่เกินขนาดที่แนะนำเพื่อลดผิวหนังฝ่อ</li>
</ul>
<h3>Duloxetine</h3>
<ul><li>SNRI ใช้เป็น add-on (อาจใช้ ~4 สัปดาห์จึงเห็นผลเต็มที่)</li></ul>
<h3>Tramadol (opioid agonist + SNRI)</h3>
<ul>
  <li>เริ่ม 25 mg/day เพิ่มทีละ 25 mg ทุก 3 วันจนถึง 100 mg/day (25 mg วันละ 4 ครั้ง) แล้วเพิ่มทีละ 50 mg ทุก 3 วันจนถึง 200 mg/day</li>
  <li>หยุดยาต้อง taper ไม่เกิน 10–25% ทุก 2–4 สัปดาห์ (กัน withdrawal)</li>
  <li><mark>CrCl &lt; 30: ให้ทุก 12 ชม. max 200 mg/day</mark> · ตับบกพร่องรุนแรง: 50 mg ทุก 12 ชม. เลี่ยงรูป ER · อายุ &gt; 75 ปี: max 300 mg/day</li>
  <li>ADR: คลื่นไส้ อาเจียน ง่วงซึม ท้องผูก · ระวัง serotonin syndrome เมื่อใช้ร่วมยา serotonergic หรือ CYP2D6/3A4 inhibitor/inducer</li>
</ul>
<h3>Opioids</h3>
<ul><li>ใช้เมื่อการรักษาอื่นล้มเหลวและผ่าตัดไม่ได้เท่านั้น</li></ul>
<h3>Glucosamine & Chondroitin</h3>
<ul>
  <li>เป็น dietary supplement ไม่ได้รับรองข้อบ่งชี้จาก US FDA</li>
  <li><mark>ACR/AF: strong recommendation AGAINST</mark> ขาดหลักฐานลดปวดเข่า/สะโพก</li>
  <li>ไม่ใช่ยาแก้ปวดฉับพลัน อาจใช้เวลาหลายสัปดาห์</li>
  <li>Glucosamine sulfate ขนาดมาตรฐาน 500 mg วันละ 3 ครั้ง (1,500 mg/day)</li>
  <li>ข้อห้าม (level C): แพ้อาหารทะเลมีเปลือก (สกัดจาก shellfish) · หอบหืด (อาจกำเริบ) · เบาหวานและผู้ใช้ warfarin (น้ำตาลสูง หรือผลต่อการแข็งตัวของเลือด)</li>
</ul>` },
  ],
  // ข้อสอบไปอยู่ในคลังข้อสอบอย่างเดียว (P3) ติดป้ายว่ามาจากสรุปนี้
  questions: [
    { q: 'ข้อใดกล่าวถูกต้องเกี่ยวกับโรคและการรักษาโรคข้อเสื่อม (Osteoarthritis)', o: ['ผู้ป่วยมักมี morning stiffness นานกว่า 1 ชั่วโมง', 'ถ้าต้องขึ้น-ลงบันได ให้ก้าวขาข้างที่เจ็บขึ้นก่อน และก้าวขาข้างที่ดีลงตาม', 'การลดน้ำหนักลงอย่างน้อย 10% ช่วยลดอาการปวดข้อเข่าได้อย่างมีนัยสำคัญ', 'Glucosamine sulfate เป็น first-line ในผู้ป่วยข้อเข่าเสื่อมทุกราย', 'ฉีดสเตียรอยด์เข้าข้อซ้ำได้บ่อย ๆ ทุกสัปดาห์โดยไม่มีผลข้างเคียง'], a: 2, e: 'A ผิด: morning stiffness ใน OA มักน้อยกว่า 30 นาที (นานกว่า 1 ชม. สงสัย inflammatory เช่น RA) · B ผิด: "ขึ้นด้วยขาข้างที่ดี ลงด้วยขาข้างที่เจ็บ" · D ผิด: ACR/AF strongly against glucosamine · E ผิด: ฉีดบ่อยทำให้ dermal/subdermal atrophy และ HPA axis suppression' },
    { q: 'ข้อใดเป็นข้อควรระวังหรือข้อห้ามใช้ยาลดปวดในผู้ป่วยโรคข้อเสื่อมได้ถูกต้อง', o: ['Capsaicin cream ใช้ร่วมกับ heating pad เพื่อเพิ่มประสิทธิภาพได้', 'ผู้ที่แพ้อาหารทะเลมีเปลือก (shellfish allergy) ต้องระวังการใช้ glucosamine sulfate', 'Diclofenac gel บรรเทาปวดได้ทันทีภายใน 15 นาทีหลังทาครั้งแรก', 'ผู้ป่วย CKD ที่ CrCl < 30 mL/min ใช้ celecoxib ชนิดกินได้อย่างปลอดภัย', 'Tramadol ไม่ต้องปรับขนาดในผู้ป่วยไตเสื่อม'], a: 1, e: 'A ผิด: capsaicin ห้ามใช้ร่วมความร้อนหรือพันผ้าแน่น · C ผิด: topical NSAIDs อาจใช้ถึง 7 วันจึงเห็นผล · D ผิด: เลี่ยง oral NSAIDs เมื่อ CrCl < 30 · E ผิด: tramadol ต้องปรับเมื่อ CrCl < 30 เป็นทุก 12 ชม. max 200 mg/day' },
    { q: 'หญิง 62 ปี ปวดข้อเข่าทั้งสองข้าง แพทย์วินิจฉัย knee OA ยาลดปวดใดเป็น first-line ที่แนะนำมากที่สุด', o: ['Naproxen', 'Diclofenac gel', 'Glucosamine sulfate', 'Tramadol', 'Paracetamol'], a: 1, e: 'Diclofenac gel (topical NSAIDs) เป็น first-line / strongly recommended ใน knee OA ออกฤทธิ์เฉพาะที่ ดูดซึมเข้ากระแสเลือดน้อย ปลอดภัยสูง' },
    { q: 'การรักษาโดยไม่ใช้ยาข้อใดเป็นเป้าหมายสำคัญที่สุดในการชะลอโรคและลดปวดในผู้ป่วยข้อเข่าเสื่อมที่มีน้ำหนักเกิน', o: ['การฝังเข็ม', 'การลดน้ำหนักให้ได้อย่างน้อย 10%', 'ใส่อุปกรณ์พยุงข้อตลอด 24 ชั่วโมง', 'ประคบร้อนติดต่อกันหลายชั่วโมง', 'พักการใช้งานข้อและนอนติดเตียง'], a: 1, e: 'เป้าหมายเริ่มต้นของการลดน้ำหนักคืออย่างน้อย 10% เพื่อลดปวดอย่างมีนัยสำคัญ' },
    { q: 'ข้อใดเป็นข้อห้ามหรือข้อควรระวังสำคัญของการฉีดสเตียรอยด์เข้าข้อ (intra-articular glucocorticoids)', o: ['ปวดข้อเข่าระยะสั้น', 'ไม่ตอบสนองต่อยาแก้ปวดชนิดกิน', 'ข้อสะโพกเสื่อม', 'ข้อติดขัดหลังทำกิจกรรม', 'มีการติดเชื้อในข้อหรือเนื้อเยื่อรอบข้อ (acute local infection)'], a: 4, e: 'ห้ามฉีดเมื่อมีการติดเชื้อบริเวณนั้น ติดเชื้อในกระแสเลือด ข้อหลวมคลอน หรือกระดูกในข้อหัก' },
    { case: 'หญิง 68 ปี น้ำหนัก 78 kg สูง 155 cm (BMI 32.5) ปวดเข่าขวา 8 เดือน สัมพันธ์กับการเดินและขึ้น-ลงบันได ข้อติดตอนเช้า ~15 นาที เข่าขวาบวมเล็กน้อย มี crepitus · eGFR 24 (CKD stage 4) SCr 2.1 · ไม่แพ้ยา · ได้ยา: 1) Diclofenac 1% gel ทาเข่าขวาวันละ 4 ครั้ง 2) Paracetamol 500 mg 1 เม็ด q6h prn 3) Celecoxib 200 mg 1×1 pc 4) Glucosamine sulfate 500 mg 1×3 pc (ใช้ตอบข้อ 6–8)', q: 'อาการของผู้ป่วยสอดคล้องกับโรคใดมากที่สุด', o: ['Rheumatoid arthritis', 'Osteoporosis', 'Osteoarthritis', 'Gouty arthritis', 'Septic arthritis'], a: 2, e: 'ปวดสัมพันธ์กับการใช้งาน/ขึ้นบันได morning stiffness < 30 นาที (15 นาที) และมี crepitus เป็นลักษณะเด่นของ OA' },
    { q: 'ยาในใบสั่งยาตัวใด "ไม่ควรได้รับ" มากที่สุด', o: ['Diclofenac 1% gel', 'Paracetamol 500 mg', 'Celecoxib 200 mg', 'Glucosamine sulfate 500 mg', 'ถูกทั้ง C และ D'], a: 2, e: 'CKD stage 4 (eGFR 24 < 30) เป็นข้อห้าม/หลีกเลี่ยง oral NSAIDs ทุกชนิดรวม celecoxib เพราะยับยั้ง prostaglandin → renal blood flow ลด ไตแย่ลง' },
    { q: 'ข้อใดเป็นคำแนะนำที่ "ไม่เหมาะสม" สำหรับผู้ป่วยรายนี้', o: ['ล้างมือด้วยสบู่ทันทีหลังทา diclofenac gel', 'ตั้งเป้าลดน้ำหนักอย่างน้อย 10%', 'ถ้าปวดมากขึ้น วางแผ่นประคบร้อนทับบริเวณที่ทา diclofenac gel เพื่อให้ออกฤทธิ์ดีขึ้น', 'กิน paracetamol ไม่เกินวันละ 8 เม็ด (4,000 mg/day)', 'บริหารกล้ามเนื้อต้นขา (quadriceps strengthening)'], a: 2, e: 'ยาทา NSAIDs (รวม capsaicin) ห้ามใช้ร่วม heating pad หรือพันผ้าแน่น เพราะเพิ่มการดูดซึมเข้ากระแสเลือดเร็ว และระคายเคือง/ผิวไหม้พองได้' },
  ],
}
