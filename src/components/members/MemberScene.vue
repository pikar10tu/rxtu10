<!-- 🏠 ฉากบ้าน + อวาตาร์ครึ่งตัวบนการ์ดเพื่อน — วาดรวมลง canvas เดียวขนาดจริง 120×78 แล้วให้ CSS ขยายแบบ pixelated (20 พ.ย. 2026)
     แทน div ฉาก + DollFigure ที่ยืดด้วย transform: scale(ทศนิยม) → การ์ด 80+ ใบเป็นเลเยอร์ยืดแยกกัน เลื่อนหน้า members สะดุด
     พิกัดเท่าแบบเดิมเป๊ะ: ฉาก = ส่วน x48–168 y16–94 ของภาพ 180×100 · ตุ๊กตา 2 เท่า มุมซ้ายบนที่ (-42, -6) · ภาพนิ่ง ไม่มีออร่า -->
<template>
  <canvas ref="cv" class="ms" :width="W" :height="H" role="img" :aria-label="label"></canvas>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { render } from '../../utils/dollRender.js'

const props = defineProps({
  src: { type: String, required: true },     // ภาพฉาก res-XX.webp (180×100)
  eq: { type: Object, required: true },
  label: { type: String, default: '' },
})
const W = 120, H = 78, SX = 48, SY = 16, DX = -42, DY = -6, DS = 2
const cv = ref(null)

// ภาพฉากโหลดครั้งเดียวต่อไฟล์ ใช้ร่วมทุกการ์ด
const IMG = new Map()
function loadImg(src) {
  if (!IMG.has(src)) IMG.set(src, new Promise((ok) => { const im = new Image(); im.onload = () => ok(im); im.onerror = () => ok(null); im.src = src }))
  return IMG.get(src)
}

let ticket = 0
async function draw() {
  const my = ++ticket
  const im = await loadImg(props.src)
  const c = cv.value
  if (!c || my !== ticket) return
  const ctx = c.getContext('2d')
  ctx.imageSmoothingEnabled = false
  ctx.clearRect(0, 0, W, H)
  if (im) ctx.drawImage(im, SX, SY, W, H, 0, 0, W, H)
  const { px, w, h } = render(props.eq)
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const v = px[y][x]
    if (!v) continue
    const X = DX + x * DS, Y = DY + y * DS
    if (X >= W || Y >= H || X + DS <= 0 || Y + DS <= 0) continue
    ctx.fillStyle = v
    ctx.fillRect(X, Y, DS, DS)
  }
}
onMounted(draw)
watch(() => props.src + JSON.stringify(props.eq), draw)   // eq เป็น object ใหม่ทุกรอบ render แม่ → เทียบเนื้อหาแทน
</script>

<style scoped>
.ms { display: block; width: 100%; height: 100%; image-rendering: pixelated; image-rendering: crisp-edges; }
</style>
