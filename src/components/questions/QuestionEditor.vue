<template>
  <div class="qe">
    <label class="qz-label">โจทย์</label>
    <textarea v-model="question" :maxlength="LIMITS.question" class="qz-input" rows="3" placeholder="พิมพ์คำถาม…"></textarea>

    <label class="qz-label">ตัวเลือก (กดวงกลมเพื่อเลือกข้อที่ถูก)</label>
    <div v-for="(c, i) in modelValue.choices" :key="i" class="qz-choice">
      <button
        class="qz-radio" :class="{ on: modelValue.answer === i }"
        type="button" @click="set({ answer: i })"
        :title="modelValue.answer === i ? 'ข้อที่ถูก' : 'ตั้งเป็นข้อที่ถูก'"
      >{{ modelValue.answer === i ? '✓' : LETTERS[i] }}</button>
      <input
        :value="c" :maxlength="LIMITS.choice" class="qz-input qz-choice-in"
        :placeholder="`ตัวเลือก ${LETTERS[i]}`" @input="setChoice(i, $event.target.value)"
      />
      <button class="qz-del-choice" type="button" :disabled="modelValue.choices.length <= 2" @click="removeChoice(i)">✕</button>
    </div>
    <button class="qz-add-choice" type="button" :disabled="modelValue.choices.length >= 6" @click="addChoice">+ เพิ่มตัวเลือก</button>

    <template v-if="!compact">
      <label class="qz-label">กลุ่มโรค / หมวด (ตามเกณฑ์สภาเภสัชกรรม)</label>
      <TopicSelect :modelValue="modelValue.ple" @update:modelValue="v => set({ ple: v })" />

      <label class="qz-label">ชุดข้อสอบย้อนหลัง (ไม่บังคับ — 1 ข้ออยู่ได้หลายชุด)</label>
      <ExamSetSelect :modelValue="modelValue.examSets" @update:modelValue="v => set({ examSets: v })" />

      <label class="qz-label">หมวดใหญ่ (domain)</label>
      <select :value="modelValue.domain" class="qz-input" @change="set({ domain: $event.target.value || null })">
        <option :value="null">— ไม่ระบุ —</option>
        <option v-for="d in DOMAINS" :key="d.key" :value="d.key">{{ d.label }}</option>
      </select>
    </template>

    <label class="qz-label">คำอธิบายเฉลย (ไม่บังคับ)</label>
    <textarea v-model="explanation" :maxlength="LIMITS.explanation" class="qz-input" rows="2" placeholder="อธิบายว่าทำไมข้อนี้ถูก…"></textarea>

    <label class="qz-label">หมายเหตุผู้ตรวจ (นักศึกษาเห็นท้ายเฉลย — ไม่บังคับ)</label>
    <textarea v-model="reviewNote" :maxlength="LIMITS.reviewNote" class="qz-input" rows="2" placeholder="ข้อควรระวัง / จุดที่คนมักเข้าใจผิด…"></textarea>

    <label v-if="!compact" class="qz-check">
      <input type="checkbox" :checked="modelValue.isPublished" @change="set({ isPublished: $event.target.checked })" />
      เผยแพร่ให้นักศึกษาเห็น (ติ๊กออก = ร่าง เห็นเฉพาะทีมวิชาการ)
    </label>
  </div>
</template>

<script setup>
// ════════════════════════════════════════════════════════════
//  QuestionEditor — ฟอร์มข้อสอบล้วน ใช้ร่วมกัน /questions (เต็ม) และ /review (compact)
//  ⚠️ ห้าม import firebase ในไฟล์นี้ — หน้าที่เดียวคือวาดฟอร์มกับคุมกติกาตัวเลือก
//     ใครเรียกใช้เป็นคนเขียน Firestore เอง (ผ่าน draftPayload ใน utils/questionDraft.js)
//  compact=true ซ่อนช่องที่คนตรวจไม่ต้องใช้: กลุ่มโรค (ฟอร์มตรวจมี TopicSelect ของตัวเองอยู่แล้ว
//  จะซ้อนกันสองอัน) · ชุดข้อสอบย้อนหลัง · domain · เผยแพร่ (หน้าตรวจใช้ปุ่ม "นำออก" แทน)
//  ไม่ mutate props — ทุกการแก้ emit ก้อนใหม่ทั้งใบ (แบบเดียวกับ TopicSelect.vue)
// ════════════════════════════════════════════════════════════
import { computed } from 'vue'
import TopicSelect from './TopicSelect.vue'
import ExamSetSelect from './ExamSetSelect.vue'
import { LIMITS } from '../../utils/text.js'
import { DOMAINS } from '../../data/domains.js'

const props = defineProps({
  modelValue: { type: Object, required: true },
  compact: { type: Boolean, default: false },
})
const emit = defineEmits(['update:modelValue'])

const LETTERS = ['ก', 'ข', 'ค', 'ง', 'จ', 'ฉ']

function set(patch) { emit('update:modelValue', { ...props.modelValue, ...patch }) }

const question = computed({ get: () => props.modelValue.question, set: v => set({ question: v }) })
const explanation = computed({ get: () => props.modelValue.explanation, set: v => set({ explanation: v }) })
const reviewNote = computed({ get: () => props.modelValue.reviewNote, set: v => set({ reviewNote: v }) })

function setChoice(i, v) {
  const choices = [...props.modelValue.choices]
  choices[i] = v
  set({ choices })
}
function addChoice() {
  if (props.modelValue.choices.length >= 6) return
  set({ choices: [...props.modelValue.choices, ''] })
}
// ลบตัวเลือกแล้วต้องดึงเฉลยให้ยังชี้ของที่มีจริง (ตรรกะเดิมจาก QuestionsView.removeChoice)
function removeChoice(i) {
  const choices = [...props.modelValue.choices]
  if (choices.length <= 2) return
  choices.splice(i, 1)
  let answer = props.modelValue.answer
  if (answer >= choices.length) answer = choices.length - 1
  else if (answer > i) answer--
  set({ choices, answer })
}
</script>

<style scoped>
.qz-label { display: block; font-size: .7rem; font-weight: 700; color: #64748b; margin: 10px 0 5px; }
.qz-input { width: 100%; box-sizing: border-box; border: 2px solid var(--ink); border-radius: 10px; padding: 9px 11px; font-family: inherit; font-size: .82rem; resize: vertical; }
.qz-input:focus { outline: none; box-shadow: var(--pop); }
.qz-choice { display: flex; align-items: center; gap: 7px; margin-bottom: 6px; }
.qz-radio { flex-shrink: 0; width: 30px; height: 30px; border-radius: 50%; border: 2px solid rgba(0,0,0,.15); background: #fff; color: rgba(0,0,0,.45); font-weight: 800; font-size: .82rem; cursor: pointer; }
.qz-radio.on { background: #22c55e; border-color: #22c55e; color: #fff; }
.qz-choice-in { flex: 1; }
.qz-del-choice { flex-shrink: 0; border: none; background: rgba(0,0,0,.05); border-radius: 8px; width: 28px; height: 28px; cursor: pointer; color: #ef4444; }
.qz-del-choice:disabled { opacity: .3; cursor: default; }
.qz-add-choice { margin-top: 2px; border: 1px dashed rgba(0,0,0,.2); background: none; border-radius: 9px; padding: 7px 12px; font-family: inherit; font-size: .74rem; font-weight: 700; color: #475569; cursor: pointer; }
.qz-add-choice:disabled { opacity: .4; cursor: default; }
.qz-check { display: flex; align-items: center; gap: 8px; font-size: .74rem; color: rgba(0,0,0,.65); margin-top: 12px; cursor: pointer; }
</style>
