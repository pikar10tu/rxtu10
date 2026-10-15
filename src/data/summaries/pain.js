// Pain management — converted from the RxTU10 class summary PDF (see content/summaries/manifest.json)
// PDF text layer แมปตัวเลขเป็นสัญลักษณ์ → ตัวเลขทุกตัวตรวจกับภาพหน้าแล้ว
export default {
  id: 'pain',
  date: '27/07/2026',
  refs: [
    'Raja SN, et al. The revised International Association for the Study of Pain definition of pain: concepts, challenges, and compromises. Pain. 2020;161(9):1976–82.',
    'Attal N, Bouhassira D. Mechanisms of pain in peripheral neuropathy. Acta Neurol Scand. 1999;173:12–24.',
    'World Health Organization. Cancer pain relief. 2nd ed. Geneva: WHO; 1996.',
    'World Health Organization. WHO guidelines for the pharmacological and radiotherapeutic management of cancer pain in adults and adolescents. Geneva: WHO; 2018.',
    'Gilron I, et al. Neuropathic pain: a practical guide for the clinician. CMAJ. 2006;175(3):265–75.',
    'FitzGerald GA, Patrono C. The coxibs, selective inhibitors of cyclooxygenase-2. N Engl J Med. 2001;345:433–42.',
    'Kowalski ML, et al. Classification and practical approach to the diagnosis and management of hypersensitivity to NSAIDs. Allergy. 2013;68:1221–32.',
    'Dowell D, et al. CDC Clinical Practice Guideline for Prescribing Opioids for Pain — United States, 2022. MMWR Recomm Rep. 2022;71(3):1–95.',
    'NICE. Osteoarthritis in over 16s: diagnosis and management [NG226]. 2022.',
    'Dahlhamer J, et al. Prevalence of chronic pain and high-impact chronic pain among adults — United States, 2016. MMWR. 2018;67(36):1001–6.',
    'International Association for the Study of Pain (IASP). High-impact chronic pain [fact sheet]. 2023.',
    'Jaturapullarp S. Pain [lecture]. PM 321. Faculty of Pharmacy, Thammasat University; 2024.',
  ],
  sections: [
    { id: 'type', t: 'ชนิดของความปวด', html: `<ol>
  <li><b>Acute pain</b> ปวดไม่เกิน 3 เดือน</li>
  <li><b>Chronic pain</b> ปวดตั้งแต่ 3 เดือนขึ้นไป</li>
</ol>
<p>แบ่งตามกลไก (mechanism-based)</p>
<div class="tbl"><table>
  <tr><th>ชนิด</th><th>ลักษณะ</th><th>กลไก</th><th>ตัวอย่าง</th></tr>
  <tr><td><b>Nociceptive – somatic</b></td><td>ปวดตื้อ ๆ (dull) ลึก ๆ ปวดมากขึ้นเมื่อขยับ บอกตำแหน่งได้ชัด</td><td>กระตุ้น nociceptor โดยตรงที่ผิวหนัง กล้ามเนื้อ กระดูก ข้อ</td><td>ปวดกล้ามเนื้อ ปวดกระดูก ข้อเสื่อม</td></tr>
  <tr><td><b>Nociceptive – visceral</b></td><td>ปวดเกร็ง (cramping) ปวดบิด (squeezing) คล้ายถูกแทะ</td><td>กระตุ้น nociceptor ที่อวัยวะภายใน มักบอกตำแหน่งไม่ชัด</td><td>ปวดประจำเดือน กระเพาะอักเสบ ไส้ติ่งอักเสบ กล้ามเนื้อหัวใจขาดเลือด</td></tr>
  <tr><td><b>Neuropathic</b></td><td>ปวดแสบร้อน ชา เข็มทิ่มตำ (tingling)</td><td>ความผิดปกติ/เสียหายของเส้นประสาทส่วนกลางหรือส่วนปลาย</td><td>Diabetic neuropathy, postherpetic neuralgia (PHN)</td></tr>
</table></div>
<h3>Risk factors</h3>
<ul>
  <li>อายุมากขึ้น และเพศหญิง</li>
  <li>เคยบาดเจ็บ/ผ่าตัด หรือมีโรคเรื้อรังทางกล้ามเนื้อและกระดูก (OA, low back pain)</li>
  <li>โรคที่ทำลายเส้นประสาท เช่น เบาหวาน งูสวัด มะเร็ง</li>
  <li>ปัจจัยจิตสังคม: เครียด ซึมเศร้า วิตกกังวล ขาดการสนับสนุนทางสังคม</li>
  <li>เศรษฐานะต่ำ เข้าถึงบริการสุขภาพจำกัด</li>
</ul>` },
    { id: 'assess', t: 'การประเมินความปวด', html: `<p>อาศัยการซักประวัติและตรวจร่างกายเป็นหลัก ตามแนวทาง <b>PQRSTU</b></p>
<ul>
  <li><b>P</b> – Precipitating/Palliative/Previous: ปัจจัยที่ทำให้ปวดมากขึ้น/ลดลง และวิธีที่เคยใช้บรรเทา</li>
  <li><b>Q</b> – Quality: ลักษณะ เช่น ปวดตื้อ แสบร้อน ปวดบิด</li>
  <li><b>R</b> – Region/Radiation: ตำแหน่งและการร้าว</li>
  <li><b>S</b> – Severity: ระดับความรุนแรง (0–10)</li>
  <li><b>T</b> – Temporal: ระยะเวลา ความถี่ ช่วงเวลา</li>
  <li><b>U</b> – yoU (impact): ผลกระทบต่ออารมณ์ การทำงาน ชีวิตประจำวัน</li>
</ul>
<h3>เครื่องมือประเมินความรุนแรง (3 กลุ่ม)</h3>
<ul>
  <li><b>Self-report:</b> Numeric Rating Scale (NRS 0–10) · Visual Analogue Scale (VAS) · Faces Pain Scale (เด็กหรือผู้ที่สื่อสารลำบาก)</li>
  <li><b>Behavioral measure:</b> FLACC scale (Face, Legs, Activity, Cry, Consolability) ในเด็กเล็กหรือผู้ที่สื่อสารไม่ได้ · คะแนนรวม &gt; 4 ควรพิจารณารักษา</li>
  <li><b>Physical measure:</b> การเปลี่ยนแปลงของ vital signs เช่น BP, HR, RR (อาจได้รับผลจากปัจจัยอื่น)</li>
</ul>
<div class="key"><strong class="k">Red flags → ส่งต่อแพทย์ทันที</strong>ชาหรืออ่อนแรง · ปวดศีรษะรุนแรงเฉียบพลัน · ปวดต่อเนื่อง &gt; 3 วันหรือแย่ลงแม้รักษาแล้ว · เจ็บหน้าอก · หายใจลำบาก · มีไข้ · คลื่นไส้อาเจียนหรือน้ำหนักลดโดยไม่ทราบสาเหตุ · สงสัยกระดูกหัก · ตั้งครรภ์</div>
<h3>Nociceptive pathway (5 ขั้นตอน)</h3>
<ol>
  <li><b>Transduction:</b> สิ่งเร้า (บาดเจ็บ ร้อน เย็น) กระตุ้น nociceptor อาจกระตุ้นระบบภูมิคุ้มกันด้วย · receptor ที่เกี่ยวข้องคือ TRPV1</li>
  <li><b>Conduction:</b> action potential เดินทางผ่าน A-delta (มี myelin นำเร็ว) และ C-fiber (ไม่มี myelin นำช้า)</li>
  <li><b>Transmission:</b> ส่งสัญญาณต่อบริเวณ axon โดยมี Na⁺ channel เกี่ยวข้อง (จึงเกี่ยวกับ neuropathic pain)</li>
  <li><b>Modulation:</b> ปรับสัญญาณที่ dorsal horn ทั้งจากวงจรยับยั้งในไขสันหลังและ descending modulation จากสมอง ผ่าน serotonin และ noradrenaline</li>
  <li><b>Perception:</b> การรับรู้ที่สมอง · ascending input ส่งสัญญาณไป thalamus · descending modulation ช่วยบรรเทาปวด</li>
</ol>` },
    { id: 'drugs', t: 'เภสัชวิทยาของยาที่ใช้บ่อย', html: `<h3>Acetaminophen (paracetamol)</h3>
<ul>
  <li>MOA: ยับยั้ง COX-2 และ/หรือ COX-3 ในระบบประสาทส่วนกลางเป็นหลัก ระงับปวดและลดไข้ แต่ต้านการอักเสบน้อยมาก</li>
  <li>Bioavailability ทางปาก 60–90% · Tmax 15–30 นาที</li>
  <li>Metabolism ผ่านตับ · เกิน 4 g/วัน เพิ่มความเสี่ยง hepatotoxicity โดยเฉพาะผู้ป่วยโรคตับหรือดื่มแอลกอฮอล์ประจำ</li>
  <li>Antidote: <b>N-acetylcysteine (NAC)</b></li>
</ul>
<h3>NSAIDs และ selective COX-2 inhibitors</h3>
<ul>
  <li>MOA: ยับยั้ง COX-1/COX-2 → ลด prostaglandin ซึ่งก่อการอักเสบและเพิ่มความไวของ nociceptor · แต่ละตัวมีสัดส่วน COX-1:COX-2 ต่างกัน · ตัวที่จำเพาะ COX-2 (celecoxib, etoricoxib) มีผลต่อทางเดินอาหารน้อยกว่า</li>
  <li>มี <b>analgesic ceiling effect</b> เพิ่มขนาดเกินระดับหนึ่งฤทธิ์ระงับปวดไม่เพิ่ม</li>
  <li>เหมาะกับปวดที่มีการอักเสบร่วม เช่น ปวดกระดูกและข้อ (nociceptive) แต่ไม่ได้ผลดีใน neuropathic pain</li>
  <li>Side effects
    <ul>
      <li>ระคายเคืองทางเดินอาหาร (selective COX-2 ช่วยลดความเสี่ยง)</li>
      <li>เพิ่มความเสี่ยง CV event (selective COX-2 เสี่ยงมากกว่า NSAIDs ทั่วไป · <mark>naproxen เสี่ยงต่ำสุด</mark>)</li>
      <li>ความดันสูง หัวใจล้มเหลว ไตวาย</li>
      <li>แพ้ยา: true allergy สัมพันธ์กับโครงสร้าง · pseudoallergy เกิดจากการยับยั้ง COX-1 จึง cross-react ข้ามกลุ่มที่โครงสร้างต่างกันได้</li>
    </ul>
  </li>
  <li>ใช้ร่วมกับ aspirin (antiplatelet): ให้ <b>aspirin ก่อน ibuprofen อย่างน้อย 2 ชั่วโมง</b> เพื่อไม่ให้ ibuprofen แย่งจับ COX-1 ของเกล็ดเลือดที่ aspirin จับแบบ irreversible</li>
</ul>
<h3>Opioids</h3>
<p>MOA: จับ opioid receptor (mu, kappa, delta) → เปิด K⁺ channel และยับยั้ง voltage-gated Ca²⁺ channel → ลดการหลั่งสารสื่อประสาทที่นำสัญญาณปวด</p>
<div class="tbl"><table>
  <tr><th>ยา</th><th>ประเด็นสำคัญ</th></tr>
  <tr><td><b>Morphine</b></td><td>Oral bioavailability ~25% (first-pass สูง) · metabolite M6G (ระงับปวดและกดการหายใจ) และ M3G (ไม่ระงับปวด แต่เป็นพิษต่อระบบประสาท) · ขับทางไตเป็นหลัก t½ 2–4 ชม.</td></tr>
  <tr><td><b>Fentanyl</b></td><td>ละลายในไขมันสูง เหมาะกับ transdermal patch · ผ่าน CYP3A4 · patch onset ช้า (steady state 72 ชม.) ไม่ควรใช้เป็นยาเริ่มต้นในการปรับขนาด</td></tr>
  <tr><td><b>Codeine</b></td><td>Prodrug ต้องผ่าน CYP2D6 เป็น morphine (5–15% ของขนาดยา) → ตอบสนองไม่แน่นอนตาม CYP2D6 · ระวังยาที่ยับยั้ง CYP2D6</td></tr>
  <tr><td><b>Tramadol</b></td><td>Weak mu agonist + ยับยั้ง reuptake ของ serotonin/norepinephrine (ใช้ใน neuropathic pain ได้) · ผ่าน CYP2D6 ได้ active metabolite · ระวังชักและ serotonin syndrome เมื่อใช้ร่วม SSRIs, SNRIs, TCA, MAOIs · สูงสุด 400 mg/วัน (300 mg/วัน ผู้สูงอายุ · 200 mg/วัน ไตบกพร่อง)</td></tr>
  <tr><td><b>Methadone</b></td><td>Mu agonist + NMDA antagonist · t½ ยาว ใช้บำบัดผู้ติด opioid (อาการถอนไม่รุนแรงเท่า morphine) · ADR: dose-dependent QT prolongation</td></tr>
  <tr><td><b>Pethidine (meperidine)</b></td><td>Metabolite normeperidine สะสมในไตบกพร่องหรือใช้ซ้ำต่อเนื่อง เพิ่มความเสี่ยงชัก · ไม่นิยมใช้ต่อเนื่องแล้ว</td></tr>
  <tr><td><b>Naloxone</b></td><td>Pure opioid antagonist แก้กดการหายใจจาก opioid overdose · ให้ IV (first-pass สูงมาก) · t½ ~1 ชม. อาจต้องให้ซ้ำ</td></tr>
</table></div>` },
    { id: 'convert', t: 'Breakthrough pain และ dose conversion', html: `<p><b>Breakthrough pain:</b> ยาระงับปวดสำหรับคุมอาการปวดที่เกิดระหว่างวัน ให้ <mark>10–20% ของ total daily opioid dose</mark></p>
<p>เมื่อเปลี่ยนเป็น fentanyl patch ต้องมียา breakthrough เตรียมไว้เสมอ เพราะ patch onset ช้า (steady state 72 ชม.)</p>
<h3>Equianalgesic dose</h3>
<div class="tbl"><table>
  <tr><th>Opioid</th><th>Parenteral</th><th>Oral</th><th>Duration</th></tr>
  <tr><td>Morphine</td><td class="num">10 mg</td><td class="num">30 mg</td><td>3–4 h</td></tr>
  <tr><td>Fentanyl</td><td class="num">0.1 mg</td><td>–</td><td>2–3 h</td></tr>
  <tr><td>Oxycodone</td><td>–</td><td class="num">15–20 mg</td><td>3–5 h</td></tr>
</table></div>
<p>10 mg IV morphine = 100 mcg IV fentanyl (หรือ 250 mcg IV fentanyl ในผู้ที่ได้ fentanyl ต่อเนื่องเรื้อรัง)</p>
<h3>วิธีเปลี่ยนชนิด opioid</h3>
<ol>
  <li>คำนวณ opioid ทั้งหมดที่ได้ใน 24 ชม.</li>
  <li>ถ้าคุมปวดได้ดีอยู่แล้ว ลดขนาดลง 25–50% ชดเชย incomplete cross-tolerance</li>
  <li>เตรียมยา breakthrough 10–20% ของ total daily dose</li>
</ol>
<h3>Fentanyl patch ↔ 24-hour oral morphine</h3>
<div class="tbl"><table>
  <tr><th>Fentanyl patch (mcg/h)</th><th>Oral morphine (mg/24 h)</th></tr>
  <tr><td class="num">12</td><td>30–60</td></tr>
  <tr><td class="num">25</td><td>60–90</td></tr>
  <tr><td class="num">37</td><td>90–120</td></tr>
  <tr><td class="num">50</td><td>120–180</td></tr>
  <tr><td class="num">62</td><td>180–240</td></tr>
  <tr><td class="num">75</td><td>240–300</td></tr>
  <tr><td class="num">87</td><td>300–360</td></tr>
  <tr><td class="num">100</td><td>360</td></tr>
</table></div>` },
    { id: 'ade', t: 'การจัดการ ADR ของ opioid และยาเสริม', html: `<h3>ADR ของ opioid</h3>
<ul>
  <li><b>ท้องผูก:</b> ยาระบายกระตุ้นการบีบตัว (senna) ร่วมกับปรับพฤติกรรม (ดื่มน้ำ ใยอาหาร ออกกำลังกาย)</li>
  <li><b>คลื่นไส้อาเจียน:</b> dopamine antagonist (metoclopramide, prochlorperazine) หรือ ondansetron · มักดีขึ้นเองใน 1 สัปดาห์</li>
  <li><b>คัน:</b> antihistamine เช่น cetirizine, hydroxyzine</li>
  <li><b>กดการหายใจ/ง่วงซึม:</b> ประเมิน sedation score และ RR · RR &lt; 8 ครั้ง/นาที หรือปลุกตื่นยาก → ให้ออกซิเจน เตรียม naloxone</li>
</ul>
<h3>Adjuvant analgesics</h3>
<ul>
  <li><b>Antidepressants</b> (TCA, SNRIs เช่น duloxetine, venlafaxine): ปรับ serotonin/norepinephrine ใน descending modulation · ใช้ใน neuropathic pain</li>
  <li><b>Anticonvulsants</b> (gabapentinoids): ลดการปลดปล่อยสารสื่อประสาทกระตุ้นที่ voltage-gated Ca²⁺ channel · ใช้ใน neuropathic pain</li>
  <li><b>Skeletal muscle relaxants</b> (baclofen, orphenadrine, tolperisone/eperisone): ผ่าน GABA receptor หรือยับยั้งการนำสัญญาณที่กล้ามเนื้อ · ปวดจากกล้ามเนื้อหดเกร็ง</li>
  <li><b>Local anesthetics</b> (lidocaine, bupivacaine): ยับยั้ง Na⁺ channel ที่เส้นประสาทส่วนปลาย · ทาหรือฉีดเฉพาะที่</li>
</ul>
<h3>Herbs and supplements</h3>
<ul>
  <li><b>Capsaicin</b> ทาเฉพาะที่ ผ่าน TRPV1 ทำให้ปลายประสาท desensitize · มีหลักฐานใน OA เข่า · อาจแสบร้อนบริเวณที่ทา</li>
  <li><b>Glucosamine/chondroitin</b> นิยมใช้ใน OA แต่ยังไม่แนะนำเป็นประจำ (หลักฐานจำกัด)</li>
</ul>` },
    { id: 'tx', t: 'แนวทางการรักษา', html: `<h3>WHO analgesic ladder</h3>
<div class="tbl"><table>
  <tr><th>ระดับปวด</th><th>ยา</th></tr>
  <tr><td>Mild (1–3)</td><td>Non-opioid (acetaminophen, NSAIDs, selective COX-2 inhibitor)</td></tr>
  <tr><td>Moderate (4–6)</td><td>เพิ่ม weak opioid (tramadol, codeine) ร่วมกับ non-opioid</td></tr>
  <tr><td>Severe (7–10)</td><td>Strong opioid (morphine, fentanyl) ร่วมกับ non-opioid หรือ adjuvant</td></tr>
</table></div>
<p>ให้ adjuvant ได้ทุกระดับ โดยเฉพาะเมื่อมีองค์ประกอบ neuropathic pain</p>
<div class="key"><strong class="k">CDC 2022</strong>ใช้ non-opioid และการรักษาไม่ใช้ยาเป็นทางเลือกแรก · ถ้าจำเป็นต้องใช้ opioid ให้เริ่มขนาดต่ำที่สุดที่ได้ผล และสั้นที่สุดเท่าที่เป็นไปได้</div>
<h3>Non-pharmacotherapy</h3>
<ul>
  <li>ปรับพฤติกรรม หลีกเลี่ยงปัจจัยกระตุ้นความปวด</li>
  <li>กายภาพบำบัดและออกกำลังกาย · CBT · ฝังเข็ม · โยคะ · ไทเก๊ก · นวด</li>
  <li>Electroanalgesia เช่น TENS</li>
  <li>Multidisciplinary rehabilitation</li>
</ul>` },
  ],
  questions: [
    { q: 'ผู้ป่วยหญิงอายุ 45 ปี มาด้วยอาการปวดแสบร้อนที่ปลายเท้าทั้งสองข้าง ร่วมกับรู้สึกชาและเหมือนมีเข็มทิ่มตำ เป็นเบาหวานมา 10 ปี ลักษณะความปวดของผู้ป่วยรายนี้จัดเป็นชนิดใด', o: ['Nociceptive somatic pain', 'Nociceptive visceral pain', 'Neuropathic pain', 'Psychogenic pain'], a: 2, e: 'ปวดแสบร้อน ชา เข็มทิ่มตำ (burning, numbness, tingling) เป็นลักษณะของ neuropathic pain จากความเสียหายของเส้นประสาทส่วนปลาย พบบ่อยใน diabetic neuropathy · ต่างจาก nociceptive ที่ปวดตื้อ เกร็ง หรือบิด และ neuropathic pain มักตอบสนองต่อ opioid ไม่ดีเท่า' },
    { q: 'ผู้ป่วยได้รับ IV morphine 30 mg/day หากแพทย์ต้องการเปลี่ยนเป็น sustained-release oral morphine ขนาดที่เหมาะสมที่สุดคือข้อใด', o: ['30 mg/day', '40 mg/day', '60 mg/day', '90 mg/day'], a: 3, e: 'IV → oral morphine คูณ 3 (10 mg parenteral ≈ 30 mg oral) · อย่าลืมให้ immediate-release สำหรับ breakthrough pain 10–20% ของ total daily dose' },
    { q: 'ผู้ป่วยได้รับ morphine เกินขนาดจนเกิดพิษ มีรูม่านตาหดเล็ก (pinpoint pupils) หายใจช้า ซึมลง ยาต้านพิษที่ควรให้คือข้อใด', o: ['Naloxone', 'N-acetylcysteine', 'Flumazenil', 'Activated charcoal เพียงอย่างเดียวโดยไม่ต้องให้ยาต้านพิษ'], a: 0, e: 'Naloxone เป็นยาต้านพิษจำเพาะของ opioids' },
    { q: 'ผู้ป่วยโรคหลอดเลือดหัวใจ (coronary artery disease) ต้องการยาแก้ปวดกลุ่ม NSAIDs ยาชนิดใดมีความเสี่ยงต่อ cardiovascular event ต่ำที่สุดเมื่อเทียบกับตัวอื่นในกลุ่ม', o: ['Celecoxib', 'Etoricoxib', 'Naproxen', 'Rofecoxib'], a: 2, e: 'Selective COX-2 inhibitors (celecoxib, etoricoxib, rofecoxib) เสี่ยง CV event สูงกว่า nonselective NSAIDs · naproxen มีข้อมูลว่าเสี่ยงต่ำกว่าตัวอื่น จึงมักเลือกในผู้ป่วยโรคหัวใจที่จำเป็นต้องใช้ NSAIDs' },
    { q: 'ผู้ป่วยได้รับ sustained-release oral morphine 30 mg ทุก 12 ชั่วโมง (รวม 60 mg/วัน) แพทย์ต้องการเปลี่ยนเป็น transdermal fentanyl patch (มีขนาด 12, 25, 50, 75, 100 mcg/h) ขนาดที่เหมาะสมที่สุดคือข้อใด', o: ['12 mcg/h', '25 mcg/h', '50 mcg/h', '75 mcg/h'], a: 1, e: 'ตามตารางแปลง oral morphine 60–90 mg/วัน ≈ fentanyl patch 25 mcg/h (ตารางนี้เผื่อ incomplete cross-tolerance ไว้แล้ว) · ต้องมี breakthrough medication (เช่น IR morphine) สำรองระหว่างรอ patch ถึง steady state ที่ 72 ชม. · หมายเหตุผู้แปลง: คำอธิบายในต้นฉบับแปลง 60 mg เป็น "600 mcg/day" แล้วได้ 12 mcg/h ซึ่งขัดกับเฉลย (25 mcg/h) และหน่วยผิด (60 mg = 60,000 mcg) จึงเขียนคำอธิบายใหม่ตามตาราง' },
  ],
}
