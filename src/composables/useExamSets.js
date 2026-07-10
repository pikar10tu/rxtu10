// src/composables/useExamSets.js
// รายการชุดข้อสอบย้อนหลัง (config/examSets.list = [{name, year}]) — cache ระดับ module
// วิชาการเพิ่มชุดใหม่ได้จาก ExamSetSelect · dedup ตาม name → setDoc ทับทั้ง list
// (ห้าม arrayUnion เพราะ object equality ทั้งใบ ทำให้ชื่อเดิมปีต่างซ้ำเป็น 2 entries)
import { ref } from 'vue'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '../firebase/config.js'
import { useUsageStore } from '../stores/usage.js'
import { upsertExamSet } from '../utils/examSets.js'

const sets = ref([])
let loadPromise = null   // cache promise ไม่ใช่ boolean — กัน race (ดู addExamSet)

export function useExamSets() {
  const usage = useUsageStore()

  // คืน promise ของการโหลด (idempotent) — caller await ได้เพื่อรอ list ครบ
  function loadExamSets() {
    if (!loadPromise) {
      loadPromise = (async () => {
        try {
          const snap = await getDoc(doc(db, 'config', 'examSets'))
          usage.track(1)
          if (snap.exists()) sets.value = snap.data().list || []
        } catch (e) { console.error('[examSets]', e); loadPromise = null }   // ให้ retry ได้
      })()
    }
    return loadPromise
  }

  // เพิ่ม/อัปเดตชุด — คืน entry ที่ clean แล้ว (null ถ้าชื่อว่าง)
  async function addExamSet(name, year) {
    await loadExamSets()   // ⚠️ กัน race: ต้องมี list ปัจจุบันครบก่อน upsert ไม่งั้น setDoc { list } ทับชุดเดิมหายหมด
    const r = upsertExamSet(sets.value, name, year)
    if (!r) return null
    await setDoc(doc(db, 'config', 'examSets'), { list: r.list }, { merge: true })
    usage.track(0, 1)
    sets.value = r.list
    return r.entry
  }

  return { sets, loadExamSets, addExamSet }
}
