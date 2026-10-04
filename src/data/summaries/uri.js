// Upper respiratory tract infection — converted from the RxTU10 class summary PDF (see content/summaries/manifest.json)
export default {
  id: 'uri',
  date: '28/07/2026',
  refs: [
    'Common cold. Am Fam Physician. 2012. Available from: http://www.aafp.org/afp/2012/0715/p153.html',
    'Turner RB. The Common Cold. Mandell, Douglas, and Bennett\'s Principles and Practice of Infectious Diseases. 2015:748–752.e2.',
    'กองนโยบายแห่งชาติด้านยา สำนักงานคณะกรรมการอาหารและยา. คู่มือแนวทางการใช้ยาอย่างสมเหตุผลสำหรับร้านยาในการดูแลรักษาเบื้องต้น. พิมพ์ครั้งที่ 1.',
    'IDSA clinical practice guideline for acute bacterial rhinosinusitis in children and adults. Clin Infect Dis. 2012.',
    'NICE. Sinusitis (acute): antimicrobial prescribing. Public Health England; 2017.',
    'IDSA clinical practice guideline for group A streptococcal pharyngitis. Clin Infect Dis. 2012.',
    'Harmes KM, et al. Otitis Media: Diagnosis and Treatment. Am Fam Physician. 2013;88(7):435-40.',
  ],
  sections: [
    { id: 'cold', t: 'Common cold', html: `<p><b>สาเหตุ:</b> ไวรัส (rhinovirus 40%, ไม่ทราบ 20–30%, RSV ฯลฯ)</p>
<p><b>อาการ:</b> ไข้ ไอ น้ำมูกไหล คัดจมูก น้ำมูกไหลลงคอ เจ็บคอ ปวดศีรษะ กล้ามเนื้ออ่อนแรง · แยกจาก influenza</p>
<div class="tbl"><table>
  <tr><th>อาการ</th><th>Influenza</th><th>Cold</th></tr>
  <tr><td>Onset</td><td>เฉียบพลัน</td><td>ค่อย ๆ มีอาการ</td></tr>
  <tr><td>ไข้</td><td>ไข้ติดต่อกัน 2–3 วัน</td><td>ไข้ต่ำ</td></tr>
  <tr><td>ปวดตามตัว</td><td>ปวดมาก</td><td>ปวดน้อย</td></tr>
  <tr><td>หนาวสั่น</td><td>พบบ่อย</td><td>พบน้อย</td></tr>
  <tr><td>เหนื่อย อ่อนแรง</td><td>พบบ่อย</td><td>อาจพบบ้าง</td></tr>
  <tr><td>จาม · คัดจมูก · เจ็บคอ</td><td>อาจพบบ้าง</td><td>พบทั่วไป</td></tr>
  <tr><td>ไอ / แน่นหน้าอก</td><td>พบทั่วไป</td><td>ไอจากระคายคอ</td></tr>
  <tr><td>ปวดศีรษะ</td><td>พบทั่วไป</td><td>ไม่ค่อยพบ</td></tr>
</table></div>
<h3>การรักษาตามอาการ (ทั้ง influenza และ cold)</h3>
<div class="tbl"><table>
  <tr><th>อาการ</th><th>ยา</th></tr>
  <tr><td>ไข้</td><td>Paracetamol</td></tr>
  <tr><td>ปวดตามตัว</td><td>Paracetamol, NSAIDs (เช่น ibuprofen)</td></tr>
  <tr><td>คัดจมูก น้ำมูกไหล</td><td>Decongestant, antihistamine</td></tr>
  <tr><td>ไอ</td><td>Antitussive (dextromethorphan)</td></tr>
  <tr><td>เสมหะ</td><td>Mucolytic (acetylcysteine, carbocisteine, bromhexine)</td></tr>
</table></div>
<div class="key"><strong class="k">น้ำมูกเปลี่ยนเป็นสีเหลืองเขียว</strong>เป็นการดำเนินโรคปกติของหวัด ไม่แนะนำให้ใช้ antibiotic</div>` },
    { id: 'sinus', t: 'Bacterial rhinosinusitis', html: `<p><b>อาการ:</b> ไข้ ปวดบริเวณใบหน้า สารคัดหลั่งคล้ายหนองไหลจากโพรงจมูก ได้กลิ่นเหม็นจากในโพรงจมูก</p>
<h3>เกณฑ์วินิจฉัย ABRS (เข้าข้อใดข้อหนึ่ง)</h3>
<div class="tbl"><table>
  <tr><th>เกณฑ์</th><th>ลักษณะ</th></tr>
  <tr><td><b>1. Persistent illness</b></td><td>อาการหวัด/ไซนัสอักเสบ โดยเฉพาะน้ำมูก (ใสหรือเหลืองเขียว) และ/หรือไอกลางวัน (daytime cough) ต่อเนื่อง<b>นานกว่า 10 วัน</b>โดยไม่ดีขึ้น</td></tr>
  <tr><td><b>2. Worsening course</b></td><td>อาการไม่รุนแรงหรือดีขึ้นแล้วในช่วงแรก (หลัง 5 วัน) ต่อมาแย่ลง เช่น กลับมามีไข้ แน่นจมูก เจ็บใบหน้า น้ำมูกเหลืองเขียว ไอ post nasal drip (double sickening) ภายใน 10 วันแรก</td></tr>
  <tr><td><b>3. Severe symptoms</b></td><td>รุนแรงมาก เช่น <b>ไข้ ≥ 39°C</b> ร่วมกับอาการบ่งชี้ไซนัสอักเสบชัด โดยเฉพาะน้ำมูกเหลืองเขียว<b>ติดต่อกัน 72 ชม.</b></td></tr>
</table></div>
<p>กรณีที่ 3 ช่วงแรกให้เฝ้าดูและรักษาเบื้องต้น (ล้างจมูก ยาลดคัดจมูก ลดไข้ แก้ปวด) ยังไม่ให้ antibiotic ถ้าไม่ดีขึ้นหลัง 72 ชม. จึงวินิจฉัย ABRS และสั่ง antibiotic</p>
<h3>การรักษา</h3>
<ul>
  <li><b>First line:</b> amoxicillin, amoxicillin/clavulanate</li>
  <li>แพ้ penicillin: doxycycline หรือ fluoroquinolone (levofloxacin, moxifloxacin)</li>
  <li><b>ไม่แนะนำ macrolide</b> เช่น azithromycin เพราะเชื้อดื้อ</li>
  <li>แนะนำล้างจมูกด้วยน้ำเกลือ</li>
</ul>
<div class="tbl"><table>
  <tr><th>ยา</th><th>เด็ก</th><th>ผู้ใหญ่</th></tr>
  <tr><td>Penicillin V (first line)<br>Amoxicillin (ถ้าทนรสชาติไม่ได้หรือไม่มียา)</td><td>1–11 เดือน 62.5 mg QID<br>1–5 ปี 125 mg QID<br>6–11 ปี 250 mg QID<br>× 5 วัน</td><td>500 mg QID × 5 วัน</td></tr>
  <tr><td>Amoxicillin/clavulanate<br>(ลำดับถัดไป เมื่อใช้ first line 2–3 วันแล้วแย่ลง)</td><td>1 เดือน–5 ปี: 0.25 mL/kg ของ 125/31 suspension TID<br>6–12 ปี: 0.15 mL/kg ของ 250/62 suspension TID<br>× 5 วัน</td><td>500/125 mg TID × 5 วัน</td></tr>
</table></div>` },
    { id: 'pharyn', t: 'Pharyngitis / Tonsillitis', html: `<p><b>สาเหตุ:</b> ไวรัสหรือแบคทีเรีย (group A Streptococcus, <i>S. pyogenes</i>) เน้นที่แบคทีเรีย · <b>อาการ:</b> เจ็บคอ คอแดง ต่อมน้ำเหลืองใต้ขากรรไกรโต มักไม่ไอ</p>
<div class="tbl"><table>
  <tr><th>ไวรัส</th><th>แบคทีเรีย (GAS)</th></tr>
  <tr><td>ไอ · น้ำมูกไหล · เสียงแหบ · แผลหรือตุ่มน้ำใสในปาก · ตาแดง · ท้องร่วง · ตุ่มน้ำใสที่ฝ่ามือฝ่าเท้า · ปวดกล้ามเนื้อทั่วตัว (อาจเป็นไข้หวัดใหญ่) · ผื่น viral exanthema · ปวดศีรษะ</td><td>อายุ 5–15 ปี · เจ็บคอและมีไข้ฉับพลัน · คอแดงร่วมกับทอนซิลแดง · ทอนซิลบวม อาจมีคราบขาว (exudate) หรือลิ้นไก่บวมแดง · จุดเลือดออกที่เพดานปาก (palatal petechiae) · ต่อมน้ำเหลืองด้านหน้าคอโตและกดเจ็บ · ไม่มี viral symptoms/coryza · ผื่น scarlatiniform · ลิ้นมีฝ้าขาวและตุ่มลิ้นบวมแดงคล้ายสตรอเบอร์รี</td></tr>
  <tr><td>วินิจฉัยว่าเป็นจากไวรัส · Centor/McIsaac 0–2 ไม่ต้องตรวจ RADT หรือ throat swab culture และไม่สั่ง antibiotic</td><td>ใช้ Centor หรือ McIsaac score ประเมินโอกาสติดเชื้อ GAS · <b>3–4 คะแนน</b> ไม่จำเป็นต้องตรวจเพิ่ม พิจารณาให้ antibiotic ได้เลย</td></tr>
</table></div>
<h3>Modified Centor criteria (McIsaac score)</h3>
<div class="tbl"><table>
  <tr><th>ข้อมูล</th><th>คะแนน</th><th>คำอธิบาย</th></tr>
  <tr><td>อายุ 3–14 ปี</td><td>+1</td><td>GAS พบบ่อย</td></tr>
  <tr><td>อายุ 15–44 ปี</td><td>0</td><td>พบปานกลาง</td></tr>
  <tr><td>อายุ ≥ 45 ปี</td><td>−1</td><td>พบน้อย</td></tr>
  <tr><td>ไข้ &gt; 38°C</td><td>+1</td><td>ไม่มีไข้หรือไข้ต่ำบ่งชี้ไวรัส แต่ไวรัสอาจไข้สูงได้ เช่น ไข้หวัดใหญ่</td></tr>
  <tr><td>ไม่ไอ</td><td>+1</td><td>ไอและ coryza เป็นอาการของไวรัส</td></tr>
  <tr><td>คราบขาว (exudate) ที่ทอนซิล หรือทอนซิลบวม</td><td>+1</td><td>Exudate พบในโรคอื่นได้ เช่น infectious mononucleosis</td></tr>
  <tr><td>ต่อมน้ำเหลืองด้านหน้าคอโตและกดเจ็บ</td><td>+1</td><td>Anterior cervical lymph nodes</td></tr>
</table></div>
<p style="font-size:.9em">ต้นฉบับเขียนอีกจุดว่า "คะแนนรวมมากกว่า 4 คะแนน ให้ antibiotics" ซึ่งไม่ตรงกับตารางแนวทางที่แนบมา (3–4 คะแนนพิจารณาให้ยาได้) จึงใช้ตามตารางแนวทาง</p>
<h3>Antibiotic</h3>
<div class="tbl"><table>
  <tr><th>ยา</th><th>เด็ก</th><th>ผู้ใหญ่</th></tr>
  <tr><td>Amoxicillin (first line)</td><td>50 mg/kg/day</td><td>500 mg BID</td></tr>
  <tr><td>Penicillin V (first line)</td><td>50 mg/kg/day</td><td>500 mg BID</td></tr>
  <tr><td>Cephalexin (แพ้ penicillin แบบไม่ใช่ type 1)</td><td>20 mg/kg/dose BID</td><td>500 mg BID</td></tr>
  <tr><td>Roxithromycin (แพ้ penicillin type 1)</td><td>5–8 mg/kg/day แบ่ง BID</td><td>300 mg OD</td></tr>
  <tr><td>Erythromycin suspension/dry syrup (แพ้ penicillin type 1)</td><td>30–50 mg/kg/day แบ่ง 2–4 ครั้ง</td><td>–</td></tr>
</table></div>
<p>Erythromycin estolate สำหรับเด็ก &lt; 6 ปี (ห้ามใช้ในโรคตับ) · erythromycin stearate หรือ ethylsuccinate สำหรับเด็กเล็ก</p>
<div class="key"><strong class="k">รักษา 10 วัน</strong>เพื่อป้องกัน rheumatic fever / rheumatic heart disease</div>` },
    { id: 'om', t: 'Otitis media', html: `<p><b>สาเหตุ:</b> ไวรัสหรือแบคทีเรีย (<i>S. pneumoniae, H. influenzae</i>) เน้นที่แบคทีเรีย</p>
<p><b>อาการ:</b> ไข้ ปวดตึงหู มีสารคัดหลั่งจากหู · เด็กอาจบ่นเจ็บหู แคะหูบ่อย นอนไม่หลับ</p>
<p><b>รักษาตามอาการ:</b> paracetamol หรือ ibuprofen บรรเทาปวด</p>
<div class="tbl"><table>
  <tr><th>ยา</th><th>เด็ก</th><th>ผู้ใหญ่</th></tr>
  <tr><td>Amoxicillin (first line)</td><td>80–90 mg/kg/day q 12 hr</td><td>500 mg q 8 hr</td></tr>
  <tr><td>Amoxicillin/clavulanate (first line)</td><td>90 mg/kg/day</td><td>875 mg q 12 hr หรือ 500 mg q 8 hr</td></tr>
</table></div>
<div class="tbl"><table>
  <tr><th>กลุ่ม</th><th>ระยะเวลา</th></tr>
  <tr><td>อายุ ≤ 2 ปี หรือ &gt; 6 เดือนที่อาการรุนแรง</td><td>10 วัน</td></tr>
  <tr><td>อายุ &gt; 2 ปี อาการไม่รุนแรง</td><td>5–7 วัน หรือ observation</td></tr>
</table></div>` },
  ],
  questions: [
    { q: 'ชายไทยอายุ 25 ปี คัดจมูก น้ำมูกใส จาม เจ็บคอเล็กน้อยมาประมาณ 4 วัน มีไข้ต่ำ เมื่อเข้าสู่วันที่ 5 น้ำมูกเริ่มเปลี่ยนเป็นสีเหลืองเขียวแต่ไม่มีกลิ่นเหม็น ควรให้ยาในข้อใด', o: ['Amoxicillin capsule 500 mg รับประทานวันละ 4 ครั้ง 5 วัน', 'Amoxicillin capsule 1000 mg รับประทานวันละ 2 ครั้ง 5 วัน', 'Penicillin V 500 mg รับประทานวันละ 4 ครั้ง 7 วัน', 'Amoxicillin/clavulanic acid 875/125 mg รับประทานวันละ 3 ครั้ง 7 วัน', 'ไม่จำเป็นต้องใช้ยาปฏิชีวนะ'], a: 4, e: 'น้ำมูกเปลี่ยนเป็นสีเหลืองเขียวเป็นการดำเนินโรคปกติของหวัด ไม่แนะนำให้ใช้ antibiotic' },
    { q: 'ชายไทยอายุ 20 ปี วินิจฉัยว่าเป็นไซนัสอักเสบเฉียบพลันจากแบคทีเรีย ได้ amoxicillin 500 mg วันละ 4 ครั้ง 5 วัน เมื่อรับประทานไป 3 วันกลับมีอาการแย่ลง ควรปรับเปลี่ยนหรือเลือกยาใด', o: ['รับประทานยาที่เหลือจนครบ', 'เพิ่มระยะเวลาจาก 5 วันเป็น 10 วัน', 'เปลี่ยนเป็น doxycycline 200 mg วันละ 1 ครั้ง 5 วัน', 'เปลี่ยนเป็น amoxicillin/clavulanic acid 500/125 mg วันละ 3 ครั้ง 5 วัน', 'เปลี่ยนเป็น amoxicillin/clavulanic acid 875/125 mg วันละ 3 ครั้ง 5 วัน'], a: 3, e: 'Amoxicillin/clavulanate 500/125 mg TID เป็นยาลำดับถัดไป เมื่อใช้ first line 2–3 วันแล้วอาการแย่ลง' },
    { q: 'อาการใดไม่ใช่อาการที่พบจากโรคไซนัสอักเสบเฉียบพลันจากแบคทีเรีย', o: ['มีอาการหวัด ผ่านไประยะหนึ่งน้ำมูกเปลี่ยนเป็นสีเหลืองเขียว ไอกลางวันต่อเนื่องนานกว่า 10 วันโดยไม่ดีขึ้น', 'อาการหวัดรุนแรงมาก ไข้สูงกว่า 39 องศาเซลเซียส น้ำมูกสีเหลืองเขียวติดต่อกันนานกว่า 72 ชั่วโมง', 'มีอาการหวัด น้ำมูกใส ไข้ต่ำ ครั่นเนื้อครั่นตัวเล็กน้อย ไอบางครั้ง', 'มีอาการหวัดแต่ดีขึ้น ต่อมาแย่ลง เช่น กลับมามีไข้ แน่นจมูก เจ็บใบหน้า น้ำมูกสีเหลืองเขียว ไอ post nasal drip', 'ทุกข้อเป็นอาการที่พบได้จากไซนัสอักเสบเฉียบพลันจากแบคทีเรีย'], a: 2, e: 'น้ำมูกใส ไข้ต่ำ ครั่นเนื้อครั่นตัวเป็นอาการของหวัดธรรมดา · ข้ออื่นตรงกับเกณฑ์ persistent, severe และ worsening course' },
    { q: 'เด็กหญิงอายุ 5 ปี หนัก 20 kg เจ็บคอและมีไข้ฉับพลัน ตุ่มลิ้นบวมแดงคล้ายผิวสตรอเบอร์รี คอแดงร่วมกับทอนซิลแดง มีคราบขาวที่ทอนซิล ไม่ไอ ไม่มีน้ำมูก เมื่ออายุ 3 ปีเคยได้ amoxicillin แล้วมีผื่นแดงและแน่นหน้าอกหลังได้ยา 1 ชั่วโมง จงวินิจฉัยและเลือกยาที่เหมาะสม', o: ['ทอนซิลอักเสบจากไวรัส รักษาตามอาการ', 'ทอนซิลอักเสบจากแบคทีเรีย rechallenge ด้วย amoxicillin dry syrup 1000 mg วันละครั้ง 10 วัน', 'ทอนซิลอักเสบจากแบคทีเรีย rechallenge ด้วย amoxicillin/clavulanic acid 500/125 dry syrup 1000 mg วันละครั้ง 10 วัน', 'ทอนซิลอักเสบจากแบคทีเรีย ให้ cephalexin dry syrup 400 mg วันละ 2 ครั้ง 10 วัน', 'ทอนซิลอักเสบจากแบคทีเรีย ให้ erythromycin estolate dry syrup 750 mg ต่อวัน 10 วัน'], a: 4, e: 'อาการเข้าได้กับ GAS · เคยแพ้ penicillin แบบ type 1 (ผื่น แน่นหน้าอกใน 1 ชม.) จึงห้าม rechallenge และควรเลี่ยง cephalexin · erythromycin estolate เป็นทางเลือกในเด็กเล็กที่แพ้ penicillin type 1 (750 mg/day = 37.5 mg/kg/day)' },
    { q: 'เด็กอายุ 4 ปี มาร้านยากับแม่ เมื่อคืนปวดหูข้างขวาเล็กน้อย แคะหูบ่อย มีไข้ต่ำ ๆ เพิ่งหายจากหวัด เภสัชกรพิจารณาว่าเข้าได้กับหูชั้นกลางอักเสบจากการติดเชื้อ หากจ่าย amoxicillin ควรให้ยานานเท่าใด', o: ['1–3 วัน', '3–5 วัน', '5–7 วัน', '7–10 วัน', '10–14 วัน'], a: 2, e: 'เด็กอายุเกิน 2 ปีที่อาการไม่รุนแรง ให้ antibiotic 5–7 วันได้' },
  ],
}
