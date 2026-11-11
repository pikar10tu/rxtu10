<!-- แจ้งเนื้อหาเคส CC2 ผิด (11 พ.ย. 2026) → collection drugReports (ที่เดียวกับรายงานข้อมูลยา — แอดมินเห็นในการ์ด "รายงานข้อมูลยา")
     Claude แก้ที่ content/cc2/cases/<caseId>.json แล้ว build ใหม่ · เหตุผลบังคับ (แนวเดียวกับแจ้งข้อมูลยา) -->
<template>
  <div class="crb">
    <button v-if="!open" type="button" class="crb-btn" @click="open = true"><Emoji char="⚠️" /> แจ้งเนื้อหาเคสนี้ผิด</button>
    <div v-else class="crb-form">
      <b>แจ้งเนื้อหาผิด · {{ caseData.id }}</b>
      <label for="crb-what">ตรงไหนผิด</label>
      <textarea id="crb-what" v-model="what" rows="2" maxlength="300" placeholder="เช่น เช็คลิสต์ข้อ 5 คะแนนไม่ตรง / ขนาดยาในโจทย์พิมพ์ผิด" />
      <label for="crb-why">ที่ถูกควรเป็นอะไร / อ้างอิง</label>
      <textarea id="crb-why" v-model="why" rows="2" maxlength="300" placeholder="บอกที่ถูกหรือแหล่งอ้างอิงสั้นๆ" />
      <div class="crb-act">
        <button type="button" @click="open = false">ยกเลิก</button>
        <button type="button" class="go" :disabled="!canSend || busy" @click="send">{{ busy ? 'กำลังส่ง…' : 'ส่ง' }}</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from '../../firebase/config.js'
import { useAuthStore } from '../../stores/auth.js'
import { useToast } from '../../composables/useToast.js'
import { cleanText, LIMITS } from '../../utils/text.js'
import Emoji from '../shared/Emoji.vue'

const props = defineProps({ caseData: { type: Object, required: true } })
const auth = useAuthStore()
const { toast } = useToast()
const open = ref(false), what = ref(''), why = ref(''), busy = ref(false)
const canSend = computed(() => what.value.trim() && why.value.trim())

async function send() {
  if (!canSend.value || busy.value) return
  const w = cleanText(what.value, LIMITS.report), y = cleanText(why.value, LIMITS.report)
  busy.value = true
  try {
    await addDoc(collection(db, 'drugReports'), {
      drug: `🩺 CC2 ${props.caseData.id} · ${props.caseData.title}`,
      currentClass: [props.caseData.cat, props.caseData.group].filter(Boolean).join(' · '),
      caseId: props.caseData.id,
      note: `${w}\n— ที่ถูก: ${y}`,
      what: w, why: y,
      reporterUid: auth.currentUser?.uid || null,
      reporterName: auth.userData?.nickname || auth.userData?.name || null,
      status: 'open',
      ts: serverTimestamp(),
    })
    open.value = false; what.value = ''; why.value = ''
    toast('ส่งแล้ว ขอบคุณที่ช่วยตรวจ 🙏', 'success')
  } catch (e) {
    console.error('[cc2Report]', e)
    toast('ส่งไม่สำเร็จ ลองใหม่อีกครั้ง', 'error')
  } finally { busy.value = false }
}
</script>

<style scoped>
.crb { margin: 14px 0 8px; text-align: center; }
.crb-btn { font: inherit; font-size: .8rem; color: var(--muted); background: none; border: var(--bw) dashed var(--line); border-radius: 12px; padding: 8px 14px; cursor: pointer; }
.crb-form { text-align: left; background: var(--surface); border: var(--bw) solid var(--line); border-radius: 16px; padding: 12px 14px; display: flex; flex-direction: column; gap: 6px; }
.crb-form label { font-size: .78rem; color: var(--muted); }
.crb-form textarea { font: inherit; font-size: .85rem; border: var(--bw) solid var(--line); border-radius: 10px; padding: 8px 10px; resize: vertical; background: var(--bg); color: var(--text); }
.crb-act { display: flex; gap: 8px; justify-content: flex-end; margin-top: 4px; }
.crb-act button { font: inherit; font-size: .85rem; border-radius: 10px; padding: 7px 14px; border: var(--bw) solid var(--line); background: var(--surface); color: var(--text); cursor: pointer; }
.crb-act .go { background: var(--primary); color: #fff; border-color: transparent; }
.crb-act .go:disabled { opacity: .5; cursor: default; }
</style>
