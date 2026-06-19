<template>
  <div class="tab-content">
    <div class="pt-head">
      <button class="pt-back" @click="$router.back()">‹</button>
      <span><Emoji char="🐾" /> สัตว์เลี้ยง</span>
      <HelpButton topic="pets" style="margin-left:auto" />
    </div>

    <template v-if="authStore.isLoggedIn">
      <div class="pt-summary">
        <div><b>{{ pets.length }}</b>/{{ storageCap }} <small>คลัง</small></div>
        <div><b>{{ totalIncome.toLocaleString() }}</b><small><Emoji char="🪙" />/วัน</small></div>
        <div><b>{{ species }}</b><small>สายพันธุ์</small></div>
      </div>
      <div class="pt-hint">แตะตัวไหนก็ได้เพื่อดูสเตตัส · วิวัฒน์ · ใส่ศักยภาพ <Emoji char="⚗️" /></div>

      <div v-if="!sorted.length" class="pt-empty">ยังไม่มีสัตว์เลี้ยง — ไปสุ่มไข่ที่ Shop ก่อนนะ <Emoji char="🥚" /></div>

      <div v-else class="pt-grid">
        <button
          v-for="p in sorted" :key="p.id"
          class="pt-cell" :style="{ borderColor: rarityColor(p.rarity) }"
          @click="sel = p.id"
        >
          <span v-if="p.grade > 0" class="pt-cell-grade">{{ GRADE_LABELS[Math.min(p.grade, GRADE_LABELS.length - 1)] }}</span>
          <span v-if="activeSet.has(p.id)" class="pt-cell-star"><Emoji char="⭐" /></span>
          <span v-if="(p.potential || []).length" class="pt-cell-pot"><Emoji char="⚗️" />{{ p.potential.length }}</span>
          <span v-if="p.copies > 0" class="pt-cell-copies">×{{ p.copies }}</span>
          <span class="pt-cell-emoji"><Emoji :char="p.emoji" /></span>
          <span class="pt-cell-name">{{ p.name }}</span>
        </button>
      </div>
    </template>
    <div v-else class="pt-empty">เข้าสู่ระบบก่อนนะ</div>

    <PetDetailModal :pet-id="sel" @close="sel = null" />
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import Emoji from '../components/shared/Emoji.vue'
import HelpButton from '../components/help/HelpButton.vue'
import { useAuthStore } from '../stores/auth.js'
import { RARITY, GRADE_LABELS } from '../data/index.js'
import { petDailyCoins } from '../utils/petUtils.js'
import { residencePetStorage } from '../data/residence.js'
import PetDetailModal from '../components/pets/PetDetailModal.vue'

const authStore = useAuthStore()
const sel = ref(null)

const pets = computed(() => authStore.userData?.pets || [])
const level = computed(() => authStore.userData?.residence?.level || 1)
const storageCap = computed(() => residencePetStorage(level.value))
const totalIncome = computed(() => pets.value.reduce((s, p) => s + petDailyCoins(p), 0))
const species = computed(() => new Set(pets.value.map(p => p.id)).size)
const activeSet = computed(() => {
  const owned = new Set(pets.value.map(p => p.id))
  return new Set((authStore.userData?.activePets || []).filter(id => owned.has(id)))
})

const rarityColor = (r) => RARITY[r]?.color || '#94a3b8'
const RANK = { legendary: 0, epic: 1, rare: 2, common: 3 }
const sorted = computed(() => pets.value.slice().sort((a, b) =>
  (RANK[a.rarity] - RANK[b.rarity]) || ((b.grade || 0) - (a.grade || 0)) || a.name.localeCompare(b.name)
))
</script>

<style scoped>
.pt-head { display: flex; align-items: center; gap: 8px; font-family: var(--font-display); font-weight: 400; font-size: 1.4rem; color: var(--ink); margin-bottom: 14px; }
.pt-back { border: 2px solid var(--ink); background: #fff; width: 32px; height: 32px; border-radius: 10px; font-size: 1.2rem; cursor: pointer; line-height: 1; box-shadow: var(--pop); }
.pt-back:active { transform: translate(2px,2px); box-shadow: 0 0 0 var(--ink); }
.pt-summary { display: flex; background: #fff; border: 2px solid var(--ink); border-radius: 16px; box-shadow: var(--pop); overflow: hidden; margin-bottom: 10px; }
.pt-summary > div { flex: 1; text-align: center; padding: 12px 4px; border-right: 1px solid var(--border, #efe7fb); }
.pt-summary > div:last-child { border-right: none; }
.pt-summary b { font-size: 1.05rem; font-weight: 800; }
.pt-summary small { display: block; font-size: .58rem; color: rgba(0,0,0,.45); }
.pt-hint { font-size: .66rem; color: rgba(0,0,0,.5); margin-bottom: 12px; }
.pt-empty { text-align: center; color: rgba(0,0,0,.45); padding: 30px 0; font-size: .85rem; }
.pt-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
.pt-cell {
  position: relative; background: #fff; border: 2px solid var(--ink); border-radius: 14px;
  padding: 12px 4px 8px; display: flex; flex-direction: column; align-items: center; gap: 2px;
  cursor: pointer; font-family: inherit; box-shadow: var(--pop);
  transition: transform .1s, box-shadow .1s;
}
.pt-cell:active { transform: translate(2px,2px); box-shadow: 0 0 0 var(--ink); }
.pt-cell-emoji { font-size: 1.8rem; line-height: 1; }
.pt-cell-name { font-size: .56rem; font-weight: 700; color: rgba(0,0,0,.6); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; }
.pt-cell-grade { position: absolute; top: -5px; left: -5px; background: #1e293b; color: #fff; font-size: .54rem; font-weight: 800; padding: 1px 5px; border-radius: 999px; border: 2px solid #fff; }
.pt-cell-pot { position: absolute; top: -5px; right: -5px; background: #7c3aed; color: #fff; font-size: .5rem; font-weight: 800; padding: 1px 4px; border-radius: 999px; border: 2px solid #fff; }
.pt-cell-star { position: absolute; bottom: 2px; right: 3px; font-size: .7rem; }
.pt-cell-copies { position: absolute; bottom: 2px; left: 4px; font-size: .54rem; font-weight: 800; color: rgba(0,0,0,.4); }
</style>
