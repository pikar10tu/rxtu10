// Vaccine — converted from the RxTU10 class summary PDF (see content/summaries/manifest.json)
// ต้นฉบับมีข้อสอบแต่ไม่มีเฉลย → เฉลยโดยผู้แปลง (keyBy: 'converter')
export default {
  id: 'vaccine',
  date: '28/07/2026',
  refs: [
    'Sangsiri S. Vaccines. Bangkok: Thammasat University; 2023.',
    'สมาคมโรคติดเชื้อในเด็กแห่งประเทศไทย. ตารางการให้วัคซีนในเด็กไทยปกติ พ.ศ. 2558. กรุงเทพฯ; 2558.',
    'สมาคมโรคติดเชื้อแห่งประเทศไทย. คำแนะนำการให้วัคซีนป้องกันโรคสำหรับผู้ใหญ่และผู้สูงอายุ พ.ศ. 2568. กรุงเทพฯ; 2568.',
  ],
  sections: [
    { id: 'strat', t: 'Immunization strategies', html: `<div class="tbl"><table>
  <tr><th></th><th>Passive immunization (รับมา)</th><th>Active immunization (ก่อเอง)</th></tr>
  <tr><td>หลักการ</td><td>ให้ antibody ที่สร้างสำเร็จแล้วเข้าสู่ร่างกาย เพื่อป้องกันหรือรักษาโรคทันที</td><td>กระตุ้น T และ B lymphocytes ของผู้รับให้สร้าง antibody และตอบสนองต่อ antigen</td></tr>
  <tr><td>ลักษณะ</td><td>ป้องกันได้ทันที · เป็นภูมิชั่วคราว · <b>ไม่มี immunological memory</b></td><td>ต้องใช้เวลาสร้างภูมิช่วงแรก · มี memory B &amp; T cells ภูมิอยู่นานหรือตลอดชีวิต · กระตุ้นด้วย booster ได้</td></tr>
  <tr><td>ตัวอย่าง</td><td><b>จากมนุษย์</b> (t½ ~23 วัน, ADR น้อย): IVIG, rabies immune globulin (RIG), HBIG<br><b>จากสัตว์</b> ม้า/แกะ (t½ ~5–7 วัน): เสี่ยง anaphylaxis หรือ serum sickness ต้องทดสอบการแพ้ก่อน เช่น เซรุ่มต้านพิษงู monovalent, polyvalent</td><td>ติดเชื้อตามธรรมชาติ (natural active) · ได้รับวัคซีน (artificial active)</td></tr>
</table></div>` },
    { id: 'types', t: 'ประเภทของวัคซีน', html: `<div class="tbl"><table>
  <tr><th>ประเภท</th><th>ลักษณะ</th><th>ตัวอย่าง</th></tr>
  <tr><td><b>Live-attenuated</b><br>เชื้อเป็นอ่อนแรง</td><td>ลดความรุนแรงของเชื้อ · มีโอกาสกลายพันธุ์กลับมารุนแรง · <mark>ห้ามใช้ในผู้ที่ภูมิคุ้มกันบกพร่องรุนแรงและหญิงตั้งครรภ์</mark></td><td>แบคทีเรีย: BCG, cholera<br>ไวรัส: MMR, MMRV, varicella, zoster, rotavirus, JE, OPV, yellow fever, smallpox</td></tr>
  <tr><td><b>Inactivated (killed)</b><br>เชื้อตายทั้งตัว</td><td>กระตุ้นภูมิได้ต่ำกว่าเชื้อเป็น ต้องฉีดหลายเข็มหรือฉีดกระตุ้น</td><td>แบคทีเรีย: pertussis (wP), cholera, typhoid<br>ไวรัส: IPV, influenza, hepatitis A, rabies, COVID-19 (Sinovac, Sinopharm)</td></tr>
  <tr><td><b>Subunit: polysaccharide</b></td><td>คาร์โบไฮเดรตสายยาวจากผนังเซลล์แบคทีเรีย กระตุ้นผ่าน B cell (T cell independent) · <b>ไม่ได้ผลในเด็ก &lt; 2 ปี</b> → พัฒนาเป็น conjugated (จับกับโปรตีนพาหะ)</td><td>Polysaccharide: PPSV23, meningococcal, typhoid polysaccharide<br>Conjugated: Hib, PCV13, meningococcal</td></tr>
  <tr><td><b>Subunit: surface protein</b></td><td>โปรตีนพื้นผิวเชื้อที่สกัดบริสุทธิ์</td><td>Hepatitis B (HBsAg), acellular pertussis (aP), HPV</td></tr>
  <tr><td><b>Subunit: toxoid</b></td><td>พิษแบคทีเรียที่ทำให้หมดฤทธิ์ด้วยสารเคมีแต่ยังกระตุ้นภูมิได้ · มักผสม adjuvant เช่น เกลืออะลูมิเนียม แคลเซียม</td><td>Tdap, Td, tetanus toxoid (TT), aP</td></tr>
  <tr><td><b>Recombinant viral vector</b></td><td>ใช้ไวรัสที่ไม่ก่อโรคในคนหรือแบ่งตัวไม่ได้ (เช่น adenovirus) เป็นพาหะนำสารพันธุกรรมของเชื้อเป้าหมายเข้าเซลล์ ให้สร้างโปรตีน antigen</td><td>COVID-19 (AstraZeneca, Johnson &amp; Johnson/Janssen)</td></tr>
  <tr><td><b>DNA/RNA</b></td><td>สารพันธุกรรม (เช่น mRNA) ห่อด้วย lipid nanoparticle เซลล์อ่านรหัสแล้วสร้างโปรตีน antigen (เช่น spike protein) · ไม่เสี่ยงติดเชื้อ พัฒนาได้เร็ว · เชื้ออาจกลายพันธุ์หนีภูมิได้</td><td>COVID-19 mRNA (Pfizer-BioNTech, Moderna)</td></tr>
</table></div>
<p style="font-size:.9em">ต้นฉบับใช้หัวข้อ "Live-Bacterial / Live Viral" ในแถววัคซีนเชื้อตายด้วย ซึ่งน่าจะคัดลอกมาจากแถวบน จึงเปลี่ยนเป็น "แบคทีเรีย / ไวรัส"</p>` },
    { id: 'adult', t: 'วัคซีนผู้ใหญ่และผู้สูงอายุ (2568)', html: `<p>อ้างอิงสมาคมโรคติดเชื้อแห่งประเทศไทย พ.ศ. 2568</p>
<div class="tbl"><table>
  <tr><th>วัคซีน</th><th>ตารางการฉีด</th><th>หมายเหตุ</th></tr>
  <tr><td>Tetanus, diphtheria, pertussis</td><td>DTaP: 2/4/6 เดือน, 15–18 เดือน และ 4–6 ปี</td><td>Tdap และ Td ใช้เป็น booster ในผู้ใหญ่</td></tr>
  <tr><td>MMR</td><td>0.5 mL 2 doses SC ห่างกัน 4 สัปดาห์</td><td>ห้ามใช้ในภูมิคุ้มกันบกพร่อง หญิงตั้งครรภ์ CD4 &lt; 200 หรือ &lt; 5%</td></tr>
  <tr><td>Influenza</td><td>อายุ ≥ 18 ปี ปีละ 1 ครั้ง</td><td>มีชนิด 3 และ 4 สายพันธุ์</td></tr>
  <tr><td>COVID-19 (mRNA)</td><td>0.3 mL 1 dose IM ปีละครั้ง</td><td></td></tr>
  <tr><td>Varicella (อีสุกอีใส)</td><td>0.5 mL 2 doses ห่างกัน 4–8 สัปดาห์</td><td>ผู้ที่ไม่เคยเป็นอีสุกอีใสหรืองูสวัด</td></tr>
  <tr><td>Hepatitis A</td><td>0.5 mL 2 doses IM ห่างกัน ≥ 6 เดือน</td><td></td></tr>
  <tr><td>Hepatitis B</td><td>20 mcg 3 doses IM เดือนที่ 0, 1, 6</td><td></td></tr>
  <tr><td>HPV</td><td>HPV2 (16, 18): หญิงอายุ ≥ 9 ปี<br>HPV4 (6, 11, 16, 18): ชายและหญิง 9–45 ปี<br>HPV9: ชายและหญิงอายุ ≥ 9 ปี</td><td></td></tr>
  <tr><td>Pneumococcal</td><td>0.5 mL 1 dose IM</td><td>Conjugated: PCV13, PCV15, PCV20 (ห้ามใช้ในผู้แพ้ diphtheria toxoid) · polysaccharide: PPSV23</td></tr>
  <tr><td>Live-attenuated zoster</td><td>1 dose อายุ ≥ 60 ปี</td><td></td></tr>
  <tr><td>JE</td><td>Live attenuated: 0.5 mL 2 doses SC ห่างกัน 12–24 เดือน<br>Inactivated: 0.5 mL 3 doses IM (2 เข็มแรกห่าง 7–28 วัน เข็ม 3 ที่ 1 ปี)</td><td></td></tr>
  <tr><td>Meningococcal</td><td>ACWY: 1–2 doses · B: 2–3 doses</td><td></td></tr>
  <tr><td>Yellow fever</td><td>0.5 mL 1 dose SC หรือ IM</td><td></td></tr>
  <tr><td>Rabies</td><td><b>PrEP</b> (ผู้เสี่ยงสัมผัสโรค): 0.5 หรือ 1.0 mL IM วันที่ 0 และ 7 · หรือ 0.1 mL ID ที่ต้นแขน 2 ข้าง ข้างละ 1 จุด วันที่ 0 และ 7 (21–28)<br><b>PEP</b> หลังสัมผัสโรค</td><td></td></tr>
  <tr><td>Dengue</td><td><b>CYD-TDV</b> (chimeric yellow fever tetravalent): อายุ 6–45 ปี <mark>ที่เคยเป็นไข้เลือดออกมาก่อน</mark> 3 doses SC เดือน 0/6/12<br><b>TAK-003</b> (tetravalent, live-attenuated): อายุ 4–60 ปี 2 doses SC ห่างกัน 3 เดือน</td><td></td></tr>
</table></div>
<p style="font-size:.9em">ต้นฉบับเขียน varicella เป็น IM และ rabies PrEP แบบ 0.1 mL เป็น SC · ตามคำแนะนำทั่วไป varicella ฉีด SC และ rabies ขนาด 0.1 mL ฉีดเข้าผิวหนัง (ID)</p>` },
    { id: 'child', t: 'วัคซีนเด็กไทย (2558)', html: `<p>แนะนำโดยสมาคมโรคติดเชื้อในเด็กแห่งประเทศไทย 2558</p>
<h3>วัคซีนพื้นฐาน</h3>
<div class="tbl"><table>
  <tr><th>วัคซีน</th><th>ตารางการฉีด</th></tr>
  <tr><td>BCG</td><td>แรกเกิด</td></tr>
  <tr><td>HBV</td><td>แรกเกิด ฉีดให้ครบ 3 dose (dose สุดท้ายไม่เกิน 6 เดือน)</td></tr>
  <tr><td>DTwP</td><td>2/4/6 เดือน · กระตุ้น 18 เดือน และ 4–6 ปี</td></tr>
  <tr><td>OPV</td><td>2/4/6 เดือน · กระตุ้น 18 เดือน และ 4–6 ปี · จากนั้น Td ทุก 10 ปี</td></tr>
  <tr><td>MMR</td><td>9–12 เดือน และ 2 ปีครึ่ง</td></tr>
  <tr><td>JE (inactivated, MBV JE)</td><td>3 doses: 9–18 เดือน / อีก 4 สัปดาห์ / อีก 1 ปี</td></tr>
</table></div>
<h3>วัคซีนเสริม (optional)</h3>
<div class="tbl"><table>
  <tr><th>วัคซีน</th><th>ตารางการฉีด</th></tr>
  <tr><td>DTaP, Tdap</td><td>2/4/6 เดือน · กระตุ้น 18 เดือน และ 4–6 ปี</td></tr>
  <tr><td>IPV</td><td>2/4/6 เดือน · กระตุ้น 18 เดือน และ 4–6 ปี</td></tr>
  <tr><td>Live JE (SA14-14-2)</td><td>2 doses: 9–18 เดือน / อีก 1 ปี</td></tr>
  <tr><td>Hib</td><td>2/4/6 เดือน · กระตุ้น 18 เดือน</td></tr>
  <tr><td>Hepatitis A</td><td>2 doses: อายุ ≥ 1 ปี แล้วเว้น 6–12 เดือน</td></tr>
  <tr><td>Varicella หรือ MMRV</td><td>2 doses: 12–18 เดือน / 4–6 ปี</td></tr>
  <tr><td>Influenza</td><td>อายุ 6 เดือน–18 ปี ปีละครั้ง · ปีแรกฉีด 2 เข็มห่าง 4 สัปดาห์</td></tr>
  <tr><td>PCV (PCV10, PCV13)</td><td>2/4/6 เดือน · กระตุ้น 12–15 เดือน</td></tr>
  <tr><td>Rota</td><td>2/4/6 เดือน</td></tr>
  <tr><td>HPV (bivalent, quadrivalent)</td><td>อายุ 9–26 ปี เน้นเริ่ม 11–12 ปี · 3 doses เดือน 0, 1–2, 6</td></tr>
</table></div>` },
    { id: 'special', t: 'กลุ่มพิเศษ และหลักการบริหารวัคซีน', html: `<h3>หญิงตั้งครรภ์และให้นมบุตร</h3>
<ul>
  <li><b>หญิงตั้งครรภ์ 4 วัคซีน:</b> Tdap, influenza, COVID-19, RSV bivalent</li>
  <li><b>หลีกเลี่ยง:</b> MMR, varicella, OPV, dengue, HPV · ห้ามวัคซีนเชื้อเป็นอ่อนแรง</li>
  <li><b>ให้นมบุตร:</b> ห้ามวัคซีนไข้เลือดออกและ smallpox · ระวังวัคซีนไข้เหลือง</li>
</ul>
<h3>นักท่องเที่ยว</h3>
<div class="tbl"><table>
  <tr><th>วัคซีน</th><th>ใคร</th></tr>
  <tr><td>Typhoid</td><td>ไปประเทศเสี่ยงสูง: เอเชียใต้ อินเดีย เนปาล บังกลาเทศ แอฟริกา</td></tr>
  <tr><td>Cholera</td><td>เข้าพื้นที่ระบาด</td></tr>
  <tr><td>Rabies</td><td>โอกาสสัมผัสโรคสูง เช่น backpacker</td></tr>
  <tr><td>Hepatitis A</td><td>ไปแอฟริกา ลาตินอเมริกา เอเชีย</td></tr>
  <tr><td>Meningococcal</td><td>ไปซาอุดีอาระเบีย · นักเรียนนักศึกษาที่ไป US, UK, EU, AUS</td></tr>
</table></div>
<h3>หลักการบริหารวัคซีน</h3>
<ul>
  <li><b>ตำแหน่ง:</b> กล้ามเนื้อต้นแขน (deltoid) หรือหน้าขา (anterolateral thigh) ในเด็กเล็ก · <b>ไม่แนะนำที่สะโพก</b> ชั้นไขมันหนา ดูดซึมไม่ดี เสี่ยงอันตรายต่อเส้นประสาท sciatic</li>
  <li><b>หลายชนิดพร้อมกัน:</b> ให้วันเดียวกันได้ ฉีดต่างตำแหน่ง · ถ้าแขนเดียวกันเว้นห่าง ≥ 1 นิ้ว (2.5 ซม.)</li>
  <li><b>ห้ามผสมวัคซีนต่างชนิดในกระบอกเดียวกัน</b></li>
</ul>
<div class="key"><strong class="k">ระยะห่างระหว่างวัคซีน</strong>Live + live: ให้วันเดียวกันได้ ถ้าไม่พร้อมกันต้องเว้น ≥ 4 สัปดาห์ · Inactivated + วัคซีนใดก็ได้: ให้พร้อมกัน ก่อน หรือหลังกี่วันก็ได้</div>
<ul>
  <li><b>มาช้ากว่านัด:</b> ฉีดเข็มถัดไปได้เลย <b>ไม่ต้องเริ่มนับหนึ่งใหม่</b></li>
  <li><b>มาเร็วกว่านัด:</b> วัคซีนเชื้อตายให้ก่อนนัดได้ไม่เกิน 4 วัน · วัคซีนเชื้อเป็นไม่แนะนำให้รับก่อนนัด</li>
  <li><b>เฝ้าระวัง:</b> นั่งพักในสถานพยาบาลอย่างน้อย 15–30 นาที สังเกต anaphylaxis</li>
</ul>` },
  ],
  questions: [
    { q: 'ผู้ป่วยได้รับวัคซีน MMR ไปแล้ว ต้องการฉีดวัคซีน varicella ควรเว้นระยะห่างอย่างน้อยกี่สัปดาห์', o: ['ไม่ต้องเว้นระยะห่าง สามารถฉีดต่อได้ทันที', 'อย่างน้อย 1 สัปดาห์', 'อย่างน้อย 2 สัปดาห์', 'อย่างน้อย 4 สัปดาห์', 'อย่างน้อย 8 สัปดาห์'], a: 3, keyBy: 'converter', e: 'MMR และ varicella เป็นวัคซีนเชื้อเป็นทั้งคู่ ถ้าไม่ได้ให้วันเดียวกันต้องเว้นอย่างน้อย 4 สัปดาห์' },
    { q: 'เด็กแรกเกิดต้องฉีดวัคซีนใดต่อไปนี้บ้าง', o: ['BCG', 'HBV', 'HAV', 'BCG และ HBV', 'BCG, HBV และ HAV'], a: 3, keyBy: 'converter', e: 'ตารางวัคซีนเด็กไทย: แรกเกิดฉีด BCG และ HBV · HAV เริ่มอายุ 1 ปีขึ้นไป' },
    { q: 'เด็กหญิงอายุ 10 ปี ไม่เคยติดเชื้อไข้เลือดออกมาก่อน ผู้ปกครองต้องการให้รับวัคซีนป้องกันไข้เลือดออก ข้อใดถูกต้องที่สุด', o: ['ฉีด Tetravalent dengue vaccine (TAK-003) ได้ เนื่องจากอายุอยู่ในช่วง 4–60 ปี และไม่เคยติดเชื้อไข้เลือดออกมาก่อน', 'ฉีด CYD-TDV ได้ เนื่องจากอายุ 6–45 ปี', 'ฉีด CYD-TDV ได้ เนื่องจากไม่เคยติดเชื้อมาก่อน', 'ไม่เคยติดเชื้อมาก่อน จึงเลือกได้ว่าจะฉีด CYD-TDV หรือ TAK-003', 'ไม่สามารถฉีดวัคซีนไข้เลือดออกได้ เนื่องจากยังไม่เคยติดเชื้อมาก่อน'], a: 0, keyBy: 'converter', e: 'TAK-003 ใช้ในอายุ 4–60 ปี ไม่ต้องเคยติดเชื้อมาก่อน · CYD-TDV ใช้เฉพาะผู้ที่เคยเป็นไข้เลือดออกมาก่อน จึงไม่เหมาะกับรายนี้' },
    { q: 'ผู้ป่วยมารับวัคซีนล่าช้ากว่ากำหนด (missed dose) 3 สัปดาห์ ไม่ว่าจะเป็นวัคซีนชนิดใด เภสัชกรควรปฏิบัติอย่างไรตามหลักการบริหารวัคซีน', o: ['ต้องเริ่มฉีดวัคซีนใหม่ทั้งชุดตั้งแต่เข็มแรก', 'ให้วัคซีนเข็มถัดไปต่อจากเข็มเดิมได้เลย โดยไม่ต้องเริ่มนับหนึ่งใหม่', 'ต้องเว้นระยะห่างเพิ่มอีกอย่างน้อย 4 สัปดาห์ก่อนฉีดเข็มถัดไปเสมอ', 'หากเป็นวัคซีนชนิดมีชีวิตต้องเริ่มฉีดใหม่ทั้งชุด แต่ชนิดไม่มีชีวิตไม่ต้อง', 'ขึ้นอยู่กับดุลยพินิจของแพทย์ผู้ฉีดเท่านั้น ไม่มีหลักเกณฑ์ตายตัว'], a: 1, keyBy: 'converter', e: 'มารับช้ากว่ากำหนด ให้ฉีดเข็มถัดไปได้เลย ไม่ต้องเริ่มนับใหม่' },
    { q: 'หญิงตั้งครรภ์ไม่ควรฉีดวัคซีนใด', o: ['MMR', 'HPV', 'Tdap', 'MMR และ HPV', 'HPV และ Tdap'], a: 3, keyBy: 'converter', e: 'หญิงตั้งครรภ์ควรหลีกเลี่ยง MMR (เชื้อเป็น) และ HPV · Tdap เป็นหนึ่งในวัคซีนที่แนะนำให้หญิงตั้งครรภ์' },
  ],
}
