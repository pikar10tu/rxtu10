// Eye — trachoma, glaucoma, cataract, corneal ulcer — converted from the RxTU10 class summary PDF (see content/summaries/manifest.json)
export default {
  id: 'eye-others',
  date: '26/07/2026',
  refs: [
    'Last A, Burton M, Harding-Esch E. Trachoma. UpToDate; 2025.',
    'SA Health. Trachoma — including symptoms, treatment and prevention. Government of South Australia.',
    'Michels TC, Ivan O. Glaucoma: diagnosis and management. Am Fam Physician. 2023;107(3):253–62.',
    'Khawaja A, et al. Primary Open-Angle Glaucoma. EyeWiki; 2024.',
    'Weizer JS. Angle-closure glaucoma. UpToDate; 2025.',
    'ปริยา จารุจินดา. ทำความรู้จักกับต้อกระจก (Cataract). ศูนย์การแพทย์กาญจนาภิเษก คณะแพทยศาสตร์ศิริราชพยาบาล; 2565.',
    'GBD 2019 Blindness and Vision Impairment Collaborators. Causes of blindness and vision impairment in 2020 and trends over 30 years. Lancet Glob Health. 2021;9(2):e144–e160.',
    'American Academy of Ophthalmology. Preferred Practice Pattern®: Cataract in the Adult Eye. 2024.',
    'Jacobs DS. Cataract in adults. UpToDate; updated Jan 30, 2026.',
    'โรงพยาบาลศิริราช. คู่มือการปฏิบัติตัวสำหรับผู้ป่วยโรคแผลกระจกตา. 2556.',
    'American Academy of Ophthalmology. Corneal Ulcer. 2024.',
    'Ting DSJ, et al. Infectious keratitis: an update on epidemiology, causative microorganisms, risk factors, and antimicrobial resistance. Eye (Lond). 2021;35:1084–101.',
    'Kanski JJ, Bowling B. Clinical Ophthalmology: A Systematic Approach. 10th ed. Elsevier; 2024.',
  ],
  sections: [
    { id: 'trachoma', t: 'ริดสีดวงตา (Trachoma)', html: `<p><b>Trachoma</b> คือ chronic keratoconjunctivitis จากการติดเชื้อ <i>Chlamydia trachomatis</i> ซ้ำ ๆ → พังผืดที่เยื่อบุตา หนังตาผิดรูป ขนตาทิ่มกระจกตา กระจกตาขุ่น และตาบอดถาวรได้</p>
<p><b>ปัจจัยเสี่ยง:</b> เข้าถึงน้ำสะอาดไม่พอ ที่อยู่แออัด สุขอนามัยไม่ดี ไม่ล้างหน้า ขาดสุขาภิบาล (ไม่มีส้วม) · ผู้หญิงเกิดภาวะแทรกซ้อนจากแผลเป็นมากกว่าผู้ชาย ~2 เท่า</p>
<p><b>Pathophysiology:</b> เชื้อบุกรุกเซลล์เยื่อบุผิว → follicular conjunctivitis · ติดครั้งเดียวมักหายเอง แต่ติดซ้ำในพื้นที่ระบาด → อักเสบเรื้อรัง พังผืดดึงเปลือกตาม้วนเข้า (entropion) → ขนตาเสียดสีกระจกตา (trichiasis) → แผล หลอดเลือดงอกผิดปกติ กระจกตาขุ่น ตาบอด</p>
<p><b>อาการ:</b> ระยะ active เด็กส่วนใหญ่ไม่มีอาการ บางรายตาแดง ปวด ตาเหนียว ขี้ตา น้ำมูก · ติดเชื้อและหายซ้ำหลายปีจนวัยรุ่น/ผู้ใหญ่เกิดพังผืด · ระยะฟักตัว 5–10 วัน · แพร่เชื้อได้ ~2–3 เดือน</p>
<h3>WHO simplified grading</h3>
<div class="tbl"><table>
  <tr><th>ระยะ</th><th>ความหมาย</th></tr>
  <tr><td>TF</td><td>Trachomatous inflammation – follicular</td></tr>
  <tr><td>TI</td><td>Trachomatous inflammation – intense</td></tr>
  <tr><td>TS</td><td>Trachomatous scarring</td></tr>
  <tr><td>TT</td><td>Trachomatous trichiasis (ขนตาทิ่มกระจกตา)</td></tr>
  <tr><td>CO</td><td>Corneal opacity (สัมพันธ์กับตาบอด)</td></tr>
</table></div>
<p>วินิจฉัยจากการตรวจเยื่อบุตาด้านในเปลือกตาบนเป็นหลัก · NAAT/PCR ไวและจำเพาะที่สุดแต่แพง ใช้ในงานวิจัย/เฝ้าระวัง</p>
<h3>Pharmacology</h3>
<ul>
  <li><b>Azithromycin:</b> macrolide จับ <b>50S</b> ยับยั้งการสร้างโปรตีน (bacteriostatic) · ดูดซึมดี กระจายเข้าเนื้อเยื่อและเม็ดเลือดขาวสูง Vd สูง <b>t½ ~68 ชม. จึงให้ครั้งเดียวได้</b> · ผ่านตับเล็กน้อย ขับทางน้ำดีเป็นหลัก</li>
  <li><b>Tetracycline 1% eye ointment:</b> จับ 30S · ดูดซึมเข้าระบบน้อยมาก</li>
</ul>
<h3>SAFE strategy (WHO)</h3>
<ul>
  <li><b>S – Surgery</b> สำหรับ trichiasis</li>
  <li><b>A – Antibiotics:</b> <mark>azithromycin 20 mg/kg PO ครั้งเดียว (max 1 g)</mark> แบบ mass drug administration (MDA) · ใช้ azithromycin ไม่ได้: tetracycline 1% eye ointment วันละ 2 ครั้ง 6 สัปดาห์ · ทำ MDA ปีละครั้งในพื้นที่ที่ TF ในเด็ก 1–9 ปี ≥ 5% ประเมินซ้ำหลัง 6–12 เดือน</li>
  <li><b>F – Facial cleanliness</b> ส่งเสริมการล้างหน้า</li>
  <li><b>E – Environmental improvement</b> สุขาภิบาล น้ำสะอาด ลดแมลงวันที่เป็นพาหะ</li>
</ul>` },
    { id: 'poag', t: 'ต้อหินมุมเปิด (POAG)', html: `<p>ต้อหินเป็นสาเหตุสำคัญของตาบอดถาวร พบ ~3.5% ในอายุ ≥ 40 ปี · <b>POAG พบมากที่สุด (70–75%)</b> ระยะแรกมักไม่มีอาการจึงวินิจฉัยไม่ทัน</p>
<p><b>POAG:</b> มุมระบายน้ำเปิดปกติ แต่เส้นประสาทตาเสื่อม (optic neuropathy) และสูญเสียลานสายตาค่อยเป็นค่อยไป มักสัมพันธ์กับ IOP สูง (บางรายปกติได้)</p>
<p><b>ปัจจัยเสี่ยง:</b> <b>IOP สูง (ปัจจัยเดียวที่ปรับได้)</b> · อายุ &gt; 40 · ประวัติครอบครัว · เชื้อสายแอฟริกัน/ลาติน · สายตาสั้น · กระจกตาบาง · เบาหวานชนิดที่ 2 · ความดันโลหิตต่ำ · ใช้สเตียรอยด์นาน</p>
<p><b>วินิจฉัย:</b> วัด IOP (Goldmann applanation tonometry) · gonioscopy พบมุมเปิด · optic disc cupping และ RNFL thinning · visual field · OCT · central corneal thickness</p>
<p><b>Pathophysiology:</b> aqueous humor ระบายผ่าน trabecular meshwork ลดลง → IOP สูง → กดที่ lamina cribrosa เลือดไปเลี้ยงเส้นประสาทตาลด → retinal ganglion cells ตาย → ลานสายตาเสียและเส้นประสาทตาฝ่อถาวร</p>
<p><b>อาการ:</b> ระยะแรกไม่มีอาการ → ลานสายตารอบนอกแคบ (tunnel vision) → สูญเสียการมองเห็นส่วนกลาง ตาบอด · severity แบ่งตามลานสายตา: mild, moderate, severe (tunnel vision), end-stage</p>
<h3>ยา</h3>
<div class="tbl"><table>
  <tr><th>กลุ่ม</th><th>ADME</th></tr>
  <tr><td>Prostaglandin analogs (latanoprost, travoprost, bimatoprost)</td><td>หยอดตา prodrug ถูกเปลี่ยนในกระจกตา ออกฤทธิ์ 24 ชม. ขับทางไตในรูป metabolite</td></tr>
  <tr><td>β-blocker (timolol)</td><td>ดูดซึมผ่านกระจกตาและเยื่อบุจมูก มี systemic absorption · CYP2D6 · ขับทางไต</td></tr>
  <tr><td>Carbonic anhydrase inhibitors (dorzolamide, brinzolamide)</td><td>ออกฤทธิ์เฉพาะที่ สะสมในเม็ดเลือดแดง ขับทางไต</td></tr>
  <tr><td>α2-agonist (brimonidine)</td><td>ดูดซึมผ่านตา ตับ metabolize ขับทางไต</td></tr>
  <tr><td>Acetazolamide (oral)</td><td>ดูดซึมดี metabolize น้อย ขับทางไตเป็นหลัก</td></tr>
</table></div>
<h3>การรักษา</h3>
<p>เป้าหมาย: <b>ลด IOP 20–30% จากค่าเริ่มต้น</b> ชะลอการเสื่อมของเส้นประสาทตา</p>
<ol>
  <li><b>First-line: prostaglandin analogs</b> (latanoprost, travoprost, tafluprost, bimatoprost) — ลด IOP ดี ใช้วันละครั้ง</li>
  <li>คุมไม่ได้: เพิ่มหรือเปลี่ยนเป็น timolol, CAI หรือ brimonidine</li>
  <li>ยาไม่พอ: selective laser trabeculoplasty (SLT) · MIGS · trabeculectomy · tube shunt</li>
</ol>
<p>AAO PPP 2024 และ EGS 2024 เน้น individualized target IOP · เริ่มด้วย SLT หรือ prostaglandin analog ก็ได้</p>` },
    { id: 'pacg', t: 'ต้อหินมุมปิด (PACG)', html: `<p>มุมระบายน้ำในช่องหน้าลูกตาแคบหรือปิด → aqueous humor ระบายลด → IOP สูง → เส้นประสาทตาถูกทำลาย</p>
<p><b>ปัจจัยเสี่ยง:</b> ประวัติครอบครัว · อายุ &gt; 60 · เพศหญิง · <b>สายตายาว</b> · เอเชียตะวันออก/Inuit · pseudoexfoliation · <mark>ยาที่ทำให้รูม่านตาขยาย</mark>: anticholinergics, antidepressants, antipsychotics, adrenergic agonists, ยาแก้คัดจมูกบางชนิด</p>
<p><b>วินิจฉัย:</b> ส่งจักษุแพทย์ทันที · visual acuity, pupil, IOP, slit-lamp, visual field, fundus · <b>gonioscopy เป็น gold standard</b> · เพิ่มเติม ultrasound biomicroscopy, anterior segment OCT</p>
<p><b>Pathophysiology:</b> เลนส์อยู่ด้านหน้ากว่าปกติ → <b>pupillary block</b> → ความดันหลังม่านตาดันม่านตาโป่งไปปิดมุม → IOP สูง · นาน ๆ trabecular meshwork เป็นพังผืด</p>
<div class="tbl"><table>
  <tr><th></th><th>Acute angle-closure</th><th>Chronic angle-closure</th></tr>
  <tr><td>กลไก</td><td>มุมปิดทั้งหมดเฉียบพลัน IOP สูงเร็ว</td><td>มุมปิดทีละน้อย trabecular meshwork เป็นพังผืด</td></tr>
  <tr><td>อาการ</td><td>ตามัวเฉียบพลัน เห็นวงรุ้ง (halos) ปวดตารุนแรง ปวดศีรษะ คลื่นไส้ อาเจียน · ตาแดง corneal edema กระจกตาขุ่น anterior chamber ตื้น mid-dilated pupil ตอบสนองแสงลด IOP สูง · มักเกิดตอนเย็นหรือที่แสงน้อย (รูม่านตาขยาย)</td><td>ไม่มีอาการระยะแรก ลานสายตารอบนอกเสีย IOP ปกติหรือสูงเล็กน้อย มักพบเมื่อเส้นประสาทตาเสียแล้ว</td></tr>
  <tr><td>ความเร่งด่วน</td><td><b>Ophthalmic emergency</b> เสียการมองเห็นได้ในชั่วโมงถึงวัน</td><td>ค่อยเป็นค่อยไป</td></tr>
</table></div>
<h3>ยา</h3>
<div class="tbl"><table>
  <tr><th>ยา</th><th>กลไก</th><th>ADME</th></tr>
  <tr><td>Timolol (หยอด)</td><td>β-blocker ที่ ciliary body ลดการสร้าง aqueous humor</td><td>ดูดซึมผ่านกระจกตา/เยื่อบุ เข้า systemic · CYP2D6 · ไต</td></tr>
  <tr><td>Apraclonidine (หยอด)</td><td>α2-agonist ลดการสร้าง aqueous และเพิ่ม uveoscleral outflow</td><td>เข้า systemic เล็กน้อย · ตับ · ไต</td></tr>
  <tr><td>Pilocarpine (หยอด)</td><td>Muscarinic agonist หดกล้ามเนื้อหูรูดม่านตา (miosis) เปิด trabecular meshwork เพิ่มการระบาย</td><td>เข้าสู่ anterior chamber · ตับ · ไต</td></tr>
  <tr><td>Acetazolamide (PO/IV)</td><td>CAI ลดการสร้าง aqueous ที่ ciliary body</td><td>F 90–100% · กระจายสู่ ciliary body, RBC · metabolize น้อย ขับทางไตในรูปเดิม</td></tr>
  <tr><td>Mannitol (IV)</td><td>Osmotic diuretic ดึงน้ำออกจากลูกตา ลด IOP เร็ว</td><td>อยู่ใน ECF ไม่ผ่าน BBB/blood–ocular barrier · ไม่ถูก metabolize ขับทางไตในรูปเดิม</td></tr>
</table></div>
<h3>Acute PACG</h3>
<ol>
  <li><b>ยาหยอด</b> timolol 0.5% + apraclonidine 1% + pilocarpine 2% <b>ร่วมกับ acetazolamide 500 mg PO หรือ IV</b></li>
  <li>ประเมิน IOP ซ้ำใน 30–60 นาที · ยังสูงให้ซ้ำ พิจารณา IV mannitol (ภายใต้จักษุแพทย์)</li>
  <li><b>Definitive: laser peripheral iridotomy (LPI)</b> เจาะรูเล็กที่ม่านตาส่วนปลาย → aqueous ไหลผ่าน แก้ pupillary block เปิดมุม · ทำ LPI ไม่ได้ → surgical peripheral iridectomy</li>
</ol>
<p><b>Chronic PACG:</b> LPI · ยาลด IOP · cataract extraction · goniosynechialysis ในรายที่มีพังผืดที่มุม</p>` },
    { id: 'cataract', t: 'ต้อกระจก (Cataract)', html: `<p>สาเหตุอันดับ 1 ของตาบอดที่รักษาได้ (โดยเฉพาะอายุ ≥ 50 ปี) · GBD 2020: ตาบอดจากต้อกระจก ~15.2 ล้านคน มองเห็นบกพร่องปานกลาง–รุนแรง ~78.8 ล้านคน</p>
<p><b>นิยาม:</b> เลนส์ตาขุ่น แสงผ่านไปจอประสาทตาน้อยลง มองเห็นพร่ามัว</p>
<p><b>ปัจจัยเสี่ยง:</b> อายุ (หลัก) · UV · บาดเจ็บที่ตา · เบาหวานและโรคตาบางชนิด · <b>สเตียรอยด์ระยะยาว</b> · กรรมพันธุ์/แต่กำเนิด</p>
<p><b>วินิจฉัย:</b> ตามัวเรื้อรัง ไม่ปวด ค่อย ๆ แย่ลง · visual acuity · slit-lamp พบ lens opacity · dilated fundus · เพิ่มเติม tonometry, OCT, biometry ก่อนผ่าตัด</p>
<p><b>Pathophysiology:</b> อายุและ oxidative stress (UV บุหรี่ เบาหวาน สเตียรอยด์) → ROS ออกซิไดซ์โปรตีน crystallins จับตัวเป็นก้อน เส้นใยเลนส์เสื่อม → light scattering · เบาหวาน: polyol pathway สะสม sorbitol ดึงน้ำเข้าเลนส์บวม และ glycation ของโปรตีน · เปลี่ยนแปลงย้อนกลับไม่ได้</p>
<p><b>อาการ:</b> ตามัวเหมือนมีฝ้า ภาพซ้อน สายตาเปลี่ยนบ่อย (โดยเฉพาะสั้นขึ้น) เห็นแสงกระจายตอนกลางคืน แพ้แสง เห็นสีเพี้ยน</p>
<div class="tbl"><table>
  <tr><th>ตำแหน่ง</th><th>ลักษณะ</th></tr>
  <tr><td>Nuclear</td><td>พบมากที่สุด ดำเนินโรคช้า myopic shift</td></tr>
  <tr><td>Cortical</td><td>Glare · radial spoke appearance</td></tr>
  <tr><td>Posterior subcapsular</td><td>ดำเนินโรคเร็ว อ่านหนังสือลำบาก แพ้แสงมาก · <mark>พบใน steroid-induced cataract</mark></td></tr>
</table></div>
<p><b>ความรุนแรง:</b> immature (ขุ่นบางส่วน ยังเห็น red reflex) → mature (ขุ่นทั้งเลนส์ red reflex หาย) → hypermature (เปลือกเลนส์ละลาย เสี่ยงต้อหินทุติยภูมิ)</p>
<h3>การรักษา</h3>
<p><b>ไม่มียาที่ทำให้หายหรือชะลอโรคได้</b> · มาตรฐานคือผ่าตัด เมื่อการมองเห็นรบกวนชีวิต (อ่าน ขับรถ ทำงานไม่ได้) cataract-induced glaucoma หรือบดบังการตรวจจอตา</p>
<ul>
  <li><b>Gold standard: phacoemulsification + IOL</b> (แผลเล็ก ฟื้นเร็ว astigmatism น้อย แทรกซ้อนต่ำ) · ทางเลือก ECCE, MSICS, ICCE (ใช้น้อยมาก)</li>
  <li>ยาหลังผ่าตัด: prednisolone acetate · NSAIDs (ketorolac, nepafenac, bromfenac) · antibiotic eye drops · intracameral cefuroxime หรือ moxifloxacin ลด endophthalmitis</li>
</ul>
<div class="tbl"><table>
  <tr><th>ยา</th><th>กลไก</th><th>ADME</th></tr>
  <tr><td>Prednisolone acetate 1%</td><td>Corticosteroid ยับยั้ง phospholipase A2 ลดการอักเสบหลังผ่าตัด</td><td>ผ่านกระจกตาสู่ aqueous · hydrolysis ในตาและตับ · ไต</td></tr>
  <tr><td>Ketorolac 0.5%</td><td>NSAID ยับยั้ง COX-1/2 ลดปวดและอักเสบ</td><td>ผ่านกระจกตา · ตับ · ไต</td></tr>
  <tr><td>Nepafenac 0.1/0.3%</td><td>Prodrug → amfenac ยับยั้ง COX ป้องกัน cystoid macular edema</td><td>กระจายถึง anterior chamber และ retina · ไต</td></tr>
  <tr><td>Bromfenac 0.07–0.09%</td><td>NSAID ยับยั้ง COX-2</td><td>ตับ (CYP2C9) · ไต</td></tr>
  <tr><td>Moxifloxacin 0.5%</td><td>Fluoroquinolone ยับยั้ง DNA gyrase/topoisomerase IV</td><td>Metabolism น้อยมาก · ไตและน้ำดี</td></tr>
  <tr><td>Cefuroxime (intracameral)</td><td>Cephalosporin รุ่น 2 ป้องกัน endophthalmitis ระหว่างผ่าตัด</td><td>ฉีดเข้า anterior chamber · ไม่ถูก metabolize · ไต</td></tr>
</table></div>` },
    { id: 'ulcer', t: 'แผลกระจกตา (Corneal ulcer)', html: `<p>ทำให้สูญเสียการมองเห็นถาวรได้ · พบบ่อยในผู้ใช้คอนแทคเลนส์ (โดยเฉพาะใส่ต่อเนื่อง) ภูมิคุ้มกันบกพร่อง ตาแห้ง/เปลือกตาผิดปกติ · แผลเล็กตื้นอาจหายใน 7 วัน แผลลึกหายแล้วเป็นแผลเป็นขุ่นขาว</p>
<p><b>ปัจจัยเสี่ยง:</b> คอนแทคเลนส์ · เคยติด HSV หรือ VZV · <b>ใช้ steroid eye drops เองโดยไม่มีแพทย์ดูแล</b> · ตาแห้ง · เปลือกตาปิดไม่สนิท (เช่น Bell's palsy) · บาดเจ็บ (เล็บ กระดาษ แปรงแต่งหน้า กิ่งไม้ สารเคมี)</p>
<p><b>วินิจฉัย:</b> slit-lamp (ตำแหน่ง ขนาด ความลึก การอักเสบ) · fluorescein staining · corneal scraping/culture (bacteria, fungus, Acanthamoeba) เมื่อรุนแรงหรือไม่ตอบสนอง</p>
<p><b>Pathophysiology:</b> epithelial injury → เสียแนวกั้น → เชื้อเข้าสู่ stroma → immune response neutrophils cytokines → ทำลาย collagen → ulceration → แผลเป็น สูญเสียการมองเห็น</p>
<p><b>อาการ:</b> ตาแดง ปวด เคือง ตามัว น้ำตาไหล แพ้แสง ฝ้าขาวที่กระจกตา รุนแรงอาจมีหนองในช่องหน้าม่านตา (hypopyon)</p>
<p><b>Severity:</b> mild (เล็ก ตื้น ตอบสนองยา) · moderate (ใหญ่ขึ้น อักเสบมาก มี infiltrate) · severe (ลึก hypopyon กระจกตาบาง/ทะลุ มองเห็นลดมาก — ต้องรักษาเร่งด่วน)</p>
<div class="tbl"><table>
  <tr><th>ยา</th><th>Absorption</th><th>Distribution</th><th>Metabolism</th><th>Excretion</th></tr>
  <tr><td>Moxifloxacin</td><td>ผ่าน cornea → aqueous</td><td>Cornea, anterior chamber</td><td>ตับ (glucuronidation/sulfation)</td><td>ไต</td></tr>
  <tr><td>Acyclovir</td><td>ผ่านกระจกตา · oral F 15–30%</td><td>Cornea, aqueous</td><td>ตับเล็กน้อย</td><td>ไต</td></tr>
  <tr><td>Natamycin</td><td>เฉพาะที่ systemic ต่ำ</td><td>ผิวกระจกตา</td><td>ต่ำ</td><td>น้ำตา/ไต</td></tr>
  <tr><td>Voriconazole</td><td>Topical/oral/IV</td><td>Ocular tissue</td><td>CYP2C19, 2C9, 3A4</td><td>ไต</td></tr>
  <tr><td>Prednisolone acetate</td><td>ผ่าน cornea</td><td>Anterior segment</td><td>ตับและ ocular esterases</td><td>ไต</td></tr>
</table></div>
<h3>การรักษา</h3>
<div class="tbl"><table>
  <tr><th>ชนิด</th><th>ยา</th></tr>
  <tr><td>Bacterial keratitis</td><td>Topical antibiotic แบบเข้มข้น: fluoroquinolone เดี่ยว (moxifloxacin) หรือ fortified antibiotics ในรายรุนแรง (tobramycin + cefazolin)</td></tr>
  <tr><td>Viral (HSV)</td><td>Acyclovir ophthalmic ointment · ganciclovir gel · oral acyclovir ในรายที่เหมาะสม</td></tr>
  <tr><td>Fungal</td><td><mark>Natamycin 5%</mark> เป็นยาหลักของ filamentous fungi · voriconazole บางกรณี</td></tr>
  <tr><td>Acanthamoeba</td><td>PHMB · chlorhexidine (รักษานานและติดตามใกล้ชิด)</td></tr>
</table></div>
<ul>
  <li><b>Corticosteroid</b> อาจพิจารณาหลังคุมการติดเชื้อได้แล้ว ลดการอักเสบและแผลเป็น · ต้องอยู่ภายใต้จักษุแพทย์</li>
  <li><b>Corneal transplantation</b> เมื่อแผลเป็นรุนแรง กระจกตาทะลุ หรือไม่ตอบสนองต่อยา</li>
</ul>` },
  ],
  questions: [
    { q: 'ข้อใดถูกต้องเกี่ยวกับ azithromycin ใน trachoma', o: ['ยับยั้ง bacterial cell wall synthesis', 'จับกับ 30S ribosome', 'มี half-life สั้นจึงต้องให้หลายครั้งต่อวัน', 'จับกับ 50S ribosome และให้แบบ single dose ได้', 'ขับออกทางไตเป็นหลัก'], a: 3, e: 'Azithromycin เป็น macrolide จับ 50S ยับยั้งการสร้างโปรตีน t½ ยาว (~68 ชม.) จึงให้ครั้งเดียวได้ · ขับทางน้ำดีเป็นหลัก' },
    { q: 'ผู้ป่วยถูกกิ่งไม้กระแทกตา ต่อมามีแผลกระจกตาและสงสัย fungal keratitis ยาหลักคือข้อใด', o: ['Natamycin 5%', 'Timolol', 'Cefuroxime', 'Acetazolamide', 'Brimonidine'], a: 0, e: 'Fungal keratitis โดยเฉพาะ filamentous fungi ใช้ natamycin 5% เป็น first-line' },
    { q: 'หญิงอายุ 60 ปี ปวดตารุนแรง ตาแดง ตามัว เห็นแสงเป็นวงรุ้ง คลื่นไส้อาเจียน IOP สูงมาก การรักษาเบื้องต้นที่เหมาะสมคือข้อใด', o: ['Latanoprost เพียงอย่างเดียว', 'Azithromycin oral', 'Timolol + acetazolamide', 'Cataract surgery ทันที', 'Prednisolone eye drop'], a: 2, e: 'Acute PACG เป็นภาวะฉุกเฉิน ต้องลด IOP เร็ว: timolol และ acetazolamide ลดการสร้าง aqueous humor (ร่วมกับ apraclonidine, pilocarpine) · คุม IOP ได้แล้วจึงทำ laser peripheral iridotomy' },
    { q: 'ชายอายุ 65 ปี ตรวจสุขภาพตาพบ IOP สูง optic disc cupping และ RNFL thinning แต่ gonioscopy พบมุมเปิด ไม่มีอาการ การรักษาเริ่มต้นที่เหมาะสมคือข้อใด', o: ['Mannitol IV', 'Laser peripheral iridotomy', 'Latanoprost eye drop', 'Pilocarpine eye drop', 'Cataract surgery'], a: 2, e: 'POAG (มุมเปิด เส้นประสาทตาเสื่อม) · prostaglandin analog เช่น latanoprost เป็น first-line ลด IOP ดีและใช้วันละครั้ง' },
    { q: 'หญิงอายุ 35 ปี อยู่ในพื้นที่ชนบท ตาแดงเรื้อรัง ตรวจพบขนตาม้วนเข้าด้านในเสียดสีกระจกตา วินิจฉัย trachoma ระยะ trichiasis (TT) การรักษาที่เหมาะสมที่สุดคือข้อใด', o: ['Azithromycin 1 ครั้งเพียงอย่างเดียว', 'Prednisolone eye drop เพื่อลดการอักเสบ', 'ผ่าตัดแก้ไขขนตาทิ่มกระจกตา', 'Moxifloxacin eye drop', 'Laser peripheral iridotomy'], a: 2, e: 'ตาม SAFE strategy ระยะ TT รักษาด้วย Surgery เพื่อป้องกันขนตาเสียดสีกระจกตาและลดความเสี่ยงตาบอด' },
  ],
}
