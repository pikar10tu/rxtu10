<template>
  <!-- ── ฝั่งทีมวิชาการ: การ์ด 🤖 เต็ม ── -->
  <div v-if="team && ai" class="ai-card" :class="'t-' + (AI_VERDICT[ai.verdict]?.tone || 'unclear')">
    <div class="ai-head">
      <span class="ai-title"><Emoji char="🤖" /> AI</span>
      <span class="ai-verdict">{{ AI_VERDICT[ai.verdict]?.label || ai.verdict }}</span>
      <button class="ai-conf" @click="popOpen = true">{{ conf.dot }} {{ conf.label }} ⓘ</button>
      <span v-if="ai.applied" class="ai-tag applied">AI แก้แล้ว</span>
      <span v-if="state === 'stale'" class="ai-tag stale">AI ตรวจเวอร์ชันก่อน</span>
      <span v-if="aiConflictsTeam(q)" class="ai-tag conflict">ขัดแย้งกับผลตรวจทีม</span>
      <span v-if="dateText" class="ai-date">{{ dateText }}</span>
    </div>

    <div v-if="ai.confNote && !ai.issues?.some(it => it.detail === ai.confNote)" class="ai-line ai-muted">{{ ai.confNote }}</div>

    <ul v-if="ai.issues?.length" class="ai-issues">
      <li v-for="(it, i) in ai.issues" :key="i"><b>{{ AI_ISSUE_TYPE[it.type] || it.type }}:</b> {{ it.detail }}</li>
    </ul>

    <div v-if="prevAnswerText" class="ai-line">
      <b>เฉลยเดิมก่อน AI แก้:</b> {{ prevAnswerText }}
    </div>
    <template v-else-if="hasSuggest">
      <div v-if="sug.answer != null && sug.answer !== q.answer" class="ai-line">
        <b>AI เสนอเฉลย:</b> {{ letterText(q.answer) }} → <span class="ai-new">{{ letterText(sug.answer) }}</span>
      </div>
      <div v-if="sug.question && sug.question !== q.question" class="ai-line">
        <b>AI เสนอโจทย์:</b> <span class="ai-new">{{ sug.question }}</span>
      </div>
      <template v-if="sug.choices">
        <div v-for="(c, i) in sug.choices" v-show="c !== q.choices?.[i]" :key="i" class="ai-line">
          <b>ตัวเลือก {{ LETTERS[i] }}:</b> “{{ q.choices?.[i] }}” → <span class="ai-new">“{{ c }}”</span>
        </div>
      </template>
      <div v-if="sug.explanation" class="ai-line"><b>AI เสนอคำอธิบาย:</b> {{ sug.explanation }}</div>
    </template>

    <div v-if="ai.explain" class="ai-explain">{{ ai.explain }}</div>
    <div v-if="ai.refs?.length" class="ai-refs"><Emoji char="📚" /> {{ ai.refs.join(' · ') }}</div>
    <div v-if="ai.queueReason" class="ai-line ai-muted">ส่งเข้าคิววิชาการเพราะ: {{ ai.queueReason }}</div>
  </div>

  <!-- ── ฝั่งนักศึกษา: ชิป / กล่องเตือน + คำอธิบาย ── -->
  <div v-else-if="!team && (state === 'ok' || state === 'flag')" class="ai-stu">
    <button v-if="state === 'flag'" class="ai-warn" @click="popOpen = true">
      <Emoji char="⚠️" /> ข้อนี้ AI พบประเด็นที่ควรตรวจ อยู่ระหว่างทีมวิชาการพิจารณา — ใช้เฉลยอย่างระวัง <span class="ai-i">ⓘ</span>
    </button>
    <div v-else class="ai-chips">
      <button class="ai-chip" @click="popOpen = true"><Emoji char="🤖" /> AI ตรวจแล้ว · {{ conf.dot }}</button>
      <span v-if="q.reviewStatus === 'passed'" class="ai-chip team"><Emoji char="✅" /> ทีมวิชาการตรวจแล้ว</span>
    </div>
    <div v-if="prevAnswerText" class="ai-applied"><Emoji char="🤖" /> AI แก้เฉลยข้อนี้แล้ว — เฉลยเดิมคือ {{ prevAnswerText }}</div>
    <!-- ข้อ flag ที่ไม่ใช่ minor ไม่โชว์คำอธิบาย (อาจเฉลยคนละข้อกับในระบบ กันสับสน — สเปก §UI 1) -->
    <div v-if="ai.explain && (state === 'ok' || ai.verdict === 'minor')" class="ai-explain">
      <div class="ai-explain-h"><Emoji char="🤖" /> คำอธิบายจาก AI</div>
      {{ ai.explain }}
      <div v-if="ai.refs?.length" class="ai-refs"><Emoji char="📚" /> {{ ai.refs.join(' · ') }}</div>
    </div>
  </div>

  <!-- ── popover อธิบายระดับความมั่นใจ ── Teleport ตาม CLAUDE.md ข้อ 6 -->
  <Teleport to="body">
    <div v-if="popOpen && ai" class="ai-ov" @click.self="popOpen = false">
      <div class="ai-pop" role="dialog" aria-label="ผลตรวจจาก AI">
        <div class="ai-pop-h">
          <span><Emoji char="🤖" /> ผลตรวจจาก AI</span>
          <button class="ai-x" @click="popOpen = false">✕</button>
        </div>
        <div class="ai-pop-this">
          ข้อนี้: <b>{{ conf.dot }} {{ conf.label }}</b>
          <div v-if="ai.confNote" class="ai-muted">{{ ai.confNote }}</div>
        </div>
        <table class="ai-levels">
          <tr v-for="(c, k) in AI_CONF" :key="k" :class="{ on: k === ai.confidence }">
            <td class="lv">{{ c.dot }} {{ c.label }}<br><small>{{ AI_CONF_MEASURED ? '' : 'ประมาณ ' }}{{ c.range }}</small></td>
            <td>{{ c.desc }}</td>
          </tr>
        </table>
        <div class="ai-pop-foot">{{ AI_DISCLAIMER }}</div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
// แท็ก/การ์ด 🤖 ผลตรวจ AI — สเปก DOC/specs/ai-review-spec.md §UI
// team=false (QuizView/TimeAttack): แสดงหลังตอบแล้วเท่านั้น ไม่โชว์คำตอบที่ AI เสนอ
// team=true  (ReviewView/QuestionsView): เห็นเต็ม issues/ข้อเสนอ/refs
import { ref, computed, watch } from 'vue'
import Emoji from './Emoji.vue'
import { useEscapeKey } from '../../composables/useEscapeKey.js'
import {
  AI_CONF, AI_CONF_MEASURED, AI_VERDICT, AI_ISSUE_TYPE, AI_DISCLAIMER,
  aiContentHash, aiState, aiConflictsTeam,
} from '../../data/aiReview.js'

const props = defineProps({
  q: { type: Object, required: true },
  team: { type: Boolean, default: false },
})

const LETTERS = 'ABCDEFGH'
const ai = computed(() => props.q?.aiReview || null)
const conf = computed(() => AI_CONF[ai.value?.confidence] || AI_CONF.low)
const sug = computed(() => ai.value?.suggest || {})
const hasSuggest = computed(() => Object.keys(sug.value).length > 0)

const liveHash = ref(null)
watch(() => [props.q?.question, props.q?.choices, props.q?.answer, ai.value?.contentHash], async () => {
  liveHash.value = null
  if (!ai.value) return
  const q = props.q
  const h = await aiContentHash(q).catch(() => null)
  if (q === props.q) liveHash.value = h
}, { immediate: true, deep: true })
const state = computed(() => aiState(props.q, liveHash.value))

const letterText = i => i == null ? '—' : `ข้อ ${LETTERS[i]} (${String(props.q.choices?.[i] ?? '').slice(0, 60)})`
const prevAnswerText = computed(() => {
  const p = props.q?.aiPrev
  if (!ai.value?.applied || !p || p.answer === props.q.answer) return ''
  return `ข้อ ${LETTERS[p.answer]} (${String(p.choices?.[p.answer] ?? '').slice(0, 60)})`
})

const dateText = computed(() => {
  const d = ai.value?.reviewedAt?.toDate?.()
  return d ? d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' }) : ''
})

const popOpen = ref(false)
useEscapeKey(popOpen, () => { popOpen.value = false })
</script>

<style scoped>
/* ── นักศึกษา ── */
.ai-stu { margin-top: 8px; display: flex; flex-direction: column; gap: 6px; }
.ai-chips { display: flex; flex-wrap: wrap; gap: 6px; }
.ai-chip { border: 1px solid rgba(0,0,0,.12); background: #f8fafc; border-radius: 999px; padding: 4px 10px; font-family: inherit; font-size: .72rem; font-weight: 700; color: rgba(0,0,0,.6); cursor: pointer; }
.ai-chip.team { cursor: default; background: #ecfdf5; color: #047857; border-color: #a7f3d0; }
.ai-warn { text-align: left; border: 1px solid #fcd34d; background: #fffbeb; color: #92400e; border-radius: 10px; padding: 8px 10px; font-family: inherit; font-size: .76rem; font-weight: 700; line-height: 1.5; cursor: pointer; }
.ai-i { opacity: .6; }
.ai-applied { font-size: .74rem; color: #1e40af; background: #eff6ff; border-radius: 10px; padding: 7px 10px; line-height: 1.5; }
.ai-explain { font-size: .8rem; line-height: 1.6; background: #f5f3ff; border: 1px solid #ddd6fe; border-radius: 10px; padding: 8px 10px; color: rgba(0,0,0,.75); white-space: pre-line; }
.ai-explain-h { font-weight: 800; font-size: .74rem; color: #6d28d9; margin-bottom: 2px; }
.ai-refs { font-size: .7rem; color: rgba(0,0,0,.5); margin-top: 4px; }

/* ── ทีมวิชาการ ── */
.ai-card { margin-top: 10px; border: 1px solid rgba(0,0,0,.12); border-left: 4px solid #94a3b8; border-radius: 10px; padding: 9px 11px; background: #fff; font-size: .78rem; display: flex; flex-direction: column; gap: 5px; text-align: left; }
.ai-card.t-ok { border-left-color: #10b981; }
.ai-card.t-minor { border-left-color: #f59e0b; }
.ai-card.t-wrong { border-left-color: #ef4444; }
.ai-card.t-unclear { border-left-color: #8b5cf6; }
.ai-head { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; }
.ai-title { font-weight: 800; }
.ai-verdict { font-weight: 800; }
.t-ok .ai-verdict { color: #047857; } .t-minor .ai-verdict { color: #b45309; }
.t-wrong .ai-verdict { color: #b91c1c; } .t-unclear .ai-verdict { color: #6d28d9; }
.ai-conf { border: 1px solid rgba(0,0,0,.12); background: #f8fafc; border-radius: 999px; padding: 2px 8px; font-family: inherit; font-size: .7rem; font-weight: 700; cursor: pointer; }
.ai-tag { font-size: .7rem; font-weight: 800; border-radius: 6px; padding: 2px 6px; }
.ai-tag.applied { background: #dbeafe; color: #1e40af; }
.ai-tag.stale { background: #f1f5f9; color: #475569; }
.ai-tag.conflict { background: #fee2e2; color: #b91c1c; }
.ai-date { margin-left: auto; font-size: .7rem; color: rgba(0,0,0,.4); }
.ai-line { line-height: 1.5; }
.ai-muted { color: rgba(0,0,0,.5); font-size: .74rem; }
.ai-new { background: #dcfce7; border-radius: 4px; padding: 0 3px; }
.ai-issues { margin: 0; padding-left: 18px; line-height: 1.5; }
.ai-card .ai-explain { margin-top: 2px; }

/* ── popover ── */
.ai-ov { position: fixed; inset: 0; z-index: 250; background: rgba(0,0,0,.45); display: flex; align-items: flex-start; justify-content: center; overflow-y: auto; padding: 18px 16px calc(18px + env(safe-area-inset-bottom, 0px)); }
.ai-pop { background: #fff; width: 100%; max-width: 380px; margin: auto 0; border-radius: 16px; padding: 14px; font-size: .8rem; box-shadow: 0 10px 30px rgba(0,0,0,.2); }
.ai-pop-h { display: flex; justify-content: space-between; align-items: center; font-weight: 800; font-size: .92rem; margin-bottom: 8px; }
.ai-x { border: none; background: rgba(0,0,0,.06); border-radius: 8px; width: 36px; height: 36px; cursor: pointer; }
.ai-pop-this { background: #f8fafc; border-radius: 10px; padding: 8px 10px; margin-bottom: 8px; line-height: 1.5; }
.ai-levels { width: 100%; border-collapse: collapse; font-size: .74rem; }
.ai-levels td { padding: 6px 4px; border-top: 1px solid rgba(0,0,0,.07); vertical-align: top; line-height: 1.45; }
.ai-levels td.lv { white-space: nowrap; font-weight: 700; padding-right: 8px; }
.ai-levels tr.on td { background: #fefce8; }
.ai-pop-foot { margin-top: 10px; font-size: .72rem; color: rgba(0,0,0,.5); text-align: center; }
</style>
