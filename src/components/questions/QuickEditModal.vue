<template>
  <!-- Teleport ตาม CLAUDE.md ข้อ 6 · z400 = sheet/modal ฐาน (เปิดจากหน้าทำข้อสอบตรงๆ) -->
  <Teleport to="body">
    <div v-if="open" class="qe-ov" @click.self="close">
      <div class="qe-box" role="dialog" aria-label="แก้ข้อสอบ">
        <div class="qe-head">
          <span><Emoji char="✏️" /> แก้ข้อนี้ (ทีมวิชาการ)</span>
          <button class="qe-x" @click="close">✕</button>
        </div>
        <div v-if="loading" class="qe-note">กำลังโหลดข้อล่าสุด…</div>
        <div v-else-if="!draft" class="qe-note">โหลดข้อนี้ไม่ได้</div>
        <template v-else>
          <QuestionEditor v-model="draft" compact />
          <div class="qe-note">
            บันทึกแล้วข้อยังเผยแพร่ตามปกติ แต่จะกลับเข้าคิวตรวจให้คนอื่นเช็คอีกรอบ
          </div>
          <button class="qe-save" :disabled="!canSave || saving" @click="save">
            {{ saving ? 'กำลังบันทึก…' : 'บันทึกการแก้' }}
          </button>
        </template>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
// แก้ข้อจากหน้าทำข้อสอบ (user สั่ง 27 ก.ย. 2026) — เฉพาะ isQuestionEditor
// ⚠️ โหลดข้อสดจาก Firestore เสมอ: QuizView สลับตำแหน่งตัวเลือก ของในมือจึงไม่ใช่ลำดับจริง
// บันทึก = เนื้อหาใหม่ + REVIEW_RESET (กลับเข้าคิวตรวจ, rules isReviewReset) · isPublished คงเดิม
import { ref, computed, watch } from 'vue'
import { doc, getDoc, updateDoc, setDoc, increment, deleteField, serverTimestamp } from 'firebase/firestore'
import { db } from '../../firebase/config.js'
import { useAuthStore } from '../../stores/auth.js'
import { useToast } from '../../composables/useToast.js'
import { useEscapeKey } from '../../composables/useEscapeKey.js'
import { draftFrom, draftPayload, draftValid } from '../../utils/questionDraft.js'
import { REVIEW_RESET, computeStatus } from '../../utils/questionReview.js'
import { cleanText, LIMITS } from '../../utils/text.js'
import QuestionEditor from './QuestionEditor.vue'
import Emoji from '../shared/Emoji.vue'

const open = defineModel({ type: Boolean, default: false })
const props = defineProps({ questionId: { type: String, default: null } })
const emit = defineEmits(['saved'])

const auth = useAuthStore()
const { toast } = useToast()
const loading = ref(false)
const saving = ref(false)
const fresh = ref(null)
const draft = ref(null)

watch(open, async (v) => {
  if (!v || !props.questionId) return
  loading.value = true; draft.value = null; fresh.value = null
  try {
    const snap = await getDoc(doc(db, 'questions', props.questionId))
    if (snap.exists()) { fresh.value = { id: snap.id, ...snap.data() }; draft.value = draftFrom(fresh.value) }
  } catch (e) { console.error('[quick edit load]', e) }
  finally { loading.value = false }
})

const changed = computed(() => draft.value && fresh.value
  && JSON.stringify(draftPayload(draft.value)) !== JSON.stringify(draftPayload(draftFrom(fresh.value))))
const canSave = computed(() => changed.value && draftValid(draft.value))

function close() { if (!saving.value) open.value = false }
useEscapeKey(open, close)

async function save() {
  if (!canSave.value || saving.value) return
  saving.value = true
  const uid = auth.currentUser?.uid
  const name = cleanText(auth.userData?.realName || auth.userData?.nickname || auth.userData?.name || 'ไม่ระบุ', LIMITS.reviewerName)
  const oldStatus = computeStatus(fresh.value)
  try {
    const payload = draftPayload(draft.value)
    await updateDoc(doc(db, 'questions', fresh.value.id), {
      ...payload,
      ...REVIEW_RESET,
      reviewVerdicts: deleteField(),
      lastFixBy: uid, lastFixByName: name, lastFixAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    // แถบความคืบหน้าคลัง (หน้า /review) — พลาดไม่เป็นไร ปุ่มซิงก์ระบบตรวจคำนวณใหม่ได้
    if (oldStatus !== 'pending') {
      setDoc(doc(db, 'reviewMeta', 'main'), { progress: { [oldStatus]: increment(-1), pending: increment(1) } }, { merge: true })
        .catch(e => console.error('[quick edit meta]', e))
    }
    toast('บันทึกแล้ว ข้อนี้กลับเข้าคิวตรวจ', 'success')
    emit('saved', { id: fresh.value.id, ...payload, ...REVIEW_RESET })
    open.value = false
  } catch (e) {
    console.error('[quick edit save]', e); toast('บันทึกไม่สำเร็จ', 'error')
  } finally { saving.value = false }
}
</script>

<style scoped>
.qe-ov { position: fixed; inset: 0; z-index: 400; background: rgba(0,0,0,.5); display: flex; align-items: flex-start; justify-content: center; overflow-y: auto; padding: 18px 16px calc(18px + env(safe-area-inset-bottom, 0px)); }
.qe-box { background: #fff; width: 100%; max-width: 440px; margin: auto 0; border: var(--bw) solid var(--line); border-radius: 18px; box-shadow: var(--pop-lg); padding: 14px; }
.qe-head { display: flex; justify-content: space-between; align-items: center; font-weight: 800; font-size: .92rem; margin-bottom: 10px; }
.qe-x { border: none; background: rgba(0,0,0,.06); border-radius: 8px; width: 40px; height: 40px; cursor: pointer; }
.qe-note { font-size: .74rem; color: rgba(0,0,0,.55); margin: 10px 0 4px; line-height: 1.5; }
.qe-save { width: 100%; margin-top: 8px; border: var(--bw) solid var(--line); border-radius: 12px; padding: 12px; font-family: inherit; font-size: .85rem; font-weight: 800; color: #fff; background: var(--primary); box-shadow: var(--pop); cursor: pointer; }
.qe-save:disabled { background: #cbd5e1; box-shadow: none; cursor: default; }
</style>
