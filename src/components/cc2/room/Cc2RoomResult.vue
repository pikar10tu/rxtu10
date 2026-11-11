<!-- src/components/cc2/room/Cc2RoomResult.vue — จบเคสในห้องคู่: คะแนน + เช็คลิสต์ที่ผู้ประเมินติ๊ก (ทั้งคู่เห็นเต็ม) + ปุ่มรอบถัดไป (หัวห้อง) -->
<template>
  <div class="crr">
    <section class="crr-card crr-top">
      <div class="crr-row">
        <div class="crr-score">{{ fmt(result.got) }}<small>/{{ fmt(result.tot) }}</small></div>
        <div class="crr-pct" :class="band">{{ pct }}%</div>
      </div>
      <div class="crr-msg">
        <template v-if="myRole === 'examinee'">{{ msg }}</template>
        <template v-else>ส่งผลให้ผู้สอบแล้ว — คุยกันว่าพลาดตรงไหน แล้วสลับบทกันทำเคสถัดไป</template>
      </div>
      <div v-if="isHost" class="crr-act">
        <button type="button" class="crr-btn alt" @click="emit('next', { swap: false })">เคสถัดไป</button>
        <button type="button" class="crr-btn" @click="emit('next', { swap: true })">สลับบท แล้วเคสถัดไป</button>
      </div>
      <div v-else class="crr-hint">รอหัวห้องเลือกเคสถัดไป…</div>
    </section>

    <Cc2CaseBody :case-data="caseData" role="solo" readonly :checks="result.checks || {}" :answers="result.answers || {}" @open-drug="emit('open-drug', $event)" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import Cc2CaseBody from '../Cc2CaseBody.vue'

const props = defineProps({
  caseData: { type: Object, required: true },
  result: { type: Object, required: true },
  myRole: { type: String, default: '' },
  isHost: Boolean,
})
const emit = defineEmits(['next', 'open-drug'])
const fmt = n => (Number.isInteger(n) ? String(n) : (+n).toFixed(2).replace(/0$/, ''))
const pct = computed(() => (props.result.tot ? Math.round(props.result.got / props.result.tot * 100) : 0))
const band = computed(() => (pct.value >= 80 ? 'hi' : pct.value >= 60 ? 'mid' : 'lo'))
const msg = computed(() => pct.value >= 80 ? 'ทำได้ดีมาก ดูข้อที่ยังไม่ได้ติ๊กไว้กันลืม' : pct.value >= 60 ? 'ผ่านเกณฑ์แล้ว ไล่ดูข้อที่พลาดด้านล่าง' : 'ยังไม่ครบ ไล่ดูเช็คลิสต์ด้านล่างแล้วลองใหม่กับเพื่อน')
</script>

<style scoped>
.crr { display: flex; flex-direction: column; gap: 10px; }
.crr-card { background: var(--surface); border: var(--bw) solid var(--line); border-radius: 16px; padding: 12px 14px; box-shadow: var(--shadow-sm); }
.crr-top { border-color: var(--primary-2); background: linear-gradient(180deg, #f3fafe, #fff); }
.crr-row { display: flex; align-items: baseline; justify-content: space-between; gap: 10px; }
.crr-score { font-size: 2rem; font-weight: 800; color: var(--primary-dark); font-variant-numeric: tabular-nums; }
.crr-score small { font-size: 1rem; color: var(--muted); }
.crr-pct { font-size: 1.3rem; font-weight: 800; padding: 4px 14px; border-radius: 999px; }
.crr-pct.hi { background: var(--mint-light); color: #1f7a5a; }
.crr-pct.mid { background: #fff3d6; color: #8a5a00; }
.crr-pct.lo { background: #fff0f6; color: #a3345f; }
.crr-msg { font-size: .9rem; margin: 6px 0 10px; }
.crr-act { display: flex; gap: 8px; }
.crr-btn { flex: 1; font: inherit; font-weight: 800; font-size: .9rem; padding: 11px 10px; border-radius: 14px; border: none; background: var(--primary); color: #fff; cursor: pointer; box-shadow: var(--pop); }
.crr-btn.alt { background: #fff; color: var(--primary); border: 2px solid var(--primary); box-shadow: none; }
.crr-hint { color: var(--muted); font-size: .84rem; text-align: center; }
</style>
