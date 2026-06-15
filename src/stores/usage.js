import { defineStore } from 'pinia'
import { ref } from 'vue'
import { doc, getDoc, setDoc, increment } from 'firebase/firestore'
import { db } from '../firebase/config.js'
import { addUsage, usageDocId } from '../utils/usageMeter.js'

// ตัวนับ "ประมาณการ" การใช้ Firestore — สะสมต่อเซสชันในเครื่อง แล้ว flush ครั้งเดียว
// ด้วย increment(delta) ตอนแอปถูกซ่อน/ปิด → ~1 write/เซสชัน (ไม่ใช่ทุก read/write)
// ใช้ใน Admin โชว์เกจ + banner เตือนใกล้ลิมิต · ตัวจริงคือ Cloud Monitoring (3a)
export const useUsageStore = defineStore('usage', () => {
    const pending = ref({ reads: 0, writes: 0 }) // ยังไม่ flush
    const today   = ref(null)                    // ค่าจาก Firestore (โชว์ Admin) | null
    let flushing = false

    // instrument: เรียกหลัง getDocs ใหญ่ / การเขียน
    function track(reads = 0, writes = 0) {
        pending.value = addUsage(pending.value, reads, writes)
    }

    // flush ครั้งเดียว → increment doc รายวัน (atomic ไม่ต้อง read ไม่ชนกัน)
    async function flush() {
        const { reads, writes } = pending.value
        if (flushing || (!reads && !writes)) return
        flushing = true
        pending.value = { reads: 0, writes: 0 } // เคลียร์ก่อนกัน flush ซ้อน
        try {
            await setDoc(doc(db, 'stats', usageDocId()), {
                reads:  increment(reads),
                writes: increment(writes + 1), // +1 = การ flush เองก็คือ 1 write
            }, { merge: true })
        } catch (e) {
            pending.value = addUsage(pending.value, reads, writes) // คืน pending จะได้ไม่หาย
            console.error('[usage flush]', e)
        } finally {
            flushing = false
        }
    }

    // อ่าน usage วันนี้ (Admin เท่านั้น) — 1 read
    async function loadToday() {
        try {
            const snap = await getDoc(doc(db, 'stats', usageDocId()))
            const d = snap.exists() ? snap.data() : {}
            today.value = { reads: d.reads || 0, writes: d.writes || 0 }
        } catch { today.value = null }
    }

    return { pending, today, track, flush, loadToday }
})
