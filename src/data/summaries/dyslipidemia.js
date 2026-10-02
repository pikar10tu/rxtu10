// Dyslipidemia — converted from the RxTU10 class summary PDF (see content/summaries/manifest.json)
export default {
  id: 'dyslipidemia',
  date: '',
  refs: [
    '2018 ACC/AHA Guideline on the Management of Blood Cholesterol',
    'Thai Guideline for Dyslipidemia',
    '2019 ESC/EAS Guidelines for the management of dyslipidaemias',
    'สไลด์ประกอบการสอน Dyslipidemia',
  ],
  sections: [
    { id: 'basic', t: 'Dyslipidemia และ lipoprotein', html: `<ul>
  <li>ความผิดปกติของเมแทบอลิซึมของไลโปโปรตีน แสดงออกเดี่ยวหรือร่วมกัน เช่น cholesterol สูง, TG สูง, HDL ต่ำ, LDL สูง</li>
</ul>
<div class="tbl"><table>
  <tr><th>รายการ (mg/dL)</th><th class="num">Desirable</th><th class="num">Borderline</th><th class="num">High risk</th></tr>
  <tr><td>Total cholesterol</td><td class="num">&lt; 200</td><td class="num">200–239</td><td class="num">≥ 240</td></tr>
  <tr><td>HDL</td><td class="num">&gt; 40 (ชาย) / &gt; 50 (หญิง)</td><td class="num">35–45</td><td class="num">&lt; 35</td></tr>
  <tr><td>LDL</td><td class="num">&lt; 130</td><td class="num">130–159</td><td class="num">160–189</td></tr>
  <tr><td>Triglycerides</td><td class="num">&lt; 150</td><td class="num">150–199</td><td class="num">200–499</td></tr>
</table></div>
<p style="font-size:.9em">เป็นค่าอ้างอิงทั่วไป ไม่ได้บ่งชี้ว่าต้องเริ่มยาทันที การเริ่มยาดูความเสี่ยง ASCVD โดยรวม</p>
<h3>หน้าที่</h3>
<ul>
  <li><b>Cholesterol</b> (lipophilic): ส่วนประกอบเยื่อหุ้มเซลล์ · สารตั้งต้นวิตามินดี สเตียรอยด์ฮอร์โมน (cortisol, aldosterone, adrenal androgens) และฮอร์โมนเพศ · ส่วนประกอบเกลือน้ำดีช่วยดูดซึมวิตามิน A, D, E, K</li>
  <li><b>Triglyceride:</b> แหล่งพลังงานสำรองของเซลล์</li>
</ul>
<h3>Lipoprotein</h3>
<ul>
  <li>อนุภาคโปรตีน + ไขมัน ขนส่ง cholesterol และ TG ในเลือด ขนาด 5–1,200 nm</li>
  <li>เปลือกนอก phospholipid monolayer มี apoproteins และ free cholesterol · แกนกลาง hydrophobic มี cholesteryl esters และ TG</li>
  <li><b>Chylomicron:</b> ขนไขมันจากอาหารไปเนื้อเยื่อนอกตับ remnant กลับเข้าตับผ่าน LDL receptor จับ apoE</li>
  <li>ตับสร้าง <b>VLDL</b> → กลายเป็น <b>LDL</b> (cholesterol สูงสุด) ขนไปเซลล์ที่มี LDL-R มากเกินสะสมที่ผนังหลอดเลือด</li>
  <li><b>HDL:</b> รับ cholesterol ส่วนเกินจากเซลล์กลับตับขับทางน้ำดี = <mark>reverse cholesterol transport</mark> (ดีต่อหัวใจ)</li>
</ul>
<h3>Atherosclerosis</h3>
<p>LDL มากเกินแทรกเข้า endothelium ถูก oxidize → macrophage กินจนเป็น foam cell → fatty streak/plaque → อักเสบเรื้อรัง ผนังหนา รูแคบ → MI หรือ stroke ตามตำแหน่ง</p>` },
    { id: 'ldl', t: 'คำนวณ LDL', html: `<div class="key"><strong class="k">Friedewald equation</strong>LDL = TC − HDL − (TG / 5) (mg/dL) · ต้องอดอาหาร 12–14 ชม. · <mark>ใช้ได้เมื่อ TG &lt; 400 mg/dL เท่านั้น</mark></div>
<ul>
  <li>TC = LDL + HDL + VLDL</li>
  <li><b>Non-HDL = TC − HDL</b> (= LDL + VLDL) เป็นเป้าหมายรอง แทน atherogenic lipoprotein ทั้งหมด</li>
</ul>
<h3>ตัวอย่าง</h3>
<ol>
  <li>TC 220, TG 160, HDL 65 → LDL = 220 − 65 − 32 = <b>123 mg/dL</b></li>
  <li>TC 280, TG 480, HDL 40 → TG ≥ 400 <b>ใช้สูตรนี้ไม่ได้</b> ต้องวัด direct LDL</li>
  <li>TC 200, TG 150, HDL 50 → Non-HDL = <b>150 mg/dL</b></li>
</ol>` },
    { id: 'statin', t: 'Statins', html: `<p>ยาลดไขมัน 10 กลุ่ม: statins, fibrates, nicotinic acid, bile acid sequestrants, ezetimibe, PCSK9 inhibitors, omega-3 ethyl esters, ACL inhibitors, MTP inhibitors, inhibitors of apoB-100 synthesis</p>
<p>Atorvastatin, rosuvastatin, simvastatin, pravastatin, pitavastatin, fluvastatin, lovastatin</p>
<ul>
  <li><b>MOA:</b> ยับยั้ง HMG-CoA reductase → cholesterol ในตับลด → เพิ่ม LDL receptor ดึง LDL จากเลือด</li>
  <li><b>Pleiotropic effects:</b> ลดการอักเสบ ลด CVD ทั้ง primary และ secondary prevention <b>ลด mortality</b></li>
  <li>ลด LDL-C 30–50% · TG 10–20% · เพิ่ม HDL 4–10%</li>
</ul>
<div class="tbl"><table>
  <tr><th>Intensity</th><th class="num">ลด LDL-C</th><th>ยาและขนาด</th></tr>
  <tr><td>High</td><td class="num">≥ 50%</td><td>atorvastatin 40–80 mg, rosuvastatin 20 mg</td></tr>
  <tr><td>Moderate</td><td class="num">30–50%</td><td>atorvastatin 10–20, rosuvastatin 5–10, simvastatin 20–40, pravastatin 40–80, pitavastatin 2–4, lovastatin 40, fluvastatin 80 mg</td></tr>
  <tr><td>Low</td><td class="num">&lt; 30%</td><td>simvastatin 10, pravastatin 10–20, fluvastatin 20–40 mg</td></tr>
</table></div>
<p><mark>ไม่แนะนำ rosuvastatin 40 mg และ simvastatin 80 mg</mark> (เสี่ยง myopathy, rhabdomyolysis) · <b>Rule of 6's:</b> เพิ่มขนาด 2 เท่า ลด LDL ได้เพิ่มแค่ ~6%</p>
<h3>PK และการบริหาร</h3>
<ul>
  <li>Simvastatin, pravastatin, fluvastatin: <b>ให้ตอนเย็น/ก่อนนอน</b> (t½ สั้น ตรงช่วงสร้าง cholesterol สูงสุด)</li>
  <li>Atorvastatin, rosuvastatin, pitavastatin: เวลาใดก็ได้ (t½ ยาว)</li>
  <li>ส่วนใหญ่ lipophilic ยกเว้น <b>rosuvastatin และ pravastatin (hydrophilic)</b> ADR น้อยกว่า</li>
  <li>Pravastatin เมตาบอลิซึมด้วย sulfation (ไม่ผ่าน CYP) DI น้อย · ตัวอื่นผ่าน CYP450, P-gp, OATP1B1/B3</li>
</ul>
<h3>ADR</h3>
<p>Myotoxicity (อ่อนเพลีย อ่อนแรง ปวดกล้ามเนื้อ ถึง rhabdomyolysis) · LFT ผิดปกติ · ท้องผูก ท้องอืด คลื่นไส้ ปวดท้อง · peripheral neuropathy</p>
<div class="tbl"><table>
  <tr><th>SAMS (NLA 2014)</th><th>ลักษณะ</th></tr>
  <tr><td>Myalgia</td><td>ปวด ตะคริว เกร็ง CK ไม่เพิ่ม</td></tr>
  <tr><td>Myositis</td><td>อาการกล้ามเนื้อ + CK 3–10 เท่า ULN</td></tr>
  <tr><td><b>Rhabdomyolysis</b></td><td>CK &gt; 10 เท่า ULN (หรือ CK เพิ่มเท่าใดก็ได้ร่วม SCr สูง) ปัสสาวะสีน้ำตาลจาก myoglobin</td></tr>
</table></div>
<p><b>ปัจจัยเสี่ยง SAMS:</b> อายุ &gt; 80 (ระวังตั้งแต่ &gt; 75) หญิง เอเชีย BMI ต่ำ ไต/ตับบกพร่อง hypothyroidism HIV เบาหวาน ติดสุรา พันธุกรรม (SLCO1B1) · ฝั่งยา: ผ่าน CYP, ขนาดสูง, lipophilicity, DI</p>
<h3>Drug interactions</h3>
<p><mark>Simvastatin ห้ามใช้ร่วม</mark> itraconazole, ketoconazole, posaconazole, erythromycin, clarithromycin, cyclosporine, gemfibrozil, protease inhibitors (ยับยั้ง CYP3A4)</p>
<div class="tbl"><table>
  <tr><th>ยาที่ใช้ร่วม</th><th>จำกัดขนาด (US FDA)</th></tr>
  <tr><td>Verapamil, diltiazem, dronedarone</td><td>simvastatin ≤ 10 mg/วัน</td></tr>
  <tr><td>Amiodarone, amlodipine, ranolazine</td><td>simvastatin ≤ 20 mg/วัน</td></tr>
  <tr><td>Grapefruit juice</td><td>หลีกเลี่ยง (&gt; 1 quart/วัน)</td></tr>
  <tr><td>Clarithromycin, itraconazole, HIV PIs</td><td>atorvastatin ≤ 20 mg/วัน</td></tr>
  <tr><td>Gemfibrozil, lopinavir/r, atazanavir/r</td><td>rosuvastatin ≤ 10 mg/วัน</td></tr>
</table></div>` },
    { id: 'nonstatin', t: 'ยาลดไขมันอื่น', html: `<h3>Fibrates</h3>
<p>Gemfibrozil, bezafibrate, fenofibrate — กระตุ้น PPREs เพิ่ม lipoprotein lipase สลาย TG เพิ่ม uptake และ β-oxidation ของ FA ที่ตับ → <b>ลด TG เป็นหลัก</b></p>
<p>ลด LDL 10–20% · <mark>ลด TG 25–50% มากที่สุดในทุกกลุ่ม</mark> · เพิ่ม HDL 7–16%</p>
<div class="tbl"><table>
  <tr><th>หัวข้อ</th><th>รายละเอียด</th></tr>
  <tr><td>ข้อบ่งใช้หลัก</td><td>Severe hypertriglyceridemia TG ≥ 500 mg/dL (โดยเฉพาะ fasting TG ≥ 1,000) ลดเสี่ยง acute pancreatitis</td></tr>
  <tr><td>ขนาด</td><td>gemfibrozil 600 mg BID ก่อนอาหาร 30 นาที · fenofibrate micronized 200 mg OD หรือ non-micronized 200–300 mg/วัน แบ่งให้ · bezafibrate 400 mg OD</td></tr>
  <tr><td>ADR</td><td>GI (ปวดท้อง ท้องอืด)</td></tr>
  <tr><td>DI</td><td>ร่วม statin เพิ่ม myopathy · fenofibrate DI น้อยกว่า gemfibrozil</td></tr>
  <tr><td>ไต</td><td>fenofibrate ห้ามเมื่อ eGFR &lt; 30</td></tr>
  <tr><td>Monitor</td><td>TG · GI, LFT, renal function</td></tr>
</table></div>
<h3>Nicotinic acid (niacin, B3)</h3>
<ul>
  <li>จับ GPR109A บน adipocyte ลด hormone-sensitive lipase → FA เข้าตับน้อยลง ลดการสร้าง TG และ VLDL</li>
  <li>ลด LDL 5–25% · TG 9–50% · <mark>เพิ่ม HDL 5–28% มากที่สุด</mark> (ลด TG น้อยกว่า fibrate)</li>
  <li><b>ADR:</b> <b>cutaneous flushing</b> (พบบ่อยสุด ทำให้หยุดยา), คัน, hyperuricemia</li>
  <li>ER: 500 mg ก่อนนอน titrate ถึง 1–2 g ก่อนนอน · IR ขนาดสูงกว่าขนาดรักษาภาวะขาด B3 มาก flushing มากกว่า</li>
  <li>Monitor: TG · flushing, glucose, LFT</li>
  <li>AIM-HIGH และ HPS2-THRIVE = negative trials (ร่วม statin ไม่ลด CV outcome เพิ่ม)</li>
</ul>
<h3>Bile acid sequestrants</h3>
<ul>
  <li>Cholestyramine, colestipol, colesevelam — polymer ประจุบวกจับ bile acid ขับทางอุจจาระ ตับดึง cholesterol ไปสร้าง bile acid → LDL receptor เพิ่ม</li>
  <li>ลด LDL 18–25% · เพิ่ม HDL 3–5% · <b>อาจเพิ่ม TG เล็กน้อย</b></li>
  <li>Add-on เมื่อ fasting TG ≤ 300 และยังไม่ถึงเป้าหลัง max statin + ezetimibe</li>
  <li>Cholestyramine: 4 g วันละ 1–2 ครั้ง เพิ่มทุก ≥ 1 เดือน maintenance 8–16 g/วัน (แบ่ง 2) max 24 g/วัน</li>
  <li>ADR: ท้องผูก ท้องอืด คลื่นไส้ (ไม่ดูดซึม ไม่มี systemic SE)</li>
  <li><b>ลดการดูดซึมยาอื่น:</b> thiazides, digoxin, warfarin, phenylbutazone, phenobarbital, thyroid, penicillin, tetracycline, iron, pravastatin, fluvastatin → <mark>กินยาอื่นก่อน resin ≥ 1 ชม. หรือหลัง 1 ชม.</mark></li>
</ul>
<h3>Ezetimibe</h3>
<ul>
  <li>ยับยั้ง <b>NPC1L1</b> ที่ลำไส้เล็ก ลดการดูดซึม cholesterol (ไม่มีผลต่อ TG)</li>
  <li>เดี่ยวลด LDL 13–20% · ร่วม statin ลดเพิ่ม 21–30% · TG ~13% HDL ~3%</li>
  <li>10 mg OD · ร่วม BAS: ให้ ezetimibe ก่อน BAS ≥ 2 ชม. หรือหลัง ≥ 4 ชม. · enterohepatic circulation</li>
  <li>ADR: ท้องเสีย liver enzyme สูง dyspepsia · IMPROVE-IT = positive trial</li>
</ul>
<h3>PCSK9 inhibitors</h3>
<ul>
  <li>PCSK9 ทำลาย LDL receptor → ยับยั้งแล้ว receptor อยู่บนผิวเซลล์ตับมากขึ้น · ลด LDL 50–60%</li>
  <li>Monoclonal antibody (alirocumab, evolocumab) · siRNA (inclisiran)</li>
</ul>
<div class="tbl"><table>
  <tr><th>ยา</th><th>ข้อบ่งใช้</th><th>ขนาด</th><th>ราคาโดยประมาณ</th></tr>
  <tr><td>Alirocumab (Praluent)</td><td>adjunct กับ statin/ezetimibe ใน FH หรือ clinical ASCVD (เดี่ยวลด ~50% ร่วม statin 43–64%)</td><td>75 mg SC q2wk ไม่พอเพิ่ม 150 mg q2wk</td><td>~5,000 บาท/เข็ม</td></tr>
  <tr><td>Evolocumab (Repatha)</td><td>เช่นเดียวกัน</td><td>140 mg SC q2wk หรือ 420 mg เดือนละครั้ง</td><td>~5,000 บาท/เข็ม</td></tr>
  <tr><td>Inclisiran (Sybrava)</td><td>เสริมเมื่อ statin/ezetimibe ไม่พอ</td><td>284 mg SC ครั้งแรก ซ้ำใน 3 เดือน แล้วทุก 6 เดือน</td><td>~50,000 บาท/เข็ม</td></tr>
</table></div>
<p>ทนยาได้ดี ความปลอดภัยระยะยาวยังต้องติดตาม · FOURIER, ODYSSEY Outcomes = positive · SPIRE-1/2 หยุดก่อนกำหนดแต่แนวโน้มบวก</p>
<h3>Omega-3 fatty acid ethyl esters</h3>
<ul>
  <li>EPA, DHA 2–4 g/วัน · เพิ่ม β-oxidation, lipoprotein lipase, PPAR-α · ลดการสังเคราะห์ TG (ยับยั้ง DGAT) และการดูดซึม TG</li>
  <li><b>ลด TG ~50%</b> ใช้ใน severe hypertriglyceridemia (TG &gt; 500)</li>
  <li>t½ 50–80 ชม. ไม่ขับทางไต · ADR: ปวดข้อ คลื่นไส้ เรอกลิ่นคาวปลา dyspepsia อาจเพิ่ม LDL · DI: เลือดออกเมื่อใช้ร่วม anticoagulant/antiplatelet</li>
</ul>
<h3>สรุปประสิทธิผล</h3>
<div class="tbl"><table>
  <tr><th>กลุ่มยา</th><th>LDL-C</th><th>TG</th><th>HDL-C</th></tr>
  <tr><td>Statins</td><td class="num">↓ 30–50%</td><td class="num">↓ 10–20%</td><td class="num">↑ 4–10%</td></tr>
  <tr><td>Fibrates</td><td class="num">↓ 10–20%</td><td class="num"><b>↓ 25–50%</b></td><td class="num">↑ 7–16%</td></tr>
  <tr><td>Nicotinic acid</td><td class="num">↓ 5–25%</td><td class="num">↓ 9–50%</td><td class="num"><b>↑ 5–28%</b></td></tr>
  <tr><td>Bile acid sequestrants</td><td class="num">↓ 18–25%</td><td>อาจ ↑ เล็กน้อย</td><td class="num">↑ 3–5%</td></tr>
  <tr><td>Ezetimibe</td><td class="num">↓ 13–20% (+21–30% ร่วม statin)</td><td class="num">↓ ~13%</td><td class="num">↑ ~3%</td></tr>
  <tr><td>PCSK9 inhibitors</td><td class="num"><b>↓ 50–60%</b></td><td>—</td><td>—</td></tr>
  <tr><td>Omega-3</td><td>อาจ ↑ เล็กน้อย</td><td class="num">↓ ~50%</td><td>—</td></tr>
</table></div>` },
    { id: 'tx', t: 'การรักษาตามกลุ่มผู้ป่วย', html: `<ul>
  <li><b>Hypercholesterolemia:</b> LDL สูง สาเหตุหลักของ CHD/CAD</li>
  <li><b>Hypertriglyceridemia:</b> สัมพันธ์กับ VLDL remnant ก่อ atherosclerosis · TG สูงมากเสี่ยง acute pancreatitis</li>
  <li>เป้าหมาย: ป้องกัน clinical ASCVD · primary prevention (ยังไม่เคยเป็น) · secondary prevention (กันเป็นซ้ำ ลดตาย)</li>
  <li><b>Clinical ASCVD:</b> ischemic stroke, TIA, ACS (MI, unstable/stable angina), CAD, revascularization, PAD</li>
  <li>เครื่องมือ 10-year risk: ASCVD risk (Pooled Cohort Equation), <b>Thai CV risk score</b>, Framingham (AACE), ESC/EAS SCORE</li>
</ul>
<h3>กลุ่ม 1: Secondary prevention (มี clinical ASCVD)</h3>
<ul>
  <li><mark>High-intensity statin เป็นอันดับแรก</mark> (Class I) ลด LDL ≥ 50%</li>
  <li>Very high-risk ที่ใช้ high-intensity เต็มที่แล้วยังไม่ถึงเป้า → เพิ่ม ezetimibe ก่อน แล้วจึง PCSK9 inhibitor</li>
</ul>
<h3>กลุ่ม 2: LDL ≥ 190 mg/dL</h3>
<ul>
  <li><b>ACC/AHA 2018:</b> อายุ 20–75 ปี → high-intensity statin ทันที ลด LDL ≥ 50% และ/หรือ LDL &lt; 100 · ไม่ถึงเป้า: เพิ่ม ezetimibe (IIa) หรือ BAS ถ้า TG &lt; 300 (IIb) · มี MI/ASCVD ร่วมพิจารณา PCSK9 inhibitor</li>
  <li><b>Thai guideline:</b> อายุ ≥ 21 ปี LDL ≥ 190 ไม่มีเบาหวาน ประเมินว่าเป็น FH หรือไม่
    <ul>
      <li>ไม่ใช่ FH: ปรับพฤติกรรม 3–6 เดือน + moderate-intensity statin เป้าลด ≥ 50% หรือ LDL &lt; 130 · ไม่ถึงใน 4–12 สัปดาห์ → high-intensity</li>
      <li>เป็น FH: high-intensity statin เลย เป้าลด ≥ 50% หรือ LDL &lt; 100 · ไม่ถึงใน 4–12 สัปดาห์ → เพิ่ม ezetimibe หรือ cholestyramine</li>
    </ul>
  </li>
  <li><b>FH ทางคลินิก:</b> ครอบครัวเป็น premature CHD (ชาย &lt; 55, หญิง &lt; 60) · LDL ≥ 190 ของตนเองหรือครอบครัว · corneal arcus, xanthelasma, tendon xanthoma</li>
</ul>
<h3>กลุ่ม 3: เบาหวาน</h3>
<ul>
  <li>ACC/AHA: อายุ 40–75 ปี → moderate-intensity statin เป็น first line · เสี่ยงสูงหลายปัจจัย → high-intensity ลด ≥ 50% · ไม่ถึงเป้าเพิ่ม ezetimibe (IIb)</li>
  <li>Thai: แนวทางใกล้เคียง ไม่ถึงเป้าเพิ่ม ezetimibe หรือ PCSK9 inhibitor/cholestyramine ตามลำดับ</li>
</ul>
<h3>กลุ่ม 4: Primary prevention ความเสี่ยงสูง (ไม่มี LDL ≥ 190 หรือเบาหวาน)</h3>
<ul>
  <li>ACC/AHA: Pooled Cohort Equation + risk-enhancing factors</li>
  <li><b>Thai:</b> อายุ ≥ 35 ปี และ <mark>Thai CV risk 10 ปี ≥ 10%</mark> → low-to-moderate intensity statin เป้า LDL &lt; 130 หรือลด ≥ 30%</li>
  <li>Thai CV risk &lt; 10% แต่มี subclinical atherosclerosis, coronary calcium &gt; 300, ABI &lt; 0.9, ครอบครัวเป็น premature CHD, โรคอักเสบเรื้อรัง (HIV, psoriasis) → รักษาเหมือนกลุ่มเสี่ยงสูง</li>
  <li>เริ่มด้วยปรับพฤติกรรม 3–6 เดือนก่อนเสมอ</li>
</ul>
<h3>เป้า LDL-C (ESC/EAS 2019)</h3>
<div class="tbl"><table>
  <tr><th>ความเสี่ยง</th><th class="num">LDL-C</th></tr>
  <tr><td>Very high</td><td class="num">&lt; 55 mg/dL</td></tr>
  <tr><td>High</td><td class="num">&lt; 70 mg/dL</td></tr>
  <tr><td>Moderate</td><td class="num">&lt; 100 mg/dL</td></tr>
  <tr><td>Low</td><td class="num">&lt; 116 mg/dL</td></tr>
</table></div>
<p>"the higher the risk, the lower the target"</p>` },
    { id: 'secondary', t: 'สาเหตุรองและการติดตาม', html: `<div class="tbl"><table>
  <tr><th>สาเหตุ</th><th>LDL-C สูง</th><th>TG สูง</th></tr>
  <tr><td>อาหาร</td><td>ไขมันอิ่มตัว/trans fat, น้ำหนักเพิ่ม</td><td>น้ำหนักเพิ่ม, คาร์โบไฮเดรตขัดสีสูง, แอลกอฮอล์มาก</td></tr>
  <tr><td>ยา</td><td>diuretics, cyclosporine, glucocorticoids, amiodarone</td><td>oral estrogen, glucocorticoids, BAS, retinoic acid, sirolimus, raloxifene, tamoxifen, beta-blockers (ยกเว้น carvedilol), thiazides</td></tr>
  <tr><td>โรค</td><td>biliary obstruction, nephrotic syndrome</td><td>nephrotic syndrome, CKD, lipodystrophies</td></tr>
  <tr><td>เมแทบอลิซึม</td><td>hypothyroidism, obesity, ตั้งครรภ์</td><td>เบาหวานคุมไม่ดี, hypothyroidism, obesity, ตั้งครรภ์</td></tr>
</table></div>
<p>ก่อนเริ่ม/ปรับยา ตรวจหาสาเหตุรองและ adherence ต่อ statin และการคุมอาหาร</p>
<h3>Monitoring</h3>
<div class="tbl"><table>
  <tr><th>พารามิเตอร์</th><th>Baseline</th><th>ติดตาม</th></tr>
  <tr><td>Lipid profile</td><td>ตรวจ</td><td>4–12 สัปดาห์หลังเริ่ม/ปรับยา แล้วทุก 3–12 เดือน</td></tr>
  <tr><td>LFT</td><td>ตรวจ</td><td>ตรวจเมื่อสงสัย · enzyme ≥ 3× ULN พิจารณาหยุด statin ชั่วคราวหาสาเหตุ</td></tr>
  <tr><td>CPK</td><td>อาจพิจารณาในกลุ่มเสี่ยงสูง</td><td>ไม่ตรวจประจำ ตรวจเมื่อปวด/อ่อนแรงกล้ามเนื้อ</td></tr>
</table></div>
<h3>หลักฐานยาเสริมร่วม statin</h3>
<div class="tbl"><table>
  <tr><th>ยา</th><th>Trial</th><th>ผล</th></tr>
  <tr><td>Ezetimibe</td><td>IMPROVE-IT</td><td>positive</td></tr>
  <tr><td>Bile acid resins</td><td>—</td><td>ไม่มี outcome trial</td></tr>
  <tr><td>Niacin</td><td>AIM-HIGH, HPS2-THRIVE</td><td>negative</td></tr>
  <tr><td>PCSK9 inhibitors</td><td>FOURIER (evolocumab), ODYSSEY Outcomes (alirocumab)</td><td>positive</td></tr>
  <tr><td>PCSK9 inhibitors</td><td>SPIRE-1 and 2</td><td>หยุดก่อนกำหนด แนวโน้มบวก</td></tr>
</table></div>
<h3>Lifestyle</h3>
<p>เลี่ยง trans fat · ลดไขมันอิ่มตัวและ cholesterol ในอาหาร · เพิ่มใยอาหาร · phytosterols, red yeast rice · ลดน้ำหนัก · ออกกำลังกายสม่ำเสมอ</p>
<h3>Case ในสไลด์</h3>
<p>ชายไทย 50 ปี HTN 5 ปี, DM2 5 ปี, AF 2 ปี · ใช้ HCTZ, enalapril, glipizide, metformin · BP 150/90 · TC 220, HDL 45, TG 150, eGFR 80, dipstick albumin negative · ไม่สูบบุหรี่ ไม่ดื่ม</p>
<ol>
  <li>ต้องได้ยาไหม: <b>ใช่</b> (primary prevention ในเบาหวานอายุ 40–75 ปี)</li>
  <li>Intensity: มักเริ่ม moderate-intensity เว้นแต่มีความเสี่ยงสูงเพิ่มเติมจึงพิจารณา high-intensity</li>
</ol>` },
  ],
  questions: [
    { q: 'ชาย 55 ปี เป็น CHD และติดเชื้อราในกระแสเลือด ได้ posaconazole แพทย์จะเริ่ม statin ตัวใดเสี่ยง myopathy/rhabdomyolysis ต่ำที่สุดเมื่อใช้ร่วมกัน', o: ['Simvastatin', 'Lovastatin', 'Atorvastatin', 'Rosuvastatin'], a: 3, e: 'Azoles เป็น strong CYP3A4 inhibitor · simvastatin, lovastatin, atorvastatin ผ่าน CYP3A4 เป็นหลัก ระดับยาสูงจนเป็นพิษต่อกล้ามเนื้อ · rosuvastatin ผ่าน CYP2C9 ส่วนน้อย DI ต่ำที่สุด' },
    { q: 'รักษา mixed dyslipidemia ด้วย fibrate ร่วม statin เภสัชกรควรทักท้วงคู่ใด เพราะเพิ่มเสี่ยง rhabdomyolysis สูงที่สุดทาง pharmacokinetics', o: ['Fenofibrate + atorvastatin', 'Fenofibrate + rosuvastatin', 'Gemfibrozil + simvastatin', 'Gemfibrozil + fenofibrate'], a: 2, e: 'Gemfibrozil ยับยั้ง glucuronidation (UGT1A1/1A3) และ OATP1B1 ที่พา statin เข้าตับ ระดับ statin สูงขึ้นมาก · ถ้าต้องใช้คู่ statin + fibrate เลือก fenofibrate' },
    { q: 'ผู้ป่วย ASCVD LDL-C 210 mg/dL ได้ PCSK9 inhibitor (evolocumab) กลไกที่ทำให้ลด LDL-C ได้ 50–60% คือ', o: ['ยับยั้งการทำลาย LDL receptor ที่ผิวเซลล์ตับ ทำให้ receptor หมุนเวียนกลับมาจับ LDL-C ได้มากขึ้น', 'กระตุ้นการสังเคราะห์ LDL receptor ใหม่ผ่าน SREBP-2', 'จับ PCSK9 ในเลือดเพื่อลดการขนส่ง VLDL ออกจากตับ', 'เร่ง receptor-mediated endocytosis โดยไม่ต้องอาศัย clathrin-coated pits'], a: 0, e: 'ปกติ PCSK9 จับ LDL receptor แล้วพาไปทำลายใน lysosome · ยับยั้ง PCSK9 แล้ว receptor ถูก recycle กลับผิวเซลล์ตับ ดึง LDL-C ออกจากเลือดได้ต่อเนื่อง' },
    { q: 'Ezetimibe ออกฤทธิ์ที่ใดและอย่างไร', o: ['ตับ — ยับยั้งการสังเคราะห์ VLDL', 'เนื้อเยื่อไขมัน — ลดการสลายไขมัน', 'ผนังลำไส้เล็ก — ยับยั้งการดูดซึมคอเลสเตอรอล', 'ท่อน้ำดี — ขับคอเลสเตอรอลส่วนเกิน'], a: 2, e: 'ออกฤทธิ์ที่ brush border ของลำไส้เล็ก ยับยั้ง NPC1L1 ลดการดูดซึม cholesterol จากอาหารและน้ำดี' },
    { q: 'ยาลดไขมันใด "ห้ามใช้" เด็ดขาดในหญิงตั้งครรภ์หรือให้นมบุตร', o: ['Cholestyramine', 'Ezetimibe', 'Simvastatin', 'Omega-3 fatty acids'], a: 2, e: 'Statin จัด category X ห้ามในหญิงตั้งครรภ์ · cholestyramine category C ปลอดภัยกว่าในบางกรณี' },
  ],
}
