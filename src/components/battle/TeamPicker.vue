<!-- TeamPicker — จัดทีม (= activePets, ช่อง = battleSlots ตามเลเวลบ้าน) ใช้ร่วมหอคอย+หน้าเพ็ท
     แตะช่องที่มีตัว = เปิด PetDetailModal (ดู/วิวัฒน์/ถอด) · แตะตัวในคลัง = สลับเข้า/ออกทีม
     คลังเรียง rarity (legendary→common) + เกรด · โชว์ ธาตุ/เกรด/ชื่อ ต่อตัว -->
<template>
  <BottomSheet :open="open" icon="⚔️" title="จัดทีมต่อสู้" @update:open="$emit('update:open', $event)">
    <div class="tp-slots" :style="{ gridTemplateColumns: `repeat(${battleSlots}, 1fr)` }">
      <div v-for="(id, i) in slots" :key="i" class="tp-slot" :class="{ filled: id }" @click="id && (detailId = id)">
        <PetThumb v-if="id" :pet="slotPetOf(id)" />
        <span v-else class="tp-empty">+</span>
      </div>
    </div>
    <div class="tp-hint">{{ filledCount }}/{{ battleSlots }} · แตะตัวในทีมเพื่อดู/ถอด · แตะคลังเพื่อสลับ</div>

    <div class="tp-pool">
      <button
        v-for="p in sortedOwned" :key="p.id"
        class="tp-pet" :class="{ active: activeIds.includes(p.id) }"
        :style="{ borderColor: rarityColor(p.id) }"
        :disabled="!activeIds.includes(p.id) && filledCount >= battleSlots"
        @click="toggle(p.id)"
      >
        <span class="tp-el"><Emoji :char="elEmoji(p.id)" /></span>
        <span class="tp-emoji"><Emoji :char="defOf(p.id).emoji" /></span>
        <span class="tp-name">{{ defOf(p.id).name }}</span>
        <PetStatLine :pet="p" />
      </button>
      <div v-if="!owned.length" class="tp-none">ยังไม่มีเพ็ท — ไปเปิดกาชาที่ร้านค้าก่อนนะ</div>
    </div>

    <PetDetailModal :pet-id="detailId" @close="detailId = null" />
  </BottomSheet>
</template>

<script setup>
import Emoji from '../shared/Emoji.vue'
import BottomSheet from '../shared/BottomSheet.vue'
import PetDetailModal from '../pets/PetDetailModal.vue'
import PetStatLine from '../shared/PetStatLine.vue'
import PetThumb from '../shared/PetThumb.vue'
import { computed, ref } from 'vue'
import { useAuthStore } from '../../stores/auth.js'
import { getPetDef, RARITY, ELEMENTS } from '../../data/index.js'
import { residenceBattleSlots } from '../../data/residence.js'

defineProps({ open: { type: Boolean, default: false } })
defineEmits(['update:open'])

const auth = useAuthStore()
const detailId = ref(null)
const owned = computed(() => auth.userData?.pets || [])
const battleSlots = computed(() => residenceBattleSlots(auth.userData?.residence?.level || 1))
const ownedIds = computed(() => new Set(owned.value.map(p => p.id)))
// active เฉพาะตัวที่ยังครอบครอง ตัดให้ยาวไม่เกิน battleSlots
const activeIds = computed(() =>
  (auth.userData?.activePets || []).filter(id => id && ownedIds.value.has(id)).slice(0, battleSlots.value))
const slots = computed(() => {
  const a = activeIds.value.slice()
  while (a.length < battleSlots.value) a.push(null)
  return a
})
const filledCount = computed(() => slots.value.filter(Boolean).length)

const defOf = (id) => getPetDef(id) || { emoji: '❓', name: '?', rarity: 'common', element: 'scissors' }
const slotPetOf = (id) => owned.value.find(p => p.id === id) || { id }
const rarityColor = (id) => RARITY[defOf(id).rarity]?.color || '#94a3b8'
const elEmoji = (id) => ELEMENTS[defOf(id).element]?.emoji || '✊'

// เรียง legendary→common → เกรดสูงก่อน → ชื่อ (เหมือนหน้าเพ็ท)
const RANK = { legendary: 0, epic: 1, rare: 2, common: 3 }
const sortedOwned = computed(() => owned.value.slice().sort((a, b) => {
  const da = defOf(a.id), db = defOf(b.id)
  return (RANK[da.rarity] - RANK[db.rarity]) || ((b.grade || 0) - (a.grade || 0)) || (da.name || '').localeCompare(db.name || '')
}))

async function save(next) { await auth.patchUser({ activePets: next }, { activePets: next }) }
function toggle(id) {
  const cur = activeIds.value.slice()
  const at = cur.indexOf(id)
  if (at >= 0) cur.splice(at, 1)
  else { if (cur.length >= battleSlots.value) return; cur.push(id) }
  save(cur)
}
</script>

<style scoped>
.tp-slots { display: grid; gap: 8px; margin-bottom: 6px; }
.tp-slot { aspect-ratio: 1; border: 2px dashed rgba(0,0,0,.2); border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 1.8rem; background: #f8fafc; }
.tp-slot.filled { border: none; background: none; cursor: pointer; }
.tp-empty { color: rgba(0,0,0,.25); font-size: 1.6rem; }
.tp-hint { font-size: .68rem; color: rgba(0,0,0,.45); text-align: center; margin-bottom: 12px; }

.tp-pool { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
.tp-pet { position: relative; border: 2px solid #ddd; border-radius: 12px; background: #fff; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 1px; padding: 14px 2px 6px; font-family: inherit; transition: transform .1s; }
.tp-pet:active:not(:disabled) { transform: scale(.95); }
.tp-pet.active { background: #eef2ff; box-shadow: inset 0 0 0 2px var(--primary); }
.tp-pet:disabled { opacity: .4; cursor: not-allowed; }
.tp-emoji { font-size: 1.7rem; line-height: 1; }
.tp-name { font-size: .54rem; font-weight: 700; color: rgba(0,0,0,.6); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; }
.tp-el { position: absolute; top: 2px; left: 3px; font-size: .72rem; line-height: 1; }
.tp-grade { position: absolute; top: -5px; right: -5px; background: #1e293b; color: #fff; font-size: .52rem; font-weight: 800; padding: 1px 5px; border-radius: 999px; border: 2px solid #fff; }
.tp-none { grid-column: 1 / -1; text-align: center; font-size: .76rem; color: rgba(0,0,0,.4); padding: 16px 0; }
</style>
