<!-- BattleReplay — เล่นผลสู้จาก battle log (raw: เลขเด้ง/แฟลช/หลอดเลือด + ปุ่ม ×2) -->
<template>
  <div v-if="data" class="br-ov">
    <div class="br-box">
      <div class="br-team">
        <div v-for="(p, i) in data.botTeam" :key="'B'+i" class="br-unit" :class="unitClass('B'+i)">
          <Emoji :char="defOf(p.id).emoji" />
          <div class="br-hp"><div class="br-hp-fill" :style="{ width: hpPct('B'+i) + '%' }"></div></div>
          <span v-for="pop in popsFor('B'+i)" :key="pop.k" class="br-pop" :class="{ crit: pop.crit }">-{{ pop.dmg }}</span>
        </div>
      </div>

      <div class="br-vs">⚔️ ชั้น {{ data.cleared }}</div>

      <div class="br-team">
        <div v-for="(p, i) in data.playerTeam" :key="'A'+i" class="br-unit" :class="unitClass('A'+i)">
          <Emoji :char="defOf(p.id).emoji" />
          <div class="br-hp"><div class="br-hp-fill me" :style="{ width: hpPct('A'+i) + '%' }"></div></div>
          <span v-for="pop in popsFor('A'+i)" :key="pop.k" class="br-pop" :class="{ crit: pop.crit }">-{{ pop.dmg }}</span>
        </div>
      </div>

      <div class="br-ctrl">
        <button v-if="!done" class="br-btn" @click="fast = !fast">{{ fast ? '×2 ⏩' : '×1 ▶' }}</button>
        <template v-else>
          <div class="br-result" :class="{ win: data.won }">{{ data.won ? `ชนะ! ขึ้นชั้น ${data.cleared + 1}` : 'แพ้ ลองใหม่ได้เลย' }}</div>
          <button class="br-btn" @click="$emit('close')">ปิด</button>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import Emoji from '../shared/Emoji.vue'
import { ref, computed, watch, onUnmounted } from 'vue'
import { getPetDef } from '../../data/index.js'
import { buildCombatant } from '../../data/battle.js'

const props = defineProps({ data: { type: Object, default: null } })
defineEmits(['close'])

const defOf = (id) => getPetDef(id) || { emoji: '❓' }

const idx = ref(0)
const fast = ref(false)
const hp = ref({})          // uid → %hp
const pops = ref({})        // uid → [{k,dmg,crit}]
const flashing = ref(null)
const acting = ref(null)
let timer = null, popKey = 0
let maxHp = {}              // uid → maxHp (จาก buildCombatant)

const log = computed(() => props.data?.result?.log || [])
const done = computed(() => idx.value >= log.value.length)

function buildMax(d) {
  maxHp = {}
  ;(d?.botTeam || []).forEach((p, i) => { maxHp['B' + i] = buildCombatant(p).maxHp || 1 })
  ;(d?.playerTeam || []).forEach((p, i) => { maxHp['A' + i] = buildCombatant(p).maxHp || 1 })
}
function reset() {
  clearTimeout(timer)
  idx.value = 0; pops.value = {}; flashing.value = null; acting.value = null
  const h = {}
  Object.keys(maxHp).forEach(uid => { h[uid] = 100 })
  hp.value = h
  step()
}
function step() {
  clearTimeout(timer)
  if (idx.value >= log.value.length) { acting.value = null; flashing.value = null; return }
  const e = log.value[idx.value]
  if (e.t === 'attack') {
    acting.value = e.attacker
    flashing.value = e.target
    hp.value = { ...hp.value, [e.target]: Math.max(0, Math.round((e.targetHpAfter / (maxHp[e.target] || 1)) * 100)) }
    const k = popKey++
    pops.value = { ...pops.value, [e.target]: [...(pops.value[e.target] || []), { k, dmg: e.dmg, crit: e.crit }] }
    setTimeout(() => { pops.value = { ...pops.value, [e.target]: (pops.value[e.target] || []).filter(p => p.k !== k) } }, 600)
  }
  idx.value++
  if (idx.value < log.value.length) timer = setTimeout(step, fast.value ? 90 : 180)
  else { acting.value = null; flashing.value = null }
}
function hpPct(uid) { return hp.value[uid] ?? 100 }
function popsFor(uid) { return pops.value[uid] || [] }
function unitClass(uid) {
  return { acting: acting.value === uid, flash: flashing.value === uid, dead: (hp.value[uid] ?? 100) <= 0 }
}

watch(() => props.data, (d) => { if (d) { buildMax(d); reset() } }, { immediate: true })
onUnmounted(() => clearTimeout(timer))
</script>

<style scoped>
.br-ov { position: fixed; inset: 0; z-index: 420; background: rgba(15,23,42,.82); display: flex; align-items: center; justify-content: center; padding: 16px; }
.br-box { width: 100%; max-width: 440px; display: flex; flex-direction: column; gap: 14px; }
.br-team { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
.br-unit { position: relative; aspect-ratio: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 2rem; background: rgba(255,255,255,.08); border-radius: 14px; transition: transform .1s; }
.br-unit.acting { transform: scale(1.18); z-index: 2; }
.br-unit.flash { animation: br-shake .18s; }
.br-unit.dead { opacity: .25; filter: grayscale(1); }
@keyframes br-shake { 0%,100% { transform: translateX(0) } 25% { transform: translateX(-4px) } 75% { transform: translateX(4px) } }
.br-hp { width: 80%; height: 5px; background: rgba(255,255,255,.2); border-radius: 999px; margin-top: 4px; overflow: hidden; }
.br-hp-fill { height: 100%; background: #ef4444; transition: width .15s; }
.br-hp-fill.me { background: #34d399; }
.br-pop { position: absolute; top: -2px; font-weight: 800; font-size: .8rem; color: #fca5a5; animation: br-rise .6s ease-out forwards; pointer-events: none; }
.br-pop.crit { color: #fbbf24; font-size: 1.05rem; }
@keyframes br-rise { from { transform: translateY(0); opacity: 1 } to { transform: translateY(-22px); opacity: 0 } }
.br-vs { text-align: center; color: #fff; font-weight: 800; font-size: .9rem; letter-spacing: .04em; }
.br-ctrl { display: flex; flex-direction: column; align-items: center; gap: 10px; margin-top: 4px; }
.br-btn { border: 2px solid #fff; background: rgba(255,255,255,.12); color: #fff; border-radius: 12px; padding: 10px 24px; font-family: inherit; font-weight: 800; cursor: pointer; }
.br-result { font-size: 1.15rem; font-weight: 800; color: #fff; }
.br-result.win { color: #34d399; }
</style>
