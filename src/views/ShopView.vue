<template>
  <div class="tab-content">
    <div class="shop-head">
      <div class="page-title" style="margin-bottom:0"><Emoji char="🛒" /> Shop</div>
      <span class="shop-coins">{{ coins.toLocaleString() }} <Emoji char="🪙" /></span>
      <HelpButton topic="shop" />
    </div>

    <!-- ร้านค้าปิดปรับปรุง (ยังไม่เปิดให้นักศึกษา) — flip SHOP_OPEN=true เมื่อพร้อม; admin เห็นร้านปกติไว้ทดสอบ -->
    <template v-if="!shopOpen">
      <div class="shop-maint">
        <div class="shop-maint-emoji"><Emoji char="🚧" /></div>
        <div class="shop-maint-title">ร้านค้ากำลังปรับปรุง</div>
        <div class="shop-maint-msg">กำลังจัดของให้พร้อม เดี๋ยวเปิดให้ช้อปเร็วๆ นี้!</div>
      </div>
    </template>

    <template v-else-if="authStore.isLoggedIn">
      <div class="shop-storage">
        <Emoji char="🐾" /> สัตว์เลี้ยง {{ pets.length }}/{{ PETS.length }} ชนิด
        <span v-if="discount" class="shop-disc">· ส่วนลดร้าน −{{ discount }}%</span>
      </div>

      <!-- banner -->
      <div class="banner">
        <div class="banner-top">
          <div class="banner-title"><Emoji char="🎰" /> อัญเชิญสัตว์เลี้ยง</div>
          <div class="banner-pity">การันตี legendary อีก {{ pityLeft }} ครั้ง</div>
        </div>

        <button class="target-row" @click="pickerOpen = true">
          <template v-if="targetPet">
            <span class="target-emoji"><Emoji :char="targetPet.emoji" /></span>
            <span class="target-text">เป้าหมาย: <b>{{ targetPet.name }}</b></span>
          </template>
          <span v-else class="target-text">เลือกเป้าหมาย legendary (ยังไม่เลือก = ตัวที่ยังไม่มีก่อน)</span>
          <span class="target-edit">เปลี่ยน</span>
        </button>
        <div v-if="guaranteed && targetPet" class="banner-guar"><Emoji char="✅" /> รอบหน้าได้ {{ targetPet.name }} แน่นอน</div>

        <div class="banner-rates">
          <span v-for="r in rateList" :key="r.key" :style="{ color: r.color }">{{ r.label }} {{ r.pct }}%</span>
        </div>

        <button v-if="tickets > 0" class="ticket-btn" :disabled="buying" @click="pull(1, true)">
          <Emoji char="🎟️" /> ใช้ตั๋วฟรี สุ่ม 1 (×{{ tickets }})
        </button>
        <div class="pull-row">
          <button class="pull-btn" :class="{ ok: coins >= price(PULL_COST) }" :disabled="buying" @click="pull(1)">
            สุ่ม 1<br><small>{{ price(PULL_COST).toLocaleString() }}<Emoji char="🪙" /></small>
          </button>
          <button class="pull-btn" :class="{ ok: coins >= price(TEN_PULL_COST) }" :disabled="buying" @click="pull(10)">
            สุ่ม 10<br><small>{{ price(TEN_PULL_COST).toLocaleString() }}<Emoji char="🪙" /></small>
          </button>
        </div>
      </div>
      <div class="shop-note">สุ่ม 10 ได้ 11 ตัว · ตัวซ้ำ → +1 copy (ใช้อัพเกรด)</div>
    </template>
    <div v-else class="shop-login">เข้าสู่ระบบเพื่อช้อป</div>

    <!-- target picker -->
    <Teleport to="body">
      <div v-if="pickerOpen" class="ov" @click.self="pickerOpen = false">
        <div class="picker">
          <div class="picker-head">เลือกเป้าหมาย legendary</div>
          <div class="picker-grid">
            <button v-for="p in legendaries" :key="p.id" class="picker-cell" :class="{ on: p.id === target }" @click="chooseTarget(p.id)">
              <span class="picker-emoji"><Emoji :char="p.emoji" /></span>
              <span class="picker-name">{{ p.name }}</span>
              <span v-if="pets.find((x) => x.id === p.id)" class="picker-have">มีแล้ว</span>
            </button>
          </div>
          <button class="picker-clear" @click="chooseTarget(target)">{{ target ? 'ล้างเป้าหมาย' : 'ปิด' }}</button>
        </div>
      </div>
    </Teleport>

    <!-- reveal -->
    <Teleport to="body">
      <div v-if="reveal" class="ov" @click.self="reveal = null">
        <div class="rv-box">
          <div class="rv-label">คุณได้รับ!</div>
          <div class="rv-grid" :class="{ single: !reveal.multi }">
            <div v-for="(s, i) in reveal.summary" :key="i" class="rv-cell" :style="{ borderColor: rarityColor(s.rarity) }">
              <span class="rv-emoji"><Emoji :char="s.emoji" /></span>
              <span class="rv-nm">{{ s.name }}</span>
              <span class="rv-badge" :style="{ background: rarityColor(s.rarity) }">{{ s.isNew ? 'ใหม่!' : '+1' }}</span>
            </div>
          </div>
          <button class="rv-ok" @click="reveal = null">เยี่ยม!</button>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import Emoji from '../components/shared/Emoji.vue'
import HelpButton from '../components/help/HelpButton.vue'
import { increment } from 'firebase/firestore'
import { useAuthStore } from '../stores/auth.js'
import { useToast } from '../composables/useToast.js'
import { PETS, RARITY } from '../data/index.js'
import { residenceShopDiscount } from '../data/residence.js'
import { bumpDailyQuest } from '../utils/dailyQuest.js'
import { rollMany, GACHA_RATES, PULL_COST, TEN_PULL_COST, HARD_PITY } from '../utils/gacha.js'
import { mergeRolls } from '../utils/gachaMerge.js'

const authStore = useAuthStore()
const { toast } = useToast()

// ร้านค้ายังไม่เปิดให้นักศึกษา — flip เป็น true เมื่อพร้อม (admin เห็นร้านปกติเสมอเพื่อทดสอบ)
const SHOP_OPEN = false
const shopOpen = computed(() => SHOP_OPEN || authStore.isAdmin)

const coins   = computed(() => authStore.userData?.coins || 0)
const pets    = computed(() => authStore.userData?.pets || [])
const level   = computed(() => authStore.userData?.residence?.level || 1)
const discount = computed(() => residenceShopDiscount(level.value))
const tickets = computed(() => authStore.userData?.freeGachaTickets || 0)
const pity    = computed(() => authStore.userData?.gachaPity || 0)
const target  = computed(() => authStore.userData?.gachaTarget || null)
const guaranteed = computed(() => !!authStore.userData?.gachaGuaranteed)

const legendaries = PETS.filter((p) => p.rarity === 'legendary')
const targetPet = computed(() => legendaries.find((p) => p.id === target.value) || null)
const pityLeft  = computed(() => Math.max(0, HARD_PITY - pity.value))

const reveal = ref(null)       // { summary, multi }
const pickerOpen = ref(false)
const buying = ref(false)

const price = (base) => Math.round(base * (1 - discount.value / 100))
const rarityColor = (r) => RARITY[r]?.color || '#94a3b8'
const ownedLegendaryIds = () => pets.value.filter((p) => p.rarity === 'legendary').map((p) => p.id)

const rateList = ['legendary', 'epic', 'rare', 'common'].map((k) => ({ key: k, pct: GACHA_RATES[k], color: RARITY[k]?.color, label: RARITY[k]?.label }))

async function pull(n, useFreeTicket = false) {
  if (buying.value) return
  const rolls = useFreeTicket ? 1 : n
  const cost = useFreeTicket ? 0 : price(n === 1 ? PULL_COST : TEN_PULL_COST)
  if (useFreeTicket) { if (tickets.value < 1) return }
  else if (coins.value < cost) { toast(`เหรียญไม่พอ! ต้องการ ${cost.toLocaleString()}`, 'error'); return }

  const state = { pity: pity.value, target: target.value, guaranteed: guaranteed.value, ownedLegendaryIds: ownedLegendaryIds() }
  const { results, nextState } = rollMany(rolls, state, PETS)
  const { pets: newPets, summary } = mergeRolls(pets.value, results, PETS)
  const today = new Date().toISOString().slice(0, 10)
  const dq = bumpDailyQuest(authStore.userData?.dailyQuest, 'gacha', today, 1)

  buying.value = true
  // NOTE: gachaTarget ไม่เขียนที่นี่ — เป็นของ chooseTarget() (กัน stale-target write)
  const optimistic = {
    pets: newPets, dailyQuest: dq, gachaPity: nextState.pity, gachaGuaranteed: nextState.guaranteed,
    ...(useFreeTicket ? { freeGachaTickets: tickets.value - 1 } : { coins: coins.value - cost, totalSpent: (authStore.userData?.totalSpent || 0) + cost }),
  }
  const server = {
    pets: newPets, dailyQuest: dq, gachaPity: nextState.pity, gachaGuaranteed: nextState.guaranteed,
    ...(useFreeTicket ? { freeGachaTickets: increment(-1) } : { coins: increment(-cost), totalSpent: increment(cost) }),
  }
  const ok = await authStore.patchUser(optimistic, server)
  buying.value = false
  if (ok) reveal.value = { summary, multi: rolls > 1 }
  else toast('สุ่มไม่สำเร็จ', 'error')
}

async function chooseTarget(id) {
  const next = target.value === id ? null : id
  await authStore.patchUser({ gachaTarget: next }, { gachaTarget: next })
  pickerOpen.value = false
}
</script>

<style scoped>
.shop-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 6px; }
.shop-coins { font-size: 1rem; font-weight: 800; color: #b45309; }
.shop-storage { font-size: .72rem; color: rgba(0,0,0,.55); margin-bottom: 14px; }
.shop-disc { color: #059669; font-weight: 700; }
.shop-note { font-size: .64rem; color: rgba(0,0,0,.4); text-align: center; margin-top: 14px; }
.shop-login { text-align: center; color: rgba(0,0,0,.4); padding: 30px 0; }
.shop-maint { text-align: center; padding: 48px 20px; display: flex; flex-direction: column; align-items: center; gap: 8px; }
.shop-maint-emoji { font-size: 3rem; }
.shop-maint-title { font-size: 1.2rem; font-weight: 800; color: var(--ink); }
.shop-maint-msg { font-size: .82rem; color: rgba(0,0,0,.55); max-width: 280px; line-height: 1.6; }

.banner { background: #fff; border: 2px solid var(--ink); border-radius: 16px; padding: 14px; box-shadow: var(--pop); }
.banner-top { display: flex; justify-content: space-between; align-items: baseline; gap: 8px; }
.banner-title { font-weight: 800; font-size: .95rem; }
.banner-pity { font-size: .62rem; color: #b45309; font-weight: 700; }
.target-row { display: flex; align-items: center; gap: 8px; width: 100%; margin-top: 10px; border: 2px dashed var(--ink); border-radius: 11px; padding: 8px 10px; background: var(--primary-light); font-family: inherit; font-size: .72rem; cursor: pointer; text-align: left; }
.target-emoji { font-size: 1.4rem; }
.target-text { flex: 1; min-width: 0; }
.target-edit { font-weight: 800; color: var(--primary); font-size: .66rem; }
.banner-guar { margin-top: 6px; font-size: .66rem; font-weight: 700; color: #059669; }
.banner-rates { display: flex; flex-wrap: wrap; gap: 8px; margin: 10px 0; font-size: .6rem; font-weight: 700; }
.ticket-btn { width: 100%; margin-bottom: 8px; border: 2px solid var(--ink); border-radius: 11px; padding: 10px; font-family: inherit; font-weight: 800; color: var(--ink); background: var(--gold); box-shadow: var(--pop); cursor: pointer; }
.ticket-btn:disabled { opacity: .5; }
.pull-row { display: flex; gap: 8px; }
.pull-btn { flex: 1; border: 2px solid var(--ink); border-radius: 11px; padding: 10px; font-family: inherit; font-weight: 800; font-size: .85rem; color: #fff; background: #c9c2d4; cursor: pointer; transition: transform .12s, box-shadow .12s; }
.pull-btn small { font-size: .66rem; font-weight: 700; }
.pull-btn.ok { background: var(--primary); box-shadow: var(--pop); }
.pull-btn.ok:active:not(:disabled) { transform: translate(2px,2px); box-shadow: 0 0 0 var(--ink); }
.pull-btn:disabled { opacity: .6; }
.ov { position: fixed; inset: 0; z-index: 400; background: rgba(0,0,0,.55); display: flex; align-items: center; justify-content: center; padding: 20px; }
.picker { background: #fff; border: 2px solid var(--ink); border-radius: 18px; box-shadow: var(--pop-lg); padding: 18px; width: 100%; max-width: 360px; max-height: 80vh; overflow-y: auto; }
.picker-head { font-weight: 800; margin-bottom: 12px; text-align: center; }
.picker-grid { display: grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap: 8px; }
.picker-cell { display: flex; flex-direction: column; align-items: center; gap: 2px; border: 2px solid var(--ink); border-radius: 11px; padding: 8px 4px; background: #fff; cursor: pointer; font-family: inherit; }
.picker-cell.on { background: var(--gold); }
.picker-emoji { font-size: 1.6rem; }
.picker-name { font-size: .58rem; font-weight: 700; }
.picker-have { font-size: .5rem; color: #059669; font-weight: 800; }
.picker-clear { width: 100%; margin-top: 12px; border: 2px solid var(--ink); border-radius: 11px; padding: 9px; font-family: inherit; font-weight: 800; background: #fff; cursor: pointer; }
.rv-box { background: #fff; border: 2px solid var(--ink); border-radius: 22px; box-shadow: var(--pop-lg); padding: 22px; text-align: center; max-width: 340px; width: 100%; }
.rv-label { font-size: .8rem; color: rgba(0,0,0,.5); margin-bottom: 10px; }
.rv-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
.rv-grid.single { grid-template-columns: 1fr; }
.rv-cell { position: relative; border: 2px solid var(--ink); border-radius: 11px; padding: 8px 2px; display: flex; flex-direction: column; align-items: center; gap: 2px; }
.rv-grid.single .rv-emoji { font-size: 3.4rem; }
.rv-emoji { font-size: 1.7rem; }
.rv-nm { font-size: .52rem; font-weight: 700; }
.rv-grid.single .rv-nm { font-size: .9rem; }
.rv-badge { color: #fff; font-size: .48rem; font-weight: 800; padding: 1px 5px; border-radius: 999px; }
.rv-ok { display: block; width: 100%; margin-top: 16px; border: 2px solid var(--ink); border-radius: 12px; padding: 11px; font-family: inherit; font-weight: 800; color: #fff; background: var(--primary); box-shadow: var(--pop); cursor: pointer; }
</style>
