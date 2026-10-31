<!--
  <QuestionReport :q="question" /> — ปุ่ม 🚩 แจ้งข้อผิด + แผงเลือกเหตุผล
  ตรรกะเดียวกับ QuizView.sendReport (questionReports + ตัวนับบนข้อ + พักข้อเมื่อครบ REPORT_HOLD_AT)
  ใช้ในข้อสอบประจำวัน (แจ้งได้หลังทำครบ 5 ข้อ — user 31 ต.ค.)
-->
<template>
  <div class="qr">
    <button v-if="done" class="qr-btn done" disabled><Emoji char="🚩" /> แจ้งแล้ว ✓</button>
    <button v-else-if="!open" class="qr-btn" @click="open = true"><Emoji char="🚩" /> แจ้งข้อผิด</button>
    <div v-else class="qr-panel">
      <div class="qr-chips">
        <button v-for="r in REASONS" :key="r" class="qr-chip" :class="{ on: reason === r }" :aria-pressed="reason === r" @click="reason = r">{{ r }}</button>
      </div>
      <textarea v-model="note" :maxlength="LIMITS.report" class="qr-note" rows="2" aria-label="รายละเอียดเพิ่มเติม" placeholder="รายละเอียดเพิ่มเติม (ไม่บังคับ)…"></textarea>
      <div class="qr-hint">ทีมวิชาการตรวจแล้วผิดจริง ได้ {{ REPORT_REWARD }} เหรียญทางจดหมาย</div>
      <div class="qr-actions">
        <button class="qr-cancel" @click="reset">ยกเลิก</button>
        <button class="qr-send" :disabled="!reason || sending" @click="send">{{ sending ? 'กำลังส่ง…' : 'ส่ง' }}</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { doc, runTransaction, serverTimestamp } from 'firebase/firestore'
import { db } from '../../firebase/config.js'
import { useAuthStore } from '../../stores/auth.js'
import { useUsageStore } from '../../stores/usage.js'
import { useToast } from '../../composables/useToast.js'
import { cleanText, LIMITS } from '../../utils/text.js'
import { reportDocId, buildSnapshot } from '../../utils/questionReport.js'
import { REPORT_HOLD_AT, REPORT_REWARD } from '../../data/index.js'
import Emoji from '../shared/Emoji.vue'

const props = defineProps({ q: { type: Object, required: true } })
const REASONS = ['เฉลยผิด', 'โจทย์/ตัวเลือกพิมพ์ผิด', 'โจทย์ไม่ชัด', 'ข้อมูลล้าสมัย', 'ผิดหมวด', 'อื่นๆ']
const auth = useAuthStore()
const usage = useUsageStore()
const { toast } = useToast()
const open = ref(false)
const reason = ref('')
const note = ref('')
const sending = ref(false)
const done = ref(false)

function reset() { open.value = false; reason.value = ''; note.value = '' }

async function send() {
  const q = props.q
  if (sending.value || !reason.value || !q?.id || !auth.currentUser) return
  sending.value = true
  try {
    const rRef = doc(db, 'questionReports', reportDocId(q.id, auth.currentUser.uid))
    const qRef = doc(db, 'questions', q.id)
    let held = false, judged = false
    await runTransaction(db, async (tx) => {
      held = false; judged = false
      const rSnap = await tx.get(rRef)
      const qSnap = await tx.get(qRef)
      if (rSnap.exists() && rSnap.data().status !== 'open') { judged = true; return }
      tx.set(rRef, {
        questionId: q.id,
        reason: reason.value,
        note: cleanText(note.value, LIMITS.report),
        reportedBy: auth.currentUser.uid,
        reportedByName: auth.userData?.nickname || auth.userData?.name || null,
        status: 'open',
        verdict: null,
        rewardAmount: 0,
        rewardDelivered: false,
        questionSnapshot: buildSnapshot(q),
        createdAt: serverTimestamp(),
        resolvedAt: null,
      }, { merge: true })
      if (rSnap.exists() || !qSnap.exists() || qSnap.data().isPublished !== true) return
      const n = (qSnap.data().reportCount || 0) + 1
      held = n >= REPORT_HOLD_AT
      tx.update(qRef, { reportCount: n, ...(held ? { reportHold: true, isPublished: false } : {}) })
    })
    usage.track(2, 2)
    done.value = true
    reset()
    if (judged) { toast('คุณเคยแจ้งข้อนี้และทีมวิชาการตรวจไปแล้ว แจ้งซ้ำไม่ได้', 'info'); return }
    toast(held ? 'ขอบคุณที่ช่วยแจ้ง! มีเพื่อนแจ้งข้อนี้ครบแล้ว เลยพักข้อนี้ไว้ก่อนระหว่างทีมวิชาการตรวจ' : 'ขอบคุณที่ช่วยแจ้ง! ทีมวิชาการจะตรวจสอบให้', 'success')
  } catch (e) {
    console.error('[question report]', e); toast('ส่งรายงานไม่สำเร็จ', 'error')
  } finally { sending.value = false }
}
</script>

<style scoped>
.qr { margin-top: 8px; }
.qr-btn { width: 100%; border: 1px dashed rgba(0,0,0,.2); background: none; border-radius: 10px; padding: 8px; font-family: inherit; font-size: .76rem; font-weight: 700; color: #64748b; cursor: pointer; }
.qr-btn.done { color: #16a34a; border-color: #86efac; cursor: default; }
.qr-panel { border: var(--bw) solid var(--line); border-radius: 12px; padding: 10px; background: #fff; }
.qr-chips { display: flex; flex-wrap: wrap; gap: 6px; }
.qr-chip { border: var(--bw) solid var(--line); background: #fff; border-radius: 999px; padding: 5px 10px; font-family: inherit; font-size: .72rem; font-weight: 700; color: var(--ink); cursor: pointer; }
.qr-chip.on { background: var(--primary); border-color: var(--primary); color: #fff; }
.qr-note { width: 100%; box-sizing: border-box; margin-top: 8px; border: var(--bw) solid var(--line); border-radius: 10px; padding: 8px; font-family: inherit; font-size: .8rem; resize: vertical; }
.qr-hint { font-size: .72rem; color: var(--muted); margin-top: 6px; }
.qr-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 8px; }
.qr-cancel, .qr-send { border: 0; border-radius: 999px; padding: 7px 14px; font-family: inherit; font-size: .78rem; font-weight: 800; cursor: pointer; }
.qr-cancel { background: #f1f5f9; color: var(--muted); }
.qr-send { background: var(--primary); color: #fff; }
.qr-send:disabled { opacity: .5; }
</style>
