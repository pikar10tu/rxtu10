// ════════════════════════════════════════════════════════════
//  questionDraft — แปลงระหว่าง "เอกสารข้อสอบ" กับ "ฟอร์มที่คนกรอก" (pure ทั้งไฟล์)
//  ใช้ร่วมกัน 2 หน้า: /questions (ฟอร์มเต็ม) และ /review (ฟอร์มย่อ)
//
//  🔑 payload ที่เขียนลง Firestore มีสูตรเดียวอยู่ที่นี่ — สองหน้าจึงเขียนเหมือนกันเป๊ะ
//     (เดิมสูตรอยู่ใน QuestionsView.save() หน้าเดียว พอหน้าตรวจแก้ข้อได้ด้วยจะกลายเป็นสองสูตร)
//
//  ⚠️ ไม่ใส่ updatedAt/serverTimestamp ที่นี่ — ไฟล์นี้ต้อง import ไม่ติด firebase เพื่อให้เทสได้
//  ⚠️ draftValid ไม่เช็คกลุ่มโรค: ฟอร์มย่อในหน้าตรวจไม่มีช่องนั้น (ฟอร์มตรวจมี TopicSelect ของตัวเอง)
//     หน้าคลังที่บังคับกลุ่มโรคต้องเช็ค isPleGroupKey เองต่อท้าย
// ════════════════════════════════════════════════════════════
import { cleanText, LIMITS } from './text.js'
import { plePatch, pleFields } from './pleMapping.js'
import { qhash } from './qhash.js'

// doc (หรือ null = ข้อใหม่) → draft สำหรับผูกกับฟอร์ม
// ก๊อป array ใหม่เสมอ — แก้ในฟอร์มต้องไม่ไปกลายพันธุ์แถวที่ค้างอยู่ใน list ของ view
export function draftFrom(question) {
  const q = question || {}
  return {
    id: q.id ?? null,
    question: q.question || '',
    // ข้อที่มีตัวเลือกน้อยกว่า 2 คือข้อเสียอยู่แล้ว — ให้ช่องว่าง 4 ช่องเหมือนข้อใหม่
    choices: (Array.isArray(q.choices) && q.choices.length >= 2) ? [...q.choices] : ['', '', '', ''],
    answer: q.answer || 0,
    ple: pleFields(q),
    reviewNote: q.reviewNote || '',
    explanation: q.explanation || '',
    isPublished: !!q.isPublished,
    domain: q.domain || null,
    examSets: Array.isArray(q.examSets) ? [...q.examSets] : [],
  }
}

// draft → payload พร้อมเขียน Firestore (ผู้เรียกเติม updatedAt/REVIEW_RESET เอง)
export function draftPayload(draft) {
  const d = draft || {}
  const question = cleanText(d.question, LIMITS.question)
  const choices = (d.choices || []).map(c => cleanText(c, LIMITS.choice)).filter(Boolean)
  // ตัวเลือกว่างท้ายถูกตัดทิ้งแล้วเฉลยอาจชี้เลยขอบ — ดึงกลับมาข้อแรก (พฤติกรรมเดิมของ QuestionsView)
  let answer = Number.isInteger(d.answer) && d.answer >= 0 ? d.answer : 0
  if (answer >= choices.length) answer = 0
  return {
    question,
    choices,
    answer,
    // plePatch คืน null เมื่อกลุ่มไม่ถูกต้อง — spread null ได้ {} จึงไม่เขียนหมวดเลย
    // (categories เป็นค่า derive ห้ามเขียนมือ ดู CLAUDE.md ข้อ 14)
    ...plePatch(d.ple?.group, d.ple?.sub),
    reviewNote: cleanText(d.reviewNote, LIMITS.reviewNote) || null,
    explanation: cleanText(d.explanation, LIMITS.explanation) || null,
    isPublished: !!d.isPublished,
    domain: d.domain || null,
    examSets: Array.isArray(d.examSets) ? d.examSets : [],
    qhash: qhash(question),   // กันข้อซ้ำ + อัปเดตเมื่อโจทย์เปลี่ยน
  }
}

// พอที่จะบันทึกได้ไหม — โจทย์มี · ตัวเลือกที่กรอกจริง ≥ 2 · เฉลยชี้ตัวที่กรอกแล้ว
export function draftValid(draft) {
  const d = draft || {}
  const choices = d.choices || []
  const filled = choices.filter(c => String(c ?? '').trim()).length
  return !!(String(d.question ?? '').trim() && filled >= 2 && String(choices[d.answer] ?? '').trim())
}
