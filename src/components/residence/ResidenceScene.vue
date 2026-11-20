<!-- 🏠 ฉากบ้านพิกเซล 180×100 (แผนกอาร์ต งาน C · 20 พ.ย. 2026) ขยาย 2 เท่าเสมอ = พิกเซลเท่าอวาตาร์
     กล่องฉากเต็มความกว้างเสมอ สัดส่วน 9:5 คงที่ (user 20 พ.ย.: สูงขึ้นได้ ไม่ต้องเบลอขอบ ไม่ยืดภาพ)
     วาดที่ 360×200 แล้วย่อ/ขยายทั้งก้อนด้วย transform ตามความกว้างจริง (--k) — อวาตาร์+ฉาก+เอฟเฟคขยายเท่ากันเป๊ะ
     อวาตาร์ยืนตามจุดเท้าของแต่ละฉาก (FEET) · เอฟเฟคแสงอลังการขึ้นตามขั้นฉาก (user 20 พ.ย.)
     slot = ของที่ทับบนฉาก (ข้อความทักทาย ป้าย ปุ่ม) -->
<template>
  <div ref="box" class="rs">
    <div class="rs-in" :style="{ width: 180 * S + 'px', height: 100 * S + 'px', transform: `scale(${k})` }">
      <img class="rs-img" :src="src" :alt="tier.tierName" width="180" height="100" draggable="false" />
      <canvas ref="fx" class="rs-fx" width="180" height="100" aria-hidden="true"></canvas>
      <component :is="dollTo ? RouterLink : 'span'" v-if="eq" :to="dollTo || undefined" class="rs-doll" :style="dollPos" :aria-label="dollTo ? 'ห้องแต่งตัว' : undefined">
        <DollFigure :eq="eq" :scale="S" :aura="aura" :label="label" />
      </component>
    </div>
    <slot />
  </div>
</template>

<script setup>
import { computed, ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { RouterLink } from 'vue-router'
import DollFigure from '../doll/DollFigure.vue'
import { getTier, clampLevel } from '../../data/residence.js'
import { sceneFx } from '../../utils/residenceFx.js'
import { prefersReducedMotion } from '../../utils/motionPref.js'

const props = defineProps({
  scene: { type: Number, default: 1 },
  eq: { type: Object, default: null },        // ไม่ส่ง = ฉากเปล่า
  label: { type: String, default: 'อวาตาร์' },
  dollTo: { type: String, default: '' },      // แตะอวาตาร์แล้วไปไหน ('' = แตะไม่ได้)
  aura: { type: Boolean, default: true },
  fx: { type: Boolean, default: true },
})
const S = 2
const IMGS = import.meta.glob('../../assets/residence/res-*.webp', { eager: true, import: 'default' })
const n = computed(() => clampLevel(props.scene))
const tier = computed(() => getTier(n.value))
const src = computed(() => IMGS[`../../assets/residence/res-${String(n.value).padStart(2, '0')}.webp`])

// จุดเท้า [x กลางตัว, y เท้า] ในพิกัดภาพ — ฉากที่พื้นไม่ได้อยู่ y 88 ต้องใส่ที่นี่ (ตรวจด้วยตาครบ 20 ฉากแล้ว)
const FEET = { 12: [40, 84], 13: [36, 86], 15: [44, 76], 17: [38, 72], 19: [40, 78], 20: [42, 79] }
const dollPos = computed(() => {
  const [x, y] = FEET[n.value] || [40, 88]
  return { left: (x - 30) * S + 'px', top: (y - 52) * S + 'px' }
})

// ✨ เอฟเฟค: วาดบน canvas 180×100 ขยายแบบพิกเซลคม · หยุดเมื่อพ้นจอ/แท็บซ่อน/ผู้ใช้ตั้งลดการเคลื่อนไหว
// ความกว้างจริง → อัตราขยาย
const box = ref(null)
const k = ref(1)
let ro = null
onMounted(() => {
  const fit = () => { const w = box.value?.clientWidth; if (w) k.value = w / (180 * S) }
  fit()
  ro = new ResizeObserver(fit); ro.observe(box.value)
})
onBeforeUnmount(() => ro?.disconnect())

const fx = ref(null)
let raf = 0, io = null, visible = true, stop = null
function start() {
  cancelAnimationFrame(raf)
  const cv = fx.value
  if (!cv) return
  const g = cv.getContext('2d')
  g.clearRect(0, 0, 180, 100)
  if (!props.fx) return
  const step = sceneFx(n.value)
  const still = prefersReducedMotion()
  let t = 0
  const frame = () => {
    t++
    step(g, t)
    if (!still && visible && !document.hidden) raf = requestAnimationFrame(frame)
  }
  stop = () => cancelAnimationFrame(raf)
  frame()
}
const onVis = () => { if (!document.hidden && visible) start() }
onMounted(() => {
  start()
  io = new IntersectionObserver(([e]) => { const was = visible; visible = e.isIntersecting; if (visible && !was) start() })
  io.observe(fx.value)
  document.addEventListener('visibilitychange', onVis)
})
onBeforeUnmount(() => { stop?.(); io?.disconnect(); document.removeEventListener('visibilitychange', onVis) })
watch(() => [n.value, props.fx], start)
</script>

<style scoped>
.rs { position: relative; overflow: hidden; width: 100%; aspect-ratio: 9 / 5; background: var(--primary-light); }
.rs-in { position: absolute; left: 0; top: 0; transform-origin: 0 0; }
.rs-img, .rs-fx { position: absolute; inset: 0; width: 100%; height: 100%; image-rendering: pixelated; }
.rs-img { user-select: none; }
.rs-fx { pointer-events: none; }
.rs-doll { position: absolute; line-height: 0; text-decoration: none; }
a.rs-doll:active { transform: scale(.96); transform-origin: bottom center; }
</style>
