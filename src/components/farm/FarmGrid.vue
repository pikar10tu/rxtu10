<template>
  <div class="farm">
    <div class="farm-head">
      <span class="farm-title">🌾 ฟาร์ม</span>
      <span class="farm-sub">{{ plotCount }} แปลง · เมล็ดถึงระดับ {{ tierLabel }}</span>
    </div>

    <!-- plots -->
    <div class="farm-grid">
      <div v-for="(plot, i) in plots" :key="i" class="plot" :class="{ ready: stat(plot).ready, empty: !plot }">
        <!-- empty -->
        <button v-if="!plot" class="plot-empty" @click="openPicker(i)">
          <span class="plot-plus">＋</span>
          <span class="plot-hint">ปลูก</span>
        </button>

        <!-- planted -->
        <template v-else>
          <div class="plot-emoji">{{ stat(plot).crop.emoji }}</div>
          <div class="plot-name">{{ stat(plot).crop.name }}</div>

          <template v-if="stat(plot).ready">
            <button class="plot-btn harvest" @click="farm.harvest(i)">✅ เก็บเกี่ยว</button>
          </template>
          <template v-else>
            <div class="plot-bar"><div class="plot-fill" :style="{ width: (stat(plot).progress * 100) + '%' }"></div></div>
            <div class="plot-time">⏱ {{ fmt(stat(plot).remainingMs) }}</div>
            <div class="plot-actions">
              <button class="plot-mini" :disabled="plot.watered" @click="farm.water(i)">💧</button>
              <button class="plot-mini" :disabled="plot.fertilized" @click="farm.fertilize(i)">
                🌟<span class="plot-fertcost">{{ farm.fertilizerCost(plot.seedId) }}</span>
              </button>
            </div>
          </template>
        </template>
      </div>
    </div>

    <!-- inventory / sell -->
    <div class="inv">
      <div class="inv-head">
        <span>🧺 ผลผลิต</span>
        <button v-if="invList.length" class="inv-sellall" @click="farm.sellAll()">ขายทั้งหมด</button>
      </div>
      <div v-if="!invList.length" class="inv-empty">ยังไม่มีผลผลิต — ปลูกแล้วเก็บเกี่ยวมาขายได้เลย</div>
      <div v-else class="inv-list">
        <button v-for="it in invList" :key="it.id" class="inv-item" @click="farm.sell(it.id)">
          <span class="inv-emoji">{{ it.emoji }}</span>
          <span class="inv-qty">×{{ it.qty }}</span>
          <span class="inv-sell">ขาย {{ (it.sellPrice * it.qty).toLocaleString() }}🪙</span>
        </button>
      </div>
    </div>

    <SeedPicker
      :open="pickIndex !== null"
      :choices="farm.seedChoices.value"
      :coins="coins"
      @pick="onPick"
      @close="pickIndex = null"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '../../stores/auth.js'
import { useFarm } from '../../composables/useFarm.js'
import { getCrop } from '../../data/crops.js'
import SeedPicker from './SeedPicker.vue'

const auth = useAuthStore()
const farm = useFarm()

const now = ref(Date.now())
let timer = null
onMounted(() => { timer = setInterval(() => { now.value = Date.now() }, 1000) })
onUnmounted(() => clearInterval(timer))

const plots     = computed(() => farm.plots.value)
const plotCount = computed(() => farm.plotCount.value)
const coins     = computed(() => auth.userData?.coins || 0)
const tierLabel = computed(() => ({ common: 'ธรรมดา', rare: 'แรร์', epic: 'อิพิค', legendary: 'ตำนาน' }[farm.maxTier.value] || farm.maxTier.value))

const pickIndex = ref(null)
function openPicker(i) { pickIndex.value = i }
function onPick(seedId) { const i = pickIndex.value; pickIndex.value = null; if (i !== null) farm.plant(i, seedId) }

// reactive plot status (re-evaluates as `now` ticks)
function stat(plot) { return farm.status(plot, now.value) }

// format remaining grow time (ms) → readable countdown
function fmt(ms) {
  const s = Math.max(0, Math.ceil(ms / 1000))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  if (h > 0) return `${h}ชม ${m}น`
  if (m > 0) return `${m}น ${sec}ว`
  return `${sec}ว`
}

const invList = computed(() =>
  Object.entries(farm.inventory.value)
    .filter(([, q]) => q > 0)
    .map(([id, qty]) => { const c = getCrop(id); return { id, qty, emoji: c?.emoji, name: c?.name, sellPrice: c?.sellPrice || 0 } })
)
</script>

<style scoped>
.farm { background: #fff; border: 1px solid rgba(0,0,0,.08); border-radius: 16px; padding: 14px; }
.farm-head { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 12px; }
.farm-title { font-weight: 800; font-size: 1rem; }
.farm-sub { font-size: .64rem; color: rgba(0,0,0,.45); }
.farm-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
.plot { border-radius: 12px; background: rgba(120,90,50,.06); border: 1px solid rgba(120,90,50,.15); min-height: 110px; padding: 8px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px; }
.plot.ready { background: rgba(34,197,94,.1); border-color: rgba(34,197,94,.4); }
.plot-empty { all: unset; cursor: pointer; display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; min-height: 94px; color: rgba(0,0,0,.35); }
.plot-plus { font-size: 1.6rem; }
.plot-hint { font-size: .62rem; }
.plot-emoji { font-size: 1.8rem; line-height: 1; }
.plot-name { font-size: .64rem; color: rgba(0,0,0,.55); font-weight: 700; }
.plot-bar { width: 100%; height: 5px; background: rgba(0,0,0,.1); border-radius: 999px; overflow: hidden; }
.plot-fill { height: 100%; background: linear-gradient(90deg,#84cc16,#22c55e); }
.plot-time { font-size: .58rem; color: rgba(0,0,0,.5); }
.plot-actions { display: flex; gap: 4px; }
.plot-mini { border: none; background: rgba(0,0,0,.06); border-radius: 7px; padding: 3px 6px; font-size: .72rem; cursor: pointer; display: flex; align-items: center; gap: 1px; }
.plot-mini:disabled { opacity: .35; }
.plot-fertcost { font-size: .5rem; color: #b45309; }
.plot-btn.harvest { border: none; background: linear-gradient(135deg,#22c55e,#16a34a); color: #fff; font-weight: 800; font-size: .68rem; padding: 5px 8px; border-radius: 8px; cursor: pointer; font-family: inherit; }
.inv { margin-top: 14px; border-top: 1px dashed rgba(0,0,0,.12); padding-top: 12px; }
.inv-head { display: flex; justify-content: space-between; align-items: center; font-weight: 800; font-size: .82rem; margin-bottom: 8px; }
.inv-sellall { border: none; background: linear-gradient(135deg,#f59e0b,#d97706); color: #fff; font-weight: 700; font-size: .68rem; padding: 5px 10px; border-radius: 8px; cursor: pointer; font-family: inherit; }
.inv-empty { font-size: .7rem; color: rgba(0,0,0,.4); text-align: center; padding: 8px 0; }
.inv-list { display: flex; flex-wrap: wrap; gap: 6px; }
.inv-item { display: flex; align-items: center; gap: 5px; border: 1px solid rgba(0,0,0,.1); border-radius: 10px; padding: 6px 9px; background: #fff; cursor: pointer; font-family: inherit; }
.inv-item:active { transform: scale(.97); }
.inv-emoji { font-size: 1.1rem; }
.inv-qty { font-weight: 800; font-size: .74rem; }
.inv-sell { font-size: .64rem; color: #b45309; font-weight: 700; }
</style>
