<!-- src/components/cc2/room/Cc2RoomPlay.vue — ระหว่างเคสในห้องคู่: นาฬิกา + ป้ายบทบาท + เนื้อเคสตาม role + ปุ่มจบเคส (ผู้ประเมิน)
     ผู้ประเมิน: เช็คลิสต์ติ๊กในเครื่อง (checks ผ่าน v-model จาก view) · กด "ส่งให้ผู้สอบ" บนการ์ดที่ gated → emit reveal
     ผู้สอบ: เห็นแค่ที่ผู้ประเมินส่งแล้ว · ช่องเติมคำพิมพ์ได้ (emit update:answers → view ซิงก์ขึ้น RTDB) -->
<template>
  <div class="crp">
    <div class="crp-top">
      <div class="crp-role" :class="myRole">
        <Emoji :char="myRole === 'examiner' ? '📝' : '🩺'" />
        <div>
          <b>คุณคือ{{ ROLES[myRole] || 'ผู้ชม' }}</b>
          <small>{{ myRole === 'examiner' ? 'อ่านบทผู้ป่วย ติ๊กตามที่ผู้สอบทำได้ ส่งข้อมูลเมื่อถึงจังหวะ' : 'ซักประวัติ/ให้คำแนะนำกับผู้ประเมินเหมือนสอบจริง' }}</small>
        </div>
      </div>
      <div class="crp-timer" :class="{ over: overTime, low: lowTime }">{{ clock }}</div>
    </div>
    <div v-if="partnerLeft" class="crp-warn">คู่ซ้อมออกจากห้องแล้ว — รอเพื่อนกลับเข้ามา หรือหัวห้องกลับล็อบบี้</div>

    <Cc2CaseBody
      :case-data="caseData" :role="myRole || 'examinee'" :revealed="revealed"
      :checks="checks" :answers="answers" :readonly="false"
      @update:checks="emit('update:checks', $event)" @update:answers="emit('update:answers', $event)"
      @reveal="emit('reveal', $event)" @open-drug="emit('open-drug', $event)" />

    <div v-if="myRole === 'examiner'" class="crp-bar">
      <div class="crp-bar-score">ตอนนี้ <b>{{ fmt(score.got) }}</b>/{{ fmt(score.tot) }}</div>
      <button type="button" class="crp-btn" :class="{ armed }" :disabled="busy" @click="onFinish">
        {{ armed ? 'แตะอีกครั้งเพื่อจบ' : 'จบเคส · ส่งผลให้ผู้สอบ' }}
      </button>
    </div>
    <div v-else class="crp-wait">ผู้ประเมินจะกดจบเคสเมื่อหมดเวลา — แล้วคุณจะเห็นคะแนนกับเช็คลิสต์ทั้งหมด</div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import Emoji from '../../shared/Emoji.vue'
import Cc2CaseBody from '../Cc2CaseBody.vue'
import { ROLES } from '../../../composables/useCc2Room.js'
import { scoreCase } from '../../../utils/cc2Case.js'

const props = defineProps({
  caseData: { type: Object, required: true },
  state: { type: Object, required: true },
  myRole: { type: String, default: '' },
  revealed: { type: Array, default: () => [] },
  checks: { type: Object, default: () => ({}) },
  answers: { type: Object, default: () => ({}) },
  now: { type: Number, default: 0 },
  partnerLeft: Boolean,
  busy: Boolean,
})
const emit = defineEmits(['update:checks', 'update:answers', 'reveal', 'finish', 'open-drug'])

const fmt = n => (Number.isInteger(n) ? String(n) : (+n).toFixed(2).replace(/0$/, ''))
const score = computed(() => scoreCase(props.caseData, props.checks, props.answers))

const elapsedSec = computed(() => Math.max(0, Math.floor((props.now - (props.state.startedAt || props.now)) / 1000)))
const leftSec = computed(() => (props.state.endsAt ? Math.floor((props.state.endsAt - props.now) / 1000) : null))
const overTime = computed(() => leftSec.value !== null && leftSec.value <= 0)
const lowTime = computed(() => leftSec.value !== null && leftSec.value > 0 && leftSec.value <= 60)
const clock = computed(() => {
  const s = leftSec.value !== null ? Math.abs(leftSec.value) : elapsedSec.value
  const mm = String(Math.floor(s / 60)).padStart(2, '0'), ss = String(s % 60).padStart(2, '0')
  return (overTime.value ? '-' : '') + `${mm}:${ss}`
})

// กันกดจบเคสพลาด: แตะสองครั้งภายใน 3 วิ
const armed = ref(false)
let armTimer = null
function onFinish() {
  if (!armed.value) { armed.value = true; clearTimeout(armTimer); armTimer = setTimeout(() => { armed.value = false }, 3000); return }
  armed.value = false; clearTimeout(armTimer)
  emit('finish', { ...score.value, checks: props.checks, answers: props.answers })
}
</script>

<style scoped>
.crp { display: flex; flex-direction: column; gap: 10px; padding-bottom: 80px; }
.crp-top { display: flex; align-items: center; gap: 10px; }
.crp-role { flex: 1; display: flex; align-items: center; gap: 10px; background: #fff3d6; border-radius: 14px; padding: 8px 12px; font-size: 1.2rem; }
.crp-role.examinee { background: var(--primary-light); }
.crp-role b { display: block; font-size: .92rem; }
.crp-role small { display: block; font-size: .74rem; color: var(--muted); line-height: 1.35; }
.crp-timer { font-variant-numeric: tabular-nums; font-weight: 800; font-size: 1.15rem; background: #fff; border: var(--bw) solid var(--line); border-radius: 999px; padding: 6px 14px; }
.crp-timer.low { color: #8a5a00; border-color: #f6c86a; }
.crp-timer.over { color: #c2415f; border-color: #f0a6c4; }
.crp-warn { background: #fff0f6; color: #a3345f; border-radius: 12px; padding: 8px 12px; font-size: .84rem; }
.crp-bar { position: sticky; bottom: 6px; display: flex; align-items: center; gap: 10px; background: rgba(255,255,255,.96); backdrop-filter: blur(6px); border: var(--bw) solid var(--line); border-radius: 16px; padding: 8px 10px 8px 14px; box-shadow: var(--pop-lg); z-index: 5; }
.crp-bar-score { font-size: .85rem; color: var(--muted); }
.crp-bar-score b { color: var(--primary-dark); font-size: 1rem; }
.crp-btn { margin-left: auto; font: inherit; font-weight: 800; font-size: .92rem; padding: 12px 16px; border-radius: 14px; border: none; background: var(--primary); color: #fff; cursor: pointer; box-shadow: var(--pop); }
.crp-btn.armed { background: #e07a3f; }
.crp-btn:disabled { opacity: .55; }
.crp-wait { text-align: center; color: var(--muted); font-size: .82rem; padding: 6px; }
</style>
