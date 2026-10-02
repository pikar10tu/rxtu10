// Hepatitis B — converted from the RxTU10 class summary PDF (see content/summaries/manifest.json)
// ต้นฉบับเขียนภาษาพูดสนุก ๆ เยอะ ผู้แปลงเรียบเรียงให้เป็นภาษากลางแต่เนื้อหาเท่าเดิม
export default {
  id: 'hbv',
  date: '23/07/69',
  refs: [
    "Division of AIDS and STIs, Department of Disease Control. Thailand's Hepatitis B Screening and Treatment Guidelines. 2022.",
    'University of Washington. Hepatitis B Online. https://www.hepatitisb.uw.edu/',
    'Tripathi N, Mousa OY. Hepatitis B. StatPearls (NBK555945); 2023.',
  ],
  sections: [
    { id: 'overview', t: 'Overview และ serology', html: `<ul>
  <li><b>Viral hepatitis:</b> ไวรัสทำลายและอักเสบที่ตับ ภูมิคุ้มกันดีกำจัดได้เอง ถ้ากำจัดไม่ได้กลายเป็นพังผืด (fibrosis) ตับแข็ง (cirrhosis) มะเร็งตับ · ไวรัส A, B, C, D, E (มียารักษาเฉพาะ B, C)</li>
  <li><b>Pathophysiology:</b> ไวรัสเข้าเซลล์ตับ ปล่อย DNA → สร้าง <b>cccDNA</b> (เป้าหมายหลักของ HBV)</li>
  <li><b>การติดต่อ:</b> เลือด/สารคัดหลั่ง (น้ำลาย น้ำอสุจิ น้ำในช่องคลอด) · เพศสัมพันธ์ · แม่สู่ลูก</li>
  <li><b>HBV:</b> DNA virus · ระยะฟักตัว 60–90 วัน · <mark>ไม่หายขาด 100% แต่คุมโรคได้</mark> · มีวัคซีนป้องกัน</li>
  <li><b>ผู้เสี่ยง:</b> คู่สมรส/คู่นอน ลูก พ่อแม่ พี่น้องร่วมพ่อแม่ของผู้ติดเชื้อ</li>
  <li><b>Severity:</b> ประเมินโรคตับด้วย APRI หรือ FIB-4</li>
</ul>
<h3>HBV markers</h3>
<div class="tbl"><table>
  <tr><th>Marker</th><th>ความหมาย</th></tr>
  <tr><td><b>HBsAg</b></td><td>สูงในการติดเชื้อทั้งเฉียบพลันและเรื้อรัง · <mark>เจอ = กำลังติดเชื้อ</mark></td></tr>
  <tr><td><b>Anti-HBs</b></td><td>มีภูมิ: หายจาก acute infection แล้ว หรือได้วัคซีน (ไม่เคยติด)</td></tr>
  <tr><td>HBcAg</td><td>ติดเชื้อเฉียบพลัน แต่มักวัดในเลือดไม่ได้ · เกี่ยวกับผู้ที่ต้องกินยากดภูมิหรือเคมีบำบัด</td></tr>
  <tr><td><b>Anti-HBc</b></td><td>ติดเชื้อเฉียบพลันและเรื้อรัง · <b>เคยติดแล้วเจอตลอดชีวิต</b> · บอกว่าเคยติดจริง (ไม่ใช่จากวัคซีน)</td></tr>
  <tr><td>HBeAg</td><td>มี viral replication</td></tr>
  <tr><td>Anti-HBe</td><td>ผ่านจุดสูงสุดของ viral replication แล้ว</td></tr>
  <tr><td><b>IgM anti-HBc</b></td><td>ติดเชื้อภายใน 6 เดือน (<b>เฉียบพลัน</b>)</td></tr>
</table></div>
<div class="tbl"><table>
  <tr><th>Test</th><th>Acute HBV</th><th>Past exposure (immunity)</th><th>ได้วัคซีน</th><th>Chronic HBV</th><th>Healthy carrier</th></tr>
  <tr><td>HBsAg</td><td>+</td><td>−</td><td>−</td><td>+</td><td>+</td></tr>
  <tr><td>Anti-HBs</td><td>−</td><td>+</td><td>+</td><td>−</td><td>−</td></tr>
  <tr><td>HBeAg</td><td>+</td><td>−</td><td>−</td><td>+/−</td><td>−</td></tr>
  <tr><td>Anti-HBe</td><td>−</td><td>+/−</td><td>−</td><td>+/−</td><td>+</td></tr>
  <tr><td>Anti-HBc</td><td>+</td><td>+</td><td><b>−</b></td><td>+</td><td>+</td></tr>
  <tr><td>IgM anti-HBc</td><td><b>+</b></td><td>−</td><td>−</td><td>−</td><td>−</td></tr>
  <tr><td>HBV DNA</td><td>+</td><td>−</td><td>−</td><td>+/−</td><td>−</td></tr>
  <tr><td>ALT</td><td>↑</td><td>ปกติ</td><td>ปกติ</td><td>↑</td><td>ปกติ</td></tr>
</table></div>
<figure><img data-fig="hbv/p03-2.webp" alt="กราฟ serology ของ HBV ตามเวลาหลังสัมผัสเชื้อ: HBsAg, HBeAg, anti-HBc, anti-HBe, anti-HBs และ window period"><figcaption>Serology ตามเวลา (มี window period ที่ HBsAg หายแต่ anti-HBs ยังไม่ขึ้น)</figcaption></figure>
<ul>
  <li><b>Acute:</b> ภูมิคุ้มกันถูกกระตุ้นมากพอ → ไข้ อ่อนเพลีย คลื่นไส้ ตัวตาเหลือง ปวดท้องชายโครงขวา</li>
  <li><b>Chronic:</b> มักไม่มีอาการ แต่พบ <b>HBsAg &gt; 6 เดือน</b> ปล่อยไว้นานกลายเป็นตับแข็งและมะเร็งตับ</li>
</ul>` },
    { id: 'tx', t: 'การรักษา', html: `<p><b>Goal:</b> ค่าการทำงานตับกลับปกติ ป้องกันตับอักเสบเฉียบพลัน · HBV DNA undetectable</p>
<p><b>ติดตาม:</b> ALT ทุก 3 เดือน · HBeAg, HBsAg, HBV DNA ทุก 6 เดือน</p>
<h3>ใครต้องได้รับการรักษา</h3>
<ol>
  <li>HBsAg ในเลือด ≥ 6 เดือน (chronic) HBeAg บวกหรือลบ ร่วมกับ
    <ul>
      <li><b>HBV DNA ≥ 2,000 IU/mL</b></li>
      <li><b>ALT ≥ 2 เท่าของค่าปกติ อย่างน้อย 2 ครั้ง นานกว่า 3 เดือน</b></li>
      <li>ALT ปกติ แต่มีปัจจัยเสี่ยงโรคตับเรื้อรัง (ชาย อายุ 40 ปี ครอบครัวเป็นตับแข็งหรือมะเร็งตับ ตรวจพบลักษณะโรคตับเรื้อรัง) หรือตรวจพบพังผืด/ตับแข็ง</li>
    </ul>
  </li>
  <li>มีตับแข็งหรือมะเร็งตับ</li>
</ol>
<p>ไม่มีข้อบ่งชี้ ติดตามประเมินตับทุก 3–6 เดือน</p>
<h3>Nucleos(t)ide analogues</h3>
<p>จับ active site ของ HBV polymerase รบกวน 5'→3' phosphodiester linkage ไวรัส copy ตัวเองไม่ได้ · <mark>ไม่ได้ลดความเสี่ยงมะเร็ง</mark> แต่ลด LFT และ viral load</p>
<div class="tbl"><table>
  <tr><th></th><th>Entecavir</th><th>Tenofovir</th><th>Lamivudine</th><th>Adefovir</th><th>Telbivudine</th></tr>
  <tr><td>กลไก / หมายเหตุ</td><td>ต้องเปลี่ยนเป็น triphosphate ก่อนออกฤทธิ์</td><td>ยับยั้ง polymerase และ RT · ใช้คู่ HIV ได้</td><td>ยับยั้ง polymerase และ RT · <b>lowest genetic barrier ดื้อยาง่าย</b> · ใช้คู่ HIV ได้</td><td>ใช้เมื่อแพ้หรือดื้อ tenofovir/entecavir</td><td>ต้องเติม phosphate ก่อนออกฤทธิ์</td></tr>
  <tr><td>ขนาด (oral)</td><td class="num">0.5 mg OD ท้องว่าง</td><td class="num">TDF 300 mg OD · TAF 25 mg OD</td><td class="num">100–150 mg OD</td><td class="num">10 mg OD</td><td class="num">600 mg OD</td></tr>
  <tr><td>ไตบกพร่อง</td><td>CrCl 30–&lt;50: 0.5 mg q48h · 10–&lt;30: q72h · &lt;10/HD: weekly (ถ้าดื้อ lamivudine ใช้ 1 mg ตามช่วงเดียวกัน)</td><td>TAF: ใช้ได้ถึง CrCl ≥ 15 · TDF: CrCl 30–49 300 mg q48h · 10–29 q72–96h</td><td>CrCl 30–&lt;50: 100 mg แล้ว 50 mg OD · 15–&lt;30: 100 แล้ว 25 mg OD · &lt;15: 35 mg แล้ว 10 mg OD · HD: 35 mg แล้ว 10 mg OD หลังฟอกไต</td><td>CrCl 20–49: 10 mg q48h · 10–19: q72h · HD: weekly หลังฟอก</td><td>CrCl 30–49: q48h · &lt;30: q72h · HD: q96h</td></tr>
  <tr><td>S/E</td><td>lactic acidosis ใน decompensated cirrhosis</td><td><b>nephrotoxicity</b>, BMD loss (TAF น้อยกว่า)</td><td>พบน้อย</td><td>nephrotoxicity (tubular dysfunction) · <b>severe exacerbation เมื่อหยุดเอง</b></td><td>CK เพิ่ม ปวดกล้ามเนื้อ คลื่นไส้</td></tr>
</table></div>
<p style="font-size:.9em">ต้นฉบับพิมพ์ตารางปรับขนาด lamivudine ช่วง CrCl &lt; 15 ว่า "35 mg then 100 mg weekly" ซึ่งน่าจะผิด ขนาดตามฉลากคือ 35 mg แล้ว 10 mg OD</p>
<a class="calc-link" href="#" data-calc="crcl">คำนวณ CrCl</a>
<h3>Immunomodulatory</h3>
<ul>
  <li><b>Interferon-α:</b> antiviral โดยตรง (ยับยั้ง replication) + ปรับภูมิคุ้มกัน (กระตุ้น T cell, NK cell, macrophage)</li>
  <li><b>Peg-IFN-α:</b> chronic HBV · t½ ยาว ฉีด SC สัปดาห์ละครั้ง 1 ปี · ไม่แนะนำในโรคไต · S/E: flu-like ปวดเมื่อย <b>mood disturbance (เสี่ยงฆ่าตัวตาย)</b> · C/I: active psychosis, neutropenia, โรคหัวใจมีอาการ, ลมชักคุมไม่ได้, acute HBV, decompensated disease</li>
</ul>
<h3>แนวทาง</h3>
<ul>
  <li><b>First line: tenofovir</b> · entecavir (ใช้ tenofovir ไม่ได้) · ไม่ตอบสนอง: switch to tenofovir หรือ add adefovir</li>
  <li>Peg-IFN (ไม่ให้ใน decompensated liver disease)</li>
  <li><b>HIV ร่วม:</b> TDF + 3TC/FTC</li>
  <li><b>ตั้งครรภ์ HBV DNA &gt; 2 ล้าน IU/mL:</b> tenofovir หรือ telbivudine (class B) ตั้งแต่อายุครรภ์ 24–32 สัปดาห์จนคลอด · <mark>ทารกแรกเกิดต้องได้ HBV vaccine และ HBIG</mark></li>
  <li><b>ภูมิบกพร่อง:</b> กินยาป้องกันตั้งแต่เริ่มรักษาจนถึงปีหลังหยุดยากดภูมิ</li>
  <li><b>HBV vaccine:</b> วัคซีนพื้นฐานทารก ฉีดต้นแขน 3 ครั้ง ที่ 0, 1–2, 6 เดือน</li>
</ul>` },
  ],
  questions: [
    { q: 'ยาตัวใดใช้รักษาไวรัสตับอักเสบบีได้', o: ['ATV/r', 'EFV', 'LPV/r', 'RPV', 'TDF'], a: 4, e: 'TDF รักษา hepatitis B ได้ ยาอื่นเป็นยาต้าน HIV ที่ไม่มีฤทธิ์ต่อ HBV' },
    { q: 'ชาย 37 ปี HBsAg negative, anti-HBs positive, anti-HBc positive, HBeAg negative, HBV DNA ไม่พบ ตรงกับข้อใด', o: ['Acute hepatitis B', 'Chronic hepatitis B', 'Post exposure', 'ได้รับวัคซีน', 'พาหะไวรัสตับอักเสบบี'], a: 2, e: 'Acute/chronic/พาหะต้องมี HBsAg positive · คนได้วัคซีนจะไม่มี anti-HBc positive (มีเฉพาะคนที่เคยติดจริง) จึงเป็น past exposure ที่หายแล้วมีภูมิ' },
    { q: 'หญิง 22 ปี HBsAg positive, anti-HBs negative, anti-HBc positive, IgM anti-HBc positive, HBeAg positive, HBV DNA 1,200 IU/mL, ALT 56, CrCl 130 ไม่มีอาการ เข้าได้กับข้อใด', o: ['Acute hepatitis B', 'Chronic hepatitis B', 'Post exposure', 'มีภูมิจากวัคซีน', 'พาหะไวรัสตับอักเสบบี'], a: 0, e: 'IgM anti-HBc positive บ่งบอกการติดเชื้อเฉียบพลัน แยกจาก chronic' },
    { q: 'จากข้อที่แล้ว ควรเริ่มการรักษาอย่างไร', o: ['TDF', 'Entecavir', 'Lamivudine', 'Adefovir', 'ไม่ต้องเริ่มยา'], a: 4, e: 'ยังไม่เข้าเกณฑ์ (HBV DNA < 2,000 IU/mL ALT ยังไม่ถึง 2 เท่า) HBV ไม่จำเป็นต้องได้ยาทุกราย' },
    { q: 'ชาย 23 ปี วินิจฉัย acute hepatitis B แพทย์เริ่ม TDF เภสัชกรควรติดตามผลข้างเคียงใดมากที่สุด', o: ['Creatine kinase', 'EKG', 'BP', 'ค่าการทำงานของไต', 'ผื่นตามผิวหนัง'], a: 3, e: 'TDF มีผลข้างเคียง nephrotoxicity' },
  ],
}
