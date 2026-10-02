// Wound (acute wound, abscess, burn, scar, warts/corns, hair loss) — converted from the RxTU10 class summary PDF
export default {
  id: 'wound',
  date: '25/07/2569',
  refs: [
    'เครือวิทย์ น. Wound management. คณะแพทยศาสตร์โรงพยาบาลรามาธิบดี ภาควิชาศัลยศาสตร์; 2011.',
    'สุริยะ ส. Practical dermatology and wound care in community pharmacy [เอกสารคำสอน]. 2025.',
    'สาโรวาท ผนอ. Wound healing and wound care. คณะแพทยศาสตร์โรงพยาบาลรามาธิบดี',
    'การปฐมพยาบาลด้วยสมุนไพร: สมุนไพรสำหรับอาการภายนอก. คณะเภสัชศาสตร์ มหาวิทยาลัยมหิดล; 2018',
    'น้ำนมราชสีห์ กลุ่มยารักษาหูด. โรงพยาบาลเฉลิมพระเกียรติ จ.น่าน; 2010',
    'แนวทางการดูแลรักษาผู้ป่วยโรคผมร่วงเป็นหย่อม (Alopecia areata). ราชวิทยาลัยอายุรแพทย์; 2025.',
    'จารุวิจิตรรัตนา ศส. ผู้ป่วยโรคผมร่วงและผมบาง. คณะแพทยศาสตร์โรงพยาบาลรามาธิบดี',
    'สมุนไพรช่วยแก้ผมร่วงได้จริงหรือไม่. Bangkok Hair Clinic; 2023',
  ],
  sections: [
    { id: 'acute', t: 'Acute wound & infection', html: `<p>บาดแผล = การทำลายโครงสร้างเนื้อเยื่อบนผิวหนัง</p>
<div class="tbl"><table>
  <tr><th>แผลสดที่สะอาด (ต้องเข้าเกณฑ์ทุกข้อ)</th><th>แผลที่ควรให้ยาปฏิชีวนะ (ข้อใดข้อหนึ่ง)</th></tr>
  <tr><td>ขอบเรียบ ทำความสะอาดง่าย · ไม่ลึกถึงกล้ามเนื้อ เอ็น กระดูก · ไม่มีเนื้อตาย · ไม่มีสิ่งสกปรก หรือล้างออกง่าย · ไม่ปนเปื้อนอุจจาระ ปัสสาวะ เศษอาหาร</td>
      <td>ขอบไม่เรียบ เย็บไม่สนิท · ยาว &gt; 5 cm · จากการบดอัด (เช่น ประตูหนีบแรง) · ลึกถึงกล้ามเนื้อ เอ็น กระดูก · <mark>ภูมิคุ้มกันบกพร่อง</mark> เช่น เบาหวาน ตับแข็ง มะเร็ง ยากดภูมิ</td></tr>
</table></div>
<h3>Acute wound healing</h3>
<ol>
  <li><b>Coagulation:</b> หลอดเลือดฉีกขาด → vasoconstriction, platelet aggregation → ลิ่มเลือดหยุดเลือด ปล่อย cytokine กระตุ้นการหาย</li>
  <li><b>Inflammatory</b> (เริ่ม 10–30 นาทีหลังเกิดแผล): vasodilation, capillary permeability↑, complement, WBC (PMN, monocyte) → ปวด บวม แดง ร้อน</li>
  <li><b>Proliferation:</b> granulation tissue (collagen), angiogenesis, wound contracture, epithelization</li>
  <li><b>Remodeling/maturation</b> (เริ่ม ~20 วัน นานหลายเดือนถึงหลายปี): แผลแข็งแรงขึ้น อาจเกิดแผลเป็น</li>
</ol>
<p><b>Red flags ส่งต่อ:</b> เลือดออกมากคุมไม่ได้ · อวัยวะส่วนปลายขาดเลือดหรือขาดความรู้สึก · มีสิ่งแปลกปลอมฝังลึก</p>
<h3>Pharmacology</h3>
<ul>
  <li><b>Dicloxacillin, amoxicillin:</b> ยับยั้ง cell wall (จับ PBPs) ดีต่อ gram-positive</li>
  <li><b>Mupirocin 2%:</b> ยับยั้ง bacterial isoleucyl-tRNA synthetase ดีต่อ gram-positive cocci</li>
  <li><b>Fusidic acid 2%:</b> จับ elongation factor G (EF-G) เน้น Staphylococcus</li>
  <li><b>Gentamicin 0.1%:</b> aminoglycoside จับ 30S</li>
  <li><b>Silver sulfadiazine:</b> ครอบคลุมกว้าง gram + และ − (silver ions + sulfadiazine bacteriostatic)</li>
</ul>
<h3>Pharmacotherapy</h3>
<p>ประเมินแรงที่ทำให้เกิดแผล (ตัด กระแทก เสียดทาน) · <mark>golden period &lt; 6–12 ชม. หลังเกิดเหตุ</mark> · แผลสด (&lt; 6 ชม.) ที่สะอาดไม่จำเป็นต้องได้ยาปฏิชีวนะ หลักคือทำความสะอาดแผลให้เหมาะสม</p>
<ul>
  <li><b>แผลเล็ก ไม่ลึก:</b> ล้างด้วยน้ำเกลือหรือน้ำสะอาด · moist wound healing (หายเร็ว ไม่เป็นแผลเป็น) · <b>ไม่ต้องให้ยาปฏิชีวนะทั้งกินและทา</b></li>
  <li><b>แผลใหญ่ ลึก:</b> ล้าง + moist wound healing · อาจต้องให้ยาปฏิชีวนะครอบคลุม <i>S. aureus</i>, beta-hemolytic streptococcus group A</li>
  <li><b>การล้างแผล:</b> normal saline (0.9% NaCl) เป็น gold standard แรงดัน 8–15 psi กำจัดแบคทีเรียได้ &gt; 80%</li>
</ul>
<div class="tbl"><table>
  <tr><th>Oral ATB</th><th>เชื้อ</th><th>ขนาด</th><th>ADR</th></tr>
  <tr><td>Dicloxacillin (สมเหตุสมผลในการใช้)</td><td>MSSA, Strep</td><td class="num">250–500 mg QID ac × 2 วัน</td><td>GI upset ต้องกินตอนท้องว่าง</td></tr>
  <tr><td>Amoxicillin/clavulanate</td><td>gram +, gram −, anaerobe</td><td class="num">875/125 mg BID หรือ 500/125 mg TID pc × 2 วัน</td><td>ท้องเสีย ผื่นแพ้</td></tr>
</table></div>
<ul>
  <li><b>แผลคน/สัตว์กัด:</b> amoxicillin/clavulanate 3–5 วัน (ยังไม่ติดเชื้อแต่เสี่ยงสูง) · 7–14 วัน (ติดเชื้อแล้ว)</li>
  <li><b>แพ้ penicillin:</b> doxycycline 100 mg BID + metronidazole 400–500 mg TID หรือ ciprofloxacin 500 mg BID + metronidazole 400–500 mg TID</li>
</ul>
<h3>Topical ATB</h3>
<ul>
  <li><b>Mupirocin 2%:</b> <mark>ไม่เกิน 10–14 วัน</mark> (กัน MRSA ดื้อยา) · รูปขี้ผึ้งมี PEG ดูดซึมผ่านแผลใหญ่เป็นพิษต่อไต ระวังในไตบกพร่อง</li>
  <li><b>Fusidic acid 2%:</b> เฉพาะสงสัย Staphylococcal</li>
  <li><b>Gentamicin 0.1%:</b> เชื้อดื้อมาก ใช้นานเกิด ototoxicity, nephrotoxicity</li>
  <li><b>Silver sulfadiazine:</b> เสริมการสมานแผล อาจคัน photosensitivity · ห้ามในคนแพ้ sulfonamide และทารกแรกเกิด</li>
</ul>
<h3>Herb & food supplements</h3>
<ul>
  <li><b>ว่านหางจระเข้:</b> วุ้นสมานแผล ลดอักเสบ ลดรอยแผลเป็น ใช้กับแผลสด แผลไฟไหม้ น้ำร้อนลวก</li>
  <li><b>บัวบก:</b> กระตุ้นการสร้างคอลลาเจน ยับยั้งเอนไซม์อักเสบ ลดรอยแผลเป็น</li>
  <li><b>ใบสาบเสือ:</b> ขยี้หรือโขลกพอกแผลสด ลดระยะเวลาการแข็งตัวของเลือด (ห้ามเลือด)</li>
</ul>` },
    { id: 'abscess', t: 'Cutaneous abscess (ฝี)', html: `<p>หนองสะสมในชั้น <b>dermis</b> หรือ <b>subcutaneous tissue</b> ปวด บวม แดง ร้อน</p>
<ol>
  <li>ภูมิคุ้มกันตอบสนองต่อแบคทีเรีย (ส่วนใหญ่ <i>S. aureus</i>)</li>
  <li>เนื้อเยื่อเฉพาะส่วนถูกทำลาย</li>
  <li>neutrophil รวมตัวเป็นหนองในโพรงแผล</li>
</ol>
<p><b>อาการ:</b> คลำแล้วรู้สึกมีของเหลวเคลื่อน (fluctuation) ปวด บวม แดง ร้อน</p>
<h3>Pharmacology</h3>
<ul>
  <li>Dicloxacillin: ยับยั้ง cell wall ดีต่อ gram-positive</li>
  <li>Clindamycin: จับ 50S อาจกดไขกระดูก WBC ต่ำ ติดเชื้อง่าย</li>
  <li>Doxycycline: จับ 30S เด็กกินแล้วฟันเหลือง ระวังกินกับ cation (เว้นห่าง 4 ชม.)</li>
</ul>
<h3>Pharmacotherapy</h3>
<div class="key"><strong class="k">Gold standard</strong><b>Incision and drainage</b> (ผ่าระบายหนอง) เป็นการรักษาหลัก · ยาปฏิชีวนะซึมเข้าโพรงฝีได้ยากเพราะภายในเป็นกรด ยาออกฤทธิ์ไม่ดี</div>
<ul>
  <li><b>Warm compression:</b> ประคบอุ่นเพิ่มการไหลเวียน ให้ฝีสุกและนุ่มระบายง่าย</li>
  <li><mark>ไม่ควรเจาะระบายฝีเอง</mark> เสี่ยงผลักเชื้อเข้ากระแสเลือด</li>
</ul>
<p><b>เมื่อใดควรเริ่มยาปฏิชีวนะ</b></p>
<ol>
  <li>ฝีใหญ่ (&gt; 2.5 cm) หรือหลายตำแหน่ง</li>
  <li>อักเสบลามกว้างรอบฝี</li>
  <li>อาการทางระบบ เช่น ไข้สูง หนาวสั่น</li>
  <li>กลุ่มเสี่ยง (immunocompromised, DM, โรคตับ, โรคไต)</li>
</ol>
<div class="tbl"><table>
  <tr><th>ยา</th><th>ขนาด (ผู้ใหญ่)</th><th>วิธีกิน</th><th>ADR</th></tr>
  <tr><td>Cephalexin</td><td class="num">500 mg ทุก 6 ชม. (QID)</td><td>พร้อมอาหารหรือไม่ก็ได้</td><td>ผื่น ท้องเสีย แพ้ข้ามกลุ่ม penicillin</td></tr>
  <tr><td>Dicloxacillin</td><td class="num">250–500 mg วันละ 4 ครั้ง</td><td>ก่อนอาหาร 1 ชม. หรือหลังอาหาร 2 ชม.</td><td>คลื่นไส้ ท้องเสีย กินยาลำบาก</td></tr>
  <tr><td>Clindamycin</td><td class="num">300–450 mg วันละ 3 ครั้ง</td><td>หลังอาหาร ดื่มน้ำมาก</td><td>C. diff diarrhea</td></tr>
  <tr><td>TMP-SMX</td><td class="num">160/800 mg วันละ 2 ครั้ง</td><td>หลังอาหาร ดื่มน้ำมาก</td><td>ผื่น SJS/TEN K⁺ สูง</td></tr>
  <tr><td>Doxycycline</td><td class="num">100 mg วันละ 2 ครั้ง</td><td>ดื่มน้ำมาก ห้ามนอนทันที</td><td>แพ้แสง แสบท้อง หลอดอาหารอักเสบ</td></tr>
  <tr><td>Amox-clav (แผลสกปรก)</td><td class="num">875/125 mg วันละ 2 ครั้ง</td><td>พร้อมอาหาร</td><td>ท้องเสีย ตับอักเสบ (rare)</td></tr>
</table></div>
<p><b>กินต่อเนื่อง 5–10 วัน</b></p>` },
    { id: 'burn', t: 'Burns & scalds', html: `<p>แผลจากความร้อน เช่น ไฟไหม้ น้ำร้อนลวก · ความร้อน &gt; 45 °C ทำลายพันธะไฮโดรเจนในโปรตีน → coagulative necrosis</p>
<div class="tbl"><table>
  <tr><th>ระดับ</th><th>ชั้นผิว</th><th>ลักษณะ</th><th>ความเจ็บปวด</th><th>การหาย</th><th>รักษาหลัก</th></tr>
  <tr><td>First-degree (superficial)</td><td>epidermis (vasodilation)</td><td>แดง แห้ง ไม่มีตุ่มน้ำ กดแล้วซีด (blanching +)</td><td>ปวด/แสบมาก</td><td>หายเอง 3–7 วัน</td><td>topical + moisturizer</td></tr>
  <tr><td>Superficial partial (2nd)</td><td>epidermis + dermis ตื้น (papillary)</td><td>ชมพู ชื้น มี blister เลือดมาเลี้ยงดี</td><td>ปวดมาก</td><td>1–3 สัปดาห์</td><td>dressing + topical</td></tr>
  <tr><td>Deep partial (2nd)</td><td>dermis ลึก (reticular)</td><td>ขาวปนชมพู แห้ง ซีด blanching ลดลง หลอดเลือดฝอยถูกทำลาย</td><td>ปวดน้อยลง (เส้นประสาทหลุดไปแล้ว)</td><td>ช้า เป็นแผลเป็น</td><td>refer / พิจารณาผ่าตัด</td></tr>
  <tr><td>Third-degree (full thickness)</td><td>dermis + fat</td><td>ขาว น้ำตาล ดำ แข็ง eschar เหมือนหนัง</td><td>ชา ไม่เจ็บ (เส้นประสาทถูกทำลายหมด)</td><td>ไม่หายเอง</td><td>surgery / graft</td></tr>
</table></div>
<figure><img data-fig="wound/p07-1.webp" alt="ตารางระดับแผลไหม้พร้อมภาพแผลไหม้ระดับ 1, 2 ตื้น, 2 ลึก และ 3"><figcaption>ภาพตัวอย่างแผลไหม้แต่ละระดับ</figcaption></figure>
<h3>MEBO (Moist Exposed Burn Ointment)</h3>
<ul>
  <li>beta-sitosterol 0.25%, berberine, sesame oil, beeswax · anti-inflammatory, antimicrobial, angiogenesis</li>
  <li><b>Liquefaction theory:</b> ทำให้น้ำเหลืองและเนื้อตายที่แผลอ่อนนุ่มหลุดออกเองโดยไม่ทำลายเนื้อดี</li>
</ul>
<h3>Pharmacotherapy</h3>
<ul>
  <li>เป้าหมาย: หยุดการกระจายของความร้อนในเนื้อเยื่อ</li>
  <li><b>Cooling:</b> ล้างด้วยน้ำสะอาด 15–25 °C นาน 10–20 นาที · <mark>ห้ามใช้น้ำเย็นจัดหรือประคบเย็น</mark> (intense vasoconstriction เลือดไหลเวียนลด เนื้อตายมากขึ้น)</li>
  <li><b>ตุ่มน้ำพอง:</b> ผิวที่พองทำหน้าที่เกราะกันน้ำและเชื้อ ในตุ่มมี plasma, cytokines, growth factors ช่วยสร้างผิวใหม่ · <b>&lt; 2 cm และไม่อยู่ในจุดพับ ควรคงไว้</b> · แตกเองหรือมีหนองควรกำจัดทิ้ง</li>
  <li><b>Topical ATB:</b> <mark>1% silver sulfadiazine (first line)</mark>, gentamicin cream, 2% fucidin cream, mupirocin</li>
  <li><b>MEBO:</b> นิยมในแผล second-degree รักษาความชุ่มชื้น หายแบบไร้สะเก็ด ลดปวดขณะล้างแผล ทาบ่อยทุก 4–6 ชม.</li>
  <li><b>สมุนไพร:</b> ว่านหางจระเข้ (cooling + moisturizing + mild healing) · บัวบก · น้ำมันมะพร้าว (ให้ความชุ่มชื้น บรรเทาแผลไฟไหม้น้ำร้อนลวก)</li>
</ul>` },
    { id: 'scar', t: 'Scar (แผลเป็น)', html: `<p>ผลสุดท้ายของการซ่อมแซมเนื้อเยื่อที่ผิดปกติ collagen matrix สะสมแทนโครงสร้างผิวเดิม</p>
<ul>
  <li><b>Myofibroblast activity:</b> ช่วง proliferation fibroblast ถูก TGF-β กระตุ้นเป็น myofibroblast ดึงขอบแผลเข้าหากัน (wound contraction)</li>
  <li><b>Collagen cross-linking:</b> ระยะ remodeling เนื้อเยื่อหนาแน่น ยืดหยุ่นน้อยลง</li>
  <li><b>Exudate and edema:</b> ของเหลวใต้ผิวเพิ่มความดัน กระตุ้นตัวรับความปวด รู้สึกตึง</li>
</ul>
<div class="tbl"><table>
  <tr><th>ชนิด</th><th>ลักษณะ</th><th>ขอบเขต</th><th>การดำเนินโรค</th></tr>
  <tr><td>Hypertrophic (แผลเป็นนูน)</td><td>นูนแดง บริเวณแรงตึงสูง</td><td><b>ไม่เกินขอบแผลเดิม</b></td><td>ยุบได้เมื่อเวลาผ่านไป</td></tr>
  <tr><td>Keloid</td><td>นูนหนา แดงเข้ม/ม่วง คันหรือปวด</td><td><b>ขยายเกินขอบแผลเดิมมาก</b></td><td>พบบ่อยในคนผิวสี ไม่ยุบเอง</td></tr>
  <tr><td>Atrophic (แผลเป็นหลุม)</td><td>dermal collagen และไขมันถูกทำลายรุนแรง</td><td>—</td><td>จากสิวอักเสบรุนแรง อีสุกอีใส · ice-pick, boxcar, rolling</td></tr>
  <tr><td>Acne scars, PIE/PIH</td><td>PIH (น้ำตาล) melanocyte ถูกกระตุ้น · PIE (แดง) หลอดเลือดฝอยขยาย/เสียหาย</td><td>—</td><td>atrophic acne scar จาก remodeling ผิดปกติ</td></tr>
</table></div>
<h3>Pharmacology</h3>
<ul>
  <li><b>Silicone:</b> hydration & occlusion ทำให้ stratum corneum ชุ่มชื้น · ส่งสัญญาณผ่าน cytokine ยับยั้ง fibroblast สร้าง collagen เกิน ลดการทำงานของ myofibroblast</li>
  <li><b>Mucopolysaccharide polysulphate (Hirudoid):</b> heparinoid โมเลกุลเล็กซึมผ่านผิว anti-thrombotic, anti-inflammatory เพิ่มการไหลเวียนเลือด</li>
  <li><b>Allium cepa (Hiruscar):</b> รวม allium cepa, aloe vera, allantoin, vitamin B3, vitamin E, MPS · allium cepa ยับยั้งการแบ่งตัวของ fibroblast ลดอักเสบ ลด extracellular matrix</li>
</ul>
<h3>Pharmacotherapy</h3>
<ul>
  <li><b>Moisture balance:</b> <mark>ผิวแห้งอาจทำให้เกิดรอยแผลเป็น</mark> รักษาความชุ่มชื้นลดแรงดึงรั้งของ eschar</li>
  <li><b>Topical emollient/hydration:</b> silicone gel หรือครีมที่มี urea/hyaluronic acid</li>
  <li><b>แผลนูน:</b> อาจใช้ intralesional corticosteroids ยับยั้ง myofibroblast</li>
  <li><b>Silicone therapy (first line):</b> เริ่มทันทีหลังแผลปิดสนิทไม่มีน้ำเหลือง (~10–14 วันหลังแผลหาย) · ทา silicone gel วันละ 2 ครั้ง หรือแผ่น silicone อย่างน้อย 12 ชม./วัน ต่อเนื่อง ≥ 2–3 เดือน แผลหนา/แนวโน้มคีลอยด์ถึง 6 เดือน (ทาบาง ๆ แต่บ่อย ๆ)</li>
  <li><b>Hirudoid:</b> ลดความแข็งของพังผืด เหมาะกับแผลที่ดึงรั้งหรือเริ่ม contracture (แผลผ่าตัด แผลไฟไหม้) ได้ผลดีระยะแรก–กลาง แต่ลดแผลนูนรุนแรงหรือคีลอยด์ไม่ได้</li>
  <li><b>Hiruscar:</b> ลดความนูน สี และความไม่สม่ำเสมอของแผล</li>
</ul>
<div class="tbl"><table>
  <tr><th>ลักษณะแผลเป็น</th><th>ผลิตภัณฑ์</th><th>เป้าหมาย</th></tr>
  <tr><td>แผลนูน / คีลอยด์ (ใหม่)</td><td>silicone gel (เช่น Dermatix) หรือ silicone sheet</td><td>ลดความนูน คุมการสร้างคอลลาเจน รักษาความชุ่มชื้น</td></tr>
  <tr><td>แผลแข็ง / ดึงรั้ง</td><td>Hirudoid (MPS)</td><td>พังผืดนุ่ม ยืดหยุ่น ลด contracture</td></tr>
  <tr><td>รอยแดง / รอยดำจากสิว</td><td>Dragon's Blood / allium cepa</td><td>ลดอักเสบ ยับยั้งเม็ดสี ปรับสีผิว</td></tr>
  <tr><td>แผลเป็นหลุม</td><td>copper peptides / laser / subcision</td><td>สร้างเนื้อเยื่อใหม่ เพิ่มปริมาตรผิว</td></tr>
  <tr><td>แผลเสี่ยงเป็นแผลเป็น (แผลสดที่เพิ่งปิด)</td><td>silicone + allium cepa</td><td>ป้องกันคอลลาเจนผิดปกติแต่ระยะต้น</td></tr>
</table></div>
<p><b>สมุนไพร:</b> บัวบก กระตุ้นคอลลาเจน ลดอักเสบ ลดรอยแผลเป็น</p>` },
    { id: 'warts', t: 'Warts & corns', html: `<ul>
  <li><b>หูด (warts):</b> <mark>ติดเชื้อ HPV</mark> ผ่านรอยถลอก/รอยแตกเล็ก ๆ แพร่จากการสัมผัสหรือลามในตัวเอง · ไวรัสเข้า basal layer ทำให้ keratinocyte แบ่งตัวผิดปกติ ผิวหนาตัวยกนูน</li>
  <li><b>ตาปลา (corns) และหนังหนา (calluses):</b> stratum corneum หนาตัวจากแรงกด/เสียดสีเรื้อรัง <b>ไม่ติดเชื้อ</b> · ตาปลา: แรงกดจุดซ้ำ (นิ้วเท้า) เกิดแกนแข็งรูปกรวยกดลง dermis ทำให้ปวด · หนังหนา: แรงเสียดสีกว้าง (ฝ่าเท้า) หนาสม่ำเสมอ ไม่มีแกน ไม่ปวด</li>
</ul>
<div class="tbl"><table>
  <tr><th></th><th>หูด</th><th>ตาปลา</th><th>หนังหนา</th></tr>
  <tr><td>ลักษณะ</td><td>ผิวขรุขระ ลายผิวขาดช่วง จุดดำเล็ก ๆ (thrombosed capillaries)</td><td>ผิวแข็ง จุดศูนย์กลาง ลายผิวต่อเนื่อง ไม่มีจุดดำ</td><td>ผิวหนาเรียบ ลายผิวต่อเนื่อง ไม่มีจุดดำ</td></tr>
  <tr><td>เจ็บ</td><td><b>เจ็บเมื่อบีบด้านข้าง</b> กรีดแล้วเลือดออก</td><td>เจ็บเมื่อกดตรง ๆ</td><td>มักไม่เจ็บ</td></tr>
  <tr><td>แพร่กระจาย</td><td><b>ได้</b></td><td>ไม่</td><td>ไม่ (รักษาเหมือนตาปลา)</td></tr>
</table></div>
<h3>Pharmacotherapy</h3>
<ul>
  <li><b>Salicylic acid (first line):</b> ทำลาย intercellular cement ระหว่าง keratinocytes ผิวอ่อนลอกง่าย · 15–40% สำหรับหูดและตาปลา ใช้ต่อเนื่อง ≥ 6–12 สัปดาห์ · ADR: ระคาย แสบ ลอก ถ้าโดนผิวปกติ (<mark>เลี่ยงในเบาหวานหรือมีแผลเปิด</mark>)
    <ul>
      <li>วิธีทา: แช่น้ำอุ่น 5–10 นาที ใช้ตะไบขัดให้บาง เช็ดแห้ง → ทาวาสลีนรอบรอยโรค → แต้ม SA ตรงรอยโรค → ปิดพลาสเตอร์ → วันละครั้งก่อนนอน</li>
    </ul>
  </li>
  <li><b>Protectant:</b> petrolatum หรือ zinc oxide paste ทารอบหูดก่อนทายากัด</li>
  <li><b>5-FU + SA (Verrumal):</b> 5-FU ยับยั้ง thymidylate synthase ขัดขวาง DNA ของเซลล์ที่ติด HPV + SA keratolytic · หูดเรื้อรังหรือไม่ตอบสนองต่อ SA เดี่ยว · แต้มวันละ 2–3 ครั้ง 4–8 สัปดาห์ · ADR แสบร้อน ลอก แดง · <mark>ห้ามในหญิงตั้งครรภ์ · ไม่ใช้กับตาปลาหรือหนังหนา</mark> (มีตัวยาฆ่าเชื้อ)</li>
  <li><b>สมุนไพร:</b> น้ำนมราชสีห์ ใช้ยางกัดหูด ตาปลา</li>
</ul>` },
    { id: 'hair', t: 'Hair loss', html: `<ul>
  <li><b>Alopecia areata (AA):</b> ผมร่วงเป็นหย่อมไม่ทราบสาเหตุ ทุกเพศทุกวัย อุบัติการณ์ 0.1–0.2% สูงสุดอายุ 15–29 ปี (เอเชียพบบ่อยกว่าตะวันตก) · ร่วงทั้งศีรษะ = alopecia totalis (AT) · ขนทั่วร่างกายร่วงด้วย = alopecia universalis (AU) · กระทบจิตใจและสังคม</li>
  <li><b>Trigger:</b> พันธุกรรม (autosomal dominant) · androgen response · chronologic aging · ยา/สารเคมี</li>
  <li><b>กลไก:</b> autoimmune ภูมิคุ้มกันโจมตีรากผม · อาจพบร่วม Hashimoto's, SLE, pernicious anemia, vitiligo หรือภูมิแพ้ เช่น atopic dermatitis</li>
</ul>
<h3>Clinical presentation</h3>
<ul>
  <li><b>Male androgenetic alopecia:</b> M-shaped thinning (ขมับร่น) · vertex pattern (กลางกระหม่อมบาง) · anterior pattern (บางลามจากหน้าไปหลัง)</li>
  <li><b>Female pattern hair loss:</b> central thinning · Christmas tree pattern (แนวผมด้านหน้ามักยังอยู่)</li>
</ul>
<h3>Severity</h3>
<ul>
  <li><b>Scarring (cicatricial):</b> มีแผลเป็น รากผมถูกทำลายถาวร (burn/trauma, kerion, carbuncle, DLE, scleroderma)</li>
  <li><b>Non-scarring:</b> รากผมยังอยู่ · androgenetic alopecia (AGA) · alopecia areata (AA) · telogen effluvium (TE)</li>
</ul>
<h3>Pharmacology & pharmacotherapy</h3>
<ul>
  <li><b>Minoxidil (first line):</b> K channel opener/vasodilator · กระตุ้น VEGF เพิ่มเลือดรอบรากผม · ดูดซึมเข้าระบบ &lt; 2% · peak 4–6 ชม.
    <ul>
      <li>ใช้ได้ทั้งชายและหญิงใน AGA · <mark>ต้องใช้ต่อเนื่องตลอดชีวิต</mark></li>
      <li>ชาย 5% วันละ 2 ครั้ง หรือวันละครั้ง (ตามรูปแบบยา) · หญิง 2–5% วันละ 1–2 ครั้ง</li>
      <li>ADR: คัน หนังศีรษะแห้ง/ลอก contact dermatitis · <b>ผมร่วงมากขึ้นช่วง 1–2 เดือนแรก</b> (ผลัดผมเก่า)</li>
    </ul>
  </li>
  <li><b>Finasteride:</b> ยับยั้ง 5-α reductase type II ลด DHT 65–75% · <b>male AGA เท่านั้น 1 mg วันละครั้ง ไม่ใช้ในผู้หญิง</b> (off-label โดยแพทย์เฉพาะทาง)
    <ul>
      <li>ADR: ความต้องการทางเพศลด, ED, การหลั่งน้ำอสุจิผิดปกติ</li>
      <li><mark>ห้ามในสตรีมีครรภ์ (ทารกชายพิการ) · สตรีวัยเจริญพันธุ์ห้ามสัมผัสเม็ดยาที่แตกหรือบด</mark> (ซึมผ่านผิว) · ระวังในโรคตับรุนแรง</li>
    </ul>
  </li>
</ul>
<h3>Herb & food supplements</h3>
<p>ว่านหางจระเข้ (ลดคัน คุมความมัน เพิ่มความชุ่มชื้น) · มะกรูด (บำรุงผม ลดรังแค) · อัญชัน (แอนโทไซยานิน กระตุ้นการไหลเวียน) · ขิง (วิตามิน เหล็ก เบต้าแคโรทีน) · น้ำมันมะพร้าว (บำรุงผม ลดเชื้อแบคทีเรียและราบนหนังศีรษะ)</p>` },
  ],
  questions: [
    { q: 'ชาย 45 ปี มีเบาหวานและตับแข็ง หกล้มมีแผลถลอกขอบเรียบที่หน้าแข้ง ยาว ~3 cm ไม่ลึก ล้างง่าย ข้อใดเหมาะสมที่สุด', o: ['ไม่ต้องให้ยาปฏิชีวนะทั้งกินและทา เพราะเป็นแผลสะอาดขนาดเล็ก', 'Dicloxacillin 250–500 mg วันละ 4 ครั้ง ก่อนอาหาร', 'Mupirocin 2% ทาต่อเนื่อง 21 วัน', 'Silver sulfadiazine ทาเพื่อช่วยสมานแผล', 'แนะนำใบสาบเสือพอกแผลลดระยะเวลาการแข็งตัวของเลือด'], a: 1, e: 'แม้ดูเป็นแผลสะอาดขนาดเล็ก แต่ผู้ป่วยภูมิคุ้มกันบกพร่อง (เบาหวาน ตับแข็ง) ซึ่งเป็นเกณฑ์ที่ควรได้ยาปฏิชีวนะ · dicloxacillin ครอบคลุม MSSA และ Strep กินตอนท้องว่าง · mupirocin ไม่ควรใช้เกิน 14 วัน (ดื้อยา)' },
    { q: 'หญิงโดนน้ำร้อนลวกที่แขน ผิวสีชมพู ชื้น มีตุ่มน้ำพอง ปวดมาก คำแนะนำใด "ไม่ถูกต้อง"', o: ['ล้างด้วยน้ำสะอาดอุณหภูมิปกติ (15–25 °C) 10–20 นาที', 'ถ้าตุ่มน้ำพอง < 2 cm และไม่อยู่ในจุดพับ ควรคงไว้ไม่ให้แตก', 'ประคบเย็นด้วยน้ำแข็งทันทีเพื่อลดปวดและการกระจายของความร้อน', 'ใช้ 1% silver sulfadiazine ทาแผล', 'ใช้ MEBO รักษาความชุ่มชื้นและลดปวดขณะล้างแผล'], a: 2, e: 'ห้ามใช้น้ำเย็นจัดหรือประคบเย็น เพราะทำให้ intense vasoconstriction เลือดไหลเวียนลด เนื้อตายมากขึ้น' },
    { q: 'การใช้ silicone therapy ป้องกันแผลเป็นนูนหลังแผลสดเพิ่งปิด (~10–14 วัน) ข้อใดถูกต้องที่สุด', o: ['ยับยั้งการแบ่งตัวของ fibroblasts โดยตรง', 'เพิ่มการไหลเวียนเลือดให้เนื้อเยื่อได้ oxygen มากขึ้น', 'เริ่มทันทีที่เกิดแผลสดแม้ยังมีน้ำเหลืองซึม', 'ใช้เฉพาะแผลเป็นหลุม (atrophic scar)', 'สร้างเกราะรักษาความชุ่มชื้น ส่งสัญญาณยับยั้งการสร้าง collagen ที่มากเกิน'], a: 4, e: 'Silicone ออกฤทธิ์ผ่าน hydration & occlusion ทำให้ stratum corneum ชุ่มชื้น และส่งสัญญาณผ่าน cytokines ยับยั้ง fibroblasts ไม่ให้สร้าง collagen เกิน ควรเริ่มทันทีหลังแผลปิดสนิท' },
    { q: 'ชาย 28 ปี มาร้านยา มีตุ่มฝีหนองนูนแดง ปวดมาก ที่หน้าขา ~2 cm เป็นมา 3 วัน ไม่มีไข้ ไม่มีโรคประจำตัว ข้อใดเหมาะสมที่สุด', o: ['แนะนำพบแพทย์เพื่อผ่าระบายหนอง', 'Dicloxacillin 500 mg วันละ 4 ครั้งก่อนอาหาร 7 วัน', 'แนะนำบีบระบายหนองเองทันที', 'ประคบเย็นเพื่อลดอักเสบ', 'Amoxicillin/clavulanate 875/125 mg วันละ 2 ครั้งหลังอาหาร'], a: 0, e: 'ฝีหนอง: การผ่าระบายหนองสำคัญที่สุด (gold standard) ยาปฏิชีวนะซึมเข้าโพรงฝีได้ยากเพราะเป็นกรด และรายนี้ยังไม่เข้าเกณฑ์ให้ยาปฏิชีวนะ · ไม่ระบายเอง แนะนำประคบอุ่นแทน' },
    { q: 'ชายปรึกษาเรื่องผมบางบริเวณขมับสองข้าง เภสัชกรพิจารณาจ่าย finasteride ข้อใดถูกต้อง', o: ['ยับยั้ง 5-α reductase type I เป็นหลัก', 'ใช้รักษาผมร่วงในหญิงอายุ 18 ปีขึ้นไปได้อย่างปลอดภัย', 'ได้ผลดีแล้วหยุดยาได้ทันทีและผมจะไม่กลับมาร่วงอีก', 'สตรีวัยเจริญพันธุ์ห้ามสัมผัสเม็ดยาที่แตกหรือบด เพราะยาซึมผ่านผิวหนังเป็นอันตรายต่อทารกในครรภ์', 'ไม่มีผลข้างเคียงต่อสมรรถภาพทางเพศ'], a: 3, e: 'Finasteride ยับยั้ง 5-α reductase type II · ห้ามในสตรีมีครรภ์ และสตรีวัยเจริญพันธุ์ห้ามสัมผัสเม็ดยาแตก (ทารกชายพิการ) · ผู้ชายต้องใช้ต่อเนื่องเพื่อคงผลการรักษา' },
  ],
}
