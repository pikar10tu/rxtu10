// Hyperthyroidism + hypothyroidism — converted from the RxTU10 class summary PDF (see content/summaries/manifest.json)
export default {
  id: 'thyroid',
  date: '',
  refs: [
    'American Thyroid Association. ATA Professional Guidelines (2016) · Hypothyroidism (2023)',
    'Kravets I. Hyperthyroidism: diagnosis and treatment. Am Fam Physician. 2016;93(5):363–70.',
    'StatPearls: Hyperthyroidism (NBK537053), Hypothyroidism, Levothyroxine, Radioactive iodine therapy (NBK557741), Physiology TSH',
    'NICE NG145. Thyroid disease: assessment and management. 2019.',
    'Donangelo I, Suh S. Subclinical hyperthyroidism: when to consider treatment. Am Fam Physician. 2017;95(11):710–6.',
    'UpToDate drug information: methimazole, propylthiouracil, sodium iodide I-131, Lugol solution, SSKI, levothyroxine',
    'คำแนะนำสำหรับภาวะความผิดปกติของต่อมไทรอยด์ พ.ศ. 2568 · คณะแพทยศาสตร์โรงพยาบาลรามาธิบดี: Patients with thyroid dysfunction',
    'Skelin M, et al. Factors affecting gastrointestinal absorption of levothyroxine. Clin Ther. 2017;39(2):378–403.',
  ],
  sections: [
    { id: 'hyper', t: 'Hyperthyroidism', html: `<p>ต่อมไทรอยด์สร้างและหลั่งฮอร์โมนมากเกิน เมแทบอลิซึมและการทำงานหลายระบบเพิ่มขึ้น</p>
<ul>
  <li><b>Hyperthyroidism</b> = ต่อมสร้างฮอร์โมนเพิ่มจริง · <b>Thyrotoxicosis</b> = เนื้อเยื่อได้รับฮอร์โมนมากเกิน ไม่ว่ามาจากไหน</li>
  <li>Hyperthyroidism ทุกรายเป็น thyrotoxicosis แต่ thyrotoxicosis ไม่จำเป็นต้องเป็น hyperthyroidism (เช่น thyroiditis, ได้ levothyroxine เกิน)</li>
</ul>
<h3>Epidemiology และ risk factors</h3>
<ul>
  <li>หญิงมากกว่าชาย 5–10 เท่า มักเริ่มอายุ 20–50 ปี · เกี่ยวกับไอโอดีน · <mark>Graves' disease เป็นสาเหตุที่พบบ่อยที่สุด (60–80%)</mark></li>
  <li>พันธุกรรม · สูบบุหรี่ (เพิ่มเสี่ยงและความรุนแรงของ thyroid eye disease) · ขาดหรือได้ไอโอดีนเกิน · selenium เกิน · ยา: amiodarone, interferon-α, PD-1 inhibitors (nivolumab, pembrolizumab), alemtuzumab, lithium</li>
</ul>
<h3>Causes</h3>
<div class="tbl"><table>
  <tr><th>Thyrotoxicosis with hyperthyroidism (RAIU สูง)</th><th>Thyrotoxicosis without hyperthyroidism (RAIU ต่ำ)</th></tr>
  <tr><td>Graves disease · toxic multinodular goiter · toxic adenoma</td>
      <td>thyroiditis · drug-induced thyroiditis (amiodarone, iodine, radiation, lithium) · ฮอร์โมนที่สะสมถูกปล่อยออกมาหรือได้จากภายนอก โดยทั่วไป<b>ไม่ตอบสนองต่อ antithyroid drugs</b></td></tr>
</table></div>
<h3>Diagnosis</h3>
<p><b>อาการ:</b> เหงื่อออก ทนร้อนไม่ได้ ใจสั่น วิตกกังวล <b>น้ำหนักลดแม้กินปกติหรือมากขึ้น</b> ถ่ายบ่อย หายใจลำบาก ต่อมไทรอยด์โต · <mark>เสี่ยง osteoporosis และ atrial fibrillation</mark></p>
<ol>
  <li><b>Serum TSH</b> (first-line screening ไวที่สุด): ต่ำ → สงสัย primary hyperthyroidism ตรวจ FT4/FT3 ต่อ</li>
  <li><b>Free T4:</b> วัดการทำงานของไทรอยด์จริง · สูง → overt hyperthyroidism</li>
  <li><b>TRAb/TSI:</b> autoantibody ต่อ TSH receptor ยืนยัน Graves</li>
  <li><b>RAIU:</b> แยก Graves จาก toxic adenoma และ thyroiditis</li>
</ol>
<div class="tbl"><table>
  <tr><th>ชนิด</th><th>TSH</th><th>FT4 / FT3</th><th>หมายเหตุ</th></tr>
  <tr><td>Primary (overt)</td><td>↓</td><td>↑</td><td>พบมากสุด: Graves, toxic adenoma, toxic MNG</td></tr>
  <tr><td>Central (secondary)</td><td>ปกติหรือ ↑</td><td>↑</td><td>ต่อมใต้สมองหลั่ง TSH มากเกิน</td></tr>
  <tr><td>Subclinical</td><td>↓</td><td>ปกติ</td><td>มักไม่มีอาการ แต่เสี่ยง AF, osteoporosis, fracture · อาจกลายเป็น overt</td></tr>
</table></div>
<figure><img data-fig="thyroid/p05-1.webp" alt="แผนภูมิแปลผล serum TSH, FT4, FT3 และขั้นตอนหาสาเหตุ: TRAb, RAIU/thyroid scan แยก Graves, toxic adenoma, toxic MNG, thyroiditis"><figcaption>สรุปการแยกประเภทโรค (คำแนะนำภาวะความผิดปกติของต่อมไทรอยด์ พ.ศ. 2568)</figcaption></figure>
<h3>โรคที่สำคัญ</h3>
<ul>
  <li><b>Graves' disease:</b> autoimmune สร้าง TRAb/TSI กระตุ้น TSH receptor → T3, T4 มากขึ้น · thyroid acropachy (clubbing) · <b>Graves' dermopathy</b> ผิวหนาขรุขระคล้ายเปลือกส้มที่หน้าแข้ง/หลังเท้า · <b>thyroid eye disease</b> หนังตาบวม ตาโปน ตาแดง แผลที่กระจกตา เห็นภาพซ้อน (optic nerve compression 20–30%)</li>
  <li><b>Toxic multinodular goiter:</b> บริเวณขาดไอโอดีน ผู้สูงอายุที่คอโตหลายปี ก้อนบางก้อนสร้างฮอร์โมนเองนอกการควบคุมของ TSH · คอโตหลายก้อน RAIU หลายตำแหน่ง</li>
  <li><b>Toxic adenoma:</b> ก้อนเดี่ยว autonomous · RAIU ก้อนเดียว (hot nodule)</li>
</ul>` },
    { id: 'hypertx', t: 'การรักษา hyperthyroidism', html: `<ol>
  <li><b>Antithyroid drugs:</b> อายุ &lt; 40 ปี อาการไม่มาก เป็นครั้งแรก ต่อมโตไม่มาก ใช้นาน 18–24 เดือนหวัง long-term remission</li>
  <li><b>Thyroidectomy:</b> ทำน้อย toxic adenoma/MNG ต่อมใหญ่ หรืออาการทางตามาก (แพง ต้องดมยา นอนโรงพยาบาล)</li>
  <li><b>Radioactive iodine:</b> toxic MNG และ toxic adenoma (โดยเฉพาะผู้สูงอายุ) · Graves อายุ &gt; 30 ปี ต่อมโตปานกลาง–ใหญ่ อาการมาก · Graves อายุน้อยที่แพ้ยา เป็นซ้ำ หรือ compliance ไม่ดี · <b>เกิด hypothyroid ตามมามากกว่าการผ่าตัด</b></li>
</ol>
<h3>Antithyroid drugs (thionamides)</h3>
<p>Methimazole (MMI), propylthiouracil (PTU) — ยับยั้ง thyroid peroxidase (TPO) ลด iodination ของ thyroglobulin ลด coupling ของ MIT/DIT ลดการสร้าง T3, T4 · first-line ส่วนใหญ่ รักษา 12–18 เดือน ตรวจ TFT 3–4 สัปดาห์หลังเริ่มยา titrate ตาม FT4/FT3</p>
<ul>
  <li><b>วางแผน RAI:</b> ให้ ATDs จน euthyroid · หยุด MMI 3–5 วัน หรือ PTU 5–7 วันก่อน RAI</li>
  <li><b>รักษาด้วย ATDs:</b> 12–18 เดือน ประเมิน TRAb ก่อนหยุด · TRAb ยังสูงหรือกลับเป็นซ้ำ → RAI หรือผ่าตัด</li>
  <li><b>Monitor:</b> FT4 และ/หรือ total T3 ทุก 2–6 สัปดาห์หลังเริ่ม/ปรับยา · euthyroid แล้วทุก 2–3 เดือน · <mark>ไม่ใช้ TSH ปรับยาช่วงแรก</mark> (อาจต่ำต่อเนื่องหลายเดือน)</li>
</ul>
<div class="tbl"><table>
  <tr><th></th><th>Methimazole</th><th>PTU</th></tr>
  <tr><td>กลไก</td><td>ยับยั้ง TPO</td><td>ยับยั้ง TPO + <b>ยับยั้ง T4 → T3</b></td></tr>
  <tr><td>Bioavailability</td><td>~93%</td><td>53–88%</td></tr>
  <tr><td>Protein binding</td><td>ไม่จับ</td><td>80–85%</td></tr>
  <tr><td>Half-life</td><td>4–6 ชม. (สะสมในต่อม จึง<b>วันละครั้ง</b>)</td><td>~1 ชม. (วันละ 2–3 ครั้ง)</td></tr>
  <tr><td>Onset / duration</td><td>12–18 ชม. / 36–72 ชม.</td><td>24–36 ชม. / 12–24 ชม.</td></tr>
  <tr><td>ผ่านรก</td><td>ผ่าน</td><td>ผ่าน</td></tr>
  <tr><td>First-line</td><td><b>ใช่</b></td><td>ไม่</td></tr>
  <tr><td>First trimester</td><td>ไม่ (congenital malformations)</td><td><b>ใช่</b></td></tr>
  <tr><td>Thyroid storm</td><td>ใช้ได้</td><td><b>preferred</b></td></tr>
  <tr><td>ADR เด่น</td><td>agranulocytosis, cholestatic hepatitis</td><td>agranulocytosis, <b>fulminant hepatitis</b> (รุนแรงกว่า)</td></tr>
</table></div>
<h3>Methimazole</h3>
<ul>
  <li>ตรวจ baseline CBC (ANC &gt; 1,000/mm³) ก่อนเริ่ม</li>
  <li>เริ่ม 10–30 mg OD หรือตาม FT4: 1–1.5 เท่า ULN → 5–10 mg/d · 1.5–2 เท่า → 10–20 mg/d · 2–3 เท่า → 20–30 mg/d</li>
  <li>ห้ามในไตรมาสแรก (aplasia cutis, choanal atresia, esophageal atresia) ใช้ได้ภายหลัง</li>
  <li><b>ADR:</b> hepatocellular injury (2 วัน–3 เดือน ขนาดสูง อายุมาก กลับคืนได้เมื่อหยุด) · <mark>agranulocytosis (ไข้ เจ็บคอ แผลในปาก) ทุกขนาด เสี่ยงเมื่อ &gt; 30 mg/d หรืออายุ &gt; 40 ปี</mark> · lupus-like syndrome, acute pancreatitis (หยุดยา) · vasculitis · minor (ไม่ต้องหยุด): คัน ผื่น ลมพิษ ปวดบวมข้อ ไข้ รับรสเปลี่ยน คลื่นไส้ อาเจียน</li>
</ul>
<h3>PTU (50 mg)</h3>
<ul>
  <li>ใช้เฉพาะ: <b>first trimester</b>, <b>thyroid storm</b>, แพ้ methimazole (เพราะ severe hepatotoxicity สูงกว่า)</li>
  <li>Hyperthyroidism: เริ่ม 100–300 mg/d แบ่ง 2–3 ครั้ง (รุนแรง 300–450) · maintenance 50–150 mg/d</li>
  <li>ตั้งครรภ์ไตรมาสแรก: 50–150 mg tid → maintenance 50–150 mg/d · เปลี่ยนเป็น methimazole หลัง 16 สัปดาห์ถ้าได้</li>
  <li>ADR: hepatocellular injury (หยุดถ้า transaminase &gt; 3× ULN · เด็กเสี่ยง) · agranulocytosis (ทุกขนาด สูงอายุ) · vasculitis · minor ADRs</li>
</ul>
<h3>Radioactive iodine (first-line + definitive)</h3>
<ul>
  <li><b>เตรียม:</b> beta-blocker (RAI อาจทำให้ hyperthyroid ชั่วคราว) · MMI pretreatment หยุด 2–3 วันก่อนและ 3–7 วันหลัง RAI · เลี่ยงอาหารไอโอดีนสูง ≥ 7 วัน · ตรวจการตั้งครรภ์ภายใน 48 ชม. ก่อนทำ</li>
  <li><b>หลังให้:</b> ติดตาม FT, TT, TSH · มักเกิด hypothyroidism สัปดาห์ที่ 4 ให้ levothyroxine ปรับตาม FT4 · ยัง hyperthyroid หลัง 6 เดือนทำซ้ำ</li>
  <li>Dose: Graves 10–15 mCi (370–555 MBq) หรือ 150 μCi/g · toxic MNG 150–200 μCi/g · toxic adenoma 10–20 mCi หรือ 150–200 μCi/g · ติดตามทุก 4–6 สัปดาห์ 6 เดือน</li>
  <li>ดูดซึมเร็ว 90% ใน 60 นาที ถูกจับที่ไทรอยด์ ขับทางปัสสาวะ 37–75% อุจจาระ ~10%</li>
  <li><b>C/I:</b> ตั้งครรภ์ ให้นมบุตร carcinoma ที่ไม่จับไอโอดีน Graves ophthalmopathy ปานกลาง–รุนแรง severe thyrotoxicosis อาเจียน ท้องเสีย · เลี่ยงใกล้เด็ก คนแก่ คนท้อง</li>
</ul>
<h3>Beta-blocker (symptomatic ทุกรายที่มีอาการ)</h3>
<p><b>Propranolol 160 mg/day</b> (block T4 → T3), atenolol, metoprolol</p>
<h3>Iodine solution</h3>
<ul>
  <li><b>Lugol's solution</b> (KI 10% + iodine 5%; 6.25 mg/drop): 5% 5–7 หยด (0.25–0.35 mL) วันละ 3 ครั้ง 10 วันก่อนผ่าตัด · onset 24–48 ชม. peak 10–15 วัน</li>
  <li><b>SSKI</b> (KI 1 g/mL; 1 drop = 50 mg): 1–2 หยด วันละ 3 ครั้ง 7–10 วันก่อนผ่าตัด · peak ~2 สัปดาห์ · <b>แรงกว่า Lugol's</b></li>
  <li>ADR: สิว เบื่ออาหาร ปวดท้อง ไข้ อ่อนแรง คอบวม แผลในปาก ผื่น หัวใจเต้นผิดจังหวะ ชาปลายมือเท้า รสโลหะในปาก</li>
</ul>
<div class="key"><strong class="k">จุดที่ออกสอบบ่อย</strong>Methimazole = first-line · PTU = first trimester และ thyroid storm · PTU ยับยั้ง T4 → T3 ส่วน MMI ไม่มี · MMI วันละครั้งเพราะสะสมในต่อม · PTU hepatotoxicity รุนแรงกว่า · <b>ใช้ MMI/PTU แล้วมีไข้ เจ็บคอ แผลในปาก → หยุดยาและตรวจ CBC ทันที</b> (agranulocytosis)</div>` },
    { id: 'hypo', t: 'Hypothyroidism', html: `<p>ต่อมไทรอยด์สร้าง T4, T3 ไม่พอ basal metabolic rate และการทำงานของอวัยวะลดลง (หัวใจ ประสาท ทางเดินอาหาร สืบพันธุ์ การเจริญเติบโต)</p>
<ul>
  <li>หญิงมากกว่าชาย 5–10 เท่า เพิ่มตามอายุ · พื้นที่ไอโอดีนพอ สาเหตุหลัก <b>Hashimoto thyroiditis</b> · พื้นที่ขาดไอโอดีน สาเหตุหลักคือขาดไอโอดีน</li>
  <li><b>Risk:</b> เพศหญิง อายุ &gt; 60 ปี ไอโอดีนสูง selenium ต่ำ น้ำหนักเพิ่ม/อ้วนตอนอายุ 14 ปี สูบบุหรี่</li>
</ul>
<div class="tbl"><table>
  <tr><th>ชนิด</th><th>TSH</th><th>FT4</th><th>หมายเหตุ</th></tr>
  <tr><td>Primary (overt)</td><td>↑</td><td>↓</td><td>พบมากสุด: Hashimoto, หลังผ่าตัดไทรอยด์, หลัง RAI</td></tr>
  <tr><td>Central (secondary)</td><td>ปกติ (หรือต่ำ)</td><td>↓</td><td>pituitary สร้าง TSH ลดลง</td></tr>
  <tr><td>Subclinical</td><td>↑</td><td>ปกติ</td><td></td></tr>
</table></div>
<p style="font-size:.9em">ต้นฉบับเขียน primary hypothyroidism ว่า "TSH ต่ำ/ปกติ/สูง" แต่เฉลยข้อสอบในเล่มเดียวกันใช้ TSH สูง + FT4 ต่ำ ตารางนี้จึงใช้ตามเฉลย</p>
<div class="key"><strong class="k">จำ</strong>Primary hypo = TSH ↑ FT4 ↓ · subclinical hypo = TSH ↑ FT4 ปกติ · primary hyper = TSH ↓ FT4 ↑ · subclinical hyper = TSH ↓ FT4 ปกติ</div>
<p><b>อาการ:</b> อ่อนเพลีย ทนหนาวไม่ได้ น้ำหนักเพิ่ม ท้องผูก ผิวแห้ง ปวด/อ่อนแรงกล้ามเนื้อ ประจำเดือนผิดปกติ คิดช้า ซึมเศร้า bradycardia ไขมันสูง · <b>myxedema coma</b> (วิกฤต)</p>
<ul>
  <li>TSH: primary screening test · FT4 ใช้ร่วมเพื่อแยก overt, subclinical, central</li>
  <li><b>TPOAb</b> และ thyroglobulin antibody (90%) บวก → Hashimoto's thyroiditis (chronic autoimmune ทำลาย follicular cells)</li>
</ul>
<h3>Levothyroxine (first-line)</h3>
<ul>
  <li><b>อายุ &lt; 65 ปีไม่มีโรคหัวใจ:</b> ~<mark>1.6 μg/kg/day</mark> (BTA: 1.5–1.8 μg/kg/day) · <b>≥ 65 ปีหรือมีโรคหัวใจ:</b> เริ่ม 25–50 μg/day แล้ว titrate · เป้าหมาย TSH ในช่วงปกติ</li>
  <li><b>Monitor:</b> TSH 6–8 สัปดาห์หลังเริ่ม/ปรับ · คงที่แล้วปีละครั้ง · primary ใช้ TSH · <b>central ใช้ FT4</b></li>
  <li><b>ADME:</b> ดูดซึม 40–80% ที่ jejunum/upper ileum ดีขึ้นเมื่อท้องว่าง · protein binding &gt; 99% · deiodination T4 → T3 และ reverse T3 · t½ euthyroid 6–7 วัน, hypo 9–10 วัน, hyper 3–4 วัน · ขับทางไต (อุจจาระ ~20%) · onset กิน 3–5 วัน peak 4–6 สัปดาห์ · IV 6–8 ชม.</li>
  <li><b>วิธีกิน:</b> <mark>ท้องว่าง 30–60 นาทีก่อนอาหารเช้า เวลาเดิมทุกวัน</mark> · แยกจาก calcium, iron, antacid (Al/Mg), sucralfate, cholestyramine (≥ 4 ชม.) · soy, fiber, กาแฟ, PPI ลดการดูดซึม · เปลี่ยนขนาด/ยี่ห้อ ตรวจ TSH ใน 6–8 สัปดาห์</li>
  <li><b>ADR:</b> over-replacement → iatrogenic hyperthyroidism (ใจสั่น tachycardia arrhythmia มือสั่น ทนร้อนไม่ได้) · ใช้เกินนาน ๆ เสี่ยง AF และกระดูกบาง</li>
  <li><b>ระวัง:</b> โรคหัวใจ (เริ่มต่ำ) · adrenal insufficiency ที่ยังไม่แก้ · malabsorption (celiac, IBD, atrophic gastritis) อาจต้องขนาดสูงขึ้น</li>
</ul>
<div class="key"><strong class="k">Myxedema coma</strong>Hypothermia + bradycardia + hypotension + hypoventilation + ซึม และมักมีประวัติหยุดยา · รักษา: admit ICU <b>IV levothyroxine + hydrocortisone</b> (อาจมี adrenal insufficiency ร่วม ให้ levothyroxine ก่อนโดยไม่ให้ steroid อาจเกิด adrenal crisis) + IV fluid, passive warming รักษาปัจจัยกระตุ้น</div>` },
  ],
  questions: [
    { case: 'นางสา อายุ 30 ปี วินิจฉัยว่าเป็นโรคต่อมไทรอยด์ทำงานมากเกินไป นำใบสั่งยามาซื้อที่ร้านยา: Methimazole (5) 2 tab bid #120', q: 'เภสัชกรควรซักประวัติ ข้อใด "ไม่จำเป็น" ต้องถาม', o: ['ตั้งครรภ์อยู่หรือไม่', 'อยู่ระหว่างให้นมบุตรหรือไม่', 'ใช้ยาต้านการแข็งตัวของเลือดอยู่หรือไม่', 'เคยได้ยามาก่อนและเคยแพ้ยานี้หรือไม่', 'เป็นโรคไตหรือไม่'], a: 4, e: 'ไม่มีคำแนะนำให้ปรับขนาด methimazole ใน CKD · ตั้งครรภ์ไตรมาสแรกเสี่ยง birth defect · ให้นมบุตรใช้ได้แต่ขนาดต่ำสุด · ใช้ร่วม vitamin K antagonist ต้องติดตามใกล้ชิด · เคยแพ้ควรเลี่ยง' },
    { q: 'คำแนะนำสำหรับผู้ป่วยที่ได้ methimazole ข้อใดยกเว้น', o: ['ใช้ยาแล้วมีไข้ เจ็บคอ แผลในปาก ควรรีบพบแพทย์และหยุดยา', 'ควรพบแพทย์ตรวจนับเม็ดเลือดขาวเป็นระยะ', 'ถ้าตั้งครรภ์ระหว่างใช้ยาให้ไปพบแพทย์', 'ยานี้ต้องใช้ติดต่อกันเป็นเวลา 1 ปีแล้วหยุดยา', 'ถ้ามีอาการผิดปกติทันที เช่น ตุ่ม ดีซ่าน ปวดข้อ ปวดกล้ามเนื้อ ข้ออักเสบ ให้ไปพบแพทย์'], a: 4, e: 'ผื่น ปวดข้อ ปวดกล้ามเนื้อเป็นอาการไม่พึงประสงค์ทั่วไปที่รักษาตามอาการได้ ไม่จำเป็นต้องพบแพทย์ทันทีทุกราย · ข้ออื่นควรแนะนำ (methimazole ใช้ต่อเนื่อง 12–18 เดือนแล้วประเมินก่อนหยุด)' },
    { q: 'ใช้ยาไป 3 สัปดาห์ เกิด agranulocytosis รุนแรง แพทย์เปลี่ยนเป็น Lugol\'s solution 2 หยด วันละครั้งผสมน้ำผลไม้ 10 วัน ร่วมกับ propranolol ก่อนผ่าตัด ข้อใด "ไม่ถูกต้อง"', o: ['Lugol\'s solution เป็นสารละลายผสมของด่างไอโอดีน', 'ให้ propranolol คุมอาการทางระบบซิมพาเทติก เช่น ใจสั่น มือสั่น เหงื่อออก วิตกกังวล', 'ฤทธิ์ไม่พึงประสงค์ของ Lugol\'s เช่น เจ็บเพดานและฟัน ปฏิกิริยาภูมิไวเกิน', 'กลไกของ Lugol\'s คือทำลายเซลล์ต่อมไทรอยด์โดยตรง', 'Lugol\'s solution มีความแรงน้อยกว่า SSKI'], a: 3, e: 'Lugol\'s (KI 10% + iodine 5%) ยับยั้งการทำงานของต่อมไทรอยด์และลดการไหลเวียนเลือดที่ต่อม ไม่ได้ทำลายเซลล์โดยตรง · Lugol\'s 6.25 mg/drop อ่อนกว่า SSKI 50 mg/drop' },
    { q: 'หลังผ่าตัด 1 ปี มีภาวะไทรอยด์ทำงานน้อย ได้ L-thyroxine sodium 10 microgram 1×1 OD ประวัติโรคหรือยาใดไม่ต้องระวังเมื่อใช้ยานี้', o: ['โรคตับ', 'โรคเบาหวาน', 'โรคหัวใจ', 'ใช้ cholestyramine คุมไขมันในเลือด', 'ใช้ยาต้านการแข็งตัวของเลือด'], a: 0, e: 'โรคตับไม่มีผลต่อระดับ L-thyroxine · ยาอาจเพิ่มน้ำตาลในเลือด · ขนาดเกินทำให้ใจสั่น tachycardia · cholestyramine ลดการดูดซึม · เพิ่มผลของ vitamin K antagonists' },
    { case: 'หญิงไทยคู่ 60 ปี หนัก 60 kg สูง 165 cm เฉื่อยชา ท้องผูก อ้วนง่าย TSH 15 IU, T3 และ T4 ต่ำ, thyroid antibody > 1:500 (ปกติ < 1:100) ไม่แพ้ยา มีโรค iron deficiency anemia และ dyslipidemia ได้ ferrous sulfate 200 mg 1×3 pc และ simvastatin 40 mg hs (ข้อสอบเก่าปี 66)', q: 'ผู้ป่วยรายนี้เข้าได้กับภาวะใด', o: ['Primary hypothyroid', 'Subclinical hypothyroid', 'Pituitary hyperthyroid', 'Grave\'s disease', 'Myxedema coma'], a: 0, e: 'TSH สูง T3, T4 ต่ำ = primary hypothyroid · subclinical = T3, T4 ปกติ · Graves ต้องตรวจ RAIU ยืนยัน · myxedema coma ต้องมีผลตรวจเพิ่ม' },
    { q: 'ถ้าผู้ป่วยรับยารักษาไทรอยด์ ยาใดจะเกิดปฏิกิริยากับยาโรคประจำตัว', o: ['PTU', 'MMI', 'Levothyroxine', 'Lugol\'s solution', 'Propranolol'], a: 2, e: 'ธาตุเหล็กลดการดูดซึม levothyroxine และในโรคไขมันอาจได้ cholestyramine ซึ่งลดการดูดซึมเช่นกัน' },
    { q: 'ติดตามอาการผู้ป่วยหลังได้รับยาควรติดตามค่าใด', o: ['Total T4', 'Total T3', 'Free T4', 'Free T3', 'Anti-TPO antibody'], a: 2, e: 'Free T4 จำเพาะและน่าเชื่อถือกว่า total T4/T3 และ free T3 ที่มีปัจจัยรบกวนสูง · anti-TPO ใช้ประเมิน Hashimoto' },
    { case: 'หญิง 45 ปี ทนอากาศเย็นไม่ได้ น้ำหนักเพิ่ม อ่อนเพลีย TSH สูง FT4 ต่ำ มีไขมันในเลือดสูงและความดันสูง (ข้อสอบเก่าปี 65)', q: 'จากผลทางห้องปฏิบัติการเข้าได้กับโรคใด', o: ['Central hypothyroidism', 'Primary hypothyroidism', 'Primary hyperthyroidism', 'Subclinical hypothyroidism', 'Subclinical hyperthyroidism'], a: 1, e: 'Central = TSH ปกติ FT4 ต่ำ · primary hyper = TSH ต่ำ FT4 สูง · subclinical hypo = TSH สูง FT4 ปกติ · subclinical hyper = TSH ต่ำ FT4 ปกติ' },
    { q: 'ควรใช้ยาอะไรรักษาภาวะดังกล่าว', o: ['Levothyroxine 25 mg', 'Levothyroxine 50 mg', 'Levothyroxine 100 mg', 'PTU', 'MMI'], a: 2, e: 'โจทย์ไม่ระบุน้ำหนักจึงคำนวณไม่ได้โดยตรง แต่ขนาดสัมพันธ์กับน้ำหนักตัวและผู้ป่วยน้ำหนักเพิ่ม (ตามเฉลยในสรุป) · PTU, MMI เป็น antithyroid drug · หมายเหตุ: หน่วยของ levothyroxine คือ mcg' },
    { q: 'หลังได้รับยาควรติดตามผลทางห้องปฏิบัติการใด', o: ['TSH', 'iPTH', 'CrCl', 'CBC', 'Electrolyte'], a: 0, e: 'Primary hypothyroidism ติดตามด้วย TSH' },
    { case: 'หญิง 46 ปี เหงื่อออกบ่อย น้ำหนักลด ทนร้อนไม่ได้ วิตกกังวล ใจสั่น มือสั่น ปลายนิ้วมือเท้าบวม ผิวบางส่วนคล้ายเปลือกส้ม ตาโปน TSH ต่ำ Free T4 สูง', q: 'จากผลทางห้องปฏิบัติการเข้าได้กับโรคใด', o: ['Primary hypothyroidism', 'Subclinical hypothyroidism', 'Primary hyperthyroidism', 'Subclinical hyperthyroidism', 'Central hyperthyroidism'], a: 2, e: 'TSH ต่ำ + FT4 สูง: ต่อมสร้างฮอร์โมนเกิน เกิด negative feedback กด TSH · central hyper TSH จะไม่ถูกกด' },
    { q: 'ถ้าดูเพียงอาการแสดง ไม่ตรวจเลือดเพิ่ม ผู้ป่วยเข้าได้กับโรคใด', o: ['Drug-induced hyperthyroidism', 'Toxic adenoma', 'Toxic multinodular goiter', 'Hashimoto\'s thyroiditis', 'Graves\' disease'], a: 4, e: 'Hyperthyroidism + ตาโปน + ผิวหนาคล้ายเปลือกส้ม (pretibial myxedema) → Graves\' disease · toxic adenoma/MNG ไม่ทำให้ตาโปน · Hashimoto ทำให้ hypothyroidism' },
    { q: '"อาการวิตกกังวล ใจสั่น มือสั่น" ให้ยาใดเพื่อรักษาเฉพาะอาการ', o: ['Levothyroxine 25 mg', 'Levothyroxine 100 mg', 'MMI', 'PTU', 'Propranolol'], a: 4, e: 'Propranolol ลดอาการจาก sympathetic · MMI/PTU รักษาตัวโรค · levothyroxine ใช้ใน hypothyroidism' },
    { case: 'หญิง 44 ปี TSH สูง Free T4 ต่ำ ดื่มกาแฟผสมนมถั่วเหลืองตอนเช้า มี dyslipidemia ได้ cholestyramine และสัปดาห์ก่อนได้ omeprazole รักษา dyspepsia', q: 'จากผลทางห้องปฏิบัติการเข้าได้กับโรคใด', o: ['Primary hypothyroidism', 'Subclinical hypothyroidism', 'Primary hyperthyroidism', 'Subclinical hyperthyroidism', 'Central hyperthyroidism'], a: 0, e: 'TSH สูง + FT4 ต่ำ · subclinical คือ FT4 ยังปกติ' },
    { q: 'ถ้าได้ levothyroxine ตอนเช้า ปัจจัยใดของผู้ป่วยมีผลต่อการรับประทานยา', o: ['กาแฟ', 'ผลิตภัณฑ์ที่มีถั่วเหลือง', 'Cholestyramine', 'Omeprazole', 'ถูกทุกข้อ'], a: 4, e: 'กาแฟและถั่วเหลืองลดการดูดซึม · cholestyramine จับยาในทางเดินอาหาร · omeprazole ทำให้ gastric pH สูง ยาเม็ดละลายและดูดซึมลดลง · ควรกินตอนท้องว่างกับน้ำเปล่า' },
    { q: 'หญิง 38 ปี ได้ methimazole 20 mg/day 3 สัปดาห์ มีไข้สูง เจ็บคอมาก แผลในช่องปาก แนวทางที่เหมาะสมที่สุด', o: ['กินยาต่อและสังเกตอาการ', 'ลดขนาด methimazole ลงครึ่งหนึ่ง', 'เปลี่ยนเป็น PTU ทันที', 'หยุดยาและส่งตรวจ CBC', 'จ่ายยาปฏิชีวนะและนัดติดตาม'], a: 3, e: 'ต้องสงสัย agranulocytosis หยุดยาและตรวจ CBC (ANC) ทันที · PTU ก็ทำให้ agranulocytosis ได้ · ยาปฏิชีวนะอย่างเดียวไม่แก้สาเหตุ' },
    { q: 'ใจสั่นเล็กน้อย TSH ต่ำ แต่ FT4 และ FT3 อยู่ในช่วงปกติ ภาวะใดเหมาะสมที่สุด', o: ['Primary overt hyperthyroidism', 'Subclinical hyperthyroidism', 'T3-thyrotoxicosis', 'Central hyperthyroidism', 'Euthyroid'], a: 1, e: 'TSH ถูกกดต่ำ แต่ FT4, FT3 ยังไม่สูง · overt ต้อง FT4/FT3 สูง · T3-thyrotoxicosis ต้อง FT3 สูง · euthyroid TSH ต้องปกติ' },
    { q: 'หญิง 32 ปี primary hypothyroidism หนัก 60 kg ไม่มีโรคประจำตัว ขนาด levothyroxine เริ่มต้นที่เหมาะสมที่สุด', o: ['25 mcg/day', '50 mcg/day', '75 mcg/day', '100 mcg/day', '150 mcg/day'], a: 3, e: 'ผู้ใหญ่สุขภาพดีไม่มีโรคหัวใจ 1.6 mcg/kg/day × 60 = 96 → 100 mcg/day · 25 mcg เหมาะกับผู้สูงอายุหรือโรคหัวใจ' },
    { q: 'หญิง 58 ปี levothyroxine 100 mcg/day คุม TSH ได้ดี 1 ปี แล้วเริ่ม calcium carbonate รักษากระดูกพรุน 3 เดือนต่อมา TSH 8.5 mIU/L สาเหตุที่เป็นไปได้มากที่สุด', o: ['Calcium เพิ่มการกำจัด levothyroxine ทางไต', 'Calcium ลดการจับโปรตีนในเลือด', 'Calcium ลดการดูดซึม levothyroxine ในทางเดินอาหาร', 'Calcium เพิ่มการเปลี่ยน T4 เป็น T3', 'Calcium เพิ่มการสร้าง TSH โดยตรง'], a: 2, e: 'Calcium carbonate จับ levothyroxine ในทางเดินอาหาร ควรกินห่างกัน ≥ 4 ชม. (เช่นเดียวกับ iron, antacid, sucralfate, cholestyramine)' },
    { q: 'หญิง 78 ปี hypothyroidism หยุด levothyroxine เองหลายเดือน มาด้วยซึมมาก หายใจช้า ชีพจร 42 ความดันต่ำ อุณหภูมิ 34 °C การรักษาที่เหมาะสมที่สุด', o: ['Methimazole', 'PTU', 'Oral levothyroxine', 'IV levothyroxine ร่วมกับ hydrocortisone', 'Radioactive iodine'], a: 3, e: 'Myxedema coma: admit ICU ให้ IV levothyroxine ร่วม hydrocortisone (อาจมี adrenal insufficiency) · oral ดูดซึมไม่แน่นอนในผู้ป่วยวิกฤต' },
  ],
}
