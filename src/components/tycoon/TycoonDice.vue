<!-- 🎲 ลูกเต๋า + แถบพลัง: กดค้าง = เข็มวิ่ง 2–12 · ปล่อย = เล็งเลขนั้น (คุมติดมีโอกาส ไม่ใช่แน่นอน) -->
<template>
  <div class="td">
    <div class="dice" :class="{ rolling: dice.rolling }">
      <img :src="ART['die_' + (dice.rolling ? spinA : dice.a)]" alt="" class="die" />
      <img :src="ART['die_' + (dice.rolling ? spinB : dice.b)]" alt="" class="die d2" />
      <span v-if="!dice.rolling && dice.show" class="sum" :class="{ ctl: dice.controlled }">{{ dice.a + dice.b }}<small v-if="dice.controlled"> เล็งติด!</small></span>
    </div>
    <div v-if="canRoll" class="gauge" :class="{ on: holding }">
      <div class="bar"><span class="fill" :style="{ width: ((aim - 2) / 10 * 100) + '%' }"></span><b>{{ holding ? aim : 'เล็ง' }}</b></div>
      <button
        type="button" class="roll" @pointerdown.prevent="hold" @pointerup.prevent="release" @pointerleave="holding && release()"
        @contextmenu.prevent
      >{{ holding ? 'ปล่อยเพื่อทอย' : '🎲 กดค้างแล้วปล่อย' }}</button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onUnmounted } from 'vue'
import { sfx } from '../../utils/sfx.js'
const ART = Object.fromEntries(Object.entries(import.meta.glob('../../assets/tycoon/die_*.png', { eager: true, import: 'default' }))
  .map(([k, v]) => [k.split('/').pop().replace('.png', ''), v]))
const props = defineProps({ dice: { type: Object, required: true }, canRoll: Boolean })
const emit = defineEmits(['roll'])

const spinA = ref(1), spinB = ref(4)
let spinT = null
watch(() => props.dice.rolling, (r) => {
  clearInterval(spinT)
  if (r) spinT = setInterval(() => { spinA.value = 1 + Math.floor(Math.random() * 6); spinB.value = 1 + Math.floor(Math.random() * 6) }, 70)
})

const holding = ref(false), aim = ref(2)
let dir = 1, gT = null
function hold() {
  holding.value = true; aim.value = 2; dir = 1
  gT = setInterval(() => {
    aim.value += dir
    if (aim.value >= 12 || aim.value <= 2) dir = -dir
    if (aim.value % 2 === 0) sfx('tap')
  }, 90)
}
function release() {
  if (!holding.value) return
  clearInterval(gT); holding.value = false
  emit('roll', aim.value)
}
onUnmounted(() => { clearInterval(gT); clearInterval(spinT) })
</script>

<style scoped>
.td { display: flex; flex-direction: column; align-items: center; gap: 6px; }
.dice { position: relative; display: flex; gap: 8px; height: 42px; align-items: center; }
.die { width: 38px; image-rendering: pixelated; filter: drop-shadow(0 3px 0 rgba(0,0,0,.25)); }
.rolling .die { animation: tumble .14s linear infinite; }
.rolling .d2 { animation-direction: reverse; }
.sum { position: absolute; right: -44px; font-weight: 900; font-size: 1.2rem; color: #3d3358; animation: popin .25s ease-out; white-space: nowrap; }
.sum small { font-size: .7rem; color: #e2585e; }
.gauge { width: 100%; display: flex; flex-direction: column; gap: 4px; align-items: center; }
.bar { position: relative; width: 90%; height: 14px; border-radius: 8px; background: #e9e3f5; overflow: hidden; }
.fill { position: absolute; inset: 0 auto 0 0; background: linear-gradient(90deg, #5aa9ff, #ff7a9c); transition: width .08s linear; }
.bar b { position: absolute; inset: 0; text-align: center; font-size: .7rem; line-height: 14px; color: #3d3358; }
.roll { border: var(--bw) solid var(--line); border-radius: 12px; padding: 9px 14px; font-family: inherit; font-weight: 900; font-size: .88rem; background: #ffd25a; box-shadow: var(--pop); cursor: pointer; user-select: none; -webkit-user-select: none; touch-action: none; animation: breathe 1.4s ease-in-out infinite; }
.gauge.on .roll { animation: none; transform: scale(.96); background: #ff9d4d; }
@keyframes tumble { 0% { transform: rotate(0) translateY(0); } 50% { transform: rotate(180deg) translateY(-6px); } 100% { transform: rotate(360deg) translateY(0); } }
@keyframes popin { 0% { transform: scale(.3); } 70% { transform: scale(1.25); } 100% { transform: scale(1); } }
@keyframes breathe { 50% { transform: scale(1.04); } }
</style>
