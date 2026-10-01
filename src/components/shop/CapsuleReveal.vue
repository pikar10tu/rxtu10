<!--
  <CapsuleReveal> — ฉากเปิดแคปซูล (user เลือกจากเดโม 25 ก.ย. 2026) ใช้ร่วม: อัญเชิญ (ShopView) + หลอม (LabTab)
    1 ต.ค. 2026 (user เคาะเดโม B): ประตูบานเดียวแง้ม → ลูกแสงพุ่งออกตามจำนวนที่สุ่ม สีลูกแสง = ระดับ
    สุ่ม 1 : ประตู (ตำนานสั่นก่อน) → แง้ม แสงลอดสีของระดับ → ลูกแสงพุ่งออก → แตก → ผล
    สุ่ม 10: ประตูแง้ม → ลูกแสงร่วงลงถาด → เปิดทีละลูก · ตำนานเก็บไว้ท้ายสุด สั่นลุ้นแล้วแตกพร้อมพลุ
    แสงใบ้หลังประตู (แบบ ข เดิม): ขาวจาง → ตำนานกลายเป็นรุ้ง · เอพิคเป็นม่วง
    ทุกชิ้นเป็น div + CSS gradient (ไม่มี SVG ขยับ — CLAUDE.md ข้อ 17)
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
        <div class="cr-door" :class="{ shake: doorShake, ajar: doorAjar }" :style="{ '--dc': rc(best) }" aria-hidden="true">
          <div class="cr-door-glow"></div><div class="cr-door-l"></div><div class="cr-door-r"></div>
        </div>
      </div>

      <!-- ── สุ่ม 1: ลูกแสง ── -->
      <div v-else-if="phase === 'capsule' || phase === 'burst'" class="cr-stage">
        <div class="cr-orb out" :class="{ burst: phase === 'burst' }" :style="{ '--cc': rc(one.rarity) }" aria-hidden="true"></div>
      </div>

      <!-- ── สุ่ม 10: ถาดแคปซูล ── -->
      <div v-else-if="phase === 'tray' || (phase === 'show' && multi)" class="cr-stage cr-col" @click.stop="onTap">
        <div class="cr-tray-top">{{ label || `ได้ ${summary.length} แคปซูล` }}</div>
        <div class="cr-tray">
          <div v-for="(s, i) in summary" :key="i" class="cr-slot" :style="{ '--rc': rc(s.rarity) }">
            <div v-if="!opened[i]" class="cr-orb mini out" :class="{ shake: shaking === i }"
              :style="{ '--cc': rc(s.rarity), animationDelay: i * 60 + 'ms' }" aria-hidden="true"></div>
            <div v-else class="cr-card" :class="s.rarity">
              <span class="cr-card-e" :class="{ dusted: s.toDust }"><Emoji :char="s.emoji" /><DustIcon v-if="s.toDust" class="cr-dust" :k="s.rarity" size="1.9rem" /></span>
              <span class="cr-card-n">{{ s.name }}</span>
              <span class="cr-card-t">{{ s.isNew ? 'ใหม่' : s.toDust ? 'ประกายดาว' : '+1' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- ── สุ่ม 1: ผล ── -->
      <div v-if="phase === 'show' && !multi" class="cr-stage cr-col" :style="{ '--rc': rc(one.rarity) }" @click.stop>
        <div v-if="RANK[one.rarity] >= 2" class="cr-rays" aria-hidden="true"></div>
        <div class="cr-label">{{ label || 'คุณได้รับ!' }}</div>
        <div class="cr-pet" :class="{ dusted: one.toDust }"><Emoji :char="one.emoji" /><DustIcon v-if="one.toDust" class="cr-dust" :k="one.rarity" size="5.5rem" /></div>
        <div class="cr-nm">{{ one.name }}</div>
        <span class="cr-chip">{{ RARITY[one.rarity]?.label }}</span>
        <span class="cr-new">{{ one.isNew ? 'ใหม่!' : one.toDust ? `ตัวซ้ำเต็มแล้ว → +1 ${dustName(one.rarity)}` : '+1 ตัวซ้ำ' }}</span>
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
import DustIcon from './DustIcon.vue'
import { dustName } from '../../utils/stardust.js'
import { RARITY } from '../../data/index.js'
import { sfx } from '../../utils/sfx.js'
import { prefersReducedMotion } from '../../utils/motionPref.js'
import { useEscapeKey } from '../../composables/useEscapeKey.js'

const props = defineProps({
  summary: { type: Array, required: true },     // [{ emoji, name, rarity, isNew, toDust }]
  multi: { type: Boolean, default: false },
  label: { type: String, default: '' },
})
const emit = defineEmits(['close'])

const RANK = { common: 0, rare: 1, epic: 2, legendary: 3 }
const rc = (r) => RARITY[r]?.color || '#94a3b8'

// จังหวะ (ms) — สุ่ม 1 ≈ 2 วิ (+0.7 ถ้าตำนาน) · สุ่ม 10 ≈ 3 วิ
const T_DROP = 1150, T_BURST = 2000, T_HINT = 620

const one = computed(() => props.summary[0] || {})
const best = computed(() => props.summary.reduce((b, s) => (RANK[s.rarity] > RANK[b] ? s.rarity : b), 'common'))

const phase = ref('machine')     // machine → capsule → burst → show  |  machine → tray → show
const halo = ref('')             // '' | 'on plain' | 'on epic' | 'on rainbow'
const doorShake = ref(false)
const doorAjar = ref(false)
const flash = ref(false)
const confetti = ref(null)
const opened = ref(props.summary.map(() => false))
const shaking = ref(-1)

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

  // ประตู: ตำนานสั่นก่อน → แง้ม → ลูกแสงพุ่งออก
  const lead = best.value === 'legendary' ? 700 : 0
  if (lead) { doorShake.value = true; sfx('climb') }
  later(lead + 450, () => { doorShake.value = false; doorAjar.value = true })
  if (props.multi) {
    later(lead + T_DROP, () => { phase.value = 'tray'; later(700, openNext) })
    return
  }
  later(lead + T_DROP, () => { phase.value = 'capsule' })
  later(lead + T_BURST, showOne)
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
.cr-card { position: absolute; inset: 0; border-radius: 14px; background: #fff; color: var(--ink); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px;
  box-shadow: 0 0 0 2px var(--rc), 0 0 18px -2px var(--rc); animation: cr-flipin .38s cubic-bezier(.2,1.3,.4,1) both; }
.cr-card.legendary { background: linear-gradient(160deg, #fff7d6, #fff); }
.cr-card-e { font-size: 1.9rem; line-height: 1; }
.cr-card-n { font-size: .7rem; font-weight: 700; max-width: 100%; padding: 0 3px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.cr-card-e { position: relative; }
/* ตัวซ้ำเกินเพดาน: โชว์ตัวก่อน แล้วสลายเป็นประกายดาว (WebP + CSS ล้วน ไม่มีเวกเตอร์ขยับ) */
.cr-dust { position: absolute; left: 50%; top: 50%; translate: -50% -50%; opacity: 0; animation: cr-dust-in .5s .9s ease-out forwards; }
.dusted > :deep(:first-child) { animation: cr-dust-out .45s .75s ease-in forwards; }
@keyframes cr-dust-out { to { opacity: 0; transform: scale(.4); filter: blur(3px) brightness(2); } }
@keyframes cr-dust-in { 0% { opacity: 0; transform: scale(1.6); filter: brightness(2.4); } 100% { opacity: 1; transform: scale(1); filter: none; } }
.cr-card-t { font-size: .7rem; font-weight: 800; color: #fff; background: var(--rc); border-radius: 999px; padding: 0 6px; }

.cr-flash { position: absolute; inset: 0; background: #fff; pointer-events: none; animation: cr-flash .5s ease-out forwards; }
.cr-confetti { position: absolute; inset: 0; pointer-events: none; }
.cr-confetti i { position: absolute; top: -10px; width: 8px; height: 12px; border-radius: 2px; animation: cr-fall 1.8s linear forwards; }
.cr-ok { position: relative; z-index: 2; margin-top: 18px; border: 0; border-radius: 14px; padding: 11px 40px; font-family: inherit; font-weight: 800; font-size: .95rem; background: #fff; color: #3b2a6e; cursor: pointer; animation: cr-up .4s .3s both; }
.cr-skip { position: absolute; bottom: calc(22px + env(safe-area-inset-bottom, 0px)); left: 0; right: 0; text-align: center; font-size: .74rem; color: rgba(255,255,255,.55); }

@keyframes cr-spin { to { transform: rotate(360deg); } }
@keyframes cr-twinkle { 0%, 100% { transform: scale(.2); opacity: 0; } 50% { transform: scale(.9) rotate(45deg); opacity: .6; } }
@keyframes cr-wobble { 0%, 100% { transform: rotate(-7deg); } 50% { transform: rotate(7deg) scale(1.03); } }
@keyframes cr-flash { 0% { opacity: .9; } 100% { opacity: 0; } }
@keyframes cr-pop { 0% { transform: scale(.2) rotate(-20deg); opacity: 0; } 60% { transform: scale(1.2) rotate(6deg); opacity: 1; } 100% { transform: none; } }
@keyframes cr-up { from { transform: translateY(14px); opacity: 0; } to { transform: none; opacity: 1; } }
@keyframes cr-flipin { from { transform: rotateY(90deg) scale(.8); } to { transform: none; } }
@keyframes cr-fall { to { transform: translateY(110vh) rotate(540deg); } }
/* ประตู + ลูกแสง (1 ต.ค. 2026) */
.cr-door { position: relative; width: 150px; height: 215px; border-radius: 75px 75px 8px 8px; background: #0c0718; border: 4px solid #a48ce0; overflow: hidden; perspective: 500px; box-shadow: 0 0 0 6px rgba(164,140,224,.18); }
.cr-door-glow { position: absolute; inset: 0; background: radial-gradient(circle at 50% 60%, #fff, var(--dc) 35%, transparent 72%); opacity: 0; transition: opacity .5s; }
.cr-door-l, .cr-door-r { position: absolute; top: 0; bottom: 0; width: 50%; background: linear-gradient(90deg, #5b46a0, #7a62c4); transition: transform .6s cubic-bezier(.5,0,.3,1); }
.cr-door-l { left: 0; transform-origin: left; border-right: 1px solid rgba(0,0,0,.3); }
.cr-door-r { right: 0; transform-origin: right; background: linear-gradient(270deg, #5b46a0, #7a62c4); }
.cr-door-l::after, .cr-door-r::after { content: ''; position: absolute; top: 54%; width: 8px; height: 8px; border-radius: 50%; background: #f5b72e; }
.cr-door-l::after { right: 8px; } .cr-door-r::after { left: 8px; }
.cr-door.ajar .cr-door-l { transform: rotateY(-40deg); }
.cr-door.ajar .cr-door-r { transform: rotateY(40deg); }
.cr-door.ajar .cr-door-glow { opacity: 1; }
.cr-door.shake { animation: cr-wobble .12s linear infinite; }
.cr-orb { position: relative; width: 110px; height: 110px; border-radius: 50%; background: radial-gradient(circle at 35% 32%, #fff, var(--cc) 45%, color-mix(in srgb, var(--cc) 60%, #000)); box-shadow: 0 0 28px 8px var(--cc); }
.cr-orb.out { animation: cr-orb-out .55s cubic-bezier(.2,1.4,.4,1) both, cr-orb-pulse 1.1s .55s ease-in-out infinite; }
.cr-orb.burst { animation: cr-orb-burst .25s ease-out forwards; }
.cr-orb.mini { position: absolute; left: calc(50% - 24px); top: 8px; width: 48px; height: 48px; box-shadow: 0 0 14px 3px var(--cc); }
.cr-orb.mini.shake { animation: cr-wobble .2s ease-in-out infinite; box-shadow: 0 0 24px 8px var(--cc); }
@keyframes cr-orb-out { from { transform: translateY(-140px) scale(.15); opacity: 0; } to { transform: none; opacity: 1; } }
@keyframes cr-orb-pulse { 50% { box-shadow: 0 0 40px 14px var(--cc); } }
@keyframes cr-orb-burst { to { transform: scale(1.8); opacity: 0; filter: brightness(2); } }
</style>
