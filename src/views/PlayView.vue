<template>
  <div class="tab-content">
    <div class="page-title pv-head"><span><Emoji char="🎮" /> Play</span><span class="pv-right"><span v-if="authStore.isLoggedIn" class="pv-coins"><Emoji char="🪙" /> {{ (authStore.userData?.coins || 0).toLocaleString() }}</span><HelpButton topic="play" /></span></div>

    <template v-if="authStore.isLoggedIn">
      <!-- ── ห้องโถงเกม (แบบ A — user เลือก 3 ต.ค. 2026): การ์ดใหญ่โชว์ของจริง + ปุ่มลัด ── -->
      <div class="hall pet">
        <span v-if="petModeDot" class="nav-dot hall-dot" aria-label="มีรางวัลรอรับ"></span>
        <RouterLink to="/play/pets" class="hall-top">
          <span class="hall-name"><Emoji char="🐾" /> โหมดเพ็ท</span>
          <span class="hall-go">เข้าโหมด ›</span>
        </RouterLink>
        <RouterLink to="/team" class="hall-team" aria-label="จัดทีม">
          <span v-for="(m, i) in teamFaces" :key="i" class="hall-face" :class="{ empty: !m }" :style="m ? { '--rc': m.color } : null">
            <template v-if="m"><Emoji :char="m.emoji" /><i class="hall-el"><Emoji :char="m.el" /></i></template>
            <template v-else>＋</template>
          </span>
        </RouterLink>
        <div class="hall-acts">
          <RouterLink to="/team" class="act hot"><Emoji char="⚔️" /> จัดทีม</RouterLink>
          <RouterLink to="/tower" class="act"><Emoji char="🏯" /> หอคอย ชั้น {{ authStore.userData?.towerBest || 0 }}</RouterLink>
          <RouterLink v-if="pvpOpen || authStore.isAdmin" to="/arena" class="act"><Emoji char="🥊" /> ประลอง</RouterLink>
          <RouterLink to="/pets" class="act"><Emoji char="📦" /> คลัง {{ petCount }}</RouterLink>
        </div>
      </div>

      <div class="hall farm">
        <span v-if="readyCount" class="nav-dot hall-dot" aria-hidden="true"></span>
        <RouterLink to="/play/farm" class="hall-top">
          <span class="hall-name"><Emoji char="🌱" /> โหมดฟาร์ม</span>
          <span class="hall-go">เข้าฟาร์ม ›</span>
        </RouterLink>
        <RouterLink to="/play/farm" class="hall-plots" :aria-label="`แปลงพร้อมเก็บ ${readyCount} ว่าง ${emptyCount}`">
          <span v-for="(c, i) in plotCells" :key="i" class="plot" :class="c.state">
            <Emoji v-if="c.emoji" :char="c.emoji" /><template v-else-if="c.state === 'empty'">＋</template>
          </span>
        </RouterLink>
        <div class="hall-acts">
          <RouterLink v-if="readyCount" to="/play/farm" class="act hot"><Emoji char="🧺" /> เก็บได้ {{ readyCount }} แปลง</RouterLink>
          <RouterLink v-else-if="emptyCount" to="/play/farm" class="act hot">＋ ว่าง {{ emptyCount }} แปลง ไปปลูก</RouterLink>
          <span v-else class="act calm">กำลังโตทุกแปลง</span>
        </div>
      </div>

      <!-- ── ร้านค้า 3 ร้าน — เข้าตรงแท็บของร้าน (ShopView รับ ?tab=) ── -->
      <SectionTitle><Emoji char="🛍️" /> ร้านค้า</SectionTitle>
      <div class="shops">
        <RouterLink to="/shop?tab=pet" class="shop s-pet">
          <span v-if="dustDot" class="nav-dot shop-dot" aria-label="มีตัวซ้ำรอแปลงเป็นประกายดาว"></span>
          <Emoji char="🥚" /><b>อัญเชิญ</b>
        </RouterLink>
        <RouterLink to="/shop?tab=farm" class="shop s-farm"><Emoji char="🌾" /><b>ร้านฟาร์ม</b></RouterLink>
        <RouterLink to="/shop?tab=style" class="shop s-style"><Emoji char="🎀" /><b>แต่งตัว</b></RouterLink>
      </div>

      <!-- กระดานข่าว ย้ายลงมาใต้เกม (การ์ดเกมต้องเห็นก่อนในจอแรก) -->
      <NewsBoard />

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
    <template v-else>
      <NewsBoard />
      <div class="play-login">เข้าสู่ระบบเพื่อเล่น</div>
    </template>
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
import { useNavDots } from '../composables/useNavDots.js'
import { resolveBattleTeam } from '../utils/petTeam.js'
import { getPetDef, RARITY, ELEMENTS } from '../data/index.js'
import { getCrop } from '../data/crops.js'
import { BATTLE_SLOTS } from '../data/residence.js'

const authStore = useAuthStore()
const { arcadeOpen, pvpOpen } = useAppConfig()   // มินิเกมซ่อนจากทุกคนรวมแอดมิน (27 ส.ค.)
const farm = useFarm()
const { petModeDot, dustDot } = useNavDots()
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

// การ์ดเพ็ท: ทีมที่ใช้อยู่ (เหมือนหน้าโหมดเพ็ท) + สีระดับ + สาย
const team = computed(() => resolveBattleTeam(authStore.userData?.activePets, authStore.userData?.pets))
const teamFaces = computed(() => Array.from({ length: BATTLE_SLOTS }, (_, i) => {
  const u = team.value[i]; const def = u && getPetDef(u.id)
  if (!def) return null
  return { emoji: def.emoji, color: (RARITY[u.rarity || def.rarity] || RARITY.common).color, el: ELEMENTS[def.element]?.emoji || '✊' }
}))
const petCount = computed(() => (authStore.userData?.pets || []).length)
// การ์ดฟาร์ม: แปลงย่อ (สูงสุด 10 ช่องแรก) — พร้อมเก็บ = กรอบทอง · ว่าง = ＋
const plotCells = computed(() => farm.plots.value.slice(0, 10).map(p => {
  if (!p) return { state: 'empty' }
  const ready = farm.status(p, now.value).ready
  return { state: ready ? 'ready' : 'grow', emoji: ready ? getCrop(p.seedId)?.emoji : '🌱' }
}))
</script>

<style scoped>

.pv-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.pv-right { display: flex; align-items: center; gap: 8px; }
.pv-coins { font-size: .82rem; font-weight: 700; color: var(--ink); background: #fff; border: var(--bw) solid var(--line); border-radius: 999px; padding: 3px 10px; }
.hall { position: relative; margin-top: 10px; padding: 14px; border-radius: 22px; border: var(--bw) solid var(--line); box-shadow: var(--pop); }
.hall.pet { background: linear-gradient(150deg, #ece8ff, #d9d2ff); }
.hall.farm { background: linear-gradient(150deg, #e3f8ec, #c6efd8); }
.hall-dot { top: 10px; right: 10px; width: 12px; height: 12px; }
.hall-top { display: flex; align-items: baseline; justify-content: space-between; text-decoration: none; color: var(--ink); padding-right: 18px; }
.hall-name { font-size: 1.05rem; font-weight: 800; }
.hall-go { font-size: .76rem; font-weight: 700; color: var(--muted); }
.hall-team { display: flex; gap: 8px; margin-top: 12px; text-decoration: none; }
.hall-face { position: relative; width: 58px; height: 58px; border-radius: 16px; display: grid; place-items: center; font-size: 1.9rem; background: rgba(255,255,255,.75); border: 2px solid var(--rc, var(--line)); color: var(--ink); }
.hall-face.empty { border-style: dashed; border-color: #b9a6ef; color: #9a86e0; font-size: 1.2rem; }
.hall-el { position: absolute; right: -4px; bottom: -4px; font-style: normal; font-size: .8rem; background: #fff; border-radius: 999px; padding: 1px 3px; border: var(--bw) solid var(--line); }
.hall-plots { display: grid; grid-template-columns: repeat(5, 1fr); gap: 5px; margin-top: 12px; text-decoration: none; color: var(--muted); }
.plot { aspect-ratio: 1; max-width: 100%; border-radius: 10px; display: grid; place-items: center; font-size: 1.05rem; background: rgba(255,255,255,.6); border: var(--bw) solid var(--line); }
.plot.ready { background: #fff; box-shadow: 0 0 0 2px var(--gold, #f59e0b); }
.plot.empty { border-style: dashed; font-size: .9rem; }
.hall-acts { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 12px; }
.act { display: inline-flex; align-items: center; gap: 4px; padding: 6px 11px; border-radius: 999px; font-size: .78rem; font-weight: 700; text-decoration: none; color: var(--ink); background: #fff; border: var(--bw) solid var(--line); }
.act.hot { background: var(--ink); color: #fff; border-color: var(--ink); }
.act.calm { color: var(--muted); background: rgba(255,255,255,.6); }
.shops { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 14px; }
.shop { position: relative; display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 14px 6px; border-radius: 16px; border: var(--bw) solid var(--line); box-shadow: var(--pop); text-decoration: none; color: var(--ink); font-size: 1.7rem; }
.shop b { font-size: .8rem; }
.s-pet { background: #efedff; } .s-farm { background: var(--mint-light); } .s-style { background: var(--accent-light); }
.shop-dot { top: 8px; right: 8px; width: 11px; height: 11px; }
.hall-top:focus-visible, .hall-team:focus-visible, .hall-plots:focus-visible, .act:focus-visible, .shop:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }
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
