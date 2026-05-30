<template>
  <div class="daily-card">
    <div class="dc-coins">
      <span class="dc-coins-label">เหรียญของคุณ</span>
      <span class="dc-coins-val">{{ coins.toLocaleString() }} 🪙</span>
    </div>

    <div class="dc-breakdown">
      <div class="dc-row"><span>🏠 ที่อยู่อาศัย</span><b>+{{ baseIncome.toLocaleString() }}</b></div>
      <div class="dc-row"><span>🐾 สัตว์เลี้ยงในคลัง</span><b>+{{ petIncome.toLocaleString() }}</b></div>
      <div v-if="bonusPct" class="dc-row dc-bonus"><span>💖 โบนัสซัพพอร์ตเตอร์</span><b>+{{ bonusPct }}%</b></div>
      <div class="dc-row dc-total"><span>รวมต่อวัน</span><b>+{{ total.toLocaleString() }}🪙</b></div>
    </div>

    <button class="dc-claim" :class="{ ready: claimable }" :disabled="!claimable" @click="claim">
      {{ claimable ? `💰 รับรายได้ +${total.toLocaleString()}🪙` : '✓ รับวันนี้แล้ว' }}
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '../../stores/auth.js'
import { useDaily } from '../../composables/useDaily.js'

const auth = useAuthStore()
const coins = computed(() => auth.userData?.coins || 0)
const { baseIncome, petIncome, bonusPct, total, claimable, claim } = useDaily()
</script>

<style scoped>
.daily-card {
  background: linear-gradient(135deg, #fffbeb, #fff);
  border: 1px solid rgba(251, 191, 36, .35);
  border-radius: 16px;
  padding: 14px;
  margin-bottom: 14px;
}
.dc-coins {
  display: flex; align-items: baseline; justify-content: space-between;
  margin-bottom: 10px;
}
.dc-coins-label { font-size: .72rem; color: rgba(0,0,0,.5); }
.dc-coins-val { font-size: 1.4rem; font-weight: 800; color: #b45309; }
.dc-breakdown {
  background: rgba(0,0,0,.03); border-radius: 10px; padding: 8px 12px; margin-bottom: 10px;
}
.dc-row {
  display: flex; justify-content: space-between; align-items: center;
  font-size: .76rem; color: rgba(0,0,0,.6); padding: 3px 0;
}
.dc-row b { color: #059669; }
.dc-bonus b { color: #ec4899; }
.dc-total {
  border-top: 1px dashed rgba(0,0,0,.12); margin-top: 4px; padding-top: 6px;
  font-weight: 800; color: rgba(0,0,0,.8);
}
.dc-total b { color: #b45309; }
.dc-claim {
  width: 100%; border: none; border-radius: 12px; padding: 11px;
  font-family: inherit; font-size: .86rem; font-weight: 800; color: #fff;
  background: rgba(0,0,0,.25); cursor: pointer; transition: transform .12s;
}
.dc-claim.ready { background: linear-gradient(135deg, #f59e0b, #d97706); }
.dc-claim.ready:active { transform: scale(.98); }
.dc-claim:disabled { cursor: default; opacity: .6; }
</style>
