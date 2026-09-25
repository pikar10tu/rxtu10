<!-- src/components/battle/ArenaSheet.vue
     ชีตเปลี่ยนสนาม (หน้าสนามประลอง) — แท็บ "ของฉัน" กดใส่ · แท็บ "ร้านสนาม" ซื้อ
     ร้านอยู่ที่นี่ที่เดียว ไม่ปนกับร้านตกแต่ง (user สั่ง 25 ก.ย. 2026)
     ร้านโชว์เฉพาะของที่ซื้อได้ตอนนี้: แชมป์ไม่ขึ้นเลย · ลิมิเต็ดขึ้นเฉพาะช่วงขาย · ของที่มีแล้วไม่ขึ้นซ้ำ -->
<template>
  <BottomSheet :open="open" icon="🏟️" title="สนามของฉัน" @update:open="$emit('update:open', $event)">
    <div class="ash-seg" role="tablist">
      <button role="tab" :aria-selected="tab === 'own'" :class="{ on: tab === 'own' }" @click="tab = 'own'">ของฉัน ({{ mine.owned.length }})</button>
      <button role="tab" :aria-selected="tab === 'shop'" :class="{ on: tab === 'shop' }" @click="tab = 'shop'">ร้านสนาม ({{ shop.length }})</button>
    </div>
    <div v-if="tab === 'shop'" class="ash-coins"><Emoji char="🪙" /> {{ coins.toLocaleString() }} เหรียญ</div>

    <div v-if="tab === 'own'" class="ash-grid">
      <button v-for="a in ownList" :key="a.id" type="button" class="ash-card" :class="{ on: a.id === mine.on }"
              :disabled="busy" @click="wear(a.id)">
        <span class="ash-thumb"><ArenaFloor mode="thumb" :arena-ref="refOf(a)" /></span>
        <span class="ash-tier" :class="'t-' + a.tier">{{ ARENA_TIERS[a.tier].label }}</span>
        <span class="ash-info">
          <b>{{ a.name }}</b>
          <small v-if="a.season">ที่ {{ mine.champ[a.season] || '?' }} · ซีซั่น {{ seasonMonthLabel(a.season, true) }}</small>
          <span class="ash-state" :class="{ on: a.id === mine.on }">{{ a.id === mine.on ? '✓ ใส่อยู่' : 'กดเพื่อใส่' }}</span>
        </span>
      </button>
    </div>

    <template v-else>
      <div v-if="!shop.length" class="ash-empty">ซื้อครบทุกสนามที่ขายอยู่แล้ว</div>
      <div v-else class="ash-grid">
        <div v-for="a in shop" :key="a.id" class="ash-card shop">
          <span class="ash-thumb"><ArenaFloor mode="thumb" :arena-ref="a.id" /></span>
          <span class="ash-tier" :class="'t-' + a.tier">{{ ARENA_TIERS[a.tier].label }}</span>
          <span class="ash-info">
            <b>{{ a.name }}</b>
            <small v-if="a.src === 'limited'" class="ash-limit">⏳ ขายถึง {{ saleEnd(a) }}</small>
            <!-- เหตุผลที่ซื้อไม่ได้ต้องเห็นบนปุ่มก่อนกด (บทเรียน :disabled + toast = โค้ดตาย) -->
            <button type="button" class="ash-buy" :disabled="busy || !canBuyArena(auth.userData, a.id).ok" @click="buy(a)">
              {{ canBuyArena(auth.userData, a.id).reason === 'coins' ? `เหรียญไม่พอ · ${arenaPrice(a).toLocaleString()}` : `ซื้อ ${arenaPrice(a).toLocaleString()}` }}
            </button>
          </span>
        </div>
      </div>
    </template>
  </BottomSheet>
</template>

<script setup>
import { ref, computed } from 'vue'
import { increment } from 'firebase/firestore'
import BottomSheet from '../shared/BottomSheet.vue'
import Emoji from '../shared/Emoji.vue'
import ArenaFloor from './ArenaFloor.vue'
import { ARENAS, ARENA_TIERS, getArena, arenaPrice } from '../../data/arenas.js'
import { arenaOf, shopList, canBuyArena, afterBuyArena, afterWearArena } from '../../utils/arenas.js'
import { seasonMonthLabel, TH_MONTH } from '../../utils/pvpSeason.js'
import { useAuthStore } from '../../stores/auth.js'
import { useToast } from '../../composables/useToast.js'
import { useConfirm } from '../../composables/useConfirm.js'
import { useRosterSync } from '../../composables/useRosterSync.js'
import { sfx } from '../../utils/sfx.js'

defineProps({ open: { type: Boolean, default: false } })
defineEmits(['update:open'])

const auth = useAuthStore()
const { toast } = useToast()
const { confirm } = useConfirm()
const { syncRosterRow } = useRosterSync()

const tab = ref('own')
const busy = ref(false)
const coins = computed(() => auth.userData?.coins || 0)
const mine = computed(() => arenaOf(auth.userData))
// เรียงตามทะเบียน (ฟรี → RARE → … → แชมป์) ให้ตำแหน่งการ์ดคงที่
const ownList = computed(() => ARENAS.filter(a => mine.value.owned.includes(a.id)))
const shop = computed(() => shopList(auth.userData, Date.now()))
// ภาพย่อของแชมป์ต้องพ่วงอันดับ ไม่งั้นป้ายเป็นระดับท็อป 10 ทุกใบ
const refOf = (a) => a.season ? `${a.id}#${mine.value.champ[a.season] || 10}` : a.id
const saleEnd = (a) => { const [, m, d] = a.sale.to.split('-'); return `${Number(d)} ${TH_MONTH[Number(m) - 1]}` }

async function wear(id) {
  if (busy.value || id === mine.value.on) return
  busy.value = true
  const next = afterWearArena(auth.userData, id)
  const done = await auth.patchUser({ arenas: next }, { arenas: next })
  busy.value = false
  if (!done) { toast('บันทึกไม่สำเร็จ', 'error'); return }
  syncRosterRow()
}

async function buy(a) {
  // ⚠️ หยิบค่าก่อน patchUser (CLAUDE.md ข้อ 9)
  const check = canBuyArena(auth.userData, a.id, Date.now())
  if (!check.ok || busy.value) return
  const price = check.price
  const ok = await confirm(`ซื้อสนาม "${a.name}" ราคา ${price.toLocaleString()} เหรียญ?\nซื้อแล้วเก็บถาวร ใส่ให้ทันที`)
  if (!ok) return
  busy.value = true
  const next = afterBuyArena(auth.userData, a.id)
  const done = await auth.patchUser(
    { coins: coins.value - price, totalSpent: (auth.userData?.totalSpent || 0) + price, arenas: next },
    { coins: increment(-price), totalSpent: increment(price), arenas: next },
  )
  busy.value = false
  if (!done) { toast('ซื้อไม่สำเร็จ', 'error'); return }
  sfx('coin')
  toast(`ได้สนาม "${getArena(a.id).name}" แล้ว ใส่ให้เลย`, 'success')
  tab.value = 'own'
  syncRosterRow()
}
</script>

<style scoped>
.ash-seg { display: grid; grid-template-columns: 1fr 1fr; gap: 3px; background: var(--primary-light); border-radius: 12px; padding: 3px; margin-bottom: 10px; }
.ash-seg button { font: inherit; font-size: .8rem; font-weight: 700; border: 0; background: transparent; color: var(--muted); border-radius: 9px; padding: 8px 4px; cursor: pointer; }
.ash-seg button.on { background: var(--surface); color: var(--primary-dark); box-shadow: 0 1px 3px rgba(43,53,80,.14); }
.ash-coins { font-size: .78rem; font-weight: 700; color: var(--muted); margin-bottom: 8px; }
.ash-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
.ash-card { position: relative; display: flex; flex-direction: column; text-align: left; padding: 0; font: inherit; color: var(--ink);
  background: var(--surface); border: var(--bw) solid var(--line); border-radius: 14px; overflow: hidden; box-shadow: var(--pop); cursor: pointer; }
.ash-card.shop { cursor: default; }
.ash-card.on { outline: 3px solid var(--primary); outline-offset: -1px; }
.ash-card:disabled { cursor: default; }
.ash-thumb { position: relative; display: block; height: 72px; overflow: hidden; }
.ash-tier { position: absolute; top: 6px; left: 6px; z-index: 2; font-size: .7rem; font-weight: 800; color: #fff; border-radius: 6px; padding: 1px 6px; background: #64748b; }
.ash-tier.t-rare { background: #2563eb; }
.ash-tier.t-epic { background: #7c3aed; }
.ash-tier.t-legendary { background: linear-gradient(90deg, #d97706, #f59e0b); }
.ash-tier.t-champion { background: #b91c1c; }
.ash-info { display: flex; flex-direction: column; gap: 3px; padding: 7px 9px 9px; min-width: 0; }
.ash-info b { font-size: .82rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ash-info small { font-size: .7rem; color: var(--muted); }
.ash-limit { color: #9d2456 !important; font-weight: 700; }
.ash-state { font-size: .72rem; font-weight: 700; color: var(--muted); }
.ash-state.on { color: var(--primary-dark); }
.ash-buy { font: inherit; font-size: .74rem; font-weight: 800; color: #fff; background: var(--accent); border: 0; border-radius: 9px; padding: 6px 8px; cursor: pointer; margin-top: 2px; }
.ash-buy:disabled { background: #c3c9d6; cursor: default; }
.ash-empty { text-align: center; color: var(--muted); font-size: .8rem; padding: 24px 0; }
</style>
