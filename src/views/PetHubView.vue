<template>
  <div class="tab-content">
    <div class="page-title ph-head">
      <RouterLink to="/play" class="ph-back" aria-label="กลับ">‹</RouterLink>
      <span><Emoji char="🐾" /> โหมดเพ็ท</span>
      <HelpButton topic="pets" />
    </div>

    <!-- การ์ดหัว: ทีมต่อสู้ + ตัวเลขหลัก · แตะ = ไปคลัง/จัดทีม -->
    <RouterLink to="/pets" class="ph-hero">
      <div class="ph-hero-top">
        <b>ทีมของฉัน</b>
        <span class="ph-hero-go">คลัง · จัดทีม ›</span>
      </div>
      <div class="ph-team">
        <span v-for="(e, i) in teamEmojis" :key="i" class="ph-team-pet" :class="{ empty: !e }"><Emoji v-if="e" :char="e" /><template v-else>＋</template></span>
      </div>
      <div class="ph-stats">
        <span><b>{{ petCount }}</b> ตัว</span>
        <span><b>{{ legendCount }}</b> เลเจนด์</span>
        <span>หอคอยชั้น <b>{{ authStore.userData?.towerBest || 0 }}</b></span>
      </div>
    </RouterLink>

    <div class="play-grid">
      <!-- ร้านเพ็ทไม่ต้องมีที่นี่ — เข้าจากปุ่มร้านค้าบนสุดของหน้าเกมที่เดียว (user สั่ง 25 ก.ย. 2026) -->
      <RouterLink to="/tower" class="game-card gc-tower">
        <span class="gc-emoji"><Emoji char="🏯" /></span>
        <span class="gc-name">ปีนหอคอย</span>
        <span class="gc-badge grow">ไต่ชั้น · เพิ่มรายได้รายวัน</span>
      </RouterLink>

      <RouterLink v-if="pvpOpen || authStore.isAdmin" to="/arena" class="game-card gc-arena">
        <span class="gc-emoji"><Emoji char="⚔️" /></span>
        <span class="gc-name">สนามประลอง</span>
        <span class="gc-badge grow">PvP · แต้มประลอง</span>
      </RouterLink>
      <SoonCard v-else emoji="⚔️" label="สนามประลอง" />

      <!-- ส่งผจญภัยพับเก็บ 25 ก.ย. 2026 (user เห็นด้วย: ไม่มีคนใช้ ซ้อนกับรายได้รายวัน · ไอเดียไปต่อใน world boss #11) — โค้ด/route/ข้อมูลเก็บไว้ ไม่ลบ -->

      <SoonCard emoji="🐲" label="บอสรวมรุ่น" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import Emoji from '../components/shared/Emoji.vue'
import SoonCard from '../components/shared/SoonCard.vue'
import HelpButton from '../components/help/HelpButton.vue'
import { useAuthStore } from '../stores/auth.js'
import { useAppConfig } from '../composables/useAppConfig.js'
import { useExpedition } from '../composables/useExpedition.js'
import { expeditionState } from '../utils/expedition.js'
import { resolveBattleTeam } from '../utils/petTeam.js'
import { getPetDef } from '../data/index.js'
import { BATTLE_SLOTS } from '../data/residence.js'

const authStore = useAuthStore()
const { pvpOpen, expeditionOpen } = useAppConfig()
const { exp } = useExpedition()
// การ์ดหัว
const team = computed(() => resolveBattleTeam(authStore.userData?.activePets, authStore.userData?.pets))
const teamEmojis = computed(() => Array.from({ length: BATTLE_SLOTS }, (_, i) => getPetDef(team.value[i]?.id)?.emoji || null))
const petCount = computed(() => (authStore.userData?.pets || []).length)
const legendCount = computed(() => (authStore.userData?.pets || []).filter(p => p?.rarity === 'legendary').length)

// coarse tick (5s) ให้ badge ส่งผจญภัยสด
const now = ref(Date.now())
let timer = null
onMounted(() => { timer = setInterval(() => { now.value = Date.now() }, 5000) })
onUnmounted(() => clearInterval(timer))

const expState = computed(() => expeditionState(exp.value, now.value))
</script>

<style scoped>
.ph-head { display: flex; align-items: center; gap: 8px; }
.ph-back { text-decoration: none; color: var(--ink); font-size: 1.6rem; font-weight: 800; line-height: 1; width: 24px; }

/* การ์ดเกม (ยกจาก PlayView เดิม) */
.play-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.game-card { all: unset; cursor: pointer; box-sizing: border-box; background: #e2f7f0; border: var(--bw) solid var(--line); border-radius: 16px; box-shadow: var(--pop); padding: 16px 10px; display: flex; flex-direction: column; align-items: center; gap: 5px; transition: transform .12s, box-shadow .12s; }
.game-card:active { transform: translate(2px,2px); box-shadow: 0 0 0 var(--ink); }
.gc-emoji { font-size: 1.6rem; }
.gc-name { font-size: .8rem; font-weight: 800; }
.gc-badge { font-size: .7rem; font-weight: 700; padding: 2px 8px; border-radius: 999px; }
.gc-badge.ready { color: #15803d; background: rgba(34,197,94,.16); }
.gc-badge.plant { color: #b45309; background: rgba(251,191,36,.18); }
.gc-badge.grow  { color: rgba(0,0,0,.45); background: rgba(0,0,0,.05); }

/* ═══ จัดใหม่ 25 ก.ย. 2026 ═══ */
.ph-hero { display: block; text-decoration: none; color: var(--ink); margin: 6px 0 12px; padding: 14px; border-radius: 22px;
  background: linear-gradient(140deg, #e6dcfd 0%, #fff 55%, #fde2ee 100%); border: var(--bw) solid var(--line); box-shadow: var(--pop); }
.ph-hero-top { display: flex; align-items: baseline; justify-content: space-between; }
.ph-hero-top b { font-size: .95rem; }
.ph-hero-go { font-size: .74rem; font-weight: 700; color: #6246b8; }
.ph-team { display: flex; justify-content: center; gap: 10px; margin: 12px 0; }
.ph-team-pet { width: 62px; height: 62px; border-radius: 18px; display: grid; place-items: center; font-size: 2.1rem; background: #fff; box-shadow: var(--pop); }
.ph-team-pet.empty { background: rgba(255,255,255,.6); border: 2px dashed #c9b8f4; box-shadow: none; color: #b9a6ef; font-size: 1.3rem; }
.ph-stats { display: flex; justify-content: center; gap: 14px; font-size: .74rem; color: var(--muted); }
.ph-stats b { color: var(--ink); font-size: .9rem; }
.play-grid { gap: 10px; }
.game-card { --gc: #e6dcfd; background: linear-gradient(160deg, var(--gc), #fff 75%); border-radius: 18px; padding: 14px 8px; box-shadow: var(--pop); transition: transform .12s; }
.game-card:active { transform: translateY(1px); box-shadow: var(--pop); }
.gc-emoji { font-size: 2rem; }
.gc-name { font-size: .86rem; }
.gc-shop { --gc: #fde2ee; } .gc-tower { --gc: #e6dcfd; } .gc-arena { --gc: #fbd5e3; } .gc-exp { --gc: #d6f5e3; }
</style>
