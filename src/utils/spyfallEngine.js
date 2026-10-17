// ════════════════════════════════════════════════════════════
//  spyfallEngine — ตรรกะล้วน (ไม่แตะ Firebase) ใช้โดย composables/useSpyfall.js
//  หัวห้อง = คนแจกไพ่: สุ่มคำ/สปาย/บท แล้วเขียน
//    secrets/{room}/{uid}  บทของแต่ละคน (อ่านได้เฉพาะเจ้าของ)
//    dealer/{room}         { spyUid, word, roles } (อ่านได้เฉพาะหัวห้อง — ไว้ตัดสินตอนจบ)
// ════════════════════════════════════════════════════════════
import { LOCATIONS, DRUGS, DRUG_ROLES, DRUG_OPTIONS } from '../data/spyfall.js'

export const MIN_PLAYERS = 3
export const MAX_PLAYERS = 8
export const MINUTES = [5, 6, 7, 8]

function shuffle(a, rnd) {
  a = [...a]
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1));[a[i], a[j]] = [a[j], a[i]] }
  return a
}

// roster = [uid...] · คืน { options, starterUid, spyUid, word, secrets: {uid: {spy} | {word, role}} }
export function deal(roster, mode, rnd = Math.random) {
  let options, word, rolePool
  if (mode === 'drug') {
    const all = Object.keys(DRUGS)
    word = all[Math.floor(rnd() * all.length)]
    const rest = shuffle(all.filter(d => d !== word), rnd).slice(0, DRUG_OPTIONS - 1)
    options = [...rest, word].sort((a, b) => a.localeCompare(b))
    rolePool = DRUG_ROLES
  } else {
    options = Object.keys(LOCATIONS)
    word = options[Math.floor(rnd() * options.length)]
    rolePool = LOCATIONS[word]
  }
  const spyUid = roster[Math.floor(rnd() * roster.length)]
  const roles = shuffle(rolePool, rnd)
  const secrets = {}
  let i = 0
  for (const uid of roster) secrets[uid] = uid === spyUid ? { spy: true } : { word, role: roles[i++ % roles.length] }
  const starterUid = roster[Math.floor(rnd() * roster.length)]
  return { options, starterUid, spyUid, word, secrets }
}

// votes = {voterUid: targetUid} · voters = คนที่ยังอยู่ในรอบ
// ต้องได้เกินครึ่งของคนที่โหวตได้ ถึงจะ "จับ" ได้
export function tally(votes, voters, spyUid) {
  const count = {}
  for (const v of voters) { const t = votes[v]; if (t) count[t] = (count[t] || 0) + 1 }
  const top = Object.entries(count).sort((a, b) => b[1] - a[1])
  const [target, n] = top[0] || [null, 0]
  const tie = top.length > 1 && top[1][1] === n
  if (!target || tie || n * 2 <= voters.length) return { winner: 'spy', reason: 'split', target: null, n, count }
  return target === spyUid
    ? { winner: 'civ', reason: 'caught', target, n, count }
    : { winner: 'spy', reason: 'wrong', target, n, count }
}

export function judgeGuess(guess, word) {
  return guess === word ? { winner: 'spy', reason: 'guessed', guess } : { winner: 'civ', reason: 'badguess', guess }
}

export const allVoted = (votes, voters) => voters.length > 0 && voters.every(v => !!votes[v])
