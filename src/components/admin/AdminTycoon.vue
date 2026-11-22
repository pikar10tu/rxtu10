<!-- src/components/admin/AdminTycoon.vue
     🎲 เศรษฐีรอบโลก (เดโม) — ทางเข้าเกม + รายชื่อผู้ทดสอบ (config/app.tycoonTesters) + รายงานรอบล่าสุดจาก Claude -->
<template>
  <section class="admin-card">
    <div class="admin-card-head"><span><Emoji char="🎲" /> เศรษฐีรอบโลก (ทดลอง)</span><RouterLink to="/play/tycoon" class="at-go">เข้าเกม ›</RouterLink></div>

    <details class="at-report" open>
      <summary>📋 รายงานจาก Claude · 22 พ.ย. 2026</summary>
      <ul>
        <li v-for="(l, i) in REPORT" :key="i">{{ l }}</li>
      </ul>
    </details>

    <div class="at-sub">ผู้ทดสอบ ({{ testers.length }}) — เห็นการ์ดเกมในหน้า Play และเข้าห้องได้</div>
    <div class="at-list">
      <span v-for="m in testers" :key="m.uid" class="at-chip">{{ m.nickname }}<button type="button" aria-label="เอาออก" @click="removeTester(m.uid)">✕</button></span>
      <span v-if="!testers.length" class="at-none">ยังไม่มี — แอดมินเข้าได้เสมออยู่แล้ว</span>
    </div>
    <div class="at-add">
      <input v-model="q" class="at-in" placeholder="พิมพ์ชื่อเล่นเพื่อน…" />
      <button v-for="m in matches" :key="m.uid" type="button" class="at-pick" @click="addTester(m.uid)">+ {{ m.nickname }}</button>
    </div>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore'
import { db } from '../../firebase/config.js'
import { useAppConfig } from '../../composables/useAppConfig.js'
import { useMembersStore } from '../../stores/members.js'
import { useToast } from '../../composables/useToast.js'
import Emoji from '../shared/Emoji.vue'

const REPORT = [
  'เดโมเล่นได้แล้ว: กระดานแผนที่โลก 32 ช่อง · เล่นกับบอท 1–3 ตัว หรือสร้างห้องให้เพื่อน 2–4 คน (เติมบอทได้) · ยังไม่มีสมบัติ ยังไม่แจกเหรียญ',
  'ทางเข้า: การ์ด "🎲 เศรษฐีรอบโลก" ในหน้า Play (เห็นเฉพาะแอดมิน + ผู้ทดสอบด้านล่าง) หรือปุ่ม "เข้าเกม" มุมขวาบนของการ์ดนี้',
  'กติกาตามสเปคที่เคาะ: รอบแรก 2 หลัง ผ่านจุดเริ่มต้นแล้ว 3 หลัง · ครบ 3 ตกซ้ำ = แลนด์มาร์ค · ซื้อต่อ ×2 · ชนะพิเศษ 3 แบบ · การ์ดดวง 13 ใบ',
  '⚠️ แก้จากสเปค 1 จุด: เมืองท่องเที่ยวเหลือ 4 แห่ง (ด้านละ 1) เพราะกระดาน 32 ช่องมีที่ว่างแค่ 28 ช่อง · ชนะแบบท่องเที่ยว = ครบ 4',
  'game juice: เต๋ากลิ้ง+เด้ง · แถบพลังกดค้าง · ตัวเดินกระโดดทีละช่อง · เงินลอย +/− · จอสั่นตอนจ่ายแพง · ป๊อปตอนสร้าง · ป้ายกลางจอตอนได้การ์ด/แลนด์มาร์ค · คอนเฟตตีตอนชนะ · เสียงสั้นทุกจังหวะ',
  'อาร์ตพิกเซล (pxl): ตัวเดิน 4 สี · บ้าน · แลนด์มาร์ค · เต๋า 6 หน้า · ต้นฉบับ scripts/art/tycoon.px.js',
  'เทสต์: กติกา 26 ข้อ + ซิมบอทล้วน 200 เกม จบครบทุกเกม (ครบรอบ 166 · สามสี 16 · ล้มละลาย 13 · ท่องเที่ยว 3 · แถว 2)',
  'ตัวเลขทั้งหมด (ราคาเมือง ค่าผ่านทาง เงินเดือน 20 รอบ ฯลฯ) เป็นค่าตั้งต้นใน src/data/tycoon/board.js — เล่นแล้วบอกได้เลยว่าตรงไหนแรง/อ่อน',
  '⚠️ ข้อจำกัดเดโม: ไม่มีเซิร์ฟเวอร์ = เจ้าของห้องเป็นคนรันเกม ถ้าเจ้าของหลุด คนถัดไปรับช่วงอัตโนมัติ · คนหลุด/หมดเวลา 20 วิ บอทเล่นแทน',
  '⚠️ หน้าจอเกมยังไม่เคยถูกเปิดดูจริงเลย: เบราว์เซอร์ของ Claude เข้าเซิร์ฟเวอร์ทดสอบในเครื่องไม่ได้ และไม่มีสิทธิ์เปิดโดเมนเว็บจริง — ตรวจแล้วแค่เทสต์กติกา + build ผ่าน · ถ้าเจอจอเพี้ยน/กดไม่ไป แคปมาได้เลย',
  '⚠️ ห้องออนไลน์หลายเครื่องยังไม่เคยเทสจริง · ห้องเก่าไม่ถูกลบอัตโนมัติ (ค้างใน RTDB tycoon/rooms — ไม่กระทบอะไร)',
]

const { rawConfig } = useAppConfig()
const members = useMembersStore()
const { toast } = useToast()
const q = ref('')
const people = computed(() => [...Object.values(members.fbUsers || {}), ...(members.guestUsers || [])])
const ids = computed(() => (Array.isArray(rawConfig.value?.tycoonTesters) ? rawConfig.value.tycoonTesters : []))
const testers = computed(() => ids.value.map(uid => people.value.find(m => m.uid === uid) || { uid, nickname: uid.slice(0, 6) }))
const matches = computed(() => {
  const s = q.value.trim().toLowerCase()
  if (!s) return []
  return people.value.filter(m => !ids.value.includes(m.uid) && (m.nickname || '').toLowerCase().includes(s)).slice(0, 6)
})

async function addTester(uid) {
  try { await updateDoc(doc(db, 'config', 'app'), { tycoonTesters: arrayUnion(uid) }); q.value = ''; toast('เพิ่มผู้ทดสอบแล้ว', 'success') }
  catch (e) { console.error('[tycoon testers]', e); toast('เพิ่มไม่สำเร็จ', 'error') }
}
async function removeTester(uid) {
  try { await updateDoc(doc(db, 'config', 'app'), { tycoonTesters: arrayRemove(uid) }); toast('เอาออกแล้ว', 'success') }
  catch (e) { console.error('[tycoon testers]', e); toast('เอาออกไม่สำเร็จ', 'error') }
}
</script>

<style scoped>
.at-go { font-size: .8rem; font-weight: 800; color: var(--primary); text-decoration: none; }
.at-report { background: #fffbeb; border: var(--bw) solid var(--line); border-radius: 12px; padding: 8px 10px; margin: 8px 0 10px; }
.at-report summary { font-weight: 800; font-size: .82rem; cursor: pointer; }
.at-report ul { margin: 6px 0 0; padding-left: 18px; font-size: .76rem; line-height: 1.6; }
.at-sub { font-size: .76rem; font-weight: 700; color: rgba(0,0,0,.6); margin-bottom: 6px; }
.at-list { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 8px; }
.at-chip { display: inline-flex; align-items: center; gap: 4px; background: #f3eef9; border-radius: 999px; padding: 3px 4px 3px 10px; font-size: .76rem; font-weight: 700; }
.at-chip button { border: 0; background: #fff; border-radius: 50%; width: 20px; height: 20px; font-size: .7rem; cursor: pointer; }
.at-none { font-size: .74rem; color: rgba(0,0,0,.45); }
.at-add { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
.at-in { flex: 1 1 160px; border: var(--bw) solid var(--line); border-radius: 10px; padding: 7px 10px; font-family: inherit; font-size: .8rem; }
.at-pick { border: var(--bw) solid var(--line); border-radius: 8px; background: #e7f9ee; padding: 5px 8px; font-family: inherit; font-size: .76rem; font-weight: 800; cursor: pointer; }
</style>
