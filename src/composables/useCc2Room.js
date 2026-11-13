// ════════════════════════════════════════════════════════════
//  useCc2Room — ห้องซ้อมคู่ CC2 OSPE แบบมาตรฐาน (2 คน: ผู้ประเมิน + ผู้สอบ) บน RTDB (โครงเดียวกับ useSpyfall)
//    cc2/rooms/{code}                      code = รหัสสั้น 4 ตัว (A–Z 2–9 ตัดตัวที่สับสน) บอกเพื่อนปากเปล่าได้
//      meta     { hostUid, hostName, createdAt }                 ← หัวห้อง (รับช่วงได้ถ้าหัวห้องหลุด)
//      players  { [uid]: { name, joinedAt, role } }              ← ตัวเองเขียนของตัวเอง · onDisconnect ลบ · role = examiner|examinee|''
//      state    { status: play|done, round, caseId, caseTitle, cat, examinerUid, examineeUid, startedAt, endsAt, durationMin }
//               ← หัวห้องเขียน (ผู้ประเมินเปลี่ยน status เป็น done ได้) · ไม่มี state = อยู่ล็อบบี้
//      live     { revealed: {key: true}, answers: {i: text} }    ← ผู้ประเมินส่งข้อมูล / ผู้สอบพิมพ์คำตอบช่องเติมคำ
//      result   { round, got, tot, checks, answers, at }         ← ผู้ประเมินเขียนตอนจบเคส → ผู้สอบเห็นแล้วบันทึกผลตัวเอง
//  เช็คลิสต์ที่ผู้ประเมินติ๊กอยู่ในเครื่องผู้ประเมินจนกว่าจะจบเคส — ไม่ผ่าน RTDB ระหว่างสอบ (ผู้สอบแอบดูไม่ได้)
//  เนื้อเคสโหลดจากไฟล์ static ทั้งสองฝั่ง (useCc2Data) — RTDB เก็บแค่ caseId
// ════════════════════════════════════════════════════════════
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import {
  getDatabase, ref as dbRef, onValue, off, update, set, remove, get,
  onDisconnect, serverTimestamp,
} from 'firebase/database'
import { app } from '../firebase/config.js'
import { useAuthStore } from '../stores/auth.js'
import { useNewsPost } from './useNewsPost.js'
import { cleanText } from '../utils/text.js'

const ROOT = 'cc2/rooms'
const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
export const ROOM_SIZE = 2
export const ROLES = { examiner: 'ผู้ประเมิน', examinee: 'ผู้สอบ' }

let _db = null
const rtdb = () => (_db ||= getDatabase(app))
const makeCode = () => Array.from({ length: 4 }, () => CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]).join('')
export const normCode = s => String(s || '').toUpperCase().replace(/[^A-Z0-9]/g, '').replace(/0/g, 'O').replace(/1/g, 'I').slice(0, 6)

export function useCc2Room() {
  const auth = useAuthStore()
  const { myName } = useNewsPost()
  const uid = computed(() => auth.currentUser?.uid || null)

  const offset = ref(0)
  const now = () => Date.now() + offset.value
  const offRef = dbRef(rtdb(), '.info/serverTimeOffset')
  onValue(offRef, s => { offset.value = s.val() || 0 })

  const rooms = ref({})
  const roomId = ref(null)
  const room = ref(null)
  const error = ref('')

  // ── รายชื่อห้องที่รอคน ──
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
  function dropRoom(id) { remove(dbRef(rtdb(), `${ROOT}/${id}`)).catch(() => {}) }

  const roomList = computed(() => Object.entries(rooms.value)
    .filter(([, r]) => r.players && r.meta)
    .map(([id, r]) => ({
      id, hostName: r.meta.hostName, createdAt: r.meta.createdAt || 0,
      count: Object.keys(r.players).length,
      names: Object.values(r.players).map(p => p.name),
      playing: !!r.state,
      mine: !!r.players[uid.value],
    }))
    .sort((a, b) => b.createdAt - a.createdAt))

  // ── เข้า/ออกห้อง ──
  let roomRef = null, myPlayerRef = null
  function subscribeRoom(id) {
    roomId.value = id
    roomRef = dbRef(rtdb(), `${ROOT}/${id}`)
    onValue(roomRef, snap => {
      const r = snap.val()
      if (!r || !r.players?.[uid.value]) { leaveLocal(); return }
      room.value = r
    })
    myPlayerRef = dbRef(rtdb(), `${ROOT}/${id}/players/${uid.value}`)
    onDisconnect(myPlayerRef).remove()
  }

  async function createRoom() {
    error.value = ''
    if (!uid.value) { error.value = 'ต้องล็อกอินก่อน'; return }
    const name = cleanText(myName(), 40)
    try {
      let code = ''
      for (let i = 0; i < 6; i++) {
        const c = makeCode()
        if (!(await get(dbRef(rtdb(), `${ROOT}/${c}`))).exists()) { code = c; break }
      }
      if (!code) throw new Error('สุ่มรหัสห้องไม่ได้ ลองใหม่')
      await update(dbRef(rtdb(), `${ROOT}/${code}`), {
        meta: { hostUid: uid.value, hostName: name, createdAt: serverTimestamp() },
        [`players/${uid.value}`]: { name, joinedAt: serverTimestamp(), role: 'examiner' },
      })
      subscribeRoom(code)
    } catch (e) { error.value = 'สร้างห้องไม่สำเร็จ: ' + e.message }
  }

  async function joinRoom(code) {
    error.value = ''
    code = normCode(code)
    if (!code) { error.value = 'พิมพ์รหัสห้องก่อน'; return }
    try {
      const snap = await get(dbRef(rtdb(), `${ROOT}/${code}`))
      const r = snap.val()
      if (!r?.players || !r.meta) { error.value = `ไม่เจอห้อง ${code} — เช็ครหัสกับเพื่อนอีกที`; return }
      const n = Object.keys(r.players).length
      if (!r.players[uid.value] && n >= ROOM_SIZE) { error.value = 'ห้องนี้ครบ 2 คนแล้ว'; return }
      if (r.state && !r.players[uid.value]) { error.value = 'ห้องนี้กำลังซ้อมอยู่ รอจบรอบก่อน'; return }
      // บทบาทเริ่มต้น = ตรงข้ามกับคนที่อยู่ก่อน
      const taken = Object.values(r.players).map(p => p.role)
      const role = taken.includes('examiner') ? 'examinee' : 'examiner'
      await set(dbRef(rtdb(), `${ROOT}/${code}/players/${uid.value}`), { name: cleanText(myName(), 40), joinedAt: serverTimestamp(), role })
      subscribeRoom(code)
    } catch (e) { error.value = 'เข้าห้องไม่สำเร็จ: ' + e.message }
  }

  function leaveLocal() {
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
    dropRoom(id)   // คนสุดท้ายออก → ห้องหาย (ยังมีคนอยู่ rules ปฏิเสธเอง)
  }

  // ── สถานะห้อง ──
  const roomPath = (p = '') => `${ROOT}/${roomId.value}${p}`
  const isHost = computed(() => !!room.value && room.value.meta?.hostUid === uid.value)
  const players = computed(() => Object.entries(room.value?.players || {})
    .sort((a, b) => (a[1].joinedAt || 0) - (b[1].joinedAt || 0))
    .map(([id, p]) => ({ uid: id, name: p.name, role: p.role || '' })))
  const me = computed(() => players.value.find(p => p.uid === uid.value) || null)
  const partner = computed(() => players.value.find(p => p.uid !== uid.value) || null)
  const state = computed(() => room.value?.state || null)
  const live = computed(() => room.value?.live || {})
  const result = computed(() => room.value?.result || null)
  const myRole = computed(() => {
    const st = state.value
    if (st) return st.examinerUid === uid.value ? 'examiner' : st.examineeUid === uid.value ? 'examinee' : ''
    return me.value?.role || ''
  })
  const rolesOk = computed(() => players.value.length === ROOM_SIZE && new Set(players.value.map(p => p.role)).size === 2 && players.value.every(p => p.role))
  const canStart = computed(() => me.value?.role === 'examiner' && !state.value && rolesOk.value)   // ผู้ประเมินเริ่มเคส
  // คู่หลุดกลางเคส → อีกฝั่งเห็นป้าย + หัวห้องกลับล็อบบี้ได้
  const partnerLeft = computed(() => !!state.value && !(room.value?.players?.[state.value.examinerUid] && room.value?.players?.[state.value.examineeUid]))

  // หัวห้องหลุด → คนที่เหลือรับช่วง
  watch(room, r => {
    if (!r?.meta || r.players?.[r.meta.hostUid]) return
    const next = players.value[0]
    if (next && next.uid === uid.value) update(dbRef(rtdb(), roomPath('/meta')), { hostUid: uid.value, hostName: cleanText(myName(), 40) }).catch(() => {})
  })

  // ── ล็อบบี้: บทบาท ──
  function setRole(role) {
    if (!roomId.value || state.value) return
    update(dbRef(rtdb(), roomPath(`/players/${uid.value}`)), { role }).catch(e => { error.value = e.message })
  }
  function swapRoles() {
    if (!isHost.value || state.value) return
    const patch = {}
    for (const p of players.value) patch[`players/${p.uid}/role`] = p.role === 'examiner' ? 'examinee' : 'examiner'
    update(dbRef(rtdb(), roomPath()), patch).catch(e => { error.value = e.message })
  }
  async function kick(targetUid) {
    if (!isHost.value || targetUid === uid.value) return
    await remove(dbRef(rtdb(), roomPath(`/players/${targetUid}`))).catch(e => { error.value = 'เชิญออกไม่สำเร็จ: ' + e.message })
  }

  // ── ผู้ประเมิน: เริ่มเคส ──
  async function startCase({ caseId, caseTitle = '', cat = '', durationMin = 0 }) {
    if (!canStart.value || !caseId) return
    error.value = ''
    const ex = players.value.find(p => p.role === 'examiner'), ee = players.value.find(p => p.role === 'examinee')
    const round = (room.value.lastRound || 0) + 1
    const t = now()
    try {
      await update(dbRef(rtdb(), roomPath()), {
        lastRound: round, live: null, result: null,
        state: {
          status: 'play', round, caseId, caseTitle: cleanText(caseTitle, 120), cat,
          examinerUid: ex.uid, examineeUid: ee.uid,
          startedAt: t, endsAt: durationMin > 0 ? t + durationMin * 60000 : null, durationMin: durationMin || 0,
        },
      })
    } catch (e) { error.value = 'เริ่มเคสไม่สำเร็จ: ' + e.message }
  }

  // ── ระหว่างเคส ──
  function reveal(key) {
    if (myRole.value !== 'examiner' || state.value?.status !== 'play') return
    update(dbRef(rtdb(), roomPath('/live/revealed')), { [String(key).replace(/[.#$/\[\]]/g, '_')]: true }).catch(e => { error.value = e.message })
  }
  const revealedKeys = computed(() => Object.keys(live.value.revealed || {}).map(k => k.replace(/^patient_(\d+)$/, 'patient:$1')))
  const answerTimers = new Map()
  function setAnswer(i, text) {
    if (myRole.value !== 'examinee' || state.value?.status !== 'play') return
    clearTimeout(answerTimers.get(i))
    answerTimers.set(i, setTimeout(() => {
      update(dbRef(rtdb(), roomPath('/live/answers')), { [i]: cleanText(text, 80) }).catch(() => {})
    }, 350))
  }
  // ผู้ประเมินจบเคส → เขียนผล + เปลี่ยนสถานะ (อะตอมมิก)
  async function finishRound({ got, tot, checks, answers }) {
    if (myRole.value !== 'examiner' || state.value?.status !== 'play') return false
    const ck = {}
    for (const [k, v] of Object.entries(checks || {})) if (v) ck[k] = true
    try {
      await update(dbRef(rtdb(), roomPath()), {
        result: { round: state.value.round, got, tot, checks: ck, answers: answers || {}, at: serverTimestamp() },
        'state/status': 'done',
      })
      return true
    } catch (e) { error.value = 'ส่งผลไม่สำเร็จ: ' + e.message; return false }
  }
  // หัวห้อง: กลับล็อบบี้ (สลับบทบาทได้ในจังหวะเดียว)
  async function backToLobby({ swap = false } = {}) {
    if (!isHost.value) return
    const patch = { state: null, live: null, result: null }
    if (swap) for (const p of players.value) patch[`players/${p.uid}/role`] = p.role === 'examiner' ? 'examinee' : 'examiner'
    await update(dbRef(rtdb(), roomPath()), patch).catch(e => { error.value = e.message })
  }

  onBeforeUnmount(() => {
    stopRooms()
    off(offRef)
    for (const t of answerTimers.values()) clearTimeout(t)
    if (roomId.value) leaveRoom()
  })

  return {
    uid, now, error, roomList, roomId, room, state, live, result, revealedKeys,
    isHost, players, me, partner, myRole, rolesOk, canStart, partnerLeft,
    listenRooms, stopRooms, createRoom, joinRoom, leaveRoom,
    setRole, swapRoles, kick, startCase, reveal, setAnswer, finishRound, backToLobby,
  }
}
