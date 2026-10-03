// คลังสรุป RxTU10 — ดัชนีเบา ๆ จาก content/summaries/manifest.json (เนื้อหาแต่ละเรื่อง lazy-load จาก data/summaries/<id>.js)
import manifest from '../../content/summaries/manifest.json'

// ไฟล์ที่แปลงแล้วเท่านั้นจะอยู่ใน glob — ที่เหลือขึ้น "อยู่ระหว่างดำเนินการ"
const loaders = import.meta.glob('./summaries/*.js')
const ready = new Set(Object.keys(loaders).map(p => p.match(/\/([^/]+)\.js$/)[1]))

export const SYSTEMS = [
  ['msk', 1, 'กระดูกและข้อ'], ['cvs', 2, 'หัวใจและหลอดเลือด'], ['derm', 3, 'ผิวหนัง'], ['endo', 4, 'ต่อมไร้ท่อ'],
  ['gi', 5, 'ทางเดินอาหาร'], ['heme', 6, 'โลหิตวิทยา'], ['immu', 7, 'ภูมิคุ้มกัน'], ['id', 8, 'โรคติดเชื้อ'],
  ['neuro', 9, 'ระบบประสาท'], ['psych', 10, 'จิตเวช'], ['pulm', 11, 'ปอด'], ['gu', 12, 'สูติ-ปัสสาวะ'],
  ['eye', 13, 'ตา'], ['onco', 14, 'มะเร็ง'], ['renal', 15, 'ไต'], ['ped', 16, 'ยาเด็ก'],
].map(([key, n, th]) => ({ key, n, th }))

// คำค้นเสริม (ตัวย่อ/ชื่อไทย/ชื่อเรียกทั่วไป) — ชื่อเรื่องใน manifest เป็นอังกฤษล้วน ค้น "เบาหวาน"/"DM" ไม่เจอ (user 3 ต.ค. 2026)
const KEYWORDS = {
  oa: 'OA ข้อเสื่อม ข้อเข่าเสื่อม', osteoporosis: 'กระดูกพรุน', ra: 'RA รูมาตอยด์ ข้ออักเสบรูมาตอยด์',
  gout: 'เกาต์ เก๊าท์ กรดยูริก uric', htn: 'HT ความดัน ความดันโลหิตสูง', cad: 'CAD IHD ACS MI angina หัวใจขาดเลือด เจ็บหน้าอก',
  vte: 'DVT PE ลิ่มเลือด ลิ่มเลือดอุดตัน warfarin anticoagulant', dyslipidemia: 'DLP ไขมัน ไขมันในเลือดสูง คอเลสเตอรอล statin',
  hf: 'HF CHF HFrEF หัวใจล้มเหลว', fungal: 'เชื้อรา กลาก เกลื้อน ฮ่องกงฟุต tinea', acne: 'สิว',
  herpes: 'เริม งูสวัด HSV zoster', wound: 'แผล บาดแผล', psoriasis: 'สะเก็ดเงิน', eczema: 'AD ผื่นภูมิแพ้ผิวหนัง ผื่นแพ้',
  'seb-derm': 'รังแค ต่อมไขมันอักเสบ', urticaria: 'ลมพิษ ผื่นลมพิษ', dm: 'DM T2DM T1DM เบาหวาน น้ำตาล insulin อินซูลิน',
  thyroid: 'ไทรอยด์ คอพอก hyperthyroidism hypothyroidism', obesity: 'อ้วน โรคอ้วน ลดน้ำหนัก',
  gerd: 'กรดไหลย้อน', nv: 'คลื่นไส้ อาเจียน PONV CINV', pud: 'PUD แผลในกระเพาะ กระเพาะ อาหารไม่ย่อย H. pylori',
  diarrhea: 'ท้องเสีย ท้องร่วง ท้องผูก ริดสีดวง', 'stress-ulcer': 'SUP แผลในกระเพาะจากความเครียด',
  hbv: 'HBV ไวรัสตับอักเสบบี ตับอักเสบ', ibs: 'ลำไส้แปรปรวน', anemia: 'โลหิตจาง ซีด ขาดธาตุเหล็ก iron',
  hemolytic: 'เม็ดเลือดแดงแตก ธาลัสซีเมีย จี6พีดี', ar: 'AR ภูมิแพ้ ภูมิแพ้จมูก แพ้อากาศ', adr: 'แพ้ยา SJS TEN',
  sle: 'ลูปัส แพ้ภูมิตัวเอง', vaccine: 'วัคซีน ฉีดวัคซีน', hiv: 'HIV AIDS เอดส์ ARV PrEP PEP',
  std: 'STI กามโรค หนองใน ซิฟิลิส ตกขาว ช่องคลอดอักเสบ', tb: 'TB วัณโรค', uri: 'URI หวัด เจ็บคอ ไซนัส หูอักเสบ',
  uti: 'กระเพาะปัสสาวะอักเสบ ทางเดินปัสสาวะติดเชื้อ', pneumonia: 'CAP HAP ปอดอักเสบ ปอดบวม',
  parasite: 'พยาธิ หิด เหา', headache: 'ปวดหัว ปวดศีรษะ ไมเกรน', epilepsy: 'ลมชัก ชัก โรคลมชัก',
  pain: 'ปวด แก้ปวด NSAIDs opioid', stroke: 'อัมพาต อัมพฤกษ์ หลอดเลือดสมอง', neuropathy: 'ปลายประสาทอักเสบ ชา',
  parkinson: 'พาร์กินสัน', dementia: 'สมองเสื่อม อัลไซเมอร์', substance: 'สารเสพติด ยาเสพติด สุรา แอลกอฮอล์',
  tobacco: 'บุหรี่ เลิกบุหรี่ นิโคติน', 'anxiety-depression': 'วิตกกังวล ซึมเศร้า', insomnia: 'นอนไม่หลับ',
  asthma: 'หืด หอบหืด', copd: 'ถุงลมโป่งพอง ปอดอุดกั้นเรื้อรัง', dysmenorrhea: 'ปวดประจำเดือน',
  ocp: 'ยาคุม ยาคุมกำเนิด คุมกำเนิด', hrt: 'ฮอร์โมนทดแทน วัยทอง', incontinence: 'ปัสสาวะเล็ด กลั้นปัสสาวะไม่อยู่',
  conjunctivitis: 'ตาแดง เยื่อบุตาอักเสบ', hordeolum: 'ตากุ้งยิง', 'contact-lens': 'คอนแทคเลนส์',
  'eye-others': 'ต้อหิน ต้อกระจก ริดสีดวงตา แผลกระจกตา', 'lung-ca': 'มะเร็งปอด', 'breast-ca': 'มะเร็งเต้านม',
  'cervical-ca': 'มะเร็งปากมดลูก', 'colon-ca': 'มะเร็งลำไส้ มะเร็งลำไส้ใหญ่', aki: 'AKI ไตวายเฉียบพลัน',
  ckd: 'CKD ไตวายเรื้อรัง ไตเสื่อม', 'fluid-electrolyte': 'เกลือแร่ อิเล็กโทรไลต์ โซเดียม โพแทสเซียม สารน้ำ',
  'ped-dose': 'ยาเด็ก ขนาดยา',
}

// a = ชื่อจากหัวกระดาษ (เครดิตหลัก ตามที่ user เคาะ 3 ต.ค. 2026) · an = ชื่อจริงจากรายชื่อ ไม่แสดง
export const SUMMARIES = manifest.map(x => ({
  id: x.id, sys: x.g, title: x.t, final: x.s === 'final',
  authors: x.a, reviewers: x.r, ready: ready.has(x.id), keys: KEYWORDS[x.id] || '',
}))

// ป้ายสถานะตรวจ (user 3 ต.ค. 2026): มีรายชื่อคนตรวจ = "ตรวจแล้ว" · ไม่มี = "ไม่มีคนตรวจ" (เลิกใช้ "รอตรวจ")
// คนตรวจมาจากชีท "ตรวจเนื้อหา Care (Clinic)" ใน RxTU10 road to CC.xlsx (คนตรวจ 1 + 2) → manifest r (ชื่อเล่น) / rn (ชื่อจริง)
export function reviewPill(s) {
  if (s.final || s.reviewers?.length) return { cls: 'ok', text: 'ตรวจแล้ว' }
  return { cls: 'none', text: 'ไม่มีคนตรวจ' }
}

export function summaryMeta(id) { return SUMMARIES.find(s => s.id === id) }

export async function loadSummary(id) {
  const load = loaders[`./summaries/${id}.js`]
  return load ? (await load()).default : null
}
