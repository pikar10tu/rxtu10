<template>
  <div class="tab-content">
    <div class="pt-head">
      <button class="pt-back" aria-label="กลับ" @click="$router.push('/play/pets')">‹</button>
      <span><Emoji char="🐾" /> สัตว์เลี้ยง</span>
      <HelpButton topic="pets" style="margin-left:auto" />
    </div>

    <template v-if="authStore.isLoggedIn">
      <div class="pt-team">
        <div class="pt-team-head">
          <span><Emoji char="⚔️" /> ทีมต่อสู้ ({{ teamSlots.filter(Boolean).length }}/{{ battleSlots }})</span>
          <button class="pt-team-edit" @click="pickOpen = true">จัดทีม</button>
        </div>
        <div class="pt-team-slots" :style="{ gridTemplateColumns: `repeat(${battleSlots}, 78px)` }">
          <div v-for="(id, i) in teamSlots" :key="i" class="pt-team-slot" :class="{ filled: id }" @click="id ? sel = id : pickOpen = true">
            <PetThumb v-if="id" :pet="teamPetOf(id)" />
            <span v-else class="pt-team-empty">+</span>
          </div>
        </div>
      </div>

      <div class="pt-summary">
        <div><b>{{ pets.length }}</b>/{{ catalog.length }} <small>ชนิด</small></div>
        <div><b>{{ totalIncome.toLocaleString() }}</b><small><Emoji char="🪙" />/วัน</small></div>
        <div><b>{{ species }}</b><small>สายพันธุ์</small></div>
      </div>
      <div class="pt-hint">แตะตัวไหนก็ได้เพื่อดูรายละเอียด · วิวัฒน์</div>

      <!-- แจ้งครั้งเดียวว่าเพ็ทที่ถืออยู่เปลี่ยนกลไก — ไม่ใช้ป๊อปอัป ไม่ส่งจดหมาย (user เคาะ 10 ก.ย.)
           ขึ้นเฉพาะคนที่มีเพ็ทในรายการจริง ⇒ คนที่ไม่ได้รับผลกระทบจะไม่โดนกวน -->
      <div v-if="showPassiveNews" class="pt-news">
        <div class="pt-news-txt">
          <b>พาสสีฟอัปเดต</b>
          <span>เพ็ทของคุณ {{ changedMine.length }} ตัวเปลี่ยนความสามารถ ({{ changedNames }}) — แตะการ์ดเพื่ออ่านของใหม่</span>
        </div>
        <button class="pt-news-x" @click="dismissPassiveNews">รับทราบ</button>
      </div>

      <div v-if="!sorted.length" class="pt-empty">
        ยังไม่มีสัตว์เลี้ยง — ไปกดอัญเชิญตัวแรกกันเถอะ <Emoji char="🥚" />
        <RouterLink to="/shop" class="pt-empty-cta">ไปอัญเชิญเลย →</RouterLink>
      </div>

      <div v-else class="pt-grid">
        <button
          v-for="p in sorted" :key="p.id"
          class="pt-cell" :style="{ borderColor: rarityColor(p.rarity) }"
          @click="sel = p.id"
        >
          <span v-if="activeSet.has(p.id)" class="pt-cell-team">ทีม</span>
          <span v-if="p.copies > 0" class="pt-cell-copies">×{{ p.copies }}</span>
          <span class="pt-cell-el"><Emoji :char="ELEMENTS[defOf(p.id).element]?.emoji || '✊'" /></span>
          <span class="pt-cell-emoji"><Emoji :char="p.emoji" /></span>
          <span class="pt-cell-name">{{ p.name }}</span>
          <span v-if="clampGrade(p.grade) > 0" class="pt-cell-grade">{{ GRADE_LABELS[clampGrade(p.grade)] }}</span>
        </button>
      </div>

      <!-- เพ็ทที่ยังแจกไม่ได้ — โชว์เงาดำเพื่อให้รู้ว่ามีของใหม่มา แต่อ่านพาสสีฟได้ (ไม่งั้นไม่สร้างความอยาก)
           กดไม่ได้โดยตั้งใจ: การ์ดที่กดแล้วเงียบทำให้คนคิดว่าแอปค้าง -->
      <template v-if="upcoming.length">
        <div class="pt-soon-head">
          <b>กำลังจะมา</b><small>ยังหมุนไม่ได้ตอนนี้</small>
        </div>
        <div class="pt-grid">
          <div v-for="p in upcoming" :key="p.id" class="pt-cell soon">
            <span class="pt-cell-el"><Emoji :char="ELEMENTS[p.element]?.emoji || '✊'" /></span>
            <span class="pt-cell-emoji shade"><Emoji :char="p.emoji" /></span>
            <span class="pt-cell-name">{{ passiveOf(p.id)?.name || '???' }}</span>
            <span class="pt-cell-soon">เร็วๆ นี้</span>
          </div>
        </div>
        <div class="pt-soon-list">
          <div v-for="p in upcoming" :key="p.id" class="pt-soon-row">
            <b>{{ passiveOf(p.id)?.name }}</b><span>{{ effectText(passiveOf(p.id)) }}</span>
          </div>
        </div>
      </template>
    </template>
    <div v-else class="pt-empty">เข้าสู่ระบบก่อนนะ</div>

    <PetDetailModal :pet-id="sel" @close="sel = null" />
    <TeamPicker v-model:open="pickOpen" />
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import Emoji from '../components/shared/Emoji.vue'
import HelpButton from '../components/help/HelpButton.vue'
import { useAuthStore } from '../stores/auth.js'
import { RARITY, PETS, ELEMENTS, GRADE_LABELS } from '../data/index.js'
import { PET_PASSIVES, PASSIVE_V2_CHANGED, effectText } from '../data/petPassives.js'
import { petDailyCoins } from '../utils/petUtils.js'
import { clampGrade } from '../data/petPower.js'
import { BATTLE_SLOTS } from '../data/residence.js'
import PetDetailModal from '../components/pets/PetDetailModal.vue'
import TeamPicker from '../components/battle/TeamPicker.vue'
import PetThumb from '../components/shared/PetThumb.vue'
import { releasedPets } from '../utils/petCatalog.js'
import { useAppConfig } from '../composables/useAppConfig.js'

const authStore = useAuthStore()
const { rawConfig } = useAppConfig()
// ตัวหารคือ "จำนวนที่หมุนได้จริง" ไม่ใช่ทั้งคลัง — defOf ยังอ่าน PETS เต็มเพราะต้องหาเพ็ทที่ถืออยู่ให้เจอเสมอ
const catalog = computed(() => releasedPets(rawConfig.value?.gachaEvent))
// เพ็ทที่ยังแจกไม่ได้ = อยู่ในคลังเต็มแต่ไม่อยู่ในคลังที่แจกได้ (ด่านเดียวคือ utils/petCatalog.js)
const upcoming = computed(() => {
  const live = new Set(catalog.value.map(p => p.id))
  return PETS.filter(p => !live.has(p.id))
})
const passiveOf = (id) => PET_PASSIVES[id] || null

const changedMine = computed(() => {
  const own = new Set(pets.value.map(p => p.id))
  return PASSIVE_V2_CHANGED.filter(id => own.has(id))
})
const changedNames = computed(() => {
  const names = changedMine.value.slice(0, 3).map(id => defOf(id).name).filter(Boolean)
  return changedMine.value.length > 3 ? `${names.join(' · ')} และอื่นๆ` : names.join(' · ')
})
const showPassiveNews = computed(() => !authStore.userData?.passiveV2Seen && changedMine.value.length > 0)
async function dismissPassiveNews() {
  await authStore.patchUser({ passiveV2Seen: true }, { passiveV2Seen: true })
}
const sel = ref(null)
const pickOpen = ref(false)

const pets = computed(() => authStore.userData?.pets || [])
const battleSlots = computed(() => BATTLE_SLOTS)
const teamSlots = computed(() => {
  const owned = new Set(pets.value.map(p => p.id))
  const a = (authStore.userData?.activePets || []).filter(id => id && owned.has(id)).slice(0, battleSlots.value)
  while (a.length < battleSlots.value) a.push(null)
  return a
})
const defOf = (id) => PETS.find(p => p.id === id) || { emoji: '❓' }
const teamPetOf = (id) => pets.value.find(p => p.id === id) || { id }
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
.pt-back { border: 2px solid var(--ink); background: #fff; width: 40px; height: 40px; border-radius: 10px; font-size: 1.2rem; cursor: pointer; line-height: 1; box-shadow: var(--pop); }
.pt-back:active { transform: translate(2px,2px); box-shadow: 0 0 0 var(--ink); }
.pt-team { background: #fff; border: 2px solid var(--ink); border-radius: 16px; box-shadow: var(--pop); padding: 12px; margin-bottom: 10px; }
.pt-team-head { display: flex; align-items: center; justify-content: space-between; font-size: .8rem; font-weight: 800; margin-bottom: 8px; }
.pt-team-edit { border: 2px solid var(--ink); background: #fff; border-radius: 10px; padding: 5px 12px; font-family: inherit; font-size: .72rem; font-weight: 800; cursor: pointer; box-shadow: var(--pop); }
.pt-team-edit:active { transform: translate(2px,2px); box-shadow: 0 0 0 var(--ink); }
.pt-team-slots { display: grid; gap: 8px; justify-content: center; }
.pt-team-slot { aspect-ratio: 1; border: 2px dashed rgba(0,0,0,.2); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.6rem; background: #f8fafc; }
.pt-team-slot.filled { border: none; background: none; cursor: pointer; }
.pt-team-empty { color: rgba(0,0,0,.25); font-size: 1.4rem; }
.pt-summary { display: flex; background: #fff; border: 2px solid var(--ink); border-radius: 16px; box-shadow: var(--pop); overflow: hidden; margin-bottom: 10px; }
.pt-summary > div { flex: 1; text-align: center; padding: 12px 4px; border-right: 1px solid var(--border, #efe7fb); }
.pt-summary > div:last-child { border-right: none; }
.pt-summary b { font-size: 1.05rem; font-weight: 800; }
.pt-summary small { display: block; font-size: .7rem; color: rgba(0,0,0,.45); }
.pt-hint { font-size: .7rem; color: rgba(0,0,0,.5); margin-bottom: 12px; }
.pt-empty { display: flex; flex-direction: column; align-items: center; gap: 14px; text-align: center; color: rgba(0,0,0,.45); padding: 30px 16px; font-size: .85rem; }
.pt-empty-cta { border: 2px solid var(--ink); background: var(--primary); color: #fff; border-radius: 12px; padding: 11px 20px; font-weight: 800; font-size: .85rem; text-decoration: none; box-shadow: var(--pop); }
.pt-empty-cta:active { transform: translate(2px,2px); box-shadow: 0 0 0 var(--ink); }
.pt-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
.pt-cell {
  position: relative; background: #fff; border: 2px solid var(--ink); border-radius: 14px;
  padding: 12px 4px 8px; display: flex; flex-direction: column; align-items: center; gap: 2px;
  cursor: pointer; font-family: inherit; box-shadow: var(--pop);
  transition: transform .1s, box-shadow .1s;
}
.pt-cell:active { transform: translate(2px,2px); box-shadow: 0 0 0 var(--ink); }
.pt-cell-emoji { font-size: 1.8rem; line-height: 1; }
.pt-cell-name { font-size: .7rem; font-weight: 700; color: rgba(0,0,0,.6); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; }
.pt-cell-copies { position: absolute; bottom: 2px; left: 4px; font-size: .7rem; font-weight: 800; color: rgba(0,0,0,.4); }
.pt-cell-el { position: absolute; top: 4px; left: 4px; font-size: .7rem; background: rgba(0,0,0,.06); border-radius: 7px; padding: 1px 3px; line-height: 1; }
.pt-cell-grade { position: absolute; bottom: -5px; right: -5px; background: #1e293b; color: #fff; font-size: .7rem; font-weight: 800; padding: 1px 6px; border-radius: 999px; border: 2px solid #fff; line-height: 1.3; }
.pt-news { display: flex; align-items: center; gap: 10px; margin: 10px 0 4px; padding: 10px 12px;
  background: #eef2ff; border: 2px solid var(--ink); border-radius: 14px; box-shadow: var(--pop); }
.pt-news-txt { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.pt-news-txt b { font-size: .85rem; }
.pt-news-txt span { font-size: .75rem; color: rgba(0,0,0,.6); line-height: 1.35; }
.pt-news-x { flex: none; align-self: center; background: var(--ink); color: #fff; border: 0;
  border-radius: 999px; padding: 6px 12px; font: 700 .75rem inherit; font-family: inherit; cursor: pointer; }
.pt-soon-head { display: flex; align-items: baseline; gap: 8px; margin: 18px 0 8px; }
.pt-soon-head b { font-size: .95rem; }
.pt-soon-head small { color: rgba(0,0,0,.45); font-size: .75rem; }
.pt-cell.soon { background: #f1f5f9; border-color: rgba(0,0,0,.15); box-shadow: none; cursor: default; }
.pt-cell-emoji.shade { filter: brightness(0); opacity: .38; }
.pt-cell-soon { position: absolute; top: -5px; right: -5px; background: #64748b; color: #fff;
  font-size: .62rem; font-weight: 800; padding: 1px 6px; border-radius: 999px; border: 2px solid #fff; }
.pt-soon-list { margin-top: 8px; display: flex; flex-direction: column; gap: 4px; }
.pt-soon-row { display: flex; gap: 6px; font-size: .75rem; line-height: 1.35; }
.pt-soon-row b { color: rgba(0,0,0,.75); white-space: nowrap; }
.pt-soon-row span { color: rgba(0,0,0,.5); }
.pt-cell-team { position: absolute; top: -5px; right: -5px; background: var(--primary); color: #fff; font-size: .7rem; font-weight: 800; padding: 1px 6px; border-radius: 999px; border: 2px solid #fff; }
</style>
