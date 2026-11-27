<!-- 🎬 รีเพลย์หมัดปิดฉากสนามมวย (27 พ.ย. 2026) — เปิดจากกระดานผล · เริ่มที่ซูมเข้าตอนง้างหมัด (ไม่มี QTE)
     เล่นการชาร์จตาม k ที่บันทึก (ค้างนานเท่าเดิม ปล่อยตรงค่าเดิม) → พุ่งชก → กระเด็นด้วย seed เดิม = ทางเดียวกับของจริงเป๊ะ
     row = แถวกระดาน { w, l, ws, k, d:{ w, l } } -->
<template>
  <div class="rr">
    <div class="rr-scene" :class="{ shake: shaking }">
      <div class="rr-world" :style="{ transformOrigin: `${cam.x / 1.6}% ${cam.y}%`, transform: `scale(${cam.z})` }">
        <img class="rr-bg" :src="BG" alt="" draggable="false">
        <div v-for="s in ['w', 'l']" :key="s" class="rr-ent" :style="{ left: ent[s].x / 1.6 + '%', top: ent[s].y + '%', zIndex: Math.round(ent[s].y) }">
          <span class="rr-nm" :class="s">{{ s === 'w' ? row.w : row.l }}</span>
          <span v-if="ent[s].e" class="rr-e"><Emoji :char="ent[s].e" /></span>
          <div class="rr-doll" :class="{ white: ent[s].white }" :style="{ transform: `rotate(${ent[s].rot}rad)`, '--pw': ent[s].pw }">
            <DollFigure :eq="eqs[s]" :scale="1" :aura="false" :label="s === 'w' ? row.w : row.l" />
          </div>
        </div>
        <span v-for="f in fx" :key="f.id" :class="['rr-fx', f.k]" :style="{ left: f.x / 1.6 + '%', top: f.y + '%', ...(f.st || {}) }"><Emoji v-if="f.e" :char="f.e" />{{ f.t }}</span>
      </div>
      <div class="rr-tag">▶ รีเพลย์</div>
      <div v-if="banner" class="rr-banner">{{ banner }}</div>
    </div>
    <div class="rr-row">
      <span>{{ row.w }} ชนะ {{ row.l }}{{ row.s ? ' ' + row.s : '' }}</span>
      <button type="button" class="rr-btn" :disabled="playing" @click="play">ดูอีกครั้ง</button>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted, onBeforeUnmount } from 'vue'
import Emoji from '../shared/Emoji.vue'
import DollFigure from '../doll/DollFigure.vue'
import BG from '../../assets/focus/bg_ring.png'
import { CORNER } from '../../utils/ringMatch.js'
import { launch, step, STEP, arrowAt, powerOf, ARROW_SPD } from '../../utils/ringKnock.js'
import { decodeDoll } from '../../utils/dollCode.js'
import { dollOf } from '../../utils/doll.js'
import { sfx } from '../../utils/sfx.js'

const props = defineProps({ row: { type: Object, required: true } })
const DEF = dollOf({}).eq
const eqs = computed(() => ({ w: decodeDoll(props.row.d?.w || '') || DEF, l: decodeDoll(props.row.d?.l || '') || DEF }))
const ws = computed(() => (props.row.ws === 'b' ? 'b' : 'r'))
const ls = computed(() => (ws.value === 'r' ? 'b' : 'r'))
const ent = reactive({ w: {}, l: {} })
const cam = reactive({ z: 1, x: 80, y: 60 })
const fx = ref([]); let fid = 0
const banner = ref(''), shaking = ref(false), playing = ref(false)
let alive = true
const sleep = (ms) => new Promise(r => setTimeout(r, ms))
const frame = () => new Promise(r => requestAnimationFrame(r))
function addFx(k, x, y, o = {}, ms = 700) { const id = ++fid; fx.value.push({ id, k, x, y, ...o }); setTimeout(() => { fx.value = fx.value.filter(f => f.id !== id) }, ms) }
function doShake() { shaking.value = false; requestAnimationFrame(() => { shaking.value = true; setTimeout(() => { shaking.value = false }, 350) }) }
async function tweenCam(z, x, y, ms = 300) {
  const a = { ...cam }, t0 = performance.now()
  for (;;) { const e = Math.min(1, (performance.now() - t0) / ms), q = 1 - (1 - e) ** 3; cam.z = a.z + (z - a.z) * q; cam.x = a.x + (x - a.x) * q; cam.y = a.y + (y - a.y) * q; if (e >= 1 || !alive) return; await frame() }
}
function reset() {
  const [wx, wy] = CORNER[ws.value], [lx, ly] = CORNER[ls.value]
  Object.assign(ent.w, { x: wx, y: wy, rot: 0, pw: 0, e: '', white: false })
  Object.assign(ent.l, { x: lx, y: ly, rot: 0, pw: 0, e: '', white: false })
  cam.z = 1; cam.x = 80; cam.y = 60; fx.value = []; banner.value = ''
}

async function play() {
  if (playing.value) return
  playing.value = true; reset()
  const k = props.row.k, dir = ls.value === 'b' ? 1 : -1
  const [wx, wy] = CORNER[ws.value], [lx, ly] = CORNER[ls.value]
  await sleep(250)
  await tweenCam(2, (wx + lx) / 2, wy - 16, 400)
  // ง้างหมัด: ค้างนานเท่าที่บันทึก ลูกศร (มองไม่เห็น) วิ่งด้วยความเร็วเดิม → ปล่อยตรงค่า s เดิม
  const hold = k && k.s >= 0 ? Math.min(GAUGE_CAP, k.hold || 800) : 900
  let pull = 0, ph = 0, last = performance.now(); const t0 = last
  await sleep(350)
  while (alive && performance.now() - t0 < hold) {
    const now = performance.now(), dt = Math.min(.05, (now - last) / 1000); last = now
    ph += dt * (k?.spd || ARROW_SPD); const s = k && k.s >= 0 ? arrowAt(ph) : 0
    pull += ((k && k.s >= 0 ? .4 + .6 * s : .3) - pull) * Math.min(1, dt * 14)
    Object.assign(ent.w, { x: wx - dir * pull * 6 + (Math.random() - .5) * .8 * s, rot: -dir * pull * .25, pw: s })
    await frame()
  }
  if (!alive) return
  // พุ่งชก
  const p = powerOf(k), xHit = lx - dir * 13
  ent.w.pw = 0; sfx('tap')
  for (let i = 1; i <= 7; i++) { const e = (i / 7) ** 2; ent.w.x = wx + (xHit - wx) * e; ent.w.rot = dir * .1; addFx('line', ent.w.x - dir * 4, wy - 10 - Math.random() * 14, { st: { '--d': dir } }, 200); await sleep(16) }
  addFx('boom', lx - dir * 3, ly - 22, { e: '💥' }, 400)
  addFx('fist', lx - dir * 7, ly - 20, { e: dir > 0 ? '🤜' : '🤛' }, 300)
  ent.l.white = true; doShake(); sfx('hit_fist', { w: 1, crit: p > .5 }); sfx('boom')
  addFx('pow', lx, ly - 30, { t: p > .9 ? 'K.O.!!!' : 'K.O.!' }, 900)
  tweenCam(1, 80, 60, 260)
  await sleep(p > .5 ? 160 : 80)
  ent.l.white = false; ent.w.rot = 0
  slideBack(xHit, wx)
  if (p < 0) { ent.l.rot = dir * Math.PI / 2 }
  else {
    const b = launch(k, lx, ly, dir); let acc = 0; last = performance.now()
    while (alive && !b.done) {
      const now = performance.now(); acc += Math.min(.05, (now - last) / 1000); last = now
      while (acc >= STEP && !b.done) { acc -= STEP; step(b); if (b.ev && b.ev !== 'land') { doShake(); sfx('hit_fist', { w: .5 }); if (b.ev === 'wall' || b.ev === 'ceil') addFx('pow sm', Math.max(16, Math.min(144, b.x)), Math.max(18, b.y), { t: b.ev === 'ceil' ? 'ชนเพดาน!' : 'โป๊ง!' }, 700); if (b.ev === 'rope') addFx('pow sm', b.x, b.y - 20, { t: 'เด้งเชือก!' }, 700) } }
      Object.assign(ent.l, { x: b.x, y: b.y, rot: b.rot })
      await frame()
    }
  }
  ent.l.e = '💫'; ent.w.e = '🏆'
  banner.value = `🏆 ${props.row.w} ชนะ!`
  await sleep(1600)
  playing.value = false
}
const GAUGE_CAP = 5000
async function slideBack(from, to) { await sleep(500); for (let i = 0; i < 40 && alive; i++) { ent.w.x += (to - ent.w.x) * .15; await frame() } ent.w.x = to }
onMounted(() => { reset(); play() })
onBeforeUnmount(() => { alive = false })
</script>

<style scoped>
.rr { display: grid; gap: 8px; }
.rr-scene { container-type: inline-size; position: relative; width: 100%; aspect-ratio: 160 / 100; border-radius: 12px; overflow: hidden; background: #222; }
.rr-scene.shake { animation: rr-shake .32s; }
@keyframes rr-shake { 25% { transform: translate(-1.5%, .8%); } 50% { transform: translate(1.2%, -.8%); } 75% { transform: translate(-.6%, .4%); } }
.rr-world { position: absolute; inset: 0; }
.rr-bg { position: absolute; inset: 0; width: 100%; height: 100%; image-rendering: pixelated; }
.rr-ent { position: absolute; transform: translate(-50%, -100%); display: flex; flex-direction: column; align-items: center; pointer-events: none; }
.rr-nm { font-size: .7rem; font-weight: 700; color: #fff; background: rgba(42,34,56,.82); border-radius: 99px; padding: 0 6px; white-space: nowrap; margin-bottom: 2px; }
.rr-nm.w { color: #ffd6dc; } .rr-nm.l { color: #d6e2ff; }
.rr-e { font-size: 1.2rem; line-height: 1; }
.rr-doll { transform-origin: 50% 100%; filter: drop-shadow(0 0 calc(var(--pw, 0) * 7px) rgba(255, 90, 60, calc(var(--pw, 0) + .001))); }
.rr-doll.white { filter: brightness(0) invert(1); }
.rr-fx { position: absolute; transform: translate(-50%, -50%); pointer-events: none; z-index: 200; }
.rr-fx.boom { font-size: 9cqw; animation: rr-pop .4s ease-out forwards; }
.rr-fx.fist { font-size: 6cqw; }
.rr-fx.line { width: 6cqw; height: 2px; background: rgba(255,255,255,.75); border-radius: 2px; }
.rr-fx.pow { font-size: max(.9rem, 5cqw); font-weight: 900; color: #ffd93d; -webkit-text-stroke: 1.5px #2a2238; animation: rr-pop .9s ease-out forwards; white-space: nowrap; }
.rr-fx.pow.sm { font-size: max(.75rem, 3.4cqw); color: #ff9f43; }
@keyframes rr-pop { 0% { transform: translate(-50%, -50%) scale(.4); } 25% { transform: translate(-50%, -50%) scale(1.2); } 100% { transform: translate(-50%, -80%) scale(1); opacity: 0; } }
.rr-tag { position: absolute; left: 8px; top: 8px; font-size: .7rem; font-weight: 700; color: #fff; background: rgba(214,40,60,.92); border-radius: 99px; padding: 1px 8px; }
.rr-banner { position: absolute; left: 0; right: 0; top: 10%; text-align: center; font-weight: 800; font-size: max(.9rem, 5cqw); color: #fff; text-shadow: 0 2px 0 #2a2238, 0 0 8px rgba(0,0,0,.5); }
.rr-row { display: flex; align-items: center; justify-content: space-between; gap: 8px; font-size: .8rem; }
.rr-btn { font: inherit; font-weight: 700; border: 0; border-radius: 99px; background: var(--primary); color: #fff; padding: 5px 12px; cursor: pointer; }
.rr-btn:disabled { opacity: .5; }
</style>
