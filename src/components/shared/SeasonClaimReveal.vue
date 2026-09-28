<!--
  <SeasonClaimReveal> — อนิเมชันเปิดรางวัลซีซั่น (หอคอย/อารีน่า)
  แบนเนอร์ (Task 5) claim mail ผ่าน mailbox store เสร็จ**ก่อน**เปิดตัวนี้เสมอ — component นี้ไม่แตะ Firestore
  ใช้: <SeasonClaimReveal v-if="revealMail" :mail="revealMail" @close="revealMail = null" />

  z-index 450: เปิดจากแบนเนอร์ระดับหน้า (หอคอย/อารีน่า) ไม่ใช่จากใน modal อื่น — เทียบเท่า PvpRoulette
  (ก็ z450 เหมือนกัน, ดูบันได CLAUDE.md ข้อ 12) อยู่เหนือ modal ปกติทั้งหมด (≤440 HelpModal)
  แต่ต่ำกว่า balloon/toast (500+) โดยตั้งใจ — announceAchievement() คิว balloon ไว้ตอน claim()
  (ก่อน component นี้ mount ด้วยซ้ำ) balloon จึงต้องยังโผล่ทะลุขึ้นมาเห็นได้เสมอ
-->
<template>
  <Teleport to="body">
    <div class="scr-ov" role="dialog" aria-modal="true" :aria-label="`รางวัล ${mail.tier?.name || ''}`" @click="onTap">
      <canvas ref="cv" class="scr-cv" />
      <div class="scr-chest" :class="{ shake: phase === 'shake', pop: phase !== 'shake' }">
        <Emoji :char="phase === 'shake' ? chestChar : '✨'" />
      </div>
      <div class="scr-name">{{ phase === 'shake' ? '' : mail.tier?.name }}</div>
      <div class="scr-items">
        <div v-for="(r, i) in shown" :key="i" class="scr-item" :class="{ special: r.special }">
          <span><Emoji :char="r.icon" /> {{ r.label }}</span>
          <b v-if="r.value != null">+{{ fmt(r.shownValue) }}</b>
        </div>
      </div>
      <button v-if="finished" ref="doneBtn" type="button" class="scr-done" @click.stop="emit('close')">เก็บเข้ากระเป๋า</button>
      <div v-else class="scr-hint">แตะเพื่อข้าม</div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, reactive, onMounted, onBeforeUnmount, nextTick } from 'vue'
import Emoji from './Emoji.vue'
import { sfx } from '../../utils/sfx.js'
import { prefersReducedMotion } from '../../utils/motionPref.js'
import { useEscapeKey } from '../../composables/useEscapeKey.js'
import { getArena } from '../../data/arenas.js'
import { getAchievement } from '../../data/achievements.js'
import { achievementTitle } from '../../utils/achievements.js'

const props = defineProps({ mail: { type: Object, required: true } })
const emit = defineEmits(['close'])

const reduce = prefersReducedMotion()
const lv = computed(() => props.mail.tier?.lv || 1)
const chestChar = computed(() => lv.value >= 4 ? '👑' : lv.value >= 3 ? '💎' : '🎁')
const fmt = (n) => Math.round(n).toLocaleString('en-US')

const rows = computed(() => {
  const w = props.mail.reward || {}
  const out = []
  if (w.coins) out.push({ icon: '🪙', label: 'เหรียญ', value: w.coins })
  if (w.tickets) out.push({ icon: '🎟️', label: 'ตั๋วอัญเชิญ', value: w.tickets })
  if (w.arena && getArena(w.arena.id)) out.push({ icon: '🏟️', label: getArena(w.arena.id).name, special: true })
  if (w.achievement) {
    const def = getAchievement(w.achievement.id)
    if (def) out.push({ icon: '🏅', label: achievementTitle(def, w.achievement.date || null), special: true })
  }
  return out
})

const phase = ref(reduce ? 'open' : 'shake')
const shown = ref([])
const finished = ref(false)
const cv = ref(null)
const doneBtn = ref(null)
let timers = [], raf = 0

const SHAKE_MS = [0, 500, 800, 1100, 1500]
const ROW_GAP = 450

// เพิ่มแถวรางวัล 1 แถว — animate=true ไล่ตัวเลขจาก 0 ขึ้นด้วย ease-out-cubic ใน 600ms
// ใช้ reactive() (ไม่ใช่ object ธรรมดาใน ref array) เพื่อให้แก้ item.shownValue ทีละเฟรม
// แล้วรีเรนเดอร์ได้ตรงๆ — object ธรรมดาที่ push เข้า ref array แล้วมิวเทตทีหลัง Vue ไม่เห็นการเปลี่ยน
// (ต้อง reassign array ทั้งก้อนทุกเฟรมแทน ซึ่งหนักกว่าโดยไม่จำเป็น)
function addRow(r, animate) {
  const item = reactive({ ...r, shownValue: animate && r.value != null ? 0 : r.value })
  shown.value.push(item)
  if (!animate || r.value == null) return
  const start = performance.now()
  const step = (now) => {
    const p = Math.min(1, (now - start) / 600)
    item.shownValue = r.value * (1 - Math.pow(1 - p, 3))
    if (p < 1) raf = requestAnimationFrame(step)
  }
  raf = requestAnimationFrame(step)
}

function finishNow() {
  timers.forEach(clearTimeout); timers = []
  cancelAnimationFrame(raf)
  phase.value = 'open'
  shown.value = rows.value.map(r => ({ ...r, shownValue: r.value }))
  finished.value = true
  nextTick(() => doneBtn.value?.focus())
}

function onTap() { if (!finished.value) finishNow() }

function burst() {
  const el = cv.value
  if (!el) return
  const r = el.getBoundingClientRect(), dpr = devicePixelRatio || 1
  el.width = r.width * dpr; el.height = r.height * dpr
  const c = el.getContext('2d'); c.scale(dpr, dpr)
  const cx = r.width / 2, cy = r.height / 2 - 90, N = [0, 24, 45, 70, 110][lv.value]
  const ps = Array.from({ length: N }, () => {
    const a = Math.random() * Math.PI * 2, v = 3 + Math.random() * (4 + lv.value * 1.5)
    return { x: cx, y: cy, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 4, r: 4 + Math.random() * 4, s: Math.random() * 6, c: Math.random() < 0.8 ? '#ffcf5a' : '#f472b6' }
  })
  let fr = 0
  const tick = () => {
    c.clearRect(0, 0, r.width, r.height); fr++
    for (const p of ps) {
      p.vy += 0.22; p.x += p.vx; p.y += p.vy; p.vx *= 0.99; p.s += 0.2
      c.fillStyle = p.c; c.globalAlpha = Math.max(0, 1 - fr / 90)
      c.beginPath(); c.ellipse(p.x, p.y, p.r * Math.abs(Math.cos(p.s)), p.r, 0, 0, 7); c.fill()
    }
    if (fr < 90) raf = requestAnimationFrame(tick); else c.clearRect(0, 0, r.width, r.height)
  }
  raf = requestAnimationFrame(tick)
}

onMounted(() => {
  if (reduce) { finishNow(); return }
  const at = (ms, f) => timers.push(setTimeout(f, ms))
  const sh = SHAKE_MS[lv.value]
  sfx('roll')
  at(sh, () => { phase.value = 'open'; burst(); sfx(lv.value >= 3 ? 'levelup' : 'coin') })
  rows.value.forEach((r, i) => at(sh + 400 + i * ROW_GAP, () => { addRow(r, true); sfx(r.special ? 'finish' : 'coin') }))
  at(sh + 400 + rows.value.length * ROW_GAP, () => { finished.value = true; nextTick(() => doneBtn.value?.focus()) })
})
onBeforeUnmount(() => { timers.forEach(clearTimeout); cancelAnimationFrame(raf) })

// แตะจอ = ข้าม (ตลอดจนกว่าจะจบ) · Escape = ข้าม ถ้ายังไม่จบ / ปิด ถ้าจบแล้ว (เหมือน CapsuleReveal)
useEscapeKey(() => true, () => { if (finished.value) emit('close'); else onTap() })
</script>

<style scoped>
.scr-ov{position:fixed;inset:0;z-index:450;background:#070510b3;backdrop-filter:blur(3px);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;padding:20px;color:#f3eefc}
.scr-cv{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}
.scr-chest{font-size:88px;line-height:1}
.scr-chest.shake{animation:scr-shake .12s linear infinite}
.scr-chest.pop{animation:scr-pop .5s cubic-bezier(.2,1.6,.4,1)}
@keyframes scr-shake{25%{transform:rotate(-6deg)}75%{transform:rotate(6deg)}}
@keyframes scr-pop{0%{transform:scale(.6)}100%{transform:scale(1)}}
.scr-name{font-family:var(--font-display);font-weight:400;font-size:20px;color:#ffcf5a;min-height:30px;text-align:center}
.scr-items{display:grid;gap:8px;width:100%;max-width:280px}
.scr-item{display:flex;justify-content:space-between;align-items:center;gap:8px;background:#ffffff14;border-radius:12px;padding:10px 12px;animation:scr-in .35s cubic-bezier(.2,1.4,.4,1)}
.scr-item b{font-family:var(--font-display);font-weight:400;font-size:18px;font-variant-numeric:tabular-nums}
.scr-item.special{background:linear-gradient(90deg,#ffcf5a33,#f472b633);border:1px solid #ffcf5a88}
@keyframes scr-in{from{opacity:0;transform:translateY(12px) scale(.95)}}
.scr-done{border:0;border-radius:12px;padding:10px 26px;font-family:var(--font-display);font-weight:400;font-size:15px;background:#352a5c;color:#f3eefc;cursor:pointer}
.scr-done:focus-visible{outline:2px solid #ffcf5a;outline-offset:2px}
.scr-hint{font-size:12px;color:#b3a8d4}
</style>
