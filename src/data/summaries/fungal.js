// Superficial fungal infection — converted from the RxTU10 class summary PDF (see content/summaries/manifest.json)
export default {
  id: 'fungal',
  date: '28/07/2569',
  refs: [
    'สถาบันโรคผิวหนัง กรมการแพทย์. แนวทางเวชปฏิบัติการดูแลรักษาผู้ป่วยโรคติดเชื้อราที่ผิวหนังและเนื้อเยื่อใต้ผิวหนัง พ.ศ. 2554',
    'สุนทรภาส เชิดชัย. แนวปฏิบัติการใช้ยาต้านเชื้อราสำหรับการติดเชื้อราที่ผิวหนังในร้านยา. ศูนย์การศึกษาต่อเนื่องทางเภสัชศาสตร์ สภาเภสัชกรรม',
  ],
  sections: [
    { id: 'tv', t: 'เกลื้อน (Pityriasis versicolor)', html: `<p>ครอบคลุม 4 โรค: เกลื้อน · กลาก · เชื้อราที่เล็บ · แคนดิดา</p>
<ul>
  <li><b>Definition:</b> ติดเชื้อราในชั้น stratum corneum จากยีสต์ <b>Malassezia spp.</b> (เช่น M. furfur) ซึ่งเป็น normal flora บริเวณต่อมไขมันหนาแน่น พบบ่อยในเขตร้อน</li>
  <li><b>Risk:</b> เชื้อเปลี่ยนจาก saprophytic yeast → parasitic mycelial form (opportunistic) เมื่อร้อนอบชื้น เหงื่อมาก พันธุกรรม ยาคุมกำเนิด สเตียรอยด์ Cushing's ภูมิคุ้มกันบกพร่อง ทุพโภชนาการ</li>
</ul>
<h3>Diagnosis</h3>
<ol>
  <li>ผื่นขอบชัด มีขุย หลายสี (ขาว ชมพู น้ำตาล แดง) ที่หน้า หน้าอก ลำตัว ต้นแขน (บริเวณสัมผัสแดด) <b>ไม่คัน</b></li>
  <li>Wood's lamp: <mark>เรืองแสงสีเหลืองทอง (golden-yellow)</mark></li>
  <li>ขูดขุยหยด 10% KOH หรือเทปใสย้อม methylene blue: ยีสต์กลม/รีแตกหน่อ + เส้นใยสั้น "<b>spaghetti and meatballs</b>"</li>
</ol>
<figure><img data-fig="fungal/p01-1.webp" alt="ผื่นเกลื้อนบนหลังและหน้าอก เป็นปื้นสีจางขอบชัด"><figcaption>ผื่นเกลื้อน</figcaption></figure>
<figure><img data-fig="fungal/p02-1.webp" alt="แผนภาพ: ผื่นเกลื้อน ตรวจ KOH/methylene blue ถ้าบวก รักษายาทาหรือยากิน ติดตามผล เป็นครั้งแรกแนะนำการป้องกัน เป็นบ่อยใช้ยากินป้องกัน ถ้าลบไม่ต้องรักษา"><figcaption>แนวทางดูแลผื่นเกลื้อน</figcaption></figure>
<h3>Pharmacotherapy</h3>
<div class="tbl"><table>
  <tr><th>ยาทา (ผลใกล้เคียงกัน)</th><th>วิธีใช้</th></tr>
  <tr><td>2.5% selenium sulfide shampoo · 2% ketoconazole shampoo · 1–2% Zn pyrithione shampoo</td><td>ฟอกทั่วตัว 5–10 นาที วันละครั้ง 1–2 สัปดาห์</td></tr>
  <tr><td>20% sodium thiosulfate · 40–50% propylene glycol</td><td>ทาทั้งตัววันละ 2 ครั้ง 2–4 สัปดาห์</td></tr>
</table></div>
<p><b>ยากิน</b> (รอยโรคกว้าง เป็นซ้ำบ่อย หรือยาทาไม่ได้ผล): azoles ยับยั้งการสร้าง ergosterol · <mark>ทั้ง 3 ตัวเป็น strong CYP3A4 inhibitor ระวังร่วม statins</mark></p>
<div class="tbl"><table>
  <tr><th>ยา</th><th>ขนาด</th><th>หมายเหตุ</th></tr>
  <tr><td>Itraconazole</td><td class="num">400 mg ครั้งเดียว หรือ 200 mg/d × 5–7 วัน</td><td>Vd สูง เข้าผิว เล็บดี นิยมใช้มากกว่า</td></tr>
  <tr><td>Fluconazole</td><td class="num">400 mg ครั้งเดียว หรือ 300 mg/สัปดาห์ 2–3 สัปดาห์</td><td></td></tr>
  <tr><td>Ketoconazole</td><td class="num">400 mg ครั้งเดียว หรือ 200 mg/d × 10–14 วัน</td><td>hepatotoxicity</td></tr>
</table></div>
<p><b>คำแนะนำ:</b> ไม่ติดต่อ · ใส่เสื้อผ้าระบายอากาศ (ผ้าฝ้าย) เช็ดเหงื่อและเปลี่ยนเสื้อหลังออกกำลังกาย · รอยโรคจางช้า อาจเป็นเดือน</p>` },
    { id: 'tinea', t: 'กลาก (Dermatophytosis)', html: `<ul>
  <li><b>Definition:</b> เชื้อรา dermatophytes ย่อย keratin ก่อโรคที่ผิวหนัง เส้นผม เล็บ</li>
  <li><b>แหล่งเชื้อ:</b> geophilic (ดิน) · zoophilic (สุนัข แมว) · anthropophilic (คนสู่คน ของใช้ร่วม)</li>
</ul>
<h3>Diagnosis</h3>
<ol>
  <li>ผื่นขอบชัด <b>ตรงกลางหายเป็นวงแหวน (central healing/annular)</b> ขอบมีตุ่มแดง/ตุ่มใส ขุย <mark>คันมาก</mark> (ต่างจากเกลื้อน)
    <ul><li>tinea capitis (ศีรษะ) · tinea corporis/ringworm (ลำตัว) · tinea pedis/athlete's foot (เท้า มักติดเชื้อราร่วมแบคทีเรีย) · tinea manum (มือ) · tinea cruris/สังคัง (ขาหนีบ) · onychomycosis (เล็บ) · tinea faciei (หน้า)</li></ul>
  </li>
  <li>Wood's lamp: <mark>เรืองแสงสีเขียวเหลือง (yellowish-green)</mark></li>
  <li>KOH 10–20% จากขุย สะเก็ด เส้นผม: <b>branching septate hyphae</b></li>
</ol>
<figure><img data-fig="fungal/p03-1.webp" alt="กลากที่หนังศีรษะ แขน ขาหนีบ และเท้า"><figcaption>กลากตำแหน่งต่าง ๆ</figcaption></figure>
<figure><img data-fig="fungal/p03-2.webp" alt="กลากที่ลำตัวเป็นวงแหวนหลายวง"><figcaption>Tinea corporis (ringworm)</figcaption></figure>
<h3>ยาทา (first-line กลากผิวหนังทั่วไป)</h3>
<div class="tbl"><table>
  <tr><th>ยา</th><th>MOA / วิธีใช้</th></tr>
  <tr><td>Imidazole cream: clotrimazole, econazole, ketoconazole, miconazole, sertaconazole</td><td rowspan="2">ลำตัว: วันละ 2 ครั้ง 2–4 สัปดาห์ · ฝ่ามือ ฝ่าเท้า ขาหนีบ: วันละ 2 ครั้ง 6–8 สัปดาห์</td></tr>
  <tr><td>Terbinafine — ยับยั้งการสร้าง ergosterol และ squalene สะสมเป็นพิษต่อเชื้อ</td></tr>
  <tr><td>Ciclopirox</td><td>chelate โลหะที่เป็น cofactor ของเอนไซม์ รบกวนการสร้างพลังงานและเยื่อหุ้มเซลล์</td></tr>
  <tr><td>Tolnaftate</td><td>ยับยั้งการสร้าง ergosterol</td></tr>
</table></div>
<p>อาจใช้ยาลอกขุย เช่น Whitfield's ointment (salicylic + benzoic acid) ที่ผื่นหนา เช่น ฝ่าเท้า แต่ไม่ใช่ยาหลัก</p>
<h3>ยากิน (tinea capitis หรือยาทาไม่ได้ผล/บริเวณกว้าง)</h3>
<div class="tbl"><table>
  <tr><th>ยา</th><th>ลำตัว</th><th>มือ</th><th>ศีรษะ</th></tr>
  <tr><td><b>Griseofulvin</b> — จับ microtubules ยับยั้งการแบ่งเซลล์</td><td class="num">0.5–1 g/d (4 สัปดาห์)</td><td class="num">0.5–1 g/d (6–8 สัปดาห์)</td><td class="num">0.5–1 g/d (8–12 สัปดาห์)</td></tr>
  <tr><td><b>Itraconazole</b> — ยับยั้ง 14-α-demethylase (CYP51) lanosterol → ergosterol</td><td class="num">200 mg bid (7 วัน)</td><td class="num">200 mg bid 1 สัปดาห์/เดือน × 2 เดือน</td><td class="num">5 mg/kg/d (4–8 สัปดาห์)</td></tr>
  <tr><td><b>Terbinafine</b> — ยับยั้ง squalene epoxidase</td><td class="num">250 mg/d (1–2 สัปดาห์)</td><td class="num">250 mg/d (2–4 สัปดาห์)</td><td class="num">250 mg/d (4 สัปดาห์)</td></tr>
</table></div>
<p><b>คำแนะนำ:</b> เสื้อผ้าและรองเท้าระบายอากาศ ไม่ใช้ของร่วมกับผู้อื่น (หวี เสื้อผ้า กรรไกรตัดเล็บ รองเท้า)</p>` },
    { id: 'onycho', t: 'เชื้อราที่เล็บ (Onychomycosis)', html: `<ul>
  <li>~50% ของความผิดปกติที่เล็บ เล็บเท้ามากกว่าเล็บมือ ส่วนใหญ่เป็น dermatophyte ส่วนน้อย non-dermatophyte mold หรือ Candida</li>
  <li><b>Risk:</b> เบาหวาน สูงอายุ PVD ภูมิคุ้มกันบกพร่อง · เล็บอับชื้น แช่น้ำนาน · ลามจาก tinea pedis/manuum ที่ไม่รักษา</li>
  <li><b>Diagnosis:</b> KOH จากเศษเล็บ: dermatophyte = branching septate hyphae · Candida = oval budding yeast + pseudohyphae · แยกจาก psoriasis</li>
  <li><b>อาการ:</b> เชื้อเข้าเนื้อใต้เล็บลามไปด้านล่าง → ใต้เล็บหนา, เล็บแยกจากพื้น (onycholysis), สีขาว เหลือง น้ำตาล ดำ (candida), เล็บผุ เสียรูป</li>
</ul>
<h3>ยากิน (first-line)</h3>
<div class="tbl"><table>
  <tr><th>ยา</th><th>ขนาด</th></tr>
  <tr><td><b>Itraconazole</b> (first-line)</td><td>Continuous: 200 mg/d (มือ ≥ 3 เดือน, เท้า ≥ 4 เดือน)<br><b>Pulse:</b> 200 mg bid × 7 วัน/เดือน (มือ ≥ 3 รอบ, เท้า ≥ 4 รอบ)</td></tr>
  <tr><td>Terbinafine (second-line)</td><td>250 mg/d (มือ ≥ 6 สัปดาห์, เท้า ≥ 12 สัปดาห์)</td></tr>
  <tr><td>Griseofulvin (alternative)</td><td>1–2 g/d จนเล็บปกติ (มือ ≥ 9 เดือน, เท้า ≥ 9–12 เดือน)</td></tr>
  <tr><td>Fluconazole (alternative)</td><td>150–300 mg/สัปดาห์ (off-label)</td></tr>
</table></div>
<h3>ยาทา (เสริม หรือเล็บเป็นน้อย ไม่ involve matrix)</h3>
<ul>
  <li>5% amorolfine nail lacquer สัปดาห์ละ 1–2 ครั้ง 6–12 เดือน</li>
  <li>8% ciclopirox lacquer วันละครั้ง 48 สัปดาห์</li>
  <li>28% tioconazole solution วันละ 2 ครั้ง 6–12 เดือน</li>
  <li>Adjunct: 40% urea + 20% salicylic acid ลอกเล็บหนา/ผุ</li>
</ul>
<p><b>คำแนะนำ:</b> อย่าให้เล็บอับชื้น เลี่ยงแช่น้ำนาน</p>` },
    { id: 'candida', t: 'แคนดิดา (Candidiasis)', html: `<ul>
  <li>ยีสต์ <b>Candida albicans</b> เป็น normal flora ในปาก ทางเดินอาหาร ช่องคลอด ทางเดินปัสสาวะ ก่อโรคเมื่อเจริญเกินควบคุม</li>
  <li><b>Risk:</b> ภูมิลด (เบาหวาน มะเร็ง HIV โรคเลือด) · เหงื่อมาก · อ้วน (ซอกพับอับชื้น) · steroid, antibiotics, ยาคุม · ฟันปลอม · ตั้งครรภ์ · เพศสัมพันธ์กับผู้ติดเชื้อ · pH ช่องคลอดผิดปกติ</li>
  <li><b>Diagnosis:</b> KOH จากคราบขาว/ขุยขอบผื่น: oval budding yeast + pseudohyphae · สงสัยปัจจัยแฝงตรวจ FBS/HbA1c, HIV</li>
</ul>
<h3>อาการ</h3>
<ul>
  <li><b>Mucocutaneous:</b>
    <ul>
      <li>Oral thrush: ฝ้าขาวคล้ายคราบนมที่กระพุ้งแก้ม/เพดาน ขูดออกพื้นแดง พบในเด็กเล็ก ผู้สูงอายุ HIV</li>
      <li>Candida vaginitis: คัน ตกขาวขาวข้นคล้ายนมข้น</li>
      <li>Candida balanitis: มักเป็นคู่กับภรรยาที่เป็น vaginitis <b>ต้องรักษาคู่นอนพร้อมกัน</b></li>
    </ul>
  </li>
  <li><b>Cutaneous:</b>
    <ul>
      <li>Intertriginous: ซอกอับชื้น (รักแร้ ขาหนีบ ใต้ราวนม ง่ามนิ้ว) ขอบชัด แดงถลอก <mark>satellite lesions</mark> (ตุ่มหนองเล็ก ๆ รอบขอบผื่น) แยกจากกลาก</li>
      <li>Candidal paronychia: หมวกเล็บบวมแดงกดเจ็บ ในคนมือแช่น้ำบ่อย</li>
    </ul>
  </li>
</ul>
<figure><img data-fig="fungal/p06-1.webp" alt="Intertriginous candidiasis ใต้ราวนมและซอกพับ มี satellite lesions"><figcaption>Intertriginous candidiasis</figcaption></figure>
<figure><img data-fig="fungal/p06-2.webp" alt="Oral thrush ฝ้าขาวที่เพดานปาก"><figcaption>Oral candidiasis (oral thrush)</figcaption></figure>
<h3>Oral candidiasis</h3>
<div class="tbl"><table>
  <tr><th>ยา</th><th>วิธีใช้</th></tr>
  <tr><td><b>Clotrimazole oral troches</b> (first line)</td><td>10 mg อม 4–5 ครั้ง/วัน × 10–14 วัน</td></tr>
  <tr><td>Nystatin oral suspension</td><td>400,000–600,000 units อมกลั้วแล้วกลืน 4–5 ครั้ง/วัน × 14 วัน</td></tr>
  <tr><td>Miconazole gel</td><td>วันละ 4 ครั้ง × 14 วัน</td></tr>
  <tr><td>Fluconazole</td><td>100–150 mg/d 7–14 วัน</td></tr>
  <tr><td>Itraconazole suspension</td><td>100–200 mg/d 7–14 วัน</td></tr>
  <tr><td>รุนแรง/ดื้อยา</td><td>amphotericin B 0.3–0.5 mg/kg/d IV</td></tr>
</table></div>
<h3>Candida vaginitis / balanitis (รักษาคู่นอนร่วมด้วย)</h3>
<div class="tbl"><table>
  <tr><th>ยา</th><th>ขนาด</th></tr>
  <tr><td><b>Clotrimazole ยาเหน็บช่องคลอด</b> (first line)</td><td>500 mg ครั้งเดียว หรือ 100 mg × 6 วัน</td></tr>
  <tr><td>Fluconazole oral</td><td>150 mg ครั้งเดียว</td></tr>
  <tr><td>Itraconazole</td><td>200 mg/d × 3 วัน</td></tr>
  <tr><td>Ketoconazole (hepatotoxicity)</td><td>400 mg/d × 5–14 วัน</td></tr>
</table></div>
<h3>Intertriginous candidiasis</h3>
<ul>
  <li>Topical azole (clotrimazole, econazole, ciclopirox, miconazole, ketoconazole, nystatin) วันละ 2 ครั้ง × 10 วัน</li>
  <li>ยากินเมื่อยาทาไม่ได้ผล: itraconazole 100 mg OD × 14 วัน หรือ fluconazole 50–100 mg OD × 7 วัน</li>
  <li>ทำความสะอาดด้วย Burow's solution ใช้แป้งลดความชื้น</li>
</ul>
<p><b>คำแนะนำ:</b> ทำความสะอาดฟันปลอมด้วย chlorhexidine เลี่ยงความอับชื้น คุมเบาหวาน</p>` },
  ],
  questions: [
    { q: 'หญิง 22 ปี ผื่นราบสีน้ำตาลอ่อน ขอบชัด ขุยละเอียด ที่หน้าอกและต้นแขน ไม่คัน ตรวจ Wood\'s lamp พบเรืองแสงสีใด และเป็นลักษณะของโรคใด', o: ['สีเขียวเหลือง: กลาก', 'สีเหลืองทอง: เกลื้อน', 'สีฟ้าขาว: แคนดิดา', 'สีแดงส้ม: เชื้อราที่เล็บ', 'ไม่เรืองแสง: กลาก'], a: 1, e: 'เกลื้อนเรืองแสง golden-yellow ด้วย Wood\'s lamp' },
    { q: 'Terbinafine (allylamine) มีข้อได้เปรียบเหนือ azole ในการรักษากลากอย่างไร', o: ['ออกฤทธิ์แบบ fungicidal ต่อ dermatophyte ระยะเวลารักษาสั้นกว่า', 'ครอบคลุม Candida ดีกว่า azole', 'ไม่มีข้อห้ามใช้ในเด็ก', 'ราคาถูกกว่าทุกกรณี', 'ไม่ต้องปรับขนาดตามน้ำหนักตัว'], a: 0, e: 'Terbinafine เป็น fungicidal ต่อ dermatophyte จึงรักษาสั้นกว่า azole ซึ่งเป็น fungistatic' },
    { q: 'ผู้ป่วยเล็บเท้าหนา สีเหลือง onycholysis KOH พบ branching septate hyphae แพทย์ให้ itraconazole แบบ pulse dosing เหตุผลหลักคือ', o: ['cure rate สูงกว่า continuous เสมอ', 'ลดความเสี่ยงต่อตับเมื่อเทียบกับ continuous dosing', 'ระยะเวลารักษาสั้นกว่ามาก', 'ใช้ได้เฉพาะในเด็ก', 'เป็นแค่ความสะดวกของผู้ป่วย'], a: 1, e: 'Pulse dosing ลดปริมาณยาสะสมต่อเดือน จึงลดความเสี่ยงต่อตับ' },
    { q: 'หญิงตั้งครรภ์ 25 ปี มีคราบขาวคล้ายนมข้นในช่องคลอด คันมาก KOH พบ oval budding yeast และ pseudohyphae การรักษา first-line ที่เหมาะสมคือ', o: ['Fluconazole 400 mg ครั้งเดียว', 'Ketoconazole 400 mg/d 14 วัน', 'Topical azole (เช่น clotrimazole vaginal tablet)', 'Itraconazole 200 mg/d 7 วัน', 'Amphotericin B IV'], a: 2, e: 'Topical azole เป็น first-line ของ candida vaginitis และปลอดภัยกว่ายากินในหญิงตั้งครรภ์' },
    { q: 'ชาย 45 ปี เบาหวานคุมไม่ดี ผื่นแดงขอบชัด อับชื้นที่ขาหนีบและใต้ราวนม มีตุ่มหนองเล็ก ๆ รอบขอบผื่น ควรนึกถึงเชื้อใดเป็นอันดับแรก', o: ['Dermatophyte เพราะคันมาก', 'Candida เพราะมี satellite lesion ร่วมกับเบาหวานและบริเวณอับชื้น', 'Malassezia เพราะเป็นบริเวณต่อมไขมันมาก', 'HSV เพราะพบตุ่มน้ำใส', 'VZV เพราะกระจายตามเส้นประสาท'], a: 1, e: 'Satellite lesion + เบาหวาน + บริเวณอับชื้น เป็นลักษณะเฉพาะของ candidiasis' },
  ],
}
