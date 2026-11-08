<!--
  กรอก/แก้ข้อมูลเกิด — วัน+เดือนบังคับ · ปี/เวลาไม่บังคับ (มีค่ากลาง)
  เก็บเต็มใน users/{uid}/private/horo (เจ้าของอ่านคนเดียว) · user doc เก็บแค่ผลคำนวณ horo:{sign,dow,asc,ascApprox}
  spec: docs/superpowers/specs/2026-11-09-horoscope-design.md
-->
<template>
  <form class="hs" @submit.prevent="save">
    <p class="hs-lead">กรอกวันเกิดเพื่อดูดวงตามราศีและสีมงคลของคุณ ข้อมูลนี้คุณเห็นคนเดียว</p>
    <div class="hs-row">
      <label class="hs-f"><span>วัน</span>
        <select id="horo-d" v-model.number="d" required><option :value="null" disabled>–</option><option v-for="n in 31" :key="n" :value="n">{{ n }}</option></select>
      </label>
      <label class="hs-f hs-grow"><span>เดือน</span>
        <select id="horo-m" v-model.number="m" required><option :value="null" disabled>–</option><option v-for="(t, i) in MONTHS" :key="i" :value="i + 1">{{ t }}</option></select>
      </label>
      <label class="hs-f"><span>ปี พ.ศ.</span>
        <input id="horo-y" v-model.number="yBE" type="number" inputmode="numeric" min="2480" :max="maxBE" placeholder="ไม่ระบุ" />
      </label>
    </div>
    <label class="hs-f"><span>เวลาเกิด</span>
      <input id="horo-t" v-model="time" type="time" />
    </label>
    <ul class="hs-notes">
      <li>ไม่รู้ปีเกิด: ยังดูราศี ไพ่ และดวงรายวันได้ แต่จะไม่มีลัคนาและสีมงคล</li>
      <li>ไม่รู้เวลาเกิด: ระบบใช้ 06:00 น. ตามที่โหรไทยนิยม ลัคนาจะขึ้นว่า "โดยประมาณ"</li>
    </ul>
    <p v-if="err" class="hs-err">{{ err }}</p>
    <div class="hs-actions">
      <button type="submit" class="hs-save" :disabled="saving || !d || !m">{{ saving ? 'กำลังบันทึก…' : 'บันทึก' }}</button>
      <button v-if="had" type="button" class="hs-del" :disabled="saving" @click="remove">ลบข้อมูลเกิด</button>
    </div>
  </form>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { doc, getDoc, setDoc, deleteDoc, serverTimestamp, deleteField } from 'firebase/firestore'
import { db } from '../../firebase/config.js'
import { useAuthStore } from '../../stores/auth.js'
import { useToast } from '../../composables/useToast.js'
import { birthProfile } from '../../utils/horo.js'

const emit = defineEmits(['saved'])
const auth = useAuthStore()
const { toast } = useToast()
const MONTHS = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม']
const maxBE = new Date().getFullYear() + 543
const d = ref(null), m = ref(null), yBE = ref(null), time = ref('')
const had = ref(false), saving = ref(false), err = ref('')
const ref_ = computed(() => doc(db, 'users', auth.currentUser.uid, 'private', 'horo'))

onMounted(async () => {
  try {
    const s = await getDoc(ref_.value)
    if (s.exists()) {
      const x = s.data(); had.value = true
      d.value = x.d; m.value = x.m; yBE.value = x.y ? x.y + 543 : null; time.value = x.time || ''
    }
  } catch (e) { console.error('[horo load]', e) }
})

async function save() {
  err.value = ''
  const y = yBE.value ? Number(yBE.value) - 543 : null
  if (y && (y < 1937 || y > new Date().getFullYear())) { err.value = 'ปี พ.ศ. ไม่ถูกต้อง ลองตรวจอีกครั้ง'; return }
  const days = new Date(Date.UTC(y || 2000, m.value, 0)).getUTCDate()   // 2000 = ปีอธิกสุรทิน → 29 ก.พ. ผ่านเมื่อไม่ระบุปี
  if (d.value > days) { err.value = `${MONTHS[m.value - 1]}มีแค่ ${days} วัน`; return }
  saving.value = true
  try {
    const t = time.value || null
    await setDoc(ref_.value, { d: d.value, m: m.value, y, time: t, updatedAt: serverTimestamp() })
    const horo = birthProfile({ d: d.value, m: m.value, y, time: t })
    const ok = await auth.patchUser({ horo }, { horo })
    if (!ok) throw new Error('patch')
    had.value = true
    toast('บันทึกแล้ว', 'success')
    emit('saved')
  } catch (e) {
    console.error('[horo save]', e); err.value = 'บันทึกไม่สำเร็จ ลองใหม่อีกครั้ง'
  } finally { saving.value = false }
}

async function remove() {
  saving.value = true
  try {
    await deleteDoc(ref_.value)
    await auth.patchUser({ horo: null }, { horo: deleteField() })
    had.value = false; d.value = m.value = yBE.value = null; time.value = ''
    toast('ลบข้อมูลเกิดแล้ว', 'success')
  } catch (e) { console.error('[horo del]', e); err.value = 'ลบไม่สำเร็จ ลองใหม่อีกครั้ง' } finally { saving.value = false }
}
</script>

<style scoped>
.hs { display: flex; flex-direction: column; gap: 12px; }
.hs-lead { margin: 0; font-size: .84rem; color: var(--muted); line-height: 1.6; }
.hs-row { display: flex; gap: 8px; flex-wrap: wrap; }
.hs-f { display: flex; flex-direction: column; gap: 4px; font-size: .76rem; font-weight: 700; color: var(--muted); }
.hs-grow { flex: 1; min-width: 120px; }
.hs-f select, .hs-f input { font: inherit; font-size: .9rem; color: var(--ink); background: #fff; border: var(--bw) solid var(--line); border-radius: 12px; padding: 9px 10px; min-width: 72px; }
.hs-f input[type=number] { width: 104px; }
.hs-notes { margin: 0; padding-left: 18px; font-size: .76rem; color: var(--muted); line-height: 1.6; }
.hs-err { margin: 0; font-size: .8rem; color: #be123c; }
.hs-actions { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
.hs-save { font: inherit; font-weight: 800; border: 0; background: var(--primary); color: #fff; border-radius: 999px; padding: 10px 22px; cursor: pointer; }
.hs-save:disabled { opacity: .55; cursor: default; }
.hs-del { font: inherit; font-size: .8rem; border: 0; background: none; color: var(--muted); text-decoration: underline; cursor: pointer; }
</style>
