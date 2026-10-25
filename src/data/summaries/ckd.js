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
<figure><img data-fig="ckd/p02-1.webp" alt="แผนภาพกลไกการดำเนินโรค CKD จาก DM, HTN และ hyperlipidemia สู่ glomerulosclerosis"><figcaption>Pathophysiology of CKD</figcaption></figure>
<p><b>อาการ:</b> ระยะแรกมักไม่มีอาการ ชัดใน stage 4–5 — อ่อนเพลีย หายใจเร็ว สับสน N/V เลือดออก เบื่ออาหาร คัน ผิวแห้ง peripheral neuropathy, ตัวเย็น · <b>sign:</b> บวม ปัสสาวะมาก/น้อย ปัสสาวะเป็นฟอง ท้องอืด</p>
<div class="tbl"><table>
  <tr><th>Lab ที่ลดลง</th><th>Lab ที่เพิ่มขึ้น</th></tr>
  <tr><td>eGFR · bicarbonate (metabolic acidosis) · Hb/Hct (anemia) · TSat/ferritin (ขาดเหล็ก; ferritin อาจสูงได้จากการอักเสบ) · albumin (ขาดสารอาหาร) · glucose (insulin ถูกทำลายน้อยลง/กินได้น้อย) · 25(OH)D · calcium (ระยะแรก)</td>
      <td>Scr, BUN · <b>K</b> · <b>phosphorus, PTH, FGF-23</b> · calcium (CKD 5) · ACR / protein-creatinine ratio · BP · glucose (DM คุมไม่ได้) · LDL/TG · อาจตรวจเลือดในอุจจาระบวก (GI bleed จาก uremia)</td></tr>
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
  <tr><td>&lt; 30%: ไม่ต้องปรับ titrate ต่อจนถึง max ได้<br><b>31–50%: ลดขนาดครึ่งหนึ่ง</b> ติดตามทุก 1–2 สัปดาห์ จน Scr กลับมาไม่เกิน 30% ของ baseline<br><b>&gt; 50%: หยุดยา</b> ติดตามทุก 1–2 สัปดาห์ จน Scr ไม่เกิน 15% ของ baseline แล้ววางแผนใหม่ เริ่มจากขนาดต่ำสุด<br>เพิ่ม &gt; 30% ร่วมกับ N/V, diarrhea, volume depletion → หยุดยา (เสี่ยง AKI)<br><small>หมายเหตุผู้แปลง: ต้นฉบับเขียนว่า "Scr เพิ่ม &lt;30% ให้สงสัย renal artery stenosis" — โดยทั่วไปที่ควรสงสัย RAS คือ Scr ขึ้นมาก (&gt; 30%) หลังเริ่ม ACEI/ARB</small></td>
      <td>&gt; 5 mEq/L: จำกัดอาหาร K สูง<br>&gt; 6 mEq/L: ยาลด K (HCTZ, furosemide, NaHCO₃ ถ้า acidosis, potassium binder) · ทางเลือกสุดท้ายคือหยุดยา</td></tr>
</table></div>
<h3>SGLT2 inhibitor</h3>
<ul>
  <li>ปกติ SGLT2 ดูดกลับน้ำตาลและ Na ที่ proximal tubule → macula densa เห็น Na น้อย → ขยาย afferent → GFR สูง ไตทำงานหนัก (glomerular hypertrophy)</li>
  <li>ยายับยั้ง SGLT2 → Na ถึง macula densa มากขึ้น → <b>afferent arteriole หด</b> → intraglomerular pressure ลด → ชะลอความเสื่อมของไต</li>
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
    { id: 'anemia', t: "Anemia in CKD", by: "ต้นน้ำ · ตรวจโดย แสนดี", html: `<h3>นิยาม</h3>
<div class="tbl"><table>
  <tr><th>กลุ่มผู้ป่วย</th><th class="num">Hb ที่เข้าเกณฑ์โลหิตจาง</th></tr>
  <tr><td>ผู้ใหญ่ ชาย</td><td class="num">&lt; 13.0 g/dL</td></tr>
  <tr><td>ผู้ใหญ่ หญิง</td><td class="num">&lt; 12.0 g/dL</td></tr>
  <tr><td>เด็ก 0.5–4 ปี</td><td class="num">&lt; 11.0 g/dL</td></tr>
  <tr><td>เด็ก 5–11 ปี</td><td class="num">&lt; 11.5 g/dL</td></tr>
  <tr><td>เด็ก 12–14 ปี</td><td class="num">&lt; 12.0 g/dL</td></tr>
</table></div>
<p><b>ปัจจัยเสี่ยง (KDIGO 2026):</b> ขาด EPO หรือดื้อต่อ EPO · <mark>ขาดเหล็ก</mark> · เสียเลือดทางเดินอาหาร (มะเร็ง พยาธิ) หรือจากการฟอกเลือด · เม็ดเลือดแดงอายุสั้นลง · hyperparathyroid/thyroid dysfunction · ยา ACEI, ARB, ยากดภูมิในผู้ปลูกถ่ายไต · MDS, พังผืดในไขกระดูก · ขาด folate/B12 · อักเสบเรื้อรัง (chronic HF, อ้วน, autoimmune) · โลหิตจางทางพันธุกรรม (thalassemia, sickle cell) · anti-ESA antibody (PRCA)</p>
<h3>เกณฑ์ขาดเหล็กใน CKD</h3>
<p>ประเมินเมื่อมีโลหิตจางแล้ว เพื่อพิจารณาให้เหล็ก</p>
<div class="tbl"><table>
  <tr><th>กลุ่ม</th><th>Ferritin</th><th>TSAT</th></tr>
  <tr><td>ขาดเหล็กรุนแรง (ทุกกลุ่ม)</td><td class="num">&lt; 45 ng/mL</td><td>—</td></tr>
  <tr><td>ยังไม่ฟอกเลือด (ND-CKD) / ล้างไตทางช่องท้อง (PD)</td><td class="num">&lt; 100 หรือ 100–300</td><td class="num">&lt; 40% หรือ &lt; 25%</td></tr>
  <tr><td>ฟอกเลือดด้วยเครื่อง (HD)</td><td class="num">≤ 500</td><td class="num">≤ 30%</td></tr>
</table></div>
<p><small>Ferritin &lt; 45 ng/mL → รีบหาสาเหตุเสียเลือดแฝง เช่น แผลในกระเพาะ มะเร็งลำไส้</small></p>
<h3>กลไก</h3>
<p>เซลล์ท่อไตที่เสียหายเปลี่ยนรูป (myofibroblast transdifferentiation) → สร้าง EPO ลดลง · การอักเสบใน CKD → ตับสร้าง <b>hepcidin</b> มากขึ้น → ยับยั้ง <b>ferroportin</b> → ลำไส้ดูดซึมเหล็กลดลง และเหล็กติดค้างใน macrophage เอามาสร้างเม็ดเลือดไม่ได้</p>
<figure><img data-fig="ckd/p10-1.webp" alt="แผนภาพการดูดซึมเหล็กผ่าน DMT1 และ ferroportin การควบคุมด้วย hepcidin และ HIF-2"><figcaption>การควบคุมเหล็กด้วย hepcidin/ferroportin และ HIF</figcaption></figure>
<p><b>อาการ:</b> อ่อนเพลีย หอบเหนื่อย นอนไม่หลับ ปวดศีรษะ สมองตื้อ (brain fog) เจ็บหน้าอก ทนหนาวไม่ได้<br>
<b>ความรุนแรง:</b> สัมพันธ์กับผลลัพธ์แย่ลงทั้งไตและหัวใจ — LVH, หัวใจล้มเหลว, โรคหลอดเลือดหัวใจ, เสียชีวิตสูงขึ้น, QoL ลดลง, ต้องรับเลือดมากขึ้น</p>
<h3>1. เหล็ก</h3>
<ul>
  <li>ดูดซึมที่ duodenum และ proximal jejunum ผ่าน DMT1 · ดูดซึมดีในสภาวะกรด</li>
  <li>เริ่ม <b>elemental iron 200 mg/d นาน 3 เดือน</b> เมื่อเข้าเกณฑ์ขาดเหล็ก (เช่น ferritin ≤ 500 และ TSAT ≤ 30%) · ไม่ดีขึ้นใน 3 เดือน → เปลี่ยนเป็น IV</li>
</ul>
<div class="tbl"><table>
  <tr><th>รูปแบบ</th><th>ยา</th><th>Elemental Fe</th><th>ข้อควรจำ</th></tr>
  <tr><td rowspan="4">Oral</td><td>Ferrous sulfate 325 mg</td><td class="num">65 mg</td><td rowspan="4">ดูดซึมดีที่สุดในรูป ferrous salt · ดูดซึมดีในกรด · antacid และ phosphate binder ขวางการดูดซึม (กินแยกมื้อ) · S/E ท้องผูก ท้องเสีย อุจจาระเปลี่ยนสี</td></tr>
  <tr><td>Ferrous sulfate desiccated 200 mg</td><td class="num">65 mg</td></tr>
  <tr><td>Ferrous gluconate 325 mg</td><td class="num">36 mg</td></tr>
  <tr><td>Ferrous fumarate 325 mg</td><td class="num">106 mg</td></tr>
  <tr><td rowspan="2">IV</td><td>Iron dextran</td><td>—</td><td>ต้อง <b>test dose 25 mg IV</b> สังเกต 30 นาทีก่อนให้จริงเสมอ · เสี่ยง anaphylactoid reaction</td></tr>
  <tr><td>Iron sucrose (Venofer)</td><td>—</td><td>ปลอดภัยกว่า แพ้น้อยกว่า · เจือจางใน NSS ให้ระหว่างรอบฟอกเลือด (HD) · PD แบ่งให้ 3 โดสช้า ๆ ภายใน 28 วัน</td></tr>
</table></div>
<ul>
  <li><b>พิษเฉียบพลัน:</b> 10 เม็ดอาจทำให้เด็กเสียชีวิต (necrotizing gastroenteritis) · antidote = <b>deferoxamine IV</b> (activated charcoal จับเหล็กไม่ได้)</li>
  <li><b>พิษเรื้อรัง:</b> hemochromatosis เหล็กเกาะหัวใจ ตับ ตับอ่อน จนอวัยวะล้มเหลว · <mark>หยุดเหล็กเมื่อ ferritin &gt; 800 ng/mL และ TSAT &gt; 50%</mark></li>
</ul>
<h3>2. ESAs</h3>
<p>Glycoprotein 34–39 kDa กระตุ้น EPO receptor ที่ไขกระดูก</p>
<div class="tbl"><table>
  <tr><th>ยา</th><th>ขนาด / ความถี่</th><th>จุดเด่น</th></tr>
  <tr><td>Epoetin alfa</td><td class="num">50–100 U/kg/dose · 1–3 ครั้ง/สัปดาห์</td><td>—</td></tr>
  <tr><td>Darbepoetin alfa</td><td class="num">0.45 mcg/kg · ทุก 1–4 สัปดาห์</td><td>เติมกรดอะมิโนและ N-linked glycosylation → half-life นานขึ้น</td></tr>
  <tr><td>Methoxy PEG-epoetin beta</td><td class="num">0.6 mcg/kg · เดือนละครั้ง</td><td>เชื่อม PEG → half-life นานที่สุดในกลุ่ม</td></tr>
</table></div>
<ul>
  <li><b>ND-CKD:</b> พิจารณาเริ่มเมื่อ Hb &lt; 10 g/dL (ดูอาการร่วม เช่น Hb ตกเร็ว ให้เหล็กแล้วไม่ดีขึ้น เสี่ยงต้องรับเลือด ซีดชัด) · <b>ห้ามเริ่มถ้า Hb ≥ 10</b></li>
  <li><b>ฟอกเลือดแล้ว (ESKD):</b> เริ่มได้เลยเมื่อ Hb 9–10 g/dL (ดักไม่ให้ต่ำกว่า 9)</li>
  <li>SC ใช้ขนาดน้อยกว่า IV ~30% · ปรับขึ้น/ลงครั้งละ 25–50% · เลี่ยงขนาดถึง 200 U/kg</li>
  <li><b>ห้ามหยุดทันที</b> (sawtooth effect) เพื่อป้องกัน PRCA</li>
  <li>เก็บ 2–8 °C ห้ามแช่แข็ง ห้ามเขย่าแรง · อยู่อุณหภูมิห้อง (&lt; 25 °C) ได้ไม่เกิน 7 วัน</li>
</ul>
<div class="key"><strong class="k">เป้าหมาย</strong>Hb 10–11 g/dL · <b>US boxed warning: ห้ามให้ Hb &gt; 13 g/dL</b> (เสี่ยง MI, stroke, DVT และกระตุ้นเซลล์มะเร็ง)</div>
<h3>3. HIF-PHIs (Guideline 2026)</h3>
<p>ทางเลือกเมื่อดื้อ ESA · กระตุ้นกลไกตอบสนองออกซิเจนต่ำ → เพิ่มการสร้าง EPO ในร่างกายและเพิ่มการดูดซึมเหล็ก — roxadustat, daprodustat, vadadustat</p>
<p><b>สมุนไพร/อาหารเสริม:</b> ไม่มีสมุนไพรที่แนะนำเฉพาะ · ถ้าขาด folate หรือ vitamin B12 ให้แก้ร่วมกับการให้เหล็ก</p>` },
    { id: 'mbd', t: "CKD-MBD", by: "ต้นน้ำ · ตรวจโดย แสนดี", html: `<h3>กลไกหลัก 3 ข้อ</h3>
<ol>
  <li>ไตขับฟอสเฟตไม่ได้ (phosphate retention) → <b>FGF-23 สูง</b> (เพิ่มเสี่ยงโรคหัวใจรุนแรง)</li>
  <li>ไตสร้าง active vitamin D (1,25-dihydroxyvitamin D₃) ลดลง → ลำไส้ดูดซึม Ca ไม่ได้ → hypocalcemia</li>
  <li>ฟอสเฟตสูง + Ca ต่ำ → พาราไทรอยด์ทำงานหนัก = <b>secondary hyperparathyroidism (SHPT)</b> → สลาย Ca จากกระดูก ไปตกตะกอนในหลอดเลือด</li>
</ol>
<figure><img data-fig="ckd/p13-1.webp" alt="แผนภาพกลไก CKD-MBD จาก phosphate retention, FGF-23, vitamin D ลดลง สู่ secondary hyperparathyroidism และ renal osteodystrophy"><figcaption>Pathophysiology of CKD-MBD</figcaption></figure>
<div class="key"><strong class="k">เป้าหมาย</strong>Phosphate และ Ca อยู่ในเกณฑ์ปกติ · iPTH (ESRD) 2–9 เท่าของค่าปกติ (~130–600 pg/mL) — ไม่ให้กระดูกบางหรือสร้างมากจนเปราะ</div>
<h3>ยาจับฟอสเฟต (phosphate binders)</h3>
<p>ลำไส้ดูดซึมฟอสเฟตผ่าน paracellular pathway (ช่องระหว่างเซลล์ — กลไกหลัก) และ transcellular ผ่าน NaPi2b</p>
<div class="tbl"><table>
  <tr><th>ยา</th><th class="num">RPBC</th><th>ขนาด</th><th>ข้อควรจำ</th></tr>
  <tr><td>Calcium acetate</td><td class="num">1.0</td><td class="num">1,334 mg TID</td><td>จับฟอสเฟตดีกว่า Ca carbonate ที่ขนาดเท่ากัน</td></tr>
  <tr><td>Calcium carbonate</td><td class="num">1.0</td><td class="num">0.5–1 g TID</td><td>อาจเกิด vascular calcification</td></tr>
  <tr><td>Sevelamer carbonate</td><td class="num">0.75</td><td class="num">800–1,600 mg TID</td><td>ข้อดี: ลด LDL ต้านการอักเสบ · ข้อเสีย: เม็ดเยอะ, hyperchloremic acidosis, <mark>ขวาง ciprofloxacin/mycophenolate</mark></td></tr>
  <tr><td>Lanthanum carbonate</td><td class="num">2.0</td><td class="num">1,500 mg/d แบ่งให้</td><td>จับแรงมาก · ละลายยาก · โลหะอาจสะสมในตับและเนื้อเยื่อ</td></tr>
  <tr><td>Sucroferric oxyhydroxide</td><td class="num">2.5</td><td class="num">500 mg TID</td><td>มีเหล็ก · จับแรงที่สุด กินน้อยเม็ด · อุจจาระสีดำ</td></tr>
  <tr><td>Aluminum hydroxide</td><td class="num">—</td><td class="num">300–600 mg TID</td><td><b>ใช้ไม่เกิน 4 สัปดาห์</b> กันอะลูมิเนียมสะสมในสมอง (สมองเสื่อม) และกระดูก</td></tr>
</table></div>
<h3>รักษา SHPT</h3>
<ul>
  <li><b>ND-CKD:</b> แก้สาเหตุก่อน (คุมฟอสเฟต Ca วิตามิน D) · <b>ห้ามใช้ calcitriol/vit D analog เป็นยาประจำ</b> ยกเว้น PTH สูงรุนแรง</li>
  <li><b>G5D:</b> เลือก cinacalcet, calcitriol หรือ vit D analog ตัวใดตัวหนึ่ง หรือใช้ร่วมกันได้</li>
  <li><mark>PTH สูง + Ca/P สูง → cinacalcet</mark> (active vit D จะยิ่งเพิ่มการดูดซึม Ca และ P) · <mark>PTH สูง + Ca/P ต่ำ → active vit D</mark> (calcitriol, alfacalcidol)</li>
  <li>เป้า 25(OH)D &gt; 30 ng/mL</li>
</ul>
<div class="tbl"><table>
  <tr><th>Vitamin D</th><th>ข้อควรจำ</th></tr>
  <tr><td>Ergocalciferol (D2) / Cholecalciferol (D3)</td><td>prohormone ต้องผ่านตับและไต · D2 จากพืช/เห็ด t½ ~13.9 วัน · D3 จากผิวหนัง/สัตว์ t½ ~15 วัน</td></tr>
  <tr><td>Alfacalcidol (One-Alpha)</td><td>ต้องผ่านตับเพื่อเป็น active form · t½ 3–4 ชม. · ขนาด 1.5–2 เท่าของ calcitriol</td></tr>
  <tr><td>Calcitriol (Meditrol)</td><td><b>active form 100%</b> ดูดซึมเร็ว (onset 2 ชม.) ยับยั้ง PTH ได้ทันที · t½ 5–8 ชม.</td></tr>
</table></div>
<p><b>Cinacalcet 25 mg</b> (calcimimetic): เพิ่มความไวของ calcium-sensing receptor ที่พาราไทรอยด์ → ลดการหลั่ง PTH · อาหารเพิ่มการดูดซึม 81% · ผ่าน CYP3A4, 2D6, 1A2 (ระวัง DI) · ADR: คลื่นไส้อาเจียนบ่อย (แก้โดยกินก่อนนอน), hypocalcemia ชา ตะคริว · <b>ห้ามเริ่มถ้า Ca &lt; 8.4 mg/dL</b></p>
<p><b>อาหาร:</b> เลี่ยง inorganic phosphate (อาหารแปรรูป น้ำอัดลม) ดูดซึมได้ 90–100% · ผักและไข่ขาว (organic phosphate) ดูดซึมน้อยกว่า</p>` },
    { id: 'acid', t: "Metabolic acidosis", by: "ต้นน้ำ · ตรวจโดย แสนดี", html: `<p><b>วินิจฉัย:</b> serum total CO₂ (tCO₂) หรือ bicarbonate &lt; 22 mEq/L<br>
<b>กลไก:</b> ไตสร้าง bicarbonate ใหม่ไม่ได้ และขับกรดทางปัสสาวะไม่ทัน<br>
<b>ผลเสีย:</b> ดึง Ca จากกระดูกมาสะเทินกรด (bone demineralization) · สลายโปรตีนกล้ามเนื้อ · เร่งไตเสื่อมเข้าสู่ ESRD · เพิ่มเสี่ยง heart failure</p>
<div class="key"><strong class="k">เป้าหมาย</strong>tCO₂ 24–26 mEq/L (อย่างน้อย ≥ 22 ตาม KDIGO 2026)</div>
<div class="tbl"><table>
  <tr><th>ยา</th><th>HCO₃⁻</th><th>ข้อควรจำ</th></tr>
  <tr><td>NaHCO₃ 325 / 650 mg<br>ผง 1/8 ช้อนชา (600 mg)</td><td class="num">3.9 / 7.7 mEq<br>7.1 mEq</td><td>เจอกรดในกระเพาะกลายเป็น CO₂ → ท้องอืด เรอ</td></tr>
  <tr><td>Sodium citrate/citric acid<br>500/334 mg ต่อ 5 mL</td><td class="num">1 mEq/mL</td><td>อืดน้อยกว่า · <mark>ตับต้องแปลง citrate เป็น bicarbonate → ไม่ได้ผลในโรคตับ</mark></td></tr>
  <tr><td>Potassium citrate 540 mg</td><td class="num">5 mEq</td><td>hyperkalemia — อันตรายต่อหัวใจในโรคไต</td></tr>
</table></div>
<h3>การให้ NaHCO₃</h3>
<ul>
  <li>tCO₂ เฉลี่ย 19–21 (วัด 2 ครั้งติดกัน) → เริ่ม <b>650 mg วันละ 2 ครั้ง</b> (~15 mEq/d)</li>
  <li>tCO₂ ≤ 18 → เริ่ม 1,300 mg วันละ 2 ครั้ง (~30 mEq/d)</li>
  <li>titrate ถึง 1,950 mg วันละ 2 ครั้ง (~46 mEq/d) เป้า 24–26</li>
  <li>ถ้ายัง &lt; 22 (ยืนยันด้วย blood gas ถ้าทำได้) → titrate ได้ถึง <b>1,950 mg วันละ 3 ครั้ง</b> (~70 mEq/d) เป้า ≥ 22</li>
</ul>` },
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
      "q": "การหยุด ESAs ทันทีแทนการลดขนาดทีละน้อย เสี่ยงต่อผลใดมากที่สุด",
      "o": [
        "Hb ลดลงเร็วและแกว่งขึ้นลง (Hb cycling / sawtooth pattern)",
        "Hemochromatosis",
        "ภูมิคุ้มกันต่อต้านเม็ดเลือดแดง (PRCA)",
        "Hypertensive crisis",
        "DVT"
      ],
      "a": 0,
      "e": "🤖 ปรับแก้โดย AI: การหยุด ESA ทันทีทำให้ Hb ลดลงแล้วต้องเริ่มยาใหม่ เกิด Hb ขึ้นลงเป็นฟันเลื่อย (sawtooth) ซึ่งสัมพันธ์กับผลเสียต่อหัวใจและหลอดเลือด จึงแนะนำให้ลดขนาดครั้งละ 25–50% แทน · PRCA เกิดจากภูมิคุ้มกันต่อ erythropoietin ไม่เกี่ยวกับการหยุดยา (เดิมเฉลย PRCA)"
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
