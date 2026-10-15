// Headache (migraine, tension) — converted from the RxTU10 class summary PDF (see content/summaries/manifest.json)
export default {
  id: 'headache',
  date: '15/08/2026',
  refs: [
    'ชมรมศึกษาโรคปวดศีรษะ ภายใต้สมาคมประสาทวิทยาแห่งประเทศไทย. แนวทางเวชปฏิบัติการวินิจฉัยและการรักษาปวดศีรษะไมเกรน ฉบับสมบูรณ์ 2565. กรุงเทพฯ: ธนาเพรส; 2565.',
    'Wippold FJ II, Whealy MA, Kaniecki RG. Evaluation of headache in adults. UpToDate; 2026.',
    'Headache Classification Committee of the International Headache Society (IHS). The International Classification of Headache Disorders, 3rd edition (ICHD-3). Cephalalgia. 2018;38(1):1–211.',
    'Cutrer FM. Pathophysiology, clinical manifestations, and diagnosis of migraine in adults. UpToDate; updated Nov 6, 2024.',
    'American Headache Society. Red Flags in Headache — What if it isn\'t Migraine? 2021.',
    'Kaniecki RG, Steel S. Tension-type headache in adults: Etiology, clinical features, and diagnosis. UpToDate; 2026.',
    'Kaniecki RG, Steel S. Tension-type headache in adults: Acute treatment. UpToDate; 2026.',
  ],
  sections: [
    { id: 'overview', t: 'Overview', html: `<p>กลุ่มอาการปวดศีรษะแบ่งเป็น 2 ประเภท</p>
<ol>
  <li><b>Primary headache:</b> ไม่มีความผิดปกติทางโครงสร้างของสมองหรือศีรษะ (structural lesion) เป็นสาเหตุ โรคที่พบบ่อยที่สุดคือ migraine, tension-type headache และ cluster headache</li>
  <li><b>Secondary headache:</b> เกิดจากพยาธิสภาพทางโครงสร้างบริเวณศีรษะหรือคอ เช่น ความผิดปกติของสมอง หลอดเลือด การติดเชื้อ</li>
</ol>
<h3>ลักษณะของ migraine, tension-type และ cluster headache</h3>
<div class="tbl"><table>
  <tr><th></th><th>Migraine</th><th>Tension-type</th><th>Cluster</th></tr>
  <tr><td>ลักษณะปวด</td><td>ปวดตุบ ๆ ข้างเดียวเป็นส่วนใหญ่</td><td>ปวดตื้อ ๆ รัดแน่นเหมือนมีอะไรมาบีบ</td><td>ปวดรุนแรงมากรอบตาข้างเดียว</td></tr>
  <tr><td>กิจกรรม</td><td>แย่ลงเมื่อเคลื่อนไหว</td><td>ไม่ค่อยแย่ลงเมื่อทำกิจกรรม</td><td>ปวดรุนแรงจนอยู่ไม่นิ่ง</td></tr>
  <tr><td>อาการร่วม</td><td>คลื่นไส้ แพ้แสง แพ้เสียง</td><td>ไม่มีอาการร่วมเด่น</td><td>น้ำตาไหล ตาแดง คัดจมูกข้างเดียว</td></tr>
  <tr><td>ระยะเวลา</td><td>4–72 ชั่วโมง</td><td>30 นาที–7 วัน</td><td>15 นาที–3 ชั่วโมง</td></tr>
</table></div>
<h3>SNOOP4 — คัดกรอง red flags (ควรส่งโรงพยาบาล)</h3>
<div class="tbl"><table>
  <tr><th>SNOOP4</th><th>ตัวอย่างที่ควรสงสัย</th></tr>
  <tr><td>S – Systemic</td><td>ไข้ น้ำหนักลด มะเร็ง HIV ภูมิคุ้มกันบกพร่อง ตั้งครรภ์</td></tr>
  <tr><td>N – Neurologic</td><td>แขนขาอ่อนแรง ชา พูดไม่ชัด ชัก ซึม สับสน</td></tr>
  <tr><td>O – Onset sudden</td><td>ปวดรุนแรงที่สุดในชีวิต ภายในไม่กี่วินาที–1 นาที</td></tr>
  <tr><td>O – Older age</td><td>เริ่มปวดหัวครั้งแรกตอนอายุ &gt; 50 ปี</td></tr>
  <tr><td>P (4 ข้อ)</td><td><ul>
    <li><b>Progressive</b> ปวดถี่ขึ้น รุนแรงขึ้น หรือไม่ตอบสนองต่อการรักษา</li>
    <li><b>Positional / Precipitated by Valsalva</b> ปวดเมื่อออกแรง เปลี่ยนท่า</li>
    <li><b>Papilledema</b> จอประสาทตาบวม</li>
    <li><b>Pregnancy</b> ตั้งครรภ์หรือหลังคลอด (เป็นครั้งแรก)</li>
  </ul></td></tr>
</table></div>` },
    { id: 'migraine', t: 'Migraine: นิยามและการวินิจฉัย', html: `<h3>Definition</h3>
<p>โรคปวดศีรษะไมเกรนพบได้บ่อย และส่งผลกระทบต่อการทำงาน การเรียน และชีวิตประจำวัน แบ่งตามความถี่เป็น 2 ประเภท</p>
<ul>
  <li><b>Episodic migraine (EM)</b> ปวด &lt; 15 วัน/เดือน แบ่งเป็น with/without aura</li>
  <li><b>Chronic migraine (CM)</b> ปวด ≥ 15 วัน/เดือน นาน &gt; 3 เดือน</li>
</ul>
<p>ปวดเป็นครั้ง ๆ แต่ละครั้งนาน 4–72 ชั่วโมง อาการที่พบบ่อย ได้แก่ ปวดข้างเดียว (unilateral) · ปวดตุบ ๆ ตามชีพจร (pulsating) · ปานกลางถึงรุนแรง · แย่ลงเมื่อทำกิจกรรมทางกายตามปกติ · มักมีคลื่นไส้และ/หรืออาเจียน แพ้แสง แพ้เสียง</p>
<h3>Epidemiology</h3>
<ul>
  <li>พบในประชากรทั่วไปประมาณ 12–15%</li>
  <li>ผู้หญิงพบมากกว่าผู้ชาย (ประมาณ 17% เทียบกับ 6% ต่อปี) พบมากที่สุดช่วงอายุ 30–39 ปี</li>
  <li>Migraine without aura พบบ่อยที่สุด ประมาณ 75% ของผู้ป่วย</li>
</ul>
<p><b>Risk factors:</b> เพศหญิง · ประวัติครอบครัว (พันธุกรรม) · อายุวัยทำงาน (20–50 ปี) · การเปลี่ยนแปลงของฮอร์โมนเอสโตรเจน</p>
<p><b>Trigger factors:</b> ความเครียด · นอนไม่พอ · อดอาหาร · แอลกอฮอล์ · แสงจ้า · กลิ่นแรง เช่น น้ำหอม · การเปลี่ยนแปลงของสภาพอากาศ</p>
<h3>Diagnosis (ICHD-3)</h3>
<p><b>Migraine without aura</b></p>
<ul>
  <li>ปวดศีรษะอย่างน้อย 5 ครั้ง</li>
  <li>แต่ละครั้งนาน 4–72 ชั่วโมง (หากไม่ได้รักษาหรือรักษาไม่ได้ผล)</li>
  <li>ลักษณะปวดอย่างน้อย 2 ใน 4 ข้อ: ข้างเดียว · ตุบ ๆ ตามชีพจร · ปานกลางถึงรุนแรง · แย่ลงเมื่อทำกิจกรรมหรือทำให้หลีกเลี่ยงกิจกรรม</li>
  <li>อาการร่วมอย่างน้อย 1 ข้อ: คลื่นไส้และ/หรืออาเจียน · แพ้แสง (photophobia) และแพ้เสียง (phonophobia)</li>
  <li>ไม่สามารถอธิบายได้ด้วยโรคอื่น</li>
</ul>
<p style="font-size:.9em">หมายเหตุ: แม้ ICHD-3 ระบุว่าปวดข้างเดียวเป็นลักษณะสำคัญ แต่ผู้ป่วยบางรายอาจปวดทั้งสองข้างได้ ควรพิจารณาร่วมกับลักษณะและอาการร่วมอื่น</p>
<p><b>Migraine with aura</b></p>
<ul>
  <li>ปวดศีรษะอย่างน้อย 2 ครั้ง</li>
  <li>มี aura (อาการทางระบบประสาทชั่วคราว) อย่างน้อย 1 ชนิด
    <ul>
      <li>visual – เห็นแสงไฟระยิบระยับ ไฟซิกแซก ไฟสว่างวาบ หรือมืดมัวลง</li>
      <li>sensory – ชามือ แขน ขา หรือปาก</li>
      <li>speech and/or language – พูดไม่ออก พูดผิด พูดไม่ชัด</li>
      <li>motor – แขนขาอ่อนแรงครึ่งซีก</li>
      <li>brainstem – เวียนหัว หูดับ เดินเซ หูแว่ว ตาเข ตาเหล่ หรือหมดสติ</li>
      <li>retinal – ตามืดข้างเดียว</li>
    </ul>
  </li>
  <li>มีอย่างน้อย 3 ใน 6 ลักษณะ
    <ul>
      <li>aura ค่อย ๆ เกิดขึ้นภายใน ≥ 5 นาที</li>
      <li>มี aura ตั้งแต่ 2 อาการขึ้นไปเกิดต่อเนื่องกัน</li>
      <li>aura แต่ละอาการนาน 5–60 นาที</li>
      <li>มี aura อย่างน้อย 1 อาการเกิดข้างเดียว</li>
      <li>มี aura อย่างน้อย 1 อาการเป็น positive symptom เช่น เห็นแสงวาบ เส้นซิกแซก</li>
      <li>ปวดศีรษะเกิดร่วมกับ aura หรือภายใน 60 นาทีหลัง aura</li>
    </ul>
  </li>
  <li>ไม่สามารถอธิบายได้ด้วยโรคอื่น</li>
</ul>
<p><b>Chronic migraine</b></p>
<ul>
  <li>ปวดศีรษะ ≥ 15 วัน/เดือน ติดต่อกันนานกว่า 3 เดือน</li>
  <li>เคยมีอาการเข้าเกณฑ์ migraine with หรือ without aura อย่างน้อย 5 ครั้ง</li>
  <li>อย่างน้อย 8 วัน/เดือน ต้องมีลักษณะเข้าได้กับไมเกรน นานกว่า 3 เดือน</li>
  <li>ไม่สามารถอธิบายได้ด้วยโรคอื่น</li>
</ul>
<p><b>Medication overuse headache (MOH)</b></p>
<ul>
  <li>ปวดศีรษะ ≥ 15 วัน/เดือน นาน &gt; 3 เดือน ในผู้ที่มี primary headache อยู่เดิม</li>
  <li>ใช้ยาบรรเทาปวดบ่อยเกินไปนาน &gt; 3 เดือน: <mark>ergot, triptan หรือ opioid ≥ 10 วัน/เดือน</mark> · <mark>NSAIDs หรือ paracetamol ≥ 15 วัน/เดือน</mark></li>
  <li>ไม่สามารถอธิบายได้ด้วยโรคอื่น</li>
</ul>
<p>ประเมินผลการรักษาด้วยแบบประเมินมาตรฐาน: <b>MIDAS</b> (Migraine Disability Assessment) · <b>HIT-6</b> (Headache Impact Test-6)</p>` },
    { id: 'patho', t: 'Migraine: พยาธิสรีรวิทยาและอาการ', html: `<p>ไมเกรนไม่ได้เกิดจากหลอดเลือดขยายตัวเพียงอย่างเดียว แต่เป็นความผิดปกติในการประมวลผลของระบบประสาท (disorder of sensory processing) ที่มีการกระตุ้นระบบ <b>trigeminovascular</b> ร่วมกับการอักเสบของเส้นประสาท</p>
<ol>
  <li><b>Prodrome</b> เกิดก่อนปวดหัว 24–48 ชม. → อ่อนเพลีย หาวบ่อย อารมณ์เปลี่ยน</li>
  <li><b>Aura</b> นาน 5–60 นาที → เห็นแสงวูบวาบ จุดดำ เส้นซิกแซก ชา พูดลำบาก หูอื้อ</li>
  <li><b>Headache</b> → ปวดตุบ ๆ 4–72 ชม. คลื่นไส้ แพ้แสง แพ้เสียง</li>
  <li><b>Postdrome</b> หลังหายปวด 24–48 ชม. → อ่อนเพลีย มึนงง สมาธิลดลง</li>
</ol>` },
    { id: 'acute', t: 'Migraine: Acute treatment', html: `<p>ให้ยาตั้งแต่เริ่มมีอาการ (early treatment) เลือกยาตามความรุนแรง</p>
<ul>
  <li><b>Mild attack:</b> paracetamol, NSAIDs → ไม่ตอบสนอง พิจารณา triptan, ergotamine/caffeine</li>
  <li><b>Moderate–severe attack:</b> triptans หรือ ergotamine</li>
</ul>
<h3>Triptans</h3>
<ul>
  <li><b>Sumatriptan</b> 50–100 mg ซ้ำได้หลัง ≥ 2 ชม. ไม่เกิน 200 mg/วัน</li>
  <li><b>Eletriptan</b> 20–40 mg ซ้ำได้หลัง ≥ 2 ชม. ไม่เกิน 80 mg/วัน</li>
  <li>กลไก: selective 5-HT<sub>1B/1D</sub> agonist → หดหลอดเลือดสมอง ยับยั้งการหลั่ง CGRP และการส่งสัญญาณปวด</li>
  <li>ข้อควรระวัง: ห้ามใช้ในโรคหัวใจ โรคหลอดเลือดสมอง ความดันสูงที่ควบคุมไม่ได้ หญิงตั้งครรภ์</li>
  <li>ไม่ใช้ร่วมกับ ergotamine (เว้น ≥ 24 ชม.) และห้ามใช้ร่วมกับ MAOI ภายใน 2 สัปดาห์</li>
  <li>ผลข้างเคียง: เวียนศีรษะ ง่วง คลื่นไส้ อ่อนเพลีย แน่นหน้าอก/คอ ชาปลายมือปลายเท้า</li>
  <li>ห้ามใช้ต่อเนื่องเกิน 10 วัน/เดือน</li>
</ul>
<h3>Ergotamine</h3>
<ul>
  <li>1–2 mg PO เมื่อเริ่มปวด ซ้ำได้ทุก 30 นาที ไม่เกิน 6 mg/วัน และ 10 mg/สัปดาห์</li>
  <li>กลไก: non-selective 5-HT<sub>1</sub> agonist → หดหลอดเลือดสมอง ยับยั้งการส่งสัญญาณปวดจาก trigeminovascular system</li>
  <li>ข้อควรระวัง: ห้ามใช้ในโรคหัวใจ โรคหลอดเลือดสมอง ความดันสูงที่ควบคุมไม่ได้ หญิงตั้งครรภ์ · ไม่ใช้ร่วมกับ triptans (เว้น ≥ 24 ชม.) · หลีกเลี่ยงร่วมกับ macrolides, azole antifungals, protease inhibitors</li>
  <li>ผลข้างเคียง: คลื่นไส้ อาเจียน ปวดท้อง เวียนศีรษะ</li>
</ul>
<h3>ใช้ triptan ไม่ได้หรือมีข้อห้าม</h3>
<p>CGRP antagonist (ubrogepant, rimegepant) · lasmiditan · dihydroergotamine (DHE) · antiemetics (metoclopramide, prochlorperazine)</p>
<h3>ข้อห้าม ข้อควรระวัง และผลข้างเคียงของยาแก้ปวดไมเกรน</h3>
<ul>
  <li><b>Paracetamol</b> → ระวังตับ ไม่เกิน 4 g/วัน (ไม่เกิน 3 g/วัน หากใช้ต่อเนื่องเกิน 7 วัน)</li>
  <li><b>NSAIDs</b> → ระวังกระเพาะ ไต หัวใจ</li>
  <li><b>Ergotamine/triptans</b> → ห้ามใช้ในโรคหัวใจ หลอดเลือด ความดันสูงควบคุมไม่ได้ และ hemiplegic/brainstem migraine</li>
  <li><b>CGRP antagonists</b> → ระวังปฏิกิริยากับยา CYP3A4</li>
  <li><b>Lasmiditan</b> → ระวังง่วง เวียนศีรษะ serotonin syndrome</li>
  <li><b>Metoclopramide</b> → เสี่ยง extrapyramidal symptoms (EPS)</li>
  <li><b>Domperidone</b> → เสี่ยง QTc prolongation และหัวใจเต้นผิดจังหวะ</li>
  <li>Triptans ไม่ควรใช้ร่วมกับ ergotamine เพราะเสริมฤทธิ์หดหลอดเลือดมากเกินไป หากต้องเปลี่ยนยาควรเว้น ≥ 24 ชม.</li>
  <li>Ergotamine และ eletriptan ไม่ควรใช้ร่วมกับ (ต้องหยุดยาอย่างน้อย 72 ชม.) macrolides · ยาต้านเชื้อราบางชนิด · protease inhibitors</li>
</ul>
<div class="key"><strong class="k">ใช้ยาแก้ปวดบ่อยเกินเกณฑ์</strong>ควรเริ่มยาป้องกัน (preventive treatment) แทนการเพิ่มยาแก้ปวดเฉียบพลัน</div>
<p style="font-size:.9em">ต้นฉบับตั้งหัวข้อส่วนนี้ว่า "ยาป้องกันไมเกรน" แต่เนื้อหาเป็นยารักษาเฉียบพลัน จึงปรับชื่อหัวข้อให้ตรงเนื้อหา</p>` },
    { id: 'prevent', t: 'Migraine: Preventive treatment', html: `<p>พิจารณาเริ่มยาป้องกันเมื่อมีข้อใดข้อหนึ่ง</p>
<ul>
  <li>ไมเกรนกระทบการเรียน การทำงาน หรือคุณภาพชีวิต</li>
  <li>อาการรุนแรงหรือกำเริบบ่อย ใช้ยาแก้ปวดเฉียบพลันบ่อย (มากกว่า 10–15 วัน/เดือน)</li>
  <li>ปวดศีรษะ ≥ 4 ครั้ง/เดือน</li>
  <li>ยารักษาเฉียบพลันไม่ได้ผล มีข้อห้ามใช้ หรือเกิดผลข้างเคียง</li>
  <li>เป็น hemiplegic migraine, migraine with brainstem aura หรือ prolonged aura</li>
</ul>
<div class="key"><strong class="k">Start low, go slow</strong>ประเมินผลหลังใช้ยา 2–3 เดือน เป้าหมายคือลดจำนวนวันปวด ≥ 50% และลดผลกระทบต่อคุณภาพชีวิต · ควบคุมได้ดีให้ใช้ต่อ 6–12 เดือนก่อนค่อย ๆ ลดยา</div>
<div class="tbl"><table>
  <tr><th>ยา</th><th>ขนาดที่แนะนำ</th><th>ข้อควรระวัง/หลีกเลี่ยง</th><th>ผลข้างเคียงเด่น</th></tr>
  <tr><td><b>Topiramate</b></td><td>เริ่ม 25 → goal 100 mg/day (สูงสุด 200)</td><td>หญิงตั้งครรภ์ นิ่วในไต ต้อหิน ไตวาย</td><td>ชาปลายมือปลายเท้า น้ำหนักลด เบื่ออาหาร เวียนศีรษะ ความจำลด/คิดช้า</td></tr>
  <tr><td><b>Valproate</b></td><td>เริ่ม 250 → 750–1,500 mg/day</td><td>ห้ามใช้ในหญิงตั้งครรภ์ โรคตับ</td><td>คลื่นไส้ มือสั่น น้ำหนักขึ้น ผมร่วง ↑LFT</td></tr>
  <tr><td><b>Propranolol</b></td><td>80–160 mg/day</td><td rowspan="2">หอบหืด HF BP ต่ำ bradycardia</td><td rowspan="2">อ่อนเพลีย ชีพจรช้า BP ต่ำ นอนไม่หลับ เสื่อมสมรรถภาพ</td></tr>
  <tr><td><b>Metoprolol</b></td><td>100–200 mg/day</td></tr>
  <tr><td><b>Amitriptyline / nortriptyline</b></td><td>เริ่ม 10 mg hs → 20–40 mg/day (max 100–150)</td><td>heart block ต้อหิน BPH โรคหัวใจ</td><td>ง่วง ปากแห้ง ท้องผูก น้ำหนักขึ้น QT prolongation</td></tr>
  <tr><td><b>Venlafaxine XR</b></td><td>เริ่ม 37.5 → 150 mg/day</td><td>ความดันสูง ไตวาย</td><td>คลื่นไส้ เวียนศีรษะ ง่วง ตามัว sexual dysfunction</td></tr>
  <tr><td><b>Flunarizine</b></td><td>10 mg ก่อนนอน</td><td>ซึมเศร้า Parkinson</td><td>ง่วง น้ำหนักขึ้น ซึมเศร้า EPS</td></tr>
  <tr><td><b>Lisinopril</b></td><td>20 mg/day</td><td>ตั้งครรภ์ BP ต่ำ</td><td>BP ต่ำ เวียนศีรษะ ไอแห้ง angioedema</td></tr>
  <tr><td><b>Candesartan</b></td><td>16 mg/day</td><td>ตั้งครรภ์ BP ต่ำ</td><td>BP ต่ำ เวียนศีรษะ อ่อนเพลีย</td></tr>
</table></div>
<ul>
  <li><b>Onabotulinum toxin A</b> ใช้เฉพาะ chronic migraine ที่ไม่ตอบสนองต่อยาป้องกัน ≥ 2 ชนิด ฉีด 155–195 units ทุก 12 สัปดาห์ · ผลข้างเคียงไม่บ่อย เช่น ปวดคอ หนังตาตก ปวดตำแหน่งฉีด</li>
  <li><b>CGRP monoclonal antibodies</b> (erenumab, fremanezumab, galcanezumab, eptinezumab) ใช้ใน episodic ความถี่สูงหรือ chronic migraine ที่ไม่ตอบสนองต่อยาป้องกันอย่างน้อย 2 ชนิด · ผลข้างเคียงน้อย (ปวด/บวมตำแหน่งฉีด ท้องผูก) · หลีกเลี่ยงในหญิงตั้งครรภ์/ให้นมบุตร</li>
</ul>
<h3>ยาสำหรับไมเกรนในหญิงตั้งครรภ์</h3>
<div class="tbl"><table>
  <tr><th>ชื่อยา</th><th>Pregnancy category</th></tr>
  <tr><td colspan="2"><b>ยาลดอาการปวดศีรษะ</b></td></tr>
  <tr><td>Acetaminophen</td><td>B</td></tr>
  <tr><td>NSAIDs (naproxen, ibuprofen)</td><td>ไตรมาส 1 และ 2: B · ไตรมาส 3: D</td></tr>
  <tr><td>Sumatriptan</td><td>เดิม C แต่จากข้อมูลปัจจุบันน่าจะ B</td></tr>
  <tr><td colspan="2"><b>ยาป้องกันอาการปวดศีรษะ</b></td></tr>
  <tr><td>Propranolol 10–20 mg วันละ 2 ครั้ง</td><td>C</td></tr>
  <tr><td>Amitriptyline 10–25 mg/วัน</td><td>C</td></tr>
  <tr><td>Riboflavin 400 mg/วัน</td><td>C</td></tr>
</table></div>
<h3>ยาสำหรับไมเกรนในหญิงให้นมบุตร (compatible with breastfeeding)</h3>
<div class="tbl"><table>
  <tr><th>ยาลดอาการปวดศีรษะ</th><th>ยาป้องกันอาการปวดศีรษะ</th></tr>
  <tr><td>Acetaminophen · ibuprofen · sumatriptan</td><td>Magnesium oxide 400–500 mg/วัน · riboflavin 400 mg/วัน · propranolol 10–20 mg วันละ 2 ครั้ง</td></tr>
</table></div>
<h3>Herbs & food supplement</h3>
<ol><li>วิตามินบี 2 (riboflavin)</li><li>Coenzyme Q10</li><li>Magnesium</li><li>สารสกัดจากราก butterbur</li></ol>` },
    { id: 'tth', t: 'Tension-type headache', html: `<h3>Definition</h3>
<p>Primary headache ที่ปวด<b>ทั้งสองข้าง ไม่ปวดตุบ ๆ</b> รุนแรงเล็กน้อยถึงปานกลาง ไม่มีอาการร่วมเด่นชัด เช่น คลื่นไส้อาเจียน</p>
<p><b>Risk factors:</b> เพศหญิง · อายุน้อย · ความเหนื่อยล้า · ความผิดปกติของการนอน · ประวัติไมเกรน · ประวัติซึมเศร้า · วิตามิน D ต่ำ</p>
<h3>Diagnosis</h3>
<p>วินิจฉัยจากลักษณะอาการเป็นหลัก</p>
<ul>
  <li>ปวดศีรษะ 2 ข้าง</li>
  <li>ปวดตื้อ ๆ กดหรือรัด (ไม่ปวดตุบ ๆ)</li>
  <li>รุนแรงเล็กน้อย–ปานกลาง</li>
  <li>ไม่ปวดมากขึ้นเมื่อเดินหรือทำกิจกรรม</li>
  <li>ไม่มีคลื่นไส้หรืออาเจียน (อาจไวต่อแสงหรือเสียงได้อย่างใดอย่างหนึ่ง)</li>
</ul>
<div class="tbl"><table>
  <tr><th>ชนิด</th><th>ความถี่</th></tr>
  <tr><td>Infrequent episodic</td><td>&lt; 1 วัน/เดือน</td></tr>
  <tr><td>Frequent episodic</td><td>1–14 วัน/เดือน (&gt; 3 เดือน)</td></tr>
  <tr><td>Chronic</td><td>≥ 15 วัน/เดือน (&gt; 3 เดือน) · อาจมี mild nausea, photophobia หรือ phonophobia ได้อย่างใดอย่างหนึ่ง แต่คลื่นไส้อาเจียนไม่รุนแรง</td></tr>
</table></div>
<h3>Pathophysiology</h3>
<p>ความผิดปกติของการรับรู้ความเจ็บปวดทั้งส่วนปลาย (peripheral sensitization) และส่วนกลาง (central sensitization)</p>
<ul>
  <li><b>Episodic:</b> กระตุ้น nociceptors และความกดเจ็บของกล้ามเนื้อรอบศีรษะและคอ (myofascial/pericranial muscles)</li>
  <li><b>Chronic:</b> สัญญาณปวดจากส่วนปลายต่อเนื่อง → central sensitization ระบบประสาทส่วนกลางไวต่อความปวดมากขึ้น ส่งสัญญาณปวดเพิ่ม ยับยั้งสัญญาณปวดลดลง</li>
  <li>Nitric oxide (NO) อาจมีบทบาทกระตุ้นอาการปวด · พันธุกรรมสำคัญมากกว่าใน chronic TTH</li>
</ul>
<h3>Acute treatment</h3>
<p>First-line: simple analgesics (NSAIDs, acetaminophen)</p>
<ul><li>Ibuprofen 400–600 mg</li><li>Naproxen 220–550 mg</li><li>Diclofenac 25–100 mg</li></ul>
<h3>Preventive treatment</h3>
<p>พิจารณาเมื่อปวด ≥ 2 ครั้ง/สัปดาห์ · ปวด &gt; 3–4 ชม./ครั้ง · acute treatment ไม่ได้ผล · อาการรบกวนการใช้ชีวิต</p>
<p><b>First-line: Amitriptyline</b> (TCA)</p>
<ul>
  <li>เริ่ม 10–12.5 mg ก่อนนอน สูงสุด 100–125 mg/วัน</li>
  <li>ปรับเพิ่มครั้งละ 10–12.5 mg ทุก 1–2 สัปดาห์ ประเมินผลหลัง 4–6 สัปดาห์</li>
  <li>รักษาต่อ 3–6 เดือนก่อนพิจารณาลดขนาด</li>
  <li>กลไก: ยับยั้ง reuptake ของ serotonin และ norepinephrine ลดความไวของระบบประสาท</li>
  <li>ข้อควรระวัง: เริ่มต่ำปรับช้า ระวังในผู้สูงอายุ โรคหัวใจ ต้อหินมุมปิด ปัสสาวะคั่งจากต่อมลูกหมากโต (ฤทธิ์ anticholinergic และผลต่อการนำไฟฟ้าหัวใจ)</li>
  <li>ผลข้างเคียง: ง่วง ปากแห้ง ท้องผูก น้ำหนักเพิ่ม เวียนศีรษะ orthostatic hypotension ปัสสาวะคั่ง ตาพร่ามัว</li>
</ul>
<p><b>Alternative</b> (ไม่ตอบสนอง มีข้อห้าม หรือทนผลข้างเคียงไม่ได้): mirtazapine · venlafaxine · gabapentin · topiramate · tizanidine</p>` },
  ],
  questions: [
    { q: 'หญิงอายุ 35 ปี ปวดศีรษะ 20 วัน/เดือน โดยเป็นไมเกรน 10 วัน/เดือน ได้รับ propranolol และ topiramate แล้วอาการยังไม่ดีขึ้น ยาที่ควรพิจารณาต่อไปคือ', o: ['Ergotamine', 'Onabotulinum toxin A', 'Paracetamol', 'Naproxen ทุกวัน', 'Sumatriptan ทุกวัน'], a: 1, e: 'เป็น chronic migraine ที่ไม่ตอบสนองต่อยาป้องกันอย่างน้อย 2 ชนิด จึงพิจารณา onabotulinum toxin A (หรือ CGRP monoclonal antibody ตามข้อบ่งใช้)' },
    { q: 'หญิงอายุ 32 ปี เป็นไมเกรนเดือนละ 10 วัน ได้รับการวินิจฉัยให้เริ่มยาป้องกัน ผู้ป่วยมี BMI 31 kg/m² และต้องการลดน้ำหนัก ควรเลือกยาป้องกันชนิดใดมากที่สุด', o: ['Valproate', 'Amitriptyline', 'Flunarizine', 'Topiramate', 'Propranolol'], a: 3, e: 'Topiramate ช่วยลดความถี่ไมเกรนและมีผลข้างเคียงคือน้ำหนักลด' },
    { q: 'หญิงอายุ 26 ปี ปวดศีรษะไมเกรนมา 1 ปี มีอาการปวด 5–6 ครั้ง/เดือน แต่ละครั้งนานประมาณ 24 ชั่วโมง ต้องหยุดงานทุกครั้ง ใช้ sumatriptan แล้วอาการดี ไม่มีโรคประจำตัว เภสัชกรควรแนะนำอย่างไร', o: ['ให้ใช้ sumatriptan ต่อไปเมื่อมีอาการ ไม่ต้องเริ่มยาป้องกัน', 'เริ่ม topiramate หรือ propranolol เพื่อป้องกันไมเกรน', 'เปลี่ยน sumatriptan เป็น ergotamine', 'ใช้ paracetamol ทุกวัน', 'ให้รับประทาน naproxen ทุกวัน'], a: 1, e: 'ปวด ≥ 4 ครั้ง/เดือนและกระทบการใช้ชีวิต เข้าเกณฑ์เริ่มยาป้องกัน แม้ยาแก้ปวดจะบรรเทาอาการได้ · paracetamol และ sumatriptan ใช้รักษาอาการเฉียบพลัน ไม่ช่วยลดความถี่' },
    { q: 'หญิงอายุ 29 ปี กำลังตั้งครรภ์ 32 สัปดาห์ มีอาการไมเกรนเฉียบพลัน ควรเลือกการรักษาข้อใด', o: ['Ibuprofen', 'Naproxen', 'Acetaminophen', 'Ergotamine', 'Diclofenac'], a: 2, e: 'Acetaminophen เป็น first-line สำหรับไมเกรนเฉียบพลันในหญิงตั้งครรภ์ · ergotamine ห้ามใช้ในหญิงตั้งครรภ์ · NSAIDs ควรหลีกเลี่ยงในไตรมาสที่ 3' },
    { q: 'ชายอายุ 45 ปี ปวดศีรษะทั้งศีรษะ ลักษณะเหมือนถูกบีบรัด ความรุนแรงไม่มาก ไม่มีคลื่นไส้ ไม่มีอาเจียน ยังทำงานได้ตามปกติ อาการเกิดหลังทำงานหน้าคอมพิวเตอร์เป็นเวลานาน การวินิจฉัยที่เป็นไปได้มากที่สุดคือข้อใด', o: ['Migraine with aura', 'Migraine without aura', 'Cluster headache', 'Medication overuse headache', 'Tension-type headache'], a: 4, e: 'ปวดแบบกดรัด (pressing/tightening) ทั้งสองข้าง ไม่มี nausea และไม่รุนแรง เป็นลักษณะของ TTH' },
    { q: 'ชายอายุ 55 ปี เป็นไมเกรน ต้องการเริ่มยาป้องกัน มีประวัติหอบหืดควบคุมด้วย inhaled corticosteroid ข้อใดไม่เหมาะสมที่สุด', o: ['Amitriptyline', 'Topiramate', 'Propranolol', 'Flunarizine', 'Candesartan'], a: 2, e: 'Propranolol เป็น non-selective β-blocker อาจทำให้หลอดลมหดเกร็ง จึงควรหลีกเลี่ยงในผู้ป่วยหอบหืด' },
  ],
}
