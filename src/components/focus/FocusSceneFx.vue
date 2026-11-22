<!-- ✨ ชีวิตในห้องโฟกัส (22 พ.ย. 2026) — วางทับฉากใน FocusView · ไม่รับการกด (pointer-events: none)
     1) แสงตามเวลาจริง: เช้า ชมพูอ่อน · กลางวัน ปกติ · เย็น ส้ม · กลางคืน น้ำเงินเข้ม + ดาวในหน้าต่าง/ฟ้า + แสงโคม + หิ่งห้อย (สวน)
     2) บรรยากาศประจำ: ไอจากเครื่องชง (คาเฟ่) · ฝุ่นลอยในแสงหน้าต่าง (ห้องสมุด กลางวัน)
     3) random event ทุก ~45–80 วิ ตามโซน: แมวเดินผ่าน · หนูวิ่ง · หนังสือหล่น · นกบินผ่าน · ผีเสื้อ · ใบไม้ร่วง · โคมกะพริบ
     สไปรต์พิกเซลวาดด้วย pxl (Claude outputs/focus-room-demo/art/fx.px.js) · พิกัดทั้งหมดเป็นพิกเซลฉาก 160×100 -->
<template>
  <div class="sfx" :class="'tod-' + tod">
    <!-- บรรยากาศประจำ -->
    <template v-if="zone === 'cafe'">
      <i v-for="n in 3" :key="'st' + n" class="steam" :style="{ left: pct(86), top: pct2(9), animationDelay: n * 1.2 + 's' }"></i>
    </template>
    <template v-if="zone === 'lib' && (tod === 'day' || tod === 'morning')">
      <i v-for="(d, i) in DUST" :key="'d' + i" class="dust" :style="{ left: pct(d[0]), top: pct2(d[1]), animationDelay: d[2] + 's' }"></i>
    </template>

    <!-- สีตามเวลา -->
    <template v-if="tod === 'night'">
      <i v-for="(s, i) in stars" :key="'s' + i" class="star" :style="{ left: pct(s[0]), top: pct2(s[1]), animationDelay: (i % 5) * 0.7 + 's' }"></i>
      <i v-for="(l, i) in lamps" :key="'l' + i" class="lamp" :style="{ left: pct(l[0]), top: pct2(l[1]) }" :class="{ flick: flicker === i, big: l[2] }"></i>
      <template v-if="zone === 'forest'">
        <i v-for="(f, i) in FLIES" :key="'f' + i" class="fly" :style="{ left: pct(f[0]), top: pct2(f[1]), animationDelay: f[2] + 's', animationDuration: f[3] + 's' }"></i>
      </template>
    </template>

    <!-- 🐈 แมวประจำห้อง (ห้องสมุด/สวน) -->
    <div v-for="(c, i) in cats" :key="c.id" class="res"
      :style="{ left: pct(c.x), top: pct2(c.y), width: (SPR[c.s][0] * CAT_K / 160 * 100) + '%', zIndex: petIdx === i ? 1550 : Math.round(c.y * 10), transitionDuration: c.dur + 's' }">
      <span class="spr" :class="c.s === 'cat_walk' ? 'f2' : c.s" :style="spr(c.s + '_' + c.coat, c.flip ? { transform: 'scaleX(-1)' } : {})"></span>
      <!-- 💗 เดินไปใกล้น้องแมว (ตัวที่อยู่พื้น) → ปุ่มหัวใจโผล่ · กดแล้วเมี๊ยว + หัวใจลอย (เห็นในเครื่องเราคนเดียว) -->
      <button v-if="petIdx === i" type="button" class="pet-btn" aria-label="ลูบน้องแมว" @click.stop="petCat(i)">💗</button>
      <span v-for="h in (c.hearts || [])" :key="h.id" class="heart" :style="{ '--dx': h.dx + 'px' }" aria-hidden="true">{{ h.meow ? 'เมี๊ยว~' : '♥' }}</span>
    </div>

    <!-- random events -->
    <div v-for="e in events" :key="e.id" class="ev" :class="e.cls" :style="e.style">
      <span class="spr" :class="e.anim ? 'f2' : ''" :style="e.spr"></span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { chime } from '../../utils/focusAudio.js'

const props = defineProps({ zone: { type: String, default: 'lib' }, me: { type: Object, default: null } })
const emit = defineEmits(['tod'])
const IMG = Object.fromEntries(Object.entries(import.meta.glob('../../assets/focus/fx/*.png', { eager: true, import: 'default' }))
  .map(([k, v]) => [k.split('/').pop().replace('.png', ''), v]))
// ขนาดเฟรม (px ฉาก) · จำนวนเฟรม
const SPR = { cat_loaf: [15, 8, 2], cat_sit: [10, 10, 2], cat_walk: [15, 8, 2], mouse: [10, 6, 2], bird: [7, 5, 2], butterfly: [5, 3, 2], leaf: [2, 3, 1], book: [6, 4, 1] }

// แมวประจำห้อง: x,y = จุดเท้า (พิกเซลฉาก)
//   fixed = นอนนิ่ง (บนตู้) · ที่เหลือเดินเล่นได้ในจุดพักของโซน (SPOTS ไม่ทับเคาน์เตอร์)
const RESIDENTS = {
  lib: [{ s: 'cat_loaf', x: 110, y: 7, fixed: true }, { s: 'cat_sit', x: 86, y: 80 }],      // นอนบนหลังตู้หนังสือ · นั่งบนพรม
  forest: [{ s: 'cat_loaf', x: 34, y: 60, flip: true }, { s: 'cat_sit', x: 98, y: 66 }],
}
const SPOTS = {
  lib: [[70, 58], [90, 60], [80, 72], [66, 84], [94, 86], [80, 97], [10, 80], [150, 80], [40, 99], [120, 99]],
  forest: [[20, 58], [60, 56], [100, 57], [140, 58], [80, 74], [66, 84], [94, 86], [10, 80], [150, 80], [40, 99], [120, 99]],
}
const CAT_K = 0.75   // แมวเล็กกว่าพิกเซลฉาก (user 22 พ.ย.: ตัวใหญ่ไป)
const COATS = ['o', 'w', 'b', 'g']
const cats = ref([])
let catTimers = []
function resetCats() {
  catTimers.forEach(clearTimeout); catTimers = []
  const coats = [...COATS].sort(() => Math.random() - 0.5)
  cats.value = (RESIDENTS[props.zone] || []).map((c, i) => ({ ...c, coat: coats[i % coats.length], id: props.zone + i + coats[i], dur: 0 }))
  cats.value.forEach((c, i) => { if (!c.fixed) idle(i) })
}
function idle(i) { catTimers[i] = setTimeout(() => wander(i), (12 + Math.random() * 20) * 1000) }   // พัก 12–32 วิ แล้วลุกเดิน
function walkTo(i, tx, ty, speed = 9) {
  const c = cats.value[i]; if (!c) return
  clearTimeout(catTimers[i])
  const d = Math.hypot(tx - c.x, ty - c.y)
  c.flip = tx < c.x          // สไปรต์เดินหันขวา → เดินไปซ้ายพลิก
  c.s = 'cat_walk'; c.dur = d / speed
  requestAnimationFrame(() => { c.x = tx; c.y = ty })
  catTimers[i] = setTimeout(() => {   // ถึงแล้ว: นั่งหรือนอนต่อ
    c.s = Math.random() < 0.5 ? 'cat_sit' : 'cat_loaf'; c.dur = 0
    c.flip = c.s === 'cat_loaf' ? !c.flip : c.flip   // ท่านอนวาดหันซ้าย
    idle(i)
  }, c.dur * 1000 + 50)
}
function wander(i) {
  const c = cats.value[i]; if (!c || document.hidden) { idle(i); return }
  const sp = SPOTS[props.zone] || []
  const opts = sp.filter(([x, y]) => Math.hypot(x - c.x, y - c.y) > 10)
  const [tx, ty] = opts[Math.floor(Math.random() * opts.length)] || [c.x, c.y]
  walkTo(i, tx, ty)
}
// 💗 เล่นกับแมว (22 พ.ย. · แทนของเดิมที่เดินใกล้แล้วแมวหนี) — เราหยุดยืนใกล้แมวที่อยู่พื้น (ไม่นับตัวบนตู้)
//    → ปุ่มหัวใจโผล่ · แมวอยู่นิ่งรอให้ลูบ ไม่ลุกเดินหนี · กด = เมี๊ยว + หัวใจลอย · เราเดินออก = แมวกลับไปเดินเล่นตามปกติ
const NEAR = 18
const petIdx = computed(() => {
  const m = props.me
  if (!m) return -1
  let best = -1, bd = NEAR
  cats.value.forEach((c, i) => {
    if (c.fixed || c.s === 'cat_walk') return
    const d = Math.hypot(c.x - m.x, c.y - m.y)
    if (d < bd) { bd = d; best = i }
  })
  return best
})
watch(petIdx, (i, old) => {
  if (i >= 0) clearTimeout(catTimers[i])        // มีคนมาหา → อยู่นิ่ง
  if (old >= 0 && old !== i && cats.value[old]) idle(old)   // คนเดินไปแล้ว → กลับไปเดินเล่น
})
let heartId = 0
function petCat(i) {
  const c = cats.value[i]; if (!c) return
  if (c.s === 'cat_loaf') { c.s = 'cat_sit' }   // นอนอยู่ → ลุกนั่ง
  const add = (meow, dx, delay) => setTimeout(() => {
    const id = ++heartId
    c.hearts = [...(c.hearts || []), { id, meow, dx }]
    setTimeout(() => { c.hearts = (c.hearts || []).filter(h => h.id !== id) }, 1400)
  }, delay)
  add(true, 0, 0); add(false, -8, 150); add(false, 8, 320)
  chime('meow')
}
const pct = (x) => (x / 160 * 100) + '%'
const pct2 = (y) => y + '%'

// ── เวลาของวัน ──
// ทดสอบ (เฉพาะ npm run dev): ต่อท้าย URL ?tod=night|dusk|morning|day เพื่อบังคับช่วงเวลา
const forced = (() => { try { return new URLSearchParams(location.hash.split('?')[1] || '').get('tod') } catch { return null } })()
const hour = ref(new Date().getHours())
const tod = computed(() => { if (import.meta.env.DEV && ['night', 'dusk', 'morning', 'day'].includes(forced)) return forced; const h = hour.value; return h >= 5 && h < 8 ? 'morning' : h >= 8 && h < 17 ? 'day' : h >= 17 && h < 19 ? 'dusk' : 'night' })
watch(tod, (t) => emit('tod', t), { immediate: true })
let clock = 0

const WIN = { lib: [[74, 10, 12, 30]], cafe: [[12, 6, 46, 18], [102, 6, 46, 18]], forest: [[0, 0, 160, 30]] }
const stars = computed(() => {
  const out = []; let seed = 7
  const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280
  for (const [x, y, w, h] of WIN[props.zone] || []) for (let i = 0; i < Math.max(3, Math.round(w * h / 90)); i++) out.push([x + 1 + rnd() * (w - 2), y + 1 + rnd() * (h - 2)])
  return props.zone === 'forest' ? out.filter(([x, y]) => !hidesSky(x, y)) : out
})
// สวน: ดาวต้องอยู่หลังต้นไม้/เมฆ/เนิน — ตัดดาวที่ตกในพุ่มไม้ (ตำแหน่งตาม bg_forest ใน room.px.js)
const TREES = [[0, 4], [62, 0], [128, 6]]
const CANOPY = TREES.flatMap(([ox, oy]) => [[ox + 16, oy + 16, 15], [ox + 10, oy + 21, 10], [ox + 22, oy + 21, 10], [ox + 16, oy + 30, 6]])
const CLOUDS = [[30, 10, 12, 5], [118, 6, 14, 5], [140, 14, 8, 8]]   // เมฆ 2 ก้อน + ดวงอาทิตย์/จันทร์
function hidesSky(x, y) {
  if (CANOPY.some(([cx, cy, r]) => (x - cx) ** 2 + (y - cy) ** 2 <= r * r)) return true
  if (CLOUDS.some(([cx, cy, rx, ry]) => ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1)) return true
  return y > 24   // ต่ำกว่านี้เป็นเนินเขา
}
const lamps = computed(() => ({ lib: [[80, 30, 'big'], [30, 66], [130, 66], [30, 90], [130, 90], [80, 80, 'big']], cafe: [[30, 14, 'big'], [130, 14, 'big'], [80, 20], [30, 66], [130, 66], [30, 90], [130, 90]], forest: [] })[props.zone] || [])
const DUST = [[76, 18, 0], [79, 26, 1.5], [83, 14, 3], [77, 34, 4.2], [82, 30, 2.4], [85, 22, 5]]
const FLIES = [[20, 60, 0, 6], [45, 75, 1.2, 7], [70, 55, 2.5, 5.5], [100, 70, 0.6, 6.5], [125, 58, 3, 7.5], [145, 80, 1.8, 6], [60, 88, 4, 8], [110, 90, 2.2, 7]]

// ── random events ──
const events = ref([])
const flicker = ref(-1)
let evId = 0, evTimer = 0
const base = (name) => name.replace(/_[owbg]$/, '')   // cat_sit_o → cat_sit
function spr(name, extra = {}) {
  const [w, h, n] = SPR[base(name)]
  return { backgroundImage: `url(${IMG[name]})`, backgroundSize: `${n * 100}% 100%`, width: '100%', aspectRatio: `${w} / ${h}`, ...extra }
}
function add(cls, name, style, dur, extra = {}) {
  const id = ++evId
  const [w] = SPR[base(name)]
  events.value.push({ id, cls, anim: SPR[base(name)][2] > 1, style: { width: (w / 160 * 100) + '%', animationDuration: dur + 's', ...style }, spr: spr(name, extra) })
  setTimeout(() => { events.value = events.value.filter(e => e.id !== id) }, dur * 1000 + 300)
}
const R = (a, b) => a + Math.random() * (b - a)
const walker = (name, y, dur) => {
  if (name === 'cat') name = 'cat_walk_' + COATS[Math.floor(Math.random() * 4)]   // เดินผ่านพื้นจากซ้ายไปขวาหรือกลับกัน
  // 🐈 แมวเดินผ่านร้องเมี๊ยวกลางทาง (สุ่ม 60% · เฉพาะตอนเรานั่งอยู่ในห้อง เหมือนเสียงกริ่ง)
  if (name.startsWith('cat_walk') && Math.random() < 0.6) setTimeout(() => { if (props.me && !document.hidden) chime('meow') }, (dur * (0.3 + Math.random() * 0.4)) * 1000)
  const ltr = Math.random() < 0.5
  add('walk' + (ltr ? '' : ' rtl'), name, { ...(name.startsWith('cat') ? { width: (15 * CAT_K / 160 * 100) + '%' } : {}), '--x0': ltr ? '-10%' : '105%', '--x1': ltr ? '105%' : '-10%', '--y': y + '%', zIndex: Math.round(y * 10) }, dur)
}
const EVENTS = {
  lib: [
    () => walker('cat', 99, 14),
    () => walker('mouse', 97, 5),
    () => { const x = [20, 54, 106, 140][Math.floor(R(0, 4))]; add('fall', 'book', { '--x': pct(x), '--y0': pct2(R(12, 30)), '--y1': '45%' }, 3.2) },
  ],
  cafe: [
    () => walker('cat', 99, 14),
    () => { const top = R(8, 18); add('air', 'bird', { '--x0': '-6%', '--x1': '106%', '--y': top + '%', zIndex: 1 }, 7) },   // บินผ่านหน้าต่าง
    () => { flicker.value = Math.floor(R(0, 2)); setTimeout(() => { flicker.value = -1 }, 2200) },
  ],
  forest: [
    () => walker('cat', 99, 14),
    () => { add('air', 'bird', { '--x0': '106%', '--x1': '-6%', '--y': R(4, 20) + '%', zIndex: 1 }, 6, { transform: 'scaleX(-1)' }) },
    () => { add('flutter', 'butterfly', { '--x0': R(10, 40) + '%', '--x1': R(60, 95) + '%', '--y': R(55, 85) + '%', zIndex: 999 }, 10) },
    () => { const tx = [15, 77, 143][Math.floor(R(0, 3))]; for (let i = 0; i < 4; i++) setTimeout(() => add('leaf', 'leaf', { '--x': pct(tx + R(-10, 10)), '--y0': R(10, 24) + '%', '--y1': R(50, 70) + '%' }, R(4, 6)), i * 600) },
  ],
}
function schedule() {
  clearTimeout(evTimer)
  evTimer = setTimeout(() => { const list = EVENTS[props.zone] || []; if (list.length && !document.hidden) list[Math.floor(Math.random() * list.length)](); schedule() }, R(45, 80) * 1000)
}
// ลองดูทันที: แตะป้ายชื่อห้อง 2 ครั้ง (FocusView เรียก) — ไว้ทดสอบ
function trigger() { const list = EVENTS[props.zone] || []; if (list.length) list[Math.floor(Math.random() * list.length)]() }
defineExpose({ trigger })

watch(() => props.zone, () => { events.value = []; flicker.value = -1; resetCats() }, { immediate: true })
onMounted(() => { schedule(); clock = setInterval(() => { hour.value = new Date().getHours() }, 60000) })
onBeforeUnmount(() => { clearTimeout(evTimer); clearInterval(clock); catTimers.forEach(clearTimeout) })
</script>

<style scoped>
.sfx { position: absolute; inset: 0; pointer-events: none; }   /* ไม่มี z-index = ลูกๆ แทรกชั้นกับคน/เคาน์เตอร์ตามตำแหน่งเท้าได้ */
.sfx > * { position: absolute; }
.star { width: 1.2%; aspect-ratio: 1; background: #fff8d6; border-radius: 1px; box-shadow: 0 0 3px #fff; animation: twinkle 3.5s ease-in-out infinite; z-index: 2; }
@keyframes twinkle { 50% { opacity: .25; } }
.lamp.big { width: 60%; opacity: .85; }
.lamp { width: 30%; aspect-ratio: 1; transform: translate(-50%, -50%); border-radius: 50%; background: radial-gradient(circle, rgba(255, 210, 130, .55), rgba(255, 210, 130, 0) 68%); mix-blend-mode: screen; z-index: 2; }
.lamp.flick { animation: flick 2.2s steps(1) 1; }
@keyframes flick { 10%, 30%, 55% { opacity: .1; } 20%, 40%, 70% { opacity: 1; } }
.fly { width: 1.2%; aspect-ratio: 1; border-radius: 50%; background: #eaff8f; box-shadow: 0 0 6px 2px rgba(220, 255, 120, .8); animation: firefly 6s ease-in-out infinite; z-index: 1500; }
@keyframes firefly { 0%, 100% { transform: translate(0, 0); opacity: .2; } 25% { transform: translate(8px, -6px); opacity: 1; } 50% { transform: translate(-4px, -12px); opacity: .5; } 75% { transform: translate(-9px, -3px); opacity: 1; } }
.steam { width: 2.5%; aspect-ratio: 1; border-radius: 50%; background: rgba(255, 255, 255, .7); animation: steam 3.6s ease-out infinite; opacity: 0; }
@keyframes steam { 0% { transform: translate(0, 0) scale(.6); opacity: 0; } 20% { opacity: .8; } 100% { transform: translate(-6px, -22px) scale(1.8); opacity: 0; } }
.dust { width: .8%; aspect-ratio: 1; border-radius: 50%; background: rgba(255, 250, 220, .9); animation: dust 7s ease-in-out infinite; }
@keyframes dust { 0%, 100% { transform: translate(0, 0); opacity: 0; } 30% { opacity: .9; } 50% { transform: translate(5px, 8px); } 80% { opacity: .6; } }

/* แมวประจำห้อง */
.res { transform: translate(-50%, -100%); transition-property: left, top; transition-timing-function: linear; }
.spr.cat_loaf { animation: breathe 3.2s linear infinite; }
@keyframes breathe { 0%, 49.9% { background-position: 0 0; } 50%, 100% { background-position: 100% 0; } }
.spr.cat_sit { animation: blink 4.5s linear infinite; }
@keyframes blink { 0%, 93.9% { background-position: 0 0; } 94%, 100% { background-position: 100% 0; } }
/* 💗 ลูบแมว */
.pet-btn { position: absolute; left: 50%; bottom: 100%; margin-bottom: 6px; transform: translateX(-50%); pointer-events: auto; width: 30px; height: 30px; border: 0; border-radius: 50%; background: #fff; box-shadow: var(--pop); font-size: .95rem; line-height: 1; cursor: pointer; display: grid; place-items: center; animation: pet-bob 1.4s ease-in-out infinite; }
@keyframes pet-bob { 50% { transform: translateX(-50%) translateY(-3px); } }
.heart { position: absolute; left: 50%; bottom: 100%; margin-bottom: 30px; white-space: nowrap; font-weight: 800; font-size: .8rem; color: #e11d74; text-shadow: 0 1px 0 #fff, 0 -1px 0 #fff, 1px 0 0 #fff, -1px 0 0 #fff; pointer-events: none; animation: heart-up 1.4s ease-out forwards; }
@keyframes heart-up { 0% { transform: translate(calc(-50% + var(--dx)), 6px) scale(.6); opacity: 0; } 20% { transform: translate(calc(-50% + var(--dx)), 0) scale(1.15); opacity: 1; } 100% { transform: translate(calc(-50% + var(--dx)), -22px) scale(1); opacity: 0; } }
/* events */
.ev { animation-timing-function: linear; animation-fill-mode: forwards; }
.spr { display: block; image-rendering: pixelated; background-repeat: no-repeat; background-position: 0 0; }
.spr.f2 { animation: f2 .32s linear infinite; }
@keyframes f2 { 0%, 49.9% { background-position: 0 0; } 50%, 100% { background-position: 100% 0; } }
.walk { top: var(--y); transform: translateY(-100%); animation-name: walk; }
.walk.rtl .spr { transform: scaleX(-1); }
@keyframes walk { from { left: var(--x0); } to { left: var(--x1); } }
.air { top: var(--y); animation-name: walk; }
.fall { left: var(--x); animation-name: fall; animation-timing-function: ease-in; }
@keyframes fall { 0% { top: var(--y0); transform: rotate(0); opacity: 1; } 40% { top: var(--y1); transform: rotate(90deg); opacity: 1; } 85% { top: var(--y1); transform: rotate(90deg); opacity: 1; } 100% { top: var(--y1); transform: rotate(90deg); opacity: 0; } }
.flutter { top: var(--y); animation-name: flutter; animation-timing-function: ease-in-out; }
@keyframes flutter { 0% { left: var(--x0); transform: translateY(0); opacity: 0; } 10% { opacity: 1; } 30% { transform: translateY(-14px); } 50% { transform: translateY(4px); } 70% { transform: translateY(-10px); } 90% { opacity: 1; } 100% { left: var(--x1); transform: translateY(0); opacity: 0; } }
.leaf { left: var(--x); animation-name: leaf; animation-timing-function: ease-in-out; z-index: 1600; }
@keyframes leaf { 0% { top: var(--y0); transform: translateX(0) rotate(0); opacity: 0; } 10% { opacity: 1; } 35% { transform: translateX(8px) rotate(60deg); } 65% { transform: translateX(-6px) rotate(-30deg); } 90% { opacity: 1; } 100% { top: var(--y1); transform: translateX(4px) rotate(120deg); opacity: 0; } }
</style>
