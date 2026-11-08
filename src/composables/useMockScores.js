// ผลสอบจำลอง (CC1/CC2 …) — รอบสอบเปิดให้ทุกคนอ่าน (มีแค่ค่าเฉลี่ยรุ่น) · คะแนนรายคนอ่านได้แค่เจ้าของ
//   mockExams/{examId}                 { name, short, date, passPct, order, n, stations:[{name,max,mean}], totalMax, totalMean }
//   mockExams/{examId}/scores/{uid}    { scores:[number], total }   ← rules: เจ้าของ/แอดมินเท่านั้น
// คีย์ด้วย uid ไม่ใช่รหัสนศ. เพราะผู้ใช้แก้ studentId บน user doc ตัวเองได้ (คนที่มี 2 บัญชีได้สำเนาทั้งคู่)
import { ref } from 'vue'
import { collection, getDocs, getDoc, doc } from 'firebase/firestore'
import { db } from '../firebase/config.js'

const exams = ref([])          // เรียงใหม่สุดก่อน
const mine = ref({})           // examId → score doc | null
const loaded = ref(false)
let loadingFor = null

export async function loadMockScores(uid) {
  if (!uid) return
  if (loadingFor === uid) return
  loadingFor = uid
  try {
    const snap = await getDocs(collection(db, 'mockExams'))
    const list = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      .filter(e => e.published && Array.isArray(e.stations))
      .sort((a, b) => (b.order || 0) - (a.order || 0))
    const rows = await Promise.all(list.map(e =>
      getDoc(doc(db, 'mockExams', e.id, 'scores', uid)).then(s => s.exists() ? s.data() : null).catch(() => null)))
    const m = {}
    list.forEach((e, i) => { m[e.id] = rows[i] })
    exams.value = list
    mine.value = m
    loaded.value = true
  } catch (e) {
    console.error('[mock scores]', e)
    loadingFor = null
  }
}

const SEEN_KEY = id => `mockSeen:${id}`
// จำแยก 2 ระดับ: 'avg' = เคยเปิดตอนยังไม่มีผลเรา · 'score' = เห็นผลตัวเองแล้ว
// (คนที่เคยดูแค่เฉลี่ย พอผลตัวเองมาต้องเด้ง "ใหม่" อีกรอบ)
export function isSeen(id, withScore) {
  try {
    const v = localStorage.getItem(SEEN_KEY(id))
    return withScore ? v === 'score' : (v === 'avg' || v === 'score' || v === '1')
  } catch { return false }
}
export function markSeen(id, withScore) {
  try {
    if (withScore || !isSeen(id, false)) localStorage.setItem(SEEN_KEY(id), withScore ? 'score' : 'avg')
  } catch { /* private mode */ }
}

export function useMockScores() {
  return { exams, mine, loaded }
}
