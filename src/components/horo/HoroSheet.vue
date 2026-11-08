<!-- แผ่นดวงประจำวัน — ดูดวง / กรอกข้อมูลเกิด (โหลดแบบ lazy เพราะ astronomy-engine) -->
<template>
  <BottomSheet :open="open" icon="🔮" :title="view === 'setup' ? 'ข้อมูลเกิด' : 'ดวงวันนี้'" @update:open="$emit('update:open', $event)">
    <template #actions>
      <button v-if="view === 'read'" class="hsh-btn" @click="view = 'setup'">{{ auth.userData?.horo ? 'แก้วันเกิด' : 'กรอกวันเกิด' }}</button>
      <button v-else-if="auth.userData?.horo" class="hsh-btn" @click="view = 'read'">‹ กลับไปดูดวง</button>
    </template>
    <HoroReading v-if="view === 'read'" @setup="view = 'setup'" />
    <HoroSetup v-else @saved="view = 'read'" />
  </BottomSheet>
</template>

<script setup>
import { ref, watch } from 'vue'
import BottomSheet from '../shared/BottomSheet.vue'
import HoroReading from './HoroReading.vue'
import HoroSetup from './HoroSetup.vue'
import { useAuthStore } from '../../stores/auth.js'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../../firebase/config.js'
import { birthProfile, HORO_V } from '../../utils/horo.js'

const props = defineProps({ open: Boolean, start: { type: String, default: 'read' } })
defineEmits(['update:open'])
const auth = useAuthStore()
const view = ref(props.start)
// ค่าที่คำนวณด้วยสูตรเก่า (ลัคนาดาราศาสตร์) → อ่านข้อมูลเกิดแล้วคำนวณใหม่ครั้งเดียว
let tried = false
async function upgrade() {
  const h = auth.userData?.horo
  if (tried || !h || h.v === HORO_V || !auth.currentUser) return
  tried = true
  try {
    const s = await getDoc(doc(db, 'users', auth.currentUser.uid, 'private', 'horo'))
    if (!s.exists()) return
    const horo = birthProfile(s.data())
    await auth.patchUser({ horo }, { horo })
  } catch (e) { console.error('[horo upgrade]', e) }
}
watch(() => props.open, (o) => { if (o) { view.value = props.start; upgrade() } }, { immediate: true })
</script>

<style scoped>
.hsh-btn { font: inherit; font-size: .76rem; font-weight: 800; border: var(--bw) solid var(--line); background: #fff; color: var(--primary); border-radius: 999px; padding: 5px 10px; cursor: pointer; white-space: nowrap; }
</style>
