/**
 * ประวัติบุก/ตั้งรับของสนามประลอง — ตรรกะล้วน ไม่แตะ Firestore/Vue
 *
 * ที่ต้องอ้อมแบบนี้: rules ห้ามเขียน doc ของคนอื่น ⇒ A บุก B แล้วเขียนลง doc ของ B ไม่ได้
 * ⇒ ผู้บุกจดผลลงแถว roster ของตัวเอง · ฝ่ายรับสแกนทุกแถวหาคนที่บุกตัวเอง
 *
 * รูปรายการ: { u: uidเป้าหมาย, w: 1ชนะ/0แพ้, c: เหรียญที่ได้, t: Date.now(), f?: 1 = ท้าสู้กระชับมิตร }
 *   (f ใส่เฉพาะไฟต์กระชับมิตร — ไม่มีเหรียญ ไม่แตะแต้มประลอง · ใช้ทางเดียวกันเพื่อให้คนถูกท้าเห็นโดยไม่ต้องแก้ rules)
 * คีย์สั้นเพราะอยู่ในแถว roster ที่ทุกคนทั้งชั้นปีโหลดทุกเซสชัน
 *
 * spec: docs/superpowers/specs/2026-08-27-pvp-history-design.md
 * เทส: node --test src/utils/pvpHistory.test.js
 */

/** เก็บกี่รายการต่อคน — ⚠️ เพิ่มแล้วต้องคำนวณขนาด doc ใหม่ (8×~50B×105คน ≈ 42KB จากลิมิต 1MB)
 *  5 → 8 ตอนเพิ่มท้าสู้กระชับมิตรเข้ามาใช้ช่องเดียวกัน (25 ก.ย. 2026) */
export const HISTORY_MAX = 8

/** ต่อรายการใหม่ไว้หน้าสุด แล้วตัดท้ายให้เหลือ HISTORY_MAX */
export function pushHistory(list, entry) {
  const prev = Array.isArray(list) ? list : []
  if (!entry || !entry.u) return prev        // entry เสีย = ไม่แตะของเดิม
  return [entry, ...prev].slice(0, HISTORY_MAX)
}

/** ประวัติที่ "เราไปบุก" — อ่านตรงจากแถวเรา แล้วเติมชื่อเป้าหมายจากแถวของเขา */
export function myAttacks(rows, uid) {
  const h = Array.isArray(rows?.[uid]?.h) ? rows[uid].h : []
  return h.map(e => ({
    uid:  e?.u || null,
    name: rows?.[e?.u]?.n || '?',            // เป้าหมายออกจากรุ่นไปแล้ว = '?'
    won:  !!e?.w,
    coin: e?.f ? 0 : (Number(e?.c) || 0),
    t:    Number(e?.t) || 0,
    friendly: !!e?.f,
  }))
}

/**
 * ประวัติที่ "มีคนมาบุกเรา" — สแกนทุกแถว (105 แถว × 5 รายการ ≈ 525 รอบ ทำใน computed ได้สบาย)
 * ⚠️ ผลต้องกลับด้าน: w:1 ของผู้บุก = ฝั่งเราแพ้
 * ⚠️ ห้ามคืนเหรียญของผู้บุกออกไป — ฝั่งตั้งรับไม่ได้อะไรจากการถูกบุก
 */
export function defenseLog(rows, uid, max = 10) {
  const out = []
  for (const [attacker, row] of Object.entries(rows || {})) {
    if (attacker === uid) continue
    const h = Array.isArray(row?.h) ? row.h : []
    for (const e of h) {
      if (e?.u !== uid) continue
      out.push({ uid: attacker, name: row?.n || '?', won: !e?.w, t: Number(e?.t) || 0, friendly: !!e?.f })
    }
  }
  return out.sort((a, b) => b.t - a.t).slice(0, max)
}

/** ท้าสู้คนเดิมถี่ๆ (กดรัว) ไม่ต้องจดทุกไฟต์ — กินช่องประวัติ 8 ช่องหมด + เขียน roster รัว
 *  จดซ้ำได้เมื่อรายการล่าสุดไม่ใช่ไฟต์กระชับมิตรกับคนนี้ภายใน gapMs */
export function shouldLogFriendly(list, targetUid, now = Date.now(), gapMs = 10 * 60_000) {
  const last = Array.isArray(list) ? list.find(e => e?.f && e?.u === targetUid) : null
  return !last || now - (Number(last.t) || 0) >= gapMs
}

/**
 * เวลาแบบคร่าวๆ — t มาจาก Date.now() ของ "เครื่องผู้บุก" (serverTimestamp ใส่ใน array ไม่ได้)
 * ⇒ นาฬิกาเครื่องเพี้ยนได้ จึง clamp ไม่ให้ติดลบ และไม่โชว์วินาที
 */
export function agoLabel(t, now = Date.now()) {
  if (!t) return ''
  const d = Math.max(0, now - t)
  if (d < 60_000) return 'เมื่อกี้'
  if (d < 3_600_000) return `${Math.floor(d / 60_000)} นาทีที่แล้ว`
  if (d < 86_400_000) return `${Math.floor(d / 3_600_000)} ชม.ที่แล้ว`
  return `${Math.floor(d / 86_400_000)} วันก่อน`
}
