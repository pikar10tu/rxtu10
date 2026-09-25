<template>
  <div class="lab">
    <!-- โรงหลอม (เดิม "ห้องทดลอง") — หน้าตาใหม่ 25 ก.ย. 2026 จากเดโมที่ user เลือก
         บอกก่อนว่าตัวซ้ำคืออะไร + ใช้ได้ 3 ทาง (เดิมไม่บอกว่าเอาไปอัปเกรดเกรดได้) → สูตรเป็นภาพ [ใส่] → [ได้] -->
    <div class="fg-head">
      <h2><Emoji char="⚒️" /> โรงหลอม</h2>
      <p>อัญเชิญได้เพ็ทที่มีอยู่แล้ว จะได้ <b>"ตัวซ้ำ"</b> 1 ชิ้นแทน ตัวซ้ำใช้ได้ 3 ทาง</p>
      <div class="fg-uses">
        <div><b><Emoji char="⬆️" /> อัปเกรด</b>เพิ่มเกรดเพ็ทตัวนั้น (หน้าเพ็ท)</div>
        <div><b><Emoji char="⚒️" /> หลอม</b>รวมหลายชิ้นเป็นเพ็ทระดับสูงขึ้น</div>
        <div><b><Emoji char="🪙" /> ขาย</b>แลกเป็นเหรียญ</div>
      </div>
    </div>

    <div class="fg-bal">
      <div v-for="r in RARITIES" :key="r" :style="{ '--rc': rarityColor(r) }">
        <b>{{ copyTotal(r) }}</b><span>{{ RARITY[r]?.label }}</span>
      </div>
    </div>

    <div class="fg-sec">สูตรหลอม</div>
    <div v-for="rc in RECIPES" :key="rc.key" class="fg-recipe" :class="{ special: rc.swap }"
      :style="{ '--rc': rarityColor(rc.src), '--oc': rarityColor(rc.out) }">
      <span v-if="rc.swap" class="fg-new">ใหม่</span>
      <div class="fg-eq">
        <div class="fg-ing">
          <span class="fg-capdot" aria-hidden="true"></span>
          <span class="fg-ing-t"><b>ตัวซ้ำ{{ RARITY[rc.src]?.label }} ×{{ rc.cost }}</b><small>ของตัวไหนก็ได้ผสมกัน</small></span>
        </div>
        <span class="fg-arrow" aria-hidden="true">→</span>
        <div class="fg-out"><span class="fg-q"><Emoji char="❓" /></span>{{ RARITY[rc.out]?.label }} 1 ตัว</div>
      </div>
      <div v-if="rc.swap" class="fg-swapnote">สุ่มจากตำนานตัว<b>อื่น</b> ไม่มีทางได้ตัวที่ใส่ลงไป · ได้ตัวที่มีแล้วก็กลายเป็นตัวซ้ำ</div>
      <div class="fg-bar" :aria-label="`มี ${copyTotal(rc.src)} จาก ${rc.cost}`">
        <i :style="{ width: Math.min(100, copyTotal(rc.src) / rc.cost * 100) + '%' }"></i>
      </div>
      <div class="fg-foot">
        <span class="fg-have">{{ copyTotal(rc.src) >= rc.cost
          ? `มี ${copyTotal(rc.src)} ชิ้น · หลอมได้ ${Math.floor(copyTotal(rc.src) / rc.cost)} ครั้ง`
          : `มี ${copyTotal(rc.src)}/${rc.cost} · ขาดอีก ${rc.cost - copyTotal(rc.src)} ชิ้น` }}</span>
        <button class="fg-btn" :class="{ ok: copyTotal(rc.src) >= rc.cost }"
          :disabled="busy || copyTotal(rc.src) < rc.cost" @click="rc.swap ? openSwap() : openFusion(rc.src)">หลอม</button>
      </div>
    </div>

    <div class="fg-sec">ขายตัวซ้ำ</div>
    <div class="fg-sell">
      <div v-for="r in RARITIES" :key="r" class="fg-sell-row">
        <span class="fg-chip" :style="{ background: rarityColor(r) }">{{ RARITY[r]?.label }}</span>
        <span>ชิ้นละ {{ REDEEM_COIN[r].toLocaleString() }} <Emoji char="🪙" /></span>
        <span class="fg-have">มี {{ copyTotal(r) }}</span>
        <button class="fg-sbtn" :disabled="busy || copyTotal(r) === 0" @click="openRedeem(r)">ขาย</button>
      </div>
    </div>

    <!-- spend picker -->
    <SpendCopiesModal v-if="pending" :rarity="pending.rarity" :mode="pending.mode" :required="pending.required"
      @confirm="onConfirm" @cancel="pending = null" />

    <!-- ผลหลอม — ฉากแคปซูลเดียวกับอัญเชิญ (หลอมได้ตำนาน = แสงรุ้งหลังตู้ด้วย) -->
    <CapsuleReveal v-if="reveal" :summary="[reveal]" label="หลอมสำเร็จ!" @close="reveal = null" />

    <!-- redeem coin-burst -->
    <Teleport to="body">
      <div v-if="coinBurst" class="cb-ov" aria-hidden="true">
        <div class="cb">
          <span v-for="i in 6" :key="i" class="cb-coin" :style="{ '--i': i }"><Emoji char="🪙" /></span>
          <div class="cb-amt">+{{ coinBurst.toLocaleString() }}</div>
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
import { releasedPets } from '../../utils/petCatalog.js'
import { useAppConfig } from '../../composables/useAppConfig.js'
import { mergeRolls } from '../../utils/gachaMerge.js'
import { FUSION_COST, REDEEM_COIN, LEGEND_SWAP_COST, nextRarity, rarityCopyTotal, applyCopySpend, fuseRoll, legendSwapRoll, redeemValue } from '../../utils/lab.js'
import SpendCopiesModal from './SpendCopiesModal.vue'
import CapsuleReveal from './CapsuleReveal.vue'

const auth = useAuthStore()
const { rawConfig } = useAppConfig()
const { toast } = useToast()

const RARITIES = ['common', 'rare', 'epic', 'legendary']
const RECIPES = [
  ...['common', 'rare', 'epic'].map((src) => ({ key: src, src, out: nextRarity(src), cost: FUSION_COST[src] })),
  { key: 'swap', src: 'legendary', out: 'legendary', cost: LEGEND_SWAP_COST, swap: true },
]
const pets = computed(() => auth.userData?.pets || [])
const copyTotal = (r) => rarityCopyTotal(pets.value, r)
const rarityColor = (r) => RARITY[r]?.color || '#94a3b8'

const pending = ref(null) // { mode, rarity, required }
const reveal = ref(null)  // summary entry (CapsuleReveal จัดการ Esc เอง)
const coinBurst = ref(null) // จำนวนเหรียญที่เพิ่งแลก (trigger animation)
const busy = ref(false)
let cbTimer = null

function openFusion(src) { pending.value = { mode: 'fusion', rarity: src, required: FUSION_COST[src] } }
function openSwap() { pending.value = { mode: 'fusion', swap: true, rarity: 'legendary', required: LEGEND_SWAP_COST } }
function openRedeem(r) { pending.value = { mode: 'redeem', rarity: r, required: 0 } }

async function onConfirm(allocation) {
  if (busy.value || !pending.value) return
  const { mode, rarity, swap } = pending.value
  pending.value = null
  busy.value = true
  try {
    const petsAfter = applyCopySpend(pets.value, allocation)
    if (mode === 'fusion') {
      // หลอมตำนาน: ตัดสายพันธุ์ที่จ่ายตัวซ้ำออกจากคลังก่อนสุ่ม (ห้ามได้ตัวเดิมคืน)
      const id = swap
        ? legendSwapRoll(releasedPets(rawConfig.value?.gachaEvent), allocation.map((a) => a.id))
        : fuseRoll(rarity, releasedPets(rawConfig.value?.gachaEvent))
      if (!id) { toast('หลอมไม่สำเร็จ', 'error'); return }
      const { pets: finalPets, summary } = mergeRolls(petsAfter, [{ id }], PETS)
      const fuseN = (auth.userData?.labFuseTotal || 0) + 1   // achievement นักเล่นแร่แปรธาตุ
      const ok = await auth.patchUser({ pets: finalPets, labFuseTotal: fuseN }, { pets: finalPets, labFuseTotal: increment(1) })
      if (ok) reveal.value = summary[0]
      else toast('หลอมไม่สำเร็จ', 'error')
    } else {
      const gain = redeemValue(allocation, rarity)
      const ok = await auth.patchUser(
        { pets: petsAfter, coins: (auth.userData?.coins || 0) + gain },
        { pets: petsAfter, coins: increment(gain) },
      )
      if (ok) {
        toast(`ได้ ${gain.toLocaleString()} เหรียญ`, 'success')
        coinBurst.value = gain
        clearTimeout(cbTimer)
        cbTimer = setTimeout(() => { coinBurst.value = null }, 1100)
      } else toast('แลกไม่สำเร็จ', 'error')
    }
  } catch (e) {
    console.error('[lab]', e); toast('ทำรายการไม่สำเร็จ', 'error')
  } finally {
    busy.value = false
  }
}
</script>

<style scoped>
.lab { display: flex; flex-direction: column; gap: 10px; }
.fg-head { border-radius: 20px; padding: 14px; color: #fff; background: linear-gradient(140deg, #3b2a6e, #6d4fd0 70%, #a36bd8); box-shadow: var(--pop-lg); }
.fg-head h2 { margin: 0; font-family: var(--font-display); font-weight: 400; font-size: 1.3rem; }
.fg-head p { margin: 6px 0 10px; font-size: .76rem; line-height: 1.55; color: rgba(255,255,255,.88); }
.fg-uses { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; }
.fg-uses div { background: rgba(255,255,255,.12); border-radius: 12px; padding: 7px 6px; font-size: .7rem; line-height: 1.35; text-align: center; }
.fg-uses b { display: block; font-size: .78rem; }
.fg-bal { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; }
.fg-bal div { display: flex; flex-direction: column; align-items: center; background: #fff; border: 1.5px solid var(--rc); border-radius: 12px; padding: 6px 2px; }
.fg-bal b { font-size: 1.15rem; color: var(--rc); font-variant-numeric: tabular-nums; }
.fg-bal span { font-size: .7rem; color: var(--muted); font-weight: 700; }
.fg-sec { font-weight: 800; font-size: .92rem; margin: 8px 2px 0; }

.fg-recipe { position: relative; display: flex; flex-direction: column; gap: 8px; background: #fff; border: var(--bw) solid var(--line); border-radius: 18px; box-shadow: var(--pop); padding: 12px; }
.fg-recipe.special { background: linear-gradient(160deg, #fffbea, #fff); border-color: #f5c451; }
.fg-new { position: absolute; top: -9px; left: 12px; background: var(--accent); color: #fff; font-size: .7rem; font-weight: 800; border-radius: 999px; padding: 1px 9px; }
.fg-eq { display: flex; align-items: center; gap: 8px; }
.fg-ing { flex: 1; min-width: 0; display: flex; align-items: center; gap: 8px; padding: 8px; border-radius: 12px; background: color-mix(in srgb, var(--rc) 12%, #fff); }
.fg-ing-t { display: flex; flex-direction: column; min-width: 0; }
.fg-ing b { font-size: .82rem; }
.fg-ing small { font-size: .7rem; color: var(--muted); }
.fg-capdot { width: 30px; height: 30px; flex-shrink: 0; border-radius: 50%; background: linear-gradient(#fff 0 50%, var(--rc) 50%); border: 1.5px solid rgba(43,53,80,.18); }
.fg-arrow { font-weight: 800; color: var(--muted); }
.fg-out { width: 84px; flex-shrink: 0; text-align: center; padding: 8px 4px; border-radius: 12px; background: color-mix(in srgb, var(--oc) 16%, #fff); border: 1.5px dashed var(--oc); font-size: .72rem; font-weight: 800; }
.fg-q { display: block; font-size: 1.3rem; }
.fg-swapnote { font-size: .72rem; color: #8a5a00; line-height: 1.45; }
.fg-bar { height: 7px; border-radius: 999px; overflow: hidden; background: rgba(43,53,80,.08); }
.fg-bar i { display: block; height: 100%; border-radius: inherit; background: var(--rc); transition: width .3s; }
.fg-foot { display: flex; align-items: center; gap: 8px; }
.fg-have { flex: 1; font-size: .72rem; color: var(--muted); }
.fg-btn { border: 0; border-radius: 12px; padding: 9px 18px; font-family: inherit; font-weight: 800; font-size: .84rem; background: #eef0f5; color: var(--muted); cursor: default; }
.fg-btn.ok { background: linear-gradient(135deg, #7c5cd6, #b07ce8); color: #fff; cursor: pointer; box-shadow: 0 6px 14px -6px rgba(124,92,214,.8); }
.fg-recipe.special .fg-btn.ok { background: linear-gradient(135deg, #f59e0b, #f7b93e); box-shadow: 0 6px 14px -6px rgba(200,120,0,.8); }
.fg-btn:disabled { opacity: .7; }

.fg-sell { background: #fff; border: var(--bw) solid var(--line); border-radius: 18px; box-shadow: var(--pop); padding: 2px 12px; }
.fg-sell-row { display: flex; align-items: center; gap: 10px; padding: 9px 0; border-top: 1px dashed var(--line); font-size: .8rem; }
.fg-sell-row:first-child { border-top: 0; }
.fg-sell-row .fg-have { flex: 0 1 auto; }
.fg-chip { color: #fff; font-size: .7rem; font-weight: 800; border-radius: 6px; padding: 1px 7px; }
.fg-sbtn { margin-left: auto; border: var(--bw) solid var(--line); background: #fff; border-radius: 10px; padding: 6px 12px; font-family: inherit; font-weight: 800; font-size: .78rem; color: #b45309; cursor: pointer; }
.fg-sbtn:disabled { color: var(--muted); opacity: .6; cursor: default; }

/* redeem coin-burst */
.cb-ov { position: fixed; inset: 0; z-index: 420; display: flex; align-items: center; justify-content: center; pointer-events: none; }
.cb { position: relative; width: 0; height: 0; }
.cb-coin { position: absolute; font-size: 1.4rem; left: calc((var(--i) - 3.5) * 16px); top: 0; animation: cb-fly .95s ease-out forwards; animation-delay: calc(var(--i) * 40ms); }
.cb-amt { position: absolute; left: 50%; transform: translateX(-50%); white-space: nowrap; font-weight: 800; color: #b45309; font-size: 1.5rem; text-shadow: 0 1px 0 #fff, 0 0 10px rgba(245,158,11,.5); animation: cb-amt 1s ease-out forwards; }
@keyframes cb-fly { 0% { opacity: 0; transform: translateY(12px) scale(.4); } 22% { opacity: 1; } 100% { opacity: 0; transform: translateY(-74px) scale(1.1); } }
@keyframes cb-amt { 0% { opacity: 0; transform: translateX(-50%) translateY(10px) scale(.7); } 28% { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); } 100% { opacity: 0; transform: translateX(-50%) translateY(-22px); } }
</style>
