// รายชื่อหมวด/หัวข้อข้อสอบ (config/topics.list) — cache ระดับ module อ่านครั้งเดียวต่อเซสชัน
// วิชาการเพิ่มหัวข้อใหม่ได้จาก TopicSelect — เก็บกลางใช้ร่วมหน้า Questions/Review
import { ref } from 'vue'
import { doc, getDoc, setDoc, arrayUnion } from 'firebase/firestore'
import { db } from '../firebase/config.js'
import { useUsageStore } from '../stores/usage.js'
import { cleanText, LIMITS } from '../utils/text.js'

const topics = ref([])
let loaded = false

export function useTopics() {
  const usage = useUsageStore()

  async function loadTopics() {
    if (loaded) return
    loaded = true
    try {
      const snap = await getDoc(doc(db, 'config', 'topics'))
      usage.track(1)
      if (snap.exists()) topics.value = snap.data().list || []
    } catch (e) { console.error('[topics]', e); loaded = false }
  }

  // เพิ่มหัวข้อเข้า list กลาง — คืนชื่อที่ clean แล้ว (null ถ้าว่าง) · ชื่อซ้ำไม่เขียนซ้ำ
  async function addTopic(name) {
    const clean = cleanText(name, LIMITS.category)
    if (!clean) return null
    if (!topics.value.includes(clean)) {
      await setDoc(doc(db, 'config', 'topics'), { list: arrayUnion(clean) }, { merge: true })
      usage.track(0, 1)
      topics.value = [...topics.value, clean]
    }
    return clean
  }

  return { topics, loadTopics, addTopic }
}
