<!-- src/views/PharmaTeamView.vue — PharmaTeam (เดโม) · ล็อบบี้: รายชื่อห้อง → ห้องรอ → จอเล่น (PtGame)
     ไม่มีรหัสห้อง: สร้างแล้วขึ้นรายชื่อให้คนในรุ่นกดเข้าได้เลย · ห้อง/เกมอยู่ใน RTDB (composables/usePharmaTeam.js) -->
<template>
  <div class="ptv">
    <header class="ptv-head">
      <button class="ptv-back" @click="goBack">‹ กลับ</button>
      <span class="ptv-title"><Emoji char="🧪" /> PharmaTeam <span class="ptv-demo">ทดสอบ</span></span>
      <span style="width:52px"></span>
    </header>

    <div class="ptv-warn">
      <b><Emoji char="🗣️" /> เกมนี้ต้องใช้การสื่อสาร!</b><br>
      อยากรู้ว่าเล่นยังไง? ชวนเพื่อนมาลองดูเลย <Emoji char="👀" />
    </div>

    <div v-if="error" class="ptv-err">{{ error }}</div>

    <!-- ยังไม่อยู่ในห้อง: รายชื่อห้อง -->
    <template v-if="!roomId">
      <button class="ptv-create" @click="onCreate">+ สร้างเกม</button>
      <div class="ptv-sub">ห้องที่เปิดอยู่</div>
      <div v-if="!roomList.length" class="ptv-empty">ยังไม่มีห้อง — สร้างเลย แล้วเรียกเพื่อนข้างๆ มากดเข้า</div>
      <div v-for="r in roomList" :key="r.id" class="ptv-room">
        <div class="ptv-room-info">
          <div class="ptv-room-host">ห้องของ {{ r.hostName }}</div>
          <div class="ptv-room-names">{{ r.names.join(', ') }}</div>
        </div>
        <span class="ptv-count">{{ r.count }}/{{ MAX_PLAYERS }}</span>
        <span v-if="r.playing" class="ptv-tag">กำลังเล่น</span>
        <button v-else class="ptv-join" :disabled="r.count >= MAX_PLAYERS" @click="onJoin(r.id)">
          {{ r.count >= MAX_PLAYERS ? 'เต็ม' : 'เข้าร่วม' }}
        </button>
      </div>

      <!-- กระดานทีม แยกตามขนาดทีม -->
      <div class="ptv-sub"><Emoji char="🏆" /> กระดานทีม</div>
      <div class="ptv-tabs">
        <button v-for="n in SIZES" :key="n" class="ptv-tab" :class="{ on: boardSize === n }" @click="boardSize = n">{{ n }} คน</button>
      </div>
      <div v-if="boardLoading" class="ptv-empty">กำลังโหลด…</div>
      <div v-else-if="!board.length" class="ptv-empty">ยังไม่มีทีม {{ boardSize }} คนลงกระดาน</div>
      <div v-for="(t, i) in board" :key="t.id" class="ptv-brow" :class="{ mine: t.uids?.includes(uid) }">
        <span class="ptv-rank">{{ i + 1 }}</span>
        <span class="ptv-bnames">{{ (t.names || []).join(', ') }}</span>
        <span class="ptv-blv">Lv.{{ t.level }}</span>
      </div>
      <PlayLogPanel game="pharmateam" />
    </template>

    <!-- อยู่ในห้อง (ยังไม่เริ่ม) -->
    <template v-else-if="room && !inGame">
      <div class="ptv-lobby">
        <div class="ptv-sub">ห้องของ {{ room.meta?.hostName }}</div>
        <ul class="ptv-players">
          <li v-for="p in players" :key="p.uid">
            <Emoji :char="p.uid === room.meta?.hostUid ? '👑' : '🧑‍⚕️'" /> {{ p.name }}<span v-if="p.uid === uid"> (คุณ)</span>
          </li>
        </ul>
        <button v-if="isHost" class="ptv-create" :disabled="!canStart" @click="startGame">
          <Emoji char="🚀" /> เริ่มปรุงยา! ({{ players.length }} คน)
        </button>
        <div v-if="isHost && players.length < MIN_PLAYERS" class="ptv-hint">
          {{ canStart ? '(แอดมิน) เริ่มคนเดียวได้ไว้เทสระบบ' : `รอเพื่อนเข้าห้องอีก ${MIN_PLAYERS - players.length} คน — เรียกคนข้างๆ มากดเข้าร่วม` }}
        </div>
        <div v-if="!isHost" class="ptv-hint">รอหัวห้องกดเริ่ม...</div>
        <button class="ptv-leave" @click="leaveRoom">ออกจากห้อง</button>
      </div>
    </template>

    <PtGame v-if="room && inGame" :state="room.state" :uid="uid" :is-host="isHost" :can-restart="canStart" :now="now"
      @action="sendAction" @event-done="sendEventDone" @taps="sendTaps" @quit="leaveRoom" @restart="startGame" @lobby="backToLobby" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { increment } from 'firebase/firestore'
import { useAuthStore } from '../stores/auth.js'
import { useRouter } from 'vue-router'
import Emoji from '../components/shared/Emoji.vue'
import PlayLogPanel from '../components/shared/PlayLogPanel.vue'
import PtGame from '../components/pharmateam/PtGame.vue'
import { usePharmaTeam, MAX_PLAYERS, MIN_PLAYERS } from '../composables/usePharmaTeam.js'

const router = useRouter()
const {
  uid, now, error, roomList, roomId, room, isHost, canStart,
  listenRooms, stopRooms, createRoom, joinRoom, leaveRoom,
  startGame, backToLobby, sendAction, sendEventDone, sendTaps, loadBoard,
} = usePharmaTeam()

const players = computed(() => Object.entries(room.value?.players || {})
  .sort((a, b) => (a[1].joinedAt || 0) - (b[1].joinedAt || 0))
  .map(([id, p]) => ({ uid: id, name: p.name })))
const inGame = computed(() => !!room.value?.state)

// กระดานทีม
const SIZES = [2, 3, 4, 5, 6]
const boardSize = ref(2)
const board = ref([])
const boardLoading = ref(false)
async function refreshBoard() {
  boardLoading.value = true
  try { board.value = await loadBoard(boardSize.value) } catch (e) { board.value = [] }
  boardLoading.value = false
}
watch(boardSize, refreshBoard)
// กลับมาหน้ารายชื่อห้อง (เช่น เพิ่งจบเกม) → โหลดกระดานใหม่
watch(roomId, id => { if (!id) refreshBoard() })

// iOS ต้องขอสิทธิ์เซ็นเซอร์จากการกดของผู้ใช้ (เขย่า/คว่ำจอ)
function askSensors() {
  try { window.DeviceMotionEvent?.requestPermission?.().catch(() => {}) } catch (e) { /* ไม่รองรับ */ }
  try { window.DeviceOrientationEvent?.requestPermission?.().catch(() => {}) } catch (e) { /* ไม่รองรับ */ }
}
function onCreate() { askSensors(); createRoom() }
function onJoin(id) { askSensors(); joinRoom(id) }
async function goBack() { if (roomId.value) await leaveRoom(); router.push('/play') }

onMounted(() => { listenRooms(); refreshBoard() })
// อยู่ในห้อง = ไม่ต้องฟังรายชื่อห้อง (กันดาวน์โหลด state ทุกห้องซ้ำทุกครั้งที่มีคนกด)
watch(roomId, id => { if (id) stopRooms(); else listenRooms() })

// จบเกม → บันทึกด่านไกลสุดของตัวเอง (ทุกเครื่องเขียนของตัวเอง ครั้งเดียวต่อเกม) → achievement pt_* เช็คเอง
const auth = useAuthStore()
const savedGames = new Set()
watch(() => room.value?.state?.status === 'gameover' ? room.value.state.gameId : null, async gameId => {
  const s = room.value?.state
  if (!gameId || savedGames.has(gameId) || !s?.players?.[uid.value]) return
  savedGames.add(gameId)
  // สถิติแยกตามขนาดทีม (bySize.2–6) + best รวม (achievement ใช้ตัวรวม) · แอดมินเล่นคนเดียว = เทส ไม่บันทึก
  const size = Object.keys(s.players).length
  if (size < MIN_PLAYERS) return
  const cur = auth.userData?.minigames?.pharmaTeam || {}
  const curSize = cur.bySize?.[size] || {}
  const best = Math.max(cur.best || 0, s.level || 0)
  const sizeBest = Math.max(curSize.best || 0, s.level || 0)
  await auth.patchUser(
    { minigames: { ...auth.userData?.minigames, pharmaTeam: {
      ...cur, best, plays: (cur.plays || 0) + 1,
      bySize: { ...cur.bySize, [size]: { best: sizeBest, plays: (curSize.plays || 0) + 1 } },
    } } },
    {
      'minigames.pharmaTeam.best': best,
      'minigames.pharmaTeam.plays': increment(1),
      [`minigames.pharmaTeam.bySize.${size}.best`]: sizeBest,
      [`minigames.pharmaTeam.bySize.${size}.plays`]: increment(1),
    },
  )
})
</script>

<style scoped>
.ptv { max-width: 480px; margin: 0 auto; padding: 8px 12px 24px; }
.ptv-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
.ptv-back { all: unset; cursor: pointer; font-weight: 700; color: var(--primary); padding: 6px 4px; width: 52px; }
.ptv-title { font-weight: 800; font-size: 1.05rem; display: flex; align-items: center; gap: 6px; }
.ptv-demo { font-size: .7rem; font-weight: 800; background: #fde68a; color: #92400e; border-radius: 8px; padding: 1px 6px; }
.ptv-warn { background: #fff7ed; border: 1px solid #fed7aa; color: #7c2d12; border-radius: 14px; padding: 10px 12px; font-size: .85rem; line-height: 1.5; margin-bottom: 12px; }
.ptv-err { background: #fee2e2; color: #991b1b; border-radius: 10px; padding: 8px 10px; font-size: .85rem; margin-bottom: 10px; }
.ptv-create { width: 100%; padding: 14px; border: none; border-radius: 14px; background: var(--mint); color: #fff; font-weight: 800; font-size: 1.05rem;
  box-shadow: 0 4px #3fb48e; cursor: pointer; }
.ptv-create:disabled { background: #9ca3af; box-shadow: none; }
.ptv-sub { font-weight: 800; margin: 16px 0 8px; font-size: .95rem; }
.ptv-empty, .ptv-hint { color: rgba(0,0,0,.5); font-size: .85rem; text-align: center; margin: 10px 0; }
.ptv-room { display: flex; align-items: center; gap: 8px; background: #fff; border: 1px solid rgba(0,0,0,.08); border-radius: 14px; padding: 10px 12px; margin-bottom: 8px; }
.ptv-room-info { flex: 1; min-width: 0; }
.ptv-room-host { font-weight: 700; }
.ptv-room-names { font-size: .75rem; color: rgba(0,0,0,.5); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ptv-count { font-size: .8rem; color: rgba(0,0,0,.55); }
.ptv-tag { font-size: .75rem; background: #e0e7ff; color: #3730a3; border-radius: 8px; padding: 3px 8px; }
.ptv-join { border: none; border-radius: 10px; background: var(--primary); color: #fff; font-weight: 700; padding: 8px 12px; cursor: pointer; }
.ptv-join:disabled { background: #9ca3af; }
.ptv-tabs { display: flex; gap: 6px; margin-bottom: 8px; }
.ptv-tab { flex: 1; border: var(--bw) solid var(--line); background: #fff; border-radius: 10px; padding: 6px 0; font-weight: 700; font-size: .8rem; cursor: pointer; }
.ptv-tab.on { background: var(--primary); color: #fff; border-color: var(--primary); }
.ptv-brow { display: flex; align-items: center; gap: 10px; background: #fff; border: 1px solid rgba(0,0,0,.06); border-radius: 12px; padding: 8px 12px; margin-bottom: 6px; }
.ptv-brow.mine { border-color: var(--primary); background: #eef6ff; }
.ptv-rank { font-weight: 800; width: 20px; text-align: center; color: rgba(0,0,0,.5); }
.ptv-bnames { flex: 1; min-width: 0; font-size: .85rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ptv-blv { font-weight: 800; color: var(--mint); }
.ptv-lobby { background: #fff; border: 1px solid rgba(0,0,0,.08); border-radius: 16px; padding: 4px 14px 14px; }
.ptv-players { list-style: none; padding: 0; margin: 0 0 14px; }
.ptv-players li { padding: 6px 0; border-bottom: 1px dashed rgba(0,0,0,.08); font-weight: 600; }
.ptv-leave { all: unset; cursor: pointer; display: block; text-align: center; margin-top: 12px; width: 100%; color: #dc2626; font-size: .9rem; }
</style>
