// Eczema / atopic dermatitis — converted from the RxTU10 class summary PDF (see content/summaries/manifest.json)
export default {
  id: 'eczema',
  date: '',
  refs: [
    'Chu DK, et al. Atopic dermatitis (eczema) guidelines: 2023 AAAAI/ACAAI Joint Task Force on Practice Parameters. Ann Allergy Asthma Immunol. 2024;132:274-312.',
  ],
  sections: [
    { id: 'overview', t: 'Overview', html: `<ul>
  <li><b>Epidemiology:</b> atopic dermatitis เป็นโรคผิวหนังอักเสบเรื้อรังที่พบบ่อยที่สุด เด็ก ~13% ผู้ใหญ่ ~7% ทั่วโลก · <mark>45% เริ่มก่อนอายุ 6 เดือน 85% ก่อน 5 ปี</mark></li>
  <li><b>Definition:</b> กลุ่มโรคผิวหนังอักเสบ (acute/chronic) ชั้นตื้น คัน แดง ผิวแห้งเป็นขุย เกราะผิวเสีย มักแย่ลงตอนกลางคืน</li>
  <li><b>Risk factors:</b> พันธุกรรม (filaggrin mutation), สิ่งแวดล้อม, ขาดความชุ่มชื้น, type 2 inflammation, microbial dysbiosis</li>
</ul>
<figure><img data-fig="eczema/p01-1.webp" alt="ผื่นผิวหนังอักเสบที่ข้อพับแขนและมือ เทียบภาพตัดขวางผิวที่อักเสบกับผิวปกติ: สารก่อภูมิแพ้ การอักเสบ เซลล์ภูมิคุ้มกัน"><figcaption>Dermatitis เทียบผิวปกติ (Cleveland Clinic)</figcaption></figure>
<h3>Diagnosis (Hanifin and Rajka / UK working party)</h3>
<p>ต้องมี<b>อาการคัน</b> (หรือผู้ปกครองเห็นเด็กเกา/ถู) ร่วมกับอย่างน้อย 3 ข้อ</p>
<ul>
  <li>เคยมีรอยโรคที่รอยพับ (ข้อพับศอก หลังเข่า หน้าข้อเท้า รอบคอหรือตา)</li>
  <li>ประวัติหอบหืดหรือภูมิแพ้อากาศ (หรือญาติสายตรงเป็นภูมิแพ้ ถ้าเด็ก &lt; 4 ปี)</li>
  <li>ผิวแห้งทั่วไปใน 1 ปีที่ผ่านมา</li>
  <li>เริ่มมีอาการก่อนอายุ 2 ปี (ไม่ใช้เกณฑ์นี้ถ้าเด็ก &lt; 4 ปี)</li>
  <li>เห็นผื่นที่ข้อพับชัดเจน (รวมแก้ม หน้าผาก แขนขาด้านนอกในเด็ก &lt; 4 ปี)</li>
</ul>` },
    { id: 'patho', t: 'Pathophysiology และความรุนแรง', html: `<ul>
  <li><b>Skin barrier defect:</b> ขาด filaggrin และไขมัน → เสียน้ำง่าย (TEWL) สารก่อภูมิแพ้และเชื้อเข้าผิวง่าย</li>
  <li><b>Type 2 (Th2) response:</b> หลั่ง IL-4, IL-13 และ <mark>IL-31 (กระตุ้นอาการคัน)</mark></li>
  <li><b>Itch-scratch cycle:</b> ยิ่งคันยิ่งเกา ผิวถูกทำลาย อักเสบเรื้อรัง</li>
</ul>
<div class="tbl"><table>
  <tr><th>ระยะ</th><th>ลักษณะ</th></tr>
  <tr><td>Acute</td><td>erythema, edema, vesicles, oozing/crusting</td></tr>
  <tr><td>Subacute</td><td>แดง + scaling</td></tr>
  <tr><td>Chronic</td><td><b>lichenification</b> (หนาคล้ายหนัง), excoriations</td></tr>
</table></div>
<h3>Severity</h3>
<p>Mild, moderate, severe ด้วย SCORAD, EASI, POEM (ประเมินรอยโรค อาการคัน ผลต่อการนอน)</p>
<ul>
  <li><b>SCORAD</b> (Severity Scoring of Atopic Dermatitis) · PO-SCORAD = ผู้ป่วยประเมินเอง · ใช้ประเมินก่อนและหลังรักษา</li>
  <li>3 ส่วน: <b>Extent (A)</b> พื้นที่ผิว · <b>Intensity (B)</b> 6 อาการแสดง · <b>Subjective (C)</b> คัน และนอนไม่หลับ</li>
</ul>` },
    { id: 'pharm', t: 'Pharmacology', html: `<h3>Topical corticosteroids (TCS)</h3>
<ul>
  <li>จับ glucocorticoid receptor ยับยั้ง phospholipase A2 · <b>first-line ช่วงกำเริบ</b></li>
  <li>MOA: ต้านอักเสบ (ลด cytokine, prostaglandin, leukotriene) · กดภูมิ (ลด T-cell, WBC แทรกซึม) · หดหลอดเลือด (ลดแดง ใช้บ่งชี้ความแรงของยา)</li>
  <li><mark>ใช้ความแรงต่ำสุดที่ได้ผล ระยะสั้นสุด โดยเฉพาะผิวบาง</mark></li>
</ul>
<figure><img data-fig="eczema/p07-1.webp" alt="ตารางจำแนกความแรงของยาทาสเตียรอยด์ class I ถึง VII และตารางยาที่มีในประเทศไทย"><figcaption>ความแรงของยาทาสเตียรอยด์ (class I–VII และตัวที่มีในไทย)</figcaption></figure>
<div class="tbl"><table>
  <tr><th>ความแรง (ไทย)</th><th>ยา</th><th>ชื่อการค้า</th></tr>
  <tr><td>Super-potent</td><td>clobetasol propionate 0.05% · augmented betamethasone dipropionate 0.05%</td><td>Dermovate · Diprotop</td></tr>
  <tr><td>Potent</td><td>betamethasone dipropionate 0.05% (ointment) · desoximetasone 0.25%</td><td>Diprosone ointment · Topicorte, Esperson</td></tr>
  <tr><td>Moderately potent</td><td>betamethasone dipropionate 0.05% (cream) · triamcinolone acetonide 0.1% · mometasone furoate 0.1%* · betamethasone valerate 0.1% · fluocinolone acetonide 0.025% · prednicarbate 0.1%* · triamcinolone acetonide 0.02%</td><td>Diprosone cream · TA cream 0.1%, Aristocort A · Elomet · Betnovate · Synalar · Dermatop · TA cream 0.02%</td></tr>
  <tr><td>Mild</td><td>hydrocortisone 1–2% · prednisolone 0.5%</td><td>Hydrocortisone cream · Prednisil</td></tr>
</table></div>
<p style="font-size:.9em">* ผลข้างเคียงต่ำ · ยาเดียวกันต่างรูปแบบความแรงอาจต่างกัน โดยทั่วไป ขี้ผึ้ง &gt; ครีม &gt; โลชั่น</p>
<h3>Topical calcineurin inhibitors (TCIs)</h3>
<ul>
  <li>Tacrolimus, pimecrolimus จับ FKBP-12 ยับยั้ง calcineurin → NFAT ไม่ทำงาน → ลด IL-2 และ Th1/Th2 cytokines</li>
  <li>โมเลกุลใหญ่ ดูดซึมเข้าระบบน้อย · <mark>ไม่ทำให้ผิวบาง ปลอดภัยกว่าสำหรับใบหน้าและผิวบางระยะยาว</mark> (ไม่ได้แรงกว่า steroid)</li>
  <li>ADR: แสบร้อน/ยิบ ๆ ช่วงสัปดาห์แรก (โดยเฉพาะผู้ใหญ่) หายใน ~1 สัปดาห์ · เลี่ยงแดด · ไม่แนะนำในสตรีมีครรภ์และภูมิบกพร่อง</li>
</ul>
<h3>อื่น ๆ</h3>
<ul>
  <li><b>Topical PDE4 inhibitor (crisaborole):</b> ยับยั้ง PDE4 ลดการสลาย cAMP ลด pro-inflammatory cytokines</li>
  <li><b>Biologics:</b> dupilumab จับ <b>IL-4 receptor α</b> ยับยั้งทั้ง IL-4 และ IL-13 · tralokinumab ยับยั้ง IL-13 โดยตรง</li>
  <li><b>JAK inhibitors:</b> ยับยั้ง JAK1/JAK2 ลด IL-4/IL-13 และ IL-31 · ยาทาสำหรับ mild–moderate เมื่อต้องการ steroid-sparing หรือคันเป็นหลัก ไม่ทำผิวบาง ช่วยคันเร็ว · ADR: แสบ ระคาย ผื่นคล้ายสิว · ความเสี่ยงทั้งระบบ: ใช้พื้นที่จำกัด ไม่ใช้นานแบบไม่ควบคุม เลี่ยงขณะติดเชื้อรุนแรง</li>
  <li><b>Keratolytics:</b> ทำให้ stratum corneum ที่หนานุ่มลง ใช้ในผื่นเรื้อรัง หนา lichenification มือ/เท้า ช่วยยาทาซึมดีขึ้น · urea (5–10% ให้ความชุ่มชื้น, 20–40% ลอกขุย) · salicylic acid 2–6% · lactic acid/ammonium lactate 5–12%</li>
  <li><b>ยาทาแก้คัน (adjunct เท่านั้น ไม่รักษาการอักเสบ):</b> menthol, camphor (เย็น) · pramocaine (แนะนำ), lidocaine (จำกัด) · colloidal oatmeal, calamine, zinc oxide · <b>topical antihistamine ไม่แนะนำ</b> (diphenhydramine ได้ผลน้อย เสี่ยง allergic contact dermatitis)</li>
</ul>` },
    { id: 'tx', t: 'Pharmacotherapy', html: `<figure><img data-fig="eczema/p06-1.webp" alt="AAD recommendations for atopic dermatitis management: nonpharmacologic (moisturizers, bathing additives, wet wrap) และ pharmacologic (topical, systemic, phototherapy)"><figcaption>Recommendations for atopic dermatitis management (AAD)</figcaption></figure>
<h3>Basic care</h3>
<p><b>Moisturizer/emollient</b> อย่างน้อยวันละครั้ง <mark>ทาภายใน 3 นาทีหลังอาบน้ำ (soak and seal)</mark> แบบไม่มีน้ำหอม</p>
<div class="tbl"><table>
  <tr><th></th><th>Wet compress</th><th>Wet wrap therapy</th><th>Occlusive dressing</th></tr>
  <tr><td>วัตถุประสงค์</td><td>ลดอักเสบเฉียบพลัน ทำแผลที่มีน้ำเหลืองให้แห้ง</td><td>คุมอาการกำเริบ ให้ความชุ่มชื้นสูง กันเกา ลดคัน</td><td>กักความชุ่มชื้น ทำผิวหนาให้นุ่ม เพิ่มการดูดซึมยาทา</td></tr>
  <tr><td>เหมาะกับ</td><td>ผื่นเฉียบพลัน <b>มีน้ำเหลืองซึม</b> บวมแดง</td><td>กำเริบปานกลาง–รุนแรง ผื่นแห้ง คันจนนอนไม่ได้</td><td>ผื่นเรื้อรัง <b>ผิวหนา</b> (มือ เท้า)</td></tr>
  <tr><td>วิธี</td><td>ผ้าชุบน้ำหมาด ๆ ชั้นเดียว 15–20 นาที</td><td>ทา moisturizer/ยา + ผ้าเปียกชั้น 1 + ผ้าแห้งทับชั้น 2 (หลายชั่วโมง/ข้ามคืน)</td><td>แรปพลาสติก ถุงมือ หรือแผ่นปิดแผลทับยา</td></tr>
  <tr><td>กลไก</td><td>ความเย็นและการระเหยทำให้หลอดเลือดหด ลดสารคัดหลั่ง</td><td>ชุ่มชื้นล้ำลึก เกราะกันเกา</td><td>ลด TEWL โดยสมบูรณ์</td></tr>
  <tr><td>ระวัง</td><td>ผิวเปื่อยยุ่ยถ้านานไป</td><td>ระคาย เปื่อยยุ่ย ติดเชื้อถ้านานไป</td><td><mark>เพิ่มผลข้างเคียงของ steroid มาก</mark> ห้ามใช้กับแผลเปียกหรือติดเชื้อ</td></tr>
</table></div>
<h3>Topical therapy</h3>
<ul>
  <li><b>TCS:</b> first-line ช่วงกำเริบ วันละ 1–2 ครั้ง ความแรงตามบริเวณ (ผิวบาง/เด็กใช้ต่ำ ผิวหนาใช้สูง)</li>
  <li><b>TCIs:</b> ไม่ตอบสนอง/ห้ามใช้ steroid หรือบริเวณบอบบาง</li>
  <li><mark>Proactive therapy:</mark> หลังผื่นหาย ทา TCS หรือ TCI <b>สัปดาห์ละ 1–2 ครั้ง</b> บริเวณที่เคยเป็นบ่อย ป้องกันกลับเป็นซ้ำ</li>
</ul>
<h3>Systemic therapy (moderate–severe ที่ไม่ตอบสนองต่อยาทา)</h3>
<ul>
  <li><b>Biologics:</b> dupilumab (อายุ ≥ 6 เดือน) หรือ tralokinumab (≥ 12 ปี) ได้ผลสูง ปลอดภัยระยะยาว</li>
  <li><b>Oral JAK inhibitors</b> (abrocitinib, baricitinib, upadacitinib): ทางเลือกถัดมา เฝ้าระวังผลข้างเคียงใกล้ชิด</li>
  <li>Cyclosporine หรือ narrow-band UVB · <b>steroid กิน/ฉีดไม่แนะนำ</b> ยกเว้นฉุกเฉินระยะสั้น</li>
  <li><b>Bleach baths:</b> เสริมใน moderate–severe ไม่แนะนำใน mild</li>
  <li><b>Topical antimicrobials:</b> ไม่แนะนำทาร่วมยาต้านอักเสบถ้าไม่มีการติดเชื้อชัดเจน</li>
</ul>
<figure><img data-fig="eczema/p08-1.webp" alt="สรุปคำแนะนำ AAAAI/ACAAI JTFPP 2023 สำหรับ atopic dermatitis ตามระดับความรุนแรงพร้อมความแรงของคำแนะนำ"><figcaption>AAAAI/ACAAI JTFPP 2023 guidelines</figcaption></figure>
<h3>Herbs & food supplements</h3>
<ul>
  <li><b>Elimination diets ไม่แนะนำ</b> ยกเว้นแพ้อาหารชัดเจน (ได้ประโยชน์น้อย เสี่ยงขาดสารอาหาร และเพิ่ม IgE-mediated food allergy โดยเฉพาะในเด็ก)</li>
  <li>สมุนไพรและอาหารเสริมไม่ได้อยู่ในมาตรฐานการรักษา เน้นความชุ่มชื้นและยาต้านอักเสบ</li>
</ul>` },
  ],
  questions: [
    { q: 'ข้อใดถูกต้องเกี่ยวกับระบาดวิทยาของ atopic dermatitis', o: ['ร้อยละ 85 ของผู้ป่วยเริ่มมีอาการในวัยรุ่น', 'อุบัติการณ์ทั่วโลกลดลงต่อเนื่อง', 'ผู้ป่วยเกือบทั้งหมดหายขาดเมื่อเป็นผู้ใหญ่', 'ร้อยละ 45 ของผู้ป่วยเริ่มมีอาการในช่วงทารก', 'พบในผู้ใหญ่บ่อยกว่าเด็กประมาณ 2 เท่า'], a: 3, e: '45% เริ่มก่อนอายุ 6 เดือน และ 85% ก่อนอายุ 5 ปี · พบในเด็ก (~13%) มากกว่าผู้ใหญ่ (~7%)' },
    { q: 'Cytokine ใดมีบทบาทสำคัญในการกระตุ้น "อาการคัน" ใน atopic dermatitis', o: ['IL-1', 'IL-6', 'IL-17', 'IL-31', 'TNF-alpha'], a: 3, e: 'Type 2 response หลั่ง IL-4, IL-13 และ IL-31 ซึ่ง IL-31 กระตุ้นอาการคัน' },
    { q: 'ผื่นกำเริบบริเวณบอบบาง เช่น ใบหน้า ข้อพับ และต้องการเลี่ยงผิวบางจากสเตียรอยด์ ยากลุ่มใดเหมาะสม', o: ['Topical antifungals', 'Topical calcineurin inhibitors (เช่น tacrolimus)', 'Topical antibiotics (เช่น mupirocin)', 'Keratolytics (เช่น salicylic acid)', 'Topical antihistamines'], a: 1, e: 'TCIs ไม่ทำให้ผิวบาง ปลอดภัยกว่าสำหรับบริเวณผิวบางระยะยาว' },
    { q: 'Proactive therapy เพื่อป้องกันการกำเริบซ้ำของ atopic dermatitis มีหลักการอย่างไร', o: ['กินสเตียรอยด์ขนาดต่ำทุกวันต่อเนื่อง 6 เดือน', 'ทา TCS ความแรงสูงทุกวันบริเวณที่เคยเป็นผื่น', 'ทา TCI หรือ TCS ความแรงปานกลางบริเวณที่มักเป็นผื่น สัปดาห์ละ 1–2 ครั้ง แม้ไม่มีผื่นแล้ว', 'แช่ bleach baths วันละ 3 ครั้งตลอดชีวิต', 'ฉีด dupilumab สัปดาห์ละ 2 ครั้งเพื่อป้องกันผื่น'], a: 2, e: 'หลังผื่นหาย ทา TCS หรือ TCI สัปดาห์ละ 1–2 ครั้งบริเวณที่เคยเป็นบ่อย เพื่อป้องกันการกลับเป็นซ้ำ' },
    { q: 'Dupilumab ที่ใช้รักษา atopic dermatitis ระดับปานกลางถึงรุนแรง มีกลไกอย่างไร', o: ['ยับยั้ง calcineurin', 'ยับยั้ง phosphodiesterase-4 (PDE4)', 'จับ IL-4 receptor alpha ยับยั้งสัญญาณของทั้ง IL-4 และ IL-13', 'ยับยั้งเอนไซม์ JAK', 'จับ IgE ในกระแสเลือดโดยตรง'], a: 2, e: 'Dupilumab จับ IL-4Rα ยับยั้งทั้ง IL-4 และ IL-13 · tralokinumab ยับยั้ง IL-13 โดยตรง' },
  ],
}
