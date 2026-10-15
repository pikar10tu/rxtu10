// COPD — converted from the RxTU10 class summary PDF (see content/summaries/manifest.json)
const CASE = 'ชายไทยอายุ 65 ปี สูง 165 ซม. น้ำหนัก 52 กก. สูบบุหรี่วันละ 1 ซอง มา 30 ปี ปัจจุบันยังสูบ · CC: หอบเหนื่อยมากขึ้นเวลาเดินเร็วบนทางราบ ไอมีเสมหะตอนเช้า · PMH: HT 3 ปี · MH: amlodipine 5 mg OD · Spirometry (post-BD): FEV1/FVC 0.62, FEV1 55% predicted · CAAT 14, mMRC 2 · ใน 1 ปีที่ผ่านมากำเริบ 1 ครั้ง ได้ยาปฏิชีวนะและ prednisolone แบบผู้ป่วยนอก ไม่เคยนอนโรงพยาบาล · blood eosinophil 150 cells/µL'

export default {
  id: 'copd',
  date: '28/07/2026',
  refs: [
    'Global Initiative for Chronic Obstructive Lung Disease. Global strategy for the diagnosis, management, and prevention of COPD: 2026 report. GOLD; 2025.',
    'Global Initiative for Chronic Obstructive Lung Disease. Pocket guide to COPD diagnosis, management, and prevention. 2026 ed. GOLD; 2025.',
    'Global Initiative for Chronic Obstructive Lung Disease. GOLD report 2026 key changes summary. GOLD; 2025.',
    'Cazzola M, et al. GOLD 2026: transforming COPD management with early intervention, multi-dimensional assessment, and personalized care. Drugs. 2026;86(5):581–97.',
    'World Health Organization. Chronic obstructive pulmonary disease (COPD): fact sheet. 2024.',
    'Saiphoklang N, et al. Prevalence of COPD and asthma in the community of Pathumthani, Thailand. Diseases. 2025;13(5):130.',
    'Maranetra KN, et al. The prevalence and incidence of COPD among urban older persons of Bangkok Metropolis. J Med Assoc Thai. 2002;85(11):1147–55.',
    'Pothirat C, et al. A comparative study of COPD burden between urban vs rural communities in northern Thailand. Int J Chron Obstruct Pulmon Dis. 2015;10:1035–42.',
    'สมาคมอุรเวชช์แห่งประเทศไทย ในพระบรมราชูปถัมภ์. แนวทางการวินิจฉัยและรักษาโรคปอดอุดกั้นเรื้อรัง พ.ศ. 2565.',
    'Celli BR, et al. An updated definition and severity classification of COPD exacerbations: the Rome proposal. Am J Respir Crit Care Med. 2021;204(11):1251–8.',
    'Halpin DMG, et al. Effect of a single exacerbation on decline in lung function in COPD. Respir Med. 2017;128:85–91.',
    'DiPiro JT, et al., editors. Pharmacotherapy: a pathophysiologic approach. 12th ed. McGraw Hill; 2023.',
    'Brunton LL, Knollmann BC, editors. Goodman & Gilman\'s the pharmacological basis of therapeutics. 14th ed. McGraw Hill; 2023.',
    'Rochester CL, et al. Pulmonary rehabilitation for adults with chronic respiratory disease: an official ATS clinical practice guideline. Am J Respir Crit Care Med. 2023;208(4):e7–26.',
    'Jolliffe DA, et al. Vitamin D to prevent exacerbations of COPD: systematic review and meta-analysis of IPD. Thorax. 2019;74(4):337–45.',
    'Song F, et al. Effects of Baduanjin exercise on lung function and 6 min walk in COPD patients. Sci Rep. 2024;14(1):17788.',
    'Bhatt SP, et al. Dupilumab for COPD with type 2 inflammation indicated by eosinophil counts. N Engl J Med. 2023;389(3):205–14.',
    'Pavord ID, et al. Mepolizumab for eosinophil-associated COPD: analysis of METREX and METREO. Int J Chron Obstruct Pulmon Dis. 2021;16:1755–70.',
    'Singh D, et al. Blood eosinophils and COPD: a GOLD Science Committee 2022 review. Am J Respir Crit Care Med. 2022;206(1):17–24.',
    'Rogliani P, et al. Efficacy and safety profile of mucolytic/antioxidant agents in COPD. Respir Res. 2019;20(1):104.',
    'Zhou Y, et al. Effect of high-dose N-acetylcysteine on exacerbations and lung function in mild-to-moderate COPD. Nat Commun. 2024;15(1):8468.',
    'Zheng JP, et al. Twice daily N-acetylcysteine 600 mg for exacerbations of COPD (PANTHEON). Lancet Respir Med. 2014;2(3):187–94.',
    'Papadopoulou E, et al. Mucolytics for acute exacerbations of COPD: a meta-analysis. Eur Respir Rev. 2023;32(167):220141.',
    'คณะกรรมการพัฒนาระบบยาแห่งชาติ. บัญชียาหลักแห่งชาติ.',
  ],
  sections: [
    { id: 'overview', t: 'Epidemiology และนิยาม', html: `<h3>Epidemiology</h3>
<ul>
  <li>สาเหตุการเสียชีวิต 1 ใน 3 อันดับแรกของโลก · เสียชีวิต &gt; 3 ล้านคน/ปี (5% ของการเสียชีวิตทั้งหมด)</li>
  <li>GBD 2021: ผู้ป่วยราว 213 ล้านคน (ความชุก 2.7%) คาดว่าเพิ่มเป็นราว 600 ล้านคนในปี 2050 โดยเพิ่มมากในเพศหญิง</li>
  <li>ไทย: ความชุก 8.3% ในชุมชนปทุมธานี (2566) สูงกว่ากรุงเทพฯ (7.1%) และภาคเหนือ (4–7%) อาจสัมพันธ์กับ PM2.5 มากกว่าบุหรี่ที่มีแนวโน้มลดลง</li>
  <li>ปัญหาสำคัญคือ under-diagnosis และ mis-diagnosis · GOLD 2026 จึงเพิ่มเรื่อง screening และ case-finding</li>
</ul>
<h3>Definition (GOLD 2026)</h3>
<p>"Heterogeneous lung condition" ที่มีอาการทางเดินหายใจเรื้อรัง (เหนื่อย ไอ เสมหะ และ/หรือกำเริบ) จากความผิดปกติของทางเดินหายใจ (bronchitis, bronchiolitis) และ/หรือถุงลม (emphysema) ทำให้มี<b>การอุดกั้นถาวร</b>และมักดำเนินโรคมากขึ้น</p>
<ul>
  <li>อุดกั้นแบบ <b>persistent / not fully reversible</b> ต่างจากหืดที่ variable และมักกลับคืนได้</li>
  <li><b>Chronic bronchitis</b> = ไอมีเสมหะเรื้อรัง ≥ 3 เดือน/ปี ติดต่อกัน 2 ปี · <b>emphysema</b> = ถุงลมส่วนปลายขยายถาวรร่วมกับผนังถุงลมถูกทำลาย · ทั้งสองเป็นคำอธิบายทางคลินิก/พยาธิ ไม่ใช่เกณฑ์วินิจฉัย</li>
  <li><b>Pre-COPD</b> (มีอาการ/ความผิดปกติทางโครงสร้างแต่ spirometry ปกติ) และ <b>PRISm</b> (FEV1/FVC ≥ 0.70 แต่ FEV1 &lt; 80% predicted) เสี่ยงเป็น COPD ควรได้รับการป้องกัน</li>
</ul>
<h3>Risk factors (GETomics: Gene × Environment × Time)</h3>
<ul>
  <li><b>Exposures:</b> บุหรี่และควันบุหรี่มือสองสำคัญที่สุด — <mark>pack-year = (มวน/วัน ÷ 20) × จำนวนปีที่สูบ</mark> · &lt; 10–15 pack-year โอกาสน้อย · &gt; 40 pack-year เพิ่มโอกาสมาก (LR+ ~12) · มลพิษในบ้าน (เชื้อเพลิงชีวมวล) และภายนอก (PM2.5) · ฝุ่น/สารเคมีจากอาชีพ · ติดเชื้อทางเดินหายใจซ้ำในวัยเด็ก ประวัติวัณโรคปอด</li>
  <li><b>Host:</b> alpha-1 antitrypsin (AAT) deficiency — protease/antiprotease เสียสมดุล เกิด emphysema ตั้งแต่อายุน้อย WHO แนะนำตรวจอย่างน้อย 1 ครั้งในผู้ป่วย COPD · ปอดเจริญบกพร่อง (คลอดก่อนกำหนด น้ำหนักแรกเกิดน้อย) · airway hyperresponsiveness · หืด · อายุมาก · เศรษฐานะต่ำ</li>
  <li><b>Etiotypes:</b> COPD-G (genetic), -D (abnormal lung development), -C (cigarette), -P (pollution), -I (infection), -A (asthma), -U (unknown)</li>
</ul>` },
    { id: 'dx', t: 'การวินิจฉัย', html: `<ul>
  <li>นึกถึงในผู้ที่เหนื่อย ไอเรื้อรัง มีเสมหะ ติดเชื้อทางเดินหายใจส่วนล่างซ้ำ และ/หรือมีปัจจัยเสี่ยง (มักอายุ &gt; 40 ปี)</li>
  <li><b>บังคับ: post-bronchodilator spirometry FEV1/FVC &lt; 0.70</b> · pre-bronchodilator ใช้ได้เพียงตัดโรคออก</li>
  <li>GOLD 2026 ไม่แนะนำใช้ bronchodilator reversibility แยกหืดกับ COPD (พบได้ใกล้เคียงกัน: หืด 17–19%, COPD 18–24%) และไม่ต้องหยุดยาสูดก่อนตรวจในผู้ที่อาการคงที่</li>
  <li>ไม่แนะนำคัดกรองด้วย spirometry ในประชากรทั่วไปที่ไม่มีอาการ แต่แนะนำ <b>targeted case-finding</b> ในผู้มีอาการหรือปัจจัยเสี่ยง</li>
  <li>ตรวจเพิ่มเติม: blood eosinophil (biomarker type 2 inflammation ชี้นำการใช้ ICS), CBC, CXR, AAT, lung volume/DLCO, exercise test, CT</li>
  <li>วินิจฉัยแยกโรค: หืด หัวใจล้มเหลว bronchiectasis วัณโรคปอด interstitial lung disease obliterative bronchiolitis</li>
</ul>
<div class="tbl"><table>
  <tr><th>GOLD grade</th><th>ความรุนแรง</th><th>FEV1 (% predicted)</th></tr>
  <tr><td>GOLD 1</td><td>Mild</td><td>≥ 80%</td></tr>
  <tr><td>GOLD 2</td><td>Moderate</td><td>50–79%</td></tr>
  <tr><td>GOLD 3</td><td>Severe</td><td>30–49%</td></tr>
  <tr><td>GOLD 4</td><td>Very severe</td><td>&lt; 30%</td></tr>
</table></div>` },
    { id: 'patho', t: 'Pathophysiology และอาการ', html: `<ul>
  <li>เซลล์อักเสบหลักคือ <b>neutrophils, macrophages, CD8⁺ T cells</b> (หืดเด่นด้วย eosinophils และ mast cells) → ตอบสนองต่อ corticosteroid น้อยกว่าหืด ICS ไม่ใช่ยาหลัก</li>
  <li>Protease–antiprotease imbalance: neutrophil elastase, MMPs เพิ่ม หรือ AAT ลด → ผนังถุงลมถูกทำลาย เกิด emphysema</li>
  <li>Oxidative stress จากควันบุหรี่และเซลล์อักเสบซ้ำเติมการอักเสบ</li>
  <li>ทางเดินหายใจส่วนกลาง: mucous gland hyperplasia, mucus hypersecretion, ciliary dysfunction → ไอเรื้อรัง เสมหะมาก</li>
  <li>ตำแหน่งอุดกั้นหลักคือ small airways (&lt; 2 มม.) จากพังผืด เสมหะ เซลล์อักเสบ ร่วมกับสูญเสีย elastic recoil → ทางเดินหายใจเล็กยุบขณะหายใจออก (expiratory flow limitation)</li>
  <li>ผลคือ air trapping และ <b>dynamic hyperinflation</b> กลไกหลักของอาการเหนื่อย → วงจรเหนื่อย → ไม่ออกกำลัง → deconditioning → เหนื่อยมากขึ้น</li>
  <li>ระยะท้าย: V/Q mismatch → hypoxemia, hypercapnia, pulmonary hypertension, cor pulmonale · การอักเสบเชิงระบบสัมพันธ์กับโรคร่วม (CVD กล้ามเนื้ออ่อนแรง กระดูกพรุน ซึมเศร้า)</li>
</ul>
<h3>Clinical presentation</h3>
<ul>
  <li>อาการหลัก: progressive exertional dyspnea ไอเรื้อรัง เสมหะ แน่นหน้าอก wheeze</li>
  <li>ระยะรุนแรง: อ่อนเพลีย น้ำหนักลด เบื่ออาหาร กล้ามเนื้อลีบ วิตกกังวล ซึมเศร้า</li>
  <li>อาการแสดง: barrel chest · ใช้ accessory muscles · pursed-lip breathing · เสียงหายใจเบา · expiratory wheeze · เขียวคล้ำ · ขาบวมจาก cor pulmonale</li>
  <li><b>"Pink puffer"</b> (emphysema เด่น): ผอม เหนื่อยเด่น หายใจเป่าปาก · <b>"Blue bloater"</b> (chronic bronchitis เด่น): อ้วน ไอมีเสมหะเด่น เขียวคล้ำ</li>
  <li><b>Exacerbation:</b> อาการแย่ลงเฉียบพลันภายใน ≤ 14 วัน (เหนื่อย ไอ เสมหะเพิ่ม อาจหายใจเร็ว/หัวใจเต้นเร็ว) มักจากติดเชื้อหรือมลพิษ · ต้องแยก mimics เช่น ปอดอักเสบ PE หัวใจล้มเหลวเฉียบพลัน pneumothorax</li>
</ul>` },
    { id: 'severity', t: 'การประเมินความรุนแรง', html: `<p>ประเมิน 5 มิติ: ระดับอุดกั้น (GOLD 1–4) · ภาระอาการ · ประวัติกำเริบ · blood eosinophil · โรคร่วม</p>
<ul>
  <li><b>mMRC</b> (grade 0–4) cut-point ≥ 2 = อาการมาก</li>
  <li><b>CAAT</b> (Chronic Airways Assessment Test เดิมชื่อ CAT) 8 ข้อ 0–40 คะแนน cut-point ≥ 10 = อาการมาก</li>
</ul>
<h3>GOLD ABE assessment</h3>
<div class="tbl"><table>
  <tr><th>กลุ่ม</th><th>เกณฑ์ (GOLD 2026)</th></tr>
  <tr><td><b>A</b></td><td>ไม่มีการกำเริบที่ต้องรักษาในปีที่ผ่านมา + mMRC &lt; 2 และ CAAT &lt; 10</td></tr>
  <tr><td><b>B</b></td><td>ไม่มีการกำเริบที่ต้องรักษาในปีที่ผ่านมา + mMRC ≥ 2 หรือ CAAT ≥ 10</td></tr>
  <tr><td><b>E</b></td><td><mark>กำเริบระดับ moderate หรือ severe ≥ 1 ครั้งใน 12 เดือน</mark> ไม่ขึ้นกับระดับอาการ</td></tr>
</table></div>
<h3>ความรุนแรงของการกำเริบ (Rome proposal)</h3>
<div class="tbl"><table>
  <tr><th>ระดับ</th><th>เกณฑ์ (ประเมินจากลักษณะทางคลินิกขณะมาพบ ไม่ใช่จากการรักษาที่ได้)</th></tr>
  <tr><td>Mild</td><td>Dyspnea VAS &lt; 5, RR &lt; 24, HR &lt; 95, SaO₂ ขณะพัก ≥ 92% (หรือเปลี่ยน ≤ 3%) และ CRP &lt; 10 mg/L</td></tr>
  <tr><td>Moderate</td><td>≥ 3 ใน 5 ข้อ: VAS ≥ 5, RR ≥ 24, HR ≥ 95, SaO₂ &lt; 92% (หรือลด &gt; 3%), CRP ≥ 10 · ABG อาจมี hypoxemia (PaO₂ ≤ 60) และ/หรือ hypercapnia (PaCO₂ &gt; 45) แต่ไม่มี acidosis</td></tr>
  <tr><td>Severe</td><td>เหมือน moderate แต่ ABG มี hypercapnia ใหม่/แย่ลง ร่วมกับ acidosis (PaCO₂ &gt; 45 และ pH &lt; 7.35)</td></tr>
</table></div>` },
    { id: 'pharm', t: 'เภสัชวิทยาของยา COPD', html: `<p>ยาหลักคือยาสูด ออกฤทธิ์เฉพาะที่ปอด ผลข้างเคียงเชิงระบบต่ำ · ถึงปอดเพียง 10–40% ตามอุปกรณ์และเทคนิค ส่วนที่เหลือถูกกลืน · ยาที่ first-pass สูง (fluticasone, budesonide) จึงมี systemic bioavailability ต่ำ · บ้วนปากหลังพ่น ICS ลด oral candidiasis และการดูดซึมเชิงระบบ</p>
<div class="tbl"><table>
  <tr><th>ยา</th><th>Absorption / onset–duration</th><th>Distribution & metabolism</th><th>Elimination & ประเด็นคลินิก</th></tr>
  <tr><td><b>SABA</b> (salbutamol, terbutaline, fenoterol)</td><td>ดูดซึมเข้าระบบน้อย · onset 5 นาที นาน 4–6 ชม.</td><td>Hydrophilic จับ β2 โดยตรง · SULT1A3 → sulfate conjugate</td><td>ขับทางไต t½ 4–6 ชม. · ใจสั่น มือสั่น K⁺ ต่ำ น้ำตาลสูง</td></tr>
  <tr><td><b>LABA 12 ชม.</b> (formoterol, salmeterol)</td><td>Formoterol onset 1–3 นาที · salmeterol 10–20 นาที · ให้ BID</td><td>Salmeterol lipophilic มาก ผ่าน CYP3A4 · formoterol ผ่าน UGT และ CYP2D6/2C19</td><td>Salmeterol ขับทางอุจจาระ · ระวัง strong CYP3A4 inhibitor (ketoconazole, ritonavir)</td></tr>
  <tr><td><b>Ultra-LABA 24 ชม.</b> (indacaterol, olodaterol, vilanterol)</td><td>Onset เร็ว (indacaterol ~5 นาที) · ให้ OD</td><td>Indacaterol: CYP3A4, UGT1A1 · olodaterol: UGT, CYP2C9/2C8 · vilanterol: CYP3A4</td><td>ขับทางอุจจาระ · OD ช่วย adherence</td></tr>
  <tr><td><b>SAMA</b> (ipratropium)</td><td>Quaternary ammonium ดูดซึมน้อยมาก · onset 15 นาที นาน 6–8 ชม.</td><td>ไม่ผ่าน BBB · ester hydrolysis บางส่วน</td><td>ปากแห้ง รสขม · ระวังพ่นเข้าตาในต้อหินมุมปิด</td></tr>
  <tr><td><b>LAMA</b> (tiotropium, umeclidinium, glycopyrronium, aclidinium)</td><td>≥ 24 ชม. ให้ OD (aclidinium BID) · steady state ~1 สัปดาห์</td><td>Kinetic selective ต่อ M3 (tiotropium แยกจาก M3 ช้ามาก) · umeclidinium ผ่าน CYP2D6 · aclidinium ถูก esterase ในพลาสมาสลายเร็ว</td><td>Tiotropium ขับทางไตในรูปเดิม ระวังเมื่อ CrCl &lt; 60 · aclidinium S/E เชิงระบบต่ำ</td></tr>
  <tr><td><b>ICS</b> (budesonide, fluticasone, beclometasone)</td><td>ส่วนที่กลืนถูก first-pass สูง: oral F budesonide ~11%, fluticasone &lt; 1%</td><td>จับโปรตีนสูง ผ่าน CYP3A4 · beclometasone dipropionate เป็น prodrug → B-17-monopropionate</td><td>ขับทางอุจจาระ · เชื้อราในปาก เสียงแหบ ช้ำง่าย <mark>เพิ่มความเสี่ยงปอดอักเสบ</mark></td></tr>
  <tr><td><b>Theophylline</b> (oral)</td><td>F ≈ 100% · narrow therapeutic index · เป้าหมาย 5–15 mcg/mL</td><td>CYP1A2 เป็นหลัก (รอง 3A4, 2E1) · Vd ~0.5 L/kg ใช้ IBW ในคนอ้วน</td><td>t½ ~8 ชม. สั้นลงในผู้สูบบุหรี่ (~4–5) ยาวขึ้นในผู้สูงอายุ ตับแข็ง HF · <b>เลิกบุหรี่แล้วระดับยาสูงขึ้น</b> ต้องปรับขนาด</td></tr>
  <tr><td><b>Roflumilast</b> (oral)</td><td>F ~80% Tmax ~1 ชม. กินพร้อมหรือไม่พร้อมอาหาร</td><td>PB ~99% · CYP1A2, 3A4 → roflumilast N-oxide (active, t½ ยาวกว่า) ยับยั้ง PDE-4</td><td>ขับทางปัสสาวะ · ห้ามใช้ใน Child-Pugh B–C · ท้องเสีย คลื่นไส้ น้ำหนักลด นอนไม่หลับ คิดฆ่าตัวตาย</td></tr>
  <tr><td><b>Azithromycin</b> (long-term)</td><td>ดูดซึมปานกลาง กระจายเข้าเนื้อเยื่อสูงมาก</td><td>ผ่านตับเล็กน้อย ไม่ใช่ substrate หลักของ CYP3A4</td><td>ขับทางน้ำดี t½ ~68 ชม. · QT prolongation การได้ยินลดลง เชื้อดื้อยา</td></tr>
  <tr><td><b>Mucolytic/antioxidant</b> (erdosteine, carbocysteine, NAC)</td><td>NAC first-pass สูง F ~4–10% · erdosteine เป็น prodrug → M1</td><td>Thiol-based · NAC → cysteine → glutathione (antioxidant) และตัด disulfide bond ของเสมหะ</td><td>ขับทางไต · S/E น้อย ส่วนใหญ่เป็น GI</td></tr>
  <tr><td><b>Biologics</b> (dupilumab, mepolizumab SC)</td><td>ดูดซึมช้า Tmax หลายวัน F ~60–80%</td><td>Monoclonal antibody สลายด้วย proteolysis ไม่ผ่าน CYP</td><td>t½ ยาว ฉีดทุก 2–4 สัปดาห์ · ไม่มี DI ผ่าน CYP</td></tr>
</table></div>` },
    { id: 'tx', t: 'การรักษา COPD ระยะคงที่', html: `<p><b>Goals:</b> ลดอาการ (บรรเทาอาการ เพิ่ม exercise tolerance คุณภาพชีวิต) และลดความเสี่ยง (ชะลอโรค ป้องกัน/รักษาการกำเริบ ลดอัตราตาย) · GOLD 2026 ตั้งเป้า <b>low disease activity state</b> คือไม่มีการกำเริบเลย</p>
<h3>Non-pharmacologic</h3>
<ul>
  <li><b>เลิกบุหรี่:</b> วิธีเดียวที่ชะลอการเสื่อมของปอดและลดอัตราตายได้ชัดเจน · ใช้ทั้งคำปรึกษาและยา (NRT, varenicline, bupropion)</li>
  <li><b>วัคซีน:</b> ไข้หวัดใหญ่ (ปีละครั้ง) นิวโมคอคคัส COVID-19 RSV Tdap (ถ้าไม่เคยได้ในวัยรุ่น) งูสวัด</li>
  <li><b>Pulmonary rehabilitation:</b> ทุกรายที่เหนื่อยขณะออกแรง มี deconditioning หรือเพิ่งกำเริบ ไม่จำกัดตาม spirometry · การออกกำลังแบบตะวันออก (ปาต้วนจิ่น ไทเก๊ก) ใช้เสริมได้</li>
  <li><b>โภชนาการ:</b> BMI &lt; 21 อัตราตายสูงขึ้น · อาหารเสริมพลังงาน-โปรตีนร่วมกับฟื้นฟูปอดในผู้ที่ทุพโภชนาการ · <b>วิตามินดี</b> ลดการกำเริบเฉพาะผู้ที่ 25(OH)D &lt; 25 nmol/L</li>
  <li><b>LTOT:</b> เฉพาะ severe resting hypoxemia (PaO₂ ≤ 55 mmHg หรือ &lt; 60 เมื่อมี cor pulmonale หรือ secondary polycythemia)</li>
  <li><b>Home NIV</b> ใน chronic hypercapnia โดยเฉพาะหลังกำเริบรุนแรง · ผ่าตัด/ส่องกล้องลดปริมาตรปอดใน emphysema ที่คัดเลือกแล้ว</li>
  <li>สอนเทคนิคยาสูด · written action plan · จัดการโรคร่วม</li>
</ul>
<h3>Initial pharmacological treatment</h3>
<div class="tbl"><table>
  <tr><th>กลุ่ม</th><th>ยาที่แนะนำ</th><th>หมายเหตุ</th></tr>
  <tr><td><b>A</b></td><td>Bronchodilator 1 ชนิด</td><td>SABA/SAMA เมื่อมีอาการเป็นครั้งคราว · ใช้ยาบรรเทาอาการ &gt; 2–3 ครั้ง/สัปดาห์ เปลี่ยนเป็น LABA หรือ LAMA</td></tr>
  <tr><td><b>B</b></td><td><b>LABA + LAMA</b> (single inhaler ดีกว่า)</td><td>ยาเริ่มต้นมาตรฐาน · ยาเดี่ยวเป็นทางเลือกรองเมื่อติดเรื่องราคา การเข้าถึง หรือการทนยา</td></tr>
  <tr><td><b>E</b></td><td><b>LABA + LAMA</b> · เพิ่ม ICS เมื่อ eos ≥ 300</td><td><mark>GOLD 2026 คัดค้านการเริ่มด้วย LABA + ICS</mark> ใน COPD ที่ไม่มีลักษณะหืด (ป้องกันการกำเริบด้อยกว่าและเพิ่มปอดอักเสบ) · ถ้ามีข้อบ่งใช้ ICS ให้ขึ้น triple therapy โดยตรง</td></tr>
</table></div>
<p>ทุกรายควรมียาบรรเทาอาการออกฤทธิ์สั้นใช้เมื่อจำเป็น · ผู้ที่มีลักษณะหืดร่วมต้องได้ ICS เสมอ</p>
<h3>Follow-up treatment</h3>
<p><b>Dyspnea เป็นปัญหาหลัก</b></p>
<ul>
  <li>ยาเดี่ยว → LABA + LAMA</li>
  <li>ยังเหนื่อยทั้งที่ได้ LABA + LAMA: อย่ารีบเพิ่มยา · ทบทวนเทคนิคและ adherence เปลี่ยนอุปกรณ์/ตัวยา ส่งฟื้นฟูปอด หาสาเหตุอื่น (HF ซีด วิตกกังวล อ้วน)</li>
  <li>พิจารณา <b>ensifentrine</b> (ยาพ่นยับยั้ง PDE-3/PDE-4) เป็นทางเลือกเสริม</li>
</ul>
<p><b>Exacerbation เป็นปัญหาหลัก</b></p>
<ul>
  <li>LABA + LAMA ยังกำเริบ + eos ≥ 100 → <b>triple therapy</b> (LABA + LAMA + ICS)</li>
  <li>Eos &lt; 100 หรือ triple แล้วยังกำเริบ → เพิ่ม <b>roflumilast</b> (chronic bronchitis และ FEV1 &lt; 50%) หรือ <b>azithromycin</b> (เหมาะกับผู้ที่เลิกบุหรี่แล้ว)</li>
  <li>Triple เต็มที่แล้วยังกำเริบ + eos ≥ 300 → biologics: dupilumab (มี chronic bronchitis) หรือ mepolizumab</li>
</ul>
<h3>การใช้และการหยุด ICS</h3>
<div class="tbl"><table>
  <tr><th>ระดับ</th><th>เงื่อนไข</th></tr>
  <tr><td>สนับสนุนอย่างยิ่ง</td><td>นอนโรงพยาบาลจากการกำเริบ · กำเริบ moderate ≥ 2 ครั้ง/ปี · eos ≥ 300 · มีหืดร่วม</td></tr>
  <tr><td>สนับสนุน</td><td>กำเริบ moderate 1 ครั้ง/ปี · eos 100–300</td></tr>
  <tr><td>ไม่แนะนำ</td><td>ปอดอักเสบซ้ำ ๆ · eos &lt; 100 · ประวัติติดเชื้อ mycobacteria</td></tr>
</table></div>
<ul>
  <li>ห้ามใช้ ICS เดี่ยวระยะยาวใน COPD</li>
  <li>ตรวจ eos ซ้ำ 2–3 ครั้งช่วงโรคสงบ (แปรปรวนสูง) · ไม่ควรหยุด ICS ถ้า eos ≥ 300</li>
  <li>Legacy pathway (ใช้ LABA + ICS อยู่เดิม): ไม่กำเริบและไม่มีข้อบ่งใช้ ICS → LABA + LAMA · ยังกำเริบและ eos ≥ 100 → triple · eos &lt; 100 → LABA + LAMA</li>
</ul>
<h3>ยาอื่น และยาที่ไม่แนะนำ</h3>
<ul>
  <li><b>Mucolytic/antioxidant (thiol):</b> ลดการกำเริบในผู้ที่คัดเลือก โดยเฉพาะผู้ที่ไม่ได้ ICS (Evidence B) · แนวทางไทยระบุ NAC 1,200 mg/วัน เป็นยาเสริม</li>
  <li><b>AAT augmentation (IV)</b> เฉพาะ AAT deficiency รุนแรงร่วมกับ emphysema (Evidence B)</li>
  <li><b>Opioid ขนาดต่ำออกฤทธิ์ยาว</b> บรรเทาเหนื่อยในระยะรุนแรงแบบประคับประคอง (Evidence B)</li>
</ul>
<div class="tbl"><table>
  <tr><th>ไม่แนะนำในระยะคงที่</th><th>เหตุผล</th></tr>
  <tr><td>Statin เพื่อป้องกันการกำเริบ</td><td>ไม่ลดการกำเริบ (Evidence A) · ถ้ามีข้อบ่งใช้ทางหัวใจ/เมแทบอลิกให้ใช้ต่อ</td></tr>
  <tr><td>Antitussives</td><td>ไม่มีหลักฐานชัดเจน (Evidence C)</td></tr>
  <tr><td>Vasodilators / ยา PAH</td><td>ไม่ช่วยและอาจทำให้ oxygenation แย่ลง (Evidence B)</td></tr>
  <tr><td>Leukotriene modifiers</td><td>การศึกษายังไม่เพียงพอ</td></tr>
  <tr><td>Oral corticosteroid ระยะยาว</td><td>ผลข้างเคียงมากกว่าประโยชน์</td></tr>
  <tr><td>Theophylline</td><td>ขยายหลอดลมน้อย narrow therapeutic index · ใช้เมื่อเข้าไม่ถึงยาอื่น (Evidence B) · ไม่ใช้ IV ในภาวะกำเริบ</td></tr>
</table></div>` },
    { id: 'aecopd', t: 'การรักษาอาการกำเริบเฉียบพลัน (AECOPD)', html: `<ul>
  <li><b>Bronchodilator:</b> SABA ± SAMA เป็นลำดับแรก</li>
  <li><b>Systemic corticosteroid:</b> <mark>prednisolone 40 mg/วัน 5 วัน</mark> (moderate/severe) · FEV1 ดีขึ้นเร็ว ลดวันนอน ลดการรักษาล้มเหลว · ไม่ต้อง taper</li>
  <li><b>Antibiotic 5 วัน</b> เมื่อเสมหะเป็นหนอง มีประวัติติดเชื้อในปอด หรือต้องใช้เครื่องช่วยหายใจ · เชื้อบ่อย: <i>S. pneumoniae, H. influenzae, M. catarrhalis</i></li>
  <li>ไม่แนะนำ IV theophylline (S/E มากกว่าประโยชน์)</li>
  <li><b>Oxygen</b> แบบควบคุม เป้าหมาย <b>SpO₂ 88–92%</b> เลี่ยง CO₂ คั่ง · HFNT หรือ NIV เมื่อหายใจล้มเหลว ลดการใส่ท่อ ลดวันนอน เพิ่มอัตรารอด</li>
  <li>เริ่มยาควบคุมออกฤทธิ์ยาว (LABD) ให้เร็วที่สุด · กำเริบ ≥ 1 ครั้งร่วมกับ eos สูง พิจารณาเพิ่ม ICS ก่อน discharge</li>
  <li><b>Discharge bundle:</b> ทบทวนเทคนิคยาสูด ส่งฟื้นฟูปอด นัดภายใน 1 เดือน ประเมินซ้ำที่ 12–16 สัปดาห์ (ฟื้นตัว 4–6 สัปดาห์)</li>
</ul>
<h3>บริบทประเทศไทย</h3>
<ul>
  <li>แนวทางไทย 2565: <b>LAMA เป็นยาชนิดแรก</b> · ICS/LABA เฉพาะ eos &gt; 300 (ICS เพิ่มปอดอักเสบ)</li>
  <li><b>Tiotropium</b> อยู่ในบัญชียาหลักแห่งชาติ (เพิ่มสมรรถภาพปอด ลดเหนื่อย ลดกำเริบ ปลอดภัย ต้นทุนต่ำกว่า ICS/LABA)</li>
  <li>ไม่แนะนำ theophylline เดี่ยว ยาขยายหลอดลมรับประทานเป็นยาหลัก และ oral corticosteroid ระยะยาว</li>
  <li>Biologics และ ensifentrine ยังจำกัดด้านราคาและการเข้าถึง</li>
</ul>` },
    { id: 'pharmacist', t: 'บทบาทเภสัชกร', html: `<h3>เทคนิคการใช้ยาสูด</h3>
<ul>
  <li>ประเมินทุกครั้ง และตรวจเทคนิค/adherence ก่อนเพิ่มยาเสมอ</li>
  <li><b>pMDI:</b> กดยาพร้อมหายใจเข้าช้าและลึก กลั้นหายใจ ~10 วินาที · ประสานไม่ได้ใช้ spacer</li>
  <li><b>DPI:</b> หายใจเข้าเร็วและแรง ไม่เหมาะกับผู้ที่แรงสูดไม่พอ (ผู้สูงอายุมาก ขณะกำเริบ) · <b>ห้ามล้างน้ำ</b> เช็ดด้วยผ้าแห้ง</li>
  <li>เลี่ยงให้ใช้หลายอุปกรณ์ที่เทคนิคต่างกัน · บ้วนปากหลังพ่นยาที่มี ICS</li>
</ul>
<h3>Adherence และการเลิกบุหรี่</h3>
<ul>
  <li>ยาวันละครั้งหรือ single inhaler ช่วย adherence</li>
  <li>เลิกบุหรี่สำเร็จ → CYP1A2 ไม่ถูกเหนี่ยวนำ ระดับ theophylline สูงขึ้น ต้องปรับขนาดและติดตามระดับ</li>
</ul>
<h3>อันตรกิริยากับสมุนไพร/ผลิตภัณฑ์เสริม</h3>
<div class="tbl"><table>
  <tr><th>ผลิตภัณฑ์</th><th>ผลและข้อควรระวัง</th></tr>
  <tr><td>Ephedrine/ma huang, คาเฟอีนสูง</td><td>เสริมฤทธิ์กระตุ้นหัวใจกับ β2-agonist และ theophylline ใจสั่น หัวใจเต้นผิดจังหวะ</td></tr>
  <tr><td>ชะเอมเทศ (licorice)</td><td>K⁺ ต่ำ ซ้ำเติม K⁺ ต่ำจาก β2-agonist ขนาดสูงและ systemic corticosteroid</td></tr>
  <tr><td>St. John's wort</td><td>CYP3A4/1A2 inducer ลดระดับ theophylline, roflumilast, salmeterol, ICS</td></tr>
  <tr><td>น้ำเกรปฟรุต/สมุนไพรยับยั้ง CYP3A4</td><td>เพิ่มระดับ salmeterol, ICS, roflumilast</td></tr>
  <tr><td>แปะก๊วย ขิง กระเทียมขนาดสูง</td><td>เพิ่มเลือดออกเมื่อใช้ร่วมยาต้านเกล็ดเลือด/ต้านการแข็งตัวของเลือด</td></tr>
</table></div>
<p>หยุดสมุนไพร 1–2 สัปดาห์ก่อนผ่าตัด · ผลิตภัณฑ์เสริมใช้แทนยาสูดหรือการเลิกบุหรี่ไม่ได้</p>
<h3>เฝ้าระวังผลข้างเคียง</h3>
<ul>
  <li><b>ICS:</b> เชื้อราในปาก เสียงแหบ ปอดอักเสบ</li>
  <li><b>LAMA:</b> ปากแห้ง ปัสสาวะลำบาก ระวังต้อหินมุมปิดและ BPH</li>
  <li><b>β2-agonist:</b> ใจสั่น มือสั่น K⁺ ต่ำ</li>
  <li><b>Roflumilast:</b> ท้องเสีย น้ำหนักลด คิดฆ่าตัวตาย</li>
  <li><b>Azithromycin:</b> QT prolongation การได้ยินลดลง</li>
  <li>ลด polypharmacy · COPD ไม่ใช่ข้อห้ามของ cardioselective beta-blocker เมื่อมีข้อบ่งใช้ทางหัวใจ · ทบทวนวัคซีนทุกครั้ง</li>
</ul>` },
  ],
  questions: [
    { q: 'ข้อใดไม่ถูกต้องเกี่ยวกับการวินิจฉัยโรคปอดอุดกั้นเรื้อรังตาม GOLD 2026', o: ['ใช้ค่า post-bronchodilator FEV1/FVC < 0.70 เป็นเกณฑ์วินิจฉัย', 'ใช้ค่า post-bronchodilator FEV1 (%predicted) ในการแบ่งระดับ GOLD 1–4', 'หลังพ่นยาขยายหลอดลม ค่า FEV1/FVC จะเพิ่มขึ้นจนมากกว่า 0.70', 'Pre-bronchodilator spirometry ใช้เพื่อตัดโรคออกได้', 'ไม่แนะนำให้ใช้ bronchodilator reversibility ในการแยกโรคหืดออกจาก COPD'], a: 2, e: 'การอุดกั้นใน COPD เป็นแบบ persistent ค่า FEV1/FVC หลังพ่นยาจึงยัง < 0.70 (ถ้าเกินแสดงว่าไม่ใช่ COPD) · เกณฑ์วินิจฉัยใช้ ratio ความรุนแรงใช้ FEV1 · pre-BD ใช้ rule out ได้แต่ยืนยันไม่ได้ · reversibility พบใกล้เคียงกันทั้งสองโรค' },
    { case: CASE, q: 'ข้อใดถูกต้องเกี่ยวกับผู้ป่วยรายนี้ (ตาม GOLD 2026)', o: ['มีประวัติสูบบุหรี่ 15 pack-year', 'จัดอยู่ใน GOLD grade 2', 'จัดอยู่ในกลุ่ม B เพราะกำเริบเพียง 1 ครั้งและไม่ได้นอนโรงพยาบาล', 'ถูกทั้งเรื่อง GOLD grade 2 และกลุ่ม B', 'ถูกทั้งเรื่อง 15 pack-year, GOLD grade 2 และกลุ่ม B'], a: 1, e: 'Pack-year = (20 ÷ 20) × 30 = 30 · FEV1 55% = GOLD 2 · GOLD 2026 ให้ผู้ที่กำเริบ moderate/severe ≥ 1 ครั้งเข้ากลุ่ม E ทันที ผู้ป่วยจึงเป็นกลุ่ม E ไม่ใช่ B' },
    { case: CASE, q: 'ผู้ป่วยรายนี้ควรได้รับยาเริ่มแรก (first choice) ตาม GOLD 2026 ในข้อใด', o: ['LABA เดี่ยว หรือ LAMA เดี่ยว', 'LABA + LAMA', 'LABA + ICS', 'LABA + LAMA + ICS', 'SABA prn เพียงอย่างเดียว'], a: 1, e: 'กลุ่ม E เริ่ม LABA + LAMA · เพิ่ม ICS ตั้งแต่แรกเมื่อ eos ≥ 300 (รายนี้ 150) · GOLD 2026 คัดค้าน LABA + ICS ใน COPD ที่ไม่มีลักษณะหืด · ยาเดี่ยวเป็นคำตอบตาม GOLD ก่อนปี 2023 · SABA prn ไม่พอสำหรับผู้ที่มีอาการและกำเริบ' },
    { case: CASE, q: 'ติดตาม 1 ปี ผู้ป่วยใช้ LABA + LAMA สม่ำเสมอ เทคนิคถูกต้อง แต่ยังกำเริบอีก 2 ครั้ง eosinophil ขณะโรคสงบ 2 ครั้ง = 240 และ 260 cells/µL ไม่มีประวัติปอดอักเสบหรือติดเชื้อ mycobacteria ควรปรับการรักษาอย่างไร', o: ['เปลี่ยนเป็น LABA + ICS', 'เพิ่มเป็น LABA + LAMA + ICS', 'เพิ่ม theophylline ชนิดออกฤทธิ์นาน', 'เริ่ม dupilumab ฉีดใต้ผิวหนัง', 'เพิ่ม roflumilast โดยไม่ต้องเพิ่ม ICS'], a: 1, e: 'ยังกำเริบทั้งที่ได้ LABA + LAMA และ eos ≥ 100 → triple therapy (IMPACT, ETHOS, TRINITY, TRIBUTE) · LABA + ICS เป็นการถอด LAMA · theophylline ใช้เมื่อเข้าไม่ถึงยาอื่น · dupilumab สงวนไว้เมื่อ triple แล้วยังกำเริบและ eos ≥ 300 · roflumilast เหมาะกับ chronic bronchitis และ FEV1 < 50% ที่ได้ยาสูดเต็มที่แล้ว' },
    { q: 'ข้อใดไม่ถูกต้องเกี่ยวกับการให้คำแนะนำการใช้ยาสูด', o: ['ยาพ่นชนิด DPI ต้องสูดหายใจเข้าเร็วและแรง', 'ยาพ่นชนิด MDI ควรสูดหายใจเข้าช้าและลึก แล้วกลั้นหายใจประมาณ 10 วินาที', 'ผู้ป่วยที่ประสานการกดยากับการหายใจไม่ได้ ควรใช้ spacer ร่วมกับ MDI', 'หลังพ่นยาที่มีส่วนผสมของ corticosteroid ควรกลั้วปากและคอแล้วบ้วนทิ้ง', 'ควรล้างอุปกรณ์ DPI ด้วยน้ำหลังใช้ทุกครั้งเพื่อป้องกันการปนเปื้อน'], a: 4, e: 'DPI เป็นผงยาแห้ง ห้ามล้างน้ำหรือให้โดนความชื้น ผงยาจะจับตัวเป็นก้อน ขนาดยาคลาดเคลื่อน ให้เช็ดด้วยผ้าแห้ง · ข้ออื่นถูกต้อง' },
  ],
}
