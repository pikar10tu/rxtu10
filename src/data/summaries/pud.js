// Dyspepsia & peptic ulcer disease — converted from the RxTU10 class summary PDF (see content/summaries/manifest.json)
export default {
  id: 'pud',
  date: '26 กรกฎาคม 2569',
  refs: [
    'สมาคมแพทย์โรคระบบทางเดินอาหารแห่งประเทศไทย. แนวทางการวินิจฉัยและการรักษา Dyspepsia ในประเทศไทย พ.ศ. 2561 (Thailand Dyspepsia Guidelines 2018).',
    'APhA. Lexicomp Drug Information Handbook. 26th ed. Wolters Kluwer; 2017.',
    'Krugh M, Patel P, Maani CV. Misoprostol. StatPearls (NBK539873).',
    'Lanza FL, et al. Guidelines for prevention of NSAID-related ulcer complications. Am J Gastroenterol. 2009;104:728–738.',
    'Bhatt DL, et al. J Am Coll Cardiol. 2008;52:1502-1517 · Lanas A. Lancet 2017;390:613–24',
  ],
  sections: [
    { id: 'def', t: 'นิยามและปัจจัยเสี่ยง', html: `<ul>
  <li><b>Epidemiology:</b> ไทยความชุก 66% · <b>functional dyspepsia (FD)</b> เป็นสาเหตุหลัก (60–90%) เรื้อรังเป็น ๆ หาย ๆ กระทบคุณภาพชีวิต แต่<b>ไม่กลายเป็นมะเร็ง</b></li>
  <li><b>Dyspepsia:</b> ปวด มวน แน่น แสบ หรือไม่สบายท้องส่วนบน <mark>ต่อเนื่อง ≥ 4 สัปดาห์</mark> · อาการร่วม (โดยเฉพาะคนเอเชีย) ท้องอืด คลื่นไส้ เรอ แสบร้อนกลางอก · <b>ต้องไม่มี alarm features</b> (เลือดออกในทางเดินอาหาร ซีด กินได้น้อย อิ่มเร็วชัดเจน ญาติสายตรงเป็นมะเร็งกระเพาะ)
    <ul>
      <li><b>Structural/biochemical:</b> ส่องกล้องพบความผิดปกติที่อธิบายอาการได้หรือพบ H. pylori (GERD, pancreatitis, PUD, H. pylori gastritis)</li>
      <li><b>Functional dyspepsia:</b> ส่องกล้องไม่พบความผิดปกติและไม่พบ H. pylori · <b>PDS</b> (postprandial distress syndrome: แน่นท้องหรืออิ่มเร็วหลังมื้ออาหาร) · <b>EPS</b> (epigastric pain syndrome: ปวดหรือแสบร้อนลิ้นปี่)</li>
    </ul>
  </li>
  <li><b>Peptic ulcer disease:</b> แผลจากกรดและ pepsin พบบ่อยที่กระเพาะและ duodenum</li>
</ul>
<h3>Risk factors</h3>
<ul>
  <li><b>H. pylori:</b> chronic gastritis ทำลายเยื่อบุ</li>
  <li><b>NSAIDs, aspirin:</b> ยับยั้ง COX-1 → prostaglandin ลด → เยื่อบุถูกกรดทำลายง่าย · เสี่ยงขึ้นเมื่ออายุ &gt; 65 ปี เคยมี complicated ulcer ใช้ NSAIDs ขนาดสูง</li>
</ul>
<h3>Diagnosis</h3>
<ul>
  <li><b>Gold standard: EGD</b> วินิจฉัยแผล ตำแหน่ง ชนิด ตัดชิ้นเนื้อตรวจ H. pylori หรือมะเร็ง</li>
  <li>Barium radiography: พบ wall defect (ใช้น้อยลง)</li>
</ul>` },
    { id: 'patho', t: 'Pathophysiology และอาการ', html: `<figure><img data-fig="pud/p02-1.webp" alt="กลไกการบาดเจ็บและการป้องกันของเยื่อบุกระเพาะ: ปัจจัยทำลายกับปัจจัยป้องกัน จนเกิดแผล"><figcaption>Mechanism of gastric injury and protection (Robbins)</figcaption></figure>
<figure><img data-fig="pud/p03-1.webp" alt="กลไกของ NSAIDs และ aspirin ต่อเยื่อบุกระเพาะ: local topical effect และ systemic effect ยับยั้ง COX-1 ลด prostaglandin mucus bicarbonate และ mucosal blood flow"><figcaption>กลไกของ NSAIDs ที่ทำให้เกิดแผล (Lanas, Lancet 2017)</figcaption></figure>
<h3>อาการ</h3>
<ul>
  <li><b>Dyspepsia (Rome IV):</b> PDS = postprandial fullness, early satiation · EPS = epigastric pain, epigastric burning (ไม่จำเป็นต้องสัมพันธ์กับมื้ออาหาร)</li>
  <li><b>PUD:</b> หลายรายไม่ค่อยปวด มาด้วยภาวะแทรกซ้อน · ถ้ามีอาการ: ปวดแสบ จุก แน่นลิ้นปี่
    <ul>
      <li><b>Duodenal ulcer:</b> ปวดตอนท้องว่าง/ดึก <mark>ดีขึ้นเมื่อกินอาหารหรือยาลดกรด</mark></li>
      <li><b>Gastric ulcer:</b> ปวด<mark>แย่ลงหลังอาหาร</mark> กลัวการกิน น้ำหนักลด</li>
    </ul>
  </li>
</ul>
<h3>Severity</h3>
<ul>
  <li>FD ไม่รุนแรงถึงชีวิต แต่กระทบคุณภาพชีวิตมาก</li>
  <li><b>ภาวะแทรกซ้อน PUD:</b>
    <ul>
      <li><b>GI bleeding</b> (บ่อยสุด): อาเจียนเป็นเลือด/สีกาแฟ ถ่ายดำ (melena) รุนแรงถ่ายเลือดสด + shock</li>
      <li><b>Perforation:</b> ทะลุทุกชั้น ปวดรุนแรงทันที หน้าท้องแข็งเหมือนไม้ (board-like rigidity) peritonitis ฉุกเฉิน</li>
      <li><b>Penetration:</b> ทะลุเข้าอวัยวะข้างเคียง (เช่น ตับอ่อน) ปวดร้าวไปหลัง ไม่ตอบสนองต่ออาหารหรือยาลดกรด</li>
      <li><b>Gastric outlet obstruction:</b> แผลเรื้อรังที่ pylorus/duodenal bulb บวมหรือพังผืดตีบ อิ่มเร็ว แน่นมาก อาเจียนเศษอาหารที่กินหลายชั่วโมงก่อน (non-bilious) น้ำหนักลด</li>
    </ul>
  </li>
</ul>` },
    { id: 'drugs', t: 'Pharmacology', html: `<h3>PPIs</h3>
<p>ยับยั้ง H⁺/K⁺ ATPase แบบถาวร ยับยั้งกรดทั้งจากกระเพาะและจากการกระตุ้นของ ACh, gastrin, histamine · ลดการก่อตัวของ H. pylori ที่ gastric antrum</p>
<div class="tbl"><table>
  <tr><th></th><th>Omeprazole</th><th>Esomeprazole</th><th>Pantoprazole</th><th>Rabeprazole</th><th>Lansoprazole</th><th>Dexlansoprazole</th></tr>
  <tr><td>BA</td><td class="num">30–40%</td><td class="num">64% (single) / 90% (multiple)</td><td class="num">77%</td><td class="num">52%</td><td class="num">&gt; 80%</td><td>—</td></tr>
  <tr><td>Tmax</td><td class="num">0.5–1 h</td><td class="num">1.6 h</td><td class="num">2.5 h</td><td class="num">2–5 h</td><td class="num">1.7 h</td><td class="num">1–2 h และ 4–5 h (2 peak)</td></tr>
  <tr><td>PB</td><td class="num">95%</td><td class="num">97%</td><td class="num">98%</td><td class="num">96%</td><td class="num">97%</td><td class="num">96–99%</td></tr>
  <tr><td>t½</td><td class="num">0.5–1 h</td><td class="num">1–1.5 h</td><td class="num">1 h</td><td class="num">1–2 h</td><td class="num">1.5 h</td><td class="num">1–2 h</td></tr>
  <tr><td>Duration</td><td>72 h</td><td>—</td><td>&gt; 24 h</td><td>24 h</td><td>&gt; 24 h</td><td>—</td></tr>
  <tr><td>Metabolism</td><td colspan="5">CYP2C19 และ CYP3A4 substrate (omeprazole มี first-pass · esomeprazole first-pass น้อยกว่า)</td><td>—</td></tr>
  <tr><td>ขนาด</td><td>20 หรือ 40 mg OD ≥ 1 h ก่อนอาหาร</td><td>20 หรือ 40 mg OD ≥ 1 h ก่อนอาหาร</td><td>40 mg OD</td><td>20–60 mg OD 30 นาทีก่อนอาหาร</td><td>15 หรือ 30 mg OD ก่อนอาหาร</td><td>30 หรือ 60 mg OD</td></tr>
  <tr><td>Pregnancy</td><td>C</td><td>B</td><td>B</td><td>B</td><td>B</td><td>B</td></tr>
  <tr><td>ตับบกพร่อง</td><td>BA เพิ่มในโรคตับเรื้อรัง</td><td>Child-Pugh C ไม่เกิน 20 mg/day</td><td>ไม่ต้องปรับ</td><td>ตับรุนแรงระวัง</td><td>จำเป็นในตับบกพร่องรุนแรง</td><td>Child-Pugh B พิจารณา · C ไม่มีข้อมูล</td></tr>
</table></div>
<p style="font-size:.9em">ทุกตัว: ไม่แนะนำขณะให้นมบุตร · ไม่ต้องปรับตามไต</p>
<h3>Misoprostol</h3>
<ul>
  <li><b>PGE1 analogue</b> จับ PGE1 receptor บน parietal cell ลดกรดทั้ง basal, nocturnal และจากอาหาร แอลกอฮอล์ คาเฟอีน histamine NSAIDs · เพิ่มการหลั่ง mucus และ bicarbonate</li>
  <li>ดูดซึมเร็ว peak 12 ± 3 นาที · onset ~30 นาที นาน ~3 ชม. · PB &lt; 90% ขับในน้ำนม · prodrug → misoprostol acid · ขับทางปัสสาวะ</li>
  <li><b>200 mcg QID</b></li>
</ul>` },
    { id: 'tx', t: 'ป้องกันแผลจาก NSAIDs และ antiplatelet', html: `<div class="tbl"><table>
  <tr><th>CV risk \\ GI risk</th><th>Low</th><th>Moderate</th><th>High</th></tr>
  <tr><td><b>Low</b></td><td>NSAID alone</td><td>NSAID + PPI/misoprostol</td><td>alternative therapy หรือ coxib + PPI/misoprostol</td></tr>
  <tr><td><b>High</b></td><td><mark>naproxen + PPI/misoprostol</mark></td><td>naproxen + PPI/misoprostol</td><td>alternative therapy</td></tr>
</table></div>
<p style="font-size:.9em">ACG guidelines for prevention of NSAID-related ulcer complications (Lanza 2009) · coxib = COX-2 inhibitor</p>
<figure><img data-fig="pud/p07-1.webp" alt="Flowchart การให้ PPI ในผู้ป่วยที่ใช้ antiplatelet: ประวัติ ulcer complication, ulcer disease, GI bleeding, dual antiplatelet, ใช้ anticoagulant ร่วม ให้ PPI · ถ้าไม่มีแต่มีปัจจัยเสี่ยงมากกว่าหนึ่ง (อายุ ≥ 60, corticosteroid, dyspepsia/GERD) ให้ PPI"><figcaption>ผู้ใช้ antiplatelet: ประวัติ ulcer complication/ulcer disease, GI bleeding, DAPT หรือใช้ anticoagulant ร่วม → <b>PPI</b> (ตรวจและรักษา H. pylori ถ้ามี) · ไม่มี แต่มีปัจจัย ≥ 2 ข้อ (อายุ ≥ 60, corticosteroid, dyspepsia/GERD) → PPI</figcaption></figure>
<div class="key"><strong class="k">Clopidogrel + PPI</strong>Omeprazole (CYP2C19 inhibitor) ลดการ activate clopidogrel · ถ้าต้องให้ PPI ร่วมเลือก <b>pantoprazole</b></div>` },
  ],
  questions: [
    { q: 'ชาย 45 ปี ปวดแสบลิ้นปี่ต่อเนื่อง 5 สัปดาห์ ไม่กลืนลำบาก น้ำหนักปกติ ไม่มีประวัติครอบครัวเป็นมะเร็ง อุจจาระสีปกติ ข้อใดระบุอาการของ epigastric pain syndrome (EPS) ตาม Rome IV ได้ถูกต้องที่สุด', o: ['อิ่มเร็วกว่าปกติหลังกินอาหารปริมาณปกติ', 'ถ่ายอุจจาระสีดำเหนียวคล้ายยางมะตอย', 'ปวดดีขึ้นทันทีเมื่อขับถ่าย', 'แสบร้อนหรือปวดลิ้นปี่ โดยไม่จำเป็นต้องสัมพันธ์กับมื้ออาหาร', 'อืดแน่นท้องหลังกินอาหาร'], a: 3, e: 'EPS: ปวดแสบหรือร้อนลิ้นปี่ ไม่จำเป็นต้องสัมพันธ์กับมื้ออาหาร ต่างจาก PDS ที่สัมพันธ์กับมื้ออาหาร' },
    { q: 'ผู้ป่วย high CV risk ต้องใช้ naproxen รักษาปวดข้อเรื้อรัง แต่ GI risk ต่ำ ตาม ACG ควรจัดการอย่างไร', o: ['Naproxen ร่วมกับ anticoagulant', 'หยุดยาแก้ปวดทุกชนิด', 'Naproxen อย่างเดียว', 'Naproxen ร่วมกับ PPI หรือ misoprostol', 'Celecoxib อย่างเดียว'], a: 3, e: 'ACG: CV risk สูง + GI risk ต่ำ → naproxen + PPI/misoprostol' },
    { q: 'ผู้ที่ใช้ antiplatelet (เช่น aspirin) "จำเป็น" ต้องได้ PPI ร่วมเมื่อมีเกณฑ์ใด', o: ['ท้องผูกเรื้อรัง', 'น้ำหนักเกิน', 'มีประวัติภาวะแทรกซ้อนจากแผล (history of ulcer complication)', 'ใช้ antiplatelet ชนิดเดียว', 'ใช้ paracetamol ร่วม'], a: 2, e: 'ตาม flowchart antiplatelet: ประวัติ ulcer complication หรือ GI bleeding ต้องได้ PPI' },
    { q: 'หญิง 68 ปี ต้องใช้ NSAIDs ต่อเนื่อง แพทย์ให้ misoprostol ป้องกันแผล ข้อใดถูกต้องที่สุด', o: ['เป็น H2 receptor antagonist', 'เพิ่มการหลั่งกรด', 'เป็น prostaglandin E1 analogue', 'ยับยั้ง H⁺/K⁺-ATPase', 'กินวันละครั้ง'], a: 2, e: 'Misoprostol เป็น PGE1 analogue ลดกรด เพิ่ม mucus และ bicarbonate ขนาดป้องกัน NSAID ulcer 200 mcg วันละ 4 ครั้ง' },
    { q: 'ชาย 70 ปี เคย bleeding peptic ulcer 2 ปีก่อน ต้องกิน aspirin + clopidogrel หลัง PCI และปวดเข่าเสื่อมรุนแรง แพทย์จะเริ่ม NSAIDs ตาม ACG และข้อจำกัดของ clopidogrel ข้อใดเหมาะสมที่สุด', o: ['Naproxen ร่วม omeprazole', 'Naproxen ร่วม rabeprazole', 'Ibuprofen ร่วม misoprostol', 'Celecoxib อย่างเดียว', 'Celecoxib ร่วม pantoprazole'], a: 4, e: 'High GI risk (ประวัติ ulcer complication) + high CV risk (DAPT) → เลี่ยง NSAIDs หรือถ้าจำเป็นใช้ celecoxib + PPI โดยเลือก pantoprazole ลด DDI กับ clopidogrel ผ่าน CYP2C19 · หมายเหตุ: ตาราง ACG ช่อง high/high คือ alternative therapy' },
    { q: 'หญิง 66 ปี ต้องใช้ NSAIDs ขนาดสูง มีประวัติแผลไม่รุนแรง (non-bleeding ulcer) เมื่อปีก่อน ตาม ACG แผนการรักษาที่เหมาะสมที่สุด', o: ['H2RA ขนาดสูงร่วม', 'Celecoxib อย่างเดียว', 'NSAIDs ร่วม misoprostol', 'NSAIDs อย่างเดียวถ้าไม่มี CV risk', 'เปลี่ยนเป็น naproxen อย่างเดียว'], a: 2, e: 'Moderate GI risk (อายุมาก + เคยมีแผล) → NSAID + PPI หรือ misoprostol' },
  ],
}
