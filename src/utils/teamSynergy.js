// src/utils/teamSynergy.js
// ป้ายคอมโบสดใต้ช่องในหน้าจัดทีม — บอกว่า "พาสสีฟที่มีเงื่อนไข" ของแต่ละตัวทำงานอยู่ไหม
// จุดประสงค์ (user พูดเอง): ช่วยผู้เล่นที่ยังไม่ชำนาญเห็นว่ากดถูกทีมหรือยัง โดย "ไม่บอกว่าทีมไหนดีที่สุด"
// pure · เลขทั้งหมดมาจาก passiveValueAt(part, 1) เท่านั้น — ห้ามพิมพ์เลขตรง
//
// 🔑 leading null: ระหว่างแก้ทีมในหน้านี้ edit.slots คงช่องว่างไว้ (ผู้เล่นยังไม่ได้ลากตัวมาเติม)
//    แต่ตอนบันทึกจริง (compact()) ช่องว่างถูกตัดออก แล้วเอนจินอ่านทีมที่ compact แล้วเสมอ
//    (battleEngine เช็ค A[0]?.id === 'hamster' บนทีม compact) ⇒ ที่นี่ตัดสิน "ช่อง 1 จริง" จาก
//    ตำแหน่งใน `filled` (=หลัง compact) ไม่ใช่ index ดิบใน slotIds — สะท้อนพฤติกรรมจริงของเอนจิน
//    ไม่ใช่เลขช่องที่ตาเห็นตรงๆ ถ้ามีช่องว่างค้างอยู่ก่อนหน้า (แจ้งเคสนี้ในรีพอร์ต)

import { getPetDef, ELEMENTS } from '../data/index.js'
import { PET_PASSIVES, partWithEffect, passiveValueAt } from '../data/petPassives.js'
import { seasonOfSlot, seasonText, degreeFormActive, effectiveRarity } from './petForms.js'

const ELEMENT_TH = { fist: 'กำปั้น', scissors: 'กรรไกร', paper: 'กระดาษ' }
const ELEMENT_ORDER = ['fist', 'paper', 'scissors']
const elEmojiOfElement = (el) => ELEMENTS[el]?.emoji || '✊'

/** @param {(string|null)[]} slotIds
 *  @returns {Array<{key:string, icon:string, ok:boolean, text:string}>} */
export function teamSynergy(slotIds) {
  const ids = slotIds || []
  const filled = ids.filter(Boolean)
  if (!filled.length) return []

  const team = filled.map(id => ({ id, rarity: getPetDef(id)?.rarity || 'common' }))
  const out = []

  ids.forEach((id) => {
    if (!id) return
    const passive = PET_PASSIVES[id]
    if (!passive) return

    // 🦁 สิงโต — ทีมครบ 3 สาย (fist/paper/scissors)
    const trinityPart = partWithEffect(passive, 'elementTrinity')
    if (trinityPart) {
      const v = passiveValueAt(trinityPart, 1)
      const els = new Set(filled.map(pid => getPetDef(pid)?.element))
      const missing = ELEMENT_ORDER.filter(el => !els.has(el))
      out.push(missing.length
        ? { key: id, icon: passive.icon, ok: false,
            text: `ยังขาดสาย ${missing.map(el => `${elEmojiOfElement(el)} ${ELEMENT_TH[el]}`).join(' ')}` }
        : { key: id, icon: passive.icon, ok: true,
            text: `ครบ 3 สาย ทั้งทีมแรง +${v.pct}% เลือด +${v.hpPct}%` })
    }

    // ☀️ ซอล — บัฟเพื่อนตามระดับ (ตำนานไม่ได้)
    const rarityPart = partWithEffect(passive, 'rarityBoost')
    if (rarityPart) {
      const v = passiveValueAt(rarityPart, 1)
      const count = filled.filter(pid => pid !== id).filter(pid => {
        const rk = effectiveRarity({ id: pid, rarity: getPetDef(pid)?.rarity || 'common' }, team)
        return (v[rk] || 0) > 0
      }).length
      out.push(count > 0
        ? { key: id, icon: passive.icon, ok: true, text: `บัฟเพื่อน ${count} ตัว` }
        : { key: id, icon: passive.icon, ok: false, text: 'เพื่อนเป็นตำนานหมด ไม่ได้บัฟ' })
    }

    // 🌍 เอิร์ธ — ฤดูตามช่อง (ตำแหน่งจริงหลัง compact) เว้นแต่กลายร่างองศา
    const seasonPart = partWithEffect(passive, 'season')
    if (seasonPart) {
      if (degreeFormActive(team)) {
        out.push({ key: id, icon: passive.icon, ok: false,
          text: `${passive.icon} กลายเป็นองศา นับเป็นธรรมดา — ไม่ได้ฤดูกาลรอบนี้` })
      } else {
        const v = passiveValueAt(seasonPart, 1)
        const pos = filled.indexOf(id)
        const s = seasonOfSlot(pos)
        out.push({ key: id, icon: passive.icon, ok: true, text: `${s.icon} ${seasonText(s.key, v)}` })
      }
    }

    // 🐹 แฮมสเตอร์ — ช่อง 1 (หลัง compact) ทีมได้ตีก่อน
    if (id === 'hamster') {
      const pos = filled.indexOf(id)
      out.push(pos === 0
        ? { key: id, icon: passive.icon, ok: true, text: 'ช่อง 1: ทีมได้ตีก่อน' }
        : { key: id, icon: passive.icon, ok: false, text: 'ย้ายไปช่อง 1 ทีมจะได้ตีก่อน' })
    }
  })

  // 🚫 ดูโอ้ไม่ขึ้นป้ายที่นี่โดยตั้งใจ (user 27 ก.ย.): เป็นกิมมิคให้ค้นเจอเองจากชื่อสกิลที่เปลี่ยน

  return out
}
