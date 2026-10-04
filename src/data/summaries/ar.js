// Allergic rhinitis — converted from the RxTU10 class summary PDF (see content/summaries/manifest.json)
// ต้นฉบับไม่มีข้อสอบท้ายเรื่อง
export default {
  id: 'ar',
  date: '24/07/2026',
  refs: [
    'Thai Journal of Otolaryngology Head and Neck Surgery. แนวทางเวชปฏิบัติสำหรับโรคจมูกอักเสบภูมิแพ้ในคนไทย (ฉบับปรับปรุง พ.ศ. 2565). Available from: https://www.rcot.org/2021/download/23.pdf',
    'Prednisolone (เพรดนิโซโลน) ใช้รักษาโรคอะไรบ้าง และออกฤทธิ์อย่างไร. รามา แชนแนล. 2026.',
    'คณะแพทยศาสตร์ศิริราชพยาบาล มหาวิทยาลัยมหิดล. Available from: https://www.si.mahidol.ac.th/Th/healthdetail.asp?aid=1258',
    'ยาพ่นแก้คัดจมูก ทำไมยิ่งใช้ยิ่งคัดจมูก? Available from: https://pharmacy.mahidol.ac.th/dic/knowledge_full.php?id=57',
  ],
  sections: [
    { id: 'def', t: 'นิยามและอาการ', html: `<p><b>โรคจมูกอักเสบภูมิแพ้ (allergic rhinitis)</b> คือการอักเสบของเยื่อบุโพรงจมูกจากความผิดปกติของระบบภูมิคุ้มกัน (<b>IgE-mediated type I hypersensitivity</b>) เมื่อผู้ที่ไวต่อสารก่อภูมิแพ้ (จำเพาะแต่ละบุคคล) สัมผัสสารนั้น แล้วเกิดปฏิกิริยากับ IgE ที่จำเพาะ → เยื่อบุจมูกอักเสบ</p>
<h3>Pathophysiology</h3>
<ol>
  <li><b>Sensitization:</b> สัมผัสสารก่อภูมิแพ้ → สร้าง IgE ซึ่งจับกับ mast cell</li>
  <li><b>Early-phase reaction:</b> สัมผัสซ้ำ → cross-linking กับ IgE บน mast cell → degranulation หลั่ง histamine, PG, leukotrienes</li>
  <li><b>Late-phase reaction:</b> อาการเรื้อรังตามมาแม้ไม่ได้รับ allergen แล้ว</li>
</ol>
<h3>อาการ</h3>
<ul>
  <li>คัดจมูก คัน จาม น้ำมูกไหล (น้ำมูกใส) อาจมีตาอักเสบ → มีอาการหลายวัน</li>
  <li>เยื่อบุบวม สูญเสียการรับรู้กลิ่น (anosmia) ในรายรุนแรง</li>
  <li><b>ภาวะแทรกซ้อน:</b> นอนไม่หลับ กระสับกระส่าย ปวดเมื่อย ไซนัสอักเสบเรื้อรัง เลือดกำเดาไหล</li>
  <li><b>Hx:</b> ผื่นแพ้ผิวหนัง (eczema), food allergy, family history ของ AR</li>
</ul>
<h3>Physical examination</h3>
<ol>
  <li>Nasal discharge: สีขาว/ใส/ซีด</li>
  <li>Chronic mouth breathing → <b>adenoid facies</b> (หายใจทางปากนาน รูปหน้าเปลี่ยน: หน้ายาว ปากอ้า ฟันเล็ก คางยื่น)</li>
  <li>Blocked nose</li>
</ol>
<figure><img data-fig="ar/p01-1.webp" alt="ใบหน้าเด็กลักษณะ adenoid facies หน้ายาว ปากอ้า"><figcaption>Adenoid facies</figcaption></figure>
<figure><img data-fig="ar/p01-2.webp" alt="รอยย่นขวางที่สันจมูก (nasal crease) และท่าเอามือดันปลายจมูกขึ้น (allergic salute)"><figcaption>Nasal crease · Allergic salute</figcaption></figure>
<h3>Investigations</h3>
<ul>
  <li>Skin prick test</li>
  <li>Specific IgE ในน้ำเหลือง</li>
</ul>` },
    { id: 'aria', t: 'ARIA classification', html: `<div class="tbl"><table>
  <tr><th>ความถี่</th><th>เกณฑ์</th></tr>
  <tr><td><b>Intermittent</b> (เดิม seasonal)</td><td>อาการ &lt; 4 วัน/สัปดาห์ <b>หรือ</b> ต่อเนื่อง &lt; 4 สัปดาห์</td></tr>
  <tr><td><b>Persistent</b> (เดิม perennial)</td><td>อาการ ≥ 4 วัน/สัปดาห์ <b>และ</b> ต่อเนื่อง ≥ 4 สัปดาห์</td></tr>
</table></div>
<div class="tbl"><table>
  <tr><th>ความรุนแรง</th><th>เกณฑ์</th></tr>
  <tr><td><b>Mild</b></td><td>ครบทุกข้อ: นอนหลับปกติ · ไม่กระทบกิจวัตร กีฬา การพักผ่อน · ไม่กระทบการเรียน/การทำงาน · อาการไม่รบกวน</td></tr>
  <tr><td><b>Moderate–severe</b></td><td>อย่างน้อย 1 ข้อ: รบกวนการนอน (sleep disturbance) · กระทบกิจวัตร กีฬา การพักผ่อน · กระทบการเรียน/การทำงาน · อาการรบกวน (troublesome symptoms)</td></tr>
</table></div>` },
    { id: 'tx', t: 'แนวทางการรักษา', html: `<figure><img data-fig="ar/p03-1.webp" alt="แผนภูมิประเมินและรักษาโรคจมูกอักเสบภูมิแพ้ แยก intermittent/persistent และอาการน้อย (VAS < 5) หรือปานกลาง–มาก (VAS ≥ 5) ประเมินซ้ำทุก 2 สัปดาห์"><figcaption>แนวทางการประเมินและรักษาโรคจมูกอักเสบภูมิแพ้ (VAS 0–10: 0 = ไม่มีอาการ, 10 = อาการมากที่สุด)</figcaption></figure>
<ul>
  <li>พิจารณาล้างจมูกด้วย normal saline</li>
  <li>ถ้าคัดจมูก ให้ intranasal decongestant หรือ oral pseudoephedrine ร่วมกับล้างจมูกได้ถึง 5 วัน</li>
</ul>
<div class="tbl"><table>
  <tr><th>กลุ่ม</th><th>ทางเลือก</th><th>ไม่แนะนำเป็น 1st line</th></tr>
  <tr><td><b>Mild intermittent</b><br>(VAS &lt; 5)</td><td>Oral 2nd gen antihistamine<br>± pseudoephedrine ถ้าคัดจมูก<br>Intranasal corticosteroids</td><td>–</td></tr>
  <tr><td><b>Moderate–severe intermittent</b><br>(VAS ≥ 5)</td><td>Oral 2nd gen antihistamine<br>Intranasal corticosteroids<br>Intranasal antihistamine + intranasal corticosteroids<br>Oral 2nd gen antihistamine + pseudoephedrine ถ้าคัดจมูก</td><td>Oral antihistamine + intranasal corticosteroids (ใช้เมื่อยาอื่นไม่ได้ผล)</td></tr>
  <tr><td><b>Mild persistent</b><br>(VAS &lt; 5)</td><td>Intranasal corticosteroids<br>Oral 2nd gen / intranasal antihistamine<br>Oral 2nd gen antihistamine + pseudoephedrine ถ้าคัดจมูก</td><td>Leukotriene receptor antagonists</td></tr>
  <tr><td><b>Moderate–severe persistent</b><br>(VAS ≥ 5)</td><td>Intranasal antihistamine + intranasal corticosteroids<br>Intranasal corticosteroids<br>Intranasal antihistamine</td><td>Oral 2nd gen antihistamine + intranasal corticosteroids<br>Oral 2nd gen antihistamine + pseudoephedrine</td></tr>
</table></div>
<p><b>ระยะเวลา:</b> ประเมินอาการที่ 5–7 วัน</p>
<h3>การป้องกัน</h3>
<ol>
  <li>หลีกเลี่ยงสารก่อภูมิแพ้ → ลดการสัมผัสไรฝุ่น (house dust mite) ขนสัตว์ เชื้อรา มูลแมลงสาบ</li>
  <li>เด็กกลุ่มเสี่ยง (บิดามารดาหรือพี่น้องเป็นภูมิแพ้): หญิงตั้งครรภ์และให้นมบุตรกินอาหารครบ 5 หมู่ ไม่จำเป็นต้องงดอาหารที่มักทำให้แพ้ เช่น นมวัว ไข่ ถั่วเหลือง แป้งสาลี อาหารทะเล</li>
  <li>กินนมแม่อย่างน้อย 4 เดือน</li>
</ol>` },
    { id: 'drug', t: 'ยาที่ใช้ใน Allergic rhinitis', html: `<h3>1. Antihistamine (H1 receptor antagonist)</h3>
<p>ยับยั้งผลจาก histamine (จาม คัน น้ำมูกไหล) · <mark>ได้ผลดีถ้ากินก่อนเจอ allergen</mark></p>
<div class="tbl"><table>
  <tr><th>รุ่น</th><th>ลักษณะ</th><th>ยาและขนาด</th></tr>
  <tr><td><b>1st gen</b><br>ไม่นิยมใน AR</td><td>ไม่จำเพาะต่อ histamine receptor · เข้าสมองสูง ทำให้ง่วง · anticholinergic SE (ปากแห้ง ตาพร่า ท้องผูก ปัสสาวะคั่ง mydriasis เพิ่มความดันลูกตา ระวังต้อหินมุมปิด) · ออกฤทธิ์ 4–6 ชม. · <b>ไม่แนะนำในหญิงให้นมบุตร</b> (ผ่านน้ำนม)</td><td>Brompheniramine 4 mg q 4–6 hr<br>Chlorpheniramine 4 mg q 4–6 hr<br>Diphenhydramine 25–50 mg q 4–6 hr<br>Dimenhydrinate<br>Cyproheptadine (เพิ่มความอยากอาหาร จากฤทธิ์ antiserotonin)<br>Hydroxyzine 10, 25 mg (ง่วงมาก)<br>Triprolidine</td></tr>
  <tr><td><b>2nd gen</b><br>นิยมใน AR</td><td>จำเพาะต่อ peripheral histamine receptor (efficacy ดีกว่า) · เข้าสมองต่ำ ง่วงน้อยกว่า · anticholinergic SE น้อยกว่า · ออกฤทธิ์ 12–24 ชม. · loratadine, cetirizine ใช้ในหญิงให้นมบุตรได้</td><td>Loratadine 10 mg OD (metabolize ผ่าน CYP3A4 ระวัง DI) · เด็ก ≥ 2 ปี<br>Cetirizine 5–10 mg OD · เด็ก ≥ 6 เดือน<br><small>Astemizole, terfenadine ถูกถอนจากตลาด เพราะเสี่ยง cardiovascular toxicity เมื่อให้ขนาดสูง</small></td></tr>
  <tr><td><b>3rd gen</b></td><td>พัฒนาต่อจาก 2nd gen ให้ออกฤทธิ์นานขึ้นและต้านการอักเสบดี</td><td>Fexofenadine 60 mg q 12 hr / 180 mg OD · <b>ห้ามกินกับน้ำผลไม้หรืออาหารไขมันสูง</b> (ลด bioavailability) และกินห่างยาลดกรด ≥ 2 ชม. · เด็ก ≥ 2 ปี<br>Desloratadine 5 mg OD (อาหารไม่มีผล) · เด็ก ≥ 6 เดือน<br>Levocetirizine 5 mg OD (ง่วงได้) · เด็ก ≥ 6 เดือน</td></tr>
  <tr><td><b>4th gen</b></td><td>ลดผลง่วงนอนลงอีก</td><td>Bilastine 20 mg OD (ระวังในหญิงตั้งครรภ์) · อาหารและน้ำผลไม้ลด bioavailability</td></tr>
</table></div>
<p><b>Intranasal antihistamine:</b> efficacy พอ ๆ กับยากิน และลดอาการคัดจมูกได้ · azelastine HCl พ่นข้างละ BID · SE: ปวดหัว ง่วงนอน ระคายเคืองจมูก คอแห้ง เจ็บคอ เลือดกำเดาเล็กน้อย รสขม</p>
<h3>2. Corticosteroids</h3>
<p><b>Oral:</b> ใช้ใน moderate–severe persistent ที่คัดจมูกและไม่ตอบสนองการรักษาปกติ ให้ระยะสั้นไม่เกิน 6 วัน · prednisolone ไม่เกิน 30 mg/วัน · SE: ปวดท้อง คลื่นไส้ ปวดหัว เบื่ออาหาร มือเท้าบวม</p>
<p><b>Intranasal (นิยมใน AR):</b> ยับยั้งการสร้าง PGs และ leukotriene ลดเซลล์อักเสบในเยื่อบุจมูก ยับยั้งทั้ง early และ late-phase · ลดคัน จาม น้ำมูก คัดจมูก (ครอบคลุมอาการจมูกและตา) · ได้ผลดีโดยเฉพาะ severe/persistent · <b>ใช้ต่อเนื่องอย่างน้อย 2 สัปดาห์จึงเห็นผล</b> · ระวังในหญิงตั้งครรภ์ · SE: ระคายเคืองหรือแสบจมูก จมูกแห้ง เลือดกำเดาเล็กน้อย</p>
<div class="tbl"><table>
  <tr><th>ยา</th><th>ขนาด</th><th>อายุที่ใช้ได้</th></tr>
  <tr><td>Beclomethasone</td><td>1–2 puff BID</td><td>≥ 6 ปี</td></tr>
  <tr><td>Budesonide</td><td>1–2 puff OD</td><td>≥ 6 ปี · อาจใช้ในหญิงให้นมบุตรได้</td></tr>
  <tr><td>Fluticasone furoate</td><td>1–2 puff OD</td><td>≥ 2 ปี</td></tr>
  <tr><td>Fluticasone propionate</td><td>1–2 puff OD</td><td>≥ 4 ปี</td></tr>
  <tr><td>Mometasone</td><td>1–2 puff OD</td><td>≥ 2 ปี</td></tr>
  <tr><td>Triamcinolone acetonide</td><td>1–2 puff OD</td><td>–</td></tr>
</table></div>
<h3>3. Decongestant</h3>
<p>กระตุ้น alpha1-adrenergic receptor → vasoconstriction ลดการบวมของเยื่อบุจมูก ลดคัดจมูกทั้ง allergic และ nonallergic rhinitis</p>
<div class="tbl"><table>
  <tr><th></th><th>Intranasal</th><th>Oral</th></tr>
  <tr><td>ระยะเวลา</td><td><b>ไม่เกิน 5 วัน</b></td><td>Pseudoephedrine ไม่เกิน 10 วัน</td></tr>
  <tr><td>SE</td><td>ระคายเคือง จมูกแห้ง · <mark>rebound congestion</mark> เมื่อใช้ต่อเนื่องเกิน 3–5 วัน → หยุดยาหรือค่อย ๆ ลดขนาด</td><td>หัวใจเต้นเร็ว ใจสั่น ความดันสูง · ระวังใน HT, โรคหลอดเลือดหัวใจ, ต้อหินมุมปิด, ต่อมลูกหมากโต</td></tr>
  <tr><td>ยา</td><td>Naphazoline 1 puff q 6 hr<br>Oxymetazoline 2–3 puff BID<br>Xylometazoline 1 puff TID</td><td>Pseudoephedrine 60 mg q 4–6 hr<br>Phenylephrine 10 mg q 4 hr</td></tr>
</table></div>
<h3>4. Leukotriene receptor antagonists</h3>
<p>ลดคัดจมูก น้ำมูก จาม และอาการ late phase แต่ได้ผลน้อยกว่า intranasal corticosteroids · ใช้ใน mild AR ได้ · <b>montelukast 10 mg OD</b> ใช้ในเด็ก ≥ 6 เดือนและหญิงตั้งครรภ์ได้ · ระวังในหญิงให้นมบุตร (ผ่านน้ำนม)</p>` },
    { id: 'sum', t: 'สรุปการใช้ยา', html: `<ul>
  <li>Oral 2nd gen antihistamine ดีกว่า 1st gen</li>
  <li>Oral antihistamine ดีกว่า leukotriene receptor antagonist (LTRAs)</li>
  <li><b>Intranasal corticosteroids ดีกว่า oral antihistamine</b> และปลอดภัยสูงในขนาดที่ใช้รักษา → เป็น <mark>1st line ใน moderate–severe persistent AR</mark></li>
  <li>Oral corticosteroids ได้ผลแต่มี systemic side effect ชัดเจนและกระทบการมองเห็น ปัจจุบันใช้ intranasal แทน</li>
  <li>Intranasal decongestant ออกฤทธิ์เร็วกว่า มี DI และผลข้างเคียงน้อยกว่า oral decongestant</li>
  <li>Pseudoephedrine บรรเทาคัดจมูกจาก AR ได้ เมื่อมีข้อบ่งชี้ ไม่เกิน 10 วันต่อเนื่อง</li>
</ul>
<div class="key"><strong class="k">ลำดับการใช้ยาพ่น เมื่อคัดจมูกเด่น</strong>พ่น intranasal decongestant → รอ 10–15 นาที ล้างจมูก → รอ 10–15 นาที พ่น intranasal corticosteroids</div>
<p><b>Rhinitis medicamentosa:</b> หาสาเหตุที่ทำให้คัดจมูก หยุด intranasal decongestant · ถ้ายังต้องใช้ยาหดหลอดเลือด ให้ oral decongestant ร่วมกับ intranasal corticosteroids หรืออาจให้ oral corticosteroids ระยะสั้นช่วงแรกถ้าคัดจมูกมาก</p>` },
  ],
  questions: [],
}
