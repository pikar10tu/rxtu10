// Irritable bowel syndrome — converted from the RxTU10 class summary PDF (see content/summaries/manifest.json)
export default {
  id: 'ibs',
  date: '29/07/2569 (แก้ไข 15/08/2569)',
  refs: [
    'Thai Neurogastroenterology and Motility Society. Thailand IBS Guideline 2022.',
    'Madia VN, et al. Tegaserod for the treatment of irritable bowel syndrome. Anti-Inflamm Anti-Allergy Agents Med Chem. 2020;19(4):342-69.',
    'Nathani RR, Sodhani S, Goosenberg E. Irritable bowel syndrome. StatPearls (NBK534810).',
    'Dedkaew T. Irritable bowel syndrome and treatment [slides]. Thammasat University; 2025.',
    'Wald A. Treatment of irritable bowel syndrome in adults. UpToDate; 2026.',
  ],
  sections: [
    { id: 'dx', t: 'นิยามและวินิจฉัย', html: `<p>กลุ่มอาการทางเดินอาหาร: <b>ปวดท้องที่สัมพันธ์กับการถ่ายอุจจาระที่เปลี่ยนไป</b> (ความถี่หรือลักษณะ) วินิจฉัยด้วย Rome IV</p>
<div class="key"><strong class="k">Rome IV</strong>ปวดท้อง<b>เฉลี่ย ≥ 1 วัน/สัปดาห์ ใน 3 เดือน</b> ร่วมกับ ≥ 2 ใน 3 ข้อ (ครบเกณฑ์ ≥ 3 เดือน และเริ่มมีอาการ ≥ 6 เดือนก่อนวินิจฉัย)<br>1. ปวดสัมพันธ์กับการถ่าย (ก่อนหรือหลังถ่าย) · 2. สัมพันธ์กับความถี่การถ่ายที่เปลี่ยน · 3. สัมพันธ์กับลักษณะอุจจาระที่เปลี่ยน</div>
<p>แบ่งตามลักษณะอุจจาระเด่นใน 2 สัปดาห์ก่อนพบแพทย์: <b>IBS-C</b> (ท้องผูกเด่น) · <b>IBS-D</b> (ท้องเสียเด่น) · IBS-M (ผสม) · IBS-U (จัดประเภทไม่ได้)</p>
<h3>Pathophysiology</h3>
<ul>
  <li><b>Gut-brain axis dysfunction:</b> CNS กับ ENS สื่อสารผ่าน neuronal, endocrine, immune, metabolic pathways ถูกรบกวนจากพันธุกรรม อาหาร ความเครียด สังคม</li>
  <li><mark>Visceral hypersensitivity:</mark> ไวต่อความปวดของอวัยวะภายในสูง ปวดแม้แรงดันในลำไส้ปกติ</li>
  <li>จุลินทรีย์ในลำไส้ไม่สมดุล · food intolerance (20–65% แต่หลักฐานยืนยันเป็นสาเหตุยังน้อย)</li>
</ul>
<h3>Warning signs (ต้องตรวจเพิ่ม)</h3>
<ol>
  <li>อายุ ≥ 50 ปี</li>
  <li>โลหิตจางจากขาดธาตุเหล็ก</li>
  <li>ถ่ายเป็นเลือดที่ไม่ได้มาจากริดสีดวงหรือแผลปริ</li>
  <li>น้ำหนักลด ≥ 10% ใน 3 เดือน</li>
  <li>ปวดท้องหรือถ่ายเหลวรบกวนการนอน</li>
  <li>ไข้</li>
  <li>ญาติสายตรงเป็นมะเร็งลำไส้ใหญ่</li>
  <li>ญาติสายตรงเป็นลำไส้อักเสบเรื้อรัง</li>
  <li>ตรวจร่างกายผิดปกติ (ก้อนในท้อง/ทวาร น้ำในช่องท้อง ต่อมน้ำเหลืองโต)</li>
</ol>` },
    { id: 'drugs', t: 'ยา', html: `<h3>ยารักษาตามอาการ</h3>
<ul>
  <li>Fiber supplements · laxatives (fiber ไม่ได้ผล → magnesium hydroxide หรือ PEG)</li>
  <li>Antidiarrhea: loperamide, cholestyramine · anticholinergic: dicyclomine</li>
  <li>TCAs ขนาดต่ำกว่าปกติ: imipramine, desipramine, nortriptyline · SSRI: fluoxetine, paroxetine</li>
  <li>Pain relief: pregabalin, gabapentin</li>
</ul>
<h3>ยารักษาเฉพาะ</h3>
<div class="tbl"><table>
  <tr><th>ยา</th><th>กลุ่ม / MOA</th><th>ข้อบ่งใช้</th><th>ขนาด</th><th>DI / SE</th></tr>
  <tr><td><b>Alosetron</b> (Lotronex)</td><td>5-HT3 antagonist ยับยั้ง serotonin ในผนังลำไส้เล็ก ลดการเคลื่อนตัว</td><td>ท้องเสียจาก IBS ร่วมปวด/ไม่สบายท้อง (หญิงเท่านั้น)</td><td>0.5 mg 1–2 ครั้ง/วัน ac · 4 สัปดาห์ไม่ดีขึ้นเพิ่ม 1 mg BID</td><td>DI: CYP1A2 inhibitor (fluvoxamine) เพิ่มระดับยา · apomorphine เจ็บหน้าอก ตัวสั่น · SE: ท้องผูก <b>ischemic colitis</b> ถ่ายมีเลือด ตะคริวท้อง</td></tr>
  <tr><td><b>Tegaserod</b> (Zelnorm)</td><td>5-HT4 agonist เพิ่ม peristalsis</td><td>ท้องผูกเรื้อรัง, IBS-C</td><td>6 mg BID ac 4–6 สัปดาห์ (อาจต่ออีก 4–6)</td><td>DI: amiodarone, atomoxetine, betaxolol, bupropion, celecoxib, chloroquine เพิ่มระดับ · ห้ามร่วมแอลกอฮอล์ · SE: albuminuria ปวดท้อง ท้องเสีย ความดันต่ำ LFT สูง K ต่ำ</td></tr>
  <tr><td><b>Linaclotide</b> (Linzess)</td><td><b>Guanylate cyclase-C agonist</b> → cGMP ↑ → หลั่ง Cl⁻ และ HCO₃⁻ เพิ่มน้ำในลำไส้</td><td>IBS-C</td><td>290 mcg OD ก่อนอาหาร ≥ 30 นาที เวลาเดิม</td><td>C/I: ลำไส้อุดตัน เด็ก &lt; 2 ปี · SE: ปวดท้อง ท้องเสีย (ผู้ใหญ่ 16–20%) ท้องอืด</td></tr>
  <tr><td><b>Eluxadoline</b> (Viberzi)</td><td>μ-, κ-opioid agonist + δ-antagonist ลดปวด ชะลอการบีบตัว</td><td>IBS-D</td><td><mark>100 mg BID พร้อมอาหาร</mark> · ทนไม่ได้, โรคไต, Child-Pugh A/B → 75 mg BID</td><td>ห้ามใน Child-Pugh C · เด็กไม่มีข้อมูล</td></tr>
  <tr><td><b>Lubiprostone</b></td><td><b>Chloride channel activator</b> ขับ Cl⁻ (พา Na⁺ และน้ำ)</td><td>IBS-C</td><td>8 mcg BID พร้อมอาหาร · ไม่ต้องปรับตามไต/ตับ</td><td>ไม่ให้ในหญิงตั้งครรภ์ · SE: คลื่นไส้ ถ่ายเหลว ความดันต่ำ บวม แน่นหน้าอก</td></tr>
</table></div>
<p style="font-size:.9em">ต้นฉบับเขียนขนาด linaclotide 290 mg ซึ่งพิมพ์ผิด ขนาดจริงคือ 290 mcg</p>` },
    { id: 'tx', t: 'แนวทางการรักษา (Thai IBS 2022)', html: `<figure><img data-fig="ibs/p07-1.webp" alt="แผนภูมิแนวทางดูแลผู้ป่วยโรคลำไส้แปรปรวน: มีสัญญาณเตือนส่องกล้อง ไม่มีให้คำแนะนำ เลือกยาตามอาการเด่น ปวดท้อง ท้องผูก ท้องเสีย ไม่ตอบสนองให้ TCAs และส่งต่อ"><figcaption>แผนภูมิแนวทางการดูแลรักษาผู้ป่วยโรคลำไส้แปรปรวน (Thai IBS Guideline 2022)</figcaption></figure>
<p>ผู้ป่วยทุกคน: ออกกำลังกาย ปรับการกินอาหาร คัดกรอง eating disorder โรคจิตเวชที่คุมไม่ได้ และปัจจัยที่ทำให้ขาดสารอาหาร</p>
<div class="tbl"><table>
  <tr><th></th><th>IBS-C</th><th>IBS-D</th></tr>
  <tr><td>First-line</td><td>Psyllium 5–10 g OD (เริ่มต่ำ อาจอืดมากขึ้น) · PEG 10–20 g OD · milk of magnesia 15–45 mL OD (ระวังไต) · bisacodyl 5–10 mg OD (เลี่ยงใช้ยาว)</td><td><b>Loperamide</b> 2–4 mg วันละ 1–4 ครั้ง (ระวังโรคตับ) · <b>ondansetron</b> 4–24 mg/วัน (ท้องผูก)</td></tr>
  <tr><td>ไม่ตอบสนอง</td><td>tegaserod 6 mg BID ac · linaclotide 290 mcg OD · lubiprostone 8 mcg BID พร้อมอาหาร</td><td>alosetron 0.5–1 mg BID (หญิงเท่านั้น) · eluxadoline 75–100 mg (ต้นฉบับเขียน OD) · rifaximin, bile acid sequestrants</td></tr>
  <tr><td>ยังไม่ตอบสนอง</td><td colspan="2">TCAs แล้วส่งต่อแพทย์ทางเดินอาหาร</td></tr>
</table></div>
<p>อาการปวดท้องเด่น: antispasmodic หรือ peppermint oil → TCAs</p>` },
  ],
  questions: [
    { q: 'กลไกใดอธิบายอาการปวดท้องในผู้ป่วย IBS ได้ชัดเจนที่สุด', o: ['ขาดเอนไซม์ lactase ใน small intestine', 'อักเสบรุนแรงจนเกิดแผลในผนังลำไส้ส่วนปลาย', 'ติดเชื้อ H. pylori ในกระเพาะ', 'Visceral hypersensitivity'], a: 3, e: 'Visceral hypersensitivity และ gut-brain axis ผิดปกติทำให้ปวดแม้แรงดันในลำไส้ปกติ' },
    { q: 'ยารักษา IBS-C ตัวใดเป็น guanylate cyclase-C agonist', o: ['Loperamide', 'Linaclotide', 'Rifaximin', 'Amitriptyline'], a: 1, e: 'Linaclotide กระตุ้น GC-C receptor เพิ่มการหลั่ง chloride และน้ำเข้าลำไส้' },
    { q: 'อาการใดเป็นหนึ่งในเกณฑ์ Rome สำหรับวินิจฉัย IBS', o: ['ท้องอืด', 'คลื่นไส้', 'ปวดท้องอย่างน้อย 3 วันต่อสัปดาห์', 'ปวดเมื่อถ่ายอุจจาระ'], a: 3, e: 'ท้องอืดและคลื่นไส้ไม่อยู่ในเกณฑ์ · ต้องปวดท้องอย่างน้อย 1 วัน/สัปดาห์ ไม่ใช่ 3 วัน' },
    { q: 'ชาย IBS-D ได้ eluxadoline (Viberzi) ข้อใดคือขนาดยาที่ถูกต้อง', o: ['100 mg BID พร้อมอาหาร', '6 mg BID ก่อนอาหาร ไตบกพร่องลดเหลือ 3 mg BID', '0.5 mg BID ก่อนอาหาร 4 สัปดาห์ไม่ดีขึ้นเพิ่มเป็น 100 mg BID', '290 mcg OD ก่อนอาหาร ห้ามใช้ในตับบกพร่อง'], a: 0, e: 'ผู้ใหญ่ 100 mg BID พร้อมอาหาร · ทนไม่ได้ โรคไต Child-Pugh A/B ให้ 75 mg BID · ห้ามใน Child-Pugh C' },
    { q: 'ข้อใดจับคู่ "ชื่อยา – กลไก – ข้อบ่งใช้" ได้ถูกต้องที่สุด', o: ['Alosetron – 5-HT3 antagonist – ท้องเสียจาก IBS ร่วมปวดท้อง', 'Tegaserod – chloride channel activator – IBS-D', 'Lubiprostone – GC-C agonist – ท้องผูกเรื้อรังและ IBS-C', 'Linaclotide – μ-, κ-agonist / δ-antagonist – ท้องผูกเรื้อรังและ IBS-C'], a: 0, e: 'Tegaserod = 5-HT4 agonist ใช้ใน IBS-C · lubiprostone = chloride channel activator · linaclotide = GC-C agonist (μ/κ/δ คือ eluxadoline)' },
  ],
}
