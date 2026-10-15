// Hordeolum (ตากุ้งยิง) — converted from the RxTU10 class summary PDF (see content/summaries/manifest.json)
// PDF text layer สระ/วรรณยุกต์บางตัวหาย → ตรวจกับภาพหน้าแล้ว
const fig = (f, cap, alt) => `<figure><img data-fig="hordeolum/${f}.webp" alt="${alt || cap}"><figcaption>${cap}</figcaption></figure>`

export default {
  id: 'hordeolum',
  date: '26/07/2026',
  refs: [
    'สำนักงานคณะกรรมการอาหารและยา. คู่มือการใช้ยาอย่างสมเหตุผลตามบัญชียาหลักแห่งชาติ: ยาที่ใช้ทางจักษุวิทยา — Hordeolum (ตากุ้งยิง).',
    'Hordeolum (Stye). StatPearls Publishing; 2025.',
    'โรงพยาบาลรามาธิบดี มหาวิทยาลัยมหิดล. รู้ทันตากุ้งยิง จากตุ่มเล็ก ๆ สู่การรักษาที่ถูกวิธี. รามาแชนแนล.',
    'UpToDate. Dicloxacillin, doxycycline, cephalexin: Drug information. 2026.',
  ],
  sections: [
    { id: 'def', t: 'นิยามและพยาธิสภาพ', html: `<p><b>ตากุ้งยิง (hordeolum)</b> เกิดจากต่อมไขมันที่เปลือกตาอุดตันแล้วอักเสบเฉียบพลันจากการติดเชื้อแบคทีเรีย เชื้อที่พบบ่อยคือ <mark><i>Staphylococcus aureus</i></mark></p>
<h3>Risk factors</h3>
<ol>
  <li>สัมผัสรอบดวงตาด้วยมือที่ไม่สะอาด</li>
  <li>ทำความสะอาดเปลือกตาไม่ดี</li>
  <li>โรคเรื้อรังที่เปลือกตา เช่น blepharitis, meibomian gland dysfunction</li>
  <li>โรคประจำตัว เช่น เบาหวาน (ภูมิคุ้มกันลด), rosacea (อักเสบเรื้อรัง กระทบต่อม meibomian)</li>
  <li>ดูแลคอนแทคเลนส์ไม่เหมาะสม</li>
  <li>เครื่องสำอางไม่สะอาดหรือล้างไม่หมด</li>
  <li>ภูมิคุ้มกันต่ำ เช่น HIV ได้เคมีบำบัด</li>
</ol>
<div class="tbl"><table>
  <tr><th>ชนิด</th><th>ต่อมที่ติดเชื้อ</th><th>ลักษณะ</th></tr>
  <tr><td><b>External hordeolum</b></td><td>Zeis และ Moll (ciliary gland)</td><td>ตุ่มหนองเล็กที่ขอบเปลือกตา ปวด บวมที่ฐานขนตา มักมี localized abscess</td></tr>
  <tr><td><b>Internal hordeolum</b></td><td>Meibomian (ใต้ tarsal plate)</td><td>บวมแดงไม่ชัด ตรวจพบตุ่มหนองได้ยากกว่า</td></tr>
</table></div>
${fig('p01-1', 'External hordeolum — ตุ่มที่ขอบเปลือกตา')}
${fig('p01-2', 'Internal hordeolum — บวมแดงด้านในเปลือกตา')}` },
    { id: 'tx', t: 'การรักษา', html: `<h3>ตามความรุนแรง (NIH)</h3>
<ol>
  <li><b>Mild:</b> เจ็บ แดงเล็กน้อย → conservative
    <ul>
      <li><b>ประคบอุ่น</b> ครั้งละ 10–15 นาที วันละ 3–4 ครั้ง กระตุ้นการไหลเวียนและการระบายหนอง</li>
      <li>ทำความสะอาดเปลือกตา (น้ำเกลือหรือ lid scrubs)</li>
      <li>ห้ามบีบหรือสัมผัสก้อน · งดเครื่องสำอางรอบตาและคอนแทคเลนส์</li>
      <li>สงสัย secondary bacterial infection: erythromycin หรือ bacitracin ophthalmic ointment ทาขอบเปลือกตา วันละ 2–4 ครั้ง 1–2 สัปดาห์ · น้ำตาเทียมบรรเทาระคายเคือง</li>
    </ul>
  </li>
  <li><b>Moderate:</b> ก้อนใหญ่หรือไม่ดีขึ้นหลังรักษาเบื้องต้น → <b>doxycycline 100 mg วันละครั้ง 7–10 วัน</b></li>
  <li><b>Severe:</b> สงสัย cellulitis ติดเชื้อซ้ำบ่อย หรือแพร่กระจาย → amoxicillin-clavulanate 500 mg วันละ 2 ครั้ง 10–14 วัน · ฝีใหญ่ เรื้อรัง หรือไม่ตอบสนองอาจต้อง incision and drainage</li>
</ol>
<p>ปวดใช้ paracetamol หรือ NSAIDs (ibuprofen) ได้</p>
<div class="tbl"><table>
  <tr><th>ยา</th><th>ข้อบ่งใช้</th><th>วิธีใช้</th><th>ข้อควรระวัง</th></tr>
  <tr><td>Erythromycin / bacitracin ophthalmic ointment</td><td>ติดเชื้อแบคทีเรียร่วม</td><td>ทาขอบเปลือกตา วันละ 2–4 ครั้ง 1–2 สัปดาห์</td><td>ระคายเคืองตา แพ้ยา</td></tr>
  <tr><td>Doxycycline 100 mg</td><td>อักเสบรุนแรง ก้อนใหญ่ หรือไม่ดีขึ้น</td><td>1 เม็ด วันละครั้ง หลังอาหารทันที 7–10 วัน</td><td>คลื่นไส้ อาเจียน ท้องเสีย <mark>photosensitivity</mark></td></tr>
  <tr><td>Amoxicillin-clavulanate 500 mg</td><td>ภาวะแทรกซ้อน/ติดเชื้อรุนแรง เช่น cellulitis</td><td>1 เม็ด วันละ 2 ครั้ง หลังอาหาร 10–14 วัน</td><td>ท้องเสีย คลื่นไส้ ปวดท้อง</td></tr>
  <tr><td>Paracetamol 500 mg</td><td>บรรเทาปวด</td><td>1 เม็ด ทุก 4–6 ชม. เมื่อปวด</td><td>ไม่เกิน 4,000 mg/วัน</td></tr>
  <tr><td>Ibuprofen 400 mg</td><td>บรรเทาปวด บวม</td><td>1 เม็ด วันละ 3 ครั้ง หลังอาหารทันที</td><td>ไม่เกิน 2,400 mg/วัน · กินหลังอาหารป้องกัน GI bleeding</td></tr>
</table></div>
<h3>ตามบัญชียาหลักแห่งชาติ</h3>
<div class="tbl"><table>
  <tr><th>ยา</th><th>ข้อบ่งใช้</th><th>วิธีใช้</th><th>ข้อควรระวัง</th></tr>
  <tr><td>Chloramphenicol ophthalmic ointment</td><td>ร่วมกับ infectious blepharoconjunctivitis</td><td>ทาขอบเปลือกตา วันละ 2 ครั้ง เช้าและก่อนนอน</td><td>ระคายเคือง แพ้ยา</td></tr>
  <tr><td>Dicloxacillin 500 mg</td><td rowspan="3">ร่วมกับ secondary eyelid cellulitis</td><td>1 เม็ด วันละ 4 ครั้ง ก่อนอาหาร ≥ 1 ชม. 5–7 วัน</td><td>ท้องเสีย ผื่น คลื่นไส้ อาเจียน</td></tr>
  <tr><td>Cephalexin 500 mg</td><td>1 เม็ด วันละ 2 ครั้ง หลังอาหาร 7–14 วัน</td><td>คลื่นไส้ อาเจียน ท้องเสีย ปวดท้อง ปวดศีรษะ</td></tr>
  <tr><td>Doxycycline 100 mg</td><td rowspan="2">1 เม็ด วันละ 1–2 ครั้ง หลังอาหารทันที 7–10 วัน</td><td rowspan="2">คลื่นไส้ อาเจียน ท้องเสีย photosensitivity</td></tr>
  <tr><td>Doxycycline 100 mg</td><td>ร่วมกับ meibomitis เรื้อรัง</td></tr>
</table></div>
<p><b>ป้องกันการเป็นซ้ำ:</b> ดูแลความสะอาดเปลือกตา · ประคบอุ่นต่อเนื่องให้ต่อมไขมันทำงานดี · หลีกเลี่ยงการขยี้หรือสัมผัสตา</p>` },
  ],
  questions: [
    { q: 'ข้อใดเป็นเชื้อก่อโรคที่พบบ่อยที่สุดของ hordeolum', o: ['Streptococcus pyogenes', 'Staphylococcus aureus', 'Pseudomonas aeruginosa', 'Haemophilus influenzae'], a: 1, e: 'Hordeolum เป็นการอักเสบเฉียบพลันของต่อมไขมันที่เปลือกตา เชื้อที่พบบ่อยที่สุดคือ S. aureus' },
    { case: 'หญิงอายุ 22 ปี ปวด บวมแดงที่ขอบเปลือกตาขวาหลายวัน ประคบอุ่นแล้วไม่ดีขึ้น วันนี้ก้อนใหญ่ขึ้นมีตุ่มหนองเล็ก ๆ ไม่มีไข้ เคยเป็นแบบนี้มาก่อน แต่งหน้าทุกวัน ขยี้ตาบ่อย ไม่มีโรคประจำตัว ไม่แพ้ยา', q: 'แนวทางรักษาที่เหมาะสมที่สุดคือข้อใด', o: ['ประคบอุ่นต่อเนื่อง ร่วมกับรักษาความสะอาดเปลือกตา และจ่าย erythromycin ophthalmic ointment', 'Doxycycline 100 mg วันละ 1 ครั้ง นาน 7–10 วัน', 'Amoxicillin-clavulanate 500 mg วันละ 2 ครั้ง นาน 10–14 วัน', 'แนะนำให้เจาะหรือบีบตุ่มหนองเพื่อระบายหนอง ร่วมกับ ibuprofen เมื่อปวด'], a: 1, e: 'ประคบอุ่น (conservative) แล้วไม่ดีขึ้นและก้อนใหญ่ขึ้น เข้าเกณฑ์ moderate ให้ยาปฏิชีวนะชนิดรับประทาน doxycycline ตาม NIH · ไม่มี cellulitis จึงยังไม่ต้อง amoxicillin-clavulanate · ห้ามบีบก้อน' },
    { case: 'หญิงอายุ 22 ปี ตากุ้งยิงที่ได้รับ doxycycline 100 mg วันละ 1 ครั้ง 7–10 วัน', q: 'ข้อใดเป็น adverse effect สำคัญที่ควรแนะนำผู้ป่วยก่อนใช้ยา', o: ['Hypokalemia', 'GI bleeding', 'Photosensitivity', 'ระคายเคืองตา'], a: 2, e: 'Doxycycline ทำให้คลื่นไส้ อาเจียน ท้องเสีย และ photosensitivity ควรเลี่ยงแดดจัดหรือทาครีมกันแดด' },
    { case: 'หญิงอายุ 22 ปี ตากุ้งยิง เคยเป็นซ้ำ แต่งหน้าทุกวัน ขยี้ตาบ่อย · คำแนะนำ: (1) ดูแลความสะอาดเปลือกตาสม่ำเสมอ (2) ประคบอุ่นบริเวณดวงตา (3) หลีกเลี่ยงการขยี้หรือสัมผัสตา', q: 'คำแนะนำเพื่อป้องกันการเป็นซ้ำที่เหมาะสมคือข้อใด', o: ['1', '1 และ 2', '2 และ 3', '1, 2 และ 3'], a: 3, e: 'ผู้ป่วยเป็นซ้ำและขยี้ตาบ่อย จึงควรได้คำแนะนำครบทั้งความสะอาดเปลือกตา ประคบอุ่นต่อเนื่อง และเลี่ยงการขยี้ตา' },
    { q: 'ข้อใดกล่าวถูกต้องเกี่ยวกับตากุ้งยิง (hordeolum)', o: ['เป็นการอักเสบเรื้อรังของต่อม meibomian จากการอุดตันเพียงอย่างเดียว ไม่เกี่ยวกับการติดเชื้อ', 'External hordeolum เกิดจากการติดเชื้อที่ต่อม Zeis และ Moll ส่วน internal hordeolum เกิดที่ต่อม meibomian', 'การขยี้ตาบ่อยไม่ใช่ปัจจัยเสี่ยง เพราะเชื้อส่วนใหญ่มาทางกระแสเลือด', 'Internal hordeolum มักพบตุ่มหนองชัดเจนที่ขอบเปลือกตามากกว่า external'], a: 1, e: 'External = Zeis/Moll · internal = meibomian · เป็นการติดเชื้อเฉียบพลัน การขยี้ตาเป็นปัจจัยเสี่ยง และ internal ตรวจพบตุ่มหนองยากกว่า' },
  ],
}
