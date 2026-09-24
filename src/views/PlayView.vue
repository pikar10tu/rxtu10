<template>
  <div class="tab-content">
    <div class="page-title pv-head"><span><Emoji char="🎮" /> Play</span><HelpButton topic="play" /></div>

    <!-- กระดานข่าว (เห็นได้ทุกคน) -->
    <NewsBoard />

    <template v-if="authStore.isLoggedIn">
      <!-- ── ร้านค้ารวม (ร้านเพ็ท · ร้านฟาร์ม · ร้านตกแต่ง) — ทางเข้าบนสุดของหน้าเกม ── -->
      <RouterLink to="/shop" class="shop-entry">
        <span class="se-emoji"><Emoji char="🛍️" /></span>
        <span class="se-txt"><b>ร้านค้า</b><small>อัญเชิญเพ็ท · ปลดแปลงฟาร์ม · ร้านตกแต่งใหม่ 🎀</small></span>
        <span class="se-go">›</span>
      </RouterLink>

      <!-- ── 2 ระบบใหญ่: โหมดเพ็ท / โหมดฟาร์ม ── -->
      <div class="hero-grid">
        <RouterLink to="/play/pets" class="hero-card pets">
          <span class="hero-emoji"><Emoji char="🐾" /></span>
          <span class="hero-name">โหมดเพ็ท</span>
          <span class="hero-sub">คลัง · จัดทีม · หอคอย · ประลอง</span>
        </RouterLink>

        <RouterLink to="/play/farm" class="hero-card farm">
          <span class="hero-emoji"><Emoji char="🌱" /></span>
          <span class="hero-name">โหมดฟาร์ม</span>
          <span v-if="readyCount" class="hero-badge ready"><Emoji char="🧺" /> เก็บได้ {{ readyCount }}</span>
          <span v-else-if="emptyCount" class="hero-badge plant">＋ ว่าง {{ emptyCount }} แปลง</span>
          <span v-else class="hero-sub">ปลูก · เก็บเกี่ยว · ปลดแปลง</span>
        </RouterLink>
      </div>

      <!-- ── มินิเกม (จาก registry data/minigames.js) — ซ่อนเมื่อ arcadeOpen ปิด ──
           ⚠️ เดิมมี `|| authStore.isAdmin` ให้แอดมินเห็นเสมอ "ไว้เทสก่อนเปิดให้ทั้งรุ่น"
              user สั่งเอาออก 27 ส.ค.: มินิเกมเป็นบทที่ปิดแล้ว ไม่ต้องเห็นแม้แต่แอดมิน
              (route ยังเข้าตรงด้วย URL ได้ถ้าวันหนึ่งจะกลับมาเทส — ดู router/index.js) -->
      <template v-if="arcadeOpen">
        <SectionTitle><Emoji char="🎮" /> มินิเกม</SectionTitle>
        <div class="soon-grid">
          <template v-for="g in games" :key="g.key">
            <RouterLink v-if="g.status === 'live'" :to="g.route" class="mg-card">
              <span class="mg-emoji"><Emoji :char="g.emoji" /></span>
              <span class="mg-name">{{ g.name }}</span>
              <span class="mg-best">สถิติ {{ bestOf(g.key).toLocaleString() }}</span>
            </RouterLink>
            <SoonCard v-else :emoji="g.emoji" :label="g.name" />
          </template>
        </div>
      </template>
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
import { useExpedition } from '../composables/useExpedition.js'
import { expeditionState } from '../utils/expedition.js'
import NewsBoard from '../components/home/NewsBoard.vue'
import SectionTitle from '../components/shared/SectionTitle.vue'
import SoonCard from '../components/shared/SoonCard.vue'
import { MINIGAMES } from '../data/minigames.js'
import { useAppConfig } from '../composables/useAppConfig.js'

const authStore = useAuthStore()
const { arcadeOpen } = useAppConfig()   // มินิเกมซ่อนจากทุกคนรวมแอดมิน (27 ส.ค.)
const farm = useFarm()
const { exp } = useExpedition()

const games = MINIGAMES
const bestOf = (key) => authStore.userData?.minigames?.[key]?.best || 0

// coarse tick (5s) ให้ badge การ์ดสด
const now = ref(Date.now())
let timer = null
onMounted(() => { timer = setInterval(() => { now.value = Date.now() }, 5000) })
onUnmounted(() => clearInterval(timer))

const expState   = computed(() => expeditionState(exp.value, now.value))
const readyCount = computed(() => farm.plots.value.filter(p => p && farm.status(p, now.value).ready).length)
const emptyCount = computed(() => farm.plots.value.filter(p => !p).length)
</script>

<style scoped>
.shop-entry { display: flex; align-items: center; gap: 12px; margin: 10px 0 12px; padding: 12px 14px; border-radius: 18px; text-decoration: none; color: var(--ink);
  background: linear-gradient(120deg, #e6dcfd 0%, #fde2ee 50%, #d6f5e3 100%); border: var(--bw) solid var(--line); box-shadow: var(--pop); }
.se-emoji { font-size: 1.9rem; }
.se-txt { flex: 1; display: flex; flex-direction: column; }
.se-txt b { font-size: 1rem; }
.se-txt small { font-size: .72rem; color: var(--muted); }
.se-go { font-size: 1.5rem; font-weight: 800; color: var(--muted); }
.pv-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; }

.hero-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 4px; }
.hero-card { all: unset; cursor: pointer; box-sizing: border-box; border: var(--bw) solid var(--line); border-radius: 18px; box-shadow: var(--pop); padding: 22px 14px; min-height: 148px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; text-align: center; transition: transform .12s, box-shadow .12s; }
.hero-card:active { transform: translate(2px,2px); box-shadow: 0 0 0 var(--ink); }
.hero-card.pets { background: linear-gradient(160deg,#e0e7ff,#c7d2fe); }
.hero-card.farm { background: linear-gradient(160deg,#dcfce7,#bbf7d0); }
.hero-emoji { font-size: 2.4rem; }
.hero-name { font-size: 1rem; font-weight: 800; }
.hero-sub { font-size: .7rem; color: rgba(0,0,0,.5); font-weight: 600; line-height: 1.3; }
.hero-badge { font-size: .7rem; font-weight: 700; padding: 3px 9px; border-radius: 999px; }
.hero-badge.ready { color: #15803d; background: rgba(34,197,94,.2); }
.hero-badge.plant { color: #b45309; background: rgba(251,191,36,.22); }

.soon-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }

.mg-card { all: unset; cursor: pointer; box-sizing: border-box; border: var(--bw) solid var(--line);
  border-radius: 16px; box-shadow: var(--pop); padding: 16px 12px; display: flex; flex-direction: column;
  align-items: center; gap: 4px; text-align: center; background: linear-gradient(160deg,#fef3c7,#fde68a); }
.mg-card:active { transform: translate(2px,2px); box-shadow: 0 0 0 var(--ink); }
.mg-emoji { font-size: 2rem; }
.mg-name { font-weight: 800; font-size: .9rem; }
.mg-best { font-size: .7rem; color: rgba(0,0,0,.5); font-weight: 600; }

.play-login { text-align: center; color: rgba(0,0,0,.4); padding: 30px 0; font-size: .85rem; }
</style>
