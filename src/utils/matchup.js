// src/utils/matchup.js
// ป้าย "ชนะทาง / แพ้ทาง" ในหน้าจัดทีม (user เคาะคำ 17 ต.ค. 2026 แทน ข่ม/โดนข่ม)
// นับจากสาย (✊>✌️>✋>✊) เทียบกับศัตรูที่รู้ตัวแล้วเท่านั้น — บอกข้อเท็จจริงรายตัว ไม่ตัดสินว่าทีมไหนดีสุด
import { elementBeats } from '../data/index.js'

/** @param {string} el สายของเพ็ทเรา · @param {Array<{element:string}>} enemies
 *  @returns {{win:number, lose:number}} จำนวนศัตรูที่เราชนะทาง / แพ้ทาง */
export function matchupOf(el, enemies) {
  let win = 0, lose = 0
  for (const e of enemies || []) {
    if (!e?.element || !el) continue
    if (elementBeats(el, e.element)) win++
    else if (elementBeats(e.element, el)) lose++
  }
  return { win, lose }
}
