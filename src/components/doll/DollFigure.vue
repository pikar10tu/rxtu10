<!-- 🧍 ตุ๊กตา avatar — วาดลง canvas แบบพิกเซลคม · ขยายเป็นจำนวนเต็มเท่าเท่านั้น (18 พ.ย. 2026)
     props: eq = { s, c, h, e, m, t, b, k, o, x, a, i, w } · scale = 1,2,3… -->
<template>
  <span class="dollw" :class="{ 'au-glow': glows.length }" :style="wrapStyle">
  <canvas
    ref="cv" class="doll" :width="size.w * k" :height="size.h * k"
    :style="{ width: size.w * k / dpr + 'px', height: size.h * k / dpr + 'px' }"
    :aria-label="label" role="img"
  ></canvas>
  <i v-for="(r, i) in layers.rings" :key="'r' + i" class="au-ring" :style="{ '--au': r, animationDelay: i * 0.8 + 's', bottom: 'calc(var(--px) * ' + (3 + i * 2) + ')' }"></i>
  <i v-for="(p, i) in layers.particles" :key="i" :class="'pt pt-' + p.type" :style="{ left: p.left + '%', top: p.top + '%', '--au': p.color, animationDelay: p.delay + 's' }"></i>
  </span>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { render } from '../../utils/dollRender.js'
import { aurasOf } from '../../utils/doll.js'
import { auraLayers } from '../../utils/dollAura.js'

const props = defineProps({
  eq: { type: Object, required: true },
  scale: { type: Number, default: 4 },
  label: { type: String, default: 'ตัวละคร' },
  aura: { type: Boolean, default: true },   // ✨ ออร่าของแพง (ปิดได้ถ้าหน้าไหนอยากนิ่ง)
})
const cv = ref(null)
const s = computed(() => Math.max(1, Math.round(props.scale)))
// จอสเกลเศษ (Windows 125% · มือถือ DPR 2.75) → 1 พิกเซลตุ๊กตา = จุดจอไม่เต็มจำนวน → บางช่องกว้างกว่าช่องอื่น ซ้ายขวาไม่เท่ากัน
// แก้: วาดเป็น "จุดจอจริง" จำนวนเต็มต่อพิกเซล (k) แล้วย่อ CSS กลับด้วย dpr — ขนาดคลาดจาก scale ได้นิดหน่อย แต่ทุกช่องเท่ากันเป๊ะ (19 พ.ย. 2026)
const dpr = ref(typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1)
const k = computed(() => Math.max(1, Math.round(s.value * dpr.value)))
const px = computed(() => k.value / dpr.value)   // 1 พิกเซลตุ๊กตา = กี่ px CSS (ขนาดประกายตามตัว)
const out = computed(() => render(props.eq))
const size = computed(() => ({ w: out.value.w, h: out.value.h }))
// ✨ ออร่า 8 แบบ หลายอันพร้อมกันได้ (utils/dollAura.js) — glow รวมเป็น drop-shadow ต่อกัน · ring = วงใต้เท้า · ที่เหลือเป็นอนุภาค CSS
const auras = computed(() => (props.aura ? aurasOf(props.eq) : []))
const layers = computed(() => auraLayers(auras.value))
const glows = computed(() => layers.value.glows)
const shadow = (m) => glows.value.map(c => `drop-shadow(0 0 calc(var(--px) * ${m}) ${c})`).join(' ')
const wrapStyle = computed(() => (auras.value.length
  ? { '--px': px.value + 'px', ...(glows.value.length ? { '--gl1': shadow(1), '--gl3': shadow(3) } : {}) }
  : null))

function draw() {
  const c = cv.value
  if (!c) return
  const ctx = c.getContext('2d')
  ctx.clearRect(0, 0, c.width, c.height)
  const { px, w, h } = out.value
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const v = px[y][x]
    if (!v) continue
    ctx.fillStyle = v
    ctx.fillRect(x * k.value, y * k.value, k.value, k.value)
  }
}
onMounted(draw)
watch([out, k], () => requestAnimationFrame(draw))
// ซูมเบราว์เซอร์/ย้ายจอ → dpr เปลี่ยน
let mq
function trackDpr() {
  mq?.removeEventListener('change', onDpr)
  mq = window.matchMedia(`(resolution: ${dpr.value}dppx)`)
  mq.addEventListener('change', onDpr)
}
function onDpr() { dpr.value = window.devicePixelRatio || 1; trackDpr() }
onMounted(trackDpr)
onBeforeUnmount(() => mq?.removeEventListener('change', onDpr))
</script>

<style scoped>
.doll { image-rendering: pixelated; image-rendering: crisp-edges; display: block; }
.dollw { position: relative; display: inline-block; line-height: 0; }
/* อนุภาคออร่า (utils/dollAura.js) — พิกเซลวาดด้วย box-shadow ขนาดตาม --px (1 พิกเซลตุ๊กตา) */
.pt { position: absolute; width: var(--px); height: var(--px); pointer-events: none; opacity: 0; }
/* ✨ ประกาย: กากบาท 3x3 กระพริบ */
.pt-sparkle {
  width: calc(var(--px) * 3); height: calc(var(--px) * 3);
  background:
    linear-gradient(var(--au), var(--au)) center / var(--px) 100% no-repeat,
    linear-gradient(var(--au), var(--au)) center / 100% var(--px) no-repeat;
  filter: drop-shadow(0 0 var(--px) var(--au));
  animation: dollSpk 2.4s steps(4) infinite;
}
@keyframes dollSpk { 0%, 100% { opacity: 0; transform: scale(.6); } 40% { opacity: 1; transform: scale(1); } 70% { opacity: .5; } }
/* 💗 หัวใจลอย: หัวใจ 5x4 ลอยขึ้นแล้วจาง */
.pt-hearts {
  box-shadow:
    calc(var(--px) * 1) 0 var(--au), calc(var(--px) * 3) 0 var(--au),
    0 var(--px) var(--au), calc(var(--px) * 1) var(--px) var(--au), calc(var(--px) * 2) var(--px) var(--au), calc(var(--px) * 3) var(--px) var(--au), calc(var(--px) * 4) var(--px) var(--au),
    calc(var(--px) * 1) calc(var(--px) * 2) var(--au), calc(var(--px) * 2) calc(var(--px) * 2) var(--au), calc(var(--px) * 3) calc(var(--px) * 2) var(--au),
    calc(var(--px) * 2) calc(var(--px) * 3) var(--au);
  animation: dollRise 3.4s ease-out infinite;
}
/* 🫧 ฟองลอย: วงกลมกลวง ลอยขึ้นส่ายนิดๆ */
.pt-bubbles { width: calc(var(--px) * 3); height: calc(var(--px) * 3); border: var(--px) solid var(--au); border-radius: 50%; animation: dollBubble 3.8s ease-in-out infinite; }
/* 🌸 กลีบปลิว: กลีบ 2 พิกเซล ร่วงเฉียงลง หมุน */
.pt-petals { background: var(--au); box-shadow: var(--px) var(--px) var(--au); animation: dollPetal 4.2s linear infinite; }
/* 🌟 ละอองดาว: จุดเดียว ลอยช้าๆ กระพริบ */
.pt-stardust { background: var(--au); box-shadow: 0 0 var(--px) var(--au); animation: dollDust 2.8s ease-out infinite; }
/* 🔥 เปลวไฟ: แท่งสั้นใต้เท้า พุ่งขึ้นถี่ๆ */
.pt-flame { height: calc(var(--px) * 2); background: var(--au); box-shadow: 0 calc(var(--px) * -1) #FFE7A8; animation: dollFlame 1.1s ease-out infinite; }
@keyframes dollRise { 0% { opacity: 0; transform: translateY(0); } 20% { opacity: 1; } 100% { opacity: 0; transform: translateY(calc(var(--px) * -14)); } }
@keyframes dollBubble { 0% { opacity: 0; transform: translate(0, 0); } 20% { opacity: .9; } 50% { transform: translate(var(--px), calc(var(--px) * -8)); } 100% { opacity: 0; transform: translate(0, calc(var(--px) * -16)); } }
@keyframes dollPetal { 0% { opacity: 0; transform: translate(0, 0) rotate(0); } 15% { opacity: 1; } 100% { opacity: 0; transform: translate(calc(var(--px) * 8), calc(var(--px) * 30)) rotate(180deg); } }
@keyframes dollDust { 0%, 100% { opacity: 0; transform: translateY(0); } 40% { opacity: 1; } 80% { opacity: .3; transform: translateY(calc(var(--px) * -10)); } }
@keyframes dollFlame { 0% { opacity: 0; transform: translateY(0) scaleY(1); } 30% { opacity: 1; } 100% { opacity: 0; transform: translateY(calc(var(--px) * -6)) scaleY(.4); } }
/* ⭕ วงแสงใต้เท้า: วงรีขยายแล้วจาง */
.au-ring {
  position: absolute; left: 50%; width: 46%; height: calc(var(--px) * 4); margin-left: -23%;
  border: var(--px) solid var(--au); border-radius: 50%; box-shadow: 0 0 calc(var(--px) * 2) var(--au);
  pointer-events: none; animation: dollRing 2.4s ease-out infinite;
}
@keyframes dollRing { 0% { opacity: .9; transform: scale(.5); } 100% { opacity: 0; transform: scale(1.25); } }
/* 🌟 เรืองแสง: ขอบเรืองสีของชิ้น หายใจช้าๆ */
.au-glow .doll { animation: dollGlow 2.8s ease-in-out infinite; }
@keyframes dollGlow {
  0%, 100% { filter: var(--gl1); }
  50% { filter: var(--gl3); }
}
</style>
