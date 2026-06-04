<template>
  <div class="tab-content">
    <div class="qz-head">
      <div class="qz-title">📝 คลังข้อสอบ</div>
      <span class="qz-count">{{ list.length }} ข้อ</span>
    </div>

    <div v-if="!authStore.isAcademic" class="qz-denied">
      เฉพาะแอดมินหรือทีมวิชาการเท่านั้น
    </div>

    <template v-else>
      <!-- ── editor ── -->
      <section class="qz-card">
        <div class="qz-card-head">{{ draft.id ? '✏️ แก้ไขข้อสอบ' : '➕ เพิ่มข้อสอบใหม่' }}</div>

        <label class="qz-label">โจทย์</label>
        <textarea v-model="draft.question" class="qz-input" rows="3" placeholder="พิมพ์คำถาม…"></textarea>

        <label class="qz-label">ตัวเลือก (กดวงกลมเพื่อเลือกข้อที่ถูก)</label>
        <div v-for="(c, i) in draft.choices" :key="i" class="qz-choice">
          <button
            class="qz-radio" :class="{ on: draft.answer === i }"
            type="button" @click="draft.answer = i"
            :title="draft.answer === i ? 'ข้อที่ถูก' : 'ตั้งเป็นข้อที่ถูก'"
          >{{ draft.answer === i ? '✓' : LETTERS[i] }}</button>
          <input v-model="draft.choices[i]" class="qz-input qz-choice-in" :placeholder="`ตัวเลือก ${LETTERS[i]}`" />
          <button class="qz-del-choice" type="button" :disabled="draft.choices.length <= 2" @click="removeChoice(i)">✕</button>
        </div>
        <button class="qz-add-choice" type="button" :disabled="draft.choices.length >= 6" @click="draft.choices.push('')">+ เพิ่มตัวเลือก</button>

        <label class="qz-label">หมวด / กลุ่มเนื้อหา</label>
        <input v-model="draft.category" class="qz-input" placeholder="เช่น ยาปฏิชีวนะ, ระบบหัวใจ, เภสัชจลนศาสตร์…" />

        <label class="qz-label">คำอธิบายเฉลย (ไม่บังคับ)</label>
        <textarea v-model="draft.explanation" class="qz-input" rows="2" placeholder="อธิบายว่าทำไมข้อนี้ถูก…"></textarea>

        <label class="qz-check">
          <input type="checkbox" v-model="draft.isPublished" />
          เผยแพร่ให้นักศึกษาเห็น (ติ๊กออก = ร่าง เห็นเฉพาะทีมวิชาการ)
        </label>

        <div class="qz-actions">
          <button v-if="draft.id" class="qz-btn qz-gray" @click="resetDraft">ยกเลิก</button>
          <button class="qz-btn qz-primary" :disabled="!valid || saving" @click="save">
            {{ saving ? 'กำลังบันทึก…' : (draft.id ? 'บันทึกการแก้ไข' : 'เพิ่มข้อสอบ') }}
          </button>
        </div>
      </section>

      <!-- ── list ── -->
      <div class="qz-list-head">
        <span>รายการข้อสอบ</span>
        <button class="qz-mini" :disabled="loading" @click="load">{{ loading ? '...' : '↻ โหลด' }}</button>
      </div>
      <div v-if="loading" class="qz-empty">กำลังโหลด…</div>
      <div v-else-if="!list.length" class="qz-empty">ยังไม่มีข้อสอบ — เพิ่มข้อแรกได้เลย</div>
      <ul v-else class="qz-list">
        <li v-for="q in list" :key="q.id" class="qz-item">
          <div class="qz-item-top">
            <span class="qz-badge" :class="q.isPublished ? 'pub' : 'draft'">{{ q.isPublished ? 'เผยแพร่' : 'ร่าง' }}</span>
            <span v-if="q.category" class="qz-cat">{{ q.category }}</span>
            <div class="qz-item-actions">
              <button class="qz-mini" @click="edit(q)">แก้ไข</button>
              <button class="qz-mini qz-danger" @click="remove(q)">ลบ</button>
            </div>
          </div>
          <div class="qz-q">{{ q.question }}</div>
          <ul class="qz-choices">
            <li v-for="(c, i) in q.choices" :key="i" :class="{ correct: i === q.answer }">
              <span class="qz-c-letter">{{ LETTERS[i] }}</span>{{ c }}
            </li>
          </ul>
          <div v-if="q.explanation" class="qz-exp">💡 {{ q.explanation }}</div>
        </li>
      </ul>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, orderBy, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase/config.js'
import { useAuthStore } from '../stores/auth.js'
import { useToast } from '../composables/useToast.js'
import { useConfirm } from '../composables/useConfirm.js'

const authStore = useAuthStore()
const { toast } = useToast()
const { confirm } = useConfirm()

const LETTERS = ['ก', 'ข', 'ค', 'ง', 'จ', 'ฉ']

const list = ref([])
const loading = ref(false)
const saving = ref(false)

function blankDraft() {
  return { id: null, question: '', choices: ['', '', '', ''], answer: 0, category: '', explanation: '', isPublished: false }
}
const draft = ref(blankDraft())
function resetDraft() { draft.value = blankDraft() }

const valid = computed(() => {
  const d = draft.value
  const filled = d.choices.filter(c => c.trim()).length
  return d.question.trim() && filled >= 2 && d.choices[d.answer]?.trim()
})

function removeChoice(i) {
  if (draft.value.choices.length <= 2) return
  draft.value.choices.splice(i, 1)
  // keep answer pointing at a valid index
  if (draft.value.answer >= draft.value.choices.length) draft.value.answer = draft.value.choices.length - 1
  else if (draft.value.answer > i) draft.value.answer--
}

onMounted(() => { if (authStore.isAcademic) load() })

async function load() {
  loading.value = true
  try {
    const snap = await getDocs(query(collection(db, 'questions'), orderBy('createdAt', 'desc')))
    list.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
  } catch (e) { console.error('[questions load]', e); toast('โหลดข้อสอบไม่สำเร็จ', 'error') }
  finally { loading.value = false }
}

async function save() {
  if (!valid.value || saving.value) return
  saving.value = true
  const d = draft.value
  const payload = {
    question: d.question.trim(),
    choices: d.choices.map(c => c.trim()).filter(Boolean),
    answer: d.answer,
    category: d.category.trim() || null,
    explanation: d.explanation.trim() || null,
    isPublished: !!d.isPublished,
    updatedAt: serverTimestamp(),
  }
  // clamp answer in case trailing empty choices were dropped
  if (payload.answer >= payload.choices.length) payload.answer = 0
  try {
    if (d.id) {
      await updateDoc(doc(db, 'questions', d.id), payload)
      toast('บันทึกการแก้ไขแล้ว', 'success')
    } else {
      await addDoc(collection(db, 'questions'), {
        ...payload,
        createdBy: authStore.currentUser?.uid || null,
        createdByName: authStore.userData?.nickname || authStore.userData?.name || null,
        createdAt: serverTimestamp(),
      })
      toast('เพิ่มข้อสอบแล้ว', 'success')
    }
    resetDraft()
    await load()
  } catch (e) { console.error('[questions save]', e); toast('บันทึกไม่สำเร็จ', 'error') }
  finally { saving.value = false }
}

function edit(q) {
  draft.value = {
    id: q.id,
    question: q.question || '',
    choices: (q.choices && q.choices.length >= 2) ? [...q.choices] : ['', ''],
    answer: q.answer || 0,
    category: q.category || '',
    explanation: q.explanation || '',
    isPublished: !!q.isPublished,
  }
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

async function remove(q) {
  if (!(await confirm(`ลบข้อสอบนี้?\n\n"${q.question}"`))) return
  try {
    await deleteDoc(doc(db, 'questions', q.id))
    list.value = list.value.filter(x => x.id !== q.id)
    if (draft.value.id === q.id) resetDraft()
    toast('ลบแล้ว', 'success')
  } catch (e) { console.error('[questions remove]', e); toast('ลบไม่สำเร็จ', 'error') }
}
</script>

<style scoped>
.qz-head { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 12px; }
.qz-title { font-size: 1.15rem; font-weight: 800; }
.qz-count { font-size: .66rem; color: rgba(0,0,0,.45); font-weight: 600; }
.qz-denied, .qz-empty { text-align: center; color: rgba(0,0,0,.4); padding: 26px 0; font-size: .85rem; }

.qz-card { background: #fff; border: 1px solid rgba(0,0,0,.08); border-radius: 14px; padding: 14px; margin-bottom: 16px; }
.qz-card-head { font-weight: 800; font-size: .92rem; margin-bottom: 10px; }
.qz-label { display: block; font-size: .68rem; font-weight: 700; color: #64748b; margin: 10px 0 5px; }
.qz-input { width: 100%; box-sizing: border-box; border: 1px solid rgba(0,0,0,.12); border-radius: 10px; padding: 9px 11px; font-family: inherit; font-size: .82rem; resize: vertical; }
.qz-input:focus { outline: 2px solid #6366f1aa; border-color: transparent; }
.qz-choice { display: flex; align-items: center; gap: 7px; margin-bottom: 6px; }
.qz-radio { flex-shrink: 0; width: 30px; height: 30px; border-radius: 50%; border: 2px solid rgba(0,0,0,.15); background: #fff; color: rgba(0,0,0,.45); font-weight: 800; font-size: .82rem; cursor: pointer; }
.qz-radio.on { background: #22c55e; border-color: #22c55e; color: #fff; }
.qz-choice-in { flex: 1; }
.qz-del-choice { flex-shrink: 0; border: none; background: rgba(0,0,0,.05); border-radius: 8px; width: 28px; height: 28px; cursor: pointer; color: #ef4444; }
.qz-del-choice:disabled { opacity: .3; cursor: default; }
.qz-add-choice { margin-top: 2px; border: 1px dashed rgba(0,0,0,.2); background: none; border-radius: 9px; padding: 7px 12px; font-family: inherit; font-size: .74rem; font-weight: 700; color: #475569; cursor: pointer; }
.qz-add-choice:disabled { opacity: .4; cursor: default; }
.qz-check { display: flex; align-items: center; gap: 8px; font-size: .74rem; color: rgba(0,0,0,.65); margin-top: 12px; cursor: pointer; }
.qz-actions { display: flex; gap: 8px; margin-top: 14px; }
.qz-btn { flex: 1; border: none; border-radius: 11px; padding: 11px; font-family: inherit; font-size: .85rem; font-weight: 800; cursor: pointer; }
.qz-primary { background: linear-gradient(135deg,#4f46e5,#6366f1); color: #fff; }
.qz-primary:disabled { background: #cbd5e1; cursor: default; }
.qz-gray { background: rgba(0,0,0,.08); color: rgba(0,0,0,.6); flex: 0 0 90px; }

.qz-list-head { display: flex; align-items: center; justify-content: space-between; font-weight: 800; font-size: .85rem; margin-bottom: 8px; }
.qz-mini { border: none; border-radius: 8px; padding: 5px 10px; font-family: inherit; font-size: .7rem; font-weight: 700; cursor: pointer; background: rgba(0,0,0,.06); color: rgba(0,0,0,.6); }
.qz-mini.qz-danger { background: rgba(239,68,68,.12); color: #dc2626; }
.qz-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 10px; }
.qz-item { background: #fff; border: 1px solid rgba(0,0,0,.07); border-radius: 14px; padding: 12px; }
.qz-item-top { display: flex; align-items: center; gap: 7px; margin-bottom: 7px; }
.qz-badge { font-size: .58rem; font-weight: 800; padding: 2px 8px; border-radius: 999px; }
.qz-badge.pub { background: rgba(34,197,94,.15); color: #15803d; }
.qz-badge.draft { background: rgba(0,0,0,.07); color: rgba(0,0,0,.5); }
.qz-cat { font-size: .62rem; color: #4f46e5; font-weight: 700; }
.qz-item-actions { margin-left: auto; display: flex; gap: 5px; }
.qz-q { font-size: .85rem; font-weight: 700; color: #1e293b; margin-bottom: 8px; line-height: 1.4; }
.qz-choices { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 4px; }
.qz-choices li { font-size: .76rem; color: rgba(0,0,0,.6); display: flex; gap: 7px; align-items: baseline; padding: 4px 8px; border-radius: 7px; }
.qz-choices li.correct { background: rgba(34,197,94,.1); color: #15803d; font-weight: 700; }
.qz-c-letter { font-weight: 800; flex-shrink: 0; }
.qz-exp { margin-top: 8px; font-size: .72rem; color: #b45309; background: #fffbeb; border-radius: 8px; padding: 7px 10px; line-height: 1.4; }
</style>
