// Osteoporosis — converted from the RxTU10 class summary PDF (see content/summaries/manifest.json)
export default {
  id: 'osteoporosis',
  date: '26/07/2569',
  refs: [
    'Suchada Soorapan. Osteoporosis: prevention and treatment [เอกสารประกอบการสอน]. 2025',
    'มูลนิธิโรคกระดูกพรุนแห่งประเทศไทย. คำแนะนำเวชปฏิบัติการดูแลรักษาโรคกระดูกพรุน พ.ศ. 2564. https://w1.med.cmu.ac.th/family/knowledge/for-doctor/guideline/4996',
    'คณะแพทยศาสตร์โรงพยาบาลรามาธิบดี. แคลเซียม กินอย่างไรให้ดีต่อร่างกาย? (Rama Channel) 2024',
    'Alendronate: Drug information. UpToDate',
  ],
  sections: [
    { id: 'def', t: 'นิยามและระบาดวิทยา', html: `<p><b>Definition:</b> การสูญเสียความหนาแน่นของมวลกระดูก ความแข็งแรงของกระดูกลดลง → กระดูกเปราะบาง → เสี่ยงกระดูกหัก</p>
<p><b>ความทนทานของกระดูก</b> ขึ้นกับความหนาแน่นของกระดูก (BMD: bone mineral density) และคุณภาพของกระดูก</p>
<h3>Epidemiology</h3>
<ul>
  <li>เสี่ยงตามอายุและเพศ คนอายุ 50 ปีขึ้นไปเป็น OP แล้ว 55%</li>
  <li>ในไทยความชุกเพิ่มขึ้นตามอายุ · หญิง 50–59 ปี มีโอกาสเป็น 7% · หญิง 80 ปีขึ้นไป เพิ่มขึ้นถึง 35%</li>
  <li>หญิง 40 ปีขึ้นไป มักเป็นกระดูกพรุนที่ lumbar spine และ hip</li>
  <li>หญิง 50 ปีขึ้นไป กระดูก hip หักบ่อยกว่าผู้ชายถึง 2 เท่า</li>
  <li>ผู้ป่วยกระดูก hip หัก ยิ่งอยู่โรงพยาบาลนาน mortality ยิ่งสูง</li>
</ul>
<p><b>ตำแหน่งที่หัก/แตกบ่อย:</b> spine (กระดูกสันหลัง), hip (สะโพก), wrist (ข้อมือ)</p>
<p><b>ภาวะแทรกซ้อนระยะยาว:</b> ปวดเรื้อรัง การเคลื่อนไหวลดลง ซึมเศร้า · กระดูกสันหลังหักจะมีอาการตามมา เช่น หลังค่อม (kyphosis) กระดูกสันหลังคด (scoliosis)</p>` },
    { id: 'bone', t: 'เซลล์กระดูกและ bone remodeling', html: `<ul>
  <li><b>เซลล์สร้างกระดูก</b> = osteoblasts, osteoprogenitor cell และ osteocytes</li>
  <li><b>เซลล์สลายกระดูก</b> = osteoclasts</li>
</ul>
<p>กระดูกแบ่งเป็น 2 ประเภท: <b>cortical bone</b> หนาแน่นมาก และ <b>trabecular (cancellous) bone</b> มีลักษณะพรุนเหมือนฟองน้ำ</p>
<ul>
  <li>กระดูกเป็นเนื้อเยื่อที่เปลี่ยนแปลงตลอดเวลา</li>
  <li>เกิดมากใน trabecular bone เพื่อซ่อมแซมความเสียหาย โดยการสลายเกิดขึ้นก่อนแล้วจึงสร้างใหม่</li>
  <li><mark>วัยเด็ก: สร้าง &gt; สลาย · อายุ 35 ปีขึ้นไป: สลาย &gt; สร้าง</mark></li>
  <li>ก่อนหมดประจำเดือนสลายช้า ๆ 0.3–0.5% ต่อปี · หลังหมดประจำเดือน 5–8 ปีแรกสลายเร็วขึ้น 10 เท่า</li>
</ul>
<p><b>Bone remodeling:</b> ภาวะปกติ = สลายแล้วสร้างใหม่ได้เท่า ๆ กัน · ภาวะ BMD loss = สลาย &gt; สร้าง → เสี่ยง OP</p>
<h3>Classification</h3>
<ul>
  <li><b>Primary OP</b> (ไม่ทราบสาเหตุ)
    <ul>
      <li>Postmenopausal OP: สูญเสีย BMD หลังเอสโตรเจนลดลง/หมด</li>
      <li>Age-related OP: อายุมากขึ้น กระดูกเสื่อม สร้างกระดูกใหม่ได้ลดลง เกิดได้ทั้งชายและหญิง</li>
    </ul>
  </li>
  <li><b>Secondary OP</b> (ทราบสาเหตุ)
    <ul>
      <li>โรคอื่น เช่น เบาหวาน ไตวายเรื้อรัง ไทรอยด์ มะเร็ง · ยาสเตียรอยด์ ยากันชัก</li>
      <li>ขาดวิตามินดี → ดูดซึม Ca ลดลง → PTH เพิ่ม → กระดูกสลายเพื่อเพิ่ม Ca ในเลือด</li>
    </ul>
  </li>
</ul>` },
    { id: 'risk', t: 'ปัจจัยเสี่ยง', html: `<p><b>Factors ใน WHO fracture risk assessment tool (FRAX):</b> BMD ต่ำ, เพศหญิง, อายุ 65 ปีขึ้นไป, พันธุกรรม, เอเชีย/ผิวขาว, ผอมมาก, เคยกระดูกหักเล็กน้อย, แอลกอฮอล์ ≥ 3 ดริงก์/วัน, secondary OP โดยเฉพาะ RA, ใช้ยาสเตียรอยด์</p>
<div class="tbl"><table>
  <tr><th>ปรับเปลี่ยนไม่ได้</th><th>ปรับเปลี่ยนได้</th></tr>
  <tr><td>เพศหญิง, อายุ 65 ปีขึ้นไป, พันธุกรรม, เอเชีย/ผิวขาว, ถูกตัดรังไข่/หมดประจำเดือนก่อนอายุ 45 ปี, โครงสร้างร่างกายเล็ก, ตนเองหรือพ่อแม่พี่น้องเคยกระดูกหักไม่รุนแรง</td>
      <td>BMD ต่ำ, ได้รับแคลเซียมไม่พอ, BMI &lt; 19 kg/m², sedentary lifestyle, สูบบุหรี่, ดื่มกาแฟ/เหล้าปริมาณมากประจำ, ขาดเอสโตรเจน</td></tr>
</table></div>` },
    { id: 'dx', t: 'วินิจฉัยและประเมินความเสี่ยง', html: `<p>ตรวจวัดความหนาแน่นของกระดูก (DXA)</p>
<div class="tbl"><table>
  <tr><th></th><th>Central DXA</th><th>Peripheral DXA</th></tr>
  <tr><td>ตรวจ</td><td>กระดูกแกนกลาง (สันหลังเอว สะโพก)</td><td>กระดูกรยางค์ (ข้อมือ ข้อนิ้ว ส้นเท้า)</td></tr>
  <tr><td>ข้อดี</td><td>แม่นยำ เป็นมาตรฐานหลัก</td><td>เครื่องเล็ก ราคาถูก เข้าถึงง่าย</td></tr>
  <tr><td>ข้อเสีย</td><td>เครื่องใหญ่ ราคาแพง</td><td>แค่สกรีนเบื้องต้นคร่าว ๆ ถ้าเสี่ยงต้องตรวจ central DXA ยืนยัน</td></tr>
</table></div>
<h3>T-score — หญิงวัยหมดประจำเดือน, ชาย 50 ปีขึ้นไป</h3>
<p>เปรียบเทียบ BMD กับ<b>คนอายุ ~30 ปี</b>ที่สุขภาพดี เพศและเชื้อชาติเดียวกัน</p>
<div class="tbl"><table>
  <tr><th class="num">T-score</th><th>แปลผล</th></tr>
  <tr><td class="num">≥ −1.0</td><td>กระดูกปกติ (normal)</td></tr>
  <tr><td class="num">−1.0 ถึง −2.5</td><td>กระดูกบาง (osteopenia)</td></tr>
  <tr><td class="num">≤ −2.5</td><td>กระดูกพรุน (osteoporosis)</td></tr>
  <tr><td class="num">≤ −2.5 + เคยกระดูกหัก</td><td>severe osteoporosis</td></tr>
</table></div>
<h3>Z-score — หญิงก่อนหมดประจำเดือน, ชาย ≤ 50 ปี</h3>
<p>เปรียบเทียบ BMD กับ<b>คนอายุเท่ากัน</b> (จำ: Z = อายุเท่ากัน เด็กเจนซี) · &gt; −2.0 = ปกติ · ≤ −2.0 = ความหนาแน่นกระดูกน้อย · ถ้ายังไม่เข้าเกณฑ์ลองสกรีนด้วย FRAX ก่อน</p>
<h3>Screen ความเสี่ยงในอนาคต: FRAX</h3>
<p>ประเมินทางอินเทอร์เน็ตได้ “คาดการณ์ความเสี่ยงกระดูกหักใน 10 ปีข้างหน้า” · <mark>FRAX สะโพก ≥ 3% หรือกระดูกอื่น ≥ 20% → เริ่มยาป้องกันรักษา</mark></p>
<p><b>เป้าหมายการรักษา:</b> ลดความเสี่ยงกระดูกหัก · ไม่ให้มวลกระดูกลดไปมากกว่านี้ · เพิ่มคุณภาพชีวิต (ลดปวด ลดพึ่งพาคนอื่น)</p>` },
    { id: 'nonpharm', t: 'การรักษาโดยไม่ใช้ยา', html: `<ul>
  <li><b>ลดการสูญเสียมวลกระดูก</b> + รับสารอาหารที่จำเป็นอย่างเพียงพอ
    <ul>
      <li>ออกกำลังกายได้ทุกรูปแบบ</li>
      <li>อาหาร: กาแฟไม่เกิน 2 แก้ว/วัน กินโปรตีนให้เพียงพอ</li>
      <li><b>แคลเซียม</b> (อายุ &gt; 50 ปี): 1,000 mg/day (elemental) · <b>วิตามินดี</b> 600–800 IU/day</li>
      <li>เลิกบุหรี่</li>
    </ul>
  </li>
  <li><b>ป้องกันการหกล้ม:</b> ประเมินการทรงตัว แก้ปัญหาเท้าผิดรูป/สายตา ปรับปรุงสภาพแวดล้อม</li>
</ul>` },
    { id: 'indic', t: 'ข้อบ่งชี้การใช้ยา', html: `<p><b>ข้อบ่งชี้หลัก</b> (ข้อใดข้อหนึ่ง)</p>
<ul>
  <li>กระดูกสันหลังหรือสะโพกหักจากโรคกระดูกพรุน</li>
  <li>T-score ≤ −2.5</li>
  <li>T-score −1.0 ถึง −2.5 ร่วมกับ FRAX ≥ 3%</li>
  <li>T-score −1.0 ถึง −2.5 ร่วมกับกระดูกหักจากโรคกระดูกพรุนที่ proximal humerus, pelvis หรือ forearm</li>
</ul>
<p><b>ข้อบ่งชี้รอง:</b> หญิงวัยหมดประจำเดือนและชาย ≥ 50 ปี ที่ BMD (axial DXA) สันหลังหรือสะโพก −1.0 &gt; T-score &gt; −2.5 ร่วมกับอย่างน้อย 1 ข้อ</p>
<ul>
  <li>กระดูกหักอย่างน้อย 1 แห่ง (ตำแหน่งอื่น) จากอันตรายไม่รุนแรงหลังอายุ 40 ปี</li>
  <li>ได้ glucocorticoid นาน (prednisolone ≥ 7.5 mg/d หรือเทียบเท่า นานกว่า 3 เดือน) — GIO</li>
  <li>Secondary OP</li>
  <li>ความเสี่ยงสูงจาก FRAX</li>
  <li>ปัจจัยเสี่ยงทางคลินิก ≥ 2 ข้อ: หญิง ≥ 65 ปี / ชาย ≥ 70 ปี · BMI &lt; 19 · บิดามารดากระดูกสะโพกหักจาก OP · หมดประจำเดือนก่อน 45 ปี · สูบบุหรี่ประจำ</li>
</ul>
<h3>ยา 3 กลุ่ม</h3>
<ol>
  <li><b>Anti-resorptive</b> (ยับยั้งการสลายกระดูก): bisphosphonates, raloxifene, denosumab, calcitonin, estrogen</li>
  <li><b>Anabolic</b> (กระตุ้นการสร้างกระดูกใหม่): teriparatide</li>
  <li><b>Mixed action:</b> strontium ranelate, menatetrenone, romosozumab</li>
</ol>` },
    { id: 'bp', t: 'Bisphosphonates', html: `<div class="key"><strong class="k">1ST LINE</strong>Oral bisphosphonates (กระดูกพรุนระดับ moderate–high) · ห้ามใช้/ทนไม่ได้ → IV bisphosphonate, teriparatide, denosumab หรือ SERMs (raloxifene), estrogen</div>
<ul>
  <li><b>MOA:</b> ยับยั้ง osteoclast</li>
  <li><b>PK:</b> %BA &lt; 1% (ต่ำมาก) · t½ นานมาก 10 ปีขึ้นไป · ขับทางไต</li>
  <li><b>Efficacy:</b> ลดความเสี่ยงกระดูกสันหลังหักและสะโพกหัก (ยกเว้น ibandronate อาจไม่ช่วยกระดูกสะโพก) ทุกตัวเพิ่ม BMD สันหลังและสะโพก · เพิ่ม BMD ได้ดีที่สุดใน 12 เดือนแรก</li>
  <li><b>S/E:</b> พบบ่อยสุด <mark>แสบท้องทันทีหลังกินยา</mark> · rare: แผลที่หลอดอาหาร GI bleeding, <b>osteonecrosis of jaw</b> (ขากรรไกรตาย), <b>atypical femoral fracture</b> (กระดูกต้นขาหัก)</li>
  <li><b>C/I:</b> eGFR &lt; 30 mL/min, serious GI conditions</li>
  <li><b>IV S/E:</b> acute phase reaction (ไข้ ปวดกล้ามเนื้อ GI ตาอักเสบ) จากการที่ osteoclast ตาย → immune จับซากได้ → อักเสบ</li>
</ul>
<figure><img data-fig="osteoporosis/p03-1.webp" alt="ภาพ osteonecrosis of jaw และ atypical femoral fracture"><figcaption>Osteonecrosis of jaw และ atypical femoral fracture</figcaption></figure>
<div class="tbl"><table>
  <tr><th>ยา</th><th>ขนาด</th></tr>
  <tr><td>Alendronate</td><td class="num">70 mg กิน 1 เม็ด/สัปดาห์</td></tr>
  <tr><td>Risedronate</td><td class="num">35 mg กิน 1 เม็ด/สัปดาห์</td></tr>
  <tr><td>Ibandronate</td><td class="num">150 mg กิน 1 เม็ด/เดือน · 3 mg ฉีด IV ทุก 3 เดือน</td></tr>
  <tr><td>Zoledronic acid</td><td class="num">5 mg IV ปีละ 1 ขวด</td></tr>
</table></div>
<p style="font-size:.9em">ยาฉีด IV จะอยู่ได้นานกว่า ใช้นาน ๆ ที</p>
<h3>วิธีกิน oral bisphosphonates</h3>
<ul>
  <li>กินก่อนอาหารเช้าเท่านั้น <b>พร้อมน้ำเปล่าเท่านั้น</b></li>
  <li>ห้ามบด หัก เคี้ยว (สัมผัสเนื้อเยื่อทางเดินอาหารทำให้อักเสบ)</li>
  <li><mark>หลังกิน 30–60 นาที ห้ามกินอย่างอื่น ห้ามเอนนอน</mark> (ยาไหลย้อนกลับมาหลอดอาหาร)</li>
  <li>ลืมยารายสัปดาห์: กินวันถัดไปที่นึกได้ ถ้าลืมเกิน 1 วันให้ข้ามไปเลย · ลืมยารายเดือน: กินภายใน 7 วันก่อนเริ่มโดสถัดไป</li>
</ul>
<h3>IV bisphosphonate</h3>
<ul>
  <li>ตรวจแคลเซียมในเลือดก่อนฉีด ค่าต้องปกติ</li>
  <li>infusion นานกว่า 15 นาที · ใช้ในคนไตปกติเท่านั้น (ขับทางไต)</li>
  <li>ไม่จำเป็นต้องห้ามกินยา ห้ามนอนราบ</li>
</ul>
<h3>Duration & drug holiday</h3>
<ul>
  <li>ต้องพักยาเพราะยาสะสมในกระดูก เพื่อลด S/E (atypical fracture)</li>
  <li>เกณฑ์: หญิงวัยหมดประจำเดือนใช้ <b>PO &gt; 5 ปี / IV &gt; 3 ปี</b> · ไม่มีประวัติกระดูกหักรุนแรง · T-score สะโพก &gt; −2.5 · ความเสี่ยงกระดูกหักต่ำ</li>
  <li><b>ห้าม drug holiday:</b> glucocorticoid-induced OP และผู้ชายที่เป็นโรคกระดูกพรุน</li>
</ul>` },
    { id: 'others', t: 'Denosumab, SERMs, Calcitonin, Estrogen', html: `<h3>Denosumab</h3>
<ul>
  <li>Biological product กลุ่ม humanized monoclonal antibody</li>
  <li><b>MOA:</b> จับยับยั้ง RANKL ไม่ให้ osteoclast precursor กลายเป็น mature osteoclast → ลดการสลายกระดูก</li>
  <li>ยาทางเลือกในการรักษา OP · ไม่ถูกขับทางไต <mark>ใช้ได้ในคนไตบกพร่อง</mark></li>
  <li>ฉีด SC ที่ต้นขา ต้นแขน หน้าท้อง <b>ทุก 6 เดือน</b> โดยผู้ป่วยหรือบุคลากรที่ผ่านการอบรม</li>
  <li>S/E: ปวด บวมบริเวณที่ฉีด ปวดข้อ/กล้ามเนื้อ dermatitis, skin infection · rare: osteonecrosis of jaw, atypical femoral fracture, <b>hypocalcemia (ต้องแก้ Ca ก่อนใช้ยา)</b></li>
  <li><mark>ห้ามหยุดยาเอง</mark> — denosumab ลด osteoclast แต่ precursor ยังสร้างต่อและสะสม เมื่อหยุดยา RANKL ออกมาจับ precursor ได้ osteoclast จำนวนมาก กระดูกสลายตูมเดียว หลังหยุด 6 เดือนเสี่ยงหักมากขึ้น · <b>ถ้าจะหยุดต้องต่อด้วย bisphosphonate</b></li>
</ul>
<h3>SERMs: Raloxifene (เฉพาะ postmenopausal OP)</h3>
<ul>
  <li>ออกฤทธิ์คล้ายเอสโตรเจน · กินวันละครั้งเวลาเดิมทุกวัน อาหารไม่มีผล</li>
  <li>S/E: ร้อนวูบวาบ ปวดขา ปวดหัว เหงื่อออกมาก นอนไม่หลับ ตะคริวที่ขาบ่อย · <b>เพิ่มเสี่ยง VTE ใน 2 ปีแรก</b> ไม่ควรใช้ในคนเสี่ยง</li>
  <li>C/I: มีประวัติ VTE, ตั้งครรภ์, วางแผนตั้งครรภ์, ให้นมบุตร</li>
  <li>DI: highly protein bound 95%</li>
  <li>เลี่ยงในคนเป็นมะเร็งเต้านม มะเร็งปากมดลูก CVD stroke VTE</li>
</ul>
<h3>Calcitonin</h3>
<ul>
  <li><b>MOA:</b> ฮอร์โมนจับ calcitonin receptor ของ osteoclast ยับยั้งการสลายกระดูก</li>
  <li>ใช้เฉพาะ postmenopausal OP ที่ใช้ raloxifene ไม่ได้</li>
  <li>ยาน้ำพ่นจมูก ครั้งละ 1 กด วันละครั้ง สลับข้างรูจมูกทุกวัน · ใช้รักษาอาการปวดจากกระดูกสันหลังหักควรใช้ระยะสั้น 4 สัปดาห์ · ยาฉีด SC/IM ไม่ค่อยใช้ (S/E เยอะ แพง)</li>
  <li><b>Efficacy:</b> ระงับปวด ลดเสี่ยงกระดูกแตกได้ถึง 30% เหมาะกับ vertebral fracture ในหญิงหมดประจำเดือน</li>
  <li>AE: น้ำมูกไหล คัดจมูก ระคายเคืองจมูก เลือดกำเดา · มีรายงานว่าก่อมะเร็งได้ จึงเป็นตัวเลือกท้าย ๆ</li>
</ul>
<h3>Hormone therapy: Estrogen</h3>
<ul>
  <li>ใช้ใน postmenopausal OP และเป็นตัวเลือกแรกในคนที่หมดประจำเดือนก่อนกำหนด</li>
  <li>ให้ progestin ร่วมเฉพาะหญิงที่ยังมีมดลูก เพื่อป้องกันเยื่อบุมดลูกหนาตัวผิดปกติ</li>
</ul>` },
    { id: 'anabolic', t: 'Teriparatide และยาเสริม', html: `<h3>Teriparatide (anabolic)</h3>
<ul>
  <li>เป็น parathyroid hormone · <b>เพิ่ม lumbar spine BMD ได้มากกว่ายาอื่น</b> ลดอาการปวดหลังรุนแรงได้มากกว่า bisphosphonates และ hormone therapy</li>
  <li>ใช้ได้ทั้งชาย ≥ 50 ปีและหญิงหมดประจำเดือน ที่เสี่ยงกระดูกหักสูง หรือยาอื่นไม่ตอบสนอง</li>
  <li>25 mcg SC วันละครั้งก่อนนอน ที่ต้นขาหรือหน้าท้อง ฉีดทันทีหลังนำออกจากตู้เย็น</li>
  <li><mark>ไม่ควรใช้ต่อเนื่องเกิน 2 ปี</mark> (เสี่ยงกระดูกบาง) · วัด Ca, vitamin D, PTH ก่อนใช้</li>
  <li>AE: hypercalcemia ชั่วคราว, hyperuricemia (ระวังในคนเป็นเก๊าท์)</li>
  <li>ไม่ใช้ในคนเสี่ยง osteosarcoma (เคยฉายแสงที่กระดูก ALP สูงไม่ทราบสาเหตุ) · ไม่แนะนำถ้ามีประวัติมะเร็งใน 5 ปี</li>
  <li>C/I: hypercalcemia, hyperuricemia, ไตวาย, ตั้งครรภ์/ให้นมบุตร, hyperparathyroidism</li>
</ul>
<h3>Calcium 1,000 mg</h3>
<ul>
  <li>ใช้ป้องกันร่วมกับวิตามินดี แนะนำเฉพาะรายที่ได้แคลเซียมจากอาหารไม่พอ · ผลต่อการรักษาน้อยกว่า</li>
  <li>AE: ท้องอืด จุกเสียด ท้องผูก (calcium citrate AE น้อยกว่า carbonate) · โดสสูงเสี่ยงนิ่วในไต</li>
  <li>กินทันทีหลังอาหารช่วยการดูดซึม</li>
  <li><b>DI:</b> รบกวนการดูดซึมธาตุเหล็ก tetracyclines quinolones bisphosphonate PPI — กินห่างอย่างน้อย 2 ชม.</li>
</ul>
<div class="tbl"><table>
  <tr><th></th><th>Calcium carbonate (40%)</th><th>Calcium citrate (21%)</th></tr>
  <tr><td>แคลเซียม</td><td>เยอะ ราคาถูก</td><td>น้อยกว่า</td></tr>
  <tr><td>วิธีกิน</td><td>พร้อมอาหาร ใช้กรดในกระเพาะช่วยย่อยและดูดซึม</td><td>ตอนไหนก็ได้ (ท้องว่างก็ได้) เหมาะกับคนกรดน้อยหรือกินยาลดกรด</td></tr>
</table></div>
<h3>Vitamin D</h3>
<ul>
  <li>เพิ่มการดูดซึมแคลเซียม ลดการขับทางปัสสาวะ</li>
  <li>วันละไม่ต่ำกว่า 800 IU/d ไม่เกิน 4,000 IU/d</li>
  <li>Vitamin D + calcium ลดเสี่ยง hip และ non-vertebral fracture เล็กน้อย (&lt; 20%) เพิ่ม BMD แต่ไม่ลด vertebral fracture</li>
  <li>AE: คลื่นไส้ ท้องผูก · ผู้ที่ได้ยารักษากระดูกพรุนอื่นต้องได้ calcium + vitamin D เพียงพอร่วมด้วย</li>
</ul>
<h3>Vitamin K analogue: Menatetrenone</h3>
<ul>
  <li>กระตุ้นการสร้างและยับยั้งการสลายกระดูก</li>
  <li>ลด lumbar spine fracture ได้ 50% แต่ผลต่อ non-vertebral fracture ไม่ชัดเจน</li>
  <li>กิน TID pc · <mark>ไม่ควรใช้ในผู้ที่ได้ warfarin</mark></li>
</ul>` },
  ],
  questions: [
    { q: 'นางฉันทนา เลิกใช้ raloxifene เพราะผลข้างเคียง แพทย์เปลี่ยนเป็น alendronate 10 mg 1 tab OD และ calcium carbonate 1,000 mg 1 tab OD คำแนะนำการใช้ยาข้อใด "ไม่ถูกต้อง"', o: ['กิน alendronate ตอนท้องว่าง เช่น ตื่นนอนตอนเช้ายังไม่ได้กิน/ดื่มอะไร หรือ 2 ชม. ก่อนหรือหลังอาหาร', 'กินกับน้ำเปล่าเท่านั้น ห้ามกินกับน้ำผลไม้ นม หรือเครื่องดื่มอื่น', 'ไม่เอนตัวหรือนอนขณะกิน หรือหลังกินไม่เกิน 30 นาที', 'กิน alendronate และเม็ดแคลเซียมพร้อม ๆ กัน', 'ถ้ากลืนลำบาก ปวดท้อง ให้กลับไปพบแพทย์'], a: 3, e: 'Alendronate ต้องกินตอนท้องว่าง อาหารทุกชนิดรบกวนการดูดซึม และแคลเซียมควรกินห่างจากยาอื่น 2–4 ชั่วโมง' },
    { case: 'หญิงไทยคู่ 60 ปี สูง 157 cm น้ำหนัก 75 kg ปวดสะโพก ขยับตัวแล้วปวดมาก 1 ชม. ก่อนมาโรงพยาบาลหกล้มในห้องน้ำ X-ray กระดูกสะโพกหัก BMD T-score −2.6 อาชีพเกษตรกร ไม่ได้ออกกำลังกาย ปวดหลังทำงานจะซื้อยาต้มสมุนไพรจากรถแร่มากิน ไม่สูบบุหรี่ ไม่ดื่มสุรา ไม่มีโรคประจำตัว ปฏิเสธการแพ้ยา (ใช้ตอบข้อ 2–4)', q: 'จากการซักประวัติเป็นโรคใด', o: ['Osteopenia', 'Osteoporosis', 'Osteoarthritis', 'Gout', 'Rheumatoid arthritis'], a: 1, e: 'BMD T-score −2.6 ซึ่ง WHO นิยามโรคกระดูกพรุนไว้ที่ BMD น้อยกว่าหรือเท่ากับ −2.5' },
    { q: 'ข้อใด "ไม่ใช่" ปัจจัยเสี่ยงของผู้ป่วยรายนี้ที่ทำให้เกิดโรค', o: ['น้ำหนักตัว', 'อายุ', 'ค่า T-score −2.6', 'กินยาต้มสมุนไพรแก้ปวด', 'อาชีพเกษตรกร ไม่ได้ออกกำลังกาย'], a: 3, e: 'ข้ออื่นเป็นปัจจัยเสี่ยงของโรคกระดูกพรุน ยกเว้นยาต้มสมุนไพร เพราะโจทย์ไม่ระบุว่าเป็นสมุนไพรชนิดใด จึงไม่รู้ว่ามีผลต่อกระดูกหรือไม่' },
    { q: 'ข้อใดเป็นยาที่เหมาะสมกับผู้ป่วยรายนี้ และกล่าวถูกต้องเกี่ยวกับยาที่ใช้รักษา', o: ['Calcium ดูดซึมเพิ่มขึ้นเมื่อเพิ่มขนาดมากขึ้น และ vitamin D เพิ่ม blood calcium โดยเพิ่มการดูดซึมที่ทางเดินอาหาร', 'Methotrexate เป็น dihydrofolate inhibitor ทำให้การสร้าง folic acid และ purine ลดลง', 'Bisphosphonates เพิ่มการเกาะของแคลเซียมกับกระดูก และกระตุ้นการทำงานของ osteoclast', 'Raloxifene เป็น agonist ที่ estrogen receptor ที่เนื้อเยื่อกระดูก', 'Corticosteroids เพิ่มการขับ calcium ทางปัสสาวะ ผู้ที่ใช้นานควรได้ calcium'], a: 3, e: 'Raloxifene มีข้อบ่งใช้เฉพาะหญิงวัยหมดประจำเดือนที่เป็นโรคกระดูกพรุน ผู้ป่วยเป็นหญิง 60 ปีหมดประจำเดือนแล้วและเป็นโรคกระดูกพรุน จึงเหมาะสม' },
    { q: 'ยาข้อใด "ไม่ได้" เป็น drug-induced osteoporosis', o: ['Phenytoin', 'Phenobarbital', 'Depot medroxyprogesterone acetate', 'Corticosteroids', 'Chloroquine'], a: 4, e: 'Chloroquine ไม่ได้เหนี่ยวนำให้เกิดโรคกระดูกพรุน แต่ข้อควรระวังคือมีผลต่อจอประสาทตา' },
  ],
}
