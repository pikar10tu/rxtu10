// Fluid and electrolyte disorders — converted from the RxTU10 class summary PDF (see content/summaries/manifest.json)
export default {
  id: 'fluid-electrolyte',
  date: '23/07/2026',
  refs: [
    'Lobo DN, et al. Basic concepts of fluid and electrolyte therapy. Melsungen: Bibliomed; 2013.',
    'O\'Callaghan S, Yau H. Treatment of malignancy-associated hypercalcemia with cinacalcet: a paradigm shift. Endocr Connect. 2021;10(1):R13–24.',
  ],
  sections: [
    { id: 'basic', t: 'สารน้ำในร่างกายและการควบคุม', html: `<ul>
  <li>ร่างกายเป็นของเหลว 60% · <b>1/3 อยู่นอกเซลล์ (ECF)</b> · ECF เป็น interstitial fluid 80% และ plasma 20%</li>
  <li>น้ำและยูเรียแพร่ตาม osmolarity · K, PO₄ มากในเซลล์ · Na, Cl มากนอกเซลล์ · Na⁺/K⁺-ATPase ปั๊ม Na ออก K เข้า สวน gradient เพื่อรักษาสมดุล</li>
</ul>
<h3>Plasma osmolality</h3>
<div class="key"><strong class="k">Posm (mOsm/kg) = 2 × Na + glucose/18 + BUN/2.8</strong>ปกติ 280–300 · osmolal gap (วัดจริง − คำนวณ) ไม่ควรเกิน 10 · gap &gt; 10 สงสัยสารพิษ เช่น methanol, ethanol, ethylene glycol, mannitol</div>
<ul>
  <li><b>Osmoregulation</b> (ควบคุมน้ำ): Posm สูง → osmoreceptor → หลั่ง ADH (ไตดูดน้ำกลับ) และกระหายน้ำ</li>
  <li><b>Volume regulation</b> (ใช้ Na เป็นหลัก): ปริมาณเลือดลด → baroreceptor → renin → RAAS (ดูดเกลือและน้ำ หดหลอดเลือด) + sympathetic + ADH · ปริมาณเลือดมาก → หัวใจหลั่ง ANP/BNP เพิ่มการขับ Na และน้ำ ลด RAAS</li>
</ul>` },
    { id: 'volume', t: 'Volume depletion, การให้สารน้ำ และ edema', html: `<h3>Hypovolemia</h3>
<p>ปากแห้ง ตาแห้ง เวียนหัว · รุนแรง: ปวด สับสนจาก ischemia · PE: skin turgor ลด รักแร้แห้ง BP ต่ำ · lab: Hct ↑, <b>BUN/Cr &gt; 20:1</b></p>
<h3>การให้สารน้ำ</h3>
<ol>
  <li><b>Resuscitation</b> — ให้สารน้ำด่วน</li>
  <li><b>Routine maintenance:</b> น้ำ 25–30 mL/kg/วัน · ไม่จำเป็นแล้วหยุด IV เปลี่ยนเป็นกิน · <b>Holliday–Segar:</b> 1–10 kg = 100 mL/kg · 10–20 kg = 1,000 mL + 50 mL × (kg ที่เกิน 10) · &gt; 20 kg = 1,500 mL + 20 mL × (kg ที่เกิน 20) ต่อวัน</li>
  <li><b>Replacement/redistribution</b> เมื่อมี ongoing losses</li>
</ol>
<p style="font-size:.9em">ต้นฉบับเขียนสูตร Holliday–Segar ช่วง 10–20 และ &gt; 20 kg เป็น "1000 mL/kg" และ "1500 mL/kg" ที่ถูกคือค่าคงที่ 1,000 mL และ 1,500 mL จึงแก้ข้อความ</p>
<ul>
  <li>Hypotonic (0.45% NaCl, D5W) ไม่ค่อยใช้ใน volume depletion เพราะเข้าเซลล์ ไม่อยู่ในหลอดเลือด</li>
  <li>ขาดน้ำใช้ <b>isotonic</b>: 0.9% NaCl, 5% albumin, lactated Ringer's, acetate Ringer's (มี Ca²⁺ และด่าง)</li>
  <li>โรคหัวใจระวัง Na เกิน hypo/hyperK · โรคไตระวัง K กรด-เบส · ท้องเสียให้สารน้ำด่าง · อาเจียนงดสารน้ำด่าง · เลี่ยง D5W ในเบาหวาน</li>
</ul>
<h3>Edema</h3>
<p>สาเหตุ: Na เกิน · HF (pulmonary venous pressure สูง → pulmonary edema) · prerenal AKI · cirrhosis (ท้องมาน) · รักษา: จำกัดน้ำ จำกัด Na 1–2 g/วัน และยาขับปัสสาวะ (เพิ่ม FeNa)</p>
<div class="tbl"><table>
  <tr><th>ยาขับปัสสาวะ</th><th>ตำแหน่ง/กลไก</th><th>ผลต่อเกลือแร่</th></tr>
  <tr><td>Carbonic anhydrase inhibitor (acetazolamide)</td><td>Proximal tubule ลดการดูดกลับ Na</td><td></td></tr>
  <tr><td>Osmotic (mannitol)</td><td>Proximal เพิ่มแรงดันออสโมติก ดึงน้ำ</td><td></td></tr>
  <tr><td>Loop (furosemide, bumetanide)</td><td>ยับยั้ง NKCC2 แรงที่สุด</td><td>Na, Cl, K, Mg, <b>Ca ต่ำ</b></td></tr>
  <tr><td>Thiazide (HCTZ, chlorthalidone, indapamide, metolazone)</td><td>Distal ยับยั้ง NCC</td><td>Na, K ต่ำ · <b>Ca สูง</b></td></tr>
  <tr><td>K-sparing: MRA (spironolactone), ENaC blocker (amiloride, triamterene)</td><td>Collecting duct</td><td>Na ลด <b>K เพิ่ม</b> · metabolic acidosis อ่อน ๆ · gynecomastia (spironolactone)</td></tr>
  <tr><td>Vasopressin antagonist (tolvaptan, conivaptan)</td><td>ยับยั้งการดูดน้ำผ่าน aquaporin ไม่ขับ Na</td><td>ระวัง hypernatremia</td></tr>
</table></div>
<p>Loop/thiazide ADR ร่วม: hypoK, hypoMg, hypovolemia, metabolic alkalosis, hyperuricemia</p>
<ul>
  <li><b>Furosemide:</b> IV bolus 20–40 mg (สูงสุด 80 mg) · infusion ไม่เกิน 4 mg/min · ขนาดสูงหรือฉีดเร็วเสี่ยง <b>ototoxicity</b></li>
  <li>Monitor 10–14 วัน: บวม เหนื่อย crepitation JVP · electrolytes และ uric acid</li>
  <li>ค่าปกติคร่าว ๆ: Na 135–145 · Cl 95–105 · K 3.5–5 · Ca 8.5–10.5 · PO₄ 2.5–4.5 · Mg 1.5–2.4</li>
</ul>` },
    { id: 'na', t: 'Sodium', html: `<h3>Hyponatremia (Na &lt; 135)</h3>
<p>มักไม่มีอาการ ถ้ามากจะคลื่นไส้ เพลีย ซึม พฤติกรรมเปลี่ยน ชัก · แบ่ง acute/chronic ที่ 48 ชม. · ขั้นตอน: <b>ดู plasma osmolality ก่อน</b> ถ้า hypotonic ค่อยดู volume</p>
<div class="tbl"><table>
  <tr><th>ชนิด</th><th>ลักษณะ/สาเหตุ</th><th>การจัดการ</th></tr>
  <tr><td>Isotonic (pseudohyponatremia)</td><td>Osm ปกติ · TG &gt; 500, hyperproteinemia, hyperlipidemia</td><td>ไม่ต้องแก้ Na</td></tr>
  <tr><td>Hypertonic</td><td>Hyperglycemia ดึงน้ำออกนอกเซลล์ Na เจือจาง</td><td>คิด corrected Na = measured Na + 2 × (glucose − 100)/100</td></tr>
  <tr><td>Hypotonic euvolemic</td><td><b>SIADH</b> — ยา: vasopressin, TCAs, SSRIs, carbamazepine, thiazide · อ่อนแรง มึนงง ปัสสาวะน้อย</td><td>จำกัดน้ำ · loop diuretic · 3% NaCl เมื่อ Na &lt; 110 หรือมีอาการ</td></tr>
  <tr><td>Hypotonic hypervolemic</td><td>น้ำเกินจน Na เจือจาง</td><td>จำกัดน้ำ 1 L/วัน · Na 1–2 g/วัน · diuretic</td></tr>
  <tr><td>Hypotonic hypovolemic</td><td>เสียทั้งน้ำและ Na · ผิวแห้ง ปากแห้ง ความดันตก</td><td>ให้ isotonic saline</td></tr>
</table></div>
<h3>หลักการแก้ hypotonic hyponatremia</h3>
<ul>
  <li>ไม่ทราบว่า acute หรือ chronic ให้ถือเป็น chronic · acute แก้เข้าเป้าได้เลย</li>
  <li>Chronic แก้เร็วเกิน → osmolality เปลี่ยนเร็ว น้ำออกจากเซลล์สมอง → <b>osmotic demyelination syndrome (ODS)</b></li>
  <li><mark>Chronic: low–moderate risk ODS ไม่เกิน 8 mmol/L/วัน · high risk ไม่เกิน 6 mmol/L/วัน</mark> · โดยรวมไม่เกิน 12 mEq/L ใน 24 ชม.</li>
  <li><b>Na deficit (mEq) = TBW × (desired Na − current Na)</b> · TBW = 0.5 L/kg × น้ำหนัก</li>
</ul>
<h3>Hypernatremia (Na &gt; 145)</h3>
<p>Osm สูงจาก Na เกินหรือน้ำน้อย ต้องประเมิน volume · อาการเหมือนขาดน้ำ กระหายน้ำ เบื่ออาหาร สับสน เยื่อบุแห้ง ประสาทหลอน hyperreflexia tremor ชัก</p>
<ul>
  <li><b>ขาดน้ำ:</b> water deficit (L) = TBW × [1 − (Na target / Na current)] (target ปกติ 140) · เช่น Na 160 หนัก 60 kg → 30 × (1 − 140/160) = 3.75 L</li>
  <li>ลด Na ไม่เกิน 12 mEq/L/24 ชม. · ให้ hypotonic (D5W, 0.45% หรือ 0.3% NaCl) ครึ่งหนึ่งของที่ขาดใน 12–24 ชม. แล้วค่อยให้ต่อ</li>
  <li><b>Na เกิน:</b> furosemide 20–40 mg IV q 6 ชม.</li>
</ul>` },
    { id: 'k', t: 'Potassium', html: `<p>Cation หลักในเซลล์ (กล้ามเนื้อ ตับ เม็ดเลือดแดง) · ปกติ 3.5–5 mEq/L · ได้จากอาหาร (ผักใบเขียวเข้ม) ขับทางไต</p>
<ul>
  <li><b>K เข้าเซลล์ (hypoK):</b> insulin · catecholamine/β2-agonist (กระตุ้น Na-K ATPase) · alkalosis · aldosterone เพิ่มการขับทางไต</li>
  <li><b>K ออกนอกเซลล์ (hyperK):</b> acidosis</li>
</ul>
<h3>Hypokalemia (K &lt; 3.5)</h3>
<p>Mild 3–3.5 มักไม่มีอาการ · moderate 2.5–3 เพลีย ปวดเกร็งกล้ามเนื้อ · severe &lt; 2.5 ST depression arrhythmia</p>
<p><b>สาเหตุ:</b> กินน้อย · metabolic alkalosis · insulin ขนาดสูง · ท้องเสีย อาเจียน · loop/thiazide · mineralocorticoid เกิน · <b>hypoMg</b> (มักต่ำคู่กัน) · ยาที่ทำให้ K เข้าเซลล์ (β2-agonist, caffeine, insulin) · ยาที่เพิ่มการขับ K (acetazolamide, loop, thiazide, amphotericin B, penicillin ขนาดสูง, aminoglycoside, cisplatin, laxative, polystyrene sulfonate)</p>
<div class="key"><strong class="k">K deficit (mEq) ≈ (4 − serum K) × 100</strong>เช่น K 2.5 → ขาด ~150 mEq</div>
<ul>
  <li>เตรียม: KCl 10% elixir 20 mEq/15 mL · K phosphate 20 mEq/20 mL · KCl 15% IV 40 mEq/20 mL (ใช้ผสม infusion เท่านั้น)</li>
  <li><b>Mild–moderate (2.5–3.4):</b> oral 10–20 mEq วันละ 2–4 ครั้ง (ครั้งละไม่เกิน 40 mEq)</li>
  <li><b>Severe (&lt; 2.5):</b> IV · <mark>เลี่ยงผสม D5W</mark> (กระตุ้น insulin ยิ่ง hypoK) ผสม 0.45% หรือ 0.9% NaCl · ความเข้มข้น 40–60 mEq/L (max 80) เกินเสี่ยง phlebitis · อัตราปกติ ≤ 10 mEq/hr (max 40 mEq/hr ต้องติด EKG) · <b>ห้าม IV push</b> (หัวใจหยุดเต้น)</li>
</ul>
<h3>Hyperkalemia (K &gt; 5.5)</h3>
<p><b>สาเหตุ:</b> กิน K มากโดยเฉพาะไตบกพร่อง · ขับออกน้อย (AKI, CKD, hypoaldosteronism, ACEIs, ARBs, K-sparing, NSAIDs) · SLE, sickle cell · DM, metabolic acidosis, β-blocker (K ออกนอกเซลล์) · เซลล์แตก (tumor lysis, rhabdomyolysis, hemolysis)</p>
<p style="font-size:.9em">ต้นฉบับจัด tumor lysis, rhabdomyolysis, hemolysis เป็น "pseudohyperkalemia" แต่ tumor lysis และ rhabdomyolysis ทำให้ K สูงจริง · pseudohyperkalemia คือ K สูงจากเม็ดเลือดแตกในหลอดเก็บตัวอย่าง จึงปรับข้อความ</p>
<p><b>อาการ:</b> ใจสั่น ถ้าไม่รักษาเกิดหัวใจเต้นผิดจังหวะ</p>
<ol>
  <li><b>Severe</b> (EKG เปลี่ยน เช่น peaked T หรือ K &gt; 7): <mark>calcium gluconate IV ก่อน</mark> เพื่อ stabilize หัวใจ (ไม่ลด K)</li>
  <li><b>Shift K เข้าเซลล์:</b> insulin + glucose · β2-agonist (salbutamol) · NaHCO₃ (แก้ acidosis)</li>
  <li><b>เอา K ออก:</b> SPS/CaPS (จับ K ในลำไส้ ระวังลำไส้อุดตัน ใช้ใน mild–moderate ไม่ใช้ใน severe) · dialysis</li>
</ol>` },
    { id: 'mgcap', t: 'Magnesium, calcium, phosphorus', html: `<h3>Magnesium (ปกติ 1.5–2.4 mg/dL ขับทางไต)</h3>
<ul>
  <li><b>Hypomagnesemia:</b> กินน้อย แอลกอฮอล์ ท้องเสีย อาเจียน laxative · RTA GN pyelonephritis · ยา: thiazide, loop, aminoglycoside, amphotericin B, cyclosporine, cisplatin · อาการ tetany ชัก ใจสั่น · Chvostek, Trousseau sign tremor torsades de pointes</li>
  <li>Mild (1–1.5): oral elemental Mg เริ่ม 300 mg · ไตบกพร่องลด 25–50%</li>
  <li>Severe (&lt; 1) หรือมีอาการ: MgSO₄ IV · อัตราไม่เกิน 8 mEq/hr (1 g MgSO₄/hr)</li>
  <li><b>Hypermagnesemia:</b> มักจาก CKD/ไตวาย · mild: furosemide IV + NSS · severe (&gt; 13 mg/dL): calcium gluconate IV ก่อน · ไตวาย: hemodialysis</li>
</ul>
<h3>Calcium (ปกติ 8.5–10.5 mg/dL)</h3>
<p>PTH สลายกระดูกให้ Ca · vitamin D เพิ่มการดูดซึม · calcitonin เก็บ Ca เข้ากระดูก · Ca จับ albumin ~80% → albumin ต่ำทำให้ total Ca ต่ำเทียม</p>
<div class="key"><strong class="k">Corrected Ca = measured Ca + 0.8 × (4 − albumin)</strong></div>
<ul>
  <li><b>Hypercalcemia (&gt; 10.5):</b> hyperparathyroidism · มะเร็ง (PTHrP) · rhabdomyolysis · lithium, vitamin A, D · อาการ เบื่ออาหาร คลื่นไส้ ท้องผูก polyuria nocturia calcification นิ่ว AKI/CKD · รักษา: รักษาสาเหตุ · <b>NSS hydration ก่อน</b> (ระวังน้ำเกิน) · calcitonin (เร็วแต่ tachyphylaxis) · pamidronate/bisphosphonate (ช้า 2–4 วัน) · glucocorticoids · cinacalcet (hyperparathyroidism)</li>
  <li><b>Hypocalcemia (&lt; 8.5):</b> ขาด vitamin D · metabolic acidosis · hypoparathyroidism (เช่น หลังผ่าตัดไทรอยด์) · hypoMg · ยา: furosemide, calcitonin, bisphosphonates, cinacalcet, phosphate, phenobarbital, phenytoin · อาการ acute ชารอบปาก ปลายมือเท้า เกร็ง ตะคริว tetany · chronic ซึมเศร้า มึนงง ความจำเสื่อม · รักษา acute elemental Ca 100–300 mg IV 10–30 นาที (&lt; 60 mg/min) · chronic oral 1–3 g/วัน · CaCO₃ = elemental 40% · Ca acetate = 25.3%</li>
</ul>
<h3>Phosphorus (ปกติ 2.5–4.5 mg/dL)</h3>
<ul>
  <li><b>Hyperphosphatemia:</b> CKD, AKI · tumor lysis, hemolysis, rhabdomyolysis · acute phosphate nephropathy · lactic acidosis/DKA · acute (&gt; 7) Ca-PO₄ ตกตะกอน นิ่ว hypocalcemia ชัก · chronic calcification ที่ตา ผิว หัวใจ · ใน CKD สัมพันธ์กับ secondary hyperparathyroidism · รักษา acute อาจต้อง hemodialysis · chronic อาหารฟอสเฟตต่ำ + <b>phosphate binder</b> (เช่น sevelamer ที่ไม่เพิ่ม Ca)</li>
  <li><b>Hypophosphatemia:</b> กินน้อย · ดูดซึมลด · tubular reabsorption ลด (Fanconi, metabolic acidosis) · PO₄ shift เข้าเซลล์ (refeeding syndrome, TPN, alcoholism) · อาการ ATP ลด rhabdomyolysis กล้ามเนื้ออ่อนแรงจนหายใจล้มเหลว ชา ชัก coma · รักษา severe PO₄ 15 mmol ใน D5W หรือ NSS 250 mL นาน 3 ชม. · mild–moderate oral 1.5–2 g/วัน (50–60 mmol) แบ่งหลายมื้อ (osmotic diarrhea) · อาหาร ไข่ เนื้อ ปลา ถั่ว นม</li>
</ul>
<p style="font-size:.9em">ต้นฉบับเขียน "Mg shift เข้าเซลล์" ในสาเหตุ hypophosphatemia และ "secondary hyperthyroidism" ใน CKD ที่ถูกคือ phosphate shift และ secondary hyperparathyroidism จึงแก้ข้อความ</p>` },
  ],
  questions: [
    { q: 'ผู้ป่วยชายไทยอายุ 50 ปี ผลตรวจ Na 140, K 4.0, Cl 100 mEq/L, Ca 10.5 mg/dL, PO₄ 6.5 mg/dL ควรได้รับยาในข้อใด', o: ['Potassium polystyrene sulfonate', 'Sevelamer', 'NaCl tablet', 'KCl slow drip'], a: 1, e: 'PO₄ สูง (ปกติ 2.5–4.5) มักพบใน CKD และ Ca อยู่ขอบบน จึงใช้ phosphate binder ที่ไม่เพิ่ม Ca คือ sevelamer' },
    { q: 'ผู้ป่วยหญิงอายุ 30 ปี หลังผ่าตัดต่อมไทรอยด์ มือจีบ ชาปลายมือ Chvostek sign positive total calcium 7.2 mg/dL, albumin 2.0 g/dL ข้อใดถูกต้อง', o: ['Corrected Ca 7.2 mg/dL — hypocalcemia จาก vitamin D ต่ำ', 'Corrected Ca 8.0 mg/dL — hypocalcemia จาก hypomagnesemia', 'Corrected Ca 8.8 mg/dL — ต่อมพาราไทรอยด์เสียหายจากการผ่าตัด PTH ลดลง', 'Corrected Ca 9.6 mg/dL — ไม่มีภาวะแคลเซียมต่ำ'], a: 2, keyBy: 'converter', e: 'Corrected Ca = 7.2 + 0.8 × (4 − 2) = 8.8 mg/dL · ต่อมพาราไทรอยด์อาจเสียหายระหว่างผ่าตัดไทรอยด์ PTH ลด Ca ต่ำ (ร่วมกับอาการ tetany) · หมายเหตุผู้แปลง: ต้นฉบับเป็นคำถามปลายเปิด ผู้แปลงเรียบเรียงเป็นตัวเลือกจากเฉลยเดิม' },
    { q: 'ผู้ป่วยไตวายเรื้อรัง K 7.2 mEq/L EKG พบ peaked T wave และ widened QRS ลำดับการรักษาที่เหมาะสมที่สุดคือข้อใด', o: ['SPS/CaPS → insulin + glucose → calcium gluconate', 'Calcium gluconate → insulin + glucose → dialysis', 'Sodium bicarbonate → SPS/CaPS → dialysis', 'Insulin + glucose → calcium gluconate → furosemide'], a: 1, e: 'HyperK ที่มี EKG change เป็นภาวะฉุกเฉิน ต้อง stabilize หัวใจด้วย calcium gluconate ก่อน (ออกฤทธิ์ 1–3 นาที ไม่ลด K) → shift K เข้าเซลล์ (insulin + glucose ± β-agonist) → เอา K ออก (dialysis)' },
    { q: 'ผู้ป่วยหญิง 45 ปี มะเร็งเต้านมระยะแพร่กระจาย corrected Ca 14.5 mg/dL ซึม สับสน การรักษาลำดับแรกที่เหมาะสมที่สุดคือข้อใด', o: ['Furosemide ทันที', 'IV normal saline hydration ก่อน แล้วพิจารณา bisphosphonate/calcitonin', 'Calcium gluconate IV', 'Oral phosphate binder', 'Thiazide diuretic'], a: 1, e: 'Hypercalcemia of malignancy รุนแรง เริ่ม IV isotonic saline ก่อนเสมอ (แก้ dehydration เพิ่มการขับ Ca) แล้วพิจารณา bisphosphonate (ช้า 2–4 วัน) หรือ calcitonin (เร็วแต่ tachyphylaxis) · thiazide เพิ่ม Ca' },
    { q: 'ผู้ป่วยชาย 68 ปี น้ำหนัก 60 kg อ่อนแรง ซึม Na 118 mEq/L serum osmolality ต่ำ euvolemic urine osmolality สูง วินิจฉัย SIADH แพทย์ต้องการแก้ Na ด้วย 3% NaCl ข้อใดถูกต้องเกี่ยวกับอัตราการแก้ไข', o: ['แก้ไขได้ไม่เกิน 4–6 mEq/L ใน 24 ชั่วโมงแรก', 'แก้ไขให้เร็วที่สุดเพื่อลดความเสี่ยง cerebral edema', 'แก้ไขได้ไม่เกิน 20 mEq/L ใน 24 ชั่วโมงแรก', 'ไม่จำเป็นต้องจำกัดอัตราถ้าใช้ 3% NaCl', 'ควรแก้ให้ Na กลับสู่ 140 mEq/L ภายใน 24 ชั่วโมง'], a: 0, e: 'Chronic hyponatremia (เช่น SIADH) ต้องแก้ไม่เกิน 6–8 mEq/L ใน 24 ชม.แรก ตามความเสี่ยง ODS เพื่อป้องกัน osmotic demyelination syndrome' },
  ],
}
