// Asthma — converted from the RxTU10 class summary PDF (see content/summaries/manifest.json)
export default {
  id: 'asthma',
  date: "29/7/69",
  refs: ["แนวทางการวินิจฉัยและบำบัดโรคหืดในผู้ใหญ่ พ.ศ. 2566 (สมาคมอุรเวชช์แห่งประเทศไทย)","GINA Summary Guide 2025","StatPearls: Asthma (NBK551579)","สไลด์อาจารย์"],
  sections: [
    { id: 'def', t: "นิยาม & ปัจจัยเสี่ยง", html: `<p>โรคหืดเกิดจาก <b>การอักเสบเรื้อรังของหลอดลม</b> มีอาการ <mark>หายใจเสียงวี้ด ไอ หอบเหนื่อย แน่นหน้าอก</mark> ที่แปรปรวนตามเวลาและสิ่งกระตุ้น ตอบสนองต่อยาต้านการอักเสบ</p>
<p>ความชุกในไทย 10–12% ในเด็ก, 6.9% ในผู้ใหญ่ · พบร่วมกับภูมิแพ้จมูกมากที่สุด</p>
<p><b>ปัจจัยกระตุ้น:</b> ประวัติครอบครัว · บุหรี่ · allergen (ไรฝุ่น แมลงสาบ สัตว์เลี้ยง) · สารระคายเคือง · viral infection · ความเครียด · ออกกำลังกาย · <b>NSAIDs/aspirin, beta-blocker</b> · chronic sinusitis, AR, GERD · อ้วน</p>
<div class="key"><strong class="k">ลักษณะสำคัญ</strong>Chronic airway inflammation · reversible obstruction · bronchial hyperresponsiveness · variable symptoms</div>` },
    { id: 'dx', t: "วินิจฉัย", html: `<ol>
  <li><b>Spirometry:</b> FEV₁/FVC &lt; 0.75 และ <mark>FEV₁ เพิ่ม &gt; 12% และ &gt; 200 mL</mark> หลังพ่น salbutamol 400 mcg 10–15 นาที</li>
  <li><b>PEF:</b> diurnal variability &gt; 10% (วัด 2 ครั้ง/วัน 2 สัปดาห์) หรือเพิ่ม &gt; 20% หลังรักษา 4 สัปดาห์</li>
  <li><b>Bronchial challenge:</b> FEV₁ ลด &gt; 20% ด้วย methacholine (PC₂₀ &lt; 8 mg/mL) หรือ &gt; 10% และ &gt; 200 mL หลังออกกำลังกาย</li>
  <li><b>ตอบสนองต่อการรักษา:</b> FEV₁ เพิ่ม &gt; 200 mL และ 12% หลัง medium-dose ICS ≥ 4 สัปดาห์</li>
</ol>
<div class="tbl"><table>
  <tr><th></th><th>Asthma</th><th>COPD</th></tr>
  <tr><td>Baseline</td><td>อาจปกติ หรือ FEV₁/FVC &lt; 0.75</td><td>FEV₁/FVC &lt; 0.75 ชัดเจน</td></tr>
  <tr><td>หลังยาขยายหลอดลม</td><td>FEV₁ เพิ่ม &gt; 12% และ 200 mL</td><td>Post-BD FEV₁/FVC &lt; 0.7</td></tr>
  <tr><td>การอุดกั้น</td><td>Reversible</td><td>Irreversible / fixed</td></tr>
</table></div>
<p style="font-size:.9em">PEFR ขึ้นกับอายุ เพศ ส่วนสูง (น้ำหนักไม่มีผล)</p>` },
    { id: 'patho', t: "Pathophysiology", html: `<ul>
  <li><b>Early phase:</b> IgE จับ mast cell/basophil → degranulation → histamine, prostaglandins, leukotrienes → bronchoconstriction + mucus</li>
  <li>Th2 สร้าง IL-4, IL-5, IL-13, GM-CSF คงการอักเสบ</li>
  <li><b>Late phase:</b> (หลายชั่วโมงต่อมา) eosinophil, basophil, neutrophil, T cell สะสม → หดเกร็งและอักเสบต่อเนื่อง</li>
</ul>
<div class="fig">🖼️ ภาพ mechanism และหลอดลมปกติ/หอบ (ต้นฉบับ PDF หน้า 5–6)</div>` },
    { id: 'assess', t: "ประเมิน", html: `<p>ประเมิน 2 ส่วนควบคู่กันเสมอ: <b>symptom control</b> และ <b>future risk</b></p>
<div class="tbl"><table>
  <tr><th>ใน 4 สัปดาห์ที่ผ่านมา</th></tr>
  <tr><td>1. อาการกลางวัน &gt; 2 ครั้ง/สัปดาห์<br>2. ตื่นกลางคืนเพราะหอบ<br>3. ใช้ SABA &gt; 2 ครั้ง/สัปดาห์ (ไม่นับก่อนออกกำลังกาย)<br>4. จำกัดกิจกรรมเพราะหอบ</td></tr>
  <tr><td><b>ไม่มีเลย</b> = ควบคุมได้ · <b>1–2 ข้อ</b> = ได้บางส่วน · <b>3–4 ข้อ</b> = ควบคุมไม่ได้</td></tr>
</table></div>
<p><b>เสี่ยงกำเริบ:</b> คุมไม่ได้ · เคยใส่ท่อ/ICU · กำเริบรุนแรง ≥ 1 ครั้ง/ปี · <mark>SABA &gt; 1 หลอด/เดือน</mark> · ICS ไม่พอ/พ่นผิด · FEV₁ &lt; 60% · สัมผัสบุหรี่/สารก่อภูมิแพ้ · โรคจิตเวช · ตั้งครรภ์ · FeNO สูง</p>
<p><b>ความรุนแรง</b> (หลังรักษา 3–6 เดือน): น้อย = คุมได้ด้วย low-dose ICS หรือ as-needed ICS/formoterol · ปานกลาง = low–medium ICS/LABA · มาก = high-dose ICS/LABA แล้วยังคุมไม่ได้</p>` },
    { id: 'drugs', t: "ยา", html: `<p><b>Controller:</b> ICS, LABA, LAMA, LTRA, theophylline SR, anti-IgE · <b>Reliever:</b> SABA, SAMA, low-dose ICS-formoterol · <b>Acute severe:</b> systemic steroid, bronchodilator, O₂</p>
<div class="tbl"><table>
  <tr><th>ยา</th><th class="num">Onset</th><th class="num">Duration</th></tr>
  <tr><td>Salbutamol</td><td class="num">5 นาที</td><td class="num">4–8 ชม.</td></tr>
  <tr><td>Terbutaline</td><td class="num">15 นาที</td><td class="num">4–8 ชม.</td></tr>
  <tr><td>Salmeterol</td><td class="num">30 นาที</td><td class="num">≥ 12 ชม.</td></tr>
  <tr><td><b>Formoterol</b></td><td class="num">5 นาที</td><td class="num">≥ 12 ชม.</td></tr>
</table></div>
<ul>
  <li><b>SABA:</b> 2–4 puff prn · ก่อนออกกำลังกาย 10–15 นาที · exacerbation 4–6 puff q20 min × 3 · <mark>ไม่ใช้ประจำทุกวัน</mark> (down-regulation) · AE tremor, ปวดหัว, ใจสั่น</li>
  <li><b>LABA:</b> controller BID · <mark>ต้องใช้ร่วม ICS เสมอ</mark> (เดี่ยว ๆ เพิ่มเสี่ยงตาย) · formoterol เป็น LABA ตัวเดียวที่ออกฤทธิ์เร็ว → ใช้เป็น reliever ได้ในรูป ICS-formoterol</li>
  <li><b>SAMA</b> (ipratropium): ช้ากว่า SABA ป้องกัน EIB ไม่ได้ · ใช้ร่วม SABA ใน acute severe · AE ปากแห้ง ตาพร่า</li>
  <li><b>LAMA</b> (tiotropium): add-on เมื่อ medium/high ICS/LABA ยังคุมไม่ได้ · <mark>ห้ามใช้เดี่ยว</mark></li>
  <li><b>Theophylline:</b> PDE inhibitor · narrow therapeutic range · clearance ลดด้วย erythromycin, clarithromycin, ciprofloxacin, propranolol · เพิ่มด้วย rifampicin, carbamazepine, phenobarbital, phenytoin, บุหรี่ · doxophylline SE น้อยกว่า</li>
  <li><b>ICS:</b> ต้านอักเสบดีที่สุด เริ่มดีขึ้น 1–2 สัปดาห์ สูงสุด 4–8 สัปดาห์ · เสียงแหบ ไอ เชื้อราในปาก → <b>บ้วนปากหลังพ่น</b></li>
  <li><b>Systemic steroid:</b> exacerbation · PO = IV · ขนาดต่ำสุด ระยะสั้นสุด</li>
  <li><b>LTRA</b> (montelukast): add-on · ดีใน AR, aspirin-induced, EIB · <b>boxed warning neuropsychiatric</b></li>
  <li><b>Azithromycin</b> 500 mg 3 วัน/สัปดาห์ ≥ 6 เดือน: severe asthma อายุ &gt; 18 · ตรวจ ECG (QT)</li>
  <li><b>Omalizumab</b> (anti-IgE): SC ทุก 2–4 สัปดาห์ · อายุ &gt; 12 ปี IgE ≥ 30 IU/mL</li>
</ul>` },
    { id: 'tx', t: "ขั้นการรักษา", html: `<ol>
  <li>ให้ ICS-containing regimen ทุก step</li>
  <li><mark>ห้าม SABA monotherapy</mark> โดยไม่มี ICS ใน step 1–2</li>
</ol>
<div class="tbl" style="border:0"><div class="steps">
  <div class="s s1"><b>Step 1</b><small>อาการ &lt; 2 ครั้ง/เดือน</small>As-needed low-dose ICS-formoterol<br>หรือ low-dose ICS ทุกครั้งที่ใช้ SABA</div>
  <div class="s s2"><b>Step 2</b><small>&lt; 4–5 วัน/สัปดาห์</small>As-needed low-dose ICS-formoterol<br>หรือ low-dose ICS ประจำ</div>
  <div class="s s3"><b>Step 3</b><small>เกือบทุกวัน / ตื่นกลางคืน ≥ 1/สัปดาห์</small>Low-dose maintenance ICS-formoterol (MART)<br>หรือ low-dose ICS-LABA</div>
  <div class="s s4"><b>Step 4</b><small>ทุกวัน + lung function ต่ำ</small>Medium-dose ICS-formoterol (MART)<br>หรือ medium/high ICS-LABA</div>
  <div class="s s5"><b>Step 5</b><small>refer</small>Add-on LAMA · anti-IgE/IL-5/IL-4R · high-dose ICS-LABA · macrolide</div>
</div></div>
<p style="font-size:.85em;color:var(--muted)">Reliever: ICS-formoterol (ทางเลือกหลัก) หรือ SABA · ดัดแปลงจากแนวทางไทย 2566 / GINA</p>
<ul>
  <li>Budesonide/formoterol 160/4.5: 1 puff prn ซ้ำได้ทุก 4–6 ชม. ไม่เกิน 6 puff/วัน (step 1–2) · <b>รวมทั้งวันไม่เกิน 12 puff</b> (formoterol 54 mcg)</li>
  <li>Beclomethasone/formoterol 100/6 รวมไม่เกิน 6 puff/วัน</li>
  <li>MART ใช้ได้เฉพาะ budesonide/formoterol หรือ beclomethasone/formoterol</li>
  <li>Step 5: high-dose ICS/LABA ยังคุมไม่ได้ เพิ่ม LAMA · ไม่ดีขึ้นใน 3 เดือน refer</li>
</ul>
<div class="tbl"><table>
  <tr><th>ICS (≥ 12 ปี, mcg/วัน)</th><th class="num">Low</th><th class="num">Medium</th><th class="num">High</th></tr>
  <tr><td>Beclomethasone (pMDI standard)</td><td class="num">200–500</td><td class="num">&gt; 500–1000</td><td class="num">&gt; 1000</td></tr>
  <tr><td>Beclomethasone (extrafine)</td><td class="num">100–200</td><td class="num">&gt; 200–400</td><td class="num">&gt; 400</td></tr>
  <tr><td>Budesonide</td><td class="num">200–400</td><td class="num">&gt; 400–800</td><td class="num">&gt; 800</td></tr>
  <tr><td>Ciclesonide</td><td class="num">80–180</td><td class="num">&gt; 160–320</td><td class="num">&gt; 320</td></tr>
  <tr><td>Fluticasone furoate (DPI)</td><td class="num" colspan="2">100</td><td class="num">200</td></tr>
  <tr><td>Fluticasone propionate</td><td class="num">100–250</td><td class="num">&gt; 250–500</td><td class="num">&gt; 500</td></tr>
  <tr><td>Mometasone (pMDI)</td><td class="num" colspan="2">200–400</td><td class="num">&gt; 400</td></tr>
</table></div>
<h3>ไม่ใช้ยา</h3>
<p>Allergen immunotherapy · เลี่ยงสารก่อภูมิแพ้และมลภาวะ · หยุดบุหรี่/บุหรี่ไฟฟ้า · วัคซีนไข้หวัดใหญ่ทุกปี, PCV13/PPSV23 · ออกกำลังกาย · ลดน้ำหนัก 10%</p>` },
  ],
  // questions go to the question bank only (P3), tagged with this summary as their source
  questions: [
    {
      "case": "ผู้ป่วย 30 ปี 1 เดือนที่ผ่านมามีอาการกลางวันประมาณ 3 ครั้ง/สัปดาห์ ตอนกลางคืน 2 ครั้ง ใช้ยาบรรเทา 3–4 ครั้ง/สัปดาห์ ได้ Symbicort 160/4.5 1 สูด วันละ 2 ครั้ง และ salbutamol 2 puff prn · เคย admit ด้วย acute asthma 6 เดือนก่อน · PEFR 80% (ใช้ตอบข้อ 1–3) · ข้อมูล: budesonide ≥ 12 ปี low 180–600, medium 600–1200, high > 1200 µg",
      "q": "ประเมินการควบคุมโรคของผู้ป่วยรายนี้",
      "o": [
        "Uncontrolled asthma",
        "Controlled asthma",
        "Intermittent asthma",
        "Mild asthma"
      ],
      "a": 0
    },
    {
      "q": "ข้อใดเป็น risk factor ของ exacerbation ในผู้ป่วยรายนี้",
      "o": [
        "ค่า PEFR ที่วัดได้",
        "Salbutamol ครั้งละ 2 puff 3–4 ครั้ง/สัปดาห์",
        "เคย admit 1 ครั้งเมื่อ 6 เดือนก่อนด้วย acute asthmatic attack",
        "อาการหายใจเสียงวี้ด แน่นหน้าอก"
      ],
      "a": 2
    },
    {
      "q": "ข้อใดถูกเกี่ยวกับยาที่ผู้ป่วยได้รับ",
      "o": [
        "ICS ที่ได้เป็น low-dose ICS",
        "ยาที่ได้อยู่ใน step 1 จาก 5",
        "การสูด inhaler ทั้งสองต้องสูดเร็ว แรง ลึก แบบเดียวกัน",
        "Formoterol เป็น LABA ออกฤทธิ์ยาวและ onset ช้า"
      ],
      "a": 0
    },
    {
      "q": "ผู้ป่วย exercise-induced asthma ควรใช้ยาใดก่อนออกกำลังกาย ~15 นาที",
      "o": [
        "Salbutamol inhaler",
        "Budesonide inhaler",
        "Prednisolone tablet",
        "Tiotropium inhaler"
      ],
      "a": 0
    },
    {
      "case": "ชาย 45 ปี หอบเหนื่อย HR 101 RR 24 ได้ fenoterol/ipratropium NB q15 min ×3 · admit ปีนี้ 3 ครั้ง · ยาประจำ: salbutamol MDI prn, budesonide/formoterol 160/4.5 2 puff bid, <b>propranolol 10 mg</b> (ใช้ตอบข้อ 5–7)",
      "q": "หลังได้ออกซิเจน 24 ชม. ผู้ป่วยควรได้ยาใด",
      "o": [
        "Theophylline SR",
        "Montelukast",
        "Systemic corticosteroid",
        "ยาปฏิชีวนะ"
      ],
      "a": 2
    },
    {
      "q": "ข้อใดถูกต้อง",
      "o": [
        "Budesonide + formoterol ใช้ควบคุมอาการ",
        "Budesonide + formoterol ออกฤทธิ์ไวกว่า ipratropium + fenoterol",
        "ห้ามใช้ ipratropium + fenoterol ใน exacerbation",
        "Budesonide + formoterol ไม่ทำให้เกิดเชื้อราในช่องปาก"
      ],
      "a": 0
    },
    {
      "q": "ผู้ป่วยควรได้รับยาต่างจากเดิมอย่างไรหลังออกจากโรงพยาบาล",
      "o": [
        "เพิ่ม tiotropium handihaler 1 puff OD",
        "ให้ prednisolone",
        "ให้ antibiotic",
        "หยุด propranolol"
      ],
      "a": 0
    }
  ],
}
