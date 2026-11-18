<template>
  <!-- 🔖 บันทึก + 💬 ความเห็นเพื่อน ต่อข้อ — ใช้ในหน้าทบทวน/ผล (ประจำวัน · Time Attack · คลังข้อสอบ)
       หน้าทำข้อสอบ (QuizView) มีแถวของตัวเองที่รวมปุ่มแจ้งข้อผิดไว้ด้วย
       ⚠️ วางเฉพาะจุดที่ "เห็นเฉลยแล้ว" เท่านั้น (ความเห็นอาจเฉลยข้อ) -->
  <div class="qa">
    <button class="qa-btn" :class="{ on: saved }" :aria-pressed="saved" :disabled="busy" @click="toggleSave">
      <Emoji char="🔖" /> {{ saved ? 'บันทึกแล้ว' : 'บันทึก' }}
    </button>
    <button class="qa-btn" @click="open = true">
      <Emoji char="💬" /> ความเห็น <span class="qa-cnt" :class="{ zero: !count }">{{ count }}</span>
    </button>
    <QuestionComments v-model:open="open" :qid="q.id" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { deleteField } from 'firebase/firestore'
import Emoji from '../shared/Emoji.vue'
import QuestionComments from './QuestionComments.vue'
import { useAuthStore } from '../../stores/auth.js'
import { useToast } from '../../composables/useToast.js'
import { useQComments, qCommentCount } from '../../composables/useQComments.js'
import { buildSavedToggle, isSaved, SAVED_MAX } from '../../utils/savedQuestions.js'

const props = defineProps({ q: { type: Object, required: true } })
const auth = useAuthStore()
const { toast } = useToast()
const { byQ } = useQComments()

const open = ref(false)
const busy = ref(false)
const count = computed(() => (byQ.value, qCommentCount(props.q.id)))
const saved = computed(() => isSaved(auth.userData?.study?.saved, props.q.id))

async function toggleSave() {
  if (busy.value || !auth.currentUser) return
  const r = buildSavedToggle({ study: auth.userData?.study, qid: props.q.id, deleteSentinel: deleteField() })
  if (r.full) { toast(`บันทึกได้สูงสุด ${SAVED_MAX} ข้อ — เอาข้อเก่าออกก่อนนะ`, 'info'); return }
  if (!r.ok) return
  const nowSaved = r.saved   // หยิบก่อน patchUser (กับดัก #9)
  busy.value = true
  try {
    const ok = await auth.patchUser({ study: r.optimisticStudy }, r.server)
    if (ok) toast(nowSaved ? 'บันทึกไว้ใน "ข้อที่บันทึกไว้" แล้ว' : 'เอาออกจากที่บันทึกแล้ว', 'success')
    else toast('บันทึกไม่สำเร็จ ลองใหม่อีกที', 'error')
  } finally { busy.value = false }
}
</script>

<style scoped>
.qa { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-top: 8px; }
.qa-btn { font: inherit; font-size: .76rem; font-weight: 700; border: 1px dashed rgba(0,0,0,.2); background: none; border-radius: 10px; padding: 8px 4px; color: #64748b; cursor: pointer; }
.qa-btn.on { border-style: solid; border-color: var(--primary); background: var(--primary-light); color: var(--primary-dark); }
.qa-btn:disabled { opacity: .6; }
.qa-cnt { display: inline-block; min-width: 1.4em; margin-left: 2px; border-radius: 999px; padding: 0 6px; font-size: .7rem; background: var(--accent); color: #fff; }
.qa-cnt.zero { background: var(--line); color: var(--muted); }
</style>
