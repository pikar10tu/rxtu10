<template>
  <div class="tab-content">
    <div class="page-title"><Emoji char="⚙️" /> Admin</div>

    <!-- guard: admin only -->
    <div v-if="!authStore.isAdmin" class="admin-denied">
      เฉพาะแอดมินเท่านั้น
    </div>

    <template v-else>
      <!-- ───── เปิด/ปิดเว็บ (launch gate) ───── -->
      <section class="admin-card">
        <div class="admin-card-head"><span><Emoji char="🚀" /> สถานะการเปิดเว็บ</span></div>
        <div class="admin-hint">
          เปิดให้ทั้งชั้นปีใช้ หรือปิดเข้าโหมดปรับปรุง (เห็นเฉพาะแอดมิน/ทีมวิชาการ) — มีผลทันที ไม่ต้อง deploy
        </div>
        <div class="maint-toggle">
          <span class="maint-state" :class="maintenance ? 'off' : 'on'">
            {{ maintenance ? '🔒 ปิดปรับปรุง (เฉพาะทีมงาน)' : '🟢 เปิดให้ทุกคนใช้' }}
          </span>
          <button
            class="btn-mini" :class="maintenance ? 'btn-gold' : 'btn-gray'"
            :disabled="savingMaint" @click="toggleMaintenance"
          >
            {{ savingMaint ? '...' : (maintenance ? 'เปิดเว็บ 🚀' : 'ปิดปรับปรุง') }}
          </button>
        </div>
      </section>

      <!-- ───── การใช้ Firestore (ประมาณการ) ───── -->
      <section class="admin-card">
        <div class="admin-card-head">
          <span><Emoji char="📊" /> การใช้ Firestore วันนี้</span>
          <button class="btn-mini" @click="usage.loadToday()">↻ โหลด</button>
        </div>
        <div class="admin-hint">
          ค่า<strong>ประมาณการ</strong>ในแอป (นับเฉพาะ getDocs ใหญ่ + การเขียนหลัก ไม่นับ listener echo)
          — ตัวจริงดูที่ Cloud Monitoring เตือนทางอีเมล
        </div>

        <div v-if="usageBanner" class="usage-banner" :class="usageLevel">
          {{ usageBanner }}
        </div>

        <div v-if="usage.today" class="usage-gauges">
          <div class="usage-row">
            <span class="usage-lbl">อ่าน (reads)</span>
            <span class="usage-num">{{ usage.today.reads.toLocaleString() }} / {{ READ_LIMIT.toLocaleString() }}</span>
          </div>
          <div class="usage-bar"><i :style="{ width: pct(usage.today.reads, READ_LIMIT), background: barColor(usage.today.reads, READ_LIMIT) }"></i></div>
          <div class="usage-row">
            <span class="usage-lbl">เขียน (writes)</span>
            <span class="usage-num">{{ usage.today.writes.toLocaleString() }} / {{ WRITE_LIMIT.toLocaleString() }}</span>
          </div>
          <div class="usage-bar"><i :style="{ width: pct(usage.today.writes, WRITE_LIMIT), background: barColor(usage.today.writes, WRITE_LIMIT) }"></i></div>
        </div>
        <div v-else class="admin-empty">กดปุ่ม ↻ โหลด เพื่อดูค่า</div>
      </section>

      <!-- ───── ทีมวิชาการ (role management) ───── -->
      <section class="admin-card">
        <div class="admin-card-head">
          <span><Emoji char="🎓" /> ทีมวิชาการ</span>
          <button class="btn-mini" :disabled="members.loading" @click="reload">
            {{ members.loading ? '...' : '↻ โหลด' }}
          </button>
        </div>
        <div class="admin-hint">
          ตั้งสิทธิ์ให้เพื่อนเป็น “ทีมวิชาการ” เพื่อเพิ่ม/แก้ไขข้อสอบได้
        </div>

        <input
          v-model="search"
          class="admin-search"
          type="text"
          placeholder="ค้นหาชื่อ / รหัส / อีเมล…"
        />

        <div v-if="members.loading" class="admin-empty">กำลังโหลด…</div>
        <div v-else-if="!filtered.length" class="admin-empty">ไม่พบสมาชิก</div>

        <ul v-else class="role-list">
          <li v-for="m in filtered" :key="m.uid" class="role-row">
            <div class="role-top">
              <div class="role-info">
                <div class="role-name">
                  {{ m.nickname }}
                  <span v-if="m.realName" class="role-real">· {{ m.realName }}</span>
                </div>
                <div class="role-sub">{{ m.studentId || m.email || m.uid.slice(0, 8) }}</div>
              </div>
              <span class="role-badge" :class="'role-' + m.role">{{ roleLabel(m.role) }}</span>
              <div class="role-actions">
                <button
                  v-if="m.role !== 'academic'"
                  class="btn-mini btn-gold"
                  :disabled="savingUid === m.uid || m.role === 'admin'"
                  @click="setRole(m, 'academic')"
                >+ วิชาการ</button>
                <button
                  v-else
                  class="btn-mini btn-gray"
                  :disabled="savingUid === m.uid"
                  @click="setRole(m, 'student')"
                >− เอาออก</button>
                <button class="btn-mini btn-gray" @click="editTagsUid = editTagsUid === m.uid ? null : m.uid"><Emoji char="🏷️" /></button>
              </div>
            </div>
            <!-- tag editor -->
            <div v-if="editTagsUid === m.uid" class="tag-editor">
              <button
                v-for="t in TAG_LIST" :key="t.id"
                class="tag-toggle" :class="{ on: hasTag(m, t.id) }"
                :style="hasTag(m, t.id) ? { background: t.color, borderColor: t.color } : {}"
                @click="toggleTag(m, t.id)"
              ><Emoji :char="t.emoji" /> {{ t.label }}</button>
            </div>
          </li>
        </ul>
      </section>

      <!-- ───── กระดานข่าว ───── -->
      <section class="admin-card">
        <div class="admin-card-head"><span><Emoji char="📢" /> กระดานข่าว</span></div>
        <div class="admin-hint">โพสต์ประกาศ — ทุกคนจะเห็นบนหน้า Home</div>
        <div class="news-form">
          <input v-model="newsIcon" class="news-icon-in" maxlength="2" />
          <input v-model="newsMsg" :maxlength="LIMITS.news" class="admin-search" style="margin:0;flex:1" placeholder="ข้อความข่าว…" @keyup.enter="postNews" />
          <button class="btn-mini btn-gold" :disabled="postingNews || !newsMsg.trim()" @click="postNews">โพสต์</button>
        </div>
        <ul v-if="newsList.length" class="news-admin-list">
          <li v-for="n in newsList" :key="n.id" class="news-admin-row">
            <span>{{ n.icon }} {{ n.msg }}</span>
            <button class="news-del" @click="delNews(n.id)"><Emoji char="🗑️" /></button>
          </li>
        </ul>
      </section>

      <!-- ───── รายงานการโกง (cheat logs) ───── -->
      <section class="admin-card">
        <div class="admin-card-head">
          <span><Emoji char="🚨" /> รายงานการโกง</span>
          <button class="btn-mini" :disabled="loadingLogs" @click="loadCheatLogs">
            {{ loadingLogs ? '...' : '↻ โหลด' }}
          </button>
        </div>
        <div class="admin-hint">ค่าผิดปกติที่ระบบตรวจพบ (กันได้แค่หยาบๆ — ดูประกอบการพิจารณา)</div>
        <div v-if="!cheatLogs.length" class="admin-empty">ยังไม่มีรายงาน <Emoji char="🎉" /></div>
        <ul v-else class="log-list">
          <li v-for="g in cheatLogs" :key="g.id" class="log-row">
            <div class="log-main"><b>{{ g.name }}</b> · <span class="log-reason">{{ g.reason }}</span></div>
            <div class="log-detail">{{ g.detail }}</div>
            <div class="log-ts">{{ fmtTs(g.ts) }}</div>
          </li>
        </ul>
      </section>

      <!-- ───── รายงานข้อมูลยา (drug reports) ───── -->
      <section class="admin-card">
        <div class="admin-card-head">
          <span><Emoji char="📋" /> รายงานข้อมูลยา</span>
          <button class="btn-mini" :disabled="loadingReports" @click="loadDrugReports">
            {{ loadingReports ? '...' : '↻ โหลด' }}
          </button>
        </div>
        <div class="admin-hint">ผู้ใช้แจ้งว่าข้อมูลยาผิด/ไม่ตรง — ตรวจแก้แล้วกด ✓ เพื่อปิด</div>
        <div v-if="!drugReports.length" class="admin-empty">ยังไม่มีรายงาน <Emoji char="🎉" /></div>
        <ul v-else class="log-list">
          <li v-for="r in drugReports" :key="r.id" class="rep-row">
            <div class="rep-top"><b>{{ r.drug }}</b><button class="rep-done" @click="resolveDoc('drugReports', r.id)">✓ ปิด</button></div>
            <div class="rep-cur">{{ r.currentClass }}<template v-if="r.currentDose"> · {{ r.currentDose }}</template></div>
            <div class="rep-note"><Emoji char="💬" /> {{ r.note }}</div>
            <div class="log-ts">{{ r.reporterName || 'ไม่ระบุ' }} · {{ fmtTs(r.ts) }}</div>
          </li>
        </ul>
      </section>

      <!-- ───── ข้อเสนอแนะพัฒนา (feedback) ───── -->
      <section class="admin-card">
        <div class="admin-card-head">
          <span><Emoji char="💡" /> ข้อเสนอแนะพัฒนา</span>
          <button class="btn-mini" :disabled="loadingFeedback" @click="loadFeedback">
            {{ loadingFeedback ? '...' : '↻ โหลด' }}
          </button>
        </div>
        <div class="admin-hint">ไอเดีย/ปัญหาที่ผู้ใช้ส่งมาเพื่อพัฒนาแอป</div>
        <div v-if="!feedback.length" class="admin-empty">ยังไม่มีข้อเสนอแนะ</div>
        <ul v-else class="log-list">
          <li v-for="f in feedback" :key="f.id" class="rep-row">
            <div class="rep-top"><span class="fb-cat">{{ fbCatLabel(f.category) }}</span><button class="rep-done" @click="resolveDoc('feedback', f.id)">✓ ปิด</button></div>
            <div class="rep-note">{{ f.message }}</div>
            <div class="log-ts">{{ f.reporterName || 'ไม่ระบุ' }} · {{ fmtTs(f.ts) }}</div>
          </li>
        </ul>
      </section>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { doc, updateDoc, setDoc, collection, getDocs, query, orderBy, limit, addDoc, deleteDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase/config.js'
import { useAuthStore } from '../stores/auth.js'
import { useMembersStore } from '../stores/members.js'
import { useUsageStore } from '../stores/usage.js'
import { useAppConfig } from '../composables/useAppConfig.js'
import { useToast } from '../composables/useToast.js'
import Emoji from '../components/shared/Emoji.vue'
import { cleanText, LIMITS } from '../utils/text.js'
import { TAG_LIST } from '../data/tags.js'
import { usageStatus, DAILY_READ_LIMIT, DAILY_WRITE_LIMIT } from '../utils/usageMeter.js'

const authStore = useAuthStore()
const members   = useMembersStore()
const usage     = useUsageStore()
const { maintenance } = useAppConfig()
const { toast } = useToast()

// ── usage gauge (ประมาณการในแอป) ──
const READ_LIMIT = DAILY_READ_LIMIT
const WRITE_LIMIT = DAILY_WRITE_LIMIT
const usageLevel = computed(() => usageStatus(usage.today?.reads || 0, usage.today?.writes || 0))
const usageBanner = computed(() => {
  if (!usage.today) return ''
  if (usageLevel.value === 'danger') return '🔴 ใกล้ชนลิมิตฟรีมาก! พิจารณาลดการอ่าน หรือเปิด Blaze (ยังมี quota ฟรีเดิม)'
  if (usageLevel.value === 'warn')   return '🟡 การใช้งานสูงกว่าปกติ — จับตาดูไว้ (ค่านี้ undercount จริง)'
  return ''
})
const pct = (v, max) => `${Math.min(100, Math.round((v / max) * 100))}%`
const barColor = (v, max) => {
  const s = usageStatus(max === READ_LIMIT ? v : 0, max === WRITE_LIMIT ? v : 0)
  return s === 'danger' ? '#ef4444' : s === 'warn' ? '#f59e0b' : '#22c55e'
}

// ── launch gate toggle (config/app.maintenance) ──
const savingMaint = ref(false)
async function toggleMaintenance() {
  const next = !maintenance.value
  savingMaint.value = true
  try {
    await setDoc(doc(db, 'config', 'app'), { maintenance: next }, { merge: true })
    toast(next ? 'เข้าโหมดปรับปรุงแล้ว' : 'เปิดเว็บให้ทุกคนแล้ว 🚀', 'success')
  } catch (e) {
    console.error('[admin maintenance]', e)
    toast('เปลี่ยนสถานะไม่สำเร็จ', 'error')
  } finally {
    savingMaint.value = false
  }
}

const search     = ref('')
const savingUid  = ref(null)
const editTagsUid = ref(null)

function hasTag(m, id) { return (m.tags || []).includes(id) }
async function toggleTag(m, id) {
  const next = hasTag(m, id) ? (m.tags || []).filter(t => t !== id) : [...(m.tags || []), id]
  try {
    await updateDoc(doc(db, 'users', m.uid), { tags: next })
    m.tags = next
    toast(`อัปเดตแท็ก ${m.nickname}`, 'success')
  } catch (e) {
    console.error('[admin toggleTag]', e)
    toast('บันทึกแท็กไม่สำเร็จ', 'error')
  }
}

const cheatLogs = ref([])
const loadingLogs = ref(false)

onMounted(() => {
  if (authStore.isAdmin) { reload(); loadCheatLogs(); loadNews(); loadDrugReports(); loadFeedback(); usage.loadToday() }
})

// ── Drug reports + dev feedback ──
const drugReports = ref([])
const loadingReports = ref(false)
const feedback = ref([])
const loadingFeedback = ref(false)

async function loadDrugReports() {
  loadingReports.value = true
  try {
    const snap = await getDocs(query(collection(db, 'drugReports'), orderBy('ts', 'desc'), limit(50)))
    drugReports.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
  } catch (e) { console.error('[admin drugReports]', e) }
  finally { loadingReports.value = false }
}
async function loadFeedback() {
  loadingFeedback.value = true
  try {
    const snap = await getDocs(query(collection(db, 'feedback'), orderBy('ts', 'desc'), limit(50)))
    feedback.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
  } catch (e) { console.error('[admin feedback]', e) }
  finally { loadingFeedback.value = false }
}
async function resolveDoc(coll, id) {
  try {
    await deleteDoc(doc(db, coll, id))
    if (coll === 'drugReports') drugReports.value = drugReports.value.filter(x => x.id !== id)
    else if (coll === 'feedback') feedback.value = feedback.value.filter(x => x.id !== id)
    toast('ปิดรายการแล้ว', 'success')
  } catch (e) { console.error('[admin resolve]', e); toast('ลบไม่สำเร็จ', 'error') }
}
const fbCatLabel = (c) => ({ idea: '💡 ไอเดีย', bug: '🐞 ปัญหา', other: '📝 อื่นๆ' }[c] || '📝 อื่นๆ')

async function loadCheatLogs() {
  loadingLogs.value = true
  try {
    const snap = await getDocs(query(collection(db, 'cheatLogs'), orderBy('ts', 'desc'), limit(50)))
    cheatLogs.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
  } catch (e) {
    console.error('[admin cheatLogs]', e)
  } finally {
    loadingLogs.value = false
  }
}
function fmtTs(ts) {
  const d = ts?.toDate ? ts.toDate() : null
  return d ? d.toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' }) : '—'
}

// ── News board ──
const newsIcon = ref('📢')
const newsMsg = ref('')
const newsList = ref([])
const postingNews = ref(false)

async function loadNews() {
  try {
    const snap = await getDocs(query(collection(db, 'news'), orderBy('ts', 'desc'), limit(20)))
    newsList.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
  } catch (e) { console.error('[admin news]', e) }
}
async function postNews() {
  const msg = cleanText(newsMsg.value, LIMITS.news)
  if (!msg) return
  postingNews.value = true
  try {
    await addDoc(collection(db, 'news'), { icon: newsIcon.value || '📢', msg, ts: serverTimestamp() })
    newsMsg.value = ''
    await loadNews()
    toast('โพสต์ข่าวแล้ว', 'success')
  } catch (e) { console.error('[post news]', e); toast('โพสต์ไม่สำเร็จ', 'error') }
  finally { postingNews.value = false }
}
async function delNews(id) {
  try { await deleteDoc(doc(db, 'news', id)); newsList.value = newsList.value.filter(n => n.id !== id) }
  catch (e) { console.error('[del news]', e); toast('ลบไม่สำเร็จ', 'error') }
}

function reload() {
  members.loadFbUsers({ force: true }) // triage ต้องเห็นข้อมูลสด ข้าม cache เสมอ
}

function roleLabel(role) {
  return role === 'admin' ? '👑 แอดมิน' : role === 'academic' ? '🎓 วิชาการ' : 'สมาชิก'
}

// flatten student fbUsers + guests into one sortable list
const allUsers = computed(() => {
  const list = [...Object.values(members.fbUsers || {}), ...(members.guestUsers || [])]
  return list.sort((a, b) => {
    const rank = r => (r === 'admin' ? 0 : r === 'academic' ? 1 : 2)
    return rank(a.role) - rank(b.role) || (a.studentId || '').localeCompare(b.studentId || '')
  })
})

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return allUsers.value
  return allUsers.value.filter(m =>
    [m.nickname, m.realName, m.studentId, m.email].some(v => (v || '').toLowerCase().includes(q))
  )
})

async function setRole(m, role) {
  if (m.role === 'admin') return // never demote/alter an admin from here
  savingUid.value = m.uid
  try {
    await updateDoc(doc(db, 'users', m.uid), { role })
    m.role = role // optimistic local update (light object is reactive via store ref)
    toast(`ตั้ง ${m.nickname} เป็น ${roleLabel(role)} แล้ว`, 'success')
  } catch (e) {
    console.error('[admin setRole]', e)
    toast('บันทึกไม่สำเร็จ', 'error')
  } finally {
    savingUid.value = null
  }
}
</script>

<style scoped>
.admin-denied,
.admin-empty {
  text-align: center;
  color: rgba(0, 0, 0, .4);
  padding: 24px 0;
  font-size: .85rem;
}
.admin-card {
  background: #fff;
  border: 2px solid var(--ink);
  border-radius: 16px;
  box-shadow: var(--pop);
  padding: 14px;
  margin-bottom: 14px;
}
.admin-card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 800;
  font-size: .95rem;
  margin-bottom: 4px;
}
.maint-toggle { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.maint-state { font-size: .8rem; font-weight: 700; }
.maint-state.on  { color: #15803d; }
.maint-state.off { color: #b45309; }
.admin-hint {
  font-size: .68rem;
  color: rgba(0, 0, 0, .45);
  margin-bottom: 10px;
}
.usage-banner {
  border: 2px solid var(--ink); border-radius: 10px; padding: 8px 12px;
  font-size: .74rem; font-weight: 700; margin-bottom: 10px;
}
.usage-banner.warn   { background: #fff7e6; }
.usage-banner.danger { background: #fee2e2; }
.usage-gauges { display: flex; flex-direction: column; gap: 4px; }
.usage-row { display: flex; justify-content: space-between; font-size: .72rem; font-weight: 700; }
.usage-lbl { color: rgba(0,0,0,.6); }
.usage-num { color: var(--ink); }
.usage-bar {
  height: 8px; border: 2px solid var(--ink); border-radius: 999px;
  background: #fff; overflow: hidden; margin-bottom: 6px;
}
.usage-bar i { display: block; height: 100%; transition: width .3s; }
.admin-search {
  width: 100%;
  box-sizing: border-box;
  padding: 8px 12px;
  border: 2px solid var(--ink);
  border-radius: 10px;
  font-family: inherit;
  font-size: .82rem;
  margin-bottom: 10px;
}
.admin-search:focus { outline: none; box-shadow: var(--pop); }
.role-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 60vh;
  overflow-y: auto;
}
.role-row {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 10px;
  background: rgba(0, 0, 0, .03);
}
.role-top { display: flex; align-items: center; gap: 8px; }
.tag-editor { display: flex; flex-wrap: wrap; gap: 5px; padding-top: 2px; }
.tag-toggle {
  border: 1px solid rgba(0,0,0,.15); background: #fff; color: rgba(0,0,0,.55);
  border-radius: 999px; padding: 4px 9px; font-family: inherit; font-size: .64rem;
  font-weight: 700; cursor: pointer;
}
.tag-toggle.on { color: #fff; }
.role-info { flex: 1; min-width: 0; }
.role-name {
  font-size: .82rem;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.role-real { font-weight: 400; color: rgba(0, 0, 0, .45); }
.role-sub { font-size: .64rem; color: rgba(0, 0, 0, .4); }
.role-badge {
  font-size: .6rem;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 999px;
  white-space: nowrap;
}
.role-student  { background: rgba(0,0,0,.06);  color: rgba(0,0,0,.5); }
.role-academic { background: rgba(59,130,246,.15); color: #2563eb; }
.role-admin    { background: rgba(251,191,36,.18); color: #b45309; }
.role-actions { flex-shrink: 0; }
.btn-mini {
  border: 2px solid var(--ink);
  border-radius: 8px;
  padding: 6px 10px;
  font-family: inherit;
  font-size: .72rem;
  font-weight: 700;
  cursor: pointer;
  background: #fff;
}
.btn-mini:disabled { opacity: .4; cursor: default; }
.btn-gold { background: var(--gold); color: #fff; }
.btn-gray { background: #fff; color: var(--ink); }
.log-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 6px; }
.log-row { padding: 8px 10px; border-radius: 10px; background: rgba(239,68,68,.06); border: 1px solid rgba(239,68,68,.18); }
.log-main { font-size: .8rem; }
.log-reason { color: #dc2626; font-weight: 700; font-size: .72rem; }
.log-detail { font-size: .66rem; color: rgba(0,0,0,.5); }
.log-ts { font-size: .58rem; color: rgba(0,0,0,.35); margin-top: 2px; }
.rep-row { padding: 9px 11px; border-radius: 10px; background: rgba(99,102,241,.05); border: 1px solid rgba(99,102,241,.15); }
.rep-top { display: flex; align-items: center; justify-content: space-between; gap: 8px; font-size: .82rem; }
.rep-done { border: none; background: rgba(34,197,94,.15); color: #15803d; border-radius: 8px; padding: 3px 9px; font-family: inherit; font-size: .64rem; font-weight: 700; cursor: pointer; flex-shrink: 0; }
.rep-cur { font-size: .66rem; color: rgba(0,0,0,.5); margin-top: 2px; }
.rep-note { font-size: .76rem; color: #1e293b; margin-top: 4px; line-height: 1.4; word-break: break-word; }
.fb-cat { font-size: .68rem; font-weight: 700; color: #4f46e5; }
.news-form { display: flex; gap: 6px; align-items: center; margin-bottom: 10px; }
.news-icon-in { width: 42px; text-align: center; padding: 8px 0; border: 1px solid rgba(0,0,0,.12); border-radius: 10px; font-family: inherit; font-size: 1rem; }
.news-admin-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 5px; }
.news-admin-row { display: flex; align-items: center; gap: 8px; padding: 7px 10px; border-radius: 9px; background: rgba(0,0,0,.03); font-size: .76rem; }
.news-admin-row span { flex: 1; word-break: break-word; }
.news-del { border: none; background: none; cursor: pointer; font-size: .9rem; flex-shrink: 0; }
</style>
