// 🏅 ชุดภารกิจ (27 พ.ย. 2026) — ตรรกะล้วน · เทส: node --test src/utils/dollQuests.test.js
// ไม่ต้องเขียน owned: ทำเงื่อนไขครบ = "มี" ชิ้นในเซ็ตทันที (dollOf รวมให้) → ไม่ต้องแก้ rules · ลดยอดไม่ได้เพราะตัวนับขึ้นอย่างเดียว
// ตัวนับ: ที่มีอยู่แล้ว (นับย้อนหลังได้) = towerBest · pvpFightsTotal · farm.harvests · study.gs.*.c
//         ใหม่ users/{uid}.quest = { zlib, zcafe, zforest (วินาที), ringWin, spyGames, dDay, dStreak, dBest }
import { LIMITED_PARTS, QUESTS } from '../data/dollLimited.js'

const num = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0)
const sumVals = (o, pick = (v) => v) => (o && typeof o === 'object' ? Object.values(o).reduce((s, v) => s + num(pick(v)), 0) : 0)

/** วันติดกันยาวสุดจาก dc.days (วันที่เล่นข้อสอบประจำวัน 14 วันล่าสุด 'YYYY-MM-DD') — นับย้อนหลังได้ */
export function longestRun(days) {
  const ms = [...new Set(Array.isArray(days) ? days : [])].map(d => Date.parse(d + 'T00:00:00Z')).filter(Number.isFinite).sort((a, b) => a - b)
  let best = 0, run = 0
  ms.forEach((m, i) => { run = i && m - ms[i - 1] === 86400000 ? run + 1 : 1; best = Math.max(best, run) })
  return best
}

/** ยอดปัจจุบันของแต่ละตัวนับ (key ตรงกับ QUESTS[*].k) */
export function questStats(u) {
  const q = u?.quest || {}
  return {
    zlib: num(q.zlib), zcafe: num(q.zcafe), zforest: num(q.zforest),
    ringWin: num(q.ringWin), spyGames: num(q.spyGames),
    arenaFights: num(u?.pvpFightsTotal),
    towerFloor: num(u?.towerBest),
    dailyStreak: Math.max(num(q.dBest), num(q.dStreak), longestRun(u?.dc?.days)),
    quizCorrect: sumVals(u?.study?.gs, (g) => g?.c),
    harvests: sumVals(u?.farm?.harvests),
  }
}

/** { [questId]: { have, need, done, label } } */
export function questProgress(u) {
  const st = questStats(u)
  return Object.fromEntries(Object.entries(QUESTS).map(([id, q]) => {
    const have = Math.min(st[q.k] || 0, q.n)
    return [id, { have, need: q.n, done: have >= q.n, label: q.label, unit: q.unit }]
  }))
}

/** id ชิ้นทั้งหมดที่ปลดล็อคแล้วจากภารกิจ */
export function questUnlocked(u) {
  const pr = questProgress(u)
  return LIMITED_PARTS.filter(p => p.quest && pr[p.quest]?.done).map(p => p.id)
}

/** ข้อความความคืบหน้าแบบคนอ่าน */
export function progressText({ have, need, unit }) {
  if (unit === 'sec') {
    const f = (s) => { const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60); return h ? `${h}:${String(m).padStart(2, '0')} ชม.` : `${m} นาที` }
    return `${f(have)} / ${f(need)}`
  }
  return `${have.toLocaleString()} / ${need.toLocaleString()}`
}

/** สตรีคข้อสอบประจำวัน: เล่นวันนี้ (dayKey) ต่อจากเมื่อวาน = +1 · วันเดิม = เท่าเดิม · ขาดวัน = เริ่ม 1 */
export function nextDailyStreak(q, today, yesterday) {
  const cur = num(q?.dStreak)
  const streak = q?.dDay === today ? Math.max(1, cur) : q?.dDay === yesterday ? cur + 1 : 1
  return { dDay: today, dStreak: streak, dBest: Math.max(num(q?.dBest), streak) }
}
