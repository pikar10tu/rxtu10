// Systemic lupus erythematosus — converted from the RxTU10 class summary PDF (see content/summaries/manifest.json)
export default {
  id: 'sle',
  date: '21/07/2026',
  refs: [
    'Fanouriakis A, et al. EULAR recommendations for the management of systemic lupus erythematosus: 2023 update. Ann Rheum Dis. 2024;83(1):15-29. Available from: https://ard.bmj.com/content/annrheumdis/83/1/15.full.pdf',
  ],
  sections: [
    { id: 'def', t: 'นิยาม สาเหตุ และอาการ', html: `<p><b>SLE</b> เป็น systemic autoimmune disease พบในหญิงมากกว่าชาย</p>
<h3>Etiology &amp; risk factors</h3>
<ol>
  <li><b>Genetic:</b> ญาติสายตรง (1st degree) เสี่ยงเพิ่ม 20 เท่า · หลายยีน</li>
  <li><b>Environment:</b> สูบบุหรี่, UV light</li>
  <li><b>Hormone:</b> estrogen, progesterone → อุบัติการณ์สูงในผู้หญิง</li>
</ol>
<h3>Pathophysiology</h3>
<p>พันธุกรรม + สิ่งแวดล้อม → B/T cell สูญเสีย self-tolerance → สร้าง autoantibody (anti-dsDNA, anti-Sm) → จับ self antigen เป็น immune complex → ตกค้างที่ไต ผิวหนัง ข้อต่อ → อักเสบ → หลั่ง cytokine (IFN-α, TNF-α) → อักเสบเรื้อรัง</p>
<h3>อาการเด่น</h3>
<ol>
  <li>Constitutional: ไข้ต่ำ อ่อนเพลีย น้ำหนักลด</li>
  <li>Mucocutaneous: <mark>malar rash</mark>, discoid rash, photosensitivity</li>
  <li>แผลในปากและจมูก</li>
  <li>Raynaud's phenomenon: หลอดเลือดส่วนปลายตีบ → ปลายนิ้วมือเท้าซีด</li>
  <li>ไต: lupus nephritis</li>
  <li>Neurologic: ชัก, psychosis</li>
  <li>Cardio-pulmonary: pericarditis, myocarditis, pleuritis, pneumonitis</li>
  <li>Arthritis</li>
</ol>
<div class="key"><strong class="k">ช่วยจำ SOAP BRAIN MD</strong><b>S</b>erositis · <b>O</b>ral ulcers · <b>A</b>rthritis · <b>P</b>hotosensitivity · <b>B</b>lood (cytopenias) · <b>R</b>enal · <b>A</b>NA positive · <b>I</b>mmunologic (anti-dsDNA, anti-Sm, aPL) · <b>N</b>eurologic (ชัก/psychosis) · <b>M</b>alar rash · <b>D</b>iscoid rash</div>` },
    { id: 'dx', t: 'การวินิจฉัย', html: `<figure><img data-fig="sle/p02-1.webp" alt="EULAR/ACR 2019 SLE classification criteria: entry criterion ANA ≥ 1:80 แล้วรวมคะแนน clinical 7 domains และ immunology 3 domains คะแนนรวม ≥ 10 จัดเป็น SLE"><figcaption>EULAR/ACR 2019 SLE classification criteria — ANA ≥ 1:80 แล้วรวมคะแนน clinical 7 domains + immunology 3 domains · รวม ≥ 10 = SLE (นับคะแนนสูงสุดใน domain เดียวกัน · ตัดสาเหตุอื่น · อาการไม่ต้องเกิดพร้อมกัน)</figcaption></figure>
<div class="tbl"><table>
  <tr><th>Lab</th><th>ความหมาย</th></tr>
  <tr><td><b>ANA</b></td><td>Screening test (<b>sensitive สูง</b> แต่ไม่ specific)</td></tr>
  <tr><td><b>Anti-dsDNA</b></td><td>Highly specific for SLE</td></tr>
  <tr><td><b>Anti-Sm</b></td><td>Highly specific for SLE</td></tr>
  <tr><td>Antiphospholipid antibody</td><td>สัมพันธ์กับ antiphospholipid syndrome → เสี่ยง thrombosis</td></tr>
  <tr><td>Complement (C3, C4)</td><td>ต่ำใน active SLE</td></tr>
</table></div>` },
    { id: 'tx', t: 'การรักษา', html: `<h3>1. Non-pharmacotherapy</h3>
<p>Aerobic exercise · คุมน้ำหนัก · <b>ป้องกันแสงแดด</b> · เลิกบุหรี่ · ลดความเสี่ยง CVD · ป้องกันกระดูกพรุน · รักษาโรคร่วม (HTN, ไขมัน, ซึมเศร้า) · วางแผนวัคซีน</p>
<h3>2. Pharmacotherapy</h3>
<div class="key"><strong class="k">ทุกรายควรได้ Hydroxychloroquine (HCQ)</strong>เป็น core therapy ± prednisolone ≤ 7.5 mg/day · ACR 2025: SLE ที่คุมได้คงที่แต่ยังใช้ prednisone &gt; 5 mg/day ให้ค่อย ๆ ลดเหลือ ≤ 5 mg/day (ดีที่สุดคือหยุด) ภายใน 6 เดือน</div>
<figure><img data-fig="sle/p07-1.webp" alt="EULAR: การรักษา SLE แยกตาม mild, moderate, severe ทั้ง 1st line และ refractory โดยทุกระดับมี HCQ และ glucocorticoid"><figcaption>EULAR recommendations for the management of SLE drugs</figcaption></figure>
<figure><img data-fig="sle/p07-2.webp" alt="EULAR 2023: การรักษา non-renal SLE แยก mild/moderate/severe พร้อมเป้าหมาย remission และ low disease activity"><figcaption>Treatment in non-renal SLE: EULAR 2023</figcaption></figure>
<h3>2.1 Lupus nephritis</h3>
<p>อักเสบที่ glomeruli และเนื้อไต เป็น<b>ภาวะแทรกซ้อนรุนแรงที่สุด</b> ของ SLE (พบ ~40%) และเป็นสาเหตุสำคัญของ ESRD และการเสียชีวิต · immune complex ตกค้างที่ไต → กระตุ้น complement และการอักเสบ → proteinuria, hematuria, สูญเสียการทำงานไต</p>
<p><b>ACR guideline (class III/IV):</b></p>
<ul>
  <li>HCQ ทุกคน: ลด damage และ flares</li>
  <li>ACEI/ARB: ลด proteinuria ชะลอการเสื่อมของไต</li>
  <li>คุม BP &lt; 130/80 mmHg · LDL &lt; 100 mg/dL (statin ป้องกัน atherosclerosis)</li>
</ul>
<figure><img data-fig="sle/p07-3.webp" alt="EULAR 2023: การรักษา lupus nephritis ระยะ initial และ subsequent ด้วย HCQ, glucocorticoid, MMF, low-dose CYC, belimumab, CNI และเป้าหมายลด proteinuria ที่ 3, 6, 12–24 เดือน"><figcaption>Treatment in lupus nephritis: EULAR 2023</figcaption></figure>
<h3>2.2 Neuropsychiatric SLE (NPSLE)</h3>
<p>EULAR: รักษาตามสาเหตุ — inflammatory/autoimmune → immunosuppressive · thrombotic/aPL-related → anticoagulation</p>
<div class="tbl"><table>
  <tr><th>ชนิด</th><th>การรักษาหลัก</th></tr>
  <tr><td>Inflammatory (SLE-active, neurotoxic)</td><td>Glucocorticoids ± azathioprine หรือ cyclophosphamide<br>Refractory: plasma exchange, IVIG, rituximab</td></tr>
  <tr><td>Thrombotic / aPL-associated</td><td>Anticoagulants ± antiplatelets</td></tr>
  <tr><td>Symptomatic</td><td>Anticonvulsants (ชัก) · antidepressants (mood disorders)</td></tr>
</table></div>
<h3>2.3 Cardiovascular disease</h3>
<p>ยาที่มี cardioprotective effect: HCQ, mycophenolate mofetil (MMF)</p>
<h3>2.4 Arthralgia และ arthritis</h3>
<ul>
  <li>Intermittent: NSAIDs (เลี่ยงถ้าไตไม่ดี)</li>
  <li>Low-dose glucocorticoids + antimalarials (HCQ)</li>
  <li>ไม่พอ: เพิ่ม methotrexate</li>
  <li>ปวดเฉพาะข้อ: intra-articular corticosteroid injection</li>
  <li>Refractory: DMARDs (leflunomide, AZA, MMF, tacrolimus)</li>
</ul>
<h3>2.5 Cutaneous lupus (CLE): malar หรือ discoid rash</h3>
<ol>
  <li>Lifestyle: ป้องกันแสงแดด (เสริม vitamin D) · เลิกบุหรี่</li>
  <li>1st line: HCQ (photoprotective) · topical corticosteroids (ลดคัน แสบร้อน) · ทางเลือก: topical calcineurin inhibitors (tacrolimus, pimecrolimus)</li>
</ol>
<p><b>Rescue therapy:</b> IVIG, plasmapheresis (ไม่มีในไทย)</p>` },
    { id: 'drug', t: 'ยาที่ใช้ใน SLE', html: `<h3>1. Corticosteroids</h3>
<p>ออกฤทธิ์เร็ว ลด flare และการอักเสบอย่างรวดเร็ว ใช้เดี่ยวหรือเสริม · <b>taper ช้า ๆ</b> จนถึงขนาดต่ำสุดที่ได้ผล · ใช้ร่วม steroid-sparing agents (HCQ, AZA, MMF)</p>
<div class="tbl"><table>
  <tr><th>การใช้</th><th>ขนาด</th></tr>
  <tr><td>Maintenance</td><td>Low dose (≤ 7.5 mg/day prednisone)</td></tr>
  <tr><td>Flare control</td><td>Moderate (7.5–30 mg/day) – high dose (30–100 mg/day)</td></tr>
  <tr><td>Severe / life-threatening</td><td>Pulse therapy: IV methylprednisolone 250–1000 mg/day × 3 วัน</td></tr>
</table></div>
<ul>
  <li>C/I ของ pulse therapy: ตั้งครรภ์ ให้นม ติดเชื้อ ต้อหิน HTN DM peptic ulcer</li>
  <li>ให้ครั้งเดียวตอนเช้า (ลด ADR, adrenal suppression)</li>
  <li>ใช้นาน: CVD ต้อหิน ต้อกระจก hyperglycemia น้ำหนักเพิ่ม osteoporosis psychological disturbances · topical: skin atrophy, telangiectasia</li>
  <li>หยุดกะทันหัน → adrenal insufficiency → ต้อง taper</li>
</ul>
<h3>2. Antimalarials: chloroquine, hydroxychloroquine</h3>
<p>HCQ ปลอดภัยกว่า SE น้อยกว่า</p>
<ul>
  <li>ฤทธิ์: anti-inflammatory · immunomodulatory · antithrombotic</li>
  <li><b>ผู้ป่วยทุกคนได้ รวมถึงตั้งครรภ์และให้นม</b></li>
  <li>PK: กำจัดทางไต · t½ 40–50 วัน</li>
  <li>เริ่มเห็นผล 2–8 สัปดาห์ · ได้ผลสูงสุด 3–6 เดือน</li>
  <li>AE: GI เล็กน้อย ผิวระคายเคือง → ลดขนาด · <mark>retinal toxicity</mark> โดยเฉพาะใช้ &gt; 5 ปี, &gt; 5 mg/kg/day, ใช้ร่วม tamoxifen หรือมีโรคไต/จอประสาทตาเดิม</li>
  <li>ไทย: ตรวจตาทุก 1 ปี · ขนาดควร &lt; 5 mg/kg/day (actual weight) ลดความเสี่ยง retinopathy</li>
</ul>
<h3>3. Immunosuppressive drugs</h3>
<div class="tbl"><table>
  <tr><th>ยา</th><th>MOA / ข้อใช้</th><th>AE / ข้อควรระวัง</th></tr>
  <tr><td><b>Cyclophosphamide</b></td><td>Alkylating agent → DNA crosslinking ลด autoantibody ยับยั้ง B/T cell · สำรองไว้สำหรับ severe/refractory: lupus nephritis, NPSLE, vasculitis, hematologic</td><td>เป็นหมัน teratogenic → หยุด 3 เดือนก่อนตั้งครรภ์ (ชายเก็บอสุจิ · หญิง ovarian insufficiency) · myelosuppression · ติดเชื้อฉวยโอกาส · <b>hemorrhagic cystitis, bladder malignancy</b> (จาก acrolein) → ให้ IV ตอนเช้า + ดื่มน้ำ 72 ชม. / ให้ <b>MESNA</b> จับ acrolein</td></tr>
  <tr><td><b>Mycophenolate mofetil (MMF)</b></td><td>MPA (active form) ยับยั้ง IMPDH → block guanine synthesis · ขับทางปัสสาวะ มี enterohepatic recycling · ได้ผลเท่า cyclophosphamide ใน lupus nephritis</td><td>C/I ตั้งครรภ์ (teratogenic) · GI (คลื่นไส้ ท้องเสีย) ติดเชื้อ myelosuppression red cell aplasia → ลดขนาด/ใช้ enteric coat ลด GI</td></tr>
  <tr><td><b>Azathioprine (AZA)</b></td><td>AZA → 6-MP ยับยั้ง purine synthesis · 6-MP ถูกเปลี่ยนเป็น thiouric acid ผ่าน xanthine oxidase และ TPMT</td><td><b>DI กับ allopurinol, febuxostat</b> (ยับยั้ง xanthine oxidase) · TPMT ต่ำ → เสี่ยง bone marrow suppression, GI toxicity → ลดขนาด · <b>ตรวจ TPMT ก่อนเริ่ม</b></td></tr>
  <tr><td><b>Methotrexate (MTX)</b></td><td>ยับยั้ง dihydrofolate reductase → block purine synthesis · steroid-sparing · ให้<b>สัปดาห์ละครั้ง</b></td><td>C/I ตั้งครรภ์ · ตรวจ HBV, HCV ก่อนเริ่มถ้าเสี่ยง · hepatotoxicity, cytopenia, pulmonary toxicity, stomatitis</td></tr>
  <tr><td><b>Leflunomide</b></td><td>ยับยั้ง DHODH → block pyrimidine synthesis</td><td>C/I ตั้งครรภ์ (อาจ washout ด้วย cholestyramine) · DI กับ MTX (hepatotoxicity) · คลื่นไส้ ท้องเสีย hepatotoxicity leukopenia thrombocytopenia ผมร่วง ผื่น HTN peripheral neuropathy</td></tr>
</table></div>
<h3>4. Calcineurin inhibitors (tacrolimus, voclosporin)</h3>
<ul>
  <li>ลดการอักเสบและ organ damage จาก autoimmune</li>
  <li>Tacrolimus: lupus nephritis · pregnancy category C</li>
  <li>Voclosporin: FDA-approved ใน active lupus nephritis ร่วมกับ MMF · ห้ามใช้ถ้า baseline BP &gt; 165/105 หรือ eGFR ≤ 45 · เลี่ยงในตั้งครรภ์ (ข้อมูลจำกัด)</li>
  <li>CYP3A4 substrate · AE: nephrotoxicity, hypertension</li>
</ul>
<h3>5. Biologic agents (belimumab, anifrolumab, rituximab, etanercept)</h3>
<ul>
  <li>ใช้ใน moderate–severe หรือ refractory ต่อการรักษามาตรฐาน · เป็น add-on ไม่ใช้เดี่ยว</li>
  <li>ตรวจ CBC, LFT, HBV, TB และคัดกรองการติดเชื้อ · <b>เลี่ยง live vaccines</b> ระหว่างใช้</li>
  <li>Rituximab (IV): target CD20 บน B cell ใช้ใน refractory SLE · เฝ้าระวัง infusion reaction → premed (paracetamol, diphenhydramine, corticosteroid)</li>
  <li>Etanercept: target TNF-α ใช้ใน RA มากกว่า</li>
</ul>
<h3>6. Vitamin D</h3>
<p>ควรเสริมโดยเฉพาะผู้ที่ได้ glucocorticoid · vitamin D3 1,000–2,000 IU/day</p>` },
    { id: 'preg', t: 'การตั้งครรภ์และการคุมกำเนิด', html: `<div class="key"><strong class="k">ก่อนตั้งครรภ์</strong>โรคควรสงบ (remission) อย่างน้อย 6 เดือน</div>
<ul>
  <li>Preeclampsia: เริ่ม low-dose aspirin ก่อนอายุครรภ์ 16 สัปดาห์</li>
  <li>HCQ ช่วยป้องกันครรภ์เป็นพิษและลดความเสี่ยงโดยรวม · <b>กินต่อเนื่องตลอดการตั้งครรภ์</b> ป้องกัน flares และ heart block</li>
</ul>
<h3>ยาที่อาจทำให้ทารกพิการ</h3>
<div class="tbl"><table>
  <tr><th>ยา</th><th>หยุดก่อนตั้งครรภ์</th></tr>
  <tr><td>MTX, thalidomide</td><td>1–3 เดือน</td></tr>
  <tr><td>MMF</td><td>6 สัปดาห์</td></tr>
  <tr><td>Cyclophosphamide</td><td>3 เดือน</td></tr>
  <tr><td>Leflunomide</td><td>(ต้นฉบับไม่ระบุ — washout ด้วย cholestyramine)</td></tr>
</table></div>
<ul>
  <li><b>Flare ระหว่างตั้งครรภ์ ใช้ได้:</b> AZA (ผ่านรกน้อยมาก), calcineurin inhibitors (cyclosporine, tacrolimus)</li>
  <li><b>เสริม:</b> calcium, vitamin D, folic acid</li>
  <li><b>คุมความดัน:</b> methyldopa, labetalol, nifedipine · <b>C/I ACEIs และ ARBs</b> (ทารกพิการ ไตวายแรกเกิด เสียชีวิต)</li>
</ul>
<h3>การคุมกำเนิด</h3>
<ul>
  <li><b>เลี่ยงยาคุมที่มี estrogen</b> ใน aPL positive หรือเสี่ยง thrombosis</li>
  <li>โรคสงบ/คงที่ และไม่มี aPL: คุมได้ทุกวิธี</li>
  <li>Preferred: progestin-only หรือห่วงอนามัย (IUD)</li>
  <li>MMF ลดประสิทธิภาพ OCP → ใช้ IUD หรือคุมกำเนิด 2 วิธี</li>
</ul>` },
    { id: 'aps', t: 'APS · Drug-induced lupus · วัคซีน', html: `<h3>SLE–Antiphospholipid syndrome (APS)</h3>
<ol>
  <li>ลิ่มเลือด: ทั้งหลอดเลือดดำ (DVT) และแดง (stroke, heart attack)</li>
  <li>ภาวะแทรกซ้อนการตั้งครรภ์: แท้งซ้ำ ทารกเสียชีวิตในครรภ์</li>
</ol>
<div class="tbl"><table>
  <tr><th>สถานการณ์</th><th>การรักษา</th></tr>
  <tr><td>ไม่มีอาการ แต่ high-risk aPL</td><td>Low-dose aspirin (75–100 mg)</td></tr>
  <tr><td>APS + thrombosis ครั้งแรก</td><td>Warfarin (INR 2–3)</td></tr>
  <tr><td>Recurrent thrombosis</td><td>INR 3–4 / เพิ่ม ASA / LMWH</td></tr>
  <tr><td>Obstetric APS</td><td>Aspirin + prophylactic heparin</td></tr>
  <tr><td>OB complication ซ้ำแม้ให้ยาข้างต้น</td><td>เพิ่มขนาด heparin ± HCQ หรือ steroids</td></tr>
  <tr><td>APS + เคยมี thrombosis (ตั้งครรภ์)</td><td>Aspirin + therapeutic heparin</td></tr>
</table></div>
<ul>
  <li><b>เลี่ยง warfarin ระหว่างตั้งครรภ์</b></li>
  <li>LMWH จนถึง 4 สัปดาห์ก่อนคลอด แล้วเปลี่ยนเป็น UFH</li>
  <li>ให้ยาต้านการแข็งตัวหลังคลอดอย่างน้อย 6 สัปดาห์</li>
  <li>HCQ, statins, vitamin D อาจช่วยลดความเสี่ยงทางภูมิคุ้มกัน</li>
  <li><b>เลี่ยง DOACs</b> ใน APS กลุ่มเสี่ยงสูง (triple positive, arterial thrombosis)</li>
</ul>
<h3>Drug-induced lupus (DIL)</h3>
<p><b>เกณฑ์วินิจฉัย:</b> มีอาการ SLE อย่างน้อย 1 อย่าง (arthralgia, myalgia, malaise, fever, serositis) · lupus serology บวก · ใช้ยาที่สงสัยต่อเนื่อง ≥ 1 เดือน · ดีขึ้นในไม่กี่วันถึงสัปดาห์หลังหยุดยา</p>
<ul>
  <li><b>อาการ:</b> arthritis, rash, photosensitivity, pleurisy, fever, myalgia</li>
  <li><b>Lab:</b> ANA positive · <mark>antihistone antibodies</mark> · anti-ssDNA antibodies</li>
  <li><b>ยาสาเหตุ:</b> procainamide, hydralazine, isoniazid, minocycline, TNF-α inhibitors (etanercept, infliximab, adalimumab), quinidine, methyldopa, sulfa, phenytoin, PTU, MMI</li>
</ul>
<h3>วัคซีน</h3>
<ul>
  <li>ฉีดช่วงที่โรคสงบ/คงที่ และก่อนเริ่มยากดภูมิถ้าทำได้</li>
  <li>วัคซีนชนิดไม่มีชีวิต (non-live) ปลอดภัยในผู้ที่ภูมิคุ้มกันบกพร่อง</li>
</ul>
<div class="tbl"><table>
  <tr><th>วัคซีน</th><th>คำแนะนำ</th></tr>
  <tr><td>Influenza (ฉีด)</td><td>ทุกปี</td></tr>
  <tr><td>Pneumococcal</td><td>แนะนำอย่างยิ่ง</td></tr>
  <tr><td>Hepatitis A &amp; B</td><td>กลุ่มเสี่ยง</td></tr>
  <tr><td>COVID-19</td><td>mRNA 2 เข็ม + เข็ม 3 ห่าง ≥ 28 วัน ในผู้ที่ได้ยากดภูมิ</td></tr>
  <tr><td>Recombinant zoster</td><td>ปลอดภัยระหว่างกดภูมิ (เลี่ยงในตั้งครรภ์)</td></tr>
</table></div>` },
  ],
  questions: [
    { q: 'อาการแสดงทางผิวหนังที่เป็นลักษณะเฉพาะ ที่พบบ่อยที่สุดในผู้ป่วย SLE คืออะไร', o: ['ผื่นนูนแดง (wheal and flare)', 'ตุ่มน้ำใสตามตัว (blisters)', 'Maculopapular rash', 'ผื่นแดงรูปผีเสื้อบริเวณใบหน้า (malar rash)', 'ตุ่มหนอง (pustule)'], a: 3, e: 'Malar rash หรือ butterfly rash เป็นอาการแสดงทางผิวหนังที่จำเพาะกับ SLE' },
    { q: 'คำแนะนำในการปฏิบัติตัวข้อใดสำคัญที่สุดสำหรับผู้ป่วย SLE เพื่อป้องกันการกำเริบของโรค (flare)', o: ['งดรับประทานโปรตีนทุกชนิด', 'ออกกำลังกายกลางแจ้งในช่วงเที่ยง', 'จำกัดปริมาณน้ำและเกลือโซเดียม < 2 g/d', 'หลีกเลี่ยงการโดนแสงแดดและทากันแดดสม่ำเสมอ', 'สูบบุหรี่วันละแค่ 1 มวน'], a: 3, e: 'รังสี UV กระตุ้นระบบภูมิคุ้มกันให้ทำงานผิดปกติจนโรคกำเริบ' },
    { q: 'ยาตัวใดเป็น "หัวใจสำคัญ" และแนะนำให้ผู้ป่วย SLE ทุกรายได้รับหากไม่มีข้อห้ามใช้ เพื่อลดอัตราการเสียชีวิต', o: ['Methotrexate', 'Leflunomide', 'Hydroxychloroquine', 'Mycophenolate mofetil', 'Azathioprine'], a: 2, e: 'HCQ ให้ผู้ป่วยทุกรายที่ไม่มีข้อห้ามใช้ ลดการกำเริบ ป้องกันความเสียหายของอวัยวะ และลดอัตราการเสียชีวิต' },
    { q: 'ผู้ป่วยที่ได้รับ hydroxychloroquine (HCQ) ต่อเนื่องเป็นเวลานาน เภสัชกรควรแนะนำให้เฝ้าระวังพิษต่ออวัยวะใดเป็นพิเศษ', o: ['เส้นผม (ผมร่วง)', 'ดวงตา (จอประสาทตา)', 'ฟัน (ฟันผุ)', 'หู (การได้ยิน)', 'ตับ (ตับอักเสบ)'], a: 1, e: 'การสะสมของ HCQ อาจทำให้เกิด retinopathy จึงควรตรวจตาอย่างน้อยปีละครั้ง โดยเฉพาะหลังใช้ยาเกิน 5 ปี' },
    { q: 'การตรวจทางห้องปฏิบัติการข้อใดมีความไว (sensitivity) สูงที่สุดในการคัดกรองโรค SLE', o: ['Antinuclear antibody (ANA)', 'Rheumatoid factor', 'Anti-citrullinated protein antibody', 'Erythrocyte sedimentation rate', 'C-reactive protein'], a: 0, e: 'ANA มีความไวสูง ใช้เป็นเกณฑ์เริ่มต้นในการคัดกรอง · ตัวเลือกอื่นเป็น biomarker ใน RA' },
  ],
}
