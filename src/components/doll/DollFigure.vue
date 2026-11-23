<!-- 🧍 ตุ๊กตา avatar — วาดลง canvas แบบพิกเซลคม · ขยายเป็นจำนวนเต็มเท่าเท่านั้น (18 พ.ย. 2026)
     props: eq = { s, c, h, e, m, t, b, k, o, x, a, i, w } · scale = 1,2,3… -->
<template>
  <span class="dollw" :class="{ 'au-glow': glows.length }" :style="wrapStyle">
  <canvas
    ref="cv" class="doll" :width="size.w * k" :height="size.h * k"
    :style="{ width: size.w * k / dpr + 'px', height: size.h * k / dpr + 'px' }"
    :aria-label="label" role="img"
  ></canvas>
  <i v-if="glows.length" class="au-halo" :style="{ '--au': glows[0] }"></i>
  <i v-for="(f, i) in layers.floors" :key="'f' + i" class="au-floor" :style="{ '--au': f }"></i>
  <template v-for="(r, i) in layers.rings" :key="'r' + i">
    <i v-for="j in 2" :key="j" class="au-ring" :style="{ '--au': r, animationDelay: i * 0.8 + (j - 1) * 1.3 + 's', bottom: 'calc(var(--px) * ' + (3 + i * 2) + ')' }"></i>
  </template>
  <i v-for="(p, i) in layers.particles" :key="i" :class="'pt pt-' + p.type" :style="{ left: p.left + '%', top: p.top + '%', '--au': p.color, '--dx': 'calc(var(--px) * ' + p.dx + ')', animationDelay: p.delay + 's' }"></i>
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
  glowOnly: { type: Boolean, default: false },   // เหลือแค่แสงเรืองรอบตัว ไม่มีอนุภาค/วงใต้เท้า (การ์ดเพื่อนครึ่งตัว — กันเอฟเฟคล้น · 20 พ.ย.)
})
const cv = ref(null)
const s = computed(() => Math.max(1, props.scale))   // รับเศษได้ (โหมดโฟกัสใช้ 1.5) — k ด้านล่างปัดเป็นจุดจอเต็มจำนวนอยู่แล้ว ภาพคมเสมอ
// จอสเกลเศษ (Windows 125% · มือถือ DPR 2.75) → 1 พิกเซลตุ๊กตา = จุดจอไม่เต็มจำนวน → บางช่องกว้างกว่าช่องอื่น ซ้ายขวาไม่เท่ากัน
// แก้: วาดเป็น "จุดจอจริง" จำนวนเต็มต่อพิกเซล (k) แล้วย่อ CSS กลับด้วย dpr — ขนาดคลาดจาก scale ได้นิดหน่อย แต่ทุกช่องเท่ากันเป๊ะ (19 พ.ย. 2026)
const dpr = ref(typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1)
const k = computed(() => Math.max(1, Math.round(s.value * dpr.value)))
const px = computed(() => k.value / dpr.value)   // 1 พิกเซลตุ๊กตา = กี่ px CSS (ขนาดประกายตามตัว)
const out = computed(() => render(props.eq))
const size = computed(() => ({ w: out.value.w, h: out.value.h }))
// ✨ ออร่า 8 แบบ หลายอันพร้อมกันได้ (utils/dollAura.js) — glow รวมเป็น drop-shadow ต่อกัน · ring = วงใต้เท้า · ที่เหลือเป็นอนุภาค CSS
const auras = computed(() => (props.aura ? aurasOf(props.eq) : []))
const layers = computed(() => { const L = auraLayers(auras.value); return props.glowOnly ? { ...L, rings: [], floors: [], particles: [] } : L })
const glows = computed(() => layers.value.glows)
const shadow = (m) => glows.value.map(c => `drop-shadow(0 0 calc(var(--px) * ${m}) ${c})`).join(' ')
// ขอบพิกเซลสีคมรอบตัว (drop-shadow ไม่เบลอ 4 ทิศ) — ชุดเรืองดูมีขอบแสงชัด (22 พ.ย.)
const rim = c => ['1,0,cc', '-1,0,cc', '0,1,99', '0,-1,cc'].map(v => { const [x, y, a] = v.split(','); return `drop-shadow(calc(var(--px) * ${x}) calc(var(--px) * ${y}) 0 ${c}${a})` }).join(' ')
const wrapStyle = computed(() => (auras.value.length
  ? { '--px': px.value + 'px', ...(glows.value.length ? { '--rim': rim(glows.value[0]), '--gl1': shadow(props.glowOnly ? .6 : 1.2), '--gl3': shadow(props.glowOnly ? 1.5 : 4) } : {}) }
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
.doll { image-rendering: pixelated; image-rendering: crisp-edges; display: block; position: relative; }  /* relative = อยู่เหนือ .au-halo ที่วางก่อนหน้า */
.dollw { position: relative; display: inline-block; line-height: 0; }
/* อนุภาคออร่า (utils/dollAura.js) — พิกเซลวาดด้วย box-shadow/gradient ขนาดตาม --px (1 พิกเซลตุ๊กตา)
   22 พ.ย. ยกเครื่อง: ไฮไลต์ขาว (--hi) + เรืองนุ่ม · ดาวสี่แฉก · เปลว 3 สี+ถ่าน · วง 2 ชั้น+ลำแสง · ขอบเรืองคม */
.pt { position: absolute; width: var(--px); height: var(--px); pointer-events: none; opacity: 0; }
/* ทุกอนุภาค: สีหลัก + จุดไฮไลต์ขาว (--hi) + เงาเรืองนุ่มๆ = ดูมีแสงในตัว ยังเป็นพิกเซลคม */
.dollw{--hi:#FFFFFF}
/* ✦ ประกายสี่แฉก 5x5 แกนขาว แขนสี หมุนป๊อป */
.pt-sparkle,.pt-shimmer{width:calc(var(--px)*5);height:calc(var(--px)*5);margin:calc(var(--px)*-2.5) 0 0 calc(var(--px)*-2.5);
 background:linear-gradient(var(--hi),var(--hi)) center/var(--px) var(--px) no-repeat,linear-gradient(var(--au),var(--au)) center/var(--px) 100% no-repeat,linear-gradient(var(--au),var(--au)) center/100% var(--px) no-repeat,linear-gradient(var(--au),var(--au)) center/calc(var(--px)*3) calc(var(--px)*3) no-repeat;
 -webkit-mask:linear-gradient(#000,#000) center/var(--px) 100% no-repeat,linear-gradient(#000,#000) center/100% var(--px) no-repeat,linear-gradient(#000,#000) center/calc(var(--px)*3) var(--px) no-repeat,linear-gradient(#000,#000) center/var(--px) calc(var(--px)*3) no-repeat;
 filter:drop-shadow(0 0 calc(var(--px)*1.5) var(--au)) drop-shadow(0 0 calc(var(--px)*.5) var(--hi));animation:dollSpk 2.6s cubic-bezier(.3,1.6,.5,1) infinite}
.pt-shimmer{animation:dollShim 3.6s ease-in-out infinite;filter:drop-shadow(0 0 var(--px) var(--au))}
@keyframes dollSpk{0%,100%{opacity:0;transform:scale(.2) rotate(-45deg)}30%{opacity:1;transform:scale(1.15) rotate(0)}55%{transform:scale(.9)}75%{opacity:.6;transform:scale(1) rotate(10deg)}}
@keyframes dollShim{0%,24%,100%{opacity:0;transform:scale(.2) rotate(-30deg)}8%{opacity:1;transform:scale(1.2) rotate(0)}16%{opacity:.8;transform:scale(.8)}}
/* 💗 หัวใจ + จุดไฮไลต์ขาว · ลอยส่ายซ้ายขวา ป๊อปตอนเกิด */
.pt-hearts{box-shadow:calc(var(--px)*1) 0 var(--hi),calc(var(--px)*3) 0 var(--au),0 var(--px) var(--au),calc(var(--px)*1) var(--px) var(--au),calc(var(--px)*2) var(--px) var(--au),calc(var(--px)*3) var(--px) var(--au),calc(var(--px)*4) var(--px) var(--au),calc(var(--px)*1) calc(var(--px)*2) var(--au),calc(var(--px)*2) calc(var(--px)*2) var(--au),calc(var(--px)*3) calc(var(--px)*2) var(--au),calc(var(--px)*2) calc(var(--px)*3) var(--au);
 filter:drop-shadow(0 0 var(--px) var(--au));animation:dollHeart 3.6s ease-out infinite}
@keyframes dollHeart{0%{opacity:0;transform:translate(0,0) scale(.3)}12%{opacity:1;transform:translate(0,calc(var(--px)*-1)) scale(1.2)}20%{transform:translate(0,calc(var(--px)*-2)) scale(1)}45%{transform:translate(calc(var(--px)*2),calc(var(--px)*-7))}70%{opacity:.9;transform:translate(calc(var(--px)*-2),calc(var(--px)*-12))}100%{opacity:0;transform:translate(var(--px),calc(var(--px)*-18)) scale(.8)}}
/* 🫧 ฟอง + เงาสะท้อน · ใหญ่ขึ้นนิดๆ ระหว่างลอย แตกป๊อปตอนจบ */
.pt-bubbles{width:calc(var(--px)*4);height:calc(var(--px)*4);border:var(--px) solid var(--au);border-radius:50%;background:radial-gradient(circle at 30% 30%,var(--hi) 0 18%,transparent 20%),color-mix(in srgb,var(--au) 18%,transparent);filter:drop-shadow(0 0 var(--px) var(--au));animation:dollBubble 4s ease-in-out infinite}
@keyframes dollBubble{0%{opacity:0;transform:translate(0,0) scale(.4)}15%{opacity:1}35%{transform:translate(calc(var(--px)*1.5),calc(var(--px)*-6)) scale(.8)}65%{transform:translate(calc(var(--px)*-1.5),calc(var(--px)*-12)) scale(1)}88%{opacity:1;transform:translate(0,calc(var(--px)*-17)) scale(1.05)}100%{opacity:0;transform:translate(0,calc(var(--px)*-18)) scale(1.8)}}
/* 🌸 กลีบสองโทน ร่วงเป็นเส้นโค้ง S */
.pt-petals{width:calc(var(--px)*2);height:var(--px);background:var(--au);box-shadow:var(--px) var(--px) color-mix(in srgb,var(--au) 70%,#C07090),0 0 0 0 transparent;filter:drop-shadow(0 0 calc(var(--px)*.6) var(--au));animation:dollPetal 4.6s linear infinite}
@keyframes dollPetal{0%{opacity:0;transform:translate(0,0) rotate(0)}10%{opacity:1}30%{transform:translate(calc(var(--px)*6),calc(var(--px)*9)) rotate(120deg)}55%{transform:translate(calc(var(--px)*-1),calc(var(--px)*17)) rotate(220deg)}80%{opacity:1;transform:translate(calc(var(--px)*7),calc(var(--px)*25)) rotate(320deg)}100%{opacity:0;transform:translate(calc(var(--px)*4),calc(var(--px)*32)) rotate(400deg)}}
/* 🌟 ละอองดาว: จุดลอย + ตอนสว่างสุดกลายเป็นกากบาท + หางจางๆ */
.pt-stardust{background:var(--hi);box-shadow:0 0 0 var(--px) color-mix(in srgb,var(--au) 55%,transparent),0 var(--px) 0 0 var(--au),0 calc(var(--px)*2) 0 0 color-mix(in srgb,var(--au) 40%,transparent);filter:drop-shadow(0 0 var(--px) var(--au));animation:dollDust 3s ease-out infinite}
@keyframes dollDust{0%,100%{opacity:0;transform:translateY(0) scale(.5)}35%{opacity:1;transform:translateY(calc(var(--px)*-4)) scale(1.2)}50%{opacity:.6}65%{opacity:1}90%{opacity:0;transform:translateY(calc(var(--px)*-12)) scale(.8)}}
/* 🔥 เปลว 3 สี (แกนขาวเหลือง → สี → ปลายแดง) + ประกายถ่านลอยสูง */
.pt-flame{width:calc(var(--px)*2);height:calc(var(--px)*3);background:linear-gradient(#E5533D 0 33%,var(--au) 33% 70%,#FFF1B8 70%);filter:drop-shadow(0 0 calc(var(--px)*1.5) var(--au));animation:dollFlame 1s ease-out infinite;transform-origin:bottom}
@keyframes dollFlame{0%{opacity:0;transform:translateY(0) scale(1.2,.6)}25%{opacity:1;transform:translateY(calc(var(--px)*-1)) scale(1,1.2)}100%{opacity:0;transform:translateY(calc(var(--px)*-8)) scale(.4,.8)}}
.pt-ember{background:#FFE08A;box-shadow:0 0 0 0 transparent;filter:drop-shadow(0 0 var(--px) #F6A04D);animation:dollEmber 2.4s ease-out infinite}
@keyframes dollEmber{0%{opacity:0;transform:translate(0,0)}15%{opacity:1}50%{transform:translate(calc(var(--px)*2),calc(var(--px)*-12))}100%{opacity:0;transform:translate(calc(var(--px)*-1),calc(var(--px)*-24))}}
/* แสงพื้นใต้เท้า (เปลวไฟ/วงแสง) — วงรีนุ่ม หายใจ */
.au-floor{position:absolute;left:50%;top:91%;width:60%;height:calc(var(--px)*6);margin:calc(var(--px)*-3) 0 0 -30%;border-radius:50%;background:radial-gradient(closest-side,color-mix(in srgb,var(--au) 70%,transparent),transparent);pointer-events:none;animation:dollFloor 2.4s ease-in-out infinite}
@keyframes dollFloor{0%,100%{opacity:.55;transform:scaleX(.9)}50%{opacity:1;transform:scaleX(1.05)}}
/* ⭕ วงแสง 2 ชั้นสลับจังหวะ + ลำแสงพุ่งขึ้นจากวง */
.au-ring{position:absolute;left:50%;width:50%;height:calc(var(--px)*5);margin-left:-25%;border:var(--px) solid var(--au);border-radius:50%;box-shadow:0 0 calc(var(--px)*2) var(--au),inset 0 0 calc(var(--px)*2) var(--au);pointer-events:none;animation:dollRing 2.6s cubic-bezier(.2,.7,.3,1) infinite}
@keyframes dollRing{0%{opacity:0;transform:scale(.3)}15%{opacity:1}100%{opacity:0;transform:scale(1.35)}}
.pt-pillar{width:var(--px);height:calc(var(--px)*5);background:linear-gradient(transparent,var(--au) 60%,var(--hi));filter:drop-shadow(0 0 var(--px) var(--au));animation:dollPillar 2.2s ease-out infinite}
@keyframes dollPillar{0%{opacity:0;transform:translateY(0) scaleY(.4)}25%{opacity:1;transform:translateY(calc(var(--px)*-4)) scaleY(1)}100%{opacity:0;transform:translateY(calc(var(--px)*-20)) scaleY(.6)}}
/* 🌟 เรือง: ขอบพิกเซลสีชัดรอบตัว + หายใจเรือง + ละอองสีลอยออกจากตัว */
.au-glow .doll{filter:var(--rim) var(--gl1)}
/* 22 พ.ย. แลค: เดิมหายใจด้วยการ animate filter (วาดใหม่ทุกเฟรม × คนหลายสิบในห้องโฟกัส) → ขอบ+เรืองนิ่ง แล้วให้วงแสงด้านหลังหายใจด้วย opacity/transform แทน (การ์ดจอทำให้ ไม่วาดใหม่) */
.au-halo{position:absolute;left:18%;right:18%;top:12%;bottom:6%;border-radius:50%;background:radial-gradient(closest-side,color-mix(in srgb,var(--au) 70%,transparent),transparent);pointer-events:none;animation:dollHalo 2.8s ease-in-out infinite;will-change:opacity,transform}
@keyframes dollHalo{0%,100%{opacity:.35;transform:scale(.92)}50%{opacity:.85;transform:scale(1.06)}}
.pt-mote{background:var(--hi);box-shadow:0 0 0 var(--px) color-mix(in srgb,var(--au) 60%,transparent);animation:dollMote 3.4s ease-out infinite}
@keyframes dollMote{0%{opacity:0;transform:translate(0,0) scale(.5)}25%{opacity:1;transform:translate(0,calc(var(--px)*-3)) scale(1)}100%{opacity:0;transform:translate(var(--dx,0),calc(var(--px)*-16)) scale(.6)}}
/* 🦋 ผีเสื้อ: ปีก 2 ข้าง + ตัวเข้ม · กระพือ (scaleX) แล้วบินวนขึ้น */
.pt-butterfly{width:calc(var(--px)*5);height:calc(var(--px)*3);background:linear-gradient(#2B2940,#2B2940) center/var(--px) 100% no-repeat,radial-gradient(circle at 25% 40%,var(--hi) 0 12%,var(--au) 14% 48%,transparent 52%),radial-gradient(circle at 75% 40%,var(--hi) 0 12%,var(--au) 14% 48%,transparent 52%);filter:drop-shadow(0 0 var(--px) var(--au));animation:dollFlap .35s steps(2) infinite,dollFly 5.2s ease-in-out infinite}
@keyframes dollFlap{50%{transform:scaleX(.45)}}
@keyframes dollFly{0%{opacity:0;translate:0 0}12%{opacity:1}35%{translate:calc(var(--px)*4) calc(var(--px)*-6)}60%{translate:calc(var(--px)*-3) calc(var(--px)*-11)}85%{opacity:1;translate:calc(var(--px)*3) calc(var(--px)*-17)}100%{opacity:0;translate:0 calc(var(--px)*-20)}}
/* 🎵 โน้ต: หัวโน้ต 2x2 + ก้าน + ธง · ลอยส่ายขึ้น */
.pt-notes{width:calc(var(--px)*3);height:calc(var(--px)*5);background:linear-gradient(var(--au),var(--au)) 0 100%/calc(var(--px)*2) calc(var(--px)*2) no-repeat,linear-gradient(var(--au),var(--au)) calc(var(--px)*1) 0/var(--px) calc(var(--px)*4) no-repeat,linear-gradient(var(--au),var(--au)) 100% 0/var(--px) calc(var(--px)*2) no-repeat;filter:drop-shadow(0 0 var(--px) var(--au));animation:dollNote 3.6s ease-out infinite}
@keyframes dollNote{0%{opacity:0;transform:translate(0,0) rotate(-10deg)}15%{opacity:1}50%{transform:translate(calc(var(--px)*3),calc(var(--px)*-8)) rotate(10deg)}100%{opacity:0;transform:translate(calc(var(--px)*-1),calc(var(--px)*-16)) rotate(-8deg)}}
/* 🌫️ หมอก: ก้อนวงรีนุ่ม จางๆ ลอยเลื่อนข้างแล้วหาย */
.pt-mist{width:calc(var(--px)*12);height:calc(var(--px)*4);margin-left:calc(var(--px)*-6);border-radius:50%;background:radial-gradient(closest-side,color-mix(in srgb,var(--au) 75%,transparent),transparent);animation:dollMist 5s ease-in-out infinite}
@keyframes dollMist{0%{opacity:0;transform:translate(calc(var(--px)*-4),0) scale(.7)}30%{opacity:.85}70%{opacity:.65}100%{opacity:0;transform:translate(calc(var(--px)*5),calc(var(--px)*-5)) scale(1.2)}}
/* 🍎 แอปเปิ้ล 4x4: ลูกสี --au + ขั้วใบเขียว + ไฮไลต์ขาว · ลอยส่ายแบบหัวใจ */
.pt-apples{box-shadow:calc(var(--px)*2) 0 #6FBF5A,0 var(--px) var(--au),var(--px) var(--px) var(--hi),calc(var(--px)*2) var(--px) var(--au),calc(var(--px)*3) var(--px) var(--au),0 calc(var(--px)*2) var(--au),var(--px) calc(var(--px)*2) var(--au),calc(var(--px)*2) calc(var(--px)*2) var(--au),calc(var(--px)*3) calc(var(--px)*2) var(--au),var(--px) calc(var(--px)*3) var(--au),calc(var(--px)*2) calc(var(--px)*3) var(--au);filter:drop-shadow(0 0 var(--px) var(--au));animation:dollHeart 3.6s ease-out infinite}
/* 🌬️ ลม: เส้นจางยาว 6 พิกเซล พัดผ่านไปทางขวาแล้วหาย */
.pt-foxfire{width:calc(var(--px)*3);height:calc(var(--px)*4);margin:calc(var(--px)*-2) 0 0 calc(var(--px)*-1.5);border-radius:50% 50% 50% 50%/65% 65% 35% 35%;background:radial-gradient(circle at 50% 70%,var(--hi) 0 25%,var(--au) 45%,color-mix(in srgb,var(--au) 40%,transparent) 80%);filter:drop-shadow(0 0 calc(var(--px)*1.5) var(--au));animation:dollFox 3.2s ease-in-out infinite}
@keyframes dollFox{0%,100%{opacity:0;transform:translate(0,0) scale(.5)}20%{opacity:1;transform:translate(calc(var(--px)*1),calc(var(--px)*-2)) scale(1)}50%{opacity:.85;transform:translate(calc(var(--px)*-1),calc(var(--px)*-5)) scale(1.1,.9)}80%{opacity:1;transform:translate(calc(var(--px)*1),calc(var(--px)*-8)) scale(.9,1.1)}}
.pt-wind{width:calc(var(--px)*6);height:var(--px);background:linear-gradient(90deg,transparent,var(--au) 60%,var(--hi));animation:dollWind 2.2s ease-in infinite}
@keyframes dollWind{0%{opacity:0;transform:translateX(calc(var(--px)*-6))}25%{opacity:.9}100%{opacity:0;transform:translateX(calc(var(--px)*12))}}
</style>
