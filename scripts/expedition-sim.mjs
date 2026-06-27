// Expedition number-pass sim — เทียบรายได้ Expedition กับฐานบ้าน+เพ็ท
// รัน: node scripts/expedition-sim.mjs
import { DURATIONS, MISSIONS, RARITY_WEIGHT } from '../src/data/expeditions.js'
import { partyPower, resolveRewards } from '../src/utils/expedition.js'
import { RESIDENCE_TIERS } from '../src/data/residence.js'
import { petDailyCoins } from '../src/utils/petUtils.js'

const MIS = MISSIONS[0] // ธาตุ fist เป็นตัวแทน

// สายตัวแทน (3 ตัว) ตามคุณภาพ
const parties = {
  'อ่อน (common g0)':       mk('common', 0),
  'ต้น-กลาง (rare g1)':     mk('rare', 1),
  'กลาง (epic g2)':         mk('epic', 2),
  'แกร่ง (legendary g3)':   mk('legendary', 3),
  'สุด (legendary g5)':     mk('legendary', 5),
}
function mk(rarity, grade) {
  return [0, 1, 2].map(() => ({ id: 'x', rarity, element: 'fist', grade }))
}

// รอบ/วัน ตามจริง (โดยประมาณ — ผู้เล่นตื่น ~16 ชม.)
const runsPerDay = { short: 5, medium: 3, long: 2 }

// seed หลายค่าเพื่อหาค่าเฉลี่ยตั๋ว (โอกาส)
function avgReward(party, mis, dur, n = 4000) {
  let coin = 0, ticket = 0
  for (let s = 1; s <= n; s++) {
    const r = resolveRewards(party, mis, dur, s * 2654435761 >>> 0)
    coin = r.find(x => x.type === 'coins')?.amount || 0 // เหรียญ deterministic ต่อ party/dur (ไม่ขึ้น seed)
    if (r.some(x => x.type === 'gachaTicket')) ticket++
  }
  return { coin, ticketRate: ticket / n }
}

console.log('\n=== ฐานรายได้/วัน (อ้างอิง) ===')
console.log('บ้าน Lv1/3/6/9/12:',
  [1, 3, 6, 9, 12].map(l => RESIDENCE_TIERS[l - 1].dailyIncome.toLocaleString()).join(' / '))
console.log('เพ็ท/ตัว/วัน common-g0 / rare-g1 / epic-g2 / legend-g3 / legend-g5:',
  [['common', 0], ['rare', 1], ['epic', 2], ['legendary', 3], ['legendary', 5]]
    .map(([r, g]) => petDailyCoins({ rarity: r, element: 'x', grade: g })).join(' / '))

for (const elMatch of [0, 3]) {
  console.log(`\n=== Expedition — ธาตุตรง ${elMatch}/3 ตัว ===`)
  console.log('สาย\\เวลา'.padEnd(24),
    DURATIONS.map(d => `${d.label}(${d.hours}h)`.padStart(13)).join(''), '   coin/วัน(สูงสุด)  ตั๋ว/วัน')
  for (const [name, baseParty] of Object.entries(parties)) {
    const party = baseParty.map((p, i) => ({ ...p, element: i < elMatch ? MIS.element : 'paper' }))
    const power = partyPower(party).toFixed(1)
    const cells = []
    let bestCoinDay = 0, bestTicketDay = 0
    for (const d of DURATIONS) {
      const { coin, ticketRate } = avgReward(party, MIS, d)
      cells.push(`${coin}`.padStart(13))
      const cd = coin * runsPerDay[d.id], td = ticketRate * runsPerDay[d.id]
      if (cd > bestCoinDay) bestCoinDay = cd
      if (td > bestTicketDay) bestTicketDay = td
    }
    console.log(`${name} (pw${power})`.padEnd(24), cells.join(''),
      `   ${Math.round(bestCoinDay).toLocaleString().padStart(10)}  ${bestTicketDay.toFixed(2).padStart(6)}`)
  }
}
console.log('\nหมายเหตุ: coin/วัน = เหรียญรอบดีสุด × รอบ/วัน (short5/medium3/long2) · ตั๋ว/วัน = โอกาส×รอบ')
