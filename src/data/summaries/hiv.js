// HIV infection — converted from the RxTU10 class summary PDF (see content/summaries/manifest.json)
export default {
  id: 'hiv',
  date: '25/07/2026',
  refs: [
    'Ruxrungtham K, et al. Thailand National Guidelines on HIV/AIDS Treatment and Prevention 2021/2022. Nonthaburi: Division of AIDS and STIs, Department of Disease Control; 2022. Available from: https://www.thaiaidssociety.org/wp-content/uploads/2023/03/HIV-AIDS-Guideline-2564_2565_ED2.pdf',
    'CIMwebsite. Review Thai HIV/AIDS guidelines ปี 2025 [Facebook]. 2025 Aug 28.',
    'กองโรคเอดส์และโรคติดต่อทางเพศสัมพันธ์ กรมควบคุมโรค. ระบบสารสนเทศระบาดวิทยาโรคเอชไอวี (Thailand Spectrum-AEM).',
  ],
  sections: [
    { id: 'def', t: 'นิยามและระบาดวิทยา', html: `<p><b>HIV</b> เป็นไวรัสในกลุ่ม lentivirus (single-stranded positive-sense RNA) ทำลายระบบภูมิคุ้มกัน · เข้าจับและทำลาย <b>CD4 T cells</b> → CD4 ลดลง → ภูมิคุ้มกันบกพร่อง ติดเชื้อฉวยโอกาสง่าย</p>
<ul>
  <li><b>HIV-1:</b> สายพันธุ์หลักทั่วโลก (&gt; 95%) แพร่ง่ายกว่า รุนแรงกว่า</li>
  <li><b>HIV-2:</b> พบมากในแอฟริกาตะวันตก แพร่ยากกว่า ดำเนินโรคช้ากว่า</li>
</ul>
<p><b>ทั่วโลก:</b> ผู้ติดเชื้อ ~41 ล้านคน · รายใหม่ ~1.2 ล้านคน · เสียชีวิต 5.7 แสนคน · ระบาดหนักสุดที่แอฟริกา</p>
<p><b>ไทย:</b> ผู้ติดเชื้อ ~5 แสนคน · รายใหม่ ~7,000–9,000 คน/ปี · กลุ่มติดใหม่เยอะคือเยาวชน 15–24 ปี · กลุ่มเสี่ยงหลัก: ชายรักชาย (MSM), หญิงข้ามเพศ, ผู้ใช้ยาฉีด, พนักงานบริการ</p>
<figure><img data-fig="hiv/p01-1.webp" alt="อินโฟกราฟิกสถานการณ์เอชไอวีไทย ปี 2567: ผู้ติดเชื้อที่ยังมีชีวิต 565,598 คน กำลังรับยา 495,813 คน เสียชีวิต 9,067 คน รายใหม่ 8,124 คน ช่องทางติดเชื้อส่วนใหญ่คือเพศสัมพันธ์ระหว่างชาย"><figcaption>สถานการณ์เอชไอวีในประเทศไทย ปี 2567 (Thailand Spectrum-AEM)</figcaption></figure>
<h3>การติดต่อ</h3>
<ul>
  <li><b>ติดผ่าน:</b> เพศสัมพันธ์ · เข็มฉีดยา/เลือด · แม่สู่ลูก (ตั้งครรภ์ คลอด ให้นม)</li>
  <li><b>ไม่ติดผ่าน:</b> น้ำตา น้ำลาย เหงื่อ อากาศ น้ำ ห้องน้ำ แมลง/สัตว์กัด</li>
</ul>
<p><b>ปัจจัยเสี่ยง:</b> เพศสัมพันธ์ไม่ใส่ถุงยาง (ช่องคลอด/ทวารหนัก) · เป็น STIs อยู่ · ดื่มเหล้าหรือใช้ยาเสพติดร่วมกับเพศสัมพันธ์ · ใช้เข็มหรืออุปกรณ์เสพยาร่วมกัน · รับเลือด อวัยวะ หรือการฉีดยาที่ไม่ปลอดภัย</p>` },
    { id: 'clin', t: 'อาการและการวินิจฉัย', html: `<div class="tbl"><table>
  <tr><th>ระยะ</th><th>ลักษณะ</th></tr>
  <tr><td><b>Acute</b><br>2–4 สัปดาห์หลังรับเชื้อ</td><td>คล้ายไข้หวัดใหญ่: ไข้ หนาวสั่น เจ็บคอ ปวดหัว ผื่นนูนแดง ต่อมน้ำเหลืองโต อ่อนเพลีย ปวดเมื่อย · อาจมีแผลที่เยื่อบุ (ปาก อวัยวะเพศ) · เลือด: เกล็ดเลือดต่ำ WBC ต่ำ lymphocyte ต่ำ</td></tr>
  <tr><td><b>Chronic</b><br>หลายปี</td><td>ส่วนใหญ่ไม่มีอาการ แต่ CD4 ต่ำลงและ VL สูงขึ้นเรื่อย ๆ · ถ้ามีอาการ: น้ำหนักลดไม่ทราบสาเหตุ ท้องเสียเรื้อรัง เชื้อรา (ฝ้าขาวในปาก/ช่องคลอด) เซลล์ปากมดลูกผิดปกติ ชาปลายมือปลายเท้า</td></tr>
  <tr><td><b>AIDS</b></td><td>ระยะสุดท้าย <b>CD4 &lt; 200 cells/mm³ (หรือ &lt; 14%)</b> หรือมี AIDS-defining condition (OI) ซึ่งถือเป็นเอดส์ทันทีแม้ CD4 ยังไม่ต่ำกว่า 200</td></tr>
</table></div>
<h3>การวินิจฉัย</h3>
<p><b>Window period</b> = ช่วงที่ยังตรวจไม่พบเชื้อ ผลเป็นลบ · นิยมใช้ <b>Gen 4</b> (HIV Ag/anti-HIV) ตรวจพบได้ที่ 2 สัปดาห์ · <b>NAT</b> (HIV RNA) ตรวจพบได้ที่ 7–10 วัน</p>
<div class="tbl"><table>
  <tr><th>รุ่น</th><th>แอนติเจน</th><th>ตรวจหา</th><th>หลักการ</th><th>ความไว</th><th>ความจำเพาะ</th><th>Window period</th></tr>
  <tr><td>1st</td><td>Virus-infected cell lysate</td><td>IgG anti HIV-1</td><td>Indirect</td><td>99%</td><td>95–98%</td><td>8–10 สัปดาห์</td></tr>
  <tr><td>2nd</td><td>Lysate &amp; recombinant</td><td>IgG anti HIV-1 &amp; HIV-2</td><td>Indirect</td><td>&gt; 99.5%</td><td>&gt; 99%</td><td>4–6 สัปดาห์</td></tr>
  <tr><td>3rd</td><td>Recombinant &amp; synthetic peptide</td><td>Anti HIV-1, HIV-2, HIV-1 group O</td><td>Sandwich</td><td>&gt; 99.5%</td><td>99.5%</td><td>2–3 สัปดาห์</td></tr>
  <tr><td>4th</td><td>Recombinant &amp; synthetic peptide</td><td>Anti HIV-1, HIV-2, group O + <b>HIV-1 p24 Ag</b></td><td>Sandwich</td><td>&gt; 99.8%</td><td>99.5%</td><td>2 สัปดาห์</td></tr>
  <tr><td>5th</td><td>Recombinant &amp; synthetic peptide</td><td>IgG/IgM anti HIV-1, HIV-2, group O + p24 Ag (แยกผล)</td><td>Sandwich</td><td>100%</td><td>99.5%</td><td>2 สัปดาห์</td></tr>
</table></div>
<figure><img data-fig="hiv/p03-2.webp" alt="กราฟระดับ HIV RNA, p24 antigen และ antibody หลังติดเชื้อ เทียบวันที่ชุดตรวจแต่ละรุ่นตรวจพบ: NAT เร็วสุด ตามด้วย 4th gen, 3rd, 2nd, 1st"><figcaption>ช่วงเวลาที่ชุดตรวจแต่ละรุ่นเริ่มตรวจพบ</figcaption></figure>
<figure><img data-fig="hiv/p04-1.webp" alt="แผนภูมิการตรวจวินิจฉัย HIV ด้วยชุดตรวจ A1, A2, A3: บวกทั้งสามชุดรายงาน Anti-HIV positive, ผลไม่ตรงกันรายงานสรุปผลไม่ได้และพิจารณาตรวจ NAT"><figcaption>แนวทางการตรวจวินิจฉัย</figcaption></figure>
<ul>
  <li><b>A1</b> = 4th generation (antigen + antibody) ไวสูงสุด ใช้คัดกรอง</li>
  <li><b>A2</b> = ตรวจได้ทั้ง antigen และ antibody หรือเฉพาะ antibody</li>
  <li><b>A3</b> = ตรวจ antibody อย่างเดียว · A2, A3 จำเพาะกว่า A1 ใช้ยืนยัน</li>
  <li>A1, A2, A3 ต้องใช้ antigen สำหรับตรวจ antibody <b>แตกต่างกัน</b></li>
</ul>
<div class="key"><strong class="k">สรุปว่าติดเชื้อ HIV</strong>ต้องได้ผลบวกครบทั้ง 3 ชุดตรวจ</div>` },
    { id: 'cycle', t: 'วงจรชีวิตและเป้าหมายของยา', html: `<figure><img data-fig="hiv/p05-1.webp" alt="วงจรชีวิต HIV-1 ตั้งแต่ binding, fusion, reverse transcription, integration, replication, assembly ถึง budding และ maturation"><figcaption>Replicative cycle of HIV-1</figcaption></figure>
<div class="tbl"><table>
  <tr><th>ขั้นตอน</th><th>เกิดอะไรขึ้น</th><th>ยาที่ยับยั้ง</th></tr>
  <tr><td>1. Binding</td><td>gp120 จับ CD4 receptor และ co-receptor (CCR5/CXCR4)</td><td>Post-attachment inhibitor, CCR5 inhibitor</td></tr>
  <tr><td>2. Fusion</td><td>Envelope หลอมกับเยื่อหุ้มเซลล์ ส่ง RNA และเอนไซม์เข้าเซลล์</td><td>Fusion inhibitor</td></tr>
  <tr><td>3. Reverse transcription</td><td>Reverse transcriptase เปลี่ยน viral RNA เป็น DNA</td><td>NRTIs, NNRTIs</td></tr>
  <tr><td>4. Integration</td><td>Integrase แทรก viral DNA เข้า DNA มนุษย์</td><td>INSTIs</td></tr>
  <tr><td>5. Replication</td><td>ถอดรหัสสร้าง genome RNA และ mRNA</td><td></td></tr>
  <tr><td>6. Assembly</td><td>ประกอบเป็นไวรัสใหม่ (immature)</td><td></td></tr>
  <tr><td>7. Budding &amp; maturation</td><td>ไวรัสหลุดออกจากเซลล์ ตัด polypeptide เป็นโปรตีนสมบูรณ์ → mature HIV</td><td>Protease inhibitors, capsid inhibitors</td></tr>
</table></div>` },
    { id: 'arv', t: 'ยาต้านไวรัส (ARV)', html: `<h3>1. NRTIs</h3>
<p>แข่งจับ reverse transcriptase แทน nucleotide จริง แทรกเข้า viral DNA · ไม่มีหมู่ 3'-OH → <b>DNA chain termination</b> · เป็น prodrug (ต้องเติม phosphate)</p>
<ul>
  <li>ADR ทั้งกลุ่ม: mitochondrial toxicity, lactic acidosis, metabolic effect (d4T มากที่สุด)</li>
  <li><b>ABC ปรับขนาดตามตับ</b> ที่เหลือปรับตามไต</li>
  <li>Hyperlipidemia: d4T &gt; AZT &gt; ABC &gt; TDF · lactic acidosis: d4T &gt; ddI &gt; AZT</li>
</ul>
<div class="tbl"><table>
  <tr><th>ยา</th><th>รายละเอียด</th><th>ADR</th></tr>
  <tr><td><b>TAF</b> (tenofovir alafenamide)</td><td>DI: P-gp inducer — phenytoin, phenobarbital, carbamazepine, rifampin, rifabutin, rifapentine</td><td>น้ำหนักเพิ่ม, hyperlipidemia</td></tr>
  <tr><td><b>TDF</b> (tenofovir disoproxil fumarate)</td><td>DI: ยาพิษต่อไต · ATV (unboosted) ทำให้ TFV สูงขึ้น · ติดตาม eGFR ทุก 6 เดือน ถ้า eGFR &lt; 50 ลดขนาดหรือเปลี่ยนเป็น TAF</td><td><mark>Bone mineral density ลดลง, renal insufficiency (Fanconi syndrome)</mark></td></tr>
  <tr><td><b>ABC</b> (abacavir)</td><td><b>ต้องตรวจ HLA-B*57:01</b> ก่อน: บวกหรือตรวจไม่ได้ห้ามใช้ · ใช้ในโรคไตได้ · ห้ามใน Child-Pugh C</td><td>CVD (เพิ่มเสี่ยง MI), hypersensitivity reaction</td></tr>
  <tr><td><b>AZT/ZDV</b> (zidovudine)</td><td>ใช้เมื่อดื้อยาตัวอื่น · DI: ribavirin (ยับยั้ง phosphorylation)</td><td>Black nail, bone marrow suppression, anemia</td></tr>
  <tr><td><b>d4T</b> (stavudine)</td><td></td><td>Peripheral neuropathy, lipoatrophy, hepatic steatosis, hyperlipidemia</td></tr>
  <tr><td><b>3TC</b> (lamivudine)</td><td></td><td>Headache, GI</td></tr>
  <tr><td><b>ddI</b> (didanosine)</td><td>กินตอนท้องว่าง</td><td>Diarrhea, pancreatitis, peripheral neuropathy</td></tr>
</table></div>
<div class="key"><strong class="k">TDF vs TAF</strong>พิษต่อไตและกระดูก: TDF &gt; TAF · น้ำหนักเพิ่มและไขมันสูง: TAF &gt; TDF</div>
<h3>2. NNRTIs</h3>
<p>Non-competitive จับ reverse transcriptase โดยตรง เปลี่ยนโครงสร้างเอนไซม์ · ทุกตัวผ่าน CYP3A4 (EFV เป็น autoinducer/inhibitor, NVP เป็น autoinducer) · <b>ดื้อง่าย ไม่ใช้เดี่ยว</b></p>
<div class="tbl"><table>
  <tr><th>ยา</th><th>การกิน</th><th>ADR</th><th>DI</th></tr>
  <tr><td><b>Efavirenz (EFV)</b></td><td><b>ท้องว่าง ก่อนนอน</b> (อาหารเพิ่มระดับยา → มึนหัว)</td><td>ง่วง (ถ้ามากลดขนาด), hepatotoxic, rash, teratogenic, gynecomastia</td><td>Ergotamine</td></tr>
  <tr><td><b>Nevirapine (NVP)</b></td><td>พร้อมอาหาร</td><td>Hepatotoxic, rash</td><td>Rifampicin, warfarin</td></tr>
  <tr><td><b>Rilpivirine (RPV)</b></td><td><b>พร้อมอาหาร ≥ 400 kcal</b> ตรงเวลา</td><td>Hepatotoxic, rash, CNS</td><td>ยาลดกรด (เว้น 2–4 ชม.), PPI, ยากันชัก, rifampicin</td></tr>
  <tr><td><b>Etravirine (ETR)</b></td><td>พร้อมอาหาร</td><td>Rash</td><td>Rifampicin</td></tr>
  <tr><td><b>Doravirine (DOR)</b></td><td>พร้อมอาหาร</td><td></td><td>ยากันชัก, rifampicin</td></tr>
</table></div>
<h3>3. Integrase inhibitors (INSTIs)</h3>
<p>ยับยั้ง HIV integrase ไม่ให้ viral DNA แทรกเข้า host DNA · โครงสร้างมี triad of coplanar oxygen จับ Mg²⁺ → <b>ระวังยาหรืออาหารที่มีประจุบวก</b> (ยาลดกรด นม) ลดฤทธิ์ยา · ข้อดี: ลด viral RNA เร็ว ดื้อยาต่ำ · ADR ทั้งกลุ่ม: rash, neuropsychiatric</p>
<div class="tbl"><table>
  <tr><th>ยา</th><th>รายละเอียด</th></tr>
  <tr><td><b>Raltegravir (RAL)</b></td><td>ADR: total cholesterol ↑, rash, myopathy (CPK ↑), neuropsychiatric, น้ำหนักเพิ่ม</td></tr>
  <tr><td><b>Dolutegravir (DTG)</b></td><td>คนท้องใช้ได้ (แนะนำ folic acid ลดเสี่ยง NTD) · เสี่ยง NTD, myopathy (CPK ↑), เอนไซม์ตับเพิ่ม · ยับยั้ง OCT2 &amp; MATE-1 → ห้ามใช้กับ dofetilide, pilsicainide (QT prolong) · <b>จำกัด metformin ≤ 1,000 mg/วัน</b> · ร่วม rifampicin ปรับ DTG 50 mg OD → <b>50 mg BID</b> · ให้ DTG 2 ชม. ก่อน หรือ 6 ชม. หลังยาลดกรด แคลเซียม สังกะสี เหล็ก วิตามินรวม · ADR: rash, myopathy, neuropsychiatric, น้ำหนักเพิ่ม</td></tr>
  <tr><td><b>Cabotegravir (CAB)</b></td><td>ยาฉีด long-acting</td></tr>
  <tr><td><b>Elvitegravir (EVG)</b></td><td>กินพร้อมอาหาร · ห้ามใน Child-Pugh C · ผ่าน CYP3A4, เป็น CYP2C9 inducer</td></tr>
  <tr><td><b>Bictegravir (BIC)</b></td><td>รวมเม็ดเดียวกับ TAF/FTC วันละครั้ง · ผ่าน CYP3A4 · ใช้ในหญิงวัยเจริญพันธุ์และตั้งครรภ์ได้ · ให้ BIC 2 ชม. ก่อน หรือ 6 ชม. หลังยาลดกรด Mg เหล็ก Ca Zn วิตามินรวม · ร่วม metformin ต้องปรับขนาด เริ่ม low dose และติดตามน้ำตาล · เลี่ยง dexamethasone, rifampicin, rifapentine, rifabutin, carbamazepine, eslicarbazepine, phenobarbital, phenytoin, primidone (ระดับ BIC ลด) · ADR: rash, neuropsychiatric, น้ำหนักเพิ่ม</td></tr>
</table></div>
<p>BIC และ DTG ยับยั้ง OCT2 &amp; MATE-1 ทำให้ระดับ metformin และ dofetilide สูงขึ้น</p>
<h3>4. Protease inhibitors (PIs)</h3>
<p>ผ่าน CYP3A4 ทุกตัว · ยับยั้งเอนไซม์ตัดโปรตีน → ได้ immature virus · ATV, DRV กินพร้อมอาหาร · มักใช้คู่ <b>PK booster</b> ยับยั้ง CYP3A4: ritonavir (RTV, มีฤทธิ์ต่อ HIV แต่ไม่ใช้เดี่ยว) หรือ cobicistat (COBI, อยู่ในสูตรผสมเท่านั้น)</p>
<ul>
  <li>ADR: ATV/r → indirect hyperbilirubinemia, ATV → renal insufficiency · PIs ทุกตัว → lipodystrophy, metabolic abnormality, bleeding · LPV/r → diarrhea</li>
  <li>DI: PIs ทุกตัวกับ rifampin · <b>ห้ามใช้กับ simvastatin, lovastatin, ergot derivatives</b> · ATV กับยาลดกรด, PPIs</li>
</ul>
<h3>5. HIV entry/capsid inhibitors</h3>
<ul>
  <li><b>Lenacapavir (LEN)</b> มีในไทย: capsid inhibitor ยับยั้งหลายขั้นตอน · ฉีด SC ทุก 6 เดือน · ใช้เป็น PrEP ได้</li>
  <li>ตัวอื่น: maraviroc, enfuvirtide, fostemsavir, ibalizumab</li>
</ul>
<figure><img data-fig="hiv/p10-1.webp" alt="ขนาดยา lenacapavir: initiation option 1 วันที่ 1 ฉีด 927 mg SC + กิน 600 mg วันที่ 2 กิน 600 mg; option 2 กิน 600 mg วันที่ 1 และ 2, 300 mg วันที่ 8, ฉีด 927 mg วันที่ 15; maintenance ฉีด 927 mg SC ทุก 6 เดือน"><figcaption>Lenacapavir regimen</figcaption></figure>
<h3>6. ยาสูตรผสม</h3>
<div class="tbl"><table>
  <tr><th>ชื่อการค้า</th><th>ส่วนประกอบ</th></tr>
  <tr><td>GPOvir Z250®</td><td>AZT + 3TC + EFV</td></tr>
  <tr><td>GPOvir S30®</td><td>d4T + 3TC + NVP</td></tr>
  <tr><td>TEEVIR®, GPOvir-T®</td><td>TDF + FTC + EFV</td></tr>
  <tr><td>TENO-EM®</td><td>TDF + FTC</td></tr>
  <tr><td><b>TLD</b>, Acriptega®</td><td>TDF + 3TC + DTG</td></tr>
  <tr><td>Kocitaf®</td><td>TAF + FTC + DTG</td></tr>
</table></div>` },
    { id: 'tx', t: 'การรักษา', html: `<p>อิงแนวทางการตรวจรักษาและป้องกันการติดเชื้อเอชไอวี ประเทศไทย 2564/2565</p>
<h3>เป้าหมาย</h3>
<ul>
  <li>ลดเชื้อในเลือดให้ต่ำที่สุดนานที่สุด: <b>HIV VL &lt; 50 copies/mL</b> และให้ CD4 กลับสู่ปกติ</li>
  <li>ไม่เสี่ยง AIDS-related illness และลดโรคแทรกซ้อน non-AIDS</li>
  <li>Adherence ดี: กินยาครบตรงเวลา ≥ 95%</li>
  <li>เป้า <b>95-95-95</b>: 95% ได้ตรวจรู้ว่าติดเชื้อ · 95% ได้ยาต้านไวรัส · 95% ของผู้กินยาสม่ำเสมอตรวจไม่พบเชื้อ</li>
</ul>
<h3>เริ่มยาเมื่อไร</h3>
<ul>
  <li><b>ให้ทุกราย ทุกระดับ CD4</b></li>
  <li>ไม่มี OI: เริ่มเร็วที่สุด — <b>same day ART</b> (วันวินิจฉัย) หรือ <b>rapid ART</b> (ภายใน 1 สัปดาห์)</li>
</ul>
<div class="tbl"><table>
  <tr><th>OI</th><th>เริ่มยาต้านไวรัสหลังรักษา OI</th></tr>
  <tr><td>วัณโรค (ทุกระดับ CD4)</td><td>ภายใน 2 สัปดาห์ อย่างช้าไม่เกิน 4 สัปดาห์</td></tr>
  <tr><td>วัณโรคระบบประสาท</td><td>อย่างน้อย 4 สัปดาห์ อย่างช้าไม่เกิน 8 สัปดาห์</td></tr>
  <tr><td>Cryptococcal meningitis</td><td>4–6 สัปดาห์</td></tr>
  <tr><td>Non-CNS cryptococcosis</td><td>2–4 สัปดาห์</td></tr>
  <tr><td>Cerebral toxoplasmosis</td><td>2–4 สัปดาห์</td></tr>
  <tr><td>CMV</td><td>ชะลอได้ 2 สัปดาห์ โดยเฉพาะ chorioretinitis และ encephalitis</td></tr>
  <tr><td>OI อื่น ๆ</td><td>เร็วที่สุดภายใน 2 สัปดาห์</td></tr>
</table></div>
<h3>สูตรยา (แนวทาง 2565)</h3>
<div class="tbl"><table>
  <tr><th></th><th>NRTIs backbone</th><th>ยาตัวที่ 3</th></tr>
  <tr><td><b>แนะนำ</b></td><td>(TDF หรือ TAF) + (3TC หรือ FTC)</td><td><b>DTG</b> (ควรใช้แบบรวมเม็ด)</td></tr>
  <tr><td>ทางเลือก</td><td>ABC + 3TC · AZT + 3TC (เมื่อใช้ TDF/TAF ไม่ได้)</td><td>EFV หรือ RPV</td></tr>
</table></div>
<p>สูตรสองตัว <b>DTG + 3TC</b>: ใช้เมื่อหาสูตรสามตัวที่เหมาะไม่ได้ เช่น มีโรคไตใช้ TDF/TAF ไม่ได้ · พิจารณาในกลุ่ม HBsAg negative และไม่มีการดื้อต่อ 3TC</p>
<p><b>ร่างแนวทาง 2568:</b> สูตรแนะนำ TXF/XTC/INSTI (<b>เพิ่ม BIC</b> หรือ DTG) หรือ DTG/3TC · ทางเลือก TXF/XTC + NNRTIs (EFV หรือ RPV) หรือ boosted DRV · ABC/3TC + (DTG, EFV, RPV หรือ boosted DRV) · ล้มเหลวจาก PrEP (TDF/FTC, TAF/FTC หรือ lenacapavir) ใช้ TXF/XTC/INSTI · ล้มเหลวจาก CAB-LA ใช้ TXF/XTC + boosted DRV</p>
<h3>ปฏิกิริยาระหว่างยา</h3>
<div class="tbl"><table>
  <tr><th>ยาที่ใช้ร่วม</th><th>ARV</th><th>คำแนะนำ</th></tr>
  <tr><td>Ergotamine</td><td>PIs, EFV</td><td>ห้ามใช้ร่วม · ไม่แนะนำ methylergometrine ในหญิงหลังคลอด (มีรายงาน ergotism)</td></tr>
  <tr><td>Sildenafil</td><td>PIs ทุกตัว</td><td>ระดับ sildenafil เพิ่ม อาจ overdose · ED เริ่มขนาดต่ำสุด เช่น 25 mg ทุก 48 ชม. · ห้ามใช้รักษา PAH</td></tr>
  <tr><td>Antacid</td><td>DTG, BIC</td><td>ไม่ควรใช้ร่วม หรือเลือกยาลดกรดกลุ่มอื่น</td></tr>
  <tr><td>Antacid · H2 blocker · PPI</td><td>RPV</td><td>Antacid ก่อน RPV ≥ 2 ชม. หรือหลัง ≥ 4 ชม. · H2RA ก่อน RPV ≥ 12 ชม. หรือหลัง ≥ 4 ชม. · <b>ไม่แนะนำ PPI</b></td></tr>
  <tr><td>Carbamazepine, phenobarbital, phenytoin</td><td>DTG, BIC · EFV · RPV · DRV, DRV/c</td><td>DTG/BIC ห้ามใช้ร่วม เลือกยากันชักอื่น · EFV ติดตามระดับยากันชัก NVP และ EFV หรือเลือกยากันชักอื่น · RPV ไม่ควรใช้ร่วม · DRV ห้ามใช้ร่วม (ลดผลรักษา เสี่ยงดื้อ)</td></tr>
  <tr><td>Rifampicin</td><td>DTG · BIC · RPV · ETR</td><td>DTG ต้องเพิ่มเป็น 50 mg วันละ 2 ครั้ง · BIC, RPV, ETR ห้ามใช้ร่วม</td></tr>
  <tr><td>Rifapentine</td><td>DTG, BIC · RPV · PIs</td><td>รักษา TB: DTG เพิ่มเป็นวันละ 2 ครั้ง ยกเว้นกรณีป้องกัน (TPT) สูตร 3HP หรือ 1HP ไม่ต้องปรับ · ไม่ควรใช้กับ BIC · RPV ห้ามใช้ร่วม · PIs ไม่ควรใช้ร่วม</td></tr>
</table></div>
<h3>การกินร่วมกับอาหาร</h3>
<ul>
  <li>DRV กินพร้อมอาหาร</li>
  <li>RPV กินพร้อมอาหาร ≥ 400 kcal ตรงเวลา</li>
  <li>EFV กินก่อนนอนตอนท้องว่าง ไม่ควรกินกับอาหารไขมันสูง (ดูดซึมและผลข้างเคียงเพิ่ม)</li>
</ul>
<h3>การติดตาม</h3>
<ul>
  <li>VL เป้าหมาย &lt; 50 copies/mL · ถ้า undetectable อาจตรวจ CD4 หรือไม่ก็ได้</li>
  <li>CD4 ≤ 350: ตรวจ CD4 2 ครั้ง/ปี · CD4 &gt; 350 และ VL &gt; 50: ตรวจ CD4 1 ครั้ง/ปี</li>
  <li><b>Virological failure:</b> HIV VL ≥ 200 copies/mL หลังกินยา ≥ 6 เดือน → ประเมิน adherence</li>
</ul>` },
    { id: 'special', t: 'กลุ่มพิเศษและการป้องกัน', html: `<div class="tbl"><table>
  <tr><th>กลุ่ม</th><th>คำแนะนำ</th></tr>
  <tr><td>หญิงตั้งครรภ์</td><td>ใช้สูตรเหมือนหญิงไม่ตั้งครรภ์</td></tr>
  <tr><td>TB coinfection</td><td>เริ่ม ARV ภายใน 2–4 สัปดาห์ (TB meningitis 4–8 สัปดาห์) · ถ้าสูตร TB มี rifampin: <b>ห้าม boosted PIs, RPV, BIC, CAB</b> · แนะนำ TXF/XTC/DTG + DTG 50 mg (DTG วันละ 2 ครั้ง) · ไม่มี rifampin เริ่มสูตรมาตรฐาน</td></tr>
  <tr><td>HBV coinfection</td><td>ใช้ TXF/XTC (ห้ามใช้ XTC เดี่ยว เสี่ยงดื้อ) · ถ้าต้องหยุดตัวใดตัวหนึ่งใช้ entecavir แทน</td></tr>
  <tr><td>HCV coinfection</td><td>Sofosbuvir/velpatasvir</td></tr>
</table></div>
<div class="key"><strong class="k">U = U</strong>Undetectable = Untransmittable · ตรวจไม่พบเชื้อในเลือด = ไม่ถ่ายทอดเชื้อให้ผู้อื่น</div>
<h3>PrEP (pre-exposure prophylaxis)</h3>
<div class="tbl"><table>
  <tr><th>แบบ</th><th>วิธีใช้</th></tr>
  <tr><td>Daily</td><td>TDF/FTC (300/200 mg) หรือ TAF/FTC (25/200 mg) วันละ 1 เม็ด · กินต่อเนื่อง 7 วันก่อนมีความเสี่ยง</td></tr>
  <tr><td>On-demand (2-1-1)</td><td>TDF/FTC 2 เม็ด 2–24 ชม. ก่อนมีความเสี่ยง → 1 เม็ดที่ 24 ชม. → 1 เม็ดที่ 48 ชม. หลังมีความเสี่ยง</td></tr>
  <tr><td>ยาฉีด</td><td>Cabotegravir (CAB) 600 mg/3 mL หรือ lenacapavir (LEN) 927 mg</td></tr>
</table></div>
<h3>PEP (post-exposure prophylaxis)</h3>
<ul>
  <li>เริ่มภายใน <b>72 ชม.</b> หลังมีความเสี่ยง และกินต่อเนื่องครบ <b>28 วัน</b></li>
  <li>สูตรแนะนำ: TXF/FTC/DTG (CrCl &lt; 50 ใช้ TAF)</li>
  <li>สูตรทางเลือก: TXF/FTC + DRV/r หรือ BIC หรือ RPV</li>
</ul>
<p style="font-size:.9em">ต้นฉบับเขียนขนาด lenacapavir ในส่วน PrEP ว่า 926 mg ส่วนภาพสูตรยาเขียน 927 mg (ขนาดตามเอกสารกำกับยาคือ 927 mg) จึงใช้ 927 mg</p>` },
  ],
  questions: [
    { q: 'ข้อใดกล่าวถูกต้องเกี่ยวกับการติดเชื้อ HIV', o: ['เชื้อ HIV ไม่สามารถติดผ่านน้ำนมได้', 'ระยะ AIDS เป็นระยะที่มีระดับ CD4 < 400 เซลล์/ลบ.มม.', 'เชื้อ HIV สามารถติดได้ผ่านการถูกยุงกัด', 'อาการติดเชื้อ HIV ในช่วง 2 สัปดาห์แรก จะมีอาการคล้ายไข้หวัดใหญ่ เรียกว่าระยะ acute HIV infection', 'การตรวจหาเชื้อ HIV ใช้ชุดตรวจคัดกรอง 3 ชุด โดยใช้ antigen สำหรับตรวจ antibody ที่เหมือนกันได้'], a: 3, e: 'HIV ติดผ่านน้ำนมและการคลอดจากแม่สู่ลูกได้ แต่ไม่ติดผ่านแมลงหรือสัตว์กัด · AIDS คือ CD4 < 200 · ชุดตรวจ 3 ชุดต้องใช้ antigen สำหรับตรวจ antibody ที่แตกต่างกัน และต้องบวกทั้ง 3 ชุดจึงสรุปว่าติดเชื้อ' },
    { q: 'ข้อใดจับคู่ยาต้านไวรัสและผลข้างเคียงที่อาจเกิดขึ้นได้ไม่ถูกต้อง', o: ['Zidovudine – black nail', 'Dolutegravir (DTG) – myopathy', 'Tenofovir alafenamide (TAF) – loss of bone mineral density (BMD)', 'Abacavir (ABC) – hypersensitivity reaction', 'Efavirenz (EFV) – elevated CPK'], a: 4, e: 'Elevated CPK เป็นผลข้างเคียงของ raltegravir และ dolutegravir ที่เสี่ยง myopathy · หมายเหตุ: ตัวเลือก TAF – loss of BMD ก็ควรระวัง เพราะในสรุประบุว่าผลต่อกระดูกเด่นใน TDF (TDF > TAF) ข้อนี้จึงตอบตามเฉลยของต้นฉบับ' },
    { q: 'ยีน HLA-B*57:01 ต้องตรวจก่อนใช้ยาใด', o: ['Tenofovir disoproxil fumarate (TDF)', 'Abacavir (ABC)', 'Zidovudine (AZT)', 'Dolutegravir (DTG)', 'Efavirenz (EFV)'], a: 1, e: 'ผู้ที่มี HLA-B*57:01 เสี่ยงสูงมากต่อ hypersensitivity reaction รุนแรงจาก abacavir จนอาจถึงชีวิต' },
    { q: 'ยาต้านเอชไอวีในข้อใด ไม่เกิดอันตรกิริยากับยา rifampin', o: ['Efavirenz (EFV)', 'Rilpivirine (RPV)', 'Dolutegravir (DTG)', 'Tenofovir alafenamide (TAF)', 'Abacavir (ABC)'], a: 4, e: 'EFV ร่วม rifampin AUC ลดลง จึงคงขนาด 600 mg (ไม่ใช้ 400 mg) · RPV ห้ามใช้ร่วม · DTG ต้องเพิ่มเป็น 50 mg BID · TAF AUC ลดลง' },
    { q: 'ข้อใดถูกต้อง เมื่อกล่าวถึงการรักษาผู้ติดเชื้อเอชไอวี', o: ['ต้องการลด HIV viral load ให้ < 60 copies/mL เป็นเป้าหมายการรักษา', 'หากผู้ป่วยไม่ได้ติดเชื้อฉวยโอกาส ต้องเริ่มยาต้านไวรัสภายในวันวินิจฉัยเท่านั้น (same day ART)', 'หากต้องการป้องกันการติดเชื้อก่อนมีกิจกรรมทางเพศ ให้กิน TDF/FTC (300/200 mg) วันละ 1 เม็ดเป็น daily PrEP', 'หากต้องใช้ DTG ร่วมกับ metformin ควรจำกัด metformin ไม่เกิน 1,500 มก./วัน', 'TLD เป็นสูตรยาเดียวกันกับ Kocitaf ประกอบด้วย TAF+FTC+DTG'], a: 2, e: 'Daily PrEP คือ TDF/FTC 300/200 mg วันละ 1 เม็ด · เป้า VL < 50 copies/mL · ไม่มี OI ควรเริ่มภายในวันวินิจฉัย หรือถ้าทำไม่ได้ภายใน 1 สัปดาห์ (rapid ART) · DTG ร่วม metformin จำกัด ≤ 1,000 mg/วัน · TLD = TDF+3TC+DTG ส่วน Kocitaf = TAF+FTC+DTG' },
  ],
}
