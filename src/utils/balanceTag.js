// balanceTag — ป้ายบาลานซ์บนการ์ดเพ็ท (⬆️ บัฟ / ↘️ เนิร์ฟ / 🔄 รีเวิร์ค)
// ข้อมูลอยู่ที่ data/petPassives.js (BALANCE_PATCH) ที่นี่มีแค่ตรรกะ pure ล้วน (แสดงกี่วัน/หายเมื่อไหร่)
//
// ⚠️ ไอคอนเนิร์ฟ "ควรจะ" เป็น ⬇️ (2b07) แต่ public/emoji/fluent/ ไม่มีไฟล์ 2b07.webp (มีแค่ 2b06/1f504)
//    ใช้ ↘️ (2198, มีไฟล์จริง) แทนไปก่อน — ถ้าจะได้ลูกศรลงตรงๆ ต้องรัน scripts/fetch-fluent.mjs
//    เพิ่ม 2b07 (ห้ามรันเองตามกฎ CLAUDE.md ข้อ 17 — ต้องให้ user สั่ง)
//
// เทส: node --test src/utils/balanceTag.test.js

import { BALANCE_PATCH } from '../data/petPassives.js'

const MS_PER_DAY = 24 * 60 * 60 * 1000
const BKK_OFFSET_MS = 7 * 60 * 60 * 1000 // UTC+7

const KIND_META = {
  buff:   { icon: '⬆️', label: 'บัฟ' },
  nerf:   { icon: '↘️', label: 'เนิร์ฟ' },   // ↘️ แทน ⬇️ (ดูคอมเมนต์บนสุด)
  rework: { icon: '🔄', label: 'รีเวิร์ค' },
}

/** 'YYYY-MM-DD' (ตีความเป็นเวลาไทย) → epoch ms ของเที่ยงคืนวันนั้นตามเวลาไทย */
function bangkokMidnightMs(dateStr) {
  const [y, m, d] = String(dateStr).split('-').map(Number)
  return Date.UTC(y, (m || 1) - 1, d || 1) - BKK_OFFSET_MS
}

/**
 * ป้ายบาลานซ์ของเพ็ท ณ เวลา `now` — คืน null ถ้าไม่มีป้าย หรือพ้นช่วงแสดงผลแล้ว
 * @param {string} petId
 * @param {number} [now] epoch ms (default = Date.now())
 * @param {{date:string, days:number, tags:Record<string,string>}} [patch] (default = BALANCE_PATCH)
 * @returns {{kind:string, icon:string, label:string} | null}
 */
export function balanceTagOf(petId, now = Date.now(), patch = BALANCE_PATCH) {
  if (!patch || !petId) return null
  const kind = patch.tags?.[petId]
  if (!kind || !KIND_META[kind]) return null
  const start = bangkokMidnightMs(patch.date)
  const end = start + (patch.days || 0) * MS_PER_DAY
  if (now < start || now >= end) return null
  return { kind, icon: KIND_META[kind].icon, label: KIND_META[kind].label }
}
