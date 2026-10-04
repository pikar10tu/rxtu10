// Hemolytic anemia (G6PD deficiency, Thalassemia) — converted from the RxTU10 class summary PDF (see content/summaries/manifest.json)
export default {
  id: 'hemolytic',
  date: '28/07/2026',
  refs: [
    'สมาคมโลหิตวิทยาแห่งประเทศไทย. แนวทางเวชปฏิบัติสำหรับการวินิจฉัยและดูแลรักษาภาวะโลหิตจางและธาลัสซีเมีย (Guidelines for the Management of Anemia & Thalassemia 2025). ฉบับปรับปรุง พ.ศ. 2568.',
    'G6PD Deficiency Foundation. G6PD deficiency lifestyle guide [Internet]. [cited 2026 Jul 28]. Available from: https://g6pddf.org/g6pd-deficiency-lifestyle-guide/',
    'MIMS. Drugs to avoid in G6PD deficiency. In: MIMS Summary Table. Singapore: CMPMedica; 2006.',
    'Glader B. Partial list of medicines and other substances thought to be unsafe or safe in individuals with G6PD deficiency. In: UpToDate. Waltham (MA): UpToDate Inc; 2024 [cited 2026 Jul 28]. (Graphic 74254 Version 30.0)',
    'คณินทร์ รังสาดทอง. เอกสารประกอบการสอนวิชา ภศ. 415 หัวข้อ Hemolytic Anemia - G-6-PD Deficiency, Thalassemia. คณะเภสัชศาสตร์ มหาวิทยาลัยธรรมศาสตร์. 2568.',
  ],
  sections: [
    { id: 'g6pd', t: 'G6PD deficiency', html: `<h3>Etiology &amp; pathophysiology</h3>
<p>G6PD gene mutation → ขาดเอนไซม์ G6PD → ไม่มี NADPH → reduced glutathione ↓ → oxidative stress ↑ → hemoglobin denaturation → <b>hemolysis</b></p>
<ul>
  <li><b>X-linked recessive</b> (q28 locus ของโครโมโซม X) → พบในผู้ชายมากกว่า</li>
  <li>G6PD def ป้องกันการติดมาลาเรีย → พบมากในชาวแอฟริกันและเอเชียตะวันออกเฉียงใต้</li>
  <li><mark>แสดงอาการเมื่อมีสิ่งกระตุ้น oxidative stress</mark></li>
</ul>
<h3>Neonatal jaundice</h3>
<ul>
  <li>ตัว ตา เยื่อเมือกเหลือง</li>
  <li>มีอาการทันทีหลังคลอด จากการขาด G6PD ในตับช่วงแรกหลังคลอด</li>
  <li>เกิดกับทารกได้ปกติและหายเอง แต่ถ้าเป็นต่อเนื่องนานให้สงสัย G6PD def</li>
  <li>ให้ O₂ + ฉายแสง</li>
</ul>
<h3>Hemolytic anemia</h3>
<p><b>สิ่งกระตุ้น:</b> oxidative drugs · อาหาร (ถั่วปากอ้า fava bean, red wine, blueberry) · โรค (DKA, severe infection ทั้ง bacterial, viral, rickettsial) · สารเคมี (ลูกเหม็น การบูร พิมเสน)</p>
<p><b>อาการ:</b> เกิดเร็วใน 1–3 วัน · dizziness, headache, dyspnea, palpitations, ปวดท้อง/ปวดหลัง · เม็ดเลือดแดงแตกเฉียบพลัน: ซีด ตัวเหลืองตาเหลือง <b>ปัสสาวะสีดำ (สีโค้ก)</b> ม้ามโต ปวดหลัง AKI</p>
<p><b>การรักษา:</b></p>
<ul>
  <li>Blood transfusion (packed red cell / whole blood)</li>
  <li>Folic acid 1–5 mg/day กระตุ้นการสร้าง RBC</li>
  <li>ให้ O₂</li>
  <li>สารน้ำทดแทนป้องกัน AKI</li>
</ul>
<h3>Patient education</h3>
<ul>
  <li>หลีกเลี่ยงสิ่งกระตุ้น</li>
  <li>แจ้งว่าเป็น G6PD ทุกครั้งที่รับบริการทางการแพทย์</li>
  <li>ปรึกษาแพทย์ก่อนมีบุตร</li>
</ul>` },
    { id: 'g6pd-drugs', t: 'ยาที่ผู้ป่วย G6PD ควรเลี่ยง', html: `<p>ตัวเด่น ๆ (รายการเต็มดูภาพด้านล่าง)</p>
<div class="tbl"><table>
  <tr><th>กลุ่ม</th><th>ยา</th></tr>
  <tr><td>Sulfa</td><td>sulfasalazine, cotrimoxazole ฯลฯ</td></tr>
  <tr><td>Antibiotic</td><td>chloramphenicol · quinolone (ciprofloxacin, norfloxacin, ofloxacin, moxifloxacin) · nitrofurans (nitrofurantoin) · isoniazid</td></tr>
  <tr><td>Antimalarial</td><td>-quine เช่น primaquine · dapsone</td></tr>
  <tr><td>อื่น ๆ</td><td>doxorubicin · methylene blue · vitamin C · diphenhydramine · phenytoin · dopamine (levodopa)</td></tr>
  <tr><td>Analgesics</td><td>paracetamol, aspirin, ibuprofen</td></tr>
  <tr><td>Gout</td><td>probenecid, colchicine</td></tr>
  <tr><td>HTN</td><td>hydralazine, methyldopa</td></tr>
  <tr><td>Sulfonylureas</td><td>glibenclamide, glipizide</td></tr>
</table></div>
<figure><img data-fig="hemolytic/p04-1.webp" alt="รายการยาที่ผู้ป่วย G6PD deficiency ควรหลีกเลี่ยง จาก G6PD Deficiency Foundation"><figcaption>ภาพที่ 1 รายการยาที่ควรหลีกเลี่ยง (G6PD Deficiency Foundation)</figcaption></figure>
<figure><img data-fig="hemolytic/p05-1.webp" alt="ตารางยาที่ควรหลีกเลี่ยงในผู้ป่วย G6PD deficiency จาก MIMS 2006"><figcaption>ภาพที่ 2 รายการยาที่ควรหลีกเลี่ยง (MIMS 2006)</figcaption></figure>
<figure><img data-fig="hemolytic/p06-1.webp" alt="รายการยาและสารที่ไม่ปลอดภัยในผู้ป่วย G6PD deficiency จาก UpToDate หน้า 1"><figcaption>ภาพที่ 3 รายการยาที่ควรหลีกเลี่ยง (UpToDate)</figcaption></figure>
<figure><img data-fig="hemolytic/p06-2.webp" alt="รายการยาและสารที่ไม่ปลอดภัยในผู้ป่วย G6PD deficiency จาก UpToDate หน้า 2"><figcaption>ภาพที่ 4 รายการยาที่ควรหลีกเลี่ยง (UpToDate, ต่อ)</figcaption></figure>` },
    { id: 'thal', t: 'Thalassemia', html: `<ul>
  <li>สร้าง hemoglobin ผิดปกติ ที่ polypeptide บน alpha หรือ beta chain</li>
  <li>RBC อายุสั้น 50–60 วัน (ปกติ 120 วัน)</li>
  <li><b>Autosomal recessive</b> → เป็นโรคเมื่อได้ยีนด้อยทั้งคู่ · <mark>ไม่เกี่ยวกับเพศ</mark></li>
  <li>Dx: CBC (MCV, MCH, RDW) และ molecular genetics (PCR, direct sequencing)</li>
</ul>
<h3>Punnett square (AA = ปกติ · Aa = พาหะ · aa = เป็นโรค)</h3>
<div class="tbl"><table>
  <tr><th>พ่อ × แม่</th><th>ปกติ : พาหะ : เป็นโรค</th><th>สรุป</th></tr>
  <tr><td>ปกติ × พาหะ</td><td>2 : 2 : 0</td><td>เป็นพาหะ 50% · ไม่มีโอกาสเป็นโรค</td></tr>
  <tr><td>พาหะ × พาหะ</td><td>1 : 2 : 1</td><td>เป็นพาหะ 50% · เป็นโรค 25%</td></tr>
  <tr><td>พาหะ × เป็นโรค</td><td>0 : 2 : 2</td><td>ไม่มีโอกาสเป็นปกติ</td></tr>
</table></div>
<h3>Alpha-thalassemia</h3>
<p>(--) = α-thal-1 ยีนหาย 2 ยีนบนโครโมโซมเดียว · (-α) = α-thal-2 ยีนหาย 1 ยีน · ปกติ = αα/αα</p>
<div class="tbl"><table>
  <tr><th>ชนิด</th><th>Genotype</th><th>ลักษณะ</th></tr>
  <tr><td>พาหะ alpha⁺</td><td>-α/αα</td><td>ขาด 1 ตำแหน่ง · ไม่มีอาการ · RBC ไม่ซีด ขนาดปกติหรือเล็กลงเล็กน้อย</td></tr>
  <tr><td>พาหะ alpha⁰</td><td>--/αα</td><td>ขาด 2 ตำแหน่ง · ไม่มีอาการ · RBC ซีดเล็กน้อย ขนาดเล็ก</td></tr>
  <tr><td>Deletional Hb H</td><td>--/-α</td><td>ขาด 3 ตำแหน่ง · มักอาการเล็กน้อย</td></tr>
  <tr><td>Non-deletional Hb H</td><td>--/α<sup>CS</sup>α</td><td>ขาด 2 + ผิดปกติ 1 ตำแหน่ง · อาการรุนแรงกว่า อาจต้องให้เลือด</td></tr>
  <tr><td>Hb Bart's hydrops fetalis</td><td>--/--</td><td>ขาด 4 ตำแหน่ง · รุนแรงมากตั้งแต่ทารก ซีดมาก หัวใจตับม้ามโต มีน้ำในช่องอกและท้อง มักเสียชีวิตในครรภ์ · รักษาด้วย intrauterine transfusion → ให้เลือดต่อเนื่องหลังคลอด และวางแผนปลูกถ่าย stem cell</td></tr>
</table></div>
<p><b>Hb H disease</b> (ผิดปกติ 3 ตำแหน่ง): ซีดน้อยถึงปานกลาง ตัวเหลือง ตับม้ามโตเล็กน้อย ไม่จำเป็นต้องให้เลือด แต่อาจเกิด acute hemolysis เมื่อมีไข้หรือติดเชื้อ</p>
<h3>Beta-thalassemia <small>(รุนแรงกว่า)</small></h3>
<p>β = ปกติ · β⁺, β<sup>E</sup> = สร้างได้บ้าง · β⁰ = สร้างไม่ได้เลย</p>
<div class="tbl"><table>
  <tr><th>ชนิด</th><th>Genotype</th><th>ลักษณะ</th></tr>
  <tr><td>พาหะ</td><td>β⁺/β, β⁰/β, β/β<sup>E</sup>, β<sup>E</sup>/β<sup>E</sup></td><td>ไม่มีอาการ · RBC ซีดเล็กน้อยหรือไม่ซีด ขนาดเล็ก · ไม่ต้องรักษา</td></tr>
  <tr><td>Minor</td><td>β⁺/β⁺, β⁺/β<sup>E</sup> (β⁰/β⁺, β⁰/β<sup>E</sup> บางราย)</td><td>ซีดเล็กน้อยถึงปานกลาง · ตับม้ามโต · ให้เลือดเฉพาะเมื่อซีด ตั้งครรภ์ ติดเชื้อ</td></tr>
  <tr><td>Major</td><td>β⁰/β⁰ (β⁰/β⁺, β⁰/β<sup>E</sup> บางราย)</td><td>ซีดรุนแรงตั้งแต่อายุ &lt; 2 ปี · พึ่งพาการให้เลือด · ต้องได้ยาขับเหล็กสม่ำเสมอ</td></tr>
</table></div>
<h3>อาการทางคลินิก</h3>
<ul>
  <li>ซีด ผอม โตช้า</li>
  <li>Jaundice, gallstone (hemolysis → bilirubin ↑) · ม้ามโต ตับโต</li>
  <li>กระดูกผิดรูปจาก extramedullary hematopoiesis: โหนกแก้มสูงนูน คิ้วห่าง (<b>thalassemia face</b>) · ถ้าได้เลือดเพียงพออาการลดลง เด็กโตดีขึ้น</li>
  <li><b>Iron overload</b> → สะสมที่หัวใจ ตับ ตับอ่อน พาราไทรอยด์ ไทรอยด์</li>
  <li>ภาวะแทรกซ้อน: ติดเชื้อ, chronic hypoxia, หัวใจโต</li>
</ul>
<figure><img data-fig="hemolytic/p10-1.webp" alt="ความรุนแรงของธาลัสซีเมียตามอาการทางคลินิกและจีโนไทป์"><figcaption>ภาพที่ 5 ความรุนแรงตามอาการทางคลินิกและจีโนไทป์ (สมาคมโลหิตวิทยาแห่งประเทศไทย)</figcaption></figure>` },
    { id: 'thal-tx', t: 'การรักษา Thalassemia และการให้เลือด', html: `<div class="tbl"><table>
  <tr><th></th><th>Transfusion-dependent (TDT)</th><th>Non-transfusion-dependent (NTDT)</th></tr>
  <tr><td>การรักษา</td><td>ให้เลือดประจำ (goal Hb 9.5–10.5 g/dL) + ยาขับเหล็ก</td><td>ให้เลือดเป็นครั้งคราว</td></tr>
  <tr><td>ความรุนแรง</td><td>Severe · Hb &lt; 7 g/dL</td><td>Mild/moderate · Hb 7–10 g/dL</td></tr>
  <tr><td>Alpha</td><td>Hb Bart's ทุกรายที่รอด · non-deletional Hb H บางราย</td><td>Deletional Hb H · non-deletional Hb H บางราย</td></tr>
  <tr><td>Beta</td><td>β⁰/β⁰ · β⁰/β⁺ บางราย · β⁰/β<sup>E</sup> บางราย</td><td>β⁺/β⁺ · β⁺/β<sup>E</sup> · β⁰/β⁺ บางราย · β⁰/β<sup>E</sup> บางราย</td></tr>
</table></div>
<figure><img data-fig="hemolytic/p12-1.webp" alt="การแบ่งกลุ่มการรักษาธาลัสซีเมียเป็น TDT และ NTDT"><figcaption>ภาพที่ 6 การแบ่งกลุ่มการรักษา (สมาคมโลหิตวิทยาแห่งประเทศไทย)</figcaption></figure>
<h3>เริ่มให้เลือดใน TDT</h3>
<div class="tbl"><table>
  <tr><th>อายุ</th><th>เกณฑ์</th></tr>
  <tr><td>&lt; 18 ปี</td><td>Severe + Hb &lt; 8 g/dL 2 ครั้ง ห่างกัน 2 สัปดาห์ โดยไม่มีติดเชื้อ<br>หรือ Hb &gt; 8 g/dL ร่วมกับ thalassemia face, โตช้า, กระดูกหัก, ตับม้ามโตมาก</td></tr>
  <tr><td>&gt; 18 ปี</td><td>Hb &lt; 7 g/dL 2 ครั้ง ห่างกัน 2 สัปดาห์ โดยไม่มีติดเชื้อ<br>หรือ Hb &gt; 7 g/dL ร่วมกับกระดูกหัก, ความดันเลือดในปอดสูง, แผลเรื้อรังที่ขา</td></tr>
</table></div>
<ul>
  <li><b>Goal Hb 9.5–10.5 g/dL</b> ไม่เกิน 14 g/dL เพื่อกดการสร้างเม็ดเลือดแดง (high transfusion)</li>
  <li>Packed red cell (PRC) 10–15 mL/kg (ผู้ใหญ่ 1–2 units, 250–300 mL/unit) ทุก 2–6 สัปดาห์</li>
  <li>ควรฉีดวัคซีน HBV ถ้าไม่มีภูมิ</li>
  <li>ควรได้เลือดแบบเม็ดเลือดขาวต่ำ (LDPRC) → ลดปฏิกิริยาต้าน WBC</li>
  <li><b>HF:</b> ให้ครั้งละน้อย &lt; 5 mL/kg ทุก 24–48 ชม. rate 2 mL/kg/hr และให้ยาขับปัสสาวะก่อนให้เลือด</li>
</ul>
<h3>ปฏิกิริยาจากการให้เลือด</h3>
<div class="tbl"><table>
  <tr><th>ปฏิกิริยา</th><th>อาการ</th><th>การจัดการ</th></tr>
  <tr><td>Acute hemolytic</td><td>ไข้ หนาวสั่น ปวดแน่นหน้าอก ปัสสาวะดำ</td><td>หยุดให้เลือด · ให้น้ำเกลือ + ยาขับปัสสาวะ</td></tr>
  <tr><td>Febrile nonhemolytic</td><td>ไข้ หนาวสั่น ปวดหัว N/V</td><td>หยุดให้เลือด · paracetamol · ครั้งต่อไปเปลี่ยนเป็น LDPRC</td></tr>
  <tr><td>Allergic (plasma components)</td><td>ผื่นคัน</td><td>หยุดให้เลือด · antihistamines · epinephrine เมื่อ anaphylaxis/bronchoconstriction/hypotension · ครั้งต่อไปใช้ PRC ที่ไม่มี IgA + antihistamine ป้องกัน</td></tr>
  <tr><td>Alloimmunization (minor blood group)</td><td>Hb ไม่เพิ่มหลังให้เลือด</td><td>ตรวจ minor blood group antigens ก่อน</td></tr>
  <tr><td>Transmission of infections</td><td>ติดเชื้อผ่านเลือด</td><td>เลือดต้องผ่านการคัดกรองจากหน่วยบริการโลหิต</td></tr>
  <tr><td>Iron overload</td><td>ได้เลือดปริมาณมาก/นาน</td><td>Iron chelation</td></tr>
</table></div>` },
    { id: 'iron', t: 'Iron overload และยาขับเหล็ก', html: `<p>ปกติ serum ferritin &lt; 500 ng/mL · เหล็กในตับ 1.8–7 mg Fe/g dry liver</p>
<div class="tbl"><table>
  <tr><th>เริ่ม iron chelation ใน TDT (ข้อใดข้อหนึ่ง)</th><th>เริ่มใน NTDT</th></tr>
  <tr><td>Serum ferritin &gt; 1000 ng/mL 2 ครั้ง ห่างกัน 1–3 เดือน (การอักเสบติดเชื้อรบกวนค่าได้)<br>เหล็กในตับ &gt; 7 mg Fe/g dry liver (biopsy หรือ MRI)<br>ได้เลือดสม่ำเสมอ &gt; 1 ปี<br>ได้เลือดมาแล้ว &gt; 10 ครั้ง</td><td>อายุ &gt; 10 ปี<br>Serum ferritin &gt; 800 ng/mL หรือ 300–800 ng/mL + มีภาวะแทรกซ้อน<br>เหล็กในตับ &gt; 5 mg Fe/g dry liver<br>ถ้าได้เลือดสม่ำเสมอให้ใช้แบบ TDT</td></tr>
</table></div>
<h3>ยาขับเหล็ก (TDT, ยาเดี่ยว)</h3>
<div class="tbl"><table>
  <tr><th>ยา</th><th>Route / การกิน</th><th>Dose</th><th>เด็ก</th><th>Safety</th></tr>
  <tr><td><b>Deferoxamine (DFO)</b><br>first line</td><td>SC infusion 8–12 ชม.</td><td>20–60 mg/kg/day OD 5–7 วัน/สัปดาห์</td><td>&gt; 2 ปี · max 40 mg/kg/day</td><td><mark>Ototoxicity, ocular toxicity</mark>, ปวดบวมแดงร้อนที่ผิวหนัง<br>ป้องกัน: mean daily dose/serum ferritin ไม่เกิน 0.025 · ferritin &lt; 1000 ng/mL ลดขนาด · CrCl 10–15 ลด 25–50% · CrCl &lt; 10 หลีกเลี่ยง</td></tr>
  <tr><td><b>Deferiprone (DFP)</b><br>first line ใน TDT &gt; 6 ปี</td><td>PO tablet กินพร้อมหรือไม่พร้อมอาหาร</td><td>50–100 mg/kg/day แบ่ง tid/qid</td><td>&gt; 6 ปี</td><td><mark>Agranulocytosis, neutropenia</mark><br>ป้องกัน: เริ่ม 50–75 mg/kg/day · AST/ALT &gt; 5 เท่าหยุดยา · CBC ทุก 1–2 สัปดาห์ 2–3 เดือน แล้วทุกเดือน</td></tr>
  <tr><td><b>Deferasirox (DFX)</b><br>first line ใน TDT 2–6 ปี</td><td>PO dispersible tablet, FCT · ไม่พร้อมอาหาร</td><td>20–40 mg/kg/day OD ac 30 นาที</td><td>&gt; 2 ปี · ละลายในน้ำ/น้ำผลไม้</td><td>AST/ALT &gt; 5 เท่าหยุดยา · CrCl &lt; 40 หลีกเลี่ยง</td></tr>
</table></div>
<p>การเลือกยาเดี่ยวหรือสูตรผสม (เมื่อไม่ตอบสนองต่อยาเดี่ยวหรือทน S/E ไม่ได้) ดูภาพที่ 7</p>
<figure><img data-fig="hemolytic/p17-1.webp" alt="แนวทางการเลือกใช้ยาขับธาตุเหล็กเดี่ยวและสูตรผสม"><figcaption>ภาพที่ 7 แนวทางการใช้ยาขับธาตุเหล็ก (สมาคมโลหิตวิทยาแห่งประเทศไทย)</figcaption></figure>
<figure><img data-fig="hemolytic/p18-1.webp" alt="การติดตามผู้ป่วยที่ใช้ยาขับธาตุเหล็ก"><figcaption>ภาพที่ 8 การติดตามผู้ป่วยที่ใช้ iron chelation (สมาคมโลหิตวิทยาแห่งประเทศไทย)</figcaption></figure>
<h3>ยาขับเหล็กใน NTDT</h3>
<p>Iron overload ใน NTDT เกิดจากได้เหล็กเกินในชีวิตประจำวัน จึงควรเลี่ยงอาหารเหล็กสูง</p>
<ul>
  <li><b>DFX:</b> เริ่ม 10–20 mg/kg/day, max 30 mg/kg/day</li>
  <li><b>DFP:</b> เริ่ม 50 mg/kg/day, max 100 mg/kg/day</li>
  <li><b>DFO:</b> ใช้แทน DFX และ DFP เมื่อมีผลข้างเคียง ขนาดเดียวกับ TDT</li>
</ul>
<div class="key"><strong class="k">ปรับยาตาม ferritin</strong>Ferritin &lt; 500 ng/mL ลดยา · &lt; 300 ng/mL หรือเหล็กในตับ &lt; 3 mg Fe/g dry liver หยุดยา</div>
<p><b>Folic acid</b> 1–5 mg/day เหมาะกับผู้ป่วยที่ไม่ได้รับเลือด หรือ NTDT บางราย</p>` },
    { id: 'other', t: 'การรักษาวิธีอื่นและคำแนะนำ', html: `<h3>Hematopoietic stem cell transplantation</h3>
<ul>
  <li>หายขาด แต่เสี่ยงภาวะแทรกซ้อนและค่าใช้จ่ายสูง</li>
  <li>เกณฑ์: ซีดตั้งแต่ &lt; 2 ปี · Hb &lt; 7 g/dL + ให้เลือดตั้งแต่ &lt; 4 ปี</li>
  <li>ต้องมี HLA ตรงกับผู้บริจาค · ให้เลือดเป็น LDPRC และเลี่ยงเลือดจากญาติเพื่อลด graft rejection</li>
</ul>
<h3>การตัดม้าม</h3>
<ul>
  <li>เกณฑ์: moderate–severe · ม้ามโต &gt; 6 cm · ให้เลือด &gt; 250 mL/kg/year</li>
  <li>เสี่ยงติดเชื้อ: ทำเฉพาะอายุ &gt; 5 ปี · ATB ต่อเนื่อง 5 ปี (penicillin) · aspirin ป้องกันเกล็ดเลือดแข็งตัว · pneumococcal vaccine หลังตัดม้าม 5 ปี</li>
</ul>
<h3>Patient education</h3>
<ul>
  <li>เป็นโรคติดตัวตลอดชีวิต แต่ถ้ารักษาถูกต้องมีชีวิตยืนยาวได้</li>
  <li>ปรึกษาแพทย์ก่อนมีบุตร และวินิจฉัยก่อนคลอด</li>
  <li>กินอาหารครบถ้วน เลี่ยงอาหารเหล็กสูง</li>
  <li>ฉีดวัคซีนพื้นฐาน</li>
  <li>ไม่ออกกำลังกายรุนแรง</li>
</ul>` },
  ],
  questions: [
    { q: 'แพทย์ต้องการจ่ายยาปฏิชีวนะแก่ผู้ป่วย G6PD deficiency จึงโทรมาปรึกษาห้องยา ยาปฏิชีวนะตัวใดมีโอกาสกระตุ้นอาการ G6PD deficiency น้อยที่สุด', o: ['Ciprofloxacin', 'Nitrofurantoin', 'Cotrimoxazole', 'Amoxicillin', 'Chloramphenicol'], a: 3, e: 'Ciprofloxacin, nitrofurantoin, cotrimoxazole และ chloramphenicol อยู่ในรายการยาที่ผู้ป่วย G6PD ต้องหลีกเลี่ยง' },
    { q: 'ข้อใดผิดเกี่ยวกับ G6PD deficiency', o: ['เป็น X-linked recessive disease', 'ผู้ป่วยควรหลีกเลี่ยงการรับประทานยา primaquine', 'ลูกสาวมีโอกาสเป็นโรคมากกว่าลูกชาย', 'การติดเชื้อรุนแรงสามารถกระตุ้นให้เม็ดเลือดแตกได้', 'ให้ folic acid 1–5 mg/วัน รักษาอาการซีด เลือดจาง'], a: 2, e: 'X-linked recessive ทำให้ลูกชายมีโอกาสเป็นโรคมากกว่าลูกสาว · primaquine และการติดเชื้อรุนแรงกระตุ้น acute hemolysis ได้ · folic acid เสริมการสร้างเม็ดเลือดแดง' },
    { q: 'ข้อใดถูกเกี่ยวกับ Thalassemia', o: ['ผู้ป่วย Thalassemia ทุกรายต้องได้รับ blood transfusion', 'ลูกชายมีโอกาสเป็นโรคมากกว่าลูกสาว', 'ผู้ป่วยที่ได้รับ blood transfusion เป็นประจำควรกินธาตุเหล็กเสริม', 'ควรใช้ whole blood ในการทำ blood transfusion', 'ผู้ป่วยที่ได้รับ blood transfusion เป็นประจำควรฉีดวัคซีน HBV'], a: 4, e: 'ฉีดวัคซีน HBV ป้องกันการติดเชื้อจากการให้เลือด · thalassemia เป็น autosomal recessive เพศไม่เกี่ยว · ให้เลือดเฉพาะรายที่เข้าเกณฑ์ TDT · ไม่ควรเสริมเหล็กเพราะเสี่ยง iron overload · ใช้ packed red cell ลดปฏิกิริยาต้านเม็ดเลือดขาว' },
    { q: 'ครอบครัวหนึ่งวางแผนจะมีลูก โดยทั้งพ่อและแม่เป็นพาหะ Thalassemia ข้อใดถูก', o: ['ไม่มีโอกาสที่ลูกจะเป็นปกติเลย', 'โอกาสที่ลูกจะเป็นพาหะคือร้อยละ 50', 'โอกาสที่ลูกจะเป็นโรคคือร้อยละ 50', 'ควรวินิจฉัยหาโรคของลูกภายหลังจากคลอด', 'ลูกทุกคนจะมีอาการแสดงของโรค'], a: 1, e: 'Punnett square พาหะ × พาหะ: ปกติ : พาหะ : เป็นโรค = 1 : 2 : 1 → พาหะ 50% เป็นโรค 25% · ควรวินิจฉัยก่อนคลอด' },
    { q: 'ผู้ป่วยอายุ 3 ปี 11 เดือน ต้องได้รับยา iron chelation ข้อใดเป็นการบริหารยาที่เหมาะสม', o: ['ไม่จำเป็นต้องติดตาม serum ferritin', 'ให้ deferiprone 50 mg/kg/day บดเป็นผงละลายกับน้ำแอปเปิ้ล', 'ต้องติดตามการมองเห็นและการได้ยิน', 'ให้ deferoxamine 50 mg/kg/day ละลายกับน้ำเปล่า', 'ควรเริ่มด้วยยาสูตรผสม'], a: 2, e: 'ยาขับเหล็กมี ototoxicity และ ocular toxicity · serum ferritin ใช้กำหนดขนาดยา · deferiprone ใช้ในอายุ > 6 ปี · deferoxamine เป็นยาฉีด max 40 mg/kg/day · แนวทางแนะนำเริ่มยาเดี่ยวก่อน · หมายเหตุ: ในหน้าโจทย์ของต้นฉบับ ตัวเลือก d เขียนเป็น "deferasirox 20 mg/kg/day ละลายกับน้ำเปล่า" ซึ่งเหมาะสมเช่นกัน (DFX เป็น first line อายุ 2–6 ปี) จึงใช้ตัวเลือกตามหน้าเฉลย' },
  ],
}
