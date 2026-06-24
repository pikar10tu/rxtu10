<!-- TeamPicker — จัดทีม (= activePets, ช่อง = battleSlots ตามเลเวลบ้าน) ใช้ร่วมหอคอย+หน้าเพ็ท
     แตะช่องที่มีตัว = เปิด PetDetailModal (ดู/วิวัฒน์/ถอด) · แตะตัวในคลัง = สลับเข้า/ออกทีม -->
<template>
  <BottomSheet :open="open" icon="⚔️" title="จัดทีมต่อสู้" @update:open="$emit('update:open', $event)">
    <div class="tp-slots" :style="{ gridTemplateColumns: `repeat(${battleSlots}, 1fr)` }">
      <div v-for="(id, i) in slots" :key="i" class="tp-slot" :class="{ filled: id }" @click="id && (detailId = id)">
        <template v-if="id"><Emoji :char="defOf(id).emoji" /></template>
        <span v-else class="tp-empty">+</span>
      </div>
    </div>
    <div class="tp-hint">{{ filledCount }}/{{ battleSlots }} · แตะตัวในทีมเพื่อดู/ถอด · แตะคลังเพื่อสลับ</div>

    <div class="tp-pool">
      <button
        v-for="p in owned" :key="p.id"
        class="tp-pet" :class="{ active: activeIds.includes(p.id) }"
        :disabled="!activeIds.includes(p.id) && filledCount >= battleSlots"
        @click="toggle(p.id)"
      >
        <Emoji :char="defOf(p.id).emoji" />
        <span v-if="p.grade" class="tp-grade">{{ p.grade }}</span>
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
import { computed, ref } from 'vue'
import { useAuthStore } from '../../stores/auth.js'
import { getPetDef } from '../../data/index.js'
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
const defOf = (id) => getPetDef(id) || { emoji: '❓' }

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
.tp-slot.filled { border-style: solid; border-color: var(--ink); background: #eef2ff; cursor: pointer; }
.tp-empty { color: rgba(0,0,0,.25); font-size: 1.6rem; }
.tp-hint { font-size: .68rem; color: rgba(0,0,0,.45); text-align: center; margin-bottom: 12px; }
.tp-pool { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; }
.tp-pet { position: relative; aspect-ratio: 1; border: 2px solid rgba(0,0,0,.12); border-radius: 12px; background: #fff; font-size: 1.5rem; cursor: pointer; display: flex; align-items: center; justify-content: center; }
.tp-pet.active { border-color: var(--primary); background: #eef2ff; }
.tp-pet:disabled { opacity: .4; cursor: not-allowed; }
.tp-grade { position: absolute; bottom: 2px; right: 4px; font-size: .56rem; font-weight: 800; color: #b45309; }
.tp-none { grid-column: 1 / -1; text-align: center; font-size: .76rem; color: rgba(0,0,0,.4); padding: 16px 0; }
</style>
