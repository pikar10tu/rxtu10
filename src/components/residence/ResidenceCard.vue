<template>
  <div class="res-card" :style="{ borderColor: currentTier.frameColor }">
    <div class="res-head">
      <div class="res-art" :style="{ background: currentTier.frameColor + '22' }">{{ currentTier.art }}</div>
      <div class="res-meta">
        <div class="res-name">
          {{ currentTier.tierName }}
          <span class="res-lv" :style="{ background: currentTier.frameColor }">Lv.{{ level }}</span>
        </div>
        <div class="res-income">💰 รายได้/วัน <b>{{ currentTier.dailyIncome.toLocaleString() }}</b>🪙</div>
      </div>
    </div>

    <!-- progress to next tier -->
    <template v-if="!isMax">
      <div class="res-next">
        เลเวลถัดไป: {{ next.art }} {{ next.tierName }}
        <span class="res-next-income">(+{{ (next.dailyIncome - currentTier.dailyIncome).toLocaleString() }}🪙/วัน)</span>
      </div>
      <button
        class="res-upgrade"
        :class="{ ok: canAfford }"
        :style="canAfford ? { background: currentTier.frameColor } : {}"
        @click="upgrade"
      >
        ⬆️ อัปเกรด · {{ next.upgradeCost.toLocaleString() }}🪙
      </button>
      <div v-if="!canAfford" class="res-need">
        ขาดอีก {{ (next.upgradeCost - coins).toLocaleString() }}🪙
      </div>
    </template>
    <div v-else class="res-max">🏰 ระดับสูงสุดแล้ว!</div>
  </div>
</template>

<script setup>
import { useResidence } from '../../composables/useResidence.js'

const { level, currentTier, next, isMax, coins, canAfford, upgrade } = useResidence()
</script>

<style scoped>
.res-card {
  background: #fff;
  border: 2px solid;
  border-radius: 16px;
  padding: 14px;
  margin-bottom: 14px;
}
.res-head { display: flex; align-items: center; gap: 12px; }
.res-art {
  width: 56px; height: 56px;
  display: flex; align-items: center; justify-content: center;
  font-size: 2rem; border-radius: 14px; flex-shrink: 0;
}
.res-meta { flex: 1; min-width: 0; }
.res-name { font-size: 1rem; font-weight: 800; display: flex; align-items: center; gap: 8px; }
.res-lv { color: #fff; font-size: .62rem; font-weight: 800; padding: 2px 8px; border-radius: 999px; }
.res-income { font-size: .76rem; color: rgba(0,0,0,.55); margin-top: 2px; }
.res-income b { color: #b45309; }
.res-next { font-size: .72rem; color: rgba(0,0,0,.55); margin: 12px 0 8px; }
.res-next-income { color: #059669; font-weight: 700; }
.res-upgrade {
  width: 100%;
  border: none; border-radius: 12px;
  padding: 11px; font-family: inherit; font-size: .86rem; font-weight: 800;
  color: #fff; background: rgba(0,0,0,.25); cursor: pointer;
  transition: transform .12s, opacity .12s;
}
.res-upgrade.ok:active { transform: scale(.98); }
.res-upgrade:not(.ok) { opacity: .55; cursor: not-allowed; }
.res-need { text-align: center; font-size: .66rem; color: #ef4444; margin-top: 6px; }
.res-max { text-align: center; font-weight: 800; color: #f59e0b; padding: 12px 0 4px; }
</style>
