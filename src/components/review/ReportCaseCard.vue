<!-- src/components/review/ReportCaseCard.vue
     การ์ดข้อที่ถูกนักศึกษารีพอร์ท — ขึ้นก่อนคิวตรวจปกติในหน้า /review (Task 4, 24 ก.ย. 2026)
     ดู docs/superpowers/specs/2026-09-24-report-case-flow-design.md

     ⚠️ ไม่เขียน Firestore เอง ไม่ confirm เอง — parent (ReviewView) เป็นคนตัดสินใจ/เขียนทั้งหมด
        คอมโพเนนต์นี้แค่แสดงผล + ส่ง event ต่อจาก JudgeActions (mode="report") ขึ้นไป
     ⚠️ parent ต้องใส่ :key="group.questionId" (หรือเทียบเท่า) ให้ mount ใหม่ทุกครั้งที่เปลี่ยนข้อที่ถูกรีพอร์ท
        (commentsOpen ต้องรีเซตกลับเป็นปิดเมื่อเปลี่ยนข้อ — ทำผ่าน mount ใหม่ ไม่ต้อง watch เอง)

     gone = true เมื่อข้อถูกลบไปแล้ว หรือถูกนำออก (retired) ไปแล้ว — ไม่มีอะไรให้ตัดสินอีก
     เหลือทางเดียวคือปิดรีพอร์ท + ให้รางวัลผู้แจ้ง ใช้ group.snapshot แสดงเนื้อหาแทน (question อาจเป็น null) -->
<template>
  <section class="rc-card">
    <div class="rc-head"><Emoji char="🚩" /> นักศึกษาแจ้ง {{ group.count }} คน</div>

    <template v-if="gone">
      <div class="rc-gone"><Emoji char="⚠️" /> ข้อนี้ถูกนำออกหรือลบไปแล้ว</div>

      <div class="rc-q">{{ group.snapshot?.question || '(ไม่พบโจทย์)' }}</div>
      <ul v-if="(group.snapshot?.choices || []).length" class="rc-choices">
        <li
          v-for="(c, i) in group.snapshot.choices" :key="i"
          :class="{ correct: c === group.snapshot.answerText }"
        >
          <span class="rc-c-letter">{{ LETTERS[i] }}</span><span class="rc-c-text">{{ c }}</span>
          <span v-if="c === group.snapshot.answerText" class="rc-c-mark">✓ เฉลย</span>
        </li>
      </ul>
      <div v-if="group.snapshot?.explanation" class="rc-exp"><Emoji char="💡" /> {{ group.snapshot.explanation }}</div>

      <ul class="rc-reports">
        <li v-for="r in group.reports" :key="r.id"><b>{{ r.reason }}</b><span v-if="r.note"> — {{ r.note }}</span></li>
      </ul>

      <div class="rc-actions">
        <button class="rc-btn rc-primary" type="button" :disabled="busy" @click="$emit('closeGone')">
          ปิดรีพอร์ท + ให้รางวัล
        </button>
      </div>
    </template>

    <template v-else>
      <div class="rc-q">{{ question.question }}</div>
      <ul class="rc-choices">
        <li v-for="(c, i) in question.choices" :key="i" :class="{ correct: i === question.answer }">
          <span class="rc-c-letter">{{ LETTERS[i] }}</span><span class="rc-c-text">{{ c }}</span>
          <span v-if="i === question.answer" class="rc-c-mark">✓ เฉลย</span>
        </li>
      </ul>
      <div v-if="question.explanation" class="rc-exp"><Emoji char="💡" /> {{ question.explanation }}</div>
      <div v-else class="rc-exp rc-exp-none"><Emoji char="💡" /> ข้อนี้ยังไม่มีคำอธิบายเฉลย</div>

      <ul class="rc-reports">
        <li v-for="r in group.reports" :key="r.id"><b>{{ r.reason }}</b><span v-if="r.note"> — {{ r.note }}</span></li>
      </ul>

      <div v-if="differs" class="rc-diff-badge">
        <Emoji char="✏️" /> ข้อนี้ถูกแก้ไปแล้วหลังมีคนแจ้ง — ดูว่ายังผิดอยู่ไหม
      </div>

      <JudgeActions
        :key="question.id"
        mode="report"
        :question="question"
        :busy="busy"
        :canPass="true"
        @pass="$emit('pass', $event)"
        @fix="$emit('fix', $event)"
        @retire="$emit('retire', $event)"
        @skip="$emit('skip')"
      />

      <!-- 💬 คุยกันต่อข้อ — mount เฉพาะตอนกาง (แพทเทิร์นเดียวกับการ์ดตรวจปกติใน ReviewView) -->
      <details class="rc-comments" :open="commentsOpen">
        <summary class="rc-comments-sum" @click.prevent="commentsOpen = !commentsOpen">
          <Emoji char="💬" /> คุยกันเรื่องข้อนี้
          <span class="rc-comments-hint">{{ commentsOpen ? 'ปิด' : 'เปิดดู' }}</span>
        </summary>
        <QuestionComments v-if="commentsOpen" :key="question.id" :questionId="question.id" />
      </details>
    </template>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'
import Emoji from '../shared/Emoji.vue'
import JudgeActions from './JudgeActions.vue'
import QuestionComments from '../questions/QuestionComments.vue'
import { snapshotDiffers } from '../../utils/reportCase.js'

const props = defineProps({
  group: { type: Object, required: true },     // { questionId, count, reports[], snapshot }
  question: { type: Object, default: null },    // ข้อสด (null เมื่อ gone และถูกลบไปแล้ว)
  gone: { type: Boolean, default: false },
  busy: { type: Boolean, default: false },
})
defineEmits(['pass', 'fix', 'retire', 'closeGone', 'skip'])

const LETTERS = ['ก', 'ข', 'ค', 'ง', 'จ', 'ฉ']
const commentsOpen = ref(false)

const differs = computed(() => !props.gone && snapshotDiffers(props.group.snapshot, props.question))
</script>

<style scoped>
.rc-card { background: #fff; border: 2px solid var(--ink); border-radius: 16px; box-shadow: var(--pop); padding: 14px; margin-bottom: 16px; }
.rc-head { font-size: .88rem; font-weight: 800; color: #c2410c; margin-bottom: 10px; }

.rc-gone { font-size: .78rem; font-weight: 700; color: #92400e; background: rgba(245,158,11,.13); border-radius: 10px; padding: 9px 11px; margin-bottom: 11px; line-height: 1.5; }

.rc-q { font-size: .92rem; font-weight: 700; color: var(--ink); line-height: 1.5; margin-bottom: 11px; white-space: pre-wrap; overflow-wrap: anywhere; }
.rc-choices { list-style: none; margin: 0 0 4px; padding: 0; display: flex; flex-direction: column; gap: 5px; }
.rc-choices li { font-size: .8rem; color: rgba(0,0,0,.65); display: flex; gap: 8px; align-items: baseline; padding: 7px 10px; border-radius: 9px; background: #f8fafc; }
.rc-choices li.correct { background: rgba(34,197,94,.12); color: #15803d; font-weight: 700; }
.rc-c-letter { font-weight: 800; flex-shrink: 0; }
.rc-c-text { flex: 1; min-width: 0; overflow-wrap: anywhere; }
.rc-c-mark { flex-shrink: 0; font-size: .7rem; font-weight: 800; color: #15803d; }
.rc-exp { margin-top: 9px; font-size: .74rem; color: #b45309; background: #fffbeb; border-radius: 8px; padding: 8px 10px; line-height: 1.45; margin-bottom: 11px; }
.rc-exp-none { color: #94a3b8; font-style: italic; }

.rc-reports { list-style: none; margin: 0 0 11px; padding: 0; display: flex; flex-direction: column; gap: 4px; }
.rc-reports li { font-size: .74rem; color: rgba(0,0,0,.7); line-height: 1.4; }

.rc-diff-badge { font-size: .74rem; font-weight: 700; color: #92400e; background: rgba(245,158,11,.13); border-radius: 10px; padding: 8px 11px; margin-bottom: 11px; line-height: 1.5; }

.rc-actions { display: flex; gap: 8px; margin-top: 4px; }
.rc-btn { flex: 1; border: 2px solid var(--ink); border-radius: 11px; padding: 11px; font-family: inherit; font-size: .85rem; font-weight: 800; cursor: pointer; transition: transform .12s, box-shadow .12s; background: #fff; color: var(--ink); }
.rc-btn:active:not(:disabled) { transform: translate(1px,1px); }
.rc-btn:disabled { opacity: .55; cursor: default; }
.rc-primary { background: var(--primary); color: #fff; box-shadow: var(--pop); }
.rc-primary:active:not(:disabled) { transform: translate(2px,2px); box-shadow: 0 0 0 var(--ink); }
.rc-primary:disabled { background: #cbd5e1; color: #fff; cursor: default; box-shadow: none; opacity: 1; }

.rc-comments { margin-top: 12px; border-top: 2px dashed rgba(0,0,0,.1); padding-top: 10px; }
.rc-comments-sum { list-style: none; cursor: pointer; display: flex; align-items: center; gap: 7px; font-size: .78rem; font-weight: 800; color: var(--ink); }
.rc-comments-sum::-webkit-details-marker { display: none; }
.rc-comments-hint { margin-left: auto; font-size: .72rem; font-weight: 700; color: #64748b; }
</style>
