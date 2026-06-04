<template>
  <div class="tab-content">
    <div style="font-size:1.1rem;font-weight:800;margin-bottom:12px">🎮 Play</div>

    <template v-if="authStore.isLoggedIn">
      <div class="play-grid">
        <!-- Farm: live entry card → opens modal -->
        <button class="game-card" @click="farmOpen = true">
          <span class="gc-emoji">🌾</span>
          <span class="gc-name">ฟาร์ม</span>
          <span v-if="readyCount" class="gc-badge ready">🧺 เก็บได้ {{ readyCount }}</span>
          <span v-else-if="emptyCount" class="gc-badge plant">＋ ว่าง {{ emptyCount }} แปลง</span>
          <span v-else class="gc-badge grow">🌱 กำลังโต</span>
        </button>

        <div class="soon-card"><span class="soon-emoji">⚔️</span><span>PvP สู้กัน</span><span class="soon-tag">เร็วๆ นี้</span></div>
        <div class="soon-card"><span class="soon-emoji">🏯</span><span>ปีนหอคอย</span><span class="soon-tag">เร็วๆ นี้</span></div>
        <div class="soon-card"><span class="soon-emoji">🗺️</span><span>ผจญภัย Co-op</span><span class="soon-tag">เร็วๆ นี้</span></div>
        <div class="soon-card"><span class="soon-emoji">🍬</span><span>เภสัช Crush</span><span class="soon-tag">เร็วๆ นี้</span></div>
      </div>

      <!-- Farm modal -->
      <div v-if="farmOpen" class="farm-ov" @click.self="farmOpen = false">
        <div class="farm-sheet">
          <div class="farm-sheet-head">
            <span class="farm-sheet-grab"></span>
            <button class="farm-x" @click="farmOpen = false">✕</button>
          </div>
          <div class="farm-scroll">
            <FarmGrid />
          </div>
        </div>
      </div>
    </template>
    <div v-else class="play-login">เข้าสู่ระบบเพื่อเล่น</div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '../stores/auth.js'
import { useFarm } from '../composables/useFarm.js'
import FarmGrid from '../components/farm/FarmGrid.vue'

const authStore = useAuthStore()
const farm = useFarm()

const farmOpen = ref(false)

// coarse tick (5s) just to keep the entry-card badge fresh — the modal has its own 1s timer
const now = ref(Date.now())
let timer = null
onMounted(() => { timer = setInterval(() => { now.value = Date.now() }, 5000) })
onUnmounted(() => clearInterval(timer))

const readyCount = computed(() =>
  farm.plots.value.filter(p => p && farm.status(p, now.value).ready).length
)
const emptyCount = computed(() => farm.plots.value.filter(p => !p).length)
</script>

<style scoped>
.play-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.game-card { all: unset; cursor: pointer; box-sizing: border-box; background: linear-gradient(135deg,#ecfdf5,#fff); border: 1px solid rgba(34,197,94,.3); border-radius: 12px; padding: 16px 10px; display: flex; flex-direction: column; align-items: center; gap: 5px; }
.game-card:active { transform: scale(.98); }
.gc-emoji { font-size: 1.6rem; }
.gc-name { font-size: .8rem; font-weight: 800; }
.gc-badge { font-size: .58rem; font-weight: 700; padding: 2px 8px; border-radius: 999px; }
.gc-badge.ready { color: #15803d; background: rgba(34,197,94,.16); }
.gc-badge.plant { color: #b45309; background: rgba(251,191,36,.18); }
.gc-badge.grow  { color: rgba(0,0,0,.45); background: rgba(0,0,0,.05); }

.soon-card { background: #fff; border: 1px solid rgba(0,0,0,.08); border-radius: 12px; padding: 16px 10px; display: flex; flex-direction: column; align-items: center; gap: 4px; opacity: .75; }
.soon-emoji { font-size: 1.6rem; }
.soon-card span:nth-child(2) { font-size: .8rem; font-weight: 700; }
.soon-tag { font-size: .56rem; color: #b45309; background: rgba(251,191,36,.18); padding: 2px 7px; border-radius: 999px; }

.farm-ov { position: fixed; inset: 0; z-index: 200; background: rgba(0,0,0,.45); display: flex; align-items: flex-end; justify-content: center; }
.farm-sheet { background: #fff; width: 100%; max-width: 480px; max-height: 88vh; border-radius: 18px 18px 0 0; display: flex; flex-direction: column; overflow: hidden; }
.farm-sheet-head { flex: none; position: relative; display: flex; align-items: center; justify-content: center; padding: 8px 8px 4px; }
.farm-sheet-grab { width: 38px; height: 4px; border-radius: 999px; background: rgba(0,0,0,.15); }
.farm-x { position: absolute; right: 8px; top: 6px; border: none; background: rgba(0,0,0,.06); border-radius: 8px; width: 32px; height: 32px; cursor: pointer; font-size: .9rem; }
.farm-scroll { flex: 1 1 auto; min-height: 0; overflow-y: auto; -webkit-overflow-scrolling: touch; padding: 4px 12px 24px; }
/* farm card blends into the sheet (no card-in-card chrome) */
.farm-scroll :deep(.farm) { border: none; border-radius: 0; box-shadow: none; padding: 0; background: transparent; }

.play-login { text-align: center; color: rgba(0,0,0,.4); padding: 30px 0; font-size: .85rem; }
</style>
