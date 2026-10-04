// Anemia — converted from the RxTU10 class summary PDF (see content/summaries/manifest.json)
export default {
  id: 'anemia',
  date: '26/07/2026',
  refs: [
    'Thai Society of Hematology. Anemia [Internet]. Bangkok: TSH; 2024 [cited 2026 Jul 29]. Available from: https://www.tsh.or.th/file_upload/files/Anemia.pdf',
    'Kassebaum NJ, et al. Iron Deficiency Anemia: Background, Pathophysiology, Etiology [Internet]. Medscape; 2025 [cited 2026 Jul 29]. Available from: https://emedicine.medscape.com/article/202333-overview',
    'National Health Service (NHS). Vitamin B12 or folate deficiency anaemia: Treatment [Internet]. London: NHS; 2025 [cited 2026 Jul 29].',
    'British Medical Journal (BMJ). Vitamin B12 deficiency: NICE guideline summary [Internet]. BMJ; 2024 [cited 2026 Jul 29]. Available from: https://www.bmj.com/content/385/bmj.q1019',
    'กรกช กังวาลทัศน์. เอกสารประกอบการสอนวิชา ภศ. 413 หัวข้อ Nutrition Deficiency Anemia. คณะเภสัชศาสตร์ มหาวิทยาลัยธรรมศาสตร์. 2568.',
  ],
  sections: [
    { id: 'def', t: 'นิยามและการแบ่งชนิด', html: `<p><b>ภาวะโลหิตจาง</b> คือ ปริมาณเม็ดเลือดแดง (red cell mass) ลดลง หรือระดับฮีโมโกลบิน (Hb) ลดลง</p>
<div class="key"><strong class="k">Diagnosis</strong>Hb ผู้หญิง &lt; 12 g/dL · ผู้ชาย &lt; 13 g/dL</div>
<ul>
  <li><b>Acute:</b> tachycardia, lightheadedness, dyspnea</li>
  <li><b>Chronic:</b> weakness, fatigue, headache, vertigo, pallor</li>
</ul>
<h3>แบ่งตามสาเหตุ</h3>
<ol>
  <li><b>สร้างเม็ดเลือดแดงน้อย (impaired red cell formation)</b>
    <ul>
      <li>สารอาหารสำหรับสร้างเม็ดเลือดแดงไม่พอ: iron, vitamin B12, folate deficiency</li>
      <li>ไขกระดูกฝ่อ หรือเซลล์มะเร็งกระจายในไขกระดูก (bone marrow failure/infiltration)</li>
      <li>Systemic diseases เช่น ขาด erythropoietin ในโรคไตเรื้อรัง, anemia of chronic disease</li>
    </ul></li>
  <li><b>เสียเลือด (blood loss):</b> acute blood loss · chronic blood loss</li>
  <li><b>เม็ดเลือดแดงแตก (hemolytic anemia)</b>
    <ul>
      <li>สาเหตุในเม็ดเลือด (corpuscular): G6PD deficiency, ธาลัสซีเมีย</li>
      <li>สาเหตุนอกเม็ดเลือด (extracorpuscular): isoimmune hemolytic anemia, autoimmune hemolytic anemia (AIHA), SLE</li>
    </ul></li>
</ol>
<h3>แบ่งตามลักษณะเม็ดเลือด</h3>
<div class="tbl"><table>
  <tr><th>ชนิด</th><th>MCV</th><th>สาเหตุ</th></tr>
  <tr><td><b>Macrocytic</b></td><td>&gt; 101 fL</td><td>Megaloblastic normochromic → vitamin B12, folic deficiency<br>Non-megaloblastic → liver disease, hypothyroidism, alcoholism, hemolytic</td></tr>
  <tr><td><b>Normocytic normochromic</b></td><td>80–100 fL</td><td>Blood loss, chronic disease</td></tr>
  <tr><td><b>Microcytic hypochromic</b></td><td>&lt; 80 fL (เซลล์สีซีด)</td><td>Iron deficiency</td></tr>
</table></div>` },
    { id: 'lab', t: 'การตรวจทางห้องปฏิบัติการ', html: `<div class="tbl"><table>
  <tr><th>Lab</th><th>ค่าปกติ</th><th>หน่วย</th><th>Iron def.</th><th>Vit B12 def.</th><th>Folate def.</th></tr>
  <tr><td>Hb</td><td>13–18</td><td>g/dL</td><td>↓</td><td>↓</td><td>↓</td></tr>
  <tr><td>Hct</td><td>36–50</td><td>%</td><td>↓</td><td>↓</td><td>↓</td></tr>
  <tr><td>RBC count</td><td>4.0–6.0</td><td>×10⁶/µL</td><td>↓</td><td>↓</td><td>↓</td></tr>
  <tr><td>MCV</td><td>80–100</td><td>fL</td><td>↓</td><td>↑</td><td>↑</td></tr>
  <tr><td>MCH</td><td>27–33</td><td>pg</td><td>↓</td><td>↑</td><td>↑</td></tr>
  <tr><td>MCHC</td><td>32–36</td><td>g/dL</td><td>↓</td><td>–</td><td>–</td></tr>
  <tr><td>Reticulocyte count</td><td>0.5–2.0</td><td>%</td><td>↓</td><td>↓</td><td>↓</td></tr>
  <tr><td>RDW</td><td>11.5–14.5</td><td>%</td><td>↑</td><td>↑</td><td>↑</td></tr>
  <tr><td>Blood smear</td><td>–</td><td>–</td><td>Microcytic, hypochromic RBCs</td><td>Macrocytic, hypersegmented PMN</td><td>Macrocytic, hypersegmented PMN</td></tr>
  <tr><td>Serum iron</td><td>55–160</td><td>µg/dL</td><td>↓</td><td>–</td><td>–</td></tr>
  <tr><td>TIBC</td><td>250–450</td><td>mcg/dL</td><td>↑</td><td>–</td><td>–</td></tr>
  <tr><td>Serum ferritin</td><td>12–300</td><td>ng/mL</td><td>↓</td><td>–</td><td>–</td></tr>
  <tr><td>Folic acid</td><td>3–20</td><td>ng/mL</td><td>–</td><td>–</td><td>↓</td></tr>
  <tr><td>Vitamin B12</td><td>200–900</td><td>pg/mL</td><td>–</td><td>↓</td><td>–</td></tr>
  <tr><td>Homocysteine</td><td>5–15</td><td>µmol/L</td><td>–</td><td>↑</td><td>↑</td></tr>
  <tr><td>Methylmalonic acid</td><td>0–0.4</td><td>µmol/L</td><td>–</td><td>↑</td><td>–</td></tr>
</table></div>
<figure><img data-fig="anemia/p03-1.webp" alt="แผนภูมิวินิจฉัยโลหิตจางตาม MCV: <80 fL iron deficiency, thalassemia, lead poisoning, chronic anemia; >100 fL folate/B12 deficiency, liver disease; 80–100 fL ดู reticulocyte production index >2% ทำ Coombs' test, <2% ดู WBC และเกล็ดเลือดแล้วเจาะไขกระดูก"><figcaption>แนวทางการวินิจฉัยภาวะโลหิตจาง</figcaption></figure>` },
    { id: 'ida', t: 'Iron deficiency anemia', html: `<p><b>กลุ่มเสี่ยง:</b> เด็ก &lt; 2 ปี, วัยรุ่น, หญิงตั้งครรภ์, ผู้สูงอายุ &gt; 65 ปี</p>
<div class="key"><strong class="k">Diagnosis</strong>Serum ferritin &lt; 45 ng/mL</div>
<figure><img data-fig="anemia/p04-1.webp" alt="ระยะของการขาดธาตุเหล็ก จาก normal, iron depletion ถึง late iron deficiency anemia พร้อมค่า serum ferritin, transferrin saturation, Hb, MCV, MCHC แต่ละระยะ"><figcaption>Iron deficiency anemia workup</figcaption></figure>
<h3>การรักษา</h3>
<p><b>1. Oral iron:</b> elemental iron 200 mg/day แบ่ง 2–3 ครั้ง <b>หลังอาหาร</b> เพื่อลด GI S/E</p>
<div class="tbl"><table>
  <tr><th>Iron salt</th><th>% elemental iron</th><th>รูปแบบที่พบบ่อย</th></tr>
  <tr><td>Ferrous sulfate</td><td>20</td><td>60–65 mg/324–325 mg tablet<br>44 mg/5 mL elixir<br>15 mg/mL solution</td></tr>
  <tr><td>Ferrous gluconate</td><td>12</td><td>38 mg/325 mg tablet<br>28–29 mg/240–246 mg tablet</td></tr>
  <tr><td>Ferrous fumarate</td><td>33</td><td>66 mg/200 mg tablet<br>106 mg/324–325 mg tablet</td></tr>
  <tr><td>Ferrous maltol</td><td>100</td><td>30 mg/30 mg</td></tr>
</table></div>
<ul>
  <li><b>ลดการดูดซึมเหล็ก:</b> antacid ที่มี Al, Mg, Ca · tetracycline, doxycycline · H2 antagonist · PPI · cholestyramine</li>
  <li><b>เหล็กลดการดูดซึมยาอื่น:</b> levodopa, methyldopa, levothyroxine, penicillamine, fluoroquinolone, tetracycline, doxycycline</li>
  <li><b>S/E:</b> GI upset, อุจจาระสีดำ, ท้องผูก, ท้องเสีย, N/V</li>
  <li><b>Toxicity (dose dependent):</b> GI upset, encephalopathy, seizures, tachycardia, metabolic acidosis, arrhythmia, hypoxia</li>
</ul>
<p><b>2. Parenteral iron:</b> สำหรับผู้ที่ไม่ตอบสนองต่อยากิน หรือมีปัญหาการดูดซึม · ในไทยมี iron dextran และ iron sucrose · ทุกชนิดเสี่ยง anaphylaxis แต่ high MW iron dextran เสี่ยงมากที่สุด</p>
<div class="tbl"><table>
  <tr><th>ยา</th><th>รายละเอียด</th></tr>
  <tr><td><b>Iron dextran</b><br>Fe³⁺ hydroxide + carbohydrate dextran complex</td><td>ต่างยี่ห้อ MW ต่างกัน → ใช้แทนกันไม่ได้<br>Test dose 0.5 mL สังเกตอย่างน้อย 1 ชั่วโมง<br>Dose 100–200 mg 2–3 ครั้ง/สัปดาห์ → slow IV 20 mg/kg ใน 4–6 ชม.<br>ADR: arthralgia, myalgia, malaise, flushing, fever (ผู้ที่มีโรคภูมิคุ้มกัน เช่น RA, SLE เกิดได้มากขึ้น)</td></tr>
  <tr><td><b>Iron sucrose</b><br>Fe³⁺ hydroxide + sucrose complex</td><td>ADR: leg cramps, hypotension</td></tr>
</table></div>
<p><b>3. Blood transfusion:</b> กรณีซีดรุนแรง ให้ packed red cell 2–3 mL/kg ร่วมกับการรักษาอื่น เช่น ยาขับปัสสาวะ และธาตุเหล็ก</p>
<h3>อาหาร</h3>
<ul>
  <li><b>Heme iron:</b> เนื้อ ไก่ ปลา ตับ → ดูดซึมง่ายกว่า nonheme iron</li>
  <li><b>Nonheme iron:</b> ผัก ผลไม้ ถั่ว เต้าหู้ ไข่ ขนมปัง ซีเรียล พาสต้า</li>
  <li><b>Vitamin C</b> ช่วยการดูดซึมธาตุเหล็ก</li>
  <li><b>ลดการดูดซึม:</b> นม กาแฟ ชา น้ำอัดลม อาหารกากใยสูง อาหารเสริมแคลเซียม ยาลดกรด</li>
</ul>
<h3>การติดตาม</h3>
<ul>
  <li>1 เดือน → CBC, blood smear</li>
  <li>Reticulocytosis ในไม่กี่วัน · Hb เพิ่มใน 2 สัปดาห์ → ปกติใน 2 เดือน</li>
  <li>หยุดยา: 6–12 เดือนหลังธาตุเหล็กกลับมาปกติ</li>
  <li>Long-term supplement: elemental iron 30–60 mg/day</li>
</ul>
<p><b>Treatment failure:</b> poor adherence, ดูดซึมไม่ได้, วินิจฉัยผิด, ยังเสียเลือดต่อเนื่อง, สร้าง RBC บกพร่อง</p>` },
    { id: 'b12', t: 'Vitamin B12 deficiency', html: `<p>Macrocytic megaloblastic anemia</p>
<h3>สาเหตุ</h3>
<ul>
  <li><b>Pernicious anemia</b> (พบบ่อยที่สุด): autoimmune ต่อ intrinsic factor หรือ parietal cell ซึ่งจำเป็นต่อการดูดซึม</li>
  <li>กินมังสวิรัติต่อเนื่อง หรือหญิงตั้งครรภ์/ให้นมที่กินผลิตภัณฑ์จากสัตว์น้อย</li>
  <li><b>Food cobalamin malabsorption</b> (กินปกติแต่ยังขาด)
    <ul>
      <li>ผ่าตัดกระเพาะอาหาร และ gastritis</li>
      <li>H. pylori infection</li>
      <li>ยาที่ใช้ต่อเนื่อง: PPI/H2 blockers/antacids, <mark>metformin</mark> (biguanides), nitrous oxide</li>
      <li>โรคที่กระทบการย่อยและดูดซึม: pancreatic insufficiency, ผ่าตัดลำไส้เล็ก, IBD, radiation enteritis, celiac disease, tapeworm</li>
      <li>โรคพันธุกรรม: juvenile cobalamin deficiency, Imerslund-Gräsbeck syndrome</li>
    </ul></li>
</ul>
<p><b>False low B12:</b> antibiotic, anticonvulsants, cytotoxic agents, oral contraceptives, vitamin C ขนาดสูง</p>
<h3>อาการ</h3>
<p>ใช้เวลาหลายปีกว่าจะแสดงอาการ เพราะร่างกายสะสม B12 ไว้ในตับ</p>
<ul>
  <li><b>Physical:</b> อ่อนเพลีย เวียนหัว คลื่นไส้ ท้องเสีย ผิวซีดหรือผิวเหลือง เบื่ออาหาร</li>
  <li><b>Neurologic:</b> symmetric paresthesia, เดินผิดปกติ (gait problem), การมองเห็นผิดปกติ, deficit ใน proprioception และ vibration, cognitive impairment</li>
  <li><b>เด็ก:</b> พัฒนาการช้า เบื่ออาหาร hypotonia irritability tremors ชัก</li>
</ul>
<h3>Lab</h3>
<ul>
  <li>MCV &gt; 100 fL</li>
  <li><b>MMA และ homocysteine เพิ่มขึ้น</b></li>
  <li>Serum B12 &lt; 150 pg/mL (&lt; 111 pmol/L)</li>
  <li>LDH, indirect bilirubin อาจสูงขึ้น</li>
</ul>
<h3>การรักษา</h3>
<ul>
  <li><b>Oral:</b> vitamin B12 tablet 1–2 mg daily</li>
  <li><b>Parenteral:</b> 1000 mcg/day IM, SC, IV ทุกวัน 7–14 วัน → สัปดาห์ละครั้ง 4 สัปดาห์ → ทุก 1–3 เดือน</li>
  <li><b>อาหาร:</b> เนื้อสัตว์ นม ไข่ หอย ตับ</li>
</ul>
<h3>การติดตาม</h3>
<ul>
  <li>ตรวจระดับวิตามินและ CBC ใน 2–4 สัปดาห์</li>
  <li>รู้สึกมีแรงและดีขึ้นใน 2–3 วัน · normoblastic bone marrow ใน 2–3 วัน</li>
  <li>Reticulocyte เพิ่มใน 3–4 วัน · Hb, Hct เพิ่มใน 2 สัปดาห์ → ปกติใน 2 เดือน</li>
  <li>อาการทางประสาทเริ่มดีขึ้นตั้งแต่ 3 เดือนและดีขึ้นเรื่อย ๆ ใน 1 ปี แต่ถ้าเป็นมานานอาจไม่ดีขึ้น</li>
</ul>` },
    { id: 'folate', t: 'Folic acid deficiency', html: `<p>Macrocytic megaloblastic anemia</p>
<p><b>ความต้องการ folate:</b> ผู้หญิง 400 mcg · ตั้งครรภ์ 600 mcg · ให้นม 500 mcg</p>
<h3>สาเหตุ</h3>
<ul>
  <li>ร่างกายต้องการมากขึ้น (เซลล์แบ่งตัวเร็ว): ตั้งครรภ์ ให้นม chronic hemolytic anemia exfoliative skin diseases</li>
  <li>ได้รับไม่พอ: ขาดสารอาหารรุนแรง <mark>ติดแอลกอฮอล์เรื้อรัง</mark> severe anorexia</li>
  <li>Intestinal malabsorption: inflammatory disorders, celiac disease, tropical sprue</li>
  <li>ยา: methotrexate, trimethoprim, pyrimethamine, phenytoin, valproate, carbamazepine</li>
</ul>
<h3>Lab</h3>
<ul>
  <li>MCV &gt; 100 fL</li>
  <li>Serum folate &lt; 3 ng/mL (&lt; 7 nmol/L)</li>
  <li><b>Homocysteine เพิ่ม แต่ MMA เท่าเดิม</b> (ต่างจาก B12 ที่ MMA เพิ่มด้วย)</li>
</ul>
<h3>การรักษา</h3>
<ul>
  <li>Folic acid tablet 1 mg/day</li>
  <li><b>อาหาร:</b> ผักใบเขียว ตับ ขนมปัง whole wheat ซีเรียล ถั่ว ธัญพืช ส้ม เกรปฟรุต · ความร้อนทำให้ folate สลายได้ 50–90% ควรกินดิบ/ลวก/ผัด · แอลกอฮอล์ขัดขวางการดูดซึม</li>
</ul>
<h3>การติดตาม</h3>
<ul>
  <li>ช่วงแรกอยากอาหารและตื่นตัวขึ้น</li>
  <li>Reticulocytosis ใน 1 สัปดาห์</li>
  <li>Hb, Hct เพิ่มใน 2 สัปดาห์ → ปกติใน 2 เดือน</li>
</ul>` },
  ],
  questions: [
    { case: 'หญิงอายุ 75 ปี อ่อนเพลีย Hb 8 g/dL, Hct 25%, MCV 70 fL, serum ferritin 20 ng/mL, vitamin B12 600 pg/mL, peripheral smear พบ microcytic hypochromic anemia', q: 'ผลทางห้องปฏิบัติการสอดคล้องกับภาวะโลหิตจางชนิดใดมากที่สุด', o: ['Iron deficiency anemia', 'Thalassemia trait', 'Anemia of chronic disease', 'Vitamin B12 deficiency anemia', 'Hemolytic anemia'], a: 0, e: 'Serum ferritin < 45 ng/mL ร่วมกับ microcytic hypochromic · หมายเหตุ: ต้นฉบับเขียน "serum transferritin" ซึ่งหมายถึง serum ferritin' },
    { q: 'ข้อใดน่าจะเป็นสาเหตุของภาวะดังกล่าว', o: ['Systemic lupus erythematosus (SLE)', 'Chronic kidney disease', 'มีภาวะพร่องเอนไซม์ G6PD', 'ขาด vitamin B12', 'มีภาวะเลือดออกในกระเพาะอาหาร'], a: 4, e: 'การเสียเลือดเป็นสาเหตุหนึ่งของการขาดธาตุเหล็ก' },
    { q: 'หากโรงพยาบาลไม่มียา ferrous fumarate จึงต้องเปลี่ยนไปใช้ยาชนิดอื่น ข้อใดเป็น regimen ที่ได้ปริมาณธาตุเหล็กใกล้เคียงกับ ferrous fumarate 325 mg 1×2 pc', o: ['Ferrous sulfate 325 mg 1×2 pc', 'Ferrous sulfate 325 mg 1×3 pc', 'Ferrous sulfate 200 mg 1×2 pc', 'Ferrous sulfate 200 mg 1×3 pc', 'Ferrous gluconate 325 mg 1×2 pc'], a: 1, e: 'Ferrous fumarate 325 mg × 33% = 107.25 mg × 2 = 214.5 mg/day · ferrous sulfate 325 mg × 20% = 65 mg → 1×2 = 130, 1×3 = 195 mg/day · ferrous sulfate 200 mg = 40 mg → 80 หรือ 120 mg/day · ferrous gluconate 325 mg × 12% = 39 mg → 78 mg/day' },
    { q: 'หญิงอายุ 30 ปี ได้รับ ferrous sulfate ร่วมกับยาต่อไปนี้ ข้อใดจะลดการดูดซึมธาตุเหล็กมากที่สุด', o: ['Vitamin C', 'Omeprazole', 'Folic acid', 'Erythropoietin', 'Ferrous gluconate'], a: 1, e: 'PPI ลดกรดในกระเพาะ ทำให้การเปลี่ยน Fe³⁺ → Fe²⁺ ลดลง จึงลดการดูดซึมเหล็ก' },
    { q: 'ข้อใดกล่าวผิดเกี่ยวกับภาวะโลหิตจางจากการขาด vitamin B12 และการขาด folic acid', o: ['โลหิตจางจากการขาด vitamin B12 จะมีระดับ methylmalonic acid (MMA) เท่าเดิม', 'โลหิตจางจากการขาด vitamin B12 จะมีระดับ homocysteine เพิ่มขึ้น', 'การขาด vitamin B12 จะแสดงอาการได้ช้ากว่าเมื่อเทียบกับการขาดกรดโฟลิก', 'เป็นภาวะที่มีค่า MCV เพิ่มขึ้นมากกว่า 100 fL', 'การขาด folic acid มักสัมพันธ์กับการดื่มสุราเรื้อรัง'], a: 0, e: 'ขาด vitamin B12 ระดับ MMA จะเพิ่มขึ้น แต่ขาด folic acid ระดับ MMA เท่าเดิม' },
  ],
}
