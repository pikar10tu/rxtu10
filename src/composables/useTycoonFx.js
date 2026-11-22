// 🎬 game juice ของเศรษฐีรอบโลก — แปลง events จาก engine เป็นแอนิเมชัน + เสียง ทีละจังหวะ
// view = state ที่จอโชว์อยู่ (ตามหลังของจริงจนเต๋า/เดินเสร็จ ให้ผู้เล่นเห็นเหตุก่อนผล)
import { ref, reactive } from 'vue'
import { sfx } from '../utils/sfx.js'
import { TILES } from '../data/tycoon/board.js'
import { CARDS } from '../data/tycoon/cards.js'

const wait = (ms) => new Promise(r => setTimeout(r, ms))
const money = (n) => Number(n).toLocaleString()
const WIN_TEXT = { rounds: 'ครบรอบ ทรัพย์สินมากที่สุด', bankrupt: 'คู่แข่งล้มละลายหมด', line: 'ครองแถวครบทั้งด้าน', triple: 'ครองครบ 3 กลุ่มสี', tour: 'ครองเมืองท่องเที่ยวครบ 4 แห่ง' }

export function useTycoonFx() {
  const view = ref(null)
  const pawns = reactive([])          // ตำแหน่งที่จอโชว์ ต่อที่นั่ง
  const hopping = ref(-1)
  const dice = ref({ a: 1, b: 1, rolling: false, show: false, controlled: false })
  const floats = ref([])
  const shake = ref(0)
  const pop = ref(null)               // { idx, kind, key }
  const banner = ref(null)            // { emoji, text, sub, key }
  const confetti = ref(false)
  const busy = ref(false)
  let fid = 0, queue = Promise.resolve()

  function reset(state) {
    view.value = state
    pawns.splice(0, pawns.length, ...state.players.map(p => p.pos))
    confetti.value = !!state.winner
  }

  function float(seat, text, kind) {
    const id = ++fid
    floats.value.push({ id, seat, text, kind })
    setTimeout(() => { floats.value = floats.value.filter(f => f.id !== id) }, 1300)
  }
  const showBanner = async (emoji, text, sub, ms = 1100) => {
    banner.value = { emoji, text, sub, key: ++fid }; await wait(ms); banner.value = null
  }
  const popAt = (idx, kind) => { pop.value = { idx, kind, key: ++fid } }
  const quake = (n) => { shake.value = n; setTimeout(() => { shake.value = 0 }, 420) }

  async function run(events, next) {
    busy.value = true
    const name = (s) => next.players[s]?.name || ''
    let applied = false
    const apply = () => { if (!applied) { view.value = next; applied = true } }
    for (const e of events) {
      switch (e.t) {
        case 'dice':
          dice.value = { ...dice.value, rolling: true, show: true, controlled: false }
          sfx('roll'); await wait(620)
          dice.value = { a: e.a, b: e.b, rolling: false, show: true, controlled: e.controlled }
          sfx('tap'); if (e.double) float(e.seat, 'เลขคู่!', 'good')
          await wait(260); break
        case 'move':
          if (e.warp) { pawns[e.seat] = e.path.at(-1); hopping.value = e.seat; sfx('climb'); await wait(300) }
          else for (const i of e.path) { hopping.value = e.seat; pawns[e.seat] = i; sfx('tap'); await wait(i === 0 ? 220 : 135) }
          hopping.value = -1; break
        case 'land': apply(); await wait(120); break
        case 'salary': float(e.seat, '+' + money(e.amount) + ' เงินเดือน', 'good'); sfx('coin'); break
        case 'pay':
          apply()
          if (e.amount > 0) {
            float(e.from, '−' + money(e.amount), 'bad')
            if (e.to != null) setTimeout(() => float(e.to, '+' + money(e.amount), 'good'), 250)
          }
          break
        case 'toll':
          apply()
          if (e.amount >= 300) { quake(2); sfx('boom') } else if (e.amount > 0) { quake(1); sfx('wrong') }
          await wait(e.amount > 0 ? 550 : 200); break
        case 'buy': apply(); popAt(e.idx, 'buy'); sfx('plant'); await wait(450); break
        case 'build': apply(); popAt(e.idx, 'build'); sfx('harvest'); await wait(450); break
        case 'landmark': apply(); popAt(e.idx, 'landmark'); sfx('levelup'); quake(1); await showBanner('🏆', 'สร้างแลนด์มาร์ค!', TILES[e.idx].name); break
        case 'takeover': apply(); popAt(e.idx, 'takeover'); sfx('super'); await showBanner('🤝', name(e.seat) + ' ซื้อต่อ ' + TILES[e.idx].name, '', 900); break
        case 'card': {
          apply()
          const c = CARDS[e.card]
          sfx('skill')
          await showBanner(c.emoji, (e.used ? 'ใช้การ์ด ' : 'ได้การ์ด ') + c.name, e.used ? '' : c.desc, e.used ? 800 : 1500)
          break
        }
        case 'jail': apply(); sfx('ko'); await showBanner('🔒', name(e.seat) + ' เข้าห้องขัง', '', 900); break
        case 'triple': float(e.seat, 'คู่ 3 ครั้ง!', 'bad'); break
        case 'stuck': float(e.seat, 'ยังออกไม่ได้', 'bad'); await wait(400); break
        case 'free': float(e.seat, 'ออกจากห้องขัง!', 'good'); sfx('correct'); break
        case 'again': float(e.seat, 'ทอยอีกครั้ง!', 'good'); break
        case 'festival': apply(); popAt(e.idx, 'festival'); sfx('finish'); await showBanner('🎉', 'เทศกาลที่ ' + TILES[e.idx].name, 'ค่าผ่านทาง ×2', 900); break
        case 'blackout': apply(); popAt(e.idx, 'blackout'); sfx('freeze'); break
        case 'storm': apply(); popAt(e.idx, 'storm'); sfx('boom'); quake(2); break
        case 'pull': apply(); sfx('climb'); await showBanner('🧲', name(e.seat) + ' ดึง ' + name(e.target), '', 900); break
        case 'tax': float(e.seat, 'ภาษี −' + money(e.amount), 'bad'); break
        case 'minigame': float(e.seat, '+' + money(e.amount), 'good'); sfx('coin'); break
        case 'sell': apply(); float(e.seat, 'ขาย +' + money(e.amount), 'warn'); break
        case 'travelReady': float(e.seat, '✈️ ตาหน้าบินได้', 'good'); break
        case 'bankrupt': apply(); sfx('ko'); quake(2); await showBanner('💥', name(e.seat) + ' ล้มละลาย', '', 1300); break
        case 'win':
          apply(); confetti.value = true; sfx('finish')
          await showBanner('👑', name(e.seat) + ' ชนะ!', WIN_TEXT[e.reason], 2200); break
        case 'turn': apply(); await wait(150); break
      }
    }
    apply()
    pawns.splice(0, pawns.length, ...next.players.map(p => p.pos))
    busy.value = false
  }

  /** เล่น events ตามลำดับ (คิวกันทับกัน) · คืน promise ที่จบเมื่อเล่นเสร็จ */
  function play(events, next) {
    queue = queue.then(() => run(events || [], next))
    return queue
  }

  return { view, pawns, hopping, dice, floats, shake, pop, banner, confetti, busy, reset, play }
}
