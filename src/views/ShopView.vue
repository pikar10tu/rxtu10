<template>
  <div class="tab-content">
    <div class="shop-head">
      <div class="page-title" style="margin-bottom:0"><Emoji char="🛒" /> Shop</div>
      <span class="shop-coins">{{ coins.toLocaleString() }} <Emoji char="🪙" /></span>
      <HelpButton topic="shop" />
    </div>

    <template v-if="authStore.isLoggedIn">
      <div class="shop-storage">
        <Emoji char="🐾" /> สัตว์เลี้ยง {{ pets.length }}/{{ PETS.length }} ชนิด
        <span v-if="discount" class="shop-disc">· ส่วนลดร้าน −{{ discount }}%</span>
      </div>

      <button v-if="tickets > 0" class="ticket-btn" :disabled="buying" @click="useTicket">
        <Emoji char="🎟️" /> ใช้ตั๋วกาชาฟรี (×{{ tickets }})
      </button>

      <div class="egg-list">
        <div v-for="egg in EGG_TYPES" :key="egg.id" class="egg-card">
          <div class="egg-emoji"><Emoji :char="egg.emoji" /></div>
          <div class="egg-info">
            <div class="egg-name">{{ egg.name }}</div>
            <div class="egg-desc">{{ egg.desc }}</div>
            <div class="egg-rates">
              <span v-for="r in rarityList(egg)" :key="r.key" :style="{ color: r.color }">{{ r.label }} {{ r.pct }}%</span>
            </div>
          </div>
          <button class="egg-buy" :class="{ ok: coins >= price(egg) }" @click="buy(egg)">
            {{ price(egg).toLocaleString() }}<Emoji char="🪙" />
          </button>
        </div>
      </div>

      <div class="shop-note">ซื้อแล้วได้เพ็ทเข้าคลังทันที</div>
    </template>
    <div v-else class="shop-login">เข้าสู่ระบบเพื่อช้อป</div>

    <!-- reveal modal -->
    <div v-if="reveal" class="rv-ov" @click.self="reveal = null">
      <div class="rv-box">
        <div class="rv-label">คุณได้รับ!</div>
        <div class="rv-emoji" :style="{ filter: `drop-shadow(0 0 16px ${rarityColor(reveal.rarity)})` }"><Emoji :char="reveal.emoji" /></div>
        <div class="rv-name">{{ reveal.name }}</div>
        <div class="rv-rarity" :style="{ background: rarityColor(reveal.rarity) }">{{ rarityLabel(reveal.rarity) }}</div>
        <button class="rv-ok" @click="reveal = null">เยี่ยม!</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import Emoji from '../components/shared/Emoji.vue'
import HelpButton from '../components/help/HelpButton.vue'
import { doc, updateDoc, increment } from 'firebase/firestore'
import { db } from '../firebase/config.js'
import { useAuthStore } from '../stores/auth.js'
import { useToast } from '../composables/useToast.js'
import { EGG_TYPES, rollPetFromEgg, DAILY_QUEST_TICKET_EGG } from '../data/shop.js'
import { RARITY, PETS } from '../data/index.js'
import { residenceShopDiscount } from '../data/residence.js'
import { bumpDailyQuest } from '../utils/dailyQuest.js'

const authStore = useAuthStore()
const { toast } = useToast()

const coins = computed(() => authStore.userData?.coins || 0)
const pets = computed(() => authStore.userData?.pets || [])
const level = computed(() => authStore.userData?.residence?.level || 1)
const discount = computed(() => residenceShopDiscount(level.value))
const tickets = computed(() => authStore.userData?.freeGachaTickets || 0)

const reveal = ref(null)
const buying = ref(false)

const price = (egg) => Math.round(egg.cost * (1 - discount.value / 100))
const rarityColor = (r) => RARITY[r]?.color || '#94a3b8'
const rarityLabel = (r) => RARITY[r]?.label || r
function rarityList(egg) {
  return ['common', 'rare', 'epic', 'legendary']
    .filter(k => (egg.rates[k] || 0) > 0)
    .map(k => ({ key: k, pct: egg.rates[k], color: RARITY[k]?.color, label: RARITY[k]?.label }))
}

async function buy(egg) {
  if (buying.value) return
  const cost = price(egg)
  if (coins.value < cost) { toast(`เหรียญไม่พอ! ต้องการ ${cost.toLocaleString()}🪙`, 'error'); return }
  const pet = rollPetFromEgg(egg.id)
  const existing = pets.value.find(p => p.id === pet.id)
  buying.value = true
  const newPets = existing
    ? pets.value.map(p => p.id === pet.id ? { ...p, copies: (p.copies || 0) + 1 } : p)
    : [...pets.value, pet]
  const today = new Date().toISOString().slice(0, 10)
  const dq = bumpDailyQuest(authStore.userData?.dailyQuest, 'gacha', today, 1)
  authStore.blockSnapshot()
  authStore.setUserDataOptimistic({ coins: coins.value - cost, pets: newPets, dailyQuest: dq })
  try {
    await updateDoc(doc(db, 'users', authStore.currentUser.uid), {
      coins: increment(-cost),
      pets: newPets,
      dailyQuest: dq,
    })
    reveal.value = pet
    if (existing) toast(`ได้ตัวซ้ำ! ${pet.name} +1 copy`, 'info')
  } catch (e) {
    console.error('[shop buy]', e)
    toast('ซื้อไม่สำเร็จ', 'error')
  } finally {
    buying.value = false
  }
}

async function useTicket() {
  if (buying.value || tickets.value < 1) return
  const pet = rollPetFromEgg(DAILY_QUEST_TICKET_EGG)
  const existing = pets.value.find(p => p.id === pet.id)
  buying.value = true
  const newPets = existing
    ? pets.value.map(p => p.id === pet.id ? { ...p, copies: (p.copies || 0) + 1 } : p)
    : [...pets.value, pet]
  const today = new Date().toISOString().slice(0, 10)
  const dq = bumpDailyQuest(authStore.userData?.dailyQuest, 'gacha', today, 1)
  authStore.blockSnapshot()
  authStore.setUserDataOptimistic({
    pets: newPets,
    freeGachaTickets: tickets.value - 1,
    dailyQuest: dq,
  })
  try {
    await updateDoc(doc(db, 'users', authStore.currentUser.uid), {
      pets: newPets,
      freeGachaTickets: increment(-1),
      dailyQuest: dq,
    })
    reveal.value = pet
    if (existing) toast(`ได้ตัวซ้ำ! ${pet.name} +1 copy`, 'info')
  } catch (e) {
    console.error('[ticket roll]', e); toast('ใช้ตั๋วไม่สำเร็จ', 'error')
  } finally { buying.value = false }
}
</script>

<style scoped>
.shop-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 6px; }
.shop-coins { font-size: 1rem; font-weight: 800; color: #b45309; }
.shop-storage { font-size: .72rem; color: rgba(0,0,0,.55); margin-bottom: 14px; }
.shop-disc { color: #059669; font-weight: 700; }
.ticket-btn { width: 100%; margin-bottom: 12px; border: 2px solid var(--ink); border-radius: 12px; padding: 11px; font-family: inherit; font-size: .85rem; font-weight: 800; color: var(--ink); background: var(--gold); box-shadow: var(--pop); cursor: pointer; transition: transform .12s, box-shadow .12s; }
.ticket-btn:active { transform: translate(2px,2px); box-shadow: 0 0 0 var(--ink); }
.ticket-btn:disabled { opacity: .5; cursor: default; }
.egg-list { display: flex; flex-direction: column; gap: 10px; }
.egg-card { display: flex; align-items: center; gap: 12px; background: #fff; border: 2px solid var(--ink); border-radius: 16px; padding: 12px; box-shadow: var(--pop); }
.egg-emoji { font-size: 2.2rem; flex-shrink: 0; }
.egg-info { flex: 1; min-width: 0; }
.egg-name { font-weight: 800; font-size: .92rem; }
.egg-desc { font-size: .64rem; color: rgba(0,0,0,.5); margin: 1px 0 4px; }
.egg-rates { display: flex; flex-wrap: wrap; gap: 6px; font-size: .6rem; font-weight: 700; }
.egg-buy { flex-shrink: 0; border: 2px solid var(--ink); border-radius: 11px; padding: 10px 12px; font-family: inherit; font-size: .82rem; font-weight: 800; color: #fff; background: #c9c2d4; cursor: pointer; transition: transform .12s, box-shadow .12s; }
.egg-buy.ok { background: var(--gold); box-shadow: var(--pop); }
.egg-buy.ok:active { transform: translate(2px,2px); box-shadow: 0 0 0 var(--ink); }
.shop-note { font-size: .64rem; color: rgba(0,0,0,.4); text-align: center; margin-top: 14px; }
.shop-login { text-align: center; color: rgba(0,0,0,.4); padding: 30px 0; }
/* reveal */
.rv-ov { position: fixed; inset: 0; z-index: 240; background: rgba(0,0,0,.55); display: flex; align-items: center; justify-content: center; padding: 24px; }
.rv-box { background: #fff; border: 2px solid var(--ink); border-radius: 22px; box-shadow: var(--pop-lg); padding: 28px 24px; text-align: center; max-width: 300px; width: 100%; animation: rv-pop .25s ease; }
@keyframes rv-pop { from { transform: scale(.7); opacity: 0; } to { transform: scale(1); opacity: 1; } }
.rv-label { font-size: .8rem; color: rgba(0,0,0,.5); }
.rv-emoji { font-size: 4.5rem; margin: 8px 0; }
.rv-name { font-size: 1.2rem; font-weight: 800; }
.rv-rarity { display: inline-block; color: #fff; font-size: .64rem; font-weight: 800; padding: 3px 12px; border-radius: 999px; margin-top: 8px; }
.rv-ok { display: block; width: 100%; margin-top: 18px; border: 2px solid var(--ink); border-radius: 12px; padding: 11px; font-family: inherit; font-weight: 800; color: #fff; background: var(--primary); box-shadow: var(--pop); cursor: pointer; transition: transform .12s, box-shadow .12s; }
.rv-ok:active { transform: translate(2px,2px); box-shadow: 0 0 0 var(--ink); }
.rv-name { font-family: var(--font-display); font-weight: 400; }
</style>
