<template>
  <div class="tab-content">
    <div style="font-size:1.1rem;font-weight:800;margin-bottom:12px">⚙️ Admin</div>

    <!-- guard: admin only -->
    <div v-if="!authStore.isAdmin" class="admin-denied">
      เฉพาะแอดมินเท่านั้น
    </div>

    <template v-else>
      <!-- ───── ทีมวิชาการ (role management) ───── -->
      <section class="admin-card">
        <div class="admin-card-head">
          <span>🎓 ทีมวิชาการ</span>
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
                <button class="btn-mini btn-gray" @click="editTagsUid = editTagsUid === m.uid ? null : m.uid">🏷️</button>
              </div>
            </div>
            <!-- tag editor -->
            <div v-if="editTagsUid === m.uid" class="tag-editor">
              <button
                v-for="t in TAG_LIST" :key="t.id"
                class="tag-toggle" :class="{ on: hasTag(m, t.id) }"
                :style="hasTag(m, t.id) ? { background: t.color, borderColor: t.color } : {}"
                @click="toggleTag(m, t.id)"
              >{{ t.emoji }} {{ t.label }}</button>
            </div>
          </li>
        </ul>
      </section>

      <!-- ───── รายงานการโกง (cheat logs) ───── -->
      <section class="admin-card">
        <div class="admin-card-head">
          <span>🚨 รายงานการโกง</span>
          <button class="btn-mini" :disabled="loadingLogs" @click="loadCheatLogs">
            {{ loadingLogs ? '...' : '↻ โหลด' }}
          </button>
        </div>
        <div class="admin-hint">ค่าผิดปกติที่ระบบตรวจพบ (กันได้แค่หยาบๆ — ดูประกอบการพิจารณา)</div>
        <div v-if="!cheatLogs.length" class="admin-empty">ยังไม่มีรายงาน 🎉</div>
        <ul v-else class="log-list">
          <li v-for="g in cheatLogs" :key="g.id" class="log-row">
            <div class="log-main"><b>{{ g.name }}</b> · <span class="log-reason">{{ g.reason }}</span></div>
            <div class="log-detail">{{ g.detail }}</div>
            <div class="log-ts">{{ fmtTs(g.ts) }}</div>
          </li>
        </ul>
      </section>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { doc, updateDoc, collection, getDocs, query, orderBy, limit } from 'firebase/firestore'
import { db } from '../firebase/config.js'
import { useAuthStore } from '../stores/auth.js'
import { useMembersStore } from '../stores/members.js'
import { useToast } from '../composables/useToast.js'
import { TAG_LIST } from '../data/tags.js'

const authStore = useAuthStore()
const members   = useMembersStore()
const { toast } = useToast()

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
  if (authStore.isAdmin) { reload(); loadCheatLogs() }
})

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

function reload() {
  members.loadFbUsers()
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
  border: 1px solid rgba(0, 0, 0, .08);
  border-radius: 14px;
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
.admin-hint {
  font-size: .68rem;
  color: rgba(0, 0, 0, .45);
  margin-bottom: 10px;
}
.admin-search {
  width: 100%;
  box-sizing: border-box;
  padding: 8px 12px;
  border: 1px solid rgba(0, 0, 0, .12);
  border-radius: 10px;
  font-family: inherit;
  font-size: .82rem;
  margin-bottom: 10px;
}
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
  border: none;
  border-radius: 8px;
  padding: 6px 10px;
  font-family: inherit;
  font-size: .72rem;
  font-weight: 700;
  cursor: pointer;
}
.btn-mini:disabled { opacity: .4; cursor: default; }
.btn-gold { background: linear-gradient(135deg, #f59e0b, #d97706); color: #fff; }
.btn-gray { background: rgba(0, 0, 0, .08); color: rgba(0, 0, 0, .6); }
.log-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 6px; }
.log-row { padding: 8px 10px; border-radius: 10px; background: rgba(239,68,68,.06); border: 1px solid rgba(239,68,68,.18); }
.log-main { font-size: .8rem; }
.log-reason { color: #dc2626; font-weight: 700; font-size: .72rem; }
.log-detail { font-size: .66rem; color: rgba(0,0,0,.5); }
.log-ts { font-size: .58rem; color: rgba(0,0,0,.35); margin-top: 2px; }
</style>
