// 🎲 ห้องเศรษฐีรอบโลก — เล่นกับบอทในเครื่อง หรือห้องออนไลน์ (RTDB) ใช้ engine ตัวเดียวกัน
//
// ออนไลน์ (host-authoritative): tycoon/rooms/{code}
//   meta  { host, status:'lobby'|'play', created }
//   seats { 0..3: { uid, name, bot } }
//   game  { json (state), ev (events ล่าสุด), ver }
//   inbox/{uid} { a: action, ver }   ← คนอื่นส่งคำสั่งเข้ามา host เป็นคนรัน step แล้วเขียน game
//   pres/{uid}  true + onDisconnect remove
// host ตัวจริง = meta.host ถ้ายังออนไลน์ ไม่งั้นคนจริงที่นั่งต่ำสุดที่ยังออนไลน์ (รับช่วงอัตโนมัติ)
// host รันบอท + เล่นแทนคนหลุด/หมดเวลา · เขียนด้วย transaction ตรวจ ver กันเขียนซ้อน
// ⚠️ ฟิลด์ dice ในคำสั่งถูกตัดทิ้งเสมอ (มีไว้ให้เทสต์เท่านั้น)
import { ref, computed, onUnmounted } from 'vue'
import {
  getDatabase, ref as dbRef, onValue, set, update, remove, onDisconnect, runTransaction, get, serverTimestamp,
} from 'firebase/database'
import { app } from '../firebase/config.js'
import { useAuthStore } from '../stores/auth.js'
import { newGame, step } from '../utils/tycoon/engine.js'
import { botAction } from '../utils/tycoon/bot.js'
import { GAME } from '../data/tycoon/board.js'
import { roomCode } from '../utils/tycoonAccess.js'

let _db
const rtdb = () => (_db ||= getDatabase(app))
const BOT_NAMES = ['บอทเหรียญทอง', 'บอทนักเดินทาง', 'บอทเจ้าที่', 'บอทสายลุย']
const BOT_DELAY = 700
const clean = (a) => { const { dice, ...rest } = a || {}; return rest }

export function useTycoonRoom(fx) {
  const auth = useAuthStore()
  const myUid = () => auth.currentUser?.uid || 'me'
  const myName = () => auth.userData?.nickname || 'ฉัน'

  const mode = ref('menu')        // menu | lobby | game
  const online = ref(false)
  const state = ref(null)
  const code = ref('')
  const room = ref(null)          // ข้อมูลห้องดิบจาก RTDB
  const error = ref('')
  const turnStartedAt = ref(Date.now())
  const now = ref(Date.now())
  let unsub = null, tick = null, ver = 0, botTimer = null, hostBusy = false

  const mySeat = computed(() => state.value ? state.value.players.findIndex(p => p.uid === myUid()) : -1)
  const myTurn = computed(() => !!state.value && state.value.phase !== 'over' && state.value.turn === mySeat.value)
  const canAct = computed(() => myTurn.value && !fx.busy.value)
  const timeLeft = computed(() => Math.max(0, GAME.turnSeconds - Math.floor((now.value - turnStartedAt.value) / 1000)))
  const seats = computed(() => room.value?.seats || {})
  const pres = computed(() => room.value?.pres || {})
  const actingHost = computed(() => {
    const r = room.value
    if (!r?.meta) return null
    if (pres.value[r.meta.host]) return r.meta.host
    const humans = Object.keys(seats.value).sort().map(k => seats.value[k]).filter(s => !s.bot && pres.value[s.uid])
    return humans[0]?.uid || null
  })
  const isHost = computed(() => actingHost.value === myUid())

  function adopt(next, events, fresh = false) {
    state.value = next
    turnStartedAt.value = Date.now()
    if (fresh) fx.reset(next)
    return fx.play(events, next)
  }

  // ───────── ในเครื่อง ─────────
  function startLocal(nBots) {
    stop()
    online.value = false
    const players = [{ uid: myUid(), name: myName() }, ...BOT_NAMES.slice(0, nBots).map((n, i) => ({ uid: 'bot' + i, name: n, bot: true }))]
    const s = newGame(players, (Date.now() ^ Math.floor(Math.random() * 1e9)) >>> 0)
    mode.value = 'game'
    adopt(s, [], true)
    tick = setInterval(() => { now.value = Date.now() }, 500)
    scheduleLocalBot()
  }

  function applyLocal(action) {
    const r = step(state.value, action)
    if (r.error) return false
    adopt(r.state, r.events).then(scheduleLocalBot)
    return true
  }

  function scheduleLocalBot() {
    clearTimeout(botTimer)
    const s = state.value
    if (!s || s.phase === 'over' || online.value) return
    if (s.players[s.turn].bot) botTimer = setTimeout(() => applyLocal(botAction(s)), BOT_DELAY)
  }

  // ───────── ออนไลน์ ─────────
  const roomRef = (p = '') => dbRef(rtdb(), `tycoon/rooms/${code.value}${p ? '/' + p : ''}`)

  async function createRoom() {
    error.value = ''
    for (let i = 0; i < 5; i++) {
      code.value = roomCode()
      const snap = await get(roomRef('meta'))
      if (!snap.exists()) break
    }
    await set(roomRef(), {
      meta: { host: myUid(), status: 'lobby', created: serverTimestamp() },
      seats: { 0: { uid: myUid(), name: myName(), bot: false } },
    })
    await enterRoom()
  }

  async function joinRoom(c) {
    error.value = ''
    code.value = String(c || '').trim().toUpperCase()
    const snap = await get(roomRef())
    const r = snap.val()
    if (!r?.meta) { error.value = 'ไม่เจอห้องนี้ ลองเช็ครหัสอีกที'; return }
    const taken = Object.values(r.seats || {}).some(s => s.uid === myUid())
    if (!taken) {
      if (r.meta.status !== 'lobby') { error.value = 'ห้องนี้เริ่มเล่นไปแล้ว'; return }
      const free = [0, 1, 2, 3].find(i => !r.seats?.[i])
      if (free == null) { error.value = 'ห้องเต็มแล้ว (4 คน)'; return }
      await set(roomRef('seats/' + free), { uid: myUid(), name: myName(), bot: false })
    }
    await enterRoom()
  }

  async function enterRoom() {
    online.value = true
    mode.value = 'lobby'
    const me = roomRef('pres/' + myUid())
    await set(me, true)
    onDisconnect(me).remove()
    unsub = onValue(roomRef(), (snap) => {
      const r = snap.val()
      room.value = r
      if (!r) { error.value = 'ห้องถูกปิดแล้ว'; leaveRoom(); return }
      if (r.meta?.status === 'play' && r.game?.json && r.game.ver !== ver) {
        const fresh = ver === 0
        ver = r.game.ver
        mode.value = 'game'
        adopt(JSON.parse(r.game.json), fresh ? [] : JSON.parse(r.game.ev || '[]'), fresh)
      }
      hostWork()
    })
    tick = setInterval(() => { now.value = Date.now(); hostWork() }, 1000)
  }

  function addBot() {
    const free = [0, 1, 2, 3].find(i => !seats.value[i])
    if (free == null) return
    const used = Object.values(seats.value).filter(s => s.bot).length
    set(roomRef('seats/' + free), { uid: 'bot' + free, name: BOT_NAMES[used % 4], bot: true })
  }
  const removeSeat = (i) => remove(roomRef('seats/' + i))

  async function startOnline() {
    const list = [0, 1, 2, 3].map(i => seats.value[i]).filter(Boolean)
    if (list.length < 2) { error.value = 'ต้องมีอย่างน้อย 2 ที่นั่ง (เติมบอทได้)'; return }
    const s = newGame(list, (Date.now() ^ Math.floor(Math.random() * 1e9)) >>> 0)
    await update(roomRef(), { 'meta/status': 'play', game: { json: JSON.stringify(s), ev: '[]', ver: 1 } })
  }

  /** host: ประมวลคำสั่งใน inbox + บอท + คนหมดเวลา */
  async function hostWork() {
    const r = room.value, s = state.value
    if (!online.value || !isHost.value || hostBusy || !s || s.phase === 'over' || r?.meta?.status !== 'play') return
    if (fx.busy.value) return
    const cur = s.players[s.turn]
    let action = null
    const box = r.inbox?.[cur.uid]
    if (box && box.ver === ver) action = clean(box.a)
    else if (cur.bot || !pres.value[cur.uid]) { if (Date.now() - turnStartedAt.value > BOT_DELAY) action = botAction(s) }
    else if (Date.now() - turnStartedAt.value > (GAME.turnSeconds + 6) * 1000) action = botAction(s)
    if (!action) return
    const res = step(s, action)
    if (res.error) { if (box) remove(roomRef('inbox/' + cur.uid)); return }
    hostBusy = true
    try {
      await runTransaction(roomRef('game'), (g) => {
        if (!g || g.ver !== ver) return undefined   // มีคนเขียนก่อนแล้ว → ยกเลิก
        return { json: JSON.stringify(res.state), ev: JSON.stringify(res.events), ver: ver + 1 }
      })
      if (box) await remove(roomRef('inbox/' + cur.uid))
    } finally { hostBusy = false }
  }

  // ───────── ผู้เล่นกด ─────────
  function act(action) {
    if (!canAct.value) return false
    if (!online.value) return applyLocal(action)
    if (isHost.value) {
      const r = step(state.value, action)
      if (r.error) return false
      hostBusy = true
      runTransaction(roomRef('game'), (g) => (!g || g.ver !== ver ? undefined
        : { json: JSON.stringify(r.state), ev: JSON.stringify(r.events), ver: ver + 1 }))
        .finally(() => { hostBusy = false })
      return true
    }
    set(roomRef('inbox/' + myUid()), { a: clean(action), ver })
    return true
  }

  function stop() {
    clearTimeout(botTimer); clearInterval(tick); tick = null
    if (unsub) { unsub(); unsub = null }
  }

  async function leaveRoom() {
    const wasOnline = online.value, c = code.value
    stop()
    if (wasOnline && c) {
      remove(dbRef(rtdb(), `tycoon/rooms/${c}/pres/${myUid()}`)).catch(() => {})
      if (room.value?.meta?.status === 'lobby') {
        const k = Object.keys(room.value.seats || {}).find(i => room.value.seats[i].uid === myUid())
        if (k != null) remove(dbRef(rtdb(), `tycoon/rooms/${c}/seats/${k}`)).catch(() => {})
      }
    }
    online.value = false; room.value = null; state.value = null; ver = 0; code.value = ''
    mode.value = 'menu'
  }

  onUnmounted(() => { leaveRoom() })

  return {
    mode, online, state, code, room, error, seats, pres, mySeat, myTurn, canAct, timeLeft, isHost,
    startLocal, createRoom, joinRoom, addBot, removeSeat, startOnline, act, leaveRoom,
  }
}
