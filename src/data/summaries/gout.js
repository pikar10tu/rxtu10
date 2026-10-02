// Gout — converted from the RxTU10 class summary PDF (see content/summaries/manifest.json)
export default {
  id: 'gout',
  date: "",
  refs: ["2026 Thai Rheumatism Association Guideline for the Treatment of Gout and Hyperuricemia"],
  sections: [
    { id: 'overview', t: "Overview", html: `<ul>
  <li>Inflammatory response ต่อการตกผลึกของ <b>monosodium urate (MSU)</b> ที่ข้อ เนื้อเยื่อ และไต เกิดจากระดับ uric acid สูงจนอิ่มตัวและละลายได้น้อยลง</li>
  <li>MSU กระตุ้น NLRP3 (innate immune) → หลั่ง inflammatory cytokine → เรียก neutrophil → cytokine มากขึ้น, pH ต่ำลง → ละลายลดลง → ผลึกมากขึ้น</li>
  <li><mark>Hyperuricemia: urate &gt; 6.8 mg/dL</mark> (ไม่ได้เป็น gout เสมอไป ต้องดูอาการ) — ต้องสูงต่อเนื่องจึงเกิด gout</li>
</ul>
<h3>ปัจจัยเสี่ยง</h3>
<p>อายุมาก · อ้วน · แอลกอฮอล์ · เครื่องดื่มหวาน · เนื้อแดง · หมดประจำเดือน (ขาด estrogen) · โรคไต · ชาย &gt; หญิง</p>` },
    { id: 'patho', t: "Uric acid & กลไก", html: `<ul>
  <li>ย่อยจาก purine · อุณหภูมิ/pH ต่ำลง → ละลายลดลง → เกิดผลึก → ปวด</li>
  <li>ไตขับผ่าน OATs · ดูดกลับผ่าน <b>URAT1</b> (แลกกับ anion) และ <b>GLUT9</b> — ทำงานมาก → uric สูง</li>
  <li>PRPP เป็นตัวสร้าง uric</li>
</ul>
<div class="tbl"><table>
  <tr><th>Overproduction</th><th>Underexcretion</th></tr>
  <tr><td>การสลาย nucleic acid มากขึ้น<br>PRPP activity มากขึ้น<br>ขาด HGPRT<br>อ้วน<br>อาหาร purine สูง</td>
      <td>แอลกอฮอล์ · ขาดน้ำ · insulin resistance · acidosis (lactic, DKA)<br><b>ยาที่ขับผ่าน URAT1:</b> diuretics, levodopa, ethambutol, pyrazinamide, nicotinic acid, cyclosporin, ASA, theophylline</td></tr>
</table></div>
<h3>ระยะของโรค</h3>
<div class="tbl"><table>
  <tr><th>ระยะ</th><th>ลักษณะ</th></tr>
  <tr><td>Acute gout</td><td>ปวด บวม แดง ร้อน ข้อเดียว (เช่น นิ้วโป้งเท้า) · ไม่มีข้อผิดรูป · peak ใน 24 h · หายใน 7 วัน กลับมาเป็นซ้ำได้</td></tr>
  <tr><td>Intercritical gout</td><td>โรคสงบ ไม่มีอาการ</td></tr>
  <tr><td>Chronic tophaceous gout</td><td>เรื้อรัง ข้อผิดรูป พบ tophi หลายข้อ</td></tr>
</table></div>` },
    { id: 'dx', t: "วินิจฉัย", html: `<ul>
  <li><b>Definitive:</b> พบผลึก MSU รูปเข็มใน synovial fluid</li>
  <li>ACR/EULAR 2015: อาการปวด บวม แดง · ผลึก MSU · lab (serum urate, MSU) · ข้อผิดรูป</li>
  <li>แยกจาก septic arthritis: ติดเชื้อ → ไข้สูง, WBC สูง, ปวดหลายข้อ</li>
</ul>` },
    { id: 'acute', t: "รักษา acute attack", html: `<p><b>เป้าหมาย:</b> หยุด acute attack และป้องกันภาวะแทรกซ้อน</p>
<ul>
  <li><b>ไม่ใช้ยา:</b> ลดปัจจัยเสี่ยง, ประคบเย็นลดปวด</li>
  <li><b>NSAIDs:</b> indomethacin, naproxen, sulindac (FDA approved; ตัวอื่นใช้ได้ <mark>ไม่แนะนำ ASA</mark>)</li>
  <li><b>COX-2:</b> celecoxib 1,200 mg วันแรก จากนั้น 400 mg 1×2</li>
  <li><b>Steroid:</b> triamcinolone acetonide IA 20–40 mg หรือ prednisolone กิน</li>
  <li><b>Colchicine (1st line)</b></li>
</ul>
<div class="key"><strong class="k">COLCHICINE</strong>
  <ul>
    <li>เริ่มภายใน 24 h ของ attack (หลังจากนั้น efficacy ลดลง)</li>
    <li><mark>1.2 mg → อีก 1 h ถ้าไม่หาย 0.6 mg</mark> (ไม่ใช้ซ้ำใน 3 วัน) · หายปวดแล้วหยุด</li>
    <li>AE: N/V, diarrhea, neutropenia, axonal neuropathy, <b>rhabdomyolysis (เสี่ยงขึ้นเมื่อใช้ร่วม simvastatin → เปลี่ยนเป็น pravastatin/fluvastatin)</b></li>
    <li>MOA: จับ tubulin → depolymerize microtubule → ลด chemotactic factor, superoxide · ไม่มี food effect</li>
    <li>ผ่าน CYP3A4: ใช้ร่วม strong 3A4 inhibitor → ลด dose 50%</li>
    <li>Prophylaxis: &lt;1 attack/ปี 0.6 mg 3–4 วัน/สัปดาห์ · &gt;1 attack/ปี 0.6 mg OD (รุนแรง BID)</li>
    <li>ไต: CrCl &lt; 30 ใช้ไม่เกิน 1 course/2 สัปดาห์ · prophylaxis 0.3 mg OD <a class="calc-link" href="#" data-calc="crcl">🧮 คำนวณ CrCl</a></li>
  </ul>
</div>` },
    { id: 'ult', t: "Urate-lowering therapy", html: `<h3>ไม่ใช้ยา</h3>
<p>เลี่ยงอาหาร purine สูง (อาหารทะเล เครื่องใน เนื้อแดง), ผลไม้หวาน/fructose, แอลกอฮอล์ · ลดน้ำหนัก · เปลี่ยนจาก thiazide · ป้องกันปัจจัยเสี่ยง CKD</p>
<h3>เกณฑ์เริ่มยา</h3>
<p>Uric acid &gt; 6.8 mg/dL ร่วมกับข้อใดข้อหนึ่ง:</p>
<ol>
  <li>Gout attack ≥ 2 ครั้ง/ปี</li><li>Tophus ≥ 1</li><li>CKD stage ≥ 3</li><li>Uric acid &gt; 9 mg/dL</li><li>นิ่วทางเดินปัสสาวะ</li><li>อายุ &lt; 40 ปี, uric &gt; 8 mg/dL ร่วมกับ ASCVD</li>
</ol>
<div class="key"><strong class="k">เป้าหมาย</strong>Uric acid &lt; 6 mg/dL · 1st line = <b>allopurinol</b> · ถ้ายังไม่ถึงเป้าเพิ่ม uricosuric</div>
<h3>Xanthine oxidase inhibitor</h3>
<div class="tbl"><table>
  <tr><th>ยา</th><th>ขนาด</th><th>ข้อควรจำ</th></tr>
  <tr><td><b>Allopurinol</b><br><small>active: oxypurinol</small></td><td class="num">CrCl &lt; 60: 50 mg/d<br>CrCl ≥ 60: 100 mg/d<br>max 900 mg/d</td>
    <td>ช่วงแรกอาจ flare → ให้ colchicine/NSAIDs/steroid คุม 3–6 เดือน · AE: rash, leukopenia, GI · <mark>ตรวจ HLA-B*58:01 ก่อนเริ่ม</mark> (SJS/TEN) · เสี่ยง: สูงอายุ หญิง เริ่ม &gt;100 mg/d CVD ไตไม่ดี<br>DI: probenecid, <b>azathioprine/mercaptopurine</b> (กดไขกระดูก), warfarin (INR↑), theophylline</td></tr>
  <tr><td><b>Febuxostat</b></td><td class="num">40 mg OD<br>max 80 mg/d</td><td>ใช้เมื่อห้ามใช้/ทนไม่ได้/ไม่ถึงเป้า · Mg/Al hydroxide ชะลอการดูดซึม (AUC ไม่เปลี่ยน) · AE: ตับ, <b>CV death (boxed warning)</b> · DI: theophylline</td></tr>
</table></div>
<h3>Uricosuric (ดื่มน้ำมาก ๆ · ไตไม่ดีได้ผลน้อย + เสี่ยงนิ่ว)</h3>
<div class="tbl"><table>
  <tr><th>ยา</th><th>ขนาด</th><th>ข้อควรจำ</th></tr>
  <tr><td>Sulfinpyrazone</td><td class="num">50 mg 1×2<br>max 800 mg/d</td><td>มีฤทธิ์ต้านเกล็ดเลือด · ไม่แนะนำ CrCl &lt; 60 · AE GI bleed · DI warfarin, aspirin</td></tr>
  <tr><td>Benzbromarone</td><td class="num">50 mg/d<br>max 200 mg/d</td><td>ใช้ร่วม allopurinol ได้ผลดีกว่าเดี่ยว · CYP2C9/3A4/1A · ระวัง CYP2C9 *3/*3</td></tr>
  <tr><td>Probenecid</td><td class="num">250 mg BID<br>max 2 g/d</td><td>ยับยั้ง URAT1 · ห้ามใช้ในนิ่วไต · ลดการขับ beta-lactam, NSAIDs, methotrexate</td></tr>
  <tr><td>Lesinurad</td><td>—</td><td>ยับยั้ง URAT1 · <b>AKI (boxed warning)</b> ต้องใช้ร่วม XOI</td></tr>
  <tr><td>Pegloticase</td><td>IV ≥ 2 h</td><td>uric → allantoin · refractory gout · ห้ามใน G6PD (hemolysis) · premed antihistamine + steroid · ใช้นานประสิทธิภาพลด (immunogenicity)</td></tr>
</table></div>
<div class="key"><strong class="k">จำไว้</strong>ยาความดันที่ดีในคนไข้ gout = <b>losartan</b> (ยับยั้งการดูดกลับ uric) · HCTZ ทำให้ uric สูง</div>` },
  ],
  // questions go to the question bank only (P3), tagged with this summary as their source
  questions: [
    {
      "case": "ผู้ป่วยชาย 45 ปี ปวด บวม แดง ที่ข้อนิ้วหัวแม่เท้าซ้าย 1 วัน มาซื้อ paracetamol เมื่อวานกินหน่อไม้และเครื่องในสัตว์ อาการเริ่มตอนเช้า (ใช้ตอบข้อ 1–3)",
      "q": "ผู้ป่วยรายนี้น่าจะเป็นโรคใด",
      "o": [
        "Rheumatoid arthritis",
        "Osteoarthritis",
        "Acute gout",
        "Osteomalacia",
        "Osteoporosis"
      ],
      "a": 2,
      "e": "มีปัจจัยเสี่ยงคืออาหาร purine สูง (หน่อไม้ เครื่องใน) และอาการเข้าได้กับ acute gout: ปวด บวม แดง นิ้วหัวแม่เท้า 1 วัน ข้างเดียว"
    },
    {
      "q": "ยาใดเหมาะสมที่สุดในการบรรเทาอาการปวด",
      "o": [
        "Colchicine",
        "Paracetamol",
        "Tramadol",
        "TA cream",
        "Allopurinol"
      ],
      "a": 0,
      "e": "Colchicine เป็น 1st line บรรเทาข้ออักเสบเฉียบพลันใน gout ตาม Thai Rheumatism Association 2026"
    },
    {
      "q": "ยาใดใช้รักษาผู้ป่วยรายนี้ในระยะยาว",
      "o": [
        "Prednisolone",
        "Indomethacin",
        "Allopurinol",
        "Paracetamol",
        "Colchicine"
      ],
      "a": 2,
      "e": "Allopurinol เป็น 1st line ระยะยาว · prednisolone, indomethacin, colchicine ใช้ช่วง acute · paracetamol ไม่ต้านอักเสบ"
    },
    {
      "q": "การตรวจยีน HLA-B*58:01 ทำก่อนเริ่มยาใด",
      "o": [
        "Probenecid",
        "Allopurinol",
        "Colchicine",
        "Sulfinpyrazone",
        "Febuxostat"
      ],
      "a": 1,
      "e": "ตรวจก่อนเริ่ม allopurinol ถ้าผลบวกเสี่ยง SCARs (SJS/TEN)"
    },
    {
      "q": "ผลข้างเคียงใดเสี่ยงพบได้จาก colchicine",
      "o": [
        "Rhabdomyolysis",
        "Neuropathy",
        "GI bleeding",
        "Liver function abnormalities",
        "ถูกทุกข้อ"
      ],
      "a": 0,
      "e": "พบได้โดยเฉพาะเมื่อใช้ร่วม simvastatin"
    }
  ],
}
