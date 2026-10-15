// ════════════════════════════════════════════════════════════
//  ข้อสอบท้ายสรุป (src/data/summaries/<id>.js) → doc คลังข้อสอบ
//  user เคาะ 3 ต.ค. 2026: ข้อจากสรุป "ถือว่าตรวจแล้ว" — เข้าคลังแบบเผยแพร่ + ผ่านตรวจทันที
//  ไม่เข้าคิว /review (พึ่งรีพอร์ทจากเพื่อนถ้าผิด) และต้องบอกที่มา "จากสรุป <เรื่อง> ของ <ผู้เขียน>"
//
//  doc id ตายตัว sum-<summaryId>-<ลำดับ> → นำเข้าซ้ำได้ ไม่เกิดข้อซ้ำ
//  สถานะตรวจ: reviewPass 1 / reviewedBy [] → computeStatus = passed (ปุ่มซิงก์ระบบตรวจไม่ดึงกลับ)
//  แต่ไม่มี uid ใดได้เครดิตตรวจ (leaderboard นับจาก reviewedBy) · needsReviewBy กันไว้อีกชั้น
//  pure — ไม่แตะ Firestore (ผู้เรียกเติม createdBy/createdAt/qhash/rand เอง)
// ════════════════════════════════════════════════════════════
import { cleanText, LIMITS } from './text.js'
import { plePatch } from './pleMapping.js'
import { groupByKey } from '../data/plecc.js'

// summaryId → หัวข้อย่อยตามเกณฑ์สภาฯ (data/plecc.js) — ชื่อต้องตรงทะเบียนเป๊ะ (มีเทสคุม)
export const SUMMARY_SUB = {
  oa: 'Osteoarthritis', osteoporosis: 'Osteoporosis', ra: 'Rheumatoid arthritis', gout: 'Gout',
  htn: 'Hypertension', hf: 'Stable Heart Failure', cad: 'Coronary artery disease',
  dyslipidemia: 'Dyslipidemias', vte: 'Venous thromboembolism',
  urticaria: 'Urticaria angioedema', fungal: 'Superficial fungal infections', acne: 'Acne', eczema: 'Eczema',
  herpes: 'Herpes', wound: 'Wound', 'seb-derm': 'Seborrheic dermatitis', psoriasis: 'Psoriasis',
  dm: 'Diabetes mellitus', thyroid: 'Hypothyroidism, hyperthyroidism', obesity: 'Obesity',
  gerd: 'Gastroesophageal reflux disease', nv: 'Nausea and vomiting', pud: 'Dyspepsia, Peptic ulcer disease',
  diarrhea: 'Diarrhea and constipation, hemorrhoid', 'stress-ulcer': 'Stress ulcer disease',
  hbv: 'Hepatitis B virus', ibs: 'Inflammatory bowel disease',
  anemia: 'Anemia', hemolytic: 'Hemolytic anemia (G6PD deficiency, thalassemia)',
  ar: 'Allergic rhinitis', adr: 'Hypersensitivity reactions', sle: 'Systemic lupus erythematosus',
  vaccine: 'การให้วัคซีนสร้างเสริมภูมิคุ้มกันโรคเบื้องต้น (EPI Thailand)',
  hiv: 'HIV infection without opportunistic infections', parasite: 'Parasitic infections (หิด เหา พยาธิ)',
  std: 'Sexually transmitted diseases & vaginitis', tb: 'Tuberculosis', uri: 'Upper respiratory tract infections',
  uti: 'Cystitis (lower urinary tract infection)', pneumonia: 'Pneumonia',
  headache: 'Headache (migraine, tension)', epilepsy: 'Epilepsy, status epilepticus', pain: 'Pain management',
  stroke: 'Stroke', neuropathy: 'Peripheral neuropathy', parkinson: 'Parkinson disease',
  dementia: 'Dementia, Alzheimer disease',
  substance: 'Drug and alcohol abuse', tobacco: 'Tobacco dependence and cessation',
  'anxiety-depression': 'Anxiety/depression', insomnia: 'Insomnia',
  asthma: 'Asthma', copd: 'Chronic obstructive pulmonary disease',
  dysmenorrhea: 'Dysmenorrhea', ocp: 'Oral contraceptive', hrt: 'Hormonal replacement therapy',
  incontinence: 'Urinary incontinence',
  conjunctivitis: 'Conjunctivitis', hordeolum: 'Hordeolum (กุ้งยิง)', 'contact-lens': 'Contact Lens',
  'eye-others': 'ริดสีดวงตา ต้อหิน ต้อกระจก แผลที่ตา',
  'lung-ca': 'Lung cancer', 'breast-ca': 'Breast cancer', 'cervical-ca': 'Cervical cancer', 'colon-ca': 'Colon cancer',
  aki: 'Acute kidney injury (AKI)', ckd: 'Chronic kidney diseases (CKD)', 'fluid-electrolyte': 'Fluid and electrolyte disorder',
}

export const summaryQuestionId = (summaryId, i) => `sum-${summaryId}-${i + 1}`

// ข้อความที่มา — โชว์ในควิซ/คลัง (ชื่อจากหัวกระดาษ = เครดิตหลัก ตามที่ user เคาะ)
export function summarySourceText(q) {
  if (q?.source !== 'summary') return ''
  const by = (q.summaryAuthors || []).join(', ')
  return `จากสรุป ${q.summaryTitle || ''}${by ? ` ของ ${by}` : ''}`
}

// สถานะ "ตรวจแล้ว" แบบไม่ยกเครดิตให้ใคร
export const SUMMARY_REVIEW = { reviewedBy: [], reviewPass: 1, reviewFail: 0, reviewStatus: 'passed' }

/**
 * @param doc   โมดูลสรุป ({ id, questions })
 * @param meta  แถว manifest ({ id, g, t, a })
 * @returns [{ id, row }] — row พร้อมเขียน (ขาด createdBy/createdAt/qhash/rand)
 */
export function buildSummaryQuestions(doc, meta) {
  if (!doc?.questions?.length || !meta) return []
  const ple = plePatch(meta.g, SUMMARY_SUB[doc.id]) || { pleGroup: null, pleSub: null, categories: [] }
  return doc.questions.map((q, i) => {
    const text = q.case ? `${q.case}\n\n${q.q}` : q.q
    return {
      id: summaryQuestionId(doc.id, i),
      row: {
        question: cleanText(text, LIMITS.question),
        choices: q.o.map(c => cleanText(c, LIMITS.choice)),
        answer: q.a,
        explanation: cleanText(q.e, LIMITS.explanation) || null,
        ...ple,
        domain: groupByKey(ple.pleGroup)?.domain ?? 'care',
        examSets: [],
        isPublished: true,
        source: 'summary',
        summaryId: doc.id,
        summaryTitle: meta.t,
        summaryAuthors: meta.a || [],
        keyBy: q.keyBy || null,   // 'converter' = ต้นฉบับไม่มีเฉลย ผู้แปลงเฉลยให้
        ...SUMMARY_REVIEW,
      },
    }
  })
}
