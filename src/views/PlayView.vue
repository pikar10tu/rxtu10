<template>
  <div class="tab-content">
    <div class="page-title pv-head"><span><Emoji char="🎮" /> Play</span><HelpButton topic="farm" /></div>

    <!-- กระดานข่าว (เห็นได้ทุกคน · collapsed แสดงบรรทัดล่าสุด กดกาง log) -->
    <NewsBoard />

    <template v-if="authStore.isLoggedIn">
      <!-- ── สวน & สัตว์ ── -->
      <SectionTitle><Emoji char="🌾" /> สวน &amp; สัตว์</SectionTitle>
      <div class="play-grid">
        <!-- Farm: live entry card → opens modal -->
        <button class="game-card" @click="farmOpen = true">
          <span class="gc-emoji"><Emoji char="🌾" /></span>
          <span class="gc-name">ฟาร์ม</span>
          <span v-if="readyCount" class="gc-badge ready"><Emoji char="🧺" /> เก็บได้ {{ readyCount }}</span>
          <span v-else-if="emptyCount" class="gc-badge plant">＋ ว่าง {{ emptyCount }} แปลง</span>
          <span v-else class="gc-badge grow"><Emoji char="🌱" /> กำลังโต</span>
        </button>

        <RouterLink to="/pets" class="game-card">
          <span class="gc-emoji"><Emoji char="🐾" /></span>
          <span class="gc-name">สัตว์เลี้ยง</span>
          <span class="gc-badge grow">คลัง · ห้องทดลอง</span>
        </RouterLink>
      </div>

      <!-- ── ร้านค้า ── (การ์ดเดียวเต็มแถว → /shop เจอ 2 แท็บเดิม) -->
      <SectionTitle><Emoji char="🛒" /> ร้านค้า</SectionTitle>
      <RouterLink to="/shop" class="game-card">
        <span class="gc-emoji"><Emoji char="🛒" /></span>
        <span class="gc-name">ร้านค้า</span>
        <span class="gc-badge grow">อัญเชิญ · ห้องทดลอง</span>
      </RouterLink>

      <!-- ── สนามประลอง (เร็วๆ นี้) ── -->
      <SectionTitle><Emoji char="⚔️" /> สนามประลอง</SectionTitle>
      <div class="play-grid">
        <SoonCard emoji="⚔️" label="PvP สู้กัน" />
        <SoonCard emoji="🏯" label="ปีนหอคอย" />
        <SoonCard emoji="🗺️" label="ผจญภัย Co-op" />
        <SoonCard emoji="🍬" label="เภสัช Crush" />
      </div>

      <!-- Farm modal — Teleport ไป body: #main-content เป็น position:fixed = สร้าง stacking context
           ทำให้ .farm-ov ติดกับดัก z-index:400 สู้ #bottom-nav (z200) ที่ root ไม่ได้ → nav ทับก้น sheet.
           ย้ายไป body ให้อยู่ระดับ root (เหมือน ConfirmModal) z-index จึงมีผลจริง -->
      <Teleport to="body">
      <div v-if="farmOpen" class="farm-ov" @click.self="farmOpen = false">
        <div class="farm-sheet">
          <div class="farm-sheet-head">
            <span class="farm-sheet-grab"></span>
            <button class="farm-x" aria-label="ปิด" @click="farmOpen = false">✕</button>
          </div>
          <div class="farm-scroll">
            <FarmGrid />
          </div>
        </div>
      </div>
      </Teleport>
    </template>
    <div v-else class="play-login">เข้าสู่ระบบเพื่อเล่น</div>
  </div>
</template>

<script setup>
import Emoji from '../components/shared/Emoji.vue'
import HelpButton from '../components/help/HelpButton.vue'
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '../stores/auth.js'
import { useFarm } from '../composables/useFarm.js'
import FarmGrid from '../components/farm/FarmGrid.vue'
import NewsBoard from '../components/home/NewsBoard.vue'
import SectionTitle from '../components/shared/SectionTitle.vue'
import SoonCard from '../components/shared/SoonCard.vue'

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
.pv-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.play-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.game-card { all: unset; cursor: pointer; box-sizing: border-box; background: #e2f7f0; border: 2px solid var(--ink); border-radius: 16px; box-shadow: var(--pop); padding: 16px 10px; display: flex; flex-direction: column; align-items: center; gap: 5px; transition: transform .12s, box-shadow .12s; }
.game-card:active { transform: translate(2px,2px); box-shadow: 0 0 0 var(--ink); }
.gc-emoji { font-size: 1.6rem; }
.gc-name { font-size: .8rem; font-weight: 800; }
.gc-badge { font-size: .58rem; font-weight: 700; padding: 2px 8px; border-radius: 999px; }
.gc-badge.ready { color: #15803d; background: rgba(34,197,94,.16); }
.gc-badge.plant { color: #b45309; background: rgba(251,191,36,.18); }
.gc-badge.grow  { color: rgba(0,0,0,.45); background: rgba(0,0,0,.05); }

/* z-index ต้อง > #bottom-nav (200) ไม่งั้น nav ทับก้น sheet (66px) บัง "ผลผลิต" */
.farm-ov { position: fixed; inset: 0; z-index: 400; background: rgba(0,0,0,.45); display: flex; align-items: flex-end; justify-content: center; }
/* max-height ต้องเป็น dvh (dynamic viewport) ไม่ใช่ vh — บนมือถือตอน toolbar โผล่ vh = large viewport
   ทำให้ sheet ยึดก้นจอสูงเกินพื้นที่เห็นจริง → ก้น sheet ("ผลผลิต") หล่นใต้ fold เลื่อนไม่ถึง
   (sheet อื่น exp/forge/tower/pvp ใช้ dvh หมดแล้ว) */
.farm-sheet { background: #fff; width: 100%; max-width: 480px; max-height: 88dvh; border-radius: 18px 18px 0 0; display: flex; flex-direction: column; overflow: hidden; }
.farm-sheet-head { flex: none; position: relative; display: flex; align-items: center; justify-content: center; padding: 8px 8px 4px; }
.farm-sheet-grab { width: 38px; height: 4px; border-radius: 999px; background: rgba(0,0,0,.15); }
.farm-x { position: absolute; right: 8px; top: 6px; border: none; background: rgba(0,0,0,.06); border-radius: 8px; width: 32px; height: 32px; cursor: pointer; font-size: .9rem; }
.farm-scroll { flex: 1 1 auto; min-height: 0; overflow-y: auto; overscroll-behavior: contain; -webkit-overflow-scrolling: touch; padding: 4px 12px 24px; }
/* farm card blends into the sheet (no card-in-card chrome) */
.farm-scroll :deep(.farm) { border: none; border-radius: 0; box-shadow: none; padding: 0; background: transparent; }

.play-login { text-align: center; color: rgba(0,0,0,.4); padding: 30px 0; font-size: .85rem; }
</style>
