<!-- 🧭 แผงตัดสินใจของผู้เล่นที่ถึงตา — แปลง pending ของ engine เป็นปุ่ม · เลือกช่องบนกระดาน = emit pick -->
<template>
  <div v-if="pd" class="tp">
    <div class="q">{{ title }}</div>
    <div class="row">
      <template v-if="pd.kind === 'buy'">
        <button v-for="h in pd.max + 1" :key="h" type="button" class="btn go" @click="send({ type: 'buy', houses: h - 1 })">
          {{ h === 1 ? 'ซื้อที่ดิน' : '+ บ้าน ' + (h - 1) }}<small>{{ money(landPrice(pd.idx) + (h - 1) * houseCost(pd.idx)) }}</small>
        </button>
      </template>
      <template v-else-if="pd.kind === 'build'">
        <button v-for="h in pd.max" :key="h" type="button" class="btn go" @click="send({ type: 'build', houses: h })">
          สร้าง {{ h }} หลัง<small>{{ money(h * houseCost(pd.idx)) }}</small>
        </button>
      </template>
      <button v-else-if="pd.kind === 'landmark'" type="button" class="btn gold" @click="send({ type: 'landmark' })">🏆 อัปแลนด์มาร์ค<small>{{ money(pd.cost) }}</small></button>
      <button v-else-if="pd.kind === 'takeover'" type="button" class="btn pink" @click="send({ type: 'takeover' })">🤝 ซื้อต่อ<small>{{ money(pd.price) }}</small></button>
      <div v-else-if="pd.kind === 'minigame'" class="mg">
        <div class="track"><span class="zone"></span><span class="needle" :style="{ left: needle * 100 + '%' }"></span></div>
        <button type="button" class="btn gold" @click="stopNeedle">หยุด!</button>
      </div>
      <span v-else-if="isPick" class="hint">แตะช่องที่ไฮไลต์บนกระดาน</span>
      <button v-if="canSkip" type="button" class="btn" @click="send({ type: 'skip' })">{{ pd.kind === 'travelPick' ? 'ไม่บิน' : 'ข้าม' }}</button>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch, onUnmounted } from 'vue'
import { TILES } from '../../data/tycoon/board.js'
import { CARDS } from '../../data/tycoon/cards.js'
import { landPrice, houseCost } from '../../utils/tycoon/rules.js'

const props = defineProps({ state: { type: Object, required: true } })
const emit = defineEmits(['act'])
const money = (n) => '฿' + Number(n).toLocaleString()
const pd = computed(() => props.state.pending)
const send = (a) => emit('act', a)
const isPick = computed(() => ['startPick', 'festivalPick', 'cardTarget', 'blueprintPick', 'travelPick', 'sell'].includes(pd.value?.kind))
const canSkip = computed(() => !['minigame', 'sell', 'blueprintPick'].includes(pd.value?.kind))
const title = computed(() => {
  const p = pd.value, n = (i) => TILES[i].name
  switch (p?.kind) {
    case 'buy': return `ซื้อ ${n(p.idx)} ไหม?`
    case 'build': return `สร้างบ้านเพิ่มที่ ${n(p.idx)}`
    case 'landmark': return `${n(p.idx)} ครบ 3 หลังแล้ว!`
    case 'takeover': return `ซื้อต่อ ${n(p.idx)} จากเจ้าของ?`
    case 'startPick': return 'ถึงจุดเริ่มต้น! เลือกเมืองตัวเองไปสร้าง'
    case 'festivalPick': return 'เลือกเมืองตัวเองจัดเทศกาล (ค่าผ่านทาง ×2)'
    case 'cardTarget': return `${CARDS[p.card].emoji} เลือกเมืองคู่แข่ง`
    case 'blueprintPick': return '📐 เลือกเมืองตัวเองสร้างฟรี 1 หลัง'
    case 'travelPick': return '✈️ เลือกที่ที่จะบินไป'
    case 'minigame': return '🎯 หยุดเข็มให้ตรงกลาง!'
    case 'sell': return `เงินไม่พอจ่าย ${money(p.amount)} — เลือกเมืองที่จะขาย (ได้ครึ่งราคา)`
  }
  return ''
})

const needle = ref(0)
let nT = null, nd = 1
watch(() => pd.value?.kind, (k) => {
  clearInterval(nT)
  if (k === 'minigame') { needle.value = 0; nT = setInterval(() => { needle.value += 0.035 * nd; if (needle.value >= 1 || needle.value <= 0) nd = -nd }, 30) }
}, { immediate: true })
function stopNeedle() { clearInterval(nT); send({ type: 'minigame', score: Math.max(0, 1 - Math.abs(needle.value - 0.5) * 2) }) }
onUnmounted(() => clearInterval(nT))
</script>

<style scoped>
.tp { display: flex; flex-direction: column; gap: 6px; align-items: center; animation: rise .22s ease-out; }
.q { font-weight: 900; font-size: .82rem; text-align: center; color: #3d3358; }
.row { display: flex; flex-wrap: wrap; gap: 6px; justify-content: center; }
.btn { border: var(--bw) solid var(--line); border-radius: 10px; padding: 6px 10px; font-family: inherit; font-weight: 800; font-size: .78rem; background: #fff; box-shadow: var(--pop); cursor: pointer; display: flex; flex-direction: column; align-items: center; line-height: 1.2; }
.btn small { font-size: .7rem; font-weight: 700; opacity: .75; }
.btn:active { transform: translateY(2px) scale(.97); }
.go { background: #c8f2d0; } .gold { background: #ffd25a; } .pink { background: #ffc6d6; }
.hint { font-size: .74rem; font-weight: 700; color: #b45309; }
.mg { display: flex; flex-direction: column; align-items: center; gap: 6px; width: 100%; }
.track { position: relative; width: 90%; height: 16px; border-radius: 8px; background: linear-gradient(90deg, #f2a5a5, #ffe39a 40%, #8fe0a8 50%, #ffe39a 60%, #f2a5a5); }
.zone { position: absolute; left: 45%; width: 10%; top: -3px; bottom: -3px; border: 2px dashed #2b2340; border-radius: 4px; }
.needle { position: absolute; top: -5px; width: 4px; height: 26px; margin-left: -2px; background: #2b2340; border-radius: 2px; }
@keyframes rise { from { transform: translateY(8px); opacity: 0; } }
</style>
