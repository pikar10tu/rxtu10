<!-- TowerMilestones — รางวัลขั้นหอคอยทุก 10 ชั้น (user เคาะ 30 ก.ย. 2026)
     แถบบน: อีกกี่ชั้นถึงรางวัลถัดไป + ปุ่มรับ (รับทุกขั้นที่ถึงแล้วทีเดียว) · กดดูรายการครบ 10 ขั้น -->
<template>
  <div class="tms" :class="{ ready: claimable.length }">
    <div class="tms-top">
      <span class="tms-t">
        <b><Emoji char="🎁" /> รางวัลขั้นหอคอย</b>
        <small v-if="claimable.length">ถึงแล้ว {{ claimable.length }} ขั้น รอรับอยู่</small>
        <small v-else-if="next">อีก {{ next.f - best }} ชั้นถึงชั้น {{ next.f }} · {{ rewardText(next) }}</small>
        <small v-else>รับครบทุกขั้นของซีซั่นนี้แล้ว</small>
      </span>
      <button v-if="claimable.length" class="tms-go" :disabled="busy" @click="$emit('claim')">รับเลย</button>
      <button v-else class="tms-more" :aria-expanded="open" @click="open = !open">{{ open ? 'ซ่อน' : 'ดูทั้งหมด' }}</button>
    </div>
    <div v-if="next" class="tms-bar"><i :style="{ width: ((best % 10) * 10) + '%' }" /></div>
    <div v-if="open || claimable.length" class="tms-list">
      <div v-for="m in TOWER_MILESTONES" :key="m.f" class="tms-row"
           :class="{ done: claims.includes(m.f), can: best >= m.f && !claims.includes(m.f), big: m.big }">
        <span class="tms-f">{{ m.f }}</span>
        <span class="tms-r">{{ rewardText(m) }}</span>
        <span class="tms-s">{{ claims.includes(m.f) ? 'รับแล้ว' : best >= m.f ? 'ถึงแล้ว' : `อีก ${m.f - best}` }}</span>
      </div>
      <div class="tms-note">หอคอยรีเซตทุกซีซั่น รางวัลขั้นก็รับใหม่ได้ทุกซีซั่น · ชั้น 100 ได้ฉายา "ผู้พิชิตยอดหอคอย" ด้วย</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import Emoji from '../shared/Emoji.vue'
import { TOWER_MILESTONES, nextMilestone } from '../../data/towerMilestones.js'
import { ANTI_LOSS } from '../../utils/antiLoss.js'

const props = defineProps({
  best: { type: Number, default: 0 },
  claims: { type: Array, default: () => [] },
  claimable: { type: Array, default: () => [] },
  busy: Boolean,
})
defineEmits(['claim'])
const open = ref(false)
const next = computed(() => nextMilestone(props.best))
const rewardText = (m) => [
  m.coins && `🪙 ${m.coins.toLocaleString()}`,
  m.tickets && `🎟️ ×${m.tickets}`,
  m.antiLoss && `${ANTI_LOSS.emoji} ${ANTI_LOSS.name} ×${m.antiLoss}`,
].filter(Boolean).join(' + ')
</script>

<style scoped>
.tms { background: #fff; border: var(--bw) solid var(--line); border-radius: 16px; box-shadow: var(--pop); padding: 10px 12px; margin: 10px 0; }
.tms.ready { border-color: #f2b544; box-shadow: 0 0 0 3px rgba(242,181,68,.25), var(--pop); }
.tms-top { display: flex; align-items: center; gap: 10px; }
.tms-t { flex: 1; min-width: 0; font-size: .84rem; }
.tms-t small { display: block; font-size: .72rem; color: var(--muted); margin-top: 2px; }
.tms-go, .tms-more { font-family: inherit; font-weight: 800; font-size: .76rem; border-radius: 10px; padding: 7px 12px; cursor: pointer; flex-shrink: 0; }
.tms-go { border: 0; background: #f2b544; color: #3a2600; }
.tms-go:disabled { opacity: .5; }
.tms-more { border: var(--bw) solid var(--line); background: #fff; color: var(--muted); }
.tms-bar { height: 6px; border-radius: 9px; background: rgba(0,0,0,.06); overflow: hidden; margin-top: 8px; }
.tms-bar i { display: block; height: 100%; background: linear-gradient(90deg, #f2b544, var(--accent)); border-radius: 9px; }
.tms-list { display: flex; flex-direction: column; gap: 4px; margin-top: 10px; }
.tms-row { display: flex; align-items: center; gap: 8px; padding: 5px 8px; border-radius: 10px; font-size: .76rem; }
.tms-row.can { background: #fff7db; }
.tms-row.done { opacity: .5; }
.tms-f { width: 34px; text-align: center; font-weight: 800; color: var(--muted); font-variant-numeric: tabular-nums; }
.tms-row.big .tms-f { color: #c98a0b; }
.tms-r { flex: 1; min-width: 0; }
.tms-s { font-size: .7rem; color: var(--muted); white-space: nowrap; }
.tms-note { font-size: .7rem; color: var(--muted); margin-top: 4px; line-height: 1.5; }
</style>
