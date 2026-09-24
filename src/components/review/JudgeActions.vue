<!-- src/components/review/JudgeActions.vue
     ปุ่มตัดสินร่วม ใช้ทั้งการ์ดตรวจปกติ (mode="review") และการ์ดข้อที่ถูกรีพอร์ท (mode="report", Task 4)

     ⚠️ ไม่ confirm เอง (parent เป็นคนคอนเฟิร์ม เพราะรู้จำนวนเหรียญที่จะจ่าย/ให้)
     ⚠️ ไม่รีเซตตัวเอง — parent ต้องใส่ :key="question.id" ให้คอมโพเนนต์ mount ใหม่ทุกครั้งที่เปลี่ยนข้อ
        (โครงนี้แปลว่าไม่ต้อง watch(question) ข้างในเลย — state เริ่มต้นสดทุกครั้งที่ id เปลี่ยน)

     step: 'judge' (ถามคำเดียว) → 'note' (เฉพาะ report: พิมพ์เหตุผลก่อนปิดรีพอร์ทว่าไม่ผิด)
                                 → 'how' (จะแก้หรือจะนำออก) → 'edit' | 'retire'

     emits:
       pass({ note })    — ข้อถูกต้อง (review: note เป็น '' เสมอ ส่งทันที · report: note จากช่องพิมพ์)
       fix({ payload, reason })   — แก้ชั้นตัดสินแล้ว (payload = draftPayload(draft))
       retire({ reason })         — นำออกจากการใช้งาน
       skip                       — ข้ามข้อนี้ (ทั้งสองโหมด) -->
<template>
  <div class="ja">
    <template v-if="step === 'judge'">
      <div class="ja-ask">{{ mode === 'report' ? 'ผู้แจ้งพูดถูกไหม?' : 'ข้อนี้ถูกต้องไหม?' }}</div>
      <div class="rv-actions ja-row">
        <button class="rv-btn ja-bad" type="button" :disabled="busy" @click="clickBad">
          {{ mode === 'report' ? 'ผิดจริง' : 'มีจุดผิด' }}
        </button>
        <button class="rv-btn ja-good" type="button" :disabled="busy || !canPass" @click="clickGood">
          {{ mode === 'report' ? 'ไม่ผิด ข้อสอบถูกแล้ว' : '✅ ถูกต้อง ส่งผล' }}
        </button>
      </div>
      <div v-if="!canPass && blockedHint" class="ja-blocked-hint">{{ blockedHint }}</div>
      <button class="rv-mini ja-skip" type="button" :disabled="busy" @click="$emit('skip')">ข้ามข้อนี้</button>
    </template>

    <template v-else-if="step === 'note'">
      <div class="ja-ask">บอกผู้แจ้งสั้นๆ ว่าทำไมไม่ผิด (ไม่บังคับ)</div>
      <textarea
        v-model="note" :maxlength="LIMITS.reviewReason" class="rv-input" rows="2"
        placeholder="เช่น ข้อนี้ถามขนาดที่ eGFR 30–45…"
      ></textarea>
      <div class="rv-actions ja-row">
        <button class="rv-btn rv-gray" type="button" :disabled="busy" @click="backToJudge">‹ ย้อนกลับ</button>
        <button class="rv-btn rv-primary" type="button" :disabled="busy" @click="submitNote">ปิดรีพอร์ท</button>
      </div>
    </template>

    <template v-else-if="step === 'how'">
      <div class="ja-ask">
        จะจัดการข้อนี้ยังไง?
        <span v-if="mode === 'report'" class="ja-hint-inline">(รางวัลผู้แจ้งจะออกตอนจัดการเสร็จ)</span>
      </div>
      <div class="rv-actions ja-row">
        <button class="rv-btn rv-primary" type="button" :disabled="busy" @click="openEdit">✏️ แก้ข้อนี้</button>
        <button class="rv-btn" type="button" :disabled="busy" @click="openRetire">🗑️ นำออก</button>
      </div>
      <button class="rv-mini ja-back" type="button" :disabled="busy" @click="backToJudge">‹ ย้อนกลับ</button>
    </template>

    <template v-else-if="step === 'edit'">
      <QuestionEditor v-model="draft" compact />
      <label class="rv-label">แก้อะไร/ทำไม (บังคับ)</label>
      <textarea
        v-model="reason" :maxlength="LIMITS.reviewReason" class="rv-input" rows="3"
        placeholder="สรุปสั้นๆ ว่าแก้ตรงไหน เพราะอะไร…"
      ></textarea>
      <p v-if="!editChanged" class="ja-edit-hint">ยังไม่ได้แก้โจทย์ ตัวเลือก หรือเฉลย</p>
      <div class="rv-actions ja-row">
        <button class="rv-btn rv-gray" type="button" :disabled="busy" @click="backToHow">ย้อนกลับ</button>
        <button class="rv-btn rv-primary" type="button" :disabled="busy || !canSaveFix" @click="submitFix">
          {{ mode === 'report' ? 'บันทึก + ปิดรีพอร์ท' : 'บันทึก = ผ่านตรวจ' }}
        </button>
      </div>
    </template>

    <template v-else-if="step === 'retire'">
      <label class="rv-label">ทำไมถึงนำออก (บังคับ)</label>
      <textarea
        v-model="reason" :maxlength="LIMITS.reviewReason" class="rv-input" rows="3"
        placeholder="อธิบายว่าทำไมข้อนี้ผิดจนแก้ไม่คุ้ม…"
      ></textarea>
      <div class="rv-actions ja-row">
        <button class="rv-btn rv-gray" type="button" :disabled="busy" @click="backToHow">ย้อนกลับ</button>
        <button class="rv-btn ja-bad" type="button" :disabled="busy || !reason.trim()" @click="submitRetire">
          {{ mode === 'report' ? 'นำออก + ปิดรีพอร์ท' : 'นำออก' }}
        </button>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import QuestionEditor from '../questions/QuestionEditor.vue'
import { LIMITS } from '../../utils/text.js'
import { draftFrom, draftPayload, draftValid } from '../../utils/questionDraft.js'
import { verdictContentChanged } from '../../utils/questionReview.js'

const props = defineProps({
  question: { type: Object, required: true },
  mode: { type: String, default: 'review', validator: v => ['review', 'report'].includes(v) },
  busy: { type: Boolean, default: false },
  canPass: { type: Boolean, default: true },
  blockedHint: { type: String, default: '' },
})
const emit = defineEmits(['pass', 'fix', 'retire', 'skip'])

const step = ref('judge')       // 'judge' | 'note' | 'how' | 'edit' | 'retire'
const draft = ref(null)
const reason = ref('')
const note = ref('')

function clickGood() {
  if (props.busy || !props.canPass) return
  if (props.mode === 'report') { step.value = 'note'; return }
  emit('pass', { note: '' })
}
function clickBad() {
  if (props.busy) return
  step.value = 'how'
}
function submitNote() {
  if (props.busy) return
  emit('pass', { note: note.value })
}
function openEdit() {
  if (props.busy) return
  draft.value = draftFrom(props.question)
  reason.value = ''
  step.value = 'edit'
}
function openRetire() {
  if (props.busy) return
  reason.value = ''
  step.value = 'retire'
}
function backToHow() {
  if (props.busy) return
  step.value = 'how'
  reason.value = ''
}
function backToJudge() {
  if (props.busy) return
  step.value = 'judge'
  reason.value = ''
  note.value = ''
}

// ── ขั้นแก้: ปุ่มบันทึกเปิดเมื่อแก้ชั้นตัดสิน (โจทย์/ตัวเลือก/เฉลย) จริง + กรอกเหตุผลแล้ว ──
const editPayload = computed(() => (draft.value ? draftPayload(draft.value) : null))
const editBaseline = computed(() => draftPayload(draftFrom(props.question)))
const editChanged = computed(() => !!editPayload.value && verdictContentChanged(editBaseline.value, editPayload.value))
const canSaveFix = computed(() => !!editPayload.value && draftValid(draft.value) && editChanged.value && !!reason.value.trim())

function submitFix() {
  if (props.busy || !canSaveFix.value) return
  emit('fix', { payload: editPayload.value, reason: reason.value })
}
function submitRetire() {
  if (props.busy || !reason.value.trim()) return
  emit('retire', { reason: reason.value })
}
</script>

<style scoped>
/* ── ก๊อปมาจาก ReviewView.vue (scoped จึงต้องมีสำเนาของตัวเอง) ── */
.rv-label { display: block; font-size: .7rem; font-weight: 700; color: #64748b; margin: 9px 0 5px; }
.rv-input { width: 100%; box-sizing: border-box; border: 2px solid var(--ink); border-radius: 10px; padding: 9px 11px; font-family: inherit; font-size: .82rem; resize: vertical; }
.rv-input:focus { outline: none; box-shadow: var(--pop); }
.rv-actions { display: flex; gap: 8px; margin-top: 13px; }
.rv-btn { flex: 1; border: 2px solid var(--ink); border-radius: 11px; padding: 11px; font-family: inherit; font-size: .85rem; font-weight: 800; cursor: pointer; transition: transform .12s, box-shadow .12s; background: #fff; color: var(--ink); }
.rv-btn:active:not(:disabled) { transform: translate(1px,1px); }
.rv-btn:disabled { opacity: .55; cursor: default; }
.rv-primary { background: var(--primary); color: #fff; box-shadow: var(--pop); }
.rv-primary:active:not(:disabled) { transform: translate(2px,2px); box-shadow: 0 0 0 var(--ink); }
.rv-primary:disabled { background: #cbd5e1; color: #fff; cursor: default; box-shadow: none; opacity: 1; }
.rv-gray { background: #fff; color: var(--ink); flex: 0 0 110px; }
.rv-mini { flex-shrink: 0; border: 2px solid var(--ink); border-radius: 9px; padding: 5px 11px; font-family: inherit; font-size: .72rem; font-weight: 800; background: #fff; color: var(--ink); cursor: pointer; }
.rv-mini:disabled { background: #f1f5f9; color: rgba(0,0,0,.4); cursor: default; }

/* ── ใหม่เฉพาะคอมโพเนนต์นี้ ── */
.ja-ask { font-size: .85rem; font-weight: 800; color: var(--ink); margin-bottom: 10px; line-height: 1.5; }
.ja-hint-inline { font-size: .7rem; font-weight: 700; color: rgba(0,0,0,.45); margin-left: 4px; }
.ja-good { background: var(--mint); color: #fff; }
.ja-good:disabled { background: #cbd5e1; color: #fff; opacity: 1; }
.ja-bad { background: var(--accent); color: #fff; }
.ja-bad:disabled { background: #cbd5e1; color: #fff; opacity: 1; }
.ja-row { margin-top: 0; }
.ja-blocked-hint { margin-top: 8px; font-size: .72rem; font-weight: 700; color: #b45309; background: rgba(245,158,11,.13); border-radius: 9px; padding: 7px 10px; line-height: 1.5; }
.ja-skip { margin-top: 10px; }
.ja-back { margin-top: 10px; }
.ja-edit-hint { margin: 10px 0 0; border-radius: 10px; padding: 9px 11px; background: rgba(245,158,11,.13); color: #92400e; font-size: .74rem; font-weight: 700; line-height: 1.5; }
</style>
