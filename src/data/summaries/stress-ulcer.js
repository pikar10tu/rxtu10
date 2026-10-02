// Stress ulcer — converted from the RxTU10 class summary PDF (see content/summaries/manifest.json)
export default {
  id: 'stress-ulcer',
  date: '29/07/69',
  refs: [
    'Ye Z, et al. Executive summary: guidelines for the prevention of stress-related upper GI bleeding in critically ill patients (SCCM/ASHP). Crit Care Med. 2024;52(9):1423-35.',
    'Mittal S. Stress ulceration: practice essentials, pathophysiology, etiology. Medscape; 2023.',
    'Lim CH, et al. High dose PPIs versus H2RAs for the prevention of stress-related mucosal bleeding in critically ill patients: a meta-analysis. J Neurogastroenterol Motil. 2013;19(1):25-33.',
  ],
  sections: [
    { id: 'def', t: 'นิยามและพยาธิสรีรวิทยา', html: `<ul>
  <li><b>Epidemiology:</b> ผู้ป่วยวิกฤตในสหรัฐฯ &lt; 10% มีเลือดออกชัดเจน · 1–3% มีเลือดออกที่มีนัยสำคัญทางคลินิก</li>
  <li><b>Stress-related injury:</b> แผลชั้นบน ๆ ของเยื่อบุ upper GI · <b>stress ulcer:</b> แผลลึกกว่า อันตรายกว่า เลือดออกหรือกระทบ hemodynamic</li>
  <li>ปัจจัยส่งเสริม: hypoperfusion ของ GI tract · ความทนกรดเปลี่ยน · loss of defense mechanism · gastric motility เปลี่ยน</li>
</ul>
<h3>Pathophysiology</h3>
<p>Critical illness → catecholamine ↑, hypovolemia, proinflammatory cytokines ↑ → <b>splanchnic hypoperfusion</b> → กระทบ 4 ทาง</p>
<ol>
  <li>GI hypoperfusion: O₂ และสารอาหารที่ใช้ซ่อมแซมลดลง</li>
  <li>HCO₃⁻ ลดลง: ทนกรดได้น้อยลง</li>
  <li>Acid back diffusion: กรดซึมย้อนทำลายเยื่อบุ</li>
  <li>Gastric motility ลดลง: อาหารและกรดค้างนาน</li>
</ol>
<p>→ <b>acute stress ulcer</b></p>
<h3>อาการ</h3>
<p>ขึ้นกับความรุนแรงของเลือดออก: melena · coffee-ground vomitus · hematemesis · Hb/Hct ลด · ซีด ความดันต่ำ เวียนศีรษะ</p>
<p><b>Etiology:</b> massive burn · major trauma · sepsis · multiorgan failure · traumatic brain injury · prolonged mechanical ventilation · hypotension</p>
<div class="key"><strong class="k">ข้อบ่งชี้หลักของ SUP (ASHP)</strong><b>Mechanical ventilation ≥ 48 ชม.</b> หรือ <b>coagulopathy</b> · ถ้าไม่มี พิจารณาเมื่อมีปัจจัยย่อย ≥ 2 ข้อ (แผลไหม้รุนแรง สมองกระทบกระเทือน steroid ขนาดสูง)</div>` },
    { id: 'tx', t: 'ยาป้องกัน (SUP)', html: `<p>เลือกยาตามความจำเป็น โรคร่วม ความเสี่ยง pneumonia และ C. difficile</p>
<h3>1. PPIs (first-line)</h3>
<p>SCCM/ASHP แนะนำ <b>low-dose PPI</b> · ให้ทาง oral หรือ enteral ได้ผลไม่ต่างจาก IV</p>
<div class="tbl"><table>
  <tr><th>ยา</th><th class="num">ขนาดต่อวัน</th></tr>
  <tr><td>Omeprazole</td><td class="num">≤ 40 mg</td></tr>
  <tr><td>Esomeprazole</td><td class="num">≤ 40 mg</td></tr>
  <tr><td>Lansoprazole</td><td class="num">≤ 30 mg</td></tr>
  <tr><td>Pantoprazole</td><td class="num">≤ 40 mg</td></tr>
</table></div>
<ul>
  <li>ADR: ปวดหัว ปวดท้อง ท้องเสีย ท้องผูก · <mark>เพิ่มเสี่ยง ventilator-associated pneumonia และ C. difficile</mark> (pH สูง แบคทีเรียโต)</li>
  <li>ใช้ 3–5 วันจึงได้ผลเต็มที่ · กินก่อนอาหาร ≥ 15–30 นาที</li>
  <li>ADME: prodrug ถูกเปลี่ยนเป็น active form · PB สูง ~95% · CYP2C19 (ต่างกันตามบุคคล) · ขับทางปัสสาวะและน้ำดี</li>
</ul>
<h3>2. H2-receptor blockers (first-line)</h3>
<div class="tbl"><table>
  <tr><th>ยา</th><th>ขนาด</th><th>หมายเหตุ</th></tr>
  <tr><td>Famotidine</td><td>20 mg PO/IV q12h</td><td></td></tr>
  <tr><td>Ranitidine</td><td>150 mg PO q12h · 50 mg IV q8h</td><td></td></tr>
  <tr><td>Nizatidine</td><td>150 mg PO q12h</td><td></td></tr>
  <tr><td>Cimetidine</td><td>300 mg PO/IV q6h หรือ 37.5–50 mg/h continuous infusion</td><td>thrombocytopenia · strong CYP450 inhibitor (DI มาก ไม่นิยม)</td></tr>
</table></div>
<p>ADR: mental status change · <b>ปรับขนาดตามไต</b></p>
<h3>3. Sucralfate</h3>
<ul>
  <li>ไม่เกินวันละ 4 g · จับโปรตีนที่มีประจุสร้างเมือกปกคลุม <b>ไม่ได้ลดกรด</b></li>
  <li><mark>ต้องอาศัยกรดในกระเพาะเปลี่ยนเป็นเจลเคลือบแผล</mark> ไม่ควรให้พร้อมยาลดกรดอื่น</li>
</ul>
<h3>การหยุดยาและบทบาทเภสัชกร</h3>
<ul>
  <li>หยุด SUP เมื่อพ้นภาวะวิกฤต หรือปัจจัยเสี่ยงหลัก (mechanical ventilation, coagulopathy) หมดไป เช่น ย้ายออกจาก ICU และกินอาหารเองได้</li>
  <li>ให้ความรู้ผู้ที่เสี่ยงเป็นซ้ำ · แนะนำ NSAIDs ที่เหมาะสม · ตรวจประวัติยาปฏิชีวนะเพื่อดูการดื้อยาของ H. pylori · ระวังสมุนไพรที่มีผลต่อการไหลเวียนเลือด</li>
</ul>` },
  ],
  questions: [
    { q: 'ปัจจัยเสี่ยงหลัก 2 ประการที่เป็นข้อบ่งชี้เด็ดขาดในการเริ่ม stress ulcer prophylaxis (SUP) ในผู้ป่วย ICU คือ', o: ['Mechanical ventilation ≥ 48 ชม. หรือ coagulopathy', 'อายุ > 60 ปี หรือเคยเป็นโรคกระเพาะเมื่อ 5 ปีก่อน', 'ได้ broad-spectrum antibiotics หรืออาหารทางสายยาง', 'Hyponatremia หรือไข้ > 38.5 °C'], a: 0, e: 'ASHP: mechanical ventilation ≥ 48 ชม. และ coagulopathy · ถ้าไม่มีพิจารณาเมื่อมีปัจจัยย่อย ≥ 2 ข้อ เช่น แผลไหม้รุนแรง สมองกระทบกระเทือน steroid ขนาดสูง' },
    { q: 'การให้ PPI ต่อเนื่องในผู้ป่วย ICU เพิ่มความเสี่ยงการติดเชื้อในโรงพยาบาลชนิดใดมากที่สุด', o: ['HAP/VAP และ C. difficile infection', 'UTI จาก E. coli', 'Catheter-related bloodstream infection', 'วัณโรคปอด'], a: 0, e: 'pH ในกระเพาะสูง แบคทีเรียเจริญและไหลย้อนเข้าปอดผ่านสายช่วยหายใจ (HAP/VAP) และ C. difficile ในลำไส้เจริญเกิน' },
    { q: 'ผู้ป่วย ICU ได้ sucralfate ป้องกัน stress ulcer ถ้าต้องให้ร่วมกับยาลดกรดอื่น ข้อระวังสำคัญคือ', o: ['ควรกินพร้อมยาลดกรดทันทีเพื่อเสริมฤทธิ์', 'ไม่ควรให้พร้อมยาลดกรดทันที เพราะ sucralfate ต้องอาศัยกรดเปลี่ยนตัวเองเป็นเจลเคลือบแผล', 'ได้ผลดีที่สุดเมื่อกินพร้อมอาหารมื้อหนัก', 'บดผสมกับยาอื่นในสายยางได้โดยไม่ทำให้ยาอื่นเสื่อม'], a: 1 },
    { q: 'ผู้ป่วยรายใดควรพิจารณาหยุด SUP ได้เหมาะสมที่สุด', o: ['ย้ายออกจาก ICU และเริ่มกินอาหารเองได้', 'ได้ยาต้านการแข็งตัวของเลือดตัวใหม่', 'ต้องนอนโรงพยาบาลต่อในวอร์ดศัลยกรรม', 'เพิ่งส่องกล้องพบแผลขนาดเล็ก'], a: 0, e: 'ASHP & SCCM: หยุดเมื่อพ้นภาวะวิกฤตหรือปัจจัยเสี่ยงหลักหมดไป' },
    { q: 'แพทย์จะเริ่ม pantoprazole ให้ผู้ป่วยวิกฤตทางสายยางอาหาร (enteral feed) ข้อใดถูกต้อง', o: ['ให้ทาง enteral ได้ เพราะป้องกันเลือดออกไม่ต่างจาก IV และยามี protein binding สูง ~95%', 'ควรเปลี่ยนเป็น IV เพราะ PPI ออกฤทธิ์เต็มที่ทันทีเฉพาะ IV', 'ขับทางปัสสาวะเป็นหลัก ต้องปรับขนาดใน AKI', 'PPI จับโปรตีนต่ำ จึงเกิด DI กับยา PB สูงน้อย'], a: 0, e: 'SCCM/ASHP: enteral ลด clinically important UGIB ไม่ต่างจาก IV อย่างมีนัยสำคัญ และ PPI จับโปรตีนสูง ~95%' },
  ],
}
