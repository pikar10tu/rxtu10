// Rheumatoid arthritis — converted from the RxTU10 class summary PDF (see content/summaries/manifest.json)
export default {
  id: 'ra',
  date: '27/7/2569',
  refs: [
    'Slide RA อาจารย์แจ็ค',
    'Smolen JS, et al. EULAR recommendations for the management of rheumatoid arthritis with synthetic and biologic DMARDs: 2025 update. Ann Rheum Dis. 2026;85(6):991-1009.',
    'สมาคมรูมาติสซั่มแห่งประเทศไทย. แนวทางเวชปฏิบัติเพื่อการวินิจฉัยและการดูแลรักษาโรคข้ออักเสบรูมาตอยด์ พ.ศ. 2557. https://thairheumatology.org/phocadownload/73/Guideline_007.pdf',
    'Akbar U, et al. Omega-3 fatty acids in rheumatic diseases: a critical review. J Clin Rheumatol. 2017;23(6):330-339.',
    'Soeken KL, et al. Herbal medicines for the treatment of rheumatoid arthritis: a systematic review. Rheumatology. 2003;42(5):652-9.',
  ],
  sections: [
    { id: 'overview', t: 'Overview', html: `<h3>Epidemiology</h3>
<ul>
  <li>ความชุกประมาณ 1% ของประชากรโลก · <b>หญิง : ชาย = 3 : 1</b></li>
  <li>พบได้ทุกอายุ บ่อยสุด 40–60 ปี</li>
  <li>อัตราตายสูงกว่าประชากรทั่วไป สาเหตุหลักคือ <b>cardiovascular disease</b> · ไม่รักษาอายุขัยลดลง 3–10 ปี</li>
</ul>
<h3>Definition</h3>
<ul>
  <li>Chronic autoimmune disease → systemic inflammation (อักเสบทั้งตัว) + <mark>symmetrical synovitis</mark> (เป็นซ้ายและขวาพร้อมกัน)</li>
  <li>ไม่รักษา → irreversible joint destruction</li>
  <li>Extra-articular manifestations เช่น หัวใจ ปอด</li>
</ul>
<h3>Risk factors</h3>
<ul>
  <li>Genetic: HLA genes (HLA-DR4)</li>
  <li>Hormonal: ตั้งครรภ์ ให้นมบุตร ยาคุมกำเนิด testosterone ต่ำ</li>
  <li>Lifestyle: <b>smoking</b> (สำคัญมาก), obesity</li>
  <li>Environmental & infectious: viral (EBV), bacteria (mycoplasma), chronic mucosal inflammation (autoantibody formation), occupational exposure (silica dust)</li>
</ul>` },
    { id: 'patho', t: 'Pathophysiology', html: `<ol>
  <li><b>Disease initiation (preclinical) — loss of immune tolerance</b>
    <ul>
      <li>Triple hit: genetics, environment, trigger event</li>
      <li>Citrullination: PAD enzyme เปลี่ยน arginine → citrulline ร่างกายสร้าง neo-antigen</li>
      <li>ภูมิคุ้มกันมองว่า citrullinated protein เป็นสิ่งแปลกปลอม → สร้าง <b>ACPA (anti-CCP)</b> — <mark>specific marker ที่ขึ้นก่อนข้อบวมได้</mark></li>
    </ul>
  </li>
  <li><b>Immune activation — cytokine cascade</b>
    <ul>
      <li>APC นำเสนอ neo-antigen ให้ CD4+ T-cells → B-cells → plasma cell สร้าง RF และ ACPA</li>
      <li>Macrophage สร้าง TNF-α, IL-6, IL-1, IL-17 กระตุ้นการทำลายข้อ</li>
    </ul>
  </li>
  <li><b>Synovial pathology — joint destruction</b>
    <ul>
      <li>Synovitis & hyperplasia: WBC เข้าน้ำไขข้อ หลั่งสารอักเสบ เนื้อเยื่อหนาตัว</li>
      <li>Angiogenesis: สร้างเส้นเลือดใหม่ผ่าน VEGF</li>
      <li><mark>Pannus formation = hallmark</mark> ทำตัวเหมือนมะเร็ง ลุกลามกินกระดูก</li>
      <li>Cartilage degradation: chondrocytes หลั่ง MMPs → joint space narrowing</li>
      <li>Bone erosion: cytokine กระตุ้น RANKL → osteoclast → marginal erosions</li>
    </ul>
  </li>
  <li><b>Bone erosion → ankylosis (end-stage)</b>: fibrous ankylosis (พังผืดแทนกระดูกอ่อน ข้อแข็ง) → bony ankylosis (กระดูกเชื่อมถาวร ขยับไม่ได้ พิการ)</li>
  <li><b>Persistent inflammation — systemic disease</b>: p53 overexpression ต้าน apoptosis ของเซลล์อักเสบ · cytokine เข้ากระแสเลือดกระทบ CVS, hemato, lung, skin</li>
</ol>` },
    { id: 'clinical', t: 'อาการ, lab และวินิจฉัย', html: `<p>มักเป็นข้อเล็ก ๆ เช่น นิ้วมือ นิ้วเท้า <b>สมมาตร 2 ข้าง</b></p>
<ul>
  <li><b>Articular:</b> ปวด บวม ร้อน <mark>ข้อฝืดตอนเช้า &gt; 30–60 นาที</mark> เป็นมานาน &gt; 6 สัปดาห์</li>
  <li><b>Extra-articular:</b> CVS (pericarditis, accelerated atherosclerosis, MACE↑) · ปอด (interstitial lung disease) · ตา (dry eye, Sjögren's) · ผิว (rheumatoid nodules, vasculitis) · เลือด (anemia)</li>
  <li><b>Constitutional:</b> ไข้ต่ำ ๆ อ่อนเพลีย เบื่ออาหาร</li>
</ul>
<h3>Laboratory</h3>
<ul>
  <li><b>RF</b> (diagnosis): sensitive แต่ไม่จำเพาะ ภาวะอักเสบอื่น เช่น ติดเชื้อ ก็สูงได้</li>
  <li><b>ACPA</b> (screen): <mark>specific &gt; 95% ดีที่สุดสำหรับ early RA</mark></li>
  <li>Inflammatory marker (ไม่ใช้วินิจฉัย ใช้ monitor หลังใช้ยา): ESR → chronic inflammation · CRP → active inflammation</li>
</ul>
<h3>2010 ACR/EULAR classification criteria</h3>
<p>ใช้กับผู้ป่วยที่มี clinical synovitis อย่างน้อย 1 ข้อ ที่อธิบายด้วยโรคอื่นไม่ได้ · <mark>คะแนนรวม ≥ 6/10 = definite RA</mark></p>
<div class="tbl"><table>
  <tr><th>หมวด</th><th>เกณฑ์</th><th class="num">คะแนน</th></tr>
  <tr><td rowspan="5">A. ข้อที่เกี่ยวข้อง</td><td>ข้อใหญ่ 1 ข้อ</td><td class="num">0</td></tr>
  <tr><td>ข้อใหญ่ 2–10 ข้อ</td><td class="num">1</td></tr>
  <tr><td>ข้อเล็ก 1–3 ข้อ (มี/ไม่มีข้อใหญ่)</td><td class="num">2</td></tr>
  <tr><td>ข้อเล็ก 4–10 ข้อ (มี/ไม่มีข้อใหญ่)</td><td class="num">3</td></tr>
  <tr><td>&gt; 10 ข้อ (อย่างน้อย 1 ข้อเล็ก)</td><td class="num">5</td></tr>
  <tr><td rowspan="3">B. Serology</td><td>RF และ ACPA ลบ</td><td class="num">0</td></tr>
  <tr><td>RF หรือ ACPA บวกต่ำ</td><td class="num">2</td></tr>
  <tr><td>RF หรือ ACPA บวกสูง</td><td class="num">3</td></tr>
  <tr><td rowspan="2">C. Acute-phase reactants</td><td>CRP และ ESR ปกติ</td><td class="num">0</td></tr>
  <tr><td>CRP หรือ ESR ผิดปกติ</td><td class="num">1</td></tr>
  <tr><td rowspan="2">D. ระยะเวลาอาการ</td><td>&lt; 6 สัปดาห์</td><td class="num">0</td></tr>
  <tr><td>≥ 6 สัปดาห์</td><td class="num">1</td></tr>
</table></div>
<h3>Differential diagnosis</h3>
<div class="tbl"><table>
  <tr><th>โรค</th><th>ข้อที่เป็น</th><th>ข้อฝืดเช้า</th><th>Lab</th><th>Imaging</th><th>อาการอื่น</th><th>ต่างจาก RA</th></tr>
  <tr><td><b>RA</b></td><td>สมมาตร MCP, PIP, wrist</td><td>&gt; 30–60 นาที</td><td>RF+, anti-CCP+, ESR/CRP↑</td><td>erosion, joint space narrowing</td><td>nodules, ILD, dry eyes</td><td>anti-CCP+, erosive</td></tr>
  <tr><td>OA</td><td>DIP, PIP, เข่า, สะโพก</td><td>&lt; 30 นาที</td><td>ปกติ</td><td>osteophytes, sclerosis</td><td>ไม่มีอาการทั้งตัว</td><td>ปวดตามการใช้งาน ไม่อักเสบ</td></tr>
  <tr><td>SLE</td><td>สมมาตร non-erosive</td><td>แปรผัน</td><td>ANA+, anti-dsDNA</td><td>มักปกติ</td><td>ผื่น nephritis cytopenia</td><td>ไม่มี erosion, ANA+</td></tr>
  <tr><td>Psoriatic arthritis</td><td>ไม่สมมาตร DIP</td><td>&gt; 30 นาที</td><td>RF−</td><td>pencil-in-cup</td><td>psoriasis, nail pits</td><td>ผิว/เล็บ psoriasis</td></tr>
  <tr><td>Gout</td><td>monoarticular (1st MTP)</td><td>acute attack</td><td>uric acid↑</td><td>punched-out erosions</td><td>tophi</td><td>ปวดรุนแรงฉับพลัน</td></tr>
</table></div>
<h3>Severity (disease activity)</h3>
<p>ใช้ SDAI, CDAI, DAS28 แบ่ง 4 ระดับ · ประเมินทุก visit ถ้าไม่ถึงเป้าใน 3–6 เดือน → escalate therapy</p>
<div class="tbl"><table>
  <tr><th>เครื่องมือ</th><th class="num">ช่วง</th><th class="num">High</th><th class="num">Moderate</th><th class="num">Low</th><th class="num">Remission</th></tr>
  <tr><td>CDAI</td><td class="num">0–76</td><td class="num">&gt; 22</td><td class="num">&gt; 10–22</td><td class="num">&gt; 2.8–10</td><td class="num">≤ 2.8</td></tr>
  <tr><td>DAS28</td><td class="num">0–9.4</td><td class="num">&gt; 5.1</td><td class="num">≥ 3.2–≤ 5.1</td><td class="num">≥ 2.6–&lt; 3.2</td><td class="num">&lt; 2.6</td></tr>
  <tr><td>SDAI</td><td class="num">0–86</td><td class="num">&gt; 26</td><td class="num">&gt; 11–≤ 26</td><td class="num">&gt; 3.3–≤ 11</td><td class="num">≤ 3.3</td></tr>
</table></div>` },
    { id: 'principle', t: 'หลักการรักษา', html: `<h3>Non-pharmacotherapy</h3>
<ul>
  <li>Lifestyle: เลิกบุหรี่ ลดน้ำหนัก อาหาร Mediterranean · Patient education: adherence</li>
  <li>กายภาพบำบัด pain coping skill program · ออกกำลังกาย (aerobic, resistance, aquatic, yoga) ช่วยลดปวด</li>
  <li>Complementary: ฝังเข็ม นวด ประคบร้อน/เย็น · ผ่าตัดเปลี่ยนข้อสำหรับโรคระยะท้าย</li>
</ul>
<h3>Core of pharmacotherapy</h3>
<ul>
  <li>RA เป็นโรคเรื้อรังและ progressive → cartilage destruction, bone erosion, ข้อผิดรูป, ทุพพลภาพ · ความเสียหายเริ่มตั้งแต่ช่วงแรกของโรค</li>
  <li><b>Goal:</b> remission หรือ low disease activity</li>
  <li><b>Treat-to-target (T2T):</b> ตั้งเป้า → monitor (uncontrolled ทุก 1–3 เดือน, controlled ทุก 6 เดือน) → ไม่ถึงเป้าก็ปรับยา</li>
  <li><b>Window of opportunity:</b> early RA ยัง partially reversible ให้ยาใน 6–12 เดือนแรก <mark>เริ่ม DMARDs ทันที ยิ่งเร็วยิ่งดี</mark> · ก่อนเริ่มยาดูแผนตั้งครรภ์และความกังวลเรื่อง AE</li>
  <li><b>Objective:</b> คุมการอักเสบให้เร็วที่สุดก่อนข้อเสียหายถาวร, คุมโรคให้สงบระยะยาว, ป้องกันการสูญเสียการใช้ข้อ, ลด complication</li>
</ul>
<div class="tbl"><table>
  <tr><th></th><th>NSAIDs</th><th>Glucocorticoids</th><th>DMARDs</th></tr>
  <tr><td>ข้อบ่งใช้</td><td colspan="2">บรรเทาอาการเท่านั้น (GC เป็น immunosuppressant)</td><td>หยุดการดำเนินโรค</td></tr>
  <tr><td>Onset</td><td>เร็ว</td><td>ปานกลาง</td><td>ช้า (6 สัปดาห์ถึง 6 เดือน)</td></tr>
  <tr><td>ผลต่อโรค</td><td>ไม่ชะลอโรค</td><td>คุม exacerbation รุนแรงชั่วคราว ใช้ยาวในโรครุนแรงที่คุมด้วยยาอื่นไม่ได้</td><td>ออกฤทธิ์ต่อภูมิคุ้มกัน ชะลอ/หยุดโรค</td></tr>
  <tr><td>ผลต่ออาการ</td><td>ลดปวดและข้อฝืดบางส่วน</td><td>ต้านอักเสบ</td><td>ไม่มีฤทธิ์แก้ปวด</td></tr>
  <tr><td>ข้อผิดรูปใหม่</td><td colspan="2">หยุดไม่ได้</td><td>ซ่อมของเดิมไม่ได้ แต่ป้องกันผิดรูปเพิ่ม</td></tr>
  <tr><td>การใช้ทางคลินิก</td><td>acute เพื่อลดอักเสบ/ปวด</td><td>ขนาดต่ำ–กลาง คุมโรคเร็วระหว่างรอ DMARD</td><td>โรคเรื้อรังที่กำลังลุกลาม</td></tr>
  <tr><td>ใช้ระยะยาว</td><td>ควรน้อยที่สุด (ผลข้างเคียง)</td><td>พิษมากเกินจะใช้ประจำ</td><td>—</td></tr>
</table></div>` },
    { id: 'csdmard', t: 'csDMARDs', html: `<figure><img data-fig="ra/p06-1.webp" alt="กลไกการออกฤทธิ์ของ csDMARDs: methotrexate, leflunomide, hydroxychloroquine"><figcaption>กลไกของ csDMARDs</figcaption></figure>
<h3>Methotrexate (MTX) — gold standard / anchor drug</h3>
<ul>
  <li><b>MOA:</b> high dose ยับยั้ง DHFR (รักษามะเร็ง) · low dose เป็น immunomodulator: <b>ยับยั้ง AICAR transformylase → adenosine เพิ่ม → ลดอักเสบ</b> และกด T/B cell</li>
  <li>ข้อดี: ได้ผลดี ถูก ปลอดภัยระยะยาว · <mark>กินสัปดาห์ละครั้ง ไม่ใช่ทุกวัน</mark> (จับ polyglutamate synthetase อยู่ในเซลล์นาน)</li>
  <li><b>Dose:</b> เริ่ม 7.5–15 mg/wk → ต้องถึง 15–25 mg/wk ภายใน 4–8 สัปดาห์แรก (rapid escalation)</li>
  <li><b>Folic acid</b> 1–5 mg/d กินวันที่ไม่กิน MTX (ลด mucositis)</li>
  <li>เริ่มดีขึ้น 4–6 สัปดาห์ ได้ผลเต็มที่ 12–16 สัปดาห์</li>
  <li><b>ADR:</b> N/V/D (กินหลังอาหาร กิน folate), mucositis, alopecia, teratogenic, abortion, AST/ALT↑, เบลอ (fog) · <b>serious:</b> pancytopenia, pneumonitis (ไอแห้งต่อเนื่อง หยุดยา + steroid), ตับวาย (หยุดถาวร), overdose (leucovorin + hydration)</li>
  <li><b>Monitor:</b> CBC, LFT, SCr, HBsAg, TB, pregnancy test, chest X-ray · ปรับตามไต</li>
  <li><b>DI:</b> TMP-SMX, NSAIDs, PPI, penicillin</li>
  <li><b>Precaution:</b> โรคตับเรื้อรัง ติดเหล้า active infection bone marrow failure DM/อ้วน NAFLD</li>
  <li><b>C/I:</b> ตั้งครรภ์ ให้นมบุตร <b>CrCl &lt; 30</b> <a class="calc-link" href="#" data-calc="crcl">คำนวณ CrCl</a></li>
  <li>คุมกำเนิด (cat X) หยุดยาอย่างน้อย <b>3 เดือน ทั้งหญิงและชาย</b> · ผู้สูงอายุ start low go slow · ห้าม live vaccine</li>
  <li><b>Leucovorin</b> = antidote เฉพาะของ MTX toxicity</li>
  <li>ลืมกินยา: ≤ 2 วัน กินทันที · &gt; 2 วัน ข้ามไปโดสถัดไป ห้าม double dose</li>
</ul>
<h3>Leflunomide (LEF)</h3>
<ul>
  <li>Pyrimidine synthesis inhibitor ใช้เมื่อใช้/ทน MTX ไม่ได้ (ใช้ร่วมได้แต่ลดขนาดทั้งคู่ + ติดตามตับ ไขกระดูก ติดเชื้อ) · moderate–severe RA</li>
  <li><b>MOA:</b> prodrug → teriflunomide ยับยั้ง <b>DHODH</b> → กด T/B cell proliferation</li>
  <li><b>Dose:</b> 20 mg OD เวลาเดิม <b>ไม่ให้ loading dose</b> (ท้องเสียรุนแรง ตับอักเสบ)</li>
  <li><b>ADR:</b> HTN (ลด BP หรือลดขนาด ติดตามทุก visit) · peripheral neuropathy (irreversible มักเกิด 3–6 เดือนหลังได้ยา หยุดใน 30 วันหลังมีอาการยังฟื้นได้) · teratogenic (cat X) · AST/ALT↑ (จำกัดเหล้า) · diarrhea · leukopenia · alopecia, rash</li>
  <li><b>Monitor:</b> CBC, LFT (&gt; 3× ULN หยุดยา), BP · <b>DI:</b> MTX, rifampin, warfarin, hepatotoxic drugs, live vaccines</li>
  <li><b>C/I:</b> ตั้งครรภ์ ให้นมบุตร (หญิงคุมกำเนิด ชายหยุดยาอย่างน้อย 3 เดือน)</li>
  <li><mark>Washout:</mark> cholestyramine หรือ activated charcoal 11 วัน (วางแผนตั้งครรภ์ ตับอักเสบรุนแรง neuropathy ทนยาไม่ได้) · ยืนยันระดับยา &lt; 0.02 mg/L หรือ washout ครบแล้วรออีก 3 เดือน</li>
</ul>
<h3>Sulfasalazine (SSZ)</h3>
<ul>
  <li>ใช้เมื่อทน MTX ไม่ได้ mild–moderate RA · <mark>ใช้ในคนท้อง/ให้นมบุตรได้</mark></li>
  <li><b>MOA:</b> แบคทีเรียในลำไส้เปลี่ยน prodrug เป็น 5-ASA (IBD) + sulfapyridine (anti-rheumatic) กด cytokine</li>
  <li><b>Dose:</b> 500 mg OD titrate ทุกสัปดาห์ (ลด GI intolerance) เป้า 1–1.5 g BID</li>
  <li><b>ADR:</b> N/V (กินพร้อมอาหาร ดื่มน้ำมาก ๆ), AST/ALT↑, rash, SJS, DRESS, leukopenia (folic acid 1 mg/d), G6PD hemolysis, ผิว/ปัสสาวะสีเหลืองส้ม, oligospermia</li>
  <li><b>Monitor:</b> CBC, LFT · <b>DI:</b> MTX, warfarin, digoxin, broad-spectrum ATB (ampicillin ลดผล SSZ), iron</li>
  <li><b>C/I:</b> แพ้ sulfa และ salicylate, G6PD deficiency, ลำไส้/ทางเดินปัสสาวะอุดตัน · ไม่แนะนำในไต/ตับบกพร่อง</li>
</ul>
<h3>Hydroxychloroquine (HCQ)</h3>
<ul>
  <li><b>First-line ใน mild RA</b> ปลอดภัยระยะยาว ไม่เป็นพิษต่อตับ/ไขกระดูก เป็น immunomodulator ไม่กดภูมิ</li>
  <li><b>MOA:</b> weak base เข้า lysosome เพิ่ม pH รบกวนภูมิคุ้มกัน (กด T-cell, TLR)</li>
  <li><b>Dose:</b> 200–400 mg OD <mark>max 5 mg/kg/d</mark> (คิดจากน้ำหนักจริง) เกินนี้เป็นพิษต่อตา</li>
  <li><b>ADR:</b> retinopathy (หยุดยา) hyperpigmentation nausea (กินพร้อมอาหาร) QT prolong myopathy</li>
  <li><b>Retinopathy:</b> irreversible ขึ้นกับขนาดและเวลา "bull's eye" · ปัจจัยเสี่ยง <b>"5-5-R-T"</b>: dose &gt; 5 mg/kg/d, duration &gt; 5 ปี, renal CKD ≥ 3, tamoxifen</li>
  <li>ตรวจตา: baseline → ตรวจใน 1 ปีหลังเริ่มยา → low risk ทุกปีหลังครบ 5 ปี / high risk ทุกปี</li>
  <li>ปรับขนาดตามไต · ใช้ในคนท้อง/ให้นมบุตรได้</li>
</ul>
<figure><img data-fig="ra/p10-1.webp" alt="ตารางการตรวจทางห้องปฏิบัติการก่อนเริ่มยาและระหว่างใช้ยาต้านรูมาติซั่ม"><figcaption>ตาราง 6–7 การตรวจก่อนเริ่มยาและเพื่อเฝ้าระวังผลข้างเคียง (แนวทางไทย 2557)</figcaption></figure>
<div class="tbl"><table>
  <tr><th>ยา</th><th>ความถี่ (TRA 2557)</th><th>ติดตามเป็นพิเศษ</th></tr>
  <tr><td>MTX</td><td>ทุก 1–3 เดือน</td><td>LFT (ไม่เกิน 3 เท่า ULN), CBC (cytopenia), Cr</td></tr>
  <tr><td>LEF</td><td>ทุก 1–3 เดือน</td><td>ความดันโลหิต และ LFT</td></tr>
  <tr><td>HCQ</td><td>ทุก 12 เดือน</td><td>จอประสาทตา (visual field/SD-OCT)</td></tr>
  <tr><td>JAKi</td><td>ตามดุลพินิจแพทย์</td><td>lipid profile, CBC, Cr</td></tr>
</table></div>` },
    { id: 'advanced', t: 'bDMARDs และ JAK inhibitors', html: `<h3>Biological DMARDs</h3>
<ul>
  <li>ใช้หลัง csDMARDs ล้มเหลว (3–6 เดือน) SC หรือ IV เท่านั้น moderate–severe RA มักใช้ร่วม MTX</li>
  <li><b>ก่อนเริ่มต้องตรวจ:</b> TB, hepatitis B/C, malignancy, CVS (NYHA 3/4), baseline CBC, LFT</li>
  <li><b>Safety:</b> infection (เสี่ยงหลัก), immunogenicity (สร้าง ADA), malignancy, hematologic · <mark>ห้าม live vaccine (ฉีดให้เสร็จก่อนเริ่มยา ≥ 4 สัปดาห์)</mark></li>
</ul>
<h3>TNF-α inhibitors</h3>
<p>Adalimumab, etanercept, infliximab, certolizumab, golimumab — block TNF-α ลดอักเสบและการทำลายข้อ</p>
<ul>
  <li>เก็บ 2–8 °C อยู่อุณหภูมิห้องเกิน 24 ชม. ห้ามใช้ · ห้ามเขย่า</li>
  <li>SE: serious infection, TB reactivation, hepatitis reactivation, malignancy, drug-induced lupus, immunogenicity</li>
  <li>Red flags: HF, อาการทางระบบประสาท (ชา tingling การมองเห็นเปลี่ยน), ต่อมน้ำเหลืองโตต่อเนื่อง, lupus-like syndrome</li>
  <li><b>Sick rule:</b> ไข้ &gt; 38 °C หยุดยา · หยุดยาเมื่อเริ่ม ATB · ไม่มีไข้ &gt; 48 ชม. และหยุด ATB แล้วกลับมาใช้ได้</li>
  <li><mark>Certolizumab pegol ตัวเดียวที่ใช้ในคนท้องได้</mark></li>
  <li>ลืมฉีด: ยารายสัปดาห์ ≤ 2 วัน · ทุก 2 สัปดาห์ ≤ 7 วัน · รายเดือน ≤ 14 วัน</li>
</ul>
<h3>Non-TNF biologics (เมื่อ TNFi ล้มเหลว/ทนไม่ได้/ห้ามใช้)</h3>
<div class="tbl"><table>
  <tr><th>ยา</th><th>MOA</th><th>ADR / ข้อควรรู้</th></tr>
  <tr><td>Tocilizumab</td><td>block IL-6 receptor (soluble + membrane)</td><td>hyperlipidemia, serious infection, ปวดหัว, HTN, GI perforation, แพ้, liver enzyme↑ · ตรวจ TB, hepatitis, lipid, CBC, LFT ก่อนเริ่ม</td></tr>
  <tr><td>Sarilumab</td><td>ยับยั้ง IL-6 receptor (class effect เหมือน tocilizumab)</td><td>hyperlipidemia, serious infection, injection site reaction, GI perforation, liver enzyme↑</td></tr>
  <tr><td>Abatacept</td><td>T-cell co-stimulation blocker (block CD28)</td><td>ปวดหัว คลื่นไส้ ติดเชื้อทางเดินหายใจ injection site reaction COPD exacerbation · เสี่ยงติดเชื้อรุนแรงน้อยกว่า TNFi/rituximab · live vaccine ≥ 4 สัปดาห์ก่อนเริ่ม</td></tr>
  <tr><td>Rituximab</td><td>จับ CD20 บน B-cell ลด autoantibody</td><td>infusion reaction (ไข้ หนาวสั่น ผื่น hypotension) → premed เช่น CPM · serious infection · <b>HBV reactivation</b> · CVE</td></tr>
</table></div>
<h3>Targeted synthetic DMARDs — JAK inhibitors</h3>
<ul>
  <li>moderate–severe RA มักหลัง csDMARD ล้มเหลว ยากินเท่านั้น · ยับยั้ง JAK-STAT</li>
  <li><mark>Boxed warning: serious infection, malignancy, VTE, CVE, death</mark> · screen MACE, VTE, มะเร็ง, TB, HBV/HCV, CBC/LFT/lipid ก่อนเริ่ม</li>
  <li><b>Tofacitinib</b> (JAK1/3): ปรับตามตับ/ไต เลี่ยง strong CYP3A4 inhibitor · คำเตือน FDA สูงสุด</li>
  <li><b>Baricitinib</b> (selective JAK1): เลี่ยงในโรคตับ · เสี่ยง herpes zoster สูง → ฉีดวัคซีนก่อน</li>
  <li><b>Upadacitinib</b> (JAK1/2): ปรับตามไต — ไวต่อไตที่สุดในกลุ่ม</li>
  <li>ADR จำ <b>I-CLOT-M</b>: Infection (TB, zoster), CVE, Lipid↑, OI, Thrombosis, Malignancy</li>
</ul>` },
    { id: 'support', t: 'ยาเสริม: NSAIDs และ steroid', html: `<h3>NSAIDs</h3>
<ul>
  <li>ยาเสริมที่ใช้บ่อยที่สุด ลดปวดและบวม (<b>symptomatic relief เท่านั้น</b>)</li>
  <li>Thai 2557: แนะนำ oral NSAIDs เป็น initial treatment บรรเทาปวดและลดอักเสบ</li>
  <li><mark>ไม่ลด CRP และไม่ชะลอการทำลายข้อ</mark> · ใช้นานเฝ้าระวัง GI ไต หัวใจ</li>
</ul>
<h3>Corticosteroids</h3>
<ul>
  <li>ต้านอักเสบแรงกว่า NSAIDs ใช้ <b>bridging therapy</b> ระหว่างรอ DMARD ที่ออกฤทธิ์ช้า</li>
  <li>EULAR 2025: สนับสนุน short-term bridging (&lt; 3 เดือน) เมื่อเริ่มหรือเปลี่ยน csDMARDs</li>
  <li>Thai 2557: low-dose prednisolone (≤ 7.5 mg/วัน) ในโรครุนแรง หรือ NSAIDs ไม่พอ/ห้ามใช้</li>
  <li>ACR 2021: ไม่แนะนำ systemic ระยะยาว ใช้ขนาดต่ำสุด สั้นที่สุด</li>
  <li>ห้ามใช้เรื้อรัง: osteoporosis, HTN, hyperglycemia, infection</li>
</ul>` },
    { id: 'adme', t: 'Pharmacokinetics', html: `<div class="tbl"><table>
  <tr><th>ยา</th><th>A</th><th>D</th><th>M</th><th>E / อื่น ๆ</th></tr>
  <tr><td>MTX</td><td>oral BA 60–70%</td><td>สะสมในตับ ไต RBC · polyglutamation (อยู่ในเซลล์นาน ออกฤทธิ์เป็นสัปดาห์แม้ t½ สั้น)</td><td>ตับ</td><td>ไต · t½ 6–9 ชม. (low dose) · oral, IM/SC</td></tr>
  <tr><td>LEF</td><td>oral only &gt; 80%</td><td>high protein bound</td><td>ตับ → teriflunomide</td><td><mark>enterohepatic recirculation t½ ≈ 2–3 สัปดาห์ อยู่ในร่างกายได้ถึง 2 ปี</mark></td></tr>
  <tr><td>SSZ</td><td>oral only ดูดซึมจำกัดในลำไส้เล็ก</td><td>—</td><td>colonic metabolism, hepatic acetylation</td><td>ไต</td></tr>
  <tr><td>HCQ</td><td>oral only ดูดซึมดี</td><td>จับ melanin ที่ตา (พิษ) ผิว หัวใจ</td><td colspan="2">ตับและไต · 3–6 เดือนถึง steady state → พิษเกิดช้า</td></tr>
</table></div>` },
    { id: 'algo', t: 'RA treatment algorithm', html: `<h3>Phase 1: csDMARDs (initial)</h3>
<figure><img data-fig="ra/p15-1.webp" alt="แผนภาพ Phase 1: เริ่ม methotrexate ร่วม glucocorticoid ระยะสั้น ประเมินที่ 3 และ 6 เดือน"><figcaption>Phase I (EULAR)</figcaption></figure>
<ul>
  <li>เริ่มทันทีหลังวินิจฉัย ภายใน 3 เดือน (window of opportunity)</li>
  <li><b>First-line: MTX</b> เริ่ม oral → เปลี่ยนเป็น SC เมื่อ high disease activity, GI intolerance, ดูดซึมไม่ดี · เป้า ≥ 15 mg/wk ใน 4–6 สัปดาห์</li>
  <li>Glucocorticoid bridging ≤ 3 เดือน ขนาดต่ำ (prednisolone &lt; 7.5 mg/day) taper และหยุดให้เร็วที่สุด</li>
  <li>ห้ามใช้/ทน MTX ไม่ได้ → LEF หรือ SSZ · mild disease พิจารณา HCQ</li>
  <li>ประเมิน MTX + GC ที่ 3 เดือน (ต้องดีขึ้น &gt; 50%) และถึงเป้าที่ 6 เดือน → sustained remission หรือ LDA</li>
</ul>
<h3>Phase 2: inadequate response to MTX</h3>
<figure><img data-fig="ra/p16-1.webp" alt="แผนภาพ Phase 2: เพิ่ม bDMARD หรือ JAK inhibitor"><figcaption>Phase II</figcaption></figure>
<p>MTX ขนาด maximum tolerated 3–6 เดือนแล้วไม่ถึง remission/LDA → <mark>เพิ่ม bDMARD หรือ JAK inhibitor ร่วมกับ MTX</mark> (JAKi ต้องประเมินความเสี่ยงก่อน)</p>
<h3>Phase 3: failure of advanced therapy</h3>
<figure><img data-fig="ra/p16-2.webp" alt="แผนภาพ Phase 3: เปลี่ยน bDMARD หรือ JAK inhibitor"><figcaption>Phase III</figcaption></figure>
<ul>
  <li>เปลี่ยน bDMARD หรือ JAKi ตัวอื่น (เลือกกลไกต่างจากเดิม)</li>
  <li>JAKi ระวัง: CV risk, malignancy, thromboembolism, อายุ &gt; 65</li>
</ul>` },
    { id: 'herb', t: 'สมุนไพรและอาหารเสริม', html: `<p>บรรเทาอาการและลดอักเสบคล้าย NSAIDs</p>
<ul>
  <li><b>Omega-3 (fish oil EPA/DHA):</b> ปรับการสร้าง eicosanoid ไปทางต้านอักเสบ กด pro-inflammatory cytokine · 16 จาก 20 การศึกษาใน RA อาการดีขึ้น ลดข้อฝืดตอนเช้า จำนวนข้อที่เจ็บ/บวม บางการศึกษาลดการใช้ NSAIDs · ขนาดในงานวิจัย EPA+DHA ~2.7–3 g/วัน (สูงกว่าขนาดเพื่อหัวใจ)</li>
  <li><b>GLA (gamma-linolenic acid):</b> ในน้ำมัน evening primrose, borage, blackcurrant seed เป็นสารตั้งต้นของ prostaglandin ต้านอักเสบ · Cochrane: น่าจะลดปวด อาจช่วยการทำงานของข้อ ไม่เพิ่มผลข้างเคียง</li>
</ul>` },
  ],
  questions: [
    { q: 'หญิง 55 ปี เป็น RA ได้ methotrexate 15 mg สัปดาห์ละครั้งร่วมกับ folic acid มาด้วย UTI ยาปฏิชีวนะใดควรหลีกเลี่ยงมากที่สุด เพราะเพิ่มความเสี่ยง pancytopenia เมื่อใช้ร่วม MTX', o: ['Cephalexin', 'Co-trimoxazole (trimethoprim/sulfamethoxazole)', 'Azithromycin', 'Nitrofurantoin', 'Fosfomycin'], a: 1, e: 'Trimethoprim ยับยั้ง DHFR เสริมฤทธิ์ต้าน folate กับ MTX และ sulfamethoxazole ลดการขับ MTX ทางไต → ระดับ MTX สูง เสี่ยง myelosuppression · ยาอื่นไม่มี interaction สำคัญกับ MTX' },
    { q: 'หญิง 28 ปี เป็น RA วางแผนตั้งครรภ์เร็ว ๆ นี้ DMARD ใดใช้ต่อได้อย่างปลอดภัยระหว่างตั้งครรภ์', o: ['Methotrexate', 'Leflunomide', 'Hydroxychloroquine', 'Tofacitinib', 'Upadacitinib'], a: 2, e: 'HCQ (และ sulfasalazine) มีข้อมูลใช้ในหญิงตั้งครรภ์/ให้นมบุตรได้ · MTX cat X ต้องหยุด ≥ 3 เดือนก่อนตั้งครรภ์ทั้งชายและหญิง · leflunomide cat X อยู่ในร่างกาย ~2 ปี ต้อง washout ด้วย cholestyramine · JAK inhibitors ไม่แนะนำในหญิงตั้งครรภ์' },
    { q: 'ผู้ป่วย RA ได้ MTX ขนาด maximum tolerated (25 mg/wk) + folic acid มา 6 เดือน ยังไม่ remission การรักษาต่อไปที่เหมาะสมที่สุดคือ', o: ['เพิ่ม MTX เป็น 40 mg/wk', 'เปลี่ยนเป็น NSAIDs เดี่ยว ๆ', 'เพิ่ม bDMARD หรือ JAK inhibitor ร่วมกับ MTX', 'หยุดยาทั้งหมดแล้วติดตามอาการ', 'ให้ prednisolone ขนาดสูงต่อเนื่องระยะยาว'], a: 2, e: 'Treat-to-target: MTX max tolerated dose ไม่ถึงเป้าใน 3–6 เดือน → escalate เข้า phase 2 · MTX เพดาน ~25 mg/wk เพิ่มเกินไม่เพิ่มผลแต่เพิ่มพิษ · NSAIDs บรรเทาอาการเท่านั้น · หยุดยาปล่อยให้ข้อถูกทำลาย · steroid ใช้ bridging < 3 เดือนเท่านั้น' },
    { q: 'ผู้ป่วย RA ได้ hydroxychloroquine ข้อใดถูกต้องเกี่ยวกับการเฝ้าระวัง retinopathy', o: ['ควรใช้ขนาด > 5 mg/kg/day เพื่อให้ได้ประสิทธิภาพสูงสุด', 'Retinopathy หายกลับเป็นปกติได้เมื่อหยุดยา', 'ความเสี่ยงเพิ่มขึ้นเมื่อใช้ยานานเกิน 5 ปี ร่วมกับ CKD stage ≥ 3', 'ไม่จำเป็นต้องตรวจตาก่อนเริ่มยา', 'ควรตรวจตาครั้งแรกหลังใช้ยาไปแล้ว 10 ปี'], a: 2, e: 'ปัจจัยเสี่ยง "5-5-R-T": dose > 5 mg/kg/day, duration > 5 ปี, renal (CKD ≥ 3), tamoxifen · ขนาด ≤ 5 mg/kg/day · retinopathy irreversible · ต้องตรวจ baseline แล้วตรวจซ้ำใน 1 ปี/low risk ทุกปีหลังครบ 5 ปี/high risk ทุกปี' },
    { q: 'ก่อนเริ่มยา bDMARD และ JAK inhibitor ในผู้ป่วย RA ข้อใดถูกต้อง', o: ['ให้ live-attenuated vaccine พร้อมกับเริ่มยาได้ทันที', 'ต้องคัดกรอง TB และ hepatitis B/C ก่อนเริ่มยา', 'ไม่ต้องหยุดยาแม้มีไข้สูงหรือกำลังติดเชื้อ', 'JAK inhibitor ไม่มี black box warning', 'bDMARD เป็น first-line ที่ควรเริ่มทันทีหลังวินิจฉัย'], a: 1, e: 'Live vaccine ห้ามระหว่างใช้ยา ฉีดให้เสร็จ ≥ 4 สัปดาห์ก่อนเริ่ม · sick rule: ไข้ > 38 °C หรือเริ่ม ATB ต้องหยุดยาชั่วคราว · JAKi มี boxed warning (serious infection, malignancy, VTE, MACE, death) · bDMARD/JAKi ใช้หลัง MTX ล้มเหลว 3–6 เดือน' },
  ],
}
