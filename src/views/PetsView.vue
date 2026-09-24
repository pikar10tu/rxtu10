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
          <button class="pt-team-edit" @click="pickOpen = true">⚙️ จัดทีม</button>
        </div>
        <div class="pt-team-slots" :style="{ gridTemplateColumns: `repeat(${battleSlots}, 78px)` }">
          <div v-for="(id, i) in teamSlots" :key="i" class="pt-team-slot" :class="{ filled: id }" :style="id ? { '--rc': rarityColor(teamPetOf(id).rarity) } : null" @click="id ? sel = id : pickOpen = true">
            <span class="pt-team-no">{{ i + 1 }}</span>
            <PetThumb v-if="id" :pet="teamPetOf(id)" />
            <span v-else class="pt-team-empty">＋</span>
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
          class="pt-cell" :style="{ '--rc': rarityColor(p.rarity) }"
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

      <!-- เพ็ทที่ยังไม่ปลดล็อก — เงาดำ ชื่อเป็น ????? (user เคาะ 11 ก.ย.)
           รวมทุกตัวที่ยังหาได้ ไม่ใช่แค่ตัวใหม่ · กดไม่ได้โดยตั้งใจ (การ์ดที่กดแล้วเงียบทำให้คนคิดว่าแอปค้าง) -->
      <template v-if="locked.length">
        <div class="pt-soon-head">
          <b>ยังไม่ปลดล็อก</b><small>{{ locked.length }} ชนิด</small>
        </div>
        <div class="pt-grid">
          <div v-for="p in locked" :key="p.id" class="pt-cell soon">
            <span class="pt-cell-emoji shade"><Emoji :char="p.emoji" /></span>
            <span class="pt-cell-name">?????</span>
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
import { PET_PASSIVES, PASSIVE_V2_CHANGED } from '../data/petPassives.js'
import { petDailyCoins } from '../utils/petUtils.js'
import { clampGrade } from '../data/petPower.js'
import { BATTLE_SLOTS } from '../data/residence.js'
import PetDetailModal from '../components/pets/PetDetailModal.vue'
import TeamPicker from '../components/battle/TeamPicker.vue'
import PetThumb from '../components/shared/PetThumb.vue'
import { obtainablePets } from '../utils/petCatalog.js'
import { useAppConfig } from '../composables/useAppConfig.js'

const authStore = useAuthStore()
const { rawConfig } = useAppConfig()
// ตัวหารคือ "จำนวนที่หมุนได้จริง" ไม่ใช่ทั้งคลัง — defOf ยังอ่าน PETS เต็มเพราะต้องหาเพ็ทที่ถืออยู่ให้เจอเสมอ
// ตัวหาร "x/y ชนิด" ต้องเป็น "หาได้จริงตอนนี้" ไม่ใช่ "ตู้ปกติมีอะไร" — เปิดอีเวนต์แล้วหาได้ 33
const catalog = computed(() => obtainablePets(rawConfig.value?.gachaEvent))
// ยังไม่ปลดล็อก = ของที่ยังหาได้ แต่ยังไม่มีในกรง
const locked = computed(() => {
  const own = new Set(pets.value.map(p => p.id))
  return catalog.value.filter(p => !own.has(p.id))
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
.pt-back { border: var(--bw) solid var(--line); background: #fff; width: 40px; height: 40px; border-radius: 10px; font-size: 1.2rem; cursor: pointer; line-height: 1; box-shadow: var(--pop); }
.pt-back:active { transform: translate(2px,2px); box-shadow: 0 0 0 var(--ink); }
.pt-team { background: #fff; border: var(--bw) solid var(--line); border-radius: 16px; box-shadow: var(--pop); padding: 12px; margin-bottom: 10px; }
.pt-team-head { display: flex; align-items: center; justify-content: space-between; font-size: .8rem; font-weight: 800; margin-bottom: 8px; }
.pt-team-edit { border: var(--bw) solid var(--line); background: #fff; border-radius: 10px; padding: 5px 12px; font-family: inherit; font-size: .72rem; font-weight: 800; cursor: pointer; box-shadow: var(--pop); }
.pt-team-edit:active { transform: translate(2px,2px); box-shadow: 0 0 0 var(--ink); }
.pt-team-slots { display: grid; gap: 8px; justify-content: center; }
.pt-team-slot { aspect-ratio: 1; border: 2px dashed rgba(0,0,0,.2); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.6rem; background: #f8fafc; }
.pt-team-slot.filled { border: none; background: none; cursor: pointer; }
.pt-team-empty { color: rgba(0,0,0,.25); font-size: 1.4rem; }
.pt-summary { display: flex; background: #fff; border: var(--bw) solid var(--line); border-radius: 16px; box-shadow: var(--pop); overflow: hidden; margin-bottom: 10px; }
.pt-summary > div { flex: 1; text-align: center; padding: 12px 4px; border-right: 1px solid var(--border, #efe7fb); }
.pt-summary > div:last-child { border-right: none; }
.pt-summary b { font-size: 1.05rem; font-weight: 800; }
.pt-summary small { display: block; font-size: .7rem; color: rgba(0,0,0,.45); }
.pt-hint { font-size: .7rem; color: rgba(0,0,0,.5); margin-bottom: 12px; }
.pt-empty { display: flex; flex-direction: column; align-items: center; gap: 14px; text-align: center; color: rgba(0,0,0,.45); padding: 30px 16px; font-size: .85rem; }
.pt-empty-cta { border: var(--bw) solid var(--line); background: var(--primary); color: #fff; border-radius: 12px; padding: 11px 20px; font-weight: 800; font-size: .85rem; text-decoration: none; box-shadow: var(--pop); }
.pt-empty-cta:active { transform: translate(2px,2px); box-shadow: 0 0 0 var(--ink); }
.pt-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
.pt-cell {
  position: relative; background: #fff; border: var(--bw) solid var(--line); border-radius: 14px;
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
  background: #eef2ff; border: var(--bw) solid var(--line); border-radius: 14px; box-shadow: var(--pop); }
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
.pt-cell-team { position: absolute; top: -5px; right: -5px; background: var(--primary); color: #fff; font-size: .7rem; font-weight: 800; padding: 1px 6px; border-radius: 999px; border: 2px solid #fff; }

/* ═══ จัดใหม่ 25 ก.ย. 2026 — การ์ดย้อมสีตามความหายาก (--rc) · เข้าชุดกับหน้าจัดทีม ═══ */
.pt-team { border-radius: 20px; padding: 14px; background: linear-gradient(150deg, #e6dcfd, #fff 65%); }
.pt-team-head { font-size: .88rem; }
.pt-team-edit { border: 0; background: linear-gradient(135deg, #8b6ee0, #b9a6ef); color: #fff; border-radius: 999px; padding: 6px 14px; box-shadow: var(--pop); }
.pt-team-slots { gap: 10px; }
.pt-team-slot { position: relative; border: 2px dashed #c9b8f4; border-radius: 16px; background: rgba(255,255,255,.65); }
.pt-team-slot.filled { border: 2px solid var(--rc); background: linear-gradient(170deg, color-mix(in srgb, var(--rc) 16%, #fff), #fff 70%); box-shadow: var(--pop); }
.pt-team-no { position: absolute; top: 3px; left: 6px; font-size: .7rem; font-weight: 800; color: var(--muted); z-index: 1; }
.pt-team-empty { color: #b9a6ef; }
.pt-summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; background: none; border: 0; box-shadow: none; overflow: visible; }
.pt-summary > div { border: var(--bw) solid var(--line); border-right: var(--bw) solid var(--line); border-radius: 14px; background: #fff; box-shadow: var(--pop); }
.pt-grid { gap: 10px; }
.pt-cell { border: 1.5px solid color-mix(in srgb, var(--rc) 60%, #fff); border-radius: 16px; background: linear-gradient(170deg, color-mix(in srgb, var(--rc) 14%, #fff), #fff 70%); }
.pt-cell:active { transform: scale(.96); box-shadow: var(--pop); }
.pt-cell-emoji { font-size: 2rem; }
.pt-cell-name { color: var(--ink); }
.pt-cell-el { background: rgba(255,255,255,.8); }
.pt-cell-grade { background: var(--rc); }
.pt-cell-team { background: #8b6ee0; }
.pt-cell.soon { background: rgba(255,255,255,.55); border: 1.5px dashed #cbd5e1; }
</style>
