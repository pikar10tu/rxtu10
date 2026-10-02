// Psoriasis — converted from the RxTU10 class summary PDF (see content/summaries/manifest.json)
export default {
  id: 'psoriasis',
  date: '26/07/2569',
  refs: [
    'สมาคมแพทย์ผิวหนังแห่งประเทศไทย. แนวทางการดูแลผู้ป่วยโรคสะเก็ดเงิน (Clinical Practice Guideline for Psoriasis) 2022.',
    'เจาะลึกระบบสุขภาพ (HFocus). กรมการแพทย์แผนไทยฯ แนะ 7 สมุนไพร บรรเทาอาการโรคสะเก็ดเงิน. 2025. https://www.hfocus.org/content/2025/10/35792',
  ],
  sections: [
    { id: 'def', t: 'นิยามและปัจจัยกระตุ้น', html: `<p>พบ 1–2% ของประชากร · อักเสบเรื้อรังของผิวหนังจากพันธุกรรม + สิ่งแวดล้อม ทำให้ภูมิคุ้มกันผิดปกติ ผิวหนังหนา มีสะเก็ด ขุยลอก หลอดเลือดขยายเกิดผื่นแดง เป็น ๆ หาย ๆ คันหรือไม่คันก็ได้</p>
<h3>Trigger factors (กระตุ้นให้กำเริบ ไม่ใช่สาเหตุ)</h3>
<ul>
  <li>Physical trauma — <b>Koebner's phenomenon</b> (แกะ เกา เสียดสี) เช่น ผ่าตัด ฉีดวัคซีน sunburn รังสี รอยเกา ผิวอักเสบ</li>
  <li>ติดเชื้อ · อาหารหมักดอง · แอลกอฮอล์ · บุหรี่ · ความเครียด (30–40%)</li>
  <li>ฮอร์โมนเปลี่ยน (ตั้งครรภ์ มีประจำเดือน ยาคุม) · อากาศ (หนาว → ผิวแห้งตึง, ร้อน → เหงื่อมาก) · สารเคมีระคายเคือง</li>
  <li>ใช้ systemic corticosteroid นานแล้วหยุดกะทันหัน</li>
</ul>
<div class="key"><strong class="k">BALINS — drug-induced psoriasis</strong>ไม่ใช่ข้อห้ามใช้ แต่ต้องเฝ้าระวัง · <b>B</b>eta-blocker (propranolol) · <b>A</b>ntimalarial (chloroquine) · <b>L</b>ithium (เพิ่ม epidermal cell proliferation) · <b>I</b>nterferon · <b>N</b>SAIDs บางตัว (indomethacin) · <b>S</b>ystemic steroid rapid taper</div>
<h3>Diagnosis</h3>
<ul>
  <li>ผื่นอักเสบเป็นปื้นหนาแดง (erythematous plaque) ขอบชัด ลอกเป็นขุย เป็น ๆ หาย ๆ</li>
  <li><b>สะเก็ดสีขาวคล้ายเงิน (silvery scale)</b> ใต้สะเก็ดแดงเข้ม แกะสะเก็ดออกพบจุดเลือดออกเล็ก ๆ (<mark>Auspitz sign</mark>)</li>
  <li>คันหรือไม่คันก็ได้ · แคะ แกะ เกาแล้วผื่นขยาย = Koebner's phenomenon · บางรายแสบ ปวด</li>
</ul>
<h3>Pathophysiology</h3>
<p>ภูมิคุ้มกันผิดปกติ โดยเฉพาะ <b>T-helper 17</b> หลั่ง IFN, TNF, IL-12/23, IL-17, IL-23 → <b>keratinocyte hyperproliferation</b> → ผิวหนา สะเก็ด ขุยลอก หลอดเลือดขยาย</p>` },
    { id: 'type', t: 'ชนิดและความรุนแรง', html: `<ol>
  <li><b>Plaque psoriasis (vulgaris)</b> 80–90%: ผื่นนูนแดงหนาขอบชัด วงรี/วงกลม สะเก็ดขาวเงิน ≥ 1 cm แห้ง คัน เจ็บบริเวณรอยแตก</li>
  <li><b>Guttate psoriasis</b> (อันดับ 2): ตุ่มแดงเล็ก &lt; 1 cm ไม่หนา มีขุย มักอายุ &lt; 30 ปี มักมี URI จาก <i>group A beta-hemolytic streptococci</i> นำมาก่อน 2–3 สัปดาห์</li>
  <li><b>Pustular psoriasis:</b> generalized (รุนแรง ตุ่มหนองทั่วตัว ไข้ ท้องเสีย ตุ่มหนองไม่พบเชื้อ) · localized (ฝ่ามือ ฝ่าเท้า)</li>
  <li><b>Erythrodermic:</b> แดงเกือบทั้งตัว สะเก็ดลอกทั้งตัว ไข้สูง อ่อนเพลีย หนาวสั่น น้ำหนักลด สูญเสียน้ำและโปรตีน</li>
  <li><b>Inverse:</b> ซอกพับ (รักแร้ อวัยวะเพศ ขาหนีบ ใต้ราวนม) ขุยน้อยเพราะชุ่มชื้น</li>
  <li><b>Psoriatic nails:</b> มือมากกว่าเท้า · <b>pitting</b> (พบบ่อยสุด), onycholysis, subungual hyperkeratosis, oil-drop sign</li>
  <li><b>Psoriatic arthritis:</b> ปวด บวม stiffness ข้อ 2–3 ข้อแบบไม่สมมาตร โดยเฉพาะนิ้วมือนิ้วเท้า</li>
</ol>
<h3>Severity</h3>
<p>ใช้ BSA, PASI, DLQI ร่วมกัน (ยังไม่มีวิธีที่ดีที่สุด)</p>
<div class="tbl"><table>
  <tr><th>Mild</th><th>Moderate–severe</th></tr>
  <tr><td>ผื่นเป็นแห่ง ๆ (ข้อศอก เข่า) ส่วนมากไม่มีตุ่มหนอง · <b>&lt; 10% BSA · PASI &lt; 10 · DLQI &lt; 10</b></td>
      <td>อักเสบ แดง ตุ่มหนอง ผิวลอก มักมีข้ออักเสบร่วม บริเวณผิวบาง (หน้า มือ เท้า อวัยวะเพศ หนังศีรษะ) · <b>&gt; 10% BSA · PASI &gt; 10 · DLQI &gt; 10</b></td></tr>
</table></div>` },
    { id: 'pharm', t: 'Pharmacology', html: `<ul>
  <li><b>Topical corticosteroid:</b> จับ glucocorticoid receptor ลดอักเสบ ลดการแบ่งตัวของเซลล์ผิว กดภูมิ หลอดเลือดหดตัว</li>
  <li><b>Coal tar:</b> polyaromatic hydrocarbons จับ aryl hydrocarbon receptor ลดการสร้าง DNA ของหนังกำพร้า ลดอักเสบ</li>
  <li><b>Anthralin (dithranol):</b> อนุพันธ์ polycyclic aromatic hydrocarbon เชื่อว่ายับยั้งการกระตุ้น T-lymphocyte</li>
  <li><b>Vitamin D3 analogues:</b> จับ vitamin D receptor ยับยั้งการเพิ่มจำนวน keratinocyte</li>
  <li><b>Topical calcineurin inhibitors:</b> ยับยั้ง calcineurin ลดการกระตุ้น T-lymphocyte และ cytokine</li>
  <li><b>Methotrexate:</b> ยับยั้ง dihydrofolate reductase ยับยั้งการสร้าง DNA และการแบ่งตัวของเซลล์ผิว ลดอักเสบ</li>
  <li><b>Acitretin:</b> อนุพันธ์วิตามิน A (สลายเป็น etretinate) ปรับการแบ่งตัวของเซลล์ผิว ลดอักเสบโดย<b>ไม่กดภูมิ</b></li>
  <li><b>Cyclosporine A:</b> จับ cyclophilin ใน CD4+ T cell ยับยั้ง calcineurin ลด IFN, IL-2 กดภูมิ</li>
</ul>` },
    { id: 'tx', t: 'Pharmacotherapy (DST 2022)', html: `<figure><img data-fig="psoriasis/p06-1.webp" alt="แนวทางรักษาโรคสะเก็ดเงิน DST 2022: ไม่มีข้ออักเสบแบ่ง mild ใช้ยาทาหรือ targeted phototherapy, moderate/severe ใช้ยากิน phototherapy หรือ biologic · มีข้ออักเสบตามแนวทางสมาคมรูมาติสซั่ม"><figcaption>แนวทาง DST 2022: mild &lt; 5% BSA และไม่อยู่บริเวณสำคัญ · moderate 5–10% BSA · severe &gt; 10% BSA หรือ PASI &gt; 10 หรือ DLQI &gt; 10</figcaption></figure>
<h3>ยาทา</h3>
<ol>
  <li><b>Topical corticosteroids (first line)</b>
    <div class="tbl"><table>
      <tr><th>ความแรง</th><th>ตัวอย่าง</th></tr>
      <tr><td>Super-potent</td><td>clobetasol propionate 0.05% cream, ointment</td></tr>
      <tr><td>High</td><td>betamethasone dipropionate 0.05% cream, lotion</td></tr>
      <tr><td>Moderate</td><td>triamcinolone acetonide 0.1% cream, lotion</td></tr>
      <tr><td>Low</td><td>hydrocortisone acetate 0.5–2.5% cream, ointment, lotion</td></tr>
    </table></div>
    <ul>
      <li>ผื่นบางหรือผิวบาง (หน้า ขาหนีบ ข้อพับ) → moderate/low (หนังศีรษะใช้ solution)</li>
      <li><mark>ผื่นหนาหรือผิวหนา (ฝ่ามือ ฝ่าเท้า) → super-potent/high</mark></li>
      <li>S/E: ผิวบาง (atrophy), striae, รูขุมขนอักเสบ, รอยช้ำ</li>
    </ul>
  </li>
  <li><b>Coal tar:</b> เดี่ยวหรือร่วม topical steroid, UVB · S/E: รูขุมขนอักเสบ ระคาย แพ้ แสบไหม้จากแสง เปื้อนเสื้อผ้า กลิ่นเหม็น ไม่ใช้บริเวณผิวบาง</li>
  <li><b>Anthralin:</b> <b>short contact (แนะนำ)</b> ทาทิ้ง 30 นาที–1 ชม. แล้วเช็ดออก เริ่ม 0.1% เพิ่มความเข้มข้นได้ · Ingram: น้ำมันดินทา → UVB → anthralin ก่อนนอน · S/E: ระคาย เปื้อนผ้า <b>ผิวปกติคล้ำขึ้น</b> · เลี่ยงในหญิงตั้งครรภ์ ให้นมบุตรใช้ได้โดยเลี่ยงบริเวณเต้านม</li>
  <li><b>Vitamin D3 analogues</b> (calcipotriene, calcipotriol): plaque psoriasis วันละ 2 ครั้ง เลี่ยงหน้าและข้อพับ · ร่วม topical steroid ลดระคายเคือง เสริมผล (แต่ไม่ทาเวลาเดียวกัน) · ร่วม UVB/PUVA ทาหลังฉายแสง · S/E: ระคาย ไวต่อแสง <mark>hypercalcemia (โดยเฉพาะโรคไต) ไม่เกิน 100 g/สัปดาห์</mark></li>
  <li><b>Topical calcineurin inhibitors</b> (tacrolimus, pimecrolimus): วันละ 2 ครั้ง off-label บริเวณหน้า ข้อพับ ขาหนีบ · S/E: แสบร้อน ระคาย ลดลงเมื่อใช้ต่อเนื่อง</li>
</ol>
<h3>Systemic therapy</h3>
<ul>
  <li><b>Methotrexate:</b> <mark>ลำดับแรกใน moderate–severe</mark> 7.5–25 mg/สัปดาห์ · เสี่ยงผลข้างเคียงสูงเริ่ม test dose 2.5–5 mg/สัปดาห์ แล้วเพิ่มสัปดาห์ละ 2.5–5 mg
    <ul>
      <li>Absolute C/I: แพ้ยา, ตั้งครรภ์/ให้นมบุตร (cat X), ติดเชื้อคุมไม่ได้, โรคตับหรือไต, ภูมิบกพร่องรุนแรง, ไขกระดูก/เม็ดเลือดผิดปกติ, แผลในกระเพาะเฉียบพลัน</li>
      <li>S/E: คลื่นไส้ อาเจียน ท้องเสีย กดไขกระดูก ติดเชื้อง่าย ตับอักเสบ ปัสสาวะเป็นเลือด</li>
    </ul>
  </li>
  <li><b>Acitretin:</b> monotherapy ใน erythrodermic, generalized pustular, palmoplantar psoriasis · ผลน้อยกว่า MTX (ดีขึ้นเมื่อร่วม phototherapy) · <b>C/I: แพ้ยา, หญิงตั้งครรภ์ (ทารกพิการ)</b> · S/E: ปาก จมูก ตา ผิวแห้ง ผมร่วง (โดยเฉพาะหญิง ขนาด &gt; 17.5 mg/วัน)</li>
  <li><b>Cyclosporine A:</b> รุนแรงและไม่ตอบสนองวิธีอื่น · C/I: แพ้ยา, <b>BP สูงคุมไม่ได้</b>, ติดเชื้อรุนแรงคุมไม่ได้, ตับหรือไตบกพร่องรุนแรง · S/E: <b>พิษต่อไต BP สูง</b> ขนยาว เหงือกบวม ปวดกล้ามเนื้อ สิว ปวดศีรษะ</li>
</ul>
<h3>Supportive, phototherapy, biologics</h3>
<ul>
  <li><b>Supportive:</b> emollient (olive oil, petrolatum, liquid paraffin, urea cream ≥ 10%) · keratolytic (salicylic acid, urea, lactic acid) · sunscreen SPF ≥ 30</li>
  <li><b>Phototherapy:</b> คลื่น 308–313 nm · UVB · PUVA (UVA + psoralen กินหรือทา)</li>
  <li><b>Biologic drugs</b> (moderate–severe chronic plaque, potent immunosuppressor เก็บไว้เป็นทางเลือกท้าย): TNF-α inhibitor (adalimumab, etanercept, infliximab) · IL-23 (guselkumab, risankizumab) · IL-17 (secukinumab, brodalumab, ixekizumab) · IL-12/23 (ustekinumab) · <mark>C/I: แพ้ยาหรือสารละลาย, ติดเชื้อรุนแรงหรือกำลังติดเชื้อ</mark></li>
  <li><b>สมุนไพร (กรมการแพทย์แผนไทยฯ):</b> ครีมบัวบก · เจลว่านหางจระเข้ · ทิงเจอร์ทองพันชั่ง · ยาเบญจโลกวิเชียร (ยาห้าราก) · ยาเขียวหอม · ยาบำรุงโลหิต · ตำรับยาแก้น้ำเหลืองเสีย</li>
</ul>` },
  ],
  questions: [
    { q: 'ชาย 40 ปี ผื่นแดงหนา สะเก็ดขาวคล้ายเงินที่ลำตัว และผื่นหนามากที่ฝ่ามือฝ่าเท้าทั้งสองข้าง แพทย์วินิจฉัย plaque psoriasis ยาใดเหมาะเป็นทางเลือกแรก', o: ['Clobetasol propionate 0.05% ointment', 'Triamcinolone acetonide 0.1% cream', 'Hydrocortisone acetate 0.5% lotion', 'Coal tar', 'Cyclosporine A'], a: 0, e: 'Topical corticosteroid เป็นทางเลือกแรก และความแรงระดับ super-potent เหมาะกับผื่นหนาหรือผิวหนาเช่นฝ่ามือฝ่าเท้า · triamcinolone = moderate, hydrocortisone = low · coal tar เป็นทางเลือก ไม่ใช่ first line · cyclosporine เป็น systemic เก็บไว้กรณีรุนแรง' },
    { q: 'จากข้อที่แล้ว ถ้าใช้ยานาน ผลข้างเคียงที่อาจเกิดคือ', o: ['ผิวปกติบริเวณที่ทาคล้ำขึ้น', 'Hypercalcemia', 'ผิวหนังบางลง เกิดรอยแตกลาย', 'พิษต่อไต ความดันสูง', 'คลื่นไส้ อาเจียน ท้องเสีย'], a: 2, e: 'Topical corticosteroid ใช้นาน: ผิวบาง รอยแตกลาย รูขุมขนอักเสบ รอยช้ำ · ผิวคล้ำ = anthralin · hypercalcemia = vitamin D3 analogues · พิษต่อไต BP สูง = cyclosporine · คลื่นไส้ อาเจียน = MTX' },
    { q: 'ข้อใดอธิบายกลไกของ methotrexate ในโรคสะเก็ดเงินได้ถูกต้องที่สุด', o: ['ยับยั้ง calcineurin ลดการสร้าง cytokine', 'จับ vitamin D receptor ยับยั้งการเพิ่มจำนวน keratinocytes', 'เป็น TNF-α inhibitor กดภูมิอย่างรุนแรง', 'จับ aryl hydrocarbon receptor กดการสร้าง DNA ในหนังกำพร้า', 'ยับยั้ง dihydrofolate reductase ทำให้ยับยั้งการสร้าง DNA'], a: 4, e: 'MTX ยับยั้ง DHFR ยับยั้งการสร้าง DNA และการแบ่งตัวของเซลล์ผิว ลดอักเสบ · ก = topical calcineurin inhibitors · ข = vitamin D3 analogues · ค = biologics · ง = coal tar' },
    { q: 'ผู้ป่วยสะเก็ดเงินต้องได้ยาลดความดันเพิ่ม ยาใดต้องระวังเป็นพิเศษเพราะอาจทำให้โรคกำเริบ', o: ['Amlodipine', 'Propranolol', 'Enalapril', 'Hydrochlorothiazide', 'Losartan'], a: 1, e: 'Beta-blocker อยู่ในกลุ่ม drug-induced psoriasis (BALINS)' },
    { q: 'ข้อใดเป็นข้อห้ามใช้ (absolute contraindication) ของยา biologic ในโรคสะเก็ดเงิน', o: ['มีประวัติโรคตับอักเสบเรื้อรัง', 'มีแผลในกระเพาะ', 'พื้นที่ผื่น < 10% BSA', 'กำลังมีการติดเชื้อรุนแรง', 'ความดันสูงคุมไม่ได้'], a: 3, e: 'Biologic กดภูมิรุนแรง ข้อห้ามสำคัญคือติดเชื้อรุนแรงหรือกำลังติดเชื้อ เพื่อไม่ให้ลุกลามเป็นอันตราย' },
  ],
}
