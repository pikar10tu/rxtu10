// Acne vulgaris — converted from the RxTU10 class summary PDF (see content/summaries/manifest.json)
export default {
  id: 'acne',
  date: '27/07/2569',
  refs: [
    'Suittipun Suriya. Acne Pharmacotherapy. PM413 Drug actions and pharmacotherapy in dermatological disease',
    'Reynolds RV, et al. Guidelines of care for the management of acne vulgaris. J Am Acad Dermatol. 2024;90:1006.e1-1006.e30.',
  ],
  sections: [
    { id: 'patho', t: 'Pathogenesis และชนิดของสิว', html: `<p>AAD/NICE: acne = chronic inflammatory condition · มีผลทางจิตใจ คัดกรอง acne dysmorphic disorder</p>
<ol>
  <li><b>Follicular hyperkeratinization:</b> อุดตันเป็น plug</li>
  <li><b>Sebum overproduction:</b> จาก androgen (DHT) และ IGF-1 · DHT, DHEAS จับ androgen receptor บน sebocyte · sebum ขาด linoleic acid → ระคายเคือง → hyperkeratosis · insulin, IGF-1 เพิ่มการสร้างไขมัน</li>
  <li><b>C. acnes colonization</b> (Cutibacterium acnes; เปลี่ยนชื่อจาก P. acnes ปี 2016) anaerobic gram-positive bacillus · biofilm, ROS, TLR-2</li>
  <li><b>Inflammation:</b> อักเสบในทุกระยะ (AAD 2024)</li>
</ol>
<h3>Clinical classification</h3>
<ul>
  <li><b>Non-inflammatory:</b> open comedones (blackheads — melanin oxidation ทำให้ดำ) · closed comedones (whiteheads — กลายเป็นสิวอักเสบได้)</li>
  <li><b>Inflammatory:</b> ขนาดเล็ก &lt; 5 mm: papules (นูนแดง), pustules (หัวหนอง) · nodules &gt; 5 mm (สิวหัวช้าง ลึก เจ็บ เป็นแผลเป็นได้) · cysts (ก้อนลึก)</li>
  <li><b>Microcomedone:</b> ระยะเริ่มต้น มองไม่เห็น เป็นต้นกำเนิดของสิวทุกชนิด <mark>รักษาได้ด้วย retinoids เท่านั้น</mark></li>
</ul>
<figure><img data-fig="acne/p02-3.webp" alt="ตัวอย่างสิว papule, pustule, nodule และ cyst"><figcaption>Papule · Pustule · Nodule · Cyst</figcaption></figure>
<h3>Special forms</h3>
<ul>
  <li><b>Acne conglobata:</b> สิวหัวช้างหลายเม็ดเชื่อมกัน → systemic steroid + isotretinoin</li>
  <li><b>Acne fulminans:</b> <mark>urgent 24-hour referral</mark> ใช้ high-dose systemic steroid</li>
</ul>
<figure><img data-fig="acne/p02-1.webp" alt="Acne conglobata สิวหัวช้างหลายเม็ดเชื่อมกันบนใบหน้า"><figcaption>Acne conglobata</figcaption></figure>
<figure><img data-fig="acne/p02-2.webp" alt="Acne fulminans แผลสะเก็ดและสิวอักเสบรุนแรงบนใบหน้า"><figcaption>Acne fulminans</figcaption></figure>` },
    { id: 'ddx', t: 'Differential diagnosis และความรุนแรง', html: `<ol>
  <li><b>Rosacea:</b> telangiectasia, flushing · รักษา topical metronidazole, ivermectin cream, azelaic acid, low-dose doxycycline, laser</li>
  <li><b>Folliculitis:</b> monomorphic pustules</li>
  <li><b>Perioral dermatitis:</b> ผื่นรอบปาก</li>
  <li><b>Drug-induced acne:</b> monomorphic papules and pustules</li>
</ol>
<figure><img data-fig="acne/p03-1.webp" alt="โรคหน้าแดงเรื้อรัง (rosacea), รูขุมขนอักเสบ (folliculitis), ผื่นรอบปาก (perioral dermatitis)"><figcaption>Rosacea · Folliculitis · Perioral dermatitis</figcaption></figure>
<figure><img data-fig="acne/p03-2.webp" alt="เปรียบเทียบสิวทั่วไปกับสิวจากยา และภาพ steroid acne ที่เป็นตุ่มหน้าตาเดียวกัน"><figcaption>Regular acne เทียบ drug-induced acne (monomorphic)</figcaption></figure>
<p><b>ยาที่ทำให้เกิดสิว:</b> hormones (steroids, androgen, progestin เช่น levonorgestrel, norethindrone) · lithium, phenytoin, carbamazepine · EGFR inhibitors · high-dose vitamin B12, whey protein · immunosuppressants</p>
<h3>Severity</h3>
<ul>
  <li><b>IGA scale:</b> gold standard วัดผลยา (FDA ใช้ใน clinical trial)</li>
  <li><b>NICE 2023:</b> mild–moderate &lt; 34 papules/pustules, ≤ 2 nodules · moderate–severe ≥ 35 papules/pustules, ≥ 3 nodules</li>
  <li><b>AAD:</b> mild = ไม่มี nodule · moderate = หลาย nodules · severe = nodules จำนวนมาก</li>
</ul>
<h3>Risk factors</h3>
<p>พันธุกรรม · androgen สูง · IGF-1 สูง · วัยรุ่น ช่วงก่อนมีประจำเดือน ตั้งครรภ์ PCOS · วัยรุ่นชาย &gt; หญิง / วัยผู้ใหญ่หญิง &gt; ชาย (post-adolescent acne) · high glycemic load · นม · ยา · การกด ความร้อน การเสียดสี เครื่องสำอาง · ความเครียด · ล้างหน้ามากเกิน · อ้วน</p>` },
    { id: 'topical', t: 'ยาทา', html: `<p>Core topical: <b>retinoids, benzoyl peroxide, topical antibiotics</b> · supportive: azelaic acid, salicylic acid, sulfur/resorcinol, clascoterone (ยังไม่มีในไทย) · systemic: oral antibiotics, hormonal, isotretinoin (ไม่มีในร้านยา) · keratolytic = comedolytic</p>
<h3>Topical retinoids (tretinoin, adapalene)</h3>
<ul>
  <li><b>MOA:</b> ทำให้ keratinocyte differentiation ปกติ ป้องกัน microcomedone · anti-inflammatory (กด TLR-2) · remodeling follicular epithelium</li>
  <li><mark>ตัวเดียวที่ป้องกันสิวใหม่ ควรใช้เสมอ (maintenance backbone)</mark></li>
  <li>First line: comedonal, mixed acne, maintenance หลัง systemic therapy</li>
  <li><b>Tretinoin:</b> efficacy สูง ระคายเคืองสูง สลายด้วยแสงเร็ว <b>ถูก BPO oxidize</b> (microsphere technology ทาร่วม BPO ได้) · 0.01%, 0.025% maintenance, 0.05% standard, 0.1%</li>
  <li><b>Adapalene:</b> efficacy สูง ระคายเคืองต่ำ ใช้ร่วม BPO ได้</li>
  <li><b>วิธีใช้:</b> ทากลางคืนบาง ๆ หลังล้างหน้า 15–20 นาที ปริมาณเท่าเมล็ดถั่วทั่วหน้า · retinization phase (สัปดาห์ 1–6) เห่อ ลอก แดง แห้ง · start low go slow: 3 วันครั้ง (2 สัปดาห์) → วันเว้นวัน (2 สัปดาห์) → ทุกวัน · sandwich technique · ใช้ร่วม moisturizer และ sunscreen</li>
  <li>ตั้งครรภ์: หลีกเลี่ยง · เด็ก ≥ 9–12 ปี · DI: topical alcohol, AHA, BHA · rare ADR: contact dermatitis, PIH</li>
</ul>
<h3>Benzoyl peroxide (BPO)</h3>
<ul>
  <li><b>MOA:</b> ปล่อย ROS ฆ่า C. acnes · ป้องกันเชื้อดื้อยา · anti-inflammatory · mild keratolytic/comedolytic</li>
  <li><mark>Antimicrobial backbone ใช้ร่วมกับ antibiotic เสมอ</mark> ใช้ทั้ง first line และ maintenance</li>
  <li>gel/cream 2.5%, gel wash 5% · <b>2.5% ได้ผลเท่าความแรงสูงกว่า</b> แต่ระคายเคืองน้อยกว่า</li>
  <li>ADR: แดง แห้ง ระคายเคือง (2 สัปดาห์แรก) · ทำผ้าซีด · ไม่ใช้ร่วม tretinoin หรือ antioxidant (vit C) · ทาทั่วบริเวณที่เป็น</li>
</ul>
<div class="tbl"><table>
  <tr><th>วิธีใช้ BPO</th><th>Contact time</th><th>Efficacy</th><th>Irritation</th><th>เหมาะกับ</th></tr>
  <tr><td>Leave-on</td><td>หลายชั่วโมง</td><td>สูง</td><td>ปานกลาง–สูง</td><td>ผิวมัน สิวปานกลาง</td></tr>
  <tr><td>Wash</td><td>30–60 วินาที</td><td>ปานกลาง</td><td>ต่ำ–ปานกลาง</td><td>สิวที่ลำตัว</td></tr>
  <tr><td>Short-contact</td><td>5–15 นาที</td><td>ปานกลาง</td><td>ต่ำ</td><td>ผิวแพ้ง่าย/เริ่มใช้</td></tr>
</table></div>
<h3>Topical antibiotics (clindamycin, erythromycin)</h3>
<ul>
  <li>ยับยั้ง protein synthesis (50S) ฆ่า C. acnes · <b>ไม่มีผลต่อ comedone</b></li>
  <li>Mild–moderate inflammatory acne · <mark>ใช้ร่วม BPO เสมอ</mark></li>
  <li>ทาวันละ 1–2 ครั้งจนดีขึ้น ไม่เกิน 8–12 สัปดาห์ · ไม่ใช้ร่วม topical antibiotic อื่น · ไม่ใช้เป็น maintenance (maintenance ใช้ retinoid)</li>
</ul>
<p><b>Metronidazole gel:</b> anti-inflammatory เหมาะกับ rosacea, perioral dermatitis <b>ไม่เหมาะกับสิว</b> ใช้ร่วมกันแดด</p>
<h3>Supportive agents</h3>
<div class="tbl"><table>
  <tr><th>ยา</th><th>MOA</th><th>บทบาท / วิธีใช้</th></tr>
  <tr><td><b>Azelaic acid</b> 15–20% (Skinoren)</td><td>antibacterial, comedolytic, <b>depigmenting</b> (ลดฝ้า กระ รอยสิว)</td><td>สิวร่วมรอยดำ, <mark>สิวในหญิงตั้งครรภ์ (cat B)</mark>, acne-rosacea · ใช้ maintenance ได้ · onset ช้า 6–8 สัปดาห์ · ADR ลอก แสบ คัน</td></tr>
  <tr><td><b>Salicylic acid</b> 0.5–2% (BHA)</td><td>comedolytic, exfoliation</td><td>ทาวันละครั้ง · &gt; 2% ระคายมากขึ้นแต่ไม่ได้ผลเพิ่ม · เด็กไม่ทาบริเวณกว้าง · rare salicylism</td></tr>
  <tr><td><b>Sulfur</b></td><td>weak antibacterial/antifungal, keratolytic, oil control</td><td>ทางเลือกเมื่อทน retinoid/BPO ไม่ได้ ผิวแพ้ง่าย สิวน้อยผิวมัน · ทนดีแต่ efficacy ไม่สูง · กลิ่นไม่ดี</td></tr>
  <tr><td><b>Resorcinol</b> (แป้งน้ำศิริราช)</td><td>comedolytic, antiseptic</td><td>ทางเลือกเมื่อทน retinoid/BPO ไม่ได้ ใช้ร่วม sulfur · ไม่เกิน 2 สัปดาห์ ไม่ใช้ระยะยาวเดี่ยว</td></tr>
  <tr><td><b>AHA</b> (glycolic 3–10%, lactic 3–5%, mandelic 5–10%)</td><td>superficial exfoliation</td><td>mild comedonal acne, maintenance · 2–3 ครั้ง/สัปดาห์ · ใช้มากเกินสิวแย่ลง</td></tr>
</table></div>` },
    { id: 'systemic', t: 'Oral antibiotics, hormone, isotretinoin', html: `<h3>Oral antibiotics</h3>
<ul>
  <li>Moderate–severe inflammatory acne · <mark>ระยะสั้น 8–12 สัปดาห์ ขนาดต่ำสุดที่ได้ผล</mark> · ใช้ร่วม topical retinoid ± BPO เสมอ · reassess ที่ 2–3 เดือน</li>
</ul>
<div class="tbl"><table>
  <tr><th>Class</th><th>ยา</th><th>ตำแหน่ง</th><th>ADR หลัก</th></tr>
  <tr><td>Tetracyclines</td><td>doxycycline, minocycline, sarecycline</td><td>First-line</td><td>photosensitivity, GI upset, esophagitis · minocycline: vertigo, pigmentation, autoimmune</td></tr>
  <tr><td>Macrolides</td><td>azithromycin, erythromycin</td><td>Second-line</td><td>GI upset, QT prolongation</td></tr>
  <tr><td>Folate inhibitors</td><td>TMP-SMX</td><td>Reserve</td><td>severe skin reactions</td></tr>
  <tr><td>Beta-lactams</td><td>amoxicillin, cephalexin</td><td>Special cases</td><td>allergy</td></tr>
  <tr><td>Sub-antimicrobial doxy</td><td>doxycycline 40 mg</td><td>Maintenance/overlap</td><td></td></tr>
</table></div>
<ul>
  <li><b>Tetracyclines:</b> ยับยั้ง 30S ฆ่า C. acnes ต้านอักเสบ · moderate–severe, truncal acne, topical ล้มเหลว · tetracycline 500–1,000 mg/d (ไม่นิยม) · <b>doxycycline 100–200 mg/d</b> กินพร้อมอาหาร ดื่มน้ำมาก ห้ามนอนราบ 30 นาที</li>
  <li><b>Macrolides:</b> ยับยั้ง 50S ต้านอักเสบ · ใช้เมื่อทน tetracycline ไม่ได้ ตั้งครรภ์ วัยรุ่น · ดื้อยาสูง relapse หลังหยุด · azithromycin: 500 mg OD 3 วัน/สัปดาห์ 8–12 สัปดาห์ หรือ 250–500 mg วันเว้นวัน 8–12 สัปดาห์ หรือ 500 mg OD 3 วัน เว้น 7–10 วัน แล้วเริ่มรอบใหม่</li>
  <li><b>Beta-lactams:</b> ยับยั้ง cell wall bactericidal ฤทธิ์ต่อ C. acnes อ่อน · ตั้งครรภ์ ทน tetracycline/macrolide ไม่ได้ bridge ชั่วคราว · ไม่มีฤทธิ์ต้านอักเสบ ไม่ใช้ในสิวน้อย · amoxicillin 500 mg BID, amoxicillin-clavulanate 500/125 mg BID (ใช้น้อย), cephalexin 500 mg BID</li>
  <li><b>DI:</b> tetracycline + antacid/iron (ดูดซึมลด) · <mark>tetracycline + isotretinoin → intracranial hypertension</mark> · macrolide + ยา QT prolong · TMP-SMX + warfarin (INR↑)</li>
</ul>
<h3>Hormone therapy</h3>
<p>ลดฤทธิ์ androgen → ลดน้ำมัน · สิวบริเวณหน้าล่าง adult onset ดื้อ antibiotic PCOS · ใช้ topical retinoid + BPO เป็น maintenance</p>
<div class="tbl"><table>
  <tr><th>กลุ่ม</th><th>ตัวอย่าง</th><th>บทบาท</th></tr>
  <tr><td>COCs (standard)</td><td>EE + drospirenone, norgestimate</td><td>First-line</td></tr>
  <tr><td>COCs (anti-androgen)</td><td>Diane-35 (EE + cyproterone)</td><td>Second-line · เสี่ยง VTE สูง</td></tr>
  <tr><td>Anti-androgen</td><td>spironolactone</td><td>Adjunct/alternative</td></tr>
</table></div>
<ul>
  <li><b>COCs:</b> หญิง ≥ 14 ปี moderate–severe/refractory มีลักษณะ hormone ไม่มีข้อห้าม (migraine with aura, ตั้งครรภ์) · ADR: N/V คัดเต้านม ปวดหัว VTE · ดีขึ้นใน 2–3 เดือน ถือว่าล้มเหลวเมื่อไม่ตอบสนองใน 6 เดือน</li>
  <li><b>Spironolactone:</b> ทน COCs ไม่ได้ · 25 → 50 → 100 mg/d titrate ทุก 4–6 สัปดาห์ (max 200) · ADR: คัดเต้านม เวียนหัว ประจำเดือนไม่ปกติ · DI: ACEI/ARB, NSAIDs, potassium, drospirenone</li>
  <li><b>COCs + spironolactone 50–100 mg:</b> แนะนำใน PCOS</li>
</ul>
<h3>Isotretinoin</h3>
<ul>
  <li><mark>ตัวเดียวที่ได้ผลครบทั้ง 4 กลไก</mark>: ลด sebum, keratolytic, ฆ่า C. acnes, ต้านอักเสบ</li>
  <li><b>ข้อบ่งใช้:</b> severe nodular acne, acne with scarring, ดื้อการรักษา &gt; 6 เดือน, ความทุกข์ทางใจรุนแรง</li>
  <li><b>C/I:</b> แพ้ยา, ตั้งครรภ์/ให้นมบุตร, คุมกำเนิดไม่ได้ · ระวัง: ประวัติซึมเศร้า โรคตับ ไขมันสูง IBD</li>
  <li><b>Dose:</b> 0.5–1 mg/kg/d · target cumulative dose 120–150 mg/kg</li>
  <li>ก่อนเริ่ม: pregnancy test (× 2), ALT/AST, lipid profile, CBC (±), ประเมินซึมเศร้า</li>
  <li>กินพร้อมอาหารไขมัน เวลาเดิมทุกวัน · <b>คุมกำเนิด 2 วิธี</b> ห้ามบริจาคเลือดขณะใช้และ 30 วันหลังหยุด · teratogenic สูงมาก (cat X) · เลี่ยงแอลกอฮอล์และวิตามิน A</li>
  <li>ADR: แห้ง (ผิว ตา ปาก), photosensitivity, myalgia</li>
</ul>` },
    { id: 'summary', t: 'สรุปการเลือกยา', html: `<div class="tbl"><table>
  <tr><th>ภาวะ</th><th>ยา</th></tr>
  <tr><td>Maintenance</td><td>topical retinoids (+ sunscreen + moisturizer)</td></tr>
  <tr><td>Comedonal acne</td><td>topical retinoids, BHA หรือ AHA</td></tr>
  <tr><td>Mild inflammatory</td><td>topical antibiotic + BPO</td></tr>
  <tr><td>Moderate–severe inflammatory</td><td>oral antibiotics (&lt; 12 สัปดาห์) + BPO</td></tr>
  <tr><td>Moderate–severe ร่วม scarring/ภาระทางใจ</td><td>oral isotretinoin</td></tr>
  <tr><td>Acne with pigmentation</td><td>azelaic acid</td></tr>
  <tr><td>Rosacea</td><td>metronidazole gel</td></tr>
  <tr><td>Lower-face acne / PCOS</td><td>hormone therapy</td></tr>
</table></div>
<div class="tbl"><table>
  <tr><th>กลุ่มยา</th><th>Keratinization</th><th>Sebum</th><th>Bacteria</th><th>Inflammation</th></tr>
  <tr><td>Retinoids</td><td><b>Yes (primary)</b></td><td>No</td><td>Indirectly</td><td><b>Yes</b></td></tr>
  <tr><td>Benzoyl peroxide</td><td>Mildly</td><td>No</td><td><b>Yes (primary)</b></td><td>Indirectly</td></tr>
  <tr><td>Antibiotics</td><td>No</td><td>No</td><td><b>Yes</b></td><td><b>Yes</b></td></tr>
  <tr><td>Hormonal</td><td>No</td><td><b>Yes (primary)</b></td><td>No</td><td>No</td></tr>
  <tr><td>Isotretinoin (oral)</td><td><b>Yes</b></td><td><b>Yes</b></td><td><b>Yes</b></td><td><b>Yes</b></td></tr>
</table></div>
<div class="tbl"><table>
  <tr><th>กลุ่มผู้ป่วย</th><th>ยาที่ควรใช้</th><th>ยาที่ควรเลี่ยง</th></tr>
  <tr><td>ตั้งครรภ์</td><td>azelaic acid, BPO, clindamycin (topical)</td><td>retinoids, tetracyclines, spironolactone</td></tr>
  <tr><td>เด็กก่อนวัยรุ่น (&lt; 9 ปี)</td><td>BPO, topical retinoids (บางตัว)</td><td>tetracyclines</td></tr>
  <tr><td>ผิวคล้ำ</td><td>azelaic acid, adapalene, sunscreen</td><td>scrub แรง ๆ (เสี่ยง PIH)</td></tr>
  <tr><td>หญิงวัยผู้ใหญ่</td><td>spironolactone, COCs, clascoterone</td><td>antibiotic เดี่ยวระยะยาว</td></tr>
  <tr><td>รุนแรง/ดื้อการรักษา</td><td>oral isotretinoin</td><td>การรอช้า (เสี่ยงแผลเป็น)</td></tr>
</table></div>
<figure><img data-fig="acne/p16-1.webp" alt="AAD 2024 management of acne vulgaris: topical treatments, systemic antibiotics, hormonal agents, isotretinoin"><figcaption>Management of acne vulgaris (AAD 2024)</figcaption></figure>` },
  ],
  questions: [
    { q: 'ผู้ป่วยได้ topical clindamycin 1% gel วันละ 2 ครั้ง แพทย์ไม่ได้สั่งยาอื่นร่วม เภสัชกรควรแนะนำอย่างไร', o: ['เหมาะสมแล้ว ไม่ต้องปรับ', 'ควรเพิ่ม topical benzoyl peroxide', 'ควรเพิ่ม oral erythromycin', 'ควรหยุด doxycycline และใช้ topical antibiotic อย่างเดียว'], a: 1, e: 'ทั้ง topical และ oral antibiotic ไม่ควรใช้เดี่ยวเพราะเพิ่มการดื้อยา การเพิ่ม BPO เหมาะสมที่สุด' },
    { q: 'ข้อใด "ไม่ถูกต้อง" เกี่ยวกับการใช้ antibiotics ใน acne vulgaris', o: ['Oral antibiotic ควรใช้ร่วมกับ topical BPO', 'Topical antibiotic monotherapy ไม่แนะนำ', 'Oral antibiotic ควรใช้ต่อเนื่องจนสิวหายสนิทโดยไม่จำกัดระยะเวลา', 'ควร reassess การรักษาภายใน 3–4 เดือน'], a: 2, e: 'Oral antibiotic ควรใช้ไม่เกิน 8–12 สัปดาห์' },
    { q: 'หญิง 22 ปี ตั้งครรภ์ 10 สัปดาห์ มี mild inflammatory acne ทางเลือกใดเหมาะสมที่สุด', o: ['Topical adapalene', 'Oral doxycycline', 'Oral isotretinoin', 'Topical benzoyl peroxide'], a: 3, e: 'BPO ค่อนข้างปลอดภัยในหญิงตั้งครรภ์ ส่วน topical retinoids, tetracyclines และ isotretinoin ควรหลีกเลี่ยง' },
    { q: 'หญิง 23 ปี กิน isotretinoin 1 เดือน มีปวดศีรษะ ตาพร่ามัว คลื่นไส้ พบว่าได้ doxycycline จากคลินิกใกล้บ้านร่วมด้วย ข้อใดอธิบายได้ดีที่สุด', o: ['Intracranial hypertension', 'Drug-induced lupus', 'Acute hepatic failure', 'Stevens-Johnson syndrome'], a: 0, e: 'Isotretinoin ห้ามใช้ร่วม tetracyclines เพราะเพิ่มความเสี่ยง intracranial hypertension' },
    { q: 'ข้อใดเป็นข้อบ่งใช้ที่เหมาะสมของ oral isotretinoin', o: ['Acne with pigmentation', 'Acne with scarring', 'Severe acne หรือ acne ที่ไม่ตอบสนองต่อการรักษามาตรฐาน', 'ถูกทั้ง B และ C'], a: 3, e: 'แนะนำอย่างมากใน severe acne, acne with scarring หรือ acne ที่ไม่ตอบสนองต่อ topical และ oral therapies' },
  ],
}
