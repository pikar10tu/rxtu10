<template>
  <!-- ซ่อนทั้งแถบถ้าไม่มีข่าว (และโหลดเสร็จแล้ว) -->
  <div v-if="loading || heads.length" class="news">
    <!-- collapsed: บรรทัดเดียวสลับข่าวเองทุก 3.5 วิ · กดเพื่อกาง log -->
    <button class="news-latest" :aria-expanded="open" @click="open = !open">
      <span class="news-icon"><Emoji :char="open || !current ? '📢' : current.icon" /></span>
      <span class="news-latest-msg">
        <template v-if="loading">กำลังโหลดข่าว…</template>
        <template v-else-if="open">กระดานข่าว</template>
        <span v-else :key="current.id" class="news-tick">{{ current.text }}</span>
      </span>
      <span class="news-chevron" :class="{ open }" aria-hidden="true">▾</span>
    </button>

    <!-- expanded: log เต็มพร้อมเวลา (accordion กางในหน้า) -->
    <!-- รวมข่าวต่อคน: หัวกลุ่ม = ข่าวล่าสุด ที่เหลือพับไว้ใต้ปุ่ม (user ขอ 25 ก.ย. 2026 — อยากเห็นครบแต่ไม่รก) -->
    <ul v-if="open && groups.length" class="news-list">
      <li v-for="g in groups" :key="g.key" class="news-group">
        <div class="news-item">
          <span class="news-icon"><Emoji :char="g.head.icon" /></span>
          <div class="news-body">
            <div class="news-msg">{{ g.head.text }}</div>
            <div class="news-time">{{ timeAgo(g.head.t, now) }}</div>
            <button v-if="g.rest.length" type="button" class="news-more"
                    :aria-expanded="expanded.has(g.key)" @click="toggle(g.key)">
              {{ expanded.has(g.key) ? '▴ ย่อ' : `▾ อีก ${g.rest.length} ข่าวจาก ${whoOf(g)}` }}
            </button>
          </div>
        </div>
        <ul v-if="expanded.has(g.key)" class="news-sub">
          <li v-for="n in g.rest" :key="n.id" class="news-item">
            <span class="news-icon"><Emoji :char="n.icon" /></span>
            <div class="news-body">
              <div class="news-msg">{{ n.text }}</div>
              <div class="news-time">{{ timeAgo(n.t, now) }}</div>
            </div>
          </li>
        </ul>
      </li>
    </ul>
  </div>
</template>

<script setup>
/**
 * กระดานข่าวหน้า Home — รวม 2 เลน (ดู utils/newsFeed.js)
 *   เลน roster: ข่าวไหลเร็วจาก rows.<uid>.ev — roster เป็น 1 read ที่จออื่นได้ใช้ต่อทั้งเซสชัน
 *   เลน news:   ข่าว "ครั้งแรก/ที่หนึ่งของรุ่น" + ประกาศแอดมิน — เหลือ 5 doc (เดิม 10)
 * รวมแล้ว 6 read ต่อการเข้า Home (เดิม 10) ทั้งที่ข่าวเยอะกว่าเดิมหลายเท่า
 *
 * ⚠️ ใช้ {{ }} เท่านั้น ห้าม v-html — ข้อความในเลน news มาจากผู้เล่น (CLAUDE.md ข้อ 8)
 */
import Emoji from '../shared/Emoji.vue'
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore'
import { db } from '../../firebase/config.js'
import { useUsageStore } from '../../stores/usage.js'
import { useMembersStore } from '../../stores/members.js'
import { useAuthStore } from '../../stores/auth.js'
import { buildFeed, groupFeed, timeAgo } from '../../utils/newsFeed.js'
import { prefersReducedMotion } from '../../utils/motionPref.js'

const usage = useUsageStore()
const members = useMembersStore()
const auth = useAuthStore()

const newsDocs = ref([])
const loading = ref(true)
// startOpen: หน้าฉัน (แท็บข่าวรุ่น) กางรายการไว้เลย · หน้า Home ยังพับเป็นบรรทัดเดียวเหมือนเดิม
const props = defineProps({ startOpen: { type: Boolean, default: false } })
const open = ref(props.startOpen)     // collapsed by default — กดบรรทัดเพื่อกาง log
const idx = ref(0)          // บรรทัดที่โชว์อยู่ตอนพับ
const now = ref(Date.now()) // ให้ "x นาทีที่แล้ว" ขยับตามเวลาจริง

const groups = computed(() => groupFeed(buildFeed(members.rosterRows || {}, newsDocs.value,
  { now: now.value, myUid: auth.currentUser?.uid || null })))
// แถบวิ่งบรรทัดเดียว = หัวกลุ่มเท่านั้น (ไม่งั้นคนที่มี 10 ข่าวยึดแถบวิ่งไปทั้งรอบ)
const heads = computed(() => groups.value.map(g => g.head))

const current = computed(() => heads.value[idx.value % (heads.value.length || 1)] || null)

const expanded = ref(new Set())
function toggle(key) {
  const s = new Set(expanded.value)
  if (s.has(key)) s.delete(key); else s.add(key)
  expanded.value = s
}
// ชื่อในปุ่ม "อีก N ข่าวจาก X" — ข่าวไม่มีเจ้าของไม่มี rest อยู่แล้ว จึงไม่ถึงตรงนี้
const whoOf = (g) => g.head.uid === auth.currentUser?.uid ? 'คุณ' : (members.rosterRows?.[g.head.uid]?.n || '?')

// ── ตัวสลับบรรทัด ──
// ใช้แค่ opacity/transform (ดู style) — ห้าม backdrop-filter/blur เด็ดขาด (iOS Safari paint)
let timer = null
const reduced = prefersReducedMotion()

function stop() { if (timer) { clearInterval(timer); timer = null } }
function start() {
  stop()
  // ไม่สลับเมื่อ: ผู้ใช้ปิดอนิเมชัน · กางกระดานอยู่ · แท็บไม่ได้อยู่หน้าจอ · มีข่าวเดียว
  if (reduced || open.value || document.hidden || heads.value.length < 2) return
  timer = setInterval(() => {
    idx.value = (idx.value + 1) % heads.value.length
    now.value = Date.now()
  }, 3500)
}

onMounted(async () => {
  document.addEventListener('visibilitychange', start)
  try {
    await members.loadRoster()
    const snap = await getDocs(query(collection(db, 'news'), orderBy('ts', 'desc'), limit(5)))
    usage.track(snap.size)
    newsDocs.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
  } catch (e) {
    console.error('[news]', e)
  } finally {
    loading.value = false
    start()
  }
})

onUnmounted(() => { stop(); document.removeEventListener('visibilitychange', start) })

watch(open, (v) => { if (v) { stop(); now.value = Date.now() } else start() })
</script>

<style scoped>
.news { background: #fff; border: var(--bw) solid var(--line); border-radius: 18px; padding: 10px 14px; margin-bottom: 14px; box-shadow: var(--pop); }
/* collapsed: บรรทัดล่าสุด (กดเพื่อกาง) */
.news-latest { all: unset; cursor: pointer; box-sizing: border-box; width: 100%; display: flex; align-items: center; gap: 10px; }
.news-latest-msg { flex: 1; min-width: 0; text-align: left; font-size: .8rem; font-weight: 700; color: var(--ink); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.news-chevron { flex-shrink: 0; color: rgba(0,0,0,.4); font-size: .9rem; transition: transform .2s; }
.news-chevron.open { transform: rotate(180deg); }
.news-list { list-style: none; margin: 10px 0 0; padding: 8px 0 0; border-top: 1px solid rgba(0,0,0,.08); display: flex; flex-direction: column; gap: 8px; max-height: 360px; overflow-y: auto; overscroll-behavior: contain; }
.news-item { display: flex; gap: 10px; align-items: flex-start; padding-bottom: 8px; border-bottom: 1px solid rgba(0,0,0,.05); }
.news-item:last-child { border-bottom: none; padding-bottom: 0; }
.news-icon { font-size: 1.2rem; flex-shrink: 0; }
.news-group { border-bottom: 1px solid rgba(0,0,0,.05); padding-bottom: 8px; }
.news-group:last-child { border-bottom: none; padding-bottom: 0; }
.news-group > .news-item, .news-sub .news-item { border-bottom: none; padding-bottom: 0; }
.news-more { all: unset; cursor: pointer; margin-top: 4px; font-size: .72rem; font-weight: 700; color: var(--primary); }
.news-more:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; border-radius: 4px; }
.news-sub { list-style: none; margin: 6px 0 0 12px; padding: 0 0 0 10px; border-left: 2px solid var(--line); display: flex; flex-direction: column; gap: 6px; }
.news-body { flex: 1; min-width: 0; }
.news-msg { font-size: .8rem; color: rgba(0,0,0,.75); line-height: 1.4; word-break: break-word; }
.news-time { font-size: .7rem; color: rgba(0,0,0,.4); margin-top: 2px; }

/* สลับบรรทัดเอง — opacity/transform เท่านั้น ห้าม backdrop-filter/blur (iOS Safari paint) */
.news-tick { display: inline-block; animation: news-in .2s ease-out; }
@keyframes news-in { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: none; } }
</style>
