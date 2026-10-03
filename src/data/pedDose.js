// ขนาดยาน้ำเด็ก — ถอดจากอินโฟกราฟิกของเพจ Facebook Pharmtutors (รูปต้นฉบับเก็บไว้ที่ D:/RXTU/DOC/peddose-pharmtutors ไม่เอาขึ้นเว็บ)
// ใช้ร่วมกันระหว่างหน้าสรุป (summaries/ped-dose.js) และเครื่องคำนวณ (PedDoseView)
export const PED_DOSE_CREDIT = 'เพจ Facebook Pharmtutors'

export const WEIGHTS = [5, 10, 15, 20, 25]

// conc = ปริมาณยาต่อ 5 mL (หน่วย unit) · basis 'day' = mg/kg/day หารตามจำนวนครั้ง, 'dose' = mg/kg/dose
// freq = [น้อยสุด, มากสุด] ครั้งต่อวัน · table = ค่าในรูปต้นฉบับ (mL/ครั้ง) ตามน้ำหนัก WEIGHTS · note = ข้อสังเกตของเรา
export const WEIGHT_DRUGS = [
  { id: 'amox125', name: 'Amoxicillin', conc: 125, unit: 'mg', freq: [3, 3], basis: 'day', lo: 20, hi: 50,
    table: ['1.5-3', '3-6.5', '4-10', '5-13', '7-16'] },
  { id: 'amox250', name: 'Amoxicillin', conc: 250, unit: 'mg', freq: [3, 3], basis: 'day', lo: 20, hi: 50,
    table: ['1', '1.5-3', '2-5', '2.5-6.5', '3.5-8'],
    note: 'ช่อง 5 kg ในรูปเขียน 1 mL แต่คิดตามสูตรได้ประมาณ 0.7–1.7 mL' },
  { id: 'augmentin', name: 'Amoxicillin/clavulanate (Augmentin)', conc: 228.5, calcConc: 200, unit: 'mg', freq: [2, 2], basis: 'day', lo: 25, hi: 45,
    table: ['1.4-3', '3-5.5', '4.5-8.5', '6-11', '8-14'], doseOf: 'amoxicillin',
    note: '228.5 mg/5 mL = amoxicillin 200 + clavulanate 28.5 · คิดขนาดจาก amoxicillin 200 mg/5 mL (ตามฉลาก 25–45 mg/kg/day ทุก 12 ชม.) ซึ่งตรงกับตัวเลขในรูป' },
  { id: 'azithro', name: 'Azithromycin', conc: 200, unit: 'mg', freq: [1, 1], basis: 'day', lo: 10, hi: 10,
    table: ['1.25', '2.5', '3.8', '5', '6.3'] },
  { id: 'cefaclor', name: 'Cefaclor', conc: 125, unit: 'mg', freq: [3, 3], basis: 'day', lo: 20, hi: 40,
    table: ['1.5-2.5', '2.5-5', '4-8', '5.5-10', '6.5-13'] },
  { id: 'cefdinir', name: 'Cefdinir', conc: 125, unit: 'mg', freq: [1, 1], basis: 'dose', lo: 14, hi: 14,
    table: ['3', '6', '8.4', '11', '14'] },
  { id: 'cotrim', name: 'Cotrimoxazole', conc: 40, unit: 'mg', freq: [2, 2], basis: 'day', lo: 6, hi: 12,
    table: ['1.9-3.75', '3.8-7.5', '5.7-11.25', '7.6-15', '9.5-18.75'], doseOf: 'trimethoprim',
    note: 'คิดจาก trimethoprim 40 mg ต่อ 5 mL (TMP/SMX 40/200) ซึ่งตรงกับตัวเลขในรูป' },
  { id: 'cpm', name: 'Chlorpheniramine (CPM)', conc: 2, unit: 'mg', freq: [3, 4], basis: 'day', lo: 0.35, hi: 0.35,
    table: ['1.1-1.5', '2.5-3', '3.5-4.5', '4.5-6', '5.5-7'] },
  { id: 'diclox', name: 'Dicloxacillin', conc: 62.5, unit: 'mg', freq: [4, 4], basis: 'day', lo: 12.5, hi: 25, ac: true,
    table: ['1.3-2.5', '2.5-5', '4-7.5', '5-10', '6.5-12'] },
  { id: 'dom', name: 'Domperidone', conc: 5, unit: 'mg', freq: [3, 3], basis: 'dose', lo: 0.2, hi: 0.25, ac: true,
    table: ['1-2', '2-4', '3-6', '4-8', '5-10'],
    note: 'ในรูปให้ 0.2–0.4 mg/kg/ครั้ง แต่ EMA ปี 2014 จำกัดเด็กไว้ไม่เกิน 0.25 mg/kg/ครั้ง วันละไม่เกิน 3 ครั้ง ไม่เกิน 1 สัปดาห์ (เสี่ยง QT ยาว) เครื่องคำนวณจึงตัดที่ 0.25' },
  { id: 'ery', name: 'Erythromycin', conc: 125, unit: 'mg', freq: [4, 4], basis: 'day', lo: 30, hi: 50,
    table: ['1.5-2.5', '2-5', '4.5-7.5', '6-10', '7.5-12'],
    note: 'ช่อง 10 kg ในรูปเขียน 2–5 mL แต่คิดตามสูตรได้ 3–5 mL' },
  { id: 'hydroxyzine', name: 'Hydroxyzine', conc: 10, unit: 'mg', freq: [3, 4], basis: 'day', lo: 2, hi: 2,
    table: ['1.3-1.5', '2.5-3.5', '4-5', '5-6.5', '6.5-8'] },
  { id: 'ibu', name: 'Ibuprofen', conc: 100, unit: 'mg', freq: [3, 4], basis: 'dose', lo: 5, hi: 10,
    table: ['1.3-2.5', '2.5-5', '3.8-7.5', '5-10', '6.3-12'] },
  { id: 'ketotifen', name: 'Ketotifen', conc: 1, unit: 'mg', freq: [2, 2], basis: 'dose', lo: 0.05, hi: 0.05,
    table: ['0.6', '1.25', '1.8', '2.5', '3'],
    note: 'ในรูปเขียน 0.025 MKD และตัวเลขทุกช่องตรงกับ 0.025 mg/kg/ครั้ง แต่ฉลาก Zaditen (เด็ก 6 เดือน–3 ปี) ให้ 0.05 mg/kg/ครั้ง วันละ 2 ครั้ง (= 0.25 mL/kg/ครั้ง สูงสุด 1 mg/ครั้ง) ซึ่งเป็น 2 เท่าของในรูป ค่าในรูปตรงกับขนาดเริ่มต้นช่วงสัปดาห์แรกที่ให้ครึ่งเดียว เครื่องคำนวณใช้ 0.05 ตามฉลาก' },
  { id: 'para', name: 'Paracetamol', conc: 120, unit: 'mg', freq: [4, 6], basis: 'dose', lo: 10, hi: 15,
    table: ['2-3', '4-6.3', '6.3-9', '8.5-12', '10-15'] },
  { id: 'penv', name: 'Penicillin V', conc: 125, unit: 'mg', freq: [4, 4], basis: 'day', lo: 25, hi: 50, ac: true,
    table: ['1.3-2.5', '2.5-5', '3.8-7.5', '5-10', '6.3-12'] },
  { id: 'procaterol', name: 'Procaterol', conc: 25, unit: 'mcg', freq: [2, 2], basis: 'dose', lo: 1.25, hi: 1.25,
    table: ['1.25', '2.5', '3.75', '5', '6.25'] },
  { id: 'pseudo', name: 'Pseudoephedrine', conc: 30, unit: 'mg', freq: [3, 3], basis: 'day', lo: 4, hi: 4,
    table: ['1', '2', '4', '4.5', '5.5'],
    note: 'ช่อง 15 kg ในรูปเขียน 4 mL แต่คิดตามสูตรได้ประมาณ 3.3 mL · ตำราให้ 4 mg/kg/day แบ่งทุก 6 ชม. (วันละ 4 ครั้ง) สูงสุด 60 mg/วันในเด็กเล็ก ส่วนในรูปแบ่ง 3 ครั้ง' },
  { id: 'salbu', name: 'Salbutamol', conc: 2, unit: 'mg', freq: [4, 4], basis: 'dose', lo: 0.1, hi: 0.1,
    table: ['1.3', '2.5', '3.8', '5', '6.3'] },
]

// ตารางตามอายุ: bands = [อายุเริ่ม, อายุสุดท้าย (ปี), ขนาดต่อครั้ง]
export const AGE_DRUGS = [
  { name: 'Bromhexine', conc: '4 mg/5 mL', freq: 'วันละ 3–4 ครั้ง',
    bands: [[0, 1, '1.25 mL'], [2, 5, '½ ช้อนชา'], [6, 10, '1 ช้อนชา'], [11, 12, '2 ช้อนชา']] },
  { name: 'Glyceryl guaiacolate (guaifenesin)', conc: '100 mg/5 mL', freq: 'วันละ 3–4 ครั้ง',
    bands: [[0, 1, '12 mg/kg/day'], [2, 5, '½–1 ช้อนชา'], [6, 12, '1–2 ช้อนชา']] },
  { name: 'Hyoscine', conc: '5 mg/5 mL', freq: 'วันละ 3 ครั้ง',
    bands: [[0, 3, '1 ช้อนชา'], [4, 6, '1–2 ช้อนชา'], [7, 12, '2–4 ช้อนชา']] },
  { name: 'Milk of magnesia (ระบาย)', conc: '', freq: 'วันละครั้ง หรือแบ่งให้เป็นมื้อ',
    bands: [[0, 1, '0.5 MKD'], [2, 5, '5–15 mL/วัน'], [6, 12, '15–30 mL/วัน']],
    note: 'ช่องอายุ 0–1 ปี ในรูปเขียน 0.5 MKD แต่ตำราให้ 0.5 mL/kg/day (เป็น mL ไม่ใช่ mg) และให้ระวัง hypermagnesemia ในเด็กเล็ก ส่วนช่วงอายุ 2–5 ปีและ 6–12 ปี ตรงกับตำรา' },
  { name: 'Multivitamin (MTV)', conc: '', freq: 'วันละ 1 ครั้ง',
    bands: [[0, 6, '1 ช้อนชา'], [7, 12, '1–2 ช้อนชา']] },
]

export const concLabel = d => `${d.conc} ${d.unit}/5 mL`
export const basisLabel = d => {
  const r = d.lo === d.hi ? `${d.lo}` : `${d.lo}–${d.hi}`
  return `${r} ${d.unit}/kg/${d.basis === 'day' ? 'day' : 'dose'}`
}
export const freqLabel = d => `วันละ ${d.freq[0] === d.freq[1] ? d.freq[0] : `${d.freq[0]}–${d.freq[1]}`} ครั้ง${d.ac ? ' ก่อนอาหาร' : ''}`

// ขนาดต่อครั้ง (unit และ mL) สำหรับน้ำหนัก kg — คืนช่วง [ต่ำ, สูง]
export function calcDose(d, kg) {
  const perDose = d.basis === 'dose'
    ? [d.lo * kg, d.hi * kg]
    : [d.lo * kg / d.freq[1], d.hi * kg / d.freq[0]]
  return { amt: perDose, ml: perDose.map(x => x * 5 / (d.calcConc || d.conc)) }
}
