// Tuberculosis — converted from the RxTU10 class summary PDF (see content/summaries/manifest.json)
export default {
  id: 'tb',
  date: '28/07/2026',
  refs: [
    'กองวัณโรค กรมควบคุมโรค กระทรวงสาธารณสุข. แนวทางการควบคุมวัณโรคประเทศไทย พ.ศ. 2564 (National Tuberculosis Control Programme Guideline, Thailand 2021). พิมพ์ครั้งที่ 2. นนทบุรี; 2565.',
    'WHO consolidated guidelines on tuberculosis. Module 1: Preventive tuberculosis treatment.',
  ],
  sections: [
    { id: 'def', t: 'นิยามและพยาธิกำเนิด', html: `<p><b>วัณโรค (TB)</b> เกิดจาก <i>Mycobacterium tuberculosis</i> (กลุ่ม M. tuberculosis complex) เกิดได้ทุกอวัยวะ แต่พบที่<b>ปอดมากที่สุด (80%)</b> · ติดต่อจากคนสู่คนทาง<b>อากาศ (airborne)</b></p>
<div class="tbl"><table>
  <tr><th>กลุ่ม Mycobacterium</th><th>ลักษณะ</th></tr>
  <tr><td>M. tuberculosis complex (MTBC)</td><td>ก่อวัณโรคในคนและสัตว์ · พบบ่อยที่สุดคือ M. tuberculosis</td></tr>
  <tr><td>Nontuberculous mycobacteria (NTM)</td><td>ส่วนใหญ่ไม่ก่อโรคในคน ยกเว้นผู้ภูมิคุ้มกันอ่อนแอ</td></tr>
  <tr><td>M. leprae</td><td>โรคเรื้อน</td></tr>
</table></div>
<h3>Pathogenesis</h3>
<p>หายใจเข้า → เชื้อเข้าถุงลม → macrophage เป็นด่านแรก → ถ้ากำจัดไม่หมด เชื้อแบ่งตัว + dendritic cells และ monocytes พาเชื้อไปต่อมน้ำเหลืองในปอดเพื่อกระตุ้น T cell → T และ B cells มาล้อม macrophages ที่มีเชื้อ เรียกว่า <b>granuloma</b> → <b>latent TB infection</b> · ถ้าเชื้อใน granuloma แบ่งตัวเกินที่คุมได้ จะเข้ากระแสเลือดแพร่ไปอวัยวะต่าง ๆ → <b>active TB disease</b></p>
<figure><img data-fig="tb/p01-1.webp" alt="ภาพพยาธิกำเนิดวัณโรค: เชื้อเข้าถุงลม macrophage จับกิน และการเกิด granuloma"><figcaption>Pathogenesis of tuberculosis</figcaption></figure>
<figure><img data-fig="tb/p01-2.webp" alt="ภาพการดำเนินโรคจาก latent TB infection ไปเป็น active TB disease"><figcaption>จาก latent TB infection สู่ active TB disease</figcaption></figure>
<div class="tbl"><table>
  <tr><th>Latent TB infection</th><th>Active TB disease</th></tr>
  <tr><td>เชื้อน้อย ไม่ลุกลาม</td><td>เชื้อมาก ลุกลาม</td></tr>
  <tr><td><b>ไม่แพร่</b>สู่ผู้อื่น</td><td><b>แพร่</b>สู่ผู้อื่น</td></tr>
  <tr><td>ไม่มีอาการ</td><td>อาจไอ ไข้ เจ็บหน้าอก ไอมีเลือดหรือเสมหะ น้ำหนักลด เหงื่อออกกลางคืน อ่อนเพลีย เบื่ออาหาร (ระยะแรกอาจไม่มีอาการ)</td></tr>
  <tr><td>TST หรือ IGRA บวก</td><td>TST หรือ IGRA บวก</td></tr>
  <tr><td>Chest X-ray ปกติ</td><td>Chest X-ray มักผิดปกติเข้ากับวัณโรค (อาจปกติในภูมิคุ้มกันต่ำรุนแรงหรือวัณโรคนอกปอด)</td></tr>
  <tr><td>AFB smear/culture ลบ</td><td>AFB smear/culture มักบวก (อาจลบในวัณโรคนอกปอด แผลเล็ก หรือระยะแรก)</td></tr>
  <tr><td>พิจารณารักษา LTBI เพื่อป้องกัน active TB</td><td>รักษา active TB</td></tr>
  <tr><td>ไม่ต้องแยกจากคนอื่น · ไม่ใช่ผู้ป่วยวัณโรค</td><td>อาจต้องแยก · เป็นผู้ป่วยวัณโรค</td></tr>
</table></div>
<h3>อาการ</h3>
<ul>
  <li><b>วัณโรคปอด:</b> ไข้ต่ำ ๆ นาน ๆ · <b>ไอเรื้อรัง &gt; 2–3 สัปดาห์</b> · ไอมีเสมหะหรือเลือดปน · เจ็บหน้าอก หายใจลำบาก · เหงื่อออกกลางคืน · น้ำหนักลด · อ่อนเพลีย</li>
  <li><b>วัณโรคนอกปอด</b> ตามอวัยวะ: ต่อมน้ำเหลือง (โตแต่ไม่เจ็บ กดแล้วกลิ้งได้) · เยื่อหุ้มปอด (คล้ายวัณโรคปอด) · กระดูกและข้อ (ปวด เคลื่อนไหวลำบาก) · ทางเดินปัสสาวะและอวัยวะเพศ (เจ็บเชิงกราน ปัสสาวะไม่ออก) · ช่องท้อง (ปวดท้อง ท้องมาน น้ำหนักลด) · CNS (ปวดหัว ไข้ ชัก)</li>
</ul>` },
    { id: 'lab', t: 'การตรวจและการจำแนกผู้ป่วย', html: `<div class="tbl"><table>
  <tr><th>การตรวจ</th><th>รายละเอียด</th></tr>
  <tr><td><b>1. AFB microscopy</b></td><td>ผนังเซลล์มี mycolic acid ทนการล้างด้วยแอลกอฮอล์กรดหลังย้อม · Ziehl–Neelsen: กล้องธรรมดา เห็นแท่งสีแดง · auramine–rhodamine: กล้อง fluorescence เห็นแท่งเรืองแสงเหลือง · <b>ข้อจำกัด:</b> แยก MTBC กับ NTM ไม่ได้ แยกการดื้อยาไม่ได้ แยกเชื้อเป็นหรือตายไม่ได้</td></tr>
  <tr><td><b>2. Culture &amp; identification</b></td><td><mark>Gold standard ทำทุกรายที่สงสัย</mark> · solid media 2–8 สัปดาห์ · liquid media 1–6 สัปดาห์ · ไวและจำเพาะ นำเชื้อไปทดสอบความไวและสายพันธุ์ต่อได้</td></tr>
  <tr><td>3. Drug susceptibility testing</td><td>เทียบการเจริญในอาหารที่มีและไม่มียา (phenotypic DST)</td></tr>
  <tr><td>4. Molecular testing</td><td>เพิ่มจำนวน DNA ของเชื้อ ตรวจได้เร็ว จำเพาะ · แยกไม่ได้ว่า DNA มาจากเชื้อที่ยังมีชีวิตหรือไม่</td></tr>
  <tr><td>5. TB antigen testing</td><td>ใช้ antibody จำเพาะจับ antigen ของเชื้อจากสิ่งส่งตรวจโดยตรง</td></tr>
  <tr><td>6. Immune reactivity testing</td><td>ดูว่าภูมิคุ้มกันเคยสัมผัสเชื้อหรือไม่ · ใช้วินิจฉัยวัณโรคแฝง · <b>TST</b> และ <b>IGRA</b></td></tr>
</table></div>
<figure><img data-fig="tb/p03-1.webp" alt="ภาพเชื้อ AFB ย้อมสี Ziehl–Neelsen เห็นเป็นแท่งสีแดง"><figcaption>Ziehl–Neelsen stain</figcaption></figure>
<figure><img data-fig="tb/p03-2.webp" alt="ภาพเชื้อ AFB ย้อม auramine–rhodamine เรืองแสงสีเหลือง"><figcaption>Auramine–rhodamine fluorescent stain</figcaption></figure>
<h3>การค้นหาผู้ป่วย</h3>
<ul>
  <li><b>แบบตั้งรับ</b> (patient-initiated): ผู้มีอาการมาตรวจที่สถานพยาบาล</li>
  <li><b>แบบคัดกรอง</b> (screening): ค้นในกลุ่มเสี่ยง มีหรือไม่มีอาการก็ได้</li>
</ul>
<div class="tbl"><table>
  <tr><th>ผู้มีโรคหรือภาวะเสี่ยง (clinical risk)</th><th>ประชากรเสี่ยง (risk populations)</th></tr>
  <tr><td>ติดเชื้อ HIV · เบาหวาน (โดยเฉพาะคุมไม่ได้) · ใช้ยากดภูมิ เช่น มะเร็ง ปลูกถ่ายอวัยวะ SLE · COPD หรือสูบบุหรี่ · silicosis · โรคไตเรื้อรัง · ผ่าตัดกระเพาะ ตัดต่อลำไส้ · ภาวะทุพโภชนาการ · ติดสุรา · เคยเป็นวัณโรค</td><td>ผู้สัมผัสวัณโรค โดยเฉพาะเด็ก &lt; 5 ปี หรือสัมผัสวัณโรคดื้อยา · ผู้สูงอายุที่มีโรคร่วมหรือติดบ้าน ติดเตียง · ผู้ต้องขังและผู้อยู่ในสถานพินิจ · บุคลากรสาธารณสุข · แรงงานจากประเทศที่วัณโรคสูงและผู้ติดตาม · ผู้อยู่ในที่แออัด เช่น สถานบันเทิง ค่ายทหาร · คนไร้บ้าน</td></tr>
</table></div>
<h3>คำจำกัดความ</h3>
<ul>
  <li><b>Presumptive TB:</b> มีอาการหรืออาการแสดงเข้าได้กับวัณโรค</li>
  <li><b>TB disease:</b> ติดเชื้อแฝงแต่ภูมิคุ้มกันยับยั้งการแบ่งตัวไม่ได้ เกิดพยาธิสภาพ อาจมีหรือไม่มีอาการ</li>
  <li><b>Extensive (advanced) TB:</b> มีแผลโพรงในปอดทั้งสองข้าง หรือเนื้อปอดถูกทำลายมาก</li>
  <li><b>Severe extrapulmonary TB:</b> disseminated TB หรือ TB meningitis</li>
</ul>
<div class="tbl"><table>
  <tr><th>จำแนกตาม</th><th>ประเภท</th></tr>
  <tr><td>ผลตรวจทางแบคทีเรีย</td><td><b>B+</b> (bacteriologically confirmed): smear, culture หรือวิธีอื่นเป็นบวก<br><b>B−</b> (clinically diagnosed): ผลลบหรือไม่มีผล แต่ภาพรังสีหรือชิ้นเนื้อเข้าได้ และแพทย์ตัดสินใจรักษา</td></tr>
  <tr><td>อวัยวะ</td><td><b>PTB</b>: พยาธิสภาพในเนื้อปอดหรือแขนงหลอดลม เสมหะบวกหรือลบก็ได้<br><b>EPTB</b>: อวัยวะอื่นที่ไม่ใช่เนื้อปอด</td></tr>
  <tr><td>สถานะ HIV</td><td>HIV positive · HIV negative · ไม่ทราบสถานะ</td></tr>
</table></div>` },
    { id: 'tx', t: 'การรักษาด้วยยาแนวที่ 1', html: `<h3>ก่อนเริ่มรักษา</h3>
<ol>
  <li>ตรวจ HIV ในผู้ป่วยวัณโรค<b>ทุกราย</b></li>
  <li>ตรวจการทำงานของตับในกลุ่มเสี่ยง: อายุ &gt; 60 ปี ดื่มสุราประจำ เคยเป็นโรคตับหรือมีไวรัสตับอักเสบ ติดเชื้อ HIV ทุพโภชนาการ ตั้งครรภ์</li>
  <li>ตรวจการทำงานของไต</li>
  <li>ตรวจสายตา</li>
  <li>ผู้ดื่มสุราทุกรายต้องได้รับคำแนะนำให้หยุด</li>
  <li>ระวังยาอื่นที่มีผลต่อตับ</li>
</ol>
<div class="key"><strong class="k">ผู้ป่วยรายใหม่: 2HRZE/4HR</strong>ระยะเข้มข้น (intensive) 2 เดือน HRZE + ระยะต่อเนื่อง (continuation) 4 เดือน HR · คำนวณขนาดตามน้ำหนักตัว</div>
<div class="tbl"><table>
  <tr><th>น้ำหนักก่อนรักษา (kg)</th><th>H (mg)<br><small>4–6 mg/kg/วัน</small></th><th>R (mg)<br><small>8–12 mg/kg/วัน</small></th><th>Z (mg)<br><small>20–30 mg/kg/วัน</small></th><th>E (mg)<br><small>15–20 mg/kg/วัน</small></th></tr>
  <tr><td>35–49</td><td>300</td><td>450</td><td>1,000</td><td>800</td></tr>
  <tr><td>50–69</td><td>300</td><td>600</td><td>1,500</td><td>1,000</td></tr>
  <tr><td>≥ 70</td><td>300</td><td>600</td><td>2,000</td><td>1,200</td></tr>
</table></div>
<p><b>Population heterogeneity:</b> เชื้อแบ่งตัวไม่พร้อมกัน · <b>fast-dividing</b> ไวต่อยาหลายตัว โดยเฉพาะ isoniazid และ rifampicin · <b>slow-dividing/non-replicating</b> ดื้อยาหลายชนิด</p>
<h3>ยาแนวที่ 1</h3>
<div class="tbl"><table>
  <tr><th>ยา</th><th>MOA</th><th>ADR</th><th>PK</th></tr>
  <tr><td><b>Isoniazid (H)</b></td><td>Prodrug → isonicotinic acid ยับยั้งการสร้าง mycolic acid · bactericidal เมื่อเชื้อแบ่งตัว bacteriostatic เมื่อเชื้อเจริญช้า</td><td><b>1. Peripheral neuropathy</b>: dose-related จากขาด B6 (H จับ B6 → สร้าง PLP ไม่ได้ → สารสื่อประสาทเสียสมดุล) · เสี่ยงใน HIV, DM, ตั้งครรภ์, ให้นม, โรคไต · ให้ B6 ป้องกัน 10–25 mg OD รักษา 50–75 mg OD<br><b>2. Hepatitis</b>: H → acetylisoniazid → acetylhydrazine (พิษต่อตับ) หรือกลไก autoimmune · สัมพันธ์กับใช้นาน อายุมาก โรคร่วม ใช้ยาวัณโรคหลายตัว<br>3. Optic neuritis (จากขาด B6)<br>4. Skin rash · 5. Arthralgia · 6. Hypersensitivity</td><td>ดูดซึมดี กระจายเข้าเนื้อเยื่อดี รักษาวัณโรคนอกปอดได้ · ขับทางไตเป็นหลัก</td></tr>
  <tr><td><b>Rifampicin (R)</b></td><td>จับ β-subunit ของ DNA-dependent RNA polymerase ยับยั้ง transcription</td><td><b>1. Hepatotoxicity / hyperbilirubinemia</b>: (1) กระตุ้น CYP450 และ UGT ทำให้การกำจัด bilirubin เปลี่ยน direct bilirubin สะสมชั่วคราว (2) cholestatic effect ลดการขับ bile acids และ direct bilirubin<br><b>2. สารคัดหลั่งสีส้ม</b><br>3. Flu-like symptoms</td><td>อาหารลดการดูดซึม → <b>กินตอนท้องว่าง</b> · เข้า CSF ได้ (สำคัญใน TB meningitis) · ขับทางน้ำดี · <b>potent inducer ของ CYP3A4, 2C9, 2C19</b></td></tr>
  <tr><td><b>Pyrazinamide (Z)</b></td><td>Prodrug → pyrazinoic acid ยับยั้งการสร้าง fatty acid · bactericidal โดยเฉพาะเชื้อที่แบ่งตัวช้า</td><td><b>1. Hyperuricemia</b> (ลดการขับและเพิ่มการดูดกลับ uric acid ที่ท่อไต → ปวดข้อหลายข้อ แต่ไม่ใช่เกาต์)<br>2. N/V · 3. Photosensitivity, rash<br><b>4. Hepatotoxicity</b> ~1% dose-dependent · incidence สูงสุดในการเกิด hepatitis</td><td>กระจายดีทั่วร่างกาย · ขับทางไต · GFR &lt; 30 ต้องปรับขนาด</td></tr>
  <tr><td><b>Ethambutol (E)</b></td><td>ยับยั้งการสร้าง arabinogalactan ในผนังเซลล์</td><td><b>1. Optic neuritis</b> (main toxicity): dose-related เกิดหลังใช้ &gt; 1 เดือน · ตาพร่า เห็นจุดดำตรงกลาง ตาบอดสีแดง/เขียว เจ็บเวลากลอกตา · หยุดยาแล้วหายได้ · ถามอาการทุกครั้งที่นัด · มองเห็นผิดปกติให้หยุดทันที ถ้าหยุดแล้วไม่ดีขึ้นอาจหยุด isoniazid ด้วย<br>2. Peripheral neuropathy (rare) · 3. GI upset · 4. Rash · 5. Fever</td><td>ดูดซึมดี · ขับทางไตเป็นหลัก → ปรับขนาดในไตบกพร่อง</td></tr>
</table></div>` },
    { id: 'adr', t: 'การจัดการอาการไม่พึงประสงค์', html: `<div class="tbl"><table>
  <tr><th>อาการ</th><th>ยาที่อาจเป็นสาเหตุ</th><th>การจัดการ</th></tr>
  <tr><td colspan="3"><b>รุนแรงหรือมีแนวโน้มรุนแรง</b> → หยุดยาที่อาจเป็นสาเหตุและส่งปรึกษาผู้เชี่ยวชาญ</td></tr>
  <tr><td>ผื่นคัน ผื่นที่ไม่มีอาการคัน</td><td>H, R, Z</td><td>หยุดยารักษาวัณโรค</td></tr>
  <tr><td>ดีซ่าน (ไม่พบสาเหตุอื่น) ตับอักเสบ</td><td>H, Z, R</td><td>หยุดยารักษาวัณโรค</td></tr>
  <tr><td>สับสน (สงสัยร่วมกับตับวาย)</td><td>เกือบทุกตัว</td><td>หยุดยารักษาวัณโรค</td></tr>
  <tr><td>การมองเห็นบกพร่อง</td><td>E</td><td>หยุด ethambutol</td></tr>
  <tr><td>ช็อก ผื่น purpura ไตวายเฉียบพลัน</td><td>R</td><td>หยุด rifampicin</td></tr>
  <tr><td colspan="3"><b>ไม่รุนแรง</b> → ให้ยาต่อได้โดยตรวจสอบขนาดยา</td></tr>
  <tr><td>เบื่ออาหาร คลื่นไส้ ปวดท้อง</td><td>Z, R, H</td><td>กินยาพร้อมอาหารปริมาณน้อยหรือก่อนนอน · ถ้ายังไม่ดีขึ้นหรือรุนแรง (อาเจียนต่อเนื่อง) ส่งปรึกษาแพทย์</td></tr>
  <tr><td>ปวดข้อ</td><td>Z</td><td>NSAID หรือ paracetamol</td></tr>
  <tr><td>แสบ ชา เจ็บปลายมือปลายเท้า</td><td>H</td><td>Pyridoxine 50–75 mg/วัน</td></tr>
  <tr><td>ง่วงนอน</td><td>H</td><td>กินยาก่อนนอน</td></tr>
  <tr><td>ปัสสาวะสีส้มแดง</td><td>R</td><td>อธิบายให้ผู้ป่วยทราบ</td></tr>
  <tr><td>อาการคล้ายไข้หวัดใหญ่</td><td>R</td><td>พิจารณาหยุดยาถ้ารุนแรง</td></tr>
</table></div>
<h3>ปฏิกิริยาทางผิวหนัง</h3>
<div class="tbl"><table>
  <tr><th>อาการ</th><th>คำแนะนำ</th></tr>
  <tr><td>คันแต่ไม่มีผื่น</td><td>Antihistamine + กินยาต่อได้</td></tr>
  <tr><td>ผื่นคล้ายสิว อาจคัน ไม่มีอาการ systemic</td><td>ให้ยาต่อได้ ไม่อันตราย</td></tr>
  <tr><td>MP rash หลายตำแหน่ง</td><td>หยุดยาทุกตัว + antihistamine ± prednisolone ขนาดต่ำ</td></tr>
  <tr><td>ผื่นรุนแรง + รอยโรคที่เยื่อบุ</td><td>หยุดยาทุกตัว admit + systemic steroid ขนาดสูง</td></tr>
</table></div>
<p><b>เริ่มยาใหม่หลังผื่นไม่รุนแรงหาย:</b> ทีละตัว เริ่ม isoniazid หรือ rifampicin → ethambutol → pyrazinamide · แต่ละตัวเริ่ม 1/3–1/2 ของขนาดเต็ม เพิ่มจนเต็มใน 2–3 วัน · ผื่นขึ้นตอนเริ่มตัวไหนให้หยุดตัวนั้น รอผื่นยุบแล้วเริ่มตัวถัดไป</p>
<h3>คลื่นไส้อาเจียนระหว่างรักษา</h3>
<div class="tbl"><table>
  <tr><th>AST/ALT</th><th>คำแนะนำ</th></tr>
  <tr><td>&gt; 3 เท่าของค่าปกติ</td><td>หยุด H, R, Z · อาจให้ ethambutol, levofloxacin, aminoglycoside ไปก่อน · ดีขึ้นและเอนไซม์ตับปกติ → re-challenge H และ R</td></tr>
  <tr><td>≤ 3 เท่า</td><td>ให้ยาต่อ + หาสาเหตุอื่น ตรวจตับซ้ำใน 3 วัน</td></tr>
</table></div>
<h3>ผลเลือดผิดปกติโดยไม่มีอาการ</h3>
<div class="tbl"><table>
  <tr><th>ผลเลือด</th><th>คำแนะนำ</th></tr>
  <tr><td>Total bilirubin &gt; 3 mg/dL แต่ AST/ALT ปกติหรือเพิ่ม ≤ 3 เท่า</td><td>หยุด rifampicin</td></tr>
  <tr><td>AST/ALT &lt; 5 เท่า</td><td>ให้ยาต่อ + ตรวจตับทุก 1 สัปดาห์</td></tr>
  <tr><td>AST/ALT &gt; 5 เท่า</td><td>หยุด H, R, Z · อาจให้ ethambutol, levofloxacin, aminoglycoside ไปก่อน</td></tr>
</table></div>
<h3>Re-challenge</h3>
<div class="tbl"><table>
  <tr><th>หัวข้อ</th><th>คำแนะนำ</th></tr>
  <tr><td>Fulminant hepatitis</td><td>ห้ามใช้ยากลุ่มนี้อีก</td></tr>
  <tr><td>เกณฑ์เริ่ม</td><td>AST/ALT &lt; 2 เท่า + total bilirubin &lt; 1.5 mg/dL</td></tr>
  <tr><td>ลำดับ</td><td>Isoniazid → rifampicin → pyrazinamide</td></tr>
  <tr><td>ขนาดเริ่มต้น</td><td>ขนาดปกติ</td></tr>
  <tr><td>ระยะห่าง</td><td>อย่างน้อย 1 สัปดาห์ก่อนเริ่มตัวใหม่</td></tr>
  <tr><td>ติดตาม</td><td>ตรวจ AST/ALT และ total bilirubin ภายใน 1 สัปดาห์หลังเริ่มแต่ละตัว · ถ้าเพิ่มขึ้นหยุดตัวนั้นทันทีและห้ามใช้อีก</td></tr>
  <tr><td>NAT2 genotype</td><td>พิจารณาตรวจในผู้ที่เกิด drug-induced hepatitis เพื่อกำหนดขนาด isoniazid</td></tr>
</table></div>` },
    { id: 'monitor', t: 'การติดตามและการขาดยา', html: `<h3>การตรวจก่อนเริ่มและระหว่างรักษา</h3>
<div class="tbl"><table>
  <tr><th>การตรวจ</th><th>ก่อนเริ่ม</th><th>ระหว่างรักษา (สิ้นสุดเดือนที่)</th></tr>
  <tr><td>อาการทางคลินิก · ชั่งน้ำหนัก</td><td>✓</td><td>ทุกเดือน 1–6</td></tr>
  <tr><td>AFB smear</td><td>✓</td><td>2, 5, 6 · เดือน 3 ถ้า AFB เดือนที่ 2 ยังบวก</td></tr>
  <tr><td>อณูชีววิทยา</td><td>✓ เพื่อวินิจฉัยและทดสอบความไวของเชื้อ</td><td>เดือน 2 ถ้า AFB บวก (กรณีไม่มีผล DST ก่อนรักษา) · เดือน 5 ถ้า AFB บวก</td></tr>
  <tr><td>เพาะเชื้อและทดสอบความไว (phenotypic DST)</td><td>พิจารณาตามความเหมาะสม หรือถ้าอณูชีววิทยาพบเชื้อดื้อยา</td><td>เดือน 2 และ 5 ถ้า AFB บวก</td></tr>
  <tr><td>ภาพรังสีทรวงอก</td><td>✓</td><td>เดือน 6</td></tr>
  <tr><td>HIV test</td><td>✓</td><td></td></tr>
  <tr><td>LFT</td><td>✓ ในกลุ่มเสี่ยงตับอักเสบ (อายุ &gt; 60 ดื่มสุรา โรคตับหรือไวรัสตับอักเสบ HIV ทุพโภชนาการ ตั้งครรภ์)</td><td></td></tr>
  <tr><td>BUN, Cr</td><td>✓ ในกลุ่มเสี่ยงไตเสื่อม (เบาหวาน ความดัน โรคไต ผู้สูงอายุ ผู้ที่จะได้ aminoglycosides)</td><td></td></tr>
  <tr><td>ตรวจสายตา</td><td>✓ ในผู้สูงอายุหรือผู้มีปัญหาสายตาเดิม</td><td></td></tr>
</table></div>
<h3>รักษาใหม่หลังขาดยาหรือหยุดยา</h3>
<p>พิจารณาเฉพาะเมื่อ (1) ไม่มีอาการทางคลินิกแย่ลง (2) ภาพรังสีทรวงอกไม่แย่ลง และ (3) เสมหะไม่พบเชื้อหรือไม่มากขึ้น · แนะนำส่งเสมหะตรวจอณูชีววิทยา เพาะเชื้อ และทดสอบความไวก่อน · หาสาเหตุที่ขาดยาและรักษาภายใต้ DOT ทุกราย</p>
<figure><img data-fig="tb/p12-1.webp" alt="แผนภูมิการพิจารณารักษาหลังขาดยา: ขาดยาในระยะเข้มข้น น้อยกว่า 14 วันให้ต่อจนครบ ตั้งแต่ 14 วันเริ่มใหม่; ขาดยาระยะต่อเนื่อง ได้ยาครบตั้งแต่ 80% ให้ต่อจนครบ น้อยกว่า 80% ขาดยาน้อยกว่า 3 เดือนให้ต่อ ตั้งแต่ 3 เดือนเริ่มใหม่"><figcaption>การพิจารณารักษาหลังขาดยาหรือหยุดยาด้วยเหตุผลใด ๆ (แนวทางวัณโรคประเทศไทย 2564)</figcaption></figure>` },
    { id: 'special', t: 'วัณโรคในกรณีพิเศษ', html: `<h3>1. วัณโรคนอกปอด</h3>
<p>วินิจฉัยเมื่อ: อาการและผลตรวจเข้าได้ หรือพยาธิวิทยาเข้าได้ หรือเพาะเชื้อจากสิ่งส่งตรวจเป็นบวก</p>
<div class="tbl"><table>
  <tr><th>ตำแหน่ง</th><th>ระยะเวลารักษาอย่างน้อย (เดือน)</th><th>Corticosteroid</th></tr>
  <tr><td>ต่อมน้ำเหลือง</td><td>6</td><td>ไม่แนะนำ</td></tr>
  <tr><td>เยื่อหุ้มปอด</td><td>6</td><td>ไม่แนะนำ</td></tr>
  <tr><td>เยื่อหุ้มหัวใจ</td><td>6</td><td>แนะนำบางราย*</td></tr>
  <tr><td>เยื่อหุ้มสมองอักเสบ และ tuberculoma</td><td>&gt; 12</td><td>แนะนำทุกราย*</td></tr>
  <tr><td>กระดูกและข้อ</td><td>9–12</td><td>ไม่แนะนำ</td></tr>
  <tr><td>ทางเดินปัสสาวะ</td><td>6</td><td>ไม่แนะนำ</td></tr>
  <tr><td>แพร่กระจาย</td><td>แล้วแต่อวัยวะเด่น</td><td></td></tr>
</table></div>
<p>* Prednisolone 40–60 mg/วัน 2–4 สัปดาห์ → 30 mg/วัน 2 สัปดาห์ → 15 mg/วัน 2 สัปดาห์ → 5 mg/วัน 1–2 สัปดาห์ (เริ่มตั้งแต่สัปดาห์แรกของการรักษา)</p>
<h3>2. ผู้ติดเชื้อ HIV</h3>
<p>เริ่มยาต้าน HIV ทุกรายเมื่อพร้อมและทนยาวัณโรคได้ · เวลาเริ่มขึ้นกับลักษณะวัณโรค ไม่ขึ้นกับ CD4</p>
<div class="tbl"><table>
  <tr><th>ลักษณะวัณโรค</th><th>เริ่มยาต้าน HIV หลังเริ่มยาวัณโรค</th></tr>
  <tr><td>ทุกชนิด ยกเว้นเยื่อหุ้มสมอง</td><td>ภายใน 2 สัปดาห์ อย่างช้าไม่เกิน 4 สัปดาห์</td></tr>
  <tr><td>เยื่อหุ้มสมอง</td><td>อย่างน้อย 4 สัปดาห์ อย่างช้าไม่เกิน 8 สัปดาห์</td></tr>
</table></div>
<div class="tbl"><table>
  <tr><th>Rifampicin กับยาต้าน HIV</th><th>ยา</th></tr>
  <tr><td><b>ไม่แนะนำให้ใช้ร่วม</b></td><td>NRTIs: TAF · NNRTIs: nevirapine, etravirine, rilpivirine · PIs ทุกตัว · INSTIs: elvitegravir</td></tr>
  <tr><td><b>ต้องปรับขนาด</b></td><td>INSTIs: raltegravir, dolutegravir · CCR5RA: maraviroc</td></tr>
</table></div>
<h3>3. ผู้ป่วยโรคไต (CrCl &lt; 30 หรือล้างไต)</h3>
<div class="tbl"><table>
  <tr><th>ยา</th><th>ปรับ</th><th>ขนาดแนะนำ</th></tr>
  <tr><td>H</td><td>ไม่ปรับ</td><td>เหมือนเดิม</td></tr>
  <tr><td>R</td><td>ไม่ปรับ</td><td>เหมือนเดิม</td></tr>
  <tr><td><b>E</b></td><td>ปรับ</td><td>15–20 mg/kg/วัน 3 วัน/สัปดาห์</td></tr>
  <tr><td><b>Z</b></td><td>ปรับ</td><td>20–30 mg/kg/วัน 3 วัน/สัปดาห์</td></tr>
</table></div>
<h3>4. ผู้ป่วยโรคตับ</h3>
<p>อาการโรคตับเรื้อรัง + ALT &gt; 3 เท่า → เลือกสูตรที่ลดพิษต่อตับตามความรุนแรง</p>
<div class="tbl"><table>
  <tr><th>สูตร</th><th>ตัวอย่าง</th></tr>
  <tr><td>มียาที่มีผลต่อตับ 2 ชนิด</td><td>2HRE/7HR · 6–9 RZE</td></tr>
  <tr><td>มียาที่มีผลต่อตับ 1 ชนิด</td><td>2AmHE/16HE · 12–18 HE + Lfx</td></tr>
</table></div>
<p>นัดติดตามทุก 1 สัปดาห์ใน 2–3 สัปดาห์แรก และทุก 2 สัปดาห์ในช่วง 2 เดือนแรก</p>
<p style="font-size:.9em">ต้นฉบับเขียนแถวล่างว่า "สูตรยาที่มียาที่มีผลต่อตับ 3 ชนิด" แต่สูตร 2AmHE/16HE และ HE + Lfx มียาที่มีผลต่อตับเพียงตัวเดียว (H) จึงแก้เป็น 1 ชนิด</p>
<h3>5. หญิงตั้งครรภ์</h3>
<ul>
  <li>ใช้สูตรมาตรฐานได้ คำนวณขนาดตาม<b>น้ำหนักก่อนตั้งครรภ์</b></li>
  <li>ได้ isoniazid พิจารณาให้ B6 50–100 mg/day</li>
  <li>ให้นมได้ตามปกติ (ยาในน้ำนมน้อย) · ถ้ายังไอมากและเสมหะบวก อาจบีบน้ำนมใส่ขวด</li>
  <li><b>เลี่ยง aminoglycosides และ fluoroquinolones</b></li>
</ul>` },
    { id: 'ltbi', t: 'วัณโรคระยะแฝงและยาแนวที่ 2', html: `<h3>การรักษาวัณโรคระยะแฝง (LTBI)</h3>
<div class="tbl"><table>
  <tr><th>สูตร</th><th>ยา</th><th>ความถี่</th><th>ระยะเวลา</th><th>ขนาด</th></tr>
  <tr><td><b>3HP</b></td><td>Isoniazid + rifapentine</td><td>สัปดาห์ละครั้ง (12 doses)</td><td>3 เดือน</td><td>อายุ 2–14 ปี ตามน้ำหนัก: 10–15 kg H 300/RPT 300 · 16–23 kg H 500/RPT 450 · 24–30 kg H 600/RPT 600 · &gt; 30 kg H 700/RPT 750 mg<br>อายุ &gt; 14 ปี (≥ 30 kg): H 900 + RPT 900 mg</td></tr>
  <tr><td><b>1HP</b></td><td>Isoniazid + rifapentine</td><td>OD (28 doses)</td><td>1 เดือน</td><td>อายุ ≥ 13 ปี: H 300 + RPT 600 mg</td></tr>
  <tr><td><b>4R</b></td><td>Rifampicin</td><td>OD</td><td>4 เดือน</td><td>&lt; 10 ปี: 15 (10–20) mg/kg · ≥ 10 ปี: 10 mg/kg</td></tr>
  <tr><td><b>3HR</b></td><td>Isoniazid + rifampicin</td><td>OD</td><td>3 เดือน</td><td>&lt; 10 ปี: H 10 (7–15) + R 15 (10–20) mg/kg · ≥ 10 ปี: H 5 + R 10 mg/kg</td></tr>
  <tr><td><b>6–9H</b></td><td>Isoniazid</td><td>OD</td><td>6–9 เดือน</td><td>&lt; 10 ปี: 10 (7–15) mg/kg · ≥ 10 ปี: 5 mg/kg</td></tr>
</table></div>
<div class="tbl"><table>
  <tr><th>ยา</th><th>ADR ที่พบบ่อย</th><th>ADR ที่พบน้อย</th></tr>
  <tr><td>Isoniazid</td><td>AST/ALT เพิ่ม · ตับอักเสบ · peripheral neuropathy · ผื่น · ง่วงซึม</td><td>ชัก · pellagra · ปวดข้อ · โลหิตจาง · lupoid reaction</td></tr>
  <tr><td>Rifampicin</td><td>GI (ปวดท้อง คลื่นไส้ อาเจียน) · ตับอักเสบ · generalized cutaneous reactions · thrombocytopenia · สารคัดหลั่งเปลี่ยนสี</td><td>Osteomalacia · pseudomembranous colitis · pseudo adrenal crisis · ไตวายเฉียบพลัน · ช็อก · hemolytic anemia · flu-like</td></tr>
  <tr><td>Rifapentine</td><td>GI · flu-like · ตับอักเสบ · สารคัดหลั่งเปลี่ยนสี</td><td>ความดันต่ำ เป็นลม · เม็ดเลือดขาวหรือแดงต่ำ · เบื่ออาหาร · ไขมันในเลือดสูง</td></tr>
</table></div>
<h3>ยาแนวที่ 2</h3>
<div class="tbl"><table>
  <tr><th>ยา</th><th>MOA</th><th>ADR</th><th>PK</th></tr>
  <tr><td><b>Aminoglycosides</b> (streptomycin, amikacin)</td><td>จับ 30S → misreading ของ mRNA ยับยั้งการสร้างโปรตีน · concentration-dependent killing</td><td><b>Ototoxicity</b> (hearing loss, imbalance, vertigo) · <b>nephrotoxicity</b> (ATN) · neuromuscular blockade (rare) · allergic reaction</td><td>ดูดซึมแย่ → IV/IM · เข้า CNS น้อย · ขับทางไต</td></tr>
  <tr><td><b>Fluoroquinolones</b> (levofloxacin, moxifloxacin, ofloxacin)</td><td>ใช้หลักใน MDR-TB · ยับยั้ง DNA replication และ transcription · bactericidal · concentration-dependent</td><td>N/V ท้องเสีย ปวดท้อง · ปวดหัว มึน นอนไม่หลับ · tendinopathy, tendon rupture · QT prolongation · photosensitivity</td><td>ดูดซึมดี กระจายกว้าง · levofloxacin ขับทางไต · moxifloxacin ขับทางไตและตับ</td></tr>
</table></div>
<p>ยาแนวที่ 2 อื่น ๆ: ethionamide, cycloserine, linezolid, bedaquiline, delamanid</p>` },
  ],
  questions: [
    { q: 'หญิงอายุ 28 ปี เพิ่งได้รับการวินิจฉัยว่าเป็น pulmonary TB รายใหม่ น้ำหนัก 55 kg ไม่มีโรคร่วม สูตรยามาตรฐานที่เหมาะสมที่สุดคือข้อใด', o: ['2HR/4H', '2HRZE/4HR', '6HRZE', '9HR'], a: 1, e: 'สูตรมาตรฐานผู้ป่วยรายใหม่ตามแนวทางวัณโรคประเทศไทย 2564: ระยะเข้มข้น 2 เดือน HRZE และระยะต่อเนื่อง 4 เดือน HR' },
    { q: 'หญิงอายุ 35 ปี เป็น pulmonary TB หลังเริ่มยารักษาวัณโรคเกิดอาการชาที่ปลายมือและปลายเท้า สาเหตุเกิดจากยาใด', o: ['Isoniazid', 'Rifampicin', 'Pyrazinamide', 'Ethambutol'], a: 0, e: 'Isoniazid จับ vitamin B6 ทำให้ B6 ลดลง ซึ่งจำเป็นต่อการสร้างสารสื่อประสาท จึงเกิด peripheral neuropathy' },
    { q: 'ชายอายุ 45 ปี เพิ่งได้รับการวินิจฉัยว่าเป็นวัณโรคปอดรายใหม่ น้ำหนัก 70 kg ไม่มีโรคร่วม ขนาดยาต่อวันตามสูตรมาตรฐานที่เหมาะสมที่สุดคือข้อใด', o: ['Isoniazid 300 mg + rifampicin 600 mg + pyrazinamide 1,500 mg + ethambutol 1,200 mg', 'Isoniazid 100 mg + rifampicin 450 mg + pyrazinamide 1,000 mg + ethambutol 800 mg', 'Isoniazid 400 mg + rifampicin 750 mg + pyrazinamide 2,500 mg + ethambutol 2,000 mg', 'Isoniazid 300 mg + rifampicin 600 mg + pyrazinamide 500 mg + ethambutol 400 mg'], a: 0, e: 'น้ำหนัก 70 kg: isoniazid 4–6 mg/kg = 280–420 mg/วัน · rifampicin 8–12 mg/kg = 560–840 mg/วัน · pyrazinamide 20–30 mg/kg = 1,400–2,100 mg/วัน · ethambutol 15–20 mg/kg = 1,050–1,400 mg/วัน · หมายเหตุ: ต้นฉบับเขียนช่วงเหล่านี้เป็นหน่วย mg/kg/day ซึ่งที่ถูกคือ mg/วัน' },
    { q: 'ชายอายุ 56 ปี น้ำหนัก 68 kg เป็น pulmonary TB รักษาด้วยสูตร 2HRZE มา 5 สัปดาห์ วันนี้มาด้วยตามัว มองเห็นสีแดงและสีเขียวผิดปกติ เห็นจุดดำตรงกลางภาพ AST/ALT ปกติ เภสัชกรควรแนะนำอย่างไร', o: ['หยุด rifampicin เพราะเป็นสาเหตุของ optic neuritis', 'หยุด ethambutol ทันที และแจ้งแพทย์ประเมินการรักษา', 'ให้ vitamin B6 เพิ่มเป็น 100 mg/day แล้วให้ยาทุกตัวต่อ', 'ลดขนาด ethambutol ลงครึ่งหนึ่งและติดตามอาการอีก 2 สัปดาห์'], a: 1, e: 'อาการเข้ากับ optic neuritis จาก ethambutol ต้องหยุดยาทันที' },
    { q: 'ชายอายุ 48 ปี น้ำหนัก 60 kg เป็น pulmonary TB และมี creatinine clearance 22 mL/min ข้อใดเป็นยาที่ต้องปรับขนาด', o: ['Rifampicin และ isoniazid', 'Ethambutol และ pyrazinamide', 'Rifampicin และ pyrazinamide', 'Isoniazid และ ethambutol'], a: 1, e: 'Ethambutol และ pyrazinamide ต้องปรับเป็น 3 วัน/สัปดาห์ เมื่อ CrCl < 30 mL/min หรือล้างไต · หมายเหตุ: ต้นฉบับมีตัวเลือกซ้ำกัน (ก และ ง เป็น rifampicin กับ isoniazid ทั้งคู่) จึงเปลี่ยนตัวเลือก ง เป็น isoniazid และ ethambutol' },
  ],
}
