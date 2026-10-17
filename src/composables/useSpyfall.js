// ════════════════════════════════════════════════════════════
//  useSpyfall — ห้อง Pharm Spyfall บน RTDB (โครงเดียวกับ usePharmaTeam)
//    spyfall/rooms/{room}
//      meta     { hostUid, hostName, createdAt, mode, minutes }   ← หัวห้องตั้งค่า
//      players  { [uid]: { name, joinedAt, ready } }               ← onDisconnect ลบตัวเอง
//      banned   { [uid]: true }                                     ← หัวห้องเตะ = กลับเข้าห้องนี้ไม่ได้ (rules บังคับ)
//      state    { status: play|vote|end, round, mode, options[], roster{uid:name}, starterUid, endsAt, stoppedBy, result }
//               ← หัวห้องเขียนคนเดียว · ไม่มี state = อยู่ล็อบบี้
//      acts     { [uid]: { round, stop?, vote?, guess? } }          ← แต่ละคนเขียนของตัวเอง หัวห้องอ่านแล้วตัดสิน
//    spyfall/secrets/{room}/{uid}  { round, spy } | { round, word, role }  ← อ่านได้เฉพาะเจ้าของ
//    spyfall/dealer/{room}         { round, spyUid, word, roles }          ← อ่านได้เฉพาะหัวห้อง (ไว้ตัดสินตอนจบ/รับช่วง)
//  ระหว่างเล่นระบบแค่สุ่มคนเริ่มถาม + จับเวลา · การส่งต่อคำถามให้วงจัดการกันเอง (user สั่ง 17 ต.ค.)
// ════════════════════════════════════════════════════════════
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import {
  getDatabase, ref as dbRef, onValue, off, update, set, remove, push, get,
  onDisconnect, serverTimestamp,
} from 'firebase/database'
import { app } from '../firebase/config.js'
import { useAuthStore } from '../stores/auth.js'
import { useNewsPost } from './useNewsPost.js'
import { deal, tally, judgeGuess, allVoted, MIN_PLAYERS, MAX_PLAYERS } from '../utils/spyfallEngine.js'

const ROOT = 'spyfall/rooms'
const SECRETS = 'spyfall/secrets'
const DEALER = 'spyfall/dealer'
const TICK_MS = 500

let _db = null
const rtdb = () => (_db ||= getDatabase(app))
const clean = (o) => JSON.parse(JSON.stringify(o))

export function useSpyfall() {
  const auth = useAuthStore()
  const { myName } = useNewsPost()
  const uid = computed(() => auth.currentUser?.uid || null)

  const offset = ref(0)
  const now = () => Date.now() + offset.value
  const rooms = ref({})
  const roomId = ref(null)
  const room = ref(null)
  const secret = ref(null)
  const error = ref('')
  const kicked = ref(false)

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
      for (const [id, r] of Object.entries(all)) if (!r.players) dropRoom(id)
    }, e => { error.value = 'โหลดรายชื่อห้องไม่ได้: ' + e.message })
  }
  function stopRooms() { if (listening) { off(roomsRef); listening = false } }
  // ห้องร้าง → ลบห้อง + ไพ่ที่ค้าง (rules ยอมเมื่อไม่มีคนเหลือ)
  function dropRoom(id) {
    remove(dbRef(rtdb(), `${ROOT}/${id}`))
      .then(() => Promise.all([remove(dbRef(rtdb(), `${SECRETS}/${id}`)), remove(dbRef(rtdb(), `${DEALER}/${id}`))]))
      .catch(() => {})
  }

  const roomList = computed(() => Object.entries(rooms.value)
    .filter(([, r]) => r.players && r.meta)
    .map(([id, r]) => ({
      id, hostName: r.meta.hostName, createdAt: r.meta.createdAt || 0,
      mode: r.meta.mode || 'normal',
      count: Object.keys(r.players).length,
      names: Object.values(r.players).map(p => p.name),
      playing: !!r.state,
      banned: !!r.banned?.[uid.value],
    }))
    .sort((a, b) => b.createdAt - a.createdAt))

  // ── เข้า/ออกห้อง ──
  let roomRef = null, myPlayerRef = null, secretRef = null
  function subscribeRoom(id) {
    roomId.value = id
    kicked.value = false
    roomRef = dbRef(rtdb(), `${ROOT}/${id}`)
    onValue(roomRef, snap => {
      const r = snap.val()
      if (!r || !r.players?.[uid.value]) {
        if (r?.banned?.[uid.value]) kicked.value = true
        leaveLocal(); return
      }
      room.value = r
    })
    secretRef = dbRef(rtdb(), `${SECRETS}/${id}/${uid.value}`)
    onValue(secretRef, s => { secret.value = s.val() }, () => { secret.value = null })
    myPlayerRef = dbRef(rtdb(), `${ROOT}/${id}/players/${uid.value}`)
    onDisconnect(myPlayerRef).remove()
  }

  async function createRoom() {
    error.value = ''
    const id = push(roomsRef).key
    const name = myName()
    try {
      await update(dbRef(rtdb(), `${ROOT}/${id}`), {
        meta: { hostUid: uid.value, hostName: name, createdAt: serverTimestamp(), mode: 'normal', minutes: 7 },
        [`players/${uid.value}`]: { name, joinedAt: serverTimestamp(), ready: false },
      })
      subscribeRoom(id)
    } catch (e) { error.value = 'สร้างห้องไม่สำเร็จ: ' + e.message }
  }

  async function joinRoom(id) {
    error.value = ''
    const r = rooms.value[id]
    if (!r) return
    if (r.banned?.[uid.value]) { error.value = 'หัวห้องเชิญคุณออกจากห้องนี้แล้ว'; return }
    if (Object.keys(r.players || {}).length >= MAX_PLAYERS) { error.value = 'ห้องเต็มแล้ว'; return }
    try {
      await set(dbRef(rtdb(), `${ROOT}/${id}/players/${uid.value}`), { name: myName(), joinedAt: serverTimestamp(), ready: false })
      subscribeRoom(id)
    } catch (e) { error.value = 'เข้าห้องไม่สำเร็จ: ' + e.message }
  }

  function leaveLocal() {
    stopHost()
    if (roomRef) off(roomRef)
    if (secretRef) off(secretRef)
    if (myPlayerRef) onDisconnect(myPlayerRef).cancel().catch(() => {})
    roomRef = null; myPlayerRef = null; secretRef = null
    room.value = null; roomId.value = null; secret.value = null
  }

  async function leaveRoom() {
    const id = roomId.value, me = myPlayerRef
    leaveLocal()
    if (!me) return
    await remove(me).catch(() => {})
    dropRoom(id)   // คนสุดท้าย → ห้องหาย (มีคนเหลือ rules ปฏิเสธเอง)
  }

  // ── สถานะห้อง ──
  const isHost = computed(() => !!room.value && room.value.meta?.hostUid === uid.value)
  const players = computed(() => Object.entries(room.value?.players || {})
    .sort((a, b) => (a[1].joinedAt || 0) - (b[1].joinedAt || 0))
    .map(([id, p]) => ({ uid: id, name: p.name, ready: !!p.ready })))
  const othersReady = computed(() => players.value.filter(p => p.uid !== room.value?.meta?.hostUid).every(p => p.ready))
  const minPlayers = computed(() => auth.isAdmin ? 1 : MIN_PLAYERS)   // แอดมินเทสคนเดียวได้
  const canStart = computed(() => isHost.value && players.value.length >= minPlayers.value && othersReady.value)

  // หัวห้องหลุด → คนที่เข้าห้องก่อนสุดรับช่วง
  watch(room, r => {
    if (!r?.meta || r.players?.[r.meta.hostUid]) return
    const next = players.value[0]
    if (next && next.uid === uid.value) {
      update(dbRef(rtdb(), `${ROOT}/${roomId.value}/meta`), { hostUid: uid.value, hostName: myName() }).catch(() => {})
    }
  })

  // ── หัวห้อง: ตั้งค่า / เตะ / เริ่ม ──
  const roomPath = (p = '') => `${ROOT}/${roomId.value}${p}`
  function setOption(key, value) {
    if (!isHost.value || room.value?.state) return
    update(dbRef(rtdb(), roomPath('/meta')), { [key]: value }).catch(e => { error.value = e.message })
  }
  async function kick(targetUid) {
    if (!isHost.value || targetUid === uid.value) return
    await update(dbRef(rtdb(), roomPath()), {
      [`players/${targetUid}`]: null, [`banned/${targetUid}`]: true, [`acts/${targetUid}`]: null,
    }).catch(e => { error.value = 'เตะไม่สำเร็จ: ' + e.message })
  }
  function setReady(v) {
    if (!roomId.value) return
    update(dbRef(rtdb(), roomPath(`/players/${uid.value}`)), { ready: !!v }).catch(() => {})
  }

  async function startGame() {
    if (!canStart.value) return
    error.value = ''
    const r = room.value
    const mode = r.meta.mode || 'normal'
    const ids = players.value.map(p => p.uid)
    const d = deal(ids, mode)
    const round = (r.lastRound || 0) + 1
    const secrets = {}
    for (const [id, s] of Object.entries(d.secrets)) secrets[id] = { round, ...s }
    const roles = {}
    for (const [id, s] of Object.entries(d.secrets)) roles[id] = s.spy ? null : s.role
    try {
      dealer = { round, spyUid: d.spyUid, word: d.word, roles }
      await set(dbRef(rtdb(), `${DEALER}/${roomId.value}`), clean(dealer))
      await set(dbRef(rtdb(), `${SECRETS}/${roomId.value}`), secrets)
      await remove(dbRef(rtdb(), roomPath('/acts')))
      const t = now()
      await update(dbRef(rtdb(), roomPath()), {
        lastRound: round,
        state: {
          status: 'play', round, mode, options: d.options, starterUid: d.starterUid,
          roster: Object.fromEntries(players.value.map(p => [p.uid, p.name])),
          startedAt: t, endsAt: t + (r.meta.minutes || 7) * 60000,
        },
      })
    } catch (e) { error.value = 'เริ่มเกมไม่สำเร็จ: ' + e.message }
  }

  async function backToLobby() {
    if (!isHost.value) return
    const patch = { state: null, acts: null }
    for (const p of players.value) patch[`players/${p.uid}/ready`] = false
    await update(dbRef(rtdb(), roomPath()), patch).catch(e => { error.value = e.message })
    remove(dbRef(rtdb(), `${SECRETS}/${roomId.value}`)).catch(() => {})
  }

  // ── หัวห้อง: ตัดสินเกม (รันในเครื่องหัวห้อง) ──
  let dealer = null, timer = null, busy = false
  async function ensureDealer(round) {
    if (dealer?.round === round) return dealer
    const s = await get(dbRef(rtdb(), `${DEALER}/${roomId.value}`))
    dealer = s.val()
    return dealer?.round === round ? dealer : null
  }
  async function hostTick() {
    const r = room.value, st = r?.state
    if (!isHost.value || !st || st.status === 'end' || busy) return
    busy = true
    try {
      const d = await ensureDealer(st.round)
      if (!d) return
      const present = r.players || {}
      const acts = Object.fromEntries(Object.entries(r.acts || {}).filter(([, a]) => a?.round === st.round))
      const finish = (outcome) => update(dbRef(rtdb(), roomPath('/state')), {
        status: 'end', result: clean({ ...outcome, spyUid: d.spyUid, word: d.word, roles: d.roles }),
      })
      if (!present[d.spyUid]) return await finish({ winner: null, reason: 'spyleft' })
      const g = acts[d.spyUid]?.guess
      if (g) return await finish(judgeGuess(g, d.word))
      if (st.status === 'play') {
        const stopper = Object.entries(acts).find(([id, a]) => a.stop && present[id])
        if (stopper || now() >= st.endsAt) {
          await update(dbRef(rtdb(), roomPath('/state')), { status: 'vote', stoppedBy: stopper ? stopper[0] : null })
        }
        return
      }
      if (st.status === 'vote') {
        const voters = Object.keys(st.roster).filter(id => present[id])
        const votes = Object.fromEntries(Object.entries(acts).map(([id, a]) => [id, a.vote]))
        if (allVoted(votes, voters)) await finish(tally(votes, voters, d.spyUid))
      }
    } catch (e) { error.value = 'ตัดสินเกมไม่สำเร็จ: ' + e.message } finally { busy = false }
  }
  function startHost() { if (!timer) timer = setInterval(hostTick, TICK_MS) }
  function stopHost() { clearInterval(timer); timer = null; dealer = null }
  watch(isHost, h => { if (h) startHost(); else stopHost() })

  // ── ผู้เล่น ──
  function act(patch) {
    const st = room.value?.state
    if (!roomId.value || !st) return
    update(dbRef(rtdb(), roomPath(`/acts/${uid.value}`)), { ...patch, round: st.round }).catch(e => { error.value = e.message })
  }
  const callVote = () => act({ stop: serverTimestamp() })
  const vote = (target) => act({ vote: target })
  const guess = (word) => act({ guess: word })

  onBeforeUnmount(() => {
    stopRooms()
    off(offRef)
    if (roomId.value) leaveRoom()
  })

  return {
    uid, now, error, kicked, roomList, roomId, room, secret, isHost, players, othersReady, canStart, minPlayers,
    listenRooms, stopRooms, createRoom, joinRoom, leaveRoom,
    setOption, kick, setReady, startGame, backToLobby, callVote, vote, guess,
  }
}
