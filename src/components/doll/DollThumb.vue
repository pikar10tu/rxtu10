<!-- 🧺 รูปย่อชิ้นตุ๊กตาในห้องแต่งตัว (19 พ.ย. 2026) — วาดแค่ตัวของ ไม่มีคน ไม่มีขอบสติกเกอร์
     ตา/ปาก/หนวด/แก้ม = ครอปหัว (renderThumb ใน utils/dollRender.js) · ขยายพอดีกล่องเป็นจำนวนเต็มเท่า
     props: id = ชิ้น · eq = ชุดที่ลองอยู่ (เอาสีผิว/สีผม/ทรงผมมาใช้กับรูปหน้า) · box = ขนาดกล่อง px -->
<template>
  <span class="dth" :style="{ width: box + 'px', height: box + 'px' }">
    <canvas ref="cv" :width="out.w * k" :height="out.h * k" :style="{ width: out.w * k / dpr + 'px', height: out.h * k / dpr + 'px' }" aria-hidden="true"></canvas>
  </span>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { renderThumb } from '../../utils/dollRender.js'

const props = defineProps({
  id: { type: String, required: true },
  eq: { type: Object, default: () => ({}) },
  box: { type: Number, default: 56 },
})
const cv = ref(null)
const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1
// รูปหน้าใช้แค่สีผิว/สีผม/ทรงผม/ตา/ปาก/แก้ม ของชุดที่ลอง — ส่วนอื่นเปลี่ยนไม่ต้องวาดใหม่
const faceKey = computed(() => ['s', 'c', 'h', 'e', 'm', 'j'].map(k => props.eq[k] || '').join('.'))
const out = computed(() => (faceKey.value, renderThumb(props.id, props.eq)))
// พิกเซลละกี่เท่า: ใหญ่สุดที่ยังพอดีกล่อง (1–3 เท่า) แล้วปัดเป็นจุดจอจริงเต็มจำนวน (กันช่องกว้างไม่เท่ากันบนจอสเกลเศษ)
const fit = computed(() => Math.max(1, Math.min(3, Math.floor((props.box - 4) / Math.max(out.value.w, out.value.h)))))
const k = computed(() => Math.max(1, Math.round(fit.value * dpr)))

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
</script>

<style scoped>
.dth { display: grid; place-items: center; background: var(--bg); border-radius: 10px; }
.dth canvas { image-rendering: pixelated; image-rendering: crisp-edges; display: block; }
</style>
