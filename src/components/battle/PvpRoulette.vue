<!-- src/components/battle/PvpRoulette.vue — รูเล็ตหาคู่สไตล์ Hearthstone (user สั่ง 28 ก.ย. 2026)
     ชื่อตลกหมุนผ่าน ~1.8 วิ ช้าลงเรื่อยๆ แล้วล็อกที่ "คู่ต่อสู้ที่คู่ควร" เสมอ — ไม่บอกว่าเจอใคร (เข้าไฟต์ถึงรู้)
     ของตกแต่งล้วน: ผลไฟต์เขียนไปแล้วตั้งแต่กดปุ่ม ปิดแท็บตอนหมุนก็ไม่รอดพลังงาน
     Teleport ตาม CLAUDE.md ข้อ 6 -->
<template>
  <Teleport to="body">
    <div v-if="open" class="pr-ov" role="status" aria-live="polite">
      <div class="pr-cap">{{ locked ? 'เจอแล้ว!' : 'กำลังหาคู่ต่อสู้…' }}</div>
      <div class="pr-reel" :class="{ locked }">
        <div :key="tick" class="pr-name">{{ shown }}</div>
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
const tick = ref(0)
const locked = ref(false)
let timer = null

function stop() { clearTimeout(timer); timer = null }

function start() {
  stop()
  locked.value = false
  const pool = props.names.length ? props.names : ['…']
  let i = Math.floor(Math.random() * pool.length)
  const t0 = performance.now()
  const step = () => {
    const el = performance.now() - t0
    if (el >= SPIN_MS) {
      shown.value = ROULETTE_WINNER; tick.value++; locked.value = true
      sfx('levelup')
      timer = setTimeout(() => emit('done'), HOLD_MS)
      return
    }
    i = (i + 1 + Math.floor(Math.random() * 2)) % pool.length
    shown.value = pool[i]; tick.value++
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
.pr-reel { width: 100%; max-width: 340px; height: 84px; display: flex; align-items: center; justify-content: center; overflow: hidden; background: rgba(255,255,255,.08); border: 2px solid rgba(255,255,255,.35); border-radius: 18px; box-shadow: inset 0 0 24px rgba(0,0,0,.35); }
.pr-reel.locked { border-color: #fde68a; background: rgba(253,230,138,.14); box-shadow: 0 0 32px rgba(253,230,138,.55), inset 0 0 24px rgba(0,0,0,.25); animation: pr-pop .45s ease-out; }
.pr-name { font-size: 1.25rem; font-weight: 800; text-align: center; padding: 0 12px; animation: pr-slide .09s ease-out; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; }
.pr-reel.locked .pr-name { font-size: 1.45rem; color: #fde68a; animation: none; }
.pr-sub { font-size: .76rem; font-weight: 700; color: rgba(255,255,255,.62); }
@keyframes pr-slide { from { transform: translateY(-60%); opacity: .3; } to { transform: none; opacity: 1; } }
@keyframes pr-pop { 0% { transform: scale(1); } 40% { transform: scale(1.08); } 100% { transform: scale(1); } }
</style>
