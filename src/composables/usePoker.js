// ════════════════════════════════════════════════════════════
//  usePoker — ห้อง Poker (Texas Hold'em) บน RTDB (โครงเดียวกับ useSpyfall)
//  ชิปมีแค่ในโต๊ะ ไม่ผูกเหรียญแอป · สถิติกำไร/ขาดทุนสะสมข้ามโต๊ะไว้ขำๆ (user สั่ง 17 ต.ค.)
//    poker/rooms/{room}
//      meta     { hostUid, hostName, createdAt, touchedAt, sb, bb }  ← หัวห้องตั้งค่า
//      players  { [uid]: { name, joinedAt, ready, away } }            ← หลุด (ปัดแอปทิ้ง) = onDisconnect ตั้ง away ไม่ลบ
//      banned   { [uid]: true }
//      table    { [uid]: { name, stack, buyIn, awayHands, gone } }    ← หัวห้องเขียน · ชิป+ทุนต่อโต๊ะ (คนลุกแล้วยังอยู่ในตาราง)
//      state    { ...pub จาก pokerEngine, seq, deadline, nextAt }     ← หัวห้องเขียนคนเดียว · ไม่มี state = ล็อบบี้
//      acts     { [uid]: { handNo, seq, type, to? } }                 ← แต่ละคนเขียนของตัวเอง หัวห้องอ่านแล้วลงมือให้
//    poker/secrets/{room}/{uid}  { handNo, cards }    ← อ่านได้เฉพาะเจ้าของ
//    poker/dealer/{room}         { pub, deck, holes, seq } ← อ่านได้เฉพาะหัวห้อง · หัวห้องหลุดกลางมือ คนใหม่อ่านต่อได้เลย
//    poker/stats/{uid}           { name, net, hands, wins }  ← สะสมข้ามโต๊ะ หัวห้องบวกให้ทุกคนตอนจบมือ
//  คนหลุด: ถึงตา = หมอบทันที · มือใหม่ไม่แจกให้ · หายเกิน AWAY_HANDS มือ = ลุกจากโต๊ะ · กลับมาทันนั่งต่อด้วยชิปเดิม
// ════════════════════════════════════════════════════════════
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import {
  getDatabase, ref as dbRef, onValue, off, update, set, remove, push, get,
  onDisconnect, serverTimestamp, increment,
} from 'firebase/database'
import { app } from '../firebase/config.js'
import { useAuthStore } from '../stores/auth.js'
import { useNewsPost } from './useNewsPost.js'
import { logPlay } from '../utils/playLog.js'
import { startHand, act as engineAct, timeoutAction, nextButton, MIN_PLAYERS, MAX_PLAYERS } from '../utils/pokerEngine.js'

const ROOT = 'poker/rooms'
const SECRETS = 'poker/secrets'
const DEALER = 'poker/dealer'
const STATS = 'poker/stats'
export const START_STACK = 1000
export const BLINDS = [[5, 10], [10, 20], [25, 50]]
export const TURN_MS = 20000
export const NEXT_HAND_MS = 7000
export const AWAY_HANDS = 3
const STALE_MS = 30 * 60000   // ห้องที่ไม่มีมือใหม่ 30 นาที = ห้องร้าง (ทุกคนปัดแอปทิ้ง) ลบได้
const TICK_MS = 400

let _db = null
const rtdb = () => (_db ||= getDatabase(app))
const clean = (o) => JSON.parse(JSON.stringify(o))

// RTDB ทิ้ง array ว่าง/ค่า null → เติมกลับให้ engine กับหน้าจอใช้ได้
export function normPub(s) {
  if (!s) return null
  const pub = { ...s, board: s.board || [], order: s.order || [], log: s.log || [], players: s.players || {} }
  if (pub.result) pub.result = { pots: [], won: {}, shown: {}, ...pub.result }
  return pub
}

export function usePoker() {
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
      for (const [id, r] of Object.entries(all)) if (!r.players || isStale(r)) dropRoom(id)
    }, e => { error.value = 'โหลดรายชื่อห้องไม่ได้: ' + e.message })
  }
  function stopRooms() { if (listening) { off(roomsRef); listening = false } }
  const isStale = (r) => (r.meta?.touchedAt || r.meta?.createdAt || 0) < now() - STALE_MS
  function dropRoom(id) {
    remove(dbRef(rtdb(), `${ROOT}/${id}`))
      .then(() => Promise.all([remove(dbRef(rtdb(), `${SECRETS}/${id}`)), remove(dbRef(rtdb(), `${DEALER}/${id}`))]))
      .catch(() => {})
  }

  const roomList = computed(() => Object.entries(rooms.value)
    .filter(([, r]) => r.players && r.meta && Object.values(r.players).some(p => !p.away))
    .map(([id, r]) => ({
      id, hostName: r.meta.hostName, createdAt: r.meta.createdAt || 0,
      blinds: `${r.meta.sb}/${r.meta.bb}`,
      count: Object.keys(r.players).length,
      names: Object.values(r.players).map(p => p.name),
      playing: !!r.state,
      banned: !!r.banned?.[uid.value],
      mine: !!r.players[uid.value],
    }))
    .sort((a, b) => b.createdAt - a.createdAt))

  // ── สถิติสะสม (ข้ามโต๊ะ) ──
  const stats = ref([])
  async function loadStats() {
    try {
      const s = (await get(dbRef(rtdb(), STATS))).val() || {}
      stats.value = Object.entries(s).map(([id, v]) => ({ uid: id, ...v })).filter(r => r.hands > 0).sort((a, b) => b.net - a.net)
    } catch { /* ไม่มีสิทธิ์/เน็ตหลุด ไม่โชว์ก็ได้ */ }
  }

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
    // ปัดแอปทิ้ง/เน็ตหลุด → ตั้ง away (ที่นั่ง+ชิปยังอยู่) · กลับมาเปิดใหม่ = เคลียร์ away
    onDisconnect(dbRef(rtdb(), `${ROOT}/${id}/players/${uid.value}/away`)).set(true)
  }

  async function createRoom() {
    error.value = ''
    const id = push(roomsRef).key
    const name = myName()
    try {
      await update(dbRef(rtdb(), `${ROOT}/${id}`), {
        meta: { hostUid: uid.value, hostName: name, createdAt: serverTimestamp(), touchedAt: serverTimestamp(), sb: 10, bb: 20 },
        [`players/${uid.value}`]: { name, joinedAt: serverTimestamp(), ready: false, away: false },
      })
      subscribeRoom(id)
    } catch (e) { error.value = 'สร้างห้องไม่สำเร็จ: ' + e.message }
  }

  async function joinRoom(id) {
    error.value = ''
    const r = rooms.value[id]
    if (!r) return
    if (r.banned?.[uid.value]) { error.value = 'หัวห้องเชิญคุณออกจากห้องนี้แล้ว'; return }
    const mine = r.players?.[uid.value]
    if (!mine && Object.keys(r.players || {}).length >= MAX_PLAYERS) { error.value = 'โต๊ะเต็มแล้ว'; return }
    try {
      // กลับเข้าห้องเดิมหลังหลุด = เคลียร์ away อย่างเดียว ลำดับที่นั่งเดิม
      if (mine) await update(dbRef(rtdb(), `${ROOT}/${id}/players/${uid.value}`), { away: false, name: myName() })
      else await set(dbRef(rtdb(), `${ROOT}/${id}/players/${uid.value}`), { name: myName(), joinedAt: serverTimestamp(), ready: false, away: false })
      subscribeRoom(id)
    } catch (e) { error.value = 'เข้าห้องไม่สำเร็จ: ' + e.message }
  }

  function leaveLocal() {
    stopHost()
    if (roomRef) off(roomRef)
    if (secretRef) off(secretRef)
    if (roomId.value) onDisconnect(dbRef(rtdb(), `${ROOT}/${roomId.value}/players/${uid.value}/away`)).cancel().catch(() => {})
    roomRef = null; myPlayerRef = null; secretRef = null
    room.value = null; roomId.value = null; secret.value = null
  }

  // ออกเอง (กดปุ่ม) = ลุกจากโต๊ะ · กลางมือ หัวห้องเห็นว่าไม่อยู่แล้วหมอบให้
  async function leaveRoom() {
    const id = roomId.value, me = myPlayerRef
    leaveLocal()
    if (!me) return
    await remove(me).catch(() => {})
    const r = (await get(dbRef(rtdb(), `${ROOT}/${id}/players`)).catch(() => null))?.val()
    if (!r) dropRoom(id)
  }
  // ออกจากหน้าแบบไม่ได้กดออก (กดย้อน/เปลี่ยนแท็บในแอป) = หลุดชั่วคราว ไม่ลุก
  function stepAway() {
    const id = roomId.value
    if (!id) return
    update(dbRef(rtdb(), `${ROOT}/${id}/players/${uid.value}`), { away: true }).catch(() => {})
    leaveLocal()
  }

  // ── สถานะห้อง ──
  const isHost = computed(() => !!room.value && room.value.meta?.hostUid === uid.value)
  const players = computed(() => Object.entries(room.value?.players || {})
    .sort((a, b) => (a[1].joinedAt || 0) - (b[1].joinedAt || 0))
    .map(([id, p]) => ({ uid: id, name: p.name, ready: !!p.ready, away: !!p.away })))
  const othersReady = computed(() => players.value.filter(p => p.uid !== room.value?.meta?.hostUid && !p.away).every(p => p.ready))
  const activeCount = computed(() => players.value.filter(p => !p.away).length)
  const canStart = computed(() => isHost.value && activeCount.value >= MIN_PLAYERS && othersReady.value)
  const pub = computed(() => normPub(room.value?.state))

  // หัวห้องหลุด/ออก → คนที่เข้าห้องก่อนสุดที่ยังอยู่รับช่วง (รวมกลางมือ: อ่าน dealer ต่อได้)
  watch(room, r => {
    if (!r?.meta) return
    const h = r.players?.[r.meta.hostUid]
    if (h && !h.away) return
    const next = players.value.find(p => !p.away)
    if (next && next.uid === uid.value) {
      update(dbRef(rtdb(), `${ROOT}/${roomId.value}/meta`), { hostUid: uid.value, hostName: myName() }).catch(() => {})
    }
  })

  // ── หัวห้อง: ตั้งค่า / เตะ / เริ่ม ──
  const roomPath = (p = '') => `${ROOT}/${roomId.value}${p}`
  function setBlinds([sb, bb]) {
    if (!isHost.value || room.value?.state) return
    update(dbRef(rtdb(), roomPath('/meta')), { sb, bb }).catch(e => { error.value = e.message })
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

  // ── หัวห้อง: แจกมือ ──
  let hand = null, seq = 0
  async function dealNext() {
    const r = room.value
    const present = r.players || {}
    const tbl = clean(r.table || {})
    const prev = normPub(r.state)
    const log = []
    // คนใหม่ / คนที่ลุกไปแล้วกลับมา → นั่งโต๊ะ
    for (const p of players.value) {
      if (!tbl[p.uid]) tbl[p.uid] = { name: p.name, stack: START_STACK, buyIn: START_STACK, awayHands: 0 }
      else if (tbl[p.uid].gone) tbl[p.uid].gone = false
      tbl[p.uid].name = p.name
    }
    const patch = {}
    for (const [id, t] of Object.entries(tbl)) {
      if (t.gone) continue
      const p = present[id]
      if (!p) { t.gone = true; continue }   // กดออกเอง / โดนเตะ
      if (p.away) {
        t.awayHands = (t.awayHands || 0) + 1
        if (t.awayHands > AWAY_HANDS) {     // หายนานเกิน → ลุกจากโต๊ะ (กลับมาก็เข้าห้องใหม่ได้ ชิปเดิม)
          t.gone = true
          patch[`players/${id}`] = null
          log.push(`${t.name} ลุกจากโต๊ะ (หายไป ${AWAY_HANDS} มือ)`)
        }
        continue
      }
      t.awayHands = 0
      if (t.stack <= 0) { t.stack += START_STACK; t.buyIn += START_STACK; log.push(`${t.name} เติมชิป ${START_STACK}`) }
    }
    const seats = players.value
      .filter(p => !p.away && tbl[p.uid] && !tbl[p.uid].gone && tbl[p.uid].stack > 0)
      .map(p => ({ uid: p.uid, stack: tbl[p.uid].stack }))
    const ref0 = dbRef(rtdb())
    const base = `${ROOT}/${roomId.value}`
    if (seats.length < MIN_PLAYERS) {
      // คนไม่พอ → กลับล็อบบี้ (ชิปในโต๊ะยังเก็บไว้)
      hand = null
      const up = { [`${base}/table`]: tbl, [`${base}/state`]: null, [`${base}/acts`]: null }
      for (const [k, v] of Object.entries(patch)) up[`${base}/${k}`] = v
      for (const p of players.value) if (!p.away) up[`${base}/players/${p.uid}/ready`] = false
      await update(ref0, up)
      return
    }
    const btn = nextButton(seats.map(s => s.uid), prev?.button, () => true)
    const handNo = (prev?.handNo || r.lastHand || 0) + 1
    hand = startHand({ seats, button: btn, sb: r.meta.sb || 10, bb: r.meta.bb || 20, handNo })
    hand.pub.log = log.map(t => ({ note: t }))
    seq = 1
    const secrets = {}
    for (const [id, cards] of Object.entries(hand.holes)) secrets[id] = { handNo, cards }
    const up = {
      [`${DEALER}/${roomId.value}`]: clean({ ...hand, seq }),
      [`${SECRETS}/${roomId.value}`]: secrets,
      [`${base}/table`]: tbl,
      [`${base}/acts`]: null,
      [`${base}/lastHand`]: handNo,
      [`${base}/meta/touchedAt`]: serverTimestamp(),
    }
    for (const [k, v] of Object.entries(patch)) up[`${base}/${k}`] = v
    // ลบไพ่เก่าก่อน แล้วค่อยเปิด state ใหม่ → ไม่มีจังหวะที่ state ใหม่โชว์ไพ่มือเก่า
    await update(ref0, up)
    await publish(true)
  }

  // เขียน state ให้ทุกคนเห็น (+ dealer ให้คนรับช่วง) · จบมือ = บวกชิปเข้าโต๊ะ + สถิติสะสม
  async function publish(skipDealer = false) {
    const base = `${ROOT}/${roomId.value}`
    const p = hand.pub
    const t = now()
    const state = clean({ ...p, seq, deadline: t + TURN_MS, nextAt: p.phase === 'showdown' ? t + NEXT_HAND_MS : null })
    const up = { [`${base}/state`]: state }
    if (!skipDealer) up[`${DEALER}/${roomId.value}`] = clean({ ...hand, seq })
    if (p.phase === 'showdown') {
      for (const u of p.order) {
        up[`${base}/table/${u}/stack`] = p.players[u].stack
        const delta = (p.result.won[u] || 0) - p.players[u].total
        up[`${STATS}/${u}/name`] = room.value.table?.[u]?.name || room.value.players?.[u]?.name || '?'
        up[`${STATS}/${u}/net`] = increment(delta)
        up[`${STATS}/${u}/hands`] = increment(1)
        if (p.result.won[u]) up[`${STATS}/${u}/wins`] = increment(1)
      }
    }
    await update(dbRef(rtdb()), up)
  }

  async function startGame() {
    if (!canStart.value) return
    error.value = ''
    try {
      logPlay('poker', players.value.filter(p => !p.away))
      await dealNext()
    } catch (e) { error.value = 'เริ่มเกมไม่สำเร็จ: ' + e.message }
  }

  async function backToLobby() {
    if (!isHost.value) return
    hand = null
    const patch = { state: null, acts: null }
    for (const p of players.value) patch[`players/${p.uid}/ready`] = false
    await update(dbRef(rtdb(), roomPath()), patch).catch(e => { error.value = e.message })
    remove(dbRef(rtdb(), `${SECRETS}/${roomId.value}`)).catch(() => {})
  }

  // ── หัวห้อง: เดินเกม (รันในเครื่องหัวห้อง) ──
  async function ensureHand(st) {
    if (hand && hand.pub.handNo === st.handNo && seq === st.seq) return hand
    const d = (await get(dbRef(rtdb(), `${DEALER}/${roomId.value}`))).val()
    if (!d || d.pub?.handNo !== st.handNo) return null
    hand = { pub: normPub(d.pub), deck: d.deck || [], holes: d.holes || {} }
    seq = d.seq || st.seq
    return hand
  }
  let timer = null, busy = false
  async function hostTick() {
    const r = room.value, st = r?.state
    if (isHost.value && !st && r && (r.meta?.touchedAt || 0) < now() - 5 * 60000) {
      update(dbRef(rtdb(), roomPath('/meta')), { touchedAt: serverTimestamp() }).catch(() => {})
    }
    if (!isHost.value || !st || busy) return
    // เพิ่งเขียนไป แต่ snapshot ยังไม่สะท้อนกลับ → รอ (กันอ่าน deadline/nextAt เก่าแล้วหมอบแทนคนถัดไป หรือแจกซ้ำ)
    if (hand && (hand.pub.handNo !== st.handNo || seq !== st.seq)) return
    // โต๊ะยังมีคน → ต่ออายุห้อง (ไม่งั้นเครื่องอื่นเห็นเป็นห้องร้างแล้วลบ)
    if ((r.meta?.touchedAt || 0) < now() - 5 * 60000) update(dbRef(rtdb(), roomPath('/meta')), { touchedAt: serverTimestamp() }).catch(() => {})
    busy = true
    try {
      if (st.phase === 'showdown') { if (now() >= (st.nextAt || 0)) await dealNext(); return }
      const h = await ensureHand(st)
      if (!h) return
      const u = h.pub.toAct
      if (!u) return
      const p = r.players?.[u]
      const a = r.acts?.[u]
      let action = null
      if (a && a.handNo === st.handNo && a.seq === seq) action = { type: a.type, to: a.to }
      else if (!p || p.away) action = { type: 'fold', auto: 'away' }
      else if (now() >= st.deadline) action = { ...timeoutAction(h.pub, u), auto: 'timeout' }
      if (!action) return
      try { engineAct(h, u, action) } catch {
        // คำสั่งไม่ถูกกติกา (เครื่องผู้เล่นเห็น state เก่า) → ทิ้ง รอกดใหม่/หมดเวลา
        await update(dbRef(rtdb(), roomPath(`/acts/${u}`)), { seq: -1 }); return
      }
      if (action.auto) h.pub.log[h.pub.log.length - 1].auto = action.auto
      seq++
      await publish()
    } catch (e) { error.value = 'เดินเกมไม่สำเร็จ: ' + e.message; hand = null } finally { busy = false }
  }
  function startHost() { if (!timer) timer = setInterval(hostTick, TICK_MS) }
  function stopHost() { clearInterval(timer); timer = null; hand = null }
  watch(isHost, h => { if (h) startHost(); else stopHost() })

  // ── ผู้เล่น ──
  function act(action) {
    const st = room.value?.state
    if (!roomId.value || !st || st.toAct !== uid.value) return
    set(dbRef(rtdb(), roomPath(`/acts/${uid.value}`)), clean({ handNo: st.handNo, seq: st.seq, type: action.type, to: action.to }))
      .catch(e => { error.value = e.message })
  }

  onBeforeUnmount(() => {
    stopRooms()
    off(offRef)
    if (roomId.value) stepAway()
  })

  return {
    uid, now, error, kicked, roomList, roomId, room, secret, pub, isHost, players, othersReady, canStart, activeCount,
    stats, loadStats, listenRooms, stopRooms, createRoom, joinRoom, leaveRoom,
    setBlinds, kick, setReady, startGame, backToLobby, act,
  }
}
