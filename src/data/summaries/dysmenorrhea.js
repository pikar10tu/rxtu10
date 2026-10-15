// Dysmenorrhea, heavy menstrual bleeding, PMS/PMDD — converted from the RxTU10 class summary PDF (see content/summaries/manifest.json)
export default {
  id: 'dysmenorrhea',
  date: '',
  refs: [
    'ราชวิทยาลัยสูตินรีแพทย์แห่งประเทศไทย. แนวทางเวชปฏิบัติ การวินิจฉัยและรักษาภาวะปวดระดูปฐมภูมิ. 2564.',
    'กรมการแพทย์แผนไทยและการแพทย์ทางเลือก.',
    'American College of Obstetricians and Gynecologists. Clinical Practice Guideline No. 7: Management of Premenstrual Disorders. Obstet Gynecol. 2023;142(6):e1–e23.',
    'คณะแพทยศาสตร์โรงพยาบาลรามาธิบดี. Premenstrual dysphoric disorder: diagnosis and treatment. มหาวิทยาลัยมหิดล; 2547.',
  ],
  sections: [
    { id: 'dys', t: 'Dysmenorrhea (ปวดประจำเดือน)', html: `<ul>
  <li><b>Primary dysmenorrhea:</b> ปวดประจำเดือนโดยไม่มีพยาธิสภาพทางกาย</li>
  <li><b>Secondary dysmenorrhea:</b> มีพยาธิสภาพ เช่น endometriosis, myoma uteri</li>
</ul>
<h3>Pathophysiology</h3>
<ul>
  <li>หลังตกไข่ progesterone สูงขึ้น fatty acid สะสมที่โพรงมดลูก → ก่อนมีประจำเดือน progesterone ลดลง ปล่อย arachidonic acid → สร้าง <b>prostaglandin และ leukotriene</b></li>
  <li>Prostaglandin ทำให้มดลูกรัดตัว + vasoconstriction → ischemia ปวดท้องน้อย (ความปวดแปรตาม prostaglandin) · บางรายมาจาก leukotriene</li>
</ul>
<p><b>Risk factors:</b> เริ่มมีประจำเดือนก่อนอายุ 12 ปี · รอบเดือนไม่สม่ำเสมอ · BMI &lt; 20 · สูบบุหรี่</p>
<h3>อาการ</h3>
<ul>
  <li>ปวดบีบ ๆ รัด ๆ เริ่มก่อนประจำเดือนไม่เกิน 1 วัน และปวดต่อ 2–3 วันหลังมีประจำเดือน</li>
  <li>อาการร่วม เช่น อ่อนแรง ปวดหลัง คลื่นไส้อาเจียน</li>
  <li>รอบที่ไม่มีไข่ตกจะไม่ปวด → ผู้ที่เพิ่งเริ่มมีประจำเดือนมักไม่ปวด จนเริ่มมี ovulatory cycle</li>
</ul>
<h3>Diagnosis</h3>
<div class="tbl"><table>
  <tr><th></th><th>Primary (PD)</th><th>Secondary (SD)</th><th>PID</th></tr>
  <tr><td>อายุ</td><td>&lt; 20 ปี</td><td>&gt; 30 ปี</td><td>วัยรุ่น sexually active</td></tr>
  <tr><td>ลักษณะปวด</td><td>บีบ ๆ รัด ๆ</td><td>ปวดหน่วง ๆ</td><td>ปวดหน่วง ๆ</td></tr>
  <tr><td>ความรุนแรง</td><td>ดีขึ้นเมื่อประจำเดือนมา</td><td>–</td><td>ปวดมากก่อนรอบเดือนมา</td></tr>
  <tr><td>Onset</td><td>ก่อนประจำเดือน 24 ชม. ปวดไม่เกิน 3 วัน</td><td>ก่อนประจำเดือน 2–3 วัน</td><td>ปวดมากก่อนรอบเดือน</td></tr>
  <tr><td>อาการอื่น</td><td>–</td><td>Dyspareunia</td><td>ไข้ ตกขาว ประจำเดือนไม่สม่ำเสมอ dyspareunia</td></tr>
</table></div>
<div class="key"><strong class="k">Red flags</strong>ประจำเดือนมามาก · ปวดมากขึ้นเรื่อย ๆ · ปวดก่อนประจำเดือนหลายวัน · ติดเชื้อ · อายุ &gt; 30 ปีที่เพิ่งมีอาการหรืออาการแย่ลง</div>
<h3>การรักษา</h3>
<ul>
  <li><b>NSAIDs first-line</b> กินก่อนประจำเดือน 1–2 วัน ต่อเนื่อง 2–3 รอบ · ระวังใน PUD, asthma, hypersensitivity</li>
  <li><b>Low-dose COC (EE &lt; 35 mcg)</b> second-line</li>
  <li>ยังไม่ได้ผล: DMPA หรือ levonorgestrel IUS · hyoscine butylbromide ใช้ได้แต่ระวัง anticholinergic</li>
  <li>สมุนไพร: ประสะไพล ยาหอมอินทจักร์ ยาบำรุงโลหิต ขิง</li>
</ul>
<h3>แนวทางการรักษาปวดระดูปฐมภูมิ</h3>
<ol>
  <li>อาการเข้าได้กับปวดระดูปฐมภูมิ → acetaminophen/NSAIDs · ออกกำลังกายสม่ำเสมอ · ประคบร้อน</li>
  <li>ต้องการคุมกำเนิด หรือมีข้อห้าม NSAIDs → ยาเม็ดคุมกำเนิดชนิดฮอร์โมนรวม หรือโปรเจสตินอย่างเดียว</li>
  <li>ต้องการมีบุตร หรือมีข้อห้ามใช้ฮอร์โมน → การรักษาทางเลือก</li>
  <li>ไม่ดีขึ้น → หาสาเหตุ secondary dysmenorrhea (ทบทวนประวัติ ตรวจร่างกาย อัลตราซาวด์ MRI หรือ laparoscopy)</li>
  <li>ยืนยันว่าเป็นปฐมภูมิ: ต้องการมีบุตร → LUNA หรือ PSN · ไม่ต้องการมีบุตร → ตัดมดลูก</li>
</ol>` },
    { id: 'hmb', t: 'Heavy menstrual bleeding (HMB)', html: `<p>เลือดออกมากผิดปกติ &gt; 7 วัน และ/หรือมีอาการอื่นร่วม เช่น ปวดประจำเดือน จนรบกวนคุณภาพชีวิต</p>
<ul>
  <li><b>Pathophysiology:</b> 50% ไม่ทราบสาเหตุ (dysfunctional uterine bleeding) · 50% มีพยาธิสภาพ เช่น fibroids, polyps, carcinoma หรือยาที่ทำให้เลือดออก</li>
  <li><b>Diagnosis:</b> เลือดออกมากกว่าปกติ · ปริมาณแปรปรวน · ดูยาที่มีผลต่อรอบเดือน เช่น anticoagulants, phenothiazine, steroid</li>
  <li><b>Red flags:</b> pelvic pain · intermenstrual bleeding · post-coital bleeding/pain</li>
</ul>
<h3>การรักษา</h3>
<ol>
  <li><b>NSAIDs first-line</b> ใช้ตลอดช่วงมีประจำเดือน ลดเลือดได้ 20–50%</li>
  <li>ไม่ได้ผล → oral MPA ในช่วง luteal phase</li>
  <li>ต้องการคุมกำเนิด หรือ MPA ไม่ได้ผล → LNG-IUD หรือ COCs · <mark>LNG-IUD ลดเลือดได้ดีที่สุด (75–95%)</mark></li>
</ol>` },
    { id: 'pms', t: 'PMS / PMDD', html: `<p>อาการเกิดหลังไข่ตกสม่ำเสมอก่อนมีประจำเดือน (5–7 วัน หรือนานถึง 12–14 วันก่อน) และหายเมื่อประจำเดือนมา</p>
<p><b>Pathophysiology:</b> ยังไม่แน่ชัด อาจจากระดับฮอร์โมนเพศเปลี่ยนร่วมกับความไวของสมองต่อ serotonin และ GABA · ก่อนมีประจำเดือนฮอร์โมนเพศลด → serotonin transport/uptake เพิ่ม → serotonin และ GABA ใน CNS ลดลง</p>
<ul>
  <li><b>Physical:</b> บวม เจ็บเต้านม ปวดหัว</li>
  <li><b>Behavioral:</b> นอนไม่หลับ อยากกินคาร์โบไฮเดรต ซึม ไม่เข้าสังคม</li>
  <li><b>Mood:</b> หงุดหงิด mood swing anxiety depression</li>
</ul>
<h3>Diagnosis</h3>
<ul>
  <li>แยกจาก mental disorder และโรคทางสูตินรีเวช · บันทึกอาการ 3 รอบติดต่อกัน</li>
  <li>อาการเป็นรอบตามประจำเดือน (เกิดก่อน หายหลัง) เข้าได้กับ PMS · ไม่สัมพันธ์กับรอบเดือนอาจเป็นปัญหาทางจิตใจ</li>
</ul>
<div class="key"><strong class="k">เกณฑ์ ACOG สำหรับ PMS</strong>มีอาการ ≥ 1 ข้อ ใน 5 วันก่อนประจำเดือน ติดต่อกัน 3 รอบ · ดีขึ้นภายใน 4 วันหลังประจำเดือนมา · รุนแรงจนรบกวนชีวิตประจำวัน</div>
<p>อาการตามเกณฑ์ ACOG: โกรธง่าย วิตกกังวล ความต้องการทางเพศเปลี่ยน สับสน ร้องไห้ ซึมเศร้า งีบหลับบ่อย นอนไม่หลับ หงุดหงิด สมาธิไม่ดี แยกตัว · ปวดท้อง/ท้องอืด ปวดเมื่อย น้ำหนักขึ้น เจ็บเต้านม อ่อนเพลีย อาการ GI ปวดหัว ปัญหาผิว มือเท้าบวม กระหายน้ำ/อยากอาหาร</p>
<p><b>Risk factors:</b> มารดาเป็น PMS/PMDD · ประวัติ mood/anxiety/personality disorder</p>
<p><b>Red flags:</b> อายุ &lt; 30 ปี · รุนแรงจนทำงานไม่ได้ · มีเฉพาะอาการทางจิตเวช · ไม่ดีขึ้นหรือแย่ลงหลังมีประจำเดือน</p>
<h3>การรักษา</h3>
<ul>
  <li><b>SSRIs</b> (sertraline, paroxetine, fluoxetine) <mark>first-line สำหรับอาการรุนแรง</mark> ให้ช่วง luteal phase (2 สัปดาห์ก่อนมีประจำเดือน) อย่างน้อย 3 รอบ</li>
  <li><b>EE 20 mcg/drospirenone 3 mg</b> หรือ COC อื่น สำหรับ mild–moderate (second-line)</li>
  <li><b>Calcium ≥ 1,200 mg</b> (ADR ท้องอืด ท้องผูก)</li>
  <li>รักษาตามอาการ: NSAIDs, pyridoxine</li>
  <li>Non-pharmacologic: ออกกำลังกาย โยคะ ลดเค็ม</li>
</ul>` },
  ],
  questions: [
    { q: 'หญิงอายุ 28 ปี มีประจำเดือนออกมากผิดปกตินาน 8 วันทุกเดือน ไม่มีเลือดออกนอกรอบ ไม่มี post-coital bleeding ตรวจไม่พบพยาธิสภาพทางกาย เภสัชกรควรแนะนำการรักษาขั้นแรกใด', o: ['Levonorgestrel IUD ทันที', 'NSAIDs เริ่มเมื่อมีประจำเดือนและใช้ต่อเนื่องระหว่างมีประจำเดือน', 'Oral MPA วันที่ 5–26 ของรอบเดือน', 'Combined oral contraceptive เท่านั้น', 'ส่งต่อแพทย์เพื่อผ่าตัด'], a: 1, e: 'NSAIDs เป็น first-line ของภาวะประจำเดือนมามากผิดปกติ (ลดเลือดได้ 20–50%)' },
    { q: 'หญิงอายุ 19 ปี ปวดประจำเดือนแบบบีบเกร็งทุกเดือน เคยใช้ mefenamic acid แล้วไม่ได้ผลเต็มที่ ไม่มีข้อห้ามการใช้ฮอร์โมนและต้องการคุมกำเนิดร่วมด้วย ทางเลือกที่เหมาะสมที่สุดในขั้นถัดไปคือข้อใด', o: ['เพิ่มขนาด mefenamic acid ให้สูงกว่าที่แนะนำ', 'เปลี่ยนไปใช้ low-dose COC (EE < 35 mcg) ต่อเนื่อง 2–3 รอบเดือน', 'หยุดยาทั้งหมดและรอดูอาการ', 'ใช้ hyoscine butylbromide เป็นหลัก', 'ส่งต่อแพทย์เพื่อผ่าตัด'], a: 1, e: 'NSAIDs (first-line) ไม่ได้ผล ขั้นต่อไปคือ low-dose COC ซึ่งเหมาะเพราะผู้ป่วยต้องการคุมกำเนิดด้วย' },
    { q: 'หญิงอายุ 17 ปี ปวดท้องน้อยแบบบีบเกร็ง เริ่มประมาณ 12 ชั่วโมงก่อนมีประจำเดือน และหายเองภายใน 2 วัน ไม่มีไข้ ไม่มีตกขาวผิดปกติ ประจำเดือนมาสม่ำเสมอ กลไกหลักที่ทำให้ปวดคือข้อใด', o: ['Estrogen ที่สูงขึ้นกระตุ้น endometrial hyperplasia', 'Prostaglandin และ leukotriene ทำให้มดลูกหดรัดตัวและ vasoconstriction', 'การติดเชื้อในอุ้งเชิงกรานทำให้เกิดการอักเสบ', 'เยื่อบุโพรงมดลูกเจริญผิดที่ไปเกาะที่รังไข่', 'ระดับ FSH/LH ผิดปกติทำให้ไข่ไม่ตก'], a: 1, e: 'Primary dysmenorrhea: ก่อนมีประจำเดือน progesterone ลด ปล่อย arachidonic acid สร้าง prostaglandin และ leukotriene ทำให้มดลูกหดรัดตัวและ vasoconstriction' },
    { q: 'ยาใดมีประสิทธิภาพสูงสุดในการลดปริมาณเลือดประจำเดือนในผู้ป่วย HMB', o: ['NSAIDs', 'Oral MPA', 'Combined oral contraceptive', 'Levonorgestrel-releasing IUD (LNG-IUD)', 'Tranexamic acid'], a: 3, e: 'LNG-IUD ลดเลือดได้มากที่สุด (75–95%) และอาจทำให้ไม่มีประจำเดือน' },
    { q: 'ยากลุ่มใดเป็น first-line pharmacologic treatment สำหรับ PMDD ที่มีอาการทางอารมณ์รุนแรง', o: ['Benzodiazepines', 'SSRIs เช่น fluoxetine, sertraline', 'Tricyclic antidepressants', 'Beta-blockers', 'MAOIs'], a: 1, e: 'SSRIs เป็น first-line ตาม ACOG สำหรับ PMDD ที่มีอาการทางอารมณ์เด่นชัด' },
  ],
}
