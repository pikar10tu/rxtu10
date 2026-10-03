// ขนาดยาน้ำเด็ก — ถอดจากอินโฟกราฟิกของเพจ Facebook Pharmtutors (ข้อมูลอยู่ที่ data/pedDose.js ใช้ร่วมกับเครื่องคำนวณ)
import { WEIGHTS, WEIGHT_DRUGS, AGE_DRUGS, PED_DOSE_CREDIT, concLabel, basisLabel, freqLabel } from '../pedDose.js'

const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;')
const notes = []
const mark = n => { notes.push(n); return `<sup>${notes.length}</sup>` }

const weightRows = WEIGHT_DRUGS.map(d => `<tr><td><b>${esc(d.name)}</b><br><small>${concLabel(d)}${d.doseOf ? ` (คิดเป็น ${d.doseOf})` : ''}</small></td>`
  + `<td>${freqLabel(d)}<br><small>${basisLabel(d)}</small>${d.note ? mark(d.note) : ''}</td>`
  + d.table.map(v => `<td>${v}</td>`).join('') + '</tr>').join('\n')

const ages = [...Array(13).keys()]
const ageRows = AGE_DRUGS.map(d => `<tr><td><b>${esc(d.name)}</b>${d.conc ? `<br><small>${d.conc}</small>` : ''}${d.note ? mark(d.note) : ''}</td><td>${d.freq}</td>`
  + d.bands.map(([a, b, v]) => `<td colspan="${b - a + 1}">${v}</td>`).join('') + '</tr>').join('\n')

export default {
  id: 'ped-dose',
  date: '03/10/69',
  refs: [
    `${PED_DOSE_CREDIT} — อินโฟกราฟิก "ขนาดยาที่ใช้ในเด็กตามน้ำหนัก" และ "ขนาดยาที่ใช้ในเด็กตามอายุ"`,
    'Zaditen (ketotifen fumarate) Product Monograph. Health Canada DPD.',
    'EMA/465179/2014. Restrictions on the use of domperidone-containing medicines. 2014.',
    'Augmentin oral suspension prescribing information (FDA label).',
    'Pseudoephedrine monograph. Drugs.com / Pediatric Oncall.',
    'Magnesium hydroxide (milk of magnesia) pediatric dosing. FPnotebook.',
  ],
  sections: [
    { id: 'how', t: 'วิธีอ่านตาราง', html: `<ul>
  <li><b>MK</b> = mg/kg/dose (ต่อครั้ง) · <b>MKD</b> = mg/kg/day (ต่อวัน แล้วหารตามจำนวนครั้ง)</li>
  <li>mL ต่อครั้ง = ขนาดยา (mg) × 5 ÷ ความแรงยาต่อ 5 mL</li>
  <li>1 ช้อนชา = 5 mL</li>
  <li>ขนาดยาอาจเปลี่ยนตามโรค ใช้ประกอบการเรียนเท่านั้น ของจริงต้องเช็คตามข้อบ่งใช้และขนาดสูงสุด</li>
  <li>คิดตามน้ำหนักจริงได้ที่ <a class="calc-link" href="#" data-calc="ped-dose">🧮 เครื่องคำนวณขนาดยาน้ำเด็ก</a></li>
</ul>` },
    { id: 'weight', t: 'ขนาดยาตามน้ำหนัก (mL ต่อครั้ง)', html: `<div class="tbl"><table>
<thead><tr><th>ยา (ต่อ 5 mL)</th><th>วันละ</th>${WEIGHTS.map(w => `<th>${w} kg</th>`).join('')}</tr></thead>
<tbody>
${weightRows}
</tbody></table></div>` },
    { id: 'age', t: 'ขนาดยาตามอายุ (ต่อครั้ง)', html: `<div class="tbl"><table>
<thead><tr><th>ยา</th><th>วันละ</th>${ages.map(a => `<th>${a}</th>`).join('')}</tr></thead>
<tbody>
${ageRows}
</tbody></table></div>
<p><small>หัวตาราง = อายุ (ปี)</small></p>` },
    { id: 'notes', t: 'หมายเหตุ', html: `<p>ตัวเลขในตารางคงไว้ตามรูปต้นฉบับ เราคิดทวนทุกช่องและเทียบกับฉลากยา/ตำรา (3 ต.ค. 2569) ตัวเลขยกกำลังในตารางหมายถึงข้อต่อไปนี้ · เครื่องคำนวณใช้ค่าตามฉลากในข้อที่ระบุ</p>
<ol>${notes.map(n => `<li>${n}</li>`).join('')}</ol>` },
  ],
  questions: [],
}
