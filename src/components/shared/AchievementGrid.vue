<template>
  <div class="ach-grid-wrap">
    <div class="ach-grid-head">ความสำเร็จ <span v-if="items.length" class="ach-count">{{ items.length }}</span></div>
    <div v-if="loading" class="ach-empty">กำลังโหลด…</div>
    <div v-else-if="!items.length" class="ach-empty">ยังไม่มีความสำเร็จ — เริ่มเล่นเพื่อปลดล็อก!</div>
    <div v-else class="ach-grid">
      <button v-for="a in items" :key="a.docId" type="button" class="ach-item" :class="{ eq: owner && equip === a.docId, pin: owner && pins.includes(a.docId) }" :title="a.desc" @click="selected = a">
        <span class="ach-item-icon"><Emoji :char="a.icon" /></span>
        <span class="ach-item-title">{{ a.label }}</span>
      </button>
    </div>
    <AchievementDetailModal :item="selected" :owner="owner" :equipped="!!selected && equip === selected.docId"
      :pinned="!!selected && pins.includes(selected.docId)" @close="selected = null" @equip="onEquip" @pin="onPin" />
  </div>
</template>

<script setup>
import Emoji from './Emoji.vue'
import AchievementDetailModal from './AchievementDetailModal.vue'
import { ref, watch, computed } from 'vue'
import { useAuthStore } from '../../stores/auth.js'
import { useToast } from '../../composables/useToast.js'
import { fetchAchievementItems } from '../../composables/useAchievementItems.js'
import { useRosterSync } from '../../composables/useRosterSync.js'

// items: แม่โหลดมาแล้ว (ProfileModal) → ไม่ query ซ้ำ · owner: ของตัวเอง → กดแล้วสวมฉายา/ปักตู้โชว์ได้
const emit = defineEmits(['pin', 'unpin'])
const props = defineProps({
  uid: { type: String, default: null },
  items: { type: Array, default: null },
  owner: { type: Boolean, default: false },
})
const auth = useAuthStore()
const { toast } = useToast()
const { syncRosterRow } = useRosterSync()
const own = ref([])
const loading = ref(false)
const selected = ref(null)
const items = computed(() => props.items ?? own.value)

async function load(uid) {
  if (props.items) return
  if (!uid) { own.value = []; return }
  loading.value = true
  try { own.value = await fetchAchievementItems(uid) }
  catch (e) { console.error('[achievement grid]', e) }
  finally { loading.value = false }
}
watch(() => props.uid, load, { immediate: true })

const equip = computed(() => auth.userData?.equipTitle || null)
const pins = computed(() => auth.userData?.pinnedAch || [])
async function onEquip(docId) {
  const next = equip.value === docId ? null : docId
  const ok = await auth.patchUser({ equipTitle: next }, { equipTitle: next })
  if (!ok) { toast('บันทึกไม่สำเร็จ', 'error'); return }
  syncRosterRow()   // ฉายาขึ้นใต้ชื่อในหน้าสมาชิก (แถว roster ti)
}
// ตู้โชว์: ส่งต่อให้แม่ (ShowcaseEditor ในหน้าฉันเป็นคนตัดสินว่าลงช่องไหน — ไม่ดันอันเก่าออกเงียบๆ)
// อยู่ในตู้แล้วกดอีกที = เอาออก
function onPin(docId) {
  if (pins.value.includes(docId)) emit('unpin', docId)
  else emit('pin', docId)
  selected.value = null
}
</script>

<style scoped>
.ach-grid-wrap { margin-top: 14px; }
.ach-grid-head { font-size: .8rem; font-weight: 800; color: var(--ink); margin-bottom: 8px; display: flex; align-items: center; gap: 6px; }
.ach-count { font-size: .7rem; background: var(--primary); color: #fff; border-radius: 999px; padding: 1px 7px; }
.ach-empty { font-size: .72rem; color: rgba(0,0,0,.4); }
.ach-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(72px, 1fr)); gap: 8px; }
.ach-item { display: flex; flex-direction: column; align-items: center; gap: 3px; padding: 8px 4px; border: var(--bw) solid var(--line); border-radius: 12px; background: #fff; box-shadow: var(--pop); text-align: center; font-family: inherit; cursor: pointer; transition: transform .1s, box-shadow .1s; }
.ach-item:active { transform: translate(2px,2px); box-shadow: 0 0 0 var(--ink); }
.ach-item.pin { border-color: var(--primary-2); background: var(--primary-light); }
.ach-item.eq { box-shadow: 0 0 0 2px var(--accent); }
.ach-item-icon { font-size: 1.5rem; }
.ach-item-title { font-size: .7rem; font-weight: 700; color: var(--ink); line-height: 1.2; }
</style>
