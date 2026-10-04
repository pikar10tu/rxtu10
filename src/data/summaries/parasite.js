// Parasitic infections (หิด เหา พยาธิ) — converted from the RxTU10 class summary PDF (see content/summaries/manifest.json)
export default {
  id: 'parasite',
  date: '28/07/2026',
  refs: [
    'Corvino DFL, Horrall S. Ascariasis. StatPearls; 2023. Available from: https://www.ncbi.nlm.nih.gov/books/NBK430796/',
    'Viswanath A, Yarrarapu SNS, Williams M. Trichuris trichiura infection. StatPearls; 2022. Available from: https://www.ncbi.nlm.nih.gov/books/NBK507843/',
    'Ghodeif AO, Jain H. Hookworm. StatPearls; 2023. Available from: https://www.ncbi.nlm.nih.gov/books/NBK546648/',
    'Rawla P, Sharma S. Enterobius vermicularis. StatPearls; 2023. Available from: https://www.ncbi.nlm.nih.gov/books/NBK536974/',
    'Tobin EH, Meseeha M. Strongyloidiasis. StatPearls; 2026. Available from: https://www.ncbi.nlm.nih.gov/books/NBK436024/',
    'Nogrado K, Adisakwattana P, Reamtong O. Human gnathostomiasis: a review on the biology of the parasite with special reference on the current therapeutic management. Food Waterborne Parasitol. 2023;33:e00207.',
    'Jain H, Gupta N. Toxocariasis. StatPearls; 2023. Available from: https://www.ncbi.nlm.nih.gov/books/NBK537154/',
    'Centers for Disease Control and Prevention. Clinical overview of Opisthorchis. 2024.',
    'UpToDate. Drug information: albendazole, mebendazole, ivermectin (systemic), praziquantel, pyrantel pamoate.',
    'Rosenthal PJ. Pharmacology of the antihelminthic drugs. In: Katzung\'s Basic & Clinical Pharmacology. 16th ed. McGraw Hill; 2024. Chapter 53.',
    'Kuhlmann FM, Fleckenstein JM. Antiparasitic agents. In: Infectious Diseases. 4th ed. Elsevier; 2017. p. 1574-1595.e2.',
    'ประเทือง ภูวัฒนาวิจิตร. เห็บ หิด เหา: การบริบาลทางเภสัชกรรมในบริบทของงานเภสัชกรรมชุมชน. วงการยา (CPE Plus). 2561. Available from: https://www.wongkarnpat.com/upfilecpe/CPE234.pdf',
  ],
  sections: [
    { id: 'nematode', t: 'พยาธิตัวกลม', html: `<div class="tbl"><table>
  <tr><th>โรค</th><th>เชื้อและการติดต่อ</th><th>อาการเด่น</th><th>วินิจฉัย</th></tr>
  <tr><td><b>พยาธิไส้เดือน</b> (Ascariasis)</td><td><i>Ascaris lumbricoides</i> (soil-transmitted) · กินไข่ (embryonated eggs) ในดิน น้ำ อาหาร → ฟักในลำไส้เล็ก ตัวอ่อนเข้ากระแสเลือดไปปอด ไชผ่านถุงลม → pharynx → กลืนกลับลำไส้เล็กเป็นตัวเต็มวัย</td><td>ปวดท้อง ท้องอืด คลื่นไส้ อาเจียน เบื่ออาหาร · <b>Löffler syndrome</b> (transient eosinophilic pneumonitis: ไอ wheeze หอบ ไข้)</td><td>ไข่ในอุจจาระ</td></tr>
  <tr><td><b>พยาธิแส้ม้า</b> (Trichuriasis)</td><td><i>Trichuris trichiura</i> (STH) · fecal-oral กินไข่ → เกาะลำไส้เล็กแล้วไปเกาะผนังลำไส้ใหญ่</td><td>ส่วนใหญ่ไม่มีอาการ · ปวดท้อง ท้องเสีย ท้องผูก · พยาธิเยอะอาจ <b>rectal prolapse</b></td><td>ไข่ในอุจจาระ</td></tr>
  <tr><td><b>พยาธิปากขอ</b> (Hookworm)</td><td><i>Necator americanus</i> (ทั่วโลก), <i>Ancylostoma duodenale</i> · ตัวอ่อนในดิน<b>ไชผ่านผิวหนัง</b> → ปอด → pharynx → ลำไส้เล็ก ใช้ buccal capsule ยึดผนังลำไส้ดูดเลือด</td><td>ผื่นคันที่ผิวที่ไชผ่าน (ground itch) · ผ่านปอด: ระคายคอ ไอ wheeze · ลำไส้: ปวดท้อง คลื่นไส้ ท้องเสีย · เรื้อรัง: <mark>iron deficiency anemia</mark> จากเสียเลือด (อ่อนเพลีย หอบเหนื่อย)</td><td>ไข่ในอุจจาระ</td></tr>
  <tr><td><b>พยาธิเข็มหมุด</b> (Enterobiasis)</td><td>Fecal-oral พบบ่อยในเด็กวัยเรียน แพร่ในครอบครัว · ตัวเมียไชออกมาวางไข่รอบรูก้นตอนกลางคืน · เกาแล้วไข่ติดเล็บเข้าปาก → reinfection/autoinfection</td><td><b>คันรอบรูทวารตอนกลางคืน</b> นอนไม่หลับ หงุดหงิด · เกาบ่อยติดเชื้อแบคทีเรียซ้ำ · หญิงอาจคันอวัยวะเพศ vaginitis หรือ PID</td><td><b>Cellophane tape test</b> หรือ pinworm paddle test</td></tr>
  <tr><td><b>พยาธิเส้นด้าย</b> (Strongyloidiasis)</td><td><i>Strongyloides stercoralis</i> (STH) · ตัวอ่อนในดินไชผ่านผิวหนัง → ปอด → pharynx → ลำไส้เล็ก · <b>เกิด autoinfection ในร่างกายได้</b></td><td>ผื่นนูนแดงเคลื่อนที่ได้ คัน · ไอแห้ง wheeze หอบ · คลื่นไส้ อาเจียน ท้องเสีย ท้องอืด · ภูมิคุ้มกันต่ำอาจเป็น <b>hyperinfection syndrome</b> หรือ disseminated</td><td>ตัวอ่อน (larvae) ในอุจจาระ</td></tr>
  <tr><td><b>พยาธิตัวจี๊ด</b> (Gnathostomiasis)</td><td><i>Gnathostoma spinigerum</i> (พบมากในไทย เวียดนาม ญี่ปุ่น) · กินเนื้อสัตว์ดิบที่มีตัวอ่อนระยะ advanced L3 หรือดื่มน้ำไม่ต้ม → ไชทะลุกระเพาะลำไส้ไปตามเนื้อเยื่อ · คนเป็น accidental host ตัวอ่อนไม่โตเป็นตัวเต็มวัย</td><td>ช่วงแรกปวดลิ้นปี่ คลื่นไส้ ไข้ · <b>cutaneous</b> (พบบ่อยสุด): ผื่นนูนบวมคันหรือเจ็บใต้ผิวหนัง เคลื่อนที่ได้ · ocular: uveitis เลือดออกในตา ตาบอด · <b>neuro</b> (รุนแรงสุด): eosinophilic meningitis, SAH, อัมพาต</td><td>อาการ + ประวัติกินเนื้อดิบ + eosinophilia + specific IgG</td></tr>
</table></div>
<h3>การรักษา</h3>
<div class="tbl"><table>
  <tr><th>โรค</th><th>First line</th><th>ทางเลือก / กรณีพิเศษ</th></tr>
  <tr><td>Ascariasis</td><td><b>Albendazole 400 mg ครั้งเดียว</b></td><td>Mebendazole 100 mg BID 3 วัน หรือ 500 mg ครั้งเดียว · ivermectin 150–200 mcg/kg ครั้งเดียว · <b>คนท้อง: pyrantel pamoate 11 mg/kg (max 1 g) ครั้งเดียว</b></td></tr>
  <tr><td>Trichuriasis</td><td>Mebendazole 100 mg BID 3 วัน · albendazole 200–400 mg BID 3 วัน</td><td>Ivermectin 200 mcg/kg daily</td></tr>
  <tr><td>Hookworm</td><td><b>Albendazole 400 mg ครั้งเดียว</b></td><td>ทางเลือกและคนท้อง: pyrantel pamoate 11 mg/kg daily × 3 วัน (max 1 g/dose)</td></tr>
  <tr><td>Enterobiasis</td><td>Albendazole 400 mg · mebendazole 100 mg · pyrantel pamoate 11 mg/kg (max 1 g) ครั้งเดียว <b>แล้วซ้ำใน 2 สัปดาห์</b></td><td>คนท้อง: pyrantel pamoate</td></tr>
  <tr><td>Strongyloidiasis</td><td><b>Ivermectin 200 mcg/kg/day 2 วัน</b></td><td>Albendazole 400 mg BID 3–7 วัน · hyperinfection: ivermectin 200 mcg/kg daily อย่างน้อย 2 สัปดาห์</td></tr>
  <tr><td>Gnathostomiasis</td><td>Albendazole 400 mg BID 14–21 วัน · ivermectin 200 mcg/kg OD ซ้ำใน 1–2 สัปดาห์</td><td>ผ่าตัดเอาออก</td></tr>
</table></div>
<h3>การป้องกัน</h3>
<ul>
  <li>ล้างมือ ล้างผักผลไม้ ปรุงอาหารสุก ขับถ่ายให้เป็นที่ งดใช้อุจจาระคนที่ไม่ผ่านการบำบัดเป็นปุ๋ย</li>
  <li>พยาธิที่ไชผ่านผิวหนัง (ปากขอ เส้นด้าย): <b>สวมรองเท้า</b>ทุกครั้งที่สัมผัสดิน</li>
  <li>พยาธิเข็มหมุด: ตัดเล็บสั้น ซักผ้าปูที่นอนและชุดนอนด้วยน้ำร้อน <b>รักษาคนในครอบครัวทุกคน</b></li>
  <li>พยาธิตัวจี๊ด: เลี่ยงปลาน้ำจืด กบ งู หมู ดิบหรือไม่สุก ดื่มน้ำต้มหรือกรอง</li>
</ul>` },
    { id: 'cestode', t: 'พยาธิตัวตืดและพยาธิใบไม้ในตับ', html: `<h3>พยาธิตัวตืด</h3>
<ul>
  <li><b>Taeniasis:</b> กินเนื้อหมู (<i>Taenia solium</i>) หรือเนื้อวัว (<i>T. saginata</i>) ไม่สุกที่มีตัวอ่อนระยะ cysticerci → ยึดผนังลำไส้เล็ก โตเป็นตัวเต็มวัยใน 5–12 สัปดาห์ ออกไข่ไปกับอุจจาระ</li>
  <li><b>Cysticercosis / neurocysticercosis:</b> กิน<b>ไข่ของ T. solium</b> โดยตรง (อุจจาระ น้ำ อาหารปนเปื้อน) → embryos เข้ากระแสเลือดไปกล้ามเนื้อ ใต้ผิวหนัง ตา CNS กลายเป็น cysticerci · <b>ไม่เกิดจาก T. saginata</b></li>
  <li>วินิจฉัย: ไข่ในอุจจาระ</li>
</ul>
<div class="tbl"><table>
  <tr><th>ภาวะ</th><th>การรักษา</th></tr>
  <tr><td>Taeniasis</td><td>Praziquantel 5–10 mg/kg ครั้งเดียว · niclosamide 2 g ครั้งเดียว (ผู้ใหญ่) เคี้ยวก่อนกลืน</td></tr>
  <tr><td>Cysticercosis / neurocysticercosis</td><td>Albendazole 15 mg/kg/day แบ่ง BID 8–30 วัน เดี่ยวหรือร่วม praziquantel · <b>ให้ corticosteroid (dexamethasone หรือ prednisolone) ก่อนหรือพร้อมยาถ่ายพยาธิ</b> ลดการอักเสบและสมองบวมจากพยาธิตาย</td></tr>
</table></div>
<p>ป้องกัน: กินเนื้อหมูเนื้อวัวที่สุกทั่วถึง ล้างมือหลังขับถ่ายและก่อนปรุงอาหาร ปรับปรุงสุขาภิบาล</p>
<h3>พยาธิใบไม้ในตับ (Liver flukes)</h3>
<ul>
  <li><b>เชื้อ:</b> <i>Opisthorchis viverrini</i> พบในอีสาน ลาว กัมพูชา เวียดนาม · กินปลาน้ำจืดดิบหรือดอง เค็ม รมควันเล็กน้อย</li>
  <li>ตัวเต็มวัยอยู่ในท่อน้ำดีและถุงน้ำดี วงจรในคน ~4 เดือน ติดเชื้อเรื้อรังได้หลายปี</li>
  <li><b>อาการ:</b> ส่วนใหญ่ไม่มีอาการ · คลื่นไส้ ปวดท้อง ตับโต ท้องเสีย ท้องผูก ไข้ ดีซ่าน · อักเสบเรื้อรังนำไปสู่ <mark>cholangiocarcinoma</mark></li>
  <li>วินิจฉัย: ไข่และพยาธิในอุจจาระ</li>
  <li><b>รักษา:</b> praziquantel 75 mg/kg/day แบ่ง TID 2 วัน · ทางเลือก albendazole 10 mg/kg/day 7 วัน พร้อมอาหาร</li>
  <li>ป้องกัน: เลี่ยงปลาน้ำจืดดิบ ปรุงให้สุก</li>
</ul>` },
    { id: 'drug', t: 'ยาถ่ายพยาธิ', html: `<div class="tbl"><table>
  <tr><th>ยา</th><th>MOA</th><th>ใช้ใน</th><th>ADR</th><th>ข้อห้าม / PK</th></tr>
  <tr><td><b>Albendazole</b></td><td>Active metabolite albendazole sulfoxide ยับยั้งการสร้าง cytoplasmic microtubules</td><td>ไส้เดือน แส้ม้า ปากขอ เข็มหมุด เส้นด้าย ตัวจี๊ด ใบไม้ในตับ ตัวตืด</td><td>ปวดหัว ผมร่วง เอนไซม์ตับเพิ่ม ปวดท้อง คลื่นไส้ อาเจียน</td><td>แพ้ยา · <b>ห้ามในคนท้อง</b> · PB 70% · CYP1A2, 3A4 (minor)</td></tr>
  <tr><td><b>Mebendazole</b></td><td>ยับยั้งการสร้าง microtubules</td><td>ไส้เดือน แส้ม้า เข็มหมุด</td><td>ผื่น ปวดท้อง เบื่ออาหาร ท้องเสีย คลื่นไส้ อาเจียน ผมร่วง SJS/TEN neutropenia</td><td><b>ห้ามในคนท้องและเด็ก &lt; 2 ปี</b> · PB 90–95% · ผ่านตับมาก ขับทางอุจจาระ</td></tr>
  <tr><td><b>Diethylcarbamazine citrate</b></td><td>ไม่ทราบแน่ชัด</td><td>Lymphatic filariasis</td><td>Tachycardia ลมพิษ ปวดท้อง เบื่ออาหาร ท้องเสีย คลื่นไส้ อาเจียน hypersensitivity ปวดกล้ามเนื้อ</td><td>ห้ามใน onchocerciasis และท่อน้ำเหลืองอักเสบ</td></tr>
  <tr><td><b>Ivermectin</b></td><td>จับ chloride channel (glutamate-gated / GABA) → Cl⁻ ไหลเข้า → hyperpolarization → อัมพาต</td><td>ไส้เดือน แส้ม้า เส้นด้าย ตัวจี๊ด (และหิด โลน)</td><td>Ataxia สับสน SJS/TEN Mazzotti reaction tachycardia ปวดท้อง เบื่ออาหาร ท้องผูก อาเจียน</td><td>แพ้ยา · ไม่ใช้ในอายุ &lt; 15 ปี (ตามต้นฉบับ) · PB ~93% (albumin) · CYP3A4 (major)</td></tr>
  <tr><td><b>Niclosamide</b></td><td>รบกวน oxidative phosphorylation และการสร้าง ATP</td><td>พยาธิตัวตืด</td><td>GI distress ปวดหัว ผื่น ไข้</td><td>ห้ามในคนท้องและเด็ก &lt; 2 ปี</td></tr>
  <tr><td><b>Praziquantel</b></td><td>เพิ่ม <b>Ca²⁺</b> ไหลเข้าเซลล์ → กล้ามเนื้อพยาธิหดเกร็งเป็นอัมพาต</td><td>ใบไม้ในตับ ตัวตืด</td><td>ลมพิษ ไม่สบายท้อง คลื่นไส้ มึน ปวดหัว ไข้</td><td>แพ้ยา · <b>ห้ามร่วม strong CYP3A inducers</b> เช่น rifampin · first-pass สูง CYP3A4 (major) · ขับทางปัสสาวะ ~80%</td></tr>
  <tr><td><b>Pyrantel pamoate</b></td><td>หลั่ง acetylcholine และยับยั้ง cholinesterase → depolarizing paralysis</td><td>ไส้เดือน ปากขอ เข็มหมุด · <b>ใช้ในคนท้องได้</b></td><td>(ต้นฉบับระบุ myasthenia gravis)</td><td>ไม่มีข้อห้าม ระวังในโรคตับ · CYP2D6 (minor)</td></tr>
</table></div>` },
    { id: 'ecto', t: 'หิดและเหา', html: `<h3>หิด</h3>
<ul>
  <li><b>ตำแหน่ง:</b> ซอกนิ้วมือ รักแร้ เต้านม สะดือ ก้น อวัยวะเพศ · เด็กพบที่ใบหน้า ศีรษะ ฝ่ามือ ฝ่าเท้า</li>
  <li><b>อาการ:</b> คันมากทั่วตัว <b>ตอนกลางคืน</b> คนใกล้ชิดคันด้วย · อาจคันต่อแม้ตอบสนองต่อการรักษา (hypersensitivity)</li>
  <li><b>รอยโรค:</b> burrows ทางสั้นในชั้นหนังกำพร้า เห็นยาก อาจใช้เลนส์ขยาย · รอยเกาทำให้แยกโรคยาก</li>
  <li><b>ไม่ใช้ยา:</b> ซักเสื้อผ้า ผ้าปูที่นอน ปลอกหมอนที่ &gt; 60°C แล้วทำให้แห้ง</li>
</ul>
<div class="tbl"><table>
  <tr><th>ยา</th><th>วิธีใช้</th></tr>
  <tr><td><b>Permethrin 5% cream</b></td><td>ทาคอถึงปลายเท้า ทิ้งไว้ 8–14 ชม. แล้วล้าง · ไม่หายใช้ซ้ำหลังครั้งแรก 14 วัน</td></tr>
  <tr><td>Lindane 1% lotion</td><td>~30 mL ทาบาง ๆ คอถึงปลายเท้า ทิ้งไว้ 8 ชม. แล้วล้าง ทาซ้ำใน 7 วัน (ฆ่าตัวอ่อนที่เพิ่งฟัก) · ไม่ใช้ในคนท้อง</td></tr>
  <tr><td>Benzyl benzoate 25% emulsion</td><td>อาบน้ำ ถูบริเวณผื่น ทายาให้ทั่ว ทิ้งไว้ 24 ชม. แล้วอาบน้ำ วันรุ่งขึ้นทาซ้ำ</td></tr>
  <tr><td>Sulfur ointment 5–10%</td><td>ทาก่อนนอนทุกวันอย่างน้อย 7 วัน หรือทาทิ้งไว้ทั้งวันต่อเนื่อง 3 วัน · <b>ใช้ในคนท้องได้</b></td></tr>
</table></div>
<p style="font-size:.9em">ต้นฉบับระบุว่า permethrin ไม่ใช้ในคนท้อง แต่สรุปโรคติดต่อทางเพศสัมพันธ์ (แนวทางกรมควบคุมโรค 2567) ให้ใช้ permethrin 5% ในหญิงตั้งครรภ์ได้ (cat B) โดยทิ้งไว้ 2 ชม.</p>
<h3>เหา</h3>
<ul>
  <li><b>ตำแหน่ง:</b> ศีรษะ ท้ายทอย ขมับ มีกลิ่นเหม็น · <b>ไข่เหาเลื่อนไปตามเส้นผมไม่ได้</b> (แยกจากรังแค) · อาจพบที่ขนตา คิ้ว ลำตัว</li>
  <li><b>อาการ:</b> คัน · ที่ลำตัวอาจเป็นผื่น macular หรือ erythematous</li>
  <li><b>ไม่ใช้ยา:</b> หวีเสนียดสางตัวและไข่ · ยานวดผสม formic acid ช่วยให้ไข่หลุด · สางแรงเกินไปผมร่วง เป็นแผล ติดเชื้อซ้ำ</li>
</ul>
<div class="tbl"><table>
  <tr><th>ยา</th><th>วิธีใช้</th></tr>
  <tr><td><b>Permethrin 1% lotion</b></td><td>สระผมให้สะอาด เช็ดแห้ง ชโลมยา 30–60 mL ทิ้งไว้ 10 นาที ล้างออก หวีด้วยหวีเสนียด · ไม่หายใช้ซ้ำหลัง 7–10 วัน</td></tr>
  <tr><td>Lindane 1% shampoo</td><td>ชโลม 30–60 mL บนหนังศีรษะที่แห้ง ขยี้ ทิ้งไว้ 4 นาที ล้างออก · ไม่ใช้ในคนท้อง</td></tr>
  <tr><td>Benzyl benzoate 25% emulsion</td><td>ทาทั่วศีรษะ ทิ้งไว้ 1 วัน (เป็นมากใช้วันละ 2 ครั้ง) วันต่อมาสระ · ครบ 7 วันตรวจซ้ำ ไม่หายทาซ้ำ</td></tr>
  <tr><td>Carbaryl</td><td>ชโลมแชมพูบนผมเปียกหมาด ขยี้เป็นฟอง ทิ้งไว้ 15 นาที ระวังเข้าตา ล้างแล้วสระซ้ำ หวีถี่ขณะเปียก ปล่อยแห้งเอง ห้ามเป่าหรืออบ · ใช้ซ้ำอีกครั้งหลัง 3 วัน</td></tr>
</table></div>
<p>ป้องกัน: สระผมสม่ำเสมอ ไม่ใช้ของส่วนตัวร่วม (ผ้าเช็ดตัว ผ้าห่ม) เลี่ยงสัมผัสคนหรือสัตว์ที่เป็นโรค</p>` },
  ],
  questions: [
    { q: 'กลไกการออกฤทธิ์หลักของ praziquantel ในการฆ่าพยาธิใบไม้และพยาธิตัวตืด คือการเพิ่มการซึมผ่านของไอออนใดเข้าสู่เซลล์พยาธิ ทำให้เกิดอัมพาต', o: ['โซเดียมไอออน (Na⁺)', 'โพแทสเซียมไอออน (K⁺)', 'แคลเซียมไอออน (Ca²⁺)', 'คลอไรด์ไอออน (Cl⁻)', 'แมกนีเซียมไอออน (Mg²⁺)'], a: 2, e: 'Praziquantel เพิ่มการซึมผ่านของ Ca²⁺ เข้าเซลล์กล้ามเนื้อพยาธิอย่างรวดเร็ว กล้ามเนื้อหดตัวรุนแรงจนเป็นอัมพาต' },
    { q: 'ยาถ่ายพยาธิตัวกลมกลุ่ม benzimidazoles เช่น albendazole และ mebendazole ออกฤทธิ์ยับยั้งกระบวนการใดในเซลล์พยาธิเป็นหลัก', o: ['ยับยั้งการรวมตัวของ tubulin (microtubule polymerization)', 'เพิ่มการซึมผ่านของแคลเซียมไอออน (Ca²⁺)', 'กระตุ้น GABA receptor ทำให้กล้ามเนื้อพยาธิคลายตัว', 'ยับยั้งเอนไซม์ acetylcholinesterase', 'ทำลายโครงสร้าง DNA ของพยาธิโดยตรง'], a: 0, e: 'Benzimidazoles ยับยั้งการรวมตัวของ β-tubulin เป็น microtubules พยาธิดูดซึมกลูโคสและส่งสารอาหารในเซลล์ไม่ได้ จนขาดพลังงานและตาย' },
    { q: 'ผู้ป่วยได้รับ ivermectin เพื่อรักษาพยาธิตัวจี๊ด (gnathostomiasis) ข้อใดคือกลไกการออกฤทธิ์ของยานี้', o: ['เปิดช่อง glutamate-gated chloride channels', 'ยับยั้งเอนไซม์ fumarate reductase ในพยาธิ', 'กระตุ้น nicotinic acetylcholine receptors', 'ยับยั้งการสังเคราะห์ microtubules ของพยาธิ', 'เพิ่มการซึมผ่านของ calcium ion'], a: 0, e: 'Ivermectin จับ glutamate-gated chloride channels ในเซลล์ประสาทและกล้ามเนื้อพยาธิ Cl⁻ ไหลเข้าจนเกิด hyperpolarization และอัมพาต' },
    { q: 'มารดาพาลูกวัย 5 ขวบมาพบเภสัชกร เด็กคันก้นมากตอนกลางคืน และพบตัวพยาธิสีขาวคล้ายเส้นด้ายรอบทวารหนัก หากเลือกใช้ mebendazole ควรให้คำแนะนำที่สำคัญที่สุดในการป้องกันการกลับมาเป็นซ้ำอย่างไร', o: ['ให้เด็กรับประทานยาติดต่อกัน 7 วัน', 'ให้เด็กสวมถุงมือขณะนอนหลับทุกคืน', 'ต้มเสื้อผ้าและเครื่องนอนด้วยน้ำร้อนทุกวัน', 'ให้สมาชิกทุกคนในครอบครัวรับประทานยาพร้อมกัน', 'ทายาแก้คันกลุ่ม steroid รอบทวารหนัก'], a: 3, e: 'พยาธิเข็มหมุดติดจากไข่ที่ติดตามสิ่งของ รักษาเฉพาะผู้ป่วยโดยไม่รักษาคนในบ้านมักติดเชื้อซ้ำจากไข่ที่ตกค้าง' },
    { q: 'เภสัชกรต้องการประเมินความปลอดภัยก่อนจ่าย lindane (1% gamma benzene hexachloride) เพื่อรักษาเหา ข้อใดคือข้อห้ามใช้หรือข้อควรระวังที่ถูกต้อง', o: ['ห้ามใช้ในทารกแรกเกิด เด็กน้ำหนักต่ำกว่าเกณฑ์ สตรีมีครรภ์ สตรีให้นมบุตร และผู้ที่มีผิวหนังอักเสบเป็นบริเวณกว้าง', 'ห้ามใช้ในผู้ใหญ่ทุกกรณี แต่ใช้ได้ปลอดภัยในทารกแรกเกิด', 'แนะนำให้ทายาทันทีหลังอาบน้ำเสร็จใหม่ ๆ เพื่อให้ยาซึมผ่านผิวหนังได้ดีขึ้น', 'ใช้ปริมาตรยาต่อครั้งได้สูงสุดถึง 120 mL โดยไม่มีอันตราย', 'ชโลมยาทิ้งไว้บนหนังศีรษะนาน 24 ชั่วโมง แล้วจึงสระออก'], a: 0, e: 'Lindane ห้ามใช้ในทารกแรกเกิด เด็กน้ำหนักต่ำกว่าเกณฑ์ สตรีมีครรภ์ ให้นมบุตร และผิวหนังอักเสบเป็นบริเวณกว้าง · ไม่ควรทาทันทีหลังอาบน้ำเพราะดูดซึมมากขึ้น · แชมพูทิ้งไว้เพียง 4 นาที' },
  ],
}
