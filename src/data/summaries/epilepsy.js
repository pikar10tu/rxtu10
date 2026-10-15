// Epilepsy & status epilepticus — converted from the RxTU10 class summary PDF (see content/summaries/manifest.json)
const fig = (f, cap, alt) => `<figure><img data-fig="epilepsy/${f}.webp" alt="${alt || cap}"><figcaption>${cap}</figcaption></figure>`

export default {
  id: 'epilepsy',
  date: '25/07/2026',
  refs: [
    'World Health Organization. Epilepsy [fact sheet]. 2024.',
    'Beghi E, Giussani G, Sander JW. The natural history and prognosis of epilepsy. Epileptic Disord. 2015;17(3):243–53.',
    'Asawavichienjinda T, Sitthi-Amorn C, Tanyanont W. Prevalence of epilepsy in rural Thailand: a population-based study. J Med Assoc Thai. 2002;85(10):1066–73.',
    'Betjemann JP, Lowenstein DH. Status epilepticus in adults. Lancet Neurol. 2015;14(6):615–24.',
    'สถาบันประสาทวิทยา กรมการแพทย์. แนวทางเวชปฏิบัติโรคลมชัก. 2564.',
    'Fisher RS, et al. Instruction manual for the ILAE 2017 operational classification of seizure types (Japanese translation). てんかん研究. 2019;37(1):24–36.',
    'De Palma L, et al. Epileptogenic network formation. Neurosurg Clin N Am. 2020;31(3):335–44.',
    'Lowenstein DH. Seizures and epilepsy. In: Harrison\'s Principles of Internal Medicine, 20e. McGraw-Hill; 2018.',
    'Pescarmona G. Epilepsy. 2010.',
    'NICE. Epilepsies in children, young people and adults [NG217]. 2022.',
    'Phelps SJ, Wheless JW. Status epilepticus. In: DiPiro JT, et al. Pharmacotherapy: A Pathophysiologic Approach, 10e และ 11e. McGraw-Hill; 2017, 2020.',
    'Nguyen V-HV, Dergalust S, Chang E. Epilepsy. In: DiPiro\'s Pharmacotherapy: A Pathophysiologic Approach, 12e. McGraw Hill; 2023.',
    'Rogawski MA. Revisiting AMPA receptors as an antiepileptic drug target. Epilepsy Curr. 2011;11(2):56–63.',
    'Trinka E, et al. A definition and classification of status epilepticus — Report of the ILAE Task Force. Epilepsia. 2015;56(10):1515–23.',
    'Glauser T, et al. Evidence-based guideline: treatment of convulsive status epilepticus in children and adults. Epilepsy Curr. 2016;16(1):48–61.',
    'Silbergleit R, et al. Intramuscular versus intravenous therapy for prehospital status epilepticus (RAMPART). N Engl J Med. 2012;366(7):591–600.',
    'Phillips EJ, et al. CPIC guideline for HLA genotype and use of carbamazepine and oxcarbazepine: 2017 update. Clin Pharmacol Ther. 2018;103(4):574–81.',
    'Glauser TA, et al. Ethosuximide, valproic acid, and lamotrigine in childhood absence epilepsy. N Engl J Med. 2010;362(9):790–9.',
    'Stafstrom CE, Carmant L. Seizures and epilepsy: an overview for neuroscientists. Cold Spring Harb Perspect Med. 2015;5(6).',
  ],
  sections: [
    { id: 'epi', t: 'Epidemiology', html: `<ul>
  <li>โรคลมชักเป็นโรคระบบประสาทเรื้อรังที่พบบ่อยที่สุดโรคหนึ่ง ผู้ป่วยราว 50 ล้านคนทั่วโลก ประมาณ 80% อยู่ในประเทศรายได้ต่ำถึงปานกลาง และกว่า 75% เข้าไม่ถึงการรักษา (treatment gap)</li>
  <li>Incidence ประมาณ 50–70 ราย/100,000 คน/ปี · ความชุกของ active epilepsy 4–10 ราย/1,000 คน</li>
  <li>การกระจายตามอายุเป็นรูป U-shape (bimodal): สูงสุดในเด็ก &lt; 1 ปี และผู้สูงอายุ &gt; 60 ปี (สาเหตุหลักในผู้สูงอายุคือ stroke)</li>
  <li>ประเทศไทย: ความชุกประมาณ 7 ราย/1,000 คน · สาเหตุเฉพาะถิ่นในเอเชียตะวันออกเฉียงใต้ เช่น neurocysticercosis วัณโรคเยื่อหุ้มสมอง ไข้สมองอักเสบเจอี การบาดเจ็บที่ศีรษะจากอุบัติเหตุจราจร</li>
  <li><b>Status epilepticus (SE):</b> 10–41 ราย/100,000 คน/ปี อัตราตายในผู้ใหญ่ราว 15–20% และ 30–50% ใน refractory SE · ปัจจัยทำนายสำคัญที่สุดคือสาเหตุ อายุ และระยะเวลาที่ชักก่อนได้รับการรักษา</li>
  <li><b>SUDEP</b> (sudden unexpected death in epilepsy): ประมาณ 1.2 ราย/1,000 คน-ปีในผู้ใหญ่ · ปัจจัยเสี่ยงสำคัญที่สุดคือ GTC ที่ควบคุมไม่ได้ (&gt; 3 ครั้ง/ปี) ชักขณะนอนหลับ นอนคว่ำ ใช้ยาหลายชนิด และไม่ร่วมมือใช้ยา</li>
</ul>` },
    { id: 'def', t: 'นิยามและการจำแนก', html: `<p><b>Seizure (อาการชัก)</b> คืออาการหรืออาการแสดงที่เกิดขึ้นทันทีทันใดจากเซลล์ประสาทที่มีคลื่นผิดปกติมากเกินไป หรือ synchronous กันของสมอง</p>
<p>ผู้ที่ชักไม่จำเป็นต้องเป็นโรคลมชักเสมอไป อาจเป็นการชักครั้งแรกจากปัจจัยกระตุ้น (<b>provoked seizure</b>) เช่น ความผิดปกติทางเมตาบอลิกจากยา หรือไข้สูงในเด็ก โดยไม่มีพยาธิสภาพที่สมอง จึงไม่ถือเป็นโรคลมชัก</p>
<p><b>Epilepsy (โรคลมชัก)</b> คือโรคของสมองที่มีภาวะใดภาวะหนึ่ง</p>
<ol>
  <li>Unprovoked (หรือ reflex) seizure 2 ครั้ง ห่างกันอย่างน้อย 24 ชั่วโมง</li>
  <li>Unprovoked (หรือ reflex) seizure ครั้งเดียว แต่โอกาสชักซ้ำใน 10 ปีพอ ๆ กับหลังชัก 2 ครั้ง (อย่างน้อย 60%)</li>
  <li>ได้รับการวินิจฉัยเป็น epilepsy syndrome</li>
</ol>
<p>ถือว่าโรค <b>resolved</b> เมื่ออายุพ้นช่วงของ epilepsy syndrome นั้น หรือไม่ชักนาน 10 ปีโดยหยุดยากันชักมาแล้ว 5 ปี</p>
<h3>Classification (ILAE 2017)</h3>
<p>แบ่งตามลักษณะอาการชักที่เด่นชัดในช่วงแรกเป็น focal onset หรือ generalized onset หากไม่ทราบช่วงเริ่มต้นจัดเป็น unknown onset</p>
<div class="tbl"><table>
  <tr><th>Focal onset</th><th>Generalized onset</th><th>Unknown onset</th></tr>
  <tr><td><b>Aware / Impaired awareness</b><br><b>Motor onset:</b> automatisms, atonic, clonic, epileptic spasms, hyperkinetic, myoclonic, tonic<br><b>Non-motor onset:</b> autonomic, behavior arrest, cognitive, emotional, sensory<br><b>Focal to bilateral tonic-clonic</b></td>
  <td><b>Motor:</b> tonic-clonic, clonic, tonic, myoclonic, myoclonic-tonic-clonic, myoclonic-atonic, atonic, epileptic spasms<br><b>Non-motor (absence):</b> typical, atypical, myoclonic, eyelid myoclonia</td>
  <td><b>Motor:</b> tonic-clonic, epileptic spasms<br><b>Non-motor:</b> behavior arrest<br><b>Unclassified</b></td></tr>
</table></div>
<ul>
  <li><b>Focal onset</b> ประเมินตามลำดับ
    <ul>
      <li>ความรู้สึกตัว: <b>aware</b> (รับรู้ตนเองและสิ่งแวดล้อมขณะชักแม้เคลื่อนไหวไม่ได้) หรือ <b>impaired awareness</b> (สูญเสียความรู้สึกตัวช่วงใดช่วงหนึ่ง) · ถ้าประเมินไม่ได้ให้ข้ามไปประเมินการเคลื่อนไหว</li>
      <li>Motor หรือ non-motor โดยดูจากอาการนำแรก</li>
      <li><b>Focal to bilateral tonic-clonic:</b> คลื่นชักกระจายไปทั่วสมองภายหลัง ทำให้เกร็งกระตุกทั้งตัวและไม่รู้สึกตัวตามมา</li>
    </ul>
  </li>
  <li><b>Generalized onset</b> คลื่นชักกระจายทั่วสมองทั้ง 2 ข้างอย่างรวดเร็วตั้งแต่แรก มักชักทั้งตัวและไม่รู้สึกตัวตั้งแต่แรก · ถ้าอาการไม่เท่ากันสองข้างอาจสับสนกับ focal ต้องอาศัย EEG ช่วย</li>
  <li><b>Unknown onset</b> บอก onset ไม่ได้ · ควรมั่นใจเรื่อง onset &gt; 80% จึงสรุปชนิดได้ ถ้าไม่แน่ใจให้ใช้ unknown onset ไปก่อน</li>
</ul>` },
    { id: 'etio', t: 'สาเหตุ ปัจจัยเสี่ยง และการวินิจฉัย', html: `<h3>Etiology</h3>
<ol>
  <li><b>Structural:</b> ความผิดปกติของเนื้อสมองที่เห็นจาก MRI/CT สัมพันธ์กับอาการชักและ EEG เช่น hippocampal sclerosis ความพิการแต่กำเนิด เนื้องอก stroke</li>
  <li><b>Genetic:</b> การกลายพันธุ์ของยีน ถ่ายทอดจากพ่อแม่หรือเกิดใหม่ · ยีนเดียวทำให้เกิดอาการชักรุนแรงต่างกันได้หลายแบบ</li>
  <li><b>Infectious:</b> พบบ่อยทั่วโลก เช่น วัณโรคสมอง neurocysticercosis HIV มาลาเรียขึ้นสมอง ไวรัสซิกาแต่กำเนิด</li>
  <li><b>Metabolic:</b> เช่น uremia ความผิดปกติของกรดอะมิโน pyridoxine-dependent seizure</li>
  <li><b>Immune:</b> การอักเสบในระบบประสาทส่วนกลางจากภูมิคุ้มกัน เช่น anti-NMDA receptor encephalitis</li>
  <li><b>Unknown:</b> อาการชัดเจนแต่ยังระบุสาเหตุไม่ได้</li>
</ol>
<h3>Risk factors</h3>
<div class="tbl"><table>
  <tr><th>สถานการณ์</th><th>ปัจจัยเสี่ยง</th></tr>
  <tr><td>ชักจากไข้ → โรคลมชัก</td><td>ประวัติครอบครัวเป็นโรคลมชัก · complex febrile seizure (ชัก &gt; 15 นาที หรือชักซ้ำใน 24 ชม.) · พัฒนาการช้าหรือสมองพิการ · ชักภายในชั่วโมงแรกหลังมีไข้ · เคยชักจากไข้ &gt; 3 ครั้ง (โอกาสเพิ่ม 10 เท่า)</td></tr>
  <tr><td>ชักซ้ำหลังชักครั้งแรก</td><td>ตรวจพบความผิดปกติทางระบบประสาท · เคยติดเชื้อ ผ่าตัด หรืออุบัติเหตุทางสมอง · ชักเฉพาะส่วน · CT/MRI ผิดปกติสัมพันธ์กับอาการ · EEG ผิดปกติ · neurocutaneous syndrome</td></tr>
  <tr><td>หลอดเลือดสมอง / สมองบาดเจ็บ</td><td><b>TBI:</b> เสี่ยงชักระยะแรกถ้า GCS &lt; 10 กะโหลกแตก เลือดออกในสมอง หรือสูญเสียความจำ &gt; 30 นาที · <b>ICH:</b> เลือดออกที่ผิวสมอง (cortex) หรือสมองเสื่อมชนิดมีเลือดออกขนาดเล็ก · <b>ทารกแรกเกิด:</b> โครงสร้างสมองผิดปกติ</td></tr>
  <tr><td>ชักซ้ำหลังหยุดยา</td><td>IQ &lt; 70 · เริ่มชักตั้งแต่อายุน้อย ชักบ่อย · โรคลมชักบางชนิดที่ไม่ควรหยุดยา เช่น JME, Lennox-Gastaut syndrome · กลุ่มที่ทราบสาเหตุชัดเจน</td></tr>
</table></div>
<h3>Diagnosis (คร่าว ๆ)</h3>
<ol>
  <li>ตรวจทางห้องปฏิบัติการ เช่น เลือด น้ำไขสันหลัง</li>
  <li>ตรวจการทำงานของสมอง เช่น EEG, SPECT, PET</li>
  <li>ตรวจลักษณะทางกายภาพของสมอง เช่น CT, MRI</li>
</ol>` },
    { id: 'patho', t: 'Pathophysiology และอาการ', html: `<p><b>กลไกหลัก:</b> ไม่สมดุลระหว่างการกระตุ้น (excitatory, glutamatergic) และการยับยั้ง (inhibitory, GABAergic) ที่ระดับ synapse → <mark>excitatory มาก inhibitory น้อย</mark></p>
<ul>
  <li>หลักฐาน: GABA<sub>A</sub> antagonists หรือ glutamate receptor agonists (NMDA, AMPA, kainate) กระตุ้นให้ชักในสัตว์ปกติได้</li>
  <li>ระดับเซลล์: interictal spikes ใน EEG สัมพันธ์กับ large depolarization (Na⁺ และ Ca²⁺ ไหลเข้ามาก) และ action potential ถี่ ๆ · long-lasting depolarization ก็ทำให้ชักได้</li>
  <li>ปกติ excitatory ถูกคุมโดย inhibitory interneurons แต่ genetic mutation, trauma หรือ abnormal development รบกวนสมดุล → cortical network hyperexcitable</li>
</ul>
${fig('p08-1', 'สมดุลระหว่าง excitation (EPSPs, Na⁺/Ca²⁺ influx) กับ inhibition (IPSPs, K⁺ efflux, Cl⁻ influx)')}
<h3>Clinical presentation และคำศัพท์</h3>
<ul>
  <li><b>Aura:</b> การมองเห็นผิดปกติ เช่น แสงวูบวาบ แสงกะพริบ เส้นซิกแซก มักมาก่อนชักใน focal seizure และอาจมีใน generalized</li>
  <li><b>Prodrome:</b> อาการนำก่อนชัก เช่น อารมณ์/พฤติกรรมเปลี่ยน เวียนศีรษะ ไม่มีสมาธิ (aura เป็นส่วนหนึ่งของ prodrome)</li>
  <li><b>Post-ictal:</b> ตื่นแต่คุยไม่รู้เรื่อง ไม่มีสติ หลังชัก · เช็คโดยถาม time, place, person</li>
  <li><b>Seizure:</b> กระแสไฟฟ้าในสมองผิดปกติ ทำให้ลักษณะทางกายหรือพฤติกรรมผิดปกติ</li>
  <li><b>Convulsion:</b> การชักที่แสดงออกทางกล้ามเนื้อ</li>
  <li><b>Unprovoked seizure:</b> สัมพันธ์กับ epilepsy หรือชักที่ไม่ทราบสาเหตุ</li>
  <li><b>Refractory seizure:</b> ได้ยากันชัก ≥ 2 ชนิดแล้วไม่ได้ผล และชัก ≥ 1 ครั้ง/เดือน ติดต่อกัน 18 เดือน</li>
</ul>` },
    { id: 'pharm', t: 'เภสัชวิทยาของยากันชัก', html: `<p><b>ลด excitation</b></p>
<ul>
  <li>ยับยั้ง voltage-gated ion channel (Na⁺, Ca²⁺)</li>
  <li>ลด glutamatergic neurotransmission</li>
  <li>ลด fast glutamate-mediated excitation</li>
</ul>
<p><b>เพิ่ม inhibition</b></p>
<ul>
  <li>เพิ่ม GABAergic</li>
  <li>Potassium channel opener ให้ K⁺ ออกจากเซลล์ → เกิด hyperpolarization</li>
</ul>
<p style="font-size:.9em">ต้นฉบับเขียนว่า K⁺ opener "ลดภาวะ hyperpolarization" แต่การให้ K⁺ ออกจากเซลล์ทำให้เกิด hyperpolarization (เซลล์ถูกกระตุ้นยากขึ้น) จึงแก้ข้อความ</p>
${fig('p09-1', 'ตำแหน่งออกฤทธิ์ของยากันชักที่ excitatory glutamatergic และ inhibitory GABAergic synapse (Pescarmona) — กรอบแดงคือยาที่ควรจำ')}
<div class="tbl"><table>
  <tr><th>เป้าหมาย</th><th>ยา (ควรจำ)</th></tr>
  <tr><td>Voltage-gated Na⁺ channel</td><td>Phenytoin, carbamazepine, oxcarbazepine, eslicarbazepine, lamotrigine, lacosamide, zonisamide</td></tr>
  <tr><td>SV2A</td><td>Levetiracetam, brivaracetam</td></tr>
  <tr><td>GABA<sub>A</sub> receptor</td><td>Benzodiazepines, barbiturates, topiramate, stiripentol</td></tr>
  <tr><td>AMPA receptor</td><td>Perampanel, topiramate</td></tr>
  <tr><td>NMDA receptor</td><td>Felbamate, valproate</td></tr>
  <tr><td>T-type Ca²⁺ channel</td><td>Ethosuximide</td></tr>
  <tr><td>α2δ subunit of Ca²⁺ channel</td><td>Gabapentin, pregabalin</td></tr>
  <tr><td>KCNQ K⁺ channel</td><td>Retigabine</td></tr>
  <tr><td>GAT-1 / GABA transaminase</td><td>Tiagabine / vigabatrin (valproate เพิ่ม GABA turnover)</td></tr>
</table></div>` },
    { id: 'tx', t: 'หลักการรักษาและการเลือกยา', html: `<h3>Non-pharmacologic</h3>
<p>Ketogenic diet (ketone ที่สร้างขึ้นช่วย suppress อาการชัก) · vagus nerve stimulation · responsive neurostimulation · surgery</p>
<h3>เมื่อไหร่ควรเริ่มยา</h3>
<ul>
  <li>ต้องวินิจฉัยว่าเป็น epilepsy ก่อน · ถ้าชักครั้งเดียวและเห็นชักอยู่ อาจให้แค่ benzodiazepine แล้วไม่ต้องให้ยาต่อ</li>
  <li>ให้ยาต่อเนื่องเมื่อวินิจฉัยว่าเป็น epilepsy จริง (≥ 2 unprovoked seizure ห่างกันเกิน 24 ชม.)</li>
  <li>เลือกยาตามตำแหน่ง/ลักษณะอาการชัก และดูว่าผู้ป่วยใช้ยาได้หรือไม่</li>
  <li>ต้องใช้ยาต่อเนื่องอย่างน้อย 2 ปี · หลัง 2 ปีถ้าหยุดยาโอกาสชักซ้ำน้อยลง</li>
</ul>
${fig('p10-1', 'การดูแลผู้ป่วยที่มีอาการชักครั้งแรกและชักซ้ำ (แนวทางเวชปฏิบัติโรคลมชัก)')}
${fig('p11-1', 'การเลือกยาในผู้ที่วินิจฉัยว่าเป็นโรคลมชักแล้ว: focal → CBZ, PHT, VPA, PB · ชนิดอื่น/ไม่ทราบชนิด → VPA')}
<h3>เลือกยาตามชนิดการชัก (NICE NG217)</h3>
<div class="tbl"><table>
  <tr><th>ชนิด</th><th>1st line</th><th>2nd line</th><th>3rd line</th></tr>
  <tr><td>Myoclonic</td><td>Sodium valproate</td><td>Levetiracetam หรือ topiramate</td><td>Clobazam, clonazepam หรือ zonisamide</td></tr>
  <tr><td>Absence</td><td>Ethosuximide หรือ sodium valproate</td><td>Lamotrigine</td><td>Clobazam, clonazepam, levetiracetam, topiramate หรือ zonisamide</td></tr>
  <tr><td>Tonic / atonic</td><td>Sodium valproate</td><td>Lamotrigine</td><td>Rufinamide และ topiramate</td></tr>
</table></div>
<p style="font-size:.9em">ต้นฉบับเขียน 1st line ของ tonic/atonic ว่า "ethosuximide or sodium valproate" (ซ้ำกับ absence) แต่ NICE NG217 ให้ sodium valproate เป็น 1st line เพียงตัวเดียว (ethosuximide ไม่ครอบคลุม tonic/atonic) จึงแก้ในตาราง</p>` },
    { id: 'se', t: 'Status epilepticus', html: `<p><b>Status epilepticus (SE)</b> คือชักนาน ≥ 5 นาที หรือชัก ๆ หยุด ๆ หลายครั้งโดยไม่กลับสู่ baseline · ถ้าไม่รักษาอาจเสียชีวิต</p>
<h3>สาเหตุของภาวะชักต่อเนื่อง</h3>
<div class="tbl"><table>
  <tr><th>ผู้ใหญ่</th><th>เด็ก</th></tr>
  <tr><td colspan="2"><b>ผู้ป่วยโรคลมชักเรื้อรัง</b></td></tr>
  <tr><td>Low antiepileptic drug level</td><td>Low antiepileptic drug level</td></tr>
  <tr><td colspan="2"><b>ผู้ป่วยที่เพิ่งเกิด SE ครั้งแรก</b></td></tr>
  <tr><td>Cerebrovascular diseases</td><td>Cerebrovascular diseases</td></tr>
  <tr><td>Remote brain injury / congenital malformations</td><td>Remote brain injury / congenital malformations</td></tr>
  <tr><td>Metabolic disturbance (low glucose, Ca, Mg, Na; high glucose; renal failure; liver failure)</td><td>Metabolic disturbance (เหมือนผู้ใหญ่)</td></tr>
  <tr><td>Anoxic brain injury</td><td>Anoxic brain injury</td></tr>
  <tr><td>Alcohol withdrawal</td><td>–</td></tr>
  <tr><td>CNS infection (encephalitis, brain abscess)</td><td>CNS infection</td></tr>
  <tr><td>Systemic infection (sepsis)</td><td>Systemic infection (sepsis)</td></tr>
  <tr><td>Brain neoplasm</td><td>–</td></tr>
  <tr><td>Drug intoxication (theophylline, imipenem, isoniazid, beta-lactams, clozapine, bupropion, 4-aminopyridine, cocaine)</td><td>Drug intoxication (เหมือนผู้ใหญ่)</td></tr>
  <tr><td>Drug withdrawal (benzodiazepine, barbiturate, baclofen)</td><td>Drug withdrawal (benzodiazepine, barbiturate, baclofen)</td></tr>
  <tr><td>Autoimmune encephalitis (anti-NMDA, anti-GABA-B, anti-GABA-A, anti-GAD, anti-LGI-1, Hashimoto's encephalopathy, IL-6 related SRSE, sero-negative)</td><td>Autoimmune encephalitis (anti-NMDA, IL-6 related SRSE, sero-negative)</td></tr>
  <tr><td>Traumatic brain injury</td><td>Traumatic brain injury</td></tr>
  <tr><td>Idiopathic</td><td>Idiopathic</td></tr>
  <tr><td>–</td><td>Febrile seizures</td></tr>
</table></div>
<h3>Clinical course และการรักษา</h3>
<div class="tbl"><table>
  <tr><th>ระยะ</th><th>การดูแล</th></tr>
  <tr><td><b>Initial</b> (0–5 นาที)</td><td>ความปลอดภัยของผู้ป่วย จัดสภาพแวดล้อม เริ่มจับเวลาตั้งแต่เริ่มชัก</td></tr>
  <tr><td><b>Early</b> (5–10 นาที)</td><td>ABC · ให้ benzodiazepine 1 ชนิด (เช่น diazepam, midazolam) · เจาะน้ำตาลปลายนิ้วและเกลือแร่</td></tr>
  <tr><td><b>Established</b> (10–30 นาที)</td><td>ยังไม่หยุดชัก → ยากันชัก IV 1 ชนิด เช่น phenytoin, phenobarbital, sodium valproate, levetiracetam, lacosamide</td></tr>
  <tr><td><b>Refractory</b> (30–60 นาที)</td><td>ใส่ท่อช่วยหายใจ ย้าย ICU · ยาดมสลบ เช่น midazolam, propofol, thiopental, ketamine · continuous EEG monitoring</td></tr>
  <tr><td><b>Super-refractory</b> (ชักต่อแม้ได้ยาดมสลบ 24 ชม.)</td><td>พิจารณา immunotherapy หรือวิธีอื่น เช่น magnesium, ketogenic diet, ผ่าตัด</td></tr>
</table></div>` },
    { id: 'aed', t: 'Practical points ของยากันชัก', html: `<h3>ยาฉีด</h3>
<div class="tbl"><table>
  <tr><th>ยา</th><th>ประเด็นสำคัญ</th></tr>
  <tr><td><b>Phenytoin inj.</b></td><td>ผสม <mark>NSS เท่านั้น</mark> (D5W ตกตะกอน) · infusion 25–50 mg/min <b>ห้ามเกิน 50 mg/min</b> (เกินอาจเกิด hypotension, arrhythmia) · liver toxicity (ยา 1st generation เกือบทุกตัว)</td></tr>
  <tr><td><b>Fosphenytoin inj.</b></td><td>Phosphate ester prodrug ของ phenytoin · 5 mg phenytoin = 7.5 mg fosphenytoin (= 5 mg PE) · ให้ได้ทั้ง IM และ IV · ผสมได้ทั้ง NSS และ D5W · max concentration 25 mg PE/mL</td></tr>
  <tr><td><b>Valproate inj.</b></td><td>Total level 50–100 mg/L · DI กับ <b>carbapenem</b> → ระดับ valproate ลดลง · monitor thrombocytopenia, hyperammonemia, LFT</td></tr>
  <tr><td><b>Levetiracetam inj.</b></td><td>ปรับขนาดตามไต (CrCl)</td></tr>
  <tr><td><b>Phenobarbital inj.</b></td><td>Enzyme inducer · level 10–40 mg/L · กดการหายใจ (ขนาดสูงอาจต้องใส่ท่อช่วยหายใจ)</td></tr>
  <tr><td><b>Lacosamide inj.</b></td><td>ใช้ไม่บ่อย · ระวัง AV block</td></tr>
</table></div>
<p style="font-size:.9em">ต้นฉบับเขียนผลของการ infuse phenytoin เร็วเกินว่า "hypertension" แต่ที่พบจริงคือ hypotension และหัวใจเต้นผิดจังหวะ จึงแก้ในตาราง</p>
<h3>ยารับประทาน</h3>
<div class="tbl"><table>
  <tr><th>ยา</th><th>Interaction / PK</th><th>TDM / ADR</th></tr>
  <tr><td><b>Phenobarbital</b></td><td>CYP inducer (2C19, 3A4)</td><td>10–40 mg/L · life-threatening: anticonvulsant hypersensitivity syndrome (AHS), hepatic failure, hematologic reactions</td></tr>
  <tr><td><b>Phenytoin</b></td><td>Metabolized by CYP2C9, 2C19 · CYP inducer (2C19, 3A4)</td><td>10–20 mg/L · dose-related: ataxia, nystagmus · chronic: gum hypertrophy</td></tr>
  <tr><td><b>Carbamazepine</b></td><td>Autoinducer (ลดระดับตัวเอง) · CYP inducer</td><td>Hyponatremia · <mark>HLA-B*15:02</mark> สัมพันธ์กับ SJS (cross-reaction กับ oxcarbazepine)</td></tr>
  <tr><td><b>Valproate</b></td><td>CYP2C9 inhibitor</td><td>Thrombocytopenia, hepatotoxicity, tremor · ระยะยาว: น้ำหนักขึ้น ผมร่วง</td></tr>
  <tr><td><b>Lamotrigine</b></td><td>–</td><td>Skin rash, SJS · cross-reaction กับ aromatic AEDs</td></tr>
  <tr><td><b>Topiramate</b></td><td>CYP3A4 inducer (ขนาดสูง)</td><td>Impaired verbal memory, น้ำหนักลด, metabolic acidosis</td></tr>
  <tr><td><b>Levetiracetam</b></td><td>ไม่ผ่าน CYP → ไม่มี DI กับยากันชักอื่น · ไตเสื่อมลดขนาด 50%</td><td>Behavioral problems (หงุดหงิด โมโหง่าย)</td></tr>
  <tr><td><b>Lacosamide</b></td><td>ผ่าน CYP แต่ไม่มี DI กับ AEDs อื่น</td><td>Heart block</td></tr>
  <tr><td><b>Perampanel</b></td><td>CYP3A4</td><td>Depression</td></tr>
</table></div>` },
  ],
  questions: [
    { q: 'ผู้ป่วยชายไทยอายุ 34 ปี น้ำหนัก 60 กก. มาห้องฉุกเฉินด้วยอาการชักเกร็งกระตุกทั้งตัวต่อเนื่องมาแล้ว 8 นาที ยังไม่สามารถเปิดเส้นเลือดดำได้ BP 140/85 mmHg, HR 118/min, น้ำตาลปลายนิ้ว 110 mg/dL ข้อใดเป็นการรักษาที่เหมาะสมที่สุดในขณะนี้', o: ['รอเปิดเส้นเลือดดำให้ได้ก่อน แล้วจึงให้ lorazepam 4 mg IV', 'ให้ midazolam 10 mg ฉีดเข้ากล้ามเนื้อทันที', 'ให้ phenytoin 1,200 mg หยดเข้าหลอดเลือดดำในอัตรา 50 mg/นาที', 'ให้ diazepam 10 mg ทางทวารหนัก แล้วรอสังเกตอาการ 15 นาที'], a: 1, e: 'เข้าเกณฑ์ convulsive SE แล้ว (ชัก ≥ 5 นาที = t1 ตาม ILAE 2015) ต้องรักษาทันที · ลำดับแรกคือ benzodiazepine ขนาดเต็ม เมื่อยังไม่มีเส้นเลือด midazolam 10 mg IM (น้ำหนัก > 40 กก.) แนะนำระดับ A — RAMPART พบว่าไม่ด้อยกว่า lorazepam IV และหยุดชักได้เร็วกว่า · ก ผิด: รอเปิดเส้นทำให้เสียเวลา และ benzodiazepine ได้ผลลดลงตามเวลา (GABA-A receptor ถูกดึงเข้าเซลล์) · ค ผิด: phenytoin เป็นยาลำดับที่ 2 และยังให้ IV ไม่ได้ · ง ผิด: ขนาดต่ำเกิน (ควร 0.2–0.5 mg/kg) และการรอ 15 นาทีขัดกับหลักการรักษาแบบมีกรอบเวลา' },
    { q: 'ผู้ป่วยหญิงอายุ 45 ปี น้ำหนัก 55 กก. เป็นโรคตับแข็ง Child-Pugh B ได้รับ lorazepam 4 mg IV ไปแล้ว 2 ครั้ง แต่ยังชักต่อเนื่อง ขณะนี้ผ่านไป 25 นาที ข้อใดเป็นยาลำดับที่สอง (second-line) ที่เหมาะสมที่สุด', o: ['Valproate 40 mg/kg IV', 'Levetiracetam 60 mg/kg IV', 'Phenobarbital 20 mg/kg IV', 'เพิ่ม lorazepam อีก 4 mg IV'], a: 1, e: 'ESETT (NEJM 2019): levetiracetam, fosphenytoin และ valproate ได้ผลไม่ต่างกัน (~45–47%) และปลอดภัยไม่ต่างกัน → เลือกตามโรคร่วม · ผู้ป่วยตับแข็งควรเลี่ยง valproate (พิษต่อตับ, hyperammonemic encephalopathy) · levetiracetam ไม่ผ่าน CYP ขับทางไตเป็นหลัก (60 mg/kg = 3,300 mg) · phenobarbital เป็นทางเลือกเมื่อไม่มียาข้างต้นเพราะกดการหายใจมาก · benzodiazepine ให้ซ้ำได้เพียง 1 ครั้ง' },
    { q: 'ผู้ป่วยชายอายุ 60 ปี ได้รับ phenytoin 300 mg/วัน มีไตวายเรื้อรังระยะที่ 3 (CrCl 45 mL/min) ผลตรวจ total phenytoin 8 mg/L, serum albumin 2.5 g/dL ผู้ป่วยยังคงมีอาการชักอยู่ ข้อใดถูกต้องที่สุด', o: ['ระดับยาต่ำกว่าเป้าหมายจริง ควรเพิ่มขนาดยา phenytoin', 'ระดับยาที่แก้ไขแล้วอยู่ในช่วงการรักษา ควรหาสาเหตุอื่นของการชักก่อนเพิ่มขนาดยา', 'ระดับยาที่แก้ไขแล้วสูงเกินช่วงการรักษา ควรลดขนาดยาลงทันที', 'ไม่สามารถแปลผลได้ ต้องส่งตรวจ free phenytoin ก่อนเสมอ'], a: 1, e: 'Phenytoin จับ albumin ~90% เมื่อ albumin ต่ำ total level จะดูต่ำกว่าจริง (Sheiner-Tozer: 8 / (0.2×2.5 + 0.1) ≈ 13 mg/L อยู่ในช่วง 10–20) · ไม่ควรเพิ่มขนาดอัตโนมัติเพราะ PK แบบ Michaelis-Menten เพิ่มเล็กน้อยระดับอาจพุ่ง · ทบทวนความร่วมมือ DI ปัจจัยกระตุ้น (อดนอน สุรา) หรือวินิจฉัยชนิดชักผิด · free phenytoin มีประโยชน์แต่ไม่จำเป็นเสมอ' },
    { q: 'เด็กชายไทยอายุ 8 ปี ได้รับการวินิจฉัยเป็น focal epilepsy แพทย์วางแผนจะเริ่มยา carbamazepine ข้อใดคือบทบาทของเภสัชกรที่สำคัญที่สุดก่อนเริ่มยา', o: ['ตรวจระดับ carbamazepine พื้นฐานก่อนเริ่มยา', 'แนะนำให้ตรวจยีน HLA-B*15:02 ก่อนเริ่มยา', 'แนะนำให้ตรวจ CYP2D6 genotype ก่อนเริ่มยา', 'ให้ผู้ป่วยรับประทานร่วมกับน้ำเกรปฟรุตเพื่อเพิ่มการดูดซึม'], a: 1, e: 'HLA-B*15:02 สัมพันธ์ชัดเจนกับ SJS/TEN จาก carbamazepine · CPIC: ผลบวกห้ามเริ่ม carbamazepine และ oxcarbazepine ให้เลือกยาอื่น เช่น levetiracetam หรือ lamotrigine (ระวัง lamotrigine ด้วย) · ไม่ต้องตรวจระดับยาก่อนเริ่ม · carbamazepine ผ่าน CYP3A4 ไม่ใช่ 2D6 · น้ำเกรปฟรุตยับยั้ง CYP3A4 ทำให้ระดับยาสูงจนเป็นพิษ' },
    { q: 'เด็กหญิงอายุ 7 ปี มีอาการเหม่อลอยหยุดกิจกรรมทันทีนาน 5–10 วินาที วันละหลายสิบครั้ง กลับมาปกติทันทีโดยไม่มีอาการสับสนหลังชัก EEG พบ generalized 3 Hz spike-and-wave ไม่เคยชักเกร็งกระตุกทั้งตัว ข้อใดเป็นยาที่เหมาะสมที่สุด และข้อใดเป็นยาที่ต้องหลีกเลี่ยง', o: ['เลือก ethosuximide; หลีกเลี่ยง carbamazepine', 'เลือก carbamazepine; หลีกเลี่ยง ethosuximide', 'เลือก gabapentin; หลีกเลี่ยง valproate', 'เลือก phenytoin; หลีกเลี่ยง lamotrigine'], a: 0, e: 'เข้าได้กับ childhood absence epilepsy · Childhood Absence Epilepsy Trial (NEJM 2010): ethosuximide และ valproate ดีกว่า lamotrigine และ ethosuximide กระทบสมาธิน้อยกว่า valproate → ยาลำดับแรกเมื่อไม่มี GTC ร่วม · กลไก: ปิด T-type Ca²⁺ channel ใน thalamic relay neuron · ยาที่ทำให้ absence แย่ลง: carbamazepine, oxcarbazepine, phenytoin, gabapentin, pregabalin, tiagabine, vigabatrin · ถ้ามี GTC ร่วมให้ใช้ valproate เพราะ ethosuximide ไม่ครอบคลุม GTC' },
  ],
}
