// loseTip — pure: แพ้แล้วชี้ทางไปต่อ 1 ทาง (ใช้ทั้งหอคอยและสนามประลอง)
// spec: docs/superpowers/specs/2026-08-31-pvp-daily-quest-design.md
// เทส: node --test src/utils/loseTip.test.js
import { PULL_COST } from './gacha.js'
import { canUpgrade } from './petGrade.js'

const TEXT = {
  tower: 'ทีมยังสู้ชั้นนี้ไม่ไหว — ลองเสริมทีมก่อนไต่ต่อ',
  arena: 'อยากชนะบ้าง? ลองเสริมทีมก่อนบุกรอบหน้า',
}

/**
 * ปุ่มตามสถานะจริงของคนนั้น — คนที่เหรียญไม่พอไม่ควรถูกส่งไปหน้าที่กดอะไรไม่ได้
 * ปุ่มอัพขั้นเพ็ทมีเสมอ (user ขอ 1 ต.ค. 2026 — เดิมโชว์แค่ตอนสุ่มไม่ได้) · ถ้ามีตัวพร้อมอัพจริงบอกจำนวน + ขึ้นก่อน
 * @param {'tower'|'arena'} mode
 * @param {{coins?:number, freeGachaTickets?:number, pets?:object[]}} userData
 * @returns {{text:string, actions:{label:string,to:string}[]}|null}
 */
export function buildLoseTip(mode, userData) {
  const text = TEXT[mode]
  if (!text) return null
  const coins = userData?.coins || 0
  const canPull = (userData?.freeGachaTickets || 0) > 0 || coins >= PULL_COST
  const ready = (userData?.pets || []).filter(p => canUpgrade(p, coins)).length
  const up = { label: ready ? `⬆️ อัพขั้นเพ็ท (${ready} ตัวพร้อม)` : '⬆️ อัพขั้นเพ็ท', to: '/play/pets' }
  const pull = { label: '🎰 อัญเชิญเพ็ท', to: '/shop' }
  const actions = ready ? [up, ...(canPull ? [pull] : [])] : [...(canPull ? [pull] : []), up]
  return { text, actions }
}
