<template>
  <div class="tab-content">
    <div class="pt-head">
      <button class="pt-back" @click="$router.back()">‹</button>
      <span>🧪 สัตว์เลี้ยง & ห้องทดลอง</span>
    </div>

    <template v-if="authStore.isLoggedIn">
      <div class="pt-summary">
        <div><b>{{ pets.length }}</b>/{{ storageCap }} <small>คลัง</small></div>
        <div><b>{{ totalIncome.toLocaleString() }}</b><small>🪙/วัน</small></div>
        <div><b>{{ groups.length }}</b><small>สายพันธุ์</small></div>
      </div>
      <div class="pt-hint">🧪 มีตัวซ้ำสายพันธุ์เดียวกัน → วิวัฒน์เพิ่มเกรด (รายได้+พลังสู้เพิ่ม)</div>

      <div v-if="!groups.length" class="pt-empty">ยังไม่มีสัตว์เลี้ยง — ไปสุ่มไข่ที่ Shop ก่อนนะ 🥚</div>

      <div v-else class="pt-list">
        <div v-for="g in groups" :key="g.id" class="pt-card" :style="{ borderColor: rarityColor(g.rarity) + '55' }">
          <div class="pt-emoji" :style="{ background: rarityColor(g.rarity) + '18' }">{{ g.emoji }}</div>
          <div class="pt-info">
            <div class="pt-name">
              {{ g.name }}
              <span class="pt-grade" v-if="g.bestGrade > 0">{{ GRADE_LABELS[g.bestGrade] }}</span>
              <span class="pt-count">×{{ g.count }}</span>
            </div>
            <div class="pt-sub" :style="{ color: rarityColor(g.rarity) }">{{ rarityLabel(g.rarity) }} · {{ g.income.toLocaleString() }}🪙/วัน</div>
            <div class="pt-evo-info">
              <template v-if="g.bestGrade >= 12">เกรดสูงสุดแล้ว 👑</template>
              <template v-else>วิวัฒน์ → {{ GRADE_LABELS[g.bestGrade + 1] }} · ใช้ตัวซ้ำ {{ g.need }} ({{ g.dupes }}/{{ g.need }})</template>
            </div>
          </div>
          <button
            v-if="g.bestGrade < 12"
            class="pt-evo" :class="{ ok: g.canEvolve }"
            :disabled="!g.canEvolve || busy"
            @click="evolve(g.id)"
          >วิวัฒน์</button>
        </div>
      </div>
    </template>
    <div v-else class="pt-empty">เข้าสู่ระบบก่อนนะ</div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase/config.js'
import { useAuthStore } from '../stores/auth.js'
import { useToast } from '../composables/useToast.js'
import { RARITY, GRADE_LABELS, GRADE_COPIES } from '../data/index.js'
import { petDailyCoins } from '../utils/petUtils.js'
import { residencePetStorage } from '../data/residence.js'

const authStore = useAuthStore()
const { toast } = useToast()

const pets = computed(() => authStore.userData?.pets || [])
const level = computed(() => authStore.userData?.residence?.level || 1)
const storageCap = computed(() => residencePetStorage(level.value))
const totalIncome = computed(() => pets.value.reduce((s, p) => s + petDailyCoins(p), 0))
const busy = ref(false)

const rarityColor = (r) => RARITY[r]?.color || '#94a3b8'
const rarityLabel = (r) => RARITY[r]?.label || r
const RARITY_RANK = { legendary: 0, epic: 1, rare: 2, common: 3 }

const groups = computed(() => {
  const m = {}
  for (const p of pets.value) (m[p.id] ||= []).push(p)
  return Object.values(m).map(list => {
    list.sort((a, b) => (b.grade || 0) - (a.grade || 0))
    const best = list[0]
    const bestGrade = best.grade || 0
    const dupes = list.length - 1
    const need = bestGrade < 12 ? GRADE_COPIES[bestGrade + 1] : 0
    return {
      id: best.id, name: best.name, emoji: best.emoji, rarity: best.rarity,
      count: list.length, bestGrade, dupes, need,
      canEvolve: bestGrade < 12 && dupes >= need,
      income: list.reduce((s, p) => s + petDailyCoins(p), 0),
    }
  }).sort((a, b) => (RARITY_RANK[a.rarity] - RARITY_RANK[b.rarity]) || (b.bestGrade - a.bestGrade))
})

async function evolve(speciesId) {
  if (busy.value) return
  const list = pets.value.filter(p => p.id === speciesId).slice().sort((a, b) => (b.grade || 0) - (a.grade || 0))
  const base = list[0]
  if (!base) return
  const nextGrade = (base.grade || 0) + 1
  if (nextGrade > 12) { toast('เกรดสูงสุดแล้ว', 'info'); return }
  const need = GRADE_COPIES[nextGrade]
  const dupes = list.slice(1).sort((a, b) => (a.grade || 0) - (b.grade || 0)) // consume lowest-grade first
  if (dupes.length < need) { toast(`ต้องการตัวซ้ำอีก ${need - dupes.length} ตัว`, 'info'); return }

  const consume = new Set(dupes.slice(0, need).map(p => p.instId))
  const newPets = pets.value
    .filter(p => !consume.has(p.instId))
    .map(p => (p.instId === base.instId ? { ...p, grade: nextGrade } : p))

  busy.value = true
  authStore.blockSnapshot()
  authStore.setUserDataOptimistic({ pets: newPets })
  try {
    await updateDoc(doc(db, 'users', authStore.currentUser.uid), { pets: newPets })
    toast(`วิวัฒน์ ${base.emoji} ${base.name} → เกรด ${GRADE_LABELS[nextGrade]}!`, 'success')
  } catch (e) {
    console.error('[evolve]', e)
    toast('วิวัฒน์ไม่สำเร็จ', 'error')
  } finally {
    busy.value = false
  }
}
</script>

<style scoped>
.pt-head { display: flex; align-items: center; gap: 8px; font-size: 1.1rem; font-weight: 800; margin-bottom: 14px; }
.pt-back { border: none; background: rgba(0,0,0,.05); width: 30px; height: 30px; border-radius: 9px; font-size: 1.2rem; cursor: pointer; line-height: 1; }
.pt-summary { display: flex; background: #fff; border: 1px solid var(--border, #efe7fb); border-radius: 14px; overflow: hidden; margin-bottom: 8px; }
.pt-summary > div { flex: 1; text-align: center; padding: 12px 4px; border-right: 1px solid var(--border, #efe7fb); }
.pt-summary > div:last-child { border-right: none; }
.pt-summary b { font-size: 1.05rem; font-weight: 800; }
.pt-summary small { display: block; font-size: .58rem; color: rgba(0,0,0,.45); }
.pt-hint { font-size: .66rem; color: rgba(0,0,0,.5); margin-bottom: 12px; }
.pt-empty { text-align: center; color: rgba(0,0,0,.45); padding: 30px 0; font-size: .85rem; }
.pt-list { display: flex; flex-direction: column; gap: 8px; }
.pt-card { display: flex; align-items: center; gap: 11px; background: #fff; border: 1.5px solid; border-radius: 14px; padding: 10px; box-shadow: 0 2px 8px rgba(170,140,210,.08); }
.pt-emoji { width: 50px; height: 50px; display: flex; align-items: center; justify-content: center; font-size: 1.8rem; border-radius: 12px; flex-shrink: 0; }
.pt-info { flex: 1; min-width: 0; }
.pt-name { font-size: .88rem; font-weight: 800; display: flex; align-items: center; gap: 6px; }
.pt-grade { font-size: .58rem; background: #1e293b; color: #fff; padding: 1px 6px; border-radius: 6px; }
.pt-count { font-size: .66rem; color: rgba(0,0,0,.45); font-weight: 600; }
.pt-sub { font-size: .66rem; font-weight: 700; }
.pt-evo-info { font-size: .6rem; color: rgba(0,0,0,.45); margin-top: 2px; }
.pt-evo { flex-shrink: 0; border: none; border-radius: 10px; padding: 9px 12px; font-family: inherit; font-size: .76rem; font-weight: 800; color: #fff; background: rgba(0,0,0,.2); cursor: pointer; }
.pt-evo.ok { background: linear-gradient(135deg, #c4a5f5, #f7a8c4); }
.pt-evo:disabled { cursor: default; }
.pt-evo.ok:active { transform: scale(.96); }
</style>
