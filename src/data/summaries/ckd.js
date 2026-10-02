// Chronic kidney disease (CKD) — converted from the RxTU10 class summary PDF (see content/summaries/manifest.json)
export default {
  id: 'ckd',
  date: "22/07/69",
  refs: ["KDIGO 2024 Clinical Practice Guideline for the Evaluation and Management of CKD — kdigo.org"],
  sections: [
    { id: 'def', t: "นิยาม & วินิจฉัย", html: `<p>ความผิดปกติของโครงสร้างหรือการทำงานของไต <mark>นานกว่า 3 เดือนขึ้นไป</mark> ที่ส่งผลต่อสุขภาพ</p>
<ol>
  <li><b>Function:</b> GFR &lt; 60 mL/min/1.73 m² ติดต่อกัน 3 เดือน</li>
  <li><b>Structure</b> อย่างน้อย 1 ข้อ ติดต่อกัน 3 เดือน: albuminuria (AER ≥ 30 mg/day หรือ ACR ≥ 30 mg/g) · เม็ดเลือดในปัสสาวะ · electrolyte/tubular ผิดปกติ · histology ผิดปกติ · imaging ผิดปกติ · เคยปลูกถ่ายไต</li>
</ol>
<h3>ระยะตาม KDIGO 2024</h3>
<div class="tbl" style="border:0"><div class="kd">
  <div class="h">GFR \\ ACR</div><div class="h">A1<br>&lt; 30 mg/g</div><div class="h">A2<br>30–300</div><div class="h">A3<br>&gt; 300</div>
  <div class="r"><b>G1</b> ≥ 90</div><div class="c1"></div><div class="c2"></div><div class="c3"></div>
  <div class="r"><b>G2</b> 60–89</div><div class="c1"></div><div class="c2"></div><div class="c3"></div>
  <div class="r"><b>G3a</b> 45–59</div><div class="c2"></div><div class="c3"></div><div class="c4"></div>
  <div class="r"><b>G3b</b> 30–44</div><div class="c3"></div><div class="c4"></div><div class="c4"></div>
  <div class="r"><b>G4</b> 15–29</div><div class="c4"></div><div class="c4"></div><div class="c4"></div>
  <div class="r"><b>G5</b> &lt; 15</div><div class="c4"></div><div class="c4"></div><div class="c4"></div>
</div></div>
<p style="font-size:.85em;color:var(--muted)">เขียว = เสี่ยงต่ำ · เหลือง = ปานกลาง · ส้ม = สูง · แดง = สูงมาก · ACR หน่วย mg/mmol: A1 &lt; 3, A2 3–30, A3 &gt; 30 · ESRD = GFR &lt; 15</p>
<a class="calc-link" href="#" data-calc="egfr">🧮 คำนวณ eGFR แล้วดูว่าอยู่ G ไหน</a>` },
    { id: 'risk', t: "ปัจจัยเสี่ยง & อาการ", html: `<ul>
  <li><b>แก้ไม่ได้:</b> อายุ, ประวัติครอบครัว, ไตเล็ก, น้ำหนักแรกเกิดน้อย/คลอดก่อนกำหนด, ชาติพันธุ์</li>
  <li><b>แก้ได้:</b> DM, HTN, autoimmune (SLE, RA), systemic infection, UTI, นิ่ว, ทางเดินปัสสาวะอุดกั้น, drug toxicity</li>
</ul>
<p><b>กลไก:</b> DM → glycation ของหลอดเลือด → ไตเพิ่ม pressure/flow ชดเชย → glomerular hypertrophy → proteinuria → glomerulosclerosis · HTN → arteriosclerosis → การกรองลดลง</p>
<div class="fig">🖼️ แผนภาพ pathophysiology ของ CKD (ต้นฉบับ PDF หน้า 2) — ในเว็บจริงจะตัดรูปจาก PDF มาใส่ตรงนี้</div>
<p><b>อาการ:</b> ระยะแรกมักไม่มีอาการ ชัดใน stage 4–5 — อ่อนเพลีย หายใจเร็ว สับสน N/V เลือดออก เบื่ออาหาร คัน ผิวแห้ง peripheral neuropathy · บวม ปัสสาวะมาก/น้อย ปัสสาวะเป็นฟอง</p>
<div class="tbl"><table>
  <tr><th>Lab ที่ลดลง</th><th>Lab ที่เพิ่มขึ้น</th></tr>
  <tr><td>eGFR · bicarbonate (metabolic acidosis) · Hb/Hct · TSat/ferritin · albumin · glucose · vitamin D · calcium (ระยะแรก)</td>
      <td>Scr, BUN · <b>K</b> · <b>phosphorus, PTH, FGF-23</b> · calcium (CKD 5) · ACR · BP · glucose · LDL/TG</td></tr>
</table></div>` },
    { id: 'plan', t: "Action plan & เป้าหมาย", html: `<p><b>เป้าหมาย:</b> ชะลอการเสื่อมของไต · คุมโรคร่วม (DM, HTN) · ลดเสี่ยงโรคหัวใจ (สาเหตุตายหลัก) · ป้องกัน/รักษาภาวะแทรกซ้อน</p>
<div class="tbl"><table>
  <tr><th>Stage</th><th class="num">GFR</th><th>Action</th></tr>
  <tr><td>1</td><td class="num">≥ 90</td><td>คัดกรอง วินิจฉัยและรักษาโรคร่วม ชะลอการเสื่อม</td></tr>
  <tr><td>2</td><td class="num">60–89</td><td>ติดตามการทำงานของไตและโรคร่วม</td></tr>
  <tr><td><b>3</b></td><td class="num">30–59</td><td><mark>ประเมินและป้องกัน/รักษาภาวะแทรกซ้อน</mark></td></tr>
  <tr><td>4</td><td class="num">15–29</td><td>วางแผนบำบัดทดแทนไต</td></tr>
  <tr><td>5</td><td class="num">&lt; 15 / dialysis</td><td>บำบัดทดแทนไตหรือปลูกถ่าย</td></tr>
</table></div>` },
    { id: 'prot', t: "ลด proteinuria", html: `<h3>RAAS blocker (ACEI / ARB)</h3>
<ul>
  <li><mark>First line เมื่อ ACR &gt; 30 mg/g</mark> ไม่ว่าเป็น DM หรือไม่ · เริ่มต่ำ titrate ถึง max</li>
  <li>Ang II ลด → <b>efferent arteriole ขยาย</b> → intraglomerular pressure ลด → hyperfiltration ลด → Scr อาจขึ้นช่วงแรก</li>
  <li>เป้าหมาย: คุม BP, ลด albuminuria ~30–50% · ติดตาม Scr, K</li>
</ul>
<div class="tbl"><table>
  <tr><th>Scr เพิ่มขึ้น</th><th>K⁺</th></tr>
  <tr><td>&lt; 30%: ไม่ต้องปรับ (ถ้าเพิ่มไม่ถึง 30% และไม่ตอบสนอง ให้สงสัย renal artery stenosis)<br><b>31–50%: ลดขนาดครึ่งหนึ่ง</b> ติดตามทุก 1–2 สัปดาห์<br><b>&gt; 50%: หยุดยา</b><br>มี N/V, diarrhea, volume depletion → หยุดยา (เสี่ยง AKI)</td>
      <td>&gt; 5 mEq/L: จำกัดอาหาร K สูง<br>&gt; 6 mEq/L: ยาลด K (HCTZ, furosemide, NaHCO₃ ถ้า acidosis, potassium binder) · ทางเลือกสุดท้ายคือหยุดยา</td></tr>
</table></div>
<h3>SGLT2 inhibitor</h3>
<ul>
  <li>ลดการดูดกลับ Na → macula densa รับรู้ → <b>afferent arteriole หด</b> → intraglomerular pressure ลด</li>
  <li>ได้ประโยชน์ทั้งคนเป็นและไม่เป็น DM</li>
  <li><mark>ใช้ร่วม RAAS blocker:</mark> afferent หด + efferent ขยาย → “เลือดเข้าน้อย ออกเยอะ” ไตทำงานสบายขึ้น</li>
</ul>
<h3>MRA (add-on ใน G1–G4)</h3>
<ul>
  <li><b>Spironolactone:</b> ลด albuminuria และ BP · ระวัง hyperkalemia, gynecomastia</li>
  <li><b>Finerenone</b> (non-steroidal): DM + GFR ≥ 25 + ACR &gt; 30 · hyperkalemia น้อยกว่า ไม่ทำ gynecomastia · K &gt; 4.9 ปรับอาหาร, K &gt; 5.5 หยุด 10 mg / ลดขนาด 20 mg กลับมาใช้เมื่อ K ≤ 5</li>
</ul>
<h3>GLP-1 RA</h3>
<p>ลด albuminuria แนะนำใน DM ที่มี CKD — dulaglutide, liraglutide, semaglutide</p>` },
    { id: 'bp', t: "ความดัน & น้ำตาล", html: `<div class="key"><strong class="k">เป้า BP</strong>SBP &lt; 120 mmHg (KDIGO 2024) · ไม่ลดเร็วเกินไป เสี่ยง AKI</div>
<ul>
  <li>ACEI/ARB: ชะลอไต ลด albuminuria ลด mortality ใน MI/HFrEF</li>
  <li><mark>ห้ามใช้ ACEI + ARB ร่วมกัน</mark> (hyperkalemia, AKI, hypotension)</li>
  <li>ARNI ห้ามใช้ร่วม ACEI — เปลี่ยนจาก ACEI ต้อง wash out 36 h (angioedema)</li>
  <li>หลีกเลี่ยงใน bilateral renal artery stenosis และหญิงตั้งครรภ์ · monitor BP, Scr, K ภายใน 2–4 สัปดาห์ · ADR: AKI, angioedema, ไอแห้ง (เปลี่ยนเป็น ARB)</li>
</ul>
<div class="tbl"><table>
  <tr><th>ยา</th><th>เริ่ม</th><th>Max</th><th>ไตบกพร่อง</th></tr>
  <tr><td>Enalapril</td><td class="num">5 mg OD</td><td class="num">40 mg</td><td>CrCl ≤ 30 เริ่ม 2.5 mg</td></tr>
  <tr><td>Losartan</td><td class="num">50 mg OD</td><td class="num">100 mg</td><td>ไม่ต้องปรับ</td></tr>
</table></div>
<p>ยาอื่นที่มี CV benefit: thiazide-like, CCB · มี CAD/HFrEF พิจารณา BB</p>
<h3>น้ำตาล</h3>
<p>HbA1c &lt; 6.5% (intensive) หรือ &lt; 8% (สูงอายุ โรคร่วมเยอะ CKD ระยะท้าย)</p>
<div class="tbl"><table>
  <tr><th>ยา</th><th>ตาม GFR</th></tr>
  <tr><td><b>Metformin</b> (max 2,550 mg/d)</td><td class="num">เริ่มได้เมื่อ GFR &gt; 45<br>GFR &lt; 45: ลดครึ่ง max 1,000 mg/d<br><mark>GFR &lt; 30: หยุด</mark></td></tr>
  <tr><td><b>SGLT2i</b></td><td class="num">เริ่มได้เมื่อ GFR ≥ 20<br>ลด &lt; 20 แล้วใช้ต่อได้ (หยุดเมื่อฟอกไต)</td></tr>
</table></div>
<p>SGLT2i: ไม่ใช้ในคนเสี่ยง genital infection, DKA · <b>sick day:</b> หยุดยาเมื่อไม่สบาย ก่อนผ่าตัด หรืออดอาหารนาน</p>
<a class="calc-link" href="#" data-calc="egfr">🧮 คำนวณ eGFR</a>
<h3>ไม่ใช้ยา</h3>
<p>หยุดบุหรี่ · คุมน้ำหนัก · ออกกำลังกาย 30 นาที 5 วัน/สัปดาห์ · โปรตีน 0.8 g/kg/d (ไม่ฟอกไต), 1–1.2 g/kg/d (ฟอกไต) · Na &lt; 2 g/d (≈ เกลือ 1 ช้อนชา)</p>` },
    { id: 'anemia', t: "Anemia in CKD", by: "ต้นน้ำ · ตรวจโดย แสนดี", html: `<p>WHO: Hb &lt; 13 g/dL (ชาย), &lt; 12 g/dL (หญิง) · สาเหตุ: ขาด EPO, <mark>ขาดเหล็ก</mark>, hyperparathyroid/thyroid, ACEI/ARB, ขาด folate/B12, อักเสบเรื้อรัง</p>
<div class="tbl"><table>
  <tr><th>กลุ่ม</th><th>Ferritin</th><th>TSAT</th></tr>
  <tr><td>ขาดเหล็กรุนแรง (ทุกกลุ่ม)</td><td class="num">&lt; 45 ng/mL</td><td>—</td></tr>
  <tr><td>ND-CKD / PD</td><td class="num">&lt; 100 หรือ 100–300</td><td class="num">&lt; 40% หรือ &lt; 25%</td></tr>
  <tr><td>HD</td><td class="num">≤ 500</td><td class="num">≤ 30%</td></tr>
</table></div>
<p>กลไก: ไตสร้าง EPO ลดลง + อักเสบ → hepcidin สูง → ยับยั้ง ferroportin → ดูดซึมเหล็กลดลงและเหล็กติดค้างใน macrophage</p>
<h3>เหล็ก</h3>
<ul>
  <li>Elemental iron 200 mg/d นาน 3 เดือน · ไม่ดีขึ้นใน 3 เดือนเปลี่ยนเป็น IV</li>
  <li>Oral: ferrous sulfate 325 mg (Fe 65), ferrous gluconate 325 mg (Fe 36), ferrous fumarate 325 mg (Fe 106) · ดูดซึมดีในกรด · แยกจาก antacid/phosphate binder · ท้องผูก อุจจาระดำ</li>
  <li>IV: iron dextran (ต้อง test dose 25 mg, เสี่ยง anaphylactoid) · iron sucrose ปลอดภัยกว่า</li>
  <li>พิษเฉียบพลัน: antidote = <b>deferoxamine</b> (charcoal จับเหล็กไม่ได้) · หยุดเหล็กเมื่อ ferritin &gt; 800 และ TSAT &gt; 50%</li>
</ul>
<h3>ESAs</h3>
<ul>
  <li>Epoetin alfa 50–100 U/kg 1–3 ครั้ง/สัปดาห์ · Darbepoetin 0.45 mcg/kg ทุก 1–4 สัปดาห์ · Methoxy PEG-epoetin beta 0.6 mcg/kg เดือนละครั้ง</li>
  <li>ND-CKD: เริ่มเมื่อ Hb &lt; 10 · ESKD: เริ่มเมื่อ Hb 9–10</li>
  <li><mark>เป้าหมาย Hb 10–11 g/dL · ห้ามเกิน 13 (boxed warning: MI, stroke, DVT)</mark></li>
  <li>SC ใช้ขนาดน้อยกว่า IV ~30% · ปรับครั้งละ 25–50% · <b>ห้ามหยุดทันที</b> (PRCA) · เก็บ 2–8 °C</li>
  <li>ยาใหม่ HIF-PHIs (roxadustat, daprodustat, vadadustat) เมื่อดื้อ ESA</li>
</ul>` },
    { id: 'mbd', t: "CKD-MBD", by: "ต้นน้ำ · ตรวจโดย แสนดี", html: `<ol>
  <li>ขับฟอสเฟตไม่ได้ → FGF-23 สูง (เสี่ยงหัวใจ)</li>
  <li>สร้าง active vitamin D ลดลง → hypocalcemia</li>
  <li>ฟอสเฟตสูง + Ca ต่ำ → secondary hyperparathyroidism</li>
</ol>
<p><b>เป้าหมาย:</b> phosphate และ Ca ปกติ · iPTH (ESRD) 2–9 เท่าของค่าปกติ (~130–600 pg/mL)</p>
<div class="tbl"><table>
  <tr><th>Phosphate binder</th><th class="num">RPBC</th><th>ข้อควรจำ</th></tr>
  <tr><td>Calcium acetate</td><td class="num">1.0</td><td>จับดีกว่า Ca carbonate ที่ขนาดเท่ากัน</td></tr>
  <tr><td>Calcium carbonate</td><td class="num">1.0</td><td>vascular calcification</td></tr>
  <tr><td>Sevelamer</td><td class="num">0.75</td><td>ลด LDL · เม็ดเยอะ · hyperchloremic acidosis · ขวาง ciprofloxacin/mycophenolate</td></tr>
  <tr><td>Lanthanum</td><td class="num">2.0</td><td>จับแรง ต้องเคี้ยว · สะสมในตับ</td></tr>
  <tr><td>Sucroferric oxyhydroxide</td><td class="num">2.5</td><td>แรงสุด เม็ดน้อย · อุจจาระดำ</td></tr>
  <tr><td>Aluminum hydroxide</td><td class="num">—</td><td>ไม่เกิน 4 สัปดาห์ (สมองเสื่อม กระดูก)</td></tr>
</table></div>
<h3>SHPT</h3>
<ul>
  <li>ND-CKD: แก้สาเหตุก่อน ห้ามใช้ calcitriol/vit D analog เป็นประจำ (เฉพาะ PTH สูงรุนแรง)</li>
  <li>G5D: cinacalcet, calcitriol หรือ vit D analog ใช้ร่วมกันได้</li>
  <li><b>PTH สูง + Ca/P สูง → cinacalcet</b> · <b>PTH สูง + Ca/P ต่ำ → active vit D</b></li>
  <li>D2/D3 ต้องผ่านตับและไต · alfacalcidol ผ่านตับ · <mark>calcitriol active 100%</mark></li>
  <li>Cinacalcet 25 mg: เพิ่มความไวของ CaSR · กินพร้อมอาหาร · CYP3A4/2D6/1A2 · <b>ห้ามเริ่มถ้า Ca &lt; 8.4 mg/dL</b></li>
  <li>เลี่ยง inorganic phosphate (อาหารแปรรูป น้ำอัดลม) ดูดซึม 90–100%</li>
</ul>` },
    { id: 'acid', t: "Metabolic acidosis", by: "ต้นน้ำ · ตรวจโดย แสนดี", html: `<p>Bicarbonate (tCO₂) &lt; 22 mEq/L · <b>เป้า 24–26</b> (อย่างน้อย ≥ 22 ตาม KDIGO 2026)</p>
<div class="tbl"><table>
  <tr><th>ยา</th><th>HCO₃⁻</th><th>ข้อควรจำ</th></tr>
  <tr><td>NaHCO₃ 325 / 650 mg</td><td class="num">3.9 / 7.7 mEq</td><td>ผง 1/8 ช้อนชา ≈ 7.1 mEq · ท้องอืด เรอ</td></tr>
  <tr><td>Sodium citrate/citric acid</td><td class="num">1 mEq/mL</td><td>อืดน้อยกว่า · <mark>ต้องแปลงที่ตับ ไม่ได้ผลในโรคตับ</mark></td></tr>
  <tr><td>Potassium citrate 540 mg</td><td class="num">5 mEq</td><td>hyperkalemia — อันตรายในโรคไต</td></tr>
</table></div>
<p>เริ่ม NaHCO₃ 650 mg วันละ 2 ครั้ง (~15 mEq/d) · titrate ได้ถึง 1,950 mg วันละ 3 ครั้ง (~70 mEq/d)</p>` },
  ],
  // questions go to the question bank only (P3), tagged with this summary as their source
  questions: [
    {
      "q": "ผู้ป่วย CKD ระยะ 4 มีตับแข็ง ร่วมกับ metabolic acidosis (tCO₂ 18) ยาลดกรดใด<u>ไม่ควร</u>ใช้",
      "o": [
        "Sodium bicarbonate",
        "Sodium citrate",
        "Potassium citrate",
        "Sodium carbonate",
        "Sodium chloride"
      ],
      "a": 1,
      "e": "Sodium citrate ต้องให้ตับแปลง citrate เป็น bicarbonate จึงไม่ได้ผลในคนไข้โรคตับ"
    },
    {
      "q": "กลไกชดเชยลำดับแรกเมื่อไตเริ่มขับฟอสเฟตไม่ได้ (CKD-MBD)",
      "o": [
        "ดึงแคลเซียมจากกระดูกทันที",
        "ต่อมพาราไทรอยด์หลั่ง PTH เพิ่ม",
        "สร้างฮอร์โมน FGF-23 สูงขึ้น",
        "ไตหยุดสร้าง active vitamin D",
        "ลำไส้ลดการแสดงออกของ NaPi2b"
      ],
      "a": 2,
      "e": "Phosphate retention กระตุ้น FGF-23 ก่อน ซึ่งเพิ่มความเสี่ยงโรคหัวใจ"
    },
    {
      "q": "ผู้ป่วยฟอกเลือด (G5D) SHPT รุนแรง มีตับวาย Ca 8.0 mg/dL ควรใช้วิตามินดีตัวใด",
      "o": [
        "Ergocalciferol (D2)",
        "Cholecalciferol (D3)",
        "Alfacalcidol",
        "Calcitriol",
        "Cinacalcet"
      ],
      "a": 3,
      "e": "Calcitriol เป็น active form 100% ไม่ต้องผ่านตับ/ไต · alfacalcidol ต้องผ่านตับ · cinacalcet ห้ามเมื่อ Ca < 8.4"
    },
    {
      "q": "หยุด ESAs ทันที (sawtooth effect) เสี่ยงภาวะใดมากที่สุด",
      "o": [
        "Necrotizing gastroenteritis",
        "Hemochromatosis",
        "ภูมิคุ้มกันต่อต้านเม็ดเลือดแดง (PRCA)",
        "Hypertensive crisis",
        "DVT"
      ],
      "a": 2,
      "e": "ถ้าต้องลดให้ลดครั้งละ 25–50% แทนการหยุดทันที เพื่อป้องกัน PRCA"
    },
    {
      "q": "CKD ระยะสุดท้ายกินยาจับฟอสเฟต แล้วได้ ciprofloxacin ยาจับฟอสเฟตตัวใด<u>ไม่ควร</u>ใช้ และผลข้างเคียงคืออะไร",
      "o": [
        "Calcium carbonate — vascular calcification",
        "Lanthanum — สะสมในตับ",
        "Sucroferric oxyhydroxide — อุจจาระดำ",
        "Sevelamer — hyperchloremic acidosis",
        "Aluminum hydroxide — สมองเสื่อม"
      ],
      "a": 3,
      "e": "Sevelamer ขัดขวางการดูดซึม ciprofloxacin/mycophenolate และทำให้เกิด hyperchloremic acidosis"
    },
    {
      "q": "ชาย 52 ปี ตรวจครั้งเดียวพบ eGFR 55 และ ACR 45 mg/g ไม่มีอาการ ข้อใดถูกที่สุด",
      "o": [
        "เป็น CKD ทันทีเพราะ eGFR < 60",
        "เป็น CKD ทันทีเพราะมี albuminuria ร่วม",
        "ยังวินิจฉัยไม่ได้ ต้องยืนยันว่าผิดปกตินานกว่า 3 เดือน",
        "ไม่ใช่ CKD เพราะ eGFR ยัง > 45",
        "ไม่ใช่ CKD เพราะไม่มีอาการ"
      ],
      "a": 2,
      "e": "นิยาม CKD ต้องผิดปกตินานกว่า 3 เดือน ผลครั้งเดียวต้องตรวจซ้ำยืนยัน"
    },
    {
      "q": "eGFR 38 และ ACR 420 mg/g (ยืนยัน > 3 เดือน) อยู่ระยะใด",
      "o": [
        "G3a A2",
        "G3a A3",
        "G3b A2",
        "G3b A3",
        "G4 A3"
      ],
      "a": 3,
      "e": "eGFR 30–44 = G3b · ACR > 300 = A3"
    },
    {
      "q": "DM2 ใช้ metformin อยู่ eGFR ลดเหลือ 28 คำแนะนำที่เหมาะสม",
      "o": [
        "ใช้ต่อขนาดเดิม",
        "ลดครึ่งแล้วติดตาม",
        "หยุด metformin เพราะ eGFR < 30",
        "เพิ่มขนาด",
        "เปลี่ยนเป็นชนิดออกฤทธิ์นาน"
      ],
      "a": 2,
      "e": "eGFR ≥ 45 ใช้ได้ · 30–44 ไม่เริ่มใหม่/ลดขนาด · < 30 ห้ามใช้"
    },
    {
      "q": "DM2 BP 148/90 eGFR 52 ACR 380 ยาลดความดันอันดับแรก",
      "o": [
        "Amlodipine",
        "HCTZ",
        "Enalapril (หรือ ARB)",
        "Atenolol",
        "Enalapril + Losartan"
      ],
      "a": 2,
      "e": "มี albuminuria ควรใช้ RAAS inhibitor ลด intraglomerular pressure · ไม่แนะนำ ACEI + ARB ร่วม"
    },
    {
      "q": "เพิ่ม dapagliflozin แล้ว 2 สัปดาห์ eGFR 48 → 43 ไม่มีอาการ ควรทำอย่างไร",
      "o": [
        "หยุด dapagliflozin ทันที",
        "หยุด enalapril",
        "อธิบายว่าเป็น eGFR dip ที่คาดได้ ใช้ยาต่อและติดตาม",
        "ให้สารน้ำ IV",
        "เปลี่ยนเป็น sulfonylurea"
      ],
      "a": 2,
      "e": "Initial eGFR dip เกิดจาก afferent arteriole หด เป็นการเปลี่ยนแปลงเชิง hemodynamic กลับคืนได้ ไม่ควรหยุดยา"
    }
  ],
}
