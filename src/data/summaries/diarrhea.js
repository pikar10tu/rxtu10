// Diarrhea, constipation, hemorrhoid — converted from the RxTU10 class summary PDF (see content/summaries/manifest.json)
// ข้อสอบในต้นฉบับมีเฉพาะท้องผูก (ดัดแปลงจากรอบ 2/2561)
export default {
  id: 'diarrhea',
  date: '21/7/69',
  refs: [
    'สมาคมแพทย์ระบบทางเดินอาหารแห่งประเทศไทย. แนวทางการดูแลรักษาผู้ป่วยโรคอุจจาระร่วงเฉียบพลันในผู้ใหญ่. 2554.',
    'American College of Gastroenterology. Diarrheal diseases – acute & chronic.',
    'กรมแพทย์ทหารบก. แนวทางเฝ้าระวัง สอบสวน ป้องกันและควบคุมโรคอุจจาระร่วงเฉียบพลัน. 2568 · กองระบาดวิทยา. สถานการณ์โรคอุจจาระร่วงและอาหารเป็นพิษ. 2568',
    'Shane AL, et al. 2017 IDSA clinical practice guidelines for the diagnosis and management of infectious diarrhea. Clin Infect Dis. 2017;65(12):e45–e80.',
    'Sathienluckana T, et al. Treatment guidance of acute diarrhea for community pharmacist. Isan J Pharm Sci. 2018;14(4):1-12.',
    'DiPiro JT, et al. Pharmacotherapy Handbook. 11th ed. 2021.',
    'ประยุทธ ภูวรัตนาวิวิธ. การจัดการภาวะท้องร่วงเฉียบพลันในบริบทงานเภสัชกรรมชุมชน. วารสารเภสัชกรรมไทย 2567;16(1) · การบริบาลทางเภสัชกรรมสำหรับผู้ป่วยริดสีดวงทวาร. 2566;15(4)',
    'Andrews CN, Storr M. The pathophysiology of chronic constipation. Can J Gastroenterol. 2011;25(Suppl B):16B-21B.',
    'แนวทางเวชปฏิบัติการดูแลรักษาผู้ป่วยท้องผูกเรื้อรังในประเทศไทย พ.ศ. 2564 · สุเทพ กลชาญวิทย์. ท้องผูก. 2565',
    'ราชวิทยาลัยศัลยแพทย์แห่งประเทศไทย. CPG ริดสีดวงทวาร · UpToDate: Treatment of hemorrhoids',
  ],
  sections: [
    { id: 'diarrhea', t: 'ท้องร่วง: นิยามและสาเหตุ', html: `<ul>
  <li><b>Acute diarrhea in adults:</b> อายุ ≥ 15 ปี ถ่ายเหลว/เป็นน้ำ <b>≥ 3 ครั้งใน 24 ชม.</b> หรือถ่ายมูกเลือด ≥ 1 ครั้ง เกิดเฉียบพลัน ไม่เกิน 2 สัปดาห์ ไม่มีประวัติเป็น ๆ หาย ๆ</li>
  <li><b>Rome IV:</b> ถ่ายเหลว/เป็นน้ำ ≥ 25% ของการถ่ายปกติ, ≥ 3 ครั้ง/วัน หรือมากกว่าปกติ หรือถ่ายปนเลือด ≥ 1 ครั้ง</li>
</ul>
<div class="tbl"><table>
  <tr><th>ชนิด</th><th>ระยะเวลา</th><th>สาเหตุ</th></tr>
  <tr><td>Acute (พบบ่อยสุด)</td><td>&lt; 2 สัปดาห์</td><td>ไวรัส แบคทีเรีย โปรโตซัว หรืออาหารเป็นพิษจาก preformed toxin</td></tr>
  <tr><td>Persistent</td><td>2–4 สัปดาห์</td><td>โปรโตซัว แบคทีเรีย หรือ post-infection IBS, IBD</td></tr>
  <tr><td>Chronic</td><td>&gt; 4 สัปดาห์</td><td>ติดเชื้อหรือ IBS, IBD · <b>ควรส่งต่อ</b></td></tr>
</table></div>
<p><b>Epidemiology:</b> พ.ศ. 2556–2565 อัตราป่วย &gt; 1,000 ต่อแสน · ล่าสุด 48,450 ราย (74.64 ต่อแสน) พบมากอายุ 0–4 ปี, ≥ 60 ปี, 20–29 ปี</p>
<h3>สาเหตุ</h3>
<ul>
  <li><b>ติดเชื้อ:</b> ไวรัส (norovirus, rotavirus) · แบคทีเรีย (V. cholerae, E. coli, Shigella, Salmonella, C. jejuni) · โปรโตซัว (Giardia, Cryptosporidium)</li>
  <li><b>ไม่ติดเชื้อ:</b> ยา (ยาระบาย antacid ที่มี Mg ยาปฏิชีวนะ metformin colchicine) · อาหารรสจัด · preformed toxin ในอาหาร</li>
</ul>
<figure><img data-fig="diarrhea/p03-2.webp" alt="ตาราง drugs causing diarrhea: laxatives, Mg antacids, antineoplastics, antibiotics, antihypertensives, cholinergics, cardiac agents, NSAIDs, misoprostol, colchicine, PPI, H2 blockers"><figcaption>Drugs causing diarrhea (Pharmacotherapy Handbook)</figcaption></figure>
<h3>ตามอาการนำเด่น</h3>
<ol>
  <li><b>อาเจียนเด่น:</b> อาหารเป็นพิษจาก preformed toxin (C. perfringens, S. aureus, B. cereus) เกิดใน 2–7 ชม. หายเองใน 48–72 ชม. · ไวรัส rotavirus (90% ในเด็ก &lt; 5 ปี) norovirus (ทุกวัย) ไข้ต่ำ ปวดหัว ปวดเมื่อย</li>
  <li><b>อุจจาระร่วงเด่น:</b>
    <ul>
      <li><b>Watery:</b> toxin กระตุ้นการหลั่งน้ำที่ลำไส้เล็กส่วนบน ไม่มีการอักเสบของเยื่อบุ · V. cholerae, ETEC, EPEC, rotavirus, norovirus, Giardia, Cryptosporidium · <mark>อาการน้อยไม่ต้องใช้ยาปฏิชีวนะ</mark></li>
      <li><b>Bloody:</b> แบคทีเรียทำลายเยื่อบุ ileocolon ไข้ ปวดเบ่ง (tenesmus) · Shigella, Salmonella, C. jejuni, Yersinia, C. difficile, STEC</li>
    </ul>
  </li>
</ol>
<h3>Pathophysiology</h3>
<p>4 กลไก: ion transport (ดูดซึม Na⁺ ลด/หลั่ง Cl⁻ เพิ่ม) · intestinal motility · luminal osmolarity · tissue hydrostatic pressure</p>
<div class="tbl"><table>
  <tr><th>ชนิด</th><th>กลไก</th><th>อดอาหาร</th></tr>
  <tr><td>Osmotic</td><td>ดูดซึมสารอาหารไม่ได้ น้ำค้างในลำไส้ (malabsorption, แพ้ lactose, Mg²⁺, lactulose)</td><td><b>หยุด</b></td></tr>
  <tr><td>Secretory</td><td>VIP, steatorrhea, ยาระบาย, secretin, toxin, เกลือน้ำดี → cAMP↑ ยับยั้ง Na⁺/K⁺-ATPase หลั่งสารมากขึ้น</td><td><b>ไม่หยุด</b></td></tr>
  <tr><td>Exudative</td><td>เยื่อบุเสียหาย หลั่งมูก โปรตีน เลือด</td><td></td></tr>
  <tr><td>Altered transit</td><td>contact time ลด, colon ขับเร็ว, bacterial overgrowth</td><td></td></tr>
</table></div>` },
    { id: 'diarrheatx', t: 'ท้องร่วง: การรักษา', html: `<figure><img data-fig="diarrhea/p06-1.webp" alt="แผนภาพการรักษา acute และ chronic diarrhea ตาม Pharmacotherapy Handbook"><figcaption>Recommendations for treating acute diarrhea (Pharmacotherapy Handbook)</figcaption></figure>
<figure><img data-fig="diarrhea/p06-3.webp" alt="แนวทางการรักษาโรคอุจจาระร่วงเฉียบพลันในผู้ใหญ่และเด็กอายุมากกว่า 5 ปีสำหรับเภสัชกรชุมชน แยกตามอาการนำเด่น ไข้ และประวัติเดินทาง"><figcaption>Treatment guidance of acute diarrhea for community pharmacist (ผู้ใหญ่และเด็ก &gt; 5 ปี)</figcaption></figure>
<div class="key"><strong class="k">ส่งต่อสถานพยาบาล</strong>อุจจาระมูกเลือด + ไม่มีไข้/ไข้ต่ำ (&lt; 38.5 °C) · ถ่ายเหลว ไม่มีประวัติเดินทาง และไข้สูง ≥ 38.5 °C นานกว่า 72 ชม. · อาการเข้าได้กับ cholera (ถ่ายน้ำซาวข้าวปริมาณมาก พุ่ง ไม่ปวดท้อง)</div>
<h3>ไม่ใช้ยา: สารน้ำทดแทน</h3>
<p>ทุกรายควรได้สารน้ำทดแทน รูปแบบตามความรุนแรง</p>
<div class="tbl"><table>
  <tr><th></th><th>น้อย</th><th>ปานกลาง</th><th>มาก</th></tr>
  <tr><td>อาการทั่วไป</td><td>ตื่นตัวดี</td><td>อ่อนเพลีย ซึม ยังนั่ง/เดินได้ (เด็กหงุดหงิด)</td><td>อ่อนเพลียมาก นั่ง/เดินไม่ได้ สติเปลี่ยน</td></tr>
  <tr><td>กิจวัตร</td><td>ปกติ</td><td>ทำได้แต่ยากขึ้น</td><td>ทำไม่ได้</td></tr>
  <tr><td>กระหายน้ำ / ปากลิ้น</td><td>ปกติ</td><td>กระหาย / แห้งเล็กน้อย</td><td>กระหายมาก / แห้งมาก</td></tr>
  <tr><td>ผิวหนัง / เบ้าตา</td><td>ปกติ</td><td>ยังตึงพอควร / ลึกเล็กน้อย</td><td>เสียความตึง / ลึกชัด</td></tr>
  <tr><td>HR* / BP*</td><td>ปกติ</td><td>เร็ว / ปกติหรือ SBP ลด 10–20 mmHg</td><td>เร็ว / SBP ลด &gt; 20 mmHg</td></tr>
  <tr><td>Orthostatic hypotension*</td><td>ไม่พบ</td><td>อาจพบ</td><td>พบ</td></tr>
</table></div>
<p style="font-size:.9em">* เด็ก &lt; 5 ปี อาจไม่ใช้อาการเหล่านี้ประเมิน</p>
<ul>
  <li>เสียน้ำไม่มาก: <b>ORS 1.5–2 เท่าของอุจจาระที่ถ่าย</b> ค่อย ๆ จิบ</li>
  <li>กินไม่ได้/อาเจียนมาก: IV Ringer lactate หรือ Acetar</li>
  <li>Severe dehydration: ให้ครึ่งหนึ่งของปริมาณที่ต้องการใน 4 ชม. แรก (หรือ 100 mL/kg) ที่เหลือภายใน 24 ชม.</li>
</ul>
<h3>ใช้ยาตามอาการนำเด่น</h3>
<ul>
  <li><b>อาเจียนเด่น:</b> ไม่ต้องใช้ยาปฏิชีวนะ · ORT + ยาตามอาการ (ต้านอาเจียน บรรเทาท้องร่วง แก้ปวดเกร็ง)</li>
  <li><b>Watery diarrhea:</b>
    <ul>
      <li>รุนแรงน้อย: หายเอง ORT + racecadotril/loperamide/diosmectite, hyoscine</li>
      <li>ปานกลาง: มีประวัติเดินทาง → ORT + ยาปฏิชีวนะ ± loperamide · ไม่มีประวัติเดินทาง ไข้ต่ำ → ORT + ยาตามอาการ · ไข้สูง ≤ 72 ชม. → ORT + ยาตามอาการและติดตาม · &gt; 72 ชม. → ส่งต่อ</li>
    </ul>
  </li>
  <li><b>Bloody diarrhea:</b> ไม่มีไข้/ไข้ต่ำ → <b>ส่งต่อทันที</b> · ไข้สูง ไม่มีประวัติเดินทาง (Shigella) → <b>norfloxacin</b> · มีประวัติเดินทาง → ORT + ยาปฏิชีวนะ ± loperamide</li>
  <li><b>สมุนไพร:</b> สะระแหน่ มะเขือยาว ใบฝรั่ง กล้วยดิบ ขิง ทับทิม เปลือกมังคุด ขมิ้นชัน · บัญชียาหลัก: ยาเหลืองปิดสมุทร ยาธาตุบรรจบ ฟ้าทะลายโจร · ใช้ร่วม ORS เสมอ</li>
</ul>
<h3>ยาปฏิชีวนะ</h3>
<div class="tbl"><table>
  <tr><th>ยา</th><th>ขนาด</th><th>ข้อแนะนำ</th></tr>
  <tr><td colspan="3"><b>มูกเลือด + ไข้ ≥ 38.5 °C</b></td></tr>
  <tr><td>Norfloxacin (ผู้ใหญ่)</td><td>400 mg BID 3–5 วัน</td><td><b>อันดับแรก</b></td></tr>
  <tr><td>Ciprofloxacin (ผู้ใหญ่)</td><td>500 mg BID 3 วัน</td><td>ทางเลือก</td></tr>
  <tr><td>Co-trimoxazole (เด็ก)</td><td>50 mg/kg/day (sulfamethoxazole) BID 3–5 วัน</td><td>อันดับแรกในพื้นที่ดื้อยาน้อย</td></tr>
  <tr><td>Norfloxacin (เด็ก)</td><td>15–20 mg/kg/day BID 3–5 วัน</td><td>พื้นที่ดื้อยา</td></tr>
  <tr><td>Azithromycin (เด็ก)</td><td>10 mg/kg OD 3 วัน</td><td>พื้นที่ดื้อยา</td></tr>
  <tr><td colspan="3"><b>Traveler's diarrhea</b> (ทั่วโลก ETEC · ไทย/เอเชียตะวันออกเฉียงใต้ <b>Campylobacter</b>)</td></tr>
  <tr><td>Azithromycin</td><td>500 mg OD 3 วัน หรือ 1 g ครั้งเดียว</td><td><mark>อันดับแรกในไทย</mark> (ดีต่อ Campylobacter)</td></tr>
  <tr><td>Ciprofloxacin</td><td>500 หรือ 750 mg OD 1–3 วัน</td><td>ได้ผลดี ยกเว้น Campylobacter</td></tr>
</table></div>
<h3>ORS</h3>
<div class="tbl"><table>
  <tr><th></th><th>สูตรมาตรฐาน</th><th>สูตรลดความเข้มข้น (RO)</th></tr>
  <tr><td>Osmolarity</td><td class="num">~311 mmol/L</td><td class="num">~245 mmol/L</td></tr>
  <tr><td>Glucose / Na / Cl / K / citrate</td><td class="num">111 / 90 / 80 / 20 / 10</td><td class="num">75 / 75 / 65 / 20 / 10</td></tr>
  <tr><td>เหมาะกับ</td><td>cholera</td><td>ไวรัส · ลดอาเจียน อุจจาระ ระยะโรค IV fluid ได้ดีกว่า ไม่ทำ hypernatremia</td></tr>
</table></div>
<h3>ยาบรรเทาอาการ</h3>
<div class="tbl"><table>
  <tr><th>ยา</th><th>ขนาด</th><th>กลไก</th><th>ข้อควรระวัง</th></tr>
  <tr><td><b>Loperamide</b></td><td>4 mg แล้ว 2 mg ทุกครั้งที่ถ่าย <b>max 16 mg/วัน</b></td><td>μ-opioid agonist ยับยั้ง myenteric plexus</td><td><mark>ห้ามใช้ในท้องเสียจากการติดเชื้อ</mark> · CYP2C8, 3A4, P-gp substrate · ท้องผูก ง่วง รุนแรง: หัวใจเต้นผิดจังหวะ · ไม่แนะนำตั้งครรภ์/ให้นม · <b>ห้ามเด็ก &lt; 2 ปี</b></td></tr>
  <tr><td><b>Racecadotril</b></td><td>ผู้ใหญ่ 100–300 mg (ต้นฉบับ) วันละ 3 ครั้ง · เด็ก &lt; 9 kg 10 mg, 9–13 kg 20 mg, 13–27 kg 30 mg, &gt; 27 kg 60 mg วันละ 3 ครั้ง</td><td>ยับยั้ง enkephalinase → enkephalin ↑ กระตุ้น δ-opioid → cAMP ↓ ยับยั้งการหลั่งสารน้ำ</td><td>ไม่ยืด transit time · ไม่ผ่าน BBB · prodrug → thiorphan · ไม่ผ่าน CYP ไม่ใช่ P-gp substrate · ใช้ร่วม ORS ในเด็ก ≥ 3 เดือน</td></tr>
  <tr><td><b>Bismuth subsalicylate</b></td><td>ผู้ใหญ่และเด็ก &gt; 12 ปี 524 mg หรือ 30 mL ทุก 30–60 นาที ไม่เกิน 8 ครั้ง/วัน 2 วัน · 3–6 ปี 5 mL · 6–9 ปี 10 mL · 9–12 ปี 15 mL</td><td>antisecretory ต้านอักเสบ ฆ่าเชื้อ (H. pylori)</td><td>ห้ามแพ้ aspirin, ตั้งครรภ์ · ลิ้นและอุจจาระสีเทาดำ · ขนาดสูง salicylate toxicity · ลดการดูดซึม tetracycline, doxycycline</td></tr>
  <tr><td>Octreotide</td><td>100–600 mcg/day แบ่ง 2–4 ครั้ง SC 2 สัปดาห์</td><td>ยับยั้ง 5-HT และฮอร์โมน ยับยั้งการหลั่งสารน้ำ</td><td>PB 40–65% เมตาบอลิซึมที่ตับ</td></tr>
  <tr><td><b>Diosmectite</b></td><td>ผู้ใหญ่ 3 ซอง/วัน · เด็ก &gt; 2 ปี 2–3 ซอง · 1–2 ปี 1–2 ซอง · &lt; 1 ปี 1 ซอง (แบ่ง 2–3 ครั้ง)</td><td>ดูดซับสารพิษ เชื้อ จับ mucus กันเชื้อเกาะ ต้านอักเสบ</td><td>ไม่ดูดซึม ปลอดภัยสูง</td></tr>
  <tr><td>Activated charcoal</td><td>3 เม็ด วันละ 3–4 ครั้ง</td><td>พื้นผิวมาก ดูดซับสารพิษ</td><td>ท้องผูก อืด Na สูง K ต่ำ อุจจาระดำ ลำไส้อุดตัน · ให้ก่อนยาอื่น 1 ชม. หรือหลัง 2 ชม.</td></tr>
  <tr><td><b>Zinc sulfate</b></td><td>&lt; 6 เดือน 10 mg/วัน · 6 เดือน–5 ปี 20 mg/วัน 10–14 วัน</td><td>ลดระยะเวลาท้องเสีย</td><td>WHO แนะนำเด็กทุกรายในประเทศกำลังพัฒนา</td></tr>
</table></div>
<p><b>ยาเสริม:</b> ลดไข้ · hyoscine · domperidone (≥ 12 ปีและ &gt; 35 kg 10 mg ก่อนอาหาร 30 นาที tid max 30 mg/day · เด็ก 0.25 mg/kg · ระวัง QT) · metoclopramide (&gt; 18 ปี 10 mg tid max 30 mg/day · ระวัง EPS)</p>` },
    { id: 'constipation', t: 'ท้องผูก', html: `<p>ถ่ายน้อยกว่าปกติ (ปกติ 3 ครั้ง/วัน ถึง 3 ครั้ง/สัปดาห์) · ถ่าย &lt; 3 ครั้ง/สัปดาห์ ผิดปกติ · นานเกิน 3 เดือน = เรื้อรัง</p>
<p><b>Rome III:</b> ≥ 2 ข้อ นานกว่า 3 เดือน — ถ่าย &lt; 3 ครั้ง/สัปดาห์ · ต้องเบ่งมาก · อุจจาระแข็ง · ถ่ายไม่สุด · รู้สึกมีสิ่งอุดกั้น · ใช้นิ้วช่วย</p>
<p><b>Epidemiology:</b> คนไทย 24% คิดว่าท้องผูก แต่จริง ๆ เบ่งลำบาก ~8% ถ่าย &lt; 3 ครั้ง/สัปดาห์ ~3%</p>
<h3>สาเหตุ</h3>
<ol>
  <li><b>โรคทางกาย:</b> เบาหวาน hypothyroid hypercalcemia โรคประสาท (บาดเจ็บสมอง/ไขสันหลัง Parkinson's MS)</li>
  <li><b>ยา:</b> TCAs · anticholinergics (buscopan, levodopa, chlorpheniramine) · phenytoin · diltiazem, verapamil, clonidine · <b>opioids</b> (codeine) · เหล็ก · antacid Ca/Al · NSAIDs · furosemide, HCTZ · cholestyramine</li>
  <li><b>ลำไส้อุดกั้น:</b> มะเร็ง stricture volvulus rectocele rectal prolapse anal stenosis Hirschsprung's</li>
  <li><b>การทำงานผิดปกติ:</b> anismus, colonic inertia, IBS · ปัจจัยอื่น: เคลื่อนไหวน้อย กากน้อย นิสัยขับถ่าย</li>
</ol>
<p><b>Alarm features:</b> อายุ &gt; 50 · อุจจาระมีเลือด · ท้องผูกสลับท้องเสีย · ญาติสายตรงเป็นมะเร็งลำไส้ใหญ่ · เพิ่งเป็นไม่นาน</p>
<h3>Pathophysiology</h3>
<ul>
  <li><b>Normal transit (NTC):</b> พบบ่อยสุด ระยะเวลาปกติแต่ถ่ายลำบาก เกี่ยวกับจิตใจ ทับซ้อน IBS-C</li>
  <li><b>Slow transit (STC):</b> เคลื่อนช้า ดูดน้ำกลับมาก อุจจาระแห้งแข็ง</li>
  <li><b>Defecation disorder / pelvic floor dyssynergia:</b> puborectalis/หูรูดไม่คลาย หดสวนทางขณะเบ่ง ต้องใช้นิ้วช่วย</li>
</ul>
<figure><img data-fig="diarrhea/p19-1.webp" alt="แผนภูมิแนวทางรักษาผู้ป่วยท้องผูกเรื้อรัง: chronic constipation และ refractory constipation"><figcaption>แนวทางรักษาท้องผูกเรื้อรัง (Thailand Chronic Constipation Guideline 2021)</figcaption></figure>
<ul>
  <li><b>Chronic:</b> ตัดสาเหตุทุติยภูมิ · มี alarm ส่อง colonoscopy · lifestyle + conventional laxatives (อาการน้อยใช้ on-demand, ปานกลาง–รุนแรงใช้ต่อเนื่อง) · ตอบสนองลดถึงขนาดต่ำสุด · ไม่ตอบสนองตรวจ compliance ปรับยา</li>
  <li><b>Refractory:</b> สงสัย defecation disorder → anorectal physiologic studies · ไม่สงสัย → ยาใหม่ 1–2 สัปดาห์</li>
  <li><b>ไม่ใช้ยา:</b> กากใย + น้ำพอ · กาแฟพอเหมาะช่วย ชาอาจทำท้องผูก · โยเกิร์ต probiotic · ออกกำลังกาย · toileting routine (หลังตื่น หลังออกกำลังกาย หลังอาหาร/กาแฟ เมื่อมี urge) · ปรับท่านั่ง</li>
</ul>
<div class="tbl"><table>
  <tr><th>กลุ่ม / ยา</th><th>ขนาด</th><th>กลไก</th><th>ข้อควรระวัง</th></tr>
  <tr><td><b>Bulk:</b> psyllium</td><td>5–10 g OD</td><td>ดูดน้ำพองตัว เพิ่มปริมาตร กระตุ้นการบีบตัว</td><td>เริ่มต่ำ · อืดมากขึ้นได้ · ต้องดื่มน้ำพอ · <mark>ใช้ได้ในหญิงตั้งครรภ์และให้นม</mark></td></tr>
  <tr><td><b>Osmotic:</b> milk of magnesia</td><td>15–45 mL OD</td><td>ดึงน้ำเข้าลำไส้</td><td>ระวังไตบกพร่อง</td></tr>
  <tr><td>Polyethylene glycol</td><td>10–20 g OD</td><td>โมเลกุลใหญ่ยึดน้ำไว้</td><td></td></tr>
  <tr><td>Lactulose</td><td>15–30 mL วันละ 1–2 ครั้ง</td><td>แบคทีเรียย่อยเป็นกรดอินทรีย์ ดึงน้ำ</td><td>อืด ท้องโต</td></tr>
  <tr><td><b>Softener:</b> docusate</td><td>ผู้ใหญ่ 50–360 mg/วัน · เด็ก &lt; 3 ปี 10–40 mg/วัน</td><td>ลดแรงตึงผิวของอุจจาระ</td><td>คลื่นไส้ รสขม (ให้กับนม/น้ำผลไม้)</td></tr>
  <tr><td><b>Lubricant:</b> mineral oil</td><td>ผู้ใหญ่ 15–45 mL · เด็ก &gt; 6 ปี 10–15 mL ก่อนนอน</td><td>เคลือบอุจจาระ กันการดูดน้ำ</td><td>ขาดวิตามิน A, D, E, K · สำลักเข้าปอด (lipoid pneumonia)</td></tr>
  <tr><td><b>Stimulant:</b> bisacodyl</td><td>5–10 mg OD หลังอาหารเย็น/ก่อนนอน</td><td>กระตุ้นเส้นประสาทลำไส้ใหญ่ ลดการดูดน้ำ</td><td>ปวดท้อง ท้องเสีย · เลี่ยงใช้ต่อเนื่องนาน</td></tr>
  <tr><td>Senna</td><td>15–20 mg OD</td><td>sennosides → สารเร่งการบีบตัว + หลั่งน้ำ</td><td>เลี่ยงใช้ต่อเนื่องนาน</td></tr>
  <tr><td>Castor oil</td><td>ผู้ใหญ่ 15–60 mL · เด็ก 5–15 mL</td><td>ricinoleic acid กระตุ้นกล้ามเนื้อเรียบ</td><td>ให้ตอนท้องว่าง ไม่ให้ก่อนนอน (ออกฤทธิ์เร็ว)</td></tr>
  <tr><td><b>5-HT4 agonist:</b> prucalopride</td><td>2 mg OD</td><td>กระตุ้นการหลั่ง ACh เร่งการเคลื่อนไหวลำไส้ใหญ่</td><td>&gt; 65 ปีเริ่ม 1 mg · CrCl &lt; 30 ใช้ 1 mg · เลี่ยงในฟอกไต</td></tr>
  <tr><td><b>Cl⁻ channel activator:</b> lubiprostone</td><td>24 mcg BID พร้อมอาหาร</td><td>กระตุ้น ClC-2 หลั่งของเหลว</td><td>คลื่นไส้ ท้องเสีย ปวดท้อง</td></tr>
  <tr><td><b>IBAT inhibitor:</b> elobixibat</td><td>10 mg OD</td><td>ยับยั้งการดูดกลับกรดน้ำดีที่ terminal ileum</td><td>ปวดท้อง ท้องเสีย</td></tr>
  <tr><td><b>GC-C agonist:</b> linaclotide · plecanatide</td><td>72 หรือ 145 mcg OD · 3 mg OD</td><td>cGMP ↑ หลั่ง Cl⁻ HCO₃⁻ และน้ำ</td><td>ท้องเสีย</td></tr>
</table></div>
<div class="key"><strong class="k">Opioid-induced constipation</strong>ใช้ <b>stimulant laxative</b> (senna, bisacodyl) · ไม่ใช้ bulk-forming เพราะลำไส้ไม่บีบตัว อุจจาระอัดแน่นจนอุดตัน</div>` },
    { id: 'hemorrhoid', t: 'ริดสีดวงทวาร', html: `<ul>
  <li>แรงดันในทางเดินอาหารส่วนล่างมาก ทำให้ <b>anal cushion</b> (เบาะรองกันอุจจาระเล็ด) ยืดลงมาเป็นติ่งเนื้อ · <b>ภายใน</b> (ตั้งแต่รูทวารถึงปากทวาร ไม่มีติ่งยื่น) · <b>ภายนอก</b> (หลังปากทวาร ยื่นออกนอก)</li>
  <li><b>Epidemiology:</b> อเมริกาใต้และยุโรป 11% · เกาหลีพบมากในหญิงสูงอายุ 16.6% · ไทยยังไม่มีข้อมูล</li>
  <li><b>Risk:</b> เบ่งถ่าย นั่งถ่ายนาน ท้องผูก/ท้องเสียเรื้อรัง อ้วน ตั้งครรภ์ ไอเรื้อรัง ตับแข็ง</li>
</ul>
<figure><img data-fig="diarrhea/p26-1.webp" alt="ความต่างของริดสีดวงทวารภายในและภายนอก"><figcaption>ริดสีดวงภายใน (ไม่เจ็บ เลือดแดงสด) เทียบภายนอก (เจ็บ คลำได้ก้อน)</figcaption></figure>
<h3>อาการ</h3>
<ul>
  <li>เลือดแดงสดหยด/พุ่งขณะหรือหลังถ่าย ไม่มาก ไม่ปวด</li>
  <li>ก้อนปลิ้นขณะเบ่ง ยุบกลับเอง → ต้องดัน → ย้อยอยู่ตลอด</li>
  <li>ก้อนและปวดที่ขอบทวาร เกิดเร็วใน 24 ชม. เจ็บมาก 5–7 วันแรก (thrombosed)</li>
</ul>
<div class="tbl"><table>
  <tr><th>ระยะ</th><th>รายละเอียด</th></tr>
  <tr><td>1</td><td>เลือดสดหลังถ่าย ไม่มีติ่งยื่น เห็นได้จากส่องกล้องเท่านั้น</td></tr>
  <tr><td>2</td><td>โผล่เวลาเบ่ง <b>หดกลับเอง</b> คัน มีมูก</td></tr>
  <tr><td>3</td><td>โผล่เวลาเบ่ง ไอ จาม ยกของ ไม่หดเอง <b>ต้องใช้นิ้วดัน</b></td></tr>
  <tr><td>4</td><td>โผล่ตลอด ดันไม่กลับ เจ็บมาก อักเสบ แผลจากเสียดสี</td></tr>
</table></div>
<figure><img data-fig="diarrhea/p28-1.webp" alt="แผนภูมิการพิจารณารักษาริดสีดวงทวารสำหรับเภสัชกร"><figcaption>การพิจารณาให้การรักษาภาวะริดสีดวงทวาร</figcaption></figure>
<h3>การรักษา</h3>
<ol>
  <li><b>ปรับพฤติกรรม:</b> กากใย 25–35 g/วัน · sitz bath วันละ 2–3 ครั้ง (ไม่ให้ริดสีดวงภายนอกโดนภาชนะหรือถูกกดทับ)</li>
  <li><b>ยา</b> (ปัจจุบันใช้น้อยลง ผ่าตัด/หัตถการใช้มากกว่า) ครอบคลุมปวด อักเสบ เลือดออก มักเป็นสูตรผสม
    <ul>
      <li>ยาเฉพาะที่: corticosteroid + ยาชา (± framycetin, esculin) · <mark>ไม่ใช้นานเกิน 7 วัน</mark> · ผสมกับยาชาดีกว่า steroid เดี่ยว ติดตามการติดเชื้อ</li>
      <li>ยาชา: lidocaine, tribenoside + lidocaine (เลือกใช้) · tetracaine, cinchocaine, pramocaine (ระคายเคือง) · ระวังผิวบอบบาง เด็ก โรคหัวใจ hyperthyroid เบาหวาน CNS</li>
      <li>มีแผลแยก (anal fissure) ร่วม: ยาระบายทำให้อุจจาระนุ่ม เช่น docusate</li>
      <li><b>ยาเพิ่มการไหลเวียน (กิน):</b> flavonoid fraction + hesperidin <b>2 เม็ด วันละ 3 ครั้ง 4 วัน แล้ว 2 เม็ด วันละ 2 ครั้ง 3 วัน</b></li>
      <li>ยาต้านจุลชีพชนิดกินไม่มีหลักฐาน (ไม่ใช่โรคติดเชื้อ) · สงสัยติดเชื้อส่งแพทย์ทันที</li>
    </ul>
  </li>
</ol>
<div class="tbl"><table>
  <tr><th>ฤทธิ์</th><th>ตัวอย่าง</th></tr>
  <tr><td>ต่อผนังหลอดเลือด (ลดเลือดออก บวม หัวยุบ)</td><td>diosmin, hesperidin, aescin, ginkgo biloba, rutosides</td></tr>
  <tr><td>ลดอักเสบ</td><td>hydrocortisone, fluocortolone pivalate</td></tr>
  <tr><td>ลดปวด</td><td>lidocaine, cinchocaine</td></tr>
  <tr><td>ยาปฏิชีวนะ / antiseptic</td><td>framycetin / resorcinol</td></tr>
  <tr><td>สมานแผล ระงับเชื้อเล็กน้อย</td><td>bismuth subgallate, zinc oxide</td></tr>
</table></div>
<h3>UpToDate (ผู้ใหญ่ไม่ตั้งครรภ์)</h3>
<div class="tbl"><table>
  <tr><th>ยา</th><th>ขนาด</th><th>บทบาท</th></tr>
  <tr><td>Dibucaine 1% ointment · pramoxine 1% foam</td><td>ทาบาง ๆ ≤ 4 ครั้ง/วัน · ≤ 5 ครั้ง/วัน</td><td>บรรเทาปวดและคันชั่วคราว ใช้ระยะสั้น แสบเฉพาะที่บ่อย</td></tr>
  <tr><td>Witch hazel pads · zinc oxide paste</td><td>≤ 6 ครั้ง/วัน · ตามต้องการ</td><td>astringent/protectant บรรเทาคันระคาย</td></tr>
  <tr><td>Hydrocortisone cream 1–2.5% · suppository 25–30 mg</td><td>≤ 2 ครั้ง/วัน</td><td>ลดอักเสบ ไม่เกิน 7 วัน (เยื่อบุบาง) เลี่ยงเมื่อติดเชื้อ</td></tr>
  <tr><td>Nitroglycerin 0.2–0.5% ointment</td><td>ขนาดเมล็ดถั่ว วันละ 2 ครั้ง</td><td>ปวดจาก sphincter spasm หรือ thrombosed external · ปวดหัวบ่อย</td></tr>
  <tr><td>Phenylephrine 0.25% (Preparation-H)</td><td>≤ 4 ครั้ง/วัน</td><td>ตัวเลือกบ่อยสำหรับเลือดออก/ปวดเฉียบพลัน</td></tr>
  <tr><td>Lidocaine + hydrocortisone cream/gel</td><td>≤ 2 ครั้ง/วัน</td><td>ปวด คัน อักเสบ ไม่เกิน 7 วัน</td></tr>
  <tr><td><b>ป้องกัน:</b> methylcellulose, polycarbophil, psyllium, wheat dextrin</td><td>เริ่มต่ำ เพิ่มช้า ๆ ดื่มน้ำ 180–360 mL</td><td>ลดเลือดออกในริดสีดวงที่ไม่ยื่น ได้ผลใน ≥ 6 สัปดาห์ · ห่างยาอื่น 1 ชม.</td></tr>
  <tr><td>Docusate</td><td>100 mg BID</td><td>ลดการเบ่ง</td></tr>
</table></div>
<p><b>ป้องกัน:</b> กากใย ดื่มน้ำ 6–8 แก้ว (แก้วใหญ่หลังตื่น) เลี่ยงอาหารรสจัด ชา กาแฟ แอลกอฮอล์ ไม่กลั้น/ไม่เบ่ง ขับถ่ายเป็นเวลา ทำความสะอาด ไม่ใช้ยาระบายแรงหรือสวนเป็นประจำ เลี่ยงยกของหนัก ออกกำลังกาย นอนพอ ลดเครียด</p>
<p><b>สมุนไพร:</b> เพชรสังฆาต อัคคีทวาร ครอบฟันสี เหงือกปลาหมอ ขลู่ · ตำรับยาธรณีสัณฑะฆาต</p>` },
  ],
  questions: [
    { case: 'ชาย 60 ปี มะเร็งลำไส้ใหญ่ ปวดท้องมาก ได้ morphine tablet 30 mg q12h และ morphine solution 15 mg prn for breakthrough หลังให้ยามีอาการท้องผูก (ดัดแปลงจากรอบ 2/2561)', q: 'ยาใดใช้รักษาภาวะท้องผูกของผู้ป่วย', o: ['Senna', 'Lactulose', 'Mineral oil', 'Psyllium', 'Methylcellulose'], a: 0, e: 'Opioid-induced constipation เกิดจากลำไส้ลดการบีบตัว จึงใช้ stimulant laxative (senna, bisacodyl) · ไม่ใช้ bulk-forming เพราะอุจจาระอัดแน่นเกิดลำไส้อุดตัน' },
    { q: 'ข้อใดถูกต้องเกี่ยวกับยาระบายกลุ่ม bulk laxative', o: ['ใช้ไม่ได้ในคนสูงอายุ', 'ใช้ไม่ได้ในหญิงให้นมบุตร', 'ให้ได้ในผู้ป่วยลำไส้อักเสบ', 'ให้ได้ในคนท้อง', 'กินแบบผงแล้วดื่มน้ำตาม'], a: 3, e: 'ไม่ถูกดูดซึม ปลอดภัยสูง เป็นตัวเลือกแรกในหญิงตั้งครรภ์ · ข้อ จ ผิดเพราะต้องชงผสมน้ำก่อนดื่ม กันพองตัวอุดหลอดอาหาร' },
    { q: 'ข้อใดถูกต้องเกี่ยวกับ lactulose', o: ['ลดแรงตึงผิวของอุจจาระ', 'ดึงน้ำเข้าสู่ลำไส้', 'ต้าน opioid receptor', 'ต้าน cholinergic receptor', 'ต้าน serotonin receptor'], a: 1, e: 'Osmotic laxative ถูกแบคทีเรียย่อยเป็นกรดอินทรีย์ เพิ่มแรงดันออสโมติกดึงน้ำเข้าลำไส้' },
    { q: 'ข้อใดถูกต้องเกี่ยวกับยาระบาย', o: ['Castor oil เป็น stool softener', 'Mineral oil เป็น stool softener', 'Docusate เป็น lubricant', 'Magnesium hydroxide เป็น stimulant laxative', 'Bisacodyl เป็น stimulant laxative'], a: 4, e: 'Castor oil = stimulant · mineral oil = lubricant · docusate = stool softener · magnesium hydroxide = osmotic' },
    { q: 'ยาใดทำให้ท้องผูกเหมือน morphine', o: ['Amoxicillin', 'Colchicine', 'Metformin', 'Neostigmine', 'Diphenhydramine'], a: 4, e: 'Diphenhydramine (1st gen antihistamine) มีฤทธิ์ anticholinergic ลดการบีบตัวลำไส้ · ยาอื่นมักทำให้ท้องเสีย' },
  ],
}
