// Hormone replacement therapy (menopause) — converted from the RxTU10 class summary PDF (see content/summaries/manifest.json)
const fig = (f, cap, alt) => `<figure><img data-fig="hrt/${f}.webp" alt="${alt || cap}"><figcaption>${cap}</figcaption></figure>`

export default {
  id: 'hrt',
  date: '25/07/2026',
  refs: [
    'จุราพร พงศ์เวชรักษ์. Menopause hormone therapy (MHT) วิชา ภศ.412 [เอกสารประกอบการสอน]. คณะเภสัชศาสตร์ มหาวิทยาลัยธรรมศาสตร์; 2567.',
    'Peacock K, Carlson K, Ketvertis KM. Menopause. StatPearls Publishing; 2023.',
    'สายพิณ พงษธา. วัยหมดระดู. ภาควิชาสูติศาสตร์และนรีเวชวิทยา คณะแพทยศาสตร์ มหาวิทยาลัยเชียงใหม่; 2024.',
    'ราชวิทยาลัยสูตินรีแพทย์แห่งประเทศไทย, สมาคมวัยหมดระดูแห่งประเทศไทย. RTCOG Clinical Practice Guideline: Menopausal Hormone Therapy (GY 64-022). 2564.',
    'The North American Menopause Society. The 2023 nonhormone therapy position statement of the North American Menopause Society. Menopause. 2023;30(6):573–90.',
    'Davis SR, et al. The 2023 practitioner\'s toolkit for managing menopause. Climacteric. 2023;26(6):1–20.',
    'Genazzani AR, et al. Beneficial effect of tibolone on mood, cognition, well-being, and sexuality in menopausal women. Neuropsychiatr Dis Treat. 2006;2(3):299–307.',
  ],
  sections: [
    { id: 'def', t: 'Menopause: นิยามและการวินิจฉัย', html: `<p><b>Menopause</b> คือไม่มีประจำเดือนติดต่อกันอย่างน้อย 12 เดือน เพราะรังไข่หยุดทำงาน ไม่มีการตกไข่</p>
<p><b>Risk factors:</b> สูบบุหรี่ · ภาวะโภชนาการบกพร่อง · ผ่าตัดมดลูก · พันธุกรรม</p>
<p><b>Diagnosis:</b> อายุ · ประจำเดือนผิดปกติ (ไม่สม่ำเสมอ มาช้าขึ้น) · hot flushes/night sweats ซึมเศร้า mood swing นอนไม่หลับ · <b>ไม่จำเป็นต้องตรวจฮอร์โมน</b> เว้นแต่ต้องการยืนยัน: FSH &gt; 25 mIU/mL, LH &gt; 5 เท่าจากปกติ, estradiol &lt; 50 pmol/L</p>
<div class="tbl"><table>
  <tr><th>คำศัพท์</th><th>ความหมาย</th></tr>
  <tr><td>Premenopause</td><td>ตั้งแต่มีประจำเดือนครั้งแรกจนก่อนหมดถาวร ประจำเดือนขาดไม่เกิน 3 เดือน มักเริ่มอายุ ~40 ปี</td></tr>
  <tr><td>Perimenopause</td><td>ก่อนหมดถาวรจนถึงช่วงแรกหลังหมด ประจำเดือนไม่สม่ำเสมอ อาจขาด ≥ 3 เดือน</td></tr>
  <tr><td>Postmenopause</td><td>หลังหมดประจำเดือนถาวร ไม่ว่าจากธรรมชาติ ผ่าตัด หรือฉายรังสี</td></tr>
  <tr><td>Natural menopause</td><td>หมดตามธรรมชาติ มักอายุ 50–52 ปี</td></tr>
  <tr><td>Early menopause</td><td>หมดก่อนอายุ 45 ปี</td></tr>
  <tr><td>Premature menopause / POI</td><td>หมดก่อนอายุ 40 ปี</td></tr>
  <tr><td>Late menopause</td><td>ยังมีประจำเดือนหลังอายุ 56 ปี</td></tr>
  <tr><td>Surgical menopause</td><td>ผ่าตัดรังไข่ออกทั้ง 2 ข้าง</td></tr>
</table></div>
<h3>กลไก</h3>
<p>Inhibin จาก granulosa cell ยับยั้ง FSH · อายุมากขึ้น follicle ลดลง inhibin ลด → FSH สูง → ระยะแรก follicle โตเร็ว follicular phase สั้น ประจำเดือนถี่ (estrogen ยังปกติหรือสูงเล็กน้อย) → ต่อมา follicle ไม่ตอบสนอง ไม่ตกไข่ ไม่มี corpus luteum ไม่มี progesterone และ estrogen ลด → ไม่มีประจำเดือนอีก</p>` },
    { id: 'sx', t: 'อาการของวัยหมดประจำเดือน', html: `<h3>1. Vasomotor symptoms (VMS)</h3>
<ul>
  <li>พบ 80% · <b>hot flushes</b> (ร้อนที่หน้าอก คอ ใบหน้าจนมีเหงื่อ) และ <b>night sweats</b></li>
  <li>กลไก: thermoneutral zone แคบลง · estrogen ลดสัมพันธ์กับ endorphin, serotonin, norepinephrine ที่เปลี่ยนไป</li>
  <li>Hot flush เฉลี่ย 3–4 นาที เป็นวันละหลายครั้ง (&gt; 7 ครั้ง/วัน = รุนแรง)</li>
  <li>กระทบสุขภาพสมอง (ยิ่งหมดเร็วยิ่งกระทบ): depression, anxiety, cognitive symptoms, sleep disorders</li>
  <li>ปัจจัยเสี่ยง: สูบบุหรี่ แอลกอฮอล์ BMI สูง ไม่ออกกำลัง เครียด ยาบางตัว (เช่น tamoxifen) ประวัติครอบครัว early/surgical menopause</li>
</ul>
<h3>2. Genitourinary syndrome of menopause (GSM)</h3>
<p>เยื่อบุช่องคลอดและทางเดินปัสสาวะบางและแห้ง pH &gt; 5 สูญเสียคอลลาเจนและความยืดหยุ่น</p>
<ul>
  <li><b>Vaginal:</b> แห้ง แสบร้อน คัน · dyspareunia · ช่องคลอดอักเสบซ้ำ</li>
  <li><b>Bladder/urethra:</b> ปัสสาวะเล็ด กลั้นไม่ได้ UTI ซ้ำ</li>
</ul>
<p>อื่น ๆ: ปวดข้อ/กล้ามเนื้อ · sarcopenia/osteopenia · osteoporosis (estrogen ลด → osteoclast สลายกระดูกมากขึ้น)</p>` },
    { id: 'nonpharm', t: 'การรักษาโดยไม่ใช้ยา', html: `<ol>
  <li><b>CBT</b> ลดการรบกวนและความรุนแรงของ VMS ช่วยการนอนและอารมณ์ (อาจไม่ลดความถี่มาก)</li>
  <li><b>Clinical hypnosis</b> ลดทั้งความถี่และความรุนแรงของ VMS 70–80% ลดการรบกวนการนอน</li>
  <li><b>Weight loss</b> ในผู้น้ำหนักเกิน ลดความถี่และความรุนแรงของ VMS (ไขมันเป็นฉนวนความร้อน)</li>
  <li><b>Stellate ganglion block (SGB)</b></li>
</ol>
<p>สมุนไพรและอาหารเสริม (เกสรดอกไม้ ตังกุย โสม wild yam evening primrose oil กัญชา) <b>ไม่แนะนำ</b> เพราะขาดหลักฐาน</p>` },
    { id: 'hrt', t: 'Hormone replacement therapy', html: `<p>ตาม NAMS 2022: รักษาอาการที่รบกวนชีวิต ป้องกันภาวะแทรกซ้อนระยะยาว ประเมินรายบุคคล ใช้<b>ขนาดต่ำสุดที่คุมอาการได้</b></p>
<h3>แนะนำเริ่ม HRT เมื่อ</h3>
<ol>
  <li><mark>ภายใน 10 ปีหลังประจำเดือนครั้งสุดท้าย และก่อนอายุ 60 ปี</mark></li>
  <li>หมดประจำเดือนก่อนอายุ 40–45 ปี (premature/early) และ surgical menopause</li>
  <li>อาการปานกลางถึงรุนแรงหรือกระทบคุณภาพชีวิต</li>
</ol>
<h3>ข้อห้าม</h3>
<ul>
  <li><b>Absolute:</b> มะเร็งเต้านม · เลือดออกผิดปกติจากโพรงมดลูกที่ยังไม่วินิจฉัย · VTE (DVT, PE) · กำลังมี arterial occlusion (stroke, CVD, acute arterial occlusion)</li>
  <li><b>Relative:</b> มะเร็งที่ไวต่อ estrogen · TG &gt; 400 mg/dL · โรคตับรุนแรง · พันธุกรรม/ปัจจัยเสี่ยง VTE</li>
</ul>
<h3>เลือกตามกลุ่มอาการ</h3>
<p><b>GSM อย่างเดียว → ยาเฉพาะที่</b></p>
<ol>
  <li>Lubricants/moisturizers สำหรับแห้ง/คัน</li>
  <li><b>Low-dose vaginal estrogen</b> (cream, tablet, suppository ประสิทธิภาพไม่ต่างกัน) — gold standard</li>
  <li>มีทั้ง GSM และ VMS → systemic HRT</li>
</ol>
<p><b>VMS → systemic</b></p>
<ul>
  <li><b>อายุ ≥ 60 ปี หรือหมดประจำเดือน &gt; 10 ปี / มีข้อห้าม / ไม่อยากใช้ฮอร์โมน:</b> ปรับพฤติกรรม หรือ non-hormonal (SSRI, SNRI)</li>
  <li><b>อายุ &lt; 60 ปีและหมดไม่เกิน 10 ปี อาการ moderate–severe หรือ premature/early menopause:</b> ใช้ HRT ตามตาราง</li>
</ul>
<div class="tbl"><table>
  <tr><th>สภาพมดลูก</th><th>สูตร</th><th>รูปแบบ</th><th>ประจำเดือน</th></tr>
  <tr><td>ผ่าตัดมดลูกแล้ว</td><td><b>Estrogen alone (ET)</b></td><td>21 วัน เว้น 7 วัน (อาจร้อนวูบวาบช่วงเว้น)</td><td>ไม่มี</td></tr>
  <tr><td rowspan="3">ยังมีมดลูก</td><td rowspan="3"><b>Estrogen + progestin (EPT)</b><br>ต้องให้ P เสมอเพื่อป้องกันมะเร็งเยื่อบุมดลูก</td><td><b>Cyclic (sequential):</b> E ทุกวัน 21 วัน + P อย่างน้อย 10–14 วันช่วงหลัง เว้น 7 วัน</td><td>มีเลือดออกทุกเดือน (ราววันที่ 24–28)</td></tr>
  <tr><td><b>Continuous combined:</b> E + P ทุกวัน · ลดความเสี่ยง endometrial cancer ได้มากกว่า</td><td>ไม่มี (amenorrhea) เหมาะกับ postmenopause · อาจกะปริบกะปรอยใน 6–10 เดือนแรก</td></tr>
  <tr><td><b>Long cycle:</b> E ทุกวัน + P 10–14 วัน ทุก 3 เดือน</td><td>มีเลือดออกทุก 3 เดือน</td></tr>
</table></div>
<p>อ้วน เบาหวาน TG สูง เสี่ยง VTE ไมเกรน (ไม่มี aura) โรคตับ/ถุงน้ำดี หรือความต้องการทางเพศต่ำ → เลือก <b>transdermal</b> (แผ่นแปะ/เจล) เลี่ยง first-pass ที่ตับ</p>
<ul>
  <li>หยุดแล้วอาการกลับมา: ใช้ต่อโดยลดขนาด หรือเปลี่ยนเป็น transdermal</li>
  <li><b>Onset:</b> VMS ดีขึ้นใน 1–2 สัปดาห์ &gt; 70% ดีชัดใน 1 เดือน · GSM ยากินใช้เวลาเป็นเดือน ยาสอดดีขึ้นใน 4–6 สัปดาห์</li>
  <li><b>พิจารณาหยุด:</b> ใช้ต่อเนื่องไม่เกิน 5 ปี หรืออายุถึง 60 ปี (พิจารณา QoL) · premature/early menopause หยุดเมื่อใกล้อายุเฉลี่ยของ menopause · ค่อย ๆ ลดใน 3–6 เดือน (dose-taper หรือ day-taper) ดีกว่าหยุดทันที · ยาช่องคลอดใช้ต่อได้ถ้ายังมี GSM</li>
</ul>
<h3>ขนาดยา</h3>
<div class="tbl"><table>
  <tr><th>Estrogen</th><th>ต่ำ</th><th>ปานกลาง</th><th>สูง</th></tr>
  <tr><td>Conjugated equine estrogens (CEE)</td><td>0.3 mg</td><td>0.625 mg</td><td>1.25 mg</td></tr>
  <tr><td>Micronized 17β-estradiol</td><td>1 mg</td><td>2 mg</td><td>4 mg</td></tr>
  <tr><td>Estradiol valerate</td><td>1 mg</td><td>2 mg</td><td>4 mg</td></tr>
  <tr><td>17β-estradiol transdermal</td><td>0.025 mg</td><td>0.05 mg</td><td>0.1 mg</td></tr>
</table></div>
<div class="tbl"><table>
  <tr><th>Progestogen (เมื่อใช้ E ขนาดปานกลาง)</th><th>Sequential (mg)</th><th>Continuous combined (mg)</th></tr>
  <tr><td>Norethisterone acetate (NETA)</td><td>1</td><td>0.5</td></tr>
  <tr><td>Medroxyprogesterone acetate (MPA)</td><td>5</td><td>2.5</td></tr>
  <tr><td>Micronized progesterone</td><td>200</td><td>100</td></tr>
  <tr><td>Dydrogesterone</td><td>10</td><td>5</td></tr>
</table></div>
<div class="tbl"><table>
  <tr><th>MHT สำหรับอาการช่องคลอด</th><th>ขนาด</th><th>วิธีใช้</th></tr>
  <tr><td>Estradiol vaginal tablet</td><td>0.01 mg</td><td>ทุกคืน 2 สัปดาห์ แล้ว 2–3 ครั้ง/สัปดาห์</td></tr>
  <tr><td>Estriol pessary</td><td>0.5 mg</td><td>ทุกคืน 3 สัปดาห์ แล้ว 2 ครั้ง/สัปดาห์</td></tr>
  <tr><td>Prasterone (DHEA) insert</td><td>6.5 mg</td><td>ทุกคืน</td></tr>
  <tr><td>Estradiol 0.01% cream</td><td>0.1 mg/g</td><td>2–4 g ทุกวัน 1–2 สัปดาห์ แล้ว 1 g 1–2 ครั้ง/สัปดาห์</td></tr>
  <tr><td>Estriol cream / gel</td><td>0.5 mg / 0.05 mg/g</td><td>ทุกคืน 3 สัปดาห์ แล้ว 2 ครั้ง/สัปดาห์</td></tr>
  <tr><td>CEE cream</td><td>0.625 mg/g</td><td>0.5–2 g ทุกวัน 21 วัน เว้น 7 วัน</td></tr>
  <tr><td>Vaginal ring (estradiol 2 mg / estradiol acetate)</td><td>0.0075 / 0.05–0.1 mg/day</td><td>เปลี่ยนทุก 3 เดือน</td></tr>
  <tr><td>Ospemifene (oral)</td><td>60 mg</td><td>ทุกวัน</td></tr>
</table></div>
<h3>อาการข้างเคียง</h3>
<div class="tbl"><table>
  <tr><th>Estrogen</th><th>Progestin</th></tr>
  <tr><td>เจ็บคัดเต้านม · คลื่นไส้อาเจียน · ฝ้า · บวม · น้ำหนักเพิ่ม · ปวดศีรษะ · เลือดออกผิดปกติ · ผื่นคัน · <b>TG สูงขึ้น</b> · VTE · เยื่อบุโพรงมดลูกหนาตัว/มะเร็งเยื่อบุโพรงมดลูก (ถ้าไม่ให้ P)</td><td>เจ็บคัดเต้านม · ท้องอืด · บวม · สิว ผิวมัน · อยากอาหาร · ปวดศีรษะ วิงเวียน · ง่วง อ่อนเพลีย · หงุดหงิด ซึมเศร้า ก้าวร้าว อารมณ์แปรปรวน · หลงลืม · HDL ลด LDL เพิ่ม</td></tr>
</table></div>
<ul>
  <li>Oral กับ transdermal ได้ผลไม่ต่างกัน แต่ transdermal S/E น้อยกว่า (เลือกเมื่อเสี่ยง VTE)</li>
  <li>แนะนำ micronized progesterone หรืออนุพันธ์นอกกลุ่ม norpregnane (เช่น MPA) เพราะไม่เพิ่ม VTE</li>
  <li>Testosterone เป็นทางเลือกในผู้ที่ความต้องการทางเพศต่ำ</li>
  <li><b>Tibolone</b> (Livial®) non-estrogen steroid อนุพันธ์ norethynodrel ได้ metabolite 3 ชนิด (estrogenic, androgenic, progestogenic ตามเนื้อเยื่อ) ป้องกันกระดูกบาง เพิ่มความต้องการทางเพศ · 2.5 mg/วัน · S/E น้ำหนักขึ้น บวม เจ็บเต้านม เลือดออกกะปริบกะปรอยช่วงแรก ปวดหัว คลื่นไส้ สิว</li>
</ul>
<h3>Non-hormonal</h3>
<ul>
  <li><b>Paroxetine 7.5 mg/วัน</b> — SSRI ตัวเดียวที่ FDA อนุมัติสำหรับ VMS</li>
  <li><b>Fezolinetant 45 mg/วัน</b> — neurokinin 3 receptor antagonist ที่ FDA อนุมัติสำหรับ VMS ระดับ moderate–severe</li>
</ul>
${fig('p10-1', 'Menopausal management (Women\'s Health Research Program, Monash University) — แยกตามปัญหาหลัก: urogenital, VMS, ไม่มีอาการ, sexual dysfunction')}` },
  ],
  questions: [
    { q: 'หญิงอายุ 52 ปี ประจำเดือนมาบ้างไม่มาบ้างประมาณ 3 ปี มีอาการช่องคลอดแห้งและเจ็บเวลามีเพศสัมพันธ์ มาปรึกษาที่ร้านยา ควรแก้ปัญหาอย่างไรจึงเหมาะสมที่สุด', o: ['จ่าย conjugated equine estrogen 0.625 mg', 'จ่าย HRT แบบ sequential regimen', 'จ่าย HRT แบบ continuous combined regimen', 'จ่าย topical estrogen', 'จ่าย topical estrogen ร่วมกับ HRT แบบ continuous combined regimen'], a: 3, e: 'อยู่ในช่วง perimenopause และมีเฉพาะอาการ GSM ใช้ topical vaginal estrogen ก็เพียงพอ' },
    { q: 'ข้อใดกล่าวถึงข้อบ่งใช้และการเลือกใช้ HRT ได้ถูกต้อง', o: ['ใช้ป้องกันกระดูกพรุนและกระดูกหักระยะยาวเป็น first-line เสมอ', 'ผู้ป่วยที่ผ่าตัดมดลูกแล้ว (hysterectomy) ใช้ estrogen เพียงอย่างเดียว (ET) ได้', 'ผู้ป่วยที่มีเฉพาะอาการช่องคลอดแห้ง (GSM) ต้องได้ estrogen ร่วมกับ progestin เสมอหากยังมีมดลูก', 'เริ่ม HRT ได้อย่างปลอดภัยในผู้ที่มีประวัติ stroke หรือ VTE', 'หากยังมีมดลูก ควรใช้ estrogen อย่างเดียวเพื่อลดผลข้างเคียงของ progestin'], a: 1, e: 'ผู้ที่ตัดมดลูกแล้วไม่เสี่ยงเยื่อบุโพรงมดลูกหนาตัวหรือมะเร็งเยื่อบุโพรงมดลูก จึงใช้ ET ได้โดยไม่ต้องให้ progestin' },
    { q: 'สตรีวัยหมดระดูที่ยังมีมดลูกและต้องการใช้ HRT โดยไม่ต้องการให้มีเลือดประจำเดือน ควรเลือกสูตรใด', o: ['Estrogen ชนิดเดียวต่อเนื่องทุกวัน 28 เม็ด', 'Progestin ชนิดเดียวต่อเนื่องทุกวัน 28 เม็ด', 'Estrogen 14 เม็ดแรก ตามด้วย progestin 14 เม็ดหลัง', 'Estrogen ทุกวันร่วมกับ progestin 10–14 วันต่อรอบ (cyclic/sequential EPT)', 'Estrogen และ progestin ผสมกันต่อเนื่องทุกวัน 28 เม็ด (continuous combined EPT)'], a: 4, e: 'Continuous combined EPT ให้ progestin ต่อเนื่องจน endometrium ฝ่อ จึงไม่มีเลือดประจำเดือน' },
    { case: 'หญิงไทยอายุ 52 ปี ร้อนวูบวาบจนรบกวนชีวิตประจำวัน ไม่เคยผ่าตัดมดลูก ประจำเดือนขาด ๆ หาย ๆ ครั้งล่าสุด 2 เดือนก่อน มีอาการคันช่องคลอด หงุดหงิดง่าย นอนไม่หลับ BMD T-score −2.8 แพทย์วินิจฉัย perimenopause และสั่ง estradiol valerate 2 mg วันที่ 1–10 และ estradiol valerate 2 mg + norethisterone 2.5 mg วันที่ 11–21', q: 'การรักษาผู้ป่วยรายนี้ด้วย HRT หวังผลลดอาการในข้อใดมากที่สุด', o: ['อาการร้อนวูบวาบ', 'อาการคันช่องคลอด', 'อาการนอนไม่หลับตอนกลางคืน', 'อารมณ์หงุดหงิด', 'ป้องกันภาวะกระดูกพรุน'], a: 0, e: 'VMS (hot flushes, night sweats) เป็น primary indication ของ HRT' },
    { case: 'ผู้ป่วยรายเดียวกับข้อก่อน (estradiol valerate 2 mg + norethisterone)', q: 'หลังทานยา 1 เดือน ผู้ป่วยคลื่นไส้ เจ็บคัดเต้านม และ TG สูงขึ้นเป็น 380 mg/dL สาเหตุคืออะไรและแก้ไขอย่างไร', o: ['Estradiol ต่ำเกินไป เพิ่มเป็น 4 mg/day', 'Progestin ต่ำเกินไป เพิ่ม norethisterone เป็น 5 mg/day', 'ผลข้างเคียงของ norethisterone เปลี่ยนเป็น oral micronized progesterone', 'ผลข้างเคียงของ norethisterone เปลี่ยนเป็น estrogen alone', 'ผลข้างเคียงของ estradiol valerate (oral) เปลี่ยนเป็น transdermal estradiol patch/gel ร่วมกับ norethisterone'], a: 4, e: 'คลื่นไส้ เจ็บเต้านม และ TG สูงเป็นผลของ oral estrogen ที่ผ่านตับ · transdermal estradiol เลี่ยง first-pass ลดผลต่อ TG และคลื่นไส้ · ยังต้องให้ progestin เพื่อป้องกันมะเร็งเยื่อบุมดลูก' },
  ],
}
