// ประกอบ bossEngine.mjs = src/utils/battleEngine.js ล่าสุด + โหมดบอส (boss-section.js)
// รันใหม่ทุกครั้งที่เอนจินจริงเปลี่ยน: node build-engine.mjs
import fs from 'fs'
const root = 'file:///D:/RXTU/rxtu10-v2/src/'
let s = fs.readFileSync('D:/RXTU/rxtu10-v2/src/utils/battleEngine.js', 'utf8')
const rep = (a, b) => { if (!s.includes(a)) throw new Error('ไม่เจอ: ' + a.slice(0, 60)); s = s.replace(a, b) }
s = s.replace(/from '\.\.\/([a-z]+)\//g, `from '${root}$1/`).replace(/from '\.\/([A-Za-z]+\.js)'/g, `from '${root}utils/$1'`)
s = `import { bossImmune, STATUSES as _S } from '${root}data/statuses.js'\n_S.doom = { kind: 'debuff', color: '#000', icon: '💀', name: 'โรคร้าย', single: true, turns: 99 }\n` + s
rep('export function simulateBattle(', 'export function simulateBoss(')
rep("slot: i, uid: `${side}${i}`, side }", "slot: i, uid: `${side}${i}`, side, passiveLv: p?.passiveLv }")
rep('    // 🤖 โรบอท: ลดดาเมจจากสายของคนตี', '    if (bossHook) bossHook(att, tg, hitRes)\n    // 🤖 โรบอท: ลดดาเมจจากสายของคนตี')
rep('  let controlBy = null', '  let controlBy = null\n  let bossHook = null\n  let round = 0')
rep("&& !tg.ps?.away) {", "&& !tg.ps?.away && !isImmune(tg, 'control')) {")
rep('  const countAlive = (t) =>', fs.readFileSync(new URL('./boss-section.js', import.meta.url), 'utf8') + '  const countAlive = (t) =>')
rep('let cur = first, round = 0, turns = 0', 'let cur = first, turns = 0')
fs.writeFileSync(new URL('./bossEngine.mjs', import.meta.url), s)
console.log('ok')
