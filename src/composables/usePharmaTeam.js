// ════════════════════════════════════════════════════════════
//  usePharmaTeam — ห้องเล่นสดบน RTDB  /pharmateam/rooms/{roomId}
//    meta     { hostUid, hostName, createdAt }
//    players  { [uid]: { name, joinedAt } }       ← onDisconnect ลบตัวเองออก
//    state    ก้อนเกมทั้งหมด (หัวห้องเขียนคนเดียว — ตรรกะใน utils/pharmateamEngine.js)
//    actions  { [pushId]: { uid, kind, ... } }    ← ทุกคน push · หัวห้องอ่านแล้วลบ
//  หัวห้องหลุด → คนที่เข้าห้องก่อนสุดในที่เหลือรับเป็นหัวห้อง แล้วรันต่อจาก state ล่าสุด
// ════════════════════════════════════════════════════════════
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import {
  getDatabase, ref as dbRef, onValue, off, update, set, remove, push, get,
  onDisconnect, onChildAdded, serverTimestamp, query, orderByChild, limitToLast,
} from 'firebase/database'
import { app } from '../firebase/config.js'
import { useAuthStore } from '../stores/auth.js'
import { useNewsPost } from './useNewsPost.js'
import { newGame, applyAction, eventDone, eventTaps, tick, removePlayer, normalizeState } from '../utils/pharmateamEngine.js'

const ROOT = 'pharmateam/rooms'
const BOARD = 'pharmateam/board'   // /{ขนาดทีม}/{gameId} = { level, names[], uids[], at } — หัวห้องเขียนตอนแลปแตก
const TICK_MS = 150
export const MAX_PLAYERS = 6
export const MIN_PLAYERS = 2   // เล่นคนเดียวได้เฉพาะแอดมิน (ไว้เทสระบบ)

let _db = null
const rtdb = () => (_db ||= getDatabase(app))
// RTDB ไม่รับ undefined — ตัดทิ้งก่อนเขียน
const clean = (o) => JSON.parse(JSON.stringify(o))

export function usePharmaTeam() {
  const auth = useAuthStore()
  const { myName } = useNewsPost()
  const uid = computed(() => auth.currentUser?.uid || null)

  const offset = ref(0)                       // เวลาเครื่อง vs เซิร์ฟเวอร์
  const now = () => Date.now() + offset.value
  const rooms = ref({})
  const roomId = ref(null)
  const room = ref(null)
  const error = ref('')

  const offRef = dbRef(rtdb(), '.info/serverTimeOffset')
  onValue(offRef, s => { offset.value = s.val() || 0 })

  // ── รายชื่อห้อง ──
  const roomsRef = dbRef(rtdb(), ROOT)
  let listening = false
  function listenRooms() {
    if (listening) return
    listening = true
    onValue(roomsRef, snap => {
      const all = snap.val() || {}
      rooms.value = all
      // ห้องร้าง (ไม่มีคนเหลือ) → ลบทิ้ง
      for (const [id, r] of Object.entries(all)) if (!r.players) remove(dbRef(rtdb(), `${ROOT}/${id}`)).catch(() => {})
    }, e => { error.value = 'โหลดรายชื่อห้องไม่ได้: ' + e.message })
  }
  function stopRooms() { if (listening) { off(roomsRef); listening = false } }

  const roomList = computed(() => Object.entries(rooms.value)
    .filter(([, r]) => r.players && r.meta)
    .map(([id, r]) => {
      const st = r.state?.status
      return {
        id, hostName: r.meta.hostName, createdAt: r.meta.createdAt || 0,
        count: Object.keys(r.players).length,
        names: Object.values(r.players).map(p => p.name),
        playing: st === 'playing' || st === 'levelClear',
      }
    })
    .sort((a, b) => b.createdAt - a.createdAt))

  // ── เข้า/ออกห้อง ──
  let roomRef = null, myPlayerRef = null
  function subscribeRoom(id) {
    roomId.value = id
    roomRef = dbRef(rtdb(), `${ROOT}/${id}`)
    onValue(roomRef, snap => {
      const r = snap.val()
      if (!r || !r.players?.[uid.value]) { leaveLocal(); return } // ห้องหาย / โดนเอาออก
      if (r.state) normalizeState(r.state)
      room.value = r
    })
    myPlayerRef = dbRef(rtdb(), `${ROOT}/${id}/players/${uid.value}`)
    onDisconnect(myPlayerRef).remove()
  }

  async function createRoom() {
    error.value = ''
    const id = push(roomsRef).key
    const name = myName()
    try {
      await update(dbRef(rtdb(), `${ROOT}/${id}`), {
        meta: { hostUid: uid.value, hostName: name, createdAt: serverTimestamp() },
        [`players/${uid.value}`]: { name, joinedAt: serverTimestamp() },
      })
      subscribeRoom(id)
    } catch (e) { error.value = 'สร้างห้องไม่สำเร็จ: ' + e.message }
  }

  async function joinRoom(id) {
    error.value = ''
    const r = rooms.value[id]
    if (!r) return
    if (Object.keys(r.players || {}).length >= MAX_PLAYERS) { error.value = 'ห้องเต็มแล้ว'; return }
    try {
      await set(dbRef(rtdb(), `${ROOT}/${id}/players/${uid.value}`), { name: myName(), joinedAt: serverTimestamp() })
      subscribeRoom(id)
    } catch (e) { error.value = 'เข้าห้องไม่สำเร็จ: ' + e.message }
  }

  function leaveLocal() {
    stopHost()
    if (roomRef) off(roomRef)
    if (myPlayerRef) onDisconnect(myPlayerRef).cancel().catch(() => {})
    roomRef = null; myPlayerRef = null
    room.value = null; roomId.value = null
  }

  async function leaveRoom() {
    const id = roomId.value, me = myPlayerRef
    leaveLocal()
    if (!me) return
    await remove(me).catch(() => {})
    // คนสุดท้ายออก → ลบห้อง (rules ยอมเฉพาะห้องที่ไม่มีคนแล้ว)
    remove(dbRef(rtdb(), `${ROOT}/${id}`)).catch(() => {})
  }

  // ── หัวห้อง ──
  const isHost = computed(() => !!room.value && room.value.meta?.hostUid === uid.value)
  const playerCount = computed(() => Object.keys(room.value?.players || {}).length)
  const canStart = computed(() => isHost.value && (playerCount.value >= MIN_PLAYERS || auth.isAdmin))

  // หัวห้องหลุด → คนที่เข้าห้องก่อนสุดรับช่วง
  watch(room, r => {
    if (!r?.meta || r.players?.[r.meta.hostUid]) return
    const next = Object.entries(r.players || {}).sort((a, b) => (a[1].joinedAt || 0) - (b[1].joinedAt || 0))[0]
    if (next && next[0] === uid.value) {
      update(dbRef(rtdb(), `${ROOT}/${roomId.value}/meta`), { hostUid: uid.value, hostName: myName() }).catch(() => {})
    }
  })

  let engine = null, timer = null, dirty = false, actionsRef = null
  function writeState() {
    if (!engine || !roomId.value) return
    dirty = false
    set(dbRef(rtdb(), `${ROOT}/${roomId.value}/state`), clean(engine)).catch(e => { error.value = 'ซิงค์เกมไม่สำเร็จ: ' + e.message })
  }

  function startHost() {
    if (timer || !roomId.value) return
    engine = room.value?.state ? normalizeState(clean(room.value.state)) : null
    actionsRef = dbRef(rtdb(), `${ROOT}/${roomId.value}/actions`)
    onChildAdded(actionsRef, snap => {
      const a = snap.val()
      remove(snap.ref).catch(() => {})
      if (!engine || !a) return
      const t = now()
      const changed = a.kind === 'event' ? eventDone(engine, a.uid, a.eventId, t)
        : a.kind === 'taps' ? eventTaps(engine, a.uid, a.eventId, a.n, t)
        : applyAction(engine, a.uid, a.controlId, a.value, t)
      if (changed) dirty = true
    })
    timer = setInterval(() => {
      if (!engine) return
      // คนที่หลุดไปแล้ว เอาออกจากเกม
      const present = room.value?.players || {}
      for (const id of Object.keys(engine.players)) if (!present[id]) { removePlayer(engine, id, now()); dirty = true }
      if (tick(engine, now())) dirty = true
      if (dirty) writeState()
      if (engine.status === 'gameover') recordTeam(engine)
    }, TICK_MS)
  }

  // ลงกระดานทีม ครั้งเดียวต่อเกม · ทีมไม่ถึง MIN_PLAYERS (แอดมินเทสคนเดียว) ไม่ลง
  const recorded = new Set()
  function recordTeam(s) {
    if (recorded.has(s.gameId)) return
    recorded.add(s.gameId)
    const ids = Object.keys(s.players)
    if (ids.length < MIN_PLAYERS) return
    set(dbRef(rtdb(), `${BOARD}/${ids.length}/${s.gameId}`), {
      level: s.level, uids: ids, names: ids.map(id => s.players[id].name), at: serverTimestamp(),
    }).catch(() => {})
  }

  function stopHost() {
    clearInterval(timer); timer = null
    if (actionsRef) off(actionsRef, 'child_added')
    actionsRef = null; engine = null
  }

  watch(isHost, h => { if (h) startHost(); else stopHost() })

  function startGame() {
    if (!canStart.value) { error.value = `ต้องมีอย่างน้อย ${MIN_PLAYERS} คนถึงจะเริ่มได้`; return }
    error.value = ''
    const roster = Object.entries(room.value.players)
      .sort((a, b) => (a[1].joinedAt || 0) - (b[1].joinedAt || 0))
      .map(([id, p]) => ({ uid: id, name: p.name }))
    if (!timer) startHost()
    engine = newGame(roster, now())
    // ล้าง action ค้างจากรอบก่อน
    remove(dbRef(rtdb(), `${ROOT}/${roomId.value}/actions`)).catch(() => {})
    writeState()
  }

  function backToLobby() {
    if (!isHost.value) return
    engine = null
    remove(dbRef(rtdb(), `${ROOT}/${roomId.value}/state`)).catch(() => {})
  }

  // ── ผู้เล่นส่งการกระทำ ──
  function sendAction(controlId, value) {
    if (!roomId.value) return
    push(dbRef(rtdb(), `${ROOT}/${roomId.value}/actions`), { uid: uid.value, kind: 'ctrl', controlId, value, t: serverTimestamp() })
  }
  function sendEventDone(eventId) {
    if (!roomId.value) return
    push(dbRef(rtdb(), `${ROOT}/${roomId.value}/actions`), { uid: uid.value, kind: 'event', eventId, t: serverTimestamp() })
  }

  // กระดานทีม: 10 อันดับต่อขนาดทีม (ด่านสูงก่อน เสมอกันใครถึงก่อนอยู่บน)
  async function loadBoard(size) {
    const snap = await get(query(dbRef(rtdb(), `${BOARD}/${size}`), orderByChild('level'), limitToLast(10)))
    const rows = []
    snap.forEach(c => { rows.push({ id: c.key, ...c.val() }) })
    return rows.sort((a, b) => b.level - a.level || (a.at || 0) - (b.at || 0))
  }

  function sendTaps(eventId, n) {
    if (!roomId.value || !n) return
    push(dbRef(rtdb(), `${ROOT}/${roomId.value}/actions`), { uid: uid.value, kind: 'taps', eventId, n, t: serverTimestamp() })
  }

  onBeforeUnmount(() => {
    stopRooms()
    off(offRef)
    if (roomId.value) leaveRoom()
  })

  return {
    uid, now, error, roomList, roomId, room, isHost, canStart,
    listenRooms, stopRooms, createRoom, joinRoom, leaveRoom,
    startGame, backToLobby, sendAction, sendEventDone, sendTaps, loadBoard,
  }
}
