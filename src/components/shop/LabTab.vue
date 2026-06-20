<template>
  <div class="lab">
    <!-- ยอด copies -->
    <div class="lab-bal">
      <div v-for="r in RARITIES" :key="r" class="lab-bal-cell" :style="{ borderColor: rarityColor(r) }">
        <span class="lab-bal-n" :style="{ color: rarityColor(r) }">{{ copyTotal(r) }}</span>
        <span class="lab-bal-l">{{ RARITY[r]?.label }}</span>
      </div>
    </div>

    <!-- fusion -->
    <div class="lab-card">
      <div class="lab-card-h"><Emoji char="🧪" /> หลอมไต่ระดับ</div>
      <div v-for="src in FUSE_SRC" :key="src" class="lab-fuse">
        <span class="lab-fuse-txt">{{ RARITY[src]?.label }} → {{ RARITY[nextRarity(src)]?.label }}</span>
        <span class="lab-fuse-cost">{{ FUSION_COST[src] }} copies</span>
        <button class="lab-btn" :class="{ ok: copyTotal(src) >= FUSION_COST[src] }"
          :disabled="busy || copyTotal(src) < FUSION_COST[src]"
          @click="openFusion(src)">หลอม</button>
      </div>
    </div>

    <!-- redeem -->
    <div class="lab-card">
      <div class="lab-card-h"><Emoji char="🪙" /> แลกเป็นเหรียญ</div>
      <div v-for="r in RARITIES" :key="r" class="lab-fuse">
        <span class="lab-fuse-txt">{{ RARITY[r]?.label }}</span>
        <span class="lab-fuse-cost">{{ REDEEM_COIN[r].toLocaleString() }}/copy</span>
        <button class="lab-btn" :class="{ ok: copyTotal(r) > 0 }"
          :disabled="busy || copyTotal(r) === 0"
          @click="openRedeem(r)">แลก</button>
      </div>
    </div>

    <!-- spend picker -->
    <SpendCopiesModal v-if="pending" :rarity="pending.rarity" :mode="pending.mode" :required="pending.required"
      @confirm="onConfirm" @cancel="pending = null" />

    <!-- fusion reveal -->
    <Teleport to="body">
      <div v-if="reveal" class="ov" @click.self="reveal = null">
        <div class="rv-box">
          <div class="rv-label">หลอมได้!</div>
          <div class="rv-emoji" :style="{ filter: `drop-shadow(0 0 14px ${rarityColor(reveal.rarity)})` }"><Emoji :char="reveal.emoji" /></div>
          <div class="rv-nm">{{ reveal.name }}</div>
          <div class="rv-badge" :style="{ background: rarityColor(reveal.rarity) }">{{ reveal.isNew ? 'ใหม่!' : '+1 copy' }}</div>
          <button class="rv-ok" @click="reveal = null">เยี่ยม!</button>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import Emoji from '../shared/Emoji.vue'
import { increment } from 'firebase/firestore'
import { useAuthStore } from '../../stores/auth.js'
import { useToast } from '../../composables/useToast.js'
import { PETS, RARITY } from '../../data/index.js'
import { mergeRolls } from '../../utils/gachaMerge.js'
import { FUSION_COST, REDEEM_COIN, nextRarity, rarityCopyTotal, applyCopySpend, fuseRoll, redeemValue } from '../../utils/lab.js'
import SpendCopiesModal from './SpendCopiesModal.vue'

const auth = useAuthStore()
const { toast } = useToast()

const RARITIES = ['common', 'rare', 'epic', 'legendary']
const FUSE_SRC = ['common', 'rare', 'epic']
const pets = computed(() => auth.userData?.pets || [])
const copyTotal = (r) => rarityCopyTotal(pets.value, r)
const rarityColor = (r) => RARITY[r]?.color || '#94a3b8'

const pending = ref(null) // { mode, rarity, required }
const reveal = ref(null)  // summary entry
const busy = ref(false)

function openFusion(src) { pending.value = { mode: 'fusion', rarity: src, required: FUSION_COST[src] } }
function openRedeem(r) { pending.value = { mode: 'redeem', rarity: r, required: 0 } }

async function onConfirm(allocation) {
  if (busy.value || !pending.value) return
  const { mode, rarity } = pending.value
  pending.value = null
  busy.value = true
  try {
    const petsAfter = applyCopySpend(pets.value, allocation)
    if (mode === 'fusion') {
      const id = fuseRoll(rarity, PETS)
      const { pets: finalPets, summary } = mergeRolls(petsAfter, [{ id }], PETS)
      const ok = await auth.patchUser({ pets: finalPets }, { pets: finalPets })
      if (ok) reveal.value = summary[0]
      else toast('หลอมไม่สำเร็จ', 'error')
    } else {
      const gain = redeemValue(allocation, rarity)
      const ok = await auth.patchUser(
        { pets: petsAfter, coins: (auth.userData?.coins || 0) + gain },
        { pets: petsAfter, coins: increment(gain) },
      )
      toast(ok ? `ได้ ${gain.toLocaleString()} เหรียญ` : 'แลกไม่สำเร็จ', ok ? 'success' : 'error')
    }
  } catch (e) {
    console.error('[lab]', e); toast('ทำรายการไม่สำเร็จ', 'error')
  } finally {
    busy.value = false
  }
}
</script>

<style scoped>
.lab { display: flex; flex-direction: column; gap: 12px; }
.lab-bal { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; }
.lab-bal-cell { display: flex; flex-direction: column; align-items: center; border: 2px solid; border-radius: 11px; padding: 8px 2px; background: #fff; }
.lab-bal-n { font-size: 1.2rem; font-weight: 800; }
.lab-bal-l { font-size: .52rem; font-weight: 700; color: rgba(0,0,0,.5); }
.lab-card { background: #fff; border: 2px solid var(--ink); border-radius: 16px; padding: 12px; box-shadow: var(--pop); }
.lab-card-h { font-weight: 800; font-size: .9rem; margin-bottom: 10px; }
.lab-fuse { display: flex; align-items: center; gap: 8px; padding: 6px 0; border-top: 1px solid rgba(0,0,0,.06); }
.lab-fuse:first-of-type { border-top: none; }
.lab-fuse-txt { flex: 1; font-size: .78rem; font-weight: 700; }
.lab-fuse-cost { font-size: .64rem; color: rgba(0,0,0,.5); font-weight: 700; }
.lab-btn { border: 2px solid var(--ink); border-radius: 10px; padding: 7px 14px; font-family: inherit; font-weight: 800; font-size: .76rem; color: #fff; background: #c9c2d4; cursor: pointer; }
.lab-btn.ok { background: var(--primary); box-shadow: var(--pop); }
.lab-btn:disabled { opacity: .55; cursor: default; box-shadow: none; }
.ov { position: fixed; inset: 0; z-index: 410; background: rgba(0,0,0,.55); display: flex; align-items: center; justify-content: center; padding: 24px; }
.rv-box { background: #fff; border: 2px solid var(--ink); border-radius: 22px; box-shadow: var(--pop-lg); padding: 26px 22px; text-align: center; max-width: 300px; width: 100%; }
.rv-label { font-size: .8rem; color: rgba(0,0,0,.5); }
.rv-emoji { font-size: 4rem; margin: 8px 0; }
.rv-nm { font-family: var(--font-display); font-weight: 400; font-size: 1.3rem; }
.rv-badge { display: inline-block; color: #fff; font-size: .6rem; font-weight: 800; padding: 3px 12px; border-radius: 999px; margin-top: 8px; }
.rv-ok { display: block; width: 100%; margin-top: 16px; border: 2px solid var(--ink); border-radius: 12px; padding: 11px; font-family: inherit; font-weight: 800; color: #fff; background: var(--primary); box-shadow: var(--pop); cursor: pointer; }
</style>
