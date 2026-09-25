<!--
  <CapsuleReveal> — ฉากเปิดแคปซูล (user เลือกจากเดโม 25 ก.ย. 2026) ใช้ร่วม: อัญเชิญ (ShopView) + หลอม (LabTab)
    สุ่ม 1 : หมุนตู้ → แคปซูลตก → สั่นไต่สี ขาว→ฟ้า→ม่วง→ทอง (ยังไม่เฉลยจนแตก) → แตก → ผล
    สุ่ม 10: หมุนตู้ → แคปซูลร่วงลงถาด → เปิดทีละลูก · ตำนานเก็บไว้ท้ายสุด สั่นลุ้นแล้วแตกพร้อมพลุ
    แสงใบ้หลังตู้ (แบบ ข ที่ user เลือก): ทุกครั้งเริ่มแสงขาวจาง · ออกตำนาน = กลางทางกลายเป็นรุ้งจางๆ · เอพิค = ม่วงจาง
  🔒 อ่าน "ผลที่สุ่มเสร็จแล้ว" อย่างเดียว ไม่แตะตรรกะ/อัตราสุ่มเลย
  แตะจอ = ข้ามไปดูผลได้ทุกจังหวะ (ห้ามปิดทิ้ง — เหรียญหักไปแล้ว ต้องได้เห็นผลเสมอ)
  z-index 410: เปิดจากใน ShopView (400) — ดูบันได CLAUDE.md ข้อ 12
  ใช้: <CapsuleReveal v-if="x" :summary="[{emoji,name,rarity,isNew}]" :multi="n>1" @close="x=null" />
-->
<template>
  <Teleport to="body">
    <div class="cr-ov" role="dialog" aria-modal="true" aria-label="ผลการเปิดแคปซูล" @click="onTap">
      <div class="cr-stars" aria-hidden="true"></div>

      <!-- ── ตู้ (ทั้งสุ่ม 1 และ 10) ── -->
      <div v-if="phase === 'machine'" class="cr-stage">
        <div class="cr-halo" :class="halo" aria-hidden="true"></div>
        <span v-for="(sp, i) in sparkPos" v-show="halo.includes('rainbow')" :key="i" class="cr-spark"
          :style="{ left: sp.x + '%', top: sp.y + '%', animationDelay: sp.d + 's' }" aria-hidden="true"></span>
        <div class="cr-machine crank" aria-hidden="true">
          <div class="cr-dome">
            <span v-for="(c, i) in DOME" :key="i" class="cr-mcap" :style="{ '--c': c.c, left: c.x + '%', top: c.y + '%' }"></span>
          </div>
          <div class="cr-body"><div class="cr-knob"></div><div class="cr-chute"></div></div>
        </div>
      </div>

      <!-- ── สุ่ม 1: แคปซูล ── -->
      <div v-else-if="phase === 'capsule' || phase === 'burst'" class="cr-stage">
        <div class="cr-cap" :class="capClass" :style="{ '--cc': capColor }" aria-hidden="true">
          <div class="cr-glow"></div><div class="cr-top"></div><div class="cr-bot"></div><div class="cr-band"></div>
        </div>
      </div>

      <!-- ── สุ่ม 10: ถาดแคปซูล ── -->
      <div v-else-if="phase === 'tray' || (phase === 'show' && multi)" class="cr-stage cr-col" @click.stop="onTap">
        <div class="cr-tray-top">{{ label || `ได้ ${summary.length} แคปซูล` }}</div>
        <div class="cr-tray">
          <div v-for="(s, i) in summary" :key="i" class="cr-slot" :style="{ '--rc': rc(s.rarity) }">
            <div v-if="!opened[i]" class="cr-cap mini in" :class="{ shake: shaking === i }"
              :style="{ '--cc': shaking === i ? rc('legendary') : '#e5e7eb', animationDelay: i * 45 + 'ms' }" aria-hidden="true">
              <div class="cr-top"></div><div class="cr-bot"></div><div class="cr-band"></div>
            </div>
            <div v-else class="cr-card" :class="s.rarity">
              <span class="cr-card-e"><Emoji :char="s.emoji" /></span>
              <span class="cr-card-n">{{ s.name }}</span>
              <span class="cr-card-t">{{ s.isNew ? 'ใหม่' : '+1' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- ── สุ่ม 1: ผล ── -->
      <div v-if="phase === 'show' && !multi" class="cr-stage cr-col" :style="{ '--rc': rc(one.rarity) }" @click.stop>
        <div v-if="RANK[one.rarity] >= 2" class="cr-rays" aria-hidden="true"></div>
        <div class="cr-label">{{ label || 'คุณได้รับ!' }}</div>
        <div class="cr-pet"><Emoji :char="one.emoji" /></div>
        <div class="cr-nm">{{ one.name }}</div>
        <span class="cr-chip">{{ RARITY[one.rarity]?.label }}</span>
        <span class="cr-new">{{ one.isNew ? 'ใหม่!' : '+1 ตัวซ้ำ' }}</span>
      </div>

      <div v-if="flash" class="cr-flash" aria-hidden="true" @animationend="flash = false"></div>
      <div v-if="confetti" class="cr-confetti" aria-hidden="true">
        <i v-for="(c, i) in confetti" :key="i" :style="c"></i>
      </div>

      <button v-if="phase === 'show'" class="cr-ok" @click.stop="$emit('close')">เยี่ยม!</button>
      <div v-else class="cr-skip">{{ phase === 'tray' ? 'แตะเพื่อเปิดทั้งหมด' : 'แตะเพื่อข้าม' }}</div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import Emoji from '../shared/Emoji.vue'
import { RARITY } from '../../data/index.js'
import { sfx } from '../../utils/sfx.js'
import { prefersReducedMotion } from '../../utils/motionPref.js'
import { useEscapeKey } from '../../composables/useEscapeKey.js'

const props = defineProps({
  summary: { type: Array, required: true },     // [{ emoji, name, rarity, isNew }]
  multi: { type: Boolean, default: false },
  label: { type: String, default: '' },
})
const emit = defineEmits(['close'])

const RANK = { common: 0, rare: 1, epic: 2, legendary: 3 }
const TIERS = ['common', 'rare', 'epic', 'legendary']
const rc = (r) => RARITY[r]?.color || '#94a3b8'
const DOME = [
  { c: '#60a5fa', x: 6, y: 48 }, { c: '#c084fc', x: 30, y: 56 }, { c: '#94a3b8', x: 56, y: 46 }, { c: '#fbbf24', x: 78, y: 58 },
  { c: '#f28bb0', x: 18, y: 24 }, { c: '#60a5fa', x: 46, y: 18 }, { c: '#94a3b8', x: 68, y: 28 },
]

// จังหวะ (ms) — สุ่ม 1 ≈ 2.3 วิ · สุ่ม 10 ≈ 3 วิ (user ดูในเดโมแล้ว)
const T_DROP = 1150, T_WOBBLE = 1700, T_CLIMB_END = 2250, T_BURST = 2300, T_HINT = 620

const one = computed(() => props.summary[0] || {})
const best = computed(() => props.summary.reduce((b, s) => (RANK[s.rarity] > RANK[b] ? s.rarity : b), 'common'))

const phase = ref('machine')     // machine → capsule → burst → show  |  machine → tray → show
const halo = ref('')             // '' | 'on plain' | 'on epic' | 'on rainbow'
const climb = ref(0)
const capWobble = ref(false)
const flash = ref(false)
const confetti = ref(null)
const opened = ref(props.summary.map(() => false))
const shaking = ref(-1)

const capColor = computed(() => phase.value === 'burst' ? rc(one.value.rarity) : climb.value ? rc(TIERS[climb.value]) : '#e5e7eb')
const capClass = computed(() => {
  if (phase.value === 'burst') return 'burst'
  if (!capWobble.value) return 'drop'
  return ['wobble', climb.value ? 'w' + Math.min(3, climb.value) : ''].join(' ')
})
const sparkPos = Array.from({ length: 4 }, () => ({ x: 15 + Math.random() * 70, y: 10 + Math.random() * 70, d: Math.random() }))

const timers = []
const later = (ms, fn) => timers.push(setTimeout(fn, ms))
function clearT() { while (timers.length) clearTimeout(timers.pop()) }
onUnmounted(clearT)

function burstConfetti() {
  const cols = [rc('legendary'), '#fff', '#f28bb0', '#7cc8ef']
  confetti.value = Array.from({ length: 40 }, () => ({
    left: Math.random() * 100 + '%', background: cols[Math.floor(Math.random() * cols.length)],
    animationDelay: Math.random() * 0.5 + 's', animationDuration: 1.4 + Math.random() + 's',
  }))
}
function doFlash() { flash.value = false; requestAnimationFrame(() => { flash.value = true }) }

// ── สุ่ม 1 ──
function showOne() {
  if (phase.value === 'show') return
  clearT()
  phase.value = 'burst'
  doFlash()
  later(180, () => {
    phase.value = 'show'
    sfx('reveal_' + one.value.rarity)
    if (one.value.rarity === 'legendary') burstConfetti()
  })
}

// ── สุ่ม 10: เปิดทีละลูก (ตำนานไว้ท้ายสุด) ──
const order = props.summary.map((_, i) => i)
  .sort((a, b) => (props.summary[a].rarity === 'legendary') - (props.summary[b].rarity === 'legendary'))
let nextIdx = 0
function openNext() {
  if (phase.value !== 'tray') return
  if (nextIdx >= order.length) return finishTray()
  const i = order[nextIdx++]
  if (props.summary[i].rarity === 'legendary') {
    shaking.value = i
    sfx('climb')
    later(650, () => {
      shaking.value = -1
      opened.value[i] = true
      doFlash(); burstConfetti(); sfx('reveal_legendary')
      later(350, openNext)
    })
  } else {
    opened.value[i] = true
    sfx('tap')
    later(110, openNext)
  }
}
function finishTray() {
  clearT()
  shaking.value = -1
  opened.value = props.summary.map(() => true)
  if (phase.value !== 'show') {
    phase.value = 'show'
    if (best.value === 'legendary' && !confetti.value) burstConfetti()
    sfx('reveal_' + best.value)
  }
}

// แตะ = ข้าม: ตอนหมุนตู้/แคปซูล → ไปผลเลย · ตอนถาด → เปิดทั้งหมด · ตอนโชว์ผล → ไม่ทำอะไร (ต้องกดปุ่ม)
function onTap() {
  if (phase.value === 'show') return
  if (props.multi) { phase.value = 'tray'; finishTray() }
  else showOne()
}
useEscapeKey(() => true, () => { if (phase.value === 'show') emit('close'); else onTap() })

onMounted(() => {
  if (prefersReducedMotion()) {
    if (props.multi) finishTray(); else { phase.value = 'show'; sfx('reveal_' + one.value.rarity) }
    return
  }
  sfx('roll')
  // แสงใบ้หลังตู้ (แบบ ข): ขาวจางทุกครั้ง → ตำนานกลายเป็นรุ้ง · เอพิคเป็นม่วง
  later(60, () => { halo.value = 'on plain' })
  if (best.value === 'legendary') later(T_HINT, () => { halo.value = 'on rainbow' })
  else if (best.value === 'epic') later(T_HINT, () => { halo.value = 'on epic' })

  if (props.multi) {
    later(T_DROP, () => { phase.value = 'tray'; later(700, openNext) })
    return
  }
  later(T_DROP, () => { phase.value = 'capsule' })
  later(T_WOBBLE, () => { capWobble.value = true })
  const steps = RANK[one.value.rarity]
  for (let i = 1; i <= steps; i++) {
    later(T_WOBBLE + (T_CLIMB_END - T_WOBBLE) * i / (steps + 1), () => { climb.value = i; sfx('climb') })
  }
  later(T_BURST, showOne)
})
</script>

<style scoped>
.cr-ov { position: fixed; inset: 0; z-index: 410; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 16px;
  background: radial-gradient(circle at 50% 40%, #3b2a6e 0%, #1b1433 70%); color: #fff; overflow: hidden; overscroll-behavior: contain; cursor: pointer; }
.cr-stars { position: absolute; inset: 0; pointer-events: none;
  background-image: radial-gradient(1.5px 1.5px at 20% 30%, #fff8, transparent), radial-gradient(1.5px 1.5px at 70% 20%, #fff6, transparent),
    radial-gradient(2px 2px at 40% 80%, #fff5, transparent), radial-gradient(1.5px 1.5px at 85% 65%, #fff7, transparent), radial-gradient(1.5px 1.5px at 10% 70%, #fff6, transparent); }
.cr-stage { position: relative; width: 100%; min-height: 300px; display: flex; align-items: center; justify-content: center; }
.cr-col { flex-direction: column; gap: 6px; min-height: 0; cursor: default; }

/* ── ตู้ใหญ่ ── */
.cr-machine { position: relative; width: 190px; height: 250px; }
.cr-dome { position: absolute; left: 15px; right: 15px; top: 0; height: 130px; border-radius: 80px 80px 18px 18px; background: rgba(255,255,255,.12); border: 3px solid rgba(255,255,255,.55); overflow: hidden; }
.cr-mcap { position: absolute; width: 34px; height: 34px; border-radius: 50%; background: linear-gradient(#fff 0 50%, var(--c) 50%); border: 1.5px solid rgba(43,53,80,.2); }
.cr-body { position: absolute; left: 4px; right: 4px; top: 122px; bottom: 0; border-radius: 22px; background: linear-gradient(#8b6cf0, #6d4fd0); box-shadow: inset 0 -10px 0 rgba(0,0,0,.18); }
.cr-knob { position: absolute; left: 50%; top: 26px; width: 52px; height: 52px; margin-left: -26px; border-radius: 50%; background: #fff; box-shadow: inset 0 -5px 0 rgba(0,0,0,.12); }
.cr-knob::after { content: ''; position: absolute; left: 8px; right: 8px; top: 22px; height: 8px; background: #6d4fd0; border-radius: 4px; }
.cr-chute { position: absolute; left: 50%; bottom: 14px; width: 56px; height: 26px; margin-left: -28px; border-radius: 10px; background: #1b1433; }
.crank .cr-knob { animation: cr-crank .55s cubic-bezier(.5,0,.3,1) 2; }
.crank .cr-mcap { animation: cr-jostle .28s ease-in-out 4 alternate; }

/* ── แสงใบ้หลังตู้ (จาง — user สั่งลดความชัด) ── */
.cr-halo { position: absolute; left: 50%; top: 50%; width: 330px; height: 330px; margin: -165px 0 0 -165px; border-radius: 50%; pointer-events: none; opacity: 0; transform: scale(.7); transition: opacity .35s, transform .35s; }
.cr-halo.on { opacity: 1; transform: scale(1); }
.cr-halo.plain { background: radial-gradient(circle, rgba(255,255,255,.14) 0%, transparent 58%); }
.cr-halo.epic { background: radial-gradient(circle, rgba(192,132,252,.3) 0%, transparent 58%); }
.cr-halo.rainbow { background: conic-gradient(from 0deg, #ff5f6d, #ffc371, #fff36b, #7cf29a, #6bd5ff, #a78bfa, #ff7de9, #ff5f6d);
  -webkit-mask: radial-gradient(circle, rgba(0,0,0,.8) 10%, transparent 56%); mask: radial-gradient(circle, rgba(0,0,0,.8) 10%, transparent 56%);
  animation: cr-spin 5s linear infinite; }
.cr-halo.rainbow.on { opacity: .35; }
.cr-spark { position: absolute; width: 10px; height: 10px; pointer-events: none; animation: cr-twinkle 1s ease-in-out infinite; }
.cr-spark::before, .cr-spark::after { content: ''; position: absolute; left: 4px; top: 0; width: 2px; height: 10px; background: #fff; border-radius: 2px; box-shadow: 0 0 6px #fff; }
.cr-spark::after { transform: rotate(90deg); }

/* ── แคปซูล ── */
.cr-cap { position: relative; width: 110px; height: 110px; }
.cr-top, .cr-bot { position: absolute; left: 0; right: 0; height: 50%; overflow: hidden; }
.cr-top { top: 0; }
.cr-bot { bottom: 0; }
.cr-top::before, .cr-bot::before { content: ''; position: absolute; left: 0; right: 0; height: 200%; border-radius: 50%; }
.cr-top::before { top: 0; background: radial-gradient(circle at 35% 30%, #fff, rgba(255,255,255,.2) 45%), var(--cc, #e5e7eb); transition: background .25s; }
.cr-bot::before { bottom: 0; background: linear-gradient(#f8f8fb, #d9dbe6); }
.cr-band { position: absolute; left: -2px; right: -2px; top: calc(50% - 4px); height: 8px; border-radius: 4px; background: rgba(43,53,80,.35); }
.cr-glow { position: absolute; inset: -40px; border-radius: 50%; background: radial-gradient(circle, var(--cc, #fff) 0%, transparent 62%); opacity: .55; filter: blur(6px); }
.cr-cap.drop { animation: cr-drop .55s cubic-bezier(.3,1.6,.5,1) both; }
.cr-cap.wobble { animation: cr-wobble .36s ease-in-out infinite; }
.cr-cap.w2 { animation-duration: .26s; }
.cr-cap.w3 { animation-duration: .17s; }
.cr-cap.burst .cr-top { animation: cr-top-off .5s cubic-bezier(.3,0,.3,1) forwards; }
.cr-cap.burst .cr-bot { animation: cr-bot-off .5s cubic-bezier(.3,0,.3,1) forwards; }
.cr-cap.burst .cr-band { opacity: 0; }

/* ── ผลเดี่ยว ── */
.cr-rays { position: absolute; left: 50%; top: 110px; width: 420px; height: 420px; margin: -210px 0 0 -210px; border-radius: 50%; pointer-events: none;
  background: repeating-conic-gradient(from 0deg, var(--rc) 0 8deg, transparent 8deg 24deg); opacity: .35; animation: cr-spin 10s linear infinite;
  -webkit-mask: radial-gradient(circle, #000 20%, transparent 68%); mask: radial-gradient(circle, #000 20%, transparent 68%); }
.cr-label { position: relative; font-size: .8rem; color: rgba(255,255,255,.7); }
.cr-pet { position: relative; font-size: 5.5rem; line-height: 1; filter: drop-shadow(0 0 22px var(--rc)); animation: cr-pop .6s cubic-bezier(.2,1.5,.4,1) both; }
.cr-nm { position: relative; font-family: var(--font-display); font-size: 1.6rem; animation: cr-up .4s .15s both; }
.cr-chip { position: relative; font-size: .74rem; font-weight: 800; padding: 3px 12px; border-radius: 999px; background: var(--rc); color: #1b1433; animation: cr-up .4s .25s both; }
.cr-new { position: relative; font-size: .8rem; font-weight: 800; animation: cr-up .4s .3s both; }

/* ── ถาด 11 ลูก ── */
.cr-tray-top { font-family: var(--font-display); font-size: 1.2rem; margin-bottom: 8px; }
.cr-tray { display: grid; grid-template-columns: repeat(4, 72px); gap: 10px; justify-content: center; }
@media (max-width: 350px) { .cr-tray { grid-template-columns: repeat(4, 64px); gap: 6px; } }
.cr-slot { position: relative; height: 92px; perspective: 500px; }
.cr-cap.mini { position: absolute; left: calc(50% - 25px); top: 6px; width: 50px; height: 50px; }
.cr-cap.mini .cr-band { top: calc(50% - 2.5px); height: 5px; }
.cr-cap.mini.in { animation: cr-drop .5s cubic-bezier(.3,1.6,.5,1) both; }
.cr-cap.mini.shake { animation: cr-wobble .2s ease-in-out infinite; }
.cr-card { position: absolute; inset: 0; border-radius: 14px; background: #fff; color: var(--ink); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px;
  box-shadow: 0 0 0 2px var(--rc), 0 0 18px -2px var(--rc); animation: cr-flipin .38s cubic-bezier(.2,1.3,.4,1) both; }
.cr-card.legendary { background: linear-gradient(160deg, #fff7d6, #fff); }
.cr-card-e { font-size: 1.9rem; line-height: 1; }
.cr-card-n { font-size: .7rem; font-weight: 700; max-width: 100%; padding: 0 3px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.cr-card-t { font-size: .7rem; font-weight: 800; color: #fff; background: var(--rc); border-radius: 999px; padding: 0 6px; }

.cr-flash { position: absolute; inset: 0; background: #fff; pointer-events: none; animation: cr-flash .5s ease-out forwards; }
.cr-confetti { position: absolute; inset: 0; pointer-events: none; }
.cr-confetti i { position: absolute; top: -10px; width: 8px; height: 12px; border-radius: 2px; animation: cr-fall 1.8s linear forwards; }
.cr-ok { position: relative; z-index: 2; margin-top: 18px; border: 0; border-radius: 14px; padding: 11px 40px; font-family: inherit; font-weight: 800; font-size: .95rem; background: #fff; color: #3b2a6e; cursor: pointer; animation: cr-up .4s .3s both; }
.cr-skip { position: absolute; bottom: calc(22px + env(safe-area-inset-bottom, 0px)); left: 0; right: 0; text-align: center; font-size: .74rem; color: rgba(255,255,255,.55); }

@keyframes cr-crank { to { transform: rotate(360deg); } }
@keyframes cr-jostle { to { transform: translate(3px, -4px) rotate(14deg); } }
@keyframes cr-spin { to { transform: rotate(360deg); } }
@keyframes cr-twinkle { 0%, 100% { transform: scale(.2); opacity: 0; } 50% { transform: scale(.9) rotate(45deg); opacity: .6; } }
@keyframes cr-drop { from { transform: translateY(-260px) scale(.5); } to { transform: none; } }
@keyframes cr-wobble { 0%, 100% { transform: rotate(-7deg); } 50% { transform: rotate(7deg) scale(1.03); } }
@keyframes cr-top-off { to { transform: translate(-40px, -120px) rotate(-40deg); opacity: 0; } }
@keyframes cr-bot-off { to { transform: translate(40px, 120px) rotate(30deg); opacity: 0; } }
@keyframes cr-flash { 0% { opacity: .9; } 100% { opacity: 0; } }
@keyframes cr-pop { 0% { transform: scale(.2) rotate(-20deg); opacity: 0; } 60% { transform: scale(1.2) rotate(6deg); opacity: 1; } 100% { transform: none; } }
@keyframes cr-up { from { transform: translateY(14px); opacity: 0; } to { transform: none; opacity: 1; } }
@keyframes cr-flipin { from { transform: rotateY(90deg) scale(.8); } to { transform: none; } }
@keyframes cr-fall { to { transform: translateY(110vh) rotate(540deg); } }
</style>
