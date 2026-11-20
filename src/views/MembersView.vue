<template>
  <div class="tab-content">
    <div class="mv-head">
      <div class="mv-title"><Emoji char="👥" /> สมาชิก</div>
      <div class="mv-head-r">
        <span class="mv-count">{{ registeredCount }}/{{ roster.length }} เข้าระบบแล้ว</span>
        <button class="mv-refresh" :disabled="members.rosterLoading" title="โหลดข้อมูลล่าสุด" @click="refresh">↻</button>
      </div>
    </div>

    <div v-if="members.rosterMissing" class="mv-empty-roster">
      ยังไม่มีข้อมูลรายชื่อ — ให้แอดมินกด "<Emoji char="🔄" /> สร้าง roster ใหม่" ในหน้า Admin หนึ่งครั้ง
    </div>

    <input v-model="search" class="mv-search" type="text" placeholder="🔍 ค้นหาชื่อเล่น / ชื่อจริง / รหัส…" />

    <div class="mv-filters">
      <button v-for="f in FILTERS" :key="f.key" class="mv-filter" :class="{ on: track === f.key }" @click="track = f.key">
        {{ f.label }}
      </button>
    </div>

    <button
      v-if="approvedGuests.length"
      class="mv-guest-toggle" :class="{ on: showGuests }"
      @click="showGuests = !showGuests"
    >
      <Emoji char="👤" /> {{ showGuests ? '← กลับไปดูนักศึกษา' : `ผู้เยี่ยมชม (${approvedGuests.length})` }}
    </button>

    <div class="mv-sort">
      <label class="mv-sort-label" for="mv-sort-sel">เรียงตาม</label>
      <select id="mv-sort-sel" v-model="sortKey" class="mv-sort-sel">
        <option value="fashion">รายการแนะนำ</option>
        <option value="level">เลเวลบ้าน</option>
        <option value="studentId">รหัสนักศึกษา</option>
        <option value="nickname">ชื่อเล่น</option>
      </select>
    </div>

    <div v-if="members.loading" class="mv-empty">กำลังโหลด…</div>
    <div v-else-if="!list.length" class="mv-empty">ไม่พบสมาชิก</div>

    <div v-else ref="gridEl" class="mv-grid" :style="{ '--mk': mk }">
      <button
        v-for="m in list" :key="m.uid"
        class="mv-card" :class="{ off: !m.registered, me: m.uid === myUid }"
        @click="m.registered && (selected = m)"
      >
        <!-- 🏠 การ์ดแบบ B1 (user เคาะ 20 พ.ย. 2026): ฉากบ้านที่เพื่อนเลือก (ขนาดจริง เห็นตัวบ้าน) + อวาตาร์ครึ่งตัว (2 เท่า)
             ไม่มีอะไรทับฉากนอกจากป้ายเลเวลมุมขวา · ใต้ฉาก = รูปจิ๋ว + ชื่อ แล้วฉายา · สาย/รหัส ไปดูในการ์ดโปรไฟล์ · ภาพนิ่ง ไม่มีเอฟเฟค -->
        <template v-if="m.registered">
          <div class="mv-scene">
            <div class="mv-scene-in" :style="{ backgroundImage: `url(${sceneImg(m)})` }">
              <DollFigure :eq="decodeDoll(m.doll)" :scale="2" :aura="false" :label="`อวาตาร์ของ ${m.nickname}`" class="mv-doll" />
            </div>
            <span class="mv-lv" :style="{ background: tierColor(m) }">{{ m.residence?.level || 1 }}</span>
          </div>
          <div class="mv-namerow">
            <CosFrame :id="m.cosmetics?.f" still class="mv-mini">
              <img class="mv-avatar" :src="avatarOf(m)" alt="" loading="lazy" referrerpolicy="no-referrer" @error="(e) => fallbackAvatar(e, m.nickname)" />
            </CosFrame>
            <div class="mv-nick"><CosName :name="m.nickname" :cos="m.cosmetics" reserve still /></div>
          </div>
        </template>
        <template v-else>
          <div class="mv-av-wrap" :style="{ '--ring': trackColor(m.track) }">
            <img class="mv-avatar" :src="avatarOf(m)" :alt="m.nickname" loading="lazy" referrerpolicy="no-referrer" @error="(e) => fallbackAvatar(e, m.nickname)" />
          </div>
          <div class="mv-nick"><CosName :name="m.nickname" :cos="m.cosmetics" reserve still /></div>
        </template>
        <span v-if="m.uid === myUid" class="mv-you">คุณ</span>
        <div v-if="!m.registered" class="mv-off-tag">ยังไม่เข้าระบบ</div>
      </button>
    </div>

    <ProfileModal :member="selected" @close="selected = null" />
  </div>
</template>

<script setup>
import CosFrame from '../components/cosmetics/CosFrame.vue'
import CosName from '../components/cosmetics/CosName.vue'
import Emoji from '../components/shared/Emoji.vue'
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useMembersStore } from '../stores/members.js'
import { useRosterSync } from '../composables/useRosterSync.js'
import { useAuthStore } from '../stores/auth.js'
import { getTier, sceneOf } from '../data/residence.js'
import DollFigure from '../components/doll/DollFigure.vue'
import { decodeDoll } from '../utils/dollCode.js'
import { avatarUrl, fallbackAvatar } from '../utils/avatar.js'
import { sortMembers } from '../utils/sortMembers.js'
import ProfileModal from '../components/members/ProfileModal.vue'

const members = useMembersStore()
const { syncRosterRow } = useRosterSync()
const auth = useAuthStore()
const myUid = computed(() => auth.currentUser?.uid)
const search = ref('')
const track = ref('all')
const selected = ref(null)
// ค่าเริ่มต้น = เฉิดฉาย (คะแนนลับ นับของแต่งตัวทุกชิ้น+บ้าน · user 19 พ.ย. 2026) · เดิมเลเวลบ้าน (24 ก.ย.)
const sortKey = ref('fashion')

// โหลด roster แล้วซ่อมแถวตัวเองถ้ายังไม่มี/เพี้ยน — ปิดช่องว่างของคนที่เพิ่งผูกตัวตนเสร็จ
// (syncRosterRow เขียนเฉพาะตอนค่าต่างจริง จึงไม่ใช่ write เพิ่มในกรณีปกติ)
onMounted(async () => { await members.loadRoster(); syncRosterRow() })
// ↻ บังคับโหลดสด (roster อาจ stale ถ้าเพื่อนเพิ่งทำคะแนน) — ยังเป็น 1 read
const refresh = () => members.loadRoster({ force: true })

// merge the full static roster (83) with logged-in user data (by studentId)
const roster = computed(() => {
  const fb = members.rosterUsers || {}
  return (members.students || []).map(s => {
    const u = fb[s.id]
    // realName มาจากรายชื่อ static เสมอ (ไม่ได้เก็บใน roster — ประหยัดและไม่มีวันเพี้ยน)
    if (u) return { ...u, realName: s.realName, registered: true }
    return {
      uid: 'static_' + s.id, studentId: s.id,
      nickname: s.nickname, realName: s.realName, track: s.track,
      residence: { level: 1 }, pets: [], registered: false,
    }
  })
})

// guest ที่อนุมัติแล้วเท่านั้น (pending/rejected ไม่โชว์ให้สมาชิก)
const approvedGuests = computed(() =>
  (members.rosterGuests || []).filter(g => g.guestStatus === 'approved').map(g => ({ ...g, registered: true })))

const showGuests = ref(false)

const registeredCount = computed(() => roster.value.filter(m => m.registered).length)

const FILTERS = [
  { key: 'all', label: 'ทั้งหมด' },
  { key: 'sci', label: 'Sci' },
  { key: 'care', label: 'Care' },
]

const list = computed(() => {
  const q = search.value.trim().toLowerCase()
  let r = showGuests.value ? approvedGuests.value : roster.value
  if (!showGuests.value && track.value !== 'all') r = r.filter(m => m.track === track.value)
  if (q) r = r.filter(m => [m.nickname, m.realName, m.studentId].some(v => (v || '').toLowerCase().includes(q)))
  return sortMembers(r, sortKey.value, myUid.value)
})

const TRACK = { sci: ['Sci', '#22c55e'], care: ['Care', '#3b82f6'], guest: ['Guest', '#9ca3af'] }
const trackColor = (t) => TRACK[t]?.[1] || '#6366f1'
const tierColor = (m) => getTier(m.residence?.level || 1).frameColor
// ฉากบนการ์ด: วาดกล่อง 120×78 แล้วขยายทั้งก้อนให้เต็มความกว้างการ์ด (สัดส่วนคงที่ ไม่ยืด · user 20 พ.ย.)
const gridEl = ref(null)
const mk = ref(1)
let mkRo = null
watch(gridEl, (el) => {
  mkRo?.disconnect()
  if (!el) return
  const fit = () => { const w = el.querySelector('.mv-scene')?.clientWidth; if (w) mk.value = w / 120 }
  mkRo = new ResizeObserver(fit); mkRo.observe(el); requestAnimationFrame(fit)
})
onUnmounted(() => mkRo?.disconnect())
const SCENES = import.meta.glob('../assets/residence/res-*.webp', { eager: true, import: 'default' })
const sceneImg = (m) => SCENES[`../assets/residence/res-${String(sceneOf(m.residence)).padStart(2, '0')}.webp`]
const avatarOf = (m) => avatarUrl(m, m.nickname)
</script>

<style scoped>
.mv-head { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 12px; }
.mv-title { font-family: var(--font-display); font-weight: 400; font-size: 1.5rem; color: var(--ink); line-height: 1.1; }
.mv-head-r { display: flex; align-items: center; gap: 8px; }
.mv-count { font-size: .7rem; color: rgba(0,0,0,.45); font-weight: 600; }
.mv-refresh {
  border: var(--bw) solid var(--line); background: #fff; border-radius: 999px;
  width: 28px; height: 28px; font-size: .9rem; line-height: 1; color: var(--ink);
  cursor: pointer; flex-shrink: 0; padding: 0;
}
.mv-refresh:active { transform: translate(1px,1px); }
.mv-refresh:disabled { opacity: .4; cursor: default; }
.mv-empty-roster { font-size: .78rem; line-height: 1.5; color: #92400e; background: #fffbeb;
  border: 1px solid #fde68a; border-radius: 12px; padding: 10px 12px; margin-bottom: 12px; }
.mv-search {
  width: 100%; box-sizing: border-box; padding: 10px 14px;
  border: var(--bw) solid var(--line); border-radius: 12px;
  font-family: inherit; font-size: .82rem; margin-bottom: 10px; background: #fff;
}
.mv-search:focus { outline: none; box-shadow: var(--pop); }
.mv-filters { display: flex; gap: 6px; margin-bottom: 14px; }
.mv-filter {
  border: var(--bw) solid var(--line); background: #fff; border-radius: 999px;
  padding: 6px 14px; font-family: inherit; font-size: .74rem; font-weight: 700;
  color: var(--ink); cursor: pointer; transition: .12s;
}
.mv-filter.on { background: var(--primary); color: #fff; border-color: var(--ink); }
.mv-guest-toggle { width:100%; margin:0 0 12px; border:var(--bw) solid var(--line); border-radius:12px; padding:9px; background:#fff; font-family:inherit; font-size:.82rem; font-weight:700; color:var(--ink); box-shadow:var(--pop); cursor:pointer; }
.mv-guest-toggle.on { background:#eef2ff; }
.mv-guest-toggle:active { transform:translate(2px,2px); box-shadow:0 0 0 var(--ink); }
.mv-sort { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
.mv-sort-label { font-size: .7rem; font-weight: 700; color: rgba(0,0,0,.5); }
.mv-sort-sel { border: var(--bw) solid var(--line); border-radius: 10px; padding: 5px 10px; font-family: inherit; font-size: .74rem; font-weight: 700; background: #fff; color: var(--ink); }
.mv-empty { text-align: center; color: rgba(0,0,0,.4); padding: 28px 0; font-size: .85rem; }
.mv-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }
.mv-card { position: relative; overflow: hidden; }
.mv-card > :not(.cz-bgl) { position: relative; z-index: 1; }
/* ฉากบนการ์ด (B1): ส่วน x 48–168 y 16–94 ของฉาก (เห็นตัวบ้าน) วาดที่ 120×78 แล้วขยาย --mk ให้เต็มการ์ด · อวาตาร์ 2 เท่าครึ่งตัว */
.mv-scene { align-self: stretch; margin: -14px -8px 2px; aspect-ratio: 120 / 78; position: relative; overflow: hidden; }
.mv-scene-in { position: absolute; left: 0; top: 0; width: 120px; height: 78px; transform: scale(var(--mk, 1)); transform-origin: 0 0;
  image-rendering: pixelated; background-repeat: no-repeat; background-size: 180px 100px; background-position: -48px -16px; }
.mv-doll { position: absolute; left: -42px; top: -6px; }
.mv-scene .mv-lv { right: 4px; top: 4px; bottom: auto; }
.mv-namerow { align-self: stretch; display: flex; align-items: center; justify-content: flex-start; gap: 6px; min-width: 0; padding: 2px 2px 0; }
.mv-namerow .mv-nick { min-width: 0; }
.mv-mini { flex: none; display: flex; }
.mv-namerow .mv-avatar { flex: none; width: 26px; height: 26px; border-width: 1.5px; border-color: #fff; }
.mv-namerow .mv-nick { flex: 1; text-align: left; }
.mv-card {
  background: #fff; border: var(--bw) solid var(--line); border-radius: 16px;
  padding: 14px 8px 10px; display: flex; flex-direction: column; align-items: center; gap: 5px; min-width: 0;
  cursor: pointer; font-family: inherit; box-shadow: var(--pop);
  transition: transform .12s, box-shadow .12s;
}
.mv-card:active { transform: translate(2px,2px); box-shadow: 0 0 0 var(--ink); }
.mv-card.off { opacity: .5; cursor: default; box-shadow: none; border-style: dashed; }
.mv-card.off:active { transform: none; box-shadow: none; }
.mv-av-wrap { position: relative; display: flex; }   /* flex = ไม่มีช่องใต้บรรทัด ป้ายเลเวลเกาะมุมรูปเป๊ะ */
/* ใส่กรอบจากร้าน = วง/ของประดับยื่นออกนอกรูป ⇒ เว้นบน-ล่างเพิ่ม ไม่ให้ชื่อชิดรูป */
.mv-av-wrap:has(.cz-fw) { margin: 4px 0 6px; }
/* ใส่กรอบแล้ว วงสีสายซ้อนกับกรอบดูเหลื่อม ⇒ เปลี่ยนเป็นขอบขาวบางๆ ให้กรอบเป็นตัวเอก */
.mv-av-wrap:has(.cz-fw) .mv-avatar { border-color: #fff; }
.mv-avatar {
  width: 56px; height: 56px; border-radius: 50%; object-fit: cover; background: #eee;
  border: 3px solid var(--ring, #ddd); box-sizing: border-box;
}
.mv-lv {
  position: absolute; right: -3px; bottom: -3px;
  min-width: 18px; height: 18px; padding: 0 4px; border-radius: 999px;
  color: #fff; font-size: .7rem; font-weight: 800;
  display: flex; align-items: center; justify-content: center;
  border: 2px solid #fff;
  z-index: 3;   /* อยู่เหนือกรอบตกแต่ง (รูป z1 · ของประดับ z2) */
}
.mv-nick {
  font-size: .92rem; font-weight: 800; white-space: nowrap;
  overflow: hidden; text-overflow: ellipsis; max-width: 100%;
}
/* การ์ดของเรา: กรอบนอก + ป้าย "คุณ" ที่มุมซ้ายบน */
.mv-card.me { box-shadow: 0 0 0 2px var(--primary), var(--pop); }
.mv-card .mv-you { position: absolute; top: 5px; left: 5px; z-index: 2; font-size: .7rem; font-weight: 700; line-height: 1.35; color: #fff; background: var(--primary); border-radius: 999px; padding: 0 6px; }
/* ป้ายฉายา: บรรทัดเดียว หดตัวอักษรตามความยาว (TitlePill · ข้อยกเว้นกฎ .7rem เฉพาะป้ายนี้) */
.mv-ttl { max-width: 100%; font-weight: 600; color: #a23b6c; background: var(--accent-light); border: 1px solid rgba(242,139,176,.55); border-radius: 999px; padding: 0 6px; overflow: hidden; }
.mv-off-tag { font-size: .7rem; color: rgba(0,0,0,.35); }
</style>
