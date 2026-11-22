<!-- src/components/admin/AdminCoinWatch.vue
     🕵️ จับเหรียญพุ่งผิดปกติ (22 พ.ย. 2026) — ตัวช่วยชี้ ไม่ใช่หลักฐาน
     บันทึก "จุดเทียบ" (เหรียญทุกคน) ไว้ที่ adminSnaps/coins (แอดมินอ่าน/เขียนเท่านั้น)
     แล้วเทียบกับตอนนี้ · ยึดคืน = ตั้งเหรียญใหม่ (rules: isAdmin เขียน user doc คนอื่นได้) -->
<template>
  <section class="admin-card">
    <div class="admin-card-head"><span><Emoji char="🕵️" /> เหรียญพุ่งผิดปกติ</span></div>
    <div class="cw-hint">
      เทียบเหรียญตอนนี้กับจุดเทียบที่บันทึกไว้ · แดง = ได้เกิน {{ fmt(SUSPECT_PER_DAY) }}/วัน · เหลือง = เกิน {{ fmt(WATCH_PER_DAY) }}/วัน ·
      ขายพืชสะสมหรือรับรางวัลซีซั่นก็ทำให้พุ่งได้ ดูประกอบก่อนยึดนะ
    </div>

    <div class="cw-bar">
      <span class="cw-at">
        <template v-if="loading">กำลังโหลด…</template>
        <template v-else-if="snap">จุดเทียบ: {{ when(snap.at) }} ({{ cmp.days.toFixed(1) }} วันก่อน)</template>
        <template v-else>ยังไม่เคยบันทึกจุดเทียบ</template>
      </span>
      <button class="cw-btn" :disabled="busy || loading" @click="saveSnap">{{ snap ? 'บันทึกจุดเทียบใหม่' : 'บันทึกจุดเทียบแรก' }}</button>
    </div>
    <div v-if="snap && cmp.days > SNAP_MAX_AGE_DAYS" class="cw-stale">จุดเทียบเก่าแล้ว เลขต่อวันจะเฉลี่ยจนดูเบาลง ลองบันทึกใหม่หลังตรวจเสร็จ</div>

    <ul v-if="shown.length" class="cw-list">
      <li v-for="r in shown" :key="r.uid" class="cw-row" :class="r.level">
        <div class="cw-main">
          <div class="cw-name">{{ r.nickname }}</div>
          <div class="cw-num">{{ fmt(r.before) }} → <b>{{ fmt(r.coins) }}</b> · <b>{{ r.gain >= 0 ? '+' : '' }}{{ fmt(r.gain) }}</b> ({{ fmt(Math.round(r.perDay)) }}/วัน)</div>
        </div>
        <div class="cw-act">
          <template v-if="editing === r.uid">
            <input v-model.number="newCoins" class="cw-input" type="number" min="0" inputmode="numeric" />
            <button class="cw-btn danger" :disabled="busy" @click="seize(r)">ตั้ง</button>
            <button class="cw-btn" @click="editing = null">ยกเลิก</button>
          </template>
          <button v-else class="cw-btn" @click="startEdit(r)">ยึดคืน</button>
        </div>
      </li>
    </ul>
    <div v-else-if="snap && !loading" class="cw-empty">ยังไม่มีใครเหรียญขึ้นเลย</div>
    <button v-if="cmp.rows.length > LIMIT" class="cw-more" @click="all = !all">{{ all ? 'ย่อ' : `ดูทั้งหมด ${cmp.rows.length} คน` }}</button>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'
import { db } from '../../firebase/config.js'
import { useMembersStore } from '../../stores/members.js'
import { useToast } from '../../composables/useToast.js'
import { useConfirm } from '../../composables/useConfirm.js'
import Emoji from '../shared/Emoji.vue'
import { makeSnapshot, compareSnapshot, SUSPECT_PER_DAY, WATCH_PER_DAY, SNAP_MAX_AGE_DAYS } from '../../utils/coinWatch.js'

const LIMIT = 10
const members = useMembersStore()
const { toast } = useToast()
const { confirm } = useConfirm()

const snap = ref(null)
const loading = ref(true)
const busy = ref(false)
const all = ref(false)
const editing = ref(null)
const newCoins = ref(0)
const now = ref(Date.now())

const fmt = (n) => Number(n || 0).toLocaleString()
const when = (ms) => new Date(ms).toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' })
// คนทั้งหมด = นักศึกษา/ทีมงาน (fbUsers) + guest · AdminView โหลดสด (force) ตอนเปิดหน้าอยู่แล้ว
const people = computed(() => [...Object.values(members.fbUsers || {}), ...(members.guestUsers || [])])
const cmp = computed(() => compareSnapshot(people.value, snap.value, now.value))
const shown = computed(() => (all.value ? cmp.value.rows : cmp.value.rows.slice(0, LIMIT)))

onMounted(async () => {
  try {
    const s = await getDoc(doc(db, 'adminSnaps', 'coins'))
    if (s.exists()) snap.value = s.data()
  } catch (e) { console.error('[coinWatch load]', e); toast('โหลดจุดเทียบไม่สำเร็จ', 'error') }
  loading.value = false
})

async function saveSnap() {
  if (snap.value && !(await confirm('บันทึกจุดเทียบใหม่? ตัวเลขที่เทียบอยู่ตอนนี้จะเริ่มนับใหม่จากตอนนี้'))) return
  busy.value = true
  try {
    const s = makeSnapshot(people.value)
    await setDoc(doc(db, 'adminSnaps', 'coins'), s)
    snap.value = s
    now.value = Date.now()
    toast(`บันทึกจุดเทียบแล้ว (${Object.keys(s.coins).length} คน)`, 'success')
  } catch (e) { console.error('[coinWatch save]', e); toast('บันทึกไม่สำเร็จ', 'error') }
  busy.value = false
}

function startEdit(r) { editing.value = r.uid; newCoins.value = Math.max(0, r.before) }

async function seize(r) {
  const n = Math.floor(Number(newCoins.value))
  if (!Number.isFinite(n) || n < 0) { toast('ใส่จำนวนเหรียญให้ถูกก่อน', 'error'); return }
  if (!(await confirm(`ตั้งเหรียญของ ${r.nickname} จาก ${fmt(r.coins)} เป็น ${fmt(n)}?`))) return
  busy.value = true
  try {
    await updateDoc(doc(db, 'users', r.uid), { coins: n })
    const m = people.value.find(x => x.uid === r.uid)
    if (m) m.coins = n
    editing.value = null
    toast(`ตั้งเหรียญ ${r.nickname} เป็น ${fmt(n)} แล้ว`, 'success')
  } catch (e) { console.error('[coinWatch seize]', e); toast('ตั้งเหรียญไม่สำเร็จ', 'error') }
  busy.value = false
}
</script>

<style scoped>
.cw-hint { font-size: .72rem; color: rgba(0, 0, 0, .5); margin-bottom: 10px; line-height: 1.5; }
.cw-bar { display: flex; align-items: center; justify-content: space-between; gap: 8px; flex-wrap: wrap; margin-bottom: 8px; }
.cw-at { font-size: .78rem; font-weight: 700; }
.cw-stale { font-size: .72rem; background: #fff7e6; border: var(--bw) solid var(--line); border-radius: 10px; padding: 6px 10px; margin-bottom: 8px; }
.cw-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 6px; }
.cw-row { display: flex; align-items: center; justify-content: space-between; gap: 8px; flex-wrap: wrap; border: var(--bw) solid var(--line); border-radius: 12px; padding: 8px 10px; background: #fff; }
.cw-row.red { background: #fee2e2; }
.cw-row.yellow { background: #fef9c3; }
.cw-main { min-width: 0; flex: 1; }
.cw-name { font-weight: 800; font-size: .86rem; }
.cw-num { font-size: .74rem; color: rgba(0, 0, 0, .65); overflow-wrap: anywhere; }
.cw-act { display: flex; gap: 4px; align-items: center; }
.cw-input { width: 110px; border: var(--bw) solid var(--line); border-radius: 8px; padding: 5px 8px; font-family: inherit; font-size: .8rem; }
.cw-btn { border: var(--bw) solid var(--line); border-radius: 8px; padding: 5px 10px; font-family: inherit; font-size: .74rem; font-weight: 800; background: #fff; box-shadow: var(--pop); cursor: pointer; }
.cw-btn.danger { background: #ef4444; color: #fff; }
.cw-btn:disabled { opacity: .4; cursor: default; }
.cw-empty { font-size: .78rem; color: rgba(0, 0, 0, .5); }
.cw-more { margin-top: 8px; background: none; border: 0; font-family: inherit; font-size: .76rem; font-weight: 700; color: var(--primary); cursor: pointer; }
</style>
