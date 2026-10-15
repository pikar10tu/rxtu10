// Anxiety & depression — converted from the RxTU10 class summary PDF (see content/summaries/manifest.json)
// ต้นฉบับเป็นโปสเตอร์ ข้อความบางส่วนสระ/วรรณยุกต์หาย → ตรวจกับภาพหน้าแล้ว
const fig = (f, cap, alt) => `<figure><img data-fig="anxiety-depression/${f}.webp" alt="${alt || cap}"><figcaption>${cap}</figcaption></figure>`

export default {
  id: 'anxiety-depression',
  date: '28/07/2026',
  refs: [
    'American Psychiatric Association. Practice guideline for the treatment of patients with obsessive-compulsive disorder. 2007.',
    'American Psychiatric Association. Practice guideline for the treatment of patients with acute stress disorder and posttraumatic stress disorder. 2004.',
    'American Psychiatric Association. Practice guideline for the treatment of patients with panic disorder. 2nd ed. 2009.',
    'ปวลี เนียมถาวร. พยาธิสรีรวิทยาของการเกิดโรควิตกกังวล [เอกสารประกอบการสอน]. คณะเภสัชศาสตร์ มหาวิทยาลัยธรรมศาสตร์; 2568.',
    'กรกช กังวาลทัศน์. พยาธิสรีรวิทยาของการเกิดโรคซึมเศร้า. เอกสารประกอบการสอนวิชา ภศ. 411. คณะเภสัชศาสตร์ มหาวิทยาลัยธรรมศาสตร์; 2568.',
    'สมาคมจิตแพทย์แห่งประเทศไทย. Clinical Practice Guideline for Major Depressive Disorder.',
  ],
  sections: [
    { id: 'anx', t: 'Anxiety disorders: ภาพรวม', html: `<p><b>Anxiety disorders</b> คือกลุ่มโรคที่วิตกกังวลมากเกินไปจนกระทบร่างกาย จิตใจ และชีวิตประจำวัน คุณภาพชีวิตและความสามารถลดลง</p>
<h3>Pathophysiology</h3>
<p>Norepinephrine ↑ · serotonin ↓ · GABA ↓ → การยับยั้ง NE, 5-HT, DA ลดลง ทำให้เกิดอาการวิตกกังวล</p>
<h3>Features</h3>
<div class="tbl"><table>
  <tr><th>โรค</th><th>ลักษณะ</th><th>Acute phase</th><th>Maintenance</th></tr>
  <tr><td>Panic disorder (PD)</td><td>หวาดกลัว/ไม่สบายรุนแรงขึ้นฉับพลันในเวลาสั้น ๆ และกังวลว่าจะเกิดซ้ำ</td><td>12 wk</td><td>12–18 m</td></tr>
  <tr><td>Agoraphobia</td><td>วิตกกังวล หลีกเลี่ยงสถานที่/สถานการณ์ที่เชื่อว่าหนีได้ยาก</td><td></td><td></td></tr>
  <tr><td>Specific phobia</td><td>กลัวมากไปอย่างไม่มีเหตุผลต่อวัตถุหรือสถานการณ์เฉพาะ</td><td></td><td></td></tr>
  <tr><td>Social anxiety disorder (SAD)</td><td>กลัวสังคมหรือสถานการณ์ที่ต้องแสดงความสามารถต่อหน้าผู้อื่น</td><td>4–12 wk</td><td>12 m</td></tr>
  <tr><td>Generalized anxiety disorder (GAD)</td><td>วิตกกังวลมากเกินไป เป็นเกือบทุกวัน</td><td>4–6 wk</td><td>6–12 m</td></tr>
  <tr><td>Obsessive-compulsive disorder (OCD)</td><td>คิดซ้ำ ๆ / พฤติกรรมทางจิตที่ทำซ้ำ ๆ</td><td>8–12 wk</td><td>1–2 y</td></tr>
  <tr><td>Posttraumatic stress disorder (PTSD)</td><td>วิตกกังวล/เครียดหลังเผชิญเหตุการณ์กระทบกระเทือนจิตใจ</td><td>4–6 wk</td><td>12 m</td></tr>
</table></div>
<h3>Risk factors</h3>
<ul>
  <li><b>Genetic:</b> ประวัติครอบครัว</li>
  <li><b>Environment/life events:</b> การเสียชีวิตของคนใกล้ชิด · trauma · ความเครียดเรื้อรังหรือเหตุการณ์สำคัญในชีวิต</li>
  <li><b>Medical illness:</b> CVD (angina, arrhythmia, CHF) · endocrine (hyperthyroidism, hyperglycemia) · GI (IBS) · neurologic (migraine, stroke)</li>
  <li><b>ยาและสาร:</b> CNS stimulants · cocaine · caffeine · amphetamines</li>
</ul>
<h3>ยาที่ใช้ในแต่ละโรค</h3>
<div class="tbl"><table>
  <tr><th>Drug class</th><th>Panic</th><th>GAD</th><th>SAD</th><th>OCD</th><th>PTSD</th></tr>
  <tr><td>SSRIs</td><td>✓</td><td>✓</td><td>✓</td><td>✓</td><td>✓</td></tr>
  <tr><td>SNRIs</td><td>✓</td><td>✓</td><td>✓</td><td></td><td>✓</td></tr>
  <tr><td>TCAs</td><td>✓</td><td>✓</td><td></td><td>✓</td><td>✓</td></tr>
  <tr><td>MAOIs</td><td>✓</td><td>✓</td><td>✓</td><td>✓</td><td>✓</td></tr>
  <tr><td>Pregabalin</td><td></td><td>✓</td><td></td><td></td><td></td></tr>
  <tr><td>Gabapentin</td><td></td><td></td><td>✓</td><td></td><td></td></tr>
  <tr><td>Benzodiazepines</td><td>✓</td><td>✓</td><td>✓</td><td></td><td></td></tr>
  <tr><td>Risperidone</td><td></td><td></td><td></td><td>✓</td><td>✓</td></tr>
  <tr><td>Quetiapine</td><td></td><td>✓</td><td></td><td></td><td></td></tr>
  <tr><td>Mirtazapine</td><td></td><td></td><td></td><td></td><td>✓</td></tr>
  <tr><td>Hydroxyzine, buspirone</td><td></td><td>✓</td><td></td><td></td><td></td></tr>
</table></div>` },
    { id: 'anx-tx', t: 'Anxiety disorders: เกณฑ์และการรักษา', html: `<h3>1. Generalized anxiety disorder (GAD)</h3>
<p><b>DSM-5:</b> กังวลมากเกินไปหลายเรื่อง ควบคุมยาก + อาการร่วม ≥ 3 ใน 6 (เกือบทุกวัน นาน ≥ 6 เดือน): กระสับกระส่าย · เหนื่อยง่าย · ไม่มีสมาธิ · หงุดหงิดง่าย · กล้ามเนื้อตึง · ปัญหาการนอน</p>
<ul>
  <li><b>First-line:</b> CBT · escitalopram 10–20 mg (DI น้อย) · paroxetine 20–50 mg · sertraline 50–150 mg (ใช้บ่อย ต้อง titrate) · venlafaxine 75–225 mg · duloxetine 60–120 mg</li>
  <li><b>Second-line:</b> pregabalin 150–600 mg · buspirone 15–60 mg · ในทางปฏิบัติมักใช้ clonazepam</li>
  <li><b>Other:</b> hydroxyzine 37.5–75 mg</li>
  <li><b>Treatment-resistant:</b> SSRI + atypical antipsychotic (quetiapine, risperidone, olanzapine)</li>
</ul>
<h3>2. Panic disorder (PD)</h3>
<p><b>DSM-5:</b> panic attack กะทันหันและรุนแรง ≥ 4 อาการ เช่น ใจสั่น เหงื่อออก ตัวสั่น หายใจไม่อิ่ม สำลัก เจ็บหน้าอก คลื่นไส้ วิงเวียน หนาวสั่น/ร้อนวูบวาบ ชา derealization กลัวคุมตัวเองไม่ได้ กลัวตาย · หลังเกิด ≥ 1 ครั้งต้องมีอย่างใดอย่างหนึ่งนาน ≥ 1 เดือน: กังวลว่าจะเกิดซ้ำ หรือเปลี่ยนพฤติกรรมเพื่อหลีกเลี่ยง</p>
<ul>
  <li><b>First-line:</b> paroxetine 20–60 · escitalopram 10–20 · fluoxetine 20–40 · fluvoxamine 100–300 · sertraline 50–150 · venlafaxine 75–225 mg</li>
  <li><b>Second-line:</b> imipramine, clomipramine 75–250 mg · benzodiazepines (เมื่อไม่มีประวัติติดยา อาจใช้ร่วม antidepressant ช่วง 2–4 สัปดาห์แรก): <mark>alprazolam 1.5–8 mg (t½ สั้น เหมาะกับ breakthrough panic)</mark>, diazepam 5–20, clonazepam 1–4, lorazepam 2–8 mg</li>
  <li><b>Treatment-resistant:</b> phenelzine</li>
</ul>
<h3>3. Social anxiety disorder (SAD)</h3>
<p><b>DSM-5:</b> กลัวหรือกังวลมากในสถานการณ์ทางสังคมที่อาจถูกจ้องมองหรือประเมิน · สถานการณ์กระตุ้นความกลัวเกือบทุกครั้ง มักหลีกเลี่ยงหรือทนด้วยความกังวลอย่างมาก · ความกลัวไม่สมเหตุสมผลและนาน ≥ 6 เดือน</p>
<ul>
  <li><b>First-line:</b> escitalopram 10–20 · fluoxetine 20–40 · fluvoxamine 100–300 · sertraline 50–150 · paroxetine 20–50 · venlafaxine XR 75–225 mg</li>
  <li><b>Second-line:</b> citalopram 20–40 mg · clonazepam 1.5–8 mg/d (ถ้าไม่มีประวัติติดยา อาจใช้ร่วม antidepressant 2–3 สัปดาห์แรก)</li>
  <li><b>Treatment-resistant:</b> phenelzine</li>
  <li><b>Performance anxiety:</b> propranolol 20–60 mg ก่อนสถานการณ์ 30–60 นาที</li>
</ul>
<h3>4. Obsessive-compulsive disorder (OCD)</h3>
<p><b>DSM-5:</b> obsessions (ความคิดซ้ำ ๆ รบกวนจิตใจ) และ/หรือ compulsions (พฤติกรรมหรือการกระทำทางจิตที่ต้องทำซ้ำเพื่อลดความกังวล) · ใช้เวลา &gt; 1 ชม./วัน หรือก่อความทุกข์/กระทบชีวิตมาก</p>
<ul>
  <li>Mild: CBT ≥ 13 weekly sessions · Severe: SSRI ± CBT ≥ 13 sessions</li>
  <li>ตอบสนองดี รักษาต่อ 1–2 ปี · ไม่ตอบสนอง เปลี่ยน SSRI ตัวอื่น ± CBT · ยังไม่ตอบสนอง <mark>clomipramine</mark> หรือ alternative therapy ± CBT</li>
  <li><b>First-line:</b> escitalopram 10–20 · fluvoxamine 100–300 · sertraline 50–200 · fluoxetine 40–60 · paroxetine 40–60 mg</li>
  <li><b>Second-line:</b> clomipramine 75–250 mg (มักใช้เมื่อ SSRIs ≥ 2 ชนิดไม่ได้ผล)</li>
  <li><b>Treatment-resistant:</b> IV clomipramine (not FDA approved) · SSRI + antipsychotic (haloperidol, quetiapine, olanzapine, risperidone)</li>
</ul>
<h3>5. Posttraumatic stress disorder (PTSD)</h3>
<p><b>DSM-5:</b> stressor (เผชิญหรือเห็นเหตุการณ์รุนแรง) · intrusion (ความทรงจำรบกวน ฝันร้าย flashback) · avoidance · negative alterations (แยกตัว โทษตัวเอง) · hyperarousal (หงุดหงิด นอนไม่หลับ ตกใจง่าย) · นาน &gt; 1 เดือน</p>
<ul>
  <li><b>First-line:</b> fluoxetine 20–40 · paroxetine 20–40 · sertraline 50–100 · venlafaxine 75–300 mg</li>
  <li><b>Second-line:</b> TCAs (amitriptyline, imipramine 75–200 mg) · mirtazapine 30–60 · risperidone 0.5–6 · lamotrigine 50–500 mg/d · <mark>prazosin (ฝันร้าย เหมาะกับ combat-related PTSD)</mark></li>
  <li><b>Treatment-resistant:</b> phenelzine</li>
</ul>
<h3>Special conditions</h3>
<ul>
  <li><b>Pregnancy:</b> ชั่ง risk-benefit · SSRIs, TCAs ค่อนข้างปลอดภัย · <b>เลี่ยง paroxetine</b> (cardiac malformations) · เลี่ยง BZD ถ้าเป็นไปได้ (ค่อนข้างปลอดภัย: diazepam, chlordiazepoxide · เลี่ยง alprazolam)</li>
  <li><b>Breastfeeding:</b> แนะนำ sertraline, paroxetine, nortriptyline · เลี่ยง BZD และ fluoxetine</li>
  <li><b>Children & adolescents:</b> first-line psychological therapy · ไม่ตอบสนองใช้ SSRIs · เฝ้าระวัง activation syndrome และความคิด/พฤติกรรมฆ่าตัวตาย</li>
  <li><b>Elderly:</b> start low, go slow · ระวัง anticholinergic, EPS, orthostatic hypotension, QT · BZD เสี่ยง paradoxical reaction · มีข้อมูลสนับสนุน: venlafaxine (GAD), citalopram (&gt; 60 ปี)</li>
</ul>` },
    { id: 'dep', t: 'Depression: นิยามและการวินิจฉัย', html: `<p><b>Depression:</b> ความผิดปกติทางอารมณ์ที่เศร้านานและสูญเสียความสนใจในสิ่งที่เคยชอบ · <b>Major depressive disorder (MDD)</b> กระทบความรู้สึก ความคิด พฤติกรรม ร่างกาย ใช้ชีวิตลำบาก บางครั้งรู้สึกว่าชีวิตไม่มีค่าพอจะอยู่ต่อ</p>
<h3>Pathology</h3>
<ul>
  <li>Monoamine hypothesis: NE, 5-HT, DA ลดลง</li>
  <li>Inflammatory hypothesis: ความเครียดเรื้อรังยับยั้ง BDNF ทำให้สารสื่อประสาทลดลง</li>
  <li>Postsynaptic receptor sensitivity, dysregulation hypothesis</li>
</ul>
<h3>อาการ 4 กลุ่ม</h3>
<ul>
  <li><b>Emotional:</b> เศร้า สิ้นหวัง วิตกกังวล รู้สึกผิด คิดฆ่าตัวตาย</li>
  <li><b>Physical:</b> น้ำหนักลด/เพิ่ม อ่อนเพลีย ปวดศีรษะ นอนไม่หลับ/นอนมาก ปัญหา GI</li>
  <li><b>Cognitive:</b> สมาธิลด ความจำไม่ดี สับสน ตัดสินใจยาก</li>
  <li><b>Psychomotor:</b> พูด/เคลื่อนไหวช้า หรือกระสับกระส่าย</li>
</ul>
<p><b>Risk factors:</b> genetics ~40% · psychosocial ~60% (วัฒนธรรม เศรษฐกิจ ความผิดหวัง ความสัมพันธ์) · biology (5-HT, NE, DA, โรคประจำตัว)</p>
<h3>DSM-5</h3>
<p>อาการ <b>≥ 5 ใน 9 ข้อ นาน ≥ 2 สัปดาห์</b> โดยต้องมี "อารมณ์เศร้า" หรือ "สูญเสียความสนใจ" อย่างน้อย 1 ข้อ เกือบทั้งวันแทบทุกวัน</p>
<ol>
  <li>อารมณ์เศร้า</li>
  <li>ความสนใจในกิจกรรมลดลงมาก</li>
  <li>น้ำหนักลด/เพิ่ม &gt; 5% ใน 1 เดือน หรือเบื่ออาหาร/อยากอาหารผิดปกติ</li>
  <li>นอนไม่หลับหรือนอนมาก</li>
  <li>กระสับกระส่ายหรือเคลื่อนไหวช้า (ผู้อื่นสังเกตเห็นได้)</li>
  <li>อ่อนเพลีย</li>
  <li>รู้สึกไร้ค่า/รู้สึกผิดรุนแรง</li>
  <li>สมาธิ การคิด การตัดสินใจแย่ลง</li>
  <li>คิดเรื่องความตายบ่อย ๆ</li>
</ol>
<p><b>คัดกรอง:</b> 2Q และ 9Q (PHQ-9) ประเมินความรุนแรง</p>` },
    { id: 'dep-tx', t: 'Depression: การรักษา', html: `<p>เป้าหมาย: ให้อาการสงบและป้องกันการกลับเป็นซ้ำ</p>
<div class="tbl"><table>
  <tr><th>กลุ่ม</th><th>ยา (mg/day)</th></tr>
  <tr><td><b>SSRIs</b> ยับยั้งการดูดกลับ 5-HT</td><td>Fluoxetine 20–60 · sertraline 50–200 · escitalopram 10–30 · citalopram 20–60 · paroxetine 20–60 · fluvoxamine 100–300</td></tr>
  <tr><td><b>SNRIs</b> ยับยั้งการดูดกลับ 5-HT, NE</td><td>Venlafaxine 75–375 · duloxetine 40–120 · desvenlafaxine 50–200</td></tr>
  <tr><td><b>TCAs</b> ยับยั้งการดูดกลับ NE, 5-HT + ผลต่อ ACh, histamine, α1</td><td>Amitriptyline 150–300 · imipramine 150–300 · nortriptyline 50–150 · clomipramine 100–250</td></tr>
  <tr><td><b>Others</b></td><td>Mirtazapine 15–45 (ต้าน α2 เพิ่ม NE, 5-HT) · bupropion 200–450 (ยับยั้งการดูดกลับ NE, DA) · trazodone 150–300</td></tr>
</table></div>
${fig('p10-1', 'Algorithm การรักษา major depressive disorder (CPG สมาคมจิตแพทย์แห่งประเทศไทย): ประเมิน 9Q ที่สัปดาห์ 2, 4, 8 · response = 9Q ลด ≥ 50% หรือ < 7')}
<p><b>Non-pharmacotherapy:</b> จิตบำบัด · ECT · rTMS · phototherapy · ออกกำลังกาย</p>
<h3>ผลข้างเคียงที่พบบ่อยและการจัดการ</h3>
<div class="tbl"><table>
  <tr><th>ADR</th><th>ยา</th><th>การจัดการ</th></tr>
  <tr><td>GI</td><td>SSRIs, TCAs</td><td>Start low go slow · ร่างกายปรับตัวได้เองใน 2–4 สัปดาห์</td></tr>
  <tr><td>Anticholinergic</td><td>TCAs</td><td>ปากแห้ง จิบน้ำบ่อย ๆ · ท้องผูก กินอาหารกากใย · ระวังในผู้สูงอายุ CVD arrhythmia</td></tr>
  <tr><td>ปัญหาการนอน</td><td>SSRIs, SNRIs</td><td>กินยาตอนเช้า หรือใช้ยาช่วยนอน เช่น low-dose trazodone, mirtazapine 15 mg</td></tr>
  <tr><td>Postural hypotension</td><td>TCAs (โดยเฉพาะ amitriptyline), SSRIs (ผู้สูงอายุ), trazodone</td><td>เปลี่ยนท่าช้า ๆ ดื่มน้ำมากขึ้น งดแอลกอฮอล์</td></tr>
  <tr><td>น้ำหนักเพิ่ม</td><td>TCAs, mirtazapine</td><td>คุมอาหาร ออกกำลังกาย ปรึกษาแพทย์เปลี่ยนยา</td></tr>
  <tr><td>Sexual dysfunction</td><td>SSRIs, SNRIs</td><td>มักทนได้ใน 4–6 เดือน · ลดขนาดในผู้ที่คุมอาการได้ หรือเปลี่ยน/เพิ่ม bupropion, mirtazapine · รักษาตามอาการด้วย PDE5 inhibitor</td></tr>
  <tr><td>Bleeding</td><td>SSRIs</td><td>ระวังช่วง 30 วันแรก · ลดขนาด เปลี่ยนกลุ่ม หรือใช้ PPI</td></tr>
  <tr><td>ผลต่อหัวใจ</td><td>SNRIs, TCAs ขนาดสูง</td><td>ติดตาม HR, BP ใกล้ชิดช่วง 3 เดือนแรก</td></tr>
  <tr><td><b>Serotonin syndrome</b></td><td>Mild: SSRI + lithium · moderate: SSRI overdose หรือ SSRI + serotonergic drugs · <mark>severe: SSRI + MAOI</mark></td><td>อันตรายถึงชีวิต · สับสน กระสับกระส่าย กล้ามเนื้อแข็งเกร็ง ให้รีบพบแพทย์ทันที</td></tr>
</table></div>
<p style="font-size:.9em">ต้นฉบับเขียนว่า "postural hypertension" แต่ผลข้างเคียงนี้คือความดันตกเมื่อเปลี่ยนท่า (postural hypotension) จึงแก้ข้อความ</p>` },
  ],
  questions: [
    { q: 'ผู้ป่วยหญิงอายุ 32 ปี วิตกกังวลหลายเรื่องในชีวิตประจำวัน ควบคุมความกังวลไม่ได้ ร่วมกับกล้ามเนื้อตึงเครียด นอนไม่หลับ หงุดหงิดง่าย เป็นต่อเนื่อง 8 เดือน ยาใดเหมาะสมที่สุดเป็นอันดับแรก', o: ['Alprazolam', 'Escitalopram', 'Phenelzine', 'Prazosin', 'Haloperidol'], a: 1, e: 'เข้าเกณฑ์ GAD (กังวลควบคุมไม่ได้ + อาการร่วม ≥ 3 ข้อ นาน ≥ 6 เดือน) · first-line คือ SSRI/SNRI เช่น escitalopram (DI น้อย)' },
    { q: 'ผู้ป่วยชายอายุ 45 ปี มีอาการใจสั่น เหงื่อออก หายใจไม่อิ่ม เจ็บหน้าอก และกลัวตาย เกิดกะทันหันและรุนแรง เป็นซ้ำหลายครั้งในเดือนที่ผ่านมา เริ่มหลีกเลี่ยงการออกนอกบ้านเพราะกลัวเกิดซ้ำ ยาใดมี half-life สั้นและเหมาะสำหรับควบคุมอาการเฉียบพลัน', o: ['Propranolol', 'Alprazolam', 'Clonazepam', 'Prazosin', 'Clomipramine'], a: 1, e: 'Panic disorder · alprazolam เป็น benzodiazepine t½ สั้น เหมาะกับ breakthrough panic (clonazepam t½ ยาว)' },
    { q: 'หญิงตั้งครรภ์อายุ 28 ปี มี panic attack เป็นระยะ แพทย์พิจารณาให้ยากลุ่ม SSRI ข้อใดถูกต้องเกี่ยวกับการเลือกใช้ยา', o: ['ควรเลือกยาตัวหนึ่งในกลุ่มนี้เพราะปลอดภัยที่สุด แม้มีรายงานความเสี่ยงต่อ cardiac malformations', 'ควรหลีกเลี่ยงยาที่มีรายงานความเสี่ยงต่อ cardiac malformations', 'Benzodiazepines ปลอดภัยที่สุดและควรใช้เป็นอันดับแรกในหญิงตั้งครรภ์', 'Alprazolam เป็น benzodiazepine ที่ควรเลือกใช้มากที่สุด', 'ไม่จำเป็นต้องชั่ง risk-benefit ก่อนใช้ยา'], a: 1, e: 'ควรเลี่ยง paroxetine ซึ่งมีรายงานความเสี่ยง cardiac malformations · SSRIs อื่นค่อนข้างปลอดภัย · ควรเลี่ยง BZD โดยเฉพาะ alprazolam และต้องชั่ง risk-benefit เสมอ' },
    { q: 'ผู้ป่วยมีความคิดซ้ำ ๆ รบกวนจิตใจ ร่วมกับพฤติกรรมที่ต้องทำซ้ำเพื่อลดความกังวล ใช้เวลามากกว่า 1 ชั่วโมงต่อวันและกระทบชีวิตมาก แพทย์รักษาด้วย SSRI ร่วมกับ CBT แต่ไม่ตอบสนองต่อ SSRIs 2 ชนิด ขั้นตอนถัดไปที่เหมาะสมที่สุดคือข้อใด', o: ['เปลี่ยนไปใช้ benzodiazepines ระยะยาวแทน', 'หยุดยาทั้งหมดและใช้ CBT เพียงอย่างเดียว', 'พิจารณาใช้ clomipramine', 'เพิ่ม propranolol ก่อนสถานการณ์ที่กระตุ้นอาการ', 'ใช้ prazosin เพื่อลดฝันร้าย'], a: 2, e: 'OCD ที่ไม่ตอบสนองต่อ SSRIs ≥ 2 ชนิด ใช้ clomipramine (second-line)' },
    { q: 'ทหารผ่านศึกอายุ 50 ปี เคยเผชิญเหตุการณ์รุนแรงในสนามรบ ปัจจุบันฝันร้ายรบกวนการนอน หวนคิดถึงเหตุการณ์ซ้ำ ๆ หลีกเลี่ยงสิ่งกระตุ้น ตื่นตัวง่ายผิดปกติ นานกว่า 1 เดือน ยาใดเหมาะสมที่สุดสำหรับรักษาอาการฝันร้ายที่เป็นปัญหาหลัก', o: ['Fluoxetine', 'Sertraline', 'Prazosin', 'Lamotrigine', 'Mirtazapine'], a: 2, e: 'PTSD ที่ฝันร้ายเป็นปัญหาหลัก โดยเฉพาะ combat-related ใช้ prazosin' },
    { q: 'หญิงอายุ 26 ปี เศร้า ร้องไห้ง่าย ไม่สนใจงานอดิเรกที่เคยชอบ นอนไม่หลับ เบื่ออาหาร น้ำหนักลด 4 กก. ใน 1 เดือน รู้สึกไร้ค่า สมาธิลดลง เป็นมา 3 สัปดาห์ ไม่มีประวัติใช้สารเสพติด การรักษาเริ่มต้นที่เหมาะสมที่สุดคือข้อใด', o: ['Fluoxetine 20 mg/day', 'Amitriptyline 150 mg/day', 'Lorazepam 2 mg/day', 'Haloperidol 5 mg/day', 'Lithium 600 mg/day'], a: 0, e: 'เข้าเกณฑ์ MDD (≥ 5 อาการ นาน ≥ 2 สัปดาห์) · เริ่ม SSRI เช่น fluoxetine 20 mg/day ตาม algorithm · amitriptyline ไม่ควรเริ่มที่ 150 mg' },
    { q: 'ชายอายุ 38 ปี เป็น MDD แพทย์เริ่ม sertraline 50 mg/day ผ่านไป 5 วัน ผู้ป่วยบ่นว่าคลื่นไส้และถ่ายเหลวเล็กน้อย เภสัชกรควรแนะนำอย่างไร', o: ['หยุดยาและเปลี่ยนเป็น TCA', 'เพิ่มขนาดยาเป็น 100 mg/day', 'อธิบายว่าอาการมักดีขึ้นเองภายใน 2–4 สัปดาห์ และให้รับประทานยาต่อ', 'เปลี่ยนเป็น MAOI', 'เพิ่ม metoclopramide ทันที'], a: 2, e: 'ผลข้างเคียงทาง GI ของ SSRIs มักดีขึ้นเองใน 2–4 สัปดาห์ ให้ใช้ยาต่อ' },
    { q: 'หญิงอายุ 68 ปี มีอาการเศร้า เบื่ออาหาร นอนไม่หลับ ไม่สนใจสิ่งรอบตัวมา 1 เดือน มีโรคประจำตัวคือ BPH และท้องผูกเรื้อรัง หากต้องเริ่มยาต้านซึมเศร้า ควรหลีกเลี่ยงยาใดมากที่สุด', o: ['Fluoxetine', 'Sertraline', 'Escitalopram', 'Duloxetine', 'Amitriptyline'], a: 4, e: 'Amitriptyline (TCA) มีฤทธิ์ anticholinergic สูง ทำให้ปัสสาวะคั่ง (BPH) และท้องผูกแย่ลง' },
    { q: 'ชายอายุ 30 ปี เริ่มรับประทาน fluoxetine ได้ 2 สัปดาห์ ต่อมาแพทย์อีกแห่งสั่ง phenelzine เพิ่มโดยไม่ได้หยุดยาเดิม หลังรับประทานร่วมกัน ผู้ป่วยมีไข้สูง สับสน กระสับกระส่าย กล้ามเนื้อเกร็ง และ hyperreflexia สาเหตุที่เป็นไปได้มากที่สุดคือข้อใด', o: ['Neuroleptic malignant syndrome', 'Serotonin syndrome', 'Anticholinergic toxicity', 'Acute dystonia', 'Hypertensive urgency'], a: 1, e: 'SSRI + MAOI ทำให้เกิด serotonin syndrome ชนิดรุนแรง (ไข้ สับสน กล้ามเนื้อเกร็ง hyperreflexia)' },
    { q: 'หญิงอายุ 29 ปี มีอาการเศร้า เบื่ออาหาร นอนไม่หลับ รู้สึกไร้ค่า สมาธิลดลง ไม่สนใจสิ่งที่เคยชอบมา 10 วัน ข้อใดถูกต้องที่สุด', o: ['เข้าเกณฑ์วินิจฉัย MDD แล้ว', 'ยังไม่เข้าเกณฑ์ MDD เพราะอาการยังไม่ครบ 2 สัปดาห์', 'ต้องมีความคิดฆ่าตัวตายจึงวินิจฉัยได้', 'ต้องมี psychotic symptoms จึงวินิจฉัยได้', 'ต้องเริ่มยาต้านซึมเศร้าทันทีโดยไม่ต้องประเมินเพิ่มเติม'], a: 1, e: 'DSM-5 ต้องมีอาการ ≥ 5 ใน 9 ข้อ ต่อเนื่องอย่างน้อย 2 สัปดาห์' },
  ],
}
