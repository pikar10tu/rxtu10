// Herpes (HSV, zoster, varicella) — converted from the RxTU10 class summary PDF (see content/summaries/manifest.json)
export default {
  id: 'herpes',
  date: '28/07/2569',
  refs: [
    'American Academy of Dermatology Association. Herpes simplex; Shingles. 2017',
    'HAAMOR.com. เริม (Herpes simplex); วัคซีนงูสวัด (Zoster vaccine)',
    'POBPAD. อีสุกอีใส. 2017',
    'WebMD. Herpes simplex virus type 1; type 2',
    'Medscape. Herpes zoster (article 1132465)',
  ],
  sections: [
    { id: 'hsv', t: 'เริม (Herpes simplex)', html: `<p>ครอบคลุม 3 โรค: เริม · งูสวัด · อีสุกอีใส</p>
<ul>
  <li>ไวรัสตระกูล Herpesviridae · <b>HSV-1</b> ปาก ริมฝีปาก ช่องปาก ใบหน้า · <b>HSV-2</b> อวัยวะสืบพันธุ์เป็นหลัก · ทั้งสองก่อโรคได้ทั้งสองบริเวณ (เช่น oral sex ทำให้ genital herpes จาก HSV-1)</li>
  <li><mark>ไม่หายขาด</mark> หลังติดเชื้อครั้งแรกไวรัสฝังอยู่ใน sensory ganglia ตลอดชีวิต กลับมาเป็นซ้ำได้</li>
  <li><b>Risk:</b> immunocompromise · เด็กที่เป็น eczema · ทารกติดจากแม่ · เคยเป็นมาก่อน · เพศสัมพันธ์กับผู้ติดเชื้อ · บุคลากรการแพทย์/ทันตกรรม (HSV-1)</li>
  <li><b>กระตุ้นการเป็นซ้ำ:</b> เครียด ร่างกายอ่อนแอ พักผ่อนไม่พอ แดดจัด ช่วงมีประจำเดือน หลังผ่าตัด</li>
  <li><b>การติดต่อ:</b> สัมผัสใกล้ชิด ใช้แปรงสีฟัน แก้ว หลอดร่วมกัน จูบ</li>
</ul>
<figure><img data-fig="herpes/p01-1.webp" alt="ตุ่มน้ำใสเป็นกลุ่มที่ริมฝีปากจาก HSV-1"><figcaption>HSV-1 ที่ริมฝีปาก</figcaption></figure>
<figure><img data-fig="herpes/p01-2.webp" alt="ตุ่มน้ำใสเป็นกลุ่มบนผิวหนังจาก HSV-2"><figcaption>HSV-2</figcaption></figure>
<h3>Diagnosis</h3>
<ul>
  <li>ลักษณะรอยโรค · Tzanck smear (multinucleated giant cells — ไม่จำเพาะ พบทั้ง HSV และ VZV) · DFA, viral culture, PCR, histology</li>
</ul>
<h3>อาการ</h3>
<ol>
  <li>ก่อนเกิดตุ่ม 1–2 วัน ปวดแสบ ร้อน คัน (prodromal) → <b>ตุ่มน้ำใสเป็นกลุ่ม (2–10 เม็ด)</b> → แตก → ตกสะเก็ด</li>
  <li><b>Primary infection:</b> รุนแรงกว่า อยู่นาน 2–20 วัน หายเองได้ อาจมีไข้ ปวดเมื่อย ต่อมน้ำเหลืองโต · genital herpes ปวดแสบขณะปัสสาวะ · herpes keratitis ปวดตา ไวต่อแสง น้ำตาไหล เสี่ยงแผลเป็น/สูญเสียการมองเห็น</li>
  <li><b>Recurrent:</b> ไม่รุนแรงเท่าครั้งแรก หายไวกว่า</li>
</ol>
<h3>Pharmacotherapy</h3>
<div class="tbl"><table>
  <tr><th></th><th>Primary (ให้ยาต้านไวรัสทุกราย)</th><th>Recurrent (รุนแรง/บ่อย/กระทบชีวิต/ภูมิบกพร่อง/มีภาวะแทรกซ้อน)</th></tr>
  <tr><td>Acyclovir</td><td class="num">400 mg tid หรือ 200 mg 5 ครั้ง/วัน × 7–10 วัน</td><td class="num">400 mg bid 5 วัน</td></tr>
  <tr><td>Famciclovir</td><td class="num">500 mg tid × 7–10 วัน</td><td class="num">250 mg bid 3 วัน</td></tr>
  <tr><td>Valacyclovir</td><td class="num">1,000 mg bid × 7–10 วัน</td><td class="num">1,000 mg OD 7–10 วัน</td></tr>
  <tr><td>รุนแรง</td><td>IV acyclovir 5 mg/kg q8h + IV fluids</td><td></td></tr>
</table></div>
<ul>
  <li><mark>เป็นซ้ำบ่อย (&gt; 6 ครั้ง/ปี): acyclovir 400 mg bid นาน 1 ปี (chronic suppressive)</mark></li>
  <li>ป้องกัน: ไม่แคะ แกะ เกาตุ่มน้ำ (ติดเชื้อแบคทีเรียซ้ำ)</li>
</ul>` },
    { id: 'zoster', t: 'งูสวัด (Herpes zoster)', html: `<ul>
  <li>VZV (HHV-3) กำเริบซ้ำในคนที่เคยเป็นอีสุกอีใส เชื้อแฝงที่ sensory ganglia กำเริบเมื่อภูมิคุ้มกันตก</li>
  <li><b>Risk:</b> อายุมาก · มะเร็ง (เช่น lymphoma), chemotherapy/radiotherapy · HIV · ยากดภูมิ · เคยผ่าตัดกระดูกสันหลัง</li>
  <li><b>Diagnosis:</b> viral culture · Tzanck smear (แยกจาก HSV ไม่ได้) · PCR · immunofluorescent antigen staining · VZV-specific IgM</li>
</ul>
<h3>3 ระยะ (ตาม dermatome เดียว มักไม่ข้ามกึ่งกลางลำตัว)</h3>
<ol>
  <li><b>Prodromal:</b> tingling คัน ปวดแบบเจาะ/เหมือนมีดก่อนผื่นขึ้น</li>
  <li><b>Acute:</b> ไข้ต่ำ อ่อนเพลีย ปวดหัว + ผื่นตาม dermatome · ผื่นแดงนูน → ตุ่มน้ำใสเป็นกลุ่ม → ตุ่มหนอง/เลือดออกใน 3–4 วัน → ตกสะเก็ดใน 14–21 วัน</li>
  <li><b>Chronic:</b> <b>postherpetic neuralgia (PHN)</b> ปวดตามเส้นประสาทหลังผื่นหาย</li>
</ol>
<h3>Pharmacotherapy</h3>
<div class="key"><strong class="k">72 ชั่วโมง</strong>ยาต้านไวรัสต้องเริ่มภายใน 72 ชม. หลังผื่นขึ้น จึงได้ผลดีที่สุด (ลดอาการ เร่งการหาย ลด PHN)</div>
<ul>
  <li><b>Acute (first line):</b> valacyclovir 1,000 mg tid 7 วัน · famciclovir 500 mg tid 7 วัน · <b>acyclovir 800 mg q4h (5 ครั้ง/วัน) 7 วัน</b> (ขนาดสูงกว่าเริมชัดเจน)</li>
  <li>ร่วมยาแก้ปวด (paracetamol, NSAIDs, opioids)</li>
  <li><mark>Corticosteroid: ประโยชน์ต่อ PHN ไม่ชัด ถ้าใช้ต้องคู่ยาต้านไวรัสเสมอ ห้ามให้เดี่ยว</mark></li>
  <li><b>PHN:</b> amitriptyline 25 mg ก่อนนอน · lidocaine patch 5% (หลังผื่นตกสะเก็ด) · gabapentin 100–600 mg tid · pregabalin 50–100 mg tid · opioids, capsaicin cream เป็น adjunct</li>
  <li><b>ป้องกัน:</b> herpes zoster vaccine ลดการเกิดงูสวัดและ PHN ได้ปานกลาง แนะนำในอายุ ≥ 60 ปี</li>
  <li><b>Patient education:</b> ผื่นหายใน 2–3 สัปดาห์ · ระวัง dissemination ถ้ามีไข้/ผื่นลามมาก · เฝ้าระวัง PHN · แพร่เชื้อ (เป็นอีสุกอีใส) ให้คนที่ไม่เคยเป็นได้ผ่านการสัมผัสรอยโรค</li>
</ul>` },
    { id: 'varicella', t: 'อีสุกอีใส (Varicella)', html: `<ul>
  <li>VZV ครั้งแรก (primary) DNA virus ผื่นคันทั่วตัว บ่อยในเด็ก &lt; 15 ปี · เป็นแล้วมีภูมิตลอดชีวิต แต่เชื้อแฝงและกลายเป็นงูสวัดภายหลังได้</li>
  <li><b>Risk:</b> เด็ก &lt; 15 ปี · ผู้ใหญ่ที่ไม่เคยเป็น (รุนแรงกว่า) · สัมผัสใกล้ชิด/ทางลมหายใจ</li>
  <li><b>กลุ่มเสี่ยงรุนแรง:</b> อายุ &gt; 12 ปี, <b>secondary household case</b>, โรคผิวหนัง/หัวใจ-ปอดเรื้อรัง, ใช้ steroid เป็นระยะ, ใช้ salicylate เรื้อรัง (Reye syndrome)</li>
  <li><b>Diagnosis:</b> Tzanck smear (multinucleated giant cells) · แยกเชื้อจาก tissue culture · วินิจฉัยหลักจากอาการ</li>
</ul>
<h3>อาการ</h3>
<ul>
  <li>Incubation ~14–15 วัน · เข้าทาง nasopharynx/conjunctiva</li>
  <li>อาการนำ 1–2 วัน: ไข้ต่ำ (37.5–39.4 °C) ครั่นเนื้อครั่นตัว อ่อนเพลีย ปวดหัว เบื่ออาหาร</li>
  <li>ผื่นแดงทั่วตัว → ตุ่มน้ำใสใน 2–4 วัน → คัน → ตกสะเก็ด ~1 สัปดาห์ · <mark>ลักษณะเด่น: ผื่นหลายระยะพร้อมกันในบริเวณเดียวกัน</mark> (macule, papule, vesicle, crust)</li>
  <li>เคยได้วัคซีนแล้วยังเป็นได้ แต่อาการน้อยลง</li>
</ul>
<h3>Pharmacology</h3>
<ul>
  <li><b>Acyclovir:</b> ลดระยะไข้และ viral shedding ได้ผลสูงสุดเมื่อเริ่มภายใน ≤ 24 ชม. แรก</li>
  <li><b>VZIG:</b> passive immunization สำหรับผู้สัมผัสที่เสี่ยงสูง</li>
  <li><b>Varicella vaccine (Varivax):</b> live attenuated active immunization ผู้ที่ไม่เคยเป็น อายุ ≥ 12 เดือน</li>
</ul>
<h3>Treatment</h3>
<ul>
  <li><b>First line:</b> paracetamol ลดไข้ (<mark>หลีกเลี่ยง aspirin ในเด็ก — Reye syndrome</mark>) · calamine lotion หรือ antihistamine ลดคัน</li>
  <li><b>Acyclovir</b> (กลุ่มเสี่ยง วัยรุ่น ผู้ใหญ่ อาการรุนแรง): เด็ก 2–12 ปี 20 mg/kg/dose (max 800 mg) วันละ 5 ครั้ง 7 วัน · ผู้ใหญ่ 800 mg วันละ 5 ครั้ง 7 วัน</li>
  <li>IV acyclovir 10 mg/kg q8h: ภูมิบกพร่องหรือมีโรคร่วม (pneumonia, encephalitis)</li>
  <li>ภูมิบกพร่อง: VZIG ภายใน 96 ชม. หลังสัมผัส ถ้าเกิน 4 วันรอผื่นขึ้นแล้วให้ acyclovir 500 mg/m²/day q8h 7 วัน</li>
  <li><b>Second line:</b> famciclovir 500 mg tid 7–10 วัน · valacyclovir 1 g tid 7–10 วัน (ผู้ใหญ่)</li>
  <li><b>ป้องกัน:</b> ผู้สัมผัสที่ไม่มีภูมิเสี่ยงติดเชื้อนาน 21 วัน · active immunization ภายใน 72 ชม. หลังสัมผัสช่วยป้องกันหรือลดความรุนแรง</li>
</ul>` },
  ],
  questions: [
    { q: 'หญิง 24 ปี ตุ่มน้ำใสเป็นกลุ่มที่ริมฝีปาก 5 เม็ด ปวดแสบร้อน คัน มา 1 วัน ไม่เคยเป็นมาก่อน ควรได้ยาใด ขนาดและระยะเวลาใด', o: ['Acyclovir 400 mg tid × 7–10 วัน', 'Acyclovir cream 5%', 'Valacyclovir 1,000 mg tid × 7 วัน', 'ไม่ต้องรักษา รอผื่นหายเอง'], a: 0, e: 'Primary HSV infection ต้องให้ยาต้านไวรัส systemic ทุกราย (รุนแรง/นานกว่า recurrent ลด viral shedding) · acyclovir 400 mg tid หรือ 200 mg 5 ครั้ง/วัน 7–10 วัน · ข้อ C เป็นขนาดสำหรับงูสวัด' },
    { q: 'ชาย 68 ปี ผื่นแดงตุ่มน้ำใสเรียงเป็นแนวข้างลำตัวขวา ไม่ข้ามกึ่งกลาง ปวดแสบร้อนนำมาก่อน 2 วัน ข้อใดถูกต้องเกี่ยวกับการรักษา', o: ['ควรเริ่มยาต้านไวรัสภายใน 72 ชั่วโมงหลังผื่นขึ้น เพื่อลด PHN', 'ให้ corticosteroid เดี่ยวเพื่อลดการอักเสบ', 'ไม่ต้องให้ยาต้านไวรัสเพราะหายเอง', 'ให้ acyclovir ขนาดเดียวกับรักษาเริม'], a: 0, e: 'งูสวัดต้องเริ่มยาต้านไวรัสภายใน 72 ชม. ลดความรุนแรง เร่งการหาย ลด PHN · valacyclovir 1,000 mg tid, famciclovir 500 mg tid หรือ acyclovir 800 mg q4h × 7 วัน (สูงกว่าเริม) · steroid ห้ามให้เดี่ยว' },
    { q: 'เด็กหญิง 6 ปี ไข้ต่ำ อ่อนเพลีย ผื่นแดงและตุ่มน้ำใสทั่วตัวหลายระยะพร้อมกัน มารดาถามเรื่องยาลดไข้ ยาใดควรหลีกเลี่ยงและเพราะอะไร', o: ['Paracetamol — hepatotoxicity', 'Ibuprofen — GI bleeding', 'Aspirin — Reye\'s syndrome', 'Antihistamine — sedation รุนแรง'], a: 2, e: 'เด็กที่เป็นอีสุกอีใส (หรือไข้หวัดใหญ่) ห้ามให้ aspirin เพราะเสี่ยง Reye\'s syndrome ซึ่งรุนแรงต่อตับและสมอง ให้ paracetamol แทน' },
    { q: 'ชาย 16 ปี ไม่มีโรคประจำตัว สัมผัสใกล้ชิดน้องชายที่เป็นอีสุกอีใส ต่อมามีไข้ต่ำและผื่นทั่วตัว ควรได้ acyclovir หรือไม่', o: ['ไม่ควร เพราะอายุน้อยกว่า 18 ปี', 'ควร เพราะอายุ > 12 ปี และเป็น secondary household case ซึ่งมักรุนแรงกว่า', 'ควรเฉพาะเมื่อมีภาวะแทรกซ้อนทางปอด', 'ไม่จำเป็น เพราะเคยสัมผัสเชื้อมาแล้วจะมีภูมิ'], a: 1, e: 'กลุ่มเสี่ยงที่ควรได้ oral acyclovir: อายุ > 12 ปี, secondary household case, โรคผิวหนัง/หัวใจ-ปอดเรื้อรัง, ใช้ steroid เป็นระยะ, ใช้ salicylate เรื้อรัง · รายนี้เข้าเกณฑ์ทั้งอายุและ secondary case' },
    { q: 'ชาย 45 ปี genital herpes กลับเป็นซ้ำ 8 ครั้งในปีที่ผ่านมา กระทบคุณภาพชีวิต การรักษาที่เหมาะสมที่สุดคือ', o: ['Episodic therapy เฉพาะเมื่อมีอาการ', 'Chronic suppressive therapy ด้วย acyclovir 400 mg bid นาน 1 ปี', 'ไม่ต้องรักษาเพราะไม่หายขาดอยู่แล้ว', 'ให้ Zostavax ป้องกันการกลับเป็นซ้ำ'], a: 1, e: 'กลับเป็นซ้ำบ่อย (> 6 ครั้ง/ปี) แนะนำ chronic suppressive therapy acyclovir 400 mg bid 1 ปี · Zostavax ใช้ป้องกันงูสวัด ไม่เกี่ยวกับเริม' },
  ],
}
