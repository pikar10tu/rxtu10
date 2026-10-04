// Sexually transmitted diseases & vaginitis — converted from the RxTU10 class summary PDF (see content/summaries/manifest.json)
const pic = (f, alt) => `<figure><img data-fig="std/${f}.webp" alt="${alt}"><figcaption>${alt}</figcaption></figure>`

export default {
  id: 'std',
  date: '27/07/2026',
  refs: [
    'กองโรคเอดส์และโรคติดต่อทางเพศสัมพันธ์ กรมควบคุมโรค. แนวทางการดูแลรักษาโรคติดต่อทางเพศสัมพันธ์ พ.ศ. 2567 (STI Management Guidelines 2024). นนทบุรี; 2567.',
    'ลาวัณย์ สันติชินกุล. โรคซิฟิลิสและแนวทางการรักษา. ศูนย์การศึกษาต่อเนื่องทางเภสัชศาสตร์ สภาเภสัชกรรม; 2565.',
    'Garcia MR, Leslie SW, Wray AA. Sexually Transmitted Infections. StatPearls; 2024. Available from: https://www.ncbi.nlm.nih.gov/books/NBK560808/',
    'เด่นพงศ์ พัฒนเศรษฐานนท์. โรคติดต่อทางเพศสัมพันธ์ (Sexually transmitted disease). ศูนย์การศึกษาต่อเนื่องทางเภสัชศาสตร์ สภาเภสัชกรรม; 2565.',
  ],
  sections: [
    { id: 'def', t: 'ภาพรวม', html: `<p>อัตราป่วยโรคติดต่อทางเพศสัมพันธ์ในไทยเพิ่มจาก 28.8 (ปี 2560) เป็น 31.7 ต่อแสนประชากร (ปี 2565) · กลุ่มเยาวชน 15–24 ปีป่วยมากที่สุด · โรคที่พบบ่อย: <b>ซิฟิลิส หนองใน หนองในเทียม</b> ตามลำดับ</p>
<p><b>นิยาม:</b> โรคติดเชื้อจากการสัมผัสทางเพศ ผ่านเลือด น้ำอสุจิ สารคัดหลั่งช่องคลอดหรือส่วนอื่น · บางกรณีติดได้โดยไม่มีเพศสัมพันธ์ เช่น แม่สู่ลูก รับเลือด ใช้เข็มร่วมกัน</p>
<p><b>ปัจจัยเสี่ยง:</b> มีคู่นอนใหม่หรือหลายคน · ใช้ถุงยางไม่สม่ำเสมอ · คู่นอนมีคู่นอนหลายคน · คู่นอนติด STIs · ใช้สารเสพติด · อยู่ในพื้นที่ที่มี STIs สูง</p>
<div class="key"><strong class="k">ผู้ติดเชื้อ HIV</strong>รักษาเหมือนผู้ป่วยทั่วไปเกือบทุกโรค (บางโรคแผลหายช้า ต้องรักษานานขึ้น)</div>` },
    { id: 'gc', t: 'หนองใน (Gonorrhea)', html: `<p><b>สาเหตุ:</b> <i>Neisseria gonorrhoeae</i> (gram-negative diplococci) · ระยะฟักตัว 1–14 วัน ส่วนใหญ่ 3–5 วัน</p>
<ul>
  <li><b>ชาย:</b> ปัสสาวะแสบขัด มีหนองไหลจากท่อปัสสาวะ · อาจอัณฑะอักเสบหรือเป็นฝีที่อวัยวะเพศ</li>
  <li><b>หญิง:</b> ส่วนใหญ่ไม่มีอาการ ถ้ามีจะมีระดูขาวผิดปกติ ไม่คัน · ตรวจพบปากมดลูกอักเสบ มีหนองที่ปากมดลูก</li>
  <li>ติดเชื้อที่คอและทวารหนักส่วนใหญ่ไม่มีอาการ</li>
</ul>
<p><b>วินิจฉัย:</b> Gram stain พบ <b>gram-negative intracellular diplococci</b> · ยืนยันด้วย culture หรือ NAT (สิ่งส่งตรวจจากท่อปัสสาวะและปากมดลูก)</p>
<h3>Uncomplicated gonorrhea (อวัยวะเพศ คอ ทวารหนัก)</h3>
<div class="tbl"><table>
  <tr><th>ยาแนะนำ</th><th>ยาทางเลือก</th><th>แพ้ cephalosporins</th></tr>
  <tr><td><b>Ceftriaxone 1 g IM ครั้งเดียว</b><br>+ รักษาหนองในเทียมร่วมด้วยถ้าตรวจหาหนองในเทียมไม่ได้</td><td>Cefixime 800 mg + azithromycin 2 g (ไม่ต้องเพิ่มยารักษาหนองในเทียม)</td><td>Gentamicin 160–240 mg (3–5 mg/kg) IM/IV ครั้งเดียว + azithromycin 2 g กินครั้งเดียว<br>Spectinomycin 2 g IM ครั้งเดียว</td></tr>
</table></div>
<ul>
  <li>งดเพศสัมพันธ์จนได้ยาครบและหายปกติ หรืออย่างน้อย 7 วันหลังเริ่มยา และจนคู่นอนได้รับการรักษา</li>
  <li>อาการควรหายเกือบสนิทใน 24 ชม. · ไม่ดีขึ้นใน 7 วัน กลับมาพบแพทย์ (สงสัยเชื้อดื้อหรือ co-infection)</li>
  <li>Gentamicin: หลักฐานไม่พอในหนองในที่ทวารหนัก · ระวัง nephrotoxicity, ototoxicity</li>
</ul>
<p><b>หนองในที่เยื่อบุตาผู้ใหญ่:</b> ตาแดงมาก เปลือกตาบวม ปวดตา ตามัว ขี้ตาเป็นหนองตลอด ต่อมน้ำเหลืองหน้าหูโตกดเจ็บ · ceftriaxone 1 g IM ครั้งเดียว + รักษาหนองในเทียมร่วมถ้าตรวจไม่ได้</p>
<h3>Complicated: disseminated gonococcal infection (DGI)</h3>
<p>Petechiae หรือ pustule ที่ผิวหนัง · asymmetrical polyarthritis, septic oligoarthritis, tenosynovitis · <b>ควรรับไว้ในโรงพยาบาลทุกราย</b></p>
<div class="tbl"><table>
  <tr><th>ชนิด</th><th>การรักษา</th></tr>
  <tr><td>Arthritis-dermatitis syndrome</td><td>Ceftriaxone 1–2 g IV OD หรือ cefotaxime 1 g IV q 8 h → ดีขึ้นเปลี่ยนเป็น cefixime 400 mg BID รวมอย่างน้อย 7 วัน · รักษาหนองในเทียมร่วมถ้าตรวจไม่ได้</td></tr>
  <tr><td>Meningitis</td><td>Ceftriaxone 1–2 g IV q 12 h 10–14 วัน</td></tr>
  <tr><td>Endocarditis</td><td>Ceftriaxone 1–2 g IV q 12 h อย่างน้อย 28 วัน</td></tr>
</table></div>
<p style="font-size:.9em">ต้นฉบับใช้หัวข้อ "โรคหนองในเทียมชนิดมีภาวะแทรกซ้อน" ในส่วนนี้ ซึ่งเนื้อหาเป็นหนองใน (complicated gonorrhea) จึงแก้หัวข้อ</p>
<h3>กลุ่มพิเศษ</h3>
<ul>
  <li><b>คู่เพศสัมพันธ์</b> ภายใน 60 วันก่อนมีอาการ ถ้ามารักษาไม่ได้ฝากยา cefixime 800 mg + azithromycin 2 g กินครั้งเดียว</li>
  <li><b>หญิงตั้งครรภ์/ให้นม:</b> ceftriaxone 1 g IM ครั้งเดียว (cat B)</li>
</ul>
<div class="tbl"><table>
  <tr><th>เด็ก (ไม่ใช่ทารกแรกเกิด)</th><th>&lt; 45 kg</th><th>&gt; 45 kg</th></tr>
  <tr><td>อวัยวะเพศ ทวารหนัก คอ</td><td>Ceftriaxone 50 mg/kg (max 250 mg) IM/IV ครั้งเดียว</td><td>Ceftriaxone 500 mg IM/IV ครั้งเดียว</td></tr>
  <tr><td>เยื่อบุตา</td><td>Ceftriaxone 50 mg/kg (max 1 g) IM/IV ครั้งเดียว</td><td>Ceftriaxone 1 g IM/IV ครั้งเดียว</td></tr>
</table></div>
<p><b>Neonatal conjunctivitis:</b> ตาแดงมาก เปลือกตาบวม ขี้ตาเป็นหนอง มักเป็น 2 ข้าง ภายใน 24–48 ชม. หลังคลอด · ceftriaxone 25–50 mg/kg (max 250 mg) IM/IV ครั้งเดียว หรือ cefotaxime 100 mg/kg (ถ้าใช้ ceftriaxone ไม่ได้) + รักษาหนองในเทียมร่วม (azithromycin) · ระวัง ceftriaxone ในทารกที่มี hyperbilirubinemia โดยเฉพาะคลอดก่อนกำหนด · ทารกที่ไม่มีอาการแต่แม่เป็นหนองในให้รักษาแบบเดียวกัน</p>` },
    { id: 'ngu', t: 'หนองในเทียม (Nongonococcal infection)', html: `<p><b>สาเหตุ:</b> พบมากสุด <i>Chlamydia trachomatis</i> · อื่น ๆ เช่น <i>Mycoplasma genitalium</i>, <i>Trichomonas vaginalis</i></p>
<ul>
  <li><b>ชาย:</b> ปัสสาวะแสบขัด มูกใสหรือขุ่น คันท่อปัสสาวะ</li>
  <li><b>หญิง:</b> ปัสสาวะแสบขัด ติดเชื้อที่ปากมดลูกส่วนใหญ่ไม่มีอาการ ส่วนน้อยมีระดูขาว</li>
</ul>
<p><b>วินิจฉัย:</b> Gram stain <b>ไม่พบ</b> gram-negative intracellular diplococci · ยืนยันด้วย point-of-care test สำหรับ Chlamydia (ปัสสาวะชาย ระดูขาวหญิง) หรือ molecular assays</p>
<div class="tbl"><table>
  <tr><th>ภาวะ</th><th>การรักษา</th></tr>
  <tr><td><b>อวัยวะเพศ / C. trachomatis</b></td><td>แนะนำ: <b>doxycycline 100 mg BID pc 7 วัน</b><br>ทางเลือก: azithromycin 1 g ครั้งเดียว ขณะท้องว่าง (ไม่กินอะไรนาน 2 ชม. ยกเว้นน้ำ) หรือก่อนอาหาร 1 ชม.</td></tr>
  <tr><td>Persistent urethritis (ไม่ทราบเชื้อ)</td><td>เริ่มด้วย azithromycin → เปลี่ยนเป็น doxycycline 7 วัน<br>ได้ doxycycline แล้ว → azithromycin 1 g วันแรก แล้ว 500 mg OD อีก 3 วัน → ไม่ดีขึ้นให้ moxifloxacin 400 mg OD 7 วัน</td></tr>
  <tr><td><i>M. genitalium</i></td><td>Doxycycline 100 mg BID 7 วัน → azithromycin 1 g แล้ว 500 mg OD 3 วัน → ไม่ดีขึ้น moxifloxacin 400 mg OD 7 วัน</td></tr>
  <tr><td><i>T. vaginalis</i></td><td>Metronidazole 2 g ครั้งเดียวก่อนนอน · metronidazole 400–500 mg BID pc 7 วัน (แนะนำในผู้หญิง) · tinidazole 2 g ครั้งเดียวก่อนนอน</td></tr>
  <tr><td>Chlamydial conjunctivitis</td><td>ตาแดงเล็กน้อย คัน ระคาย ขี้ตาขาวปนเหลือง มักข้างเดียว ต่อมน้ำเหลืองหน้าหูโต · <b>follicular reaction</b> ที่เยื่อบุตาหนังตาล่าง · doxycycline 100 mg BID pc 10 วัน หรือ azithromycin 1 g ครั้งเดียว</td></tr>
</table></div>
<ul>
  <li>งดเพศสัมพันธ์จนได้ยาครบและหาย หรืออย่างน้อย 7 วันหลังเริ่มยา และจนคู่นอนได้รับการรักษา</li>
  <li>คู่เพศสัมพันธ์ภายใน 60 วันก่อนมีอาการ ตรวจและรักษาเหมือนผู้ป่วย</li>
  <li><b>หญิงตั้งครรภ์/ให้นม:</b> ห้าม doxycycline (cat D) · แนะนำ azithromycin 1 g ครั้งเดียว · ทางเลือก amoxicillin 500 mg TID pc 7 วัน</li>
</ul>
<div class="tbl"><table>
  <tr><th>เด็ก</th><th>การรักษา</th></tr>
  <tr><td>&lt; 45 kg และ &lt; 8 ปี</td><td>Erythromycin base 50 mg/kg/day แบ่ง 4 ครั้ง (ไม่เกิน 500 mg/มื้อ) pc 14 วัน</td></tr>
  <tr><td>≥ 45 kg และ &lt; 8 ปี</td><td>Azithromycin 1 g ครั้งเดียว ท้องว่าง</td></tr>
  <tr><td>≥ 8 ปี</td><td>Doxycycline 100 mg BID pc 7 วัน หรือ azithromycin 1 g ครั้งเดียว</td></tr>
  <tr><td>Neonatal conjunctivitis</td><td>Erythromycin base 50 mg/kg/day แบ่ง 4 ครั้ง 14 วัน</td></tr>
  <tr><td>Neonatal pneumonia</td><td>Erythromycin base 50 mg/kg/day แบ่ง 4 ครั้ง 14 วัน · ทางเลือก azithromycin suspension 20 mg/kg OD 3 วัน</td></tr>
  <tr><td>ทารกจากแม่ที่ติดเชื้อขณะคลอด</td><td>ไม่แนะนำ ATB ป้องกัน ติดตามอาการ รักษาเมื่อติดเชื้อ</td></tr>
</table></div>` },
    { id: 'vag', t: 'ช่องคลอดอักเสบและ PID', html: `<div class="tbl"><table>
  <tr><th></th><th>Trichomoniasis</th><th>Bacterial vaginosis</th><th>Vulvovaginal candidiasis</th></tr>
  <tr><td>เชื้อ</td><td><i>Trichomonas vaginalis</i> (โปรโตซัว)</td><td>Anaerobes (Prevotella, Mobiluncus), <i>G. vaginalis</i>, Ureaplasma, Mycoplasma เจริญแทน Lactobacillus ที่สร้าง H₂O₂</td><td><i>Candida albicans</i> · ไม่จำเป็นต้องมาจากเพศสัมพันธ์: เบาหวาน ตั้งครรภ์ ยาคุม ไม่รักษาความสะอาด สวนล้างช่องคลอด เสื้อผ้าแน่น</td></tr>
  <tr><td>ระดูขาว</td><td><b>เหลืองอมเขียว มีกลิ่น</b> แสบระคาย · ชายปัสสาวะแสบขัด</td><td><b>ขาวเทา กลิ่นคาวปลา</b> · บางคนไม่มีอาการ</td><td><b>คล้ายตะกอนนม (curd-like)</b> คัน แสบ อาจปัสสาวะแสบขัด</td></tr>
  <tr><td>วินิจฉัย</td><td>Wet smear · ยืนยันด้วย culture, PCR</td><td>3 ใน 4: pH &gt; 4.5 · ระดูขาวเนื้อเดียวเคลือบผนังช่องคลอด · กลิ่นคาวปลาเมื่อผสม 10% KOH (whiff test) · พบ <b>clue cell</b></td><td>pH &lt; 4.5 · น้ำเกลือหรือ 10% KOH พบ mycelium, pseudohyphae หรือ budding yeast</td></tr>
</table></div>
<h3>Trichomoniasis</h3>
<ul>
  <li>แนะนำ: <b>metronidazole 2 g ครั้งเดียว</b> หรือ 400–500 mg BID 5–7 วัน · ทางเลือก: tinidazole 2 g ครั้งเดียว (ไม่แนะนำในตั้งครรภ์/ให้นม)</li>
  <li>งดเพศสัมพันธ์ระหว่างรักษาจนคู่นอนรักษาแล้ว · คู่นอนมาตรวจและรักษาเหมือนผู้ป่วย</li>
  <li>ตั้งครรภ์: metronidazole 2 g (cat B) · ให้นม: metronidazole 2 g แล้วเลื่อนให้นม 12–24 ชม.</li>
  <li>HIV: metronidazole 2 g ครั้งเดียวได้ผลน้อยกว่า 500 mg BID 7 วัน</li>
</ul>
<h3>Bacterial vaginosis</h3>
<ul>
  <li>แนะนำ: <b>metronidazole 400–500 mg BID 7 วัน</b> หรือ metronidazole 750 mg เหน็บช่องคลอด 7 วัน</li>
  <li>ทางเลือก: tinidazole 2 g OD hs 2 วัน หรือ 1 g OD hs 5 วัน · clindamycin 300 mg BID pc 7 วัน</li>
  <li>แพ้ metronidazole/tinidazole ใช้ clindamycin · ไม่แพ้แต่ทนผลข้างเคียงไม่ได้ใช้ metronidazole เหน็บ</li>
  <li>คู่นอน: ประเมินการติดเชื้อที่ท่อปัสสาวะที่ไม่มีอาการ เช่น หนองในเทียม</li>
  <li>ตั้งครรภ์: metronidazole (cat B) ระวัง tinidazole (cat C) · ให้นม: เลื่อนให้นม 12–24 ชม.</li>
</ul>
<div class="key"><strong class="k">งดแอลกอฮอล์</strong>หลัง metronidazole 24 ชม. · หลัง tinidazole 72 ชม. (disulfiram-like reaction: หน้าร้อนวูบวาบ ปวดหัว หายใจลำบาก N/V แน่นหน้าอก)</div>
<h3>Vulvovaginal candidiasis</h3>
<div class="tbl"><table>
  <tr><th>ชนิด</th><th>ยา</th></tr>
  <tr><td>Acute</td><td>Clotrimazole 500 mg เหน็บครั้งเดียว · 200 mg 3 วัน · 100 mg 6–7 วัน<br>Miconazole 200 mg เหน็บ 3 วัน<br>Fluconazole 150–200 mg กินครั้งเดียว*<br>Itraconazole 200 mg BID 1 วัน*</td></tr>
  <tr><td>Recurrent</td><td>Clotrimazole 100 mg เหน็บ 14 วัน → 500 mg สัปดาห์ละครั้ง 6 เดือน<br>Fluconazole 100–200 mg ทุก 3 วัน 3 ครั้ง → สัปดาห์ละครั้ง 6 เดือน*</td></tr>
</table></div>
<p>* ไม่แนะนำในหญิงตั้งครรภ์/ให้นม → ใช้ clotrimazole 500 mg เหน็บครั้งเดียว หรือ 200 mg 3 วัน (cat B) · ยาเฉพาะที่อาจแสบร้อน · azole กินอาจคลื่นไส้ ปวดท้อง ปวดหัว เอนไซม์ตับขึ้น (น้อยมาก) · ระวังร่วมกับ simvastatin, ARV, warfarin · คู่นอนรักษาเมื่อมีอาการคันหรือปลายองคชาตอักเสบแดง</p>
<h3>อุ้งเชิงกรานอักเสบ (PID)</h3>
<p><b>สาเหตุ:</b> ส่วนใหญ่ <i>N. gonorrhoeae</i>, <i>C. trachomatis</i> · อาจมี anaerobes, <i>E. coli</i>, Enterobacter · <b>อาการ:</b> ไข้ ปวดท้องน้อย อาจระดูขาวหรือเลือดออกผิดปกติ</p>
<div class="tbl"><table>
  <tr><th>เกณฑ์ขั้นต่ำ (≥ 1 ข้อ)</th><th>เกณฑ์เพิ่มเติม (≥ 1 ข้อ)</th></tr>
  <tr><td>เจ็บเมื่อโยกปากมดลูกจากการตรวจภายใน · กดเจ็บที่มดลูก · กดเจ็บที่ปีกมดลูก</td><td>ไข้ทางปาก &gt; 38.3°C · มูกปนหนองจากช่องคลอดหรือปากมดลูก · wet smear พบ WBC มากกว่าเซลล์เยื่อบุสความัส · พบ N. gonorrhoeae หรือ C. trachomatis ที่ปากมดลูก · ESR หรือ CRP สูง</td></tr>
</table></div>
<p><b>การรักษา</b> (ทุกสูตรร่วมกับ doxycycline 100 mg BID pc 14 วัน + metronidazole 500 mg BID pc หรือ 400 mg TID 14 วัน):</p>
<ul>
  <li>Ceftriaxone 1 g IM ครั้งเดียว</li>
  <li>Cefoxitin 2 g IM ครั้งเดียว</li>
  <li>3rd gen cephalosporin ฉีดอื่น เช่น ceftizoxime, cefotaxime</li>
</ul>
<p style="font-size:.9em">ต้นฉบับเขียน "Cefixime 2 g IM" ซึ่ง cefixime เป็นยากินเท่านั้น สูตรตามแนวทางคือ cefoxitin 2 g IM จึงแก้เป็น cefoxitin</p>
<ul>
  <li><b>แพ้ penicillin:</b> ใช้ cephalosporin ได้ (แพ้ข้ามกลุ่มเพียง 0.1%)</li>
  <li><b>แพ้ cephalosporin:</b> N. gonorrhoeae ดื้อ quinolone · ถ้าโอกาสเป็นหนองในน้อยและติดตามได้ ใช้ levofloxacin 500 mg OD 14 วัน + ส่งตรวจ N. gonorrhoeae (ถ้าพบรักษาตามผลความไว)</li>
  <li><b>คู่นอน</b> ภายใน 60 วันตรวจและรักษาเหมือนผู้ป่วย · ถ้าเกิน 60 วัน คู่นอนคนล่าสุดควรรักษา (ชายที่เป็นหนองในมักไม่มีอาการ) · งดเพศสัมพันธ์จนหาย</li>
  <li><b>ตั้งครรภ์/ให้นม:</b> เลี่ยง FQ (cat C) และ doxycycline (cat D)</li>
</ul>` },
    { id: 'ulcer', t: 'ซิฟิลิส เริม แผลริมอ่อน LGV', html: `<h3>ซิฟิลิส (Syphilis)</h3>
<p><b>สาเหตุ:</b> <i>Treponema pallidum</i> (spirochete)</p>
<div class="tbl"><table>
  <tr><th>ระยะ</th><th>ลักษณะ</th></tr>
  <tr><td><b>ระยะที่ 1</b><br>ฟักตัว 2–3 สัปดาห์ (9–90 วัน)</td><td>แผลที่อวัยวะเพศหรือทวารหนัก <b>สะอาด ขอบแข็ง ไม่เจ็บ</b> (chancre) อาจต่อมน้ำเหลืองขาหนีบโต</td></tr>
  <tr><td><b>ระยะที่ 2</b><br>6–12 สัปดาห์ (1–6 เดือน)</td><td>ผื่นตามลำตัว <b>ฝ่ามือฝ่าเท้า</b> · condylomata lata · mucous patch ในปาก · ผมร่วง · ต่อมน้ำเหลืองโตหลายที่</td></tr>
  <tr><td>ระยะแฝง</td><td>ไม่มีอาการ · early latent (สัมผัสเชื้อ ≤ 1 ปี) · late latent (&gt; 1 ปี) · ไม่ทราบระยะเวลา</td></tr>
  <tr><td>ระยะที่ 3</td><td>Late benign syphilis · cardiovascular syphilis</td></tr>
  <tr><td>Neurosyphilis</td><td>เกิดได้ทุกระยะ มีหรือไม่มีอาการ · ช่วงแรกมักเป็น meningovascular เช่น เยื่อหุ้มสมองอักเสบ อาการคล้าย stroke ผิดปกติทางตาหรือหู</td></tr>
</table></div>
${pic('p11-1', 'แผล chancre ของซิฟิลิสระยะที่ 1')}
${pic('p11-2', 'Condylomata lata ในซิฟิลิสระยะที่ 2')}
<p><b>วินิจฉัย:</b> darkfield examination · <b>nontreponemal</b> (RPR, VDRL) ใช้ติดตามการรักษา titer ลดลง 4 เท่า (เช่น 1:16 → 1:4) = ตอบสนอง · <b>treponemal</b> (FTA-ABS, TP-PA, EIA, CIA) ยืนยันว่าติดเชื้อหรือเคยติด</p>
<div class="tbl"><table>
  <tr><th>ระยะ</th><th>First line</th><th>ทางเลือก (แพ้ penicillin หรือไม่มียา)</th></tr>
  <tr><td><b>Early</b>: ระยะ 1, 2, early latent</td><td><b>Benzathine penicillin G 2.4 ล้านยูนิต IM ครั้งเดียว</b> (แบ่งฉีดสะโพกข้างละ 1.2 ล้าน) (cat B)</td><td>Doxycycline 100 mg BID pc 14 วัน* · tetracycline 500 mg QID pc 14 วัน* · azithromycin 2 g ครั้งเดียว · ceftriaxone 1–2 g IV/IM OD 10–14 วัน · erythromycin 500 mg QID pc 14 วัน</td></tr>
  <tr><td><b>Late</b>: late latent, ไม่ทราบระยะ, ระยะ 3</td><td>Benzathine penicillin G 2.4 ล้านยูนิต IM <b>สัปดาห์ละครั้ง 3 ครั้ง</b></td><td>Doxycycline 100 mg BID pc 28 วัน* · tetracycline 500 mg QID pc 28 วัน*</td></tr>
  <tr><td><b>Neurosyphilis</b></td><td>Aqueous crystalline penicillin G 18–24 ล้านยูนิต/วัน IV (3–4 ล้านยูนิต q 4 h) 10–14 วัน</td><td>Ceftriaxone 2 g IV/IM OD 10–14 วัน</td></tr>
  <tr><td>Congenital</td><td>Aqueous crystalline penicillin G 50,000 ยูนิต/kg/ครั้ง IV q 12 h (อายุ 1–7 วัน) และ q 8 h (&gt; 7 วัน) รวม 10 วัน</td><td></td></tr>
</table></div>
<p>* cat D ห้ามใช้ในหญิงตั้งครรภ์</p>
<ul>
  <li><b>คู่นอน:</b> สัมผัสในช่วง 3 เดือน รักษาแม้ผลเลือดปกติ · เกิน 3 เดือน ถ้าผลเลือดปกติไม่ต้องรักษา ถ้าผิดปกติรักษาตามระยะ</li>
  <li><b>ตั้งครรภ์:</b> ใช้ penicillin (ผ่านรกไปรักษาทารก) · แพ้ให้ทำ penicillin desensitization ก่อน · erythromycin ผ่านรกไม่พอป้องกัน congenital syphilis · ceftriaxone ยังไม่มีข้อมูล · ให้นมได้ ยกเว้นมีรอยโรคที่เต้านม</li>
</ul>
<h3>เริมที่อวัยวะเพศและทวารหนัก (Anogenital herpes)</h3>
<p><b>สาเหตุ:</b> HSV-2 เป็นหลัก · HSV-1 (มักที่ปาก) พบที่อวัยวะเพศได้ โดยเฉพาะวัยรุ่น MSM และ WSW · <b>อาการ:</b> ตุ่มน้ำใสหรือแผลตื้นเป็นกลุ่ม เจ็บแสบ คัน · ครั้งแรกฟักตัว 2–14 วัน ตุ่มแตกใน 24–48 ชม. อวัยวะเพศบวมแดงเจ็บมาก กว่าครึ่งมีไข้ ปวดหัว ปวดเมื่อย · <b>วินิจฉัย:</b> Tzanck test พบ multinucleated giant cell · HSV antigen · NAATs</p>
${pic('p14-1', 'ตุ่มน้ำและแผลเริมที่อวัยวะเพศ')}
<div class="tbl"><table>
  <tr><th>ภาวะ</th><th>การรักษา</th></tr>
  <tr><td><b>ครั้งแรก</b> (7–10 วัน)</td><td>Acyclovir 400 mg TID หรือ 200 mg 5 ครั้ง/วัน · valacyclovir 1 g BID หรือ 500 mg BID · famciclovir 250 mg TID<br>ได้ผลเท่ากัน valacyclovir/famciclovir ดูดซึมดีกว่า · รุนแรงหรือติดเชื้อระบบอื่น: acyclovir 5–10 mg/kg IV q 8 h 7 วันหรือจนดีขึ้น แล้วกินต่อจนครบ 10 วัน</td></tr>
  <tr><td><b>เป็นซ้ำ</b></td><td>Acyclovir 800 mg BID 5 วัน · 800 mg TID 2 วัน · 400 mg TID 5 วัน<br>Valacyclovir 1 g OD 5 วัน · 500 mg BID 3–5 วัน<br>Famciclovir 1 g BID 1 วัน · 500 mg ครั้งเดียวแล้ว 250 mg BID 2 วัน · 125 mg BID 5 วัน</td></tr>
  <tr><td><b>เป็นซ้ำบ่อย ≥ 6 ครั้ง/ปี</b> (suppressive)</td><td>Acyclovir 400 mg BID · valacyclovir 1 g OD หรือ 500 mg OD · famciclovir 250 mg BID · ประเมินหลังใช้ 1 ปี · ถ้า ≥ 10 ครั้ง/ปี valacyclovir 500 mg OD ได้ผลน้อยกว่า 1 g OD หรือ acyclovir 400 mg BID</td></tr>
</table></div>
<p>คู่นอนตรวจและรักษาเมื่อมีอาการ · ตั้งครรภ์/ให้นมแพทย์พิจารณาเป็นราย ๆ · HIV อาจเป็นเริมแบบนูนหนา หายช้า อาจต้องเพิ่มขนาด เปลี่ยนยา หรือรักษานานขึ้น</p>
<h3>แผลริมอ่อน (Chancroid)</h3>
<p><b>สาเหตุ:</b> <i>Haemophilus ducreyi</i> ฟักตัว 4–7 วัน · <b>อาการ:</b> ตุ่มแดงเจ็บแล้วแตกเป็นแผล <b>ก้นแผลมีหนอง ขอบนูนไม่แข็ง เจ็บมาก</b> แผลเล็กรวมเป็นแผลใหญ่ ต่อมน้ำเหลืองขาหนีบโตกดเจ็บ · <b>วินิจฉัย:</b> ย้อม Unna-Pappenheim หรือ Gram พบ gram-negative short rod เรียงแบบ school of fish/railroad track หรือ NAATs · ครบ 4 เกณฑ์: แผลเจ็บ ≥ 1 แผล · ต่อมน้ำเหลืองขาหนีบโต · ไม่พบ T. pallidum · ไม่พบไวรัสเริม</p>
${pic('p15-1', 'แผลริมอ่อนที่อวัยวะเพศ')}
<ul>
  <li>Ceftriaxone 250 mg IM ครั้งเดียว · azithromycin 1 g ครั้งเดียวท้องว่าง · ciprofloxacin 500 mg BID pc 3 วัน · erythromycin 500 mg QID pc 7 วัน</li>
  <li>คู่นอนย้อนหลัง 10 วันก่อนมีอาการ รักษาแม้ไม่มีอาการ</li>
  <li>ตั้งครรภ์: ceftriaxone หรือ erythromycin · ตั้งครรภ์ ให้นม และเด็ก &lt; 18 ปี ไม่ควรใช้ ciprofloxacin</li>
</ul>
<h3>Lymphogranuloma venereum (LGV)</h3>
<p><b>สาเหตุ:</b> <i>C. trachomatis</i> serovars L1, L2, L3 ฟักตัว 3–30 วัน (เฉลี่ย 2 สัปดาห์) · <b>อาการ:</b> แผลไม่เจ็บที่อวัยวะเพศ + ต่อมน้ำเหลืองขาหนีบโตกดเจ็บ (<b>groove sign</b>) · ทางทวารหนัก: เจ็บ ปวดเบ่ง มีหนอง · อาจไข้ อ่อนเพลีย · <b>วินิจฉัย:</b> อาการ ประวัติเสี่ยง และ NAATs</p>
<ul>
  <li>แนะนำ: <b>doxycycline 100 mg BID pc 21 วัน</b> · ทางเลือก: azithromycin 1 g สัปดาห์ละครั้ง 3 สัปดาห์ · erythromycin 500 mg QID pc 21 วัน</li>
  <li>คู่นอนภายใน 90 วัน ตรวจและรักษาเหมือนผู้ป่วย</li>
  <li>ตั้งครรภ์/ให้นม: ห้าม doxycycline ใช้ azithromycin หรือ erythromycin · เด็ก: erythromycin 7.5–12.5 mg/kg/ครั้ง QID 14 วัน</li>
</ul>` },
    { id: 'skin', t: 'หูด หูดข้าวสุก หิด โลน', html: `<h3>หูดหงอนไก่ (Anogenital warts)</h3>
<p><b>สาเหตุ:</b> HPV 6, 11, 16, 18 (16, 18 อาจก่อมะเร็งภายหลัง) · ส่วนใหญ่ไม่มีอาการ อาจคัน เจ็บ ระดูขาว เลือดออก · ก้อนหรือติ่งเนื้อ ผิวเรียบหรือขรุขระ สีชมพู น้ำตาล สีเนื้อ · วินิจฉัยด้วยตาเปล่า ไม่แน่ใจตัดชิ้นเนื้อ</p>
${pic('p17-1', 'หูดหงอนไก่ที่อวัยวะเพศ')}
<div class="tbl"><table>
  <tr><th>ยา (หูดขนาดเล็ก)</th><th>วิธีใช้</th><th>ข้อห้าม/ข้อควรระวัง</th></tr>
  <tr><td><b>Tincture podophyllin 25%</b></td><td>ทาวาสลีนรอบหูด แล้วทายาที่หูดสัปดาห์ละครั้ง ล้างออกหลัง 4 ชม.</td><td>ไม่เกิน 10 ตร.ซม. หรือ 0.5 mL/ครั้ง (พิษ) · ระคายเคือง · <b>ห้ามทาหูดที่ปากมดลูกหรือในทวารหนัก</b> · ห้ามในตั้งครรภ์ (cat X)</td></tr>
  <tr><td><b>Trichloroacetic acid (TCA) 80–100%</b></td><td>เช่นเดียวกับ podophyllin</td><td>ห้ามทาหูดที่ท่อปัสสาวะ · แสบมากโปะ 5% sodium bicarbonate หรือล้างสบู่</td></tr>
  <tr><td><b>Imiquimod 5%</b></td><td>ทาก่อนนอน วันเว้นวันหรือ 3 ครั้ง/สัปดาห์ ไม่เกิน 16 สัปดาห์ ทิ้งไว้ 6–10 ชม. แล้วล้าง</td><td>อักเสบแดง ระคาย แข็ง เป็นแผล สีผิวจาง · ห้ามที่ท่อปัสสาวะ ปากมดลูก ในช่องคลอด · ห้ามเด็ก &lt; 12 ปี</td></tr>
</table></div>
<ul>
  <li>หูดขนาดใหญ่: จี้เย็น (liquid nitrogen) ผ่าตัด จี้ไฟฟ้า เลเซอร์</li>
  <li>ตามตำแหน่ง: ในช่องคลอด ปากมดลูก ทวารหนัก → TCA · ปากท่อปัสสาวะ → podophyllin</li>
  <li>ผู้ป่วยและคู่หญิงควรตรวจมะเร็งปากมดลูก · ชาย HIV ที่ใช้ทวารหนักรับการสอดใส่พิจารณาคัดกรองมะเร็งทวารหนัก</li>
  <li>คู่นอนตรวจทุกราย รักษาเฉพาะรายที่มีอาการ</li>
  <li>ตั้งครรภ์: หูดโตเร็ว ตอบสนองไม่ดี เป็นซ้ำบ่อย · <b>แนะนำ TCA</b> · ห้าม podophyllin และ imiquimod</li>
  <li>HIV/ภูมิคุ้มกันบกพร่อง: หูดมากหรือใหญ่ ตอบสนองไม่ดี เป็นซ้ำบ่อย → พบแพทย์ผู้เชี่ยวชาญ</li>
</ul>
<h3>หูดข้าวสุก (Molluscum contagiosum)</h3>
<p><b>สาเหตุ:</b> Molluscum contagiosum virus · พบบ่อยในเด็ก หญิงวัยเจริญพันธุ์ ภูมิคุ้มกันบกพร่อง · ติดจากสัมผัสรอยโรค (เกี่ยวกับเพศสัมพันธ์หรือไม่ก็ได้) ใช้ของร่วม สระว่ายน้ำ · <b>อาการ:</b> ตุ่มนูนสีชมพูหรือสีผิว วาว ผิวเรียบ <b>บุ๋มตรงกลาง</b> 2–5 mm อาจเรียงเป็นแนว (Koebner phenomenon) · ยืนยันด้วยย้อม Giemsa</p>
${pic('p18-1', 'ตุ่มหูดข้าวสุกบุ๋มตรงกลาง')}
<ul>
  <li>หายเองได้ใน 6–9 เดือน บางรายนาน 3–4 ปี · รักษาเพื่อลดการแพร่กระจาย</li>
  <li>หัตถการ: curettage, จี้ไฟฟ้า, cryotherapy, pulsed-dye laser</li>
  <li>ยาทา: tincture podophyllin 10–25% ล้างออกหลัง 4 ชม. (3 ครั้ง/สัปดาห์) · imiquimod ทิ้งไว้ 6–10 ชม. (3 ครั้ง/สัปดาห์) · tretinoin 0.1% ก่อนนอน</li>
  <li>ยากิน: cimetidine 25–40 mg/kg/day กระตุ้น delayed type hypersensitivity ใช้เมื่อรอยโรคกระจายมาก</li>
  <li>คู่นอนไม่ต้องรักษาถ้าไม่มีรอยโรค · ตั้งครรภ์ห้าม podophyllin, tretinoin, imiquimod · ให้นมไม่แนะนำ podophyllin และ imiquimod</li>
</ul>
<h3>หิด (Scabies)</h3>
<p><b>สาเหตุ:</b> <i>Sarcoptes scabiei</i> var. hominis ติดง่ายทางสัมผัส · <b>คันทั่วตัว มากตอนกลางคืน</b> คนใกล้ชิดคันด้วย · papule, vesicle, nodule ที่ข้อมือ ง่ามนิ้ว รักแร้ ซอกพับ สะดือ อวัยวะเพศ · ลักษณะจำเพาะ: <b>รอยอุโมงค์ (burrow)</b></p>
<ul>
  <li>ทายาทั่วร่างกายตั้งแต่คอถึงปลายเท้า ไม่เว้นซอกอับ (มีรอยโรคที่หน้าหรือศีรษะทาได้)</li>
  <li><b>Permethrin 5% cream</b> (เลือกแรก ได้ผลดี ไม่ดื้อ) ทิ้งไว้ 8–14 ชม. แล้วล้าง ทาซ้ำใน 1 สัปดาห์</li>
  <li>Benzyl benzoate 10–25% emulsion ทิ้งไว้ 8–14 ชม. ทาซ้ำใน 1 สัปดาห์ (ไม่ควรใช้ในเด็ก &lt; 6 ปี)</li>
  <li>Ivermectin 200 mcg/kg ครั้งเดียว และซ้ำภายใน 2 สัปดาห์</li>
  <li>ซักเครื่องนุ่งห่มด้วยน้ำร้อนหรืออบ 50–60°C · ซักไม่ได้เก็บในถุงปิดอย่างน้อย 72 ชม.</li>
  <li>รักษาคู่นอน สมาชิกในบ้าน และผู้สัมผัสใกล้ชิดพร้อมกัน แม้ไม่มีอาการ</li>
  <li>ตั้งครรภ์/ให้นม: permethrin 5% ทิ้งไว้ 2 ชม. เท่านั้น · sulfur ointment 5–10%</li>
</ul>
<h3>โลน (Pediculosis pubis)</h3>
<p><b>สาเหตุ:</b> <i>Phthirus pubis</i> 0.8–1.2 mm คล้ายปู ติดจากสัมผัสหรือเสื้อผ้า ผ้าเช็ดตัว เครื่องนอน · คันหัวหน่าว พบไข่หรือตัวโลนที่ขน</p>
<ul>
  <li><b>อวัยวะเพศ:</b> permethrin 1% lotion ทิ้งไว้ 10 นาที · malathion 0.5% lotion ทิ้งไว้ 8–12 ชม. · ivermectin 250 mcg/kg ครั้งเดียว ซ้ำใน 7–14 วัน</li>
  <li><b>ขนตา:</b> ivermectin 200 mcg/kg ครั้งเดียว ซ้ำใน 7–14 วัน · ทาปิโตรเลียมเจลลี่หรือขี้ผึ้งป้ายตา BID 10 วัน</li>
  <li>คู่นอนภายใน 30 วันตรวจและรักษาพร้อมกัน · ตั้งครรภ์/ให้นม: permethrin 1% lotion</li>
</ul>` },
  ],
  questions: [
    { q: 'ชายอายุ 22 ปี มีตุ่มใสที่อวัยวะเพศ แสบร้อน คัน มา 2 วัน ช่วงนี้พักผ่อนน้อยเพราะเตรียมสอบ อาการเกิดจากการติดเชื้อใดมากที่สุด', o: ['HSV-1', 'HSV-2', 'Varicella zoster virus', 'Neisseria gonorrhoeae', 'Chlamydia trachomatis'], a: 1, e: 'ตุ่มใสที่อวัยวะเพศร่วมกับแสบร้อนและคันเป็นลักษณะของเริมที่อวัยวะเพศ ซึ่ง HSV-2 เป็นสาเหตุที่พบบ่อย · HSV-1 มักเป็นเริมที่ปาก · VZV = งูสวัด · N. gonorrhoeae = หนองใน · C. trachomatis = หนองในเทียม' },
    { q: 'ชายอายุ 23 ปี ปัสสาวะแสบขัดและมีหนองไหลจากท่อปัสสาวะ 3 วัน Gram stain พบ gram-negative intracellular diplococci แพทย์วินิจฉัย uncomplicated gonorrhea ที่อวัยวะเพศ ข้อใดเป็นแนวทางการรักษาที่เหมาะสมที่สุด', o: ['Ceftriaxone 1 g IM ครั้งเดียว เพียงอย่างเดียว', 'Ceftriaxone 1 g IM ครั้งเดียว และให้การรักษา Chlamydia ร่วมด้วย', 'Doxycycline 100 mg BID 7 วัน เพียงอย่างเดียว', 'Cefixime 400 mg BID 7 วัน', 'Azithromycin 1 g รับประทานครั้งเดียว'], a: 1, e: 'แนะนำ ceftriaxone 1 g IM ครั้งเดียว และถ้าตรวจหา C. trachomatis ไม่ได้ ควรรักษาหนองในเทียมร่วมด้วย' },
    { q: 'หญิงอายุ 26 ปี ตกขาวสีเหลืองอมเขียว มีกลิ่น แสบช่องคลอด แพทย์วินิจฉัยว่าเป็น Trichomonas vaginalis ข้อใดเป็นคำแนะนำที่ถูกต้องที่สุดหลังให้ยา', o: ['สอบถามผู้ป่วยว่าตั้งครรภ์หรือไม่ เพราะยาไม่ปลอดภัยต่อทารกในครรภ์', 'รักษาเฉพาะผู้ป่วย ไม่ต้องรักษาคู่นอน', 'หากให้นมบุตรสามารถให้นมได้ทันที', 'งดแอลกอฮอล์ 24 ชั่วโมงหลัง metronidazole', 'งดแอลกอฮอล์ 72 ชั่วโมงหลัง metronidazole'], a: 3, e: 'งดแอลกอฮอล์อย่างน้อย 24 ชม. หลัง metronidazole เพื่อป้องกัน disulfiram-like reaction (72 ชม. คือ tinidazole) · ควรรักษาคู่นอนร่วม · ให้นมควรเลื่อน 12–24 ชม. · metronidazole ใช้ในหญิงตั้งครรภ์ได้ (cat B)' },
    { q: 'ชายอายุ 35 ปี มีแผลที่อวัยวะเพศ เจ็บมาก ก้นแผลมีหนอง ขอบแผลนูนไม่แข็ง ต่อมน้ำเหลืองขาหนีบโตกดเจ็บ ข้อใดเป็นการวินิจฉัยที่เข้าได้มากที่สุด', o: ['Primary syphilis', 'Genital herpes', 'Chancroid', 'LGV', 'Molluscum contagiosum'], a: 2, e: 'แผลริมอ่อน: ขอบไม่แข็ง แผลลึก มีหนอง เจ็บ · ซิฟิลิส: ขอบแข็ง ก้นแผลสะอาด ไม่เจ็บ · เริม: กลุ่มแผลตื้นหรือตุ่มน้ำใสเล็ก ๆ' },
    { q: 'ผู้ป่วยโรคซิฟิลิสระยะที่ 1 ยาในข้อใดควรเลือกใช้', o: ['Acyclovir 200 mg', 'Benzathine penicillin G 2.4 ล้านยูนิต', 'Cefixime 800 mg', 'Ciprofloxacin 500 mg', 'Gentamicin 240 mg'], a: 1, e: 'Benzathine penicillin G 2.4 ล้านยูนิต IM ครั้งเดียว เป็น first line ของซิฟิลิสระยะต้น' },
  ],
}
