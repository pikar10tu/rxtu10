// ════════════════════════════════════════════════════════════
//  mailbox — pure helpers ระบบจดหมาย (Mailbox track)
//  ไม่ import Firestore: caller เติม serverTimestamp() เอง → เทสได้ตรง
//  mail: { type:'reward'|'gift'|'notice', title, body?, reward?:{coins?},
//          from:'system'|'daily'|'admin'|<uid>, createdAt, read:bool, claimed:bool }
// ════════════════════════════════════════════════════════════

// เหรียญในจดหมาย (>0 เท่านั้น ไม่งั้น 0)
export function rewardCoins(mail) {
  const c = mail?.reward?.coins
  return (typeof c === 'number' && c > 0) ? c : 0
}

// กดรับได้ไหม = มีรางวัล > 0 และยังไม่เคยรับ
export function canClaim(mail) {
  return !!mail && !mail.claimed && rewardCoins(mail) > 0
}

// ต้องสนใจไหม = ยังไม่อ่าน หรือ ยังกดรับได้ (ใช้คิด badge)
export function needsAttention(mail) {
  return !!mail && (!mail.read || canClaim(mail))
}

// นับจำนวน mail ที่ต้องสนใจ (badge)
export function attentionCount(mails) {
  return (mails || []).filter(needsAttention).length
}

function truncate(s, n) {
  const str = String(s ?? '')
  return str.length > n ? str.slice(0, n) + '…' : str
}

// สร้าง payload จดหมายรางวัล "แจ้งข้อสอบผิด" — title ไม่ใส่ emoji (mail title render
// เป็น text ฝัง <Emoji> ไม่ได้ → ใส่ emoji จะ tofu; ไอคอนให้การ์ด render จาก type แทน)
// caller เติม createdAt = serverTimestamp()
export function buildReportRewardMail(report, coins, createdAt) {
  const q = report?.questionSnapshot?.question
  return {
    type: 'reward',
    title: 'รางวัลแจ้งข้อสอบผิด',
    body: q
      ? `ขอบคุณที่ช่วยแจ้งข้อสอบ "${truncate(q, 60)}" — ทีมวิชาการตรวจแล้วว่าถูกต้อง`
      : 'ขอบคุณที่ช่วยแจ้งข้อสอบผิด ทีมวิชาการตรวจแล้วว่าถูกต้อง',
    reward: { coins },
    from: 'system',
    createdAt,
    read: false,
    claimed: false,
  }
}
