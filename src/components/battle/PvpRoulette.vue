<!-- src/components/battle/PvpRoulette.vue — รูเล็ตหาคู่สไตล์ Hearthstone (user สั่ง 28 ก.ย. 2026)
     ชื่อตลกหมุนผ่าน ~1.8 วิ ช้าลงเรื่อยๆ แล้วล็อกที่ "คู่ต่อสู้ที่คู่ควร" เสมอ — ไม่บอกว่าเจอใคร (เข้าไฟต์ถึงรู้)
     ของตกแต่งล้วน: ผลไฟต์เขียนไปแล้วตั้งแต่กดปุ่ม ปิดแท็บตอนหมุนก็ไม่รอดพลังงาน
     Teleport ตาม CLAUDE.md ข้อ 6 -->
<template>
  <Teleport to="body">
    <div v-if="open" class="pr-ov" role="status" aria-live="polite">
      <div class="pr-cap">{{ locked ? 'เจอแล้ว!' : 'กำลังหาคู่ต่อสู้…' }}</div>
      <!-- วงล้อสล็อต 3 แถว: บน/ล่าง = ชื่อตลกที่หมุนผ่าน · กลาง = ช่องผล (หยุดที่ ROULETTE_WINNER เสมอ) -->
      <div class="pr-reel" :class="{ locked }">
        <div :key="tick" class="pr-rows">
          <div class="pr-row pr-side">{{ above }}</div>
          <div class="pr-row pr-mid">{{ shown }}</div>
          <div class="pr-row pr-side">{{ below }}</div>
        </div>
        <div class="pr-window" />
      </div>
      <div class="pr-sub">{{ locked ? 'เตรียมตัวเข้าสังเวียน' : 'สุ่มจากคนแต้มใกล้ๆ กัน' }}</div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, watch, onUnmounted } from 'vue'
import { sfx } from '../../utils/sfx.js'
import { ROULETTE_WINNER } from '../../data/pvpRoulette.js'

const props = defineProps({
  open: { type: Boolean, default: false },
  names: { type: Array, default: () => [] },
})
const emit = defineEmits(['done'])

const SPIN_MS = 1800
const HOLD_MS = 1200
const shown = ref('')
const above = ref('')
const below = ref('')
const tick = ref(0)
const locked = ref(false)
let timer = null

function stop() { clearTimeout(timer); timer = null }

function start() {
  stop()
  locked.value = false
  const pool = props.names.length ? props.names : ['…']
  let i = Math.floor(Math.random() * pool.length)
  const at = (k) => pool[((k % pool.length) + pool.length) % pool.length]
  // ชุดสามแถว: แถวบนคือชื่อถัดไป (กำลังจะเลื่อนลงมา) แถวล่างคือชื่อที่เพิ่งผ่านไป
  const setRows = () => { above.value = at(i + 1); shown.value = at(i); below.value = at(i - 1) }
  const t0 = performance.now()
  const step = () => {
    const el = performance.now() - t0
    if (el >= SPIN_MS) {
      above.value = at(i + 1); below.value = at(i)
      shown.value = ROULETTE_WINNER; tick.value++; locked.value = true
      sfx('levelup')
      timer = setTimeout(() => emit('done'), HOLD_MS)
      return
    }
    i = (i + 1) % pool.length
    setRows(); tick.value++
    sfx('tap')
    // ช้าลงเรื่อยๆ 60ms → ~260ms (ease-out) ให้รู้สึกว่ารูเล็ตกำลังจะหยุด
    const p = el / SPIN_MS
    timer = setTimeout(step, 60 + 200 * p * p)
  }
  step()
}

watch(() => props.open, (v) => { if (v) start(); else stop() }, { immediate: true })
onUnmounted(stop)
</script>

<style scoped>
.pr-ov { position: fixed; inset: 0; z-index: 450; background: radial-gradient(circle at 50% 45%, #4338ca 0%, #1e1b4b 70%); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px; padding: 16px; color: #fff; }
.pr-cap { font-size: .9rem; font-weight: 800; color: rgba(255,255,255,.8); letter-spacing: .02em; }
.pr-reel { position: relative; width: 100%; max-width: 340px; height: 168px; overflow: hidden; background: rgba(255,255,255,.08); border: 2px solid rgba(255,255,255,.35); border-radius: 18px; box-shadow: inset 0 0 24px rgba(0,0,0,.35); }
/* จางหัวท้ายให้เหมือนวงล้อโค้งหายไป */
.pr-reel::before, .pr-reel::after { content: ''; position: absolute; left: 0; right: 0; height: 40px; z-index: 2; pointer-events: none; }
.pr-reel::before { top: 0; background: linear-gradient(#1e1b4b, transparent); }
.pr-reel::after { bottom: 0; background: linear-gradient(transparent, #1e1b4b); }
.pr-rows { display: flex; flex-direction: column; animation: pr-slide .09s ease-out; }
.pr-reel.locked .pr-rows { animation: pr-settle .35s cubic-bezier(.3,1.6,.5,1); }
.pr-row { height: 56px; display: flex; align-items: center; justify-content: center; padding: 0 12px; font-weight: 800; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.pr-side { font-size: .95rem; color: rgba(255,255,255,.5); }
.pr-mid { font-size: 1.2rem; }
.pr-reel.locked .pr-mid { font-size: 1.35rem; color: #fde68a; }
/* ช่องผลตรงกลาง */
.pr-window { position: absolute; left: 6px; right: 6px; top: 56px; height: 56px; z-index: 3; pointer-events: none; border: 2px solid rgba(255,255,255,.55); border-radius: 12px; }
.pr-reel.locked .pr-window { border-color: #fde68a; box-shadow: 0 0 24px rgba(253,230,138,.6), inset 0 0 16px rgba(253,230,138,.25); }
.pr-sub { font-size: .76rem; font-weight: 700; color: rgba(255,255,255,.62); }
@keyframes pr-slide { from { transform: translateY(-56px); } to { transform: none; } }
@keyframes pr-settle { 0% { transform: translateY(-56px); } 100% { transform: none; } }
</style>
