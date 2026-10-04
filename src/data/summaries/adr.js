// Allergic drug reaction (ADR) — converted from the RxTU10 class summary PDF (see content/summaries/manifest.json)
const img = (f, alt) => `<img data-fig="adr/${f}.webp" alt="${alt}">`

export default {
  id: 'adr',
  date: '28/07/2026',
  refs: [
    'Pharmtutors. ADR management [lecture handout]. Bangkok: Pharmtutors; n.d.',
    'Suriya S. Drug allergy and cutaneous adverse drug reactions (CADRs) [lecture handout]. Department of Pharmaceutical Care, Faculty of Pharmacy, Thammasat University; 2026.',
  ],
  sections: [
    { id: 'def', t: 'นิยาม', html: `<div class="tbl"><table>
  <tr><th>คำ</th><th>ความหมาย</th></tr>
  <tr><td><b>Adverse drug event (ADE)</b></td><td>เหตุการณ์ไม่พึงประสงค์หรืออันตรายใด ๆ จากการใช้ผลิตภัณฑ์สุขภาพ ขอบเขตกว้างมาก: ใช้ยาเกินขนาด (ตั้งใจหรืออุบัติเหตุ) · ใช้ยาในทางที่ผิด (drug abuse) · ผลิตภัณฑ์บกพร่อง · ผลจากการหยุดใช้ · รวมถึง ADR</td></tr>
  <tr><td><b>Adverse drug reaction (ADR)</b></td><td>อาการไม่พึงประสงค์ที่เป็นอันตรายและไม่ได้ตั้งใจ <b>จากการใช้ยาขนาดปกติ</b> เพื่อป้องกัน วินิจฉัย รักษา หรือปรับการทำงานของร่างกาย · <mark>ไม่นับ</mark> การใช้ยาผิดวิธี อุบัติเหตุ หรือตั้งใจใช้เกินขนาด</td></tr>
  <tr><td><b>Side effect</b></td><td>ผลที่ไม่ได้ตั้งใจจากยาขนาดปกติ สัมพันธ์โดยตรงกับคุณสมบัติทางเภสัชวิทยาของยา</td></tr>
  <tr><td><b>Drug allergy</b></td><td>ปฏิกิริยาจากภูมิคุ้มกันของร่างกายต่อต้านยา</td></tr>
  <tr><td><b>แพ้ยาซ้ำ</b> (repeated drug allergy)</td><td>ได้ยาตัวเดิมที่เคยแพ้และบันทึกในระบบโรงพยาบาลแล้ว จนกลับมาแพ้อีก (ไม่ว่าได้ยาจากใคร) · ไม่นับการ rechallenge ที่ทีมแพทย์ตั้งใจทำ</td></tr>
  <tr><td><b>แพ้ยากลุ่มเดียวกัน</b> (cross-reactivity)</td><td>ได้ยาใหม่ที่โครงสร้างเคมีคล้ายยาที่เคยแพ้ แล้วแพ้ลักษณะเดียวกัน เช่น แพ้ ibuprofen แล้วแพ้ naproxen ด้วย · นับทุกกรณี ไม่ว่าประวัติเดิมจะเคยบันทึกหรือไม่</td></tr>
</table></div>
<figure><img data-fig="adr/p01-1.webp" alt="ขอบเขต ADEs: ADR (drug allergy, side effect) และ drug overdose, drug abuse, medication error, drug interaction"><figcaption>ADEs ครอบคลุม ADR (drug allergy, side effect) รวมถึง overdose, abuse, medication error, drug interaction</figcaption></figure>` },
    { id: 'class', t: 'ADR classification (Type A–F)', html: `<p>เน้น Type A และ B</p>
<div class="tbl"><table>
  <tr><th>Type</th><th>ลักษณะสำคัญ</th><th>การจัดการ</th><th>ตัวอย่าง</th></tr>
  <tr><td><b>A</b> Augmented</td><td>สัมพันธ์กับขนาดยา · ทำนายได้จากเภสัชวิทยา · <b>พบบ่อยที่สุด (80%)</b> · พิการ/เสียชีวิตต่ำ</td><td>ลดขนาดยา</td><td>Overdose: hepatic failure จาก paracetamol · side effect: hypoglycemia จาก sulfonylurea · secondary effect: pseudomembranous colitis จาก broad-spectrum antibiotic · DI: warfarin + NSAIDs → INR ยาวขึ้น</td></tr>
  <tr><td><b>B</b> Bizarre</td><td>ไม่สัมพันธ์กับขนาดยา · ทำนายไม่ได้ · พบ 10–15% · มักรุนแรง เสี่ยงเสียชีวิต</td><td><b>หยุดยาทันที</b> และหลีกเลี่ยงการใช้ซ้ำ</td><td>Immunologic: anaphylaxis · non-immunologic: idiosyncratic (ยาในผู้ป่วย G6PD), pseudoallergy (สารทึบรังสี)</td></tr>
  <tr><td><b>C</b> Chronic</td><td>สัมพันธ์กับทั้งขนาดยาและเวลา เกิดเมื่อใช้ยาสะสมนาน</td><td>ลดขนาดหรือหยุดยา</td><td>Retinopathy จาก chloroquine ระยะยาว</td></tr>
  <tr><td><b>D</b> Delayed</td><td>สัมพันธ์กับเวลา เกิดช้ามาก หรือหลังหยุดยาไปแล้ว</td><td>รักษายาก ประคับประคองตามอาการ</td><td>Carcinogenesis · teratogenesis</td></tr>
  <tr><td><b>E</b> End of use</td><td>อาการถอนยา เกิดทันทีหลังหยุดยาที่ใช้ต่อเนื่อง</td><td>ให้ยากลับแล้วค่อย ๆ ลดขนาด</td><td>ประสาทหลอนหลังหยุด diazepam ทันที</td></tr>
  <tr><td><b>F</b> Failure</td><td>ยาไม่ได้ผลตามคาด มักเกิดจาก DI</td><td>เพิ่มขนาดยา หรือเปลี่ยนยาที่ใช้ร่วม</td><td>ยาคุมกำเนิด + enzyme inducer → ระดับยาคุมลดจนตั้งครรภ์</td></tr>
</table></div>` },
    { id: 'immuno', t: 'Immunologic และ non-immunologic', html: `<h3>Immunologic type</h3>
<p>ไม่สัมพันธ์กับฤทธิ์ทางเภสัชวิทยาและขนาดยา · มี lag time หลังได้ยาครั้งแรก ~7–14 วัน (ถ้ามี antibody อยู่แล้วเกิดเร็ว) · eosinophil สูง · หยุดยาแล้วดีขึ้น (ยกเว้นยาที่ metabolite ขจัดช้า) · แพ้ซ้ำได้กับยาเดิมหรือยาโครงสร้างคล้าย</p>
<p><b>ตาม onset:</b> <b>Immediate</b> นาที–ชั่วโมง = Type I ผ่าน IgE · <b>Delayed</b> 24–72 ชม. = Type IV ผ่าน T cell</p>
<h3>Gell-Coombs classification</h3>
<div class="tbl"><table>
  <tr><th>Type</th><th>กลไก</th><th>Onset</th><th>อาการ</th></tr>
  <tr><td><b>I</b> Immediate</td><td>IgE จับ mast cell → ได้ยาซ้ำ ยาจับ IgE → degranulation หลั่ง histamine, cytokines</td><td>เร็วมาก ภายใน 1 ชม.</td><td>Urticaria, angioedema, bronchoconstriction, anaphylaxis</td></tr>
  <tr><td><b>II</b> Cytotoxic</td><td>ยาเกาะผิวเซลล์ → IgG/IgM จับและกระตุ้น complement → เซลล์ถูกทำลาย</td><td>ไม่แน่นอน</td><td>ความผิดปกติของเม็ดเลือด: hemolytic anemia, thrombocytopenia, agranulocytosis</td></tr>
  <tr><td><b>III</b> Immune complex</td><td>IgG/IgM จับยาในเลือดเป็น drug-Ab complex → ตกตะกอนในเนื้อเยื่อ/หลอดเลือด → กระตุ้น complement</td><td>~1–3 สัปดาห์</td><td>Serum sickness, cutaneous vasculitis, urticaria</td></tr>
  <tr><td><b>IV</b> Cell-mediated / delayed <mark>ออกบ่อย</mark></td><td>ชนิดเดียวที่<b>ไม่ผ่าน antibody</b> · T cell หลั่ง cytokines → อักเสบ</td><td>ช้าที่สุด 24–72 ชม. ถึง 2–7 วัน (DRESS นานเป็นสัปดาห์)</td><td>ผื่นผิวหนังส่วนใหญ่จนถึง SCARs: MPE, contact dermatitis, FDE, SJS/TEN, DRESS, AGEP</td></tr>
</table></div>
<h3>Non-immunologic type</h3>
<p>ไม่เกี่ยวกับภูมิคุ้มกัน · <b>แพ้ได้ตั้งแต่ครั้งแรก</b> · รุนแรง → หยุดยา · ไม่รุนแรง → ลดขนาด/ความเร็วการให้ยา หรือให้ยาป้องกัน</p>
<ul>
  <li><b>Pseudoallergic reaction:</b> อาการคล้าย type I แต่ยากระตุ้น mast cell ให้หลั่ง histamine โดยตรง ไม่ผ่าน IgE · dose-related · <mark>cross-reaction ไปยาโครงสร้างต่างกันได้</mark> เช่น NSAIDs · ตัวอย่าง: red man syndrome จาก vancomycin → ห้าม IV push เจือจาง ≤ 5 mg/mL และหยดด้วย rate &lt; 10 mg/min</li>
  <li><b>Idiosyncratic reaction:</b> ตอบสนองผิดปกติเฉพาะตัว (พันธุกรรม/เอนไซม์บกพร่อง) · ทำนายไม่ได้ ไม่ขึ้นกับขนาดยา · เช่น เม็ดเลือดแดงแตกจากยาในผู้ป่วย G6PD deficiency</li>
</ul>` },
    { id: 'rash', t: 'ผื่นแพ้ยาที่ออกสอบบ่อย', html: `<div class="tbl"><table>
  <tr><th>ผื่น</th><th>ลักษณะสำคัญ</th><th>ช่วงเวลา</th><th>ยาที่พบบ่อย</th></tr>
  <tr><td><b>1. Maculopapular rash (MP rash)</b>${img('p06-1', 'ผื่น maculopapular ที่หลัง')}${img('p06-2', 'ผื่น maculopapular ที่หน้าอก')}</td><td>Macule + papule ผสมกัน · ขอบไม่ชัด สมมาตรทั่วตัว รวมฝ่ามือฝ่าเท้า · คันมาก ไม่ปวดแสบร้อน</td><td>4–14 วันหลังเริ่มยา · ได้ยาซ้ำเร็วขึ้นเหลือ 1–4 วัน</td><td>β-lactams, sulfonamide (TMP-SMX), anticonvulsants (phenytoin, carbamazepine, lamotrigine), allopurinol</td></tr>
  <tr><td><b>2. Urticaria (ลมพิษ)</b>${img('p06-3', 'ลมพิษที่แขน')}${img('p06-4', 'ใบหน้าเด็กบวมจากลมพิษ')}</td><td>Wheal นูน ขอบหยัก คันมาก เกิดเร็วหายเร็ว · แต่ละจุดอยู่ &lt; 24 ชม. และย้ายตำแหน่งได้ (migratory)</td><td>นาที–ชั่วโมง</td><td>β-lactams, NSAIDs, contrast media, opioids (non-immune histamine release)</td></tr>
  <tr><td><b>3. Angioedema</b>${img('p06-5', 'แผนภาพ angioedema บวมรอบตา ริมฝีปาก')}${img('p06-6', 'ริมฝีปากบวมจาก angioedema')}</td><td>บวมเฉพาะบางส่วน คัน ตึง มักที่เยื่อบุ (ริมฝีปาก รอบตา อวัยวะเพศ) · รุนแรงอาจหลอดลมตีบ หายใจหอบ wheeze ความดันตก → anaphylactic shock · <b>เสี่ยง anaphylaxis มากกว่า urticaria</b></td><td>เฉียบพลัน (histamine) · ACEI อาจเกิดหลังใช้เป็นปี</td><td>Histamine-mediated (type I): β-lactam, NSAIDs, contrast · bradykinin-mediated: <b>ACEI</b></td></tr>
  <tr><td><b>4. Fixed drug eruption (FDE)</b>${img('p07-3', 'ผื่น FDE รูปกลมสีแดงเข้ม')}${img('p07-4', 'รอยดำคล้ำของ FDE')}</td><td>ผื่นกลม/รี สีแดงเข้ม ตรงกลางคล้ำ อาจเป็นตุ่มน้ำ เจ็บ คัน · <b>หายแล้วทิ้งรอยดำคล้ำนาน</b> · แพ้หลายยา ผื่นแต่ละยามักขึ้นคนละตำแหน่ง</td><td>ครั้งแรก ชม.–วัน · ได้ซ้ำ 30 นาที–8 ชม.</td><td>NSAIDs (naproxen), TMP-SMX, tetracyclines, metronidazole</td></tr>
  <tr><td><b>5. Eczematous drug eruption</b>${img('p07-1', 'ผื่น eczematous drug eruption')}${img('p07-7', 'ผื่น eczematous ที่หลัง')}</td><td>ตุ่มนูนและปื้นแดง คล้าย MP แต่นูนกว่า ขนาดใหญ่ อาจเป็นตุ่มน้ำ แตกเป็นน้ำเหลือง ตกสะเก็ด คันมาก</td><td>–</td><td>–</td></tr>
  <tr><td><b>6. Erythema multiforme (EM)</b>${img('p07-5', 'ผื่น target lesion ของ erythema multiforme')}${img('p07-6', 'target lesion ที่มือ')}</td><td>รอยแดง ตุ่มนูน ตุ่มน้ำ · <b>target/iris lesion วงกลม 3 ชั้น</b> · ฝ่ามือ ฝ่าเท้า เหนือข้อศอก ข้อต่าง ๆ ใบหน้า</td><td>–</td><td>–</td></tr>
  <tr><td><b>7. Exfoliative dermatitis (ED)</b>${img('p07-2', 'ผิวหนังแดงลอกเป็นขุยทั่วหลัง')}</td><td>เริ่มคล้าย MP rash แล้วลาม หลุดลอกเป็นขุยแห้งทั่วตัว · ผิวแดงมันเงา อักเสบมากมีน้ำเหลืองตกสะเก็ด</td><td>ค่อยเป็นค่อยไป 2–6 สัปดาห์หลังเริ่มยา</td><td>Anticonvulsants, allopurinol, antibiotics, sulfonamides, lithium</td></tr>
  <tr><td><b>8. Stevens-Johnson syndrome (SJS)</b>${img('p08-2', 'ผื่น SJS สีแดงคล้ำมีตุ่มน้ำ')}</td><td><b>Prodrome</b> 1–3 วันก่อนผื่น: คล้ายหวัด ไข้สูง ปวดเมื่อย คลื่นไส้อาเจียน เจ็บคอ ปวดข้อ เจ็บตา เจ็บปาก · atypical target lesion (วงไม่ครบ 3 ชั้น สีแดงเข้ม/ดำ/ตุ่มน้ำ) · เยื่อบุ เช่น ริมฝีปาก ตา อวัยวะเพศ · <b>เยื่อบุ ≥ 2 แห่ง + ผิวหลุดลอก &lt; 10% BSA</b> · Nikolsky sign บวก</td><td>4–28 วันหลังเริ่มยา (เร็วขึ้นถ้าได้ซ้ำ)</td><td>Allopurinol, sulfonamide, anticonvulsants (carbamazepine, lamotrigine, phenytoin), nevirapine, NSAID</td></tr>
  <tr><td><b>9. Toxic epidermal necrolysis (TEN)</b>${img('p08-1', 'ผิวหนังหลุดลอกเป็นแผ่นใหญ่ใน TEN')}</td><td>Prodrome → ผื่นคล้าย MP → ตุ่มน้ำ หลุดลอกเร็วเป็นแผ่นใหญ่ เลือดน้ำเหลืองซึมคล้ายน้ำร้อนลวก · <b>ผิวหลุดลอก &gt; 30% BSA</b> · Nikolsky sign บวก · อัตราตายสัมพันธ์กับพื้นที่ลอกและภาวะแทรกซ้อน</td><td>4–28 วันหลังเริ่มยา (เร็วขึ้นถ้าได้ซ้ำ)</td><td>Cross-reactivity: aromatic anticonvulsants (carbamazepine, phenytoin, phenobarbital)</td></tr>
  <tr><td><b>10. DRESS</b>${img('p09-3', 'ผื่นแดงทั่วลำตัวใน DRESS')}</td><td>ไข้สูงนำ 1–2 วัน · ผื่นได้หลายแบบ (MP, SJS, TEN, ED) · อวัยวะภายในผิดปกติ: ต่อมน้ำเหลืองโต ตับอักเสบ + <b>eosinophil สูง</b> · RegiSCAR: &lt; 2 no case, 2–3 possible, 4–5 probable, &gt; 5 definite</td><td><b>2–8 สัปดาห์</b> (ช้าที่สุด)</td><td>Sulfonamide, aromatic anticonvulsants, allopurinol, dapsone, nevirapine, vancomycin</td></tr>
  <tr><td><b>11. AGEP</b> (acute generalized exanthematous pustulosis)${img('p09-1', 'ตุ่มหนองเล็กจำนวนมากใน AGEP')}${img('p09-2', 'ตุ่มหนองที่ผิวหนังใน AGEP')}</td><td>ตุ่มหนอง (sterile pustules) จำนวนมาก เริ่มที่ใบหน้าแล้วลามทั่วตัว มักมีไข้ · วินิจฉัยด้วย EuroSCAR score</td><td>ชั่วโมง–1–3 วันหลังได้ยา</td><td>Antibiotics (β-lactams, macrolides), diltiazem, antimalarials, terbinafine</td></tr>
</table></div>
<div class="key"><strong class="k">SJS กับ TEN คือโรคเดียวกัน</strong>T cell โจมตีเซลล์ผิวหนังจนตายเป็นวงกว้าง ต่างกันที่ % ผิวหลุดลอก: SJS &lt; 10% · SJS-TEN overlap 10–30% · TEN &gt; 30% BSA</div>
<p style="font-size:.9em">ต้นฉบับเขียนในช่องลักษณะของ AGEP ว่า "เกิดขึ้นหลังได้รับยา 1–3 สัปดาห์" ซึ่งขัดกับช่องช่วงเวลาและคำอธิบายในข้อสอบ (ชั่วโมงถึง 1–3 วัน) จึงใช้ตามช่องช่วงเวลา</p>` },
    { id: 'assess', t: 'การประเมินแพ้ยาและบัตรแพ้ยา', html: `<h3>Naranjo's algorithm</h3>
<div class="tbl"><table>
  <tr><th>คำถาม</th><th>ใช่</th><th>ไม่ใช่</th><th>ไม่ทราบ</th></tr>
  <tr><td>1. เคยมีสรุปหรือรายงานปฏิกิริยานี้มาแล้วหรือไม่</td><td>+1</td><td>0</td><td>0</td></tr>
  <tr><td>2. อาการเกิดขึ้นภายหลังจากได้รับยาที่คิดว่าเป็นสาเหตุหรือไม่</td><td>+2</td><td>−1</td><td>0</td></tr>
  <tr><td>3. อาการดีขึ้นเมื่อหยุดยา หรือเมื่อให้ยาต้านที่จำเพาะ (specific antagonist) หรือไม่</td><td>+1</td><td>0</td><td>0</td></tr>
  <tr><td>4. อาการเกิดขึ้นอีกเมื่อเริ่มให้ยาใหม่หรือไม่</td><td>+2</td><td>−1</td><td>0</td></tr>
  <tr><td>5. ปฏิกิริยานี้เกิดจากสาเหตุอื่น (นอกจากยา) ได้หรือไม่</td><td>−1</td><td>+2</td><td>0</td></tr>
  <tr><td>6. ปฏิกิริยาเกิดขึ้นอีกเมื่อให้ยาหลอกหรือไม่</td><td>−1</td><td>+1</td><td>0</td></tr>
  <tr><td>7. ตรวจวัดปริมาณยาในเลือด (หรือของเหลวอื่น) ได้ในระดับที่เป็นพิษหรือไม่</td><td>+1</td><td>0</td><td>0</td></tr>
  <tr><td>8. ปฏิกิริยารุนแรงขึ้นเมื่อเพิ่มขนาดยา หรือลดลงเมื่อลดขนาดยาหรือไม่</td><td>+1</td><td>0</td><td>0</td></tr>
  <tr><td>9. ผู้ป่วยเคยมีปฏิกิริยาเหมือนหรือคล้ายกันนี้มาก่อนกับยาเดิมหรือยาคล้ายกันหรือไม่</td><td>+1</td><td>0</td><td>0</td></tr>
  <tr><td>10. อาการได้รับการยืนยันด้วยหลักฐานที่เป็นรูปธรรม (objective evidence) หรือไม่</td><td>+1</td><td>0</td><td>0</td></tr>
</table></div>
<p><b>แปลผล:</b> ≥ 9 definite (ใช่แน่) · 5–8 probable (น่าจะใช่) · 1–4 possible (อาจจะใช่) · ≤ 0 doubtful (น่าสงสัย)</p>
<h3>องค์ประกอบของบัตรแพ้ยา</h3>
<figure><img data-fig="adr/p10-2.webp" alt="ตัวอย่างการเขียนบัตรแพ้ยา ibuprofen ทำให้ angioedema และ paracetamol ทำให้ maculopapular rash"><figcaption>ตัวอย่างการเขียนบัตรแพ้ยา</figcaption></figure>
<ol>
  <li>ชื่อสามัญของยา</li>
  <li>อาการที่เกิดขึ้น</li>
  <li>ผลการประเมิน</li>
  <li>หน่วยงาน และชื่อผู้ประเมิน</li>
  <li>วันที่ประเมิน</li>
  <li>คำแนะนำเพิ่มเติมเพื่อป้องกันการแพ้ยาในกลุ่มเดียวกัน</li>
</ol>
<h3>ยีนที่สัมพันธ์กับการแพ้ยา</h3>
<div class="tbl"><table>
  <tr><th>ยา</th><th>ยีน</th></tr>
  <tr><td>Allopurinol</td><td>HLA-B*58:01</td></tr>
  <tr><td>Carbamazepine</td><td>HLA-B*15:02</td></tr>
  <tr><td>Phenytoin</td><td>HLA-B*15:02</td></tr>
  <tr><td>Abacavir</td><td>HLA-B*57:01, HLA-DRB1*07:01, HLA-DQ3</td></tr>
  <tr><td>Nevirapine</td><td>HLA-B*35:05</td></tr>
</table></div>` },
  ],
  questions: [
    { case: 'ชายไทย 45 ปี เป็นโรคเกาต์ เริ่ม allopurinol 100 mg/day เมื่อ 4 สัปดาห์ก่อน วันนี้มีไข้สูง 38.8°C ผื่นแดงแบบ maculopapular rash ทั่วตัว หน้าบวม (facial edema) คลำพบต่อมน้ำเหลืองโตที่คอ ALT 250 U/L, AST 180 U/L, eosinophil 1,500 cells/mcL', q: 'จากข้อมูลทางคลินิกและระยะเวลาเกิดอาการ ผู้ป่วยน่าจะเกิดอาการไม่พึงประสงค์ทางผิวหนังชนิดใดมากที่สุด', o: ['Stevens-Johnson syndrome (SJS)', 'Toxic epidermal necrolysis (TEN)', 'Drug reaction with eosinophilia and systemic symptoms (DRESS)', 'Acute generalized exanthematous pustulosis (AGEP)', 'Erythema multiforme (EM)'], a: 2, e: 'DRESS เกิดช้าที่สุด 2–8 สัปดาห์หลังเริ่มยา (รายนี้ 4 สัปดาห์) ร่วมกับไข้สูง หน้าบวม ต่อมน้ำเหลืองโต ตับอักเสบ และ eosinophil สูง · SJS/TEN เกิด 4–28 วัน มีผิวหลุดลอกและแผลเยื่อบุ ≥ 2 แห่ง · AGEP เกิดเร็ว 1–3 วัน เป็นตุ่มหนองปลอดเชื้อ · EM เป็น target lesion 3 ชั้น ไม่รุนแรงถึงอวัยวะภายใน' },
    { case: 'ชายไทย 28 ปี ได้ TMP-SMX รักษาทางเดินปัสสาวะอักเสบเมื่อ 10 วันก่อน มาห้องฉุกเฉินด้วยไข้สูง ปากเปื่อย ตาแดง แผลหลุดลอกที่เยื่อบุช่องปากและตา ผื่นแดงคล้ำกลายเป็นตุ่มน้ำ ผิวหลุดลอกเป็นแผ่นใหญ่คล้ายน้ำร้อนลวก Nikolsky sign positive พื้นที่หลุดลอก 35% BSA', q: 'ข้อใดคือคำวินิจฉัยที่ถูกต้องที่สุด', o: ['Stevens-Johnson syndrome (SJS)', 'Toxic epidermal necrolysis (TEN)', 'SJS/TEN overlap', 'Acute generalized exanthematous pustulosis (AGEP)', 'Erythema multiforme (EM)'], a: 1, e: 'แยก SJS/TEN ด้วย % BSA ที่หลุดลอก: SJS < 10% · overlap 10–30% · TEN > 30% · AGEP เป็นตุ่มหนองเล็ก เกิดเร็ว ไม่ลอกเป็นแผ่นใหญ่ · EM เป็น target lesion ไม่มี Nikolsky sign' },
    { case: 'หญิง 62 ปี เป็นโรคข้ออักเสบรูมาตอยด์ กิน chloroquine ต่อเนื่อง 5 ปี ตรวจตาล่าสุดพบ retinopathy จากการสะสมของยา', q: 'ตามหลักการจำแนก ADR อาการไม่พึงประสงค์นี้จัดอยู่ในประเภทใด', o: ['Type A (Augmented) – สัมพันธ์กับขนาดยา ทำนายได้จากกลไกทางเภสัชวิทยา', 'Type B (Bizarre) – ไม่สัมพันธ์กับขนาดยา เป็นความไวเฉพาะบุคคลหรือภูมิคุ้มกัน', 'Type C (Chronic) – สัมพันธ์กับทั้งขนาดยาและเวลา ต้องใช้ยาต่อเนื่องเป็นเวลานาน', 'Type D (Delayed) – สัมพันธ์กับเวลา อาการเกิดช้ามากหรือเกิดหลังหยุดยาไปแล้ว', 'Type E (End of use) – กลุ่มอาการถอนยา เกิดทันทีหลังหยุดยา'], a: 2, e: 'Retinopathy จาก chloroquine ระยะยาวเป็นตัวอย่างคลาสสิกของ type C: สัมพันธ์กับขนาดยาและระยะเวลา จากการสะสมในเนื้อเยื่อ · type A เช่น hypoglycemia จาก sulfonylurea · type B เช่น anaphylaxis · type D เช่น carcinogenesis, teratogenesis · type E เช่น ประสาทหลอนหลังหยุด diazepam' },
    { case: 'ชายไทย 50 ปี หนัก 68 kg เจ็บปาก หน้าตึง มา 4 สัปดาห์หลังกิน phenytoin (100) 3×1 hs · 1 สัปดาห์ก่อนมา ปวดเมื่อยตามตัว ปวดหัว เยื่อบุตาอักเสบ ตาแดง เจ็บปาก ไม่มีผื่น จากนั้นเริ่มมีผื่นที่แขน ขา ลำตัว และผิวหนังหลุดลอก วินิจฉัยว่าเป็น SJS', q: 'ข้อใดไม่ใช่ prodrome ของ SJS', o: ['ไข้สูง', 'คลื่นไส้ อาเจียน', 'ปวดเมื่อยตามตัว', 'ผื่นขึ้นตามร่างกาย', 'เจ็บคอ ปวดข้อ'], a: 3, e: 'Prodrome คืออาการนำ 1–3 วันก่อนมีผื่น: คล้ายหวัด ไข้สูง ปวดเมื่อย คลื่นไส้อาเจียน เจ็บคอ ปวดข้อ เจ็บตา เจ็บปาก · ผื่นและตุ่มน้ำ (atypical target lesion) เป็นรอยโรคที่ตามมาหลัง prodrome' },
    { q: 'ผู้ป่วยซื้อยาแก้ปวดฟันกินมา 2 ชั่วโมง เกิดบวมเปลือกตา ริมฝีปาก สีผิวปกติ สัมพันธ์กับข้อใด', o: ['Anaphylactoid reaction', 'Cell-mediated hypersensitivity reaction', 'IgE-mediated hypersensitivity reaction', 'Cytotoxic immune hypersensitivity reaction', 'Immune complex hypersensitivity reaction'], a: 2, e: 'Angioedema ที่เกิดภายในนาที–ชั่วโมงหลังได้ยา = type I ผ่าน IgE และ mast cell degranulation · anaphylactoid อาการคล้ายกันแต่ไม่ผ่าน IgE · cell-mediated (type IV) เกิดช้า 24–72 ชม. ขึ้นไป · cytotoxic (type II) ทำลายเม็ดเลือด · immune complex (type III) เกิด 1–3 สัปดาห์' },
    { q: 'ผู้ป่วยทานยา ibuprofen ชนิด soft capsule แล้วตาและปากบวม เป็นผื่นแพ้แบบใด', o: ['Angioedema', 'MP rash', 'Vasculitis', 'Urticaria', 'Erythema multiforme'], a: 0, e: 'บวมเฉพาะที่บริเวณเยื่อบุ (ริมฝีปาก รอบตา) = angioedema · NSAIDs เป็นสาเหตุที่พบบ่อยแบบ histamine-mediated · urticaria เป็น wheal กระจายและย้ายที่ได้ · MP rash เป็น macule + papule ทั่วตัว · vasculitis เป็นจ้ำแดงตามหลอดเลือด · EM เป็น target lesion' },
    { case: 'หญิงไทยคู่ มาด้วยผิวหนังลอกไหม้ มีแผลในปาก โรคประจำตัว: ความดัน เบาหวาน ไขมันในเลือดสูง เกาต์ แพทย์วินิจฉัยเป็น toxic epidermal necrolysis · ประวัติ: 3 วันก่อนมีไข้ เจ็บคอ เริ่มมีผื่นแดง จึงกิน paracetamol · 1 สัปดาห์ก่อนเริ่ม allopurinol · ก่อนหน้านั้นได้ glibenclamide · 2 เดือนก่อนได้ enalapril', q: 'อาการแพ้ยาที่เกิดขึ้นเป็น type ใด', o: ['Type I', 'Type II', 'Type III', 'Type IV', 'Mixed type'], a: 3, e: 'TEN เป็น SCARs ที่ผ่าน T cell โดยตรง (type IV) onset ช้า ตรงกับการเริ่ม allopurinol 1 สัปดาห์ก่อน · type I เกิดในนาที–ชั่วโมง · type II ทำลายเม็ดเลือด · type III เป็น serum sickness' },
    { q: 'ข้อใดเป็นสาเหตุให้เกิดการแพ้มากที่สุด', o: ['โรคเรื้อรัง', 'กิน paracetamol', 'กิน allopurinol', 'กรรมพันธุ์', 'เพศหญิง'], a: 2, e: 'Allopurinol เริ่มเมื่อ 1 สัปดาห์ก่อน ตรงกับ latency ของ SCARs และเป็นยาที่พบบ่อยที่สุดตัวหนึ่งที่ทำให้เกิด SJS/TEN · paracetamol กินหลังเริ่มมีอาการแล้ว · กรรมพันธุ์ (HLA-B*58:01) มีผลต่อความเสี่ยงแต่โจทย์ไม่มีข้อมูล' },
    { q: 'ข้อใดไม่เกี่ยวข้องกับการวินิจฉัย TEN', o: ['มีผื่นผิวหนังลอกมากกว่า 30%', 'มีไข้ เจ็บคอ เริ่มมีผื่นแดงขึ้น', 'ได้รับยาที่มี incidence สูงในการเกิด TEN', 'มีแผลที่อวัยวะเยื่อบุ ≥ 2 แห่ง', 'โรคประจำตัวมาก'], a: 4, e: 'เกณฑ์ TEN: ผิวลอก > 30% BSA, แผลเยื่อบุ ≥ 2 แห่ง, Nikolsky sign บวก, มี prodrome และได้ยาที่มี incidence สูง (causality) · จำนวนโรคประจำตัวไม่ใช่เกณฑ์วินิจฉัย' },
    { case: 'หญิงไทยไม่มีโรคประจำตัว วินิจฉัย bacterial sinusitis ได้ ibuprofen, amoxicillin, cetirizine หลังทานยา 2 วัน มีผื่นคันเป็นปื้น ขอบเขตชัดเจน ขอบนูน รูปร่างไม่แน่นอน คันมากที่แขน ขา ใบหน้า ลำคอ มาปรึกษาเภสัชกร', q: 'ผู้ป่วยรายนี้เป็นอะไร', o: ['MP rash', 'Contact dermatitis', 'Urticaria', 'SJS', 'TEN'], a: 2, e: 'ปื้นนูน (wheal) ขอบเขตชัดเจน คันมาก = urticaria · MP rash ขอบไม่ชัด · contact dermatitis เกิดจากสัมผัสทางผิวหนัง · SJS/TEN ต้องมีผิวลอกและแผลเยื่อบุ' },
    { q: 'ควรจ่ายยาฆ่าเชื้อตัวใด', o: ['Cephalexin', 'Cefuroxime', 'Roxithromycin', 'Clotrimazole', 'Metronidazole'], a: 2, e: 'แพ้ amoxicillin (β-lactam) ควรเปลี่ยนเป็นกลุ่มที่ไม่ใช่ β-lactam เช่น macrolide (roxithromycin) ซึ่งรักษาการติดเชื้อทางเดินหายใจได้ · cephalosporin มี β-lactam ring เสี่ยง cross-reactivity · clotrimazole เป็นยาต้านเชื้อรา · metronidazole เน้น anaerobe และ protozoa' },
    { q: 'ผู้ป่วยต้องการรักษาผื่นที่หน้า จะจ่ายยาตัวใด', o: ['TA 0.02%', 'Ketoconazole 2%', 'Mycopirox', 'Clobetasol', 'Vitamin E'], a: 0, e: 'Triamcinolone acetonide 0.02% เป็น topical steroid ความแรงต่ำ–ปานกลาง เหมาะกับผิวบางอย่างใบหน้า · clobetasol แรงมาก เสี่ยง skin atrophy · ketoconazole และ mycopirox เป็นยาต้านเชื้อรา · vitamin E ไม่มีฤทธิ์ต้านการอักเสบโดยตรง' },
    { q: 'ถ้าผู้ป่วยแพ้ NSAID แบบ pseudoallergy จะสามารถใช้ยาตัวใดได้', o: ['Piroxicam', 'Naproxen', 'Diclofenac', 'Celecoxib', 'Meloxicam'], a: 3, e: 'Pseudoallergy ต่อ NSAIDs เกิดจากการยับยั้ง COX-1 จึง cross-react ข้ามโครงสร้างได้ · celecoxib เป็น selective COX-2 inhibitor ไม่ยับยั้ง COX-1 อย่างมีนัยสำคัญ · piroxicam, naproxen เป็น non-selective · diclofenac ยังยับยั้ง COX-1 พอสมควร · meloxicam ขนาดสูงยังยับยั้ง COX-1' },
    { q: 'Maculopapular rash มีลักษณะอย่างไร', o: ['รอยนูนแดงขนาดเล็ก กระจายทั่วตัว ผื่นจะมีสีจืดจางกว่าบริเวณรอบ ๆ', 'ตุ่มนูนแดง ตรงกลางของผื่นจะพอง อาจกลายเป็นตุ่มน้ำ', 'ผื่นที่มีเฉพาะการเปลี่ยนแปลงสีผิว ลักษณะแบบราบ', 'ตุ่มน้ำขนาดใหญ่ปรากฏบนผื่นแดง', 'ผื่นที่มีลักษณะเป็นสะเก็ดสีเงินปกคลุม'], a: 0, e: 'MP rash = macule + papule ขนาดเล็ก กระจายสมมาตรทั่วตัว ขอบไม่ชัด คันมาก · ตรงกลางพองเป็นตุ่มน้ำเข้ากับ EM · ราบล้วนไม่ใช่ MP · ตุ่มน้ำใหญ่เข้ากับ SJS/TEN · สะเก็ดสีเงินคือ psoriasis' },
    { q: 'ผื่น maculopapular rash จากการแพ้ยา เป็น ADR แบบใด', o: ['ADR type A', 'ADR type B', 'ADR type C', 'ADR type D', 'ADR type E'], a: 1, e: 'MP rash เป็นปฏิกิริยาทางภูมิคุ้มกัน (type IV) จัดเป็น ADR type B: ไม่สัมพันธ์กับขนาดยาและทำนายไม่ได้ · ผื่นแพ้ยาทางภูมิคุ้มกัน (MP rash, SJS/TEN, DRESS, AGEP) จัดเป็น type B ทั้งหมด' },
    { q: 'การแพ้ยา carbamazepine และ phenytoin เกี่ยวข้องกับยีนใด', o: ['CYP2D6', 'CYP2C19', 'CYP2C9', 'HLA-A', 'HLA-B'], a: 4, e: 'Aromatic anticonvulsants สัมพันธ์กับ HLA-B*15:02 ซึ่งพบมากในคนเอเชียรวมถึงคนไทย และสัมพันธ์ชัดเจนกับ SJS/TEN · CYP เป็นเอนไซม์เมแทบอลิซึม (PK) ไม่ใช่กลไกภูมิคุ้มกัน · HLA-A*31:01 สัมพันธ์กับ carbamazepine ในบางประชากร (เช่น ยุโรป) · หมายเหตุ: ต้นฉบับเขียนตัวเลือก "CYP2D19" ซึ่งหมายถึง CYP2C19' },
    { q: 'เม็ดเลือดขาวชนิดใดเกี่ยวข้องกับ SJS', o: ['Basophil', 'Neutrophil', 'Eosinophil', 'T-lymphocyte', 'B-lymphocyte'], a: 3, e: 'SJS/TEN เป็น type IV ผ่าน T cell (โดยเฉพาะ cytotoxic CD8+) ที่ทำลาย keratinocyte · basophil เกี่ยวกับ type I · neutrophil เด่นใน AGEP · eosinophil เด่นใน DRESS · B cell สร้าง antibody (type I–III)' },
    { q: 'SJS ต่างจาก TEN อย่างไร', o: ['ระยะเวลาในการเกิดผื่นหลังได้รับยา', 'การตรวจพบ Nikolsky sign', 'ร้อยละของผิวหนังหลุดลอกต่อพื้นที่ผิวร่างกายทั้งหมด', 'ลักษณะการลอกของผิวหนัง', 'การถูกทำลายของอวัยวะภายใน'], a: 2, e: 'แยกด้วย % BSA ที่หลุดลอก: SJS < 10% · overlap 10–30% · TEN > 30% · ทั้งคู่ latency 4–28 วัน Nikolsky sign บวก ลักษณะการลอกคล้ายกัน และมีภาวะแทรกซ้อนอวัยวะภายในได้' },
  ],
}
